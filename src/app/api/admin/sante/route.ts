import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const now      = new Date()
  const since1h  = new Date(now.getTime() - 3600_000)
  const since24h = new Date(now.getTime() - 86_400_000)

  // ── Vérification base de données (compatible PgBouncer) ──────────────────
  let db: "ok" | "error" = "ok"
  let dbLatencyMs = 0
  try {
    const t0 = Date.now()
    await prisma.$queryRawUnsafe("SELECT 1")
    dbLatencyMs = Date.now() - t0
  } catch {
    db = "error"
  }

  const rag = process.env.RAG_SERVICE_URL ? "configured" : "not_configured"

  const [
    chats1h,
    chatsFailed1h,
    chats24h,
    chatsFailed24h,
    avgLatency24h,
    securityByType24h,
    rateLimited1h,
    recentSecurityEvents,
  ] = await Promise.all([
    prisma.chatLog.count({ where: { createdAt: { gte: since1h } } }),
    prisma.chatLog.count({ where: { createdAt: { gte: since1h }, success: false } }),
    prisma.chatLog.count({ where: { createdAt: { gte: since24h } } }),
    prisma.chatLog.count({ where: { createdAt: { gte: since24h }, success: false } }),
    prisma.chatLog.aggregate({ where: { createdAt: { gte: since24h }, latenceMs: { not: null } }, _avg: { latenceMs: true } }),
    prisma.securityLog.groupBy({
      by: ["type"],
      where: { createdAt: { gte: since24h } },
      _count: { id: true },
    }),
    prisma.securityLog.count({ where: { type: "RATE_LIMIT", createdAt: { gte: since1h } } }),
    prisma.securityLog.findMany({
      where:   { createdAt: { gte: since24h } },
      orderBy: { createdAt: "desc" },
      take:    5,
      select:  { id: true, type: true, ip: true, details: true, createdAt: true },
    }),
  ])

  const errorRate1h  = chats1h  > 0 ? Math.round((chatsFailed1h  / chats1h)  * 100) : 0
  const errorRate24h = chats24h > 0 ? Math.round((chatsFailed24h / chats24h) * 100) : 0

  // ── Statut global ─────────────────────────────────────────────────────────
  let status: "ok" | "degraded" | "critical" = "ok"
  const alerts: { level: "warning" | "critical"; message: string }[] = []

  if (db === "error") {
    status = "critical"
    alerts.push({ level: "critical", message: "Connexion à la base de données indisponible." })
  }
  if (rag === "not_configured") {
    if (status === "ok") status = "degraded"
    alerts.push({ level: "warning", message: "Service RAG non configuré (RAG_SERVICE_URL manquant)." })
  }
  if (errorRate1h >= 30 && chats1h >= 5) {
    status = status === "critical" ? status : "critical"
    alerts.push({ level: "critical", message: `Taux d'échec du chatbot élevé sur la dernière heure (${errorRate1h}%).` })
  } else if (errorRate24h >= 15 && chats24h >= 10) {
    if (status === "ok") status = "degraded"
    alerts.push({ level: "warning", message: `Taux d'échec du chatbot en hausse sur 24h (${errorRate24h}%).` })
  }
  if (rateLimited1h >= 10) {
    if (status === "ok") status = "degraded"
    alerts.push({ level: "warning", message: `${rateLimited1h} dépassements de rate limit détectés sur la dernière heure.` })
  }

  return NextResponse.json({
    status,
    checkedAt: now.toISOString(),
    db: { status: db, latencyMs: dbLatencyMs },
    rag,
    uptime: process.uptime(),
    chat: {
      total1h:      chats1h,
      failed1h:     chatsFailed1h,
      errorRate1h,
      total24h:     chats24h,
      failed24h:    chatsFailed24h,
      errorRate24h,
      avgLatencyMs: Math.round(avgLatency24h._avg.latenceMs ?? 0),
    },
    security: {
      rateLimited1h,
      byType24h: securityByType24h.map(s => ({ type: s.type, count: s._count.id })),
      recent:    recentSecurityEvents,
    },
    alerts,
  })
}
