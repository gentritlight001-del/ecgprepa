-- ══════════════════════════════════════════════════════════════════
-- ECG Prépa : statistiques, version 4 (novembre 2026)
--
-- Refonte de l'onglet « Statistiques » de l'admin (maquette validée
-- par le propriétaire le 21 novembre 2026). L'ancien chiffre « pages
-- vues » comptait chaque chargement de page (accueil, menus, connexion,
-- retour en arrière…) : 85 % de pages de passage, 58 % de moins de 5 s.
-- Il ne reste que trois mots, chacun expliqué dans l'onglet :
--   • visiteur = une personne : un compte (tous ses appareils) ou, sans
--     compte, un navigateur ; robots écartés ;
--   • lecture  = une personne × un contenu (cours, article, fiche…)
--     lu au moins 10 secondes de lecture active sur la période ; relire
--     ne compte pas deux fois ; index, listes, accueil ne comptent pas ;
--   • temps de lecture = la somme du temps actif de ces lectures.
-- Une seule fonction, stats_site(jours, public), lue par l'onglet
-- (lecture-admin.js) et par la vue d'ensemble (admin.html).
-- Comme avant : seulement des totaux, jamais qui a lu quoi.
--
-- Tables et fonctions de mesure : statistiques-lecture.sql et
-- statistiques-comptes.sql (inchangées).
-- Appliqué sur Supabase le 21 novembre 2026.
-- ══════════════════════════════════════════════════════════════════

create or replace function public.stats_site(p_jours integer default 7, p_public text default 'tous')
returns json
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_debut  timestamptz;
  v_avant  timestamptz;
  v_seuil  constant integer := 10;   -- secondes de lecture active pour une lecture
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

  p_jours := least(greatest(coalesce(p_jours, 7), 1), 400);
  if p_public not in ('tous', 'sans_compte', 'membres') then p_public := 'tous'; end if;
  v_debut := ((now() at time zone 'Europe/Paris')::date - (p_jours - 1))::timestamp at time zone 'Europe/Paris';
  v_avant := v_debut - make_interval(days => p_jours);

  with
  -- Robots probables écartés : un navigateur compte s'il a fait au moins un
  -- geste (défilement, toucher, clic, souris, clavier), était connecté, ou a
  -- cherché, cliqué sur « payer » ou créé un compte.
  humains as (
    select lecteur from public.pages_vues
     where cree >= v_avant
       and (geste or membre or (duree > 0 and cree < timestamptz '2026-11-15 08:30:00+01'))
    union
    select lecteur from public.evenements_site
     where cree >= v_avant and lecteur is not null and type in ('recherche', 'clic_payer', 'inscription')
  ),
  tout as (
    select pv.*, (pv.cree at time zone 'Europe/Paris') as local
      from public.pages_vues pv
     where pv.cree >= v_debut
       and (p_public = 'tous' or (p_public = 'membres' and pv.membre) or (p_public = 'sans_compte' and not pv.membre))
  ),
  brut as (
    select pv.*, coalesce(pv.compte, pv.lecteur) as personne,
           (pv.cree at time zone 'Europe/Paris') as local,
           public.stats_est_contenu(pv.page) as contenu
      from public.pages_vues pv
     where pv.cree >= v_avant
       and pv.lecteur in (select lecteur from humains)
       and (p_public = 'tous' or (p_public = 'membres' and pv.membre) or (p_public = 'sans_compte' and not pv.membre))
  ),
  v  as (select * from brut where cree >= v_debut),
  -- Une lecture = une personne × un contenu, au moins v_seuil secondes.
  lect as (
    select personne, page, bool_or(membre) as membre, max(compte) as compte,
           sum(duree) as secondes, max(defilement) >= 90 as bout,
           min(local) as premier,
           (array_agg(appareil order by cree))[1] as appareil
      from v where contenu group by personne, page
    having sum(duree) >= v_seuil
  ),
  lect_avant as (
    select personne, page, sum(duree) as secondes, max(defilement) >= 90 as bout
      from brut where contenu and cree < v_debut group by personne, page
    having sum(duree) >= v_seuil
  ),
  v_avant_p as (select * from brut where cree < v_debut),
  titres as (
    select page, (array_agg(titre order by cree desc) filter (where coalesce(titre, '') <> ''))[1] as titre
      from brut group by page
  ),
  jours as (
    select local::date as jour,
           count(distinct personne) as visiteurs,
           count(distinct personne) filter (where membre) as visiteurs_membres,
           count(distinct personne) filter (where not membre) as visiteurs_sans
      from v group by 1
  ),
  jours_l as (
    select premier::date as jour, count(*) as lectures,
           count(*) filter (where membre) as lectures_membres,
           count(*) filter (where not membre) as lectures_sans
      from lect group by 1
  ),
  ev as (
    select *, coalesce(compte, lecteur) as personne from public.evenements_site
     where cree >= v_debut
       and lecteur in (select lecteur from humains)
       and (p_public = 'tous' or (p_public = 'membres' and membre) or (p_public = 'sans_compte' and not membre))
  ),
  -- Première page d'une visite venue de l'extérieur. « Lien du site » (un
  -- onglet resté ouvert) n'est pas une arrivée.
  arrivees as (
    select personne,
           case
             when coalesce(source, '') in ('', 'Accès direct', 'Inconnue') then 'Adresse tapée ou favori'
             when source ~* '(chatgpt|openai|perplexity|claude|copilot|gemini|mistral)' or source = 'Assistant IA' then 'ChatGPT et assistants IA'
             when source = 'Autre moteur' then 'Autres moteurs'
             else source
           end as source
      from v where entree and coalesce(source, '') <> 'Lien du site'
  )
  select json_build_object(
    'jours', p_jours,
    'public', p_public,
    'debut', v_debut,
    'seuil', v_seuil,
    'mesure_depuis', (select min(cree) from public.pages_vues),
    'bref', json_build_object(
      'visiteurs', (select count(distinct personne) from v),
      'visiteurs_membres', (select count(distinct personne) from v where membre),
      'nouveaux', (select count(distinct lecteur) from v where nouveau and not membre),
      'lectures', (select count(*) from lect),
      'lecteurs', (select count(distinct personne) from lect),
      'secondes', (select coalesce(sum(secondes), 0) from lect),
      'mediane', (select coalesce(percentile_cont(0.5) within group (order by secondes), 0) from lect),
      'bout', (select count(*) filter (where bout) from lect),
      'reviennent', (select count(*) from (select personne from v group by personne having count(distinct local::date) >= 2) r),
      'mobile', (select count(distinct personne) from v where appareil = 'mobile')
    ),
    'avant', json_build_object(
      'visiteurs', (select count(distinct personne) from v_avant_p),
      'lectures', (select count(*) from lect_avant),
      'secondes', (select coalesce(sum(secondes), 0) from lect_avant),
      'bout', (select count(*) filter (where bout) from lect_avant)
    ),
    'par_jour', (select coalesce(json_agg(json_build_object(
        'jour', j.jour, 'visiteurs', j.visiteurs, 'visiteurs_membres', j.visiteurs_membres, 'visiteurs_sans', j.visiteurs_sans,
        'lectures', coalesce(l.lectures, 0), 'lectures_membres', coalesce(l.lectures_membres, 0), 'lectures_sans', coalesce(l.lectures_sans, 0)
      ) order by j.jour), '[]'::json) from jours j left join jours_l l on l.jour = j.jour),
    'contenus', (select coalesce(json_agg(c order by c.lecteurs desc, c.secondes_moy desc), '[]'::json) from (
        select l.page, t.titre,
               count(*) as lecteurs,
               count(*) filter (where l.membre) as membres,
               round(avg(l.secondes)) as secondes_moy,
               round(100.0 * count(*) filter (where l.bout) / count(*)) as bout
          from lect l left join titres t on t.page = l.page
         group by l.page, t.titre) c),
    'membres', json_build_object(
      'inscrits', (select count(*) from public.profils where role <> 'admin'),
      'nouveaux', (select count(*) from public.profils where role <> 'admin' and cree_le >= v_debut),
      'venus', (select count(distinct compte) from v where membre and compte is not null),
      'lecteurs', (select count(distinct compte) from lect where membre and compte is not null)
    ),
    'sources', (select coalesce(json_agg(s order by s.personnes desc), '[]'::json) from (
        select source, count(distinct personne) as personnes from arrivees group by 1) s),
    'entonnoir', json_build_object(
      'ouvertes', (select count(*) from tout),
      'humaines', (select count(*) from v),
      'contenus', (select count(*) from v where contenu),
      'lectures', (select count(*) from lect),
      'passage', (select coalesce(json_agg(p order by p.n desc), '[]'::json) from (
          select case when page in ('index.html', 'accueil.html') then 'accueil'
                      when page = 'cours-ecg.html' then 'cours'
                      when page = 'login.html' then 'connexion'
                      when page ~ '(^|/)index\.html$' or page ~ '^[^/]+\.html$' then 'menus'
                      else 'autres' end as quoi,
                 count(*) as n
            from v where not contenu group by 1) p)
    ),
    'premium', json_build_object(
      'bloques', (select count(distinct personne) from ev where type = 'mur_premium'),
      'tarifs', (select count(distinct personne) from v where page = 'tarifs.html'),
      'clics', (select count(distinct personne) from ev where type = 'clic_payer'),
      'inscriptions', (select count(*) from ev where type = 'inscription'),
      'pages', (select coalesce(json_agg(m), '[]'::json) from (
          select e.page, (select titre from titres t where t.page = e.page) as titre,
                 count(distinct e.personne) as personnes
            from ev e where e.type = 'mur_premium' and e.page is not null
           group by e.page order by 3 desc limit 10) m)
    ),
    'recherches', (select coalesce(json_agg(r), '[]'::json) from (
        select lower(detail) as q, count(distinct personne) as personnes, max(nombre) as resultats
          from ev where type = 'recherche' and detail is not null
         group by 1 order by 2 desc, 1 limit 15) r),
    'recherches_vides', (select coalesce(json_agg(r), '[]'::json) from (
        select lower(detail) as q, count(distinct personne) as personnes
          from ev where type = 'recherche' and detail is not null and coalesce(nombre, 0) = 0
         group by 1 order by 2 desc, 1 limit 15) r),
    'introuvables', (select coalesce(json_agg(s), '[]'::json) from (
        select page, count(distinct personne) as personnes
          from v where titre = 'Page introuvable' group by page order by 2 desc limit 15) s)
  ) into v_res;

  return v_res;
end;
$$;

revoke all on function public.stats_site(integer, text) from public, anon;
grant execute on function public.stats_site(integer, text) to authenticated;
