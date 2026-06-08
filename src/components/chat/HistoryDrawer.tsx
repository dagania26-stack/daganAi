"use client";

import { useEffect } from "react";
import type { ConversationSummary } from "@/types";
import Spinner from "@/components/ui/Spinner";

export interface HistoryDrawerProps {
  open:           boolean;
  conversations:  ConversationSummary[];
  isLoading:      boolean;
  activeId:       string | null;
  onClose:        () => void;
  onSelect:       (id: string) => void;
  onNewConversation: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function HistoryDrawer({
  open, conversations, isLoading, activeId, onClose, onSelect, onNewConversation,
}: HistoryDrawerProps) {
  // Empêche le scroll du fond pendant l'ouverture
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Fond assombri */}
      <button
        type="button"
        aria-label="Fermer l'historique"
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Panneau */}
      <aside className="relative ml-auto h-full w-full max-w-xs bg-warm-white shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
        <header className="flex items-center justify-between px-4 h-14 border-b border-black/5 shrink-0">
          <h2 className="font-display font-bold text-base text-dark">Historique</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 active:scale-95 transition-all duration-150"
          >
            <i className="fi fi-rr-cross text-dark text-sm leading-none" aria-hidden="true" />
          </button>
        </header>

        <div className="px-4 py-3 shrink-0">
          <button
            type="button"
            onClick={() => { onNewConversation(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-terracotta text-white font-medium text-sm py-2.5 hover:bg-terracotta/90 active:scale-[0.98] transition-all duration-150"
          >
            <i className="fi fi-rr-plus text-sm leading-none" aria-hidden="true" />
            Nouvelle conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Spinner size="md" />
            </div>
          )}

          {!isLoading && conversations.length === 0 && (
            <p className="text-center text-sm text-muted mt-10 px-4">
              Aucune conversation enregistrée pour l&apos;instant.
            </p>
          )}

          {!isLoading && conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => { onSelect(conv.id); onClose(); }}
              className={`w-full text-left rounded-xl px-3 py-2.5 mb-1 transition-colors duration-150 ${
                conv.id === activeId ? "bg-terracotta/10" : "hover:bg-black/5"
              }`}
            >
              <p className="font-medium text-sm text-dark truncate">{conv.titre}</p>
              {conv.apercu && (
                <p className="text-xs text-muted truncate mt-0.5">{conv.apercu}</p>
              )}
              <p className="text-[11px] text-muted/70 mt-1">{formatDate(conv.derniereMaj)}</p>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
