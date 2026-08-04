'use strict';
/*
 * sql.js — literales SQL para los `.sql` que generan las herramientas del catálogo.
 *
 * Varias herramientas no escriben en la BD: producen un fichero `.sql` con INSERT/UPDATE que se
 * revisa y se aplica a mano (`Database/species-universal.sql`, `habitats-imagenes.sql`,
 * `invasoras-*.sql`…). Cada una tenía su propio escapador, y no todos eran correctos:
 * `enrich-images.js` sólo duplicaba la comilla simple y NO escapaba la barra invertida, que MySQL
 * interpreta como carácter de escape salvo en modo NO_BACKSLASH_ESCAPES. Una atribución con `\`
 * generaba SQL roto o —peor— un valor truncado en silencio.
 *
 * Aquí hay una sola implementación, correcta para MySQL en su configuración por defecto.
 */

/** Literal de cadena SQL. `null`/`undefined` → NULL. Escapa barra invertida y comilla simple. */
const sqlStr = (v) => (v === null || v === undefined
  ? 'NULL'
  : `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`);

/**
 * Igual que `sqlStr` pero la cadena vacía también es NULL. Se usa donde «sin dato» y «cadena en
 * blanco» deben ser lo mismo en la BD (campos de texto libre de las fichas), para que un
 * `IS NOT NULL` no cuente valores vacíos como rellenos.
 */
const sqlStrOrNull = (v) => (v === null || v === undefined || String(v).trim() === '' ? 'NULL' : sqlStr(v));

/** Número o NULL. Evita que un `undefined` acabe escrito como la palabra «undefined». */
const sqlNum = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? 'NULL' : String(Number(v)));

/** Booleano de MySQL (TINYINT 0/1). */
const sqlBool = (v) => (v === null || v === undefined ? 'NULL' : (v ? '1' : '0'));

/** Literal JSON para columnas JSON. `null` → NULL, no la cadena "null". */
const sqlJson = (v) => (v === null || v === undefined ? 'NULL' : sqlStr(JSON.stringify(v)));

module.exports = { sqlStr, sqlStrOrNull, sqlNum, sqlBool, sqlJson };
