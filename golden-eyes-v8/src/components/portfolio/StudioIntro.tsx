"use client";

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/gsap";

const STATEMENT: { text: string; gold?: boolean }[] = [
  { text: "Golden" },
  { text: "Eyes," },
  { text: "l'élégance" },
  { text: "de" },
  { text: "la" },
  { text: "lumière", gold: true },
  { text: "au" },
  { text: "service" },
  { text: "de" },
  { text: "vos" },
  { text: "plus" },
  { text: "beaux" },
  { text: "moments." },
];

const SERVICES = [
  {
    title: "Mariages",
    text: "Le récit complet de votre journée, des préparatifs à la première danse.",
  },
  {
    title: "Portraits",
    text: "Individuels, en couple ou en famille, en studio ou en lumière naturelle.",
  },
  {
    title: "Événements",
    text: "Soirées, entreprises, célébrations : l'énergie du moment, saisie avec discrétion.",
  },
  {
    title: "Films",
    text: "Des vidéos montées avec soin pour revivre l'émotion en mouvement.",
  },
];

/**
 * Section « Le studio » : présentation de Golden Eyes.
 * - La grande phrase s'illumine mot à mot au défilement (GSAP scrub)
 * - Le paragraphe est modifiable dans Dashboard → Page d'accueil
 * - Les quatre prestations apparaissent en cascade, filet or dessiné
 */
export function StudioIntro({ description }: { description: string }) {
  const root = useRef<HTMLElement>(null);

  useGsap(({ reduced, q }) => {
    if (reduced) return;

    gsap.fromTo(
      q("[data-sword]"),
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: { trigger: q("[data-statement]")[0], start: "top 82%", end: "bottom 50%", scrub: 0.6 },
      },
    );

    gsap.fromTo(
      q("[data-fade]"),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: { trigger: q("[data-fade]")[0], start: "top 85%" },
      },
    );

    gsap.fromTo(
      q("[data-service]"),
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: q("[data-services]")[0], start: "top 85%" },
      },
    );
    gsap.fromTo(
      q("[data-service-rule]"),
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: q("[data-services]")[0], start: "top 85%" },
      },
    );
  }, root);

  return (
    <section ref={root} className="relative overflow-hidden bg-noir-soft py-28 text-paper md:py-40">
      {/* Halo doré discret */}
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(207,160,67,0.12),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="gold-rule absolute inset-x-0 top-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-3">
            <p className="eyebrow !text-gold-300">Le studio</p>
            <p className="mt-4 text-xs uppercase tracking-editorial text-paper/40">
              Nantes · France
            </p>
          </div>

          <div className="lg:col-span-9">
            <h2
              data-statement
              className="font-serif text-display-md font-light leading-[1.15] text-paper text-balance"
            >
              {STATEMENT.map((word, i) => (
                <span
                  key={i}
                  data-sword
                  className={`mr-[0.25em] inline-block ${word.gold ? "text-gold italic" : ""}`}
                >
                  {word.text}
                </span>
              ))}
            </h2>

            <div className="mt-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <p data-fade className="max-w-2xl whitespace-pre-line text-lg leading-relaxed text-paper/70">
                {description}
              </p>
              <p data-fade className="font-serif text-xl italic text-gold-200">
                — Golden Eyes
              </p>
            </div>
          </div>
        </div>

        {/* Prestations */}
        <div data-services className="mt-24 grid gap-px overflow-hidden rounded-2xl bg-gold-300/10 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <div
              key={service.title}
              data-service
              className="group relative bg-noir-soft p-8 transition-colors duration-500 hover:bg-noir md:p-10"
            >
              <span
                data-service-rule
                className="gold-rule absolute inset-x-0 top-0 block origin-left"
                aria-hidden="true"
              />
              <p className="font-serif text-5xl font-light text-gold transition-transform duration-500 group-hover:-translate-y-1">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-6 font-serif text-2xl text-paper">{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/60">{service.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
