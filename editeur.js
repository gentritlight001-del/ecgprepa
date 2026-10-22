/* ═══════════════════════════════════════════════════════════════════
   Mode éditeur (administrateur seulement)
   ───────────────────────────────────────────────────────────────────
   Sur une page qui charge ce script, l'administrateur voit un bouton
   « Modifier la page ». En mode éditeur, les blocs de texte de la zone
   indiquée par data-racine (par défaut #cours) deviennent modifiables :
   paragraphes, titres, listes, légendes, cellules, citations.
   « Enregistrer et mettre en ligne » renvoie le fichier modifié sur
   GitHub (branche main) : Cloudflare Pages redéploie le site.

   Seuls les blocs modifiés sont réécrits dans le fichier source : on
   retrouve chacun par son rang dans la page, puis on vérifie que son
   texte d'origine est bien le même dans le fichier avant d'y toucher.

   Le jeton GitHub (fine-grained, « Contents : Read and write » sur le
   dépôt) reste dans le navigateur de l'administrateur (localStorage).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var REPO = 'gentritlight001-del/ecgprepa', BRANCHE = 'main', CLE_JETON = 'ecg-editeur:jeton';
  var script = document.currentScript;
  var RACINE = (script && script.dataset.racine) || '#cours';
  var BALISES = ['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figcaption', 'td', 'th', 'dt', 'dd', 'blockquote'];
  var SEL = BALISES.join(',');
  var INLINE_OK = { STRONG: 1, B: 1, EM: 1, I: 1, U: 1, SUP: 1, SUB: 1, BR: 1, A: 1, SPAN: 1, MARK: 1, SMALL: 1, ABBR: 1, CITE: 1, Q: 1, TIME: 1, DFN: 1 };
  var ATTR_OK = { A: ['href', 'class', 'target', 'rel'], SPAN: ['class', 'data-def', 'tabindex', 'lang'], ABBR: ['title'], TIME: ['datetime', 'class'], '*': ['class', 'lang'] };

  var actif = false, blocs = [], barre, bouton, toast;

  function estAdmin() { try { return !!(window.ECGAuth && window.ECGAuth.estAdmin()); } catch (e) { return false; } }
  function lireJeton() { try { return localStorage.getItem(CLE_JETON) || ''; } catch (e) { return ''; } }
  function ecrireJeton(t) { try { t ? localStorage.setItem(CLE_JETON, t) : localStorage.removeItem(CLE_JETON); } catch (e) {} }
  function norm(s) { return String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim(); }

  function cheminFichier() {
    var p = decodeURIComponent(location.pathname).replace(/^\/+/, '');
    if (!p || /\/$/.test(p)) p += 'index.html';
    else if (!/\.[a-z0-9]+$/i.test(p)) p += '.html';
    return p;
  }

  /* ───────── styles ───────── */
  function styles() {
    var css =
      '.ed-btn{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:880;display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;border:0;background:#1c1e1c;color:#fff;font:600 .86rem/1 system-ui,sans-serif;box-shadow:0 8px 22px rgba(0,0,0,.28);cursor:pointer}' +
      '.ed-btn:hover{background:#000}' +
      'body.ed-on .ed-btn{display:none}' +
      '.ed-bar{position:fixed;left:0;right:0;bottom:16px;margin:0 auto;width:max-content;z-index:890;display:none;align-items:center;flex-wrap:wrap;gap:8px;max-width:calc(100vw - 24px);padding:10px 12px;border-radius:14px;background:#1c1e1c;color:#fff;font:500 .84rem/1.2 system-ui,sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.35)}' +
      'body.ed-on .ed-bar{display:flex}' +
      '.ed-bar b{font-weight:700;margin-right:4px}' +
      '.ed-bar .ed-n{color:#c9d3bd;margin-right:6px}' +
      '.ed-bar button{padding:7px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;font:600 .8rem/1 system-ui,sans-serif;cursor:pointer}' +
      '.ed-bar button:hover{background:rgba(255,255,255,.12)}' +
      '.ed-bar button.ed-go{background:#6f8a52;border-color:#6f8a52}' +
      '.ed-bar button.ed-go:hover{background:#5d7744}' +
      '.ed-bar button:disabled{opacity:.45;cursor:default}' +
      '.ed-bar .ed-sep{width:1px;height:20px;background:rgba(255,255,255,.25)}' +
      'body.ed-on [data-ed]{outline:1px dashed rgba(75,90,60,.45);outline-offset:3px;border-radius:2px;cursor:text}' +
      'body.ed-on [data-ed]:hover{outline-color:#4b5a3c}' +
      'body.ed-on [data-ed]:focus{outline:2px solid #4b5a3c;background:rgba(229,232,223,.45)}' +
      'body.ed-on [data-ed].ed-modif{outline:2px solid #c98a1a}' +
      '.ed-toast{position:fixed;left:0;right:0;bottom:86px;margin:0 auto;width:max-content;z-index:895;max-width:min(560px,calc(100vw - 24px));padding:10px 16px;border-radius:10px;background:#fff;color:#1c1e1c;font:500 .86rem/1.4 system-ui,sans-serif;box-shadow:0 10px 26px rgba(0,0,0,.25);border-left:4px solid #4b5a3c;opacity:0;pointer-events:none;transition:opacity .2s}' +
      '.ed-toast.ok{opacity:1}.ed-toast.err{border-left-color:#a3292a}' +
      '.ed-fond{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:16px;background:rgba(28,30,28,.55)}' +
      '.ed-modal{width:min(520px,100%);padding:22px 24px;border-radius:12px;background:#fff;color:#1c1e1c;font:400 .9rem/1.55 system-ui,sans-serif;border-top:5px solid #4b5a3c}' +
      '.ed-modal h3{margin:0 0 8px;font:600 1.2rem/1.3 Georgia,serif}' +
      '.ed-modal ol{margin:8px 0 12px;padding-left:20px}.ed-modal a{color:#4b5a3c;font-weight:600}' +
      '.ed-modal input{width:100%;box-sizing:border-box;margin:6px 0 12px;padding:9px 11px;border:1px solid #b9bdb3;border-radius:8px;font:400 .9rem monospace}' +
      '.ed-modal .ed-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}' +
      '.ed-modal button{padding:8px 16px;border-radius:999px;border:1px solid #4b5a3c;background:#fff;color:#4b5a3c;font:600 .84rem system-ui,sans-serif;cursor:pointer}' +
      '.ed-modal button.ed-go{background:#4b5a3c;color:#fff}' +
      '.ed-modal .ed-err{color:#a3292a;font-weight:600}' +
      '@media print{.ed-btn,.ed-bar,.ed-toast{display:none!important}}';
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  }

  function dire(msg, erreur) {
    toast.textContent = msg; toast.className = 'ed-toast ok' + (erreur ? ' err' : '');
    clearTimeout(dire.t); dire.t = setTimeout(function () { toast.className = 'ed-toast'; }, erreur ? 9000 : 5000);
  }

  /* ───────── blocs modifiables ───────── */
  function recenser() {
    var racine = document.querySelector(RACINE); if (!racine) return [];
    var tous = Array.prototype.slice.call(racine.querySelectorAll(SEL));
    return tous.map(function (el, i) { return { el: el, i: i, tag: el.tagName.toLowerCase() }; })
      .filter(function (b) {
        if (b.el.querySelector(SEL)) return false;                       // seulement les blocs « feuilles »
        if (b.el.closest('svg, script, style, [contenteditable="false"], .hl-ui')) return false;
        return norm(b.el.textContent) !== '';
      });
  }
  function modifies() { return blocs.filter(function (b) { return b.el.innerHTML !== b.html0; }); }
  function majCompte() {
    var n = modifies().length;
    blocs.forEach(function (b) { b.el.classList.toggle('ed-modif', b.el.innerHTML !== b.html0); });
    barre.querySelector('.ed-n').textContent = n ? n + ' modification' + (n > 1 ? 's' : '') : 'aucune modification';
    barre.querySelector('.ed-go').disabled = !n;
    barre.querySelector('[data-ed-a="annuler"]').disabled = !n;
  }

  function activer() {
    if (!blocs.length) blocs = recenser().map(function (b) { b.html0 = b.el.innerHTML; b.txt0 = norm(b.el.textContent); return b; });
    blocs.forEach(function (b) { b.el.setAttribute('contenteditable', 'true'); b.el.setAttribute('data-ed', ''); b.el.spellcheck = true; });
    document.body.classList.add('ed-on'); actif = true; majCompte();
    dire('Mode éditeur : clique dans un texte pour le modifier. Rien ne part en ligne avant « Enregistrer ».');
  }
  function desactiver() {
    if (modifies().length && !confirm('Quitter le mode éditeur sans enregistrer ? Tes modifications resteront affichées jusqu\'au rechargement de la page.')) return;
    blocs.forEach(function (b) { b.el.removeAttribute('contenteditable'); b.el.removeAttribute('data-ed'); b.el.classList.remove('ed-modif'); });
    document.body.classList.remove('ed-on'); actif = false;
  }
  function annulerTout() {
    if (!confirm('Annuler toutes les modifications non enregistrées ?')) return;
    modifies().forEach(function (b) { b.el.innerHTML = b.html0; }); majCompte();
  }

  /* ───────── nettoyage du HTML saisi ───────── */
  function echapper(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function echapperAttr(t) { return t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function serialiser(noeud) {
    var out = '';
    noeud.childNodes.forEach(function (n) {
      if (n.nodeType === 3) { out += echapper(n.data); return; }
      if (n.nodeType !== 1) return;
      var t = n.tagName;
      if (!INLINE_OK[t]) { out += (t === 'DIV' && out ? '<br>' : '') + serialiser(n); return; }   // balise non permise : on garde son texte
      if (t === 'BR') { out += '<br>'; return; }
      var permis = (ATTR_OK[t] || []).concat(ATTR_OK['*']), attrs = '';
      Array.prototype.forEach.call(n.attributes, function (a) {
        if (permis.indexOf(a.name) === -1) return;
        if (a.name === 'href' && /^\s*javascript:/i.test(a.value)) return;
        if (a.name === 'class') { var v = a.value.replace(/\bed-modif\b/g, '').trim(); if (v) attrs += ' class="' + echapperAttr(v) + '"'; return; }
        attrs += ' ' + a.name + '="' + echapperAttr(a.value) + '"';
      });
      var l = t.toLowerCase();
      out += '<' + l + attrs + '>' + serialiser(n) + '</' + l + '>';
    });
    return out;
  }
  function htmlPropre(el) { return serialiser(el).replace(/(<br>)+$/, ''); }

  /* ───────── retrouver un bloc dans le fichier source ───────── */
  function masquer(src) {        // commentaires, scripts et styles remplacés par des espaces (mêmes positions)
    return src.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, function (m) { return m.replace(/[^\n]/g, ' '); });
  }
  function finBalise(m, tag, depuis) {   // position du </tag> qui ferme la balise ouverte avant « depuis »
    var re = new RegExp('<(/?)' + tag + '(?=[\\s>/])[^>]*>', 'gi'), prof = 1, r;
    re.lastIndex = depuis;
    while ((r = re.exec(m))) {
      if (r[1]) { if (--prof === 0) return { debut: r.index, fin: re.lastIndex }; }
      else if (!/\/>$/.test(r[0])) prof++;
    }
    return null;
  }
  function zoneRacine(m) {
    var id = RACINE.replace(/^#/, '');
    var re = new RegExp('<([a-z][a-z0-9]*)\\b[^>]*\\sid="' + id + '"[^>]*>', 'i'), r = re.exec(m);
    if (!r) return null;
    var f = finBalise(m, r[1], r.index + r[0].length);
    return f ? { debut: r.index + r[0].length, fin: f.debut } : null;
  }
  function elementsSource(src) {
    var m = masquer(src), z = zoneRacine(m); if (!z) return null;
    var re = new RegExp('<(' + BALISES.join('|') + ')(?=[\\s>])[^>]*>', 'gi'), res = [], r;
    re.lastIndex = z.debut;
    while ((r = re.exec(m)) && r.index < z.fin) {
      var tag = r[1].toLowerCase(), ouv = re.lastIndex, f = finBalise(m, tag, ouv);
      res.push({ tag: tag, ouv: ouv, ferm: f ? f.debut : -1 });
    }
    return res;
  }
  function texteSource(html) {
    var d = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
    return norm(d.body.textContent);
  }

  function appliquer(src, liste) {
    var els = elementsSource(src);
    if (!els) throw new Error('Zone ' + RACINE + ' introuvable dans le fichier.');
    var remplacements = [], echecs = [];
    liste.forEach(function (b) {
      var cand = els[b.i], ok = cand && cand.tag === b.tag && cand.ferm > 0 && texteSource(src.slice(cand.ouv, cand.ferm)) === b.txt0;
      if (!ok) {                                   // le rang ne colle pas : on cherche le seul bloc au même texte
        var memes = els.filter(function (e) { return e.tag === b.tag && e.ferm > 0 && texteSource(src.slice(e.ouv, e.ferm)) === b.txt0; });
        cand = memes.length === 1 ? memes[0] : null;
      }
      if (!cand) { echecs.push(b); return; }
      remplacements.push({ de: cand.ouv, a: cand.ferm, html: htmlPropre(b.el), b: b });
    });
    remplacements.sort(function (x, y) { return y.de - x.de; }).forEach(function (r) { src = src.slice(0, r.de) + r.html + src.slice(r.a); });
    return { src: src, faits: remplacements.map(function (r) { return r.b; }), echecs: echecs };
  }

  /* ───────── GitHub ───────── */
  function b64VersTexte(b64) {
    var bin = atob(b64.replace(/\s/g, '')), octets = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(octets);
  }
  function texteVersB64(t) {
    var octets = new TextEncoder().encode(t), bin = '', pas = 0x8000;
    for (var i = 0; i < octets.length; i += pas) bin += String.fromCharCode.apply(null, octets.subarray(i, i + pas));
    return btoa(bin);
  }
  function api(chemin, opts, jeton) {
    opts = opts || {};
    opts.headers = Object.assign({ 'Authorization': 'Bearer ' + jeton, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, opts.headers || {});
    return fetch('https://api.github.com/repos/' + REPO + chemin, opts);
  }
  function lireFichier(chemin, jeton) {
    var url = '/contents/' + chemin.split('/').map(encodeURIComponent).join('/') + '?ref=' + BRANCHE;
    return api(url, { cache: 'no-store' }, jeton).then(function (r) {
      if (r.status === 401) throw new Error('jeton');
      if (!r.ok) throw new Error('Lecture du fichier impossible (' + r.status + ').');
      return r.json();
    }).then(function (j) {
      if (j.content) return { sha: j.sha, texte: b64VersTexte(j.content) };
      return api(url, { cache: 'no-store', headers: { 'Accept': 'application/vnd.github.raw+json' } }, jeton)
        .then(function (r) { return r.text(); }).then(function (t) { return { sha: j.sha, texte: t }; });
    });
  }
  function ecrireFichier(chemin, texte, sha, message, jeton) {
    return api('/contents/' + chemin.split('/').map(encodeURIComponent).join('/'), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, content: texteVersB64(texte), sha: sha, branch: BRANCHE })
    }, jeton).then(function (r) {
      if (r.status === 401 || r.status === 403) throw new Error('jeton');
      if (r.status === 409) throw new Error('conflit');
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw new Error('Envoi refusé (' + r.status + ') ' + (j.message || '')); });
      return r.json();
    });
  }

  function demanderJeton(erreur) {
    return new Promise(function (resolve) {
      var fond = document.createElement('div'); fond.className = 'ed-fond';
      fond.innerHTML =
        '<div class="ed-modal" role="dialog" aria-label="Jeton GitHub">' +
        '<h3>Relier l\'éditeur à GitHub</h3>' +
        (erreur ? '<p class="ed-err">Le jeton enregistré a été refusé : colle un nouveau jeton.</p>' : '') +
        '<p>Pour mettre tes modifications en ligne, l\'éditeur a besoin d\'un jeton GitHub. Il reste dans ce navigateur.</p>' +
        '<ol><li>Ouvre <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com › Fine-grained token</a>.</li>' +
        '<li><b>Repository access</b> : <i>Only select repositories</i> › <b>ecgprepa</b>.</li>' +
        '<li><b>Permissions</b> › <b>Contents</b> : <i>Read and write</i>. Génère le jeton et copie-le.</li></ol>' +
        '<input type="password" autocomplete="off" placeholder="github_pat_…" aria-label="Jeton GitHub">' +
        '<div class="ed-row"><button type="button" data-r="non">Annuler</button><button type="button" class="ed-go" data-r="oui">Enregistrer le jeton</button></div></div>';
      document.body.appendChild(fond);
      var champ = fond.querySelector('input'); champ.focus();
      function fin(v) { fond.remove(); resolve(v); }
      fond.addEventListener('click', function (e) {
        var b = e.target.closest('[data-r]'); if (!b) return;
        if (b.dataset.r === 'oui') { var t = champ.value.trim(); if (!t) { champ.focus(); return; } ecrireJeton(t); fin(t); } else fin('');
      });
      champ.addEventListener('keydown', function (e) { if (e.key === 'Enter') fond.querySelector('[data-r="oui"]').click(); if (e.key === 'Escape') fin(''); });
    });
  }

  function enregistrer(jetonRefuse) {
    var liste = modifies(); if (!liste.length) return;
    var jeton = jetonRefuse ? '' : lireJeton();
    var p = jeton ? Promise.resolve(jeton) : demanderJeton(jetonRefuse);
    var go = barre.querySelector('.ed-go');
    p.then(function (j) {
      if (!j) return;
      jeton = j; go.disabled = true; go.textContent = 'Envoi…';
      var chemin = cheminFichier();
      function essai(n) {
        return lireFichier(chemin, jeton).then(function (f) {
          var r = appliquer(f.texte, liste);
          if (!r.faits.length) throw new Error('Aucun bloc retrouvé dans le fichier : il a peut-être changé depuis le chargement de la page. Recharge-la puis recommence.');
          var msg = 'Édition en ligne : ' + chemin + ' (' + r.faits.length + ' bloc' + (r.faits.length > 1 ? 's' : '') + ')';
          return ecrireFichier(chemin, r.src, f.sha, msg, jeton).then(function () { return r; })
            .catch(function (e) { if (e.message === 'conflit' && n < 2) return essai(n + 1); throw e; });
        });
      }
      return essai(0).then(function (r) {
        r.faits.forEach(function (b) { b.html0 = b.el.innerHTML; b.txt0 = norm(b.el.textContent); });
        majCompte();
        dire(r.echecs.length
          ? r.faits.length + ' bloc(s) mis en ligne. ' + r.echecs.length + ' bloc(s) introuvable(s) dans le fichier, restés en orange : recharge la page et refais-les.'
          : 'Mis en ligne. Le site se met à jour d\'ici une à deux minutes.', !!r.echecs.length);
      });
    }).catch(function (e) {
      if (e.message === 'jeton') { ecrireJeton(''); dire('Jeton GitHub refusé.', true); return enregistrer(true); }
      dire(e.message === 'conflit' ? 'Le fichier a changé entre-temps. Recharge la page puis recommence.' : (e.message || 'Erreur pendant l\'envoi.'), true);
    }).then(function () { go.textContent = 'Enregistrer et mettre en ligne'; majCompte(); });
  }

  /* ───────── interface ───────── */
  function construire() {
    styles();
    bouton = document.createElement('button'); bouton.type = 'button'; bouton.className = 'ed-btn';
    bouton.innerHTML = '<span aria-hidden="true">✎</span> Modifier la page';
    bouton.addEventListener('click', activer);
    barre = document.createElement('div'); barre.className = 'ed-bar'; barre.setAttribute('role', 'toolbar'); barre.setAttribute('aria-label', 'Mode éditeur');
    barre.innerHTML =
      '<b>Mode éditeur</b><span class="ed-n"></span>' +
      '<button type="button" data-ed-a="gras" title="Gras (Ctrl+B)"><b>G</b></button>' +
      '<button type="button" data-ed-a="ital" title="Italique (Ctrl+I)"><i>I</i></button>' +
      '<button type="button" data-ed-a="lien" title="Lien">Lien</button>' +
      '<span class="ed-sep"></span>' +
      '<button type="button" data-ed-a="annuler">Tout annuler</button>' +
      '<button type="button" class="ed-go" data-ed-a="go">Enregistrer et mettre en ligne</button>' +
      '<button type="button" data-ed-a="quitter">Quitter</button>' +
      '<button type="button" data-ed-a="jeton" title="Oublier le jeton GitHub de ce navigateur">Jeton</button>';
    barre.addEventListener('mousedown', function (e) { if (e.target.closest('[data-ed-a="gras"],[data-ed-a="ital"],[data-ed-a="lien"]')) e.preventDefault(); });
    barre.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ed-a]'); if (!b) return;
      var a = b.dataset.edA;
      if (a === 'gras') document.execCommand('bold');
      else if (a === 'ital') document.execCommand('italic');
      else if (a === 'lien') { var u = prompt('Adresse du lien (vide pour retirer le lien) :', 'https://'); if (u === null) return; if (u && u !== 'https://') document.execCommand('createLink', false, u); else document.execCommand('unlink'); }
      else if (a === 'annuler') annulerTout();
      else if (a === 'go') enregistrer();
      else if (a === 'quitter') desactiver();
      else if (a === 'jeton') { if (confirm('Oublier le jeton GitHub enregistré dans ce navigateur ?')) { ecrireJeton(''); dire('Jeton oublié.'); } }
      majCompte();
    });
    toast = document.createElement('div'); toast.className = 'ed-toast'; toast.setAttribute('role', 'status');
    document.body.append(bouton, barre, toast);

    document.addEventListener('input', function (e) { if (actif && e.target.closest && e.target.closest('[data-ed]')) majCompte(); });
    document.addEventListener('paste', function (e) {           // collage en texte brut
      if (!actif || !e.target.closest || !e.target.closest('[data-ed]')) return;
      e.preventDefault();
      var t = (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s*\n\s*/g, ' ');
      document.execCommand('insertText', false, t);
    });
    document.addEventListener('keydown', function (e) {
      if (!actif || !e.target.closest || !e.target.closest('[data-ed]')) return;
      if (e.key === 'Enter') e.preventDefault();                   // un bloc reste un bloc
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); enregistrer(); }
    }, true);
    document.addEventListener('click', function (e) {             // pas de navigation en cliquant un lien à modifier
      if (actif && e.target.closest && e.target.closest('[data-ed] a')) e.preventDefault();
    }, true);
    window.addEventListener('beforeunload', function (e) { if (actif && modifies().length) { e.preventDefault(); e.returnValue = ''; } });
  }

  function demarrer() { if (bouton || !estAdmin() || !document.querySelector(RACINE)) return; construire(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
  document.addEventListener('ecg:pret', demarrer);

  window.ECGEditeur = { _t: { appliquer: appliquer, elementsSource: elementsSource, htmlPropre: htmlPropre, recenser: recenser, cheminFichier: cheminFichier } };
})();
