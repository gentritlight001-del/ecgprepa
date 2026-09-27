// ══════════════════════════════════════════════════════════════════
//  ECG Prépa — fonction Edge « stripe-paiement »
//
//  Appelée par tarifs.html (via ECGAuth.premium.payer). Ouvre une
//  page de paiement Stripe Checkout pour l'offre choisie et renvoie
//  son adresse : { url }. Le paiement lui-même, la carte bancaire et
//  le 3-D Secure sont entièrement gérés par Stripe — aucune donnée
//  bancaire ne transite par le site.
//
//  Déploiement :  supabase functions deploy stripe-paiement
// ══════════════════════════════════════════════════════════════════
import { admin, CORS, env, json, membre, stripe, urlSite } from '../_partage/stripe.ts';

const OFFRES: Record<string, string> = {
  mensuel: 'STRIPE_PRIX_MENSUEL',
  annuel: 'STRIPE_PRIX_ANNUEL',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ erreur: 'Méthode non autorisée.' }, 405);

  try {
    const moi = await membre(req);
    if (!moi) return json({ erreur: 'Connecte-toi avec un compte actif pour t\'abonner.' }, 401);

    const corps = await req.json().catch(() => ({}));
    const offre = String(corps.offre || '');
    if (!OFFRES[offre]) return json({ erreur: 'Offre inconnue.' }, 400);

    // Contenu numérique fourni immédiatement : sans renonciation
    // expresse, le membre garderait 14 jours pour se rétracter.
    if (corps.renonciation !== true) {
      return json({ erreur: 'Coche la case sur l\'accès immédiat au contenu pour continuer.' }, 400);
    }

    const sb = admin();
    const s = stripe();

    const { data: ligne } = await sb.from('abonnements')
      .select('stripe_client,statut,fin_periode')
      .eq('utilisateur', moi.id)
      .maybeSingle();

    // Pas de second abonnement par-dessus un abonnement en cours.
    const encours = ligne && ['active', 'trialing', 'past_due'].includes(ligne.statut) &&
      (!ligne.fin_periode || new Date(ligne.fin_periode).getTime() > Date.now());
    if (encours) {
      return json({ erreur: 'Tu es déjà abonné·e. Gère ton abonnement depuis la page « Mon abonnement ».', deja: true }, 409);
    }

    // Un seul client Stripe par membre, réutilisé d'un abonnement à l'autre.
    let client = ligne?.stripe_client as string | undefined;
    if (!client) {
      const c = await s.customers.create({
        email: moi.email,
        name: [moi.prenom, moi.nom].filter(Boolean).join(' ') || undefined,
        metadata: { utilisateur: moi.id },
      });
      client = c.id;
      const { error } = await sb.from('abonnements').upsert({
        utilisateur: moi.id,
        stripe_client: client,
        maj_le: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
    }

    const renonciation = new Date().toISOString();
    const session = await s.checkout.sessions.create({
      mode: 'subscription',
      customer: client,
      client_reference_id: moi.id,
      line_items: [{ price: env(OFFRES[offre]), quantity: 1 }],
      locale: 'fr',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: { address: 'auto', name: 'auto' },
      success_url: urlSite('abonnement.html?paiement=ok'),
      cancel_url: urlSite('tarifs.html?paiement=annule'),
      metadata: { utilisateur: moi.id, offre, renonciation_retractation_le: renonciation },
      subscription_data: {
        metadata: { utilisateur: moi.id, offre, renonciation_retractation_le: renonciation },
      },
    });

    return json({ url: session.url });
  } catch (e) {
    console.error('stripe-paiement', e);
    return json({ erreur: 'Le paiement n\'a pas pu être préparé. Réessaie dans un instant.' }, 500);
  }
});
