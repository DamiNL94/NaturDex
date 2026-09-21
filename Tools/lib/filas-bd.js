'use strict';
/*
 * filas-bd.js — qué valor deja un `park.json` en cada columna de la base, escrito UNA sola vez.
 *
 * El problema que resuelve
 * ------------------------
 * Un espacio llega a la base por dos generadores —`build-park-sql.js` (hábitats y especies) y
 * `build-poi-sql.js` (puntos de interés)— y vuelve por `Backend/Lib/park_payload.php`, que es de donde
 * sale lo que ve el usuario: la API manda sobre el paquete. Cada campo se codifica a la ida y se
 * decodifica a la vuelta, en dos lenguajes, y si las dos codificaciones dejan de ser inversas el dato
 * cambia por el camino sin que falle nada. Pasó con `tips`: se escribía unido con «; » y se leía
 * partiendo por «;», así que «Alas largas y estrechas; vuelo veloz y alto» volvía en dos viñetas
 * (24 fichas de 5 taxones en 13 espacios, medido el 2026-09-11).
 *
 * `coteja-ida-y-vuelta.js` no podía verlo porque solo comparaba CLAVES, y para comparar VALORES tenía
 * que saber qué escribe cada generador en cada columna: copiar esa lógica habría sido una codificación
 * más que diverge. Por eso vive aquí. Los generadores escriben el SQL con estas tablas y la
 * comprobación simula la ida con ellas; una columna nueva se añade aquí y les llega a los tres.
 *
 * El TIPO de cada columna decide dos cosas que no pueden separarse: el valor que guarda la base (lo
 * que devolverá mysqli) y el literal SQL que lo escribe. El literal se deriva del valor, no al revés.
 */

const { sqlStr, columnaTips } = require('./sql');

const vacio = v => v === null || v === undefined;
const textoONull = v => (vacio(v) || String(v).trim() === '' ? null : String(v));

const TIPOS = {
  // Cadena tal cual; NULL solo si no hay valor.
  texto: { valor: v => (vacio(v) ? null : String(v)) },
  // La cadena en blanco también es NULL (`sqlStrOrNull`): en los campos de texto libre de las fichas
  // «sin dato» y «en blanco» son lo mismo, y así un `IS NOT NULL` no cuenta vacíos como rellenos.
  textoONull: { valor: textoONull },
  // Número o NULL (`sqlNum`): un `undefined` no puede acabar escrito como la palabra «undefined».
  num: { valor: v => (vacio(v) || v === '' || !Number.isFinite(Number(v)) ? null : Number(v)) },
  // Booleano de MySQL (TINYINT 0/1). NULL se conserva: en varias columnas es un tercer estado.
  bool: { valor: v => (vacio(v) ? null : (v ? 1 : 0)) },
  // Columna JSON: el objeto serializado. `null` → NULL, nunca la cadena "null".
  json: { valor: v => (vacio(v) ? null : JSON.stringify(v)) },
  // Las pistas de identificación. El formato y su porqué están en `columnaTips` (sql.js).
  tips: { valor: columnaTips },
  // `points_of_interest.is_approx` es NOT NULL, y build-poi-sql.js lo ha escrito siempre TRUE/FALSE.
  boolNoNulo: { valor: v => (v ? 1 : 0), literal: x => (x ? 'TRUE' : 'FALSE') },
};

function literal(tipo, valor) {
  const t = TIPOS[tipo];
  if (t.literal) return t.literal(valor);
  if (valor === null) return 'NULL';
  return typeof valor === 'number' ? String(valor) : sqlStr(valor);
}

// --- Las tablas -----------------------------------------------------------------------------------
// Cada columna es [nombre, tipo, de dónde sale]. `claves` son las claves únicas de schema.sql (sin
// `park_id`): son las que deciden si un INSERT … ON DUPLICATE KEY UPDATE crea fila o PISA una que ya
// estaba, y la comprobación de ida y vuelta las necesita para simular esa segunda posibilidad.

const HABITAT = {
  tabla: 'habitats',
  claves: [['slug'], ['code']],
  columnas: [
    ['slug', 'texto', h => h.id],
    ['code', 'textoONull', h => h.code],
    ['name', 'texto', h => h.name],
    ['habitat_type', 'textoONull', h => h.type],
    ['description', 'textoONull', h => h.description],
    ['is_priority', 'bool', h => h.priority],
    ['latitude', 'num', h => h.coordinates && h.coordinates[0]],
    ['longitude', 'num', h => h.coordinates && h.coordinates[1]],
    ['color', 'textoONull', h => h.color],
    // Vive en el geojson, no en el park.json: sin ella el mapa dibuja un círculo en vez del polígono.
    ['geometry', 'json', (h, c) => c.geometria],
    ['review_note', 'textoONull', h => h.reviewNote],
    ['hic_subtipos', 'json', h => h.hicSubtipos],
    ['fitosociologia', 'json', h => h.fitosociologia],
    // La PROCEDENCIA del recinto (regla nº 1 del CLAUDE.md). Es una propiedad del RECINTO, no de la
    // ficha, y viaja en el geojson como la geometría: `fuentes` son las DOS citas de un recinto
    // fundido y `solo_curada` marca el que no tiene equivalente oficial (deuda nº 3).
    ['origen', 'textoONull', (h, c) => c.origen],
    ['fuentes', 'json', (h, c) => c.props && c.props.fuentes],
    ['solo_curada', 'bool', (h, c) => c.props && c.props.solo_curada],
    ['audio_url', 'textoONull', h => h.audio],
    ['audio_transcript', 'textoONull', h => h.audioTranscript],
    ['image_url', 'textoONull', h => h.image],
    ['image_attribution', 'textoONull', h => h.imageAttribution],
    ['image_note', 'textoONull', h => h.imageNote],
  ],
};

const tax = s => s.taxonomy || {};

const ESPECIE = {
  tabla: 'species',
  claves: [['scientific_name']],
  columnas: [
    ['common_name', 'texto', s => s.commonName],
    ['scientific_name', 'texto', s => s.scientificName],
    ['kingdom', 'texto', s => s.kingdom],
    // `family` es el nombre HISTÓRICO de la columna del `group` (el porte: «Arbusto», «Ave»…).
    ['family', 'textoONull', s => s.group],
    ['primary_habitat', 'textoONull', s => s.habitat],
    ['description', 'textoONull', s => s.description],
    ['description_source', 'textoONull', s => s.descriptionSource],
    ['identification_tips', 'tips', s => s.tips],
    ['seasonality', 'textoONull', s => s.seasonality],
    ['image_url', 'textoONull', s => s.image],
    ['image_attribution', 'textoONull', s => s.imageAttribution],
    ['latitude', 'num', s => s.coordinates && s.coordinates[0]],
    ['longitude', 'num', s => s.coordinates && s.coordinates[1]],
    ['rarity_score', 'num', s => (s.rarityScore == null ? 1 : s.rarityScore)],
    // Los dos `*_basis` son columnas JSON: así vuelven del viaje siendo el mismo objeto que hay en el
    // park.json, en vez de una cadena. `park_payload.php` los decodifica al otro lado.
    ['rarity_basis', 'json', s => s.rarityBasis],
    // `rarity_local` va a NULL cuando la ficha no lo tiene, y NO a 1: son las que quedaron sin tramo
    // porque su estado legal dice «pendiente de confirmar». Un 1 afirmaría una comprobación que nadie
    // hizo (Tools/catalogo-nacional/out/rareza-por-contrastar.md).
    ['rarity_local', 'num', s => s.rarityLocal],
    ['rarity_local_basis', 'json', s => s.rarityLocalBasis],
    ['is_featured', 'bool', s => s.featured],
    ['is_visible', 'bool', s => (s.visible === undefined ? true : s.visible)],
    ['hidden_reason', 'textoONull', s => s.hiddenReason],
    ['source', 'textoONull', s => s.source],
    ['taxon_phylum', 'textoONull', s => tax(s).phylum],
    ['taxon_class', 'textoONull', s => tax(s).class],
    ['taxon_order', 'textoONull', s => tax(s).order],
    ['taxon_family', 'textoONull', s => tax(s).family],
    ['taxon_genus', 'textoONull', s => tax(s).genus],
    ['iucn_global', 'textoONull', s => s.iucnGlobal],
    ['iucn_spain', 'textoONull', s => s.iucnSpain],
    ['spain_status', 'textoONull', s => s.spainStatus],
    ['regional_status', 'textoONull', s => s.regionalStatus],
    ['regional_ccaa', 'textoONull', s => s.regionalCcaa],
    ['review_note', 'textoONull', s => s.reviewNote],
    ['eidos_taxonid', 'num', s => s.eidosTaxonId],
    ['gbif_species_key', 'num', s => s.gbifSpeciesKey],
    // NULL («nadie barrió») y 0 («se barrió y no cayó ninguna») dicen cosas distintas, y la
    // auditoría de enlaces las trata distinto: a una ficha sin este dato NO le retira ningún enlace
    // por el silencio de GBIF.
    ['gbif_occurrences', 'num', s => s.gbifOccurrences],
    ['zepa_site_code', 'textoONull', s => s.zepaSiteCode],
    // `is_migratory` va a NULL —y no a FALSE— cuando la ficha no trae el campo: son las aves que
    // ningún formulario oficial nombra. Escribir FALSE afirmaría una comprobación que nadie ha
    // hecho, y la app usa justo esa diferencia para dejarlas en el catálogo general.
    ['is_migratory', 'bool', s => s.migratory],
    ['site_presence', 'json', s => s.sitePresence],
  ],
};

const POI = {
  tabla: 'points_of_interest',
  claves: [['slug']],
  columnas: [
    ['slug', 'texto', p => p.id],
    ['name', 'texto', p => p.name],
    ['type', 'textoONull', p => p.type],
    ['description', 'textoONull', p => p.description],
    ['latitude', 'num', p => p.coordinates[0]],
    ['longitude', 'num', p => p.coordinates[1]],
    // Las fotos las lleva `poi-images.js` con su propio SQL; ésta carga respeta la que el POI ya traiga.
    ['image_url', 'textoONull', p => p.image],
    ['source', 'textoONull', p => p.source],
    ['is_approx', 'boolNoNulo', p => p.approx],
  ],
};

// --- Uso ------------------------------------------------------------------------------------------

/** Valor que guarda la base en cada columna para un objeto del park.json: `{ columna: valor }`. */
function valores(def, obj, ctx = {}) {
  const fila = {};
  for (const [col, tipo, de] of def.columnas) fila[col] = TIPOS[tipo].valor(de(obj, ctx));
  return fila;
}

/** Los mismos valores como literales SQL, en el orden de `def.columnas`. */
const literales = (def, obj, ctx = {}) =>
  def.columnas.map(([, tipo, de]) => literal(tipo, TIPOS[tipo].valor(de(obj, ctx))));

const columnas = def => def.columnas.map(([c]) => c);

/** Lo que reescribe el `ON DUPLICATE KEY UPDATE`: todo menos las columnas de las claves únicas. */
const actualizables = def => columnas(def).filter(c => !def.claves.some(k => k.includes(c)));

/**
 * Lo que un recinto lleva en `geo/habitats.geojson` y no en el `park.json` —la geometría y la
 * procedencia—, como una función slug → contexto. Con dos recintos del mismo slug gana el último que
 * trae cada cosa, que es como lo leía build-park-sql.js antes de que esto viviera aquí.
 */
function contextoHabitats(geo) {
  const geometria = new Map();
  const origen = new Map();
  const props = new Map();
  for (const f of (geo && geo.features) || []) {
    const s = f.properties && f.properties.slug;
    if (!s) continue;
    if (f.geometry) geometria.set(s, f.geometry);
    if (f.properties.origen) origen.set(s, f.properties.origen);
    props.set(s, f.properties);
  }
  return slug => ({ geometria: geometria.get(slug), origen: origen.get(slug), props: props.get(slug) });
}

module.exports = { TIPOS, HABITAT, ESPECIE, POI, valores, literales, columnas, actualizables, contextoHabitats };
