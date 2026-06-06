"use client"

import { useState, useMemo } from "react"

type Debt = {
  id:             string
  description:    string
  creancier:      string
  montant:        number
  montantRestant: number
  dateEcheance:   string | null
  statut:         "EN_COURS" | "REMBOURSE" | "EN_RETARD"
}

function fmt(n: number)    { return new Intl.NumberFormat("fr-FR").format(n) + " FCFA" }
function fmtDate(d: string){ return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) }

const INPUT = "w-full border border-border-custom rounded-xl px-4 py-2.5 font-sans text-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta bg-white"
const EMPTY = { description: "", creancier: "", montant: "", montantRestant: "", dateEcheance: "", statut: "EN_COURS" as Debt["statut"] }

const STATUT_CONFIG: Record<Debt["statut"], { label: string; color: string; bg: string }> = {
  EN_COURS:   { label: "En cours",     color: "text-amber-700",  bg: "bg-amber-100"  },
  EN_RETARD:  { label: "En retard",    color: "text-red-700",    bg: "bg-red-100"    },
  REMBOURSE:  { label: "Remboursé",    color: "text-green-700",  bg: "bg-green-100"  },
}

interface Props { initialDebts: Debt[] }

export default function DettesClient({ initialDebts }: Props) {
  const [debts, setDebts]           = useState<Debt[]>(initialDebts)
  const [showForm, setShowForm]     = useState(false)
  const [showPay, setShowPay]       = useState<string | null>(null)
  const [payAmount, setPayAmount]   = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [form, setForm]             = useState(EMPTY)

  const totalEncours = useMemo(() => debts.filter(d => d.statut !== "REMBOURSE").reduce((s, d) => s + d.montantRestant, 0), [debts])
  const totalInitial = useMemo(() => debts.filter(d => d.statut !== "REMBOURSE").reduce((s, d) => s + d.montant, 0), [debts])
  const totalRembourse = useMemo(() => debts.reduce((s, d) => s + (d.montant - d.montantRestant), 0), [debts])

  function field<K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim() || !form.creancier.trim() || parseFloat(form.montant) <= 0) return
    setSubmitting(true)
    try {
      const montant = parseFloat(form.montant)
      const res = await fetch("/api/gestion/dettes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          montant,
          montantRestant: form.montantRestant ? parseFloat(form.montantRestant) : montant,
          dateEcheance:   form.dateEcheance || null,
        }),
      })
      if (!res.ok) throw new Error()
      const debt = await res.json()
      setDebts(p => [debt, ...p])
      setForm(EMPTY)
      setShowForm(false)
    } catch { alert("Erreur lors de l'enregistrement") }
    finally  { setSubmitting(false) }
  }

  async function handlePayment(debt: Debt) {
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0 || amount > debt.montantRestant) return
    const newRestant = debt.montantRestant - amount
    const newStatut  = newRestant <= 0 ? "REMBOURSE" : debt.statut
    const res = await fetch(`/api/gestion/dettes/${debt.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ montantRestant: Math.max(0, newRestant), statut: newStatut }),
    })
    if (res.ok) {
      const updated = await res.json()
      setDebts(p => p.map(d => d.id === debt.id ? updated : d))
      setShowPay(null)
      setPayAmount("")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette dette ?")) return
    setDeleting(id)
    await fetch(`/api/gestion/dettes/${id}`, { method: "DELETE" })
    setDebts(p => p.filter(d => d.id !== id))
    setDeleting(null)
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-dark text-xl sm:text-2xl">Dettes</h1>
          <p className="font-sans text-muted text-sm mt-0.5">{debts.filter(d => d.statut !== "REMBOURSE").length} encours</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className={`flex items-center gap-2 font-display font-semibold px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-all ${
            showForm ? "bg-surface border border-border-custom text-muted" : "bg-terracotta text-white hover:bg-[#a33a0c]"
          }`}>
          <i className={`fi ${showForm ? "fi-rr-cross" : "fi-rr-plus"} text-sm`} />
          {showForm ? "Annuler" : "Ajouter"}
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Encours",     value: fmt(totalEncours),   color: "text-red-600"   },
          { label: "Remboursé",   value: fmt(totalRembourse), color: "text-forest"    },
          { label: "Total initial",value: fmt(totalInitial),  color: "text-dark"      },
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
          <h2 className="font-display font-bold text-dark text-base mb-4">Nouvelle dette</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Description</label>
                <input type="text" required value={form.description} onChange={e => field("description", e.target.value)}
                  placeholder="ex: Prêt FAIEJ, Crédit fournisseur..." className={INPUT} />
              </div>
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Créancier</label>
                <input type="text" required value={form.creancier} onChange={e => field("creancier", e.target.value)}
                  placeholder="ex: Banque, Mme Koffi..." className={INPUT} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Montant total (FCFA)</label>
                <input type="number" min="1" step="1" required value={form.montant}
                  onChange={e => field("montant", e.target.value)} placeholder="0" className={INPUT} />
              </div>
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Restant dû <span className="font-normal text-muted">(si partiel)</span></label>
                <input type="number" min="0" step="1" value={form.montantRestant}
                  onChange={e => field("montantRestant", e.target.value)} placeholder="= montant total" className={INPUT} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Échéance <span className="font-normal text-muted">(optionnel)</span></label>
                <input type="date" value={form.dateEcheance} onChange={e => field("dateEcheance", e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Statut</label>
                <select value={form.statut} onChange={e => field("statut", e.target.value as Debt["statut"])} className={INPUT}>
                  <option value="EN_COURS">En cours</option>
                  <option value="EN_RETARD">En retard</option>
                  <option value="REMBOURSE">Remboursé</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-terracotta text-white font-display font-semibold py-3 rounded-xl text-sm hover:bg-[#a33a0c] disabled:opacity-60 transition-colors">
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>
      )}

      {/* Liste */}
      {debts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-custom p-8 text-center">
          <i className="fi fi-rr-bank text-muted/40 text-3xl block mb-3" />
          <p className="font-sans text-muted text-sm">Aucune dette enregistrée.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 font-display font-semibold text-sm text-terracotta hover:underline">
            Ajouter une dette
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map(debt => {
            const pct = debt.montant > 0 ? ((debt.montant - debt.montantRestant) / debt.montant * 100) : 0
            const cfg = STATUT_CONFIG[debt.statut]
            return (
              <div key={debt.id} className="bg-white rounded-xl border border-border-custom p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fi fi-rr-bank text-red-600 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-dark text-sm">{debt.description}</p>
                      <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="font-sans text-xs text-muted">{debt.creancier}{debt.dateEcheance ? ` · échéance ${fmtDate(debt.dateEcheance)}` : ""}</p>
                  </div>
                  <button onClick={() => handleDelete(debt.id)} disabled={deleting === debt.id}
                    className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-40">
                    <i className="fi fi-rr-trash text-sm" />
                  </button>
                </div>

                {/* Barre de progression */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-sans mb-1">
                    <span className="text-muted">Remboursé : {fmt(debt.montant - debt.montantRestant)}</span>
                    <span className="text-dark font-medium">Restant : {fmt(debt.montantRestant)}</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2">
                    <div className="bg-terracotta h-2 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <p className="text-xs text-muted text-right mt-0.5">{pct.toFixed(0)}% remboursé</p>
                </div>

                {/* Paiement partiel */}
                {debt.statut !== "REMBOURSE" && (
                  showPay === debt.id ? (
                    <div className="flex gap-2">
                      <input type="number" min="1" max={debt.montantRestant} step="1" value={payAmount}
                        onChange={e => setPayAmount(e.target.value)} placeholder="Montant payé (FCFA)"
                        className="flex-1 border border-border-custom rounded-xl px-3 py-2 font-sans text-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta" />
                      <button onClick={() => handlePayment(debt)}
                        className="px-4 py-2 bg-forest text-white font-display font-semibold text-xs rounded-xl hover:bg-[#245a3f] transition-colors">
                        Valider
                      </button>
                      <button onClick={() => { setShowPay(null); setPayAmount("") }}
                        className="px-3 py-2 border border-border-custom text-muted rounded-xl text-xs hover:bg-surface transition-colors">
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowPay(debt.id)}
                      className="flex items-center gap-1.5 font-display font-semibold text-xs text-terracotta hover:underline">
                      <i className="fi fi-rr-coins text-xs" />
                      Enregistrer un paiement
                    </button>
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
