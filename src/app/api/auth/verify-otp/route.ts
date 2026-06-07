import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyOtp } from "@/lib/otp"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, code, type = "REGISTER" } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 })
    }

    const otpType = type === "RESET_PASSWORD" ? "RESET_PASSWORD" : "REGISTER"

    const valid = await verifyOtp(email, code, otpType)
    if (!valid) {
      return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 400 })
    }

    // Pour la réinitialisation de mot de passe, on s'arrête ici
    // (le code sera réutilisé dans /api/auth/reset-password)
    if (otpType === "RESET_PASSWORD") {
      return NextResponse.json({ ok: true })
    }

    // Flux inscription : créer l'utilisateur depuis PendingUser
    const pending = await prisma.pendingUser.findUnique({ where: { email } })
    if (!pending || pending.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expirée. Recommencez l'inscription." }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        email:         pending.email,
        name:          pending.name,
        password:      pending.password,
        emailVerified: new Date(),
      },
    })

    await prisma.pendingUser.delete({ where: { email } })

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (err) {
    console.error("[/api/auth/verify-otp]", err)
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 })
  }
}
