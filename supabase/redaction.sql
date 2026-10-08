-- ═══════════════════════════════════════════════════════════════════
--  ECG Prépa — Espace rédaction (rôle « Rédacteur »)
--
--  Circuit d'un sujet :
--    disponible → en_cours (pris par un rédacteur) → soumis
--      → a_revoir (renvoyé par l'admin, retour en écriture)
--      → valide → publie
--
--  · L'administrateur crée les sujets (article ou culture générale),
--    les relit, les renvoie, les valide.
--  · Un rédacteur voit les sujets disponibles et les siens, et ne peut
--    agir que par les fonctions redaction_* ci-dessous (prendre,
--    enregistrer, soumettre, abandonner) : il ne peut ni toucher aux
--    sujets des autres, ni changer un statut à sa guise.
--  · Les images des sujets sont rangées dans le bucket public
--    « redaction » ; seul l'administrateur peut y déposer.
--
--  À lancer une fois dans Supabase → SQL Editor. Le script peut être
--  relancé sans risque.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Le rôle « redacteur » est accepté dans profils.role
--    (on remplace l'éventuelle contrainte qui n'autorisait que membre/admin).
do $$
declare c record;
begin
  for c in
    select con.conname
      from pg_constraint con
      join pg_class rel on rel.oid = con.conrelid
      join pg_namespace ns on ns.oid = rel.relnamespace
     where ns.nspname = 'public' and rel.relname = 'profils'
       and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%role%'
  loop
    execute format('alter table public.profils drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.profils
  add constraint profils_role_check check (role in ('membre', 'admin', 'redacteur')) not valid;

-- 2. Qui est qui (security definer : indépendant des règles RLS de profils)
create or replace function public.redaction_est_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profils
                  where id = auth.uid() and role = 'admin' and statut = 'actif');
$$;

create or replace function public.redaction_est_redacteur()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profils
                  where id = auth.uid() and role in ('admin', 'redacteur') and statut = 'actif');
$$;

-- 3. La table des sujets
create table if not exists public.redaction_sujets (
  id            uuid primary key default gen_random_uuid(),
  type          text not null default 'article' check (type in ('article', 'cg')),
  edition       text check (edition in ('monde', 'en', 'es', 'de')),
  titre         text not null,
  consignes     text not null default '',
  image_url     text,
  statut        text not null default 'disponible'
                check (statut in ('disponible', 'en_cours', 'soumis', 'a_revoir', 'valide', 'publie')),
  redacteur     uuid references public.profils(id) on delete set null,
  redacteur_nom text,
  contenu       text,
  commentaire   text,
  cree_le       timestamptz not null default now(),
  pris_le       timestamptz,
  soumis_le     timestamptz,
  valide_le     timestamptz,
  maj_le        timestamptz not null default now()
);

create index if not exists redaction_sujets_statut on public.redaction_sujets (statut);
create index if not exists redaction_sujets_redacteur on public.redaction_sujets (redacteur);

alter table public.redaction_sujets enable row level security;

drop policy if exists "redaction: lecture"     on public.redaction_sujets;
drop policy if exists "redaction: ajout admin" on public.redaction_sujets;
drop policy if exists "redaction: maj admin"   on public.redaction_sujets;
drop policy if exists "redaction: suppr admin" on public.redaction_sujets;

-- Admin : tout. Rédacteur : les sujets libres et les siens.
create policy "redaction: lecture" on public.redaction_sujets
  for select to authenticated
  using (public.redaction_est_admin()
         or (public.redaction_est_redacteur() and (statut = 'disponible' or redacteur = auth.uid())));

create policy "redaction: ajout admin" on public.redaction_sujets
  for insert to authenticated with check (public.redaction_est_admin());

create policy "redaction: maj admin" on public.redaction_sujets
  for update to authenticated
  using (public.redaction_est_admin()) with check (public.redaction_est_admin());

create policy "redaction: suppr admin" on public.redaction_sujets
  for delete to authenticated using (public.redaction_est_admin());

-- 4. Les actions du rédacteur
-- Prendre un sujet : atomique, un seul rédacteur peut l'obtenir.
create or replace function public.redaction_prendre(p_id uuid)
returns json
language plpgsql security definer set search_path = public
as $$
declare n text; ok uuid;
begin
  if not public.redaction_est_redacteur() then
    return json_build_object('ok', false, 'raison', 'interdit');
  end if;
  select trim(coalesce(prenom, '') || ' ' || coalesce(nom, '')) into n from public.profils where id = auth.uid();
  update public.redaction_sujets
     set statut = 'en_cours', redacteur = auth.uid(), redacteur_nom = n,
         pris_le = now(), maj_le = now()
   where id = p_id and statut = 'disponible'
  returning id into ok;
  if ok is null then
    return json_build_object('ok', false, 'raison', 'deja_pris');
  end if;
  return json_build_object('ok', true);
end;
$$;

-- Enregistrer le brouillon (et, si p_soumettre, l'envoyer à l'admin).
create or replace function public.redaction_enregistrer(p_id uuid, p_contenu text, p_soumettre boolean default false)
returns json
language plpgsql security definer set search_path = public
as $$
declare ok uuid;
begin
  if not public.redaction_est_redacteur() then
    return json_build_object('ok', false, 'raison', 'interdit');
  end if;
  update public.redaction_sujets
     set contenu = p_contenu,
         maj_le = now(),
         statut = case when p_soumettre then 'soumis' else statut end,
         soumis_le = case when p_soumettre then now() else soumis_le end
   where id = p_id and redacteur = auth.uid() and statut in ('en_cours', 'a_revoir')
  returning id into ok;
  if ok is null then
    return json_build_object('ok', false, 'raison', 'verrouille');
  end if;
  return json_build_object('ok', true);
end;
$$;

-- Rendre un sujet : il redevient disponible pour les autres, brouillon effacé.
create or replace function public.redaction_abandonner(p_id uuid)
returns json
language plpgsql security definer set search_path = public
as $$
declare ok uuid;
begin
  update public.redaction_sujets
     set statut = 'disponible', redacteur = null, redacteur_nom = null,
         contenu = null, commentaire = null, pris_le = null, soumis_le = null, maj_le = now()
   where id = p_id and redacteur = auth.uid() and statut in ('en_cours', 'a_revoir')
  returning id into ok;
  return json_build_object('ok', ok is not null);
end;
$$;

-- Sujets déjà pris par quelqu'un : visibles de tous les rédacteurs (« Article
-- pris par … »), sans jamais exposer le texte en cours d'écriture.
create or replace function public.redaction_sujets_pris()
returns table (id uuid, type text, edition text, titre text, image_url text,
               statut text, redacteur uuid, redacteur_nom text, pris_le timestamptz)
language sql stable security definer set search_path = public
as $$
  select s.id, s.type, s.edition, s.titre, s.image_url, s.statut, s.redacteur, s.redacteur_nom, s.pris_le
    from public.redaction_sujets s
   where public.redaction_est_redacteur()
     and s.statut in ('en_cours', 'a_revoir', 'soumis')
   order by s.pris_le desc nulls last;
$$;

revoke all on function public.redaction_sujets_pris() from public, anon;
grant execute on function public.redaction_sujets_pris() to authenticated;

revoke all on function public.redaction_prendre(uuid) from public, anon;
revoke all on function public.redaction_enregistrer(uuid, text, boolean) from public, anon;
revoke all on function public.redaction_abandonner(uuid) from public, anon;
grant execute on function public.redaction_prendre(uuid) to authenticated;
grant execute on function public.redaction_enregistrer(uuid, text, boolean) to authenticated;
grant execute on function public.redaction_abandonner(uuid) to authenticated;

-- 5. Images des sujets : bucket public en lecture, dépôt réservé à l'admin
insert into storage.buckets (id, name, public)
values ('redaction', 'redaction', true)
on conflict (id) do update set public = true;

drop policy if exists "redaction: depot admin"        on storage.objects;
drop policy if exists "redaction: remplacement admin" on storage.objects;
drop policy if exists "redaction: suppression admin"  on storage.objects;

create policy "redaction: depot admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'redaction' and public.redaction_est_admin());

create policy "redaction: remplacement admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'redaction' and public.redaction_est_admin())
  with check (bucket_id = 'redaction' and public.redaction_est_admin());

create policy "redaction: suppression admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'redaction' and public.redaction_est_admin());
