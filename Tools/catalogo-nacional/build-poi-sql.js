#!/usr/bin/env node
/*
 * build-poi-sql.js — vuelca el bloque `pointsOfInterest` de un park.json a SQL idempotente.
 *
 * Por qué existe
 * --------------
 * `Frontend/Js/data.js` da PRIORIDAD a la respuesta de la API sobre el `park.json` empaquetado: en
 * un despliegue con backend, cerrar una Fase 3 tocando solo `Frontend/` deja al usuario viendo el
 * espacio con cero puntos de interés. Hay que generar y aplicar también el SQL.
 *
 * Hasta ahora ese SQL se escribía a mano, espacio por espacio: `n3-pois-cuatro-calas-sierra-espuna.sql`
 * salió de un script de sesión que no está en el repositorio, y repetirlo por tercera vez es el mismo
 * error que el alta manual de especies ya costó una sesión entera. La descripción y la fuente de un
 * POI se siguen redactando a mano —eso no lo automatiza nadie—, pero pasarlas de JSON a SQL es
 * mecánico y no debe volver a hacerse con las manos.
 *
 * LA TRAMPA QUE ESTE FICHERO EXISTE PARA AVISAR: el INSERT es un `INSERT ... SELECT ... FROM parks`
 * filtrado por el slug del espacio. Si el espacio NO tiene fila en `parks` —el caso de Sierra Espuña
 * el 2026-08-08— el SELECT no devuelve nada y **la carga inserta cero filas sin dar ningún error**.
 * Por eso la cabecera del fichero generado lleva una comprobación previa que hay que ejecutar antes.
 *
 * Uso
 * ---
 *   node Tools/catalogo-nacional/build-poi-sql.js --park <slug> [--out Database/<fichero>.sql]
 *
 * Sin `--out` escribe en `Database/n3-pois-<slug>.sql`.
 *
 * Idempotencia: `ON DUPLICATE KEY UPDATE` sobre la clave única (park_id, slug) del esquema, así que
 * una segunda pasada actualiza en vez de duplicar. Las fotos NO se tocan aquí: `image_url` lo lleva
 * `poi-images.js` con su propio SQL, y esta carga lo respeta si el POI ya lo trae.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const { DATABASE, readJson, rel, parkFiles } = require('../lib/io');
const { arg, die } = require('../lib/cli');
const { sqlStr } = require('../lib/sql');
const { POI, literales, columnas, actualizables } = require('../lib/filas-bd');

const slug = arg('park', null);
if (!slug) die('falta --park <slug>');

const espacio = parkFiles().find(p => p.slug === slug);
if (!espacio) die(`no encuentro el espacio «${slug}» en Frontend/Data/parks/`);

const park = readJson(espacio.file);
const pois = park.pointsOfInterest || [];
if (!pois.length) die(`«${slug}» no tiene puntos de interés en su park.json`);

const salida = arg("out", path.join(DATABASE, `n3-pois-${slug}.sql`));

// Una fila del SELECT sintético. Las columnas, su orden y qué se escribe en cada una están en
// lib/filas-bd.js, compartidas con build-park-sql.js y con la comprobación de ida y vuelta.
const COLS = columnas(POI);
const fila = (p, primera, orden) =>
  '    SELECT ' + literales(POI, p, { orden }).map((x, i) => x + (primera ? ' ' + COLS[i] : '')).join(', ');

const cabecera = `-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- ${park.park.name} · Fase 3 (N3): puntos de interés.
--
-- GENERADO por Tools/catalogo-nacional/build-poi-sql.js desde el bloque \`pointsOfInterest\` de
-- ${rel(espacio.file)}. No editar a mano: regenerar con
--   node Tools/catalogo-nacional/build-poi-sql.js --park ${slug}
--
-- Hace falta porque Frontend/Js/data.js da PRIORIDAD a la API sobre el park.json empaquetado: en un
-- despliegue con backend, sin este SQL el espacio se seguiría sirviendo con 0 puntos de interés.
--
-- ANTES DE APLICAR, comprobar que el espacio tiene fila en \`parks\`. Si no la tiene, el
-- INSERT ... SELECT de abajo no encuentra nada y **carga cero filas sin dar ningún error** (le pasó
-- a Sierra Espuña el 2026-08-08):
--   SELECT id, slug, name FROM parks WHERE slug = '${slug}';
--
-- Idempotente: ON DUPLICATE KEY UPDATE sobre la clave única (park_id, slug). Aplicar con:
--   docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < ${rel(salida)}
-- ================================================================================================

-- ${pois.length} punto(s) de interés.
INSERT INTO points_of_interest (park_id, ${COLS.join(', ')})
SELECT p.id, ${COLS.map(c => 'poi.' + c).join(', ')}
FROM parks p
JOIN (
${pois.map((p, i) => fila(p, i === 0, i)).join('\n    UNION ALL\n')}
) poi
WHERE p.slug = ${sqlStr(slug)}
ON DUPLICATE KEY UPDATE
${actualizables(POI).map(c => `    ${c} = VALUES(${c})`).join(',\n')};

-- Comprobación posterior: debe devolver ${pois.length}.
SELECT COUNT(*) AS pois_cargados FROM points_of_interest poi
JOIN parks p ON p.id = poi.park_id WHERE p.slug = ${sqlStr(slug)};
`;

fs.writeFileSync(salida, cabecera, 'utf8');
console.log(`→ ${rel(salida)} (${pois.length} punto(s) de interés)`);
