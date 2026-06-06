import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const debt = await prisma.debt.findFirst({ where: { id: params.id, businessId: auth.business.id } })
  if (!debt) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.debt.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const debt = await prisma.debt.findFirst({ where: { id: params.id, businessId: auth.business.id } })
  if (!debt) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.debt.update({
    where: { id: params.id },
    data: {
      montantRestant: body.montantRestant !== undefined ? parseFloat(body.montantRestant) : undefined,
      statut:         body.statut,
      dateEcheance:   body.dateEcheance ? new Date(body.dateEcheance) : undefined,
    },
  })

  return NextResponse.json(updated)
}
