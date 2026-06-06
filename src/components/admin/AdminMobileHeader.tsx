"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/admin",              icon: "fi-rr-chart-histogram", label: "Bord",     exact: true },
  { href: "/admin/utilisateurs", icon: "fi-rr-users",           label: "Users"               },
  { href: "/admin/logs",         icon: "fi-rr-comment-alt",     label: "Logs"                },
  { href: "/admin/securite",     icon: "fi-rr-shield-check",    label: "Sécurité"            },
  { href: "/admin/carte",        icon: "fi-rr-map-marker",      label: "Carte"               },
]

const PAGE_TITLES: Record<string, string> = {
  "/admin":              "Tableau de bord",
  "/admin/utilisateurs": "Utilisateurs",
  "/admin/logs":         "Logs Chat",
  "/admin/securite":     "Sécurité",
  "/admin/carte":        "Cartographie",
}

interface Props {
  user: { name?: string | null; image?: string | null }
}

export default function AdminMobileHeader({ user }: Props) {
  const pathname = usePathname()

  function active(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const title =
    Object.entries(PAGE_TITLES).find(([k]) => pathname === k || pathname.startsWith(k + "/"))?.[1] ??
    "Admin"

  return (
    <>
      <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-dark border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Link href="/admin">
            <Image src="/icons/icon-192x192.svg" alt="Dagan IA" width={22} height={22} className="rounded-md opacity-80" />
          </Link>
          <span className="font-display font-bold text-white text-sm">{title}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-terracotta/20 flex items-center justify-center overflow-hidden">
          {user.image
            ? <img src={user.image} alt="" className="w-full h-full object-cover" />
            : <i className="fi fi-rr-user text-terracotta text-sm" />
          }
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 flex bg-dark border-t border-white/10">
        {NAV.map(({ href, icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active(href, exact) ? "text-terracotta" : "text-white/40"
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
