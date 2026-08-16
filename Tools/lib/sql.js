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

/*
 * `SET NAMES utf8mb4` — la línea sin la cual el fichero corrompe cada tilde, en silencio.
 *
 * El cliente `mysql` toma su juego de caracteres del entorno, y en un contenedor sin locale eso es
 * **latin1**. Con el cliente en latin1 y la columna en utf8mb4, cada byte de un carácter UTF-8 se
 * interpreta como un carácter y se vuelve a codificar: «Jabalí» entra en la base como «JabalÃ­», y
 * no falla nada — el INSERT va bien, el contador cuadra y el validador no mira dentro de la BD.
 *
 * El repo ya lo había pagado una vez: el 2026-08-15 se descubrió que `migrations.sql` no lo fijaba.
 * Se arregló allí y **no se miró quién más tenía el mismo agujero**, que eran doce ficheros
 * generados — entre ellos `species-universal.sql`, que actualiza el nombre común de las **1.501**
 * fichas del catálogo. Se destapó al cargar todo en un MySQL de verdad el 2026-08-16 y comparar
 * campo a campo: 143 nombres comunes corruptos de 812 comparados.
 *
 * Por eso vive aquí y no en cada generador: son diez herramientas, y la que se olvide de ponerlo no
 * dará ningún error. Toda herramienta que escriba un `.sql` empieza por `cabeceraSql()`.
 */
const cabeceraSql = (titulo) => [
  ...(titulo ? [`-- ${titulo}`] : []),
  '-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un',
  '-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.',
  'SET NAMES utf8mb4;',
  '',
].join('\n');

module.exports = { sqlStr, sqlStrOrNull, sqlNum, sqlBool, sqlJson, cabeceraSql };
