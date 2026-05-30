"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload, Loader2, Trash2, Star, X, ImageIcon, Film, Link2, Play,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createUploadedMedia, createExternalVideo, updateMedia, deleteMedia,
} from "@/app/(admin)/dashboard/media-actions";
import { compressImage, formatFileSize } from "@/lib/image-compression";
import { parseVideoUrl, buildThumbnail } from "@/lib/video";
import { cn } from "@/lib/utils";
import type { Media } from "@/types";

const STORAGE_BUCKET = "portfolio";

interface MediaManagerProps {
  initialMedia: Media[];
  /** Catégories déjà existantes, pour proposer l'autocomplétion */
  knownCategories: string[];
}

type Tab = "upload" | "video";

export function MediaManager({ initialMedia, knownCategories }: MediaManagerProps) {
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [tab, setTab] = useState<Tab>("upload");

  function prepend(m: Media) {
    setMedia((cur) => [m, ...cur]);
  }

  const categories = Array.from(
    new Set([...knownCategories, ...media.map((m) => m.category).filter(Boolean) as string[]]),
  );

  return (
    <div className="space-y-8">
      {/* Onglets */}
      <div className="flex gap-2">
        <TabButton active={tab === "upload"} onClick={() => setTab("upload")} icon={Upload}>
          Importer des fichiers
        </TabButton>
        <TabButton active={tab === "video"} onClick={() => setTab("video")} icon={Link2}>
          Vidéo YouTube / Vimeo
        </TabButton>
      </div>

      {tab === "upload" ? (
        <UploadZone onAdded={prepend} categories={categories} />
      ) : (
        <ExternalVideoForm onAdded={prepend} categories={categories} />
      )}

      {/* Galerie de gestion */}
      {media.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="text-ink-muted">Aucun média pour l&apos;instant.</p>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-sm text-ink-muted">
            {media.length} média(s) · {media.filter((m) => m.is_featured).length} en avant
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {media.map((m) => (
              <MediaCard
                key={m.id}
                media={m}
                categories={categories}
                onChange={(u) => setMedia((cur) => cur.map((x) => (x.id === m.id ? u : x)))}
                onDelete={() => setMedia((cur) => cur.filter((x) => x.id !== m.id))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function TabButton({
  active, onClick, icon: Icon, children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition",
        active
          ? "bg-espresso text-paper"
          : "border border-line bg-paper-pure text-ink-muted hover:border-espresso hover:text-espresso",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

/* ── Zone d'upload de fichiers ──────────────────────────────────── */

function UploadZone({
  onAdded, categories,
}: {
  onAdded: (m: Media) => void;
  categories: string[];
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [category, setCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    let success = 0;

    for (let i = 0; i < files.length; i++) {
      const original = files[i];
      const isVideo = original.type.startsWith("video/");

      setProgress(`${i + 1}/${files.length} — ${isVideo ? "vidéo" : "compression"} : ${original.name}`);

      // Compression pour les images (pas les vidéos)
      const file = isVideo ? original : await compressImage(original);

      if (!isVideo) {
        const saved = original.size - file.size;
        if (saved > 0) {
          setProgress(
            `${i + 1}/${files.length} — ${original.name} : ${formatFileSize(original.size)} → ${formatFileSize(file.size)}`,
          );
        }
      }

      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        toast.error(`Échec : ${original.name}`, { description: upErr.message });
        continue;
      }

      const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

      const res = await createUploadedMedia({
        url: pub.publicUrl,
        type: isVideo ? "video" : "image",
        title: original.name.replace(/\.[^.]+$/, ""),
        category: category || undefined,
      });

      if (res.ok) {
        success++;
      } else {
        toast.error("Enregistrement échoué", { description: res.error });
      }
    }

    setUploading(false);
    setProgress("");
    if (success > 0) {
      toast.success(`${success} média(s) ajouté(s)`);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-4">
      <CategoryInput value={category} onChange={setCategory} categories={categories} />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="rounded-2xl border-2 border-dashed border-line bg-paper-pure p-10 text-center transition hover:border-gold-400"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gold-600" />
            <p className="text-sm text-ink-muted">Traitement en cours…</p>
            {progress && <p className="text-xs text-ink-faint">{progress}</p>}
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-gold-600" />
            <p className="mt-4 font-serif text-xl text-espresso">Glissez vos fichiers ici</p>
            <p className="mt-1 text-sm text-ink-muted">
              Les photos sont <strong>compressées automatiquement</strong> (WebP) avant l&apos;envoi
            </p>
            <p className="mt-0.5 text-xs text-ink-faint">
              JPG, PNG, WebP, MP4, WebM — 200 Mo max
            </p>
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary mt-6">
              Choisir des fichiers
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Formulaire vidéo externe ───────────────────────────────────── */

function ExternalVideoForm({
  onAdded, categories,
}: {
  onAdded: (m: Media) => void;
  categories: string[];
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isPending, startTransition] = useTransition();

  const parsed = url.trim() ? parseVideoUrl(url) : null;

  function handleAdd() {
    if (!parsed) {
      toast.error("URL non reconnue", {
        description: "Collez un lien YouTube ou Vimeo valide.",
      });
      return;
    }
    startTransition(async () => {
      const res = await createExternalVideo({
        provider: parsed.provider,
        embedId: parsed.embedId,
        thumbnail: parsed.thumbnail,
        title: title || undefined,
        category: category || undefined,
      });
      if (res.ok) {
        toast.success("Vidéo ajoutée");
        window.location.reload();
      } else {
        toast.error("Erreur", { description: res.error });
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-paper-pure p-6">
      <div>
        <label className="label">Lien de la vidéo</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=… ou https://vimeo.com/…"
          className="field"
        />
        {url.trim() && !parsed && (
          <p className="mt-1.5 text-xs text-red-500">
            Lien non reconnu (YouTube ou Vimeo uniquement)
          </p>
        )}
        {parsed && (
          <p className="mt-1.5 text-xs text-emerald-600">
            ✓ {parsed.provider === "youtube" ? "YouTube" : "Vimeo"} détecté
          </p>
        )}
      </div>

      {/* Aperçu miniature YouTube */}
      {parsed && parsed.thumbnail && (
        <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-xl bg-paper-warm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={parsed.thumbnail} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-espresso/20">
            <Play className="h-10 w-10 text-paper" fill="currentColor" />
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Mariage de Marie & Jean"
            className="field"
          />
        </div>
        <div>
          <label className="label">Catégorie</label>
          <CategoryInput value={category} onChange={setCategory} categories={categories} bare />
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={isPending || !parsed}
        className="btn-primary disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
        Ajouter la vidéo
      </button>
    </div>
  );
}

/* ── Input catégorie avec suggestions ───────────────────────────── */

function CategoryInput({
  value, onChange, categories, bare = false,
}: {
  value: string;
  onChange: (v: string) => void;
  categories: string[];
  bare?: boolean;
}) {
  return (
    <div className={bare ? "" : "rounded-2xl border border-line bg-paper-pure p-4"}>
      {!bare && <label className="label">Catégorie / album (optionnel)</label>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list="category-suggestions"
        placeholder="Ex : Mariage, Portrait, Reportage…"
        className="field"
      />
      <datalist id="category-suggestions">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      {!bare && (
        <p className="mt-1.5 text-xs text-ink-faint">
          Tous les fichiers importés ci-dessous seront classés dans cet album.
        </p>
      )}
    </div>
  );
}

/* ── Carte média ────────────────────────────────────────────────── */

function MediaCard({
  media, categories, onChange, onDelete,
}: {
  media: Media;
  categories: string[];
  onChange: (m: Media) => void;
  onDelete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const isExternal = media.provider !== "upload";
  const thumb = isExternal
    ? media.thumbnail_url || buildThumbnail(media.provider, media.embed_id) || ""
    : media.url;

  function toggleFeatured() {
    startTransition(async () => {
      const res = await updateMedia(media.id, { is_featured: !media.is_featured });
      if (res.ok) {
        onChange({ ...media, is_featured: !media.is_featured });
        toast.success(media.is_featured ? "Retiré de la mise en avant" : "Mis en avant");
      } else toast.error("Erreur", { description: res.error });
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteMedia(media.id, media.url, media.provider);
      if (res.ok) {
        onDelete();
        toast.success("Média supprimé");
      } else toast.error("Erreur", { description: res.error });
    });
  }

  function saveMeta(title: string, category: string) {
    startTransition(async () => {
      const res = await updateMedia(media.id, {
        title: title || null,
        category: category || null,
      });
      if (res.ok) {
        onChange({ ...media, title: title || null, category: category || null });
        setEditing(false);
        toast.success("Mis à jour");
      } else toast.error("Erreur", { description: res.error });
    });
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-line bg-paper-pure">
      <div className="relative aspect-square bg-paper-warm">
        {media.type === "video" && !isExternal ? (
          <video src={media.url} className="h-full w-full object-cover" muted />
        ) : thumb ? (
          <Image
            src={thumb}
            alt={media.title ?? ""}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-8 w-8 text-ink-faint" />
          </div>
        )}

        {/* Badge type / provider */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-espresso/80 px-2 py-1 text-[10px] font-medium text-paper">
          {media.type === "video" ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
          {isExternal && (media.provider === "youtube" ? "YouTube" : "Vimeo")}
        </span>

        {/* Actions au survol */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-espresso/50 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={toggleFeatured}
            disabled={isPending}
            className={cn(
              "rounded-full p-2.5 transition",
              media.is_featured ? "bg-gold-500 text-espresso" : "bg-paper text-ink hover:bg-gold-300",
            )}
            aria-label="Mettre en avant"
          >
            <Star className="h-4 w-4" fill={media.is_featured ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full bg-paper p-2.5 text-red-500 transition hover:bg-red-500 hover:text-white"
            aria-label="Supprimer"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>

        {media.is_featured && (
          <span className="absolute right-2 top-2 rounded-full bg-gold-500 p-1 text-espresso">
            <Star className="h-3 w-3" fill="currentColor" />
          </span>
        )}
      </div>

      <button onClick={() => setEditing(true)} className="block w-full px-3 py-2 text-left">
        <p className="truncate text-sm font-medium text-espresso">
          {media.title || "Sans titre"}
        </p>
        <p className="truncate text-xs text-ink-faint">
          {media.category || "Aucune catégorie"}
        </p>
      </button>

      <AnimatePresence>
        {editing && (
          <EditMetaForm
            media={media}
            categories={categories}
            isPending={isPending}
            onSave={saveMeta}
            onCancel={() => setEditing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditMetaForm({
  media, categories, isPending, onSave, onCancel,
}: {
  media: Media;
  categories: string[];
  isPending: boolean;
  onSave: (title: string, category: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(media.title ?? "");
  const [category, setCategory] = useState(media.category ?? "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex flex-col gap-2 bg-paper p-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Éditer</p>
        <button onClick={onCancel} className="text-ink-faint hover:text-espresso">
          <X className="h-4 w-4" />
        </button>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="rounded-lg border border-line bg-paper-pure px-2 py-1.5 text-xs focus:border-gold-500 focus:outline-none"
      />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        list="category-suggestions-edit"
        placeholder="Catégorie"
        className="rounded-lg border border-line bg-paper-pure px-2 py-1.5 text-xs focus:border-gold-500 focus:outline-none"
      />
      <datalist id="category-suggestions-edit">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <button
        onClick={() => onSave(title, category)}
        disabled={isPending}
        className="mt-auto rounded-lg bg-espresso py-2 text-xs font-medium text-paper transition hover:bg-gold-500 hover:text-espresso disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </motion.div>
  );
}
