/* Liste des thèmes du jour (flashcards/theme.html), du plus récent au plus ancien. Une entrée par thème, ajoutée
   EN TÊTE à chaque nouveau thème (voir CLAUDE.md, « Thème du jour ») : date, titre (le même que dans le fichier
   du thème), identifiants des cartes du paquet employées dans le thème, nombre de mots nouveaux (aides).
   Chargé avec ?v=<minute> (cache de Cloudflare, voir CLAUDE.md). */
window.ECG_THEMES = {
  anglais: [
    { date: "2026-11-26", titre: "GTA VI : 3,79 milliards de dollars en un jour, un record pour le divertissement", phrases: 5,
      cartes: ["440a3bbc91", "4c969c102c", "9d9c070f01", "572ba4a331", "2816a36cc2"], aides: 7 },
    { date: "2026-11-25", titre: "Voyager 1 franchit un jour-lumière, quarante-neuf ans après son lancement", phrases: 5,
      cartes: ["1251e5efbf", "440a3bbc91", "d331381d95", "1e3cce3ca8", "572ba4a331"], aides: 8 },
    { date: "2026-11-24", titre: "États-Unis : la rougeole est de retour, vingt-six ans après avoir été éliminée", phrases: 5,
      cartes: ["496b1a892a", "2f3c448c6b", "17f96e1334", "440a3bbc91", "7cf7050d17", "ccaab6ab98", "64cb40d8ef"], aides: 7 },
    { date: "2026-11-23", titre: "Irlande : les data centers engloutissent près d'un quart de l'électricité du pays", phrases: 5,
      cartes: ["d6baff3c71", "6826551a9d", "21fde8a03a", "7d45b0ea7c", "83ced2984c", "6790d8d8c7", "6f6a732897", "9a9512d4ab",
        "04b249819a", "23d0f41bcb", "b62754498a", "60ffca81e3", "ee041c63a6"], aides: 6 },
    { date: "2026-11-21", titre: "Amazonie : la forêt recule moins vite, mais le danger n'est pas écarté", phrases: 5,
      cartes: ["440a3bbc91", "b828465044", "3c60232891", "7cf7050d17", "296c401334", "17f96e1334", "756941bfae"], aides: 8 }
  ]
};
