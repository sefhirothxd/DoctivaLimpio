#!/usr/bin/env bash
# ------------------------------------------------------------------
# Genera un paquete de entrega limpio (solo código fuente).
# Excluye: node_modules, dist, .git, .env y zips previos.
# Uso:  bash scripts/pack.sh
# ------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/.."

STAMP="$(date +%Y%m%d-%H%M%S)"
NAME="intranet-handoff-${STAMP}"

if command -v zip >/dev/null 2>&1; then
  OUT="${NAME}.zip"
  zip -rq "$OUT" . \
    -x "node_modules/*" \
    -x "dist/*" \
    -x ".git/*" \
    -x ".env" \
    -x "*.zip" \
    -x "*.tar.gz"
else
  OUT="${NAME}.tar.gz"
  tar \
    --exclude='./node_modules' \
    --exclude='./dist' \
    --exclude='./.git' \
    --exclude='./.env' \
    --exclude='./*.zip' \
    -czf "$OUT" .
  echo "zip no disponible: se generó un .tar.gz equivalente."
fi

SIZE="$(du -h "$OUT" | cut -f1)"
echo ""
echo "✔ Paquete listo: $OUT ($SIZE)"
echo "  Contiene solo código fuente, esquema SQL y documentación."
echo "  Quien lo reciba debe ejecutar: npm install && npm run dev"
