/* Thème du jour d'anglais, 23 novembre 2026 (voir CLAUDE.md, « Thème du jour »).
   ((…)) = mot d'une carte du paquet d'anglais (cartes, dans l'ordre) ; [[…]] = mot nouveau (aides, dans l'ordre).
   Motifs `ok` et `re` : expressions régulières en minuscules, sans accents, nombres en chiffres, orthographe
   américaine, jamais de tiret (flashcards/theme-correcteur.js). Faits : Office central de statistique irlandais (CSO,
   « Data Centres Metered Electricity Consumption 2025 », 7 juillet 2026 : 23 % en 2025 contre 5 % en 2015, 7 663 GWh,
   +10 % sur un an, ménages urbains 18 %), cité dans actualites/en/articles/irlande-manifestation-data-centers-2026.html
   (manifestation du 7 novembre à Dublin, prix de gros doublés en douze mois selon Friends of the Earth Ireland, aucun
   moratoire national prévu, Peter Burke : « opportunité stratégique ») ; EirGrid, Data Centre Constrained Area
   Overview, mai 2026 (région de Dublin saturée pour les grands data centers). */
window.ECG_THEMES_DONNEES = window.ECG_THEMES_DONNEES || {};
window.ECG_THEMES_DONNEES["anglais/2026-11-23"] = {
  langue: "anglais",
  date: "2026-11-23",
  titre: "Irlande : les data centers engloutissent près d'un quart de l'électricité du pays",
  phrases: [
    {
      fr: "D'après les chiffres publiés en juillet par [[l'Office central de statistique]], les ((centres de données)) ont ((représenté)) 23 % de l'électricité consommée en Irlande en 2025, contre 5 % en 2015.",
      cartes: [
        { id: "c604baeb7d", fr: "un centre de données, un data center", en: "a data centre", re: "data centers?" },
        { id: "6826551a9d", fr: "représenter (une part)", en: "to account for", re: "account(s|ed|ing)? for" }
      ],
      aides: [{ fr: "l'Office central de statistique (Irlande)", en: "the Central Statistics Office (CSO)" }],
      proposition: "According to figures released in July by the Central Statistics Office, data centres accounted for 23% of the electricity consumed in Ireland in 2025, compared with 5% in 2015.",
      autres: [
        "According to data published by the CSO in July, Ireland's data centres made up 23% of the country's electricity consumption in 2025, up from 5% in 2015."
      ],
      tests: [
        "Data centres represented 23% of all electricity used in Ireland in 2025, against only 5% in 2015, according to figures that the Central Statistics Office published in July.",
        "Figures published in July by the Central Statistics Office show that data centres consumed 23% of Ireland's electricity in 2025, compared to 5% in 2015."
      ],
      morceaux: [
        {
          fr: "D'après les chiffres publiés en juillet par l'Office central de statistique",
          en: "According to figures released in July by the Central Statistics Office",
          pts: 1,
          ok: [
            "according to (the )?(official |latest |new )?(figures|data|statistics|numbers) (released|published|issued|made public|put out|unveiled) in july by (the )?(irish |ireland's )?(central statistics office|central statistical office|cso|national statistics office|irish statistics office|statistics office|official statistics agency)",
            "according to (the )?(official |latest |new )?(figures|data|statistics|numbers) (released|published|issued|made public|put out|unveiled) by (the )?(irish |ireland's )?(central statistics office|central statistical office|cso|national statistics office|irish statistics office|statistics office|official statistics agency) in july",
            "according to (the )?(official |latest |new )?(figures|data|statistics|numbers) (that |which )?(the )?(irish |ireland's )?(central statistics office|central statistical office|cso|national statistics office|irish statistics office|statistics office|official statistics agency) (released|published|issued|made public|put out|unveiled) in july",
            "according to (the )?(irish |ireland's )?(central statistics office|cso)('s)? (official |latest |new )?(figures|data|statistics|numbers) ((released|published|issued|made public|put out|unveiled) )?in july",
            "(the )?(official |latest |new )?(figures|data|statistics|numbers) (released|published|issued|made public|put out|unveiled) (in july by (the )?(irish |ireland's )?(central statistics office|central statistical office|cso|national statistics office|irish statistics office|statistics office|official statistics agency)|by (the )?(irish |ireland's )?(central statistics office|central statistical office|cso|national statistics office|irish statistics office|statistics office|official statistics agency) in july) (show|showed|reveal|revealed|indicate|indicated|suggest|confirm|confirmed)( that)?",
            "(the )?(irish |ireland's )?(central statistics office|cso)('s)? (official |latest |new )?(figures|data|statistics|numbers) (released|published|issued|made public|put out|unveiled) in july (show|showed|reveal|revealed|indicate|indicated|confirm|confirmed)( that)?"
          ],
          fautes: [
            {
              re: [
                "(released|published|issued|made public|put out|unveiled) on july",
                "(released|published|issued|made public|put out|unveiled) at july"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "published on July",
              juste: "published in July",
              test: "According to figures released on July by the Central Statistics Office, data centres accounted for 23% of the electricity consumed in Ireland in 2025, compared with 5% in 2015.",
              pourquoi: "On ne s'emploie que pour un jour précis (on 7 November, on Monday). Juillet est un mois entier, une période : « on July » sonne comme une date à laquelle il manque le jour.",
              regle: "<b>In</b> + mois, année, saison (in July, in 2025). <b>On</b> + jour ou date (on 7 July). <b>At</b> + heure (at noon).",
              ex: "The report came out in July, on 7 July.",
              exfr: "Le rapport est sorti en juillet, le 7 juillet.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "en juillet (mois)", en: "in July (in + mois)" }
            },
            {
              re: [
                "(after|following) (the )?(official |latest |new )?(figures|data|statistics|numbers) (released|published|issued|made public|put out|unveiled)"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "after the figures published",
              juste: "according to the figures published",
              test: "After the figures released in July by the Central Statistics Office, data centres accounted for 23% of the electricity consumed in Ireland in 2025, compared with 5% in 2015.",
              pourquoi: "« D'après » ne veut pas dire « après » : il introduit une source. « After the figures… » se lit « après la publication des chiffres, les data centers ont représenté 23 % », comme si les chiffres avaient provoqué la hausse.",
              regle: "Citer une source : <b>according to</b> (according to the CSO, according to figures released in July). After, following : après, à la suite de.",
              ex: "According to the BBC, the talks have failed.",
              exfr: "D'après la BBC, les négociations ont échoué.",
              carte: { fr: "d'après (une source)", en: "according to (after = après)" }
            }
          ]
        },
        {
          fr: "les centres de données ont représenté 23 %",
          en: "data centres accounted for 23%",
          pts: 1.5,
          ok: [
            "(data centers|they|these facilities|the country's data centers|ireland's data centers|the data centers|irish data centers) (alone )?(accounted for|represented|made up|consumed|used|took up|absorbed|gobbled up|swallowed up|ate up) (just under |nearly |almost |close to |some )?23 percent",
            "23 percent of (the |all )?(electricity|power)( consumed| used)?( in ireland)?( in 2025)? (was|went to) (consumed |used |accounted for |absorbed )?(by )?(the )?data centers"
          ],
          fautes: [
            {
              re: [
                "(data centers|they|the data centers|ireland's data centers|these facilities) have (accounted for|represented|made up|consumed|used|taken up|absorbed) (just under |nearly |almost )?23 percent"
              ],
              type: "grammaire",
              pts: 1,
              faux: "data centres have accounted for 23% in 2025",
              juste: "data centres accounted for 23% in 2025",
              test: "According to figures released in July by the Central Statistics Office, data centres have accounted for 23% of the electricity consumed in Ireland in 2025, compared with 5% in 2015.",
              pourquoi: "Le passé composé français (ont représenté) se traduit souvent par un present perfect, mais pas ici : l'année 2025 est terminée et elle est nommée dans la phrase. Le present perfect relie le passé au présent ; avec une date révolue, il est faux, et c'est une faute que le correcteur ne laisse jamais passer.",
              regle: "Moment passé précis et nommé (in 2025, last year, ago, in July) : <b>prétérit</b> (accounted for). Present perfect seulement sans date révolue (has risen since 2015, has already doubled).",
              ex: "Exports fell in 2024 but have risen since January.",
              exfr: "Les exportations ont baissé en 2024 mais augmentent depuis janvier.",
              lecon: { n: 14, ancre: "comparaison", titre: "Present perfect ou prétérit" },
              carte: { fr: "ont représenté 23 % en 2025", en: "accounted for 23% in 2025 (prétérit + date)" }
            },
            {
              re: ["(accounted|accounts|account|accounting) (just under |nearly |almost )?23 percent"],
              type: "grammaire",
              pts: 0.5,
              faux: "accounted 23%",
              juste: "accounted for 23%",
              test: "According to figures released in July by the Central Statistics Office, data centres accounted 23% of the electricity consumed in Ireland in 2025, compared with 5% in 2015.",
              pourquoi: "« Account for » est un verbe à particule : sans for, le verbe change de sens (to account = considérer, dans une langue vieillie) et la phrase devient bancale. La préposition fait partie du verbe, comme dans rely on ou call for.",
              regle: "Représenter (une part) : <b>to account for</b> + pourcentage (account for 23%, account for a quarter of). Synonymes : to make up, to represent.",
              ex: "Exports account for 30% of GDP.",
              exfr: "Les exportations représentent 30 % du PIB.",
              carte: { fr: "représenter (une part)", en: "to account for (+ for)" }
            },
            {
              re: ["cent(er|re)s of (data|datas)"],
              type: "gallicisme",
              pts: 0.5,
              faux: "centres of data",
              juste: "data centres",
              test: "According to figures released in July by the Central Statistics Office, centres of data accounted for 23% of the electricity consumed in Ireland in 2025, compared with 5% in 2015.",
              pourquoi: "Le français relie deux noms par « de » (centre de données). L'anglais place le nom qui précise devant l'autre, sans préposition : data centre. « Centres of data » ne se dit pas.",
              regle: "<b>Nom + nom</b> : le premier précise le second (data centre, power grid, oil prices) et reste au singulier.",
              ex: "Energy prices have soared.",
              exfr: "Les prix de l'énergie ont flambé.",
              carte: { fr: "un centre de données", en: "a data centre (nom + nom)" }
            }
          ]
        },
        {
          fr: "de l'électricité consommée en Irlande en 2025",
          en: "of the electricity consumed in Ireland in 2025",
          pts: 1,
          ok: [
            "of (all )?(the )?(electricity|power)( that was| which was)? (consumed|used) (in|across) (ireland|the country)( in 2025)?",
            "of (ireland's|irish|the country's|the nation's) (total |national |metered )?(electricity|power)( consumption| use| usage| demand| supply)?( in 2025)?",
            "of (total |all |national )?(electricity|power) (consumption|use|usage|demand) in ireland( in 2025)?",
            "of (all )?(the )?(electricity|power) (consumed|used)( in 2025)? in ireland"
          ],
          fautes: [
            {
              re: ["consummated", "consummation"],
              type: "faux-sens",
              pts: 0.5,
              faux: "the electricity consummated",
              juste: "the electricity consumed",
              test: "According to figures released in July by the Central Statistics Office, data centres accounted for 23% of the electricity consummated in Ireland in 2025, compared with 5% in 2015.",
              pourquoi: "« To consummate » existe, mais il veut dire mener à son terme, et surtout consommer un mariage. Pour l'énergie, l'eau ou un produit, on dit consume (consumed, consumption).",
              regle: "Consommer (énergie, produit) : <b>to consume</b>, la consommation : <b>consumption</b>. To consummate : consommer un mariage, conclure.",
              ex: "Households consume less gas than last year.",
              exfr: "Les ménages consomment moins de gaz que l'an dernier.",
              carte: { fr: "consommer (de l'électricité)", en: "to consume (consummate = consommer un mariage)" }
            },
            {
              re: ["in the ireland"],
              type: "grammaire",
              pts: 0.25,
              faux: "in the Ireland",
              juste: "in Ireland",
              test: "According to figures released in July by the Central Statistics Office, data centres accounted for 23% of the electricity consumed in the Ireland in 2025, compared with 5% in 2015.",
              pourquoi: "Les noms de pays ne prennent pas d'article en anglais (Ireland, France, Brazil), sauf ceux qui contiennent un nom commun (the United Kingdom) ou sont au pluriel (the Netherlands).",
              regle: "<b>Ireland, France, Spain</b> : sans article. <b>The</b> United States, the United Kingdom, the Philippines.",
              ex: "Ireland has a young population.",
              exfr: "L'Irlande a une population jeune.",
              lecon: { n: 4, ancre: "zero-article", titre: "Le zéro article" },
              carte: { fr: "l'Irlande", en: "Ireland (sans article)" }
            }
          ]
        },
        {
          fr: "contre 5 % en 2015",
          en: "compared with 5% in 2015",
          pts: 0.5,
          ok: [
            "(compared (with|to)|up from|versus|vs|against|as against|from|as opposed to|in comparison with|in comparison to) (only |just |a mere )?5 percent (in|for|back in) 2015",
            "(while|whereas|when) (the figure|the share|it|they|this share|that share) (was|stood at|accounted for|represented|made up|amounted to) (only |just |a mere )?5 percent in 2015",
            "(and|but) (only |just |a mere )?5 percent in 2015"
          ],
          fautes: [
            {
              re: ["in comparison of 5", "contrary to (only )?5"],
              type: "gallicisme",
              pts: 0.25,
              faux: "in comparison of 5%",
              juste: "compared with 5%",
              test: "According to figures released in July by the Central Statistics Office, data centres accounted for 23% of the electricity consumed in Ireland in 2025, in comparison of 5% in 2015.",
              pourquoi: "« Contre » sert ici à comparer deux chiffres. L'anglais dit compared with (ou up from quand le chiffre a augmenté). « In comparison of » est un calque, et « contrary to » veut dire « contrairement à ».",
              regle: "Comparer deux chiffres : <b>compared with / compared to</b>, <b>up from</b> (hausse), <b>down from</b> (baisse).",
              ex: "Unemployment is at 4%, down from 6% last year.",
              exfr: "Le chômage est à 4 %, contre 6 % l'an dernier.",
              carte: { fr: "contre 5 % (comparaison)", en: "compared with 5%, up from 5%" }
            }
          ]
        }
      ]
    },
    {
      fr: "Ils consomment désormais plus d'électricité que tous les ((ménages)) des villes [[réunis]], et leur consommation, ((en hausse de 10 % sur un an)), ne cesse de grimper.",
      cartes: [
        { id: "21fde8a03a", fr: "un ménage, un foyer", en: "a household", re: "households?" },
        {
          id: "7d45b0ea7c",
          fr: "une hausse sur un an",
          en: "a rise on a year earlier",
          re: "(on|from) (a year earlier|the previous year|the year before)|year on year"
        }
      ],
      aides: [{ fr: "réunis (additionnés)", en: "combined" }],
      proposition: "They now use more electricity than all urban households combined, and their consumption, up 10% on a year earlier, keeps rising.",
      autres: [
        "Data centres now consume more power than all the country's urban households put together, and their demand, which rose by 10% on the previous year, is still growing."
      ],
      tests: [
        "Today they use more electricity than all homes in Irish cities combined, and their consumption, a 10% rise on a year earlier, never stops growing.",
        "They are now using more power than all city households combined, and their consumption, which has increased by 10% over the past year, continues to rise."
      ],
      morceaux: [
        {
          fr: "Ils consomment désormais plus d'électricité que",
          en: "They now use more electricity than",
          pts: 1.5,
          ok: [
            "(they|data centers|these centers|these facilities|data centers alone|they alone) (now |today |currently |already )?(use|consume|take|absorb|draw|eat up|gobble up|swallow up|need) (even |far |much )?more (electricity|power|energy) than",
            "(now|today|these days),? (they|data centers|these facilities) (use|consume|take|absorb|draw|eat up|gobble up) (even |far |much )?more (electricity|power|energy) than",
            "(they|data centers) (are now|now are|are currently|are already) (using|consuming|taking|absorbing|drawing) (even |far |much )?more (electricity|power|energy) than",
            "(their|data centers') (electricity |power |energy )?(consumption|use|usage|demand) (now )?(exceeds|is higher than|is greater than|surpasses|outstrips|tops|has overtaken|now exceeds|is now higher than|is now greater than) (that of)?"
          ],
          fautes: [
            {
              re: ["more (electricity|power|energy) (that|as) (all|the|every|of)"],
              type: "grammaire",
              pts: 0.5,
              faux: "more electricity that",
              juste: "more electricity than",
              test: "They now use more electricity that all urban households combined, and their consumption, up 10% on a year earlier, keeps rising.",
              pourquoi: "Le français dit « plus… que » ; l'anglais distingue deux mots. Than introduit le second terme d'une comparaison, that est un relatif ou un démonstratif. Avec that, la phrase se lit « plus d'électricité qui… » et ne compare plus rien.",
              regle: "Comparatif : <b>more + nom + than</b> (more electricity than), <b>adjectif-er + than</b> (bigger than). As s'emploie pour l'égalité : as much as.",
              ex: "Solar panels now produce more power than coal plants.",
              exfr: "Les panneaux solaires produisent désormais plus d'électricité que les centrales à charbon.",
              lecon: { n: 22, ancre: "comp-court", titre: "Le comparatif de supériorité" },
              carte: { fr: "plus de… que", en: "more… than" }
            },
            {
              re: ["(use|consume|take|absorb|draw) (now|today|currently) more"],
              type: "grammaire",
              pts: 0.5,
              faux: "they use now more electricity",
              juste: "they now use more electricity",
              test: "They use now more electricity than all urban households combined, and their consumption, up 10% on a year earlier, keeps rising.",
              pourquoi: "En français, l'adverbe se glisse après le verbe (ils consomment désormais plus). En anglais, on ne sépare jamais le verbe de son complément d'objet : « use now more electricity » choque immédiatement un lecteur anglophone.",
              regle: "Jamais d'adverbe entre le verbe et son objet. <b>Now</b> se place avant le verbe (they now use) ou en fin de proposition (they use more electricity now).",
              ex: "The firm now employs 500 people.",
              exfr: "L'entreprise emploie désormais 500 personnes.",
              lecon: { n: 8, ancre: "svompt", titre: "L'ordre de base de la phrase" },
              carte: { fr: "ils consomment désormais", en: "they now use (now avant le verbe)" }
            },
            {
              re: ["more of (electricity|power|energy)"],
              type: "grammaire",
              pts: 0.25,
              faux: "more of electricity",
              juste: "more electricity",
              test: "They now use more of electricity than all urban households combined, and their consumption, up 10% on a year earlier, keeps rising.",
              pourquoi: "Le « de » de « plus d'électricité » ne se traduit pas. More se place directement devant le nom ; more of n'existe que devant un déterminant ou un pronom (more of the electricity, more of it).",
              regle: "<b>More + nom</b> (more electricity, more jobs). More of + the, this, it, them.",
              ex: "We need more water.",
              exfr: "Il nous faut plus d'eau.",
              carte: { fr: "plus d'électricité", en: "more electricity (sans of)" }
            }
          ]
        },
        {
          fr: "que tous les ménages des villes réunis",
          en: "all urban households combined",
          pts: 1,
          ok: [
            "(all|every) (of )?(the )?(country's |ireland's |irish |the country's )?(urban|city|town) (households|homes|dwellers|residents|consumers)( in ireland| in the country)? (combined|put together|taken together|together)",
            "all (of )?(the )?(households|homes) in (the )?(irish |the country's |ireland's )?(cities|towns|urban areas)( of ireland| in ireland)? (combined|put together|taken together|together)",
            "(urban|city) (households|homes) (combined|put together|taken together)",
            "every (urban|city|town) (household|home) (combined|put together|taken together)"
          ],
          fautes: [
            {
              re: ["(households|homes|cities|towns|families) (reunited|reunified|reunite|reunited together)"],
              type: "faux-sens",
              pts: 0.5,
              faux: "households reunited",
              juste: "households combined",
              test: "They now use more electricity than all urban households reunited, and their consumption, up 10% on a year earlier, keeps rising.",
              pourquoi: "« To reunite », c'est réunir des gens qui avaient été séparés (a family reunited after the war). Ici, « réunis » veut dire « additionnés » : on fait la somme de la consommation de tous les ménages.",
              regle: "Réunis (additionnés) : <b>combined</b>, <b>put together</b> (more than all its rivals combined). To reunite : réunir après une séparation.",
              ex: "The firm earns more than its three rivals combined.",
              exfr: "L'entreprise gagne plus que ses trois concurrents réunis.",
              carte: { fr: "réunis (additionnés)", en: "combined, put together" }
            },
            {
              re: ["(households|homes) (urban|of the cities|of cities|of the towns)"],
              type: "grammaire",
              pts: 0.5,
              faux: "households urban / households of the cities",
              juste: "urban households",
              test: "They now use more electricity than all households of the cities combined, and their consumption, up 10% on a year earlier, keeps rising.",
              pourquoi: "En anglais, ce qui précise un nom se place devant lui : adjectif (urban households) ou nom (city households). « Households of the cities » est un calque du français, et « households urban » met l'adjectif à la mauvaise place.",
              regle: "Adjectif ou nom qui précise : <b>avant le nom</b> (urban households, city centres, the Irish economy).",
              ex: "Rural areas have lost many shops.",
              exfr: "Les zones rurales ont perdu beaucoup de commerces.",
              lecon: { n: 8, ancre: "adjectif-position", titre: "La place de l'adjectif épithète" },
              carte: { fr: "les ménages des villes", en: "urban households, city households" }
            }
          ]
        },
        {
          fr: "et leur consommation, en hausse de 10 % sur un an,",
          en: "and their consumption, up 10% on a year earlier,",
          pts: 1,
          ok: [
            "(and )?(their|data centers') (electricity |power |energy )?(consumption|use|usage|demand),? (up|rising|having risen|which rose|which has risen|which increased|which has increased|which grew|which has grown|having grown|growing|increasing|an increase of|a rise of|after a rise of|after an increase of|after rising|after growing|having increased|which went up|which has gone up) (by )?10 percent ((on|from|compared with|compared to|over) (a year earlier|the previous year|the year before|last year|2024)|year on year|in (a|1) year|in 12 months|over (a|1|the past|the last) year|within (a|1) year)",
            "(and )?(their|data centers') (electricity |power |energy )?(consumption|use|usage|demand),? (with |after |following |showing |marking )?(a|an) 10 percent (rise|increase|jump|hike|growth) (((on|from|compared with|compared to|over) (a year earlier|the previous year|the year before|last year|2024)|year on year|in (a|1) year|in 12 months|over (a|1|the past|the last) year|within (a|1) year)|on (a year earlier|the previous year))",
            "(and )?(their|data centers') (electricity |power |energy )?(consumption|use|usage|demand),? (which is |now )?10 percent (higher|up) (than|on) (a year earlier|the previous year|last year|in 2024)"
          ],
          fautes: [
            {
              re: ["(in|on) (rise|increase|augmentation|hike) (of|by) 10"],
              type: "gallicisme",
              pts: 0.5,
              faux: "in rise of 10%",
              juste: "up 10%",
              test: "They now use more electricity than all urban households combined, and their consumption, in rise of 10% on a year earlier, keeps rising.",
              pourquoi: "« En hausse de » est une tournure française. L'anglais de presse dit simplement up 10% (ou down 10% pour une baisse), ou bien a 10% rise, which rose by 10%.",
              regle: "En hausse de / en baisse de : <b>up / down</b> + chiffre (up 10% on a year earlier). Ou : <b>a 10% rise</b>, <b>which rose by 10%</b>.",
              ex: "Sales were up 5% on a year earlier.",
              exfr: "Les ventes étaient en hausse de 5 % sur un an.",
              carte: { fr: "en hausse de 10 % sur un an", en: "up 10% on a year earlier" }
            },
            {
              re: ["(and )?(his|its) (electricity |power )?(consumption|use|usage|demand)"],
              type: "grammaire",
              pts: 0.5,
              faux: "his consumption",
              juste: "their consumption",
              test: "They now use more electricity than all urban households combined, and his consumption, up 10% on a year earlier, keeps rising.",
              pourquoi: "« Leur » renvoie aux data centers, au pluriel. Le possessif anglais s'accorde avec le possesseur : pluriel, donc their. His renverrait à un homme, its à une seule chose.",
              regle: "Possessif = <b>possesseur</b> : his (un homme), her (une femme), its (une chose), <b>their</b> (plusieurs).",
              ex: "Companies must publish their accounts.",
              exfr: "Les entreprises doivent publier leurs comptes.",
              lecon: { n: 3, ancre: "possessifs", titre: "Adjectifs et pronoms possessifs" },
              carte: { fr: "leur consommation (des centres)", en: "their consumption" }
            }
          ]
        },
        {
          fr: "ne cesse de grimper",
          en: "keeps rising",
          pts: 0.5,
          ok: [
            "(keeps|is still|continues|is continuing) (on )?(rising|climbing|growing|increasing|going up|to rise|to climb|to grow|to increase|to go up)",
            "(never stops|does not stop|has not stopped|is not stopping|shows no sign of (stopping|slowing)|shows no signs of (stopping|slowing)|shows no sign of slowing down|shows no signs of slowing down)( (rising|growing|climbing|increasing|going up))?",
            "(is|has been|keeps) (rising|growing|climbing|increasing|going up) (steadily|relentlessly|continuously|constantly|non ?stop|every year|year after year|unabated|inexorably)"
          ],
          fautes: [
            {
              re: ["(never stops|does not stop|do not stop|has not stopped|stops not|is not stopping) to (rise|grow|climb|increase|go up)"],
              type: "contresens",
              pts: 0.5,
              faux: "never stops to rise",
              juste: "never stops rising",
              test: "They now use more electricity than all urban households combined, and their consumption, up 10% on a year earlier, never stops to rise.",
              pourquoi: "Stop change de sens selon ce qui le suit. Stop + V-ing : arrêter de faire. Stop + to : s'arrêter pour faire autre chose. « Never stops to rise » veut dire « ne s'arrête jamais pour monter » : la phrase n'a plus de sens.",
              regle: "<b>Stop + V-ing</b> : arrêter de (stop rising). <b>Stop + to + base</b> : s'arrêter pour (she stopped to check the figures). Ne cesser de : <b>keep + V-ing</b>.",
              ex: "Prices never stopped rising last year.",
              exfr: "Les prix n'ont pas cessé d'augmenter l'an dernier.",
              lecon: { n: 23, ancre: "gerondif-infinitif", titre: "Gérondif ou infinitif : les verbes qui changent de sens" },
              carte: { fr: "ne cesse de grimper", en: "keeps rising, never stops rising" }
            },
            {
              re: ["(keeps|keep|kept) to (rise|grow|climb|increase|go up)"],
              type: "grammaire",
              pts: 0.5,
              faux: "keeps to rise",
              juste: "keeps rising",
              test: "They now use more electricity than all urban households combined, and their consumption, up 10% on a year earlier, keeps to rise.",
              pourquoi: "Keep (continuer à) se construit toujours avec un gérondif. « Keep to » existe, mais il veut dire « s'en tenir à » (keep to the rules) : « keeps to rise » ne se dit pas.",
              regle: "<b>Keep + V-ing</b> : continuer à (keep rising, keep growing). Continue accepte les deux : continue to rise, continue rising.",
              ex: "Prices kept rising all year.",
              exfr: "Les prix ont continué à augmenter toute l'année.",
              lecon: { n: 23, ancre: "verbes-gerondif", titre: "Les verbes suivis du gérondif" },
              carte: { fr: "ne cesser de, continuer à", en: "keep + V-ing" }
            }
          ]
        }
      ]
    },
    {
      fr: "Le 7 novembre, à Dublin, des centaines de ((manifestants)) ont ((réclamé)) un ((moratoire)) sur les nouveaux projets, affirmant que les ((prix de gros)) de l'électricité avaient doublé en un an.",
      cartes: [
        { id: "83ced2984c", fr: "un manifestant", en: "a protester", re: "protesters?" },
        { id: "6790d8d8c7", fr: "réclamer, appeler à", en: "to call for", re: "call(s|ed|ing)? for" },
        { id: "6f6a732897", fr: "un moratoire", en: "a moratorium", re: "moratori(um|a|ums)" },
        { id: "9a9512d4ab", fr: "un prix de gros", en: "a wholesale price", re: "wholesale( electricity| power| energy)? prices?" }
      ],
      aides: [],
      proposition: "On 7 November in Dublin, hundreds of protesters called for a moratorium on new projects, claiming that wholesale electricity prices had doubled in a year.",
      autres: [
        "In Dublin on 7 November, hundreds of demonstrators demanded a halt on new data centre projects, arguing that the wholesale price of electricity had doubled within a year."
      ],
      tests: [
        "On 7 November, hundreds of people marched in Dublin to demand a moratorium on new projects, saying that wholesale power prices had doubled in twelve months.",
        "Hundreds of protesters gathered in Dublin on 7 November and called for a moratorium on any new projects, as they claimed that wholesale electricity prices had doubled over the past year."
      ],
      morceaux: [
        {
          fr: "Le 7 novembre, à Dublin",
          en: "On 7 November in Dublin",
          pts: 0.5,
          ok: [
            "on (saturday )?(november 7(th)?|7(th)? (of )?november|the 7(th)? of november),? in dublin",
            "in dublin,? on (saturday )?(november 7(th)?|7(th)? (of )?november|the 7(th)? of november)",
            "on (saturday )?(november 7(th)?|7(th)? (of )?november|the 7(th)? of november),? (several |a few |many )?hundreds of (\\w+ ){0,2}in dublin",
            "(gathered|marched|rallied|protested|took to the streets|demonstrated) in dublin on (saturday )?(november 7(th)?|7(th)? (of )?november|the 7(th)? of november)"
          ],
          fautes: [
            {
              re: ["^the 7(th)? (of )?november", "^the november 7(th)?", "in dublin the 7(th)? (of )?november"],
              type: "grammaire",
              pts: 0.25,
              faux: "the 7 November",
              juste: "on 7 November",
              test: "The 7 November in Dublin, hundreds of protesters called for a moratorium on new projects, claiming that wholesale electricity prices had doubled in a year.",
              pourquoi: "Le français dit « le 7 novembre » sans préposition. En anglais, une date est toujours introduite par on : sans elle, la date reste en l'air au début de la phrase.",
              regle: "<b>On</b> + jour ou date (on 7 November, on Saturday). <b>In</b> + mois, année (in November, in 2026).",
              ex: "The march took place on 7 November.",
              exfr: "La marche a eu lieu le 7 novembre.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le 7 novembre", en: "on 7 November (on + date)" }
            },
            {
              re: ["in (7(th)? (of )?november|november 7(th)?)"],
              type: "grammaire",
              pts: 0.25,
              faux: "in 7 November",
              juste: "on 7 November",
              test: "In 7 November in Dublin, hundreds of protesters called for a moratorium on new projects, claiming that wholesale electricity prices had doubled in a year.",
              pourquoi: "In s'emploie pour un mois entier (in November). Dès que le jour est précisé, c'est un point du calendrier : on.",
              regle: "<b>On</b> + date (on 7 November). <b>In</b> + mois, année, saison.",
              ex: "She was born in May, on 12 May.",
              exfr: "Elle est née en mai, le 12 mai.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le 7 novembre", en: "on 7 November (on + date)" }
            }
          ]
        },
        {
          fr: "des centaines de manifestants",
          en: "hundreds of protesters",
          pts: 0.5,
          ok: [
            "(several |many |a few )?hundreds of (protesters|demonstrators|marchers|campaigners|activists|people|residents|campaigners and residents)",
            "(several|a few|some) hundred (protesters|demonstrators|marchers|campaigners|activists|people)"
          ],
          fautes: [
            {
              re: ["centuries of"],
              type: "contresens",
              pts: 0.5,
              faux: "centuries of protesters",
              juste: "hundreds of protesters",
              test: "On 7 November in Dublin, centuries of protesters called for a moratorium on new projects, claiming that wholesale electricity prices had doubled in a year.",
              pourquoi: "« Century » veut dire siècle (cent ans), jamais « centaine ». « Centuries of protesters » se lit « des siècles de manifestants ».",
              regle: "Une centaine, des centaines : <b>a hundred, hundreds of</b>. A century : un siècle.",
              ex: "Hundreds of people attended the meeting.",
              exfr: "Des centaines de personnes ont assisté à la réunion.",
              carte: { fr: "des centaines de", en: "hundreds of (century = siècle)" }
            },
            {
              re: ["(manifestants|manifesters|manifestators|manifestations)"],
              type: "barbarisme",
              pts: 0.5,
              faux: "manifestants",
              juste: "protesters",
              test: "On 7 November in Dublin, hundreds of manifestants called for a moratorium on new projects, claiming that wholesale electricity prices had doubled in a year.",
              pourquoi: "« Manifestant » n'existe pas en anglais, et « a manifestation » veut dire une manifestation au sens de signe, de symptôme (a manifestation of anger). La manifestation de rue, c'est a protest, et ceux qui y participent sont des protesters ou des demonstrators.",
              regle: "Une manifestation (dans la rue) : <b>a protest, a demonstration</b>. Un manifestant : <b>a protester, a demonstrator</b>.",
              ex: "Thousands of protesters marched to Parliament.",
              exfr: "Des milliers de manifestants ont marché jusqu'au Parlement.",
              carte: { fr: "un manifestant", en: "a protester, a demonstrator" }
            },
            {
              re: ["(^|several |many |a few )hundred of"],
              type: "grammaire",
              pts: 0.25,
              faux: "several hundred of protesters",
              juste: "hundreds of protesters / several hundred protesters",
              test: "On 7 November in Dublin, several hundred of protesters called for a moratorium on new projects, claiming that wholesale electricity prices had doubled in a year.",
              pourquoi: "Après un nombre (several, a few, two), hundred reste au singulier et se passe de of : several hundred protesters. Hundreds of, au pluriel, s'emploie seul, sans nombre devant.",
              regle: "<b>Two hundred / several hundred</b> + nom (sans s, sans of). <b>Hundreds of</b> + nom (sans nombre devant).",
              ex: "Three hundred jobs were lost, and hundreds of families were affected.",
              exfr: "Trois cents emplois ont été supprimés et des centaines de familles ont été touchées.",
              lecon: { n: 11, ancre: "grands-nombres", titre: "Les grands nombres" },
              carte: { fr: "plusieurs centaines de manifestants", en: "several hundred protesters / hundreds of protesters" }
            }
          ]
        },
        {
          fr: "ont réclamé un moratoire sur les nouveaux projets",
          en: "called for a moratorium on new projects",
          pts: 1.5,
          ok: [
            "(called for|demanded|urged|pressed for|campaigned for|asked for|marched to demand|marched to call for|rallied to demand|rallied to call for|marched for|rallied for|to demand|to call for|demanding|calling for|were calling for|were demanding|protested to demand|took to the streets to demand) (a |an immediate |an urgent )?(moratorium|freeze|halt|pause|stop) on (any |all )?(new|future|further) (data center )?(projects|developments|data centers|facilities|sites|construction|building)",
            "(called on|urged|pressed) the (irish )?government to (impose|introduce|adopt|declare|bring in|put in place|order) (a |an immediate )?(moratorium|freeze|halt|pause) on (any |all )?(new|future|further) (data center )?(projects|developments|data centers|facilities|sites|construction)"
          ],
          fautes: [
            {
              re: ["have (called for|demanded|urged|asked for|called on|pressed for|campaigned for)"],
              type: "grammaire",
              pts: 1,
              faux: "have called for",
              juste: "called for",
              test: "On 7 November in Dublin, hundreds of protesters have called for a moratorium on new projects, claiming that wholesale electricity prices had doubled in a year.",
              pourquoi: "La manifestation a eu lieu à une date précise, donnée en tête de phrase (le 7 novembre) : c'est un fait passé et daté. Le passé composé français se traduit alors par un prétérit ; le present perfect avec une date est une faute lourde.",
              regle: "Moment passé précis (on 7 November, last week, in 2025) : <b>prétérit</b> (called for). Present perfect sans date révolue (have called for a moratorium several times).",
              ex: "On Monday, the unions called for a strike.",
              exfr: "Lundi, les syndicats ont appelé à la grève.",
              lecon: { n: 14, ancre: "comparaison", titre: "Present perfect ou prétérit" },
              carte: { fr: "ont réclamé (le 7 novembre)", en: "called for (prétérit + date)" }
            },
            {
              re: ["(called|call|calls) (a|an|the) (moratorium|freeze|halt|immediate moratorium)"],
              type: "contresens",
              pts: 1,
              faux: "called a moratorium",
              juste: "called for a moratorium",
              test: "On 7 November in Dublin, hundreds of protesters called a moratorium on new projects, claiming that wholesale electricity prices had doubled in a year.",
              pourquoi: "Sans for, « call » change de sens : call a strike, call an election, call a moratorium, c'est décider, décréter. « Protesters called a moratorium » dit que les manifestants ont eux-mêmes décrété le moratoire, alors qu'ils le réclament.",
              regle: "Réclamer : <b>call for</b> (call for a moratorium). Décréter, convoquer : call (call an election, call a strike).",
              ex: "The unions called for higher wages.",
              exfr: "Les syndicats ont réclamé des hausses de salaire.",
              carte: { fr: "réclamer (un moratoire)", en: "call for (call = décréter)" }
            },
            {
              re: ["(reclaimed|reclaim|reclaiming|claimed|claiming) (a |an )?(moratorium|freeze|halt)"],
              type: "faux-sens",
              pts: 1,
              faux: "reclaimed a moratorium",
              juste: "called for a moratorium",
              test: "On 7 November in Dublin, hundreds of protesters reclaimed a moratorium on new projects, claiming that wholesale electricity prices had doubled in a year.",
              pourquoi: "Faux ami : « to reclaim », c'est récupérer ce qu'on a perdu (reclaim land, reclaim a tax), et « to claim » veut dire affirmer ou revendiquer un droit. Réclamer une mesure, c'est la demander : call for, demand.",
              regle: "Réclamer (une mesure) : <b>to call for, to demand</b>. To reclaim : récupérer. To claim : affirmer, revendiquer.",
              ex: "Farmers are demanding more support.",
              exfr: "Les agriculteurs réclament davantage d'aides.",
              carte: { fr: "réclamer (une mesure)", en: "to call for, to demand (reclaim = récupérer)" }
            }
          ]
        },
        {
          fr: "affirmant que",
          en: "claiming that",
          pts: 0.5,
          ok: [
            "(claiming|arguing|saying|insisting|asserting|stating|complaining|pointing out|warning|noting|stressing|affirming|alleging|explaining|maintaining|contending)( that)?",
            "(and|as they|they|who|as) (claimed|argued|said|insisted|asserted|stated|complained|pointed out|warned|noted|stressed|affirmed|alleged|maintained)( that)?"
          ],
          fautes: [
            {
              re: ["pretend(ing|ed|s)?( that)?"],
              type: "faux-sens",
              pts: 0.5,
              faux: "pretending that",
              juste: "claiming that",
              test: "On 7 November in Dublin, hundreds of protesters called for a moratorium on new projects, pretending that wholesale electricity prices had doubled in a year.",
              pourquoi: "Faux ami : « to pretend », c'est faire semblant. « Pretending that prices had doubled » laisse entendre que les manifestants mentent en connaissance de cause.",
              regle: "Affirmer, prétendre (dire que) : <b>to claim, to argue, to say</b>. To pretend : faire semblant.",
              ex: "He claims that he was not informed.",
              exfr: "Il affirme qu'il n'a pas été informé.",
              carte: { fr: "affirmer, prétendre que", en: "to claim that (pretend = faire semblant)" }
            }
          ]
        },
        {
          fr: "les prix de gros de l'électricité avaient doublé en un an",
          en: "wholesale electricity prices had doubled in a year",
          pts: 1,
          ok: [
            "(that )?(the )?(wholesale (electricity |power |energy )?prices?|wholesale prices? (of|for) (electricity|power|energy)|(electricity|power) wholesale prices?|price of (electricity|power) on the wholesale market|wholesale market prices? (of|for) (electricity|power)) (had|have|has)( already)? (doubled|risen twofold|gone up twofold|increased twofold|risen by 100 percent|increased by 100 percent) (in (a|1|the past|the last|just a|just 1) (year|12 months)|in (just )?12 months|within (a|1) year|over (the past|the last|a|1) (year|12 months)|in the space of (a|1) year|year on year|since last year)",
            "(that )?(the )?(wholesale (electricity |power |energy )?prices?|wholesale prices? (of|for) (electricity|power|energy)|(electricity|power) wholesale prices?|price of (electricity|power) on the wholesale market|wholesale market prices? (of|for) (electricity|power)) (had|have|has)( already)? (doubled|risen twofold|increased twofold) (since|compared with|from) (a year earlier|a year before|the previous year|last year)"
          ],
          fautes: [
            {
              re: ["since (a|1) year", "since 12 months", "for (a|1) year"],
              type: "grammaire",
              pts: 0.5,
              faux: "had doubled since a year",
              juste: "had doubled in a year",
              test: "On 7 November in Dublin, hundreds of protesters called for a moratorium on new projects, claiming that wholesale electricity prices had doubled since a year.",
              pourquoi: "« En un an » donne une durée. Since n'accepte qu'un point de départ (since 2025, since January) ; devant une durée, il est faux. Ici, on veut dire « au cours de l'année écoulée » : in a year, over the past year.",
              regle: "<b>Since</b> + point de départ ; <b>for</b> + durée. En un an, au cours de l'année : <b>in a year, over the past year, within a year</b>.",
              ex: "Rents have doubled in ten years.",
              exfr: "Les loyers ont doublé en dix ans.",
              lecon: { n: 15, ancre: "erreurs", titre: "Since et for : erreurs fréquentes" },
              carte: { fr: "en un an (durée)", en: "in a year, over the past year (jamais since a year)" }
            },
            {
              re: ["gross (electricity |power |energy )?prices?", "prices? (of|in) (gross|big)", "big prices?"],
              type: "faux-sens",
              pts: 0.5,
              faux: "gross prices",
              juste: "wholesale prices",
              test: "On 7 November in Dublin, hundreds of protesters called for a moratorium on new projects, claiming that gross electricity prices had doubled in a year.",
              pourquoi: "« Gross » veut dire brut (gross income, le revenu brut) ou dégoûtant. Le prix de gros, celui auquel les fournisseurs achètent l'électricité avant de la revendre aux ménages, c'est the wholesale price ; le prix de détail, the retail price.",
              regle: "Prix de gros : <b>wholesale price</b>. Prix de détail : <b>retail price</b>. Gross : brut (gross domestic product).",
              ex: "Wholesale gas prices have fallen, but retail prices remain high.",
              exfr: "Les prix de gros du gaz ont baissé, mais les prix de détail restent élevés.",
              carte: { fr: "un prix de gros", en: "a wholesale price (gross = brut)" }
            }
          ]
        }
      ]
    },
    {
      fr: "Le gouvernement, ((pour sa part)), n'[[envisage]] aucun moratoire national : le ministre de l'Entreprise, Peter Burke, ((voit dans)) ces centres une opportunité stratégique pour l'économie irlandaise.",
      cartes: [
        { id: "04b249819a", fr: "pour sa part, de son côté", en: "for his part", re: "for (his|its|their|her) (own )?part" },
        { id: "23d0f41bcb", fr: "considérer quelque chose comme", en: "to see something as", re: "(see|sees|saw|seeing|seen)( \\w+){1,4} as" }
      ],
      aides: [{ fr: "envisager (une mesure)", en: "to consider" }],
      proposition: "The government, for its part, is not considering any national moratorium: Enterprise Minister Peter Burke sees these centres as a strategic opportunity for the Irish economy.",
      autres: [
        "For its part, the Irish government has ruled out a national moratorium, and Enterprise Minister Peter Burke views data centres as a strategic opportunity for Ireland's economy."
      ],
      tests: [
        "The government, for its part, has no plans for a national moratorium: Peter Burke, the Enterprise Minister, regards these facilities as a strategic opportunity for the Irish economy.",
        "For their part, the authorities are not planning to impose any nationwide moratorium; the Minister for Enterprise, Peter Burke, sees a strategic opportunity in these centres for the Irish economy."
      ],
      morceaux: [
        {
          fr: "Le gouvernement, pour sa part,",
          en: "The government, for its part,",
          pts: 1,
          ok: [
            "(the )?(irish )?(government|authorities|executive|coalition),? for (its|their) (own )?part",
            "for (its|their) (own )?part,? (the )?(irish )?(government|authorities|executive|coalition)"
          ],
          fautes: [
            {
              re: [
                "(government|executive|coalition),? for (his|her) (own )?part",
                "for (his|her) (own )?part,? (the )?(irish )?(government|executive|coalition)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "the government, for his part",
              juste: "the government, for its part",
              test: "The government, for his part, is not considering any national moratorium: Enterprise Minister Peter Burke sees these centres as a strategic opportunity for the Irish economy.",
              pourquoi: "« Sa » renvoie au gouvernement, une institution : en anglais, c'est une chose, donc its (ou their, en anglais britannique, quand on pense aux membres du gouvernement). « For his part » se dit d'un homme : for his part, the minister…",
              regle: "Possessif = <b>possesseur</b> : the minister, for his part ; the government, for <b>its</b> part (ou for their part).",
              ex: "The company, for its part, denies any wrongdoing.",
              exfr: "L'entreprise, de son côté, nie toute faute.",
              lecon: { n: 3, ancre: "possessifs", titre: "Adjectifs et pronoms possessifs" },
              carte: { fr: "pour sa part (le gouvernement)", en: "for its part" }
            },
            {
              re: ["(on|from|by) (its|his|their|her) side"],
              type: "gallicisme",
              pts: 0.5,
              faux: "on its side",
              juste: "for its part",
              test: "The government, on its side, is not considering any national moratorium: Enterprise Minister Peter Burke sees these centres as a strategic opportunity for the Irish economy.",
              pourquoi: "« De son côté » se calque mal : « on its side » veut dire « de son côté » au sens propre (couché sur le côté) ou « avec lui » (the law is on our side). Pour opposer deux acteurs, l'anglais dit for its part.",
              regle: "Pour sa part, de son côté : <b>for its part / for his part</b>, ou <b>meanwhile</b>. On sb's side : du côté de quelqu'un, avec lui.",
              ex: "The unions, for their part, rejected the offer.",
              exfr: "Les syndicats, de leur côté, ont rejeté l'offre.",
              carte: { fr: "de son côté, pour sa part", en: "for its part (on its side = avec lui)" }
            }
          ]
        },
        {
          fr: "n'envisage aucun moratoire national",
          en: "is not considering any national moratorium",
          pts: 1,
          ok: [
            "(is|are) not (even )?(considering|planning|contemplating|envisaging|envisioning|proposing) (any|a) (national|nationwide|countrywide) moratorium",
            "(is|are) not (considering|contemplating) (introducing|imposing|adopting) (any|a) (national|nationwide|countrywide) moratorium",
            "(has|have|is making|are making) no (plans?|intention) (for|of introducing|to introduce|of imposing|to impose|of adopting) (any |a )?(national|nationwide|countrywide) moratorium",
            "(is|are) not (planning|intending|going) to (impose|introduce|adopt|bring in|declare) (any|a) (national|nationwide|countrywide) moratorium",
            "(does|do|will) not (plan|intend|want) to (impose|introduce|adopt|bring in|declare) (any|a) (national|nationwide|countrywide) moratorium",
            "(has ruled out|rules out|is ruling out|have ruled out|rule out|has rejected|rejects|refuses|has refused|opposes) (any |a |the idea of a )?(national|nationwide|countrywide) moratorium",
            "(does|do|will) not (consider|contemplate|envisage) (any |a )?(national|nationwide|countrywide) moratorium",
            "(a|any) (national|nationwide|countrywide) moratorium is (not on the cards|not on the agenda|off the table|not on the table|not being considered|out of the question|ruled out)"
          ],
          fautes: [
            {
              re: ["not (even )?(considering|consider|envisage|envisaging|planning|plan|contemplating|contemplate|envisioning) no"],
              type: "grammaire",
              pts: 0.5,
              faux: "is not considering no moratorium",
              juste: "is not considering any moratorium",
              test: "The government, for its part, is not considering no national moratorium: Enterprise Minister Peter Burke sees these centres as a strategic opportunity for the Irish economy.",
              pourquoi: "Le français a besoin de deux mots pour nier (ne… aucun). L'anglais standard n'en garde qu'un : « not considering no moratorium » contient deux négations qui s'annulent.",
              regle: "Une seule négation : <b>not… any</b> (is not considering any moratorium) ou <b>no</b> avec un verbe affirmatif (has no plans for a moratorium).",
              ex: "The minister did not give any figure. / He gave no figure.",
              exfr: "Le ministre n'a donné aucun chiffre.",
              lecon: { n: 3, ancre: "indefinis", titre: "Pronoms indéfinis : no, any" },
              carte: { fr: "n'envisager aucun…", en: "not consider any… / have no plans for…" }
            },
            {
              re: [
                "(considers|is considering|envisages|is envisaging|plans|is planning|contemplates|is contemplating) any (national |nationwide )?moratorium"
              ],
              type: "contresens",
              pts: 1,
              faux: "is considering any moratorium",
              juste: "is not considering any moratorium",
              test: "The government, for its part, is considering any national moratorium: Enterprise Minister Peter Burke sees these centres as a strategic opportunity for the Irish economy.",
              pourquoi: "Sans not, « any » veut dire « n'importe quel ». « The government is considering any moratorium » signifie qu'il envisage n'importe quel moratoire : le contraire de la phrase française.",
              regle: "« Ne… aucun » : <b>not… any</b> ou <b>no</b>. Any dans une phrase affirmative : n'importe quel.",
              ex: "We have no choice. / Choose any card.",
              exfr: "Nous n'avons aucun choix. / Choisis n'importe quelle carte.",
              lecon: { n: 3, ancre: "indefinis", titre: "Pronoms indéfinis : no, any" },
              carte: { fr: "ne… aucun / n'importe quel", en: "not… any, no / any" }
            }
          ]
        },
        {
          fr: "le ministre de l'Entreprise, Peter Burke,",
          en: "Enterprise Minister Peter Burke",
          pts: 0.5,
          ok: [
            "(the )?(irish )?(enterprise minister|minister (for|of) enterprise( tourism and employment)?|business minister|minister for business|enterprise and employment minister),? peter burke",
            "peter burke,? (the )?(irish )?(enterprise minister|minister (for|of) enterprise( tourism and employment)?|business minister|minister for business)"
          ],
          fautes: [
            {
              re: ["minister of the (enterprise|company|firm|business)"],
              type: "gallicisme",
              pts: 0.25,
              faux: "the minister of the Enterprise",
              juste: "the Minister for Enterprise",
              test: "The government, for its part, is not considering any national moratorium: the minister of the Enterprise, Peter Burke, sees these centres as a strategic opportunity for the Irish economy.",
              pourquoi: "Avec l'article, « the Enterprise » désigne une entreprise précise (ou le vaisseau de Star Trek). Le nom d'un ministère se construit sans article : the Minister for Enterprise, ou, plus court, Enterprise Minister devant le nom de la personne.",
              regle: "Titre officiel : <b>the Minister for Enterprise</b>, <b>the Enterprise Minister</b>, ou devant le nom, sans article : <b>Enterprise Minister Peter Burke</b>.",
              ex: "Finance Minister Paschal Donohoe presented the budget.",
              exfr: "Le ministre des Finances, Paschal Donohoe, a présenté le budget.",
              carte: { fr: "le ministre de l'Entreprise", en: "the Minister for Enterprise, Enterprise Minister X" }
            }
          ]
        },
        {
          fr: "voit dans ces centres une opportunité stratégique",
          en: "sees these centres as a strategic opportunity",
          pts: 1,
          ok: [
            "(sees|regards|views|considers|describes|presents|has described|described|treats|portrays|hails|sees|thinks of|looks on|looks upon) ((these|the|such|ireland's|irish|the country's) )?(data )?(centers|facilities|sites|installations|server farms) (as|to be) (a|an) (major |key |real |genuine )?(strategic|key strategic|major strategic) opportunity",
            "(sees|views|finds|has found) (a|an) (major |key |real |genuine )?strategic opportunity in ((these|the|such|ireland's|irish|the country's) )?(data )?(centers|facilities|sites|installations|server farms)",
            "(considers|deems|believes|thinks) (that )?((these|the|such|ireland's|irish|the country's) )?(data )?(centers|facilities|sites|installations|server farms) (are|represent|offer|constitute) (a|an) (major |key |real |genuine )?strategic opportunity"
          ],
          fautes: [
            {
              re: ["(sees|see|saw|views|view|finds) in (these|the|such|data|those|this)"],
              type: "gallicisme",
              pts: 0.5,
              faux: "sees in these centres a strategic opportunity",
              juste: "sees these centres as a strategic opportunity",
              test: "The government, for its part, is not considering any national moratorium: Enterprise Minister Peter Burke sees in these centres a strategic opportunity for the Irish economy.",
              pourquoi: "« Voir dans quelque chose un atout » est une tournure française. Calquée, elle sépare le verbe de son objet et sonne lourd. L'anglais dit see something as something, ou, en gardant l'ordre, see an opportunity in something.",
              regle: "Considérer, voir comme : <b>see / regard / view + objet + as</b> (sees data centres as an opportunity). Ou : <b>see an opportunity in</b> + nom.",
              ex: "Many investors see gold as a safe haven.",
              exfr: "Beaucoup d'investisseurs voient dans l'or une valeur refuge.",
              carte: { fr: "voir dans X une opportunité", en: "see X as an opportunity" }
            },
            {
              re: ["strategical", "(an?|the) opportunity strategic", "opportunity strategic"],
              type: "grammaire",
              pts: 0.5,
              faux: "strategical / an opportunity strategic",
              juste: "a strategic opportunity",
              test: "The government, for its part, is not considering any national moratorium: Enterprise Minister Peter Burke sees these centres as an opportunity strategic for the Irish economy.",
              pourquoi: "L'adjectif anglais est strategic (strategical n'existe pas), et il se place devant le nom, jamais après comme en français.",
              regle: "Adjectif épithète <b>avant le nom</b> : a strategic opportunity, a major project. Adjectif en -ic : strategic, economic, historic.",
              ex: "It is a strategic decision for the company.",
              exfr: "C'est une décision stratégique pour l'entreprise.",
              lecon: { n: 8, ancre: "adjectif-position", titre: "La place de l'adjectif épithète" },
              carte: { fr: "une opportunité stratégique", en: "a strategic opportunity" }
            }
          ]
        },
        {
          fr: "pour l'économie irlandaise",
          en: "for the Irish economy",
          pts: 0.5,
          ok: [
            "for (the )?(irish economy|economy of ireland|country's economy|national economy)",
            "for (ireland's|the country's|the nation's) economy",
            "for ireland"
          ],
          fautes: [
            {
              re: ["for irish economy", "for the economy irish", "for economy of ireland"],
              type: "grammaire",
              pts: 0.25,
              faux: "for Irish economy",
              juste: "for the Irish economy",
              test: "The government, for its part, is not considering any national moratorium: Enterprise Minister Peter Burke sees these centres as a strategic opportunity for Irish economy.",
              pourquoi: "L'économie irlandaise est une chose unique et précise : comme en français, elle prend l'article défini. Le nom de pays lui-même s'en passe (Ireland's economy), mais pas le groupe adjectif + nom.",
              regle: "Chose unique, identifiée : <b>the</b> (the Irish economy, the government). Sans article : le nom de pays seul (Ireland), ou après un génitif (Ireland's economy).",
              ex: "The French economy grew by 1%.",
              exfr: "L'économie française a progressé de 1 %.",
              lecon: { n: 4, ancre: "the", titre: "The : l'article défini" },
              carte: { fr: "l'économie irlandaise", en: "the Irish economy / Ireland's economy" }
            }
          ]
        }
      ]
    },
    {
      fr: "((À l'heure où)) l'intelligence artificielle ((absorbe)) toujours plus d'énergie, [[reste à savoir]] si le ((réseau électrique)), déjà [[sous tension]] autour de Dublin, pourra [[suivre]].",
      cartes: [
        { id: "b62754498a", fr: "à l'heure où, au moment où", en: "at a time when", re: "at a time when" },
        { id: "60ffca81e3", fr: "absorber, engloutir", en: "to absorb", re: "absorb(s|ed|ing)?" },
        {
          id: "ee041c63a6",
          fr: "le réseau électrique",
          en: "the power grid",
          re: "(power|electricity|electrical|electric) grid|the (national |irish )?grid"
        }
      ],
      aides: [
        { fr: "reste à savoir si", en: "it remains to be seen whether" },
        { fr: "sous tension (surchargé)", en: "under strain" },
        { fr: "suivre (le rythme)", en: "to keep up" }
      ],
      proposition: "At a time when artificial intelligence is absorbing more and more energy, it remains to be seen whether the power grid, already under strain around Dublin, will be able to keep up.",
      autres: [
        "With artificial intelligence consuming ever more electricity, the question is whether Ireland's power grid, which is already stretched around Dublin, can keep pace."
      ],
      tests: [
        "At a time when AI is using more and more power, it is unclear whether the electricity grid, already overstretched in the Dublin area, will be able to cope.",
        "As artificial intelligence absorbs ever greater amounts of energy, it remains to be seen if the national grid, already under heavy pressure around Dublin, can keep up with demand."
      ],
      morceaux: [
        {
          fr: "À l'heure où",
          en: "At a time when",
          pts: 0.5,
          ok: ["at a time when", "^(as|while|with|now that|just as|at a moment when|at a time where)", "at the very moment when"],
          fautes: [
            {
              re: ["at the hour (where|when|that)"],
              type: "faux-sens",
              pts: 0.5,
              faux: "at the hour where",
              juste: "at a time when",
              test: "At the hour where artificial intelligence is absorbing more and more energy, it remains to be seen whether the power grid, already under strain around Dublin, will be able to keep up.",
              pourquoi: "« À l'heure où » ne parle pas d'une heure de l'horloge : c'est une façon de dire « à une époque où, au moment où ». « At the hour where » se lit comme une heure précise de la journée.",
              regle: "À l'heure où, au moment où : <b>at a time when</b> (ou as, now that). The hour : l'heure (soixante minutes).",
              ex: "At a time when prices are rising, wages are frozen.",
              exfr: "À l'heure où les prix augmentent, les salaires sont gelés.",
              carte: { fr: "à l'heure où", en: "at a time when" }
            },
            {
              re: ["at the time (when|where)"],
              type: "faux-sens",
              pts: 0.25,
              faux: "at the time when",
              juste: "at a time when",
              test: "At the time when artificial intelligence is absorbing more and more energy, it remains to be seen whether the power grid, already under strain around Dublin, will be able to keep up.",
              pourquoi: "« At the time when » renvoie à une époque passée et précise (à l'époque où). Pour parler de la période actuelle, l'anglais dit at a time when, avec l'article indéfini.",
              regle: "<b>At a time when</b> : à l'heure où, alors que (aujourd'hui). <b>At the time</b> : à l'époque (passée).",
              ex: "At the time, nobody believed him.",
              exfr: "À l'époque, personne ne le croyait.",
              carte: { fr: "à l'heure où (aujourd'hui) / à l'époque où", en: "at a time when / at the time when" }
            }
          ]
        },
        {
          fr: "l'intelligence artificielle absorbe toujours plus d'énergie",
          en: "artificial intelligence is absorbing more and more energy",
          pts: 1.5,
          ok: [
            "(artificial intelligence|ai|the ai boom|the artificial intelligence boom|the rise of (ai|artificial intelligence)|the growth of (ai|artificial intelligence)) (is absorbing|absorbs|is consuming|consumes|is using|uses|is eating up|eats up|is swallowing up|swallows up|is swallowing|swallows|is gobbling up|gobbles up|requires|is requiring|demands|is demanding|needs|is taking|takes|is soaking up|soaks up|draws|is drawing|devours|is devouring|guzzles|is guzzling) (ever more|more and more|ever greater amounts of|ever larger amounts of|increasing amounts of|growing amounts of|an ever growing amount of|an increasing amount of|a growing amount of|increasingly large amounts of|ever increasing amounts of|ever growing amounts of|a growing share of|an ever larger share of|increasing quantities of|growing quantities of|ever more and more) (energy|power|electricity)",
            "(artificial intelligence|ai|the ai boom|the artificial intelligence boom|the rise of (ai|artificial intelligence)|the growth of (ai|artificial intelligence)) (absorbing|consuming|using|eating up|swallowing up|swallowing|gobbling up|requiring|demanding|needing|taking|soaking up|drawing|devouring|guzzling) (ever more|more and more|ever greater amounts of|ever larger amounts of|increasing amounts of|growing amounts of|an ever growing amount of|an increasing amount of|a growing amount of|increasingly large amounts of|ever increasing amounts of|ever growing amounts of|a growing share of|an ever larger share of|increasing quantities of|growing quantities of|ever more and more) (energy|power|electricity)",
            "(artificial intelligence|ai|the ai boom|the artificial intelligence boom|the rise of (ai|artificial intelligence)|the growth of (ai|artificial intelligence)) (is|keeps) (absorbing|consuming|using|eating up|swallowing|gobbling up|requiring|demanding|devouring) (ever )?more (energy|power|electricity) (than ever|every year|each year|year after year)",
            "(artificial intelligence|ai|the ai boom|the artificial intelligence boom|the rise of (ai|artificial intelligence)|the growth of (ai|artificial intelligence))'s (energy|power|electricity) (needs|demands|consumption|appetite) (are|is) (growing|rising|soaring|increasing) (ever faster|all the time|constantly|steadily|relentlessly)?"
          ],
          fautes: [
            {
              re: ["the (artificial intelligence|ai) (is|absorbs|consumes|uses|eats|swallows|requires|needs|demands|devours|guzzles|takes|draws)"],
              type: "grammaire",
              pts: 0.5,
              faux: "the artificial intelligence absorbs",
              juste: "artificial intelligence absorbs",
              test: "At a time when the artificial intelligence is absorbing more and more energy, it remains to be seen whether the power grid, already under strain around Dublin, will be able to keep up.",
              pourquoi: "L'intelligence artificielle est prise ici au sens général : la technologie, pas un système précis. En anglais, un nom indénombrable pris au sens général ne prend pas d'article. « The artificial intelligence » ferait penser à une IA particulière, déjà présentée.",
              regle: "Nom au sens général : <b>pas d'article</b> (artificial intelligence, energy, inflation). The pour une chose précise (the AI model launched last week).",
              ex: "Technology changes fast.",
              exfr: "La technologie évolue vite.",
              lecon: { n: 4, ancre: "zero-article", titre: "Le zéro article" },
              carte: { fr: "l'intelligence artificielle (en général)", en: "artificial intelligence (sans article)" }
            },
            {
              re: ["always more"],
              type: "gallicisme",
              pts: 0.5,
              faux: "always more energy",
              juste: "more and more energy",
              test: "At a time when artificial intelligence is absorbing always more energy, it remains to be seen whether the power grid, already under strain around Dublin, will be able to keep up.",
              pourquoi: "« Toujours plus » ne parle pas de « toujours » au sens de « à chaque fois » : il dit une progression. « Always more » est un calque que l'anglais ne comprend pas ; il répète le comparatif (more and more) ou ajoute ever (ever more).",
              regle: "Toujours plus (progression) : <b>more and more</b>, <b>ever more</b>. Toujours plus grand : <b>bigger and bigger</b>, ever bigger.",
              ex: "Cities are becoming more and more expensive.",
              exfr: "Les villes deviennent toujours plus chères.",
              lecon: { n: 22, ancre: "structures-avancees", titre: "Les structures avancées du comparatif" },
              carte: { fr: "toujours plus de", en: "more and more, ever more" }
            },
            {
              re: ["(artificial intelligence|ai) (absorb|consume|use|require|need|demand|swallow|devour|draw|take|guzzle)"],
              type: "grammaire",
              pts: 0.5,
              faux: "artificial intelligence absorb",
              juste: "artificial intelligence absorbs",
              test: "At a time when artificial intelligence absorb more and more energy, it remains to be seen whether the power grid, already under strain around Dublin, will be able to keep up.",
              pourquoi: "Le sujet, artificial intelligence, est à la troisième personne du singulier : au présent simple, le verbe prend un s. L'oublier est l'une des fautes que le correcteur repère le plus vite.",
              regle: "Présent simple : <b>he / she / it + verbe-s</b> (AI absorbs, the grid needs). Ou présent en -ing pour une évolution en cours : AI is absorbing.",
              ex: "The company employs 200 people.",
              exfr: "L'entreprise emploie 200 personnes.",
              lecon: { n: 1, ancre: "formation", titre: "Le présent simple : formation" },
              carte: { fr: "elle absorbe (3e personne)", en: "it absorbs (s à la 3e personne)" }
            }
          ]
        },
        {
          fr: "reste à savoir si",
          en: "it remains to be seen whether",
          pts: 1,
          ok: [
            "it (still )?remains to be seen (whether|if)",
            "(the|one) (big |real |key |open )?question (now )?(is|remains) (whether|if)",
            "it is (still )?(unclear|uncertain|not clear|an open question|far from certain|doubtful|far from clear|not yet clear|hard to say) (whether|if)",
            "(no one|nobody) (yet )?knows (whether|if)",
            "(one|we) (may|might|can|could) (well )?(wonder|ask) (whether|if)",
            "what remains to be seen is (whether|if)",
            "(the question|it) remains (whether|if)"
          ],
          fautes: [
            {
              re: ["(it )?(rests|rest|stays|remains it) to (know|see|be seen|be known)"],
              type: "barbarisme",
              pts: 1,
              faux: "it rests to know",
              juste: "it remains to be seen",
              test: "At a time when artificial intelligence is absorbing more and more energy, it rests to know whether the power grid, already under strain around Dublin, will be able to keep up.",
              pourquoi: "« To rest » veut dire se reposer (ou reposer sur). Il ne traduit jamais « il reste ». La tournure figée de l'anglais, c'est it remains to be seen : il reste à voir.",
              regle: "Reste à savoir si : <b>it remains to be seen whether</b> (ou the question is whether). To rest : se reposer.",
              ex: "It remains to be seen whether the plan will work.",
              exfr: "Reste à savoir si le plan fonctionnera.",
              carte: { fr: "reste à savoir si", en: "it remains to be seen whether" }
            },
            {
              re: ["(it )?remains to (know|see) (whether|if)"],
              type: "gallicisme",
              pts: 0.5,
              faux: "it remains to know whether",
              juste: "it remains to be seen whether",
              test: "At a time when artificial intelligence is absorbing more and more energy, it remains to know whether the power grid, already under strain around Dublin, will be able to keep up.",
              pourquoi: "La phrase est comprise, mais c'est un calque mot à mot de « reste à savoir ». L'anglais emploie une tournure passive figée : it remains to be seen.",
              regle: "<b>It remains to be seen whether</b> + proposition (jamais it remains to know).",
              ex: "It remains to be seen how voters will react.",
              exfr: "Reste à savoir comment les électeurs réagiront.",
              carte: { fr: "reste à savoir si", en: "it remains to be seen whether" }
            }
          ]
        },
        {
          fr: "si le réseau électrique, déjà sous tension autour de Dublin,",
          en: "whether the power grid, already under strain around Dublin,",
          pts: 0.5,
          ok: [
            "(whether|if) ((the )?(irish |country's |national |ireland's |nation's )?(power|electricity|electrical|electric) (grid|network|system)|the (national |irish )?grid|ireland's grid|the country's grid),? (which is |which was )?(already )?(under (severe |heavy |great |considerable |intense |huge )?(strain|pressure|stress)|stretched|strained|overstretched|stretched to (its|the) limits?|saturated|congested|at (full )?capacity|struggling|overloaded|close to saturation|near capacity|constrained|close to (its )?limits?|at (its|breaking) (limits?|point)) (around|in|near|in and around|in the area around|in the region around|close to) (the )?(greater )?dublin( area| region)?",
            "(whether|if) ((the )?(irish |country's |national |ireland's |nation's )?(power|electricity|electrical|electric) (grid|network|system)|the (national |irish )?grid|ireland's grid|the country's grid) (around|in|near|in and around|in the area around|in the region around|close to) (the )?(greater )?dublin( area| region)?,? (which is )?already (under (severe |heavy |great |considerable |intense |huge )?(strain|pressure|stress)|stretched|strained|overstretched|stretched to (its|the) limits?|saturated|congested|at (full )?capacity|struggling|overloaded|close to saturation|near capacity|constrained|close to (its )?limits?|at (its|breaking) (limits?|point))",
            "(whether|if) ((the )?(irish |country's |national |ireland's |nation's )?(power|electricity|electrical|electric) (grid|network|system)|the (national |irish )?grid|ireland's grid|the country's grid),? (which is )?already (under (severe |heavy |great |considerable |intense |huge )?(strain|pressure|stress)|stretched|strained|overstretched|stretched to (its|the) limits?|saturated|congested|at (full )?capacity|struggling|overloaded|close to saturation|near capacity|constrained|close to (its )?limits?|at (its|breaking) (limits?|point)),? (especially |particularly )?(around|in|near|in and around|in the area around|in the region around|close to) (the )?(greater )?dublin( area| region)?"
          ],
          fautes: [
            {
              re: ["under (\\w+ )?tension"],
              type: "gallicisme",
              pts: 0.5,
              faux: "under tension",
              juste: "under strain",
              test: "At a time when artificial intelligence is absorbing more and more energy, it remains to be seen whether the power grid, already under tension around Dublin, will be able to keep up.",
              pourquoi: "« Sous tension » est ici une image : le réseau est surchargé, il approche de ses limites. En anglais, « under tension » ne se dit que d'un câble ou d'un ressort tendu, au sens physique ; une relation tendue, c'est tension between. Pour un système surchargé, on dit under strain, under pressure.",
              regle: "Surchargé, sous tension : <b>under strain</b>, <b>under pressure</b>, <b>stretched</b>. Tension : tensions entre personnes ou pays (tensions between Dublin and London).",
              ex: "Hospitals are under strain this winter.",
              exfr: "Les hôpitaux sont sous tension cet hiver.",
              carte: { fr: "sous tension (surchargé)", en: "under strain, under pressure" }
            }
          ]
        },
        {
          fr: "pourra suivre",
          en: "will be able to keep up",
          pts: 0.5,
          ok: [
            "(will|can|could|would|might) (be able to )?(keep up|cope|keep pace|withstand the pressure|take the strain|stand the strain|meet (the )?(growing |rising )?demand|handle (it|the load|the demand|such demand|this demand|the pressure))( with (it|demand|the demand|them|this demand|the growing demand|the pace))?",
            "(will|can|could|would) (manage|be able) to (keep up|cope|keep pace)( with (it|demand|the demand|them))?",
            "(is|will be) (able|equipped) to (keep up|cope|keep pace)( with (it|demand|the demand|them))?"
          ],
          fautes: [
            {
              re: ["(will|would|shall) can"],
              type: "barbarisme",
              pts: 0.5,
              faux: "will can",
              juste: "will be able to",
              test: "At a time when artificial intelligence is absorbing more and more energy, it remains to be seen whether the power grid, already under strain around Dublin, will can keep up.",
              pourquoi: "Can n'a pas de futur : deux modaux ne se suivent jamais. Pour dire « pourra », l'anglais remplace can par be able to : will be able to.",
              regle: "Pouvoir au futur : <b>will be able to</b> + base verbale. Jamais will can, ni must can.",
              ex: "We will be able to expand next year.",
              exfr: "Nous pourrons nous développer l'an prochain.",
              lecon: { n: 18, ancre: "can-could", titre: "Can, could" },
              carte: { fr: "pourra (futur de pouvoir)", en: "will be able to" }
            },
            {
              re: ["(will|would|can|could|might) (be able to |manage to )?(follow|keep the rhythm|hold the rhythm|follow the rhythm|follow the pace)"],
              type: "faux-sens",
              pts: 0.5,
              faux: "will be able to follow",
              juste: "will be able to keep up",
              test: "At a time when artificial intelligence is absorbing more and more energy, it remains to be seen whether the power grid, already under strain around Dublin, will be able to follow.",
              pourquoi: "« To follow », c'est suivre quelqu'un ou quelque chose (follow a car, follow the news). « Suivre » au sens de « tenir le rythme, ne pas se laisser dépasser » se dit keep up (ou keep pace, cope).",
              regle: "Suivre le rythme, tenir : <b>to keep up (with)</b>, to keep pace (with), to cope. To follow : suivre (une personne, un chemin, une règle).",
              ex: "Supply cannot keep up with demand.",
              exfr: "L'offre ne parvient pas à suivre la demande.",
              carte: { fr: "suivre (le rythme)", en: "to keep up (follow = suivre quelqu'un)" }
            }
          ]
        }
      ]
    }
  ]
};
