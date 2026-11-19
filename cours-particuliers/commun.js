/* Outils communs à cours-particuliers.html et mes-eleves.html. */
(function () {
  var TZ = 'Europe/Paris';
  var NBSP = ' ';

  function echap(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* Typographie française sur du texte brut : espace insécable avant
     : ; ! ? % € » et après «, et dans les grands nombres. */
  function typo(t) {
    return String(t == null ? '' : t)
      .replace(/ ([:;!?%€»])/g, NBSP + '$1')
      .replace(/« /g, '«' + NBSP)
      .replace(/(\d) (\d{3})\b/g, '$1' + NBSP + '$2');
  }
  /* Texte saisi par le professeur : échappé, typographié, retours à la ligne gardés. */
  function texte(t) { return typo(echap(t)).replace(/\n/g, '<br>'); }

  function parts(d) {
    var o = {};
    new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(d)).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }
  function majuscule(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  /* « mercredi 25 novembre » (l'année seulement si ce n'est pas l'année en cours) */
  function jour(d, avecJour) {
    var p = parts(d), cette = parts(new Date()).year;
    return (avecJour === false ? '' : p.weekday + ' ') + p.day + ' ' + p.month + (p.year !== cette ? ' ' + p.year : '');
  }
  function heure(d) { var p = parts(d); return p.hour + NBSP + 'h' + NBSP + p.minute; }
  function duree(min) {
    if (!min) return '';
    var h = Math.floor(min / 60), m = min % 60;
    return h ? h + NBSP + 'h' + (m ? NBSP + (m < 10 ? '0' : '') + m : '') : m + NBSP + 'min';
  }
  /* Une date « AAAA-MM-JJ » (colonne date) lue à midi pour éviter tout décalage. */
  function dateSimple(s) { return new Date(s + 'T12:00:00'); }

  var TYPES = { exercices: 'Exercices', corrige: 'Corrigé', controle: 'Contrôle', fiche: 'Fiche', autre: 'Document' };

  window.CP = {
    echap: echap, typo: typo, texte: texte, majuscule: majuscule,
    jour: jour, heure: heure, duree: duree, dateSimple: dateSimple, TYPES: TYPES,
    BUCKET: 'cours-particuliers',
    fiches: function () { return (window.CP_FICHES || []).slice().sort(function (a, b) { return a.n - b.n; }); },
    num: function (n) { return (n < 10 ? '0' : '') + n; },
    /* Ouvre un PDF du bucket privé (lien signé de 10 minutes). La fenêtre est
       ouverte tout de suite, sinon le navigateur la bloque après l'attente. */
    ouvrirPdf: function (client, chemin) {
      var w = window.open('', '_blank');
      return client.storage.from('cours-particuliers').createSignedUrl(chemin, 600).then(function (r) {
        if (r.error || !r.data) throw r.error || new Error('lien');
        if (w) w.location.href = r.data.signedUrl; else location.href = r.data.signedUrl;
      }).catch(function () {
        if (w) w.close();
        alert('Impossible d\'ouvrir ce document. Réessaie dans un instant.');
      });
    }
  };
})();
