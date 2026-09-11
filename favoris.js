/* ══════════════════════════════════════════════════════════
   ECG Prépa — Favoris
   Ajoute une étoile sur chaque carte (Culture Générale + Actualité).
   Les favoris sont enregistrés par compte utilisateur.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var BASE = '';
  try {
    var me = document.currentScript && document.currentScript.src;
    if (me) BASE = new URL('.', me).href;
  } catch (e) {}

  /* ─── Stockage par utilisateur ─── */
  function currentUser() {
    return (window.ECGAuth && window.ECGAuth.current && window.ECGAuth.current()) || null;
  }
  function storeKey() {
    var u = currentUser();
    return u ? 'ecg_favoris:' + u.email : null;
  }
  function load() {
    var k = storeKey();
    if (!k) return [];
    try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; }
  }
  function save(list) {
    var k = storeKey();
    if (!k) return;
    try { localStorage.setItem(k, JSON.stringify(list)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('ecg:favoris', { detail: { count: list.length } }));
  }

  /* ─── Chemins relatifs à la racine du site ─── */
  function toRoot(path) {
    if (!path) return null;
    try {
      var abs = new URL(path, location.href).href;
      return abs.indexOf(BASE) === 0 ? abs.slice(BASE.length) : abs;
    } catch (e) { return path; }
  }

  /* ─── API publique ─── */
  var Fav = {
    all: load,
    count: function () { return load().length; },
    has: function (id) {
      return load().some(function (f) { return f.id === id; });
    },
    add: function (item) {
      var list = load();
      if (list.some(function (f) { return f.id === item.id; })) return list;
      item.ajoute = Date.now();
      list.push(item);
      save(list);
      return list;
    },
    remove: function (id) {
      var list = load().filter(function (f) { return f.id !== id; });
      save(list);
      return list;
    },
    toggle: function (item) {
      if (Fav.has(item.id)) { Fav.remove(item.id); return false; }
      Fav.add(item); return true;
    },
    clear: function () { save([]); }
  };
  window.ECGFav = Fav;

  /* ─── Les données de la page (ACTU_DATA ou CG_DATA) ─── */
  function pageData() {
    var items = null, section = null;
    try { if (typeof ACTU_DATA !== 'undefined' && Array.isArray(ACTU_DATA) && ACTU_DATA.length) { items = ACTU_DATA; section = 'actu'; } } catch (e) {}
    if (!items) {
      try { if (typeof CG_DATA !== 'undefined' && Array.isArray(CG_DATA) && CG_DATA.length) { items = CG_DATA; section = 'cg'; } } catch (e) {}
    }
    return items ? { items: items, section: section } : null;
  }

  /* ─── Association carte ↔ donnée, par le titre ─── */
  var decoder = document.createElement('div');
  function plain(html) {
    decoder.innerHTML = html || '';
    return decoder.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  var index = null;
  function buildIndex(data) {
    index = {};
    data.items.forEach(function (a) {
      var titre = a.cardTitle || a.titre || a.title;
      if (!titre || !a.externalUrl) return;
      index[plain(titre)] = {
        id: data.section + ':' + (a.id || toRoot(a.externalUrl)),
        titre: plain(titre) ? String(titre) : '',
        url: toRoot(a.externalUrl),
        image: toRoot(a.image),
        theme: a.theme || '',
        meta: a.flag ? (a.flag + ' ' + (a.pays || '')).trim() : '',
        section: data.section
      };
    });
  }

  /* ─── Étoile ─── */
  var STAR = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">' +
    '<path d="M12 2.8l2.85 5.77 6.37.93-4.61 4.49 1.09 6.35L12 17.34l-5.7 3 1.09-6.35L2.78 9.5l6.37-.93z"/></svg>';

  function injectStyles() {
    if (document.getElementById('ecg-fav-style')) return;
    var s = document.createElement('style');
    s.id = 'ecg-fav-style';
    s.textContent =
      '.ecg-fav-btn{position:absolute;top:10px;right:10px;z-index:6;width:34px;height:34px;' +
      'display:flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer;' +
      'background:rgba(13,13,15,.72);border:1px solid rgba(255,255,255,.12);color:#8a8880;' +
      'backdrop-filter:blur(8px);padding:0;transition:color .2s,border-color .2s,background .2s,transform .18s}' +
      '.ecg-fav-btn svg{fill:none;stroke:currentColor;stroke-width:1.7;stroke-linejoin:round;transition:fill .2s}' +
      '.ecg-fav-btn:hover{color:#c8a96e;border-color:rgba(200,169,110,.55);transform:scale(1.1)}' +
      '.ecg-fav-btn:focus-visible{outline:2px solid #c8a96e;outline-offset:2px}' +
      '.ecg-fav-btn.on{color:#c8a96e;border-color:rgba(200,169,110,.55);background:rgba(200,169,110,.14)}' +
      '.ecg-fav-btn.on svg{fill:currentColor}' +
      '.ecg-fav-btn.pop{animation:ecgFavPop .35s ease}' +
      '@keyframes ecgFavPop{0%{transform:scale(1)}45%{transform:scale(1.28)}100%{transform:scale(1)}}' +
      '#ecg-fav-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,14px);z-index:99998;' +
      'background:#16161a;border:1px solid #2a2a35;border-left:2px solid #c8a96e;border-radius:10px;' +
      'padding:12px 18px;color:#e8e6e0;font-family:"DM Sans",system-ui,sans-serif;font-size:.84rem;' +
      'box-shadow:0 16px 44px rgba(0,0,0,.5);opacity:0;visibility:hidden;transition:opacity .22s,transform .22s,visibility .22s}' +
      '#ecg-fav-toast.show{opacity:1;visibility:visible;transform:translate(-50%,0)}' +
      '@media (prefers-reduced-motion:reduce){.ecg-fav-btn,#ecg-fav-toast{transition:none}.ecg-fav-btn.pop{animation:none}}';
    document.head.appendChild(s);
  }

  var toastTimer;
  function toast(text) {
    var t = document.getElementById('ecg-fav-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ecg-fav-toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = text;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function sync(btn, on) {
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on ? 'Retirer des favoris' : 'Mettre en favoris';
    btn.setAttribute('aria-label', btn.title);
  }

  function decorate() {
    var data = pageData();
    if (!data || !currentUser()) return;
    if (!index) buildIndex(data);
    injectStyles();

    var cards = document.querySelectorAll('.actu-card:not([data-fav])');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var titleEl = card.querySelector('.actu-card-title');
      if (!titleEl) continue;
      var item = index[plain(titleEl.textContent)];
      if (!item) continue;

      card.setAttribute('data-fav', '1');
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ecg-fav-btn';
      btn.innerHTML = STAR;
      sync(btn, Fav.has(item.id));

      (function (btn, item) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          e.preventDefault();
          var on = Fav.toggle(item);
          sync(btn, on);
          btn.classList.remove('pop');
          void btn.offsetWidth;
          btn.classList.add('pop');
          toast(on ? 'Ajouté à tes favoris' : 'Retiré de tes favoris');
        });
      })(btn, item);

      card.appendChild(btn);
    }
  }

  /* ─── Redécore après chaque filtre / recherche ─── */
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; decorate(); });
  }

  function start() {
    decorate();
    var obs = new MutationObserver(schedule);
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
