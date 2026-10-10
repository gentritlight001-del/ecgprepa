# ECG Prépa — consignes pour Claude

Site statique de prépa ECG (HTML/CSS/JS, hébergé sur Cloudflare Pages, comptes et
stockage sur Supabase). Ce fichier est relu au début de **chaque** conversation :
toutes les règles valables d'une conversation à l'autre sont ici.

Sommaire : 1. Règles générales · 2. Mise en ligne · 3. Articles d'actualité ·
4. Cours (chapitres, colles, DS) · 5. Newsletters PDF

---

## 1. Règles générales

- Tout le contenu est en **français** (sauf les versions en langue étrangère des articles
  et des newsletters). Typographie française : espace insécable avant `: ; ! ? %` et
  à l'intérieur des « guillemets ».
- **Verrouillage** : ne jamais verrouiller une page ni la rendre Premium. Le propriétaire du
  site le fait lui-même (`auth.js`).
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
   Puis `python3 outils/nouveautes.py` : il régénère `nouveautes.js`, la liste des derniers
   contenus (articles, dossiers de CG, fiches Humanité, chapitres) affichée sous les 4 cartes de
   l'accueil et dans la page `nouveautes.html`. Les dates de mise en ligne sont gardées dans
   `outils/nouveautes-dates.json` (ne jamais modifier ces deux fichiers à la main).
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
faire pareil pour tout nouveau fichier de données `.js`. Pour tous les autres `.js` et `.css`, c'est
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
    connaître… » ni « — solutions rédigées… »). Matrice de passage écrite sans barres verticales.
  - Mettre à jour la carte « Colle de la semaine » de `deuxieme_annee/maths/index.html`.

### Fiches de l'Humanité (cinéma, littérature)

- Mise en page commune (`humanite/cinema/`, `humanite/litterature/`) : bandeau compact, bande
  « En bref » (réalisateur ou auteur, année, genre) avec le plan en pastilles, puis le texte.
  Une nouvelle fiche reprend une fiche existante (`blade-runner.html`, `1984.html`).
- **Affiche / couverture** : `python3 outils/fiche-visuel.py <page> <image>`. Le script crée le
  WebP dans `images/` de la rubrique et ajoute le visuel et le fond flou. **Pas de légende** sous
  l'image. Sans visuel, le bandeau reste en texte seul.

### L'anglais au quotidien (1re année)

Un « coin » de pratique par matière, comme les colles de maths de 2e année. Le premier :
`premiere_annee/langues/anglais/quotidien/`, un texte d'actualité par jour, décortiqué pour
travailler surtout la grammaire de 1re année. Demande type : « Fais le texte du jour d'anglais ».

- `index.html` : la carte « Le texte du jour » (`.une`) et la grille `jours-grid` (le nouveau
  jour **en tête**, avec `data-date` et `data-lecons` = numéros des leçons des cartes de
  grammaire, qui alimentent le filtre par leçon).
- `jour-AAAA-MM-JJ.html` : une page par jour. Copier la page du dernier jour et ne changer que
  le `<title>`, la description, « Jour N » dans le fil d'Ariane et le bloc
  `<script id="donnees">`. `quotidien.js` construit tout ; `quotidien.css` est commun.
- Mettre aussi à jour la carte « Le texte du jour » de la barre latérale de
  `premiere_annee/langues/anglais/index.html`.

Contenu d'un jour (le bloc de données du 10 octobre 2026 sert de modèle) :
- **Texte** : le plus récent article de l'édition anglophone (`ACTU_DATA` de
  `actualites/en/tous-en.html`) pas encore utilisé, version anglaise (`ap-en-section`). Extrait
  de 250 à 350 mots en 4 à 6 paragraphes, légèrement adapté pour qu'il se lise seul. Balises :
  `[n|…]` = repère du point de grammaire n (dans l'ordre du texte ; un même n peut revenir),
  `{mot|traduction}` = aide au vocabulaire (8 à 15 mots).
- **Compréhension** : 3 ou 4 questions en anglais, réponses en anglais.
- **Grammaire** : 5 ou 6 cartes, une par repère : titre, citation (forme en `<mark>`), rappel
  court, piège du francophone, leçon et ancre (`lecon` + `ancre` = `id` d'une `<section>` de
  `../lecon<N>.html`), exercice de 3 ou 4 phrases à trous (`___`, réponses acceptées dans
  `r`). Puis `aussi` : 4 à 8 points courts (articles, prépositions, nombres, connecteurs…),
  chacun avec sa leçon. Seulement des leçons de 1re année, rien d'inventé hors du texte.
- **Vocabulaire** : 12 à 15 « essentiels » réutilisables dans n'importe quelle copie (verbes de
  presse, connecteurs, tournures), 12 à 18 mots du thème, chacun avec un exemple ; un exercice
  de réemploi de 6 à 8 phrases.
- **Traduction** : version de 3 phrases du texte, thème de 5 phrases qui réemploient la
  grammaire et le vocabulaire du jour, chacune avec traduction proposée et 2 ou 3 remarques.
- **Bilan** : 4 ou 5 phrases.
- Vérifier avec Playwright : aucune erreur JS, et chaque exercice rempli avec `r[0]` donne
  « parfait ». Typographie française gérée par `quotidien.js` pour les champs en français.

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
