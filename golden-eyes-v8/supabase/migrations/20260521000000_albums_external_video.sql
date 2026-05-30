-- ═══════════════════════════════════════════════════════════════════════
-- GOLDEN EYES — Étape 5 : Albums, vidéos externes & limite storage
-- ───────────────────────────────────────────────────────────────────────
-- À exécuter dans l'éditeur SQL Supabase APRÈS les migrations précédentes.
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- 1. Ajout des colonnes pour les vidéos externes (Vimeo / YouTube)
--    - source : 'upload' (fichier dans le Storage) ou 'external' (lien)
--    - embed_url : URL d'intégration pour les vidéos externes
-- ─────────────────────────────────────────────────────────────────────
alter table public.media
  add column if not exists source text default 'upload' not null,
  add column if not exists embed_url text;

-- Contrainte : source doit être 'upload' ou 'external'
do $$ begin
  alter table public.media
    add constraint media_source_check check (source in ('upload', 'external'));
exception
  when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Relève la limite de taille du bucket à 100 Mo
--    (la compression côté client réduira fortement les images de toute façon)
-- ─────────────────────────────────────────────────────────────────────
update storage.buckets
set file_size_limit = 104857600  -- 100 Mo
where id = 'portfolio';

-- ─────────────────────────────────────────────────────────────────────
-- 3. Index sur la catégorie (déjà créé en migration initiale, idempotent)
-- ─────────────────────────────────────────────────────────────────────
create index if not exists media_category_idx on public.media(category);
