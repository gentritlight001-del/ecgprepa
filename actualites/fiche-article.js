/* ══════════════════════════════════════════════════════════════
   Fiche d'actualité (maquette validée par le propriétaire,
   novembre 2026). À l'arrivée sur un article au gabarit a-page,
   le lecteur voit d'abord une fiche de 2 minutes, construite toute
   seule à partir des blocs de l'article :
     en-tête : tags t0 / t1, date (a-meta), titre (a-titre) ;
     à gauche : « L'essentiel » (a-essentiel), puis l'analyse
       entière (a-analyse : étiquette, titre, paragraphes) ;
     à droite : photo de une (a-hero-img), chiffres (a-chiffres),
       puis un bloc qui remplit la hauteur restante : bouton « Lire
       l'article complet » et, si l'article en a une, la vidéo
       (<meta name="fiche-video" content="https://youtu.be/…"
       data-titre="…" data-chaine="…"> dans le <head>) ;
     chronologie (4 dates les plus récentes), « Dans une copie »
       (accroche, idée-force, sujets, piège), retour et cours.
   « Lire l'article complet » affiche l'article entier (adresse
   #article-complet ; le Retour du navigateur ramène à la fiche).
   Un lien avec ancre ou une arrivée par la recherche du site ouvre
   directement l'article complet. Une fiche par section de langue.
   Rien à écrire à la main.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var body = document.body;
  if (!body || !body.classList.contains('a-page')) return;
  var main = document.querySelector('.a-main');
  if (!main) return;

  var ANCRE = 'article-complet';
  var T = {
    fr: { fiche: 'Fiche de 2 min', ess: 'L’essentiel', complet: 'Lire l’article complet', video: 'En vidéo', retour: '← Revenir à la fiche', reviser: 'Réviser : ', copie: 'Dans une copie', chrono: 'Chronologie' },
    en: { fiche: '2-minute fact sheet', ess: 'The essentials', complet: 'Read the full article', video: 'Video', retour: '← Back to the fact sheet', reviser: 'Revise: ', copie: 'In an essay', chrono: 'Timeline' },
    es: { fiche: 'Ficha de 2 min', ess: 'Lo esencial', complet: 'Leer el artículo completo', video: 'En vídeo', retour: '← Volver a la ficha', reviser: 'Repasar: ', copie: 'En una redacción', chrono: 'Cronología' },
    de: { fiche: '2-Minuten-Überblick', ess: 'Das Wichtigste', complet: 'Den ganzen Artikel lesen', video: 'Im Video', retour: '← Zurück zum Überblick', reviser: 'Wiederholen: ', copie: 'Im Aufsatz', chrono: 'Chronologie' }
  };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function texte(n) { return n ? n.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function ajout(parent, tag, cls, txt) {
    var e = el(tag, cls);
    e.textContent = txt;
    parent.appendChild(e);
    return e;
  }

  var metaVideo = document.querySelector('meta[name="fiche-video"]');
  var video = metaVideo && /^https:\/\/youtu\.be\/[\w-]+$/.test(metaVideo.getAttribute('content') || '') ? {
    url: metaVideo.getAttribute('content'),
    titre: metaVideo.getAttribute('data-titre') || '',
    chaine: metaVideo.getAttribute('data-chaine') || ''
  } : null;

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
    if (t0) ajout(tags, 'span', 'fx-tag t0', texte(t0));
    if (t1) ajout(tags, 'span', 'fx-tag', texte(t1));
    var meta = texte(zone.querySelector('.a-hero .a-meta')).split(' · ');
    var minutes = (meta.filter(function (s) { return /\d+\s*min/.test(s); })[0] || '').replace(/^\D*(\d+).*$/, '$1');
    ajout(tags, 'span', 'fx-meta', (meta[0] ? meta[0] + ' · ' : '') + t.fiche);
    tete.appendChild(tags);
    ajout(tete, 'h2', 'fx-titre', texte(zone.querySelector('.a-titre')));
    carte.appendChild(tete);

    var haut = el('div', 'fx-haut');
    var gauche = el('div', 'fx-gauche');
    var droite = el('div', 'fx-droite');
    haut.appendChild(gauche);
    haut.appendChild(droite);
    carte.appendChild(haut);

    /* À gauche : L'essentiel */
    var bE = el('section', 'fx-ess');
    ajout(bE, 'h3', 'fx-lab', t.ess);
    var ol = el('ol');
    Array.prototype.forEach.call(ess, function (li, i) {
      var p = li.querySelector('p');
      var item = el('li');
      ajout(item, 'span', 'fx-rond', String(i + 1));
      item.appendChild(el('p', null, p ? p.innerHTML : li.innerHTML));
      ol.appendChild(item);
    });
    bE.appendChild(ol);
    gauche.appendChild(bE);

    /* À gauche : l'analyse de l'article, entière */
    var an = zone.querySelector('.a-analyse');
    var anP = an ? an.querySelectorAll('.a-analyse-corps .a-p') : [];
    if (anP.length) {
      var bA = el('section', 'fx-analyse');
      ajout(bA, 'h3', 'fx-lab', texte(an.querySelector('.a-analyse-lab')));
      var anT = an.querySelector('.a-analyse-t');
      if (anT) ajout(bA, 'p', 'fx-analyse-t', texte(anT));
      Array.prototype.forEach.call(anP, function (p) { bA.appendChild(el('p', 'fx-analyse-p', p.innerHTML)); });
      gauche.appendChild(bA);
    }

    /* À droite : photo de une, chiffres */
    var img = zone.querySelector('.a-hero-img');
    if (img) {
      var im = el('img', 'fx-photo');
      im.src = img.getAttribute('src');
      im.alt = img.getAttribute('alt') || '';
      droite.appendChild(im);
    }
    var ch = zone.querySelectorAll('.a-chiffres > div');
    if (ch.length) {
      var bCh = el('div', 'fx-chiffres');
      Array.prototype.forEach.call(ch, function (d) {
        var v = d.querySelector('.a-chiffre');
        if (!v) return;
        ajout(bCh, 'span', 'fx-chiffre' + (v.classList.contains('rouge') ? ' rouge' : ''), texte(v));
        ajout(bCh, 'span', 'fx-chiffre-txt', texte(d.querySelector('.a-chiffre-txt')));
      });
      droite.appendChild(bCh);
    }

    /* À droite : article complet et vidéo (le bloc remplit la hauteur restante) */
    var plus = el('div', 'fx-plus');
    var ouvrir = el('a', 'fx-ouvrir');
    ouvrir.href = '#' + ANCRE;
    ouvrir.textContent = t.complet + (minutes ? ' · ' + minutes + ' min' : '') + ' →';
    ouvrir.addEventListener('click', function (e) { e.preventDefault(); afficher(true, true); });
    plus.appendChild(ouvrir);
    if (video) {
      var lv = el('a', 'fx-video');
      lv.href = video.url;
      lv.target = '_blank';
      lv.rel = 'noopener';
      lv.appendChild(el('span', 'fx-lecture', '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#fff"/></svg>'));
      var tv = el('span', 'fx-video-txt');
      ajout(tv, 'span', 'fx-video-lab', t.video + (video.chaine ? ' · ' + video.chaine : ''));
      ajout(tv, 'span', 'fx-video-titre', video.titre);
      lv.appendChild(tv);
      plus.appendChild(lv);
    }
    droite.appendChild(plus);

    /* Chronologie : les 4 dates les plus récentes, la plus récente à gauche */
    var dates = zone.querySelectorAll('.a-chrono li');
    if (dates.length) {
      var bD = el('section', 'fx-dates');
      ajout(bD, 'h3', 'fx-lab', texte(zone.querySelector('.a-chrono-bloc .a-h2')) || t.chrono);
      var od = el('ol');
      Array.prototype.slice.call(dates, 0, 4).forEach(function (li) {
        var x = el('li');
        ajout(x, 'span', 'fx-date', texte(li.querySelector('.a-date')));
        ajout(x, 'p', null, texte(li.querySelector('p')));
        od.appendChild(x);
      });
      bD.appendChild(od);
      carte.appendChild(bD);
    }

    /* Dans une copie : accroche, puis idée-force, sujets, piège */
    var copie = zone.querySelector('.a-copie');
    if (copie) {
      var bC = el('section', 'fx-copie');
      ajout(bC, 'h3', 'fx-lab', texte(copie.querySelector('.a-copie-t')) || t.copie);
      var acc = copie.querySelector('.a-accroche');
      if (acc && acc.querySelector('p')) {
        var cA = el('div', 'fx-c fx-accroche');
        ajout(cA, 'h4', null, texte(acc.querySelector('h3')));
        cA.appendChild(el('p', null, acc.querySelector('p').innerHTML));
        bC.appendChild(cA);
      }
      var grille = copie.querySelector('.a-copie-grille');
      if (grille) {
        var g = el('div', 'fx-copie-g');
        Array.prototype.forEach.call(grille.children, function (div, i) {
          var c = el('div', 'fx-c' + (div.classList.contains('a-piege') ? ' fx-piege' : i === 0 ? ' fx-idee' : ''));
          ajout(c, 'h4', null, texte(div.querySelector('h3')));
          var ul = div.querySelector('ul');
          if (ul) {
            var u = el('ul');
            Array.prototype.forEach.call(ul.querySelectorAll('li'), function (li) { u.appendChild(el('li', null, li.innerHTML)); });
            c.appendChild(u);
          } else {
            Array.prototype.forEach.call(div.querySelectorAll('p'), function (p) { c.appendChild(el('p', null, p.innerHTML)); });
          }
          g.appendChild(c);
        });
        bC.appendChild(g);
      }
      carte.appendChild(bC);
    }

    /* Fin : retour à la liste, cours à réviser */
    var fin = el('div', 'fx-fin');
    var tous = zone.querySelector('.a-fin a');
    if (tous) {
      var lt = el('a', 'fx-tous');
      lt.href = tous.getAttribute('href');
      lt.textContent = texte(tous);
      fin.appendChild(lt);
    }
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
    if (complet && defiler && location.hash !== '#' + ANCRE) {
      try { history.pushState({ fx: 1 }, '', '#' + ANCRE); } catch (e) {}
    }
    if (!complet && location.hash === '#' + ANCRE) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    }
    if (defiler) window.scrollTo(0, 0);
  }

  /* Pas de vide sous l'analyse : si la colonne de droite (photo,
     chiffres, liens) dépasse celle de gauche, la photo devient plus
     panoramique (2,2:1 au plus, jamais plus haute), puis, s'il le
     faut, les chiffres passent sur deux colonnes (classe « serre »). */
  function vide(g) {
    var bas = g.lastElementChild.getBoundingClientRect().bottom;
    var fond = g.getBoundingClientRect().bottom - parseFloat(getComputedStyle(g).paddingBottom);
    return fond - bas;
  }
  function equilibrer() {
    Array.prototype.forEach.call(document.querySelectorAll('.fx'), function (fx) {
      if (!fx.offsetParent) return;
      var g = fx.querySelector('.fx-gauche'), d = fx.querySelector('.fx-droite');
      if (!g || !d) return;
      var ph = d.querySelector('.fx-photo');
      d.classList.remove('serre');
      if (ph) ph.style.height = '';
      if (getComputedStyle(g).display === 'contents') return;
      var v = vide(g);
      if (v > 4 && ph) {
        var h = ph.getBoundingClientRect().height, w = ph.getBoundingClientRect().width;
        ph.style.height = Math.round(Math.max(w / 2.2, h - v)) + 'px';
        v = vide(g);
      }
      if (v > 4) {
        if (ph) ph.style.height = '';
        d.classList.add('serre');
        v = vide(g);
        if (v > 4 && ph) {
          var h2 = ph.getBoundingClientRect().height, w2 = ph.getBoundingClientRect().width;
          ph.style.height = Math.round(Math.max(w2 / 2.2, h2 - v)) + 'px';
        }
      }
    });
  }
  var minuteur;
  function plusTard() { clearTimeout(minuteur); minuteur = setTimeout(equilibrer, 120); }
  window.addEventListener('resize', plusTard);
  window.addEventListener('load', equilibrer);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(equilibrer);
  document.addEventListener('click', function (e) {
    if (e.target.closest && (e.target.closest('.ap-lang-btn') || e.target.closest('.fx-retour'))) setTimeout(equilibrer, 0);
  });

  var depuisRecherche = false;
  try { depuisRecherche = !!sessionStorage.getItem('ecg-recherche-surligner'); } catch (e) {}
  afficher(!!location.hash || depuisRecherche, false);
  equilibrer();

  window.addEventListener('popstate', function () {
    afficher(location.hash === '#' + ANCRE, true);
    equilibrer();
  });
})();
