/* ══════════════════════════════════════════════════════════════════
   ECG Prépa : onglet « Statistiques » de la page d'administration

   Refonte de novembre 2026 (maquette « Statistiques v2 » validée par le
   propriétaire, option « par compte, sans nom ») :
   • une personne = un compte (tous ses appareils réunis) ou, sans
     compte, un navigateur ; une lecture = une personne × un contenu sur
     la période (relire ne compte pas deux fois) ;
   • seuls les contenus comptent (chapitres, leçons, articles, dossiers,
     fiches, textes du jour, colles) : index, listes, accueil, tarifs,
     connexion et flashcards sont écartés (estContenu, même règle que
     stats_est_contenu côté base) ;
   • par compte, sans nom : des totaux et des profils, jamais qui a lu
     quoi.
   Données : fonction stats_contenus (supabase/statistiques-comptes.sql).
   Tant qu'elle n'existe pas dans la base, l'onglet se rabat sur
   stats_lecture (lecteurs comptés par navigateur, sans la partie
   « membres » ni la grille jour × heure).

   Chargé par admin.html, après auth.js. Expose window.ECGLectureAdmin
   { rafraichir, titre, rubrique, estContenu, infos } (aussi utilisé par
   la vue d'ensemble).
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var A = window.ECGAuth;
  if (!A || !A.admin) return;
  var Ad = A.admin;

  var NB = ' ';
  var PAR_PAGE = 15;
  var JOURS_LONGS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  var JOURS_COURTS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
  var TYPES = [['Cours', 'Cours'], ['Texte du jour', 'Textes du jour'], ['Colle', 'Colles'], ['Article', 'Articles'],
               ['Culture générale', 'Culture générale'], ['Humanité', 'Humanité']];
  var COUL_TYPE = {
    'Cours': ['rgba(200,169,110,.16)', '#c8a96e'], 'Article': ['rgba(224,138,138,.14)', '#e08a8a'],
    'Culture générale': ['rgba(158,203,160,.14)', '#9ecba0'], 'Humanité': ['rgba(201,124,158,.14)', '#d79ab6'],
    'Texte du jour': ['rgba(124,158,201,.14)', '#8fb0db'], 'Colle': ['rgba(181,163,230,.14)', '#b6a3e6']
  };
  var COUL_MAT = ['#c8a96e', '#7c9ec9', '#e08a8a', '#9ecba0', '#c97c9e', '#6a6860'];

  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nb(n) { return Number(n || 0).toLocaleString('fr-FR'); }
  function pc(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function virgule(x) { return String(Math.round((x || 0) * 10) / 10).replace('.', ','); }
  function duree(s) {
    s = Math.round(s || 0);
    if (!s) return '—';
    if (s < 60) return s + NB + 's';
    if (s >= 3600) { var h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h + NB + 'h' + (m ? NB + ('0' + m).slice(-2) : ''); }
    var mi = Math.floor(s / 60), r = s % 60;
    return mi + NB + 'min' + (r ? NB + ('0' + r).slice(-2) : '');
  }
  function heures(s) {
    s = Math.round(s || 0);
    if (s < 3600) return duree(s);
    return nb(Math.round(s / 3600)) + NB + 'h';
  }
  function toast(txt, kind) {
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = txt; t.className = 'show ' + (kind || '');
    clearTimeout(t._h); t._h = setTimeout(function () { t.className = ''; }, 3600);
  }

  /* ─── Contenus : quelle page compte, de quel type, de quelle matière ─── */
  function estContenu(page) {
    var p = String(page || '').toLowerCase();
    if (/^actualites\/[^/]+\/articles\/[^/]+\.html$/.test(p)) return true;
    if (/^culture-generale\/[^/]+\.html$/.test(p)) return true;
    if (/^humanite\/.+\.html$/.test(p)) return !/\/(art|cinema|litterature|musique|cours|cours-humanite|fiches-auteurs|index)\.html$/.test(p);
    if (/^(premiere|deuxieme)_annee\/.+\.html$/.test(p)) return !/(^|\/)index\.html$/.test(p) && p.indexOf('/flashcards/') === -1;
    return false;
  }
  var MATIERES = { hgg: 'HGG', mathematiques: 'Maths', maths: 'Maths', esh: 'ESH', philosophie: 'Philosophie',
                   anglais: 'Anglais', espagnol: 'Espagnol', allemand: 'Allemand' };
  var EDITIONS = { en: 'anglophone', es: 'hispanophone', de: 'germanophone', monde: 'mondiale' };
  var HUM = { art: 'art', cinema: 'cinéma', litterature: 'littérature', musique: 'musique' };
  function infos(page) {
    var p = String(page || '').toLowerCase(), m;
    if ((m = p.match(/^actualites\/([^/]+)\/articles\//))) return { type: 'Article', matiere: 'Actualité', detail: 'Actualité ' + (EDITIONS[m[1]] || m[1]) };
    if (/^culture-generale\//.test(p)) return { type: 'Culture générale', matiere: 'Culture générale', detail: 'Dossier de culture générale' };
    if ((m = p.match(/^humanite\/([^/]+)\//))) {
      var d = HUM[m[1]] ? 'L’Humanité · ' + HUM[m[1]]
        : /fiches auteurs\//.test(p) ? 'L’Humanité · fiche auteur' : 'L’Humanité · cours';
      return { type: 'Humanité', matiere: 'L’Humanité', detail: d };
    }
    if ((m = p.match(/^(premiere|deuxieme)_annee\/([^/]+)\/(?:([^/]+)\/)?/))) {
      var an = m[1] === 'premiere' ? '1re année' : '2e année';
      var mat = MATIERES[m[2]] || m[2];
      if (m[2] === 'langues') mat = m[1] === 'deuxieme' ? 'Civilisation' : (MATIERES[m[3]] || 'Langues');
      var type = /\/quotidien\/jour-/.test(p) ? 'Texte du jour' : /\/colles\/colle/.test(p) ? 'Colle' : 'Cours';
      return { type: type, matiere: mat, detail: mat + ' · ' + an };
    }
    return { type: 'Autre', matiere: 'Autres pages', detail: '' };
  }
  /* Ancienne forme (vue d'ensemble, compatibilité). */
  function rubrique(page) { var i = infos(page); return { grande: i.matiere, fine: i.detail || i.matiere }; }

  var INDEX = null;       /* chemin en minuscules → titre (recherche-index.json) */
  var PAGES_SITE = [];    /* [{ page, titre }] de tous les contenus du site */
  var ORIGINAL = {};      /* chemin en minuscules → chemin réel (majuscules gardées) */
  function lien(page) { var c = String(page || '').toLowerCase(); return ORIGINAL[c] || page; }
  function chargerIndex() {
    if (INDEX) return Promise.resolve();
    return fetch('recherche-index.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (j) {
      INDEX = {};
      (j.pages || []).forEach(function (x) {
        var c = String(x[0] || '').toLowerCase();
        INDEX[c] = x[1];
        ORIGINAL[c] = x[0];
        if (estContenu(c)) PAGES_SITE.push({ page: c, titre: x[1] });
      });
    }).catch(function () { INDEX = {}; });
  }
  function titrePropre(t, page) {
    var x = String(t || '').replace(/\s+[—|·–-]\s+ECG Prépa\s*$/i, '').replace(/^ECG Prépa\s+[—|·–-]\s+/i, '').trim();
    if (!x || x === 'Page introuvable') x = (INDEX && INDEX[String(page || '').toLowerCase()]) || '';
    return x || String(page || '').split('/').pop().replace(/\.html$/, '').replace(/-/g, ' ');
  }
  function titrePage(p) { return titrePropre(p.titre, p.page); }

  /* ─── Idées pour le site (idees-articles.html, localStorage « ecg-articles ») ─── */
  function titreIdee(q) { return 'Contenu sur « ' + String(q).trim() + ' »'; }
  function lireIdees() {
    try { var l = JSON.parse(localStorage.getItem('ecg-articles') || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; }
  }
  function titresIdees() {
    var t = {}; lireIdees().forEach(function (a) { if (a && a.title) t[String(a.title).toLowerCase()] = 1; }); return t;
  }
  function ajouterIdee(q, n) {
    var l = lireIdees(), titre = titreIdee(q);
    if (titresIdees()[titre.toLowerCase()]) return true;
    l.unshift({ id: Date.now(), title: titre,
      note: 'Recherche tapée par ' + n + ' lecteur' + (n > 1 ? 's' : '') + ' dans la loupe du site, sans aucun résultat (statistiques, ' + new Date().toLocaleDateString('fr-FR') + ').',
      link: '', sec: 'autre', sub: 'autre', prio: 'med', done: false, date: new Date().toISOString() });
    try { localStorage.setItem('ecg-articles', JSON.stringify(l)); } catch (e) { return false; }
    toast('Ajoutée aux idées pour le site.', 'ok');
    return true;
  }

  /* ─── Styles ─── */
  function poserStyles() {
    if (document.getElementById('ecg-lecture-css')) return;
    var s = document.createElement('style');
    s.id = 'ecg-lecture-css';
    s.textContent = [
      '#p-lecture .st-barre{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;padding:10px 12px;margin-bottom:26px;background:var(--surface);border:1px solid var(--border);border-radius:16px;z-index:20}',
      '@media(min-width:961px){#p-lecture .st-barre{position:sticky;top:68px;box-shadow:0 10px 30px rgba(0,0,0,.35)}}',
      '#p-lecture .st-seg{display:flex;gap:4px;padding:4px;background:var(--bg);border-radius:999px;flex-wrap:wrap}',
      '#p-lecture .st-seg button{min-height:34px;padding:0 14px;border-radius:999px;border:0;background:none;color:var(--dim);font-size:13px}',
      '#p-lecture .st-seg button.on{background:var(--accent);color:#0d0d0f;font-weight:600}',
      '#p-lecture .st-nav{display:flex;flex-wrap:wrap;gap:16px;margin-left:auto}',
      '#p-lecture .st-nav button{background:none;border:0;padding:0;color:var(--accent);font-size:14px}',
      '#p-lecture .st-nav button:hover{color:#e3c88f}',
      '#p-lecture .st-sec{margin-bottom:38px;scroll-margin-top:140px;display:flex;flex-direction:column;gap:14px}',
      '#p-lecture .st-sec>h2{font-family:"Playfair Display",serif;font-size:28px;font-weight:700;line-height:1.15}',
      '#p-lecture .st-sec>h2 small{font-family:"DM Sans",sans-serif;font-size:15px;font-weight:400;color:var(--dim)}',
      '#p-lecture .st-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}',
      '#p-lecture .st-c{padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:16px;display:flex;flex-direction:column;gap:7px}',
      '#p-lecture .st-c b.v{font-family:"Playfair Display",serif;font-size:38px;line-height:1;white-space:nowrap}',
      '#p-lecture .st-c .l{font-size:15px;font-weight:600}',
      '#p-lecture .st-c .d{font-size:13px;color:var(--dim)}',
      '#p-lecture .st-c .e{font-size:13px}',
      '#p-lecture .e.haut{color:var(--green)}#p-lecture .e.bas{color:var(--danger)}#p-lecture .e.neutre{color:var(--dim)}',
      '#p-lecture .st-phrase{font-size:14px;color:#c9c7c0}',
      '#p-lecture .st-phrase b{color:var(--text);font-weight:600}',
      '#p-lecture .st-b{padding:20px 22px;background:var(--surface);border:1px solid var(--border);border-radius:16px;display:flex;flex-direction:column;gap:12px;min-width:0}',
      '#p-lecture .st-b h3{font-size:17px;font-weight:600}',
      '#p-lecture .st-duo{display:flex;flex-wrap:wrap;gap:16px}',
      '#p-lecture .st-duo>*{flex:1 1 360px}',
      '#p-lecture .st-duo>.large{flex:2 1 480px}',
      '#p-lecture .st-vide{font-size:14px;color:var(--faint);padding:6px 0}',
      '#p-lecture .st-attente{padding:18px 20px;border-radius:16px;border:1px dashed #3a3a45;color:var(--dim);font-size:14px;line-height:1.6}',
      '#p-lecture .st-attente b{color:var(--text);font-weight:600}',
      '#p-lecture .st-attente code{font-family:"DM Mono",monospace;font-size:13px;color:#e3c88f}',
      '#p-lecture .st-t td,#p-lecture .st-t th{padding:12px 11px}',
      '#p-lecture .st-t th:first-child,#p-lecture .st-t td:first-child{padding-left:22px}',
      '#p-lecture .st-t th:last-child,#p-lecture .st-t td:last-child{padding-right:22px}',
      '#p-lecture .st-t .rg{font-family:"Playfair Display",serif;font-size:18px;color:#6a6860;width:30px}',
      '#p-lecture .st-t a{color:var(--text);font-weight:500}',
      '#p-lecture .st-t a:hover{color:var(--accent)}',
      '#p-lecture .st-t .sous{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:3px;font-size:12px;color:var(--dim)}',
      '#p-lecture .st-type{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;white-space:nowrap}',
      '#p-lecture .st-j{display:flex;align-items:center;gap:10px;min-width:150px}',
      '#p-lecture .st-j span{flex:1;height:8px;background:var(--surface2);border-radius:4px;overflow:hidden}',
      '#p-lecture .st-j span i{display:block;height:100%;border-radius:4px;background:var(--accent)}',
      '#p-lecture .st-j.vert span{height:6px}#p-lecture .st-j.vert span i{background:var(--green)}',
      '#p-lecture .st-j b{font-weight:600;min-width:34px;text-align:right}',
      '#p-lecture .st-j small{font-size:13px;color:#c9c7c0;min-width:38px;text-align:right}',
      '#p-lecture .st-pied{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 22px;border-top:1px solid var(--surface2);font-size:13px;color:var(--dim)}',
      '#p-lecture .st-mat{display:grid;grid-template-columns:150px minmax(0,1fr);gap:2px 14px;align-items:center}',
      '#p-lecture .st-mat .b{height:10px;background:var(--surface2);border-radius:5px;overflow:hidden}',
      '#p-lecture .st-mat .b i{display:block;height:100%;border-radius:5px;background:var(--accent)}',
      '#p-lecture .st-mat small{grid-column:2;font-size:12px;color:var(--dim)}',
      '#p-lecture .st-ligne{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid var(--surface2);font-size:14px}',
      '#p-lecture .st-ligne small{display:block;font-size:12px;color:var(--faint)}',
      '#p-lecture .st-ligne .n{color:var(--dim);white-space:nowrap}',
      '#p-lecture .st-ligne a{color:var(--text)}#p-lecture .st-ligne a:hover{color:var(--accent)}',
      '#p-lecture .st-tr{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;align-items:end;height:170px}',
      '#p-lecture .st-tr div{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;height:100%}',
      '#p-lecture .st-tr b{font-size:14px;font-weight:600}',
      '#p-lecture .st-tr i{display:block;width:100%;border-radius:8px 8px 0 0;background:var(--accent);min-height:3px}',
      '#p-lecture .st-tr div:first-child i{background:#3a3a45}',
      '#p-lecture .st-tr-l{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;text-align:center;font-size:12px;color:var(--dim)}',
      '#p-lecture .st-cmp{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:0 18px;font-size:14px;align-items:baseline}',
      '#p-lecture .st-cmp>*{padding:9px 0;border-top:1px solid var(--surface2)}',
      '#p-lecture .st-cmp .h{border-top:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);font-weight:500;text-align:right}',
      '#p-lecture .st-cmp .h.or{color:var(--accent)}',
      '#p-lecture .st-cmp b{font-weight:600;text-align:right}',
      '#p-lecture .st-cmp b.or{color:#e3c88f}',
      '#p-lecture .st-ens{display:grid;grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--surface2);font-size:14px}',
      '#p-lecture .st-ens i{font-style:normal;color:var(--accent);text-align:center}',
      '#p-lecture .st-ens small{font-size:13px;color:var(--dim);white-space:nowrap}',
      '#p-lecture .st-pile{display:flex;height:14px;border-radius:999px;overflow:hidden;background:var(--surface2)}',
      '#p-lecture .st-leg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 16px;font-size:13px;color:#c9c7c0}',
      '#p-lecture .st-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}',
      '#p-lecture .st-grille{min-width:640px;display:flex;flex-direction:column;gap:3px}',
      '#p-lecture .st-grille .r{display:grid;grid-template-columns:44px repeat(24,minmax(0,1fr));gap:3px;align-items:center}',
      '#p-lecture .st-grille .r span{font-size:12px;color:var(--dim)}',
      '#p-lecture .st-grille .r i{display:block;height:20px;border-radius:3px;background:var(--accent)}',
      '#p-lecture .st-grille .ax{display:grid;grid-template-columns:44px repeat(4,minmax(0,1fr));font-family:"DM Mono",monospace;font-size:11px;color:var(--faint);margin-top:4px}',
      '#p-lecture .st-src{display:grid;grid-template-columns:120px minmax(0,1fr) 44px;gap:10px;align-items:center;font-size:14px}',
      '#p-lecture .st-src span.b{height:8px;background:var(--surface2);border-radius:4px;overflow:hidden}',
      '#p-lecture .st-src span.b i{display:block;height:100%;border-radius:4px;background:var(--accent)}',
      '#p-lecture .st-src b{font-weight:600;text-align:right}',
      '#p-lecture .st-split{display:flex;height:12px;border-radius:999px;overflow:hidden;background:var(--surface2)}',
      '#p-lecture .st-ent{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}',
      '#p-lecture .st-ent>div{display:flex;flex-direction:column;gap:6px}',
      '#p-lecture .st-ent .bar{height:80px;display:flex;align-items:flex-end;background:var(--bg);border-radius:10px;overflow:hidden}',
      '#p-lecture .st-ent .bar i{display:block;width:100%;border-radius:8px 8px 0 0;background:var(--accent);min-height:4px}',
      '#p-lecture .st-ent b{font-family:"Playfair Display",serif;font-size:28px;line-height:1}',
      '#p-lecture .st-ent span{font-size:14px}',
      '#p-lecture .st-ent small{font-size:13px;color:var(--accent)}',
      '#p-lecture .st-prem{border-color:rgba(200,169,110,.35)}',
      '#p-lecture .st-trio{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}',
      '#p-lecture .st-ligne .mini{min-height:28px;padding:0 10px;font-size:12px;margin-left:8px}',
      '#p-lecture .st-mono{font-family:"DM Mono",monospace;font-size:13px;color:var(--danger);word-break:break-all}',
      '@media(max-width:1100px){#p-lecture .st-trio{grid-template-columns:1fr 1fr}#p-lecture .st-ent{grid-template-columns:1fr 1fr}}',
      '@media(max-width:700px){#p-lecture .st-trio{grid-template-columns:1fr}#p-lecture .st-nav{margin-left:0}' +
        '#p-lecture .st-t th:nth-child(4),#p-lecture .st-t td:nth-child(4),#p-lecture .st-t th:nth-child(5),#p-lecture .st-t td:nth-child(5){display:none}' +
        '#p-lecture .st-mat{grid-template-columns:110px minmax(0,1fr)}#p-lecture .st-tr-l{font-size:11px}#p-lecture .st-c b.v{font-size:32px}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ─── État et construction ─── */
  var etat = { jours: 30, public: 'tous', d: null, mode: '', type: '', q: '', tout: false, charge: false };

  function batir() {
    var hote = document.getElementById('p-lecture');
    if (!hote || hote.dataset.pret) return;
    hote.dataset.pret = '1';
    poserStyles();
    function seg(id, label, cle, liste) {
      return '<div class="st-seg" id="' + id + '" role="group" aria-label="' + label + '">' + liste.map(function (x) {
        var on = String(etat[cle]) === String(x[0]);
        return '<button type="button" data-v="' + x[0] + '"' + (on ? ' class="on"' : '') + ' aria-pressed="' + on + '">' + x[1] + '</button>';
      }).join('') + '</div>';
    }
    hote.innerHTML =
      '<p class="aide" style="margin:-8px 0 16px">Ce que les élèves lisent vraiment : une personne compte une fois par contenu, les index et les listes ne comptent pas.</p>' +
      '<div class="st-barre">' +
        seg('st-periodes', 'Période', 'jours', [[7, '7 jours'], [30, '30 jours'], [90, '3 mois'], [365, '1 an']]) +
        seg('st-public', 'Public', 'public', [['tous', 'Tout le monde'], ['sans_compte', 'Sans compte'], ['membres', 'Membres']]) +
        '<nav class="st-nav" aria-label="Parties des statistiques">' +
          [['st-bref', 'En bref'], ['st-contenus', 'Contenus'], ['st-membres', 'Membres'], ['st-habitudes', 'Habitudes'], ['st-premium', 'Premium'], ['st-recherche', 'Recherche']]
            .map(function (x) { return '<button type="button" data-sec="' + x[0] + '">' + x[1] + '</button>'; }).join('') +
        '</nav>' +
      '</div>' +
      '<div id="st-alerte"></div>' +

      '<section class="st-sec" id="st-bref" aria-labelledby="st-t-bref"><h2 id="st-t-bref">En bref <small id="st-periode"></small></h2>' +
        '<div class="st-k" id="st-k-bref"></div><p class="st-phrase" id="st-phrase"></p></section>' +

      '<section class="st-sec" id="st-contenus" aria-labelledby="st-t-cont"><h2 id="st-t-cont">Les contenus les plus lus</h2>' +
        '<p class="aide">Classés par lecteurs : quelqu’un qui revient trois fois sur un chapitre compte une fois.</p>' +
        '<div class="toolbar" style="margin:0"><div class="puces" id="st-types" role="group" aria-label="Type de contenu" style="margin:0"></div><span style="flex:1"></span>' +
          '<input type="text" id="st-q" placeholder="Chercher un contenu…" aria-label="Chercher un contenu" style="min-width:220px"></div>' +
        '<div class="card"><div class="scroll"><table class="st-t"><thead><tr>' +
          '<th>N°</th><th>Contenu</th><th>Lecteurs</th><th class="droite">Dont membres</th><th class="droite">Temps moyen</th><th>Lu jusqu’au bout</th>' +
          '</tr></thead><tbody id="st-tb"></tbody></table></div><div class="st-pied" id="st-pied"></div></div>' +
        '<div class="st-duo"><div class="st-b large"><h3>Par matière</h3><p class="aide">En lectures (une personne × un contenu) et en temps moyen par lecture.</p><div id="st-mat" style="display:flex;flex-direction:column;gap:12px"></div></div>' +
          '<div class="st-b"><h3>Presque personne ne les ouvre</h3><p class="aide" id="st-oub-aide"></p><div id="st-oub"></div></div></div>' +
      '</section>' +

      '<section class="st-sec" id="st-membres" aria-labelledby="st-t-memb"><h2 id="st-t-memb">Les membres, compte par compte</h2>' +
        '<p class="aide">Chaque compte est suivi sous un identifiant chiffré, tous ses appareils réunis : on voit des profils de lecture, jamais qui a lu quoi.</p>' +
        '<div id="st-memb"></div></section>' +

      '<section class="st-sec" id="st-habitudes" aria-labelledby="st-t-hab"><h2 id="st-t-hab">Quand et comment ils lisent</h2>' +
        '<div class="st-b"><div class="boite-t"><h3>Jour et heure de lecture</h3><span class="aide" id="st-pic"></span></div><div class="scroll" id="st-grille"></div></div>' +
        '<div class="st-duo"><div class="st-b"><h3>Sur quoi</h3><div id="st-app" style="display:flex;flex-direction:column;gap:12px"></div></div>' +
          '<div class="st-b"><h3>D’où ils arrivent</h3><div id="st-src" style="display:flex;flex-direction:column;gap:12px"></div><p class="aide">En lecteurs, d’après la première page de chaque visite.</p></div></div>' +
      '</section>' +

      '<section class="st-sec" id="st-premium" aria-labelledby="st-t-prem"><h2 id="st-t-prem">Envie de Premium</h2>' +
        '<div class="st-b st-prem"><p class="aide">Du contenu réservé à l’abonnement : à chaque marche, combien de lecteurs restent.</p><div class="st-ent" id="st-ent"></div>' +
          '<h3 style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);font-weight:500;margin-top:6px">Contenus réservés qui arrêtent le plus de monde</h3><div id="st-murs"></div></div>' +
      '</section>' +

      '<section class="st-sec" id="st-recherche" aria-labelledby="st-t-rech"><h2 id="st-t-rech">Ce qu’ils cherchent</h2>' +
        '<div class="st-trio">' +
          '<div class="st-b"><h3>Les plus cherchés</h3><div id="st-rech"></div></div>' +
          '<div class="st-b"><h3>Sans résultat</h3><p class="aide">Ce que le site n’a pas : des idées de contenus à créer.</p><div id="st-vides"></div></div>' +
          '<div class="st-b"><h3>Liens cassés</h3><p class="aide">Adresses demandées qui n’existent pas.</p><div id="st-404"></div></div>' +
        '</div></section>';

    hote.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var g = b.closest('#st-periodes, #st-public');
      if (g) {
        var cle = g.id === 'st-periodes' ? 'jours' : 'public';
        etat[cle] = cle === 'jours' ? +b.dataset.v : b.dataset.v;
        g.querySelectorAll('button').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        etat.tout = false;
        return charger();
      }
      if (b.dataset.sec) { var c = document.getElementById(b.dataset.sec); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (b.dataset.type !== undefined) { etat.type = b.dataset.type; etat.tout = false; return rendreContenus(); }
      if (b.id === 'st-tout') { etat.tout = true; return rendreContenus(); }
      if (b.dataset.idee) { if (ajouterIdee(b.dataset.idee, +b.dataset.n)) { b.textContent = 'Ajoutée'; b.disabled = true; } }
    });
    $('#st-q').addEventListener('input', function () { etat.q = this.value; etat.tout = false; rendreContenus(); });
  }

  /* ─── Chargement : stats_contenus, ou à défaut stats_lecture ─── */
  function charger() {
    etat.charge = true;
    return chargerIndex().then(function () {
      return Ad.statsContenus ? Ad.statsContenus(etat.jours, etat.public) : Promise.reject(new Error('absent'));
    }).then(function (d) {
      etat.mode = 'comptes'; etat.d = d || {}; rendre();
    }).catch(function (err) {
      if (/non_autorise|réservée aux administrateurs/i.test(String((err && err.message) || err))) throw err;
      return Ad.statsLecture(etat.jours, etat.public).then(function (d) {
        etat.mode = 'navigateurs'; etat.d = depuisAncien(d || {}); rendre();
      });
    }).catch(function (err) {
      var a = $('#st-alerte');
      if (a) a.innerHTML = '<div class="alerte-r"><div><b>Statistiques indisponibles.</b> ' + esc(String((err && err.message) || err)) + '</div></div>';
    });
  }

  /* Données de stats_lecture remises dans la forme de stats_contenus (lecteurs par navigateur). */
  function depuisAncien(o) {
    var pages = (o.pages || []).filter(function (p) { return estContenu(p.page); });
    var lectures = 0, sec = 0, vues = 0, bout = 0;
    pages.forEach(function (p) { lectures += p.visiteurs || 0; sec += (p.duree_moy || 0) * (p.vues || 0); vues += p.vues || 0; bout += (p.bout || 0) * (p.vues || 0); });
    var pr = o.premium || {};
    return {
      jours: o.jours, public: o.public,
      bref: { lecteurs: o.visiteurs || 0, lectures: lectures, secondes: sec, bout: vues ? Math.round(bout / vues) : 0, sur_tout_le_site: true },
      avant: null,
      contenus: pages.map(function (p) { return { page: p.page, titre: p.titre, lecteurs: p.visiteurs || 0, membres: null, secondes_moy: p.duree_moy || 0, bout: p.bout || 0 }; })
        .sort(function (a, b) { return b.lecteurs - a.lecteurs; }),
      membres: null, ensemble: null, actifs_pages: null, grille: null,
      appareils: { mobile: o.mobile || 0, ordinateur: (o.total || 0) - (o.mobile || 0), appli: o.appli || 0, en_pages: true },
      sources: (o.sources || []).map(function (s) { return { source: s.source, lecteurs: s.visiteurs || s.visites || 0 }; }),
      premium: { murs: pr.murs || 0, murs_lecteurs: pr.murs_visiteurs || 0, murs_sans_compte: null, tarifs_lecteurs: pr.tarifs_visiteurs || 0,
                 clics_lecteurs: pr.clics_visiteurs || 0, clics_detail: pr.clics_detail || [], inscriptions: pr.inscriptions || 0, nouveaux_premium: null,
                 pages: (pr.pages || []).map(function (x) { return { page: x.page, titre: x.titre, lecteurs: x.visiteurs || x.n }; }) },
      recherches: (o.recherches || []).map(function (x) { return { q: x.q, lecteurs: x.n, resultats: x.resultats, fois: true }; }),
      recherches_vides: (o.recherches_vides || []).map(function (x) { return { q: x.q, lecteurs: x.n, fois: true }; }),
      introuvables: (o.introuvables || []).map(function (x) { return { page: x.page, lecteurs: x.vues, fois: true }; })
    };
  }

  function rendre() {
    var d = etat.d || {};
    $('#st-alerte').innerHTML = etat.mode === 'navigateurs'
      ? '<div class="st-attente" style="margin-bottom:22px"><b>Comptage par compte pas encore activé.</b> Les lecteurs sont comptés par navigateur, et les parties « Les membres » et « Jour et heure » attendent le script <code>supabase/statistiques-comptes.sql</code> dans Supabase.</div>' : '';
    $('#st-periode').textContent = '· ' + (etat.jours === 365 ? '12 derniers mois' : etat.jours === 90 ? '3 derniers mois' : etat.jours + ' derniers jours');
    rendreBref(d);
    rendreTypes();
    rendreContenus();
    rendreMatieres(d);
    rendreOublies(d);
    rendreMembres(d);
    rendreGrille(d);
    rendreAppareils(d);
    rendreSources(d);
    rendrePremium(d);
    rendreRecherche(d);
  }

  function evol(cle, ecart) {
    var d = etat.d || {}, a = d.avant;
    if (!a || !a[cle]) return null;
    if (ecart) {
      var pts = (d.bref[cle] || 0) - a[cle];
      return { c: pts > 0 ? 'haut' : pts < 0 ? 'bas' : 'neutre', t: (pts > 0 ? '↑ ' : pts < 0 ? '↓ ' : '') + Math.abs(pts) + ' point' + (Math.abs(pts) > 1 ? 's' : '') + ' par rapport à la période d’avant' };
    }
    var v = Math.round(100 * ((d.bref[cle] || 0) - a[cle]) / a[cle]);
    return { c: v > 0 ? 'haut' : v < 0 ? 'bas' : 'neutre', t: (v > 0 ? '↑ ' : v < 0 ? '↓ ' : '') + Math.abs(v) + NB + '% par rapport à la période d’avant' };
  }
  function carte(v, l, desc, e, couleur) {
    return '<div class="st-c"><b class="v"' + (couleur ? ' style="color:' + couleur + '"' : '') + '>' + v + '</b><span class="l">' + l + '</span><span class="d">' + desc + '</span>' +
      (e ? '<span class="e ' + e.c + '">' + esc(e.t) + '</span>' : '') + '</div>';
  }

  function rendreBref(d) {
    var b = d.bref || {};
    $('#st-k-bref').innerHTML =
      carte(nb(b.lecteurs), 'lecteurs', b.sur_tout_le_site ? 'navigateurs différents, sur tout le site' : 'personnes différentes ; un membre sur plusieurs appareils compte une fois', evol('lecteurs')) +
      carte(nb(b.lectures), 'lectures', 'un contenu ouvert par une personne, compté une fois même s’il est relu', evol('lectures')) +
      carte(heures(b.secondes), 'de lecture', 'temps passé page ouverte et élève actif, sur les contenus seulement', evol('secondes')) +
      carte(nb(b.bout) + NB + '%', 'lus jusqu’au bout', 'part des lectures qui atteignent le bas de la page', evol('bout', true));
    var phr = [];
    if (b.lecteurs && b.lectures && !b.sur_tout_le_site) phr.push('En moyenne, <b>' + virgule(b.lectures / b.lecteurs) + ' contenus lus par lecteur</b>.');
    if (b.lectures) phr.push('<b>' + duree(b.secondes / b.lectures) + '</b> par lecture en moyenne.');
    if (b.lecteurs_membres != null && b.lecteurs && etat.public === 'tous')
      phr.push('<b>' + pc(b.lecteurs_membres, b.lecteurs) + NB + '%</b> des lecteurs ont un compte, et ils font <b>' + pc(b.lectures_membres, b.lectures) + NB + '%</b> des lectures.');
    if (!b.lectures) phr.push('Pas encore de lecture sur cette période.');
    $('#st-phrase').innerHTML = phr.join(' ');
  }

  function contenusFiltres() {
    var q = String(etat.q || '').trim().toLowerCase();
    return ((etat.d || {}).contenus || []).filter(function (c) {
      var i = infos(c.page);
      if (etat.type && i.type !== etat.type) return false;
      if (q && (titrePropre(c.titre, c.page) + ' ' + i.detail + ' ' + c.page).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }
  function rendreTypes() {
    var l = (etat.d || {}).contenus || [], n = {};
    l.forEach(function (c) { var t = infos(c.page).type; n[t] = (n[t] || 0) + 1; });
    if (etat.type && !n[etat.type]) etat.type = '';
    $('#st-types').innerHTML = [['', 'Tous', l.length]].concat(TYPES.filter(function (t) { return n[t[0]]; }).map(function (t) { return [t[0], t[1], n[t[0]]]; }))
      .map(function (x) { var on = etat.type === x[0]; return '<button type="button" class="puce' + (on ? ' on' : '') + '" data-type="' + esc(x[0]) + '" aria-pressed="' + on + '">' + esc(x[1]) + '<span>' + x[2] + '</span></button>'; }).join('');
  }
  function rendreContenus() {
    var l = contenusFiltres(), vus = etat.tout ? l : l.slice(0, PAR_PAGE);
    var max = l.length ? Math.max.apply(null, l.map(function (c) { return c.lecteurs; })) : 1;
    $('#st-types').querySelectorAll('[data-type]').forEach(function (b) { var on = b.dataset.type === etat.type; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $('#st-tb').innerHTML = vus.length ? vus.map(function (c, k) {
      var i = infos(c.page), col = COUL_TYPE[i.type] || ['rgba(138,136,128,.14)', '#a9a79f'];
      return '<tr><td class="rg">' + (k + 1) + '</td>' +
        '<td><a href="' + esc(lien(c.page)) + '" target="_blank" rel="noopener">' + esc(titrePropre(c.titre, c.page)) + '</a>' +
          '<div class="sous"><span class="st-type" style="background:' + col[0] + ';color:' + col[1] + '">' + esc(i.type) + '</span>' + esc(i.detail) + '</div></td>' +
        '<td><div class="st-j"><span><i style="width:' + Math.max(2, Math.round(100 * c.lecteurs / (max || 1))) + '%"></i></span><b>' + nb(c.lecteurs) + '</b></div></td>' +
        '<td class="droite" style="color:#c9c7c0">' + (c.membres == null ? '—' : nb(c.membres)) + '</td>' +
        '<td class="droite" style="color:#c9c7c0;white-space:nowrap">' + duree(c.secondes_moy) + '</td>' +
        '<td><div class="st-j vert"><span><i style="width:' + (c.bout || 0) + '%"></i></span><small>' + (c.bout || 0) + NB + '%</small></div></td></tr>';
    }).join('') : '<tr><td colspan="6" class="st-vide" style="padding:22px">' + (((etat.d || {}).contenus || []).length ? 'Aucun contenu ne correspond.' : 'Aucune lecture sur cette période.') + '</td></tr>';
    $('#st-pied').innerHTML = '<span>' + (l.length ? vus.length + ' sur ' + l.length + ' contenus lus · ' : '') + 'index, listes et accueil écartés</span>' +
      (l.length > vus.length ? '<button type="button" class="mini" id="st-tout">Afficher les ' + l.length + '</button>' : '');
  }

  function rendreMatieres(d) {
    var par = {};
    (d.contenus || []).forEach(function (c) {
      var m = infos(c.page).matiere;
      var x = par[m] = par[m] || { l: 0, s: 0, n: 0 };
      x.l += c.lecteurs; x.s += (c.secondes_moy || 0) * c.lecteurs; x.n += c.secondes_moy ? c.lecteurs : 0;
    });
    var l = Object.keys(par).map(function (k) { return { m: k, l: par[k].l, moy: par[k].n ? par[k].s / par[k].n : 0 }; }).sort(function (a, b) { return b.l - a.l; });
    var max = l.length ? l[0].l : 1;
    $('#st-mat').innerHTML = l.length ? l.map(function (x) {
      return '<div class="st-mat"><span style="font-size:14px">' + esc(x.m) + '</span><span class="b"><i style="width:' + Math.max(2, Math.round(100 * x.l / max)) + '%"></i></span>' +
        '<small>' + nb(x.l) + ' lecture' + (x.l > 1 ? 's' : '') + ' · ' + duree(x.moy) + ' par lecture</small></div>';
    }).join('') : '<div class="st-vide">Rien pour l’instant.</div>';
  }

  function rendreOublies(d) {
    var lus = {};
    (d.contenus || []).forEach(function (c) { lus[String(c.page).toLowerCase()] = c.lecteurs; });
    var l = PAGES_SITE.map(function (p) { return { page: p.page, titre: p.titre, n: lus[p.page] || 0 }; })
      .filter(function (p) { var t = infos(p.page).type; return p.n <= 2 && t !== 'Texte du jour' && t !== 'Article'; })
      .sort(function (a, b) { return a.n - b.n || String(a.titre).localeCompare(String(b.titre), 'fr'); });
    $('#st-oub-aide').textContent = !PAGES_SITE.length ? 'Liste des contenus du site indisponible.'
      : l.length ? l.length + ' cours, dossiers ou fiches en ligne ont eu 2 lecteurs au plus sur la période : à mettre en avant, ou à revoir.'
      : 'Tous les contenus ont eu plus de 2 lecteurs sur la période.';
    $('#st-oub').innerHTML = l.slice(0, 8).map(function (p) {
      return '<div class="st-ligne"><span><a href="' + esc(lien(p.page)) + '" target="_blank" rel="noopener">' + esc(p.titre) + '</a><small>' + esc(infos(p.page).detail) + '</small></span>' +
        '<span class="n">' + p.n + ' lecteur' + (p.n > 1 ? 's' : '') + '</span></div>';
    }).join('');
  }

  function rendreMembres(d) {
    var z = $('#st-memb'), m = d.membres;
    if (etat.mode !== 'comptes' || !m) {
      z.innerHTML = '<div class="st-attente">Cette partie s’affichera dès que le script <code>supabase/statistiques-comptes.sql</code> aura été lancé dans Supabase : membres actifs, contenus lus par membre, élèves qui décrochent, gratuit ou Premium, contenus lus ensemble.</div>';
      return;
    }
    if (etat.public === 'sans_compte') { z.innerHTML = '<div class="st-attente">Choisis « Tout le monde » ou « Membres » pour voir cette partie.</div>'; return; }
    var depuis = d.depuis_comptes ? new Date(d.depuis_comptes) : null;
    var note = !depuis ? '<div class="st-attente" style="margin-bottom:14px">Le comptage par compte vient d’être activé : les chiffres arrivent avec les prochaines lectures des membres.</div>'
      : (depuis > new Date(d.debut) ? '<p class="aide" style="margin-bottom:12px">Comptage par compte depuis le ' + depuis.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ' : avant, les membres étaient comptés par appareil.</p>' : '');
    var act = m.actifs || 0;
    var cartes = '<div class="st-k">' +
      carte(nb(act), 'membres actifs', 'au moins une lecture sur la période, sur ' + nb(m.inscrits) + ' inscrits') +
      carte(virgule(m.mediane_contenus), 'contenus lus', 'par membre actif (la moitié en lit plus, la moitié moins)') +
      carte(duree(m.mediane_secondes), 'de lecture', 'par membre actif, même calcul') +
      carte(pc(m.reviennent, act) + NB + '%', 'reviennent souvent', 'des membres actifs ont lu sur au moins 3 jours différents', null, 'var(--green)') +
      carte(nb(m.decrochent), 'décrochent', 'lisaient il y a 2 à 6 semaines, plus rien depuis 14 jours', null, m.decrochent ? 'var(--danger)' : '') +
      '</div>';
    var t = m.tranches || {};
    var tr = [['0', t.zero], ['1 à 2', t.un_deux], ['3 à 9', t.trois_neuf], ['10 à 29', t.dix_29], ['30 et +', t.trente]];
    var tmax = Math.max.apply(null, tr.map(function (x) { return x[1] || 0; }).concat([1]));
    var g = m.gratuit || {}, p = m.premium || {};
    var ig = (m.inscrits || 0) - (m.inscrits_premium || 0);
    function cmp(l, a, b) { return '<span style="color:#c9c7c0">' + l + '</span><b>' + a + '</b><b class="or">' + b + '</b>'; }
    var ens = d.ensemble || [];
    var parMat = {}, totA = 0;
    (d.actifs_pages || []).forEach(function (x) { var k = infos(x.page).matiere; parMat[k] = (parMat[k] || 0) + x.n; totA += x.n; });
    var mats = Object.keys(parMat).map(function (k) { return [k, parMat[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    if (mats.length > 6) { var reste = mats.slice(5).reduce(function (s, x) { return s + x[1]; }, 0); mats = mats.slice(0, 5).concat([['Autres', reste]]); }
    z.innerHTML = note + cartes +
      '<div class="st-duo" style="margin-top:16px">' +
        '<div class="st-b"><h3>Combien de contenus lit un membre</h3>' +
          '<div class="st-tr" role="img" aria-label="' + tr.map(function (x) { return (x[1] || 0) + ' membres : ' + x[0] + ' contenus'; }).join(', ') + '">' +
            tr.map(function (x) { return '<div><b>' + nb(x[1]) + '</b><i style="height:' + Math.round(130 * (x[1] || 0) / tmax) + 'px"></i></div>'; }).join('') + '</div>' +
          '<div class="st-tr-l">' + tr.map(function (x) { return '<span>' + x[0] + ' contenu' + (x[0] === '0' ? '' : 's') + '</span>'; }).join('') + '</div>' +
          '<p class="aide">' + nb(t.zero) + ' inscrit' + (t.zero > 1 ? 's n’ont' : ' n’a') + ' rien lu sur la période.' + (t.trente ? ' ' + nb(t.trente) + ' membre' + (t.trente > 1 ? 's lisent' : ' lit') + ' 30 contenus ou plus.' : '') + '</p></div>' +
        '<div class="st-b"><h3>Gratuit ou Premium</h3><div class="st-cmp">' +
          '<span class="h" style="text-align:left"></span><span class="h">Gratuit</span><span class="h or">Premium</span>' +
          cmp('Membres actifs', nb(g.actifs) + ' / ' + nb(ig), nb(p.actifs) + ' / ' + nb(m.inscrits_premium)) +
          cmp('Contenus lus par membre', virgule(g.mediane_contenus), virgule(p.mediane_contenus)) +
          cmp('Temps de lecture par membre', duree(g.mediane_secondes), duree(p.mediane_secondes)) +
          cmp('Reviennent souvent', pc(g.reviennent, g.actifs) + NB + '%', pc(p.reviennent, p.actifs) + NB + '%') +
        '</div><p class="aide">Valeurs médianes, sur les membres actifs de la période.</p></div>' +
      '</div>' +
      '<div class="st-duo" style="margin-top:16px">' +
        '<div class="st-b"><h3>Lus ensemble</h3><p class="aide">Les mêmes comptes lisent souvent ces deux contenus : des idées de liens « Pour aller plus loin ».</p>' +
          (ens.length ? ens.map(function (e) {
            return '<div class="st-ens"><span>' + esc(titrePropre(e.ta, e.a)) + '</span><i aria-hidden="true">+</i><span>' + esc(titrePropre(e.tb, e.b)) + '</span><small>' + nb(e.n) + ' membres</small></div>';
          }).join('') : '<div class="st-vide">Pas encore assez de lectures (il faut 3 membres au moins pour une paire).</div>') + '</div>' +
        '<div class="st-b"><h3>Où lisent les membres les plus actifs</h3><p class="aide">Les 25 comptes qui lisent le plus : la part de leurs lectures par matière.</p>' +
          (mats.length ? '<div class="st-pile" role="img" aria-label="' + mats.map(function (x) { return x[0] + ' ' + pc(x[1], totA) + ' %'; }).join(', ') + '">' +
            mats.map(function (x, i) { return '<span style="flex:' + x[1] + ';background:' + COUL_MAT[i % COUL_MAT.length] + '"></span>'; }).join('') + '</div>' +
            '<div class="st-leg">' + mats.map(function (x, i) { return '<span><i style="background:' + COUL_MAT[i % COUL_MAT.length] + '"></i>' + esc(x[0]) + ' · ' + pc(x[1], totA) + NB + '%</span>'; }).join('') + '</div>'
            : '<div class="st-vide">Rien pour l’instant.</div>') + '</div>' +
      '</div>';
  }

  function rendreGrille(d) {
    var z = $('#st-grille'), l = d.grille;
    if (!l) { z.innerHTML = '<div class="st-attente">La grille jour × heure s’affichera avec le comptage par compte.</div>'; $('#st-pic').textContent = ''; return; }
    var g = [], max = 1, pic = null;
    for (var j = 0; j < 7; j++) { g.push([]); for (var h = 0; h < 24; h++) g[j].push(0); }
    l.forEach(function (x) { g[x.jour - 1][x.heure] = x.n; if (x.n > max) max = x.n; if (!pic || x.n > pic.n) pic = x; });
    z.innerHTML = '<div class="st-grille" role="img" aria-label="Lectures par jour de la semaine et par heure">' + g.map(function (r, j) {
      return '<div class="r"><span>' + JOURS_COURTS[j] + '</span>' + r.map(function (n, h) {
        return '<i style="opacity:' + (n ? Math.max(.12, n / max).toFixed(2) : '.05') + '" title="' + JOURS_LONGS[j] + ' ' + h + NB + 'h : ' + n + ' lecture' + (n > 1 ? 's' : '') + '"></i>';
      }).join('') + '</div>';
    }).join('') + '<div class="ax"><span></span><span>0' + NB + 'h</span><span>6' + NB + 'h</span><span>12' + NB + 'h</span><span>18' + NB + 'h</span></div></div>';
    $('#st-pic').textContent = pic ? 'Plus la case est claire, plus il y a de lectures · pic le ' + JOURS_LONGS[pic.jour - 1] + ' vers ' + pic.heure + NB + 'h' : '';
  }

  function rendreAppareils(d) {
    var a = d.appareils || {}, tot = (a.mobile || 0) + (a.ordinateur || 0);
    $('#st-app').innerHTML = !tot ? '<div class="st-vide">Rien pour l’instant.</div>' :
      '<div class="st-split" role="img" aria-label="Téléphone ' + pc(a.mobile, tot) + ' %, ordinateur ' + pc(a.ordinateur, tot) + ' %">' +
        '<span style="flex:' + a.mobile + ';background:var(--accent)"></span><span style="flex:' + a.ordinateur + ';background:var(--blue)"></span></div>' +
      '<div class="legende2" style="flex-wrap:wrap"><span><i style="background:var(--accent)"></i>Téléphone · ' + pc(a.mobile, tot) + NB + '%</span>' +
        '<span><i style="background:var(--blue)"></i>Ordinateur ou tablette · ' + pc(a.ordinateur, tot) + NB + '%</span></div>' +
      '<p class="aide">' + (a.en_pages ? 'En pages vues. ' : 'En lectures. ') +
        '<b style="color:var(--text)">' + nb(a.appli) + ' lecteur' + (a.appli > 1 ? 's ont' : ' a') + '</b> installé le site sur l’écran d’accueil.' +
        (a.bout_mobile != null && a.mobile && a.ordinateur ? ' Lu jusqu’au bout : <b style="color:var(--text)">' + a.bout_mobile + NB + '%</b> sur téléphone, ' + a.bout_ordinateur + NB + '% sur ordinateur.' : '') + '</p>';
  }

  function rendreSources(d) {
    var l = (d.sources || []).slice(0, 8), max = l.length ? Math.max.apply(null, l.map(function (s) { return s.lecteurs; })) : 1;
    $('#st-src').innerHTML = l.length ? l.map(function (s) {
      return '<div class="st-src"><span>' + esc(s.source) + '</span><span class="b"><i style="width:' + Math.max(2, Math.round(100 * s.lecteurs / (max || 1))) + '%"></i></span><b>' + nb(s.lecteurs) + '</b></div>';
    }).join('') : '<div class="st-vide">Rien pour l’instant.</div>';
  }

  function rendrePremium(d) {
    var p = d.premium || {};
    var et = [
      [p.murs_lecteurs, 'arrêtés par un contenu réservé', nb(p.murs) + ' fois' + (p.murs_sans_compte != null ? ', dont ' + nb(p.murs_sans_compte) + ' lecteur' + (p.murs_sans_compte > 1 ? 's' : '') + ' sans compte' : '')],
      [p.tarifs_lecteurs, 'ont ouvert la page Tarifs', null],
      [p.clics_lecteurs, 'ont cliqué sur « payer »', null],
      [p.nouveaux_premium, 'sont devenus Premium', 'abonnements payants commencés sur la période']
    ].filter(function (x) { return x[0] != null; });
    var max = Math.max.apply(null, et.map(function (x) { return x[0] || 0; }).concat([1]));
    $('#st-ent').innerHTML = et.map(function (x, i) {
      var sous = x[2] || (i && et[i - 1][0] ? pc(x[0], et[i - 1][0]) + NB + '% de l’étape d’avant' : ' ');
      return '<div><div class="bar"><i style="height:' + Math.max(4, Math.round(100 * (x[0] || 0) / max)) + '%;opacity:' + (1 - i * .18).toFixed(2) + '"></i></div>' +
        '<b>' + nb(x[0]) + '</b><span>' + esc(x[1]) + '</span><small>' + esc(sous) + '</small></div>';
    }).join('');
    var l = p.pages || [];
    $('#st-murs').innerHTML = l.length ? l.map(function (x) {
      return '<div class="st-ligne"><a href="' + esc(lien(x.page)) + '" target="_blank" rel="noopener">' + esc(titrePropre(x.titre, x.page)) + '</a><span class="n">' + nb(x.lecteurs) + ' lecteur' + (x.lecteurs > 1 ? 's' : '') + '</span></div>';
    }).join('') : '<div class="st-vide">Aucun contenu réservé n’a arrêté personne sur la période.</div>';
  }

  function rendreRecherche(d) {
    function unite(x) { return nb(x.lecteurs) + NB + (x.fois ? 'fois' : 'lecteur' + (x.lecteurs > 1 ? 's' : '')); }
    var r = d.recherches || [];
    $('#st-rech').innerHTML = r.length ? r.map(function (x) {
      return '<div class="st-ligne"><span>« ' + esc(x.q) + ' »' + (x.resultats != null ? '<small>' + nb(x.resultats) + ' résultat' + (x.resultats > 1 ? 's' : '') + '</small>' : '') + '</span><span class="n">' + unite(x) + '</span></div>';
    }).join('') : '<div class="st-vide">Aucune recherche sur la période.</div>';
    var deja = titresIdees(), v = d.recherches_vides || [];
    $('#st-vides').innerHTML = v.length ? v.map(function (x) {
      var dans = deja[titreIdee(x.q).toLowerCase()];
      return '<div class="st-ligne" style="align-items:center"><span>« ' + esc(x.q) + ' » <small style="display:inline">· ' + unite(x) + '</small></span>' +
        '<button type="button" class="mini or" data-idee="' + esc(x.q) + '" data-n="' + (x.lecteurs || 0) + '"' + (dans ? ' disabled>Dans les idées' : '>Ajouter aux idées') + '</button></div>';
    }).join('') : '<div class="st-vide">Aucune recherche sans résultat.</div>';
    var i = d.introuvables || [];
    $('#st-404').innerHTML = i.length ? i.map(function (x) {
      return '<div class="st-ligne"><span class="st-mono">' + esc(x.page) + '</span><span class="n">' + unite(x) + '</span></div>';
    }).join('') : '<div class="st-vide">Aucun lien cassé sur la période.</div>';
  }

  /* ─── Démarrage ─── */
  function demarrer(profil) {
    if (!profil || profil.role !== 'admin' || !document.getElementById('p-lecture')) return;
    var go = function () { batir(); if (!etat.charge) charger(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
    else go();
  }
  document.addEventListener('ecg:pret', function (e) { demarrer(e.detail); });
  setTimeout(function () {
    var p = A.current && A.current();
    if (p && p.role === 'admin') demarrer(p);
  }, 1500);
  /* Actualisation quand on revient sur l'onglet. */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.tab[data-p="lecture"]');
    if (t && etat.charge) charger();
  });

  window.ECGLectureAdmin = { rafraichir: charger, titre: titrePage, rubrique: rubrique, estContenu: estContenu, infos: infos, lien: lien };
})();
