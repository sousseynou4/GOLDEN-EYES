import type { MediaProvider } from "@/types";

export interface ParsedVideo {
  provider: Exclude<MediaProvider, "upload">;
  embedId: string;
  /** URL de la miniature (thumbnail) */
  thumbnail: string;
  /** URL d'embed pour l'iframe */
  embedUrl: string;
}

/**
 * Analyse une URL YouTube ou Vimeo et en extrait l'identifiant,
 * la miniature et l'URL d'embed.
 *
 * Formats YouTube supportés :
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 *
 * Formats Vimeo supportés :
 *   https://vimeo.com/ID
 *   https://player.vimeo.com/video/ID
 *
 * @returns null si l'URL n'est pas reconnue
 */
export function parseVideoUrl(input: string): ParsedVideo | null {
  const url = input.trim();

  // ── YouTube ──
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const re of ytPatterns) {
    const m = url.match(re);
    if (m && m[1]) {
      const id = m[1];
      return {
        provider: "youtube",
        embedId: id,
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${id}`,
      };
    }
  }

  // ── Vimeo ──
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return {
      provider: "vimeo",
      embedId: id,
      // Vimeo ne donne pas de thumbnail directe sans API ; placeholder neutre
      thumbnail: "",
      embedUrl: `https://player.vimeo.com/video/${id}`,
    };
  }

  return null;
}

/**
 * Reconstruit l'URL d'embed à partir du provider et de l'embed_id stockés.
 */
export function buildEmbedUrl(
  provider: MediaProvider,
  embedId: string | null,
): string | null {
  if (!embedId) return null;
  if (provider === "youtube") return `https://www.youtube.com/embed/${embedId}`;
  if (provider === "vimeo") return `https://player.vimeo.com/video/${embedId}`;
  return null;
}

/**
 * Reconstruit l'URL de miniature à partir du provider et de l'embed_id.
 */
export function buildThumbnail(
  provider: MediaProvider,
  embedId: string | null,
): string | null {
  if (!embedId) return null;
  if (provider === "youtube")
    return `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`;
  return null;
}
