import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title:      "Conditions d'utilisation — Dagan IA",
  description: "Conditions générales d'utilisation du service Dagan IA, assistant IA pour les femmes entrepreneures.",
  alternates: { canonical: "/conditions" },
  robots:     { index: true, follow: false },
};

const ARTICLES = [
  {
    num: "1",
    titre: "Présentation du service",
    contenu: `Dagan IA est un service d'assistance par intelligence artificielle destiné aux femmes entrepreneures du Togo et du Bénin. Il fournit des informations générales sur le droit des affaires OHADA, la fiscalité (OTR) et l'accès au financement.

Le service est accessible gratuitement via le site web dagania.tech. Aucune inscription n'est requise pour utiliser le chat.`,
  },
  {
    num: "2",
    titre: "Nature des informations fournies",
    contenu: `Les réponses de Dagan IA sont fournies à titre informatif et éducatif uniquement. Elles ne constituent pas un avis juridique, fiscal ou financier personnalisé, et ne remplacent pas la consultation d'un professionnel qualifié (avocat, expert-comptable, conseiller fiscal).

Bien que nous nous efforcions de fournir des informations exactes et à jour, Dagan IA ne garantit pas l'exactitude, l'exhaustivité ou l'adéquation des informations à votre situation personnelle.`,
  },
  {
    num: "3",
    titre: "Utilisation autorisée",
    contenu: `Vous êtes autorisé(e) à utiliser Dagan IA pour :
— Obtenir des informations générales sur la création et la gestion d'une entreprise
— Comprendre vos obligations fiscales et légales
— Identifier les dispositifs de financement disponibles
— Préparer vos démarches administratives`,
  },
  {
    num: "4",
    titre: "Utilisations interdites",
    contenu: `Il est interdit d'utiliser Dagan IA pour :
— Tenter de compromettre la sécurité du service ou de ses infrastructures
— Soumettre des contenus illicites, diffamatoires, offensants ou portant atteinte aux droits de tiers
— Utiliser le service à des fins commerciales de revente ou d'extraction de données automatisée
— Tromper l'IA dans le but d'obtenir des informations fausses ou dangereuses
— Contourner les limitations techniques du service`,
  },
  {
    num: "5",
    titre: "Propriété intellectuelle",
    contenu: `L'ensemble des éléments constitutifs du service Dagan IA — interface, textes, visuels, logo, base documentaire — est la propriété exclusive de Dagan IA ou de ses partenaires et est protégé par les droits de propriété intellectuelle applicables.

Toute reproduction, représentation ou exploitation sans autorisation préalable est strictement interdite.`,
  },
  {
    num: "6",
    titre: "Limitation de responsabilité",
    contenu: `Dagan IA ne saurait être tenu responsable des décisions prises par les utilisateurs sur la base des informations fournies par le service, ni des préjudices directs ou indirects pouvant en résulter.

Le service est fourni « en l'état », sans garantie de disponibilité continue. Des interruptions de maintenance peuvent survenir sans préavis.`,
  },
  {
    num: "7",
    titre: "Données personnelles",
    contenu: `L'utilisation de Dagan IA implique la collecte de certaines données conformément à notre Politique de confidentialité, disponible sur dagania.tech/confidentialite.

En utilisant le service, vous consentez au traitement de vos données tel que décrit dans cette politique.`,
  },
  {
    num: "8",
    titre: "Modifications des conditions",
    contenu: `Nous nous réservons le droit de modifier les présentes conditions à tout moment. Les modifications entrent en vigueur dès leur publication sur cette page. L'utilisation continue du service après modification vaut acceptation des nouvelles conditions.`,
  },
  {
    num: "9",
    titre: "Droit applicable",
    contenu: `Les présentes conditions sont régies par le droit togolais. En cas de litige, les parties s'efforceront de trouver une solution amiable avant tout recours judiciaire. À défaut, les tribunaux compétents de Lomé (Togo) seront seuls compétents.`,
  },
];

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-surface border-b border-border-custom">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <div className="flex items-center gap-2 text-terracotta font-display text-xs font-bold uppercase tracking-wider mb-3">
            <i className="fi fi-rr-document-signed text-sm" aria-hidden="true" />
            Légal
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-dark mb-2">
            Conditions d&apos;utilisation
          </h1>
          <p className="font-sans text-muted text-sm">
            Dernière mise à jour : juin 2026
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-10 pb-2">
        <p className="font-sans text-muted text-base leading-relaxed">
          En accédant à Dagan IA et en utilisant ses services, vous acceptez les
          présentes conditions d&apos;utilisation dans leur intégralité. Veuillez les
          lire attentivement avant toute utilisation.
        </p>
      </div>

      {/* Articles */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 flex flex-col gap-6">
        {ARTICLES.map(({ num, titre, contenu }) => (
          <div
            key={num}
            className="bg-surface rounded-xl sm:rounded-2xl p-6 border border-border-custom"
          >
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-display font-extrabold text-terracotta/30 text-2xl leading-none shrink-0">
                {num.padStart(2, "0")}
              </span>
              <h2 className="font-display font-bold text-dark text-base sm:text-lg">
                {titre}
              </h2>
            </div>
            <p className="font-sans text-muted text-sm leading-relaxed whitespace-pre-line">
              {contenu}
            </p>
          </div>
        ))}

        {/* Contact */}
        <div className="bg-terracotta/5 border border-terracotta/20 rounded-xl p-6">
          <h2 className="font-display font-bold text-dark text-base mb-2">
            Une question sur ces conditions ?
          </h2>
          <p className="font-sans text-muted text-sm mb-3">
            Contactez-nous pour toute demande d&apos;information ou de clarification.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:contact@dagania.tech"
              className="inline-flex items-center gap-1.5 text-terracotta font-display font-semibold text-sm hover:underline"
            >
              <i className="fi fi-rr-envelope text-xs" aria-hidden="true" />
              contact@dagania.tech
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-terracotta font-display font-semibold text-sm hover:underline"
            >
              <i className="fi fi-rr-comment-alt text-xs" aria-hidden="true" />
              Formulaire de contact
            </Link>
          </div>
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
