import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest): Promise<NextResponse> {
  const key = req.headers.get("x-internal-key")
  if (!key || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { type, ip, userId, details } = await req.json()

    await prisma.securityLog.create({
      data: {
        type:    type ?? "SUSPICIOUS",
        ip:      ip   ?? null,
        userId:  userId ?? null,
        details: details ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 })
  }
}
