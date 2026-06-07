import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sanitizeAnnouncementHtml } from "@/lib/sanitizeHtml"

const LEVELS   = ["INFO", "SUCCESS", "WARNING"] as const
const SEGMENTS = ["ALL", "ACTIVE", "INACTIVE", "DORMANT"] as const

// Un message HTML "vide" (ex: "<p></p>") ne doit pas passer la validation de présence
function hasTextContent(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "").length > 0
}

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const announcements = await prisma.announcement.findMany({
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const body = await req.json()
  const title   = typeof body.title === "string"   ? body.title.trim()   : ""
  const message = typeof body.message === "string" ? sanitizeAnnouncementHtml(body.message.trim()) : ""
  const level   = LEVELS.includes(body.level)     ? body.level   : "INFO"
  const segment = SEGMENTS.includes(body.targetSegment) ? body.targetSegment : "ALL"

  if (!title)               return NextResponse.json({ error: "Titre requis" },   { status: 400 })
  if (!hasTextContent(message)) return NextResponse.json({ error: "Message requis" }, { status: 400 })

  const announcement = await prisma.announcement.create({
    data: { title, message, level, targetSegment: segment, authorId: session.user.id },
    include: { author: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(announcement, { status: 201 })
}
