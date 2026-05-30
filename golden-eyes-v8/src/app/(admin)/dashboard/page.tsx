import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS_META, ROUTES } from "@/lib/constants";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

export const metadata = { title: "Vue d'ensemble" };
export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Booking[]>();

  const all = bookings ?? [];
  const counts: Record<BookingStatus, number> = {
    pending: 0, confirmed: 0, completed: 0, cancelled: 0,
  };
  all.forEach((b) => {
    counts[b.status] = counts[b.status] + 1;
  });

  const statuses: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];
  const recent = all.slice(0, 5);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-espresso">Tableau de bord</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Vue d&apos;ensemble de votre activité.
        </p>
      </header>

      {/* Compteurs */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statuses.map((status) => (
          <div key={status} className="rounded-2xl border border-line bg-paper-pure p-5">
            <p className="text-[10px] uppercase tracking-editorial text-ink-faint">
              {BOOKING_STATUS_META[status].label}
            </p>
            <p className="mt-2 font-serif text-4xl text-gold-600">{counts[status]}</p>
          </div>
        ))}
      </section>

      {/* Dernières demandes */}
      <section className="rounded-2xl border border-line bg-paper-pure p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-espresso">Dernières demandes</h2>
          <Link
            href={ROUTES.bookings}
            className="group inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink-muted transition hover:text-gold-600"
          >
            Tout voir
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">
            Aucune demande pour l&apos;instant. Les réservations reçues via le
            formulaire apparaîtront ici.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {recent.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-espresso">
                    {b.prenom} {b.nom}
                  </p>
                  <p className="truncate text-xs text-ink-faint">
                    {b.email} · {formatDate(b.date_evenement)}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
