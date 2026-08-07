#!/usr/bin/env bash
# ================================================================================================
# session-start.sh — deja lista una sesión remota de Claude Code (claude.ai/code) sobre NaturDex.
# ------------------------------------------------------------------------------------------------
# El contenedor de una sesión remota nace con el repo recién clonado y SIN node_modules, así que
# `npm run validate` —que es la red de seguridad de todo el rollout— fallaba nada más empezar. Esto
# instala lo justo para que las comprobaciones del proyecto se puedan ejecutar desde el primer turno.
#
# Solo corre en remoto: en local ya tienes tu entorno montado y no hace falta que nadie te lo toque.
#
# Es idempotente: el estado del contenedor se cachea tras la primera ejecución, así que en las
# sesiones siguientes los `npm install` no descargan nada y terminan en un segundo. Por eso se usa
# `npm install` y no `npm ci`, que borraría node_modules entero cada vez.
# ================================================================================================
set -euo pipefail

# En local no hacemos nada.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$ROOT"

echo "[naturdex] preparando la sesión remota…"

# --- Dependencias -------------------------------------------------------------------------------
# Dos proyectos npm independientes: la raíz (herramientas de datos, una sola dependencia) y
# AdminPanel (React + Vite + TypeScript), que es donde vive el `tsc --noEmit` que hace de linter.
echo "[naturdex] npm install (raíz)"
npm install --no-audit --no-fund --loglevel=error

if [ -f AdminPanel/package.json ]; then
  echo "[naturdex] npm install (AdminPanel)"
  (cd AdminPanel && npm install --no-audit --no-fund --loglevel=error)
fi

# --- Hook de pre-commit del proyecto ------------------------------------------------------------
# `.githooks/pre-commit` bloquea el commit si `validate-park-data.js` encuentra errores. Es lo que
# evita subir un parque con los contadores descuadrados o un límite mal proyectado, y en una sesión
# remota hace la misma falta que en local. Su parte de volcado de la BD es tolerante: si no hay
# contenedor MySQL —que es siempre el caso aquí— avisa y sigue, no bloquea nada.
if [ -d .githooks ]; then
  git config core.hooksPath .githooks
  echo "[naturdex] hooks de git activados (core.hooksPath=.githooks)"
fi

# --- Aviso sobre lo que NO se puede hacer aquí --------------------------------------------------
# Casi todas las herramientas de `Tools/` salen a fuentes externas (Wikimedia, GBIF, Overpass, EIDOS,
# IGME, IMIDA, Protomaps). Si la política de egreso del entorno no las permite, fallan con timeout y
# cuesta un buen rato entender por qué. `npm run red:check` lo dice en diez segundos.
echo "[naturdex] listo. Para saber qué fuentes externas están abiertas hoy: npm run red:check"
