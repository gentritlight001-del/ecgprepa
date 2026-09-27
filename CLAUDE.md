# Newsletters PDF — ECG Prépa

Ce dossier sert à produire les newsletters hebdomadaires : une page A4, style journal,
au format PDF. Tout se joue dans `newsletter/`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `newsletter/gabarit-newsletter.html` | le gabarit figé — **le `<style>` ne se réécrit jamais** |
| `newsletter/generer-pdf.py` | conversion HTML → PDF + contrôle d'une seule page |
| `newsletter/fonts/` | polices Lora et Poppins du gabarit, chargées automatiquement par le script |
| `newsletter/build/` | copies de travail du gabarit, une par numéro |
| `newsletter/out/` | les PDF livrés et leurs captures de contrôle |

## Procédure

1. Copier `gabarit-newsletter.html` dans `build/<edition>-<date>.html`.
2. Remplacer **uniquement** les `{{CHAMPS}}` et les jetons d'images
   `__IMG_UNE__`, `__IMG_1__`, `__IMG_2__`, `__IMG_3__` (data URI base64).
3. Lancer :
   `python newsletter/generer-pdf.py newsletter/build/<fichier>.html "newsletter/out/<NOM DU PDF>.pdf"`
4. Relire la capture PNG produite à côté du PDF avant de livrer.

## Sources du contenu

- Articles : `actualites/<code>/articles/<slug>.html`, avec `<code>` = `en`, `es`, `de`
  ou `monde`. La liste et les dates sont dans `ACTU_DATA`, dans `actualites/<code>/tous-<code>.html`.
  Culture générale : `Culture-Generale/<slug>.html` (C et G majuscules) ; la liste des
  dossiers et leurs numéros sont dans `CG_DATA`, dans `culture-generale.html` à la racine.
- Images : `actualites/<code>/images/<slug>.webp` (format WebP), encodées en base64
  (`data:image/webp;base64,…`) et **laissées en couleur**. L'image de une doit être en format paysage : si le meilleur
  article a une photo en portrait, choisir un autre article pour la une.
- Liens cliquables : `https://ecg-prepa.fr/actualites/<code langue>/articles/<slug>.html`
  (culture générale : `https://ecg-prepa.fr/Culture-Generale/<slug>`, sans `.html`).

## Règles de rédaction

- **Une + 3 brèves du bas** : les articles les plus importants de la période.
- **Colonne de droite** : 3 petites actualités réelles, cherchées avec WebSearch,
  absentes du site (sinon doublon), jamais postérieures à la date du numéro.
  Ajouter les sources au pied de page.
- **Le chiffre** : un fait **actuel** lié à la une (cours, indice, bilan du jour),
  vérifié avec WebSearch. Ni une donnée du bandeau de chiffres, ni une donnée déjà
  citée dans l'article.
- **Encadré bas de colonne** : vocabulaire de 12 entrées (aucune sur deux lignes)
  pour les éditions de langue ; « Le mot du numéro » pour la mondiale et la culture
  générale.
- **Les 3 titres du bas** doivent tenir sur 2 lignes chacun, pour que les paragraphes
  démarrent à la même ligne.

## En cas de débordement

Raccourcir la rédaction, en commençant par la colonne la plus haute
(`.col-side` ou `.col-lead`). **Ne jamais** toucher aux tailles de police, à la hauteur
des images, aux marges ni au nombre de lignes du vocabulaire.

## Nom des fichiers

`<CODE> - Newsletter <Édition> - Semaine du <jour> <mois> <année>.pdf`

- Germanophone : `FR - Newsletter Germanophone - …` puis `DE - Newsletter Germanophone - …`
- Anglophone : `FR - Newsletter Anglophone - …` puis `EN - Newsletter Anglophone - …`
- Hispanophone : `FR - Newsletter Hispanophone - …` puis `ES - Newsletter Hispanophone - …`
- Mondiale : `MONDE - Newsletter - …` (français uniquement)
- Culture générale : `CG - Newsletter - …` (français uniquement)

## Prérequis

```bash
pip install playwright pypdf pillow
playwright install chromium
```

Dans l'environnement cloud de Claude Code, Chromium est déjà installé : si
`playwright install` est impossible, le script utilise `/opt/pw-browsers/chromium`
(ou le chemin donné par la variable `CHROMIUM_PATH`).
