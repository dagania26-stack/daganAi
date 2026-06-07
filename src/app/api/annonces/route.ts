import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const announcements = await prisma.announcement.findMany({
    where:   { active: true },
    select:  { id: true, title: true, message: true, level: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take:    5,
  })

  return NextResponse.json({ announcements })
}
