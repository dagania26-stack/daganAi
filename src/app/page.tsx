import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import DomainBadge from "@/components/layout/DomainBadge";

export const metadata: Metadata = {
  title: "Dagan IA — Grande Sœur Numérique pour les femmes entrepreneures",
  description:
    "Assistant IA spécialisé en droit OHADA, fiscalité OTR et financement pour les femmes entrepreneures du Togo et du Bénin.",
};

const FEATURES = [
  {
    domaine: "OHADA" as const,
    titre: "Droit des affaires",
    desc: "Création d'entreprise, RCCM, formes juridiques (SARL, SA, GIE), obligations légales.",
    image: "/droit.png",
  },
  {
    domaine: "OTR" as const,
    titre: "Fiscalité & Taxes",
    desc: "TPU, TVA, déclarations fiscales, délais, patente et obligations auprès de l'OTR.",
    image: "/otr.png",
  },
  {
    domaine: "FINANCEMENT" as const,
    titre: "Accès au financement",
    desc: "Microfinance, fonds FAIEJ, subventions PME féminines, crédits et garanties bancaires.",
    image: "/finace.png",
  },
] as const;

const PARTNERS = [
  { src: "/partner/atd.png",              alt: "ATD" },
  { src: "/partner/cube.png",             alt: "Cube Incubator" },
  { src: "/partner/djantahub.png",        alt: "Djanta Hub" },
  { src: "/partner/logo-dclic.png",       alt: "D-Clic" },
  { src: "/partner/Logo_AUF.png",         alt: "Agence Universitaire de la Francophonie" },
  { src: "/partner/minister-numeric.png", alt: "Ministère du Numérique" },
  { src: "/partner/tchamba-commune.png",  alt: "Commune de Tchamba" },
];

const STEPS = [
  {
    num: "1",
    titre: "Pose ta question",
    desc: "En français, comme tu parlerais à une conseillère.",
    icon: "fi-rr-comment-question",
  },
  {
    num: "2",
    titre: "Dagan analyse",
    desc: "L'IA consulte notre base documentaire vérifiée : OHADA, OTR, financement.",
    icon: "fi-rr-search-alt",
  },
  {
    num: "3",
    titre: "Réponse vérifiée",
    desc: "Réponse claire avec sources citées, adaptée au contexte togolais et béninois.",
    icon: "fi-rr-check-circle",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center min-h-[88vh] sm:min-h-[82vh] lg:min-h-[90vh] overflow-hidden">
        {/* Background image — luminosité réduite à 60% */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-im.png')", filter: "brightness(0.6)" }}
        />
        {/* Voile sombre */}
        <div className="absolute inset-0 bg-black/72 pointer-events-none" />

        {/* Contenu */}
        <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-20 text-center">

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl xl:text-7xl text-white leading-tight mb-5 sm:mb-6">
            Votre{" "}
            <span className="text-[#f4a07a]">Grande Sœur</span>
            <br />
            Numérique
          </h1>

          <p className="font-sans text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto">
            Créez et développez votre entreprise en toute confiance.
            Des réponses claires, vérifiées et adaptées aux femmes
            entrepreneures du Togo et du Bénin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 lg:gap-[40px] justify-center w-full sm:w-auto">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-8 py-4 rounded-xl min-h-[52px] hover:bg-[#a33a0c] active:scale-95 transition-all duration-150 text-base sm:text-lg shadow-lg w-full sm:w-auto"
            >
              <i className="fi fi-rr-comment-alt" aria-hidden="true" />
              Commencer gratuitement
            </Link>
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm border border-white/40 text-white font-display font-semibold px-8 py-4 rounded-xl min-h-[52px] hover:bg-white/25 transition-colors text-base sm:text-lg w-full sm:w-auto"
            >
              <i className="fi fi-rr-info" aria-hidden="true" />
              En savoir plus
            </a>
          </div>
        </div>

        {/* Dégradé bas pour transition douce vers la section suivante */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F5F0EB] to-transparent pointer-events-none" />
      </section>

      {/* ── Domaines ─────────────────────────────────────────────────────────── */}
      <section className="bg-surface py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-terracotta mb-3">
              Nos domaines d&apos;expertise
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-dark">
              Tout ce dont vous avez besoin
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {FEATURES.map(({ domaine, titre, desc, image }) => (
              <div
                key={domaine}
                className="bg-warm-white rounded-xl sm:rounded-2xl overflow-hidden border border-border-custom hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative w-full h-44 sm:h-48 md:h-52 lg:h-56 xl:h-60">
                  <Image
                    src={image}
                    alt={titre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <DomainBadge domaine={domaine} className="mb-3" />
                  <h3 className="font-display font-bold text-dark text-base sm:text-lg mb-2">{titre}</h3>
                  <p className="font-sans text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────────────────── */}
      <section id="comment-ca-marche" className="py-14 sm:py-16 lg:py-20 bg-warm-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-terracotta mb-3">
              Simple et rapide
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-dark">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
            {STEPS.map(({ num, titre, desc, icon }) => (
              <div key={num} className="flex flex-row md:flex-col items-start md:items-center md:text-center gap-4 md:gap-0">
                <div className="relative shrink-0 mb-0 md:mb-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-terracotta/10 flex items-center justify-center">
                    <i className={`fi ${icon} text-terracotta text-lg md:text-xl`} aria-hidden="true" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-terracotta text-white font-display font-bold text-[10px] md:text-xs rounded-full flex items-center justify-center">
                    {num}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-dark text-base md:text-lg mb-1 md:mb-2">{titre}</h3>
                  <p className="font-sans text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignage ────────────────────────────────────────────────────────── */}
      <section className="bg-terracotta py-14 sm:py-16 lg:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg,transparent,transparent 5px,rgba(255,255,255,.5) 5px,rgba(255,255,255,.5) 6px)",
              "repeating-linear-gradient(90deg,transparent,transparent 5px,rgba(255,255,255,.5) 5px,rgba(255,255,255,.5) 6px)",
            ].join(", "),
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8 md:gap-10 lg:gap-14">
          <div className="flex-1 text-center md:text-left">
            <i className="fi fi-rr-quote-right text-white/30 text-4xl sm:text-5xl mb-4 block" aria-hidden="true" />
            <p className="font-display text-white text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed mb-6">
              &ldquo;Dagan IA m&apos;a aidée à comprendre les démarches pour créer
              ma SARL en moins de 10 minutes. C&apos;est comme avoir une avocate dans ma poche.&rdquo;
            </p>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Image
                src="/fem-souriante.png"
                alt="Akoua Mensah"
                width={44}
                height={44}
                className="rounded-full object-cover border-2 border-white/30 shrink-0"
              />
              <div className="text-left">
                <p className="font-display font-bold text-white text-sm">Akoua Mensah</p>
                <p className="text-white/60 text-xs font-sans">Commerçante, Lomé</p>
              </div>
            </div>
          </div>

          <div className="shrink-0 grid grid-cols-2 gap-3 w-full max-w-[260px] sm:max-w-sm md:max-w-[260px] lg:max-w-xs">
            {["/fem-2.png", "/fem-3.png"].map((src, i) => (
              <Image
                key={i}
                src={src}
                alt="Femme entrepreneuse"
                width={200}
                height={220}
                className="rounded-xl object-cover w-full aspect-[3/4] opacity-90"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Partenaires ──────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center mb-8 sm:mb-10">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-terracotta mb-3">
            Ils nous font confiance
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-dark">
            Nos partenaires
          </h2>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee gap-12 sm:gap-16 lg:gap-20 w-max items-center">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <div key={i} className="shrink-0 flex items-center justify-center h-16 sm:h-20">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={180}
                  height={80}
                  className="object-contain h-14 sm:h-18 w-auto max-h-[72px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 lg:py-20 bg-surface">
        <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-dark mb-3 sm:mb-4">
            Prête à développer votre entreprise ?
          </h2>
          <p className="font-sans text-muted text-sm sm:text-base leading-relaxed mb-7 sm:mb-8">
            Posez votre première question gratuitement. Aucune inscription requise.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all shadow-sm w-full sm:w-auto max-w-xs"
          >
            <i className="fi fi-rr-comment-alt" aria-hidden="true" />
            Démarrer avec Dagan IA
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-dark text-white/60 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Dagan IA" width={26} height={26} className="rounded-md opacity-80" />
            <span className="font-display font-bold text-white text-base sm:text-lg">Dagan IA</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-sm font-display justify-center">
            {[
              { href: "/",               label: "Accueil"          },
              { href: "/chat",           label: "Chat IA"          },
              { href: "/a-propos",       label: "À propos"         },
              { href: "/contact",        label: "Contact"          },
              { href: "/confidentialite", label: "Confidentialité" },
              { href: "/conditions",     label: "Conditions"       },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>

          <p className="text-xs text-white/30 font-sans">
            &copy; {new Date().getFullYear()} Dagan IA
          </p>
        </div>
      </footer>
    </div>
  );
}
