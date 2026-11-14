-- ══════════════════════════════════════════════════════════════════
-- ECG Prépa : statistiques de lecture (pages consultées)
--
-- Une ligne par page ouverte : chemin, titre, appareil, temps de
-- lecture actif et profondeur de défilement. Aucune donnée qui
-- identifie l'élève : « lecteur » est une empreinte qui change chaque
-- jour (elle sert seulement à compter les lecteurs distincts d'une
-- journée, jamais à suivre quelqu'un d'un jour à l'autre).
-- Les administrateurs ne sont pas comptés.
--
-- Écriture : fonctions noter_vue / finir_vue (security definer).
-- Lecture : fonction stats_lecture, réservée aux administrateurs.
-- Aucun accès direct à la table (RLS sans politique).
-- Conservation : 13 mois (purge à chaque lecture des statistiques).
-- Appliqué sur Supabase le 14 novembre 2026.
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.pages_vues (
  id          bigint generated always as identity primary key,
  page        text not null,
  titre       text,
  appareil    text not null default 'ordinateur',
  membre      boolean not null default false,
  lecteur     text not null,
  cle         uuid not null,
  duree       integer not null default 0,     -- secondes de lecture active
  defilement  smallint not null default 0,    -- % de la page atteint
  cree        timestamptz not null default now()
);

create index if not exists pages_vues_cree on public.pages_vues (cree);
create index if not exists pages_vues_page on public.pages_vues (page);

alter table public.pages_vues enable row level security;
revoke all on public.pages_vues from anon, authenticated;

-- ─── Ouverture d'une page ──────────────────────────────────────────
create or replace function public.noter_vue(
  p_page text, p_titre text, p_appareil text, p_cle uuid
) returns bigint
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_id bigint;
  v_uid uuid := auth.uid();
begin
  if p_page is null or length(p_page) = 0 or length(p_page) > 300 or p_cle is null then
    return null;
  end if;
  -- L'administrateur n'est pas compté.
  if v_uid is not null and exists (
    select 1 from public.profils where id = v_uid and role = 'admin'
  ) then
    return null;
  end if;
  insert into public.pages_vues (page, titre, appareil, membre, lecteur, cle)
  values (
    p_page,
    left(coalesce(p_titre, ''), 200),
    case when p_appareil = 'mobile' then 'mobile' else 'ordinateur' end,
    v_uid is not null,
    md5(coalesce(v_uid::text, p_cle::text) || ':' || (now() at time zone 'Europe/Paris')::date::text),
    p_cle
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- ─── Fermeture (ou mise en arrière-plan) de la page ────────────────
-- Appelée plusieurs fois si l'élève change d'onglet : on garde le
-- maximum. La clé tirée au hasard par la page empêche de modifier la
-- ligne d'un autre.
create or replace function public.finir_vue(
  p_id bigint, p_cle uuid, p_duree integer, p_defilement integer
) returns void
language sql volatile security definer set search_path = public
as $$
  update public.pages_vues
     set duree      = greatest(duree, least(greatest(coalesce(p_duree, 0), 0), 3600)),
         defilement = greatest(defilement, least(greatest(coalesce(p_defilement, 0), 0), 100))
   where id = p_id and cle = p_cle and cree > now() - interval '12 hours';
$$;

-- Même chose en texte brut (« id;clé;durée;défilement ») : la page
-- l'envoie avec navigator.sendBeacon quand l'élève la quitte. Une
-- requête en texte brut part sans vérification préalable du
-- navigateur (CORS), contrairement à une requête JSON.
create or replace function public.finir_vue_texte(text)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  v text[] := string_to_array($1, ';');
begin
  if array_length(v, 1) <> 4 or v[1] !~ '^\d{1,18}$' or v[3] !~ '^\d{1,6}$' or v[4] !~ '^\d{1,3}$'
     or v[2] !~ '^[0-9a-f-]{36}$' then
    return;
  end if;
  perform public.finir_vue(v[1]::bigint, v[2]::uuid, v[3]::int, v[4]::int);
end;
$$;

-- ─── Statistiques (administrateur) ─────────────────────────────────
create or replace function public.stats_lecture(p_jours integer default 30)
returns json
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_debut timestamptz;
  v_res json;
begin
  if not exists (
    select 1 from public.profils
    where id = auth.uid() and role = 'admin' and statut = 'actif'
  ) then
    raise exception 'non_autorise';
  end if;

  delete from public.pages_vues where cree < now() - interval '13 months';

  p_jours := least(greatest(coalesce(p_jours, 30), 1), 400);
  v_debut := ((now() at time zone 'Europe/Paris')::date - (p_jours - 1))::timestamp at time zone 'Europe/Paris';

  with v as (
    select *, (cree at time zone 'Europe/Paris') as local
      from public.pages_vues where cree >= v_debut
  )
  select json_build_object(
    'jours', p_jours,
    'debut', v_debut,
    'total', (select count(*) from v),
    'lecteurs', (select count(*) from (select distinct lecteur, local::date from v) x),
    'membres', (select count(*) from v where membre),
    'duree_moy', (select coalesce(round(avg(duree)), 0) from v where duree > 0),
    'jusquau_bout', (select coalesce(round(100.0 * count(*) filter (where defilement >= 90) / nullif(count(*), 0)), 0) from v),
    'mobile', (select count(*) from v where appareil = 'mobile'),
    'aujourdhui', (select count(*) from v where local::date = (now() at time zone 'Europe/Paris')::date),
    'par_jour', (select coalesce(json_agg(j order by j.jour), '[]'::json) from (
        select local::date as jour, count(*) as vues, count(distinct lecteur) as lecteurs
          from v group by 1) j),
    'par_heure', (select coalesce(json_agg(h order by h.heure), '[]'::json) from (
        select extract(hour from local)::int as heure, count(*) as vues
          from v group by 1) h),
    'pages', (select coalesce(json_agg(p order by p.vues desc), '[]'::json) from (
        select page,
               (array_agg(titre order by cree desc))[1] as titre,
               count(*) as vues,
               count(distinct (lecteur, local::date)) as lecteurs,
               coalesce(round(avg(duree) filter (where duree > 0)), 0) as duree_moy,
               coalesce(round(100.0 * count(*) filter (where defilement >= 90) / count(*)), 0) as bout,
               max(cree) as derniere
          from v group by page) p)
  ) into v_res;
  return v_res;
end;
$$;

revoke all on function public.noter_vue(text, text, text, uuid) from public;
revoke all on function public.finir_vue(bigint, uuid, integer, integer) from public;
revoke all on function public.stats_lecture(integer) from public, anon;
grant execute on function public.noter_vue(text, text, text, uuid) to anon, authenticated;
grant execute on function public.finir_vue(bigint, uuid, integer, integer) to anon, authenticated;
revoke all on function public.finir_vue_texte(text) from public;
grant execute on function public.finir_vue_texte(text) to anon, authenticated;
grant execute on function public.stats_lecture(integer) to authenticated;
-- ══════════════════════════════════════════════════════════════════
-- Version 2 (14 novembre 2026) : audience complète
--
-- • Pages publiques mesurées aussi (accueil, tarifs, connexion, 404).
-- • « lecteur » = empreinte d'un identifiant tiré au hasard et gardé
--   dans le navigateur (localStorage ecg_visiteur, 13 mois), jamais
--   l'identifiant du compte : on compte des navigateurs, sans savoir
--   à qui ils appartiennent. Empreinte salée (sel secret ci-dessous).
-- • « visite » = suite de pages sans pause de plus de 30 minutes.
-- • Source de la visite (Google, Instagram, direct…), système,
--   application installée, premier passage du navigateur.
-- • Événements : mur Premium vu, clic sur « payer », inscription,
--   recherche (mots tapés et nombre de résultats).
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.stats_sel (sel text not null);
alter table public.stats_sel enable row level security;
revoke all on public.stats_sel from anon, authenticated;
insert into public.stats_sel (sel)
  select md5(random()::text || clock_timestamp()::text) || md5(random()::text || pg_backend_pid()::text)
  where not exists (select 1 from public.stats_sel);

alter table public.pages_vues add column if not exists visite  text;
alter table public.pages_vues add column if not exists entree  boolean not null default false;
alter table public.pages_vues add column if not exists source  text;
alter table public.pages_vues add column if not exists nouveau boolean not null default false;
alter table public.pages_vues add column if not exists systeme text;
alter table public.pages_vues add column if not exists appli   boolean not null default false;
create index if not exists pages_vues_lecteur on public.pages_vues (lecteur);

create table if not exists public.evenements_site (
  id       bigint generated always as identity primary key,
  type     text not null,
  page     text,
  detail   text,
  nombre   integer,
  lecteur  text,
  membre   boolean not null default false,
  cree     timestamptz not null default now()
);
create index if not exists evenements_site_cree on public.evenements_site (cree);
alter table public.evenements_site enable row level security;
revoke all on public.evenements_site from anon, authenticated;

create or replace function public.stats_empreinte(p text)
returns text language sql stable security definer set search_path = public
as $$ select md5((select sel from public.stats_sel limit 1) || ':' || coalesce(p, '')) $$;
revoke all on function public.stats_empreinte(text) from public, anon, authenticated;

create or replace function public.stats_est_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select auth.uid() is not null and exists (select 1 from public.profils where id = auth.uid() and role = 'admin') $$;
revoke all on function public.stats_est_admin() from public, anon, authenticated;

-- ─── Ouverture d'une page (nouvelle version, paramètres en JSON) ───
create or replace function public.noter_page(p jsonb)
returns bigint
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_id bigint;
  v_cle uuid;
  v_page text := left(coalesce(p->>'page', ''), 300);
  v_vis text := left(coalesce(p->>'visiteur', ''), 64);
begin
  if v_page = '' or v_vis = '' or public.stats_est_admin() then return null; end if;
  begin v_cle := (p->>'cle')::uuid; exception when others then return null; end;
  if v_cle is null then return null; end if;
  insert into public.pages_vues (page, titre, appareil, membre, lecteur, cle, visite, entree, source, nouveau, systeme, appli)
  values (
    v_page,
    left(coalesce(p->>'titre', ''), 200),
    case when p->>'appareil' = 'mobile' then 'mobile' else 'ordinateur' end,
    auth.uid() is not null,
    public.stats_empreinte(v_vis),
    v_cle,
    public.stats_empreinte('visite:' || left(coalesce(p->>'visite', ''), 64)),
    coalesce((p->>'entree')::boolean, false),
    nullif(left(coalesce(p->>'source', ''), 60), ''),
    coalesce((p->>'nouveau')::boolean, false),
    nullif(left(coalesce(p->>'systeme', ''), 20), ''),
    coalesce((p->>'appli')::boolean, false)
  ) returning id into v_id;
  return v_id;
end;
$$;

-- ─── Événement (mur Premium, clic « payer », inscription, recherche) ───
create or replace function public.noter_evenement(p jsonb)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_type text := coalesce(p->>'type', '');
begin
  if v_type not in ('mur_premium', 'clic_payer', 'inscription', 'recherche') then return; end if;
  if public.stats_est_admin() then return; end if;
  insert into public.evenements_site (type, page, detail, nombre, lecteur, membre)
  values (
    v_type,
    nullif(left(coalesce(p->>'page', ''), 300), ''),
    nullif(left(coalesce(p->>'detail', ''), 120), ''),
    case when (p->>'nombre') ~ '^\d{1,7}$' then (p->>'nombre')::int end,
    case when coalesce(p->>'visiteur', '') <> '' then public.stats_empreinte(left(p->>'visiteur', 64)) end,
    auth.uid() is not null
  );
end;
$$;

revoke all on function public.noter_page(jsonb) from public;
revoke all on function public.noter_evenement(jsonb) from public;
grant execute on function public.noter_page(jsonb) to anon, authenticated;
grant execute on function public.noter_evenement(jsonb) to anon, authenticated;

-- ─── Statistiques (administrateur) ─────────────────────────────────
-- p_public : 'tous', 'sans_compte' ou 'membres'.
drop function if exists public.stats_lecture(integer);
create or replace function public.stats_lecture(p_jours integer default 30, p_public text default 'tous')
returns json
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_debut timestamptz;
  v_res json;
begin
  if not exists (
    select 1 from public.profils
    where id = auth.uid() and role = 'admin' and statut = 'actif'
  ) then
    raise exception 'non_autorise';
  end if;

  delete from public.pages_vues where cree < now() - interval '13 months';
  delete from public.evenements_site where cree < now() - interval '13 months';

  p_jours := least(greatest(coalesce(p_jours, 30), 1), 400);
  v_debut := ((now() at time zone 'Europe/Paris')::date - (p_jours - 1))::timestamp at time zone 'Europe/Paris';

  with
  tout as (
    select *, (cree at time zone 'Europe/Paris') as local
      from public.pages_vues where cree >= v_debut
  ),
  v as (
    select * from tout
     where p_public = 'tous'
        or (p_public = 'membres' and membre)
        or (p_public = 'sans_compte' and not membre)
  ),
  ev as (
    select *, (cree at time zone 'Europe/Paris') as local
      from public.evenements_site
     where cree >= v_debut
       and (p_public = 'tous' or (p_public = 'membres' and membre) or (p_public = 'sans_compte' and not membre))
  ),
  visites as (
    select visite, count(*) as pages, bool_or(membre) as membre
      from v where visite is not null group by visite
  )
  select json_build_object(
    'jours', p_jours,
    'public', p_public,
    'debut', v_debut,
    'total', (select count(*) from v),
    'visiteurs', (select count(distinct lecteur) from v),
    'visiteurs_jour', (select count(*) from (select distinct lecteur, local::date from v) x),
    'nouveaux', (select count(distinct lecteur) from v where nouveau),
    'visites', (select count(*) from visites),
    'pages_par_visite', (select coalesce(round(avg(pages), 1), 0) from visites),
    'rebond', (select coalesce(round(100.0 * count(*) filter (where pages = 1) / nullif(count(*), 0)), 0) from visites),
    'duree_moy', (select coalesce(round(avg(duree)), 0) from v where duree > 0),
    'duree_totale', (select coalesce(sum(duree), 0) from v),
    'jusquau_bout', (select coalesce(round(100.0 * count(*) filter (where defilement >= 90) / nullif(count(*), 0)), 0) from v),
    'mobile', (select count(*) from v where appareil = 'mobile'),
    'appli', (select count(distinct lecteur) from v where appli),
    'aujourdhui', (select count(*) from tout where local::date = (now() at time zone 'Europe/Paris')::date),
    'groupes', (select coalesce(json_agg(g), '[]'::json) from (
        select membre,
               count(*) as vues,
               count(distinct lecteur) as visiteurs,
               count(distinct visite) as visites,
               coalesce(round(avg(duree) filter (where duree > 0)), 0) as duree_moy,
               coalesce(round(100.0 * count(*) filter (where appareil = 'mobile') / count(*)), 0) as mobile
          from tout group by membre) g),
    'par_jour', (select coalesce(json_agg(j order by j.jour), '[]'::json) from (
        select local::date as jour, count(*) as vues,
               count(*) filter (where membre) as vues_membres,
               count(*) filter (where not membre) as vues_sans,
               count(distinct lecteur) as visiteurs
          from v group by 1) j),
    'par_heure', (select coalesce(json_agg(h order by h.heure), '[]'::json) from (
        select extract(hour from local)::int as heure, count(*) as vues from v group by 1) h),
    'par_semaine', (select coalesce(json_agg(h order by h.jour), '[]'::json) from (
        select extract(isodow from local)::int as jour, count(*) as vues from v group by 1) h),
    'sources', (select coalesce(json_agg(s order by s.visites desc), '[]'::json) from (
        select coalesce(source, 'Inconnue') as source, count(*) as visites, count(distinct lecteur) as visiteurs
          from v where entree group by 1) s),
    'entrees', (select coalesce(json_agg(s order by s.visites desc), '[]'::json) from (
        select page, (array_agg(titre order by cree desc))[1] as titre, count(*) as visites
          from v where entree group by page order by 3 desc limit 15) s),
    'systemes', (select coalesce(json_agg(s order by s.visiteurs desc), '[]'::json) from (
        select coalesce(systeme, 'Inconnu') as systeme, count(distinct lecteur) as visiteurs
          from v group by 1) s),
    'introuvables', (select coalesce(json_agg(s order by s.vues desc), '[]'::json) from (
        select page, count(*) as vues from v where titre = 'Page introuvable' group by page order by 2 desc limit 20) s),
    'pages', (select coalesce(json_agg(p order by p.vues desc), '[]'::json) from (
        select page,
               (array_agg(titre order by cree desc))[1] as titre,
               count(*) as vues,
               count(distinct lecteur) as visiteurs,
               count(*) filter (where not membre) as sans_compte,
               coalesce(round(avg(duree) filter (where duree > 0)), 0) as duree_moy,
               coalesce(round(100.0 * count(*) filter (where defilement >= 90) / count(*)), 0) as bout
          from v where titre is distinct from 'Page introuvable' group by page) p),
    'premium', json_build_object(
        'murs', (select count(*) from ev where type = 'mur_premium'),
        'murs_visiteurs', (select count(distinct lecteur) from ev where type = 'mur_premium'),
        'murs_sans_compte', (select count(*) from ev where type = 'mur_premium' and not membre),
        'tarifs', (select count(*) from v where page = 'tarifs.html'),
        'tarifs_visiteurs', (select count(distinct lecteur) from v where page = 'tarifs.html'),
        'clics', (select count(*) from ev where type = 'clic_payer'),
        'clics_visiteurs', (select count(distinct lecteur) from ev where type = 'clic_payer'),
        'clics_detail', (select coalesce(json_agg(c), '[]'::json) from (
            select coalesce(detail, '?') as detail, count(*) as n from ev where type = 'clic_payer' group by 1 order by 2 desc) c),
        'connexion', (select count(distinct lecteur) from v where page = 'login.html' and not membre),
        'inscriptions', (select count(*) from ev where type = 'inscription'),
        'pages', (select coalesce(json_agg(m), '[]'::json) from (
            select e.page, (select titre from public.pages_vues pv where pv.page = e.page and pv.titre <> '' order by pv.cree desc limit 1) as titre,
                   count(*) as n, count(distinct e.lecteur) as visiteurs
              from ev e where e.type = 'mur_premium' group by e.page order by 3 desc limit 15) m)
    ),
    'recherches', (select coalesce(json_agg(r), '[]'::json) from (
        select lower(detail) as q, count(*) as n, max(nombre) as resultats
          from ev where type = 'recherche' and detail is not null
         group by lower(detail) order by 2 desc, 1 limit 30) r),
    'recherches_vides', (select coalesce(json_agg(r), '[]'::json) from (
        select lower(detail) as q, count(*) as n
          from ev where type = 'recherche' and detail is not null and nombre = 0
         group by lower(detail) order by 2 desc, 1 limit 20) r),
    'recherches_total', (select count(*) from ev where type = 'recherche')
  ) into v_res;
  return v_res;
end;
$$;
revoke all on function public.stats_lecture(integer, text) from public, anon;
grant execute on function public.stats_lecture(integer, text) to authenticated;
