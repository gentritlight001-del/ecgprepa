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
   Puis `python3 outils/flashcards.py` : il régénère les données de l'espace flashcards
   (`premiere_annee/langues/flashcards/*.js`) à partir des pages du jour de langues.
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
prompts » du propriétaire : elle fait foi, et les règles ci-dessous la complètent. Une demande
type est « Rédige un article d'actualité sur le sujet suivant : … » + photo : tout doit être
parfait du premier coup (faits vérifiés, mise en page, listes, mise en ligne). Les prompts
n°5 à 9 (pages 5 à 7) sont les newsletters : voir la section 5.

Plusieurs articles à la fois : un sous-agent par article, chacun avec **son propre dossier de
travail** dans le scratchpad (un dossier partagé se fait écraser) ; les fichiers partagés
(`tous-<code>.html`, pages pays) sont modifiés par une seule personne, à la fin.

- Partir d'un article récent de la même édition et garder sa structure :
  `ap-band`, `ap-header`, `ap-hero-img`, `ap-stats` (4 chiffres), `ap-tl`
  (chronologie), `ap-quote`, `ap-ctx`, `ap-info`, `ap-tags`.
- **Pas de cartes de faits** (`ap-facts`, les 4 cartes Lieu / Date / Belligérants / Enjeu) dans
  les nouveaux articles : ne pas les écrire, ni leur CSS.
- Éditions de langue : article **bilingue**, avec `ap-fr-section` et `ap-<langue>-section`
  et le bouton `setLang`. Le CSS du toggle (`.nav-left`, `.nav-right`, `.ap-lang-btn`,
  `.ap-lang-btn.active`, `.ap-<langue>-section { display:none; }`) doit être présent : le copier
  d'un article de référence de la même édition. Le bouton bascule le texte sans recharger la page.
  Mondiale : français seulement, un seul bloc de contenu, **sans** bouton de langue ni section
  cachée.
- **Bandeau du haut toujours rouge uni** :
  `.ap-band { position: relative; z-index: 1; background: #b5131f; … }`
  (pas de dégradé, pas d'autre couleur). Titre du bandeau **court, sans date**.
- Image de une : la photo fournie, **sans** emoji ni libellé de secours par-dessus, **sans
  légende** dessous. Aucune autre image dans le corps de l'article.
- **Deux colonnes** (`ap-cols`) de hauteurs presque égales : écart de **110 px au plus** à
  1280 px, pour chaque langue. Déplacer des blocs entiers (titre + paragraphes, citation,
  tableau, chronologie) d'une colonne à l'autre, sans toucher aux polices ni aux marges.
  Mesurer avec Playwright (bas du dernier élément de chaque colonne).
- **Longueur** : **1 100 à 1 300 mots par langue** (version française comprise ; comme les anciens
  articles du site, qui font en moyenne ~1 200 mots), avec **3 à 4 rubriques (`ap-sub`) par
  colonne** : contexte et historique, chiffres clés, réactions et enjeux, un tableau, une
  chronologie, et un encadré de fin `ap-ctx` développé. Un article de moins de 1 000 mots est
  trop court. Pour équilibrer les colonnes, **ajouter ou déplacer des blocs des deux côtés**
  plutôt que couper du contenu. Compter les mots du bloc `ap-body` de la version française
  avant de mettre en ligne. Une recherche web plus poussée (plusieurs sources par article) est
  nécessaire pour atteindre cette longueur sans rien inventer.
- **Chaque colonne s'ouvre sur un titre (`ap-sub`) suivi de texte** : jamais sur la
  chronologie, une citation, un tableau ou un encadré.
- **Chronologie** (`ap-tl`) : soit **tout en bas de la colonne gauche**, soit **incrustée dans la
  colonne droite** ; jamais au milieu de la colonne gauche. **Ordre décroissant : le plus récent
  en haut** (chronologie, et tout tableau avec une colonne de dates). L'encadré de fin `ap-ctx` reste le
  dernier élément de la colonne droite.
- **Encadré de fin** (`ap-ctx`, bas de la 2e colonne) : titre d'analyse original, jamais
  « Conclusion », et pas de ton scolaire (pas de « pour les concours », « enjeu de dissertation »).
- Dans la liste du mois, l'article passe **en premier**.
- **Renvois vers d'autres articles** : pas de « Lire notre article ». Le lien se met
  directement sur le texte concerné, par exemple « l'attentat de Leipzig » renvoie vers
  l'article sur l'attentat :
  `<a href="slug.html" style="color:<couleur du texte>;text-decoration:underline;text-underline-offset:2px">…</a>`
- Faits vérifiés par recherche web, sans rien inventer.
- Pas de tiret cadratin « — » dans le texte, même dans les versions étrangères (voir section 1).

### Image

Enregistrer la photo fournie en WebP sous `actualites/<code>/images/<slug>.webp`, en
largeur 1600 px maximum :

```python
from PIL import Image
im = Image.open(src).convert("RGB"); im.thumbnail((1600, 1600)); im.save(dst, "WEBP", quality=86)
```

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

### Fiches de l'Humanité (cinéma, littérature)

- Mise en page commune (`humanite/cinema/`, `humanite/litterature/`) : bandeau compact, bande
  « En bref » (réalisateur ou auteur, année, genre) avec le plan en pastilles, puis le texte.
  Une nouvelle fiche reprend une fiche existante (`blade-runner.html`, `1984.html`).
- **Affiche / couverture** : `python3 outils/fiche-visuel.py <page> <image>`. Le script crée le
  WebP dans `images/` de la rubrique et ajoute le visuel et le fond flou. **Pas de légende** sous
  l'image. Sans visuel, le bandeau reste en texte seul.

### Fiches auteurs (Cours Humanité)

- `humanite/cours-humanite/Fiches auteurs/` : index `fiches-auteurs.html`, une **frise des siècles**
  choisie par le propriétaire sur maquette : une ligne `<li class="auteur-card" data-num data-nait data-mort>`
  par auteur, **dans l'ordre des naissances** (auteur vivant : `data-mort=""`), avec sa présentation
  `.fr-detail` (nom complet, époque, thèse en une phrase, œuvre de référence) qui s'ouvre au clic. Le
  script de la page place seul les époques, les années et les barres : ajouter un auteur = copier un `<li>`
  au bon endroit, rien d'autre (les époques d'avant 1450 sont resserrées). Une fiche faite : ajouter
  `dispo` et `data-slug="<slug>"` au `<li>`, remplacer `.fr-initiale` par le portrait
  (`<img class="fr-visuel" src="images/<slug>.webp" …>`) et « Fiche à venir » par le lien
  `<a class="fr-bouton" href="<slug>.html">` + durée, comme pour Rousseau. La dernière fiche parue (plus
  grand `data-num` parmi les `dispo`) est ouverte d'office. Demande type : « Fais la fiche auteur de Kant ».
- Une fiche = `<slug>.html`, copiée de `rousseau.html` (n° de la carte de l'index). Gabarit repris de
  l'HGG au quotidien mais habillé « sauge et prune », choisi par le propriétaire sur maquette : fond sauge
  pâle sans quadrillage, prune `#6b2d5c` et olive `#55702f`, coins arrondis, numéros de section en
  pastilles, nom de l'auteur en prune, **sans italique**. Garder cet habillage pour toutes les fiches (`auteur.css`,
  `auteur.js` ; fiches lues dans `localStorage` `ecg-humanite-auteurs-lues`). Supprimer de la copie les balises `og:`,
  `twitter:`, `canonical` et réécrire la description.
- Structure : cartouche (portrait en paysage et fiche d'identité **courte**, 4 lignes : naissance, mort,
  œuvres clés, concepts ; pas de lieux et dates sous le titre ; vidéo `.f-video` sous la définition si le
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
  `premiere_annee/langues/flashcards/cartes.js` et `cartes.css`. Nouvelle langue : l'ajouter à
  `LANGUES` de `quotidien.js` et à `LANGUES` de `flashcards/index.html`, copier l'index d'une
  langue existante, ajouter le bouton et la carte « Le texte du jour » à l'index de la langue.
- Dans les données, les champs `en` désignent toujours **la langue étudiée** (mot, phrase de
  version, traduction du thème), quelle que soit la langue.
- `index.html` : la carte « Le texte du jour » (`.une` : image, « Jour N · <jour> <date> », titre)
  et la grille `jours-grid` (le nouveau jour **en tête**, avec `data-date` ; la carte « Demain »
  et les compteurs « jours terminés » / « mots à revoir » sont ajoutés par `quotidien.js`).
  **Pas de puces ni de texte qui résume la grammaire du jour** (index, cartes, en-tête du jour).
  Pas d'italique dans l'index ; dans la page du jour, les mots étrangers (`<em>`) restent en italique.
- `jour-AAAA-MM-JJ.html` : une page par jour, construite par `quotidien.js` à partir du bloc
  `<script id="donnees">`. **Pas de sommaire** (barre des étapes Lire / Grammaire / …) sous le
  héros. Seul le jour le plus récent (carte `.une` de l'index) est gratuit ; les précédents
  passent Premium automatiquement (voir section 1).
- Le compteur « mots à revoir » de l'index mène à l'**espace flashcards**
  (`premiere_annee/langues/flashcards/index.html#<langue>`) : toutes les cartes de tous les jours,
  langue par langue (onglets Anglais, Espagnol, Allemand ; une langue s'ouvre dès qu'elle a des
  pages du jour). Ses données (`<langue>.js`, `langues.js`) sont générées par
  `python3 outils/flashcards.py` : à lancer à chaque nouveau jour (voir « Mise en ligne »), ne
  jamais les modifier à la main. Paquet « À revoir » : `localStorage`
  `ecg-<langue>-quotidien-a-revoir`, commun à la page du jour et à l'espace.

**Procédure d'un nouveau jour**, pour une langue (demande ci-dessus, ou routine automatique tous
les jours à 0 h, heure de Paris, qui fait l'anglais, puis l'espagnol, puis l'allemand), sans poser de question
jusqu'à la mise en ligne :
1. Date = date du jour à Paris : `TZ=Europe/Paris date +%F`. Si `jour-<date>.html` existe déjà
   pour cette langue, passer : rien à faire.
2. Article : le premier de `ACTU_DATA` de l'édition source (tableau ci-dessus) qui n'a pas encore
   servi (`grep -ho 'actualites/<code>/articles/[^"]*' premiere_annee/langues/<langue>/quotidien/jour-*.html`).
   S'il n'y a aucun nouvel article, prendre le plus récent qui n'a pas servi, même plus ancien.
3. Numéro = numéro du dernier jour + 1. Copier la page du dernier jour, réécrire `<title>`,
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
  `../lecon<N>.html`), exercice de 3 ou 4 phrases à trous (`___`, réponses acceptées dans
  `r`). Une carte qui traite deux points renvoie vers deux sections avec
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
  mots du vocabulaire du jour et la grammaire étudiée (l'indice rappelle les mots à placer),
  chacune avec traduction proposée et 2 ou 3 remarques.
- **Durées** : une par étape dans `DUREES` (`quotidien.js`) ; le total en tête est leur somme
  (30 min, chiffre rond à garder).
- **Chapeau** (`chapo`) : une phrase qui dit le sujet, sans annoncer la grammaire.
- **Bilan** : 4 ou 5 phrases, sans liens vers les leçons (ils sont déjà dans la grammaire).
- Pas de questions de compréhension.
- Vérifier avec `outils/quotidien-controle.py` (aucune erreur JS, chaque exercice de grammaire rempli avec `r[0]` donne
  « parfait », listes à jour, renvois valides…). Typographie française gérée par `quotidien.js` pour les champs en français.

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
  cliquables ; pour un auteur ou une notion : schéma SVG, carte des lieux liés ou document),
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
