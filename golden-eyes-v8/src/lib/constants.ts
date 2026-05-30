/**
 * Constantes globales de l'application Golden Eyes.
 */

export const SITE_CONFIG = {
  name: "Golden Eyes",
  tagline: "Capturer la lumière, révéler l'instant.",
  description:
    "Photographe professionnel — portraits, mariages, événements et reportages d'auteur.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  email: "contact@golden-eyes.fr",
  social: {
    instagram: "https://instagram.com/goldeneyes",
    facebook: "https://facebook.com/goldeneyes",
  },
} as const;

/**
 * Statuts métier d'une réservation.
 * ⚠️ Doit rester aligné avec l'enum `booking_status` dans la DB.
 */
export const BOOKING_STATUSES = [
  "pending", // En attente
  "confirmed", // Confirmé
  "completed", // Terminé
  "cancelled", // Annulé
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/**
 * Mapping des statuts vers leur libellé français et leur couleur Tailwind.
 */
export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmé", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Terminé", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-700" },
};

/**
 * Routes principales de l'application.
 * Centralisées ici pour éviter les magic strings.
 */
export const ROUTES = {
  home: "/",
  portfolio: "/portfolio",
  about: "/about",
  contact: "/contact",
  login: "/login",
  dashboard: "/dashboard",
  bookings: "/dashboard/bookings",
  messages: "/dashboard/messages",
  media: "/dashboard/media",
} as const;
