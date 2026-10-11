/* ══════════════════════════════════════════════════════════════════
   ECG Prépa — Recherche dans tout le site
   Chargé sur toutes les pages par auth.js.
     - Fenêtre de recherche : loupe du menu, Ctrl+K (⌘K) ou « / »,
       et tout élément [data-recherche].
     - Index : recherche-index.json, généré par outils/recherche.py
       (ne pas le modifier à la main). Téléchargé à la première
       ouverture seulement, puis revalidé (304 s'il n'a pas changé).
     - Arrivée sur un résultat : les mots cherchés sont surlignés dans
       la page, avec une petite barre pour passer de l'un à l'autre.
       La même barre sert à « Chercher dans cette page ».
   ══════════════════════════════════════════════════════════════════ */
(function () {
  if (window.ECGRecherche) return;

  var RACINE = (function () {
    try {
      var s = document.currentScript && document.currentScript.src;
      if (s) return new URL('.', s).href;
    } catch (e) {}
    return location.origin + '/';
  })();
  var K_SURLIGNER = 'ecg-recherche-surligner';
  var K_RECENTES = 'ecg-recherche-recentes';
  var MAX_AFFICHES = 30;

  var CATEGORIES = [
    { id: '', nom: 'Tout' },
    { id: 'cours', nom: 'Cours' },
    { id: 'actu', nom: 'Actualités' },
    { id: 'langues', nom: 'Langues' },
    { id: 'cg', nom: 'Culture générale' },
    { id: 'humanite', nom: 'Humanité' }
  ];
  var COULEURS = { cours: '#7c9ec9', actu: '#e07a6a', langues: '#9ecba0', cg: '#c8a96e', humanite: '#c97c9e', autre: '#8a8880' };

  /* Mots trop courants : identiques à VIDES_DE_SENS (outils/recherche.py). */
  var VIDES = {};
  ('le la les de des du un une et en au aux qu que qui dans par pour sur avec ce ces cet cette se sa son ses ' +
   'est sont ne pas plus il elle ils elles on nous vous leur leurs mais ou donc ni car lui y a ' +
   'the of and to in is are was were for on with as by that this it its at from be an or not has have ' +
   'el los las y del por con para una su sus lo al es un como mas o ' +
   'der die das und den dem des ein eine einen ist im mit von zu auf nicht sich er sie es auch')
    .split(' ').forEach(function (m) { VIDES[m] = 1; });

  /* ─── Texte « plié » : minuscules, sans accents, un caractère pour un
     caractère (les positions restent celles du texte d'origine). ─── */
  var PLI = {};
  function plier(s) {
    return s.replace(/[^a-z0-9]/g, function (c) {
      var r = PLI[c];
      if (r === undefined) {
        var d = c.toLowerCase().normalize('NFD').charAt(0);
        r = /[a-z0-9]/.test(d) ? d : ' ';
        PLI[c] = r;
      }
      return r;
    });
  }
  function termesDe(q) {
    var t = plier(q.replace(/œ/gi, 'oe').replace(/æ/gi, 'ae').replace(/ß/g, 'ss')).split(' ')
      .filter(function (m) { return m.length >= 2 || /\d/.test(m); });
    var utiles = t.filter(function (m) { return !VIDES[m]; });
    var vus = {};
    return utiles.filter(function (m) { return vus[m] ? false : (vus[m] = 1); });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* Passages (début, fin) où un mot commence par l'un des termes. */
  function passages(plie, termes) {
    var r = [];
    termes.forEach(function (t) {
      var i = plie.indexOf(t);
      while (i !== -1) {
        if (i === 0 || plie.charAt(i - 1) === ' ') {
          var f = i + t.length;
          while (f < plie.length && plie.charAt(f) !== ' ') f++;
          r.push([i, f]);
        }
        i = plie.indexOf(t, i + 1);
      }
    });
    r.sort(function (a, b) { return a[0] - b[0]; });
    var out = [];
    r.forEach(function (p) {
      var der = out[out.length - 1];
      if (der && p[0] <= der[1]) der[1] = Math.max(der[1], p[1]);
      else out.push(p.slice());
    });
    return out;
  }
  function surligne(s, termes) {
    var ps = passages(plier(s), termes), out = '', k = 0;
    ps.forEach(function (p) { out += esc(s.slice(k, p[0])) + '<mark>' + esc(s.slice(p[0], p[1])) + '</mark>'; k = p[1]; });
    return out + esc(s.slice(k));
  }

  /* ══════════════════════════ Index ══════════════════════════ */
  var index = null, chargement = null;
  function chargerIndex() {
    if (chargement) return chargement;
    chargement = fetch(RACINE + 'recherche-index.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        index = {
          pages: d.pages.map(function (p) {
            return {
              u: p[0], t: p[1], r: p[2], c: p[3], d: p[4], parties: p[5],
              tP: plier(p[1]), dP: plier(p[4] || ''),
              pP: p[5].map(function (x) { return plier(x[0]); })
            };
          }),
          mots: d.mots.split(' '),
          postes: d.p,
          decodes: {}
        };
        return index;
      })
      .catch(function (e) { chargement = null; throw e; });
    return chargement;
  }
  function postes(i) {
    var d = index.decodes[i];
    if (d) return d;
    var bouts = index.postes[i].split('.'), n = -1;
    d = new Array(bouts.length);
    for (var k = 0; k < bouts.length; k++) { n += parseInt(bouts[k], 36) + 1; d[k] = n; }
    return (index.decodes[i] = d);
  }
  function premierMot(t) {
    var m = index.mots, lo = 0, hi = m.length;
    while (lo < hi) { var mi = (lo + hi) >> 1; if (m[mi] < t) lo = mi + 1; else hi = mi; }
    return lo;
  }
  /* Pages contenant un mot qui commence par t : { page: 2 si mot exact, 1 sinon }. */
  function pagesDuTerme(t, prefixe) {
    var res = {}, m = index.mots, i = premierMot(t);
    if (m[i] === t) postes(i).forEach(function (p) { res[p] = 2; });
    if (prefixe) {
      for (var j = (m[i] === t ? i + 1 : i); j < m.length && m[j].lastIndexOf(t, 0) === 0; j++) {
        postes(j).forEach(function (p) { if (!res[p]) res[p] = 1; });
      }
    }
    return res;
  }
  function commencePar(plie, t) {
    var i = plie.indexOf(t);
    while (i !== -1) {
      if (i === 0 || plie.charAt(i - 1) === ' ') return true;
      i = plie.indexOf(t, i + 1);
    }
    return false;
  }

  function chercher(q, cat) {
    var termes = termesDe(q);
    if (!termes.length) return { termes: [], liste: [], comptes: {} };
    var parTerme = termes.map(function (t, k) {
      /* Le dernier mot est en cours de frappe : on accepte les débuts de mots. */
      return pagesDuTerme(t, t.length >= 3 || k === termes.length - 1);
    });
    function evaluer(tous) {
      var cand = {}, scores = [];
      parTerme.forEach(function (pt) { for (var p in pt) cand[p] = 1; });
      var phrase = plier(q).replace(/\s+/g, ' ').trim();
      for (var p in cand) {
        var pg = index.pages[p], s = 0, n = 0;
        termes.forEach(function (t, k) {
          var corps = parTerme[k][p], titre = commencePar(pg.tP, t);
          var parties = pg.pP.some(function (x) { return commencePar(x, t); });
          if (!corps && !titre) return;
          n++;
          s += (corps === 2 ? 2 : 1) + (titre ? 8 : 0) + (parties ? 3 : 0) + (commencePar(pg.dP, t) ? 1 : 0);
        });
        if (!n || (tous && n < termes.length)) continue;
        if (termes.length > 1 && pg.tP.indexOf(phrase) !== -1) s += 10;
        scores.push({ p: +p, s: s + n * 4 });
      }
      return scores;
    }
    var liste = evaluer(true), approchant = false;
    if (!liste.length && termes.length > 1) { liste = evaluer(false); approchant = true; }
    liste.sort(function (a, b) { return b.s - a.s || a.p - b.p; });
    var comptes = { '': liste.length };
    liste.forEach(function (x) { var c = index.pages[x.p].c; comptes[c] = (comptes[c] || 0) + 1; });
    if (cat) liste = liste.filter(function (x) { return index.pages[x.p].c === cat; });
    return { termes: termes, liste: liste, comptes: comptes, approchant: approchant };
  }

  /* ═══════════════════════ Fenêtre de recherche ═══════════════════════ */
  var CSS =
    '#ecg-rech{position:fixed;inset:0;z-index:2147483000;display:none;font-family:"DM Sans",system-ui,-apple-system,sans-serif;color:#e8e6e0}' +
    '#ecg-rech.ouvert{display:block}' +
    '#ecg-rech *{box-sizing:border-box}' +
    '#ecg-rech .r-fond{position:absolute;inset:0;background:rgba(5,5,8,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}' +
    '#ecg-rech .r-boite{position:relative;margin:9vh auto 0;width:min(720px,calc(100vw - 32px));max-height:80vh;display:flex;flex-direction:column;' +
    'background:#16161a;border:1px solid #2a2a35;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden}' +
    '#ecg-rech .r-haut,#ecg-rech .r-filtres,#ecg-rech .r-pied{flex:0 0 auto}' +
    '#ecg-rech .r-haut{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid #2a2a35}' +
    '#ecg-rech .r-haut svg{flex:0 0 auto;color:#c8a96e}' +
    '#ecg-rech input{flex:1;min-width:0;background:none;border:0;outline:0;color:#e8e6e0;font:inherit;font-size:1.08rem;padding:4px 0}' +
    '#ecg-rech input::placeholder{color:#6b6962}' +
    '#ecg-rech input::-webkit-search-cancel-button{display:none}' +
    '#ecg-rech .r-fermer{flex:0 0 auto;background:#1e1e24;border:1px solid #2a2a35;color:#8a8880;border-radius:8px;font:500 .7rem "DM Mono",monospace;padding:5px 8px;cursor:pointer}' +
    '#ecg-rech .r-fermer:hover{color:#e8e6e0}' +
    '#ecg-rech .r-filtres{display:flex;gap:6px;padding:10px 18px;border-bottom:1px solid #2a2a35;overflow-x:auto;scrollbar-width:none}' +
    '#ecg-rech .r-filtres::-webkit-scrollbar{display:none}' +
    '#ecg-rech .r-filtres button{flex:0 0 auto;background:none;border:1px solid #2a2a35;color:#8a8880;border-radius:20px;font:inherit;font-size:.78rem;padding:5px 12px;cursor:pointer;white-space:nowrap}' +
    '#ecg-rech .r-filtres button:hover{color:#e8e6e0;border-color:#3a3a48}' +
    '#ecg-rech .r-filtres button.actif{background:rgba(200,169,110,.14);border-color:rgba(200,169,110,.5);color:#c8a96e}' +
    '#ecg-rech .r-filtres button i{font-style:normal;font-family:"DM Mono",monospace;font-size:.68rem;margin-left:6px;opacity:.75}' +
    '#ecg-rech .r-corps{overflow-y:auto;overscroll-behavior:contain;padding:8px}' +
    '#ecg-rech .r-etat{padding:18px 12px;color:#8a8880;font-size:.88rem;line-height:1.55}' +
    '#ecg-rech .r-etat b{color:#e8e6e0;font-weight:500}' +
    '#ecg-rech .r-recentes{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}' +
    '#ecg-rech .r-recentes button{background:#1e1e24;border:1px solid #2a2a35;color:#e8e6e0;border-radius:20px;font:inherit;font-size:.8rem;padding:5px 12px;cursor:pointer}' +
    '#ecg-rech .r-recentes button:hover{border-color:#c8a96e;color:#c8a96e}' +
    '#ecg-rech a.r-res{display:block;text-decoration:none;color:inherit;padding:12px 14px;border-radius:12px;border:1px solid transparent}' +
    '#ecg-rech a.r-res.sel{background:#1e1e24;border-color:#2a2a35}' +
    '#ecg-rech .r-tag{display:inline-block;font-family:"DM Mono",monospace;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}' +
    '#ecg-rech .r-titre{display:block;font-size:.98rem;font-weight:500;line-height:1.35;color:#e8e6e0}' +
    '#ecg-rech .r-partie{display:block;font-size:.8rem;color:#c8a96e;margin-top:4px;line-height:1.4}' +
    '#ecg-rech .r-desc{display:block;font-size:.82rem;color:#8a8880;margin-top:4px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '#ecg-rech mark{background:rgba(200,169,110,.25);color:#f0dcb0;border-radius:3px;padding:0 1px}' +
    '#ecg-rech .r-plus{display:block;margin:6px auto 10px;background:none;border:1px solid #2a2a35;color:#8a8880;border-radius:20px;font:inherit;font-size:.8rem;padding:7px 16px;cursor:pointer}' +
    '#ecg-rech .r-plus:hover{color:#c8a96e;border-color:#c8a96e}' +
    '#ecg-rech .r-pied{display:flex;gap:16px;padding:9px 18px;border-top:1px solid #2a2a35;color:#5d5b55;font-size:.72rem}' +
    '#ecg-rech .r-pied kbd{font-family:"DM Mono",monospace;background:#1e1e24;border:1px solid #2a2a35;border-radius:4px;padding:0 5px;margin-right:4px;color:#8a8880}' +
    '@media (max-width:640px){#ecg-rech .r-boite{margin:0;width:100%;height:100%;max-height:none;border-radius:0;border:0}' +
    '#ecg-rech input{font-size:16px}#ecg-rech .r-pied{display:none}#ecg-rech .r-haut{padding:12px 14px}#ecg-rech .r-filtres{padding:8px 14px}}' +
    /* Barre « dans la page » et surlignage */
    'mark.ecg-sur{background:rgba(255,209,102,.55);color:inherit;border-radius:2px;padding:0;box-shadow:0 0 0 1px rgba(255,209,102,.35)}' +
    'mark.ecg-sur.ecg-sur-ici{background:#ffb703;color:#111;box-shadow:0 0 0 2px #ffb703}' +
    '#ecg-barre-rech{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:2147482999;display:flex;align-items:center;gap:4px;' +
    'background:#16161a;border:1px solid #2a2a35;border-radius:30px;padding:5px 6px 5px 14px;box-shadow:0 14px 40px rgba(0,0,0,.5);' +
    'font-family:"DM Sans",system-ui,-apple-system,sans-serif;font-size:.84rem;color:#e8e6e0;max-width:calc(100vw - 24px)}' +
    '#ecg-barre-rech .b-q{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#c8a96e}' +
    '#ecg-barre-rech .b-n{font-family:"DM Mono",monospace;font-size:.74rem;color:#8a8880;margin:0 6px;white-space:nowrap}' +
    '#ecg-barre-rech button{width:32px;height:32px;border-radius:50%;border:0;background:none;color:#e8e6e0;cursor:pointer;font-size:1rem;line-height:1;display:flex;align-items:center;justify-content:center}' +
    '#ecg-barre-rech button:hover{background:#1e1e24;color:#c8a96e}' +
    '#ecg-barre-rech button:disabled{opacity:.35;cursor:default;background:none;color:#e8e6e0}';

  var racine = null, champ, corps, filtres, catActive = '', choix = -1, derniere = null, affiches = MAX_AFFICHES, delai;
  var LOUPE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

  function poserCss() {
    if (document.getElementById('ecg-rech-css')) return;
    var st = document.createElement('style');
    st.id = 'ecg-rech-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function construire() {
    if (racine) return;
    poserCss();
    racine = document.createElement('div');
    racine.id = 'ecg-rech';
    racine.setAttribute('role', 'dialog');
    racine.setAttribute('aria-modal', 'true');
    racine.setAttribute('aria-label', 'Rechercher dans le site');
    racine.innerHTML =
      '<div class="r-fond"></div>' +
      '<div class="r-boite">' +
      '<div class="r-haut">' + LOUPE +
      '<input type="search" placeholder="Rechercher un cours, un article, une notion, un auteur…" autocomplete="off" spellcheck="false" aria-label="Rechercher dans le site">' +
      '<button type="button" class="r-fermer" aria-label="Fermer">Échap</button></div>' +
      '<div class="r-filtres" role="tablist"></div>' +
      '<div class="r-corps" role="listbox"></div>' +
      '<div class="r-pied"><span><kbd>↑</kbd><kbd>↓</kbd>naviguer</span><span><kbd>Entrée</kbd>ouvrir</span><span><kbd>Échap</kbd>fermer</span></div>' +
      '</div>';
    document.body.appendChild(racine);
    champ = racine.querySelector('input');
    corps = racine.querySelector('.r-corps');
    filtres = racine.querySelector('.r-filtres');
    racine.querySelector('.r-fond').addEventListener('click', fermer);
    racine.querySelector('.r-fermer').addEventListener('click', fermer);
    champ.addEventListener('input', function () {
      clearTimeout(delai);
      delai = setTimeout(function () { affiches = MAX_AFFICHES; lancer(); }, 90);
    });
    champ.addEventListener('keydown', function (e) {
      var liens = corps.querySelectorAll('a.r-res');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!liens.length) return;
        choix = e.key === 'ArrowDown' ? Math.min(liens.length - 1, choix + 1) : Math.max(0, choix - 1);
        marquerChoix(liens);
      } else if (e.key === 'Enter') {
        /* Sans choix au clavier : le premier résultat du site (pas « Dans cette page »). */
        var l = choix >= 0 ? liens[choix] : (corps.querySelector('a.r-res:not([data-ici])') || liens[0]);
        if (l) { e.preventDefault(); l.click(); }
      }
    });
    filtres.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      catActive = b.getAttribute('data-cat');
      affiches = MAX_AFFICHES;
      lancer();
      champ.focus();
    });
    corps.addEventListener('click', function (e) {
      var r = e.target.closest('.r-recentes button');
      if (r) { champ.value = r.textContent; lancer(); champ.focus(); return; }
      if (e.target.closest('.r-plus')) { affiches += MAX_AFFICHES; afficher(derniere); return; }
      var a = e.target.closest('a.r-res');
      if (!a) return;
      var q = champ.value.trim();
      memoriserRecherche(q);
      if (a.hasAttribute('data-ici')) {
        e.preventDefault();
        fermer();
        surlignerPage(termesDe(q), q, null);
        return;
      }
      try {
        sessionStorage.setItem(K_SURLIGNER, JSON.stringify({
          u: a.getAttribute('data-u'), q: q, termes: termesDe(q), ancre: a.getAttribute('data-ancre') || ''
        }));
      } catch (err) {}
    });
    corps.addEventListener('mousemove', function (e) {
      var a = e.target.closest('a.r-res');
      if (!a) return;
      var liens = corps.querySelectorAll('a.r-res');
      var i = Array.prototype.indexOf.call(liens, a);
      if (i !== choix) { choix = i; marquerChoix(liens, true); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && racine.classList.contains('ouvert')) { e.stopPropagation(); fermer(); }
    }, true);
  }

  function marquerChoix(liens, sansDefiler) {
    Array.prototype.forEach.call(liens, function (l, i) {
      l.classList.toggle('sel', i === choix);
      l.setAttribute('aria-selected', i === choix ? 'true' : 'false');
    });
    if (!sansDefiler && liens[choix]) liens[choix].scrollIntoView({ block: 'nearest' });
  }

  var dejaFocus = null, debordement = '';
  function ouvrir(q) {
    construire();
    if (!racine.classList.contains('ouvert')) {
      dejaFocus = document.activeElement;
      debordement = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      racine.classList.add('ouvert');
    }
    if (typeof q === 'string') champ.value = q;
    champ.focus();
    champ.select();
    lancer();
    chargerIndex().then(function () { if (racine.classList.contains('ouvert')) lancer(); }, function () {
      corps.innerHTML = '<div class="r-etat">L’index de recherche n’a pas pu être chargé. Vérifiez la connexion puis réessayez.</div>';
    });
  }
  function fermer() {
    if (!racine || !racine.classList.contains('ouvert')) return;
    racine.classList.remove('ouvert');
    document.documentElement.style.overflow = debordement;
    if (dejaFocus && dejaFocus.focus) try { dejaFocus.focus(); } catch (e) {}
  }

  function recentes() {
    try { return JSON.parse(localStorage.getItem(K_RECENTES) || '[]'); } catch (e) { return []; }
  }
  function memoriserRecherche(q) {
    if (!q) return;
    var l = recentes().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); });
    l.unshift(q);
    try { localStorage.setItem(K_RECENTES, JSON.stringify(l.slice(0, 6))); } catch (e) {}
  }

  function lancer() {
    var q = champ.value.trim();
    choix = -1;
    if (!q) {
      filtres.innerHTML = '';
      filtres.style.display = 'none';
      var rec = recentes();
      corps.innerHTML = '<div class="r-etat">Tapez un mot : un auteur, une notion, un pays, un événement, un point de grammaire… ' +
        'La recherche porte sur tout le texte des cours, des articles, des fiches et des leçons.' +
        (rec.length ? '<div style="margin-top:16px;color:#5d5b55;font-size:.74rem;text-transform:uppercase;letter-spacing:.12em;font-family:\'DM Mono\',monospace">Recherches récentes</div>' +
          '<div class="r-recentes">' + rec.map(function (x) { return '<button type="button">' + esc(x) + '</button>'; }).join('') + '</div>' : '') +
        '</div>';
      return;
    }
    if (!index) {
      corps.innerHTML = '<div class="r-etat">Chargement de l’index de recherche…</div>';
      return;
    }
    derniere = chercher(q, catActive);
    derniere.q = q;
    afficher(derniere);
  }

  function afficher(res) {
    var q = res.q;
    filtres.style.display = res.termes.length ? '' : 'none';
    filtres.innerHTML = CATEGORIES.map(function (c) {
      var n = res.comptes[c.id] || 0;
      if (c.id && !n && catActive !== c.id) return '';
      return '<button type="button" role="tab" data-cat="' + c.id + '" class="' + (catActive === c.id ? 'actif' : '') + '">' + c.nom + '<i>' + n + '</i></button>';
    }).join('');
    if (!res.termes.length) {
      corps.innerHTML = '<div class="r-etat">Précisez la recherche : les mots trop courants (le, de, the…) ne sont pas cherchés.</div>';
      return;
    }
    var html = '';
    var ici = occurrencesIci(res.termes);
    if (ici) {
      html += '<a class="r-res" href="#" data-ici="1"><span class="r-tag" style="color:#c8a96e">Dans cette page</span>' +
        '<span class="r-titre">' + ici + ' occurrence' + (ici > 1 ? 's' : '') + ' de « ' + esc(q) + ' » ici</span></a>';
    }
    if (!res.liste.length) {
      html += '<div class="r-etat">Aucun résultat pour <b>« ' + esc(q) + ' »</b>' + (catActive ? ' dans cette rubrique' : '') + '. Essayez un autre mot ou une orthographe différente.</div>';
      corps.innerHTML = html;
      return;
    }
    if (res.approchant) html += '<div class="r-etat" style="padding:8px 14px">Aucune page ne contient tous les mots : voici les plus proches.</div>';
    res.liste.slice(0, affiches).forEach(function (x) {
      var pg = index.pages[x.p];
      var parties = [];
      pg.parties.forEach(function (pt, k) {
        if (parties.length < 2 && res.termes.some(function (t) { return commencePar(pg.pP[k], t); })) parties.push(pt);
      });
      html += '<a class="r-res" role="option" href="' + esc(RACINE + pg.u) + '" data-u="' + esc(pg.u) + '"' +
        (parties[0] && parties[0][1] ? ' data-ancre="' + esc(parties[0][1]) + '"' : '') + '>' +
        '<span class="r-tag" style="color:' + (COULEURS[pg.c] || COULEURS.autre) + '">' + esc(pg.r) + '</span>' +
        '<span class="r-titre">' + surligne(pg.t, res.termes) + '</span>' +
        parties.map(function (pt) { return '<span class="r-partie">→ ' + surligne(pt[0], res.termes) + '</span>'; }).join('') +
        (pg.d ? '<span class="r-desc">' + surligne(pg.d, res.termes) + '</span>' : '') +
        '</a>';
    });
    if (res.liste.length > affiches) html += '<button type="button" class="r-plus">Afficher plus de résultats (' + (res.liste.length - affiches) + ')</button>';
    corps.innerHTML = '<div class="r-etat" style="padding:6px 14px 8px;font-size:.76rem">' + res.liste.length + ' page' + (res.liste.length > 1 ? 's' : '') + '</div>' + html;
  }

  /* ═══════════════════════ Dans la page ═══════════════════════ */
  var ZONES_EXCLUES = 'nav,script,style,noscript,textarea,input,select,option,svg,math,#ecg-rech,#ecg-barre-rech,#ecg-account-badge,#ecg-cookies,[contenteditable="true"]';
  function noeudsTexte() {
    var out = [];
    if (!document.body) return out;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || n.nodeValue.length < 2 || !/\S/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p || p.closest(ZONES_EXCLUES)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  }
  function visible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
  function occurrencesIci(termes) {
    if (!termes.length) return 0;
    var n = 0;
    noeudsTexte().forEach(function (t) {
      if (visible(t.parentElement)) n += passages(plier(t.nodeValue), termes).length;
    });
    return n;
  }

  var marques = [], courant = -1, barre = null;
  function effacerSurlignage() {
    marques.forEach(function (m) {
      var p = m.parentNode;
      if (!p) return;
      p.replaceChild(document.createTextNode(m.textContent), m);
      p.normalize();
      if (p.classList && p.classList.contains('ecg-sur-bloc') && p.parentNode) {
        var gp = p.parentNode;
        while (p.firstChild) gp.insertBefore(p.firstChild, p);
        gp.removeChild(p);
        gp.normalize();
      }
    });
    marques = [];
    courant = -1;
    if (barre) { barre.remove(); barre = null; }
  }

  function surlignerPage(termes, q, ancre) {
    effacerSurlignage();
    if (!termes || !termes.length) return 0;
    poserCss();
    noeudsTexte().forEach(function (t) {
      if (marques.length >= 500) return;
      var ps = passages(plier(t.nodeValue), termes);
      if (!ps.length) return;
      var frag = document.createDocumentFragment(), s = t.nodeValue, k = 0;
      ps.forEach(function (p) {
        if (p[0] > k) frag.appendChild(document.createTextNode(s.slice(k, p[0])));
        var m = document.createElement('mark');
        m.className = 'ecg-sur';
        m.textContent = s.slice(p[0], p[1]);
        frag.appendChild(m);
        marques.push(m);
        k = p[1];
      });
      if (k < s.length) frag.appendChild(document.createTextNode(s.slice(k)));
      /* Dans une boîte flex ou grille, chaque morceau deviendrait une case à part :
         on garde le tout dans un seul <span>. */
      var parent = t.parentNode, aff = getComputedStyle(parent).display;
      if (/flex|grid/.test(aff)) {
        var bloc = document.createElement('span');
        bloc.className = 'ecg-sur-bloc';
        bloc.appendChild(frag);
        frag = bloc;
      }
      parent.replaceChild(frag, t);
    });
    if (!marques.length) return 0;
    montrerBarre(q);
    /* Première occurrence visible, après l'ancre de la partie si elle existe. */
    var depart = ancre && document.getElementById(ancre);
    var i = -1;
    if (depart) {
      for (var k = 0; k < marques.length; k++) {
        if (visible(marques[k]) && (depart.compareDocumentPosition(marques[k]) & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY))) { i = k; break; }
      }
    }
    if (i === -1) i = suivante(-1, 1);
    if (i !== -1) aller(i); else majBarre();
    return marques.length;
  }
  function suivante(depuis, sens) {
    for (var n = 1; n <= marques.length; n++) {
      var i = (depuis + sens * n + marques.length * 2) % marques.length;
      if (marques[i].isConnected && visible(marques[i])) return i;
    }
    return -1;
  }
  function aller(i) {
    if (courant !== -1 && marques[courant]) marques[courant].classList.remove('ecg-sur-ici');
    courant = i;
    var m = marques[i];
    m.classList.add('ecg-sur-ici');
    m.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    majBarre();
  }
  function montrerBarre(q) {
    barre = document.createElement('div');
    barre.id = 'ecg-barre-rech';
    barre.setAttribute('role', 'region');
    barre.setAttribute('aria-label', 'Résultats dans la page');
    barre.innerHTML = '<span class="b-q"></span><span class="b-n"></span>' +
      '<button type="button" data-s="-1" aria-label="Occurrence précédente">↑</button>' +
      '<button type="button" data-s="1" aria-label="Occurrence suivante">↓</button>' +
      '<button type="button" data-s="0" aria-label="Effacer le surlignage">✕</button>';
    barre.querySelector('.b-q').textContent = '« ' + q + ' »';
    barre.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var s = +b.getAttribute('data-s');
      if (!s) { effacerSurlignage(); return; }
      var i = suivante(courant, s);
      if (i !== -1) aller(i); else majBarre();
    });
    document.body.appendChild(barre);
  }
  function majBarre() {
    if (!barre) return;
    var vis = marques.filter(function (m) { return m.isConnected && visible(m); });
    var pos = vis.indexOf(marques[courant]) + 1;
    /* Aucune occurrence affichée : le mot est par exemple dans l'autre langue d'un article. */
    barre.querySelector('.b-n').textContent = vis.length ? (pos || '–') + ' / ' + vis.length : 'non affiché ici';
    Array.prototype.forEach.call(barre.querySelectorAll('button[data-s="1"],button[data-s="-1"]'), function (b) {
      b.disabled = marques.length < 2 && vis.length === 1;
    });
  }

  /* Arrivée depuis un résultat de recherche. */
  function surlignageEnAttente() {
    var d;
    try { d = JSON.parse(sessionStorage.getItem(K_SURLIGNER) || 'null'); sessionStorage.removeItem(K_SURLIGNER); } catch (e) { return; }
    if (!d || !d.termes || !d.termes.length) return;
    /* Cloudflare sert « page.html » à l'adresse « page » et « index.html » à « dossier/ ». */
    function canon(u) { return u.replace(/\.html$/, '').replace(/(^|\/)index$/, '$1'); }
    var ici = canon(decodeURIComponent(location.pathname)), u = canon('/' + d.u);
    if (ici.slice(-u.length) !== u) return;
    /* Les pages construites par un script (cours de langues, jours…)
       peuvent ne s'afficher qu'après le chargement : on réessaie. */
    var essais = 0;
    (function essayer() {
      if (surlignerPage(d.termes, d.q, d.ancre) || ++essais > 6) return;
      setTimeout(essayer, 400);
    })();
  }

  /* ═══════════════════════ Déclencheurs ═══════════════════════ */
  document.addEventListener('keydown', function (e) {
    var cible = e.target, saisie = cible && (cible.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(cible.tagName));
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      ouvrir();
    } else if (e.key === '/' && !saisie && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      ouvrir();
    } else if (e.key === 'Escape' && barre && !(racine && racine.classList.contains('ouvert'))) {
      effacerSurlignage();
    }
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-recherche]');
    if (!el) return;
    e.preventDefault();
    var v = el.tagName === 'INPUT' ? el.value : el.getAttribute('data-recherche');
    if (el.tagName === 'INPUT') el.blur();
    ouvrir(v || '');
  });
  /* Champ de recherche intégré à une page : on ouvre la fenêtre dès qu'on tape. */
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.matches || !el.matches('input[data-recherche]')) return;
    var v = el.value;
    el.value = '';
    el.blur();
    ouvrir(v);
  });
  document.addEventListener('focusin', function (e) {
    if (e.target.matches && e.target.matches('input[data-recherche]')) chargerIndex().catch(function () {});
  });

  window.ECGRecherche = { ouvrir: ouvrir, fermer: fermer, surligner: surlignerPage, effacer: effacerSurlignage };

  if (document.readyState === 'complete') setTimeout(surlignageEnAttente, 150);
  else window.addEventListener('load', function () { setTimeout(surlignageEnAttente, 150); });
})();
