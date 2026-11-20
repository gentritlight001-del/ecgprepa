/* ══════════════════════════════════════════════════════════════
   Fiches de cours de l'espace de cours particuliers de maths (seconde, première…).
   Chaque fiche a un `nbq` (nombre de questions, pour la progression) et un `niveau` (« Seconde », « Première »…), affiché sur sa carte.
   Une fiche = une page cours-particuliers/fiche-NN.html, fermée par
   auth.js comme tout le dossier. Ajouter une ligne ici quand une fiche
   est écrite ; l'administrateur l'ouvre ensuite à chaque élève depuis
   mes-eleves.html (table cp_fiches_ouvertes, par numéro).
   Chargé avec ?v=<minute> (voir CLAUDE.md, section 2).
   ══════════════════════════════════════════════════════════════ */
window.CP_FICHES = [
  { n: 1, nbq: 41, niveau: 'Seconde', titre: 'La fonction racine carrée', sous: 'Racine d\'un nombre, règles de calcul, variations, équations', url: 'cours-particuliers/racine-carree.html' },
  { n: 2, nbq: 44, niveau: 'Première', titre: 'La dérivation', sous: 'Taux de variation, nombre dérivé, tangente, dérivées, variations, optimisation', url: 'cours-particuliers/derivation.html' }
];
