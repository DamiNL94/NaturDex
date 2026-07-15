#!/usr/bin/env bash
# NaturDex · db-sync (envoltorio POSIX)
# Reenvía a Tools/db-sync/db-sync.js con Node. Uso:  ./Tools/db-sync/db-sync.sh status
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE="$(command -v node || true)"
if [ -z "$NODE" ] && [ -x "/c/Program Files/nodejs/node.exe" ]; then
  NODE="/c/Program Files/nodejs/node.exe"
fi
if [ -z "$NODE" ]; then
  echo "No se encuentra Node.js en el PATH." >&2
  exit 1
fi
exec "$NODE" "$DIR/db-sync.js" "$@"
