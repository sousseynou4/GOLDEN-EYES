import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/portfolio/Hero";
import { AboutPreview } from "@/components/portfolio/AboutPreview";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { Marquee } from "@/components/portfolio/Marquee";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { DEMO_GALLERY } from "@/lib/demo-content";
import type { Media } from "@/types";

export const revalidate = 60;

/**
 * Page d'accueil éditoriale.
 *   1. Hero photo plein écran
 *   2. Section signature (portrait + texte + chiffres)
 *   3. Aperçu portfolio (mosaïque) — fond clair
 *   4. Bandeau marquee — fond sombre contrasté
 *   5. CTA réservation
 *
 * Les médias viennent de Supabase ; si la table est vide, on
 * retombe sur les images de démonstration pour que le site vive.
 */
export default async function HomePage() {
  const supabase = await createClient();

  const { data: dbMedia } = await supabase
    .from("media")
    .select("id, url, title, category, type")
    .eq("type", "image")
    .order("display_order", { ascending: true })
    .limit(9)
    .returns<Pick<Media, "id" | "url" | "title" | "category" | "type">[]>();

  // Fallback démo si la base est vide
  const gallery =
    dbMedia && dbMedia.length > 0
      ? dbMedia.map((m) => ({
          id: m.id,
          url: m.url,
          title: m.title,
          category: m.category,
        }))
      : DEMO_GALLERY;

  // Aperçu = 6 premières images ; marquee = toutes
  const preview = gallery.slice(0, 6);
  const marqueeImages = gallery.map((g) => ({
    id: g.id,
    url: g.url,
    alt: g.title ?? "",
  }));

  return (
    <>
      <Hero />

      <AboutPreview />

      {/* Aperçu portfolio — fond clair */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Travaux récents"
              title="Une sélection d'instants."
            />
            <Link
              href={ROUTES.portfolio}
              className="group hidden shrink-0 items-center gap-2 text-sm uppercase tracking-wider text-espresso transition hover:text-gold-600 md:inline-flex"
            >
              Tout voir
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-14">
            <PortfolioGrid items={preview} />
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link href={ROUTES.portfolio} className="btn-ghost">
              Voir tout le portfolio
            </Link>
          </div>
        </Container>
      </section>

      {/* Marquee — fond sombre */}
      <section className="bg-espresso py-20">
        <Container>
          <SectionTitle
            eyebrow="En mouvement"
            title="Un avant-goût."
            align="center"
            dark
            className="mb-14"
          />
        </Container>
        <Marquee images={marqueeImages} />
      </section>

      {/* CTA final — fond clair */}
      <section className="bg-paper py-28 md:py-36">
        <Container size="md">
          <div className="text-center">
            <p className="eyebrow mb-6 justify-center">Prêt·e à commencer ?</p>
            <h2 className="font-serif text-display-lg text-espresso text-balance">
              Racontez-moi votre histoire.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">
              Chaque projet commence par une conversation. Parlons de votre
              vision, du lieu, du moment juste à capturer.
            </p>
            <Link href={ROUTES.contact} className="btn-primary mt-10 inline-flex">
              Réserver une séance
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
