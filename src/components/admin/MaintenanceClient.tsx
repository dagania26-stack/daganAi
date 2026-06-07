"use client"

import { useState, useEffect, useCallback } from "react"

interface Settings {
  id:                 string
  maintenanceMode:    boolean
  maintenanceMessage: string | null
  updatedAt:          string
}

const TEXTAREA = "w-full border border-border-custom rounded-xl px-4 py-2.5 font-sans text-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta bg-white resize-none"

export default function MaintenanceClient() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading]   = useState(true)
  const [message, setMessage]   = useState("")
  const [saving, setSaving]     = useState(false)
  const [toggling, setToggling] = useState(false)
  const [toast, setToast]       = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/admin/maintenance")
      const json = await res.json()
      setSettings(json)
      setMessage(json.maintenanceMessage ?? "")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleMode() {
    if (!settings) return
    setToggling(true)
    try {
      const res = await fetch("/api/admin/maintenance", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ maintenanceMode: !settings.maintenanceMode }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setSettings(updated)
      showToast(updated.maintenanceMode ? "Mode maintenance activé" : "Mode maintenance désactivé")
    } catch { showToast("Erreur lors de la mise à jour") }
    finally  { setToggling(false) }
  }

  async function saveMessage(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/maintenance", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ maintenanceMessage: message }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setSettings(updated)
      showToast("Message enregistré")
    } catch { showToast("Erreur lors de l'enregistrement") }
    finally  { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-6 lg:p-8">
        <p className="font-sans text-red-500 text-sm">Impossible de charger les paramètres.</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-2xl">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-dark text-white font-sans text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-dark text-2xl">Maintenance</h1>
        <p className="font-sans text-muted text-sm mt-0.5">
          Mettez le site en pause pour les visiteurs pendant une mise à jour
        </p>
      </div>

      {/* Bascule */}
      <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          settings.maintenanceMode ? "bg-terracotta/10" : "bg-surface"
        }`}>
          <i className={`fi fi-rr-settings text-lg ${settings.maintenanceMode ? "text-terracotta" : "text-muted"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-dark text-sm">
            Mode maintenance {settings.maintenanceMode ? "activé" : "désactivé"}
          </p>
          <p className="font-sans text-muted text-xs mt-0.5">
            {settings.maintenanceMode
              ? "Les visiteurs voient la page de maintenance. Les administrateurs gardent l'accès complet."
              : "Le site est accessible normalement à tous les visiteurs."}
          </p>
        </div>
        <button
          onClick={toggleMode}
          disabled={toggling}
          aria-pressed={settings.maintenanceMode}
          aria-label="Activer ou désactiver le mode maintenance"
          className={`relative shrink-0 w-14 h-8 rounded-full transition-colors disabled:opacity-50 ${
            settings.maintenanceMode ? "bg-terracotta" : "bg-border-custom"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
              settings.maintenanceMode ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {settings.maintenanceMode && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <i className="fi fi-rr-triangle-warning mt-0.5 text-amber-600" />
          <p className="font-sans text-sm text-amber-700">
            Le site est actuellement inaccessible aux visiteurs non-administrateurs. Pensez à désactiver le mode maintenance une fois la mise à jour terminée.
          </p>
        </div>
      )}

      {/* Message visiteurs */}
      <form onSubmit={saveMessage} className="bg-white rounded-2xl border border-border-custom p-5 space-y-3">
        <div>
          <h2 className="font-display font-semibold text-dark text-sm">Message affiché aux visiteurs</h2>
          <p className="font-sans text-muted text-xs mt-0.5">
            Laissez vide pour utiliser le message par défaut
          </p>
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder="Nous effectuons actuellement une mise à jour pour améliorer votre expérience. Le site sera de nouveau disponible très bientôt. Merci de votre patience."
          className={TEXTAREA}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-terracotta text-white font-display font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#a33a0c] active:scale-95 transition-all disabled:opacity-50"
          >
            <i className="fi fi-rr-disk text-sm" />
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>

    </div>
  )
}
