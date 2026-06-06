"use client"

import { useState } from "react"

interface Props {
  business: {
    nom: string
    secteur: string | null
    pays: string
    devise: string
    rapportFrequence: string | null
  }
  userEmail: string
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

const PAYS = [
  { value: "TG", label: "Togo" },
  { value: "BJ", label: "Bénin" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "SN", label: "Sénégal" },
  { value: "ML", label: "Mali" },
  { value: "CM", label: "Cameroun" },
]

const FREQUENCES = [
  { value: "",        label: "Désactivé",        desc: "Aucun envoi automatique"                    },
  { value: "HEBDO",   label: "Chaque lundi",      desc: "Résumé de la semaine écoulée"               },
  { value: "MENSUEL", label: "1er de chaque mois", desc: "Rapport complet du mois précédent"          },
]

export default function ParametresClient({ business, userEmail }: Props) {
  const [form, setForm] = useState({
    nom:              business.nom,
    secteur:          business.secteur ?? "",
    pays:             business.pays,
    devise:           business.devise,
    rapportFrequence: business.rapportFrequence ?? "",
  })
  const [status, setStatus] = useState<SaveStatus>("idle")

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    setStatus("idle")
  }

  async function save() {
    setStatus("saving")
    try {
      const res = await fetch("/api/gestion/parametres", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 3000)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-dark text-xl">Paramètres</h1>
        <p className="font-sans text-muted text-sm mt-0.5">Configuration de votre entreprise et préférences</p>
      </div>

      {/* Infos entreprise */}
      <div className="bg-white border border-border-custom rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
          <i className="fi fi-rr-building text-terracotta text-base" />
          <p className="font-display font-bold text-dark text-base">Mon entreprise</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-sans text-xs text-muted block mb-1.5">Nom de l&apos;entreprise</label>
            <input value={form.nom} onChange={e => set("nom", e.target.value)}
              className="w-full border border-border-custom rounded-xl px-3.5 py-2.5 font-sans text-sm text-dark focus:outline-none focus:border-terracotta transition-colors bg-white"
              placeholder="Nom de votre activité" />
          </div>

          <div>
            <label className="font-sans text-xs text-muted block mb-1.5">Secteur d&apos;activité</label>
            <input value={form.secteur} onChange={e => set("secteur", e.target.value)}
              className="w-full border border-border-custom rounded-xl px-3.5 py-2.5 font-sans text-sm text-dark focus:outline-none focus:border-terracotta transition-colors bg-white"
              placeholder="ex. Commerce, Beauté, Agriculture…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-xs text-muted block mb-1.5">Pays</label>
              <select value={form.pays} onChange={e => set("pays", e.target.value)}
                className="w-full border border-border-custom rounded-xl px-3.5 py-2.5 font-sans text-sm text-dark focus:outline-none focus:border-terracotta transition-colors bg-white">
                {PAYS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-sans text-xs text-muted block mb-1.5">Devise</label>
              <select value={form.devise} onChange={e => set("devise", e.target.value)}
                className="w-full border border-border-custom rounded-xl px-3.5 py-2.5 font-sans text-sm text-dark focus:outline-none focus:border-terracotta transition-colors bg-white">
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GHS">GHS</option>
                <option value="NGN">NGN</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Email & rapports programmés */}
      <div className="bg-white border border-border-custom rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
          <i className="fi fi-rr-envelope text-terracotta text-base" />
          <p className="font-display font-bold text-dark text-base">Rapports par email</p>
        </div>

        <div className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3">
          <i className="fi fi-rr-user text-muted text-sm" />
          <div>
            <p className="font-sans text-xs text-muted">Email de réception</p>
            <p className="font-display font-semibold text-dark text-sm">{userEmail}</p>
          </div>
        </div>

        <div>
          <label className="font-sans text-xs text-muted block mb-2.5">Fréquence d&apos;envoi automatique</label>
          <div className="space-y-2">
            {FREQUENCES.map(f => (
              <button key={f.value} type="button" onClick={() => set("rapportFrequence", f.value)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-colors text-left ${
                  form.rapportFrequence === f.value
                    ? "border-terracotta bg-terracotta/5"
                    : "border-border-custom hover:bg-surface"
                }`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  form.rapportFrequence === f.value ? "border-terracotta" : "border-muted/40"
                }`}>
                  {form.rapportFrequence === f.value && (
                    <div className="w-2 h-2 rounded-full bg-terracotta" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-display font-semibold text-sm ${form.rapportFrequence === f.value ? "text-terracotta" : "text-dark"}`}>
                    {f.label}
                  </p>
                  <p className="font-sans text-xs text-muted">{f.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {form.rapportFrequence && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <i className="fi fi-rr-info text-amber-600 text-sm mt-0.5 shrink-0" />
            <p className="font-sans text-xs text-amber-800 leading-relaxed">
              {form.rapportFrequence === "HEBDO"
                ? "Un résumé sera envoyé chaque lundi matin à votre adresse email."
                : "Un rapport complet sera envoyé le 1er de chaque mois à votre adresse email."
              }
            </p>
          </div>
        )}
      </div>

      {/* Compte */}
      <div className="bg-white border border-border-custom rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
          <i className="fi fi-rr-shield-check text-terracotta text-base" />
          <p className="font-display font-bold text-dark text-base">Compte</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-semibold text-dark text-sm">Email de connexion</p>
            <p className="font-sans text-xs text-muted">{userEmail}</p>
          </div>
          <span className="text-xs font-display font-semibold text-forest bg-green-50 px-2.5 py-1 rounded-full">Vérifié</span>
        </div>
      </div>

      {/* Bouton sauvegarder */}
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={status === "saving"}
          className="flex items-center gap-2 px-5 py-3 bg-terracotta text-white rounded-xl font-display font-semibold text-sm hover:bg-terracotta/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          <i className={`fi ${status === "saving" ? "fi-rr-spinner animate-spin" : status === "saved" ? "fi-rr-check" : "fi-rr-disk"} text-base`} />
          {status === "saving" ? "Enregistrement…" : status === "saved" ? "Enregistré !" : "Sauvegarder"}
        </button>
        {status === "error" && (
          <p className="font-sans text-xs text-red-600">Erreur lors de l&apos;enregistrement.</p>
        )}
      </div>
    </div>
  )
}
