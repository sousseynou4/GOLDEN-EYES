import { createClient } from "@/lib/supabase/server";
import { HomeImagesManager } from "@/components/admin/HomeImagesManager";
import { getCustomHomeImages } from "@/lib/site-settings";
import type { Media } from "@/types";

export const metadata = { title: "Page d'accueil" };
export const dynamic = "force-dynamic";

export default async function HomeSettingsPage() {
  const supabase = await createClient();

  // Vérifie que la migration `site_settings` a bien été exécutée
  const { error: tableError } = await supabase.from("site_settings").select("key").limit(1);

  const custom = await getCustomHomeImages(supabase);

  const { data: library } = await supabase
    .from("media")
    .select("id, url, title")
    .eq("type", "image")
    .eq("provider", "upload")
    .order("created_at", { ascending: false })
    .limit(60)
    .returns<Pick<Media, "id" | "url" | "title">[]>();

  const { count: featuredCount } = await supabase
    .from("media")
    .select("id", { count: "exact", head: true })
    .eq("type", "image")
    .eq("is_featured", true);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-espresso">Page d&apos;accueil</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Choisissez les photos affichées sur l&apos;accueil du site. Les
          changements sont visibles immédiatement.
        </p>
      </header>

      {tableError && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-medium">Configuration Supabase incomplète</p>
          <p className="mt-1">
            Exécutez le contenu du fichier{" "}
            <code className="rounded bg-amber-100 px-1">
              supabase/migrations/20261018000000_site_settings.sql
            </code>{" "}
            dans l&apos;éditeur SQL de Supabase, puis rechargez cette page.
          </p>
        </div>
      )}

      <HomeImagesManager
        custom={custom}
        library={library ?? []}
        featuredCount={featuredCount ?? 0}
      />
    </div>
  );
}
