/* ══════════════════════════════════════════════════════════════════
   ECG Prépa — Formulaire de contact (contact.html)
   Déploiement : nom de fonction « contact », Verify JWT DÉSACTIVÉ
   (la page est publique : la clé publishable du site n'est pas un JWT).

   1. vérifie le message (champ piège anti-robots, longueurs, limites
      d'envoi par adresse et par heure) ;
   2. l'enregistre dans la table messages_contact ;
   3. l'envoie par mail au propriétaire, avec « Répondre » réglé sur
      l'adresse de l'élève : on lui répond directement depuis sa boîte.

   Variables (Edge Functions → Secrets) :
     CONTACT_DESTINATAIRE   adresse(s) qui reçoivent les messages,
                            séparées par des virgules ; à défaut, les
                            administrateurs actifs de la table profils
     MAIL_EXPEDITEUR, MAIL_NOM, BREVO_API_KEY ou RESEND_API_KEY
                            déjà en place (fonctions envoyer-mail, bienvenue)
   ══════════════════════════════════════════════════════════════════ */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXPEDITEUR     = Deno.env.get('MAIL_EXPEDITEUR') ?? 'contact@ecg-prepa.fr';
const NOM_EXPEDITEUR = Deno.env.get('MAIL_NOM') ?? 'ECG Prépa';
const RESEND         = Deno.env.get('RESEND_API_KEY');
const BREVO          = Deno.env.get('BREVO_API_KEY');
const DESTINATAIRES  = (Deno.env.get('CONTACT_DESTINATAIRE') ?? '')
  .split(',').map((s) => s.trim()).filter(Boolean);

const MAX_PAR_ADRESSE = 3;    // messages par adresse en 15 minutes
const MAX_PAR_HEURE   = 40;   // messages au total en une heure

const entetes = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};
const reponse = (corps: unknown, code = 200) =>
  new Response(JSON.stringify(corps), { status: code, headers: entetes });

const echapper = (s: string) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

const EMAIL_OK = /^[^\s@<>",;]+@[^\s@<>",;]+\.[a-z]{2,}$/i;

function habiller(motif: string, email: string, message: string, page: string, quand: string) {
  const corps = echapper(message).replace(/\n/g, '<br>');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f2ed">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ed;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e0d6;border-radius:10px">
  <tr><td style="padding:28px 32px 0">
    <div style="font:700 20px/1.2 Georgia,'Times New Roman',serif;color:#8a6d33">${echapper(NOM_EXPEDITEUR)} · Contact</div>
    <div style="height:2px;width:38px;background:#c8a96e;margin:12px 0 0"></div>
  </td></tr>
  <tr><td style="padding:22px 32px 0;font:400 14px/1.6 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#5a564d">
    <b style="color:#2c2a26">Motif :</b> ${echapper(motif)}<br>
    <b style="color:#2c2a26">De :</b> <a href="mailto:${echapper(email)}" style="color:#8a6d33">${echapper(email)}</a><br>
    <b style="color:#2c2a26">Reçu le :</b> ${echapper(quand)}${page ? ` · depuis ${echapper(page)}` : ''}
  </td></tr>
  <tr><td style="padding:20px 32px 8px;font:400 15px/1.7 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#2c2a26">
    <div style="border-left:3px solid #c8a96e;padding:4px 0 4px 16px">${corps}</div>
  </td></tr>
  <tr><td style="padding:8px 32px 28px;border-top:1px solid #eeebe3">
    <p style="margin:18px 0 0;font:400 12px/1.6 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#8a8880">
      Message envoyé depuis le formulaire de contact du site. « Répondre » écrit directement à ${echapper(email)}.
    </p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

async function envoyerResend(a: string[], repondre: string, objet: string, html: string, texte: string) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${NOM_EXPEDITEUR} <${EXPEDITEUR}>`, to: a, reply_to: repondre,
      subject: objet, html, text: texte
    })
  });
  if (!r.ok) throw new Error(`Resend ${r.status} : ${(await r.text()).slice(0, 300)}`);
}

async function envoyerBrevo(a: string[], repondre: string, objet: string, html: string, texte: string) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO!, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: EXPEDITEUR, name: `${NOM_EXPEDITEUR} · Contact` },
      to: a.map((email) => ({ email })), replyTo: { email: repondre },
      subject: objet, htmlContent: html, textContent: texte
    })
  });
  if (!r.ok) throw new Error(`Brevo ${r.status} : ${(await r.text()).slice(0, 300)}`);
}

const expedier = RESEND ? envoyerResend : BREVO ? envoyerBrevo : null;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: entetes });
  if (req.method !== 'POST') return reponse({ erreur: 'Méthode non autorisée.' }, 405);

  let c: { motif?: string; email?: string; message?: string; page_origine?: string; site?: string };
  try { c = await req.json(); } catch { return reponse({ erreur: 'Requête illisible.' }, 400); }

  /* Champ piège : invisible pour un humain, rempli par les robots. */
  if (c.site) return reponse({ ok: true });

  const motif   = String(c.motif ?? '').trim().slice(0, 120) || 'Autre demande';
  const email   = String(c.email ?? '').trim().slice(0, 200);
  const message = String(c.message ?? '').trim();
  const page    = String(c.page_origine ?? '').trim().slice(0, 200);

  if (!EMAIL_OK.test(email)) return reponse({ erreur: 'Adresse e-mail invalide.' }, 400);
  if (message.length < 2)    return reponse({ erreur: 'Le message est vide.' }, 400);
  if (message.length > 6000) return reponse({ erreur: 'Message trop long (6 000 caractères au plus).' }, 400);

  const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  /* Limites d'envoi. */
  const il15 = new Date(Date.now() - 15 * 60e3).toISOString();
  const il60 = new Date(Date.now() - 60 * 60e3).toISOString();
  const [{ count: parAdresse }, { count: parHeure }] = await Promise.all([
    service.from('messages_contact').select('id', { count: 'exact', head: true }).ilike('email', email).gte('cree_le', il15),
    service.from('messages_contact').select('id', { count: 'exact', head: true }).gte('cree_le', il60)
  ]);
  if ((parAdresse ?? 0) >= MAX_PAR_ADRESSE || (parHeure ?? 0) >= MAX_PAR_HEURE) {
    return reponse({ erreur: 'Trop de messages d\'un coup : réessaie dans un quart d\'heure.' }, 429);
  }

  /* 1. Enregistrement (le message n'est jamais perdu). */
  const { error: errIns } = await service.from('messages_contact')
    .insert({ motif, email, message, page_origine: page || null });
  if (errIns) return reponse({ erreur: 'Enregistrement impossible.' }, 500);

  /* 2. Mail au propriétaire. */
  let a = DESTINATAIRES;
  if (!a.length) {
    const { data } = await service.from('profils').select('email').eq('role', 'admin').eq('statut', 'actif');
    a = (data ?? []).map((p: { email: string }) => p.email).filter(Boolean);
  }
  if (!a.length) a = [EXPEDITEUR];

  const quand = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'long', timeStyle: 'short' });
  const objet = `[Contact] ${motif} · ${email}`;
  const texte = `Motif : ${motif}\nDe : ${email}\nReçu le : ${quand}${page ? ' · depuis ' + page : ''}\n\n${message}\n\n(« Répondre » écrit directement à ${email}.)`;

  let mail = false, erreur = '';
  if (expedier) {
    try { await expedier(a, email, objet, habiller(motif, email, message, page, quand), texte); mail = true; }
    catch (e) { erreur = String((e as Error).message ?? e).slice(0, 500); }
  } else {
    erreur = 'Aucun service d\'envoi configuré.';
  }

  await service.from('mails_envoyes').insert(a.map((d) => ({
    destinataire: d, modele: 'contact', objet, statut: mail ? 'envoye' : 'echec',
    erreur: mail ? null : erreur, par: email
  }))).then(() => {}, () => {});

  /* Le message est enregistré même si le mail a échoué. */
  return reponse({ ok: true, mail });
});
