"use client";

import { cn } from "@/lib/utils";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  visible:  boolean;
}

const QUESTIONS = [
  "Comment créer une SARL au Togo ? Quel est le capital minimum ?",
  "Quand dois-je déclarer la TVA ? Comment calculer mon acompte ?",
  "C'est quoi les étapes pour s'enregistrer au CFE ?",
  "Quelle est la différence entre SARL et SA dans le droit OHADA ?",
  "Comment calculer ma patente en tant que petit commerce ?",
] as const;

export default function SuggestedQuestions({ onSelect, visible }: SuggestedQuestionsProps) {
  if (!visible) return null;

  return (
    <div className="w-full px-4 py-3 md:w-[70%] md:px-0 md:mx-auto">
      <p className="text-xs font-display uppercase text-muted tracking-wider mb-3">
        Questions fréquentes
      </p>

      {/* Scroll horizontal mobile, colonne desktop */}
      <div
        className={cn(
          "flex flex-row gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1",
          "md:flex-col md:overflow-x-visible md:snap-none md:pb-0",
        )}
      >
        {QUESTIONS.map((question, i) => (
          <button
            key={i}
            onClick={() => onSelect(question)}
            className={cn(
              // Base
              "shrink-0 snap-start text-left",
              "bg-surface border border-border-custom rounded-xl px-4 py-3",
              "text-sm text-dark leading-snug font-sans",
              // Taille mobile fixe pour le scroll horizontal
              "w-[260px] md:w-full",
              // Hover
              "hover:border-terracotta hover:bg-terracotta/5",
              "transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
            )}
            style={{
              animation: `fade-in-up 0.3s ease ${i * 60}ms both`,
            }}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
