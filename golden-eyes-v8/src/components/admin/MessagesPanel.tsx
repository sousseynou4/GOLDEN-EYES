"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Send, Loader2, Inbox } from "lucide-react";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { sendMessage } from "@/app/(admin)/dashboard/actions";
import { StatusBadge } from "./StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, cn } from "@/lib/utils";
import type { Booking, Message } from "@/types";

interface MessagesPanelProps {
  initialBookings: Booking[];
}

/**
 * Interface "Replay Récent" : liste des dossiers à gauche, fil de
 * discussion à droite. Tout est temps réel (réservations + messages).
 */
export function MessagesPanel({ initialBookings }: MessagesPanelProps) {
  const bookings = useRealtimeBookings(initialBookings);
  const [activeId, setActiveId] = useState<string | null>(
    initialBookings[0]?.id ?? null,
  );

  const active = bookings.find((b) => b.id === activeId) ?? null;

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line py-20 text-center">
        <Inbox className="mx-auto h-10 w-10 text-ink-faint" />
        <p className="mt-4 text-ink-muted">Aucune conversation pour l&apos;instant.</p>
        <p className="mt-1 text-xs text-ink-faint">
          Les demandes reçues via le formulaire apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-4 md:grid-cols-[300px,1fr]">
      {/* Liste des dossiers */}
      <aside className="overflow-y-auto rounded-2xl border border-line bg-paper-pure">
        {bookings.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveId(b.id)}
            className={cn(
              "w-full border-b border-line px-4 py-3 text-left transition",
              activeId === b.id ? "bg-paper-warm" : "hover:bg-paper-warm/50",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-medium text-espresso">
                {b.prenom} {b.nom}
              </p>
            </div>
            <p className="truncate text-xs text-ink-faint">{b.email}</p>
            <div className="mt-1.5">
              <StatusBadge status={b.status} />
            </div>
          </button>
        ))}
      </aside>

      {/* Fil de discussion */}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-pure">
        {active ? (
          <Conversation key={active.id} booking={active} />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">
            Sélectionnez un dossier
          </div>
        )}
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function Conversation({ booking }: { booking: Booking }) {
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [notifyClient, setNotifyClient] = useState(true);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Charge l'historique au montage / changement de dossier
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("messages_history")
      .select("*")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: true })
      .returns<Message[]>()
      .then(({ data }) => {
        if (!cancelled) {
          setInitialMessages(data ?? []);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [booking.id]);

  const messages = useRealtimeMessages(booking.id, initialMessages);

  // Auto-scroll en bas à chaque nouveau message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    startTransition(async () => {
      const res = await sendMessage(booking.id, content, notifyClient);
      if (!res.ok) {
        toast.error("Envoi échoué", { description: res.error });
        setDraft(content); // restaure le brouillon
      } else if (notifyClient) {
        toast.success("Message envoyé", {
          description: "Le client a été notifié par email.",
        });
      }
    });
  }

  return (
    <>
      {/* En-tête conversation */}
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="font-medium text-espresso">
            {booking.prenom} {booking.nom}
          </p>
          <a
            href={`mailto:${booking.email}`}
            className="text-xs text-ink-faint hover:text-gold-600"
          >
            {booking.email}
          </a>
        </div>
        <StatusBadge status={booking.status} />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {/* Le message original du formulaire en premier */}
        <Bubble sender="client" content={booking.message} date={booking.created_at} isOriginal />

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
          </div>
        ) : (
          messages.map((m) => (
            <Bubble key={m.id} sender={m.sender} content={m.content} date={m.created_at} />
          ))
        )}
      </div>

      {/* Composeur */}
      <div className="border-t border-line p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Écrire une réponse… (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)"
            className="max-h-32 flex-1 resize-none rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isPending || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-espresso text-paper transition hover:bg-gold-500 hover:text-espresso disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Envoyer"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        {/* Case "Notifier par email" */}
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
          <input
            type="checkbox"
            checked={notifyClient}
            onChange={(e) => setNotifyClient(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer accent-gold-600"
          />
          Notifier le client par email
          {!notifyClient && (
            <span className="text-ink-faint">
              · note interne (ne sera pas envoyée au client)
            </span>
          )}
        </label>
      </div>
    </>
  );
}

function Bubble({
  sender, content, date, isOriginal = false,
}: {
  sender: "admin" | "client";
  content: string;
  date: string;
  isOriginal?: boolean;
}) {
  const isAdmin = sender === "admin";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isAdmin ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[75%]", isAdmin && "items-end")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isAdmin
              ? "rounded-br-sm bg-espresso text-paper"
              : "rounded-bl-sm bg-paper-warm text-ink",
          )}
        >
          {content}
        </div>
        <p
          className={cn(
            "mt-1 px-1 text-[10px] text-ink-faint",
            isAdmin ? "text-right" : "text-left",
          )}
        >
          {isOriginal ? "Demande initiale · " : isAdmin ? "Vous · " : "Client · "}
          {formatDateTime(date)}
        </p>
      </div>
    </motion.div>
  );
}
