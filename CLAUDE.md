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

« Mets en ligne » = toute la séquence, sans demander :

1. Commit sur la branche de travail de la session, puis `git push -u origin <branche>`.
2. Créer la PR vers `main` et la merger (outils GitHub MCP).
3. Remettre la branche à jour sur `main` :
   `git fetch origin main && git checkout -B <branche> origin/main && git push -u origin <branche> --force-with-lease`

Cloudflare Pages redéploie `main` automatiquement. Le service worker est « réseau
d'abord » et `_headers` désactive le cache : pas de numéro de version à changer.

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
2. Écrire un JSON par PDF dans `newsletter/build/` en copiant l'exemple qui correspond.
   Pour une édition de langue, il faut deux JSON : `-fr` et `-<langue>`.
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
