#!/usr/bin/env node
'use strict';
/*
 * build-species-n2.js — escribe la Capa 3 (catálogo de especies) de un espacio en su park.json.
 *
 * El problema que resuelve
 * -----------------------
 * Hasta hoy este paso NO tenía herramienta. La Capa 3 de Sierra Espuña se montó con «un script de
 * sesión que no está en el repo» (ver Docs/rollout/sesiones/2026-08-07-08.md), así que cada espacio
 * nuevo obligaba a rehacer a mano el mismo trabajo: leer la selección aprobada, copiar los campos
 * universales de cada ficha, recalcular los enlaces especie↔hábitat, poner los contadores del
 * manifiesto y no equivocarse en ninguno de los tres sitios. El cierre de la Capa 2 de Carrascoy lo
 * dejó anotado como lo siguiente a resolver: «o se escribe esa herramienta o se repite el trabajo a
 * mano en cada espacio».
 *
 * Qué hace y qué NO hace
 * ----------------------
 * Es un ENSAMBLADOR, no una fuente. No sale a la red y no inventa un solo campo: todo lo que
 * escribe viene de un fichero del repo, y de cada campo se sabe de cuál.
 *
 *   · lo UNIVERSAL de la ficha (qué es la especie) → data/especies-universal.json, tal cual.
 *   · los enlaces a hábitat y las ocurrencias      → out/<slug>-gbif.json (GBIF ∩ polígonos).
 *   · el estado legal en las dos escalas           → las `normas` del IEPNB que trae la selección.
 *   · la rareza local y las destacadas             → `rarityLocal`, el tramo legal que calcula la
 *                                                    selección cruzando el ámbito estatal y el
 *                                                    autonómico. Ninguna señal de abundancia.
 *   · el identificador maestro `eidosTaxonId`      → el park.json donde la especie ya está fichada.
 *
 * Una especie SELECCIONADA que todavía no tiene ficha en el catálogo universal **no se escribe**:
 * necesita taxonomía, nombre común, UICN y foto, y eso son cuatro fuentes externas (EIDOS, GBIF,
 * Wikipedia, Commons). Rellenarlas de memoria sería exactamente lo que prohíbe la regla nº 2 de
 * CLAUDE.md, así que se listan en `out/<slug>-especies-pendientes.md` con lo que ya se sabe de
 * ellas y se vuelven a incorporar solas en cuanto alguien les dé de alta la ficha universal y se
 * relance esta herramienta.
 *
 * Idempotente: un segundo pase no cambia un byte. Los campos curados a mano (`coordinates`,
 * `featured`, `visible`, `reviewNote`, `audio`, `audioTranscript`) se conservan si la ficha ya
 * existía; el resto se refresca siempre desde las fuentes de arriba, igual que hace
 * adopt-habitats.js con la Capa 2. Los `id` ya asignados no se mueven nunca.
 *
 * Uso:
 *     node Tools/catalogo-nacional/build-species-n2.js --park <slug> [--dry]
 *                                                      [--seleccion <ruta>] [--gbif <ruta>]
 *
 * NO escribe en la base de datos (regla nº 2 de Tools/CLAUDE.md): el SQL del espacio se genera
 * aparte y la API tiene prioridad sobre el park.json, así que sin él un despliegue con backend
 * seguiría sirviendo la ficha base. Ver Docs/runbook/ORDEN-DE-OPERACIONES.md §3.
 */

const fs = require('fs');
const path = require('path');
const { arg, flag, requireArgs, die } = require('../lib/cli');
const { ROOT, FRONTEND, CATALOGO_DIR, OUT_DIR, readJson, rel, fromRoot, parkFiles, escribeEspacio } = require('../lib/io');
const { clasificaPresenciaSitio } = require('../lib/fenologia');

const DRY = flag('dry');
const PODAR = flag('podar');
const PARK = arg('park');
requireArgs('Uso: --park <slug> [--dry] [--podar] [--seleccion <ruta>] [--gbif <ruta>]', { park: PARK });

const CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');
// Los catálogos autonómicos de especies protegidas, comunidad a comunidad. Sin la entrada de una
// comunidad, el estado autonómico de sus fichas se queda VACÍO en vez de afirmar una negación sobre
// un catálogo que nadie ha mirado (deuda nº 2).
const CATALOGOS_REGIONALES = path.join(CATALOGO_DIR, 'data', 'catalogos-regionales.json');

// Campos que describen a la ESPECIE. Se copian literalmente del catálogo universal; son los mismos
// que sincroniza Tools/sync-species-catalog.js, y por eso `npm run species:apply` no los mueve.
const UNIVERSALES = ['commonName', 'kingdom', 'group', 'habitat', 'seasonality', 'rarityScore', 'rarityBasis',
  'description', 'descriptionSource', 'tips', 'taxonomy', 'iucnGlobal', 'iucnSpain', 'spainStatus', 'image', 'imageAttribution'];

// Campos LOCALES que, si la ficha ya existía en este park.json, se conservan tal cual: o los ha
// puesto una persona (coordinates, audio, la nota de revisión) o son una decisión editorial de este
// catálogo (featured, visible). Todo lo demás se recalcula desde las fuentes en cada pase.
const CURADOS = ['coordinates', 'featured', 'visible', 'hiddenReason', 'reviewNote', 'audio', 'audioTranscript'];

// Orden de las claves de la ficha. Fijarlo importa: sin él, dos ejecuciones que producen los mismos
// datos generan diffs distintos según el orden en que se hayan ido asignando las propiedades.
const ORDEN = ['id', 'commonName', 'scientificName', 'kingdom', 'group', 'habitat',
  'conservationStatus', 'description', 'descriptionSource', 'tips', 'seasonality', 'image', 'imageAttribution',
  'coordinates', 'rarityScore', 'rarityBasis', 'rarityLocal', 'rarityLocalBasis', 'featured', 'source', 'taxonomy', 'iucnGlobal', 'iucnSpain', 'spainStatus',
  'regionalStatus', 'regionalCcaa', 'reviewNote', 'eidosTaxonId', 'gbifSpeciesKey', 'zepaSiteCode', 'migratory', 'sitePresence', 'habitatIds',
  'gbifOccurrences', 'visible', 'hiddenReason', 'audio', 'audioTranscript'];

// Gravedad de las categorías de los catálogos de especies amenazadas, para quedarse con la mayor
// cuando una especie figura en varias filas de la misma norma.
const GRAVEDAD = {
  'En peligro de extinción': 4, 'En Peligro de Extinción': 4,
  'Sensible a la alteración de su hábitat': 3,
  'Vulnerable': 2,
  'Especies de interés especial': 1, 'De interés especial': 1,
};
const masGrave = (a, b) => ((GRAVEDAD[b] || 0) > (GRAVEDAD[a] || 0) ? b : a);

// Etiqueta corta de la tarjeta a partir de la categoría legal. `conservation_status` es derivado y,
// en flora, refleja el estado LEGAL y no la evaluación UICN (Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md).
const ETIQUETA_CORTA = { 'Especies de interés especial': 'Interés especial', 'De interés especial': 'Interés especial' };

// --- lectura de las fuentes -----------------------------------------------------------------------

function cargarSeleccion() {
  const p = fromRoot(arg('seleccion', path.join(OUT_DIR, `${PARK}-seleccion-especies.json`)));
  if (!fs.existsSync(p)) die(`no existe la selección aprobada: ${rel(p)}\n` +
    'Es la lista de especies con su procedencia, no las fichas. Se produce en el paso de Capa 3 del\n' +
    'runbook (Docs/runbook/ALTA-DE-ESPACIO.md) cruzando GBIF, el Atlas y EIDOS.');
  return { ruta: p, doc: readJson(p) };
}

/**
 * Los enlaces especie↔hábitat que afirma el Atlas, por nombre científico.
 *
 * Por qué hace falta, y qué se estaba perdiendo
 * ---------------------------------------------
 * Hasta el 2026-08-21 `habitatIds` salía SOLO del barrido de GBIF, y la evidencia `caracteristica`
 * del Atlas se escribía únicamente en el `source` («especie característica de alguno de los HIC
 * cartografiados aquí»). Con eso, una especie que el Atlas da como característica de un HIC del
 * espacio pero que no tiene ninguna ocurrencia dentro se quedaba con `habitatIds: []` y un `source`
 * que afirmaba justo lo contrario. No es un aviso: es la misma contradicción que el guardián de
 * `hiloPerdido` persigue unas líneas más abajo, pero entrando por la puerta del Atlas, que es
 * exactamente por donde ese guardián no mira —solo salta si la selección contaba hábitats, y los
 * cuenta con GBIF—. Salió al repasar los hábitats de Cabezo Gordo: *Centaurea saxicola*, que el
 * Atlas da como característica del 8210 y que aquí no colgaba de ningún hábitat. Son 30 fichas en
 * cuatro espacios.
 *
 * Y duele el doble porque el Atlas es la señal FUERTE de las dos: una ocurrencia prueba que alguien
 * registró la especie dentro del polígono —lo que en un hábitat que es una cinta de metros no
 * prueba gran cosa (§2 del CLAUDE.md)—, mientras que el Atlas afirma que la especie es
 * característica de ese tipo de hábitat. Es el «backbone determinista» que anuncia la cabecera de
 * `atlas-hic-especies.js`, y su salida no la cargaba nadie.
 *
 * Se usa SOLO en positivo, como el índice de la auditoría: que un nombre no esté no significa que el
 * Atlas no lo dé. Y no se aplica a las aves, que entran por otra puerta (regla nº 8).
 */
function cargarAtlas() {
  const p = fromRoot(arg('atlas-hic', path.join(OUT_DIR, `${PARK}-hic-especies.json`)));
  // Ausente NO es cero, y la diferencia importa: el fichero es opcional porque hay espacios dados de
  // alta antes de que existiera. Se avisa en vez de callar, que es lo que convirtió esto en un fallo
  // en verde durante doce espacios.
  if (!fs.existsSync(p)) {
    console.log(`  · sin índice del Atlas (${rel(p)}): los enlaces saldrán solo de GBIF.\n` +
      '    Se genera con `node Tools/catalogo-nacional/atlas-hic-especies.js --atlas <atlas.txt> --park ' + PARK + '`.');
    return { porNombre: new Map(), presente: false };
  }
  const doc = readJson(p);
  const porNombre = new Map();
  for (const l of doc.links || []) {
    if (!porNombre.has(l.scientific_name)) porNombre.set(l.scientific_name, new Set());
    porNombre.get(l.scientific_name).add(l.habitat_slug);
  }
  return { porNombre, presente: true };
}

/**
 * Índice del barrido de GBIF por nombre científico: clave de especie, clase y en qué hábitats del
 * parque se ha observado, con cuántas ocurrencias en cada uno.
 */
function cargarGbif() {
  const p = fromRoot(arg('gbif', path.join(OUT_DIR, `${PARK}-gbif.json`)));
  if (!fs.existsSync(p)) die(`no existe el barrido de GBIF: ${rel(p)}\n` +
    'Se genera con `npm run gbif:habitats` (necesita red).');
  const doc = readJson(p);
  const porNombre = new Map();
  /*
   * El barrido indexa sus especies por CLAVE de GBIF, y GBIF llega a servir el MISMO nombre con dos
   * claves distintas. En Carrascoy y El Valle son dos: *Osyris lanceolata* (7473922 y 3788959) y
   * *Paronychia suffruticosa* (5529030 y 7499195). Cuando eso pasa, el mismo hábitat aparece dos
   * veces en la lista del nombre, y concatenarlas sin más metía el enlace repetido en `habitatIds`.
   *
   * No era visible en el `park.json` —una lista con un slug dos veces no rompe nada al pintarla— y
   * en cambio SÍ lo era en la base de datos, que tiene clave única en `(species_id, habitat_id)`:
   * el fichero declaraba 1.310 vínculos, la carga insertaba 1.307 y ninguna de las dos cifras
   * avisaba de la otra. El paquete y la API diciendo cosas distintas es la cuarta de las «cinco
   * cosas que fallan en verde» del CLAUDE.md.
   *
   * Así que el hábitat se fusiona por `slug`, quedándose con el recuento MAYOR de las dos claves.
   * Sumarlas sería peor: no se sabe si los dos conjuntos de registros son disjuntos o el mismo
   * registro contado dos veces, y esta cifra es la que el `source` de la ficha publica.
   */
  for (const h of doc.habitats || []) {
    for (const s of h.species || []) {
      if (!porNombre.has(s.name)) porNombre.set(s.name, { speciesKey: s.speciesKey, clase: s.class, habitats: [], claves: new Set() });
      const e = porNombre.get(s.name);
      e.claves.add(s.speciesKey);
      const ya = e.habitats.find(x => x.slug === h.slug);
      if (ya) ya.ocurrencias = Math.max(ya.ocurrencias, s.occurrences);
      else e.habitats.push({ slug: h.slug, hic: h.hic, ocurrencias: s.occurrences });
    }
  }
  // Orden estable: el hábitat con más ocurrencias primero; a igualdad, por slug.
  for (const v of porNombre.values())
    v.habitats.sort((a, b) => b.ocurrencias - a.ocurrencias || a.slug.localeCompare(b.slug));
  return { ruta: p, porNombre };
}

/**
 * Lo que los DEMÁS parques tienen fichado: por nombre científico, sus `eidosTaxonId` y en qué
 * espacio aparece cada uno. Sirve para dos cosas: reutilizar la clave maestra y —sobre todo— saber
 * con qué nombre se llama hoy de verdad a cada taxón en el catálogo.
 */
function cargarFichadas() {
  const porNombre = new Map();
  for (const { slug, file } of parkFiles()) {
    if (slug === PARK) continue;
    for (const sp of (readJson(file).species || [])) {
      if (!porNombre.has(sp.scientificName)) porNombre.set(sp.scientificName, { eidos: new Map(), gbif: new Map() });
      const e = porNombre.get(sp.scientificName);
      if (sp.eidosTaxonId != null) e.eidos.set(sp.eidosTaxonId, slug);
      if (sp.gbifSpeciesKey != null) e.gbif.set(sp.gbifSpeciesKey, slug);
    }
  }
  return porNombre;
}

/**
 * Identificador externo de una especie que ya está fichada en otro parque. Se reutiliza siempre que
 * los demás espacios coincidan en uno solo; si discrepan, no se elige a ciegas: se avisa.
 *
 * Vale tanto para `eidosTaxonId` como para `gbifSpeciesKey`, y con este último importa más de lo que
 * parece. La clave que devuelve el barrido es la del nombre con el que GBIF sirve las ocurrencias,
 * que puede ser un sinónimo: la curruca rabilarga sale del barrido como *Sylvia undata* con la clave
 * 2492949, y esa es exactamente la que una sesión anterior YA corrigió a 10355796 por apuntar al
 * taxón equivocado. Tomarla del barrido reintroduciría el fallo, y `npm run taxones:duplicados` lo
 * cazaría en el commit siguiente.
 */
function identificadorReutilizado(mapa, dudosos, sci, campo) {
  if (!mapa || mapa.size === 0) return { valor: null, hayFicha: false };
  if (mapa.size === 1) return { valor: [...mapa.keys()][0], hayFicha: true };
  dudosos.push(`${sci} · ${campo}: ${[...mapa].map(([id, slug]) => `${id} (${slug})`).join(' vs ')}`);
  return { valor: null, hayFicha: true };
}

/**
 * Con qué nombre se escribe la especie en ESTE parque.
 *
 * Una selección se aprueba en una sesión y se escribe en otra, y entre medias puede haber pasado una
 * revisión nomenclatural. Pasó aquí: la selección decidió conservar `Salvia rosmarinus`,
 * `Bupleurum gibraltaricum`, `Halimium atriplicifolium` y `Calicotome villosa` «para no duplicar
 * fichas compartidas», y al día siguiente esas cuatro se renombraron en TODOS los parques a su
 * nombre aceptado en EIDOS. Escribirlas ahora con el nombre viejo crearía justo el duplicado que la
 * selección quería evitar —el error del esparto—, y encima en silencio: el catálogo universal
 * conserva las entradas antiguas porque `species:extract` añade pero nunca borra.
 *
 * Por eso manda lo que los demás parques usan HOY, y solo si ahí no hay nada se mira el catálogo.
 */
function resolverNombre(sel, fichadas, universal) {
  const propuesto = sel.scientificName;
  const aceptado = sel.nombreAceptadoEidos;
  if (!fichadas.has(propuesto) && aceptado && aceptado !== propuesto && fichadas.has(aceptado))
    return { nombre: aceptado, renombrada: `${propuesto} → ${aceptado}` };
  return { nombre: propuesto, renombrada: null };
}

/*
 * El sitio Red Natura 2000 que declara esta ave en su formulario oficial, que es lo que `zepaSiteCode`
 * dice ahora. Antes decía otra cosa: llevaba el código de la ZEPA con la que solapa el ESPACIO, leído
 * del `zepa.geojson`, a toda ave del catálogo. Es decir, marcaba «ave de la ZEPA» a cualquier ave que
 * GBIF hubiera dejado pasar, sin que ninguna lista oficial la nombrara.
 *
 * Importa más de lo que parece porque no es solo una insignia: `Frontend/Js/state.js` construye con
 * este campo la «colección de aves de la ZEPA», un logro propio del juego. Con el criterio viejo, esa
 * colección era «las aves que el barrido de GBIF dejó pasar»; con este es la lista que el sitio
 * declara, que es una colección cerrada, oficial y comprobable — que es justo lo que una mecánica de
 * pokédex necesita.
 *
 * Se prefiere el código de la ZEPA del espacio cuando el ave figura en varios formularios: es el que
 * corresponde a la figura por la que se protegen las aves.
 */
function sitioQueLaDeclara(sel, zepa) {
  const entradas = sel.listaOficialSitio || [];
  if (!entradas.length) return null;
  if (zepa && entradas.some(e => e.siteCode === zepa.code)) return zepa.code;
  return entradas[0].siteCode;
}

/** Código y nombre del sitio ZEPA del espacio, de su propio geo/zepa.geojson. */
function leerZepa(geoDir) {
  const p = path.join(geoDir, 'zepa.geojson');
  if (!fs.existsSync(p)) return null;
  for (const f of (readJson(p).features || [])) {
    const pr = f.properties || {};
    const code = pr.site_code || pr.SITE_CODE;
    if (code) return { code, name: pr.site_name || pr.SITE_NAME || null };
  }
  return null;
}

// --- construcción de los campos derivados ----------------------------------------------------------

/** Categoría más grave de las normas de un ámbito ('España' o el de la comunidad autónoma). */
function categoriaDe(normas, esNacional) {
  let cat = null, norma = null;
  for (const n of normas || []) {
    const nacional = n.ambito === 'España';
    if (nacional !== esNacional) continue;
    const c = String(n.categoria || '').replace(/^(CEEA|LESRPE):\s*/, '');
    const previa = cat;
    cat = cat ? masGrave(cat, c) : c;
    if (cat !== previa) norma = n.norma;
  }
  return cat ? { categoria: cat, norma } : null;
}

/**
 * `regionalStatus`: el estado legal en el ámbito autonómico, con la norma que lo dice.
 *
 * Se llamaba `murciaStatus` hasta el 2026-08-27 y era el bloqueo real del rollout nacional a nivel
 * de campo (deuda nº 2). Aquí lo que cambia no es solo el nombre: **la frase de negación deja de
 * escribirse a ciegas**.
 *
 * «No incluida en el Catálogo Regional de especies protegidas (X)» es una AFIRMACIÓN sobre el
 * catálogo de X, y hasta hoy se escribía para cualquier comunidad sin haber mirado nunca si esa
 * comunidad tiene catálogo, cómo se llama ni cuántos son. Con Murcia colaba porque el piloto era
 * Murcia; en la comunidad número dos habría sido un dato inventado de los del §2 del CLAUDE.md,
 * escrito en cientos de fichas y sin que fallara nada.
 *
 * Así que la negación exige que la comunidad esté dada de alta en `data/catalogos-regionales.json`,
 * con su norma copiada del boletín. Si no lo está, el campo se queda **vacío** y la ficha lo dice
 * por omisión: no hay dato, que es distinto de «no está protegida». Lo mismo que hace
 * `lib/fenologia.js` con las aves que su formulario no clasifica.
 */
function estadoAutonomico(normas, comunidad, catalogos) {
  const auto = categoriaDe(normas, false);
  if (auto) return `${auto.categoria} (${auto.norma})`;
  const ficha = catalogos[comunidad];
  if (!ficha || !Array.isArray(ficha.catalogos) || !ficha.catalogos.length) return null;
  // Sin artículo delante del nombre de la comunidad: «de la Región de Murcia» se lee bien pero
  // «de la Andalucía» no, y este texto tiene que servir para las diecisiete.
  const nombres = [...new Set(ficha.catalogos.map(c => c.nombre))];
  return `No incluida en ${nombres.length === 1 ? 'el ' + nombres[0] : nombres.join(' ni en ')} (${comunidad})`;
}

/** Etiqueta corta de la tarjeta: estado legal si lo hay, y si no la evaluación UICN. */
function etiquetaConservacion(normas, iucnGlobal) {
  const auto = categoriaDe(normas, false);
  if (auto) return ETIQUETA_CORTA[auto.categoria] || auto.categoria;
  const nacional = categoriaDe(normas, true);
  if (nacional) {
    if (/^En régimen de protección especial$/i.test(nacional.categoria)) return 'Protegida (LESRPE)';
    return ETIQUETA_CORTA[nacional.categoria] || nacional.categoria;
  }
  const codigo = String(iucnGlobal || '').match(/^[A-Z]{2}/);
  return codigo ? codigo[0] : 'No catalogada';
}

/*
 * El respaldo documental se quedaba en el informe y no llegaba a la ficha.
 *
 * `build-species-seleccion.js` llama al anexo normativo «la evidencia más fuerte de las cuatro» —es
 * la única que afirma, oficial y por escrito, que la especie pertenece a ESTE espacio; GBIF solo
 * prueba que alguien la registró dentro del polígono y el Atlas solo que es característica del tipo
 * de hábitat—, la calcula especie a especie y la deja en `anexoNormativo`. Y aquí se tiraba: el
 * `source` citaba GBIF, el Atlas, EIDOS y la ZEPA, y de la norma no decía ni una palabra. En los
 * tres espacios con anexo transcrito eran **0 fichas de 513** las que nombraban su norma; con esto
 * son 417 de 537. Un fallo en verde de manual: nada avisaba, porque el dato estaba bien calculado y
 * bien guardado — en el fichero que no se publica.
 *
 * Lo que se escribe NO es «la norma dice que está aquí» sin más, porque no siempre es eso. El
 * inventario del Plan del Altiplano para Sierra de Salinas es el de la **ZEC ES6200008** (1.337,8
 * ha), no el del Paisaje Protegido (2.395,4 ha), y afirmar lo segundo sería afirmar de más
 * (CLAUDE.md, regla nº 2). Por eso el perímetro lo dice el propio anexo en su campo `ambito`, y sin
 * él la ficha lo deja **sin precisar** en vez de dar por hecho que coinciden.
 *
 * Y se dice también CON QUÉ NOMBRE la cita: las normas escriben *Sylvia melanocephala* o *Parus
 * ater*, que es nomenclatura en desuso, y a veces con erratas de imprenta. El `nombreCorregido` del
 * anexo hace que el cruce no se pierda por una letra; esto hace que el lector pueda encontrar la
 * entrada en el documento.
 */
// La nota del anexo está redactada como oración suelta («Errata de la tabla: …»); dentro de un
// paréntesis, a media frase, la mayúscula inicial sobra. Solo la primera letra, y solo si es letra.
const minuscula = (s) => String(s).replace(/^\p{Lu}/u, (c) => c.toLowerCase());

// Primera oración de una nota, sin paréntesis y sin el punto final. Un punto seguido de espacio y
// mayúscula cierra oración, salvo cuando el punto es el de una abreviatura: las notas están llenas
// de «subsp.», «var.» y «n.º», y cortar ahí parte el nombre por la mitad.
const ABREVIATURAS = /\b(subsp|ssp|var|subvar|f|cf|aff|n|art|núm|pág|s|Sr|Sra|Dr|ed|coord|vol)\.$/i;
function primeraOracion(s) {
  const sinParentesis = String(s).replace(/\s*\([^)]*\)/g, '').trim();
  const trozos = sinParentesis.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ¿«])/);
  let out = trozos[0];
  for (let i = 1; i < trozos.length && ABREVIATURAS.test(out); i++) out += ' ' + trozos[i];
  return out.replace(/\.$/, '').trim();
}

function fuenteDelAnexo(sel) {
  const a = sel.anexoNormativo;
  if (!a) return null;
  const f = a.fuente || {};
  // `norma` es un párrafo entero: en un `source` no cabe. `cita` es la misma referencia abreviada;
  // si el anexo no la trae, se usa la primera oración de `norma`, que es el título y el rango.
  const cita = f.cita || String(f.norma || '').split(/\.\s+(?=[A-ZÁÉÍÓÚ])/)[0] || 'norma sin cita';
  const ambito = f.ambito || 'un inventario cuyo perímetro el anexo no precisa';
  const partes = [`${cita}: la norma la enumera en ${ambito}`];
  if (a.citadaComo && a.citadaComo !== sel.scientificName) {
    partes.push(`, que la cita como «${a.citadaComo}»`);
    // La salvedad de la entrada del anexo. Sin ella, un nombre mal impreso en el boletín —«Falco
    // tunninculus», «Milaria calandra»— parece una errata de NaturDex y no de la norma.
    //
    // Solo la PRIMERA oración, y sin sus paréntesis: la nota del anexo puede llevar detrás la
    // verificación contra GBIF y la fecha en que se hizo, que son para quien mantiene el dato y no
    // para quien lee la ficha. Meterla entera producía un paréntesis dentro de otro y un `source`
    // de treinta líneas.
    const nota = a.nota ? primeraOracion(a.nota) : null;
    if (nota) partes.push(` (${minuscula(nota)})`);
  }
  if (a.categoria) partes.push(`, con la categoría «${a.categoria}»`);
  return partes.join('');
}

/**
 * `source`: la referencia concreta que respalda LA CITA EN ESTE ESPACIO. No es la ficha de la
 * especie —eso es universal— sino por qué consta que vive aquí.
 */
/**
 * La cita del formulario oficial del sitio Red Natura 2000, que para un ave es su evidencia
 * principal: es lo único que afirma que pertenece a ESTE sitio. Trae además el tipo de población
 * —permanente, reproductora, invernante— que declara el formulario, que es el dato que distingue al
 * ave que cría aquí de la que solo pasa el invierno.
 */
function fuenteDelSitio(sel) {
  const entradas = sel.listaOficialSitio || [];
  if (!entradas.length) return null;
  return entradas.map(e => {
    const detalle = [e.tipoPoblacion && `población ${e.tipoPoblacion}`, e.categoriaPoblacion]
      .filter(Boolean).join(', ');
    const citada = e.citadaComo && e.citadaComo !== sel.scientificName ? `, que la cita como «${e.citadaComo}»` : '';
    return `Formulario Normalizado de Datos del sitio Red Natura 2000 ${e.siteCode}` +
      `${e.siteName ? ` (${e.siteName})` : ''}, sección ${e.seccion}${citada}` +
      `${detalle ? `: ${detalle}` : ''}`;
  }).join('; ');
}

function fuenteDe(sel, gbif, fecha, zepa) {
  const partes = [];
  const n = sel.gbifOccurrences;
  const nHab = (gbif && gbif.habitats.length) || sel.habitats || 0;
  // Un ave NO se cuelga de hábitats a propósito (vuela: sus ocurrencias caen en cualquier polígono),
  // así que su `source` tampoco puede contar hábitats: sería afirmar un vínculo que `habitatIds`
  // desmiente. La cifra se decía igual y el validador solo dejaba de verla porque exime a las que
  // tienen `zepaSiteCode` — en cuanto llegó un espacio SIN ZEPA (Sierra de El Carche, ES6200009, que
  // es LIC y nada más), las 92 aves salieron como 92 errores. La frase se cambia para las aves de
  // todos los espacios, no solo las de éste: la imprecisión era la misma, solo que tapada.
  //
  // Y en un ave GBIF va como CONFIRMACIÓN, no como respaldo: desde el filtro 3 bis de la selección
  // ninguna entra por sus ocurrencias, así que el `source` las presenta en ese papel y deja la
  // afirmación de pertenencia a quien puede hacerla —el formulario del sitio o el anexo—.
  if (sel.class === 'Aves')
    partes.push(`GBIF confirma su presencia con ${n} ocurrencia${n === 1 ? '' : 's'} dentro del espacio ` +
      `(barrido de ${fecha}); las aves no se adscriben a hábitats`);
  else
    partes.push(`GBIF: ${n} ocurrencia${n === 1 ? '' : 's'} dentro de los polígonos de hábitat del espacio` +
      ` (${nHab} hábitat${nHab === 1 ? '' : 's'}; barrido de ${fecha})`);
  if ((sel.evidence || []).includes('caracteristica'))
    partes.push('Atlas y Manual de los Hábitats de España (MITECO, 2005): especie característica de alguno de los HIC cartografiados aquí');
  const sitio = fuenteDelSitio(sel);
  if (sitio) partes.push(sitio);
  const anexo = fuenteDelAnexo(sel);
  if (anexo) partes.push(anexo);
  if ((sel.normas || []).length)
    partes.push('EIDOS (IEPNB, MITECO) para la taxonomía y el estado legal');
  else
    partes.push('EIDOS (IEPNB, MITECO) para la taxonomía; sin figura de protección en la vista de normas');
  // Antes, aquí, toda ave decía «ave del apartado de la ZEPA ES…» por el mero hecho de que el
  // espacio solapa con esa ZEPA —salía del `zepa.geojson`, no de ninguna lista de especies—. Eso lo
  // dice ahora `fuenteDelSitio`, y lo dice de verdad: con el formulario, la sección y la población
  // declarada. Un ave SIN respaldo de sitio ya no llega aquí (filtro 3 bis), salvo que la selección
  // se haya hecho con `--aves-sin-respaldo`, y entonces conviene que su ficha lo diga.
  if (sel.class === 'Aves' && !sitio && !anexo)
    partes.push('sin respaldo documental de sitio: la selección se hizo con --aves-sin-respaldo, así que ' +
      'esta ave entró por sus ocurrencias de GBIF, que en un ave no miden pertenencia al espacio');
  return partes.join('; ');
}

// --- programa --------------------------------------------------------------------------------------

function main() {
  const seleccion = cargarSeleccion();
  const gbif = cargarGbif();
  const atlas = cargarAtlas();
  if (!fs.existsSync(CATALOGO)) die(`no existe el catálogo universal: ${rel(CATALOGO)}`);
  const universal = readJson(CATALOGO);
  const fichadas = cargarFichadas();

  // El park.json se localiza por el registro, igual que hace el frontend.
  const registro = readJson(path.join(FRONTEND, 'Data', 'parks-index.json'));
  let entrada = null;
  for (const c of registro.communities || []) for (const p of c.provinces || []) for (const pk of p.parks || [])
    if (pk.slug === PARK) entrada = pk;
  if (!entrada) die(`el espacio '${PARK}' no está en Frontend/Data/parks-index.json`);

  const manifestPath = path.join(FRONTEND, entrada.manifest);
  const manifest = readJson(manifestPath);
  const parkPath = path.join(FRONTEND, manifest.data);
  const doc = readJson(parkPath);
  const geoDir = path.join(path.dirname(parkPath), 'geo');
  const zepa = leerZepa(geoDir);
  const comunidad = (doc.park && doc.park.region) || null;
  const catalogosRegionales = fs.existsSync(CATALOGOS_REGIONALES) ? readJson(CATALOGOS_REGIONALES) : {};
  if (comunidad && !catalogosRegionales[comunidad]) {
    console.warn(`  ! «${comunidad}» no está en ${rel(CATALOGOS_REGIONALES)}: las fichas sin figura`);
    console.warn('    autonómica se quedarán SIN estado regional, en vez de afirmar una negación');
    console.warn('    sobre un catálogo que nadie ha mirado. Dale de alta la comunidad ahí.');
  }
  const fecha = seleccion.doc.generado || 'sin fecha';

  const habitatsDelParque = new Set((doc.habitats || []).map(h => h.id));
  const previas = new Map((doc.species || []).map(s => [s.scientificName, s]));

  console.log(`\nEspacio: ${entrada.name} (${PARK})`);
  console.log(`Selección aprobada: ${seleccion.doc.total} especies · ${rel(seleccion.ruta)}`);
  console.log(`Barrido GBIF: ${gbif.porNombre.size} especies indexadas · ${rel(gbif.ruta)}`);
  console.log(`ZEPA del espacio: ${zepa ? `${zepa.code} ${zepa.name || ''}` : '— (sin capa zepa.geojson)'}`);

  // 1) Resolver el nombre de cada seleccionada y repartir entre lo que se puede escribir y lo que no.
  const conFicha = [], pendientes = [], renombradas = [];
  const sinClaseEnLaSeleccion = [];
  for (const sel of seleccion.doc.especies || []) {
    const { nombre, renombrada } = resolverNombre(sel, fichadas, universal);
    if (renombrada) renombradas.push(renombrada);
    const u = universal[nombre];
    // La CLASE de la selección la pone GBIF, así que una especie SIN un solo registro dentro de los
    // polígonos llega aquí con `class: null` — y de `class === 'Aves'` cuelgan cuatro decisiones: el
    // orden de los `id`, que no se le cuelguen hábitats, la frase del `source` y, la que se ve,
    // el `zepaSiteCode`. Un ave que el formulario oficial del sitio SÍ declara pero que GBIF no ha
    // registrado dentro se quedaba fuera del apartado de la ZEPA con su evidencia
    // `lista_oficial_sitio` intacta al lado: el dato para ponerla estaba y no se miraba. Es el mismo
    // fallo que el de Sierra de El Carche —contar hábitats en un ave— entrando por otra puerta: allí
    // era «un ave sin ZEPA», aquí es «un ave sin ocurrencias». La clase se completa desde la ficha
    // universal, que la trae de EIDOS y no depende de que GBIF haya visto al bicho.
    const clase = sel.class || (u && u.taxonomy && u.taxonomy.class) || null;
    if (!sel.class && clase) sinClaseEnLaSeleccion.push(`${nombre} → ${clase}`);
    const resuelta = { ...sel, class: clase, scientificName: nombre, nombreEnLaSeleccion: sel.scientificName };
    (u ? conFicha : pendientes).push(resuelta);
  }

  // 2) Orden estable: primero lo que se ancla a hábitats y luego las aves (que van a su apartado de
  //    ZEPA), y dentro de cada bloque por número de ocurrencias. Es lo que fija los `id`.
  const clave = s => [s.class === 'Aves' ? 1 : 0, -s.gbifOccurrences, s.scientificName];
  conFicha.sort((a, b) => {
    const [ka, kb] = [clave(a), clave(b)];
    return ka[0] - kb[0] || ka[1] - kb[1] || String(ka[2]).localeCompare(String(kb[2]));
  });

  // 3) Montar las fichas ---------------------------------------------------------------------------
  let siguienteId = Math.max(0, ...[...previas.values()].map(s => Number(s.id) || 0)) + 1;
  const species = [];
  const avisos = [];
  const sinGbif = [], hiloPerdido = [], taxonIdDudoso = [], sinTaxonId = [], sinRarezaLocal = [], localPorEstatal = [];
  // Enlaces que solo sostiene el Atlas: no son un problema, son el backbone que antes se perdía.
  // Se listan al final para que se vea cuánto aporta la señal que no es GBIF.
  const porAtlas = [];
  const sinTramoLocal = [];

  for (const sel of conFicha) {
    const sci = sel.scientificName;
    const u = universal[sci];
    const antes = previas.get(sci);
    // El barrido de GBIF indexa por el nombre con el que GBIF sirve las ocurrencias, que no siempre
    // es el que usa el catálogo: la curruca rabilarga está fichada como `Curruca undata` y GBIF la
    // devuelve como `Sylvia undata`. La selección lo deja anotado en `sinonimosFusionados`
    // (`sinonimoDe` es la forma que usaban las selecciones anteriores a la reconciliación
    // automática, y se sigue leyendo para no romper las que ya están escritas).
    //
    // El ORDEN de búsqueda importa y no es el que parece: se mira PRIMERO el nombre con el que se
    // aprobó la selección, porque de ese registro salió el `gbifOccurrences` que se revisó. GBIF
    // llega a servir el mismo taxón bajo dos nombres y con dos claves distintas —*Bupleurum
    // gibraltaricum* (23 ocurrencias) y *Bupleurum gibraltarium* (34)—, así que buscar por el nombre
    // aceptado dejaría la clave de un registro con el recuento y los hábitats de otro.
    const alias = [sel.nombreEnLaSeleccion, ...(sel.sinonimosFusionados || []), sel.sinonimoDe, sci]
      .filter(Boolean).filter((n, i, a) => a.indexOf(n) === i);
    const g = alias.map(n => gbif.porNombre.get(n)).find(Boolean) || null;
    // No encontrar el barrido no siempre significa lo mismo, y la diferencia es la que costó cinco
    // fichas en Sierra de la Pila. Si la selección NO cuenta hábitats, la especie viene de otra vía y
    // quedarse sin enlaces es coherente. Si la selección dice «9 hábitats» —cifra que solo puede
    // haber salido de este mismo barrido— y aquí no aparece, entonces se ha perdido el hilo entre el
    // nombre del catálogo y el nombre de GBIF, y escribir la ficha con `habitatIds` vacío deja un
    // `source` que afirma lo contrario que el dato. Eso no es un aviso: es una contradicción.
    if (!g && sel.habitats > 0) {
      hiloPerdido.push(`${sci} · la selección le cuenta ${sel.habitats} hábitat(s) y ` +
        `${sel.gbifOccurrences} ocurrencia(s); alias probados: ${alias.join(', ')}`);
    } else if (!g) {
      sinGbif.push(sci);
    }
    // Si el barrido trae el taxón por partida doble, la cifra de este parque se queda corta: consta.
    const duplicadoGbif = alias.filter(n => gbif.porNombre.has(n) && gbif.porNombre.get(n) !== g)
      .map(n => `*${n}* (clave ${gbif.porNombre.get(n).speciesKey}, ` +
        `${gbif.porNombre.get(n).habitats.reduce((s, h) => s + h.ocurrencias, 0)} ocurrencias)`);

    const esAve = sel.class === 'Aves';
    const enlacesGbif = esAve ? [] : (g ? g.habitats.filter(h => habitatsDelParque.has(h.slug)) : []);
    // Las dos señales se UNEN, no se eligen: son las dos formas distintas de afirmar el vínculo que
    // describe la regla nº 1 del CLAUDE.md. GBIF dice «se ha registrado aquí dentro» y el Atlas «es
    // característica de este tipo de hábitat»; que falte una no desmiente a la otra. El orden deja
    // delante los enlaces con ocurrencias, para que la lista siga empezando por lo más medido.
    const soloAtlas = esAve ? [] :
      [...(atlas.porNombre.get(sci) || [])]
        .filter(slug => habitatsDelParque.has(slug))
        .filter(slug => !enlacesGbif.some(h => h.slug === slug))
        .map(slug => ({ slug, ocurrencias: 0, porAtlas: true }));
    if (soloAtlas.length) porAtlas.push(`${sci} · ${soloAtlas.map(h => h.slug).join(', ')}`);
    const enlaces = [...enlacesGbif, ...soloAtlas];

    // Los identificadores externos se REUTILIZAN del parque donde la especie ya está fichada; no se
    // inventan y no se vuelven a deducir. Ver identificadorReutilizado().
    const ya = fichadas.get(sci);
    const eidos = identificadorReutilizado(ya && ya.eidos, taxonIdDudoso, sci, 'eidosTaxonId');
    const gbifKey = identificadorReutilizado(ya && ya.gbif, taxonIdDudoso, sci, 'gbifSpeciesKey');
    // Si ningún otro parque la tiene fichada, la clave maestra se toma del catálogo universal, donde
    // la deja `build-species-universal.js` al dar de alta la ficha. Sin este segundo origen, una
    // especie que se ESTRENA en el catálogo nace sin `eidosTaxonId` por no tener de quién copiarlo
    // —le pasaba a las 99 primerizas de Carrascoy—, que es justo al revés de lo que se quiere.
    const eidosTaxonId = eidos.valor !== null ? eidos.valor : (u.eidosTaxonId != null ? u.eidosTaxonId : null);
    if (!eidos.hayFicha && eidosTaxonId == null) sinTaxonId.push(sci);

    /*
     * `rarityLocal` — el tramo legal que decide lo excepcional que es encontrarla EN ESTE ESPACIO, y
     * el que gobierna las destacadas.
     *
     * Antes las destacadas salían de `rarityScore`, que es universal y solo mira el ámbito estatal. Y
     * el Estado casi no discrimina: en Sierra de la Pila deja **una sola** especie en el tramo >= 4
     * sobre 243, porque 74 de ellas caen en el mismo cajón («en régimen de protección especial»).
     * Quien separa de verdad es el catálogo autonómico —25 de interés especial, 8 vulnerables, 1 en
     * peligro—, que es territorial y por eso no cabe en un campo universal. `rarityLocal` toma la
     * categoría más grave de los dos ámbitos y sube las destacadas de 1 a 10 en ese mismo espacio.
     *
     * Una selección anterior a este campo no lo trae. Entonces se cae al `rarityScore` universal y se
     * anota: escribir un 1 daría por comprobado un tramo que nadie ha calculado.
     *
     * Y NUNCA baja del `rarityScore` que se escribe en la misma ficha, porque el local INCLUYE al
     * estatal. Las dos cifras no salen del mismo sitio —el estatal es el `spainStatus` del catálogo
     * universal, el local sale de las `normas` que EIDOS devolvió al hacer la selección—, así que
     * cuando EIDOS no reconoce el nombre y devuelve cero normas, el local se quedaba en 1 con un
     * estatal de 2 y la ficha se contradecía a sí misma. Le pasó en Sierra de Salinas a la perdiz
     * roja, la tórtola europea, la chova piquirroja y el triguero. Prevalece el estatal, y el
     * `rarityLocalBasis` dice de dónde sale para que no parezca calculado.
     *
     * PERO SOLO CUANDO EL ESTATAL ESTÁ DERIVADO DE LA NORMA, que es lo que dice `rarityBasis`. Un
     * `rarityScore` SIN `rarityBasis` es uno de los valores heredados del criterio propio 1–5: un
     * número puesto a ojo, el mismo que `validate` sigue avisando y que la migración de
     * `rareza-legal.js --catalogo` todavía no ha recalculado. Usarlo de suelo no protege de una
     * contradicción: la fabrica, porque lava una suposición dentro del ÚNICO campo de rareza que la
     * app enseña, y de paso pisa el `rarityLocalBasis` derivado con uno que no lleva `categoria` ni
     * `norma` —así que el cartel de la ficha se queda sin la figura legal que debía citar—.
     *
     * Medido en Calblanque el 2026-08-21: 32 de 205 fichas llevaban el tramo inflado por esta vía.
     * La siempreviva de Cartagena, la salsola y el ajo de flor oscura salían «En peligro» (tramo 5)
     * siendo VULNERABLE en el Decreto 50/2003, y el cinomorio, que ahí es «de interés especial»
     * (tramo 3), salía también en 5. El estatal de las cuatro es un 5 heredado sin `rarityBasis`.
     *
     * Entre un tramo derivado de la norma y uno puesto a ojo, manda el derivado aunque sea más bajo.
     * Y si es el heredado el que se queda sin respaldo, la ficha lo dice en vez de inventárselo.
     */
    const estatalDerivado = u.rarityBasis ? (u.rarityScore || 1) : null;
    let rarityLocal = sel.rarityLocal != null ? sel.rarityLocal : (sinRarezaLocal.push(sci), estatalDerivado);
    let rarityLocalBasis = sel.rarityLocal != null ? (sel.rarityLocalBasis || null) : (u.rarityBasis || null);
    if (estatalDerivado != null && rarityLocal != null && estatalDerivado > rarityLocal) {
      localPorEstatal.push(sci);
      rarityLocal = estatalDerivado;
      rarityLocalBasis = {
        ...u.rarityBasis,
        origen: 'rarityScore estatal del catálogo universal: EIDOS no devolvió ninguna norma para ' +
                'este taxón al hacer la selección, y el tramo local no puede quedar por debajo del estatal',
      };
    }
    // Sin selección y sin estatal derivado no hay de dónde sacar el tramo. Queda SIN él —la ficha lo
    // omite— y la app enseña el aviso de «nadie lo ha mirado», que es la regla nº 9 del CLAUDE.md:
    // publicar de menos se corrige, dar por comprobado lo que no lo está, no.
    if (rarityLocal == null) sinTramoLocal.push(sci);

    // La fenología solo la afirma el formulario del sitio, y solo se le pregunta a las AVES: para
    // una planta el tipo de población del FND no significa «migra», así que clasificarla sería
    // inventar un dato que la fuente no da.
    const fenologia = esAve ? clasificaPresenciaSitio(sel.listaOficialSitio) : null;

    const ficha = {
      id: antes ? antes.id : siguienteId++,
      scientificName: sci,
      conservationStatus: etiquetaConservacion(sel.normas, u.iucnGlobal),
      coordinates: null,
      // `undefined` y no `null`: ORDEN filtra los `undefined`, así que la ficha OMITE el campo en vez
      // de escribir un hueco. Son dos cosas distintas y la app las distingue.
      rarityLocal: rarityLocal == null ? undefined : rarityLocal,
      rarityLocalBasis: rarityLocal == null ? undefined : rarityLocalBasis,
      featured: rarityLocal >= 4,
      source: fuenteDe(sel, g, fecha, zepa),
      regionalStatus: estadoAutonomico(sel.normas, comunidad, catalogosRegionales),
      // A qué comunidad se refiere ese estado. Va en la ficha y no solo en el espacio porque la
      // misma especie puede estar catalogada distinto en dos comunidades, y el rótulo que ve el
      // usuario tiene que decir de cuál habla.
      regionalCcaa: comunidad,
      reviewNote: notaDeRevision(sel, duplicadoGbif),
      eidosTaxonId,
      gbifSpeciesKey: gbifKey.valor !== null ? gbifKey.valor : (g ? g.speciesKey : null),
      zepaSiteCode: esAve ? sitioQueLaDeclara(sel, zepa) : null,
      // Fenología en el sitio: si el formulario oficial la declara migratoria y con qué tipo de
      // población. Campo OMITIDO cuando ningún formulario la nombra (ver Tools/lib/fenologia.js):
      // «nadie lo ha mirado» no puede escribirse como «comprobado que no».
      migratory: fenologia ? fenologia.migratory : undefined,
      sitePresence: fenologia ? fenologia.sitePresence : undefined,
      habitatIds: enlaces.map(h => h.slug),
      gbifOccurrences: sel.gbifOccurrences,
      visible: true,
    };
    /*
     * Un campo universal que el catálogo NO TRAE se OMITE, no se escribe como `null`.
     *
     * Escribir `null` es afirmar algo —«mirado, no hay»— sobre un campo que nadie ha mirado, que es
     * justo lo que prohíbe la cabecera de `lista-roja-espana.js` («lo que la fuente no trae se queda
     * sin campo, nunca con un No evaluada»). Y además ROMPE `validate` en cuanto se regenera un
     * espacio: la comprobación de coherencia entre parques compara con `JSON.stringify`, donde
     * `null` y ausente son distintos, y `species:apply` no lo puede arreglar porque salta los campos
     * que el catálogo no tiene. Con `iucnSpain` —que llegó el 2026-08-27, cuando los quince espacios
     * ya estaban escritos sin él— eso eran 21 errores en Sierra de las Moreras nada más regenerarla:
     * 22 fichas con `iucnSpain: null` frente a la misma especie sin el campo en los demás espacios.
     * El `ORDEN` de abajo ya filtra los `undefined`, así que basta con no ponerlo.
     */
    for (const campo of UNIVERSALES) ficha[campo] = u[campo];
    if (antes) for (const campo of CURADOS) if (antes[campo] !== undefined) ficha[campo] = antes[campo];

    species.push(Object.fromEntries(ORDEN.filter(k => ficha[k] !== undefined).map(k => [k, ficha[k]])));
  }

  // Una ficha que ya estaba en el park.json y que la selección no respalda no se borra en silencio.
  //
  // Con `--podar` sí se retira, y hay un caso en que hace falta: cuando la selección RECONCILIA dos
  // nombres del mismo taxón (GBIF sirve el sinónimo y el aceptado como especies distintas), el
  // nombre viejo queda huérfano y conservarlo deja la misma especie dos veces en el mismo espacio
  // —*Sylvia melanocephala* junto a *Curruca melanocephala*—, que es peor que borrarla. Sigue sin
  // ser el comportamiento por omisión: una ficha puede estar ahí porque alguien la puso a mano.
  const huerfanas = [...previas.keys()].filter(sci => !conFicha.some(s => s.scientificName === sci));
  for (const sci of huerfanas) {
    if (PODAR) { avisos.push(`ficha PODADA por no tener respaldo en la selección: ${sci}`); continue; }
    species.push(previas.get(sci));
    avisos.push(`ficha conservada sin respaldo en la selección: ${sci} (usa --podar para retirarla)`);
  }

  // 4) Inverso especie↔hábitat en el array de hábitats ---------------------------------------------
  const porHabitat = new Map((doc.habitats || []).map(h => [h.id, []]));
  for (const sp of species) for (const hid of sp.habitatIds || []) if (porHabitat.has(hid)) porHabitat.get(hid).push(sp.id);
  for (const h of doc.habitats || []) h.speciesIds = (porHabitat.get(h.id) || []).sort((a, b) => a - b);

  doc.species = species;

  // 5) Escribir -------------------------------------------------------------------------------------
  // El paquete y la `version` del manifiesto los escribe `lib/io.js` en el mismo paso: separarlos deja
  // al dispositivo que ya tenía el espacio guardado sin conexión con el catálogo viejo, sin error y
  // sin aviso, y con el dato bien en el repositorio.
  const { lineas } = escribeEspacio({
    file: parkPath, manifestFile: manifestPath, doc, write: !DRY,
    counts: {
      species: species.length,
      habitats: (doc.habitats || []).length,
      pointsOfInterest: (doc.pointsOfInterest || []).length,
    },
  });
  console.log('\n' + lineas.join('\n'));

  // 6) Informe de las que se quedan fuera ------------------------------------------------------------
  const pendientesPath = path.join(OUT_DIR, `${PARK}-especies-pendientes.md`);
  const informe = informePendientes(pendientes, seleccion, gbif);
  const previoInforme = fs.existsSync(pendientesPath) ? fs.readFileSync(pendientesPath, 'utf8') : null;
  if (pendientes.length) {
    if (!DRY) { fs.mkdirSync(OUT_DIR, { recursive: true }); fs.writeFileSync(pendientesPath, informe, 'utf8'); }
    console.log(previoInforme === informe ? `= ${rel(pendientesPath)}` : `${DRY ? '~' : '+'} ${rel(pendientesPath)}`);
  } else if (previoInforme !== null) {
    // Sin pendientes, el informe de la ejecución anterior es una MENTIRA que se queda en el repo
    // diciendo que faltan cien especies. Se borra: el fichero es el estado, no un histórico.
    if (!DRY) fs.unlinkSync(pendientesPath);
    console.log(`${DRY ? '~' : '-'} ${rel(pendientesPath)} (ya no queda ninguna pendiente)`);
  }

  // 7) Resumen ---------------------------------------------------------------------------------------
  const aves = species.filter(s => s.zepaSiteCode).length;
  const conFoto = species.filter(s => s.image).length;
  const conEnlace = species.filter(s => (s.habitatIds || []).length).length;
  console.log(`\n${species.length} especies escritas (${aves} aves en el apartado de ZEPA, ` +
    `${conEnlace} colgadas de al menos un hábitat) · ${conFoto} con foto`);
  console.log(`Enlaces especie↔hábitat: ${species.reduce((n, s) => n + (s.habitatIds || []).length, 0)}`);
  if (porAtlas.length) {
    console.log(`  · ${porAtlas.length} de ellos los sostiene SOLO el Atlas (especie característica del HIC,\n` +
      '    sin ocurrencia dentro del polígono). Es evidencia de fuente, no un hueco:');
    for (const l of porAtlas) console.log('      ' + l);
  } else if (atlas.presente) {
    console.log('  · el Atlas no añade ningún enlace que GBIF no tuviera ya.');
  }
  console.log(`Destacadas (rarityLocal ≥ 4): ${species.filter(s => s.featured).length}`);
  const porTramo = [5, 4, 3, 2, 1].map(n => `${n}:${species.filter(s => s.rarityLocal === n).length}`);
  console.log(`Rareza local (tramo legal, estatal+autonómico): ${porTramo.join(' · ')}`);

  if (pendientes.length)
    console.log(`\n⚠ ${pendientes.length} especies de la selección NO se han escrito: no tienen ficha en el\n` +
      `  catálogo universal (les falta taxonomía, nombre común, UICN y foto, que son cuatro fuentes\n` +
      `  externas). Listadas con lo que ya se sabe de ellas en ${rel(pendientesPath)}.`);
  if (renombradas.length) {
    console.log(`\n⚠ ${renombradas.length} ficha(s) escritas con un nombre distinto al de la selección, porque es el que\n` +
      '  usa hoy el resto del catálogo (una revisión nomenclatural posterior a la selección):');
    renombradas.forEach(r => console.log('  · ' + r));
  }
  if (sinRarezaLocal.length)
    console.log(`\n⚠ ${sinRarezaLocal.length} ficha(s) sin \`rarityLocal\` en la selección: se ha usado el \`rarityScore\`\n` +
      '  universal cuando estaba derivado de una norma, que solo mira el ámbito estatal y deja casi todo\n' +
      '  en el mismo tramo (y cuando no lo estaba, la ficha se ha quedado sin tramo). La selección es\n' +
      '  anterior al campo; vuelve a pasar `npm run species:seleccion` para que las destacadas de este\n' +
      '  espacio salgan del criterio de verdad y no del heredado.');
  if (sinTramoLocal.length)
    console.log(`\n⚠ ${sinTramoLocal.length} ficha(s) SIN \`rarityLocal\`: ni la selección lo trae ni el \`rarityScore\`\n` +
      '  universal está derivado de una norma (le falta `rarityBasis`, así que es uno de los valores\n' +
      '  heredados a ojo). No se les escribe un tramo inventado: la app las enseña con el aviso de\n' +
      `  precaución por defecto. Las resuelve \`npm run especies:rareza --catalogo\`: ${sinTramoLocal.join(', ')}`);
  if (localPorEstatal.length)
    console.log(`\n⚠ ${localPorEstatal.length} ficha(s) con el \`rarityLocal\` de la selección POR DEBAJO del \`rarityScore\`\n` +
      '  estatal, que lo incluye: EIDOS no devolvió ninguna norma para ese taxón. Se ha escrito el estatal\n' +
      `  y su procedencia va en el \`rarityLocalBasis\`: ${localPorEstatal.join(', ')}`);
  if (sinClaseEnLaSeleccion.length)
    console.log(`\n· ${sinClaseEnLaSeleccion.length} ficha(s) sin clase en la selección —GBIF no las ha registrado dentro, y de ahí\n` +
      '  sale ese campo—: se ha completado desde la ficha universal, que la trae de EIDOS. Importa porque\n' +
      '  de la clase cuelgan el orden de los `id`, que no se le cuelguen hábitats a un ave, la frase del\n' +
      `  \`source\` y el \`zepaSiteCode\`: ${sinClaseEnLaSeleccion.join(', ')}`);
  if (sinGbif.length) console.log(`\n⚠ ${sinGbif.length} sin entrada en el barrido de GBIF (quedan sin hábitat ni clave): ${sinGbif.join(', ')}`);
  if (hiloPerdido.length) {
    console.error(`\n✖ ${hiloPerdido.length} ficha(s) escritas SIN enlaces a hábitat aunque la selección se los cuenta.\n` +
      '  El barrido no aparece bajo ninguno de sus alias, así que se ha perdido el hilo entre el nombre\n' +
      '  del catálogo y el nombre con el que GBIF sirve el taxón. La ficha queda con un `source` que\n' +
      '  afirma lo que `habitatIds` desmiente. Se arregla anotando el nombre de GBIF en\n' +
      '  `sinonimosFusionados` (lo hace `npm run species:seleccion` al reconciliar):');
    hiloPerdido.forEach(t => console.error('  · ' + t));
  }
  if (sinTaxonId.length) console.log(`\n⚠ ${sinTaxonId.length} sin eidosTaxonId reutilizable de otro parque: ${sinTaxonId.join(', ')}`);
  if (taxonIdDudoso.length) {
    console.log(`\n⚠ ${taxonIdDudoso.length} identificador(es) que los demás parques no tienen igual. NO se elige uno:\n` +
      '  la ficha se escribe con ese campo a null y queda en `npm run taxones:duplicados` hasta que se resuelva.');
    taxonIdDudoso.forEach(t => console.log('  · ' + t));
  }
  avisos.forEach(a => console.log('\n⚠ ' + a));
  if (DRY) console.log('\nSimulación: no se ha tocado nada.');
  // Salida en rojo mientras queden contradicciones, igual que `npm run taxones:duplicados`. Lo
  // escrito se queda —revertirlo perdería el resto del trabajo— pero la ejecución no puede darse por
  // buena: es exactamente el aviso que se pasó por alto la primera vez.
  if (hiloPerdido.length) process.exitCode = 1;
}

/*
 * La nota de revisión visible en la app: SOLO dudas propias de ESTA ficha —una nomenclatural, un
 * taxón que GBIF sirve con dos nombres, la salvedad que traiga la selección—.
 *
 * Lo que ya no escribe, y por qué. Hasta hoy toda ave se llevaba además una nota estructural
 * («presencia respaldada por N ocurrencias de GBIF; queda pendiente contrastarla con la lista
 * oficial del sitio…»). Eso no era una duda sobre esa ave: era una propiedad de cómo entraban TODAS
 * las aves, repetida ficha a ficha. El efecto medido: 366 de las 557 aves del catálogo con
 * `reviewNote`, y 357 de las 487 tarjetas que la app marcaba «a revisar». Un aviso que sale en tres
 * de cada cuatro tarjetas no avisa de nada, y tapaba las 131 fichas con una duda de verdad.
 *
 * No se sustituye por una nota de apartado porque ya no hay nada pendiente que decir: desde que
 * `especies-sitio-rn2000.js` trae el formulario oficial del sitio y la selección exige respaldo de
 * sitio para aprobar un ave, la evidencia existe y su sitio es el `source` —«por qué consta que vive
 * aquí»—, que es donde se lee entera y con su cita.
 */
function notaDeRevision(sel, duplicadoGbif) {
  const partes = [];
  if (sel.reviewNote) partes.push(sel.reviewNote);
  if ((duplicadoGbif || []).length) partes.push(
    `GBIF sirve este taxón bajo más de un nombre: además del registro que se ha usado ` +
    `(el de la selección aprobada), hay ${duplicadoGbif.join(' y ')}. El recuento de ocurrencias de ` +
    'esta ficha se queda por tanto CORTO respecto a la presencia real en el espacio.');
  // Si la ficha se ha renombrado, la nota de la selección explica por qué se conservaba el nombre
  // viejo y ya no es cierta: se sustituye por lo que de verdad ha pasado.
  if (sel.nombreEnLaSeleccion && sel.nombreEnLaSeleccion !== sel.scientificName)
    partes.push(`Seleccionada como *${sel.nombreEnLaSeleccion}*; se ficha con el nombre aceptado en EIDOS, ` +
      'que es con el que el resto del catálogo la tiene desde la revisión nomenclatural posterior a la selección.');
  else if (sel.notaNomenclatural) partes.push(sel.notaNomenclatural);
  return partes.length ? partes.join(' ') : null;
}

/** Informe de las seleccionadas que se quedan fuera, con todo lo que ya se sabe de cada una. */
function informePendientes(pendientes, seleccion, gbif) {
  const l = [];
  l.push(`# ${PARK} · especies seleccionadas sin ficha universal`, '');
  l.push('GENERADO por `Tools/catalogo-nacional/build-species-n2.js`. No editar a mano.', '');
  l.push('Estas especies **están aprobadas** en `' + path.basename(seleccion.ruta) + '` y tienen constancia en GBIF dentro de los');
  l.push('polígonos de hábitat del espacio, pero **no se han escrito en el `park.json`**: no existen todavía en');
  l.push('`Tools/catalogo-nacional/data/especies-universal.json` y una ficha necesita taxonomía completa, nombre');
  l.push('común, evaluación UICN y foto con licencia. Eso son cuatro fuentes externas (EIDOS, GBIF, Wikipedia,');
  l.push('Wikimedia Commons) y **ninguna se puede suplir de memoria** (regla nº 2 de `CLAUDE.md`).', '');
  l.push('En cuanto tengan ficha universal, esta herramienta las incorpora sola: no hay que tocar nada más.', '');
  l.push(`Total: **${pendientes.length}**.`, '');
  l.push('| Nombre científico | Clase | Ocurrencias GBIF | Hábitats | Evidencia | Estado legal (IEPNB) |');
  l.push('|---|---|---|---|---|---|');
  for (const s of pendientes) {
    const g = gbif.porNombre.get(s.scientificName);
    const normas = (s.normas || []).map(n => `${n.categoria} · ${n.ambito}`).join('<br>') || '—';
    l.push(`| *${s.scientificName}* | ${s.class} | ${s.gbifOccurrences} | ${g ? g.habitats.length : 0} | ` +
      `${(s.evidence || []).join(', ')} | ${normas} |`);
  }
  l.push('');
  return l.join('\n');
}

main();
