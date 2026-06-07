"use client"

import { useState, useEffect, useCallback } from "react"

type Status = "ok" | "degraded" | "critical"

interface SanteData {
  status:    Status
  checkedAt: string
  db:        { status: "ok" | "error"; latencyMs: number }
  rag:       "configured" | "not_configured"
  uptime:    number
  chat: {
    total1h: number; failed1h: number; errorRate1h: number
    total24h: number; failed24h: number; errorRate24h: number
    avgLatencyMs: number
  }
  security: {
    rateLimited1h: number
    byType24h: { type: string; count: number }[]
    recent: { id: string; type: string; ip: string | null; details: string | null; createdAt: string }[]
  }
  alerts: { level: "warning" | "critical"; message: string }[]
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; dot: string }> = {
  ok:       { label: "Tout fonctionne normalement", color: "text-green-700 bg-green-100", dot: "bg-green-500"  },
  degraded: { label: "Dégradé — surveillance recommandée", color: "text-amber-700 bg-amber-100", dot: "bg-amber-500" },
  critical: { label: "Critique — intervention requise", color: "text-red-700 bg-red-100", dot: "bg-red-500"   },
}

const TYPE_LABELS: Record<string, string> = {
  RATE_LIMIT:  "Rate Limit",
  FAILED_AUTH: "Auth échouée",
  SUSPICIOUS:  "Suspect",
  BRUTE_FORCE: "Brute Force",
}

function fmtUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d} j ${h} h`
  if (h > 0) return `${h} h ${m} min`
  return `${m} min`
}

function MetricCard({ icon, label, value, sub, tone = "default" }: {
  icon: string; label: string; value: string | number; sub?: string
  tone?: "default" | "good" | "bad"
}) {
  const valueColor = tone === "good" ? "text-green-600" : tone === "bad" ? "text-red-600" : "text-dark"
  return (
    <div className="bg-white rounded-2xl border border-border-custom p-5">
      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center mb-3">
        <i className={`fi ${icon} text-muted text-lg`} />
      </div>
      <p className={`font-display font-bold text-2xl ${valueColor}`}>{value}</p>
      <p className="font-display font-semibold text-dark text-sm mt-0.5">{label}</p>
      {sub && <p className="font-sans text-muted text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function SanteClient() {
  const [data, setData]       = useState<SanteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true)
    try {
      const res  = await fetch("/api/admin/sante")
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(() => load(true), 60_000)
    return () => clearInterval(interval)
  }, [load])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-muted text-sm">Vérification de l&apos;état du système…</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 lg:p-8">
        <p className="font-sans text-red-500 text-sm">Impossible de charger l&apos;état du système.</p>
      </div>
    )
  }

  const sc = STATUS_CONFIG[data.status]

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-dark text-2xl">Santé système</h1>
          <p className="font-sans text-muted text-sm mt-1">
            Dernière vérification : {new Date(data.checkedAt).toLocaleTimeString("fr-FR")}
          </p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 border border-border-custom rounded-xl px-4 py-2 font-display font-semibold text-sm text-dark hover:bg-surface transition-colors disabled:opacity-50">
          <i className={`fi fi-rr-refresh text-base ${refreshing ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Statut global */}
      <div className="bg-white rounded-2xl border border-border-custom p-5 flex items-center gap-4">
        <span className={`relative flex h-3 w-3 shrink-0`}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-50`} />
          <span className={`relative inline-flex rounded-full h-3 w-3 ${sc.dot}`} />
        </span>
        <div className="min-w-0 flex-1">
          <span className={`inline-block font-display font-bold text-xs px-2.5 py-1 rounded-lg ${sc.color}`}>{sc.label}</span>
        </div>
        <p className="font-sans text-muted text-xs shrink-0">Disponible depuis {fmtUptime(data.uptime)}</p>
      </div>

      {/* Alertes */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${
              a.level === "critical" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
            }`}>
              <i className={`fi ${a.level === "critical" ? "fi-rr-exclamation" : "fi-rr-triangle-warning"} mt-0.5 ${
                a.level === "critical" ? "text-red-600" : "text-amber-600"
              }`} />
              <p className={`font-sans text-sm ${a.level === "critical" ? "text-red-700" : "text-amber-700"}`}>{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Composants */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon="fi-rr-database"
          label="Base de données"
          value={data.db.status === "ok" ? "Opérationnelle" : "Erreur"}
          sub={data.db.status === "ok" ? `Latence ${data.db.latencyMs} ms` : "Connexion impossible"}
          tone={data.db.status === "ok" ? "good" : "bad"}
        />
        <MetricCard
          icon="fi-rr-brain"
          label="Service RAG"
          value={data.rag === "configured" ? "Configuré" : "Non configuré"}
          tone={data.rag === "configured" ? "good" : "bad"}
        />
        <MetricCard
          icon="fi-rr-time-fast"
          label="Rate limit (1h)"
          value={data.security.rateLimited1h}
          sub="dépassements détectés"
          tone={data.security.rateLimited1h >= 10 ? "bad" : "default"}
        />
      </div>

      {/* Performance chatbot */}
      <div>
        <h2 className="font-display font-bold text-dark text-base mb-3">Performance du chatbot</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon="fi-rr-comment-alt" label="Conversations (1h)" value={data.chat.total1h} />
          <MetricCard
            icon="fi-rr-cross-circle"
            label="Taux d'échec (1h)"
            value={`${data.chat.errorRate1h}%`}
            sub={`${data.chat.failed1h} échec${data.chat.failed1h > 1 ? "s" : ""}`}
            tone={data.chat.errorRate1h >= 30 ? "bad" : data.chat.errorRate1h > 0 ? "default" : "good"}
          />
          <MetricCard
            icon="fi-rr-cross-circle"
            label="Taux d'échec (24h)"
            value={`${data.chat.errorRate24h}%`}
            sub={`${data.chat.failed24h} / ${data.chat.total24h} conversations`}
            tone={data.chat.errorRate24h >= 15 ? "bad" : data.chat.errorRate24h > 0 ? "default" : "good"}
          />
          <MetricCard
            icon="fi-rr-gauge"
            label="Latence moyenne (24h)"
            value={`${data.chat.avgLatencyMs} ms`}
          />
        </div>
      </div>

      {/* Événements de sécurité récents */}
      <div>
        <h2 className="font-display font-bold text-dark text-base mb-3">Événements de sécurité (24h)</h2>
        <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
          {data.security.byType24h.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 border-b border-border-custom">
              {data.security.byType24h.map(t => (
                <span key={t.type} className="font-display font-semibold text-xs px-2.5 py-1 rounded-lg bg-surface text-dark">
                  {TYPE_LABELS[t.type] ?? t.type} · {t.count}
                </span>
              ))}
            </div>
          )}
          {data.security.recent.length === 0 ? (
            <p className="font-sans text-muted text-sm p-6 text-center">Aucun événement de sécurité enregistré sur les dernières 24 heures.</p>
          ) : (
            <div className="divide-y divide-border-custom">
              {data.security.recent.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                    <i className="fi fi-rr-shield-exclamation text-muted text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-dark text-sm">{TYPE_LABELS[ev.type] ?? ev.type}</p>
                    <p className="font-sans text-muted text-xs truncate">{ev.details ?? "—"} {ev.ip ? `· ${ev.ip}` : ""}</p>
                  </div>
                  <p className="font-sans text-muted text-xs shrink-0">
                    {new Date(ev.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
