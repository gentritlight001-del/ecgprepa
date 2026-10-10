/* L'anglais au quotidien : construit la page du jour à partir de window.JOUR
   (bloc <script id="donnees"> de chaque page) et gère les exercices.
   Sur l'index, marque les jours terminés et remplit les compteurs. */
(function () {
  'use strict';

  /* Leçons de grammaire de 1re année (../lecon<N>.html) */
  var LECONS = {
    1: 'Le présent simple', 2: "L'impératif", 3: 'Les pronoms', 4: 'Les articles', 5: 'Le génitif',
    6: 'Les quantifieurs', 7: "L'accord sujet-verbe", 8: "L'ordre des mots", 9: 'Les prépositions de lieu et de temps',
    10: 'La ponctuation', 11: 'Nombres, dates et mesures', 12: 'Les verbes irréguliers', 13: 'Le prétérit',
    14: 'Le present perfect', 15: 'Since / For', 16: 'Le past perfect', 17: 'Le futur', 18: 'Les modaux',
    19: 'Les modaux du passé', 20: 'Le conditionnel', 21: "L'hypothèse", 22: 'Comparatifs et superlatifs',
    23: 'Le gérondif', 24: 'Les verbes de perception', 25: 'La voix passive', 26: 'Les propositions relatives',
    27: 'Les conjonctions de subordination', 28: 'Le discours indirect', 29: 'Les structures emphatiques',
    30: 'Les connecteurs logiques'
  };
  /* Durée de chaque étape (minutes) ; le total affiché en tête en est la somme */
  var DUREES = { texte: 5, grammaire: 10, vocabulaire: 6, traduction: 7, bilan: 2 };
  var CLE_FAITS = 'ecg-anglais-quotidien-faits';
  var CLE_REVOIR = 'ecg-anglais-quotidien-a-revoir';  /* mots ratés, gardés d'un jour à l'autre */

  function lireFaits() {
    try { return JSON.parse(localStorage.getItem(CLE_FAITS) || '[]') || []; } catch (e) { return []; }
  }
  function ecrireFaits(l) {
    try { localStorage.setItem(CLE_FAITS, JSON.stringify(l)); } catch (e) { /* stockage indisponible */ }
  }

  function lireRevoir() {
    try { return JSON.parse(localStorage.getItem(CLE_REVOIR) || '[]') || []; } catch (e) { return []; }
  }
  function ecrireRevoir(l) {
    try { localStorage.setItem(CLE_REVOIR, JSON.stringify(l)); } catch (e) { /* stockage indisponible */ }
  }
  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; }
    return t;
  }

  /* Typographie française : espace insécable avant : ; ! ? % » et après « */
  function typo(s) {
    return String(s == null ? '' : s)
      .replace(/ ([:;!?%»])/g, ' $1')
      .replace(/« /g, '« ');
  }
  function normaliser(s) {
    return String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function flash(e) {
    e.classList.add('flash');
    setTimeout(function () { e.classList.remove('flash'); }, 1600);
  }

  /* Exercice à trous : items [{p: 'phrase avec ___', r: ['réponse', …], e: 'explication'}] */
  function exercice(ex) {
    var box = el('div', 'exo');
    box.appendChild(el('div', 'exo-consigne', typo(ex.consigne)));
    var ol = el('ol');
    var champs = [];
    ex.items.forEach(function (it) {
      var li = el('li');
      var morceaux = it.p.split('___');
      li.insertAdjacentHTML('beforeend', morceaux[0]);
      var inp = el('input', 'trou');
      inp.type = 'text';
      inp.setAttribute('autocomplete', 'off');
      inp.setAttribute('autocapitalize', 'off');
      inp.setAttribute('spellcheck', 'false');
      inp.setAttribute('aria-label', 'Réponse');
      inp.size = Math.max(6, (it.r[0] || '').length + 2);
      li.appendChild(inp);
      li.insertAdjacentHTML('beforeend', morceaux.slice(1).join('___'));
      li.appendChild(el('span', 'solution', '→ ' + it.r[0]));
      if (it.e) li.appendChild(el('span', 'expl', typo(it.e)));
      champs.push({ inp: inp, r: it.r.map(normaliser) });
      inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') verifier(); });
      ol.appendChild(li);
    });
    box.appendChild(ol);
    var actions = el('div', 'exo-actions');
    var bV = el('button', 'bouton plein', 'Vérifier'); bV.type = 'button';
    var bC = el('button', 'bouton', 'Voir la correction'); bC.type = 'button';
    var score = el('span', 'score');
    function verifier() {
      var ok = 0;
      champs.forEach(function (c) {
        var v = normaliser(c.inp.value);
        var juste = v && c.r.indexOf(v) !== -1;
        c.inp.classList.toggle('juste', !!juste);
        c.inp.classList.toggle('faux', !juste && !!v);
        if (juste) ok++;
      });
      score.textContent = ok + ' / ' + champs.length + (ok === champs.length ? ' — parfait !' : '');
    }
    bV.addEventListener('click', verifier);
    bC.addEventListener('click', function () {
      var vue = box.classList.toggle('corrige');
      bC.textContent = vue ? 'Masquer la correction' : 'Voir la correction';
    });
    actions.appendChild(bV); actions.appendChild(bC); actions.appendChild(score);
    box.appendChild(actions);
    return box;
  }

  function enteteBloc(id, num, titre, duree) {
    var s = el('section', 'bloc'); s.id = id;
    s.appendChild(el('div', 'bloc-tete',
      '<span class="bloc-num">' + num + '</span><h2 class="bloc-titre">' + typo(titre) + '</h2>' +
      (duree ? '<span class="bloc-duree">' + duree + ' min</span>' : '')));
    return s;
  }

  function listeVocab(titre, mots) {
    var b = el('div', 'liste-vocab');
    b.appendChild(el('div', 'liste-tete', '<b>' + typo(titre) + '</b><span>' + mots.length + ' mots</span>'));
    b.appendChild(el('div', 'liste-mots', mots.map(function (m) {
      return '<div class="en">' + m.en + '</div><div class="fr">' + typo(m.fr) + '</div>';
    }).join('')));
    return b;
  }

  /* Mémoriser : cartes français → anglais. Une carte ratée revient trois cartes plus loin et
     rejoint le paquet « À revoir », gardé d'un jour à l'autre. */
  function memoriser(J, paquetInitial) {
    var paquets = {
      tous: J.vocabulaire.essentiels.concat(J.vocabulaire.theme.mots),
      essentiels: J.vocabulaire.essentiels,
      theme: J.vocabulaire.theme.mots
    };
    var etat = { paquet: paquetInitial || 'tous', file: [], total: 0, sus: 0, rates: 0, carte: null };
    var box = el('div', 'memo'); box.id = 'memoriser';
    var tete = el('div', 'memo-tete', '<h3>Mémoriser · français → anglais</h3>');
    var paquetsBar = el('div', 'memo-paquets');
    var libelles = { tous: 'Tous', essentiels: 'Essentiels', theme: 'Thème', revoir: 'À revoir' };
    Object.keys(libelles).forEach(function (k) {
      var b = el('button', 'memo-paquet', libelles[k]); b.type = 'button'; b.setAttribute('data-paquet', k);
      b.addEventListener('click', function () { etat.paquet = k; demarrer(); });
      paquetsBar.appendChild(b);
    });
    tete.appendChild(paquetsBar);
    box.appendChild(tete);
    var progres = el('div', 'memo-progres', '<div class="memo-jauge"><i></i></div><span></span>');
    box.appendChild(progres);
    var carte = el('div', 'memo-carte');
    carte.tabIndex = 0;
    box.appendChild(carte);
    var actions = el('div', 'memo-actions');
    var bRetourner = el('button', 'bouton plein', 'Retourner la carte'); bRetourner.type = 'button';
    var bRevoir = el('button', 'memo-non', 'À revoir'); bRevoir.type = 'button';
    var bSavais = el('button', 'memo-oui', 'Je savais'); bSavais.type = 'button';
    actions.appendChild(bRetourner); actions.appendChild(bRevoir); actions.appendChild(bSavais);
    box.appendChild(actions);
    var aide = el('p', 'memo-aide', typo('Clavier : espace pour retourner, ← à revoir, → je savais.'));
    box.appendChild(aide);

    function mots() { return etat.paquet === 'revoir' ? lireRevoir() : paquets[etat.paquet]; }
    function majPaquets() {
      var n = lireRevoir().length;
      paquetsBar.querySelectorAll('.memo-paquet').forEach(function (b) {
        var k = b.getAttribute('data-paquet');
        b.classList.toggle('actif', k === etat.paquet);
        b.textContent = libelles[k] + ' (' + (k === 'revoir' ? n : paquets[k].length) + ')';
      });
    }
    function majProgres() {
      progres.querySelector('i').style.width = (etat.total ? Math.round(100 * etat.sus / etat.total) : 0) + '%';
      progres.querySelector('span').textContent = etat.sus + ' / ' + etat.total + ' sus' + (etat.rates ? ' · ' + etat.rates + ' à revoir' : '');
    }
    function demarrer() {
      etat.file = melanger(mots().slice());
      etat.total = etat.file.length; etat.sus = 0; etat.rates = 0;
      majPaquets(); suivante();
    }
    function suivante() {
      majProgres();
      etat.carte = etat.file.shift() || null;
      carte.classList.remove('retournee');
      if (!etat.carte) return fin();
      carte.innerHTML = '<div class="memo-sens">Français → anglais</div>' +
        '<div class="memo-recto">' + typo(etat.carte.fr) + '</div>' +
        '<div class="memo-verso"><div class="memo-trad">' + etat.carte.en + '</div>' +
        (etat.carte.ex ? '<div class="memo-ex">' + etat.carte.ex + '</div>' : '') + '</div>';
      actions.className = 'memo-actions';
      aide.hidden = false;
    }
    function fin() {
      actions.className = 'memo-actions fini';
      aide.hidden = true;
      if (!etat.total) {
        carte.innerHTML = typo('<div class="memo-fin">Aucun mot à revoir pour l’instant.<small>Les mots marqués « À revoir » s’ajoutent ici et vous suivent d’un jour à l’autre.</small></div>');
        return;
      }
      carte.innerHTML = '<div class="memo-fin">' + etat.total + (etat.total > 1 ? ' mots sus' : ' mot su') + ' !<small>' +
        typo(etat.rates ? etat.rates + ' raté' + (etat.rates > 1 ? 's' : '') + ' en route, gardé' + (etat.rates > 1 ? 's' : '') + ' dans « À revoir ».' : 'Aucune erreur.') +
        '</small><span class="memo-fin-actions"><button type="button" class="bouton plein" data-a="refaire">Recommencer</button></span></div>';
      carte.querySelector('[data-a="refaire"]').addEventListener('click', demarrer);
    }
    function retourner() { if (etat.carte) carte.classList.add('retournee'); }
    function savais() {
      if (!etat.carte) return;
      if (etat.paquet === 'revoir') ecrireRevoir(lireRevoir().filter(function (m) { return m.en !== etat.carte.en; }));
      etat.sus++; majPaquets(); suivante();
    }
    function aRevoir() {
      if (!etat.carte) return;
      var l = lireRevoir();
      if (!l.some(function (m) { return m.en === etat.carte.en; })) {
        l.push({ en: etat.carte.en, fr: etat.carte.fr, ex: etat.carte.ex || '', date: J.date });
        ecrireRevoir(l);
      }
      etat.rates++;
      etat.file.splice(Math.min(3, etat.file.length), 0, etat.carte);
      majPaquets(); suivante();
    }
    carte.addEventListener('click', function (ev) { if (!ev.target.closest('button')) retourner(); });
    bRetourner.addEventListener('click', retourner);
    bRevoir.addEventListener('click', aRevoir);
    bSavais.addEventListener('click', savais);
    box.addEventListener('keydown', function (ev) {
      if (/INPUT|TEXTAREA|BUTTON/.test(ev.target.tagName) && ev.key === ' ') return;
      if (ev.key === ' ') { ev.preventDefault(); if (carte.classList.contains('retournee')) return; retourner(); }
      else if (ev.key === 'ArrowLeft' && carte.classList.contains('retournee')) aRevoir();
      else if (ev.key === 'ArrowRight' && carte.classList.contains('retournee')) savais();
    });
    demarrer();
    return box;
  }

  var CHEVRON = '<svg class="g-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  function construireJour(J) {
    var total = Object.keys(DUREES).reduce(function (t, k) { return t + DUREES[k]; }, 0);
    var date = new Date(J.date + 'T12:00:00');
    var dateTxt = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    dateTxt = dateTxt.charAt(0).toUpperCase() + dateTxt.slice(1);

    /* En-tête */
    document.getElementById('hero').innerHTML =
      '<div class="hero-sur mono"><span>Jour ' + J.numero + '</span><span class="point">·</span><span>' + dateTxt +
      '</span><span class="point">·</span><span>' + total + ' min</span></div>' +
      '<h1>' + J.titre + '</h1>' +
      '<p>' + typo(J.chapo) + '</p>';

    var main = document.getElementById('jour');

    /* 1. Le texte */
    var s1 = enteteBloc('texte', '1', 'Lire le texte', DUREES.texte);
    var outils = el('div', 'outils');
    var bRep = el('button', 'bouton on', 'Repères de grammaire'); bRep.type = 'button';
    var bGlo = el('button', 'bouton on', 'Aide au vocabulaire'); bGlo.type = 'button';
    outils.appendChild(bRep); outils.appendChild(bGlo);
    s1.appendChild(outils);
    var papier = el('article', 'texte reperes');
    papier.appendChild(el('div', 't-titre', J.texte.titre));
    papier.appendChild(el('div', 't-source', typo('Texte adapté de notre article : ') + '<a href="' + J.texte.url + '">' + typo(J.texte.article) + '</a>'));
    J.texte.paragraphes.forEach(function (p) {
      papier.appendChild(el('p', null, p
        .replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<span class="v" tabindex="0">$1<span class="bulle">$2</span></span>')
        .replace(/\[(\d+)\|([^\]]+)\]/g, '<span class="g" data-g="$1">$2<sup>$1</sup></span>')));
    });
    s1.appendChild(papier);
    bRep.addEventListener('click', function () { bRep.classList.toggle('on', papier.classList.toggle('reperes')); });
    bGlo.addEventListener('click', function () { bGlo.classList.toggle('on', !papier.classList.toggle('sans-gloses')); });
    papier.addEventListener('click', function (ev) {
      var v = ev.target.closest('.v');
      papier.querySelectorAll('.v.ouvert').forEach(function (o) { if (o !== v) o.classList.remove('ouvert'); });
      if (v) { v.classList.toggle('ouvert'); return; }
      var g = ev.target.closest('.g');
      if (g && papier.classList.contains('reperes')) {
        var c = document.getElementById('g' + g.getAttribute('data-g'));
        if (c) { ouvrir(c, true); c.scrollIntoView({ behavior: 'smooth', block: 'start' }); flash(c); }
      }
    });
    main.appendChild(s1);

    /* 2. La grammaire : accordéon, le premier point ouvert */
    var s2 = enteteBloc('grammaire', '2', 'La grammaire du texte', DUREES.grammaire);
    function ouvrir(c, oui) {
      c.classList.toggle('ouvert', oui);
      c.querySelector('.g-tete').setAttribute('aria-expanded', oui ? 'true' : 'false');
    }
    J.grammaire.forEach(function (g, i) {
      var n = i + 1;
      var c = el('article', 'g-carte'); c.id = 'g' + n;
      var tete = el('button', 'g-tete', '<span class="g-num">' + n + '</span><span class="g-titre">' + typo(g.titre) + '</span>' + CHEVRON);
      tete.type = 'button';
      tete.addEventListener('click', function () { ouvrir(c, !c.classList.contains('ouvert')); });
      c.appendChild(tete);
      var corps = el('div', 'g-corps');
      var cit = el('div', 'citation', '<span class="guillemet" aria-hidden="true">“</span><div class="cit-txt">' + g.citation + '</div>');
      var vers = el('button', 'vers-texte', '↑ dans le texte'); vers.type = 'button';
      vers.addEventListener('click', function () {
        var span = papier.querySelector('.g[data-g="' + n + '"]');
        if (!span) return;
        span.scrollIntoView({ behavior: 'smooth', block: 'center' }); flash(span);
      });
      cit.appendChild(vers);
      corps.appendChild(cit);
      corps.appendChild(el('div', 'rappel', typo(g.rappel)));
      if (g.piege) corps.appendChild(el('div', 'encadre piege', '<div class="encadre-titre">Piège</div>' + typo(g.piege)));
      var liens = el('div', 'liens-lecon');
      (g.liens || [{ lecon: g.lecon, ancre: g.ancre }]).forEach(function (l) {
        var a = el('a', 'lien-lecon', 'Revoir la leçon ' + l.lecon + ' · ' + typo(l.libelle || LECONS[l.lecon]) + ' →');
        a.href = '../lecon' + l.lecon + '.html' + (l.ancre ? '#' + l.ancre : '');
        liens.appendChild(a);
      });
      corps.appendChild(liens);
      if (g.exercice) corps.appendChild(exercice(g.exercice));
      c.appendChild(corps);
      ouvrir(c, i === 0);
      s2.appendChild(c);
    });
    if (J.aussi && J.aussi.length) {
      s2.appendChild(el('h3', 'sous-titre', 'Et aussi dans le texte'));
      var liste = el('div', 'aussi');
      var cat = null;
      J.aussi.forEach(function (a) {
        if (a.cat && a.cat !== cat) { cat = a.cat; liste.appendChild(el('div', 'aussi-cat', typo(cat))); }
        var ligne = el('div', 'aussi-ligne');
        ligne.appendChild(el('div', 'a-ext', a.ext));
        ligne.appendChild(el('div', 'a-regle', typo(a.regle) + (a.ex ? '<span class="a-ex">' + a.ex + '</span>' : '')));
        if (a.lecon) {
          var l = el('a', 'a-lecon', 'Leçon ' + a.lecon + ' →');
          l.href = '../lecon' + a.lecon + '.html' + (a.ancre ? '#' + a.ancre : '');
          l.title = 'Leçon ' + a.lecon + ' : ' + LECONS[a.lecon];
          ligne.appendChild(l);
        }
        liste.appendChild(ligne);
      });
      s2.appendChild(liste);
    }
    main.appendChild(s2);

    /* 3. Le vocabulaire : les deux listes, puis les cartes */
    var s3 = enteteBloc('vocabulaire', '3', 'Le vocabulaire à retenir', DUREES.vocabulaire);
    var listes = el('div', 'listes-vocab');
    var titreTheme = J.vocabulaire.theme.titre;
    listes.appendChild(listeVocab('Les essentiels', J.vocabulaire.essentiels));
    listes.appendChild(listeVocab(titreTheme.charAt(0).toUpperCase() + titreTheme.slice(1), J.vocabulaire.theme.mots));
    s3.appendChild(listes);
    var revoir = location.hash === '#revoir';
    var memo = memoriser(J, revoir ? 'revoir' : null);
    s3.appendChild(memo);
    main.appendChild(s3);

    /* 4. La traduction : onglets Version / Thème */
    var s4 = enteteBloc('traduction', '4', 'Traduire', DUREES.traduction);
    function panneau(items, sens, prefixe) {
      var p = el('div', 'panneau');
      items.forEach(function (t, i) {
        var b = el('div', 'trad');
        var src = sens === 'version' ? t.en : typo(t.fr);
        b.appendChild(el('div', 'trad-source', '<span class="t-num">' + prefixe + (i + 1) + '</span><div>' + src + '</div>'));
        if (t.indice) b.appendChild(el('div', 'trad-indice', typo('Indice : ' + t.indice)));
        var lab = el('label', null, 'Votre traduction');
        var ta = el('textarea'); ta.rows = 2;
        lab.appendChild(ta);
        b.appendChild(lab);
        var modele = sens === 'version' ? typo(t.fr) : t.en;
        var notes = (t.notes || []).map(function (n) { return '<li>' + typo(n) + '</li>'; }).join('');
        var r = el('div', 'encadre proposition', '<div class="encadre-titre">Proposition</div><div class="modele">' + modele + '</div>' + (notes ? '<ul>' + notes + '</ul>' : ''));
        var bv = el('button', 'devoiler', 'Voir la proposition'); bv.type = 'button';
        bv.addEventListener('click', function () {
          var vue = r.classList.toggle('vue');
          bv.textContent = vue ? 'Masquer la proposition' : 'Voir la proposition';
        });
        b.appendChild(bv);
        b.appendChild(r);
        p.appendChild(b);
      });
      return p;
    }
    var onglets = el('div', 'onglets');
    onglets.setAttribute('role', 'tablist');
    var pV = panneau(J.version, 'version', 'V');
    var pT = panneau(J.theme, 'theme', 'T');
    [['Version', pV, J.version.length], ['Thème', pT, J.theme.length]].forEach(function (o, i) {
      var b = el('button', 'onglet' + (i === 0 ? ' actif' : ''), o[0] + ' · ' + o[2] + ' phrases');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        onglets.querySelectorAll('.onglet').forEach(function (x) { x.classList.toggle('actif', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        pV.hidden = o[1] !== pV; pT.hidden = o[1] !== pT;
      });
      onglets.appendChild(b);
    });
    pT.hidden = true;
    s4.appendChild(onglets);
    s4.appendChild(pV);
    s4.appendChild(pT);
    main.appendChild(s4);

    /* 5. Bilan */
    var s5 = enteteBloc('bilan', '5', 'Ce que je retiens', DUREES.bilan);
    s5.appendChild(el('ul', 'bilan', J.bilan.map(function (b) { return '<li><span>' + typo(b) + '</span></li>'; }).join('')));
    var fin = el('div', 'fin');
    var bT = el('button', 'termine'); bT.type = 'button';
    function majBouton() {
      var f = lireFaits().indexOf(J.date) !== -1;
      bT.classList.toggle('fait', f);
      bT.textContent = f ? 'Jour terminé ✓' : 'J’ai terminé ce jour';
    }
    bT.addEventListener('click', function () {
      var l = lireFaits(), i = l.indexOf(J.date);
      if (i === -1) l.push(J.date); else l.splice(i, 1);
      ecrireFaits(l); majBouton();
    });
    majBouton();
    fin.appendChild(bT);
    var ret = el('a', 'retour', '← Tous les jours'); ret.href = 'index.html';
    fin.appendChild(ret);
    s5.appendChild(fin);
    main.appendChild(s5);

    if (revoir) setTimeout(function () { memo.scrollIntoView({ behavior: 'instant', block: 'start' }); }, 150);

    /* Étapes : surligne la section en cours */
    var liensEtapes = document.querySelectorAll('.etapes a');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (!e.isIntersecting) return;
          liensEtapes.forEach(function (a) { a.classList.toggle('actif', a.getAttribute('href') === '#' + e.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('.bloc').forEach(function (b) { obs.observe(b); });
    }
  }

  /* Index : jours terminés, compteurs, carte « Demain » */
  function construireIndex() {
    var faits = lireFaits();
    var cartes = document.querySelectorAll('.jour-card[data-date]');
    cartes.forEach(function (c) { if (faits.indexOf(c.getAttribute('data-date')) !== -1) c.classList.add('fait'); });
    var nf = document.getElementById('nb-faits');
    if (nf) {
      var n = faits.length;
      nf.querySelector('b').textContent = n;
      nf.querySelector('span').textContent = n > 1 ? 'jours terminés' : 'jour terminé';
    }
    var nr = document.getElementById('nb-revoir');
    var une = document.querySelector('.une');
    if (nr) {
      var r = lireRevoir().length;
      nr.querySelector('b').textContent = r;
      nr.querySelector('span').textContent = (r > 1 ? 'mots à revoir' : 'mot à revoir') + ' →';
      if (une) nr.href = une.getAttribute('href') + '#revoir';
    }
    var grille = document.querySelector('.jours-grid');
    if (grille && cartes.length) {
      grille.appendChild(el('div', 'jour-card a-venir', '<span class="j-num">' + (cartes.length + 1) + '</span><span>Demain</span>'));
    }
  }

  function demarrer() {
    if (window.JOUR && document.getElementById('jour')) construireJour(window.JOUR);
    else if (document.querySelector('.jours-grid')) construireIndex();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
