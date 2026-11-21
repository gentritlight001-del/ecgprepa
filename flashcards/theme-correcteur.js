/* Moteur de correction du thème du jour (flashcards/theme.html).

   Aucune IA : la traduction de l'élève est comparée, morceau par morceau, au corrigé écrit d'avance
   (flashcards/themes/<langue>/<date>.js). Chaque morceau a ses points, ses bonnes tournures (`ok`, expressions
   régulières écrites en minuscules, sans accents ni ponctuation, nombres en chiffres, orthographe américaine)
   et ses fautes prévues (`fautes`, chacune avec son explication). Pour chaque morceau :
     1. chaque faute prévue trouvée n'importe où dans la phrase retire ses points et affiche son explication
        (les motifs de fautes ne doivent donc jamais toucher une traduction juste : outils/theme-controle.py) ;
     2. sinon, une bonne tournure est trouvée → tous les points ;
     3. sinon → « Pas reconnu » (l'élève peut le compter juste).
   Avant de comparer, le texte est mis en forme commune (normaliser) : minuscules, accents, formes contractées
   développées, nombres écrits en chiffres, orthographe britannique ramenée à l'américaine (EQUIV), tirets et
   ponctuation retirés. Les fautes de frappe (une lettre de différence avec un mot du corrigé, mot de 5 lettres
   ou plus, jamais sur la terminaison) sont corrigées et coûtent un quart de point.
   Utilisable dans le navigateur (window.ECGThemeCorrecteur) et sous Node (outils/theme-controle.py). */
(function (racine) {
  'use strict';

  /* Orthographe britannique → américaine, mot à mot (à compléter au fil des thèmes) */
  var EQUIV = {
    aluminium: 'aluminum', neighbour: 'neighbor', neighbours: 'neighbors', neighbouring: 'neighboring',
    labour: 'labor', favour: 'favor', favourable: 'favorable', behaviour: 'behavior', colour: 'color',
    honour: 'honor', harbour: 'harbor', rumour: 'rumor', rumours: 'rumors', endeavour: 'endeavor',
    defence: 'defense', offence: 'offense', licence: 'license', centre: 'center', centres: 'centers',
    metre: 'meter', metres: 'meters', litre: 'liter', theatre: 'theater', programme: 'program', programmes: 'programs',
    travelling: 'traveling', travelled: 'traveled', cancelled: 'canceled', cancelling: 'canceling',
    labelled: 'labeled', modelling: 'modeling', fuelled: 'fueled', signalled: 'signaled',
    catalogue: 'catalog', dialogue: 'dialog', analyse: 'analyze', analysed: 'analyzed', analysing: 'analyzing',
    cheque: 'check', tyre: 'tire', tyres: 'tires', grey: 'gray', judgement: 'judgment', ageing: 'aging',
    enrol: 'enroll', fulfil: 'fulfill', practise: 'practice', sceptical: 'skeptical', communique: 'communique',
    whilst: 'while', amongst: 'among', towards: 'toward', afterwards: 'afterward', percent: 'percent'
  };
  /* -ise / -isation → -ize / -ization, sauf les mots qui s'écrivent toujours en -ise */
  var ISE_GARDES = ('rise arise arisen arising wise otherwise likewise clockwise promise promised promising compromise ' +
    'compromised surprise surprised surprising exercise exercised advise advised adviser advertise advertised ' +
    'advertising comprise comprised comprising enterprise enterprises premise premises praise praised raise raised ' +
    'raising noise poise cruise bruise despise despised devise devised revise revised supervise supervised supervisor ' +
    'televise televised franchise merchandise chastise disguise disguised expertise concise precise precisely incise ' +
    'excise demise paradise treatise reprise rises arises promises surprises exercises advises raises noises').split(' ');
  var GARDE = {};
  ISE_GARDES.forEach(function (m) { GARDE[m] = 1; });

  var UNITES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var DIZAINES = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };

  function mot(m) {
    if (EQUIV[m]) return EQUIV[m];
    if (!GARDE[m]) {
      var r = m.match(/^([a-z]{3,})is(e|ed|es|ing|ation|ations|er|ers)$/);
      if (r) return r[1] + 'iz' + r[2];
    }
    return m;
  }
  function nombres(s) {
    s = s.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[ -](one|two|three|four|five|six|seven|eight|nine)\b/g,
      function (x, d, u) { return String(DIZAINES[d] + UNITES.indexOf(u)); });
    s = s.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/g, function (x, d) { return String(DIZAINES[d]); });
    return s.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\b/g,
      function (x) { return String(UNITES.indexOf(x)); });
  }
  /* « one » reste un mot quand il ne compte rien (« only one neighbour » est un nombre, « one by one » aussi :
     les corrigés écrivent donc 1 dans ces cas). */
  function normaliser(s) {
    s = String(s || '').toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    s = s.replace(/[’‘`´ʼ]/g, "'").replace(/[“”«»]/g, ' ');
    s = s.replace(/(\d)\s*%/g, '$1 percent ').replace(/%/g, ' percent ').replace(/\bper ?cent\b/g, 'percent');
    s = s.replace(/(\d)[\s,.](\d{3})\b/g, '$1$2');
    s = s.replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'can not').replace(/\bcannot\b/g, 'can not')
      .replace(/\bshan't\b/g, 'shall not').replace(/\bain't\b/g, 'is not').replace(/n't\b/g, ' not')
      .replace(/'ve\b/g, ' have').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will').replace(/\bi'm\b/g, 'i am')
      .replace(/'s been\b/g, ' has been').replace(/\b(it|he|she|that|there|what|who|here|where)'s\b/g, '$1 is');
    s = s.replace(/[^a-z0-9' ]+/g, ' ');
    /* L'apostrophe ne reste que dans le génitif (Carney's, the leaders') */
    s = s.replace(/'/g, function (x, k, t) {
      var avant = t.charAt(k - 1), apres = t.charAt(k + 1), apres2 = t.charAt(k + 2);
      if (/[a-z]/.test(avant) && apres === 's' && !/[a-z0-9]/.test(apres2)) return "'";
      if (avant === 's' && !/[a-z0-9]/.test(apres)) return "'";
      return ' ';
    });
    s = s.replace(/\s+/g, ' ').trim();
    s = nombres(s);
    return s.split(' ').map(mot).join(' ');
  }
  /* Les motifs du corrigé passent par la même mise en forme, mot à mot (la syntaxe des expressions est gardée) */
  function normaliserMotif(p) {
    var s = String(p).toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    s = s.replace(/-/g, ' ');
    s = nombres(s);
    return s.replace(/[a-z]+/g, function (m) { return mot(m); });
  }
  var CACHE = {};
  function motif(p) {
    if (!CACHE[p]) CACHE[p] = new RegExp('(?:^| )(?:' + normaliserMotif(p) + ")(?= |$)");
    return CACHE[p];
  }
  /* Renvoie le passage trouvé (sans l'espace de tête), ou null */
  function trouve(listes, texte) {
    for (var i = 0; i < listes.length; i++) {
      var m = motif(listes[i]).exec(texte);
      if (m) return m[0].replace(/^ /, '');
    }
    return null;
  }

  /* Distance d'édition limitée (0, 1 ou 2 = « plus de 1 ») */
  function distance1(a, b) {
    if (a === b) return 0;
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return 2;
    var i = 0, j = 0, diff = 0;
    while (i < la && j < lb) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++diff > 1) return 2;
      if (la > lb) i++;
      else if (lb > la) j++;
      else if (i + 1 < la && a[i] === b[j + 1] && a[i + 1] === b[j]) { i += 2; j += 2; }  // lettres inversées
      else { i++; j++; }
    }
    return diff + (la - i) + (lb - j) > 1 ? 2 : 1;
  }
  /* Différence sur la fin du mot (agrees / agreed, minute / minutes) : c'est une faute de grammaire, pas de frappe */
  function surLaFin(a, b) {
    var n = Math.min(a.length, b.length), k = 0;
    while (k < n && a[k] === b[k]) k++;
    return k >= n - 1;
  }
  function lexique(phrase) {
    if (phrase._lex) return phrase._lex;
    var lex = {};
    function ajouter(p) { (normaliserMotif(p).match(/[a-z']+/g) || []).forEach(function (m) { lex[m.replace(/'/g, '')] = 1; lex[m] = 1; }); }
    (phrase.morceaux || []).forEach(function (m) {
      (m.ok || []).forEach(ajouter);
      (m.fautes || []).forEach(function (f) { (f.re || []).forEach(ajouter); });
    });
    [phrase.proposition].concat(phrase.autres || []).forEach(function (s) { if (s) normaliser(s).split(' ').forEach(function (m) { lex[m] = 1; }); });
    Object.defineProperty(phrase, '_lex', { value: lex, enumerable: false });
    return lex;
  }
  function corrigerFrappe(phrase, texte) {
    var lex = lexique(phrase), mots = Object.keys(lex).filter(function (m) { return m.length >= 5 && !/'/.test(m); });
    var ortho = [];
    var out = texte.split(' ').map(function (t) {
      if (t.length < 5 || lex[t] || /\d|'/.test(t)) return t;
      var c = mots.filter(function (m) { return distance1(t, m) === 1 && !surLaFin(t, m); });
      if (c.length !== 1) return t;
      ortho.push({ faux: t, juste: c[0] });
      return c[0];
    });
    return { texte: out.join(' '), ortho: ortho };
  }

  var FRAPPE = 0.25;
  function arrondi(x) { return Math.round(x * 4) / 4; }

  /* Corrige une phrase. Renvoie { pts, total, morceaux: [{ etat, pts, fautes, passages }], ortho, cartes,
     passagesCartes } ; les passages (texte mis en forme) servent à surligner la traduction de l'élève. */
  function corrigerPhrase(phrase, brut) {
    var total = (phrase.morceaux || []).reduce(function (s, m) { return s + m.pts; }, 0);
    var texte0 = normaliser(brut);
    if (!texte0) return { pts: 0, total: total, vide: true, ortho: [], cartes: [],
      morceaux: phrase.morceaux.map(function () { return { etat: 'vide', pts: 0, fautes: [] }; }) };
    var cf = corrigerFrappe(phrase, texte0), texte = cf.texte;
    var morceaux = phrase.morceaux.map(function (m) {
      /* Les fautes prévues passent d'abord : « the scientists estimate » contient la bonne tournure
         « scientists estimate », mais c'est bien la faute qu'il faut signaler. */
      var fs = [], passages = [];
      (m.fautes || []).forEach(function (f) {
        var t = trouve(f.re || [], texte);
        if (t !== null) { fs.push(f); passages.push(t); }
      });
      if (fs.length) {
        var perte = fs.reduce(function (s, f) { return s + f.pts; }, 0);
        return { etat: 'faute', pts: Math.max(0, m.pts - perte), fautes: fs, passages: passages };
      }
      var ok = trouve(m.ok || [], texte);
      if (ok !== null) return { etat: 'ok', pts: m.pts, fautes: [], passages: [ok] };
      return { etat: 'inconnu', pts: 0, fautes: [], passages: [] };
    });
    var pts = morceaux.reduce(function (s, m) { return s + m.pts; }, 0) - FRAPPE * cf.ortho.length;
    var cartes = [], passagesCartes = [];
    (phrase.cartes || []).forEach(function (c) {
      var t = c.re ? trouve([c.re], texte) : null;
      if (t !== null) { cartes.push(c.id); passagesCartes.push(t); }
    });
    return { pts: arrondi(Math.max(0, pts)), total: total, morceaux: morceaux, ortho: cf.ortho, cartes: cartes, passagesCartes: passagesCartes };
  }

  /* Repère, dans le texte d'origine de l'élève, les mots qui correspondent à un passage mis en forme.
     Renvoie [début, fin] (indices de mots du découpage par espaces), ou null. */
  function situer(brut, passage) {
    var mots = String(brut || '').split(/\s+/).filter(Boolean), plat = [];
    mots.forEach(function (m, i) { normaliser(m).split(' ').filter(Boolean).forEach(function (x) { plat.push({ m: mot(x), i: i }); }); });
    var cible = String(passage || '').split(' ').filter(Boolean);
    if (!cible.length) return null;
    for (var a = 0; a + cible.length <= plat.length; a++) {
      var bon = true;
      for (var b = 0; b < cible.length && bon; b++) if (plat[a + b].m !== cible[b] && distance1(plat[a + b].m, cible[b]) > 1) bon = false;
      if (bon) return [plat[a].i, plat[a + cible.length - 1].i];
    }
    return null;
  }

  var api = { normaliser: normaliser, situer: situer, normaliserMotif: normaliserMotif, corrigerPhrase: corrigerPhrase, arrondi: arrondi, FRAPPE: FRAPPE, EQUIV: EQUIV };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.ECGThemeCorrecteur = api;
})(typeof window !== 'undefined' ? window : this);
