import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title:       "Politique de confidentialité — Dagan IA",
  description: "Découvrez comment Dagan IA collecte, utilise et protège vos données personnelles.",
  alternates:  { canonical: "/confidentialite" },
  robots:      { index: true, follow: false },
};

const SECTIONS = [
  {
    icon: "fi-rr-database",
    titre: "Données collectées",
    contenu: [
      "Les questions que vous posez à Dagan IA (texte uniquement)",
      "L'identifiant de conversation généré automatiquement (anonyme)",
      "Les données techniques de navigation : navigateur, système d'exploitation, adresse IP (anonymisée)",
      "Les éventuelles informations que vous saisissez volontairement dans le formulaire de contact (nom, email, message)",
    ],
  },
  {
    icon: "fi-rr-settings",
    titre: "Finalité du traitement",
    contenu: [
      "Améliorer la pertinence et la qualité des réponses de l'IA",
      "Détecter et corriger les anomalies techniques",
      "Répondre à vos messages envoyés via le formulaire de contact",
      "Produire des statistiques d'usage anonymes (nombre de questions, domaines les plus consultés)",
    ],
  },
  {
    icon: "fi-rr-share",
    titre: "Partage des données",
    contenu: [
      "Vos données ne sont jamais vendues à des tiers",
      "Elles peuvent être transmises à nos prestataires techniques (hébergement, base de données) uniquement dans le cadre de la fourniture du service",
      "En cas d'obligation légale, les autorités compétentes peuvent y avoir accès",
    ],
  },
  {
    icon: "fi-rr-clock",
    titre: "Durée de conservation",
    contenu: [
      "Conversations : conservées 12 mois à des fins d'amélioration du service, puis supprimées",
      "Données de contact : conservées 3 ans à compter du dernier échange",
      "Logs techniques : 30 jours glissants",
    ],
  },
  {
    icon: "fi-rr-shield-check",
    titre: "Sécurité",
    contenu: [
      "Connexions chiffrées via HTTPS/TLS sur l'ensemble du service",
      "Base de données hébergée sur des serveurs sécurisés (Supabase — région EU West)",
      "Accès restreint aux données selon le principe du moindre privilège",
    ],
  },
  {
    icon: "fi-rr-user-check",
    titre: "Vos droits",
    contenu: [
      "Droit d'accès : vous pouvez demander une copie de vos données",
      "Droit de rectification : correction des données inexactes",
      "Droit à l'effacement : suppression de vos données sur demande",
      "Droit d'opposition : vous opposer au traitement de vos données",
      "Pour exercer ces droits, contactez-nous à contact@dagan-ia.tg",
    ],
  },
];

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-surface border-b border-border-custom">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <div className="flex items-center gap-2 text-terracotta font-display text-xs font-bold uppercase tracking-wider mb-3">
            <i className="fi fi-rr-shield-check text-sm" aria-hidden="true" />
            Vie privée
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-dark mb-2">
            Politique de confidentialité
          </h1>
          <p className="font-sans text-muted text-sm">
            Dernière mise à jour : juin 2026
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-10 pb-2">
        <p className="font-sans text-muted text-base leading-relaxed">
          Chez Dagan IA, la protection de votre vie privée est une priorité. Cette
          politique explique quelles données nous collectons, pourquoi nous le faisons
          et comment nous les protégeons. En utilisant notre service, vous acceptez
          les pratiques décrites ci-dessous.
        </p>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 flex flex-col gap-8">
        {SECTIONS.map(({ icon, titre, contenu }) => (
          <div
            key={titre}
            className="bg-surface rounded-xl sm:rounded-2xl p-6 border border-border-custom"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
                <i className={`fi ${icon} text-terracotta text-sm`} aria-hidden="true" />
              </div>
              <h2 className="font-display font-bold text-dark text-base sm:text-lg">
                {titre}
              </h2>
            </div>
            <ul className="flex flex-col gap-2">
              {contenu.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <i className="fi fi-rr-angle-right text-terracotta text-xs mt-1 shrink-0" aria-hidden="true" />
                  <span className="font-sans text-muted text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Cookies */}
        <div className="bg-surface rounded-xl p-6 border border-border-custom">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
              <i className="fi fi-rr-cookie text-terracotta text-sm" aria-hidden="true" />
            </div>
            <h2 className="font-display font-bold text-dark text-base sm:text-lg">
              Cookies
            </h2>
          </div>
          <p className="font-sans text-muted text-sm leading-relaxed">
            Dagan IA utilise uniquement des cookies techniques strictement nécessaires
            au fonctionnement du service (session de conversation, préférences de
            navigation). Aucun cookie publicitaire ou de traçage tiers n&apos;est utilisé.
          </p>
        </div>

        {/* Contact DPO */}
        <div className="bg-terracotta/5 border border-terracotta/20 rounded-xl p-6">
          <h2 className="font-display font-bold text-dark text-base mb-2">
            Contact — Responsable du traitement
          </h2>
          <p className="font-sans text-muted text-sm leading-relaxed mb-1">
            Pour toute question relative à cette politique ou pour exercer vos droits :
          </p>
          <a
            href="mailto:contact@dagan-ia.tg"
            className="font-display text-sm font-semibold text-terracotta hover:underline"
          >
            contact@dagan-ia.tg
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-custom py-6 bg-surface mt-auto">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-muted">
            &copy; {new Date().getFullYear()} Dagan IA
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { href: "/",               label: "Accueil"          },
              { href: "/chat",           label: "Chat IA"          },
              { href: "/a-propos",       label: "À propos"         },
              { href: "/contact",        label: "Contact"          },
              { href: "/confidentialite", label: "Confidentialité" },
              { href: "/conditions",     label: "Conditions"       },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="font-sans text-xs text-muted hover:text-dark transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
