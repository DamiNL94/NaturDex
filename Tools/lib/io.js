'use strict';
/*
 * io.js — rutas del repositorio y lectura/escritura de JSON, común a todo el tooling.
 *
 * Las quince herramientas calculaban la raíz del repositorio por su cuenta (`path.join(__dirname,
 * '..')` o `'..', '..'` según en qué carpeta vivieran) y cada una tenía su `leer`/`readJson`. Eso
 * ataba el script a su ubicación: mover uno de `Tools/` a `Tools/catalogo-nacional/` rompía todas
 * sus rutas en silencio. Aquí la raíz se resuelve una vez, desde la posición de este fichero.
 *
 * `writeJson` escribe con indentación de 2 y salto final, que es el formato de todos los JSON
 * versionados del repo: si un script escribiera de otra forma, cada ejecución produciría un diff
 * completo del fichero aunque no cambiara ningún dato.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const FRONTEND = path.join(ROOT, 'Frontend');
const DATA = path.join(FRONTEND, 'Data');
const PARKS_DIR = path.join(DATA, 'parks');
const REGISTRY_FILE = path.join(DATA, 'parks-index.json');
const DATABASE = path.join(ROOT, 'Database');
const CATALOGO_DIR = path.join(ROOT, 'Tools', 'catalogo-nacional');
const OUT_DIR = path.join(CATALOGO_DIR, 'out');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Igual que readJson pero devuelve `def` si el fichero no existe (no si está corrupto). */
function readJsonIf(file, def = null) {
  return fs.existsSync(file) ? readJson(file) : def;
}

/** Escribe JSON con el formato canónico del repo (2 espacios + salto final) creando la carpeta. */
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

/** Ruta relativa a la raíz del repo, para los mensajes de consola. */
const rel = (file) => path.relative(ROOT, file);

/** Resuelve una ruta dada por el usuario: absoluta tal cual, relativa contra la raíz del repo. */
const fromRoot = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));

/**
 * Todos los `park.json` en disco, recorriendo Frontend/Data/parks/<provincia>/<slug>/.
 * Es el recorrido por DISCO (no por el registro): lo usan las herramientas que deben tocar todo lo
 * que hay, incluido un parque que todavía no se haya dado de alta en parks-index.json.
 */
function parkFiles() {
  const out = [];
  if (!fs.existsSync(PARKS_DIR)) return out;
  for (const provincia of fs.readdirSync(PARKS_DIR).sort()) {
    const dir = path.join(PARKS_DIR, provincia);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const slug of fs.readdirSync(dir).sort()) {
      const file = path.join(dir, slug, 'park.json');
      if (fs.existsSync(file)) out.push({ slug, provincia, dir: path.join(dir, slug), file });
    }
  }
  return out;
}

module.exports = {
  ROOT, FRONTEND, DATA, PARKS_DIR, REGISTRY_FILE, DATABASE, CATALOGO_DIR, OUT_DIR,
  readJson, readJsonIf, writeJson, rel, fromRoot, parkFiles,
};
