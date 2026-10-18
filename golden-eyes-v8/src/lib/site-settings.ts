import { DEMO_HERO, DEMO_PORTRAIT } from "@/lib/demo-content";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Images de la page d'accueil modifiables depuis le dashboard.
 * ────────────────────────────────────────────────────────────────
 * Chaque emplacement correspond à une clé de la table `site_settings`.
 * Si la clé est absente (ou la table pas encore créée), on affiche
 * l'image par défaut.
 */
export const HOME_IMAGE_SLOTS = [
  {
    key: "home_hero_image",
    label: "Image principale (hero)",
    description:
      "La grande photo plein écran tout en haut de l'accueil. Format paysage conseillé (au moins 1920 px de large).",
    fallback: DEMO_HERO,
    aspect: "aspect-video",
  },
  {
    key: "home_about_image",
    label: "Portrait — section « L'approche »",
    description:
      "La photo verticale à côté du texte de présentation. Format portrait conseillé (4:5).",
    fallback: DEMO_PORTRAIT,
    aspect: "aspect-[4/5]",
  },
] as const;

export type HomeImageKey = (typeof HOME_IMAGE_SLOTS)[number]["key"];

export const HOME_IMAGE_KEYS = HOME_IMAGE_SLOTS.map((s) => s.key) as HomeImageKey[];

/** Dossier du bucket `portfolio` où sont rangées les images du site. */
export const SITE_IMAGES_FOLDER = "site";

/**
 * Lit les URLs personnalisées des images d'accueil.
 * Ne renvoie que les clés effectivement renseignées.
 */
export async function getCustomHomeImages(
  supabase: ServerSupabaseClient,
): Promise<Partial<Record<HomeImageKey, string>>> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", HOME_IMAGE_KEYS)
    .returns<{ key: string; value: string | null }[]>();

  if (error || !data) return {};

  const result: Partial<Record<HomeImageKey, string>> = {};
  for (const row of data) {
    if (row.value) result[row.key as HomeImageKey] = row.value;
  }
  return result;
}

/** Comme `getCustomHomeImages`, mais complète avec les images par défaut. */
export async function getHomeImages(
  supabase: ServerSupabaseClient,
): Promise<Record<HomeImageKey, string>> {
  const custom = await getCustomHomeImages(supabase);
  return Object.fromEntries(
    HOME_IMAGE_SLOTS.map((s) => [s.key, custom[s.key] ?? s.fallback]),
  ) as Record<HomeImageKey, string>;
}
