import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const product = await prisma.product.findFirst({ where: { id: params.id, businessId: auth.business.id } })
  if (!product) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.product.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const product = await prisma.product.findFirst({ where: { id: params.id, businessId: auth.business.id } })
  if (!product) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.product.update({
    where:   { id: params.id },
    data:    body,
    include: { category: { select: { id: true, nom: true } } },
  })

  return NextResponse.json(updated)
}
