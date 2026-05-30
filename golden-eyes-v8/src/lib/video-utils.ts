/**
 * Helpers pour les vidéos externes (YouTube / Vimeo).
 * ────────────────────────────────────────────────────────────────
 * Transforme un lien collé par l'admin en URL d'intégration (embed)
 * et en URL de miniature.
 */

export interface ParsedVideo {
  provider: "youtube" | "vimeo";
  id: string;
  embedUrl: string;
  thumbnailUrl: string | null;
}

/**
 * Analyse une URL YouTube ou Vimeo.
 * Formats acceptés :
 *   - https://www.youtube.com/watch?v=XXXX
 *   - https://youtu.be/XXXX
 *   - https://vimeo.com/123456789
 * Renvoie null si l'URL n'est pas reconnue.
 */
export function parseVideoUrl(url: string): ParsedVideo | null {
  const trimmed = url.trim();

  // ── YouTube ──
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      provider: "youtube",
      id,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // ── Vimeo ──
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return {
      provider: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      // La miniature Vimeo nécessite un appel API ; on laisse null,
      // un visuel par défaut sera affiché.
      thumbnailUrl: null,
    };
  }

  return null;
}
