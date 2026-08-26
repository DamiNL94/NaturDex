#!/usr/bin/env node
'use strict';
/*
 * atlas-puente-nomenclatura.js — resuelve contra EIDOS los nombres con los que el Atlas de 2005 cita
 * las especies características, para que el cruce con el catálogo de hoy no se pierda un cambio de
 * género.
 *
 * El problema que resuelve
 * -----------------------
 * Es la deuda nº 26. El Atlas y el catálogo se cruzan por `binomio()` (Tools/lib/atlas.js), que
 * normaliza la desinencia latina del epíteto —*Sedum sediforme* / *sediformis*— pero **no toca el
 * género**. El esparto es el caso de manual: el Atlas dice *Stipa tenacissima* y el catálogo ficha
 * *Macrochloa tenacissima*, así que no casan y la especie se queda sin su evidencia `caracteristica`
 * en los cuatro espacios donde hoy es «solo GBIF».
 *
 * Es la trampa del §2 del CLAUDE.md —cruzar una fuente oficial con el catálogo por el nombre—
 * aplicada al Atlas, la misma que ya pagaron las aves, y la salida es la que enseña
 * `Docs/runbook/AVES.md` §5: **resolver contra EIDOS el nombre que escribe la FUENTE**. NO se dan de
 * alta equivalencias en `data/equivalencias-nomenclatura.json`: ese fichero prohíbe expresamente
 * registrar lo que EIDOS ya sabe, porque serían una segunda verdad que puede divergir de la primera.
 *
 * DE DÓNDE SACA LOS NOMBRES, Y QUÉ COBERTURA DA CADA FUENTE (esto hay que leerlo)
 * -------------------------------------------------------------------------------
 * El `atlas.txt` **no se versiona** —son megabytes de dato reproducible—, así que sin el PDF los
 * únicos nombres disponibles son los que ya están en el repositorio, y **no cubren el caso que esta
 * herramienta existe para arreglar**:
 *
 *   · `--atlas <atlas.txt[,otro.txt]>` → los nombres del ATLAS, todos. Es la fuente COMPLETA y la
 *     única con la que el esparto aparece: *Stipa tenacissima* solo existe en el PDF, porque
 *     precisamente NO casó con ningún catálogo y por eso no quedó escrito en ningún sitio.
 *   · sin `--atlas` → `out/<slug>-hic-especies.json`, que guarda en `links[].atlas_name` los nombres
 *     del Atlas **que YA casaron** y en `hic[].especies` los nombres del CATÁLOGO con los que
 *     casaron. Sirve para tender el puente entre parques —el género que un espacio ficha viejo y
 *     otro nuevo— pero **por construcción no puede descubrir un fallo de cruce**: si un nombre del
 *     Atlas no casó, no está aquí.
 *
 * O sea: sin el PDF esto es útil y es honesto, pero **no termina la deuda nº 26**. Lo dice al correr.
 *
 * La caché NO lleva el slug de ningún espacio, y es a propósito: la especie característica de un HIC
 * lo es en toda la Directiva, así que el puente es universal y se comparte entre espacios y entre
 * pases. Un nombre que EIDOS no resuelve se cachea como `null` —«no lo resuelve» es un resultado— y
 * un fallo de RED no se cachea, para que el reintento vuelva a preguntarlo.
 *
 * Idempotente: con la caché completa, un segundo pase no gasta una petición ni cambia un byte.
 *
 * Uso:
 *     node Tools/catalogo-nacional/atlas-puente-nomenclatura.js [--atlas <atlas.txt>] [--write]
 *                                                               [--cache-atlas <ruta>]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag, sleep } = require('../lib/cli');
const { OUT_DIR, readJson, readJsonIf, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');
const { tiendePuente, puenteDesdeCache, binomio, especiesCaracteristicas } = require('../lib/atlas');
const eidos = require('../lib/eidos');

const WRITE = flag('write');
const CACHE = fromRoot(arg('cache-atlas', path.join(OUT_DIR, 'atlas-eidos-nombres-cache.json')));
const RUTA_ATLAS = String(arg('atlas', '')).split(',').map((x) => x.trim()).filter(Boolean).map(fromRoot);

/**
 * Los nombres a resolver. Con `--atlas`, los del PDF (fuente completa). Sin él, los de los índices
 * versionados: el `atlas_name` de cada enlace —nombres del Atlas que YA casaron— y el nombre del
 * catálogo con el que casaron. Se juntan los dos porque el puente sirve en las dos direcciones
 * (entre el Atlas y el catálogo, y entre un parque que ficha con el género viejo y otro con el nuevo).
 */
function nombresAResolver() {
  if (RUTA_ATLAS.length) {
    const codigos = new Set();
    for (const p of parkFiles()) {
      for (const h of readJson(p.file).habitats || []) if (h.code) codigos.add(h.code);
    }
    const set = new Set();
    for (const ruta of RUTA_ATLAS) {
      if (!fs.existsSync(ruta)) { console.error(`No existe el texto del Atlas: ${ruta}`); process.exit(1); }
      const { porHic } = especiesCaracteristicas(ruta, codigos);
      for (const especies of porHic.values()) for (const n of especies) set.add(n);
    }
    return { nombres: [...set].sort(), fuente: `Atlas (${RUTA_ATLAS.length} texto(s)) · ${codigos.size} códigos HIC`, completa: true };
  }

  if (!fs.existsSync(OUT_DIR)) return { nombres: [], fuente: null, completa: false };
  const ficheros = fs.readdirSync(OUT_DIR).filter((n) => /-hic-especies\.json$/.test(n)).sort();
  const set = new Set();
  for (const f of ficheros) {
    const doc = readJson(path.join(OUT_DIR, f));
    for (const l of doc.links || []) if (l.atlas_name) set.add(l.atlas_name);
    for (const v of Object.values(doc.hic || {})) for (const n of v.especies || []) set.add(n);
  }
  return { nombres: [...set].sort(), fuente: `${ficheros.length} índice(s) versionados`, completa: false };
}

async function main() {
  const { nombres, fuente, completa } = nombresAResolver();
  if (!nombres.length) {
    console.error(`Sin nombres que resolver: no hay ningún out/<slug>-hic-especies.json en ${rel(OUT_DIR)}.`);
    console.error('Se generan con: node Tools/catalogo-nacional/atlas-hic-especies.js --atlas <atlas.txt> --park <slug>');
    process.exit(1);
  }
  const cache = readJsonIf(CACHE, {}) || {};
  const yaEn = Object.keys(cache).length;
  const faltan = nombres.filter((n) => !(n in cache));

  console.log(`Fuente: ${fuente} · ${nombres.length} nombre(s) distintos · ` +
    `${yaEn} en caché · ${faltan.length} por resolver`);
  if (!completa) {
    console.log('⚠ SIN --atlas la cobertura es PARCIAL y no cierra la deuda nº 26: los índices solo');
    console.log('  guardan los nombres del Atlas que YA casaron, así que un fallo de cruce —el');
    console.log('  esparto, «Stipa tenacissima»— no puede aparecer aquí. Para eso hace falta el PDF.');
  }
  if (!WRITE) {
    if (faltan.length) {
      console.log('\nSe consultarían a EIDOS (primeros 20):');
      for (const n of faltan.slice(0, 20)) console.log('  · ' + n);
      if (faltan.length > 20) console.log(`  … y ${faltan.length - 20} más`);
    }
    console.log('\n(Simulación: nada escrito ni consultado. Añade --write.)');
    return;
  }

  const descartados = [];
  const { pedidas } = await tiendePuente(nombres, {
    resolveTaxon: (n) => eidos.resolveTaxon(n), cache, sleep, throttleMs: eidos.THROTTLE_MS,
  });
  const mapa = puenteDesdeCache(cache, descartados);
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  writeJson(CACHE, cache);
  console.log(`\n${pedidas} petición(es) a EIDOS · escrito ${rel(CACHE)}`);

  // Lo que de verdad importa: qué nombres CAMBIAN de binomio, que son los que el cruce se perdía.
  const cambios = [];
  for (const [nombre, r] of Object.entries(cache)) {
    if (!r || !r.acceptedName) continue;
    const b = binomio(nombre);
    const hoy = b && mapa.get(b);
    if (hoy && hoy !== b) cambios.push(`${nombre}  →  ${r.acceptedName}`);
  }
  const sinResolver = Object.entries(cache).filter(([, r]) => !r).map(([n]) => n);

  console.log(`\n${cambios.length} recombinación(es) puenteadas — mismo epíteto, otro género:`);
  for (const c of cambios.sort()) console.log('  · ' + c);

  if (descartados.length) {
    console.log(`\n⚠ ${descartados.length} que EIDOS relaciona pero NO se puentean: cambian de ` +
      'epíteto, o sea de identidad, no de combinación.');
    console.log('  Colgar el HIC del segundo taxón porque lo tenía el primero sería inventar un ' +
      'dato, y este puente se usa solo en positivo: nadie lo desmentiría después.');
    console.log('  Van con la fuente delante y de uno en uno (es la misma decisión de la deuda nº 27):');
    for (const d of descartados.sort((a, b) => a.nombre.localeCompare(b.nombre))) {
      console.log(`  · ${d.nombre}  →  ${d.acceptedName}`);
    }
  }
  if (sinResolver.length) {
    console.log(`\n${sinResolver.length} que EIDOS no resuelve. NO son un fallo: el Atlas cita ` +
      'alianzas fitosociológicas y géneros sueltos además de especies.');
    for (const n of sinResolver.sort().slice(0, 15)) console.log('  · ' + n);
    if (sinResolver.length > 15) console.log(`  … y ${sinResolver.length - 15} más`);
  }
  console.log('\nLo leen `species:seleccion --atlas` y `especies:niveles`, los dos desde esta misma caché.');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
