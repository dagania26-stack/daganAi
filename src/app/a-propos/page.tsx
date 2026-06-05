import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title:       "À propos — Dagan IA",
  description: "Découvrez la mission, la vision et les objectifs de Dagan IA, la Grande Sœur Numérique pour les femmes entrepreneures d'Afrique de l'Ouest.",
  keywords:    ["Dagan IA mission", "assistant IA Afrique", "femmes entrepreneures Togo", "startup Lomé", "IA Bénin"],
  alternates:  { canonical: "/a-propos" },
};

const VALEURS = [
  {
    icon: "fi-rr-shield-check",
    titre: "Fiabilité",
    desc: "Chaque réponse s'appuie sur des textes officiels vérifiés : OHADA, OTR, décrets en vigueur.",
  },
  {
    icon: "fi-rr-users",
    titre: "Inclusion",
    desc: "Conçue pour toutes, quel que soit le niveau d'études. Un langage simple, sans jargon inaccessible.",
  },
  {
    icon: "fi-rr-lock",
    titre: "Confidentialité",
    desc: "Vos questions restent privées. Aucune donnée personnelle n'est revendue ni partagée.",
  },
  {
    icon: "fi-rr-globe",
    titre: "Ancrage local",
    desc: "Adaptée au droit togolais et béninois, pas à une réalité juridique étrangère.",
  },
];

const OBJECTIFS = [
  {
    num: "01",
    titre: "Démocratiser l'information juridique",
    desc: "Rendre compréhensibles les textes OHADA, les procédures de création d'entreprise et les obligations légales pour toute femme qui entreprend.",
  },
  {
    num: "02",
    titre: "Simplifier la fiscalité",
    desc: "Expliquer clairement la TPU, la TVA, la patente et les délais de déclaration auprès de l'OTR pour éviter les pénalités.",
  },
  {
    num: "03",
    titre: "Ouvrir l'accès au financement",
    desc: "Informer sur les fonds disponibles (FAIEJ, microfinance, subventions PME féminines) et les étapes pour y accéder.",
  },
  {
    num: "04",
    titre: "Être disponible 24h/24",
    desc: "Une conseillère toujours présente, gratuite, sans rendez-vous ni file d'attente, directement depuis un smartphone.",
  },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-surface border-b border-border-custom">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <div className="flex items-center gap-2 text-terracotta font-display text-xs font-bold uppercase tracking-wider mb-3">
            <i className="fi fi-rr-info text-sm" aria-hidden="true" />
            À propos
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-dark mb-2">
            Notre histoire
          </h1>
          <p className="font-sans text-muted text-base max-w-xl">
            Dagan IA est née d&apos;un constat simple : les femmes qui entreprennent
            en Afrique de l&apos;Ouest manquent d&apos;accès à une information juridique
            et fiscale fiable, claire et abordable.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-14 sm:py-16 lg:py-20 bg-warm-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center">

            <div>
              <p className="font-display text-xs font-bold uppercase tracking-wider text-terracotta mb-4">
                Notre mission
              </p>
              <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-dark mb-5 leading-snug">
                Être la Grande Sœur Numérique de chaque femme qui entreprend
              </h2>
              <p className="font-sans text-muted text-base leading-relaxed mb-5">
                Dagan IA accompagne les femmes entrepreneures du Togo et du Bénin
                dans leurs démarches administratives, juridiques et financières. Elle
                répond à leurs questions en français courant, avec des informations
                vérifiées et adaptées à leur contexte local.
              </p>
              <p className="font-sans text-muted text-base leading-relaxed">
                Le nom <strong className="text-dark">Dagan</strong> s&apos;inspire de la tradition
                de la femme forte et protectrice en Afrique de l&apos;Ouest celle qui
                guide, soutient et ouvre les portes.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 bg-terracotta/6 rounded-2xl" />
              <Image
                src="/hero.png"
                alt="Femme entrepreneuse — Dagan IA"
                width={480}
                height={420}
                className="relative rounded-xl object-cover w-full shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-14 sm:py-16 bg-terracotta">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-white/60 mb-4">
            Notre vision
          </p>
          <h2 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-white mb-6 max-w-3xl mx-auto leading-snug">
            Un Togo et un Bénin où chaque femme peut créer et développer
            son entreprise en toute connaissance de ses droits.
          </h2>
          <p className="font-sans text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Nous croyons que l&apos;accès à l&apos;information est un levier de
            transformation économique. En aidant une femme à comprendre ses droits,
            nous aidons une famille, une communauté, une nation à prospérer.
          </p>
        </div>
      </section>

      {/* Objectifs */}
      <section className="py-14 sm:py-16 lg:py-20 bg-surface">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-terracotta mb-3">
              Ce que nous faisons concrètement
            </p>
            <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-dark">
              Nos objectifs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {OBJECTIFS.map(({ num, titre, desc }) => (
              <div
                key={num}
                className="bg-warm-white rounded-xl sm:rounded-2xl p-6 border border-border-custom"
              >
                <span className="font-display font-extrabold text-3xl text-terracotta/20 block mb-3">
                  {num}
                </span>
                <h3 className="font-display font-bold text-dark text-base sm:text-lg mb-2">
                  {titre}
                </h3>
                <p className="font-sans text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-14 sm:py-16 lg:py-20 bg-warm-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-terracotta mb-3">
              Ce qui nous guide
            </p>
            <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-dark">
              Nos valeurs
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {VALEURS.map(({ icon, titre, desc }) => (
              <div
                key={titre}
                className="bg-surface rounded-xl p-4 sm:p-5 border border-border-custom text-center"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-terracotta/10 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <i className={`fi ${icon} text-terracotta text-base sm:text-lg`} aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-dark text-xs sm:text-sm mb-1 sm:mb-2">{titre}</h3>
                <p className="font-sans text-muted text-xs leading-relaxed hidden sm:block">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16 bg-surface border-t border-border-custom">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-dark mb-3">
            Prête à essayer Dagan IA ?
          </h2>
          <p className="font-sans text-muted text-sm sm:text-base mb-7">
            Posez votre première question gratuitement. Aucune inscription requise.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all shadow-sm"
          >
            <i className="fi fi-rr-comment-alt text-sm" aria-hidden="true" />
            Démarrer gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-custom py-6 bg-surface">
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
