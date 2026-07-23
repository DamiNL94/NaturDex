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
//     node Tools/catalogo-nacional/atlas-hic-especies.js --atlas atlas.txt --park <slug> [--json out.json]
// Los códigos HIC se toman de los hábitats del propio park.json (columna `code`). SOLO LECTURA: no
// escribe en la BD ni en el seed; genera un JSON de enlaces para revisar/cargar.
// ================================================================================================
const fs = require('fs');
const path = require('path');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
function die(msg) { process.stderr.write(msg + '\n'); process.exit(1); }

const atlasPath = arg('atlas');
const slug = arg('park');
if (!atlasPath || !slug) die('Uso: --atlas <atlas.txt> --park <slug> [--json out.json]');
if (!fs.existsSync(atlasPath)) die('No existe el texto del Atlas: ' + atlasPath + '\n(extráelo con: pdftotext -enc UTF-8 <Atlas.pdf> atlas.txt)');

// Localiza el park.json del parque a partir del registro.
const FRONTEND = path.join(__dirname, '..', '..', 'Frontend');
const registry = JSON.parse(fs.readFileSync(path.join(FRONTEND, 'Data', 'parks-index.json'), 'utf8'));
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
const lines = fs.readFileSync(atlasPath, 'utf8').split(/\r?\n/);
const codeRe = /\b(\d{2}[A-Z]\d|\d{4})\*?\b/g;
function nearestHic(idx) {
  for (let i = idx; i >= 0 && i > idx - 12; i--) {
    const l = lines[i]; let m, found = null; codeRe.lastIndex = 0;
    while ((m = codeRe.exec(l))) if (hicSet.has(m[1])) found = m[1];
    if (found && new RegExp(found + '\\*?\\s+[A-Za-zÁÉÍÓÚÑ]').test(l)) return found;
  }
  return null;
}
const clean = s => s.replace(/\s+/g, ' ').replace(/[.;,]+$/, '').trim();
function splitSpecies(block) {
  return block.split(/,|;| y (?=[A-Z])/).map(clean)
    .filter(x => /^[A-ZÁÉÍÓÚ][a-záéíóúü-]+ [a-z]/.test(x))
    .filter((v, i, a) => a.indexOf(v) === i);
}
const atlasByHic = {}; HIC.forEach(c => atlasByHic[c] = new Set());
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/Especies características\s+(.+)/);
  if (!m) continue;
  const code = nearestHic(i);
  if (code) splitSpecies(m[1]).forEach(sp => atlasByHic[code].add(sp));
}

// --- 2) Cruzar con el catálogo del parque por binomio (género + raíz del epíteto) -----------------
function binomial(name) {
  const w = String(name).trim().split(/\s+/); if (w.length < 2) return null;
  const g = w[0].toLowerCase().replace(/[^a-záéíóúü-]/g, '');
  const ep = w[1].toLowerCase().replace(/[^a-záéíóúü-]/g, '').replace(/(us|um|a|os|as|is|e)$/, '');
  return g + ' ' + ep;
}
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
if (outPath) { fs.writeFileSync(outPath, JSON.stringify({ park: slug, generado: 'Atlas y Manual de los Hábitats de España (MITECO) ∩ catálogo del parque', hic: perHic, links }, null, 1)); }
console.log('=== Especies características (Atlas ∩ ' + slug + ') ===');
for (const code of HIC) console.log(`  ${code} ${perHic[code].habitat} (${perHic[code].especies.length}): ${perHic[code].especies.join(', ') || '—'}`);
console.log('\nTOTAL enlaces caracteristica:', links.length + (outPath ? '  ->  ' + outPath : ''));
