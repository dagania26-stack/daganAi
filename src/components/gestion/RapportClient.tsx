"use client"

import { useState } from "react"
import Link from "next/link"
import PeriodSelector from "@/components/gestion/PeriodSelector"

interface Props {
  businessNom:  string
  userEmail:    string
  periodeJours: number
  periode:      string
  kpis: { ca: number; depenses: number; benefice: number; chargesMois: number; encours: number }
}

type ExportStatus = "idle" | "loading" | "done" | "error"

function fmt(n: number) { return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA" }

export default function RapportClient({ businessNom, userEmail, periodeJours, periode, kpis }: Props) {
  const [analyseText, setAnalyseText] = useState("")
  const [analyseStatus, setAnalyseStatus] = useState<"idle" | "loading" | "done">("idle")
  const [pdfStatus,   setPdfStatus]   = useState<ExportStatus>("idle")
  const [emailStatus, setEmailStatus] = useState<ExportStatus>("idle")
  const [copied, setCopied]           = useState(false)

  async function loadAnalyse() {
    if (analyseStatus !== "idle") return
    setAnalyseStatus("loading")
    try {
      const res = await fetch(`/api/gestion/analyse?jours=${periodeJours}`)
      const reader = res.body!.getReader()
      const dec    = new TextDecoder()
      let full     = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value, { stream: true })
        full += chunk
        setAnalyseText(full)
      }
      setAnalyseStatus("done")
    } catch {
      setAnalyseStatus("idle")
    }
  }

  async function downloadPDF() {
    setPdfStatus("loading")
    try {
      const res = await fetch("/api/gestion/rapport/pdf", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ analyseText, periodeJours }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href     = url
      a.download = `rapport-${businessNom.toLowerCase().replace(/\s+/g, "-")}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setPdfStatus("done")
      setTimeout(() => setPdfStatus("idle"), 3000)
    } catch {
      setPdfStatus("error")
      setTimeout(() => setPdfStatus("idle"), 3000)
    }
  }

  async function sendEmail() {
    setEmailStatus("loading")
    try {
      const res = await fetch("/api/gestion/rapport/email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ analyseText, periodeJours }),
      })
      if (!res.ok) throw new Error()
      setEmailStatus("done")
      setTimeout(() => setEmailStatus("idle"), 4000)
    } catch {
      setEmailStatus("error")
      setTimeout(() => setEmailStatus("idle"), 3000)
    }
  }

  function copyClipboard() {
    const kpiText = [
      `Rapport financier — ${businessNom}`,
      `Période : ${periode}`,
      "",
      `Chiffre d'affaires : ${fmt(kpis.ca)}`,
      `Dépenses : ${fmt(kpis.depenses)}`,
      `Bénéfice : ${fmt(kpis.benefice)}`,
      `Charges /mois : ${fmt(kpis.chargesMois)}`,
      `Dettes en cours : ${fmt(kpis.encours)}`,
      "",
      analyseText ? "── Analyse DaganAI ──" : "",
      analyseText,
    ].filter(Boolean).join("\n")
    navigator.clipboard.writeText(kpiText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const kpiCards = [
    { label: "Chiffre d'affaires",  value: fmt(kpis.ca),          color: "text-forest",  bg: "bg-green-50"  },
    { label: "Bénéfice net",        value: fmt(kpis.benefice),     color: kpis.benefice >= 0 ? "text-forest" : "text-red-600", bg: kpis.benefice >= 0 ? "bg-green-50" : "bg-red-50" },
    { label: "Charges /mois",       value: fmt(kpis.chargesMois),  color: "text-gold",    bg: "bg-amber-50"  },
    { label: "Dettes en cours",     value: fmt(kpis.encours),      color: "text-red-600", bg: "bg-red-50"    },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/gestion" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors">
          <i className="fi fi-rr-angle-left text-muted" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-dark text-xl">Rapport complet</h1>
          <p className="font-sans text-muted text-sm truncate">{businessNom} — {periode}</p>
        </div>
        <PeriodSelector value={periodeJours} />
      </div>

      {/* KPI snapshot */}
      <div className="grid grid-cols-2 gap-3">
        {kpiCards.map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4`}>
            <p className="font-sans text-xs text-muted mb-1">{k.label}</p>
            <p className={`font-display font-bold text-sm ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Analyse section */}
      <div className="bg-white border border-border-custom rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-dark text-base">Analyse DaganAI</p>
            <p className="font-sans text-muted text-xs mt-0.5">Incluse automatiquement dans le PDF et l&apos;email</p>
          </div>
          {analyseStatus === "idle" && (
            <button onClick={loadAnalyse}
              className="flex items-center gap-1.5 px-3 py-2 bg-terracotta text-white rounded-lg text-xs font-display font-semibold hover:bg-terracotta/90 transition-colors">
              <i className="fi fi-rr-magic-wand text-xs" />
              Générer
            </button>
          )}
        </div>

        {analyseStatus === "loading" && (
          <div className="text-xs font-sans text-muted flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
            Analyse en cours…
          </div>
        )}

        {analyseText && (
          <div className="bg-surface rounded-xl p-4 max-h-64 overflow-y-auto">
            <p className="font-sans text-xs text-dark/80 leading-relaxed whitespace-pre-wrap">{analyseText}</p>
          </div>
        )}
      </div>

      {/* Export actions */}
      <div className="bg-white border border-border-custom rounded-2xl p-5 space-y-3">
        <p className="font-display font-bold text-dark text-base">Exporter</p>

        {/* PDF */}
        <button onClick={downloadPDF} disabled={pdfStatus === "loading"}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border-custom hover:bg-surface disabled:opacity-60 disabled:cursor-not-allowed transition-colors group">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <i className={`fi ${pdfStatus === "loading" ? "fi-rr-spinner animate-spin" : pdfStatus === "done" ? "fi-rr-check" : "fi-rr-file-pdf"} text-red-600`} />
          </div>
          <div className="text-left flex-1">
            <p className="font-display font-semibold text-dark text-sm group-hover:text-terracotta transition-colors">
              {pdfStatus === "loading" ? "Génération en cours…" : pdfStatus === "done" ? "PDF téléchargé !" : "Télécharger en PDF"}
            </p>
            <p className="font-sans text-xs text-muted">Rapport multi-pages avec analyse IA</p>
          </div>
          {pdfStatus === "error" && <span className="text-xs text-red-600 font-sans">Erreur</span>}
        </button>

        {/* Copier */}
        <button onClick={copyClipboard}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border-custom hover:bg-surface transition-colors group">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <i className={`fi ${copied ? "fi-rr-check" : "fi-rr-copy-alt"} text-blue-600`} />
          </div>
          <div className="text-left flex-1">
            <p className="font-display font-semibold text-dark text-sm group-hover:text-terracotta transition-colors">
              {copied ? "Copié !" : "Copier dans le presse-papier"}
            </p>
            <p className="font-sans text-xs text-muted">KPIs + analyse en texte brut</p>
          </div>
        </button>

        {/* Email */}
        <button onClick={sendEmail} disabled={emailStatus === "loading"}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border-custom hover:bg-surface disabled:opacity-60 disabled:cursor-not-allowed transition-colors group">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <i className={`fi ${emailStatus === "loading" ? "fi-rr-spinner animate-spin" : emailStatus === "done" ? "fi-rr-check" : "fi-rr-envelope"} text-green-600`} />
          </div>
          <div className="text-left flex-1">
            <p className="font-display font-semibold text-dark text-sm group-hover:text-terracotta transition-colors">
              {emailStatus === "loading" ? "Envoi en cours…" : emailStatus === "done" ? "Email envoyé !" : "Envoyer par email"}
            </p>
            <p className="font-sans text-xs text-muted">Vers {userEmail}</p>
          </div>
          {emailStatus === "error" && <span className="text-xs text-red-600 font-sans">Erreur</span>}
        </button>
      </div>

    </div>
  )
}
