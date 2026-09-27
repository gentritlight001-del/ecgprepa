-- ══════════════════════════════════════════════════════════════════
--  ECG Prépa — Abonnement Premium (paiement Stripe)
--
--  À lancer UNE fois dans Supabase → SQL Editor, APRÈS le schéma
--  existant (profils, rubriques_verrouillage…). Le script peut être
--  relancé sans risque : il ne détruit rien.
--
--  Principe :
--    - Stripe encaisse, puis prévient la fonction Edge
--      « stripe-webhook », seule autorisée à écrire dans la table
--      « abonnements » (elle utilise la clé service_role, qui passe
--      outre les règles RLS).
--    - Un membre peut LIRE sa propre ligne, jamais la modifier :
--      impossible de s'offrir le Premium depuis la console du
--      navigateur.
--    - Un administrateur marque une rubrique « premium » depuis
--      l'admin ou directement depuis sa carte.
-- ══════════════════════════════════════════════════════════════════


-- ─── 1. Rubriques : nouvelle colonne « premium » ─────────────────
-- Indépendante de « verrouille » : une rubrique verrouillée est
-- fermée à TOUT LE MONDE (sauf admin) ; une rubrique premium est
-- ouverte aux seuls abonnés (et aux admins).
alter table public.rubriques_verrouillage
  add column if not exists premium boolean not null default false;

-- La colonne « verrouille » doit accepter une ligne créée seulement
-- pour marquer le premium (sans toucher au verrouillage).
alter table public.rubriques_verrouillage
  alter column verrouille set default false;


-- ─── 2. Abonnements ──────────────────────────────────────────────
create table if not exists public.abonnements (
  utilisateur        uuid primary key references auth.users(id) on delete cascade,
  stripe_client      text unique,          -- cus_…
  stripe_abonnement  text unique,          -- sub_…
  -- Statut tel que donné par Stripe : active, trialing, past_due,
  -- canceled, unpaid, incomplete, incomplete_expired, paused
  -- (ou « aucun » tant qu'aucun paiement n'a abouti).
  statut             text not null default 'aucun',
  offre              text,                 -- 'mensuel' | 'annuel'
  fin_periode        timestamptz,          -- fin de la période payée
  annulation_prevue  boolean not null default false, -- résilié, actif jusqu'à fin_periode
  -- Preuve de la renonciation expresse au droit de rétractation
  -- (art. L221-28 13° du Code de la consommation), horodatée au
  -- moment où le membre a coché la case avant de payer.
  renonciation_retractation_le timestamptz,
  cree_le            timestamptz not null default now(),
  maj_le             timestamptz not null default now()
);

alter table public.abonnements enable row level security;

-- Administrateur ? (security definer : ne dépend pas des règles RLS
-- de la table profils)
create or replace function public.premium_est_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profils
    where id = auth.uid() and role = 'admin' and statut = 'actif'
  );
$$;

drop policy if exists "abonnements: lecture de sa ligne" on public.abonnements;
create policy "abonnements: lecture de sa ligne"
  on public.abonnements for select to authenticated
  using (utilisateur = auth.uid() or public.premium_est_admin());

-- Aucune politique insert / update / delete : seule la clé
-- service_role (fonctions Edge) peut écrire.


-- ─── 3. Journal des événements Stripe (anti-doublon) ─────────────
-- Stripe peut envoyer deux fois le même événement : on note ceux
-- déjà traités pour ne jamais les appliquer deux fois.
create table if not exists public.stripe_evenements (
  id       text primary key,   -- evt_…
  type     text not null,
  recu_le  timestamptz not null default now()
);
alter table public.stripe_evenements enable row level security;
-- Aucune politique : invisible depuis le navigateur.


-- ─── 4. « Suis-je Premium ? » ────────────────────────────────────
-- Seule source de vérité pour le site. « past_due » reste ouvert
-- pendant que Stripe retente le prélèvement (quelques jours) ; au
-- bout des relances, Stripe passe l'abonnement en canceled/unpaid
-- et l'accès se ferme tout seul.
create or replace function public.mon_abonnement()
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'premium', coalesce(bool_or(
        a.statut in ('active', 'trialing', 'past_due')
        and (a.fin_periode is null or a.fin_periode > now() - interval '3 days')
      ), false),
    'statut',            max(a.statut),
    'offre',             max(a.offre),
    'fin_periode',       max(a.fin_periode),
    'annulation_prevue', coalesce(bool_or(a.annulation_prevue), false),
    'client_stripe',     bool_or(a.stripe_client is not null)
  )
  from public.abonnements a
  where a.utilisateur = auth.uid();
$$;

revoke all on function public.mon_abonnement() from public, anon;
grant execute on function public.mon_abonnement() to authenticated;


-- ─── 5. Vue administrateur : tous les abonnés ────────────────────
create or replace function public.abonnes_premium()
returns table (
  utilisateur uuid, email text, prenom text, nom text,
  statut text, offre text, fin_periode timestamptz,
  annulation_prevue boolean, cree_le timestamptz
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.premium_est_admin() then
    raise exception 'non_autorise';
  end if;
  return query
    select a.utilisateur, p.email, p.prenom, p.nom,
           a.statut, a.offre, a.fin_periode, a.annulation_prevue, a.cree_le
    from public.abonnements a
    left join public.profils p on p.id = a.utilisateur
    where a.statut <> 'aucun'
    order by a.cree_le desc;
end;
$$;

revoke all on function public.abonnes_premium() from public, anon;
grant execute on function public.abonnes_premium() to authenticated;
