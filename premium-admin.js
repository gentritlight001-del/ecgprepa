/* ══════════════════════════════════════════════════════════════════
   ECG Prépa — Abonnement Premium, côté administration

   Construit tout seul l'onglet « Premium » de la page d'admin :
     1. les chiffres (abonnés actifs, revenu mensuel estimé) ;
     2. les rubriques réservées aux abonnés, à cocher ;
     3. la liste des abonnés.
   Le détail des paiements, remboursements et factures reste dans le
   tableau de bord Stripe.

   Chargé par admin.html, après auth.js.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var A = window.ECGAuth;
  if (!A || !A.admin) return;
  var Ad = A.admin;

  var STRIPE_DASHBOARD = 'https://dashboard.stripe.com/';

  var ACTIFS = ['active', 'trialing', 'past_due'];
  var LIBELLES = {
    active: 'Actif', trialing: 'Essai', past_due: 'Impayé (relance)', canceled: 'Terminé',
    unpaid: 'Impayé', incomplete: 'Incomplet', incomplete_expired: 'Expiré', paused: 'En pause',
    offert: 'Offert (code)'
  };

  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toast(txt, kind) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = txt; t.className = 'show ' + (kind || '');
    clearTimeout(t._h); t._h = setTimeout(function () { t.className = ''; }, 4200);
  }
  function date(v) {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function euros(n) {
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  function poserStyles() {
    if (document.getElementById('ecg-prem-css')) return;
    var s = document.createElement('style');
    s.id = 'ecg-prem-css';
    s.textContent = [
      '#p-premium .pr-chiffres{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:20px}',
      '#p-premium .pr-ca{grid-column:span 2;border-color:rgba(200,169,110,.35)}',
      '#p-premium .pr-ca .v b{font-size:46px;color:var(--accent)}',
      '#p-premium .pr-split{display:flex;height:10px;border-radius:999px;overflow:hidden;background:var(--surface2)}',
      '#p-premium .pr-grille{display:flex;gap:16px;align-items:flex-start}',
      '#p-premium .pr-abo{flex:1 1 auto;min-width:0}',
      '#p-premium .pr-cote{flex:0 0 360px;display:flex;flex-direction:column;gap:16px}',
      '#p-premium .pr-tete{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;padding:18px 22px}',
      '#p-premium .pr-tete h2{font-size:17px;font-weight:600}',
      '#p-premium .pr-tete .puces{margin:0}',
      '#p-premium .pr-tete .puce{min-height:34px;padding:0 14px;font-size:13px}',
      '#p-premium .pr-abo td,#p-premium .pr-abo th{padding:12px}',
      '#p-premium .pr-abo th:first-child,#p-premium .pr-abo td:first-child{padding-left:22px}',
      '#p-premium .pr-abo th:last-child,#p-premium .pr-abo td:last-child{padding-right:22px;text-align:right}',
      '#p-premium .pr-abo .e{display:block;font-size:12px;color:var(--dim);word-break:break-all}',
      '#p-premium .pr-abo small{display:block;font-size:12px;color:var(--faint);margin-top:3px}',
      '#p-premium .pr-abo td:first-child{min-width:190px}#p-premium .pr-abo small{white-space:nowrap}',
      '#p-premium .ech{font-size:13px;color:#c9c7c0;white-space:nowrap}',
      '#p-premium .ech.fin{color:var(--danger)}',
      '#p-premium .ech.bientot{color:#e3c88f}',
      '#p-premium .pr-bloc{padding:20px;display:flex;flex-direction:column;gap:12px}',
      '#p-premium .pr-bloc h2{font-size:17px;font-weight:600}',
      '#p-premium .pr-bloc form{display:flex;flex-direction:column;gap:10px}',
      '#p-premium .pr-bloc input[type=text]{width:100%;border-radius:999px}',
      '#p-premium .pr-bloc form .ligne{display:flex;gap:8px}',
      '#p-premium .pr-bloc form .ligne input{flex:1;min-width:0}',
      '#p-premium #pr-code{font-family:"DM Mono",monospace;letter-spacing:.04em}',
      '#p-premium #pr-code-form[hidden]{display:none}',
      '#p-premium .pr-code{padding:14px;border-radius:12px;background:var(--surface2);display:flex;flex-direction:column;gap:8px}',
      '#p-premium .pr-code.coupe{opacity:.72}',
      '#p-premium .pr-code .l1{display:flex;justify-content:space-between;align-items:center;gap:10px}',
      '#p-premium .pr-code .c{font-family:"DM Mono",monospace;font-size:15px;font-weight:500;letter-spacing:.06em;word-break:break-all}',
      '#p-premium .pr-code .l2{font-size:13px;color:var(--dim)}',
      '#p-premium .pr-code .l3{display:flex;align-items:center;gap:10px;font-size:13px}',
      '#p-premium .pr-code .l3 .j{flex:1;height:6px;border-radius:3px;background:var(--bg);overflow:hidden}',
      '#p-premium .pr-code .l3 .j i{display:block;height:100%;border-radius:3px;background:var(--accent)}',
      '#p-premium .pr-code.coupe .l3 .j i{background:#4a4845}',
      '#p-premium .pr-code .plein{color:var(--danger)}',
      '#p-premium .pr-code .acts2{display:flex;gap:6px;flex-wrap:wrap}',
      '#p-premium .pr-code .acts2 .mini{min-height:30px;padding:0 12px;font-size:12px}',
      '#p-premium .pr-code .membres{display:flex;flex-direction:column;gap:6px;font-size:13px;padding-top:8px;border-top:1px solid var(--border)}',
      '#p-premium .pr-code .membres .retire{color:var(--faint);text-decoration:line-through}',
      '#p-premium .pr-code .membres small{color:var(--faint)}',
      '#p-premium .alerte-r{margin-bottom:20px}',
      '@media(max-width:1180px){#p-premium .pr-chiffres{grid-template-columns:repeat(3,minmax(0,1fr))}#p-premium .pr-grille{flex-direction:column}#p-premium .pr-cote{flex:none;width:100%}}',
      '@media(max-width:640px){#p-premium .pr-chiffres{grid-template-columns:repeat(2,minmax(0,1fr))}' +
        '#p-premium .pr-abo th:nth-child(4),#p-premium .pr-abo td:nth-child(4){display:none}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  var etat = { rubriques: [], abonnes: [], codes: [], ouvert: null, filtre: '' };

  function batir() {
    var hote = document.getElementById('p-premium');
    if (!hote || hote.dataset.pret) return;
    hote.dataset.pret = '1';
    poserStyles();
    hote.innerHTML =
      '<div id="pr-alerte"></div>' +
      '<section class="pr-chiffres" id="pr-stats" aria-label="Chiffres du Premium"></section>' +
      '<div class="pr-grille">' +
        '<section class="card pr-abo" aria-labelledby="pr-t-abo">' +
          '<div class="pr-tete"><h2 id="pr-t-abo">Abonnés</h2>' +
            '<div class="puces" id="pr-filtres" role="group" aria-label="Filtrer les abonnés"></div></div>' +
          '<div class="scroll"><table><thead><tr><th>Membre</th><th>Offre</th><th>Prochaine échéance</th><th>Depuis</th></tr></thead>' +
          '<tbody id="pr-abonnes"></tbody></table></div>' +
          '<div class="empty" id="pr-vide" style="display:none">Aucun abonné pour le moment.</div>' +
          '<p class="aide" style="padding:14px 22px;border-top:1px solid var(--surface2)">Paiements par Stripe, mis à jour automatiquement. Remboursements, factures et litiges : ' +
            '<a href="' + STRIPE_DASHBOARD + '" target="_blank" rel="noopener">tableau de bord Stripe ↗</a></p>' +
        '</section>' +
        '<aside class="pr-cote">' +
          '<section class="card pr-bloc" aria-labelledby="pr-t-offrir">' +
            '<h2 id="pr-t-offrir">Offrir le Premium</h2>' +
            '<p class="aide">Sans date de fin, retirable à tout moment depuis la liste des abonnés.</p>' +
            '<form id="pr-offrir-form" autocomplete="off">' +
              '<input type="text" id="pr-offrir" list="pr-membres" placeholder="Adresse e-mail d\'un membre…" spellcheck="false" aria-label="Adresse e-mail du membre">' +
              '<datalist id="pr-membres"></datalist>' +
              '<button class="btn plein" type="submit">Offrir</button>' +
            '</form>' +
          '</section>' +
          '<section class="card pr-bloc" aria-labelledby="pr-t-codes">' +
            '<div class="boite-t"><h2 id="pr-t-codes">Codes d\'accès</h2>' +
              '<button type="button" class="mini or" id="pr-nouveau" aria-expanded="false" aria-controls="pr-code-form">+ Nouveau code</button></div>' +
            '<p class="aide">Chaque code ouvre tout le Premium, sans date de fin, à qui le saisit dans « Mon abonnement ». Un code par groupe ou par canal ' +
              'dit combien de personnes chacun a fait venir. Couper un code n\'enlève rien à ceux qui l\'ont déjà utilisé.</p>' +
            '<form id="pr-code-form" autocomplete="off" hidden>' +
              '<div class="ligne"><input type="text" id="pr-code" placeholder="Code (6 caractères minimum)" spellcheck="false" maxlength="40" aria-label="Nouveau code">' +
              '<button class="btn ghost" type="button" id="pr-code-gen">Générer</button></div>' +
              '<input type="text" id="pr-code-nom" placeholder="Nom (ex. : Instagram)" maxlength="60" aria-label="Nom du code">' +
              '<input type="text" id="pr-code-limite" inputmode="numeric" placeholder="Nombre maximum de personnes (facultatif)" aria-label="Nombre maximum de personnes">' +
              '<button class="btn plein" type="submit">Créer le code</button>' +
            '</form>' +
            '<div id="pr-codes" style="display:flex;flex-direction:column;gap:10px"></div>' +
            '<div class="empty" id="pr-codes-vide" style="display:none;padding:18px 0">Aucun code pour l\'instant.</div>' +
          '</section>' +
        '</aside>' +
      '</div>';
    $('#pr-nouveau').addEventListener('click', function () {
      var f = $('#pr-code-form'), ouvrir = f.hidden;
      f.hidden = !ouvrir; this.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
      if (ouvrir) $('#pr-code').focus();
    });
    $('#pr-filtres').addEventListener('click', function (e) {
      var b = e.target.closest('[data-f]'); if (!b) return;
      etat.filtre = b.dataset.f; rendreAbonnes();
    });
    brancherCode();
    brancherOffrir();
    rafraichir();
  }

  function brancherOffrir() {
    var membres = [];
    Ad.utilisateurs().then(function (l) {
      membres = l || [];
      $('#pr-membres').innerHTML = membres.map(function (u) {
        return '<option value="' + esc(u.email || '') + '">' + esc(((u.prenom || '') + ' ' + (u.nom || '')).trim()) + '</option>';
      }).join('');
    }).catch(function () {});
    $('#pr-offrir-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#pr-offrir').value.trim().toLowerCase();
      var u = membres.filter(function (m) { return (m.email || '').toLowerCase() === v; })[0];
      if (!u) { toast('Aucun membre avec cette adresse.', 'err'); return; }
      if (!confirm('Offrir le Premium à ' + u.email + ' ?')) return;
      Ad.offrirPremium(u, function (ok, cause) {
        toast(ok ? 'Mail envoyé à ' + u.email + '.' : 'Le mail n\'a pas pu partir (le Premium est bien offert)' + (cause === 'fonction_absente' ? ' : la fonction « envoyer-mail » n\'est pas déployée.' : cause ? ' : ' + cause : '.'), ok ? 'ok' : 'err');
      }).then(function () {
        $('#pr-offrir').value = '';
        toast('Premium offert à ' + u.email + '.', 'ok');
        return rafraichir();
      }).catch(function (err) { toast(String((err && err.message) || err), 'err'); });
    });
  }

  function genererCode() {
    var lettres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c = '';
    var alea = new Uint32Array(8);
    (window.crypto || window.msCrypto).getRandomValues(alea);
    for (var i = 0; i < 8; i++) c += lettres[alea[i] % lettres.length];
    return 'ECG-' + c;
  }

  function erreur(err) { toast(String((err && err.message) || err), 'err'); }

  function brancherCode() {
    $('#pr-code-gen').addEventListener('click', function () { $('#pr-code').value = genererCode(); $('#pr-code-nom').focus(); });
    $('#pr-code-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#pr-code').value.trim();
      var lim = $('#pr-code-limite').value.trim();
      if (v.length < 6) { toast('Choisis un code d\'au moins 6 caractères.', 'err'); return; }
      if (lim && !/^\d+$/.test(lim)) { toast('La limite doit être un nombre de personnes.', 'err'); return; }
      Ad.creerCode(v, $('#pr-code-nom').value.trim(), lim).then(function () {
        $('#pr-code').value = ''; $('#pr-code-nom').value = ''; $('#pr-code-limite').value = '';
        toast('Code « ' + v + ' » créé et actif.', 'ok');
        return rafraichir();
      }).catch(erreur);
    });
    $('#pr-codes').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-act]');
      if (!b) return;
      var id = Number(b.dataset.id);
      var c = etat.codes.filter(function (x) { return x.id === id; })[0];
      if (!c) return;
      var act = b.dataset.act;
      if (act === 'voir') { etat.ouvert = etat.ouvert === id ? null : id; rendreCodes(); return; }
      if (act === 'copier') {
        (navigator.clipboard ? navigator.clipboard.writeText(c.code) : Promise.reject())
          .then(function () { toast('Code copié.', 'ok'); }, function () { toast('Copie impossible : ' + c.code, 'err'); });
        return;
      }
      var p;
      if (act === 'actif') {
        b.disabled = true;
        p = Ad.modifierCode(id, { actif: !c.actif }).then(function () { toast(c.actif ? 'Code coupé.' : 'Code réactivé.', 'ok'); });
      } else if (act === 'renommer') {
        var nom = prompt('Nom du code « ' + c.code + ' » (vide pour l\'enlever) :', c.libelle || '');
        if (nom === null) return;
        p = Ad.modifierCode(id, { libelle: nom.trim() });
      } else if (act === 'limite') {
        var l = prompt('Nombre maximum de personnes pour « ' + c.code + ' » (vide ou 0 = sans limite) :', c.limite || '');
        if (l === null) return;
        l = l.trim();
        if (l && !/^\d+$/.test(l)) { toast('La limite doit être un nombre.', 'err'); return; }
        p = Ad.modifierCode(id, { limite: l || 0 });
      } else if (act === 'suppr') {
        if (!confirm('Supprimer le code « ' + c.code + ' » ? Les ' + c.en_cours + ' accès ouverts avec lui restent, mais son compteur disparaît.')) return;
        p = Ad.supprimerCode(id).then(function () { toast('Code supprimé.', 'ok'); });
      }
      if (p) p.then(rafraichir).catch(erreur).then(function () { b.disabled = false; });
    });
  }

  function rendreCodes() {
    var liste = etat.codes || [];
    $('#pr-codes-vide').style.display = liste.length ? 'none' : 'block';
    $('#pr-codes').innerHTML = liste.map(function (c) {
      var plein = c.limite && c.utilisations >= c.limite;
      var largeur = c.limite ? Math.min(100, Math.round(100 * c.utilisations / c.limite)) : (c.utilisations ? 100 : 0);
      var html = '<article class="pr-code' + (c.actif ? '' : ' coupe') + '">' +
        '<div class="l1"><span class="c">' + esc(c.code) + '</span><span class="pill ' + (c.actif ? 'p-actif' : 'p-gratuit') + '">' + (c.actif ? 'Actif' : 'Coupé') + '</span></div>' +
        '<div class="l2">' + esc(c.libelle || 'Sans nom') + ' · créé le ' + date(c.cree_le) + (c.derniere ? ' · dernier usage le ' + date(c.derniere) : '') + '</div>' +
        '<div class="l3"><span class="j"><i style="width:' + largeur + '%"></i></span><span>' + c.utilisations + (c.limite ? ' / ' + c.limite : '') +
          ' personne' + (c.utilisations > 1 ? 's' : '') + (plein ? ' · <span class="plein">complet</span>' : '') + '</span></div>' +
        (c.utilisations && c.en_cours !== c.utilisations ? '<div class="l2">' + c.en_cours + ' accès en cours</div>' : '') +
        '<div class="acts2">' +
          '<button type="button" class="mini" data-act="copier" data-id="' + c.id + '">Copier</button>' +
          '<button type="button" class="mini" data-act="actif" data-id="' + c.id + '">' + (c.actif ? 'Couper' : 'Réactiver') + '</button>' +
          (c.utilisations ? '<button type="button" class="mini" data-act="voir" data-id="' + c.id + '" aria-expanded="' + (etat.ouvert === c.id) + '">' + (etat.ouvert === c.id ? 'Masquer' : 'Qui ?') + '</button>' : '') +
          '<button type="button" class="mini" data-act="renommer" data-id="' + c.id + '">Nom</button>' +
          '<button type="button" class="mini" data-act="limite" data-id="' + c.id + '">Limite</button>' +
          '<button type="button" class="mini bad" data-act="suppr" data-id="' + c.id + '">Supprimer</button>' +
        '</div>';
      if (etat.ouvert === c.id) {
        html += '<div class="membres">' + (c.membres || []).map(function (m) {
          var nom = ((m.prenom || '') + ' ' + (m.nom || '')).trim();
          return '<div class="' + (m.actif ? '' : 'retire') + '"><b style="font-weight:500">' + esc(nom || '—') + '</b> <small>' + esc(m.email || '') + ' · ' + date(m.t) +
            (m.actif ? '' : ' · accès retiré ou remplacé') + '</small></div>';
        }).join('') + '</div>';
      }
      return html + '</article>';
    }).join('');
  }

  function rafraichir() {
    return Promise.all([
      Ad.rubriques(),
      Ad.abonnes().catch(function (e) { return { erreur: e }; }),
      Ad.codesAcces().catch(function () { return null; })
    ]).then(function (r) {
      etat.rubriques = r[0] || [];
      etat.codes = r[2] || [];
      if (r[1] && r[1].erreur) {
        etat.abonnes = [];
        $('#pr-alerte').innerHTML =
          '<div class="alerte-r"><div><b>Installation incomplète.</b> La base ne connaît pas encore l\'abonnement Premium. Lance <b>supabase/premium.sql</b> dans Supabase ' +
          '(SQL Editor), puis suis <b>MONETISATION.md</b>.</div></div>';
      } else {
        etat.abonnes = r[1] || [];
        $('#pr-alerte').innerHTML = '';
      }
      rendreStats();
      rendreCodes();
      rendreAbonnes();
    });
  }

  function rendreStats() {
    var offres = {};
    A.premium.offres().forEach(function (o) { offres[o.id] = o; });
    var actifs = etat.abonnes.filter(function (a) { return ACTIFS.indexOf(a.statut) !== -1; });
    var mrr = 0, parOffre = { mensuel: 0, annuel: 0 }, caOffre = { mensuel: 0, annuel: 0 }, resilies = 0;
    var offerts = etat.abonnes.filter(function (a) { return a.statut === 'offert'; }).length;
    var semaine = Date.now() - 7 * 86400000, nouveaux = 0;
    actifs.forEach(function (a) {
      var o = offres[a.offre];
      if (o) { mrr += o.prix / o.mois; if (caOffre[a.offre] !== undefined) caOffre[a.offre] += o.prix / o.mois; }
      if (parOffre[a.offre] !== undefined) parOffre[a.offre]++;
      if (a.annulation_prevue) resilies++;
      if (a.cree_le && new Date(a.cree_le).getTime() >= semaine) nouveaux++;
    });
    function carte(libelle, valeur, sous, couleur) {
      return '<div class="kpi"><div class="l">' + libelle + '</div><div class="v"><b' + (couleur ? ' style="color:' + couleur + '"' : '') + '>' + valeur + '</b></div>' +
        '<div class="e" style="color:var(--dim)">' + sous + '</div></div>';
    }
    $('#pr-stats').innerHTML =
      '<div class="kpi pr-ca"><div class="l">Revenu mensuel estimé</div><div class="v"><b>' + euros(mrr) + '</b></div>' +
        (mrr ? '<div class="pr-split" role="img" aria-label="' + euros(caOffre.mensuel) + ' des mensuels, ' + euros(caOffre.annuel) + ' des annuels ramenés au mois">' +
          '<span style="flex:' + caOffre.mensuel + ';background:var(--accent)"></span><span style="flex:' + caOffre.annuel + ';background:var(--blue)"></span></div>' : '') +
        '<div class="legende2" style="flex-wrap:wrap"><span><i style="background:var(--accent)"></i>' + parOffre.mensuel + ' mensuel' + (parOffre.mensuel > 1 ? 's' : '') + ' · ' + euros(caOffre.mensuel) + '</span>' +
        '<span><i style="background:var(--blue)"></i>' + parOffre.annuel + ' annuel' + (parOffre.annuel > 1 ? 's' : '') + ' · ' + euros(caOffre.annuel) + ' par mois</span></div></div>' +
      carte('Abonnés payants', actifs.length, nouveaux ? '<span style="color:var(--green)">+' + nouveaux + ' cette semaine</span>' : 'abonnements en cours') +
      carte('Accès offerts', offerts, 'par code ou à la main') +
      carte('Résiliations prévues', resilies, 'actifs jusqu\'à la fin de la période', resilies ? 'var(--danger)' : '');
    var badge = document.getElementById('c-premium');
    if (badge) badge.textContent = (actifs.length + offerts) || '';
  }

  function categorie(a) {
    if (a.statut === 'offert') return 'offerts';
    if (ACTIFS.indexOf(a.statut) !== -1) return a.annulation_prevue ? 'resilies' : 'payants';
    return 'resilies';
  }

  function rendreAbonnes() {
    var cpt = { '': etat.abonnes.length, payants: 0, offerts: 0, resilies: 0 };
    etat.abonnes.forEach(function (a) { cpt[categorie(a)]++; });
    $('#pr-filtres').innerHTML = [['', 'Tous'], ['payants', 'Payants'], ['offerts', 'Offerts'], ['resilies', 'Résiliés']].map(function (f) {
      var on = etat.filtre === f[0];
      return '<button type="button" class="puce' + (on ? ' on' : '') + '" data-f="' + f[0] + '" aria-pressed="' + on + '">' + f[1] + '<span>' + cpt[f[0]] + '</span></button>';
    }).join('');
    var liste = etat.abonnes.filter(function (a) { return !etat.filtre || categorie(a) === etat.filtre; });
    var tb = $('#pr-abonnes');
    $('#pr-vide').style.display = liste.length ? 'none' : 'block';
    var dans7 = Date.now() + 7 * 86400000;
    tb.innerHTML = liste.map(function (a) {
      var offert = a.statut === 'offert';
      var actif = offert || ACTIFS.indexOf(a.statut) !== -1;
      var offre = offert ? '<span class="pill p-offert">Offert</span><small>' + (a.code ? 'code ' + esc(a.code) : 'à la main') + '</small>'
        : '<span class="pill ' + (actif ? 'p-prem' : 'p-gratuit') + '">' + esc(a.offre === 'annuel' ? 'Annuel' : a.offre === 'mensuel' ? 'Mensuel' : '—') + '</span>' +
          (a.statut !== 'active' ? '<small' + (a.statut === 'past_due' ? ' style="color:var(--danger)"' : '') + '>' + esc(LIBELLES[a.statut] || a.statut) + '</small>' : '');
      var fin = a.fin_periode ? new Date(a.fin_periode).getTime() : 0;
      var ech = offert ? '<span class="ech">sans fin</span>'
        : !a.fin_periode ? '<span class="ech">—</span>'
        : !actif ? '<span class="ech">terminé le ' + date(a.fin_periode) + '</span>'
        : a.annulation_prevue ? '<span class="ech fin">se termine le ' + date(a.fin_periode) + '</span>'
        : '<span class="ech' + (fin < dans7 ? ' bientot' : '') + '">' + date(a.fin_periode) + '</span>';
      return '<tr>' +
        '<td><b style="font-weight:500">' + esc(((a.prenom || '') + ' ' + (a.nom || '')).trim() || '—') + '</b><span class="e">' + esc(a.email || a.utilisateur) + '</span></td>' +
        '<td>' + offre + '</td><td>' + ech + '</td>' +
        '<td><span class="mono">' + date(a.cree_le) + '</span>' + (offert
          ? ' <button class="mini bad" data-retirer="' + esc(a.utilisateur) + '" data-email="' + esc(a.email || '') + '" style="margin-left:8px">Retirer</button>' : '') + '</td>' +
        '</tr>';
    }).join('');
    tb.querySelectorAll('[data-retirer]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!confirm('Retirer l\'accès Premium offert à ' + (b.dataset.email || 'ce membre') + ' ?')) return;
        b.disabled = true;
        Ad.retirerAccesOffert(b.dataset.retirer, b.dataset.email).then(function () {
          toast('Accès retiré.', 'ok');
          return rafraichir();
        }).catch(function (err) { b.disabled = false; toast(String((err && err.message) || err), 'err'); });
      });
    });
  }

  function demarrer(profil) {
    if (!profil || profil.role !== 'admin') return;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', batir);
    else batir();
  }

  document.addEventListener('ecg:pret', function (e) { demarrer(e.detail); });
  setTimeout(function () {
    var p = A.current && A.current();
    if (p && p.role === 'admin' && document.getElementById('p-premium')) demarrer(p);
  }, 1500);

  window.ECGPremiumAdmin = { rafraichir: rafraichir };
})();
