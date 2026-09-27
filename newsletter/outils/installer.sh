#!/usr/bin/env bash
# Prépare l'environnement des newsletters (lancé au démarrage de chaque session
# Claude Code via .claude/settings.json). Rapide si tout est déjà installé.
if python3 -c "import playwright, pypdf, PIL" 2>/dev/null; then
  exit 0
fi
pip install -q playwright pypdf pillow >/dev/null 2>&1 \
  || pip install -q --break-system-packages playwright pypdf pillow >/dev/null 2>&1 \
  || echo "newsletter : installation de playwright/pypdf/pillow impossible (réseau ?)" >&2
# Navigateur : déjà présent dans le cloud (/opt/pw-browsers) ; sinon on tente le téléchargement.
if [ ! -e /opt/pw-browsers ] && [ -z "$CHROMIUM_PATH" ]; then
  python3 -m playwright install chromium >/dev/null 2>&1 || true
fi
exit 0
