#!/usr/bin/env node
/*
 * NaturDex · eidos-diff
 * ------------------------------------------------------------------------------------------------
 * Informe de diferencias (SOLO LECTURA): compara el estado de conservación y legal que hoy tiene
 * cada especie en la BD contra la fuente oficial EIDOS del IEPNB (https://iepnb.gob.es/), vía su
 * API REST pública (PostgREST, sin autenticación). NO escribe nada: ni en la BD, ni en el seed, ni
 * en EIDOS. Su único objetivo es enseñar, antes de decidir migrar, cuántas especies casan con
 * EIDOS y en qué difieren los datos de conservación (UICN por ámbito) y legales (CEEA/LESRPE/CCAA).
 *
 * Qué hace:
 *   1) Lee las especies de la BD VIVA del contenedor Docker (scientific_name + los 3 campos de
 *      estado que hoy son texto libre: iucn_global, spain_status, murcia_status).
 *   2) Por cada especie consulta EIDOS: v_taxonomia (para resolver el idtaxon del nombre aceptado),
 *      v_estadoconservacion (UICN por ámbito y año) y v_estadolegal (normas por ámbito/CCAA).
 *   3) Deriva el valor "vigente y más reciente" de cada eje y lo contrasta con lo que hay en la BD.
 *   4) Imprime un informe por especie + un resumen de cobertura. Con --out escribe además un .md.
 *
 * Ejecuta el cliente mysql DENTRO del contenedor a través de Tools/lib/db.js (no necesita el puerto
 * de MySQL publicado ni la contraseña en el host). Solo hace SELECT.
 *
 * Uso:   node Tools/eidos-diff.js [--limit N] [--out informe.md] [--only-diffs] [--ccaa "Andalucía"]
 *        (Requiere Docker con el contenedor de la BD levantado: docker compose up -d db)
 *        `--ccaa` elige el catálogo autonómico contra el que se contrasta el estado legal
 *        (por defecto Murcia, la comunidad del piloto).
 * ================================================================================================
 */
'use strict';

const { ROOT } = require('./lib/io');
const { arg, num, flag, die, sleep } = require('./lib/cli');
const db = require('./lib/db');
const eidos = require('./lib/eidos');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = ROOT;

// --- Opciones -----------------------------------------------------------------------------------

const LIMIT = num('limit', Infinity);
const OUT_FILE = arg('out');
const ONLY_DIFFS = flag('only-diffs');
// Comunidad autónoma cuyo catálogo regional de especies amenazadas se contrasta. Era 'murcia' fijo,
// atado al parque piloto: con el rollout nacional cada espacio tiene la norma de SU comunidad.
const CCAA = arg('ccaa', 'Murcia');

// Códigos UICN reconocidos, para extraerlos tanto del texto libre de la BD como de EIDOS.
const IUCN_CODES = ['CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE', 'RE', 'EW', 'EX'];

// --- Especies de la BD viva ---------------------------------------------------------------------

// Se agrega con JSON_ARRAYAGG en el propio MySQL (Tools/lib/db.js): el texto libre del catálogo
// lleva tabuladores y saltos de línea, así que un volcado por columnas se parte solo.
function loadSpecies() {
  const rows = db.queryJson(
    "'sci', scientific_name, 'common', common_name, 'kingdom', kingdom, " +
    "'iucn', iucn_global, 'spain', spain_status, 'murcia', murcia_status",
    'FROM species ORDER BY kingdom, scientific_name',
  );
  // Dedup por nombre científico (una especie puede estar en varios parques).
  const seen = new Set();
  return rows.filter(r => {
    const k = (r.sci || '').trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// --- Cliente EIDOS (Tools/lib/eidos.js) ---------------------------------------------------------
// La resolución del taxón, el estado de conservación por ámbito y el estado legal viven en el
// cliente compartido: son exactamente las mismas consultas que necesita reconcile-taxa.js, y
// tenerlas duplicadas fue el origen de que cada script emparejara los nombres con un criterio
// distinto (uno truncaba a dos palabras y perdía las subespecies).

const resolveTaxon = (sci) => eidos.resolveTaxon(sci);
const conservationByScope = (idtaxon) => eidos.conservationByScope(idtaxon);
const legalStatus = async (idtaxon) => {
  const { nacional, autonomico } = await eidos.legalStatus(idtaxon, CCAA);
  return { nacional, murcia: autonomico };
};

// --- Comparación --------------------------------------------------------------------------------

function iucnCodeIn(text) {
  if (!text) return null;
  const m = String(text).match(new RegExp(`\\b(${IUCN_CODES.join('|')})\\b`));
  return m ? m[1] : null;
}
function iucnCodeOf(cat) {
  if (!cat) return null;
  const m = String(cat).match(/^([A-Z]{2})\b/);
  return m ? m[1] : null;
}
function scopeCode(byScope, scope) {
  const r = byScope[scope];
  return r ? { code: iucnCodeOf(r.categoriaconservacion), anio: r.anio } : null;
}

// --- Programa principal -------------------------------------------------------------------------

async function main() {
  const species = loadSpecies();
  if (species.length === 0) die('No hay especies en la BD.');
  const total = Math.min(species.length, LIMIT);
  console.log(`Comparando ${total} especie(s) contra EIDOS (${eidos.HOST}) · catálogo autonómico: ${CCAA}…\n`);

  const report = [];
  const stats = { encontradas: 0, noEncontradas: 0, sinonimos: 0, sinConservacion: 0, uicnMundialDiff: 0 };

  for (let i = 0; i < total; i++) {
    const sp = species[i];
    const line = { sp };
    try {
      const res = await resolveTaxon(sp.sci);
      if (res.status === 'no-encontrada') { stats.noEncontradas++; line.estado = 'NO ENCONTRADA en EIDOS'; report.push(line); continue; }
      if (res.status === 'sinonimo') {
        stats.sinonimos++;
        line.estado = res.acceptedName
          ? `RECLASIFICADA — nombre aceptado en EIDOS: "${res.acceptedName}"`
          : `SINÓNIMO en EIDOS (sin nombre aceptado resoluble)`;
        report.push(line);
        continue;
      }
      stats.encontradas++;
      const t = res.taxon;
      line.taxon = t;

      const [cons, legal] = await Promise.all([conservationByScope(t.taxonid), legalStatus(t.taxonid)]);
      const mundial = scopeCode(cons, 'Mundial');
      const espana = scopeCode(cons, 'España');
      const peninsula = scopeCode(cons, 'Península');
      if (!mundial && !espana && !peninsula) stats.sinConservacion++;

      const seedMundial = iucnCodeIn(sp.iucn);
      line.mundialDiff = mundial && seedMundial && mundial.code !== seedMundial;
      if (line.mundialDiff) stats.uicnMundialDiff++;

      line.eidos = { mundial, espana, peninsula, murcia: legal.murcia, nacional: legal.nacional };
      report.push(line);
    } catch (e) {
      line.estado = 'ERROR: ' + e.message;
      report.push(line);
    }
    if (i < total - 1) await sleep(eidos.THROTTLE_MS);
    process.stdout.write(`\r  ${i + 1}/${total}`);
  }
  process.stdout.write('\n\n');

  const md = renderReport(report, stats, total);
  console.log(md);
  if (OUT_FILE) {
    fs.writeFileSync(path.resolve(OUT_FILE), md);
    console.log(`\nInforme escrito en ${path.resolve(OUT_FILE)}`);
  }
}

function fmtScope(s) { return s ? `${s.code} (${s.anio})` : '—'; }

function renderReport(report, stats, total) {
  const L = [];
  L.push('# Informe EIDOS ↔ NaturDex (solo lectura)\n');
  L.push(`Fuente: EIDOS (IEPNB, MITECO) · API REST \`https://${eidos.HOST}${eidos.BASE_ESPECIE}\`\n`);
  L.push('## Resumen de cobertura\n');
  L.push(`- Especies comparadas: **${total}**`);
  L.push(`- Encontradas en EIDOS (nombre aceptado): **${stats.encontradas}**`);
  L.push(`- Solo como sinónimo (posible reclasificación): **${stats.sinonimos}**`);
  L.push(`- No encontradas: **${stats.noEncontradas}**`);
  L.push(`- Sin datos de conservación UICN en EIDOS: **${stats.sinConservacion}**`);
  L.push(`- Discrepancias UICN Mundial (BD vs EIDOS): **${stats.uicnMundialDiff}**\n`);

  L.push('## Detalle por especie\n');
  L.push(`| Especie | Estado | UICN Mundial (BD→EIDOS) | UICN España | UICN Península | Legal ${CCAA} (EIDOS) |`);
  L.push('|---|---|---|---|---|---|');
  for (const r of report) {
    if (ONLY_DIFFS && !r.estado && !r.mundialDiff) continue;
    const name = `${r.sp.sci}${r.sp.common ? ` <br><small>${r.sp.common}</small>` : ''}`;
    if (r.estado) { L.push(`| ${name} | ${r.estado} | | | | |`); continue; }
    const e = r.eidos;
    const seedM = iucnCodeIn(r.sp.iucn) || '?';
    const mundial = `${seedM} → ${fmtScope(e.mundial)}${r.mundialDiff ? ' ⚠️' : ''}`;
    const murcia = e.murcia.length ? e.murcia.map(m => m.estadolegal).join('; ') : '—';
    L.push(`| ${name} | ok | ${mundial} | ${fmtScope(e.espana)} | ${fmtScope(e.peninsula)} | ${murcia} |`);
  }
  L.push('\n> Nota: "BD→EIDOS" compara solo el código UICN; los campos `spain_status`/`murcia_status`');
  L.push('> de la BD son texto libre y deben revisarse a mano frente a las columnas de EIDOS.');
  return L.join('\n');
}

main().catch(e => die(e.stack || e.message, 1));
