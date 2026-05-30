"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { DEMO_HERO } from "@/lib/demo-content";

interface HeroProps {
  /** URL de l'image de fond. Défaut : image de démo Unsplash. */
  image?: string;
  /** Sources vidéo optionnelles (priorité sur l'image si fournies). */
  videoWebm?: string;
  videoMp4?: string;
  poster?: string;
}

/**
 * Hero éditorial plein écran.
 * - Une vraie photo (ou vidéo) en fond, traitée avec un voile sombre
 *   en dégradé pour la lisibilité du texte.
 * - Titrage magazine ÉNORME en serif, mise en page asymétrique.
 * - Apparition orchestrée en cascade.
 */
export function Hero({ image = DEMO_HERO, videoWebm, videoMp4, poster }: HeroProps) {
  const hasVideo = Boolean(videoWebm || videoMp4);

  return (
    <section className="relative grain h-screen min-h-[640px] w-full overflow-hidden bg-espresso">
      {/* ━━━━━━ Média de fond ━━━━━━ */}
      <div className="absolute inset-0">
        {hasVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={poster}
            preload="metadata"
            className="h-full w-full animate-slow-zoom object-cover"
            aria-hidden="true"
          >
            {videoWebm && <source src={videoWebm} type="video/webm" />}
            {videoMp4 && <source src={videoMp4} type="video/mp4" />}
          </video>
        ) : (
          <Image
            src={image}
            alt="Photographie d'auteur Golden Eyes"
            fill
            priority
            sizes="100vw"
            className="animate-slow-zoom object-cover"
          />
        )}

        {/* Voile dégradé : sombre en bas (texte) → clair en haut */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-espresso/50"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-espresso/60 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* ━━━━━━ Contenu ━━━━━━ */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="eyebrow !text-gold-300 mb-6"
        >
          Studio photographique · Depuis 2015
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl font-serif text-display-xl font-light text-paper"
        >
          Capturer la lumière,
          <br />
          <span className="italic text-gold-300">révéler</span> l&apos;instant.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-10 flex flex-col items-start gap-6 md:flex-row md:items-center"
        >
          <div className="flex flex-wrap gap-4">
            <Link href={ROUTES.portfolio} className="btn-primary-dark">
              Voir le portfolio
            </Link>
            <Link href={ROUTES.contact} className="btn-ghost-dark">
              Réserver une séance
            </Link>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-paper/70">
            Portraits, mariages et reportages d&apos;auteur — partout où il y a
            une histoire à raconter.
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 right-8 z-10 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-paper/60"
        >
          <span className="text-[10px] uppercase tracking-editorial [writing-mode:vertical-rl]">
            Défiler
          </span>
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
