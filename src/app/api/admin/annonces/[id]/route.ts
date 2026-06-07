import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

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
