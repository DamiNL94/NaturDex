#!/usr/bin/env node
/*
 * NaturDex · catalogo-nacional/hic-especies-caracteristicas
 * ------------------------------------------------------------------------------------------------
 * CAPA 3 (backbone determinista, PRIMERA VERSIÓN): crosswalk código HIC → especies características,
 * derivado del NOMBRE de la asociación fitosociológica oficial (el sintaxón está DEFINIDO por sus
 * especies características). Heurística: una especie catalogada es "característica" de un hábitat si
 * su GÉNERO aparece en la asociación fitosociológica del recinto (p. ej. Periploca en
 * "Mayteno-Periplocetum angustifoliae"). SOLO LECTURA (no toca park.json); escribe un informe.
 *
 * Limitación honesta: solo captura los géneros NOMBRADOS en el sintaxón (2-3 por asociación). El
 * catálogo completo de especies características por HIC vive en el "Atlas y Manual de los Hábitats
 * de España" (documental); esto es el primer pase hasta poder extraerlo.
 *
 * Uso:  node Tools/catalogo-nacional/hic-especies-caracteristicas.js --park <slug> [--out x.json]
 * ================================================================================================
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { resolvePark } = require('./lib/registry');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ARGV = process.argv.slice(2);
const flag = (n, d = null) => { const i = ARGV.indexOf(n); return i >= 0 && i + 1 < ARGV.length ? ARGV[i + 1] : d; };
const PARK = flag('--park');
const OUT = flag('--out');

function main() {
  const park = resolvePark(REPO_ROOT, PARK);
  const pj = JSON.parse(fs.readFileSync(park.habitatsPath.replace(/geo[\\/]habitats\.geojson$/, 'park.json'), 'utf8'));
  const species = pj.species || [];

  // Género de cada especie (de taxonomy.genus o de la 1ª palabra del nombre científico).
  const spGenus = species.map(s => ({
    id: s.id, name: s.scientificName, common: s.commonName,
    genus: (s.taxonomy && s.taxonomy.genus) || String(s.scientificName || '').split(/\s+/)[0],
  })).filter(s => s.genus);

  const rows = [];
  let totalLinks = 0;
  for (const h of pj.habitats) {
    const asocs = h.fitosociologia || [];
    if (!asocs.length) { rows.push({ hic: h.code, habitat: h.id, asociaciones: 0, caracteristicas: [] }); continue; }
    const blob = asocs.join(' · ').toLowerCase();
    const hits = [];
    for (const s of spGenus) {
      // raíz del género (5 chars) para casar con la forma latina del sintaxón (genitivo, -etum…)
      const root = s.genus.toLowerCase().slice(0, Math.min(5, s.genus.length));
      if (root.length >= 4 && blob.includes(root)) hits.push({ id: s.id, name: s.name, common: s.common, genus: s.genus });
    }
    totalLinks += hits.length;
    rows.push({ hic: h.code, habitat: h.id, asociaciones: asocs.length, caracteristicas: hits });
  }

  const outPath = OUT || path.join(__dirname, 'out', `${park.slug}-hic-especies.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ park: park.slug, metodo: 'género de la especie ∈ asociación fitosociológica oficial (primer pase, pendiente Atlas)', hic: rows }, null, 2));

  const conFito = rows.filter(r => r.asociaciones > 0);
  const conLink = rows.filter(r => r.caracteristicas.length);
  console.log(`Hábitats con asociación oficial: ${conFito.length}/${pj.habitats.length}`);
  console.log(`Hábitats con al menos 1 especie característica catalogada: ${conLink.length}`);
  console.log(`Enlaces especie↔HIC característicos: ${totalLinks}\n`);
  for (const r of rows.filter(r => r.caracteristicas.length).sort((a, b) => b.caracteristicas.length - a.caracteristicas.length)) {
    console.log(`  HIC ${r.hic} (${r.habitat}): ${r.caracteristicas.map(c => c.name).join(', ')}`);
  }
  console.log(`\n→ ${path.relative(REPO_ROOT, outPath)}`);
}
main();
