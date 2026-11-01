# Documentaire · HGG 2e année · Chapitre 2 · Les États-Unis : découpage des 5 premières minutes

Format 1920 × 1080, 25 i/s, ton reportage. La voix (`hgg2-chapitre2-doc-voix.txt`, 713 mots, environ 5 min 10)
fixe le tempo ; chaque séquence [N] correspond au bloc [N] de la voix.

Les sources d'archives sont libres de droits (gouvernement fédéral américain = domaine public : DVIDS, NASA, NARA, LOC ;
Wikimedia Commons avec licence vérifiée fichier par fichier).
« Site » = photo déjà sur le site, dans `deuxieme_annee/hgg/images/`.
Cartes et schémas animés : faits par Claude (fonds `us-atlas` / `world-atlas`, installés depuis npm).

| N | Durée | Images | Texte à l'écran | Musique |
|---|---|---|---|---|
| 1 | 0:00-0:15 | **Vidéo** : porte-avions qui appareille (DVIDS, « USS Gerald R. Ford departs Norfolk ») ; cloche du NYSE (DVIDS ou archive.org) ; panneau Hollywood (site, lent zoom) | aucun | piste A : nappe grave, pulsation |
| 2 | 0:15-0:40 | Montage rapide : Pentagone (site), Manhattan (site), Falcon Heavy (site, ou vidéo NASA/SpaceX libre) | 4 chiffres qui s'affichent : 29 200 Md$ · 1/3 · 341 M · 40 000 Md$ (en rouge) | montée, coup sourd sur la dette |
| 3 | 0:40-0:50 | **Vidéo** : la Terre de nuit, Amérique du Nord éclairée (NASA « Black Marble ») | Titre : « Les États-Unis · Pouvoir de, pouvoir sur, pouvoir limité » puis la problématique | silence puis thème principal |
| 4 | 0:50-1:05 | Portrait de Raymond Aron (Commons, si licence libre ; sinon couverture *Paix et guerre entre les nations*) | Citation d'Aron en coupure de journal | piste B : pensive (piano, cordes) |
| 5 | 1:05-1:20 | Schéma animé : 4 flèches « faire / faire faire / empêcher / refuser » | « Serge Sur : une quadruple capacité » | B |
| 6 | 1:20-1:45 | Portrait de Nye (site) ; triptyque animé hard / soft / smart, chaque case illustrée (porte-avions, Hollywood, Capitole) | hard power · soft power · smart power (Nossel, 2004) | B |
| 7 | 1:45-2:15 | *American Progress* de John Gast (site) en panoramique lent, de gauche à droite comme la marche vers l'Ouest | « Destinée manifeste » · « City upon a hill » | piste C : americana (cordes, cuivres doux) |
| 8 | 2:15-2:40 | Portrait de Florian Louis (site) ; couverture du livre de Paul Kennedy (1987) | « Imperial overstretch » | tension, cordes graves |
| 9 | 2:40-3:00 | **Graphique animé** : part des États-Unis dans le PIB mondial, 1960 40 %, 2000 30 %, 2011 21 %, 2024 26 % (Banque mondiale) | chiffres sur les barres | B, coup sur « 26 % » |
| 10 | 3:00-3:20 | **Vidéo** : Shanghai, Pudong (site en photo, ou vidéo Commons) ; **carte animée** : poids des États-Unis et de la Chine | « Un monde post-américain ? » (Zakaria, 2008) | tension |
| 11 | 3:20-3:40 | Portrait de Nye (site) ; trois pictogrammes qui s'allument : économie, armée, soft power | « Le siècle américain n'est pas fini » | retour du thème principal |
| 12 | 3:40-3:45 | Carton de partie : « I · Le pouvoir de… » sur photo de Monument Valley (site) | « Partie I · Un territoire » | piste C démarre |
| 13 | 3:45-4:05 | **Carte animée** : relief des États-Unis, trois façades qui s'allument, puis les 5 grands ensembles d'est en ouest | 9,15 M km² · Atlantique · Pacifique · golfe du Mexique | C |
| 14 | 4:05-4:25 | **Carte animée** : la formation du territoire, 1783 puis Louisiane 1803, puis Alaska 1867 | dates sur la carte | C, accent sur 1803 |
| 15 | 4:25-4:45 | **Vidéo/photos** : chariots de pionniers (LOC / NARA), portrait de Turner (Commons, domaine public) | « La Frontier » · 1890 · Turner 1893 | C |
| 16 | 4:45-4:55 | Photos de la guerre de Sécession (LOC, Mathew Brady, domaine public) en lent zoom | « 1861-1865 · plus de 750 000 morts » | cordes graves, sobre |
| 17 | 4:55-5:10 | Schéma animé : un carré de township qui se divise ; fondu vers la photo satellite des pivots du Kansas (site) | « Land Ordinance 1785 · Homestead Act 1862 » | C |
| 18 | 5:10-5:25 | Photo d'A. J. Russell, Promontory Summit 1869 (site) ; **vidéo** d'une locomotive à vapeur (archive.org, Prelinger, ou film Edison) | « 10 mai 1869 » | final, cuivres, coupe nette |

## Musique (fournie par le propriétaire)

Trois pistes libres de droits, de 3 à 4 minutes chacune, en MP3 :
- **A · ouverture** : épique et tendue, percussions graves, montée (Pixabay, recherche « dramatic » ou « epic cinematic »).
- **B · réflexion** : piano et cordes, calme, sans batterie (Pixabay « cinematic documentary » ; Lexin_Music, vitalsource).
- **C · americana** : cordes et cuivres doux, guitare ou banjo possible, sentiment d'élan (Pixabay « americana », « western cinematic »).

Montage : musique baissée sous la voix (environ −18 dB, remontée entre deux phrases), coupes des plans sur les temps
forts, fondus enchaînés entre pistes.

## Montage (fait le 1er novembre 2026, version sans voix)

Source : `hgg2-chapitre2-doc.html` (une fonction par séquence, durées du tableau ci-dessus, 5 min 25), rendue par
`python3 outils/video/generer.py outils/video/hgg2-chapitre2-doc.html <muet.mp4>`, puis musique posée avec ffmpeg.
Images d'archives ajoutées dans `images/doc-hgg2-ch2/` (crédits en tête de la source), fonds de carte dans `donnees/`.

Substitutions par rapport au tableau : pas de vidéo (porte-avions, Terre de nuit, locomotive) mais des photos animées
(NYSE vers 1908, NASA Black Marble 2012, gravure du *Harper's Weekly* de juin 1869) ; pas de couverture du livre de
Kennedy (droits) mais une fiche typographique ; pas de portrait de Turner (Commons inaccessible) mais une fiche ;
séquence 16 : *A harvest of death* (Gettysburg, 1863) puis les ruines de Richmond (1865).

Musiques fournies par le propriétaire (Pixabay, non versionnées), début dans la vidéo → fin, décalage dans la piste :

| Piste | Vidéo | Décalage | Gain |
|---|---|---|---|
| adamasr « Dark Score » (ouverture) | 0:00 → 0:52 | 0 s | 0 dB |
| leberch « Suspense Music » (réflexion) | 0:50 → 1:47 | 0 s | −2,5 dB |
| leberch « Suspense » (exceptionnalisme) | 1:45 → 2:17 | 0 s | −2,5 dB |
| leberch « Tense » (déclin) | 2:15 → 3:22 | 0 s | −2,5 dB |
| adamasr « Dark Score » (retour du thème) | 3:20 → 3:48 | 40 s | 0 dB |
| « Inspiring Epic Motivation Cinematic Trailer » (partie I) | 3:46 → 5:25 | 0 s | −4,5 dB |

Fondus enchaînés de 2 à 2,5 s ; la piste épique est calée pour que son dernier temps fort tombe sur la coupe finale
(5:25). Sans voix, la musique est à pleine hauteur ; avec la voix, la baisser d'environ 18 dB sous les phrases.
