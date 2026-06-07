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

  // L'admin ne peut pas se rétrograder lui-même
  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Opération impossible sur votre propre compte" }, { status: 400 })
  }

  const body = await req.json()
  const allowed = ["role", "name", "pays", "ville"]
  const data: Record<string, string> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  const user = await prisma.user.update({
    where:  { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, pays: true, ville: true },
  })
  return NextResponse.json({ user })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
