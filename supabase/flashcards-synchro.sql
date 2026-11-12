-- ══════════════════════════════════════════════════════════════════
--  ECG Prépa — Flashcards synchronisées entre appareils
--
--  Une ligne par élève : toute sa progression de l'espace flashcards
--  (paquets, cartes perso, dates de retour des cartes, rythme…), au
--  format de flashcards/synchro.js. Le navigateur garde une copie
--  locale et fusionne les deux à chaque ouverture (clé par clé, la
--  modification la plus récente l'emporte).
--
--  Déjà appliqué sur le projet (novembre 2026). Peut être relancé
--  sans risque : il ne détruit rien.
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.flashcards (
  utilisateur uuid primary key references auth.users(id) on delete cascade,
  donnees     jsonb not null default '{}'::jsonb,
  maj         timestamptz not null default now()
);

alter table public.flashcards enable row level security;

drop policy if exists "flashcards lecture" on public.flashcards;
create policy "flashcards lecture" on public.flashcards
  for select to authenticated using (auth.uid() = utilisateur);

drop policy if exists "flashcards creation" on public.flashcards;
create policy "flashcards creation" on public.flashcards
  for insert to authenticated with check (auth.uid() = utilisateur);

drop policy if exists "flashcards modification" on public.flashcards;
create policy "flashcards modification" on public.flashcards
  for update to authenticated using (auth.uid() = utilisateur) with check (auth.uid() = utilisateur);

drop policy if exists "flashcards suppression" on public.flashcards;
create policy "flashcards suppression" on public.flashcards
  for delete to authenticated using (auth.uid() = utilisateur);
