import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { queryRAG } from "@/lib/rag-client"
import { generateResponse, buildContext } from "@/lib/llm"
import type { ChatRequest, ChatResponse, RAGSource, HistoryTurn } from "@/types"

export const maxDuration = 60

const MAX_QUESTION_LENGTH = 500
const MAX_HISTORY_MESSAGES = 6
const TITRE_MAX_LENGTH = 80
const INJECTION_RE = /<\s*script|javascript\s*:|on\w+\s*=|<\s*iframe|<\s*object/i

function buildTitre(question: string): string {
  const trimmed = question.trim()
  return trimmed.length > TITRE_MAX_LENGTH
    ? trimmed.slice(0, TITRE_MAX_LENGTH).trimEnd() + "…"
    : trimmed
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const start  = Date.now()
  const ip     = getIp(req)
  const session = await auth()
  const userId  = session?.user?.id ?? null

  // ── Validation ────────────────────────────────────────────────────────────
  let body: ChatRequest
  try {
    body = (await req.json()) as ChatRequest
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const { question, conversationId } = body

  if (!question?.trim()) {
    return NextResponse.json({ error: "La question ne peut pas être vide." }, { status: 400 })
  }
  if (question.trim().length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: `La question dépasse ${MAX_QUESTION_LENGTH} caractères.` },
      { status: 400 },
    )
  }

  // Tentative d'injection → log sécurité
  if (INJECTION_RE.test(question)) {
    prisma.securityLog.create({
      data: { type: "SUSPICIOUS", ip, userId, details: `Injection détectée : ${question.slice(0, 200)}` },
    }).catch(() => {})
    return NextResponse.json({ error: "Question invalide." }, { status: 400 })
  }

  try {
    let reponse: string
    let sources: RAGSource[] = []
    let ragLatence  = 0
    let mode        = "rag"
    let erreur: string | null = null

    // ── Récupération de l'historique pour garder le contexte ─────────────────
    let history: HistoryTurn[] = []
    if (conversationId) {
      try {
        const previous = await prisma.message.findMany({
          where:   { conversationId },
          orderBy: { createdAt: "desc" },
          take:    MAX_HISTORY_MESSAGES,
          select:  { question: true, reponse: true },
        })
        history = previous
          .reverse()
          .flatMap((m) => [
            { role: "user" as const, content: m.question },
            { role: "assistant" as const, content: m.reponse },
          ])
      } catch (histErr) {
        console.warn("[/api/chat] Récupération historique ignorée :", histErr instanceof Error ? histErr.message : histErr)
      }
    }

    // ── Pipeline RAG ─────────────────────────────────────────────────────────
    try {
      const ragData = await queryRAG(question.trim(), conversationId, undefined, history)
      reponse   = ragData.reponse
      sources   = ragData.sources
      ragLatence = ragData.latence_ms
      console.info("[/api/chat] mode=rag sources=%d", sources.length)
    } catch (ragErr) {
      // ── Fallback Claude direct ────────────────────────────────────────────
      mode = "claude-direct"
      console.warn("[/api/chat] RAG indisponible — bascule Claude direct")
      const { reponse: r } = await generateResponse(question.trim(), buildContext([]), undefined, history)
      reponse = r
    }

    const latenceMs = Date.now() - start + ragLatence

    // ── Persistance conversation ──────────────────────────────────────────────
    let convId    = conversationId ?? "local-" + Date.now()
    let messageId = "local-" + Date.now()

    try {
      if (!conversationId) {
        const conv = await prisma.conversation.create({
          data: {
            langue:    "fr",
            userAgent: req.headers.get("user-agent") ?? undefined,
            userId:    userId ?? undefined,
            titre:     buildTitre(question),
          },
        })
        convId = conv.id
      }

      const scoreRAG = sources.length > 0
        ? sources.reduce((s, src) => s + src.score, 0) / sources.length
        : null

      const message = await prisma.message.create({
        data: { question: question.trim(), reponse, scoreRAG, latenceMs, conversationId: convId },
      })
      messageId = message.id
    } catch (dbErr) {
      console.warn("[/api/chat] Persistance conversation ignorée :", dbErr instanceof Error ? dbErr.message : dbErr)
    }

    // ── Log ChatLog ───────────────────────────────────────────────────────────
    prisma.chatLog.create({
      data: { userId, question: question.trim(), mode, success: true, latenceMs, ip, erreur },
    }).catch(() => {})

    // Mise à jour lastLogin + lastIp si connecté
    if (userId) {
      prisma.user.update({
        where: { id: userId },
        data:  { lastLogin: new Date(), lastIp: ip },
      }).catch(() => {})
    }

    const payload: ChatResponse = { reponse, sources, conversationId: convId, messageId, latenceMs }
    return NextResponse.json(payload)

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error("[/api/chat]", errMsg)

    // Log échec
    prisma.chatLog.create({
      data: { userId, question: question.trim(), mode: "error", success: false, ip, erreur: errMsg },
    }).catch(() => {})

    return NextResponse.json(
      { error: "Une erreur est survenue. Réessaie dans quelques secondes." },
      { status: 500 },
    )
  }
}
