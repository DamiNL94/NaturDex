#!/usr/bin/env node
// ================================================================================================
// enrich-images.js — rellena la FOTO de las especies de un parque desde fuentes oficiales/abiertas.
// ------------------------------------------------------------------------------------------------
// Estrategia "fehaciente" (foto del taxón correcto, con licencia + autor):
//   1) EIDOS (IEPNB): intenta la vista multimedia de Plinian Core por idtaxon. EIDOS rara vez trae
//      foto propia, pero cuando la trae es la fuente oficial. Descubre el nombre de la vista desde el
//      OpenAPI de PostgREST (busca 'multimedia'/'recurso'/'media' en /api/especie/), así no depende
//      de un nombre exacto.
//   2) GBIF (fallback, la vía que ya usan las invasoras): occurrence/search con mediaType=StillImage.
//      Prioriza ocurrencias de España (country=ES) y elige la mejor licencia disponible.
//
// Preferencia de licencia (de mejor a peor): CC0 > CC-BY > CC-BY-SA > CC-BY-NC. Por defecto NO usa
// CC-BY-NC salvo que se pase --allow-nc (y siempre la marca). Nunca usa "todos los derechos
// reservados".
//
// SOLO LECTURA de red: NO toca la BD. Genera un .sql con UPDATEs (por scientific_name) y un informe.
// Los UPDATE se pensaron para correr DESPUÉS del INSERT de species (igual que el bloque de fotos del
// seed). Revisa el .sql y pégalo en Database/seed.sql o ejecútalo contra la BD.
//
// Uso:
//   node Tools/catalogo-nacional/enrich-images.js \
//     --park Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json \
//     --slug cabo-cope-puntas-calnegre \
//     --out Tools/catalogo-nacional/out/fotos-especies.sql \
//     --report Tools/catalogo-nacional/out/fotos-especies.md \
//     [--mode missing|all]  [--allow-nc]  [--write-park]  [--country ES]  [--concurrency 6]
//
//   --mode missing (por defecto): solo especies sin foto o con foto local inexistente.
//   --mode all: intenta también sustituir/mejorar las que ya tienen URL (útil para subir la calidad
//               o cambiar candidatas de confianza media/baja por foto oficial de España).
//   --allow-nc: acepta también fotos CC-BY-NC (la mayoría de iNaturalist lo son). Para este catálogo
//               casi siempre hará falta, o la cobertura será mínima.
//   --write-park: además del .sql, escribe image+imageAttribution en el propio park.json (necesario
//               para especies que aún no existen en la BD: el catálogo puede ampliarse solo en park.json).
// ================================================================================================
'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

function arg(n, d) { const i = process.argv.indexOf('--' + n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; }
function flag(n) { return process.argv.indexOf('--' + n) >= 0; }

const PARK = arg('park');
const SLUG = arg('slug');
const OUT = arg('out', 'Tools/catalogo-nacional/out/fotos-especies.sql');
const REPORT = arg('report', 'Tools/catalogo-nacional/out/fotos-especies.md');
const MODE = arg('mode', 'missing');
const ALLOW_NC = flag('allow-nc');
const WRITE_PARK = flag('write-park'); // escribe image+imageAttribution en el propio park.json
// Nota: la mayoría de fotos de iNaturalist/GBIF son CC-BY-NC. Sin --allow-nc, muchas especies del
// SE ibérico se quedarán sin foto. Para este catálogo suele quererse --allow-nc.
const COUNTRY = arg('country', 'ES');
const CONC = parseInt(arg('concurrency', '6'), 10);
if (!PARK || !SLUG) { process.stderr.write('Uso: --park <park.json> --slug <park-slug> [--out f.sql] [--report f.md] [--mode missing|all] [--allow-nc] [--country ES]\n'); process.exit(1); }

// --- HTTP JSON con reintentos y timeout (mismo patrón que invasoras-eei.js) ----------------------
function get(host, pathq, tries = 0) {
  return new Promise((res, rej) => {
    https.get({ host, path: pathq, headers: { Accept: 'application/json', 'User-Agent': 'naturdex-enrich-images/1' } }, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(new Error(`${host}${pathq.slice(0, 60)}: ${b.slice(0, 120)}`)); } });
    }).on('error', e => tries < 2 ? setTimeout(() => get(host, pathq, tries + 1).then(res, rej), 600) : rej(e)).setTimeout(40000, function () { this.destroy(new Error('timeout')); });
  });
}
async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const idx = i++; try { out[idx] = await fn(items[idx], idx); } catch (e) { out[idx] = { error: String(e.message || e) }; } } }));
  return out;
}

// --- Licencias: normalización, ranking y etiqueta corta -----------------------------------------
function licenseInfo(raw) {
  const s = String(raw || '').toLowerCase();
  if (/cc0|zero|publicdomain|public domain/.test(s)) return { rank: 0, short: 'CC0', nc: false };
  if (/by-sa/.test(s)) return { rank: 2, short: 'CC BY-SA 4.0', nc: false };
  if (/by-nc-sa/.test(s)) return { rank: 4, short: 'CC BY-NC-SA 4.0', nc: true };
  if (/by-nc/.test(s)) return { rank: 3, short: 'CC BY-NC 4.0', nc: true };
  if (/by\b|\/by\//.test(s)) return { rank: 1, short: 'CC BY 4.0', nc: false };
  return { rank: 9, short: null, nc: true }; // desconocida / todos los derechos → descartar
}

// --- EIDOS: descubre la vista multimedia y busca foto por idtaxon --------------------------------
let EIDOS_MEDIA_VIEW = null; // cache del nombre de vista descubierto (o false si no hay)
async function eidosMediaView() {
  if (EIDOS_MEDIA_VIEW !== null) return EIDOS_MEDIA_VIEW;
  try {
    const root = await get('iepnb.gob.es', '/api/especie/');
    const paths = Object.keys(root.paths || {});
    const hit = paths.map(p => p.replace(/^\//, '')).find(p => /multimedia|recurso|media|imagen|foto/i.test(p));
    EIDOS_MEDIA_VIEW = hit || false;
  } catch (_) { EIDOS_MEDIA_VIEW = false; }
  if (EIDOS_MEDIA_VIEW) process.stderr.write(`EIDOS: vista multimedia = ${EIDOS_MEDIA_VIEW}\n`);
  else process.stderr.write('EIDOS: sin vista multimedia detectada (se usará solo GBIF)\n');
  return EIDOS_MEDIA_VIEW;
}
async function fromEidos(idtaxon) {
  if (!idtaxon) return null;
  const view = await eidosMediaView();
  if (!view) return null;
  // PostgREST: filtra por idtaxon y pide filas; los nombres de columna varían entre vistas, así que
  // inspeccionamos cada fila buscando una URL de imagen y una atribución/licencia.
  let rows;
  try { rows = await get('iepnb.gob.es', `/api/especie/${view}?idtaxon=eq.${encodeURIComponent(idtaxon)}&limit=20`); }
  catch (_) { return null; }
  // PostgREST devuelve un objeto de error (no un array) si la vista descubierta no tiene columna
  // "idtaxon" (p.ej. v_imagenes la llama "id_taxon"): sin esta guarda, `for...of` sobre ese objeto
  // lanza "no es iterable" y pool() lo traga como {error}, sin sp asociado — así que la ejecución
  // completa se queda en 0 rellenadas / 0 "sin foto" sin ningún aviso visible en el informe.
  if (!Array.isArray(rows)) return null;
  for (const r of rows) {
    const url = Object.values(r).find(v => typeof v === 'string' && /^https?:\/\/\S+\.(jpe?g|png|webp)(\?|$)/i.test(v));
    if (!url) continue;
    const licRaw = Object.entries(r).find(([k]) => /licen/i.test(k));
    const authRaw = Object.entries(r).find(([k]) => /autor|author|creator|rights|atribu/i.test(k));
    const li = licenseInfo(licRaw ? licRaw[1] : '');
    if (li.rank === 9) continue;                 // licencia desconocida → no arriesgar
    if (li.nc && !ALLOW_NC) continue;
    return { url, license: li, creator: authRaw ? String(authRaw[1]) : null, source: 'EIDOS (IEPNB)', country: 'ES' };
  }
  return null;
}

// --- GBIF: mejor foto por preferencia de licencia (prioriza España) ------------------------------
async function gbifKey(sp) {
  if (sp.gbifSpeciesKey) return sp.gbifSpeciesKey;
  try { const m = await get('api.gbif.org', `/v1/species/match?name=${encodeURIComponent(sp.scientificName)}`); return (m && m.matchType !== 'NONE') ? (m.speciesKey || m.usageKey) : null; }
  catch (_) { return null; }
}
function pickFromOccurrences(list) {
  let best = null;
  for (const oc of (list || [])) {
    const medias = (oc.media || []).filter(m => (m.type === 'StillImage') && m.identifier);
    for (const m of medias) {
      const li = licenseInfo(m.license || oc.license);
      if (li.rank === 9) continue;
      if (li.nc && !ALLOW_NC) continue;
      const cand = { url: m.identifier, license: li, creator: m.creator || m.rightsHolder || oc.recordedBy || null,
        source: (m.publisher ? m.publisher + '/' : '') + 'GBIF', country: oc.countryCode || null };
      // mejor = menor rank de licencia; a igualdad, preferimos país objetivo
      if (!best || li.rank < best.license.rank || (li.rank === best.license.rank && cand.country === COUNTRY && best.country !== COUNTRY)) best = cand;
      if (best && best.license.rank === 0 && best.country === COUNTRY) return best; // CC0 + país: inmejorable
    }
  }
  return best;
}
async function fromGbif(sp) {
  const key = await gbifKey(sp);
  if (!key) return null;
  // 1º intenta país objetivo (más representativo); si no hay, sin filtro de país.
  for (const q of [`&country=${COUNTRY}`, '']) {
    try {
      const r = await get('api.gbif.org', `/v1/occurrence/search?taxonKey=${key}&mediaType=StillImage${q}&limit=60`);
      const best = pickFromOccurrences(r.results);
      if (best) { best.gbifKey = key; return best; }
    } catch (_) { /* sigue */ }
  }
  return null;
}

// --- ¿esta especie necesita foto? ---------------------------------------------------------------
// En modo 'missing' cuenta como "sin foto" solo si el campo image está vacío. Las rutas locales
// (Img/species/<x>.jpg) corresponden a archivos reales del frontend y NO se tocan. En modo 'all'
// se procesan todas (para sustituir/mejorar).
function needsPhoto(sp) {
  if (MODE === 'all') return true;
  return !(sp.image || '').trim();
}

function sqlEscape(s) { return String(s).replace(/'/g, "''"); }

(async () => {
  const park = JSON.parse(fs.readFileSync(PARK, 'utf8'));
  const species = (park.species || []).filter(s => s.scientificName);
  const targets = species.filter(needsPhoto);
  process.stderr.write(`Especies: ${species.length} · a rellenar (${MODE}): ${targets.length} · NC ${ALLOW_NC ? 'permitido' : 'excluido'}\n`);

  const results = await pool(targets, CONC, async sp => {
    const hit = (await fromEidos(sp.eidosTaxonId)) || (await fromGbif(sp));
    return { sp, hit };
  });

  const filled = [], missing = [];
  const sql = [
    '-- Fotos de especie (EIDOS multimedia + GBIF). Generado por Tools/catalogo-nacional/enrich-images.js',
    `-- Parque: ${SLUG} · modo: ${MODE} · NC ${ALLOW_NC ? 'permitido' : 'excluido'} · ${new Date().toISOString()}`,
    '-- Correr DESPUÉS del INSERT INTO species (igual que el bloque de fotos del seed).', ''
  ];
  const failed = [];
  for (const r of results) {
    if (r && r.error) { failed.push(r.error); continue; } // fallo real (red/parseo) — no lo cuentes como "sin foto"
    if (!r || !r.hit || !r.hit.url) { missing.push(r ? r.sp : null); continue; }
    const { sp, hit } = r;
    const attribution = `${hit.creator || 'Autor desconocido'} (${hit.license.short}) · ${hit.source}`;
    filled.push({ sp, hit, attribution });
    sql.push(`UPDATE species s JOIN parks p ON p.id = s.park_id AND p.slug = '${sqlEscape(SLUG)}'`);
    sql.push(`    SET s.image_url = '${sqlEscape(hit.url)}',`);
    sql.push(`        s.image_attribution = '${sqlEscape(attribution)}'`);
    sql.push(`    WHERE s.scientific_name = '${sqlEscape(sp.scientificName)}';`);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, sql.join('\n') + '\n');

  // Informe markdown
  const nc = filled.filter(f => f.hit.license.nc);
  const rep = [];
  rep.push(`# Fotos de especie — ${SLUG}`);
  rep.push('');
  rep.push(`Fuente: EIDOS (IEPNB) multimedia → GBIF fallback. Modo \`${MODE}\`. CC-BY-NC ${ALLOW_NC ? '**permitido**' : 'excluido'}.`);
  rep.push('');
  rep.push(`- Rellenadas: **${filled.length}** · sin foto con licencia válida: **${missing.filter(Boolean).length}**`);
  if (nc.length) rep.push(`- ⚠️ De las rellenadas, **${nc.length}** son CC-BY-NC (no comercial) — revisar antes de publicar.`);
  rep.push('');
  rep.push('## Rellenadas');
  rep.push('');
  rep.push('| Especie | Licencia | Autor | País | Fuente |');
  rep.push('| --- | --- | --- | --- | --- |');
  for (const f of filled) rep.push(`| _${f.sp.scientificName}_ | ${f.hit.license.short}${f.hit.license.nc ? ' ⚠️' : ''} | ${f.hit.creator || '—'} | ${f.hit.country || '—'} | ${f.hit.source} |`);
  rep.push('');
  if (missing.filter(Boolean).length) {
    rep.push('## Sin foto con licencia válida (revisión manual)');
    rep.push('');
    for (const s of missing.filter(Boolean)) rep.push(`- ${s.commonName || ''} (_${s.scientificName}_)`);
    rep.push('');
  }
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, rep.join('\n') + '\n');

  // Escritura directa en park.json (imprescindible para especies que aún no están en la BD: el
  // catálogo puede haberse ampliado solo en park.json). Respeta el formato de PHP json_encode:
  // indentación de 4 espacios, unicode literal y barras escapadas (\/).
  if (WRITE_PARK) {
    const bySciFill = new Map(filled.map(f => [f.sp.scientificName, f]));
    let n = 0;
    for (const sp of park.species) {
      const f = bySciFill.get(sp.scientificName);
      if (f) { sp.image = f.hit.url; sp.imageAttribution = f.attribution; n++; }
    }
    fs.writeFileSync(PARK, JSON.stringify(park, null, 4).replace(/\//g, '\\/') + '\n');
    console.log(`   park.json actualizado: ${n} especies`);
  }

  console.log(`OK · rellenadas ${filled.length} / ${targets.length} · SQL -> ${OUT} · informe -> ${REPORT}`);
  if (nc.length) console.log(`   (${nc.length} CC-BY-NC marcadas)`);
  if (failed.length) console.log(`   ⚠️ ${failed.length} especies fallaron por error de red/parseo (no "sin foto", error real): ${[...new Set(failed)].slice(0, 3).join(' | ')}`);
})();
