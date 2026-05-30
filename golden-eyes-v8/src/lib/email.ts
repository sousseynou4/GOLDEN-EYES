import "server-only";
import { Resend } from "resend";
import { SITE_CONFIG } from "@/lib/constants";
import { PRESTATION_TYPES } from "@/lib/validations/booking";
import type { BookingInput } from "@/lib/validations/booking";
import type { BookingStatus } from "@/types";

/**
 * Module d'envoi d'emails via Resend.
 * ────────────────────────────────────────────────────────────────
 * Dégradation propre : si RESEND_API_KEY n'est pas configurée, les
 * fonctions ne plantent pas — elles loguent un avertissement et
 * retournent sans envoyer. Le site continue de fonctionner
 * normalement (les demandes sont toujours enregistrées en base).
 */

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// Adresse d'expéditeur. Tant qu'aucun domaine n'est vérifié sur Resend,
// on peut utiliser leur domaine de test "onboarding@resend.dev".
const FROM = process.env.EMAIL_FROM ?? "Golden Eyes <onboarding@resend.dev>";
// Adresse où TU reçois les notifications de nouvelles demandes.
const ADMIN_TO = process.env.ADMIN_EMAIL ?? SITE_CONFIG.email;

function prestationLabel(value?: string): string {
  return PRESTATION_TYPES.find((p) => p.value === value)?.label ?? "Non précisé";
}

function formatDateFr(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Échappe le HTML pour éviter toute injection dans les emails.
 */
function esc(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Gabarit HTML commun (couleurs assorties au site).
 */
function wrap(title: string, body: string): string {
  return `
  <div style="background:#F7F3EC;padding:32px 0;font-family:Helvetica,Arial,sans-serif;color:#241C15;">
    <div style="max-width:560px;margin:0 auto;background:#FDFBF7;border:1px solid #E2D9C9;border-radius:16px;overflow:hidden;">
      <div style="background:#1A1410;padding:28px 32px;">
        <p style="margin:0;font-size:22px;color:#B8862B;font-weight:600;letter-spacing:0.5px;">Golden Eyes</p>
        <p style="margin:4px 0 0;font-size:10px;color:#9B8B7A;text-transform:uppercase;letter-spacing:3px;">Studio Photographique</p>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:24px;color:#1A1410;">${title}</h1>
        ${body}
      </div>
      <div style="border-top:1px solid #E2D9C9;padding:18px 32px;">
        <p style="margin:0;font-size:11px;color:#9B8B7A;">© ${new Date().getFullYear()} Golden Eyes · ${esc(SITE_CONFIG.email)}</p>
      </div>
    </div>
  </div>`;
}

/**
 * Email de confirmation envoyé AU CLIENT.
 */
export async function sendClientConfirmation(booking: BookingInput): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY absente — email client non envoyé.");
    return;
  }

  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Bonjour ${esc(booking.prenom)},
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:#6B5D4F;">
      Merci pour votre demande ! Je l'ai bien reçue et je reviens vers vous
      personnellement <strong>sous 48 heures</strong> pour échanger sur votre projet.
    </p>
    <div style="background:#F1EADD;border-radius:12px;padding:18px 20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#B8862B;">Récapitulatif</p>
      <p style="margin:4px 0;font-size:14px;"><strong>Prestation :</strong> ${prestationLabel(booking.type_prestation)}</p>
      <p style="margin:4px 0;font-size:14px;"><strong>Date souhaitée :</strong> ${formatDateFr(booking.date_evenement)}</p>
      ${booking.lieu ? `<p style="margin:4px 0;font-size:14px;"><strong>Lieu :</strong> ${esc(booking.lieu)}</p>` : ""}
    </div>
    <p style="font-size:15px;line-height:1.6;margin:0;color:#6B5D4F;">
      À très bientôt,<br/>
      <strong style="color:#1A1410;">L'équipe Golden Eyes</strong>
    </p>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: booking.email,
      subject: "Votre demande a bien été reçue · Golden Eyes",
      html: wrap("Demande bien reçue 🎉", body),
    });
  } catch (err) {
    console.error("[email] Échec envoi confirmation client :", err);
  }
}

/**
 * Email de notification envoyé À L'ADMIN (toi).
 */
export async function sendAdminNotification(booking: BookingInput): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY absente — notification admin non envoyée.");
    return;
  }

  const rows: [string, string][] = [
    ["Nom", `${booking.prenom} ${booking.nom}`],
    ["Email", booking.email],
    ["Téléphone", booking.telephone],
    ["Prestation", prestationLabel(booking.type_prestation)],
    ["Date souhaitée", formatDateFr(booking.date_evenement)],
  ];
  if (booking.lieu) rows.push(["Lieu", booking.lieu]);
  if (booking.nombre_personnes)
    rows.push(["Personnes", String(booking.nombre_personnes)]);
  if (booking.budget) rows.push(["Budget", booking.budget]);
  if (booking.adresse) rows.push(["Adresse", booking.adresse]);

  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<p style="margin:4px 0;font-size:14px;"><strong>${esc(k)} :</strong> ${esc(v)}</p>`,
    )
    .join("");

  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:#6B5D4F;">
      Une nouvelle demande de réservation vient d'arriver.
    </p>
    <div style="background:#F1EADD;border-radius:12px;padding:18px 20px;margin:0 0 20px;">
      ${rowsHtml}
    </div>
    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#B8862B;">Message</p>
    <p style="font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;color:#241C15;">${esc(booking.message)}</p>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_TO,
      replyTo: booking.email,
      subject: `Nouvelle demande · ${booking.prenom} ${booking.nom} (${prestationLabel(booking.type_prestation)})`,
      html: wrap("Nouvelle demande de réservation", body),
    });
  } catch (err) {
    console.error("[email] Échec envoi notification admin :", err);
  }
}

/* ════════════════════════════════════════════════════════════════
   ÉTAPE 7 — Notifications additionnelles
   ════════════════════════════════════════════════════════════════ */

/** Données minimales pour les emails de suivi (lus depuis la DB) */
export interface BookingForEmail {
  prenom: string;
  nom: string;
  email: string;
  date_evenement: string;
  type_prestation: string | null;
  lieu: string | null;
}

/**
 * Contenu personnalisé par statut (titre, intro, ton).
 * `completed` n'est PAS inclus : pas d'email pour "Terminé" — c'est
 * un statut interne au photographe, pas une info pour le client.
 */
const STATUS_EMAIL_COPY: Record<
  Exclude<BookingStatus, "pending" | "completed">,
  { subject: string; title: string; intro: string }
> = {
  confirmed: {
    subject: "Votre réservation est confirmée ✨",
    title: "Réservation confirmée",
    intro:
      "C'est officiel ! Votre séance est confirmée. Je me réjouis de la préparer avec vous.",
  },
  cancelled: {
    subject: "Votre réservation a été annulée",
    title: "Réservation annulée",
    intro:
      "Votre réservation a été annulée. N'hésitez pas à me recontacter si vous souhaitez reprogrammer ou en discuter.",
  },
};

/**
 * Email envoyé au client lors d'un changement de statut significatif.
 * Retourne silencieusement pour les statuts qui ne déclenchent pas d'email
 * (pending, completed).
 */
export async function sendStatusChangeEmail(
  booking: BookingForEmail,
  newStatus: BookingStatus,
): Promise<void> {
  if (newStatus === "pending" || newStatus === "completed") return;
  if (!resend) {
    console.warn("[email] RESEND_API_KEY absente — email statut non envoyé.");
    return;
  }

  const copy = STATUS_EMAIL_COPY[newStatus];

  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Bonjour ${esc(booking.prenom)},
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:#6B5D4F;">
      ${esc(copy.intro)}
    </p>
    <div style="background:#F1EADD;border-radius:12px;padding:18px 20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#B8862B;">Récapitulatif</p>
      <p style="margin:4px 0;font-size:14px;"><strong>Prestation :</strong> ${prestationLabel(booking.type_prestation ?? undefined)}</p>
      <p style="margin:4px 0;font-size:14px;"><strong>Date :</strong> ${formatDateFr(booking.date_evenement)}</p>
      ${booking.lieu ? `<p style="margin:4px 0;font-size:14px;"><strong>Lieu :</strong> ${esc(booking.lieu)}</p>` : ""}
    </div>
    <p style="font-size:15px;line-height:1.6;margin:0;color:#6B5D4F;">
      ${
        newStatus === "confirmed"
          ? "Je reviens vers vous très prochainement avec les détails pratiques."
          : "Pour toute question, n'hésitez pas à me répondre directement à cet email."
      }
    </p>
    <p style="font-size:15px;line-height:1.6;margin:16px 0 0;">
      Bien à vous,<br/>
      <strong style="color:#1A1410;">Golden Eyes</strong>
    </p>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: booking.email,
      replyTo: ADMIN_TO,
      subject: copy.subject,
      html: wrap(copy.title, body),
    });
  } catch (err) {
    console.error("[email] Échec envoi changement de statut :", err);
  }
}

/**
 * Email envoyé au client quand l'admin lui écrit un message
 * depuis le dashboard.
 */
export async function sendNewMessageEmail(
  booking: BookingForEmail,
  messageContent: string,
): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY absente — email message non envoyé.");
    return;
  }

  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Bonjour ${esc(booking.prenom)},
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:#6B5D4F;">
      Vous avez un nouveau message concernant votre réservation
      ${booking.type_prestation ? `(${esc(prestationLabel(booking.type_prestation))})` : ""}
      du <strong>${esc(formatDateFr(booking.date_evenement))}</strong> :
    </p>
    <div style="background:#F1EADD;border-left:3px solid #B8862B;border-radius:8px;padding:18px 20px;margin:20px 0;">
      <p style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;color:#241C15;">${esc(messageContent)}</p>
    </div>
    <p style="font-size:13px;line-height:1.6;margin:0;color:#9B8B7A;">
      Pour répondre, il vous suffit de cliquer sur « Répondre » dans votre
      messagerie — votre réponse arrivera directement à Golden Eyes.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:16px 0 0;">
      <strong style="color:#1A1410;">Golden Eyes</strong>
    </p>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: booking.email,
      replyTo: ADMIN_TO,
      subject: "Nouveau message · Golden Eyes",
      html: wrap("Vous avez un nouveau message", body),
    });
  } catch (err) {
    console.error("[email] Échec envoi nouveau message :", err);
  }
}
