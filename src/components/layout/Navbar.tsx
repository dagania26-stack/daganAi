"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",         label: "Accueil"  },
  { href: "/chat",     label: "Chat IA"  },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact",  label: "Contact"  },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-warm-white/95 backdrop-blur-sm border-b border-border-custom">
      <div className="mx-auto max-w-5xl xl:max-w-6xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="Dagan IA" width={48} height={48} className="rounded-xl" />
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-base sm:text-lg text-terracotta leading-none">
              Dagan IA
            </span>
            <span className="hidden sm:block text-[10px] text-muted font-sans mt-0.5">
              Grande Sœur Numérique
            </span>
          </div>
        </Link>

        {/* Liens desktop */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "font-display text-sm font-medium transition-colors duration-150",
                pathname === href
                  ? "text-terracotta"
                  : "text-muted hover:text-dark",
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/chat"
            className={cn(
              "inline-flex items-center gap-1.5 min-h-[38px]",
              "bg-terracotta text-white font-display font-semibold text-sm",
              "px-4 py-2 rounded-lg",
              "hover:bg-[#a33a0c] active:scale-95 transition-all duration-150",
            )}
          >
            <i className="fi fi-rr-comment-alt text-sm" aria-hidden="true" />
            Commencer
          </Link>
        </div>

        {/* Burger mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="md:hidden p-2 -mr-1 text-dark rounded-lg hover:bg-surface transition-colors"
        >
          <i
            className={cn("fi text-xl leading-none", open ? "fi-rr-cross" : "fi-rr-menu-burger")}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Menu mobile déroulant */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 ease-out",
          open ? "max-h-72 border-t border-border-custom" : "max-h-0",
        )}
      >
        <div className="px-4 pt-3 pb-5 flex flex-col gap-1 bg-warm-white">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "font-display text-sm font-medium px-3 py-2.5 rounded-lg transition-colors",
                pathname === href
                  ? "text-terracotta bg-terracotta/5"
                  : "text-dark hover:bg-surface",
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/chat"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold text-sm px-4 py-3 rounded-lg hover:bg-[#a33a0c] transition-colors min-h-[44px]"
          >
            <i className="fi fi-rr-comment-alt text-sm" aria-hidden="true" />
            Commencer maintenant
          </Link>
        </div>
      </div>
    </nav>
  );
}
