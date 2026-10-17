# ECG Prépa — consignes pour Claude

Site statique de prépa ECG (HTML/CSS/JS, hébergé sur Cloudflare Pages, comptes et
stockage sur Supabase). Ce fichier est relu au début de **chaque** conversation :
toutes les règles valables d'une conversation à l'autre sont ici.

Sommaire : 1. Règles générales · 2. Mise en ligne · 3. Articles d'actualité ·
4. Cours (chapitres, colles, HGG au quotidien, DS) · 5. Newsletters PDF

---

## 1. Règles générales

- Tout le contenu est en **français** (sauf les versions en langue étrangère des articles
  et des newsletters). Typographie française : espace insécable avant `: ; ! ? %` et
  à l'intérieur des « guillemets ».
- **Pas de tiret cadratin « — »** dans la rédaction : cours, articles (toutes les langues),
  newsletters, fiches de culture générale et d'Humanité, jours de langues. Il est utilisé
  abusivement : à la place, une virgule, un deux-points, des parenthèses ou une nouvelle phrase.
  Restent permis : les titres (« Chapitre 3 — … », « X — ECG Prépa ») et les numéros de section
  (« 1 — … »). `quotidien-controle.py` et `newsletter/outils/controle.py` le vérifient. Le
  contenu déjà en ligne n'est pas à reprendre.
- **Verrouillage** : ne jamais verrouiller une page ni la rendre Premium. Le propriétaire du
  site le fait lui-même (`auth.js`). Seule exception, automatique et voulue par le propriétaire
  (`infoActu` / `dernierActu` dans `auth.js`) : dans les actualités, la culture générale et les
  espaces « au quotidien » (langues et HGG de 1re année), seul le contenu le plus récent est
  gratuit, tous les autres passent Premium d'eux-mêmes. Pour les espaces « au quotidien », le
  plus récent est celui de la carte du haut de l'index (`.une` ou `.i-une`) : la mettre à jour
  suffit, rien d'autre à faire.
- Pages réservées à l'administrateur : `PAGES_ADMIN` dans `auth.js` (`admin.html`,
  `idees-articles.html`, `mes-newsletters.html`). Une nouvelle page admin s'ajoute à cette
  liste et au menu admin de `auth.js`, dans le même style que `idees-articles.html`.
- Tester une page avec Playwright : `NODE_PATH=$(npm root -g)` pour Node, Chromium dans
  `/opt/pw-browsers/chromium`. Remplacer `auth.js` par un script vide (sinon redirection
  vers la connexion).
- Fichiers temporaires dans le scratchpad de la session, jamais dans le dépôt.
- **Refonte d'une page : homogénéiser.** La nouvelle version remplace l'ancienne **sous le même nom de
  fichier** (jamais de copie à côté), pour que tous les liens et fils d'Ariane du site restent bons. Une
  ancienne page intermédiaire devenue inutile n'est pas supprimée : elle devient une page de renvoi
  (`noindex`, `location.replace` + `meta refresh`, comme `premiere_annee/langues/flashcards/index.html`) vers
  la nouvelle page, avec une ancre si besoin. Déjà en renvoi : `premiere_annee/index.html` → `cours-ecg.html#premiere`,
  `deuxieme_annee/index.html` → `cours-ecg.html#deuxieme`, `humanite/cours-humanite/cours-humanite.html`
  → `humanite.html#cours`.
- **Barre du haut : une par grande section**, choisie par le propriétaire sur maquette (`barre-section.css`).
  Partout : 60 px, logo « ECG Prépa » en Playfair Display gras 20 px à gauche, fil d'Ariane au centre
  (sous la barre sur téléphone, en une ligne qui défile), loupe et compte à droite. Couleurs : Cours ECG
  (`sn-cours`, noir, filet à la couleur de la matière : `sn-maths`, `sn-hgg`…), Actualité (`sn-actu`, noir,
  filet rouge, fil en capitales), Culture générale (`sn-cg`, kraft, logo rouge tampon), L'Humanité (`sn-hum`,
  blanc, filet rouge brique). Une nouvelle page copiée d'une page existante garde sa barre ; sinon,
  `python3 outils/barre-section.py` marque la `<nav>` (classes `sn`, `sn-logo`, `sn-fil`, `.nav-right`) et
  relie la feuille. Ne pas restyler la barre dans la page.

## 2. Mise en ligne

« Mets en ligne » = toute la séquence, sans demander. Le propriétaire demande de mettre en ligne
directement après chaque modification, sans attendre un nouveau « mets en ligne » :

0. Si la modification ajoute une page de contenu (article, fiche de culture générale, chapitre,
   leçon, fiche d'Humanité…) : lancer `python3 outils/images-partage.py`. Le script crée l'image
   de partage 1200 × 630 px (`partage/`) et ajoute les balises `og:` dans le `<head>` des pages
   qui n'en ont pas encore (aperçu des liens sur WhatsApp, Discord, etc.). Il ignore les pages
   déjà faites : on peut le relancer sans risque. Il a besoin de playwright (voir section 5).
   **Lancer ces scripts en dernier**, après la dernière régénération ou modification de la page :
   recréer une page depuis un gabarit efface ses balises `og:` et sa description, et le script
   ne les remet qu'au passage suivant.
   Puis `python3 outils/referencement.py` : il ajoute la description et la balise canonical des
   pages qui n'en ont pas et régénère `sitemap.xml` (ne jamais modifier ce fichier à la main).
   Puis `python3 outils/recherche.py` : il régénère `recherche-index.json`, l'index de la recherche
   dans tout le site (`recherche.js`, chargé par `auth.js` : loupe à côté du badge, Ctrl+K ou « / » ;
   les mots cherchés sont surlignés à l'arrivée sur la page).
   Ne jamais modifier ce fichier à la main.
   Puis `python3 outils/nouveautes.py` : il régénère `nouveautes.js`, la liste des derniers
   contenus (articles, dossiers de CG, fiches Humanité, chapitres) affichée sous les 4 cartes de
   l'accueil et dans la page `nouveautes.html`. Les dates de mise en ligne sont gardées dans
   `outils/nouveautes-dates.json` (ne jamais modifier ces deux fichiers à la main).
   Puis `python3 outils/flashcards.py` : il régénère la bibliothèque de l'espace flashcards
   (`flashcards/donnees/*.js`) à partir des pages du jour de langues et des cartes des chapitres.
1. Commit sur la branche de travail de la session, puis `git push -u origin <branche>`.
2. Créer la PR vers `main` et la merger (outils GitHub MCP).
3. Remettre la branche à jour sur `main` :
   `git fetch origin main && git checkout -B <branche> origin/main && git push -u origin <branche> --force-with-lease`

Cloudflare Pages redéploie `main` automatiquement. Le service worker est « réseau
d'abord » et `_headers` désactive le cache : pas de numéro de version à changer.

**Attention, exception réelle** : Cloudflare écrase `_headers` pour les fichiers statiques (`.js`,
`.css`, images) et leur impose `max-age=14400` (4 h), à cause du réglage de la zone « Browser
Cache TTL » (vérifiable avec `curl -I https://ecg-prepa.fr/nouveautes.js`). Les pages `.html`
ne sont pas touchées. Conséquence : un fichier de **données générées chargé par script**
(`nouveautes.js`) ne se met pas à jour avant 4 h sans Ctrl+Maj+R. `index.html` et
`nouveautes.html` le chargent donc avec un paramètre qui change chaque minute
(`nouveautes.js?v=<minute>`) : ne pas remettre un simple `<script src="nouveautes.js">`, et
faire pareil pour tout nouveau fichier de données `.js`. `recherche-index.json` est lu par `fetch`
avec `cache: 'no-cache'` (revalidé à chaque ouverture, 304 s'il n'a pas changé) : pas de paramètre. Pour tous les autres `.js` et `.css`, c'est
`sw.js` qui règle le problème : il les redemande au serveur à chaque visite (`cache: 'no-cache'`, 304
si inchangé) et réécrit leur en-tête en `no-cache` pour que Chrome ne les garde pas en mémoire. Ne
pas retirer ce mécanisme (`sansCacheNavigateur`). Le vrai remède, côté tableau de bord
Cloudflare (que seul le propriétaire peut régler) : Caching → Configuration → Browser Cache TTL
→ « Respect Existing Headers ».

## 3. Articles d'actualité

### Où

| Édition | Articles | Images | Listes à mettre à jour |
|---|---|---|---|
| Anglophone | `actualites/en/articles/` | `actualites/en/images/` | `tous-en.html` + page du pays (`royaume-uni.html`, `etats-unis.html`, `canada.html`, `irlande.html`, `australie.html`) |
| Hispanophone | `actualites/es/articles/` | `actualites/es/images/` | `tous-es.html` + page du pays |
| Germanophone | `actualites/de/articles/` | `actualites/de/images/` | `tous-de.html` + `allemagne.html` / `autriche.html` / `suisse.html` |
| Mondiale | `actualites/monde/articles/` | `actualites/monde/images/` | `tous-monde.html` + page de la région (`europe.html`, `afrique.html`, `amerique.html`, `asie.html`, `moyen-orient.html`, `arctique.html`, `oceanie.html`) |

### Modèle

**Avant d'écrire un article, lire `actualites/prompts-articles-ecg-prepa.pdf`** (outil Read,
pages 1 à 4 : prompts n°1 à 4 = articles EN, ES, DE, MONDE). C'est la « Bibliothèque de
prompts » du propriétaire : elle fait foi pour le contenu, et les règles ci-dessous la complètent
(pour la mise en page, c'est le gabarit ci-dessous qui compte). Une demande
type est « Rédige un article d'actualité sur le sujet suivant : … » + photo : tout doit être
parfait du premier coup (faits vérifiés, mise en page, listes, mise en ligne). Les prompts
n°5 à 9 (pages 5 à 7) sont les newsletters : voir la section 5.

Plusieurs articles à la fois : un sous-agent par article, chacun avec **son propre dossier de
travail** dans le scratchpad (un dossier partagé se fait écraser) ; les fichiers partagés
(`tous-<code>.html`, pages pays) sont modifiés par une seule personne, à la fin.

- **Gabarit** (choisi par le propriétaire, octobre 2026) : copier
  `actualites/en/articles/uk-burnham-russie-brexit-ingerence-2026.html` (`<body class="a-page">`). Pour
  la mise en page, c'est lui qui fait foi, avant le PDF et les anciens articles (`ap-band`, `ap-cols`,
  `ap-facts`, `ap-ctx` : ne plus les écrire ; les anciens articles restent tels quels). Garder son
  `<style>` tel quel (ne le compléter que pour un nouveau type de bloc) et les classes `ap-title`,
  `ap-sub`, `ap-intro` (lues par les scripts). Supprimer de la copie les balises `og:`, `twitter:`,
  `canonical` et la description.
- **Ordre des blocs**, dans chaque langue :
  1. Barre `sn sn-actu` (fil d'Ariane : Accueil / Actualité / édition / pays / sujet court), puis `a-filet`.
  2. Héros `a-hero` : tags `a-tag` (`t0` le pays, `t1` le thème, puis 1 ou 2 mots-clés), titre `a-titre`,
     sous-titre `a-sous-titre` = le même titre dans l'autre langue (avec `lang`), `a-meta`
     « Mois année · Pays · N min de lecture », photo `a-hero-img` (la photo fournie, sans légende ni texte
     par-dessus).
  3. `a-essentiel` « L'essentiel en 30 secondes » : 3 points de 2 à 3 lignes, mots clés en `<strong>`.
  4. `<article class="a-carte a-article">` : `a-chiffres` (4 chiffres vérifiés, le plus marquant en
     `rouge`), chapô `a-chapo`, puis **6 à 8 sections** `a-sec` numérotées (`a-h2` + `a-num` 01, 02…) :
     un titre court et 1 ou 2 paragraphes `a-p` chacune.
  5. Entre les sections : **1 ou 2 schémas** `a-schema`, **une citation** `a-citation`, au plus **une photo**
     `a-photo` qui flotte à droite dans une section.
  6. Chronologie `a-chrono-bloc` après la dernière section : frise horizontale de 6 dates, **la plus
     récente à gauche** (`li.recent`, en rouge). Tout tableau avec des dates : le plus récent en haut.
  7. Analyse `a-analyse`, puis « Dans une copie » `a-copie` à l'intérieur (voir plus bas).
  8. Hors de l'article : « Pour aller plus loin » `a-carte a-plus` (voir plus bas).
  9. `a-fin` : « ← Tous les articles », bouton « Partager l'article » (`partager(this)`), page du pays ou
     de la région « → ».
- **Langue** : éditions de langue **bilingues** (`ap-fr-section` et `ap-<code>-section`, la seconde
  cachée), avec le petit interrupteur de la barre `.a-langues` : deux boutons `ap-lang-btn` « FR » et
  « EN » / « ES » / « DE » (`id="ap-btn-fr"`, `id="ap-btn-<code>"`, `aria-label` avec le nom de la
  langue), et la fonction `setLang` du gabarit, adaptée au code de la langue. Jamais de gros boutons
  « Français / English ». Mondiale : français seulement, un seul bloc, **sans** interrupteur ni section
  cachée.
- **Citation** (`a-citation`) : filet rouge à gauche, taille de lecture, jamais un grand bloc sombre.
  Citation courte dans sa langue d'origine ; dessous `<b>Nom</b>, fonction, source, date`, et dans la
  version française sa traduction en `<span class="a-trad">`.
- **Schémas et images : tous pertinents.** Chaque schéma et chaque photo montre précisément ce que dit
  la section où il est placé : rien de décoratif, rien de « pour remplir ». Sans schéma ou sans photo
  vraiment utile, on n'en met pas.
  - Schémas (`a-schema`, titre `a-schema-t`, source en `a-src`) : `a-etapes` (chaîne d'étapes, par
    exemple établi / estimé / jamais démontré), `a-axe` (positions des acteurs sur un axe), ou un autre
    schéma dans le même style s'il éclaire mieux le sujet (barres, tableau). Données vérifiées et
    sourcées.
  - Photo dans le corps (`a-photo`, en paysage 3:2) : libre de droits (Commons, même méthode que les
    figures d'HGG) ou photo d'un autre article du site, **regardée avant usage**, légende fidèle à ce
    qu'elle montre. Jamais la photo de une une seconde fois.
- **Analyse** (`a-analyse`) : étiquette « L'analyse » (« Analysis »…), titre d'analyse original (jamais
  « Conclusion »), 2 paragraphes sans ton scolaire, en deux colonnes `a-analyse-corps` avec lettrine.
  **Les deux colonnes ont la même hauteur** à 1280, 1440 et 1920 px, dans chaque langue : mesurer avec
  Playwright (bas des lignes de chaque colonne, via `Range.getClientRects`) et, s'il y a une ligne
  d'écart, **ajouter une phrase dans la colonne de gauche ou en supprimer une à droite**. Pas de script
  d'égalisation, pas de retouche d'espacement, de police ni de marge.
- **Dans une copie** (`a-copie`, dans l'analyse, sous les colonnes ; « In an essay », « En una
  redacción », « Im Aufsatz » dans la version étrangère) :
  - « Accroche » (`a-accroche`) : un paragraphe prêt à recopier, qui part d'un fait daté et vérifié de
    l'article et finit sur la question qu'il pose. Pas de bouton « Copier ».
  - « Idée-force » : l'argument que l'article permet de défendre.
  - « Sujets où la placer » : 3 sujets de dissertation plausibles (HGG, culture générale, langue).
  - « Piège à éviter » (`a-piege`, fond rose) : l'erreur de fait ou d'interprétation à ne pas commettre,
    avec le bon chiffre.
  C'est le seul endroit de l'article où le ton scolaire est permis.
- **Pour aller plus loin** (`a-plus`) :
  - « Réviser le cours » (`a-cours`) : le chapitre du site le plus proche du sujet (civilisation, HGG,
    ESH, dossier de culture générale…) avec sa photo (`meta.image` ou héros du chapitre), kicker
    « Réviser le cours · matière · année », titre, sous-titre du chapitre, bouton « Ouvrir le chapitre ».
    Sans chapitre vraiment proche, pas de carte.
  - « Lire aussi » (`a-lire`) : **4 articles** du site, les plus proches du sujet, en vignettes : image de
    l'article, kicker « Pays · Mois année », son `cardTitle` (traduit dans la version étrangère).
  - « Sources » (`a-sources`, numérotées) : média en `<b>`, titre en lien, date. 4 à 6 sources.
- **Longueur** : **1 100 à 1 300 mots de texte courant** (chapô, sections, analyse, hors chiffres,
  schémas, chronologie et « Dans une copie ») dans la version française ; la version étrangère suit
  le même contenu. Compter avant de mettre en ligne. Une recherche web poussée (plusieurs sources par
  article) est nécessaire pour atteindre cette longueur sans rien inventer.
- Dans la liste du mois, l'article passe **en premier**.
- **Renvois vers d'autres articles** : pas de « Lire notre article ». Le lien se met directement sur le
  texte concerné (`<a href="slug.html" class="a-lien">l'attentat de Leipzig</a>`).
- Faits vérifiés par recherche web, sans rien inventer.
- Pas de tiret cadratin « — » dans le texte, même dans les versions étrangères (voir section 1).
- **Contrôles** avec Playwright à 1280 et 390 px, dans chaque langue : aucune erreur JS, pas de
  défilement horizontal, toutes les images chargées (faire défiler la page : elles sont en
  `loading="lazy"`), titre du héros lisible, colonnes de l'analyse égales.

### Image

Enregistrer la photo fournie en WebP sous `actualites/<code>/images/<slug>.webp` (une photo du corps :
`<slug>-<sujet>.webp`), en largeur 1600 px maximum :

```python
from PIL import Image
im = Image.open(src).convert("RGB"); im.thumbnail((1600, 1600)); im.save(dst, "WEBP", quality=86)
```

### Accueil de l'actualité (`actualites/actualites.html`)

« Le kiosque », choisi par le propriétaire sur maquette : fond **noir** (`#0b0b0c`), titre « Actualité », puis
seulement les quatre éditions, chacune en petit journal crème posé de travers (titre de l'édition dans sa langue,
nombre d'articles, la une avec photo, 2 brèves). **Chaque journal entier est un seul lien vers la page d'accueil
de son édition** (`<code>/index-<code>.html` : « Le monde », « English-speaking world »…), sans lien à l'intérieur. Le script lit `ACTU_DATA` de
chaque `tous-<code>.html` : rien à mettre à jour à la main.

### Carte dans les listes

Ajouter l'entrée **en tête** de `ACTU_DATA`, dans `tous-<code>.html` **et** dans la
page pays ou région :

```js
{
  id: '<slug>',
  pays: 'Royaume-Uni', flag: '🇬🇧',
  theme: 'Sécurité', domain: 'securite',
  // pays_filter: 'russie',   // seulement si le tag affiché n'est pas le pays filtré
  cardTitle: '…',
  image: 'images/<slug>.webp',
  externalUrl: 'articles/<slug>.html',
  month: 9, year: 2026
},
```

- Couples `theme`/`domain` existants : Géopolitique/geopolitique, Politique/politique,
  Économie/economie, Social/social, Environnement/environnement, Sécurité/securite,
  Numérique/numerique, Défense/defense, Santé/sante.
- Tag `pays` : le sujet principal. Par exemple, une rencontre entre ministres à l'ONU a
  le tag `pays: 'ONU'`, `flag: '🇺🇳'`.
- **`cardTitle` sur 2 à 3 lignes**, jamais 1 ni 4 : environ **70 à 99 caractères**.
  Vérifier le rendu à 390, 1280, 1440 et 1920 px de large si besoin.

## 4. Cours

### Chapitres

- Chaque matière a sa page d'index, par exemple `deuxieme_annee/maths/index.html`, qui
  liste les chapitres (`chapter-item`).
- Index de 1re année (HGG, maths, ESH, philo, anglais, espagnol, allemand) et de 2e année (HGG, maths, ESH, philo ; pas les langues), et liste des cours d'Humanité (`humanite/cours-humanite/Cours/cours.html`, ligne grisée `.ci-prochain` « Prochain cours bientôt en ligne » à garder en fin de liste) : habillage « atlas
  nocturne » choisi par le propriétaire (`cours-index.css`, `<body class="ci">`, fond noir, titres
  Fraunces, un dessin au trait par matière, une seule liste sans parties ni suivi de lecture, rangée en colonnes : 1, 2, 3… descendent la colonne de gauche, la suite reprend à droite).
  Ajouter un chapitre = copier une ligne `chapter-item` de `.ci-liste` et mettre à jour le compteur
  `.ci-compte`. Sous-titre (`.ci-intro`) : une phrase de présentation de 2 lignes au plus, sans énumérer les cours ni « Les N chapitres… » (modèle : celui de l'HGG). Titre
  sur 2 lignes au plus (`ci-titre long` réduit la taille si besoin). Les cartes « fiche du jour » /
  « texte du jour » (`colles-card`) sont une pastille d'une ligne dans l'en-tête et gardent leur balisage.
  Index d'HGG (1re et 2e année), d'ESH (1re année) et de philo (1re et 2e année) : liste à vignettes (`body.ci-vignettes`,
  `.ci-vig`) : chaque ligne montre une vignette (`vignettes/chapitre-N.webp`, 360 px, WebP), à créer pour tout nouveau
  chapitre : l'image du héros en HGG, une photo ou un tableau libre de droits (Commons) qui évoque le chapitre en ESH et en philo.
  Maths et langues gardent le repère numéroté (choix du propriétaire).
- Un nouveau chapitre reprend la page du chapitre précédent. Par exemple
  `deuxieme_annee/maths/chapitre1.html` : palette sarcelle, titre du héros sur
  **2 lignes maximum** sur ordinateur.

### Figures des chapitres d'HGG (photos, graphiques, schémas)

- Même système que les chapitres 2 et 4 de 1re année et le chapitre 1 de 2e année
  (`<figure class="hgg-fig …">`, CSS « kit figures » déjà présent dans ces pages).
- **Photos toujours en paysage**, jamais verticales : source en paysage et cadre `r32`,
  `r43`, `r169` ou `r219` (jamais `r45` ni `r11`).
- Photos **toujours en couleur**, sans effet de grisé ni de transition au survol.
- Photos **stockées sur le site** en WebP dans le dossier `images/` du chapitre,
  1600 px maximum, avec `data-commons="<nom du fichier Commons>"` en secours.
- Téléchargement depuis Wikimedia : passer par les vignettes
  `https://upload.wikimedia.org/wikipedia/commons/thumb/<h0>/<h0h1>/<nom>/1280px-<nom>`
  (h = md5 du nom de fichier avec des `_`), en essayant aussi 960px. Les originaux et
  `Special:FilePath` renvoient souvent l'erreur 429. Espacer les requêtes.
- **Regarder chaque photo** avant de l'utiliser, et écrire la légende d'après ce qu'elle
  montre vraiment.
- Une photo fournie par le propriétaire (par exemple Tuca Vieira pour Paraisópolis)
  passe avant toute photo Commons.
- Graphiques et schémas : SVG en ligne dans `fig-frame fig-schema`, aux couleurs du
  chapitre, avec des données vérifiées et leur source dans la légende.

### Colles de maths

- Elles vivent à part, dans `deuxieme_annee/maths/colles/`, jamais dans la liste des
  chapitres.
  - `index.html` : grille de cartes (`colle-card`). Une colle pas encore faite =
    carte `a-venir` « Bientôt disponible ».
  - `colleN.html` : page d'une colle, avec 2 PDF dans `colles/pdf/` :
    `colleN-questions-de-cours.pdf` et `colleN-exercices-traites.pdf`.
    Ils doivent être clairs et concis.
    Traiter **uniquement** ce que demande le programme de colle (questions et exercices
    listés), sans exercice, matrice ou question bonus en plus, même si le poly en contient.
    En tête des PDF, sous le titre : seulement le thème de la colle (pas de « — énoncés à
    connaître… » ni « — solutions rédigées… »).
    Matrice de passage (et matrice d'une application linéaire) disposée comme dans le cours,
    sans barres verticales : parenthèses vides, vecteurs de la nouvelle base au-dessus
    (e'_1 ⋯ e'_n), vecteurs de l'ancienne base à droite (e_1 ⋮ e_n).
    Une couleur par colle, jamais deux fois la même ni un autre bleu : 1 vert, 2 bordeaux,
    3 sarcelle, 4 prune, 5 terre cuite.
  - Mettre à jour la carte « Colle de la semaine » de `deuxieme_annee/maths/index.html`.

### Index des cours (`cours-ecg.html`)

- Habillage « atlas nocturne » des index de matières, choisi par le propriétaire sur maquette : héros (titre,
  sous-titre de **2 lignes au plus**, dessin au trait à droite : un livre ouvert aux marque-pages des couleurs des
  matières ; **pas de légende de couleurs**), les deux années côte à côte, **sans compteur ni mention sous le nom de
  l'année** (une ligne cliquable par matière, à sa couleur), derniers chapitres, accès aux flashcards.
  **Pas de section « Aujourd'hui »** (retirée à la demande du propriétaire).
- **Langues** : une seule ligne par année, sans pastilles de langue ; elle mène à la page de choix de la langue,
  `premiere_annee/langues/index.html` (grammaire) ou `deuxieme_annee/langues/index.html` (civilisation), même
  habillage avec un dessin à droite du titre (bulles « Hello / Hola / Hallo » en 1re année, valise et trois étiquettes de bagage
  EN / ES / DE en 2e), une ligne par langue vers son index (`<langue>/index.html`).
- Rien à y mettre à jour : les scripts lisent le `.ci-compte` et le `.ci-titre` de chaque index de matière (et,
  pour les langues, les leçons de 1re année et le nombre de pays `.ix-pays-tete` de 2e année) et `nouveautes.js`.
  Une nouvelle matière s'ajoute en copiant une ligne `.matiere`, une nouvelle langue en copiant une ligne `.langue`.

### Index de l'Humanité (`humanite.html`)

- Habillage « cabinet clair » choisi par le propriétaire sur maquette (fond papier, Bricolage Grotesque et
  Newsreader, accent rouge brique) : héros + « Votre parcours », 01 le cours, 02 les auteurs, 03 les œuvres,
  04 entrer par une notion, 05 dernières fiches.
- Rien à y mettre à jour quand une fiche s'ajoute : le script de la page lit les tableaux `OEUVRES` des index
  Littérature, Cinéma et Art, la frise de `fiches-auteurs.html` et `nouveautes.js`. Seuls restent écrits à la
  main : la carte du cours (nouveau cours) et les totaux « 8 œuvres d'art » et « 6 musiques ».

### Index de la culture générale (`culture-generale.html`)

- Habillage « Les archives », choisi par le propriétaire sur maquette (papier kraft `#e6dcc3`, Fraunces + IBM Plex
  Mono, tampon rouge `#8a3324`, comme les dossiers) : page de garde + recherche, le dernier dossier versé en
  chemise ouverte, puis **le registre de tous les dossiers** (vignette, n°, intitulé, classé sous ; onglets de
  thème et recherche). Pas de « tiroirs » par thème (refusés par le propriétaire).
- Tout vient de `CG_DATA` (même format qu'avant, lu aussi par `auth.js`, `outils/nouveautes.py` et la
  newsletter) : un nouveau dossier s'ajoute **à la fin** de `CG_DATA`, rien d'autre. Les lignes gardent
  `.actu-card` / `.actu-card-title` (badge Premium, étoile des favoris).

### Fiches de l'Humanité (cinéma, littérature)

- Mise en page commune (`humanite/cinema/`, `humanite/litterature/`) : bandeau compact, bande
  « En bref » (réalisateur ou auteur, année, genre) avec le plan en pastilles, puis le texte.
  Une nouvelle fiche reprend une fiche existante (`blade-runner.html`, `1984.html`).
- **Affiche / couverture** : `python3 outils/fiche-visuel.py <page> <image>`. Le script crée le
  WebP dans `images/` de la rubrique et ajoute le visuel et le fond flou. **Pas de légende** sous
  l'image. Sans visuel, le bandeau reste en texte seul.

### Fiches auteurs (Cours Humanité)

- `humanite/cours-humanite/Fiches auteurs/` : index `fiches-auteurs.html`, une **frise des siècles**
  choisie par le propriétaire sur maquette : une ligne `<li class="auteur-card" data-nait data-mort>`
  par auteur, **dans l'ordre des naissances** (auteur vivant : `data-mort=""`), **numérotée dans cet ordre
  chronologique** (01 = le plus ancien), avec sa présentation
  `.fr-detail` (nom complet, époque, thèse en une phrase, œuvre de référence) qui s'ouvre au clic. Le
  script de la page place seul les époques, les années et les barres : ajouter un auteur = copier un `<li>`
  au bon endroit, rien d'autre (les époques d'avant 1450 sont resserrées). Une fiche faite : ajouter
  `dispo`, `data-slug="<slug>"` et les deux couleurs de l'auteur (`style="--accent:…;--accent2:…"`, les mêmes
  que sur le `<body>` de sa fiche) au `<li>`, remplacer `.fr-initiale` par le portrait
  (`<img class="fr-visuel" src="images/<slug>.webp" …>`) et « Fiche à venir » par le lien
  `<a class="fr-bouton" href="<slug>.html">` + durée, comme pour Rousseau. **Aucun auteur n'est ouvert à
  l'arrivée sur la page** (pas d'ouverture d'office). Titre « Fiches auteurs » tout en noir. Les numéros sont recalculés par le script ;
  après une insertion, corriger aussi ceux écrits dans la page (`.fr-num`, `N° …` de `.fr-meta`) et le
  « Fiche auteur n° » des fiches déjà faites (`grep -n 'f-num' *.html`). Demande type : « Fais la fiche auteur de Kant ».
- Une fiche = `<slug>.html`, copiée de `rousseau.html` (n° = rang chronologique dans la frise). Gabarit repris de
  l'HGG au quotidien mais habillé « sauge et prune », choisi par le propriétaire sur maquette : fond sauge
  pâle sans quadrillage, coins arrondis, numéros de section en
  pastilles, nom de l'auteur dans la couleur de la fiche, **sans italique**. **Chaque auteur a ses deux couleurs**
  (`--accent`, `--accent2` sur `<body>`, jamais déjà prises) : Rousseau prune `#6b2d5c` / olive `#55702f`,
  Hobbes bleu ardoise `#1f4a6e` / ocre `#a35a1f`. Garder cet habillage pour toutes les fiches (`auteur.css`,
  `auteur.js` ; fiches lues dans `localStorage` `ecg-humanite-auteurs-lues`). Supprimer de la copie les balises `og:`,
  `twitter:`, `canonical` et réécrire la description.
- Structure : cartouche (portrait en paysage et fiche d'identité **courte**, 4 lignes : naissance, mort,
  œuvres clés, concepts, valeurs brèves qui tiennent si possible sur une ligne (titres sans dates) ; définition
  d'environ 5 lignes à 1280 px, pour que le texte de gauche et la fiche d'identité aient des hauteurs proches ; pas de lieux et dates sous le titre ; vidéo `.f-video` sous la définition si le
  propriétaire en donne une, adresse courte `https://youtu.be/<id>`, aussi en tête des sources ; WebP dans `images/`), 01 L'essentiel, 02 Comprendre (mots expliqués au survol), 03 « <Auteur> et
  l'humanité », 04 Avec et contre l'auteur, 05 Dans une copie, 06 Plus loin + sources. **Pas de schéma** ni de
  section « citations à placer ».
- « <Auteur> et l'humanité » (`.f-args`) : 8 questions du thème de l'Humanité, et pour chacune **seulement**
  « L'argument » (un paragraphe prêt à mettre dans la copie : la thèse de l'auteur, expliquée, avec ses
  citations et la référence de l'œuvre) et « Comment l'interpréter » (1 ou 2 phrases). Rien d'autre :
  le propriétaire veut du concret, sans étapes, onglets ni encadrés en plus.
- **Citations vérifiées mot pour mot sur le texte original** (Wikisource), jamais de mémoire.

### Les langues au quotidien (1re année) : anglais, espagnol, allemand

Un « coin » de pratique par matière, comme les colles de maths de 2e année : pour chaque langue,
`premiere_annee/langues/<langue>/quotidien/`, un texte d'actualité par jour, décortiqué pour
travailler surtout la grammaire de 1re année. Demandes types : « Fais le texte du jour d'anglais »,
« … d'espagnol », « … d'allemand ».

| Langue | Dossier | Édition source (articles, images) | Section de l'article | Leçons |
|---|---|---|---|---|
| Anglais | `premiere_annee/langues/anglais/quotidien/` | `actualites/en/` (`tous-en.html`) | `ap-en-section` | `premiere_annee/langues/anglais/lecon<N>.html` |
| Espagnol | `premiere_annee/langues/espagnol/quotidien/` | `actualites/es/` (`tous-es.html`) | `ap-es-section` | `premiere_annee/langues/espagnol/lecon<N>.html` |
| Allemand | `premiere_annee/langues/allemand/quotidien/` | `actualites/de/` (`tous-de.html`) | `ap-de-section` | `premiere_annee/langues/allemand/lecon<N>.html` (ancres génériques `s1`…`s7`, `formation`, `structures`… : se fier au titre de la section, pas au nom de l'ancre) |

- Code commun : `premiere_annee/langues/commun/quotidien.js` et `quotidien.css` (la langue se lit
  dans l'adresse ; titres des leçons et sens des cartes dans `LANGUES`) ; cartes :
  `premiere_annee/langues/flashcards/cartes.js` et `cartes.css` (module « Mémoriser » de la page du jour). Nouvelle langue : l'ajouter à
  `LANGUES` de `quotidien.js` et à `LANGUES` de `outils/flashcards.py`, copier l'index d'une
  langue existante, ajouter le bouton et la carte « Le texte du jour » à l'index de la langue.
- Dans les données, les champs `en` désignent toujours **la langue étudiée** (mot, phrase de
  version, traduction du thème), quelle que soit la langue.
- Habillage « noir et gris », choisi par le propriétaire sur maquette (`quotidien.css`, un seul accent
  bleu, pas de marron ni de doré, pas de fond clair) : index = titre + compteurs, grande carte « texte du jour »
  (photo en 3:2, titre, bouton ; **pas de sous-titre ni de liste d'étapes**), liste des jours à gauche, calendrier du mois + série de jours de
  suite + record à droite (`<aside id="cote">`, rempli par `quotidien.js`) ; page du jour = hero (texte + photo),
  puis une colonne : texte, grammaire en pastilles (un point à la fois), vocabulaire, traduction (énoncé à gauche,
  réponse à droite), bilan. **Pas de sommaire latéral.** Le hero montre la photo de l'article : champ `image` du bloc
  de données (`../../../../actualites/<code>/images/<fichier>`, la même que la carte `.une`).
  `index.html` : la carte « Le texte du jour » (`.une` : image, « Jour N · <jour> <date> », titre)
  et la grille `jours-grid` (le nouveau jour **en tête**, avec `data-date` ; la carte « Demain »
  et les compteurs « jours terminés » / « mots à revoir » sont ajoutés par `quotidien.js`).
  **Pas de puces ni de texte qui résume la grammaire du jour** (index, cartes, en-tête du jour).
  Pas d'italique dans l'index ; dans la page du jour, les mots étrangers (`<em>`) restent en italique.
- `jour-AAAA-MM-JJ.html` : une page par jour, construite par `quotidien.js` à partir du bloc
  `<script id="donnees">`. **Pas de sommaire** (barre des étapes Lire / Grammaire / …) sous le
  héros. Seul le jour le plus récent (carte `.une` de l'index) est gratuit ; les précédents
  passent Premium automatiquement (voir section 1).
- Le compteur « mots à revoir » de l'index mène au paquet de la langue dans l'**espace flashcards**
  (`flashcards/index.html#<langue>`, voir « Espace flashcards » plus bas) : toutes les cartes de tous
  les jours. `python3 outils/flashcards.py` est à lancer à chaque nouveau jour (voir « Mise en ligne »).
  Paquet « À revoir » : `localStorage` `ecg-<langue>-quotidien-a-revoir`, commun à la page du jour et
  à l'espace (une carte ratée y entre, une carte sue en sort).

**Procédure d'un nouveau jour**, pour une langue (demande ci-dessus, ou routine automatique tous
les jours à 0 h, heure de Paris, qui fait l'anglais, puis l'espagnol, puis l'allemand), sans poser de question
jusqu'à la mise en ligne :
1. Date = date du jour à Paris : `TZ=Europe/Paris date +%F`. Si `jour-<date>.html` existe déjà
   pour cette langue, passer : rien à faire.
2. Article : le premier de `ACTU_DATA` de l'édition source (tableau ci-dessus) qui n'a pas encore
   servi (`grep -ho 'actualites/<code>/articles/[^"]*' premiere_annee/langues/<langue>/quotidien/jour-*.html`).
   S'il n'y a aucun nouvel article, prendre le plus récent qui n'a pas servi, même plus ancien.
3. Numéro = numéro du dernier jour + 1. Copier la page du dernier jour, réécrire `<title>`, le champ `image` (photo de l’article choisi),
   description, « Jour N » du fil d'Ariane et tout le bloc de données (règles ci-dessous).
   **Supprimer de la copie les balises `og:`, `twitter:` et `canonical`** de la veille : les
   scripts de l'étape 5 les recréent pour la nouvelle page.
4. `index.html` de la langue : la carte `.une` pointe sur le nouveau jour (lien, image de
   l'article `../../../../actualites/<code>/images/<image>` et un `aria-label` qui décrit ce que la
   photo montre vraiment, « Jour N · <Jour> <date> », titre) ; nouvelle carte en tête de
   `jours-grid`. Carte « Le texte du jour » de `premiere_annee/langues/<langue>/index.html` mise à jour.
5. Scripts de la mise en ligne (étape 0, dont `outils/flashcards.py`), puis
   `python3 outils/quotidien-controle.py premiere_annee/langues/<langue>/quotidien/jour-<date>.html` :
   corriger jusqu'à ce que tout soit ✅.
6. Mise en ligne complète (commit, PR, merge, branche remise sur `main`).

Contenu d'un jour (le bloc de données du 10 octobre 2026 sert de modèle) :
- **Texte** : l'article choisi à l'étape 2, dans la langue étudiée (section du tableau). Extrait
  de 250 à 350 mots en 4 à 6 paragraphes, légèrement adapté pour qu'il se lise seul. Balises :
  `[n|…]` = repère du point de grammaire n (dans l'ordre du texte ; un même n peut revenir),
  `{mot|traduction}` = aide au vocabulaire (8 à 15 mots).
- **Grammaire** : 5 ou 6 cartes, une par repère : titre, citation (forme en `<mark>`), rappel
  court, piège du francophone, leçon et ancre (`lecon` + `ancre` = `id` d'une `<section>` de
  `../lecon<N>.html`). **Pas d'exercice** (choix du propriétaire : `quotidien.js` n'affiche plus les
  `exercice` des anciens jours, ne pas en écrire). Une carte qui traite deux points renvoie vers deux sections avec
  `liens: [{ lecon, ancre, libelle }, …]`. Puis `aussi` (« Et aussi dans le texte ») : 4 à 8 points courts, **une ligne
  chacune**, groupés par catégorie (`cat` : constructions verbales, noms et articles,
  comparaison, dates et chiffres, liens logiques…), avec l'extrait (`ext`, forme en `<mark>`),
  la règle en une phrase (`regle`), un exemple court (`ex`) et la leçon. Seulement des leçons
  de 1re année, rien d'inventé hors du texte.
- **Chaque renvoi doit tomber juste** : avant de lier une section, vérifier (grep) qu'elle traite
  vraiment le point annoncé. Si aucune leçon ne le traite, ajouter dans la section où il a sa
  place un court encadré `hl-box` (`tip` ou `info`), dans le style de la leçon, puis y lier.
- **Vocabulaire** : 12 à 14 « essentiels » réutilisables dans n'importe quelle copie (verbes de
  presse, connecteurs, tournures), 12 à 18 mots du thème, chacun avec un exemple. **Nombre pair
  dans chaque liste** (affichée sur deux colonnes : pas de case vide). Pas
  d'exercice à trous : `quotidien.js` en tire le module « Mémoriser », des cartes
  **français → langue étudiée** seulement. Les cartes ratées vont dans le paquet « À revoir », gardé
  dans le navigateur d'un jour à l'autre.
- **Traduction** : version de 3 phrases du texte, thème de **3 phrases** construites avec les
  mots du vocabulaire du jour et la grammaire étudiée (**pas d'indice** pour le thème : champ `indice` non affiché),
  chacune avec traduction proposée et 2 ou 3 remarques.
- **Durées** : une par étape dans `DUREES` (`quotidien.js`) ; le total en tête est leur somme
  (30 min, chiffre rond à garder).
- **Chapeau** (`chapo`) : une phrase qui dit le sujet, sans annoncer la grammaire.
- **Bilan** : 4 ou 5 phrases, sans liens vers les leçons (ils sont déjà dans la grammaire).
- Pas de questions de compréhension.
- Vérifier avec `outils/quotidien-controle.py` (aucune erreur JS, listes à jour, renvois valides…). Typographie française gérée par `quotidien.js` pour les champs en français.

### L'HGG au quotidien (fiches du jour)

Un espace de **1re année seulement** : `premiere_annee/hgg/quotidien/`, accessible par le bouton et la
carte « La fiche du jour » de `premiere_annee/hgg/index.html` (rien dans l'index HGG de 2e année). Chaque jour, une fiche développée
et illustrée sur un **lieu**, une **notion**, un **auteur**, un **ouvrage** ou un **événement**.
Demande type : « Fais la fiche HGG du jour sur … ».

- Fichiers communs : `fiche.css` (gabarit « planche d'atlas », papier clair) et `fiche.js` (cartes à
  onglets et repères cliquables, bouton « J'ai lu cette fiche » gardé dans
  `localStorage` `ecg-hgg-quotidien-lues`). Ne pas les réécrire pour une fiche : les compléter si besoin.
- Une fiche = `<slug>.html` (ex. `detroit-d-ormuz.html`), copiée de la dernière fiche. Sur `<body>` :
  `data-type="Lieu|Notion|Auteur|Ouvrage|Événement"` et la couleur propre de la fiche
  (`--accent`, `--accent2`, différentes d'une fiche à l'autre). `<title>` :
  `ECG Prépa — <Titre> · HGG au quotidien`. Supprimer de la copie les balises `og:`, `twitter:`,
  `canonical` et réécrire la description.
- Structure (garder l'ordre, adapter le contenu au type) : cartouche (n°, type, date, durée, titre,
  coordonnées ou dates, définition en 2 phrases, « Fiche d'identité » ; **pas** de « Au programme »),
  **pas** de sommaire sous le cartouche, puis 01 L'essentiel (3 idées), 02 Carte ou schéma commenté (repères numérotés
  cliquables ; pour un auteur ou une notion : schéma SVG, carte des lieux liés ou document). Un schéma
  **seulement s'il est pertinent** pour le sujet (sinon pas de section 02, et les suivantes sont
  renumérotées). **Deux** cartes ou schémas (avec onglets) seulement quand le sujet s'y prête vraiment,
  comme pour le détroit d'Ormuz (le détroit, puis la région) ; sinon un seul, quitte à l'enrichir (ex. le
  smart power ajouté aux ressources de la puissance). Pas de formule ni de texte annexe sous le dessin ;
  03 Comprendre (4 à 5 parties sur une colonne, **sans** plan latéral, avec citation et encadrés),
  04 Les chiffres (4 chiffres sourcés + 2 ou 3 graphiques SVG), 05 Qui veut quoi ? (acteurs) ou
  équivalent (débats, héritiers, critiques), 06 Dans une copie (accroche, idée-force, sujets,
  références, erreurs à éviter ; les deux colonnes finissent alignées en bas, le CSS allonge le
  dernier cadre de chacune, mais équilibrer aussi le contenu, par exemple en ajoutant un sujet), 07 Plus loin (liens du site + sources), puis une fin de page sobre `.f-fin` (« ← Toutes les fiches » et bouton « J'ai lu cette fiche », pas de bandeau sombre ni de texte « Demain… »). **Pas** de frise, de
  glossaire (« Les mots pour le dire ») ni de quiz (« Testez-vous »).
- **Vidéo** (si le propriétaire en donne une) : lien `.f-video` sous la définition du cartouche
  (« En vidéo », titre exact de la vidéo, chaîne), adresse courte sans paramètre de suivi
  (`https://youtu.be/<id>`), et la même vidéo en tête des sources (07).
- **Mots expliqués au survol** dans « Comprendre » : chaque mot, lieu, personnage, sigle ou notion
  un peu difficile (première occurrence seulement, 40 à 50 par fiche) est balisé
  `<span class="gl" tabindex="0" data-def="…">mot</span>`. La définition fait une ou deux phrases
  vérifiées, sans tiret cadratin ; `fiche.js` affiche la bulle (survol, clavier, toucher sur mobile).
- Titres **sans italique**, jamais `<em>`. Titre d'une fiche : la fin garde la couleur de la fiche
  avec `<span class="ac">` (ex. « Le détroit <span class="ac">d'Ormuz</span> »). Titre de l'index
  (« L'HGG au quotidien ») : tout en noir.
- Durée affichée (cartouche et carte de l'index) : 10 min.
- Cartouche centré verticalement face à la « Fiche d'identité » ; texte de « Comprendre » en une
  colonne centrée dans la page ; citations en taille modeste (style `f-citation` tel quel).
- Faits vérifiés par recherche web, chiffres datés et sourcés, rien d'inventé ; sources listées en 07.
  Attribuer chaque notion à son véritable auteur (ex. smart power : Suzanne Nossel, 2004, reprise par Nye).
- Accroche de « Dans une copie » : un fait ou un chiffre actuel et vérifié qui pose la question du sujet,
  plutôt qu'une anecdote célèbre mais attribuée de seconde main.
- Illustrations : images libres de droits stockées en WebP dans `images/` (1600 px maximum), par
  exemple les vues satellite NASA Worldview (`wvs.earthdata.nasa.gov/api/v1/snapshot`, couche
  `MODIS_Terra_CorrectedReflectance_TrueColor` ou `BlueMarble_ShadedRelief_Bathymetry`, projection
  EPSG:4326 : les repères SVG se placent alors par simple règle de trois sur la longitude et la
  latitude). Regarder chaque image avant de l'utiliser, vérifier la place des repères en capture.
- Seule la fiche la plus récente (carte `.i-une` de l'index) est gratuite ; les précédentes passent
  Premium automatiquement (voir section 1).
- `index.html` : carte `.i-une` sur la nouvelle fiche, nouvelle carte `.i-fiche` (avec `data-slug` et
  `data-date`) **en tête** de `.i-grille`, compteur `0 / N` mis à jour. Carte « La fiche du jour »
  de l'index HGG de 1re année mise à jour.
- « Plus loin », sur ECG Prépa : **5 ou 6 liens au maximum**, seulement les plus pertinents, chercher dans les chapitres
  d'HGG des **deux années** (ex. 2e année, chapitre 2 sur les États-Unis, pour la puissance) et dans les
  dossiers de culture générale (`grep -il <mot> Culture-Generale/*.html`) ; jamais de lien de remplissage.
  **Un même chapitre n'apparaît qu'une fois** : choisir sa section la plus proche du sujet.
- Liens vers les chapitres : vérifier (grep) que la section `id` visée traite bien le sujet.
- Vérifier à 390 et 1280 px (pas de défilement horizontal, aucune erreur JS), puis mise en ligne.
  Les fiches **n'apparaissent pas** dans les nouveautés (`outils/nouveautes.py` les ignore).

**Sujets à venir** : `outils/hgg-quotidien-sujets.json`, une entrée par date (`date`, `sujet`, `type`,
`video`, `video_titre`, `video_chaine`, `consignes`, puis `fiche` = nom du fichier une fois faite). Quand le propriétaire donne un
sujet à l'avance (« Sujet HGG de demain : … », « le 14 : … »), l'ajouter à ce fichier (date de Paris)
et mettre en ligne tout de suite : la routine de minuit le lira.

**Procédure d'une nouvelle fiche** (routine automatique tous les jours à 0 h, heure de Paris, ou
demande directe), sans poser de question jusqu'à la mise en ligne :
1. Date = `TZ=Europe/Paris date +%F`. Sujet = entrée de cette date dans `outils/hgg-quotidien-sujets.json`.
   S'il n'y en a pas, ou si l'index a déjà une fiche `data-date` à cette date : ne rien faire.
2. Recherches web poussées (plusieurs sources, chiffres datés, rien d'inventé). Type = champ `type`,
   sinon le déduire (Lieu, Notion, Auteur, Ouvrage, Événement).
3. Copier la dernière fiche en `<slug>.html` et tout réécrire selon les règles ci-dessus : n° = dernier
   + 1, date, type, durée 10 min, nouvelle couleur (`--accent`/`--accent2` jamais déjà prises), titre,
   cartouche, sections 01 à 07, 40 à 50 mots expliqués au survol, vidéo si `video` est rempli, sources.
   Supprimer les balises `og:`, `twitter:`, `canonical` et réécrire la description.
4. Illustrations regardées une à une ; repères des cartes vérifiés en capture.
5. `index.html` de l'espace (carte `.i-une`, nouvelle carte en tête de `.i-grille`, compteur `0 / N`) et
   carte « La fiche du jour » de `premiere_annee/hgg/index.html`. Remplir `fiche` dans l'entrée du jour.
6. Contrôles Playwright à 390 et 1280 px : aucune erreur JS, pas de défilement horizontal, bulles qui
   s'ouvrent, cadres de « Dans une copie » alignés en bas, aucun tiret cadratin hors `<title>`.
7. Mise en ligne complète (section 2). La routine des langues tourne à la même heure : juste avant le
   commit, repartir du `main` le plus récent ; en cas de conflit sur un fichier généré (`sitemap.xml`,
   `nouveautes.js`, `outils/nouveautes-dates.json`), reprendre la version de `main` et relancer les scripts.

### Cours de civilisation (langues, 2e année) : gabarit « Manuel »

Les cours de civilisation (`deuxieme_annee/langues/<langue>/<pays>/civi-*.html`) passent un à un du vieux
gabarit sombre (« TEMPLATE UNIVERSEL v1 ») au gabarit clair « Manuel », choisi par le propriétaire. Déjà
faits : Royaume-Uni chapitres 1 (histoire), 2 (système politique) et 3 (Brexit) : s'en inspirer. Demande type :
« Fais le chapitre sur … » + lien de la vidéo.

- **Code commun** : `deuxieme_annee/langues/commun/civilisation.css` et `civilisation.js` (rendu du bloc
  `COURS`, bouton FR / langue étudiée). Ne pas les réécrire pour un chapitre : les compléter si besoin
  (tous les chapitres refaits en profitent). La page d'un chapitre = copie de `civi-uk-2.html` (`<html
  data-langue="anglais|espagnol|allemand">` donne les couleurs, barre avec fil d'Ariane centré, `<div
  id="cours">`, bloc `<script id="donnees">`). La nouvelle page **remplace l'ancienne sous le même nom** et
  garde ses balises `og:`, `twitter:`, description et canonical. Le texte de l'ancien cours sert de base.
- **Vidéo** : chaque chapitre a sa vidéo, donnée par le propriétaire avec la demande. Lien `meta.video`
  dans le héros : adresse courte `https://youtu.be/<id>` (sans `?si=`, `?is=` ni autre paramètre), titre
  exact et chaîne lus avec `curl -s "https://www.youtube.com/oembed?url=https://youtu.be/<id>&format=json"`,
  et la même vidéo **en tête des sources** de « Pour aller plus loin ». Si aucun lien n'est donné, le
  demander au propriétaire dans la réponse (et l'ajouter dès qu'il arrive).
- **Structure** : héros (label, titre de 2 lignes au plus, sous-titre, lien vidéo, photo `meta.image` avec
  légende, sans source affichée) ; « L'essentiel » + 4 chiffres ; les parties ; le
  lexique (**nombre pair** d'entrées, deux colonnes) ; « Pour aller plus loin » (`plusLoin` : « Sur ECG
  Prépa », 5 ou 6 liens vers d'autres chapitres et des articles d'actualité, et « Sources », avec les
  crédits des photos). **Pas** de chronologie latérale, d'acteurs clés, de débat, de sujets de dissertation,
  d'« À retenir », de sommaire, de barre de recherche dans le lexique ni de fiche de synthèse.
- **Blocs** : `p`, `encadre` (notion clé, analyse), `citation`, `def`, `liste`, `tableau`, `stats`, `tl`,
  `image`, `images` (deux photos côte à côte), `schema` (SVG en ligne), `graphique` (barres empilées),
  `comparaison` (deux barres par ligne, ex. voix et sièges), `periodes` (frise de durées), `echelle`.
  **Pas de cases de faits** (`faits` : « Chef de l'État / Financement… ») : les transformer en paragraphe
  explicatif.
- **Photos** (6 à 9 par chapitre) : même méthode que les figures d'HGG (Wikimedia Commons, vignettes 1280
  ou 960 px, requêtes espacées, **chaque photo regardée**, légende fidèle à ce qu'elle montre), ou photo d'un
  article du site. Toujours en paysage (recadrer en 3:2 avec PIL si besoin), WebP dans `images/` du pays,
  nommée `<prefixe-du-chapitre>-<sujet>.webp`. Champs : `titre` (court, ex. « La Chambre des lords »),
  `legende`, `alt`, `format` (`droite` ou `gauche`). **Ni crédit ni licence sous la photo** : auteurs et
  licences vont dans « Sources ». Les photos flottent **dans le texte**, qui les entoure puis continue
  dessous ; `avec: 2` centre la photo face aux 2 paragraphes suivants, **seulement** quand ils ont à peu près
  sa hauteur. Les encadrés, schémas et graphiques passent en pleine largeur sous les photos.
- **Aucun blanc** autour d'une photo : mesurer avec Playwright, pour chaque photo flottante, l'écart entre le
  bas de la photo et le bas du texte qui l'entoure avant le bloc suivant (il doit être négatif ou quasi nul),
  et déplacer la photo (avant un autre paragraphe) sinon.
- **Schémas et graphiques** : 2 à 4 par chapitre quand le sujet s'y prête (institutions, étapes, frise de
  mandats ou de dynasties, résultats électoraux…), couleurs `var(--c1)`…`var(--c4)`, données vérifiées et
  source dans la légende, et **toujours un paragraphe qui l'introduit** juste avant.
- **Contenu** : relire tout le texte, corriger les chiffres faux ou datés, **actualiser jusqu'à la date du
  jour** par recherche web (élections, lois, nominations, débats récents) et proposer ces ajouts dans la
  réponse ; rien d'inventé ; version anglaise (ou espagnole, allemande) au même niveau. Liens vers les
  articles du site posés directement sur le texte.
- **Tiret cadratin « — » banni, sans exception** dans ces pages : texte français et étranger, titres,
  encadrés, légendes, lexique, sources et `<title>` (écrire « Le Brexit · Civilisation anglophone »). Le
  vieux cours en contient beaucoup : les remplacer un par un selon le sens (deux-points, virgule,
  parenthèses quand ils vont par paire, nouvelle phrase). Vérifier avant la mise en ligne :
  `grep -c '—' <page>` doit donner 0.
- Contrôles à 1280 et 390 px (aucune erreur JS, pas de défilement horizontal, images chargées, liens
  valides, titre du héros sur 2 lignes au plus), puis mise en ligne complète.

### Espace flashcards

Une application de flashcards à la racine : `flashcards/index.html` (`flashcards.js`, `flashcards.css`),
ouverte par « Mes flashcards » dans le menu du compte (`auth.js`, avec la pastille des cartes à réviser
du jour). L'ancienne adresse `premiere_annee/langues/flashcards/index.html` renvoie vers elle (ancre gardée).

- **Mes paquets** : paquets de la bibliothèque ajoutés par l'élève et paquets perso (cartes créées une à
  une, liste importée : tabulation, `;` ou `|`, copie d'un paquet tout fait). Une carte d'un paquet tout
  fait peut être ignorée. Révision espacée façon Anki (À revoir / Difficile / Bien / Facile, étapes de 1 et
  10 min puis intervalles en jours, 20 nouvelles cartes par jour et par paquet par défaut), entraînement
  libre, sens inversable et réponse tapée pour le vocabulaire, parties ou jours à cocher, export Anki /
  Quizlet, sauvegarde et restauration en fichier. Données dans `localStorage`
  `ecg-flashcards:v1:<e-mail>`.
- **Bibliothèque** : générée par `python3 outils/flashcards.py` dans `flashcards/donnees/` (`catalogue.js`
  + un fichier par paquet, chargé à la demande ; ne jamais les modifier à la main). Il lit le vocabulaire
  des pages du jour de langues (un paquet par langue, une partie par jour) et le tableau `const DECK`
  (+ `const PARTS`) de toute page de `premiere_annee/`, `deuxieme_annee/` et `humanite/` (cartes
  « prêtes à l'emploi » des chapitres d'HGG et du cours d'Humanité). Un chapitre d'ESH, de maths ou de
  philo qui reçoit un `DECK` (même format : `[partie, rubrique, question, réponse]`) entre seul dans la
  bibliothèque ; ces matières y sont affichées « Bientôt » tant qu'elles n'en ont pas. Les cartes perso
  créées dans un chapitre (« + Ma carte ») rejoignent le paquet du chapitre.
- `donnees/catalogue.js` est chargé avec `?v=<minute>` ; les fichiers de paquet avec l'empreinte de
  leur contenu (`?v=<v du catalogue>`), qui change à chaque modification (voir la section 2).

### Dossiers de langues (DS)

- Page type `deuxieme_annee/langues/anglais/DS/ang-dsN.html` : seul le bloc
  `<script id="donnees">` en bas change.
- Garder **la numérotation du propriétaire**, pas celle du cours.
- Réorganiser le cours s'il est long.
- Cartes de synthèse : **3 maximum**, texte court (2 lignes max).
- Acteurs clés : **6 maximum**.
- Ajouter la carte correspondante dans l'index de la langue.

## 5. Newsletters PDF

Une page A4, style journal, au format PDF. Tout se joue dans `newsletter/`.

### Fichiers

| Fichier | Rôle |
|---|---|
| `newsletter/gabarit-newsletter.html` | le gabarit figé : **le `<style>` ne se réécrit jamais** |
| `newsletter/outils/preparer.py` | prépare le JSON de départ de la semaine (une, brèves, images, liens, dates) |
| `newsletter/outils/remplir.py` | remplit le gabarit depuis un JSON de contenu (champs, images, encadré, typo, « Le chiffre » traduit) |
| `newsletter/outils/controle.py` | vérifie toutes les règles de mise en page, avec une ligne ✅/❌ par règle et la correction à faire |
| `newsletter/outils/exemples/` | JSON de numéros réels : `mondiale-…` (mot du numéro), `hispanophone-…-fr/es` (vocabulaire) |
| `newsletter/outils/installer.sh` | installe playwright/pypdf/pillow ; lancé automatiquement au début de chaque session (`.claude/settings.json`) |
| `newsletter/generer-pdf.py` | conversion HTML → PDF, avec contrôle d'une seule page |
| `newsletter/fonts/` | polices Lora et Poppins du gabarit, chargées automatiquement |
| `newsletter/COMMANDES.md` | les demandes type, une par édition |
| `newsletter/build/`, `newsletter/out/` | JSON et HTML de travail, PDF livrés (ignorés par git) |

### Procédure

1. Lire les articles de la période (voir « Sources ») et faire les recherches web.
2. Lancer `python3 newsletter/outils/preparer.py <monde|en|es|de|cg>` (option `--date AAAA-MM-JJ`
   pour une autre semaine) : il choisit la une et les 3 brèves du bas (les 4 articles les plus
   récents de l'édition) et écrit dans `newsletter/build/` un JSON de départ avec images, liens,
   kickers, titres, semaine et période. Tous les champs valant « À RÉDIGER » restent à écrire
   (en s'inspirant de l'exemple qui correspond). Pour une édition de langue, il faut deux JSON :
   `-fr` (créé par le script) et `-<langue>` (traduction, à créer en copiant le `-fr`).
3. `python3 newsletter/outils/remplir.py newsletter/build/<numero>-*.json`
4. `python3 newsletter/outils/controle.py newsletter/build/<numero>-*.html`
   Corriger le texte du JSON selon les ❌, puis relancer 3 et 4 jusqu'à ce que tout soit ✅.
5. `python3 newsletter/generer-pdf.py newsletter/build/<fichier>.html "newsletter/out/<NOM DU PDF>.pdf"`
6. **Regarder la capture PNG** produite à côté du PDF. Traquer les coupures bizarres, une
   ligne qui commence par « ; », une légende fausse, un blanc. Envoyer ensuite le PDF avec
   SendUserFile.
7. Les PDF ne sont **jamais** versionnés ni publiés sur le site. Le propriétaire les range
   dans la page admin « Mes newsletters » (`mes-newsletters.html`, bucket privé Supabase
   `newsletters`).

### Sources du contenu

- Articles : `actualites/<code>/articles/<slug>.html`, avec `<code>` = `en`, `es`, `de`
  ou `monde`. La liste et les dates sont dans `ACTU_DATA`, dans `actualites/<code>/tous-<code>.html`.
  Culture générale : `Culture-Generale/<slug>.html` (C et G majuscules). La liste des
  dossiers et leurs numéros sont dans `CG_DATA`, dans `culture-generale.html` à la racine.
- Images : celle de l'article, dans `actualites/<code>/images/`. Le nom exact est dans l'article :
  `grep -o 'images/[^"]*' <article>` (quelques-unes sont en `.jpg`).
  - `remplir.py` les encode en base64 et les laisse **en couleur**.
  - L'image de une doit être **en paysage**. Si le meilleur article a une photo en
    portrait, en choisir un autre pour la une.
- Liens cliquables : `https://ecg-prepa.fr/actualites/<code>/articles/<slug>.html`
  (culture générale : `https://ecg-prepa.fr/Culture-Generale/<slug>`, sans `.html`).

### Règles de rédaction

- **Une + 3 brèves du bas** : les articles les plus importants de la période.
  - Tag des brèves du bas : le pays (éditions de langue), le pays ou la zone (mondiale),
    ou « Dossier n° 0XX » (culture générale).
- **Colonne de droite** : 3 petites actualités réelles.
  - Les chercher avec WebSearch.
  - Elles doivent être absentes du site (sinon doublon) et jamais postérieures à la date
    du numéro.
  - 3 lignes maximum chacune.
  - Ajouter les sources au pied de page.
- **Le chiffre** : un fait **actuel** lié à la une (cours, indice, bilan du jour).
  - Le vérifier avec WebSearch.
  - Ni une donnée du bandeau de chiffres, ni une donnée déjà citée dans l'article.
- **Encadré bas de colonne** :
  - éditions de langue : vocabulaire d'au moins 12 entrées, aucune sur deux lignes ;
  - mondiale et culture générale : « Le mot du numéro », un mot lié à la une, avec
    étymologie, origine, définition et usage en dissertation.
- **Version étrangère** : tout est traduit, y compris l'étiquette « Le chiffre »
  (`remplir.py` s'en charge d'après `"langue"`). Le vocabulaire reste langue → français.
- **Titres** :
  - titre de une : 2 lignes maximum ;
  - chapeau : 3 lignes maximum ;
  - **les 3 titres du bas : exactement 2 lignes chacun**, pour que les paragraphes
    démarrent à la même ligne.
- **Aucun blanc**, contrôlé par `controle.py` :
  - Bas de la page : `.paper` entre 1100 et 1120 px. À 1123 px, le PDF fait déjà 2 pages.
  - La une : le lien « Lire l'article complet sur le site » tombe tout en bas de la
    2e colonne du texte, à la hauteur de la fin de la 1re. Ajuster la longueur de
    PARA_3 et PARA_4.
  - Colonne de droite : elle descend jusqu'au bas de la une.
    - Vocabulaire : il commence à 12 entrées ; ajouter des entrées courtes, tirées des
      articles du numéro, jusqu'au niveau voulu.
    - « Mot du numéro » : allonger ou raccourcir ses paragraphes.
  - Brèves du bas : chaque texte descend jusqu'à la ligne « pays / Lire → ».

### En cas de débordement

Raccourcir la rédaction, en commençant par la colonne la plus haute (`.col-side` ou
`.col-lead`). **Ne jamais** toucher aux tailles de police, à la hauteur des images ni aux
marges. Le vocabulaire garde au moins 12 entrées.

### Nom des fichiers

`<CODE> - Newsletter <Édition> - Semaine du <jour> <mois> <année>.pdf`
(le jour est celui du lundi de la semaine)

- Germanophone : `FR - Newsletter Germanophone - …` puis `DE - Newsletter Germanophone - …`
- Anglophone : `FR - Newsletter Anglophone - …` puis `EN - Newsletter Anglophone - …`
- Hispanophone : `FR - Newsletter Hispanophone - …` puis `ES - Newsletter Hispanophone - …`
- Mondiale : `MONDE - Newsletter - …` (français uniquement)
- Culture générale : `CG - Newsletter - …` (français uniquement)

### Prérequis

Installés automatiquement au début de chaque session par `newsletter/outils/installer.sh`.
À la main : `pip install playwright pypdf pillow`. Dans le cloud, Chromium est déjà dans
`/opt/pw-browsers/chromium` et les scripts l'utilisent si `playwright install` est
impossible. Un autre chemin peut être donné par la variable `CHROMIUM_PATH`.
