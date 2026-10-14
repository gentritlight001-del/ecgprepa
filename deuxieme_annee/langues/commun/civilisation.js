/* Cours de civilisation (langues, 2e année) : rendu du bloc COURS de chaque chapitre.
   Commun à tous les chapitres ; ne rien écrire ici de propre à un cours. */
/* Rendu du cours de civilisation (gabarit « Manuel », v2). Lit le bloc COURS ci-dessus : rien d'autre à modifier. */
(function () {
  let lang = 'fr';

  const UI = {
    fr: { fiche: 'Fiche de synthèse', ficheTitre: 'La fiche en deux pages', ficheSous: 'À réviser ou à imprimer', surSite: 'Sur ECG Prépa', sources: 'Sources', retour: 'Tous les cours de civilisation', plusLoin: 'Pour aller plus loin', video: 'En vidéo', ess: "L'essentiel", frise: 'Chronologie', som: 'Sommaire', act: 'Acteurs clés', deb: 'Le débat', syn: 'Synthèse',
          lex: 'Lexique', sujets: 'Sujets de dissertation', ret: 'À retenir', piste: 'Piste', partie: 'Partie', def: 'Définition',
          cours: 'Le cours', parties: 'parties', sections: 'sections', dates: 'dates', min: 'min de lecture', chap: 'Chapitre' },
    en: { fiche: 'Summary sheet', ficheTitre: 'The sheet in two pages', ficheSous: 'To revise or print', surSite: 'On ECG Prépa', sources: 'Sources', retour: 'All civilisation courses', plusLoin: 'Further reading', video: 'Watch', ess: 'Key points', frise: 'Timeline', som: 'Contents', act: 'Key figures', deb: 'The debate', syn: 'Synthesis',
          lex: 'Glossary', sujets: 'Essay questions', ret: 'Takeaways', piste: 'Hint', partie: 'Part', def: 'Definition',
          cours: 'The lesson', parties: 'parts', sections: 'sections', dates: 'dates', min: 'min read', chap: 'Chapter' },
    es: { fiche: 'Ficha de síntesis', ficheTitre: 'En dos páginas', ficheSous: 'Para repasar o imprimir', surSite: 'En ECG Prépa', sources: 'Fuentes', retour: 'Todos los cursos de civilización', plusLoin: 'Para ir más lejos', video: 'En vídeo', ess: 'Lo esencial', frise: 'Cronología', som: 'Índice', act: 'Actores clave', deb: 'El debate', syn: 'Síntesis',
          lex: 'Léxico', sujets: 'Temas de disertación', ret: 'Para recordar', piste: 'Pista', partie: 'Parte', def: 'Definición',
          cours: 'La lección', parties: 'partes', sections: 'secciones', dates: 'fechas', min: 'min de lectura', chap: 'Capítulo' },
    de: { fiche: 'Übersicht', ficheTitre: 'Auf zwei Seiten', ficheSous: 'Zum Lernen oder Drucken', surSite: 'Auf ECG Prépa', sources: 'Quellen', retour: 'Alle Landeskunde-Kurse', plusLoin: 'Weiterführendes', video: 'Im Video', ess: 'Das Wesentliche', frise: 'Zeitleiste', som: 'Inhalt', act: 'Schlüsselfiguren', deb: 'Die Debatte', syn: 'Synthese',
          lex: 'Wortschatz', sujets: 'Aufsatzthemen', ret: 'Merksätze', piste: 'Hinweis', partie: 'Teil', def: 'Definition',
          cours: 'Die Lektion', parties: 'Teile', sections: 'Abschnitte', dates: 'Daten', min: 'Min. Lesezeit', chap: 'Kapitel' }
  };
  const LANGUE = { en: 'anglais', es: 'espagnol', de: 'allemand' };
  const DRAPEAU = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪' };

  const typo = s => String(s ?? '').replace(/ ([:;!?»%])/g, ' $1').replace(/« /g, '« ');
  const estTraduit = v => v && typeof v === 'object' && !Array.isArray(v) && ('fr' in v || 'en' in v || 'es' in v || 'de' in v);
  const R = v => estTraduit(v) ? (v[lang] ?? v.fr) : v;
  const L = v => { const x = R(v); return lang === 'fr' ? typo(x) : String(x ?? ''); };
  const A = v => { const x = R(v); return Array.isArray(x) ? x : []; };
  const ton = c => { const m = /--a(\d)/.exec(c || ''); return 'ton-' + (m ? m[1] : '1'); };
  const mots = s => String(s || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  function bloc(b) {
    switch (b.t) {
      case 'p': return `<p class="b-p">${L(b.c)}</p>`;
      case 'encadre': return `<aside class="b-encadre ${ton(b.c)}"><p class="b-encadre-titre">${L(b.titre)}</p><p>${L(b.c2)}</p></aside>`;
      case 'citation': return `<figure class="b-citation"><blockquote>${L(b.c)}</blockquote><figcaption>${L(b.src)}</figcaption></figure>`;
      case 'def': return `<dl class="b-def"><dt><span>${UI[lang].def}</span>${L(b.mot)}</dt><dd>${L(b.c)}</dd></dl>`;
      case 'liste': return `<ul class="b-liste">${A(b.items).map(i => `<li>${L(i)}</li>`).join('')}</ul>`;
      case 'faits': return `<dl class="b-faits">${A(b.items).map(i => `<div><dt>${L(i.l)}</dt><dd>${L(i.v)}</dd></div>`).join('')}</dl>`;
      case 'tl': return `<ol class="b-tl">${A(b.items).map(i => `<li><span class="d">${L(i.d)}</span><span class="c">${L(i.c)}</span></li>`).join('')}</ol>`;
      case 'stats': return `<div class="b-stats">${A(b.items).map(i => `<div class="stat ${ton(i.c)}"><b>${L(i.n)}</b><span>${L(i.d)}</span></div>`).join('')}</div>`;
      case 'image': return `<figure class="b-image ${b.format || ''}"><img src="${b.src}" alt="${L(b.alt)}" loading="lazy" width="${b.l || 1280}" height="${b.h || 853}">
        <figcaption>${b.titre ? `<b class="fig-titre">${L(b.titre)}</b>` : ''}<span>${L(b.legende)}</span></figcaption></figure>`;
      case 'images': return `<div class="b-images">${b.items.map(i => `<figure class="b-image"><img src="${i.src}" alt="${L(i.alt)}" loading="lazy" width="${i.l}" height="${i.h}"><figcaption>${i.titre ? `<b class="fig-titre">${L(i.titre)}</b>` : ''}<span>${L(i.legende)}</span></figcaption></figure>`).join('')}</div>`;
      case 'schema': return `<figure class="b-schema"><figcaption class="b-schema-titre">${L(b.titre)}</figcaption>
        <div class="b-schema-svg">${R(b.svg)}</div><p class="b-glisser" aria-hidden="true">${lang === 'fr' ? 'Faire glisser le schéma →' : 'Swipe to see the diagram →'}</p>${b.legende ? `<p class="b-note">${L(b.legende)}</p>` : ''}</figure>`;
      case 'graphique': {
        const series = b.series || [];
        const leg = series.length > 1 ? `<ul class="g-legende">${series.map(x => `<li><i style="background:${x.c}"></i>${L(x.l)}</li>`).join('')}</ul>` : '';
        const max = b.max || 100;
        const nb = v => (b.dec ? v.toFixed(b.dec) : String(v)).replace('.', lang === 'fr' ? ',' : '.');
        const lignes = b.items.map(it => {
          const segs = it.v.map((v, i) => `<span class="g-seg" style="width:${100 * v / max}%;background:${series[i].c}" title="${L(it.l)} · ${L(series[i].l)} : ${nb(v)} %"><b>${nb(v)}${lang === 'fr' ? ' ' : ''}%</b></span>`).join('');
          return `<div class="g-ligne${it.fort ? ' fort' : ''}"><span class="g-lib">${L(it.l)}</span><span class="g-piste">${segs}</span></div>`;
        }).join('');
        const repere = b.repere != null ? `<span class="g-repere" style="left:${100 * b.repere / max}%"><em>${L(b.repereL)}</em></span>` : '';
        return `<figure class="b-graph"><figcaption class="b-schema-titre">${L(b.titre)}</figcaption>${leg}
          <div class="g-corps">${lignes}<div class="g-reperes" aria-hidden="true"><span class="g-lib"></span><span class="g-piste">${repere}</span></div></div>
          ${b.source ? `<p class="b-note">${L(b.source)}</p>` : ''}</figure>`;
      }
      case 'comparaison': {
        const max = b.max || 100, nb = v => String(v).replace('.', lang === 'fr' ? ',' : '.') + (lang === 'fr' ? '\u202f%' : '%');
        return `<figure class="b-graph b-comp"><figcaption class="b-schema-titre">${L(b.titre)}</figcaption>
          <ul class="g-legende">${b.series.map(x => `<li><i style="background:${x.c}"></i>${L(x.l)}</li>`).join('')}</ul>
          <div class="c-corps">${b.items.map(it => `<div class="c-ligne"><span class="g-lib"><b>${L(it.l)}</b>${it.n ? `<small>${L(it.n)}</small>` : ''}</span>
            <span class="c-barres">${[it.a, it.b].map((v, i) => `<span class="c-barre"><i style="width:${100 * v / max}%;background:${b.series[i].c}"></i><em>${nb(v)}</em></span>`).join('')}</span></div>`).join('')}</div>
          ${b.source ? `<p class="b-note">${L(b.source)}</p>` : ''}</figure>`;
      }
      case 'periodes': {
        const t0 = b.debut, t1 = b.fin, pc = x => 100 * (x - t0) / (t1 - t0);
        const ans = []; for (let a = Math.ceil(t0); a <= t1; a += (b.pas || 2)) ans.push(a);
        return `<figure class="b-periodes"><figcaption class="b-schema-titre">${L(b.titre)}</figcaption>
          <div class="p-corps"><div class="p-axe">${ans.map(a => `<span style="left:${pc(a)}%">${a}</span>`).join('')}</div>
          ${b.items.map(it => `<div class="p-ligne"><span class="p-lib"><b>${L(it.l)}</b><small>${L(it.d)}</small></span>
            <span class="p-piste">${ans.map(a => `<i style="left:${pc(a)}%"></i>`).join('')}<span class="p-barre" style="left:${pc(it.a)}%;width:${Math.max(.6, pc(it.b) - pc(it.a))}%;background:${it.c}" title="${L(it.l)} : ${L(it.d)}"></span></span></div>`).join('')}</div>
          ${b.legende ? `<p class="b-note">${L(b.legende)}</p>` : ''}</figure>`;
      }
      case 'echelle': return `<figure class="b-echelle"><figcaption class="b-schema-titre">${L(b.titre)}</figcaption>
        <div class="e-sens"><span>${L(b.gauche)}</span><span>${L(b.droite)}</span></div>
        <ol class="e-marches">${b.marches.map((m, i) => `<li class="${m.ici ? 'ici' : ''}${m.cible ? ' cible' : ''}"><span class="e-num">${i + 1}</span><b>${L(m.l)}</b><span class="e-ex">${L(m.ex)}</span>${m.tag ? `<em class="e-tag">${L(m.tag)}</em>` : ''}</li>`).join('')}</ol>
        ${b.legende ? `<p class="b-note">${L(b.legende)}</p>` : ''}</figure>`;
      case 'tableau': {
        const h = A(b.head), r = A(b.rows);
        return `<div class="b-tableau"><table>${h.length ? `<thead><tr>${h.map(x => `<th>${L(x)}</th>`).join('')}</tr></thead>` : ''}<tbody>${
          r.map(row => `<tr>${row.map((x, i) => i ? `<td>${L(x)}</td>` : `<th scope="row">${L(x)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      }
    }
    return '';
  }

  function blocs(liste) { return liste.map(bloc).join(''); }

  function rendre() {
    const C = COURS, m = C.meta;
    const l2 = Object.keys(m.titre).find(k => k !== 'fr');
    if (lang !== 'fr' && lang !== l2) lang = 'fr';
    const t = UI[lang];
    document.documentElement.lang = lang;
    document.documentElement.dataset.langue = LANGUE[l2] || 'anglais';

    const parties = C.parties.map((p, pi) => `
      <section class="partie ${ton(p.couleur)}" id="partie-${pi + 1}">
        <header class="partie-tete">
          <span class="partie-num">${p.num}</span>
          <p class="partie-kicker">${t.partie} ${p.num} · ${L(p.kicker)}</p>
          <h2>${L(p.titre)}</h2>
        </header>
        ${p.sections.map((s, si) => `
          <section class="sous" id="s-${pi + 1}-${si + 1}">
            <h3><span class="sous-num">${pi + 1}.${si + 1}</span><span class="sous-titre">${L(s.titre)}</span></h3>
            <div class="sous-corps">${blocs(s.blocs)}</div>
          </section>`).join('')}
      </section>`).join('');

    const annexes = [];
    if (C.acteurs) annexes.push(['acteurs', t.act, `<div class="acteurs-grille">${C.acteurs.map(a => `<article class="acteur ${ton(a.c)}">
          <span class="initiales" aria-hidden="true">${a.nom.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('')}</span>
          <h3>${a.nom}</h3><p class="role">${L(a.role)}</p><p class="acteur-d">${L(a.d)}</p></article>`).join('')}</div>`]);
    if (C.debat) annexes.push(['debat', t.deb, `<p class="debat-q">${L(C.debat.question)}</p>
        <div class="debat-cols">${['oui', 'non'].map(k => `<div class="debat-col debat-${k}"><h3>${L(C.debat[k].titre)}</h3>
          <ul>${A(C.debat[k].items).map(i => `<li>${L(i)}</li>`).join('')}</ul></div>`).join('')}</div>
        <div class="debat-syn"><p class="etiquette">${t.syn}</p><p>${L(C.debat.synthese)}</p></div>`]);
    if (C.lexique) annexes.push(['lexique', t.lex, `<dl class="lex-liste">${C.lexique.map(x => `<div><dt lang="${l2}">${x[l2] ?? ''}</dt><dd>${typo(x.fr)}</dd></div>`).join('')}</dl>`]);
    if (C.sujets) annexes.push(['sujets', t.sujets, `<ol class="sujets-liste">${C.sujets.map(s => `<li><details><summary>${L(s.q)}</summary><p><b>${t.piste}${lang === 'fr' ? ' ' : ''}:</b> ${L(s.h)}</p></details></li>`).join('')}</ol>`]);
    if (C.retenir) annexes.push(['retenir', t.ret, `<ul class="ret-liste">${A(C.retenir).map(r => `<li>${L(r)}</li>`).join('')}</ul>`]);

    if (C.plusLoin) annexes.push(['plus-loin', t.plusLoin, `<div class="pl-cols">
        <div><h3>${t.surSite}</h3><ul class="pl-liens">${C.plusLoin.liens.map(x => `<li><a href="${x.href}"><span><small>${L(x.type)}</small><b>${L(x.titre)}</b></span><span aria-hidden="true">→</span></a></li>`).join('')}</ul></div>
        <div><h3>${t.sources}</h3><ul class="pl-sources">${C.plusLoin.sources.map(x => `<li>${L(x)}</li>`).join('')}</ul></div>
      </div>
      <div class="pl-fin"><a href="../index.html">← ${t.retour}</a></div>`]);
    const annexeHTML = ([id, titre, html]) => `<section class="annexe ${id}" id="${id}"><h2 class="etiquette annexe-titre">${titre}</h2>${html}</section>`;


    document.getElementById('cours').innerHTML = `
      <div class="progression"><span></span></div>
      <header class="heros" id="haut">
        <div class="heros-in">
          <span class="heros-chap" aria-hidden="true">${String(m.chapitre || '').padStart(2, '0')}</span>
          <p class="heros-label"><span class="heros-drapeau" aria-hidden="true">${m.drapeau || ''}</span>${L(m.label)}</p>
          <h1${R(m.titre).replace(/<[^>]+>/g, '').length > 18 ? ' class="long"' : ''}>${L(m.titre)}</h1>
          <p class="heros-sous">${L(m.sousTitre)}</p>
          <div class="heros-actions">
          ${m.video ? `<a class="heros-video" href="${m.video.url}" target="_blank" rel="noopener">
            <span class="hv-ic" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 1.5v11l9-5.5z" fill="currentColor"/></svg></span>
            <span class="hv-tx"><small>${t.video}</small><b>${m.video.titre}</b><span>${m.video.chaine}</span></span>
            <span class="hv-fl" aria-hidden="true">↗</span></a>` : ''}
          ${m.fiche ? `<a class="heros-video heros-fiche" href="${m.fiche.href || m.fiche}">
            <span class="hv-ic" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 16 16"><path d="M4 1.5h5.5L13 5v9.5H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6.5 8h4M6.5 11h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></span>
            <span class="hv-tx"><small>${t.fiche}</small><b>${m.fiche.titre ? L(m.fiche.titre) : t.ficheTitre}</b><span>${t.ficheSous}</span></span>
            <span class="hv-fl" aria-hidden="true">→</span></a>` : ''}
          </div>
        </div>
        ${m.image ? `<figure class="heros-image"><img src="${m.image.src}" alt="${L(m.image.alt)}"${m.image.credit ? ` title="${m.image.credit}"` : ''}><figcaption>${L(m.image.legende)}</figcaption></figure>` : ''}
      </header>
      <section class="essentiel" id="essentiel">
        <div class="ess-texte"><h2 class="etiquette">${t.ess}</h2><p>${L(C.essentiel)}</p></div>
        ${C.chiffres ? `<div class="ess-chiffres">${C.chiffres.map(c => `<div class="chiffre"><b>${L(c.n)}</b><span>${L(c.d)}</span></div>`).join('')}</div>` : ''}
      </section>
      <div class="page"><main class="corps">${parties}</main></div>
      ${annexes.map(annexeHTML).join('')}`;

    document.querySelectorAll('.langues button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
    const bt = document.getElementById('bc-titre'); if (bt) bt.innerHTML = L(m.titre);
  }

  document.querySelectorAll('.langues button').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.l; const y = scrollY; rendre(); scrollTo(0, y);
  }));
  addEventListener('scroll', () => {
    const p = document.querySelector('.progression span');
    if (p) p.style.width = (100 * scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) + '%';
  }, { passive: true });
  rendre();
})();
