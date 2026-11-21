/* ══════════════════════════════════════════════════════════════════
   ECG Prépa : onglet « Statistiques » de la page d'administration

   Refonte du 21 novembre 2026 (maquette « Qui vient, et qu'est-ce
   qu'on lit ? » validée par le propriétaire, qui ne comprenait plus
   l'ancien onglet et trouvait que « pages vues » comptait tout et
   n'importe quoi : 85 % de pages de passage, 58 % de moins de 5 s).
   Trois mots seulement, chacun expliqué sous son chiffre :
   • visiteur = une personne : un compte (tous ses appareils) ou, sans
     compte, un navigateur ; robots écartés ;
   • lecture = une personne × un contenu (chapitre, leçon, article,
     dossier, fiche, texte du jour, colle) lu au moins 10 s de lecture
     active ; relire ne compte pas deux fois ; index, listes, accueil,
     tarifs, connexion et flashcards ne comptent pas (estContenu, même
     règle que stats_est_contenu côté base) ;
   • temps de lecture = la somme du temps actif de ces lectures.
   Six parties : En bref, Jour par jour, Ce qu'ils lisent, Est-ce qu'ils
   reviennent et d'où ils arrivent, À surveiller, Comment on passe des
   pages ouvertes aux lectures. Seulement des totaux, jamais qui a lu quoi.
   Données : fonction stats_site (supabase/statistiques-site.sql).

   Chargé par admin.html, après auth.js. Expose window.ECGLectureAdmin
   { rafraichir, titre, rubrique, estContenu, infos, lien } (aussi
   utilisé par la vue d'ensemble).
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var A = window.ECGAuth;
  if (!A || !A.admin) return;
  var Ad = A.admin;

  var NB = ' ';
  var PAR_PAGE = 10;
  var JOURS_COURTS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  var JOURS_LONGS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var TYPES = [['Cours', 'Cours'], ['Article', 'Articles'], ['Humanité', 'Humanité'], ['Culture générale', 'Culture générale'],
               ['Texte du jour', 'Langues au quotidien'], ['Colle', 'Colles']];
  var PASSAGE = { accueil: 'accueil', cours: 'index des cours', connexion: 'connexion', menus: 'menus et listes', autres: 'autres pages' };

  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nb(n) { return Number(n || 0).toLocaleString('fr-FR'); }
  function pc(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function pl(n, mot, mots) { return n > 1 ? (mots || mot + 's') : mot; }
  function duree(s) {
    s = Math.round(s || 0);
    if (!s) return '0' + NB + 's';
    if (s < 60) return s + NB + 's';
    if (s >= 3600) { var mt = Math.round(s / 60), h = Math.floor(mt / 60), m = mt % 60; return h + NB + 'h' + NB + ('0' + m).slice(-2); }
    var mi = Math.floor(s / 60), r = s % 60;
    return mi + NB + 'min' + (r ? NB + ('0' + r).slice(-2) : '');
  }
  function toast(txt, kind) {
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = txt; t.className = 'show ' + (kind || '');
    clearTimeout(t._h); t._h = setTimeout(function () { t.className = ''; }, 3600);
  }
  function jourLocal(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dateLongue(d) { return JOURS_LONGS[d.getDay()] + ' ' + d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + d.toLocaleDateString('fr-FR', { month: 'long' }); }

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
    if ((m = p.match(/^actualites\/([^/]+)\/articles\//))) return { type: 'Article', matiere: 'Actualité', detail: 'Actualité ' + (EDITIONS[m[1]] || m[1]) + ' · article' };
    if (/^culture-generale\//.test(p)) return { type: 'Culture générale', matiere: 'Culture générale', detail: 'Dossier de culture générale' };
    if ((m = p.match(/^humanite\/([^/]+)\//))) {
      var d = HUM[m[1]] ? 'L’Humanité · ' + HUM[m[1]]
        : /fiches auteurs\//.test(p) ? 'L’Humanité · fiche auteur' : 'L’Humanité · cours';
      return { type: 'Humanité', matiere: 'L’Humanité', detail: d };
    }
    if ((m = p.match(/^(premiere|deuxieme)_annee\/([^/]+)\/(?:([^/]+)\/)?/))) {
      var an = m[1] === 'premiere' ? '1re année' : '2e année';
      var mat = MATIERES[m[2]] || m[2];
      if (m[2] === 'langues') mat = m[1] === 'deuxieme' ? 'Civilisation ' + ({ anglais: 'anglophone', espagnol: 'hispanophone', allemand: 'germanophone' }[m[3]] || '') : (MATIERES[m[3]] || 'Langues');
      var type = /\/quotidien\/jour-/.test(p) ? 'Texte du jour' : /\/colles\/colle/.test(p) ? 'Colle' : 'Cours';
      if (type === 'Texte du jour') return { type: type, matiere: mat, detail: mat + ' au quotidien · texte du jour' };
      return { type: type, matiere: mat.trim(), detail: mat.trim() + ' · ' + an };
    }
    return { type: 'Autre', matiere: 'Autres pages', detail: '' };
  }
  /* Ancienne forme (vue d'ensemble, compatibilité). */
  function rubrique(page) { var i = infos(page); return { grande: i.matiere, fine: i.detail || i.matiere }; }

  var INDEX = null;       /* chemin en minuscules → titre (recherche-index.json) */
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
      });
    }).catch(function () { INDEX = {}; });
  }
  /* Titre lisible : celui de l'index de recherche d'abord (déjà propre),
     sinon celui de la page sans « ECG Prépa » ni « | Anglais ECG ». */
  function titrePropre(t, page) {
    var x = (INDEX && INDEX[String(page || '').toLowerCase()]) || '';
    if (!x && t && t !== 'Page introuvable') x = String(t);
    x = x.replace(/\s+[—|·–-]\s+ECG Prépa\s*$/i, '').replace(/^ECG Prépa\s+[—|·–-]\s+/i, '').replace(/\s+\|\s+[^|]*$/, '')
      .replace(/\s+·\s+(Fiches auteurs|Civilisation (anglo|hispano|germano)phone)$/, '').replace(/^Cours Humanité\s+·\s+/, '').trim();
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
      note: 'Recherche tapée par ' + n + ' ' + pl(n, 'personne') + ' dans la loupe du site, sans aucun résultat (statistiques, ' + new Date().toLocaleDateString('fr-FR') + ').',
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
      '#p-lecture{--or:#e2c896;--or-fond:#1c1912;--or-bord:#5a4a2c}',
      '#p-lecture .st-tete{display:flex;flex-direction:column;gap:16px;margin-bottom:40px}',
      '#p-lecture .st-tete h2{font-family:"Playfair Display",serif;font-size:36px;font-weight:900;line-height:1.1}',
      '#p-lecture .st-tete p{font-size:15px;color:var(--dim)}',
      '#p-lecture .st-filtres{display:flex;flex-wrap:wrap;gap:10px 22px;align-items:center}',
      '#p-lecture .st-seg{display:flex;flex-wrap:wrap;gap:6px;padding:4px;background:var(--surface);border:1px solid var(--border);border-radius:999px}',
      '#p-lecture .st-seg button{min-height:40px;padding:0 16px;border-radius:999px;border:0;background:none;color:var(--dim);font-size:14px}',
      '#p-lecture .st-seg button:hover{color:var(--text)}',
      '#p-lecture #st-periodes button.on{background:var(--accent);color:#0d0d0f;font-weight:600}',
      '#p-lecture #st-public button.on{background:var(--border);color:#fff;font-weight:600}',
      '#p-lecture .st-sec{display:flex;flex-direction:column;gap:16px;margin-bottom:44px}',
      '#p-lecture .st-h{font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}',
      '#p-lecture .st-h-l{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:10px}',
      '#p-lecture .st-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}',
      '#p-lecture .st-c{padding:22px;background:var(--surface);border:1px solid var(--border);border-radius:16px;display:flex;flex-direction:column;gap:8px}',
      '#p-lecture .st-c .l{font-size:15px;font-weight:600}',
      '#p-lecture .st-c b.v{font-family:"Playfair Display",serif;font-size:46px;font-weight:700;line-height:1;white-space:nowrap}',
      '#p-lecture .st-c .s{font-size:14px;color:var(--dim)}',
      '#p-lecture .st-c .s.vert{color:var(--green)}#p-lecture .st-c .s.rouge{color:var(--danger)}',
      '#p-lecture .st-c .def{margin-top:6px;padding-top:10px;border-top:1px solid var(--border);font-size:13px;color:var(--dim)}',
      '#p-lecture .st-c.or{background:var(--or-fond);border-color:var(--or-bord)}',
      '#p-lecture .st-c.or .l,#p-lecture .st-c.or b.v{color:var(--or)}',
      '#p-lecture .st-c.or .def{border-color:var(--or-bord);color:#b9ae96}',
      '#p-lecture .st-note{font-size:13px;color:var(--faint)}',
      '#p-lecture .st-b{padding:24px;background:var(--surface);border:1px solid var(--border);border-radius:16px;display:flex;flex-direction:column;gap:16px;min-width:0}',
      '#p-lecture .st-b h3{font-size:16px;font-weight:600}',
      '#p-lecture .st-b p{font-size:14px;color:var(--dim)}',
      '#p-lecture .st-b p b{color:var(--text)}',
      '#p-lecture .st-duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px}',
      '#p-lecture .st-trio{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px}',
      '#p-lecture .st-leg{display:flex;flex-wrap:wrap;gap:8px 22px;font-size:14px;color:var(--dim)}',
      '#p-lecture .st-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:8px;vertical-align:-1px}',
      '#p-lecture .st-leg .fin{margin-left:auto}',
      '#p-lecture .st-jours{overflow-x:auto}',
      '#p-lecture .st-histo{display:grid;gap:10px;align-items:end;height:220px;border-bottom:1px solid var(--border);min-width:100%}',
      '#p-lecture .st-histo>div{display:flex;justify-content:center;align-items:flex-end;gap:4px;height:100%}',
      '#p-lecture .st-histo .b{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%;flex:0 1 26px;min-width:4px}',
      '#p-lecture .st-histo .b span{font-size:12px;color:var(--dim)}',
      '#p-lecture .st-histo .b.l span{color:var(--or)}',
      '#p-lecture .st-histo .b i{display:block;width:100%;border-radius:4px 4px 0 0;background:var(--blue);min-height:2px}',
      '#p-lecture .st-histo .b.l i{background:var(--accent)}',
      '#p-lecture .st-histo .encours{opacity:.55}',
      '#p-lecture .st-histo.serre span{display:none}',
      '#p-lecture .st-axe{display:grid;gap:10px;text-align:center;font-size:13px;color:var(--dim);margin-top:8px}',
      '#p-lecture .st-table{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden}',
      '#p-lecture .st-table .scroll{overflow-x:auto}',
      '#p-lecture .st-table table{width:100%;min-width:620px;border-collapse:collapse;font-size:14px}',
      '#p-lecture .st-table th{padding:16px 12px;text-align:left;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);font-weight:500;background:none;border:0}',
      '#p-lecture .st-table td{padding:14px 12px;border-top:1px solid var(--border);vertical-align:middle}',
      '#p-lecture .st-table th:first-child,#p-lecture .st-table td:first-child{padding-left:20px}',
      '#p-lecture .st-table th:last-child,#p-lecture .st-table td:last-child{padding-right:20px}',
      '#p-lecture .st-table .dr{text-align:right;white-space:nowrap}',
      '#p-lecture .st-table td a{color:var(--text);font-weight:600}',
      '#p-lecture .st-table td a:hover{color:var(--accent)}',
      '#p-lecture .st-table td small{display:block;font-size:13px;color:var(--dim)}',
      '#p-lecture .st-table td.n{font-weight:700;font-size:16px}',
      '#p-lecture .st-bout{display:flex;align-items:center;gap:10px;width:170px}',
      '#p-lecture .st-bout span{flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden}',
      '#p-lecture .st-bout span i{display:block;height:100%;background:var(--green)}',
      '#p-lecture .st-bout b{width:42px;text-align:right;font-weight:400}',
      '#p-lecture .st-pied{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;padding:14px 20px;border-top:1px solid var(--border);font-size:13px;color:var(--dim)}',
      '#p-lecture .st-pied button{background:none;border:0;padding:0;color:var(--accent);font-size:13px;font-weight:600}',
      '#p-lecture .st-puces{display:flex;flex-wrap:wrap;gap:6px}',
      '#p-lecture .st-puces button{min-height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--border);background:none;color:var(--dim);font-size:13px}',
      '#p-lecture .st-puces button.on{border-color:var(--accent);color:var(--accent);font-weight:600}',
      '#p-lecture .st-puces button span{margin-left:6px;color:var(--faint)}',
      '#p-lecture .st-barres{display:flex;flex-direction:column;gap:12px}',
      '#p-lecture .st-barre-l>div:first-child{display:flex;justify-content:space-between;gap:12px;font-size:14px}',
      '#p-lecture .st-barre-l .j{height:10px;background:var(--border);border-radius:5px;margin-top:6px;overflow:hidden}',
      '#p-lecture .st-barre-l .j i{display:block;height:100%;border-radius:5px;background:var(--blue)}',
      '#p-lecture .st-b ul{margin:0;padding-left:18px;font-size:14px;display:flex;flex-direction:column;gap:6px}',
      '#p-lecture .st-b ul a{color:var(--text)}#p-lecture .st-b ul a:hover{color:var(--accent)}',
      '#p-lecture .st-b ul small{color:var(--dim)}',
      '#p-lecture .st-mono{font-family:"DM Mono",monospace;word-break:break-all}',
      '#p-lecture .st-vide{font-size:14px;color:var(--faint)}',
      '#p-lecture .st-idee{display:flex;justify-content:space-between;align-items:center;gap:10px}',
      '#p-lecture .st-ent{display:flex;flex-direction:column;gap:14px}',
      '#p-lecture .st-ent>div>div:first-child{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;font-size:14px}',
      '#p-lecture .st-ent>div>div:first-child span+span{color:var(--faint)}',
      '#p-lecture .st-ent i{display:block;height:14px;margin-top:6px;border-radius:4px;min-width:4px}',
      '#p-lecture .st-attente{padding:18px 20px;border-radius:16px;border:1px dashed #3a3a45;color:var(--dim);font-size:14px;line-height:1.6}',
      '#p-lecture .st-attente code{font-family:"DM Mono",monospace;font-size:13px;color:var(--or)}',
      '@media(max-width:700px){#p-lecture .st-tete h2{font-size:28px}#p-lecture .st-c b.v{font-size:38px}#p-lecture .st-b{padding:18px}' +
        '#p-lecture .st-table table{min-width:0}#p-lecture .st-table th:nth-child(4),#p-lecture .st-table td:nth-child(4){display:none}' +
        '#p-lecture .st-histo{gap:4px}#p-lecture .st-axe{gap:4px;font-size:11px}#p-lecture .st-histo .b span{font-size:10px}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ─── État et construction ─── */
  var etat = { jours: 7, public: 'tous', d: null, type: '', tout: false, charge: false };

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
    function h(id, num, txt) { return '<h2 class="st-h" id="' + id + '">' + num + ' · ' + txt + '</h2>'; }
    hote.innerHTML =
      '<header class="st-tete">' +
        '<div><h2>Qui vient, et qu’est-ce qu’on lit' + NB + '?</h2><p id="st-periode" style="margin-top:8px"></p></div>' +
        '<div class="st-filtres">' +
          seg('st-periodes', 'Période', 'jours', [[1, 'Aujourd’hui'], [7, '7 jours'], [30, '30 jours'], [400, 'Depuis le début']]) +
          seg('st-public', 'Public', 'public', [['tous', 'Tout le monde'], ['membres', 'Membres'], ['sans_compte', 'Sans compte']]) +
        '</div>' +
      '</header>' +
      '<div id="st-alerte"></div>' +

      '<section class="st-sec" aria-labelledby="st-t1">' + h('st-t1', 1, 'En bref') +
        '<div class="st-k" id="st-bref"></div><p class="st-note" id="st-comp"></p></section>' +

      '<section class="st-sec" aria-labelledby="st-t2">' + h('st-t2', 2, 'Jour par jour') +
        '<div class="st-b" id="st-jours"></div></section>' +

      '<section class="st-sec" aria-labelledby="st-t3"><div class="st-h-l">' + h('st-t3', 3, 'Ce qu’ils lisent') +
          '<div class="st-puces" id="st-types" role="group" aria-label="Type de contenu"></div></div>' +
        '<div class="st-table"><div class="scroll"><table><thead><tr>' +
          '<th scope="col">Contenu</th><th scope="col" class="dr">Lecteurs</th><th scope="col" class="dr">Temps moyen</th><th scope="col">Jusqu’au bout</th>' +
        '</tr></thead><tbody id="st-tb"></tbody></table></div><div class="st-pied" id="st-pied"></div></div></section>' +

      '<section class="st-sec" aria-labelledby="st-t4">' + h('st-t4', 4, 'Est-ce qu’ils reviennent, et d’où ils arrivent') +
        '<div class="st-duo">' +
          '<div class="st-b"><h3>Les membres</h3><div class="st-barres" id="st-memb"></div><p id="st-rev"></p></div>' +
          '<div class="st-b"><h3>D’où ils arrivent</h3><div class="st-barres" id="st-src"></div><p id="st-src-p"></p></div>' +
        '</div></section>' +

      '<section class="st-sec" aria-labelledby="st-t5">' + h('st-t5', 5, 'À surveiller') +
        '<div class="st-trio">' +
          '<div class="st-b" id="st-prem"></div>' +
          '<div class="st-b" id="st-404"></div>' +
          '<div class="st-b" id="st-rech"></div>' +
        '</div></section>' +

      '<section class="st-sec" aria-labelledby="st-t6"><h2 class="st-h" id="st-t6"></h2>' +
        '<div class="st-b" id="st-ent"></div></section>';

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
      if (b.dataset.type !== undefined) { etat.type = b.dataset.type; etat.tout = false; return rendreContenus(); }
      if (b.id === 'st-tout') { etat.tout = !etat.tout; return rendreContenus(); }
      if (b.dataset.idee) { if (ajouterIdee(b.dataset.idee, +b.dataset.n)) { b.textContent = 'Dans les idées'; b.disabled = true; } }
    });
  }

  /* ─── Chargement ─── */
  function charger() {
    etat.charge = true;
    return chargerIndex().then(function () {
      if (!Ad.statsSite) throw new Error('auth.js trop ancien : recharge la page.');
      return Ad.statsSite(etat.jours, etat.public);
    }).then(function (d) {
      $('#st-alerte').innerHTML = '';
      etat.d = d || {}; rendre();
    }).catch(function (err) {
      var m = String((err && err.message) || err);
      $('#st-alerte').innerHTML = /stats_site|function|fonction/i.test(m) && !/non_autorise/.test(m)
        ? '<div class="st-attente" style="margin-bottom:22px">Statistiques indisponibles : la fonction <code>stats_site</code> (<code>supabase/statistiques-site.sql</code>) n’est pas dans la base.</div>'
        : '<div class="alerte-r" style="margin-bottom:22px"><div><b>Statistiques indisponibles.</b> ' + esc(m) + '</div></div>';
    });
  }

  /* Premier et dernier jour réellement couverts par la période. */
  function bornes(d) {
    var fin = new Date(), debut = new Date(d.debut || Date.now());
    var mesure = d.mesure_depuis ? new Date(d.mesure_depuis) : null;
    if (mesure && mesure > debut) debut = mesure;
    return { debut: debut, fin: fin, mesure: mesure };
  }

  function rendre() {
    var d = etat.d || {}, bo = bornes(d);
    var pub = { tous: '', membres: ' · membres seulement', sans_compte: ' · visiteurs sans compte seulement' }[etat.public];
    var per = etat.jours === 1 || jourLocal(bo.debut) === jourLocal(bo.fin) ? 'Aujourd’hui, ' + dateLongue(bo.fin)
      : 'Du ' + dateLongue(bo.debut) + ' au ' + dateLongue(bo.fin);
    $('#st-periode').textContent = per + pub + ' · robots écartés · ton propre compte n’est jamais compté';
    rendreBref(d, bo);
    rendreJours(d, bo);
    rendreTypes();
    rendreContenus();
    rendreMembres(d);
    rendreSources(d);
    rendreSurveiller(d);
    rendreEntonnoir(d);
  }

  /* Comparaison avec la période d'avant, seulement si elle a été mesurée en entier. */
  function comparable(d) {
    if (!d.mesure_depuis || etat.jours >= 400) return false;
    var avant = new Date(d.debut).getTime() - etat.jours * 864e5;
    return new Date(d.mesure_depuis).getTime() <= avant + 3600e3;
  }
  function ecart(v, a, unite) {
    var e = (v || 0) - (a || 0);
    if (!e) return { t: 'autant que la période d’avant', c: '' };
    return { t: (e > 0 ? '+' : '−') + (unite ? unite(Math.abs(e)) : nb(Math.abs(e))) + ' par rapport à la période d’avant', c: e > 0 ? 'vert' : 'rouge' };
  }
  function carte(o) {
    return '<div class="st-c' + (o.or ? ' or' : '') + '"><span class="l">' + o.l + '</span><b class="v">' + o.v + '</b>' +
      '<span class="s ' + (o.sc || '') + '">' + o.s + '</span><p class="def">' + o.def + '</p></div>';
  }
  function rendreBref(d, bo) {
    var b = d.bref || {}, a = d.avant || {}, cmp = comparable(d);
    var seuil = d.seuil || 10;
    function sous(base, v, av, unite) {
      if (!cmp) return { t: base, c: '' };
      var e = ecart(v, av, unite); return { t: e.t, c: e.c };
    }
    var s1 = sous((b.visiteurs_membres || etat.public === 'tous' ? 'dont ' + nb(b.visiteurs_membres) + ' ' + pl(b.visiteurs_membres, 'membre') : '') +
                 (b.nouveaux ? (b.visiteurs_membres || etat.public === 'tous' ? ' · ' : '') + nb(b.nouveaux) + ' ' + pl(b.nouveaux, 'nouveau', 'nouveaux') : ''), b.visiteurs, a.visiteurs);
    var s2 = sous('par ' + nb(b.lecteurs) + ' ' + pl(b.lecteurs, 'personne'), b.lectures, a.lectures);
    var s3 = sous(b.lectures ? duree(b.mediane) + ' par lecture, en médiane' : 'aucune lecture', b.secondes, a.secondes, duree);
    $('#st-bref').innerHTML =
      carte({ l: 'Visiteurs', v: nb(b.visiteurs), s: s1.t || ' ', sc: cmp ? s1.c : 'vert',
              def: 'Des personnes, pas des clics : un compte compte une fois, même sur trois appareils. Sans compte, un navigateur.' }) +
      carte({ l: 'Lectures · le chiffre qui compte', v: nb(b.lectures), s: s2.t, sc: cmp ? s2.c : 'vert', or: true,
              def: 'Un cours, un article, une fiche… lu au moins ' + seuil + NB + 'secondes. Le relire ne compte pas deux fois. Accueil et menus ne comptent pas.' }) +
      carte({ l: 'Temps de lecture', v: duree(b.secondes), s: s3.t, sc: s3.c,
              def: 'Seulement le temps où l’onglet est ouvert et où l’élève bouge (défilement, clic) : une page oubliée ouverte ne compte pas.' }) +
      carte({ l: 'Lus jusqu’au bout', v: pc(b.bout, b.lectures) + NB + '%', s: nb(b.bout) + ' ' + pl(b.bout, 'lecture') + ' sur ' + nb(b.lectures),
              def: 'Part des lectures qui arrivent en bas de la page (90' + NB + '% au moins).' });
    var m = bo.mesure;
    $('#st-comp').textContent = cmp || etat.jours >= 400 || !m ? ''
      : 'Sous chaque chiffre, la comparaison avec la période précédente apparaîtra quand elle aura été mesurée en entier : la mesure a commencé le ' +
        m.getDate() + (m.getDate() === 1 ? 'er' : '') + ' ' + m.toLocaleDateString('fr-FR', { month: 'long' }) + '.';
  }

  /* Visiteurs et lectures par jour (par semaine au-delà de 62 jours). */
  function rendreJours(d, bo) {
    var cle = { tous: '', membres: '_membres', sans_compte: '_sans' }[etat.public];
    var idx = {};
    (d.par_jour || []).forEach(function (j) { idx[String(j.jour).slice(0, 10)] = j; });
    var jours = [], x = new Date(bo.debut); x.setHours(12, 0, 0, 0);
    var fin = new Date(bo.fin); fin.setHours(12, 0, 0, 0);
    while (x <= fin) { jours.push(new Date(x)); x.setDate(x.getDate() + 1); }
    var cols = jours.map(function (j) {
      var r = idx[jourLocal(j)] || {};
      return { d: j, v: r['visiteurs' + cle] || 0, l: r['lectures' + cle] || 0, encours: jourLocal(j) === jourLocal(new Date()) };
    });
    var semaine = cols.length > 62;
    if (semaine) {
      /* Les visiteurs d'une semaine ne s'additionnent pas jour par jour :
         on montre le maximum d'une journée, les lectures s'additionnent. */
      var g = [];
      cols.forEach(function (c) {
        var lundi = new Date(c.d); lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7));
        var k = jourLocal(lundi), dernier = g[g.length - 1];
        if (!dernier || dernier.k !== k) g.push(dernier = { k: k, d: lundi, v: 0, l: 0, encours: false });
        dernier.v = Math.max(dernier.v, c.v); dernier.l += c.l; dernier.encours = dernier.encours || c.encours;
      });
      cols = g;
    }
    var max = Math.max.apply(null, cols.map(function (c) { return Math.max(c.v, c.l); }).concat([1]));
    var meilleur = cols.reduce(function (m, c) { return !m || c.v > m.v ? c : m; }, null);
    var gt = 'grid-template-columns:repeat(' + cols.length + ',minmax(0,1fr))';
    var serre = cols.length > 16;
    function etiquette(c, i) {
      if (semaine) return 'Sem. du ' + c.d.getDate() + '/' + (c.d.getMonth() + 1);
      if (serre) return (i % Math.ceil(cols.length / 8) === 0 || i === cols.length - 1) ? c.d.getDate() + '/' + (c.d.getMonth() + 1) : '';
      return JOURS_COURTS[c.d.getDay()] + ' ' + c.d.getDate() + (c.encours ? ' (en cours)' : '');
    }
    var aria = cols.map(function (c) {
      return (semaine ? 'semaine du ' + c.d.getDate() + '/' + (c.d.getMonth() + 1) : JOURS_LONGS[c.d.getDay()] + ' ' + c.d.getDate()) + ' : ' + c.v + ' ' + pl(c.v, 'visiteur') + ', ' + c.l + ' ' + pl(c.l, 'lecture');
    }).join('. ');
    var vide = !cols.some(function (c) { return c.v || c.l; });
    $('#st-jours').innerHTML =
      '<div class="st-leg"><span><i style="background:var(--blue)"></i>Visiteurs' + (semaine ? ' (meilleur jour de la semaine)' : '') + '</span>' +
        '<span><i style="background:var(--accent)"></i>Lectures</span>' +
        (meilleur && meilleur.v && cols.length > 1 ? '<span class="fin">Meilleur ' + (semaine ? 'moment' : 'jour') + ' : ' +
          (semaine ? 'semaine du ' + meilleur.d.getDate() + '/' + (meilleur.d.getMonth() + 1) : dateLongue(meilleur.d)) + ', ' + nb(meilleur.v) + ' ' + pl(meilleur.v, 'visiteur') + '</span>' : '') + '</div>' +
      (vide ? '<div class="st-vide">Personne sur cette période.</div>' :
      '<div class="st-jours"><div class="st-histo' + (serre ? ' serre' : '') + '" role="img" aria-label="' + esc(aria) + '" style="' + gt + '">' + cols.map(function (c) {
        return '<div' + (c.encours ? ' class="encours"' : '') + ' title="' + esc((semaine ? 'Semaine du ' + c.d.getDate() + '/' + (c.d.getMonth() + 1) : dateLongue(c.d)) + ' : ' + c.v + ' ' + pl(c.v, 'visiteur') + ', ' + c.l + ' ' + pl(c.l, 'lecture')) + '">' +
          '<div class="b"><span>' + c.v + '</span><i style="height:' + Math.round(180 * c.v / max) + 'px"></i></div>' +
          '<div class="b l"><span>' + c.l + '</span><i style="height:' + Math.round(180 * c.l / max) + 'px"></i></div></div>';
      }).join('') + '</div>' +
      '<div class="st-axe" style="' + gt + '">' + cols.map(function (c, i) { return '<span>' + esc(etiquette(c, i)) + '</span>'; }).join('') + '</div></div>');
  }

  function contenusFiltres() {
    return ((etat.d || {}).contenus || []).filter(function (c) { return !etat.type || infos(c.page).type === etat.type; });
  }
  function rendreTypes() {
    var l = (etat.d || {}).contenus || [], n = {};
    l.forEach(function (c) { var t = infos(c.page).type; n[t] = (n[t] || 0) + 1; });
    if (etat.type && !n[etat.type]) etat.type = '';
    $('#st-types').innerHTML = [['', 'Tout', l.length]].concat(TYPES.filter(function (t) { return n[t[0]]; }).map(function (t) { return [t[0], t[1], n[t[0]]]; }))
      .map(function (x) { var on = etat.type === x[0]; return '<button type="button" class="' + (on ? 'on' : '') + '" data-type="' + esc(x[0]) + '" aria-pressed="' + on + '">' + esc(x[1]) + '<span>' + x[2] + '</span></button>'; }).join('');
  }
  function rendreContenus() {
    var l = contenusFiltres(), vus = etat.tout ? l : l.slice(0, PAR_PAGE);
    $('#st-types').querySelectorAll('[data-type]').forEach(function (b) { var on = b.dataset.type === etat.type; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $('#st-tb').innerHTML = vus.length ? vus.map(function (c) {
      var i = infos(c.page);
      return '<tr><td><a href="' + esc(lien(c.page)) + '" target="_blank" rel="noopener">' + esc(titrePropre(c.titre, c.page)) + '</a><small>' + esc(i.detail) + '</small></td>' +
        '<td class="dr n">' + nb(c.lecteurs) + '</td>' +
        '<td class="dr">' + duree(c.secondes_moy) + '</td>' +
        '<td><div class="st-bout"><span><i style="width:' + (c.bout || 0) + '%"></i></span><b>' + (c.bout || 0) + NB + '%</b></div></td></tr>';
    }).join('') : '<tr><td colspan="4" class="st-vide" style="padding:22px 20px">' + (((etat.d || {}).contenus || []).length ? 'Aucun contenu de ce type.' : 'Aucune lecture sur cette période.') + '</td></tr>';
    $('#st-pied').innerHTML = '<span>' + nb(l.length) + ' ' + pl(l.length, 'contenu lu', 'contenus lus') + ' sur la période · triés par nombre de lecteurs</span>' +
      (l.length > PAR_PAGE ? '<button type="button" id="st-tout">' + (etat.tout ? 'Voir les ' + PAR_PAGE + ' premiers' : 'Voir les ' + nb(l.length) + ' →') + '</button>' : '');
  }

  function barre(libelle, n, max, coul) {
    return '<div class="st-barre-l"><div><span>' + esc(libelle) + '</span><b>' + nb(n) + '</b></div>' +
      '<div class="j"><i style="width:' + (n ? Math.max(3, Math.round(100 * n / (max || 1))) : 0) + '%;background:' + coul + '"></i></div></div>';
  }
  function rendreMembres(d) {
    var m = d.membres || {}, b = d.bref || {};
    $('#st-memb').innerHTML = etat.public === 'sans_compte'
      ? '<div class="st-vide">Choisis « Tout le monde » ou « Membres » pour voir cette partie.</div>'
      : barre('Inscrits' + (m.nouveaux ? ' (dont ' + nb(m.nouveaux) + ' sur la période)' : ''), m.inscrits, m.inscrits, '#4a4a58') +
        barre('Venus sur la période', m.venus, m.inscrits, 'var(--blue)') +
        barre('Ont lu au moins un contenu', m.lecteurs, m.inscrits, 'var(--accent)');
    $('#st-rev').innerHTML = b.visiteurs
      ? '<b>' + nb(b.reviennent) + ' ' + pl(b.reviennent, 'personne') + ' sur ' + nb(b.visiteurs) + '</b> ' + (b.reviennent > 1 ? 'sont venues' : 'est venue') + ' au moins deux jours différents.'
      : '';
  }
  function rendreSources(d) {
    var l = (d.sources || []).slice(0, 6), b = d.bref || {};
    var max = l.length ? l[0].personnes : 1;
    $('#st-src').innerHTML = l.length ? l.map(function (s) { return barre(s.source, s.personnes, max, 'var(--blue)'); }).join('')
      : '<div class="st-vide">Aucune arrivée depuis l’extérieur sur la période.</div>';
    $('#st-src-p').textContent = 'En personnes, d’après la première page de leur visite.' + (b.visiteurs ? ' ' + pc(b.mobile, b.visiteurs) + NB + '% sur téléphone.' : '');
  }

  function rendreSurveiller(d) {
    var p = d.premium || {}, pages = p.pages || [];
    $('#st-prem').innerHTML = '<h3>Bloqués par Premium</h3>' + (p.bloques
      ? '<p>' + nb(p.bloques) + ' ' + pl(p.bloques, 'personne s’est arrêtée', 'personnes se sont arrêtées') + ' sur un contenu réservé.</p>' +
        '<ul>' + pages.map(function (x) {
          return '<li><a href="' + esc(lien(x.page)) + '" target="_blank" rel="noopener">' + esc(titrePropre(x.titre, x.page)) + '</a>' +
            (x.personnes > 1 ? ' <small>· ' + nb(x.personnes) + ' personnes</small>' : '') + '</li>';
        }).join('') + '</ul>'
      : '<p>Personne ne s’est arrêté sur un contenu réservé.</p>') +
      (p.inscriptions ? '<p>' + nb(p.inscriptions) + ' ' + pl(p.inscriptions, 'compte créé', 'comptes créés') + ' sur la période.</p>' : '');
    var i = d.introuvables || [];
    $('#st-404').innerHTML = '<h3>Liens cassés</h3><p>Adresses demandées qui n’existent pas.</p>' + (i.length
      ? '<ul class="st-mono">' + i.map(function (x) { return '<li>' + esc(x.page) + (x.personnes > 1 ? ' <small>· ' + nb(x.personnes) + '</small>' : '') + '</li>'; }).join('') + '</ul>'
      : '<div class="st-vide">Aucun sur la période.</div>');
    var v = d.recherches_vides || [], r = d.recherches || [], deja = titresIdees();
    $('#st-rech').innerHTML = '<h3>Recherches sans résultat</h3>' + (v.length
      ? '<p>Ce que le site n’a pas : des idées de contenus à créer.</p><ul style="list-style:none;padding:0">' + v.map(function (x) {
          var dans = deja[titreIdee(x.q).toLowerCase()];
          return '<li class="st-idee"><span>« ' + esc(x.q) + ' » <small>· ' + nb(x.personnes) + '</small></span>' +
            '<button type="button" class="mini" data-idee="' + esc(x.q) + '" data-n="' + (x.personnes || 0) + '"' + (dans ? ' disabled>Dans les idées' : '>Ajouter aux idées') + '</button></li>';
        }).join('') + '</ul>'
      : '<p>Aucune sur la période. Sinon, chaque mot cherché s’affiche ici avec « Ajouter aux idées ».</p>') +
      (r.length ? '<p>Les plus cherchés : ' + r.slice(0, 5).map(function (x) { return '« ' + esc(x.q) + ' »'; }).join(', ') + '.</p>' : '');
  }

  function rendreEntonnoir(d) {
    var e = d.entonnoir || {}, o = e.ouvertes || 0;
    $('#st-t6').textContent = '6 · Comment on passe de ' + nb(o) + ' à ' + nb(e.lectures);
    var passage = (e.passage || []).map(function (x) { return (PASSAGE[x.quoi] || x.quoi) + ' (' + nb(x.n) + ')'; });
    function ligne(n, txt, detail, coul) {
      return '<div><div><span>' + txt + '</span><span>' + detail + '</span></div><i style="width:' + (o ? Math.max(.6, 100 * n / o) : 0) + '%;background:' + coul + '"></i></div>';
    }
    var autres = Math.max(0, (e.contenus || 0) - (e.lectures || 0));
    $('#st-ent').innerHTML =
      '<p style="max-width:760px;font-size:15px">L’ancien chiffre « pages vues » comptait chaque chargement de page : l’accueil, les menus, la page de connexion, un retour en arrière… C’est pour ça qu’il paraissait gonflé. Voilà ce qu’il en reste, étape par étape.</p>' +
      '<div class="st-ent">' +
        ligne(o, '<b>' + nb(o) + '</b> ' + pl(o, 'page ouverte', 'pages ouvertes'), 'l’ancien « pages vues »', '#4a4a58') +
        ligne(e.humaines, '<b>' + nb(e.humaines) + '</b> par de vraies personnes', nb(o - e.humaines) + ' ' + pl(o - e.humaines, 'ouverte') + ' par des robots (aucun geste)', 'var(--blue)') +
        ligne(e.contenus, '<b>' + nb(e.contenus) + '</b> sur un contenu', nb(e.humaines - e.contenus) + ' de passage' + (passage.length ? ' : ' + esc(passage.join(', ')) : ''), 'var(--green)') +
        ligne(e.lectures, '<b style="color:var(--or)">' + nb(e.lectures) + '</b> ' + pl(e.lectures, 'lecture'),
          autres ? 'les autres : fermées en moins de ' + ((d.seuil || 10)) + NB + 's, ou le même contenu rouvert' : ' ', 'var(--accent)') +
      '</div>' +
      '<p class="st-note">Le nombre de pages ouvertes reste visible ici, pour mémoire, mais il n’est plus mis en avant nulle part.</p>';
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
