import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const tx = await prisma.transaction.findFirst({
    where: { id: params.id, businessId: auth.business.id },
  })
  if (!tx) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.transaction.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const tx = await prisma.transaction.findFirst({
    where: { id: params.id, businessId: auth.business.id },
  })
  if (!tx) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.transaction.update({
    where: { id: params.id },
    data: {
      type:        body.type        ?? tx.type,
      montant:     body.montant     ? parseFloat(body.montant) : tx.montant,
      description: body.description ?? tx.description,
      date:        body.date        ? new Date(body.date) : tx.date,
      categoryId:  body.categoryId  ?? tx.categoryId,
    },
    include: { category: { select: { id: true, nom: true } } },
  })

  return NextResponse.json(updated)
}
