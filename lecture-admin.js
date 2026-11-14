/* ══════════════════════════════════════════════════════════════════
   ECG Prépa : statistiques de lecture, côté administration

   Construit l'onglet « Lecture » de la page d'admin : pages vues,
   lecteurs, temps de lecture, pages les plus lues, rubriques, heures.
   Les données viennent de la fonction stats_lecture
   (supabase/statistiques-lecture.sql), remplie par mesurerLecture()
   dans auth.js. Aucune donnée qui identifie un élève.

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

  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nb(n) { return Number(n || 0).toLocaleString('fr-FR'); }
  function duree(s) {
    s = Math.round(s || 0);
    if (!s) return '—';
    if (s < 60) return s + ' s';
    var m = Math.floor(s / 60), r = s % 60;
    return m + ' min' + (r ? ' ' + (r < 10 ? '0' : '') + r : '');
  }
  function jourCourt(d) {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
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
    return { grande: 'Accueil et autres pages', fine: 'Accueil et autres pages' };
  }

  function poserStyles() {
    if (document.getElementById('ecg-lecture-css')) return;
    var s = document.createElement('style');
    s.id = 'ecg-lecture-css';
    s.textContent = [
      '#p-lecture .bloc{background:var(--surface);border:1px solid var(--border);border-radius:14px;margin-bottom:20px;overflow:hidden}',
      '#p-lecture .bloc>header{padding:20px 22px 6px;margin:0;display:block}',
      '#p-lecture .bloc>header h3{font-family:"Playfair Display",serif;font-size:1.2rem;font-weight:700}',
      '#p-lecture .bloc>header p{color:var(--dim);font-size:.8rem;font-weight:300;line-height:1.65;margin-top:6px;max-width:680px}',
      '#p-lecture .entete{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:18px}',
      '#p-lecture .entete p{color:var(--dim);font-size:.8rem;font-weight:300;line-height:1.6;flex:1;min-width:240px}',
      '#p-lecture .periodes{display:flex;gap:6px;flex-wrap:wrap}',
      '#p-lecture .periodes button{background:var(--surface);border:1px solid var(--border);color:var(--dim);font-family:"DM Mono",monospace;font-size:.7rem;letter-spacing:.06em;padding:8px 13px;border-radius:999px;cursor:pointer}',
      '#p-lecture .periodes button:hover{color:var(--text)}',
      '#p-lecture .periodes button.on{border-color:var(--accent);color:var(--accent);background:rgba(200,169,110,.08)}',
      '#p-lecture .stats{margin-bottom:20px}',
      '#p-lecture .stat small{display:block;color:var(--faint);font-size:.72rem;margin-top:6px;font-weight:300}',
      /* Pages vues par jour */
      '#p-lecture .jours{display:flex;align-items:flex-end;gap:3px;height:180px;padding:18px 22px 0}',
      '#p-lecture .jours .j{flex:1;min-width:2px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;position:relative;cursor:default}',
      '#p-lecture .jours .j i{display:block;background:var(--accent);border-radius:3px 3px 0 0;min-height:2px;opacity:.85}',
      '#p-lecture .jours .j.vide i{background:var(--border);opacity:1}',
      '#p-lecture .jours .j:hover i{opacity:1;background:#e2c48a}',
      '#p-lecture .jours .j b{position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);font-family:"DM Mono",monospace;font-size:.6rem;font-weight:400;color:var(--dim);white-space:nowrap}',
      '#p-lecture .axe{display:flex;justify-content:space-between;padding:8px 22px 18px;font-family:"DM Mono",monospace;font-size:.62rem;color:var(--faint);letter-spacing:.06em}',
      '#p-lecture .bulle{position:fixed;z-index:50;pointer-events:none;background:#0d0d0f;border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-size:.76rem;color:var(--text);white-space:nowrap;display:none}',
      /* Deux colonnes */
      '#p-lecture .duo{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}',
      '#p-lecture .duo .bloc{margin-bottom:0;display:flex;flex-direction:column}',
      '#p-lecture .duo .heures{flex:1;min-height:150px;height:auto}',
      '#p-lecture .rubs{padding:14px 22px 22px;display:flex;flex-direction:column;gap:12px}',
      '#p-lecture .rub .l{display:flex;justify-content:space-between;gap:10px;font-size:.84rem;margin-bottom:6px}',
      '#p-lecture .rub .l span{font-family:"DM Mono",monospace;font-size:.72rem;color:var(--dim);white-space:nowrap}',
      '#p-lecture .rub .b{height:8px;background:var(--surface2);border-radius:99px;overflow:hidden}',
      '#p-lecture .rub .b i{display:block;height:100%;border-radius:99px}',
      '#p-lecture .heures{display:flex;align-items:flex-end;gap:3px;height:150px;padding:18px 22px 0}',
      '#p-lecture .heures .j{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end}',
      '#p-lecture .heures .j i{display:block;background:var(--blue);border-radius:3px 3px 0 0;min-height:2px;opacity:.85}',
      '#p-lecture .heures .j:hover i{opacity:1}',
      /* Tableau des pages */
      '#p-lecture .outils{display:flex;gap:10px;flex-wrap:wrap;padding:12px 22px 16px}',
      '#p-lecture .outils input{flex:1;min-width:200px}',
      '#p-lecture td.num,#p-lecture th.num{text-align:right;white-space:nowrap}',
      '#p-lecture td.num{font-family:"DM Mono",monospace;font-size:.8rem}',
      '#p-lecture td.vues{font-family:"Playfair Display",serif;font-size:1.15rem;font-weight:700;color:var(--accent)}',
      '#p-lecture .pg a{color:var(--text);text-decoration:none;font-weight:500}',
      '#p-lecture .pg a:hover{color:var(--accent)}',
      '#p-lecture .pg .mono{display:block;margin-top:3px;white-space:normal;word-break:break-all;color:var(--faint)}',
      '#p-lecture .rg{font-size:.78rem;color:var(--dim);white-space:nowrap}',
      '#p-lecture .rg i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;vertical-align:1px}',
      '#p-lecture .jauge{display:inline-block;width:46px;height:5px;border-radius:99px;background:var(--surface2);margin-right:8px;vertical-align:2px;overflow:hidden}',
      '#p-lecture .jauge i{display:block;height:100%;background:var(--green)}',
      '#p-lecture .plus{display:block;margin:0 auto 18px}',
      '@media(max-width:860px){#p-lecture .duo{grid-template-columns:1fr}}',
      '@media(max-width:640px){' +
        '#p-lecture .tpages th:nth-child(2),#p-lecture .tpages td:nth-child(2),' +
        '#p-lecture .tpages th:nth-child(4),#p-lecture .tpages td:nth-child(4),' +
        '#p-lecture .tpages th:nth-child(6),#p-lecture .tpages td:nth-child(6){display:none}' +
        '#p-lecture .jours{gap:1px;padding:18px 16px 0}#p-lecture .axe{padding:8px 16px 18px}' +
        '#p-lecture .jours .j b{display:none}' +
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  var etat = { jours: 30, donnees: null, filtre: '', rub: '', tout: false, charge: false };

  function batir() {
    var hote = document.getElementById('p-lecture');
    if (!hote || hote.dataset.pret) return;
    hote.dataset.pret = '1';
    poserStyles();
    hote.innerHTML =
      '<div class="entete">' +
        '<p>Pages consultées par les élèves et les visiteurs. Tes propres visites ne sont pas comptées, ' +
        'et rien ne permet de savoir qui a lu quoi. Mesure démarrée le ' + DEBUT_MESURE + '.</p>' +
        '<div class="periodes" id="lc-periodes">' +
          '<button type="button" data-j="1">Aujourd\'hui</button>' +
          '<button type="button" data-j="7">7 jours</button>' +
          '<button type="button" data-j="30" class="on">30 jours</button>' +
          '<button type="button" data-j="90">3 mois</button>' +
          '<button type="button" data-j="365">1 an</button>' +
        '</div>' +
      '</div>' +
      '<div class="stats" id="lc-stats"></div>' +
      '<div class="bloc" id="lc-bloc-jours"><header><div><h3>Pages vues par jour</h3></div></header>' +
        '<div class="jours" id="lc-jours"></div><div class="axe" id="lc-axe"></div></div>' +
      '<div class="duo">' +
        '<div class="bloc"><header><div><h3>Par rubrique</h3>' +
          '<p>Part des pages vues de chaque grande partie du site.</p></div></header>' +
          '<div class="rubs" id="lc-rubs"></div></div>' +
        '<div class="bloc"><header><div><h3>Heures de lecture</h3>' +
          '<p>Pages ouvertes selon l\'heure de Paris.</p></div></header>' +
          '<div class="heures" id="lc-heures"></div>' +
          '<div class="axe"><span>0 h</span><span>6 h</span><span>12 h</span><span>18 h</span><span>23 h</span></div></div>' +
      '</div>' +
      '<div class="bloc"><header><div><h3>Pages les plus lues</h3>' +
        '<p>« Temps moyen » : temps passé à lire la page (onglet ouvert et élève actif). ' +
        '« Jusqu\'au bout » : part des visites qui ont atteint le bas de la page.</p></div></header>' +
        '<div class="outils">' +
          '<input type="text" id="lc-q" placeholder="Chercher une page…" aria-label="Chercher une page">' +
          '<select id="lc-rub" aria-label="Rubrique"><option value="">Toutes les rubriques</option></select>' +
        '</div>' +
        '<div class="scroll"><table class="tpages"><thead><tr>' +
          '<th>Page</th><th>Rubrique</th><th class="num">Vues</th><th class="num">Lecteurs</th>' +
          '<th class="num">Temps moyen</th><th class="num">Jusqu\'au bout</th>' +
        '</tr></thead><tbody id="lc-pages"></tbody></table></div>' +
        '<div class="empty" id="lc-vide" style="display:none"></div>' +
        '<button class="btn ghost plus" type="button" id="lc-plus" style="display:none"></button>' +
      '</div>' +
      '<div class="bulle" id="lc-bulle"></div>';

    hote.querySelectorAll('#lc-periodes button').forEach(function (b) {
      b.addEventListener('click', function () {
        hote.querySelectorAll('#lc-periodes button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        etat.jours = +b.dataset.j;
        etat.tout = false;
        charger();
      });
    });
    $('#lc-q').addEventListener('input', function () { etat.filtre = this.value; etat.tout = false; rendrePages(); });
    $('#lc-rub').addEventListener('change', function () { etat.rub = this.value; etat.tout = false; rendrePages(); });
    $('#lc-plus').addEventListener('click', function () { etat.tout = true; rendrePages(); });
    bulles('#lc-jours');
    bulles('#lc-heures');
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
    return Ad.statsLecture(etat.jours).then(function (d) {
      etat.donnees = d || {};
      rendre();
    }).catch(function (err) {
      var s = $('#lc-stats');
      if (s) s.innerHTML = '<div class="stat" style="--c:var(--danger)"><b>!</b><span>' +
        esc(String((err && err.message) || err)) + '</span></div>';
    });
  }

  function rendre() {
    var d = etat.donnees || {};
    var em = document.getElementById('c-lecture');
    if (em) em.textContent = nb(d.aujourdhui);
    var total = d.total || 0;
    var joursActifs = Math.max(1, Math.min(etat.jours, (d.par_jour || []).length ? joursDepuis(d) : 1));
    var parJour = Math.round((d.lecteurs || 0) / joursActifs * 10) / 10;
    var mobile = total ? Math.round(100 * (d.mobile || 0) / total) : 0;
    $('#lc-stats').innerHTML =
      carte('var(--accent)', nb(total), 'Pages vues', etat.jours === 1 ? 'aujourd\'hui' : 'sur ' + etat.jours + ' jours') +
      carte('var(--blue)', String(parJour).replace('.', ','), 'Lecteurs par jour', 'en moyenne') +
      carte('var(--green)', duree(d.duree_moy), 'Temps moyen', 'par page lue') +
      carte('var(--pink)', (d.jusquau_bout || 0) + ' %', 'Jusqu\'au bout', 'des pages ouvertes') +
      carte('var(--dim)', mobile + ' %', 'Sur téléphone', nb(d.mobile) + ' pages vues');
    $('#lc-bloc-jours').style.display = etat.jours === 1 ? 'none' : '';
    rendreJours(d);
    rendreRubriques(d);
    rendreHeures(d);
    rendreSelect(d);
    rendrePages();
  }

  /* Nombre de jours de la période où la mesure existait déjà. */
  function joursDepuis(d) {
    var premier = (d.par_jour || [])[0];
    if (!premier) return 1;
    var t0 = new Date(premier.jour + 'T00:00:00');
    var auj = new Date(); auj.setHours(0, 0, 0, 0);
    return Math.round((auj - t0) / 864e5) + 1;
  }

  function carte(c, valeur, libelle, sous) {
    return '<div class="stat" style="--c:' + c + '"><b>' + esc(valeur) + '</b><span>' + esc(libelle) + '</span>' +
      (sous ? '<small>' + esc(sous) + '</small>' : '') + '</div>';
  }

  function rendreJours(d) {
    var index = {};
    (d.par_jour || []).forEach(function (j) { index[j.jour] = j; });
    var jours = [], auj = new Date(); auj.setHours(12, 0, 0, 0);
    for (var i = etat.jours - 1; i >= 0; i--) {
      var t = new Date(auj); t.setDate(auj.getDate() - i);
      var k = cleJour(t), x = index[k] || { vues: 0, lecteurs: 0 };
      jours.push({ date: t, vues: x.vues, lecteurs: x.lecteurs });
    }
    var max = Math.max.apply(null, jours.map(function (j) { return j.vues; }).concat([1]));
    var montrerNb = jours.length <= 31;
    $('#lc-jours').innerHTML = jours.map(function (j) {
      var h = Math.round(j.vues / max * 100);
      return '<div class="j' + (j.vues ? '' : ' vide') + '" data-info="' + esc('<b>' + jourCourt(j.date) + '</b> · ' +
        nb(j.vues) + ' page' + (j.vues > 1 ? 's' : '') + ' vue' + (j.vues > 1 ? 's' : '') + ' · ' +
        nb(j.lecteurs) + ' lecteur' + (j.lecteurs > 1 ? 's' : '')) + '">' +
        (montrerNb && j.vues && jours.length <= 14 ? '<b style="bottom:calc(' + h + '% + 4px)">' + j.vues + '</b>' : '') +
        '<i style="height:' + h + '%"></i></div>';
    }).join('');
    var milieu = jours[Math.floor(jours.length / 2)];
    $('#lc-axe').innerHTML = '<span>' + jourCourt(jours[0].date) + '</span>' +
      (jours.length > 2 ? '<span>' + jourCourt(milieu.date) + '</span>' : '') +
      '<span>' + jourCourt(jours[jours.length - 1].date) + '</span>';
  }

  function rendreRubriques(d) {
    var tot = {};
    (d.pages || []).forEach(function (p) {
      var g = rubrique(p.page).grande;
      tot[g] = (tot[g] || 0) + p.vues;
    });
    var total = d.total || 0;
    var liste = GRANDES.map(function (g, i) { return { nom: g, vues: tot[g] || 0, c: COULEURS[i] }; })
      .filter(function (x) { return x.vues; })
      .sort(function (a, b) { return b.vues - a.vues; });
    var max = liste.length ? liste[0].vues : 1;
    $('#lc-rubs').innerHTML = liste.length ? liste.map(function (x) {
      var pc = total ? Math.round(100 * x.vues / total) : 0;
      return '<div class="rub"><div class="l">' + esc(x.nom) + '<span>' + nb(x.vues) + ' · ' + pc + ' %</span></div>' +
        '<div class="b"><i style="width:' + Math.max(2, Math.round(100 * x.vues / max)) + '%;background:' + x.c + '"></i></div></div>';
    }).join('') : '<div class="empty" style="padding:30px 0">Rien pour l\'instant.</div>';
  }

  function rendreHeures(d) {
    var h = [];
    for (var i = 0; i < 24; i++) h.push(0);
    (d.par_heure || []).forEach(function (x) { h[x.heure] = x.vues; });
    var max = Math.max.apply(null, h.concat([1]));
    $('#lc-heures').innerHTML = h.map(function (v, i) {
      return '<div class="j" data-info="' + esc('<b>' + i + ' h – ' + (i + 1) + ' h</b> · ' + nb(v) + ' page' + (v > 1 ? 's' : '') + ' vue' + (v > 1 ? 's' : '')) + '">' +
        '<i style="height:' + Math.round(v / max * 100) + '%"></i></div>';
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
      if (q && sansAccents((p.titre || '') + ' ' + p.page).indexOf(q) === -1) return false;
      return true;
    });
    var montrees = etat.tout ? liste : liste.slice(0, PAR_PAGE);
    var base = location.href.replace(/[^/]*([?#].*)?$/, '');
    $('#lc-pages').innerHTML = montrees.map(function (p) {
      var r = rubrique(p.page);
      return '<tr>' +
        '<td class="pg"><a href="' + esc(base + p.page) + '" target="_blank" rel="noopener">' + esc(p.titre || p.page) + '</a>' +
          '<span class="mono">' + esc(p.page) + '</span></td>' +
        '<td class="rg"><i style="background:' + (couleur[r.grande] || 'var(--dim)') + '"></i>' + esc(r.fine) + '</td>' +
        '<td class="num vues">' + nb(p.vues) + '</td>' +
        '<td class="num">' + nb(p.lecteurs) + '</td>' +
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
  /* Actualisation quand on revient sur l'onglet « Lecture ». */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.tab[data-p="lecture"]');
    if (t && etat.charge) charger();
  });

  window.ECGLectureAdmin = { rafraichir: charger };
})();
