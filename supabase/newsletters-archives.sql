-- ═══════════════════════════════════════════════════════════════════
--  ECG Prépa — Archives des newsletters (onglet « Archives » de l'admin)
--
--  Les PDF sont rangés dans le bucket privé « newsletters », sous le
--  dossier archives/<édition>/. Seuls les administrateurs actifs peuvent
--  les voir, en déposer, en remplacer ou en supprimer : aucun lien
--  public n'existe, les fichiers ne s'ouvrent que par des liens signés
--  de courte durée générés depuis l'admin.
--
--  À lancer une fois dans Supabase → SQL Editor. Le script peut être
--  relancé sans risque.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Le bucket (privé). S'il existe déjà, on s'assure qu'il reste privé.
insert into storage.buckets (id, name, public)
values ('newsletters', 'newsletters', false)
on conflict (id) do update set public = false;

-- 2. Administrateur actif ? (security definer : ne dépend pas des
--    règles RLS de la table profils)
create or replace function public.archives_est_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profils
    where id = auth.uid() and role = 'admin' and statut = 'actif'
  );
$$;

-- 3. Règles d'accès au bucket, réservées aux administrateurs
drop policy if exists "newsletters: lecture admin"      on storage.objects;
drop policy if exists "newsletters: depot admin"        on storage.objects;
drop policy if exists "newsletters: remplacement admin" on storage.objects;
drop policy if exists "newsletters: suppression admin"  on storage.objects;

create policy "newsletters: lecture admin" on storage.objects
  for select to authenticated
  using (bucket_id = 'newsletters' and public.archives_est_admin());

create policy "newsletters: depot admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'newsletters' and public.archives_est_admin());

create policy "newsletters: remplacement admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'newsletters' and public.archives_est_admin())
  with check (bucket_id = 'newsletters' and public.archives_est_admin());

create policy "newsletters: suppression admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'newsletters' and public.archives_est_admin());
