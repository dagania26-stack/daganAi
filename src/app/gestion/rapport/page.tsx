import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RapportClient from "@/components/gestion/RapportClient"
import { parsePeriodDays, periodLabel } from "@/lib/periode"

function toMonthly(montant: number, frequence: string) {
  if (frequence === "ANNUEL") return montant / 12
  if (frequence === "HEBDO")  return montant * 4.33
  return montant
}

export default async function RapportPage({ searchParams }: { searchParams: { jours?: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion/rapport")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/gestion/setup")

  const jours = parsePeriodDays(searchParams.jours)
  const since = new Date(); since.setDate(since.getDate() - jours)

  const [transactions, charges, debts] = await Promise.all([
    prisma.transaction.findMany({ where: { businessId: business.id, date: { gte: since } } }),
    prisma.charge.findMany({ where: { businessId: business.id, actif: true } }),
    prisma.debt.findMany({ where: { businessId: business.id } }),
  ])

  const ca       = transactions.filter(t => t.type === "ENTREE").reduce((s, t) => s + t.montant, 0)
  const depenses = transactions.filter(t => t.type === "SORTIE").reduce((s, t) => s + t.montant, 0)
  const benefice = ca - depenses
  const chargesMois = charges.reduce((s, c) => s + toMonthly(c.montant, c.frequence), 0)
  const encours  = debts.filter(d => d.statut !== "REMBOURSE").reduce((s, d) => s + d.montantRestant, 0)

  return (
    <RapportClient
      key={jours}
      businessNom={business.nom}
      userEmail={session.user.email ?? ""}
      periodeJours={jours}
      periode={periodLabel(jours)}
      kpis={{ ca, depenses, benefice, chargesMois, encours }}
    />
  )
}
