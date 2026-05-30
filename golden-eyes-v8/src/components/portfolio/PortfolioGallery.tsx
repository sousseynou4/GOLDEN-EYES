"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { buildEmbedUrl, buildThumbnail } from "@/lib/video";
import { cn } from "@/lib/utils";
import type { MediaProvider } from "@/types";

export interface GalleryItem {
  id: string;
  url: string;
  thumbnail_url?: string | null;
  type: "image" | "video";
  provider: MediaProvider;
  embed_id?: string | null;
  title?: string | null;
  category?: string | null;
}

interface PortfolioGalleryProps {
  items: GalleryItem[];
}

/**
 * Galerie publique filtrable par album (catégorie).
 * - Barre de filtres en haut (Tous + chaque catégorie)
 * - Mosaïque éditoriale
 * - Lightbox : images en grand, vidéos externes en lecteur intégré
 */
export function PortfolioGallery({ items }: PortfolioGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Liste des catégories présentes
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return ["Tous", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === "Tous") return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line py-24 text-center">
        <p className="font-serif text-2xl text-ink-muted">Galerie en préparation</p>
        <p className="mt-2 text-sm text-ink-faint">
          Les premières œuvres arriveront prochainement.
        </p>
      </div>
    );
  }

  const close = () => setActiveIndex(null);
  const next = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % filtered.length));
  const prev = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + filtered.length) % filtered.length,
    );

  return (
    <>
      {/* Filtres par album */}
      {categories.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setActiveIndex(null);
              }}
              className={cn(
                "rounded-full px-5 py-2 text-xs uppercase tracking-wider transition",
                activeCategory === cat
                  ? "bg-espresso text-paper"
                  : "border border-line text-ink-muted hover:border-espresso hover:text-espresso",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Mosaïque */}
      <div className="grid auto-rows-[300px] grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {filtered.map((item, i) => {
          const isLarge = i % 6 === 0 || i % 6 === 4;
          const isExternal = item.provider !== "upload";
          const thumb = isExternal
            ? item.thumbnail_url || buildThumbnail(item.provider, item.embed_id ?? null) || ""
            : item.url;

          return (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-paper-warm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                isLarge ? "md:col-span-2 md:row-span-2" : "col-span-1 row-span-1",
              )}
              aria-label={`Agrandir ${item.title ?? "le média"}`}
            >
              {item.type === "video" && !isExternal ? (
                <video src={item.url} className="h-full w-full object-cover" muted />
              ) : thumb ? (
                <Image
                  src={thumb}
                  alt={item.title ?? "Photographie"}
                  fill
                  sizes={isLarge ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 50vw, 25vw"}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading={i < 4 ? "eager" : "lazy"}
                />
              ) : null}

              {/* Icône lecture pour les vidéos */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-espresso/60 p-4 backdrop-blur-sm transition group-hover:bg-gold-500/80">
                    <Play className="h-6 w-6 text-paper" fill="currentColor" />
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {item.category && (
                  <p className="text-[10px] uppercase tracking-editorial text-gold-300">
                    {item.category}
                  </p>
                )}
                {item.title && (
                  <p className="mt-1 font-serif text-xl text-paper">{item.title}</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Lightbox */}
      <Lightbox
        items={filtered}
        activeIndex={activeIndex}
        onClose={close}
        onNext={next}
        onPrev={prev}
      />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────── */

interface LightboxProps {
  items: GalleryItem[];
  activeIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function Lightbox({ items, activeIndex, onClose, onNext, onPrev }: LightboxProps) {
  if (typeof window !== "undefined" && activeIndex !== null) {
    window.onkeydown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
  }

  const current = activeIndex !== null ? items[activeIndex] : null;
  const isExternalVideo = current && current.type === "video" && current.provider !== "upload";
  const embedUrl = current
    ? buildEmbedUrl(current.provider, current.embed_id ?? null)
    : null;

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/95 p-4 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute right-6 top-6 rounded-full border border-paper/20 p-2.5 text-paper transition hover:border-gold-300 hover:text-gold-300"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-6 rounded-full border border-paper/20 p-2.5 text-paper transition hover:border-gold-300 hover:text-gold-300"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full border border-paper/20 p-2.5 text-paper transition hover:border-gold-300 hover:text-gold-300"
                aria-label="Suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="flex w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isExternalVideo && embedUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={embedUrl}
                  title={current.title ?? "Vidéo"}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : current.type === "video" ? (
              <video
                src={current.url}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-lg"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.url}
                alt={current.title ?? ""}
                className="max-h-[80vh] max-w-full rounded-lg object-contain"
              />
            )}

            {current.title && (
              <p className="mt-4 text-center font-serif text-xl text-paper">
                {current.title}
                {current.category && (
                  <span className="ml-3 text-sm uppercase tracking-wider text-gold-300">
                    {current.category}
                  </span>
                )}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
