/* Thème du jour d'anglais, 24 novembre 2026 (voir CLAUDE.md, « Thème du jour »).
   ((…)) = mot d'une carte du paquet d'anglais (cartes, dans l'ordre) ; [[…]] = mot nouveau (aides, dans l'ordre).
   Motifs `ok` et `re` : expressions régulières en minuscules, sans accents, nombres en chiffres, orthographe
   américaine, jamais de tiret (flashcards/theme-correcteur.js). Faits : Organisation panaméricaine de la santé (OPS),
   annonce du 17 novembre 2026 par son directeur Jarbas Barbosa (statut d'élimination de la rougeole retiré aux
   États-Unis, à la Bolivie et au Mexique ; statut détenu depuis 2000 ; pour le retrouver, douze mois au moins sans
   transmission endémique), rapportée par Contagion Live (« It's Official: US Loses Measles Elimination Status »,
   17 novembre 2026) et ABC News (18 novembre 2026) ; CDC au 12 novembre 2026, d'après Contagion Live : 5 412 cas
   confirmés contre 2 289 en 2025, 96 % chez des personnes non vaccinées ou au statut vaccinal inconnu, couverture
   ROR en maternelle de 92,4 % en 2025-2026 contre 95,2 % en 2019-2020, environ 280 000 enfants exposés, Erica
   Schwartz (CDC) : agence « committed to regaining elimination status » ; plus haut total annuel depuis 1991 :
   actualites/en/articles/us-rougeole-cdc-5182-cas-2026.html. */
window.ECG_THEMES_DONNEES = window.ECG_THEMES_DONNEES || {};
window.ECG_THEMES_DONNEES["anglais/2026-11-24"] = {
  langue: "anglais",
  date: "2026-11-24",
  titre: "États-Unis : la rougeole est de retour, vingt-six ans après avoir été éliminée",
  phrases: [
    {
      fr: "Le 17 novembre, l'[[Organisation panaméricaine de la santé]] a annoncé que les États-Unis avaient perdu leur statut de pays ayant éliminé la [[rougeole]], qu'ils détenaient depuis 2000.",
      cartes: [],
      aides: [
        { fr: "l'Organisation panaméricaine de la santé (OPS)", en: "the Pan American Health Organization (PAHO)" },
        { fr: "la rougeole", en: "measles (sans article)" }
      ],
      proposition: "On 17 November, the Pan American Health Organization announced that the United States had lost its measles elimination status, which it had held since 2000.",
      autres: ["On 17 November, PAHO announced that the US had lost its status as a country that has eliminated measles, a status it had held since 2000."],
      tests: [
        "The Pan American Health Organization announced on 17 November that America had been stripped of its measles-free status, which it had enjoyed since 2000.",
        "On November 17, PAHO said that the United States had officially lost its measles elimination status, which had been granted in 2000."
      ],
      morceaux: [
        {
          fr: "Le 17 novembre,",
          en: "On 17 November",
          pts: 0.5,
          ok: ["on (tuesday )?(november 17(th)?|17(th)? (of )?november|the 17(th)? of november)"],
          fautes: [
            {
              re: ["^the (17(th)? (of )?november|november 17(th)?)", "^(17(th)? (of )?november|november 17(th)?)"],
              type: "grammaire",
              pts: 0.25,
              faux: "The 17 November, …",
              juste: "On 17 November, …",
              test: "The 17 November, the Pan American Health Organization announced that the United States had lost its measles elimination status, which it had held since 2000.",
              pourquoi: "Le français dit « le 17 novembre » sans préposition. En anglais, une date est toujours introduite par on : sans elle, la date reste en l'air en tête de phrase.",
              regle: "<b>On</b> + jour ou date (on 17 November, on Tuesday). <b>In</b> + mois, année (in November, in 2000).",
              ex: "The decision was announced on 17 November.",
              exfr: "La décision a été annoncée le 17 novembre.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le 17 novembre", en: "on 17 November (on + date)" }
            },
            {
              re: ["(in|at) (17(th)? (of )?november|november 17(th)?|the 17(th)? of november)"],
              type: "grammaire",
              pts: 0.25,
              faux: "in 17 November",
              juste: "on 17 November",
              test: "In 17 November, the Pan American Health Organization announced that the United States had lost its measles elimination status, which it had held since 2000.",
              pourquoi: "In s'emploie pour un mois entier (in November) et at pour une heure. Dès que le jour est précisé, c'est un point du calendrier : on.",
              regle: "<b>On</b> + date (on 17 November). <b>In</b> + mois, année, saison. <b>At</b> + heure.",
              ex: "The vaccine was introduced in 1963, on 21 March.",
              exfr: "Le vaccin a été introduit en 1963, le 21 mars.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le 17 novembre", en: "on 17 November (on + date)" }
            }
          ]
        },
        {
          fr: "l'Organisation panaméricaine de la santé a annoncé",
          en: "the Pan American Health Organization announced",
          pts: 1,
          ok: [
            "(the )?(pan ?american health organization( paho)?|paho) (officially )?(announced|said|declared|stated|confirmed|revealed|reported|ruled|concluded)( officially)?( on (november 17(th)?|17(th)? (of )?november))?( that)?"
          ],
          fautes: [
            {
              re: [
                "(the )?(pan ?american health organization( paho)?|paho) (has|have) (officially )?(announced|declared|said|confirmed|stated|revealed|ruled)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "PAHO has announced",
              juste: "PAHO announced",
              test: "On 17 November, the Pan American Health Organization has announced that the United States had lost its measles elimination status, which it had held since 2000.",
              pourquoi: "L'annonce a eu lieu à une date précise, donnée en tête de phrase : c'est un fait passé et daté. Le passé composé français se traduit alors par un prétérit ; le present perfect avec une date révolue est une faute lourde pour un correcteur.",
              regle: "Moment passé précis (on 17 November, last week, in 2000) : <b>prétérit</b> (announced). Present perfect sans date (PAHO has warned several times).",
              ex: "On Monday, the minister announced a new plan.",
              exfr: "Lundi, le ministre a annoncé un nouveau plan.",
              lecon: { n: 14, ancre: "comparaison", titre: "Present perfect ou prétérit" },
              carte: { fr: "a annoncé (le 17 novembre)", en: "announced (prétérit + date)" }
            },
            {
              re: [
                "(organization|organisation) (pan ?american|panamerican|american) of (the )?health",
                "pan ?american organization (of|for) (the )?health",
                "organization of (the )?health pan ?american"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "the Panamerican Organization of Health",
              juste: "the Pan American Health Organization",
              test: "On 17 November, the Panamerican Organization of Health announced that the United States had lost its measles elimination status, which it had held since 2000.",
              pourquoi: "Le nom officiel d'un organisme ne se traduit pas mot à mot. En anglais, le domaine se place devant le nom, sans of : Health Organization, comme World Health Organization (l'OMS). Au besoin, on peut aussi garder le sigle : PAHO.",
              regle: "Noms d'organismes : <b>nom + nom</b>, le domaine devant (the World Health Organization, the Pan American Health Organization). Jamais Organization of Health.",
              ex: "The World Health Organization has issued a warning.",
              exfr: "L'Organisation mondiale de la santé a lancé une mise en garde.",
              carte: { fr: "l'Organisation panaméricaine de la santé", en: "the Pan American Health Organization (PAHO)" }
            }
          ]
        },
        {
          fr: "que les États-Unis avaient perdu leur statut de pays ayant éliminé la rougeole",
          en: "that the United States had lost its measles elimination status",
          pts: 1.5,
          ok: [
            "(that )?(the )?(united states( of america)?|us|usa|u s|america|country) ((had|has) )?(officially )?lost (its|their|the) ((official )?measles elimination status|status as (a )?(country|nation) (that had eliminated|that has eliminated|having eliminated|which had eliminated|which has eliminated|free of|free from) measles|status of (a )?(country|nation) (that had eliminated|that has eliminated|having eliminated|which had eliminated|which has eliminated|free of|free from) measles|measles free status|elimination status for measles|status as (a )?measles free (country|nation)|status of having eliminated measles|status as having eliminated measles|(official )?status as a measles free (country|nation))",
            "(that )?(the )?(united states( of america)?|us|usa|u s|america|country) (had|has) (officially )?been stripped of (its|their) ((official )?measles elimination status|status as (a )?(country|nation) (that had eliminated|that has eliminated|having eliminated|which had eliminated|which has eliminated|free of|free from) measles|status of (a )?(country|nation) (that had eliminated|that has eliminated|having eliminated|which had eliminated|which has eliminated|free of|free from) measles|measles free status|elimination status for measles|status as (a )?measles free (country|nation)|status of having eliminated measles|status as having eliminated measles|(official )?status as a measles free (country|nation))",
            "(that )?(the )?(united states( of america)?|us|usa|u s|america|country) (was|were|is|are) no longer (considered|regarded|recognized|classed|classified|certified|deemed) (as )?(to have eliminated measles|a country that has eliminated measles|having eliminated measles|measles free|a measles free (country|nation))"
          ],
          fautes: [
            {
              re: ["lost (his|her)"],
              type: "grammaire",
              pts: 0.5,
              faux: "lost his status",
              juste: "lost its status",
              test: "On 17 November, the Pan American Health Organization announced that the United States had lost his measles elimination status, which it had held since 2000.",
              pourquoi: "« Leur » renvoie aux États-Unis, un pays : en anglais, c'est une chose, donc its (the United States est singulier malgré son s). His renvoie à un homme.",
              regle: "Possessif = <b>possesseur</b> : his (un homme), her (une femme), <b>its</b> (une chose, un pays), their (plusieurs).",
              ex: "The country has lost its triple-A rating.",
              exfr: "Le pays a perdu son triple A.",
              lecon: { n: 3, ancre: "possessifs", titre: "Adjectifs et pronoms possessifs" },
              carte: { fr: "leur statut (les États-Unis)", en: "its status" }
            },
            {
              re: ["rubella"],
              type: "faux-sens",
              pts: 1,
              faux: "rubella",
              juste: "measles",
              test: "On 17 November, the Pan American Health Organization announced that the United States had lost its rubella elimination status, which it had held since 2000.",
              pourquoi: "Faux ami : rubella, c'est la rubéole, une autre maladie (que le même vaccin ROR combat d'ailleurs). La rougeole se dit measles, un mot qui finit par s mais qui est singulier : measles is.",
              regle: "La rougeole : <b>measles</b> (singulier, sans article). La rubéole : rubella. Les oreillons : mumps.",
              ex: "Measles is highly contagious.",
              exfr: "La rougeole est très contagieuse.",
              carte: { fr: "la rougeole", en: "measles (rubella = la rubéole)" }
            },
            {
              re: ["(eliminated|eliminating|elimination of|free of|free from|status for) the measles"],
              type: "grammaire",
              pts: 0.25,
              faux: "eliminated the measles",
              juste: "eliminated measles",
              test: "On 17 November, the Pan American Health Organization announced that the United States had lost its status as a country that had eliminated the measles, which it had held since 2000.",
              pourquoi: "Une maladie prise au sens général ne prend pas d'article en anglais, comme tous les noms indénombrables pris au sens général : on a éliminé measles, et non the measles.",
              regle: "Nom indénombrable au sens général : <b>pas d'article</b> (measles, cancer, inflation, energy).",
              ex: "Malaria still kills thousands of children.",
              exfr: "Le paludisme tue encore des milliers d'enfants.",
              lecon: { n: 4, ancre: "zero-article", titre: "Le zéro article" },
              carte: { fr: "éliminer la rougeole", en: "to eliminate measles (sans article)" }
            }
          ]
        },
        {
          fr: "qu'ils détenaient depuis 2000",
          en: "which it had held since 2000",
          pts: 1,
          ok: [
            "(which|that|a status|one) (it|they) (had|has|have) (held|had|enjoyed|kept|maintained|retained|possessed) since 2000",
            "(held|enjoyed|kept|maintained|retained) since 2000",
            "(which|that|a status|one) (had|has) been (held|granted|awarded|achieved|declared|conferred|in place) since 2000",
            "(which|that|a status|one) (it|they) (had )?(obtained|achieved|gained|won|earned|acquired|been granted|been awarded) (back )?in 2000",
            "(which|that|a status|one) (had been|was) (granted|awarded|achieved|declared|conferred|obtained) (back )?in 2000",
            "(granted|awarded|achieved|declared|obtained|won|gained) (back )?in 2000"
          ],
          fautes: [
            {
              re: [
                "(which|that|a status|one) (it|they) (held|holds|hold|kept|keeps|enjoyed|enjoys|maintained|retained|possesses|possessed|has|have) since 2000"
              ],
              type: "grammaire",
              pts: 1,
              faux: "which it held since 2000",
              juste: "which it had held since 2000",
              test: "On 17 November, the Pan American Health Organization announced that the United States had lost its measles elimination status, which it held since 2000.",
              pourquoi: "Since marque un point de départ et relie ce point à un autre moment : il exige un temps « parfait ». Ici, on raconte au passé (l'OPS a annoncé que…) : la situation dure de 2000 jusqu'au moment de l'annonce, d'où le past perfect, had held. Le prétérit seul (held) ne se combine jamais avec since.",
              regle: "<b>Since</b> + present perfect (it has held the status since 2000) ou, dans un récit au passé, <b>past perfect</b> (it had held the status since 2000). Jamais de prétérit ni de présent avec since.",
              ex: "She said she had lived in Boston since 2010.",
              exfr: "Elle a dit qu'elle vivait à Boston depuis 2010.",
              lecon: { n: 15, ancre: "temps-verbaux", titre: "Since, for : quels temps employer" },
              carte: { fr: "qu'ils détenaient depuis 2000", en: "which it had held since 2000" }
            },
            {
              re: ["(detain|detains|detained|detaining)"],
              type: "faux-sens",
              pts: 0.5,
              faux: "which it had detained",
              juste: "which it had held",
              test: "On 17 November, the Pan American Health Organization announced that the United States had lost its measles elimination status, which it had detained since 2000.",
              pourquoi: "Faux ami : to detain, c'est placer en détention, retenir quelqu'un contre son gré (the police detained two suspects). Détenir un titre, un record ou un statut se dit to hold.",
              regle: "Détenir (un titre, un record, un statut, des actions) : <b>to hold</b> (held, held). To detain : placer en détention.",
              ex: "She holds the world record.",
              exfr: "Elle détient le record du monde.",
              carte: { fr: "détenir (un statut, un record)", en: "to hold (detain = placer en détention)" }
            }
          ]
        }
      ]
    },
    {
      fr: "((Jusqu'ici)), plus de 5 400 cas ont été recensés en 2026, soit plus du double des 2 289 cas de 2025 et le total annuel le plus élevé depuis 1991.",
      cartes: [{ id: "496b1a892a", fr: "jusqu'ici, pour l'instant", en: "so far", re: "so far|thus far" }],
      aides: [],
      proposition: "So far, more than 5,400 cases have been recorded in 2026, more than double the 2,289 cases of 2025 and the highest annual total since 1991.",
      autres: [
        "So far, over 5,400 cases have been reported in 2026, more than twice as many as the 2,289 recorded in 2025, and the highest yearly figure since 1991."
      ],
      tests: [
        "More than 5,400 cases have been confirmed so far this year, more than double last year's 2,289 cases, making it the highest annual total since 1991.",
        "So far, the authorities have recorded more than 5,400 cases in 2026, over twice the 2,289 cases of 2025, the largest annual number since 1991."
      ],
      morceaux: [
        {
          fr: "Jusqu'ici,",
          en: "So far",
          pts: 0.5,
          ok: ["(so far|thus far|until now|up to now|up until now|to date|as things stand|as of now)"],
          fautes: [
            {
              re: ["(until|up to|till|up till) (here|there)\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "Until here, …",
              juste: "So far, …",
              test: "Until here, more than 5,400 cases have been recorded in 2026, more than double the 2,289 cases of 2025 and the highest annual total since 1991.",
              pourquoi: "« Jusqu'ici » ne parle pas d'un lieu mais d'un moment : jusqu'à maintenant. « Until here » ou « up to here » désignent un endroit (jusqu'à cet endroit).",
              regle: "Jusqu'ici, jusqu'à présent : <b>so far</b>, <b>until now</b>, <b>to date</b>, avec le present perfect.",
              ex: "So far, nobody has been arrested.",
              exfr: "Jusqu'ici, personne n'a été arrêté.",
              carte: { fr: "jusqu'ici (dans le temps)", en: "so far, until now (+ present perfect)" }
            },
            {
              re: [
                "^(so far|thus far|until now|up to now|to date),? (more than|over|upwards of) 5400 (confirmed )?(measles )?cases (of measles )?(were|was)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "So far, more than 5,400 cases were recorded",
              juste: "So far, more than 5,400 cases have been recorded",
              test: "So far, more than 5,400 cases were recorded in 2026, more than double the 2,289 cases of 2025 and the highest annual total since 1991.",
              pourquoi: "So far relie le passé au moment présent : le bilan court jusqu'à aujourd'hui et l'année n'est pas finie. C'est un marqueur du present perfect, jamais du prétérit, qui couperait le lien avec le présent.",
              regle: "<b>So far, until now, to date, this year</b> (année en cours) : <b>present perfect</b> (have been recorded). Prétérit avec une période terminée (in 2025, last year).",
              ex: "So far, three people have died.",
              exfr: "Jusqu'ici, trois personnes sont mortes.",
              lecon: { n: 14, ancre: "marqueurs", titre: "Les marqueurs du present perfect" },
              carte: { fr: "jusqu'ici, … ont été recensés", en: "so far, … have been recorded" }
            }
          ]
        },
        {
          fr: "plus de 5 400 cas ont été recensés en 2026",
          en: "more than 5,400 cases have been recorded in 2026",
          pts: 1.5,
          ok: [
            "(more than|over|upwards of|in excess of) 5400 (confirmed )?(measles )?cases (of measles )?(have|had) been (recorded|reported|registered|confirmed|counted|identified|logged|documented|detected|tallied)",
            "(the )?(authorities|health authorities|officials|states|the country|america|the us|the united states|the cdc|cdc|it|they) (have|has) (recorded|reported|registered|confirmed|counted|identified|logged|seen|had) (more than|over|upwards of|in excess of) 5400 (confirmed )?(measles )?cases",
            "there have been (more than|over|upwards of|in excess of) 5400 (confirmed )?(measles )?cases"
          ],
          fautes: [
            {
              re: [
                "(more than|over|upwards of|in excess of) 5400 (confirmed )?(measles )?cases (of measles )?(were|was) (recorded|reported|registered|confirmed|counted|identified|logged|documented|detected|tallied)",
                "(authorities|officials|states|country|cdc|they) (recorded|reported|registered|counted|identified|logged) (more than|over|upwards of) 5400"
              ],
              type: "grammaire",
              pts: 1,
              faux: "more than 5,400 cases were recorded",
              juste: "more than 5,400 cases have been recorded",
              test: "So far, more than 5,400 cases were recorded in 2026, more than double the 2,289 cases of 2025 and the highest annual total since 1991.",
              pourquoi: "Le bilan est provisoire : il porte sur l'année en cours, qui n'est pas terminée, et jusqu'ici l'annonce. Le prétérit présenterait 2026 comme une période close ; le present perfect dit que le compte court encore.",
              regle: "Période pas terminée (so far, this year, in 2026 quand on y est) : <b>present perfect</b>. Période révolue (in 2025, last year) : prétérit (2,289 cases were recorded in 2025).",
              ex: "This year, prices have risen by 3%.",
              exfr: "Cette année, les prix ont augmenté de 3 %.",
              lecon: { n: 14, ancre: "comparaison", titre: "Present perfect ou prétérit" },
              carte: { fr: "ont été recensés (année en cours)", en: "have been recorded (present perfect)" }
            },
            {
              re: ["(more|plus) (of|that) 5400"],
              type: "grammaire",
              pts: 0.5,
              faux: "more of 5,400 cases",
              juste: "more than 5,400 cases",
              test: "So far, more of 5,400 cases have been recorded in 2026, more than double the 2,289 cases of 2025 and the highest annual total since 1991.",
              pourquoi: "« Plus de » + nombre se traduit par more than (ou over). « More of » ne s'emploie que devant un déterminant (more of the cases) et « more that » confond than avec that.",
              regle: "Plus de + nombre : <b>more than</b>, <b>over</b> (more than 5,400 cases). Moins de : fewer than, under.",
              ex: "More than 300 schools were closed.",
              exfr: "Plus de 300 écoles ont été fermées.",
              lecon: { n: 22, ancre: "comp-court", titre: "Le comparatif de supériorité" },
              carte: { fr: "plus de 5 400", en: "more than 5,400 / over 5,400" }
            },
            {
              re: ["(recensed|censused|recenced|recensated)"],
              type: "barbarisme",
              pts: 0.5,
              faux: "cases have been recensed",
              juste: "cases have been recorded",
              test: "So far, more than 5,400 cases have been recensed in 2026, more than double the 2,289 cases of 2025 and the highest annual total since 1991.",
              pourquoi: "« To recense » n'existe pas. Le recensement de la population, c'est a census, mais recenser des cas d'une maladie se dit to record, to report, to register.",
              regle: "Recenser (des cas, des victimes) : <b>to record, to report, to register</b>. Un recensement de la population : a census.",
              ex: "Ten new cases were reported yesterday.",
              exfr: "Dix nouveaux cas ont été recensés hier.",
              carte: { fr: "recenser (des cas)", en: "to record, to report (cases)" }
            }
          ]
        },
        {
          fr: "soit plus du double des 2 289 cas de 2025",
          en: "more than double the 2,289 cases of 2025",
          pts: 1,
          ok: [
            "(more than|over|well over|well above) (double|twice|2 times|2 fold) (the )?((number|total|figure|tally|count) of )?(the )?2289 (cases )?(of|in|recorded in|reported in|registered in|seen in|from|for|throughout|during|in all of|in the whole of) 2025",
            "(more than|over|well over) (double|twice) (the|last year's|2025's|2025 s) (total|figure|number|tally|count)( of 2289( cases)?)?",
            "(more than|over|well over) (double|twice|2 times) (last year's|2025's|2025 s) 2289( cases)?",
            "(more than|over|well over) (twice|2 times) as many as (the 2289 (cases )?)?(recorded |reported |registered )?(in|during|throughout|for) (all of |the whole of )?2025( 2289)?",
            "(more than|over|well over) (twice|2 times) as many as (the 2289|last year)",
            "(more than )?doubling (the )?2289 cases (of|in|recorded in|reported in) 2025"
          ],
          fautes: [
            {
              re: ["(the )?double (of|from)"],
              type: "gallicisme",
              pts: 0.5,
              faux: "more than the double of the 2,289 cases",
              juste: "more than double the 2,289 cases",
              test: "So far, more than 5,400 cases have been recorded in 2026, more than the double of the 2,289 cases of 2025 and the highest annual total since 1991.",
              pourquoi: "« Le double de » se calque mal : en anglais, double (ou twice) se place directement devant le groupe nominal, sans article ni of : double the number, twice the amount.",
              regle: "Le double de : <b>double / twice + the + nom</b> (double the 2,289 cases, twice the amount). Ou <b>twice as many as</b>.",
              ex: "The new plant produces twice the output of the old one.",
              exfr: "La nouvelle usine produit le double de l'ancienne.",
              lecon: { n: 22, ancre: "structures-avancees", titre: "Les structures avancées du comparatif" },
              carte: { fr: "plus du double de", en: "more than double the… / more than twice as many as…" }
            },
            {
              re: ["(twice|2 times|double) more (than|cases|numerous)"],
              type: "gallicisme",
              pts: 0.25,
              faux: "twice more than 2025",
              juste: "more than double the 2,289 cases of 2025 / twice as many as in 2025",
              test: "So far, more than 5,400 cases have been recorded in 2026, twice more than the 2,289 cases of 2025 and the highest annual total since 1991.",
              pourquoi: "« Deux fois plus » se calque en « twice more », que l'anglais soigné refuse. Le rapport chiffré se dit avec as … as : twice as many cases as in 2025, ou avec double the.",
              regle: "Rapport chiffré : <b>twice / three times + as many (much, high) + as</b> (twice as many cases as in 2025).",
              ex: "The project costs three times as much as planned.",
              exfr: "Le projet coûte trois fois plus que prévu.",
              lecon: { n: 22, ancre: "structures-avancees", titre: "Les structures avancées du comparatif" },
              carte: { fr: "deux fois plus de cas qu'en 2025", en: "twice as many cases as in 2025" }
            }
          ]
        },
        {
          fr: "et le total annuel le plus élevé depuis 1991",
          en: "and the highest annual total since 1991",
          pts: 1,
          ok: [
            "(the )?(highest|largest|biggest|worst|greatest|heaviest) (annual |yearly )?(total|number|figure|tally|count|caseload|level|number of cases|count of cases|toll)( recorded| seen| reported| in a year| for a year| for any year| for a single year)? since 1991",
            "(the )?(highest|largest|biggest|worst|greatest) (annual |yearly )?(total|number|figure|tally|count|caseload|level)( of cases)? in (more than |over |nearly |almost )?35 years",
            "(a level|a total|a figure|a number) (not seen|unseen|unmatched|unequaled) since 1991"
          ],
          fautes: [
            {
              re: ["(the )?most (high|elevated|important|big|large)\\b", "(the )?(more|most) (higher|highest|elevated)"],
              type: "grammaire",
              pts: 0.5,
              faux: "the most high total",
              juste: "the highest total",
              test: "So far, more than 5,400 cases have been recorded in 2026, more than double the 2,289 cases of 2025 and the most high annual total since 1991.",
              pourquoi: "High est un adjectif court (une syllabe) : son superlatif se forme avec -est, the highest. The most est réservé aux adjectifs longs (the most expensive). « Elevated » est un calque d'« élevé » qui ne s'emploie pas pour un total.",
              regle: "Adjectif court : <b>the + adj-est</b> (the highest, the largest). Adjectif long : <b>the most + adj</b> (the most serious).",
              ex: "It is the largest outbreak in thirty years.",
              exfr: "C'est la plus grande flambée depuis trente ans.",
              lecon: { n: 22, ancre: "superlatif", titre: "Le superlatif" },
              carte: { fr: "le plus élevé", en: "the highest (adjectif court : -est)" }
            },
            {
              re: ["(total|number|figure|tally) (annual|yearly)\\b"],
              type: "grammaire",
              pts: 0.25,
              faux: "the total annual",
              juste: "the annual total",
              test: "So far, more than 5,400 cases have been recorded in 2026, more than double the 2,289 cases of 2025 and the highest total annual since 1991.",
              pourquoi: "En français, l'adjectif suit souvent le nom (le total annuel). En anglais, l'adjectif épithète se place toujours devant : the annual total.",
              regle: "Adjectif épithète <b>avant le nom</b> : an annual total, a public health crisis.",
              ex: "The annual report was published in March.",
              exfr: "Le rapport annuel a été publié en mars.",
              lecon: { n: 8, ancre: "adjectif-position", titre: "La place de l'adjectif épithète" },
              carte: { fr: "le total annuel", en: "the annual total" }
            },
            {
              re: [
                "(highest|largest|biggest|worst|greatest) (annual |yearly )?(total|number|figure|tally|count|level) (for|from|of) 1991",
                "since 35 years"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "the highest total for 1991",
              juste: "the highest total since 1991",
              test: "So far, more than 5,400 cases have been recorded in 2026, more than double the 2,289 cases of 2025 and the highest annual total for 1991.",
              pourquoi: "« Depuis 1991 » donne un point de départ : c'est since. For introduit une durée (for 35 years) et « for 1991 » se lirait « pour l'année 1991 ». Avec une durée, l'anglais dit the highest in 35 years.",
              regle: "<b>Since</b> + point de départ (since 1991). Avec une durée : <b>in</b> (the highest in 35 years).",
              ex: "Inflation is at its highest level since 2008.",
              exfr: "L'inflation est à son plus haut niveau depuis 2008.",
              lecon: { n: 15, ancre: "cas-speciaux", titre: "Since, for : cas spéciaux" },
              carte: { fr: "le plus élevé depuis 1991", en: "the highest since 1991 / in 35 years" }
            }
          ]
        }
      ]
    },
    {
      fr: "Ce retour ((est dû)) ((avant tout)) au recul de la vaccination : ((selon)) les CDC, 96 % des malades n'étaient pas vaccinés ou avaient un [[statut vaccinal]] inconnu.",
      cartes: [
        { id: "2f3c448c6b", fr: "être dû à", en: "to be due to", re: "(is|was|are|were|be|being|been|it's)( \\w+){0,3} due( \\w+){0,3} to" },
        { id: "17f96e1334", fr: "surtout, avant tout", en: "above all", re: "above all" },
        { id: "440a3bbc91", fr: "selon, d'après", en: "according to", re: "according to" }
      ],
      aides: [{ fr: "le statut vaccinal", en: "vaccination status" }],
      proposition: "This comeback is due above all to falling vaccination rates: according to the CDC, 96% of patients were unvaccinated or had an unknown vaccination status.",
      autres: [
        "This resurgence is above all due to a decline in vaccination: according to the CDC, 96% of those infected had not been vaccinated or had an unknown vaccination status."
      ],
      tests: [
        "The return of measles is due above all to falling vaccine coverage: according to the Centers for Disease Control, 96% of cases were unvaccinated or had an unknown vaccination status.",
        "This comeback is due, above all, to a drop in vaccination rates: according to CDC figures, 96% of the sick were not vaccinated or had an unknown vaccine status."
      ],
      morceaux: [
        {
          fr: "Ce retour est dû avant tout",
          en: "This comeback is due above all",
          pts: 1,
          ok: [
            "((this|the|measles') (comeback|return|resurgence|revival|re emergence|reemergence|rise|surge|upsurge|rebound|resurgence of measles)( of (the )?(disease|measles|virus))?|this|it) (is|was|has been),? ((above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all),? )?(due|attributable|linked|down),? ((above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all),? )?to",
            "((this|the|measles') (comeback|return|resurgence|revival|re emergence|reemergence|rise|surge|upsurge|rebound|resurgence of measles)( of (the )?(disease|measles|virus))?|this|it) (is|was|can be) ((above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all) )?(explained|caused|driven) ((above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all) )?by",
            "((this|the|measles') (comeback|return|resurgence|revival|re emergence|reemergence|rise|surge|upsurge|rebound|resurgence of measles)( of (the )?(disease|measles|virus))?|this|it) ((above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all) )?(stems|results|comes) ((above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all) )?from",
            "((this|the|measles') (comeback|return|resurgence|revival|re emergence|reemergence|rise|surge|upsurge|rebound|resurgence of measles)( of (the )?(disease|measles|virus))?|this|it) (is|was) ((above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all) )?(the result|the consequence) of",
            "(above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all),? ((this|the|measles') (comeback|return|resurgence|revival|re emergence|reemergence|rise|surge|upsurge|rebound|resurgence of measles)( of (the )?(disease|measles|virus))?|this|it) (is|was) (due|attributable|linked) to"
          ],
          fautes: [
            {
              re: [
                "(is|was|has been) ((above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all) )?owed ((above all|first and foremost|mainly|primarily|largely|mostly|chiefly|essentially|principally|in large part|for the most part|first of all) )?to"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "is owed above all to",
              juste: "is due above all to",
              test: "This comeback is owed above all to falling vaccination rates: according to the CDC, 96% of patients were unvaccinated or had an unknown vaccination status.",
              pourquoi: "« Dû » vient de devoir, mais pas au sens d'une dette. « Owed to » parle d'une somme que l'on doit à quelqu'un (the money owed to the bank). Pour une cause, l'anglais dit be due to.",
              regle: "Être dû à (une cause) : <b>to be due to</b> (the delay was due to the strike). To owe : devoir (de l'argent, une dette).",
              ex: "The fall in sales is due to the strike.",
              exfr: "La baisse des ventes est due à la grève.",
              carte: { fr: "être dû à (cause)", en: "to be due to (owe = devoir de l'argent)" }
            },
            {
              re: ["before (all|everything)\\b", "above everything\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "before all",
              juste: "above all",
              test: "This comeback is due before all to falling vaccination rates: according to the CDC, 96% of patients were unvaccinated or had an unknown vaccination status.",
              pourquoi: "« Avant tout » ne parle pas d'un ordre dans le temps : il marque la cause principale. « Before all » est un calque que l'anglais ne comprend pas. On dit above all, ou mainly, primarily.",
              regle: "Avant tout, surtout : <b>above all</b>, <b>mainly</b>, <b>first and foremost</b>.",
              ex: "Above all, the plan must be funded.",
              exfr: "Avant tout, le plan doit être financé.",
              carte: { fr: "avant tout, surtout", en: "above all, mainly" }
            }
          ]
        },
        {
          fr: "au recul de la vaccination",
          en: "to falling vaccination rates",
          pts: 1,
          ok: [
            "(to|by|from|of) (a |the )?(fall|drop|decline|decrease|slump|reduction|dip|slide|downturn|falloff) in (the )?(vaccination|immunization|vaccine|mmr) ?(rates|rate|coverage|uptake|levels)?",
            "(to|by|from|of) (falling|declining|dropping|decreasing|lower|shrinking|sliding|waning|slipping|reduced|lower) (vaccination|immunization|vaccine|mmr) (rates|rate|coverage|uptake|levels)",
            "(to|by|from|of) (a |the )?(fall|drop|decline|decrease|reduction) in (the number of )?(people|children|parents|americans) (being |getting )?(vaccinated|immunized|vaccinating their children)",
            "(to|by|from) (fewer|fewer and fewer) (people|children|parents|americans) (being vaccinated|getting vaccinated|getting their children vaccinated|vaccinating their children)",
            "(to|by|from) (a |the )?(decline|fall|drop|decrease) of (vaccination|immunization)",
            "(to|by|from) (vaccination|immunization|vaccine) (rates|coverage|uptake) (falling|declining|dropping)",
            "(to|by|from) (declining|falling|less) vaccination"
          ],
          fautes: [
            {
              re: ["(recoil|recoiling|step back|backing|backward|regression|retreat|retreating) (of|in) (the )?(vaccination|vaccine|immunization)"],
              type: "faux-sens",
              pts: 0.5,
              faux: "the recoil of vaccination",
              juste: "falling vaccination rates",
              test: "This comeback is due above all to the recoil of vaccination: according to the CDC, 96% of patients were unvaccinated or had an unknown vaccination status.",
              pourquoi: "« Recul » se traduit selon le sens. Recoil, c'est le recul d'une arme à feu ; retreat, celui d'une armée ou d'un glacier. Pour un chiffre qui baisse, l'anglais dit a fall, a decline, a drop in, ou falling rates.",
              regle: "Le recul de (une baisse) : <b>a fall / decline / drop in</b> + nom, ou <b>falling</b> + nom (falling vaccination rates).",
              ex: "Experts point to a decline in vaccination.",
              exfr: "Les experts mettent en cause le recul de la vaccination.",
              carte: { fr: "le recul de la vaccination", en: "a decline in vaccination, falling vaccination rates" }
            },
            {
              re: ["(of|in) the vaccination\\b(?! (rate|rates|coverage|campaign|campaigns|status|uptake|levels|programs?|drive))"],
              type: "grammaire",
              pts: 0.25,
              faux: "the fall of the vaccination",
              juste: "falling vaccination rates / a decline in vaccination",
              test: "This comeback is due above all to a decline of the vaccination: according to the CDC, 96% of patients were unvaccinated or had an unknown vaccination status.",
              pourquoi: "La vaccination est prise ici au sens général : la pratique, pas une campagne précise. Un nom indénombrable pris au sens général se passe d'article en anglais.",
              regle: "Nom au sens général : <b>pas d'article</b> (vaccination, education, health). The pour une chose précise (the vaccination campaign launched in April).",
              ex: "Education is the key to growth.",
              exfr: "L'éducation est la clé de la croissance.",
              lecon: { n: 4, ancre: "zero-article", titre: "Le zéro article" },
              carte: { fr: "la vaccination (en général)", en: "vaccination (sans article)" }
            }
          ]
        },
        {
          fr: "selon les CDC,",
          en: "according to the CDC",
          pts: 0.5,
          ok: [
            "according to (the )?(us )?(cdc|centers for disease control( and prevention)?( cdc)?)( figures| data| statistics)?",
            "(the )?(us )?(cdc|centers for disease control( and prevention)?( cdc)?)('s)? (figures|data|statistics) (show|showed|indicate|reveal|suggest)( that)?",
            "(the )?(us )?(cdc|centers for disease control( and prevention)?( cdc)?) (says|said|reports|reported|notes|noted|indicates|estimates|found)( that)?"
          ],
          fautes: [
            {
              re: ["according (the |with |at )?(us )?(cdc|centers)"],
              type: "grammaire",
              pts: 0.25,
              faux: "according the CDC",
              juste: "according to the CDC",
              test: "This comeback is due above all to falling vaccination rates: according the CDC, 96% of patients were unvaccinated or had an unknown vaccination status.",
              pourquoi: "According se construit toujours avec to : la préposition fait partie de l'expression. Sans elle, ou avec with, la phrase est fautive.",
              regle: "Selon, d'après : <b>according to</b> + source (according to the CDC, according to a poll).",
              ex: "According to the report, the disease is spreading.",
              exfr: "Selon le rapport, la maladie se propage.",
              carte: { fr: "selon les CDC", en: "according to the CDC" }
            },
            {
              re: ["(following|after|selon) (the )?(us )?(cdc|centers for disease control( and prevention)?( cdc)?)"],
              type: "faux-sens",
              pts: 0.25,
              faux: "following the CDC",
              juste: "according to the CDC",
              test: "This comeback is due above all to falling vaccination rates: following the CDC, 96% of patients were unvaccinated or had an unknown vaccination status.",
              pourquoi: "« Following » veut dire à la suite de, après : « following the CDC » se lit « après les CDC », comme un événement. Pour citer une source, on dit according to.",
              regle: "Citer une source : <b>according to</b>. Following, after : après, à la suite de.",
              ex: "According to the WHO, cases are rising.",
              exfr: "Selon l'OMS, les cas augmentent.",
              carte: { fr: "selon (une source)", en: "according to (following = après)" }
            }
          ]
        },
        {
          fr: "96 % des malades n'étaient pas vaccinés ou avaient un statut vaccinal inconnu",
          en: "96% of patients were unvaccinated or had an unknown vaccination status",
          pts: 1.5,
          ok: [
            "96 percent of (the )?(patients|cases|sick people|people who fell ill|those who fell ill|those infected|people infected|infected people|people affected|those affected|people who caught (it|measles|the disease)|those who caught (it|measles|the disease)|sufferers|the sick|people with measles|measles patients|measles cases|people who contracted (it|measles|the disease)|those who contracted (it|measles|the disease))( in 2026| this year)? (were (either )?(not vaccinated|unvaccinated|non vaccinated|not immunized|unimmunized|never vaccinated)|had (either )?(not|never) been (vaccinated|immunized)),? or (had|with|of) (an |a )?(unknown|undocumented|uncertain|unclear) ((vaccination|vaccine|immunization) (status|history|records?)|status)",
            "96 percent of (the )?(patients|cases|sick people|people who fell ill|those who fell ill|those infected|people infected|infected people|people affected|those affected|people who caught (it|measles|the disease)|those who caught (it|measles|the disease)|sufferers|the sick|people with measles|measles patients|measles cases|people who contracted (it|measles|the disease)|those who contracted (it|measles|the disease))( in 2026| this year)? (were (either )?(not vaccinated|unvaccinated|non vaccinated|not immunized|unimmunized|never vaccinated)|had (either )?(not|never) been (vaccinated|immunized)),? or (their|whose) ((vaccination|vaccine|immunization) (status|history|records?)|status) (was|is|were|remained) (unknown|not known|unclear|uncertain)",
            "96 percent of (the )?(patients|cases|sick people|people who fell ill|those who fell ill|those infected|people infected|infected people|people affected|those affected|people who caught (it|measles|the disease)|those who caught (it|measles|the disease)|sufferers|the sick|people with measles|measles patients|measles cases|people who contracted (it|measles|the disease)|those who contracted (it|measles|the disease))( in 2026| this year)? (were (either )?(not vaccinated|unvaccinated|non vaccinated|not immunized|unimmunized|never vaccinated)|had (either )?(not|never) been (vaccinated|immunized)),? or of (an )?unknown ((vaccination|vaccine|immunization) (status|history|records?)|status)",
            "96 percent of (the )?cases (were|occurred|involved) (in |among )?(unvaccinated|non vaccinated) (people|patients|individuals) or (people |patients |individuals |those )?(with|of|whose) (an )?(unknown ((vaccination|vaccine|immunization) (status|history|records?)|status)|((vaccination|vaccine|immunization) (status|history|records?)|status) (was|is) unknown)",
            "96 percent of (the )?(patients|cases|sick people|people who fell ill|those who fell ill|those infected|people infected|infected people|people affected|those affected|people who caught (it|measles|the disease)|those who caught (it|measles|the disease)|sufferers|the sick|people with measles|measles patients|measles cases|people who contracted (it|measles|the disease)|those who contracted (it|measles|the disease))( in 2026| this year)? (were|had been) (either )?(unvaccinated|not vaccinated) or (had|were of) (an )?unknown ((vaccination|vaccine|immunization) (status|history|records?)|status)"
          ],
          fautes: [
            {
              re: ["(sicks|malades|maladies)\\b"],
              type: "barbarisme",
              pts: 0.5,
              faux: "the sicks",
              juste: "the patients / the sick",
              test: "This comeback is due above all to falling vaccination rates: according to the CDC, 96% of the sicks were unvaccinated or had an unknown vaccination status.",
              pourquoi: "Un adjectif employé comme nom (the sick, the poor, the young) désigne un groupe et reste invariable : il ne prend jamais de s. « Malades » n'existe pas en anglais. Le plus simple : patients, ou people who fell ill.",
              regle: "<b>The + adjectif</b> = un groupe, sans s (the sick, the elderly). Ou un vrai nom : <b>patients</b>, cases.",
              ex: "The elderly are the most vulnerable.",
              exfr: "Les personnes âgées sont les plus vulnérables.",
              carte: { fr: "les malades", en: "patients, the sick (sans s)" }
            },
            {
              re: ["(not|un|non|never) ?vaccinate\\b"],
              type: "grammaire",
              pts: 0.25,
              faux: "were not vaccinate",
              juste: "were not vaccinated / were unvaccinated",
              test: "This comeback is due above all to falling vaccination rates: according to the CDC, 96% of patients were not vaccinate or had an unknown vaccination status.",
              pourquoi: "« Vaccinés » décrit l'état des malades : c'est un participe passé, avec la terminaison -ed. Sans elle, vaccinate est un verbe à la base verbale, qui ne peut pas suivre were.",
              regle: "Be + <b>participe passé</b> (-ed) pour un état ou un passif : they were vaccinated, unvaccinated.",
              ex: "Most children are vaccinated at one year old.",
              exfr: "La plupart des enfants sont vaccinés à un an.",
              carte: { fr: "non vaccinés", en: "unvaccinated, not vaccinated (-ed)" }
            },
            {
              re: ["vaccinal"],
              type: "gallicisme",
              pts: 0.5,
              faux: "an unknown vaccinal status",
              juste: "an unknown vaccination status",
              test: "This comeback is due above all to falling vaccination rates: according to the CDC, 96% of patients were unvaccinated or had an unknown vaccinal status.",
              pourquoi: "« Vaccinal » existe à peine en anglais, réservé à la langue médicale très technique. La presse et les autorités disent vaccination status, vaccination coverage : un nom placé devant un autre nom.",
              regle: "Statut vaccinal : <b>vaccination status</b>. Couverture vaccinale : <b>vaccination coverage</b> (nom + nom).",
              ex: "Parents must show their child's vaccination record.",
              exfr: "Les parents doivent présenter le carnet de vaccination de leur enfant.",
              carte: { fr: "le statut vaccinal", en: "vaccination status (nom + nom)" }
            },
            {
              re: [
                "96 percent of (the )?(patients|cases|sick people|people who fell ill|those who fell ill|those infected|people infected|infected people|people affected|those affected|people who caught (it|measles|the disease)|those who caught (it|measles|the disease)|sufferers|the sick|people with measles|measles patients|measles cases|people who contracted (it|measles|the disease)|those who contracted (it|measles|the disease))( in 2026| this year)? (was|has)\\b"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "96% of patients was",
              juste: "96% of patients were",
              test: "This comeback is due above all to falling vaccination rates: according to the CDC, 96% of patients was unvaccinated or had an unknown vaccination status.",
              pourquoi: "Un pourcentage suivi de of + nom s'accorde avec ce nom : ici, patients est au pluriel, donc were. Le singulier ne vaut que devant un nom singulier ou indénombrable (96% of the population is…).",
              regle: "<b>Pourcentage + of + nom pluriel</b> : verbe au pluriel (60% of voters are). + nom singulier : singulier (60% of the budget is).",
              ex: "Half of the students were absent.",
              exfr: "La moitié des élèves étaient absents.",
              lecon: { n: 7, ancre: "quantifieurs", titre: "Accord avec les quantifieurs et pourcentages" },
              carte: { fr: "96 % des malades étaient", en: "96% of patients were (accord avec patients)" }
            }
          ]
        }
      ]
    },
    {
      fr: "La [[couverture vaccinale]] des élèves de [[maternelle]] est tombée à 92,4 %, contre 95,2 % il y a six ans, ce qui ((met en danger)) environ 280 000 enfants.",
      cartes: [
        {
          id: "7cf7050d17",
          fr: "menacer, mettre en danger",
          en: "to put at risk",
          re: "put(s|ting)? (\\w+ ){0,4}at risk|(is|are|were|being|been) (being )?put at risk"
        }
      ],
      aides: [{ fr: "la couverture vaccinale", en: "vaccination coverage" }, { fr: "la maternelle (aux États-Unis)", en: "kindergarten" }],
      proposition: "Vaccination coverage among kindergarten children has fallen to 92.4%, compared with 95.2% six years ago, which puts some 280,000 children at risk.",
      autres: ["Among kindergartners, vaccination coverage has dropped to 92.4%, down from 95.2% six years ago, which puts around 280,000 children at risk."],
      tests: [
        "Kindergarten vaccination rates fell to 92.4%, compared to 95.2% six years earlier, which leaves some 280,000 children unprotected.",
        "Vaccination coverage for children in kindergarten has fallen to 92.4%, against 95.2% six years ago, putting an estimated 280,000 children at risk."
      ],
      morceaux: [
        {
          fr: "La couverture vaccinale des élèves de maternelle",
          en: "Vaccination coverage among kindergarten children",
          pts: 1,
          ok: [
            "(the )?((mmr |measles )?(vaccination|vaccine|immunization|mmr) (coverage|rate|rates|uptake)) (among|for|of|in) (the )?((kindergarten|nursery school|preschool|pre school|kindergarten age) (children|pupils|kids|students)|kindergartners|kindergarteners|(children|pupils|kids|students) (in|at|entering|starting) (kindergarten|nursery school|preschool)|(children|pupils) of kindergarten age|kindergarten)",
            "(among|for|in) ((kindergarten|nursery school|preschool|pre school|kindergarten age) (children|pupils|kids|students)|kindergartners|kindergarteners|(children|pupils|kids|students) (in|at|entering|starting) (kindergarten|nursery school|preschool)|(children|pupils) of kindergarten age|kindergarten),? (the )?((mmr |measles )?(vaccination|vaccine|immunization|mmr) (coverage|rate|rates|uptake))",
            "((kindergarten|nursery school|preschool|pre school|kindergarten age) (children|pupils|kids|students)|kindergartners|kindergarteners|(children|pupils|kids|students) (in|at|entering|starting) (kindergarten|nursery school|preschool)|(children|pupils) of kindergarten age|kindergarten)('s)? ((mmr |measles )?(vaccination|vaccine|immunization|mmr) (coverage|rate|rates|uptake))",
            "(the )?(share|proportion|percentage) of ((kindergarten|nursery school|preschool|pre school|kindergarten age) (children|pupils|kids|students)|kindergartners|kindergarteners|(children|pupils|kids|students) (in|at|entering|starting) (kindergarten|nursery school|preschool)|(children|pupils) of kindergarten age|kindergarten) (who are |who have been |fully )?(vaccinated|immunized)( against measles)?"
          ],
          fautes: [
            {
              re: ["(maternal|maternity|maternelle|mother) (school|schools|class|classes|pupils|children)", "\\bmaternal\\b"],
              type: "faux-sens",
              pts: 0.5,
              faux: "maternal school",
              juste: "kindergarten",
              test: "Vaccination coverage among maternal school children has fallen to 92.4%, compared with 95.2% six years ago, which puts some 280,000 children at risk.",
              pourquoi: "Faux ami : maternal veut dire maternel, propre à la mère (maternal health, la santé maternelle). L'école maternelle américaine, l'année avant l'école primaire, c'est kindergarten ; au Royaume-Uni, nursery school.",
              regle: "L'école maternelle : <b>kindergarten</b> (États-Unis), <b>nursery school</b> (Royaume-Uni). Maternal : de la mère.",
              ex: "Children start kindergarten at five.",
              exfr: "Les enfants entrent en grande section à cinq ans.",
              carte: { fr: "la maternelle", en: "kindergarten, nursery school (maternal = de la mère)" }
            },
            {
              re: ["vaccinal (coverage|cover|rate)"],
              type: "gallicisme",
              pts: 0.5,
              faux: "the vaccinal coverage",
              juste: "vaccination coverage",
              test: "The vaccinal coverage among kindergarten children has fallen to 92.4%, compared with 95.2% six years ago, which puts some 280,000 children at risk.",
              pourquoi: "« Couverture vaccinale » se calque en « vaccinal coverage », qui sonne faux. L'anglais met le nom vaccination devant coverage, comme un adjectif : vaccination coverage, vaccination rate.",
              regle: "<b>Nom + nom</b> : vaccination coverage, vaccination rate, measles outbreak.",
              ex: "Vaccination rates have fallen in many states.",
              exfr: "La couverture vaccinale a reculé dans de nombreux États.",
              lecon: { n: 8, ancre: "adjectif-position", titre: "La place de l'adjectif épithète" },
              carte: { fr: "la couverture vaccinale", en: "vaccination coverage, the vaccination rate" }
            }
          ]
        },
        {
          fr: "est tombée à 92,4 %",
          en: "has fallen to 92.4%",
          pts: 1,
          ok: [
            "(has|had)( now)? (fallen|dropped|declined|slipped|sunk|decreased|gone down|slid|dipped|come down|been reduced) to 92 4 percent",
            "(fell|dropped|declined|slipped|sank|decreased|went down|slid|dipped|came down) to 92 4 percent",
            "(is|stands at|stood at|was|is now|now stands at|is down to|was down to|is now down to) (only |just )?92 4 percent"
          ],
          fautes: [
            {
              re: ["(fallen|fell|dropped|declined|fall|falls|falled|decreased|gone down|went down|slipped) (at|until|of|by) 92 4"],
              type: "grammaire",
              pts: 0.5,
              faux: "has fallen at 92.4%",
              juste: "has fallen to 92.4%",
              test: "Vaccination coverage among kindergarten children has fallen at 92.4%, compared with 95.2% six years ago, which puts some 280,000 children at risk.",
              pourquoi: "Après un verbe de baisse ou de hausse, to introduit le niveau atteint et by l'ampleur du mouvement. « Fallen by 92.4% » voudrait dire que la couverture a perdu 92,4 points, et at ne s'emploie pas : on tombe à un niveau, on ne tombe pas « en » un niveau.",
              regle: "Évolution chiffrée : <b>to</b> + niveau atteint (fell to 92.4%), <b>by</b> + ampleur (fell by 2.8 points), <b>from</b> + point de départ.",
              ex: "Unemployment fell from 5% to 4.2%.",
              exfr: "Le chômage est passé de 5 % à 4,2 %.",
              lecon: { n: 11, ancre: "contexte-economique", titre: "Décrire une hausse ou une baisse" },
              carte: { fr: "tomber à 92,4 %", en: "to fall to 92.4% (to + niveau, by + ampleur)" }
            },
            {
              re: ["(felt|falled|felled) (to|at|down)", "(is|was) (fallen|fell|dropped|felt)"],
              type: "grammaire",
              pts: 0.5,
              faux: "has felt to / is fallen to",
              juste: "has fallen to",
              test: "Vaccination coverage among kindergarten children is fallen to 92.4%, compared with 95.2% six years ago, which puts some 280,000 children at risk.",
              pourquoi: "Deux pièges en un. Le passé composé français prend parfois être (elle est tombée), mais le present perfect anglais se forme toujours avec have. Et fall est irrégulier : fall, fell, fallen ; felt est le passé de feel (ressentir).",
              regle: "Present perfect : <b>have / has + participe passé</b>, jamais be. <b>Fall, fell, fallen</b> (tomber) ; feel, felt, felt (ressentir).",
              ex: "Prices have fallen sharply.",
              exfr: "Les prix sont tombés brutalement.",
              lecon: { n: 14, ancre: "formation", titre: "Le present perfect : formation" },
              carte: { fr: "est tombée", en: "has fallen (fall, fell, fallen)" }
            }
          ]
        },
        {
          fr: "contre 95,2 % il y a six ans",
          en: "compared with 95.2% six years ago",
          pts: 1,
          ok: [
            "(compared (with|to)|down from|versus|vs|against|as against|from|as opposed to|in comparison with|in comparison to) (the )?95 2 percent (recorded |seen |reached |registered )?(6 years ago|6 years earlier|6 years before|in 2019( 2020| 20)?|in the 2019( 2020| 20)? school year|before the pandemic)",
            "(when|whereas|while|and|but) (it|the rate|coverage|the figure|vaccination coverage|the share|the proportion) (was|stood at|had been|reached) 95 2 percent (6 years ago|6 years earlier|in 2019( 2020| 20)?)",
            "(and|but) 95 2 percent (6 years ago|in 2019( 2020| 20)?)",
            "(6 years ago|in 2019( 2020| 20)?),? (it|the rate|coverage|the figure) (was|stood at) 95 2 percent"
          ],
          fautes: [
            {
              re: ["there (is|are|were|was) 6 years", "it (is|was) 6 years", "it (has|had) been 6 years"],
              type: "gallicisme",
              pts: 0.5,
              faux: "there are six years",
              juste: "six years ago",
              test: "Vaccination coverage among kindergarten children has fallen to 92.4%, compared with 95.2% there are six years, which puts some 280,000 children at risk.",
              pourquoi: "« Il y a six ans » ne parle pas d'existence : il situe un moment dans le passé. « There are six years » se lit « six années existent ». L'anglais dit six years ago, ago placé après la durée.",
              regle: "Il y a + durée (moment passé) : <b>durée + ago</b> (six years ago), avec le prétérit quand c'est le verbe principal (it was 95.2% six years ago).",
              ex: "The vaccine arrived sixty years ago.",
              exfr: "Le vaccin est arrivé il y a soixante ans.",
              lecon: { n: 13, ancre: "marqueurs", titre: "Les marqueurs du prétérit" },
              carte: { fr: "il y a six ans", en: "six years ago" }
            },
            {
              re: ["(before|since|ago) 6 years\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "before six years / since six years",
              juste: "six years ago",
              test: "Vaccination coverage among kindergarten children has fallen to 92.4%, compared with 95.2% before six years, which puts some 280,000 children at risk.",
              pourquoi: "Ago se place toujours après la durée (six years ago). « Before six years » est un calque, et since ne suit jamais une durée : il veut un point de départ (since 2019).",
              regle: "<b>Durée + ago</b> : il y a (six years ago). <b>Since</b> + date (since 2019). <b>For</b> + durée (for six years).",
              ex: "Three years ago, the rate was 95%.",
              exfr: "Il y a trois ans, le taux était de 95 %.",
              lecon: { n: 13, ancre: "marqueurs", titre: "Les marqueurs du prétérit" },
              carte: { fr: "il y a six ans", en: "six years ago (ago après la durée)" }
            }
          ]
        },
        {
          fr: "ce qui met en danger environ 280 000 enfants",
          en: "which puts some 280,000 children at risk",
          pts: 1,
          ok: [
            "(which|this|that|something that) (puts|has put|is putting|places|has placed) (some |about |around |roughly |approximately |an estimated |nearly |almost |close to |up to )?280000 (children|kids|pupils|youngsters|young children|kindergartners|kindergarteners|little ones) (at risk|in danger|at risk of (catching )?(measles|infection|the disease))",
            "(which|this|that|something that) (endangers|has endangered|is endangering|threatens|is threatening|exposes|has exposed|is exposing|jeopardizes) (some |about |around |roughly |approximately |an estimated |nearly |almost |close to |up to )?280000 (children|kids|pupils|youngsters|young children|kindergartners|kindergarteners|little ones)",
            "(which|this|that|something that) (leaves|has left|is leaving) (some |about |around |roughly |approximately |an estimated |nearly |almost |close to |up to )?280000 (children|kids|pupils|youngsters|young children|kindergartners|kindergarteners|little ones) (unprotected|exposed|vulnerable|at risk|in danger)",
            "(which means|meaning|so) (that )?(some |about |around |roughly |approximately |an estimated |nearly |almost |close to |up to )?280000 (children|kids|pupils|youngsters|young children|kindergartners|kindergarteners|little ones) (are|are now|remain|could be) (at risk|in danger|unprotected|exposed|vulnerable)",
            "(putting|placing) (some |about |around |roughly |approximately |an estimated |nearly |almost |close to |up to )?280000 (children|kids|pupils|youngsters|young children|kindergartners|kindergarteners|little ones) (at risk|in danger)",
            "(leaving) (some |about |around |roughly |approximately |an estimated |nearly |almost |close to |up to )?280000 (children|kids|pupils|youngsters|young children|kindergartners|kindergarteners|little ones) (unprotected|exposed|vulnerable|at risk|in danger)",
            "(endangering|threatening|exposing) (some |about |around |roughly |approximately |an estimated |nearly |almost |close to |up to )?280000 (children|kids|pupils|youngsters|young children|kindergartners|kindergarteners|little ones)"
          ],
          fautes: [
            {
              re: ["what (puts|put|has put|is putting|endangers|leaves|places|exposes|threatens|means)\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "what puts 280,000 children at risk",
              juste: "which puts 280,000 children at risk",
              test: "Vaccination coverage among kindergarten children has fallen to 92.4%, compared with 95.2% six years ago, what puts some 280,000 children at risk.",
              pourquoi: "« Ce qui » reprend ici toute l'idée qui précède (la baisse de la couverture). En anglais, c'est which, après une virgule. What veut dire « ce qui » seulement en tête de phrase ou sans antécédent (what worries me is…).",
              regle: "Reprendre toute une proposition : <b>, which</b> (prices rose, which hurt households). What = la chose qui (what matters is…).",
              ex: "Coverage fell, which worried doctors.",
              exfr: "La couverture a baissé, ce qui a inquiété les médecins.",
              lecon: { n: 26, ancre: "determinative", titre: "Relatives déterminatives et explicatives" },
              carte: { fr: "…, ce qui met en danger", en: "…, which puts… at risk" }
            },
            {
              re: ["(meets|met|sets|set|makes|made) (\\w+ ){0,3}(in danger|at risk)\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "which sets 280,000 children in danger",
              juste: "which puts 280,000 children at risk",
              test: "Vaccination coverage among kindergarten children has fallen to 92.4%, compared with 95.2% six years ago, which sets some 280,000 children in danger.",
              pourquoi: "« Mettre en danger » ne se traduit pas avec set ni make. L'expression figée anglaise, c'est put at risk (ou endanger, en un seul verbe).",
              regle: "Mettre en danger : <b>to put at risk</b>, <b>to endanger</b>, <b>to put in danger</b>.",
              ex: "The cuts put thousands of jobs at risk.",
              exfr: "Les coupes mettent en danger des milliers d'emplois.",
              carte: { fr: "mettre en danger", en: "to put at risk, to endanger" }
            },
            {
              re: ["(childs|childrens)\\b"],
              type: "barbarisme",
              pts: 0.25,
              faux: "280,000 childs",
              juste: "280,000 children",
              test: "Vaccination coverage among kindergarten children has fallen to 92.4%, compared with 95.2% six years ago, which puts some 280,000 childs at risk.",
              pourquoi: "Child a un pluriel irrégulier : children, qui ne prend jamais de s de plus (childrens n'existe pas, sauf au génitif children's).",
              regle: "Pluriels irréguliers : <b>child, children</b> ; man, men ; woman, women ; person, people.",
              ex: "Two children were taken to hospital.",
              exfr: "Deux enfants ont été hospitalisés.",
              carte: { fr: "des enfants", en: "children (pluriel irrégulier)" }
            }
          ]
        }
      ]
    },
    {
      fr: "Les CDC ((s'engagent à)) retrouver ce statut, mais ((on ne sait pas si)) le pays parviendra à [[enrayer]] l'épidémie, puis à rester douze mois [[d'affilée]] sans transmission, comme l'exige l'OPS.",
      cartes: [
        {
          id: "ccaab6ab98",
          fr: "s'engager à",
          en: "to commit to + V-ing",
          re: "commit(s|ted|ting)?( itself| themselves)? to \\w+ing|(is|are|remains?|has been|have been) (\\w+ )?committed to"
        },
        { id: "64cb40d8ef", fr: "on ne sait pas si", en: "it is unclear whether", re: "it (is|remains) (still )?unclear (whether|if)" }
      ],
      aides: [{ fr: "enrayer (une épidémie)", en: "to halt" }, { fr: "d'affilée", en: "in a row" }],
      proposition: "The CDC is committed to regaining this status, but it is unclear whether the country will manage to halt the outbreak and then go twelve months in a row without transmission, as PAHO requires.",
      autres: [
        "The CDC has committed to regaining this status, but it remains unclear whether the country will be able to stop the outbreak and then remain free of transmission for twelve consecutive months, as PAHO requires."
      ],
      tests: [
        "The CDC says it is committed to winning back this status, but it is unclear whether the United States will manage to contain the epidemic and then go twelve straight months without transmission, as required by PAHO.",
        "The Centers for Disease Control are committed to regaining the status, but it is unclear if America can halt the outbreak and then go 12 months in a row without any transmission, as the Pan American Health Organization requires."
      ],
      morceaux: [
        {
          fr: "Les CDC s'engagent à retrouver ce statut,",
          en: "The CDC is committed to regaining this status",
          pts: 1,
          ok: [
            "(the )?(us )?(cdc|centers for disease control( and prevention)?( cdc)?) (is|are|remains|remain|has been|have been|says it is|say they are|says it remains|insists it is|insist they are) ((fully|firmly|still) )?committed to (regaining|recovering|winning back|getting back|restoring|reclaiming|retrieving) (this|the|that|its|their|the country's|america's) (measles )?(elimination )?status",
            "(the )?(us )?(cdc|centers for disease control( and prevention)?( cdc)?) (has|have) committed( itself| themselves)? to (regaining|recovering|winning back|getting back|restoring|reclaiming|retrieving) (this|the|that|its|their|the country's|america's) (measles )?(elimination )?status",
            "(the )?(us )?(cdc|centers for disease control( and prevention)?( cdc)?) (pledges|pledge|has pledged|have pledged|pledged|vows|vow|has vowed|vowed|promises|promise|has promised|promised|undertakes|undertake|is determined|are determined|intends|intend|is resolved|are resolved) to (regain|recover|win back|get back|restore|reclaim|retrieve) (this|the|that|its|their|the country's|america's) (measles )?(elimination )?status",
            "(the )?(us )?(cdc|centers for disease control( and prevention)?( cdc)?) (commits|commit)( itself| themselves)? to (regaining|recovering|winning back|getting back|restoring|reclaiming|retrieving) (this|the|that|its|their|the country's|america's) (measles )?(elimination )?status"
          ],
          fautes: [
            {
              re: [
                "commit(s|ted)?( itself| themselves)? to (regain|recover|win back|get back|restore|reclaim|retrieve)\\b",
                "committed to (regain|recover|win back|get back|restore|reclaim|retrieve)\\b"
              ],
              type: "grammaire",
              pts: 1,
              faux: "is committed to regain",
              juste: "is committed to regaining",
              test: "The CDC is committed to regain this status, but it is unclear whether the country will manage to halt the outbreak and then go twelve months in a row without transmission, as PAHO requires.",
              pourquoi: "Dans commit to (s'engager à), to n'est pas la marque de l'infinitif mais une préposition : comme après toute préposition, le verbe qui suit prend la forme en -ing. C'est la même construction que look forward to, be used to.",
              regle: "<b>Commit to / be committed to + V-ing</b> (committed to regaining). Même règle : look forward to, be used to, object to + V-ing.",
              ex: "The government is committed to reducing emissions.",
              exfr: "Le gouvernement s'engage à réduire les émissions.",
              lecon: { n: 23, ancre: "prepositions", titre: "Le gérondif après une préposition" },
              carte: { fr: "s'engager à retrouver", en: "to be committed to regaining (+ V-ing)" }
            },
            {
              re: [
                "(engage|engages|engaged|engaging)( itself| themselves)? (to|in|on) (regain|regaining|recover|recovering|win|winning|get|getting|restore|restoring|reclaim|reclaiming)"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "the CDC engages to regain",
              juste: "the CDC is committed to regaining",
              test: "The CDC engages to regain this status, but it is unclear whether the country will manage to halt the outbreak and then go twelve months in a row without transmission, as PAHO requires.",
              pourquoi: "Faux ami : to engage in, c'est se livrer à une activité (engage in talks), et to engage someone, l'engager, l'embaucher. S'engager à faire (promettre) se dit commit to + V-ing, ou pledge to, vow to + base verbale.",
              regle: "S'engager à : <b>commit to + V-ing</b>, <b>pledge / vow / promise to + base verbale</b>. Engage in : se livrer à.",
              ex: "The minister pledged to cut waiting times.",
              exfr: "Le ministre s'est engagé à réduire les délais d'attente.",
              carte: { fr: "s'engager à (promettre)", en: "to commit to + V-ing, to pledge to" }
            },
            {
              re: [
                "(find|finding|found|refind|refinding) (again |back )?(this|the|that|its|their|the country's|america's) (measles )?(elimination )?status",
                "find (this|the|that|its|their|the country's|america's) (measles )?(elimination )?status again"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "find this status again",
              juste: "regain this status",
              test: "The CDC is committed to finding this status again, but it is unclear whether the country will manage to halt the outbreak and then go twelve months in a row without transmission, as PAHO requires.",
              pourquoi: "« Retrouver » un statut perdu, ce n'est pas le chercher et le trouver : c'est le récupérer. L'anglais dit regain, recover, win back, et find again ne s'emploie que pour un objet égaré.",
              regle: "Retrouver (ce qu'on a perdu : un statut, la confiance, un niveau) : <b>to regain, to recover, to win back</b>.",
              ex: "The party hopes to regain voters' trust.",
              exfr: "Le parti espère retrouver la confiance des électeurs.",
              carte: { fr: "retrouver (un statut perdu)", en: "to regain, to win back" }
            }
          ]
        },
        {
          fr: "mais on ne sait pas si",
          en: "but it is unclear whether",
          pts: 0.5,
          ok: [
            "(it is|it remains|it is still) (unclear|uncertain|not clear|not yet clear|far from clear|far from certain|an open question|doubtful) (whether|if)",
            "(no one|nobody|we do not|experts do not|no one can|nobody can) (yet )?(knows?|know|say|tell) (yet )?(whether|if)",
            "(it remains to be seen|the question is|the question remains|the big question is) (whether|if)"
          ],
          fautes: [
            {
              re: ["(unclear|uncertain|not known|not clear) that"],
              type: "faux-sens",
              pts: 0.5,
              faux: "it is unclear that the country will…",
              juste: "it is unclear whether the country will…",
              test: "The CDC is committed to regaining this status, but it is unclear that the country will manage to halt the outbreak and then go twelve months in a row without transmission, as PAHO requires.",
              pourquoi: "« Si » introduit ici une question qu'on se pose : oui ou non ? Avec that, la phrase affirme qu'on doute fortement du résultat (« il n'est pas évident que »). Pour une interrogation indirecte, l'anglais dit whether ou if.",
              regle: "Interrogation indirecte (oui ou non) : <b>whether / if</b> (it is unclear whether…, nobody knows if…). That introduit une affirmation.",
              ex: "It is unclear whether the talks will resume.",
              exfr: "On ne sait pas si les négociations reprendront.",
              carte: { fr: "on ne sait pas si", en: "it is unclear whether" }
            },
            {
              re: ["it is not (sure|safe) (whether|if|that)", "it is unsure"],
              type: "gallicisme",
              pts: 0.5,
              faux: "it is not sure whether",
              juste: "it is unclear whether",
              test: "The CDC is committed to regaining this status, but it is not sure whether the country will manage to halt the outbreak and then go twelve months in a row without transmission, as PAHO requires.",
              pourquoi: "Sure décrit une personne qui est certaine (I am sure). Avec it, on dit certain ou clear : « it is not sure » est un calque de « ce n'est pas sûr ».",
              regle: "On ne sait pas si : <b>it is unclear whether</b>, <b>it is not certain whether</b>. Sure : pour une personne (I'm not sure whether…).",
              ex: "It is not certain that the plan will work.",
              exfr: "Il n'est pas sûr que le plan fonctionne.",
              carte: { fr: "ce n'est pas sûr que, on ne sait pas si", en: "it is not certain, it is unclear whether" }
            }
          ]
        },
        {
          fr: "le pays parviendra à enrayer l'épidémie,",
          en: "the country will manage to halt the outbreak",
          pts: 1,
          ok: [
            "(the country|the us|the united states|america|the nation|washington|it|the authorities|they|the us authorities|american authorities) (will|can|would|could) (manage to |succeed in |be able to |actually )?(halt|stop|contain|curb|end|bring an end to|put an end to|stem|check|bring under control|get under control|control|stamp out|quell|eradicate|beat) (the|this|these|its) (measles )?(outbreak|epidemic|outbreaks|epidemics|spread|disease|virus)",
            "(the country|the us|the united states|america|the nation|washington|it|the authorities|they|the us authorities|american authorities) (will|can|would|could) (succeed|manage) in (halting|stopping|containing|curbing|ending|stemming|controlling|stamping out|quelling|bringing under control|getting under control|eradicating|beating) (the|this|these|its) (measles )?(outbreak|epidemic|outbreaks|epidemics|spread|disease|virus)",
            "(the country|the us|the united states|america|the nation|washington|it|the authorities|they|the us authorities|american authorities) (manages|succeeds) (to (halt|stop|contain|curb|end|bring an end to|put an end to|stem|check|bring under control|get under control|control|stamp out|quell|eradicate|beat)|in (halting|stopping|containing|curbing|ending|stemming|controlling|stamping out|quelling|bringing under control|getting under control|eradicating|beating)) (the|this|these|its) (measles )?(outbreak|epidemic|outbreaks|epidemics|spread|disease|virus)",
            "(the country|the us|the united states|america|the nation|washington|it|the authorities|they|the us authorities|american authorities) (will|can|would|could) (manage to |succeed in |be able to )?bring (the|this|these|its) (measles )?(outbreak|epidemic|outbreaks|epidemics|spread|disease|virus) (to an end|under control|to a halt)"
          ],
          fautes: [
            {
              re: [
                "(arrive|arrives|arrived|arriving|come|comes|parvene|parvenir) (to|at) ((halt|stop|contain|curb|end|bring an end to|put an end to|stem|check|bring under control|get under control|control|stamp out|quell|eradicate|beat)|(halting|stopping|containing|curbing|ending|stemming|controlling|stamping out|quelling|bringing under control|getting under control|eradicating|beating))\\b"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "will arrive to halt",
              juste: "will manage to halt",
              test: "The CDC is committed to regaining this status, but it is unclear whether the country will arrive to halt the outbreak and then go twelve months in a row without transmission, as PAHO requires.",
              pourquoi: "« Parvenir à », c'est réussir à faire. To arrive ne parle que d'un lieu ou d'un moment (arrive in Paris). L'anglais dit manage to + base verbale ou succeed in + V-ing.",
              regle: "Parvenir à, réussir à : <b>manage to + base verbale</b>, <b>succeed in + V-ing</b>, <b>be able to</b>.",
              ex: "Doctors managed to save the child.",
              exfr: "Les médecins sont parvenus à sauver l'enfant.",
              carte: { fr: "parvenir à faire", en: "to manage to do, to succeed in doing" }
            },
            {
              re: ["succeed(s|ed)? to"],
              type: "grammaire",
              pts: 0.5,
              faux: "will succeed to halt",
              juste: "will succeed in halting / will manage to halt",
              test: "The CDC is committed to regaining this status, but it is unclear whether the country will succeed to halt the outbreak and then go twelve months in a row without transmission, as PAHO requires.",
              pourquoi: "Succeed se construit avec in suivi de la forme en -ing : succeed in halting. « Succeed to », c'est succéder à quelqu'un (succeed to the throne).",
              regle: "<b>Succeed in + V-ing</b> (réussir à). <b>Manage to + base verbale</b>. Succeed to : succéder à.",
              ex: "They succeeded in reaching an agreement.",
              exfr: "Ils sont parvenus à un accord.",
              lecon: { n: 23, ancre: "prepositions", titre: "Le gérondif après une préposition" },
              carte: { fr: "réussir à faire", en: "to succeed in doing (+ V-ing)" }
            },
            {
              re: ["(jam|jams|jammed|jamming|enray|enrays|enrayer) (the|this|its)"],
              type: "faux-sens",
              pts: 0.5,
              faux: "jam the outbreak",
              juste: "halt the outbreak",
              test: "The CDC is committed to regaining this status, but it is unclear whether the country will manage to jam the outbreak and then go twelve months in a row without transmission, as PAHO requires.",
              pourquoi: "Enrayer au sens propre, c'est bloquer un mécanisme (une arme s'enraye : a gun jams). Au sens figuré, arrêter la progression d'une maladie, l'anglais dit halt, stop, contain, curb.",
              regle: "Enrayer (une épidémie, la hausse des prix) : <b>to halt, to curb, to contain, to stop</b>. To jam : (s')enrayer, bloquer.",
              ex: "The government is trying to curb inflation.",
              exfr: "Le gouvernement tente d'enrayer l'inflation.",
              carte: { fr: "enrayer (une épidémie)", en: "to halt, to curb, to contain" }
            }
          ]
        },
        {
          fr: "puis à rester douze mois d'affilée sans transmission,",
          en: "and then go twelve months in a row without transmission",
          pts: 1,
          ok: [
            "(and )?(then )?(go|goes|remain|remains|stay|stays|be|last|keep going|spend) (for )?(a )?(full )?12 (consecutive |straight |successive |full |uninterrupted )?months( in a row| running| straight| on end| in succession| without interruption)? (without|with no|free of|free from|with zero) (any )?(endemic |local |continuous |sustained |ongoing )?(transmission|spread|circulation|cases|measles transmission)( of (the )?(virus|disease|measles))?",
            "(and )?(then )?(remain|remains|stay|stays|be|keep|keeps) (itself )?(free of|free from|without|clear of) (any )?(endemic |local |continuous |sustained |ongoing )?(transmission|spread|circulation|cases|measles transmission)( of (the )?(virus|disease|measles))? (for )?12 (consecutive |straight |successive |full |uninterrupted )?months( in a row| running| straight| on end| in succession| without interruption)?",
            "(and )?(then )?(prevent|prevents|stop|stops|avoid|avoids|block|blocks) (any )?(endemic |local |continuous |sustained |ongoing )?(transmission|spread|circulation|cases|measles transmission)( of (the )?(virus|disease|measles))? (for )?12 (consecutive |straight |successive |full |uninterrupted )?months( in a row| running| straight| on end| in succession| without interruption)?",
            "(and )?(then )?(record|records|see|sees|have|has) no (any )?(endemic |local |continuous |sustained |ongoing )?(transmission|spread|circulation|cases|measles transmission)( of (the )?(virus|disease|measles))? (for )?12 (consecutive |straight |successive |full |uninterrupted )?months( in a row| running| straight| on end| in succession| without interruption)?"
          ],
          fautes: [
            {
              re: [
                "12 (following|followed) months",
                "12 months (followed|of affiliation|affiliated|d affilee|affilee|of affilee|of rank)",
                "(of|in) affilee"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "twelve months of affiliation",
              juste: "twelve months in a row",
              test: "The CDC is committed to regaining this status, but it is unclear whether the country will manage to halt the outbreak and then go twelve months of affiliation without transmission, as PAHO requires.",
              pourquoi: "« D'affilée » veut dire sans interruption, l'un après l'autre. « Affiliation », c'est l'appartenance à une organisation : rien à voir. L'anglais dit in a row, consecutive, straight, running.",
              regle: "D'affilée : <b>in a row</b> (twelve months in a row), <b>consecutive</b> (twelve consecutive months), <b>straight</b>.",
              ex: "The team has won five games in a row.",
              exfr: "L'équipe a gagné cinq matchs d'affilée.",
              carte: { fr: "d'affilée", en: "in a row, consecutive" }
            },
            {
              re: [
                "during 12 (consecutive |straight |successive |full |uninterrupted )?months( in a row| running| straight| on end| in succession| without interruption)?"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "during twelve months",
              juste: "for twelve months",
              test: "The CDC is committed to regaining this status, but it is unclear whether the country will manage to halt the outbreak and then remain without transmission during twelve months in a row, as PAHO requires.",
              pourquoi: "« Pendant » suivi d'une durée chiffrée se traduit par for. During s'emploie devant un nom qui désigne une période ou un événement (during the winter, during the outbreak), jamais devant un nombre.",
              regle: "<b>For</b> + durée chiffrée (for twelve months). <b>During</b> + nom (during the summer). <b>While</b> + proposition.",
              ex: "Schools closed for two weeks during the outbreak.",
              exfr: "Les écoles ont fermé pendant deux semaines pendant l'épidémie.",
              lecon: { n: 9, ancre: "cas-speciaux", titre: "During, for, while" },
              carte: { fr: "pendant douze mois", en: "for twelve months (during + nom)" }
            },
            {
              re: ["months in row\\b", "months in the row\\b"],
              type: "grammaire",
              pts: 0.25,
              faux: "twelve months in row",
              juste: "twelve months in a row",
              test: "The CDC is committed to regaining this status, but it is unclear whether the country will manage to halt the outbreak and then go twelve months in row without transmission, as PAHO requires.",
              pourquoi: "L'expression figée est in a row, avec l'article a : « in row » ou « in the row » ne se disent pas dans ce sens.",
              regle: "D'affilée : <b>in a row</b> (three days in a row).",
              ex: "It rained for ten days in a row.",
              exfr: "Il a plu dix jours d'affilée.",
              carte: { fr: "d'affilée", en: "in a row (avec a)" }
            }
          ]
        },
        {
          fr: "comme l'exige l'OPS.",
          en: "as PAHO requires",
          pts: 0.5,
          ok: [
            "as ((the )?(pan ?american health organization( paho)?|paho)|the organization|it|they) (requires|demands|stipulates|insists|rules|has required|requires it|demand|require)",
            "as required by (the )?((the )?(pan ?american health organization( paho)?|paho)|its rules|the organization|paho rules|paho's rules|pan ?american health organization rules)",
            "(in line with|in accordance with|according to|under|per|as per) (the )?(pan ?american health organization( paho)?|paho)('s)? (rules|requirements|criteria|standards)",
            "(which is what|which|something) (the )?(pan ?american health organization( paho)?|paho) (requires|demands)",
            "(the condition|the requirement|a condition|a requirement|the rule) (set|laid down|imposed|demanded|required) by (the )?(pan ?american health organization( paho)?|paho)",
            "as (the )?(pan ?american health organization( paho)?|paho)('s)? (rules|criteria|requirements) (require|demand|stipulate)",
            "(a condition|a requirement|the condition|the requirement) (set|laid down|imposed) by (the )?(pan ?american health organization( paho)?|paho)"
          ],
          fautes: [
            {
              re: [
                "like (the )?(pan ?american health organization( paho)?|paho) (requires|demands|wants|asks|exige|exiges|stipulates|requires it|demands it)",
                "like (the organization|it) (requires|demands)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "like PAHO requires",
              juste: "as PAHO requires",
              test: "The CDC is committed to regaining this status, but it is unclear whether the country will manage to halt the outbreak and then go twelve months in a row without transmission, like PAHO requires.",
              pourquoi: "« Comme » suivi d'un sujet et d'un verbe se traduit par as dans l'anglais soigné. Like est une préposition : il se place devant un nom seul (like France, like a child), et « like PAHO requires » passe pour du langage relâché.",
              regle: "<b>As</b> + sujet + verbe (as PAHO requires, as expected). <b>Like</b> + nom (like Canada, like many countries).",
              ex: "As the report shows, cases are rising.",
              exfr: "Comme le montre le rapport, les cas augmentent.",
              carte: { fr: "comme l'exige l'OPS", en: "as PAHO requires (as + proposition)" }
            },
            {
              re: ["(exacts|exacted|exige|exiges|exiged|exigates)\\b"],
              type: "barbarisme",
              pts: 0.5,
              faux: "as PAHO exiges",
              juste: "as PAHO requires",
              test: "The CDC is committed to regaining this status, but it is unclear whether the country will manage to halt the outbreak and then go twelve months in a row without transmission, as PAHO exiges.",
              pourquoi: "« Exiger » n'a pas de calque en anglais : « to exige » n'existe pas, et to exact (an exigence) est rare et veut dire extorquer. On dit to require, to demand.",
              regle: "Exiger : <b>to require</b> (une règle, une condition), <b>to demand</b> (une personne, avec force).",
              ex: "The law requires a two-thirds majority.",
              exfr: "La loi exige une majorité des deux tiers.",
              carte: { fr: "exiger (une condition)", en: "to require, to demand" }
            }
          ]
        }
      ]
    }
  ]
};
