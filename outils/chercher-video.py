#!/usr/bin/env python3
"""Cherche des vidéos YouTube récentes sur un sujet (résultats triés par date de mise en ligne) :
python3 outils/chercher-video.py "<mots de recherche>" [nombre]

Affiche : identifiant, chaîne, titre, âge, durée. Choisir une chaîne d'information sérieuse
(France 24, AFP, AP, Reuters, BBC, CNA, euronews, DW, Al Jazeera, RTVE…), jamais une chaîne
d'agrégation. Vérifier ensuite titre et chaîne avec l'oEmbed (voir CLAUDE.md, section 3)."""
import json, re, subprocess, sys, urllib.parse


def chercher(requete):
    url = ("https://www.youtube.com/results?search_query=" + urllib.parse.quote(requete) + "&sp=CAI%253D")
    html = subprocess.run(["curl", "-sL", "-m", "30", "-A", "Mozilla/5.0", "-b", "CONSENT=YES+1", url],
                          capture_output=True, text=True).stdout
    m = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S)
    if not m:
        return []
    resultats = []

    def parcourir(o):
        if isinstance(o, dict):
            if "videoRenderer" in o:
                v = o["videoRenderer"]
                titre = "".join(r["text"] for r in v["title"]["runs"])
                chaine = "".join(r["text"] for r in v.get("ownerText", {}).get("runs", []))
                resultats.append((v["videoId"], chaine, titre, v.get("publishedTimeText", {}).get("simpleText", ""),
                                  v.get("lengthText", {}).get("simpleText", "")))
            for x in o.values():
                parcourir(x)
        elif isinstance(o, list):
            for x in o:
                parcourir(x)

    parcourir(json.loads(m.group(1)))
    return resultats


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    for r in chercher(sys.argv[1])[:n]:
        print(" | ".join(r))
