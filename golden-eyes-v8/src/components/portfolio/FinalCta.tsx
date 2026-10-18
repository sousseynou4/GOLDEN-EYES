"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { gsap, useGsap } from "@/lib/gsap";
import { GoldParticles } from "@/components/effects/GoldParticles";

/**
 * Appel final à la réservation : halo doré qui respire, poussière
 * d'or légère, titre révélé au défilement et bouton « magnétique »
 * qui suit doucement le curseur.
 */
export function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const magnet = useRef<HTMLDivElement>(null);

  useGsap(({ reduced, q }) => {
    if (reduced) return;

    gsap.to(q("[data-glow]"), {
      scale: 1.15,
      opacity: 0.75,
      duration: 4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    gsap.fromTo(
      q("[data-cta]"),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      },
    );

    // Bouton magnétique (souris uniquement)
    const el = magnet.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, root);

  return (
    <section ref={root} className="relative overflow-hidden bg-noir py-32 text-center md:py-44">
      <div
        data-glow
        className="pointer-events-none absolute inset-0 m-auto h-[720px] w-[720px] max-w-[140vw] rounded-full bg-[radial-gradient(circle,rgba(207,160,67,0.22),transparent_62%)] opacity-50"
        aria-hidden="true"
      />
      <GoldParticles density={0.35} className="z-0" />
      <div className="gold-rule absolute inset-x-0 top-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <p data-cta className="eyebrow mb-6 justify-center !text-gold-300">
          Prêt·e à commencer ?
        </p>
        <h2 data-cta className="font-serif text-display-lg font-light text-paper text-balance">
          Racontez-moi votre <span className="text-gold italic">histoire</span>.
        </h2>
        <p data-cta className="mx-auto mt-6 max-w-xl text-lg text-paper/65">
          Chaque projet commence par une conversation. Parlons de votre vision,
          du lieu, du moment juste à capturer.
        </p>
        <div data-cta className="mt-12 flex justify-center">
          <div ref={magnet} className="inline-block p-4">
            <Link href={ROUTES.contact} className="btn-gold">
              Réserver une séance
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
