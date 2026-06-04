import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const SIZES: Record<NonNullable<SpinnerProps["size"]>, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

export default function Spinner({
  size = "md",
  color = "#C1440E",
  className,
}: SpinnerProps) {
  const px = SIZES[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin", className)}
      role="status"
      aria-label="Chargement en cours"
      style={{ color }}
    >
      {/* Cercle de fond */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.2"
      />
      {/* Arc animé */}
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
