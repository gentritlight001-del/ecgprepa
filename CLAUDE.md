# ECG Prépa — consignes pour Claude

Site statique de prépa ECG (HTML/CSS/JS, hébergé sur Cloudflare Pages, comptes et
stockage sur Supabase). Ce fichier est relu au début de **chaque** conversation :
toutes les règles valables d'une conversation à l'autre sont ici.

Sommaire : 1. Règles générales · 2. Mise en ligne · 3. Articles d'actualité ·
4. Cours (chapitres, colles, HGG au quotidien, DS, dossiers de culture générale) · 5. Newsletters PDF

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
  `idees-articles.html`, `mes-newsletters.html`, `mon-planning.html`). `mon-planning.html` : agenda
  personnel du propriétaire (habillage « carnet pointillé » + grille horaire, **pas d'italique**),
  synchronisé dans `planning/planning.json` du bucket privé `newsletters` (photos attachées dans `planning/photos/`) ; interrupteurs « Au quotidien »
  (anglais, espagnol, allemand, fiche HGG) qui ajoutent une ligne par jour. Sa recherche « Depuis le site » lit
  `recherche-index.json` (7e champ : image de la page) et `a-faire.json` (« Contenus à créer » : liens vers des pages
  qui n'existent pas encore, œuvres `a-venir`, fiches auteurs sans fiche…), tous deux écrits par `outils/recherche.py`
  (ne jamais les modifier à la main). Une nouvelle page admin s'ajoute à cette
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
  filet rouge, fil en capitales), Culture générale (`sn-cg`, pleine couleur du dossier, encre sur l'index), L'Humanité (`sn-hum`,
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
   Les articles au gabarit `a-page` ont leur propre modèle, la **maquette B** choisie par le
   propriétaire : photo de une en plein cadre, assombrie à gauche, logo « ECG Prépa » en haut, pastille
   du pays (`a-tag t0`), titre blanc en Fraunces (celui du `<title>`), « ecg-prepa.fr · Actualité »
   en bas et filet ; pastille et filet à la couleur d'accent de l'article (`--accent`). Les fiches d'œuvres de
   l'Humanité qui ont un visuel (`ch-hero-visuel` : affiche, couverture, œuvre, pochette) suivent le même esprit :
   visuel flou et assombri en fond, visuel net à droite, pastille de la rubrique, titre, « auteur · année » (`.meta`),
   « ecg-prepa.fr · L'Humanité », pastille et filet à la couleur de la fiche (`--c`). Les fiches auteurs aussi (portrait
   `f-portrait`, pastille « Fiche auteur », nom du `<h1>`, années de naissance et de mort, couleur `--accent`). Et les cours d'Humanité (image du héros
   `ch-hero-media` recadrée, pastille « Cours N », titre, « L'Humanité · 2e année »). Les pages de cours de 1re et 2e année aussi (pastille de la
   matière ou de la langue, titre, « Chapitre N · 1re année », couleur fixe par matière dans `COULEURS` du script) :
   image du héros si elle est stockée sur le site, sinon la vignette `.ci-vig` de l'index de la matière (ou de l'autre
   année), sinon l'image du bloc de données ; sans image, grand numéro du chapitre au trait. **Chapitres d'HGG** (1re et 2e année) : modèle propre « dossier d'archives » choisi par le propriétaire (`GABARIT_ARCHIVE`) : chemise kraft avec onglet « HGG · année », photo du héros (`.t-photo`) en tirage panoramique scotché, fiche de titre (grand numéro, titre en Big Shoulders) qui chevauche la photo, tampon « ECG Prépa · Cours », à la couleur du chapitre (`--a1`), sinon l'ocre de l'HGG ; après la refonte d'un chapitre, lancer `--refaire` sur sa page. Les autres pages gardent un aplat de couleur. Regarder l'image produite : si le
   visage ou le sujet de la photo passe sous le titre, le signaler au propriétaire.
   Pour **refaire** l'image d'une page qui en a déjà une (photo ou titre changés) :
   `python3 outils/images-partage.py --refaire <page>` (l'adresse prend `?v=<date et heure>`, sinon
   WhatsApp et Discord gardent l'ancienne en cache).
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

**Clone « shallow » et fichiers générés.** Dans un clone tronqué (`git rev-parse --is-shallow-repository` donne
`true`), `outils/referencement.py` date des pages à la date du clone : ne pas committer son `sitemap.xml`
(`git checkout sitemap.xml` avant le commit). Si la fusion de la PR échoue pour conflit, c'est presque toujours
sur un fichier généré (`recherche-index.json`, `sitemap.xml`, `nouveautes.js`) : fusionner `origin/main` dans la
branche, prendre la version de `main` (`git checkout --theirs <fichier>`), relancer les scripts, committer, pousser.
Chaque fusion sur `main` = un build Cloudflare Pages (compté dans la limite mensuelle du plan) : une modification
qui ne touche que `CLAUDE.md` ou `outils/` peut être fusionnée avec `[CI Skip]` dans le message de fusion.

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
  `canonical` et la description, **mais garder** `<link rel="stylesheet" href="../../../barre-section.css">`
  (juste après le `</style>`) : sans elle, la barre du haut perd son habillage noir et son filet. Le
  lien « ← Tous les articles » de `a-fin` mène à `tous-<code>.html` de l'édition.
- **Ordre des blocs**, dans chaque langue :
  1. Barre `sn sn-actu` (fil d'Ariane : Accueil / Actualité / édition / pays / sujet court), puis `a-filet`.
  2. Héros `a-hero` : tags `a-tag` (`t0` le pays, `t1` le thème, puis 1 ou 2 mots-clés), titre `a-titre`,
     sous-titre `a-sous-titre` = le même titre dans l'autre langue (avec `lang`), `a-meta`
     « Mois année · Pays · 5 min de lecture » (« 5 min read »…), photo `a-hero-img` (la photo fournie, sans légende ni texte
     par-dessus).
  3. `a-essentiel` « L'essentiel en 30 secondes » : 3 points de 2 à 3 lignes, mots clés en `<strong>`.
  4. `<article class="a-carte a-article">` : `a-chiffres` (4 chiffres vérifiés, le plus marquant en
     `rouge`), chapô `a-chapo`, puis **6 à 8 sections** `a-sec` numérotées (`a-h2` + `a-num` 01, 02…) :
     un titre court et 1 ou 2 paragraphes `a-p` chacune.
  5. Entre les sections : **1 ou 2 schémas** `a-schema` et **une citation** `a-citation`. **Plus aucune
     photo dans le corps** (décision du propriétaire, octobre 2026) : seule la photo de une `a-hero-img`.
  6. Chronologie `a-chrono-bloc` après la dernière section : frise horizontale de 6 dates, **la plus
     récente à gauche** (`li.recent`, en rouge). Tout tableau avec des dates : le plus récent en haut.
  7. Analyse `a-analyse`, puis « Dans une copie » `a-copie` à l'intérieur (voir plus bas).
  8. Hors de l'article : « Pour aller plus loin » `a-carte a-plus` (voir plus bas).
  9. `a-fin` : « ← Tous les articles », bouton « Partager l'article » (`partager(this)`), page du pays ou
     de la région « → ».
- **Palette : une par article.** Le rouge du gabarit est remplacé à chaque article par une couleur d'accent
  propre, choisie selon le sujet : trois variables dans le `:root` du `<style>`, `--accent` (assez foncée pour
  du texte sur fond blanc), `--accent-fonce` (texte sur fond pâle) et `--accent-pale` (fonds), et rien d'autre à
  changer (tout le CSS passe par elles ; les classes `rouge` des chiffres et étiquettes désignent l'accent).
  Jamais deux fois la même : vérifier avec `grep -rh -- '--accent:' actualites/*/articles/`. Déjà prises :
  Burnham et le Brexit rouge `#b5131f` / `#8e0f19` / `#fbe9ea` ; Colombie à Jérusalem bleu cobalt `#1d4fa0` /
  `#143a78` / `#e6edf9` ; émeutes de Tirana indigo `#4a3f8f` / `#352c6e` / `#ecebf7` ; pont du Yalou bleu
  fleuve `#0a6486` / `#074b66` / `#e1f1f7` ; étoile verte vert chartreuse `#5f7a0a` / `#465a07` / `#f0f5dc` ; déforestation de l'Amazonie brun terre brûlée `#7b4a26` / `#5c3519` / `#f5ebe1` ; grève du secteur public irlandais bordeaux `#6e1d3a` / `#52132b` / `#f6e8ed` ; sécheresse en Angleterre ardoise `#3f5b6e` / `#2b4150` / `#e9eff3` ; réforme des urgences allemandes baie `#9c2a77` / `#771d5a` / `#f7e6f1` ; accord Merz-Macron sur le thermique sauge `#4f7a63` / `#365745` / `#e7f0ea`. La barre du haut garde son filet rouge (`barre-section.css`) ; l'image de partage
  prend l'accent de l'article.
- **Langue** : éditions de langue **bilingues** (`ap-fr-section` et `ap-<code>-section`, la seconde
  cachée), avec le petit interrupteur de la barre `.a-langues` : deux boutons `ap-lang-btn` « FR » et
  « EN » / « ES » / « DE » (`id="ap-btn-fr"`, `id="ap-btn-<code>"`, `aria-label` avec le nom de la
  langue), et la fonction `setLang` du gabarit, adaptée au code de la langue. Jamais de gros boutons
  « Français / English ». Mondiale : français seulement, un seul bloc, **sans** interrupteur ni section
  cachée.
- **Citation** (`a-citation`) : filet rouge à gauche, taille de lecture, jamais un grand bloc sombre.
  Citation courte dans sa langue d'origine ; dessous `<b>Nom</b>, fonction, source, date`, et dans la
  version française sa traduction en `<span class="a-trad">`.
- **Schémas : tous pertinents, et variés.** Chaque schéma montre précisément ce que dit la section où il
  est placé : rien de décoratif, rien de « pour remplir ». Sans schéma vraiment utile, on n'en met pas.
  **Pas de photo dans le corps** des articles : ne pas en chercher, ne pas en demander au propriétaire
  (les articles déjà en ligne gardent les leurs, et le CSS `a-photo` du gabarit reste en place).
  - Schémas (`a-schema`, titre `a-schema-t`, source en `a-src`) : **diversifier les structures d'un
    article à l'autre et choisir celle qui sert le sujet**, au lieu de reprendre toujours les mêmes.
    Modèles existants : `a-etapes` (chaîne d'étapes, par exemple établi / estimé / jamais démontré, ou
    voté / suspendu / confirmé), `a-axe` (positions des acteurs sur un axe). Autres formes bienvenues,
    dans le même style (couleurs `--accent`, `--marine`, bords et fonds du gabarit) : barres
    comparatives, tableau avant / après, arbre ou schéma de circuit (qui décide, qui finance), carte
    simplifiée, courbe ou frise de chiffres, double colonne « ce que dit le camp A / le camp B ».
    **Le schéma s'adapte au sujet** : on part de ce que la section doit montrer (un lieu : carte ; un
    flux ou des passages : circuit ; des chiffres de deux sources : tableau ; des affirmations à contrôler :
    `a-verif`), jamais d'une forme choisie d'avance. `a-etapes` et `a-axe` ne sont **pas** des valeurs par
    défaut (déjà pris par Burnham, Colombie, Albanie) : ne les reprendre que si le sujet s'y prête vraiment.
    Un `a-tableau` doit tenir à 390 px sans défilement : ajouter dans le `<style>` de l'article
    `@media (max-width: 520px) { .a-tableau { min-width: 0; font-size: .82rem; } .a-tableau th, .a-tableau td { padding: 9px 8px; } .a-tableau td:first-child { white-space: normal; } }`.
    Exemple de schéma sur mesure : le circuit des deux ponts du Yalou (`a-circuit`, en HTML et CSS dans le
    `<style>` de l'article, lisible à 390 px). Les deux schémas d'un article n'ont pas la même forme, et
    aucun ne reprend la forme des deux articles précédents.
    Ne pas mettre deux schémas de la même forme dans un même article, et regarder les derniers articles
    publiés (`grep -l 'a-etapes\|a-axe' actualites/*/articles/*.html`) pour ne pas répéter la forme
    de l'article précédent. Données vérifiées et sourcées ; un nouveau type de bloc s'ajoute au
    `<style>` de l'article, jamais à la place de celui du gabarit.
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
  - « Sujets où la placer » : 3 sujets de dissertation plausibles, chacun suivi entre parenthèses de la
    **matière du cours** en rapport avec son thème : HGG, ESH, philo, Humanité, anglais, espagnol ou
    allemand. **Jamais « culture générale »** : c'est trop vague, il faut dire dans quelle matière le sujet
    tombe (on varie les matières d'un sujet à l'autre quand le thème s'y prête).
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
- **Renvois vers d'autres articles** : pas de « Lire notre article », ni de « comme nous l'avons raconté
  dans notre article de juin », ni de « notre article précédent ». Le lien se met directement sur les mots
  qui portent l'information renvoyée (`<a href="slug.html" class="a-lien">l'attentat de Leipzig</a>`,
  `<a href="…" class="a-lien">une plage de la zone protégée de Vjosa-Narta</a>`).
- Faits vérifiés par recherche web, sans rien inventer.
- Pas de tiret cadratin « — » dans le texte, même dans les versions étrangères (voir section 1).
- **Contrôles** avec Playwright à 1280 et 390 px, dans chaque langue : aucune erreur JS, pas de
  défilement horizontal, toutes les images chargées (faire défiler la page : elles sont en
  `loading="lazy"`), titre du héros lisible, colonnes de l'analyse égales.

### Image

Enregistrer la photo de une fournie en WebP sous `actualites/<code>/images/<slug>.webp`, en largeur 1600 px maximum :

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

### Chapitres d'HGG : gabarit « dossier d'archives »

Choisi par le propriétaire (octobre 2026) au terme d'une longue mise au point sur **HGG 1re année, chapitre 4**
(`premiere_annee/hgg/chapitre-4/chapitre-4-hgg.html`), qui sert de **modèle** : **tous les chapitres d'HGG (1re et 2e
année) seront refaits sur ce gabarit**. Demande type : « Refais le chapitre N d'HGG au nouveau style ». Refonte = **même
nom de fichier** (section 1), balises `og:`/`twitter:`/description/canonical gardées. Partir d'une copie du chapitre 4 :
tout le CSS est dans le `<style>` de la page (portée `#cours.thC`, palette kaki `--a1:#4b5a3c`, rouge `--a3:#a3292a`,
polices Newsreader / Libre Franklin / IBM Plex Sans Condensed / Big Shoulders Display), ainsi que les scripts (mode focus,
« Mes révisions », impression). **Une palette par chapitre**, jamais deux fois la même : remplacer dans tout le fichier les couleurs du chapitre 4 (kaki et leurs teintes, rouge, y compris les `--p` des parties de la frise de « Mes révisions » et la teinte `.f2` des schémas) ; les punaises et scotchs décoratifs ne changent pas. Palettes prises : chapitre 4 kaki `#4b5a3c` / rouge `#a3292a` ; chapitre 3 (refait en octobre 2026) bleu ardoise `#2f4b66` / rouille `#b0451c` ; chapitre 2 aubergine `#4a2d5c` / framboise `#9b2457` ; chapitre 1 sépia `#5b3a24` / cobalt `#1f5fa8` ; chapitre 5 graphite `#33363d` / rouge drapeau `#c41e1a` ; chapitre 6 latérite `#8a3a1c` / vert palme `#1d7a55` ; chapitre 7 bronze `#6e5514` / bleu ONU `#1c6fc0` ; chapitre 8 mûre `#6d2353` / vert jade `#138a6c` ; chapitre 9 bleu marine `#1b3668` / safran `#c98a0a` ; chapitre 10 vert pré `#2e6a22` / magenta `#b0247a` ; chapitre 11 violet améthyste `#5b2a8c` / vert anis `#6b9a12` ; chapitre 12 carmin `#a3173f` / bleu pétrole `#0d6e86` ; chapitre 13 cuivre `#b4500f` / indigo `#3f4aa8` ; chapitre 14 vert lichen `#5c6a14` / violet `#8a3ab9` ; chapitre 15 fuchsia `#a1008f` / bleu glacier `#1a8fc0` ; chapitre 16 lavande `#615289` / corail `#e0566f` ; 2e année, chapitre 1 (Géopolitique des Amériques) émeraude `#1d5c47` / orange brûlé `#c75a12` ; 2e année, chapitre 2 (Les États-Unis) bordeaux `#7a1e2c` / or `#9a6a0c` ; 2e année, chapitre 3 (L'Amérique latine) indigo `#3b347f` / turquoise `#0b7785`. Choisir une teinte principale franchement différente de celles déjà prises (une sarcelle, trop proche de l'ardoise du chapitre 3, a été refusée). On garde : la barre `sn sn-cours sn-hgg sn-archive`, le script du surligneur réduit à
« Mes révisions » (il lit `.content`, `.hgg-part-title`, `.hgg-section-title`, `.hgg-part-num`, `.ch-hero h1`, `.chap-label`),
le `DECK`, le bouton « retour en haut ».

**Contenu.** Reprendre **tout** le texte de l'ancien cours (vérifier par comparaison qu'aucune info n'est perdue), le
corriger et le vérifier par recherche web (chiffres datés, fourchettes d'historiens, dates exactes des conférences, etc.) ;
signaler au propriétaire ce qui est corrigé ou ajouté de mémoire. Pas de tiret cadratin. Chaque paragraphe de la colonne de
droite a un appui dans le texte (pas de fiche sur une notion absente du texte : sinon ajouter une phrase au texte).

**Ordre des blocs** (dans `#cours .wrap`) :
1. **Héros** `header.hero.hv.hv1.ch-hero` : grande photo panoramique en tirage (`.t-photo`, scotch), étiquette de titre
   `.t-etiq` (titre en Big Shoulders, sous-titre d'une phrase). **Pas de légende** sous la photo, pas de tampon.
2. **Sommaire** `nav.plan` : **seulement les grandes parties** (`.pl-p`), l'interrupteur « Mode focus » (`.fx-sw`) et le
   lien « Résumé (PDF) » (`resume-chapitreN.pdf`). **Pas de bouton PDF du cours** dans la barre (retiré).
3. **L'essentiel** `section.ess` : 3 points numérotés et 4 chiffres (le plus marquant en rouge), centrés.
4. **Parties** `section.partie` : en-tête `.p-tete` (`<small>Partie I</small>`, `h2.hgg-part-title`, grand chiffre romain
   en filigrane `.p-num`, jamais coupé, un seul filet dessous) ; puis les sous-parties `section.sp` (une sur deux en
   `.sp.rev`, colonne à gauche) : `.corps` (`h3.hgg-section-title` avec `<i>I.1</i>`, intertitres `h4.sub`, paragraphes,
   `p.fort` à filet rouge pour la phrase clé, `ul.puces`) et `.cote` (colonne de côté). **La colonne de côté suit l'ordre
   du texte** (la fiche en face du passage qu'elle illustre) et finit à peu près à la hauteur du texte : **pas de vide**
   (ajouter une photo ou retirer une fiche, déplacer un bloc).
5. **Blocs de la colonne de côté** : fiches `.v.fiche.att-pin` (punaise de couleur variable `--pin`) pour les graphiques
   `.bars`, chiffres `.stats`, cartes `.cartes` (`.ca`), frises `.frise` (la plus récente en haut, `li.cur`), chaînes
   `.flux`, listes `.liste5` ; photos et schémas `.v.fig.scotch` / `.schema.scotch` (scotch de couleur variable `--tape`,
   inclinaisons `--tr`, `--rot`), photos en paysage, légende « Doc. N · … ». Photos et schémas tantôt à gauche, tantôt à
   droite (`.sp.rev`).
6. **Blocs pleine largeur** entre les sous-parties : citations en coupure de journal `figure.large.coupure` (toute la
   largeur, petite taille de texte, source en dessous) ; **fiches de penseurs** `article.large.portrait` (portrait en
   polaroïd `.pt-pola` avec scotch, kicker « Métier · œuvre, date », `h6`, texte ; portraits WebP `images/portrait-<nom>.webp`) ;
   encadrés à volets `.large.cp.cp2` / `.cp3` (étiquettes `.cp-tag`) ; document `.large.kdoc` (ex. Long Télégramme,
   dans sa sous-partie) ; carte commentée `.large.atlas` ; graphiques `.large.gp` ; schéma large `.large-schema`
   (scotch visible, défilement horizontal seulement sur téléphone, schéma simple : pas d'éléments sans lien).
7. **Définitions** `.def` dans le texte : étiquette « DÉFINITION », le mot en IBM Plex Sans Condensed gras capitales.
   Encadrés `.encadre` (titre en capitales kaki).
8. **Bilan** `section.bilan` : « Bilan · Chapitre N », une phrase-bilan en grand, puis une idée par grande partie (titre en
   gras + une phrase, **2 lignes chacune**, sans liste d'exemples). Pas de lien « chapitre suivant » dans le bilan.
9. **Pour aller plus loin** `section.plus2` : **6 cartes au plus** `.pl-c` (chapitre suivant, dossiers de culture générale,
   œuvres de l'Humanité), sans groupes ni ligne de crédits. **Pas** de « Dans une copie » ni de liste de sources.
10. **Fin** `footer.fin2` : deux boutons compacts, « ← Tous les chapitres d'HGG » et « Chapitre N+1 · titre → ». Pas de
    bouton flashcards.

**Mode focus** (interrupteur du sommaire, mémorisé dans `localStorage` `ecg-cours:focus`, pastille « Cours complet ») :
le cours se resserre sur l'essentiel, environ la moitié du texte. Masquer avec la classe `nf` (blocs entiers ou
`<span class="nf">` dans une phrase, qui doit rester correcte dans les deux modes) : fiches de penseurs, photos sauf
le héros, coupures sauf une, exemples en trop (**un seul exemple par idée**), « Pour aller plus loin ». `<span class="fo">`
= texte visible seulement en focus (rare, faits déjà dans le cours). Garder titres, essentiel, définitions, chiffres clés,
schémas essentiels, bilan. En focus, la colonne de côté flotte dans le texte (script `flotter`), une colonne vide est
masquée (`.cote.nf`), un intertitre seul à côté d'une fiche descend avec son texte. Ne pas ajouter ni retirer de blocs
`p/li/h*/figcaption/td/th/dt/dd/blockquote` en balisant (l'éditeur s'appuie sur leur rang).
**Nouvelle formule (choisie par le propriétaire, octobre 2026 ; faite pour les chapitres 1, 2 et 3 de 2e année)** : le mode focus n'allège plus le cours,
il affiche un **second cours réécrit**, lisible en 10 minutes (≈ 2 300 mots) : bloc `section.fc#focus` entre le sommaire et
`.content` (en focus, `.content` est masqué sauf le bilan ; le sommaire pointe vers `#f1`…). En-tête `.fc-tete` (problématique,
« La réponse » `.fc-these` = la thèse en une phrase, plan détaillé ; pas de pastilles de durée, jugées inutiles), parties `.fc-p` (idée directrice `.fc-idee`), sous-parties `.fc-sp` : à gauche titre + chiffre clé
(`.fc-g`, statique, pas collant), à droite arguments numérotés `.fc-arg` (idée en gras + explication, **un seul exemple**
`.fc-ex`), une définition `.fc-def` ; à la fin de chaque partie, une conclusion `.fc-concl` (« Conclusion · Partie N », une ou deux phrases). Contenu tiré du cours, rien de nouveau. Ce PDF **remplace le résumé** : il est publié sous `resume-chapitreN.pdf` (seul bouton « Résumé (PDF) » du sommaire, sans pied de page ; l'ancien gabarit
`outils/resume-chapitre/hgg2-chapitre1.html` ne sert plus pour ce chapitre) :
`python3 outils/cours-focus-pdf.py <page> <dossier>/resume-chapitreN.pdf` (vérifier que la partie I commence dès la page 1 : sinon resserrer l'en-tête du bloc d'impression, pas le texte) (A4, sans marge de notes, 7 pages : héros du cours complet à sa taille normale (photo jamais agrandie, refusé), plan, puis le cours focus pleine largeur ; chaque sous-partie = titre et chiffre clé **en haut**, contenu dessous, jamais titre à gauche et texte à droite), à
relancer après toute modification du cours focus.

**Mode éditeur** (`editeur.js`, administrateur seulement) : `<script src="../../../editeur.js" data-racine="#cours" defer>`
en fin de `<body>`. Le propriétaire modifie le texte sur la page et l'enregistre **directement sur `main`** via l'API
GitHub (jeton dans son navigateur). Conséquence : **avant de travailler sur un chapitre, toujours repartir du `main` le plus
récent** (`git fetch origin main` puis fusion), pour ne jamais écraser ses éditions.

**« Mes révisions »** (bouton flottant rond kaki, icône de cartes ; plus de surligneur) : plein écran à onglets
Flashcards / Frise / Sujets (habillage kaki `.rv-ov`, dernier onglet mémorisé). Données dans le script de la page :
`PARTS`, `DECK` (identifiants par position : **garder l'ordre et le nombre de cartes** quand on corrige), `EVENTS`
(frise : le dernier champ est un extrait **exact** du texte du cours, vérifier que chaque « Voir dans le cours » trouve son
passage), `HOOKS` (accroches), `ESSAY` (corrigé de dissertation ; `**gras**` et `==surligné==` permis pour aérer : mots
clés, entrée de chaque point du plan, phrases qui répondent au sujet). Toutes ces données doivent reprendre les chiffres
du cours corrigé (pas de valeurs d'un ancien cours) et sans tiret cadratin.

**Résumé** (`resume-chapitreN.pdf`, lien du sommaire) : 2 pages A4, une carte par sous-partie (idée principale + 2 points,
un seul exemple), dans l'esprit du mode focus. Gabarit : `outils/resume-chapitre/` (copier `hgg1-chapitre4.html`,
feuille `style.css`) ; `python3 outils/resume-chapitre/generer.py <html> <pdf>` signale une page qui déborde. Page 1 :
titre (pastille « Résumé »), phrase-bilan, parties I et II ; page 2 : partie III, frise de 8 dates repères aux couleurs des
parties, 4 chiffres, puis « À retenir » (encadré sombre), « Dans une copie » et « Notions clés » (4 notions).

**Carrousel « Le chapitre en 10 cartes »** (demande type : « Fais un carrousel pour le chapitre N ») : 10 cartes
1080 × 1350 (format Instagram), habillage archives aux couleurs du chapitre : couverture, idée du chapitre + 4 chiffres,
deux cartes par partie (photo du chapitre scotchée, sous-parties, un petit schéma : vagues, barres, deux colonnes…),
8 dates repères (la plus récente en haut), « À retenir » (idée-force, 4 notions, « Dans une copie »). Contenu repris du
résumé PDF et du cours, rien de nouveau. Source : `outils/carrousel/<hgg1|hgg2>-chapitreN.html` (copier
`hgg2-chapitre1.html`, feuille `style.css`, palette dans le `:root`, texte alternatif de chaque carte dans `data-alt`) ;
`python3 outils/carrousel/generer.py <html> <année>/hgg/carrousel/chapitre-N <scratchpad>/png` écrit les WebP du site
et les PNG pour Instagram (envoyés au propriétaire, jamais versionnés) et signale un bloc qui touche le pied de carte.
**Pas encore sur le site** (choix du propriétaire, octobre 2026) : ne livrer que les PNG, sans rien mettre sur la page.
Quand il le demandera : bloc `section.carr#carrousel` juste après le bilan (images seulement, aucune balise lue par
l'éditeur), lien « Carrousel » dans le sommaire, CSS et script en fin de page : tout est prêt dans le commit `e3dcc71`
(`git show e3dcc71 -- deuxieme_annee/hgg/chapitre-1-hgg.html`).

**Vidéo « motion design » du chapitre** (demande type : « Fais la vidéo du chapitre N ») : MP4 horizontal 1920 × 1080,
25 images/s, sans son (le propriétaire ajoute sa musique), **tout le chapitre**, texte posé et lisible (3,5 mots/s), même
habillage archives que le carrousel. Source : `outils/video/<hgg1|hgg2>-chapitreN.html` (copier `hgg2-chapitre1.html` :
palette dans le `:root`, `SP`, `PARTIES`, puis `PLANS`, un plan par écran, deux colonnes de blocs : texte, définition,
fiche, chiffres qui défilent, barres, frise la plus récente en haut, photo scotchée « Doc. N », coupure, penseur, schéma
animé de `moteur.js`) ; contenu repris du cours, rien de nouveau, pas de tiret cadratin. Le moteur (`moteur.js`, `style.css`)
calcule les durées de lecture et les animations. `python3 outils/video/generer.py <html> --controle` (blocs qui débordent,
titres trop longs, durée), `--images <dossier>` (une image par plan, à regarder), puis
`python3 outils/video/generer.py <html> <scratchpad>/<nom>.mp4` (environ 0,1 s par image, en 4 tranches parallèles).
Le MP4 est envoyé au propriétaire, **jamais versionné ni mis sur le site**.
Numéro du chapitre : `const CHAP = { n: 3, suite: 0 }` dans la source (couverture, tampon, bilan ; `suite` = chapitre de l'écran
de fin et sa vignette, 0 s'il n'existe pas encore, avec `suiteK` pour l'étiquette). Titre court d'une sous-partie en 3e champ de `SP`
(sommaire et carton d'une partie à plus de 4 sous-parties), `haut` sur la couverture pour un titre sur 3 lignes. Schémas animés de
`moteur.js` : `metropole`, `maquila` (chapitre 1), `valse`, `venezuela`, `corridor` (chapitre 3). Fait : chapitre 3 de 2e année
(`hgg2-chapitre3.html`, 100 écrans, 42 min sans voix, novembre 2026).
**Version verticale 9:16** (demande type : « Fais la vidéo du chapitre N en 9:16 », pour Reels, TikTok, Shorts) : même source,
mêmes plans et mêmes durées (la voix d'une version sert à l'autre), option `--format 9:16` sur toutes les commandes de
`generer.py` (1080 × 1920). Le moteur empile les colonnes dans l'ordre des blocs et agrandit chaque écran (zoom des blocs,
jusqu'à 145 %) pour remplir l'espace entre le titre et le pied ; les écrans spéciaux ont leur mise en page verticale
(`.v916` dans `style.css` : couverture, cartons de partie, dates repères sur un axe vertical, fin). `--controle --format 9:16`
signale un écran dont le texte a dû descendre sous 90 % (l'alléger) ou un élément hors cadre. Fait pour le chapitre 1 de
2e année (octobre 2026, sans voix : crédits ElevenLabs insuffisants). **Version courte** (5 à 10 min, demandée par le
propriétaire pour le 9:16 à la place des 50 min de la version complète) : source `outils/video/<hgg1|hgg2>-chapitreN-court.html`,
copie de la source complète réduite à une vingtaine d'écrans clés repris tels quels (couverture, idée du chapitre, cartons
de partie, 4 ou 5 écrans par partie, dates repères, bilan, fin ; liste des numéros en tête de `PLANS`), photo d'un carton de
partie changée si elle répète celle d'un écran voisin. Fait : `hgg2-chapitre1-court.html` (23 écrans, 8 min 50 sans voix,
7 min 09 avec). Sa voix : `<…>-court-voix.txt`, repris des blocs de la version complète, transitions (« D'abord l'intégration
nationale… ») et cartons de partie adaptés ; repères `v` ajoutés dans la source courte.
Voix off (ElevenLabs, voix « Paul K », modèle Multilingual v2) : un texte par écran qui **garde les mots, les noms et les chiffres de l'écran** mais ne le lit
pas mot à mot : il les relie et les explique (le pourquoi, le lien avec l'écran d'avant, l'usage dans une copie), phrases
courtes et orales, faits du cours seulement (une version trop détachée de l'écran a été refusée) ; sigles écrits comme ils se prononcent, écrans séparés par `<break time="2.5s" />`, blocs de moins de 4 500 caractères ; le propriétaire renvoie un
MP3 par bloc. **La voix fixe le tempo** (le propriétaire a trouvé la vidéo « au rythme de lecture » trop lente, il la veut
dynamique) : `python3 outils/video/voix.py prepare --bloc <bloc.mp3>:<premier écran> … --dossier <scratchpad>/voix`
coupe la voix écran par écran, raccourcit les silences et l'accélère de 7 % (15 % jugé « légèrement trop vite ») ; `generer.py … --voix <dossier>/voix.json
[--plans 1-15]` fait durer chaque écran le temps de sa voix plus 0,8 s (4 s au moins) (apparitions resserrées, transitions en
glissement) ; `voix.py poser <html> <video.mp4> <sortie.mp4> --dossier <dossier> [--plans 1-15]` pose la voix. Écran supprimé après l'enregistrement de la voix : `prepare … --ignorer <n° de l'écran dans le texte
de la voix>` jette son morceau et décale les suivants (ainsi l'écran 4 « Quatre chiffres pour commencer » du chapitre 1 de
2e année, retiré : toujours passer `--ignorer 4` avec les blocs de ce chapitre). **Calage sur les mots** : `prepare` transcrit aussi la voix (Whisper, `pip install faster-whisper`,
modèle « small », `WHISPER_DIR` pour son dossier) dans `mots.json`, que `generer.py --voix` lit : chaque élément apparaît
quand la voix dit son mot repère (champ `v` du bloc, `vs: [...]` pour les éléments d'une liste, de chiffres, d'une frise,
de cartes ; sinon ses mots en gras, son chiffre, sa date ou ses premiers mots). Ordre des blocs dans `PLANS` = ordre de la
voix. Vérifier avec `VIDEO.reperes()` (repère trouvé ou ✗ pour chaque élément) et poser un `v` là où la voix dit autre chose
ou où Whisper écorche le mot (« génie » pour Gini, « conne sud » pour Cône Sud).
**Synthèse directe (choix du propriétaire, octobre 2026 : c'est Claude qui fait la voix)** : texte de la voix versionné dans
`outils/video/<hgg1|hgg2>-chapitreN-voix.txt` (un bloc `[N]` par écran, numéros de `PLANS`, sans balise `<break>`), clé
`ELEVENLABS_API_KEY` dans les secrets de l'environnement cloud (lue seulement par une nouvelle session) ;
`python3 outils/video/voix.py synthese <texte> --dossier <scratchpad>/voix [--ecrans 1-15]` remplace `prepare` : un appel
par écran (un écran dont le texte n'a pas changé n'est pas refait), crédits vérifiés avant, durée prévue de la vidéo à la fin
(viser 30 à 40 min pour un chapitre : sinon raccourcir le texte, jamais accélérer au-delà de 7 %). **Compte ElevenLabs en formule gratuite**
(constaté fin octobre 2026, 10 000 caractères par mois) : l'API refuse « Paul K » (voix de la bibliothèque, erreur 402) ;
le propriétaire a choisi **George** (voix incluse, `--voix-id JBFqnCBsd6RMkjVDRZzb`) tant qu'il ne repasse pas en formule payante. Le texte du chapitre 1 de
2e année (`hgg2-chapitre1-voix.txt`, 116 écrans) suit la numérotation actuelle : pas de `--ignorer` avec lui.

**Impression** : bloc `@media print` en fin de `<style>` (fond blanc, A4 pleine largeur, punaises et scotchs gardés et
jamais coupés grâce à `.pin-wrap`, fiches flottantes ou rangées sous le texte quand elles sont plus hautes que lui, aucun
encadré coupé, blanc seulement en bas de page). Pas de PDF du cours proposé sur la page pour l'instant.

**Contrôles** avant mise en ligne, à 1280 et 390 px (Playwright, `auth.js` vide) : aucune erreur JS, pas de défilement
horizontal, images chargées, titres repérés par le script, mode focus sans colonne vide, onglets de « Mes révisions » qui
s'ouvrent, liens de la frise valides, `grep -c '—'` à 0 dans le texte.

### Figures des chapitres d'HGG (photos, graphiques, schémas)

- Anciens chapitres (avant le gabarit « dossier d'archives ») : système des chapitres 2 de 1re année et 1 de 2e année
  (`<figure class="hgg-fig …">`, CSS « kit figures »). Les règles de photos ci-dessous valent pour les deux gabarits.
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
    3 sarcelle, 4 prune, 5 terre cuite, 6 olive.
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
  Littérature, Cinéma, Art et Musique (chiffres du héros, jauges de « Votre parcours », cartes des rubriques), la
  frise de `fiches-auteurs.html` et `nouveautes.js`. Seule reste écrite à la main la carte du cours (nouveau cours).

### Index de la culture générale (`culture-generale.html`)

- Habillage « mosaïque », choisi par le propriétaire sur maquette (octobre 2026), cohérent avec les dossiers bento :
  fond clair `#f3efec`, Bricolage Grotesque, cartes arrondies. En haut, l'en-tête (titre, trois chiffres) et la
  **une** : le dernier dossier en grande carte photo (pastille « Nouveau »), les deux précédents à côté. Dessous,
  recherche, pastilles de thèmes avec compteurs, puis la **grille de tous les dossiers** (3 par ligne au maximum, photos toutes de même taille en 16:10, n°, titre, thème,
  filet à la couleur du dossier), du plus récent au plus ancien. Pas de « tiroirs » par thème.
- Tout vient de `CG_DATA` (lu aussi par `auth.js`, `favoris.js`, `outils/nouveautes.py` et la newsletter) : un
  nouveau dossier s'ajoute **à la fin** de `CG_DATA`, avec ses deux couleurs `g` et `g2` (les `--g` et `--g2` du
  `:root` de sa page), rien d'autre. Les cartes gardent `.actu-card` / `.actu-card-title` (badge Premium, étoile des
  favoris).
- Barre du haut `sn-cg` : **pleine couleur du dossier** (maquette D, `barre-section.css`) ; elle lit `--g` dans le
  `:root` de la page, encre `#1e1610` sur l'index.
- Les dossiers eux-mêmes sont tous au gabarit « bento » : voir « Dossiers de culture générale » juste après.

### Dossiers de culture générale (gabarit « bento »)

Gabarit **« bento »**, choisi par le propriétaire sur maquette (octobre 2026) pour les dossiers
`Culture-Generale/<slug>.html` : cartes arrondies sur une grille de 12 colonnes, **une palette propre à chaque
dossier**. **Les 55 dossiers sont refaits** (octobre 2026, FARC n° 052 et développement durable n° 051 ayant servi de
modèles) : plus aucun n'a l'ancien habillage « archives ». Pour modifier un dossier, partir de sa page actuelle ; pour un
nouveau, copier le plus proche par la forme. Demandes types : « Mets à jour le dossier sur X » (nouvelles données vérifiées par recherche web, mêmes règles de mise en page, `cg-controle.py` jusqu'à 23 ✅), « Fais un dossier de culture générale sur Y » (nouveau dossier). Règle de refonte éventuelle :
**même nom de fichier** (section 1). Palettes (`--g`) déjà prises, à ne pas reprendre : voir
`grep -ho -- '--g:#[0-9a-f]*' Culture-Generale/*.html`. section 1). Demandes types : « Refais le dossier sur X au nouveau gabarit », « Fais un dossier de culture générale
sur Y » (nouveau dossier). **`python3 outils/cg-controle.py Culture-Generale/<slug>.html`** vérifie toutes les
règles ci-dessous (une ligne ✅/❌ par règle, code de sortie 1 s'il reste un ❌, comme `quotidien-controle.py`).
Procédure de A à Z, sans poser de question jusqu'à la mise en ligne :

1. **Données** (nouveau dossier seulement). N° = dernier + 1 (`grep -ho 'Dossier n° [0-9]*' Culture-Generale/*.html
   | sort | tail -1`, dernier connu : 055 Nestlé). Fichier `Culture-Generale/<slug>.html`, image
   `Culture-Generale/images/<slug>.webp` (WebP, 1600 px maximum, **la plus grande photo libre qu'on trouve** : la
   largeur médiane des images actuelles est de 687 px, 46 sur 55 font moins de 800 px), entrée **à la fin** de
   `CG_DATA` dans `culture-generale.html` (`id`, `jour` = dernier + 1, `titre`, `theme`/`domain`, `g`/`g2`, `image`,
   `externalUrl`, `month`, `year`). Une refonte ne touche pas `CG_DATA`.
2. **Page.** Copier `farc.html` (ou `developpement-durable.html`). Le `<head>` garde, dans cet ordre :
   `../auth.js`, `../favoris.js`, charset, viewport, `<title>ECG Prépa — <titre></title>`, `../fonts/fonts.css`, le
   `<style>` du gabarit (ne se complète que pour un nouveau type de bloc, **à la fin**), les balises
   `og:`/`twitter:`/description/canonical, puis `../barre-section.css`. **Refonte** : reprendre ces balises, le
   titre et le texte de l'ancienne page (corrigé et actualisé). **Nouveau dossier** : retirer celles de la copie,
   `outils/images-partage.py` et `outils/referencement.py` les recréent. Barre : `<nav class="sn sn-cg">`
   **sans `sn-dossier`** (le `body` du gabarit n'a pas de marge), fil Accueil / Culture Générale / titre court du
   dossier ; ne pas la restyler.
3. **Palette.** Une par dossier, **jamais deux fois la même** (`grep -ho -- '--g:#[0-9a-f]*' Culture-Generale/*.html`) :
   choisir selon le sujet. Elle est dans `:root` (`--g` principale foncée, `--g2` fond pâle, `--g3` ton moyen, `--y`
   accent clair, `--r` alerte, `--bg` fond de page, `--line` filets, `--ink` encre, `--dim` gris) et dans quelques
   valeurs écrites en dur : remplacer **dans tout le fichier** les valeurs de la copie par celles du nouveau
   dossier (valeurs FARC → exemple du développement durable) : `#7a2a1c` → `#2d6a3e` (`--g`) · `#f6e3dc` →
   `#e3f0e5` (`--g2`) · `#e3b3a5` → `#a9d1b2` (`--g3`) · `#f2c230` → `#e9c64a` (`--y`) · `#b3261e` → `#c0532b`
   (`--r`) · `#5c1d12` → `#1f4a2c` (survol des boutons) · `rgba(122,42,28,.2)` → `rgba(45,106,62,.2)` ·
   `rgba(242,194,48,.22)` → `rgba(233,198,74,.22)` · `#e0782f` → `#8bbf5a` · `#17110e` → `#10201a` (encre) ·
   `#f5f0ea` → `#eef2ea` (fond) · `#e6ddd3` → `#dbe3d6` (filets) · `#33292a` → `#27352b` (texte) · `#6a5a56` →
   `#566358` (gris). Palettes prises : FARC brique `#7a2a1c`, développement durable vert `#2d6a3e`.
4. **Ordre des blocs** (les classes sont dans le `<style>` du gabarit ; tout est dans `<div class="grid">`) :
   - **Titre et photo** : `header.b.title3` (kicker « Dossier n° 0XX · Fiche <type> », boutons Favori et Partager, `h1`
     = titre du dossier, ligne `.meta` « Thème · Thème · 10 min ») et `figure.b.img3.cover` (la photo). **Ni tags, ni
     sous-titre, ni légende sous la photo.** Titre en 7 colonnes, photo en 5, même hauteur.
   - `.ess` « L'essentiel en 30 secondes » (3 points, mots clés en `<strong>`) et `.st` (4 chiffres vérifiés, le 2e en
     `--r`).
   - **4 à 6 sections numérotées** (`.lab` avec `<i>01</i>`), chacune une carte de texte `.txt` en `.c5`/`.c6`/`.c7`,
     **appariée dans sa rangée à une carte visuelle** (7 + 5 ou 6 + 6 colonnes) : mots clés `.gl` (4 définitions
     courtes, nombre pair), schéma `.vis`, chronologie `.tlv`, ou schéma pleine largeur `.sch` / `.camps` / `.duo`.
   - Une **citation en bandeau** `blockquote.b.quote.band` entre deux sections (la plus parlante du dossier, avec sa
     source en capitales dans `<cite>`).
   - Une **chronologie** `.tlv` à côté d'une section : **la plus récente en haut** (`li.cur`, en `--r`).
   - **Analyse** `.analyse` : titre original (jamais « Conclusion »), 2 paragraphes en deux colonnes `.cols2` avec
     lettrine (la première lettre se met seule, `:first-child:first-letter`).
   - **Dans une copie** `.cop` (voir plus bas).
   - **Pour aller plus loin** `.plus.p3` (3 cartes `.carte`) et **Sources** `.src.s4` (3 sources), puis `.fin`
     (« ← Tous les dossiers » et « Partager le dossier »).
5. **Schémas.** Tous pertinents et **variés** (même règle que les articles d'actualité : on part de ce que la section
   doit montrer, jamais d'une forme choisie d'avance), 2 à 4 par dossier, jamais deux de la même forme dans un
   dossier. Formes déjà dans le gabarit : barres comparatives `.bars` (+ `.mini` pour deux chiffres), chaîne d'étapes à
   statuts `.flux`, 5 cases numérotées `.pts5`, arbre `.racine` + `.branches`, frise verticale `.etat`, diagramme de
   Venn en SVG `.venn`, deux cartes en vis-à-vis `.duo`, barre empilée `.pile` + légende `.pleg`, cases `.tuiles`,
   donut `.dn`, trois lectures `.cp`, tableau `.tab`, histogramme vertical `.vbars`, courbe SVG, secteurs `.pie`, trois cartes de couleur `.camps`. Une nouvelle forme s'ajoute à la fin du `<style>` de la page (couleurs par les
   variables). Données sourcées ; une valeur déduite ou approchée est dite sous le schéma (« proportions
   approximatives… »). **Jamais de pastilles de mots isolés sans phrase qui dit ce qu'ils sont** (refusé par le
   propriétaire) : une liste numérotée avec un titre et un sous-titre explicatif.
6. **Contenu.** Faits vérifiés par recherche web (chiffres datés, rien d'inventé). Ce qui ne vient ni du dossier
   d'origine ni d'une recherche (connaissance générale, phrase ajoutée pour égaliser des colonnes, sujets d'une
   copie, sources génériques quand l'ancienne page n'en avait pas) est **signalé au propriétaire dans la réponse**.
   - **Dans une copie** (`.cop`, deux colonnes) : à gauche « Accroche » (`.accroche` : un fait daté et vérifié du
     dossier, puis la question qu'il pose, **4 lignes**) et « Idée-force » (`.idee`) ; à droite « Sujets où la
     placer » (3 sujets, chacun avec **la matière** en pastille : HGG, ESH, philo, Humanité, anglais… **jamais
     « culture générale »**) et `.tip` « Piège à éviter » (l'erreur de fait ou d'interprétation, avec le bon chiffre).
   - **Pour aller plus loin** : 3 cartes **réelles** (autres dossiers de culture générale avec leur vignette
     `images/<slug>.webp`, ou articles d'actualité du site avec leur image), kicker « Dossier n° 0XX » ou « Pays ·
     Mois année » **sur une seule ligne**, jamais de lien de remplissage ni de lien `#`. Pas de carte « Réviser le
     cours » sans chapitre vraiment proche.
   - **Sources** : média ou institution en `<b>`, puis titre et date, 3 sources.
7. **Mise en page, mesurée** (le propriétaire regarde ligne par ligne ; `cg-controle.py` mesure, mais regarder aussi
   des captures Playwright à 1280 et 390 px) :
   - Titre du héros **3 lignes maximum**. Photo **jamais agrandie** : `cover` (qui la fait remplir toute la hauteur
     de la carte, légèrement rognée sur les côtés) seulement si elle fait au moins 480 px de large et 320 px de haut (la règle « aucune image agrandie » de `cg-controle.py` tranche) ; en dessous,
     retirer `cover` : elle reste à sa taille sur le fond flou `.fill`. `alt` qui dit ce que montre la photo.
   - Citation en bandeau : **2 lignes maximum** à 1280 px et plus.
   - **Analyse : les deux colonnes de même hauteur** (ajouter une phrase dans la colonne de gauche ou en retirer une
     à droite). Mesurer avec la **hauteur du paragraphe divisée par son `line-height`** : un comptage par rectangles
     de texte compte la lettrine comme une ligne et se trompe.
   - **Dans une copie** : l'idée-force et le cadre « Piège à éviter » **finissent à la même ligne**, et le cadre rose
     épouse son texte (marge de 23 px, pas de vide dessous) : régler la longueur de l'accroche.
   - **Cartes en rangée** (`.pts5`, `.branches`, `.cp`) : titres **sur une ligne**, descriptions du même nombre
     de lignes (rédiger les textes à longueur égale, la grille partagée `subgrid` aligne le reste ; 5, 3 ou 1 colonne
     selon la largeur).
   - **Pas de grand blanc** : sous le texte d'une carte de récit, 90 px au plus ; si une carte visuelle est plus haute
     que son texte, ajouter au texte une phrase utile (par exemple un paragraphe qui explique le schéma voisin) ou
     un élément pertinent à la carte visuelle, **jamais du remplissage**. Chaque graphique a son petit titre
     (`.lab`) juste au-dessus.
   - Typographie française (espace insécable avant `: ; ! ? »` et après `«`) et **pas de tiret cadratin** (sauf le
     `<title>`). Chronologies et tableaux : le plus récent en premier.
8. **Boutons.** « Favori » branché sur `ECGFav` (objet `ITEM` du script : `id: 'cg:<slug>'`, `titre`, `url`, `image`,
   `theme`, `section: 'cg'`, comme dans `CG_DATA`), visible seulement si l'élève est connecté ; « Partager »
   (`partager(this)` : copie le lien ou ouvre le partage du téléphone). Le script est celui du gabarit : n'adapter que
   `ITEM`. **Pas de sommaire collant, pas de barre de progression** (essayés puis retirés à la demande du
   propriétaire).
9. **Contrôles.** `python3 outils/cg-controle.py Culture-Generale/<slug>.html` (23 règles, à 1920, 1440, 1280, 1000 et
   390 px, `auth.js` remplacé par un script vide) : corriger jusqu'à ce que tout soit ✅. Pièges déjà rencontrés :
   un nettoyage de CSS par `^\.bar` qui supprime aussi `.bars` (comparer les sélecteurs de la page avec ceux du
   gabarit) ; une même classe (`.p3`) donnée à un segment de graphique et à la section « plus loin » ; un
   `style="grid-column:…"` en ligne qui l'emporte sur la media query mobile (utiliser des classes) ; la barre du
   site fait 60 px sur ordinateur et environ 90 px sur téléphone (fil d'Ariane sous la barre).
10. **Mise en ligne** : la séquence de la section 2 (dont le clone « shallow » et les conflits sur fichiers générés).
    `outils/images-partage.py` ne fait rien pour une refonte (l'image de partage des dossiers est un aplat de
    couleur, déjà faite) ; relancer `outils/recherche.py` (l'index change pour ce dossier) et ne pas committer
    `sitemap.xml` d'un clone tronqué.

### Fiches de l'Humanité (cinéma, littérature)

- Mise en page commune (`humanite/cinema/`, `humanite/litterature/`) : bandeau compact, bande
  « En bref » (réalisateur ou auteur, année, genre) avec le plan en pastilles, puis le texte.
  Une nouvelle fiche reprend une fiche existante (`blade-runner.html`, `1984.html`).
- **Affiche / couverture** : `python3 outils/fiche-visuel.py <page> <image>`. Le script crée le
  WebP dans `images/` de la rubrique et ajoute le visuel et le fond flou. **Pas de légende** sous
  l'image. Sans visuel, le bandeau reste en texte seul.
- **Fiches d'art** (`humanite/art/`, copiées de `guernica.html`) : le cadre « À rapprocher » met en parallèle
  **une seule autre œuvre**, de n'importe quel genre (tableau, film, roman, photo…) et pas forcément du site (ex. *Tres de mayo* de Goya pour *Guernica*, *Le Négrier* de
  Turner pour *Le Radeau de la Méduse*) : ressemblances, puis la différence qui éclaire l'œuvre de la fiche.
  Le texte sous le nom de l'auteur dans le bandeau (`.pitch`) fait **3 lignes** à 1280, 1440 et 1920 px, jamais 4.

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
  Hobbes bleu ardoise `#1f4a6e` / ocre `#a35a1f`, Pic de la Mirandole sarcelle `#17645e` / vermillon `#ad3a2c`, La Boétie indigo `#43398a` / ambre `#a8660c`, Montaigne bordeaux `#7d1f2f` / azur `#2a6fb0`. Garder cet habillage pour toutes les fiches (`auteur.css`,
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
