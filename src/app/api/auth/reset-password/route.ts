import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyOtp } from "@/lib/otp"
import { hashPassword } from "@/lib/password"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, code, password } = await req.json()

    if (!email || !code || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit comporter au moins 8 caractères" }, { status: 400 })
    }

    const valid = await verifyOtp(email, code, "RESET_PASSWORD")
    if (!valid) {
      return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 400 })
    }

    const hashed = await hashPassword(password)
    await prisma.user.update({
      where: { email },
      data:  { password: hashed },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/auth/reset-password]", err)
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 })
  }
}
