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
      '#p-premium .code-etat{font-size:.8rem;color:var(--dim);padding:0 22px 4px}',
      '#p-premium .code-etat b{color:var(--text);font-weight:500;font-family:"DM Mono",monospace}',
      '#p-premium .mini{background:none;border:1px solid var(--border);color:var(--dim);font-size:.72rem;padding:5px 10px;border-radius:7px}',
      '#p-premium .mini:hover{border-color:var(--danger);color:var(--danger)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  var etat = { rubriques: [], abonnes: [], code: null };

  function batir() {
    var hote = document.getElementById('p-premium');
    if (!hote || hote.dataset.pret) return;
    hote.dataset.pret = '1';
    poserStyles();
    hote.innerHTML =
      '<div class="stats" id="pr-stats"></div>' +
      '<div id="pr-alerte"></div>' +
      '<div class="bloc"><header><h3>Code d\'accès offert</h3>' +
      '<p>Donne ce code aux personnes à qui tu veux offrir le site : en le saisissant dans « Mon abonnement », ' +
      'elles obtiennent tout le Premium gratuitement, sans date de fin. Changer ou désactiver le code n\'enlève rien ' +
      'à ceux qui l\'ont déjà utilisé : pour retirer un accès, utilise « Retirer » dans la liste des abonnés.</p></header>' +
      '<div class="setting"><div><h3>Code actif</h3><p>Désactivé, plus personne ne peut l\'utiliser.</p></div>' +
      '<button class="sw" id="pr-code-actif" aria-label="Code d\'accès actif"></button></div>' +
      '<div class="code-etat" id="pr-code-etat"></div>' +
      '<form class="code-ligne" id="pr-code-form" autocomplete="off">' +
      '<input type="text" id="pr-code" placeholder="Nouveau code (6 caractères minimum)" spellcheck="false">' +
      '<button class="btn" type="submit">Enregistrer le code</button></form></div>' +
      '<div class="bloc"><header><h3>Offrir le Premium à un membre</h3>' +
      '<p>Choisis un compte : il obtient tout le Premium gratuitement, sans date de fin (retirable depuis la liste des abonnés).</p></header>' +
      '<form class="code-ligne" id="pr-offrir-form" autocomplete="off">' +
      '<input type="text" id="pr-offrir" list="pr-membres" placeholder="Adresse e-mail du membre" spellcheck="false">' +
      '<datalist id="pr-membres"></datalist>' +
      '<button class="btn" type="submit">Offrir le Premium</button></form></div>' +
      '<div class="bloc"><header><h3>Contenus Premium</h3>' +
      '<p>Une rubrique cochée n\'est plus accessible qu\'aux abonnés (et à toi). Elle reste visible pour les autres membres, ' +
      'avec un badge « Premium » qui mène à la page des tarifs. Tu peux aussi basculer un chapitre précis directement ' +
      'depuis sa carte, avec le bouton ✦. Une rubrique <em>verrouillée</em> reste fermée à tout le monde, abonnés compris.</p></header>' +
      '<div id="pr-rubriques"></div></div>' +
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
      Ad.offrirPremium(u).then(function (r) {
        $('#pr-offrir').value = '';
        toast('Premium offert à ' + u.email + (r && r.mail ? ' — mail envoyé.' : ' — mais le mail n\'a pas pu partir.'), r && r.mail ? 'ok' : 'err');
        return rafraichir();
      }).catch(function (err) { toast(String((err && err.message) || err), 'err'); });
    });
  }

  function brancherCode() {
    $('#pr-code-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#pr-code').value.trim();
      if (v.length < 6) { toast('Choisis un code d\'au moins 6 caractères.', 'err'); return; }
      Ad.definirCode(v, true).then(function () {
        $('#pr-code').value = '';
        toast('Code enregistré et activé.', 'ok');
        return rafraichir();
      }).catch(function (err) { toast(String((err && err.message) || err), 'err'); });
    });
    $('#pr-code-actif').addEventListener('click', function () {
      var b = this, vers = !b.classList.contains('on');
      if (vers && !(etat.code && etat.code.code)) { toast('Choisis d\'abord un code ci-dessous.', 'err'); return; }
      b.disabled = true;
      Ad.definirCode(null, vers).then(function () {
        toast(vers ? 'Code activé.' : 'Code désactivé.', 'ok');
        return rafraichir();
      }).catch(function (err) { toast(String((err && err.message) || err), 'err'); })
        .then(function () { b.disabled = false; });
    });
  }

  function rendreCode() {
    var c = etat.code;
    var sw = $('#pr-code-actif');
    sw.classList.toggle('on', !!(c && c.actif));
    $('#pr-code-etat').innerHTML = !c ? '' : c.code
      ? 'Code actuel : <b>' + esc(c.code) + '</b>' + (c.actif ? '' : ' (désactivé)') +
        ' · ' + c.offerts + ' accès offert' + (c.offerts > 1 ? 's' : '') + ' en cours'
      : 'Aucun code défini pour l\'instant.';
  }

  function rafraichir() {
    return Promise.all([
      Ad.rubriques(),
      Ad.abonnes().catch(function (e) { return { erreur: e }; }),
      Ad.etatCode().catch(function () { return null; })
    ]).then(function (r) {
      etat.rubriques = r[0] || [];
      etat.code = r[2];
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
      rendreCode();
      rendreRubriques();
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

  function rendreRubriques() {
    var par = {};
    etat.rubriques.forEach(function (r) { par[r.id] = r; });
    var connues = {};
    var html = '', groupe = null;
    Ad.listeRubriques().forEach(function (r) {
      connues[r.id] = 1;
      if (r.groupe !== groupe) { groupe = r.groupe; html += '<div class="groupe">' + esc(groupe) + '</div>'; }
      html += ligne(r.id, r.nom, par[r.id]);
    });
    /* Chapitres ou pages marqués individuellement depuis leur carte. */
    var autres = etat.rubriques.filter(function (r) { return r.premium && !connues[r.id]; });
    if (autres.length) {
      html += '<div class="groupe">Pages individuelles</div>';
      autres.forEach(function (r) { html += ligne(r.id, r.id, r); });
    }
    var hote = $('#pr-rubriques');
    hote.innerHTML = html;
    hote.querySelectorAll('.sw').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.id, vers = !b.classList.contains('on');
        b.disabled = true;
        Ad.definirPremium(id, vers).then(function () {
          toast(vers ? 'Réservé aux abonnés.' : 'De nouveau gratuit.', 'ok');
          return rafraichir();
        }).catch(function (e) {
          b.disabled = false;
          toast(String((e && e.message) || e), 'err');
        });
      });
    });
  }

  function ligne(id, nom, r) {
    var on = !!(r && r.premium), v = !!(r && r.verrouille);
    return '<div class="setting"><div><h3>' + esc(nom) +
      (v ? '<span class="verrou">🔒 verrouillée</span>' : '') + '</h3></div>' +
      '<button class="sw' + (on ? ' on' : '') + '" data-id="' + esc(id) + '" aria-label="Premium : ' + esc(nom) + '"></button></div>';
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
        '<td><span style="color:' + couleur + '">' + esc(LIBELLES[a.statut] || a.statut) + '</span>' +
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
