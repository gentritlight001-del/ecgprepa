// ══════════════════════════════════════════════════════════════════
//  ECG Prépa — outils communs aux fonctions Edge de paiement
//
//  Secrets à définir (Supabase → Edge Functions → Secrets, ou
//  `supabase secrets set NOM=valeur`) :
//    STRIPE_CLE_SECRETE      sk_test_… (puis sk_live_… le jour J)
//    STRIPE_SECRET_WEBHOOK   whsec_…  (donné par Stripe à la création du webhook)
//    STRIPE_PRIX_MENSUEL     price_…  (identifiant du prix mensuel)
//    STRIPE_PRIX_ANNUEL      price_…  (identifiant du prix annuel)
//    SITE_URL                https://ecg-prepa.fr  (sans « / » final)
//  SUPABASE_URL, SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY sont
//  fournis automatiquement par Supabase.
// ══════════════════════════════════════════════════════════════════
import Stripe from 'npm:stripe@17';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export function env(nom: string): string {
  const v = Deno.env.get(nom);
  if (!v) throw new Error(`Secret manquant : ${nom}`);
  return v;
}

export function stripe(): Stripe {
  return new Stripe(env('STRIPE_CLE_SECRETE'), {
    httpClient: Stripe.createFetchHttpClient(),
  });
}

/* Client « tout-puissant » (clé service_role) : réservé au serveur,
   seul autorisé à écrire dans la table « abonnements ». */
export function admin(): SupabaseClient {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/* ─── CORS : le site appelle ces fonctions depuis le navigateur ─── */
export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

/* Identifie le membre à partir du jeton envoyé par le site, et
   vérifie que son compte est actif. Renvoie null sinon. */
export async function membre(req: Request) {
  const jeton = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jeton) return null;
  const sb = admin();
  const { data, error } = await sb.auth.getUser(jeton);
  if (error || !data?.user) return null;
  const { data: profil } = await sb.from('profils')
    .select('id,email,prenom,nom,statut')
    .eq('id', data.user.id)
    .maybeSingle();
  if (!profil || profil.statut !== 'actif') return null;
  return profil as { id: string; email: string; prenom: string | null; nom: string | null; statut: string };
}

/* Adresse de retour : on n'accepte que des pages du site lui-même. */
export function urlSite(chemin: string): string {
  return env('SITE_URL').replace(/\/+$/, '') + '/' + chemin.replace(/^\/+/, '');
}
