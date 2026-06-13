import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"
import { sendRapportEmail } from "@/lib/email"
import { auth } from "@/auth"
import { parsePeriodDays, periodLabel } from "@/lib/periode"

export async function POST(req: Request) {
  const guard = await requireBusiness()
  if (!guard.ok) return guard.response

  const session = await auth()
  const email   = session?.user?.email
  if (!email) return NextResponse.json({ error: "Email utilisateur introuvable" }, { status: 400 })

  const body        = await req.json().catch(() => ({}))
  const analyseText = (body.analyseText as string) ?? ""
  const jours       = parsePeriodDays(body.periodeJours != null ? String(body.periodeJours) : null)
  const periode     = periodLabel(jours)

  const since = new Date()
  since.setDate(since.getDate() - jours)

  const [transactions, charges, debts] = await Promise.all([
    prisma.transaction.findMany({ where: { businessId: guard.business.id, date: { gte: since } } }),
    prisma.charge.findMany({ where: { businessId: guard.business.id, actif: true } }),
    prisma.debt.findMany({ where: { businessId: guard.business.id } }),
  ])

  const ca       = transactions.filter(t => t.type === "ENTREE").reduce((s, t) => s + t.montant, 0)
  const depenses = transactions.filter(t => t.type === "SORTIE").reduce((s, t) => s + t.montant, 0)
  const benefice = ca - depenses
  const chargesMois = charges.reduce((s, c) => {
    if (c.frequence === "ANNUEL") return s + c.montant / 12
    if (c.frequence === "HEBDO")  return s + c.montant * 4.33
    return s + c.montant
  }, 0)
  const encours = debts.filter(d => d.statut !== "REMBOURSE").reduce((s, d) => s + d.montantRestant, 0)

  try {
    await sendRapportEmail({
      to:          email,
      businessNom: guard.business.nom,
      periode,
      analyseText,
      kpis: { ca, depenses, benefice, chargesMois, encours },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[/api/gestion/rapport/email]", msg)
    return NextResponse.json(
      { error: "L'envoi de l'email a échoué. Vérifiez la configuration Resend dans Vercel." },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
