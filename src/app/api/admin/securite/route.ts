import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const type  = searchParams.get("type") ?? ""
  const ip    = searchParams.get("ip")   ?? ""
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = 25

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (ip)   where.ip   = { contains: ip }

  const [events, total] = await Promise.all([
    prisma.securityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.securityLog.count({ where }),
  ])

  return NextResponse.json({ events, total, page, pages: Math.ceil(total / limit) })
}
