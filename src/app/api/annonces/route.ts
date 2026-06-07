import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Calcule le segment d'activité de l'utilisateur — doit rester cohérent avec
// la segmentation utilisée côté admin (cartographie, ciblage des annonces)
function userSegment(lastLogin: Date | null): "ACTIVE" | "INACTIVE" | "DORMANT" {
  if (!lastLogin) return "DORMANT"
  const days = (Date.now() - lastLogin.getTime()) / 86_400_000
  if (days <= 7)  return "ACTIVE"
  if (days <= 30) return "INACTIVE"
  return "DORMANT"
}

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { lastLogin: true },
  })
  const segment = userSegment(user?.lastLogin ?? null)

  const announcements = await prisma.announcement.findMany({
    where:   { active: true, targetSegment: { in: ["ALL", segment] } },
    select:  { id: true, title: true, message: true, level: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take:    5,
  })

  return NextResponse.json({ announcements })
}
