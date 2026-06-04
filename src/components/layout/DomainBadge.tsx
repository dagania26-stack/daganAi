import { cn } from "@/lib/utils";
import type { RAGDomain } from "@/types";

interface DomainBadgeProps {
  domaine: RAGDomain | null;
  className?: string;
}

type DomainConfig = {
  label: string;
  classes: string;
};

const DOMAIN_CONFIG: Record<RAGDomain, DomainConfig> = {
  OHADA:       { label: "OHADA",       classes: "bg-forest      text-white" },
  OTR:         { label: "OTR",         classes: "bg-terracotta  text-white" },
  FINANCEMENT: { label: "Financement", classes: "bg-gold        text-white" },
  ALL:         { label: "Tous les domaines", classes: "bg-surface text-muted border border-border-custom" },
};

export default function DomainBadge({ domaine, className }: DomainBadgeProps) {
  const config = domaine ? DOMAIN_CONFIG[domaine] : DOMAIN_CONFIG.ALL;

  return (
    <span
      className={cn(
        "inline-flex items-center",
        "font-display text-xs font-bold uppercase tracking-wider",
        "px-2 py-1 rounded-sm",
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
