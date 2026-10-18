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
 * Demande de réinitialisation du mot de passe.
 */
export const forgotPasswordSchema = loginSchema.pick({ email: true });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Choix d'un nouveau mot de passe.
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Le mot de passe doit contenir au moins 10 caractères")
      .max(72, "Mot de passe trop long (72 caractères max)"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Les deux mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

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
