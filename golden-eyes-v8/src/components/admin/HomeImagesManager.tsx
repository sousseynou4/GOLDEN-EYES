"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUp, Images, Loader2, RotateCcw, Star, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { setHomeImage, resetHomeImage } from "@/app/(admin)/dashboard/home-actions";
import { compressImage } from "@/lib/image-compression";
import {
  HOME_IMAGE_SLOTS,
  SITE_IMAGES_FOLDER,
  type HomeImageKey,
} from "@/lib/site-settings";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STORAGE_BUCKET = "portfolio";

type LibraryImage = { id: string; url: string; title: string | null };

interface HomeImagesManagerProps {
  /** URLs personnalisées déjà enregistrées (clés absentes = image par défaut) */
  custom: Partial<Record<HomeImageKey, string>>;
  /** Photos de la médiathèque, pour choisir une image déjà importée */
  library: LibraryImage[];
  /** Nombre de photos mises en avant (★) dans la médiathèque */
  featuredCount: number;
}

export function HomeImagesManager({ custom, library, featuredCount }: HomeImagesManagerProps) {
  const [images, setImages] = useState(custom);

  return (
    <div className="space-y-8">
      {HOME_IMAGE_SLOTS.map((slot) => (
        <SlotEditor
          key={slot.key}
          slot={slot}
          current={images[slot.key]}
          library={library}
          onChange={(url) =>
            setImages((cur) => {
              const next = { ...cur };
              if (url) next[slot.key] = url;
              else delete next[slot.key];
              return next;
            })
          }
        />
      ))}

      {/* Galerie : pilotée par les étoiles de la médiathèque */}
      <section className="rounded-2xl border border-line bg-paper-pure p-6">
        <h2 className="font-serif text-xl text-espresso">
          Galerie « Travaux récents » et bandeau défilant
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Ces photos viennent de la médiathèque. Cliquez sur l&apos;étoile{" "}
          <Star className="inline h-3.5 w-3.5 text-gold-600" /> d&apos;une photo
          pour l&apos;afficher en priorité sur l&apos;accueil (9 photos au
          maximum). Les places restantes sont complétées par les photos les
          plus récentes.
        </p>
        <p className="mt-3 text-sm text-espresso">
          {featuredCount === 0
            ? "Aucune photo mise en avant pour l'instant."
            : `${featuredCount} photo(s) mise(s) en avant.`}
        </p>
        <Link href={ROUTES.media} className="btn-ghost mt-5 inline-flex">
          Gérer la médiathèque
        </Link>
      </section>
    </div>
  );
}

/* ── Un emplacement d'image ─────────────────────────────────────── */

function SlotEditor({
  slot,
  current,
  library,
  onChange,
}: {
  slot: (typeof HOME_IMAGE_SLOTS)[number];
  current: string | undefined;
  library: LibraryImage[];
  onChange: (url: string | null) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isPending, startTransition] = useTransition();

  const busy = uploading || isPending;
  const preview = current ?? slot.fallback;

  async function save(url: string) {
    const res = await setHomeImage(slot.key, url);
    if (!res.ok) {
      toast.error("Enregistrement échoué", { description: res.error });
      return false;
    }
    onChange(url);
    toast.success("Image mise à jour");
    router.refresh();
    return true;
  }

  async function handleFile(files: FileList | null) {
    const original = files?.[0];
    if (!original) return;
    if (!original.type.startsWith("image/")) {
      toast.error("Ce fichier n'est pas une image");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const file = await compressImage(original, { maxWidth: 2560 });
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${SITE_IMAGES_FOLDER}/${slot.key}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (upErr) {
      toast.error("Échec de l'envoi", { description: upErr.message });
      setUploading(false);
      return;
    }

    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const saved = await save(pub.publicUrl);
    // Évite de laisser un fichier orphelin si l'enregistrement a échoué
    if (!saved) await supabase.storage.from(STORAGE_BUCKET).remove([path]);

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function pickFromLibrary(url: string) {
    startTransition(async () => {
      if (await save(url)) setShowLibrary(false);
    });
  }

  function handleReset() {
    startTransition(async () => {
      const res = await resetHomeImage(slot.key);
      if (!res.ok) {
        toast.error("Erreur", { description: res.error });
        return;
      }
      onChange(null);
      toast.success("Image par défaut rétablie");
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-paper-pure p-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
        {/* Aperçu */}
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-xl bg-paper-warm",
            slot.aspect,
            slot.key === "home_about_image" && "max-w-[260px]",
          )}
        >
          <Image
            src={preview}
            alt={slot.label}
            fill
            sizes="320px"
            className={cn("object-cover transition", busy && "opacity-40")}
          />
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gold-600" />
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-full bg-espresso/80 px-2 py-1 text-[10px] font-medium text-paper">
            {current ? "Personnalisée" : "Image par défaut"}
          </span>
        </div>

        {/* Texte + actions */}
        <div>
          <h2 className="font-serif text-xl text-espresso">{slot.label}</h2>
          <p className="mt-2 text-sm text-ink-muted">{slot.description}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="btn-primary disabled:opacity-50"
            >
              <ImageUp className="h-4 w-4" />
              Importer une photo
            </button>
            <button
              onClick={() => setShowLibrary((v) => !v)}
              disabled={busy || library.length === 0}
              className="btn-ghost disabled:opacity-50"
            >
              <Images className="h-4 w-4" />
              Choisir dans la médiathèque
            </button>
            {current && (
              <button
                onClick={handleReset}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-wider text-ink-muted transition hover:text-red-500 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Rétablir par défaut
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            La photo est compressée automatiquement (WebP) avant l&apos;envoi.
          </p>
        </div>
      </div>

      {/* Sélecteur médiathèque */}
      {showLibrary && (
        <div className="mt-6 border-t border-line pt-6">
          <p className="mb-3 text-sm text-ink-muted">Cliquez sur une photo pour l&apos;utiliser :</p>
          <div className="grid max-h-[420px] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">
            {library.map((img) => {
              const selected = img.url === current;
              return (
                <button
                  key={img.id}
                  onClick={() => pickFromLibrary(img.url)}
                  disabled={busy || selected}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border-2 transition",
                    selected ? "border-gold-500" : "border-transparent hover:border-gold-300",
                  )}
                  title={img.title ?? undefined}
                >
                  <Image
                    src={img.url}
                    alt={img.title ?? ""}
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                  {selected && (
                    <span className="absolute right-1 top-1 rounded-full bg-gold-500 p-1 text-espresso">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
