import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { getRequestGeo } from "@/lib/geoip"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit comporter au moins 8 caractères" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Cette adresse email est déjà utilisée" }, { status: 409 })
    }

    const hashed = await hashPassword(password)
    const { ip, pays, ville } = getRequestGeo(req.headers)

    await prisma.user.create({
      data: {
        email,
        name:          name?.trim() || null,
        password:      hashed,
        emailVerified: new Date(),
        lastIp:        ip,
        lastLogin:     new Date(),
        pays,
        ville,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[/api/auth/register]", msg)
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 })
  }
}
