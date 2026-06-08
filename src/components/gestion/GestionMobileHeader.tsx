"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const NAV = [
  { href: "/gestion",              icon: "fi-rr-chart-histogram", label: "Bord",    exact: true },
  { href: "/gestion/transactions", icon: "fi-rr-arrows-repeat",   label: "Flux"                },
  { href: "/gestion/charges",      icon: "fi-rr-receipt",         label: "Charges"             },
  { href: "/gestion/dettes",       icon: "fi-rr-bank",            label: "Dettes"              },
  { href: "/gestion/analyse",      icon: "fi-rr-magic-wand",      label: "Analyse"             },
]

const PAGE_TITLES: Record<string, string> = {
  "/gestion":              "Tableau de bord",
  "/gestion/transactions": "Transactions",
  "/gestion/charges":      "Charges",
  "/gestion/produits":     "Produits",
  "/gestion/dettes":       "Dettes",
  "/gestion/analyse":      "Analyse DaganAI",
  "/gestion/rapport":      "Rapport",
  "/gestion/parametres":   "Paramètres",
  "/gestion/setup":        "Configurer mon entreprise",
}

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export default function GestionMobileHeader({ user }: Props) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  function active(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const title =
    Object.entries(PAGE_TITLES).find(([k]) => pathname === k || pathname.startsWith(k + "/"))?.[1] ??
    "Gestion"

  return (
    <>
      {/* Top header — mobile only */}
      <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-white border-b border-border-custom">
        <div className="flex items-center gap-2.5">
          <Link href="/gestion">
            <Image src="/icons/icon-192x192.svg" alt="Dagan IA" width={22} height={22} className="rounded-md" />
          </Link>
          <span className="font-display font-bold text-dark text-sm">{title}</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu du compte"
            aria-expanded={menuOpen}
            className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
          >
            {user.image
              ? <img src={user.image} alt="" className="w-full h-full object-cover" />
              : <i className="fi fi-rr-user text-terracotta text-sm" />
            }
          </button>

          {menuOpen && (
            <>
              {/* Fond pour fermer au clic extérieur */}
              <button
                type="button"
                aria-label="Fermer le menu"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setMenuOpen(false)}
              />

              <div className="absolute right-0 top-11 z-40 w-56 rounded-xl bg-white border border-border-custom shadow-lg overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border-custom">
                  <div className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {user.image
                      ? <img src={user.image} alt="" className="w-full h-full object-cover" />
                      : <i className="fi fi-rr-user text-terracotta text-sm" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-dark text-xs truncate">
                      {user.name ?? "Mon compte"}
                    </p>
                    {user.email && (
                      <p className="font-sans text-muted text-xs truncate">{user.email}</p>
                    )}
                  </div>
                </div>

                <Link
                  href="/gestion/parametres"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-display font-medium transition-colors ${
                    active("/gestion/parametres") ? "bg-terracotta/10 text-terracotta" : "text-muted hover:bg-surface hover:text-dark"
                  }`}
                >
                  <i className="fi fi-rr-settings text-base" aria-hidden="true" />
                  Paramètres
                </Link>

                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-display font-medium text-muted hover:bg-surface hover:text-dark transition-colors"
                >
                  <i className="fi fi-rr-home text-base" aria-hidden="true" />
                  Accueil
                </Link>

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-display font-medium text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <i className="fi fi-rr-sign-out-alt text-base" aria-hidden="true" />
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Bottom tab bar — mobile only */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 flex bg-white border-t border-border-custom">
        {NAV.map(({ href, icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active(href, exact) ? "text-terracotta" : "text-muted"
            }`}
          >
            <i className={`fi ${icon} text-xl`} aria-hidden="true" />
            <span className="text-[10px] font-display font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
