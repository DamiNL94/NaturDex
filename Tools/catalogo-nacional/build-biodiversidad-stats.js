#!/usr/bin/env node
'use strict';
/*
 * build-biodiversidad-stats.js — estadisticas de biodiversidad agregadas por espacio.
 *
 * El problema que resuelve
 * -----------------------
 * El catalogo de cada espacio (habitats + especies, con su rareza legal) se ve ficha a ficha en la
 * app, pero no hay ningun sitio que lo agregue: cuantos habitats tiene, cuantas especies, que parte
 * esta protegida o amenazada, cuantos habitats son prioritarios segun la Directiva de Habitats. Este
 * script NO calcula ningun dato nuevo -no sale a ninguna fuente ni deriva nada que el catalogo no
 * afirme ya- es agregacion pura sobre lo YA publicado en cada `park.json`.
 *
 * Donde vive el resultado, y por que no en el `park.json`
 * ---------------------------------------------------------
 * `Frontend/Js/data.js::loadData()` SUSTITUYE `state.data` entero por la respuesta de
 * `Backend/Api/species.php` en cuanto hay backend accesible (no hace merge), y esa respuesta la
 * construye `Backend/Lib/park_payload.php` campo a campo desde la BD. Un campo nuevo colgado del
 * `park.json` (p. ej. `park.biodiversity`) desapareceria sin aviso en cuanto hubiera backend
 * desplegado -exactamente la clase de fallo silencioso que este repo lleva un CLAUDE.md entero
 * documentando-. Por eso el resultado se escribe en un fichero PROPIO,
 * `Frontend/Data/parks-biodiversidad.json`, cargado aparte con `NaturDexOffline.fetchJsonCached()`
 * -el mismo mecanismo que ya usan `Data/glosario.json` y `Data/achievements.json`, que tampoco pasan
 * por `species.php`-. Asi sobrevive tanto al modo sin backend como al modo con backend.
 *
 * Que mide, exactamente
 * ---------------------
 * Para cada espacio CON catalogo (`species.length > 0`; no se usa ningun estado hardcodeado porque
 * el rollout nacional sigue avanzando):
 *
 *   - habitats: total, prioritarios (`habitat.priority === true`) y su %.
 *   - especies VISIBLES (`visible !== false`, el mismo criterio que `applyVisibility()` de
 *     `Frontend/Js/data.js`): total, flora/fauna (`kingdom`) y desglose por `group`.
 *   - rareza: recuento por `rarityLocal` 1-5 + «sin calcular» (que NO es lo mismo que tramo 1 - ver
 *     `Tools/lib/rareza.js`), y los porcentajes con alguna proteccion (tramo >=2) y amenazadas
 *     (tramo >= TRAMO_AMENAZA). El tramo de cada ficha se lee con la MISMA reserva que usa la app
 *     (`Frontend/Js/rareza.js::tramoDe()`): `rarityLocal`, y si falta, `rarityScore` SOLO si trae
 *     `rarityBasis` (si no, es uno de los numeros puestos a ojo del criterio viejo, que `validate`
 *     ya cuenta como aviso aparte).
 *   - evidencia documental (opcional): si existe `out/niveles-puerta.json` (lo genera
 *     `npm run especies:niveles -- --json Tools/catalogo-nacional/out/niveles-puerta.json`), se
 *     copia tal cual el reparto N1/N2/N3 de ese espacio. Si no existe, el campo se OMITE con un
 *     aviso -no se recalcula por otra via ni se rellena con un valor a ojo (regla n.2 del CLAUDE.md
 *     raiz)-.
 *
 * Sin red, sin escribir en ningun `park.json`, idempotente: un segundo pase no cambia un byte del
 * fichero de salida si no ha cambiado el catalogo de ningun espacio.
 *
 * Uso:
 *   node Tools/catalogo-nacional/build-biodiversidad-stats.js [--niveles <ruta>] [--out <ruta>]
 *
 *   --niveles  ruta al `--json` de mide-niveles-puerta.js (por defecto out/niveles-puerta.json).
 *   --out      ruta de salida (por defecto Frontend/Data/parks-biodiversidad.json).
 */

const fs = require('fs');
const path = require('path');
const { arg } = require('../lib/cli');
const { DATA, OUT_DIR, readJson, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');

// El mismo umbral que usa Frontend/Js/rareza.js (TRAMO_AMENAZA): a partir de este tramo la ficha
// lleva cartel de advertencia en la app. No se puede importar entre Tools/ (Node) y Frontend/
// (modulo ES de navegador), asi que se repite aqui, como ya acepta el repo para el resto de la
// escalera («la misma escalera vista desde los dos lados del repositorio», Frontend/Js/rareza.js).
const TRAMO_AMENAZA = 4;

const RUTA_NIVELES = fromRoot(arg('niveles', path.join(OUT_DIR, 'niveles-puerta.json')));
const RUTA_SALIDA = fromRoot(arg('out', path.join(DATA, 'parks-biodiversidad.json')));

const hayNiveles = fs.existsSync(RUTA_NIVELES);
if (!hayNiveles) {
  process.stderr.write(`⚠ sin ${rel(RUTA_NIVELES)}: el bloque "evidencia" se omite en todos ` +
    'los espacios. Para incluirlo: npm run especies:niveles -- --json ' + rel(RUTA_NIVELES) + '\n');
}
const niveles = hayNiveles ? readJson(RUTA_NIVELES) : null;

/**
 * El tramo de UNA ficha, con la misma reserva que usa la app (Frontend/Js/rareza.js::tramoDe()):
 * `rarityLocal`, y si falta, `rarityScore` SOLO si trae `rarityBasis` (si no, es un numero puesto a
 * ojo del criterio viejo). Devuelve null cuando no consta ninguno de los dos: "sin calcular" no es
 * "tramo 1", la escalera empieza en un dato comprobado, no en la ausencia de dato.
 */
function tramoDe(s) {
  const estatal = s.rarityBasis ? s.rarityScore : null;
  const t = s.rarityLocal ?? estatal ?? null;
  return Number.isFinite(t) && t >= 1 && t <= 5 ? t : null;
}

const pct = (n, total) => (total > 0 ? Math.round((n * 1000) / total) / 10 : 0);

const porParque = {};
console.log('espacio'.padEnd(42) + 'habitats'.padStart(10) + 'especies'.padStart(10) + '  amenazadas');

for (const p of parkFiles()) {
  const park = readJson(p.file);
  const especies = park.species || [];
  if (!especies.length) continue; // ficha base sin catalogo: no hay nada que agregar

  const habitats = park.habitats || [];
  const nHabitats = habitats.length;
  const prioritarios = habitats.filter(h => h.priority === true).length;

  const visibles = especies.filter(s => s.visible !== false);
  const nEspecies = visibles.length;

  const porGrupo = {};
  let flora = 0, fauna = 0;
  for (const s of visibles) {
    if (s.kingdom === 'flora') flora++;
    else if (s.kingdom === 'fauna') fauna++;
    const g = s.group || 'Sin clasificar';
    porGrupo[g] = (porGrupo[g] || 0) + 1;
  }

  const tramos = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sinCalcular = 0, conProteccion = 0, amenazadas = 0;
  for (const s of visibles) {
    const t = tramoDe(s);
    if (t === null) { sinCalcular++; continue; }
    tramos[t]++;
    if (t >= 2) conProteccion++;
    if (t >= TRAMO_AMENAZA) amenazadas++;
  }

  const entry = {
    habitats: { total: nHabitats, prioritarios, prioritariosPct: pct(prioritarios, nHabitats) },
    especies: { total: nEspecies, flora, fauna, porGrupo },
    rareza: {
      tramos: { ...tramos, sinCalcular },
      conProteccionPct: pct(conProteccion, nEspecies),
      amenazadasPct: pct(amenazadas, nEspecies),
    },
  };

  if (niveles && niveles.porParque && niveles.porParque[p.slug]) {
    const n = niveles.porParque[p.slug];
    entry.evidencia = { n1: n.n1, n2: n.n2, n3: n.n3, visibles: n.visibles };
  }

  porParque[p.slug] = entry;
  console.log(
    p.slug.padEnd(42) + String(nHabitats).padStart(10) + String(nEspecies).padStart(10) +
    `  ${amenazadas} (${entry.rareza.amenazadasPct}%)`
  );
}

writeJson(RUTA_SALIDA, {
  _comment: 'Generado por Tools/catalogo-nacional/build-biodiversidad-stats.js -no editar a mano-. ' +
    'Agregados derivados del catalogo ya publicado de cada espacio: no afirma ningun dato que el ' +
    'propio catalogo no tenga ya.',
  porParque,
});
console.log('→ ' + rel(RUTA_SALIDA));
