import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createOtp } from "@/lib/otp"
import { sendOtpEmail } from "@/lib/email"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    // On répond toujours OK pour éviter l'énumération d'emails
    if (!user) return NextResponse.json({ ok: true })

    const code = await createOtp(email, "RESET_PASSWORD")
    await sendOtpEmail(email, code, "RESET_PASSWORD")

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/auth/forgot-password]", err)
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 })
  }
}
