-- ═══════════════════════════════════════════════════════════════════════
-- GOLDEN EYES — Images de la page d'accueil modifiables par l'admin
-- ───────────────────────────────────────────────────────────────────────
-- À exécuter dans l'éditeur SQL Supabase APRÈS les migrations précédentes.
-- Crée une petite table clé/valeur `site_settings` qui stocke, entre
-- autres, l'URL de l'image du hero et celle du portrait de l'accueil.
--
-- Clés utilisées par le site :
--   • home_hero_image   → grande photo de fond en haut de l'accueil
--   • home_about_image  → portrait de la section « L'approche »
-- Une clé absente = image par défaut.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.site_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz default now() not null
);

-- Fonction de mise à jour de `updated_at` (recréée ici au cas où elle
-- aurait disparu, par ex. après un « Reset Public Schema »)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_site_settings on public.site_settings;
create trigger set_updated_at_site_settings
  before update on public.site_settings
  for each row execute function public.handle_updated_at();

-- ─── RLS : lecture publique, écriture admin ──────────────────────────
alter table public.site_settings enable row level security;

drop policy if exists "Site settings publicly viewable" on public.site_settings;
create policy "Site settings publicly viewable"
  on public.site_settings for select
  using (true);

drop policy if exists "Admin can manage site settings" on public.site_settings;
create policy "Admin can manage site settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── Droits (évite l'erreur 42501 « permission denied ») ─────────────
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
