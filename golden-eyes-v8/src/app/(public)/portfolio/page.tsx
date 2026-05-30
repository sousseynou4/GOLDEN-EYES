import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PortfolioGallery, type GalleryItem } from "@/components/portfolio/PortfolioGallery";
import { createClient } from "@/lib/supabase/server";
import { DEMO_GALLERY } from "@/lib/demo-content";
import type { Media } from "@/types";

export const metadata = {
  title: "Portfolio",
  description: "Une sélection de travaux récents — portraits, mariages et reportages.",
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const supabase = await createClient();

  const { data: dbMedia } = await supabase
    .from("media")
    .select("id, url, thumbnail_url, type, provider, embed_id, title, category")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .returns<Media[]>();

  const items: GalleryItem[] =
    dbMedia && dbMedia.length > 0
      ? dbMedia.map((m) => ({
          id: m.id,
          url: m.url,
          thumbnail_url: m.thumbnail_url,
          type: m.type,
          provider: m.provider,
          embed_id: m.embed_id,
          title: m.title,
          category: m.category,
        }))
      : DEMO_GALLERY.map((d) => ({
          id: d.id,
          url: d.url,
          thumbnail_url: null,
          type: "image" as const,
          provider: "upload" as const,
          embed_id: null,
          title: d.title,
          category: d.category,
        }));

  return (
    <>
      <div className="h-28" />
      <section className="pb-24 pt-8">
        <Container>
          <SectionTitle
            eyebrow="Portfolio"
            title="Une sélection d'instants."
            description="Explorez par album. Cliquez sur une image ou une vidéo pour la découvrir en grand."
          />
          <div className="mt-16">
            <PortfolioGallery items={items} />
          </div>
        </Container>
      </section>
    </>
  );
}
