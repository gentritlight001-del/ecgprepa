// ══════════════════════════════════════════════════════════════════
//  ECG Prépa — fonction Edge « stripe-webhook »
//
//  C'est Stripe (et lui seul) qui l'appelle, à chaque paiement,
//  renouvellement, échec de prélèvement ou résiliation. Elle tient
//  la table « abonnements » à jour : c'est elle qui ouvre et ferme
//  l'accès Premium.
//
//  Sécurité : chaque appel est signé par Stripe ; une requête dont
//  la signature ne correspond pas à STRIPE_SECRET_WEBHOOK est
//  rejetée. Pas de jeton Supabase ici (Stripe n'en a pas), d'où le
//  déploiement avec --no-verify-jwt :
//
//    supabase functions deploy stripe-webhook --no-verify-jwt
//
//  Adresse à déclarer dans Stripe (Développeurs → Webhooks) :
//    https://<projet>.supabase.co/functions/v1/stripe-webhook
//  Événements à cocher :
//    checkout.session.completed
//    customer.subscription.created
//    customer.subscription.updated
//    customer.subscription.deleted
//    customer.subscription.paused
//    customer.subscription.resumed
//    invoice.paid
//    invoice.payment_failed
// ══════════════════════════════════════════════════════════════════
import Stripe from 'npm:stripe@17';
import { admin, env, stripe } from '../_partage/stripe.ts';

const ACTIFS = ['active', 'trialing', 'past_due'];

function versDate(secondes?: number | null): string | null {
  return secondes ? new Date(secondes * 1000).toISOString() : null;
}

function offreDe(sub: Stripe.Subscription): string | null {
  const prix = sub.items?.data?.[0]?.price?.id;
  if (prix && prix === Deno.env.get('STRIPE_PRIX_MENSUEL')) return 'mensuel';
  if (prix && prix === Deno.env.get('STRIPE_PRIX_ANNUEL')) return 'annuel';
  const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
  if (interval === 'year') return 'annuel';
  if (interval === 'month') return 'mensuel';
  return sub.metadata?.offre || null;
}

/* Recopie dans la base l'état RÉEL de l'abonnement, relu chez Stripe
   (et non celui de l'événement) : peu importe l'ordre dans lequel
   les événements arrivent, la base finit toujours juste. */
async function synchroniser(s: Stripe, idAbonnement: string, extra: Record<string, unknown> = {}) {
  const sub = await s.subscriptions.retrieve(idAbonnement);
  const sb = admin();
  const idClient = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  // Retrouver le membre : métadonnée posée au paiement, sinon client Stripe.
  let utilisateur = sub.metadata?.utilisateur || null;
  if (!utilisateur) {
    const { data } = await sb.from('abonnements').select('utilisateur')
      .eq('stripe_client', idClient).maybeSingle();
    utilisateur = data?.utilisateur || null;
  }
  if (!utilisateur) {
    console.warn('stripe-webhook : abonnement sans membre connu', sub.id, idClient);
    return;
  }

  const { data: ligne } = await sb.from('abonnements')
    .select('stripe_abonnement,statut')
    .eq('utilisateur', utilisateur).maybeSingle();

  // Un abonnement Stripe terminé ne retire pas un accès offert par code.
  if (ligne?.statut === 'offert' && !ACTIFS.includes(sub.status)) return;

  // Un vieil abonnement terminé ne doit pas écraser un abonnement
  // plus récent encore en cours.
  if (ligne?.stripe_abonnement && ligne.stripe_abonnement !== sub.id &&
      ACTIFS.includes(ligne.statut) && !ACTIFS.includes(sub.status)) {
    return;
  }

  // Selon la version de l'API Stripe, la fin de période est portée
  // par l'abonnement ou par sa première ligne.
  // deno-lint-ignore no-explicit-any
  const brut = sub as any;
  const fin = brut.current_period_end ?? brut.items?.data?.[0]?.current_period_end ?? null;

  const { error } = await sb.from('abonnements').upsert({
    utilisateur,
    stripe_client: idClient,
    stripe_abonnement: sub.id,
    statut: sub.status,
    offre: offreDe(sub),
    fin_periode: versDate(fin),
    annulation_prevue: !!(sub.cancel_at_period_end || sub.cancel_at),
    maj_le: new Date().toISOString(),
    ...extra,
  });
  if (error) throw new Error(error.message);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Méthode non autorisée', { status: 405 });

  const s = stripe();
  const signature = req.headers.get('Stripe-Signature') || '';
  const corps = await req.text();

  let ev: Stripe.Event;
  try {
    ev = await s.webhooks.constructEventAsync(
      corps, signature, env('STRIPE_SECRET_WEBHOOK'),
      undefined, Stripe.createSubtleCryptoProvider(),
    );
  } catch (e) {
    console.warn('stripe-webhook : signature refusée', (e as Error).message);
    return new Response('Signature invalide', { status: 400 });
  }

  const sb = admin();
  const { data: deja } = await sb.from('stripe_evenements').select('id').eq('id', ev.id).maybeSingle();
  if (deja) return new Response('déjà traité', { status: 200 });

  try {
    switch (ev.type) {
      case 'checkout.session.completed': {
        const cs = ev.data.object as Stripe.Checkout.Session;
        if (cs.mode === 'subscription' && cs.subscription) {
          const id = typeof cs.subscription === 'string' ? cs.subscription : cs.subscription.id;
          const r = cs.metadata?.renonciation_retractation_le;
          await synchroniser(s, id, r ? { renonciation_retractation_le: r } : {});
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed': {
        await synchroniser(s, (ev.data.object as Stripe.Subscription).id);
        break;
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        // deno-lint-ignore no-explicit-any
        const inv = ev.data.object as any;
        const id = inv.subscription ?? inv.parent?.subscription_details?.subscription ?? null;
        if (id) await synchroniser(s, typeof id === 'string' ? id : id.id);
        break;
      }
      default:
        // Événement non utilisé : on l'accuse simplement réception.
        break;
    }
  } catch (e) {
    console.error('stripe-webhook', ev.type, ev.id, e);
    // 500 → Stripe renverra l'événement plus tard, automatiquement.
    return new Response('Erreur de traitement', { status: 500 });
  }

  await sb.from('stripe_evenements').insert({ id: ev.id, type: ev.type });
  return new Response('ok', { status: 200 });
});
