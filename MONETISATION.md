# Monétisation — abonnement Premium (Stripe)

Rien n'est actif tant que les étapes ci-dessous ne sont pas faites. Même une fois
le code en ligne, **aucun contenu ne devient payant** tant que tu n'as pas marqué
de rubrique « Premium » dans l'admin.

## Comment ça marche

```
tarifs.html ──(ECGAuth.premium.payer)──▶ fonction Edge stripe-paiement ──▶ page de paiement Stripe
                                                                               │
abonnement.html ◀── retour après paiement                                      ▼
      │                                               Stripe ──▶ fonction Edge stripe-webhook
      └─(Gérer)──▶ stripe-portail ──▶ portail client Stripe          │
                                                                    ▼
                               table « abonnements » (Supabase) ◀── seule la fonction peut écrire
                                                                    │
auth.js ── rpc mon_abonnement() ──▶ ouvre ou ferme les rubriques marquées « premium »
```

| Fichier | Rôle |
|---|---|
| `supabase/premium.sql` | Table `abonnements`, colonne `premium` sur `rubriques_verrouillage`, fonctions `mon_abonnement()` et `abonnes_premium()`, code d'accès offert |
| `supabase/functions/stripe-paiement` | Crée la session de paiement Stripe Checkout |
| `supabase/functions/stripe-portail` | Ouvre le portail client (carte, factures, résiliation) |
| `supabase/functions/stripe-webhook` | Reçoit les événements Stripe et met à jour `abonnements` |
| `auth.js` | Blocage des pages Premium, badges sur les cartes, bouton ✦ admin, menu « Mon abonnement », **prix affichés** (`OFFRES_PREMIUM`) |
| `tarifs.html` | Page publique des offres |
| `abonnement.html` | Espace abonné |
| `cgv.html` | Conditions générales de vente |
| `premium-admin.js` | Onglet « Premium » de l'admin (rubriques, abonnés, revenu estimé) |

## Mise en route (en mode TEST d'abord)

### 1. Stripe
1. Crée un compte sur [stripe.com](https://stripe.com), reste en **mode test**.
2. **Catalogue de produits** → nouveau produit « ECG Prépa Premium » avec deux prix récurrents :
   1,99 €/mois et 15 €/an (ou tes propres prix). Note les deux identifiants `price_…`.
3. **Paramètres → Billing → Portail client** : active-le ; autorise la résiliation (à la fin de la
   période), la mise à jour du moyen de paiement, l'historique des factures, et le changement
   d'offre entre les deux prix.
4. **Paramètres → E-mails clients** : active les reçus de paiement et les e-mails de renouvellement
   pour les abonnements annuels (obligation d'information avant reconduction).
5. **Paramètres → Billing → Abonnements → Relances** : choisis ce qui arrive après les échecs de
   paiement (conseillé : annuler l'abonnement après la dernière tentative).

### 2. Supabase
1. **SQL Editor** : colle et exécute `supabase/premium.sql`.
2. Installe la CLI Supabase, puis depuis la racine du dépôt :
   ```bash
   supabase login
   supabase link --project-ref oeityryyejvrawjqiesm
   supabase secrets set \
     STRIPE_CLE_SECRETE=sk_test_... \
     STRIPE_PRIX_MENSUEL=price_... \
     STRIPE_PRIX_ANNUEL=price_... \
     SITE_URL=https://ecg-prepa.fr
   supabase functions deploy stripe-paiement
   supabase functions deploy stripe-portail
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
3. Dans Stripe → **Développeurs → Webhooks** → ajouter un endpoint :
   `https://oeityryyejvrawjqiesm.supabase.co/functions/v1/stripe-webhook`
   avec les événements listés en tête de `supabase/functions/stripe-webhook/index.ts`.
   Copie le secret de signature (`whsec_…`) puis :
   ```bash
   supabase secrets set STRIPE_SECRET_WEBHOOK=whsec_...
   ```

### 3. Tester
- Carte de test : `4242 4242 4242 4242`, date future, n'importe quel CVC.
- Carte 3-D Secure : `4000 0027 6000 3184`. Paiement refusé : `4000 0000 0000 0341`.
- Vérifie : l'abonné apparaît dans l'onglet Premium de l'admin, la pastille « ✦ Premium » s'affiche
  dans son menu, une rubrique marquée Premium s'ouvre pour lui et reste fermée pour un compte gratuit,
  la résiliation depuis « Gérer mon abonnement » passe bien en « résilié ».

### 4. Choisir ce qui est payant
Admin → onglet **Premium** : coche les rubriques réservées. Ou, sur n'importe quelle carte du site,
le bouton rond **✦** (à gauche du cadenas) bascule ce chapitre précis.

### 5. Offrir l'accès à quelqu'un (code d'accès)
Admin → onglet **Premium** → bloc « Code d'accès offert » : choisis un code (6 caractères minimum)
et active-le. Donne-le aux personnes de ton choix : dans **Mon abonnement**, elles le saisissent
(majuscules et espaces ignorés) et obtiennent tout le Premium, gratuitement et sans date de fin.
- 5 essais par heure et par compte, pour empêcher de deviner le code.
- Changer ou désactiver le code n'enlève rien à ceux qui l'ont déjà utilisé.
- Pour retirer l'accès à quelqu'un : bouton **Retirer** dans la liste des abonnés.
- Un abonné payant ne peut pas utiliser le code (son abonnement Stripe continuerait de lui être facturé).
- Le code est stocké dans la table `code_acces`, invisible depuis le navigateur : seul un admin peut le lire.

## Avant de passer en réel (checklist)
- [ ] **Statut juridique** : vendre impose un SIRET (la micro-entreprise suffit pour commencer).
- [ ] Compléter les blocs dorés de `cgv.html` et `mentions-legales.html` (identité, SIRET, TVA, médiateur).
- [ ] **Médiateur de la consommation** : adhésion obligatoire pour vendre à des particuliers.
- [ ] Mention TVA : « TVA non applicable, art. 293 B du CGI » seulement en franchise en base.
- [ ] Prix identiques dans Stripe et dans `OFFRES_PREMIUM` (`auth.js`) et `cgv.html`.
- [ ] Refaire l'étape 1 en **mode réel** (nouveaux `price_…`, clé `sk_live_…`, nouveau webhook
      et nouveau `whsec_…`), puis mettre à jour les secrets Supabase.
- [ ] Incrémenter `VERSION` dans `sw.js` au moment de la mise en ligne.

## Limite à connaître
Les pages du site sont des fichiers HTML statiques : le blocage (verrouillage comme Premium) se fait
dans le navigateur, par `auth.js`. Il arrête 99 % des visiteurs, mais quelqu'un de technique peut
télécharger directement le fichier HTML d'une fiche Premium. Pour une protection côté serveur, il
faudrait soit servir les contenus Premium depuis un bucket Supabase privé (lecture autorisée par RLS
aux seuls abonnés), soit un contrôle d'accès chez l'hébergeur (ex. middleware Cloudflare Pages
vérifiant le jeton de session). À envisager quand les revenus le justifient.

## Suppression d'un compte abonné
Supprimer un compte depuis l'admin **ne résilie pas** son abonnement Stripe : résilie-le d'abord
dans le tableau de bord Stripe (Clients → l'abonné → Annuler l'abonnement).
