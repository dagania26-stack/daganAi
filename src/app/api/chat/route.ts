import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryRAG } from "@/lib/rag-client";
import { generateResponse, buildContext } from "@/lib/llm";
import type { ChatRequest, ChatResponse, RAGSource } from "@/types";

const MAX_QUESTION_LENGTH = 500;

// Bloque les tentatives d'injection de scripts/HTML dans la question
const INJECTION_RE = /<\s*script|javascript\s*:|on\w+\s*=|<\s*iframe|<\s*object/i;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  // ── Validation ────────────────────────────────────────────────────────────
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { question, conversationId } = body;

  if (!question?.trim()) {
    return NextResponse.json({ error: "La question ne peut pas être vide." }, { status: 400 });
  }
  if (question.trim().length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: `La question dépasse ${MAX_QUESTION_LENGTH} caractères.` },
      { status: 400 },
    );
  }
  if (INJECTION_RE.test(question)) {
    return NextResponse.json({ error: "Question invalide." }, { status: 400 });
  }

  try {
    let reponse: string;
    let sources: RAGSource[] = [];
    let ragLatence = 0;

    // ── Essai 1 : pipeline Python RAG (embed → retrieve → LLM) ───────────────
    try {
      const ragData = await queryRAG(question.trim(), conversationId);
      reponse   = ragData.reponse;
      sources   = ragData.sources;
      ragLatence = ragData.latence_ms;
      console.info("[/api/chat] mode=rag sources=%d", sources.length);
    } catch (ragErr) {
      // ── Fallback : Claude direct sans contexte documentaire ──────────────────
      console.warn(
        "[/api/chat] RAG indisponible (%s) — bascule sur Claude direct",
        ragErr instanceof Error ? ragErr.message : String(ragErr),
      );
      const { reponse: r } = await generateResponse(
        question.trim(),
        buildContext([]),   // contexte vide — Claude répond depuis ses connaissances
      );
      reponse = r;
      console.info("[/api/chat] mode=claude-direct");
    }

    const latenceMs = Date.now() - start + ragLatence;

    // ── Persistance ───────────────────────────────────────────────────────────
    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.conversation.create({
        data: {
          langue:    "fr",
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      });
      convId = conv.id;
    }

    const scoreRAG = sources.length > 0
      ? sources.reduce((s, src) => s + src.score, 0) / sources.length
      : null;

    const message = await prisma.message.create({
      data: {
        question:       question.trim(),
        reponse,
        scoreRAG,
        latenceMs,
        conversationId: convId,
      },
    });

    const payload: ChatResponse = {
      reponse,
      sources,
      conversationId: convId,
      messageId:      message.id,
      latenceMs,
    };

    return NextResponse.json(payload);

  } catch (err) {
    console.error("[/api/chat]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessaie dans quelques secondes." },
      { status: 500 },
    );
  }
}
