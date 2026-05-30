"use client";

import { useState, useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Mail, Phone, MapPin, Calendar, Trash2, X, Loader2, Search,
  Camera, Users, Wallet,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";
import { updateBookingStatus, deleteBooking } from "@/app/(admin)/dashboard/actions";
import { BOOKING_STATUSES, BOOKING_STATUS_META } from "@/lib/constants";
import { PRESTATION_TYPES } from "@/lib/validations/booking";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

/** Mapping value → label pour l'affichage du type de prestation */
const PRESTATION_LABELS: Record<string, string> = Object.fromEntries(
  PRESTATION_TYPES.map((p) => [p.value, p.label]),
);

interface BookingsTableProps {
  initialBookings: Booking[];
}

/**
 * Tableau des réservations, alimenté en temps réel.
 * - Filtres par statut + recherche texte
 * - Changement de statut inline
 * - Panneau de détail (drawer) au clic
 */
export function BookingsTable({ initialBookings }: BookingsTableProps) {
  const bookings = useRealtimeBookings(initialBookings);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = filter === "all" || b.status === filter;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        `${b.prenom} ${b.nom}`.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [bookings, filter, query]);

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Tous ({bookings.length})
          </FilterChip>
          {BOOKING_STATUSES.map((s) => {
            const count = bookings.filter((b) => b.status === s).length;
            return (
              <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
                {BOOKING_STATUS_META[s].label} ({count})
              </FilterChip>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom, email…"
            className="w-full rounded-full border border-line bg-paper-pure py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-gold-500 focus:outline-none md:w-64"
          />
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="text-ink-muted">Aucune réservation trouvée.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper-pure">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper-warm/50 text-[10px] uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Date événement</th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">Reçu le</th>
                <th className="px-5 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className="cursor-pointer transition hover:bg-paper-warm/40"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-espresso">
                      {b.prenom} {b.nom}
                    </p>
                    <p className="text-xs text-ink-faint">{b.email}</p>
                  </td>
                  <td className="hidden px-5 py-4 text-ink-muted md:table-cell">
                    {formatDate(b.date_evenement)}
                  </td>
                  <td className="hidden px-5 py-4 text-ink-faint lg:table-cell">
                    {formatDate(b.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer détail */}
      <BookingDrawer booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function FilterChip({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-xs font-medium transition",
        active
          ? "bg-espresso text-paper"
          : "border border-line bg-paper-pure text-ink-muted hover:border-espresso hover:text-espresso",
      )}
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function BookingDrawer({
  booking, onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleStatus(status: BookingStatus) {
    if (!booking) return;
    startTransition(async () => {
      const res = await updateBookingStatus(booking.id, status);
      if (res.ok) toast.success(`Statut : ${BOOKING_STATUS_META[status].label}`);
      else toast.error("Erreur", { description: res.error });
    });
  }

  function handleDelete() {
    if (!booking) return;
    startTransition(async () => {
      const res = await deleteBooking(booking.id);
      if (res.ok) {
        toast.success("Réservation supprimée");
        onClose();
      } else {
        toast.error("Erreur", { description: res.error });
      }
    });
  }

  return (
    <AnimatePresence>
      {booking && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-paper p-6 shadow-2xl md:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow mb-2">Dossier client</p>
                <h2 className="font-serif text-3xl text-espresso">
                  {booking.prenom} {booking.nom}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-line p-2 text-ink-muted transition hover:border-espresso hover:text-espresso"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <StatusBadge status={booking.status} />
            </div>

            {/* Coordonnées */}
            <div className="mt-8 space-y-4 border-t border-line pt-6">
              <DetailRow icon={Camera} label="Prestation">
                {PRESTATION_LABELS[booking.type_prestation ?? ""] ?? "Non précisé"}
              </DetailRow>
              <DetailRow icon={Mail} label="Email">
                <a href={`mailto:${booking.email}`} className="hover:text-gold-600">
                  {booking.email}
                </a>
              </DetailRow>
              <DetailRow icon={Phone} label="Téléphone">
                <a href={`tel:${booking.telephone}`} className="hover:text-gold-600">
                  {booking.telephone}
                </a>
              </DetailRow>
              <DetailRow icon={Calendar} label="Date souhaitée">
                {formatDate(booking.date_evenement)}
              </DetailRow>
              {booking.lieu && (
                <DetailRow icon={MapPin} label="Lieu / ville">
                  {booking.lieu}
                </DetailRow>
              )}
              {booking.nombre_personnes != null && (
                <DetailRow icon={Users} label="Nombre de personnes">
                  {booking.nombre_personnes}
                </DetailRow>
              )}
              {booking.budget && (
                <DetailRow icon={Wallet} label="Budget">
                  {booking.budget}
                </DetailRow>
              )}
              {booking.adresse && (
                <DetailRow icon={MapPin} label="Adresse">
                  {booking.adresse}
                </DetailRow>
              )}
            </div>

            {/* Message */}
            <div className="mt-6 border-t border-line pt-6">
              <p className="label">Message du client</p>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-paper-warm p-4 text-sm leading-relaxed text-ink">
                {booking.message}
              </p>
              <p className="mt-2 text-xs text-ink-faint">
                Reçu le {formatDateTime(booking.created_at)}
              </p>
            </div>

            {/* Changement de statut */}
            <div className="mt-8 border-t border-line pt-6">
              <p className="label mb-3">Changer le statut</p>
              <div className="grid grid-cols-2 gap-2">
                {BOOKING_STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={isPending || booking.status === s}
                    onClick={() => handleStatus(s)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed",
                      booking.status === s
                        ? "border-espresso bg-espresso text-paper"
                        : "border-line bg-paper-pure text-ink-muted hover:border-espresso hover:text-espresso disabled:opacity-50",
                    )}
                  >
                    {BOOKING_STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Suppression */}
            <div className="mt-8 border-t border-line pt-6">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-red-500 transition hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer ce dossier
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-muted">Confirmer ?</span>
                  <button
                    disabled={isPending}
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
                  >
                    {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                    Oui, supprimer
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-ink-muted hover:text-espresso"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({
  icon: Icon, label, children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</p>
        <p className="text-sm text-ink">{children}</p>
      </div>
    </div>
  );
}
