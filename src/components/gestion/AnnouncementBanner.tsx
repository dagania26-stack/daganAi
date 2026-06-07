"use client"

import { useEffect, useState } from "react"

type Level = "INFO" | "SUCCESS" | "WARNING"

interface Announcement {
  id:        string
  title:     string
  message:   string
  level:     Level
  createdAt: string
}

const LEVEL_CONFIG: Record<Level, { icon: string; bar: string; bg: string; iconColor: string }> = {
  INFO:    { icon: "fi-rr-info",             bar: "bg-blue-500",  bg: "bg-blue-50",  iconColor: "text-blue-600"  },
  SUCCESS: { icon: "fi-rr-badge-check",      bar: "bg-green-500", bg: "bg-green-50", iconColor: "text-green-600" },
  WARNING: { icon: "fi-rr-triangle-warning", bar: "bg-amber-500", bg: "bg-amber-50", iconColor: "text-amber-600" },
}

const STORAGE_KEY = "dagan-dismissed-annonces"

function getDismissed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch { return [] }
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    fetch("/api/annonces")
      .then(r => r.ok ? r.json() : { announcements: [] })
      .then(d => {
        const dismissed = getDismissed()
        setAnnouncements((d.announcements ?? []).filter((a: Announcement) => !dismissed.includes(a.id)))
      })
      .catch(() => {})
  }, [])

  function dismiss(id: string) {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    try {
      const dismissed = getDismissed()
      if (!dismissed.includes(id)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, id]))
    } catch {}
  }

  if (announcements.length === 0) return null

  return (
    <div className="px-4 sm:px-6 pt-4 space-y-2">
      {announcements.map(a => {
        const cfg = LEVEL_CONFIG[a.level]
        return (
          <div key={a.id} className={`relative overflow-hidden rounded-xl border border-border-custom ${cfg.bg} pl-4 pr-10 py-3 flex items-start gap-3 animate-fade-in-up`}>
            <span className={`absolute inset-y-0 left-0 w-1 ${cfg.bar}`} aria-hidden="true" />
            <i className={`fi ${cfg.icon} ${cfg.iconColor} text-base mt-0.5 shrink-0`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-display font-bold text-dark text-sm">{a.title}</p>
              <p className="font-sans text-muted text-xs mt-0.5 leading-relaxed">{a.message}</p>
            </div>
            <button
              onClick={() => dismiss(a.id)}
              aria-label="Fermer cette annonce"
              className="absolute top-2.5 right-2.5 p-1.5 text-muted/60 hover:text-dark hover:bg-white/60 rounded-lg transition-colors"
            >
              <i className="fi fi-rr-cross text-xs" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
