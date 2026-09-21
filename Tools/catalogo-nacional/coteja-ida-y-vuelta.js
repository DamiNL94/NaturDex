#!/usr/bin/env node
'use strict';
/*
 * coteja-ida-y-vuelta.js — qué se PIERDE o se DEFORMA cuando el paquete se regenera desde la base.
 *
 * El problema que resuelve
 * -----------------------
 * `Frontend/Js/data.js` da PRIORIDAD a la API sobre el `park.json` empaquetado, y
 * `Backend/Lib/park_export.php` regenera ese paquete DESDE la base. O sea que la base es la fuente de
 * verdad de lo que ve el usuario, y **un campo que el pipeline escribe en el `park.json` pero que no
 * tiene columna se borra en la primera exportación**. Sin error, sin aviso y con los contadores
 * cuadrando: el §2 del `CLAUDE.md` en estado puro. Quien pulse «Publicar cambios offline» en el
 * AdminPanel dispara esa misma ruta.
 *
 * Se midió una vez, a mano, el 2026-08-11: cargar la base desde cero y reexportar perdía
 * `gbifOccurrences` de 767 fichas y el `origen` de cada recinto del `habitats.geojson`. Después
 * nadie volvió a medirlo, porque medirlo exigía una base cargada. Esto lo mide **sin base**.
 *
 * Dos comprobaciones, y la segunda existe porque la primera dio verde con un fallo delante
 * --------------------------------------------------------------------------------------
 * 1. CLAVES. Lee `Backend/Lib/park_payload.php` y `park_export.php` y saca las claves que emiten
 *    (`"clave" => …` y `$props["clave"]`). Lo que esté en el paquete y no ahí, se pierde. Es una
 *    lectura de texto, no una ejecución: **puede fallar si alguien construye una clave de otra forma**
 *    (con una variable, por ejemplo), y por eso lo que encuentra hay que leerlo, no obedecerlo a ciegas.
 *
 * 2. VALORES (desde el 2026-09-11). Que la clave vuelva no dice que vuelva el valor. `tips` volvía —la
 *    clave estaba— pero partido: se escribía unido con «; » y se leía partiendo por «;», así que «Alas
 *    largas y estrechas; vuelo veloz y alto» volvía como dos pistas. **24 fichas de 5 taxones en 13
 *    espacios, con esta herramienta en verde.** Ahora simula el viaje entero, también sin base:
 *      · la IDA con `Tools/lib/filas-bd.js`, que es la tabla con la que ESCRIBEN los dos generadores
 *        de SQL (`build-park-sql.js` y `build-poi-sql.js`), no una copia de ella;
 *      · la BASE con los tipos de `Database/schema.sql`: DECIMAL redondea, VARCHAR y TEXT tienen tope,
 *        ENUM tiene lista, una clave única —con la colación de la tabla, que no distingue mayúsculas ni
 *        tildes— hace que el segundo INSERT PISE al primero, y el vínculo especie↔hábitat entra por
 *        JOIN, así que el par que no casa no entra;
 *      · la VUELTA con el `buildParkPayload()` de verdad, por PHP (`coteja-ida-y-vuelta.php`) y con una
 *        conexión simulada. No con una copia en JavaScript: una copia de la vuelta habría llevado el
 *        mismo `explode(";")` y habría dado el mismo verde.
 *    y compara campo a campo con el `park.json`. Necesita `php` en el PATH o su ruta en la variable
 *    `PHP`; sin él NO da la comparación por buena: lo dice y sale con código 2.
 *
 * 3. EL ORDEN (desde el 2026-09-21), que era la otra mitad de la deuda nº 3. El exportador ordenaba
 *    las especies por `is_featured, common_name` y los recintos y puntos por `name`, mientras el
 *    `park.json` los lleva en el orden del pipeline: no perdía ningún dato, pero cada export era un
 *    diff completo que escondía lo que sí cambió, y el hábitat que la app abre por defecto salía
 *    distinto con conexión que sin ella. **Se decidió que mande el del `park.json`**: los generadores
 *    lo guardan en la columna `orden` (`filas-bd.js`) y el payload ordena por ella. Aquí se compara la
 *    secuencia de cada lista, con la vuelta ordenando de verdad (ver `coteja-ida-y-vuelta.php`).
 *
 * Lo que NO comprueba
 * -------------------
 * El orden DENTRO de `habitatIds`, que se sigue comparando como conjunto: `species_habitats` no tiene
 * `orden`, y en la app ese orden no decide nada. Tampoco compara los valores del bloque `park`
 * (su límite es un trazado fijo en `park_payload.php`, y el tiempo llega por otro SQL), ni las
 * propiedades del `habitats.geojson`, ni lo que la base haga DESPUÉS de cargar: `migrations.sql` pone
 * a NULL las coordenadas de todas las especies en cada pase.
 *
 * `--sql` escribe el relleno de lo que el repositorio tiene y la base no, o tiene deformado: las
 * columnas que se abrieron el 2026-08-27 (`species.gbif_occurrences`, `habitats.origen`) y, desde el
 * 2026-09-11, las pistas de identificación en su formato nuevo.
 *
 * Idempotente y sin red. Uso:
 *     node Tools/catalogo-nacional/coteja-ida-y-vuelta.js
 *     node Tools/catalogo-nacional/coteja-ida-y-vuelta.js --sql Database/ida-y-vuelta.sql
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { arg } = require('../lib/cli');
const { ROOT, FRONTEND, DATABASE, readJson, readJsonIf, rel, parkFiles } = require('../lib/io');
const { sqlStr, sqlNum, sqlTips, cabeceraSql } = require('../lib/sql');
const { HABITAT, ESPECIE, POI, valores, actualizables, contextoHabitats } = require('../lib/filas-bd');

const SQL = arg('sql', null);
const HOY = '2026-08-27';
const HOY_TIPS = '2026-09-11';

const PAYLOAD = path.join(ROOT, 'Backend', 'Lib', 'park_payload.php');
const EXPORT = path.join(ROOT, 'Backend', 'Lib', 'park_export.php');
const SCHEMA = path.join(ROOT, 'Database', 'schema.sql');
const VUELTA_PHP = path.join(__dirname, 'coteja-ida-y-vuelta.php');

/*
 * Claves que el paquete lleva y que NO tienen que estar en la base, con el motivo. Sin esta lista el
 * informe sería ruido: `id` lo asigna la propia base, `speciesIds` es el espejo del vínculo y
 * `taxonomy` se arma desde seis columnas `taxon_*`.
 */
const ESPERADAS_FUERA = {
  id: 'lo asigna la base (AUTO_INCREMENT); el paquete lo lleva para enlazar dentro del fichero',
  taxonomy: 'se arma en el payload desde las seis columnas `taxon_*`',
  coordinates: 'son las columnas `latitude`/`longitude`',
  habitatIds: 'es el espejo de `species_habitats`, no una columna',
  speciesIds: 'ídem, por el otro lado',
  hectares: 'lo recalcula el exportador desde la geometría',
  priority: 'es la columna `is_priority`',
  featured: 'es `is_featured`',
  visible: 'es `is_visible`',
  audio: 'es `audio_url`',
  tips: 'es `identification_tips`: un array JSON en una columna TEXT (Backend/Lib/species_tips.php)',
  image: 'es `image_url`',
  habitat: 'es `primary_habitat`',
  group: 'es la columna `family` (nombre histórico)',
  type: 'es `habitat_type` en hábitats y `type` en POIs',
  review: 'propiedad heredada del geojson histórico, conservada tal cual por el exportador',
};

/*
 * Campos que SÍ se pierden y se ha decidido que se pierdan, con la decisión escrita y fechada.
 *
 * Sin esta lista la comprobación se queda en rojo para siempre y deja de leerse, que es peor que no
 * tenerla. Con ella, el rojo significa lo único que debe significar: **hay una pérdida que nadie ha
 * mirado todavía**. Una entrada aquí no es un permiso genérico: es una decisión concreta, con fecha,
 * que se puede revisar.
 */
const PERDIDAS_ACEPTADAS = {
  // Hoy no hay ninguna. `gbifBboxSightings` estuvo aquí desde el 2026-08-27 y se retiró del
  // park.json el 2026-09-14: ya no se pierde nada porque ya no existe el campo.
};

/*
 * Lo mismo para los VALORES, pero no por campo entero: cada decisión dice QUÉ diferencia admite, para
 * que aceptar el redondeo de una coordenada no acepte de paso una coordenada que vuelva cambiada de
 * sitio. Lo que vuelve distinto y encaja en su regla se informa sin teñir de rojo; el resto, sí.
 */
const dentroDelSextoDecimal = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length &&
  a.every((x, i) => typeof x === 'number' && typeof b[i] === 'number' && Math.abs(x - b[i]) <= 5e-7 + 1e-12);

const VALORES_ACEPTADOS = {
  coordinates: {
    admite: dentroDelSextoDecimal,
    motivo: '2026-09-11. `latitude`/`longitude` son DECIMAL(10,6): la base redondea al sexto decimal, ' +
      'unos 11 cm, muy por debajo de lo que afina un GPS de campo. Solo lo tenía un punto —el ' +
      'yacimiento romano de La Raya, con siete decimales— y la séptima cifra no es un dato.',
  },
};

/*
 * Campos que el paquete lleva y que NO se comparan valor a valor, con el motivo. `habitatIds` sí se
 * compara, pero como conjunto: vuelve en el orden de la base, y el orden es la otra mitad de la deuda.
 */
const SIN_COMPARAR_VALOR = {
  species: { id: 'lo asigna la base: el número del paquete no sobrevive, ni tiene por qué' },
  habitats: { speciesIds: 'son ids de la base, que el paquete no conoce; el vínculo se compara desde las especies (`habitatIds`)' },
  pointsOfInterest: {},
};

/** Claves que un fichero PHP emite: `"clave" => …` y `$props["clave"] = …`. */
function clavesQueEmite(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const claves = new Set();
  for (const m of txt.matchAll(/"([A-Za-z_][A-Za-z0-9_]*)"\s*=>/g)) claves.add(m[1]);
  for (const m of txt.matchAll(/\$props\[\s*"([A-Za-z_][A-Za-z0-9_]*)"\s*\]/g)) claves.add(m[1]);
  return claves;
}

// --- Lectura del repositorio ----------------------------------------------------------------------

function recorre() {
  const espacios = [];
  for (const p of parkFiles()) {
    const doc = readJson(p.file);
    const manifest = readJsonIf(path.join(p.dir, 'manifest.json')) || {};
    const geoRel = manifest.geo && manifest.geo.habitats;
    const geo = geoRel ? readJsonIf(path.join(FRONTEND, geoRel)) : null;
    espacios.push({ slug: p.slug, doc, geo });
  }
  return espacios;
}

const clavesDe = (lista) => {
  const s = new Set();
  for (const x of lista || []) for (const k of Object.keys(x)) s.add(k);
  return s;
};

// --- 2. Valores: la base simulada -----------------------------------------------------------------

/** Los tipos de columna de schema.sql, tabla a tabla. Es la base que la simulación imita. */
function tiposDeLaBase() {
  const txt = fs.readFileSync(SCHEMA, 'utf8');
  const tablas = {};
  for (const m of txt.matchAll(/CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\n\);/g)) {
    const cols = {};
    for (const linea of m[2].split('\n')) {
      const c = /^\s+(\w+)\s+(VARCHAR|DECIMAL|ENUM|TINYINT|SMALLINT|BIGINT|INT|BOOLEAN|TEXT|JSON)\b(?:\(([^)]*)\))?/i.exec(linea);
      if (!c) continue;
      const t = { base: c[2].toUpperCase() };
      if (t.base === 'VARCHAR') t.largo = Number(c[3]);
      if (t.base === 'DECIMAL') [t.precision, t.escala] = c[3].split(',').map(Number);
      if (t.base === 'ENUM') t.valores = [...c[3].matchAll(/'([^']*)'/g)].map(x => x[1]);
      cols[c[1]] = t;
    }
    tablas[m[1]] = cols;
  }
  return tablas;
}

/*
 * Cómo compara MySQL dos cadenas en una clave única con `utf8mb4_unicode_ci`: sin distinguir
 * mayúsculas ni tildes y sin contar los espacios del final (PAD SPACE). Es una aproximación —la UCA
 * tiene más reglas—, pero es lo que decide si un segundo INSERT crea una fila o pisa la primera.
 */
const claveCi = v => (v === null || v === undefined ? null
  : String(v).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/ +$/, ''));

/**
 * Un número tal como sale de una columna DECIMAL(p,e): cadena con `e` decimales, redondeada como
 * MySQL redondea un literal exacto (la mitad, hacia fuera). Se trabaja sobre el literal que escribe el
 * generador (`String(n)`), no sobre el binario, que convertiría 37.1234565 en 37.12345649999….
 */
function comoDecimal(n, escala) {
  const s = String(n);
  if (/e/i.test(s)) return n.toFixed(escala);
  const neg = s.startsWith('-');
  const [ent, dec = ''] = s.replace('-', '').split('.');
  let digitos = BigInt(ent + dec.padEnd(escala, '0').slice(0, escala));
  if (dec.length > escala && dec[escala] >= '5') digitos += 1n;
  const txt = digitos.toString().padStart(escala + 1, '0');
  const r = escala ? `${txt.slice(0, -escala)}.${txt.slice(-escala)}` : txt;
  return (neg && digitos !== 0n ? '-' : '') + r;
}

/**
 * El valor que devolvería mysqli para esa columna: DECIMAL como cadena, enteros y booleanos como
 * número, texto y JSON como cadena. Lo que no cabe se avisa: con MySQL en modo estricto aborta la
 * sentencia ENTERA —el bloque de hábitats o de especies del espacio—, y en modo laxo se trunca sin
 * decir nada.
 */
function enLaBase(tipos, tabla, col, valor, aviso) {
  const t = tipos[tabla] && tipos[tabla][col];
  if (!t) { aviso(`la columna \`${tabla}.${col}\` no existe en schema.sql: el INSERT fallaría entero`); return valor; }
  if (valor === null) return null;
  switch (t.base) {
    case 'VARCHAR': {
      const n = [...String(valor)].length;
      if (n > t.largo) aviso(`no cabe en \`${col}\` VARCHAR(${t.largo}): tiene ${n} caracteres`);
      return String(valor);
    }
    case 'TEXT': {
      const b = Buffer.byteLength(String(valor), 'utf8');
      if (b > 65535) aviso(`no cabe en \`${col}\` TEXT: ${b} bytes, el tope es 65.535`);
      return String(valor);
    }
    case 'ENUM':
      if (!t.valores.includes(String(valor))) aviso(`\`${col}\` es ENUM(${t.valores.join(', ')}) y el valor es «${valor}»`);
      return String(valor);
    case 'DECIMAL': {
      const d = comoDecimal(Number(valor), t.escala);
      if (d.replace('-', '').split('.')[0].length > t.precision - t.escala) aviso(`no cabe en \`${col}\` DECIMAL(${t.precision},${t.escala}): ${valor}`);
      return d;
    }
    case 'JSON':
      return String(valor);
    default: { // enteros y BOOLEAN: MySQL redondea lo que no sea entero
      const x = Number(valor);
      return Number.isInteger(x) ? x : Math.sign(x) * Math.round(Math.abs(x));
    }
  }
}

/** La IDA: las filas que dejarían en la base los generadores de SQL de un espacio. */
function ida(e, tipos) {
  const avisos = [];
  const tablas = { parks: [{ id: 1, slug: e.slug }], habitats: [], species: [], species_habitats: [], points_of_interest: [] };
  const contextoDe = contextoHabitats(e.geo);

  const carga = (def, lista, contexto, nombreDe) => {
    const filas = tablas[def.tabla];
    for (const [orden, obj] of (lista || []).entries()) {
      const nombre = nombreDe(obj);
      let v;
      try { v = valores(def, obj, { ...contexto(obj), orden }); }
      catch (err) { avisos.push({ tabla: def.tabla, nombre, motivo: `el generador de SQL falla con esta ficha (${err.message})` }); continue; }
      const fila = {};
      for (const [col, val] of Object.entries(v)) {
        fila[col] = enLaBase(tipos, def.tabla, col, val, motivo => avisos.push({ tabla: def.tabla, nombre, motivo }));
      }
      // ON DUPLICATE KEY UPDATE: si choca con una fila anterior por CUALQUIERA de sus claves únicas,
      // no crea otra: reescribe esa con sus columnas actualizables, y las de la clave se quedan.
      const previa = filas.find(f => def.claves.some(k => k.every(c => fila[c] !== null && claveCi(f[c]) === claveCi(fila[c]))));
      if (previa) for (const c of actualizables(def)) previa[c] = fila[c];
      else { fila.id = filas.length + 1; filas.push(fila); }
    }
  };
  carga(HABITAT, e.doc.habitats, h => contextoDe(h.id), h => h.id);
  carga(ESPECIE, e.doc.species, () => ({}), s => s.scientificName);
  carga(POI, e.doc.pointsOfInterest, () => ({}), p => p.id);

  // El vínculo: build-park-sql.js lo inserta con un INSERT … SELECT que resuelve cada par por JOIN
  // —nombre científico y slug, con la colación de la tabla—, así que el par que no casa NO ENTRA, sin
  // error; y la clave primaria (species_id, habitat_id) colapsa los repetidos.
  const idEspecie = new Map(tablas.species.map(f => [claveCi(f.scientific_name), f.id]));
  const idHabitat = new Map(tablas.habitats.map(f => [claveCi(f.slug), f.id]));
  const vistos = new Set();
  for (const s of e.doc.species || []) {
    for (const h of s.habitatIds || []) {
      const sid = idEspecie.get(claveCi(s.scientificName));
      const hid = idHabitat.get(claveCi(h));
      if (sid === undefined || hid === undefined || vistos.has(`${sid}:${hid}`)) continue;
      vistos.add(`${sid}:${hid}`);
      tablas.species_habitats.push({ species_id: sid, habitat_id: hid });
    }
  }
  return { tablas, avisos };
}

/** La VUELTA: el `buildParkPayload()` de verdad sobre esas filas. */
function vuelta(idas) {
  const php = process.env.PHP || 'php';
  const r = spawnSync(php, ['-d', 'memory_limit=2G', '-d', 'xdebug.mode=off', VUELTA_PHP], {
    input: JSON.stringify({ espacios: idas }), encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024,
  });
  if (r.error) return { error: r.error.code === 'ENOENT' ? `no encuentro el ejecutable «${php}»` : r.error.message };
  if (r.status !== 0) return { error: `PHP salió con código ${r.status}: ${(r.stderr || r.stdout || '').trim().slice(0, 800)}` };
  try { return { salida: JSON.parse(r.stdout) }; }
  catch (err) { return { error: `la salida de PHP no es JSON (${err.message}): ${r.stdout.slice(0, 300)}` }; }
}

/*
 * Igualdad de valores. Dentro de un objeto anidado, clave ausente y `null` valen lo mismo: la vuelta
 * emite todas sus claves —la `taxonomy`, siempre con sus seis— y eso no pierde nada. En el primer
 * nivel de la ficha no hace falta esa regla, porque ahí solo se comparan las claves que el paquete
 * trae y que la vuelta emite.
 */
function iguales(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => iguales(x, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].every(k => iguales(a[k], b[k]));
  }
  return false;
}

const muestra = v => {
  const s = v === undefined ? '(sin clave)' : JSON.stringify(v);
  return s.length > 150 ? s.slice(0, 147) + '…' : s;
};
const BLOQUE_DE_TABLA = { habitats: 'habitats', species: 'species', points_of_interest: 'pointsOfInterest' };

function comparaValores(espacios) {
  const tipos = tiposDeLaBase();
  const idas = espacios.map(e => ({ e, ...ida(e, tipos) }));
  const r = vuelta(idas.map(x => ({ slug: x.e.slug, tablas: x.tablas })));
  if (r.error) return { error: r.error };

  const hallazgos = new Map(); // 'bloque.campo[.decidido]' → { fichas, espacios, ejemplos, decidido }
  const anota = (bloque, campo, slug, nombre, detalle, decidido = null) => {
    const k = `${bloque}.${campo}${decidido ? '.decidido' : ''}`;
    if (!hallazgos.has(k)) hallazgos.set(k, { bloque, campo, decidido, fichas: 0, espacios: new Set(), ejemplos: [] });
    const h = hallazgos.get(k);
    h.fichas++;
    h.espacios.add(slug);
    if (h.ejemplos.length < 3) h.ejemplos.push(`${slug} · ${nombre}: ${detalle}`);
  };
  const sinGenerador = {};

  const compara = (bloque, originales, vueltos, clave, nombreDe, slug) => {
    const porClave = new Map((vueltos || []).map(x => [clave(x), x]));
    for (const o of originales || []) {
      const v = porClave.get(clave(o));
      if (!v) { anota(bloque, '(la ficha entera)', slug, nombreDe(o), 'no vuelve de la base'); continue; }
      for (const k of Object.keys(o)) {
        if (k in SIN_COMPARAR_VALOR[bloque] || !(k in v)) continue; // lo que no vuelve lo cuenta la parte 1
        const [a, b] = k === 'habitatIds'
          ? [[...new Set(o[k] || [])].sort(), [...new Set(v[k] || [])].sort()]
          : [o[k], v[k]];
        if (iguales(a, b)) continue;
        const regla = VALORES_ACEPTADOS[k];
        anota(bloque, k, slug, nombreDe(o), `${muestra(a)} → ${muestra(b)}`, regla && regla.admite(a, b) ? regla.motivo : null);
      }
    }
    // EL ORDEN (desde el 2026-09-21): manda el del park.json. Se compara la secuencia de lo que vuelve,
    // una vez por lista, y el detalle es la primera posición en la que se separan.
    const ida = (originales || []).map(clave);
    const vuelto = (vueltos || []).map(clave).filter(k => ida.includes(k));
    const i = ida.filter(k => vuelto.includes(k)).findIndex((k, n) => k !== vuelto[n]);
    if (i >= 0) {
      const esperado = ida.filter(k => vuelto.includes(k));
      anota(bloque, '(el orden de la lista)', slug, `posición ${i + 1}`, `se esperaba ${esperado[i]} y vuelve ${vuelto[i]}`);
    }
  };

  for (const { e, avisos } of idas) {
    const vuelto = r.salida[e.slug] || {};
    for (const [t, cols] of Object.entries(vuelto.sinGenerador || {})) {
      if (!BLOQUE_DE_TABLA[t]) continue;
      for (const c of cols) (sinGenerador[t] = sinGenerador[t] || new Set()).add(c);
    }
    for (const a of avisos) anota(BLOQUE_DE_TABLA[a.tabla], '(no cabe en la base)', e.slug, a.nombre, a.motivo);
    const p = vuelto.payload || {};
    compara('species', e.doc.species, p.species, s => claveCi(s.scientificName), s => s.scientificName, e.slug);
    compara('habitats', e.doc.habitats, p.habitats, h => claveCi(h.id), h => h.id, e.slug);
    compara('pointsOfInterest', e.doc.pointsOfInterest, p.pointsOfInterest, x => claveCi(x.id), x => x.id, e.slug);
  }
  return { hallazgos, sinGenerador };
}

// --- Principal ------------------------------------------------------------------------------------

const emitePayload = clavesQueEmite(PAYLOAD);
const emiteExport = clavesQueEmite(EXPORT);
const espacios = recorre();

const bloques = [
  { titulo: 'species', emite: emitePayload, claves: new Set(), fichero: rel(PAYLOAD) },
  { titulo: 'habitats', emite: emitePayload, claves: new Set(), fichero: rel(PAYLOAD) },
  { titulo: 'pointsOfInterest', emite: emitePayload, claves: new Set(), fichero: rel(PAYLOAD) },
  { titulo: 'geo/habitats.geojson (properties)', emite: emiteExport, claves: new Set(), fichero: rel(EXPORT) },
];

for (const e of espacios) {
  for (const k of clavesDe(e.doc.species)) bloques[0].claves.add(k);
  for (const k of clavesDe(e.doc.habitats)) bloques[1].claves.add(k);
  for (const k of clavesDe(e.doc.pointsOfInterest)) bloques[2].claves.add(k);
  for (const k of clavesDe((e.geo && e.geo.features || []).map(f => f.properties || {}))) bloques[3].claves.add(k);
}

console.log(`Espacios leídos: ${espacios.length}\n`);
console.log('— 1. Claves: ¿tiene cada campo del paquete dónde caer en la base? —\n');
let perdidos = 0;
for (const b of bloques) {
  const noEmitidas = [...b.claves].filter(k => !b.emite.has(k)).sort();
  const fuera = noEmitidas.filter(k => !ESPERADAS_FUERA[k] && !PERDIDAS_ACEPTADAS[k]);
  const aceptadas = noEmitidas.filter(k => PERDIDAS_ACEPTADAS[k]);
  const justificadas = noEmitidas.filter(k => ESPERADAS_FUERA[k]);
  console.log(`${b.titulo} — ${b.claves.size} clave(s) en el paquete, contra ${b.fichero}`);
  if (!fuera.length) console.log('  ✓ ninguna pérdida sin decidir');
  for (const k of fuera) { console.log(`  ✗ ${k} — el exportador no lo emite: se PIERDE en la ida y vuelta`); perdidos++; }
  for (const k of aceptadas) console.log(`  ~ ${k} — se pierde, DECIDIDO: ${PERDIDAS_ACEPTADAS[k]}`);
  for (const k of justificadas) console.log(`  · ${k} — ${ESPERADAS_FUERA[k]}`);
  console.log('');
}

console.log('— 2. Valores: ¿vuelve cada campo IGUAL? (generadores de SQL → schema.sql → park_payload.php) —\n');
const valoresRes = comparaValores(espacios);
let deformados = 0;
if (valoresRes.error) {
  console.log(`  ✗ NO se han comparado los valores: ${valoresRes.error}`);
  console.log('    La vuelta la hace el park_payload.php de verdad y para eso hace falta PHP. Pon su ruta en');
  console.log('    la variable PHP (por ejemplo PHP=/c/xampp/php/php). Sin esta mitad, la comprobación NO dice');
  console.log('    que los valores vuelvan bien: el 2026-09-11 dio verde con 24 fichas deformadas.\n');
} else {
  for (const bloque of ['species', 'habitats', 'pointsOfInterest']) {
    const lista = [...valoresRes.hallazgos.values()].filter(h => h.bloque === bloque)
      .sort((a, b) => Boolean(a.decidido) - Boolean(b.decidido) || b.fichas - a.fichas);
    console.log(`${bloque}`);
    if (!lista.some(h => !h.decidido)) console.log('  ✓ todos los valores vuelven iguales, salvo lo decidido');
    for (const h of lista) {
      if (!h.decidido) deformados++;
      console.log(`  ${h.decidido ? '~' : '✗'} ${h.campo} — ${h.fichas} ficha(s) en ${h.espacios.size} espacio(s)` +
        (h.decidido ? `, DECIDIDO: ${h.decidido}` : ' no vuelven iguales'));
      for (const ej of h.ejemplos) console.log(`      ${ej}`);
    }
    const tabla = Object.keys(BLOQUE_DE_TABLA).find(t => BLOQUE_DE_TABLA[t] === bloque);
    for (const c of [...(valoresRes.sinGenerador[tabla] || [])].sort()) {
      console.log(`  · \`${tabla}.${c}\` — la vuelta la lee y ningún generador de SQL la escribe: vuelve NULL`);
    }
    console.log('');
  }
}

// --- Relleno de lo que el repositorio tiene y la base no ------------------------------------------

function escribeSql(ruta) {
  const l = [];
  let filasEsp = 0, filasHab = 0, filasTips = 0;
  l.push(cabeceraSql(null).trimEnd(), '');
  l.push('-- ' + '='.repeat(96));
  l.push(`-- NaturDex · lo que la ida y vuelta por la API borraba (${HOY}) o deformaba (${HOY_TIPS})`);
  l.push('-- ' + '-'.repeat(96));
  l.push('-- Generado por `node Tools/catalogo-nacional/coteja-ida-y-vuelta.js --sql <ruta>`.');
  l.push('--');
  l.push('-- VA DESPUÉS de `Database/migrations.sql`, que es quien crea las dos columnas y convierte las');
  l.push('-- pistas al formato nuevo:');
  l.push('--   · `species.gbif_occurrences` — el total de la especie EN EL ESPACIO, la huella del');
  l.push('--     filtro de presencia. NO es `species_habitats.gbif_occurrences`, que es el recuento de');
  l.push('--     un solo polígono y ya existía.');
  l.push('--   · `habitats.origen`         — de dónde sale el recinto. Es el campo de procedencia que');
  l.push('--     exige la regla nº 1 del CLAUDE.md, y vivía SOLO en el geojson.');
  l.push('--   · `species.identification_tips` — las pistas de identificación como array JSON. La');
  l.push('--     migración convierte en su sitio lo que la base ya tenía, pero lo tenía unido con «; » y no');
  l.push('--     hay forma de saber qué «;» separaba dos pistas y cuál era de la pista: el murciélago de');
  l.push('--     cueva seguiría con dos. El dato bueno está en el repositorio, y es el que va aquí.');
  l.push('--');
  l.push('-- Se escribe únicamente lo que el repositorio tiene. Una ficha sin `gbifOccurrences` se');
  l.push('-- queda a NULL, que NO es 0: «nadie barrió» y «se barrió y no cayó ninguna» son distintos, y');
  l.push('-- la auditoría de enlaces los trata distinto. Una ficha sin pistas no se toca.');
  l.push('--');
  l.push('-- Idempotente: aplicado dos veces, la segunda escribe los mismos valores.');
  l.push('-- ' + '='.repeat(96), '');
  l.push('START TRANSACTION;', '');

  for (const e of espacios) {
    const esp = (e.doc.species || []).filter(s => typeof s.gbifOccurrences === 'number');
    const hab = ((e.geo && e.geo.features) || [])
      .map(f => f.properties || {})
      .filter(p => p.slug && p.origen);
    const tips = (e.doc.species || []).filter(s => (s.tips || []).length);
    if (!esp.length && !hab.length && !tips.length) continue;
    l.push(`-- ── ${e.slug} ${'─'.repeat(Math.max(0, 56 - e.slug.length))}  ${esp.length} especie(s) · ${hab.length} recinto(s) · ${tips.length} con pistas`);
    for (const s of esp) {
      l.push('UPDATE species sp JOIN parks pk ON pk.id = sp.park_id');
      l.push(`   SET sp.gbif_occurrences = ${sqlNum(s.gbifOccurrences)}`);
      l.push(` WHERE pk.slug = ${sqlStr(e.slug)} AND sp.scientific_name = ${sqlStr(s.scientificName)};`);
      filasEsp++;
    }
    for (const h of hab) {
      l.push('UPDATE habitats hb JOIN parks pk ON pk.id = hb.park_id');
      l.push(`   SET hb.origen = ${sqlStr(h.origen)}`);
      l.push(` WHERE pk.slug = ${sqlStr(e.slug)} AND hb.slug = ${sqlStr(h.slug)};`);
      filasHab++;
    }
    for (const s of tips) {
      l.push('UPDATE species sp JOIN parks pk ON pk.id = sp.park_id');
      l.push(`   SET sp.identification_tips = ${sqlTips(s.tips)}`);
      l.push(` WHERE pk.slug = ${sqlStr(e.slug)} AND sp.scientific_name = ${sqlStr(s.scientificName)};`);
      filasTips++;
    }
    l.push('');
  }
  l.push('COMMIT;', '');
  l.push('-- Comprobación: ninguna de las dos columnas debe quedar vacía donde el repositorio tiene dato,');
  l.push('-- y ninguna pista debe seguir en el formato viejo (texto unido con «;»), que no se puede leer bien.');
  l.push('SELECT COUNT(*) AS especies_sin_ocurrencias FROM species WHERE gbif_occurrences IS NULL;');
  l.push('SELECT COUNT(*) AS recintos_sin_origen FROM habitats WHERE geometry IS NOT NULL AND origen IS NULL;');
  l.push("SELECT COUNT(*) AS pistas_en_formato_viejo FROM species WHERE identification_tips IS NOT NULL AND NOT (JSON_VALID(identification_tips) AND LEFT(identification_tips, 1) = '[');");

  const destino = path.isAbsolute(ruta) ? ruta : path.join(DATABASE, path.basename(ruta));
  fs.writeFileSync(destino, l.join('\n') + '\n', 'utf8');
  console.log(`+ ${rel(destino)} (${filasEsp} especie(s) · ${filasHab} recinto(s) · ${filasTips} ficha(s) con pistas)`);
}

if (SQL) escribeSql(SQL);
if (perdidos) console.log(`⚠ ${perdidos} clave(s) sin columna: la ida y vuelta por la API las borraría.`);
if (deformados) console.log(`⚠ ${deformados} campo(s) que vuelven de la base con otro valor sin que nadie lo haya decidido.`);
if (perdidos || deformados) process.exit(1);
if (valoresRes.error) {
  console.log('⚠ Las claves vuelven, pero los VALORES no se han podido comparar: esto no es un verde.');
  process.exit(2);
}
console.log('✓ Ningún campo del paquete se pierde ni cambia de valor al regenerarlo desde la base.');
