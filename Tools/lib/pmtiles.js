'use strict';
/*
 * pmtiles.js — lectura del mapa base sin conexión de un parque (.pmtiles + teselas vectoriales MVT).
 *
 * Por qué existe: cada parque ya lleva en `tiles/base.pmtiles` un recorte del basemap de Protomaps,
 * que es una "Produced Work" de OpenStreetMap bajo ODbL (ver build-park-tiles.js). Ese fichero no es
 * solo pintura: dentro van las capas `pois`, `places` y `water` con el NOMBRE y la POSICIÓN de los
 * elementos de OSM que caen en el límite del parque. Es decir, la fuente nº 4 de la cascada del
 * rollout (§4.2 de Docs/prompts/e-rollout-nacional.md) ya está descargada y versionada en el repo.
 *
 * Eso lo hace la única vía a OSM cuando Overpass no está disponible —servidor saturado, sesión sin
 * salida a Internet, trabajo de campo—, y de paso una vía REPRODUCIBLE: el basemap está congelado en
 * la fecha de su build (manifest.tiles.build), así que dos ejecuciones separadas por meses proponen
 * los mismos candidatos. Overpass, que sirve el OSM vivo, no da esa garantía.
 *
 * Qué NO es: un lector completo de pmtiles ni de MVT. Solo hace falta recorrer las teselas del zoom
 * máximo y sacar los elementos con nombre, así que aquí no hay cachés de directorios hoja, ni
 * teselas raster, ni reproyección: lo justo, en la línea de dbf.js y shapefile.js, que también son
 * lectores mínimos escritos a mano para no meter una dependencia por un formato que se usa en un
 * sitio.
 *
 * Referencias de formato: PMTiles v3 (protomaps/PMTiles) y Mapbox Vector Tile 2.1.
 */
const fs = require('fs');
const zlib = require('zlib');

const HEADER_BYTES = 127;
const COMPRESSION = { 1: 'none', 2: 'gzip', 3: 'brotli', 4: 'zstd' };

// --- varint y protobuf ------------------------------------------------------------------------
// Un lector de posición mutable: los dos formatos son secuencias de varints y hay que ir avanzando.
class Cursor {
  constructor(buf, pos = 0, end = buf.length) { this.buf = buf; this.pos = pos; this.end = end; }
  get done() { return this.pos >= this.end; }
  varint() {
    let result = 0, shift = 1;
    for (;;) {
      const b = this.buf[this.pos++];
      result += (b & 0x7f) * shift;
      if ((b & 0x80) === 0) return result;
      shift *= 128;
      // 2^53: más allá de eso un varint ya no cabe en un número de JS sin perder bits. Ningún
      // campo de los que se leen aquí (ids de tesela, offsets, tags) se acerca, pero si un fichero
      // corrupto lo hiciera es mejor romper que devolver un número silenciosamente equivocado.
      if (shift > 2 ** 53) throw new Error('varint fuera del rango seguro de JS');
    }
  }
  skip(bytes) { this.pos += bytes; }
}

// zigzag: los MVT codifican los deltas de geometría con signo de esta forma.
const unzigzag = n => (n >> 1) ^ (-(n & 1));

/** Recorre los campos de un mensaje protobuf llamando a `onField(numeroDeCampo, cursorODato)`. */
function eachField(cur, onField) {
  while (!cur.done) {
    const key = cur.varint();
    const field = key >> 3, wire = key & 0x7;
    if (wire === 2) {                       // longitud delimitada: bytes, string o submensaje
      const len = cur.varint();
      onField(field, new Cursor(cur.buf, cur.pos, cur.pos + len));
      cur.pos += len;
    } else if (wire === 0) {                // varint
      onField(field, cur.varint());
    } else if (wire === 5) {                // 32 bits
      onField(field, cur.buf.readFloatLE(cur.pos)); cur.skip(4);
    } else if (wire === 1) {                // 64 bits
      onField(field, cur.buf.readDoubleLE(cur.pos)); cur.skip(8);
    } else {
      throw new Error('tipo de campo protobuf no soportado: ' + wire);
    }
  }
}

// --- PMTiles ------------------------------------------------------------------------------------
function readHeader(buf) {
  if (buf.toString('ascii', 0, 7) !== 'PMTiles') throw new Error('no es un fichero PMTiles');
  if (buf[7] !== 3) throw new Error('solo se lee PMTiles v3 (este es v' + buf[7] + ')');
  const u64 = off => Number(buf.readBigUInt64LE(off));
  return {
    rootDirOffset: u64(8), rootDirBytes: u64(16),
    leafDirsOffset: u64(40), leafDirsBytes: u64(48),
    tileDataOffset: u64(56),
    internalCompression: COMPRESSION[buf[97]], tileCompression: COMPRESSION[buf[98]],
    minZoom: buf[100], maxZoom: buf[101],
    minLon: buf.readInt32LE(102) / 1e7, minLat: buf.readInt32LE(106) / 1e7,
    maxLon: buf.readInt32LE(110) / 1e7, maxLat: buf.readInt32LE(114) / 1e7,
  };
}

function decompress(buf, how) {
  if (how === 'none') return buf;
  if (how === 'gzip') return zlib.gunzipSync(buf);
  if (how === 'brotli') return zlib.brotliDecompressSync(buf);
  throw new Error('compresión no soportada en este lector: ' + how);
}

/**
 * Un directorio pmtiles: cuatro columnas paralelas (id de tesela, longitud de racha, tamaño y
 * offset), cada una entera antes de la siguiente. Los ids van en delta y los offsets a 0 significan
 * "pegado al final de la entrada anterior", que es como el formato aprovecha las teselas contiguas.
 */
function readDirectory(buf) {
  const cur = new Cursor(buf);
  const n = cur.varint();
  const entries = new Array(n);
  let id = 0;
  for (let i = 0; i < n; i++) { id += cur.varint(); entries[i] = { tileId: id, runLength: 0, length: 0, offset: 0 }; }
  for (let i = 0; i < n; i++) entries[i].runLength = cur.varint();
  for (let i = 0; i < n; i++) entries[i].length = cur.varint();
  for (let i = 0; i < n; i++) {
    const v = cur.varint();
    entries[i].offset = v === 0 ? entries[i - 1].offset + entries[i - 1].length : v - 1;
  }
  return entries;
}

/**
 * z/x/y → id de tesela. El orden de pmtiles es la curva de Hilbert, no la fila-columna: teselas
 * vecinas en el mapa quedan vecinas en el fichero, que es lo que permite servirlo por rangos HTTP.
 */
function zxyToTileId(z, x, y) {
  let acc = 0;
  for (let t = 0; t < z; t++) acc += (1 << t) * (1 << t);
  let rx, ry, d = 0, tx = x, ty = y;
  for (let s = (1 << z) / 2; s >= 1; s /= 2) {
    rx = (tx & s) > 0 ? 1 : 0;
    ry = (ty & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) { tx = s - 1 - tx; ty = s - 1 - ty; }
      const swap = tx; tx = ty; ty = swap;
    }
  }
  return acc + d;
}

function findEntry(entries, tileId) {
  let lo = 0, hi = entries.length - 1, found = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (entries[mid].tileId <= tileId) { found = entries[mid]; lo = mid + 1; } else hi = mid - 1;
  }
  return found;
}

// --- MVT ----------------------------------------------------------------------------------------
function readValue(cur) {
  let value = null;
  eachField(cur, (field, data) => {
    if (field === 1) value = data.buf.toString('utf8', data.pos, data.end);
    else if (field === 4 || field === 5) value = data;
    else if (field === 6) value = unzigzag(data);
    else if (field === 7) value = data === 1;
    else if (field === 2 || field === 3) value = data;
  });
  return value;
}

/** Todos los vértices de una geometría MVT, en coordenadas de tesela (sin escalar). */
function readGeometry(cur) {
  const pts = [];
  let x = 0, y = 0;
  while (!cur.done) {
    const cmd = cur.varint();
    const id = cmd & 0x7, count = cmd >> 3;
    if (id === 7) continue;                             // ClosePath no lleva parámetros
    for (let i = 0; i < count; i++) {
      x += unzigzag(cur.varint());
      y += unzigzag(cur.varint());
      pts.push([x, y]);
    }
  }
  return pts;
}

function readLayer(cur) {
  const layer = { name: '', extent: 4096, keys: [], values: [], features: [] };
  const rawFeatures = [];
  eachField(cur, (field, data) => {
    if (field === 1) layer.name = data.buf.toString('utf8', data.pos, data.end);
    else if (field === 2) rawFeatures.push(data);
    else if (field === 3) layer.keys.push(data.buf.toString('utf8', data.pos, data.end));
    else if (field === 4) layer.values.push(readValue(data));
    else if (field === 5) layer.extent = data;
  });
  for (const raw of rawFeatures) {
    const feat = { type: 0, properties: {}, points: [] };
    let tags = null;
    eachField(raw, (field, data) => {
      if (field === 2) { tags = []; while (!data.done) tags.push(data.varint()); }
      else if (field === 3) feat.type = data;            // 1 punto, 2 línea, 3 polígono
      else if (field === 4) feat.points = readGeometry(data);
    });
    if (tags) for (let i = 0; i + 1 < tags.length; i += 2) feat.properties[layer.keys[tags[i]]] = layer.values[tags[i + 1]];
    layer.features.push(feat);
  }
  return layer;
}

function decodeTile(buf) {
  const layers = {};
  eachField(new Cursor(buf), (field, data) => {
    if (field !== 3) return;
    const layer = readLayer(data);
    layers[layer.name] = layer;
  });
  return layers;
}

// --- Proyección -----------------------------------------------------------------------------------
const lonToX = (lon, z) => Math.floor((lon + 180) / 360 * 2 ** z);
const latToY = (lat, z) => Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** z);

function tileToLonLat(z, tx, ty, px, py, extent) {
  const n = 2 ** z;
  const lon = (tx + px / extent) / n * 360 - 180;
  const merc = Math.PI * (1 - 2 * (ty + py / extent) / n);
  const lat = Math.atan(Math.sinh(merc)) * 180 / Math.PI;
  return [lon, lat];
}

// --- API ------------------------------------------------------------------------------------------
/**
 * Todos los elementos CON NOMBRE del basemap de un parque, ya en lon/lat.
 *
 * Se recorre solo el zoom máximo: es donde el basemap lleva el detalle completo, y en los zooms
 * bajos los mismos elementos vuelven a aparecer generalizados y desplazados. De cada elemento se
 * devuelve el centro de sus vértices; para los puntos —que es lo que interesa aquí— eso es el nodo
 * de OSM tal cual, con la precisión de la rejilla de la tesela (a z15, unos 30 cm).
 *
 * Ojo a lo que el basemap NO trae, porque marca el límite de esta fuente: los elementos que
 * Protomaps filtra por `min_zoom` o por tipo no están (no hay `historic=*` genérico, ni las etiquetas
 * completas de OSM), la geometría viene simplificada, y el recorte es el del build del parque. Un
 * "no aparece aquí" no es un "no existe en OSM": es un "no llega hasta aquí".
 */
function namedFeatures(file, { layers = null } = {}) {
  const buf = fs.readFileSync(file);
  const header = readHeader(buf);
  const root = readDirectory(decompress(buf.subarray(header.rootDirOffset, header.rootDirOffset + header.rootDirBytes), header.internalCompression));

  const z = header.maxZoom;
  const out = [];
  const seen = new Set();
  for (let tx = lonToX(header.minLon, z); tx <= lonToX(header.maxLon, z); tx++) {
    for (let ty = latToY(header.maxLat, z); ty <= latToY(header.minLat, z); ty++) {
      const tileId = zxyToTileId(z, tx, ty);
      let entry = findEntry(root, tileId);
      if (entry && entry.runLength === 0) {   // apunta a un directorio hoja, no a una tesela
        const leaf = readDirectory(decompress(buf.subarray(header.leafDirsOffset + entry.offset, header.leafDirsOffset + entry.offset + entry.length), header.internalCompression));
        entry = findEntry(leaf, tileId);
      }
      if (!entry || entry.runLength === 0 || tileId >= entry.tileId + entry.runLength) continue;

      const start = header.tileDataOffset + entry.offset;
      const tile = decodeTile(decompress(buf.subarray(start, start + entry.length), header.tileCompression));
      for (const [name, layer] of Object.entries(tile)) {
        if (layers && !layers.includes(name)) continue;
        for (const feat of layer.features) {
          const label = feat.properties.name;
          if (!label || !feat.points.length) continue;
          const px = feat.points.reduce((s, p) => s + p[0], 0) / feat.points.length;
          const py = feat.points.reduce((s, p) => s + p[1], 0) / feat.points.length;
          const [lon, lat] = tileToLonLat(z, tx, ty, px, py, layer.extent);
          // Un elemento que cruza el borde de la tesela sale troceado y aparece una vez por tesela.
          // Se queda la primera copia: para un punto solo hay una, y para una línea o un polígono
          // este lector solo promete un punto representativo.
          const key = name + '|' + label + '|' + (feat.properties.kind || '');
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({
            layer: name, name: label, kind: feat.properties.kind || null,
            kindDetail: feat.properties.kind_detail || null,
            geometry: ['?', 'punto', 'línea', 'polígono'][feat.type] || '?',
            lon, lat,
          });
        }
      }
    }
  }
  return { header, features: out };
}

module.exports = { namedFeatures, readHeader };
