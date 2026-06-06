import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Connexion — Dagan IA",
  description: "Accédez à votre espace Dagan Gestion.",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header minimal */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/icons/icon-192x192.svg"
            alt="Dagan IA"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="font-display font-bold text-dark text-base">Dagan IA</span>
        </Link>
        <Link
          href="/chat"
          className="font-sans text-sm text-muted hover:text-dark transition-colors"
        >
          Retour au chat
        </Link>
      </header>

      {/* Contenu centré */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </main>

      {/* Footer minimal */}
      <footer className="px-6 py-5 text-center">
        <p className="font-sans text-xs text-muted">
          &copy; {new Date().getFullYear()} Dagan IA &mdash;{" "}
          <Link href="/confidentialite" className="hover:text-dark transition-colors">
            Confidentialité
          </Link>
        </p>
      </footer>
    </div>
  )
}
