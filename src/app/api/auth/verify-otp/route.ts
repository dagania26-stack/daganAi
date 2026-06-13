import { NextRequest, NextResponse } from "next/server"
import { verifyOtp } from "@/lib/otp"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, code, type } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 })
    }

    if (type !== "RESET_PASSWORD") {
      return NextResponse.json({ error: "Type de vérification invalide" }, { status: 400 })
    }

    const valid = await verifyOtp(email, code, "RESET_PASSWORD")
    if (!valid) {
      return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/auth/verify-otp]", err)
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 })
  }
}
