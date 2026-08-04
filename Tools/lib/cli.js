'use strict';
/*
 * cli.js — lectura de argumentos de línea de órdenes, común a todo el tooling de NaturDex.
 *
 * Por qué existe: catorce scripts tenían su propio `arg()`/`flag()` de una línea, y no eran
 * equivalentes. Unos esperaban el nombre con guiones (`flag('--park')`) y otros sin ellos
 * (`arg('park')`); unos aceptaban `--park=<slug>` y otros no; y la variante más extendida
 * —`i >= 0 && argv[i+1] ? argv[i+1] : def`— trata `--top 0` como si no se hubiera pasado, porque
 * `'0'` es una cadena con valor de verdad... salvo que sea justo la cadena vacía. Aquí hay una sola
 * implementación y admite las dos convenciones de nombre y las dos formas (`--x v` y `--x=v`).
 *
 * Uso:
 *     const { arg, flag, requireArgs, die, sleep } = require('../lib/cli');
 *     const PARK = arg('park');                    // --park <slug>  o  --park=<slug>
 *     const DRY  = flag('dry');                    // --dry
 *     requireArgs('Uso: --park <slug> [--dry]', { park: PARK });
 */

// Normaliza el nombre de una opción: `--park`, `-park` y `park` son la misma cosa.
const clean = (name) => String(name).replace(/^-+/, '');

/**
 * Valor de una opción con argumento. Admite `--nombre valor` y `--nombre=valor`.
 * Devuelve `def` si la opción no aparece o aparece sin valor.
 */
function arg(name, def = null, argv = process.argv.slice(2)) {
  const key = clean(name);
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('-')) continue;
    const bare = clean(token);
    if (bare === key) {
      const next = argv[i + 1];
      // Un valor que empieza por `-` es la siguiente opción, no el valor de ésta.
      return next !== undefined && !next.startsWith('-') ? next : def;
    }
    if (bare.startsWith(key + '=')) return bare.slice(key.length + 1);
  }
  return def;
}

/** Valor numérico de una opción (`def` si falta o no es un número). */
function num(name, def = null, argv = process.argv.slice(2)) {
  const raw = arg(name, null, argv);
  if (raw === null) return def;
  const n = Number(raw);
  return Number.isFinite(n) ? n : def;
}

/** ¿Está presente la opción booleana? (`--dry`, `--write`, `--refresh`…) */
function flag(name, argv = process.argv.slice(2)) {
  const key = clean(name);
  return argv.some(t => t.startsWith('-') && clean(t) === key);
}

/** Aborta con un mensaje de error en stderr. Código 2 = uso incorrecto (convención de POSIX). */
function die(message, code = 2) {
  console.error('✖ ' + message);
  process.exit(code);
}

/**
 * Exige que las opciones dadas tengan valor. `valores` es un objeto {nombre: valor}; se listan
 * TODAS las que faltan de una vez, en vez de obligar a descubrirlas de una en una.
 */
function requireArgs(usage, valores) {
  const faltan = Object.keys(valores).filter(k => valores[k] === null || valores[k] === undefined || valores[k] === '');
  if (faltan.length) die(`falta${faltan.length > 1 ? 'n' : ''} --${faltan.join(', --')}\n${usage}`);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

module.exports = { arg, num, flag, die, requireArgs, sleep };
