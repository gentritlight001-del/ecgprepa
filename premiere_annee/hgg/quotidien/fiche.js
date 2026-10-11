/* L'HGG au quotidien : comportements communs aux fiches et à l'index.
   - fiche : sommaire actif + barre de progression, cartes à onglets et repères numérotés,
     bouton « J'ai lu cette fiche ».
   - index : marque « Lue » sur les fiches déjà lues, compteur.
   Les fiches lues sont gardées dans le navigateur (localStorage). */
(function () {
  'use strict';
  var CLE_LUES = 'ecg-hgg-quotidien-lues';

  function lire(cle, defaut) {
    try { var v = localStorage.getItem(cle); return v ? JSON.parse(v) : defaut; } catch (e) { return defaut; }
  }
  function ecrire(cle, val) {
    try { localStorage.setItem(cle, JSON.stringify(val)); } catch (e) { /* navigation privée */ }
  }
  function slug() { return (location.pathname.split('/').pop() || '').replace(/\.html$/, ''); }

  /* ─── Sommaire : section en cours + progression de lecture ─── */
  function sommaire() {
    var liens = [].slice.call(document.querySelectorAll('.f-sommaire a[href^="#"]'));
    var barre = document.querySelector('.f-progres');
    if (!liens.length && !barre) return;
    function cibles(l) { return l.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }); }
    var secs = cibles(liens);
    function actif(liste, elems) {
      var i = -1;
      elems.forEach(function (s, k) { if (s && s.getBoundingClientRect().top < 180) i = k; });
      liste.forEach(function (a, k) { a.classList.toggle('actif', k === i); });
      return i;
    }
    var attente = false;
    function maj() {
      attente = false;
      var i = actif(liens, secs);
      if (i >= 0 && liens[i]) {
        var boite = liens[i].parentNode;
        var x = liens[i].offsetLeft - boite.clientWidth / 2 + liens[i].clientWidth / 2;
        if (Math.abs(boite.scrollLeft - x) > 40) boite.scrollTo({ left: x, behavior: 'smooth' });
      }
      if (barre) {
        var h = document.documentElement.scrollHeight - innerHeight;
        barre.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
      }
    }
    addEventListener('scroll', function () { if (!attente) { attente = true; requestAnimationFrame(maj); } }, { passive: true });
    maj();
  }

  /* ─── Cartes : onglets et repères ─── */
  function cartes() {
    var onglets = [].slice.call(document.querySelectorAll('.f-onglets [role="tab"]'));
    onglets.forEach(function (b) {
      b.addEventListener('click', function () {
        onglets.forEach(function (o) {
          var on = o === b;
          o.setAttribute('aria-selected', on ? 'true' : 'false');
          var p = document.getElementById(o.getAttribute('aria-controls'));
          if (p) p.classList.toggle('actif', on);
        });
        centrer();
      });
    });
    /* Sur petit écran, la carte défile horizontalement : on la centre au départ. */
    function centrer() {
      [].slice.call(document.querySelectorAll('.f-carte.actif .f-carte-defil')).forEach(function (d) {
        if (d.scrollWidth > d.clientWidth && !d.dataset.centre) {
          d.scrollLeft = (d.scrollWidth - d.clientWidth) / 2; d.dataset.centre = '1';
        }
      });
    }
    centrer();
    addEventListener('load', centrer);
    [].slice.call(document.querySelectorAll('.f-carte')).forEach(function (carte) {
      var pins = [].slice.call(carte.querySelectorAll('.pin'));
      var items = [].slice.call(carte.querySelectorAll('.f-reperes li'));
      function choisir(id, defiler) {
        pins.forEach(function (p) { p.classList.toggle('actif', p.getAttribute('data-r') === id); });
        items.forEach(function (li) {
          var on = li.getAttribute('data-r') === id;
          li.classList.toggle('actif', on);
          li.querySelector('button').setAttribute('aria-expanded', on ? 'true' : 'false');
          if (on && defiler) {
            var liste = li.parentNode;
            liste.scrollTo({ top: li.offsetTop - liste.offsetTop - 8, behavior: 'smooth' });
          }
        });
      }
      pins.forEach(function (p) {
        p.setAttribute('tabindex', '0');
        p.setAttribute('role', 'button');
        p.addEventListener('click', function () { choisir(p.getAttribute('data-r'), true); });
        p.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisir(p.getAttribute('data-r'), true); }
        });
      });
      items.forEach(function (li) {
        li.querySelector('button').addEventListener('click', function () {
          choisir(li.classList.contains('actif') ? '' : li.getAttribute('data-r'), false);
        });
      });
      if (items[0]) choisir(items[0].getAttribute('data-r'), false);
    });
  }

  /* ─── « J'ai lu cette fiche » ─── */
  function lue() {
    var b = document.querySelector('.f-lu');
    if (!b) return;
    var s = slug();
    function maj() {
      var on = lire(CLE_LUES, []).indexOf(s) >= 0;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? '✓ Fiche lue' : 'J’ai lu cette fiche';
    }
    b.addEventListener('click', function () {
      var l = lire(CLE_LUES, []), i = l.indexOf(s);
      if (i >= 0) l.splice(i, 1); else l.push(s);
      ecrire(CLE_LUES, l); maj();
    });
    maj();
  }

  /* ─── Index : fiches lues ─── */
  function index() {
    var fiches = [].slice.call(document.querySelectorAll('.i-fiche[data-slug]'));
    if (!fiches.length) return;
    var l = lire(CLE_LUES, []), n = 0;
    fiches.forEach(function (f) { if (l.indexOf(f.getAttribute('data-slug')) >= 0) { f.classList.add('lue'); n++; } });
    var c = document.getElementById('nb-lues');
    if (c) {
      c.querySelector('b').textContent = n + ' / ' + fiches.length;
      c.querySelector('span').textContent = n > 1 ? 'fiches lues' : 'fiche lue';
    }
  }

  sommaire(); cartes(); lue(); index();
})();
