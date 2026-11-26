/* Thème du jour d'anglais, 27 novembre 2026 (voir CLAUDE.md, « Thème du jour »).
   ((…)) = mot d'une carte du paquet d'anglais (cartes, dans l'ordre) ; [[…]] = mot nouveau (aides, dans l'ordre).
   Motifs `ok` et `re` : expressions régulières en minuscules, sans accents, nombres en chiffres, orthographe
   américaine, jamais de tiret (flashcards/theme-correcteur.js). Faits : actualites/en/articles/
   uk-record-heat-deaths-ukhsa-2026.html, d'après l'UKHSA (« Interim heat mortality monitoring report, England:
   summer 2026 », gov.uk, mis à jour le 24 novembre 2026 : 5 258 décès associés à la chaleur, intervalle de confiance
   à 95 % de 4 410 à 6 105, sept épisodes et 41 jours ; précédent record 2 985 en 2022 ; épisodes du 24 au 27 mai,
   792 décès, et du 21 au 28 juin, 2 401 décès ; suivi depuis 2016 ; chiffres définitifs attendus au début de 2027
   dans le rapport annuel de statistiques officielles), et le communiqué du ministère de la Santé (« Over £1.5
   billion to help NHS withstand year-round pressure », gov.uk, 9 septembre 2026 : « more than £32 million for
   projects that involve improving cooling, ventilation and overheating »). 5 258 / 2 985 = + 76 %. */
window.ECG_THEMES_DONNEES = window.ECG_THEMES_DONNEES || {};
window.ECG_THEMES_DONNEES["anglais/2026-11-27"] = {
  langue: "anglais",
  date: "2026-11-27",
  titre: "Angleterre : 5 258 décès liés à la chaleur, l'été 2026 pulvérise le record",
  phrases: [
    {
      fr: "L'agence britannique de sécurité sanitaire ((chiffre)) à 5 258 le nombre de décès liés à la [[chaleur]] en Angleterre durant l'été 2026, le total le plus élevé [[depuis le début des relevés]], en 2016.",
      cartes: [
        {
          id: "fc0c4e6aef",
          fr: "chiffrer qqch à, estimer qqch à",
          en: "to put sth at",
          re: "(puts|put|places|placed|sets|set)( [^ ]+){1,16} at (about |some |around )?5258"
        }
      ],
      aides: [
        {
          fr: "la chaleur",
          en: "heat"
        },
        {
          fr: "depuis le début des relevés",
          en: "since records began"
        }
      ],
      proposition: "The UK Health Security Agency puts the number of heat-related deaths in England during the summer of 2026 at 5,258, the highest total since records began in 2016.",
      autres: [
        "The UK Health Security Agency estimates that heat was linked to 5,258 deaths in England in summer 2026, the highest figure since monitoring began in 2016."
      ],
      tests: [
        "Britain's Health Security Agency put the toll of heat-associated deaths in England over the summer of 2026 at 5,258, the highest since records began in 2016.",
        "According to the UKHSA, 5,258 deaths in England were linked to the heat during the 2026 summer, the highest total since the start of monitoring in 2016."
      ],
      morceaux: [
        {
          fr: "L'agence britannique de sécurité sanitaire",
          en: "The UK Health Security Agency",
          pourquoi: "L'agence porte un nom officiel, UK Health Security Agency (UKHSA). « Sanitaire » se traduit par health : l'adjectif britannique se place devant (the British health agency).",
          pts: 0.5,
          ok: [
            "(the )?((uk|british|britain's|uk's|united kingdom's|english|england's) )?(health security agency|public health agency|health protection agency|agency for health security|health agency)( ukhsa)?|(the )?ukhsa"
          ],
          fautes: [
            {
              re: [
                "sanitary",
                "sanitarian"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "the British agency of sanitary security",
              juste: "the UK Health Security Agency",
              test: "The British agency of sanitary security puts the number of heat-related deaths in England during the summer of 2026 at 5,258, the highest total since records began in 2016.",
              pourquoi: "Faux ami. Sanitary renvoie à l'hygiène et aux installations sanitaires (sanitary towels, sanitary conditions) : « an agency of sanitary security » ferait penser à un service des toilettes publiques. La santé publique, c'est health.",
              regle: "Sanitaire (santé publique) : <b>health</b> (a health crisis, a health agency). Sanitary : <b>hygiénique</b>.",
              ex: "The pandemic was the worst health crisis in a century.",
              exfr: "La pandémie a été la pire crise sanitaire depuis un siècle.",
              carte: {
                fr: "sanitaire (santé publique)",
                en: "health (sanitary = hygiénique)"
              }
            },
            {
              re: [
                "agency (british|britannic)",
                "britannic"
              ],
              type: "gallicisme",
              pts: 0.25,
              faux: "the agency British of health security",
              juste: "the British health security agency",
              test: "The agency British of health security puts the number of heat-related deaths in England during the summer of 2026 at 5,258, the highest total since records began in 2016.",
              pourquoi: "En anglais, l'adjectif épithète se place devant le nom et ne s'accorde pas : the British agency, jamais the agency British. Britannic est réservé à quelques titres anciens (Her Britannic Majesty).",
              regle: "<b>Adjectif + nom</b> : a British agency, a public body. L'adjectif reste invariable.",
              ex: "A British company has built the new hospital.",
              exfr: "Une entreprise britannique a construit le nouvel hôpital.",
              lecon: {
                n: 8,
                ancre: "adjectif-position",
                titre: "La place de l'adjectif épithète"
              },
              carte: {
                fr: "l'agence britannique",
                en: "the British agency (adjectif devant)"
              }
            }
          ]
        },
        {
          fr: "chiffre à 5 258 le nombre de",
          en: "puts the number of … at 5,258",
          pourquoi: "« Chiffrer quelque chose à » : to put something at + nombre (put the number at 5,258), ou estimate something at. La préposition est at, et le chiffre vient en dernier. On peut aussi tourner : estimates that 5,258 deaths…",
          pts: 1,
          ok: [
            "(puts|put|has put|places|placed|has placed|sets|set|has set|estimates|estimated|has estimated) the (number|toll|death toll|total|figure|count|tally)( (of|linked|related|associated|from|caused)( [^ ]+){1,16}?)? at (about |some |around |roughly )?5258",
            "(puts|put|has put|places|placed|estimates|estimated) at 5258 the (number|toll|death toll|total|figure|count|tally)",
            "(estimates|estimated|has estimated|says|said|reports|reported|has reported|records|recorded|has recorded|counts|counted|has counted|calculates|calculated|has calculated|believes|found|finds|has found)( that)?( there were| heat (was|has been) (linked|associated) (to|with))? (about |some |around |roughly )?5258",
            "(according to|for) (the )?(uk|british)? ?(health security agency|public health agency|health agency|ukhsa)( ukhsa)?,? (about |some |around )?5258"
          ],
          fautes: [
            {
              re: [
                "(puts|put|places|placed|sets|set|estimates|estimated|evaluates|evaluated|figures|numbers|quantifies|quantified) (the )?(number|toll|death toll|total|figure|count|tally)( of( [^ ]+){1,14}?)? to 5258",
                "(puts|put|places|placed|sets|set|estimates|estimated|evaluates|evaluated|figures|quantifies|quantified) to 5258"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "puts the number of deaths to 5,258",
              juste: "puts the number of deaths at 5,258",
              test: "The UK Health Security Agency puts the number of heat-related deaths in England during the summer of 2026 to 5,258, the highest total since records began in 2016.",
              pourquoi: "Le français dit « chiffrer à », et à se traduit souvent par to. Mais pour un chiffre estimé, l'anglais emploie at : on situe le nombre à un point de l'échelle (put sth at 5,258, estimate sth at 5,258).",
              regle: "<b>Put / estimate / value sth at</b> + chiffre (the toll was put at 5,258).",
              ex: "Experts put the cost of the damage at 2 billion pounds.",
              exfr: "Les experts chiffrent le coût des dégâts à 2 milliards de livres.",
              carte: {
                fr: "chiffrer qqch à",
                en: "to put sth at (at + chiffre)"
              }
            },
            {
              re: [
                "ciphers?",
                "ciphered",
                "ciphering",
                "chiffres?"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "the agency ciphers the number at 5,258",
              juste: "the agency puts the number at 5,258",
              test: "The UK Health Security Agency ciphers the number of heat-related deaths in England during the summer of 2026 at 5,258, the highest total since records began in 2016.",
              pourquoi: "To cipher veut dire chiffrer au sens de coder un message secret. Donner un nombre, une estimation, se dit to put at ou to estimate at.",
              regle: "Chiffrer (évaluer) : <b>to put at, to estimate at</b>. Chiffrer (coder) : to encrypt, to cipher.",
              ex: "The government puts the cost of the plan at 1 billion pounds.",
              exfr: "Le gouvernement chiffre le coût du plan à 1 milliard de livres.",
              carte: {
                fr: "chiffrer (évaluer)",
                en: "to put at, to estimate at"
              }
            }
          ]
        },
        {
          fr: "décès liés à la chaleur",
          en: "heat-related deaths",
          pourquoi: "« Les décès liés à la chaleur » : heat-related deaths, le nom qui précise devant (heat), ou deaths linked to the heat. Death est le mot courant pour un décès ; « associé à » se dit associated with.",
          pts: 1,
          ok: [
            "(heat related|heat associated|heat linked|heat induced|heat caused) deaths",
            "(deaths|death toll|toll) (linked|related|associated|attributed|attributable|connected|tied) (to|with) (the )?(heat|hot weather|high temperatures|extreme heat)",
            "deaths (caused|triggered|brought on) by (the )?(heat|hot weather|high temperatures|extreme heat)",
            "heat (was|has been|had been) (linked|associated|tied|connected) (to|with) (about |some |around )?5258 deaths",
            "5258 deaths in england (were|have been) (linked|related|associated|attributed|tied) (to|with) (the )?(heat|hot weather|high temperatures)"
          ],
          fautes: [
            {
              re: [
                "deceases?",
                "deceased",
                "deces"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "the number of heat-related deceases",
              juste: "the number of heat-related deaths",
              test: "The UK Health Security Agency puts the number of heat-related deceases in England during the summer of 2026 at 5,258, the highest total since records began in 2016.",
              pourquoi: "Faux ami. The deceased désigne la personne morte (le défunt) dans une langue juridique, et deceases n'existe pas comme pluriel courant. Un décès, dans une statistique, c'est a death.",
              regle: "Un décès : <b>a death</b>. Le défunt : the deceased (langue juridique).",
              ex: "Road deaths fell by 5% last year.",
              exfr: "Les décès sur la route ont baissé de 5 % l'an dernier.",
              carte: {
                fr: "un décès",
                en: "a death (the deceased = le défunt)"
              }
            },
            {
              re: [
                "associated to"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "deaths associated to the heat",
              juste: "deaths associated with the heat",
              test: "The UK Health Security Agency puts the number of deaths associated to the heat in England during the summer of 2026 at 5,258, the highest total since records began in 2016.",
              pourquoi: "Associate se construit avec with : on associe une chose avec une autre (associated with the heat). « Associated to » est un calque de « associé à ». Linked to, related to prennent bien to.",
              regle: "<b>Associated with</b>, mais <b>linked to</b>, <b>related to</b>.",
              ex: "Smoking is associated with heart disease.",
              exfr: "Le tabac est associé aux maladies cardiaques.",
              carte: {
                fr: "associé à",
                en: "associated with (linked to)"
              }
            },
            {
              re: [
                "warmth",
                "hotness",
                "chaleur"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "deaths linked to the warmth",
              juste: "deaths linked to the heat",
              test: "The UK Health Security Agency puts the number of deaths linked to the warmth in England during the summer of 2026 at 5,258, the highest total since records began in 2016.",
              pourquoi: "Warmth est une chaleur agréable (la chaleur d'un feu, d'un accueil). La chaleur qui tue, celle d'une canicule, c'est heat.",
              regle: "La chaleur (forte, dangereuse) : <b>heat</b>. Une douce chaleur : warmth.",
              ex: "Elderly people are the most vulnerable to extreme heat.",
              exfr: "Les personnes âgées sont les plus vulnérables aux fortes chaleurs.",
              carte: {
                fr: "la chaleur (canicule)",
                en: "heat (warmth = douce chaleur)"
              }
            }
          ]
        },
        {
          fr: "en Angleterre durant l'été 2026,",
          en: "in England during the summer of 2026",
          pourquoi: "Une saison prend in ou during. « L'été 2026 » : the summer of 2026, summer 2026 sans article, ou the 2026 summer, mais jamais the summer 2026.",
          pts: 0.5,
          ok: [
            "in england( in| during| over| throughout| for)? (the )?(summer (of )?2026|2026 summer)",
            "(in|during|over|throughout|for) (the )?(summer (of )?2026|2026 summer) in england",
            "in england's summer of 2026|in england this summer|this summer in england",
            "deaths in england( [^ ]+){0,8} (during|in|over|throughout) (the )?(summer (of )?2026|2026 summer)"
          ],
          fautes: [
            {
              re: [
                "the summer 2026"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "during the summer 2026",
              juste: "during the summer of 2026 / in summer 2026",
              test: "The UK Health Security Agency puts the number of heat-related deaths in England during the summer 2026 at 5,258, the highest total since records began in 2016.",
              pourquoi: "Avec l'article, l'anglais relie la saison et l'année par of : the summer of 2026. Sans article, summer 2026 est possible ; on peut aussi dire the 2026 summer.",
              regle: "<b>The summer of 2026</b>, <b>summer 2026</b> ou <b>the 2026 summer</b>.",
              ex: "The summer of 2022 was the hottest on record in England.",
              exfr: "L'été 2022 a été le plus chaud jamais enregistré en Angleterre.",
              carte: {
                fr: "l'été 2026",
                en: "the summer of 2026, summer 2026"
              }
            },
            {
              re: [
                "(on|at) (the )?summer",
                "(at|to) england"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "at England on the summer of 2026",
              juste: "in England during the summer of 2026",
              test: "The UK Health Security Agency puts the number of heat-related deaths at England on the summer of 2026 at 5,258, the highest total since records began in 2016.",
              pourquoi: "Un pays et une saison sont vus comme des espaces qui contiennent l'événement : in England, in summer (ou during the summer). On s'emploie pour un jour, at pour un point précis.",
              regle: "<b>In</b> + pays, saison (in England, in summer). <b>On</b> + jour. <b>At</b> + heure, point précis.",
              ex: "Many hospitals overheat in summer.",
              exfr: "Beaucoup d'hôpitaux surchauffent l'été.",
              lecon: {
                n: 9,
                ancre: "temps-detail",
                titre: "In, on, at : la position dans le temps"
              },
              carte: {
                fr: "en Angleterre, en été",
                en: "in England, in summer"
              }
            }
          ]
        },
        {
          fr: "le total le plus élevé depuis le début des relevés, en 2016.",
          en: "the highest total since records began in 2016",
          pourquoi: "Superlatif d'un adjectif court : the highest. « Depuis le début des relevés » : since records began, tournure figée, au prétérit car le début est un moment passé daté (2016).",
          pts: 1,
          ok: [
            "(the|a|its) (highest|biggest|largest|worst|heaviest|record)( (annual |yearly |seasonal )?(total|figure|toll|death toll|number|count|level|tally))?( ever)?( recorded| on record| seen| registered)? since ((records|monitoring|record keeping|recordkeeping|tracking|recording|readings|data collection|surveillance) (began|started|was introduced|were introduced|was launched|was set up)|the (start|beginning|launch|introduction) of (records|monitoring|record keeping|recordkeeping|tracking|recording|data collection|surveillance))(,? in 2016)?",
            "(the|a|its) (highest|biggest|largest|worst|heaviest|record)( (annual |yearly |seasonal )?(total|figure|toll|death toll|number|count|level|tally))?( ever)?( recorded| on record| seen| registered)? since 2016,? when (records|monitoring|record keeping|recordkeeping|tracking|recording|readings|data collection|surveillance) (began|started|was introduced|were introduced|was launched|was set up)",
            "(the|a|its) (highest|biggest|largest|worst|heaviest|record)( (annual |yearly |seasonal )?(total|figure|toll|death toll|number|count|level|tally))?( ever)?( recorded| on record| seen| registered)? since 2016",
            "(a|the) record (high )?since ((records|monitoring|record keeping|recordkeeping|tracking|recording|readings|data collection|surveillance) (began|started|was introduced|were introduced|was launched|was set up)|the (start|beginning|launch|introduction) of (records|monitoring|record keeping|recordkeeping|tracking|recording|data collection|surveillance)|2016)"
          ],
          fautes: [
            {
              re: [
                "(the |a )?(most|more) (high|big|large|heavy|bad)",
                "the higher (total|figure|toll|number|count|level|tally)",
                "most highest",
                "more higher"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "the most high total / the higher total",
              juste: "the highest total",
              test: "The UK Health Security Agency puts the number of heat-related deaths in England during the summer of 2026 at 5,258, the most high total since records began in 2016.",
              pourquoi: "High est un adjectif court : son superlatif se forme avec -est (high, higher, the highest). Most ne va qu'avec les adjectifs longs, et the higher est un comparatif (le plus haut des deux).",
              regle: "Adjectif court : <b>the + adj-est</b> (the highest). Adjectif long : <b>the most + adj</b>.",
              ex: "It was the highest temperature ever recorded in the UK.",
              exfr: "C'était la température la plus élevée jamais relevée au Royaume-Uni.",
              lecon: {
                n: 22,
                ancre: "superlatif",
                titre: "Le superlatif"
              },
              carte: {
                fr: "le plus élevé",
                en: "the highest (high, higher, the highest)"
              }
            },
            {
              re: [
                "(follow up|followup|following|follow|suivi|statements|releves) (began|started)",
                "(start|beginning) of (the )?(follow up|followup|following|follow|suivi|statements|releves)"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "since the beginning of the follow-up",
              juste: "since records began / since monitoring began",
              test: "The UK Health Security Agency puts the number of heat-related deaths in England during the summer of 2026 at 5,258, the highest total since the beginning of the follow-up in 2016.",
              pourquoi: "« Le suivi » d'un phénomène dans le temps se dit monitoring, et « les relevés », records. A follow-up est une suite donnée à quelque chose (un rendez-vous de contrôle, un article qui fait suite).",
              regle: "Depuis le début des relevés : <b>since records began</b>. Le suivi : <b>monitoring</b>. A follow-up : une suite.",
              ex: "It was the wettest month since records began in 1836.",
              exfr: "Ce fut le mois le plus pluvieux depuis le début des relevés, en 1836.",
              carte: {
                fr: "depuis le début des relevés",
                en: "since records began"
              }
            },
            {
              re: [
                "since (records|monitoring|record keeping|tracking|recording|readings) (begin|begins|have begun|has begun|have started|has started|start|starts)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "since records have begun",
              juste: "since records began",
              test: "The UK Health Security Agency puts the number of heat-related deaths in England during the summer of 2026 at 5,258, the highest total since records have begun in 2016.",
              pourquoi: "Après since, le point de départ est un moment passé et daté (le début des relevés, en 2016) : il se met au prétérit (since records began). C'est la proposition principale qui peut être au present perfect.",
              regle: "<b>Since + prétérit</b> pour le point de départ (since records began, since I arrived).",
              ex: "Temperatures have risen since records began.",
              exfr: "Les températures ont augmenté depuis le début des relevés.",
              lecon: {
                n: 15,
                ancre: "since-detail",
                titre: "Since : le point de départ"
              },
              carte: {
                fr: "depuis que + passé",
                en: "since + prétérit (since records began)"
              }
            }
          ]
        }
      ]
    },
    {
      fr: "Ce bilan est supérieur de 76 % au précédent record, établi en 2022, et même la [[borne basse]] de l'estimation, 4 410 décès, ((dépasse)) les 2 985 morts d'il y a quatre ans.",
      cartes: [
        {
          id: "6427b05eed",
          fr: "dépasser",
          en: "to exceed · to top",
          re: "exceed(s|ed|ing)?|tops|topped|topping"
        }
      ],
      aides: [
        {
          fr: "la borne basse (d'une estimation)",
          en: "the lower bound, the low end"
        }
      ],
      proposition: "This toll is 76% higher than the previous record, set in 2022, and even the lower bound of the estimate, 4,410 deaths, exceeds the 2,985 deaths recorded four years ago.",
      autres: [
        "This figure is 76% above the previous record, which dates from 2022, and even the low end of the estimate, 4,410 deaths, tops the 2,985 deaths of four years ago."
      ],
      tests: [
        "The toll exceeds the previous record, set in 2022, by 76 percent, and even the lowest estimate, 4,410 deaths, is higher than the 2,985 deaths recorded four years earlier.",
        "This total is 76% greater than the former record of 2022, and even the lower end of the range, 4,410 deaths, is still above the 2,985 deaths of four years ago."
      ],
      morceaux: [
        {
          fr: "Ce bilan est supérieur de 76 % au précédent record,",
          en: "This toll is 76% higher than the previous record",
          pourquoi: "« Supérieur de 76 % à » : 76% higher than, l'écart chiffré devant le comparatif, puis than. Un bilan humain se dit a toll (a death toll). On peut aussi dire exceeds the previous record by 76%.",
          pts: 1.5,
          ok: [
            "(this|that|the|its) (toll|figure|total|number|death toll|count|tally|estimate|result|record) (is|stands|comes in|sits|was) (some |about |around |almost )?76 percent (higher than|greater than|bigger than|larger than|more than|heavier than|worse than|above|up on|over) the (previous|former|last|old|preceding|earlier|prior) (record|high|peak|record high|record figure|record total)",
            "(this|that|the|its) (toll|figure|total|number|death toll|count|tally|estimate|result|record) (exceeds|tops|surpasses|beats|outstrips|eclipses|is above|outdoes|smashes|breaks) the (previous|former|last|old|preceding|earlier|prior) (record|high|peak|record high|record figure|record total)( [^ ]+){0,4} by (some |about |around )?76 percent",
            "(this|that|the|its) (toll|figure|total|number|death toll|count|tally|estimate|result|record) (represents|marks|is) (a|an) (76 percent (increase|rise|jump)|(increase|rise|jump) of 76 percent) (on|over|compared with|compared to|from|against) the (previous|former|last|old|preceding|earlier|prior) (record|high|peak|record high|record figure|record total)",
            "(this|that|the|its) (toll|figure|total|number|death toll|count|tally|estimate|result|record) is (up )?76 percent (up )?(on|over|above) the (previous|former|last|old|preceding|earlier|prior) (record|high|peak|record high|record figure|record total)"
          ],
          fautes: [
            {
              re: [
                "superior"
              ],
              type: "faux-sens",
              pts: 0.75,
              faux: "This toll is 76% superior to the previous record",
              juste: "This toll is 76% higher than the previous record",
              test: "This toll is 76% superior to the previous record, set in 2022, and even the lower bound of the estimate, 4,410 deaths, exceeds the 2,985 deaths recorded four years ago.",
              pourquoi: "Faux ami. Superior veut dire « de meilleure qualité » ou « hiérarchiquement au-dessus » (a superior product, my superior). Pour un chiffre plus grand, l'anglais emploie un comparatif : higher than, greater than, above.",
              regle: "Supérieur à (un chiffre) : <b>higher than, greater than, above</b>. Superior : de meilleure qualité, supérieur hiérarchique.",
              ex: "Inflation is higher than expected.",
              exfr: "L'inflation est supérieure aux prévisions.",
              carte: {
                fr: "supérieur à (un chiffre)",
                en: "higher than (superior = de meilleure qualité)"
              }
            },
            {
              re: [
                "76 percent (higher|greater|bigger|larger|more|heavier) (that|as|to|at)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "76% higher that the previous record",
              juste: "76% higher than the previous record",
              test: "This toll is 76% higher that the previous record, set in 2022, and even the lower bound of the estimate, 4,410 deaths, exceeds the 2,985 deaths recorded four years ago.",
              pourquoi: "Après un comparatif (higher, greater, more), le « que » se dit toujours than. That et as ne conviennent pas ici (as … as sert à la comparaison d'égalité).",
              regle: "<b>Comparatif + than</b> (higher than, more than). Égalité : <b>as … as</b>.",
              ex: "This year's toll is far higher than last year's.",
              exfr: "Le bilan de cette année est bien supérieur à celui de l'an dernier.",
              lecon: {
                n: 22,
                ancre: "comp-court",
                titre: "Le comparatif des adjectifs courts"
              },
              carte: {
                fr: "plus élevé que",
                en: "higher than (than après un comparatif)"
              }
            },
            {
              re: [
                "(higher|greater|bigger|larger|more|superior|up|heavier) of 76 percent"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "higher of 76% than the previous record",
              juste: "76% higher than the previous record",
              test: "This toll is higher of 76% than the previous record, set in 2022, and even the lower bound of the estimate, 4,410 deaths, exceeds the 2,985 deaths recorded four years ago.",
              pourquoi: "Le « de » de « supérieur de 76 % » ne se traduit pas par of. L'écart se place devant le comparatif (76% higher than), ou après by (higher by 76%, exceeds it by 76%).",
              regle: "<b>Écart + comparatif + than</b> (76% higher than), ou <b>by</b> + écart (up by 76%).",
              ex: "Sales are 10% higher than last year.",
              exfr: "Les ventes sont supérieures de 10 % à celles de l'an dernier.",
              lecon: {
                n: 22,
                ancre: "structures-avancees",
                titre: "Comparatifs : structures avancées"
              },
              carte: {
                fr: "supérieur de 76 % à",
                en: "76% higher than"
              }
            }
          ]
        },
        {
          fr: "établi en 2022,",
          en: "set in 2022",
          pourquoi: "Un record « s'établit » : on dit set a record, d'où le participe set (set in 2022). Une année prend in.",
          pts: 0.5,
          ok: [
            "(set|established|reached|recorded|registered|which was set|that was set|dating from|dating back to|which dates from|that dates from|which dates back to)( in| back in)? 2022",
            "(record|high|peak|figure|total|toll) (of|from|in) 2022",
            "the 2022 (record|high|peak|figure|total|toll)|2022 s (record|figure|total|toll)"
          ],
          fautes: [
            {
              re: [
                "(set|established|reached|recorded|fixed|registered)( back)? (on|at|for|since) 2022"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "set on 2022",
              juste: "set in 2022",
              test: "This toll is 76% higher than the previous record, set on 2022, and even the lower bound of the estimate, 4,410 deaths, exceeds the 2,985 deaths recorded four years ago.",
              pourquoi: "Une année est une période : in 2022. On ne s'emploie que devant un jour ou une date (on 19 July 2022).",
              regle: "<b>In</b> + année, mois, saison. <b>On</b> + jour, date.",
              ex: "The previous record was set in 2022.",
              exfr: "Le précédent record avait été établi en 2022.",
              lecon: {
                n: 9,
                ancre: "temps-detail",
                titre: "In, on, at : la position dans le temps"
              },
              carte: {
                fr: "établi en 2022",
                en: "set in 2022 (in + année)"
              }
            }
          ]
        },
        {
          fr: "et même la borne basse de l'estimation, 4 410 décès,",
          en: "and even the lower bound of the estimate, 4,410 deaths",
          pourquoi: "« Même », devant un nom, pour souligner : even (even the lower bound). La borne basse d'une estimation : the lower bound, the low end of the range, ou the lowest estimate.",
          pts: 1,
          ok: [
            "(and )?even the (lower|lowest|bottom|low) (bound|end|limit|estimate|figure|point|end of the range|end of the estimate|end of the confidence interval)( of the (estimate|estimation|range|confidence interval|estimated range|agency's estimate|ukhsa's estimate))?( at| of| or| that is| ie| namely)? 4410( deaths| dead| victims| heat related deaths| heat associated deaths)?",
            "(and )?even the (most )?(cautious|conservative|prudent|lowest) (estimate|figure)( at| of)? 4410( deaths| dead| victims| heat related deaths| heat associated deaths)?"
          ],
          fautes: [
            {
              re: [
                "(lower|low|bottom|down) (border|terminal|bollard|milestone|marker)",
                "borne",
                "basse"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "the lower border of the estimate",
              juste: "the lower bound of the estimate",
              test: "This toll is 76% higher than the previous record, set in 2022, and even the lower border of the estimate, 4,410 deaths, exceeds the 2,985 deaths recorded four years ago.",
              pourquoi: "A border est une frontière entre deux pays ou un bord. Les deux bornes d'une estimation, d'un intervalle, sont ses bounds (lower bound, upper bound), ou les deux bouts de la fourchette (the low end, the high end).",
              regle: "Borne basse, borne haute : <b>lower bound, upper bound</b>, ou <b>the low end, the high end</b> (of the range).",
              ex: "The upper bound of the estimate is 6,105 deaths.",
              exfr: "La borne haute de l'estimation est de 6 105 décès.",
              carte: {
                fr: "la borne basse",
                en: "the lower bound, the low end"
              }
            },
            {
              re: [
                "same the (lower|low|bottom|lowest|most)",
                "the same (lower|low|bottom|lowest) (bound|end|limit|estimate)"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "and same the lower bound",
              juste: "and even the lower bound",
              test: "This toll is 76% higher than the previous record, set in 2022, and same the lower bound of the estimate, 4,410 deaths, exceeds the 2,985 deaths recorded four years ago.",
              pourquoi: "« Même » a deux sens. Pour insister (« même lui », « même la borne basse ») : even. Pour l'identité (« le même chiffre ») : the same. « Same the lower bound » ne veut rien dire.",
              regle: "Même (insistance) : <b>even</b> + nom. Le même : <b>the same</b> + nom.",
              ex: "Even the most cautious estimate is alarming.",
              exfr: "Même l'estimation la plus prudente est alarmante.",
              carte: {
                fr: "même (insistance)",
                en: "even (the same = le même)"
              }
            }
          ]
        },
        {
          fr: "dépasse les 2 985 morts d'il y a quatre ans.",
          en: "exceeds the 2,985 deaths recorded four years ago",
          pourquoi: "« Dépasser » un chiffre : exceed, top, ou be higher than ; le sujet est la borne, au singulier, donc exceeds. « Il y a quatre ans » : four years ago, ago placé après la durée.",
          pts: 1,
          ok: [
            "(exceeds|tops|surpasses|is above|is higher than|is greater than|outstrips|beats|remains above|remains higher than|is still above|is still higher than|still exceeds|still tops|stays above|is more than|exceeded|topped|was above|was higher than|outnumbers)( the)? 2985( deaths| dead| victims| heat related deaths| heat associated deaths)?( recorded| registered| counted| estimated| seen| reported| observed)?( 4 years (ago|earlier)| from 4 years ago| of 4 years ago| in 2022)"
          ],
          fautes: [
            {
              re: [
                "(there (is|are|were|was)|has|have|since|it is|it has been|before|il y a) 4 years",
                "4 years before"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "the 2,985 deaths of there are four years",
              juste: "the 2,985 deaths of four years ago",
              test: "This toll is 76% higher than the previous record, set in 2022, and even the lower bound of the estimate, 4,410 deaths, exceeds the 2,985 deaths recorded there are four years.",
              pourquoi: "« Il y a » + durée, pour situer un fait dans le passé, se dit ago, placé après la durée : four years ago. There are four years voudrait dire « il existe quatre ans », et four years before situe par rapport à un autre moment passé.",
              regle: "<b>Durée + ago</b> (four years ago), avec un verbe au prétérit. Avant un moment passé : <b>before, earlier</b>.",
              ex: "The previous record was set four years ago.",
              exfr: "Le précédent record a été établi il y a quatre ans.",
              lecon: {
                n: 13,
                ancre: "marqueurs",
                titre: "Les marqueurs du prétérit"
              },
              carte: {
                fr: "il y a quatre ans",
                en: "four years ago (ago après la durée)"
              }
            },
            {
              re: [
                "overpass(es|ed)?",
                "depass(es|ed)?"
              ],
              type: "barbarisme",
              pts: 0.5,
              faux: "overpasses the 2,985 deaths",
              juste: "exceeds the 2,985 deaths",
              test: "This toll is 76% higher than the previous record, set in 2022, and even the lower bound of the estimate, 4,410 deaths, overpasses the 2,985 deaths recorded four years ago.",
              pourquoi: "An overpass est un pont routier (un passage supérieur), pas un verbe ; depass n'existe pas. Dépasser un chiffre, un seuil : exceed, top, surpass.",
              regle: "Dépasser (un chiffre, un seuil) : <b>to exceed, to top, to surpass</b>. Dépasser (une voiture) : to overtake.",
              ex: "Temperatures exceeded 40°C for the first time in 2022.",
              exfr: "Les températures ont dépassé 40 °C pour la première fois en 2022.",
              carte: {
                fr: "dépasser (un chiffre)",
                en: "to exceed, to top"
              }
            }
          ]
        }
      ]
    },
    {
      fr: "Ce sont ((surtout)) les deux premières [[vagues de chaleur]], fin mai et fin juin, qui ont tué : à elles seules, elles ont fait plus de 3 000 morts.",
      cartes: [
        {
          id: "17f96e1334",
          fr: "surtout, avant tout",
          en: "above all",
          re: "above all"
        }
      ],
      aides: [
        {
          fr: "une vague de chaleur, une canicule",
          en: "a heatwave"
        }
      ],
      proposition: "It was above all the first two heatwaves, in late May and late June, that were the deadliest: on their own, they caused more than 3,000 deaths.",
      autres: [
        "It was above all the first two heatwaves, at the end of May and the end of June, that killed: between them, they caused over 3,000 deaths."
      ],
      tests: [
        "Above all, it was the first two heat waves, in late May and in late June, that proved deadly: on their own they claimed more than 3,000 lives.",
        "It was mainly the first two heatwaves, at the end of May and at the end of June, that took the heaviest toll: alone, they were responsible for more than 3,000 deaths."
      ],
      morceaux: [
        {
          fr: "Ce sont surtout … qui ont tué :",
          en: "It was above all … that were the deadliest",
          pourquoi: "« Ce sont … qui » met un élément en relief : la phrase clivée it was … that, au passé puisque les faits sont passés (it was, même devant un pluriel). That (ou which) pour des choses, jamais who. « Surtout » : above all, mainly.",
          pts: 1.5,
          ok: [
            "it (was|were) (above all|mainly|mostly|chiefly|primarily|especially|particularly|in particular|first and foremost|principally|largely|essentially|predominantly) the first 2( [^ ]+){1,12}? (that|which) (killed|kill people|killed people|were (the )?deadl(y|iest)|were the most deadly|were the most lethal|were lethal|proved (the )?deadl(y|iest)|proved the most deadly|proved lethal|did (most of )?the killing|took the (heaviest|biggest|greatest|highest) toll|claimed (the most|most) lives|caused (the most|most of the|most) deaths|were the killers|caused the deaths|were responsible for (the )?most (of the )?deaths|did the most damage|cost (the most|most) lives)",
            "(above all|mainly|mostly|chiefly|primarily|especially|particularly|in particular|first and foremost|principally|largely|essentially|predominantly),? it (was|were) the first 2( [^ ]+){1,12}? (that|which) (killed|kill people|killed people|were (the )?deadl(y|iest)|were the most deadly|were the most lethal|were lethal|proved (the )?deadl(y|iest)|proved the most deadly|proved lethal|did (most of )?the killing|took the (heaviest|biggest|greatest|highest) toll|claimed (the most|most) lives|caused (the most|most of the|most) deaths|were the killers|caused the deaths|were responsible for (the )?most (of the )?deaths|did the most damage|cost (the most|most) lives)",
            "it (was|were) the first 2( [^ ]+){1,12}? (above all|mainly|mostly|chiefly|primarily|especially|particularly|in particular|first and foremost|principally|largely|essentially|predominantly)( [^ ]+){0,12}? (that|which) (killed|kill people|killed people|were (the )?deadl(y|iest)|were the most deadly|were the most lethal|were lethal|proved (the )?deadl(y|iest)|proved the most deadly|proved lethal|did (most of )?the killing|took the (heaviest|biggest|greatest|highest) toll|claimed (the most|most) lives|caused (the most|most of the|most) deaths|were the killers|caused the deaths|were responsible for (the )?most (of the )?deaths|did the most damage|cost (the most|most) lives)",
            "(above all|mainly|mostly|chiefly|primarily|especially|particularly|in particular|first and foremost|principally|largely|essentially|predominantly),? the first 2( [^ ]+){1,12}? (killed|kill people|killed people|were (the )?deadl(y|iest)|were the most deadly|were the most lethal|were lethal|proved (the )?deadl(y|iest)|proved the most deadly|proved lethal|did (most of )?the killing|took the (heaviest|biggest|greatest|highest) toll|claimed (the most|most) lives|caused (the most|most of the|most) deaths|were the killers|caused the deaths|were responsible for (the )?most (of the )?deaths|did the most damage|cost (the most|most) lives)",
            "the first 2( [^ ]+){1,12}? (above all|mainly|mostly|chiefly|primarily|especially|particularly|in particular|first and foremost|principally|largely|essentially|predominantly) (killed|kill people|killed people|were (the )?deadl(y|iest)|were the most deadly|were the most lethal|were lethal|proved (the )?deadl(y|iest)|proved the most deadly|proved lethal|did (most of )?the killing|took the (heaviest|biggest|greatest|highest) toll|claimed (the most|most) lives|caused (the most|most of the|most) deaths|were the killers|caused the deaths|were responsible for (the )?most (of the )?deaths|did the most damage|cost (the most|most) lives)",
            "the first 2( [^ ]+){1,12}? (were|proved)( by far)?( (above all|mainly|mostly|chiefly|primarily|especially|particularly|in particular|first and foremost|principally|largely|essentially|predominantly))? (the deadliest|the most deadly|the most lethal)",
            "most (of the )?(deaths|victims|people|fatalities) (died|were killed|occurred|came|happened) (during|in) the first 2"
          ],
          fautes: [
            {
              re: [
                "it is ((above all|mainly|mostly|chiefly|primarily|especially|particularly|in particular|first and foremost|principally|largely|essentially|predominantly) )?the (first 2|2 first)",
                "(these|those|they|this) (are|is|were) ((above all|mainly|mostly|chiefly|primarily|especially|particularly|in particular|first and foremost|principally|largely|essentially|predominantly) )?the (first 2|2 first)"
              ],
              type: "grammaire",
              pts: 0.75,
              faux: "These are above all the first two heatwaves that killed",
              juste: "It was above all the first two heatwaves that were the deadliest",
              test: "These are above all the first two heatwaves, in late May and late June, that were the deadliest: on their own, they caused more than 3,000 deaths.",
              pourquoi: "« Ce sont … qui » ne se calque pas par these are : la mise en relief se fait avec it, toujours au singulier (it was the heatwaves that…). Et quand les faits sont passés, it is devient it was.",
              regle: "Phrase clivée : <b>it is / it was + élément + that</b> (it was the heatwaves that killed). It était au passé si la phrase est au passé.",
              ex: "It was the June heatwave that caused the most deaths.",
              exfr: "C'est la canicule de juin qui a fait le plus de morts.",
              lecon: {
                n: 29,
                ancre: "cleft",
                titre: "La phrase clivée : it is / was … that"
              },
              carte: {
                fr: "ce sont … qui (passé)",
                en: "it was … that"
              }
            },
            {
              re: [
                "who (killed|were|was|proved|did|took|claimed|caused|have|had)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "the first two heatwaves who killed",
              juste: "the first two heatwaves that killed",
              test: "It was above all the first two heatwaves, in late May and late June, who were the deadliest: on their own, they caused more than 3,000 deaths.",
              pourquoi: "Who ne renvoie qu'à des personnes. Pour des choses (des vagues de chaleur), la clivée et la relative prennent that, ou which.",
              regle: "<b>Who</b> : personnes. <b>That / which</b> : choses (it was the heat that killed).",
              ex: "It was the heat that worried doctors, not the drought.",
              exfr: "C'est la chaleur qui inquiétait les médecins, pas la sécheresse.",
              lecon: {
                n: 26,
                ancre: "sujet",
                titre: "Les relatifs sujets : who, which, that"
              },
              carte: {
                fr: "qui (pour une chose)",
                en: "that, which (who = personnes)"
              }
            },
            {
              re: [
                "(that|which) (have|has) (killed|been|caused|claimed|proved)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "the heatwaves that have killed",
              juste: "the heatwaves that killed",
              test: "It was above all the first two heatwaves, in late May and late June, that have killed: on their own, they caused more than 3,000 deaths.",
              pourquoi: "Les vagues de chaleur de mai et de juin sont des faits passés et datés : le prétérit s'impose (that killed). Le present perfect ne va pas avec un moment révolu.",
              regle: "Moment passé précis (in May, in June, last summer) : <b>prétérit</b>.",
              ex: "The heatwave killed 2,401 people in June.",
              exfr: "La canicule a fait 2 401 morts en juin.",
              lecon: {
                n: 14,
                ancre: "comparaison",
                titre: "Present perfect ou prétérit"
              },
              carte: {
                fr: "ont tué (en mai, en juin)",
                en: "killed (prétérit + date)"
              }
            },
            {
              re: [
                "murderous",
                "murderers?",
                "murdering"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "the most murderous heatwaves",
              juste: "the deadliest heatwaves",
              test: "It was above all the first two heatwaves, in late May and late June, that were the most murderous: on their own, they caused more than 3,000 deaths.",
              pourquoi: "Murderous suppose une intention de tuer (un régime meurtrier, a murderous dictator). Une catastrophe naturelle « meurtrière » est deadly, the deadliest au superlatif.",
              regle: "Meurtrier (catastrophe, épidémie) : <b>deadly</b> (the deadliest). Murderous : qui veut tuer.",
              ex: "It was the deadliest storm in decades.",
              exfr: "Ce fut la tempête la plus meurtrière depuis des décennies.",
              carte: {
                fr: "meurtrier (catastrophe)",
                en: "deadly (murderous = qui veut tuer)"
              }
            }
          ]
        },
        {
          fr: "les deux premières vagues de chaleur,",
          en: "the first two heatwaves",
          pourquoi: "« Les deux premières » : the first two, l'ordinal d'abord, le nombre ensuite (l'inverse du français). Une vague de chaleur : a heatwave (ou heat wave), le nom qui précise devant.",
          pts: 1,
          ok: [
            "the first 2 (heatwaves|heat waves|heat episodes|episodes of heat|hot spells|heat spells|spells of hot weather|bouts of heat|periods of extreme heat|episodes of extreme heat|periods of intense heat|bouts of extreme heat)"
          ],
          fautes: [
            {
              re: [
                "the 2 first"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "the two first heatwaves",
              juste: "the first two heatwaves",
              test: "It was above all the two first heatwaves, in late May and late June, that were the deadliest: on their own, they caused more than 3,000 deaths.",
              pourquoi: "Le français dit « les deux premières ». L'anglais met l'ordinal d'abord, le nombre ensuite : the first two, the last three, the next five.",
              regle: "<b>The first / last / next + nombre + nom</b> (the first two heatwaves).",
              ex: "The first three days of the heatwave were the hottest.",
              exfr: "Les trois premiers jours de la canicule ont été les plus chauds.",
              carte: {
                fr: "les deux premières",
                en: "the first two"
              }
            },
            {
              re: [
                "waves of heat",
                "hot waves",
                "heating waves",
                "waves of warmth",
                "warm waves",
                "heat's waves",
                "waves of hot"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "the first two waves of heat",
              juste: "the first two heatwaves",
              test: "It was above all the first two waves of heat, in late May and late June, that were the deadliest: on their own, they caused more than 3,000 deaths.",
              pourquoi: "« Vague de chaleur » ne se calque pas avec of : l'anglais forme un nom composé, heatwave (en un mot ou en deux), le nom qui précise devant. Hot waves voudrait dire des vagues chaudes, dans la mer.",
              regle: "<b>Nom + nom</b> : a heatwave, a cold snap, a drought. Le nom qui précise devant.",
              ex: "England recorded seven heatwaves in 2026.",
              exfr: "L'Angleterre a connu sept vagues de chaleur en 2026.",
              carte: {
                fr: "une vague de chaleur",
                en: "a heatwave"
              }
            }
          ]
        },
        {
          fr: "fin mai et fin juin,",
          en: "in late May and late June",
          pourquoi: "« Fin mai » : in late May, ou at the end of May. Les mois prennent toujours une majuscule en anglais.",
          pts: 0.5,
          ok: [
            "(in |at )?(late|the end of|end) may and (in |at )?(late |the end of |end )?june"
          ],
          fautes: [
            {
              re: [
                "(in|on) (the )?end of (may|june)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "in the end of May",
              juste: "at the end of May / in late May",
              test: "It was above all the first two heatwaves, in the end of May and in the end of June, that were the deadliest: on their own, they caused more than 3,000 deaths.",
              pourquoi: "« À la fin de » se dit at the end of. In the end est une autre expression : « finalement ». On peut aussi dire in late May.",
              regle: "<b>At the end of</b> + période (at the end of May) ou <b>in late</b> + mois. In the end : finalement.",
              ex: "The results will be published at the end of January.",
              exfr: "Les résultats seront publiés fin janvier.",
              lecon: {
                n: 9,
                ancre: "temps-detail",
                titre: "In, on, at : la position dans le temps"
              },
              carte: {
                fr: "fin mai",
                en: "at the end of May, in late May"
              }
            },
            {
              re: [
                "late of (may|june)"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "late of May",
              juste: "late May",
              test: "It was above all the first two heatwaves, in late of May and late of June, that were the deadliest: on their own, they caused more than 3,000 deaths.",
              pourquoi: "Late, devant un mois, s'emploie comme un adjectif, sans of : in late May, in early June. Of ne vient qu'après the end ou the beginning.",
              regle: "<b>In late / early + mois</b> (in late May). <b>At the end of</b> + mois.",
              ex: "The first heatwave hit England in late May.",
              exfr: "La première canicule a frappé l'Angleterre fin mai.",
              carte: {
                fr: "fin mai",
                en: "in late May (sans of)"
              }
            }
          ]
        },
        {
          fr: "à elles seules, elles ont fait plus de 3 000 morts.",
          en: "on their own, they caused more than 3,000 deaths",
          pourquoi: "« À elles seules » : on their own, alone, between them. « Faire des morts » se dit cause deaths, kill, claim lives (jamais make). « Plus de » + nombre : more than, over.",
          pts: 1,
          ok: [
            "(on their own|alone|between them|by themselves|all by themselves|in themselves|together|combined|single handedly),? (they )?(caused|killed|claimed|accounted for|resulted in|led to|were responsible for|left|were behind|were linked to|were associated with|brought|cost|produced) (more than|over|upwards of|in excess of|well over|just over|well above) 3000( deaths| lives| people| victims| dead| fatalities| heat related deaths| heat associated deaths)?",
            "(they )?(caused|killed|claimed|accounted for|resulted in|led to|were responsible for|left|were behind|were linked to|were associated with|brought|cost|produced) (more than|over|upwards of|in excess of|well over|just over|well above) 3000( deaths| lives| people| victims| dead| fatalities| heat related deaths| heat associated deaths)? (on their own|alone|between them|by themselves|all by themselves|in themselves|together|combined|single handedly)",
            "(they )?(on their own|alone|between them|by themselves|all by themselves|in themselves|together|combined|single handedly) (caused|killed|claimed|accounted for|resulted in|led to|were responsible for|left|were behind|were linked to|were associated with|brought|cost|produced) (more than|over|upwards of|in excess of|well over|just over|well above) 3000( deaths| lives| people| victims| dead| fatalities| heat related deaths| heat associated deaths)?"
          ],
          fautes: [
            {
              re: [
                "(made|make|did|done|have made|have done|has made|had made|makes) (more than|over|plus|more of|more that) 3000"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "they made more than 3,000 deaths",
              juste: "they caused more than 3,000 deaths",
              test: "It was above all the first two heatwaves, in late May and late June, that were the deadliest: on their own, they made more than 3,000 deaths.",
              pourquoi: "« Faire des morts » ne se calque pas avec make. Une catastrophe cause des décès (cause deaths), tue (kill people) ou coûte des vies (claim lives).",
              regle: "Faire des morts : <b>to cause deaths, to kill, to claim lives</b>.",
              ex: "The storm claimed twelve lives.",
              exfr: "La tempête a fait douze morts.",
              carte: {
                fr: "faire des morts",
                en: "to cause deaths, to claim lives"
              }
            },
            {
              re: [
                "more of 3000",
                "plus (of )?3000",
                "more that 3000",
                "more as 3000"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "more of 3,000 deaths",
              juste: "more than 3,000 deaths",
              test: "It was above all the first two heatwaves, in late May and late June, that were the deadliest: on their own, they caused more of 3,000 deaths.",
              pourquoi: "« Plus de » devant un nombre se dit more than (ou over). More of veut dire « davantage de ce qui précède » (more of the same).",
              regle: "Plus de + nombre : <b>more than, over</b> (more than 3,000). Moins de : fewer than, less than.",
              ex: "More than 5,000 deaths were linked to the heat.",
              exfr: "Plus de 5 000 décès ont été liés à la chaleur.",
              lecon: {
                n: 22,
                ancre: "comp-court",
                titre: "Le comparatif : more … than"
              },
              carte: {
                fr: "plus de (+ nombre)",
                en: "more than, over"
              }
            },
            {
              re: [
                "deads",
                "morts"
              ],
              type: "barbarisme",
              pts: 0.5,
              faux: "more than 3,000 deads",
              juste: "more than 3,000 deaths",
              test: "It was above all the first two heatwaves, in late May and late June, that were the deadliest: on their own, they caused more than 3,000 deads.",
              pourquoi: "Dead est un adjectif (mort) ; il ne prend jamais de s. Pour compter les morts, l'anglais dit deaths, ou people, lives ; the dead (sans s) désigne les morts en général.",
              regle: "Des morts (un nombre) : <b>deaths</b>. Les morts (en général) : <b>the dead</b>, sans s.",
              ex: "The toll rose to 694 deaths in five days.",
              exfr: "Le bilan a atteint 694 morts en cinq jours.",
              carte: {
                fr: "3 000 morts",
                en: "3,000 deaths (dead ne prend pas de s)"
              }
            }
          ]
        }
      ]
    },
    {
      fr: "Ce chiffre reste toutefois [[provisoire]] : il s'agit d'une estimation statistique, et le bilan définitif ((doit)) être publié au début de 2027.",
      cartes: [
        {
          id: "2f3c448c6b",
          fr: "devoir (c'est prévu)",
          en: "to be due to",
          re: "due to be|due out|due to|due in"
        }
      ],
      aides: [
        {
          fr: "provisoire",
          en: "provisional, interim"
        }
      ],
      proposition: "This figure remains provisional, however: it is a statistical estimate, and the final toll is due to be published in early 2027.",
      autres: [
        "However, this figure is still provisional: it is a statistical estimate, and the final figures are due to be released early in 2027."
      ],
      tests: [
        "But this number remains provisional: it is only a statistical estimate, and the definitive toll is due to be published at the beginning of 2027.",
        "This figure is, however, only provisional: it is a statistical estimate, and the final count is due out in early 2027."
      ],
      morceaux: [
        {
          fr: "Ce chiffre reste toutefois provisoire :",
          en: "This figure remains provisional, however",
          pourquoi: "« Rester » + adjectif : remain (ou is still), jamais rest. Un chiffre en attente de confirmation est provisional (ou interim, preliminary). « Toutefois » : however, en tête suivi d'une virgule, ou entre virgules.",
          pts: 1,
          ok: [
            "(however |but |yet |still |nevertheless |nonetheless )?(this|that|the) (figure|number|total|toll|estimate|death toll|count|tally|result)(,? however,?)? (remains|is still|is|stays|is only|is for now|is so far|is however|is however only|remains however|is still only)( however| for now| only)? (provisional|interim|preliminary|tentative|temporary|not final|not yet final)( however| though| for now| for the time being)?"
          ],
          fautes: [
            {
              re: [
                "rests? (however |still |nevertheless )?(provisional|interim|preliminary|temporary|tentative|provisory)"
              ],
              type: "faux-sens",
              pts: 0.75,
              faux: "This figure rests provisional",
              juste: "This figure remains provisional",
              test: "This figure rests provisional, however: it is a statistical estimate, and the final toll is due to be published in early 2027.",
              pourquoi: "Faux ami. To rest veut dire se reposer (ou reposer sur quelque chose). « Rester » + adjectif, pour dire qu'un état continue, se dit to remain, to stay, ou is still.",
              regle: "Rester (+ adjectif) : <b>to remain, to stay</b> (it remains provisional). To rest : se reposer.",
              ex: "The situation remains critical.",
              exfr: "La situation reste critique.",
              carte: {
                fr: "rester (+ adjectif)",
                en: "to remain (to rest = se reposer)"
              }
            },
            {
              re: [
                "provisory",
                "provisoire",
                "provisionnal",
                "provisionary",
                "provisionnary"
              ],
              type: "barbarisme",
              pts: 0.5,
              faux: "This figure remains provisory",
              juste: "This figure remains provisional",
              test: "This figure remains provisory, however: it is a statistical estimate, and the final toll is due to be published in early 2027.",
              pourquoi: "Provisoire se dit provisional en anglais britannique, ou interim (an interim report), preliminary. Provisory n'appartient pas à l'anglais courant.",
              regle: "Provisoire : <b>provisional, interim, preliminary</b> (an interim report, provisional figures).",
              ex: "The agency published an interim report in July.",
              exfr: "L'agence a publié un rapport provisoire en juillet.",
              carte: {
                fr: "provisoire",
                en: "provisional, interim"
              }
            }
          ]
        },
        {
          fr: "il s'agit d'une estimation statistique,",
          en: "it is a statistical estimate",
          pourquoi: "« Il s'agit de » ne se traduit pas mot à mot : it is, this is suffisent. « Statistique », adjectif : statistical (statistics est le nom).",
          pts: 1,
          ok: [
            "(it is|this is|that is|it remains|it is only|it is just|it is merely|it is simply|it is in fact|it is actually|this is only|this is just|what we have is|we are talking about|we are dealing with) (a|an|only a|just a|merely a) statistical (estimate|estimation|calculation|projection|approximation)",
            "it is (an estimate|an estimation) based on statistics",
            "it is (estimated|calculated) statistically"
          ],
          fautes: [
            {
              re: [
                "it (acts|is acting|deals|is dealing|treats|is treating|concerns|agits|agit) (of|about|from) (a|an)"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "it acts of a statistical estimate",
              juste: "it is a statistical estimate",
              test: "This figure remains provisional, however: it acts of a statistical estimate, and the final toll is due to be published in early 2027.",
              pourquoi: "« Il s'agit de » est un tour impersonnel propre au français : « it acts of », « it treats of » n'ont aucun sens. L'anglais dit simplement it is (this is) + nom.",
              regle: "Il s'agit de + nom : <b>it is, this is</b> (it is an estimate). Il s'agit de faire : <b>the point is to</b>.",
              ex: "It is a provisional figure, not a final one.",
              exfr: "Il s'agit d'un chiffre provisoire, pas d'un chiffre définitif.",
              carte: {
                fr: "il s'agit de",
                en: "it is, this is"
              }
            },
            {
              re: [
                "statistic (estimate|estimation)",
                "statistics (estimate|estimation)",
                "statistique"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "a statistics estimate",
              juste: "a statistical estimate",
              test: "This figure remains provisional, however: it is a statistics estimate, and the final toll is due to be published in early 2027.",
              pourquoi: "Statistics est le nom (les statistiques). Devant un nom, il faut l'adjectif : statistical (a statistical estimate, a statistical method).",
              regle: "Statistique (adjectif) : <b>statistical</b>. Les statistiques : <b>statistics</b>.",
              ex: "The agency uses a statistical method to count heat deaths.",
              exfr: "L'agence emploie une méthode statistique pour compter les décès liés à la chaleur.",
              carte: {
                fr: "statistique (adjectif)",
                en: "statistical (statistics = les statistiques)"
              }
            }
          ]
        },
        {
          fr: "et le bilan définitif doit être publié au début de 2027.",
          en: "and the final toll is due to be published in early 2027",
          pourquoi: "Ici, « devoir » dit ce qui est prévu à une date fixée : be due to + base verbale (is due to be published), et non must (obligation). « Au début de 2027 » : in early 2027, ou early in 2027.",
          pts: 2,
          ok: [
            "(and )?the (final|definitive|definite|full|official|final official|complete|final annual|definitive annual) (toll|figure|figures|death toll|count|total|tally|report|results|data|assessment|numbers|statistics|estimate) (is|are) (due|expected|scheduled|set|planned|supposed|slated) to be (published|released|made public|issued|out|unveiled|announced|delivered|produced) (in early 2027|early in 2027|at the beginning of 2027|at the start of 2027|in the early part of 2027|early next year|at the start of next year|at the beginning of next year|in early next year)",
            "(and )?the (final|definitive|definite|full|official|final official|complete|final annual|definitive annual) (toll|figure|figures|death toll|count|total|tally|report|results|data|assessment|numbers|statistics|estimate) (is|are) (due|expected|scheduled|set|slated) (out|for publication|for release) (in early 2027|early in 2027|at the beginning of 2027|at the start of 2027|in the early part of 2027|early next year|at the start of next year|at the beginning of next year|in early next year)",
            "(and )?the (final|definitive|definite|full|official|final official|complete|final annual|definitive annual) (toll|figure|figures|death toll|count|total|tally|report|results|data|assessment|numbers|statistics|estimate) (will be|should be|are to be|is to be) (published|released|made public|issued|out|unveiled|announced|delivered|produced) (in early 2027|early in 2027|at the beginning of 2027|at the start of 2027|in the early part of 2027|early next year|at the start of next year|at the beginning of next year|in early next year)",
            "(and )?the (final|definitive|definite|full|official|final official|complete|final annual|definitive annual) (toll|figure|figures|death toll|count|total|tally|report|results|data|assessment|numbers|statistics|estimate) (is|are) due (in early 2027|early in 2027|at the beginning of 2027|at the start of 2027|in the early part of 2027|early next year|at the start of next year|at the beginning of next year|in early next year)"
          ],
          fautes: [
            {
              re: [
                "(must|has to|have to|had to|is obliged to|are obliged to) be (published|released|made public|issued|out)"
              ],
              type: "faux-sens",
              pts: 0.75,
              faux: "the final toll must be published",
              juste: "the final toll is due to be published",
              test: "This figure remains provisional, however: it is a statistical estimate, and the final toll must be published in early 2027.",
              pourquoi: "« Devoir » a ici le sens de « c'est prévu » (un calendrier), pas d'obligation. Must ou have to diraient que l'agence est obligée de publier. Pour une date fixée d'avance : be due to.",
              regle: "Devoir (c'est prévu) : <b>be due to + base verbale</b>. Devoir (obligation) : must, have to.",
              ex: "The new report is due to be published in January.",
              exfr: "Le nouveau rapport doit être publié en janvier.",
              lecon: {
                n: 17,
                ancre: "emplois",
                titre: "Be due to : ce qui est prévu"
              },
              carte: {
                fr: "doit être publié (c'est prévu)",
                en: "is due to be published"
              }
            },
            {
              re: [
                "in the beginning of 2027",
                "at beginning of 2027",
                "in the start of 2027",
                "in the early 2027",
                "on early 2027",
                "(at|in) the debut of 2027",
                "in 2027 s beginning"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "in the beginning of 2027",
              juste: "in early 2027 / at the beginning of 2027",
              test: "This figure remains provisional, however: it is a statistical estimate, and the final toll is due to be published in the beginning of 2027.",
              pourquoi: "« Au début de » une période se dit at the beginning of (ou at the start of), ou plus simplement in early + année. In the beginning veut dire « au départ, au commencement » (in the beginning was the Word).",
              regle: "<b>At the beginning of 2027</b> ou <b>in early 2027</b>, <b>early in 2027</b>. In the beginning : au commencement.",
              ex: "Prices are expected to fall in early 2027.",
              exfr: "Les prix devraient baisser au début de 2027.",
              lecon: {
                n: 9,
                ancre: "temps-detail",
                titre: "In, on, at : la position dans le temps"
              },
              carte: {
                fr: "au début de 2027",
                en: "in early 2027, at the beginning of 2027"
              }
            },
            {
              re: [
                "balance( sheet)?",
                "bilan"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "the final balance",
              juste: "the final toll",
              test: "This figure remains provisional, however: it is a statistical estimate, and the final balance is due to be published in early 2027.",
              pourquoi: "Le bilan d'une catastrophe (le nombre de morts) se dit the toll ou the death toll. A balance est un solde (de compte) ou un équilibre, et a balance sheet est le bilan comptable d'une entreprise.",
              regle: "Bilan (des victimes) : <b>the (death) toll</b>. Bilan comptable : a balance sheet.",
              ex: "The death toll is expected to rise.",
              exfr: "Le bilan devrait s'alourdir.",
              carte: {
                fr: "le bilan (morts)",
                en: "the death toll"
              }
            },
            {
              re: [
                "due to (be )?(publish|publishing|release|releasing)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "the final toll is due to publish",
              juste: "the final toll is due to be published",
              test: "This figure remains provisional, however: it is a statistical estimate, and the final toll is due to publish in early 2027.",
              pourquoi: "Le bilan ne publie rien : il est publié. Après be due to, il faut donc le passif be published (be + participe passé).",
              regle: "Passif : <b>be + participe passé</b> (is due to be published).",
              ex: "The report is due to be released next week.",
              exfr: "Le rapport doit être publié la semaine prochaine.",
              lecon: {
                n: 25,
                ancre: "formation",
                titre: "La formation du passif"
              },
              carte: {
                fr: "doit être publié",
                en: "is due to be published (passif)"
              }
            }
          ]
        }
      ]
    },
    {
      fr: "Dès septembre, le gouvernement ((avait annoncé que)) plus de 32 millions de [[livres]] serviraient à améliorer le [[refroidissement]] et la ventilation des hôpitaux.",
      cartes: [
        {
          id: "7c81025cf1",
          fr: "annoncer que",
          en: "to announce that",
          re: "announc(e|es|ed|ing)"
        }
      ],
      aides: [
        {
          fr: "une livre (sterling)",
          en: "a pound"
        },
        {
          fr: "le refroidissement",
          en: "cooling"
        }
      ],
      proposition: "As early as September, the government had announced that more than 32 million pounds would be used to improve cooling and ventilation in hospitals.",
      autres: [
        "As early as September, the government had announced that over 32 million pounds would go towards improving cooling and ventilation in hospitals."
      ],
      tests: [
        "Back in September, the government had already announced that more than £32 million would be spent on better cooling and ventilation in hospitals.",
        "As early as September, ministers announced that more than 32 million pounds would be used to improve hospitals' cooling and ventilation."
      ],
      morceaux: [
        {
          fr: "Dès septembre,",
          en: "As early as September",
          pourquoi: "« Dès » + date, pour souligner que c'est tôt : as early as (as early as September), ou already in September, back in September.",
          pts: 0.5,
          ok: [
            "(as early as|already in|back in|by|early as|already by|as far back as) september",
            "in september( already)?",
            "had (already )?announced in september"
          ],
          fautes: [
            {
              re: [
                "(since|from|des) september"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "Since September, the government had announced",
              juste: "As early as September, the government had announced",
              test: "Since September, the government had announced that more than 32 million pounds would be used to improve cooling and ventilation in hospitals.",
              pourquoi: "« Dès septembre » souligne que l'annonce a été faite tôt : as early as September. Since September voudrait dire « depuis septembre » (une durée qui se prolonge) et from September « à partir de septembre ».",
              regle: "Dès + date (c'est tôt) : <b>as early as</b>. Depuis : since. À partir de : from.",
              ex: "Scientists warned of the risk as early as 2004.",
              exfr: "Les scientifiques ont alerté sur ce risque dès 2004.",
              lecon: {
                n: 9,
                ancre: "temps-detail",
                titre: "As early as : « dès »"
              },
              carte: {
                fr: "dès septembre",
                en: "as early as September"
              }
            },
            {
              re: [
                "(on|at) september"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "on September",
              juste: "in September",
              test: "Already on September, the government had announced that more than 32 million pounds would be used to improve cooling and ventilation in hospitals.",
              pourquoi: "Un mois est une période : in September. On se met devant un jour précis (on 9 September), at devant une heure.",
              regle: "<b>In</b> + mois (in September). <b>On</b> + date (on 9 September).",
              ex: "The plan was announced in September.",
              exfr: "Le plan a été annoncé en septembre.",
              lecon: {
                n: 9,
                ancre: "temps-detail",
                titre: "In, on, at : la position dans le temps"
              },
              carte: {
                fr: "en septembre",
                en: "in September"
              }
            }
          ]
        },
        {
          fr: "le gouvernement avait annoncé que",
          en: "the government had announced that",
          pourquoi: "L'annonce est antérieure au rapport de novembre : past perfect, had announced (le prétérit announced reste correct avec une date). Announce se construit avec that, sans préposition.",
          pts: 1.5,
          ok: [
            "(the (british |uk )?government|ministers|london|downing street|the department of health( and social care)?|the health secretary|the health minister) (had )?(already )?(announced|pledged|promised|said|stated|declared|unveiled plans|confirmed)( that)?( in september)?"
          ],
          fautes: [
            {
              re: [
                "(government|ministers|london) (has|have) (already )?(announced|pledged|promised|said)"
              ],
              type: "grammaire",
              pts: 0.75,
              faux: "the government has announced",
              juste: "the government had announced",
              test: "As early as September, the government has announced that more than 32 million pounds would be used to improve cooling and ventilation in hospitals.",
              pourquoi: "L'annonce est datée (septembre) et se place avant un autre fait passé (le rapport de novembre) : past perfect (had announced), ou prétérit. Le present perfect ne va pas avec un moment passé précis.",
              regle: "Antériorité dans le passé : <b>had + participe passé</b>. Moment passé daté : prétérit, jamais present perfect.",
              ex: "By the time the report came out, the government had already announced new funding.",
              exfr: "Quand le rapport est paru, le gouvernement avait déjà annoncé de nouveaux crédits.",
              lecon: {
                n: 16,
                ancre: "emplois",
                titre: "Le past perfect : l'antériorité"
              },
              carte: {
                fr: "avait annoncé (avant un autre fait passé)",
                en: "had announced (past perfect)"
              }
            },
            {
              re: [
                "had (already )?(announce|announces|announcing)",
                "announced (to|at) (the press )?that"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "the government had announce that",
              juste: "the government had announced that",
              test: "As early as September, the government had announce that more than 32 million pounds would be used to improve cooling and ventilation in hospitals.",
              pourquoi: "Le past perfect se forme avec had + participe passé : had announced. Et announce se construit directement avec that, sans préposition.",
              regle: "<b>Had + participe passé</b> (had announced). <b>Announce that</b> + proposition.",
              ex: "The minister had announced that hospitals would get more money.",
              exfr: "Le ministre avait annoncé que les hôpitaux recevraient plus d'argent.",
              lecon: {
                n: 16,
                ancre: "formation",
                titre: "La formation du past perfect"
              },
              carte: {
                fr: "avait annoncé que",
                en: "had announced that"
              }
            }
          ]
        },
        {
          fr: "plus de 32 millions de livres",
          en: "more than 32 million pounds",
          pourquoi: "« Plus de » + nombre : more than, over. Million reste invariable après un nombre (32 million) ; la livre sterling se dit the pound (£32 million).",
          pts: 1,
          ok: [
            "(more than|over|upwards of|in excess of|at least|just over|well over) (32 (million|m|mn)|32m|32mn)( (pounds|pounds sterling|sterling|gbp))?"
          ],
          fautes: [
            {
              re: [
                "32 millions"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "32 millions pounds",
              juste: "32 million pounds",
              test: "As early as September, the government had announced that more than 32 millions pounds would be used to improve cooling and ventilation in hospitals.",
              pourquoi: "Après un nombre, million reste invariable et se place directement devant le nom : 32 million pounds. Millions of ne s'emploie que seul, au sens vague (des millions de livres).",
              regle: "<b>Nombre + million + nom</b> (32 million pounds). <b>Millions of</b> au sens vague.",
              ex: "The hospital received 5 million pounds for new equipment.",
              exfr: "L'hôpital a reçu 5 millions de livres pour du matériel neuf.",
              lecon: {
                n: 11,
                ancre: "grands-nombres",
                titre: "Les grands nombres : million"
              },
              carte: {
                fr: "32 millions de livres",
                en: "32 million pounds (million invariable)"
              }
            },
            {
              re: [
                "books",
                "libras",
                "livres",
                "lbs"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "32 million books",
              juste: "32 million pounds",
              test: "As early as September, the government had announced that more than 32 million books would be used to improve cooling and ventilation in hospitals.",
              pourquoi: "La livre sterling, monnaie du Royaume-Uni, se dit the pound (symbole £). A book est un livre qu'on lit, et lb (lbs) la livre comme unité de poids.",
              regle: "La livre (monnaie) : <b>the pound</b> (£). Un livre : a book.",
              ex: "The plan will cost 1.5 billion pounds.",
              exfr: "Le plan coûtera 1,5 milliard de livres.",
              carte: {
                fr: "une livre (sterling)",
                en: "a pound (a book = un livre)"
              }
            },
            {
              re: [
                "more of 32",
                "plus (of )?32",
                "more that 32"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "more of 32 million pounds",
              juste: "more than 32 million pounds",
              test: "As early as September, the government had announced that more of 32 million pounds would be used to improve cooling and ventilation in hospitals.",
              pourquoi: "« Plus de » devant un nombre se dit more than ou over. More of veut dire « davantage de » quelque chose de déjà évoqué.",
              regle: "Plus de + nombre : <b>more than, over</b>.",
              ex: "More than 200 hospitals will benefit from the plan.",
              exfr: "Plus de 200 hôpitaux profiteront du plan.",
              carte: {
                fr: "plus de (+ nombre)",
                en: "more than, over"
              }
            }
          ]
        },
        {
          fr: "serviraient à améliorer le refroidissement et la ventilation des hôpitaux.",
          en: "would be used to improve cooling and ventilation in hospitals",
          pourquoi: "Dans un récit au passé, le futur de l'annonce devient would (concordance des temps) : would be used to improve. Le refroidissement : cooling ; « des hôpitaux » : in hospitals, ou hospitals' cooling.",
          pts: 1,
          ok: [
            "(would|was to|were to|was going to|were going to) (be (used|spent|allocated|devoted|earmarked|put|invested|dedicated|channeled|channelled|set aside|directed)|go|serve|help|fund|pay for|finance)( to| on| towards| toward| for| into| in)? (improv(e|ing)|upgrad(e|ing)|better|enhanc(e|ing)|the improvement of|improvements (to|in)|upgrades to|boost(ing)?|modernizing|modernize)( the)? (cooling and ventilation|ventilation and cooling|cooling and ventilation systems|ventilation and cooling systems|cooling and ventilating|ventilating and cooling)( systems)? (in|of|at|for|across) (the )?(country's |england's |english |nhs |public )?(hospitals|hospital buildings)",
            "(would|was to|were to|was going to|were going to) (be (used|spent|allocated|devoted|earmarked|put|invested|dedicated|channeled|channelled|set aside|directed)|go|serve|help|fund|pay for|finance)( to| on| towards| toward| for| into| in)? (improv(e|ing)|upgrad(e|ing)|better|enhanc(e|ing)|the improvement of|improvements (to|in)|upgrades to|boost(ing)?|modernizing|modernize) (the )?(hospitals' |hospital |nhs hospitals' |nhs )(cooling and ventilation|ventilation and cooling|cooling and ventilation systems|ventilation and cooling systems|cooling and ventilating|ventilating and cooling)( systems)?",
            "(would|was to|were to|was going to|were going to) (be (used|spent|allocated|devoted|earmarked|put|invested|dedicated|channeled|channelled|set aside|directed)|go|serve|help|fund|pay for|finance) to (better )?cool and ventilate (the )?(country's |england's |english |nhs |public )?(hospitals|hospital buildings)( better)?"
          ],
          fautes: [
            {
              re: [
                "(will|shall) (be (used|spent|allocated|devoted|invested|earmarked|put)|go|serve|help|fund|pay|finance)"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "the government had announced that 32 million pounds will be used",
              juste: "the government had announced that 32 million pounds would be used",
              test: "As early as September, the government had announced that more than 32 million pounds will be used to improve cooling and ventilation in hospitals.",
              pourquoi: "Le verbe d'annonce est au passé (had announced) : le futur de ce qui a été annoncé se met au conditionnel, would (concordance des temps), comme « serviraient » en français.",
              regle: "Discours rapporté au passé : <b>will → would</b> (he said the money would be used…).",
              ex: "The minister said the new wards would open in 2027.",
              exfr: "La ministre a dit que les nouveaux services ouvriraient en 2027.",
              lecon: {
                n: 28,
                ancre: "concordance",
                titre: "La concordance des temps"
              },
              carte: {
                fr: "serviraient (annonce au passé)",
                en: "would (concordance des temps)"
              }
            },
            {
              re: [
                "refresh(ing|ment|ments)?",
                "refrigeration",
                "refrigerating",
                "refroidissement"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "to improve the refreshment of hospitals",
              juste: "to improve cooling in hospitals",
              test: "As early as September, the government had announced that more than 32 million pounds would be used to improve the refreshment and ventilation of hospitals.",
              pourquoi: "Refreshments sont des rafraîchissements (boissons, en-cas) et refrigeration la réfrigération (le froid d'un frigo). Le refroidissement d'un bâtiment, c'est cooling (cooling systems).",
              regle: "Le refroidissement (d'un bâtiment) : <b>cooling</b>. La climatisation : air conditioning.",
              ex: "Many schools have no cooling system.",
              exfr: "Beaucoup d'écoles n'ont aucun système de refroidissement.",
              carte: {
                fr: "le refroidissement",
                en: "cooling (refreshments = rafraîchissements)"
              }
            }
          ]
        }
      ]
    }
  ]
};
