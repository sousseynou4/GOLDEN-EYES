import { z } from "zod";

/**
 * Schéma de connexion admin.
 */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schéma d'un message envoyé depuis le dashboard vers un client.
 */
export const messageSchema = z.object({
  booking_id: z.string().uuid(),
  content: z
    .string()
    .trim()
    .min(1, "Message vide")
    .max(5000, "Message trop long (max 5000 caractères)"),
});

export type MessageInput = z.infer<typeof messageSchema>;
