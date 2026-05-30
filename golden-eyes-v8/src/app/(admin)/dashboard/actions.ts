/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookingStatusSchema } from "@/lib/validations/booking";
import { messageSchema } from "@/lib/validations/auth";
import {
  sendStatusChangeEmail,
  sendNewMessageEmail,
  type BookingForEmail,
} from "@/lib/email";
import type { BookingStatus } from "@/types";

/**
 * Server Actions du dashboard admin.
 * Toutes vérifient l'authentification via le client serveur Supabase
 * (les policies RLS bloquent de toute façon les requêtes anonymes).
 */

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Met à jour le statut d'une réservation.
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<ActionResult> {
  const parsed = bookingStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { ok: false, error: "Données invalides" };
  }

  const supabase = await createClient();

  // Vérifie la session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("bookings") as any)
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  // ── Email au client si statut "Confirmé" ou "Annulé" ──
  if (status === "confirmed" || status === "cancelled") {
    const { data: booking } = await supabase
      .from("bookings")
      .select("prenom, nom, email, date_evenement, type_prestation, lieu")
      .eq("id", id)
      .returns<BookingForEmail[]>()
      .single();

    if (booking) {
      // L'envoi ne bloque pas le retour : on n'attend pas l'achèvement
      // pour ne pas ralentir l'UI, et on capture les éventuelles erreurs.
      sendStatusChangeEmail(booking, status).catch((err) =>
        console.error("[actions] email statut :", err),
      );
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  return { ok: true };
}

/**
 * Supprime une réservation (et ses messages via cascade SQL).
 */
export async function deleteBooking(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  return { ok: true };
}

/**
 * Envoie un message (de l'admin vers le client) lié à une réservation.
 * Par défaut, notifie le client par email. Mettre `notifyClient=false`
 * pour les notes internes ou les brouillons.
 */
export async function sendMessage(
  bookingId: string,
  content: string,
  notifyClient: boolean = true,
): Promise<ActionResult> {
  const parsed = messageSchema.safeParse({ booking_id: bookingId, content });
  if (!parsed.success) {
    return { ok: false, error: "Message invalide" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

// @ts-expect-error: type mismatch avec supabase
  const { error } = await supabase.from("messages_history").insert({
    booking_id: parsed.data.booking_id,
    content: parsed.data.content,
    sender: "admin",
  });

  if (error) return { ok: false, error: error.message };

  // ── Email de notification au client ──
  if (notifyClient) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("prenom, nom, email, date_evenement, type_prestation, lieu")
      .eq("id", bookingId)
      .returns<BookingForEmail[]>()
      .single();

    if (booking) {
      sendNewMessageEmail(booking, parsed.data.content).catch((err) =>
        console.error("[actions] email message :", err),
      );
    }
  }

  revalidatePath("/dashboard/messages");
  return { ok: true };
}

/**
 * Marque tous les messages "client" d'une réservation comme lus.
 */
export async function markMessagesRead(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("messages_history") as any)
    .update({ read_at: new Date().toISOString() })
    .eq("booking_id", bookingId)
    .eq("sender", "client")
    .is("read_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
