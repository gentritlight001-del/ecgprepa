/* ══════════════════════════════════════════════════════════════
   Fiche d'actualité (maquette validée par le propriétaire,
   novembre 2026). À l'arrivée sur un article, le lecteur voit
   d'abord une fiche de 2 minutes, construite toute seule à partir
   des blocs de l'article. Deux gabarits sont lus :

   - gabarit actuel (<body class="a-page">) : tags t0 / t1, a-meta,
     a-titre, a-essentiel, a-analyse (entière), a-hero-img,
     a-chiffres, a-chrono, a-copie (accroche, idée-force, sujets,
     piège), a-fin, a-cours ;
   - ancien gabarit (.ap-main .ap-card) : ap-tag, ap-date, ap-title,
     ap-intro (ses phrases deviennent « L'essentiel »), ap-ctx
     (devient l'analyse), ap-hero-img, ap-stat, ap-tl, ap-back-btn.

   Mise en page : en-tête (tags, date, titre) ; à gauche l'essentiel
   puis l'analyse ; à droite la photo, les chiffres et un bloc qui
   remplit la hauteur restante (« Lire l'article complet » et, si
   l'article en a une, la vidéo : <meta name="fiche-video"
   content="https://youtu.be/…" data-titre="…" data-chaine="…">, sinon
   un lien vers un article de référence : <meta name="fiche-lien"
   content="https://…" data-titre="…" data-source="…" data-image="…" facultatif) ;
   chronologie (4 dates, la plus récente à gauche) ; « Dans une
   copie » ; retour à la liste et cours à réviser.
   « Lire l'article complet » affiche l'article entier (adresse
   #article-complet ; le Retour du navigateur ramène à la fiche).
   Un lien avec ancre ou une arrivée par la recherche du site ouvre
   directement l'article complet. Une fiche par section de langue.
   Fiche seule : <meta name="fiche-seule"> dans le <head> (pas de bouton
   « Lire l'article complet », la fiche reste affichée même avec une ancre).
   Essai abandonné à la demande du propriétaire (novembre 2026) : les
   nouveaux articles gardent leur article complet. Seul l'article
   uk-alessandri-securite-climatique-cop31-2026, écrit sans article complet,
   l'utilise encore ; retirer la balise si on lui écrit son article.
   Rien à écrire à la main.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var body = document.body;
  if (!body) return;
  var nouveau = body.classList.contains('a-page');
  var main = document.querySelector(nouveau ? '.a-main' : '.ap-main');
  if (!main) return;

  var ANCRE = 'article-complet';
  var SEULE = !!document.querySelector('meta[name="fiche-seule"]');
  if (SEULE) body.classList.add('fx-seule');
  var T = {
    fr: { reperes: 'Rep\u00e8res', fiche: 'Fiche de 2 min', ess: 'L’essentiel', analyse: 'L’analyse', complet: 'Lire l’article complet', video: 'En vidéo', lire: 'À lire', retour: '← Revenir à la fiche', reviser: 'Réviser : ', copie: 'Dans une copie', chrono: 'Chronologie', tous: '← Tous les articles' },
    en: { reperes: 'Key facts', fiche: '2-minute fact sheet', ess: 'The essentials', analyse: 'Analysis', complet: 'Read the full article', video: 'Video', lire: 'Read', retour: '← Back to the fact sheet', reviser: 'Revise: ', copie: 'In an essay', chrono: 'Timeline', tous: '← All articles' },
    es: { reperes: 'Datos clave', fiche: 'Ficha de 2 min', ess: 'Lo esencial', analyse: 'El análisis', complet: 'Leer el artículo completo', video: 'En vídeo', lire: 'Para leer', retour: '← Volver a la ficha', reviser: 'Repasar: ', copie: 'En una redacción', chrono: 'Cronología', tous: '← Todos los artículos' },
    de: { reperes: 'Eckdaten', fiche: '2-Minuten-Überblick', ess: 'Das Wichtigste', analyse: 'Die Analyse', complet: 'Den ganzen Artikel lesen', video: 'Im Video', lire: 'Zum Lesen', retour: '← Zurück zum Überblick', reviser: 'Wiederholen: ', copie: 'Im Aufsatz', chrono: 'Chronologie', tous: '← Alle Artikel' }
  };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function texte(n) { return n ? n.textContent.replace(/\s+/g, ' ').trim() : ''; }
  /* Texte d'un bloc où les <br> séparent des mots */
  function texteBr(n) {
    if (!n) return '';
    var c = n.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('br'), function (b) { b.replaceWith(' '); });
    return texte(c);
  }
  function ajout(parent, tag, cls, txt) {
    var e = el(tag, cls);
    e.textContent = txt;
    parent.appendChild(e);
    return e;
  }
  function tous(zone, sel) { return Array.prototype.slice.call(zone.querySelectorAll(sel)); }
  function langue(zone) {
    var m = /\bap-([a-z]+)-section\b/.exec(zone.className);
    return m && T[m[1]] ? m[1] : 'fr';
  }
  function sansDrapeau(s) { return s.replace(/^[^\p{L}\p{N}]+/u, '').trim(); }

  var metaVideo = document.querySelector('meta[name="fiche-video"]');
  var video = metaVideo && /^https:\/\/youtu\.be\/[\w-]+$/.test(metaVideo.getAttribute('content') || '') ? {
    url: metaVideo.getAttribute('content'),
    titre: metaVideo.getAttribute('data-titre') || '',
    chaine: metaVideo.getAttribute('data-chaine') || ''
  } : null;

  /* Sans vidéo : lien vers un article de référence */
  var metaLien = document.querySelector('meta[name="fiche-lien"]');
  var articleLien = !video && metaLien && /^https:\/\/[^\s"<>]+$/.test(metaLien.getAttribute('content') || '') ? {
    url: metaLien.getAttribute('content'),
    titre: metaLien.getAttribute('data-titre') || '',
    source: metaLien.getAttribute('data-source') || '',
    image: /^(https:\/\/|\.\.\/)[^\s"<>]+$/.test(metaLien.getAttribute('data-image') || '') ? metaLien.getAttribute('data-image') : ''
  } : null;

  /* ── Ancien gabarit : phrases du chapô ── */
  var ABR = /^(m|mr|mrs|ms|dr|st|sr|sra|srta|pr|mme|mlle|etc|av|no|vs|jr|gen|gov|sen|rep|prof|hr|fr|dt|bzw|ca|nr|sa|u\.s|j\.-c|z\.b)$/i;
  function phrases(t) {
    var morceaux = t.split(/(?<=[.!?…])\s+/), res = [], cur = '';
    morceaux.forEach(function (m) {
      cur = cur ? cur + ' ' + m : m;
      var der = /(\S+)[.!?…]$/.exec(cur);
      var mot = der ? der[1].replace(/^[«"(]+/, '') : '';
      if (der && (ABR.test(mot) || mot.length === 1)) return;
      res.push(cur); cur = '';
    });
    if (cur) res.push(cur);
    var fin = [];
    res.forEach(function (p) {
      if (fin.length && !/^[«"„¿¡\p{Lu}\p{N}]/u.test(p)) fin[fin.length - 1] += ' ' + p;
      else fin.push(p);
    });
    return fin;
  }

  /* ── Ancien gabarit : dates de la frise, pour garder les 4 plus récentes ── */
  var MOIS = [['janv', 1], ['jan', 1], ['ene', 1], ['jän', 1], ['fév', 2], ['fev', 2], ['feb', 2], ['mär', 3], ['mar', 3],
    ['avr', 4], ['apr', 4], ['abr', 4], ['mai', 5], ['may', 5], ['juin', 6], ['jun', 6], ['juil', 7], ['jul', 7], ['août', 8],
    ['aout', 8], ['aug', 8], ['ago', 8], ['sep', 9], ['set', 9], ['oct', 10], ['okt', 10], ['nov', 11], ['déc', 12], ['dec', 12],
    ['dic', 12], ['dez', 12]];
  function valeurDate(s) {
    s = s.toLowerCase();
    var an = /\b(1[0-9]|20)\d\d\b/.exec(s);
    var h = /\b(\d{1,2})\s*(?:h|:)\s*(\d{2})?\b/.exec(s);
    if (!an) return h ? { t: 'h', v: +h[1] * 60 + (+h[2] || 0) } : null;
    var mois = 0;
    s.replace(/\p{L}+/gu, function (w) {
      if (mois) return w;
      for (var i = 0; i < MOIS.length; i++) if (w.indexOf(MOIS[i][0]) === 0) { mois = MOIS[i][1]; break; }
      return w;
    });
    var j = /\b(\d{1,2})(?:er|º|\.)?\s+\p{L}/u.exec(s);
    return { t: 'a', v: +an[0] * 10000 + mois * 100 + (j && mois ? +j[1] : 0) + (h ? (+h[1] * 60 + (+h[2] || 0)) / 2000 : 0) };
  }
  function plusRecentes(items) {
    var vals = items.map(function (it) { return valeurDate(it.d); });
    var types = vals.filter(Boolean).map(function (v) { return v.t; });
    var memeType = types.length === items.length && types.every(function (t) { return t === types[0]; });
    if (memeType) {
      items = items.map(function (it, i) { return { it: it, v: vals[i].v, i: i }; })
        .sort(function (a, b) { return b.v - a.v || b.i - a.i; })
        .map(function (x) { return x.it; });
    } else {
      var avec = vals.filter(function (v) { return v && v.t === 'a'; });
      if (!avec.length || avec[0].v <= avec[avec.length - 1].v) items = items.slice().reverse();
    }
    return items.slice(0, 4);
  }

  /* ── Lecture des deux gabarits ── */
  function lireNouveau(zone) {
    var ess = tous(zone, '.a-essentiel li');
    if (!ess.length) return null;
    var t = T[langue(zone)];
    var meta = texte(zone.querySelector('.a-hero .a-meta')).split(' · ');
    var an = zone.querySelector('.a-analyse');
    var copie = zone.querySelector('.a-copie');
    var d = {
      t: t,
      tags: [zone.querySelector('.a-hero .a-tag.t0'), zone.querySelector('.a-hero .a-tag.t1')].filter(Boolean).map(texte),
      date: meta[0] || '',
      minutes: (meta.filter(function (s) { return /\d+\s*min/.test(s); })[0] || '').replace(/^\D*(\d+).*$/, '$1'),
      titre: texte(zone.querySelector('.a-titre')),
      ess: ess.map(function (li) { var p = li.querySelector('p'); return p ? p.innerHTML : li.innerHTML; }),
      analyse: an && an.querySelector('.a-analyse-corps .a-p') ? {
        lab: texte(an.querySelector('.a-analyse-lab')) || t.analyse,
        titre: texte(an.querySelector('.a-analyse-t')),
        ps: tous(an, '.a-analyse-corps .a-p').map(function (p) { return p.innerHTML; })
      } : null,
      image: zone.querySelector('.a-hero-img'),
      credit: ((zone.querySelector('.a-hero-credit') || {}).textContent || '').trim(),
      chiffres: tous(zone, '.a-chiffres > div').filter(function (x) { return x.querySelector('.a-chiffre'); }).map(function (x) {
        var v = x.querySelector('.a-chiffre');
        return { v: texte(v), l: texte(x.querySelector('.a-chiffre-txt')), fort: v.classList.contains('rouge') };
      }),
      chronoLab: texte(zone.querySelector('.a-chrono-bloc .a-h2')) || t.chrono,
      dates: tous(zone, '.a-chrono li').slice(0, 4).map(function (li) { return { d: texte(li.querySelector('.a-date')), t: texte(li.querySelector('p')) }; }),
      copie: null,
      tous: null,
      cours: null
    };
    if (copie) {
      var acc = copie.querySelector('.a-accroche');
      var grille = copie.querySelector('.a-copie-grille');
      d.copie = {
        lab: texte(copie.querySelector('.a-copie-t')) || t.copie,
        accroche: acc && acc.querySelector('p') ? { h: texte(acc.querySelector('h3')), html: acc.querySelector('p').innerHTML } : null,
        cartes: grille ? Array.prototype.map.call(grille.children, function (div, i) {
          var ul = div.querySelector('ul');
          return {
            cls: div.classList.contains('a-piege') ? 'fx-piege' : i === 0 ? 'fx-idee' : '',
            h: texte(div.querySelector('h3')),
            liste: ul ? tous(ul, 'li').map(function (li) { return li.innerHTML; }) : null,
            ps: ul ? null : tous(div, 'p').map(function (p) { return p.innerHTML; })
          };
        }) : []
      };
    }
    var lt = zone.querySelector('.a-fin a');
    if (lt) d.tous = { href: lt.getAttribute('href'), txt: texte(lt) };
    var lc = zone.querySelector('a.a-cours');
    if (lc) d.cours = { href: lc.getAttribute('href'), txt: t.reviser + texte(lc.querySelector('b')) };
    return d;
  }

  function lireAncien(zone) {
    var titre = texte(zone.querySelector('.ap-title'));
    var intro = texte(zone.querySelector('.ap-intro'));
    if (!titre || !intro) return null;
    var t = T[langue(zone)];
    var ph = phrases(intro);
    var ctx = zone.querySelector('.ap-ctx');
    var mots = texte(zone).split(' ').length;
    var retour = document.querySelector('.ap-back-btn');
    var d = {
      t: t,
      tags: tous(zone, '.ap-tag').slice(0, 2).map(function (x) { return sansDrapeau(texte(x)); }),
      date: texte(zone.querySelector('.ap-date')).split(/\s[—·|]\s/)[0],
      minutes: String(Math.max(3, Math.round(mots / 200))),
      titre: titre,
      ess: (ph.length >= 2 && ph.length <= 4 ? ph : [intro]).map(function (p) { var s = el('span'); s.textContent = p; return s.innerHTML; }),
      essUnique: !(ph.length >= 2 && ph.length <= 4),
      analyse: ctx && ctx.querySelector('p') ? {
        lab: t.analyse,
        titre: texte(ctx.querySelector('.ap-ctx-label')),
        ps: tous(ctx, 'p').map(function (p) { return p.innerHTML; })
      } : null,
      image: zone.querySelector('.ap-hero-img') || document.querySelector('.ap-hero-img'),
      chiffres: tous(zone, '.ap-stat').filter(function (x) { return x.querySelector('.ap-stat-num'); }).slice(0, 4).map(function (x) {
        return { v: texte(x.querySelector('.ap-stat-num')), l: texteBr(x.querySelector('.ap-stat-desc')), fort: x.classList.contains('red') };
      }),
      chronoLab: t.chrono,
      dates: plusRecentes(tous(zone, '.ap-tl-item').map(function (it) {
        return { d: texte(it.querySelector('.ap-tl-date')), t: texte(it.querySelector('.ap-tl-text')) };
      })),
      reperes: tous(zone, '.ap-fact').slice(0, 5).map(function (f) {
        return { l: texte(f.querySelector('.ap-fact-label')), v: texte(f.querySelector('.ap-fact-val')) };
      }).filter(function (f) { return f.l && f.v; }),
      copie: null,
      tous: retour ? { href: retour.getAttribute('href'), txt: t.tous } : null,
      cours: null
    };
    return d;
  }

  /* ── Couleurs : celles de l'article ; pour l'ancien gabarit, tirées de son --accent ── */
  function rvb(c) {
    c = (c || '').trim();
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);
    if (m) {
      var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(c);
    return m ? [+m[1], +m[2], +m[3]] : null;
  }
  function melange(a, b, k) { return a.map(function (x, i) { return Math.round(x + (b[i] - x) * k); }); }
  function hex(a) { return '#' + a.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  function lum(a) {
    var l = a.map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
  }
  function palette() {
    var r = getComputedStyle(document.documentElement);
    var v = {};
    if (nouveau && r.getPropertyValue('--accent-pale').trim()) return v;
    var a = rvb(r.getPropertyValue('--accent')) || [31, 58, 95];
    for (var i = 0; i < 12 && 1.05 / (lum(a) + 0.05) < 4.6; i++) a = melange(a, [0, 0, 0], 0.12);
    v['--accent'] = hex(a);
    v['--accent-fonce'] = hex(melange(a, [0, 0, 0], 0.25));
    v['--accent-pale'] = hex(melange(a, [255, 255, 255], 0.9));
    if (!nouveau) {
      v['--fond'] = '#f3f4f6'; v['--carte'] = '#ffffff'; v['--bord'] = '#dfe3e8'; v['--filet'] = '#eef0f3';
      v['--encre'] = '#16202e'; v['--texte'] = '#25303e'; v['--doux'] = '#4f5b6b';
    }
    return v;
  }
  var VARS = palette();
  function colorer(e) { Object.keys(VARS).forEach(function (k) { e.style.setProperty(k, VARS[k]); }); }

  /* ── Construction de la fiche ── */
  function construire(zone) {
    var d = nouveau ? lireNouveau(zone) : lireAncien(zone);
    if (!d) return null;
    var t = d.t;

    var fx = el('section', 'fx');
    fx.setAttribute('aria-label', t.fiche);
    colorer(fx);
    var carte = el('div', 'fx-carte');
    fx.appendChild(carte);

    /* En-tête */
    var tete = el('header', 'fx-tete');
    var tags = el('div', 'fx-tags');
    d.tags.forEach(function (x, i) { if (x) ajout(tags, 'span', 'fx-tag' + (i === 0 ? ' t0' : ''), x); });
    ajout(tags, 'span', 'fx-meta', (d.date ? d.date + ' · ' : '') + t.fiche);
    tete.appendChild(tags);
    ajout(tete, 'h2', 'fx-titre', d.titre);
    carte.appendChild(tete);

    var haut = el('div', 'fx-haut');
    var gauche = el('div', 'fx-gauche');
    var droite = el('div', 'fx-droite');
    haut.appendChild(gauche);
    haut.appendChild(droite);
    carte.appendChild(haut);

    /* À gauche : l'essentiel, puis l'analyse */
    var bE = el('section', 'fx-ess');
    ajout(bE, 'h3', 'fx-lab', t.ess);
    if (d.essUnique) {
      bE.appendChild(el('p', 'fx-ess-p', d.ess[0]));
    } else {
      var ol = el('ol');
      d.ess.forEach(function (h, i) {
        var item = el('li');
        ajout(item, 'span', 'fx-rond', String(i + 1));
        item.appendChild(el('p', null, h));
        ol.appendChild(item);
      });
      bE.appendChild(ol);
    }
    gauche.appendChild(bE);
    if (d.analyse) {
      var bA = el('section', 'fx-analyse');
      ajout(bA, 'h3', 'fx-lab', d.analyse.lab);
      if (d.analyse.titre) ajout(bA, 'p', 'fx-analyse-t', d.analyse.titre);
      d.analyse.ps.forEach(function (h) { bA.appendChild(el('p', 'fx-analyse-p', h)); });
      gauche.appendChild(bA);
    }

    /* À droite : photo, chiffres, puis article complet et vidéo */
    /* Photo de une ; à défaut (absente ou lien cassé), l'image de la carte de l'article */
    var slug = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    var sources = [];
    if (d.image && d.image.getAttribute('src')) sources.push(d.image.getAttribute('src'));
    if (slug && sources.indexOf('../images/' + slug + '.webp') < 0) sources.push('../images/' + slug + '.webp');
    if (sources.length) {
      var im = el('img', 'fx-photo');
      im.alt = (d.image && d.image.getAttribute('alt')) || '';
      im.addEventListener('error', function () {
        sources.shift();
        if (sources.length) im.src = sources[0];
        else { im.remove(); equilibrer(); }
      });
      im.addEventListener('load', function () { equilibrer(); });
      im.src = sources[0];
      droite.appendChild(im);
      if (d.credit) ajout(droite, 'p', 'fx-credit', d.credit);
    }
    if (d.chiffres.length) {
      var bCh = el('div', 'fx-chiffres');
      d.chiffres.forEach(function (c) {
        ajout(bCh, 'span', 'fx-chiffre' + (c.fort ? ' rouge' : ''), c.v);
        ajout(bCh, 'span', 'fx-chiffre-txt', c.l);
      });
      droite.appendChild(bCh);
    }
    if (d.reperes && d.reperes.length >= 2) {
      var bR = el('div', 'fx-reperes cache');
      ajout(bR, 'h3', 'fx-lab', t.reperes);
      var dl = el('dl');
      d.reperes.forEach(function (r) { ajout(dl, 'dt', null, r.l); ajout(dl, 'dd', null, r.v); });
      bR.appendChild(dl);
      droite.appendChild(bR);
    }
    var plus = el('div', 'fx-plus');
    if (!SEULE) {
      var ouvrir = el('a', 'fx-ouvrir');
      ouvrir.href = '#' + ANCRE;
      ouvrir.textContent = t.complet + (d.minutes ? ' · ' + d.minutes + ' min' : '') + ' →';
      ouvrir.addEventListener('click', function (e) { e.preventDefault(); afficher(true, true); });
      plus.appendChild(ouvrir);
    }
    if (video) {
      var lv = el('a', 'fx-video');
      lv.href = video.url;
      lv.target = '_blank';
      lv.rel = 'noopener';
      /* Vignette de la vidéo (image YouTube), affichée quand la colonne de droite a de la place */
      var idVideo = video.url.split('/').pop();
      var vg = el('span', 'fx-vignette');
      var vi = el('img');
      vi.alt = '';
      vi.loading = 'lazy';
      vi.addEventListener('error', function () { lv.classList.add('sans-vignette'); lv.classList.remove('avec-vignette'); equilibrer(); });
      vi.src = 'https://i.ytimg.com/vi/' + idVideo + '/hqdefault.jpg';
      vg.appendChild(vi);
      vg.appendChild(el('span', 'fx-vignette-lecture', '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#fff"/></svg>'));
      lv.appendChild(vg);
      lv.appendChild(el('span', 'fx-lecture', '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#fff"/></svg>'));
      var tv = el('span', 'fx-video-txt');
      ajout(tv, 'span', 'fx-video-lab', t.video + (video.chaine ? ' · ' + video.chaine : ''));
      ajout(tv, 'span', 'fx-video-titre', video.titre);
      lv.appendChild(tv);
      plus.appendChild(lv);
    } else if (articleLien) {
      var la = el('a', 'fx-video' + (articleLien.image ? '' : ' sans-vignette'));
      la.href = articleLien.url;
      la.target = '_blank';
      la.rel = 'noopener';
      /* Image de l'article (data-image : fichier du site), affichée comme la vignette d'une vidéo quand il y a de la place */
      if (articleLien.image) {
        var vga = el('span', 'fx-vignette');
        var via = el('img');
        via.alt = '';
        via.loading = 'lazy';
        via.addEventListener('error', function () { la.classList.add('sans-vignette'); la.classList.remove('avec-vignette'); equilibrer(); });
        via.src = articleLien.image;
        vga.appendChild(via);
        la.appendChild(vga);
      }
      la.appendChild(el('span', 'fx-lecture', '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l5 5v13H6z M14 3v6h6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 13h8M9 17h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>'));
      var ta = el('span', 'fx-video-txt');
      ajout(ta, 'span', 'fx-video-lab', t.lire + (articleLien.source ? ' · ' + articleLien.source : ''));
      ajout(ta, 'span', 'fx-video-titre', articleLien.titre);
      la.appendChild(ta);
      plus.appendChild(la);
    }
    if (plus.children.length) droite.appendChild(plus);

    /* Chronologie : 4 dates, la plus récente à gauche */
    if (d.dates.length) {
      var bD = el('section', 'fx-dates');
      ajout(bD, 'h3', 'fx-lab', d.chronoLab);
      var od = el('ol');
      d.dates.forEach(function (x) {
        var li = el('li');
        ajout(li, 'span', 'fx-date', x.d);
        ajout(li, 'p', null, x.t);
        od.appendChild(li);
      });
      bD.appendChild(od);
      carte.appendChild(bD);
    }

    /* Dans une copie */
    if (d.copie) {
      var bC = el('section', 'fx-copie');
      ajout(bC, 'h3', 'fx-lab', d.copie.lab);
      if (d.copie.accroche) {
        var cA = el('div', 'fx-c fx-accroche');
        ajout(cA, 'h4', null, d.copie.accroche.h);
        cA.appendChild(el('p', null, d.copie.accroche.html));
        bC.appendChild(cA);
      }
      if (d.copie.cartes.length) {
        var g = el('div', 'fx-copie-g');
        d.copie.cartes.forEach(function (k) {
          var c = el('div', 'fx-c' + (k.cls ? ' ' + k.cls : ''));
          ajout(c, 'h4', null, k.h);
          if (k.liste) {
            var u = el('ul');
            k.liste.forEach(function (h) { u.appendChild(el('li', null, h)); });
            c.appendChild(u);
          } else {
            k.ps.forEach(function (h) { c.appendChild(el('p', null, h)); });
          }
          g.appendChild(c);
        });
        bC.appendChild(g);
      }
      carte.appendChild(bC);
    }

    /* Fin : retour à la liste, cours à réviser */
    var fin = el('div', 'fx-fin');
    if (d.tous) {
      var a1 = el('a', 'fx-tous');
      a1.href = d.tous.href;
      a1.textContent = d.tous.txt;
      fin.appendChild(a1);
    }
    if (d.cours) {
      var a2 = el('a', 'fx-cours');
      a2.href = d.cours.href;
      a2.textContent = d.cours.txt;
      fin.appendChild(a2);
    }
    fx.appendChild(fin);

    /* Bouton de retour, en tête de l'article complet */
    var retour = el('button', 'fx-retour');
    retour.type = 'button';
    retour.textContent = t.retour;
    colorer(retour);
    retour.addEventListener('click', function () {
      if (history.state && history.state.fx) history.back();
      else afficher(false, true);
    });

    zone.classList.add('fx-zone');
    zone.insertBefore(retour, zone.firstChild);
    zone.insertBefore(fx, zone.firstChild);
    return fx;
  }

  var zones = main.querySelectorAll(nouveau ? '.ap-fr-section, .ap-en-section, .ap-es-section, .ap-de-section'
    : '.ap-card > .ap-fr-section, .ap-card > .ap-en-section, .ap-card > .ap-es-section, .ap-card > .ap-de-section');
  if (!zones.length) zones = nouveau ? [main] : main.querySelectorAll('.ap-card');
  var faites = 0;
  Array.prototype.forEach.call(zones, function (z) { if (construire(z)) faites++; });
  if (!faites) return;
  if (!nouveau) body.classList.add('fx-ancien');

  function afficher(complet, defiler) {
    if (SEULE) complet = false;
    body.classList.toggle('fx-fiche', !complet);
    body.classList.toggle('fx-complet', complet);
    if (complet && defiler && location.hash !== '#' + ANCRE) {
      try { history.pushState({ fx: 1 }, '', '#' + ANCRE); } catch (e) {}
    }
    if (!complet && location.hash === '#' + ANCRE) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    }
    if (defiler) window.scrollTo(0, 0);
    if (!complet) equilibrer();
  }

  /* Pas de vide sous la colonne de gauche : si la colonne de droite
     (photo, chiffres, liens) la dépasse, la photo devient plus
     panoramique (2,2:1 au plus, jamais plus haute), puis les chiffres
     passent sur deux colonnes (« serre »), puis, s'il le faut encore,
     ils descendent sous l'analyse (« bas »). */
  function vide(g) {
    var bas = g.lastElementChild.getBoundingClientRect().bottom;
    var fond = g.getBoundingClientRect().bottom - parseFloat(getComputedStyle(g).paddingBottom);
    return fond - bas;
  }
  function reduirePhoto(ph, v) {
    var r = ph.getBoundingClientRect();
    ph.style.height = Math.round(Math.max(r.width / 2.2, r.height - v)) + 'px';
  }
  function equilibrer() {
    Array.prototype.forEach.call(document.querySelectorAll('.fx'), function (fx) {
      if (!fx.offsetParent) return;
      var g = fx.querySelector('.fx-gauche'), d = fx.querySelector('.fx-droite');
      if (!g || !d) return;
      var ph = d.querySelector('.fx-photo');
      var ch = fx.querySelector('.fx-chiffres');
      var r0 = d.querySelector('.fx-reperes');
      if (r0) r0.classList.add('cache');
      d.classList.remove('serre');
      if (ch && ch.parentNode === g) d.insertBefore(ch, d.querySelector('.fx-plus'));
      g.classList.remove('avec-chiffres');
      if (ph) ph.style.height = '';
      var lien = d.querySelector('.fx-video');
      var vgn = lien && lien.querySelector('.fx-vignette');
      if (lien) lien.classList.remove('avec-vignette');
      if (vgn) { vgn.style.height = ''; vgn.style.aspectRatio = ''; }
      if (getComputedStyle(g).display === 'contents') { if (lien && !lien.classList.contains('sans-vignette')) lien.classList.add('avec-vignette'); return; }
      var v = vide(g);
      if (v > 4 && ph) { reduirePhoto(ph, v); v = vide(g); }
      if (v > 4) {
        if (ph) ph.style.height = '';
        d.classList.add('serre');
        v = vide(g);
        if (v > 4 && ph) { reduirePhoto(ph, v); v = vide(g); }
      }
      if (v > 4 && ch) {
        if (ph) ph.style.height = '';
        d.classList.remove('serre');
        g.appendChild(ch);
        g.classList.add('avec-chiffres');
        v = vide(g);
      }
      /* Colonne de droite plus courte que l'analyse : la vignette de la vidéo occupe la place, si elle tient */
      if (lien && !lien.classList.contains('sans-vignette') && v <= 4) {
        lien.classList.add('avec-vignette');
        var exces = vide(g);
        if (exces > 4) {
          /* Pas assez de place en 16:9 : la vignette se fait plus panoramique (3:1 au plus), sinon elle disparaît */
          var h0 = vgn.getBoundingClientRect().height, l0 = vgn.getBoundingClientRect().width;
          var h1 = Math.round(Math.max(l0 / 3, h0 - exces));
          vgn.style.aspectRatio = 'auto'; vgn.style.height = h1 + 'px';
          if (vide(g) > 4) { lien.classList.remove('avec-vignette'); vgn.style.height = ''; vgn.style.aspectRatio = ''; }
        }
      }
      /* Bloc des liens très haut (pas de vidéo) : les repères de l'article s'y ajoutent, s'ils tiennent */
      var rep = d.querySelector('.fx-reperes'), plus = d.querySelector('.fx-plus');
      if (rep && v <= 4 && plus && plus.getBoundingClientRect().height > 230) {
        rep.classList.remove('cache');
        if (vide(g) > 4) rep.classList.add('cache');
      }
    });
  }
  var minuteur;
  function plusTard() { clearTimeout(minuteur); minuteur = setTimeout(equilibrer, 120); }
  window.addEventListener('resize', plusTard);
  window.addEventListener('load', equilibrer);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(equilibrer);
  document.addEventListener('click', function (e) {
    if (e.target.closest && (e.target.closest('.ap-lang-btn') || e.target.closest('.fx-retour'))) setTimeout(equilibrer, 0);
  });

  var depuisRecherche = false;
  try { depuisRecherche = !!sessionStorage.getItem('ecg-recherche-surligner'); } catch (e) {}
  afficher(!!location.hash || depuisRecherche, false);

  window.addEventListener('popstate', function () {
    afficher(location.hash === '#' + ANCRE, true);
  });
})();
