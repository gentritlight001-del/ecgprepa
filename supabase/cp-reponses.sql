-- ══════════════════════════════════════════════════════════════
-- Espace de cours particuliers : réponses des élèves et numéro de fiche par élève.
-- À appliquer une fois (additif : ne modifie aucune donnée existante).
--
-- 1) cp_fiches_ouvertes.ouverte_le : date à laquelle le professeur a ouvert la
--    fiche à l'élève. Le « numéro » d'une fiche pour un élève est son rang dans
--    cet ordre (la première fiche ouverte est la fiche 1, etc.).
-- 2) cp_reponses : une réponse UNIQUE par question et par élève. L'élève peut
--    seulement ajouter (insert) : aucune règle de modification ni de suppression
--    pour lui, donc une réponse donnée ne peut plus être changée. Le professeur
--    (cp_est_admin) lit tout et peut remettre à zéro.
-- ══════════════════════════════════════════════════════════════

alter table public.cp_fiches_ouvertes
  add column if not exists ouverte_le timestamptz not null default now();

create table if not exists public.cp_reponses (
  eleve      uuid not null references public.cp_eleves(utilisateur) on delete cascade,
  fiche      int  not null,                 -- numéro de la fiche dans la bibliothèque (fiches.js)
  question   text not null,                 -- place de la question dans la fiche : r0, r1… (réponses tapées), q0, q1… (QCM)
  enonce     text,                          -- énoncé de la question, pour que le professeur la relise
  reponse    text not null,                 -- ce que l'élève a répondu
  attendu    text,                          -- la bonne réponse
  etat       text not null check (etat in ('juste', 'presque', 'faux')),
  repondu_le timestamptz not null default now(),
  primary key (eleve, fiche, question)
);
create index if not exists cp_reponses_fiche on public.cp_reponses (eleve, fiche);
alter table public.cp_reponses enable row level security;

drop policy if exists "cp_reponses admin" on public.cp_reponses;
create policy "cp_reponses admin" on public.cp_reponses for all to authenticated
  using (public.cp_est_admin()) with check (public.cp_est_admin());

drop policy if exists "cp_reponses eleve lit" on public.cp_reponses;
create policy "cp_reponses eleve lit" on public.cp_reponses for select to authenticated
  using (eleve = auth.uid() and public.cp_est_eleve());

-- L'élève ajoute sa réponse, une seule fois (clé primaire), pour une fiche qui lui est ouverte.
drop policy if exists "cp_reponses eleve repond" on public.cp_reponses;
create policy "cp_reponses eleve repond" on public.cp_reponses for insert to authenticated
  with check (eleve = auth.uid() and public.cp_est_eleve()
              and exists (select 1 from public.cp_fiches_ouvertes o
                          where o.eleve = auth.uid() and o.numero = cp_reponses.fiche));

-- Et rien d'autre : l'élève n'a ni update, ni delete, ni truncate (droits retirés explicitement).
revoke all on public.cp_reponses from anon, authenticated;
grant select, insert, delete on public.cp_reponses to authenticated;   -- delete : seule la règle « admin » le laisse passer
