import Link from "next/link";
import Image from "next/image";

// Motif Kente discret en CSS pur (grille + diagonales, opacité 0.08-0.10)
const KENTE_PATTERN = [
  "repeating-linear-gradient(0deg,   transparent, transparent 5px, rgba(255,255,255,0.07) 5px, rgba(255,255,255,0.07) 6px)",
  "repeating-linear-gradient(90deg,  transparent, transparent 5px, rgba(255,255,255,0.07) 5px, rgba(255,255,255,0.07) 6px)",
  "repeating-linear-gradient(45deg,  transparent, transparent 9px, rgba(212,160,23,0.09)  9px, rgba(212,160,23,0.09)  10px)",
  "repeating-linear-gradient(-45deg, transparent, transparent 9px, rgba(212,160,23,0.09)  9px, rgba(212,160,23,0.09)  10px)",
].join(", ");

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full bg-terracotta shadow-sm"
      style={{ backgroundImage: KENTE_PATTERN }}
    >
      <div className="mx-auto max-w-2xl px-4 h-14 md:h-16 flex items-center justify-between">

        {/* Bouton retour accueil */}
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          title="Accueil"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all duration-150"
        >
          <i className="fi fi-rr-arrow-left text-white text-base leading-none" aria-hidden="true" />
        </Link>

        {/* Logo + tagline */}
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Dagan IA" width={32} height={32} className="rounded-lg shrink-0" />
          <div className="flex flex-col leading-none text-left">
            <span className="font-display font-extrabold text-base sm:text-xl text-white tracking-tight">
              Dagan IA
            </span>
            <span className="hidden sm:block text-xs text-white/70 italic font-sans mt-0.5">
              Grande Sœur Numérique
            </span>
          </div>
        </div>

        {/* Spacer pour équilibrer le bouton retour */}
        <div className="w-9" aria-hidden="true" />

      </div>
    </header>
  );
}
