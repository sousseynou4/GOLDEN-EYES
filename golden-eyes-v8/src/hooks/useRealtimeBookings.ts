"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/types";

/**
 * Hook qui maintient une liste de réservations à jour en temps réel.
 * Écoute les INSERT / UPDATE / DELETE sur la table `bookings` via
 * Supabase Realtime (activé dans la migration initiale).
 *
 * @param initial Données initiales (rendues côté serveur)
 */
export function useRealtimeBookings(initial: Booking[]) {
  const [bookings, setBookings] = useState<Booking[]>(initial);

  // Resynchronise si les données serveur changent (revalidation)
  useEffect(() => {
    setBookings(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          setBookings((current) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Booking;
              // Évite les doublons si déjà présent
              if (current.some((b) => b.id === row.id)) return current;
              return [row, ...current];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Booking;
              return current.map((b) => (b.id === row.id ? row : b));
            }
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as { id: string };
              return current.filter((b) => b.id !== oldRow.id);
            }
            return current;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return bookings;
}
