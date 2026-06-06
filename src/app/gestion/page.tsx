import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import DashboardClient from "@/components/gestion/DashboardClient"

function toMonthly(montant: number, frequence: string) {
  if (frequence === "ANNUEL") return montant / 12
  if (frequence === "HEBDO")  return montant * 4.33
  return montant
}

export default async function GestionDashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/gestion/setup")

  const since30d = new Date(); since30d.setDate(since30d.getDate() - 30)

  const [transactions, charges, debts, recentTx, categories] = await Promise.all([
    prisma.transaction.findMany({
      where:   { businessId: business.id, date: { gte: since30d } },
      include: { category: { select: { nom: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.charge.findMany({ where: { businessId: business.id, actif: true } }),
    prisma.debt.findMany({   where: { businessId: business.id } }),
    prisma.transaction.findMany({
      where:   { businessId: business.id },
      include: { category: { select: { nom: true } } },
      orderBy: { date: "desc" },
      take:    6,
    }),
    prisma.category.findMany({
      where:   { businessId: business.id },
      orderBy: { nom: "asc" },
    }),
  ])

  // KPIs globaux
  const ca       = transactions.filter(t => t.type === "ENTREE").reduce((s, t) => s + t.montant, 0)
  const depenses = transactions.filter(t => t.type === "SORTIE").reduce((s, t) => s + t.montant, 0)
  const benefice = ca - depenses
  const chargesMois = charges.reduce((s, c) => s + toMonthly(c.montant, c.frequence), 0)
  const encours  = debts.filter(d => d.statut !== "REMBOURSE").reduce((s, d) => s + d.montantRestant, 0)

  // Chart data (30j par jour)
  const chartMap = new Map<string, { ca: number; depenses: number }>()
  for (const tx of transactions) {
    const label = new Date(tx.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
    const cur   = chartMap.get(label) ?? { ca: 0, depenses: 0 }
    if (tx.type === "ENTREE") cur.ca       += tx.montant
    else                      cur.depenses += tx.montant
    chartMap.set(label, cur)
  }

  // Toutes les dates de la période
  const chartData: { label: string; ca: number; depenses: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
    chartData.push({ label, ca: chartMap.get(label)?.ca ?? 0, depenses: chartMap.get(label)?.depenses ?? 0 })
  }

  // Répartition catégories
  const catMap = new Map<string, { entrees: number; sorties: number }>()
  for (const tx of transactions) {
    const key = tx.category?.nom ?? "Non catégorisé"
    const cur = catMap.get(key) ?? { entrees: 0, sorties: 0 }
    if (tx.type === "ENTREE") cur.entrees += tx.montant
    else                      cur.sorties += tx.montant
    catMap.set(key, cur)
  }
  const cats = Array.from(catMap.entries())
    .map(([nom, v]) => ({ nom, entrees: v.entrees, sorties: v.sorties, total: v.entrees + v.sorties }))
    .sort((a, b) => b.total - a.total).slice(0, 6)

  return (
    <DashboardClient
      businessNom={business.nom}
      initialKpi={{ kpis: { ca, depenses, benefice, chargesMois, encours }, chartData, categories: cats }}
      recentTransactions={recentTx.map(t => ({ ...t, date: t.date.toISOString() }))}
    />
  )
}
