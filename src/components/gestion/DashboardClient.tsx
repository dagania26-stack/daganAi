"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { fmt, fmtDate } from "@/lib/gestion"

const DashboardCharts = dynamic(() => import("./DashboardCharts"), {
  ssr:     false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl border border-border-custom h-[272px] animate-pulse" />)}
    </div>
  ),
})

type KpiData = {
  kpis:       { ca: number; depenses: number; benefice: number; chargesMois: number; encours: number }
  chartData:  { label: string; ca: number; depenses: number }[]
  categories: { nom: string; entrees: number; sorties: number; total: number }[]
}

type Transaction = {
  id: string; type: string; montant: number; description: string | null; date: string
  category: { nom: string } | null
}

interface Props {
  businessNom:        string
  initialKpi:         KpiData
  recentTransactions: Transaction[]
}

const PERIODES = [
  { value: "7d",  label: "7 jours"  },
  { value: "30d", label: "30 jours" },
  { value: "3m",  label: "3 mois"   },
  { value: "6m",  label: "6 mois"   },
  { value: "1y",  label: "1 an"     },
]

const QUICK_ACTIONS = [
  { href: "/gestion/transactions", icon: "fi-rr-plus",       label: "Transaction", color: "bg-green-600"  },
  { href: "/gestion/charges",      icon: "fi-rr-receipt",    label: "Charge",      color: "bg-amber-600"  },
  { href: "/gestion/produits",     icon: "fi-rr-box",        label: "Produit",     color: "bg-terracotta" },
  { href: "/gestion/dettes",       icon: "fi-rr-bank",       label: "Dette",       color: "bg-red-600"    },
  { href: "/gestion/analyse",      icon: "fi-rr-magic-wand", label: "Analyser",    color: "bg-dark"       },
]

export default function DashboardClient({ businessNom, initialKpi, recentTransactions }: Props) {
  const [periode, setPeriode] = useState("30d")
  const [kpi, setKpi]         = useState<KpiData>(initialKpi)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (periode === "30d") { setKpi(initialKpi); return }
    setLoading(true)
    fetch(`/api/gestion/kpi?periode=${periode}`)
      .then(r => r.json())
      .then(data => setKpi(data))
      .finally(() => setLoading(false))
  }, [periode]) // eslint-disable-line

  const now       = new Date()
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  const kpis = [
    { label: "Chiffre d'affaires",  value: fmt(kpi.kpis.ca),          icon: "fi-rr-arrow-trend-up", color: "text-forest",  bg: "bg-green-50"  },
    { label: "Bénéfice net",        value: fmt(kpi.kpis.benefice),     icon: "fi-rr-chart-histogram", color: kpi.kpis.benefice >= 0 ? "text-forest" : "text-red-600", bg: kpi.kpis.benefice >= 0 ? "bg-green-50" : "bg-red-50" },
    { label: "Charges /mois",       value: fmt(kpi.kpis.chargesMois),  icon: "fi-rr-receipt",         color: "text-gold",    bg: "bg-amber-50"  },
    { label: "Dettes en cours",     value: fmt(kpi.kpis.encours),      icon: "fi-rr-bank",            color: "text-red-600", bg: "bg-red-50"    },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-dark text-xl sm:text-2xl">{businessNom}</h1>
          <p className="font-sans text-muted text-sm mt-0.5">Tableau de bord — {monthLabel}</p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex gap-1.5 flex-wrap">
          {PERIODES.map(p => (
            <button key={p.value} onClick={() => setPeriode(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-colors ${
                periode === p.value ? "bg-terracotta text-white" : "bg-white border border-border-custom text-muted hover:bg-surface"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity ${loading ? "opacity-50" : ""}`}>
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-border-custom p-4">
            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
              <i className={`fi ${kpi.icon} ${kpi.color} text-base`} aria-hidden="true" />
            </div>
            <p className="font-sans text-xs text-muted mb-1 leading-tight">{kpi.label}</p>
            <p className={`font-display font-bold text-sm sm:text-base ${kpi.color} leading-tight`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        <DashboardCharts chartData={kpi.chartData} categories={kpi.categories} />
      </div>

      {/* Bas de page : dernières transactions + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Dernières transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border-custom p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-dark text-base">Dernières transactions</h2>
            <Link href="/gestion/transactions" className="font-sans text-xs text-terracotta hover:underline">Voir tout</Link>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-6">
              <i className="fi fi-rr-arrows-repeat text-muted/30 text-2xl block mb-2" />
              <p className="font-sans text-muted text-sm">Aucune transaction</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 py-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tx.type === "ENTREE" ? "bg-green-100" : "bg-red-100"}`}>
                    <i className={`fi ${tx.type === "ENTREE" ? "fi-rr-arrow-up text-green-600" : "fi-rr-arrow-down text-red-600"} text-xs`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-dark text-xs truncate">
                      {tx.description ?? (tx.type === "ENTREE" ? "Recette" : "Dépense")}
                    </p>
                    <p className="font-sans text-xs text-muted">
                      {fmtDate(tx.date)}{tx.category ? ` · ${tx.category.nom}` : ""}
                    </p>
                  </div>
                  <p className={`font-display font-bold text-xs shrink-0 ${tx.type === "ENTREE" ? "text-forest" : "text-red-600"}`}>
                    {tx.type === "ENTREE" ? "+" : "-"}{fmt(tx.montant)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-border-custom p-5">
          <h2 className="font-display font-bold text-dark text-base mb-3">Actions rapides</h2>
          <div className="space-y-1">
            {QUICK_ACTIONS.map(action => (
              <Link key={action.href} href={action.href}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface transition-colors group">
                <div className={`w-7 h-7 rounded-lg ${action.color} flex items-center justify-center shrink-0`}>
                  <i className={`fi ${action.icon} text-white text-xs`} aria-hidden="true" />
                </div>
                <span className="font-display font-semibold text-dark text-sm group-hover:text-terracotta transition-colors">
                  {action.label === "Analyser" ? "Analyse DaganAI" : `Ajouter ${action.label.toLowerCase()}`}
                </span>
                <i className="fi fi-rr-angle-right text-muted text-xs ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
