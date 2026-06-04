"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Error boundary]", error);
  }, [error]);

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-warm-white px-6 text-center">

      {/* Icône */}
      <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mb-6">
        <i className="fi fi-rr-triangle-warning text-terracotta text-2xl" aria-hidden="true" />
      </div>

      <h1 className="font-display font-bold text-2xl text-dark mb-2">
        Quelque chose s&apos;est mal passé
      </h1>
      <p className="text-muted text-sm mb-8 max-w-xs leading-relaxed">
        Une erreur inattendue est survenue. Tu peux réessayer ou revenir à l&apos;accueil.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3 rounded-lg min-h-[44px] hover:bg-[#a33a0c] transition-colors active:scale-95"
        >
          <i className="fi fi-rr-refresh text-sm" aria-hidden="true" />
          Recommencer
        </button>
        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-surface border border-border-custom text-dark font-display font-semibold px-6 py-3 rounded-lg min-h-[44px] hover:bg-[#ede8e2] transition-colors"
        >
          <i className="fi fi-rr-home text-sm" aria-hidden="true" />
          Accueil
        </Link>
      </div>

    </div>
  );
}
