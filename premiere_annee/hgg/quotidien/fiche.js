/* L'HGG au quotidien : comportements communs aux fiches et à l'index.
   - fiche : cartes à onglets et repères numérotés, mots expliqués au survol,
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

  /* ─── Mots expliqués au survol (ou au toucher) ─── */
  function bulles() {
    var mots = [].slice.call(document.querySelectorAll('.gl[data-def]'));
    if (!mots.length) return;
    var b = document.createElement('div');
    b.className = 'f-bulle'; b.setAttribute('role', 'tooltip'); b.id = 'f-bulle';
    document.body.appendChild(b);
    var courant = null;
    function montrer(el) {
      courant = el;
      mots.forEach(function (m) { m.classList.toggle('ouvert', m === el); });
      b.innerHTML = '<b>' + el.innerHTML + '</b>' + el.getAttribute('data-def');
      el.setAttribute('aria-describedby', 'f-bulle');
      b.classList.remove('vue', 'haut', 'bas');
      var r = el.getClientRects()[0] || el.getBoundingClientRect();
      var w = b.offsetWidth, h = b.offsetHeight, marge = 12;
      var x = Math.max(marge, Math.min(innerWidth - w - marge, r.left + r.width / 2 - w / 2));
      var dessus = r.top - h - 10 > 70;
      b.style.left = x + 'px';
      b.style.top = (dessus ? r.top - h - 10 : r.bottom + 10) + 'px';
      b.style.setProperty('--fl', Math.max(14, Math.min(w - 14, r.left + r.width / 2 - x)) + 'px');
      b.classList.add(dessus ? 'haut' : 'bas', 'vue');
    }
    function cacher() {
      if (courant) { courant.classList.remove('ouvert'); courant.removeAttribute('aria-describedby'); }
      courant = null; b.classList.remove('vue');
    }
    var tactile = false, dejaOuvert = false;
    mots.forEach(function (el) {
      el.addEventListener('touchstart', function () { tactile = true; dejaOuvert = courant === el; }, { passive: true });
      el.addEventListener('mouseenter', function () { if (!tactile) montrer(el); });
      el.addEventListener('mouseleave', function () { if (!tactile) cacher(); });
      el.addEventListener('focus', function () { montrer(el); });
      el.addEventListener('blur', cacher);
      /* Au toucher : un premier appui ouvre la bulle, un second la ferme. */
      el.addEventListener('click', function (e) { e.preventDefault(); if (tactile && dejaOuvert) { el.blur(); cacher(); dejaOuvert = false; } else montrer(el); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Escape') { el.blur(); cacher(); } });
    });
    addEventListener('scroll', cacher, { passive: true });
    addEventListener('resize', cacher);
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

  cartes(); bulles(); lue(); index();
})();
