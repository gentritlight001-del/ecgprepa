-- ══════════════════════════════════════════════════════════════════
--  ECG Prépa : espace de cours particuliers de maths (seconde)
--  (novembre 2026, maquette validée par le propriétaire)
--
--  Un espace privé pour les élèves de cours particuliers du
--  propriétaire : séances, devoirs, PDF et fiches de cours.
--  Ce qui se modifie depuis le site (élèves, séances, devoirs, PDF)
--  est gardé ici ; un visiteur ou un membre qui n'est pas élève ne
--  reçoit rien. Les pages elles-mêmes sont fermées par auth.js (404).
--
--  - cp_eleves         : les comptes qui ont accès (actif = accès ouvert)
--  - cp_seances        : séances passées ou à venir, par élève
--  - cp_devoirs        : devoirs, cochés par l'élève (cp_cocher_devoir)
--  - cp_documents      : PDF (eleve null = pour tous les élèves)
--  - cp_fiches_ouvertes: quelles fiches chaque élève voit (numéro de la
--                        fiche ; les fiches sont des pages du site,
--                        cours-particuliers/fiche-NN.html, listées dans
--                        cours-particuliers/fiches.js)
--  - bucket privé « cours-particuliers » : eleves/<id>/… et commun/…
--
--  Déjà appliqué sur la base (migrations « cours_particuliers »,
--  « cours_particuliers_fiches_en_pages » et « cours_particuliers_droits »).
-- ══════════════════════════════════════════════════════════════════

create or replace function public.cp_est_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profils
                 where id = auth.uid() and role = 'admin' and statut = 'actif');
$$;

create table if not exists public.cp_eleves (
  utilisateur     uuid primary key references auth.users(id) on delete cascade,
  actif           boolean not null default true,
  ajoute_le       timestamptz not null default now(),
  derniere_visite timestamptz
);
alter table public.cp_eleves enable row level security;

create or replace function public.cp_est_eleve()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.cp_eleves e
                 join public.profils p on p.id = e.utilisateur
                 where e.utilisateur = auth.uid() and e.actif and p.statut = 'actif');
$$;

create table if not exists public.cp_seances (
  id           bigserial primary key,
  eleve        uuid not null references public.cp_eleves(utilisateur) on delete cascade,
  quand        timestamptz not null,
  duree_min    int check (duree_min is null or duree_min > 0),
  vu           text,
  retravailler text,
  mot          text,
  cree_le      timestamptz not null default now()
);
create index if not exists cp_seances_eleve on public.cp_seances (eleve, quand desc);
alter table public.cp_seances enable row level security;

create table if not exists public.cp_devoirs (
  id       bigserial primary key,
  eleve    uuid not null references public.cp_eleves(utilisateur) on delete cascade,
  texte    text not null check (length(btrim(texte)) > 0),
  pour     date,
  fait     boolean not null default false,
  fait_le  timestamptz,
  cree_le  timestamptz not null default now()
);
create index if not exists cp_devoirs_eleve on public.cp_devoirs (eleve, pour);
alter table public.cp_devoirs enable row level security;

create table if not exists public.cp_documents (
  id        bigserial primary key,
  eleve     uuid references public.cp_eleves(utilisateur) on delete cascade,   -- null = tous
  titre     text not null,
  type      text not null default 'exercices'
            check (type in ('exercices', 'corrige', 'controle', 'fiche', 'autre')),
  chapitre  int,
  chemin    text not null unique,
  taille    bigint,
  depose_le timestamptz not null default now()
);
alter table public.cp_documents enable row level security;

create table if not exists public.cp_fiches_ouvertes (
  eleve   uuid not null references public.cp_eleves(utilisateur) on delete cascade,
  numero  int not null,
  primary key (eleve, numero)
);
alter table public.cp_fiches_ouvertes enable row level security;

-- ─── Règles d'accès ───────────────────────────────────────────────
-- L'administrateur fait tout ; un élève actif lit seulement ce qui le concerne.
drop policy if exists "cp_eleves admin" on public.cp_eleves;
create policy "cp_eleves admin" on public.cp_eleves for all to authenticated
  using (public.cp_est_admin()) with check (public.cp_est_admin());
drop policy if exists "cp_eleves soi" on public.cp_eleves;
create policy "cp_eleves soi" on public.cp_eleves for select to authenticated
  using (utilisateur = auth.uid() and actif);

drop policy if exists "cp_seances admin" on public.cp_seances;
create policy "cp_seances admin" on public.cp_seances for all to authenticated
  using (public.cp_est_admin()) with check (public.cp_est_admin());
drop policy if exists "cp_seances eleve" on public.cp_seances;
create policy "cp_seances eleve" on public.cp_seances for select to authenticated
  using (eleve = auth.uid() and public.cp_est_eleve());

drop policy if exists "cp_devoirs admin" on public.cp_devoirs;
create policy "cp_devoirs admin" on public.cp_devoirs for all to authenticated
  using (public.cp_est_admin()) with check (public.cp_est_admin());
drop policy if exists "cp_devoirs eleve" on public.cp_devoirs;
create policy "cp_devoirs eleve" on public.cp_devoirs for select to authenticated
  using (eleve = auth.uid() and public.cp_est_eleve());

drop policy if exists "cp_documents admin" on public.cp_documents;
create policy "cp_documents admin" on public.cp_documents for all to authenticated
  using (public.cp_est_admin()) with check (public.cp_est_admin());
drop policy if exists "cp_documents eleve" on public.cp_documents;
create policy "cp_documents eleve" on public.cp_documents for select to authenticated
  using ((eleve = auth.uid() or eleve is null) and public.cp_est_eleve());

drop policy if exists "cp_fiches_ouvertes admin" on public.cp_fiches_ouvertes;
create policy "cp_fiches_ouvertes admin" on public.cp_fiches_ouvertes for all to authenticated
  using (public.cp_est_admin()) with check (public.cp_est_admin());
drop policy if exists "cp_fiches_ouvertes eleve" on public.cp_fiches_ouvertes;
create policy "cp_fiches_ouvertes eleve" on public.cp_fiches_ouvertes for select to authenticated
  using (eleve = auth.uid() and public.cp_est_eleve());

-- ─── Fonctions ────────────────────────────────────────────────────
-- Qui suis-je pour cet espace ? (page de l'élève et menu du compte)
create or replace function public.cp_moi()
returns json
language plpgsql security definer set search_path = public
as $$
declare
  adm boolean := public.cp_est_admin();
  elv boolean := public.cp_est_eleve();
begin
  if elv then
    update public.cp_eleves set derniere_visite = now() where utilisateur = auth.uid();
  end if;
  return json_build_object('admin', adm, 'eleve', elv);
end;
$$;

-- L'élève coche ou décoche un de ses devoirs.
create or replace function public.cp_cocher_devoir(p_id bigint, p_fait boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.cp_est_eleve() and not public.cp_est_admin() then
    raise exception 'acces refuse';
  end if;
  update public.cp_devoirs
     set fait = p_fait, fait_le = case when p_fait then now() else null end
   where id = p_id and (eleve = auth.uid() or public.cp_est_admin());
end;
$$;

-- Admin : donner l'accès au compte qui a cette adresse.
create or replace function public.cp_donner_acces(p_email text)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  u public.profils%rowtype;
begin
  if not public.cp_est_admin() then raise exception 'acces refuse'; end if;
  select * into u from public.profils where lower(email) = lower(btrim(p_email)) limit 1;
  if not found then return json_build_object('ok', false, 'raison', 'aucun_compte'); end if;
  insert into public.cp_eleves (utilisateur) values (u.id)
    on conflict (utilisateur) do update set actif = true;
  return json_build_object('ok', true, 'id', u.id, 'prenom', u.prenom, 'nom', u.nom);
end;
$$;

-- Admin : la liste des élèves avec leur nom et leur adresse.
create or replace function public.cp_eleves_liste()
returns table (utilisateur uuid, email text, prenom text, nom text, actif boolean,
               ajoute_le timestamptz, derniere_visite timestamptz)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.cp_est_admin() then raise exception 'acces refuse'; end if;
  return query
    select e.utilisateur, p.email, p.prenom, p.nom, e.actif, e.ajoute_le, e.derniere_visite
      from public.cp_eleves e join public.profils p on p.id = e.utilisateur
     order by e.actif desc, p.prenom;
end;
$$;

-- Fonctions réservées aux comptes connectés (migration « cours_particuliers_droits »).
do $do$
declare f text;
begin
  foreach f in array array['cp_est_admin()', 'cp_est_eleve()', 'cp_moi()', 'cp_cocher_devoir(bigint, boolean)', 'cp_donner_acces(text)', 'cp_eleves_liste()'] loop
    execute 'revoke execute on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
end $do$;

-- ─── Fichiers PDF : bucket privé ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('cours-particuliers', 'cours-particuliers', false)
on conflict (id) do update set public = false;

drop policy if exists "cours-particuliers: admin" on storage.objects;
create policy "cours-particuliers: admin" on storage.objects for all to authenticated
  using (bucket_id = 'cours-particuliers' and public.cp_est_admin())
  with check (bucket_id = 'cours-particuliers' and public.cp_est_admin());

drop policy if exists "cours-particuliers: lecture eleve" on storage.objects;
create policy "cours-particuliers: lecture eleve" on storage.objects for select to authenticated
  using (bucket_id = 'cours-particuliers' and public.cp_est_eleve() and (
    (storage.foldername(name))[1] = 'commun'
    or ((storage.foldername(name))[1] = 'eleves' and (storage.foldername(name))[2] = auth.uid()::text)));
