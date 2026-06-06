import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const now        = new Date()
  const since7d    = new Date(now.getTime() - 7  * 86400_000)
  const since30d   = new Date(now.getTime() - 30 * 86400_000)
  const since24h   = new Date(now.getTime() - 86400_000)

  const [
    totalUsers,
    newUsers7d,
    newUsers30d,
    totalChats,
    failedChats,
    securityEvents24h,
    usersByDay,
    chatsByDay,
    topPays,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since7d  } } }),
    prisma.user.count({ where: { createdAt: { gte: since30d } } }),
    prisma.chatLog.count(),
    prisma.chatLog.count({ where: { success: false } }),
    prisma.securityLog.count({ where: { createdAt: { gte: since24h } } }),

    // Inscriptions par jour sur 30j
    prisma.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS count
      FROM "User"
      WHERE "createdAt" >= ${since30d}
      GROUP BY day ORDER BY day
    `,

    // Chats par jour sur 30j
    prisma.$queryRaw<{ day: string; success: boolean; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, success, COUNT(*) AS count
      FROM "ChatLog"
      WHERE "createdAt" >= ${since30d}
      GROUP BY day, success ORDER BY day
    `,

    // Top pays
    prisma.user.groupBy({
      by:      ["pays"],
      _count:  { id: true },
      orderBy: { _count: { id: "desc" } },
      take:    10,
    }),
  ])

  const successRate = totalChats > 0
    ? Math.round(((totalChats - failedChats) / totalChats) * 100)
    : 100

  // Construire le tableau des 30 derniers jours
  const dayMap = new Map<string, { inscriptions: number; chatsOk: number; chatsFail: number }>()
  for (let i = 29; i >= 0; i--) {
    const d   = new Date(now); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
    const key = d.toISOString().slice(0, 10)
    dayMap.set(key, { inscriptions: 0, chatsOk: 0, chatsFail: 0 })
  }
  for (const r of usersByDay) {
    const key = new Date(r.day).toISOString().slice(0, 10)
    const cur = dayMap.get(key); if (cur) cur.inscriptions = Number(r.count)
  }
  for (const r of chatsByDay) {
    const key = new Date(r.day).toISOString().slice(0, 10)
    const cur = dayMap.get(key)
    if (cur) {
      if (r.success) cur.chatsOk   += Number(r.count)
      else           cur.chatsFail += Number(r.count)
    }
  }
  const chartData = Array.from(dayMap.entries()).map(([date, v]) => ({
    date,
    label:        new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    inscriptions: v.inscriptions,
    chatsOk:      v.chatsOk,
    chatsFail:    v.chatsFail,
  }))

  return NextResponse.json({
    totalUsers,
    newUsers7d,
    newUsers30d,
    totalChats,
    failedChats,
    successRate,
    securityEvents24h,
    chartData,
    topPays: topPays.map(p => ({ pays: p.pays ?? "Inconnu", count: p._count.id })),
  })
}
