"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  message:   string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  // Auto-dismiss après 5 secondes
  useEffect(() => {
    const id = setTimeout(onDismiss, 5_000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      className={cn(
        "animate-slide-down",
        "flex items-center gap-3",
        "bg-red-50 border-l-4 border-terracotta text-dark",
        "text-sm px-4 py-3",
      )}
    >
      {/* Icône alerte — Flaticon Uicons fi-rr-triangle-warning */}
      <i className="fi fi-rr-triangle-warning text-terracotta text-base shrink-0" aria-hidden="true" />

      <span className="flex-1 font-sans leading-snug">{message}</span>

      {/* Bouton fermer */}
      <button
        onClick={onDismiss}
        aria-label="Fermer le message d'erreur"
        className={cn(
          "shrink-0 w-7 h-7 flex items-center justify-center rounded",
          "text-muted hover:text-dark hover:bg-red-100",
          "transition-colors duration-150",
        )}
      >
        <i className="fi fi-rr-cross-small text-base" aria-hidden="true" />
      </button>
    </div>
  );
}
