import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const q       = searchParams.get("q")       ?? ""
  const statut  = searchParams.get("statut")  ?? ""
  const mode    = searchParams.get("mode")    ?? ""
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit   = 25

  const where: Record<string, unknown> = {}
  if (q)      where.question = { contains: q, mode: "insensitive" }
  if (statut === "success") where.success = true
  if (statut === "error")   where.success = false
  if (mode)   where.mode = mode

  const [logs, total] = await Promise.all([
    prisma.chatLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.chatLog.count({ where }),
  ])

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) })
}
