#!/usr/bin/env node
'use strict';
/*
 * Correcciones de la revisión de Sierra Espuña del 2026-08-09 (ESTADO.md §"2026-08-09 (g)").
 *
 * Cuatro arreglos, todos sobre Frontend/Data/parks/murcia/sierra-espuna/park.json:
 *
 *   1. spainStatus — se reconstruye desde la Lista Patrón del IEPNB dejando SÓLO normas estatales
 *      aplicables en la península. Corrige dos errores del ensamblado automático:
 *        · el CEEEI (RD 630/2013) atribuido a tres especies NATIVAS —madroño, escoba negra y tojo—
 *          cuando ese catálogo las incluye con «Ámbito de aplicación: Canarias»;
 *        · normas de OTRAS comunidades autónomas (Castilla-La Mancha, Cataluña…) en un campo que
 *          describe el estado legal en España. El estado autonómico tiene su propio campo,
 *          murciaStatus, y ése no se toca.
 *   2. featured — 175 de 190 especies estaban destacadas, que es no destacar ninguna. Se deja en las
 *      de rarityScore >= 4, el mismo orden de magnitud que Cabo Cope (15) y Cuatro Calas (8).
 *   3. Las dos especies exóticas (arruí y tabaco moruno) salen del catálogo del parque y pasan al
 *      carril de invasoras, que es donde el proyecto las trata.
 *   4. Sinonimia — nueve nombres se llevan al aceptado en EIDOS.
 *
 * Idempotente. Uso:
 *   node Tools/catalogo-nacional/fix-sierra-espuna-revision.js --dry   # sólo informa
 *   node Tools/catalogo-nacional/fix-sierra-espuna-revision.js --normas <normas2-idx.json>
 */
const fs = require('fs');
const path = require('path');
const { ROOT: RAIZ } = require('../lib/io');
const { arg, flag } = require('../lib/cli');

const DRY = flag('dry');
const PARK = path.join(RAIZ, 'Frontend/Data/parks/murcia/sierra-espuna/park.json');
const INVASORAS = path.join(RAIZ, 'Frontend/Data/invasoras.json');
const NORMAS = arg('normas');

const FUENTE = 'IEPNB, Lista Patrón de las especies silvestres presentes en España, vista de normas, consultada 2026-08-09';

// Territorios declarados en `Observaciones población` que EXCLUYEN a la península. Si una norma
// estatal sólo se aplica ahí, no describe el estado legal de una especie en Murcia.
const NO_PENINSULA = /^(Canarias|Ámbito de aplicación: Canarias|Canarias, Ibiza y Formentera|Ámbito de aplicación: Canarias, Ibiza y Formentera|Baleares|Illes Balears)$/i;

// Sinonimia: nombre en el repo → nombre aceptado en EIDOS. Resuelto contra
// v_listapatronespecie_sinonimos el 2026-08-09.
const SINONIMOS = {
  'Salvia rosmarinus': 'Rosmarinus officinalis',
  'Olea europaea var. sylvestris': 'Olea europaea subsp. europaea',
  'Halimium atriplicifolium': 'Cistus atriplicifolius',
  'Bupleurum gibraltaricum': 'Bupleurum gibraltarium',
  'Saxifraga almeriensis': 'Saxifraga camposii subsp. leptophylla',
  'Calicotome villosa': 'Cytisus lanigerus',
  'Campanula hispanica': 'Campanula rotundifolia subsp. hispanica',
  'Allium paniculatum': 'Allium pallens',
  'Sylvia undata': 'Curruca undata',
};

// Especies exóticas que salen del catálogo del parque.
const EXOTICAS = ['Ammotragus lervia', 'Nicotiana glauca'];

const RARITY_DESTACADA = 4;

function main() {
  const park = JSON.parse(fs.readFileSync(PARK, 'utf8'));
  const normas = NORMAS && fs.existsSync(NORMAS) ? JSON.parse(fs.readFileSync(NORMAS, 'utf8')) : null;
  if (!normas) {
    console.error('✖ falta el índice de normas del IEPNB: pásalo con --normas <fichero.json>');
    process.exit(2);
  }

  const cambios = { spain: [], featured: 0, fuera: [], renombradas: [] };

  // --- 1. spainStatus: se QUITA lo que no aplica, no se reescribe el campo ------------------------
  // Reconstruirlo entero desde el IEPNB sale peor: mete normas de comercialización forestal
  // (RD 289/2003, «otras especies forestales importantes para la selvicultura») donde había
  // referencias a la Lista Roja, que sí es información de conservación. El texto curado se respeta;
  // sólo se eliminan los fragmentos de normas que no describen el estado legal en Murcia.
  for (const sp of park.species) {
    const filas = normas[sp.scientificName] || normas[SINONIMOS[sp.scientificName]] || [];
    // Normas cuyo fragmento sobra: de otra comunidad autónoma, o estatales restringidas a un
    // territorio que no incluye la península.
    const sobran = filas.filter((f) =>
      (f.ambito && f.ambito !== 'España' && f.ambito !== 'Región de Murcia' && f.ambito !== 'UE' && f.ambito !== 'Internacional') ||
      (f.ambito === 'España' && f.obs && NO_PENINSULA.test(String(f.obs).trim()))
    );
    if (!sobran.length || !sp.spainStatus) continue;

    const trozos = String(sp.spainStatus).split(/;\s+/);
    const quedan = trozos.filter((t) => !sobran.some((f) => {
      const cabeza = String(f.norma).split(',')[0].trim();   // «Real Decreto 630/2013», «Ley 9/1999»…
      return cabeza && t.includes(cabeza);
    }));
    if (quedan.length === trozos.length) continue;

    const texto = quedan.length
      ? quedan.join('; ')
      : `No incluida en el LESRPE ni en el Catálogo Español de Especies Amenazadas [${FUENTE}]`;
    cambios.spain.push({ n: sp.scientificName, antes: sp.spainStatus, ahora: texto,
      quitados: trozos.length - quedan.length });
    sp.spainStatus = texto;
  }

  // --- 2. featured -------------------------------------------------------------------------------
  for (const sp of park.species) {
    const debe = (sp.rarityScore || 0) >= RARITY_DESTACADA;
    if (!!sp.featured !== debe) { sp.featured = debe; cambios.featured++; }
  }

  // --- 3. exóticas fuera -------------------------------------------------------------------------
  // Los `id` de especie de este park.json son NUMÉRICOS, no slugs: los enlaces especie↔hábitat hay
  // que limpiarlos por ese id, o quedan referencias huérfanas (el arruí está en 9 hábitats y el
  // tabaco moruno en 5).
  const idsFuera = new Set();
  const quedan = [];
  for (const sp of park.species) {
    if (EXOTICAS.includes(sp.scientificName)) { cambios.fuera.push(sp.scientificName); idsFuera.add(sp.id); continue; }
    quedan.push(sp);
  }
  park.species = quedan;
  let enlaces = 0;
  for (const h of park.habitats || []) {
    if (!Array.isArray(h.speciesIds)) continue;
    const antes = h.speciesIds.length;
    h.speciesIds = h.speciesIds.filter((id) => !idsFuera.has(id));
    enlaces += antes - h.speciesIds.length;
  }
  cambios.enlaces = enlaces;

  // --- 4. sinonimia ------------------------------------------------------------------------------
  for (const sp of park.species) {
    const aceptado = SINONIMOS[sp.scientificName];
    if (!aceptado) continue;
    const antes = sp.scientificName;
    sp.scientificName = aceptado;
    sp.source = `${sp.source || ''}${sp.source ? ' ' : ''}Nombre aceptado en EIDOS; ${antes} es sinónimo.`.trim();
    cambios.renombradas.push(`${antes} → ${aceptado}`);
  }

  console.log(`spainStatus reescritos: ${cambios.spain.length}`);
  for (const c of cambios.spain.slice(0, 6)) {
    console.log(`   ${c.n}\n      antes: ${String(c.antes).slice(0, 110)}\n      ahora: ${String(c.ahora).slice(0, 110)}`);
  }
  console.log(`featured cambiados: ${cambios.featured}  → destacadas ahora: ${park.species.filter((s) => s.featured).length}`);
  console.log(`fuera del catálogo: ${cambios.fuera.join(', ') || '—'}  → especies: ${park.species.length}  (enlaces a hábitats retirados: ${cambios.enlaces})`);
  console.log(`renombradas: ${cambios.renombradas.length}`);
  for (const r of cambios.renombradas) console.log('   ' + r);

  if (DRY) { console.log('\nSimulación: no se ha escrito nada.'); return; }
  fs.writeFileSync(PARK, JSON.stringify(park, null, 2) + '\n');
  console.log(`\n→ ${path.relative(RAIZ, PARK)}`);
}



main();
