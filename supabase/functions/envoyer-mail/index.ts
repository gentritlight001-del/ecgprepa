// ══════════════════════════════════════════════════════════════════
//  ECG Prépa — fonction Edge « envoyer-mail »
//
//  Appelée depuis le panneau d'administration (bouton « Écrire » et mail
//  automatique quand le Premium est offert). Réservée aux administrateurs.
//  Envoi via Resend (https://resend.com), depuis l'adresse du site.
//
//  Secrets à définir (Supabase → Edge Functions → Secrets) :
//    RESEND_API_KEY     clé API Resend (re_…)
//    MAIL_EXPEDITEUR    ex. « ECG Prépa <contact@ecg-prepa.fr> »
//                       (le domaine ecg-prepa.fr doit être vérifié dans Resend)
//
//  Déploiement :
//    supabase functions deploy envoyer-mail
//
//  Entrée : { destinataires: [{ id, email, prenom, nom }], objet, corps, modele }
//  Sortie : { envoyes: n, echecs: [email, …] }   ou   { erreur: "…" }
// ══════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};
const rep = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: CORS });
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const client = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      auth: { persistSession: false },
    });
    const { data: estAdmin } = await client.rpc('premium_est_admin');
    if (!estAdmin) return rep({ erreur: 'Action réservée aux administrateurs.' }, 403);

    const cle = Deno.env.get('RESEND_API_KEY');
    const exp = Deno.env.get('MAIL_EXPEDITEUR');
    if (!cle || !exp) return rep({ erreur: 'Secrets RESEND_API_KEY / MAIL_EXPEDITEUR manquants.' });

    const { destinataires, objet, corps } = await req.json();
    if (!Array.isArray(destinataires) || !destinataires.length || !objet || !corps)
      return rep({ erreur: 'Requête incomplète.' }, 400);

    let envoyes = 0;
    const echecs: string[] = [];
    for (const d of destinataires.slice(0, 200)) {
      const sub = (t: string) => String(t)
        .replace(/\{\{\s*prenom\s*\}\}/g, d.prenom || '')
        .replace(/\{\{\s*nom\s*\}\}/g, d.nom || '');
      const texte = sub(corps);
      const html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222">' +
        esc(texte).replace(/\n/g, '<br>') + '</div>';
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: exp, to: [d.email], subject: sub(objet), text: texte, html }),
      });
      if (r.ok) envoyes++; else echecs.push(d.email);
    }
    return rep({ envoyes, echecs });
  } catch (e) {
    return rep({ erreur: String((e as Error).message || e) }, 500);
  }
});
