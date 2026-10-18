import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/portfolio/Hero";
import { StudioIntro } from "@/components/portfolio/StudioIntro";
import { AboutPreview } from "@/components/portfolio/AboutPreview";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { Marquee } from "@/components/portfolio/Marquee";
import { FinalCta } from "@/components/portfolio/FinalCta";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { DEMO_GALLERY } from "@/lib/demo-content";
import { getHomeContent } from "@/lib/site-settings";
import type { Media } from "@/types";

export const revalidate = 60;

/**
 * Page d'accueil — direction « luxe or ».
 *   1. Hero photo plein écran + poussière d'or 3D (Three.js)
 *   2. Le studio : phrase signature + texte de présentation + prestations
 *   3. L'approche : photo en rideau + engagements
 *   4. Aperçu portfolio (mosaïque) — fond clair
 *   5. Bandeau défilant — fond noir
 *   6. Appel final à la réservation
 *
 * Les médias viennent de Supabase ; si la table est vide, on
 * retombe sur les images de démonstration pour que le site vive.
 * Les photos mises en avant (★) passent en premier, complétées
 * par les plus récentes. Le hero, le portrait et le texte de
 * présentation se règlent dans Dashboard → Page d'accueil.
 */
export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: dbMedia }, content] = await Promise.all([
    supabase
      .from("media")
      .select("id, url, title, category, type")
      .eq("type", "image")
      .order("is_featured", { ascending: false })
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(9)
      .returns<Pick<Media, "id" | "url" | "title" | "category" | "type">[]>(),
    getHomeContent(supabase),
  ]);

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
      <Hero image={content.images.home_hero_image} />

      <StudioIntro description={content.texts.home_description} />

      <AboutPreview image={content.images.home_about_image} />

      {/* Aperçu portfolio — fond clair */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow mb-5">Travaux récents</p>
              <h2 className="font-serif text-display-md text-espresso text-balance">
                Une sélection d&apos;<span className="italic text-gold-600">instants</span>.
              </h2>
            </div>
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

      {/* Bandeau défilant — fond noir */}
      <section className="relative bg-noir py-24">
        <div className="gold-rule absolute inset-x-0 top-0 opacity-30" aria-hidden="true" />
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="eyebrow mb-5 justify-center !text-gold-300">En mouvement</p>
            <h2 className="font-serif text-display-md font-light text-paper">
              Un <span className="text-gold italic">avant-goût</span>.
            </h2>
          </div>
        </Container>
        <Marquee images={marqueeImages} />
      </section>

      <FinalCta />
    </>
  );
}
