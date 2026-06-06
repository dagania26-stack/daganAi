import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const q     = searchParams.get("q")     ?? ""
  const role  = searchParams.get("role")  ?? ""
  const pays  = searchParams.get("pays")  ?? ""
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = 20

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name:  { contains: q, mode: "insensitive" } },
    ]
  }
  if (role === "ADMIN" || role === "USER") where.role = role
  if (pays)  where.pays = { contains: pays, mode: "insensitive" }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id:            true,
        name:          true,
        email:         true,
        role:          true,
        pays:          true,
        ville:         true,
        lastLogin:     true,
        lastIp:        true,
        createdAt:     true,
        emailVerified: true,
        _count: {
          select: { businesses: true, chatLogs: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) })
}
