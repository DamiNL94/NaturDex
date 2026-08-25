#!/usr/bin/env node
// ================================================================================================
// atlas-hic-especies.js — extrae las especies CARACTERÍSTICAS por código HIC del "Atlas y Manual de
// los Hábitats de España" (MITECO) y las cruza con el catálogo de un parque para obtener el backbone
// determinista de enlaces especie↔hábitat (evidence='caracteristica').
// ------------------------------------------------------------------------------------------------
// El Atlas es NACIONAL: cada HIC trae su lista de especies características de toda España (incluye
// endemismos canarios, pirenaicos, baleares...). Lo que aplica a un parque es la INTERSECCIÓN de esa
// lista con la flora que el catálogo del parque ya tiene. Eso da enlaces oficiales y de alta confianza
// (respaldo del Atlas + presencia real en el parque), y filtra el ruido de GBIF.
//
// Requisitos: primero extraer el texto del PDF con poppler:
//     pdftotext -enc UTF-8 "Docs/Atlas y Manual de los Habitat de Espana.pdf" atlas.txt
// Uso:
//     node Tools/catalogo-nacional/atlas-hic-especies.js --atlas atlas.txt[,otro.txt] --park <slug>
//                                                       [--json out.json] [--fusiona]
// Los códigos HIC se toman de los hábitats del propio park.json (columna `code`). SOLO LECTURA: no
// escribe en la BD ni en el seed; genera un JSON de enlaces para revisar/cargar.
//
// VARIOS TEXTOS Y `--fusiona`: por qué la lectura es acumulativa (2026-08-25)
// --------------------------------------------------------------------------
// De qué extractor salga el `atlas.txt` cambia QUÉ enlaces se leen, y ninguno cubre al otro. El
// `pdftotext` de poppler con `-layout` deja el rótulo «Especies características» y su lista en la
// misma línea; el de Xpdf y pypdf lo dejan solo, con la lista debajo, y ni siquiera coinciden entre
// sí en qué bloques atribuyen. Medido sobre los dieciséis espacios de Murcia: el texto de Xpdf con
// `-layout` recupera 34 enlaces en Sierra de El Carche que el índice versionado no tenía, y a la vez
// pierde quince de Sierra Espuña que ese índice sí traía (*Genista longipes*, *Colchicum
// triphyllum*…). Elegir un solo extractor tira dato del documento en las dos direcciones.
//
// Por eso `--atlas` admite VARIOS ficheros separados por coma y `--fusiona` conserva lo que ya
// hubiera en el JSON de salida. La regla es la misma que aplica el resto del pipeline al Atlas: se
// usa SOLO EN POSITIVO —que un extractor no vea un nombre no significa que el Atlas no lo dé—, así
// que retirar un enlace porque esta pasada no lo ha leído sería borrar un dato por una limitación de
// herramienta. Sin `--fusiona` el fichero se reescribe entero, que es lo que hay que hacer cuando
// cambia el CATÁLOGO del espacio y no el extractor.
// ================================================================================================
const fs = require('fs');
const path = require('path');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
function flag(name) { return process.argv.includes('--' + name); }
function die(msg) { process.stderr.write(msg + '\n'); process.exit(1); }

const atlasPaths = String(arg('atlas', '')).split(',').map((s) => s.trim()).filter(Boolean);
const slug = arg('park');
const FUSIONA = flag('fusiona');
if (!atlasPaths.length || !slug) die('Uso: --atlas <atlas.txt[,otro.txt]> --park <slug> [--json out.json] [--fusiona]');
for (const p of atlasPaths) {
  if (!fs.existsSync(p)) die('No existe el texto del Atlas: ' + p + '\n(extráelo con: pdftotext -enc UTF-8 <Atlas.pdf> atlas.txt)');
}

// Localiza el park.json del parque a partir del registro.
const { FRONTEND, REGISTRY_FILE, readJson } = require('../lib/io');
const registry = readJson(REGISTRY_FILE);
let entry = null;
for (const c of (registry.communities || [])) for (const p of (c.provinces || [])) for (const pk of (p.parks || []))
  if (pk.slug === slug) entry = pk;
if (!entry) die('Parque no encontrado en el registro: ' + slug);
const manifest = JSON.parse(fs.readFileSync(path.join(FRONTEND, entry.manifest), 'utf8'));
const park = JSON.parse(fs.readFileSync(path.join(FRONTEND, manifest.data), 'utf8'));

const HIC = [...new Set((park.habitats || []).map(h => h.code).filter(Boolean))];
const hicSet = new Set(HIC);
const codeToSlug = {}; for (const h of park.habitats) if (h.code) codeToSlug[h.code] = h.id;

// --- 1) Extraer "Especies características" por HIC del Atlas ---------------------------------------
// El parser vive en Tools/lib/atlas.js: lo comparte con build-species-seleccion.js y, sobre todo,
// tolera los dos formatos de extracción del PDF. Cuando estaba aquí dentro daba por hecho el de
// `pdftotext -layout` y con cualquier otro devolvía CERO especies sin decir nada.
const { especiesCaracteristicas, binomio: binomial } = require('../lib/atlas');
const atlasByHic = {}; HIC.forEach(c => atlasByHic[c] = new Set());
let bloques = 0, bloquesConEspecies = 0;
for (const p of atlasPaths) {
  const atlas = especiesCaracteristicas(p, hicSet);
  bloques = Math.max(bloques, atlas.bloques);
  bloquesConEspecies += atlas.bloquesConEspecies;
  for (const c of HIC) for (const n of (atlas.porHic.get(c) || [])) atlasByHic[c].add(n);
}

// Un Atlas del que no sale ni una especie es un fallo de lectura del PDF, no un catálogo sin flora:
// se avisa en vez de seguir y escribir un fichero de cero enlaces que parece un resultado.
if (bloques && !bloquesConEspecies) {
  die(`El Atlas tiene ${bloques} bloques de «Especies características» y no se ha podido leer ` +
      'ninguna especie de ellos. Revisa la extracción del PDF antes de usar la salida.');
}

// --- 2) Cruzar con el catálogo del parque por binomio (género + raíz del epíteto) -----------------
const catByBin = new Map();
for (const s of park.species) { const b = binomial(s.scientificName); if (b) catByBin.set(b, s); }

const links = []; const perHic = {}; const seen = new Set();
for (const code of HIC) {
  const slugH = codeToSlug[code]; const matched = [];
  for (const atlasName of atlasByHic[code]) {
    const cat = catByBin.get(binomial(atlasName) || '');
    if (cat && cat.kingdom !== 'fauna') {
      matched.push(cat.scientificName);
      const k = slugH + '|' + cat.scientificName;
      if (!seen.has(k)) { seen.add(k); links.push({ code, habitat_slug: slugH, scientific_name: cat.scientificName, atlas_name: atlasName }); }
    }
  }
  perHic[code] = { habitat: slugH, especies: [...new Set(matched)] };
}

const outPath = arg('json');
// `--fusiona`: lo que ya estuviera escrito se CONSERVA. Se comprueba antes que el hábitat siga en el
// catálogo del espacio y que la especie siga fichada con ese nombre: un enlace heredado que apunta a
// un hábitat retirado o a un taxón renombrado no es dato que salvar, es una fila huérfana.
let heredados = 0;
if (outPath && FUSIONA && fs.existsSync(outPath)) {
  const previo = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  const porNombre = new Map(park.species.map((s) => [s.scientificName, s]));
  for (const l of previo.links || []) {
    if (codeToSlug[l.code] !== l.habitat_slug || !porNombre.has(l.scientific_name)) continue;
    const k = l.habitat_slug + '|' + l.scientific_name;
    if (seen.has(k)) continue;
    seen.add(k); links.push(l); heredados++;
    perHic[l.code].especies.push(l.scientific_name);
  }
}
if (outPath) { fs.writeFileSync(outPath, JSON.stringify({ park: slug, generado: 'Atlas y Manual de los Hábitats de España (MITECO) ∩ catálogo del parque', hic: perHic, links }, null, 1)); }
console.log('=== Especies características (Atlas ∩ ' + slug + ') ===');
for (const code of HIC) console.log(`  ${code} ${perHic[code].habitat} (${perHic[code].especies.length}): ${perHic[code].especies.join(', ') || '—'}`);
console.log('\nTOTAL enlaces caracteristica:', links.length +
  (heredados ? `  (${heredados} conservados del índice anterior)` : '') +
  (outPath ? '  ->  ' + outPath : ''));
