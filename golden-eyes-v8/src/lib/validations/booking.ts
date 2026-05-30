import { z } from "zod";

/**
 * Regex téléphone français (formats acceptés) :
 *   06 12 34 56 78
 *   +33 6 12 34 56 78
 *   0033 6.12.34.56.78
 */
const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

/**
 * Types de prestation proposés dans le formulaire.
 * (value = stocké en base, label = affiché à l'utilisateur)
 */
export const PRESTATION_TYPES = [
  { value: "mariage", label: "Mariage" },
  { value: "portrait", label: "Portrait" },
  { value: "evenement", label: "Événement" },
  { value: "reportage", label: "Reportage" },
  { value: "autre", label: "Autre" },
] as const;

/**
 * Fourchettes de budget proposées.
 */
export const BUDGET_RANGES = [
  "Moins de 500 €",
  "500 € – 1000 €",
  "1000 € – 2000 €",
  "2000 € – 5000 €",
  "Plus de 5000 €",
  "À discuter",
] as const;

/**
 * Schéma de validation d'une réservation.
 * Identique côté client et côté serveur (Server Actions / API).
 */
export const bookingSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom est trop long"),

  prenom: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom est trop long"),

  email: z.string().trim().toLowerCase().email("Adresse email invalide"),

  telephone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro de téléphone invalide (format français attendu)"),

  adresse: z
    .string()
    .trim()
    .max(200, "L'adresse est trop longue")
    .optional()
    .or(z.literal("")),

  date_evenement: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Date invalide")
    .refine(
      (v) => new Date(v) >= new Date(new Date().setHours(0, 0, 0, 0)),
      "La date doit être dans le futur",
    ),

  // ── Nouveaux champs ──
  type_prestation: z
    .enum(["mariage", "portrait", "evenement", "reportage", "autre"], {
      errorMap: () => ({ message: "Veuillez choisir un type de prestation" }),
    }),

  nombre_personnes: z
    .union([
      z.coerce
        .number()
        .int("Nombre entier attendu")
        .min(1, "Au moins 1 personne")
        .max(10000, "Nombre trop grand"),
      z.literal("").transform(() => undefined),
    ])
    .optional(),

  budget: z.string().trim().max(50).optional().or(z.literal("")),

  lieu: z
    .string()
    .trim()
    .max(120, "Le lieu est trop long")
    .optional()
    .or(z.literal("")),

  message: z
    .string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message est trop long (max 2000 caractères)"),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/**
 * Schéma de mise à jour du statut d'une réservation (côté admin).
 */
export const bookingStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;
