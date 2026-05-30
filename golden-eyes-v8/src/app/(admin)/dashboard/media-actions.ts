"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MediaType, MediaProvider } from "@/types";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function revalidatePublic() {
  revalidatePath("/dashboard/media");
  revalidatePath("/");
  revalidatePath("/portfolio");
}

/**
 * Enregistre un média uploadé (fichier déjà poussé dans le Storage).
 */
export async function createUploadedMedia(input: {
  url: string;
  type: MediaType;
  title?: string;
  category?: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error } = await supabase.from("media").insert(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {
      url: input.url,
      type: input.type,
      provider: "upload",
      title: input.title || null,
      category: input.category || null,
    } as any,
  );

  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

/**
 * Enregistre une vidéo externe (YouTube / Vimeo).
 */
export async function createExternalVideo(input: {
  provider: Exclude<MediaProvider, "upload">;
  embedId: string;
  thumbnail: string;
  title?: string;
  category?: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error } = await supabase.from("media").insert(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {
      url: input.thumbnail || "",
      thumbnail_url: input.thumbnail || null,
      type: "video",
      provider: input.provider,
      embed_id: input.embedId,
      title: input.title || null,
      category: input.category || null,
    } as any,
  );

  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

/**
 * Met à jour les métadonnées d'un média.
 */
export async function updateMedia(
  id: string,
  patch: {
    title?: string | null;
    category?: string | null;
    is_featured?: boolean;
    display_order?: number;
  },
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("media") as any)
    .update(patch)
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}

/**
 * Supprime un média. Si c'est un upload, retire aussi le fichier du Storage.
 */
export async function deleteMedia(
  id: string,
  url: string,
  provider: MediaProvider,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  // Retire le fichier du Storage uniquement pour les uploads
  if (provider === "upload") {
    const marker = "/portfolio/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const path = url.slice(idx + marker.length);
      await supabase.storage.from("portfolio").remove([path]);
    }
  }

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePublic();
  return { ok: true };
}
