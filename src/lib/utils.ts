import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d  = pad(date.getDate());
  const mo = pad(date.getMonth() + 1);
  const y  = date.getFullYear();
  const h  = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${d}/${mo}/${y} ${h}:${mi}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export function generateId(): string {
  return crypto.randomUUID();
}
