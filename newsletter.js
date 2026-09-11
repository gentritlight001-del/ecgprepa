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
      '#p-newsletter .bloc{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px 26px;margin-bottom:20px}',
      '#p-newsletter .bloc>h3{font-family:"Playfair Display",serif;font-size:1.2rem;font-weight:700;margin-bottom:6px}',
      '#p-newsletter .bloc>h3 small{font-family:"DM Mono",monospace;font-size:.6rem;letter-spacing:.16em;',
        'text-transform:uppercase;color:var(--faint);margin-left:10px;vertical-align:2px;font-weight:400}',
      '#p-newsletter .bloc>p.aide{color:var(--dim);font-size:.8rem;font-weight:300;line-height:1.65;margin-bottom:18px;max-width:660px}',

      '#nl-rubriques{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}',
      '.nl-rub{text-align:left;background:var(--surface2);border:1px solid var(--border);border-radius:12px;',
        'padding:15px 16px;position:relative;transition:border-color .18s,background .18s}',
      '.nl-rub:hover{border-color:rgba(200,169,110,.45)}',
      '.nl-rub.on{border-color:var(--accent);background:rgba(200,169,110,.08)}',
      '.nl-rub b{display:block;font-size:.9rem;font-weight:500;color:var(--text);padding-right:44px}',
      '.nl-rub span{display:block;color:var(--dim);font-size:.75rem;font-weight:300;line-height:1.5;margin-top:5px}',
      '.nl-rub i{position:absolute;top:14px;right:14px;font-style:normal;font-family:"DM Mono",monospace;',
        'font-size:.64rem;letter-spacing:.08em;color:var(--faint);background:rgba(255,255,255,.03);',
        'border:1px solid var(--border);border-radius:20px;padding:2px 8px}',
      '.nl-rub.on i{color:var(--accent);border-color:rgba(200,169,110,.4);background:rgba(200,169,110,.12)}',

      '#nl-depot{border:1px dashed var(--border);border-radius:12px;padding:30px 22px;text-align:center;',
        'cursor:pointer;transition:border-color .18s,background .18s}',
      '#nl-depot:hover,#nl-depot.survol{border-color:var(--accent);background:rgba(200,169,110,.05)}',
      '#nl-depot .gros{font-size:.92rem;color:var(--text);margin-bottom:6px}',
      '#nl-depot .petit{font-size:.76rem;color:var(--faint);font-weight:300}',
      '#nl-depot.plein{border-style:solid;border-color:rgba(158,203,160,.4);background:rgba(158,203,160,.05)}',
      '#nl-depot.plein .gros{color:var(--green)}',

      '#nl-liste{margin-top:14px;display:flex;flex-direction:column;gap:8px}',
      '#nl-liste .f{display:flex;align-items:center;gap:12px;background:var(--surface2);',
        'border:1px solid var(--border);border-radius:10px;padding:11px 14px}',
      '#nl-liste .f .rang{font-family:"DM Mono",monospace;font-size:.66rem;color:var(--faint);',
        'border:1px solid var(--border);border-radius:6px;padding:2px 7px;flex:0 0 auto}',
      '#nl-liste .f .nom{flex:1;min-width:0;font-size:.83rem;color:var(--text);',
        'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '#nl-liste .f .po{font-family:"DM Mono",monospace;font-size:.7rem;color:var(--dim);flex:0 0 auto}',
      '#nl-liste .f .ret{background:none;border:0;color:var(--faint);font-size:1.1rem;line-height:1;',
        'cursor:pointer;padding:2px 5px;border-radius:5px;flex:0 0 auto;transition:color .18s}',
      '#nl-liste .f .ret:hover{color:var(--danger)}',
      '#nl-total{margin-top:11px;font-size:.76rem;color:var(--faint);line-height:1.6}',
      '#nl-total b{color:var(--dim);font-weight:400}',
      '#nl-total .alerte{color:var(--accent)}',

      '#p-newsletter label.champ{display:block;font-family:"DM Mono",monospace;font-size:.62rem;letter-spacing:.14em;',
        'text-transform:uppercase;color:var(--dim);margin:0 0 8px}',
      '#p-newsletter .ligne{margin-bottom:18px}',
      '#p-newsletter input[type=text],#p-newsletter textarea{width:100%;background:var(--surface2);',
        'border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:inherit;',
        'font-size:.86rem;padding:11px 14px;outline:none;transition:border-color .18s}',
      '#p-newsletter textarea{min-height:180px;resize:vertical;line-height:1.7}',
      '#p-newsletter input:focus,#p-newsletter textarea:focus{border-color:var(--accent)}',
      '#p-newsletter .vars{font-size:.73rem;color:var(--faint);line-height:1.9;margin-top:8px}',
      '#p-newsletter .vars code{font-family:"DM Mono",monospace;color:var(--dim);background:var(--surface2);',
        'padding:2px 7px;border-radius:5px;cursor:pointer;border:1px solid var(--border)}',
      '#p-newsletter .vars code:hover{color:var(--accent);border-color:rgba(200,169,110,.4)}',

      '#nl-apercu{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:18px 20px;',
        'font-size:.83rem;line-height:1.75;color:var(--dim);white-space:pre-wrap;max-height:280px;overflow-y:auto}',
      '#nl-apercu .obj{color:var(--text);font-weight:500;display:block;margin-bottom:12px;padding-bottom:10px;',
        'border-bottom:1px solid var(--border);white-space:normal}',
      '#nl-apercu .pj{display:inline-block;margin:8px 6px 0 0;font-family:"DM Mono",monospace;font-size:.68rem;',
        'color:var(--green);border:1px solid rgba(158,203,160,.3);border-radius:7px;padding:5px 11px;white-space:normal}',

      '.nl-pied{display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:flex-end;',
        'border-top:1px solid var(--border);padding-top:18px;margin-top:4px}',
      '.nl-pied .compte{margin-right:auto;font-size:.84rem;color:var(--dim);line-height:1.5}',
      '.nl-pied .compte b{color:var(--accent);font-weight:500}',
      '.nl-case{display:inline-flex;align-items:center;gap:9px;font-size:.8rem;color:var(--dim);cursor:pointer}',
      '.nl-case input{accent-color:var(--accent);width:15px;height:15px;cursor:pointer}',
      '.nl-case.eteint{opacity:.45;cursor:not-allowed}',

      '#nl-histo .ev{display:grid;grid-template-columns:130px 1fr 150px 110px;gap:16px;padding:13px 0;',
        'border-bottom:1px solid rgba(42,42,53,.5);font-size:.83rem;align-items:center}',
      '#nl-histo .ev:last-child{border-bottom:0}',
      '#nl-histo .ev .t{font-family:"DM Mono",monospace;font-size:.7rem;color:var(--faint)}',
      '#nl-histo .ev .r{color:var(--dim);font-size:.76rem}',
      '#nl-histo .ev .n{font-family:"DM Mono",monospace;font-size:.72rem;color:var(--dim);text-align:right}',
      '@media(max-width:760px){#nl-histo .ev{grid-template-columns:1fr;gap:5px}#nl-histo .ev .n{text-align:left}}',

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
      '@media(max-width:640px){#nl-secours{padding:0}#nl-secours .box{max-height:100vh;border-radius:0;border:0}}'
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
      '<div class="notice"><b>Comment ça marche</b>' +
        'Chaque membre choisit ses rubriques depuis sa page « Ma newsletter ». ' +
        'Tu vises ici une ou plusieurs rubriques, tu déposes le PDF, et chacun reçoit ' +
        'un message personnalisé avec la lettre jointe. Un membre abonné à deux ' +
        'rubriques visées ne reçoit qu\'un seul exemplaire.</div>' +

      '<div class="bloc">' +
        '<h3>1. À qui<small id="nl-eff-maj"></small></h3>' +
        '<p class="aide">Coche les rubriques concernées par cette lettre. ' +
        'Le nombre indiqué est celui des membres actifs abonnés.</p>' +
        '<div id="nl-rubriques"></div>' +
      '</div>' +

      '<div class="bloc">' +
        '<h3>2. La lettre</h3>' +
        '<p class="aide">Un ou plusieurs PDF — par exemple l\'édition française et ' +
        'l\'édition en langue originale. Tous partent dans le même courriel, et tous ' +
        'les abonnés des rubriques visées les reçoivent. 20 Mo par fichier, 25 Mo en tout. ' +
        'Au-delà de 4 Mo cumulés, rien n\'est joint : les abonnés reçoivent seulement ' +
        'les liens de téléchargement.</p>' +
        '<div id="nl-depot" tabindex="0" role="button">' +
          '<div class="gros">Dépose tes PDF ici</div>' +
          '<div class="petit">ou clique pour les choisir</div>' +
        '</div>' +
        '<div id="nl-liste"></div>' +
        '<div id="nl-total"></div>' +
        '<input type="file" id="nl-fichier" accept="application/pdf,.pdf" multiple style="display:none">' +
        '<div class="ligne" style="margin-top:18px;margin-bottom:0">' +
          '<label class="champ" for="nl-titre">Titre de cette édition</label>' +
          '<input type="text" id="nl-titre" placeholder="Lettre de septembre — actualité mondiale">' +
        '</div>' +
      '</div>' +

      '<div class="bloc">' +
        '<h3>3. Le message d\'accompagnement</h3>' +
        '<p class="aide">C\'est le texte du courriel, pas le contenu du PDF. Reste court : ' +
        'il sert surtout à donner envie d\'ouvrir la pièce jointe.</p>' +
        '<div class="ligne">' +
          '<label class="champ" for="nl-objet">Objet du courriel</label>' +
          '<input type="text" id="nl-objet">' +
        '</div>' +
        '<div class="ligne">' +
          '<label class="champ" for="nl-corps">Message</label>' +
          '<textarea id="nl-corps"></textarea>' +
          '<p class="vars">Remplacés à l\'envoi : ' +
            '<code data-v="prenom">{{prenom}}</code> ' +
            '<code data-v="titre">{{titre}}</code> ' +
            '<code data-v="lien">{{lien}}</code> ' +
            '<code data-v="date">{{date}}</code> ' +
            '<code data-v="site">{{site}}</code></p>' +
        '</div>' +
        '<div class="ligne" style="margin-bottom:0">' +
          '<label class="champ">Aperçu</label>' +
          '<div id="nl-apercu"></div>' +
        '</div>' +
      '</div>' +

      '<div class="bloc">' +
        '<div class="nl-pied" style="border-top:0;padding-top:0;margin-top:0">' +
          '<p class="compte" id="nl-compte">Choisis au moins une rubrique.</p>' +
          '<label class="nl-case" id="nl-case-pj">' +
            '<input type="checkbox" id="nl-joindre" checked> Joindre le PDF</label>' +
          '<button class="btn ghost" id="nl-test">M\'envoyer un essai</button>' +
          '<button class="btn" id="nl-envoyer">Envoyer la lettre</button>' +
        '</div>' +
      '</div>' +

      '<div class="bloc">' +
        '<h3>Envois précédents</h3>' +
        '<div id="nl-histo"><p class="empty" style="padding:26px 0">Aucun envoi pour le moment.</p></div>' +
      '</div>';

    brancher();
    rendreRubriques();
    $('#nl-objet').value = OBJET_DEFAUT;
    $('#nl-corps').value = CORPS_DEFAUT;
    rafraichirApercu();
    rafraichirEffectifs();
    rafraichirHistorique();
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
      rafraichirCompte();
    });

    $('#nl-objet').addEventListener('input', rafraichirApercu);
    $('#nl-corps').addEventListener('input', rafraichirApercu);
    $('#nl-titre').addEventListener('input', rafraichirApercu);

    $('.vars').addEventListener('click', function (e) {
      var c = e.target.closest('code[data-v]'); if (!c) return;
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
  }

  /* ─── Rubriques ───────────────────────────────────────────── */
  function rendreRubriques() {
    $('#nl-rubriques').innerHTML = A.newsletter.rubriques().map(function (r) {
      var n = etat.effectifs[r.id];
      return '<button class="nl-rub' + (etat.rubriques.indexOf(r.id) !== -1 ? ' on' : '') + '" data-r="' + esc(r.id) + '">' +
               '<i>' + (n == null ? '…' : n) + '</i>' +
               '<b>' + esc(r.titre) + '</b>' +
               '<span>' + esc(r.detail) + '</span>' +
             '</button>';
    }).join('');
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
               '<span class="rang">' + (i + 1) + '</span>' +
               '<span class="nom" title="' + esc(f.name) + '">' + esc(f.name) + '</span>' +
               '<span class="po">' + poids(f.size) + '</span>' +
               '<button class="ret" data-i="' + i + '" title="Retirer" aria-label="Retirer">×</button>' +
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
      $('#nl-total').innerHTML = '<b>' + poids(total) + '</b> en tout — ' +
        '<span class="alerte">trop lourd pour une pièce jointe, seuls les liens partiront.</span>';
    } else {
      pj.disabled = false; etiquette.classList.remove('eteint');
      $('#nl-total').innerHTML = '<b>' + poids(total) + '</b> en tout — ' +
        'joignable sans problème.';
    }
  }

  /* ─── Aperçu et décompte ──────────────────────────────────── */
  function rafraichirApercu() {
    var faux = { prenom: 'Camille', nom: 'Roux', email: 'camille@exemple.fr' };
    var o = fusionner($('#nl-objet').value, faux);
    var c = fusionner($('#nl-corps').value, faux);
    var joint = $('#nl-joindre').checked && etat.fichiers.length && poidsTotal() <= TAILLE_MAX_PJ;

    var pieces = etat.fichiers.map(function (f) {
      return '<span class="pj">' + (joint ? 'PDF joint' : 'Lien seul') + ' · ' +
             esc(f.name) + ' · ' + poids(f.size) + '</span>';
    }).join(' ');

    $('#nl-apercu').innerHTML =
      '<span class="obj">' + (esc(o) || '<em style="color:var(--faint)">objet vide</em>') + '</span>' +
      esc(c) +
      (etat.fichiers.length
        ? '<span style="display:block;margin-top:6px">' + pieces + '</span>'
        : '');
  }

  function rafraichirCompte() {
    var el = $('#nl-compte');
    if (!el) return;
    if (!etat.rubriques.length) {
      el.innerHTML = 'Choisis au moins une rubrique.';
      return;
    }
    el.innerHTML = 'Calcul du nombre de destinataires…';
    Ad.destinatairesNewsletter(etat.rubriques).then(function (liste) {
      etat.destinataires = liste;
      var noms = etat.rubriques.map(function (id) {
        var r = A.newsletter.rubriques().filter(function (x) { return x.id === id; })[0];
        return r ? r.titre.toLowerCase() : id;
      }).join(', ');
      el.innerHTML = liste.length
        ? '<b>' + liste.length + '</b> membre' + (liste.length > 1 ? 's' : '') +
          ' recevront cette lettre<br><span style="font-size:.76rem;color:var(--faint)">' + esc(noms) + '</span>'
        : 'Personne n\'est encore abonné à ' + esc(noms) + '.';
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
          '<div class="champ"><label>Adresses (' + etat.destinataires.length + ') — à mettre en copie cachée</label>' +
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
      if (!lignes || !lignes.length) {
        h.innerHTML = '<p class="empty" style="padding:26px 0">Aucun envoi pour le moment.</p>';
        return;
      }
      var noms = {};
      A.newsletter.rubriques().forEach(function (r) { noms[r.id] = r.titre; });

      h.innerHTML = lignes.map(function (l) {
        var rub = (l.rubriques || []).map(function (x) { return noms[x] || x; }).join(' · ');
        return '<div class="ev">' +
          '<span class="t">' + dateCourte(l.t) + '</span>' +
          '<span><b>' + esc(l.titre || l.objet || 'Sans titre') + '</b>' +
            '<span class="r" style="display:block">' + esc(rub) + '</span></span>' +
          '<span class="n">' + l.envoyes + ' envoyée' + (l.envoyes > 1 ? 's' : '') +
            (l.echecs ? ' · <span style="color:var(--danger)">' + l.echecs + ' en échec</span>' : '') + '</span>' +
          '<span style="text-align:right">' +
            (function () {
              var f = (l.fichiers && l.fichiers.length) ? l.fichiers : (l.fichier ? [l.fichier] : []);
              return f.map(function (chemin, i) {
                return '<button class="mini" data-pdf="' + esc(chemin) + '" ' +
                       'style="margin-left:5px">PDF' + (f.length > 1 ? ' ' + (i + 1) : '') + '</button>';
              }).join('');
            })() +
          '</span>' +
        '</div>';
      }).join('');

      if (h.dataset.branche) return;
      h.dataset.branche = '1';
      h.addEventListener('click', function (e) {
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
    rafraichir: function () { rafraichirEffectifs(); rafraichirHistorique(); }
  };
})();
