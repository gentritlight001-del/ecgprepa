/* Thème du jour d'anglais, 26 novembre 2026 (voir CLAUDE.md, « Thème du jour »).
   ((…)) = mot d'une carte du paquet d'anglais (cartes, dans l'ordre) ; [[…]] = mot nouveau (aides, dans l'ordre).
   Motifs `ok` et `re` : expressions régulières en minuscules, sans accents, nombres en chiffres, orthographe
   américaine, jamais de tiret (flashcards/theme-correcteur.js). Faits : actualites/monde/articles/
   gta-vi-lancement-record-2026.html, d'après Take-Two (formulaire 8-K déposé à la SEC, communiqué de Rockstar Games
   du 20 novembre 2026 : 3,79 milliards de dollars de ventes au détail à la fin du jour de lancement, « record for
   entertainment across any medium », 32,5 millions d'exemplaires vendus avant la sortie), Kotaku et The Next Web
   (20 novembre 2026), Yahoo Finance (GTA V en 2013 : environ 815 millions de dollars le premier jour ; action Take-Two
   en baisse de 3,7 % le jeudi 19 novembre, jour de la sortie, puis en hausse le vendredi 20 après l'annonce des
   chiffres, environ 2,7 % selon The Next Web ; commission des boutiques des consoles, que l'éditeur ne publie pas).
   Sortie le jeudi 19 novembre 2026 sur PS5 et Xbox Series. Analystes : beaucoup de ventes faites dès les précommandes,
   le rythme pourrait ralentir ensuite. */
window.ECG_THEMES_DONNEES = window.ECG_THEMES_DONNEES || {};
window.ECG_THEMES_DONNEES["anglais/2026-11-26"] = {
  langue: "anglais",
  date: "2026-11-26",
  titre: "GTA VI : 3,79 milliards de dollars en un jour, un record pour le divertissement",
  phrases: [
    {
      fr: "Le jeu vidéo Grand Theft Auto VI, sorti le 19 novembre, a réalisé environ 3,79 milliards de dollars de ventes en un seul jour, ((selon)) son [[éditeur]], Take-Two.",
      cartes: [{ id: "440a3bbc91", fr: "selon, d'après", en: "according to", re: "according to" }],
      aides: [{ fr: "un éditeur (de jeux, de livres)", en: "a publisher" }],
      proposition: "The video game Grand Theft Auto VI, released on 19 November, generated about 3.79 billion dollars in sales in a single day, according to its publisher, Take-Two.",
      autres: [
        "The video game Grand Theft Auto VI, which came out on November 19, made around $3.79 billion in sales in just one day, according to its publisher, Take-Two."
      ],
      tests: [
        "Grand Theft Auto VI, the video game released on 19 November, racked up sales of roughly $3.79bn in a single day, according to Take-Two, its publisher.",
        "The video game GTA VI, launched on 19 November, brought in some 3.79 billion dollars of retail sales on its first day, according to its publisher Take-Two."
      ],
      morceaux: [
        {
          fr: "Le jeu vidéo Grand Theft Auto VI,",
          en: "The video game Grand Theft Auto VI",
          pourquoi: "En anglais, le nom qui précise se place devant : a video game (un jeu vidéo), jamais a game video. Le titre suit, comme en français.",
          pts: 0.5,
          ok: [
            "(the )?(video game|videogame|blockbuster video game|blockbuster game|game) (grand theft auto|gta) (vi|6)",
            "(grand theft auto|gta) (vi|6),? (the |a )?(blockbuster )?(video game|videogame)"
          ],
          fautes: [
            {
              re: ["game video\\b", "video's game", "video play\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "the game video Grand Theft Auto VI",
              juste: "the video game Grand Theft Auto VI",
              test: "The game video Grand Theft Auto VI, released on 19 November, generated about 3.79 billion dollars in sales in a single day, according to its publisher, Take-Two.",
              pourquoi: "Le français dit « jeu vidéo », le nom principal d'abord. L'anglais fait l'inverse : le nom qui précise vient devant, et le nom principal à la fin. « A game video » voudrait dire une vidéo de jeu (une vidéo qui montre un jeu).",
              regle: "<b>Nom + nom</b> : le nom qui précise devant, le nom principal à la fin (a video game, a computer screen, a car factory).",
              ex: "Rockstar is a video game studio based in New York.",
              exfr: "Rockstar est un studio de jeux vidéo installé à New York.",
              lecon: { n: 8, ancre: "adjectif-position", titre: "La place de l'adjectif épithète" },
              carte: { fr: "un jeu vidéo", en: "a video game (nom + nom)" }
            },
            {
              re: ["the (video game|game|videogame) of (grand theft auto|gta)"],
              type: "gallicisme",
              pts: 0.25,
              faux: "the video game of Grand Theft Auto VI",
              juste: "the video game Grand Theft Auto VI",
              test: "The video game of Grand Theft Auto VI, released on 19 November, generated about 3.79 billion dollars in sales in a single day, according to its publisher, Take-Two.",
              pourquoi: "Le titre d'une œuvre se place juste après le nom, sans of : the video game Grand Theft Auto VI, the film Titanic. « The video game of GTA » ferait penser à un jeu tiré d'une autre œuvre appelée GTA.",
              regle: "Nom + titre, <b>sans préposition</b> : the novel 1984, the video game Grand Theft Auto VI.",
              ex: "The film Avengers: Endgame came out in 2019.",
              exfr: "Le film Avengers : Endgame est sorti en 2019.",
              carte: { fr: "le jeu vidéo GTA VI", en: "the video game GTA VI (sans of)" }
            }
          ]
        },
        {
          fr: "sorti le 19 novembre,",
          en: "released on 19 November",
          pourquoi: "Un jeu, un film ou un album « sort » : il is released, ou il comes out. Le participe passé released remplace « sorti », et une date précise prend on.",
          pts: 1,
          ok: [
            "(which was |that was |which |that )?(released|launched|came out|went on sale|hit (the )?(stores|shelves)|was released|was launched|out)( on)? (thursday )?(november 19(th)?|19(th)? (of )?november|the 19(th)? of november)"
          ],
          fautes: [
            {
              re: ["(went out|goes out|exited|outed|sorted|sortied|got out|gone out|sorti)( on| in| at| the)? (thursday |the )?(november|19)"],
              type: "faux-sens",
              pts: 0.75,
              faux: "Grand Theft Auto VI, went out on 19 November",
              juste: "Grand Theft Auto VI, released on 19 November",
              test: "The video game Grand Theft Auto VI, went out on 19 November, generated about 3.79 billion dollars in sales in a single day, according to its publisher, Take-Two.",
              pourquoi: "« Sortir » n'a pas un seul équivalent. Pour une personne qui quitte un lieu : to go out. Pour un jeu, un film, un livre mis en vente : to be released ou to come out. « The game went out » laisse croire que le jeu est sorti de chez lui.",
              regle: "Sortir (une œuvre, un produit) : <b>to be released</b>, <b>to come out</b>, <b>to go on sale</b>. Sortir (une personne) : to go out.",
              ex: "The album came out in March and was released worldwide.",
              exfr: "L'album est sorti en mars, dans le monde entier.",
              carte: { fr: "sortir (un jeu, un film)", en: "to be released, to come out" }
            },
            {
              re: [
                "(released|launched|came out|went on sale|out) (in|at) (thursday )?(november 19(th)?|19(th)? (of )?november|the 19(th)?)",
                "(released|launched|came out|went on sale|out) the (19(th)?|november)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "released the 19 November / released in 19 November",
              juste: "released on 19 November",
              test: "The video game Grand Theft Auto VI, released the 19 November, generated about 3.79 billion dollars in sales in a single day, according to its publisher, Take-Two.",
              pourquoi: "Le français dit « le 19 novembre » sans préposition. L'anglais introduit une date par on ; in ne vaut que pour le mois entier (in November) et l'article seul (the 19 November) ne suffit pas.",
              regle: "<b>On</b> + jour ou date (on 19 November, on Thursday). <b>In</b> + mois, année (in November, in 2013). <b>At</b> + heure.",
              ex: "The console went on sale on 10 November.",
              exfr: "La console a été mise en vente le 10 novembre.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le 19 novembre", en: "on 19 November (on + date)" }
            }
          ]
        },
        {
          fr: "a réalisé environ 3,79 milliards de dollars de ventes",
          en: "generated about 3.79 billion dollars in sales",
          pourquoi: "« Réaliser des ventes » : generate, make, record sales. « Un milliard » se dit a billion, invariable après un nombre (3.79 billion), et « de ventes » devient in sales (ou sales of + montant).",
          pts: 1,
          ok: [
            "(has |had )?(generated|made|recorded|achieved|racked up|brought in|raked in|earned|posted|pulled in|took in|taken in|rung up|rang up|registered|reached|totaled|totalled|amassed|clocked up|notched up|chalked up|grossed)( some| about| around| roughly| approximately| nearly| almost| close to| an estimated| just under| just shy of)? (3 79 billion|3 79 bn|3 79bn)( (us |american )?dollars)?( (in|worth of) (retail )?sales| in (retail )?revenue| of retail sales| in retail| worth of games)?",
            "(has |had )?(generated|made|recorded|achieved|racked up|brought in|raked in|posted|pulled in|rung up|rang up|registered|reached|totaled|totalled|amassed|clocked up|notched up|chalked up) (retail )?sales (of|worth|totaling|totalling|amounting to)( some| about| around| roughly| approximately| nearly| almost| close to| an estimated| just under)? (3 79 billion|3 79 bn|3 79bn)( (us |american )?dollars)?",
            "(has |had )?sold (some |about |around |roughly |approximately |nearly |almost |an estimated )?(3 79 billion|3 79 bn|3 79bn)( (us |american )?dollars)?( '| ')?( worth)?( of copies)?"
          ],
          fautes: [
            {
              re: ["realiz(e|ed|es|ing)\\b"],
              type: "faux-sens",
              pts: 0.75,
              faux: "realized about 3.79 billion dollars in sales",
              juste: "generated about 3.79 billion dollars in sales",
              test: "The video game Grand Theft Auto VI, released on 19 November, realized about 3.79 billion dollars in sales in a single day, according to its publisher, Take-Two.",
              pourquoi: "Faux ami. To realize veut d'abord dire « se rendre compte » : « the game realized 3.79 billion » se lit comme « le jeu s'est rendu compte de 3,79 milliards ». Des ventes, un chiffre se « réalisent » avec generate, make, record ou bring in.",
              regle: "Réaliser (des ventes, un bénéfice) : <b>to generate, to make, to record</b>. To realize : <b>se rendre compte</b> (ou réaliser un rêve).",
              ex: "The company made a profit of 500 million dollars last year.",
              exfr: "L'entreprise a réalisé un bénéfice de 500 millions de dollars l'an dernier.",
              carte: { fr: "réaliser des ventes", en: "to generate sales (realize = se rendre compte)" }
            },
            {
              re: ["milliards?\\b", "billions (of )?(us )?(dollars|sales)", "3 79 billions"],
              type: "grammaire",
              pts: 0.5,
              faux: "3.79 billions dollars / 3.79 milliards",
              juste: "3.79 billion dollars",
              test: "The video game Grand Theft Auto VI, released on 19 November, generated about 3.79 billions dollars in sales in a single day, according to its publisher, Take-Two.",
              pourquoi: "Milliard n'existe pas en anglais : un milliard, c'est a billion. Après un nombre, billion (comme million, hundred) reste invariable : 3.79 billion dollars. Le pluriel billions of ne s'emploie que seul, au sens vague (des milliards de).",
              regle: "<b>Nombre + billion / million / hundred</b> sans s (3.79 billion). <b>Billions of</b> au sens vague.",
              ex: "GTA V sold 11 million copies on its first day.",
              exfr: "GTA V s'est vendu à 11 millions d'exemplaires le premier jour.",
              lecon: { n: 11, ancre: "grands-nombres", titre: "Les grands nombres : billion" },
              carte: { fr: "3,79 milliards de dollars", en: "3.79 billion dollars (billion invariable)" }
            },
            {
              re: ["(dollars|billion|bn) of sales\\b"],
              type: "gallicisme",
              pts: 0.25,
              faux: "3.79 billion dollars of sales",
              juste: "3.79 billion dollars in sales / sales of 3.79 billion dollars",
              test: "The video game Grand Theft Auto VI, released on 19 November, generated about 3.79 billion dollars of sales in a single day, according to its publisher, Take-Two.",
              pourquoi: "« X dollars de ventes » ne se calque pas avec of : l'anglais dit X dollars in sales (en ventes), ou sales of X dollars, le montant après sales.",
              regle: "Montant + <b>in sales / in revenue</b> (3 billion dollars in sales), ou <b>sales of</b> + montant.",
              ex: "The film made 1.2 billion dollars in ticket sales.",
              exfr: "Le film a réalisé 1,2 milliard de dollars d'entrées.",
              carte: { fr: "3 milliards de dollars de ventes", en: "3 billion dollars in sales" }
            }
          ]
        },
        {
          fr: "en un seul jour,",
          en: "in a single day",
          pourquoi: "« En un seul jour » : in a single day, in just one day. Single (ou just one) rend « seul » au sens de « un, pas plus ».",
          pts: 0.5,
          ok: [
            "(in|within|over) (a single|1 single|just 1|only 1|1|just a single|only a single|a mere|just a|the space of a single|the space of 1|the space of a|a) day",
            "in (just |only )?24 hours",
            "on (its |the )?(first|launch|opening|release) day( alone)?",
            "on day 1( alone)?"
          ],
          fautes: [
            {
              re: ["(an|a|1) (only|sole|unique|alone) day\\b", "in (an|a) day only\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "in an only day",
              juste: "in a single day",
              test: "The video game Grand Theft Auto VI, released on 19 November, generated about 3.79 billion dollars in sales in an only day, according to its publisher, Take-Two.",
              pourquoi: "« Un seul » ne se traduit pas par an only : only, devant un nom, veut dire « l'unique » (the only day). Pour « un seul, pas plus », l'anglais dit a single ou just one.",
              regle: "Un seul : <b>a single</b>, <b>just one</b> (in a single day). L'unique : <b>the only</b> (the only game).",
              ex: "The record was broken in a single weekend.",
              exfr: "Le record a été battu en un seul week-end.",
              carte: { fr: "en un seul jour", en: "in a single day, in just one day" }
            },
            {
              re: ["(during|for|since) (a single|1|1 single|just 1|only 1|a) day\\b"],
              type: "faux-sens",
              pts: 0.25,
              faux: "for a single day",
              juste: "in a single day",
              test: "The video game Grand Theft Auto VI, released on 19 November, generated about 3.79 billion dollars in sales for a single day, according to its publisher, Take-Two.",
              pourquoi: "« En un jour » dit le temps qu'il a fallu pour atteindre le chiffre : in. For ou during indiquent combien de temps une action dure (pendant un jour), ce qui fausse le sens.",
              regle: "Temps nécessaire pour un résultat : <b>in</b> + durée (in a day). Durée d'une action : <b>for</b> + durée (for a day).",
              ex: "The tickets sold out in ten minutes.",
              exfr: "Les billets se sont vendus en dix minutes.",
              carte: { fr: "en un jour (temps mis)", en: "in a day (for a day = pendant un jour)" }
            }
          ]
        },
        {
          fr: "selon son éditeur, Take-Two.",
          en: "according to its publisher, Take-Two",
          pourquoi: "« Selon » cite une source : according to. « Son éditeur » : celui du jeu, une chose, donc its. Un éditeur de jeux ou de livres, c'est a publisher ; an editor est un rédacteur en chef ou un correcteur.",
          pts: 1,
          ok: [
            "according to (its|the game's|the|its american) (publisher|games publisher|video game publisher|maker|owner|parent company),? (the american company |the us company )?take 2",
            "according to take 2,? (its|the game's|the) (publisher|games publisher|video game publisher|maker)",
            "(its|the game's) (publisher|maker),? take 2,? (said|says|announced|reported|claims|claimed)",
            "take 2,? (its|the game's) (publisher|maker),? (said|says|announced|reported|claims|claimed)"
          ],
          fautes: [
            {
              re: ["editors?\\b"],
              type: "faux-sens",
              pts: 0.5,
              faux: "according to its editor, Take-Two",
              juste: "according to its publisher, Take-Two",
              test: "The video game Grand Theft Auto VI, released on 19 November, generated about 3.79 billion dollars in sales in a single day, according to its editor, Take-Two.",
              pourquoi: "Faux ami. An editor est une personne qui relit, corrige ou dirige une rédaction (the editor of The Times). L'entreprise qui édite et vend un jeu ou un livre, c'est a publisher.",
              regle: "Un éditeur (maison d'édition) : <b>a publisher</b>. An editor : <b>un rédacteur, un correcteur</b>. Éditer : <b>to publish</b>.",
              ex: "Penguin is one of the biggest publishers in the world.",
              exfr: "Penguin est l'un des plus grands éditeurs du monde.",
              carte: { fr: "un éditeur (entreprise)", en: "a publisher (an editor = un rédacteur)" }
            },
            {
              re: ["(his|her) (publisher|editor|maker)", "according (with |at |of )?(its|his|her|the game's|the|take)\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "according to his publisher / according its publisher",
              juste: "according to its publisher",
              test: "The video game Grand Theft Auto VI, released on 19 November, generated about 3.79 billion dollars in sales in a single day, according to his publisher, Take-Two.",
              pourquoi: "« Son » renvoie au jeu, une chose : its, jamais his ou her. Et according se construit toujours avec to : la préposition fait partie de l'expression.",
              regle: "Possessif d'une chose : <b>its</b>. Selon : <b>according to</b> + source.",
              ex: "According to the studio, the game took seven years to make.",
              exfr: "Selon le studio, le jeu a demandé sept ans de travail.",
              lecon: { n: 3, ancre: "possessifs", titre: "Adjectifs et pronoms possessifs" },
              carte: { fr: "selon son éditeur (le jeu)", en: "according to its publisher" }
            }
          ]
        }
      ]
    },
    {
      fr: "C'est près de cinq fois plus que le premier jour de GTA V en 2013, et Take-Two ((parle du)) « plus gros lancement de [[divertissement]] de l'histoire ».",
      cartes: [{ id: "4c969c102c", fr: "parler de, évoquer", en: "to speak of", re: "speak(s|ing)? of|spoke(n)? of" }],
      aides: [{ fr: "le divertissement", en: "entertainment" }],
      proposition: "That is nearly five times as much as GTA V's first-day sales in 2013, and Take-Two speaks of \"the biggest entertainment launch in history\".",
      autres: [
        "This is almost five times more than GTA V's first day in 2013, and Take-Two speaks of \"the biggest launch in the history of entertainment\"."
      ],
      tests: [
        "That figure is close to five times GTA V's first-day revenue in 2013, and Take-Two describes it as \"the biggest entertainment launch in history\".",
        "It represents nearly five times what GTA V made on its first day in 2013, and Take-Two is talking about \"the largest entertainment launch ever\"."
      ],
      morceaux: [
        {
          fr: "C'est près de cinq fois plus que",
          en: "That is nearly five times as much as",
          pourquoi: "« Près de » devant un nombre : nearly, almost, close to (jamais near seul). « Cinq fois plus que » : five times as much as, ou five times more than, ou five times + nom.",
          pts: 1.5,
          ok: [
            "(that|this|it|this figure|that figure|the figure|this sum|this amount|that sum|that amount|this total) (is|represents|amounts to|equals|is worth) (nearly|almost|close to|about|roughly|around|just under|some) 5 times( more than| as much as| higher than| bigger than| larger than| greater than| the amount of| the sum of| the| what)?",
            "(nearly|almost|close to) 5 times (more than|as much as|higher than|bigger than|larger than|greater than|the amount of|what)"
          ],
          fautes: [
            {
              re: ["near 5 times\\b", "next to 5 times\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "That is near five times more",
              juste: "That is nearly five times more",
              test: "That is near five times as much as GTA V's first-day sales in 2013, and Take-Two speaks of \"the biggest entertainment launch in history\".",
              pourquoi: "Near est une préposition de lieu (près de la gare). Devant un nombre, pour dire « presque », l'anglais emploie l'adverbe nearly, ou almost, close to.",
              regle: "Près de + nombre : <b>nearly, almost, close to</b> (nearly five times). Près de + lieu : <b>near</b> (near the station).",
              ex: "Nearly 60 percent of players launched the game.",
              exfr: "Près de 60 % des joueurs ont lancé le jeu.",
              carte: { fr: "près de (+ nombre)", en: "nearly, almost, close to" }
            },
            {
              re: ["5 times (more of|plus|more that|as much that|so much as|more as)\\b"],
              type: "grammaire",
              pts: 0.75,
              faux: "five times more that / five times as much that",
              juste: "five times more than / five times as much as",
              test: "That is nearly five times more that GTA V's first-day sales in 2013, and Take-Two speaks of \"the biggest entertainment launch in history\".",
              pourquoi: "Le « que » de la comparaison n'est jamais that. Après un comparatif (more, higher) : than. Dans la comparaison d'égalité (as much) : as … as.",
              regle: "<b>N times more than</b> ou <b>N times as much as</b> (five times as much as GTA V).",
              ex: "The game made ten times more than the film.",
              exfr: "Le jeu a rapporté dix fois plus que le film.",
              lecon: { n: 22, ancre: "structures-avancees", titre: "Rapport chiffré : three times as … as" },
              carte: { fr: "cinq fois plus que", en: "five times more than, five times as much as" }
            }
          ]
        },
        {
          fr: "le premier jour de GTA V en 2013,",
          en: "GTA V's first-day sales in 2013",
          pourquoi: "« Le premier jour de GTA V » : le génitif, possesseur d'abord, GTA V's first day (ses ventes du premier jour : first-day sales). « En 2013 » : in + année.",
          pts: 1,
          ok: [
            "(gta|grand theft auto) (v's|5 s|5's) (first day|opening day|launch day|day 1)( sales| revenue| takings| earnings| total)?( in 2013| back in 2013)",
            "the (first day|opening day|launch day)( sales| revenue| takings| earnings)? (of|for) (gta|grand theft auto) (v|5)( in 2013| back in 2013)",
            "what (gta|grand theft auto) (v|5) (made|earned|generated|took|brought in|took in|sold|raked in) on its (first|opening|launch|release) day( in 2013| back in 2013)",
            "(gta|grand theft auto) (v's|5 s|5's) (2013 )?(launch|release|debut)( day)?( in 2013)?"
          ],
          fautes: [
            {
              re: ["the (gta|grand theft auto) (v's|5 s|5's)"],
              type: "grammaire",
              pts: 0.5,
              faux: "the GTA V's first day",
              juste: "GTA V's first day",
              test: "That is nearly five times as much as the GTA V's first-day sales in 2013, and Take-Two speaks of \"the biggest entertainment launch in history\".",
              pourquoi: "Le génitif remplace l'article du nom possédé : « le premier jour de GTA V » devient GTA V's first day, sans the. Un titre ou un nom propre en tête du génitif n'a pas d'article.",
              regle: "<b>Possesseur + 's + nom</b>, sans article devant le possesseur nom propre (Apple's model, GTA V's launch).",
              ex: "Rockstar's next game is already in development.",
              exfr: "Le prochain jeu de Rockstar est déjà en préparation.",
              lecon: { n: 5, ancre: "genitif-saxon", titre: "Le génitif saxon" },
              carte: { fr: "le premier jour de GTA V", en: "GTA V's first day (sans the)" }
            },
            {
              re: ["(on|at|during) 2013\\b", "in the 2013\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "GTA V's first day on 2013",
              juste: "GTA V's first day in 2013",
              test: "That is nearly five times as much as GTA V's first-day sales on 2013, and Take-Two speaks of \"the biggest entertainment launch in history\".",
              pourquoi: "Une année est une période : in 2013, sans article. On est réservé aux jours et aux dates (on 17 September 2013).",
              regle: "<b>In</b> + année, mois, saison (in 2013). <b>On</b> + jour, date.",
              ex: "GTA V came out in 2013.",
              exfr: "GTA V est sorti en 2013.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "en 2013", en: "in 2013 (in + année)" }
            }
          ]
        },
        {
          fr: "et Take-Two parle du « plus gros lancement de divertissement de l'histoire ».",
          en: "and Take-Two speaks of \"the biggest entertainment launch in history\"",
          pourquoi: "« Parler de » au sens d'évoquer : speak of, talk of, ou call it, describe it as. Superlatif d'un adjectif court : the biggest. « Le lancement de divertissement » : entertainment launch, le nom qui précise devant. « De l'histoire » : in history, sans article.",
          pts: 1.5,
          ok: [
            "(and )?(take 2|the publisher|its publisher) (speaks of|spoke of|is speaking of|talks of|talked of|talks about|is talking about|calls it|called it|is calling it|describes it as|described it as|hails it as|hailed it as|refers to it as|is referring to|claims|boasts of|mentions) (the |a )?(biggest|largest) (entertainment )?(launch|release|launching)( in entertainment)? (in history|ever|of all time|in the history of entertainment|in entertainment history)",
            "(and )?(take 2|the publisher|its publisher) (speaks of|spoke of|is speaking of|talks of|talked of|talks about|is talking about|calls it|called it|is calling it|describes it as|described it as|hails it as|hailed it as|refers to it as|claims|boasts of) (the |a )?(biggest|largest) (launch|release) (in the history of entertainment|in entertainment history|ever in entertainment)"
          ],
          fautes: [
            {
              re: ["(more|most) (big|large|great|gross)\\b", "more bigger\\b", "most biggest\\b"],
              type: "grammaire",
              pts: 0.75,
              faux: "the most big launch",
              juste: "the biggest launch",
              test: "That is nearly five times as much as GTA V's first-day sales in 2013, and Take-Two speaks of \"the most big entertainment launch in history\".",
              pourquoi: "Big est un adjectif court (une syllabe) : son superlatif se forme avec -est, et la consonne finale double (big, bigger, the biggest). Most ne s'emploie qu'avec les adjectifs longs (the most expensive).",
              regle: "Adjectif court : <b>the + adj-est</b> (the biggest, the largest). Adjectif long : <b>the most + adj</b>.",
              ex: "It was the biggest box-office weekend of the year.",
              exfr: "C'était le plus gros week-end de l'année au box-office.",
              lecon: { n: 22, ancre: "superlatif", titre: "Le superlatif" },
              carte: { fr: "le plus gros", en: "the biggest (big, bigger, the biggest)" }
            },
            {
              re: ["(in|of) the history(?! of)", "of history\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "the biggest launch of the history",
              juste: "the biggest launch in history",
              test: "That is nearly five times as much as GTA V's first-day sales in 2013, and Take-Two speaks of \"the biggest entertainment launch of the history\".",
              pourquoi: "History, pris dans son sens général (toute l'histoire humaine), s'emploie sans article, et le superlatif se complète par in : in history. On ne garde the que si un complément précise de quelle histoire on parle (the history of entertainment).",
              regle: "Superlatif + <b>in history</b>, <b>ever</b>, <b>of all time</b>. <b>The history of</b> + complément seulement.",
              ex: "It was the worst storm in history.",
              exfr: "Ce fut la pire tempête de l'histoire.",
              lecon: { n: 4, ancre: "zero-article", titre: "Le zéro article" },
              carte: { fr: "de l'histoire (superlatif)", en: "in history, ever" }
            },
            {
              re: ["launch(ing)? (of|for) (the )?(entertainment|divertissement|amusement|diversion)", "\\b(divertissement|diversion|amusement)\\b"],
              type: "gallicisme",
              pts: 0.25,
              faux: "the biggest launch of entertainment",
              juste: "the biggest entertainment launch",
              test: "That is nearly five times as much as GTA V's first-day sales in 2013, and Take-Two speaks of \"the biggest launch of entertainment in history\".",
              pourquoi: "« Lancement de divertissement » précise le type de lancement : en anglais, le nom qui précise passe devant, entertainment launch. Divertissement, au sens de l'industrie des films, jeux et musique, se dit entertainment (a diversion est une manœuvre pour détourner l'attention).",
              regle: "<b>Nom + nom</b> : entertainment launch, a music festival. Le divertissement (industrie) : <b>entertainment</b>.",
              ex: "The entertainment industry is booming.",
              exfr: "L'industrie du divertissement est en plein essor.",
              carte: { fr: "le divertissement (industrie)", en: "entertainment" }
            }
          ]
        }
      ]
    },
    {
      fr: "Ce montant correspond toutefois aux dépenses des joueurs, et non au [[chiffre d'affaires]] de Take-Two, car les boutiques en ligne des consoles prélèvent une [[commission]].",
      cartes: [],
      aides: [{ fr: "le chiffre d'affaires", en: "revenue, turnover" }, { fr: "une commission (prélevée)", en: "a cut, a commission" }],
      proposition: "However, this amount reflects what players spent, not Take-Two's revenue, because the consoles' online stores take a cut.",
      autres: [
        "This figure, however, corresponds to the spending of players, and not to Take-Two's revenue, as the online stores of the consoles take a commission."
      ],
      tests: [
        "But this sum measures players' spending rather than Take-Two's revenue, since the console makers' online stores keep a commission.",
        "However, the figure represents the amount spent by gamers, not the revenue of Take-Two, because online console stores charge a fee."
      ],
      morceaux: [
        {
          fr: "Ce montant correspond toutefois aux dépenses des joueurs,",
          en: "However, this amount reflects what players spent",
          pourquoi: "« Toutefois » : however, en tête suivi d'une virgule ou entre virgules. « Correspondre à » : correspond to, reflect, represent. « Les dépenses des joueurs » : players' spending (indénombrable) ou what players spent.",
          pts: 1.5,
          ok: [
            "(this|that|the) (amount|figure|sum|total|number)(,? however,?|,? though,?)? (corresponds to|reflects|represents|measures|refers to|is|describes|covers|counts|shows|equals|matches|is based on|captures) (however |though )?(the )?((amount of )?(spending|money spent|expenditure|outlay|purchases|sums spent|money paid|amount spent) (by|of) (the )?(players|gamers|buyers|consumers|customers|fans)|(players|gamers|buyers|consumers|customers|fans)(')? (spending|purchases|expenditure|outlay)|what (the )?(players|gamers|buyers|consumers|customers|fans) (spent|paid|have spent|paid out|spend))"
          ],
          fautes: [
            {
              re: ["spendings\\b", "\\b(dispenses|depenses|depences|dispendings)\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "players' spendings",
              juste: "players' spending",
              test: "However, this amount reflects players' spendings, not Take-Two's revenue, because the consoles' online stores take a cut.",
              pourquoi: "« Les dépenses » se dit spending, un nom indénombrable : il ne prend jamais de s et se construit avec un verbe au singulier (spending has risen). On peut aussi tourner par une proposition : what players spent.",
              regle: "Dépenses : <b>spending</b> (indénombrable, sans s), ou <b>expenditure</b> dans un texte économique.",
              ex: "Consumer spending rose sharply in November.",
              exfr: "Les dépenses des ménages ont fortement augmenté en novembre.",
              lecon: { n: 6, ancre: "much-many-little-few", titre: "Dénombrables et indénombrables" },
              carte: { fr: "les dépenses", en: "spending (indénombrable)" }
            },
            {
              re: ["correspond(s|ed)? (at|a|with the players|in)\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "this amount corresponds at players' spending",
              juste: "this amount corresponds to players' spending",
              test: "However, this amount corresponds at players' spending, not Take-Two's revenue, because the consoles' online stores take a cut.",
              pourquoi: "« Correspondre à » se construit avec to : correspond to. At marque un lieu ou un moment, jamais le rapport entre deux choses.",
              regle: "<b>Correspond to</b> + nom (the figure corresponds to sales). Ou <b>reflect, represent</b> + nom, sans préposition.",
              ex: "The figure corresponds to retail sales, not profit.",
              exfr: "Le chiffre correspond aux ventes au détail, pas au bénéfice.",
              carte: { fr: "correspondre à", en: "to correspond to, to reflect" }
            }
          ]
        },
        {
          fr: "et non au chiffre d'affaires de Take-Two,",
          en: "not Take-Two's revenue",
          pourquoi: "« Et non » : not, ou rather than. Le chiffre d'affaires d'une entreprise : its revenue (ou turnover en anglais britannique), au génitif : Take-Two's revenue.",
          pts: 1,
          ok: [
            "(and )?(not|rather than|and not|instead of|as opposed to)( to| of)? (take 2's|the publisher's|the) (revenue|revenues|turnover|sales revenue|income|takings|earnings|actual revenue)( of take 2| for take 2| earned by take 2| of the publisher)?"
          ],
          fautes: [
            {
              re: [
                "(figure|number|amount|digit|cipher|figures|numbers) of (affairs|business|business deals)\\b",
                "\\b(business|affairs) (figure|number|figures)\\b",
                "chiffre\\b"
              ],
              type: "gallicisme",
              pts: 0.75,
              faux: "Take-Two's figure of affairs",
              juste: "Take-Two's revenue",
              test: "However, this amount reflects what players spent, not Take-Two's figure of affairs, because the consoles' online stores take a cut.",
              pourquoi: "« Chiffre d'affaires » ne se traduit pas mot à mot : « figure of affairs » n'existe pas. L'argent que l'entreprise encaisse par ses ventes, c'est revenue (ou turnover au Royaume-Uni).",
              regle: "Chiffre d'affaires : <b>revenue</b>, <b>turnover</b> (GB). Bénéfice : <b>profit</b>.",
              ex: "The company's revenue rose by 15% last year.",
              exfr: "Le chiffre d'affaires de l'entreprise a augmenté de 15 % l'an dernier.",
              lecon: { n: 11, ancre: "contexte-economique", titre: "Les chiffres en contexte économique" },
              carte: { fr: "le chiffre d'affaires", en: "revenue, turnover" }
            },
            {
              re: ["\\b(and )?no (to )?(take 2's|the) (revenue|revenues|turnover|income)"],
              type: "grammaire",
              pts: 0.5,
              faux: "and no Take-Two's revenue",
              juste: "not Take-Two's revenue",
              test: "However, this amount reflects what players spent, and no Take-Two's revenue, because the consoles' online stores take a cut.",
              pourquoi: "« Et non » oppose deux éléments : l'adverbe not. No est un déterminant (no money, aucun argent) ou une réponse (non), il ne nie pas un groupe de mots.",
              regle: "X, <b>not</b> Y (spending, not revenue) ou X <b>rather than</b> Y. No + nom = aucun.",
              ex: "The figure measures sales, not profits.",
              exfr: "Le chiffre mesure les ventes, et non les bénéfices.",
              carte: { fr: "et non (pas)", en: "not, rather than" }
            }
          ]
        },
        {
          fr: "car les boutiques en ligne des consoles prélèvent une commission.",
          en: "because the consoles' online stores take a cut",
          pourquoi: "« Car » + proposition : because, since, as. Une boutique en ligne : an online store (shop). « Prélever une commission » : take a cut, take a commission, keep a share.",
          pts: 1.5,
          ok: [
            "(because|since|as|for|given that) (the )?((consoles'|console's|console|consoles|console makers'|console makers|platform|platforms') )?(online |digital )?(console |consoles' |games )?(stores|shops|storefronts|platforms|marketplaces)( of (the )?(consoles|console makers|platform holders|console manufacturers))? (take|keep|charge|deduct|collect|levy|retain|pocket|withhold|claim|skim off|take out|help themselves to)( a| their| a hefty| a large)? (cut|commission|share|percentage|fee|slice)"
          ],
          fautes: [
            {
              re: ["because of (the )?(consoles'?|console('s)?|online|stores|shops)", "car (the|console|consoles|online)\\b"],
              type: "grammaire",
              pts: 0.75,
              faux: "because of the consoles' online stores take a cut",
              juste: "because the consoles' online stores take a cut",
              test: "However, this amount reflects what players spent, not Take-Two's revenue, because of the consoles' online stores take a cut.",
              pourquoi: "« Car » introduit ici une proposition complète (les boutiques prélèvent) : because, since ou as. Because of ne se met que devant un nom seul (because of the fees). Et car, en anglais, veut dire voiture.",
              regle: "<b>Because / since / as</b> + sujet + verbe. <b>Because of</b> + groupe nominal.",
              ex: "Prices rose because demand was strong.",
              exfr: "Les prix ont augmenté car la demande était forte.",
              lecon: { n: 27, ancre: "cause", titre: "Because ou because of" },
              carte: { fr: "car (+ proposition)", en: "because, since, as (because of + nom)" }
            },
            {
              re: ["boutiques?\\b", "(touch|touches|perceive|perceives|prelevate|prelevates) (a |their )?(commission|cut|share)"],
              type: "faux-sens",
              pts: 0.5,
              faux: "the consoles' online boutiques touch a commission",
              juste: "the consoles' online stores take a cut",
              test: "However, this amount reflects what players spent, not Take-Two's revenue, because the consoles' online boutiques take a cut.",
              pourquoi: "Deux faux amis. A boutique, en anglais, est un petit magasin de mode chic : un magasin en ligne, c'est an online store (shop). Et « toucher » ou « percevoir » une commission se dit take ou get a commission (to touch = toucher avec la main).",
              regle: "Magasin : <b>a store, a shop</b> (a boutique = magasin chic). Prélever une commission : <b>to take a cut / a commission</b>.",
              ex: "App stores usually take a 30% cut.",
              exfr: "Les boutiques d'applications prélèvent en général une commission de 30 %.",
              carte: { fr: "prélever une commission", en: "to take a cut, to take a commission" }
            }
          ]
        }
      ]
    },
    {
      fr: "L'((action)) Take-Two a pourtant perdu 3,7 % le jour de la [[sortie]], avant de remonter le lendemain, une fois les chiffres annoncés.",
      cartes: [{ id: "9d9c070f01", fr: "une action (en Bourse)", en: "a share", re: "shares?|stock|share price|stock price" }],
      aides: [{ fr: "la sortie (d'un jeu, d'un film)", en: "the release" }],
      proposition: "Take-Two's shares nevertheless fell 3.7% on the day of the release, before rising again the next day, once the figures had been announced.",
      autres: [
        "Yet Take-Two's share price lost 3.7% on release day, before bouncing back the following day, once the figures were released."
      ],
      tests: [
        "However, Take-Two's stock dropped by 3.7 percent on the day the game came out, before recovering the next day, once the figures had been published.",
        "Take-Two shares nonetheless slipped 3.7% on launch day, and rebounded the day after, after the figures were announced."
      ],
      morceaux: [
        {
          fr: "L'action Take-Two a pourtant perdu 3,7 %",
          en: "Take-Two's shares nevertheless fell 3.7%",
          pourquoi: "En Bourse, une action se dit a share (ou stock, collectif). Le fait est daté (le jour de la sortie) : prétérit, fell, lost, dropped. « Pourtant » : nevertheless, yet, however.",
          pts: 1.5,
          ok: [
            "(take 2's |take 2 |the take 2 )?(shares?|stock|share price|stock price)( of take 2| in take 2)?(,? however,?|,? though,?| nevertheless| yet| still| nonetheless| even so)? (fell|dropped|lost|slipped|declined|slid|sank|went down|tumbled|shed|gave up|closed down|ended down|was down|were down|finished down|fell back|dipped|edged down)( by)? 3 7 percent"
          ],
          fautes: [
            {
              re: ["actions?\\b"],
              type: "faux-sens",
              pts: 0.75,
              faux: "Take-Two's action fell 3.7%",
              juste: "Take-Two's shares fell 3.7%",
              test: "Take-Two's action nevertheless fell 3.7% on the day of the release, before rising again the next day, once the figures had been announced.",
              pourquoi: "Faux ami. An action est un acte, une mesure (take action : agir). Le titre d'une entreprise en Bourse se dit a share, ou stock, et son cours share price.",
              regle: "Une action (Bourse) : <b>a share</b>, <b>stock</b> ; le cours : <b>the share price</b>. An action : un acte, une mesure.",
              ex: "Nvidia's shares rose by 4% on Friday.",
              exfr: "L'action Nvidia a gagné 4 % vendredi.",
              lecon: { n: 11, ancre: "contexte-economique", titre: "Les chiffres en contexte économique" },
              carte: { fr: "une action (en Bourse)", en: "a share, stock (an action = un acte)" }
            },
            {
              re: ["(has|have) (however |nevertheless |yet |still |though |nonetheless )?(lost|fallen|dropped|declined|slipped|slid|sunk|shed|gone down|tumbled)\\b"],
              type: "grammaire",
              pts: 0.75,
              faux: "Take-Two's shares have fallen 3.7% on the day of the release",
              juste: "Take-Two's shares fell 3.7% on the day of the release",
              test: "Take-Two's shares have nevertheless fallen 3.7% on the day of the release, before rising again the next day, once the figures had been announced.",
              pourquoi: "La baisse a eu lieu un jour précis et révolu, le jour de la sortie : c'est un fait daté, au prétérit. Le passé composé français ne se traduit par un present perfect que sans moment passé précis.",
              regle: "Moment passé précis (on release day, last Thursday, in 2013) : <b>prétérit</b> (fell). Present perfect : sans date.",
              ex: "The stock fell 8% last week.",
              exfr: "L'action a perdu 8 % la semaine dernière.",
              lecon: { n: 14, ancre: "comparaison", titre: "Present perfect ou prétérit" },
              carte: { fr: "a perdu (un jour précis)", en: "fell, lost (prétérit + date)" }
            },
            {
              re: ["(fell|dropped|declined|slipped|slid|sank|went down|tumbled|lost) to 3 7 percent"],
              type: "faux-sens",
              pts: 0.5,
              faux: "Take-Two's shares fell to 3.7%",
              juste: "Take-Two's shares fell 3.7% / fell by 3.7%",
              test: "Take-Two's shares nevertheless fell to 3.7% on the day of the release, before rising again the next day, once the figures had been announced.",
              pourquoi: "Avec un verbe de variation, to donne le niveau atteint (fell to 3.7% : est tombé à 3,7 %). L'ampleur de la baisse se dit avec by, ou sans préposition : fell 3.7%, fell by 3.7%.",
              regle: "Ampleur : <b>by</b> + chiffre (fell by 3.7%). Niveau atteint : <b>to</b> + chiffre. Point de départ : <b>from</b>.",
              ex: "Unemployment fell from 5.1% to 4.2%.",
              exfr: "Le chômage est passé de 5,1 % à 4,2 %.",
              lecon: { n: 11, ancre: "contexte-economique", titre: "Décrire une hausse ou une baisse" },
              carte: { fr: "perdre 3,7 %", en: "to fall (by) 3.7% (fall to = tomber à)" }
            }
          ]
        },
        {
          fr: "le jour de la sortie,",
          en: "on the day of the release",
          pourquoi: "Un jour précis prend on : on the day of the release, on release day. La sortie d'un jeu ou d'un film : its release (ou launch).",
          pts: 1,
          ok: [
            "on (the day of (the |its )?(game's )?(release|launch)|(the |its )?(release|launch)( day)?|the day (it was released|it came out|the game was released|the game came out|it was launched|the game was launched|of its release|of its launch|of release|of launch)|day 1|thursday|the very day (of (its |the )?(release|launch)|it was released|it came out))"
          ],
          fautes: [
            {
              re: [
                "(fell|dropped|declined|slipped|slid|sank|lost|shed|tumbled|by) 3 7 percent the (day|release|launch|very)",
                "(at|in) the (day of|release day|launch day|very day)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "fell 3.7% the day of the release",
              juste: "fell 3.7% on the day of the release",
              test: "Take-Two's shares nevertheless fell 3.7% the day of the release, before rising again the next day, once the figures had been announced.",
              pourquoi: "« Le jour de la sortie » est un jour précis : l'anglais met on devant, comme devant une date (on Thursday, on the day of the release). Sans préposition, ou avec in, at, le complément de temps est fautif.",
              regle: "<b>On</b> + jour (on the day of the release, on release day, on Thursday).",
              ex: "Fans queued on the day of the launch.",
              exfr: "Les fans ont fait la queue le jour du lancement.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le jour de la sortie", en: "on the day of the release, on release day" }
            },
            {
              re: ["\\b(exit|outing|sortie|output|outlet|going out|coming out)\\b"],
              type: "faux-sens",
              pts: 0.5,
              faux: "on the day of the exit",
              juste: "on the day of the release",
              test: "Take-Two's shares nevertheless fell 3.7% on the day of the exit, before rising again the next day, once the figures had been announced.",
              pourquoi: "« La sortie » d'un jeu, d'un film ou d'un album, c'est sa mise en vente : the release (ou the launch). An exit est la porte de sortie ou le départ (Brexit), an outing une excursion.",
              regle: "La sortie (d'une œuvre) : <b>the release</b>, <b>the launch</b>. La sortie (porte) : an exit.",
              ex: "The film's release was postponed to May.",
              exfr: "La sortie du film a été repoussée à mai.",
              carte: { fr: "la sortie (d'un jeu, d'un film)", en: "the release (an exit = une porte de sortie)" }
            }
          ]
        },
        {
          fr: "avant de remonter le lendemain,",
          en: "before rising again the next day",
          pourquoi: "« Avant de » + infinitif : before + V-ing (before rising). Remonter, pour un cours : rise again, rebound, bounce back. « Le lendemain » : the next day, the following day.",
          pts: 1,
          ok: [
            "before (rising|bouncing|rebounding|climbing|recovering|picking up|going up|regaining ground|edging up|moving up|rallying|gaining)( again| back| ground)? (the next day|the following day|the day after|on the next day|on the following day|on friday)",
            "and (then )?(rose|rebounded|recovered|bounced back|climbed|went up|picked up|rallied|edged up)( again| back)? (the next day|the following day|the day after|on the next day|on the following day|on friday)"
          ],
          fautes: [
            {
              re: ["before (to )?(rise|rebound|climb|go up|bounce|recover|remount|pick up|rally)\\b", "before of (rising|rebounding|climbing)", "remount(ing|ed|s)?\\b"],
              type: "grammaire",
              pts: 0.75,
              faux: "before to rise again",
              juste: "before rising again",
              test: "Take-Two's shares nevertheless fell 3.7% on the day of the release, before to rise again the next day, once the figures had been announced.",
              pourquoi: "Before est ici une préposition : après une préposition, le verbe prend la forme en -ing (before rising, after falling). « Avant de » se calque à tort en before to, et remonter ne se traduit pas par remount (remonter à cheval).",
              regle: "<b>Before / after / without + V-ing</b> (before rising). Remonter (cours) : <b>to rise again, to rebound</b>.",
              ex: "The shares dipped before recovering in the afternoon.",
              exfr: "L'action a baissé avant de remonter dans l'après-midi.",
              lecon: { n: 23, ancre: "prepositions", titre: "Préposition + V-ing" },
              carte: { fr: "avant de remonter", en: "before rising again (before + V-ing)" }
            },
            {
              re: ["the (tomorrow|morrow|lendemain)\\b", "the day following\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "before rising again the tomorrow",
              juste: "before rising again the next day",
              test: "Take-Two's shares nevertheless fell 3.7% on the day of the release, before rising again the tomorrow, once the figures had been announced.",
              pourquoi: "Tomorrow veut dire « demain » par rapport au moment où l'on parle ; il ne prend jamais d'article. « Le lendemain » d'un jour passé se dit the next day, the following day ou the day after.",
              regle: "Le lendemain (récit au passé) : <b>the next day, the following day, the day after</b>. Demain : tomorrow.",
              ex: "The results were published the next day.",
              exfr: "Les résultats ont été publiés le lendemain.",
              carte: { fr: "le lendemain", en: "the next day, the following day" }
            }
          ]
        },
        {
          fr: "une fois les chiffres annoncés.",
          en: "once the figures had been announced",
          pourquoi: "« Une fois les chiffres annoncés » : once + sujet + verbe conjugué, au passif (the figures had been announced, ou were announced). L'anglais ne garde pas le participe seul.",
          pts: 0.5,
          ok: [
            "(once|after|when) (the |its )?(figures|numbers|sales figures|results|sales|data|sales data)( were| had been| was| have been)? (announced|released|published|revealed|made public|out|unveiled|disclosed)",
            "(once|after|when) (take 2 )?(had )?(announced|released|published|revealed|unveiled|disclosed) (the|its) (figures|numbers|sales figures|results|sales data)",
            "after the (announcement|release|publication) of the (figures|numbers|sales figures|results)"
          ],
          fautes: [
            {
              re: ["1 time (the|that)\\b", "a time the (figures|numbers|results)\\b"],
              type: "gallicisme",
              pts: 0.25,
              faux: "one time the figures announced",
              juste: "once the figures had been announced",
              test: "Take-Two's shares nevertheless fell 3.7% on the day of the release, before rising again the next day, one time the figures had been announced.",
              pourquoi: "« Une fois que » se dit once, en un seul mot. « One time » compte les occurrences (une fois, pas deux) et ne relie pas deux propositions.",
              regle: "Une fois que : <b>once</b> + sujet + verbe (once the figures were out).",
              ex: "Once the deal was signed, the shares rose.",
              exfr: "Une fois l'accord signé, l'action a monté.",
              carte: { fr: "une fois (que)", en: "once (+ sujet + verbe)" }
            },
            {
              re: ["(once|when|after) the (figures|numbers|results|sales figures) (announced|released|published|revealed)\\b"],
              type: "grammaire",
              pts: 0.25,
              faux: "once the figures announced",
              juste: "once the figures had been announced",
              test: "Take-Two's shares nevertheless fell 3.7% on the day of the release, before rising again the next day, once the figures announced.",
              pourquoi: "Le français peut sous-entendre l'auxiliaire (une fois les chiffres annoncés). En anglais, « the figures announced » voudrait dire que les chiffres ont annoncé quelque chose : il faut le passif complet, were (ou had been) announced.",
              regle: "Passif : <b>be</b> conjugué + participe passé (the figures were announced, had been announced).",
              ex: "Once the results were published, investors were relieved.",
              exfr: "Une fois les résultats publiés, les investisseurs ont été rassurés.",
              lecon: { n: 25, ancre: "formation", titre: "La formation du passif" },
              carte: { fr: "une fois les chiffres annoncés", en: "once the figures were announced (passif complet)" }
            }
          ]
        }
      ]
    },
    {
      fr: "((Reste à savoir si)) les ventes ((continueront de grimper)) [[dans les mois à venir]], car 32,5 millions d'[[exemplaires]] avaient déjà été vendus avant la sortie.",
      cartes: [
        { id: "572ba4a331", fr: "reste à savoir si", en: "it remains to be seen whether", re: "remains to be seen" },
        { id: "2816a36cc2", fr: "ne cesser d'augmenter", en: "to keep rising", re: "keep (on )?(rising|climbing|growing|increasing|going up)" }
      ],
      aides: [{ fr: "dans les mois à venir", en: "in the coming months" }, { fr: "un exemplaire (d'un jeu, d'un livre)", en: "a copy" }],
      proposition: "It remains to be seen whether sales will keep rising in the coming months, as 32.5 million copies had already been sold before the release.",
      autres: [
        "It remains to be seen if sales will continue to climb over the next few months, since 32.5 million copies had already been sold before the launch."
      ],
      tests: [
        "Whether sales will keep growing in the months ahead remains to be seen, because 32.5 million copies had already been sold ahead of the release.",
        "It remains to be seen whether sales will go on rising in the coming months, as 32.5 million units were already sold before the game came out."
      ],
      morceaux: [
        {
          fr: "Reste à savoir si",
          en: "It remains to be seen whether",
          pourquoi: "« Reste à savoir si » : it remains to be seen whether (ou if), avec le passif to be seen. On peut aussi dire it is unclear whether.",
          pts: 1,
          ok: [
            "it (still )?remains to be seen (whether|if)",
            "^whether .* remains to be seen",
            "it is (still )?(unclear|uncertain|not yet clear|not clear|an open question) (whether|if)",
            "the (big )?question (now )?is (whether|if)",
            "it is (yet|still) to be seen (whether|if)"
          ],
          fautes: [
            {
              re: ["\\b(rests?|remains?|stays?) to (know|knowing)\\b", "it rests\\b"],
              type: "gallicisme",
              pts: 1,
              faux: "It rests to know if",
              juste: "It remains to be seen whether",
              test: "It rests to know whether sales will keep rising in the coming months, as 32.5 million copies had already been sold before the release.",
              pourquoi: "« Reste à savoir » ne se calque pas : « it rests to know » n'a pas de sens (to rest = se reposer). L'anglais emploie une tournure figée au passif : it remains to be seen whether.",
              regle: "Reste à savoir si : <b>it remains to be seen whether / if</b>. On ne sait pas si : <b>it is unclear whether</b>.",
              ex: "It remains to be seen whether the studio will deliver on time.",
              exfr: "Reste à savoir si le studio tiendra les délais.",
              carte: { fr: "reste à savoir si", en: "it remains to be seen whether" }
            },
            {
              re: ["remains? to see\\b", "remains? to be see\\b", "remains? to be saw\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "It remains to see whether",
              juste: "It remains to be seen whether",
              test: "It remains to see whether sales will keep rising in the coming months, as 32.5 million copies had already been sold before the release.",
              pourquoi: "L'expression est au passif : ce qui reste, c'est d'être vu (to be seen), avec le participe passé de see. « It remains to see » est incomplet et fautif.",
              regle: "<b>It remains to be seen</b> + whether / if / how (passif : be + participe passé).",
              ex: "It remains to be seen how investors will react.",
              exfr: "Reste à savoir comment réagiront les investisseurs.",
              lecon: { n: 25, ancre: "formation", titre: "La formation du passif" },
              carte: { fr: "reste à savoir si (passif)", en: "it remains to be seen whether" }
            }
          ]
        },
        {
          fr: "les ventes continueront de grimper",
          en: "sales will keep rising",
          pourquoi: "« Continuer de » : keep + V-ing (keep rising) ou continue to + base verbale (continue to rise). Les ventes en général : sales, sans article, au pluriel.",
          pts: 1.5,
          ok: [
            "(the )?(sales|game's sales|sales of the game|sales figures) (will|are going to|can|could|would|might)? ?(keep|continue|go on|carry on)( on)? (rising|to rise|climbing|to climb|growing|to grow|increasing|to increase|going up|to go up|soaring|to soar)"
          ],
          fautes: [
            {
              re: ["(keep|keeps|kept)( on)? to (rise|climb|grow|increase|go up)\\b", "(continue|continues|keep|keeps) (of|de) ", "keep (rise|climb|grow|increase)\\b"],
              type: "grammaire",
              pts: 0.75,
              faux: "sales will keep to rise",
              juste: "sales will keep rising",
              test: "It remains to be seen whether sales will keep to rise in the coming months, as 32.5 million copies had already been sold before the release.",
              pourquoi: "Keep (au sens de continuer) se construit toujours avec la forme en -ing : keep rising. Continue accepte les deux : continue to rise ou continue rising. Le de de « continuer de » ne se traduit pas.",
              regle: "<b>Keep + V-ing</b> (keep rising). <b>Continue to + base verbale</b> ou <b>continue + V-ing</b>.",
              ex: "Prices kept rising throughout the year.",
              exfr: "Les prix n'ont cessé d'augmenter toute l'année.",
              lecon: { n: 23, ancre: "verbes-gerondif", titre: "Les verbes suivis du gérondif" },
              carte: { fr: "continuer de grimper", en: "to keep rising, to continue to rise" }
            },
            {
              re: ["\\b(the )?sale (will|would|keeps|continues|can|is going)\\b", "sales (keeps|continues|is going)\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "the sale will keep rising",
              juste: "sales will keep rising",
              test: "It remains to be seen whether the sale will keep rising in the coming months, as 32.5 million copies had already been sold before the release.",
              pourquoi: "« Les ventes » d'un produit se disent sales, au pluriel, et le verbe s'accorde au pluriel (sales keep rising). A sale au singulier désigne une vente isolée, ou des soldes (on sale).",
              regle: "Les ventes : <b>sales</b> (pluriel, verbe au pluriel). A sale : une vente, des soldes.",
              ex: "Sales of the console have doubled.",
              exfr: "Les ventes de la console ont doublé.",
              carte: { fr: "les ventes", en: "sales (pluriel)" }
            }
          ]
        },
        {
          fr: "dans les mois à venir,",
          en: "in the coming months",
          pourquoi: "« Dans les mois à venir » : in the coming months, in the months ahead, over the next few months. Coming se place devant le nom, comme un adjectif.",
          pts: 0.5,
          ok: [
            "(in|over|during|throughout) the (coming|next|following|upcoming) (few )?months",
            "in the months (to come|ahead|that follow)",
            "over the months ahead",
            "in (the )?coming months"
          ],
          fautes: [
            {
              re: ["months (at|to) (venir|arrive|coming|come in)\\b", "months a venir", "the to come months\\b", "months who (come|are coming)\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "in the months to arrive",
              juste: "in the coming months",
              test: "It remains to be seen whether sales will keep rising in the months to arrive, as 32.5 million copies had already been sold before the release.",
              pourquoi: "« À venir » ne se calque pas avec arrive : l'anglais dit the coming months (coming placé devant, comme un adjectif), the months ahead, ou the months to come.",
              regle: "Dans les mois à venir : <b>in the coming months</b>, <b>in the months ahead</b>, <b>in the months to come</b>.",
              ex: "Prices are expected to fall in the coming months.",
              exfr: "Les prix devraient baisser dans les mois à venir.",
              carte: { fr: "dans les mois à venir", en: "in the coming months" }
            },
            {
              re: ["\\b(in|into) the (next|following) month\\b(?! s)"],
              type: "faux-sens",
              pts: 0.25,
              faux: "in the next month",
              juste: "in the coming months",
              test: "It remains to be seen whether sales will keep rising in the next month, as 32.5 million copies had already been sold before the release.",
              pourquoi: "« Les mois à venir » sont plusieurs : months, au pluriel. In the next month voudrait dire « d'ici un mois », un délai bien plus court.",
              regle: "Les mois à venir : <b>the coming months</b> (pluriel). In the next month : d'ici un mois.",
              ex: "Several new games are due out in the coming months.",
              exfr: "Plusieurs nouveaux jeux doivent sortir dans les mois à venir.",
              carte: { fr: "les mois à venir", en: "the coming months (pluriel)" }
            }
          ]
        },
        {
          fr: "car 32,5 millions d'exemplaires avaient déjà été vendus avant la sortie.",
          en: "as 32.5 million copies had already been sold before the release",
          pourquoi: "« Car » : as, since, because. Un exemplaire d'un jeu ou d'un livre : a copy. Million reste invariable après un nombre. La vente est antérieure à un autre moment passé : past perfect passif, had already been sold.",
          pts: 1,
          ok: [
            "(as|since|because|for|given that|seeing that|with)( some| about| more than| over)? 32 5 (million|m|mn) (copies|units)( of the game| of gta (vi|6))? (had |have |were |was |had already |have already |were already )?(already )?(been )?(sold|bought|purchased|pre ordered|preordered|snapped up)( already)? (before|ahead of|prior to) (the |its )?(release|launch|game's release|launch day|release day|game came out|it came out|it was released|it was launched|the game was released|the game was launched|game was released)"
          ],
          fautes: [
            {
              re: ["32 5 millions\\b", "millions of (copies|units|exemplaries|examples)"],
              type: "grammaire",
              pts: 0.5,
              faux: "32.5 millions copies",
              juste: "32.5 million copies",
              test: "It remains to be seen whether sales will keep rising in the coming months, as 32.5 millions copies had already been sold before the release.",
              pourquoi: "Après un nombre, million reste invariable et se place directement devant le nom, sans of : 32.5 million copies. Millions of ne s'emploie que seul, au sens vague (des millions d'exemplaires).",
              regle: "<b>Nombre + million + nom</b> (32.5 million copies). <b>Millions of</b> + nom au sens vague.",
              ex: "The console sold 4 million units in a week.",
              exfr: "La console s'est vendue à 4 millions d'exemplaires en une semaine.",
              lecon: { n: 11, ancre: "grands-nombres", titre: "Hundred, thousand, million : avec ou sans -s" },
              carte: { fr: "32,5 millions d'exemplaires", en: "32.5 million copies (million invariable)" }
            },
            {
              re: ["\\b(examples|exemplaries|exemplars|exemplaires|exemplary|specimens)\\b"],
              type: "faux-sens",
              pts: 0.5,
              faux: "32.5 million examples",
              juste: "32.5 million copies",
              test: "It remains to be seen whether sales will keep rising in the coming months, as 32.5 million examples had already been sold before the release.",
              pourquoi: "Faux ami. An example est un exemple (à suivre ou à citer). Un exemplaire d'un jeu, d'un livre ou d'un journal se dit a copy ; pour un produit compté par l'industrie, a unit.",
              regle: "Un exemplaire : <b>a copy</b> (a unit pour un produit). An example : un exemple.",
              ex: "The novel has sold ten million copies.",
              exfr: "Le roman s'est vendu à dix millions d'exemplaires.",
              carte: { fr: "un exemplaire", en: "a copy (an example = un exemple)" }
            }
          ]
        }
      ]
    }
  ]
};
