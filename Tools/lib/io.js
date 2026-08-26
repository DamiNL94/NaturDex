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

/**
 * Escribe el `park.json` de un espacio y, si su contenido ha cambiado, sube la `version` de su
 * manifest.json en el mismo paso.
 *
 * Las dos cosas van juntas AQUÍ porque separarlas es un fallo que no se ve desde el repositorio: el
 * manifiesto es lo que decide si un dispositivo con el espacio guardado sin conexión vuelve a
 * descargarlo, así que una herramienta que reescribe fichas y no sube la versión deja al usuario que
 * ya lo tenía guardado con el dato viejo — sin error, sin aviso, y con el dato BIEN en el repo. Estas
 * cuatro líneas estaban copiadas en cinco herramientas y la sexta se las olvidó
 * (`aplica-fenologia-aves.js`, con trece espacios reescritos antes de que nadie lo viera).
 *
 * `counts` son las claves de `manifest.counts` que la herramienta sepa recalcular (`species`,
 * `habitats`, `pointsOfInterest`); se aplican aunque el `park.json` no cambie —corregir un contador
 * desviado no publica nada nuevo—, pero la `version` sube SOLO si el paquete cambió, que es lo que
 * exige la idempotencia de la regla nº 7 del `CLAUDE.md`.
 *
 * `write: false` es el modo en seco: calcula y no toca disco. Devuelve `{ cambia, version, lineas }`
 * con una línea por fichero — `=` sin cambios, `+` escrito, `~` lo habría escrito.
 *
 * `manifestFile` solo hace falta cuando el manifiesto NO es hermano del `park.json`: las
 * herramientas que localizan el espacio por el registro (`parks-index.json`) tienen las dos rutas y
 * no deben dar por hecha la convención de carpeta.
 */
function escribeEspacio({ dir, file, manifestFile, doc, counts = null, write = true }) {
  const parkPath = file || path.join(dir, 'park.json');
  const parkDir = dir || path.dirname(parkPath);
  const lineas = [];

  const nuevoTexto = JSON.stringify(doc, null, 2) + '\n';
  const previoTexto = fs.existsSync(parkPath) ? fs.readFileSync(parkPath, 'utf8') : null;
  const cambia = previoTexto !== nuevoTexto;
  if (!cambia) lineas.push(`= ${rel(parkPath)}`);
  else {
    if (write) writeJson(parkPath, doc);
    lineas.push(`${write ? '+' : '~'} ${rel(parkPath)}`);
  }

  const manifestPath = manifestFile || path.join(parkDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return { cambia, version: null, lineas };
  const manifest = readJson(manifestPath);
  const previoManifiesto = fs.readFileSync(manifestPath, 'utf8');
  if (counts) {
    manifest.counts = manifest.counts || {};
    for (const [clave, valor] of Object.entries(counts)) {
      if (valor !== null && valor !== undefined) manifest.counts[clave] = valor;
    }
  }
  if (cambia) {
    manifest.version = (Number(manifest.version) || 0) + 1;
    manifest.updatedAt = new Date().toISOString().slice(0, 10);
  }
  const nuevoManifiesto = JSON.stringify(manifest, null, 2) + '\n';
  if (previoManifiesto === nuevoManifiesto) lineas.push(`= ${rel(manifestPath)}`);
  else {
    if (write) fs.writeFileSync(manifestPath, nuevoManifiesto, 'utf8');
    lineas.push(`${write ? '+' : '~'} ${rel(manifestPath)} (version ${manifest.version})`);
  }
  return { cambia, version: manifest.version, lineas };
}

module.exports = {
  ROOT, FRONTEND, DATA, PARKS_DIR, REGISTRY_FILE, DATABASE, CATALOGO_DIR, OUT_DIR,
  readJson, readJsonIf, writeJson, rel, fromRoot, parkFiles, escribeEspacio,
};
