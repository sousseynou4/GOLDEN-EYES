-- ═══════════════════════════════════════════════════════════════════════
-- GOLDEN EYES — Étape 4 : Storage (bucket photos/vidéos)
-- ───────────────────────────────────────────────────────────────────────
-- À exécuter dans l'éditeur SQL Supabase APRÈS la migration initiale.
-- Crée un bucket public `portfolio` et ses politiques d'accès.
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- Bucket public `portfolio`
--   - public en lecture (les visiteurs voient les photos)
--   - upload/suppression réservés aux utilisateurs authentifiés (admin)
-- ─────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  52428800, -- 50 Mo max par fichier
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ─────────────────────────────────────────────────────────────────────
-- Policies sur storage.objects pour le bucket `portfolio`
-- ─────────────────────────────────────────────────────────────────────

-- Lecture publique
drop policy if exists "Portfolio public read" on storage.objects;
create policy "Portfolio public read"
  on storage.objects for select
  using (bucket_id = 'portfolio');

-- Upload réservé aux authentifiés
drop policy if exists "Portfolio admin upload" on storage.objects;
create policy "Portfolio admin upload"
  on storage.objects for insert
  with check (bucket_id = 'portfolio' and auth.role() = 'authenticated');

-- Mise à jour réservée aux authentifiés
drop policy if exists "Portfolio admin update" on storage.objects;
create policy "Portfolio admin update"
  on storage.objects for update
  using (bucket_id = 'portfolio' and auth.role() = 'authenticated');

-- Suppression réservée aux authentifiés
drop policy if exists "Portfolio admin delete" on storage.objects;
create policy "Portfolio admin delete"
  on storage.objects for delete
  using (bucket_id = 'portfolio' and auth.role() = 'authenticated');
