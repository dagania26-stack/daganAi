"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const NAV = [
  { href: "/gestion",              icon: "fi-rr-chart-histogram", label: "Tableau de bord", exact: true },
  { href: "/gestion/transactions", icon: "fi-rr-arrows-repeat",   label: "Transactions"               },
  { href: "/gestion/charges",      icon: "fi-rr-receipt",         label: "Charges"                    },
  { href: "/gestion/produits",     icon: "fi-rr-box",             label: "Produits"                   },
  { href: "/gestion/dettes",       icon: "fi-rr-bank",            label: "Dettes"                     },
  { href: "/gestion/analyse",      icon: "fi-rr-magic-wand",      label: "Analyse IA"                 },
  { href: "/gestion/rapport",      icon: "fi-rr-file-pdf",        label: "Rapport"                    },
]

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export default function GestionSidebar({ user }: Props) {
  const pathname = usePathname()

  function active(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex flex-col w-[240px] fixed inset-y-0 left-0 bg-white border-r border-border-custom z-30">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-custom">
        <Link href="/gestion" className="flex items-center gap-2.5 group">
          <Image src="/logo.png" alt="Dagan IA" width={36} height={36} className="rounded-lg" />
          <div>
            <p className="font-display font-bold text-dark text-sm leading-tight">Dagan</p>
            <p className="font-sans text-muted text-xs">Gestion</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-colors ${
              active(href, exact)
                ? "bg-terracotta/10 text-terracotta"
                : "text-muted hover:bg-surface hover:text-dark"
            }`}
          >
            <i className={`fi ${icon} text-base`} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bas : paramètres + user + déconnexion */}
      <div className="px-3 py-4 border-t border-border-custom space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center shrink-0 overflow-hidden">
            {user.image
              ? <img src={user.image} alt="" className="w-full h-full object-cover" />
              : <i className="fi fi-rr-user text-terracotta text-sm" />
            }
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-dark text-xs truncate">
              {user.name ?? "Mon compte"}
            </p>
            <p className="font-sans text-muted text-xs truncate">{user.email}</p>
          </div>
        </div>

        <Link
          href="/gestion/parametres"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-colors ${
            active("/gestion/parametres") ? "bg-terracotta/10 text-terracotta" : "text-muted hover:bg-surface hover:text-dark"
          }`}
        >
          <i className="fi fi-rr-settings text-base" aria-hidden="true" />
          Paramètres
        </Link>

        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium text-muted hover:bg-surface hover:text-dark transition-colors"
        >
          <i className="fi fi-rr-home text-base" aria-hidden="true" />
          Accueil
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <i className="fi fi-rr-sign-out-alt text-base" aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
