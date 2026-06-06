"use client"

import { useState, useEffect, useCallback } from "react"

interface ChatLogEntry {
  id:        string
  question:  string
  mode:      string
  erreur:    string | null
  success:   boolean
  latenceMs: number | null
  ip:        string | null
  createdAt: string
  user:      { id: string; name: string | null; email: string | null } | null
}

interface ApiResponse {
  logs:  ChatLogEntry[]
  total: number
  page:  number
  pages: number
}

function exportCSV(logs: ChatLogEntry[]) {
  const header = "Date,Utilisateur,Question,Mode,Succès,Latence(ms),IP,Erreur"
  const rows = logs.map(l =>
    [
      new Date(l.createdAt).toLocaleString("fr-FR"),
      l.user?.email ?? "Anonyme",
      l.question.slice(0, 100),
      l.mode,
      l.success ? "Oui" : "Non",
      l.latenceMs ?? "",
      l.ip ?? "",
      l.erreur ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  )
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a"); a.href = url; a.download = "logs-chat.csv"; a.click()
  URL.revokeObjectURL(url)
}

const MODE_LABELS: Record<string, string> = {
  rag:          "RAG",
  "claude-direct": "Claude direct",
  error:        "Erreur",
}

export default function LogsClient() {
  const [data,    setData]    = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [q,       setQ]       = useState("")
  const [statut,  setStatut]  = useState("")
  const [mode,    setMode]    = useState("")
  const [page,    setPage]    = useState(1)
  const [expand,  setExpand]  = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ q, statut, mode, page: String(page) })
    const res  = await fetch(`/api/admin/logs?${params}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [q, statut, mode, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [q, statut, mode])

  return (
    <div className="p-6 lg:p-8 space-y-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-dark text-2xl">Logs Chatbot</h1>
          <p className="font-sans text-muted text-sm mt-0.5">
            {data?.total ?? "—"} conversation{(data?.total ?? 0) > 1 ? "s" : ""} enregistrée{(data?.total ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => data && exportCSV(data.logs)}
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
            placeholder="Rechercher dans les questions…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border-custom rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors"
          />
        </div>
        <select
          value={statut}
          onChange={e => setStatut(e.target.value)}
          className="border border-border-custom rounded-xl px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="success">Succès</option>
          <option value="error">Erreurs</option>
        </select>
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          className="border border-border-custom rounded-xl px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white"
        >
          <option value="">Tous les modes</option>
          <option value="rag">RAG</option>
          <option value="claude-direct">Claude direct</option>
          <option value="error">Erreur</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.logs.length ? (
          <div className="text-center py-16">
            <i className="fi fi-rr-comment-alt text-muted text-3xl mb-3 block" />
            <p className="font-sans text-muted text-sm">Aucun log trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border-custom">
                <tr>
                  {["Date", "Utilisateur", "Question", "Mode", "Statut", "Latence", "IP", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-display font-semibold text-muted text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {data.logs.map(log => (
                  <>
                    <tr
                      key={log.id}
                      className="hover:bg-surface/50 transition-colors cursor-pointer"
                      onClick={() => setExpand(expand === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-3 font-sans text-xs text-muted whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 font-sans text-xs text-dark">
                        {log.user?.email ?? <span className="text-muted italic">Anonyme</span>}
                      </td>
                      <td className="px-4 py-3 font-sans text-sm text-dark max-w-[200px]">
                        <span className="block truncate">{log.question}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sans text-xs bg-surface px-2 py-0.5 rounded-full text-muted">
                          {MODE_LABELS[log.mode] ?? log.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-semibold ${
                          log.success
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}>
                          <i className={`fi ${log.success ? "fi-rr-check" : "fi-rr-cross"} text-[10px]`} />
                          {log.success ? "OK" : "Erreur"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans text-xs text-muted whitespace-nowrap">
                        {log.latenceMs ? `${log.latenceMs} ms` : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{log.ip ?? "—"}</td>
                      <td className="px-4 py-3">
                        <i className={`fi ${expand === log.id ? "fi-rr-angle-up" : "fi-rr-angle-down"} text-muted text-xs`} />
                      </td>
                    </tr>

                    {expand === log.id && (
                      <tr key={log.id + "-expand"} className="bg-surface/30">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="space-y-2">
                            <p className="font-display font-semibold text-dark text-sm">Question complète :</p>
                            <p className="font-sans text-sm text-dark bg-white rounded-xl border border-border-custom p-3 leading-relaxed">
                              {log.question}
                            </p>
                            {log.erreur && (
                              <>
                                <p className="font-display font-semibold text-red-600 text-sm mt-2">Erreur :</p>
                                <p className="font-mono text-xs text-red-600 bg-red-50 rounded-xl border border-red-200 p-3">
                                  {log.erreur}
                                </p>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
