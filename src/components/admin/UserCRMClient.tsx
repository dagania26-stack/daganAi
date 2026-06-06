"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id:            string
  name:          string | null
  email:         string | null
  role:          "USER" | "ADMIN"
  pays:          string | null
  ville:         string | null
  lastLogin:     string | null
  lastIp:        string | null
  createdAt:     string
  emailVerified: string | null
  _count:        { businesses: number; chatLogs: number }
}

interface ApiResponse {
  users:  User[]
  total:  number
  page:   number
  pages:  number
}

type EditModal = { user: User; name: string; role: "USER" | "ADMIN"; pays: string; ville: string } | null

function avatar(user: User) {
  const initial = (user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0">
      <span className="font-display font-bold text-terracotta text-xs">{initial}</span>
    </div>
  )
}

function exportCSV(users: User[]) {
  const header = "ID,Nom,Email,Rôle,Pays,Ville,Créé,Dernière connexion"
  const rows = users.map(u =>
    [u.id, u.name ?? "", u.email ?? "", u.role, u.pays ?? "", u.ville ?? "",
     new Date(u.createdAt).toLocaleDateString("fr-FR"),
     u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("fr-FR") : "Jamais"
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  )
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a"); a.href = url; a.download = "utilisateurs.csv"; a.click()
  URL.revokeObjectURL(url)
}

export default function UserCRMClient() {
  const [data,    setData]    = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [q,       setQ]       = useState("")
  const [role,    setRole]    = useState("")
  const [pays,    setPays]    = useState("")
  const [page,    setPage]    = useState(1)
  const [edit,    setEdit]    = useState<EditModal>(null)
  const [delId,   setDelId]   = useState<string | null>(null)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ q, role, pays, page: String(page) })
    const res  = await fetch(`/api/admin/users?${params}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [q, role, pays, page])

  useEffect(() => { load() }, [load])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [q, role, pays])

  async function handleSave() {
    if (!edit) return
    setSaving(true)
    const res = await fetch(`/api/admin/users/${edit.user.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: edit.name, role: edit.role, pays: edit.pays, ville: edit.ville }),
    })
    setSaving(false)
    if (res.ok) { setEdit(null); showToast("Utilisateur mis à jour"); load() }
    else showToast("Erreur lors de la sauvegarde")
  }

  async function handleDelete() {
    if (!delId) return
    setSaving(true)
    const res = await fetch(`/api/admin/users/${delId}`, { method: "DELETE" })
    setSaving(false)
    if (res.ok) { setDelId(null); showToast("Utilisateur supprimé"); load() }
    else showToast("Erreur lors de la suppression")
  }

  return (
    <div className="p-6 lg:p-8 space-y-5">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-dark text-white font-sans text-sm px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-dark text-2xl">Utilisateurs</h1>
          <p className="font-sans text-muted text-sm mt-0.5">
            {data?.total ?? "—"} utilisateur{(data?.total ?? 0) > 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => data && exportCSV(data.users)}
            className="flex items-center gap-2 border border-border-custom rounded-xl px-4 py-2 font-display font-semibold text-sm text-dark hover:bg-surface transition-colors"
          >
            <i className="fi fi-rr-file-csv text-base" />
            Exporter
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-border-custom rounded-xl px-4 py-2 font-display font-semibold text-sm text-dark hover:bg-surface transition-colors"
          >
            <i className="fi fi-rr-print text-base" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
          <input
            type="text"
            placeholder="Rechercher par email ou nom…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border-custom rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors"
          />
        </div>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border border-border-custom rounded-xl px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
        >
          <option value="">Tous les rôles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <input
          type="text"
          placeholder="Pays…"
          value={pays}
          onChange={e => setPays(e.target.value)}
          className="w-32 border border-border-custom rounded-xl px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.users.length ? (
          <div className="text-center py-16">
            <i className="fi fi-rr-users text-muted text-3xl mb-3 block" />
            <p className="font-sans text-muted text-sm">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border-custom">
                <tr>
                  {["Utilisateur", "Rôle", "Pays", "Conversations", "Créé", "Dernière connexion", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-display font-semibold text-muted text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {data.users.map(user => (
                  <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {avatar(user)}
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-dark text-sm truncate max-w-[160px]">
                            {user.name ?? "—"}
                          </p>
                          <p className="font-sans text-muted text-xs truncate max-w-[160px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-terracotta/10 text-terracotta"
                          : "bg-surface text-muted"
                      }`}>
                        <i className={`fi ${user.role === "ADMIN" ? "fi-rr-crown" : "fi-rr-user"} text-[10px]`} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-dark">{user.pays ?? "—"}</td>
                    <td className="px-4 py-3 font-sans text-sm text-dark text-center">{user._count.chatLogs}</td>
                    <td className="px-4 py-3 font-sans text-xs text-muted whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-muted whitespace-nowrap">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fr-FR") : "Jamais"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEdit({ user, name: user.name ?? "", role: user.role, pays: user.pays ?? "", ville: user.ville ?? "" })}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors text-muted hover:text-dark"
                          title="Modifier"
                        >
                          <i className="fi fi-rr-pencil text-sm" />
                        </button>
                        <button
                          onClick={() => setDelId(user.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted hover:text-red-500"
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

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-custom">
            <p className="font-sans text-xs text-muted">
              Page {data.page} sur {data.pages} — {data.total} résultats
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-custom disabled:opacity-40 hover:bg-surface transition-colors"
              >
                <i className="fi fi-rr-angle-left text-xs" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-custom disabled:opacity-40 hover:bg-surface transition-colors"
              >
                <i className="fi fi-rr-angle-right text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal édition */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-display font-bold text-dark text-lg mb-5">Modifier l&apos;utilisateur</h2>

            {[
              { label: "Nom",   key: "name"  as const, type: "text" },
              { label: "Pays",  key: "pays"  as const, type: "text" },
              { label: "Ville", key: "ville" as const, type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} className="mb-4">
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">{label}</label>
                <input
                  type={type}
                  value={edit[key]}
                  onChange={e => setEdit(prev => prev ? { ...prev, [key]: e.target.value } : null)}
                  className="w-full border border-border-custom rounded-xl px-4 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                />
              </div>
            ))}

            <div className="mb-5">
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Rôle</label>
              <select
                value={edit.role}
                onChange={e => setEdit(prev => prev ? { ...prev, role: e.target.value as "USER" | "ADMIN" } : null)}
                className="w-full border border-border-custom rounded-xl px-4 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEdit(null)}
                className="px-4 py-2.5 rounded-xl font-display font-semibold text-sm border border-border-custom hover:bg-surface transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl font-display font-semibold text-sm bg-terracotta text-white hover:bg-[#a33a0c] transition-colors disabled:opacity-60"
              >
                {saving ? "Sauvegarde…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fi fi-rr-trash text-red-500 text-xl" />
            </div>
            <h2 className="font-display font-bold text-dark text-lg mb-2">Supprimer cet utilisateur ?</h2>
            <p className="font-sans text-muted text-sm mb-5">Cette action est irréversible. Toutes ses données seront effacées.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDelId(null)}
                className="px-5 py-2.5 rounded-xl font-display font-semibold text-sm border border-border-custom hover:bg-surface transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-display font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {saving ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
