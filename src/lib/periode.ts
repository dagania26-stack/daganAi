// ─── Sélecteur de période (Rapport / Analyse IA) ──────────────────────────────
// Utilisable côté serveur (routes, pages) et côté client (composants)

export const PERIOD_OPTIONS = [
  { value: 7,   label: "7 derniers jours"   },
  { value: 30,  label: "30 derniers jours"  },
  { value: 90,  label: "3 derniers mois"    },
  { value: 180, label: "6 derniers mois"    },
  { value: 365, label: "12 derniers mois"   },
] as const

export const DEFAULT_PERIOD_DAYS = 30

export function periodLabel(days: number): string {
  const found = PERIOD_OPTIONS.find(o => o.value === days)
  return found ? found.label : `${days} derniers jours`
}

export function parsePeriodDays(raw: string | null | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_PERIOD_DAYS
  return Math.min(Math.max(Math.round(n), 1), 730)
}
