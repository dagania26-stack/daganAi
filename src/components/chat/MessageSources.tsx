"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RAGSource } from "@/types";

interface MessageSourcesProps {
  sources: RAGSource[];
}

type DomainStyle = { bg: string; text: string; label: string };

const DOMAIN_STYLES: Record<string, DomainStyle> = {
  OHADA:       { bg: "bg-forest",     text: "text-white", label: "OHADA"       },
  OTR:         { bg: "bg-terracotta", text: "text-white", label: "OTR"         },
  FINANCEMENT: { bg: "bg-gold",       text: "text-white", label: "Financement" },
};

function getDomainStyle(domaine: string): DomainStyle {
  return DOMAIN_STYLES[domaine.toUpperCase()] ?? {
    bg: "bg-surface", text: "text-muted", label: domaine,
  };
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

export default function MessageSources({ sources }: MessageSourcesProps) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-2 w-full">
      {/* Header cliquable */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 w-full text-left",
          "text-xs text-muted font-display uppercase tracking-wider",
          "hover:text-dark transition-colors duration-150",
        )}
        aria-expanded={expanded}
      >
        {/* Icône document — Flaticon Uicons fi-rr-document */}
        <i className="fi fi-rr-document text-xs shrink-0" aria-hidden="true" />

        <span>
          {sources.length} source{sources.length > 1 ? "s" : ""} consultée{sources.length > 1 ? "s" : ""}
        </span>

        {/* Chevron animé — Flaticon Uicons fi-rr-angle-small-down */}
        <i
          className={cn(
            "fi fi-rr-angle-small-down text-xs ml-0.5 transition-transform duration-200",
            expanded ? "rotate-180" : "rotate-0",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Liste dépliable */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          expanded ? "max-h-[600px] mt-2 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="flex flex-col gap-2">
          {sources.map((source, i) => {
            const ds  = getDomainStyle(source.domaine);
            const pct = Math.round(source.score * 100);

            return (
              <div
                key={i}
                className="bg-white/60 border border-border-custom rounded-lg px-3 py-2.5 space-y-1.5"
              >
                {/* Badge domaine + titre */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center font-display text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm",
                      ds.bg, ds.text,
                    )}
                  >
                    {ds.label}
                  </span>
                  <span className="text-xs font-medium text-dark leading-tight">
                    {source.documentTitre}
                  </span>
                </div>

                {/* Extrait */}
                <p className="text-xs text-muted italic leading-relaxed">
                  {truncate(source.extrait, 120)}
                </p>

                {/* Barre de pertinence */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-border-custom rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terracotta rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted tabular-nums">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
