/**
 * Types TypeScript dérivés du schéma Supabase.
 *
 * ⚠️ En production, regénère ce fichier avec la CLI Supabase :
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type MessageSender = "admin" | "client";
export type MediaType = "image" | "video";
export type MediaProvider = "upload" | "youtube" | "vimeo";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          nom: string;
          prenom: string;
          email: string;
          telephone: string;
          adresse: string | null;
          date_evenement: string;
          message: string;
          type_prestation: string | null;
          nombre_personnes: number | null;
          budget: string | null;
          lieu: string | null;
          status: BookingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          prenom: string;
          email: string;
          telephone: string;
          adresse?: string | null;
          date_evenement: string;
          message: string;
          type_prestation?: string | null;
          nombre_personnes?: number | null;
          budget?: string | null;
          lieu?: string | null;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nom?: string;
          prenom?: string;
          email?: string;
          telephone?: string;
          adresse?: string | null;
          date_evenement?: string;
          message?: string;
          type_prestation?: string | null;
          nombre_personnes?: number | null;
          budget?: string | null;
          lieu?: string | null;
          status?: BookingStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages_history: {
        Row: {
          id: string;
          booking_id: string;
          sender: MessageSender;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          sender: MessageSender;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_history_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      media: {
        Row: {
          id: string;
          url: string;
          thumbnail_url: string | null;
          type: MediaType;
          provider: MediaProvider;
          embed_id: string | null;
          title: string | null;
          description: string | null;
          category: string | null;
          width: number | null;
          height: number | null;
          display_order: number;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          thumbnail_url?: string | null;
          type: MediaType;
          provider?: MediaProvider;
          embed_id?: string | null;
          title?: string | null;
          description?: string | null;
          category?: string | null;
          width?: number | null;
          height?: number | null;
          display_order?: number;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          url?: string;
          thumbnail_url?: string | null;
          provider?: MediaProvider;
          embed_id?: string | null;
          title?: string | null;
          description?: string | null;
          category?: string | null;
          width?: number | null;
          height?: number | null;
          display_order?: number;
          is_featured?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      booking_status: BookingStatus;
      message_sender: MessageSender;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ─────────────────────────────────────────────────────────────────────
// Helpers ergonomiques
// ─────────────────────────────────────────────────────────────────────
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Booking = Tables<"bookings">;
export type Message = Tables<"messages_history">;
export type Media = Tables<"media">;
export type Profile = Tables<"profiles">;
