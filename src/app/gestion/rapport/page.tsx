import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RapportClient from "@/components/gestion/RapportClient"

function toMonthly(montant: number, frequence: string) {
  if (frequence === "ANNUEL") return montant / 12
  if (frequence === "HEBDO")  return montant * 4.33
  return montant
}

export default async function RapportPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion/rapport")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/gestion/setup")

  const since = new Date(); since.setDate(since.getDate() - 90)

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
      businessNom={business.nom}
      userEmail={session.user.email ?? ""}
      kpis={{ ca, depenses, benefice, chargesMois, encours }}
    />
  )
}
