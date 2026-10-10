/* L'anglais au quotidien : construit la page du jour à partir de window.JOUR
   (bloc <script id="donnees"> de chaque page) et gère les exercices.
   Sur l'index, marque les jours déjà terminés et filtre les cartes par leçon. */
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
  var CLE_FAITS = 'ecg-anglais-quotidien-faits';

  function lireFaits() {
    try { return JSON.parse(localStorage.getItem(CLE_FAITS) || '[]') || []; } catch (e) { return []; }
  }
  function ecrireFaits(l) {
    try { localStorage.setItem(CLE_FAITS, JSON.stringify(l)); } catch (e) { /* stockage indisponible */ }
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
  function lienLecon(num, ancre, court) {
    var a = el('a', 'lien-lecon');
    a.href = '../lecon' + num + '.html' + (ancre ? '#' + ancre : '');
    a.innerHTML = (court ? '' : 'Revoir la ') + '<b>leçon ' + num + '</b> · ' + LECONS[num] + ' →';
    return a;
  }
  function flash(e) {
    e.classList.add('flash');
    setTimeout(function () { e.classList.remove('flash'); }, 1600);
  }
  function boutonDevoiler(cible, libelle, libelleCache) {
    var b = el('button', 'devoiler', libelle);
    b.type = 'button';
    b.addEventListener('click', function () {
      var vue = cible.classList.toggle('vue');
      b.textContent = vue ? (libelleCache || 'Masquer') : libelle;
    });
    return b;
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

  function enteteBloc(id, num, tag, titre, intro) {
    var s = el('section', 'bloc'); s.id = id;
    s.appendChild(el('div', 'bloc-tete',
      '<div class="bloc-num">' + num + '</div><div><div class="bloc-tag">' + tag + '</div><div class="bloc-titre">' + typo(titre) + '</div></div>'));
    if (intro) s.appendChild(el('p', 'bloc-intro', typo(intro)));
    return s;
  }

  function tableVocab(mots) {
    var t = el('table', 'vocab cache-fr');
    t.innerHTML = '<thead><tr><th>Anglais</th><th>Français</th><th>Dans une phrase</th></tr></thead>';
    var tb = el('tbody');
    mots.forEach(function (m) {
      var tr = el('tr');
      tr.appendChild(el('td', 'en', m.en));
      var fr = el('td', 'fr', '<span>' + typo(m.fr) + '</span>');
      fr.addEventListener('click', function () { fr.classList.toggle('vu'); });
      tr.appendChild(fr);
      tr.appendChild(el('td', 'ex', m.ex || ''));
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    return t;
  }
  function interrupteurVocab(table) {
    var outils = el('div', 'outils');
    var b = el('button', 'bouton on', 'Mode révision : français caché'); b.type = 'button';
    b.addEventListener('click', function () {
      var cache = table.classList.toggle('cache-fr');
      b.classList.toggle('on', cache);
      b.textContent = cache ? 'Mode révision : français caché' : 'Afficher tout le français';
      table.querySelectorAll('td.fr.vu').forEach(function (td) { td.classList.remove('vu'); });
    });
    outils.appendChild(b);
    outils.appendChild(el('span', 'score', 'Touchez une case pour vérifier.'));
    return outils;
  }

  function construireJour(J) {
    var date = new Date(J.date + 'T12:00:00');
    var dateTxt = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    /* En-tête */
    var hero = document.getElementById('hero');
    hero.innerHTML =
      '<div class="page-eyebrow"><span>🇬🇧 Daily English</span><span>·</span><span>Jour ' + J.numero + '</span><span>·</span><span>' + dateTxt + '</span></div>' +
      '<h1 class="page-title">' + J.titre + '</h1>' +
      '<p class="page-lead">' + typo(J.chapo) + '</p>';
    var tags = el('div', 'tags');
    [J.pays, J.sujet, '≈ ' + (J.duree || 20) + ' min'].forEach(function (t, i) {
      if (t) tags.appendChild(el('span', 'tag' + (i === 0 ? ' or' : ''), t));
    });
    hero.appendChild(tags);

    var main = document.getElementById('jour');

    /* 1. Le texte */
    var s1 = enteteBloc('texte', '1', 'Read · 5 min', 'Lire le texte',
      "Lisez d'abord le texte en entier, sans dictionnaire. Les repères bleus signalent la grammaire étudiée en 2 (cliquez dessus), les mots soulignés en pointillé se traduisent au survol ou d'une touche.");
    var outils = el('div', 'outils');
    var bRep = el('button', 'bouton on', 'Repères de grammaire'); bRep.type = 'button';
    var bGlo = el('button', 'bouton on', 'Aide au vocabulaire'); bGlo.type = 'button';
    outils.appendChild(bRep); outils.appendChild(bGlo);
    s1.appendChild(outils);
    var papier = el('article', 'texte reperes');
    papier.appendChild(el('div', 't-titre', J.texte.titre));
    papier.appendChild(el('div', 't-source', 'Texte adapté de notre article : <a href="' + J.texte.url + '">' + typo(J.texte.article) + '</a>'));
    J.texte.paragraphes.forEach(function (p, i) {
      var h = p
        .replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<span class="v" tabindex="0">$1<span class="bulle">$2</span></span>')
        .replace(/\[(\d+)\|([^\]]+)\]/g, '<span class="g" data-g="$1">$2<sup>$1</sup></span>');
      papier.appendChild(el('p', null, '<span class="p-num">§' + (i + 1) + '</span>' + h));
    });
    s1.appendChild(papier);
    s1.appendChild(el('div', 'legende', '<span><i class="lg-g"></i>point de grammaire (cliquez)</span><span><i class="lg-v"></i>mot traduit au survol</span><span>§ = paragraphe</span>'));
    bRep.addEventListener('click', function () { bRep.classList.toggle('on', papier.classList.toggle('reperes')); });
    bGlo.addEventListener('click', function () { bGlo.classList.toggle('on', !papier.classList.toggle('sans-gloses')); });
    papier.addEventListener('click', function (ev) {
      var v = ev.target.closest('.v');
      papier.querySelectorAll('.v.ouvert').forEach(function (o) { if (o !== v) o.classList.remove('ouvert'); });
      if (v) { v.classList.toggle('ouvert'); return; }
      var g = ev.target.closest('.g');
      if (g && papier.classList.contains('reperes')) {
        var carte = document.getElementById('g' + g.getAttribute('data-g'));
        if (carte) { carte.scrollIntoView({ behavior: 'smooth', block: 'start' }); flash(carte); }
      }
    });
    main.appendChild(s1);

    /* 2. La grammaire */
    var s2 = enteteBloc('grammaire', '2', 'Grammar · 8 min', 'La grammaire du texte',
      "Chaque point part d'une phrase du texte : le rappel, le piège à éviter, la leçon du cours à revoir, puis un exercice rapide.");
    J.grammaire.forEach(function (g, i) {
      var n = i + 1;
      var c = el('div', 'g-carte'); c.id = 'g' + n;
      c.appendChild(el('div', 'g-tete', '<span class="g-num">' + n + '</span><span class="g-titre">' + typo(g.titre) + '</span>'));
      var cit = el('div', 'citation', '“' + g.citation + '”');
      var vers = el('span', 'vers-texte', '↑ dans le texte');
      vers.addEventListener('click', function () {
        var span = papier.querySelector('.g[data-g="' + n + '"]');
        if (!span) return;
        span.scrollIntoView({ behavior: 'smooth', block: 'center' }); flash(span);
      });
      cit.appendChild(vers);
      c.appendChild(cit);
      c.appendChild(el('div', 'rappel', typo(g.rappel)));
      if (g.piege) c.appendChild(el('div', 'piege', typo(g.piege)));
      c.appendChild(lienLecon(g.lecon, g.ancre));
      if (g.exercice) c.appendChild(exercice(g.exercice));
      s2.appendChild(c);
    });
    if (J.aussi && J.aussi.length) {
      s2.appendChild(el('h3', 'sous-titre', 'Et aussi dans le texte'));
      s2.appendChild(el('p', 'sous-intro', 'Les autres points du texte, une ligne chacun : la phrase, la règle, un exemple, la leçon.'));
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

    /* 3. Le vocabulaire */
    var s3 = enteteBloc('vocabulaire', '3', 'Vocabulary · 4 min', 'Le vocabulaire à retenir',
      "D'abord les mots qui servent partout (dans n'importe quelle copie ou colle), puis le vocabulaire du thème. Cachez le français et testez-vous.");
    s3.appendChild(el('h3', 'sous-titre', 'Les essentiels, utiles partout'));
    s3.appendChild(el('p', 'sous-intro', 'Verbes et tournures de presse à réemployer dans vos essais et vos commentaires.'));
    var t1 = tableVocab(J.vocabulaire.essentiels);
    s3.appendChild(interrupteurVocab(t1)); s3.appendChild(t1);
    s3.appendChild(el('h3', 'sous-titre', typo('Vocabulaire du thème : ' + J.vocabulaire.theme.titre)));
    s3.appendChild(el('p', 'sous-intro', 'Les mots propres au sujet du jour.'));
    var t2 = tableVocab(J.vocabulaire.theme.mots);
    s3.appendChild(interrupteurVocab(t2)); s3.appendChild(t2);
    if (J.vocabulaire.exercice) {
      var cv = el('div', 'g-carte');
      cv.style.marginTop = '22px';
      cv.appendChild(el('div', 'g-tete', '<span class="g-titre">Réemploi</span>'));
      cv.appendChild(exercice(J.vocabulaire.exercice));
      cv.querySelector('.exo').style.cssText = 'margin-top:0;padding-top:0;border-top:0';
      s3.appendChild(cv);
    }
    main.appendChild(s3);

    /* 4. La traduction */
    var s4 = enteteBloc('traduction', '4', 'Translation · 6 min', 'Traduire',
      'Écrivez votre traduction avant de regarder la proposition. Les remarques expliquent les choix et les pièges.');
    function blocTrad(items, sens, prefixe) {
      items.forEach(function (t, i) {
        var b = el('div', 'trad');
        var src = sens === 'version' ? t.en : typo(t.fr);
        b.appendChild(el('div', 'trad-source', '<span class="t-num">' + prefixe + (i + 1) + '</span>' + src));
        if (t.indice) b.appendChild(el('div', 'trad-indice', typo(t.indice)));
        var ta = el('textarea');
        ta.rows = 2;
        ta.placeholder = sens === 'version' ? 'Votre traduction en français…' : 'Your translation into English…';
        b.appendChild(ta);
        var modele = sens === 'version' ? typo(t.fr) : t.en;
        var notes = (t.notes || []).map(function (n) { return '<li>' + typo(n) + '</li>'; }).join('');
        var r = el('div', 'reponse', '<div class="modele">' + modele + '</div>' + (notes ? '<ul>' + notes + '</ul>' : ''));
        b.appendChild(boutonDevoiler(r, 'Voir la proposition de traduction'));
        b.appendChild(r);
        s4.appendChild(b);
      });
    }
    s4.appendChild(el('h3', 'sous-titre', 'Version · anglais → français'));
    s4.appendChild(el('p', 'sous-intro', 'Des phrases du texte. Visez un français naturel, pas du mot à mot.'));
    blocTrad(J.version, 'version', 'V');
    s4.appendChild(el('h3', 'sous-titre', 'Thème · français → anglais'));
    s4.appendChild(el('p', 'sous-intro', 'Des phrases qui réemploient la grammaire et le vocabulaire du jour.'));
    blocTrad(J.theme, 'theme', 'T');
    main.appendChild(s4);

    /* 5. Bilan */
    var s5 = enteteBloc('bilan', '5', 'Wrap-up · 1 min', 'Ce que je retiens');
    var bil = el('div', 'bilan');
    bil.appendChild(el('ul', null, J.bilan.map(function (b) { return '<li>' + typo(b) + '</li>'; }).join('')));
    s5.appendChild(bil);
    var fin = el('div', 'fin');
    var bT = el('button', 'termine', 'J\'ai terminé ce jour ✓'); bT.type = 'button';
    function majBouton() {
      var f = lireFaits().indexOf(J.date) !== -1;
      bT.classList.toggle('fait', f);
      bT.textContent = f ? 'Jour terminé ✓' : 'J\'ai terminé ce jour ✓';
    }
    bT.addEventListener('click', function () {
      var l = lireFaits(), i = l.indexOf(J.date);
      if (i === -1) l.push(J.date); else l.splice(i, 1);
      ecrireFaits(l); majBouton();
    });
    majBouton();
    fin.appendChild(bT);
    fin.appendChild(el('a', 'retour', '← Tous les jours'));
    fin.lastChild.href = 'index.html';
    s5.appendChild(fin);
    main.appendChild(s5);

    /* Étapes : surligne la section en cours */
    var liens = document.querySelectorAll('.etapes a');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (!e.isIntersecting) return;
          liens.forEach(function (a) { a.classList.toggle('actif', a.getAttribute('href') === '#' + e.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('.bloc').forEach(function (b) { obs.observe(b); });
    }
  }

  /* Index : jours terminés et filtre par leçon */
  function construireIndex() {
    var faits = lireFaits();
    var cartes = document.querySelectorAll('.jour-card[data-date]');
    cartes.forEach(function (c) { if (faits.indexOf(c.getAttribute('data-date')) !== -1) c.classList.add('fait'); });
    var zone = document.getElementById('filtres');
    if (!zone) return;
    var compte = {};
    cartes.forEach(function (c) {
      (c.getAttribute('data-lecons') || '').split(',').forEach(function (n) {
        n = n.trim(); if (n) compte[n] = (compte[n] || 0) + 1;
      });
    });
    var nums = Object.keys(compte).sort(function (a, b) { return a - b; });
    if (!nums.length) return;
    function bouton(n, libelle) {
      var b = el('button', 'filtre' + (n ? '' : ' actif'), libelle); b.type = 'button';
      b.addEventListener('click', function () {
        zone.querySelectorAll('.filtre').forEach(function (x) { x.classList.toggle('actif', x === b); });
        cartes.forEach(function (c) {
          c.hidden = !!n && (',' + c.getAttribute('data-lecons') + ',').replace(/\s/g, '').indexOf(',' + n + ',') === -1;
        });
      });
      zone.appendChild(b);
    }
    bouton(null, 'Tous les jours');
    nums.forEach(function (n) { bouton(n, '<b>' + n + '</b> · ' + LECONS[n] + ' (' + compte[n] + ')'); });
  }

  function demarrer() {
    if (window.JOUR && document.getElementById('jour')) construireJour(window.JOUR);
    else if (document.querySelector('.jours-grid')) construireIndex();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
