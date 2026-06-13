import type { Metadata } from "next"

export const metadata: Metadata = {
  title:       "Contact — Dagan IA",
  description: "Contactez l'équipe Dagan IA pour toute question, suggestion ou partenariat. Réponse garantie sous 48 heures.",
  alternates:  { canonical: "/contact" },
  openGraph: {
    title:       "Contact — Dagan IA",
    description: "Contactez l'équipe Dagan IA pour toute question, suggestion ou partenariat.",
    url:         "/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
