import { DEMO_HERO, DEMO_PORTRAIT } from "@/lib/demo-content";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Contenu de la page d'accueil modifiable depuis le dashboard.
 * ────────────────────────────────────────────────────────────────
 * Chaque emplacement correspond à une clé de la table `site_settings`.
 * Si la clé est absente (ou la table pas encore créée), on affiche
 * le contenu par défaut.
 */
export const HOME_IMAGE_SLOTS = [
  {
    key: "home_hero_image",
    label: "Photo du haut de page",
    description:
      "La grande photo plein écran, derrière le titre « Capturer la lumière, révéler l'instant ». Elle se reconstitue en particules à l'ouverture de la page et devient liquide au passage de la souris ; ses zones sombres se fondent dans le fond noir. Format paysage conseillé (au moins 1920 px de large).",
    fallback: DEMO_HERO,
    aspect: "aspect-video",
    /** Position sur la page, pour le mini-plan affiché dans le dashboard */
    position: 0,
  },
  {
    key: "home_about_image",
    label: "Photo de la section « L'approche »",
    description:
      "La photo verticale à côté du texte « Photographier, c'est apprendre à regarder ». Format portrait conseillé (4:5).",
    fallback: DEMO_PORTRAIT,
    aspect: "aspect-[4/5]",
    position: 2,
  },
] as const;

export const DEFAULT_HOME_DESCRIPTION =
  "Golden Eyes est un studio photographique installé à Nantes. Mariages, portraits, événements et films : chaque projet est pensé comme une œuvre, avec une attention particulière portée à la lumière, aux émotions vraies et aux détails qui font la différence. De la première rencontre à la livraison de vos images retouchées avec soin, nous vous accompagnons à chaque étape.";

export const HOME_TEXT_SLOTS = [
  {
    key: "home_description",
    label: "Texte de présentation du studio",
    description:
      "Le paragraphe affiché sous la grande phrase « Golden Eyes, l'élégance de la lumière », juste après le haut de page.",
    fallback: DEFAULT_HOME_DESCRIPTION,
    maxLength: 900,
    position: 1,
  },
] as const;

export type HomeImageKey = (typeof HOME_IMAGE_SLOTS)[number]["key"];
export type HomeTextKey = (typeof HOME_TEXT_SLOTS)[number]["key"];

export const HOME_IMAGE_KEYS = HOME_IMAGE_SLOTS.map((s) => s.key) as HomeImageKey[];
export const HOME_TEXT_KEYS = HOME_TEXT_SLOTS.map((s) => s.key) as HomeTextKey[];

/** Dossier du bucket `portfolio` où sont rangées les images du site. */
export const SITE_IMAGES_FOLDER = "site";

/**
 * Lit les valeurs personnalisées des clés demandées.
 * Ne renvoie que les clés effectivement renseignées.
 */
async function getCustomSettings<K extends string>(
  supabase: ServerSupabaseClient,
  keys: K[],
): Promise<Partial<Record<K, string>>> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys)
    .returns<{ key: string; value: string | null }[]>();

  if (error || !data) return {};

  const result: Partial<Record<K, string>> = {};
  for (const row of data) {
    if (row.value) result[row.key as K] = row.value;
  }
  return result;
}

export function getCustomHomeImages(supabase: ServerSupabaseClient) {
  return getCustomSettings(supabase, HOME_IMAGE_KEYS);
}

export function getCustomHomeTexts(supabase: ServerSupabaseClient) {
  return getCustomSettings(supabase, HOME_TEXT_KEYS);
}

/** Contenu complet de l'accueil, complété avec les valeurs par défaut. */
export async function getHomeContent(supabase: ServerSupabaseClient) {
  const custom = await getCustomSettings(supabase, [...HOME_IMAGE_KEYS, ...HOME_TEXT_KEYS]);
  const withFallback = <S extends { key: string; fallback: string }>(slots: readonly S[]) =>
    Object.fromEntries(
      slots.map((s) => [s.key, custom[s.key as keyof typeof custom] ?? s.fallback]),
    );

  return {
    images: withFallback(HOME_IMAGE_SLOTS) as Record<HomeImageKey, string>,
    texts: withFallback(HOME_TEXT_SLOTS) as Record<HomeTextKey, string>,
  };
}
