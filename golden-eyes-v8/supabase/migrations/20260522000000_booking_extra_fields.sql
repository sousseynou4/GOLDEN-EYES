-- ═══════════════════════════════════════════════════════════════════════
-- GOLDEN EYES — Étape 6 : Champs enrichis du formulaire de réservation
-- ───────────────────────────────────────────────────────────────────────
-- À exécuter dans l'éditeur SQL Supabase APRÈS les migrations précédentes.
-- Ajoute : type de prestation, nombre de personnes, budget, lieu.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.bookings
  add column if not exists type_prestation text,
  add column if not exists nombre_personnes integer,
  add column if not exists budget text,
  add column if not exists lieu text;

-- Contrainte douce sur le type de prestation (valeurs attendues, mais
-- on autorise NULL pour les anciennes réservations).
do $$ begin
  alter table public.bookings
    add constraint bookings_type_prestation_check
    check (
      type_prestation is null or type_prestation in (
        'mariage', 'portrait', 'evenement', 'reportage', 'autre'
      )
    );
exception
  when duplicate_object then null;
end $$;
