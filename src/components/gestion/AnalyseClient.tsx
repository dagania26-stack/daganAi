"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"

type Status = "idle" | "streaming" | "done" | "error"

export default function AnalyseClient() {
  const [text, setText]     = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const abortRef            = useRef<AbortController | null>(null)

  const startAnalyse = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setText("")
    setStatus("streaming")

    try {
      const res = await fetch("/api/gestion/analyse", { signal: ctrl.signal })
      if (!res.ok) throw new Error("Erreur serveur")
      const reader = res.body!.getReader()
      const dec    = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setText(prev => prev + dec.decode(value, { stream: true }))
      }
      setStatus("done")
    } catch (err: any) {
      if (err.name !== "AbortError") setStatus("error")
    }
  }, [])

  const copyText = useCallback(() => {
    if (!text) return
    navigator.clipboard.writeText(text)
  }, [text])

  // Render markdown-ish: bold **text** and bullet lists
  const renderText = (raw: string) => {
    const lines = raw.split("\n")
    return lines.map((line, i) => {
      // Section header: **TITRE**
      if (/^\*\*[A-ZÀÂÉÈÊËÎÏÔÙÛÜ\s]+\*\*$/.test(line.trim())) {
        const title = line.replace(/\*\*/g, "")
        return <p key={i} className="font-display font-bold text-dark text-base mt-5 mb-2 first:mt-0">{title}</p>
      }
      // Bullet
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        const content = line.trim().replace(/^[-•]\s*/, "")
        return (
          <div key={i} className="flex gap-2 mb-1">
            <span className="text-terracotta mt-0.5 shrink-0 text-xs font-bold">•</span>
            <span className="font-sans text-dark/80 text-sm leading-relaxed">{renderInline(content)}</span>
          </div>
        )
      }
      if (line.trim() === "") return <div key={i} className="h-1" />
      return <p key={i} className="font-sans text-dark/80 text-sm leading-relaxed mb-1">{renderInline(line)}</p>
    })
  }

  // Inline bold **text**
  const renderInline = (s: string) => {
    const parts = s.split(/\*\*(.*?)\*\*/)
    return parts.map((p, i) =>
      i % 2 === 1 ? <strong key={i} className="font-display font-bold text-dark">{p}</strong> : p
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/gestion" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors">
          <i className="fi fi-rr-angle-left text-muted" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-dark text-xl">Analyse DaganAI</h1>
          <p className="font-sans text-muted text-sm">Analyse stratégique de votre activité (90 derniers jours)</p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        <button onClick={startAnalyse} disabled={status === "streaming"}
          className="flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white rounded-xl font-display font-semibold text-sm hover:bg-terracotta/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          <i className={`fi ${status === "streaming" ? "fi-rr-spinner animate-spin" : "fi-rr-magic-wand"} text-base`} aria-hidden="true" />
          {status === "streaming" ? "Analyse en cours…" : status === "done" ? "Relancer l'analyse" : "Lancer l'analyse"}
        </button>

        {status === "done" && (
          <>
            <button onClick={copyText}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-custom text-dark rounded-xl font-display font-semibold text-sm hover:bg-surface transition-colors">
              <i className="fi fi-rr-copy-alt text-base" aria-hidden="true" />
              Copier
            </button>
            <Link href="/gestion/rapport"
              className="flex items-center gap-2 px-4 py-2.5 bg-forest text-white rounded-xl font-display font-semibold text-sm hover:bg-forest/90 transition-colors">
              <i className="fi fi-rr-file-pdf text-base" aria-hidden="true" />
              Générer le rapport PDF
            </Link>
          </>
        )}
      </div>

      {/* Content area */}
      {status === "idle" && (
        <div className="bg-white border border-border-custom rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[280px]">
          <div className="w-14 h-14 rounded-2xl bg-terracotta/10 flex items-center justify-center">
            <i className="fi fi-rr-magic-wand text-terracotta text-2xl" />
          </div>
          <div>
            <p className="font-display font-bold text-dark text-base mb-1">DaganAI est prête</p>
            <p className="font-sans text-muted text-sm max-w-xs">
              Cliquez sur &laquo; Lancer l&apos;analyse &raquo; pour obtenir une analyse stratégique complète de votre activité.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3">
          <i className="fi fi-rr-exclamation text-red-600 text-lg shrink-0" />
          <p className="font-sans text-red-700 text-sm">Une erreur est survenue. Vérifiez votre connexion et réessayez.</p>
        </div>
      )}

      {(status === "streaming" || status === "done") && text && (
        <div className="bg-white border border-border-custom rounded-2xl p-5 sm:p-6">
          {/* Streaming cursor */}
          {status === "streaming" && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border-custom">
              <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              <p className="font-sans text-terracotta text-xs font-semibold">DaganAI analyse vos données…</p>
            </div>
          )}
          <div className="space-y-0.5">
            {renderText(text)}
          </div>
          {status === "streaming" && (
            <span className="inline-block w-0.5 h-4 bg-terracotta animate-pulse ml-1 align-middle" />
          )}
        </div>
      )}

      {status === "done" && (
        <p className="font-sans text-muted text-xs text-center">
          Analyse générée par Claude (Anthropic). Basée sur vos données des 90 derniers jours.
        </p>
      )}
    </div>
  )
}
