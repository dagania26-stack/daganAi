"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

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
  user: { name?: string | null; image?: string | null }
}

export default function GestionMobileHeader({ user }: Props) {
  const pathname = usePathname()

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

        <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center overflow-hidden">
          {user.image
            ? <img src={user.image} alt="" className="w-full h-full object-cover" />
            : <i className="fi fi-rr-user text-terracotta text-sm" />
          }
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
