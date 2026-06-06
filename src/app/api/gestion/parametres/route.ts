import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

export async function GET() {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const business = await prisma.business.findUnique({
    where:  { id: auth.business.id },
    select: { id: true, nom: true, secteur: true, pays: true, devise: true, rapportFrequence: true, rapportDernierEnvoi: true },
  })
  return NextResponse.json(business)
}

export async function PATCH(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const body = await req.json().catch(() => ({}))
  const allowed = ["nom", "secteur", "pays", "devise", "rapportFrequence"]

  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key] === "" ? null : body[key]
  }

  const updated = await prisma.business.update({
    where:  { id: auth.business.id },
    data,
    select: { id: true, nom: true, secteur: true, pays: true, devise: true, rapportFrequence: true },
  })
  return NextResponse.json(updated)
}
