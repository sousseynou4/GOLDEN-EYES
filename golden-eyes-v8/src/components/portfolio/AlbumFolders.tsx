import GlassFolder, {
  type ArtRecipe,
  type FolderFile,
} from "@/components/ui/glass-folder-cards";
import { ROUTES } from "@/lib/constants";
import { buildThumbnail } from "@/lib/video";
import type { MediaProvider, MediaType } from "@/types";

/** Média minimal nécessaire pour remplir les classeurs. */
export interface AlbumMedia {
  id: string;
  url: string;
  thumbnail_url?: string | null;
  type: MediaType;
  provider: MediaProvider;
  embed_id?: string | null;
  title?: string | null;
  category?: string | null;
}

/** Or liquide pour le fond des classeurs (généré, aucune image à charger). */
const GOLD_ART: ArtRecipe = {
  style: "marble",
  colors: ["#0c0906", "#2b1f0c", "#73521a", "#15100b", "#b8862b", "#f3d98b", "#fff1c4"],
  scale: 0.7,
  warp: 3.3,
  angle: 0.6,
  gloss: 0.6,
  veins: 0.5,
};

const MAX_ALBUMS = 6;
const FILES_PER_ALBUM = 4;
const FOLDER_WIDTH = 320;

/** Miniature servie par l'optimiseur Next.js (légère, quelle que soit la source). */
function thumb(url: string) {
  return `/_next/image?url=${encodeURIComponent(url)}&w=640&q=75`;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n > 1 ? "s" : ""}`;
}

function toFile(m: AlbumMedia, href: string): FolderFile {
  const isVideo = m.type === "video";
  const cover = isVideo
    ? m.thumbnail_url || buildThumbnail(m.provider, m.embed_id ?? null)
    : m.url;
  return {
    name: m.title || (isVideo ? "Film" : "Photo"),
    meta: isVideo ? "Vidéo" : "Photo",
    // Une vidéo importée n'a pas de miniature : on lui donne un fond or
    ...(cover ? { image: thumb(cover) } : { art: GOLD_ART }),
    href,
  };
}

/** Regroupe les médias par album (catégorie), les plus fournis d'abord. */
export function buildAlbums(media: AlbumMedia[]) {
  const groups = new Map<string, AlbumMedia[]>();
  for (const m of media) {
    const name = m.category?.trim() || "Divers";
    groups.set(name, [...(groups.get(name) ?? []), m]);
  }

  return Array.from(groups.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, MAX_ALBUMS)
    .map(([name, items]) => {
      const photos = items.filter((m) => m.type === "image").length;
      const videos = items.length - photos;
      const href = `${ROUTES.portfolio}?album=${encodeURIComponent(name)}`;
      return {
        name,
        meta: [photos && plural(photos, "photo"), videos && plural(videos, "vidéo")]
          .filter(Boolean)
          .join(" · "),
        // Les médias arrivent du plus récent au plus ancien ; le classeur
        // place le dernier de la liste devant, au plus près de la vitre.
        files: items.slice(0, FILES_PER_ALBUM).reverse().map((m) => toFile(m, href)),
      };
    });
}

/**
 * Section « Albums » : chaque album du portfolio devient un classeur en
 * verre fumé. Au survol la vitre s'incline, au clic les photos et vidéos
 * sortent en éventail ; chacune mène à l'album dans le portfolio.
 */
export function AlbumFolders({ media }: { media: AlbumMedia[] }) {
  const albums = buildAlbums(media);
  if (albums.length === 0) return null;

  return (
    <section className="ge-folders relative overflow-hidden bg-noir py-24 md:py-32">
      {/* Bureau pointillé or */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-gold-300 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="gold-rule absolute inset-x-0 top-0 opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5 justify-center !text-gold-300">Albums</p>
          <h2 className="font-serif text-display-md font-light text-paper text-balance">
            Chaque histoire, <span className="text-gold italic">classée</span> avec soin.
          </h2>
          <p className="mt-5 text-lg text-paper/60">
            Photos et vidéos rangées par album. Ouvrez un classeur pour en
            découvrir le contenu.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 items-end justify-items-center gap-x-12 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {albums.map((album, i) => (
            <GlassFolder
              key={album.name}
              label={album.name}
              meta={album.meta}
              tone="dark"
              art={GOLD_ART}
              seed={7 + i * 13}
              files={album.files}
              action="none"
              width={FOLDER_WIDTH}
              appearDelay={i * 140}
            />
          ))}
        </div>

        <p className="mt-14 text-center text-[11px] uppercase tracking-[0.18em] text-gold-200/50">
          Survolez pour entrouvrir · Cliquez pour ouvrir
        </p>
      </div>
    </section>
  );
}
