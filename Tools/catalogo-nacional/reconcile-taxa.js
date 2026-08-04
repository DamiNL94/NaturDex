#!/usr/bin/env node
/*
 * NaturDex · catalogo-nacional/reconcile-taxa
 * ------------------------------------------------------------------------------------------------
 * CAPA 3 (reconciliación taxonómica): construye la tabla MAESTRA que casa cada especie del parque
 * con su identificador estable en las dos fuentes que usa el catálogo, resolviendo sinonimias:
 *   - EIDOS (IEPNB): taxonid del nombre aceptado  (clave maestra propuesta)
 *   - GBIF: usageKey/speciesKey del nombre aceptado
 * Sin esto, las reclasificaciones (Larus→Ichthyaetus, Salvia rosmarinus→Rosmarinus, Accipiter→Astur…)
 * descuadran los conteos entre fuentes y entre parques.
 *
 * SOLO LECTURA (consulta APIs públicas; no toca BD/seed/park.json). Escribe una tabla JSON.
 *
 * Uso:  node Tools/catalogo-nacional/reconcile-taxa.js --park <slug> [--out tabla.json] [--limit N]
 * ================================================================================================
 */
'use strict';
const path = require('path');
const { resolvePark } = require('../lib/registry');
const { readJson, writeJson, rel, ROOT, OUT_DIR } = require('../lib/io');
const { arg, num, die, sleep, requireArgs } = require('../lib/cli');
const eidos = require('../lib/eidos');
const gbif = require('../lib/gbif');

const PARK = arg('park');
const OUT = arg('out');
const LIMIT = num('limit', Infinity);
requireArgs('Uso: --park <slug> [--out tabla.json] [--limit N]', { park: PARK });
// Pausa entre especies: son dos servicios públicos y un catálogo son cientos de peticiones.
const THROTTLE = 130;

async function main() {
  const park = resolvePark(ROOT, PARK);
  const pj = readJson(park.habitatsPath.replace(/geo[\\/]habitats\.geojson$/, 'park.json'));
  const species = (pj.species || []).filter(s => s.scientificName);
  const total = Math.min(species.length, LIMIT);
  console.log(`Reconciliando ${total} especies de ${park.slug} (EIDOS + GBIF)…`);

  const table = [];
  const stats = { eidosOk: 0, eidosSyn: 0, eidosNo: 0, gbifOk: 0, gbifSyn: 0, gbifNo: 0, discrepan: 0, gbifNoEspecifico: 0 };
  for (let i = 0; i < total; i++) {
    const s = species[i];
    let e = { status: 'error' }, g = { status: 'error' };
    try { e = await eidos.resolveTaxon(s.scientificName); } catch (_) { /* se cuenta como no encontrada */ }
    try { g = await gbif.matchName(s.scientificName); } catch (_) { /* ídem */ }

    if (e.status === 'ok') stats.eidosOk++; else if (e.status === 'sinonimo') stats.eidosSyn++; else stats.eidosNo++;
    if (g.status === 'ok') stats.gbifOk++; else if (g.status === 'sinonimo') stats.gbifSyn++; else stats.gbifNo++;

    // Una clave de GBIF de rango género o FAMILIA no identifica a la especie: cualquier consulta de
    // ocurrencias con ella devuelve el grupo entero. Se anota en vez de darla por buena (el catálogo
    // llegó a tener 3073 = Poaceae como «clave del esparto»).
    const rangoDudoso = g.speciesKey && g.rank && !gbif.esRangoEspecifico(g.rank);
    if (rangoDudoso) stats.gbifNoEspecifico++;

    const acuerdan = e.acceptedName && g.acceptedName
      && eidos.binomial(e.acceptedName) === eidos.binomial(g.acceptedName);
    if (e.acceptedName && g.acceptedName && !acuerdan) stats.discrepan++;

    table.push({
      id: s.id, scientificName: s.scientificName,
      eidos_taxonid: e.taxonid || null, eidos_aceptado: e.acceptedName || null, eidos_estado: e.status,
      gbif_speciesKey: g.speciesKey || null, gbif_aceptado: g.acceptedName || null, gbif_estado: g.status,
      gbif_rango: g.rank || null,
      gbif_rango_no_especifico: !!rangoDudoso,
      reclasificada: e.status === 'sinonimo' || g.status === 'sinonimo',
      fuentes_acuerdan: !!acuerdan,
    });
    process.stdout.write(`\r  ${i + 1}/${total}`);
    if (i < total - 1) await sleep(THROTTLE);
  }
  process.stdout.write('\n');

  const outPath = OUT ? path.resolve(OUT) : path.join(OUT_DIR, `${park.slug}-reconciliacion.json`);
  writeJson(outPath, { park: park.slug, generado: 'EIDOS v_taxonomia + GBIF species/match', stats, especies: table });

  console.log(`\nEIDOS  → ok ${stats.eidosOk} · sinónimo ${stats.eidosSyn} · no encontrada ${stats.eidosNo}`);
  console.log(`GBIF   → ok ${stats.gbifOk} · sinónimo ${stats.gbifSyn} · no encontrada ${stats.gbifNo}`);
  if (stats.gbifNoEspecifico) console.log(`⚠ ${stats.gbifNoEspecifico} clave(s) de GBIF de rango superior a especie: NO sirven para consultar ocurrencias`);
  console.log(`Reclasificadas (alguna fuente): ${table.filter(t => t.reclasificada).length} · discrepancias nombre aceptado: ${stats.discrepan}`);
  console.log(`Con eidos_taxonid Y gbif_speciesKey (clave maestra completa): ${table.filter(t => t.eidos_taxonid && t.gbif_speciesKey).length}/${total}`);
  console.log(`→ ${rel(outPath)}`);
}
main().catch(e => die(e.stack || e.message, 1));
