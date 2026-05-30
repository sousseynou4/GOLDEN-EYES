import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema } from "@/lib/validations/booking";
import { sendClientConfirmation, sendAdminNotification } from "@/lib/email";
import type { InsertDto } from "@/types";

/**
 * POST /api/bookings
 * Endpoint public — création d'une réservation depuis le formulaire de contact.
 * RLS policy `Anyone can submit a booking` autorise l'insert anonyme.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation stricte côté serveur (jamais faire confiance au client)
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const insertData: InsertDto<"bookings"> = {
      nom: parsed.data.nom,
      prenom: parsed.data.prenom,
      email: parsed.data.email,
      telephone: parsed.data.telephone,
      adresse: parsed.data.adresse || null,
      date_evenement: parsed.data.date_evenement,
      message: parsed.data.message,
      type_prestation: parsed.data.type_prestation,
      nombre_personnes: parsed.data.nombre_personnes ?? null,
      budget: parsed.data.budget || null,
      lieu: parsed.data.lieu || null,
    };

    const { data, error } = await supabase
      .from("bookings")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
      .select("id")
      .returns<{ id: string }[]>()
      .single();

    if (error || !data) {
      console.error("[POST /api/bookings]", error);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement" },
        { status: 500 },
      );
    }

    // Envoi des emails (n'échoue jamais : dégradation propre si pas de clé)
    // On attend les deux pour garantir l'envoi avant la fin de la requête.
    await Promise.allSettled([
      sendClientConfirmation(parsed.data),
      sendAdminNotification(parsed.data),
    ]);

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bookings] unexpected", err);
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/bookings
 * Endpoint admin — liste des réservations.
 * RLS bloque automatiquement si l'utilisateur n'est pas authentifié.
 */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
