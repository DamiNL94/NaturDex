#!/usr/bin/env node
'use strict';
/*
 * Inventario de los GeoJSON descargados del BDN (ENP y Red Natura 2000).
 *
 * Por qué no vale un JSON.parse: el mayor de estos ficheros pesa ~620 MB y viene en UNA sola línea.
 * Parsearlo entero reventaría el heap de Node. Este script lee por streaming y extrae solo lo que
 * hace falta: CRS, número de features y el esquema de `properties` con distribución de valores.
 *
 * Uso:
 *   node Tools/catalogo-nacional/fuentes/inspect-geojson.js
 *   node Tools/catalogo-nacional/fuentes/inspect-geojson.js --grep "Murcia"     # filtra por valor
 *   node Tools/catalogo-nacional/fuentes/inspect-geojson.js --campo ODESIGNATE  # distribución
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, 'miteco-ide');
const args = process.argv.slice(2);
const grep = args.includes('--grep') ? args[args.indexOf('--grep') + 1] : null;
const campoPedido = args.includes('--campo') ? args[args.indexOf('--campo') + 1] : null;

function listar(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listar(p, out);
    else if (/\.(geojson|json)$/i.test(e.name)) out.push(p);
  }
  return out;
}

// Recorre el texto desde `i` (que apunta a '{') y devuelve el índice tras la llave que lo cierra.
// Tiene en cuenta cadenas y escapes para no cortar por una llave dentro de un valor de texto.
function finObjeto(s, i) {
  let prof = 0, enCadena = false, escape = false;
  for (; i < s.length; i++) {
    const c = s[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { enCadena = !enCadena; continue; }
    if (enCadena) continue;
    if (c === '{') prof++;
    else if (c === '}') { prof--; if (prof === 0) return i + 1; }
  }
  return -1; // objeto incompleto: seguirá en el siguiente trozo
}

function inspeccionar(fichero) {
  return new Promise((resolve) => {
    const res = { fichero: path.relative(RAIZ, fichero), tamanoMB: +(fs.statSync(fichero).size / 1048576).toFixed(1), crs: null, features: 0, campos: {}, muestras: [], coincidencias: [] };
    let resto = '';
    let cabeceraVista = false;
    const flujo = fs.createReadStream(fichero, { encoding: 'utf8', highWaterMark: 1 << 20 });

    flujo.on('data', (trozo) => {
      let s = resto + trozo;

      if (!cabeceraVista) {
        const m = s.match(/"name"\s*:\s*"((?:EPSG|urn:ogc)[^"]*)"/);
        if (m) { res.crs = m[1]; cabeceraVista = true; }
      }

      let i = 0;
      for (;;) {
        const p = s.indexOf('"properties"', i);
        if (p === -1) break;
        const llave = s.indexOf('{', p);
        if (llave === -1) break;
        const fin = finObjeto(s, llave);
        if (fin === -1) break; // se completa en el siguiente trozo
        const bruto = s.slice(llave, fin);
        i = fin;
        let props;
        try { props = JSON.parse(bruto); } catch { continue; }
        res.features++;
        for (const [k, v] of Object.entries(props)) {
          const c = (res.campos[k] = res.campos[k] || { tipo: typeof v, valores: new Map(), vacios: 0 });
          if (v === null || v === '') { c.vacios++; continue; }
          // Solo se acumulan valores distintos si son pocos: si no, es un identificador.
          if (c.valores.size < 60) c.valores.set(String(v), (c.valores.get(String(v)) || 0) + 1);
          else if (c.valores.has(String(v))) c.valores.set(String(v), c.valores.get(String(v)) + 1);
        }
        if (res.muestras.length < 2) res.muestras.push(props);
        if (grep && JSON.stringify(props).toLowerCase().includes(grep.toLowerCase()) && res.coincidencias.length < 200) {
          res.coincidencias.push(props);
        }
      }
      // Se conserva la cola por si un objeto quedó partido entre trozos.
      resto = s.slice(Math.max(i, s.length - 100000));
    });

    flujo.on('end', () => resolve(res));
  });
}

(async () => {
  const ficheros = listar(RAIZ);
  if (!ficheros.length) {
    console.error(`No se han encontrado GeoJSON en ${RAIZ}`);
    process.exit(1);
  }

  for (const f of ficheros) {
    const r = await inspeccionar(f);
    console.log(`\n=== ${r.fichero} (${r.tamanoMB} MB) ===`);
    console.log(`  CRS      : ${r.crs || '(no declarado)'}`);
    console.log(`  features : ${r.features.toLocaleString('es-ES')}`);

    if (campoPedido && r.campos[campoPedido]) {
      const c = r.campos[campoPedido];
      console.log(`\n  distribución de "${campoPedido}":`);
      for (const [v, n] of [...c.valores.entries()].sort((a, b) => b[1] - a[1]))
        console.log(`    ${String(n).padStart(6)}  ${v}`);
      continue;
    }

    console.log('  campos:');
    for (const [k, c] of Object.entries(r.campos)) {
      const distintos = c.valores.size;
      const ejemplos = [...c.valores.keys()].slice(0, 3).map((x) => x.slice(0, 28)).join(' | ');
      const marca = distintos >= 60 ? '≥60 (identificador o continuo)' : String(distintos);
      console.log(`    ${k.padEnd(13)} ${c.tipo.padEnd(7)} distintos:${marca.padStart(6)}  vacíos:${String(c.vacios).padStart(5)}  ej: ${ejemplos}`);
    }

    if (grep) {
      console.log(`\n  coincidencias con "${grep}": ${r.coincidencias.length}${r.coincidencias.length >= 200 ? '+ (tope)' : ''}`);
      for (const p of r.coincidencias.slice(0, 40)) {
        const nombre = p.SITE_NAME || p.site_name || '(sin nombre)';
        const fig = p.ODESIGNATE || p.TIPO || '';
        const cod = p.SITE_CODE_ || p.site_code || '';
        const ha = p.Sup_ha || p.HECTAREAS;
        console.log(`    ${String(cod).padEnd(11)} ${String(fig).padEnd(24)} ${String(nombre).slice(0, 46).padEnd(46)} ${ha ? (+ha).toFixed(1) + ' ha' : ''}`);
      }
    }
  }
  console.log('');
})();
