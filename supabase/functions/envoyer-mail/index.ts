// ══════════════════════════════════════════════════════════════════
//  ECG Prépa — fonction Edge « envoyer-mail »
//
//  Appelée depuis le panneau d'administration (bouton « Écrire » et mail
//  automatique quand le Premium est offert). Réservée aux administrateurs.
//  Envoi via Brevo (https://www.brevo.com), depuis l'adresse du site.
//
//  Secrets à définir (Supabase → Edge Functions → Secrets) :
//    BREVO_API_KEY      clé API Brevo (xkeysib-…) — Brevo → SMTP et API → Clés API
//    MAIL_EXPEDITEUR    adresse d'expédition, ex. contact@ecg-prepa.fr
//                       (doit être un expéditeur validé dans Brevo)
//    MAIL_NOM           (facultatif) nom affiché, « ECG Prépa » par défaut
//    MAIL_REPONSE       (facultatif) adresse de réponse
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

    const cle = Deno.env.get('BREVO_API_KEY');
    const exp = Deno.env.get('MAIL_EXPEDITEUR');
    if (!cle || !exp) return rep({ erreur: 'Secrets BREVO_API_KEY / MAIL_EXPEDITEUR manquants.' });

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
      const r = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': cle, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          sender: { name: Deno.env.get('MAIL_NOM') || 'ECG Prépa', email: exp.replace(/^.*<|>.*$/g, '').trim() },
          ...(Deno.env.get('MAIL_REPONSE') ? { replyTo: { email: Deno.env.get('MAIL_REPONSE') } } : {}),
          to: [{ email: d.email, name: `${d.prenom || ''} ${d.nom || ''}`.trim() || undefined }],
          subject: sub(objet), textContent: texte, htmlContent: html,
        }),
      });
      if (r.ok) envoyes++; else echecs.push(d.email);
    }
    return rep({ envoyes, echecs });
  } catch (e) {
    return rep({ erreur: String((e as Error).message || e) }, 500);
  }
});
