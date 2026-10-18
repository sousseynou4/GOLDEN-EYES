"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { DEMO_PORTRAIT } from "@/lib/demo-content";
import { gsap, useGsap } from "@/lib/gsap";

const COMMITMENTS = [
  "Écoute et conseils personnalisés",
  "Retouche artisanale de chaque image",
  "Réponse sous 48 h",
];

/**
 * Section « L'approche » : photo (réglable dans Dashboard → Page
 * d'accueil) révélée en rideau dans un cadre or, texte éditorial et
 * engagements. Mise en page asymétrique façon double-page de magazine.
 */
export function AboutPreview({ image = DEMO_PORTRAIT }: { image?: string }) {
  const root = useRef<HTMLElement>(null);

  useGsap(({ reduced, q }) => {
    if (reduced) return;
    const trigger = { trigger: root.current, start: "top 70%" };

    gsap
      .timeline({ scrollTrigger: trigger, defaults: { ease: "expo.out" } })
      .fromTo(q("[data-frame]"), { opacity: 0, x: -20, y: -20 }, { opacity: 1, x: 0, y: 0, duration: 1.4 }, 0)
      .fromTo(
        q("[data-curtain]"),
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6 },
        0.1,
      )
      .fromTo(q("[data-portrait]"), { scale: 1.35 }, { scale: 1.08, duration: 2.2, ease: "power3.out" }, 0.1)
      .fromTo(q("[data-quote]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.1 }, 0.9)
      .fromTo(q("[data-text]"), { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.25);

    // Légère parallaxe de la photo dans son cadre
    gsap.to(q("[data-portrait]"), {
      yPercent: -6,
      ease: "none",
      scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
    });
  }, root);

  return (
    <section ref={root} className="relative overflow-hidden bg-paper-warm py-28 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2 md:gap-20">
        {/* Image */}
        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          {/* Cadre or décalé */}
          <div
            data-frame
            className="absolute -bottom-5 -right-5 left-5 top-5 rounded-2xl border border-gold-400/70 md:-bottom-7 md:-right-7 md:left-7 md:top-7"
            aria-hidden="true"
          />
          <div data-curtain className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-espresso shadow-2xl">
            <div data-portrait className="absolute inset-0 will-change-transform">
              <Image
                src={image}
                alt="Le studio Golden Eyes au travail"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          {/* Cartouche flottant */}
          <div
            data-quote
            className="absolute -bottom-8 left-6 rounded-xl border border-gold-300/30 bg-noir px-6 py-4 shadow-xl md:-left-6"
          >
            <p className="font-serif text-2xl italic text-gold">« L&apos;instant juste »</p>
          </div>
        </div>

        {/* Texte */}
        <div>
          <p data-text className="eyebrow mb-6">L&apos;approche</p>
          <h2 data-text className="font-serif text-display-md text-espresso text-balance">
            Photographier, c&apos;est apprendre à <span className="italic text-gold-600">regarder</span>.
          </h2>
          <p data-text className="mt-6 text-lg leading-relaxed text-ink-muted">
            Un travail documentaire avant d&apos;être stylisé : saisir un éclat de
            rire vrai plutôt qu&apos;une pose répétée trois fois. Du temps, de la
            confiance, et la lumière qui descend juste comme il faut.
          </p>

          <ul data-text className="mt-10 space-y-4 border-t border-line pt-8">
            {COMMITMENTS.map((item) => (
              <li key={item} className="flex items-center gap-4 text-espresso">
                <span className="h-2 w-2 rotate-45 bg-gold-500" aria-hidden="true" />
                <span className="text-sm uppercase tracking-wider">{item}</span>
              </li>
            ))}
          </ul>

          <Link
            data-text
            href={ROUTES.about}
            className="group mt-10 inline-flex items-center gap-2 text-sm uppercase tracking-wider text-espresso transition hover:text-gold-600"
          >
            En savoir plus
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
