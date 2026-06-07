"use client"

import { useState, useEffect, useCallback } from "react"
import ConfirmDialog from "@/components/gestion/ConfirmDialog"

type Level   = "INFO" | "SUCCESS" | "WARNING"
type Segment = "ALL" | "ACTIVE" | "INACTIVE" | "DORMANT"

interface Announcement {
  id:            string
  title:         string
  message:       string
  level:         Level
  active:        boolean
  targetSegment: Segment
  createdAt:     string
  author:        { id: string; name: string | null; email: string | null } | null
}

const LEVEL_CONFIG: Record<Level, { label: string; icon: string; color: string }> = {
  INFO:    { label: "Info",          icon: "fi-rr-info",             color: "bg-blue-100 text-blue-700"   },
  SUCCESS: { label: "Bonne nouvelle", icon: "fi-rr-badge-check",      color: "bg-green-100 text-green-700" },
  WARNING: { label: "Attention",     icon: "fi-rr-triangle-warning", color: "bg-amber-100 text-amber-700" },
}

const SEGMENT_CONFIG: Record<Segment, { label: string; icon: string; description: string }> = {
  ALL:      { label: "Tous les utilisateurs", icon: "fi-rr-users",        description: "Diffuser à l'ensemble de la base utilisateurs" },
  ACTIVE:   { label: "Clients actifs",        icon: "fi-rr-bolt",          description: "Connectés au cours des 7 derniers jours" },
  INACTIVE: { label: "Clients inactifs",      icon: "fi-rr-clock",         description: "Dernière connexion entre 8 et 30 jours" },
  DORMANT:  { label: "Clients dormants",      icon: "fi-rr-moon",          description: "Plus de 30 jours sans connexion, ou jamais connectés" },
}

const INPUT = "w-full border border-border-custom rounded-xl px-4 py-2.5 font-sans text-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta bg-white"
const EMPTY = { title: "", message: "", level: "INFO" as Level }

export default function AnnoncesClient() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Announcement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]             = useState(EMPTY)
  const [suspending, setSuspending] = useState<string | null>(null)
  const [viewing, setViewing]       = useState<Announcement | null>(null)
  const [sendTarget, setSendTarget] = useState<Announcement | null>(null)
  const [sendSegment, setSendSegment] = useState<Segment>("ALL")
  const [sending, setSending]       = useState(false)
  const [delTarget, setDelTarget]   = useState<Announcement | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [toast, setToast]           = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch("/api/admin/annonces")
    const json = await res.json()
    setAnnouncements(json.announcements ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  function openEdit(a: Announcement) {
    setEditing(a)
    setForm({ title: a.title, message: a.message, level: a.level })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    setSubmitting(true)
    try {
      const url    = editing ? `/api/admin/annonces/${editing.id}` : "/api/admin/annonces"
      const method = editing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      if (editing) {
        setAnnouncements(prev => prev.map(x => x.id === saved.id ? saved : x))
        showToast("Annonce modifiée")
      } else {
        setAnnouncements(prev => [saved, ...prev])
        showToast("Brouillon créé — utilisez « Envoyer » pour choisir l'audience et diffuser")
      }
      closeForm()
    } catch { showToast("Erreur lors de l'enregistrement") }
    finally  { setSubmitting(false) }
  }

  function openSend(a: Announcement) {
    setSendTarget(a)
    setSendSegment(a.targetSegment)
  }

  async function handleSend() {
    if (!sendTarget) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/annonces/${sendTarget.id}/envoyer`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ targetSegment: sendSegment }),
      })
      if (!res.ok) throw new Error()
      const result = await res.json()
      setAnnouncements(prev => prev.map(x => x.id === result.announcement.id ? result.announcement : x))
      showToast(
        result.total > 0
          ? `Annonce envoyée à ${SEGMENT_CONFIG[sendSegment].label.toLowerCase()} — ${result.sent}/${result.total} email${result.total > 1 ? "s" : ""} délivré${result.sent > 1 ? "s" : ""}${result.failed > 0 ? `, ${result.failed} échec${result.failed > 1 ? "s" : ""}` : ""}`
          : `Annonce diffusée — aucun destinataire avec adresse email dans ce segment`
      )
      setSendTarget(null)
    } catch { showToast("Erreur lors de l'envoi") }
    finally  { setSending(false) }
  }

  async function suspend(a: Announcement) {
    setSuspending(a.id)
    try {
      const res = await fetch(`/api/admin/annonces/${a.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ active: false }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setAnnouncements(prev => prev.map(x => x.id === a.id ? updated : x))
      showToast("Diffusion suspendue")
    } catch { showToast("Erreur lors de la mise à jour") }
    finally  { setSuspending(null) }
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
        <div className="fixed top-4 right-4 z-50 bg-dark text-white font-sans text-sm px-4 py-3 rounded-xl shadow-lg max-w-sm">
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

      {/* Modale Voir */}
      {viewing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl border border-border-custom shadow-xl w-full max-w-lg p-5 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${LEVEL_CONFIG[viewing.level].color}`}>
                <i className={`fi ${LEVEL_CONFIG[viewing.level].icon} text-base`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-dark text-base">{viewing.title}</p>
                <p className="font-sans text-muted text-xs mt-0.5">
                  {viewing.author?.name ?? viewing.author?.email ?? "Admin"} · {new Date(viewing.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button onClick={() => setViewing(null)} className="p-2 text-muted hover:text-dark hover:bg-surface rounded-lg transition-colors shrink-0">
                <i className="fi fi-rr-cross text-sm" />
              </button>
            </div>
            <p className="font-sans text-dark text-sm leading-relaxed whitespace-pre-wrap mb-4">{viewing.message}</p>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-display font-semibold px-2.5 py-1 rounded-lg ${LEVEL_CONFIG[viewing.level].color}`}>
                <i className={`fi ${LEVEL_CONFIG[viewing.level].icon} text-xs`} />
                {LEVEL_CONFIG[viewing.level].label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-display font-semibold px-2.5 py-1 rounded-lg bg-surface text-dark">
                <i className={`fi ${SEGMENT_CONFIG[viewing.targetSegment].icon} text-xs`} />
                {SEGMENT_CONFIG[viewing.targetSegment].label}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-display font-semibold px-2.5 py-1 rounded-lg ${
                viewing.active ? "bg-green-100 text-green-700" : "bg-surface text-muted"
              }`}>
                <i className={`fi ${viewing.active ? "fi-rr-paper-plane" : "fi-rr-file-edit"} text-xs`} />
                {viewing.active ? "Diffusée" : "Brouillon"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modale Envoyer — sélection de l'audience */}
      {sendTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm" onClick={() => !sending && setSendTarget(null)}>
          <div className="bg-white rounded-2xl border border-border-custom shadow-xl w-full max-w-md p-5 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center shrink-0">
                <i className="fi fi-rr-paper-plane text-terracotta text-base" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-dark text-base">Envoyer « {sendTarget.title} »</p>
                <p className="font-sans text-muted text-sm mt-0.5">
                  Choisissez le type de clients à cibler — l&apos;annonce sera publiée dans leur tableau de bord et envoyée par email
                </p>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              {(Object.keys(SEGMENT_CONFIG) as Segment[]).map(seg => (
                <button key={seg} type="button" onClick={() => setSendSegment(seg)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                    sendSegment === seg ? "border-terracotta bg-terracotta/5" : "border-border-custom hover:bg-surface"
                  }`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    sendSegment === seg ? "bg-terracotta text-white" : "bg-surface text-muted"
                  }`}>
                    <i className={`fi ${SEGMENT_CONFIG[seg].icon} text-sm`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-display font-semibold text-sm ${sendSegment === seg ? "text-terracotta" : "text-dark"}`}>{SEGMENT_CONFIG[seg].label}</p>
                    <p className="font-sans text-muted text-xs mt-0.5">{SEGMENT_CONFIG[seg].description}</p>
                  </div>
                  {sendSegment === seg && <i className="fi fi-rr-check ml-auto text-terracotta text-sm shrink-0" />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSendTarget(null)} disabled={sending}
                className="flex-1 py-2.5 rounded-xl border border-border-custom text-muted font-display font-semibold text-sm hover:bg-surface disabled:opacity-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleSend} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-terracotta text-white font-display font-semibold text-sm hover:bg-[#a33a0c] disabled:opacity-60 transition-colors">
                <i className="fi fi-rr-paper-plane text-sm" />
                {sending ? "Envoi en cours…" : "Envoyer (in-app + email)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-dark text-2xl">Annonces</h1>
          <p className="font-sans text-muted text-sm mt-0.5">
            Messages diffusés aux utilisateurs depuis leur tableau de bord
          </p>
        </div>
        <button onClick={() => showForm ? closeForm() : openCreate()}
          className={`flex items-center gap-2 font-display font-semibold px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-all ${
            showForm ? "bg-surface border border-border-custom text-muted" : "bg-terracotta text-white hover:bg-[#a33a0c]"
          }`}>
          <i className={`fi ${showForm ? "fi-rr-cross" : "fi-rr-plus"} text-sm`} />
          {showForm ? "Annuler" : "Nouvelle annonce"}
        </button>
      </div>

      {/* Formulaire (création / édition) */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-border-custom p-5 shadow-sm animate-fade-in-up">
          <h2 className="font-display font-bold text-dark text-base mb-4">{editing ? "Modifier l'annonce" : "Nouvelle annonce"}</h2>
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
              {submitting ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Créer le brouillon"}
            </button>
            {!editing && (
              <p className="font-sans text-muted text-xs text-center">
                L&apos;annonce sera créée en brouillon — utilisez « Envoyer » pour choisir l&apos;audience et la diffuser
              </p>
            )}
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
            const seg = SEGMENT_CONFIG[a.targetSegment]
            return (
              <div key={a.id} className={`bg-white rounded-2xl border border-border-custom p-4 sm:p-5 ${!a.active ? "opacity-70" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <i className={`fi ${cfg.icon} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold text-dark text-sm">{a.title}</p>
                      <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-md ${cfg.color}`}>{cfg.label}</span>
                      <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                        a.active ? "bg-green-100 text-green-700" : "bg-surface text-muted"
                      }`}>
                        <i className={`fi ${a.active ? "fi-rr-paper-plane" : "fi-rr-file-edit"} text-[10px]`} />
                        {a.active ? "Diffusée" : "Brouillon"}
                      </span>
                      <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-md bg-surface text-muted inline-flex items-center gap-1">
                        <i className={`fi ${seg.icon} text-[10px]`} />
                        {seg.label}
                      </span>
                    </div>
                    <p className="font-sans text-muted text-sm mt-1.5 leading-relaxed line-clamp-2">{a.message}</p>
                    <p className="font-sans text-xs text-muted/70 mt-2">
                      {a.author?.name ?? a.author?.email ?? "Admin"} · {new Date(a.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setViewing(a)} title="Voir le détail"
                      className="p-2 text-muted hover:text-dark hover:bg-surface rounded-lg transition-colors">
                      <i className="fi fi-rr-eye text-sm" />
                    </button>
                    <button onClick={() => openEdit(a)} title="Modifier"
                      className="p-2 text-muted hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors">
                      <i className="fi fi-rr-edit text-sm" />
                    </button>
                    {a.active ? (
                      <button onClick={() => suspend(a)} disabled={suspending === a.id} title="Suspendre la diffusion"
                        className="p-2 text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40">
                        <i className="fi fi-rr-pause-circle text-sm" />
                      </button>
                    ) : (
                      <button onClick={() => openSend(a)} title="Envoyer aux utilisateurs"
                        className="p-2 text-muted hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors">
                        <i className="fi fi-rr-paper-plane text-sm" />
                      </button>
                    )}
                    <button onClick={() => setDelTarget(a)} title="Supprimer"
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
