import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: {
      _count: { select: { transactions: true, charges: true, products: true, debts: true } },
    },
  })

  if (!business) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(business)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const existing = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (existing) return NextResponse.json({ error: "Entreprise déjà créée" }, { status: 409 })

  const body = await req.json()
  const { nom, secteur } = body

  if (!nom?.trim()) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })

  const business = await prisma.business.create({
    data: { nom: nom.trim(), secteur: secteur?.trim() || null, userId: session.user.id },
  })

  await prisma.category.createMany({
    data: [
      { nom: "Ventes",         type: "VENTE",  businessId: business.id },
      { nom: "Achats",         type: "ACHAT",  businessId: business.id },
      { nom: "Frais généraux", type: "CHARGE", businessId: business.id },
    ],
  })

  return NextResponse.json(business, { status: 201 })
}
