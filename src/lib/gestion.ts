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

// ── Formatage ─────────────────────────────────────────────────────────────────

export function fmt(amount: number, devise = "FCFA"): string {
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) +
    " " +
    devise
  )
}

export function fmtDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  })
}
