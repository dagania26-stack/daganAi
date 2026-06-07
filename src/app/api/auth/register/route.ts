import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { createOtp } from "@/lib/otp"
import { sendOtpEmail } from "@/lib/email"

const TTL_MS = 15 * 60 * 1000 // 15 minutes pour le PendingUser

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit comporter au moins 8 caractères" }, { status: 400 })
    }

    // Vérifier si l'email est déjà utilisé
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Cette adresse email est déjà utilisée" }, { status: 409 })
    }

    const hashed = await hashPassword(password)

    // Upsert PendingUser (en cas de re-tentative)
    await prisma.pendingUser.upsert({
      where:  { email },
      create: { email, name: name?.trim() || null, password: hashed, expiresAt: new Date(Date.now() + TTL_MS) },
      update: { name: name?.trim() || null, password: hashed, expiresAt: new Date(Date.now() + TTL_MS) },
    })

    const code = await createOtp(email, "REGISTER")
    await sendOtpEmail(email, code, "REGISTER")

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/auth/register]", err)
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 })
  }
}
