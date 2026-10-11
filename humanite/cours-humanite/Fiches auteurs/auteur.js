/* Fiches auteurs (Cours Humanité) : comportements communs, repris de l'HGG au quotidien.
   - fiche : mots expliqués au survol,
     bouton « J'ai lu cette fiche ».
   - index (fiches-auteurs.html) : marque « Lue » sur les fiches déjà lues.
   Les fiches lues sont gardées dans le navigateur (localStorage). */
(function () {
  'use strict';
  var CLE_LUES = 'ecg-humanite-auteurs-lues';

  function lire(cle, defaut) {
    try { var v = localStorage.getItem(cle); return v ? JSON.parse(v) : defaut; } catch (e) { return defaut; }
  }
  function ecrire(cle, val) {
    try { localStorage.setItem(cle, JSON.stringify(val)); } catch (e) { /* navigation privée */ }
  }
  function slug() { return (location.pathname.split('/').pop() || '').replace(/\.html$/, ''); }

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
    var fiches = [].slice.call(document.querySelectorAll('.auteur-card[data-slug]'));
    if (!fiches.length) return;
    var l = lire(CLE_LUES, []);
    fiches.forEach(function (f) { if (l.indexOf(f.getAttribute('data-slug')) >= 0) f.classList.add('lue'); });
  }

  bulles(); lue(); index();
})();
