/* Thème du jour d'anglais, 28 novembre 2026 (voir CLAUDE.md, « Thème du jour »).
   ((…)) = mot d'une carte du paquet d'anglais (cartes, dans l'ordre) ; [[…]] = mot nouveau (aides, dans l'ordre).
   Motifs `ok` et `re` : expressions régulières en minuscules, sans accents, nombres en chiffres, orthographe
   américaine, jamais de tiret (flashcards/theme-correcteur.js). Faits : actualites/monde/articles/
   etats-unis-van-gogh-chataigniers-en-fleurs-record-sothebys-2026.html (d'après The Art Newspaper, ARTnews, Artnet,
   Ynet), recoupé par Associated Press (« Painting by Van Gogh sells for record $190.4 million at Sotheby's auction »,
   19 novembre 2026) et The National (« Van Gogh painting sells for record $190.4 million after Nazi-era ownership
   dispute resolved », 19 novembre 2026) : vente du 18 novembre 2026 chez Sotheby's à New York, « Châtaigniers en
   fleurs » (mai 1890) adjugé 165 millions de dollars au marteau, 190,4 millions frais compris (190,4 − 165 = 25,4),
   estimation d'environ 180 millions au marteau ; ancien record de l'artiste 117,2 millions (2022) ; tableau acheté en
   1909 par l'éditeur juif berlinois Samuel Fischer, vendu en 1936, vente contestée par ses héritiers, accord annoncé
   le 17 novembre (veille de la vente) ; acheteur : le marchand new-yorkais William Acquavella, selon le New York Times,
   qui a refusé de dire s'il achetait pour lui ou pour un client (Artnet) ; Charles Stewart, directeur général de
   Sotheby's : la polémique n'a pas pesé sur les enchères ; un peu plus d'un tiers des œuvres de la soirée sous leur
   estimation (The Art Newspaper). */
window.ECG_THEMES_DONNEES = window.ECG_THEMES_DONNEES || {};
window.ECG_THEMES_DONNEES["anglais/2026-11-28"] = {
  langue: "anglais",
  date: "2026-11-28",
  titre: "Un Van Gogh vendu 190,4 millions de dollars à New York, record pour le peintre",
  phrases: [
    {
      fr: "Le 18 novembre, la [[maison de ventes]] Sotheby's a vendu « Châtaigniers en fleurs », un tableau peint par Van Gogh en 1890, pour 190,4 millions de dollars, ((bien au-dessus)) du précédent record de l'artiste.",
      cartes: [
        { id: "8e02edd52c", fr: "bien au-dessus de", en: "far above", re: "(far|well|way) above" }
      ],
      aides: [
        { fr: "une maison de ventes (aux enchères)", en: "an auction house" }
      ],
      proposition: "On 18 November, the auction house Sotheby's sold Chestnut Trees in Blossom, a painting by Van Gogh from 1890, for 190.4 million dollars, far above the artist's previous record.",
      autres: [
        "On November 18, the auction house Sotheby's sold \"Chestnut Trees in Blossom\", a painting Van Gogh made in 1890, for $190.4 million, well above the artist's previous record."
      ],
      tests: [
        "On 18 November, Chestnut Trees in Blossom, a canvas painted by Van Gogh in 1890, was sold by the auction house Sotheby's for $190.4m, far above Van Gogh's previous record.",
        "On the 18th of November, Sotheby's auction house sold Chestnut Trees in Bloom, an 1890 painting by Van Gogh, for 190.4 million dollars, way above the painter's former record."
      ],
      morceaux: [
        {
          fr: "Le 18 novembre,",
          en: "On 18 November",
          pourquoi: "Une date précise (un jour) prend on : on 18 November (britannique) ou on November 18 (américain). Les mois prennent une majuscule.",
          pts: 0.5,
          ok: [
            "on (18(th)? (of )?november|november (the )?18(th)?|the 18(th)? of november|wednesday,? 18(th)? (of )?november|wednesday,? november 18(th)?)"
          ],
          fautes: [
            {
              re: ["(in|at) (the )?18(th)? (of )?november", "(in|at) november 18"],
              type: "grammaire",
              pts: 0.5,
              faux: "in 18 November",
              juste: "on 18 November",
              test: "In 18 November, the auction house Sotheby's sold Chestnut Trees in Blossom, a painting by Van Gogh from 1890, for 190.4 million dollars, far above the artist's previous record.",
              pourquoi: "Avec in, l'anglophone attend une période (in November, in 2026) ; devant un jour précis, in sonne faux. Une date, c'est un jour : on.",
              regle: "<b>On</b> + jour, date (on 18 November, on Monday). <b>In</b> + mois, année, saison.",
              ex: "The sale took place on 18 November, in New York.",
              exfr: "La vente a eu lieu le 18 novembre, à New York.",
              lecon: { n: 9, ancre: "temps-detail", titre: "In, on, at : la position dans le temps" },
              carte: { fr: "le 18 novembre", en: "on 18 November (on + date)" }
            }
          ]
        },
        {
          fr: "la maison de ventes Sotheby's a vendu « Châtaigniers en fleurs »,",
          en: "the auction house Sotheby's sold Chestnut Trees in Blossom",
          pourquoi: "La vente est datée (le 18 novembre) : le prétérit s'impose, sold. Une maison de ventes aux enchères est an auction house, le nom qui précise (auction) devant. Le titre se traduit (Chestnut Trees in Blossom) ou se garde en français.",
          pts: 1,
          ok: [
            "(the )?(auction house |auctioneer |auctioneers |new york auction house )?sotheby's( auction house| auctioneers)? (sold|auctioned( off)?|sold off)( [^ ]+){0,2} (chestnut trees in (blossom|bloom|flower|flowers)|blossoming chestnut trees|flowering chestnut trees|chataigniers en fleurs)",
            "sotheby's,? the (new york )?auction (house|firm),? (sold|auctioned( off)?)( [^ ]+){0,2} (chestnut trees in (blossom|bloom|flower|flowers)|blossoming chestnut trees|flowering chestnut trees|chataigniers en fleurs)",
            "(chestnut trees in (blossom|bloom|flower|flowers)|blossoming chestnut trees|flowering chestnut trees|chataigniers en fleurs)( [^ ]+){0,12} was (sold|auctioned( off)?) (by|at) (the )?(new york )?(auction house )?sotheby's( auction house)?"
          ],
          fautes: [
            {
              re: ["sotheby's( auction house)? (has|have) (sold|auctioned)", "(has|have) been (sold|auctioned)"],
              type: "grammaire",
              pts: 0.5,
              faux: "On 18 November, Sotheby's has sold…",
              juste: "On 18 November, Sotheby's sold…",
              test: "On 18 November, the auction house Sotheby's has sold Chestnut Trees in Blossom, a painting by Van Gogh from 1890, for 190.4 million dollars, far above the artist's previous record.",
              pourquoi: "Le present perfect relie le passé au présent sans dater l'action ; avec une date précise (on 18 November), il se contredit. Un fait passé et daté se met au prétérit.",
              regle: "Moment passé précis (on 18 November, last week, in 2022) : <b>prétérit</b>, jamais le present perfect.",
              ex: "Christie's sold a Van Gogh for 117.2 million dollars in 2022.",
              exfr: "Christie's a vendu un Van Gogh 117,2 millions de dollars en 2022.",
              lecon: { n: 14, ancre: "comparaison", titre: "Present perfect ou prétérit" },
              carte: { fr: "a vendu (le 18 novembre)", en: "sold (prétérit + date)" }
            },
            {
              re: ["(sale|sales|selling|sell) house", "house of (sales|sale|auctions|auction|selling)", "auctions house"],
              type: "gallicisme",
              pts: 0.5,
              faux: "the sales house Sotheby's",
              juste: "the auction house Sotheby's",
              test: "On 18 November, the sales house Sotheby's sold Chestnut Trees in Blossom, a painting by Van Gogh from 1890, for 190.4 million dollars, far above the artist's previous record.",
              pourquoi: "« Maison de ventes » ne se calque pas : a sales house ou a house of sales n'évoque rien pour un anglophone. Ce qui compte, c'est la vente aux enchères (auction), d'où an auction house, avec auction au singulier, comme tout nom employé en adjectif.",
              regle: "Une maison de ventes aux enchères : <b>an auction house</b> (nom + nom, le premier au singulier).",
              ex: "Christie's is Sotheby's main rival among auction houses.",
              exfr: "Christie's est la grande rivale de Sotheby's parmi les maisons de ventes.",
              carte: { fr: "une maison de ventes", en: "an auction house" }
            }
          ]
        },
        {
          fr: "un tableau peint par Van Gogh en 1890,",
          en: "a painting by Van Gogh from 1890",
          pourquoi: "Un tableau : a painting (ou a canvas). « Peint par » : painted by, ou simplement a painting by Van Gogh ; l'agent prend toujours by. L'année : in 1890, from 1890, ou an 1890 painting.",
          pts: 1,
          ok: [
            "(a |an |the )?(painting|canvas|picture|work|artwork|oil painting|landscape|masterpiece)( that| which)?( was)? (painted|made|created|produced|completed|executed) by (vincent )?van gogh in 1890",
            "(a |an |the )?(painting|canvas|picture|work|artwork|oil painting|landscape|masterpiece) by (vincent )?van gogh,? (from|in|dating from|dating back to|of|painted in|made in) 1890",
            "(a |an |the )?1890 (painting|canvas|picture|work|artwork|oil painting|landscape|masterpiece) by (vincent )?van gogh",
            "(a |an |the )?(painting|canvas|picture|work|artwork|oil painting|landscape|masterpiece)( that| which)? (vincent )?van gogh (painted|made|created|produced|completed) in 1890",
            "(a |an |the )?(1890 )?(vincent )?van gogh (painting|canvas|picture|work|artwork|landscape|masterpiece) (from|of|painted in|made in|dating from) 1890",
            "(a |an )1890 (vincent )?van gogh (painting|canvas|picture|work|artwork|landscape|masterpiece)",
            "(painted|made|created) by (vincent )?van gogh in 1890",
            "which (vincent )?van gogh painted in 1890"
          ],
          fautes: [
            {
              re: ["tables?"],
              type: "faux-sens",
              pts: 0.5,
              faux: "a table painted by Van Gogh",
              juste: "a painting by Van Gogh",
              test: "On 18 November, the auction house Sotheby's sold Chestnut Trees in Blossom, a table painted by Van Gogh in 1890, for 190.4 million dollars, far above the artist's previous record.",
              pourquoi: "Faux ami. A table est le meuble (ou un tableau de chiffres) : « a table painted by Van Gogh » ferait croire qu'il a peint une table. Un tableau, une toile, c'est a painting ou a canvas.",
              regle: "Un tableau (œuvre d'art) : <b>a painting, a canvas</b>. A table : une table, un tableau de chiffres.",
              ex: "The museum owns twelve paintings by Monet.",
              exfr: "Le musée possède douze tableaux de Monet.",
              carte: { fr: "un tableau (œuvre)", en: "a painting (a table = une table)" }
            },
            {
              re: ["(painted|made|created) (of|from|par) (vincent )?van gogh"],
              type: "grammaire",
              pts: 0.5,
              faux: "a painting painted of Van Gogh",
              juste: "a painting painted by Van Gogh",
              test: "On 18 November, the auction house Sotheby's sold Chestnut Trees in Blossom, a painting painted of Van Gogh in 1890, for 190.4 million dollars, far above the artist's previous record.",
              pourquoi: "Painted of Van Gogh voudrait dire « peint à partir de Van Gogh », comme un portrait de lui. L'auteur d'une action au passif, le « par » français, se dit toujours by.",
              regle: "Complément d'agent : <b>by</b> (painted by Van Gogh, written by Orwell).",
              ex: "The landscape was painted by Van Gogh in Auvers.",
              exfr: "Le paysage a été peint par Van Gogh à Auvers.",
              lecon: { n: 25, ancre: "agent-by", titre: "Le complément d'agent : by" },
              carte: { fr: "peint par", en: "painted by" }
            }
          ]
        },
        {
          fr: "pour 190,4 millions de dollars,",
          en: "for $190.4 million",
          pourquoi: "Le prix d'une vente prend for (sold for $190.4 million). Million reste invariable après un nombre, et la virgule décimale française devient un point (190.4).",
          pts: 0.5,
          ok: [
            "for (a record |some |about |a total of )?(190 4 (million|m|mn)|190 4m|190 4mn|190400000|190400 000)( (dollars|us dollars))?"
          ],
          fautes: [
            {
              re: ["190 4 millions"],
              type: "grammaire",
              pts: 0.5,
              faux: "for 190.4 millions dollars",
              juste: "for 190.4 million dollars",
              test: "On 18 November, the auction house Sotheby's sold Chestnut Trees in Blossom, a painting by Van Gogh from 1890, for 190.4 millions dollars, far above the artist's previous record.",
              pourquoi: "Après un nombre, million fonctionne comme un adjectif numéral : il reste invariable (190.4 million dollars). Millions ne s'emploie que seul, au sens vague (millions of dollars).",
              regle: "<b>Nombre + million</b>, sans s (190.4 million). <b>Millions of</b> au sens vague.",
              ex: "The evening raised 777.8 million dollars.",
              exfr: "La soirée a rapporté 777,8 millions de dollars.",
              lecon: { n: 11, ancre: "grands-nombres", titre: "Les grands nombres : million" },
              carte: { fr: "190,4 millions de dollars", en: "190.4 million dollars (million invariable)" }
            },
            {
              re: ["millions? of dollars"],
              type: "gallicisme",
              pts: 0.25,
              faux: "for 190.4 million of dollars",
              juste: "for 190.4 million dollars / for $190.4 million",
              test: "On 18 November, the auction house Sotheby's sold Chestnut Trees in Blossom, a painting by Van Gogh from 1890, for 190.4 million of dollars, far above the artist's previous record.",
              pourquoi: "Le « de » de « millions de dollars » ne se traduit pas quand le nombre est précis : million se place directement devant le nom (190.4 million dollars), ou on écrit $190.4 million.",
              regle: "<b>Nombre + million + nom</b>, sans of (2 million people, $190.4 million).",
              ex: "Two million visitors came to the exhibition.",
              exfr: "Deux millions de visiteurs sont venus à l'exposition.",
              lecon: { n: 11, ancre: "grands-nombres", titre: "Les grands nombres : million" },
              carte: { fr: "190,4 millions de dollars", en: "$190.4 million (sans of)" }
            }
          ]
        },
        {
          fr: "bien au-dessus du précédent record de l'artiste.",
          en: "far above the artist's previous record",
          pourquoi: "« Bien au-dessus de » : far above (ou well above), far renforçant la préposition. « Le record de l'artiste » : le génitif, the artist's previous record, le possesseur d'abord.",
          pts: 1,
          ok: [
            "(far|well|way|much|comfortably|significantly|substantially|easily|massively) (above|over|higher than|beyond|ahead of|exceeding|surpassing|outstripping|beating|eclipsing|topping|more than|in excess of) (the |van gogh's |the painter's |the artist's |his )?(own )?(previous|former|old|last|earlier|prior|existing|preceding) (auction )?(record|high|best|top price)( (for|of) (the artist|the painter|van gogh|his work|his works|a van gogh|the dutch painter|the dutch artist))?",
            "(smashing|shattering|crushing|breaking|beating|eclipsing) (the |van gogh's |the painter's |the artist's |his )?(own )?(previous|former|old|last|earlier|prior|existing|preceding) (auction )?(record|high|best)"
          ],
          fautes: [
            {
              re: ["very (above|over|higher|beyond|much above)"],
              type: "grammaire",
              pts: 0.5,
              faux: "very above the artist's previous record",
              juste: "far above the artist's previous record",
              test: "On 18 November, the auction house Sotheby's sold Chestnut Trees in Blossom, a painting by Van Gogh from 1890, for 190.4 million dollars, very above the artist's previous record.",
              pourquoi: "Very ne renforce qu'un adjectif ou un adverbe (very high). Devant une préposition (above) ou un comparatif (higher), il ne va pas : l'anglais emploie far, well ou much (far above, much higher).",
              regle: "Renforcer une préposition ou un comparatif : <b>far, well, much</b> (far above, much higher). Very + adjectif seul.",
              ex: "The price was well above the estimate.",
              exfr: "Le prix était bien au-dessus de l'estimation.",
              lecon: { n: 22, ancre: "comp-court", titre: "Le comparatif des adjectifs courts" },
              carte: { fr: "bien au-dessus de", en: "far above, well above" }
            },
            {
              re: ["precedent"],
              type: "faux-sens",
              pts: 0.5,
              faux: "the precedent record",
              juste: "the previous record",
              test: "On 18 November, the auction house Sotheby's sold Chestnut Trees in Blossom, a painting by Van Gogh from 1890, for 190.4 million dollars, far above the artist's precedent record.",
              pourquoi: "Faux ami. A precedent est un nom : un précédent, un cas qui fait jurisprudence (to set a precedent). L'adjectif « précédent » se dit previous ou former.",
              regle: "Précédent (adjectif) : <b>previous, former</b>. A precedent : un précédent (nom).",
              ex: "The previous record was set at Christie's in 2022.",
              exfr: "Le précédent record avait été établi chez Christie's en 2022.",
              carte: { fr: "précédent (adjectif)", en: "previous (a precedent = un précédent)" }
            }
          ]
        }
      ]
    },
    {
      fr: "Les [[héritiers]] de l'éditeur juif Samuel Fischer, qui l'avait acheté en 1909, ((contestaient)) sa vente de 1936, mais un accord a été annoncé la [[veille]] des enchères.",
      cartes: [
        { id: "99d9dd5d82", fr: "contester", en: "to dispute", re: "disput(e|es|ed|ing)" }
      ],
      aides: [
        { fr: "les héritiers", en: "the heirs" },
        { fr: "la veille (de)", en: "the day before, the eve (of)" }
      ],
      proposition: "The heirs of the Jewish publisher Samuel Fischer, who had bought it in 1909, disputed its sale in 1936, but a deal was announced the day before the auction.",
      autres: [
        "The heirs of Samuel Fischer, a Jewish publisher who had bought it in 1909, were disputing its 1936 sale, but an agreement was announced on the eve of the auction."
      ],
      tests: [
        "The descendants of Jewish publisher Samuel Fischer, who had acquired the painting in 1909, challenged its sale in 1936, but a settlement was announced the day before the sale.",
        "The heirs of the Jewish publisher Samuel Fischer, who bought it in 1909, had been disputing the 1936 sale, yet a deal was announced on the day before the auction."
      ],
      morceaux: [
        {
          fr: "Les héritiers de l'éditeur juif Samuel Fischer,",
          en: "The heirs of the Jewish publisher Samuel Fischer",
          pourquoi: "Les héritiers : the heirs (le h ne se prononce pas). Un éditeur, qui publie des livres, est a publisher ; l'adjectif Jewish, avec sa majuscule, se place devant le nom.",
          pts: 1,
          ok: [
            "(heirs|descendants|inheritors|successors|relatives) of (the )?(jewish (berlin )?|berlin jewish |german jewish |jewish german )?publisher samuel fischer",
            "(heirs|descendants|inheritors|successors|relatives) of samuel fischer,? (a|the) (jewish (berlin )?|berlin jewish |german jewish |jewish german )?publisher",
            "(jewish (berlin )?|berlin jewish |german jewish |jewish german )?publisher samuel fischer's (heirs|descendants|inheritors|successors|relatives)"
          ],
          fautes: [
            {
              re: ["editors?"],
              type: "faux-sens",
              pts: 0.5,
              faux: "the Jewish editor Samuel Fischer",
              juste: "the Jewish publisher Samuel Fischer",
              test: "The heirs of the Jewish editor Samuel Fischer, who had bought it in 1909, disputed its sale in 1936, but a deal was announced the day before the auction.",
              pourquoi: "Faux ami. An editor corrige et prépare les textes, ou dirige la rédaction d'un journal (rédacteur en chef). Celui qui possède une maison d'édition et publie les livres est a publisher.",
              regle: "Un éditeur (maison d'édition) : <b>a publisher</b>. An editor : un rédacteur, un correcteur.",
              ex: "Samuel Fischer was one of Berlin's leading publishers.",
              exfr: "Samuel Fischer était l'un des grands éditeurs berlinois.",
              carte: { fr: "un éditeur (de livres)", en: "a publisher (an editor = un rédacteur)" }
            },
            {
              re: ["heritors?", "heritiers?", "heritages?"],
              type: "barbarisme",
              pts: 0.5,
              faux: "the heritors of Samuel Fischer",
              juste: "the heirs of Samuel Fischer",
              test: "The heritors of the Jewish publisher Samuel Fischer, who had bought it in 1909, disputed its sale in 1936, but a deal was announced the day before the auction.",
              pourquoi: "Heritor n'existe pas en anglais courant, et heritage est le patrimoine (un héritage culturel), pas une personne. Les héritiers sont the heirs (ou the descendants).",
              regle: "Un héritier : <b>an heir</b> (h muet). Heritage : le patrimoine. Inheritance : l'héritage (les biens).",
              ex: "The heirs reached a deal with the seller.",
              exfr: "Les héritiers ont trouvé un accord avec le vendeur.",
              carte: { fr: "les héritiers", en: "the heirs" }
            },
            {
              re: ["publisher jewish", "jew publisher"],
              type: "grammaire",
              pts: 0.25,
              faux: "the publisher Jewish Samuel Fischer",
              juste: "the Jewish publisher Samuel Fischer",
              test: "The heirs of the publisher Jewish Samuel Fischer, who had bought it in 1909, disputed its sale in 1936, but a deal was announced the day before the auction.",
              pourquoi: "L'adjectif épithète se place devant le nom en anglais (a Jewish publisher). Jew est un nom ; employé comme adjectif (a Jew publisher), il est maladroit et peut sembler injurieux : l'adjectif est Jewish.",
              regle: "<b>Adjectif + nom</b> (a Jewish publisher). L'adjectif : Jewish ; le nom : a Jew.",
              ex: "A German publisher bought the rights.",
              exfr: "Un éditeur allemand a acheté les droits.",
              lecon: { n: 8, ancre: "adjectif-position", titre: "La place de l'adjectif épithète" },
              carte: { fr: "un éditeur juif", en: "a Jewish publisher" }
            }
          ]
        },
        {
          fr: "qui l'avait acheté en 1909,",
          en: "who had bought it in 1909",
          pourquoi: "Who, car l'antécédent est une personne (Samuel Fischer). L'achat (1909) est antérieur à la vente de 1936 : le past perfect, had bought, marque cette antériorité dans le passé (le prétérit bought est aussi admis).",
          pts: 1,
          ok: [
            "(who|that) (had )?(bought|acquired|purchased) (it|the painting|the canvas|the work|the picture|the artwork) (in|back in) 1909"
          ],
          fautes: [
            {
              re: ["which (had |has )?(bought|acquired|purchased)"],
              type: "grammaire",
              pts: 0.5,
              faux: "Samuel Fischer, which had bought it",
              juste: "Samuel Fischer, who had bought it",
              test: "The heirs of the Jewish publisher Samuel Fischer, which had bought it in 1909, disputed its sale in 1936, but a deal was announced the day before the auction.",
              pourquoi: "Which renvoie à une chose ou à un animal : « Samuel Fischer, which » traite l'éditeur comme un objet. Pour une personne, le relatif sujet est who.",
              regle: "<b>Who</b> : personnes. <b>Which</b> : choses. <b>That</b> : les deux, sans virgule.",
              ex: "The collector who bought the painting refused to comment.",
              exfr: "Le collectionneur qui a acheté le tableau a refusé de commenter.",
              lecon: { n: 26, ancre: "sujet", titre: "Les relatifs sujets : who, which, that" },
              carte: { fr: "qui (une personne)", en: "who (which = une chose)" }
            },
            {
              re: ["(who|that|which) (has|have) (bought|acquired|purchased)"],
              type: "grammaire",
              pts: 0.5,
              faux: "who has bought it in 1909",
              juste: "who had bought it in 1909",
              test: "The heirs of the Jewish publisher Samuel Fischer, who has bought it in 1909, disputed its sale in 1936, but a deal was announced the day before the auction.",
              pourquoi: "Le present perfect (has bought) ne se combine jamais avec une date passée (in 1909). Ici l'achat précède un autre fait passé (la vente de 1936) : past perfect, had bought.",
              regle: "Antériorité dans le passé : <b>had + participe passé</b> (who had bought it). Jamais has + date passée.",
              ex: "The family had bought the painting long before the war.",
              exfr: "La famille avait acheté le tableau bien avant la guerre.",
              lecon: { n: 16, ancre: "formation", titre: "La formation du past perfect" },
              carte: { fr: "qui l'avait acheté", en: "who had bought it" }
            },
            {
              re: ["buyed", "boughted", "buyd"],
              type: "barbarisme",
              pts: 0.5,
              faux: "who had buyed it",
              juste: "who had bought it",
              test: "The heirs of the Jewish publisher Samuel Fischer, who had buyed it in 1909, disputed its sale in 1936, but a deal was announced the day before the auction.",
              pourquoi: "Buy est irrégulier : buy, bought, bought. Buyed n'existe pas.",
              regle: "<b>Buy, bought, bought</b> (comme bring, brought, brought).",
              ex: "The dealer bought three paintings that night.",
              exfr: "Le marchand a acheté trois tableaux ce soir-là.",
              carte: { fr: "acheter", en: "buy, bought, bought" }
            }
          ]
        },
        {
          fr: "contestaient sa vente de 1936,",
          en: "disputed its sale in 1936",
          pourquoi: "Contester (une vente, une décision) : to dispute, ou challenge, contest. « Sa vente », celle du tableau : its, le possessif des choses. « De 1936 » : its 1936 sale, ou its sale in 1936.",
          pts: 1,
          ok: [
            "(disputed|were disputing|had disputed|had been disputing|have disputed|have been disputing|contested|were contesting|had contested|had been contesting|have contested|challenged|were challenging|had challenged|had been challenging|have challenged|questioned|were questioning|had questioned|objected to|were objecting to|had objected to) (its 1936 sale|the 1936 sale|its sale in 1936|the sale in 1936|its sale of 1936|the sale of 1936|the sale of (the painting|the canvas|the work|it) in 1936|its sale back in 1936|the painting's (1936 )?sale( in 1936)?)"
          ],
          fautes: [
            {
              re: ["(disputed|disputing|contested|contesting|challenged|challenging|questioned|questioning) (his|her|their) (1936 )?sale"],
              type: "grammaire",
              pts: 0.5,
              faux: "disputed his sale in 1936",
              juste: "disputed its sale in 1936",
              test: "The heirs of the Jewish publisher Samuel Fischer, who had bought it in 1909, disputed his sale in 1936, but a deal was announced the day before the auction.",
              pourquoi: "En anglais, le possessif s'accorde avec le possesseur, pas avec l'objet possédé. Le possesseur est le tableau, une chose : its. His renverrait à Samuel Fischer, their aux héritiers.",
              regle: "Possesseur chose : <b>its</b>. Homme : his. Femme : her. Pluriel : their.",
              ex: "The painting and its history fascinated the buyers.",
              exfr: "Le tableau et son histoire ont fasciné les acheteurs.",
              lecon: { n: 3, ancre: "possessifs", titre: "Les possessifs" },
              carte: { fr: "sa vente (celle du tableau)", en: "its sale (its = possesseur chose)" }
            },
            {
              re: ["contestat(e|ed|es|ing)"],
              type: "barbarisme",
              pts: 0.5,
              faux: "contestated its sale",
              juste: "disputed its sale",
              test: "The heirs of the Jewish publisher Samuel Fischer, who had bought it in 1909, contestated its sale in 1936, but a deal was announced the day before the auction.",
              pourquoi: "Contestate n'existe pas : c'est un mot fabriqué à partir de « contestation ». Le verbe est to contest, ou mieux, pour une vente, to dispute ou to challenge.",
              regle: "Contester : <b>to dispute, to challenge, to contest</b>.",
              ex: "The heirs disputed the sale in court.",
              exfr: "Les héritiers ont contesté la vente devant la justice.",
              carte: { fr: "contester", en: "to dispute, to challenge" }
            },
            {
              re: ["(its|the|their|his) (1936 )?sell"],
              type: "barbarisme",
              pts: 0.5,
              faux: "disputed its sell in 1936",
              juste: "disputed its sale in 1936",
              test: "The heirs of the Jewish publisher Samuel Fischer, who had bought it in 1909, disputed its sell in 1936, but a deal was announced the day before the auction.",
              pourquoi: "Sell est le verbe (vendre) ; le nom, la vente, est sale. On ne met pas un verbe après un possessif.",
              regle: "Vendre : <b>to sell</b>. Une vente : <b>a sale</b>.",
              ex: "The sale took place in 1936.",
              exfr: "La vente a eu lieu en 1936.",
              carte: { fr: "une vente", en: "a sale (to sell = vendre)" }
            }
          ]
        },
        {
          fr: "mais un accord a été annoncé la veille des enchères.",
          en: "but a deal was announced the day before the auction",
          pourquoi: "Passif au prétérit (un fait passé et daté) : was announced. Un accord : a deal, an agreement, a settlement. « La veille de » : the day before, ou on the eve of. Les enchères, la vente : the auction.",
          pts: 1,
          ok: [
            "(but|yet|however|though|although)( [^ ]+){0,3}? (a|an) (deal|agreement|settlement|accord|arrangement|compromise)( [^ ]+){0,8}? (was|had been) (announced|reached|unveiled|made public|struck)( [^ ]+){0,8}? (on )?(the day before|a day before|the eve of|the day prior to|24 hours before) (the )?(auction|sale|sales|auction sale)"
          ],
          fautes: [
            {
              re: ["(has|have) been (announced|reached|unveiled|struck)"],
              type: "grammaire",
              pts: 0.5,
              faux: "a deal has been announced the day before",
              juste: "a deal was announced the day before",
              test: "The heirs of the Jewish publisher Samuel Fischer, who had bought it in 1909, disputed its sale in 1936, but a deal has been announced the day before the auction.",
              pourquoi: "L'annonce est située à un moment passé précis (la veille des enchères, le 17 novembre) : le passif se met au prétérit, was announced. Le present perfect ne se combine pas avec un moment révolu.",
              regle: "Passif au prétérit : <b>was / were + participe</b>, pour un fait passé daté.",
              ex: "The record was set in 2022.",
              exfr: "Le record a été établi en 2022.",
              lecon: { n: 14, ancre: "comparaison", titre: "Present perfect ou prétérit" },
              carte: { fr: "a été annoncé (la veille)", en: "was announced" }
            },
            {
              re: ["the vigil", "veille", "the evening before"],
              type: "faux-sens",
              pts: 0.5,
              faux: "the evening before the auction",
              juste: "the day before the auction",
              test: "The heirs of the Jewish publisher Samuel Fischer, who had bought it in 1909, disputed its sale in 1936, but a deal was announced the evening before the auction.",
              pourquoi: "La veille, c'est le jour d'avant (le 17 novembre pour une vente le 18) : the day before, ou the eve of. The evening before réduirait l'annonce à la soirée précédente, et a vigil est une veillée (de prière, de deuil).",
              regle: "La veille : <b>the day before</b>, <b>on the eve of</b>. A vigil : une veillée.",
              ex: "The deal was announced on the eve of the sale.",
              exfr: "L'accord a été annoncé la veille de la vente.",
              carte: { fr: "la veille de", en: "the day before, on the eve of" }
            }
          ]
        }
      ]
    },
    {
      fr: "Le [[prix au marteau]], 165 millions de dollars, est pourtant resté inférieur à l'[[estimation]], environ 180 millions : les frais payés par l'acheteur ((représentent)) plus de 25 millions.",
      cartes: [
        { id: "6826551a9d", fr: "représenter, compter pour", en: "to account for", re: "account(s|ed)? for" }
      ],
      aides: [
        { fr: "le prix au marteau, le prix d'adjudication", en: "the hammer price" },
        { fr: "l'estimation (d'une œuvre)", en: "the estimate" }
      ],
      proposition: "The hammer price, 165 million dollars, nevertheless remained below the estimate, about 180 million: the fees paid by the buyer account for more than 25 million.",
      autres: [
        "However, the hammer price of $165 million stayed lower than the estimate of around $180 million: the buyer's fees account for over $25 million."
      ],
      tests: [
        "Yet the hammer price, $165m, fell short of the estimate of roughly $180m: the fees paid by the buyer amount to more than $25m.",
        "The hammer price, 165 million dollars, was however below the estimate, which was about 180 million: the buyer's premium represents more than 25 million."
      ],
      morceaux: [
        {
          fr: "Le prix au marteau, 165 millions de dollars,",
          en: "The hammer price, 165 million dollars",
          pourquoi: "Le prix au marteau, celui que prononce le commissaire-priseur avant les frais : the hammer price, nom composé où hammer précise price. Million reste invariable après un nombre.",
          pts: 1,
          ok: [
            "hammer price( of| at| which was| standing at| was)? (165 (million|m|mn)|165m|165mn|165000000)"
          ],
          fautes: [
            {
              re: ["price (at|of|to|under) the hammer", "hammer's price", "marteau", "price of hammer"],
              type: "gallicisme",
              pts: 0.5,
              faux: "the price at the hammer",
              juste: "the hammer price",
              test: "The price at the hammer, 165 million dollars, nevertheless remained below the estimate, about 180 million: the fees paid by the buyer account for more than 25 million.",
              pourquoi: "« Au marteau » ne se calque pas avec at : l'anglais forme un nom composé, the hammer price, le nom qui précise devant, comme an auction house.",
              regle: "<b>Nom + nom</b> : the hammer price, the auction house, the art market.",
              ex: "The hammer price does not include the buyer's fees.",
              exfr: "Le prix au marteau ne comprend pas les frais de l'acheteur.",
              carte: { fr: "le prix au marteau", en: "the hammer price" }
            },
            {
              re: ["165 millions"],
              type: "grammaire",
              pts: 0.5,
              faux: "165 millions dollars",
              juste: "165 million dollars",
              test: "The hammer price, 165 millions dollars, nevertheless remained below the estimate, about 180 million: the fees paid by the buyer account for more than 25 million.",
              pourquoi: "Après un nombre, million reste invariable (165 million dollars) : il se comporte comme un adjectif numéral, qui ne prend jamais de s.",
              regle: "<b>Nombre + million</b>, sans s (165 million).",
              ex: "The Cézanne sold for 111 million dollars.",
              exfr: "Le Cézanne s'est vendu 111 millions de dollars.",
              lecon: { n: 11, ancre: "grands-nombres", titre: "Les grands nombres : million" },
              carte: { fr: "165 millions de dollars", en: "165 million dollars (million invariable)" }
            }
          ]
        },
        {
          fr: "est pourtant resté inférieur à l'estimation, environ 180 millions :",
          en: "nevertheless remained below the estimate, about 180 million",
          pourquoi: "« Inférieur à » un chiffre : below, lower than, under (ou fell short of). « Rester » : remain, stay. « Pourtant » : nevertheless, however, yet. L'estimation d'une œuvre se dit the estimate (un nom, prononcé « estimeut »).",
          pts: 1.5,
          ok: [
            "(remained|stayed|was|fell|came in|ended up|was still|still remained|was nevertheless|was however|was though|remained however|remained nevertheless|stayed however|nevertheless remained|however remained|nonetheless remained|nevertheless stayed|nevertheless was|however was|nevertheless fell|however fell|nevertheless came in)( however| nevertheless| nonetheless| though| still)? (below|under|lower than|short of|beneath|less than|underneath)( the| its| sotheby's)? (pre sale |presale |low )?(estimate|valuation|expected price|forecast)(,? (of|at|which was|set at|put at|which stood at|that is))?( about| around| roughly| approximately| some| close to| nearly)? (180 (million|m|mn)|180m|180mn|180000000)"
          ],
          fautes: [
            {
              re: ["inferior"],
              type: "faux-sens",
              pts: 0.75,
              faux: "remained inferior to the estimate",
              juste: "remained below the estimate",
              test: "The hammer price, 165 million dollars, nevertheless remained inferior to the estimate, about 180 million: the fees paid by the buyer account for more than 25 million.",
              pourquoi: "Faux ami. Inferior veut dire « de moins bonne qualité » (an inferior product) ou « subalterne ». Pour un chiffre plus petit, l'anglais dit below, lower than ou under.",
              regle: "Inférieur à (un chiffre) : <b>below, lower than, under</b>. Inferior : de moindre qualité.",
              ex: "Six lots sold below their low estimate.",
              exfr: "Six lots se sont vendus en dessous de leur estimation basse.",
              carte: { fr: "inférieur à (un chiffre)", en: "below, lower than (inferior = de moindre qualité)" }
            },
            {
              re: ["(lower|less) (that|as|to) (the|its)"],
              type: "grammaire",
              pts: 0.5,
              faux: "lower that the estimate",
              juste: "lower than the estimate",
              test: "The hammer price, 165 million dollars, nevertheless remained lower that the estimate, about 180 million: the fees paid by the buyer account for more than 25 million.",
              pourquoi: "Après un comparatif (lower, less), le « que » se dit toujours than. That, as ou to ne conviennent pas.",
              regle: "<b>Comparatif + than</b> (lower than, less than).",
              ex: "The final price was lower than expected.",
              exfr: "Le prix final a été inférieur aux attentes.",
              lecon: { n: 22, ancre: "comp-court", titre: "Le comparatif des adjectifs courts" },
              carte: { fr: "inférieur à", en: "lower than (than après un comparatif)" }
            },
            {
              re: ["rest(ed|s)? (however |nevertheless |still )?(below|under|lower|inferior)"],
              type: "faux-sens",
              pts: 0.5,
              faux: "rested below the estimate",
              juste: "remained below the estimate",
              test: "The hammer price, 165 million dollars, nevertheless rested below the estimate, about 180 million: the fees paid by the buyer account for more than 25 million.",
              pourquoi: "Faux ami. To rest veut dire se reposer, ou reposer sur quelque chose. « Rester » (dans un état, à un niveau) se dit to remain ou to stay.",
              regle: "Rester (+ état, niveau) : <b>to remain, to stay</b>. To rest : se reposer.",
              ex: "Prices remained high all evening.",
              exfr: "Les prix sont restés élevés toute la soirée.",
              carte: { fr: "rester (à un niveau)", en: "to remain, to stay (to rest = se reposer)" }
            },
            {
              re: ["estimations?"],
              type: "faux-sens",
              pts: 0.25,
              faux: "below the estimation",
              juste: "below the estimate",
              test: "The hammer price, 165 million dollars, nevertheless remained below the estimation, about 180 million: the fees paid by the buyer account for more than 25 million.",
              pourquoi: "Estimation désigne en anglais l'opinion, le jugement que l'on porte (in my estimation, « à mon avis »). Le chiffre estimé d'une œuvre est an estimate, le nom formé sur le verbe to estimate.",
              regle: "L'estimation (un chiffre) : <b>an estimate</b>. In my estimation : à mon avis.",
              ex: "The painting sold above its high estimate.",
              exfr: "Le tableau s'est vendu au-dessus de son estimation haute.",
              carte: { fr: "une estimation (un chiffre)", en: "an estimate" }
            }
          ]
        },
        {
          fr: "les frais payés par l'acheteur",
          en: "the fees paid by the buyer",
          pourquoi: "Les frais (une commission) : fees, ou the buyer's premium dans le jargon des enchères. « Payés par » : le participe passé paid by, qui remplace la relative (which are paid by). Pay est irrégulier : pay, paid, paid.",
          pts: 0.75,
          ok: [
            "(the )?(fees|charges|commission|commissions|premium|costs|additional fees|extra fees|additional charges) (paid|payable|charged to|borne|owed) by the (buyer|purchaser|winning bidder|bidder|acquirer)",
            "(the )?(buyer's|purchaser's|winning bidder's) (fees|charges|commission|premium|costs)"
          ],
          fautes: [
            {
              re: ["payed"],
              type: "barbarisme",
              pts: 0.5,
              faux: "the fees payed by the buyer",
              juste: "the fees paid by the buyer",
              test: "The hammer price, 165 million dollars, nevertheless remained below the estimate, about 180 million: the fees payed by the buyer account for more than 25 million.",
              pourquoi: "Pay est irrégulier à l'écrit : pay, paid, paid (comme say, said, said). Payed ne s'emploie que dans un sens technique de la marine.",
              regle: "<b>Pay, paid, paid</b> ; <b>say, said, said</b> ; <b>lay, laid, laid</b>.",
              ex: "The buyer paid 190.4 million dollars in total.",
              exfr: "L'acheteur a payé 190,4 millions de dollars au total.",
              carte: { fr: "payer", en: "pay, paid, paid" }
            }
          ]
        },
        {
          fr: "représentent plus de 25 millions.",
          en: "account for more than 25 million",
          pourquoi: "« Représenter » une part d'un total : account for (ou amount to, make up). « Plus de » + nombre : more than, over. Le présent simple suffit : c'est un constat chiffré.",
          pts: 0.75,
          ok: [
            "(account|accounts|accounted|amount|amounts|amounted|come|comes|came|add up|adds up|added up) (for|to) (more than|over|upwards of|just over|in excess of|a little over|slightly more than|a little more than) (25 (million|m|mn)|25m|25mn|25000000)",
            "(represent|represents|represented|make up|makes up|made up|add|adds|added|total|totals|totaled|totalled|exceed|exceeds|top|tops) (more than|over|upwards of|just over|in excess of|a little over|slightly more than|a little more than) (25 (million|m|mn)|25m|25mn|25000000)",
            "(exceed|exceeds|top|tops) (25 (million|m|mn)|25m|25mn|25000000)"
          ],
          fautes: [
            {
              re: ["more (of|that|as) 25", "plus (of )?25"],
              type: "grammaire",
              pts: 0.5,
              faux: "more of 25 million",
              juste: "more than 25 million",
              test: "The hammer price, 165 million dollars, nevertheless remained below the estimate, about 180 million: the fees paid by the buyer account for more of 25 million.",
              pourquoi: "« Plus de » devant un nombre se dit more than (ou over). More of veut dire « davantage de » quelque chose dont on a déjà parlé (more of the same).",
              regle: "Plus de + nombre : <b>more than, over</b> (more than 25 million).",
              ex: "More than 700 million dollars changed hands that night.",
              exfr: "Plus de 700 millions de dollars ont changé de mains ce soir-là.",
              lecon: { n: 22, ancre: "comp-court", titre: "Le comparatif : more … than" },
              carte: { fr: "plus de (+ nombre)", en: "more than, over" }
            },
            {
              re: ["25 millions"],
              type: "grammaire",
              pts: 0.5,
              faux: "more than 25 millions",
              juste: "more than 25 million",
              test: "The hammer price, 165 million dollars, nevertheless remained below the estimate, about 180 million: the fees paid by the buyer account for more than 25 millions.",
              pourquoi: "Après un nombre, million ne prend pas de s, même quand le nom qui suit est sous-entendu (25 million, sous-entendu dollars).",
              regle: "<b>Nombre + million</b>, toujours sans s.",
              ex: "The fees came to 25.4 million dollars.",
              exfr: "Les frais se sont élevés à 25,4 millions de dollars.",
              lecon: { n: 11, ancre: "grands-nombres", titre: "Les grands nombres : million" },
              carte: { fr: "25 millions", en: "25 million (million invariable)" }
            },
            {
              re: ["account(s|ed)? to"],
              type: "grammaire",
              pts: 0.5,
              faux: "the fees account to 25 million",
              juste: "the fees account for 25 million",
              test: "The hammer price, 165 million dollars, nevertheless remained below the estimate, about 180 million: the fees paid by the buyer account to more than 25 million.",
              pourquoi: "Account se construit avec for (account for, représenter). C'est amount qui prend to (amount to, s'élever à) : les deux verbes ne s'échangent pas leurs prépositions.",
              regle: "<b>Account for</b> (représenter une part), <b>amount to</b> (s'élever à).",
              ex: "Fees account for about 13% of the final price.",
              exfr: "Les frais représentent environ 13 % du prix final.",
              carte: { fr: "représenter (une part)", en: "to account for" }
            }
          ]
        }
      ]
    },
    {
      fr: "Selon la presse, l'acheteur est le [[marchand d'art]] new-yorkais William Acquavella, mais ((on ne sait pas s'))il a acheté la toile pour lui-même ou pour un client.",
      cartes: [
        { id: "64cb40d8ef", fr: "on ne sait pas si", en: "it is unclear whether", re: "it (is|remains|was) (still )?unclear (whether|if)" }
      ],
      aides: [
        { fr: "un marchand d'art", en: "an art dealer" }
      ],
      proposition: "According to the press, the buyer is the New York art dealer William Acquavella, but it is unclear whether he bought the painting for himself or for a client.",
      autres: [
        "According to press reports, the buyer is William Acquavella, a New York art dealer, but it is unclear whether he bought the canvas for himself or on behalf of a client."
      ],
      tests: [
        "The press reports that the buyer is New York art dealer William Acquavella, but it remains unclear whether he purchased the work for himself or for a client.",
        "According to the media, the buyer was the New York-based art dealer William Acquavella, but nobody knows if he acquired the painting for himself or for a customer."
      ],
      morceaux: [
        {
          fr: "Selon la presse,",
          en: "According to the press",
          pourquoi: "« Selon » : according to, toujours suivi de to. La presse : the press, ou press reports, the media.",
          pts: 0.5,
          ok: [
            "according to (the )?(press|media|newspapers|press reports|reports|news reports|the new york times)",
            "(the )?(press|media|newspapers) (reports?|reported|say|says|said|claims?)( that)?",
            "(press|media|news) reports (say|said|suggest|suggested|indicate)( that)?",
            "reportedly"
          ],
          fautes: [
            {
              re: ["according (the|press|media|newspapers|reports)"],
              type: "grammaire",
              pts: 0.5,
              faux: "According the press",
              juste: "According to the press",
              test: "According the press, the buyer is the New York art dealer William Acquavella, but it is unclear whether he bought the painting for himself or for a client.",
              pourquoi: "According ne s'emploie jamais seul devant un nom : c'est la locution according to qui veut dire « selon ». Sans to, la phrase est bancale.",
              regle: "Selon : <b>according to</b> + nom (according to the press, according to Sotheby's).",
              ex: "According to Sotheby's, the deal was reached the day before.",
              exfr: "Selon Sotheby's, l'accord a été trouvé la veille.",
              carte: { fr: "selon", en: "according to" }
            },
            {
              re: ["(following|after|selon) the (press|media|newspapers)"],
              type: "gallicisme",
              pts: 0.5,
              faux: "Following the press",
              juste: "According to the press",
              test: "Following the press, the buyer is the New York art dealer William Acquavella, but it is unclear whether he bought the painting for himself or for a client.",
              pourquoi: "Following veut dire « après, à la suite de » : following the press ferait penser à un événement qui suit la parution des journaux. Pour citer une source, l'anglais dit according to.",
              regle: "Selon (une source) : <b>according to</b>. Following : à la suite de.",
              ex: "Following the sale, Sotheby's shares rose.",
              exfr: "À la suite de la vente, les actions de Sotheby's ont progressé.",
              carte: { fr: "selon (une source)", en: "according to (following = à la suite de)" }
            }
          ]
        },
        {
          fr: "l'acheteur est le marchand d'art new-yorkais William Acquavella,",
          en: "the buyer is the New York art dealer William Acquavella",
          pourquoi: "Un marchand d'art : an art dealer (a dealer achète et revend). « New-yorkais » : le nom de la ville sert d'adjectif, sans changer de forme (a New York dealer), placé devant le nom.",
          pts: 1.25,
          ok: [
            "(buyer|purchaser|winning bidder|new owner|successful bidder|acquirer) (is|was|is said to be|was said to be|is reportedly|was reportedly|is believed to be|was believed to be|was identified as|has been identified as|is identified as|was named as|is named as) (the )?(new york( city)?( based)? |manhattan( based)? |new york's |american )?(art )?dealer william acquavella",
            "(buyer|purchaser|winning bidder|new owner|successful bidder|acquirer) (is|was|is said to be|was said to be|is reportedly|was reportedly|is believed to be|was believed to be|was identified as|has been identified as|is identified as|was named as|is named as) william acquavella,? (a|the) (new york( city)?( based)? |manhattan( based)? |american )?(art )?dealer"
          ],
          fautes: [
            {
              re: ["new yorkais", "new yorker (art )?dealer", "dealer new yorker"],
              type: "grammaire",
              pts: 0.5,
              faux: "the New Yorker art dealer",
              juste: "the New York art dealer",
              test: "According to the press, the buyer is the New Yorker art dealer William Acquavella, but it is unclear whether he bought the painting for himself or for a client.",
              pourquoi: "A New Yorker est un nom : un habitant de New York (et un magazine). Pour l'adjectif, l'anglais emploie le nom de la ville tel quel, devant le nom : a New York dealer, a London gallery.",
              regle: "<b>Nom de ville + nom</b> : a New York dealer, a Paris museum. A New Yorker : un New-Yorkais.",
              ex: "A London gallery bought two of the paintings.",
              exfr: "Une galerie londonienne a acheté deux des tableaux.",
              carte: { fr: "un marchand new-yorkais", en: "a New York dealer" }
            },
            {
              re: ["dealer of art", "merchants? of art"],
              type: "gallicisme",
              pts: 0.25,
              faux: "the dealer of art William Acquavella",
              juste: "the art dealer William Acquavella",
              test: "According to the press, the buyer is the New York dealer of art William Acquavella, but it is unclear whether he bought the painting for himself or for a client.",
              pourquoi: "« Marchand d'art » ne se calque pas avec of : l'anglais forme un nom composé, an art dealer, le nom qui précise (art) devant.",
              regle: "<b>Nom + nom</b> : an art dealer, an art market, an auction house.",
              ex: "The art dealer refused to name his client.",
              exfr: "Le marchand d'art a refusé de nommer son client.",
              carte: { fr: "un marchand d'art", en: "an art dealer" }
            }
          ]
        },
        {
          fr: "mais on ne sait pas s'il a acheté la toile",
          en: "but it is unclear whether he bought the painting",
          pourquoi: "« On ne sait pas si » : it is unclear whether (ou it is not known whether), sans le « on » français. Whether (ou if) introduit l'interrogation indirecte, sans inversion du sujet. Bought, au prétérit : l'achat a eu lieu le 18 novembre.",
          pts: 1.25,
          ok: [
            "(it is|it remains|it was|it is still|it remains still) (unclear|not clear|not known|unknown|uncertain) (whether|if) he (bought|purchased|acquired|has bought|has purchased|has acquired|was buying|was bidding|bid)( it| the painting| the canvas| the work| the picture| the artwork| the landscape)?",
            "(nobody|no 1|we do not) knows? (whether|if) he (bought|purchased|acquired|has bought|has purchased|has acquired|was buying|was bidding|bid)( it| the painting| the canvas| the work| the picture| the artwork| the landscape)?",
            "(it has not been|it was not|it has never been) (disclosed|revealed|made clear|said) (whether|if) he (bought|purchased|acquired|was buying|was bidding|bid)( it| the painting| the canvas| the work| the picture| the artwork| the landscape)?",
            "he (has not said|did not say|declined to say|refused to say|would not say|has declined to say|has refused to say) (whether|if) he (bought|purchased|acquired|was buying|was bidding|bid)( it| the painting| the canvas| the work| the picture| the artwork| the landscape)?"
          ],
          fautes: [
            {
              re: ["1 (does not|do not|can not) know", "1 knows not", "on ne sait"],
              type: "gallicisme",
              pts: 0.5,
              faux: "but one does not know if he bought the painting",
              juste: "but it is unclear whether he bought the painting",
              test: "According to the press, the buyer is the New York art dealer William Acquavella, but one does not know if he bought the painting for himself or for a client.",
              pourquoi: "Le « on » français ne se calque pas par one dans la presse : one does not know sonne précieux et vieilli. L'anglais dit it is unclear whether, it is not known whether, ou tourne au passif.",
              regle: "On ne sait pas si : <b>it is unclear whether</b>, <b>it is not known whether</b>.",
              ex: "It is unclear whether the heirs received any money.",
              exfr: "On ne sait pas si les héritiers ont reçu de l'argent.",
              carte: { fr: "on ne sait pas si", en: "it is unclear whether" }
            },
            {
              re: ["(whether|if) (did|has|had|does) he"],
              type: "grammaire",
              pts: 0.5,
              faux: "it is unclear whether did he buy the painting",
              juste: "it is unclear whether he bought the painting",
              test: "According to the press, the buyer is the New York art dealer William Acquavella, but it is unclear whether did he buy the painting for himself or for a client.",
              pourquoi: "Dans une interrogation indirecte (après whether, if, what…), on ne fait pas l'inversion de la question directe : sujet puis verbe, comme dans une affirmation (whether he bought).",
              regle: "Interrogation indirecte : <b>whether / if + sujet + verbe</b>, sans auxiliaire do ni inversion.",
              ex: "Nobody knows who the final owner is.",
              exfr: "Personne ne sait qui est le propriétaire final.",
              carte: { fr: "on ne sait pas s'il a acheté", en: "it is unclear whether he bought (sans inversion)" }
            },
            {
              re: ["(unclear|not clear|not known|unknown) that"],
              type: "grammaire",
              pts: 0.5,
              faux: "it is unclear that he bought the painting",
              juste: "it is unclear whether he bought the painting",
              test: "According to the press, the buyer is the New York art dealer William Acquavella, but it is unclear that he bought the painting for himself or for a client.",
              pourquoi: "« Si » (une question : oui ou non ?) se dit whether ou if. That introduit un fait affirmé : it is unclear that he bought ferait douter qu'il ait acheté le tableau, ce qui est un autre sens.",
              regle: "Question indirecte : <b>whether / if</b>. Fait affirmé : <b>that</b>.",
              ex: "It remains to be seen whether prices will recover.",
              exfr: "Reste à savoir si les prix vont remonter.",
              carte: { fr: "si (question indirecte)", en: "whether, if (pas that)" }
            }
          ]
        },
        {
          fr: "pour lui-même ou pour un client.",
          en: "for himself or for a client",
          pourquoi: "« Lui-même » renvoie au sujet (il a acheté pour lui) : le pronom réfléchi, himself. Un client : a client (d'un professionnel), ou a customer ; on peut aussi dire on behalf of a client.",
          pts: 1,
          ok: [
            "for himself or (for |on behalf of |as an agent for |for 1 of his |on behalf of 1 of his )?(a |an |another )?(client|customer|collector|buyer|third party|private client|private collector)s?",
            "(on his own behalf|for his own (collection|account)|for his own sake) or (for|on behalf of|as an agent for) (a |an |another )?(client|customer|collector|buyer|third party|private client|private collector)"
          ],
          fautes: [
            {
              re: ["for (him|itself|herself|he) or", "him self"],
              type: "grammaire",
              pts: 0.5,
              faux: "for him or for a client",
              juste: "for himself or for a client",
              test: "According to the press, the buyer is the New York art dealer William Acquavella, but it is unclear whether he bought the painting for him or for a client.",
              pourquoi: "Quand le complément désigne la même personne que le sujet (il a acheté pour lui), l'anglais emploie le pronom réfléchi : himself. For him ferait penser à une autre personne.",
              regle: "Même personne que le sujet : <b>pronom réfléchi</b> (himself, herself, themselves).",
              ex: "The collector kept the painting for himself.",
              exfr: "Le collectionneur a gardé le tableau pour lui.",
              lecon: { n: 3, ancre: "reflechis", titre: "Les pronoms réfléchis" },
              carte: { fr: "pour lui-même", en: "for himself" }
            },
            {
              re: ["costumers?"],
              type: "barbarisme",
              pts: 0.5,
              faux: "for a costumer",
              juste: "for a customer / for a client",
              test: "According to the press, the buyer is the New York art dealer William Acquavella, but it is unclear whether he bought the painting for himself or for a costumer.",
              pourquoi: "A costumer est celui qui fait ou loue des costumes de théâtre. Le client se dit a customer (u après le c) ou, pour un professionnel comme un marchand, a client.",
              regle: "Un client : <b>a customer</b> (commerce), <b>a client</b> (professionnel). Costume : un costume.",
              ex: "The dealer often bids on behalf of his clients.",
              exfr: "Le marchand enchérit souvent pour le compte de ses clients.",
              carte: { fr: "un client", en: "a customer, a client" }
            }
          ]
        }
      ]
    },
    {
      fr: "Le directeur général de Sotheby's ((affirme avec force que)) la [[polémique]] n'a pas ((pesé sur)) les enchères, même si un peu plus d'un tiers des œuvres de la soirée sont parties sous leur estimation.",
      cartes: [
        { id: "5409676ccc", fr: "affirmer avec force que", en: "to insist that", re: "insist(s|ed)?" },
        { id: "617e19cd01", fr: "peser sur", en: "to weigh on", re: "weigh(s|ed)? (on|upon)" }
      ],
      aides: [
        { fr: "une polémique, une controverse", en: "a controversy, a row" }
      ],
      proposition: "Sotheby's chief executive insists that the controversy did not weigh on the bidding, even though a little over a third of the evening's works sold below their estimates.",
      autres: [
        "The chief executive of Sotheby's insists that the controversy has not weighed on the auction, even though slightly more than a third of the works on offer that evening went for less than their estimate."
      ],
      tests: [
        "Sotheby's CEO, Charles Stewart, maintains that the row did not weigh on the sale, even though just over a third of the night's lots sold under their estimates.",
        "Sotheby's boss is adamant that the controversy has not weighed on the auction, although a little more than one third of the evening's works were sold below their estimate."
      ],
      morceaux: [
        {
          fr: "Le directeur général de Sotheby's",
          en: "Sotheby's chief executive",
          pourquoi: "Le directeur général d'une entreprise : the chief executive (officer), CEO, ou the boss dans la presse. Le génitif (Sotheby's chief executive) ou of (the chief executive of Sotheby's) conviennent.",
          pts: 0.75,
          ok: [
            "sotheby's (chief executive( officer)?|ceo|managing director|director general|boss|head|chief|president|executive director|chairman and chief executive)",
            "the (chief executive( officer)?|ceo|managing director|director general|boss|head|chief|president|executive director) of sotheby's"
          ],
          fautes: [
            {
              re: ["general director", "directeur"],
              type: "gallicisme",
              pts: 0.5,
              faux: "the general director of Sotheby's",
              juste: "Sotheby's chief executive",
              test: "The general director of Sotheby's insists that the controversy did not weigh on the bidding, even though a little over a third of the evening's works sold below their estimates.",
              pourquoi: "« Directeur général » ne se calque pas mot à mot : pour une entreprise, l'anglais dit chief executive (CEO), ou managing director au Royaume-Uni. General director n'est employé que pour quelques institutions culturelles (un opéra).",
              regle: "Le directeur général (d'une entreprise) : <b>the chief executive, the CEO</b>.",
              ex: "Sotheby's chief executive called the result a record.",
              exfr: "Le directeur général de Sotheby's a parlé d'un résultat record.",
              carte: { fr: "le directeur général", en: "the chief executive, the CEO" }
            }
          ]
        },
        {
          fr: "affirme avec force que",
          en: "insists that",
          pourquoi: "« Affirmer avec force que » : insist that (ou maintain that, be adamant that), un seul verbe qui contient l'idée de force. Le sujet est à la 3e personne du singulier : insists.",
          pts: 1,
          ok: [
            "(insists|insisted|maintains|maintained|asserts|asserted|stresses|stressed|is adamant|was adamant|argues|argued|firmly (says|said|states|stated|maintains|asserts|believes)|strongly (maintains|asserts|denies|insists)|emphatically (says|states|denies)|forcefully (says|states|argues|maintains|insists|asserts)|says firmly|said firmly)( that)?"
          ],
          fautes: [
            {
              re: ["with (force|strength)", "force that"],
              type: "gallicisme",
              pts: 0.5,
              faux: "affirms with force that",
              juste: "insists that",
              test: "Sotheby's chief executive affirms with force that the controversy did not weigh on the bidding, even though a little over a third of the evening's works sold below their estimates.",
              pourquoi: "« Avec force » ne se calque pas : with force évoque la force physique. L'anglais exprime l'insistance par le verbe lui-même (insist, maintain) ou par un adverbe (firmly, forcefully).",
              regle: "Affirmer avec force : <b>to insist that, to maintain that, to be adamant that</b>.",
              ex: "The minister insists that the reform will go ahead.",
              exfr: "La ministre affirme avec force que la réforme se fera.",
              carte: { fr: "affirmer avec force que", en: "to insist that" }
            },
            {
              re: ["(ceo|executive|director|boss|head|chief|president|officer) (insist|maintain|assert|stress) that"],
              type: "grammaire",
              pts: 0.5,
              faux: "Sotheby's chief executive insist that",
              juste: "Sotheby's chief executive insists that",
              test: "Sotheby's chief executive insist that the controversy did not weigh on the bidding, even though a little over a third of the evening's works sold below their estimates.",
              pourquoi: "Au présent simple, la 3e personne du singulier (he, she, it, ou un nom singulier comme the chief executive) prend un s : insists.",
              regle: "Présent simple : <b>-s à la 3e personne du singulier</b> (he insists, the CEO insists).",
              ex: "The auction house insists that the sale was fair.",
              exfr: "La maison de ventes affirme que la vente était équitable.",
              carte: { fr: "il affirme que", en: "he insists that (-s)" }
            }
          ]
        },
        {
          fr: "la polémique n'a pas pesé sur les enchères,",
          en: "the controversy did not weigh on the bidding",
          pourquoi: "Une polémique : a controversy (ou a row, a dispute). « Peser sur » : weigh on, avec on. Le prétérit (did not weigh) situe la vente dans le passé ; le present perfect (has not weighed) est aussi juste, car le directeur parle d'un bilan.",
          pts: 1.25,
          ok: [
            "(the|this) (controversy|row|dispute|ownership dispute|restitution dispute|quarrel|debate|argument|legal dispute|restitution claim|claim|affair|controversy over (the painting's|its) (past|history|provenance)) (did not|has not|had not|does not|never) (weigh|weighed) (on|upon|down on) (the )?(auction|auctions|bidding|bids|sale|sales|prices|results|evening)",
            "(the|this) (controversy|row|dispute|ownership dispute|restitution dispute|quarrel|debate|argument|legal dispute|restitution claim|claim|affair) (did not|has not|had not|does not|never) (affect|affected|hurt|dampen|dampened|harm|harmed|damage|damaged|have an impact on|had an impact on|have any impact on|had any impact on|impact|impacted|influence|influenced|have an effect on|had an effect on|have any effect on|had any effect on) the (auction|bidding|bids|sale|sales|prices|results)"
          ],
          fautes: [
            {
              re: ["polemics?", "polemique"],
              type: "faux-sens",
              pts: 0.5,
              faux: "the polemic did not weigh on the bidding",
              juste: "the controversy did not weigh on the bidding",
              test: "Sotheby's chief executive insists that the polemic did not weigh on the bidding, even though a little over a third of the evening's works sold below their estimates.",
              pourquoi: "A polemic est un texte ou un discours violemment critique (un pamphlet). Une polémique, au sens d'un débat public qui enflamme les esprits, se dit a controversy ou, dans la presse britannique, a row.",
              regle: "Une polémique : <b>a controversy, a row</b>. A polemic : un pamphlet.",
              ex: "The sale sparked a controversy over Nazi-looted art.",
              exfr: "La vente a déclenché une polémique sur l'art spolié par les nazis.",
              carte: { fr: "une polémique", en: "a controversy, a row" }
            },
            {
              re: ["(weigh|weighs|weighed) (the|over the) (auction|auctions|bidding|bids|sale|sales|prices|results)"],
              type: "grammaire",
              pts: 0.5,
              faux: "the controversy did not weigh the bidding",
              juste: "the controversy did not weigh on the bidding",
              test: "Sotheby's chief executive insists that the controversy did not weigh the bidding, even though a little over a third of the evening's works sold below their estimates.",
              pourquoi: "Sans on, weigh veut dire peser au sens de mesurer le poids (weigh the luggage) ou de soupeser (weigh the options). Pour « peser sur », exercer une pression, il faut weigh on.",
              regle: "Peser sur : <b>to weigh on</b>. To weigh sth : peser, soupeser quelque chose.",
              ex: "Uncertainty is weighing on the art market.",
              exfr: "L'incertitude pèse sur le marché de l'art.",
              carte: { fr: "peser sur", en: "to weigh on" }
            },
            {
              re: ["(did|does) not (weighed|weighted|weighs)", "weighted (on|upon)"],
              type: "grammaire",
              pts: 0.5,
              faux: "the controversy did not weighed on the bidding",
              juste: "the controversy did not weigh on the bidding",
              test: "Sotheby's chief executive insists that the controversy did not weighed on the bidding, even though a little over a third of the evening's works sold below their estimates.",
              pourquoi: "Après l'auxiliaire did (ou does), le verbe reste à la base verbale : c'est did qui porte le passé. Did not weighed marque deux fois le temps. Weighted est un autre verbe (pondérer).",
              regle: "<b>Did not + base verbale</b> (did not weigh, did not sell).",
              ex: "The news did not affect the price.",
              exfr: "La nouvelle n'a pas eu d'effet sur le prix.",
              lecon: { n: 13, ancre: "formation", titre: "La formation du prétérit" },
              carte: { fr: "n'a pas pesé", en: "did not weigh (base verbale après did)" }
            }
          ]
        },
        {
          fr: "même si un peu plus d'un tiers des œuvres de la soirée sont parties sous leur estimation.",
          en: "even though a little over a third of the evening's works sold below their estimates",
          pourquoi: "« Même si », devant un fait réel : even though (ou although). « Un peu plus d'un tiers » : a little over a third, a third (ou one third) sans the. « Partir sous » une estimation : sell below, go for less than.",
          pts: 1,
          ok: [
            "(even though|although|though|while|whereas|even as|despite the fact that|but|yet) (a little (over|more than) |slightly (over|more than) |just (over|more than) |a bit (over|more than) |little more than |more than |over |upwards of )?(a|1) third of( [^ ]+){1,10}? (below|under|beneath|short of|less than|lower than) (their |the |its )?(low |pre sale |presale )?(estimates?|expectations|valuations?|estimated (prices?|values?))"
          ],
          fautes: [
            {
              re: ["even if"],
              type: "faux-sens",
              pts: 0.5,
              faux: "even if a little over a third of the works sold below their estimates",
              juste: "even though a little over a third of the works sold below their estimates",
              test: "Sotheby's chief executive insists that the controversy did not weigh on the bidding, even if a little over a third of the evening's works sold below their estimates.",
              pourquoi: "Even if introduit une hypothèse (« même dans le cas où ») : l'anglophone comprendrait qu'on ne sait pas si les œuvres sont parties sous leur estimation. Pour un fait réel, constaté, « même si » se dit even though (ou although).",
              regle: "Fait réel : <b>even though, although</b>. Hypothèse : <b>even if</b>.",
              ex: "The record was broken, even though bidding was slow.",
              exfr: "Le record a été battu, même si les enchères ont été lentes.",
              lecon: { n: 27, ancre: "concession", titre: "La concession : although, even though" },
              carte: { fr: "même si (fait réel)", en: "even though (even if = hypothèse)" }
            },
            {
              re: ["(more than|over|a little more than) the third", "the third of the"],
              type: "gallicisme",
              pts: 0.5,
              faux: "a little more than the third of the works",
              juste: "a little more than a third of the works",
              test: "Sotheby's chief executive insists that the controversy did not weigh on the bidding, even though a little more than the third of the evening's works sold below their estimates.",
              pourquoi: "Une fraction se dit avec a (ou one) : a third, a quarter. The third voudrait dire « le troisième » (un rang), et « le tiers de » ne se calque pas.",
              regle: "Une fraction : <b>a / one + ordinal</b> (a third, two thirds, a quarter).",
              ex: "A third of the lots sold below their low estimate.",
              exfr: "Un tiers des lots se sont vendus sous leur estimation basse.",
              carte: { fr: "un tiers de", en: "a third of" }
            },
            {
              re: ["tiers?"],
              type: "faux-sens",
              pts: 0.5,
              faux: "a little over a tier of the works",
              juste: "a little over a third of the works",
              test: "Sotheby's chief executive insists that the controversy did not weigh on the bidding, even though a little over a tier of the evening's works sold below their estimates.",
              pourquoi: "A tier est un étage, un niveau (a two-tier system, un système à deux vitesses), pas une fraction. Le tiers (un sur trois) se dit a third.",
              regle: "Un tiers : <b>a third</b>. A tier : un niveau, un étage.",
              ex: "Two thirds of the works found a buyer.",
              exfr: "Deux tiers des œuvres ont trouvé preneur.",
              carte: { fr: "un tiers", en: "a third (a tier = un niveau)" }
            }
          ]
        }
      ]
    }
  ]
};
