"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { DEMO_PORTRAIT } from "@/lib/demo-content";

const STATS = [
  { value: "10", suffix: "ans", label: "d'expérience" },
  { value: "200+", suffix: "", label: "projets livrés" },
  { value: "48h", suffix: "", label: "de délai de réponse" },
];

/**
 * Section "signature" sur la home : portrait du photographe à gauche,
 * texte éditorial + chiffres à droite. Mise en page asymétrique
 * inspirée d'une double-page de magazine.
 */
export function AboutPreview() {
  return (
    <section className="bg-paper-warm py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:gap-20">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src={DEMO_PORTRAIT}
              alt="Le photographe au travail"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
          {/* Petit cartouche flottant doré */}
          <div className="absolute -bottom-6 -right-2 rounded-xl bg-espresso px-6 py-4 shadow-xl md:-right-6">
            <p className="font-serif text-2xl italic text-gold-300">
              « L&apos;instant juste »
            </p>
          </div>
        </motion.div>

        {/* Texte */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <p className="eyebrow mb-6">L&apos;approche</p>
          <h2 className="font-serif text-display-md text-espresso text-balance">
            Photographier, c&apos;est apprendre à regarder.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">
            Mon travail est documentaire avant d&apos;être stylisé. Je préfère
            saisir un éclat de rire vrai plutôt qu&apos;une pose répétée trois
            fois. Du temps, de la confiance, et la lumière qui descend juste
            comme il faut.
          </p>

          {/* Chiffres */}
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-4xl text-gold-600">
                  {stat.value}
                  {stat.suffix && (
                    <span className="ml-1 text-lg text-ink-faint">
                      {stat.suffix}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <Link
            href={ROUTES.about}
            className="group mt-10 inline-flex items-center gap-2 text-sm uppercase tracking-wider text-espresso transition hover:text-gold-600"
          >
            En savoir plus
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
