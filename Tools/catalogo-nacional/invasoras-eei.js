#!/usr/bin/env node
// ================================================================================================
// invasoras-eei.js — especies exóticas INVASORAS de un territorio: catálogo oficial EEI (RD 630/2013,
// vía EIDOS) ∩ presencia real en la CCAA/provincia (GBIF, por gadmGid), rankeadas por frecuencia.
// ------------------------------------------------------------------------------------------------
// SOLO LECTURA (no toca BD/seed): genera un JSON con las invasoras más comunes del territorio para
// revisar y cargar. Fuentes: Catálogo Español de EEI (RD 630/2013) en EIDOS (IEPNB) + ocurrencias GBIF.
// Uso:
//   node Tools/catalogo-nacional/invasoras-eei.js --gadm ESP.14_1 --ccaa "Región de Murcia" [--top 25] [--json out.json]
// (gadmGid: p. ej. Región de Murcia = ESP.14_1; búscalo en api.gbif.org/v1/geocode o el visor GADM.)
// ================================================================================================
const fs = require('fs');
const { getJson, pool } = require('../lib/http');
const { arg, num, requireArgs } = require('../lib/cli');

const GADM = arg('gadm'), CCAA = arg('ccaa'), TOP = num('top', 25), OUT = arg('json');
requireArgs('Uso: --gadm <gadmGid> --ccaa <nombre> [--top N] [--json out.json]', { gadm: GADM, ccaa: CCAA });

const get = (host, path) => getJson(host, path, { agent: 'invasoras-eei' });

(async () => {
  // 1) Catálogo EEI oficial (EIDOS): idtaxon "CEEEI: Incluido" del RD 630/2013.
  const legal = await get('iepnb.gob.es', '/api/especie/v_estadolegal?norma=' + encodeURIComponent('ilike.*630/2013*') + '&estadolegal=' + encodeURIComponent('ilike.*CEEEI: Incluido*') + '&select=idtaxon&limit=3000');
  const ids = [...new Set(legal.map(r => r.idtaxon).filter(Boolean))];
  const nameById = {};
  for (let k = 0; k < ids.length; k += 120) {
    const rows = await get('iepnb.gob.es', `/api/especie/v_taxonomia?taxonid=in.(${ids.slice(k, k + 120).join(',')})&select=taxonid,name,genus,specificepithet,taxonomicgroup,nametype`);
    for (const r of rows) {
      if (r.nametype && r.nametype !== 'Aceptado/válido' && nameById[r.taxonid]) continue;
      const sci = (r.genus && r.specificepithet) ? `${r.genus} ${r.specificepithet}` : String(r.name || '').split(/\s+/).slice(0, 2).join(' ');
      nameById[r.taxonid] = { taxonid: r.taxonid, sci, group: r.taxonomicgroup };
    }
  }
  const eei = Object.values(nameById).filter(x => x.sci && / /.test(x.sci));
  process.stderr.write(`EEI RD 630/2013: ${ids.length} idtaxon, ${eei.length} con nombre\n`);

  // 2) Clave GBIF de cada especie EEI.
  const matched = await pool(eei, 10, async e => {
    const m = await get('api.gbif.org', `/v1/species/match?name=${encodeURIComponent(e.sci)}`);
    const key = (m && m.matchType !== 'NONE') ? (m.speciesKey || m.usageKey) : null;
    return { ...e, key };
  });
  const eeiByKey = new Map(); matched.filter(Boolean).forEach(e => { if (e.key) eeiByKey.set(e.key, e); });

  // 3) Especies presentes en el territorio (GBIF gadmGid), faceta por speciesKey.
  const fac = await get('api.gbif.org', `/v1/occurrence/search?gadmGid=${encodeURIComponent(GADM)}&limit=0&facet=speciesKey&facetLimit=6000`);
  const terr = new Map();
  for (const c of (fac.facets && fac.facets[0] ? fac.facets[0].counts : [])) terr.set(Number(c.name), c.count);

  // 4) Intersección rankeada.
  const present = [];
  for (const [key, e] of eeiByKey) if (terr.has(key)) present.push({ ...e, gbif_key: key, occ: terr.get(key) });
  present.sort((a, b) => b.occ - a.occ);
  const top = present.slice(0, TOP);

  // 5) Nombre común en español (EIDOS) de las top.
  for (const p of top) {
    try {
      const rows = await get('iepnb.gob.es', `/api/especie/v_nombrescomunes?idtaxon=eq.${p.taxonid}&select=nombre,idioma,preferente`);
      const es = (rows || []).filter(r => /castellano|espa|^es$/i.test(r.idioma || ''));
      const pref = (es.length ? es : rows).find(r => r.preferente === true || r.preferente === 1) || es[0];
      p.common_es = pref ? pref.nombre : null;
    } catch (_) { p.common_es = null; }
  }

  const result = { ccaa: CCAA, gadm: GADM, catalogo: 'Catálogo Español de EEI (RD 630/2013)',
    fuente: 'EIDOS (IEPNB) + GBIF (gadmGid ' + GADM + ')', total_presentes: present.length, top };
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
  console.log(`=== Invasoras EEI en ${CCAA}: ${present.length} presentes (top ${top.length}) ===`);
  top.forEach(p => console.log(`  ${String(p.occ).padStart(6)}  ${p.common_es || '—'}  [${p.sci}]  ${p.group || ''}`));
  if (OUT) console.log('\n-> ' + OUT);
})();
