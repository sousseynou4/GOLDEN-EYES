import { createClient } from "@/lib/supabase/server";
import { BookingsTable } from "@/components/admin/BookingsTable";
import type { Booking } from "@/types";

export const metadata = { title: "Réservations" };
export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Booking[]>();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-espresso">Réservations</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Toutes les demandes, mises à jour en temps réel.
        </p>
      </header>

      <BookingsTable initialBookings={data ?? []} />
    </div>
  );
}
