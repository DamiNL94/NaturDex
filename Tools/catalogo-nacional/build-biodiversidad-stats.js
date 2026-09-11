#!/usr/bin/env node
'use strict';
/*
 * build-biodiversidad-stats.js — estadisticas de biodiversidad agregadas por espacio.
 *
 * El problema que resuelve
 * -----------------------
 * El catalogo de cada espacio (habitats con codigo HIC y si son prioritarios; especies con
 * `kingdom`, `group`, taxonomia y `rarityLocal`, el tramo de rareza legal 1-5 que calcula
 * `Tools/lib/rareza.js`) solo se ve ficha a ficha. No hay ninguna vista que agregue ese dato: cuantas
 * especies tiene un espacio, cuantas estan protegidas, como se compara con otro. Este script calcula
 * exactamente eso -- riqueza de especies, % de especies amenazadas, comparativas entre espacios --
 * sin inventar ningun dato nuevo: es agregacion pura sobre lo ya publicado en los `park.json`.
 *
 * Por que el resultado NO se mete en cada park.json
 * --------------------------------------------------
 * `Frontend/Js/data.js::loadData()` SUSTITUYE por completo `state.data` con la respuesta de
 * `Backend/Api/species.php` cuando hay backend accesible (no hace merge). Esa respuesta la construye
 * `Backend/Lib/park_payload.php` campo a campo desde la base de datos, asi que cualquier campo nuevo
 * anadido dentro de `park.json` (p. ej. `park.biodiversity`) desaparecería en cuanto hubiera backend
 * desplegado, sin error ni aviso -- exactamente la clase de fallo silencioso que el CLAUDE.md raiz
 * lleva documentando. Por eso la salida es un fichero INDEPENDIENTE
 * (`Frontend/Data/parks-biodiversidad.json`), cargado aparte con `NaturDexOffline.fetchJsonCached()`
 * -- el mismo mecanismo que ya usan `Data/glosario.json` y `Data/achievements.json`, que tampoco
 * pasan por `species.php`.
 *
 * Que mide, exactamente
 * ---------------------
 * Para cada espacio CON catalogo (`species.length > 0` -- el mismo criterio que ya usa
 * `mide-niveles-puerta.js`, y no una lista de slugs escrita a mano, porque el alta de espacios sigue
 * en marcha):
 *
 *   - Habitats  -- total, prioritarios (`habitat.priority === true`) y su %.
 *   - Especies  -- total VISIBLE (`visible !== false`, el mismo criterio que `applyVisibility()` de
 *                  `Frontend/Js/data.js`), desglose por `kingdom` (flora/fauna) y por `group`.
 *   - Rareza    -- recuento por tramo (1-5) mas "sin calcular" (null/ausente, que aqui NO es lo mismo
 *                  que tramo 1 -- ver la cabecera de `Tools/lib/rareza.js` y de
 *                  `Frontend/Js/rareza.js`), % con alguna proteccion (tramo >=2) y % amenazadas
 *                  (tramo >=4, el mismo umbral `TRAMO_AMENAZA` que usa `Frontend/Js/rareza.js` -- se
 *                  repite aqui con un comentario cruzado, "la misma escalera vista desde los dos
 *                  lados del repositorio", el mismo trato que ya recibe el resto de la escalera).
 *   - Evidencia -- opcional: si existe `Tools/catalogo-nacional/out/niveles-puerta.json` (lo genera
 *                  `npm run especies:niveles -- --json Tools/catalogo-nacional/out/niveles-puerta.json`),
 *                  se copia tal cual el reparto N1/N2/N3 de ese espacio. Si no existe, el campo se
 *                  OMITE con un aviso por stderr -- no se inventa ni se recalcula por otra via: es la
 *                  regla n.2 del CLAUDE.md raiz, "ante la duda, hueco documentado antes que dato
 *                  inventado".
 *
 * El tramo de una ficha se LEE, no se deriva de la norma: aqui solo se cuenta `rarityLocal`/
 * `rarityBasis`/`rarityScore`, ya calculados por el pipeline de seleccion. La logica de reserva
 * (`tramoDe` mas abajo) es una copia deliberada de `Frontend/Js/rareza.js::tramoDe()` -- la misma
 * escalera vista desde los dos lados del repositorio, porque Tools (Node) y Frontend (ES modules del
 * navegador) no pueden compartir codigo a traves de esa frontera. Si un dia cambia una, cambia la
 * otra: el sitio donde mirar son esos dos ficheros.
 *
 * Solo lectura de los `park.json` ya publicados (parkFiles() de Tools/lib/io.js), sin red,
 * idempotente: no escribe nada salvo `--out`. No usa `escribeEspacio()`: no toca ningun park.json ni
 * su manifest.json. Sin campo de fecha en la salida a proposito: un `generatedAt` cambiaria en cada
 * ejecucion aunque el dato fuera identico, que es justo lo que la regla n.7 (idempotencia) prohibe --
 * mismo criterio que el propio `--json` de `mide-niveles-puerta.js`.
 *
 * Uso:
 *   node Tools/catalogo-nacional/build-biodiversidad-stats.js [--niveles <ruta>] [--out <ruta>]
 *
 *   --niveles  JSON de mide-niveles-puerta.js (por defecto Tools/catalogo-nacional/out/niveles-puerta.json).
 *   --out      ruta de salida (por defecto Frontend/Data/parks-biodiversidad.json).
 */

const path = require('path');
const { arg } = require('../lib/cli');
const { DATA, OUT_DIR, readJson, readJsonIf, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');

// A partir de este tramo la ficha lleva cartel de advertencia en la app. Mismo umbral y mismo
// criterio cruzado que Frontend/Js/rareza.js::TRAMO_AMENAZA: si cambia alli, cambia aqui.
const TRAMO_AMENAZA = 4;

const RUTA_NIVELES = fromRoot(arg('niveles', path.join(OUT_DIR, 'niveles-puerta.json')));
const RUTA_SALIDA = fromRoot(arg('out', path.join(DATA, 'parks-biodiversidad.json')));

const niveles = readJsonIf(RUTA_NIVELES, null);
if (!niveles) {
  process.stderr.write('⚠ sin ' + rel(RUTA_NIVELES) + ': el bloque "evidencia" se omite en ' +
    'todos los espacios. Para incluirlo: npm run especies:niveles -- --json ' + rel(RUTA_NIVELES) + '\n');
}

// Copia deliberada de Frontend/Js/rareza.js::tramoDe() -- ver la cabecera de este fichero.
function tramoDe(s) {
  const estatal = s.rarityBasis ? s.rarityScore : null;
  const tramo = s.rarityLocal ?? estatal ?? null;
  return Number.isFinite(tramo) && tramo >= 1 && tramo <= 5 ? tramo : null;
}

const pct = (n, total) => (total > 0 ? Math.round((n * 1000) / total) / 10 : 0);

const porParque = {};

for (const p of parkFiles()) {
  const park = readJson(p.file);
  const species = (park.species || []).filter(s => s.visible !== false);
  if (!species.length) continue; // ficha base sin catalogo: nada que agregar

  const habitats = park.habitats || [];
  const prioritarios = habitats.filter(h => h.priority === true).length;

  const porGrupo = {};
  let flora = 0, fauna = 0;
  const tramos = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, sinCalcular: 0 };
  let conProteccion = 0, amenazadas = 0;
  for (const s of species) {
    if (s.kingdom === 'flora') flora++; else if (s.kingdom === 'fauna') fauna++;
    const grupo = s.group || 'Sin grupo';
    porGrupo[grupo] = (porGrupo[grupo] || 0) + 1;
    const tramo = tramoDe(s);
    if (tramo === null) tramos.sinCalcular++;
    else {
      tramos[tramo]++;
      if (tramo >= 2) conProteccion++;
      if (tramo >= TRAMO_AMENAZA) amenazadas++;
    }
  }

  const entry = {
    habitats: {
      total: habitats.length,
      prioritarios,
      prioritariosPct: pct(prioritarios, habitats.length),
    },
    especies: {
      total: species.length,
      flora, fauna,
      porGrupo,
    },
    rareza: {
      tramos,
      conProteccionPct: pct(conProteccion, species.length),
      amenazadasPct: pct(amenazadas, species.length),
    },
  };

  const nivelesParque = niveles && niveles.porParque && niveles.porParque[p.slug];
  if (nivelesParque) {
    entry.evidencia = {
      n1: nivelesParque.n1, n2: nivelesParque.n2, n3: nivelesParque.n3,
      visibles: nivelesParque.visibles,
    };
  }

  porParque[p.slug] = entry;
  console.log(p.slug.padEnd(30) + ' ' + String(species.length).padStart(4) + ' especies  ' + String(habitats.length).padStart(3) + ' habitats');
}

writeJson(RUTA_SALIDA, {
  _comment: 'Generado por Tools/catalogo-nacional/build-biodiversidad-stats.js (npm run ' +
    'especies:biodiversidad). No editar a mano.',
  porParque,
});
console.log('→ ' + rel(RUTA_SALIDA));
