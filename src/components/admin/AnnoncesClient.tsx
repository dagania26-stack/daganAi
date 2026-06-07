"use client"

import { useState, useEffect, useCallback } from "react"
import ConfirmDialog from "@/components/gestion/ConfirmDialog"

type Level = "INFO" | "SUCCESS" | "WARNING"

interface Announcement {
  id:        string
  title:     string
  message:   string
  level:     Level
  active:    boolean
  createdAt: string
  author:    { id: string; name: string | null; email: string | null } | null
}

const LEVEL_CONFIG: Record<Level, { label: string; icon: string; color: string }> = {
  INFO:    { label: "Info",          icon: "fi-rr-info",             color: "bg-blue-100 text-blue-700"   },
  SUCCESS: { label: "Bonne nouvelle", icon: "fi-rr-badge-check",      color: "bg-green-100 text-green-700" },
  WARNING: { label: "Attention",     icon: "fi-rr-triangle-warning", color: "bg-amber-100 text-amber-700" },
}

const INPUT = "w-full border border-border-custom rounded-xl px-4 py-2.5 font-sans text-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta bg-white"
const EMPTY = { title: "", message: "", level: "INFO" as Level }

export default function AnnoncesClient() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [toggling, setToggling]   = useState<string | null>(null)
  const [delTarget, setDelTarget] = useState<Announcement | null>(null)
  const [deleting, setDeleting]   = useState(false)
  const [toast, setToast]         = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch("/api/admin/annonces")
    const json = await res.json()
    setAnnouncements(json.announcements ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/annonces", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setAnnouncements(prev => [created, ...prev])
      setForm(EMPTY)
      setShowForm(false)
      showToast("Annonce publiée")
    } catch { showToast("Erreur lors de la publication") }
    finally  { setSubmitting(false) }
  }

  async function toggleActive(a: Announcement) {
    setToggling(a.id)
    try {
      const res = await fetch(`/api/admin/annonces/${a.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ active: !a.active }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setAnnouncements(prev => prev.map(x => x.id === a.id ? updated : x))
    } catch { showToast("Erreur lors de la mise à jour") }
    finally  { setToggling(null) }
  }

  async function handleDelete() {
    if (!delTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/annonces/${delTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setAnnouncements(prev => prev.filter(x => x.id !== delTarget.id))
      showToast("Annonce supprimée")
    } catch { showToast("Erreur lors de la suppression") }
    finally  { setDeleting(false); setDelTarget(null) }
  }

  return (
    <div className="p-6 lg:p-8 space-y-5">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-dark text-white font-sans text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <ConfirmDialog
        open={!!delTarget}
        title="Supprimer cette annonce ?"
        message={delTarget ? `« ${delTarget.title} » sera définitivement supprimée et ne sera plus visible des utilisateurs.` : ""}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDelTarget(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-dark text-2xl">Annonces</h1>
          <p className="font-sans text-muted text-sm mt-0.5">
            Messages diffusés aux utilisateurs depuis leur tableau de bord
          </p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className={`flex items-center gap-2 font-display font-semibold px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-all ${
            showForm ? "bg-surface border border-border-custom text-muted" : "bg-terracotta text-white hover:bg-[#a33a0c]"
          }`}>
          <i className={`fi ${showForm ? "fi-rr-cross" : "fi-rr-plus"} text-sm`} />
          {showForm ? "Annuler" : "Nouvelle annonce"}
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-border-custom p-5 shadow-sm animate-fade-in-up">
          <h2 className="font-display font-bold text-dark text-base mb-4">Nouvelle annonce</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Titre</label>
              <input type="text" required value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="ex: Nouvelle fonctionnalité disponible" className={INPUT} />
            </div>
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Message</label>
              <textarea required rows={3} value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Décrivez l'annonce destinée aux utilisatrices…" className={`${INPUT} resize-none`} />
            </div>
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-2">Type</label>
              <div className="flex gap-2">
                {(Object.keys(LEVEL_CONFIG) as Level[]).map(lvl => (
                  <button key={lvl} type="button" onClick={() => setForm(f => ({ ...f, level: lvl }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-display font-semibold border transition-colors ${
                      form.level === lvl ? "bg-terracotta/10 border-terracotta text-terracotta" : "border-border-custom text-muted hover:bg-surface"
                    }`}>
                    <i className={`fi ${LEVEL_CONFIG[lvl].icon} text-sm`} />
                    {LEVEL_CONFIG[lvl].label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-terracotta text-white font-display font-semibold py-3 rounded-xl text-sm hover:bg-[#a33a0c] disabled:opacity-60 transition-colors">
              {submitting ? "Publication…" : "Publier l'annonce"}
            </button>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-custom p-8 text-center">
          <i className="fi fi-rr-megaphone text-muted/40 text-3xl block mb-3" />
          <p className="font-sans text-muted text-sm">Aucune annonce publiée pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {announcements.map(a => {
            const cfg = LEVEL_CONFIG[a.level]
            return (
              <div key={a.id} className={`bg-white rounded-2xl border border-border-custom p-4 sm:p-5 ${!a.active ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <i className={`fi ${cfg.icon} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold text-dark text-sm">{a.title}</p>
                      <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-md ${cfg.color}`}>{cfg.label}</span>
                      {!a.active && (
                        <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-md bg-surface text-muted">Masquée</span>
                      )}
                    </div>
                    <p className="font-sans text-muted text-sm mt-1 leading-relaxed">{a.message}</p>
                    <p className="font-sans text-xs text-muted/70 mt-2">
                      {a.author?.name ?? a.author?.email ?? "Admin"} · {new Date(a.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(a)} disabled={toggling === a.id}
                      title={a.active ? "Masquer aux utilisateurs" : "Diffuser aux utilisateurs"}
                      className="p-2 text-muted hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors disabled:opacity-40">
                      <i className={`fi ${a.active ? "fi-rr-eye" : "fi-rr-eye-crossed"} text-sm`} />
                    </button>
                    <button onClick={() => setDelTarget(a)}
                      className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <i className="fi fi-rr-trash text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
