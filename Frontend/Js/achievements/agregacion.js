// ================================================================================================
// ./achievements/agregacion.js — agregación local: espejo best-effort de computeAccountAggregates() de account_progress.php
// ------------------------------------------------------------------------------------------------
// Trozo de achievements.js. El índice de la carpeta está en Frontend/Js/CLAUDE.md.
// ================================================================================================

import { localVerifiedWindows } from '../presence.js';
import { state } from '../state.js';
import { pointInGeometry } from '../util.js';
import { canonicalSpeciesKey, findParkEntry, getJSON, getLocalParkIndex, loadAchievementsCatalog, loadRegistry, localFieldStats, lsKey, verifiedMarksOf } from './almacen.js';

// --- Agregación local (espejo best-effort de computeAccountAggregates en account_progress.php) ---
// Solo puede tener en cuenta los parques con los que este DISPOSITIVO ha interactuado (getLocalParkIndex)
// y cuyos datos siguen cacheados; por eso es una predicción, no la fuente de verdad, y se reconcilia
// con el servidor en cuanto hay red (ver syncWithServer más abajo).
export async function computeLocalAggregates() {
  const parkSlugs = getLocalParkIndex();
  const registry = await loadRegistry();
  const windows = localVerifiedWindows();
  const field = localFieldStats();
  const speciesKeys = new Set();
  const gpsKeys = new Set();
  const regions = new Set();
  const provinces = new Set();
  let poisSeen = 0;
  let habitatsCompleted = 0;
  let parksCompleted = 0;
  let unverifiedMarks = 0;

  // Comunidades y provincias salen de haber PISADO el espacio, no de haber marcado nada en él.
  for (const slug of field.parksList) {
    const entry = registry ? findParkEntry(registry, slug) : null;
    if (!entry) continue;
    try {
      const manifest = (await NaturDexOffline.fetchJsonCached(entry.manifest)).data;
      const parkData = (await NaturDexOffline.fetchJsonCached(manifest.data)).data;
      const park = (parkData && parkData.park) || {};
      if (park.region) regions.add(park.region);
      if (park.province) provinces.add(park.province);
    } catch (e) { /* sin datos cacheados: se omite su aportación al recuento territorial */ }
  }

  for (const slug of parkSlugs) {
    const scope = (state.userId != null ? 'u' + state.userId : 'anon') + ':' + slug;
    const progress = NaturDexOffline.loadProgressLocal(scope);
    const seenSpecies = new Set((progress.seenSpeciesIds || []).map(Number));
    const seenPois = new Set(progress.seenPoiIds || []);
    if (!seenSpecies.size && !seenPois.size) continue;

    // Solo cuenta lo marcado durante una visita verificada a ESTE espacio. Lo demás sigue en el
    // cuaderno del usuario (y se cuenta aparte para poder decírselo con claridad).
    const verified = verifiedMarksOf(slug, progress.markedAt || {}, windows);
    const verifiedSpecies = Array.from(verified.species).filter(id => seenSpecies.has(id));
    const verifiedPois = Array.from(verified.pois).filter(id => seenPois.has(id));
    unverifiedMarks += (seenSpecies.size - verifiedSpecies.length) + (seenPois.size - verifiedPois.length);
    if (!verifiedSpecies.length && !verifiedPois.length) continue;

    const entry = registry ? findParkEntry(registry, slug) : null;
    if (!entry) continue;
    let parkData, boundary = null;
    try {
      const manifest = (await NaturDexOffline.fetchJsonCached(entry.manifest)).data;
      parkData = (await NaturDexOffline.fetchJsonCached(manifest.data)).data;
      if (manifest.geo && manifest.geo.parque) boundary = (await NaturDexOffline.fetchJsonCached(manifest.geo.parque)).data;
    } catch (e) { continue; } // sin datos cacheados de este parque: se omite su aportación

    poisSeen += verifiedPois.length;
    const verifiedSpeciesSet = new Set(verifiedSpecies);
    const speciesById = new Map((parkData.species || []).map(s => [s.id, s]));
    verifiedSpecies.forEach(id => {
      const sp = speciesById.get(id);
      if (!sp) return;
      const key = canonicalSpeciesKey(sp);
      speciesKeys.add(key);
      // Registro georreferenciado: la coordenada del avistamiento tiene que caer dentro del límite.
      const sighting = progress.sightings && progress.sightings[String(id)];
      if (sighting && boundary && insideBoundary(boundary, sighting.lat, sighting.lng)) gpsKeys.add(key);
    });

    const habitats = parkData.habitats || [];
    let habitatsCompleteHere = 0;
    habitats.forEach(h => {
      const members = h.speciesIds || [];
      if (!members.length) return;
      const seenHere = members.filter(id => verifiedSpeciesSet.has(id)).length;
      if (seenHere === members.length) habitatsCompleteHere++;
    });
    habitatsCompleted += habitatsCompleteHere;

    const poisTotal = (parkData.pointsOfInterest || []).length;
    const parkComplete = habitats.length > 0 && habitatsCompleteHere === habitats.length
      && poisTotal > 0 && verifiedPois.length === poisTotal;
    if (parkComplete) parksCompleted++;
  }

  return {
    speciesSeen: speciesKeys.size,
    parksVisited: field.parksVisited,
    parksCompleted,
    regionsVisited: regions.size,
    provincesVisited: provinces.size,
    habitatsCompleted,
    poisSeen,
    gpsSightings: gpsKeys.size,
    fieldDays: field.fieldDays,
    weekStreak: field.weekStreak,
    maxParkRevisitDays: field.maxParkRevisitDays,
    // Estaciones del año con salida verificada (y el mejor registro dentro de un mismo espacio).
    // Espejo: computeAccountAggregates() en Backend/Lib/account_progress.php.
    seasonsVisited: field.seasonsVisited,
    sameParkSeasons: field.sameParkSeasons,
    fieldHours: field.fieldHours,
    fieldKilometers: field.fieldKilometers,
    invasiveSeen: getJSON(lsKey('invasiveSeen'), []).length,
    glossaryViewed: getJSON(lsKey('glossaryViewed'), []).length,
    unverifiedMarks,
    regionsList: Array.from(regions),
    flags: {
      earlyBird: field.earlyBird,
      winterVisit: field.winterVisit,
      longVisit: field.longestVisitHours >= 3
    }
  };
}

/** ¿Cae la coordenada dentro del GeoJSON del límite del parque? (mismo criterio que el servidor). */
function insideBoundary(geojson, lat, lng) {
  if (!geojson || typeof lat !== 'number' || typeof lng !== 'number') return false;
  const features = geojson.features || [{ geometry: geojson.geometry || geojson }];
  return features.some(f => pointInGeometry(lat, lng, f.geometry || f));
}

function metricValue(aggregates, metric) {
  if (aggregates[metric] !== undefined) return Number(aggregates[metric]) || 0;
  if (aggregates.flags && aggregates.flags[metric] !== undefined) return aggregates.flags[metric] ? 1 : 0;
  return 0;
}

export async function evaluateLocally(aggregates) {
  const catalog = (await loadAchievementsCatalog()).achievements || [];
  const known = new Set(state.account.achievements.keys());
  const newly = [];
  catalog.forEach(ach => {
    if (known.has(ach.id)) return;
    if (metricValue(aggregates, ach.metric) >= ach.threshold) newly.push(ach.id);
  });
  return newly;
}
