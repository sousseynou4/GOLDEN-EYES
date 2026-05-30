"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PortfolioItem {
  id: string;
  url: string;
  title?: string | null;
  category?: string | null;
}

interface PortfolioGridProps {
  items: PortfolioItem[];
}

/**
 * Galerie portfolio éditoriale.
 * - Mosaïque où certaines images sont plus grandes (rythme magazine)
 * - Lazy loading via next/image
 * - Lightbox plein écran avec navigation clavier
 */
export function PortfolioGrid({ items }: PortfolioGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line py-24 text-center">
        <p className="font-serif text-2xl text-ink-muted">
          Galerie en préparation
        </p>
        <p className="mt-2 text-sm text-ink-faint">
          Les premières œuvres arriveront prochainement.
        </p>
      </div>
    );
  }

  const close = () => setActiveIndex(null);
  const next = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % items.length));
  const prev = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + items.length) % items.length,
    );

  return (
    <>
      <div className="grid auto-rows-[300px] grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {items.map((item, i) => {
          // Rythme éditorial : certaines cellules s'agrandissent
          const isLarge = i % 6 === 0 || i % 6 === 4;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-paper-warm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                isLarge ? "md:col-span-2 md:row-span-2" : "col-span-1 row-span-1",
              )}
              aria-label={`Agrandir ${item.title ?? "l'image"}`}
            >
              <Image
                src={item.url}
                alt={item.title ?? "Photographie"}
                fill
                sizes={isLarge ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 50vw, 25vw"}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading={i < 4 ? "eager" : "lazy"}
              />
              {/* Voile + légende au survol */}
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {item.category && (
                  <p className="text-[10px] uppercase tracking-editorial text-gold-300">
                    {item.category}
                  </p>
                )}
                {item.title && (
                  <p className="mt-1 font-serif text-xl text-paper">
                    {item.title}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <Lightbox
        items={items}
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
  items: PortfolioItem[];
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

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/95 backdrop-blur-md"
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
            className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.title ?? ""}
              className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
            />
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
