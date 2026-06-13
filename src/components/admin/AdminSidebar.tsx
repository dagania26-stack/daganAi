"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const NAV = [
  { href: "/admin",             icon: "fi-rr-chart-histogram", label: "Tableau de bord", exact: true },
  { href: "/admin/utilisateurs", icon: "fi-rr-users",           label: "Utilisateurs"                },
  { href: "/admin/logs",         icon: "fi-rr-comment-alt",     label: "Logs Chat"                   },
  { href: "/admin/securite",     icon: "fi-rr-shield-check",    label: "Sécurité"                    },
  { href: "/admin/carte",        icon: "fi-rr-map-marker",      label: "Cartographie"                },
  { href: "/admin/base-connaissance", icon: "fi-rr-database",    label: "Base de connais."            },
  { href: "/admin/annonces",     icon: "fi-rr-megaphone",       label: "Annonces"                    },
  { href: "/admin/sante",        icon: "fi-rr-heart-rate",      label: "Santé système"               },
  { href: "/admin/maintenance",  icon: "fi-rr-settings",        label: "Maintenance"                 },
]

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname()

  function active(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex flex-col w-[240px] fixed inset-y-0 left-0 bg-dark border-r border-white/10 z-30">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Dagan IA" width={36} height={36} className="rounded-lg" />
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">Dagan IA</p>
            <p className="font-sans text-white/40 text-xs">Administration</p>
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
                ? "bg-terracotta text-white"
                : "text-white/50 hover:bg-white/8 hover:text-white"
            }`}
          >
            <i className={`fi ${icon} text-base`} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bas */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link
          href="/gestion"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium text-white/50 hover:bg-white/8 hover:text-white transition-colors"
        >
          <i className="fi fi-rr-grid-alt text-base" aria-hidden="true" />
          Gestion
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium text-white/50 hover:bg-white/8 hover:text-white transition-colors"
        >
          <i className="fi fi-rr-home text-base" aria-hidden="true" />
          Site public
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-8 h-8 rounded-full bg-terracotta/20 flex items-center justify-center shrink-0 overflow-hidden">
            {user.image
              ? <img src={user.image} alt="" className="w-full h-full object-cover" />
              : <i className="fi fi-rr-user text-terracotta text-sm" />
            }
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-white text-xs truncate">{user.name ?? "Admin"}</p>
            <p className="font-sans text-white/40 text-xs truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium text-white/50 hover:bg-red-900/30 hover:text-red-400 transition-colors"
        >
          <i className="fi fi-rr-sign-out-alt text-base" aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
