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
const { ROOT, FRONTEND, CATALOGO_DIR, OUT_DIR, readJson, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');

const DRY = flag('dry');
const PODAR = flag('podar');
const PARK = arg('park');
requireArgs('Uso: --park <slug> [--dry] [--podar] [--seleccion <ruta>] [--gbif <ruta>]', { park: PARK });

const CATALOGO = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');

// Campos que describen a la ESPECIE. Se copian literalmente del catálogo universal; son los mismos
// que sincroniza Tools/sync-species-catalog.js, y por eso `npm run species:apply` no los mueve.
const UNIVERSALES = ['commonName', 'kingdom', 'group', 'habitat', 'seasonality', 'rarityScore', 'rarityBasis',
  'description', 'descriptionSource', 'tips', 'taxonomy', 'iucnGlobal', 'spainStatus', 'image', 'imageAttribution'];

// Campos LOCALES que, si la ficha ya existía en este park.json, se conservan tal cual: o los ha
// puesto una persona (coordinates, audio, la nota de revisión) o son una decisión editorial de este
// catálogo (featured, visible). Todo lo demás se recalcula desde las fuentes en cada pase.
const CURADOS = ['coordinates', 'featured', 'visible', 'hiddenReason', 'reviewNote', 'audio', 'audioTranscript'];

// Orden de las claves de la ficha. Fijarlo importa: sin él, dos ejecuciones que producen los mismos
// datos generan diffs distintos según el orden en que se hayan ido asignando las propiedades.
const ORDEN = ['id', 'commonName', 'scientificName', 'kingdom', 'group', 'habitat',
  'conservationStatus', 'description', 'descriptionSource', 'tips', 'seasonality', 'image', 'imageAttribution',
  'coordinates', 'rarityScore', 'rarityBasis', 'rarityLocal', 'rarityLocalBasis', 'featured', 'source', 'taxonomy', 'iucnGlobal', 'spainStatus',
  'murciaStatus', 'reviewNote', 'eidosTaxonId', 'gbifSpeciesKey', 'zepaSiteCode', 'habitatIds',
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
 * Índice del barrido de GBIF por nombre científico: clave de especie, clase y en qué hábitats del
 * parque se ha observado, con cuántas ocurrencias en cada uno.
 */
function cargarGbif() {
  const p = fromRoot(arg('gbif', path.join(OUT_DIR, `${PARK}-gbif.json`)));
  if (!fs.existsSync(p)) die(`no existe el barrido de GBIF: ${rel(p)}\n` +
    'Se genera con `npm run gbif:habitats` (necesita red).');
  const doc = readJson(p);
  const porNombre = new Map();
  for (const h of doc.habitats || []) {
    for (const s of h.species || []) {
      if (!porNombre.has(s.name)) porNombre.set(s.name, { speciesKey: s.speciesKey, clase: s.class, habitats: [] });
      porNombre.get(s.name).habitats.push({ slug: h.slug, hic: h.hic, ocurrencias: s.occurrences });
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
 * `murciaStatus`: el estado legal en el ámbito autonómico, con la norma que lo dice.
 * ⚠️ El nombre del campo está atado a Murcia — es la deuda nº 1 del rollout (Docs/DEUDA-TECNICA.md).
 */
function estadoAutonomico(normas, comunidad) {
  const auto = categoriaDe(normas, false);
  // Sin artículo delante del nombre de la comunidad: «de la Región de Murcia» se lee bien pero
  // «de la Andalucía» no, y este texto tiene que servir para las diecisiete.
  if (!auto) return `No incluida en el Catálogo Regional de especies protegidas (${comunidad})`;
  return `${auto.categoria} (${auto.norma})`;
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

/**
 * `source`: la referencia concreta que respalda LA CITA EN ESTE ESPACIO. No es la ficha de la
 * especie —eso es universal— sino por qué consta que vive aquí.
 */
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
  if (sel.class === 'Aves')
    partes.push(`GBIF: ${n} ocurrencia${n === 1 ? '' : 's'} dentro del espacio (barrido de ${fecha}); ` +
      'las aves no se adscriben a hábitats');
  else
    partes.push(`GBIF: ${n} ocurrencia${n === 1 ? '' : 's'} dentro de los polígonos de hábitat del espacio` +
      ` (${nHab} hábitat${nHab === 1 ? '' : 's'}; barrido de ${fecha})`);
  if ((sel.evidence || []).includes('caracteristica'))
    partes.push('Atlas y Manual de los Hábitats de España (MITECO, 2005): especie característica de alguno de los HIC cartografiados aquí');
  if ((sel.normas || []).length)
    partes.push('EIDOS (IEPNB, MITECO) para la taxonomía y el estado legal');
  else
    partes.push('EIDOS (IEPNB, MITECO) para la taxonomía; sin figura de protección en la vista de normas');
  if (zepa && sel.class === 'Aves')
    partes.push(`ave del apartado de la ZEPA ${zepa.code}${zepa.name ? ` (${zepa.name})` : ''}`);
  return partes.join('; ');
}

// --- programa --------------------------------------------------------------------------------------

function main() {
  const seleccion = cargarSeleccion();
  const gbif = cargarGbif();
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
  const comunidad = (doc.park && doc.park.region) || 'la comunidad autónoma';
  const fecha = seleccion.doc.generado || 'sin fecha';

  const habitatsDelParque = new Set((doc.habitats || []).map(h => h.id));
  const previas = new Map((doc.species || []).map(s => [s.scientificName, s]));

  console.log(`\nEspacio: ${entrada.name} (${PARK})`);
  console.log(`Selección aprobada: ${seleccion.doc.total} especies · ${rel(seleccion.ruta)}`);
  console.log(`Barrido GBIF: ${gbif.porNombre.size} especies indexadas · ${rel(gbif.ruta)}`);
  console.log(`ZEPA del espacio: ${zepa ? `${zepa.code} ${zepa.name || ''}` : '— (sin capa zepa.geojson)'}`);

  // 1) Resolver el nombre de cada seleccionada y repartir entre lo que se puede escribir y lo que no.
  const conFicha = [], pendientes = [], renombradas = [];
  for (const sel of seleccion.doc.especies || []) {
    const { nombre, renombrada } = resolverNombre(sel, fichadas, universal);
    if (renombrada) renombradas.push(renombrada);
    const resuelta = { ...sel, scientificName: nombre, nombreEnLaSeleccion: sel.scientificName };
    (universal[nombre] ? conFicha : pendientes).push(resuelta);
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
  const sinGbif = [], hiloPerdido = [], taxonIdDudoso = [], sinTaxonId = [], sinRarezaLocal = [];

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
    const enlaces = esAve ? [] : (g ? g.habitats.filter(h => habitatsDelParque.has(h.slug)) : []);

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
     */
    const rarityLocal = sel.rarityLocal != null ? sel.rarityLocal : (sinRarezaLocal.push(sci), (u.rarityScore || 1));

    const ficha = {
      id: antes ? antes.id : siguienteId++,
      scientificName: sci,
      conservationStatus: etiquetaConservacion(sel.normas, u.iucnGlobal),
      coordinates: null,
      rarityLocal,
      rarityLocalBasis: sel.rarityLocalBasis || null,
      featured: rarityLocal >= 4,
      source: fuenteDe(sel, g, fecha, zepa),
      murciaStatus: estadoAutonomico(sel.normas, comunidad),
      reviewNote: notaDeRevision(sel, esAve, zepa, duplicadoGbif),
      eidosTaxonId,
      gbifSpeciesKey: gbifKey.valor !== null ? gbifKey.valor : (g ? g.speciesKey : null),
      zepaSiteCode: esAve && zepa ? zepa.code : null,
      habitatIds: enlaces.map(h => h.slug),
      gbifOccurrences: sel.gbifOccurrences,
      visible: true,
    };
    for (const campo of UNIVERSALES) ficha[campo] = u[campo] === undefined ? null : u[campo];
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
  const antesTexto = fs.readFileSync(parkPath, 'utf8');
  const nuevoTexto = JSON.stringify(doc, null, 2) + '\n';
  const cambiaPark = antesTexto !== nuevoTexto;

  manifest.counts = manifest.counts || {};
  manifest.counts.species = species.length;
  manifest.counts.habitats = (doc.habitats || []).length;
  manifest.counts.pointsOfInterest = (doc.pointsOfInterest || []).length;
  // El manifiesto es lo que decide si un dispositivo con el espacio guardado sin conexión vuelve a
  // descargarlo: si el contenido cambia y `version` no sube, el usuario se queda con lo viejo.
  const manifestAntes = fs.readFileSync(manifestPath, 'utf8');
  if (cambiaPark) {
    manifest.version = (Number(manifest.version) || 0) + 1;
    manifest.updatedAt = new Date().toISOString().slice(0, 10);
  }
  const manifestNuevo = JSON.stringify(manifest, null, 2) + '\n';

  const escribir = (p, txt, previo) => {
    if (previo === txt) return `= ${rel(p)}`;
    if (!DRY) fs.writeFileSync(p, txt, 'utf8');
    return `${DRY ? '~' : '+'} ${rel(p)}`;
  };
  console.log('\n' + escribir(parkPath, nuevoTexto, antesTexto));
  console.log(escribir(manifestPath, manifestNuevo, manifestAntes));

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
      '  universal, que solo mira el ámbito estatal y deja casi todo en el mismo tramo. La selección es\n' +
      '  anterior al campo; vuelve a pasar `npm run species:seleccion` para que las destacadas de este\n' +
      '  espacio salgan del criterio de verdad y no del heredado.');
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

/**
 * La nota de revisión visible en la app. Recoge la duda nomenclatural que traiga la selección y,
 * en las aves, deja constancia de que su presencia se apoya en GBIF y no en la lista oficial de
 * especies del sitio Natura 2000, que es la fuente que el runbook pide para el apartado de ZEPA.
 */
function notaDeRevision(sel, esAve, zepa, duplicadoGbif) {
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
  if (esAve && zepa) partes.push(
    `Presencia respaldada por ${sel.gbifOccurrences} ocurrencia${sel.gbifOccurrences === 1 ? '' : 's'} de GBIF ` +
    `dentro del espacio; queda pendiente contrastarla con la lista oficial de especies del sitio ${zepa.code}, ` +
    'que no ha podido consultarse (el servicio Discodata de la EEA rechaza las tablas probadas y el visor SDF sirve la ficha vacía).');
  // Un espacio puede ser LIC y no ZEPA, y entonces no hay lista oficial de aves con la que
  // contrastar: no es que no se haya podido consultar, es que no existe. Decirlo es distinto de
  // callarlo, y evita que la ficha parezca un pendiente que nadie va a poder cerrar nunca.
  else if (esAve) partes.push(
    `Presencia respaldada por ${sel.gbifOccurrences} ocurrencia${sel.gbifOccurrences === 1 ? '' : 's'} de GBIF ` +
    'dentro del espacio. Este espacio NO tiene ZEPA declarada, así que no hay lista oficial de aves ' +
    'del sitio Natura 2000 con la que contrastarla: el respaldo documental, cuando lo hay, es el ' +
    'inventario de fauna del plan de gestión del espacio.');
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
