#!/usr/bin/env node
'use strict';
/*
 * especies-sitio-rn2000.js — trae la LISTA OFICIAL DE ESPECIES de cada sitio Red Natura 2000 con el
 * que solapa un espacio: las secciones 3.2 y 3.3 de su Formulario Normalizado de Datos (FND/SDF).
 *
 * El problema que resuelve
 * -----------------------
 * Es la pieza que el procedimiento daba por hecha desde el piloto y que nunca estuvo cableada. El
 * diseño (README §2 y §4, `Docs/arquitectura/MODELO-DE-DATOS.md`) dice que las aves NO entran por
 * GBIF —vuelan: sus ocurrencias caen dentro de cualquier polígono, y eran el 88 % del barrido— sino
 * por la lista oficial del sitio, con evidencia propia. Pero esa lista no la leía nadie: no había
 * una sola llamada a ninguna fuente de sitios, `zepaSiteCode` se rellenaba del `zepa.geojson` del
 * propio espacio (que solo dice «este espacio solapa con esta ZEPA», no qué especies tiene) y las
 * aves acababan entrando por la misma puerta de GBIF que una planta. Resultado medido antes de este
 * cambio: **557 de 1.492 fichas del catálogo eran aves y 366 de ellas llevaban una `reviewNote`**
 * que pedía contrastar con una lista que ninguna herramienta sabía pedir. El aviso «a revisar»
 * dejaba de significar «esta ficha tiene una duda» para significar «esto es un ave».
 *
 * Por qué el IEPNB y no Discodata/BISE, que es lo que decía el README
 * ------------------------------------------------------------------
 * Porque el mismo dato lo publica MITECO, y mejor situado para este repo:
 *
 *   · Es la fuente NACIONAL del FND, no la reexportación europea. El IEPNB es quien rellena el
 *     formulario que la EEA agrega después.
 *   · Vive en `iepnb.gob.es`, el host de EIDOS, que ya está registrado en `check-egress.js` y ya se
 *     usa en todo el pipeline. Discodata (`discodata.eea.europa.eu`) no lo está, y de hecho la
 *     política de egreso lo rechaza con un 403 al CONNECT: la nota de revisión que hablaba de que
 *     «el servicio Discodata rechaza las tablas probadas» describía un callejón sin salida.
 *   · Sirve las DOS secciones del formulario, y la 3.3 es justo la que la EEA cuesta más cruzar.
 *
 * Servicio: `https://iepnb.gob.es/api/rn2000/` («Servicio Web de la Red Natura 2000», PostgREST,
 * sin autenticación). Vistas usadas:
 *
 *   · `v_cntr_site`          — el sitio: nombre, tipo (A=ZEPA, B=LIC/ZEC, C=ambas) y año de reporte.
 *   · `v_cntr_species`       — sección 3.2: especies de los anexos de las Directivas Hábitats y Aves.
 *   · `v_cntr_other_species` — sección 3.3: otras especies importantes, sin figura de anexo.
 *
 * Lo que NO hace: no escribe en `park.json` ni en la BD (regla nº 2 de `Tools/CLAUDE.md`). Deja el
 * volcado en `out/` para que lo lea `build-species-seleccion.js`.
 *
 * Y no se calla un cero, pero tampoco lo confunde con un fallo. Hay TRES ceros distintos y solo uno
 * es un error, así que se distinguen preguntando antes por el sitio en `v_cntr_site`:
 *
 *   · El espacio no solapa con ningún sitio Natura 2000 (Monte Arabí, Monumento Natural). Es un dato
 *     oficial: se escribe el volcado vacío diciéndolo.
 *   · El sitio existe y su formulario no enumera especies. También es un dato: ES6200010 «Cuatro
 *     Calas» está designado por sus 11 hábitats y no lista ni una especie en las secciones 3.2/3.3.
 *     Se avisa por pantalla y queda marcado `sinEspecies` en el volcado.
 *   · El código de sitio no existe en el servicio. ESO sí es un fallo —un código mal copiado o una
 *     vista que ha cambiado— y aborta, en vez de devolver una lista vacía en silencio como hizo el
 *     Atlas cuando cambió el extractor de PDF (CLAUDE.md §2).
 *
 * Uso:
 *   node Tools/catalogo-nacional/especies-sitio-rn2000.js --park <slug> [--sitios ES…,ES…]
 *                                                         [--out <ruta>] [--dry]
 *
 *   --sitios  fuerza los códigos de sitio en vez de leerlos de `geo/zepa.geojson` y `geo/lic.geojson`.
 *   --dry     no escribe: solo informa por pantalla.
 */

const fs = require('fs');
const path = require('path');
const { arg, flag, requireArgs, die, sleep } = require('../lib/cli');
const { OUT_DIR, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');
const { getJson } = require('../lib/http');
const { binomio } = require('../lib/atlas');

const HOST = 'iepnb.gob.es';
const BASE = '/api/rn2000';
const THROTTLE_MS = 150;

const PARK = arg('park');
const DRY = flag('dry');
requireArgs('Uso: --park <slug> [--sitios ES…,ES…] [--out <ruta>] [--dry]', { park: PARK });

const RUTA_OUT = fromRoot(arg('out', path.join(OUT_DIR, `${PARK}-rn2000-sitio.json`)));

// Los códigos de grupo del formulario. Se traducen porque `B` no se entiende en un informe y porque
// es lo que permite al selector pedir «las aves» sin volver a escribir la tabla en otro sitio.
const GRUPOS = {
  A: 'Anfibios', B: 'Aves', F: 'Peces', I: 'Invertebrados', M: 'Mamíferos', P: 'Plantas', R: 'Reptiles',
};
// Tipo de población en el sitio (campo `species_type` del FND). Es lo que distingue al ave que cría
// aquí de la que solo pasa el invierno, y alimenta la estacionalidad de la ficha.
const TIPOS = {
  p: 'permanente', r: 'reproductora', c: 'en concentración', w: 'invernante',
};
// Tamaño relativo de la población (campo `species_category`), cuando el formulario no da cifras.
const CATEGORIAS = { C: 'común', R: 'escasa', V: 'muy escasa', P: 'presente' };

/** Los códigos de sitio Natura 2000 del espacio, de sus propias capas geo. */
function codigosDelEspacio(geoDir) {
  const codigos = new Map();
  for (const [fichero, figura] of [['zepa.geojson', 'ZEPA'], ['lic.geojson', 'LIC/ZEC']]) {
    const f = path.join(geoDir, fichero);
    if (!fs.existsSync(f)) continue;
    const gj = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const feat of gj.features || []) {
      const p = feat.properties || {};
      // Las dos capas no escriben la clave igual: la ZEPA en minúsculas y el LIC en mayúsculas, tal
      // como los sirve cada descarga. Buscar solo una devuelve `undefined` sin quejarse.
      const codigo = p.site_code || p.SITE_CODE || null;
      if (!codigo) continue;
      if (!codigos.has(codigo)) codigos.set(codigo, { code: codigo, figura, name: p.site_name || p.SITE_NAME || null });
    }
  }
  return [...codigos.values()];
}

/** Filas de una vista para un sitio, quedándose con el año de reporte más reciente que traiga. */
async function filasDelSitio(vista, codigo, campos) {
  await sleep(THROTTLE_MS);
  const filas = await getJson(HOST, `${BASE}/${vista}?site_code=eq.${encodeURIComponent(codigo)}&select=${campos}`, {
    agent: 'especies-sitio-rn2000',
  });
  if (!Array.isArray(filas)) {
    // PostgREST contesta 200 con un objeto de error, igual que EIDOS. Tratarlo como lista vacía
    // convertiría un fallo del servicio en «este sitio no tiene especies».
    die(`${vista} devolvió un objeto en vez de una lista para ${codigo}: ${JSON.stringify(filas).slice(0, 200)}`);
  }
  const años = [...new Set(filas.map(f => f.year).filter(Boolean))];
  const ultimo = años.length ? Math.max(...años) : null;
  return { filas: ultimo ? filas.filter(f => f.year === ultimo) : filas, año: ultimo, añosDisponibles: años.sort() };
}

function normaliza(fila, seccion, sitio) {
  const esOtras = seccion === '3.3';
  const nombre = esOtras ? fila.other_species_name : fila.species_name;
  const grupo = esOtras ? fila.other_species_group : fila.species_group;
  const categoria = esOtras ? fila.other_species_category : fila.species_category;
  return {
    // El nombre TAL CUAL lo escribe el formulario: trae subespecies trinomiales
    // («Phalacrocorax aristotelis aristotelis»), autorías («Anagallis tenella (L.) L.») y
    // salvedades entre paréntesis («Falco peregrinus ([including pelegrinoides])»).
    scientificName: nombre,
    // Y la clave con la que se cruza, que es el mismo `binomio` que usa el anexo normativo: sin
    // normalizar, ninguno de esos tres nombres casaría con lo que sirve GBIF.
    binomio: binomio(nombre),
    grupo: GRUPOS[grupo] || grupo || null,
    grupoCodigo: grupo || null,
    seccion,
    codigoFnd: esOtras ? (fila.other_species_code || null) : (fila.species_code || null),
    tipoPoblacion: esOtras ? null : (TIPOS[fila.species_type] || fila.species_type || null),
    categoriaPoblacion: CATEGORIAS[categoria] || categoria || null,
    // Solo en la 3.3: por qué la incluye el formulario (D = especie de la lista roja/endemismo, etc.).
    motivacion: esOtras ? (fila.other_species_motivation || null) : null,
    siteCode: sitio.code,
    siteName: sitio.name,
    siteFigura: sitio.figura,
  };
}

async function main() {
  const espacio = parkFiles().find(p => p.slug === PARK);
  if (!espacio) die(`No existe Frontend/Data/parks/**/${PARK}/park.json`);
  const geoDir = path.join(path.dirname(espacio.file), 'geo');

  const sitios = arg('sitios')
    ? arg('sitios').split(',').map(s => ({ code: s.trim(), figura: 'dado en la línea de órdenes', name: null })).filter(s => s.code)
    : codigosDelEspacio(geoDir);

  console.log(`\nEspacio: ${PARK}`);
  if (!sitios.length) {
    // Que un espacio no esté en Red Natura 2000 es un dato oficial, no un hueco: hay figuras
    // autonómicas (Monumento Natural, Paisaje Protegido) que no solapan con ningún sitio. Se escribe
    // el volcado igual, vacío y diciéndolo, para que el selector distinga «no hay lista» de
    // «no se ha consultado».
    console.log('Sin sitios Red Natura 2000 en sus capas geo: este espacio NO tiene lista oficial de');
    console.log('especies por sitio. El respaldo documental posible es el anexo normativo de su plan.');
    const doc = {
      _nota: 'GENERADO por Tools/catalogo-nacional/especies-sitio-rn2000.js. No editar a mano. ' +
        'Este espacio no solapa con ningún sitio Red Natura 2000, así que no existe Formulario ' +
        'Normalizado de Datos del que sacar una lista oficial de especies.',
      park: PARK, generado: new Date().toISOString().slice(0, 10),
      fuente: `IEPNB · Servicio Web de la Red Natura 2000 (https://${HOST}${BASE}/)`,
      sitios: [], total: 0, especies: [],
    };
    if (!DRY) { writeJson(RUTA_OUT, doc); console.log(`\nEscrito ${rel(RUTA_OUT)} (vacío, y dice por qué).`); }
    return;
  }

  const especies = [];
  const resumenSitios = [];
  for (const sitio of sitios) {
    await sleep(THROTTLE_MS);
    const info = await getJson(HOST, `${BASE}/v_cntr_site?site_code=eq.${encodeURIComponent(sitio.code)}` +
      '&select=site_code,site_name,site_type,site_area,year', { agent: 'especies-sitio-rn2000' });
    // Sin esta comprobación, un código mal copiado devuelve cero especies y parece un sitio pobre en
    // vez de una consulta equivocada. Es la diferencia entre los dos ceros legítimos y el que no lo es.
    if (!Array.isArray(info) || !info.length) {
      die(`El código de sitio ${sitio.code} no existe en el servicio Red Natura 2000 del IEPNB.\n` +
          `  Sale de ${rel(geoDir)}, así que o la capa trae un código equivocado o la vista ha cambiado.\n` +
          `  Compruébalo: curl 'https://${HOST}${BASE}/v_cntr_site?site_code=eq.${sitio.code}'`);
    }
    sitio.name = info[0].site_name || sitio.name;
    sitio.tipoSitio = info[0].site_type || null;

    const s32 = await filasDelSitio('v_cntr_species', sitio.code,
      'species_group,species_code,species_name,species_type,species_category,species_sensitive,year');
    const s33 = await filasDelSitio('v_cntr_other_species', sitio.code,
      'other_species_group,other_species_code,other_species_name,other_species_category,other_species_motivation,year');

    // El sitio existe (lo acaba de confirmar `v_cntr_site`) y no enumera especies: hay sitios
    // designados solo por sus hábitats. Se dice en voz alta —una lista oficial vacía cambia lo que
    // el selector puede aprobar— y queda anotado en el volcado.
    const sinEspecies = !s32.filas.length && !s33.filas.length;
    if (sinEspecies) {
      console.log(`  ${sitio.code} ${(sitio.name || '').padEnd(34)} ${String(sitio.figura).padEnd(8)} ` +
        'SIN especies en las secciones 3.2 ni 3.3 de su formulario.');
      console.log('        El sitio existe y está designado por sus hábitats: no aporta respaldo de especie.');
    }

    for (const f of s32.filas) especies.push(normaliza(f, '3.2', sitio));
    for (const f of s33.filas) especies.push(normaliza(f, '3.3', sitio));

    const porGrupo = {};
    for (const e of especies.filter(x => x.siteCode === sitio.code)) {
      porGrupo[e.grupo] = (porGrupo[e.grupo] || 0) + 1;
    }
    resumenSitios.push({
      code: sitio.code, name: sitio.name, figura: sitio.figura, tipoSitio: sitio.tipoSitio || null,
      año: s32.año || s33.año, seccion32: s32.filas.length, seccion33: s33.filas.length,
      sinEspecies, porGrupo,
    });
    if (sinEspecies) continue;
    console.log(`  ${sitio.code} ${(sitio.name || '').padEnd(34)} ${String(sitio.figura).padEnd(8)} ` +
      `3.2: ${String(s32.filas.length).padStart(3)} · 3.3: ${String(s33.filas.length).padStart(3)} ` +
      `· reporte ${s32.año || s33.año}`);
    for (const [g, n] of Object.entries(porGrupo).sort((a, b) => b[1] - a[1])) {
      console.log(`        ${String(n).padStart(3)} ${g}`);
    }
  }

  // Una especie puede figurar en el formulario de DOS sitios del mismo espacio (una ZEPA y un LIC que
  // se solapan). Se deja una entrada por sitio —la procedencia es distinta— pero se cuenta una vez.
  const distintas = new Set(especies.map(e => e.binomio).filter(Boolean));
  const aves = especies.filter(e => e.grupoCodigo === 'B');
  console.log(`\nTotal: ${especies.length} entradas · ${distintas.size} taxones distintos · ${aves.length} aves`);

  const doc = {
    _nota: 'GENERADO por Tools/catalogo-nacional/especies-sitio-rn2000.js. No editar a mano. ' +
      'Es la lista OFICIAL de especies de los sitios Red Natura 2000 con los que solapa el espacio: ' +
      'secciones 3.2 (especies de los anexos de las Directivas) y 3.3 (otras especies importantes) ' +
      'de su Formulario Normalizado de Datos. Es la fuente que afirma la pertenencia AL SITIO, y por ' +
      'eso es el respaldo documental de las aves, que no se pueden adscribir a un polígono de hábitat.',
    park: PARK,
    generado: new Date().toISOString().slice(0, 10),
    fuente: `IEPNB · Servicio Web de la Red Natura 2000 (https://${HOST}${BASE}/): ` +
      'v_cntr_site, v_cntr_species (sección 3.2) y v_cntr_other_species (sección 3.3)',
    sitios: resumenSitios,
    total: especies.length,
    taxonesDistintos: distintas.size,
    especies: especies.sort((a, b) =>
      a.siteCode.localeCompare(b.siteCode) || a.seccion.localeCompare(b.seccion) ||
      String(a.scientificName).localeCompare(String(b.scientificName))),
  };

  if (DRY) { console.log('\n--dry: no se escribe nada.'); return; }
  writeJson(RUTA_OUT, doc);
  console.log(`\nEscrito ${rel(RUTA_OUT)}`);
}

main().catch(e => die(e.stack || e.message));
