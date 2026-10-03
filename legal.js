/* Pages légales : construit le menu des documents et le sommaire
   (« Sur cette page ») à partir des titres h2 de l'article. */
(function () {
  'use strict';
  var main = document.querySelector('main');
  var article = main && main.querySelector('article');
  if (!article) return;

  var DOCS = [
    ['mentions-legales.html', 'Mentions légales'],
    ['cgu.html', 'CGU'],
    ['cgv.html', 'CGV'],
    ['confidentialite.html', 'Confidentialité & cookies']
  ];
  var fichier = (location.pathname.split('/').pop() || '').toLowerCase();
  if (fichier.indexOf('.') === -1) fichier += '.html';

  var cote = document.createElement('aside');
  cote.className = 'legal-side';

  var docs = document.createElement('div');
  docs.setAttribute('role', 'navigation');
  docs.className = 'legal-docs';
  docs.setAttribute('aria-label', 'Documents légaux');
  var t1 = document.createElement('div');
  t1.className = 'legal-titre';
  t1.textContent = 'Documents';
  docs.appendChild(t1);
  DOCS.forEach(function (d) {
    var a = document.createElement('a');
    a.href = d[0];
    a.textContent = d[1];
    if (d[0] === fichier) a.className = 'cur';
    docs.appendChild(a);
  });
  cote.appendChild(docs);

  var titres = article.querySelectorAll('h2');
  if (titres.length > 1) {
    var toc = document.createElement('div');
    toc.setAttribute('role', 'navigation');
    toc.className = 'legal-toc';
    toc.setAttribute('aria-label', 'Sur cette page');
    var t2 = document.createElement('div');
    t2.className = 'legal-titre';
    t2.textContent = 'Sur cette page';
    toc.appendChild(t2);
    Array.prototype.forEach.call(titres, function (h, i) {
      if (!h.id) h.id = 'section-' + (i + 1);
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      toc.appendChild(a);
    });
    cote.appendChild(toc);
  }

  main.insertBefore(cote, article);
})();
