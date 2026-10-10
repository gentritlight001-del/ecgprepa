/* Cartes de vocabulaire (français → langue étrangère), communes à la page du jour
   (quotidien/jour-*.html) et à l'espace flashcards (flashcards/index.html).

   ECGCartes.creer({
     titre: 'Mémoriser · français → anglais',
     sens: 'Français → anglais',
     paquets: [{ id, libelle, mots: [{ en, fr, ex }] }, …],   // boutons de paquet
     parJour: [{ id, libelle, mots }],                       // facultatif : liste déroulante
     cleRevoir: 'ecg-anglais-quotidien-a-revoir',             // paquet « À revoir » (localStorage)
     date: '2026-10-10',                                      // date notée sur les mots ratés
     initial: 'revoir'                                        // paquet ouvert au départ
   }) → élément à insérer dans la page.

   Une carte ratée revient trois cartes plus loin, jusqu'à ce qu'elle soit sue, et rejoint le
   paquet « À revoir », gardé d'un jour à l'autre ; elle en sort quand on la sait dans ce paquet. */
(function () {
  'use strict';

  function typo(s) {
    return String(s == null ? '' : s)
      .replace(/ ([:;!?%»])/g, ' $1')
      .replace(/« /g, '« ');
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; }
    return t;
  }
  function lire(cle) {
    try { return JSON.parse(localStorage.getItem(cle) || '[]') || []; } catch (e) { return []; }
  }
  function ecrire(cle, l) {
    try { localStorage.setItem(cle, JSON.stringify(l)); } catch (e) { /* stockage indisponible */ }
  }
  /* Un même mot peut revenir d'un jour à l'autre : on ne le garde qu'une fois. */
  function sansDoublons(mots) {
    var vus = {};
    return mots.filter(function (m) { if (vus[m.en]) return false; vus[m.en] = 1; return true; });
  }

  function creer(o) {
    var cle = o.cleRevoir;
    var paquets = {};
    (o.paquets || []).concat(o.parJour || []).forEach(function (p) { paquets[p.id] = p; });
    var etat = { paquet: o.initial && (o.initial === 'revoir' || paquets[o.initial]) ? o.initial : (o.paquets[0] && o.paquets[0].id), file: [], total: 0, sus: 0, rates: 0, carte: null };

    var box = el('div', 'memo');
    var tete = el('div', 'memo-tete', o.titre ? '<h3>' + typo(o.titre) + '</h3>' : '');
    var barre = el('div', 'memo-paquets');
    o.paquets.concat([{ id: 'revoir', libelle: 'À revoir' }]).forEach(function (p) {
      var b = el('button', 'memo-paquet'); b.type = 'button'; b.setAttribute('data-paquet', p.id);
      b.addEventListener('click', function () { choisir(p.id); });
      barre.appendChild(b);
    });
    var choix = null;
    if (o.parJour && o.parJour.length) {
      choix = el('select', 'memo-jour');
      choix.setAttribute('aria-label', 'Choisir un jour');
      choix.appendChild(el('option', null, 'Un jour précis…')).value = '';
      o.parJour.forEach(function (p) { var op = el('option', null, typo(p.libelle)); op.value = p.id; choix.appendChild(op); });
      choix.addEventListener('change', function () { if (choix.value) choisir(choix.value); });
      barre.appendChild(choix);
    }
    tete.appendChild(barre);
    box.appendChild(tete);
    var progres = el('div', 'memo-progres', '<div class="memo-jauge"><i></i></div><span></span>');
    box.appendChild(progres);
    var carte = el('div', 'memo-carte');
    carte.tabIndex = 0;
    box.appendChild(carte);
    var actions = el('div', 'memo-actions');
    var bRetourner = el('button', 'memo-retourner', 'Retourner la carte'); bRetourner.type = 'button';
    var bRevoir = el('button', 'memo-non', 'À revoir'); bRevoir.type = 'button';
    var bSavais = el('button', 'memo-oui', 'Je savais'); bSavais.type = 'button';
    actions.appendChild(bRetourner); actions.appendChild(bRevoir); actions.appendChild(bSavais);
    box.appendChild(actions);
    var aide = el('p', 'memo-aide', typo('Clavier : espace pour retourner, ← à revoir, → je savais.'));
    box.appendChild(aide);

    function mots() { return etat.paquet === 'revoir' ? lire(cle) : sansDoublons(paquets[etat.paquet].mots); }
    function majPaquets() {
      barre.querySelectorAll('.memo-paquet').forEach(function (b) {
        var k = b.getAttribute('data-paquet');
        var n = k === 'revoir' ? lire(cle).length : sansDoublons(paquets[k].mots).length;
        b.classList.toggle('actif', k === etat.paquet);
        b.textContent = (k === 'revoir' ? 'À revoir' : paquets[k].libelle) + ' (' + n + ')';
      });
      if (choix) {
        var jour = !!(o.parJour || []).filter(function (p) { return p.id === etat.paquet; }).length;
        choix.classList.toggle('actif', jour);
        if (!jour) choix.value = '';
      }
    }
    function majProgres() {
      progres.querySelector('i').style.width = (etat.total ? Math.round(100 * etat.sus / etat.total) : 0) + '%';
      progres.querySelector('span').textContent = etat.sus + ' / ' + etat.total + ' sus' + (etat.rates ? ' · ' + etat.rates + ' à revoir' : '');
    }
    function choisir(id) { etat.paquet = id; demarrer(); }
    function demarrer() {
      etat.file = melanger(mots().slice());
      etat.total = etat.file.length; etat.sus = 0; etat.rates = 0;
      majPaquets(); suivante();
    }
    function suivante() {
      majProgres();
      etat.carte = etat.file.shift() || null;
      carte.classList.remove('retournee');
      if (!etat.carte) return fin();
      carte.innerHTML = '<div class="memo-sens">' + typo(o.sens || 'Français → anglais') + '</div>' +
        '<div class="memo-recto">' + typo(etat.carte.fr) + '</div>' +
        '<div class="memo-verso"><div class="memo-trad">' + etat.carte.en + '</div>' +
        (etat.carte.ex ? '<div class="memo-ex">' + etat.carte.ex + '</div>' : '') + '</div>';
      actions.className = 'memo-actions';
      aide.hidden = false;
    }
    function fin() {
      actions.className = 'memo-actions fini';
      aide.hidden = true;
      if (!etat.total) {
        carte.innerHTML = typo('<div class="memo-fin">' + (etat.paquet === 'revoir' ? 'Aucun mot à revoir pour l’instant.' : 'Aucune carte dans ce paquet.') +
          '<small>Les mots marqués « À revoir » s’ajoutent ici et vous suivent d’un jour à l’autre.</small></div>');
        return;
      }
      carte.innerHTML = '<div class="memo-fin">' + etat.total + (etat.total > 1 ? ' mots sus' : ' mot su') + ' !<small>' +
        typo(etat.rates ? etat.rates + ' raté' + (etat.rates > 1 ? 's' : '') + ' en route, gardé' + (etat.rates > 1 ? 's' : '') + ' dans « À revoir ».' : 'Aucune erreur.') +
        '</small><span class="memo-fin-actions"><button type="button" class="memo-retourner" data-a="refaire">Recommencer</button></span></div>';
      carte.querySelector('[data-a="refaire"]').addEventListener('click', demarrer);
    }
    function retourner() { if (etat.carte) carte.classList.add('retournee'); }
    function savais() {
      if (!etat.carte) return;
      if (etat.paquet === 'revoir') ecrire(cle, lire(cle).filter(function (m) { return m.en !== etat.carte.en; }));
      etat.sus++; majPaquets(); suivante();
    }
    function aRevoir() {
      if (!etat.carte) return;
      var l = lire(cle);
      if (!l.some(function (m) { return m.en === etat.carte.en; })) {
        l.push({ en: etat.carte.en, fr: etat.carte.fr, ex: etat.carte.ex || '', date: etat.carte.date || o.date || '' });
        ecrire(cle, l);
      }
      etat.rates++;
      etat.file.splice(Math.min(3, etat.file.length), 0, etat.carte);
      majPaquets(); suivante();
    }
    carte.addEventListener('click', function (ev) { if (!ev.target.closest('button')) retourner(); });
    bRetourner.addEventListener('click', retourner);
    bRevoir.addEventListener('click', aRevoir);
    bSavais.addEventListener('click', savais);
    box.addEventListener('keydown', function (ev) {
      if (/INPUT|TEXTAREA|BUTTON|SELECT/.test(ev.target.tagName) && ev.key === ' ') return;
      if (ev.key === ' ') { ev.preventDefault(); if (carte.classList.contains('retournee')) return; retourner(); }
      else if (ev.key === 'ArrowLeft' && carte.classList.contains('retournee')) aRevoir();
      else if (ev.key === 'ArrowRight' && carte.classList.contains('retournee')) savais();
    });
    demarrer();
    return box;
  }

  window.ECGCartes = { creer: creer, lire: lire };
})();
