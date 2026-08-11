#!/usr/bin/env node
'use strict';
/*
 * fix-enlaces-habitat-sierra-pila.js — repone los enlaces especie↔hábitat que la Capa 3 de Sierra
 * de la Pila escribió vacíos.
 *
 * El problema que resuelve
 * -----------------------
 * Cinco plantas del catálogo del espacio se quedaron con `habitatIds: []` mientras su propio
 * `source` afirmaba lo contrario —el romero dice «200 ocurrencias dentro de los polígonos de hábitat
 * del espacio (9 hábitats)» y no colgaba de ninguno—. Son 23 enlaces perdidos, y de la especie más
 * abundante y más reconocible del monte mediterráneo hacia abajo.
 *
 * La causa está en `build-species-seleccion.js`: al RECONCILIAR, cuando un candidato de GBIF resulta
 * ser un taxón que el catálogo ya tiene fichado con otro nombre, se le cambia el nombre —para
 * reutilizar la ficha en vez de duplicarla, que es lo correcto— pero, si el grupo tenía un solo
 * candidato, no se anotaba de qué nombre se venía. Y ese nombre es el único hilo con el barrido de
 * GBIF, que está indexado por el nombre que sirve GBIF. `build-species-n2.js` no lo encontraba y
 * escribía la ficha sin enlaces. Las dos herramientas ya están corregidas; esto repara el dato que
 * quedó escrito.
 *
 * Las cinco correspondencias, VERIFICADAS contra EIDOS el 2026-08-11 (`--verificar-eidos` las vuelve
 * a comprobar). Tres dan el mismo `taxonid` por los dos nombres; las otras dos se enlazan por la
 * sinonimia que sirve el propio EIDOS:
 *
 *   Salvia rosmarinus        → Rosmarinus officinalis          taxonid 7647 por ambos nombres
 *   Halimium atriplicifolium → Cistus atriplicifolius          taxonid 5037 por ambos nombres
 *   Calicotome villosa       → Cytisus lanigerus               taxonid 2953 por ambos nombres
 *   Petrosedum sediforme     → Sedum sediforme                 EIDOS da «Sedum sediforme» (95304)
 *                                                              como SINÓNIMO cuyo aceptado es
 *                                                              «Petrosedum sediforme (Jacq.) Grulich
 *                                                              subsp. sediforme» (8225)
 *   Olea europaea            → Olea europaea subsp. europaea   EIDOS no conoce el nombre del
 *                                                              catálogo; «Olea europaea» resuelve a
 *                                                              6644, que es el `eidosTaxonId` con el
 *                                                              que cuatro-calas tiene fichada la
 *                                                              especie
 *
 * Ninguna correspondencia se aplica a ciegas: antes de escribir se comprueba la HUELLA de cada una
 * contra el barrido —número de ocurrencias y número de hábitats tienen que coincidir con lo que dice
 * la selección aprobada—. Si no coincide, el script no escribe nada y sale en rojo. Es lo que
 * convierte una tabla escrita a mano en una afirmación comprobable.
 *
 * Toca dos ficheros, y el segundo importa tanto como el primero:
 *   · el `park.json`, donde repone `habitatIds` y rehace los `speciesIds` de cada hábitat;
 *   · la SELECCIÓN aprobada (`out/<slug>-seleccion-especies.json`), donde anota los
 *     `sinonimosFusionados` que la reconciliación no llegó a escribir. Sin esto, la corrección
 *     duraría hasta el siguiente `npm run species:build`, que volvería a dejar las cinco fichas sin
 *     enlaces — la trampa del §2 de CLAUDE.md, una entrada obsoleta revirtiendo el arreglo.
 *
 * Idempotente: un segundo pase no cambia un byte. NO escribe en la base de datos: el SQL del espacio
 * se regenera aparte con `npm run park:sql`.
 *
 * Uso:
 *   node Tools/catalogo-nacional/fix-enlaces-habitat-sierra-pila.js [--dry] [--verificar-eidos]
 */

const path = require('path');
const { flag } = require('../lib/cli');
const { FRONTEND, OUT_DIR, readJson, writeJson, rel } = require('../lib/io');

const DRY = flag('dry');
const VERIFICAR = flag('verificar-eidos');

const PARK = 'sierra-de-la-pila';
const PARK_JSON = path.join(FRONTEND, 'Data', 'parks', 'murcia', PARK, 'park.json');
const MANIFEST = path.join(FRONTEND, 'Data', 'parks', 'murcia', PARK, 'manifest.json');
const GBIF = path.join(OUT_DIR, `${PARK}-gbif.json`);
const SELECCION = path.join(OUT_DIR, `${PARK}-seleccion-especies.json`);

// nombre con el que GBIF sirve el taxón → nombre con el que lo tiene el catálogo. Ver la cabecera:
// cada línea está verificada contra EIDOS y además se comprueba su huella antes de escribir.
const CORRESPONDENCIAS = {
  'Salvia rosmarinus': 'Rosmarinus officinalis',
  'Halimium atriplicifolium': 'Cistus atriplicifolius',
  'Petrosedum sediforme': 'Sedum sediforme',
  'Calicotome villosa': 'Cytisus lanigerus',
  'Olea europaea': 'Olea europaea subsp. europaea',
};

/** El barrido invertido: nombre de GBIF → hábitats del parque en que se observó, con su recuento. */
function indexarBarrido() {
  const doc = readJson(GBIF);
  const porNombre = new Map();
  for (const h of doc.habitats || []) {
    for (const s of h.species || []) {
      if (!porNombre.has(s.name)) porNombre.set(s.name, { speciesKey: s.speciesKey, habitats: [] });
      porNombre.get(s.name).habitats.push({ slug: h.slug, ocurrencias: s.occurrences });
    }
  }
  // El mismo orden que aplica build-species-n2.js, para que reponer aquí y regenerar allí den lo
  // mismo byte a byte.
  for (const v of porNombre.values()) {
    v.habitats.sort((a, b) => b.ocurrencias - a.ocurrencias || a.slug.localeCompare(b.slug));
    v.ocurrencias = v.habitats.reduce((n, h) => n + h.ocurrencias, 0);
  }
  return porNombre;
}

/** Vuelve a preguntar a EIDOS por cada correspondencia. Solo informa: la puerta es la huella. */
async function verificarContraEidos() {
  const eidos = require('../lib/eidos');
  console.log('\nVerificación contra EIDOS (IEPNB):');
  for (const [nombreGbif, nombreCatalogo] of Object.entries(CORRESPONDENCIAS)) {
    const a = await eidos.resolveTaxon(nombreGbif);
    await new Promise(r => setTimeout(r, eidos.THROTTLE_MS));
    const b = await eidos.resolveTaxon(nombreCatalogo);
    await new Promise(r => setTimeout(r, eidos.THROTTLE_MS));
    const mismo = a.taxonid != null && a.taxonid === b.taxonid;
    const enlace = mismo
      ? `mismo taxonid ${a.taxonid}`
      : `${nombreGbif} → ${a.taxonid} (${a.status}); ${nombreCatalogo} → ${b.taxonid} (${b.status})` +
        `${b.acceptedName ? `, aceptado «${b.acceptedName}»` : ''}`;
    console.log(`  ${mismo ? '✓' : '·'} ${nombreGbif} ≡ ${nombreCatalogo} — ${enlace}`);
  }
}

function main() {
  const park = readJson(PARK_JSON);
  const seleccion = readJson(SELECCION);
  const barrido = indexarBarrido();
  const habitatsDelParque = new Set((park.habitats || []).map(h => h.id));

  const errores = [], repuestas = [], yaEstaban = [];

  for (const [nombreGbif, nombreCatalogo] of Object.entries(CORRESPONDENCIAS)) {
    const ficha = (park.species || []).find(s => s.scientificName === nombreCatalogo);
    const sel = (seleccion.especies || []).find(s => s.scientificName === nombreCatalogo);
    const g = barrido.get(nombreGbif);
    if (!ficha) { errores.push(`${nombreCatalogo}: no está en el park.json`); continue; }
    if (!sel) { errores.push(`${nombreCatalogo}: no está en la selección aprobada`); continue; }
    if (!g) { errores.push(`${nombreGbif}: no está en el barrido ${rel(GBIF)}`); continue; }

    // La huella: dos cifras que la selección tomó de este mismo barrido. Si no cuadran, la
    // correspondencia es falsa o el barrido no es el que se usó, y en cualquiera de los dos casos
    // reponer enlaces sería inventar dónde vive la especie.
    const enlaces = g.habitats.filter(h => habitatsDelParque.has(h.slug));
    if (g.ocurrencias !== sel.gbifOccurrences || enlaces.length !== sel.habitats) {
      errores.push(`${nombreGbif} → ${nombreCatalogo}: la huella no cuadra. El barrido da ` +
        `${g.ocurrencias} ocurrencias en ${enlaces.length} hábitat(s) y la selección dice ` +
        `${sel.gbifOccurrences} en ${sel.habitats}.`);
      continue;
    }

    const nuevos = enlaces.map(h => h.slug);
    const previos = ficha.habitatIds || [];
    if (previos.length && previos.join('|') !== nuevos.join('|')) {
      errores.push(`${nombreCatalogo}: ya tiene habitatIds distintos de los del barrido ` +
        `(${previos.join(', ')}). No se pisa nada: revísalo a mano.`);
      continue;
    }
    if (previos.join('|') === nuevos.join('|')) { yaEstaban.push(nombreCatalogo); continue; }

    ficha.habitatIds = nuevos;
    repuestas.push({ nombreGbif, nombreCatalogo, id: ficha.id, enlaces: nuevos });

    // Y el hilo que faltaba, en la selección: es lo que hace que `species:build` vuelva a producir
    // este mismo resultado en vez de deshacerlo.
    const sinonimos = new Set(sel.sinonimosFusionados || []);
    sinonimos.add(nombreGbif);
    sel.sinonimosFusionados = [...sinonimos];
  }

  if (errores.length) {
    console.error('✖ No se ha escrito nada. Comprobaciones que no pasan:');
    errores.forEach(e => console.error('  · ' + e));
    process.exitCode = 2;
    return;
  }

  // El inverso, en el array de hábitats. Se rehace entero, no solo para las cinco: es la misma
  // operación que hace build-species-n2.js y así los dos caminos convergen.
  const porHabitat = new Map((park.habitats || []).map(h => [h.id, []]));
  for (const s of park.species || []) {
    for (const hid of s.habitatIds || []) if (porHabitat.has(hid)) porHabitat.get(hid).push(s.id);
  }
  const antesPorHabitat = new Map((park.habitats || []).map(h => [h.id, (h.speciesIds || []).length]));
  for (const h of park.habitats || []) h.speciesIds = (porHabitat.get(h.id) || []).sort((a, b) => a - b);

  console.log(`Espacio: ${park.park.name} (${PARK})`);
  if (yaEstaban.length) console.log(`Ya tenían sus enlaces (nada que hacer): ${yaEstaban.join(', ')}`);
  if (!repuestas.length) {
    console.log('Nada que reponer: el park.json ya está corregido.');
    return;
  }

  console.log(`\nEnlaces repuestos en ${repuestas.length} ficha(s):`);
  for (const r of repuestas) {
    console.log(`  #${r.id} ${r.nombreCatalogo} (GBIF lo sirve como ${r.nombreGbif}) → ` +
      `${r.enlaces.length} hábitat(s)`);
  }
  console.log(`\nTotal de enlaces nuevos: ${repuestas.reduce((n, r) => n + r.enlaces.length, 0)}`);
  console.log('\nEspecies por hábitat:');
  for (const h of park.habitats || []) {
    const antes = antesPorHabitat.get(h.id);
    const ahora = h.speciesIds.length;
    console.log(`  ${String(h.code).padEnd(6)} ${String(antes).padStart(4)} → ${String(ahora).padStart(4)}` +
      `${ahora === antes ? '' : `  (+${ahora - antes})`}${ahora === 0 ? '   ⚠ sigue sin especies' : ''}`);
  }

  if (DRY) { console.log('\nSimulación: no se ha tocado nada.'); return; }

  writeJson(PARK_JSON, park);
  writeJson(SELECCION, seleccion);
  // El manifiesto decide si un dispositivo con el espacio guardado sin conexión se lo vuelve a
  // descargar: si cambia el contenido y no sube `version`, el usuario se queda con lo viejo.
  const manifest = readJson(MANIFEST);
  manifest.version = (Number(manifest.version) || 0) + 1;
  manifest.updatedAt = new Date().toISOString().slice(0, 10);
  writeJson(MANIFEST, manifest);
  console.log(`\n+ ${rel(PARK_JSON)}\n+ ${rel(SELECCION)}\n+ ${rel(MANIFEST)} (version ${manifest.version})`);
  console.log('\nSiguiente paso: `npm run park:sql -- --park sierra-de-la-pila` — la API manda sobre el');
  console.log('paquete, así que sin regenerar y aplicar el SQL el usuario seguiría viendo lo anterior.');
}

if (VERIFICAR) verificarContraEidos().then(main).catch(e => { console.error(e.stack || e.message); process.exitCode = 2; });
else main();
