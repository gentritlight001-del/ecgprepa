/* Index des éditions d'actualité : remplit « À la une » et les cartes de
   pays (photo du dernier article, nombre d'articles, derniers titres) à
   partir de ACTU_DATA, lu dans tous-<code>.html. Ajouter un article à
   tous-<code>.html suffit : l'index se met à jour tout seul. */
(function () {
  var code = document.body.getAttribute('data-code');
  var parRegion = code === 'monde';
  var MOIS = ['', 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var THEMES = {
    politique: '#A07A2C', geopolitique: '#3F7D4B', economie: '#B86B1F', social: '#A04C74',
    environnement: '#23827A', sante: '#B8456F', defense: '#A62B2B', securite: '#AE5A1F',
    numerique: '#41649A', langue: '#6F57A0'
  };

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function image(src) {
    var i = document.createElement('img');
    i.src = src; i.alt = ''; i.loading = 'lazy'; i.decoding = 'async';
    return i;
  }
  function meta(a, avecDate) {
    var m = el('div', 'ia-meta');
    m.appendChild(el('span', 'ia-lieu', a.pays));
    var t = el('span', 'ia-theme', a.theme);
    if (THEMES[a.domain]) t.style.setProperty('--t', THEMES[a.domain]);
    m.appendChild(t);
    if (avecDate && a.month) m.appendChild(el('span', 'ia-date', MOIS[a.month] + ' ' + a.year));
    return m;
  }
  /* Clés d'un article : sa région (Monde) ou son pays ; « Argentine — Bolivie »
     compte pour les deux pays. */
  function cles(a) {
    if (parRegion) return a.region ? [a.region] : [];
    return String(a.pays || '').split(/\s+—\s+/);
  }

  function remplir(data) {
    if (!data.length) return;

    var cartes = Array.prototype.slice.call(document.querySelectorAll('.ia-pays'));
    var groupes = {};
    data.forEach(function (a) {
      cles(a).forEach(function (k) { (groupes[k] = groupes[k] || []).push(a); });
    });
    var actives = cartes.filter(function (c) { return groupes[c.getAttribute('data-cle')]; });
    var d = data[0];
    var n = document.querySelector('.ia-tous-n');
    if (n) n.textContent = data.length;

    /* À la une : le dernier article en grand, les trois suivants à côté */
    var g = document.querySelector('.ia-grande');
    g.href = d.externalUrl;
    g.appendChild(image(d.image));
    g.appendChild(meta(d, true));
    g.appendChild(el('h3', '', d.cardTitle));
    var suite = document.querySelector('.ia-suite');
    data.slice(1, 4).forEach(function (a) {
      var li = el('li'), lien = el('a');
      lien.href = a.externalUrl;
      lien.appendChild(image(a.image));
      var t = el('div');
      t.appendChild(meta(a, false));
      t.appendChild(el('h4', '', a.cardTitle));
      lien.appendChild(t);
      li.appendChild(lien); suite.appendChild(li);
    });
    document.getElementById('ia-alaune').hidden = false;

    /* Cartes : photo du dernier article, nombre, derniers titres.
       La grande carte reste en tête, les autres sont classées par
       nombre d'articles. */
    var grille = document.querySelector('.ia-grille');
    cartes.forEach(function (c) {
      var arts = groupes[c.getAttribute('data-cle')] || [];
      if (!arts.length) { c.hidden = true; return; }
      c.querySelector('.ia-photo').appendChild(image(arts[0].image));
      c.querySelector('.ia-n').textContent = arts.length;
      var ul = c.querySelector('.ia-titres');
      arts.slice(0, c.classList.contains('grand') ? 3 : 2).forEach(function (a) {
        var li = el('li');
        li.appendChild(el('span', 'ia-mois', MOIS[a.month] || ''));
        li.appendChild(el('span', '', a.cardTitle));
        ul.appendChild(li);
      });
      c.querySelector('.ia-voir').textContent = arts.length > 1 ? 'Voir les ' + arts.length + ' articles →' : 'Voir l’article →';
    });
    actives.filter(function (c) { return !c.classList.contains('grand'); })
      .sort(function (a, b) { return groupes[b.getAttribute('data-cle')].length - groupes[a.getAttribute('data-cle')].length; })
      .forEach(function (c) { grille.appendChild(c); });

    /* Nombre de colonnes choisi pour que la dernière ligne soit pleine */
    var k = actives.filter(function (c) { return !c.classList.contains('grand'); }).length;
    grille.classList.remove('c2', 'c4');
    if (k % 3 !== 0) {
      if (k <= 4 && k % 2 === 0) grille.classList.add('c2');
      else if (k % 4 === 0) grille.classList.add('c4');
    }
  }

  fetch('tous-' + code + '.html', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.text() : ''; })
    .then(function (t) {
      var m = /ACTU_DATA\s*=\s*(\[[\s\S]*?\n\s*\]);/.exec(t);
      if (!m) return;
      remplir(new Function('return ' + m[1])());
    })
    .catch(function () { /* hors ligne : les cartes restent avec leur nom et leur lien */ });
})();
