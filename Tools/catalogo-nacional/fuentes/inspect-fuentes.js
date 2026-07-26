#!/usr/bin/env node
'use strict';
/*
 * Inventario de las fuentes descargadas del IDE del MITECO.
 *
 * Recorre Tools/catalogo-nacional/fuentes/miteco-ide/ buscando shapefiles ya extraídos y, por cada
 * uno, informa de: sistema de referencia leído del .prj, número de registros, esquema de campos y
 * una muestra de valores. Sirve para saber QUÉ trae cada capa antes de escribir ningún park.json.
 *
 * Sin dependencias: reutiliza lib/dbf.js del propio repo.
 *
 * Uso:
 *   node Tools/catalogo-nacional/fuentes/inspect-fuentes.js            # todas las capas
 *   node Tools/catalogo-nacional/fuentes/inspect-fuentes.js enp        # solo las que casen con "enp"
 *   node Tools/catalogo-nacional/fuentes/inspect-fuentes.js --json     # salida JSON
 */
const fs = require('fs');
const path = require('path');
const { readDbf } = require('../lib/dbf.js');

const ROOT = path.join(__dirname, 'miteco-ide');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const filtro = args.filter((a) => !a.startsWith('--'))[0] || '';

// Tipos de geometría del formato shapefile (byte 32 de la cabecera .shp).
const SHP_TYPES = {
  0: 'Null', 1: 'Point', 3: 'PolyLine', 5: 'Polygon', 8: 'MultiPoint',
  11: 'PointZ', 13: 'PolyLineZ', 15: 'PolygonZ', 18: 'MultiPointZ',
  21: 'PointM', 23: 'PolyLineM', 25: 'PolygonM', 28: 'MultiPointM', 31: 'MultiPatch',
};

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.toLowerCase().endsWith('.shp')) out.push(p);
  }
  return out;
}

// Extrae el nombre del CRS y su código EPSG (si aparece como AUTHORITY) del .prj en WKT.
function leerPrj(shpPath) {
  const prj = shpPath.replace(/\.shp$/i, '.prj');
  if (!fs.existsSync(prj)) return { crs: null, epsg: null, aviso: 'sin .prj — el CRS habrá que deducirlo' };
  const wkt = fs.readFileSync(prj, 'latin1');
  const nombre = (wkt.match(/^\s*(?:PROJCS|GEOGCS)\s*\[\s*"([^"]+)"/i) || [])[1] || null;
  // El último AUTHORITY del WKT es el del sistema completo.
  const authorities = [...wkt.matchAll(/AUTHORITY\s*\[\s*"EPSG"\s*,\s*"(\d+)"\s*\]/gi)].map((m) => m[1]);
  const huso = (nombre && nombre.match(/(?:UTM[\s_]*zone[\s_]*|UTM)(\d{1,2})\s*N/i)) || null;
  return {
    crs: nombre,
    epsg: authorities.length ? authorities[authorities.length - 1] : null,
    husoUTM: huso ? Number(huso[1]) : null,
    proyectado: /^\s*PROJCS/i.test(wkt),
  };
}

// Cabecera .shp: tipo de geometría y bounding box en las unidades del CRS.
function leerCabeceraShp(shpPath) {
  const fd = fs.openSync(shpPath, 'r');
  const b = Buffer.alloc(100);
  fs.readSync(fd, b, 0, 100, 0);
  fs.closeSync(fd);
  return {
    tipo: SHP_TYPES[b.readInt32LE(32)] || `desconocido(${b.readInt32LE(32)})`,
    bbox: [b.readDoubleLE(36), b.readDoubleLE(44), b.readDoubleLE(52), b.readDoubleLE(60)].map((n) => Number(n.toFixed(4))),
  };
}

// Para cada campo, cuántos valores distintos y una muestra — revela qué columnas son clave.
function perfilCampos(fields, rows) {
  return fields.map((f) => {
    const vals = rows.map((r) => r[f.name]).filter((v) => v !== '' && v != null);
    const distintos = new Set(vals.map(String));
    const muestra = [...distintos].slice(0, 4);
    return {
      campo: f.name,
      tipo: f.type,
      longitud: f.len,
      vacios: rows.length - vals.length,
      distintosEnMuestra: distintos.size,
      ejemplos: muestra,
    };
  });
}

const MUESTRA = 500; // filas leídas del .dbf para perfilar (leerlo entero es innecesario y lento)

const shapefiles = walk(ROOT).filter((p) => !filtro || p.toLowerCase().includes(filtro.toLowerCase()));

if (!shapefiles.length) {
  console.error(`No se han encontrado shapefiles en ${ROOT}`);
  console.error('Descarga y extrae primero los ZIP listados en FUENTES.json.');
  process.exit(1);
}

const informe = shapefiles.map((shp) => {
  const dbf = shp.replace(/\.shp$/i, '.dbf');
  const base = { fichero: path.relative(ROOT, shp), tamanoMB: +(fs.statSync(shp).size / 1048576).toFixed(2) };
  const prj = leerPrj(shp);
  const cab = leerCabeceraShp(shp);
  if (!fs.existsSync(dbf)) return { ...base, ...prj, ...cab, error: 'falta el .dbf' };
  const { nRec, fields, rows } = readDbf(dbf, MUESTRA);
  return { ...base, ...prj, ...cab, registros: nRec, campos: perfilCampos(fields, rows) };
});

if (asJson) {
  console.log(JSON.stringify(informe, null, 2));
} else {
  for (const capa of informe) {
    console.log(`\n=== ${capa.fichero} (${capa.tamanoMB} MB) ===`);
    if (capa.error) { console.log(`  ERROR: ${capa.error}`); continue; }
    console.log(`  geometría : ${capa.tipo}   registros: ${capa.registros}`);
    console.log(`  CRS       : ${capa.crs || '?'}${capa.epsg ? ` [EPSG:${capa.epsg}]` : ''}${capa.husoUTM ? ` · huso ${capa.husoUTM}N` : ''}`);
    console.log(`  proyectado: ${capa.proyectado ? 'sí (hay que reproyectar a WGS84)' : 'no (ya en grados)'}`);
    console.log(`  bbox      : ${capa.bbox.join(', ')}`);
    console.log(`  campos (muestra de ${MUESTRA} filas):`);
    for (const c of capa.campos) {
      console.log(`    ${c.campo.padEnd(14)} ${c.tipo}${String(c.longitud).padStart(4)}  distintos:${String(c.distintosEnMuestra).padStart(4)}  vacíos:${String(c.vacios).padStart(4)}  ej: ${c.ejemplos.join(' | ').slice(0, 70)}`);
    }
  }
  console.log('');
}
