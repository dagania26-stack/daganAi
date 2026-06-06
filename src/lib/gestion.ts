import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// ── Guard API : vérifie l'auth et retourne la Business de l'utilisateur ────────

export type RequireBusinessResult =
  | { ok: true;  business: { id: string; nom: string; devise: string }; userId: string }
  | { ok: false; response: NextResponse; business: null; userId: null }

export async function requireBusiness(): Promise<RequireBusinessResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
      business: null,
      userId: null,
    }
  }

  const business = await prisma.business.findFirst({
    where:  { userId: session.user.id },
    select: { id: true, nom: true, devise: true },
  })

  if (!business) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Aucune entreprise trouvée" }, { status: 404 }),
      business: null,
      userId: null,
    }
  }

  return { ok: true, business, userId: session.user.id }
}

// fmt et fmtDate sont dans src/lib/format.ts pour être utilisables côté client
export { fmt, fmtDate } from "@/lib/format"
