/* ══════════════════════════════════════════════════════════════════
   ECG Prépa — Écrire aux membres depuis le panneau d'administration

   - Modèles de messages pré-rédigés, modifiables sans toucher au code.
   - Envoi réel depuis l'adresse du site (fonction Edge « envoyer-mail »).
   - Repli automatique sur le logiciel de mail si la fonction n'est pas
     encore déployée : l'outil reste utilisable dès aujourd'hui.

   Chargé par admin.html, après auth.js.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     ★ À CONFIGURER — l'adresse d'expédition du site ★
     Elle doit correspondre à MAIL_EXPEDITEUR dans la fonction Edge.
     ══════════════════════════════════════════════════════════════ */
  var EXPEDITEUR = 'contact@ecg-prepa.fr';
  var NOM_SITE   = 'ECG Prépa';

  /* ─── Modèles livrés d'origine ───────────────────────────────
     Ils servent tant que la table « modeles_mail » n'existe pas,
     et de point de départ au moment de l'installer. */
  var MODELES_PAR_DEFAUT = [
    {
      id: 'bienvenue', ordre: 10,
      titre: 'Bienvenue',
      objet: 'Bienvenue sur ECG Prépa, {{prenom}}',
      corps:
        'Bonjour {{prenom}},\n\n' +
        'Ton compte est ouvert : tu as désormais accès à l\'ensemble des cours, ' +
        'des fiches de culture générale et des analyses d\'actualité du site.\n\n' +
        'Deux conseils pour commencer :\n' +
        '• passe par la page Agenda pour te caler un rythme de révision ;\n' +
        '• mets en favori les fiches que tu relis souvent, elles se retrouvent ' +
        'toutes au même endroit.\n\n' +
        'Si quelque chose te manque ou te semble faux, réponds simplement à ce message.\n\n' +
        'Bon travail,\nL\'équipe ECG Prépa'
    },
    {
      id: 'compte-valide', ordre: 20,
      titre: 'Compte validé',
      objet: 'Ton compte ECG Prépa est activé',
      corps:
        'Bonjour {{prenom}},\n\n' +
        'Ton inscription vient d\'être validée. Tu peux te connecter dès maintenant ' +
        'avec l\'adresse {{email}}.\n\n' +
        'Bonne lecture,\nL\'équipe ECG Prépa'
    },
    {
      id: 'attente', ordre: 30,
      titre: 'Inscription en attente',
      objet: 'Ton inscription sur ECG Prépa',
      corps:
        'Bonjour {{prenom}},\n\n' +
        'On a bien reçu ta demande d\'inscription. Elle est en cours de vérification ' +
        'et tu recevras un message dès qu\'elle sera validée.\n\n' +
        'À très vite,\nL\'équipe ECG Prépa'
    },
    {
      id: 'suspension', ordre: 40,
      titre: 'Accès suspendu',
      objet: 'Ton accès à ECG Prépa a été suspendu',
      corps:
        'Bonjour {{prenom}},\n\n' +
        'L\'accès lié à l\'adresse {{email}} a été suspendu. Cela arrive ' +
        'généralement quand un compte est partagé entre plusieurs personnes.\n\n' +
        'Si tu penses qu\'il s\'agit d\'une erreur, réponds à ce message et on regarde ensemble.\n\n' +
        'L\'équipe ECG Prépa'
    },
    {
      id: 'retour', ordre: 50,
      titre: 'Relance après absence',
      objet: 'On ne t\'a pas vu depuis un moment, {{prenom}}',
      corps:
        'Bonjour {{prenom}},\n\n' +
        'Le site s\'est étoffé depuis ta dernière visite : de nouvelles fiches de ' +
        'culture générale, des analyses d\'actualité fraîches et des cours mis à jour.\n\n' +
        'Ton compte est toujours actif, tu peux reprendre où tu t\'étais arrêté.\n\n' +
        'Bon courage pour la suite,\nL\'équipe ECG Prépa'
    },
    {
      id: 'nouveautes', ordre: 60,
      titre: 'Nouveautés du site',
      objet: 'Du nouveau sur ECG Prépa',
      corps:
        'Bonjour {{prenom}},\n\n' +
        'Ce qui vient d\'arriver sur le site :\n\n' +
        '• \n' +
        '• \n' +
        '• \n\n' +
        'Bonne lecture,\nL\'équipe ECG Prépa'
    },
    {
      id: 'libre', ordre: 90,
      titre: 'Message libre',
      objet: '',
      corps: 'Bonjour {{prenom}},\n\n\n\nL\'équipe ECG Prépa'
    }
  ];

  var A = window.ECGAuth;
  if (!A || !A.admin) return;
  var Ad = A.admin;

  var modeles = MODELES_PAR_DEFAUT.slice();
  var enBase = false;   /* les modèles viennent-ils de la base ? */
  var cibles = [];      /* destinataires de la fenêtre ouverte */
  var boite = null;

  /* ─── Utilitaires ─────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function nomComplet(u) {
    return ((u.prenom || '') + ' ' + (u.nom || '')).trim() || u.email;
  }

  /* Remplace les variables par les données du destinataire. */
  function fusionner(texte, u) {
    u = u || {};
    var valeurs = {
      prenom: u.prenom || u.nom || 'à toi',
      nom: u.nom || '',
      email: u.email || '',
      site: NOM_SITE,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    return String(texte || '').replace(/\{\{\s*([a-z]+)\s*\}\}/gi, function (tout, cle) {
      var v = valeurs[cle.toLowerCase()];
      return v === undefined ? tout : v;
    });
  }

  function toast(txt, kind) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = txt;
    t.className = 'show ' + (kind || '');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.className = ''; }, 3600);
  }

  /* ─── Feuille de style, injectée une seule fois ───────────── */
  function poserStyles() {
    if (document.getElementById('ecg-mail-css')) return;
    var s = document.createElement('style');
    s.id = 'ecg-mail-css';
    s.textContent =
      '#mailbox{position:fixed;inset:0;z-index:9998;background:rgba(9,9,11,.82);' +
        'display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity .2s}' +
      '#mailbox.on{opacity:1}' +
      '#mailbox .box{background:var(--surface);border:1px solid var(--border);border-radius:16px;' +
        'width:100%;max-width:680px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;' +
        'box-shadow:0 30px 90px rgba(0,0,0,.6)}' +
      '#mailbox .bh{padding:24px 26px 18px;border-bottom:1px solid var(--border)}' +
      '#mailbox .bh h2{font-family:\'Playfair Display\',serif;font-size:1.55rem;font-weight:700;line-height:1.15}' +
      '#mailbox .bh .to{color:var(--dim);font-size:.8rem;margin-top:7px;word-break:break-all}' +
      '#mailbox .bb{padding:22px 26px;overflow-y:auto;flex:1}' +
      '#mailbox .bf{padding:16px 26px 20px;border-top:1px solid var(--border);' +
        'display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end}' +
      '#mailbox .bf .from{margin-right:auto;font-family:\'DM Mono\',monospace;font-size:.66rem;' +
        'color:var(--faint);letter-spacing:.06em}' +
      '#mailbox label{display:block;font-family:\'DM Mono\',monospace;font-size:.62rem;letter-spacing:.14em;' +
        'text-transform:uppercase;color:var(--dim);margin:0 0 8px}' +
      '#mailbox .champ{margin-bottom:18px}' +
      '#mailbox input[type=text],#mailbox textarea,#mailbox select{width:100%;background:var(--surface2);' +
        'border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:inherit;' +
        'font-size:.86rem;padding:11px 14px;outline:none;transition:border-color .18s}' +
      '#mailbox textarea{min-height:230px;resize:vertical;line-height:1.65;font-size:.85rem}' +
      '#mailbox input:focus,#mailbox textarea:focus,#mailbox select:focus{border-color:var(--accent)}' +
      '#mailbox .chips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:20px}' +
      '#mailbox .chip{background:none;border:1px solid var(--border);color:var(--dim);font-size:.72rem;' +
        'padding:6px 12px;border-radius:20px;font-family:inherit}' +
      '#mailbox .chip:hover{border-color:var(--accent);color:var(--accent)}' +
      '#mailbox .chip.on{border-color:var(--accent);color:var(--accent);background:rgba(200,169,110,.1)}' +
      '#mailbox .vars{font-size:.73rem;color:var(--faint);line-height:1.7;margin-top:-8px}' +
      '#mailbox .vars code{font-family:\'DM Mono\',monospace;color:var(--dim);background:var(--surface2);' +
        'padding:1px 6px;border-radius:5px;cursor:pointer}' +
      '#mailbox .vars code:hover{color:var(--accent)}' +
      '#mailbox .apercu{background:var(--surface2);border:1px solid var(--border);border-radius:10px;' +
        'padding:16px 18px;font-size:.83rem;line-height:1.7;color:var(--dim);white-space:pre-wrap;' +
        'max-height:300px;overflow-y:auto}' +
      '#mailbox .apercu .obj{color:var(--text);font-weight:500;display:block;margin-bottom:12px;' +
        'padding-bottom:10px;border-bottom:1px solid var(--border);white-space:normal}' +
      '#mailbox .liste{max-height:130px;overflow-y:auto;font-size:.78rem;color:var(--dim);line-height:1.8}' +
      '@media(max-width:640px){#mailbox{padding:0}#mailbox .box{max-height:100vh;border-radius:0;border:0}}';
    document.head.appendChild(s);
  }

  /* ─── Chargement des modèles ──────────────────────────────── */
  function chargerModeles() {
    if (!Ad.modelesMail) return Promise.resolve();
    return Ad.modelesMail().then(function (rows) {
      if (rows && rows.length) { modeles = rows; enBase = true; }
    }).catch(function () { /* table absente : on garde les modèles d'origine */ });
  }

  /* ─── La fenêtre d'écriture ───────────────────────────────── */
  function ouvrir(destinataires) {
    cibles = [].concat(destinataires).filter(function (u) { return u && u.email; });
    if (!cibles.length) return toast('Aucun destinataire.', 'err');

    poserStyles();
    fermer();

    var groupe = cibles.length > 1;
    var titre = groupe ? 'Écrire à ' + cibles.length + ' membres' : 'Écrire à ' + nomComplet(cibles[0]);
    var sousTitre = groupe
      ? cibles.slice(0, 6).map(function (u) { return esc(u.email); }).join(', ') +
        (cibles.length > 6 ? ' et ' + (cibles.length - 6) + ' autres' : '')
      : esc(cibles[0].email);

    boite = document.createElement('div');
    boite.id = 'mailbox';
    boite.innerHTML =
      '<div class="box" role="dialog" aria-modal="true" aria-label="Écrire un message">' +
        '<div class="bh"><h2>' + esc(titre) + '</h2><p class="to">' + sousTitre + '</p></div>' +
        '<div class="bb">' +
          '<div class="chips" id="m-chips"></div>' +
          '<div class="champ"><label for="m-objet">Objet</label>' +
            '<input type="text" id="m-objet" placeholder="L\'objet du message"></div>' +
          '<div class="champ"><label for="m-corps">Message</label>' +
            '<textarea id="m-corps" placeholder="Ton message…"></textarea>' +
            '<p class="vars">Variables remplacées à l\'envoi : ' +
              '<code data-v="prenom">{{prenom}}</code> ' +
              '<code data-v="nom">{{nom}}</code> ' +
              '<code data-v="email">{{email}}</code> ' +
              '<code data-v="date">{{date}}</code></p></div>' +
          '<div class="champ" style="margin-bottom:0"><label>Aperçu pour ' +
            esc(nomComplet(cibles[0])) + '</label>' +
            '<div class="apercu" id="m-apercu"></div></div>' +
        '</div>' +
        '<div class="bf">' +
          '<span class="from">de ' + esc(EXPEDITEUR) + '</span>' +
          '<button class="btn ghost" id="m-annuler">Annuler</button>' +
          '<button class="btn ghost" id="m-logiciel">Ouvrir dans mon logiciel</button>' +
          '<button class="btn" id="m-envoyer">Envoyer</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(boite);
    requestAnimationFrame(function () { boite.classList.add('on'); });

    /* Le repli « logiciel de mail » n'a de sens que pour un destinataire. */
    if (groupe) document.getElementById('m-logiciel').style.display = 'none';

    document.getElementById('m-chips').innerHTML = modeles.map(function (m, i) {
      return '<button class="chip' + (i === 0 ? ' on' : '') + '" data-m="' + esc(m.id) + '">' +
             esc(m.titre) + '</button>';
    }).join('');

    appliquer(modeles[0]);

    document.getElementById('m-chips').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-m]'); if (!b) return;
      document.querySelectorAll('#m-chips .chip').forEach(function (c) { c.classList.remove('on'); });
      b.classList.add('on');
      var m = modeles.filter(function (x) { return x.id === b.dataset.m; })[0];
      if (m) appliquer(m);
    });

    document.getElementById('m-objet').addEventListener('input', rafraichirApercu);
    document.getElementById('m-corps').addEventListener('input', rafraichirApercu);

    /* Cliquer une variable l'insère à l'endroit du curseur. */
    boite.querySelector('.vars').addEventListener('click', function (ev) {
      var c = ev.target.closest('code[data-v]'); if (!c) return;
      var z = document.getElementById('m-corps');
      var p = z.selectionStart || 0;
      var jeton = '{{' + c.dataset.v + '}}';
      z.value = z.value.slice(0, p) + jeton + z.value.slice(z.selectionEnd || p);
      z.focus();
      z.selectionStart = z.selectionEnd = p + jeton.length;
      rafraichirApercu();
    });

    document.getElementById('m-annuler').addEventListener('click', fermer);
    document.getElementById('m-logiciel').addEventListener('click', ouvrirLogiciel);
    document.getElementById('m-envoyer').addEventListener('click', envoyer);
    boite.addEventListener('click', function (ev) { if (ev.target === boite) fermer(); });
    document.addEventListener('keydown', touche);

    setTimeout(function () { document.getElementById('m-objet').focus(); }, 60);
  }

  function touche(ev) {
    if (ev.key === 'Escape') fermer();
    if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') envoyer();
  }

  function appliquer(m) {
    document.getElementById('m-objet').value = m.objet || '';
    document.getElementById('m-corps').value = m.corps || '';
    document.getElementById('m-objet').dataset.modele = m.id;
    rafraichirApercu();
  }

  function rafraichirApercu() {
    var u = cibles[0];
    var o = fusionner(document.getElementById('m-objet').value, u);
    var c = fusionner(document.getElementById('m-corps').value, u);
    document.getElementById('m-apercu').innerHTML =
      '<span class="obj">' + (esc(o) || '<em style="color:var(--faint)">objet vide</em>') + '</span>' + esc(c);
  }

  function fermer() {
    document.removeEventListener('keydown', touche);
    var b = document.getElementById('mailbox');
    if (b && b.parentNode) b.parentNode.removeChild(b);
    boite = null;
  }

  /* ─── Repli : le logiciel de mail du navigateur ───────────── */
  function ouvrirLogiciel() {
    var u = cibles[0];
    var o = fusionner(document.getElementById('m-objet').value, u);
    var c = fusionner(document.getElementById('m-corps').value, u);
    var lien = 'mailto:' + encodeURIComponent(u.email) +
               '?subject=' + encodeURIComponent(o) +
               '&body=' + encodeURIComponent(c);
    if (lien.length > 1900) return toast('Message trop long pour le logiciel de mail.', 'err');
    location.href = lien;
    fermer();
  }

  /* ─── Envoi réel ──────────────────────────────────────────── */
  function envoyer() {
    var objet = document.getElementById('m-objet').value.trim();
    var corps = document.getElementById('m-corps').value.trim();
    var modele = document.getElementById('m-objet').dataset.modele || 'libre';

    if (!objet) return toast('Il manque l\'objet du message.', 'err');
    if (!corps) return toast('Le message est vide.', 'err');
    if (cibles.length > 1 &&
        !confirm('Envoyer ce message à ' + cibles.length + ' membres ?')) return;

    var bouton = document.getElementById('m-envoyer');
    bouton.disabled = true;
    bouton.textContent = 'Envoi…';

    Ad.envoyerMail(cibles.map(function (u) {
      return { id: u.id, email: u.email, prenom: u.prenom, nom: u.nom };
    }), objet, corps, modele)
      .then(function (r) {
        var n = (r && r.envoyes) || cibles.length;
        var ratés = (r && r.echecs) || [];
        fermer();
        if (ratés.length) toast(n + ' message(s) envoyé(s), ' + ratés.length + ' en échec.', 'err');
        else toast(n === 1 ? 'Message envoyé à ' + cibles[0].email + '.' : n + ' messages envoyés.', 'ok');
      })
      .catch(function (e) {
        bouton.disabled = false;
        bouton.textContent = 'Envoyer';
        if (String(e.message) === 'fonction_absente') {
          if (cibles.length === 1) {
            toast('Envoi automatique pas encore installé. Bascule vers ton logiciel de mail.');
            setTimeout(ouvrirLogiciel, 700);
          } else {
            toast('Envoi automatique pas encore installé (voir GUIDE-MAILS.md).', 'err');
          }
          return;
        }
        toast(String(e.message || e), 'err');
      });
  }

  window.ECGMails = { ouvrir: ouvrir, charger: chargerModeles, modeles: function () { return modeles; } };
  chargerModeles();
})();
