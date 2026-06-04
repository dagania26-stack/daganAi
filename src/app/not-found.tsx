import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-white px-6 text-center">

      {/* Logo */}
      <Image
        src="/logo.png"
        alt="Dagan IA"
        width={400}
        height={400}
        className="rounded-2xl mb-8 shadow-sm w-32 h-32 sm:w-52 sm:h-52 md:w-72 md:h-72 lg:w-[360px] lg:h-[360px] object-contain"
        priority
      />

      {/* Message d'erreur */}
      <p className="font-display font-extrabold text-8xl text-terracotta leading-none mb-4">
        404
      </p>
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-dark mb-3">
        Page introuvable
      </h1>
      <p className="font-sans text-muted text-sm sm:text-base leading-relaxed max-w-sm mb-10">
        La page que vous cherchez a été déplacée, supprimée ou n&apos;a jamais existé.
      </p>

      {/* Boutons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all shadow-sm"
        >
          <i className="fi fi-rr-home text-sm" aria-hidden="true" />
          Accueil
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 bg-white border border-[#E8E0D8] text-dark font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#F5F0EB] active:scale-95 transition-all"
        >
          <i className="fi fi-rr-envelope text-sm" aria-hidden="true" />
          Contact
        </Link>
      </div>

    </div>
  );
}
