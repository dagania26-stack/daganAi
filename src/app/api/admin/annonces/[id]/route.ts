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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const existing = await prisma.announcement.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (typeof body.active === "boolean") data.active = body.active
  if (SEGMENTS.includes(body.targetSegment)) data.targetSegment = body.targetSegment
  if (LEVELS.includes(body.level)) data.level = body.level

  if (typeof body.title === "string") {
    const title = body.title.trim()
    if (!title) return NextResponse.json({ error: "Titre requis" }, { status: 400 })
    data.title = title
  }
  if (typeof body.message === "string") {
    const message = sanitizeAnnouncementHtml(body.message.trim())
    if (!hasTextContent(message)) return NextResponse.json({ error: "Message requis" }, { status: 400 })
    data.message = message
  }

  const announcement = await prisma.announcement.update({
    where:   { id: params.id },
    data,
    include: { author: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(announcement)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const existing = await prisma.announcement.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.announcement.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
