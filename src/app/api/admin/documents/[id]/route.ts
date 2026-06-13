import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return null
  return session
}

// ── PATCH /api/admin/documents/[id] — mise à jour métadonnées ─────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = params
  const body = await req.json().catch(() => ({}))

  const { titre, domaine, sousDomaine, source, version, actif } = body

  if (domaine && !["OHADA", "OTR", "FINANCEMENT"].includes(domaine.toUpperCase()))
    return NextResponse.json({ error: "Domaine invalide" }, { status: 400 })

  const updated = await prisma.document.update({
    where: { id },
    data: {
      ...(titre      !== undefined && { titre:      titre.trim()            }),
      ...(domaine    !== undefined && { domaine:    domaine.toUpperCase()   }),
      ...(sousDomaine!== undefined && { sousDomaine: sousDomaine?.trim() || null }),
      ...(source     !== undefined && { source:     source.trim()           }),
      ...(version    !== undefined && { version:    version.trim()          }),
      ...(actif      !== undefined && { actif:      Boolean(actif)          }),
    },
  })

  return NextResponse.json({ ok: true, document: updated })
}

// ── DELETE /api/admin/documents/[id] ──────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = params

  await prisma.document.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
