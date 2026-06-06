import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"

type GroupBy = "day" | "week" | "month"

function getPeriodConfig(periode: string): { start: Date; end: Date; groupBy: GroupBy } {
  const end   = new Date()
  const start = new Date()

  switch (periode) {
    case "7d":  start.setDate(start.getDate() - 7);          return { start, end, groupBy: "day"   }
    case "30d": start.setDate(start.getDate() - 30);         return { start, end, groupBy: "day"   }
    case "3m":  start.setMonth(start.getMonth() - 3);        return { start, end, groupBy: "week"  }
    case "6m":  start.setMonth(start.getMonth() - 6);        return { start, end, groupBy: "month" }
    case "1y":  start.setFullYear(start.getFullYear() - 1);  return { start, end, groupBy: "month" }
    default:    start.setDate(start.getDate() - 30);         return { start, end, groupBy: "day"   }
  }
}

function getGroupKey(date: Date, groupBy: GroupBy): string {
  if (groupBy === "day") {
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
  }
  if (groupBy === "week") {
    const d = new Date(date)
    d.setDate(d.getDate() - d.getDay() + 1) // lundi
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
  }
  return date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
}

function generateDateKeys(start: Date, end: Date, groupBy: GroupBy): string[] {
  const keys: string[]  = []
  const seen             = new Set<string>()
  const cursor           = new Date(start)

  while (cursor <= end) {
    const key = getGroupKey(cursor, groupBy)
    if (!seen.has(key)) { keys.push(key); seen.add(key) }
    if (groupBy === "day")   cursor.setDate(cursor.getDate() + 1)
    else if (groupBy === "week")  cursor.setDate(cursor.getDate() + 7)
    else cursor.setMonth(cursor.getMonth() + 1)
  }
  return keys
}

export async function GET(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const url     = new URL(req.url)
  const periode = url.searchParams.get("periode") ?? "30d"

  const { start, end, groupBy } = getPeriodConfig(periode)

  // ── Transactions de la période ────────────────────────────────────────────
  const [transactions, charges, debts] = await Promise.all([
    prisma.transaction.findMany({
      where:   { businessId: auth.business.id, date: { gte: start, lte: end } },
      include: { category: { select: { nom: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.charge.findMany({ where: { businessId: auth.business.id, actif: true } }),
    prisma.debt.findMany({   where: { businessId: auth.business.id } }),
  ])

  // ── KPIs globaux ─────────────────────────────────────────────────────────
  const ca       = transactions.filter(t => t.type === "ENTREE").reduce((s, t) => s + t.montant, 0)
  const depenses = transactions.filter(t => t.type === "SORTIE").reduce((s, t) => s + t.montant, 0)
  const benefice = ca - depenses

  const chargesMois = charges.reduce((s, c) => {
    if (c.frequence === "MENSUEL") return s + c.montant
    if (c.frequence === "ANNUEL")  return s + c.montant / 12
    if (c.frequence === "HEBDO")   return s + c.montant * 4.33
    return s
  }, 0)

  const encours = debts.filter(d => d.statut !== "REMBOURSE").reduce((s, d) => s + d.montantRestant, 0)

  // ── Données graphique ─────────────────────────────────────────────────────
  const chartMap = new Map<string, { ca: number; depenses: number }>()
  for (const tx of transactions) {
    const key     = getGroupKey(new Date(tx.date), groupBy)
    const current = chartMap.get(key) ?? { ca: 0, depenses: 0 }
    if (tx.type === "ENTREE") current.ca       += tx.montant
    else                      current.depenses += tx.montant
    chartMap.set(key, current)
  }

  const allKeys   = generateDateKeys(start, end, groupBy)
  const chartData = allKeys.map(label => ({
    label,
    ca:       chartMap.get(label)?.ca       ?? 0,
    depenses: chartMap.get(label)?.depenses ?? 0,
  }))

  // ── Répartition par catégorie ─────────────────────────────────────────────
  const catMap = new Map<string, { entrees: number; sorties: number }>()
  for (const tx of transactions) {
    const key     = tx.category?.nom ?? "Non catégorisé"
    const current = catMap.get(key) ?? { entrees: 0, sorties: 0 }
    if (tx.type === "ENTREE") current.entrees += tx.montant
    else                      current.sorties += tx.montant
    catMap.set(key, current)
  }

  const categories = Array.from(catMap.entries())
    .map(([nom, v]) => ({ nom, entrees: v.entrees, sorties: v.sorties, total: v.entrees + v.sorties }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  return NextResponse.json({ kpis: { ca, depenses, benefice, chargesMois, encours }, chartData, categories })
}
