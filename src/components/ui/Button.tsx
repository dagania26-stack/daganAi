import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  disabled?: boolean;
  loading?:  boolean;
  onClick?:  () => void;
  type?:     "button" | "submit" | "reset";
  className?: string;
  children:  React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-terracotta text-white " +
    "hover:bg-[#a33a0c] active:scale-95 " +
    "disabled:bg-terracotta/50 disabled:cursor-not-allowed",
  secondary:
    "bg-surface text-dark border border-border-custom " +
    "hover:bg-[#ede8e2] active:scale-95 " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-dark " +
    "hover:bg-surface active:scale-95 " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-2   min-h-[44px]",
  md: "text-sm px-4 py-2.5 min-h-[44px]",
  lg: "text-base px-6 py-3 min-h-[44px]",
};

const SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary:   "#ffffff",
  secondary: "#C1440E",
  ghost:     "#C1440E",
};

export default function Button({
  variant  = "primary",
  size     = "md",
  disabled = false,
  loading  = false,
  onClick,
  type     = "button",
  className,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn(
        // Base
        "inline-flex items-center justify-center gap-2",
        "font-display font-semibold rounded-lg",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2",
        "select-none",
        // Variant + Size
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
    >
      {loading && (
        <Spinner
          size="sm"
          color={SPINNER_COLOR[variant]}
          className="shrink-0"
        />
      )}
      {children}
    </button>
  );
}
