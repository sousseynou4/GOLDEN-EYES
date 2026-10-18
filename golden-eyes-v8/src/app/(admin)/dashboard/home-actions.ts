"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  HOME_IMAGE_KEYS,
  HOME_TEXT_SLOTS,
  SITE_IMAGES_FOLDER,
  type HomeImageKey,
} from "@/lib/site-settings";

type ActionResult = { ok: true } | { ok: false; error: string };

const STORAGE_BUCKET = "portfolio";
const BUCKET_MARKER = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function isHomeImageKey(key: string): key is HomeImageKey {
  return (HOME_IMAGE_KEYS as string[]).includes(key);
}

/** N'accepte que des fichiers du bucket `portfolio` de notre projet Supabase. */
function isOwnStorageUrl(url: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(base) && url.startsWith(`${base}${BUCKET_MARKER}`);
}

/** Chemin dans le bucket si le fichier a été importé pour le site (dossier `site/`). */
function siteImagePath(url: string | null | undefined) {
  if (!url) return null;
  const idx = url.indexOf(BUCKET_MARKER);
  if (idx === -1) return null;
  const path = url.slice(idx + BUCKET_MARKER.length);
  return path.startsWith(`${SITE_IMAGES_FOLDER}/`) ? path : null;
}

async function readCurrent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  key: HomeImageKey,
) {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .returns<{ value: string | null }[]>()
    .maybeSingle();
  return data?.value ?? null;
}

/**
 * Supprime l'ancienne image du Storage si elle avait été importée
 * spécialement pour le site. Les photos de la médiathèque ne sont
 * jamais supprimées ici.
 */
async function removeOldSiteImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  oldUrl: string | null,
  newUrl: string | null,
) {
  const path = siteImagePath(oldUrl);
  if (path && oldUrl !== newUrl) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  }
}

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/dashboard/accueil");
}

/**
 * Remplace une image de la page d'accueil.
 */
export async function setHomeImage(key: string, url: string): Promise<ActionResult> {
  if (!isHomeImageKey(key)) return { ok: false, error: "Emplacement inconnu" };
  if (!isOwnStorageUrl(url)) return { ok: false, error: "URL d'image invalide" };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const previous = await readCurrent(supabase, key);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("site_settings") as any).upsert({
    key,
    value: url,
  });

  if (error) return { ok: false, error: error.message };

  await removeOldSiteImage(supabase, previous, url);
  revalidateHome();
  return { ok: true };
}

/**
 * Enregistre un texte de la page d'accueil (vide = texte par défaut).
 */
export async function setHomeText(key: string, value: string): Promise<ActionResult> {
  const slot = HOME_TEXT_SLOTS.find((s) => s.key === key);
  if (!slot) return { ok: false, error: "Emplacement inconnu" };

  const text = value.trim();
  if (text.length > slot.maxLength) {
    return { ok: false, error: `Texte trop long (${slot.maxLength} caractères max)` };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { error } = text
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("site_settings") as any).upsert({ key, value: text })
    : await supabase.from("site_settings").delete().eq("key", key);

  if (error) return { ok: false, error: error.message };
  revalidateHome();
  return { ok: true };
}

/**
 * Rétablit l'image par défaut d'un emplacement.
 */
export async function resetHomeImage(key: string): Promise<ActionResult> {
  if (!isHomeImageKey(key)) return { ok: false, error: "Emplacement inconnu" };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const previous = await readCurrent(supabase, key);

  const { error } = await supabase.from("site_settings").delete().eq("key", key);
  if (error) return { ok: false, error: error.message };

  await removeOldSiteImage(supabase, previous, null);
  revalidateHome();
  return { ok: true };
}
