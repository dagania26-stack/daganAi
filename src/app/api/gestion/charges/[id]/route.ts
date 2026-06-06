import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const charge = await prisma.charge.findFirst({ where: { id: params.id, businessId: auth.business.id } })
  if (!charge) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.charge.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const charge = await prisma.charge.findFirst({ where: { id: params.id, businessId: auth.business.id } })
  if (!charge) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.charge.update({
    where: { id: params.id },
    data:  body,
  })

  return NextResponse.json(updated)
}
