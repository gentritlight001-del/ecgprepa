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
