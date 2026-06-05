"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InputBarProps {
  onSend:        (question: string) => void;
  isLoading:     boolean;
  onStop?:       () => void;
  prefill?:      { value: string; seq: number };
}

const MAX_CHARS  = 500;
const WARN_AT    = 450;

export default function InputBar({ onSend, isLoading, onStop, prefill }: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount    = value.length;
  const isEmpty      = value.trim().length === 0;
  const isDisabled   = isLoading || isEmpty || charCount > MAX_CHARS;
  const isNearLimit  = charCount > WARN_AT;

  // Auto-resize textarea jusqu'à 4 lignes (≈ 120px)
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleSend = useCallback(() => {
    const q = value.trim();
    if (!q || isLoading || q.length > MAX_CHARS) return;
    onSend(q);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Pré-remplissage depuis le bouton "Modifier" d'un message
  useEffect(() => {
    if (!prefill?.value) return;
    setValue(prefill.value);
    requestAnimationFrame(() => {
      adjustHeight();
      textareaRef.current?.focus();
    });
  // seq change → force re-run même si le texte est identique
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.seq]);

  return (
    <div
      className="sticky bottom-0 z-40 w-full bg-warm-white border-t border-border-custom shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div className="mx-auto max-w-2xl px-4 pt-3 pb-0">

        {/* Compteur de caractères */}
        {charCount > 0 && (
          <div className="flex justify-end mb-1">
            <span
              className={cn(
                "text-xs tabular-nums transition-colors duration-150",
                isNearLimit ? "text-terracotta font-medium" : "text-muted",
              )}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        )}

        {/* Zone de saisie */}
        <div className="flex items-end gap-3 pb-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Pose ta question…"
            rows={1}
            maxLength={MAX_CHARS + 50}
            className={cn(
              "flex-1 resize-none overflow-hidden",
              "font-sans text-sm text-dark leading-relaxed",
              "bg-surface border border-border-custom rounded-xl",
              "px-4 py-3 min-h-[44px]",
              "placeholder:text-muted",
              "focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-150",
            )}
            aria-label="Saisir une question"
          />

          {/* Bouton Stop (pendant le chargement) ou Envoyer */}
          {isLoading && onStop ? (
            <button
              onClick={onStop}
              aria-label="Arrêter la réponse"
              title="Arrêter"
              className={cn(
                "shrink-0 w-11 h-11 rounded-full",
                "flex items-center justify-center",
                "bg-dark/10 text-dark border border-dark/20",
                "hover:bg-dark/20 active:scale-90",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2",
              )}
            >
              <i className="fi fi-rr-stop-circle text-base leading-none" aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={isDisabled}
              aria-label="Envoyer la question"
              className={cn(
                "shrink-0 w-11 h-11 rounded-full",
                "flex items-center justify-center",
                "bg-terracotta text-white",
                "transition-all duration-150 active:scale-90",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2",
              )}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
