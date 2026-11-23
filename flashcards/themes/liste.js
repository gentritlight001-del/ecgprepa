/* Liste des thèmes du jour (flashcards/theme.html), du plus récent au plus ancien. Une entrée par thème, ajoutée
   EN TÊTE à chaque nouveau thème (voir CLAUDE.md, « Thème du jour ») : date, titre (le même que dans le fichier
   du thème), identifiants des cartes du paquet employées dans le thème, nombre de mots nouveaux (aides).
   Chargé avec ?v=<minute> (cache de Cloudflare, voir CLAUDE.md). */
window.ECG_THEMES = {
  anglais: [
    { date: "2026-11-24", titre: "États-Unis : la rougeole est de retour, vingt-six ans après avoir été éliminée", phrases: 5,
      cartes: ["496b1a892a", "2f3c448c6b", "17f96e1334", "440a3bbc91", "7cf7050d17", "ccaab6ab98", "64cb40d8ef"], aides: 7 },
    { date: "2026-11-23", titre: "Irlande : les data centers engloutissent près d'un quart de l'électricité du pays", phrases: 5,
      cartes: ["c604baeb7d", "6826551a9d", "21fde8a03a", "7d45b0ea7c", "83ced2984c", "6790d8d8c7", "6f6a732897", "9a9512d4ab",
        "04b249819a", "23d0f41bcb", "b62754498a", "60ffca81e3", "ee041c63a6"], aides: 6 },
    { date: "2026-11-21", titre: "Amazonie : la forêt recule moins vite, mais le danger n'est pas écarté", phrases: 5,
      cartes: ["440a3bbc91", "b828465044", "3c60232891", "7cf7050d17", "296c401334", "17f96e1334", "756941bfae"], aides: 8 }
  ]
};
