-- ══════════════════════════════════════════════════════════════════
-- ECG Prépa : statistiques par contenu et par compte, sans nom
-- (version 4, novembre 2026 ; à lancer après statistiques-lecture.sql)
--
-- Choix du propriétaire (option « par compte, sans nom ») :
-- • Une personne = un compte (tous ses appareils réunis) ou, sans
--   compte, un navigateur. Colonne « compte » = empreinte salée de
--   l'identifiant du compte (stats_empreinte('compte:' || id)) : jamais
--   le nom, l'adresse ni l'identifiant en clair. Aucune fonction ne
--   renvoie qui a lu quoi : seulement des totaux et des profils.
-- • Une lecture = une personne × un contenu sur la période : relire ou
--   repasser ne compte pas deux fois.
-- • Seuls les contenus comptent (chapitres, leçons, articles, dossiers,
--   fiches, textes du jour, colles) : index, listes, accueil, tarifs,
--   connexion et flashcards sont écartés (stats_est_contenu).
-- • Les visites enregistrées avant ce script n'ont pas de « compte » :
--   elles restent comptées par navigateur.
--
-- Lecture : stats_contenus(p_jours, p_public), administrateur seulement.
-- Le script se relance sans risque (if not exists / create or replace).
-- ══════════════════════════════════════════════════════════════════

alter table public.pages_vues      add column if not exists compte text;
alter table public.evenements_site add column if not exists compte text;
create index if not exists pages_vues_compte on public.pages_vues (compte);

-- ─── Ouverture d'une page : on ajoute l'empreinte du compte ────────
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
  insert into public.pages_vues (page, titre, appareil, membre, lecteur, cle, visite, entree, source, nouveau, systeme, appli, compte)
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
    coalesce((p->>'appli')::boolean, false),
    case when auth.uid() is not null then public.stats_empreinte('compte:' || auth.uid()::text) end
  ) returning id into v_id;
  return v_id;
end;
$$;

-- ─── Événement : même chose ────────────────────────────────────────
create or replace function public.noter_evenement(p jsonb)
returns void
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_type text := coalesce(p->>'type', '');
begin
  if v_type not in ('mur_premium', 'clic_payer', 'inscription', 'recherche') then return; end if;
  if public.stats_est_admin() then return; end if;
  insert into public.evenements_site (type, page, detail, nombre, lecteur, membre, compte)
  values (
    v_type,
    nullif(left(coalesce(p->>'page', ''), 300), ''),
    nullif(left(coalesce(p->>'detail', ''), 120), ''),
    case when (p->>'nombre') ~ '^\d{1,7}$' then (p->>'nombre')::int end,
    case when coalesce(p->>'visiteur', '') <> '' then public.stats_empreinte(left(p->>'visiteur', 64)) end,
    auth.uid() is not null,
    case when auth.uid() is not null then public.stats_empreinte('compte:' || auth.uid()::text) end
  );
end;
$$;

revoke all on function public.noter_page(jsonb) from public;
revoke all on function public.noter_evenement(jsonb) from public;
grant execute on function public.noter_page(jsonb) to anon, authenticated;
grant execute on function public.noter_evenement(jsonb) to anon, authenticated;

-- ─── Une page est-elle un contenu ? (chemins en minuscules) ────────
create or replace function public.stats_est_contenu(p text)
returns boolean language sql immutable set search_path = public
as $$
  select coalesce(
       lower(p) ~ '^actualites/[^/]+/articles/[^/]+\.html$'
    or lower(p) ~ '^culture-generale/[^/]+\.html$'
    or (lower(p) ~ '^humanite/.+\.html$'
        and lower(p) !~ '/(art|cinema|litterature|musique|cours|cours-humanite|fiches-auteurs|index)\.html$')
    or (lower(p) ~ '^(premiere|deuxieme)_annee/.+\.html$'
        and lower(p) !~ '(^|/)index\.html$'
        and lower(p) !~ '/flashcards/'),
    false)
$$;
revoke all on function public.stats_est_contenu(text) from public, anon, authenticated;

-- ─── Statistiques (administrateur) ─────────────────────────────────
-- p_public : 'tous', 'sans_compte' ou 'membres'.
create or replace function public.stats_contenus(p_jours integer default 30, p_public text default 'tous')
returns json
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_debut  timestamptz;
  v_avant  timestamptz;
  v_res    json;
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
  if p_public not in ('tous', 'sans_compte', 'membres') then p_public := 'tous'; end if;
  v_debut := ((now() at time zone 'Europe/Paris')::date - (p_jours - 1))::timestamp at time zone 'Europe/Paris';
  v_avant := v_debut - make_interval(days => p_jours);

  with
  -- Robots probables écartés (même règle que stats_lecture).
  humains as (
    select lecteur from public.pages_vues
     where cree >= least(v_avant, now() - interval '44 days')
       and (geste or membre or (duree > 0 and cree < timestamptz '2026-11-15 08:30:00+01'))
    union
    select lecteur from public.evenements_site
     where cree >= least(v_avant, now() - interval '44 days') and lecteur is not null
       and type in ('recherche', 'clic_payer', 'inscription')
  ),
  brut as (
    select pv.*, coalesce(pv.compte, pv.lecteur) as personne,
           (pv.cree at time zone 'Europe/Paris') as local,
           public.stats_est_contenu(pv.page) as contenu
      from public.pages_vues pv
     where pv.cree >= least(v_avant, now() - interval '44 days')
       and pv.lecteur in (select lecteur from humains)
       and (p_public = 'tous' or (p_public = 'membres' and pv.membre) or (p_public = 'sans_compte' and not pv.membre))
  ),
  v  as (select * from brut where cree >= v_debut),
  vc as (select * from v where contenu),
  -- Une lecture = une personne × un contenu.
  lect as (
    select personne, page, bool_or(membre) as membre, max(compte) as compte,
           sum(duree) as secondes, max(defilement) >= 90 as bout,
           (array_agg(appareil order by cree))[1] as appareil
      from vc group by personne, page
  ),
  lect_avant as (
    select personne, page, sum(duree) as secondes, max(defilement) >= 90 as bout
      from brut where contenu and cree >= v_avant and cree < v_debut group by personne, page
  ),
  -- Comptes (sans nom) : empreinte de chaque inscrit, Premium ou non.
  inscrits as (
    select public.stats_empreinte('compte:' || p.id::text) as compte,
           exists (select 1 from public.abonnements a where a.utilisateur = p.id
                    and a.statut in ('active', 'trialing', 'past_due', 'offert')) as premium
      from public.profils p
     where p.role <> 'admin'
  ),
  par_compte as (
    select compte, count(*) as contenus, sum(secondes) as secondes,
           (select count(distinct local::date) from vc x where x.compte = l.compte) as jours
      from lect l where compte is not null group by compte
  ),
  pc as (
    select c.*, coalesce(i.premium, false) as premium
      from par_compte c left join inscrits i on i.compte = c.compte
  ),
  top25 as (select compte from par_compte order by contenus desc, secondes desc limit 25),
  paires as (
    select a.page as a, b.page as b, count(*) as n
      from (select distinct compte, page from lect where compte is not null) a
      join (select distinct compte, page from lect where compte is not null) b
        on a.compte = b.compte and a.page < b.page
     group by a.page, b.page
    having count(*) >= 3
     order by count(*) desc
     limit 8
  ),
  ev as (
    select *, coalesce(compte, lecteur) as personne from public.evenements_site
     where cree >= v_debut
       and (lecteur is null or lecteur in (select lecteur from humains))
       and (p_public = 'tous' or (p_public = 'membres' and membre) or (p_public = 'sans_compte' and not membre))
  ),
  titres as (
    select page, (array_agg(titre order by cree desc) filter (where coalesce(titre, '') <> ''))[1] as titre
      from vc group by page
  )
  select json_build_object(
    'jours', p_jours,
    'public', p_public,
    'debut', v_debut,
    'depuis_comptes', (select min(cree) from public.pages_vues where compte is not null),
    'bref', json_build_object(
      'lecteurs', (select count(distinct personne) from lect),
      'lecteurs_membres', (select count(distinct personne) from lect where membre),
      'lectures', (select count(*) from lect),
      'lectures_membres', (select count(*) from lect where membre),
      'secondes', (select coalesce(sum(secondes), 0) from lect),
      'bout', (select coalesce(round(100.0 * count(*) filter (where bout) / nullif(count(*), 0)), 0) from lect),
      'visiteurs_site', (select count(distinct personne) from v)
    ),
    'avant', json_build_object(
      'lecteurs', (select count(distinct personne) from lect_avant),
      'lectures', (select count(*) from lect_avant),
      'secondes', (select coalesce(sum(secondes), 0) from lect_avant),
      'bout', (select coalesce(round(100.0 * count(*) filter (where bout) / nullif(count(*), 0)), 0) from lect_avant)
    ),
    'contenus', (select coalesce(json_agg(c order by c.lecteurs desc, c.secondes_moy desc), '[]'::json) from (
        select l.page, t.titre,
               count(*) as lecteurs,
               count(*) filter (where l.membre) as membres,
               coalesce(round(avg(l.secondes) filter (where l.secondes > 0)), 0) as secondes_moy,
               coalesce(round(100.0 * count(*) filter (where l.bout) / count(*)), 0) as bout
          from lect l left join titres t on t.page = l.page
         group by l.page, t.titre) c),
    'membres', json_build_object(
      'inscrits', (select count(*) from inscrits),
      'inscrits_premium', (select count(*) from inscrits where premium),
      'actifs', (select count(*) from pc),
      'mediane_contenus', (select percentile_cont(0.5) within group (order by contenus) from pc),
      'mediane_secondes', (select percentile_cont(0.5) within group (order by secondes) from pc),
      'reviennent', (select count(*) from pc where jours >= 3),
      'decrochent', (
        select count(*) from (
          select compte from public.pages_vues
           where compte is not null and public.stats_est_contenu(page)
             and cree >= now() - interval '44 days'
           group by compte
          having max(cree) < now() - interval '14 days') d),
      'tranches', json_build_object(
        'zero', greatest((select count(*) from inscrits) - (select count(*) from pc), 0),
        'un_deux', (select count(*) from pc where contenus between 1 and 2),
        'trois_neuf', (select count(*) from pc where contenus between 3 and 9),
        'dix_29', (select count(*) from pc where contenus between 10 and 29),
        'trente', (select count(*) from pc where contenus >= 30)),
      'gratuit', json_build_object(
        'actifs', (select count(*) from pc where not premium),
        'mediane_contenus', (select percentile_cont(0.5) within group (order by contenus) from pc where not premium),
        'mediane_secondes', (select percentile_cont(0.5) within group (order by secondes) from pc where not premium),
        'reviennent', (select count(*) from pc where not premium and jours >= 3)),
      'premium', json_build_object(
        'actifs', (select count(*) from pc where premium),
        'mediane_contenus', (select percentile_cont(0.5) within group (order by contenus) from pc where premium),
        'mediane_secondes', (select percentile_cont(0.5) within group (order by secondes) from pc where premium),
        'reviennent', (select count(*) from pc where premium and jours >= 3))
    ),
    'ensemble', (select coalesce(json_agg(json_build_object(
                   'a', p.a, 'ta', (select titre from titres where page = p.a),
                   'b', p.b, 'tb', (select titre from titres where page = p.b), 'n', p.n) order by p.n desc), '[]'::json)
                   from paires p),
    'actifs_pages', (select coalesce(json_agg(x), '[]'::json) from (
        select page, count(*) as n from lect where compte in (select compte from top25) group by page) x),
    'grille', (select coalesce(json_agg(g), '[]'::json) from (
        select extract(isodow from local)::int as jour, extract(hour from local)::int as heure, count(*) as n
          from vc group by 1, 2) g),
    'appareils', json_build_object(
      'mobile', (select count(*) from lect where appareil = 'mobile'),
      'ordinateur', (select count(*) from lect where appareil <> 'mobile'),
      'bout_mobile', (select coalesce(round(100.0 * count(*) filter (where bout) / nullif(count(*), 0)), 0) from lect where appareil = 'mobile'),
      'bout_ordinateur', (select coalesce(round(100.0 * count(*) filter (where bout) / nullif(count(*), 0)), 0) from lect where appareil <> 'mobile'),
      'appli', (select count(distinct personne) from v where appli)
    ),
    'sources', (select coalesce(json_agg(s order by s.lecteurs desc), '[]'::json) from (
        select coalesce(source, 'Accès direct') as source, count(distinct personne) as lecteurs
          from v where entree group by 1) s),
    'premium', json_build_object(
      'murs', (select count(*) from ev where type = 'mur_premium'),
      'murs_lecteurs', (select count(distinct personne) from ev where type = 'mur_premium'),
      'murs_sans_compte', (select count(distinct personne) from ev where type = 'mur_premium' and not membre),
      'tarifs_lecteurs', (select count(distinct personne) from v where page = 'tarifs.html'),
      'clics_lecteurs', (select count(distinct personne) from ev where type = 'clic_payer'),
      'clics_detail', (select coalesce(json_agg(c), '[]'::json) from (
          select coalesce(detail, '?') as detail, count(*) as n from ev where type = 'clic_payer' group by 1 order by 2 desc) c),
      'inscriptions', (select count(*) from ev where type = 'inscription'),
      'nouveaux_premium', (select count(*) from public.abonnements
                            where cree_le >= v_debut and statut in ('active', 'trialing', 'past_due')),
      'pages', (select coalesce(json_agg(m), '[]'::json) from (
          select e.page, (select titre from public.pages_vues pv where pv.page = e.page and coalesce(pv.titre, '') <> '' order by pv.cree desc limit 1) as titre,
                 count(distinct e.personne) as lecteurs
            from ev e where e.type = 'mur_premium' and e.page is not null group by e.page order by 3 desc limit 10) m)
    ),
    'recherches', (select coalesce(json_agg(r), '[]'::json) from (
        select lower(detail) as q, count(distinct personne) as lecteurs, max(nombre) as resultats
          from ev where type = 'recherche' and detail is not null
         group by 1 order by 2 desc limit 15) r),
    'recherches_vides', (select coalesce(json_agg(r), '[]'::json) from (
        select lower(detail) as q, count(distinct personne) as lecteurs
          from ev where type = 'recherche' and detail is not null and coalesce(nombre, 0) = 0
         group by 1 order by 2 desc limit 15) r),
    'introuvables', (select coalesce(json_agg(s), '[]'::json) from (
        select page, count(distinct personne) as lecteurs
          from v where titre = 'Page introuvable' group by page order by 2 desc limit 15) s)
  ) into v_res;

  return v_res;
end;
$$;

revoke all on function public.stats_contenus(integer, text) from public, anon;
grant execute on function public.stats_contenus(integer, text) to authenticated;
