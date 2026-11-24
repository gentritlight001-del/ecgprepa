/* Thème du jour d'anglais, 21 novembre 2026 (voir CLAUDE.md, « Thème du jour »).
   ((…)) = mot d'une carte du paquet d'anglais (cartes, dans l'ordre) ; [[…]] = mot nouveau (aides, dans l'ordre).
   Motifs `ok` et `re` : expressions régulières en minuscules, sans accents, nombres en chiffres, orthographe
   américaine, jamais de tiret (flashcards/theme-correcteur.js). Faits : Inpe et Amazon Conservation, cités dans
   actualites/monde/articles/bresil-deforestation-amazonie-plus-bas-2026.html. */
window.ECG_THEMES_DONNEES = window.ECG_THEMES_DONNEES || {};
window.ECG_THEMES_DONNEES["anglais/2026-11-21"] = {
  langue: "anglais",
  date: "2026-11-21",
  titre: "Amazonie : la forêt recule moins vite, mais le danger n'est pas écarté",
  phrases: [
    {
      fr: "((Selon)) les chiffres publiés le 16 octobre par l'Inpe, la déforestation en Amazonie brésilienne est tombée à son plus bas niveau [[depuis le début des mesures]], en 1988.",
      cartes: [{ id: "440a3bbc91", fr: "selon, d'après", en: "according to", re: "according to" }],
      aides: [{ fr: "depuis le début des mesures", en: "since records began" }],
      proposition: "According to figures released on 16 October by INPE, deforestation in the Brazilian Amazon fell to its lowest level since records began in 1988.",
      autres: ["According to data published by Brazil's space research institute on October 16, deforestation in the Brazilian Amazon has fallen to its lowest level since records began, in 1988."],
      tests: [
        "According to INPE figures published on October 16th, deforestation in the Brazilian Amazon dropped to its lowest level since records began in 1988.",
        "According to the figures that INPE released on 16 October, deforestation in the Brazilian Amazon has hit its lowest level since 1988, when measurements began."
      ],
      morceaux: [
        {
          fr: "Selon les chiffres publiés le 16 octobre par l'Inpe", en: "According to figures released on 16 October by INPE", pts: 1.5,
          pourquoi: "« Selon » introduit une source : according to. Une date précise prend on (on 16 October), et « publiés » se rend par un participe placé après le nom : figures released by INPE.",
          ok: [
            "according to (the )?(official )?(figures|data|statistics|numbers|estimates) (released|published|issued|made public|put out|unveiled) (on )(friday )?(october 16(th)?|16(th)? (of )?october|the 16(th)? of october) by (the )?(inpe|brazil's (national )?(institute for space research|space (research )?(agency|institute))|(the )?(brazilian )?national (institute for space research|space research institute))",
            "according to (the )?(official )?(figures|data|statistics|numbers|estimates) (released|published|issued|made public|put out|unveiled) by (the )?(inpe|brazil's (national )?(institute for space research|space (research )?(agency|institute))|(the )?(brazilian )?national (institute for space research|space research institute)) on (friday )?(october 16(th)?|16(th)? (of )?october|the 16(th)? of october)",
            "according to (the )?(inpe|brazil's (space (research )?(agency|institute)|national institute for space research))(s|'s)? (official )?(figures|data|statistics|numbers|estimates) (released|published|issued|made public|put out|unveiled) on (friday )?(october 16(th)?|16(th)? (of )?october|the 16(th)? of october)",
            "according to (the )?(figures|data|statistics|numbers|estimates) (that |which )?(the )?(inpe|brazil's space (research )?(agency|institute)) (released|published|issued|made public|put out|unveiled) on (friday )?(october 16(th)?|16(th)? (of )?october|the 16(th)? of october)"
          ],
          fautes: [
            {
              re: ["accordingly to"],
              type: "barbarisme", pts: 0.5, faux: "accordingly to", juste: "according to",
              test: "Accordingly to figures released on 16 October by INPE, deforestation in the Brazilian Amazon fell to its lowest level since records began in 1988.",
              pourquoi: "« Accordingly » est un adverbe qui veut dire « en conséquence, de façon appropriée » (act accordingly). Il ne sert jamais à citer une source. « Selon » se dit according to, toujours avec to.",
              regle: "Selon, d'après : <b>according to</b> + source (according to the UN). Accordingly : en conséquence.",
              ex: "According to the report, prices will rise. We must act accordingly.", exfr: "Selon le rapport, les prix vont augmenter. Nous devons agir en conséquence.",
              carte: { fr: "selon, d'après", en: "according to (accordingly = en conséquence)" }
            },
            {
              re: ["(released|published|issued|made public|put out) (the )?(16(th)? (of )?october|october 16(th)?)"],
              type: "grammaire", pts: 0.5, faux: "published the 16 October", juste: "published on 16 October",
              test: "According to figures published the 16 October by INPE, deforestation in the Brazilian Amazon fell to its lowest level since records began in 1988.",
              pourquoi: "Le français dit « le 16 octobre » sans préposition. En anglais, une date précise (un jour) est toujours introduite par <b>on</b> : sans elle, la date flotte dans la phrase et le lecteur bute dessus.",
              regle: "<b>On</b> + jour ou date (on Monday, on 16 October, on Christmas Day). <b>In</b> + mois, année, saison (in October, in 1988). <b>At</b> + heure (at noon).",
              ex: "The report was published on 3 March.", exfr: "Le rapport a été publié le 3 mars.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le 16 octobre (date)", en: "on 16 October (on + jour)" }
            },
            {
              re: ["(released|published|issued|made public|put out) (in|at) (the )?(16(th)? (of )?october|october 16(th)?)"],
              type: "grammaire", pts: 0.5, faux: "published in 16 October", juste: "published on 16 October",
              test: "According to figures published in October 16 by INPE, deforestation in the Brazilian Amazon fell to its lowest level since records began in 1988.",
              pourquoi: "« In » s'emploie pour un mois ou une année entière (in October, in 1988). Dès qu'on précise le jour, on change de préposition : c'est un point précis du calendrier.",
              regle: "<b>On</b> + jour ou date (on 16 October). <b>In</b> + mois, année, saison. <b>At</b> + heure.",
              ex: "She was born in May, on 12 May.", exfr: "Elle est née en mai, le 12 mai.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le 16 octobre (date)", en: "on 16 October (on + jour)" }
            },
            {
              re: ["following (the )?(figures|data|statistics|numbers) (released|published|issued)"],
              type: "faux-sens", pts: 0.5, faux: "following the figures", juste: "according to the figures",
              test: "Following the figures published on 16 October by INPE, deforestation in the Brazilian Amazon fell to its lowest level since records began in 1988.",
              pourquoi: "« Following » veut dire « à la suite de, après ». « Following the figures… » se comprend donc « après la publication des chiffres, la déforestation est tombée » : on fait de la publication la cause de la baisse. « Selon » sert à citer une source.",
              regle: "Citer une source : <b>according to</b> (according to the UN, according to figures released…). Following = après, à la suite de.",
              ex: "According to the police, the march was peaceful.", exfr: "Selon la police, la marche a été pacifique.",
              carte: { fr: "selon, d'après (une source)", en: "according to (following = après)" }
            }
          ]
        },
        {
          fr: "la déforestation en Amazonie brésilienne", en: "deforestation in the Brazilian Amazon", pts: 1,
          pourquoi: "« La déforestation » est prise au sens général : pas d'article en anglais. L'Amazonie, comme les grands fleuves et les grandes forêts, prend the, et l'adjectif se place devant le nom : the Brazilian Amazon.",
          ok: [
            "(the )?deforestation (in|of) the brazilian (amazon|amazonia)( rainforest| forest| region| basin)?",
            "(the )?deforestation (in|of) (brazilian )?amazonia",
            "(the )?deforestation (in|of) the amazon( rainforest)? in brazil",
            "(the )?(brazilian amazon|amazon)'s deforestation",
            "(the )?deforestation (in|of) brazil's (amazon|amazon rainforest|rainforest|part of the amazon)",
            "(the )?brazilian amazon deforestation",
            "deforestation rates? in the brazilian amazon"
          ],
          fautes: [
            {
              re: ["(in|of) brazilian amazon( rainforest| forest)?"],
              type: "grammaire", pts: 0.5, faux: "in Brazilian Amazon", juste: "in the Brazilian Amazon",
              test: "According to figures released on 16 October by INPE, deforestation in Brazilian Amazon fell to its lowest level since records began in 1988.",
              pourquoi: "La plupart des noms propres géographiques se passent d'article (Brazil, Asia), mais pas les fleuves, les océans et les grandes régions qui portent leur nom : l'Amazone et l'Amazonie, c'est « the Amazon », même avec un adjectif devant.",
              regle: "<b>The</b> devant les fleuves, mers, océans, chaînes de montagnes et grandes forêts : the Amazon, the Atlantic, the Alps, the Sahara. Pas d'article devant un pays (Brazil) ou un continent (Asia).",
              ex: "The Amazon crosses nine countries.", exfr: "L'Amazonie s'étend sur neuf pays.",
              lecon: { n: 4, ancre: "the", titre: "The : l'article défini" },
              carte: { fr: "l'Amazonie, l'Amazone", en: "the Amazon (avec the)" }
            },
            {
              re: ["the (amazon|amazonia) brazilian", "the amazonian brazilian"],
              type: "grammaire", pts: 0.5, faux: "the Amazon Brazilian", juste: "the Brazilian Amazon",
              test: "According to figures released on 16 October by INPE, deforestation in the Amazon Brazilian fell to its lowest level since records began in 1988.",
              pourquoi: "En anglais, l'adjectif se place devant le nom, jamais après comme souvent en français. « The Amazon Brazilian » se lit comme « l'Amazonien brésilien », une personne.",
              regle: "Adjectif épithète <b>avant le nom</b> : the Brazilian Amazon, a French company, a long debate.",
              ex: "The British government announced new measures.", exfr: "Le gouvernement britannique a annoncé de nouvelles mesures.",
              lecon: { n: 8, ancre: "adjectif-position", titre: "La place de l'adjectif épithète" },
              carte: { fr: "l'Amazonie brésilienne", en: "the Brazilian Amazon (adjectif devant)" }
            }
          ]
        },
        {
          fr: "est tombée à son plus bas niveau", en: "fell to its lowest level", pts: 1,
          pourquoi: "Le fait est daté et terminé (le chiffre publié en octobre) : prétérit, fell (fall, fell, fallen). « Son plus bas niveau » est le superlatif de low, un adjectif court : its lowest level, avec its car la déforestation est une chose.",
          ok: [
            "(fell|dropped|declined|plunged|plummeted|sank|slumped|decreased|has fallen|has dropped|has declined|has plunged|has sunk|has decreased) to (its |a )?(lowest|record low|all time low)( level| point| rate| figure)?",
            "(hit|reached|has hit|has reached|was at|is at|stood at|stands at) (its |a )?(lowest( level| point| rate)?|record low|all time low)"
          ],
          fautes: [
            {
              re: ["(fell|dropped|felt|has fallen|has dropped|is fallen) (to|at) (its |her )?(most low|more low|lower)( level)?"],
              type: "grammaire", pts: 0.5, faux: "its most low level", juste: "its lowest level",
              test: "According to figures released on 16 October by INPE, deforestation in the Brazilian Amazon fell to its most low level since records began in 1988.",
              pourquoi: "« Low » est un adjectif court (une syllabe) : son superlatif se forme avec -est, pas avec most. « Most low » est une faute que le correcteur repère immédiatement.",
              regle: "Adjectif court : <b>-est</b> (low, the lowest ; high, the highest). Adjectif long : <b>the most</b> (the most important). Le comparatif suit la même logique : lower, more important.",
              ex: "Unemployment is at its lowest level in ten years.", exfr: "Le chômage est à son plus bas niveau depuis dix ans.",
              lecon: { n: 22, ancre: "superlatif", titre: "The -est, the most : le superlatif" },
              carte: { fr: "son plus bas niveau", en: "its lowest level" }
            },
            {
              re: ["felt (to|at) (its )?(lowest|most low)", "has fell (to|at)", "is fallen (to|at)", "has felt (to|at)"],
              type: "barbarisme", pts: 0.5, faux: "felt to its lowest level", juste: "fell to its lowest level",
              test: "According to figures released on 16 October by INPE, deforestation in the Brazilian Amazon felt to its lowest level since records began in 1988.",
              pourquoi: "Deux verbes irréguliers se ressemblent : fall (tomber) fait fell au prétérit et fallen au participe ; feel (ressentir) fait felt. « Felt to its lowest level » veut dire « a ressenti son plus bas niveau ».",
              regle: "<b>Fall, fell, fallen</b> : tomber. <b>Feel, felt, felt</b> : ressentir. Au present perfect : has fallen (jamais has fell).",
              ex: "Prices fell sharply last year and have fallen again this year.", exfr: "Les prix ont fortement baissé l'an dernier et ont encore baissé cette année.",
              lecon: { n: 12, ancre: "table", titre: "Liste des verbes irréguliers" },
              carte: { fr: "tomber (fall)", en: "fall, fell, fallen (feel, felt, felt = ressentir)" }
            }
          ]
        },
        {
          fr: "depuis le début des mesures, en 1988", en: "since records began in 1988", pts: 0.5,
          pourquoi: "Pour une série statistique, « depuis le début des mesures » se dit since records began : since donne le point de départ, et records désigne les relevés (measures veut dire des décisions).",
          ok: [
            "since (records|record keeping|records were first kept|measurements|monitoring|satellite monitoring|data collection|tracking|measuring|official records) (began|started|first began|were first taken)( in 1988)?",
            "since (the )?(start|beginning) of (records|record keeping|measurements|monitoring|satellite monitoring|tracking|the records|the measurements|data collection)( in 1988)?",
            "since 1988,? when (records|measurements|monitoring|satellite monitoring|tracking|data collection) (began|started)",
            "since (records|measurements|monitoring) began,? in 1988",
            "since 1988"
          ],
          fautes: [
            {
              re: ["since (the )?(start|beginning) of (the )?measures", "since (the )?measures (began|started)"],
              type: "faux-sens", pts: 0.25, faux: "since measures began", juste: "since records began",
              test: "According to figures released on 16 October by INPE, deforestation in the Brazilian Amazon fell to its lowest level since the beginning of the measures, in 1988.",
              pourquoi: "En anglais, « a measure » est une mesure au sens de décision politique (new measures against fraud). Une mesure au sens de relevé chiffré, c'est a measurement, et pour une série statistique on dit « since records began ».",
              regle: "Mesure = décision : <b>a measure</b>. Mesure = relevé : <b>a measurement</b>. « Depuis le début des relevés » : <b>since records began</b>.",
              ex: "It was the hottest summer since records began.", exfr: "Ce fut l'été le plus chaud depuis le début des relevés.",
              carte: { fr: "depuis le début des relevés", en: "since records began" }
            },
            {
              re: ["for 1988"],
              type: "grammaire", pts: 0.5, faux: "for 1988", juste: "since 1988",
              test: "According to figures released on 16 October by INPE, deforestation in the Brazilian Amazon fell to its lowest level for 1988.",
              pourquoi: "1988 est un point de départ, pas une durée. Avec for, l'anglais attend une durée (for 38 years) ; avec une date de départ, il faut since.",
              regle: "<b>Since</b> + point de départ (since 1988, since Monday). <b>For</b> + durée (for 38 years, for two weeks).",
              ex: "She has worked here since 2019, for six years.", exfr: "Elle travaille ici depuis 2019, depuis six ans.",
              lecon: { n: 15, ancre: "vue-ensemble", titre: "Since et for : le principe" },
              carte: { fr: "depuis 1988 / depuis 38 ans", en: "since 1988 / for 38 years" }
            }
          ]
        }
      ]
    },
    {
      fr: "La baisse dure depuis 2022, ((pourtant)) ce chiffre ne dit rien des forêts [[abîmées]] par le feu et la [[sécheresse]].",
      cartes: [{ id: "b828465044", fr: "pourtant, cependant", en: "yet", re: "yet" }],
      aides: [{ fr: "abîmer, dégrader", en: "to damage, to degrade" }, { fr: "la sécheresse", en: "drought" }],
      proposition: "The decline has been going on since 2022, yet this figure says nothing about forests damaged by fire and drought.",
      autres: ["Deforestation has been falling since 2022, but the figure tells us nothing about forests degraded by fires and drought."],
      tests: [
        "Since 2022, deforestation has kept falling, yet this figure does not say anything about forests damaged by fires and droughts.",
        "The fall has continued since 2022; however, the figure doesn't take into account forests degraded by fire and drought."
      ],
      morceaux: [
        {
          fr: "La baisse dure depuis 2022", en: "The decline has been going on since 2022", pts: 2,
          pourquoi: "La baisse a commencé en 2022 et continue aujourd'hui : avec since, l'anglais exige le present perfect, ici en -ing pour insister sur la durée (has been going on). Le présent du français ne se traduit jamais par un présent anglais avec since.",
          ok: [
            "(the )?(decline|decrease|fall|drop|downward trend|downturn|reduction) has been (going on|continuing|under way|underway|ongoing|lasting|happening) since 2022",
            "(the )?(decline|decrease|fall|drop|downward trend|downturn|reduction) has (continued|lasted|persisted|gone on) since 2022",
            "(deforestation|it) has been (falling|declining|decreasing|dropping|going down|shrinking) (steadily |every year |each year |year after year |continuously )?since 2022",
            "(deforestation|it) has (fallen|declined|decreased|dropped|gone down|kept falling|kept declining|kept decreasing|continued to fall|continued to decline|continued falling) (steadily |every year |each year |year after year )?since 2022",
            "since 2022,? (the )?(decline|decrease|fall|drop|deforestation|it) has (been )?(falling|fallen|declining|declined|decreasing|decreased|continued|going on|gone on|lasted|kept falling|kept declining)",
            "(the )?(decline|decrease|fall|drop) (began|started) in 2022 and (has continued|has gone on|continues|is continuing|has not stopped since)"
          ],
          fautes: [
            {
              re: [
                "(decline|decrease|fall|drop|reduction|downturn|it|deforestation) (lasts|continues|is lasting|is continuing|goes on|is going on|falls|is falling|decreases|is decreasing|declines|is declining|drops|is dropping) since 2022",
                "since 2022,? (the )?(decline|decrease|fall|drop|deforestation|it|reduction) (lasts|continues|is lasting|is continuing|goes on|is going on|falls|is falling|decreases|is decreasing|declines|is declining)"
              ],
              type: "grammaire", pts: 1.5, faux: "the decline lasts since 2022", juste: "the decline has been going on since 2022",
              test: "The decline lasts since 2022, yet this figure says nothing about forests damaged by fire and drought.",
              pourquoi: "Le français met le présent avec « depuis » (la baisse dure depuis 2022). L'anglais voit les choses autrement : une action commencée en 2022 et qui dure encore relie le passé au présent, et ce lien a son temps, le present perfect. Avec un présent simple ou en -ing, la phrase anglaise est fausse : c'est la faute la plus sanctionnée en thème.",
              regle: "Action commencée dans le passé et qui dure encore + <b>since / for</b> : <b>present perfect</b> (has continued) ou <b>present perfect en -ing</b> pour insister sur la durée (has been going on, has been falling). Jamais de présent simple avec since.",
              ex: "Prices have been rising since January.", exfr: "Les prix augmentent depuis janvier.",
              lecon: { n: 15, ancre: "temps-verbaux", titre: "Since et for : les temps verbaux" },
              carte: { fr: "la baisse dure depuis 2022", en: "the decline has been going on since 2022 (present perfect)" }
            },
            {
              re: ["(the )?(decline|decrease|fall|drop|reduction|deforestation|it) (lasted|continued|went on|fell|declined|decreased|dropped) since 2022"],
              type: "grammaire", pts: 1, faux: "the decline lasted since 2022", juste: "the decline has been going on since 2022",
              test: "The decline lasted since 2022, yet this figure says nothing about forests damaged by fire and drought.",
              pourquoi: "Le prétérit présente l'action comme terminée et coupée du présent. Or la baisse continue aujourd'hui : avec since, l'anglais exige un temps qui relie le passé au présent.",
              regle: "Avec <b>since</b> + date, le verbe principal est au <b>present perfect</b> (simple ou en -ing) quand l'action dure encore.",
              ex: "Deforestation has fallen every year since 2022.", exfr: "La déforestation recule chaque année depuis 2022.",
              lecon: { n: 15, ancre: "temps-verbaux", titre: "Since et for : les temps verbaux" },
              carte: { fr: "dure depuis (encore aujourd'hui)", en: "has been going on since (present perfect)" }
            },
            {
              re: ["(lasted|lasting|lasts|continued|continues|going on|falling|fallen|declined|declining) for 2022"],
              type: "grammaire", pts: 1, faux: "for 2022", juste: "since 2022",
              test: "The decline has been going on for 2022, yet this figure says nothing about forests damaged by fire and drought.",
              pourquoi: "2022 est un point de départ. For s'emploie avec une durée (for four years) : « for 2022 » se comprend « pour 2022 », comme s'il s'agissait seulement de l'année 2022.",
              regle: "<b>Since</b> + point de départ (since 2022) ; <b>for</b> + durée (for four years).",
              ex: "They have been married since 2015, for ten years.", exfr: "Ils sont mariés depuis 2015, depuis dix ans.",
              lecon: { n: 15, ancre: "vue-ensemble", titre: "Since et for : le principe" },
              carte: { fr: "depuis 2022 / depuis quatre ans", en: "since 2022 / for four years" }
            }
          ]
        },
        {
          fr: "pourtant ce chiffre ne dit rien des forêts", en: "yet this figure says nothing about forests", pts: 1,
          pourquoi: "« Pourtant » oppose deux idées : yet, ou but. « Ne dit rien de » se dit says nothing about, avec une seule négation (nothing).",
          ok: [
            "(but|yet|however|though|still|nevertheless|and yet) (this|the|that) (figure|number|statistic|data|estimate|indicator|measure|count) (says|tells|tells us|reveals|shows|indicates|reports) nothing (about|of|on|regarding) (the )?(state of (the )?)?forests?",
            "(but|yet|however|though|still|nevertheless|and yet) (this|the|that) (figure|number|statistic|estimate|indicator|count) (does not|did not) (say|tell|tell us|reveal|show|measure|capture|include|count|cover|take into account|account for|reflect|consider) (anything |a thing )?(about |of )?(the )?(state of (the )?)?forests?",
            "(but|yet|however|though|still|nevertheless|and yet) (this|the|that) (figure|number|statistic|estimate|indicator|count) (ignores|leaves out|excludes|overlooks|omits|does not cover|misses|is silent on) (the )?forests?"
          ],
          fautes: [
            {
              re: ["(does not|did not) (say|tell( us)?|show|reveal) nothing"],
              type: "grammaire", pts: 0.5, faux: "doesn't say nothing", juste: "says nothing / doesn't say anything",
              test: "The decline has been going on since 2022, yet this figure doesn't say nothing about forests damaged by fire and drought.",
              pourquoi: "Le français a besoin de deux mots pour nier (ne… rien). L'anglais standard n'en veut qu'un : « doesn't say nothing » contient deux négations qui s'annulent, et se lit « il ne dit pas rien », donc « il dit quelque chose ».",
              regle: "Une seule négation : <b>says nothing</b> (verbe affirmatif + nothing) ou <b>does not say anything</b> (not + anything). De même : nobody / not anybody, never / not ever.",
              ex: "The minister said nothing. / The minister didn't say anything.", exfr: "Le ministre n'a rien dit.",
              lecon: { n: 3, ancre: "indefinis", titre: "Pronoms indéfinis : nothing, anything" },
              carte: { fr: "ne dire rien", en: "say nothing / not say anything" }
            },
            {
              re: ["(figure|number|statistic|estimate) (says|tells|shows) anything"],
              type: "contresens", pts: 1, faux: "the figure says anything", juste: "the figure says nothing",
              test: "The decline has been going on since 2022, yet this figure says anything about forests damaged by fire and drought.",
              pourquoi: "Sans négation, « anything » veut dire « n'importe quoi ». « The figure says anything about forests » signifie donc que le chiffre dit n'importe quoi : c'est le contraire de la phrase française.",
              regle: "« Ne… rien » : <b>nothing</b> avec un verbe affirmatif, ou <b>not… anything</b>. Anything seul, dans une phrase affirmative : n'importe quoi.",
              ex: "He says nothing. / He'll say anything to win.", exfr: "Il ne dit rien. / Il dira n'importe quoi pour gagner.",
              lecon: { n: 3, ancre: "indefinis", titre: "Pronoms indéfinis : nothing, anything" },
              carte: { fr: "ne… rien / n'importe quoi", en: "nothing, not… anything / anything" }
            }
          ]
        },
        {
          fr: "abîmées par le feu et la sécheresse", en: "damaged by fire and drought", pts: 1,
          pourquoi: "Le participe passé damaged suit directement le nom, comme « abîmées » en français. Fire et drought sont pris au sens général, donc sans article, et « par » se dit by.",
          ok: [
            "(damaged|degraded|harmed|ravaged|weakened|scarred|destroyed|hit|affected|devastated|eroded|depleted) by (fires?|wildfires|blazes|burning|forest fires) and (droughts?|dry spells)",
            "(fires?|wildfires|blazes) and (droughts?|dry spells) (have )?(damaged|degraded|harmed|ravaged|weakened|scarred|destroyed|hit|affected)"
          ],
          fautes: [
            {
              re: ["by the (fires?|wildfires) and (the )?droughts?", "by (fires?|wildfires) and the droughts?"],
              type: "grammaire", pts: 0.5, faux: "by the fire and the drought", juste: "by fire and drought",
              test: "The decline has been going on since 2022, yet this figure says nothing about forests damaged by the fire and the drought.",
              pourquoi: "Le feu et la sécheresse sont pris ici au sens général : le phénomène, pas un incendie ou une sécheresse précis. En anglais, un nom pris au sens général ne prend pas d'article. « By the fire » ferait penser à un incendie particulier, déjà mentionné.",
              regle: "Nom au sens général : <b>pas d'article</b> (fire, drought, inflation, unemployment). <b>The</b> seulement pour une chose précise, déjà identifiée (the fire that broke out in August).",
              ex: "Drought is a growing threat to farmers.", exfr: "La sécheresse est une menace croissante pour les agriculteurs.",
              lecon: { n: 4, ancre: "zero-article", titre: "Le zéro article" },
              carte: { fr: "le feu, la sécheresse (sens général)", en: "fire, drought (sans article)" }
            },
            {
              re: ["(fires?|wildfires) and (the )?(dryness|aridity|dry weather)"],
              type: "faux-sens", pts: 0.5, faux: "dryness", juste: "drought",
              test: "The decline has been going on since 2022, yet this figure says nothing about forests damaged by fire and dryness.",
              pourquoi: "« Dryness » décrit l'état de ce qui est sec (la sécheresse de la peau, d'un vin). Une période sans pluie qui frappe une région, c'est une sécheresse au sens climatique : drought.",
              regle: "Sécheresse (épisode climatique) : <b>a drought</b> (prononcer « draout »). Sécheresse (qualité de ce qui est sec) : dryness.",
              ex: "The region is facing its worst drought in decades.", exfr: "La région connaît sa pire sécheresse depuis des décennies.",
              carte: { fr: "une sécheresse (climat)", en: "a drought" }
            },
            {
              re: ["(spoiled|spoilt|abimed|abimated|abimated) by"],
              type: "faux-sens", pts: 0.5, faux: "spoiled by fire", juste: "damaged by fire",
              test: "The decline has been going on since 2022, yet this figure says nothing about forests spoiled by fire and drought.",
              pourquoi: "« To spoil » veut dire gâcher (spoil a party) ou gâter (un enfant, de la nourriture qui se gâte). Pour une forêt touchée par le feu, on parle de dégâts : damaged, degraded.",
              regle: "Abîmer, endommager : <b>to damage</b> (damaged forests). Dégrader un milieu naturel : <b>to degrade</b>. To spoil : gâcher, gâter.",
              ex: "The storm damaged hundreds of homes.", exfr: "La tempête a abîmé des centaines de maisons.",
              carte: { fr: "abîmer, endommager", en: "to damage (spoil = gâcher)" }
            }
          ]
        }
      ]
    },
    {
      fr: "Des scientifiques ((estiment)) que si la forêt perdait 20 à 25 % de sa [[surface]], elle ne produirait plus assez de pluie, ce qui ((menacerait)) toute la région.",
      cartes: [
        { id: "3c60232891", fr: "estimer", en: "to estimate", re: "estimat(e|es|ed)" },
        { id: "7cf7050d17", fr: "menacer, mettre en danger", en: "to put at risk", re: "(put|putting|puts)( \\w+){0,4} at risk" }
      ],
      aides: [{ fr: "la surface (d'une forêt, d'un pays)", en: "the area" }],
      proposition: "Scientists estimate that if the forest lost 20 to 25% of its area, it would no longer produce enough rain, which would put the whole region at risk.",
      autres: ["According to some scientists, if the forest were to lose 20 to 25% of its area, it would stop producing enough rain, putting the entire region at risk."],
      tests: [
        "Some researchers estimate that if the forest lost between 20 and 25% of its surface, it would no longer generate enough rainfall, which would put the entire region at risk.",
        "Scientists believe that if the Amazon were to lose 20 to 25 percent of its area, it could stop producing enough rain, which would threaten the whole region."
      ],
      morceaux: [
        {
          fr: "Des scientifiques estiment que", en: "Scientists estimate that", pts: 0.5,
          pourquoi: "« Des scientifiques » au sens général : pluriel sans article (scientists). To estimate that s'emploie comme « estimer que ».",
          ok: [
            "(some |many |several )?(scientists|researchers|experts|climate scientists) (estimate|believe|think|reckon|consider|argue|warn|calculate|say|fear|suggest)",
            "according to (some |many )?(scientists|researchers|experts)"
          ],
          fautes: [
            {
              re: ["scientifics"],
              type: "barbarisme", pts: 0.5, faux: "scientifics", juste: "scientists",
              test: "Scientifics estimate that if the forest lost 20 to 25% of its area, it would no longer produce enough rain, which would put the whole region at risk.",
              pourquoi: "« Scientific » est un adjectif (a scientific study). Il ne devient pas un nom et ne prend jamais de s. La personne, c'est a scientist.",
              regle: "Adjectif : <b>scientific</b>. Nom (la personne) : <b>a scientist</b>, des scientifiques : scientists. Même piège : economic / an economist.",
              ex: "Scientists published a scientific report.", exfr: "Des scientifiques ont publié un rapport scientifique.",
              carte: { fr: "un scientifique", en: "a scientist (scientific = adjectif)" }
            },
            {
              re: ["the (scientists|researchers|experts) (estimate|believe|think|reckon|consider)"],
              type: "grammaire", pts: 0.25, faux: "the scientists estimate", juste: "scientists estimate",
              test: "The scientists estimate that if the forest lost 20 to 25% of its area, it would no longer produce enough rain, which would put the whole region at risk.",
              pourquoi: "« Des scientifiques » désigne des scientifiques en général, sans dire lesquels. « The scientists » renvoie à des scientifiques précis, déjà présentés au lecteur : le sens change.",
              regle: "Pluriel indéfini (« des ») : <b>pas d'article</b> ou some (scientists, some scientists). The = des personnes déjà identifiées.",
              ex: "Experts warn that the risk is real.", exfr: "Des experts préviennent que le risque est réel.",
              lecon: { n: 4, ancre: "zero-article", titre: "Le zéro article" },
              carte: { fr: "des scientifiques (en général)", en: "scientists (sans article)" }
            }
          ]
        },
        {
          fr: "si la forêt perdait 20 à 25 % de sa surface", en: "if the forest lost 20 to 25% of its area", pts: 1.5,
          pourquoi: "Hypothèse sur l'avenir (si + imparfait en français) : if + prétérit en anglais, if the forest lost, jamais would juste après if. Le pourcentage s'écrit 20 to 25%, et la surface d'une chose se dit its area.",
          ok: [
            "if (the )?(forest|amazon|rainforest|amazon rainforest|amazon forest) (lost|were to lose|was to lose) (between )?20 (percent )?(to |and )?25 percent of its (area|surface|surface area|size|cover|extent|trees|forest cover|forest)",
            "(a|the) (loss|disappearance|destruction) of (between )?20 (percent )?(to |and )?25 percent of (its|the forest's|the forest|the amazon's|the amazon) (area|surface|cover|trees|forest cover|size|surface area)?",
            "(should|were) (the )?(forest|amazon|rainforest|amazon rainforest) (lose|to lose) (between )?20 (percent )?(to |and )?25 percent of its (area|surface|surface area|size|cover|extent|trees|forest cover|forest)"
          ],
          fautes: [
            {
              re: ["if (the )?(forest|amazon|rainforest) would (lose|lost)"],
              type: "grammaire", pts: 1, faux: "if the forest would lose", juste: "if the forest lost",
              test: "Scientists estimate that if the forest would lose 20 to 25% of its area, it would no longer produce enough rain, which would put the whole region at risk.",
              pourquoi: "Le français met un imparfait après « si » (si la forêt perdait) et un conditionnel dans l'autre moitié de la phrase. L'anglais suit le même schéma : jamais de would juste après if. « If it would lose » est une faute de construction très sanctionnée.",
              regle: "Hypothèse sur le présent ou l'avenir (type 2) : <b>if + prétérit</b>, puis <b>would + base verbale</b> (if the forest lost…, it would…). Pour une hypothèse plus lointaine : if it were to lose.",
              ex: "If prices rose again, households would cut spending.", exfr: "Si les prix augmentaient encore, les ménages réduiraient leurs dépenses.",
              lecon: { n: 21, ancre: "type-two", titre: "Type 2 : l'hypothèse irréelle au présent" },
              carte: { fr: "si la forêt perdait…, elle produirait…", en: "if the forest lost…, it would produce… (jamais would après if)" }
            },
            {
              re: ["if (the )?(forest|amazon|rainforest) (loses|will lose|is losing)"],
              type: "grammaire", pts: 0.5, faux: "if the forest loses", juste: "if the forest lost",
              test: "Scientists estimate that if the forest loses 20 to 25% of its area, it would no longer produce enough rain, which would put the whole region at risk.",
              pourquoi: "Avec le présent (if it loses), l'hypothèse devient une condition réelle, presque certaine. La phrase française, à l'imparfait, présente au contraire une situation envisagée, pas encore réelle. Et la suite au conditionnel (it would) ne colle plus.",
              regle: "Hypothèse imaginée : <b>if + prétérit</b> + would. Condition réaliste : if + présent + will (if it rains, we will stay home). Les deux schémas ne se mélangent pas.",
              ex: "If I had more time, I would read more.", exfr: "Si j'avais plus de temps, je lirais davantage.",
              lecon: { n: 21, ancre: "type-two", titre: "Type 2 : l'hypothèse irréelle au présent" },
              carte: { fr: "si + imparfait", en: "if + prétérit (lost, had, were)" }
            },
            {
              re: ["if (the )?(forest|amazon|rainforest) (was|were) losing"],
              type: "grammaire", pts: 0.25, faux: "if the forest was losing", juste: "if the forest lost",
              test: "Scientists estimate that if the forest was losing 20 to 25% of its area, it would no longer produce enough rain, which would put the whole region at risk.",
              pourquoi: "La forme en -ing décrit une action en train de se dérouler. Ici, on imagine un résultat (une forêt qui aurait perdu 20 à 25 % de sa surface), pas un processus en cours : le prétérit simple suffit et sonne plus juste.",
              regle: "Hypothèse sur un fait : <b>if + prétérit simple</b> (if the forest lost). La forme en -ing seulement pour une action en cours (if it was raining right now).",
              ex: "If the company lost this contract, it would close.", exfr: "Si l'entreprise perdait ce contrat, elle fermerait.",
              lecon: { n: 21, ancre: "type-two", titre: "Type 2 : l'hypothèse irréelle au présent" },
              carte: { fr: "si la forêt perdait", en: "if the forest lost (prétérit simple)" }
            },
            {
              re: ["of her (area|surface|size|cover|forest)"],
              type: "grammaire", pts: 0.5, faux: "of her surface", juste: "of its area",
              test: "Scientists estimate that if the forest lost 20 to 25% of her area, it would no longer produce enough rain, which would put the whole region at risk.",
              pourquoi: "En français, la forêt est féminine. En anglais, les choses n'ont pas de genre : la forêt, c'est it, et son possessif est its. « Her » ne s'emploie que pour une femme (ou un navire, dans un style ancien).",
              regle: "Chose ou animal non familier : <b>it / its</b>. Personne : he / his, she / her. Attention : <b>its</b> (possessif) sans apostrophe, it's = it is.",
              ex: "The company raised its prices.", exfr: "L'entreprise a augmenté ses prix.",
              lecon: { n: 3, ancre: "possessifs", titre: "Adjectifs et pronoms possessifs" },
              carte: { fr: "sa surface (de la forêt)", en: "its area (its pour une chose)" }
            }
          ]
        },
        {
          fr: "elle ne produirait plus assez de pluie", en: "it would no longer produce enough rain", pts: 1,
          pourquoi: "Conséquence de l'hypothèse : would + base verbale (it would). « Ne… plus » dans le temps se dit no longer, placé devant le verbe, et « assez de pluie » se dit enough rain, sans of.",
          ok: [
            "(it|the forest|the amazon) (would|could|might) no longer (produce|generate|create|make|release|bring|provide) enough (rain|rainfall|precipitation)",
            "(it|the forest|the amazon) (would|could|might) (stop|cease) (producing|generating|making|creating|providing|to produce|to generate) enough (rain|rainfall|precipitation)",
            "(it|the forest|the amazon) (would|could|might) not (produce|generate|make|create|provide) enough (rain|rainfall|precipitation) (any ?more|any longer)",
            "(it|the forest|the amazon) (would|could|might) (be unable|no longer be able|not be able) to (produce|generate|make|provide) enough (rain|rainfall|precipitation)"
          ],
          fautes: [
            {
              re: ["(would|could|might) (no more|not more) (produce|generate|make|create|provide)"],
              type: "grammaire", pts: 0.5, faux: "would no more produce", juste: "would no longer produce",
              test: "Scientists estimate that if the forest lost 20 to 25% of its area, it would no more produce enough rain, which would put the whole region at risk.",
              pourquoi: "« Ne… plus » a deux sens en français. Quand il s'agit du temps (à partir d'un moment, cela cesse), l'anglais dit no longer. « No more » porte sur une quantité (plus de…, no more money) et sonne faux devant un verbe.",
              regle: "Ne… plus (dans le temps) : <b>no longer</b> devant le verbe, ou <b>not… anymore</b> en fin de proposition. Plus de (quantité) : <b>no more</b> + nom.",
              ex: "He no longer works here. / There is no more coffee.", exfr: "Il ne travaille plus ici. / Il n'y a plus de café.",
              carte: { fr: "ne… plus (temps)", en: "no longer / not… anymore" }
            },
            {
              re: ["(it|the forest) (will|can) no longer (produce|generate|make)", "(it|the forest) (will|can) (stop|cease) (producing|to produce)"],
              type: "grammaire", pts: 0.5, faux: "it will no longer produce", juste: "it would no longer produce",
              test: "Scientists estimate that if the forest lost 20 to 25% of its area, it will no longer produce enough rain, which would put the whole region at risk.",
              pourquoi: "La première moitié de la phrase est une hypothèse (si la forêt perdait) : la conséquence est au conditionnel, comme en français (elle ne produirait plus). Will annonce un fait futur certain et casse la logique de la phrase.",
              regle: "If + prétérit → <b>would</b> (ou could, might) + base verbale. If + présent → will.",
              ex: "If the rains stopped, the forest would dry out.", exfr: "Si les pluies s'arrêtaient, la forêt s'assécherait.",
              lecon: { n: 21, ancre: "type-two", titre: "Type 2 : l'hypothèse irréelle au présent" },
              carte: { fr: "elle produirait (conditionnel)", en: "it would produce" }
            },
            {
              re: ["enough of (rain|rainfall|water)", "(rain|rainfall) enough"],
              type: "grammaire", pts: 0.25, faux: "enough of rain / rain enough", juste: "enough rain",
              test: "Scientists estimate that if the forest lost 20 to 25% of its area, it would no longer produce enough of rain, which would put the whole region at risk.",
              pourquoi: "Devant un nom, enough se place avant, sans of : enough rain, enough money. « Enough of » ne s'emploie que devant un déterminant ou un pronom (enough of this rain, enough of them).",
              regle: "<b>Enough + nom</b> (enough rain). <b>Adjectif + enough</b> (big enough). Enough of + the, this, them…",
              ex: "There isn't enough water. The water isn't clean enough.", exfr: "Il n'y a pas assez d'eau. L'eau n'est pas assez propre.",
              lecon: { n: 6, ancre: "quantifieurs-communs", titre: "Les quantifieurs communs" },
              carte: { fr: "assez de pluie", en: "enough rain (sans of)" }
            }
          ]
        },
        {
          fr: "ce qui menacerait toute la région", en: "which would put the whole region at risk", pts: 1,
          pourquoi: "« Ce qui » reprend toute l'idée qui précède : , which. « Menacer » se rend par put… at risk, le complément au milieu : put the whole region at risk.",
          ok: [
            "(which|and this|this|that) would (put|place|leave) (the )?(whole|entire) region (at risk|in danger|under threat)",
            "(which|and this|this) would (put|place) at risk (the )?(whole|entire) region",
            "(which|and this|this|that) (would|could) (threaten|endanger|jeopardize|imperil|put at risk) (the )?(whole|entire) region",
            "(putting|threatening|endangering|jeopardizing) (the )?(whole|entire) region( at risk| in danger)?",
            "(which|and this|this) would (threaten|endanger) (the region as a whole|all of the region)"
          ],
          fautes: [
            {
              re: ["what would (put|threaten|endanger|place|jeopardize)"],
              type: "grammaire", pts: 0.5, faux: "what would threaten", juste: "which would threaten",
              test: "Scientists estimate that if the forest lost 20 to 25% of its area, it would no longer produce enough rain, what would put the whole region at risk.",
              pourquoi: "Ici, « ce qui » reprend toute l'idée qui précède (la forêt ne produirait plus assez de pluie). Dans ce cas, après une virgule, l'anglais emploie which. « What » veut dire « ce que, la chose que » et ne reprend jamais une proposition déjà énoncée.",
              regle: "« , ce qui… » reprenant toute une idée : <b>, which</b>. What = la chose que (What he said is true : ce qu'il a dit est vrai).",
              ex: "Prices rose, which angered consumers.", exfr: "Les prix ont augmenté, ce qui a irrité les consommateurs.",
              lecon: { n: 26, ancre: "sujet", titre: "Who, which, that" },
              carte: { fr: ", ce qui (reprend une idée)", en: ", which" }
            },
            {
              re: ["all the region"],
              type: "gallicisme", pts: 0.25, faux: "all the region", juste: "the whole region",
              test: "Scientists estimate that if the forest lost 20 to 25% of its area, it would no longer produce enough rain, which would threaten all the region.",
              pourquoi: "« Toute la région » se calque mal : devant un nom singulier dénombrable, all the sonne lourd et peu naturel. L'anglais dit the whole region ou the entire region.",
              regle: "Tout le / toute la + nom singulier : <b>the whole</b> / <b>the entire</b> (the whole country). All + pluriel ou indénombrable (all regions, all the water).",
              ex: "The whole country was watching.", exfr: "Tout le pays regardait.",
              carte: { fr: "toute la région", en: "the whole region" }
            }
          ]
        }
      ]
    },
    {
      fr: "Pour y parvenir, le gouvernement de Lula s'est ((appuyé)) ((avant tout)) sur [[la surveillance par satellite]], les contrôles sur le terrain et les sanctions contre les [[déboisements illégaux]].",
      cartes: [
        { id: "296c401334", fr: "reposer sur, dépendre de", en: "to rely on", re: "rel(y|ies|ied|ying)( \\w+){0,3} (up)?on" },
        { id: "17f96e1334", fr: "avant tout, surtout", en: "above all", re: "above all" }
      ],
      aides: [{ fr: "la surveillance par satellite", en: "satellite monitoring" }, { fr: "le déboisement illégal", en: "illegal clearing, illegal logging" }],
      proposition: "To achieve this, Lula's government has relied above all on satellite monitoring, on-the-ground inspections and penalties for illegal clearing.",
      autres: ["To get there, the Lula administration relied first and foremost on satellite monitoring, field inspections and sanctions against illegal logging."],
      tests: [
        "To achieve this result, Lula's government has above all relied on satellite surveillance, inspections on the ground and penalties against illegal deforestation.",
        "To do so, Lula's administration has relied mainly on satellite monitoring, field checks and fines for illegal logging."
      ],
      morceaux: [
        {
          fr: "Pour y parvenir", en: "To achieve this", pts: 0.5,
          pourquoi: "« Pour » + verbe exprime un but : to + base verbale. « Parvenir à un résultat », c'est to achieve, et « y » renvoie au résultat : to achieve this.",
          ok: [
            "(to|in order to|so as to) (achieve|reach|get|obtain|secure|bring about|accomplish) (this|that|it|this result|these results|such a result|this outcome|such results)",
            "to (do so|do this|get there|make it happen|make this happen|succeed|succeed in this|succeed in doing so|pull this off|pull it off)",
            "(this|that) (was|has been) achieved"
          ],
          fautes: [
            {
              re: ["for (achieving|reaching|getting|obtaining|arriving|succeeding|managing)"],
              type: "grammaire", pts: 0.5, faux: "for achieving this", juste: "to achieve this",
              test: "For achieving this, Lula's government has relied above all on satellite monitoring, on-the-ground inspections and penalties for illegal clearing.",
              pourquoi: "« Pour + verbe » exprime ici un but (afin d'y parvenir). En anglais, le but s'exprime avec to + base verbale. « For + V-ing » décrit l'usage d'un objet (a knife for cutting) et ne convient pas pour une action qu'on cherche à accomplir.",
              regle: "But d'une action : <b>to + base verbale</b> (ou in order to, so as to). For + V-ing : fonction d'un objet.",
              ex: "She saved money to buy a car.", exfr: "Elle a économisé pour acheter une voiture.",
              lecon: { n: 23, ancre: "prepositions", titre: "Le gérondif après une préposition" },
              carte: { fr: "pour (but) + verbe", en: "to + base verbale (pas for + V-ing)" }
            },
            {
              re: ["to (arrive|succeed|manage) (there|at it|to it|to do it|in it)", "to (arrive|come) to (it|this|that)"],
              type: "faux-sens", pts: 0.5, faux: "to arrive there", juste: "to achieve this",
              test: "To arrive there, Lula's government has relied above all on satellite monitoring, on-the-ground inspections and penalties for illegal clearing.",
              pourquoi: "« To arrive there » veut dire arriver quelque part, physiquement. « Parvenir à un résultat », c'est réussir à l'obtenir : achieve.",
              regle: "Parvenir à, atteindre (un résultat, un objectif) : <b>to achieve</b>, to reach. Arriver (dans un lieu) : to arrive in / at.",
              ex: "The country achieved its targets.", exfr: "Le pays a atteint ses objectifs.",
              carte: { fr: "parvenir à (un résultat)", en: "to achieve" }
            }
          ]
        },
        {
          fr: "le gouvernement de Lula s'est appuyé avant tout sur", en: "Lula's government has relied above all on", pts: 2,
          pourquoi: "Possesseur humain : génitif saxon, Lula's government. « S'appuyer sur » au sens figuré se dit rely on (toujours on), « avant tout » se dit above all, et le present perfect dit que cette politique dure encore.",
          ok: [
            "(lula's|the lula|president lula's|the brazilian) (government|administration) (has )?(relied|depended|counted|drawn|leaned|built|focused|bet|banked) (above all|mainly|primarily|chiefly|first and foremost|mostly|largely|first of all|especially|in particular|principally)? ?(up)?on",
            "(lula's|the lula|president lula's|the brazilian) (government|administration) (has )?(above all|mainly|primarily|chiefly|largely|mostly|principally) (relied|depended|counted|drawn|leaned|built|focused) (up)?on",
            "(lula's|the lula|president lula's) (government|administration) (has )?(relied|depended|counted) (up)?on,? above all,?",
            "(lula's|the lula|president lula's) (government|administration) (has )?(used|turned to|made use of|resorted to) (above all|mainly|primarily|chiefly|mostly|first and foremost)?"
          ],
          fautes: [
            {
              re: ["the government of (president )?lula"],
              type: "gallicisme", pts: 0.5, faux: "the government of Lula", juste: "Lula's government",
              test: "To achieve this, the government of Lula has relied above all on satellite monitoring, on-the-ground inspections and penalties for illegal clearing.",
              pourquoi: "Quand le possesseur est une personne, l'anglais préfère le génitif en 's, placé devant : Lula's government. « The government of Lula » est compréhensible mais sent la traduction mot à mot.",
              regle: "Possesseur humain : <b>génitif saxon</b> (Lula's government, the president's speech). Of pour les choses (the roof of the house) ou les noms très longs.",
              ex: "Macron's government announced new measures.", exfr: "Le gouvernement de Macron a annoncé de nouvelles mesures.",
              lecon: { n: 5, ancre: "comparaison", titre: "Choisir entre 's et of" },
              carte: { fr: "le gouvernement de Lula", en: "Lula's government" }
            },
            {
              re: ["(supported|supports|supporting) (itself )?(above all |mainly |primarily )?(on|by)", "(is|was|has been) supported (above all |mainly )?on"],
              type: "faux-sens", pts: 1, faux: "supported itself on", juste: "relied on",
              test: "To achieve this, Lula's government has supported itself above all on satellite monitoring, on-the-ground inspections and penalties for illegal clearing.",
              pourquoi: "« To support » veut dire soutenir (support a candidate, soutenir un candidat). « S'appuyer sur » au sens figuré, c'est compter sur un moyen pour réussir : rely on. Avec support, la phrase dit que le gouvernement se soutient lui-même.",
              regle: "S'appuyer sur, compter sur : <b>to rely on</b> (ou to depend on, to draw on). To support : soutenir.",
              ex: "Farmers rely on rain.", exfr: "Les agriculteurs comptent sur la pluie.",
              carte: { fr: "s'appuyer sur, compter sur", en: "to rely on (support = soutenir)" }
            },
            {
              re: ["(relied|relies|rely|relying|depended|depends|counted) (above all |mainly |primarily )?(of|in|from|onto)"],
              type: "grammaire", pts: 0.5, faux: "relied of", juste: "relied on",
              test: "To achieve this, Lula's government has relied above all of satellite monitoring, on-the-ground inspections and penalties for illegal clearing.",
              pourquoi: "Rely, depend et count se construisent toujours avec on (ou upon, plus soutenu). Les autres prépositions sont des calques du français.",
              regle: "<b>Rely on, depend on, count on</b> : toujours on.",
              ex: "You can count on me.", exfr: "Tu peux compter sur moi.",
              carte: { fr: "compter sur, dépendre de", en: "rely on, depend on, count on" }
            },
            {
              re: ["before all"],
              type: "faux-sens", pts: 0.5, faux: "before all", juste: "above all",
              test: "To achieve this, Lula's government has relied before all on satellite monitoring, on-the-ground inspections and penalties for illegal clearing.",
              pourquoi: "« Before all » se comprend « devant tout le monde » ou « avant tous les autres ». L'expression « avant tout » (surtout, en premier lieu) se dit above all.",
              regle: "Avant tout, surtout : <b>above all</b>, first and foremost. Before all (of) them : avant eux tous.",
              ex: "Above all, the plan must be fair.", exfr: "Avant tout, le plan doit être juste.",
              carte: { fr: "avant tout", en: "above all" }
            }
          ]
        },
        {
          fr: "la surveillance par satellite", en: "satellite monitoring", pts: 0.5,
          pourquoi: "En anglais, un nom peut en préciser un autre en se plaçant devant lui : satellite monitoring, « la surveillance par satellite ».",
          ok: [
            "satellite (monitoring|surveillance|tracking|imagery|images|observation|data)",
            "(monitoring|surveillance|tracking|observation) (by|via|from|using) satellites?"
          ],
          fautes: [
            {
              re: ["(satellital|satellitary|satellitic) (monitoring|surveillance)"],
              type: "barbarisme", pts: 0.5, faux: "satellital monitoring", juste: "satellite monitoring",
              test: "To achieve this, Lula's government has relied above all on satellital monitoring, on-the-ground inspections and penalties for illegal clearing.",
              pourquoi: "Ces adjectifs n'existent pas. En anglais, un nom peut servir d'adjectif quand on le place devant un autre nom : satellite monitoring, la surveillance par satellite.",
              regle: "<b>Nom + nom</b> : le premier précise le second (satellite monitoring, trade deal, oil prices). Le premier nom reste au singulier.",
              ex: "Satellite images show the damage.", exfr: "Les images satellite montrent les dégâts.",
              carte: { fr: "la surveillance par satellite", en: "satellite monitoring (nom + nom)" }
            }
          ]
        },
        {
          fr: "les contrôles sur le terrain et les sanctions", en: "on-the-ground inspections and penalties", pts: 0.5,
          pourquoi: "Un contrôle au sens de vérification sur place, c'est an inspection (control veut dire maîtrise). « Sur le terrain » se dit on the ground, et devant un nom il prend des tirets : on-the-ground inspections. « Les sanctions » : penalties.",
          ok: [
            "(on the ground |field |on site |onsite |ground |on the spot )?(inspections|checks|patrols|raids|operations|enforcement operations|enforcement|controls)( on the ground| in the field)?,? (and|as well as|plus) (the )?(sanctions|penalties|fines|punishments|prosecutions)"
          ],
          fautes: [
            {
              re: ["controls? (on the ground|in the field|on site|on the terrain)", "(ground|field|on the ground|on site) controls"],
              type: "faux-sens", pts: 0.25, faux: "controls on the ground", juste: "inspections on the ground",
              test: "To achieve this, Lula's government has relied above all on satellite monitoring, controls on the ground and penalties for illegal clearing.",
              pourquoi: "« Control » veut surtout dire maîtrise, pouvoir de diriger (take control, lose control). Un contrôle au sens de vérification sur place, c'est a check ou an inspection : « controls on the ground » fait penser à des commandes, des leviers.",
              regle: "Contrôle (vérification) : <b>a check</b>, <b>an inspection</b> (border checks, field inspections). Contrôle (maîtrise) : control (the government is in control).",
              ex: "Customs officers carried out random checks.", exfr: "Les douaniers ont effectué des contrôles au hasard.",
              carte: { fr: "un contrôle (vérification)", en: "a check, an inspection (control = maîtrise)" }
            },
            {
              re: ["on the terrain"],
              type: "gallicisme", pts: 0.25, faux: "on the terrain", juste: "on the ground",
              test: "To achieve this, Lula's government has relied above all on satellite monitoring, inspections on the terrain and penalties for illegal clearing.",
              pourquoi: "« Terrain » existe en anglais mais désigne le relief, la nature du sol (rough terrain). « Sur le terrain », au sens de « sur place, en vrai », se dit on the ground ou in the field.",
              regle: "Sur le terrain : <b>on the ground</b>, <b>in the field</b> (field inspections). Terrain : relief.",
              ex: "Aid workers on the ground describe a dire situation.", exfr: "Les humanitaires sur le terrain décrivent une situation dramatique.",
              carte: { fr: "sur le terrain", en: "on the ground, in the field" }
            }
          ]
        },
        {
          fr: "contre les déboisements illégaux", en: "for illegal clearing", pts: 0.5,
          pourquoi: "« Le déboisement illégal » : illegal clearing, un nom indénombrable, donc sans s. Une sanction s'applique for une infraction, comme « pour » en français.",
          ok: [
            "(for|against|over|targeting|on|punishing) (the )?(illegal|unlawful) (deforestation|logging|clearing|land clearing|forest clearing|clear cutting|tree felling|felling)"
          ],
          fautes: [
            {
              re: ["(illegal|unlawful) deforestations"],
              type: "grammaire", pts: 0.25, faux: "illegal deforestations", juste: "illegal deforestation",
              test: "To achieve this, Lula's government has relied above all on satellite monitoring, on-the-ground inspections and penalties against illegal deforestations.",
              pourquoi: "« Deforestation » est indénombrable, comme la plupart des noms en -tion qui désignent un phénomène (pollution, inflation). Il ne prend pas de s, même quand le français met « les déboisements » au pluriel.",
              regle: "Nom indénombrable : <b>pas de pluriel</b>, pas de a / an (deforestation, information, advice, equipment).",
              ex: "Illegal deforestation is falling.", exfr: "Les déboisements illégaux reculent.",
              lecon: { n: 6, ancre: "vue-ensemble", titre: "Dénombrables et indénombrables" },
              carte: { fr: "les déboisements", en: "deforestation (indénombrable)" }
            }
          ]
        }
      ]
    },
    {
      fr: "Environ 15 % de la forêt ont déjà disparu : pour le Brésil, qui en [[abrite]] un peu plus de 60 %, le danger n'est ((pas encore)) [[écarté]].",
      cartes: [{ id: "756941bfae", fr: "pas encore", en: "not yet", re: "not yet|(averted|over|gone|past|removed) yet" }],
      aides: [{ fr: "abriter (une forêt, une population)", en: "to be home to" }, { fr: "écarter (un danger)", en: "to avert" }],
      proposition: "About 15% of the forest has already disappeared: for Brazil, which is home to just over 60% of it, the danger has not yet been averted.",
      autres: ["Around 15% of the forest is already gone, and for Brazil, which is home to slightly more than 60% of it, the threat is not over yet."],
      tests: [
        "Roughly 15% of the forest has already been destroyed: for Brazil, which contains a little more than 60% of it, the danger has not been averted yet.",
        "The forest has already lost about 15 percent of its area: for Brazil, home to just over 60 percent of it, the risk is not over yet."
      ],
      morceaux: [
        {
          fr: "Environ 15 % de la forêt ont déjà disparu", en: "About 15% of the forest has already disappeared", pts: 1.5,
          pourquoi: "« Déjà » fait le bilan au présent : present perfect, has already disappeared. Le verbe s'accorde avec the forest, au singulier (has), même si le français accorde avec le pourcentage.",
          ok: [
            "(about|around|some|roughly|approximately|nearly|almost|close to|an estimated) 15 percent of the (amazon |amazon rainforest|forest|rainforest|amazon forest|biome|amazon biome)( biome)? (has|is) already (disappeared|vanished|gone|been (lost|destroyed|cleared|cut down|wiped out))",
            "(about|around|some|roughly|approximately|nearly|almost|close to|an estimated) 15 percent of the (amazon |amazon rainforest|forest|rainforest|amazon forest|biome|amazon biome)( biome)? (has|is) (disappeared|vanished|gone|been (lost|destroyed|cleared|cut down)) already",
            "the (forest|amazon|rainforest) has already lost (about|around|some|roughly|approximately|nearly|almost|close to) 15 percent( of its (area|surface|cover|trees|surface area))?"
          ],
          fautes: [
            {
              re: ["15 percent of the (amazon |forest|rainforest|amazon forest|biome)( biome)? have (already )?(disappeared|vanished|gone|been)"],
              type: "grammaire", pts: 0.5, faux: "15% of the forest have disappeared", juste: "15% of the forest has disappeared",
              test: "About 15% of the forest have already disappeared: for Brazil, which is home to just over 60% of it, the danger has not yet been averted.",
              pourquoi: "En français, on accorde souvent avec le pourcentage (15 % ont disparu). En anglais, le verbe s'accorde avec le nom qui suit « of » : the forest est singulier, donc has. On dirait au contraire « 15% of the trees have disappeared ».",
              regle: "Pourcentage, fraction, a lot of, most of… + nom : <b>le verbe s'accorde avec ce nom</b> (15% of the forest has ; 15% of the trees have).",
              ex: "Half of the budget has been spent. Half of the students have left.", exfr: "La moitié du budget a été dépensée. La moitié des élèves sont partis.",
              lecon: { n: 7, ancre: "quantifieurs", titre: "Quantifieurs et pronoms indéfinis" },
              carte: { fr: "15 % de la forêt a disparu", en: "15% of the forest has disappeared (accord avec forest)" }
            },
            {
              re: ["15 percent of the (amazon |forest|rainforest|amazon forest|biome)( biome)? (already )?(disappeared|vanished)( already)?"],
              type: "grammaire", pts: 0.5, faux: "15% of the forest already disappeared", juste: "15% of the forest has already disappeared",
              test: "About 15% of the forest already disappeared: for Brazil, which is home to just over 60% of it, the danger has not yet been averted.",
              pourquoi: "« Déjà » fait le bilan, aujourd'hui, de ce qui a été perdu, sans dater la perte. C'est l'emploi typique du present perfect. Le prétérit raconterait un événement daté et terminé.",
              regle: "Bilan au présent, sans date, avec <b>already, yet, ever, never, so far</b> : <b>present perfect</b> (has already disappeared).",
              ex: "The company has already cut 500 jobs.", exfr: "L'entreprise a déjà supprimé 500 emplois.",
              lecon: { n: 14, ancre: "marqueurs", titre: "Marqueurs temporels du present perfect" },
              carte: { fr: "a déjà disparu", en: "has already disappeared (present perfect)" }
            },
            {
              re: ["(is|are|has been|have been) (already )?disappeared"],
              type: "grammaire", pts: 0.5, faux: "is already disappeared", juste: "has already disappeared",
              test: "About 15% of the forest is already disappeared: for Brazil, which is home to just over 60% of it, the danger has not yet been averted.",
              pourquoi: "« Disappear » n'a pas de passif : on ne « est pas disparu » en anglais, on « a disparu ». L'auxiliaire du present perfect est toujours have, jamais be.",
              regle: "Present perfect : <b>have / has + participe passé</b>, pour tous les verbes (has disappeared, has gone, has left). Be + participe = passif (has been destroyed).",
              ex: "The documents have disappeared.", exfr: "Les documents ont disparu.",
              lecon: { n: 14, ancre: "formation", titre: "Le present perfect : formation" },
              carte: { fr: "a disparu", en: "has disappeared (jamais is disappeared)" }
            }
          ]
        },
        {
          fr: "pour le Brésil, qui en abrite un peu plus de 60 %", en: "for Brazil, which is home to just over 60% of it", pts: 1.5,
          pourquoi: "Un pays est une chose pour la grammaire : relatif which, après une virgule. « Abriter » une forêt se dit be home to, « un peu plus de » just over, et of it reprend le « en » du français.",
          ok: [
            "brazil,? which (is home to|contains|hosts|holds|has|houses|shelters|covers|accounts for) (just |slightly |a little |a bit )?(over|more than|above) 60 percent",
            "brazil,? (home to|which has) (just |slightly |a little )?(over|more than|above) 60 percent",
            "(just |slightly |a little )?(over|more than) 60 percent (of (it|the forest|the amazon) )?(lies|is|grows|is located|is found|stands) in brazil"
          ],
          fautes: [
            {
              re: ["brazil,? who (is home|shelters|contains|holds|hosts|has|houses)"],
              type: "grammaire", pts: 0.5, faux: "Brazil, who", juste: "Brazil, which",
              test: "About 15% of the forest has already disappeared: for Brazil, who is home to just over 60% of it, the danger has not yet been averted.",
              pourquoi: "Who ne s'emploie que pour des personnes. Un pays, même désigné comme un acteur, reste une chose pour la grammaire anglaise : le relatif est which (ou that, mais jamais après une virgule).",
              regle: "Personne : <b>who</b>. Chose, pays, institution : <b>which</b>. Après une virgule (relative explicative) : who ou which, jamais that.",
              ex: "Canada, which borders the US, …", exfr: "Le Canada, qui est voisin des États-Unis, …",
              lecon: { n: 26, ancre: "sujet", titre: "Who, which, that" },
              carte: { fr: "le Brésil, qui…", en: "Brazil, which… (who = personnes)" }
            },
            {
              re: ["(for|in) the brazil"],
              type: "grammaire", pts: 0.25, faux: "the Brazil", juste: "Brazil",
              test: "About 15% of the forest has already disappeared: for the Brazil, which is home to just over 60% of it, the danger has not yet been averted.",
              pourquoi: "Les noms de pays ne prennent pas d'article en anglais (Brazil, France, China), sauf quand ils contiennent un nom commun (the United States, the UK) ou sont au pluriel (the Philippines).",
              regle: "<b>Brazil, France, Canada</b> : sans article. <b>The</b> United States, the United Kingdom, the Netherlands.",
              ex: "Brazil is the largest country in South America.", exfr: "Le Brésil est le plus grand pays d'Amérique du Sud.",
              lecon: { n: 4, ancre: "zero-article", titre: "Le zéro article" },
              carte: { fr: "le Brésil, la France", en: "Brazil, France (sans article)" }
            },
            {
              re: ["more of 60"],
              type: "grammaire", pts: 0.5, faux: "more of 60%", juste: "more than 60%",
              test: "About 15% of the forest has already disappeared: for Brazil, which is home to a bit more of 60% of it, the danger has not yet been averted.",
              pourquoi: "Le français dit « plus de 60 % ». En anglais, devant un nombre, la comparaison se fait avec than : more than 60%. « More of » s'emploie pour « davantage de » (more of the same).",
              regle: "Plus de / moins de + nombre : <b>more than / less than (fewer than)</b>, ou <b>over / under</b> (over 60%).",
              ex: "More than 3,000 people attended.", exfr: "Plus de 3 000 personnes étaient présentes.",
              lecon: { n: 22, ancre: "comp-court", titre: "Le comparatif de supériorité" },
              carte: { fr: "plus de 60 %", en: "more than 60%, over 60%" }
            }
          ]
        },
        {
          fr: "le danger n'est pas encore écarté", en: "the danger has not yet been averted", pts: 1,
          pourquoi: "« Écarter un danger », c'est l'empêcher de se produire : to avert. « N'est pas encore » donne un present perfect passif avec not yet : has not yet been averted.",
          ok: [
            "the (danger|threat|risk) (has|is) not (yet )?(been )?(averted|over|gone|past|removed|eliminated|dispelled|lifted)( yet)?",
            "the (danger|threat|risk) (is|has) still not (been )?(averted|over|gone|past|removed)",
            "the (danger|threat|risk) (remains|persists|is still there|is still real|has not gone away)",
            "(it|brazil) is not (yet )?out of (the woods|danger)( yet)?"
          ],
          fautes: [
            {
              re: ["(danger|threat|risk) (is|has) (not|not yet|still not) (yet )?(been )?(put aside|set aside|pushed aside|moved away|discarded|spread|separated|kept away)"],
              type: "faux-sens", pts: 0.5, faux: "the danger is not yet put aside", juste: "the danger has not yet been averted",
              test: "About 15% of the forest has already disappeared: for Brazil, which is home to just over 60% of it, the danger is not yet put aside.",
              pourquoi: "« Put aside » veut dire mettre de côté, réserver pour plus tard (put money aside). Écarter un danger, c'est l'empêcher de se produire : avert, ou dire que le danger n'est pas passé (is not over).",
              regle: "Écarter un danger, éviter une catastrophe : <b>to avert</b> (avert a crisis). Le danger n'est pas passé : <b>the danger is not over</b>.",
              ex: "Quick action averted a disaster.", exfr: "Une action rapide a permis d'écarter une catastrophe.",
              carte: { fr: "écarter (un danger)", en: "to avert" }
            },
            {
              re: ["(is|has) yet not (been )?(averted|over)"],
              type: "grammaire", pts: 0.25, faux: "is yet not averted", juste: "has not yet been averted",
              test: "About 15% of the forest has already disappeared: for Brazil, which is home to just over 60% of it, the danger is yet not averted.",
              pourquoi: "Dans une phrase négative, yet se place après not (has not yet) ou en fin de proposition (has not been averted yet), jamais entre l'auxiliaire et not.",
              regle: "« Pas encore » : <b>not yet</b> (has not yet been…) ou <b>not… yet</b> en fin de proposition.",
              ex: "The results haven't been published yet.", exfr: "Les résultats n'ont pas encore été publiés.",
              lecon: { n: 14, ancre: "marqueurs", titre: "Marqueurs temporels du present perfect" },
              carte: { fr: "pas encore", en: "not yet / not… yet" }
            }
          ]
        }
      ]
    }
  ]
};
