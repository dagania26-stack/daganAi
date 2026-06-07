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
  const data: Record<string, unknown> = {}
  if (typeof body.nom === "string")          data.nom         = body.nom
  if (typeof body.prixVente === "number")    data.prixVente   = body.prixVente
  if (typeof body.coutRevient === "number")  data.coutRevient = body.coutRevient
  if (typeof body.unite === "string")        data.unite       = body.unite
  if (typeof body.actif === "boolean")       data.actif       = body.actif
  if (body.categoryId === null || typeof body.categoryId === "string") data.categoryId = body.categoryId

  const updated = await prisma.product.update({
    where:   { id: params.id },
    data,
    include: { category: { select: { id: true, nom: true } } },
  })

  return NextResponse.json(updated)
}
