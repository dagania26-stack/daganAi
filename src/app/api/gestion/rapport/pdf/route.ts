import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"
import { RapportPDF } from "@/components/gestion/RapportPDF"

function toMonthly(montant: number, frequence: string) {
  if (frequence === "ANNUEL") return montant / 12
  if (frequence === "HEBDO")  return montant * 4.33
  return montant
}

export async function POST(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const body        = await req.json().catch(() => ({}))
  const analyseText = (body.analyseText as string) ?? ""
  const periode     = (body.periode as string) ?? "30 derniers jours"

  const since = new Date()
  since.setDate(since.getDate() - 90)

  const [transactions, charges, debts] = await Promise.all([
    prisma.transaction.findMany({
      where:   { businessId: auth.business.id, date: { gte: since } },
      include: { category: { select: { nom: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.charge.findMany({ where: { businessId: auth.business.id }, orderBy: { nom: "asc" } }),
    prisma.debt.findMany({   where: { businessId: auth.business.id }, orderBy: { createdAt: "desc" } }),
  ])

  const ca       = transactions.filter(t => t.type === "ENTREE").reduce((s, t) => s + t.montant, 0)
  const depenses = transactions.filter(t => t.type === "SORTIE").reduce((s, t) => s + t.montant, 0)
  const benefice = ca - depenses
  const chargesMois = charges.filter(c => c.actif).reduce((s, c) => s + toMonthly(c.montant, c.frequence), 0)
  const encours  = debts.filter(d => d.statut !== "REMBOURSE").reduce((s, d) => s + d.montantRestant, 0)

  const now    = new Date()
  const genAt  = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })

  const doc = React.createElement(RapportPDF as React.ComponentType<any>, {
    businessNom:  auth.business.nom,
    periode,
    kpis:         { ca, depenses, benefice, chargesMois, encours },
    transactions: transactions.map(t => ({ ...t, date: t.date.toISOString() })),
    charges:      charges.map(c => ({ ...c })),
    debts:        debts.map(d => ({ ...d, dateEcheance: d.dateEcheance?.toISOString() ?? null })),
    analyseText,
    generatedAt:  genAt,
  })

  const buffer   = await renderToBuffer(doc)
  const uint8arr = new Uint8Array(buffer)

  const filename = `rapport-dagan-${auth.business.nom.toLowerCase().replace(/\s+/g, "-")}-${now.toISOString().slice(0, 10)}.pdf`

  return new Response(uint8arr, {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
