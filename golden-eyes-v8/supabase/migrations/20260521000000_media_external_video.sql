-- ═══════════════════════════════════════════════════════════════════════
-- GOLDEN EYES — Étape 5 : Vidéos externes + limite Storage relevée
-- ───────────────────────────────────────────────────────────────────────
-- À exécuter dans l'éditeur SQL Supabase APRÈS les migrations précédentes.
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- 1. Nouvelles colonnes sur `media`
--    - provider  : 'upload' (fichier Supabase) | 'youtube' | 'vimeo'
--    - embed_id  : identifiant de la vidéo externe (ex: dQw4w9WgXcQ)
-- ─────────────────────────────────────────────────────────────────────
alter table public.media
  add column if not exists provider text not null default 'upload',
  add column if not exists embed_id text;

-- Contrainte sur les valeurs autorisées de provider
do $$ begin
  alter table public.media
    add constraint media_provider_check
    check (provider in ('upload', 'youtube', 'vimeo'));
exception
  when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Relever la limite de taille du bucket `portfolio` à 200 Mo
--    (pour les fichiers exceptionnels ; les images sont compressées
--     côté navigateur avant upload, donc rarement aussi lourdes)
-- ─────────────────────────────────────────────────────────────────────
update storage.buckets
set file_size_limit = 209715200 -- 200 Mo
where id = 'portfolio';
