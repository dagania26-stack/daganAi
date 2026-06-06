import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function GET() {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const categories = await prisma.category.findMany({
    where:   { businessId: auth.business.id },
    orderBy: { nom: "asc" },
  })

  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const { nom, type } = body

  if (!nom?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 })
  if (!["VENTE", "ACHAT", "CHARGE"].includes(type)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { nom: nom.trim(), type, businessId: auth.business.id },
  })

  return NextResponse.json(category, { status: 201 })
}

export async function DELETE(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const { id } = await req.json()
  const cat = await prisma.category.findFirst({ where: { id, businessId: auth.business.id } })
  if (!cat) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.category.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
