"use client"

import { useState, useMemo } from "react"

type Category    = { id: string; nom: string }
type Transaction = {
  id:          string
  type:        "ENTREE" | "SORTIE"
  montant:     number
  description: string | null
  date:        string
  category:    { nom: string } | null
}

function fmt(n: number) { return new Intl.NumberFormat("fr-FR").format(n) + " FCFA" }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

interface Props {
  initialTransactions: Transaction[]
  initialCategories:   Category[]
}

const INPUT = "w-full border border-border-custom rounded-xl px-4 py-2.5 font-sans text-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta bg-white"
const EMPTY_FORM = { type: "ENTREE" as "ENTREE"|"SORTIE", montant: "", description: "", date: new Date().toISOString().split("T")[0], categoryId: "" }

export default function TransactionsClient({ initialTransactions, initialCategories }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [categories]                     = useState<Category[]>(initialCategories)
  const [showForm, setShowForm]          = useState(false)
  const [filter, setFilter]              = useState<"ALL"|"ENTREE"|"SORTIE">("ALL")
  const [submitting, setSubmitting]      = useState(false)
  const [deleting, setDeleting]          = useState<string | null>(null)
  const [form, setForm]                  = useState(EMPTY_FORM)

  const filtered = useMemo(
    () => filter === "ALL" ? transactions : transactions.filter(t => t.type === filter),
    [transactions, filter]
  )
  const totalEntrees = useMemo(() => transactions.filter(t => t.type === "ENTREE").reduce((s, t) => s + t.montant, 0), [transactions])
  const totalSorties = useMemo(() => transactions.filter(t => t.type === "SORTIE").reduce((s, t) => s + t.montant, 0), [transactions])
  const solde        = totalEntrees - totalSorties

  function field<K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.montant || parseFloat(form.montant) <= 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/gestion/transactions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, montant: parseFloat(form.montant), categoryId: form.categoryId || null }),
      })
      if (!res.ok) throw new Error()
      const tx = await res.json()
      setTransactions(p => [tx, ...p])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch { alert("Erreur lors de l'enregistrement") }
    finally  { setSubmitting(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette transaction ?")) return
    setDeleting(id)
    await fetch(`/api/gestion/transactions/${id}`, { method: "DELETE" })
    setTransactions(p => p.filter(t => t.id !== id))
    setDeleting(null)
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-dark text-xl sm:text-2xl">Transactions</h1>
          <p className="font-sans text-muted text-sm mt-0.5">{transactions.length} enregistrée{transactions.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className={`flex items-center gap-2 font-display font-semibold px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-all ${
            showForm ? "bg-surface border border-border-custom text-muted" : "bg-terracotta text-white hover:bg-[#a33a0c]"
          }`}
        >
          <i className={`fi ${showForm ? "fi-rr-cross" : "fi-rr-plus"} text-sm`} />
          {showForm ? "Annuler" : "Ajouter"}
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Entrées",  value: fmt(totalEntrees), color: "text-forest" },
          { label: "Sorties",  value: fmt(totalSorties), color: "text-red-600" },
          { label: "Solde",    value: fmt(solde),         color: solde >= 0 ? "text-forest" : "text-red-600" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-border-custom p-3 sm:p-4">
            <p className="font-sans text-xs text-muted mb-1">{card.label}</p>
            <p className={`font-display font-bold text-xs sm:text-sm ${card.color} leading-tight`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-border-custom p-5 mb-4 shadow-sm animate-fade-in-up">
          <h2 className="font-display font-bold text-dark text-base mb-4">Nouvelle transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Toggle type */}
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-2">Type</label>
              <div className="flex gap-2">
                {(["ENTREE","SORTIE"] as const).map(t => (
                  <button key={t} type="button" onClick={() => field("type", t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold border transition-colors ${
                      form.type === t
                        ? t === "ENTREE" ? "bg-green-600 border-green-600 text-white" : "bg-red-600 border-red-600 text-white"
                        : "border-border-custom text-muted hover:bg-surface"
                    }`}
                  >
                    <i className={`fi ${t === "ENTREE" ? "fi-rr-arrow-up" : "fi-rr-arrow-down"} mr-1.5 text-xs`} />
                    {t === "ENTREE" ? "Entrée (recette)" : "Sortie (dépense)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Montant (FCFA)</label>
                <input type="number" min="1" step="1" required value={form.montant}
                  onChange={e => field("montant", e.target.value)} placeholder="0" className={INPUT} />
              </div>
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Date</label>
                <input type="date" required value={form.date}
                  onChange={e => field("date", e.target.value)} className={INPUT} />
              </div>
            </div>

            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Description <span className="font-normal text-muted">(optionnel)</span></label>
              <input type="text" value={form.description} onChange={e => field("description", e.target.value)}
                placeholder="ex: Vente de tissus, Achat matières premières..." className={INPUT} />
            </div>

            {categories.length > 0 && (
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Catégorie <span className="font-normal text-muted">(optionnel)</span></label>
                <select value={form.categoryId} onChange={e => field("categoryId", e.target.value)} className={INPUT}>
                  <option value="">-- Sélectionner --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full bg-terracotta text-white font-display font-semibold py-3 rounded-xl text-sm hover:bg-[#a33a0c] disabled:opacity-60 transition-colors">
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        {(["ALL","ENTREE","SORTIE"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-colors ${
              filter === f ? "bg-terracotta text-white" : "bg-white border border-border-custom text-muted hover:bg-surface"
            }`}>
            {f === "ALL" ? "Toutes" : f === "ENTREE" ? "Entrées" : "Sorties"}
          </button>
        ))}
        <span className="ml-auto font-sans text-xs text-muted self-center">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-custom p-8 text-center">
          <i className="fi fi-rr-arrows-repeat text-muted/40 text-3xl block mb-3" />
          <p className="font-sans text-muted text-sm">Aucune transaction pour l&apos;instant.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 font-display font-semibold text-sm text-terracotta hover:underline">
            Ajouter une transaction
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => (
            <div key={tx.id} className="bg-white rounded-xl border border-border-custom px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === "ENTREE" ? "bg-green-100" : "bg-red-100"}`}>
                <i className={`fi ${tx.type === "ENTREE" ? "fi-rr-arrow-up text-green-600" : "fi-rr-arrow-down text-red-600"} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-dark text-sm truncate">
                  {tx.description ?? (tx.type === "ENTREE" ? "Recette" : "Dépense")}
                </p>
                <p className="font-sans text-xs text-muted">
                  {fmtDate(tx.date)}{tx.category ? ` · ${tx.category.nom}` : ""}
                </p>
              </div>
              <p className={`font-display font-bold text-sm shrink-0 ${tx.type === "ENTREE" ? "text-forest" : "text-red-600"}`}>
                {tx.type === "ENTREE" ? "+" : "-"}{fmt(tx.montant)}
              </p>
              <button onClick={() => handleDelete(tx.id)} disabled={deleting === tx.id}
                className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-40">
                <i className="fi fi-rr-trash text-sm" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
