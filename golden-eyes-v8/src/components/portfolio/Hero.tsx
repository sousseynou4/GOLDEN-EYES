"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { DEMO_HERO } from "@/lib/demo-content";
import { gsap, useGsap } from "@/lib/gsap";
import { GoldParticles } from "@/components/effects/GoldParticles";

interface HeroProps {
  /** URL de l'image de fond (réglable dans Dashboard → Page d'accueil). */
  image?: string;
}

const TITLE_LINES: { text: string; gold?: boolean }[][] = [
  [{ text: "Capturer" }, { text: "la" }, { text: "lumière," }],
  [{ text: "révéler", gold: true }, { text: "l'instant." }],
];

/**
 * Hero luxe plein écran.
 * - Photo de fond + voile noir chaud + poussière d'or en 3D (Three.js)
 * - Titre révélé mot par mot (GSAP), « révéler » en or métallique
 * - Parallaxe au défilement : la photo glisse, le texte s'efface
 * - Le contenu reste dans le flux (min-h + padding) : il ne peut jamais
 *   être rogné sous le header, même sur un écran d'ordinateur bas.
 */
export function Hero({ image = DEMO_HERO }: HeroProps) {
  const root = useRef<HTMLElement>(null);

  useGsap(({ reduced, q }) => {
    if (reduced) {
      gsap.set(q("[data-hero]"), { opacity: 1, y: 0 });
      gsap.set(q("[data-word]"), { yPercent: 0, y: 0 });
      gsap.set(q("[data-rule]"), { scaleX: 1 });
      return;
    }

    gsap
      .timeline({ defaults: { ease: "expo.out" } })
      .fromTo(q("[data-hero-img]"), { scale: 1.2 }, { scale: 1.05, duration: 2.8, ease: "power3.out" }, 0)
      .fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.4 }, 0.2)
      .fromTo(q("[data-hero='eyebrow']"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 0.3)
      .fromTo(q("[data-word]"), { yPercent: 115, y: 0 }, { yPercent: 0, duration: 1.4, stagger: 0.09 }, 0.45)
      .fromTo(q("[data-hero='cta']"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 1.05)
      .fromTo(q("[data-hero='scroll']"), { opacity: 0 }, { opacity: 1, duration: 1 }, 1.6);

    // Parallaxe au défilement
    const scroll = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
    gsap.to(q("[data-hero-img]"), { yPercent: 14, ease: "none", scrollTrigger: scroll });
    gsap.to(q("[data-hero-content]"), { yPercent: -12, opacity: 0.15, ease: "none", scrollTrigger: scroll });
  }, root);

  return (
    <section ref={root} className="relative grain w-full overflow-hidden bg-noir">
      {/* Sans JavaScript, le contenu reste visible */}
      <noscript>
        <style>{`[data-hero]{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      {/* ━━━━━━ Photo de fond ━━━━━━ */}
      <div className="absolute inset-0">
        <div data-hero-img className="absolute inset-0 will-change-transform">
          <Image
            src={image}
            alt="Photographie d'auteur Golden Eyes"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Voile noir chaud : lisibilité du texte + ambiance luxe */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-noir/60" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir/80 via-noir/20 to-transparent" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(207,160,67,0.18),transparent_60%)]"
          aria-hidden="true"
        />
      </div>

      {/* ━━━━━━ Poussière d'or 3D ━━━━━━ */}
      <GoldParticles className="z-[2]" />

      {/* ━━━━━━ Contenu ━━━━━━ */}
      <div
        data-hero-content
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 md:pb-24"
      >
        <div data-hero="eyebrow" className="mb-6 flex items-center gap-4 opacity-0 md:mb-8">
          <span data-rule className="gold-rule block w-12 origin-left md:w-20" />
          <span className="text-xs font-medium uppercase tracking-editorial text-gold-200">
            Studio photographique · Nantes
          </span>
        </div>

        <h1 className="max-w-6xl font-serif text-display-xl font-light text-paper">
          {TITLE_LINES.map((line, li) => (
            <span key={li} className="block">
              {line.map((word, wi) => (
                <span
                  key={wi}
                  className="-mb-[0.12em] mr-[0.22em] inline-block overflow-hidden pb-[0.12em] pr-[0.04em] pt-[0.06em] align-bottom"
                >
                  <span
                    data-word
                    data-hero
                    className={`inline-block translate-y-[115%] ${word.gold ? "text-gold italic" : ""}`}
                  >
                    {word.text}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className="mt-10 flex flex-col items-start gap-8 md:mt-12 md:flex-row md:items-center md:gap-12">
          <div data-hero="cta" className="flex flex-wrap gap-4 opacity-0">
            <Link href={ROUTES.contact} className="btn-gold">
              Réserver une séance
            </Link>
            <Link href={ROUTES.portfolio} className="btn-gold-ghost">
              Voir le portfolio
            </Link>
          </div>
          <p data-hero="cta" className="max-w-sm text-sm leading-relaxed text-paper/75 opacity-0">
            Mariages, portraits, événements et films — des images d&apos;exception
            pour les moments qui comptent.
          </p>
        </div>
      </div>

      {/* Indicateur de défilement */}
      <div
        data-hero="scroll"
        className="absolute bottom-8 right-8 z-10 hidden flex-col items-center gap-3 text-gold-200/80 opacity-0 md:flex"
      >
        <span className="text-[10px] uppercase tracking-editorial [writing-mode:vertical-rl]">
          Défiler
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-gold-200/20">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollCue_2.2s_ease-in-out_infinite] bg-gold-200" />
        </span>
        <ArrowDown className="h-3.5 w-3.5" />
      </div>
    </section>
  );
}
