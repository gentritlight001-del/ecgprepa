/* Pages « Tous les articles » et pages pays / région (data-page="pays") :
   construit la liste à partir de ACTU_DATA (défini plus haut dans la page).
   Les 3 articles les plus récents en grand, puis tous les autres rangés par
   mois ; recherche, thèmes et pays (menu caché s'il n'y a qu'un pays).
   Les cartes gardent la classe actu-card et le titre .actu-card-title :
   auth.js y pose le badge Premium, favoris.js l'étoile. */
(function () {
  var code = document.body.getAttribute('data-code');
  var pagePays = document.body.getAttribute('data-page') === 'pays';
  var parRegion = code === 'monde' && !pagePays;
  var MOIS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  var COURT = ['', 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var THEMES = {
    politique: '#A07A2C', geopolitique: '#3F7D4B', economie: '#B86B1F', social: '#A04C74',
    environnement: '#23827A', sante: '#B8456F', defense: '#A62B2B', securite: '#AE5A1F',
    numerique: '#41649A', langue: '#6F57A0'
  };
  /* Noms affichés dans le menu ; un pays absent de la liste garde son nom de ACTU_DATA. */
  var NOMS = {
    monde: { europe: 'Europe', asie: 'Asie', afrique: 'Afrique', 'moyen-orient': 'Moyen-Orient', amerique: 'Amérique', arctique: 'Arctique', oceanie: 'Océanie', monde: 'Monde' },
    es: { 'Guinée Équatoriale': 'Guinée équatoriale' }
  }[code] || {};

  var etat = { q: '', pays: '', th: '' };
  var $ = function (id) { return document.getElementById(id); };
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function surligne(t) {
    if (!etat.q) return esc(t);
    var i = norm(t).indexOf(norm(etat.q));
    if (i < 0) return esc(t);
    return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + etat.q.length)) + '</mark>' + esc(t.slice(i + etat.q.length));
  }
  function cles(a) {
    if (parRegion) return a.region ? [a.region] : [];
    return String(a.pays || '').split(/\s+—\s+/);
  }
  function nom(k) { return NOMS[k] || k; }

  /* Du plus récent au plus ancien (à date égale, l'ordre de ACTU_DATA) */
  var ARTS = ACTU_DATA.map(function (a, i) { return [a, i]; })
    .sort(function (x, y) { return (y[0].year * 12 + y[0].month) - (x[0].year * 12 + x[0].month) || x[1] - y[1]; })
    .map(function (x) { return x[0]; });

  function filtre(sauf) {
    var q = norm(etat.q);
    return ARTS.filter(function (a) {
      return (sauf === 'pays' || !etat.pays || cles(a).indexOf(etat.pays) >= 0) &&
             (sauf === 'th' || !etat.th || a.domain === etat.th) &&
             (!q || norm(a.cardTitle + ' ' + a.pays + ' ' + a.theme).indexOf(q) >= 0);
    });
  }

  function filtres() {
    var P = filtre('pays'), T = filtre('th'), n = {}, c = {}, libTh = {}, ordre = [];
    P.forEach(function (a) { cles(a).forEach(function (k) { if (!n[k]) { n[k] = 0; ordre.push(k); } n[k]++; }); });
    T.forEach(function (a) { c[a.domain] = (c[a.domain] || 0) + 1; libTh[a.domain] = a.theme; });
    if (etat.pays && !n[etat.pays]) { n[etat.pays] = 0; ordre.push(etat.pays); }
    ordre.sort(function (x, y) { return n[y] - n[x]; });
    $('ta-pays').parentNode.hidden = ordre.length < 2;
    $('ta-pays').innerHTML = '<option value="">' + (parRegion ? 'Toutes les régions' : 'Tous les pays') + ' (' + P.length + ')</option>' +
      ordre.map(function (k) { return '<option value="' + esc(k) + '"' + (etat.pays === k ? ' selected' : '') + '>' + esc(nom(k)) + ' (' + n[k] + ')</option>'; }).join('');
    $('ta-themes').innerHTML = '<button type="button" class="ta-th" data-d="" aria-pressed="' + !etat.th + '">Tous les thèmes <span>' + T.length + '</span></button>' +
      Object.keys(c).sort(function (x, y) { return c[y] - c[x]; }).map(function (d) {
        return '<button type="button" class="ta-th" data-d="' + esc(d) + '" style="--t:' + (THEMES[d] || '#888') + '" aria-pressed="' + (etat.th === d) + '"><i></i>' + esc(libTh[d]) + ' <span>' + c[d] + '</span></button>';
      }).join('');
  }

  function carte(a, avecDate) {
    return '<a class="actu-card" href="' + esc(a.externalUrl) + '">' +
      '<img class="ta-img" src="' + esc(a.image) + '" alt="" loading="lazy">' +
      '<div class="ta-tx"><div class="ta-meta"><span class="ia-lieu">' + surligne(a.pays) + '</span>' +
      '<span class="ia-theme" style="--t:' + (THEMES[a.domain] || '#888') + '">' + esc(a.theme) + '</span>' +
      (avecDate ? '<span class="ia-date">' + COURT[a.month] + ' ' + a.year + '</span>' : '') + '</div>' +
      '<div class="actu-card-title">' + surligne(a.cardTitle) + '</div></div></a>';
  }

  function rendu() {
    filtres();
    var arts = filtre(), actif = etat.q || etat.pays || etat.th, h = '';
    if (!arts.length) {
      $('actu-grid').innerHTML = '<div class="ta-vide"><h2>Aucun article</h2><p>Rien ne correspond à ces filtres.</p><button type="button" id="ta-raz">Tout afficher</button></div>';
      $('ta-raz').onclick = function () { etat = { q: '', pays: '', th: '' }; $('ta-q').value = ''; $('ta-efface').hidden = true; rendu(); };
      return;
    }
    var recents = actif ? [] : arts.slice(0, 3), reste = actif ? arts : arts.slice(3);
    if (actif) {
      h += '<p class="ta-resume"><b>' + arts.length + '</b> article' + (arts.length > 1 ? 's' : '') +
        (etat.pays ? ' · ' + esc(nom(etat.pays)) : '') + (etat.q ? ' · « ' + esc(etat.q) + ' »' : '') + '</p>';
    }
    if (recents.length) {
      h += '<section class="ta-bloc"><h2>Les plus récents</h2><div class="ta-recents">' + recents.map(function (a) { return carte(a, true); }).join('') + '</div></section>';
    }
    var mois = [];
    reste.forEach(function (a) {
      var k = a.year * 100 + a.month, g = mois[mois.length - 1];
      if (!g || g.k !== k) { g = { k: k, m: a.month, y: a.year, l: [] }; mois.push(g); }
      g.l.push(a);
    });
    h += mois.map(function (g) {
      return '<section class="ta-bloc"><h2>' + MOIS[g.m] + ' ' + g.y + '</h2><div class="ta-grille">' +
        g.l.map(function (a) { return carte(a, !!actif); }).join('') + '</div></section>';
    }).join('');
    $('actu-grid').innerHTML = h;
  }

  $('ta-q').addEventListener('input', function (e) { etat.q = e.target.value.trim(); $('ta-efface').hidden = !etat.q; rendu(); });
  $('ta-efface').addEventListener('click', function () { $('ta-q').value = ''; etat.q = ''; $('ta-efface').hidden = true; rendu(); $('ta-q').focus(); });
  $('ta-pays').addEventListener('change', function (e) { etat.pays = e.target.value; rendu(); });
  $('ta-themes').addEventListener('click', function (e) {
    var b = e.target.closest('.ta-th');
    if (!b) return;
    etat.th = b.getAttribute('data-d');
    rendu();
  });
  rendu();
})();
