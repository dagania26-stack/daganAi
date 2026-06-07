"use client"

import { useState, useMemo } from "react"
import Pagination from "./Pagination"

const PER_PAGE = 10

type Charge = {
  id:        string
  nom:       string
  montant:   number
  type:      "FIXE" | "VARIABLE"
  frequence: "MENSUEL" | "HEBDO" | "ANNUEL"
  actif:     boolean
}

function fmt(n: number) { return new Intl.NumberFormat("fr-FR").format(n) + " FCFA" }

const INPUT   = "w-full border border-border-custom rounded-xl px-4 py-2.5 font-sans text-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta bg-white"
const EMPTY   = { nom: "", montant: "", type: "FIXE" as "FIXE"|"VARIABLE", frequence: "MENSUEL" as "MENSUEL"|"HEBDO"|"ANNUEL" }

const FREQ_LABELS: Record<string, string> = { MENSUEL: "/mois", HEBDO: "/semaine", ANNUEL: "/an" }

function toMonthly(montant: number, frequence: string) {
  if (frequence === "MENSUEL") return montant
  if (frequence === "ANNUEL")  return montant / 12
  if (frequence === "HEBDO")   return montant * 4.33
  return montant
}

interface Props { initialCharges: Charge[] }

export default function ChargesClient({ initialCharges }: Props) {
  const [charges, setCharges]     = useState<Charge[]>(initialCharges)
  const [showForm, setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [form, setForm]           = useState(EMPTY)
  const [pages, setPages]         = useState<Record<string, number>>({ FIXE: 1, VARIABLE: 1 })

  const totalFixe     = useMemo(() => charges.filter(c => c.actif && c.type === "FIXE").reduce((s, c) => s + toMonthly(c.montant, c.frequence), 0), [charges])
  const totalVariable = useMemo(() => charges.filter(c => c.actif && c.type === "VARIABLE").reduce((s, c) => s + toMonthly(c.montant, c.frequence), 0), [charges])

  function field<K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim() || !form.montant || parseFloat(form.montant) <= 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/gestion/charges", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, montant: parseFloat(form.montant) }),
      })
      if (!res.ok) throw new Error()
      const charge = await res.json()
      setCharges(p => [charge, ...p])
      setForm(EMPTY)
      setShowForm(false)
    } catch { alert("Erreur lors de l'enregistrement") }
    finally  { setSubmitting(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette charge ?")) return
    setDeleting(id)
    await fetch(`/api/gestion/charges/${id}`, { method: "DELETE" })
    setCharges(p => p.filter(c => c.id !== id))
    setDeleting(null)
  }

  async function toggleActif(charge: Charge) {
    const updated = { ...charge, actif: !charge.actif }
    setCharges(p => p.map(c => c.id === charge.id ? updated : c))
    await fetch(`/api/gestion/charges/${charge.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ actif: !charge.actif }),
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-dark text-xl sm:text-2xl">Charges</h1>
          <p className="font-sans text-muted text-sm mt-0.5">{charges.filter(c => c.actif).length} active{charges.filter(c => c.actif).length !== 1 ? "s" : ""}</p>
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
          { label: "Charges fixes /mois",    value: fmt(totalFixe),              color: "text-gold"      },
          { label: "Charges variables /mois", value: fmt(totalVariable),          color: "text-orange-600"},
          { label: "Total /mois",             value: fmt(totalFixe+totalVariable), color: "text-dark"      },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-border-custom p-3 sm:p-4">
            <p className="font-sans text-xs text-muted mb-1 leading-tight">{card.label}</p>
            <p className={`font-display font-bold text-xs sm:text-sm ${card.color} leading-tight`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-border-custom p-5 mb-4 shadow-sm animate-fade-in-up">
          <h2 className="font-display font-bold text-dark text-base mb-4">Nouvelle charge</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Nom de la charge</label>
              <input type="text" required value={form.nom} onChange={e => field("nom", e.target.value)}
                placeholder="ex: Loyer, Électricité, Salaires..." className={INPUT} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Montant (FCFA)</label>
                <input type="number" min="1" step="1" required value={form.montant}
                  onChange={e => field("montant", e.target.value)} placeholder="0" className={INPUT} />
              </div>
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Fréquence</label>
                <select value={form.frequence} onChange={e => field("frequence", e.target.value as "MENSUEL"|"HEBDO"|"ANNUEL")} className={INPUT}>
                  <option value="MENSUEL">Mensuelle</option>
                  <option value="HEBDO">Hebdomadaire</option>
                  <option value="ANNUEL">Annuelle</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-2">Type</label>
              <div className="flex gap-2">
                {(["FIXE","VARIABLE"] as const).map(t => (
                  <button key={t} type="button" onClick={() => field("type", t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold border transition-colors ${
                      form.type === t ? "bg-terracotta/10 border-terracotta text-terracotta" : "border-border-custom text-muted hover:bg-surface"
                    }`}>
                    {t === "FIXE" ? "Fixe (invariable)" : "Variable (fluctue)"}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-terracotta text-white font-display font-semibold py-3 rounded-xl text-sm hover:bg-[#a33a0c] disabled:opacity-60 transition-colors">
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>
      )}

      {/* Listes séparées par type */}
      {charges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-custom p-8 text-center">
          <i className="fi fi-rr-receipt text-muted/40 text-3xl block mb-3" />
          <p className="font-sans text-muted text-sm">Aucune charge enregistrée.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 font-display font-semibold text-sm text-terracotta hover:underline">
            Ajouter une charge
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {["FIXE","VARIABLE"].map(type => {
            const group = charges.filter(c => c.type === type)
            if (!group.length) return null
            const pageCount   = Math.max(1, Math.ceil(group.length / PER_PAGE))
            const currentPage = Math.min(pages[type] ?? 1, pageCount)
            const paginated   = group.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
            return (
              <div key={type}>
                <p className="font-display font-semibold text-xs text-muted uppercase tracking-wider mb-2 px-1">
                  {type === "FIXE" ? "Charges fixes" : "Charges variables"}
                </p>
                <div className="space-y-2 mb-2">
                  {paginated.map(charge => (
                    <div key={charge.id} className={`bg-white rounded-xl border border-border-custom px-4 py-3 flex items-center gap-3 ${!charge.actif ? "opacity-50" : ""}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${charge.type === "FIXE" ? "bg-amber-100" : "bg-orange-100"}`}>
                        <i className={`fi fi-rr-receipt text-sm ${charge.type === "FIXE" ? "text-amber-600" : "text-orange-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-dark text-sm truncate">{charge.nom}</p>
                        <p className="font-sans text-xs text-muted">{fmt(charge.montant)}{FREQ_LABELS[charge.frequence]}</p>
                      </div>
                      <p className="font-display font-bold text-sm text-dark shrink-0">
                        {fmt(toMonthly(charge.montant, charge.frequence))}<span className="font-normal text-muted text-xs">/mois</span>
                      </p>
                      <button onClick={() => toggleActif(charge)} title={charge.actif ? "Désactiver" : "Activer"}
                        className="p-1.5 text-muted hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors shrink-0">
                        <i className={`fi ${charge.actif ? "fi-rr-eye" : "fi-rr-eye-crossed"} text-sm`} />
                      </button>
                      <button onClick={() => handleDelete(charge.id)} disabled={deleting === charge.id}
                        className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-40">
                        <i className="fi fi-rr-trash text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <Pagination
                    page={currentPage}
                    total={group.length}
                    perPage={PER_PAGE}
                    onChange={p => setPages(prev => ({ ...prev, [type]: p }))}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
