"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ToastType = "info" | "error" | "success";

interface ToastProps {
  message:   string;
  type?:     ToastType;
  duration?: number;
  onDismiss: () => void;
}

const TYPE_CLASSES: Record<ToastType, string> = {
  info:    "bg-dark    text-white",
  error:   "bg-terracotta text-white",
  success: "bg-forest  text-white",
};

export default function Toast({
  message,
  type      = "info",
  duration  = 3_000,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onDismiss, duration);
    return () => clearTimeout(id);
  }, [duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "animate-slide-up",
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
        "w-[calc(100%-2rem)] max-w-sm",
        "rounded-xl px-4 py-3",
        "font-sans text-sm text-center",
        "shadow-lg select-none",
        TYPE_CLASSES[type],
      )}
    >
      {message}
    </div>
  );
}
