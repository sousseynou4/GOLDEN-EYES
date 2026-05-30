import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne intelligemment les classes Tailwind en résolvant
 * les conflits (ex : "px-4 px-6" → "px-6").
 *
 * @example
 *   cn("px-4", isActive && "bg-gold-500")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formatte une date ISO en français lisible.
 *
 * @example
 *   formatDate("2025-12-25") // "25 décembre 2025"
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Formatte une date ISO avec l'heure.
 *
 * @example
 *   formatDateTime("2025-12-25T14:30:00Z") // "25 déc. 2025, 15:30"
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Retourne une chaîne tronquée avec ellipse.
 */
export function truncate(text: string, max = 100): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
