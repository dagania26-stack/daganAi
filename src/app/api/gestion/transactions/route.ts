import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function GET() {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const transactions = await prisma.transaction.findMany({
    where:   { businessId: auth.business.id },
    include: { category: { select: { id: true, nom: true } }, product: { select: { id: true, nom: true } } },
    orderBy: { date: "desc" },
    take:    2000,
  })

  return NextResponse.json(transactions)
}

export async function POST(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const { type, montant, description, date, categoryId, productId, quantite } = body

  if (!["ENTREE", "SORTIE"].includes(type)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 })
  }
  if (!montant || montant <= 0) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 })
  }

  const transaction = await prisma.transaction.create({
    data: {
      type,
      montant:     parseFloat(montant),
      description: description?.trim() || null,
      date:        date ? new Date(date) : new Date(),
      quantite:    quantite ? parseFloat(quantite) : 1,
      businessId:  auth.business.id,
      categoryId:  categoryId || null,
      productId:   productId  || null,
    },
    include: { category: { select: { id: true, nom: true } }, product: { select: { id: true, nom: true } } },
  })

  return NextResponse.json(transaction, { status: 201 })
}
