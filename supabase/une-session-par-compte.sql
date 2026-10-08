-- 1 compte = 1 session.
-- À exécuter une fois dans Supabase (SQL Editor). Fonctionne quelle que soit la
-- définition de demarrer_session : dès qu'une session s'ouvre, les autres
-- sessions du même compte sont supprimées (l'ancien appareil est renvoyé vers
-- la connexion au prochain battement).

create or replace function public.une_session_par_compte()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.sessions
   where utilisateur = new.utilisateur
     and id <> new.id;
  return new;
end;
$$;

drop trigger if exists trg_une_session_par_compte on public.sessions;
create trigger trg_une_session_par_compte
  after insert on public.sessions
  for each row execute function public.une_session_par_compte();

-- Nettoyage de l'existant : on garde, pour chaque compte, la session la plus récente.
delete from public.sessions s
 using public.sessions t
 where s.utilisateur = t.utilisateur
   and (s.vu < t.vu or (s.vu = t.vu and s.id::text < t.id::text));
