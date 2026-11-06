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
      '#p-premium .bloc{background:var(--surface);border:1px solid var(--border);border-radius:14px;margin-bottom:20px;overflow:hidden}',
      '#p-premium .bloc>header{padding:20px 22px 6px;margin:0;display:block}',
      '#p-premium .bloc>header h3{font-family:"Playfair Display",serif;font-size:1.2rem;font-weight:700}',
      '#p-premium .bloc>header p{color:var(--dim);font-size:.8rem;font-weight:300;line-height:1.65;margin-top:6px;max-width:680px}',
      '#p-premium .groupe{font-family:"DM Mono",monospace;font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);padding:16px 22px 4px}',
      '#p-premium .setting{padding:12px 22px}',
      '#p-premium .sw.on{background:rgba(200,169,110,.2);border-color:var(--accent)}',
      '#p-premium .sw.on::after{background:var(--accent)}',
      '#p-premium .sw:disabled{opacity:.4;cursor:wait}',
      '#p-premium .verrou{color:var(--danger);font-size:.72rem;margin-left:8px}',
      '#p-premium .alerte{border-color:rgba(224,138,138,.35)}',
      '#p-premium .alerte header h3{color:var(--danger)}',
      '#p-premium .code-ligne{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:14px 22px 22px}',
      '#p-premium .code-ligne input{flex:1;min-width:220px;max-width:360px;font-family:"DM Mono",monospace}',
      '#p-premium .mini{background:none;border:1px solid var(--border);color:var(--dim);font-size:.72rem;padding:5px 10px;border-radius:7px}',
      '#p-premium .mini:hover{border-color:var(--danger);color:var(--danger)}',
      '#p-premium .mini.neutre:hover{border-color:var(--accent);color:var(--accent)}',
      '#p-premium .code-ligne .court{flex:0 1 150px;min-width:120px;max-width:170px;font-family:"DM Sans",sans-serif}',
      '#p-premium .code-ligne .nom{flex:1 1 200px;min-width:180px;max-width:280px;font-family:"DM Sans",sans-serif}',
      '#p-premium .codes td{vertical-align:middle}',
      '#p-premium .codes .c-code{font-family:"DM Mono",monospace;font-size:.92rem;color:var(--text);letter-spacing:.04em}',
      '#p-premium .codes .c-nb{font-family:"Playfair Display",serif;font-size:1.6rem;font-weight:700;line-height:1;color:var(--accent)}',
      '#p-premium .codes .c-nb small{font-family:"DM Mono",monospace;font-size:.72rem;font-weight:400;color:var(--dim);margin-left:4px}',
      '#p-premium .codes tr.coupe .c-code,#p-premium .codes tr.coupe .c-nb{opacity:.45}',
      '#p-premium .codes .plein{color:var(--danger)}',
      '#p-premium .codes .acts2{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}',
      '#p-premium .codes tr.detail td{background:var(--surface2);padding:12px 22px 16px}',
      '#p-premium .codes .membres{display:flex;flex-direction:column;gap:6px;font-size:.8rem}',
      '#p-premium .codes .membres div{display:flex;gap:10px;flex-wrap:wrap;align-items:baseline}',
      '#p-premium .codes .membres .retire{color:var(--faint);text-decoration:line-through}',
      '@media(max-width:640px){' +
        '#p-premium .codes thead{display:none}' +
        '#p-premium .codes tr:not(.detail){display:grid;grid-template-columns:1fr auto;gap:10px 12px;padding:16px;border-bottom:1px solid rgba(42,42,53,.55)}' +
        '#p-premium .codes tr:not(.detail) td{display:block;padding:0;border:0}' +
        '#p-premium .codes tr:not(.detail) td:nth-child(3){display:none}' +
        '#p-premium .codes tr:not(.detail) td:nth-child(4){grid-column:2;grid-row:1}' +
        '#p-premium .codes tr:not(.detail) td:nth-child(5){grid-column:1 / -1}' +
        '#p-premium .codes .acts2{justify-content:flex-start}' +
        '#p-premium .codes tr.detail td{display:block;padding:12px 16px}' +
        '#p-premium .codes .membres .mono{white-space:normal}' +
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  var etat = { rubriques: [], abonnes: [], codes: [], ouvert: null };

  function batir() {
    var hote = document.getElementById('p-premium');
    if (!hote || hote.dataset.pret) return;
    hote.dataset.pret = '1';
    poserStyles();
    hote.innerHTML =
      '<div class="stats" id="pr-stats"></div>' +
      '<div id="pr-alerte"></div>' +
      '<div class="bloc"><header><h3>Codes d\'accès au Premium</h3>' +
      '<p>Chaque code ouvre tout le Premium gratuitement, sans date de fin, à qui le saisit dans « Mon abonnement ». ' +
      'Crée un code par groupe ou par canal (une classe, un réseau social…) pour savoir combien de personnes chacun a fait venir. ' +
      'Couper ou supprimer un code n\'enlève rien à ceux qui l\'ont déjà utilisé : pour retirer un accès, utilise « Retirer » dans la liste des abonnés.</p></header>' +
      '<form class="code-ligne" id="pr-code-form" autocomplete="off">' +
      '<input type="text" id="pr-code" placeholder="Code (6 caractères minimum)" spellcheck="false" maxlength="40" aria-label="Nouveau code">' +
      '<button class="btn ghost" type="button" id="pr-code-gen">Générer</button>' +
      '<input type="text" class="nom" id="pr-code-nom" placeholder="Nom (ex. : Instagram)" maxlength="60" aria-label="Nom du code">' +
      '<input type="text" class="court" id="pr-code-limite" inputmode="numeric" placeholder="Limite (facultatif)" aria-label="Nombre maximum de personnes">' +
      '<button class="btn" type="submit">Créer le code</button></form>' +
      '<div class="scroll"><table class="codes"><thead><tr><th>Code</th><th>Utilisé par</th><th>Dernière utilisation</th><th>Actif</th><th></th></tr></thead>' +
      '<tbody id="pr-codes"></tbody></table></div>' +
      '<div class="empty" id="pr-codes-vide" style="display:none">Aucun code pour l\'instant : crée le premier ci-dessus.</div></div>' +
      '<div class="bloc"><header><h3>Offrir le Premium à un membre</h3>' +
      '<p>Choisis un compte : il obtient tout le Premium gratuitement, sans date de fin (retirable depuis la liste des abonnés).</p></header>' +
      '<form class="code-ligne" id="pr-offrir-form" autocomplete="off">' +
      '<input type="text" id="pr-offrir" list="pr-membres" placeholder="Adresse e-mail du membre" spellcheck="false">' +
      '<datalist id="pr-membres"></datalist>' +
      '<button class="btn" type="submit">Offrir le Premium</button></form></div>' +
      '<div class="bloc"><header><h3>Abonnés</h3>' +
      '<p>Abonnés payants (mis à jour automatiquement par Stripe) et accès offerts par code. Remboursements, factures et litiges : ' +
      '<a href="' + STRIPE_DASHBOARD + '" target="_blank" rel="noopener" style="color:var(--blue)">tableau de bord Stripe</a>.</p></header>' +
      '<div class="scroll"><table><thead><tr><th>Membre</th><th>Offre</th><th>Statut</th><th>Échéance</th><th>Depuis</th><th></th></tr></thead>' +
      '<tbody id="pr-abonnes"></tbody></table></div>' +
      '<div class="empty" id="pr-vide" style="display:none">Aucun abonné pour le moment.</div></div>';
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
    var tb = $('#pr-codes');
    var liste = etat.codes || [];
    $('#pr-codes-vide').style.display = liste.length ? 'none' : 'block';
    tb.innerHTML = liste.map(function (c) {
      var plein = c.limite && c.utilisations >= c.limite;
      var ligne = '<tr class="' + (c.actif ? '' : 'coupe') + '">' +
        '<td><div class="c-code">' + esc(c.code) + '</div>' +
        '<div class="mono" style="margin-top:4px">' + esc(c.libelle || 'Sans nom') + ' · créé le ' + date(c.cree_le) + '</div></td>' +
        '<td><span class="c-nb">' + c.utilisations + (c.limite ? '<small class="' + (plein ? 'plein' : '') + '">/ ' + c.limite + '</small>' : '') + '</span>' +
        '<div class="mono" style="margin-top:4px">personne' + (c.utilisations > 1 ? 's' : '') +
        (c.utilisations ? ' · ' + c.en_cours + ' accès en cours' : '') + (plein ? ' · <span class="plein">complet</span>' : '') + '</div></td>' +
        '<td class="mono">' + date(c.derniere) + '</td>' +
        '<td><button class="sw' + (c.actif ? ' on' : '') + '" data-act="actif" data-id="' + c.id + '" aria-label="Code ' + esc(c.code) + (c.actif ? ' actif' : ' coupé') + '"></button></td>' +
        '<td><div class="acts2">' +
        (c.utilisations ? '<button class="mini neutre" data-act="voir" data-id="' + c.id + '">' + (etat.ouvert === c.id ? 'Masquer' : 'Qui ?') + '</button>' : '') +
        '<button class="mini neutre" data-act="copier" data-id="' + c.id + '">Copier</button>' +
        '<button class="mini neutre" data-act="renommer" data-id="' + c.id + '">Nom</button>' +
        '<button class="mini neutre" data-act="limite" data-id="' + c.id + '">Limite</button>' +
        '<button class="mini" data-act="suppr" data-id="' + c.id + '">Supprimer</button>' +
        '</div></td></tr>';
      if (etat.ouvert === c.id) {
        ligne += '<tr class="detail"><td colspan="5"><div class="membres">' + (c.membres || []).map(function (m) {
          var nom = ((m.prenom || '') + ' ' + (m.nom || '')).trim();
          return '<div class="' + (m.actif ? '' : 'retire') + '"><b style="font-weight:500">' + esc(nom || '—') + '</b>' +
            '<span class="mono">' + esc(m.email || '') + '</span><span class="mono">' + date(m.t) + '</span>' +
            (m.actif ? '' : '<span class="mono">accès retiré ou remplacé</span>') + '</div>';
        }).join('') + '</div></td></tr>';
      }
      return ligne;
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
          '<div class="bloc alerte"><header><h3>Installation incomplète</h3>' +
          '<p>La base ne connaît pas encore l\'abonnement Premium. Lance <b>supabase/premium.sql</b> dans Supabase ' +
          '(SQL Editor), puis suis <b>MONETISATION.md</b>.</p></header></div>';
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
    var mrr = 0, parOffre = { mensuel: 0, annuel: 0 }, resilies = 0;
    var offerts = etat.abonnes.filter(function (a) { return a.statut === 'offert'; }).length;
    actifs.forEach(function (a) {
      var o = offres[a.offre];
      if (o) mrr += o.prix / o.mois;
      if (parOffre[a.offre] !== undefined) parOffre[a.offre]++;
      if (a.annulation_prevue) resilies++;
    });
    $('#pr-stats').innerHTML =
      '<div class="stat" style="--c:var(--accent)"><b>' + actifs.length + '</b><span>Abonnés actifs</span></div>' +
      '<div class="stat" style="--c:var(--green)"><b>' + euros(mrr) + '</b><span>Revenu mensuel estimé</span></div>' +
      '<div class="stat" style="--c:var(--blue)"><b>' + parOffre.mensuel + ' / ' + parOffre.annuel + '</b><span>Mensuels / annuels</span></div>' +
      '<div class="stat" style="--c:var(--danger)"><b>' + resilies + '</b><span>Résiliés (fin de période)</span></div>' +
      '<div class="stat" style="--c:var(--pink)"><b>' + offerts + '</b><span>Accès offerts</span></div>';
    var badge = document.getElementById('c-premium');
    if (badge) badge.textContent = actifs.length + offerts;
  }

  function rendreAbonnes() {
    var tb = $('#pr-abonnes');
    $('#pr-vide').style.display = etat.abonnes.length ? 'none' : 'block';
    tb.innerHTML = etat.abonnes.map(function (a) {
      var offert = a.statut === 'offert';
      var actif = offert || ACTIFS.indexOf(a.statut) !== -1;
      var couleur = a.statut === 'past_due' ? 'var(--danger)' : offert ? 'var(--accent)' : actif ? 'var(--green)' : 'var(--faint)';
      return '<tr>' +
        '<td><b style="font-weight:500">' + esc(((a.prenom || '') + ' ' + (a.nom || '')).trim() || '—') + '</b>' +
        '<div class="mono" style="margin-top:3px">' + esc(a.email || a.utilisateur) + '</div></td>' +
        '<td>' + esc(a.offre === 'annuel' ? 'Annuel' : a.offre === 'mensuel' ? 'Mensuel' : offert ? 'Gratuit' : '—') + '</td>' +
        '<td><span style="color:' + couleur + '">' + esc(offert ? (a.code ? 'Offert (code)' : 'Offert (direct)') : (LIBELLES[a.statut] || a.statut)) + '</span>' +
        (offert && a.code ? '<div class="mono" style="margin-top:3px">' + esc(a.code) + '</div>' : '') +
        (actif && a.annulation_prevue ? '<div class="mono" style="margin-top:3px">résilié</div>' : '') + '</td>' +
        '<td class="mono">' + date(a.fin_periode) + '</td>' +
        '<td class="mono">' + date(a.cree_le) + '</td>' +
        '<td style="text-align:right">' + (offert
          ? '<button class="mini" data-retirer="' + esc(a.utilisateur) + '" data-email="' + esc(a.email || '') + '">Retirer</button>' : '') + '</td>' +
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
