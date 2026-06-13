"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Document {
  id:         string
  titre:      string
  domaine:    string
  sousDomaine:string | null
  source:     string
  version:    string
  actif:      boolean
  createdAt:  string
  _count:     { chunks: number }
}

const DOMAINES = ["OHADA", "OTR", "FINANCEMENT"] as const
type Domaine = typeof DOMAINES[number]

const DOMAINE_COLORS: Record<string, string> = {
  OHADA:       "bg-terracotta/10 text-terracotta",
  OTR:         "bg-blue-100 text-blue-700",
  FINANCEMENT: "bg-green-100 text-green-700",
}

// ─── Sous-composant : badge domaine ──────────────────────────────────────────

function DomaineBadge({ d }: { d: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-display font-semibold ${DOMAINE_COLORS[d] ?? "bg-surface text-muted"}`}>
      {d}
    </span>
  )
}

// ─── Sous-composant : modal édition ──────────────────────────────────────────

function EditModal({ doc, onClose, onSaved }: {
  doc:     Document
  onClose: () => void
  onSaved: (updated: Document) => void
}) {
  const [form, setForm] = useState({
    titre:       doc.titre,
    domaine:     doc.domaine as Domaine,
    sousDomaine: doc.sousDomaine ?? "",
    source:      doc.source,
    version:     doc.version,
    actif:       doc.actif,
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState("")

  async function handleSave() {
    setSaving(true); setError("")
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erreur"); return }
      onSaved({ ...doc, ...form, sousDomaine: form.sousDomaine || null })
    } catch {
      setError("Erreur réseau")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-border-custom shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
          <p className="font-display font-bold text-dark text-base">Modifier le document</p>
          <button onClick={onClose} className="text-muted hover:text-dark transition-colors">
            <i className="fi fi-rr-cross text-sm" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
              <i className="fi fi-rr-exclamation text-sm" />
              {error}
            </div>
          )}

          <div>
            <label className="block font-display font-semibold text-dark text-sm mb-1.5">Titre</label>
            <input
              value={form.titre}
              onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
              className="w-full border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Domaine</label>
              <select
                value={form.domaine}
                onChange={e => setForm(f => ({ ...f, domaine: e.target.value as Domaine }))}
                className="w-full border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
              >
                {DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Version</label>
              <input
                value={form.version}
                onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                className="w-full border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
              />
            </div>
          </div>

          <div>
            <label className="block font-display font-semibold text-dark text-sm mb-1.5">Sous-domaine <span className="text-muted font-normal">(optionnel)</span></label>
            <input
              value={form.sousDomaine}
              onChange={e => setForm(f => ({ ...f, sousDomaine: e.target.value }))}
              placeholder="ex : Droit commercial, Impôt sur le revenu…"
              className="w-full border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
            />
          </div>

          <div>
            <label className="block font-display font-semibold text-dark text-sm mb-1.5">Source</label>
            <input
              value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              className="w-full border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setForm(f => ({ ...f, actif: !f.actif }))}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${form.actif ? "bg-green-500" : "bg-border-custom"}`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${form.actif ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="font-sans text-sm text-dark">Document actif (visible par le RAG)</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-custom">
          <button onClick={onClose} className="font-display text-sm text-muted hover:text-dark px-4 py-2 transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.titre.trim()}
            className="flex items-center gap-2 bg-terracotta text-white font-display font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#a33a0c] transition-colors disabled:opacity-60"
          >
            {saving ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="fi fi-rr-check text-sm" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function BaseConnaissanceClient() {

  // ── État ──────────────────────────────────────────────────────────────────
  const [docs,        setDocs]        = useState<Document[]>([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState<"list" | "add">("list")
  const [editDoc,     setEditDoc]     = useState<Document | null>(null)
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const [deleting,    setDeleting]    = useState(false)
  const [deleteErr,   setDeleteErr]   = useState("")
  const [searchQ,     setSearchQ]     = useState("")
  const [filterD,     setFilterD]     = useState<string>("ALL")

  // ── Formulaire d'ajout ─────────────────────────────────────────────────────
  const [addMode,     setAddMode]     = useState<"file" | "url">("file")
  const [dragActive,  setDragActive]  = useState(false)
  const [files,       setFiles]       = useState<File[]>([])
  const [urlInput,    setUrlInput]    = useState("")
  const [addForm,     setAddForm]     = useState({ domaine: "OHADA" as Domaine, titre: "", source: "", version: "1.0" })
  const [ingesting,   setIngesting]   = useState(false)
  const [ingestErr,   setIngestErr]   = useState("")
  const [ingestOk,    setIngestOk]    = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Chargement docs ────────────────────────────────────────────────────────
  const loadDocs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/documents")
      const data = await res.json()
      setDocs(data.documents ?? [])
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDocs() }, [loadDocs])

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragActive(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      [".pdf", ".txt", ".md"].some(ext => f.name.toLowerCase().endsWith(ext))
    )
    if (dropped.length) {
      setFiles(dropped)
      if (!addForm.titre && dropped[0]) setAddForm(f => ({ ...f, titre: dropped[0].name.replace(/\.[^.]+$/, "") }))
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length) {
      setFiles(selected)
      if (!addForm.titre && selected[0]) setAddForm(f => ({ ...f, titre: selected[0].name.replace(/\.[^.]+$/, "") }))
    }
  }

  // ── Ingestion ──────────────────────────────────────────────────────────────
  async function handleIngest() {
    setIngestErr(""); setIngestOk(false)

    if (!addForm.titre.trim())   { setIngestErr("Le titre est requis.");  return }
    if (!addForm.source.trim())  { setIngestErr("La source est requise."); return }
    if (addMode === "file" && !files.length) { setIngestErr("Sélectionnez au moins un fichier."); return }
    if (addMode === "url"  && !urlInput.trim()) { setIngestErr("Entrez une URL valide."); return }

    setIngesting(true)

    const filesToProcess = addMode === "file" ? files : [null]

    for (let i = 0; i < filesToProcess.length; i++) {
      const formData = new FormData()
      formData.append("domaine",  addForm.domaine)
      formData.append("titre",    filesToProcess.length > 1
        ? `${addForm.titre} (${i + 1}/${filesToProcess.length})`
        : addForm.titre)
      formData.append("source",  addForm.source)
      formData.append("version", addForm.version)

      if (addMode === "file" && filesToProcess[i]) {
        formData.append("file", filesToProcess[i]!)
      } else {
        formData.append("url", urlInput.trim())
      }

      try {
        const res  = await fetch("/api/admin/documents", { method: "POST", body: formData })
        const data = await res.json().catch(() => ({ error: `Erreur serveur (HTTP ${res.status}) — consultez les logs Vercel` }))
        if (!res.ok) { setIngestErr(data.error ?? "Erreur inconnue."); setIngesting(false); return }
      } catch (err) {
        setIngestErr(err instanceof Error ? err.message : "Erreur réseau inattendue.")
        setIngesting(false); return
      }
    }

    setIngestOk(true)
    setFiles([]); setUrlInput(""); setAddForm({ domaine: "OHADA", titre: "", source: "", version: "1.0" })
    if (fileInputRef.current) fileInputRef.current.value = ""
    await loadDocs()
    setTimeout(() => { setTab("list"); setIngestOk(false) }, 1500)
    setIngesting(false)
  }

  // ── Suppression ────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    setDeleteErr("")
    try {
      const res = await fetch(`/api/admin/documents/${deleteId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setDeleteErr(data.error ?? "Erreur lors de la suppression.")
        return
      }
      setDocs(d => d.filter(x => x.id !== deleteId))
      setDeleteId(null)
    } catch {
      setDeleteErr("Erreur réseau. Vérifiez votre connexion.")
    } finally {
      setDeleting(false)
    }
  }

  // ── Filtrage ───────────────────────────────────────────────────────────────
  const filtered = docs.filter(d => {
    const matchD = filterD === "ALL" || d.domaine === filterD
    const q = searchQ.toLowerCase()
    const matchQ = !q || d.titre.toLowerCase().includes(q) || d.source.toLowerCase().includes(q)
    return matchD && matchQ
  })

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalChunks = docs.reduce((s, d) => s + d._count.chunks, 0)
  const actifCount  = docs.filter(d => d.actif).length

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-dark text-2xl">Base de connaissances</h1>
          <p className="font-sans text-muted text-sm mt-0.5">
            {docs.length} document{docs.length !== 1 ? "s" : ""} — {totalChunks.toLocaleString("fr-FR")} chunks — {actifCount} actif{actifCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-colors ${tab === "list" ? "bg-dark text-white" : "bg-white border border-border-custom text-muted hover:text-dark"}`}
          >
            <i className="fi fi-rr-list text-sm" />
            Documents
          </button>
          <button
            onClick={() => { setTab("add"); setIngestOk(false); setIngestErr("") }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-colors ${tab === "add" ? "bg-terracotta text-white" : "bg-white border border-border-custom text-muted hover:text-dark"}`}
          >
            <i className="fi fi-rr-plus text-sm" />
            Ajouter
          </button>
        </div>
      </div>

      {/* ── Onglet LISTE ──────────────────────────────────────────────────── */}
      {tab === "list" && (
        <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">

          {/* Barre de recherche + filtres */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border-custom">
            <div className="relative flex-1">
              <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
              <input
                placeholder="Rechercher par titre ou source…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm font-sans border border-border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
              />
            </div>
            <select
              value={filterD}
              onChange={e => setFilterD(e.target.value)}
              className="border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
            >
              <option value="ALL">Tous les domaines</option>
              {DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Tableau */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
              <p className="font-sans text-sm text-muted">Chargement…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                <i className="fi fi-rr-document text-muted text-xl" />
              </div>
              <p className="font-display font-semibold text-dark text-sm">Aucun document trouvé</p>
              <p className="font-sans text-muted text-xs">
                {docs.length === 0 ? "Commencez par ajouter un document." : "Modifiez vos filtres."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-custom bg-surface">
                    <th className="text-left font-display font-semibold text-muted text-xs px-4 py-3 uppercase tracking-wide">Titre</th>
                    <th className="text-left font-display font-semibold text-muted text-xs px-4 py-3 uppercase tracking-wide">Domaine</th>
                    <th className="text-left font-display font-semibold text-muted text-xs px-4 py-3 uppercase tracking-wide hidden md:table-cell">Source</th>
                    <th className="text-center font-display font-semibold text-muted text-xs px-4 py-3 uppercase tracking-wide">Chunks</th>
                    <th className="text-center font-display font-semibold text-muted text-xs px-4 py-3 uppercase tracking-wide hidden sm:table-cell">Statut</th>
                    <th className="text-right font-display font-semibold text-muted text-xs px-4 py-3 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom">
                  {filtered.map(doc => (
                    <tr key={doc.id} className="hover:bg-surface/50 transition-colors group">
                      <td className="px-4 py-3">
                        <p className="font-display font-semibold text-dark text-sm truncate max-w-[240px]">{doc.titre}</p>
                        <p className="font-sans text-muted text-xs mt-0.5">v{doc.version} — {new Date(doc.createdAt).toLocaleDateString("fr-FR")}</p>
                      </td>
                      <td className="px-4 py-3">
                        <DomaineBadge d={doc.domaine} />
                        {doc.sousDomaine && <p className="font-sans text-muted text-xs mt-1 truncate max-w-[120px]">{doc.sousDomaine}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="font-sans text-muted text-xs truncate max-w-[180px]">{doc.source}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-display font-bold text-dark text-sm">{doc._count.chunks.toLocaleString("fr-FR")}</span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-display font-semibold ${doc.actif ? "bg-green-100 text-green-700" : "bg-surface text-muted"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${doc.actif ? "bg-green-500" : "bg-muted"}`} />
                          {doc.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditDoc(doc)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-dark hover:bg-surface transition-colors"
                            title="Modifier"
                          >
                            <i className="fi fi-rr-edit text-sm" />
                          </button>
                          <button
                            onClick={() => setDeleteId(doc.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <i className="fi fi-rr-trash text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Onglet AJOUT ──────────────────────────────────────────────────── */}
      {tab === "add" && (
        <div className="max-w-2xl space-y-5">

          {/* Toggle fichier / URL */}
          <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border-custom w-fit">
            {(["file", "url"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setAddMode(m); setFiles([]); setUrlInput(""); setIngestErr("") }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-semibold transition-colors ${addMode === m ? "bg-white text-dark shadow-sm" : "text-muted hover:text-dark"}`}
              >
                <i className={`fi ${m === "file" ? "fi-rr-file-upload" : "fi-rr-link"} text-sm`} />
                {m === "file" ? "Fichier(s)" : "Lien URL"}
              </button>
            ))}
          </div>

          {/* Zone dépôt fichier */}
          {addMode === "file" && (
            <div
              onDragEnter={e => { e.preventDefault(); setDragActive(true) }}
              onDragOver={e  => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={e => { e.preventDefault(); setDragActive(false) }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl px-8 py-10 cursor-pointer transition-all ${
                dragActive ? "border-terracotta bg-terracotta/5" : "border-border-custom hover:border-terracotta/50 hover:bg-surface"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md"
                className="sr-only"
                onChange={handleFileChange}
              />
              {files.length > 0 ? (
                <>
                  <div className="flex flex-col items-center gap-2">
                    {files.map(f => (
                      <div key={f.name} className="flex items-center gap-2 bg-white border border-border-custom rounded-xl px-4 py-2 text-sm">
                        <i className={`fi ${f.name.endsWith(".pdf") ? "fi-rr-file-pdf" : "fi-rr-file-alt"} text-terracotta text-base`} />
                        <span className="font-sans text-dark font-medium truncate max-w-[300px]">{f.name}</span>
                        <span className="font-sans text-muted text-xs ml-1">({(f.size / 1024).toFixed(0)} Ko)</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setFiles([]); if (fileInputRef.current) fileInputRef.current.value = "" }}
                    className="font-sans text-xs text-muted hover:text-red-500 transition-colors"
                  >
                    Retirer
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-terracotta/10 flex items-center justify-center">
                    <i className="fi fi-rr-file-upload text-terracotta text-2xl" />
                  </div>
                  <div className="text-center">
                    <p className="font-display font-semibold text-dark text-sm">Glissez vos fichiers ici</p>
                    <p className="font-sans text-muted text-xs mt-1">ou cliquez pour sélectionner</p>
                    <p className="font-sans text-muted text-xs mt-2 bg-surface/80 px-3 py-1 rounded-full inline-block">PDF · TXT · MD</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Champ URL */}
          {addMode === "url" && (
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">URL du document</label>
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://exemple.com/document.pdf"
                className="w-full border border-border-custom rounded-xl px-4 py-3 text-sm font-sans text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
              />
              <p className="font-sans text-muted text-xs mt-1.5">PDF direct, page web ou document texte. Le contenu sera automatiquement extrait.</p>
            </div>
          )}

          {/* Champs métadonnées */}
          <div className="bg-white rounded-2xl border border-border-custom p-5 space-y-4">
            <p className="font-display font-semibold text-dark text-sm">Informations du document</p>

            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Titre <span className="text-terracotta">*</span></label>
              <input
                value={addForm.titre}
                onChange={e => setAddForm(f => ({ ...f, titre: e.target.value }))}
                placeholder="Acte Uniforme sur le Droit Commercial Général"
                className="w-full border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Domaine <span className="text-terracotta">*</span></label>
                <select
                  value={addForm.domaine}
                  onChange={e => setAddForm(f => ({ ...f, domaine: e.target.value as Domaine }))}
                  className="w-full border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                >
                  {DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Version</label>
                <input
                  value={addForm.version}
                  onChange={e => setAddForm(f => ({ ...f, version: e.target.value }))}
                  placeholder="1.0"
                  className="w-full border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                />
              </div>
            </div>

            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Source <span className="text-terracotta">*</span></label>
              <input
                value={addForm.source}
                onChange={e => setAddForm(f => ({ ...f, source: e.target.value }))}
                placeholder="ohada.com, otr.tg, …"
                className="w-full border border-border-custom rounded-xl px-3 py-2.5 text-sm font-sans text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
              />
            </div>
          </div>

          {/* Feedback */}
          {ingestErr && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <i className="fi fi-rr-exclamation text-red-500 text-sm mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-red-700">{ingestErr}</p>
            </div>
          )}
          {ingestOk && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <i className="fi fi-rr-check text-green-600 text-sm shrink-0" />
              <p className="font-sans text-sm text-green-700 font-semibold">Document ingéré avec succès !</p>
            </div>
          )}

          {/* Bouton */}
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="flex items-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3 rounded-xl hover:bg-[#a33a0c] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {ingesting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ingestion en cours… (peut prendre 30–60 s)
              </>
            ) : (
              <>
                <i className="fi fi-rr-database text-sm" />
                Ingérer dans la base
              </>
            )}
          </button>
          <p className="font-sans text-xs text-muted">L&apos;ingestion génère les embeddings OpenAI pour chaque chunk du document. Les documents volumineux peuvent prendre jusqu&apos;à 60 secondes.</p>
        </div>
      )}

      {/* ── Modal édition ──────────────────────────────────────────────────── */}
      {editDoc && (
        <EditModal
          doc={editDoc}
          onClose={() => setEditDoc(null)}
          onSaved={updated => {
            setDocs(d => d.map(x => x.id === updated.id ? { ...x, ...updated } : x))
            setEditDoc(null)
          }}
        />
      )}

      {/* ── Confirm suppression ────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setDeleteId(null); setDeleteErr("") }}>
          <div className="bg-white rounded-2xl border border-border-custom shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <i className="fi fi-rr-trash text-red-600 text-base" />
              </div>
              <div>
                <p className="font-display font-bold text-dark text-sm">Supprimer ce document ?</p>
                <p className="font-sans text-muted text-xs mt-0.5">Tous les chunks associés seront supprimés. Action irréversible.</p>
              </div>
            </div>
            {deleteErr && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2 mb-3">
                <i className="fi fi-rr-exclamation text-xs shrink-0" />
                {deleteErr}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setDeleteId(null); setDeleteErr("") }} className="font-display text-sm text-muted hover:text-dark px-4 py-2 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-600 text-white font-display font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="fi fi-rr-trash text-sm" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
