import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function GET() {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const debts = await prisma.debt.findMany({
    where:   { businessId: auth.business.id },
    orderBy: [{ statut: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(debts)
}

export async function POST(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const { description, creancier, montant, montantRestant, dateEcheance, statut } = body

  if (!description?.trim()) return NextResponse.json({ error: "Description requise" }, { status: 400 })
  if (!creancier?.trim())   return NextResponse.json({ error: "Créancier requis" }, { status: 400 })
  if (!montant || montant <= 0) return NextResponse.json({ error: "Montant invalide" }, { status: 400 })

  const debt = await prisma.debt.create({
    data: {
      description:    description.trim(),
      creancier:      creancier.trim(),
      montant:        parseFloat(montant),
      montantRestant: montantRestant !== undefined ? parseFloat(montantRestant) : parseFloat(montant),
      dateEcheance:   dateEcheance   ? new Date(dateEcheance) : null,
      statut:         statut ?? "EN_COURS",
      businessId:     auth.business.id,
    },
  })

  return NextResponse.json(debt, { status: 201 })
}
