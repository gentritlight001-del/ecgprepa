-- ══════════════════════════════════════════════════════════════════
-- ECG Prépa : 3 contenus Premium au choix par mois pour les comptes
-- gratuits (choix du propriétaire, novembre 2026)
--
-- • Chaque compte reçoit 3 déblocages le 1er de chaque mois (heure de
--   Paris), à partir du mois de son inscription, et au plus tôt en
--   novembre 2026 (lancement).
-- • Les déblocages non utilisés s'ajoutent au mois suivant, sans plafond.
-- • Un contenu débloqué reste ouvert pour ce compte, pour toujours.
-- • Table « deblocages » invisible depuis le navigateur : on n'y accède
--   que par mes_deblocages() (son propre compte) et debloquer(page).
-- Le script se relance sans risque.
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.deblocages (
  utilisateur uuid not null references public.profils(id) on delete cascade,
  page        text not null,
  cree        timestamptz not null default now(),
  primary key (utilisateur, page)
);
alter table public.deblocages enable row level security;
revoke all on public.deblocages from anon, authenticated;

-- ─── État des déblocages d'un compte (usage interne) ───────────────
create or replace function public.deblocages_etat(p_uid uuid)
returns json
language plpgsql stable security definer set search_path = public
as $$
declare
  v_mensuel   constant integer := 3;
  v_lancement constant date := date '2026-11-01';
  v_crea      timestamptz;
  v_mois      date := date_trunc('month', now() at time zone 'Europe/Paris')::date;
  v_debut     date;
  v_nb_mois   integer;
  v_utilises  integer;
  v_avant     integer;
  v_dispo     integer;
  v_reportes  integer;
begin
  select cree_le into v_crea from public.profils where id = p_uid;
  v_debut := greatest(date_trunc('month', coalesce(v_crea, now()) at time zone 'Europe/Paris')::date, v_lancement);
  if v_debut > v_mois then v_debut := v_mois; end if;
  v_nb_mois := (extract(year from age(v_mois, v_debut)) * 12 + extract(month from age(v_mois, v_debut)))::int + 1;
  select count(*) into v_utilises from public.deblocages where utilisateur = p_uid;
  select count(*) into v_avant from public.deblocages
   where utilisateur = p_uid and (cree at time zone 'Europe/Paris')::date < v_mois;
  v_dispo := greatest(v_mensuel * v_nb_mois - v_utilises, 0);
  v_reportes := least(greatest(v_mensuel * (v_nb_mois - 1) - v_avant, 0), v_dispo);
  return json_build_object(
    'disponibles', v_dispo,
    'reportes', v_reportes,
    'mensuel', v_mensuel,
    'mois', to_char(v_mois, 'YYYY-MM'),
    'utilises', v_utilises,
    'pages', (select coalesce(json_agg(page order by cree desc), '[]'::json)
                from public.deblocages where utilisateur = p_uid)
  );
end;
$$;
revoke all on function public.deblocages_etat(uuid) from public, anon, authenticated;

-- ─── Mes déblocages (membre connecté) ──────────────────────────────
create or replace function public.mes_deblocages()
returns json
language plpgsql stable security definer set search_path = public
as $$
begin
  if auth.uid() is null then return null; end if;
  return public.deblocages_etat(auth.uid());
end;
$$;

-- ─── Débloquer un contenu ──────────────────────────────────────────
create or replace function public.debloquer(p_page text)
returns json
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_page text := lower(left(coalesce(p_page, ''), 300));
  v_etat json;
begin
  if v_uid is null then return json_build_object('ok', false, 'raison', 'anonyme'); end if;
  if v_page = '' or v_page !~ '\.html$' then return json_build_object('ok', false, 'raison', 'page'); end if;
  if not exists (select 1 from public.profils where id = v_uid and statut = 'actif') then
    return json_build_object('ok', false, 'raison', 'compte');
  end if;
  -- Un seul déblocage à la fois par compte (deux onglets, double clic).
  perform pg_advisory_xact_lock(hashtext('deblocage:' || v_uid::text));
  if exists (select 1 from public.deblocages where utilisateur = v_uid and page = v_page) then
    return json_build_object('ok', true, 'deja', true, 'etat', public.deblocages_etat(v_uid));
  end if;
  v_etat := public.deblocages_etat(v_uid);
  if (v_etat->>'disponibles')::int <= 0 then
    return json_build_object('ok', false, 'raison', 'epuise', 'etat', v_etat);
  end if;
  insert into public.deblocages (utilisateur, page) values (v_uid, v_page);
  return json_build_object('ok', true, 'etat', public.deblocages_etat(v_uid));
end;
$$;

revoke all on function public.mes_deblocages() from public, anon;
revoke all on function public.debloquer(text) from public, anon;
grant execute on function public.mes_deblocages() to authenticated;
grant execute on function public.debloquer(text) to authenticated;
