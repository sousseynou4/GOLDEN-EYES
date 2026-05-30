"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";

/**
 * Maintient le fil de messages d'une réservation à jour en temps réel.
 * Filtre les événements Realtime sur `booking_id`.
 */
export function useRealtimeMessages(bookingId: string | null, initial: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initial);

  useEffect(() => {
    setMessages(initial);
  }, [initial]);

  useEffect(() => {
    if (!bookingId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`messages-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages_history",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const row = payload.new as Message;
          setMessages((current) =>
            current.some((m) => m.id === row.id) ? current : [...current, row],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  return messages;
}
