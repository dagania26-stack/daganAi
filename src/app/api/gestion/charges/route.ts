import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function GET() {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const charges = await prisma.charge.findMany({
    where:   { businessId: auth.business.id },
    orderBy: [{ actif: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(charges)
}

export async function POST(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const { nom, montant, type, frequence } = body

  if (!nom?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 })
  if (!montant || montant <= 0) return NextResponse.json({ error: "Montant invalide" }, { status: 400 })
  if (!["FIXE", "VARIABLE"].includes(type)) return NextResponse.json({ error: "Type invalide" }, { status: 400 })

  const charge = await prisma.charge.create({
    data: {
      nom:       nom.trim(),
      montant:   parseFloat(montant),
      type,
      frequence: frequence ?? "MENSUEL",
      businessId: auth.business.id,
    },
  })

  return NextResponse.json(charge, { status: 201 })
}
