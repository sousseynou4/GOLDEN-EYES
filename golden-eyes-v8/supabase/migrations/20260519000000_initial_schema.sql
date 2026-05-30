-- ═══════════════════════════════════════════════════════════════════════
-- GOLDEN EYES — Schéma initial de la base de données
-- ───────────────────────────────────────────────────────────────────────
-- À exécuter dans l'éditeur SQL Supabase : https://app.supabase.com
-- Crée les tables, contraintes, triggers, RLS policies et Realtime.
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────
do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type message_sender as enum ('admin', 'client');
exception
  when duplicate_object then null;
end $$;

-- ═════════════════════════════════════════════════════════════════════
-- TABLE : profiles
-- ─────────────────────────────────────────────────────────────────────
-- Étend la table `auth.users` de Supabase pour stocker les méta-données
-- du photographe (rôle admin, nom, avatar…).
-- ═════════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text unique not null,
  full_name   text,
  avatar_url  text,
  role        text default 'admin' not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ═════════════════════════════════════════════════════════════════════
-- TABLE : bookings (réservations clients)
-- ═════════════════════════════════════════════════════════════════════
create table if not exists public.bookings (
  id              uuid default uuid_generate_v4() primary key,
  nom             text not null,
  prenom          text not null,
  email           text not null,
  telephone       text not null,
  adresse         text,
  date_evenement  date not null,
  message         text not null,
  status          booking_status default 'pending' not null,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,

  -- Validation au niveau base
  constraint bookings_email_check check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  constraint bookings_nom_check check (char_length(nom) between 2 and 50),
  constraint bookings_prenom_check check (char_length(prenom) between 2 and 50),
  constraint bookings_message_check check (char_length(message) between 10 and 2000)
);

create index if not exists bookings_status_idx     on public.bookings(status);
create index if not exists bookings_created_at_idx on public.bookings(created_at desc);
create index if not exists bookings_date_event_idx on public.bookings(date_evenement);

-- ═════════════════════════════════════════════════════════════════════
-- TABLE : messages_history (suivi des échanges admin ↔ client)
-- ═════════════════════════════════════════════════════════════════════
create table if not exists public.messages_history (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  uuid references public.bookings(id) on delete cascade not null,
  sender      message_sender not null,
  content     text not null,
  read_at     timestamptz,
  created_at  timestamptz default now() not null,

  constraint messages_content_check check (char_length(content) between 1 and 5000)
);

create index if not exists messages_booking_id_idx  on public.messages_history(booking_id);
create index if not exists messages_created_at_idx  on public.messages_history(created_at desc);

-- ═════════════════════════════════════════════════════════════════════
-- TABLE : media (CMS Light — portfolio)
-- ═════════════════════════════════════════════════════════════════════
create table if not exists public.media (
  id             uuid default uuid_generate_v4() primary key,
  url            text not null,
  thumbnail_url  text,
  type           text not null check (type in ('image', 'video')),
  title          text,
  description    text,
  category       text,
  width          integer,
  height         integer,
  display_order  integer default 0 not null,
  is_featured    boolean default false not null,
  created_at     timestamptz default now() not null
);

create index if not exists media_type_idx          on public.media(type);
create index if not exists media_category_idx      on public.media(category);
create index if not exists media_display_order_idx on public.media(display_order);

-- ═════════════════════════════════════════════════════════════════════
-- TRIGGERS : auto-update du champ `updated_at`
-- ═════════════════════════════════════════════════════════════════════
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_bookings on public.bookings;
create trigger set_updated_at_bookings
  before update on public.bookings
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ═════════════════════════════════════════════════════════════════════
-- TRIGGER : création auto du profile à l'inscription d'un user
-- ═════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────
-- Stratégie :
--   • profiles         : owner only
--   • bookings         : INSERT public (formulaire), reste = admin auth
--   • messages_history : admin auth uniquement
--   • media            : SELECT public, mutations = admin auth
-- ═════════════════════════════════════════════════════════════════════

alter table public.profiles         enable row level security;
alter table public.bookings         enable row level security;
alter table public.messages_history enable row level security;
alter table public.media            enable row level security;

-- ─── PROFILES ────────────────────────────────────────────────────────
drop policy if exists "Profiles viewable by owner" on public.profiles;
create policy "Profiles viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles updatable by owner" on public.profiles;
create policy "Profiles updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── BOOKINGS ────────────────────────────────────────────────────────
drop policy if exists "Anyone can submit a booking" on public.bookings;
create policy "Anyone can submit a booking"
  on public.bookings for insert
  with check (true);

drop policy if exists "Admin can view all bookings" on public.bookings;
create policy "Admin can view all bookings"
  on public.bookings for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can update bookings" on public.bookings;
create policy "Admin can update bookings"
  on public.bookings for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete bookings" on public.bookings;
create policy "Admin can delete bookings"
  on public.bookings for delete
  using (auth.role() = 'authenticated');

-- ─── MESSAGES_HISTORY ────────────────────────────────────────────────
drop policy if exists "Admin can view messages" on public.messages_history;
create policy "Admin can view messages"
  on public.messages_history for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can insert messages" on public.messages_history;
create policy "Admin can insert messages"
  on public.messages_history for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Admin can update messages" on public.messages_history;
create policy "Admin can update messages"
  on public.messages_history for update
  using (auth.role() = 'authenticated');

-- ─── MEDIA ───────────────────────────────────────────────────────────
drop policy if exists "Media is publicly viewable" on public.media;
create policy "Media is publicly viewable"
  on public.media for select
  using (true);

drop policy if exists "Admin can manage media" on public.media;
create policy "Admin can manage media"
  on public.media for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ═════════════════════════════════════════════════════════════════════
-- REALTIME — active la diffusion temps réel sur bookings & messages
-- ═════════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.messages_history;
