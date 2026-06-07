import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendAnnouncementEmail } from "@/lib/email"
import type { Prisma } from "@prisma/client"

export const maxDuration = 60

const SEGMENTS = ["ALL", "ACTIVE", "INACTIVE", "DORMANT"] as const
type Segment = (typeof SEGMENTS)[number]

// Doit rester cohérent avec la segmentation utilisée côté cartographie / API annonces
function segmentWhere(segment: Segment): Prisma.UserWhereInput {
  const now = Date.now()
  const d7  = new Date(now - 7  * 86_400_000)
  const d30 = new Date(now - 30 * 86_400_000)
  switch (segment) {
    case "ACTIVE":   return { lastLogin: { gte: d7 } }
    case "INACTIVE": return { lastLogin: { gte: d30, lt: d7 } }
    case "DORMANT":  return { OR: [{ lastLogin: null }, { lastLogin: { lt: d30 } }] }
    default:         return {}
  }
}

const CONCURRENCY = 10

async function sendInBatches(emails: string[], task: (email: string) => Promise<void>): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0
  for (let i = 0; i < emails.length; i += CONCURRENCY) {
    const batch = emails.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(batch.map(task))
    for (const r of results) {
      if (r.status === "fulfilled") sent++
      else failed++
    }
  }
  return { sent, failed }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const announcement = await prisma.announcement.findUnique({ where: { id: params.id } })
  if (!announcement) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body    = await req.json()
  const segment: Segment = SEGMENTS.includes(body.targetSegment) ? body.targetSegment : "ALL"

  const recipients = await prisma.user.findMany({
    where:  { email: { not: null }, ...segmentWhere(segment) },
    select: { email: true },
  })
  const emails = recipients.map(r => r.email).filter((e): e is string => !!e)

  const { sent, failed } = await sendInBatches(emails, email =>
    sendAnnouncementEmail(email, {
      title:   announcement.title,
      message: announcement.message,
      level:   announcement.level,
    }),
  )

  const updated = await prisma.announcement.update({
    where:   { id: params.id },
    data:    { active: true, targetSegment: segment },
    include: { author: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ announcement: updated, total: emails.length, sent, failed })
}
