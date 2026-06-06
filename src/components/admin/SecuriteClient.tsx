"use client"

import { useState, useEffect, useCallback } from "react"

interface SecurityEvent {
  id:        string
  type:      string
  ip:        string | null
  userId:    string | null
  details:   string | null
  createdAt: string
  user:      { id: string; name: string | null; email: string | null } | null
}

interface ApiResponse {
  events: SecurityEvent[]
  total:  number
  page:   number
  pages:  number
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  RATE_LIMIT: { label: "Rate Limit",    icon: "fi-rr-time-fast",    color: "bg-yellow-100 text-yellow-700" },
  FAILED_AUTH: { label: "Auth échouée", icon: "fi-rr-lock",          color: "bg-red-100 text-red-600"      },
  SUSPICIOUS:  { label: "Suspect",      icon: "fi-rr-bug",           color: "bg-orange-100 text-orange-600"},
  BRUTE_FORCE: { label: "Brute Force",  icon: "fi-rr-shield-exclamation", color: "bg-red-100 text-red-700" },
}

function exportCSV(events: SecurityEvent[]) {
  const header = "Date,Type,IP,Utilisateur,Détails"
  const rows = events.map(e =>
    [
      new Date(e.createdAt).toLocaleString("fr-FR"),
      e.type,
      e.ip ?? "",
      e.user?.email ?? "",
      e.details ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  )
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a"); a.href = url; a.download = "securite.csv"; a.click()
  URL.revokeObjectURL(url)
}

export default function SecuriteClient() {
  const [data,    setData]    = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [type,    setType]    = useState("")
  const [ip,      setIp]      = useState("")
  const [page,    setPage]    = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ type, ip, page: String(page) })
    const res  = await fetch(`/api/admin/securite?${params}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [type, ip, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [type, ip])

  // Compteurs par type
  const counts = data?.events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  return (
    <div className="p-6 lg:p-8 space-y-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-dark text-2xl">Sécurité</h1>
          <p className="font-sans text-muted text-sm mt-0.5">
            {data?.total ?? "—"} événement{(data?.total ?? 0) > 1 ? "s" : ""} enregistré{(data?.total ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => data && exportCSV(data.events)}
            className="flex items-center gap-2 border border-border-custom rounded-xl px-4 py-2 font-display font-semibold text-sm text-dark hover:bg-surface transition-colors">
            <i className="fi fi-rr-file-csv text-base" />
            Exporter
          </button>
          <button onClick={() => { setType(""); setIp(""); setPage(1); load() }}
            className="flex items-center gap-2 border border-border-custom rounded-xl px-4 py-2 font-display font-semibold text-sm text-dark hover:bg-surface transition-colors">
            <i className="fi fi-rr-refresh text-base" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Résumé par type */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setType(type === key ? "" : key)}
            className={`text-left bg-white rounded-2xl border p-4 transition-all ${type === key ? "border-terracotta ring-2 ring-terracotta/20" : "border-border-custom hover:border-terracotta/30"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.color.replace("text-", "").replace("bg-", "bg-").split(" ")[0]}`}>
                <i className={`fi ${cfg.icon} text-sm ${cfg.color.split(" ")[1]}`} />
              </div>
              <span className={`text-xs font-display font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                {counts[key] ?? 0}
              </span>
            </div>
            <p className="font-display font-semibold text-dark text-sm">{cfg.label}</p>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
          <input
            type="text"
            placeholder="Filtrer par IP…"
            value={ip}
            onChange={e => setIp(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border-custom rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors"
          />
        </div>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="border border-border-custom rounded-xl px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.events.length ? (
          <div className="text-center py-16">
            <i className="fi fi-rr-shield-check text-muted text-3xl mb-3 block" />
            <p className="font-sans text-muted text-sm">Aucun événement de sécurité</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border-custom">
                <tr>
                  {["Date", "Type", "IP", "Utilisateur", "Détails"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-display font-semibold text-muted text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {data.events.map(evt => {
                  const cfg = TYPE_CONFIG[evt.type] ?? { label: evt.type, icon: "fi-rr-info", color: "bg-surface text-muted" }
                  return (
                    <tr key={evt.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3 font-sans text-xs text-muted whitespace-nowrap">
                        {new Date(evt.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-semibold ${cfg.color}`}>
                          <i className={`fi ${cfg.icon} text-[10px]`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-dark">{evt.ip ?? "—"}</td>
                      <td className="px-4 py-3 font-sans text-xs text-muted">
                        {evt.user?.email ?? (evt.userId ? `ID: ${evt.userId.slice(0, 8)}…` : "—")}
                      </td>
                      <td className="px-4 py-3 font-sans text-xs text-muted max-w-[300px]">
                        <span className="block truncate">{evt.details ?? "—"}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-custom">
            <p className="font-sans text-xs text-muted">Page {data.page} sur {data.pages} — {data.total} résultats</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-custom disabled:opacity-40 hover:bg-surface transition-colors">
                <i className="fi fi-rr-angle-left text-xs" />
              </button>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-custom disabled:opacity-40 hover:bg-surface transition-colors">
                <i className="fi fi-rr-angle-right text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
