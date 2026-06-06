import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function GET() {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const products = await prisma.product.findMany({
    where:   { businessId: auth.business.id },
    include: { category: { select: { id: true, nom: true } } },
    orderBy: [{ actif: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const { nom, prixVente, coutRevient, unite, categoryId } = body

  if (!nom?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 })
  if (prixVente < 0) return NextResponse.json({ error: "Prix invalide" }, { status: 400 })

  const product = await prisma.product.create({
    data: {
      nom:         nom.trim(),
      prixVente:   parseFloat(prixVente) || 0,
      coutRevient: parseFloat(coutRevient) || 0,
      unite:       unite?.trim() || "unité",
      categoryId:  categoryId || null,
      businessId:  auth.business.id,
    },
    include: { category: { select: { id: true, nom: true } } },
  })

  return NextResponse.json(product, { status: 201 })
}
