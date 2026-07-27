#!/usr/bin/env node
/*
 * NaturDex · catalogo-nacional/merge-habitats
 * ------------------------------------------------------------------------------------------------
 * Fusiona la capa OFICIAL de hábitats (salida de build-habitats.js) con la capa CURADA del parque
 * (Frontend/.../geo/habitats.geojson), sin perder trabajo previo:
 *
 *   · ENRIQUECE los hábitats curados que casan con el oficial (por familia HIC):
 *       + hic_subtipos   (los códigos exactos del dato oficial, p. ej. 5334 bajo 5330)
 *       + fitosociologia (las asociaciones oficiales del recinto: el sintaxón)
 *       + priority       (desde data/hic-prioritarios.json — Anexo I, NO el flag 1997)
 *   · MANTIENE los hábitats curados que el oficial no cubre (p. ej. añadidos desde la CCAA).
 *   · AÑADE los HIC oficiales que faltan en la capa curada (geometría oficial disuelta).
 *
 * SOLO LECTURA sobre el repo: NO sobrescribe el habitats.geojson curado; escribe su propia salida
 * para que la revises antes de adoptarla.
 *
 * Uso:
 *   node Tools/catalogo-nacional/merge-habitats.js --park <slug> --official <ruta-oficial.geojson> \
 *        [--reconcile 8230:8210] [--out <salida.geojson>]
 *
 *   --reconcile  Reasigna códigos HIC de codificación antigua a su equivalente actual, ANTES de
 *                comparar. Es específico de cada región/versión del dato: NO se aplica por defecto.
 *                Caso real (Murcia 1997): el HIC 8230 con asociación "Hypericion ericoidis" es
 *                roquedo casmofítico CALCÍCOLA (hoy 8210), no silíceo → `--reconcile 8230:8210`.
 *                Comprueba siempre la asociación antes de reconciliar.
 * ================================================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');
const pc = require('polygon-clipping');
const { areaHectares } = require('./lib/geo');
const { resolvePark, readBoundaryRing } = require('./lib/registry');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PRIORITARIOS = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'hic-prioritarios.json'), 'utf8'));
const NOMBRES = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'hic-nombres.json'), 'utf8'));

const ARGV = process.argv.slice(2);
const flag = (n, d = null) => { const i = ARGV.indexOf(n); return i >= 0 && i + 1 < ARGV.length ? ARGV[i + 1] : d; };
const die = (m) => { console.error('✖ ' + m); process.exit(1); };

if (ARGV.includes('--help')) { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(0); }
const PARK = flag('--park');
const OFFICIAL = flag('--official');
const OUT = flag('--out');
const RECONCILE = parseReconcile(flag('--reconcile'));

if (!OFFICIAL) die('Falta --official <ruta al geojson de build-habitats.js>');
if (!fs.existsSync(OFFICIAL)) die(`No existe: ${OFFICIAL}`);

const PRIORITY = new Set(PRIORITARIOS.codigos);
const isPriority = (code) => PRIORITY.has(String(code || ''));
// Familia HIC: los códigos de 4 dígitos se agrupan por sus 3 primeros (5330 y 5334 son la misma
// familia: el dato español subdivide el código europeo). Los alfanuméricos (92D0) van tal cual.
const familia = (h) => { const c = RECONCILE[h] || h; return /^\d{4}$/.test(c) ? c.slice(0, 3) : c; };

function parseReconcile(s) {
  const map = {};
  if (!s) return map;
  for (const pair of s.split(',')) {
    const [from, to] = pair.split(':').map(x => (x || '').trim());
    if (!from || !to) die(`--reconcile mal formado: "${pair}" (esperado viejo:nuevo, p. ej. 8230:8210)`);
    map[from] = to;
  }
  return map;
}

function main() {
  const park = resolvePark(REPO_ROOT, PARK);
  // La capa curada es OPCIONAL. Un parque que asciende de N1 a N2 todavía no tiene ninguna: es esta
  // ejecución la que se la crea. Sin esto ningún espacio nuevo del rollout nacional podía fusionarse
  // (fallaba con ENOENT), y todos los del rollout empiezan igual: sin capa curada.
  const hayCurada = fs.existsSync(park.habitatsPath);
  const cur = hayCurada
    ? JSON.parse(fs.readFileSync(park.habitatsPath, 'utf8'))
    : { type: 'FeatureCollection', features: [] };
  const off = JSON.parse(fs.readFileSync(OFFICIAL, 'utf8'));
  const latRef = readBoundaryRing(park.boundaryPath).reduce((s, p, _, a) => s + p[1] / a.length, 0);
  console.log(`Parque: ${park.name} (${park.slug}) · curada: ${hayCurada ? cur.features.length + ' hábitats' : 'NO EXISTE (se crea entera desde la oficial)'} · oficial: ${off.features.length} recintos`);
  if (Object.keys(RECONCILE).length) console.log(`Reconciliación aplicada: ${Object.entries(RECONCILE).map(([a, b]) => `${a}→${b}`).join(', ')}`);

  // Índice del oficial por familia HIC.
  const idx = new Map(); // familia -> {codes:Set, concepts:Set, geoms:[]}
  for (const f of off.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const h of f.properties.habitats) {
      if (!h.hic) continue;
      const k = familia(h.hic);
      if (!idx.has(k)) idx.set(k, { codes: new Set(), concepts: new Set(), geoms: [] });
      const e = idx.get(k);
      e.codes.add(h.hic);
      if (h.concepto) e.concepts.add(h.concepto);
      for (const poly of polys) e.geoms.push(poly);
    }
  }

  // 1) Enriquecer / mantener los curados.
  let enriched = 0, kept = 0;
  const usadas = new Set();
  const features = cur.features.map(f => {
    const p = { ...f.properties };
    const k = familia(String(p.code || ''));
    p.priority = isPriority(p.code); // siempre desde el Anexo I
    if (idx.has(k)) {
      const e = idx.get(k); enriched++; usadas.add(k);
      p.hic_subtipos = [...e.codes].sort();
      p.fitosociologia = [...e.concepts].sort();
      p.fuentes = [p.source, 'MITECO/BDN Directiva Hábitat 1997 (HIC, asociación fitosociológica)'].filter(Boolean);
    } else {
      kept++;
      p.solo_curada = true; // sin equivalente en el dato oficial (típicamente aportado por la CCAA)
    }
    return { type: 'Feature', properties: p, geometry: f.geometry };
  });

  // 2) Añadir los HIC oficiales ausentes de la capa curada (geometría oficial disuelta).
  let added = 0;
  for (const [k, e] of idx) {
    if (usadas.has(k)) continue;
    const code = [...e.codes].sort()[0];
    const meta = (NOMBRES.codigos || {})[code] || { name: `HIC ${code}`, type: 'Hábitat' };
    const geometry = unionGeoms(e.geoms);
    if (!geometry) continue;
    added++;
    features.push({
      type: 'Feature',
      properties: {
        slug: slugify(meta.name, code),
        code, name: meta.name, type: meta.type,
        priority: isPriority(code),
        hectares: areaHectares(geometry, latRef),
        hic_subtipos: [...e.codes].sort(),
        fitosociologia: [...e.concepts].sort(),
        origen: 'anadido_desde_oficial',
        source: 'MITECO/BDN — Cartografía Hábitat Directiva 92/43/CEE (1997); recintos disueltos y recortados al parque, ETRS89 UTM→WGS84',
      },
      geometry,
    });
  }

  const outPath = OUT || path.join(__dirname, 'out', `${park.slug}-merged.geojson`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ type: 'FeatureCollection', features }));

  // --- Resumen / validación ---
  let malFormados = 0;
  for (const f of features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) for (const r of poly)
      if (r.length < 4 || r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1]) malFormados++;
  }
  console.log(`\nResultado: ${features.length} hábitats · enriquecidos ${enriched} · solo-curada ${kept} · añadidos ${added}`);
  console.log(`Validación · anillos mal cerrados: ${malFormados} ${malFormados === 0 ? '✔' : '✖'}`);
  console.log(`Prioritarios (Anexo I): ${features.filter(f => f.properties.priority).map(f => f.properties.code).join(', ') || '—'}`);
  console.log(`Con fitosociología oficial: ${features.filter(f => (f.properties.fitosociologia || []).length).length}/${features.length}`);
  console.log('\n' + features.map(f => {
    const p = f.properties;
    const estado = p.origen ? 'AÑADIDO   ' : (p.solo_curada ? 'curada    ' : 'enriquecido');
    return ` ${p.priority ? '★' : ' '} ${String(p.code || '').padEnd(5)} ${estado} ${String(p.name || '').slice(0, 44)}`;
  }).join('\n'));
  console.log(`\n→ ${path.relative(REPO_ROOT, outPath)}`);
}

// Une (disuelve) una lista de Polygon-coords en una sola geometría.
function unionGeoms(geoms) {
  if (!geoms.length) return null;
  let acc = [geoms[0]];
  for (let i = 1; i < geoms.length; i++) {
    try { acc = pc.union(acc, [geoms[i]]); } catch (_) { /* recinto degenerado: se ignora */ }
  }
  if (!acc.length) return null;
  return acc.length === 1 ? { type: 'Polygon', coordinates: acc[0] } : { type: 'MultiPolygon', coordinates: acc };
}

function slugify(name, code) {
  const s = String(name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 3).join('-');
  return s ? `${s}-${code}` : `hic-${code}`;
}

try { main(); } catch (e) { die(e.stack || e.message); }
