/* Chapitres de maths (cours-maths.css) : rendu des formules KaTeX.
   KaTeX 0.16.9 et son auto-render sont chargés en `defer` dans le <head>. */
(function () {
  function rendre() {
    if (!window.renderMathInElement) return;
    renderMathInElement(document.body, {
      delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }],
      throwOnError: false,
      strict: false,
      macros: { '\\R': '\\mathbb{R}', '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}', '\\C': '\\mathcal{C}' }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', rendre);
  else rendre();
})();
