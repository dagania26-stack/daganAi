import { cn } from "@/lib/utils";

type BadgeVariant = "ohada" | "otr" | "financement" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  ohada:        "bg-forest text-white",
  otr:          "bg-terracotta text-white",
  financement:  "bg-gold text-white",
  neutral:      "bg-surface text-muted border border-border-custom",
};

export default function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        "font-display text-xs font-bold uppercase tracking-wider",
        "px-2 py-1 rounded-sm",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
