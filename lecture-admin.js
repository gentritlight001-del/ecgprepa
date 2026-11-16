/* ══════════════════════════════════════════════════════════════════
   ECG Prépa : statistiques de fréquentation, côté administration

   Construit l'onglet « Statistiques » de la page d'admin : visiteurs
   (avec ou sans compte), pages vues, visites, temps de lecture, envie
   de Premium (murs, page Tarifs, clics « payer »), sources, pages
   d'entrée, rubriques, appareils, heures, recherches, pages
   introuvables, pages les plus lues.
   Données : fonction stats_lecture (supabase/statistiques-lecture.sql),
   remplie par le module Stats de auth.js. Aucune donnée qui identifie
   un élève : un visiteur = un navigateur.

   Chargé par admin.html, après auth.js.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var A = window.ECGAuth;
  if (!A || !A.admin) return;
  var Ad = A.admin;

  var DEBUT_MESURE = '14 novembre 2026';
  var PAR_PAGE = 25;

  var MATIERES = {
    hgg: 'HGG', esh: 'ESH', mathematiques: 'Maths', maths: 'Maths',
    philosophie: 'Philosophie', langues: 'Langues'
  };
  var GRANDES = ['Actualité', 'Culture générale', 'L\'Humanité', 'Cours de 1re année',
                 'Cours de 2e année', 'Flashcards', 'Accueil et autres pages'];
  var COULEURS = ['#e08a8a', '#c8a96e', '#c97c9e', '#7c9ec9', '#9ecba0', '#b39ddb', '#8a8880'];
  var C_MEMBRES = '#c8a96e', C_SANS = '#7c9ec9';
  var JOURS_SEMAINE = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
  var PAGES_SPECIALES = {
    'index.html': 'Accueil (élèves)', 'accueil.html': 'Accueil (vitrine)', 'login.html': 'Connexion',
    'tarifs.html': 'Tarifs Premium', 'cours-ecg.html': 'Cours ECG'
  };

  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nb(n) { return Number(n || 0).toLocaleString('fr-FR'); }
  function pc(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function virgule(x) { return String(x).replace('.', ','); }
  function duree(s) {
    s = Math.round(s || 0);
    if (!s) return '—';
    if (s < 60) return s + ' s';
    if (s >= 3600) { var h = Math.floor(s / 3600); return h + ' h ' + ('0' + Math.round((s % 3600) / 60)).slice(-2); }
    var m = Math.floor(s / 60), r = s % 60;
    return m + ' min' + (r ? ' ' + (r < 10 ? '0' : '') + r : '');
  }
  function jourCourt(d) { return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }
  function cleJour(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  /* Rubrique d'une page, d'après son chemin (en minuscules). */
  function rubrique(page) {
    var p = String(page || '').toLowerCase();
    var m;
    if (p.indexOf('actualites/') === 0) return { grande: 'Actualité', fine: 'Actualité' };
    if (p.indexOf('culture-generale') === 0) return { grande: 'Culture générale', fine: 'Culture générale' };
    if (p.indexOf('humanite') === 0) return { grande: 'L\'Humanité', fine: 'L\'Humanité' };
    if (p.indexOf('flashcards/') === 0) return { grande: 'Flashcards', fine: 'Flashcards' };
    if ((m = p.match(/^(premiere|deuxieme)_annee\/([^/]+)\//))) {
      var an = m[1] === 'premiere' ? 1 : 2;
      var mat = MATIERES[m[2]] || m[2];
      if (/\/quotidien\//.test(p)) mat += ' au quotidien';
      else if (an === 2 && m[2] === 'langues') mat = 'Civilisation';
      else if (/\/colles\//.test(p)) mat += ' (colles)';
      return { grande: an === 1 ? 'Cours de 1re année' : 'Cours de 2e année',
               fine: (an === 1 ? '1re année · ' : '2e année · ') + mat };
    }
    if (p.indexOf('premiere_annee/') === 0) return { grande: 'Cours de 1re année', fine: 'Index des cours' };
    if (p.indexOf('deuxieme_annee/') === 0) return { grande: 'Cours de 2e année', fine: 'Index des cours' };
    if (p === 'cours-ecg.html') return { grande: 'Accueil et autres pages', fine: 'Index des cours' };
    if (p === 'tarifs.html' || p === 'abonnement.html') return { grande: 'Accueil et autres pages', fine: 'Premium' };
    if (p === 'login.html' || p === 'accueil.html') return { grande: 'Accueil et autres pages', fine: 'Vitrine et connexion' };
    return { grande: 'Accueil et autres pages', fine: 'Accueil et autres pages' };
  }
  function titrePage(p) {
    return PAGES_SPECIALES[p.page] || p.titre || p.page;
  }
  var base = location.href.replace(/[^/]*([?#].*)?$/, '');

  function poserStyles() {
    if (document.getElementById('ecg-lecture-css')) return;
    var s = document.createElement('style');
    s.id = 'ecg-lecture-css';
    s.textContent = [
      '#p-lecture .bloc{background:var(--surface);border:1px solid var(--border);border-radius:14px;margin-bottom:20px;overflow:hidden}',
      '#p-lecture .bloc>header{padding:20px 22px 6px;margin:0;display:block}',
      '#p-lecture .bloc>header h3{font-family:"Playfair Display",serif;font-size:1.2rem;font-weight:700}',
      '#p-lecture .bloc>header p{color:var(--dim);font-size:.8rem;font-weight:300;line-height:1.65;margin-top:6px;max-width:720px}',
      '#p-lecture .entete{display:flex;gap:12px 18px;align-items:center;flex-wrap:wrap;margin-bottom:18px}',
      '#p-lecture .entete p{color:var(--dim);font-size:.8rem;font-weight:300;line-height:1.6;flex:1 1 320px}',
      '#p-lecture .filtres{display:flex;flex-direction:column;gap:8px;align-items:flex-end}',
      '#p-lecture .seg{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}',
      '#p-lecture .seg button{background:var(--surface);border:1px solid var(--border);color:var(--dim);font-family:"DM Mono",monospace;font-size:.7rem;letter-spacing:.06em;padding:8px 13px;border-radius:999px;cursor:pointer}',
      '#p-lecture .seg button:hover{color:var(--text)}',
      '#p-lecture .seg button.on{border-color:var(--accent);color:var(--accent);background:rgba(200,169,110,.08)}',
      '#p-lecture .seg.pub button.on{border-color:var(--blue);color:var(--blue);background:rgba(124,158,201,.1)}',
      '#p-lecture .stats{margin-bottom:12px}',
      '#p-lecture .robots{color:var(--faint);font-size:.76rem;font-weight:300;line-height:1.6;margin:0 0 20px}',
      '#p-lecture .robots b{color:var(--dim);font-weight:500}',
      '#p-lecture .stat small{display:block;color:var(--faint);font-size:.72rem;margin-top:6px;font-weight:300}',
      /* Comparaison sans compte / membres */
      '#p-lecture .vs{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:14px 22px 22px}',
      '#p-lecture .vs-c{border:1px solid var(--border);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden}',
      '#p-lecture .vs-c::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--c)}',
      '#p-lecture .vs-c h4{font-family:"DM Mono",monospace;font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--c);font-weight:400;margin-bottom:12px}',
      '#p-lecture .vs-c dl{display:grid;grid-template-columns:1fr auto;gap:8px 12px;font-size:.84rem}',
      '#p-lecture .vs-c dt{color:var(--dim);font-weight:300}',
      '#p-lecture .vs-c dd{font-family:"DM Mono",monospace;font-size:.8rem;text-align:right;color:var(--text)}',
      '#p-lecture .vs-c dd.gros{font-family:"Playfair Display",serif;font-size:1.5rem;font-weight:700;color:var(--c);line-height:1}',
      '#p-lecture .part{margin:0 22px 22px;height:10px;border-radius:99px;overflow:hidden;display:flex;background:var(--surface2)}',
      '#p-lecture .part i{display:block;height:100%}',
      '#p-lecture .phrase{padding:0 22px 6px;font-size:.9rem;line-height:1.6}',
      '#p-lecture .phrase b{color:var(--blue);font-weight:500}',
      /* Barres par jour */
      '#p-lecture .jours{display:flex;align-items:flex-end;gap:3px;height:180px;padding:18px 22px 0}',
      '#p-lecture .jours .j{flex:1;min-width:2px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;position:relative;cursor:default}',
      '#p-lecture .jours .j i{display:block;min-height:0}',
      '#p-lecture .jours .j i.m{background:' + C_MEMBRES + '}',
      '#p-lecture .jours .j i.s{background:' + C_SANS + ';border-radius:3px 3px 0 0}',
      '#p-lecture .jours .j i.m:only-child,#p-lecture .jours .j i.m:first-child{border-radius:3px 3px 0 0}',
      '#p-lecture .jours .j i.s+i.m{border-radius:0}',
      '#p-lecture .jours .j i.vide{background:var(--border);height:2px;border-radius:2px}',
      '#p-lecture .jours .j:hover i{filter:brightness(1.15)}',
      '#p-lecture .legende{display:flex;gap:16px;flex-wrap:wrap;font-size:.76rem;color:var(--dim);padding:6px 22px 0}',
      '#p-lecture .legende i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}',
      '#p-lecture .axe{display:flex;justify-content:space-between;padding:8px 22px 18px;font-family:"DM Mono",monospace;font-size:.62rem;color:var(--faint);letter-spacing:.06em}',
      '#p-lecture .bulle{position:fixed;z-index:50;pointer-events:none;background:#0d0d0f;border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-size:.76rem;color:var(--text);white-space:nowrap;display:none}',
      /* Premium */
      '#p-lecture .prem{border-color:rgba(200,169,110,.35)}',
      '#p-lecture .chiffres{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;padding:14px 22px 6px}',
      '#p-lecture .ch{background:var(--surface2);border-radius:10px;padding:14px 16px}',
      '#p-lecture .ch b{display:block;font-family:"Playfair Display",serif;font-size:1.8rem;font-weight:700;line-height:1;color:var(--accent)}',
      '#p-lecture .ch span{display:block;font-size:.78rem;color:var(--text);margin-top:8px;line-height:1.35}',
      '#p-lecture .ch small{display:block;font-size:.7rem;color:var(--faint);margin-top:4px;font-weight:300;line-height:1.4}',
      '#p-lecture .sous-t{font-family:"DM Mono",monospace;font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);padding:18px 22px 6px}',
      /* Deux colonnes */
      '#p-lecture .duo{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}',
      '#p-lecture .duo .bloc{margin-bottom:0;display:flex;flex-direction:column}',
      '#p-lecture .rubs{padding:14px 22px 22px;display:flex;flex-direction:column;gap:12px}',
      '#p-lecture .rub .l{display:flex;justify-content:space-between;gap:10px;font-size:.84rem;margin-bottom:6px}',
      '#p-lecture .rub .l em{font-style:normal;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#p-lecture .rub .l span{font-family:"DM Mono",monospace;font-size:.72rem;color:var(--dim);white-space:nowrap}',
      '#p-lecture .rub .b{height:8px;background:var(--surface2);border-radius:99px;overflow:hidden}',
      '#p-lecture .rub .b i{display:block;height:100%;border-radius:99px}',
      '#p-lecture .heures{display:flex;align-items:flex-end;gap:3px;flex:1;min-height:150px;padding:18px 22px 0}',
      '#p-lecture .heures .j{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end}',
      '#p-lecture .heures .j i{display:block;background:var(--blue);border-radius:3px 3px 0 0;min-height:2px;opacity:.85}',
      '#p-lecture .heures.semaine .j i{background:var(--green)}',
      '#p-lecture .heures .j:hover i{opacity:1}',
      '#p-lecture .axe.sem{justify-content:space-around}',
      '#p-lecture .liste{list-style:none;padding:8px 22px 18px;margin:0}',
      '#p-lecture .liste li{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid rgba(42,42,53,.55);font-size:.84rem;align-items:baseline}',
      '#p-lecture .liste li:last-child{border-bottom:0}',
      '#p-lecture .liste li a{color:var(--text);text-decoration:none;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#p-lecture .liste li a:hover{color:var(--accent)}',
      '#p-lecture .liste li em{font-style:normal;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#p-lecture .liste li span{font-family:"DM Mono",monospace;font-size:.74rem;color:var(--dim);white-space:nowrap}',
      '#p-lecture .liste li span b{color:var(--accent);font-weight:400}',
      '#p-lecture .rien{padding:22px;color:var(--faint);font-size:.84rem;text-align:center}',
      /* Tableau des pages */
      '#p-lecture .outils{display:flex;gap:10px;flex-wrap:wrap;padding:12px 22px 16px}',
      '#p-lecture .outils input{flex:1;min-width:200px}',
      '#p-lecture td.num,#p-lecture th.num{text-align:right;white-space:nowrap}',
      '#p-lecture td.num{font-family:"DM Mono",monospace;font-size:.8rem}',
      '#p-lecture td.vues{font-family:"Playfair Display",serif;font-size:1.15rem;font-weight:700;color:var(--accent)}',
      '#p-lecture td.sans{color:var(--blue)}',
      '#p-lecture .pg a{color:var(--text);text-decoration:none;font-weight:500}',
      '#p-lecture .pg a:hover{color:var(--accent)}',
      '#p-lecture .pg .mono{display:block;margin-top:3px;white-space:normal;word-break:break-all;color:var(--faint)}',
      '#p-lecture .rg{font-size:.78rem;color:var(--dim);white-space:nowrap}',
      '#p-lecture .rg i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;vertical-align:1px}',
      '#p-lecture .jauge{display:inline-block;width:46px;height:5px;border-radius:99px;background:var(--surface2);margin-right:8px;vertical-align:2px;overflow:hidden}',
      '#p-lecture .jauge i{display:block;height:100%;background:var(--green)}',
      '#p-lecture .plus{display:block;margin:0 auto 18px}',
      '@media(max-width:860px){#p-lecture .duo{grid-template-columns:1fr}}',
      /* Refonte (maquette validée, novembre 2026) */
      '#p-lecture .lc-barre{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;padding:10px 12px;margin-bottom:22px;background:var(--surface);border:1px solid var(--border);border-radius:16px;z-index:20}',
      '@media(min-width:961px){#p-lecture .lc-barre{position:sticky;top:68px;box-shadow:0 10px 30px rgba(0,0,0,.35)}}',
      '#p-lecture .lc-barre .seg{gap:4px;padding:4px;background:var(--bg);border-radius:999px;justify-content:flex-start}',
      '#p-lecture .lc-barre .seg button{border:0;background:none;font-family:"DM Sans",sans-serif;font-size:13px;letter-spacing:0;padding:0 14px;min-height:34px;color:var(--dim)}',
      '#p-lecture .lc-barre .seg button.on,#p-lecture .lc-barre .seg.pub button.on{background:var(--accent);color:#0d0d0f;font-weight:600}',
      '#p-lecture .lc-nav{display:flex;gap:16px;margin-left:auto}',
      '#p-lecture .lc-nav button{background:none;border:0;padding:0;color:var(--accent);font-family:inherit;font-size:14px}',
      '#p-lecture .lc-nav button:hover{color:#e3c88f}',
      '#p-lecture .lc-sec{margin-bottom:34px;scroll-margin-top:140px}',
      '#p-lecture .lc-sec>h2{font-family:"Playfair Display",serif;font-size:28px;font-weight:700;margin-bottom:14px}',
      '#p-lecture .kpis{margin-bottom:10px}#p-lecture .kpi .v b{font-size:32px;white-space:nowrap}',
      '#p-lecture .kpi .e.haut{color:var(--green)}#p-lecture .kpi .e.bas{color:var(--danger)}#p-lecture .kpi .e.neutre{color:var(--dim)}',
      '#p-lecture .trio{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:20px}',
      '#p-lecture .trio .bloc{margin-bottom:0;display:flex;flex-direction:column}',
      '#p-lecture .quand .heures{min-height:110px}',
      '#p-lecture .entonnoir{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:14px 22px 6px}',
      '#p-lecture .et{display:flex;flex-direction:column;gap:6px}',
      '#p-lecture .et .barre{height:96px;display:flex;align-items:flex-end;background:var(--bg);border-radius:10px;overflow:hidden}',
      '#p-lecture .et .barre i{display:block;width:100%;border-radius:8px 8px 0 0;background:var(--accent);min-height:4px}',
      '#p-lecture .et b{font-family:"Playfair Display",serif;font-size:28px;line-height:1}',
      '#p-lecture .et span{font-size:14px}',
      '#p-lecture .et small{font-size:13px;color:var(--accent)}',
      '#p-lecture .prem-plus{padding:8px 22px 4px;font-size:13px;color:var(--dim);line-height:1.6}',
      '#p-lecture .liste li .mini{margin-left:10px;min-height:28px;padding:0 10px;font-size:12px;font-family:"DM Sans",sans-serif}',
      '@media(max-width:1100px){#p-lecture .trio{grid-template-columns:1fr 1fr}}',
      '@media(max-width:700px){#p-lecture .trio{grid-template-columns:1fr}#p-lecture .entonnoir{grid-template-columns:1fr}#p-lecture .et .barre{height:60px}#p-lecture .lc-nav{margin-left:0}}',
      '@media(max-width:640px){' +
        '#p-lecture .vs{grid-template-columns:1fr}' +
        '#p-lecture .filtres{align-items:flex-start}#p-lecture .seg{justify-content:flex-start}' +
        '#p-lecture .tpages th:nth-child(2),#p-lecture .tpages td:nth-child(2),' +
        '#p-lecture .tpages th:nth-child(4),#p-lecture .tpages td:nth-child(4),' +
        '#p-lecture .tpages th:nth-child(5),#p-lecture .tpages td:nth-child(5),' +
        '#p-lecture .tpages th:nth-child(7),#p-lecture .tpages td:nth-child(7){display:none}' +
        '#p-lecture .jours{gap:1px;padding:18px 16px 0}#p-lecture .axe{padding:8px 16px 18px}' +
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  var etat = { jours: 30, public: 'tous', donnees: null, avant: null, filtre: '', rub: '', tout: false, charge: false };

  function bloc(id, titre, texte, corps, classe) {
    return '<div class="bloc' + (classe ? ' ' + classe : '') + '"' + (id ? ' id="' + id + '"' : '') + '><header><h3>' + titre + '</h3>' +
      (texte ? '<p>' + texte + '</p>' : '') + '</header>' + corps + '</div>';
  }

  function batir() {
    var hote = document.getElementById('p-lecture');
    if (!hote || hote.dataset.pret) return;
    hote.dataset.pret = '1';
    poserStyles();
    hote.innerHTML =
      '<div class="lc-barre">' +
        '<div class="seg" id="lc-periodes" role="group" aria-label="Période">' +
          '<button type="button" data-j="1">Aujourd\'hui</button>' +
          '<button type="button" data-j="7">7 jours</button>' +
          '<button type="button" data-j="30" class="on">30 jours</button>' +
          '<button type="button" data-j="90">3 mois</button>' +
          '<button type="button" data-j="365">1 an</button>' +
        '</div>' +
        '<div class="seg pub" id="lc-public" role="group" aria-label="Public">' +
          '<button type="button" data-p="tous" class="on">Tout le monde</button>' +
          '<button type="button" data-p="sans_compte">Sans compte</button>' +
          '<button type="button" data-p="membres">Membres</button>' +
        '</div>' +
        '<nav class="lc-nav" aria-label="Parties des statistiques">' +
          '<button type="button" data-sec="lc-s-audience">Audience</button>' +
          '<button type="button" data-sec="lc-s-contenus">Contenus</button>' +
          '<button type="button" data-sec="lc-s-premium">Premium</button>' +
          '<button type="button" data-sec="lc-s-recherche">Recherche</button>' +
        '</nav>' +
      '</div>' +

      '<section class="lc-sec" id="lc-s-audience" aria-labelledby="lc-t-aud"><h2 id="lc-t-aud">Audience</h2>' +
        '<div class="kpis" id="lc-stats"></div>' +
        '<p class="robots" id="lc-robots"></p>' +
        bloc('lc-bloc-jours', 'Pages vues par jour', '',
          '<div class="legende"><span><i style="background:' + C_SANS + '"></i>Sans compte</span>' +
          '<span><i style="background:' + C_MEMBRES + '"></i>Membres</span></div>' +
          '<div class="jours" id="lc-jours"></div><div class="axe" id="lc-axe"></div>') +
        bloc('lc-bloc-vs', 'Sans compte ou membres ?',
          'Toujours sur tout le monde, quel que soit le filtre. « Sans compte » : personne connectée au moment de la visite.',
          '<div class="phrase" id="lc-phrase"></div><div class="part" id="lc-part"></div><div class="vs" id="lc-vs"></div>') +
        '<div class="trio">' +
          bloc('', 'D\'où ils viennent', '« Accès direct » : adresse tapée, favori, application ou lien sans origine (souvent WhatsApp et Snapchat).',
            '<div class="rubs" id="lc-sources"></div>') +
          bloc('', 'Quand ils lisent', 'Pages ouvertes selon l\'heure de Paris, puis selon le jour.',
            '<div class="heures" id="lc-heures"></div>' +
            '<div class="axe"><span>0 h</span><span>6 h</span><span>12 h</span><span>18 h</span><span>23 h</span></div>' +
            '<div class="heures semaine" id="lc-semaine" style="min-height:80px"></div>' +
            '<div class="axe sem">' + JOURS_SEMAINE.map(function (j) { return '<span>' + j + '</span>'; }).join('') + '</div>', 'quand') +
          bloc('', 'Sur quoi', '', '<div class="rubs" id="lc-appareils"></div>') +
        '</div>' +
      '</section>' +

      '<section class="lc-sec" id="lc-s-contenus" aria-labelledby="lc-t-cont"><h2 id="lc-t-cont">Contenus</h2>' +
        '<div class="duo">' +
          bloc('', 'Par rubrique', 'Part des pages vues de chaque grande partie du site.', '<div class="rubs" id="lc-rubs"></div>') +
          bloc('', 'Pages d\'arrivée', 'Première page de chaque visite.', '<ul class="liste" id="lc-entrees"></ul>') +
        '</div>' +
        bloc('', 'Pages les plus lues',
          '« Temps moyen » : temps passé à lire la page (onglet ouvert et visiteur actif). « Jusqu\'au bout » : part des visites qui ont atteint le bas de la page.',
          '<div class="outils">' +
            '<input type="text" id="lc-q" placeholder="Chercher une page…" aria-label="Chercher une page">' +
            '<select id="lc-rub" aria-label="Rubrique"><option value="">Toutes les rubriques</option></select>' +
          '</div>' +
          '<div class="scroll"><table class="tpages"><thead><tr>' +
            '<th>Page</th><th>Rubrique</th><th class="num">Vues</th><th class="num">Sans compte</th><th class="num">Visiteurs</th>' +
            '<th class="num">Temps moyen</th><th class="num">Jusqu\'au bout</th>' +
          '</tr></thead><tbody id="lc-pages"></tbody></table></div>' +
          '<div class="empty" id="lc-vide" style="display:none"></div>' +
          '<button class="btn ghost plus" type="button" id="lc-plus" style="display:none"></button>') +
      '</section>' +

      '<section class="lc-sec" id="lc-s-premium" aria-labelledby="lc-t-prem"><h2 id="lc-t-prem">Envie de Premium</h2>' +
        bloc('', 'Du contenu réservé au clic sur « payer »',
          'À chaque marche, combien de visiteurs restent. Un « mur Premium » est l\'écran qui arrête un visiteur sur un contenu réservé.',
          '<div id="lc-prem"></div>' +
          '<div class="sous-t">Contenus réservés qui ont arrêté le plus de monde</div><ul class="liste" id="lc-prem-pages"></ul>', 'prem') +
      '</section>' +

      '<section class="lc-sec" id="lc-s-recherche" aria-labelledby="lc-t-rech"><h2 id="lc-t-rech">Recherche et liens cassés</h2>' +
        '<div class="trio">' +
          bloc('', 'Ce qu\'ils cherchent', 'Recherches tapées dans la loupe du site.', '<ul class="liste" id="lc-rech"></ul>') +
          bloc('', 'Sans résultat', 'Ce que le site n\'a pas : des idées de contenus à créer.', '<ul class="liste" id="lc-rech-vides"></ul>') +
          bloc('lc-bloc-404', 'Pages introuvables', 'Adresses demandées qui n\'existent pas : un lien cassé quelque part.', '<ul class="liste" id="lc-404"></ul>') +
        '</div>' +
      '</section>' +
      '<div class="bulle" id="lc-bulle"></div>';

    hote.querySelector('.lc-nav').addEventListener('click', function (e) {
      var b = e.target.closest('[data-sec]'); if (!b) return;
      var cible = document.getElementById(b.dataset.sec);
      if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('#lc-rech-vides').addEventListener('click', function (e) {
      var b = e.target.closest('[data-idee]'); if (!b) return;
      if (ajouterIdee(b.dataset.idee, +b.dataset.n)) { b.textContent = 'Ajoutée'; b.disabled = true; }
    });
    segment('#lc-periodes', function (b) { etat.jours = +b.dataset.j; });
    segment('#lc-public', function (b) { etat.public = b.dataset.p; });
    $('#lc-q').addEventListener('input', function () { etat.filtre = this.value; etat.tout = false; rendrePages(); });
    $('#lc-rub').addEventListener('change', function () { etat.rub = this.value; etat.tout = false; rendrePages(); });
    $('#lc-plus').addEventListener('click', function () { etat.tout = true; rendrePages(); });
    bulles('#lc-jours');
    bulles('#lc-heures');
    bulles('#lc-semaine');
  }

  function segment(sel, choisir) {
    var boutons = document.querySelectorAll(sel + ' button');
    boutons.forEach(function (b) {
      b.addEventListener('click', function () {
        boutons.forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        choisir(b);
        etat.tout = false;
        charger();
      });
    });
  }

  function bulles(sel) {
    var zone = $(sel), bulle = $('#lc-bulle');
    zone.addEventListener('mousemove', function (e) {
      var j = e.target.closest && e.target.closest('.j');
      if (!j) { bulle.style.display = 'none'; return; }
      bulle.innerHTML = j.dataset.info;
      bulle.style.display = 'block';
      bulle.style.left = Math.min(e.clientX + 14, window.innerWidth - bulle.offsetWidth - 10) + 'px';
      bulle.style.top = (e.clientY - 44) + 'px';
    });
    zone.addEventListener('mouseleave', function () { bulle.style.display = 'none'; });
  }

  function charger() {
    etat.charge = true;
    var avant = (etat.jours > 1 && etat.jours < 365)
      ? Ad.statsLecture(etat.jours * 2, etat.public).catch(function () { return null; }) : Promise.resolve(null);
    return Promise.all([Ad.statsLecture(etat.jours, etat.public), avant]).then(function (r) {
      var d = r[0];
      etat.donnees = d || {};
      etat.avant = r[1];
      rendre();
    }).catch(function (err) {
      var s = $('#lc-stats');
      if (s) s.innerHTML = '<div class="stat" style="--c:var(--danger)"><b>!</b><span>' +
        esc(String((err && err.message) || err)) + '</span></div>';
    });
  }

  function carte(c, valeur, libelle, sous, evol) {
    return '<div class="kpi"><div class="l">' + esc(libelle) + '</div><div class="v"><b>' + esc(valeur) + '</b></div>' +
      (evol ? '<div class="e ' + evol.cls + '">' + esc(evol.t) + '</div>' : '') +
      (sous ? '<div class="e neutre">' + esc(sous) + '</div>' : '') + '</div>';
  }
  /* Évolution par rapport à la période précédente de même durée (stats sur le double de la période,
     moins la période). Rien quand la période précédente est vide (avant le début de la mesure). */
  function evolution(cle) {
    var d = etat.donnees || {}, a = etat.avant;
    if (!a) return null;
    var avant = (a[cle] || 0) - (d[cle] || 0);
    if (avant <= 0) return null;
    var v = Math.round(100 * ((d[cle] || 0) - avant) / avant);
    return { cls: v > 0 ? 'haut' : v < 0 ? 'bas' : 'neutre', t: (v > 0 ? '↑ ' : v < 0 ? '↓ ' : '') + Math.abs(v) + ' % par rapport aux ' + etat.jours + ' jours d\u2019avant' };
  }

  function rendre() {
    var d = etat.donnees || {};
    var em = document.getElementById('c-lecture');
    if (em) em.textContent = nb(d.aujourdhui);
    var periode = etat.jours === 1 ? 'aujourd\'hui' : 'sur ' + etat.jours + ' jours';
    $('#lc-stats').innerHTML =
      carte('var(--blue)', nb(d.visiteurs), 'Visiteurs', d.nouveaux ? nb(d.nouveaux) + ' venus pour la première fois' : periode) +
      carte('var(--accent)', nb(d.total), 'Pages vues', periode, evolution('total')) +
      carte('var(--pink)', nb(d.visites), 'Visites', virgule(d.pages_par_visite || 0) + ' pages par visite', evolution('visites')) +
      carte('var(--green)', duree(d.duree_moy), 'Temps moyen', 'par page · ' + duree(d.duree_totale) + ' de lecture en tout') +
      carte('var(--dim)', (d.rebond || 0) + ' %', 'Partis aussitôt', 'visites d\'une seule page');
    $('#lc-robots').innerHTML = d.robots
      ? '<b>' + nb(d.robots) + ' visiteur' + (d.robots > 1 ? 's' : '') + '</b> écarté' + (d.robots > 1 ? 's' : '') +
        ' comme robots probables (' + nb(d.robots_vues) + ' page' + (d.robots_vues > 1 ? 's' : '') + ') : aucun geste sur la page ' +
        '(ni défilement, ni toucher, ni clic, ni souris), pas connecté, aucune recherche. Les robots déclarés (Google, Bing…) ne sont pas comptés du tout.'
      : 'Les robots ne sont pas comptés : ni les robots déclarés (Google, Bing…), ni les visiteurs sans aucun geste sur la page.';
    $('#lc-bloc-jours').style.display = etat.jours === 1 ? 'none' : '';
    rendreComparaison(d);
    rendreJours(d);
    rendrePremium(d);
    rendreSources(d);
    rendreEntrees(d);
    rendreRubriques(d);
    rendreAppareils(d);
    rendreHeures(d);
    rendreSemaine(d);
    rendreRecherches(d);
    rendre404(d);
    rendreSelect(d);
    rendrePages();
  }

  function rendreComparaison(d) {
    var g = { sans: {}, membres: {} };
    (d.groupes || []).forEach(function (x) { g[x.membre ? 'membres' : 'sans'] = x; });
    var vs = (g.sans.visiteurs || 0), vm = (g.membres.visiteurs || 0);
    var tot = vs + vm;
    $('#lc-phrase').innerHTML = tot
      ? '<b>' + pc(vs, tot) + ' %</b> des visiteurs n\'avaient pas de compte (' + nb(vs) + ' sur ' + nb(tot) + ').'
      : 'Pas encore de visite sur cette période.';
    $('#lc-part').innerHTML = tot
      ? '<i style="width:' + pc(vs, tot) + '%;background:' + C_SANS + '"></i><i style="width:' + (100 - pc(vs, tot)) + '%;background:' + C_MEMBRES + '"></i>'
      : '';
    function col(nom, c, x) {
      var ppv = x.visites ? Math.round(10 * x.vues / x.visites) / 10 : 0;
      return '<div class="vs-c" style="--c:' + c + '"><h4>' + nom + '</h4><dl>' +
        '<dt>Visiteurs</dt><dd class="gros">' + nb(x.visiteurs) + '</dd>' +
        '<dt>Pages vues</dt><dd>' + nb(x.vues) + '</dd>' +
        '<dt>Pages par visite</dt><dd>' + (ppv ? virgule(ppv) : '—') + '</dd>' +
        '<dt>Temps moyen par page</dt><dd>' + duree(x.duree_moy) + '</dd>' +
        '<dt>Sur téléphone</dt><dd>' + (x.vues ? (x.mobile || 0) + ' %' : '—') + '</dd>' +
        '</dl></div>';
    }
    $('#lc-vs').innerHTML = col('Sans compte', C_SANS, g.sans) + col('Membres', C_MEMBRES, g.membres);
  }

  function rendreJours(d) {
    var index = {};
    (d.par_jour || []).forEach(function (j) { index[j.jour] = j; });
    var jours = [], auj = new Date(); auj.setHours(12, 0, 0, 0);
    for (var i = etat.jours - 1; i >= 0; i--) {
      var t = new Date(auj); t.setDate(auj.getDate() - i);
      var x = index[cleJour(t)] || { vues: 0, vues_membres: 0, vues_sans: 0, visiteurs: 0 };
      jours.push({ date: t, vues: x.vues, m: x.vues_membres, s: x.vues_sans, visiteurs: x.visiteurs });
    }
    var max = Math.max.apply(null, jours.map(function (j) { return j.vues; }).concat([1]));
    $('#lc-jours').innerHTML = jours.map(function (j) {
      var info = '<b>' + jourCourt(j.date) + '</b> · ' + nb(j.vues) + ' pages vues (' + nb(j.s) + ' sans compte) · ' +
        nb(j.visiteurs) + ' visiteur' + (j.visiteurs > 1 ? 's' : '');
      return '<div class="j" data-info="' + esc(info) + '">' +
        (j.vues ? (j.s ? '<i class="s" style="height:' + (j.s / max * 100) + '%"></i>' : '') +
                  (j.m ? '<i class="m" style="height:' + (j.m / max * 100) + '%"></i>' : '')
                : '<i class="vide"></i>') +
        '</div>';
    }).join('');
    var milieu = jours[Math.floor(jours.length / 2)];
    $('#lc-axe').innerHTML = '<span>' + jourCourt(jours[0].date) + '</span>' +
      (jours.length > 2 ? '<span>' + jourCourt(milieu.date) + '</span>' : '') +
      '<span>' + jourCourt(jours[jours.length - 1].date) + '</span>';
  }

  function ch(valeur, libelle, sous) {
    return '<div class="ch"><b>' + esc(valeur) + '</b><span>' + esc(libelle) + '</span>' + (sous ? '<small>' + esc(sous) + '</small>' : '') + '</div>';
  }

  function rendrePremium(d) {
    var p = d.premium || {};
    var et = [
      [p.murs_visiteurs, 'visiteurs arrêtés par un contenu réservé', nb(p.murs) + ' murs Premium vus, dont ' + nb(p.murs_sans_compte) + ' sans compte'],
      [p.tarifs_visiteurs, 'ont ouvert la page Tarifs', nb(p.tarifs) + ' visites'],
      [p.clics_visiteurs, 'ont cliqué sur « payer »', (p.clics_detail || []).map(function (c) { return c.detail + ' : ' + nb(c.n); }).join(' · ')]
    ];
    var max = Math.max.apply(null, et.map(function (x) { return x[0] || 0; }).concat([1]));
    $('#lc-prem').innerHTML = '<div class="entonnoir">' + et.map(function (x, i) {
      var precedent = i ? et[i - 1][0] : 0;
      return '<div class="et"><div class="barre"><i style="height:' + Math.max(4, Math.round(100 * (x[0] || 0) / max)) + '%;opacity:' + (1 - i * .18) + '"></i></div>' +
        '<b>' + nb(x[0]) + '</b><span>' + esc(x[1]) + '</span>' +
        '<small>' + (i && precedent ? pc(x[0], precedent) + ' % du nombre de l’étape d’avant' : esc(x[2] || ' ')) + '</small></div>';
    }).join('') + '</div>' +
      '<p class="prem-plus"><b style="color:var(--text);font-weight:600">' + nb(p.inscriptions) + '</b> inscription' + (p.inscriptions > 1 ? 's' : '') +
      ' sur la période · <b style="color:var(--text);font-weight:600">' + nb(p.connexion) + '</b> visiteur' + (p.connexion > 1 ? 's' : '') +
      ' sans compte passé' + (p.connexion > 1 ? 's' : '') + ' par la page de connexion.</p>';
    var l = p.pages || [];
    $('#lc-prem-pages').innerHTML = l.length ? l.map(function (x) {
      return '<li><a href="' + esc(base + x.page) + '" target="_blank" rel="noopener">' + esc(x.titre || x.page) + '</a>' +
        '<span><b>' + nb(x.n) + '</b> fois · ' + nb(x.visiteurs) + ' visiteur' + (x.visiteurs > 1 ? 's' : '') + '</span></li>';
    }).join('') : '<li class="rien" style="display:block">Aucun mur Premium sur cette période.</li>';
  }

  function barres(sel, liste, total, unite) {
    var max = liste.length ? Math.max.apply(null, liste.map(function (x) { return x.v; })) : 1;
    $(sel).innerHTML = liste.length ? liste.map(function (x, i) {
      return '<div class="rub"><div class="l"><em>' + esc(x.nom) + '</em><span>' + nb(x.v) + (unite ? ' ' + unite : '') +
        (total ? ' · ' + pc(x.v, total) + ' %' : '') + '</span></div>' +
        '<div class="b"><i style="width:' + Math.max(2, Math.round(100 * x.v / (max || 1))) + '%;background:' + (x.c || COULEURS[i % COULEURS.length]) + '"></i></div></div>';
    }).join('') : '<div class="rien">Rien pour l\'instant.</div>';
  }

  function rendreSources(d) {
    var l = (d.sources || []).map(function (s) { return { nom: s.source, v: s.visites }; });
    var tot = l.reduce(function (a, x) { return a + x.v; }, 0);
    barres('#lc-sources', l.slice(0, 12), tot, 'visites');
  }

  function rendreEntrees(d) {
    var l = d.entrees || [];
    $('#lc-entrees').innerHTML = l.length ? l.map(function (x) {
      return '<li><a href="' + esc(base + x.page) + '" target="_blank" rel="noopener">' + esc(titrePage(x)) + '</a>' +
        '<span><b>' + nb(x.visites) + '</b></span></li>';
    }).join('') : '<li class="rien" style="display:block">Rien pour l\'instant.</li>';
  }

  function rendreRubriques(d) {
    var tot = {};
    (d.pages || []).forEach(function (p) {
      var g = rubrique(p.page).grande;
      tot[g] = (tot[g] || 0) + p.vues;
    });
    var liste = GRANDES.map(function (g, i) { return { nom: g, v: tot[g] || 0, c: COULEURS[i] }; })
      .filter(function (x) { return x.v; })
      .sort(function (a, b) { return b.v - a.v; });
    barres('#lc-rubs', liste, d.total || 0, '');
  }

  function rendreAppareils(d) {
    var total = d.total || 0;
    var l = [
      { nom: 'Téléphone', v: d.mobile || 0, c: '#7c9ec9' },
      { nom: 'Ordinateur', v: total - (d.mobile || 0), c: '#c8a96e' }
    ].filter(function (x) { return x.v; });
    var sys = (d.systemes || []).map(function (s, i) { return { nom: s.systeme, v: s.visiteurs, c: COULEURS[(i + 3) % COULEURS.length] }; });
    var totSys = sys.reduce(function (a, x) { return a + x.v; }, 0);
    barres('#lc-appareils', l, total, 'pages');
    if (!total) return;
    var h = $('#lc-appareils');
    var tmp = document.createElement('div');
    tmp.id = 'lc-sys';
    h.insertAdjacentHTML('beforeend', '<div class="sous-t" style="padding:10px 0 0">Systèmes (visiteurs)</div>');
    h.appendChild(tmp);
    barres('#lc-sys', sys, totSys, '');
    tmp.style.display = 'flex'; tmp.style.flexDirection = 'column'; tmp.style.gap = '12px';
    h.insertAdjacentHTML('beforeend', '<div class="sous-t" style="padding:10px 0 0">Application installée</div>' +
      '<div class="rub"><div class="l"><em>Visiteurs qui ont ajouté le site à leur écran d\'accueil</em><span>' + nb(d.appli) + ' · ' +
      pc(d.appli, d.visiteurs) + ' %</span></div></div>');
  }

  function histo(sel, valeurs, libelle) {
    var max = Math.max.apply(null, valeurs.concat([1]));
    $(sel).innerHTML = valeurs.map(function (v, i) {
      return '<div class="j" data-info="' + esc('<b>' + libelle(i) + '</b> · ' + nb(v) + ' page' + (v > 1 ? 's' : '') + ' vue' + (v > 1 ? 's' : '')) + '">' +
        '<i style="height:' + Math.round(v / max * 100) + '%"></i></div>';
    }).join('');
  }
  function rendreHeures(d) {
    var h = []; for (var i = 0; i < 24; i++) h.push(0);
    (d.par_heure || []).forEach(function (x) { h[x.heure] = x.vues; });
    histo('#lc-heures', h, function (i) { return i + ' h – ' + (i + 1) + ' h'; });
  }
  function rendreSemaine(d) {
    var h = [0, 0, 0, 0, 0, 0, 0];
    (d.par_semaine || []).forEach(function (x) { h[x.jour - 1] = x.vues; });
    histo('#lc-semaine', h, function (i) { return ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][i]; });
  }

  function rendreRecherches(d) {
    var l = d.recherches || [];
    $('#lc-rech').innerHTML = l.length ? l.map(function (x) {
      return '<li><em>' + esc(x.q) + '</em><span><b>' + nb(x.n) + '</b> fois · ' + nb(x.resultats) + ' résultat' + (x.resultats > 1 ? 's' : '') + '</span></li>';
    }).join('') : '<li class="rien" style="display:block">Aucune recherche sur cette période.</li>';
    var v = d.recherches_vides || [];
    var deja = titresIdees();
    $('#lc-rech-vides').innerHTML = v.length ? v.map(function (x) {
      var dans = deja[titreIdee(x.q).toLowerCase()];
      return '<li><em>' + esc(x.q) + '</em><span><b>' + nb(x.n) + '</b> fois' +
        '<button type="button" class="mini or" data-idee="' + esc(x.q) + '" data-n="' + (x.n || 0) + '"' + (dans ? ' disabled>Dans les idées' : '>Ajouter aux idées') + '</button></span></li>';
    }).join('') : '<li class="rien" style="display:block">Aucune recherche sans résultat.</li>';
  }

  /* Idées pour le site (idees-articles.html, localStorage « ecg-articles ») */
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
      note: 'Recherche tapée ' + n + ' fois dans la loupe du site, sans aucun résultat (statistiques, ' + new Date().toLocaleDateString('fr-FR') + ').',
      link: '', sec: 'autre', sub: 'autre', prio: 'med', done: false, date: new Date().toISOString() });
    try { localStorage.setItem('ecg-articles', JSON.stringify(l)); }
    catch (e) { return false; }
    var t = document.getElementById('toast');
    if (t) { t.textContent = 'Ajoutée aux idées pour le site.'; t.className = 'show ok'; clearTimeout(t._h); t._h = setTimeout(function () { t.className = ''; }, 3600); }
    return true;
  }

  function rendre404(d) {
    var l = d.introuvables || [];
    $('#lc-bloc-404').style.display = l.length ? '' : 'none';
    $('#lc-404').innerHTML = l.map(function (x) {
      return '<li><em>' + esc(x.page) + '</em><span><b>' + nb(x.vues) + '</b> fois</span></li>';
    }).join('');
  }

  function rendreSelect(d) {
    var fines = {};
    (d.pages || []).forEach(function (p) { fines[rubrique(p.page).fine] = 1; });
    var sel = $('#lc-rub');
    var garde = etat.rub;
    sel.innerHTML = '<option value="">Toutes les rubriques</option>' +
      Object.keys(fines).sort(function (a, b) { return a.localeCompare(b, 'fr'); }).map(function (f) {
        return '<option value="' + esc(f) + '"' + (f === garde ? ' selected' : '') + '>' + esc(f) + '</option>';
      }).join('');
    if (garde && !fines[garde]) etat.rub = '';
  }

  function sansAccents(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function rendrePages() {
    var d = etat.donnees || {};
    var q = sansAccents(etat.filtre.trim());
    var couleur = {};
    GRANDES.forEach(function (g, i) { couleur[g] = COULEURS[i]; });
    var liste = (d.pages || []).filter(function (p) {
      var r = rubrique(p.page);
      if (etat.rub && r.fine !== etat.rub) return false;
      if (q && sansAccents(titrePage(p) + ' ' + p.page).indexOf(q) === -1) return false;
      return true;
    });
    var montrees = etat.tout ? liste : liste.slice(0, PAR_PAGE);
    $('#lc-pages').innerHTML = montrees.map(function (p) {
      var r = rubrique(p.page);
      return '<tr>' +
        '<td class="pg"><a href="' + esc(base + p.page) + '" target="_blank" rel="noopener">' + esc(titrePage(p)) + '</a>' +
          '<span class="mono">' + esc(p.page) + '</span></td>' +
        '<td class="rg"><i style="background:' + (couleur[r.grande] || 'var(--dim)') + '"></i>' + esc(r.fine) + '</td>' +
        '<td class="num vues">' + nb(p.vues) + '</td>' +
        '<td class="num sans">' + nb(p.sans_compte) + '</td>' +
        '<td class="num">' + nb(p.visiteurs) + '</td>' +
        '<td class="num">' + duree(p.duree_moy) + '</td>' +
        '<td class="num"><span class="jauge"><i style="width:' + (p.bout || 0) + '%"></i></span>' + (p.bout || 0) + ' %</td>' +
        '</tr>';
    }).join('');
    var vide = $('#lc-vide');
    if (!liste.length) {
      vide.style.display = 'block';
      vide.textContent = (d.pages || []).length
        ? 'Aucune page ne correspond.'
        : 'Aucune page vue sur cette période. La mesure a démarré le ' + DEBUT_MESURE + ' : les chiffres arrivent au fil des visites.';
    } else vide.style.display = 'none';
    var plus = $('#lc-plus');
    if (!etat.tout && liste.length > PAR_PAGE) {
      plus.style.display = 'block';
      plus.textContent = 'Afficher les ' + nb(liste.length) + ' pages';
    } else plus.style.display = 'none';
  }

  function demarrer(profil) {
    if (!profil || profil.role !== 'admin' || !document.getElementById('p-lecture')) return;
    var go = function () {
      batir();
      if (!etat.charge) charger();
    };
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

  window.ECGLectureAdmin = { rafraichir: charger, titre: titrePage, rubrique: rubrique };
})();
