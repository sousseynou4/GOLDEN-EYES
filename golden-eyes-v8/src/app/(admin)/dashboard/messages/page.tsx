import { createClient } from "@/lib/supabase/server";
import { MessagesPanel } from "@/components/admin/MessagesPanel";
import type { Booking } from "@/types";

export const metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Booking[]>();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-espresso">
          Messages — Replay Récent
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Répondez aux clients et suivez les échanges en temps réel.
        </p>
      </header>

      <MessagesPanel initialBookings={data ?? []} />
    </div>
  );
}
