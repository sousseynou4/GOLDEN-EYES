import { createClient } from "@/lib/supabase/server";
import { MediaManager } from "@/components/admin/MediaManager";
import type { Media } from "@/types";

export const metadata = { title: "Médias" };
export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Media[]>();

  const items = data ?? [];
  const knownCategories = Array.from(
    new Set(items.map((m) => m.category).filter(Boolean) as string[]),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-espresso">Médias</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Gérez les photos et vidéos de votre portfolio. Les médias « mis en
          avant » (★) apparaissent sur la page d&apos;accueil.
        </p>
      </header>

      <MediaManager initialMedia={items} knownCategories={knownCategories} />
    </div>
  );
}
