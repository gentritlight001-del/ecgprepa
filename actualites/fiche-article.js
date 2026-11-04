/* ══════════════════════════════════════════════════════════════
   Fiche d'actualité : à l'arrivée sur un article (gabarit a-page),
   le lecteur voit d'abord une fiche courte (2 minutes), construite
   automatiquement à partir des blocs de l'article lui-même :
   tags, titre, photo de une, « L'essentiel », chiffres clés,
   premier paragraphe de l'analyse, chronologie, « Dans une copie »
   et carte « Réviser le cours ». Le bouton « Lire l'article
   complet » affiche l'article entier (adresse #article-complet,
   le bouton Retour du navigateur ramène à la fiche).

   Rien à écrire à la main : un article au gabarit a-page qui charge
   ce script (et fiche-article.css) a sa fiche. Un article sans bloc
   « L'essentiel » reste affiché en entier.
   Éditions de langue : une fiche par section (ap-fr-section,
   ap-en-section…), elle suit donc l'interrupteur FR / langue.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var body = document.body;
  if (!body || !body.classList.contains('a-page')) return;
  var main = document.querySelector('.a-main');
  if (!main) return;

  var ANCRE = 'article-complet';
  var T = {
    fr: { fiche: 'Fiche de 2 min', ess: 'L’essentiel', complet: 'Lire l’article complet', retour: '← Revenir à la fiche', reviser: 'Réviser : ' },
    en: { fiche: '2-minute fact sheet', ess: 'The essentials', complet: 'Read the full article', retour: '← Back to the fact sheet', reviser: 'Revise: ' },
    es: { fiche: 'Ficha de 2 min', ess: 'Lo esencial', complet: 'Leer el artículo completo', retour: '← Volver a la ficha', reviser: 'Repasar: ' },
    de: { fiche: '2-Minuten-Überblick', ess: 'Das Wichtigste', complet: 'Den ganzen Artikel lesen', retour: '← Zurück zum Überblick', reviser: 'Wiederholen: ' }
  };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function texte(n) { return n ? n.textContent.replace(/\s+/g, ' ').trim() : ''; }

  function construire(zone) {
    var ess = zone.querySelectorAll('.a-essentiel li');
    if (!ess.length) return null;
    var m = /\bap-([a-z]+)-section\b/.exec(zone.className);
    var t = T[m ? m[1] : 'fr'] || T.fr;

    var fx = el('section', 'fx');
    fx.setAttribute('aria-label', t.fiche);
    var carte = el('div', 'fx-carte');
    fx.appendChild(carte);

    /* En-tête : pays, thème, date, titre */
    var tete = el('header', 'fx-tete');
    var tags = el('div', 'fx-tags');
    var t0 = zone.querySelector('.a-hero .a-tag.t0'), t1 = zone.querySelector('.a-hero .a-tag.t1');
    if (t0) tags.appendChild(el('span', 'fx-tag t0')).textContent = texte(t0);
    if (t1) tags.appendChild(el('span', 'fx-tag')).textContent = texte(t1);
    var meta = texte(zone.querySelector('.a-hero .a-meta')).split(' · ');
    var minutes = (meta.filter(function (s) { return /\d+\s*min/.test(s); })[0] || '').replace(/^\D*(\d+).*$/, '$1');
    tags.appendChild(el('span', 'fx-meta')).textContent = (meta[0] ? meta[0] + ' · ' : '') + t.fiche;
    tete.appendChild(tags);
    var titre = el('h2', 'fx-titre');
    titre.textContent = texte(zone.querySelector('.a-titre'));
    tete.appendChild(titre);
    carte.appendChild(tete);

    /* L'essentiel + photo de une (la photo prend la hauteur du texte) */
    var haut = el('div', 'fx-haut');
    var colEss = el('div', 'fx-ess');
    colEss.appendChild(el('h3', 'fx-lab')).textContent = t.ess;
    var ol = el('ol');
    Array.prototype.forEach.call(ess, function (li, i) {
      var p = li.querySelector('p');
      var item = el('li');
      item.appendChild(el('span', 'fx-rond')).textContent = String(i + 1);
      item.appendChild(el('p', null, p ? p.innerHTML : li.innerHTML));
      ol.appendChild(item);
    });
    colEss.appendChild(ol);
    haut.appendChild(colEss);
    var img = zone.querySelector('.a-hero-img');
    if (img) {
      var ph = el('div', 'fx-photo');
      var im = el('img');
      im.src = img.getAttribute('src');
      im.alt = img.getAttribute('alt') || '';
      ph.appendChild(im);
      haut.appendChild(ph);
    } else {
      haut.classList.add('sans-photo');
    }
    carte.appendChild(haut);

    /* Chiffres clés */
    var ch = zone.querySelectorAll('.a-chiffres > div');
    if (ch.length) {
      var bloc = el('div', 'fx-chiffres');
      Array.prototype.forEach.call(ch, function (d) {
        var v = d.querySelector('.a-chiffre');
        if (!v) return;
        var c = el('div');
        c.appendChild(el('div', 'fx-chiffre' + (v.classList.contains('rouge') ? ' rouge' : ''))).textContent = texte(v);
        c.appendChild(el('div', 'fx-chiffre-txt')).textContent = texte(d.querySelector('.a-chiffre-txt'));
        bloc.appendChild(c);
      });
      bloc.style.setProperty('--n', bloc.children.length);
      carte.appendChild(bloc);
    }

    /* L'analyse : titre et premier paragraphe */
    var an = zone.querySelector('.a-analyse');
    var anP = an && an.querySelector('.a-analyse-corps .a-p');
    if (anP) {
      var bA = el('div', 'fx-analyse');
      bA.appendChild(el('h3', 'fx-lab')).textContent = texte(an.querySelector('.a-analyse-lab'));
      var anT = an.querySelector('.a-analyse-t');
      if (anT) bA.appendChild(el('p', 'fx-analyse-t')).textContent = texte(anT);
      bA.appendChild(el('p', 'fx-analyse-p', anP.innerHTML));
      carte.appendChild(bA);
    }

    /* Chronologie : les 4 dates les plus récentes, la plus récente à gauche */
    var dates = zone.querySelectorAll('.a-chrono li');
    if (dates.length) {
      var bD = el('div', 'fx-dates');
      bD.appendChild(el('h3', 'fx-lab')).textContent = texte(zone.querySelector('.a-chrono-bloc .a-h2')) || 'Chronologie';
      var od = el('ol');
      Array.prototype.slice.call(dates, 0, 4).forEach(function (li) {
        var x = el('li');
        x.appendChild(el('span', 'fx-date')).textContent = texte(li.querySelector('.a-date'));
        x.appendChild(el('p')).textContent = texte(li.querySelector('p'));
        od.appendChild(x);
      });
      bD.appendChild(od);
      carte.appendChild(bD);
    }

    /* Dans une copie : idée-force, sujets, piège (blocs de l'article) */
    var grille = zone.querySelector('.a-copie .a-copie-grille');
    if (grille) {
      var bC = el('div', 'fx-copie');
      bC.appendChild(el('h3', 'fx-lab')).textContent = texte(zone.querySelector('.a-copie-t'));
      var g = grille.cloneNode(true);
      g.removeAttribute('id');
      bC.appendChild(g);
      carte.appendChild(bC);
    }

    /* Fin : article complet, cours à réviser */
    var fin = el('div', 'fx-fin');
    var ouvrir = el('a', 'fx-ouvrir');
    ouvrir.href = '#' + ANCRE;
    ouvrir.textContent = t.complet + (minutes ? ' · ' + minutes + ' min' : '') + ' →';
    ouvrir.addEventListener('click', function (e) { e.preventDefault(); afficher(true, true); });
    fin.appendChild(ouvrir);
    var cours = zone.querySelector('a.a-cours');
    if (cours) {
      var lc = el('a', 'fx-cours');
      lc.href = cours.getAttribute('href');
      lc.textContent = t.reviser + texte(cours.querySelector('b'));
      fin.appendChild(lc);
    }
    fx.appendChild(fin);

    /* Bouton de retour, en tête de l'article complet */
    var retour = el('button', 'fx-retour');
    retour.type = 'button';
    retour.textContent = t.retour;
    retour.addEventListener('click', function () {
      if (history.state && history.state.fx) history.back();
      else afficher(false, true);
    });

    zone.classList.add('fx-zone');
    zone.insertBefore(retour, zone.firstChild);
    zone.insertBefore(fx, zone.firstChild);
    return fx;
  }

  var zones = main.querySelectorAll('.ap-fr-section, .ap-en-section, .ap-es-section, .ap-de-section');
  if (!zones.length) zones = [main];
  var faites = 0;
  Array.prototype.forEach.call(zones, function (z) { if (construire(z)) faites++; });
  if (!faites) return;

  function afficher(complet, defiler) {
    body.classList.toggle('fx-fiche', !complet);
    body.classList.toggle('fx-complet', complet);
    if (complet && location.hash !== '#' + ANCRE && defiler) {
      try { history.pushState({ fx: 1 }, '', '#' + ANCRE); } catch (e) {}
    }
    if (!complet && location.hash === '#' + ANCRE) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    }
    if (defiler) window.scrollTo(0, 0);
  }

  /* Article complet d'emblée : lien avec ancre, ou arrivée depuis la
     recherche du site (les mots cherchés doivent rester visibles). */
  var depuisRecherche = false;
  try { depuisRecherche = !!sessionStorage.getItem('ecg-recherche-surligner'); } catch (e) {}
  afficher(!!location.hash || depuisRecherche, false);

  window.addEventListener('popstate', function () {
    afficher(location.hash === '#' + ANCRE, true);
  });
})();
