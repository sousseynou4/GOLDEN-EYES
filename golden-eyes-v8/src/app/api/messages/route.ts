import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validations/auth";
import type { InsertDto } from "@/types";

/**
 * POST /api/messages
 * Endpoint admin — envoie d'un message lié à une réservation.
 * RLS bloque automatiquement les requêtes non authentifiées.
 */
export async function POST(request: Request) {
  const body = await request.json();

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const insertData: InsertDto<"messages_history"> = {
    booking_id: parsed.data.booking_id,
    content: parsed.data.content,
    sender: "admin",
  };

  const { data, error } = await supabase
    .from("messages_history")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertData as any)
    .select("id")
    .returns<{ id: string }[]>()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Erreur lors de l'envoi" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
