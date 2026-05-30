/**
 * Types métier transversaux de Golden Eyes.
 * Réexporte les types DB pour faciliter les imports.
 */

export type {
  Booking,
  Message,
  Media,
  Profile,
  BookingStatus,
  MessageSender,
  MediaType,
  MediaProvider,
  Database,
  Tables,
  InsertDto,
  UpdateDto,
} from "./database";

/** Une réservation enrichie avec son fil de messages */
export interface BookingWithMessages {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string | null;
  date_evenement: string;
  message: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  messages?: Array<{
    id: string;
    sender: "admin" | "client";
    content: string;
    created_at: string;
    read_at: string | null;
  }>;
}
