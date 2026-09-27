// ══════════════════════════════════════════════════════════════════
//  ECG Prépa — fonction Edge « stripe-portail »
//
//  Appelée par abonnement.html. Ouvre le portail client Stripe :
//  le membre y change de carte, télécharge ses factures, passe du
//  mensuel à l'annuel ou résilie — sans que tu aies à coder tout ça.
//  Renvoie { url }.
//
//  À faire une fois dans Stripe : Paramètres → Billing → Portail
//  client → activer, et cocher ce que le membre a le droit de faire.
//
//  Déploiement :  supabase functions deploy stripe-portail
// ══════════════════════════════════════════════════════════════════
import { admin, CORS, json, membre, stripe, urlSite } from '../_partage/stripe.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ erreur: 'Méthode non autorisée.' }, 405);

  try {
    const moi = await membre(req);
    if (!moi) return json({ erreur: 'Connecte-toi pour gérer ton abonnement.' }, 401);

    const { data: ligne } = await admin().from('abonnements')
      .select('stripe_client')
      .eq('utilisateur', moi.id)
      .maybeSingle();
    if (!ligne?.stripe_client) return json({ erreur: 'Aucun abonnement associé à ce compte.' }, 404);

    const session = await stripe().billingPortal.sessions.create({
      customer: ligne.stripe_client,
      locale: 'fr',
      return_url: urlSite('abonnement.html'),
    });
    return json({ url: session.url });
  } catch (e) {
    console.error('stripe-portail', e);
    return json({ erreur: 'Le portail d\'abonnement est indisponible pour le moment.' }, 500);
  }
});
