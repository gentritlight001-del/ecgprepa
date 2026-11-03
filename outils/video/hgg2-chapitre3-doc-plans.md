# Documentaire · HGG 2e année · Chapitre 3 · L'Amérique latine : découpage

Version « documentaire » demandée par le propriétaire en novembre 2026, à la place de la vidéo de cours : imagée, façon
documentaire Arte, pour les réseaux, **sans voix off** et **15 min au plus**. Format 16:9 (1920 × 1080, 25 i/s), habillage
« cinéma sobre » du documentaire du chapitre 2 (fond noir, photos plein cadre en Ken Burns, cartes animées, accent or).
Le propos passe par des **phrases courtes à l'écran** (Fraunces 46 px, petit titre or au-dessus) : chaque plan dure le
temps de lire ses phrases (3 mots/s + 1,2 s, 3 s au moins), d'où un tempo réglé dans la source (`LECT`, `lire`).

Source : `hgg2-chapitre3-doc.html` (14 min 04). Contenu repris du cours (`deuxieme_annee/hgg/chapitre-3-hgg.html`) et de
la vidéo de cours (`hgg2-chapitre3.html`), rien de nouveau sauf les faits signalés plus bas. Images : photos libres déjà
sur le site (Commons, NASA), dans `deuxieme_annee/hgg/images/` et `premiere_annee/hgg/chapitre-N/images/` ; cartes
world-atlas 50m (`donnees/world-atlas-countries-50m.js`).

```
python3 outils/video/generer.py outils/video/hgg2-chapitre3-doc.html --controle
python3 outils/video/generer.py outils/video/hgg2-chapitre3-doc.html <scratchpad>/doc-muet.mp4
python3 outils/video/doc-musique.py outils/video/hgg2-chapitre3-doc.html <scratchpad>/doc-muet.mp4 <scratchpad>/doc.mp4 --musiques <mp3>
```

Le contrôle signale aussi une phrase de plus de 3 lignes, un texte qui sort du cadre et un tiret cadratin.

| N | Séquence | Images | Musique (fournie, Pixabay) |
|---|---|---|---|
| 1 | Ouverture : Potosí, 1545 | Cerro Rico, gravure de la mine, carte Potosí → Séville, cuivre / lithium / soja / pétrole, avenue Paulista | atlasaudio « Tragic Piano » |
| 2 | Titre | l'Amérique vue de l'espace | skilsel « Epic Cinema Trailer » (depuis 38 s) |
| 3 | Émergence, crise : la question | cartons de définition, carte, problématique et plan | leberch « Suspense Music » |
| 4 | Partie I | Cerro Rico | sub_clair « Earth Documentary » (4 à 6) |
| 5 | Le modèle agro-minier | carte animée mines / plantations / éventail / Europe, cycles du Brésil, Galeano, Wall Street 1929 | id. |
| 6 | L'ISI | carte Vargas, Cárdenas, Perón, CEPAL ; Prebisch ; termes de l'échange ; entreprises publiques ; Brasília | id. |
| 7 | La dette et le virage néolibéral | dette ×6, août 1982, Bretton Woods, décennie perdue, La Moneda 1973, valse des paradigmes | leberch « Tense » |
| 8 | Vague rose et Chine | Chávez, néo-extractivisme, carte des flux vers la Chine, échanges, Chancay | skilsel « Epic Cinema Adventure » (8 à 10) |
| 9 | La reprimarisation | 27 → 42 %, Chuquicamata, triangle du lithium, salar d'Atacama, fronts pionniers, énergie | id. |
| 10 | Infrastructures | canal de Panama, corridor bi-océanique et effet tunnel | id. |
| 11 | Partie II | incendies en Amazonie | leberch « Suspense » (11 à 14) |
| 12 | Dépendance | fin du supercycle, malédiction des ressources, Maracaibo, production vénézuélienne, Cúcuta, 2026 | id. |
| 13 | Inégalités | citation de Ricardo Lagos, piège du revenu intermédiaire, PIB par habitant, informel | id. |
| 14 | Environnement | Amazonie, déforestation, orpaillage, Brumadinho, Svampa, Itaipu | id. |
| 15 | Partie III | Sanhattan (Santiago) | skilsel « Epic Documentary Inspirational » (15 à 18) |
| 16 | Métropoles | avenue Paulista, grandes métropoles, Santa Fe | id. |
| 17 | Niveaux d'émergence | carte de Carroué, Guyana et Haïti | id. |
| 18 | Le Brésil | Brasília par satellite, ferme du monde et firmes, COP30, puissance incomplète | id. |
| 19 | Conclusion | Cerro Rico, « À retenir », fin | « Inspiring Epic Motivation » |

La table des musiques est dans la source (bloc `id="musique"`), lue par `doc-musique.py` ; « Space Music » n'est pas
utilisée. Une piste plus courte que son groupe de séquences commencerait en retard : vérifier les durées après une
modification (`VIDEO.plans`).

Faits ajoutés hors du cours (signalés au propriétaire) : l'argent de Potosí vers **Séville**, le siège de la CEPAL à
**Santiago**, l'hôtel de Bretton Woods (naissance du FMI et de la Banque mondiale, 1944).

Pas de photo d'un autre lieu sous un fait précis : Brumadinho, août 1982 et Guyana / Haïti sont des cartons sur fond noir
(aucune photo libre en haute définition disponible sur le site).
