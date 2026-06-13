import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL ?? "http://localhost:8000"
const INGEST_SECRET   = process.env.INGEST_SECRET   ?? ""

export const maxDuration = 60

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return null
  return session
}

// ── GET /api/admin/documents ──────────────────────────────────────────────────
export async function GET() {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const docs = await prisma.document.findMany({
    select: {
      id: true, titre: true, domaine: true, sousDomaine: true,
      source: true, version: true, actif: true, createdAt: true,
      _count: { select: { chunks: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ documents: docs })
}

// ── POST /api/admin/documents ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  if (!INGEST_SECRET)
    return NextResponse.json({ error: "INGEST_SECRET non configuré sur Vercel" }, { status: 500 })

  const form    = await req.formData()
  const domaine = (form.get("domaine") as string ?? "").toUpperCase().trim()
  const titre   = (form.get("titre")   as string ?? "").trim()
  const source  = (form.get("source")  as string ?? "").trim()
  const version = (form.get("version") as string ?? "1.0").trim()
  const urlVal  = (form.get("url")     as string ?? "").trim()
  const file    = form.get("file") as File | null

  if (!["OHADA", "OTR", "FINANCEMENT"].includes(domaine))
    return NextResponse.json({ error: "Domaine invalide (OHADA | OTR | FINANCEMENT)" }, { status: 400 })
  if (!titre)  return NextResponse.json({ error: "Le titre est requis"  }, { status: 400 })
  if (!source) return NextResponse.json({ error: "La source est requise" }, { status: 400 })

  let fileBlob: Blob
  let filename: string

  if (file && file.size > 0) {
    fileBlob = file
    filename = file.name
  } else if (urlVal) {
    let urlRes: Response
    try {
      urlRes = await fetch(urlVal, { headers: { "User-Agent": "DaganIA-Bot/1.0" } })
    } catch {
      return NextResponse.json({ error: "Impossible de récupérer l'URL" }, { status: 400 })
    }
    const ct = urlRes.headers.get("content-type") ?? ""
    if (ct.includes("pdf") || urlVal.toLowerCase().endsWith(".pdf")) {
      fileBlob = await urlRes.blob()
      filename = urlVal.split("/").pop()?.split("?")[0] ?? "document.pdf"
      if (!filename.toLowerCase().endsWith(".pdf")) filename += ".pdf"
    } else {
      const html = await urlRes.text()
      const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                       .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                       .replace(/<[^>]+>/g, " ")
                       .replace(/\s+/g, " ")
                       .trim()
      fileBlob = new Blob([text], { type: "text/plain" })
      filename = "document.txt"
    }
  } else {
    return NextResponse.json({ error: "Fichier ou URL requis" }, { status: 400 })
  }

  if (!RAG_SERVICE_URL || RAG_SERVICE_URL === "http://localhost:8000")
    return NextResponse.json({ error: "RAG_SERVICE_URL non configuré dans les variables Vercel" }, { status: 500 })

  const ragForm = new FormData()
  ragForm.append("file", fileBlob, filename)
  ragForm.append("domaine", domaine)
  ragForm.append("titre", titre)
  ragForm.append("source", source)
  ragForm.append("version", version)

  let ragRes: Response
  try {
    ragRes = await fetch(`${RAG_SERVICE_URL}/api/ingest`, {
      method:  "POST",
      headers: { "x-api-key": INGEST_SECRET },
      body:    ragForm,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[/api/admin/documents] Impossible de joindre le RAG:", msg)
    return NextResponse.json(
      { error: `Service RAG injoignable. Vérifiez que RAG_SERVICE_URL est correct dans Vercel (valeur actuelle : ${RAG_SERVICE_URL})` },
      { status: 502 },
    )
  }

  if (!ragRes.ok) {
    const detail = await ragRes.text().catch(() => "")
    console.error("[/api/admin/documents] RAG ingest error:", ragRes.status, detail)
    return NextResponse.json(
      { error: `Le service RAG a retourné une erreur ${ragRes.status}. Vérifiez les logs Render.` },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
