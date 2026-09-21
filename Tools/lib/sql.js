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
 * `species.identification_tips` — la lista de pistas de identificación, como ARRAY JSON.
 *
 * Hasta el 2026-09-11 se guardaba unida con «; » (build-park-sql.js) o con saltos de línea (el
 * species-universal.sql), y park_payload.php la partía por «;». Una pista con un punto y coma propio
 * —«Alas largas y estrechas; vuelo veloz y alto»— volvía de la API partida en dos: 24 fichas. JSON
 * escapa lo que haga falta, así que no queda separador que pueda aparecer dentro de una pista.
 *
 * La columna sigue siendo TEXT, no JSON: el porqué (seed.sql) y la lectura —que acepta también el
 * formato viejo— están en Backend/Lib/species_tips.php. Las dos puntas tienen que escribir lo mismo, y
 * `npm run ida-y-vuelta` lo comprueba valor a valor. Sin pistas, NULL.
 *
 * EL CAMBIO VA EN DOS TIEMPOS, y `PISTAS_EN_JSON` es el segundo.
 * -------------------------------------------------------------
 * Railway despliega el PHP desde `main`, y el `park_payload.php` que hay en producción parte por «;».
 * Un array JSON en la base ANTES de desplegar el lector nuevo se leería como UNA sola pista con el
 * texto `["…","…"]` dentro, en todas las fichas. Por eso el orden es:
 *
 *   1. Desplegar el lector nuevo (species_tips.php), que entiende LOS DOS formatos.
 *   2. Solo entonces, esto a `true`, regenerar los dieciséis n2 y aplicarlos.
 *
 * Mientras esté en `false`, los generadores siguen escribiendo el formato viejo, que el lector nuevo
 * también entiende: no hay ningún momento en que la app lea algo que no sabe leer. El precio es que
 * las 24 fichas con un «;» DENTRO de una pista siguen volviendo partidas hasta el segundo tiempo — y
 * `npm run ida-y-vuelta` las enseña como pérdida, que es lo honesto.
 */
const PISTAS_EN_JSON = false;
const columnaTips = (tips) => {
  if (!Array.isArray(tips) || !tips.length) return null;
  return PISTAS_EN_JSON ? JSON.stringify(tips) : tips.join('; ');
};
const sqlTips = (tips) => sqlStr(columnaTips(tips));

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

module.exports = { sqlStr, sqlStrOrNull, sqlNum, sqlBool, sqlJson, columnaTips, sqlTips, PISTAS_EN_JSON, cabeceraSql };
