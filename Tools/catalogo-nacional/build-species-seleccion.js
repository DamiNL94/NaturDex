#!/usr/bin/env node
'use strict';
/*
 * build-species-seleccion.js — construye la SELECCIÓN de especies de un espacio: la lista aprobada
 * que `build-species-n2.js` convierte después en la Capa 3 de su `park.json`.
 *
 * El problema que resuelve
 * -----------------------
 * Era el último paso de la Capa 3 sin herramienta. `gbif-habitats.js` da los candidatos y
 * `build-species-n2.js` sabe escribirlos, pero entre los dos había un fichero
 * —`out/<slug>-seleccion-especies.json`— que alguien tenía que producir a mano cruzando GBIF con
 * EIDOS especie por especie. En Carrascoy fueron 625 candidatos para 245 aprobadas; hacerlo a mano
 * otra vez en el espacio siguiente no es lento, es **irreproducible**: nadie puede comprobar después
 * por qué entró una y no otra.
 *
 * Los filtros encadenados, que son los que fijó la selección de Carrascoy y aquí se aplican
 * igual para todos los espacios:
 *
 *   1. CONSTANCIA. Solo entra lo que GBIF ha registrado DENTRO de los polígonos de hábitat del
 *      espacio. Ninguna especie entra por figurar en EIDOS ni por estar fichada en otro parque.
 *   2. AUTOCTONÍA. Se excluye lo que la Lista Patrón del IEPNB marca como «Especie no nativa»
 *      (campo `origen` de v_taxonomia), que es lo que quita ornamentales y exotismos.
 *   3. PRESENCIA CONSIDERABLE, y solo para las que no tienen respaldo documental: al menos
 *      MIN_OCURRENCIAS registros repartidos en MIN_HABITATS hábitats. Las protegidas, las
 *      características del Atlas y las que enumera el anexo normativo del espacio conservan su
 *      plaza aunque tengan pocos registros, porque su respaldo no es el número de avistamientos.
 *   4. ALCANCE TAXONÓMICO (más abajo, con su lista de clases).
 *
 * Por qué GBIF sigue siendo la puerta y el anexo no
 * -------------------------------------------------
 * El anexo de un PORN o un PRUG es mejor fuente que GBIF —es una afirmación oficial y por escrito de
 * que la especie forma parte de ESTE espacio, no un registro que alguien subió—, y por eso da la
 * evidencia más fuerte de las cuatro. Pero no puede ser la puerta de entrada, por dos motivos que el
 * propio rollout dejó documentados:
 *
 *   · No existe para todos. El Anexo I del PRUG de Sierra Espuña NO contiene inventario de valores:
 *     lo encarga como acción pendiente. El PORN de Carrascoy tiene tres inventarios y ninguno es de
 *     especies. El de Sierra de la Pila no se pudo ni abrir. Con el anexo de puerta, esos espacios
 *     entrarían con cero especies y el de al lado con doscientas: la misma incomparabilidad que el
 *     filtro de alcance taxonómico se escribió para evitar.
 *   · Enumera lo protegido, no lo presente. Un catálogo hecho solo de anexos deja fuera la encina y
 *     deja dentro el endemismo del que hay tres rodales.
 *
 * Así que el anexo entra como SEÑAL, no como puerta: da evidencia, salva del filtro de presencia y
 * ordena la prioridad de curación. Y lo que el anexo enumera y GBIF no confirma no se aprueba, pero
 * tampoco se pierde: sale en el informe como hueco a contrastar en campo.
 *
 * RAREZA
 * ------
 * `rarityScore` (1–5) sale de la AUTORIDAD LEGAL y de nada más: la categoría estatal más grave que
 * EIDOS devuelve para el taxón. No mezcla señales de abundancia —ni ocurrencias de GBIF, ni en
 * cuántos espacios aparece—, que serían un dato derivado más al que habría que buscarle respaldo;
 * el estado legal es dato oficial directo (CLAUDE.md, regla nº 1). Es un tramo estatal, y por eso
 * puede vivir en el catálogo universal: el catálogo autonómico es territorial y va en `murciaStatus`.
 *
 * El CEEEI (RD 630/2013) NO cuenta como respaldo: es el catálogo de especies exóticas INVASORAS, no
 * una figura de protección. Va por su propio camino (`invasoras-eei.js`).
 *
 * Lo que NO hace: no escribe en `park.json` ni en la BD (regla nº 2 de Tools/CLAUDE.md). Deja la
 * selección y un informe en `out/` para revisarlos antes de adoptarlos. Y no inventa: de cada
 * especie queda escrito de qué fuente sale cada cosa, y las excluidas salen con su motivo en
 * `excluidas_detalle` para poder discutir el criterio sin volver a ejecutarlo todo.
 *
 * Uso:
 *   node Tools/catalogo-nacional/build-species-seleccion.js --park <slug> \
 *        [--atlas <atlas.txt>] [--gbif <ruta>] [--out <ruta>] [--informe <ruta.md>] [--dry]
 *
 *   --atlas   texto del «Atlas y Manual de los Hábitats de España» (pdftotext). Sin él no hay
 *             evidencia `caracteristica` y se dice en el informe, en vez de callarlo.
 *   --anexos  fichero de anexos normativos (por defecto data/anexos-normativos.json). Si el espacio
 *             no tiene entrada, se dice en el informe en vez de callarlo.
 *   --ccaa    comunidad cuyo catálogo regional de especies amenazadas se consulta (por defecto,
 *             la del propio espacio).
 */

const fs = require('fs');
const path = require('path');
const { arg, num, flag, requireArgs, die, sleep } = require('../lib/cli');
const { CATALOGO_DIR, OUT_DIR, readJson, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');
const eidos = require('../lib/eidos');
const { especiesCaracteristicas, binomio } = require('../lib/atlas');
// La escalera 1–5 vive en lib/ porque `rareza-legal.js` aplica exactamente el mismo criterio sobre
// el texto ya redactado del park.json. Dos copias se separarían en cuanto alguien tocara una.
const { tramoDeCategoria, SIGNIFICADO } = require('../lib/rareza');

const PARK = arg('park');
const DRY = flag('dry');
requireArgs('Uso: --park <slug> [--atlas <atlas.txt>] [--gbif <ruta>] [--out <ruta>] [--dry]', { park: PARK });

// Umbrales del filtro 3. Son los de la selección de Carrascoy; se dejan como parámetro porque un
// espacio muy pequeño o muy poco muestreado puede necesitar bajarlos, y entonces tiene que constar.
const MIN_OCURRENCIAS = num('min-occ', 5);
const MIN_HABITATS = num('min-habitats', 2);

/*
 * Filtro 4 — ALCANCE TAXONÓMICO. El que estaba aplicado y sin escribir.
 *
 * Las cuatro selecciones hechas hasta ahora dicen, sin decirlo, qué cataloga NaturDex: de las 448
 * fichas del catálogo universal hay **un solo insecto** y ni un liquen, musgo, hongo o arácnido.
 * No es un descuido: es lo que se puede llevar a una guía de campo con foto y tres pistas de
 * identificación, y es lo que un visitante puede reconocer sin lupa ni clave dicotómica.
 *
 * GBIF no distingue: de los 625 candidatos de Sierra de la Pila, 251 son insectos —muchos
 * microlepidópteros determinados por trampa de luz—. Aprobarlos daría un catálogo con 127 insectos
 * en un espacio y uno en el de al lado, que es peor que cualquiera de las dos opciones por separado.
 *
 * Así que el criterio se escribe aquí, con su lista de clases, y se puede cambiar con
 * `--clases` (lista separada por comas) o desactivar con `--todas-las-clases`. Lo que queda fuera
 * NO se tira: sale en `excluidas_detalle` con este motivo, y recuperarlo es volver a ejecutar.
 */
const CLASES_POR_DEFECTO = [
  // Flora vascular
  'Magnoliopsida', 'Liliopsida', 'Pinopsida', 'Gnetopsida', 'Polypodiopsida', 'Lycopodiopsida',
  // Vertebrados
  'Aves', 'Mammalia', 'Reptilia', 'Squamata', 'Testudines', 'Amphibia', 'Actinopterygii',
];
const TODAS_LAS_CLASES = flag('todas-las-clases');
const CLASES = new Set(
  (arg('clases') ? arg('clases').split(',').map(s => s.trim()) : CLASES_POR_DEFECTO).filter(Boolean)
);

// Caché de EIDOS: un catálogo son ~1.300 peticiones a un servicio público. Sin ella, repetir la
// selección tras ajustar un umbral vuelve a castigar al IEPNB durante diez minutos.
const CACHE = fromRoot(arg('cache', path.join(OUT_DIR, `${PARK}-eidos-seleccion-cache.json`)));

const RUTA_GBIF = fromRoot(arg('gbif', path.join(OUT_DIR, `${PARK}-gbif.json`)));
const RUTA_OUT = fromRoot(arg('out', path.join(OUT_DIR, `${PARK}-seleccion-especies.json`)));
const RUTA_INFORME = fromRoot(arg('informe', path.join(OUT_DIR, `${PARK}-seleccion-especies.md`)));
const RUTA_ATLAS = arg('atlas') ? fromRoot(arg('atlas')) : null;
// El anexo normativo del espacio. Va por defecto porque su ausencia NO es una opción silenciosa: si
// el espacio no tiene entrada, la herramienta lo dice igual que dice que falta el Atlas.
const RUTA_ANEXOS = arg('anexos')
  ? fromRoot(arg('anexos'))
  : path.join(CATALOGO_DIR, 'data', 'anexos-normativos.json');

const hoy = () => new Date().toISOString().slice(0, 10);

// --- Candidatos: GBIF ∩ polígonos de hábitat -------------------------------------------------------
// `gbif-habitats.js` da las ocurrencias por hábitat; aquí se agregan por especie para tener las dos
// magnitudes del filtro 3: cuántos registros y en cuántos hábitats distintos.
function candidatos() {
  if (!fs.existsSync(RUTA_GBIF)) {
    die(`No existe ${rel(RUTA_GBIF)}. Genera antes los candidatos:\n` +
        `  npm run gbif:habitats -- --park ${PARK} --json ${rel(RUTA_GBIF)}`);
  }
  const g = readJson(RUTA_GBIF);
  const porEspecie = new Map();
  for (const h of g.habitats || []) {
    for (const s of h.species || []) {
      const e = porEspecie.get(s.name) || {
        scientificName: s.name, class: s.class || null, gbifOccurrences: 0, hics: new Set(),
      };
      e.gbifOccurrences += s.occurrences || 0;
      // El CONJUNTO de hábitats, no la cuenta: al fusionar dos nombres del mismo taxón hay que
      // unirlos, y sumar las cuentas contaría dos veces los hábitats en que están los dos.
      if (h.hic) e.hics.add(h.hic);
      porEspecie.set(s.name, e);
    }
  }
  for (const e of porEspecie.values()) e.habitats = e.hics.size;
  return [...porEspecie.values()].sort((a, b) => b.gbifOccurrences - a.gbifOccurrences);
}

/*
 * RECONCILIACIÓN TAXONÓMICA — el paso §4 del procedimiento por parque, que no tenía código.
 *
 * GBIF sirve el sinónimo y el nombre aceptado como si fueran dos especies distintas, cada uno con su
 * `speciesKey` y sus ocurrencias. En Sierra de la Pila salieron siete pares así, y dos de ellos
 * habrían metido **la misma especie dos veces en el mismo espacio**: *Sylvia melanocephala* (230
 * registros) junto a *Curruca melanocephala* (24), y *Picus viridis* (13) junto a *Picus sharpei* (6).
 * En el mapa son dos chinchetas; en el catálogo, dos fichas que hay que mantener sincronizadas.
 *
 * Quien los identifica es EIDOS: los dos nombres resuelven al mismo `taxonid`. Así que se agrupa por
 * ahí y se elige UN nombre, con esta prioridad:
 *
 *   1. El que ya use otro espacio para ese mismo `taxonid`. Manda el catálogo, no la fuente: usarlo
 *      REUTILIZA la ficha existente en vez de crear una gemela. Es lo que evita que *Sedum sediforme*
 *      (Cuatro Calas) y *Petrosedum sediforme* (aquí) acaben siendo dos especies para la app.
 *   2. Si ninguno está fichado, el nombre aceptado por EIDOS.
 *   3. Y si EIDOS no da aceptado, el que más registros tenga.
 *
 * Renombrar NO es gratis y por eso solo se hace dentro de este paso: la clave de `data/contenido/` y
 * la del catálogo universal van por nombre científico (CLAUDE.md §2). Aquí todavía no hay nada
 * escrito, que es justo el momento en que sale barato.
 */
function reconcilia(lista, resueltas, porTaxonId) {
  const grupos = new Map();
  const sueltas = [];
  for (const c of lista) {
    const t = resueltas.get(c.scientificName);
    const id = t && t.taxonid;
    if (!id) { sueltas.push(c); continue; }
    if (!grupos.has(id)) grupos.set(id, []);
    grupos.get(id).push(c);
  }

  const salida = [...sueltas];
  const fusiones = [];
  for (const [taxonid, miembros] of grupos) {
    const fichado = porTaxonId.get(String(taxonid));
    let elegido;
    if (fichado && miembros.some(m => m.scientificName === fichado.scientificName)) {
      elegido = miembros.find(m => m.scientificName === fichado.scientificName);
    } else if (fichado) {
      // Ningún candidato se llama como la ficha existente, pero es el mismo taxón: se adopta su
      // nombre para reutilizarla, conservando las ocurrencias que sí son de este espacio.
      elegido = { ...miembros[0], scientificName: fichado.scientificName };
    } else {
      const aceptado = miembros
        .map(m => (resueltas.get(m.scientificName) || {}).nombreAceptadoEidos)
        .find(Boolean);
      const binAceptado = aceptado ? aceptado.split(/\s+/).slice(0, 2).join(' ').toLowerCase() : null;
      elegido = (binAceptado && miembros.find(m => m.scientificName.toLowerCase().startsWith(binAceptado)))
        || miembros[0];
    }

    if (miembros.length > 1) {
      const fusionado = {
        ...elegido,
        gbifOccurrences: miembros.reduce((s, m) => s + m.gbifOccurrences, 0),
        hics: new Set(miembros.flatMap(m => [...m.hics])),
      };
      fusionado.habitats = fusionado.hics.size;
      fusionado.sinonimosFusionados = miembros
        .map(m => m.scientificName).filter(n => n !== elegido.scientificName);
      fusiones.push({ taxonid, elegido: elegido.scientificName, fusionados: fusionado.sinonimosFusionados });
      salida.push(fusionado);
    } else {
      if (elegido.scientificName !== miembros[0].scientificName) {
        fusiones.push({ taxonid, elegido: elegido.scientificName, renombradaDe: miembros[0].scientificName });
      }
      salida.push(elegido);
    }
  }
  return { lista: salida.sort((a, b) => b.gbifOccurrences - a.gbifOccurrences), fusiones };
}

// --- Reutilización: ¿esta especie ya está fichada en otro espacio? ----------------------------------
// Es la decisión (c) del §0 del rollout: una Aquila fasciata de Murcia y una de Cádiz son la misma
// ficha. Saber de antemano cuántas se reutilizan es lo que dice si el catálogo nacional está
// funcionando o si cada espacio se está escribiendo su propio catálogo en paralelo.
function yaFichadas() {
  const porNombre = new Map();
  // El mismo índice por `eidosTaxonId`, que es la clave maestra del modelo: es lo que permite
  // reconocer que el candidato *Petrosedum sediforme* y la ficha *Sedum sediforme* de Cuatro Calas
  // son la misma especie, cosa que comparar nombres no dice.
  const porTaxonId = new Map();
  for (const p of parkFiles()) {
    if (p.slug === PARK) continue;
    for (const s of (readJson(p.file).species || [])) {
      if (!s.scientificName) continue;
      if (!porNombre.has(s.scientificName)) porNombre.set(s.scientificName, p.slug);
      const id = s.eidosTaxonId != null ? String(s.eidosTaxonId) : null;
      if (id && !porTaxonId.has(id)) porTaxonId.set(id, { scientificName: s.scientificName, slug: p.slug });
    }
  }
  return { porNombre, porTaxonId };
}

// --- Atlas: especies características de los HIC de ESTE espacio -------------------------------------
// Se cruza contra los candidatos de GBIF, no contra el park.json: en un espacio que todavía no tiene
// Capa 3 el catálogo está vacío, y cruzarlo con él daría cero.
function caracteristicasPorEspecie(codigos) {
  if (!RUTA_ATLAS) return { mapa: new Map(), leido: false };
  if (!fs.existsSync(RUTA_ATLAS)) die(`No existe el texto del Atlas: ${RUTA_ATLAS}`);
  const { porHic, bloques, bloquesConEspecies } = especiesCaracteristicas(RUTA_ATLAS, codigos);
  if (bloques && !bloquesConEspecies) {
    die(`El Atlas tiene ${bloques} bloques de «Especies características» y no se ha leído ninguna ` +
        'especie. Revisa la extracción del PDF antes de seguir.');
  }
  const mapa = new Map();
  for (const [codigo, especies] of porHic) {
    for (const nombre of especies) {
      const b = binomio(nombre);
      if (!b) continue;
      if (!mapa.has(b)) mapa.set(b, []);
      mapa.get(b).push(codigo);
    }
  }
  return { mapa, leido: true, bloques };
}

// --- Anexo normativo del espacio ---------------------------------------------------------------------
/*
 * La lista de especies que la norma de declaración o gestión del espacio enumera por escrito. Es la
 * evidencia más fuerte de las cuatro y la única que afirma la pertenencia AL ESPACIO en vez de a un
 * polígono o a un tipo de hábitat.
 *
 * Se indexa por BINOMIO, no por el nombre completo: las normas escriben *Tetrax tetrax* (Linnaeus,
 * 1758), *Quercus ilex* subsp. *ballota* y variantes con autoría, y compararlas con el nombre que
 * sirve GBIF a pelo daría cero coincidencias sin que nadie se enterase.
 */
function anexoNormativo() {
  if (!fs.existsSync(RUTA_ANEXOS)) return { mapa: new Map(), fuente: null, consultado: false };
  const doc = readJson(RUTA_ANEXOS);
  const entrada = (doc.espacios || {})[PARK];
  if (!entrada) return { mapa: new Map(), fuente: null, consultado: false };
  const mapa = new Map();
  for (const e of entrada.especies || []) {
    const b = binomio(e.scientificName);
    if (!b) continue;
    mapa.set(b, e);
  }
  return { mapa, fuente: entrada.fuente || null, consultado: true, total: (entrada.especies || []).length };
}

// --- EIDOS: autoctonía y estado legal ---------------------------------------------------------------
const cache = fs.existsSync(CACHE) ? readJson(CACHE) : {};

/**
 * Resuelve una especie contra EIDOS: origen (Lista Patrón) y normas vigentes.
 * Un fallo de red NO se traga: la especie queda marcada `error` y sale en el informe, porque
 * tratarla como «sin normas» la degradaría al filtro de presencia sin que nadie se enterara.
 */
async function resuelve(nombre, ccaa) {
  // La pausa va aquí y no en el llamante: solo hay que ser cortés con el IEPNB cuando de verdad se
  // sale a la red. Con la caché caliente, repetir la selección es instantáneo.
  if (cache[nombre]) return cache[nombre];
  await sleep(eidos.THROTTLE_MS);
  const r = { origen: null, normasRaw: [], nombreAceptadoEidos: null, taxonid: null, error: null };
  try {
    const t = await eidos.resolveTaxon(nombre);
    if (t.status !== 'no-encontrada') {
      r.taxonid = t.taxonid;
      r.origen = (t.taxon && t.taxon.origen) || null;
      if (t.status === 'sinonimo' && t.acceptedName) r.nombreAceptadoEidos = t.acceptedName;
    }
    if (r.taxonid) {
      await sleep(eidos.THROTTLE_MS);
      const legal = await eidos.legalStatus(r.taxonid, ccaa);
      // Se cachea la verdad CRUDA —todas las filas vigentes— y se decide después cuáles cuentan como
      // protección. Si se filtrase aquí, ajustar el criterio obligaría a repetir las 1.300 peticiones.
      r.normasRaw = [
        ...legal.nacional.map(f => ({ ambito: 'España', norma: f.norma, categoria: f.estadolegal })),
        ...legal.autonomico.map(f => ({ ambito: ccaa, norma: f.norma, categoria: f.estadolegal })),
      ];
    }
  } catch (e) {
    r.error = e.message;
  }
  cache[nombre] = r;
  return r;
}

/*
 * Qué figura legal cuenta como RESPALDO para conservar la plaza con pocos registros.
 *
 * No vale «aparecer en cualquier norma»: EIDOS devuelve, junto a las figuras de protección, listas
 * que no protegen a nadie. Dos que salieron en este espacio y que hay que dejar fuera:
 *
 *   · CEEEI (RD 630/2013 y RD 216/2019) — el catálogo de especies exóticas INVASORAS. Es lo
 *     contrario de un respaldo, y por eso la selección de Carrascoy ya lo excluía explícitamente.
 *   · RD 159/2022, Anexo I — la lista de especies forestales para conservación de recursos
 *     genéticos. Incluye a *Pinus halepensis*, que no es una especie protegida: es madera.
 *
 * La lista blanca son las figuras que sí lo son, en las dos escalas: el Listado y el Catálogo
 * estatales (LESRPE/CEEA, RD 139/2011) y las categorías de los catálogos autonómicos.
 */
const CATEGORIAS_PROTECCION = [
  /^LESRPE\b/i,                        // Listado de Especies Silvestres en Régimen de Protección Especial
  /^CEEA\b/i,                          // Catálogo Español de Especies Amenazadas
  /en\s+peligro\s+de\s+extinci[óo]n/i,
  /^vulnerable$/i,
  /sensible\s+a\s+la\s+alteraci[óo]n/i,
  /(especies?\s+)?de\s+inter[ée]s\s+especial/i,
  /^extinguid[ao]s?$/i,
];
const esProteccion = (categoria) => CATEGORIAS_PROTECCION.some(re => re.test(String(categoria || '').trim()));

// Cuando el nombre del catálogo es un sinónimo, la autoctonía la decide el nombre ACEPTADO: es el
// caso de las cuatro de Carrascoy (Rosmarinus officinalis, Bupleurum gibraltarium…), que EIDOS solo
// reconoce por su nombre aceptado y que sin esto se habrían quedado sin `origen`.
function origenLegible(r) {
  if (!r.origen) return null;
  return r.nombreAceptadoEidos
    ? `${r.origen} (verificado por el nombre aceptado: ${r.nombreAceptadoEidos})`
    : r.origen;
}

const esNoNativa = (origen) => /no nativa|alóctona|exótica|introducida/i.test(String(origen || ''));

/*
 * RAREZA — el tramo 1–5 de `rarityScore`, derivado SOLO de la categoría legal estatal.
 *
 * Hasta hoy `rarityScore` era «criterio propio 1–5» (Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md):
 * un número puesto a mano, ficha a ficha, que nadie podía recalcular ni discutir. Y no es
 * decorativo: ordena el catálogo, elige la especie diagnóstica de la portada de cada hábitat
 * (`habitat-images.js`) y es el umbral de las destacadas (>= 4).
 *
 * Se sustituye por una escalera de gravedad legal, que es dato oficial directo y reproducible:
 *
 *   5  En peligro de extinción · Extinguida (CEEA, RD 139/2011)
 *   4  Vulnerable · Sensible a la alteración de su hábitat (CEEA)
 *   3  De interés especial
 *   2  En régimen de protección especial (LESRPE), sin categoría de amenaza
 *   1  sin figura de protección estatal
 *
 * Solo el ámbito ESTATAL. El catálogo autonómico es territorial —la misma especie es Vulnerable en
 * una comunidad y no figura en la de al lado— y un campo universal no puede depender de dónde se
 * mire: eso ya vive en `murciaStatus`, que es local. Y se guarda al lado la norma que justifica el
 * tramo, para que la cifra no vuelva a ser un número sin procedencia.
 */
function tramo(normas, filtro) {
  let score = 1, basis = null;
  for (const n of normas || []) {
    if (!filtro(n)) continue;
    const cat = String(n.categoria || '').replace(/^(CEEA|LESRPE):\s*/, '').trim();
    const valor = tramoDeCategoria(cat);
    if (valor > score) { score = valor; basis = { categoria: cat, norma: n.norma, ambito: n.ambito }; }
  }
  return { score, basis };
}

/*
 * Y por qué hay DOS tramos y no uno.
 *
 * La primera versión de esto usaba solo el ámbito estatal, que es el único que puede vivir en un
 * campo universal. Medido contra Sierra de la Pila, el resultado fue una escalera plana: de 243
 * aprobadas, 168 en el tramo 1, 74 en el 2 y **una sola** por encima de 3. Con el umbral de
 * destacadas en >= 4, el espacio pasaría de 18 destacadas a 1, y `habitat-images.js` elegiría la
 * portada de cada hábitat prácticamente al azar.
 *
 * El motivo está en el reparto real de figuras: el Estado casi solo dice «en régimen de protección
 * especial» (74 veces), y quien discrimina de verdad es el catálogo autonómico —25 de interés
 * especial, 8 vulnerables, 1 en peligro—. Es decir: la señal que hace falta existe y es igual de
 * oficial, pero es TERRITORIAL.
 *
 * Así que se calculan los dos y se guardan por separado, sin mezclarlos en un promedio que no
 * significaría nada:
 *
 *   · `rarityScore`  — solo estatal. Es el que puede ir al catálogo universal, porque no depende de
 *                      dónde se mire.
 *   · `rarityLocal`  — el más grave de los dos ámbitos. Es el que describe lo excepcional que es
 *                      encontrarla EN ESTE ESPACIO, y por eso es un campo local, como `murciaStatus`.
 *
 * Ninguno de los dos usa abundancia: los dos son categoría legal vigente, dato oficial directo.
 */
function rarezaLegal(normas) {
  const estatal = tramo(normas, n => n.ambito === 'España');
  const cualquiera = tramo(normas, () => true);
  return {
    rarityScore: estatal.score,
    rarityBasis: estatal.basis,
    rarityLocal: cualquiera.score,
    rarityLocalBasis: cualquiera.basis,
  };
}

// --- Programa ---------------------------------------------------------------------------------------

async function main() {
  const espacio = parkFiles().find(p => p.slug === PARK);
  if (!espacio) die(`No existe Frontend/Data/parks/**/${PARK}/park.json`);
  const park = readJson(espacio.file);
  const ccaa = arg('ccaa', park.park && park.park.region) || null;
  const codigosHic = [...new Set((park.habitats || []).map(h => h.code).filter(Boolean))];
  if (!codigosHic.length) die(`${PARK} no tiene Capa 2: genera antes los hábitats (habitats:adopt).`);

  const brutos = candidatos();
  const { porNombre: fichadas, porTaxonId } = yaFichadas();
  const atlas = caracteristicasPorEspecie(codigosHic);
  const anexo = anexoNormativo();

  console.log(`Espacio: ${park.park.name} (${PARK}) · ${codigosHic.length} códigos HIC · catálogo regional: ${ccaa}`);
  console.log(`Candidatos de GBIF ∩ polígonos: ${brutos.length}`);
  console.log(atlas.leido
    ? `Atlas 2005: ${atlas.mapa.size} especies características para estos HIC`
    : 'Atlas 2005: NO consultado (sin --atlas) — no habrá evidencia `caracteristica`');
  console.log(anexo.consultado
    ? `Anexo normativo: ${anexo.total} especies enumeradas (${anexo.fuente ? anexo.fuente.norma : 'sin cita'})`
    : `Anexo normativo: NO consultado — ${PARK} no tiene entrada en ${rel(RUTA_ANEXOS)}.\n` +
      '  No es lo mismo que «este espacio no tiene anexo»: es que nadie lo ha leído todavía.');

  // Resolver TODOS contra EIDOS antes de nada: la reconciliación necesita el `taxonid` de cada uno.
  console.log('\nResolviendo contra EIDOS (Lista Patrón y estado legal)…');
  const resueltas = new Map();
  let vistos = 0;
  for (const c of brutos) {
    if (++vistos % 50 === 0) process.stderr.write(`  … ${vistos}/${brutos.length}\n`);
    resueltas.set(c.scientificName, await resuelve(c.scientificName, ccaa));
  }
  if (!DRY) writeJson(CACHE, cache);

  const { lista, fusiones } = reconcilia(brutos, resueltas, porTaxonId);
  if (fusiones.length) {
    console.log(`\nReconciliación taxonómica: ${fusiones.length} grupo(s) con más de un nombre para el mismo taxón`);
    for (const f of fusiones) {
      const de = f.fusionados ? f.fusionados.join(', ') : f.renombradaDe;
      console.log(`   taxonid ${String(f.taxonid).padEnd(7)} ${f.elegido}  ←  ${de}`);
    }
    console.log(`Candidatos tras reconciliar: ${lista.length}`);
  }

  const aprobadas = [], excluidas = [];
  // Las categorías legales que se han visto y NO cuentan como protección. Se enseñan al final: es la
  // forma de enterarse de que una figura nueva se está descartando por no estar en la lista blanca.
  const categoriasDescartadas = new Map();
  // Qué binomios del anexo ha casado GBIF. Lo que quede sin casar es el hueco anexo↔GBIF: la norma
  // dice que la especie está aquí y el barrido no la ha encontrado dentro de ningún polígono.
  const anexoCasado = new Set();
  for (const c of lista) {
    // Tras reconciliar, un candidato puede llevar el nombre de la ficha ya existente en otro espacio
    // y no el que se preguntó a EIDOS: se busca por los dos.
    const r = resueltas.get(c.scientificName)
      || resueltas.get((c.sinonimosFusionados || [])[0])
      || await resuelve(c.scientificName, ccaa);

    const caract = atlas.mapa.get(binomio(c.scientificName) || '') || [];
    const normas = (r.normasRaw || []).filter(x => esProteccion(x.categoria));
    for (const x of (r.normasRaw || [])) {
      if (!esProteccion(x.categoria)) {
        categoriasDescartadas.set(x.categoria, (categoriasDescartadas.get(x.categoria) || 0) + 1);
      }
    }
    // El anexo se busca por binomio y también por el nombre aceptado: las normas antiguas citan con
    // nomenclatura de su época (*Sylvia undata*, *Rosmarinus officinalis*) y GBIF sirve la actual.
    const bin = binomio(c.scientificName) || '';
    const binAcept = binomio(r.nombreAceptadoEidos || '') || '';
    const enAnexo = anexo.mapa.get(bin) || (binAcept && anexo.mapa.get(binAcept)) || null;
    if (enAnexo) anexoCasado.add(anexo.mapa.has(bin) ? bin : binAcept);

    const evidence = ['observada_gbif'];
    if (caract.length) evidence.push('caracteristica');
    if (normas.length) evidence.push('protegida');
    if (enAnexo) evidence.push('anexo_normativo');

    const { rarityScore, rarityBasis, rarityLocal, rarityLocalBasis } = rarezaLegal(normas);

    const ficha = {
      scientificName: c.scientificName,
      class: c.class,
      gbifOccurrences: c.gbifOccurrences,
      habitats: c.habitats,
      evidence,
      yaFichadaEn: fichadas.get(c.scientificName) || null,
      normas,
      rarityScore,
      rarityBasis,
      rarityLocal,
      rarityLocalBasis,
      origen: origenLegible(r),
    };
    if (enAnexo) {
      ficha.anexoNormativo = {
        citadaComo: enAnexo.scientificName,
        categoria: enAnexo.categoria || null,
        fuente: anexo.fuente,
      };
    }
    if (r.nombreAceptadoEidos) ficha.nombreAceptadoEidos = r.nombreAceptadoEidos;
    if (r.taxonid) ficha.eidosTaxonId = r.taxonid;
    // Qué otros nombres de GBIF se han absorbido en esta ficha. Sin esto, alguien que compare la
    // selección con el barrido de GBIF ve desaparecer especies y no sabe por qué.
    if (c.sinonimosFusionados && c.sinonimosFusionados.length) {
      ficha.sinonimosFusionados = c.sinonimosFusionados;
    }
    if (r.error) ficha.errorEidos = r.error;

    // Filtro 2 — autoctonía.
    if (esNoNativa(r.origen)) {
      excluidas.push({ ...ficha, motivo: 'no nativa (Lista Patrón IEPNB)' });
      continue;
    }
    // Filtro 4 — alcance taxonómico del catálogo. Va antes que el de presencia porque no depende de
    // cuántas veces se haya visto: un microlepidóptero con mil registros sigue estando fuera.
    if (!TODAS_LAS_CLASES && c.class && !CLASES.has(c.class)) {
      excluidas.push({ ...ficha, motivo: `fuera del alcance del catálogo (clase ${c.class})` });
      continue;
    }
    // Filtro 3 — presencia, solo para las que no traen respaldo documental.
    // El anexo del espacio es respaldo documental de pleno derecho, y el más fuerte de los tres: es
    // la propia norma del espacio la que dice que la especie forma parte de él.
    const conRespaldo = normas.length > 0 || caract.length > 0 || Boolean(enAnexo);
    if (!conRespaldo && (c.gbifOccurrences < MIN_OCURRENCIAS || c.habitats < MIN_HABITATS)) {
      excluidas.push({
        ...ficha,
        motivo: `sólo GBIF y presencia escasa (<${MIN_OCURRENCIAS} occ o <${MIN_HABITATS} hábitats)`,
      });
      continue;
    }
    aprobadas.push(ficha);
  }

  if (!DRY) writeJson(CACHE, cache);

  const aves = aprobadas.filter(e => e.class === 'Aves').length;
  const reutilizables = aprobadas.filter(e => e.yaFichadaEn).length;
  // El hueco anexo↔GBIF. NO se aprueban (filtro 1: la constancia sigue siendo la puerta), pero
  // desaparecer en silencio sería exactamente lo que prohíbe la regla nº 2: la norma del espacio
  // afirma que están aquí y el barrido no las ha visto, y eso es un dato, no un vacío.
  const anexoSinConstancia = anexo.consultado
    ? [...anexo.mapa.entries()]
        .filter(([bin]) => !anexoCasado.has(bin))
        .map(([, e]) => ({ scientificName: e.scientificName, categoria: e.categoria || null, nota: e.nota || null }))
    : [];
  const doc = {
    _nota:
      `Selección de especies para la Capa 3 de ${park.park.name}. NO es park.json: es la lista aprobada y ` +
      'su procedencia. Criterio, en tres filtros encadenados: (1) constancia en GBIF dentro de los polígonos ' +
      'de hábitat del espacio —ninguna entra sólo por figurar en EIDOS o en otro parque—; (2) autoctonía: se ' +
      'excluye todo lo que la Lista Patrón del IEPNB marca como «Especie no nativa»; (3) presencia considerable ' +
      `para las que NO tienen respaldo documental: al menos ${MIN_OCURRENCIAS} ocurrencias en ${MIN_HABITATS} ` +
      'hábitats. Las protegidas y las características del Atlas 2005 conservan su plaza aunque tengan pocos ' +
      'registros, porque su respaldo no es el número de avistamientos. Se excluye el CEEEI (RD 630/2013): es el ' +
      'catálogo de especies exóticas INVASORAS, no una figura de protección, y tampoco cuentan como respaldo ' +
      'los anexos forestales (RD 159/2022, RD 289/2003) ni el anexo de explotación de la Ley 42/2007. ' +
      (TODAS_LAS_CLASES
        ? 'Sin filtro de clase: entran todos los grupos taxonómicos.'
        : '(4) alcance taxonómico: flora vascular y vertebrados, que es lo que cataloga NaturDex — clases ' +
          `admitidas: ${[...CLASES].join(', ')}.`) + ' ' +
      'El ANEXO NORMATIVO del espacio (PORN/PRUG/decreto de declaración o SDF del sitio Natura 2000) da ' +
      'la evidencia `anexo_normativo` y cuenta como respaldo documental, pero NO es puerta de entrada: lo ' +
      'que enumera y GBIF no confirma dentro de los polígonos queda en `anexo_sin_constancia`, no aprobado ' +
      'y no perdido. `rarityScore` (1–5) se deriva únicamente de la categoría legal ESTATAL más grave, con ' +
      'la norma que la justifica en `rarityBasis`; no interviene ninguna señal de abundancia. ' +
      'Generada por Tools/catalogo-nacional/build-species-seleccion.js.',
    park: PARK,
    generado: hoy(),
    total: aprobadas.length,
    aves,
    reutilizables,
    nuevas: aprobadas.length - reutilizables,
    excluidas: excluidas.length,
    anexo: anexo.consultado
      ? { consultado: true, fuente: anexo.fuente, enumeradas: anexo.total, casadas: anexoCasado.size }
      : { consultado: false },
    rareza: [5, 4, 3, 2, 1].reduce((a, n) => {
      a[n] = aprobadas.filter(e => e.rarityScore === n).length; return a;
    }, {}),
    rareza_local: [5, 4, 3, 2, 1].reduce((a, n) => {
      a[n] = aprobadas.filter(e => e.rarityLocal === n).length; return a;
    }, {}),
    especies: aprobadas,
    anexo_sin_constancia: anexoSinConstancia,
    excluidas_detalle: excluidas,
  };

  console.log(`\nAprobadas: ${doc.total} (${aves} aves) · reutilizables: ${reutilizables} · nuevas: ${doc.nuevas}`);
  console.log(`Excluidas: ${excluidas.length}`);
  const porMotivo = {};
  for (const e of excluidas) porMotivo[e.motivo] = (porMotivo[e.motivo] || 0) + 1;
  for (const [m, c] of Object.entries(porMotivo)) console.log(`   ${c}  ${m}`);
  console.log('\nRareza (tramo legal)      estatal   local (estatal+autonómico)');
  for (const n of [5, 4, 3, 2, 1]) {
    console.log(`   ${n}                   ${String(doc.rareza[n]).padStart(7)}   ${String(doc.rareza_local[n]).padStart(4)}`);
  }
  console.log(`   destacadas (>= 4)   ${String(doc.rareza[5] + doc.rareza[4]).padStart(7)}   ` +
              `${String(doc.rareza_local[5] + doc.rareza_local[4]).padStart(4)}`);
  if (anexo.consultado) {
    console.log(`\nAnexo normativo: ${anexoCasado.size}/${anexo.total} confirmadas por GBIF dentro de los polígonos.`);
    if (anexoSinConstancia.length) {
      console.log(`⚠ ${anexoSinConstancia.length} enumeradas por la norma SIN constancia en GBIF: no se aprueban,`);
      console.log('  quedan en `anexo_sin_constancia` como hueco a contrastar en campo (ver informe).');
    }
  }
  const conError = [...aprobadas, ...excluidas].filter(e => e.errorEidos);
  if (conError.length) console.log(`\n⚠ ${conError.length} especies con error de EIDOS (ver informe)`);
  if (categoriasDescartadas.size) {
    console.log('\nFiguras legales vistas que NO cuentan como protección:');
    for (const [cat, veces] of [...categoriasDescartadas].sort((a, b) => b[1] - a[1])) {
      console.log(`   ${String(veces).padStart(4)}  ${cat}`);
    }
  }

  if (DRY) { console.log('\nSimulación: no se ha escrito nada.'); return; }
  writeJson(RUTA_OUT, doc);
  fs.writeFileSync(RUTA_INFORME, informe(doc, atlas, conError, categoriasDescartadas), 'utf8');
  console.log(`\n→ ${rel(RUTA_OUT)}\n→ ${rel(RUTA_INFORME)}`);
}

function informe(doc, atlas, conError, categoriasDescartadas) {
  const l = [];
  l.push(`# ${doc.park} · selección de especies`, '');
  l.push(`Generada el ${doc.generado}. **${doc.total} aprobadas** (${doc.aves} aves), ` +
         `${doc.reutilizables} ya fichadas en otro espacio y ${doc.nuevas} nuevas. ` +
         `${doc.excluidas} excluidas.`, '');
  l.push(atlas.leido
    ? `Atlas 2005 consultado: ${atlas.mapa.size} especies características para los HIC de este espacio.`
    : '**Atlas 2005 NO consultado** (falta `--atlas`): ninguna especie tiene evidencia `caracteristica`, ' +
      'así que las de pocos registros solo conservan su plaza si están protegidas.', '');

  if (doc.anexo && doc.anexo.consultado) {
    const f = doc.anexo.fuente || {};
    l.push('', '## Anexo normativo del espacio', '',
      `Fuente: **${f.norma || 'sin cita'}**${f.anexo ? `, ${f.anexo}` : ''}` +
      `${f.boletin ? ` · ${f.boletin}` : ''}${f.consultado ? ` · consultado el ${f.consultado}` : ''}.`, '',
      `Enumera **${doc.anexo.enumeradas} especies**; GBIF confirma **${doc.anexo.casadas}** dentro de los ` +
      'polígonos de hábitat. Esas llevan evidencia `anexo_normativo` y conservan su plaza aunque tengan ' +
      'pocos registros.', '');
  } else {
    l.push('', '## Anexo normativo del espacio', '',
      '**NO consultado.** Este espacio no tiene entrada en `data/anexos-normativos.json`. No es que carezca ' +
      'de norma con anexo de especies: es que nadie la ha leído todavía, y hasta que se lea ninguna especie ' +
      'de este espacio tiene la evidencia más fuerte de las cuatro.', '');
  }

  if (doc.anexo_sin_constancia && doc.anexo_sin_constancia.length) {
    l.push('', '### Enumeradas por la norma y sin constancia en GBIF', '',
      'La norma del espacio dice que están aquí; el barrido de GBIF no las ha encontrado dentro de ningún ' +
      'polígono de hábitat. **No se aprueban** —la constancia sigue siendo la puerta (filtro 1)— y se listan ' +
      'aquí en vez de desaparecer: son el hueco a contrastar en campo, y la lista más útil que produce esta ' +
      'herramienta para decidir dónde mirar.', '',
      '| Especie | Categoría en la norma | Nota |', '|---|---|---|');
    for (const e of doc.anexo_sin_constancia) {
      l.push(`| *${e.scientificName}* | ${e.categoria || '—'} | ${e.nota || '—'} |`);
    }
  }

  l.push('', '## Rareza', '',
    'Tramo 1–5 derivado **solo** de la categoría legal vigente; no interviene ninguna señal de abundancia. ' +
    '`rarityScore` usa únicamente el ámbito **estatal**, que es el que puede vivir en el catálogo universal. ' +
    '`rarityLocal` toma la categoría más grave de los dos ámbitos y es **local a este espacio**, porque el ' +
    'catálogo autonómico es territorial. Las de tramo ≥ 4 son las candidatas a destacadas: mírese la ' +
    'diferencia entre las dos columnas antes de elegir cuál gobierna las destacadas.', '',
    '| Tramo | Significado | Estatal | Local |', '|---:|---|---:|---:|');
  for (const n of [5, 4, 3, 2, 1]) {
    l.push(`| ${n} | ${SIGNIFICADO[n]} | ${doc.rareza[n]} | ${doc.rareza_local[n]} |`);
  }
  l.push(`| **≥ 4** | **candidatas a destacadas** | **${doc.rareza[5] + doc.rareza[4]}** | ` +
         `**${doc.rareza_local[5] + doc.rareza_local[4]}** |`);
  if (conError.length) {
    l.push('', '## Especies que EIDOS no pudo resolver', '',
      'No cuentan como «sin normas»: constan aquí para no dar por comprobado lo que no se comprobó.', '',
      '| Especie | Error |', '|---|---|');
    for (const e of conError) l.push(`| *${e.scientificName}* | ${e.errorEidos} |`);
  }
  if (categoriasDescartadas && categoriasDescartadas.size) {
    l.push('', '## Figuras legales que no cuentan como protección', '',
      'EIDOS devuelve, junto a las figuras de protección, listas que no protegen a nadie (el catálogo de ' +
      'invasoras, los anexos forestales). No dan evidencia `protegida`; se enumeran aquí para que se vea ' +
      'qué se ha descartado y con qué frecuencia.', '',
      '| Categoría | Veces |', '|---|---:|');
    for (const [cat, veces] of [...categoriasDescartadas].sort((a, b) => b[1] - a[1])) {
      l.push(`| ${cat} | ${veces} |`);
    }
  }
  l.push('', '## Aprobadas', '', '| Especie | Clase | Occ. | Háb. | Rareza | Evidencia | Ya fichada en |', '|---|---|---:|---:|---:|---|---|');
  for (const e of doc.especies) {
    l.push(`| *${e.scientificName}* | ${e.class || '—'} | ${e.gbifOccurrences} | ${e.habitats} | ` +
           `${e.rarityScore} | ${e.evidence.join(', ')} | ${e.yaFichadaEn || '—'} |`);
  }
  l.push('', '## Excluidas', '', '| Especie | Clase | Occ. | Háb. | Motivo |', '|---|---|---:|---:|---|');
  for (const e of doc.excluidas_detalle) {
    l.push(`| *${e.scientificName}* | ${e.class || '—'} | ${e.gbifOccurrences} | ${e.habitats} | ${e.motivo} |`);
  }
  return l.join('\n') + '\n';
}

main().catch(e => die(e.stack || e.message));
