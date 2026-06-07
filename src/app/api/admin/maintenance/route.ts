import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function getOrCreateSettings() {
  const existing = await prisma.siteSettings.findFirst()
  if (existing) return existing
  return prisma.siteSettings.create({ data: {} })
}

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const settings = await getOrCreateSettings()
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const body = await req.json()
  const data: { maintenanceMode?: boolean; maintenanceMessage?: string | null; updatedById?: string } = {
    updatedById: session.user.id,
  }

  if (typeof body.maintenanceMode === "boolean") {
    data.maintenanceMode = body.maintenanceMode
  }
  if (typeof body.maintenanceMessage === "string") {
    const trimmed = body.maintenanceMessage.trim()
    data.maintenanceMessage = trimmed.length > 0 ? trimmed : null
  }

  const current  = await getOrCreateSettings()
  const settings = await prisma.siteSettings.update({ where: { id: current.id }, data })

  return NextResponse.json(settings)
}
