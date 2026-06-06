import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendRapportEmail } from "@/lib/email"

// Appelé par Vercel Cron — protégé par CRON_SECRET
export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now     = new Date()
  const dayOfWeek = now.getDay()   // 1 = lundi
  const dayOfMonth = now.getDate() // 1 = 1er du mois

  // Chercher les businesses avec rapportFrequence actif
  const businesses = await prisma.business.findMany({
    where: {
      rapportFrequence: { in: ["HEBDO", "MENSUEL"] },
      user: { email: { not: null } },
    },
    include: { user: { select: { email: true } } },
  })

  let sent = 0
  const errors: string[] = []

  for (const biz of businesses) {
    const email = biz.user?.email
    if (!email) continue

    // HEBDO : envoyer le lundi (dayOfWeek === 1)
    // MENSUEL : envoyer le 1er du mois
    const shouldSend =
      (biz.rapportFrequence === "HEBDO"   && dayOfWeek === 1) ||
      (biz.rapportFrequence === "MENSUEL" && dayOfMonth === 1)

    if (!shouldSend) continue

    try {
      const since = new Date()
      if (biz.rapportFrequence === "HEBDO") since.setDate(since.getDate() - 7)
      else since.setDate(since.getDate() - 30)

      const [transactions, charges, debts] = await Promise.all([
        prisma.transaction.findMany({ where: { businessId: biz.id, date: { gte: since } } }),
        prisma.charge.findMany({ where: { businessId: biz.id, actif: true } }),
        prisma.debt.findMany({ where: { businessId: biz.id } }),
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

      const periode = biz.rapportFrequence === "HEBDO" ? "7 derniers jours" : "30 derniers jours"

      await sendRapportEmail({
        to: email,
        businessNom: biz.nom,
        periode,
        analyseText: "",
        kpis: { ca, depenses, benefice, chargesMois, encours },
      })

      await prisma.business.update({
        where: { id: biz.id },
        data:  { rapportDernierEnvoi: now },
      })

      sent++
    } catch (err: any) {
      errors.push(`${biz.nom}: ${err.message}`)
    }
  }

  return NextResponse.json({ sent, errors, checked: businesses.length })
}
