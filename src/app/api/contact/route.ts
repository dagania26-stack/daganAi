import { NextRequest, NextResponse } from "next/server"
import { sendContactEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"

const MAX_MESSAGE_LENGTH = 1000

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getIp(req)
  if (!rateLimit(`contact:${ip}`, 3, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop de messages envoyés. Réessayez plus tard." }, { status: 429 })
  }

  let body: { nom?: string; email?: string; sujet?: string; message?: string; _hp?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  // Honeypot — les bots remplissent ce champ, les humains non
  if ((body._hp ?? "").length > 0) {
    return NextResponse.json({ ok: true })
  }

  const nom     = (body.nom ?? "").trim()
  const email   = (body.email ?? "").trim()
  const sujet   = (body.sujet ?? "").trim()
  const message = (body.message ?? "").trim()

  if (!nom)                                       return NextResponse.json({ error: "Le nom est requis." }, { status: 400 })
  if (!email.includes("@"))                       return NextResponse.json({ error: "Email invalide." }, { status: 400 })
  if (!sujet)                                     return NextResponse.json({ error: "Le sujet est requis." }, { status: 400 })
  if (message.length < 20)                        return NextResponse.json({ error: "Message trop court (20 caractères min)." }, { status: 400 })
  if (message.length > MAX_MESSAGE_LENGTH)        return NextResponse.json({ error: "Message trop long." }, { status: 400 })

  try {
    await sendContactEmail({ nom, email, sujet, message })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/contact]", err)
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 })
  }
}
