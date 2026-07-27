#!/usr/bin/env node
/*
 * NaturDex · catalogo-nacional/reconcile-taxa
 * ------------------------------------------------------------------------------------------------
 * CAPA 3 (reconciliación taxonómica): construye la tabla MAESTRA que casa cada especie del parque
 * con su identificador estable en las dos fuentes que usa el catálogo, resolviendo sinonimias:
 *   - EIDOS (IEPNB): taxonid del nombre aceptado  (clave maestra propuesta)
 *   - GBIF: usageKey/speciesKey del nombre aceptado
 * Sin esto, las reclasificaciones (Larus→Ichthyaetus, Salvia rosmarinus→Rosmarinus, Accipiter→Astur…)
 * descuadran los conteos entre fuentes y entre parques.
 *
 * SOLO LECTURA (consulta APIs públicas; no toca BD/seed/park.json). Escribe una tabla JSON.
 *
 * Uso:  node Tools/catalogo-nacional/reconcile-taxa.js --park <slug> [--out tabla.json] [--limit N]
 * ================================================================================================
 */
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { resolvePark } = require('./lib/registry');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ARGV = process.argv.slice(2);
const flag = (n, d = null) => { const i = ARGV.indexOf(n); return i >= 0 && i + 1 < ARGV.length ? ARGV[i + 1] : d; };
const die = (m) => { console.error('✖ ' + m); process.exit(1); };
const PARK = flag('--park');
const OUT = flag('--out');
const LIMIT = flag('--limit') ? parseInt(flag('--limit'), 10) : Infinity;
const THROTTLE = 130;

function getJson(host, pathQuery, attempt = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get({ host, path: pathQuery, headers: { Accept: 'application/json', 'User-Agent': 'NaturDex-reconcile/1.0' } }, res => {
      let b = ''; res.setEncoding('utf8'); res.on('data', c => b += c);
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`HTTP ${res.statusCode} ${pathQuery}`));
        try { resolve(JSON.parse(b)); } catch (e) { reject(e); }
      });
    });
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
    req.on('error', e => attempt < 1 ? setTimeout(() => getJson(host, pathQuery, attempt + 1).then(resolve, reject), 500) : reject(e));
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = s => String(s || '').trim().toLowerCase().split(/\s+/).slice(0, 2).join(' ');

// EIDOS: resuelve taxonid del nombre aceptado (o el aceptado real si es sinónimo).
async function eidos(sci) {
  const rows = await getJson('iepnb.gob.es',
    `/api/especie/v_taxonomia?name=like.${encodeURIComponent(sci)}*&select=taxonid,nameid,acceptednameid,name,nametype`);
  if (!Array.isArray(rows) || !rows.length) return { status: 'no-encontrada' };
  const accepted = rows.filter(r => r.nametype === 'Aceptado/válido');
  const exact = accepted.find(r => norm(r.name) === norm(sci) || norm(r.name).startsWith(norm(sci) + ' '));
  if (exact) return { status: 'ok', taxonid: exact.taxonid, aceptado: exact.name };
  if (accepted.length) return { status: 'ok', taxonid: accepted[0].taxonid, aceptado: accepted[0].name };
  const syn = rows[0];
  let acc = null, taxonid = null;
  if (syn.acceptednameid && syn.acceptednameid !== syn.nameid) {
    try { const a = await getJson('iepnb.gob.es', `/api/especie/v_taxonomia?nameid=eq.${syn.acceptednameid}&select=name,taxonid`); if (a[0]) { acc = a[0].name; taxonid = a[0].taxonid; } } catch (_) {}
  }
  return { status: 'sinonimo', taxonid, aceptado: acc, sinonimo: syn.name };
}

// GBIF: match del nombre → usageKey/acceptedUsageKey.
async function gbif(sci) {
  const m = await getJson('api.gbif.org', `/v1/species/match?name=${encodeURIComponent(sci)}`);
  if (!m || m.matchType === 'NONE') return { status: 'no-encontrada' };
  const key = m.synonym && m.acceptedUsageKey ? m.acceptedUsageKey : m.usageKey;
  return { status: m.synonym ? 'sinonimo' : 'ok', speciesKey: key, aceptado: m.species || m.scientificName, matchType: m.matchType };
}

async function main() {
  const park = resolvePark(REPO_ROOT, PARK);
  const pj = JSON.parse(fs.readFileSync(park.habitatsPath.replace(/geo[\\/]habitats\.geojson$/, 'park.json'), 'utf8'));
  const species = (pj.species || []).filter(s => s.scientificName);
  const total = Math.min(species.length, LIMIT);
  console.log(`Reconciliando ${total} especies de ${park.slug} (EIDOS + GBIF)…`);

  const table = [];
  const stats = { eidosOk: 0, eidosSyn: 0, eidosNo: 0, gbifOk: 0, gbifSyn: 0, gbifNo: 0, discrepan: 0 };
  for (let i = 0; i < total; i++) {
    const s = species[i];
    let e = { status: 'error' }, g = { status: 'error' };
    try { e = await eidos(s.scientificName); } catch (_) {}
    try { g = await gbif(s.scientificName); } catch (_) {}
    if (e.status === 'ok') stats.eidosOk++; else if (e.status === 'sinonimo') stats.eidosSyn++; else stats.eidosNo++;
    if (g.status === 'ok') stats.gbifOk++; else if (g.status === 'sinonimo') stats.gbifSyn++; else stats.gbifNo++;
    const acuerdan = e.aceptado && g.aceptado && norm(e.aceptado) === norm(g.aceptado);
    if (e.aceptado && g.aceptado && !acuerdan) stats.discrepan++;
    table.push({
      id: s.id, scientificName: s.scientificName,
      eidos_taxonid: e.taxonid || null, eidos_aceptado: e.aceptado || null, eidos_estado: e.status,
      gbif_speciesKey: g.speciesKey || null, gbif_aceptado: g.aceptado || null, gbif_estado: g.status,
      reclasificada: e.status === 'sinonimo' || g.status === 'sinonimo',
      fuentes_acuerdan: !!acuerdan,
    });
    process.stdout.write(`\r  ${i + 1}/${total}`);
    if (i < total - 1) await sleep(THROTTLE);
  }
  process.stdout.write('\n');
  const outPath = OUT || path.join(__dirname, 'out', `${park.slug}-reconciliacion.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ park: park.slug, generado: 'EIDOS v_taxonomia + GBIF species/match', stats, especies: table }, null, 2));
  console.log(`\nEIDOS  → ok ${stats.eidosOk} · sinónimo ${stats.eidosSyn} · no encontrada ${stats.eidosNo}`);
  console.log(`GBIF   → ok ${stats.gbifOk} · sinónimo ${stats.gbifSyn} · no encontrada ${stats.gbifNo}`);
  console.log(`Reclasificadas (alguna fuente): ${table.filter(t => t.reclasificada).length} · discrepancias nombre aceptado: ${stats.discrepan}`);
  console.log(`Con eidos_taxonid Y gbif_speciesKey (clave maestra completa): ${table.filter(t => t.eidos_taxonid && t.gbif_speciesKey).length}/${total}`);
  console.log(`→ ${path.relative(REPO_ROOT, outPath)}`);
}
main().catch(e => die(e.stack || e.message));
