/* Thème du jour d'anglais, 25 novembre 2026 (voir CLAUDE.md, « Thème du jour »).
   ((…)) = mot d'une carte du paquet d'anglais (cartes, dans l'ordre) ; [[…]] = mot nouveau (aides, dans l'ordre).
   Motifs `ok` et `re` : expressions régulières en minuscules, sans accents, nombres en chiffres, orthographe
   américaine, jamais de tiret (flashcards/theme-correcteur.js). Faits : actualites/monde/articles/
   etats-unis-voyager-1-un-jour-lumiere-de-la-terre-2026.html, d'après NASA (« NASA's Voyager 1 Makes History Reaching
   One Light-Day From Earth », 18 novembre 2026), CNN, The Conversation et EarthSky (18 novembre 2026) : jour-lumière
   atteint le 18 novembre 2026 à 5 h 16 (heure de New York), environ 25,9 milliards de km, premier objet humain à cette
   distance ; 24 heures pour qu'un signal atteigne la sonde, autant pour la réponse ; lancée le 5 septembre 1977,
   mission prévue pour cinq ans ; générateurs thermoélectriques au plutonium : 470 W au lancement, environ 210 W
   aujourd'hui ; 2 instruments sur 10 encore en service ; entrée dans l'espace interstellaire en 2012 ; la NASA espère
   garder les instruments en marche au moins jusqu'aux 50 ans des sondes (été 2027), trois à cinq ans de plus selon
   Kareem Badaruddin (JPL). Recoupé : NASA Science, « Voyager 1: What Is a Light-Day? » (24 heures aller, 24 heures
   retour). */
window.ECG_THEMES_DONNEES = window.ECG_THEMES_DONNEES || {};
window.ECG_THEMES_DONNEES["anglais/2026-11-25"] = {
  langue: "anglais",
  date: "2026-11-25",
  titre: "Voyager 1 franchit un jour-lumière, quarante-neuf ans après son lancement",
  phrases: [
    {
      fr: "Le 18 novembre, la [[sonde]] Voyager 1 de la NASA est devenue le premier objet fabriqué par l'homme à se trouver à un [[jour-lumière]] de la Terre, ((c'est-à-dire)) à environ 25,9 milliards de kilomètres.",
      cartes: [{ id: "1251e5efbf", fr: "c'est-à-dire", en: "that is", re: "that is|i e|that is to say|in other words" }],
      aides: [{ fr: "une sonde (spatiale)", en: "a (space) probe" }, { fr: "un jour-lumière", en: "a light-day" }],
      proposition: "On 18 November, NASA's Voyager 1 probe became the first human-made object to be one light-day from Earth, that is, about 25.9 billion kilometres away.",
      autres: [
        "On 18 November, NASA's Voyager 1 spacecraft became the first object made by humans to reach one light-day from Earth, in other words about 25.9 billion kilometres."
      ],
      tests: [
        "On November 18, the NASA probe Voyager 1 became the first man-made object to travel one light-day from Earth, that is to say roughly 25.9 billion km away.",
        "On 18 November, Voyager 1, NASA's probe, became the first human-made object ever to be one light-day away from Earth, i.e. some 25.9 billion kilometers."
      ],
      morceaux: [
        {
          fr: "Le 18 novembre,",
          en: "On 18 November",
          pourquoi: "Une date précise prend on : on 18 November (ou on November 18 en anglais américain).",
          pts: 0.5,
          ok: ["on (wednesday )?(november 18(th)?|18(th)? (of )?november|the 18(th)? of november)"],
          fautes: [
            {
              re: [
                "^the (18(th)? (of )?november|november 18(th)?)",
                "^(18(th)? (of )?november|november 18(th)?)",
                "(in|at) (wednesday )?(november 18(th)?|18(th)? (of )?november|the 18(th)? of november)"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "The 18 November, … / In 18 November, …",
              juste: "On 18 November, …",
              test: "In 18 November, NASA's Voyager 1 probe became the first human-made object to be one light-day from Earth, that is, about 25.9 billion kilometres away.",
              pourquoi: "Le français dit « le 18 novembre » sans préposition. L'anglais introduit toujours une date par on : sans préposition, la date reste en l'air, et in ne vaut que pour le mois entier (in November).",
              regle: "<b>On</b> + jour ou date (on 18 November, on Wednesday). <b>In</b> + mois, année, saison (in November, in 1977). <b>At</b> + heure.",
              ex: "The probe was launched on 5 September 1977.",
              exfr: "La sonde a été lancée le 5 septembre 1977.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le 18 novembre", en: "on 18 November (on + date)" }
            }
          ]
        },
        {
          fr: "la sonde Voyager 1 de la NASA est devenue",
          en: "NASA's Voyager 1 probe became",
          pourquoi: "« De la NASA » se rend par le génitif (NASA's Voyager 1 probe) ou par NASA placé devant comme un adjectif (the NASA probe Voyager 1). L'événement est daté : prétérit, became.",
          pts: 1,
          ok: [
            "((the )?(nasa's |nasa |us )?((space )?probe|spacecraft) voyager 1|(the )?(nasa's |nasa |us )?voyager 1( (space )?probe| spacecraft)?( of nasa| from nasa| belonging to nasa| operated by nasa)?|(the )?(space )?probe voyager 1 (of|from) nasa|(the )?(space )?probe voyager 1),? (nasa's (probe|spacecraft),? )?(became|was to become|went on to become)",
            "(voyager 1|it),? (the )?(nasa's |nasa |us )?((space )?probe|spacecraft)( of nasa| from nasa| launched by nasa)?,? became"
          ],
          fautes: [
            {
              re: [
                "((the )?(nasa's |nasa |us )?((space )?probe|spacecraft) voyager 1|(the )?(nasa's |nasa |us )?voyager 1( (space )?probe| spacecraft)?( of nasa| from nasa| belonging to nasa| operated by nasa)?|(the )?(space )?probe voyager 1 (of|from) nasa|(the )?(space )?probe voyager 1),? (has|have) (now )?become",
                "(voyager 1|it),? (the )?(nasa's |nasa )?((space )?probe|spacecraft),? (has|have) (now )?become"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "has become (on 18 November)",
              juste: "became",
              test: "On 18 November, NASA's Voyager 1 probe has become the first human-made object to be one light-day from Earth, that is, about 25.9 billion kilometres away.",
              pourquoi: "L'événement a eu lieu à une date précise, donnée en tête de phrase : c'est un fait passé et daté. Le passé composé français se traduit alors par un prétérit ; le present perfect avec une date révolue est une faute lourde pour un correcteur.",
              regle: "Moment passé précis (on 18 November, in 1977, last week) : <b>prétérit</b> (became). Present perfect sans date (Voyager 1 has broken many records).",
              ex: "On Wednesday, the probe reached a new milestone.",
              exfr: "Mercredi, la sonde a franchi un nouveau cap.",
              lecon: { n: 14, ancre: "comparaison", titre: "Present perfect ou prétérit" },
              carte: { fr: "est devenue (le 18 novembre)", en: "became (prétérit + date)" }
            },
            {
              re: ["(is|was) (now )?become"],
              type: "grammaire",
              pts: 0.5,
              faux: "is become / was become",
              juste: "became",
              test: "On 18 November, NASA's Voyager 1 probe is become the first human-made object to be one light-day from Earth, that is, about 25.9 billion kilometres away.",
              pourquoi: "« Est devenue » prend l'auxiliaire être en français, mais l'anglais ne forme jamais un temps du passé avec be : le passé composé daté devient un prétérit, became (become, became, become).",
              regle: "Fait daté : <b>prétérit</b> (became). Temps composés : <b>have</b> + participe passé (has become), jamais be.",
              ex: "She became the first woman to walk in space in 1984.",
              exfr: "Elle est devenue la première femme à sortir dans l'espace en 1984.",
              carte: { fr: "est devenue", en: "became (become, became, become)" }
            },
            {
              re: ["of the nasa\\b", "the nasa's", "\\b(sonde|sound)\\b"],
              type: "gallicisme",
              pts: 0.25,
              faux: "the sonde of the NASA",
              juste: "NASA's probe / the NASA probe",
              test: "On 18 November, the sonde Voyager 1 of the NASA became the first human-made object to be one light-day from Earth, that is, about 25.9 billion kilometres away.",
              pourquoi: "Deux calques. « Sonde » n'existe pas en anglais dans ce sens (et sound veut dire son) : une sonde spatiale, c'est a probe. Et NASA, un sigle qui se lit comme un mot, se passe d'article : NASA's probe, the NASA probe, jamais the NASA's probe.",
              regle: "Sonde spatiale : <b>a (space) probe</b>. Sigle lu comme un mot : <b>pas d'article</b> (NASA, NATO), génitif NASA's ou nom devant le nom (the NASA probe).",
              ex: "NASA's new telescope will be launched next year.",
              exfr: "Le nouveau télescope de la NASA sera lancé l'an prochain.",
              carte: { fr: "la sonde de la NASA", en: "NASA's probe, the NASA probe" }
            }
          ]
        },
        {
          fr: "le premier objet fabriqué par l'homme à se trouver à un jour-lumière de la Terre,",
          en: "the first human-made object to be one light-day from Earth",
          pourquoi: "« Le premier … à + infinitif » se dit the first … to + base verbale. Un objet fabriqué par l'homme : a human-made (ou man-made) object, l'adjectif composé devant le nom. La distance se mesure from Earth.",
          pts: 1.5,
          ok: [
            "the (very )?first (human made|man made|manmade|humanmade|made by (humans|man|mankind|humanity|human beings|people)|built by (humans|man|mankind|humanity|human beings|people)|ever (made|built|launched) by (humans|man|mankind|humanity|human beings)|human) (object|thing|machine|artifact|artefact|craft|spacecraft|device) (to be|to reach|to get|to travel|to lie|to find itself|to have reached|to have traveled|to have gone|to go|to sit|to arrive|to stand|ever to be|ever to reach|ever to travel|to ever reach|to ever be|to ever travel|that is|which is|that reached|which reached|that has reached|which has reached|that has traveled|that has gone|that traveled|to be located|to be situated|to be positioned) (a distance of )?(1|a|a single|one full|a full) light day( away)? (from|away from) (the )?earth",
            "the (very )?first (object|thing|machine|artifact|artefact|craft|spacecraft|device) (human made|man made|manmade|humanmade|made by (humans|man|mankind|humanity|human beings|people)|built by (humans|man|mankind|humanity|human beings|people)|ever (made|built|launched) by (humans|man|mankind|humanity|human beings)|human) (to be|to reach|to get|to travel|to lie|to find itself|to have reached|to have traveled|to have gone|to go|to sit|to arrive|to stand|ever to be|ever to reach|ever to travel|to ever reach|to ever be|to ever travel|that is|which is|that reached|which reached|that has reached|which has reached|that has traveled|that has gone|that traveled|to be located|to be situated|to be positioned) (a distance of )?(1|a|a single|one full|a full) light day( away)? (from|away from) (the )?earth",
            "the (very )?first (human made|man made|manmade|humanmade|made by (humans|man|mankind|humanity|human beings|people)|built by (humans|man|mankind|humanity|human beings|people)|ever (made|built|launched) by (humans|man|mankind|humanity|human beings)|human) (object|thing|machine|artifact|artefact|craft|spacecraft|device) (ever )?(to be|to reach|to get|to travel|to lie|to find itself|to have reached|to have traveled|to have gone|to go|to sit|to arrive|to stand|ever to be|ever to reach|ever to travel|to ever reach|to ever be|to ever travel|that is|which is|that reached|which reached|that has reached|which has reached|that has traveled|that has gone|that traveled|to be located|to be situated|to be positioned) (a distance of )?(1|a|a single|one full|a full) light day( away)?( from (the )?earth)?",
            "the (very )?first (object|thing|machine|artifact|artefact|craft|spacecraft|device) (human made|man made|manmade|humanmade|made by (humans|man|mankind|humanity|human beings|people)|built by (humans|man|mankind|humanity|human beings|people)|ever (made|built|launched) by (humans|man|mankind|humanity|human beings)|human) (ever )?(to be|to reach|to get|to travel|to lie|to find itself|to have reached|to have traveled|to have gone|to go|to sit|to arrive|to stand|ever to be|ever to reach|ever to travel|to ever reach|to ever be|to ever travel|that is|which is|that reached|which reached|that has reached|which has reached|that has traveled|that has gone|that traveled|to be located|to be situated|to be positioned) (a distance of )?(1|a|a single|one full|a full) light day( away)?( from (the )?earth)?",
            "the (very )?first (human made|man made|manmade|humanmade|made by (humans|man|mankind|humanity|human beings|people)|built by (humans|man|mankind|humanity|human beings|people)|ever (made|built|launched) by (humans|man|mankind|humanity|human beings)|human) (object|thing|machine|artifact|artefact|craft|spacecraft|device) (ever )?(to be|to lie|to be located|to sit) (at a distance of|a distance of) (1|a|a single|one full|a full) light day( from (the )?earth)?"
          ],
          fautes: [
            {
              re: ["light years?\\b"],
              type: "faux-sens",
              pts: 1,
              faux: "one light-year",
              juste: "one light-day",
              test: "On 18 November, NASA's Voyager 1 probe became the first human-made object to be one light-year from Earth, that is, about 25.9 billion kilometres away.",
              pourquoi: "Contresens sur l'unité : a light-year (une année-lumière) vaut environ 9 460 milliards de kilomètres, 365 fois plus qu'un jour-lumière. Voyager 1 n'est qu'à 25,9 milliards de kilomètres, soit un jour-lumière.",
              regle: "Un jour-lumière : <b>a light-day</b> (environ 25,9 milliards de km). Une année-lumière : <b>a light-year</b> (environ 9 460 milliards de km).",
              ex: "The nearest star is about 4.25 light-years away.",
              exfr: "L'étoile la plus proche est à environ 4,25 années-lumière.",
              carte: { fr: "un jour-lumière", en: "a light-day (a light-year = une année-lumière)" }
            },
            {
              re: [
                "first (\\w+ ){0,5}(at|in|for) (reaching|being|be|reach|getting|traveling|finding|to be|to reach)\\b",
                "first (\\w+ ){0,5}(who|which|that) to\\b"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "the first object at being",
              juste: "the first object to be",
              test: "On 18 November, NASA's Voyager 1 probe became the first human-made object at being one light-day from Earth, that is, about 25.9 billion kilometres away.",
              pourquoi: "« Le premier à faire » se calque mal : la préposition à ne se traduit pas par at. Après the first, the last, the only, l'anglais emploie to + base verbale.",
              regle: "<b>The first / the last / the only … + to + base verbale</b> (the first woman to walk on the Moon).",
              ex: "He was the first man to walk on the Moon.",
              exfr: "Il a été le premier homme à marcher sur la Lune.",
              carte: { fr: "le premier à faire qqch", en: "the first to do sth" }
            },
            {
              re: ["(1|a|a single|one full|a full) light day (away )?of (the )?earth", "(at|on) (1|a|a single|one full|a full) light day (away )?of\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "one light-day of Earth",
              juste: "one light-day from Earth",
              test: "On 18 November, NASA's Voyager 1 probe became the first human-made object to be one light-day of Earth, that is, about 25.9 billion kilometres away.",
              pourquoi: "« À un jour-lumière de la Terre » : le de français marque ici le point de départ d'une distance. En anglais, la distance se compte from un point : one light-day from Earth, ten kilometres from Paris. Of ne marque pas l'éloignement.",
              regle: "Distance : <b>nombre + unité + (away) from</b> (two hours from London, 25.9 billion km from Earth).",
              ex: "The village is ten miles from the coast.",
              exfr: "Le village est à quinze kilomètres de la côte.",
              carte: { fr: "à un jour-lumière de la Terre", en: "one light-day from Earth (from + point de départ)" }
            }
          ]
        },
        {
          fr: "c'est-à-dire à environ 25,9 milliards de kilomètres.",
          en: "that is, about 25.9 billion kilometres away",
          pourquoi: "« C'est-à-dire » se dit that is (ou in other words, i.e.). « Un milliard » se dit a billion, invariable après un nombre : 25.9 billion, avec un point décimal en anglais.",
          pts: 1,
          ok: [
            "(that is|i e|ie|in other words|or|which is|which means|that is to say|meaning|namely|which equals|equivalent to|which amounts to|or in other words),? (at |at a distance of |a distance of |some |about )?(about |around |roughly |some |approximately |an estimated |nearly |almost |close to |just under |just over )?(25 9 billion|25 9 bn|25 9bn|25900 000000|25900000000) (kilometers|kilometres|km)( away)?( from (the )?earth)?"
          ],
          fautes: [
            {
              re: ["milliards?\\b", "billions (of )?(kilometers|kilometres|km)", "25 9 billions"],
              type: "grammaire",
              pts: 0.5,
              faux: "25.9 milliards / 25.9 billions kilometres",
              juste: "25.9 billion kilometres",
              test: "On 18 November, NASA's Voyager 1 probe became the first human-made object to be one light-day from Earth, that is, about 25.9 billions kilometres away.",
              pourquoi: "Milliard n'existe pas en anglais : un milliard, c'est a billion. Après un nombre, billion (comme million, thousand, hundred) reste invariable : 25.9 billion kilometres. Le pluriel billions ne s'emploie que seul, au sens vague (billions of stars).",
              regle: "<b>Nombre + billion / million / thousand</b> sans s (25.9 billion). <b>Billions of</b> au sens vague (des milliards de).",
              ex: "The project cost 3 billion dollars.",
              exfr: "Le projet a coûté 3 milliards de dollars.",
              lecon: { n: 11, ancre: "grands-nombres", titre: "Les grands nombres : billion" },
              carte: { fr: "25,9 milliards de kilomètres", en: "25.9 billion kilometres (billion invariable)" }
            },
            {
              re: ["(this|it) is to say", "(this|it) is to tell\\b", "it means to say"],
              type: "gallicisme",
              pts: 0.5,
              faux: "it is to say",
              juste: "that is / in other words",
              test: "On 18 November, NASA's Voyager 1 probe became the first human-made object to be one light-day from Earth, it is to say, about 25.9 billion kilometres away.",
              pourquoi: "« C'est-à-dire » ne se calque pas mot à mot : « it is to say » n'a pas de sens en anglais. On dit that is, that is to say, in other words, ou l'abréviation i.e. à l'écrit.",
              regle: "C'est-à-dire : <b>that is</b>, <b>that is to say</b>, <b>in other words</b>, <b>i.e.</b>",
              ex: "The mission lasted five decades, that is, half a century.",
              exfr: "La mission a duré cinq décennies, c'est-à-dire un demi-siècle.",
              carte: { fr: "c'est-à-dire", en: "that is, in other words, i.e." }
            }
          ]
        }
      ]
    },
    {
      fr: "((Selon)) la NASA, un signal radio met désormais 24 heures pour lui [[parvenir]], si bien qu'une question posée à la sonde n'obtient sa réponse que deux jours plus tard.",
      cartes: [{ id: "440a3bbc91", fr: "selon, d'après", en: "according to", re: "according to" }],
      aides: [{ fr: "parvenir à (qqn, qqch)", en: "to reach (sans préposition)" }],
      proposition: "According to NASA, a radio signal now takes 24 hours to reach it, so a question sent to the probe only gets an answer two days later.",
      autres: [
        "According to NASA, it now takes 24 hours for a radio signal to reach the spacecraft, which means that a question sent to the probe is only answered two days later."
      ],
      tests: [
        "According to NASA, it now takes a radio signal a day to reach Voyager 1, so any question sent to the probe does not get a reply until two days later.",
        "NASA says a radio signal now needs 24 hours to get to it, so a question sent to the probe only receives its answer 48 hours later."
      ],
      morceaux: [
        {
          fr: "Selon la NASA,",
          en: "According to NASA",
          pourquoi: "« Selon » cite une source : according to. NASA, sigle lu comme un mot, se passe d'article.",
          pts: 0.5,
          ok: [
            "according to (the )?nasa( figures| data| estimates| calculations| engineers)?",
            "(as )?nasa (says|said|explains|explained|notes|noted|points out|pointed out|estimates|estimated|calculates|reports|reported)( that)?",
            "nasa('s)? (figures|data|calculations|estimates) (show|showed|indicate|suggest)( that)?"
          ],
          fautes: [
            {
              re: ["according (with |at |of )?(the )?nasa", "(following|after|selon) (the )?nasa\\b"],
              type: "grammaire",
              pts: 0.25,
              faux: "according the NASA / following NASA",
              juste: "according to NASA",
              test: "According the NASA, a radio signal now takes 24 hours to reach it, so a question sent to the probe only gets an answer two days later.",
              pourquoi: "According se construit toujours avec to : la préposition fait partie de l'expression. Following veut dire « à la suite de », pas « selon ».",
              regle: "Selon, d'après : <b>according to</b> + source (according to NASA, according to the report).",
              ex: "According to the scientists, the probe is still healthy.",
              exfr: "Selon les scientifiques, la sonde est toujours en bon état.",
              carte: { fr: "selon la NASA", en: "according to NASA" }
            },
            {
              re: ["(to|by|says|said) the nasa\\b", "^the nasa\\b"],
              type: "grammaire",
              pts: 0.25,
              faux: "according to the NASA",
              juste: "according to NASA",
              test: "According to the NASA, a radio signal now takes 24 hours to reach it, so a question sent to the probe only gets an answer two days later.",
              pourquoi: "NASA est un sigle qui se prononce comme un mot (acronyme) : comme NATO ou UNESCO, il s'emploie sans article. On dit the FBI ou the CDC, épelés lettre à lettre, mais NASA tout court.",
              regle: "Acronyme prononcé comme un mot : <b>pas d'article</b> (NASA, NATO). Sigle épelé : <b>the</b> (the FBI, the UN).",
              ex: "NATO was founded in 1949.",
              exfr: "L'OTAN a été fondée en 1949.",
              lecon: { n: 4, ancre: "zero-article", titre: "Le zéro article" },
              carte: { fr: "la NASA", en: "NASA (sans article)" }
            }
          ]
        },
        {
          fr: "un signal radio met désormais 24 heures pour lui parvenir,",
          en: "a radio signal now takes 24 hours to reach it",
          pourquoi: "Le temps nécessaire se dit avec take : a signal takes 24 hours to reach it, ou it takes 24 hours for a signal to reach it. Reach est transitif : reach it, sans préposition.",
          pts: 1.5,
          ok: [
            "(a |any |each |every |the |one )?(radio )?(signal|message|radio message|transmission|command|radio signal|signals|messages|transmissions|commands|radio signals)( from (the )?earth| sent from (the )?earth| sent by nasa| from nasa)? (now )?(takes|needs|requires|take|need|require)( now)? (24 hours|a (full |whole )?day|1 (full |whole )?day|a full 24 hours|24 full hours)( now)? to (reach|get to|arrive at|travel to|make it to|get through to|be received by|cover the distance to|get out to|reach out to) (it|the probe|the spacecraft|voyager( 1)?|the craft)",
            "it (now )?takes (a |any |each |every |the |one )?(radio )?(signal|message|radio message|transmission|command|radio signal|signals|messages|transmissions|commands|radio signals)( from (the )?earth| sent from (the )?earth| sent by nasa| from nasa)? (now )?(24 hours|a (full |whole )?day|1 (full |whole )?day|a full 24 hours|24 full hours) to (reach|get to|arrive at|travel to|make it to) (it|the probe|the spacecraft|voyager( 1)?|the craft)",
            "it (now )?takes( now)? (24 hours|a (full |whole )?day|1 (full |whole )?day|a full 24 hours|24 full hours) for (a |any |each |every |the |one )?(radio )?(signal|message|radio message|transmission|command|radio signal|signals|messages|transmissions|commands|radio signals)( from (the )?earth| sent from (the )?earth| sent by nasa| from nasa)? to (reach|get to|arrive at|travel to|make it to|get through to|be received by) (it|the probe|the spacecraft|voyager( 1)?|the craft)",
            "(a |any |each |every |the |one )?(radio )?(signal|message|radio message|transmission|command|radio signal|signals|messages|transmissions|commands|radio signals)( from (the )?earth| sent from (the )?earth| sent by nasa| from nasa)? (now )?(takes|needs|requires) (24 hours|a (full |whole )?day|1 (full |whole )?day|a full 24 hours|24 full hours) to (reach|get to|arrive at|travel to|make it to) (it|the probe|the spacecraft|voyager( 1)?)"
          ],
          fautes: [
            {
              re: [
                "(puts|put|sets|places|is putting) (now )?(itself )?(24 hours|a (full |whole )?day|1 (full |whole )?day|a full 24 hours|24 full hours)"
              ],
              type: "gallicisme",
              pts: 1,
              faux: "a radio signal puts 24 hours to reach it",
              juste: "a radio signal takes 24 hours to reach it",
              test: "According to NASA, a radio signal now puts 24 hours to reach it, so a question sent to the probe only gets an answer two days later.",
              pourquoi: "« Mettre du temps à faire » ne se dit jamais avec put : l'anglais emploie take, avec le moyen ou la personne pour sujet (the signal takes 24 hours), ou it takes + durée + to.",
              regle: "Il faut, mettre (du temps) : <b>sb / sth takes + durée + to + base verbale</b>, ou <b>it takes + durée + (for sb) + to</b>.",
              ex: "It takes three weeks to get a visa.",
              exfr: "Il faut trois semaines pour obtenir un visa.",
              lecon: { n: 11, ancre: "heure-duree", titre: "Heures et durées : it takes" },
              carte: { fr: "mettre 24 heures à faire qqch", en: "to take 24 hours to do sth" }
            },
            {
              re: ["reach(es|ing)? (to|at) (it|the probe|the spacecraft|voyager|her|him)\\b", "arrive (to|at) (her|him)\\b", "reach (her|him)\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "to reach to it",
              juste: "to reach it",
              test: "According to NASA, a radio signal now takes 24 hours to reach to it, so a question sent to the probe only gets an answer two days later.",
              pourquoi: "« Parvenir à » se traduit par reach, un verbe transitif : il prend directement son complément, sans to ni at. Et la sonde est une chose : it, jamais her (lui ne désigne pas une personne ici).",
              regle: "<b>Reach + complément direct</b> (reach the probe, reach an agreement). Avec arrive, get : <b>arrive at, get to</b>.",
              ex: "The message reached the team the next day.",
              exfr: "Le message est parvenu à l'équipe le lendemain.",
              carte: { fr: "parvenir à la sonde", en: "to reach the probe (sans préposition)" }
            },
            {
              re: ["(for|of) (reaching|to reach|joining) (it|the probe|the spacecraft|voyager)"],
              type: "grammaire",
              pts: 0.5,
              faux: "takes 24 hours for reaching it",
              juste: "takes 24 hours to reach it",
              test: "According to NASA, a radio signal now takes 24 hours for reaching it, so a question sent to the probe only gets an answer two days later.",
              pourquoi: "« Pour » + infinitif, après une durée, exprime le but : l'anglais emploie to + base verbale, jamais for + -ing ni for to.",
              regle: "But après une durée : <b>to + base verbale</b> (it takes a day to reach it).",
              ex: "It took ten years to build the probe.",
              exfr: "Il a fallu dix ans pour construire la sonde.",
              lecon: { n: 11, ancre: "heure-duree", titre: "Heures et durées : it takes" },
              carte: { fr: "il faut un jour pour la joindre", en: "it takes a day to reach it" }
            }
          ]
        },
        {
          fr: "si bien qu'une question posée à la sonde",
          en: "so a question sent to the probe",
          pourquoi: "« Si bien que » annonce une conséquence : so, so that, which means that. « Posée à la sonde » : sent to the probe (ou put to the probe).",
          pts: 1,
          ok: [
            "(so|so that|which means( that)?|meaning( that)?|as a result|consequently|therefore|and so|hence|thus|with the result that|so much so that|in other words|this means( that)?|that means( that)?|and therefore|and as a result)( ,)? (a |any |each |every |the )?(question|query|request|command|message)( (that is |that has been |which is )?(sent|put|asked|addressed|posed|transmitted|beamed) (to|of) (the probe|the spacecraft|voyager( 1)?|it))?",
            "(so|so that|which means( that)?|meaning( that)?|as a result|consequently|therefore|and so|hence|thus|in other words) (when )?(engineers|nasa|scientists|the team|controllers) (ask|send)( it| the probe)? (a )?(question|command)"
          ],
          fautes: [
            {
              re: ["(so good|if well|so well|if good) (that|than)\\b", "(si|so) bien\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "so well that a question…",
              juste: "so a question…",
              test: "According to NASA, a radio signal now takes 24 hours to reach it, so well that a question sent to the probe only gets an answer two days later.",
              pourquoi: "« Si bien que » est une locution de conséquence : bien n'y garde pas son sens de « bien, correctement ». « So well that » voudrait dire « tellement bien que ». La conséquence se dit so, so that, which means that.",
              regle: "Conséquence : <b>so</b>, <b>so that</b>, <b>which means that</b>, <b>as a result</b>.",
              ex: "The road was closed, so we took the train.",
              exfr: "La route était fermée, si bien que nous avons pris le train.",
              carte: { fr: "si bien que (conséquence)", en: "so, which means that" }
            },
            {
              re: ["(asked|posed|put|sent|addressed) (at|for|on) (the probe|the spacecraft|voyager|it)\\b"],
              type: "grammaire",
              pts: 0.25,
              faux: "a question sent at the probe",
              juste: "a question sent to the probe",
              test: "According to NASA, a radio signal now takes 24 hours to reach it, so a question sent at the probe only gets an answer two days later.",
              pourquoi: "On envoie ou on pose une question à quelqu'un ou à quelque chose : to marque le destinataire. At indiquerait une cible visée, comme pour un projectile.",
              regle: "Destinataire : <b>send / put / address sth to sb</b> (a letter sent to the minister).",
              ex: "The question was put to the minister.",
              exfr: "La question a été posée au ministre.",
              carte: { fr: "poser une question à", en: "to put a question to, to send a question to" }
            }
          ]
        },
        {
          fr: "n'obtient sa réponse que deux jours plus tard.",
          en: "only gets an answer two days later",
          pourquoi: "« Ne … que » se traduit par only, placé devant le verbe (only gets) ou devant le complément de temps. « Plus tard » : later, après la durée (two days later).",
          pts: 1,
          ok: [
            "(only )?(gets|receives|obtains|has|gets back|receives back|will get|will receive|is given|can get)( its| an| a| the)? (answer|reply|response)( back)?( only)? (2 days|48 hours|2 full days) (later|afterward|after|on|after it was sent|after it is sent)",
            "(is|will be|can be|gets|can only be|will only be) (only )?(answered|replied to)( only)? (2 days|48 hours|2 full days) (later|afterward|after)",
            "(does not|will not|can not|cannot|doesn't) (get|receive|obtain) (its |an |a |the )?(answer|reply|response)( back)? (until|till) (2 days|48 hours|2 full days) (later|afterward)",
            "(does not|will not|can not) (get|receive|obtain) (its |an |a |the )?(answer|reply|response)( back)? for (2 days|48 hours|2 full days)",
            "(does not|will not) (get answered|get a reply|get an answer|be answered) (until|till) (2 days|48 hours|2 full days) (later|afterward)",
            "(the |its |an )?(answer|reply|response) (only )?(comes|arrives|comes back|returns|gets back|reaches earth)( only)? (2 days|48 hours|2 full days) (later|afterward)",
            "(is answered|gets answered|gets a reply|gets an answer|gets its answer|receives a reply|receives an answer|receives its answer) (only )?(2 days|48 hours|2 full days) (later|afterward)",
            "(waits|has to wait|must wait) (2 days|48 hours|2 full days) (for (its |an |a |the )?(answer|reply|response)|to be answered|to get (an |its |a )?(answer|reply|response))"
          ],
          fautes: [
            {
              re: ["more late\\b", "(later|late) of (2 days|48 hours|2 full days)", "(2 days|48 hours|2 full days) (more|plus) (late|later|tard)"],
              type: "gallicisme",
              pts: 0.5,
              faux: "two days more late",
              juste: "two days later",
              test: "According to NASA, a radio signal now takes 24 hours to reach it, so a question sent to the probe only gets an answer two days more late.",
              pourquoi: "« Plus tard » est une seule notion, le comparatif de late : later. « More late » est fautif (late est un adjectif court), et la durée se place devant : two days later.",
              regle: "Plus tard : <b>later</b> (comparatif court en -er). Durée + <b>later</b> (two days later), durée + <b>ago</b> (two days ago).",
              ex: "The reply arrived three hours later.",
              exfr: "La réponse est arrivée trois heures plus tard.",
              carte: { fr: "deux jours plus tard", en: "two days later" }
            },
            {
              re: [
                "(gets|receives|obtains|has) (her|his) (answer|reply|response)",
                "(does not|will not) (get|receive|obtain|have) (its |an |a |the |her |his )?(answer|reply|response) (that|than|only|but)\\b"
              ],
              type: "grammaire",
              pts: 0.5,
              faux: "does not get its answer than two days later",
              juste: "only gets an answer two days later",
              test: "According to NASA, a radio signal now takes 24 hours to reach it, so a question sent to the probe does not get its answer than two days later.",
              pourquoi: "« Ne … que » ne se traduit pas par une négation suivie de than ou that : la phrase anglaise devient fausse ou négative. Il suffit de only devant le verbe, ou de not … until (pas avant). Et la réponse appartient à une question, une chose : its, jamais her.",
              regle: "Ne … que : <b>only</b> (it only gets an answer two days later) ou <b>not … until</b> (it does not get an answer until two days later).",
              ex: "We only heard the news this morning.",
              exfr: "Nous n'avons appris la nouvelle que ce matin.",
              carte: { fr: "ne … que deux jours plus tard", en: "only two days later / not until two days later" }
            }
          ]
        }
      ]
    },
    {
      fr: "Lancée en 1977 pour une mission de cinq ans, elle fonctionne depuis 49 ans, mais ses [[générateurs au plutonium]] ne produisent plus qu'environ 210 watts, contre 470 au [[lancement]].",
      cartes: [],
      aides: [{ fr: "un générateur au plutonium", en: "a plutonium generator" }, { fr: "au lancement", en: "at launch" }],
      proposition: "Launched in 1977 for a five-year mission, it has been operating for 49 years, but its plutonium generators now produce only about 210 watts, compared with 470 at launch.",
      autres: [
        "Launched in 1977 on a mission meant to last five years, the probe has been working for 49 years, but its plutonium generators now supply just 210 watts or so, down from 470 at launch."
      ],
      tests: [
        "Launched in 1977 for a five-year mission, it has kept working for 49 years, but its plutonium-powered generators produce only about 210 watts today, compared to 470 when it was launched.",
        "Sent into space in 1977 for a five-year mission, the spacecraft has been in operation for 49 years, yet its plutonium generators now generate no more than about 210 watts, against 470 at the outset."
      ],
      morceaux: [
        {
          fr: "Lancée en 1977 pour une mission de cinq ans,",
          en: "Launched in 1977 for a five-year mission",
          pourquoi: "Le participe passé seul, en tête, remplace « lancée » : launched in 1977. Un nombre + un nom devant un autre nom devient un adjectif composé, invariable : a five-year mission.",
          pts: 1,
          ok: [
            "(launched|sent|sent into space|launched into space|having been launched|blasted off) (in 1977 )?(for|on) (a |what was meant to be a |what was planned as a |what was supposed to be a |what was intended as a |what was designed as a |an initial |a planned |a scheduled )?(5 year|5 years') (mission|trip|journey|program)( in 1977)?",
            "(launched|sent into space|launched into space) in 1977 (for|on) (a |an )?(initial )?mission (of|lasting|that was to last|that was (supposed|meant|planned|designed|expected|scheduled|intended) to last|meant to last|planned to last|designed to last|scheduled to last|supposed to last|expected to last|intended to last) (only |just )?5 years",
            "(launched|sent into space|launched into space|built) in 1977 (to last|meant to last|designed to last|built to last|planned to last|for) (only |just )?5 years",
            "(it was |when it was )?launched in 1977 (for|on) (a )?(planned |scheduled |intended |initial )?5 year (mission|trip|journey)"
          ],
          fautes: [
            {
              re: ["5 years (mission|trip|journey|program)"],
              type: "grammaire",
              pts: 0.5,
              faux: "a five-years mission",
              juste: "a five-year mission",
              test: "Launched in 1977 for a five-years mission, it has been operating for 49 years, but its plutonium generators now produce only about 210 watts, compared with 470 at launch.",
              pourquoi: "Placé devant un nom, le groupe « nombre + nom » devient un adjectif composé, avec un trait d'union. Or un adjectif ne prend jamais de s en anglais : a five-year mission, comme a ten-year project.",
              regle: "<b>Nombre + nom au singulier</b> devant un nom (a five-year mission, a 27-page report). Après le verbe, le pluriel revient (the mission lasted five years).",
              ex: "The government unveiled a ten-year plan.",
              exfr: "Le gouvernement a dévoilé un plan sur dix ans.",
              lecon: { n: 11, ancre: "mesures", titre: "Nombre + nom : a ten-year project" },
              carte: { fr: "une mission de cinq ans", en: "a five-year mission (adjectif composé invariable)" }
            },
            {
              re: ["(lanced|lanched|lunched|launching) (in )?1977", "^launching\\b"],
              type: "barbarisme",
              pts: 0.5,
              faux: "Lanced in 1977 / Launching in 1977",
              juste: "Launched in 1977",
              test: "Lanced in 1977 for a five-year mission, it has been operating for 49 years, but its plutonium generators now produce only about 210 watts, compared with 470 at launch.",
              pourquoi: "« Lancer » une fusée ou une sonde se dit to launch (launched, launched). « Lanced » est un calque qui n'existe pas dans ce sens, et le participe présent launching aurait un sens actif (en lançant).",
              regle: "Lancer (une sonde, une campagne) : <b>to launch</b>. Participe passé en tête de phrase pour « lancée en » : <b>launched in</b>.",
              ex: "Launched in 1990, the Hubble telescope is still working.",
              exfr: "Lancé en 1990, le télescope Hubble fonctionne toujours.",
              carte: { fr: "lancée en 1977", en: "launched in 1977" }
            }
          ]
        },
        {
          fr: "elle fonctionne depuis 49 ans,",
          en: "it has been operating for 49 years",
          pourquoi: "« Depuis » + une durée, pour une action qui dure encore : present perfect (de préférence continu) + for, it has been operating for 49 years. La sonde est une chose : it.",
          pts: 1.5,
          ok: [
            "(it|the probe|the spacecraft|voyager( 1)?|the craft) (has|had) (now )?been (operating|working|running|functioning|operational|in operation|in service|active|going|flying|at work|traveling|journeying|in use)( now)? for (almost |nearly |close to |more than |over )?49 years",
            "(it|the probe|the spacecraft|voyager( 1)?|the craft) (has|had) (now )?(operated|worked|functioned|run|kept working|kept going|kept running|remained operational|remained active|stayed operational|stayed active|remained in service|been in service|been in operation|lasted|kept on working|survived|continued to work|continued working|continued operating)( now)? for (almost |nearly |more than |over )?49 years",
            "(it|the probe|the spacecraft) (has been|is) still (working|operating|running|operational|going|functioning) (49 years later|after 49 years|49 years on)",
            "(it|the probe|the spacecraft) (has|had) been (operating|working|running|functioning|in operation|operational|in service) (ever )?since( then| 1977)"
          ],
          fautes: [
            {
              re: ["since 49 years"],
              type: "grammaire",
              pts: 1,
              faux: "it has been operating since 49 years",
              juste: "it has been operating for 49 years",
              test: "Launched in 1977 for a five-year mission, it has been operating since 49 years, but its plutonium generators now produce only about 210 watts, compared with 470 at launch.",
              pourquoi: "« Depuis » se traduit par since devant un point de départ (since 1977) et par for devant une durée (for 49 years). « Since 49 years » est la faute la plus fréquente des francophones.",
              regle: "<b>Since</b> + point de départ (since 1977). <b>For</b> + durée (for 49 years). Les deux avec le <b>present perfect</b>.",
              ex: "She has worked at NASA for twenty years, since 2006.",
              exfr: "Elle travaille à la NASA depuis vingt ans, depuis 2006.",
              lecon: { n: 15, ancre: "erreurs", titre: "Since, for : les erreurs fréquentes" },
              carte: { fr: "depuis 49 ans", en: "for 49 years (for + durée)" }
            },
            {
              re: [
                "(it|the probe|the spacecraft|voyager( 1)?|she) (works|operates|functions|runs|is working|is operating|is functioning|is running|worked|operated|functioned|ran) (since|for) (49 years|1977)"
              ],
              type: "grammaire",
              pts: 1,
              faux: "it works for 49 years",
              juste: "it has been operating for 49 years",
              test: "Launched in 1977 for a five-year mission, it works for 49 years, but its plutonium generators now produce only about 210 watts, compared with 470 at launch.",
              pourquoi: "Le français dit « elle fonctionne depuis » au présent, car l'action continue. L'anglais relie le passé au présent avec le present perfect (continu pour une activité) : it has been operating. Le présent simple ou le prétérit avec since ou for est faux.",
              regle: "Action commencée dans le passé et qui dure : <b>have been + V-ing</b> ou <b>have + participe passé</b> + since / for. Jamais le présent simple.",
              ex: "He has been living in Houston for ten years.",
              exfr: "Il vit à Houston depuis dix ans.",
              lecon: { n: 15, ancre: "erreurs", titre: "Since, for : les erreurs fréquentes" },
              carte: { fr: "elle fonctionne depuis 49 ans", en: "it has been operating for 49 years" }
            }
          ]
        },
        {
          fr: "mais ses générateurs au plutonium ne produisent plus qu'environ 210 watts,",
          en: "but its plutonium generators now produce only about 210 watts",
          pourquoi: "« Ses » renvoie à la sonde, une chose : its. « Au plutonium » : plutonium generators, le nom qui précise devant. « Ne … plus que » : now … only.",
          pts: 1,
          ok: [
            "(but|yet|while|whereas|though|although|and) (its|the probe's|the spacecraft's|voyager's|voyager 1's|the) (3 )?(plutonium (powered |fueled |based )?(generators|batteries|power sources|power generators|radioisotope generators|thermoelectric generators|power plants|nuclear generators|nuclear batteries)|(generators|power sources|batteries|nuclear generators|nuclear batteries|radioisotope thermoelectric generators|thermoelectric generators) (powered by|running on|fueled by|using|that run on|which run on) plutonium) (now |today )?(only )?(produce|generate|provide|supply|deliver|put out|yield|give out|give|output|churn out|turn out)( now| today)?( only)? (only |just |merely |no more than |not more than |little more than |a mere )?(about |around |roughly |some |approximately |an estimated |barely |just under )?210 (watts|w)( of (power|electricity))?( today| now)?",
            "(but|yet|while|whereas|though|although|and) (its|the probe's|the spacecraft's|voyager's|voyager 1's|the) (3 )?(plutonium (powered |fueled |based )?(generators|batteries|power sources|power generators|radioisotope generators|thermoelectric generators|power plants|nuclear generators|nuclear batteries)|(generators|power sources|batteries|nuclear generators|nuclear batteries|radioisotope thermoelectric generators|thermoelectric generators) (powered by|running on|fueled by|using|that run on|which run on) plutonium) (now |today )?(no longer|do not|can not) (produce|generate|provide|supply|deliver|put out|yield|give out|give|output|churn out|turn out) (more than|anything more than|over|any more than) (about |around |roughly )?210 (watts|w)",
            "(but|yet|while|whereas|though|although|and) (its|the probe's|the spacecraft's|voyager's|voyager 1's|the) (3 )?(plutonium (powered |fueled |based )?(generators|batteries|power sources|power generators|radioisotope generators|thermoelectric generators|power plants|nuclear generators|nuclear batteries)|(generators|power sources|batteries|nuclear generators|nuclear batteries|radioisotope thermoelectric generators|thermoelectric generators) (powered by|running on|fueled by|using|that run on|which run on) plutonium) (now |today )?(have dropped to|have fallen to|are down to|have declined to|have slipped to) (producing |generating |supplying )?(only |just |merely |no more than |not more than |little more than |a mere )?(about |around |roughly |some |approximately |an estimated |barely |just under )?210 (watts|w)",
            "(but|yet|while|whereas|though|although|and) (the )?(power|output|electricity|power output|electrical output|energy) (produced by|from|of|generated by|supplied by) (its|the probe's|the spacecraft's|voyager's|voyager 1's|the) (3 )?(plutonium (powered |fueled |based )?(generators|batteries|power sources|power generators|radioisotope generators|thermoelectric generators|power plants|nuclear generators|nuclear batteries)|(generators|power sources|batteries|nuclear generators|nuclear batteries|radioisotope thermoelectric generators|thermoelectric generators) (powered by|running on|fueled by|using|that run on|which run on) plutonium) (has )?(now )?(fallen|dropped|declined|shrunk|is down|is|stands at|amounts to)( to)? (only |just |merely |no more than |not more than |little more than |a mere )?(about |around |roughly |some |approximately |an estimated |barely |just under )?210 (watts|w)"
          ],
          fautes: [
            {
              re: ["(her|his|their) (3 )?(plutonium |own |nuclear )?(generators|power sources|batteries)"],
              type: "grammaire",
              pts: 0.5,
              faux: "her plutonium generators",
              juste: "its plutonium generators",
              test: "Launched in 1977 for a five-year mission, it has been operating for 49 years, but her plutonium generators now produce only about 210 watts, compared with 470 at launch.",
              pourquoi: "« Ses » renvoie à la sonde. En français, une sonde est féminine (elle), mais en anglais un objet est neutre : its. Her ne renvoie qu'à une femme (ou, par tradition, à un navire).",
              regle: "Possessif = <b>possesseur</b> : his (un homme), her (une femme), <b>its</b> (une chose, un animal, un pays), their (plusieurs).",
              ex: "The rocket lost one of its engines.",
              exfr: "La fusée a perdu un de ses moteurs.",
              lecon: { n: 3, ancre: "possessifs", titre: "Adjectifs et pronoms possessifs" },
              carte: { fr: "ses générateurs (la sonde)", en: "its generators (its = une chose)" }
            },
            {
              re: ["plutonium's (generators|batteries)", "(generators|batteries) (of|with|at|in|to|a) plutonium\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "its generators at plutonium",
              juste: "its plutonium generators",
              test: "Launched in 1977 for a five-year mission, it has been operating for 49 years, but its generators at plutonium now produce only about 210 watts, compared with 470 at launch.",
              pourquoi: "« Au plutonium » décrit ce qui alimente les générateurs. L'anglais place le nom qui précise devant, sans préposition : plutonium generators, comme a gas cooker ou a diesel engine. Sinon : generators powered by plutonium.",
              regle: "<b>Nom + nom</b> : le nom qui précise devant (a plutonium generator, a diesel engine) ; ou <b>powered by / running on</b>.",
              ex: "Most buses in the city now run on electricity.",
              exfr: "La plupart des bus de la ville roulent désormais à l'électricité.",
              lecon: { n: 8, ancre: "adjectif-position", titre: "La place de l'adjectif épithète" },
              carte: { fr: "un générateur au plutonium", en: "a plutonium generator (nom + nom)" }
            }
          ]
        },
        {
          fr: "contre 470 au lancement.",
          en: "compared with 470 at launch",
          pourquoi: "Pour mettre deux chiffres en regard : compared with (ou down from). « Au lancement » se dit at launch, sans article.",
          pts: 0.5,
          ok: [
            "(compared (with|to)|versus|vs|against|as against|down from|as opposed to|in comparison with|in comparison to|from|instead of|whereas they (produced|generated|supplied|provided|delivered)|while they (produced|generated|supplied|provided|delivered)|when they (produced|generated|supplied|delivered)|having produced|having supplied)( the)? (about )?470( watts| w)?( they (produced|generated|supplied|provided|delivered))? (at launch|at its launch|at the launch|on launch|when (it was )?launched|at the time of (its )?launch|in 1977|at the start|at the outset|originally|initially|at takeoff|at lift off|at liftoff|when it (was launched|left earth|took off|set off)|at the beginning|at first|when it started out)",
            "(down|falling|dropping) from (the )?470( watts| w)? (it had |they produced |they generated )?(at launch|at its launch|at the launch|on launch|when (it was )?launched|at the time of (its )?launch|in 1977|at the start|at the outset|originally|initially|at takeoff|at lift off|at liftoff|when it (was launched|left earth|took off|set off)|at the beginning|at first|when it started out)",
            "(whereas|while|when) (they|it) (produced|generated|supplied|provided|delivered|had) 470( watts| w)? (at launch|at its launch|at the launch|on launch|when (it was )?launched|at the time of (its )?launch|in 1977|at the start|at the outset|originally|initially|at takeoff|at lift off|at liftoff|when it (was launched|left earth|took off|set off)|at the beginning|at first|when it started out)"
          ],
          fautes: [
            {
              re: ["(at|on|in) (the |its )?(launching|lancement)\\b", "(at|on|in) (the |its )?(departure|depart)\\b"],
              type: "gallicisme",
              pts: 0.25,
              faux: "at the launching / at the departure",
              juste: "at launch",
              test: "Launched in 1977 for a five-year mission, it has been operating for 49 years, but its plutonium generators now produce only about 210 watts, compared with 470 at the launching.",
              pourquoi: "« Au lancement » se dit at launch, sans article : launch est ici un nom d'événement. Launching est la forme en -ing du verbe (l'action de lancer), et departure s'emploie pour un train ou un voyageur, pas pour une fusée.",
              regle: "Au lancement : <b>at launch</b> (ou when it was launched). Au décollage : <b>at liftoff</b>.",
              ex: "The rocket weighed 600 tonnes at launch.",
              exfr: "La fusée pesait 600 tonnes au lancement.",
              carte: { fr: "au lancement", en: "at launch" }
            },
            {
              re: ["(compared|comparing|comparison) (at|than|of|by) (the )?470"],
              type: "grammaire",
              pts: 0.25,
              faux: "compared at 470",
              juste: "compared with 470",
              test: "Launched in 1977 for a five-year mission, it has been operating for 49 years, but its plutonium generators now produce only about 210 watts, compared at 470 at launch.",
              pourquoi: "Compared se construit avec with ou to : compared with 470, compared to 470. At, than ou of ne conviennent pas après compared.",
              regle: "<b>Compared with / to</b> + élément comparé (compared with 470 at launch). Ou <b>down from</b> pour une baisse.",
              ex: "Sales rose to 5 million, compared with 3 million last year.",
              exfr: "Les ventes ont atteint 5 millions, contre 3 millions l'an dernier.",
              carte: { fr: "contre 470 (au départ)", en: "compared with 470, down from 470" }
            }
          ]
        }
      ]
    },
    {
      fr: "((Face à)) cette baisse, la NASA a [[éteint]] ses instruments [[un à un]] : seuls deux sur dix fonctionnent encore dans l'espace interstellaire, où elle est entrée en 2012.",
      cartes: [{ id: "d331381d95", fr: "face à, devant", en: "in the face of", re: "in the face of" }],
      aides: [{ fr: "éteindre (un appareil)", en: "to switch off, to turn off" }, { fr: "un à un", en: "one by one" }],
      proposition: "In the face of this decline, NASA has switched off its instruments one by one: only two out of ten are still working in interstellar space, which it entered in 2012.",
      autres: [
        "Faced with this decline, NASA has turned off its instruments one after another: only two of the ten are still operating in interstellar space, which the probe entered in 2012."
      ],
      tests: [
        "In the face of this drop, NASA switched off its instruments one by one: just two out of ten still work in interstellar space, which it entered in 2012.",
        "In the face of this fall in power, NASA has gradually shut down its instruments: only two out of ten remain active in interstellar space, which it reached in 2012."
      ],
      morceaux: [
        {
          fr: "Face à cette baisse,",
          en: "In the face of this decline",
          pourquoi: "« Face à » une difficulté se dit in the face of (ou faced with). « Cette baisse » : this decline, this drop.",
          pts: 0.5,
          ok: [
            "(in the face of|faced with|confronted with|given|in response to|because of|to cope with|to deal with|in view of|due to|owing to|to adapt to|against|as a result of|following|with|facing|confronting) (this|that|the|such a|these) (decline|drop|fall|decrease|loss( of power| of energy)?|reduction|dwindling power|power loss|energy loss|shortfall|slide|dip|power drop|drop in power|fall in power|decline in power|dwindling supply|declining power|loss in power|falling power|power shortage|energy shortage|shrinking power supply|dwindling energy|drops|falls|declines|losses|cuts)"
          ],
          fautes: [
            {
              re: ["(face to|in front of|facing to|face at|in face of) (this|that|the|such)"],
              type: "gallicisme",
              pts: 0.5,
              faux: "Face to this decline / In front of this decline",
              juste: "In the face of this decline",
              test: "Face to this decline, NASA has switched off its instruments one by one: only two out of ten are still working in interstellar space, which it entered in 2012.",
              pourquoi: "« Face à » ne se calque pas : « face to face » existe, mais « face to this decline » non, et in front of désigne une position dans l'espace (devant la porte). Devant une difficulté, l'anglais dit in the face of ou faced with.",
              regle: "Face à (une difficulté) : <b>in the face of</b>, <b>faced with</b>. Devant (un lieu) : in front of.",
              ex: "In the face of rising costs, the agency cut several projects.",
              exfr: "Face à la hausse des coûts, l'agence a supprimé plusieurs projets.",
              carte: { fr: "face à cette baisse", en: "in the face of this decline, faced with this decline" }
            },
            {
              re: ["(faced|confronted) (to|at|by) (this|that|the|such)"],
              type: "grammaire",
              pts: 0.25,
              faux: "faced to this decline",
              juste: "faced with this decline",
              test: "Faced to this decline, NASA has switched off its instruments one by one: only two out of ten are still working in interstellar space, which it entered in 2012.",
              pourquoi: "Faced et confronted se construisent avec with : faced with this decline. To est un calque de « confronté à ».",
              regle: "<b>Faced with / confronted with</b> + difficulté.",
              ex: "Faced with the crisis, the government acted quickly.",
              exfr: "Face à la crise, le gouvernement a agi vite.",
              carte: { fr: "confronté à", en: "faced with, confronted with" }
            }
          ]
        },
        {
          fr: "la NASA a éteint ses instruments un à un :",
          en: "NASA has switched off its instruments one by one",
          pourquoi: "Éteindre un appareil : switch off, turn off, shut down. « Un à un » : one by one. Sans date précise, present perfect (has switched off) ou prétérit.",
          pts: 1.5,
          ok: [
            "nasa ((has|had) )?(had to )?(gradually |progressively |steadily )?((switched off|turned off|shut down|shut off|powered down|powered off|deactivated|disabled)|(switch|switched|turn|turned|shut|power|powered) (off|down)) (its|the probe s|the probe's|the spacecraft's|voyager's|the|its scientific|its science|the scientific) ?(scientific |science |onboard |on board )?(instruments|science instruments|scientific instruments|instruments)( off| down)? (1 by 1|1 after (the )?(other|another)|gradually|progressively|in turn|in succession|1 at a time|bit by bit|little by little|1 after the other)",
            "nasa ((has|had) )?(had to )?(gradually |progressively |steadily )?(switch|switched|turn|turned|shut|power|powered) (its|the probe s|the probe's|the spacecraft's|voyager's|the|its scientific|its science|the scientific) ?(scientific |science |onboard |on board )?(instruments|science instruments|scientific instruments|instruments) (off|down) (1 by 1|1 after (the )?(other|another)|gradually|progressively|in turn|in succession|1 at a time|bit by bit|little by little|1 after the other)",
            "nasa ((has|had) )?(had to )?(1 by 1|1 after (the )?(other|another)|gradually|progressively|in turn|in succession|1 at a time|bit by bit|little by little|1 after the other) ((switched off|turned off|shut down|shut off|powered down|powered off|deactivated|disabled)|(switch|switched|turn|turned|shut|power|powered) (off|down)) (its|the probe s|the probe's|the spacecraft's|voyager's|the|its scientific|its science|the scientific) ?(scientific |science |onboard |on board )?(instruments|science instruments|scientific instruments|instruments)",
            "nasa ((has|had) )?(had to )?(gradually |progressively |steadily )((switched off|turned off|shut down|shut off|powered down|powered off|deactivated|disabled)|(switch|switched|turn|turned|shut|power|powered) (off|down)) (its|the probe s|the probe's|the spacecraft's|voyager's|the|its scientific|its science|the scientific) ?(scientific |science |onboard |on board )?(instruments|science instruments|scientific instruments|instruments)",
            "nasa ((has|had) )?(been )?((switched off|turned off|shut down|shut off|powered down|powered off|deactivated|disabled)|switching off|turning off|shutting down) (its|the probe s|the probe's|the spacecraft's|voyager's|the|its scientific|its science|the scientific) ?(scientific |science |onboard |on board )?(instruments|science instruments|scientific instruments|instruments) (1 by 1|1 after (the )?(other|another)|gradually|progressively|in turn|in succession|1 at a time|bit by bit|little by little|1 after the other)"
          ],
          fautes: [
            {
              re: ["(extinguished|extinguish|extinct|extincted|eteint|eteinted|put out|blew out)\\b"],
              type: "faux-sens",
              pts: 0.5,
              faux: "NASA has extinguished its instruments",
              juste: "NASA has switched off its instruments",
              test: "In the face of this decline, NASA has extinguished its instruments one by one: only two out of ten are still working in interstellar space, which it entered in 2012.",
              pourquoi: "To extinguish, to put out : éteindre un feu, une bougie, une cigarette. Pour un appareil électrique, une lumière ou un instrument, l'anglais dit switch off, turn off ou shut down.",
              regle: "Éteindre (un appareil) : <b>switch off, turn off, shut down</b>. Éteindre (un feu) : <b>put out, extinguish</b>.",
              ex: "Please switch off your phone.",
              exfr: "Merci d'éteindre votre téléphone.",
              carte: { fr: "éteindre (un appareil)", en: "to switch off, to turn off (extinguish = un feu)" }
            },
            {
              re: ["1 (to|at|per|for) 1\\b", "1 and 1\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "one to one",
              juste: "one by one",
              test: "In the face of this decline, NASA has switched off its instruments one to one: only two out of ten are still working in interstellar space, which it entered in 2012.",
              pourquoi: "« Un à un » se dit one by one. « One to one » veut dire en tête à tête (a one-to-one meeting, un entretien individuel) et ne marque pas une succession.",
              regle: "Un à un, l'un après l'autre : <b>one by one</b>, <b>one after another</b>. En tête à tête : one-to-one.",
              ex: "The lights went out one by one.",
              exfr: "Les lumières se sont éteintes une à une.",
              carte: { fr: "un à un", en: "one by one (one-to-one = en tête à tête)" }
            }
          ]
        },
        {
          fr: "seuls deux sur dix fonctionnent encore",
          en: "only two out of ten are still working",
          pourquoi: "« Seuls deux » : only two. « Sur dix » : out of ten. « Encore » au sens de « toujours » : still, placé après be.",
          pts: 1,
          ok: [
            "(only|just|but) 2 (of them |of its instruments |instruments )?(out of|of|in) (the |its )?(original )?10( instruments)? (are|remain) (still )?(working|operating|running|functioning|operational|active|in operation|in service|on|switched on|turned on|in use)",
            "(only|just) 2 (of them |instruments )?(out of|of|in) (the |its )?(original )?10( instruments)? (still )?(work|operate|function|run|remain active|remain operational|remain on|remain in operation|remain in use)( still)?",
            "(only|just) 2 (are|remain) still (working|operating|running|functioning|operational|active|in operation|on) (out of|of) (the |its )?10",
            "(only|just) 2 (instruments )?(out of|of) (the |its )?10 (are|remain) still (working|operating|running|functioning|operational|active)"
          ],
          fautes: [
            {
              re: ["2 (on|over|for|out|sur) 10\\b"],
              type: "gallicisme",
              pts: 0.5,
              faux: "only two on ten",
              juste: "only two out of ten",
              test: "In the face of this decline, NASA has switched off its instruments one by one: only two on ten are still working in interstellar space, which it entered in 2012.",
              pourquoi: "« Deux sur dix » : le sur français ne se traduit ni par on ni par over. Pour une proportion, l'anglais dit out of (two out of ten) ou of (two of the ten).",
              regle: "Proportion : <b>out of</b> (two out of ten, 9 out of 10 doctors). Note sur 20 : 15 out of 20.",
              ex: "Three out of four households own a car.",
              exfr: "Trois foyers sur quatre possèdent une voiture.",
              carte: { fr: "deux sur dix", en: "two out of ten" }
            },
            {
              re: [
                "(only|just) 2 ((out of|of) (the )?10 )?(still )?(works|operates|functions|runs|is working|is operating|is functioning|is still|is running|remains)\\b"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "only two out of ten is still working",
              juste: "only two out of ten are still working",
              test: "In the face of this decline, NASA has switched off its instruments one by one: only two out of ten is still working in interstellar space, which it entered in 2012.",
              pourquoi: "Le sujet est two (deux instruments) : le verbe s'accorde au pluriel, are. Out of ten ne change rien à l'accord, qui se fait avec le nombre.",
              regle: "<b>Nombre + (out of …) + verbe pluriel</b> (two out of ten are working, nine out of ten say).",
              ex: "Nine out of ten experts agree.",
              exfr: "Neuf experts sur dix sont d'accord.",
              lecon: { n: 7, ancre: "quantifieurs", titre: "Accord avec les quantifieurs et pourcentages" },
              carte: { fr: "seuls deux fonctionnent", en: "only two are working (pluriel)" }
            }
          ]
        },
        {
          fr: "dans l'espace interstellaire, où elle est entrée en 2012.",
          en: "in interstellar space, which it entered in 2012",
          pourquoi: "L'adjectif se place devant le nom : interstellar space. To enter est transitif (entrer dans = enter, sans préposition) : le relatif est donc which, complément direct, which it entered in 2012.",
          pts: 1,
          ok: [
            "(in|out in|deep in|in the depths of) (the )?interstellar (space|medium),? (which|that) (it|the probe|the spacecraft|voyager( 1)?) (entered|reached|crossed into|moved into|passed into|got into|went into|arrived in|broke into|first entered) (back )?in 2012",
            "(in|out in|deep in) (the )?interstellar (space|medium),? (into which) (it|the probe|the spacecraft|voyager( 1)?) (passed|moved|crossed|went|flew)( back)? in 2012",
            "(in|out in|deep in) (the )?interstellar (space|medium),? (where) (it|the probe|the spacecraft|voyager( 1)?) (arrived in|has been since|has been traveling since|has been flying since|has traveled since|has been located since|has been) 2012",
            "(in|out in|deep in) (the )?interstellar (space|medium),? (which|where) (it|the probe|the spacecraft) (has been in|has been exploring|has been traveling through|has been flying through|has been crossing) since 2012",
            "(in|out in|deep in) (the )?interstellar (space|medium),? (reached|entered) (by (it|the probe|the spacecraft) )?in 2012",
            "(in|out in|deep in) (the )?interstellar (space|medium),? (it|the probe|the spacecraft) having (entered|reached) it in 2012"
          ],
          fautes: [
            {
              re: [
                "(entered|enter|enters|entering) (in|into) (it|interstellar|the interstellar)",
                "where (it|the probe|the spacecraft|voyager( 1)?|she) (entered|has entered|went in|got in|was entered|is entered)\\b"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "where it entered in 2012",
              juste: "which it entered in 2012",
              test: "In the face of this decline, NASA has switched off its instruments one by one: only two out of ten are still working in interstellar space, where it entered in 2012.",
              pourquoi: "« Entrer dans » se dit to enter, sans préposition : the probe entered interstellar space. Le verbe a donc besoin d'un complément direct, et le relatif qui le remplace est which (ou that), pas where : which it entered in 2012.",
              regle: "<b>Enter + complément direct</b> (enter a room, enter the market). Relatif complément direct : <b>which / that</b>.",
              ex: "The firm entered the Asian market last year.",
              exfr: "L'entreprise est entrée sur le marché asiatique l'an dernier.",
              lecon: { n: 26, ancre: "objet", titre: "Le relatif complément" },
              carte: { fr: "où elle est entrée (l'espace)", en: "which it entered (enter + complément direct)" }
            },
            {
              re: ["(the )?space interstellar", "\\binterstellaire\\b", "\\binterstellary\\b", "\\binterstellare\\b"],
              type: "grammaire",
              pts: 0.5,
              faux: "in the space interstellar",
              juste: "in interstellar space",
              test: "In the face of this decline, NASA has switched off its instruments one by one: only two out of ten are still working in the space interstellar, which it entered in 2012.",
              pourquoi: "En français, l'adjectif suit souvent le nom (l'espace interstellaire). En anglais, l'adjectif épithète se place toujours devant, et il est invariable : interstellar space, sans article au sens général.",
              regle: "Adjectif épithète <b>avant le nom</b> : interstellar space, a distant star.",
              ex: "Scientists still know little about deep space.",
              exfr: "Les scientifiques savent encore peu de choses de l'espace lointain.",
              lecon: { n: 8, ancre: "adjectif-position", titre: "La place de l'adjectif épithète" },
              carte: { fr: "l'espace interstellaire", en: "interstellar space" }
            }
          ]
        }
      ]
    },
    {
      fr: "La NASA ((vise à)) [[garder ses instruments en marche]] jusqu'aux 50 ans de la sonde, à l'été 2027 ; ((reste à savoir si)) elle tiendra encore trois à cinq ans, comme l'espère son équipe.",
      cartes: [
        { id: "1e3cce3ca8", fr: "viser à, avoir pour objectif de", en: "to aim to", re: "aim(s|ed|ing)? (to|at)" },
        { id: "572ba4a331", fr: "reste à savoir si", en: "it remains to be seen whether", re: "remains to be seen (whether|if)" }
      ],
      aides: [{ fr: "garder (qqch) en marche", en: "to keep (sth) running" }],
      proposition: "NASA aims to keep its instruments running until the probe's 50th anniversary, in the summer of 2027; it remains to be seen whether it will last another three to five years, as its team hopes.",
      autres: [
        "NASA aims to keep its instruments working until the probe turns 50, in the summer of 2027; it remains to be seen whether it can keep going for another three to five years, as its engineers hope."
      ],
      tests: [
        "NASA aims to keep the instruments running until the probe's fiftieth anniversary, in summer 2027; it remains to be seen whether it will survive for another three to five years, as its team hopes.",
        "NASA aims to keep its instruments on until the probe's 50th birthday, in the summer of 2027; it remains to be seen if it will last three to five more years, as the team hopes."
      ],
      morceaux: [
        {
          fr: "La NASA vise à garder ses instruments en marche",
          en: "NASA aims to keep its instruments running",
          pourquoi: "« Viser à » : aim to + base verbale. « Garder en marche » : keep + complément + running (working, going).",
          pts: 1,
          ok: [
            "nasa (aims|hopes|intends|plans|is aiming|wants|is hoping|expects|is determined|seeks|is seeking|has set itself the goal|is trying|is working|would like|wishes|has pledged|is planning) to keep (its|the probe s|the probe's|the spacecraft's|voyager's|the|its scientific|its science|the scientific) ?(scientific |science |onboard |on board )?(instruments|science instruments|scientific instruments|instruments) (running|working|operating|going|on|switched on|turned on|alive|active|in operation|functioning|operational|powered|powered on)",
            "nasa('s)? (aim|goal|objective|target|hope|plan) is to keep (its|the probe s|the probe's|the spacecraft's|voyager's|the|its scientific|its science|the scientific) ?(scientific |science |onboard |on board )?(instruments|science instruments|scientific instruments|instruments) (running|working|operating|going|on|switched on|turned on|alive|active|in operation|functioning|operational|powered|powered on)",
            "nasa (aims|hopes|intends|plans|wants|is aiming|is hoping) to (keep )?(run|operate) (its|the probe s|the probe's|the spacecraft's|voyager's|the|its scientific|its science|the scientific) ?(scientific |science |onboard |on board )?(instruments|science instruments|scientific instruments|instruments)",
            "nasa (is aiming|aims) at keeping (its|the probe s|the probe's|the spacecraft's|voyager's|the|its scientific|its science|the scientific) ?(scientific |science |onboard |on board )?(instruments|science instruments|scientific instruments|instruments) (running|working|operating|going|on|switched on|turned on|alive|active|in operation|functioning|operational|powered|powered on)",
            "nasa (aims|hopes|intends|plans|is aiming|wants|is hoping|expects|is determined|seeks|is seeking|has set itself the goal|is trying|is working|would like|wishes|has pledged|is planning) to keep (the probe's|voyager's|its 2|the 2) (remaining )?(instruments|scientific instruments) (running|working|operating|going|on|switched on|turned on|alive|active|in operation|functioning|operational|powered|powered on)"
          ],
          fautes: [
            {
              re: ["aim(s|ed)? to keeping", "aim(s|ed|ing)? at keep\\b", "(vises?|visees?|aims?) (for|of) keep(ing)?"],
              type: "grammaire",
              pts: 0.5,
              faux: "NASA aims to keeping its instruments running",
              juste: "NASA aims to keep its instruments running",
              test: "NASA aims to keeping its instruments running until the probe's 50th anniversary, in the summer of 2027; it remains to be seen whether it will last another three to five years, as its team hopes.",
              pourquoi: "Aim se construit soit avec to + base verbale (aim to keep), soit avec at + V-ing (aim at keeping). Le mélange des deux, to keeping ou at keep, est fautif.",
              regle: "<b>Aim to + base verbale</b> (aim to keep) ou <b>aim at + V-ing</b> (aim at keeping).",
              ex: "The agency aims to launch a new probe in 2030.",
              exfr: "L'agence vise à lancer une nouvelle sonde en 2030.",
              carte: { fr: "viser à faire qqch", en: "to aim to do sth / to aim at doing sth" }
            },
            {
              re: [
                "(in|on|en) (march|marching|walk|walking)\\b",
                "(keep|keeping|maintain|maintaining) (its|the) (\\w+ )?instruments (in )?(walking|marching)"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "keep its instruments in march",
              juste: "keep its instruments running",
              test: "NASA aims to keep its instruments in march until the probe's 50th anniversary, in the summer of 2027; it remains to be seen whether it will last another three to five years, as its team hopes.",
              pourquoi: "« En marche » ne se calque pas : march désigne une marche à pied (un défilé) ou le mois de mars. Pour un appareil qui fonctionne, l'anglais emploie keep + complément + running, working, going.",
              regle: "Garder en marche : <b>keep sth running / working / going</b>. Mettre en marche : switch on, start.",
              ex: "Engineers kept the old computers running for decades.",
              exfr: "Les ingénieurs ont gardé les vieux ordinateurs en marche pendant des décennies.",
              carte: { fr: "garder qqch en marche", en: "to keep sth running" }
            }
          ]
        },
        {
          fr: "jusqu'aux 50 ans de la sonde,",
          en: "until the probe's 50th anniversary",
          pourquoi: "« Les 50 ans de la sonde » : the probe's 50th anniversary, génitif et ordinal (50th). Ou until the probe turns 50.",
          pts: 1,
          ok: [
            "(until|till|up to|up until|at least until|until at least|through|to) (the probe's|its|voyager's|voyager 1's|the spacecraft's|the) (50th|fiftieth) (anniversary|birthday)( of (the probe|the spacecraft|voyager( 1)?|its launch))?",
            "(until|till|up to|up until|at least until|until at least) (the probe|it|voyager( 1)?|the spacecraft) (turns|reaches|is|celebrates|marks|hits) (50|50 years old|its 50th (anniversary|birthday)|the age of 50|50 years since its launch|50 years in space)",
            "(until|till|up to|up until|at least until|until at least) (the )?50 years (after|since) (its|the probe's|the) launch",
            "(until|till|up to|at least until) (the |its )?50th (anniversary|birthday)( of the probe| of its launch)?"
          ],
          fautes: [
            {
              re: [
                "(until|till|up to) (the )?50 years (of|from) (the probe|it|voyager|the spacecraft)",
                "(the |its |probe's )50 (years )?(anniversary|birthday)"
              ],
              type: "gallicisme",
              pts: 0.5,
              faux: "until the 50 years of the probe",
              juste: "until the probe's 50th anniversary",
              test: "NASA aims to keep its instruments running until the 50 years of the probe, in the summer of 2027; it remains to be seen whether it will last another three to five years, as its team hopes.",
              pourquoi: "« Les 50 ans de la sonde » ne se dit pas « the 50 years of » : on fête un anniversaire, désigné par un nombre ordinal, 50th (fiftieth). Le possesseur se met au génitif : the probe's 50th anniversary. Ou, plus simplement : until the probe turns 50.",
              regle: "Anniversaire : <b>possesseur's + ordinal + anniversary / birthday</b> (the probe's 50th anniversary) ou <b>turn + âge</b> (until it turns 50).",
              ex: "The festival celebrated its 20th anniversary last year.",
              exfr: "Le festival a fêté ses 20 ans l'an dernier.",
              lecon: { n: 5, ancre: "genitif-saxon", titre: "Le génitif saxon" },
              carte: { fr: "les 50 ans de la sonde", en: "the probe's 50th anniversary" }
            },
            {
              re: ["(until|till) to\\b", "(until|till) at\\b"],
              type: "grammaire",
              pts: 0.25,
              faux: "until to the probe's 50th anniversary",
              juste: "until the probe's 50th anniversary",
              test: "NASA aims to keep its instruments running until to the probe's 50th anniversary, in the summer of 2027; it remains to be seen whether it will last another three to five years, as its team hopes.",
              pourquoi: "« Jusqu'à » se traduit par until (ou till), qui suffit seul : il n'est jamais suivi de to ni de at. On dit up to, mais pas until to.",
              regle: "Jusqu'à (dans le temps) : <b>until</b> + date ou événement (until 2027, until the end).",
              ex: "The museum is open until 6 p.m.",
              exfr: "Le musée est ouvert jusqu'à 18 heures.",
              carte: { fr: "jusqu'à", en: "until (sans to)" }
            }
          ]
        },
        {
          fr: "à l'été 2027 ;",
          en: "in the summer of 2027",
          pourquoi: "Une saison prend in : in the summer of 2027 (ou in summer 2027).",
          pts: 0.5,
          ok: ["(in|during|by|around|come) (the )?summer (of )?2027", "(which falls|which comes|due|expected|scheduled) in (the )?summer (of )?2027"],
          fautes: [
            {
              re: ["(at|on) (the )?summer (of )?2027", "(at|on) (the )?2027 summer"],
              type: "grammaire",
              pts: 0.5,
              faux: "at the summer of 2027",
              juste: "in the summer of 2027",
              test: "NASA aims to keep its instruments running until the probe's 50th anniversary, at the summer of 2027; it remains to be seen whether it will last another three to five years, as its team hopes.",
              pourquoi: "« À l'été » : le à français ne se traduit pas par at. Une saison est une période plus longue qu'un jour : in, comme pour un mois ou une année.",
              regle: "<b>In</b> + saison, mois, année (in the summer of 2027, in June, in 2027). <b>On</b> + jour. <b>At</b> + heure.",
              ex: "The probe will turn 50 in the summer of 2027.",
              exfr: "La sonde aura 50 ans à l'été 2027.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "à l'été 2027", en: "in the summer of 2027 (in + saison)" }
            },
            {
              re: ["summer (of the|from|in) 2027", "2027's summer"],
              type: "grammaire",
              pts: 0.25,
              faux: "the summer of the 2027",
              juste: "the summer of 2027",
              test: "NASA aims to keep its instruments running until the probe's 50th anniversary, in the summer of the 2027; it remains to be seen whether it will last another three to five years, as its team hopes.",
              pourquoi: "Une année ne prend pas d'article et se rattache à la saison par of : the summer of 2027, ou simplement summer 2027.",
              regle: "<b>The + saison + of + année</b> (the summer of 2027), sans article devant l'année.",
              ex: "The Olympics took place in the summer of 2024.",
              exfr: "Les Jeux olympiques ont eu lieu à l'été 2024.",
              carte: { fr: "l'été 2027", en: "the summer of 2027" }
            }
          ]
        },
        {
          fr: "reste à savoir si elle tiendra encore trois à cinq ans,",
          en: "it remains to be seen whether it will last another three to five years",
          pourquoi: "« Reste à savoir si » : it remains to be seen whether (ou if). « Tenir encore trois à cinq ans » : last another three to five years, avec will pour le futur.",
          pts: 1,
          ok: [
            "(but |and )?(it remains to be seen|it is yet to be seen|it has yet to be seen|it is unclear|it is not clear|it remains unclear|it is uncertain|it remains uncertain|nobody knows|no one knows|the question is|the open question is|the big question is|the question remains) (whether|if) (it|the probe|the spacecraft|voyager( 1)?) (will|can|could|would|is going to|might|is able to|will be able to|will manage to|can manage to) (still )?(last|survive|hold out|hold on|keep going|keep working|keep running|continue|carry on|function|operate|work|keep functioning|keep operating|endure|stay alive|go on|run|remain operational|remain active|continue to work|continue working|continue operating|continue to operate|continue to function|continue functioning|keep on working|keep on going|soldier on|hang on)( on)?( for)? ((another|a further|an additional|for another|for a further|for an additional) (3 to 5|3 or 5|between 3 and 5|3 or 4 or 5) years|(for )?(3 to 5|between 3 and 5) (more|further|additional|extra) years|(for )?(3 to 5) years (more|longer)|(for )?(3 to 5) years beyond that|beyond that for (3 to 5|another 3 to 5) years)",
            "(but |and )?(it remains to be seen|it is yet to be seen|it has yet to be seen|it is unclear|it is not clear|it remains unclear|it is uncertain|it remains uncertain|nobody knows|no one knows|the question is|the open question is|the big question is|the question remains) (whether|if) (it|the probe|the spacecraft|voyager( 1)?) (will|can|could|is going to) (still )?(be (working|operating|running|alive|operational|functioning|active|going)) (for )?((another|a further|an additional|for another|for a further|for an additional) (3 to 5|3 or 5|between 3 and 5|3 or 4 or 5) years|(for )?(3 to 5|between 3 and 5) (more|further|additional|extra) years|(for )?(3 to 5) years (more|longer)|(for )?(3 to 5) years beyond that|beyond that for (3 to 5|another 3 to 5) years)",
            "(but |and )?(whether|if) (it|the probe|the spacecraft|voyager( 1)?) (will|can) (still )?(last|survive|hold out|hold on|keep going|keep working|keep running|continue|carry on|function|operate|work|keep functioning|keep operating|endure|stay alive|go on|run|remain operational|remain active|continue to work|continue working|continue operating|continue to operate|continue to function|continue functioning|keep on working|keep on going|soldier on|hang on)( on)?( for)? ((another|a further|an additional|for another|for a further|for an additional) (3 to 5|3 or 5|between 3 and 5|3 or 4 or 5) years|(for )?(3 to 5|between 3 and 5) (more|further|additional|extra) years|(for )?(3 to 5) years (more|longer)|(for )?(3 to 5) years beyond that|beyond that for (3 to 5|another 3 to 5) years) remains to be seen"
          ],
          fautes: [
            {
              re: [
                "(rests|remain|stays|remains|rest|stay|it rests|there remains) to (know|knowing|be known)\\b",
                "remains to see\\b",
                "(rests|rest) to be seen"
              ],
              type: "gallicisme",
              pts: 1,
              faux: "it remains to know whether",
              juste: "it remains to be seen whether",
              test: "NASA aims to keep its instruments running until the probe's 50th anniversary, in the summer of 2027; it remains to know whether it will last another three to five years, as its team hopes.",
              pourquoi: "« Reste à savoir si » se calque mal : « it remains to know » n'a pas de sens en anglais. L'expression figée est passive : it remains to be seen whether (il reste à voir si).",
              regle: "Reste à savoir si : <b>it remains to be seen whether / if</b>. Ou <b>it is unclear whether</b>.",
              ex: "It remains to be seen whether the plan will work.",
              exfr: "Reste à savoir si le plan fonctionnera.",
              carte: { fr: "reste à savoir si", en: "it remains to be seen whether" }
            },
            {
              re: [
                "(last|survive|hold out|hold on|keep going|work|function|operate|run|hold|continue) again (for )?(3 to 5|3 or 5|another)",
                "3 to 5 (years )?again\\b",
                "(last|survive|hold out|keep going|work|function|operate|run|hold) still (for )?3 to 5"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "it will last again three to five years",
              juste: "it will last another three to five years",
              test: "NASA aims to keep its instruments running until the probe's 50th anniversary, in the summer of 2027; it remains to be seen whether it will last again three to five years, as its team hopes.",
              pourquoi: "« Encore » a deux sens. Pour une répétition (encore une fois), c'est again. Ici, il ajoute une durée : trois à cinq ans de plus, another three to five years ou three to five more years. Again ferait croire que la sonde recommence.",
              regle: "Encore (de plus) : <b>another</b> + nombre + nom (another three years) ou <b>nombre + more</b> (three more years). Encore (de nouveau) : again. Encore (toujours) : still.",
              ex: "The mission was extended for another two years.",
              exfr: "La mission a été prolongée de deux ans encore.",
              carte: { fr: "tenir encore trois à cinq ans", en: "to last another three to five years (again = de nouveau)" }
            },
            {
              re: [
                "(it|the probe|the spacecraft) will hold (another|for another|3|on another|again)\\b",
                "(it|the probe|the spacecraft) will (resist|tenir)\\b"
              ],
              type: "faux-sens",
              pts: 0.5,
              faux: "it will hold another three to five years",
              juste: "it will last another three to five years",
              test: "NASA aims to keep its instruments running until the probe's 50th anniversary, in the summer of 2027; it remains to be seen whether it will hold another three to five years, as its team hopes.",
              pourquoi: "« Tenir » au sens de durer, résister à l'usure, ne se dit pas hold seul (qui veut dire tenir dans la main, ou contenir). On dit last, hold out, keep going, survive.",
              regle: "Tenir (durer) : <b>to last</b>, <b>to hold out</b>, <b>to keep going</b>. Tenir (dans la main) : to hold.",
              ex: "The old bridge lasted for two centuries.",
              exfr: "Le vieux pont a tenu deux siècles.",
              carte: { fr: "tenir (durer)", en: "to last, to hold out (hold = tenir en main)" }
            }
          ]
        },
        {
          fr: "comme l'espère son équipe.",
          en: "as its team hopes",
          pourquoi: "« Comme » + sujet + verbe : as (as its team hopes), dans l'ordre sujet puis verbe. « Son équipe » : celle de la sonde, its team.",
          pts: 0.5,
          ok: [
            "as (its|the|the probe's|the mission's|voyager's|nasa's|their) (team|engineers|mission team|scientists|managers|team members|controllers|operators|mission managers|staff|experts|project team) (hope|hopes|hoped|would like|expect|expects|believe|believes|estimate|estimates|predict|predicts|think|thinks|anticipate|anticipates|is hoping|are hoping|reckon|reckons)( it will| it would| so)?",
            "(which|something|what) (its|the) (team|engineers|mission team|scientists|managers|team members|controllers|operators|mission managers|staff|experts|project team) (hope|hopes|hoped|expect|expects|is hoping|are hoping)( for)?",
            "(according to|in line with|as per) (its|the) (team|engineers|mission team|scientists|managers|team members|controllers|operators|mission managers|staff|experts|project team)('s|')? (hopes|expectations|estimates)",
            "as hoped (for )?by (its|the) (team|engineers|mission team|scientists|managers|team members|controllers|operators|mission managers|staff|experts|project team)",
            "(its|the) (team|engineers|mission team|scientists|managers|team members|controllers|operators|mission managers|staff|experts|project team) (hope|hopes|is hoping|are hoping)"
          ],
          fautes: [
            {
              re: [
                "like (its|the|his|her|their) (team|engineers|mission team|scientists|managers|team members|controllers|operators|mission managers|staff|experts|project team)"
              ],
              type: "grammaire",
              pts: 0.25,
              faux: "like its team hopes",
              juste: "as its team hopes",
              test: "NASA aims to keep its instruments running until the probe's 50th anniversary, in the summer of 2027; it remains to be seen whether it will last another three to five years, like its team hopes.",
              pourquoi: "« Comme » suivi d'un sujet et d'un verbe se traduit par as dans l'anglais soigné. Like est une préposition, qui se place devant un nom seul (like its twin) ; « like its team hopes » passe pour du langage relâché.",
              regle: "<b>As</b> + sujet + verbe (as its team hopes, as expected). <b>Like</b> + nom (like Voyager 2).",
              ex: "As the engineers feared, the signal was lost.",
              exfr: "Comme le craignaient les ingénieurs, le signal a été perdu.",
              carte: { fr: "comme l'espère son équipe", en: "as its team hopes (as + proposition)" }
            },
            {
              re: [
                "(as|like) (its|the|his|her|their) (team|engineers|mission team|scientists|managers|team members|controllers|operators|mission managers|staff|experts|project team) (wish|wishes|wished|wait|waits|awaits)\\b",
                "(his|her) (team|engineers|mission team|scientists|managers|team members|controllers|operators|mission managers|staff|experts|project team)"
              ],
              type: "faux-sens",
              pts: 0.25,
              faux: "as its team wishes",
              juste: "as its team hopes",
              test: "NASA aims to keep its instruments running until the probe's 50th anniversary, in the summer of 2027; it remains to be seen whether it will last another three to five years, as its team wishes.",
              pourquoi: "« Espérer » se dit to hope. « As its team wishes » veut dire « selon le bon vouloir de l'équipe », et to wait (attendre) est un faux ami d'espérer. Et l'équipe est celle de la sonde : its, ni his ni her.",
              regle: "Espérer : <b>to hope</b> (as its team hopes). Souhaiter : to wish. Attendre : to wait.",
              ex: "Scientists hope to hear from the probe again.",
              exfr: "Les scientifiques espèrent avoir à nouveau des nouvelles de la sonde.",
              carte: { fr: "espérer", en: "to hope (wish = souhaiter, wait = attendre)" }
            }
          ]
        }
      ]
    }
  ]
};
