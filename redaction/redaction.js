/* ═══════════════════════════════════════════════════════════════
   ECG Prépa — Espace rédaction : outils communs
   (redaction.html, redaction-editeur.html, admin-redaction.html)

   · les gabarits d'article et de fiche de culture générale, avec le
     CSS réel des pages du site (copié d'un article mondial récent et
     d'une fiche de CG) ;
   · la construction de la page complète, pour l'éditeur et pour le
     fichier HTML que l'administrateur télécharge avant la mise en ligne.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CSS_ARTICLE = `
  :root {
    --bg: #0d0d0f;
    --surface: #16161a;
    --surface2: #1e1e24;
    --border: #2a2a35;
    --accent: #00693c;
    --text: #e8e6e0;
    --text-dim: #8a8880;
    --text-faint: #4a4845;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }

  .bg-orb { position: fixed; border-radius: 50%; filter: blur(140px); pointer-events: none; opacity: 0.09; z-index: 0; }
  .orb1 { width: 700px; height: 700px; background: #b5131f; top: -300px; right: -250px; }
  .orb2 { width: 600px; height: 600px; background: #ffd700; bottom: -250px; left: -250px; }
  .orb3 { width: 400px; height: 400px; background: #003087; top: 40%; left: 30%; opacity: 0.05; }

  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 48px; border-bottom: 1px solid var(--border);
    background: rgba(13,13,15,0.9); backdrop-filter: blur(16px);
    position: sticky; top: 0; z-index: 100;
  }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #7ca8c9; cursor: pointer; letter-spacing: 0.02em; }
  .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-dim); flex-wrap: wrap; }
  .breadcrumb a { color: var(--text-dim); text-decoration: none; transition: color 0.2s; }
  .breadcrumb a:hover { color: #7ca8c9; }
  .breadcrumb .sep { color: var(--text-faint); }
  .breadcrumb .current { color: var(--text); }

  .ap-band { position: relative; z-index: 1; background: #b5131f; text-align:center; padding:6px 0; font-family:'DM Mono',monospace; font-size:10px; text-transform:uppercase; color:#fff; letter-spacing: 0.25em; }
  .ap-back-bar { background: rgba(0,15,40,0.95); padding:12px 60px; border-bottom: 1px solid rgba(255,215,0,0.12); }
  .ap-back-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.55); font-family:'DM Mono',monospace; font-size:10px; letter-spacing:1px; text-transform:uppercase; display:flex; align-items:center; gap:6px; padding:0; transition:color .2s; text-decoration:none; }
  .ap-back-btn:hover { color:#ffd700; }
  .ap-back-btn::before { content:'←'; font-size:13px; }
  .ap-main { max-width:1080px; margin:0 auto; padding:40px 36px 80px; position:relative; z-index:1; }
  .ap-card { background: #13161f; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,215,0,0.2); box-shadow: 0 32px 80px rgba(0,0,0,0.6); }
  .ap-hero-img-wrap { width:100%; overflow:hidden; aspect-ratio: 16/7; position: relative; }
  .ap-hero-img-wrap::after { content:''; position:absolute; inset:0; background: linear-gradient(to bottom, transparent 40%, rgba(19,22,31,0.85) 100%); }
  .ap-hero-img { width:100%; height:100%; object-fit:cover; display:block; }


  .ap-header { padding: 32px 40px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .ap-tags { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
  .ap-tag { display:inline-block; font-family:'DM Mono',monospace; font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:4px 10px; border-radius:3px; }
  .ap-tag-red    { background:rgba(181,19,31,0.2);  color:#f08080; border:1px solid rgba(181,19,31,0.35); }
  .ap-tag-navy   { background:rgba(0,48,135,0.4);   color:#8ab0d4; border:1px solid rgba(100,140,180,0.25); }
  .ap-tag-gold   { background:rgba(180,146,42,0.15); color:#d4af5a; border:1px solid rgba(212,175,90,0.3); }
  .ap-tag-teal   { background:rgba(0,105,92,0.2);   color:#4db6ac; border:1px solid rgba(77,182,172,0.3); }
  .ap-tag-purple { background:rgba(106,27,154,0.2); color:#ce93d8; border:1px solid rgba(206,147,216,0.3); }
  .ap-tag-blue   { background:rgba(21,101,192,0.2); color:#64b5f6; border:1px solid rgba(100,181,246,0.3); }
  .ap-tag-green  { background:rgba(46,125,50,0.2);  color:#81c784; border:1px solid rgba(129,199,132,0.3); }
  .ap-tag-orange { background:rgba(191,91,0,0.25);  color:#ffb74d; border:1px solid rgba(255,183,77,0.35); }

  .ap-date { font-family:'DM Mono',monospace; font-size:10px; color:rgba(255,255,255,0.3); margin-bottom:12px; letter-spacing:0.08em; }
  .ap-title { font-family:'Playfair Display',serif; font-size:28px; font-weight:900; line-height:1.25; color:#e8e4d8; margin-bottom:16px; }
  .ap-intro { font-family:'Georgia',serif; font-size:15px; color:rgba(232,228,216,0.65); line-height:1.7; font-style:italic; border-left:3px solid #ffd700; padding-left:18px; }
  .ap-body { padding:36px 40px 48px; }
  .ap-body p { font-family:'Georgia',serif; font-size:14.5px; color:rgba(232,228,216,0.75); margin-bottom:14px; line-height:1.78; }
  .ap-footer { background: rgba(5,8,14,0.8); color:rgba(255,255,255,.35); text-align:center; padding:22px 40px; font-family:'DM Mono',monospace; font-size:11px; border-top:1px solid rgba(255,215,0,0.12); letter-spacing:0.05em; }
  .ap-footer strong { color:rgba(255,215,0,0.7); }

  .ap-cols { display:grid; grid-template-columns:1fr 1fr; gap:48px; margin-top:30px; }
  .ap-sub { font-family:'DM Mono',monospace; font-size:9px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:#ffd700; margin:26px 0 10px; padding-bottom:8px; border-bottom:1px solid rgba(255,215,0,0.2); }
  .ap-stats { display:flex; gap:10px; flex-wrap:wrap; margin:20px 0; }
  .ap-stat { background:linear-gradient(135deg,#071422,#0d2540); color:#fff; padding:16px 18px; border-radius:8px; text-align:center; flex:1; min-width:110px; border:1px solid rgba(255,255,255,0.08); box-shadow:0 4px 16px rgba(0,0,0,0.4); }
  .ap-stat.gold   { background:linear-gradient(135deg,#7a5c10,#b8922a); }
  .ap-stat.orange { background:linear-gradient(135deg,#7a3000,#b85a00); }
  .ap-stat.green  { background:linear-gradient(135deg,#00430c,#00691c); }
  .ap-stat.navy   { background:linear-gradient(135deg,#001a4a,#003087); }
  .ap-stat.red    { background:linear-gradient(135deg,#4a0509,#7a0f16); }
  .ap-stat-num  { font-size:22px; font-weight:700; font-family:'DM Mono',monospace; display:block; line-height:1.15; }
  .ap-stat-desc { font-size:10px; opacity:.8; font-family:'DM Mono',monospace; margin-top:4px; display:block; line-height:1.4; }
  .ap-quote { background:linear-gradient(135deg,rgba(255,215,0,0.06),rgba(255,215,0,0.02)); border-left:3px solid #ffd700; padding:18px 22px; margin:20px 0; border-radius:0 8px 8px 0; border:1px solid rgba(255,215,0,0.12); }
  .ap-quote p    { font-family:'Georgia',serif; font-size:14.5px; font-style:italic; color:rgba(232,228,216,0.8); margin:0 0 8px !important; line-height:1.65; }
  .ap-quote cite { font-family:'DM Mono',monospace; font-size:10px; color:rgba(255,215,0,0.7); font-style:normal; letter-spacing:0.06em; }
  .ap-ctx { background:linear-gradient(135deg,rgba(0,15,40,0.9),rgba(0,8,24,0.95)); color:#fff; border-radius:10px; padding:22px 24px; margin-top:24px; border:1px solid rgba(255,215,0,0.25); box-shadow:inset 0 1px 0 rgba(255,255,255,0.05); }
  .ap-ctx-label { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:#ffd700; margin-bottom:10px; font-weight:700; }
  .ap-ctx p     { font-family:'Georgia',serif; font-size:13.5px; color:rgba(255,255,255,.75); line-height:1.7; margin:0; }
  .ap-ctx p + p { margin-top:10px; }
  .ap-info { background:rgba(255,215,0,0.05); border:1px solid rgba(255,215,0,0.15); border-radius:8px; padding:16px 20px; margin:18px 0; display:flex; align-items:flex-start; gap:14px; }
  .ap-info-icon { font-size:26px; flex-shrink:0; margin-top:2px; }
  .ap-info-text { font-family:'Georgia',serif; font-size:13.5px; color:rgba(232,228,216,0.7); line-height:1.65; }
  .ap-info-text strong { color:#e8e4d8; }
  .ap-tl { margin:16px 0; border-left:2px solid rgba(255,215,0,0.3); padding-left:20px; }
  .ap-tl-item { margin-bottom:16px; position:relative; }
  .ap-tl-item::before { content:''; position:absolute; left:-26px; top:5px; width:8px; height:8px; border-radius:50%; background:#ffd700; border:2px solid #13161f; box-shadow:0 0 0 2px rgba(255,215,0,0.4); }
  .ap-tl-date { font-family:'DM Mono',monospace; font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#ffd700; margin-bottom:3px; }
  .ap-tl-text { font-family:'Georgia',serif; font-size:13.5px; color:rgba(232,228,216,0.65); line-height:1.6; margin:0; }
  .ap-table { width:100%; border-collapse:collapse; margin:16px 0; font-family:'DM Mono',monospace; font-size:12px; border-radius:8px; overflow:hidden; }
  .ap-table thead tr { background:rgba(0,15,40,0.95); }
  .ap-table thead th { padding:10px 14px; text-align:left; font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.6); }
  .ap-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.05); }
  .ap-table tbody tr:nth-child(even) { background:rgba(255,255,255,0.02); }
  .ap-table tbody td { padding:9px 14px; color:rgba(232,228,216,0.7); }
  .ap-cell-bold { font-weight:600; color:#e8e4d8; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeUp 0.25s ease forwards; }

  @media (max-width:768px) {
    nav { padding: 14px 20px; }
    .ap-cols { grid-template-columns:1fr; gap:0; }
    .ap-back-bar { padding:10px 20px; }
    .ap-main { padding:20px 12px 60px; }
    .ap-header { padding:24px 20px; }
    .ap-body { padding:24px 20px; }
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }
`;

  var CSS_CG = `
  :root{
    --kraft:#e6ddd0; --paper:#f4eee3; --paper2:#ebe1d0; --ink:#2a1e17; --ink-dim:#5e4a3d; --ink-faint:#9a8878;
    --rule:#cdbba3; --stamp:#a8261c; --ledger:#4f3a12;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    background:var(--kraft); color:var(--ink); font-family:'Newsreader',Georgia,serif;
    padding:8px 16px 60px; overflow-x:hidden;
    background-image:
      radial-gradient(ellipse at 15% 10%, rgba(255,255,255,0.3), transparent 55%),
      radial-gradient(ellipse at 90% 85%, rgba(0,0,0,0.05), transparent 50%);
  }
  nav{width:100%; margin:0 auto 22px; display:flex; align-items:center; justify-content:space-between; padding:18px 24px; box-sizing:border-box; background:var(--paper2); border-bottom:1px solid var(--rule); position:sticky; top:0; z-index:100}
  .nav-logo{font-family:'Fraunces',serif; font-size:1.1rem; font-weight:700; color:var(--stamp); cursor:pointer}
  .breadcrumb{display:flex; align-items:center; gap:8px; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--ink-dim); flex-wrap:wrap}
  .breadcrumb a{color:var(--ink-dim); text-decoration:none}
  .breadcrumb a:hover{color:var(--stamp)}
  .breadcrumb .sep{color:var(--ink-faint)}
  .breadcrumb .current{color:var(--ink)}
  .card{
    max-width:1000px; margin:0 auto; background:var(--paper);
    border:1px solid var(--rule); position:relative;
    box-shadow:0 1px 0 rgba(255,255,255,0.5) inset, 0 18px 40px rgba(42,30,23,0.18);
  }
  .tab{
    position:absolute; top:-16px; left:36px; background:var(--paper);
    border:1px solid var(--rule); border-bottom:none;
    padding:6px 16px 10px; font-family:'IBM Plex Mono',monospace; font-size:10px;
    letter-spacing:0.14em; text-transform:uppercase; color:var(--ink-dim);
  }
  .stamp{
    position:absolute; top:34px; right:34px; width:76px; height:76px;
    border:2px solid var(--stamp); border-radius:50%;
    display:flex; align-items:center; justify-content:center; text-align:center;
    transform:rotate(-8deg); opacity:0.85; background:var(--paper);
  }
  .stamp span{
    font-family:'IBM Plex Mono',monospace; font-size:8.5px; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase; color:var(--stamp); line-height:1.4;
  }
  .head{padding:54px 48px 30px; border-bottom:1px dashed var(--rule)}
  .catno{font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ledger); letter-spacing:0.08em; margin-bottom:18px}
  .catno b{color:var(--ink)}
  h1{font-family:'Fraunces',serif; font-weight:700; font-size:32px; line-height:1.18; margin-bottom:16px; text-wrap:balance; max-width:560px}
  .intro{font-size:15px; line-height:1.75; color:var(--ink-dim); font-style:italic; border-left:2px solid var(--stamp); padding-left:16px; max-width:660px}
  .stats{display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--rule); border-top:1px dashed var(--rule); border-bottom:1px dashed var(--rule)}
  .stat{background:var(--paper2); padding:18px 14px; text-align:center}
  .stat-num{font-family:'Fraunces',serif; font-weight:700; font-size:22px; color:var(--stamp); display:block; margin-bottom:4px}
  .stat-desc{font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:0.04em; color:var(--ink-dim); line-height:1.4}
  .body{padding:36px 48px 46px}
  .cols{display:grid; grid-template-columns:1fr 1fr; gap:44px}
  .sub{font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:var(--stamp); margin:26px 0 10px; padding-bottom:7px; border-bottom:1px solid var(--rule)}
  .sub:first-child{margin-top:0}
  p{font-size:14.5px; line-height:1.78; color:var(--ink); margin-bottom:13px}
  em{color:var(--ledger); font-style:italic}
  .quote{background:rgba(42,30,23,0.045); border-left:2px solid var(--stamp); padding:16px 20px; margin:20px 0; border-radius:0 6px 6px 0}
  .quote p{margin:0 0 7px; font-size:14.5px; font-style:italic}
  .quote cite{font-family:'IBM Plex Mono',monospace; font-size:10px; color:var(--stamp); font-style:normal; letter-spacing:0.04em}
  .note{background:var(--paper2); border:1px solid var(--rule); border-radius:6px; padding:15px 18px; margin:18px 0; display:flex; gap:13px; align-items:flex-start}
  .note-icon{font-size:22px; flex-shrink:0; margin-top:1px}
  .note-text{font-size:13px; line-height:1.65; color:var(--ink-dim)}
  .note-text strong{color:var(--ink)}
  .tl{margin:18px 0 6px; border-left:2px dashed var(--rule); padding-left:20px}
  .tl-item{margin-bottom:16px; position:relative}
  .tl-item::before{content:''; position:absolute; left:-26px; top:5px; width:8px; height:8px; border-radius:50%; background:var(--stamp); border:2px solid var(--paper); box-shadow:0 0 0 1px var(--rule)}
  .tl-date{font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--stamp); margin-bottom:3px}
  .tl-text{font-size:13.5px; color:var(--ink-dim); line-height:1.6; margin:0}
  .ctx{ background:linear-gradient(160deg,#7a1a14,#1a0a07); color:#f4eee3; border-radius:8px; padding:24px 26px; margin-top:26px; border:1px solid var(--stamp); }
  .ctx-label{font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:0.2em; text-transform:uppercase; color:#ffd27a; margin-bottom:10px; font-weight:600}
  .ctx p{font-family:'Newsreader',serif; font-size:13.5px; color:rgba(244,238,227,0.9); line-height:1.7; margin:0}
  .ctx p + p{margin-top:10px}
  .foot{border-top:1px dashed var(--rule); padding:16px 48px; display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:var(--ink-dim); letter-spacing:0.05em}
  .table{width:100%; border-collapse:collapse; margin:16px 0; font-family:'IBM Plex Mono',monospace; font-size:12px}
  .table thead tr{background:var(--paper2)}
  .table th{padding:9px 12px; text-align:left; font-size:9.5px; letter-spacing:0.14em; text-transform:uppercase; color:var(--stamp); border-bottom:1px solid var(--rule)}
  .table td{padding:8px 12px; color:var(--ink-dim); border-bottom:1px dashed var(--rule)}
  .table td.b{font-weight:600; color:var(--ink)}
  @media(max-width:768px){
    .cols{grid-template-columns:1fr}
    .stats{grid-template-columns:repeat(2,1fr)}
    .head{padding:48px 24px 24px}
    .body{padding:24px 24px 32px}
    .foot{padding:14px 24px}
    .stamp{width:58px; height:58px; top:22px; right:20px}
    h1{font-size:26px; max-width:100%}
    nav{padding:14px 16px}
  }
`;

  /* ─── Éditions et statuts ─── */
  var EDITIONS = {
    monde: { nom: 'Mondiale',     court: 'Monde',    drapeau: '🌐', langue: null },
    en:    { nom: 'Anglophone',   court: 'Anglais',  drapeau: '🇬🇧', langue: 'en', bouton: '🇬🇧 EN', nomLangue: 'anglais' },
    es:    { nom: 'Hispanophone', court: 'Espagnol', drapeau: '🇪🇸', langue: 'es', bouton: '🇪🇸 ES', nomLangue: 'espagnol' },
    de:    { nom: 'Germanophone', court: 'Allemand', drapeau: '🇩🇪', langue: 'de', bouton: '🇩🇪 DE', nomLangue: 'allemand' }
  };

  var STATUTS = {
    disponible: { l: 'Disponible',            c: '#7c9ec9' },
    en_cours:   { l: 'En cours de rédaction', c: '#c8a96e' },
    soumis:     { l: 'Soumis — à relire',     c: '#c97c9e' },
    a_revoir:   { l: 'À revoir',              c: '#e08a8a' },
    valide:     { l: 'Validé',                c: '#9ecba0' },
    publie:     { l: 'Publié',                c: '#8a8880' }
  };

  var MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function moisCourant() { var d = new Date(); return MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
  function slug(t) {
    return String(t || 'article').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'article';
  }
  function libelleType(s) {
    if (s.type === 'cg') return '🧠 Culture générale';
    var e = EDITIONS[s.edition] || EDITIONS.monde;
    return e.drapeau + ' Actualité ' + e.nom.toLowerCase();
  }
  function edite(s) { return s.type !== 'cg' ? (EDITIONS[s.edition] || EDITIONS.monde) : null; }

  /* ─── Blocs prêts à insérer (mêmes classes que les pages du site) ─── */
  var BLOCS = {
    article: {
      sub:   '<div class="ap-sub">Nouvelle rubrique</div>',
      p:     '<p>Nouveau paragraphe.</p>',
      quote: '<div class="ap-quote"><p>« Citation exacte, avec sa source. »</p><cite>— Auteur, fonction, date</cite></div>',
      info:  '<div class="ap-info"><div class="ap-info-icon">💡</div><div class="ap-info-text"><strong>À retenir :</strong> texte de l\'encadré.</div></div>',
      table: '<table class="ap-table"><thead><tr><th>Colonne 1</th><th>Colonne 2</th></tr></thead><tbody>' +
             '<tr><td class="ap-cell-bold">Ligne 1</td><td>Valeur</td></tr><tr><td class="ap-cell-bold">Ligne 2</td><td>Valeur</td></tr></tbody></table>',
      tl:    '<div class="ap-tl">' + tlItem('ap-', 'Date la plus récente') + tlItem('ap-', 'Date plus ancienne') + '</div>',
      tlItem: tlItem('ap-', 'Date'),
      ctx:   '<div class="ap-ctx"><div class="ap-ctx-label">Titre d\'analyse</div><p>Texte de l\'encadré de fin.</p></div>',
      stats: '<div class="ap-stats">' + stat('ap-', 'red') + stat('ap-', 'gold') + stat('ap-', 'green') + stat('ap-', 'navy') + '</div>',
      stat:  stat('ap-', 'navy'),
      tag:   '<span class="ap-tag ap-tag-blue">Tag</span>'
    },
    cg: {
      sub:   '<div class="sub">Nouvelle rubrique</div>',
      p:     '<p>Nouveau paragraphe.</p>',
      quote: '<div class="quote"><p>« Citation exacte, avec sa source. »</p><cite>— Auteur, œuvre, date</cite></div>',
      info:  '<div class="note"><div class="note-icon">💡</div><div class="note-text"><strong>À retenir :</strong> texte de l\'encadré.</div></div>',
      table: '<table class="table"><thead><tr><th>Colonne 1</th><th>Colonne 2</th></tr></thead><tbody>' +
             '<tr><td class="b">Ligne 1</td><td>Valeur</td></tr><tr><td class="b">Ligne 2</td><td>Valeur</td></tr></tbody></table>',
      tl:    '<div class="tl">' + tlItem('', 'Date') + tlItem('', 'Date') + '</div>',
      tlItem: tlItem('', 'Date'),
      ctx:   '<div class="ctx"><div class="ctx-label">Titre d\'analyse</div><p>Texte de l\'encadré de fin.</p></div>',
      stats: '<div class="stats">' + stat('', '') + stat('', '') + stat('', '') + stat('', '') + '</div>',
      stat:  stat('', '')
    }
  };
  function tlItem(p, date) {
    return '<div class="' + p + 'tl-item"><div class="' + p + 'tl-date">' + date + '</div><p class="' + p + 'tl-text">Ce qui s\'est passé.</p></div>';
  }
  function stat(p, couleur) {
    return '<div class="' + p + 'stat' + (couleur ? ' ' + couleur : '') + '"><span class="' + p + 'stat-num">Chiffre</span>' +
           '<span class="' + p + 'stat-desc">Ce qu\'il mesure</span></div>';
  }

  /* ─── Contenu de départ d'un sujet ─── */
  function sectionArticle(s, lang) {
    var e = edite(s), etr = !!lang;
    var titre = etr ? '[Titre en ' + e.nomLangue + '] ' + esc(s.titre) : esc(s.titre);
    var B = BLOCS.article;
    return '' +
      '<div class="ap-header">' +
        '<div class="ap-tags"><span class="ap-tag ap-tag-red">' + e.drapeau + ' Pays</span><span class="ap-tag ap-tag-gold">Thème</span><span class="ap-tag ap-tag-blue">Mot-clé</span></div>' +
        '<div class="ap-date">' + moisCourant() + ' — ECG Prépa · Région</div>' +
        '<h1 class="ap-title">' + titre + '</h1>' +
        '<p class="ap-intro">' + (etr ? '[En ' + e.nomLangue + '] ' : '') + 'Chapeau : l\'essentiel en trois ou quatre phrases (qui, quoi, où, quand, pourquoi).</p>' +
      '</div>' +
      '<div class="ap-body">' + B.stats +
        '<div class="ap-cols">' +
          '<div>' +
            '<div class="ap-sub">Contexte et faits</div>' +
            '<p>Rédige ici le premier paragraphe : les faits, datés et sourcés.</p><p>Deuxième paragraphe.</p>' +
            '<div class="ap-sub">Les chiffres clés</div><p>Paragraphe.</p>' + B.table +
            '<div class="ap-sub">Chronologie</div>' + B.tl +
          '</div>' +
          '<div>' +
            '<div class="ap-sub">Réactions</div><p>Paragraphe.</p>' + B.quote +
            '<div class="ap-sub">Les enjeux</div><p>Paragraphe.</p>' +
            B.ctx +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function zoneArticle(s) {
    var e = edite(s);
    var img = s.image_url
      ? '<div class="ap-hero-img-wrap"><img class="ap-hero-img" src="' + esc(s.image_url) + '" alt="' + esc(s.titre) + '"></div>'
      : '';
    var corps = e.langue
      ? '<div class="ap-fr-section">' + sectionArticle(s, null) + '</div>' +
        '<div class="ap-' + e.langue + '-section">' + sectionArticle(s, e.langue) + '</div>'
      : sectionArticle(s, null);
    return '' +
      '<div class="ap-band">' + e.drapeau + ' ' + esc(s.titre).slice(0, 60) + '</div>' +
      '<div class="ap-back-bar"><a href="../tous-' + (s.edition || 'monde') + '.html" class="ap-back-btn">Retour aux articles</a></div>' +
      '<div class="ap-main fade-in"><div class="ap-card">' + img + corps + '</div></div>' +
      '<div class="ap-footer"><strong>ECG Prépa</strong> — Thème · Pays — ' + moisCourant() + '</div>';
  }

  function zoneCg(s) {
    var B = BLOCS.cg;
    return '' +
      '<div class="card">' +
        '<div class="tab">Dossier n° 0XX</div>' +
        '<div class="stamp"><span>Fiche<br>thème</span></div>' +
        '<div class="head">' +
          '<div class="catno">CLASSÉE SOUS — <b>🌍 Thème · Mot-clé · Mot-clé</b></div>' +
          '<h1>' + esc(s.titre) + '</h1>' +
          '<p class="intro">Introduction : ce qu\'est le sujet, pourquoi il compte, ce que la fiche va montrer.</p>' +
        '</div>' +
        B.stats +
        '<div class="body"><div class="cols">' +
          '<div>' +
            '<div class="sub">Aux origines</div><p>Premier paragraphe.</p><p>Deuxième paragraphe.</p>' + B.quote +
            '<div class="sub">Deuxième partie</div><p>Paragraphe.</p>' +
            '<div class="sub">Chronologie</div>' + B.tl +
          '</div>' +
          '<div>' +
            '<div class="sub">Troisième partie</div><p>Paragraphe.</p>' + B.info +
            '<div class="sub">Quatrième partie</div><p>Paragraphe.</p>' +
            B.ctx +
          '</div>' +
        '</div></div>' +
        '<div class="foot"><span>ECG Prépa — Culture Générale</span><span>Dossier n° 0XX · Thème</span></div>' +
      '</div>';
  }

  function zoneInitiale(s) { return s.type === 'cg' ? zoneCg(s) : zoneArticle(s); }

  /* ─── Page complète (éditeur, aperçu ou fichier exporté) ─── */
  function cssLangue(l) {
    return '\n  .nav-left { flex: 1 1 0; display: flex; align-items: center; }' +
      '\n  .nav-right { flex: 1 1 0; display: flex; align-items: center; justify-content: flex-end; gap: 12px; }' +
      '\n  .ap-lang-btn { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.18); color:rgba(255,255,255,.6); font-family:\'DM Mono\',monospace; font-size:10px; font-weight:700; letter-spacing:0.12em; padding:5px 14px; border-radius:4px; cursor:pointer; transition:all .2s; text-transform:uppercase; }' +
      '\n  .ap-lang-btn.active { background:#b22234; border-color:#b22234; color:#fff; }' +
      '\n  .ap-lang-btn:hover:not(.active) { background:rgba(255,255,255,.15); color:#fff; }' +
      '\n  .ap-' + l + '-section { display:none; }\n';
  }

  function nav(s, r) {
    var e = edite(s);
    if (!e) {
      return '<nav>\n  <div class="nav-logo" onclick="window.location.href=\'' + r + 'index.html\'">ECG Prépa</div>\n' +
        '  <div class="breadcrumb">\n    <a href="' + r + 'index.html">Accueil</a>\n    <span class="sep">/</span>\n' +
        '    <a href="' + r + 'culture-generale.html">Culture Générale</a>\n    <span class="sep">/</span>\n' +
        '    <span class="current">' + esc(s.titre) + '</span>\n  </div>\n</nav>';
    }
    var fil = '  <div class="breadcrumb">\n    <a href="' + r + 'index.html">Accueil</a>\n    <span class="sep">/</span>\n' +
      '    <a href="' + r + 'actualites/actualites.html">Actualité</a>\n    <span class="sep">/</span>\n' +
      '    <a href="' + r + 'actualites/' + s.edition + '/index-' + s.edition + '.html">' + e.court + '</a>\n    <span class="sep">/</span>\n' +
      '    <span class="current">' + esc(s.titre) + '</span>\n  </div>\n';
    var logo = '<div class="nav-logo" onclick="window.location.href=\'' + r + 'index.html\'">ECG Prépa</div>';
    if (!e.langue) return '<nav>\n  ' + logo + '\n' + fil + '</nav>';
    return '<nav>\n  <div class="nav-left">' + logo + '</div>\n' + fil +
      '  <div class="nav-right"><div id="ap-lang-toggle" style="display:flex;gap:6px;align-items:center;">\n' +
      '    <button id="ap-btn-fr" class="ap-lang-btn active" onclick="setLang(\'fr\')">🇫🇷 FR</button>\n' +
      '    <button id="ap-btn-' + e.langue + '" class="ap-lang-btn" onclick="setLang(\'' + e.langue + '\')">' + e.bouton + '</button>\n' +
      '  </div></div>\n</nav>';
  }

  function scriptLangue(l) {
    return '<script>\nfunction setLang(lang) {\n' +
      '  document.getElementById(\'ap-btn-fr\').classList.toggle(\'active\', lang === \'fr\');\n' +
      '  document.getElementById(\'ap-btn-' + l + '\').classList.toggle(\'active\', lang === \'' + l + '\');\n' +
      '  var etr = lang === \'' + l + '\';\n' +
      '  document.querySelectorAll(\'.ap-fr-section\').forEach(function (el) { el.style.display = etr ? \'none\' : \'block\'; });\n' +
      '  document.querySelectorAll(\'.ap-' + l + '-section\').forEach(function (el) { el.style.display = etr ? \'block\' : \'none\'; });\n' +
      '}\nsetLang(\'fr\');\n</' + 'script>\n';
  }

  /* o.racine : préfixe des liens du site ('/' dans l'éditeur).
     o.editeur : CSS supplémentaire de l'éditeur (la zone reste
     enveloppée dans <div id="zone">, sans auth.js ni script). */
  function documentComplet(s, zone, o) {
    o = o || {};
    var cg = s.type === 'cg', e = edite(s), l = e && e.langue;
    var r = o.racine != null ? o.racine : (cg ? '../' : '../../../');
    var h = '<!DOCTYPE html>\n<html lang="fr">\n<head>\n';
    if (!o.editeur) h += '<script src="' + r + 'auth.js"></' + 'script>\n';
    h += '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<title>ECG Prépa — ' + esc(s.titre) + '</title>\n' +
      '<link rel="stylesheet" href="' + r + 'fonts/fonts.css">\n' +
      '<style>' + (cg ? CSS_CG : CSS_ARTICLE + (l ? cssLangue(l) : '')) + '</style>\n';
    if (o.editeur) h += '<style>' + o.editeur + '</style>\n';
    h += '</head>\n<body>\n';
    if (!cg) h += '<div class="bg-orb orb1"></div>\n<div class="bg-orb orb2"></div>\n<div class="bg-orb orb3"></div>\n\n';
    h += nav(s, r) + '\n\n';
    h += o.editeur ? '<div id="zone">' + zone + '</div>\n' : zone + '\n\n';
    if (l && !o.editeur) h += scriptLangue(l);
    return h + '</body>\n</html>\n';
  }

  function nomFichier(s) { return slug(s.titre) + '.html'; }

  function telecharger(s) {
    var html = documentComplet(s, s.contenu || zoneInitiale(s));
    var b = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = nomFichier(s);
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function dateCourte(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  function erreur(e) {
    var m = (e && (e.message || e.error_description || e.error)) || String(e || '');
    if (/relation .*redaction_sujets.* does not exist|Could not find the table/i.test(m))
      return 'La base n\'est pas encore prête : lance supabase/redaction.sql dans Supabase.';
    return m || 'Erreur inconnue.';
  }

  window.Redac = {
    EDITIONS: EDITIONS, STATUTS: STATUTS, BLOCS: BLOCS,
    esc: esc, slug: slug, libelleType: libelleType, edition: edite,
    zoneInitiale: zoneInitiale, documentComplet: documentComplet,
    nomFichier: nomFichier, telecharger: telecharger, dateCourte: dateCourte, erreur: erreur
  };
})();
