/* ══════════════════════════════════════════════════════════════════
   ECG Prépa — Lettre d'information, côté administration

   Ce fichier construit tout seul l'onglet « Newsletter » de la page
   d'administration. Le déroulé est celui-ci :

     1. tu choisis les rubriques visées (une ou plusieurs) ;
     2. tu déposes le PDF de la lettre ;
     3. tu écris le petit mot qui accompagne l'envoi ;
     4. tu envoies : chaque abonné reçoit son message, avec le PDF
        en pièce jointe et un lien de secours pour le télécharger.

   Chargé par admin.html, après auth.js.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var A = window.ECGAuth;
  if (!A || !A.admin) return;
  var Ad = A.admin;

  var NOM_SITE = 'ECG Prépa';

  /* Au-delà de ce poids cumulé, plus rien n'est joint au message :
     seuls les liens passent. Les boîtes mail refusent le reste. */
  var TAILLE_MAX_PJ = 4 * 1024 * 1024;    /* 4 Mo, tous fichiers confondus */
  var TAILLE_MAX_FICHIER = 20 * 1024 * 1024;  /* 20 Mo pour un seul PDF */
  var TAILLE_MAX_TOTALE  = 25 * 1024 * 1024;  /* 25 Mo pour l'ensemble */

  /* ─── Le message qui accompagne le PDF ────────────────────────
     {{prenom}}, {{titre}}, {{lien}}, {{date}} sont remplacés
     au moment de l'envoi, destinataire par destinataire. */
  var OBJET_DEFAUT = '{{titre}}';
  var CORPS_DEFAUT =
    'Bonjour {{prenom}},\n\n' +
    'Voici ta newsletter du {{date}}. Tu la trouveras en pièce jointe, ' +
    'et les liens de téléchargement sont au bas de ce message.\n\n' +
    'Bonne lecture, et bon travail.\n\n' +
    'L\'équipe ' + NOM_SITE;

  var etat = {
    rubriques: [],       /* rubriques cochées */
    effectifs: {},       /* { monde: 12, … } */
    fichiers: [],        /* les File choisis, dans l'ordre */
    deposes: null,       /* [{ chemin, lien, taille, nom }] une fois téléversés */
    destinataires: [],   /* liste résolue */
    envoiEnCours: false
  };

  /* ─── Utilitaires ─────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(txt, kind) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = txt;
    t.className = 'show ' + (kind || '');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.className = ''; }, 4200);
  }

  function poids(o) {
    if (!o && o !== 0) return '';
    if (o < 1024) return o + ' o';
    if (o < 1024 * 1024) return Math.round(o / 1024) + ' Ko';
    return (o / 1024 / 1024).toFixed(1).replace('.', ',') + ' Mo';
  }

  function dateCourte(v) {
    if (!v) return '—';
    var d = new Date(v);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' ' +
           d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function fusionner(texte, u) {
    u = u || {};
    var valeurs = {
      prenom: u.prenom || u.nom || 'à toi',
      nom: u.nom || '',
      email: u.email || '',
      site: NOM_SITE,
      titre: (document.getElementById('nl-titre') || {}).value || 'La lettre',
      lien: liensTexte(),
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    return String(texte || '').replace(/\{\{\s*([a-z]+)\s*\}\}/gi, function (tout, cle) {
      var v = valeurs[cle.toLowerCase()];
      return v === undefined ? tout : v;
    });
  }

  function $(sel) { return document.querySelector(sel); }

  /* Poids cumulé des fichiers en attente. */
  function poidsTotal() {
    return etat.fichiers.reduce(function (n, f) { return n + f.size; }, 0);
  }

  /* Ce que vaut {{lien}} : une adresse si un seul PDF, une liste
     « nom — adresse » s'il y en a plusieurs. */
  function liensTexte() {
    if (!etat.deposes || !etat.deposes.length) return '[lien du PDF]';
    if (etat.deposes.length === 1) return etat.deposes[0].lien;
    return etat.deposes.map(function (d) { return d.nom + ' : ' + d.lien; }).join('\n');
  }

  /* ─── Feuille de style propre à l'onglet ──────────────────── */
  function poserStyles() {
    if (document.getElementById('ecg-nl-css')) return;
    var s = document.createElement('style');
    s.id = 'ecg-nl-css';
    s.textContent = [
      '#p-newsletter .nl{display:flex;gap:16px;align-items:flex-start;margin-bottom:20px}',
      '#p-newsletter .nl-gauche{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:16px}',
      '#p-newsletter .nl-droite{flex:0 0 380px;display:flex;flex-direction:column;gap:14px;position:sticky;top:76px}',
      '#p-newsletter .nl-et{padding:22px;display:flex;flex-direction:column;gap:14px}',
      '#p-newsletter .nl-et h2{font-size:17px;font-weight:600}',
      '#p-newsletter .nl-et h2 b{color:var(--accent);margin-right:8px}',
      '#p-newsletter .nl-et h2 small{font-size:12px;font-weight:400;color:var(--faint);margin-left:8px}',
      '#nl-rubriques{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}',
      '.nl-rub{display:flex;align-items:center;gap:12px;min-height:58px;padding:10px 14px;border-radius:12px;text-align:left;',
        'background:var(--surface2);border:1px solid var(--border);color:var(--text);font-family:inherit}',
      '.nl-rub:hover{border-color:rgba(200,169,110,.45)}',
      '.nl-rub.on{background:#2a2418;border-color:var(--accent)}',
      '.nl-rub .cc{width:22px;height:22px;border-radius:6px;border:1px solid #4a4845;flex:none;display:flex;align-items:center;justify-content:center;font-size:13px;color:transparent}',
      '.nl-rub.on .cc{background:var(--accent);border-color:var(--accent);color:#0d0d0f}',
      '.nl-rub .t{flex:1;min-width:0}',
      '.nl-rub b{display:block;font-size:14px;font-weight:500}',
      '.nl-rub span.n{display:block;font-size:12px;color:var(--dim)}',
      '#p-newsletter details.nl-abo summary{cursor:pointer;font-size:13px;font-weight:600;color:var(--accent);list-style:none}',
      '#p-newsletter details.nl-abo summary::-webkit-details-marker{display:none}',
      '#p-newsletter details.nl-abo summary span{color:var(--faint);font-weight:400}',
      '#p-newsletter details.nl-abo[open] summary{margin-bottom:12px}',
      '#p-newsletter .nl-abo .card{max-height:320px;overflow-y:auto}',
      '#p-newsletter .nl-lettre{display:flex;flex-wrap:wrap;gap:10px}',
      '#nl-depot{flex:1 1 220px;border:1px dashed #3a3a45;border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:border-color .18s,background .18s}',
      '#nl-depot:hover,#nl-depot.survol{border-color:var(--accent);background:rgba(200,169,110,.05)}',
      '#nl-depot .gros{font-size:14px;color:var(--text);margin-bottom:4px}',
      '#nl-depot .petit{font-size:12px;color:var(--faint)}',
      '#nl-depot.plein{border-style:solid;border-color:rgba(158,203,160,.4);background:rgba(158,203,160,.05)}',
      '#nl-depot.plein .gros{color:var(--green)}',
      '#nl-archives{flex:1 1 200px;border-radius:12px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-family:inherit;font-size:14px;padding:16px;text-align:center}',
      '#nl-archives:hover{border-color:var(--accent);color:var(--accent)}',
      '#nl-archives small{display:block;font-size:12px;color:var(--faint);margin-top:4px}',
      '#nl-liste{display:flex;flex-direction:column;gap:8px}',
      '#nl-liste:empty{display:none}',
      '#nl-liste .f{display:flex;align-items:center;gap:12px;background:var(--surface2);border:1px solid #3a3a45;border-radius:12px;padding:12px 14px}',
      '#nl-liste .f .pdf{width:36px;height:44px;border-radius:6px;background:#2a2418;color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex:none}',
      '#nl-liste .f .nom{flex:1;min-width:0;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#nl-liste .f .po{display:block;font-size:12px;color:var(--dim)}',
      '#nl-liste .f .ret{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:none;color:var(--dim);flex:none}',
      '#nl-liste .f .ret:hover{color:var(--danger);border-color:var(--danger)}',
      '#nl-total{font-size:13px;color:var(--faint)}',
      '#nl-total:empty{display:none}',
      '#nl-total b{color:var(--dim);font-weight:400}',
      '#nl-total .alerte{color:var(--accent)}',
      '#p-newsletter label.champ{display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--dim)}',
      '#p-newsletter label.champ input,#p-newsletter label.champ textarea{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:10px;',
        'color:var(--text);font-family:inherit;font-size:14px;padding:11px 14px;outline:none}',
      '#p-newsletter textarea{min-height:160px;resize:vertical;line-height:1.65}',
      '#p-newsletter label.champ input:focus,#p-newsletter label.champ textarea:focus{border-color:var(--accent)}',
      '#p-newsletter .vars{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px;color:var(--dim)}',
      '#p-newsletter .vars button{min-height:28px;padding:0 10px;border-radius:999px;border:1px solid var(--border);background:none;color:#c9c7c0;font-family:"DM Mono",monospace;font-size:12px}',
      '#p-newsletter .vars button:hover{border-color:var(--accent);color:var(--accent)}',
      '#p-newsletter .nl-mail{border-radius:16px;overflow:hidden;background:#f5f3ee;color:#1d1c1a}',
      '#p-newsletter .nl-mail .h{padding:12px 18px;background:#e6e2d8;font-size:12px;color:#5a564e;display:flex;flex-direction:column;gap:2px}',
      '#p-newsletter .nl-mail .h b{font-weight:600}',
      '#p-newsletter .nl-mail .c{padding:20px 18px;display:flex;flex-direction:column;gap:12px;font-size:14px;line-height:1.6;max-height:420px;overflow-y:auto}',
      '#p-newsletter .nl-mail .logo{font-family:"Playfair Display",serif;font-size:20px;font-weight:700}',
      '#nl-apercu{white-space:pre-wrap;word-break:break-word}',
      '#p-newsletter .nl-mail .pj{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:#fff;border:1px solid #ddd8cc;font-size:13px}',
      '#p-newsletter .nl-mail .pj i{width:28px;height:34px;border-radius:4px;background:#b5131f;color:#fff;font-size:10px;font-weight:600;font-style:normal;display:flex;align-items:center;justify-content:center;flex:none}',
      '#p-newsletter .nl-mail .pj span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#p-newsletter .nl-envoi{padding:20px;display:flex;flex-direction:column;gap:12px;border-color:rgba(200,169,110,.35)}',
      '#nl-compte{font-size:14px;color:var(--dim);line-height:1.5}',
      '#nl-compte b.gros{font-family:"Playfair Display",serif;font-size:30px;font-weight:700;color:var(--accent);margin-right:6px}',
      '#nl-compte small{display:block;font-size:13px;color:var(--faint);margin-top:4px}',
      '#p-newsletter .nl-envoi .btn{width:100%;min-height:44px}',
      '.nl-case{display:inline-flex;align-items:center;gap:9px;font-size:13px;color:var(--dim);cursor:pointer}',
      '.nl-case input{accent-color:var(--accent);width:16px;height:16px;cursor:pointer}',
      '.nl-case.eteint{opacity:.45;cursor:not-allowed}',
      '#nl-histo td,#nl-histo th{padding:12px}',
      '#nl-histo th:first-child,#nl-histo td:first-child{padding-left:22px}',
      '#nl-histo th:last-child,#nl-histo td:last-child{padding-right:22px;text-align:right;white-space:nowrap}',
      '#nl-histo td small{display:block;font-size:12px;color:var(--faint)}',
      '#nl-histo .mini{margin-left:6px}',
      '.nl-voile{position:fixed;inset:0;z-index:9998;background:rgba(9,9,11,.82);display:flex;align-items:center;justify-content:center;padding:24px}',
      '.nl-voile .box{background:var(--surface);border:1px solid var(--border);border-radius:16px;width:100%;max-width:640px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.6)}',
      '.nl-voile .bh{padding:22px 24px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start;gap:12px}',
      '.nl-voile .bh h2{font-family:"Playfair Display",serif;font-size:1.4rem;font-weight:700;line-height:1.2}',
      '.nl-voile .bh p{color:var(--dim);font-size:13px;margin-top:6px;line-height:1.6}',
      '.nl-voile .bb{padding:12px 24px 20px;overflow-y:auto;flex:1}',
      '.nl-voile .ar{display:flex;align-items:center;gap:12px;width:100%;padding:12px 0;border:0;border-bottom:1px solid var(--surface2);background:none;color:var(--text);font-family:inherit;font-size:14px;text-align:left}',
      '.nl-voile .ar:hover b{color:var(--accent)}',
      '.nl-voile .ar b{flex:1;min-width:0;font-weight:500}',
      '.nl-voile .ar small{display:block;font-size:12px;color:var(--faint);font-weight:400}',
      '.nl-voile .ar .tag{font-size:12px;color:var(--dim);white-space:nowrap}',
      '#nl-secours{position:fixed;inset:0;z-index:9998;background:rgba(9,9,11,.82);display:flex;',
        'align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity .2s}',
      '#nl-secours.on{opacity:1}',
      '#nl-secours .box{background:var(--surface);border:1px solid var(--border);border-radius:16px;',
        'width:100%;max-width:640px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;',
        'box-shadow:0 30px 90px rgba(0,0,0,.6)}',
      '#nl-secours .bh{padding:24px 26px 18px;border-bottom:1px solid var(--border)}',
      '#nl-secours .bh h2{font-family:"Playfair Display",serif;font-size:1.4rem;font-weight:700;line-height:1.2}',
      '#nl-secours .bh p{color:var(--dim);font-size:.8rem;margin-top:9px;line-height:1.65;font-weight:300}',
      '#nl-secours .bb{padding:22px 26px;overflow-y:auto;flex:1}',
      '#nl-secours .bf{padding:16px 26px 20px;border-top:1px solid var(--border);display:flex;gap:10px;',
        'flex-wrap:wrap;justify-content:flex-end}',
      '#nl-secours label{display:block;font-family:"DM Mono",monospace;font-size:.62rem;letter-spacing:.14em;',
        'text-transform:uppercase;color:var(--dim);margin:0 0 8px}',
      '#nl-secours .champ{margin-bottom:18px}',
      '#nl-secours textarea{width:100%;background:var(--surface2);border:1px solid var(--border);',
        'border-radius:9px;color:var(--text);font-family:"DM Mono",monospace;font-size:.76rem;',
        'padding:11px 14px;outline:none;line-height:1.6;resize:vertical}',
      '@media(max-width:1180px){#p-newsletter .nl{flex-direction:column}#p-newsletter .nl-droite{position:static;flex:none;width:100%}}',
      '@media(max-width:640px){#nl-secours,.nl-voile{padding:0}#nl-secours .box,.nl-voile .box{max-height:100vh;border-radius:0;border:0}' +
        '#nl-histo th:nth-child(2),#nl-histo td:nth-child(2){display:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ─── Construction de l'onglet ────────────────────────────── */
  function batir() {
    var hote = document.getElementById('p-newsletter');
    if (!hote || hote.dataset.pret) return;
    hote.dataset.pret = '1';
    poserStyles();

    hote.innerHTML =
      '<div class="nl">' +
        '<div class="nl-gauche">' +
          '<section class="card nl-et" aria-labelledby="nl-t1">' +
            '<h2 id="nl-t1"><b>1</b>À qui<small id="nl-eff-maj"></small></h2>' +
            '<p class="aide">Chaque membre choisit ses rubriques dans « Ma newsletter ». Coche celles que vise cette lettre : ' +
            'un membre abonné à plusieurs rubriques ne la reçoit qu\'une fois.</p>' +
            '<div id="nl-rubriques"></div>' +
            '<details class="nl-abo"><summary>Voir les abonnés <span id="ab-maj"></span></summary>' +
              '<div class="toolbar" style="margin-bottom:12px"><select id="ab-filtre" aria-label="Rubrique"><option value="">Toutes les rubriques</option></select></div>' +
              '<div class="card scroll"><table><thead><tr><th>Membre</th><th>E-mail</th></tr></thead><tbody id="ab-tbody"></tbody></table>' +
              '<div class="empty" id="ab-vide" style="display:none">Aucun abonné pour cette sélection.</div></div>' +
            '</details>' +
          '</section>' +
          '<section class="card nl-et" aria-labelledby="nl-t2">' +
            '<h2 id="nl-t2"><b>2</b>La lettre</h2>' +
            '<div class="nl-lettre">' +
              '<div id="nl-depot" tabindex="0" role="button" aria-label="Déposer ou choisir des PDF">' +
                '<div class="gros">Dépose tes PDF ici</div><div class="petit">ou clique pour les choisir</div></div>' +
              '<button type="button" id="nl-archives">Choisir dans Mes newsletters<small>les PDF déjà rangés</small></button>' +
            '</div>' +
            '<div id="nl-liste"></div>' +
            '<div id="nl-total"></div>' +
            '<input type="file" id="nl-fichier" accept="application/pdf,.pdf" multiple style="display:none">' +
            '<p class="aide">Un ou plusieurs PDF (par exemple l\'édition française et celle en langue étrangère), 20 Mo par fichier, 25 Mo en tout. ' +
            'Au-delà de 4 Mo, rien n\'est joint : les abonnés reçoivent les liens de téléchargement.</p>' +
            '<label class="champ">Titre de cette édition<input type="text" id="nl-titre" placeholder="Newsletter anglophone · semaine du 9 novembre"></label>' +
          '</section>' +
          '<section class="card nl-et" aria-labelledby="nl-t3">' +
            '<h2 id="nl-t3"><b>3</b>Le message</h2>' +
            '<p class="aide">Le texte du courriel, pas celui du PDF : court, pour donner envie d\'ouvrir la pièce jointe.</p>' +
            '<label class="champ">Objet du courriel<input type="text" id="nl-objet"></label>' +
            '<label class="champ">Message<textarea id="nl-corps"></textarea></label>' +
            '<div class="vars">Insérer :' +
              '<button type="button" data-v="prenom">{{prenom}}</button>' +
              '<button type="button" data-v="titre">{{titre}}</button>' +
              '<button type="button" data-v="lien">{{lien}}</button>' +
              '<button type="button" data-v="date">{{date}}</button>' +
              '<button type="button" data-v="site">{{site}}</button></div>' +
          '</section>' +
        '</div>' +
        '<aside class="nl-droite" aria-label="Aperçu et envoi">' +
          '<div class="nl-mail" aria-label="Aperçu du courriel">' +
            '<div class="h"><span><b>De :</b> ' + NOM_SITE + '</span><span><b>Objet :</b> <span id="nl-ap-objet"></span></span></div>' +
            '<div class="c"><span class="logo">' + NOM_SITE + '</span><div id="nl-apercu"></div><div id="nl-ap-pj" style="display:flex;flex-direction:column;gap:6px"></div></div>' +
          '</div>' +
          '<div class="card nl-envoi">' +
            '<p id="nl-compte">Choisis au moins une rubrique.</p>' +
            '<label class="nl-case" id="nl-case-pj"><input type="checkbox" id="nl-joindre" checked> Joindre le PDF au courriel</label>' +
            '<button class="btn ghost" id="nl-test">M\'envoyer un essai</button>' +
            '<button class="btn plein" id="nl-envoyer">Envoyer la lettre</button>' +
          '</div>' +
        '</aside>' +
      '</div>' +
      '<section class="card" aria-labelledby="nl-t-envois" id="nl-envois">' +
        '<div class="boite-t" style="padding:18px 22px"><h2 id="nl-t-envois">Envois précédents</h2></div>' +
        '<div id="nl-histo"><p class="empty" style="padding:26px 0">Aucun envoi pour le moment.</p></div>' +
      '</section>';

    brancher();
    rendreRubriques();
    remplirFiltreAbonnes();
    $('#nl-objet').value = OBJET_DEFAUT;
    $('#nl-corps').value = CORPS_DEFAUT;
    rafraichirApercu();
    rafraichirEffectifs();
    rafraichirHistorique();
    rafraichirAbonnes();
  }

  /* ─── Écouteurs ───────────────────────────────────────────── */
  function brancher() {
    var depot = $('#nl-depot');
    var input = $('#nl-fichier');

    depot.addEventListener('click', function () { input.click(); });
    depot.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    ['dragenter', 'dragover'].forEach(function (n) {
      depot.addEventListener(n, function (e) { e.preventDefault(); depot.classList.add('survol'); });
    });
    ['dragleave', 'drop'].forEach(function (n) {
      depot.addEventListener(n, function (e) { e.preventDefault(); depot.classList.remove('survol'); });
    });
    depot.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files;
      if (f && f.length) prendreFichiers(f);
    });
    input.addEventListener('change', function () {
      if (input.files && input.files.length) prendreFichiers(input.files);
      input.value = '';   /* pour pouvoir redéposer le même fichier */
    });

    $('#nl-liste').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]'); if (!b) return;
      etat.fichiers.splice(parseInt(b.dataset.i, 10), 1);
      etat.deposes = null;
      rendreListe();
      rafraichirApercu();
    });

    $('#nl-rubriques').addEventListener('click', function (e) {
      var b = e.target.closest('.nl-rub'); if (!b) return;
      var id = b.dataset.r;
      var i = etat.rubriques.indexOf(id);
      if (i === -1) etat.rubriques.push(id); else etat.rubriques.splice(i, 1);
      b.classList.toggle('on', i === -1);
      b.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
      rafraichirCompte();
    });

    $('#nl-objet').addEventListener('input', rafraichirApercu);
    $('#nl-corps').addEventListener('input', rafraichirApercu);
    $('#nl-titre').addEventListener('input', rafraichirApercu);

    $('.vars').addEventListener('click', function (e) {
      var c = e.target.closest('[data-v]'); if (!c) return;
      var z = $('#nl-corps');
      var p = z.selectionStart || 0;
      var jeton = '{{' + c.dataset.v + '}}';
      z.value = z.value.slice(0, p) + jeton + z.value.slice(z.selectionEnd || p);
      z.focus();
      z.selectionStart = z.selectionEnd = p + jeton.length;
      rafraichirApercu();
    });

    $('#nl-joindre').addEventListener('change', rafraichirApercu);
    $('#nl-envoyer').addEventListener('click', function () { envoyer(false); });
    $('#nl-test').addEventListener('click', function () { envoyer(true); });

    $('#ab-filtre').addEventListener('change', rafraichirAbonnes);
    $('#nl-archives').addEventListener('click', ouvrirArchives);
  }

  /* ─── Rubriques ───────────────────────────────────────────── */
  function rendreRubriques() {
    $('#nl-rubriques').innerHTML = A.newsletter.rubriques().map(function (r) {
      var n = etat.effectifs[r.id], on = etat.rubriques.indexOf(r.id) !== -1;
      return '<button type="button" class="nl-rub' + (on ? ' on' : '') + '" data-r="' + esc(r.id) + '" aria-pressed="' + on + '" title="' + esc(r.detail || '') + '">' +
               '<span class="cc" aria-hidden="true">✓</span>' +
               '<span class="t"><b>' + esc(r.titre) + '</b><span class="n">' + (n == null ? '…' : n + ' abonné' + (n > 1 ? 's' : '')) + '</span></span>' +
             '</button>';
    }).join('');
  }

  /* ─── Abonnés ─────────────────────────────────────────────── */
  function remplirFiltreAbonnes() {
    var sel = $('#ab-filtre'); if (!sel) return;
    var courant = sel.value;
    sel.innerHTML = '<option value="">Toutes les rubriques</option>' +
      A.newsletter.rubriques().map(function (r) {
        return '<option value="' + esc(r.id) + '">' + esc(r.titre) + '</option>';
      }).join('');
    sel.value = courant;
  }

  function rafraichirAbonnes() {
    var sel = $('#ab-filtre'); if (!sel) return;
    var corps = $('#ab-tbody'), vide = $('#ab-vide'), maj = document.getElementById('ab-maj');
    if (maj) maj.textContent = 'chargement…';
    var cible = sel.value ? [sel.value] : A.newsletter.rubriques().map(function (r) { return r.id; });

    return Ad.destinatairesNewsletter(cible).then(function (liste) {
      liste = liste || [];
      corps.innerHTML = liste.map(function (u) {
        var nom = ((u.prenom || '') + ' ' + (u.nom || '')).trim() || '—';
        return '<tr><td>' + esc(nom) + '</td><td class="mono">' + esc(u.email || '—') + '</td></tr>';
      }).join('');
      vide.textContent = 'Aucun abonné pour cette sélection.';
      vide.style.display = liste.length ? 'none' : 'block';
      if (maj) maj.textContent = liste.length + ' abonné' + (liste.length > 1 ? 's' : '');
    }).catch(function (err) {
      corps.innerHTML = '';
      vide.style.display = 'block';
      vide.textContent = 'Impossible de charger les abonnés : ' + String(err.message || err);
      if (maj) maj.textContent = '';
    });
  }

  function rafraichirEffectifs() {
    return Ad.effectifsNewsletter().then(function (e) {
      etat.effectifs = e;
      rendreRubriques();
      var total = 0;
      Object.keys(e).forEach(function (k) { total += e[k]; });
      var badge = document.getElementById('c-newsletter');
      if (badge) badge.textContent = total;
      var maj = document.getElementById('nl-eff-maj');
      if (maj) maj.textContent = 'à jour';
      rafraichirCompte();
    }).catch(function (err) {
      var maj = document.getElementById('nl-eff-maj');
      if (maj) maj.textContent = 'base non installée';
      var m = String(err.message || err);
      if (/newsletter_effectifs|does not exist|schema cache/i.test(m)) {
        toast('Lance d\'abord supabase-newsletter.sql dans Supabase.', 'err');
      }
    });
  }

  /* ─── Fichiers ────────────────────────────────────────────── */
  function prendreFichiers(entrants) {
    var ajoutes = 0;
    [].slice.call(entrants).forEach(function (f) {
      if (!/pdf$/i.test(f.name) && f.type !== 'application/pdf') {
        return toast('« ' + f.name +' » n\'est pas un PDF.', 'err');
      }
      if (f.size > TAILLE_MAX_FICHIER) {
        return toast('« ' + f.name + ' » dépasse 20 Mo.', 'err');
      }
      /* Même nom et même poids : c'est le même fichier, on l'ignore. */
      var doublon = etat.fichiers.some(function (x) {
        return x.name === f.name && x.size === f.size;
      });
      if (doublon) return toast('« ' + f.name + ' » est déjà dans la liste.', 'err');

      if (poidsTotal() + f.size > TAILLE_MAX_TOTALE) {
        return toast('Ensemble trop lourd : 25 Mo au maximum.', 'err');
      }
      etat.fichiers.push(f);
      ajoutes++;
    });

    if (!ajoutes) return;
    etat.deposes = null;   /* la liste a changé : l'ancien dépôt ne vaut plus */

    if (!$('#nl-titre').value && etat.fichiers.length === 1) {
      $('#nl-titre').value = etat.fichiers[0].name
        .replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();
    }
    rendreListe();
    rafraichirApercu();
  }

  function rendreListe() {
    var d = $('#nl-depot');
    var n = etat.fichiers.length;

    d.classList.toggle('plein', n > 0);
    d.innerHTML = n
      ? '<div class="gros">' + n + ' PDF' + (n > 1 ? ' prêts' : ' prêt') + '</div>' +
        '<div class="petit">clique ou dépose pour en ajouter d\'autres</div>'
      : '<div class="gros">Dépose tes PDF ici</div>' +
        '<div class="petit">ou clique pour les choisir</div>';

    $('#nl-liste').innerHTML = etat.fichiers.map(function (f, i) {
      return '<div class="f">' +
               '<span class="pdf" aria-hidden="true">PDF</span>' +
               '<span class="nom" title="' + esc(f.name) + '">' + esc(f.name) + '<span class="po">' + poids(f.size) + '</span></span>' +
               '<button type="button" class="ret" data-i="' + i + '" aria-label="Retirer ' + esc(f.name) + '">✕</button>' +
             '</div>';
    }).join('');

    var total = poidsTotal();
    var pj = $('#nl-joindre');
    var etiquette = $('#nl-case-pj');

    if (!n) {
      $('#nl-total').innerHTML = '';
      pj.disabled = false;
      etiquette.classList.remove('eteint');
      return;
    }

    if (total > TAILLE_MAX_PJ) {
      pj.checked = false; pj.disabled = true; etiquette.classList.add('eteint');
      $('#nl-total').innerHTML = '<b>' + poids(total) + '</b> en tout : ' +
        '<span class="alerte">trop lourd pour une pièce jointe, seuls les liens partiront.</span>';
    } else {
      pj.disabled = false; etiquette.classList.remove('eteint');
      $('#nl-total').innerHTML = '<b>' + poids(total) + '</b> en tout : ' +
        'joignable sans problème.';
    }
  }

  /* ─── Aperçu et décompte ──────────────────────────────────── */
  function rafraichirApercu() {
    var faux = { prenom: 'Camille', nom: 'Roux', email: 'camille@exemple.fr' };
    var o = fusionner($('#nl-objet').value, faux);
    var c = fusionner($('#nl-corps').value, faux);
    var joint = $('#nl-joindre').checked && etat.fichiers.length && poidsTotal() <= TAILLE_MAX_PJ;
    $('#nl-ap-objet').textContent = o || 'objet vide';
    $('#nl-apercu').textContent = c;
    $('#nl-ap-pj').innerHTML = etat.fichiers.map(function (f) {
      return '<span class="pj"><i>' + (joint ? 'PDF' : 'Lien') + '</i><span>' + esc(f.name) + ' · ' + poids(f.size) + '</span></span>';
    }).join('');
  }

  function rafraichirCompte() {
    var el = $('#nl-compte'), bouton = $('#nl-envoyer');
    if (!el) return;
    if (!etat.rubriques.length) {
      el.innerHTML = 'Choisis au moins une rubrique.';
      etat.destinataires = [];
      if (!etat.envoiEnCours) bouton.textContent = 'Envoyer la lettre';
      return;
    }
    el.innerHTML = 'Calcul du nombre de destinataires…';
    Ad.destinatairesNewsletter(etat.rubriques).then(function (liste) {
      etat.destinataires = liste;
      var noms = etat.rubriques.map(function (id) {
        var r = A.newsletter.rubriques().filter(function (x) { return x.id === id; })[0];
        return r ? '« ' + r.titre + ' »' : id;
      }).join(' ou ');
      var n = liste.length;
      el.innerHTML = n
        ? '<b class="gros">' + n + '</b>destinataire' + (n > 1 ? 's' : '') +
          '<small>Abonnés à ' + esc(noms) + ', comptes actifs seulement, chacun une seule fois.</small>'
        : 'Personne n\'est encore abonné à ' + esc(noms) + '.';
      if (!etat.envoiEnCours) bouton.textContent = n ? 'Envoyer à ' + n + ' abonné' + (n > 1 ? 's' : '') : 'Envoyer la lettre';
    }).catch(function (e) {
      el.textContent = 'Impossible de compter les destinataires : ' + (e.message || e);
    });
  }

  /* ─── L'envoi ─────────────────────────────────────────────── */
  function envoyer(essai) {
    if (etat.envoiEnCours) return;

    var objet = $('#nl-objet').value.trim();
    var corps = $('#nl-corps').value.trim();
    var titre = $('#nl-titre').value.trim();

    if (!etat.rubriques.length) return toast('Choisis d\'abord les rubriques visées.', 'err');
    if (!etat.fichiers.length && !etat.deposes) return toast('Il manque le PDF de la lettre.', 'err');
    if (!objet) return toast('Il manque l\'objet du courriel.', 'err');
    if (!corps) return toast('Le message d\'accompagnement est vide.', 'err');

    var moi = A.current && A.current();
    if (essai && (!moi || !moi.email)) return toast('Adresse de test introuvable.', 'err');

    if (!essai) {
      var n = etat.destinataires.length;
      if (!n) return toast('Aucun abonné pour ces rubriques.', 'err');
      if (!confirm('Envoyer « ' + (titre || objet) + ' » à ' + n + ' membre' + (n > 1 ? 's' : '') + ' ?')) return;
    }

    var bouton = essai ? $('#nl-test') : $('#nl-envoyer');
    var texteInitial = bouton.textContent;
    etat.envoiEnCours = true;
    bouton.disabled = true;
    $('#nl-envoyer').disabled = true;
    $('#nl-test').disabled = true;
    bouton.textContent = etat.deposes ? 'Envoi…'
                       : (etat.fichiers.length > 1 ? 'Dépôt des PDF…' : 'Dépôt du PDF…');

    deposer()
      .then(function () {
        bouton.textContent = 'Envoi…';
        return Ad.envoyerNewsletter({
          rubriques:  etat.rubriques,
          objet:      objet,
          corps:      corps,
          titre:      titre || objet,
          fichiers:   etat.deposes.map(function (d) {
                        return { chemin: d.chemin, lien: d.lien, nom: d.nom, taille: d.taille };
                      }),
          joindre:    $('#nl-joindre').checked &&
                      etat.deposes.reduce(function (n, d) { return n + d.taille; }, 0) <= TAILLE_MAX_PJ,
          essai:      !!essai
        });
      })
      .then(function (r) {
        var envoyes = (r && r.envoyes) || 0;
        var ratés = (r && r.echecs) || [];
        if (essai) {
          toast('Essai envoyé à ' + moi.email + '.', 'ok');
        } else if (ratés.length) {
          toast(envoyes + ' lettre(s) partie(s), ' + ratés.length + ' en échec.', 'err');
        } else {
          toast(envoyes + ' lettre' + (envoyes > 1 ? 's envoyées' : ' envoyée') + '.', 'ok');
        }
        rafraichirHistorique();
      })
      .catch(function (e) {
        if (String(e.message) === 'fonction_absente') {
          secoursManuel();
        } else {
          toast(String(e.message || e), 'err');
        }
      })
      .then(function () {
        etat.envoiEnCours = false;
        bouton.textContent = texteInitial;
        $('#nl-envoyer').disabled = false;
        $('#nl-test').disabled = false;
      });
  }

  /* Dépose les PDF une seule fois, même si on envoie un essai puis
     la vraie lettre : les fichiers ne sont pas téléversés deux fois. */
  function deposer() {
    if (etat.deposes) return Promise.resolve(etat.deposes);
    return Ad.televerserNewsletter(etat.fichiers).then(function (d) {
      etat.deposes = d;
      rafraichirApercu();
      return d;
    });
  }

  /* ─── Si la fonction Edge n'est pas encore déployée ────────── */
  function secoursManuel() {
    var adresses = etat.destinataires.map(function (u) { return u.email; }).join(', ');
    var lien = liensTexte();

    var voile = document.createElement('div');
    voile.id = 'nl-secours';
    voile.innerHTML =
      '<div class="box" role="dialog" aria-modal="true">' +
        '<div class="bh"><h2>Envoi automatique pas encore installé</h2>' +
        '<p class="to">Les PDF sont bien déposés. En attendant le déploiement de la fonction ' +
        '« envoyer-newsletter », voici de quoi envoyer la lettre depuis ton logiciel de courrier.</p></div>' +
        '<div class="bb">' +
          '<div class="champ"><label>Lien' + (etat.deposes && etat.deposes.length > 1 ? 's' : '') +
            ' de téléchargement</label>' +
            '<textarea id="nl-s-lien" style="min-height:90px" readonly>' + esc(lien) + '</textarea></div>' +
          '<div class="champ"><label>Adresses (' + etat.destinataires.length + '), à mettre en copie cachée</label>' +
            '<textarea id="nl-s-mails" style="min-height:130px" readonly>' + esc(adresses) + '</textarea></div>' +
        '</div>' +
        '<div class="bf">' +
          '<button class="btn ghost" id="nl-s-fermer">Fermer</button>' +
          '<button class="btn ghost" id="nl-s-copier-lien">Copier le lien</button>' +
          '<button class="btn" id="nl-s-copier-mails">Copier les adresses</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(voile);
    requestAnimationFrame(function () { voile.classList.add('on'); });

    function fermer() { if (voile.parentNode) voile.parentNode.removeChild(voile); }
    function copier(id, mot) {
      var z = document.getElementById(id);
      z.select();
      try { document.execCommand('copy'); toast(mot + ' copié' + (id === 'nl-s-mails' ? 'es' : '') + '.', 'ok'); }
      catch (e) { toast('Copie impossible, sélectionne le texte à la main.', 'err'); }
    }
    document.getElementById('nl-s-fermer').addEventListener('click', fermer);
    document.getElementById('nl-s-copier-lien').addEventListener('click', function () { copier('nl-s-lien', 'Lien'); });
    document.getElementById('nl-s-copier-mails').addEventListener('click', function () { copier('nl-s-mails', 'Adress'); });
    voile.addEventListener('click', function (e) { if (e.target === voile) fermer(); });
  }

  /* ─── Historique ──────────────────────────────────────────── */
  function rafraichirHistorique() {
    return Ad.historiqueNewsletters(40).then(function (lignes) {
      var h = document.getElementById('nl-histo');
      if (!h) return;
      etat.histo = lignes || [];
      if (!etat.histo.length) {
        h.innerHTML = '<p class="empty" style="padding:26px 0">Aucun envoi pour le moment.</p>';
        return;
      }
      var noms = {};
      A.newsletter.rubriques().forEach(function (r) { noms[r.id] = r.titre; });

      h.innerHTML = '<div class="scroll"><table><thead><tr><th>Édition</th><th>Rubriques</th><th>Envoyée le</th><th class="droite">Destinataires</th><th><span class="sr">Actions</span></th></tr></thead><tbody>' +
        etat.histo.map(function (l, k) {
          var rub = (l.rubriques || []).map(function (x) { return noms[x] || x; }).join(', ');
          var f = (l.fichiers && l.fichiers.length) ? l.fichiers : (l.fichier ? [l.fichier] : []);
          return '<tr><td><b style="font-weight:500">' + esc(l.titre || l.objet || 'Sans titre') + '</b>' + (l.essai ? '<small>essai</small>' : '') + '</td>' +
            '<td style="color:#c9c7c0">' + esc(rub) + '</td>' +
            '<td class="mono">' + dateCourte(l.t) + '</td>' +
            '<td class="droite"><b style="font-weight:600">' + (l.envoyes || 0) + '</b>' + (l.echecs ? '<small style="color:var(--danger)">' + l.echecs + ' en échec</small>' : '') + '</td>' +
            '<td>' + f.map(function (chemin, i) {
              return '<button type="button" class="mini" data-pdf="' + esc(chemin) + '">' + (f.length > 1 ? 'PDF ' + (i + 1) : 'Ouvrir le PDF') + '</button>';
            }).join('') + '<button type="button" class="mini" data-reutiliser="' + k + '">Réutiliser</button></td></tr>';
        }).join('') + '</tbody></table></div>';

      if (h.dataset.branche) return;
      h.dataset.branche = '1';
      h.addEventListener('click', function (e) {
        var r = e.target.closest('button[data-reutiliser]');
        if (r) return reutiliser(etat.histo[+r.dataset.reutiliser]);
        var b = e.target.closest('button[data-pdf]'); if (!b) return;
        b.disabled = true;
        Ad.lienNewsletter(b.dataset.pdf, 7).then(function (url) {
          window.open(url, '_blank', 'noopener');
        }).catch(function (err) {
          toast(String(err.message || err), 'err');
        }).then(function () { b.disabled = false; });
      });
    }).catch(function () { /* table absente : on n'affiche rien */ });
  }

  /* Reprend les rubriques, le titre et le message d'un envoi précédent. */
  function reutiliser(l) {
    if (!l) return;
    var connues = A.newsletter.rubriques().map(function (r) { return r.id; });
    etat.rubriques = (l.rubriques || []).filter(function (x) { return connues.indexOf(x) !== -1; });
    if (l.titre) $('#nl-titre').value = l.titre;
    if (l.objet) $('#nl-objet').value = l.objet;
    if (l.corps) $('#nl-corps').value = l.corps;
    rendreRubriques();
    rafraichirCompte();
    rafraichirApercu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Rubriques' + (l.titre ? ', titre' : '') + (l.objet ? ' et message' : '') + ' repris : ajoute le PDF de la nouvelle lettre.', 'ok');
  }

  /* ─── Choisir un PDF rangé dans « Mes newsletters » ────────────
     Même dossier de stockage (bucket « newsletters », dossier archives/<édition>/). */
  var ARCHIVES = [['anglophone', 'Anglophone'], ['hispanophone', 'Hispanophone'], ['germanophone', 'Germanophone'],
                  ['mondiale', 'Mondiale'], ['culture-generale', 'Culture générale'], ['autres', 'Autres']];
  var MOIS_AR = { janvier: 'janvier', fevrier: 'février', mars: 'mars', avril: 'avril', mai: 'mai', juin: 'juin', juillet: 'juillet',
                  aout: 'août', septembre: 'septembre', octobre: 'octobre', novembre: 'novembre', decembre: 'décembre' };
  function joliNom(nom) {
    var base = nom.replace(/\.pdf$/i, '');
    var m = base.match(/^([a-z]{2,5})-newsletter-?(.*?)-?semaine-du-(\d{1,2})-([a-z]+)-(\d{4})/);
    if (!m) return base.replace(/-/g, ' ') + '.pdf';
    var ed = m[2] ? ' ' + m[2].replace(/-/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }) : '';
    return m[1].toUpperCase() + ' - Newsletter' + ed + ' - Semaine du ' + m[3] + ' ' + (MOIS_AR[m[4]] || m[4]) + ' ' + m[5] + '.pdf';
  }
  function ouvrirArchives() {
    var voile = document.createElement('div');
    voile.className = 'nl-voile';
    voile.innerHTML = '<div class="box" role="dialog" aria-modal="true" aria-labelledby="nl-ar-t">' +
      '<div class="bh"><div><h2 id="nl-ar-t">Mes newsletters</h2><p>Clique sur un PDF pour l\'ajouter à la lettre.</p></div>' +
      '<button type="button" class="fi-x" data-fermer aria-label="Fermer">✕</button></div>' +
      '<div class="bb" id="nl-ar-liste"><p class="aide" style="padding:16px 0">Chargement…</p></div></div>';
    document.body.appendChild(voile);
    var precedent = document.activeElement;
    voile.querySelector('[data-fermer]').focus();
    function fermer() {
      if (voile.parentNode) voile.parentNode.removeChild(voile);
      document.removeEventListener('keydown', clavier);
      if (precedent && precedent.focus) precedent.focus();
    }
    function clavier(e) { if (e.key === 'Escape') fermer(); }
    document.addEventListener('keydown', clavier);
    voile.addEventListener('click', function (e) {
      if (e.target === voile || e.target.closest('[data-fermer]')) return fermer();
      var b = e.target.closest('[data-chemin]'); if (!b) return;
      b.disabled = true;
      b.querySelector('.tag').textContent = 'Ajout…';
      A.client().then(function (c) { return c.storage.from('newsletters').download(b.dataset.chemin); }).then(function (r) {
        if (r.error) throw r.error;
        prendreFichiers([new File([r.data], b.dataset.nom, { type: 'application/pdf' })]);
        fermer();
      }).catch(function (err) {
        b.disabled = false;
        b.querySelector('.tag').textContent = 'Échec';
        toast(String((err && err.message) || err), 'err');
      });
    });
    A.client().then(function (c) {
      return Promise.all(ARCHIVES.map(function (e) {
        return c.storage.from('newsletters').list('archives/' + e[0], { limit: 200, sortBy: { column: 'name', order: 'desc' } })
          .then(function (r) {
            if (r.error) throw r.error;
            return (r.data || []).filter(function (o) { return /\.pdf$/i.test(o.name); }).map(function (o) {
              return { ed: e[1], nom: o.name, chemin: 'archives/' + e[0] + '/' + o.name,
                       taille: o.metadata && o.metadata.size, date: o.updated_at || o.created_at };
            });
          });
      }));
    }).then(function (listes) {
      var tout = [].concat.apply([], listes).sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
      var z = document.getElementById('nl-ar-liste'); if (!z) return;
      z.innerHTML = tout.length ? tout.slice(0, 60).map(function (f) {
        var joli = joliNom(f.nom);
        return '<button type="button" class="ar" data-chemin="' + esc(f.chemin) + '" data-nom="' + esc(joli) + '">' +
          '<b>' + esc(joli.replace(/\.pdf$/i, '')) + '<small>' + esc(f.ed) + (f.date ? ' · rangée le ' + new Date(f.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '') + '</small></b>' +
          '<span class="tag">' + (f.taille ? poids(f.taille) : '') + '</span></button>';
      }).join('') : '<p class="aide" style="padding:16px 0">Aucun PDF dans Mes newsletters pour l\'instant.</p>';
    }).catch(function (err) {
      var z = document.getElementById('nl-ar-liste');
      if (z) z.innerHTML = '<p class="aide" style="padding:16px 0;color:var(--danger)">Impossible de lire Mes newsletters : ' + esc(String((err && err.message) || err)) + '</p>';
    });
  }

  /* ─── Démarrage : on attend que la page d'admin soit ouverte ── */
  function demarrer(profil) {
    if (!profil || profil.role !== 'admin') return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', batir);
    } else {
      batir();
    }
  }

  document.addEventListener('ecg:pret', function (e) { demarrer(e.detail); });

  /* Filet : si l'événement est déjà passé quand ce script arrive. */
  setTimeout(function () {
    var p = A.current && A.current();
    if (p && p.role === 'admin' && document.getElementById('p-newsletter')) demarrer(p);
  }, 1500);

  window.ECGNewsletter = {
    rafraichir: function () { rafraichirEffectifs(); rafraichirHistorique(); rafraichirAbonnes(); }
  };
})();
