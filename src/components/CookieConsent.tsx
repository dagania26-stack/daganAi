"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const STORAGE_KEY = "dagan-cookie-consent"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function choose(value: "accepted" | "declined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, date: new Date().toISOString() }))
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Préférences cookies"
      className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6 animate-slide-up"
    >
      <div className="mx-auto max-w-2xl bg-white rounded-2xl border border-border-custom shadow-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center shrink-0">
          <i className="fi fi-rr-cookie text-terracotta text-base" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-dark text-sm mb-1">Cookies & confidentialité</p>
          <p className="font-sans text-muted text-xs leading-relaxed">
            Dagan IA utilise uniquement des cookies techniques strictement nécessaires au bon
            fonctionnement du site (session, préférences). Aucun cookie publicitaire ou de
            traçage tiers n&apos;est utilisé.{" "}
            <Link href="/confidentialite" className="text-terracotta font-semibold hover:underline">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => choose("declined")}
            className="flex-1 sm:flex-none font-display font-semibold px-4 py-2.5 rounded-xl text-sm border border-border-custom text-muted hover:bg-surface active:scale-95 transition-all"
          >
            Refuser
          </button>
          <button
            onClick={() => choose("accepted")}
            className="flex-1 sm:flex-none font-display font-semibold px-4 py-2.5 rounded-xl text-sm bg-terracotta text-white hover:bg-[#a33a0c] active:scale-95 transition-all"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
