import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const key = req.headers.get("x-internal-key")
  if (!key || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const settings = await prisma.siteSettings.findFirst()

  return NextResponse.json({
    enabled: settings?.maintenanceMode ?? false,
    message: settings?.maintenanceMessage ?? null,
  })
}
