#!/usr/bin/env node
// ================================================================================================
// resuelve-municipio-aemet.js — el municipio de referencia de cada espacio para la predicción del
// tiempo, con su código INE.  (`npm run tiempo:municipios`)
// ------------------------------------------------------------------------------------------------
// EL AGUJERO QUE TAPA: AEMET pide un código INE de 5 dígitos (provincia + municipio, sin dígito de
// control) y en este repositorio ese código NO EXISTE. `park.municipalities` guarda NOMBRES
// (["Águilas", "Lorca"]) y la BD guarda una cadena que `park_payload.php` parte por " y ". Deducir
// el código de una tabla escrita de memoria sería exactamente lo que prohíbe la regla nº 2 del
// CLAUDE.md raíz, así que se resuelve contra el MAESTRO DEL PROPIO AEMET
// (`/api/maestro/municipios`) y se ESCRIBE EN EL DATO: una vez, aquí, y no en cada petición.
//
// UN ESPACIO SON VARIOS MUNICIPIOS, Y NO TIENE «UN TIEMPO». Sierra Espuña son cinco municipios y
// 1.500 m de desnivel; Cabo Cope, 17 km de costa entre dos. Fingir que hay una predicción del
// espacio es peor que no ponerla, así que se elige UNO y **el widget lo dice con su nombre a la
// vista** («Predicción para Águilas»).
//
// CÓMO SE ELIGE, Y POR QUÉ NO ES «EL QUE CONTIENE park.center». Sería lo natural, pero no se puede
// y además no es lo que más ayuda:
//   · No se puede: el maestro de AEMET da un PUNTO por municipio (su capital), no el polígono
//     municipal, y este repositorio no tiene cartografía de municipios. Afirmar «contiene» con un
//     punto sería inventar el dato.
//   · Y no es lo mejor: ese punto es el CASCO URBANO, que es justamente el sitio del que AEMET
//     predice. Entre la capital de un municipio a 30 km y la de otro a 8, la segunda describe mejor
//     el tiempo del espacio aunque el centro del polígono caiga en el primero.
// Así que la regla es: **de los municipios que el propio espacio declara, el de capital más cercana
// a `park.center`**, y la distancia se GUARDA en el dato (`weather.distanciaKm`) para que se pueda
// revisar. Una distancia grande no es un error: es un aviso de que ese espacio merece mirarse.
//
// LO QUE NO CASA SE QUEDA SIN CÓDIGO, Y ENTONCES EL WIDGET NO SE PINTA EN ESE ESPACIO. Hueco
// documentado antes que dato inventado. El informe enumera los nombres que no han casado y por qué.
//
//   node Tools/resuelve-municipio-aemet.js                 # informe, no toca nada
//   node Tools/resuelve-municipio-aemet.js --write --sql Database/parks-tiempo.sql
//   node Tools/resuelve-municipio-aemet.js --cache         # reutiliza el maestro ya descargado
//
// Necesita AEMET_API_KEY en el entorno (la clave la da AEMET por correo tras darse de alta; ver
// DEPLOY.md). Sin ella no hace nada y lo dice: no hay forma legítima de obtener estos códigos sin
// preguntarle a AEMET.
//
// Es IDEMPOTENTE: un segundo pase sobre el mismo maestro no cambia un byte (regla nº 7).
// ================================================================================================

'use strict';
const fs = require('fs');
const path = require('path');
const { arg, flag, die } = require('./lib/cli');
const { OUT_DIR, parkFiles, readJson, readJsonIf, writeJson, rel, fromRoot, escribeEspacio } = require('./lib/io');
const { getBuffer } = require('./lib/http');
const { sqlStr, sqlStrOrNull, sqlNum, cabeceraSql } = require('./lib/sql');

const HOST = 'opendata.aemet.es';
const RUTA_MAESTRO = '/opendata/api/maestro/municipios';
const CACHE_MAESTRO = path.join(OUT_DIR, 'aemet-municipios.json');

// Radio máximo para dar por buena una coincidencia de nombre. No es un criterio de calidad de la
// predicción: es el desempate de HOMÓNIMOS. En España hay municipios que se llaman igual en
// provincias distintas, y el maestro no trae el nombre de la provincia para poder cotejarlo. Un
// municipio de un espacio protegido nunca tiene su capital a más de esto; uno a 300 km es otro
// pueblo con el mismo nombre.
const MAX_KM_HOMONIMO = 80;

const WRITE = flag('write');
const SQL = arg('sql');
const USA_CACHE = flag('cache');

// --- Nombres --------------------------------------------------------------------------------------
// La comparación es por nombre porque es lo único que comparten las dos partes, y por eso hay que
// normalizar los dos lados igual. Se quitan tildes (AEMET escribe «Águilas», y una fuente que las
// pierda por el camino seguiría casando), se unifica el guion de «Torre-Pacheco» y se deshace la
// inversión de artículo con la que los nomencládores oficiales listan «Alcázares, Los».
function normaliza(nombre) {
  let n = String(nombre || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // marcas combinantes: «Águilas» → «aguilas»
    .toLowerCase()
    .replace(/[-–_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const invertido = n.match(/^(.+),\s*(el|la|los|las|l'|els|les|o|a|os|as)$/);
  if (invertido) n = invertido[2] + ' ' + invertido[1];
  return n;
}

// --- Distancia -----------------------------------------------------------------------------------
// Haversine. No está en lib/geo.js porque allí todo trabaja en grados sobre polígonos; aquí hacen
// falta kilómetros entre dos puntos y es lo único que se necesita.
function distanciaKm(a, b) {
  const R = 6371.0088;
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// --- El maestro de AEMET ---------------------------------------------------------------------------
/**
 * Las dos peticiones de AEMET: la primera devuelve un JSON de CONTROL con la URL del dato, y esa
 * segunda respuesta llega en ISO-8859-15. Las dos trampas están explicadas a fondo en
 * Backend/Lib/tiempo_payload.php; aquí se repiten en pequeño porque el tooling no comparte código
 * con el backend. Ojo al `estado` del control: NO es el código HTTP, y AEMET responde 200 con el
 * cuerpo vacío cuando falta la clave.
 */
async function descargaMaestro(apiKey) {
  const control = await getBuffer(HOST, RUTA_MAESTRO, {
    agent: 'resuelve-municipio-aemet', headers: { api_key: apiKey },
  });
  const sobre = JSON.parse(control.buffer.toString('utf8') || 'null');
  if (!sobre || Number(sobre.estado) !== 200 || !sobre.datos) {
    die(`AEMET no ha servido el maestro: estado=${sobre ? sobre.estado : 'sin cuerpo'} ${sobre ? (sobre.descripcion || '') : '(¿api_key ausente o caducada?)'}`);
  }
  const url = new URL(sobre.datos);
  const datos = await getBuffer(url.host, url.pathname + url.search, { agent: 'resuelve-municipio-aemet' });
  // ISO-8859-15: decodificarlo como utf8 no falla, deja «Águilas» en «?guilas» y luego NADA casa.
  const texto = new TextDecoder('iso-8859-15').decode(datos.buffer);
  const lista = JSON.parse(texto);
  if (!Array.isArray(lista) || !lista.length) die('El maestro de municipios ha llegado vacío o con otra forma.');
  return lista;
}

/** Índice normalizado nombre → [{ine, nombre, punto}]. El `id` del maestro es «id30003». */
function indexaMaestro(lista) {
  const indice = new Map();
  let sinCoordenada = 0;
  for (const m of lista) {
    const ine = String(m.id || '').replace(/^id/, '');
    if (!/^\d{5}$/.test(ine)) continue;
    const lat = Number(m.latitud_dec);
    const lon = Number(m.longitud_dec);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) { sinCoordenada++; continue; }
    const clave = normaliza(m.nombre);
    if (!indice.has(clave)) indice.set(clave, []);
    indice.get(clave).push({ ine, nombre: m.nombre, punto: [lat, lon] });
  }
  return { indice, sinCoordenada };
}

// --- Resolución de un espacio -----------------------------------------------------------------------
/**
 * Devuelve { elegido, descartados, fallos }. `elegido` es null si ningún municipio del espacio ha
 * podido resolverse: ese espacio se queda sin widget, dicho y no fingido.
 */
function resuelveEspacio(park, indice) {
  const centro = park.center;
  const candidatos = [];
  const fallos = [];

  for (const nombre of (park.municipalities || [])) {
    const posibles = indice.get(normaliza(nombre)) || [];
    if (!posibles.length) { fallos.push({ nombre, motivo: 'no figura en el maestro de AEMET con ese nombre' }); continue; }
    const cerca = posibles
      .map(p => ({ ...p, km: distanciaKm(centro, p.punto) }))
      .filter(p => p.km <= MAX_KM_HOMONIMO)
      .sort((a, b) => a.km - b.km);
    if (!cerca.length) {
      const masCerca = posibles.map(p => distanciaKm(centro, p.punto)).sort((a, b) => a - b)[0];
      fallos.push({ nombre, motivo: `figura ${posibles.length} vez(ces) pero la más cercana está a ${masCerca.toFixed(0)} km del centro del espacio: es un homónimo` });
      continue;
    }
    // Dos municipios con el mismo nombre A MENOS de 80 km es un caso que no se adivina: se dice.
    if (cerca.length > 1 && cerca[1].km - cerca[0].km < 5) {
      fallos.push({ nombre, motivo: `ambiguo: ${cerca.slice(0, 2).map(c => c.ine + ' a ' + c.km.toFixed(0) + ' km').join(' y ')}` });
      continue;
    }
    // `nombre` es el del espacio y va el ÚLTIMO a propósito: el objeto de `cerca[0]` trae el del
    // maestro con la misma clave y lo pisaría (ver el porqué donde se compone `weather`).
    candidatos.push({ ...cerca[0], nombreAemet: cerca[0].nombre, nombre });
  }

  candidatos.sort((a, b) => a.km - b.km);
  return { elegido: candidatos[0] || null, descartados: candidatos.slice(1), fallos };
}

// --- Programa ------------------------------------------------------------------------------------
(async function main() {
  const apiKey = process.env.AEMET_API_KEY;
  let lista = USA_CACHE ? readJsonIf(CACHE_MAESTRO, null) : null;

  if (!lista) {
    if (!apiKey) {
      die('Falta AEMET_API_KEY en el entorno. La clave la da AEMET por correo tras darse de alta en\n' +
          'https://opendata.aemet.es/centrodedescargas/obtencionAPIKey (ver DEPLOY.md).\n' +
          'Con el maestro ya descargado, `--cache` no necesita clave.');
    }
    console.log('Descargando el maestro de municipios de AEMET…');
    lista = await descargaMaestro(apiKey);
    writeJson(CACHE_MAESTRO, lista);
    console.log(`  ${lista.length} municipios · copia en ${rel(CACHE_MAESTRO)}`);
  } else {
    console.log(`Maestro reutilizado de ${rel(CACHE_MAESTRO)} (${lista.length} municipios).`);
  }

  const { indice, sinCoordenada } = indexaMaestro(lista);
  if (sinCoordenada) console.log(`  aviso: ${sinCoordenada} municipios del maestro llegan sin coordenada y no se han indexado.`);

  const fecha = new Date().toISOString().slice(0, 10);
  const filasSql = [];
  const sinResolver = [];
  const huecos = [];
  let escritos = 0, iguales = 0;

  for (const { file, dir } of parkFiles()) {
    const doc = readJson(file);
    const park = doc.park || {};
    const { elegido, descartados, fallos } = resuelveEspacio(park, indice);
    fallos.forEach(f => huecos.push({ slug: park.slug, ...f }));

    if (!elegido) {
      sinResolver.push(park.slug);
      console.log(`  ✗ ${park.slug}: sin municipio resuelto — este espacio no pintará el widget del tiempo`);
      continue;
    }

    // El nombre que se guarda es el que declara el ESPACIO («La Unión»), no el del maestro
    // («Unión, La»): es el que se va a leer en la cabecera y el mismo con el que la ficha del
    // espacio ya lista sus municipios. El literal de AEMET va en `fuente`, que es donde importa
    // para poder rehacer la casación.
    const weather = {
      municipio: elegido.nombre,
      ine: elegido.ine,
      distanciaKm: Math.round(elegido.km * 10) / 10,
      fuente: `AEMET OpenData · /api/maestro/municipios «${elegido.nombreAemet}» (resuelto el ${fecha})`,
    };
    // La `fuente` lleva la fecha, así que reescribirla cada día produciría un diff diario sin dato
    // nuevo y subiría la versión del manifiesto por nada (regla nº 7). Solo se toca si el CÓDIGO o
    // el municipio han cambiado de verdad.
    const previo = park.weather || null;
    if (previo && previo.ine === weather.ine && previo.municipio === weather.municipio
        && previo.distanciaKm === weather.distanciaKm) {
      iguales++;
    } else {
      doc.park = { ...park, weather };
      const res = escribeEspacio({ dir, file, doc, write: WRITE });
      if (res.cambia) escritos++;
      res.lineas.forEach(l => console.log('  ' + l));
    }

    const otros = descartados.length ? ` (también: ${descartados.map(d => d.nombre).join(', ')})` : '';
    console.log(`  · ${park.slug} → ${elegido.nombre} [${elegido.ine}] a ${weather.distanciaKm} km${otros}`);

    filasSql.push(
      `UPDATE parks SET weather_ine_code = ${sqlStr(weather.ine)}, ` +
      `weather_municipality = ${sqlStr(weather.municipio)}, ` +
      `weather_distance_km = ${sqlNum(weather.distanciaKm)}, ` +
      `weather_source = ${sqlStrOrNull(weather.fuente)} ` +
      `WHERE slug = ${sqlStr(park.slug)};`
    );
  }

  if (SQL && filasSql.length) {
    const destino = fromRoot(SQL);
    const cabecera = [
      '-- ================================================================================================',
      '-- parks-tiempo.sql — municipio de referencia para la predicción de AEMET, espacio a espacio.',
      '-- GENERADO por Tools/resuelve-municipio-aemet.js. No editar a mano.',
      '-- ------------------------------------------------------------------------------------------------',
      '-- La API tiene prioridad sobre el park.json empaquetado: sin aplicar esto a la base, en un',
      '-- despliegue con backend el widget del tiempo no se pinta aunque el código esté en el repositorio.',
      '-- Requiere las columnas de Database/migrations.sql (weather_*).',
      `-- Generado el ${fecha}.`,
      '-- ================================================================================================',
      '',
      // cabeceraSql() no es decorativa: fija SET NAMES utf8mb4, y sin ella el cliente `mysql` de un
      // contenedor sin locale mete «Águilas» como «Ãguilas» sin dar un solo error (ver lib/sql.js).
      cabeceraSql(null),
    ].join('\n');
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, cabecera + filasSql.join('\n') + '\n', 'utf8');
    console.log(`\nSQL: ${rel(destino)} (${filasSql.length} espacios)`);
  }

  console.log(`\nResumen: ${filasSql.length} espacio(s) con municipio · ${iguales} ya estaban al día · ` +
              `${escritos} ${WRITE ? 'escritos' : 'se escribirían'} · ${sinResolver.length} sin resolver`);
  if (huecos.length) {
    console.log('\nNombres que NO han casado (se quedan sin código, y eso es lo correcto):');
    huecos.forEach(h => console.log(`  · ${h.slug} · «${h.nombre}»: ${h.motivo}`));
  }
  if (!WRITE) console.log('\nModo informe: no se ha tocado nada. Añade --write para escribir.');
})().catch(e => die(String((e && e.message) || e)));
