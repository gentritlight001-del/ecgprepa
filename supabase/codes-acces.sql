-- ══════════════════════════════════════════════════════════════════
--  ECG Prépa : plusieurs codes d'accès au Premium (novembre 2026)
--
--  Remplace le code unique de premium.sql (table code_acces, gardée
--  telle quelle mais plus lue). Chaque code a un nom libre (« Lycée
--  Hoche », « Instagram »…), peut être coupé, limité à un nombre de
--  personnes ou supprimé. Chaque utilisation est notée : la page admin
--  montre combien de personnes ont utilisé chaque code, et lesquelles.
--  Supprimer ou couper un code n'enlève rien à ceux qui l'ont utilisé.
--
--  Déjà appliqué sur la base (migration « codes_acces_multiples »).
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.codes_acces (
  id       bigserial primary key,
  code     text not null check (length(btrim(code)) >= 6),
  libelle  text,
  actif    boolean not null default true,
  limite   int check (limite is null or limite > 0),   -- null = sans limite
  cree_le  timestamptz not null default now(),
  maj_le   timestamptz not null default now()
);
create unique index if not exists codes_acces_code_unique on public.codes_acces (lower(btrim(code)));
alter table public.codes_acces enable row level security;   -- aucune politique : fonctions seulement

create table if not exists public.codes_acces_utilisations (
  id           bigserial primary key,
  code_id      bigint not null references public.codes_acces(id) on delete cascade,
  utilisateur  uuid not null references auth.users(id) on delete cascade,
  t            timestamptz not null default now(),
  unique (code_id, utilisateur)
);
alter table public.codes_acces_utilisations enable row level security;

-- Le code qui a ouvert l'accès offert (null = offert directement par l'admin).
alter table public.abonnements
  add column if not exists code_acces bigint references public.codes_acces(id) on delete set null;

-- Reprise de l'ancien code unique (aucune utilisation passée n'est connue).
insert into public.codes_acces (code, libelle, actif, cree_le, maj_le)
select btrim(c.code), 'Code d''origine', c.actif, c.maj_le, now()
  from public.code_acces c
 where c.id = 1 and coalesce(btrim(c.code), '') <> ''
   and not exists (select 1 from public.codes_acces x where lower(btrim(x.code)) = lower(btrim(c.code)));


-- ─── Le membre saisit un code ────────────────────────────────────
-- { ok: true } ou { ok: false, raison } ; raison : connexion |
-- trop_de_tentatives | mauvais_code | code_desactive | code_epuise | deja_abonne
create or replace function public.utiliser_code_acces(p_code text)
returns json
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_code  public.codes_acces%rowtype;
  v_ligne public.abonnements%rowtype;
begin
  if v_uid is null or not exists (
    select 1 from public.profils where id = v_uid and statut = 'actif'
  ) then
    return json_build_object('ok', false, 'raison', 'connexion');
  end if;

  -- 5 essais par heure et par membre.
  if (select count(*) from public.code_acces_tentatives
      where utilisateur = v_uid and t > now() - interval '1 hour') >= 5 then
    return json_build_object('ok', false, 'raison', 'trop_de_tentatives');
  end if;
  insert into public.code_acces_tentatives (utilisateur) values (v_uid);

  select * into v_code from public.codes_acces
   where lower(btrim(code)) = lower(btrim(coalesce(p_code, '')));
  if not found then
    return json_build_object('ok', false, 'raison', 'mauvais_code');
  end if;
  if not v_code.actif then
    return json_build_object('ok', false, 'raison', 'code_desactive');
  end if;
  if v_code.limite is not null and (
       select count(*) from public.codes_acces_utilisations
        where code_id = v_code.id and utilisateur <> v_uid) >= v_code.limite then
    return json_build_object('ok', false, 'raison', 'code_epuise');
  end if;

  -- Un abonné payant garde son abonnement Stripe tel quel.
  select * into v_ligne from public.abonnements where utilisateur = v_uid;
  if found and v_ligne.statut in ('active', 'trialing', 'past_due') then
    return json_build_object('ok', false, 'raison', 'deja_abonne');
  end if;

  insert into public.abonnements (utilisateur, statut, offre, fin_periode, annulation_prevue, code_acces, maj_le)
  values (v_uid, 'offert', 'offert', null, false, v_code.id, now())
  on conflict (utilisateur) do update
    set statut = 'offert', offre = 'offert', fin_periode = null,
        annulation_prevue = false, code_acces = v_code.id, maj_le = now();

  insert into public.codes_acces_utilisations (code_id, utilisateur)
  values (v_code.id, v_uid)
  on conflict (code_id, utilisateur) do nothing;

  delete from public.code_acces_tentatives where utilisateur = v_uid;
  return json_build_object('ok', true);
end;
$$;


-- ─── Admin : la liste des codes et leurs chiffres ────────────────
create or replace function public.codes_acces_admin()
returns json
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.premium_est_admin() then raise exception 'non_autorise'; end if;
  return coalesce((
    select json_agg(x order by x.cree_le desc)
    from (
      select c.id, c.code, c.libelle, c.actif, c.limite, c.cree_le,
             (select count(*) from public.codes_acces_utilisations u where u.code_id = c.id) as utilisations,
             (select count(*) from public.abonnements a where a.code_acces = c.id and a.statut = 'offert') as en_cours,
             (select max(u.t) from public.codes_acces_utilisations u where u.code_id = c.id) as derniere,
             coalesce((
               select json_agg(json_build_object(
                        'email', p.email, 'prenom', p.prenom, 'nom', p.nom, 't', u.t,
                        'actif', coalesce(a.statut = 'offert' and a.code_acces = c.id, false))
                      order by u.t desc)
                 from public.codes_acces_utilisations u
                 left join public.profils p on p.id = u.utilisateur
                 left join public.abonnements a on a.utilisateur = u.utilisateur
                where u.code_id = c.id
             ), '[]'::json) as membres
        from public.codes_acces c
    ) x
  ), '[]'::json);
end;
$$;

-- Admin : créer un code. { ok } ou { ok: false, raison: trop_court | doublon }
create or replace function public.creer_code_acces(p_code text, p_libelle text, p_limite int)
returns json
language plpgsql volatile security definer set search_path = public
as $$
declare v_id bigint;
begin
  if not public.premium_est_admin() then raise exception 'non_autorise'; end if;
  if length(btrim(coalesce(p_code, ''))) < 6 then
    return json_build_object('ok', false, 'raison', 'trop_court');
  end if;
  if exists (select 1 from public.codes_acces where lower(btrim(code)) = lower(btrim(p_code))) then
    return json_build_object('ok', false, 'raison', 'doublon');
  end if;
  insert into public.codes_acces (code, libelle, limite)
  values (btrim(p_code), nullif(btrim(coalesce(p_libelle, '')), ''),
          case when p_limite is null or p_limite <= 0 then null else p_limite end)
  returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end;
$$;

-- Admin : activer ou couper un code, changer son nom ou sa limite.
-- Un paramètre null garde la valeur actuelle ; p_limite = 0 retire la limite.
create or replace function public.modifier_code_acces(p_id bigint, p_actif boolean, p_libelle text, p_limite int)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.premium_est_admin() then raise exception 'non_autorise'; end if;
  update public.codes_acces
     set actif   = coalesce(p_actif, actif),
         libelle = case when p_libelle is null then libelle else nullif(btrim(p_libelle), '') end,
         limite  = case when p_limite is null then limite when p_limite <= 0 then null else p_limite end,
         maj_le  = now()
   where id = p_id;
end;
$$;

-- Admin : supprimer un code (les accès déjà ouverts restent).
create or replace function public.supprimer_code_acces(p_id bigint)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.premium_est_admin() then raise exception 'non_autorise'; end if;
  delete from public.codes_acces where id = p_id;
end;
$$;

-- Offrir directement : l'accès n'est plus rattaché à un code.
create or replace function public.offrir_acces_premium(p_utilisateur uuid)
returns json
language plpgsql volatile security definer set search_path = public
as $$
declare v_ligne public.abonnements%rowtype;
begin
  if not public.premium_est_admin() then raise exception 'non_autorise'; end if;
  select * into v_ligne from public.abonnements where utilisateur = p_utilisateur;
  if found and v_ligne.statut in ('active', 'trialing', 'past_due') then
    return json_build_object('ok', false, 'raison', 'deja_abonne');
  end if;
  insert into public.abonnements (utilisateur, statut, offre, fin_periode, annulation_prevue, code_acces, maj_le)
  values (p_utilisateur, 'offert', 'offert', null, false, null, now())
  on conflict (utilisateur) do update
    set statut = 'offert', offre = 'offert', fin_periode = null,
        annulation_prevue = false, code_acces = null, maj_le = now();
  return json_build_object('ok', true);
end;
$$;

-- Liste des abonnés : + le code utilisé.
drop function if exists public.abonnes_premium();
create function public.abonnes_premium()
returns table(utilisateur uuid, email text, prenom text, nom text, statut text, offre text,
              fin_periode timestamptz, annulation_prevue boolean, cree_le timestamptz, code text)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.premium_est_admin() then raise exception 'non_autorise'; end if;
  return query
    select a.utilisateur, p.email, p.prenom, p.nom,
           a.statut, a.offre, a.fin_periode, a.annulation_prevue, a.cree_le,
           coalesce(c.libelle, c.code)
      from public.abonnements a
      left join public.profils p on p.id = a.utilisateur
      left join public.codes_acces c on c.id = a.code_acces
     where a.statut <> 'aucun'
     order by a.cree_le desc;
end;
$$;

-- L'ancien réglage à code unique n'a plus d'usage.
drop function if exists public.etat_code_acces();
drop function if exists public.definir_code_acces(text, boolean);

revoke all on function public.utiliser_code_acces(text) from public, anon;
revoke all on function public.codes_acces_admin() from public, anon;
revoke all on function public.creer_code_acces(text, text, int) from public, anon;
revoke all on function public.modifier_code_acces(bigint, boolean, text, int) from public, anon;
revoke all on function public.supprimer_code_acces(bigint) from public, anon;
revoke all on function public.offrir_acces_premium(uuid) from public, anon;
revoke all on function public.abonnes_premium() from public, anon;
grant execute on function public.utiliser_code_acces(text) to authenticated;
grant execute on function public.codes_acces_admin() to authenticated;
grant execute on function public.creer_code_acces(text, text, int) to authenticated;
grant execute on function public.modifier_code_acces(bigint, boolean, text, int) to authenticated;
grant execute on function public.supprimer_code_acces(bigint) to authenticated;
grant execute on function public.offrir_acces_premium(uuid) to authenticated;
grant execute on function public.abonnes_premium() to authenticated;
