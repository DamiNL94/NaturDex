#!/usr/bin/env node
// ================================================================================================
// check-egress.js — ¿a qué fuentes externas llega esta sesión?  (`npm run red:check`)
// ------------------------------------------------------------------------------------------------
// Por qué existe: casi ninguna herramienta de este repo trabaja solo con lo que hay en disco. Las
// fotos vienen de Wikimedia, las ocurrencias de GBIF, la taxonomía de EIDOS/IEPNB, los senderos y
// los POIs de Overpass, los límites del IMIDA y las teselas de Protomaps. En una sesión remota de
// Claude Code el tráfico saliente pasa por un proxy de política de egreso, y si el destino no está
// permitido la pasarela contesta 403 al CONNECT: la herramienta se queda colgada o falla con un
// error de red que no explica nada.
//
// Averiguarlo a base de ejecutar herramientas cuesta media hora. Esto lo dice en diez segundos, y
// además al lado de cada host pone QUÉ deja de funcionar si está cerrado, que es la información
// que de verdad hace falta para decidir si merece la pena abrir la sesión o pedir un cambio de
// política.
//
//   node Tools/check-egress.js            (tabla completa)
//   node Tools/check-egress.js --allowlist  (solo la lista de hosts, para pegar en los ajustes)
//
// No es un test: no falla nunca. Un host cerrado es un dato, no un error del repo.
// ================================================================================================

'use strict';
const { flag } = require('./lib/cli');

// Los hosts salen de lo que llama de verdad el código de Tools/ y Backend/. Si añades una fuente
// nueva a una herramienta, añádela aquí: es el único sitio donde está escrito de qué depende el
// proyecto para funcionar con red.
const HOSTS = [
  ['registry.npmjs.org',           'npm install (raíz y AdminPanel)'],
  ['pypi.org',                     'utilidades puntuales de Python'],
  ['github.com',                   'git push/pull'],
  ['commons.wikimedia.org',        'fotos de especies, hábitats, invasoras y POIs'],
  ['upload.wikimedia.org',         'descarga de las fotos ya resueltas'],
  ['www.wikidata.org',             'ancla P225 de la resolución de fotos por taxón'],
  ['es.wikipedia.org',             'imagen principal y nombres comunes'],
  ['overpass-api.de',              'senderos (trails:build) y POIs (pois:build)'],
  ['overpass.openstreetmap.fr',    'mirror de Overpass'],
  ['api.gbif.org',                 'ocurrencias por hábitat (gbif:habitats) y fotos de campo'],
  ['iepnb.gob.es',                 'EIDOS: taxonomía, UICN y estado legal'],
  ['geoportal.imida.es',           'límites oficiales de los espacios (n1:build, n1:refina)'],
  // El IELIG son DOS hosts y hay que preguntar por los dos. `info.igme.es` sirve el visor, que es
  // HTML y no tiene los datos; las fichas de LIG salen del ArcGIS de `mapas.igme.es`. Con solo el
  // primero, el informe daba el IELIG por abierto y la cascada de POIs se estrellaba con un 403 del
  // proxy a mitad de sesión (pasó el 2026-08-10 en Carrascoy).
  ['info.igme.es',                 'IELIG: visor de lugares de interés geológico'],
  ['mapas.igme.es',                'IELIG: el servicio con las fichas de LIG (cascada de POIs)'],
  ['murcianatural.carm.es',        'fichas y cartografía del organismo gestor'],
  ['www.borm.es',                  'PORN y PRUG publicados'],
  ['build.protomaps.com',          'mapa base sin conexión (tiles:build)'],
  ['build-metadata.protomaps.dev', 'versión del build de Protomaps'],

  // --- Fotos de POI, segunda vuelta -------------------------------------------------------------
  // Wikimedia Commons es la fuente primaria y resuelve la mayoría, pero se agota rápido en espacios
  // con poca cobertura: en Carrascoy y El Valle, 13 de 21 POIs se quedaron sin foto con la categoría
  // del espacio, geosearch y buscador ya recorridos (2026-08-11). Estos seis repositorios sirven
  // material con licencia de la lista blanca del §4.6 y son la vuelta siguiente. Ninguno es
  // necesario para que el pipeline funcione: si están cerrados, el hueco se documenta y ya está.
  ['www.flickr.com',               'fotos de POI: buscador de Flickr (filtro de licencia CC)'],
  ['api.flickr.com',               'fotos de POI: API de Flickr (flickr.photos.search, necesita api_key)'],
  ['api.openverse.org',            'fotos de POI: Openverse, agregador CC (sin clave para uso básico)'],
  ['graph.mapillary.com',          'fotos de POI: Mapillary, imagen a pie de calle CC BY-SA 4.0 (necesita token)'],
  ['api.europeana.eu',             'fotos de POI: Europeana, patrimonio digitalizado (necesita wskey)'],
  ['www.geograph.org.uk',          'fotos de POI: Geograph, fotografía geolocalizada CC BY-SA'],
  ['api.inaturalist.org',          'fotos de POI y de especies: iNaturalist (ojo: mucho CC BY-NC, que NO entra)'],
];

const http = require('http');

const TIMEOUT_MS = 6000;

const green = s => '\x1b[32m' + s + '\x1b[0m';
const red = s => '\x1b[31m' + s + '\x1b[0m';
const dim = s => '\x1b[2m' + s + '\x1b[0m';

// OJO con la forma de preguntar, que la primera versión de este script se equivocó justo aquí.
//
// El `fetch` incorporado de Node NO lee HTTPS_PROXY (lo dice el propio README del proxy). Sale por
// donde puede, se topa con la intercepción y recibe un 403… que un comprobador ingenuo interpreta
// como "el servidor contestó, luego el host está abierto". Daba los diecisiete en verde estando
// todos cerrados, que es peor que no comprobar nada.
//
// La pregunta correcta es la que se le hace al proxy: un CONNECT al host. Si contesta 200 abre el
// túnel y el destino está permitido; si contesta 403 lo está denegando la política. Eso es exacto y
// no se puede confundir con la respuesta del servicio de destino.
const proxy = (() => {
  const raw = process.env.HTTPS_PROXY || process.env.https_proxy || '';
  try { return raw ? new URL(raw) : null; } catch { return null; }
})();

function porConnect(host) {
  return new Promise(resolve => {
    const req = http.request({
      host: proxy.hostname, port: proxy.port || 80, method: 'CONNECT',
      path: host + ':443', headers: { Host: host + ':443' }, timeout: TIMEOUT_MS,
    });
    req.on('connect', (res, socket) => {
      socket.destroy();
      resolve(res.statusCode === 200
        ? { ok: true, detalle: 'CONNECT 200' }
        : { ok: false, detalle: 'denegado por la política (CONNECT ' + res.statusCode + ')' });
    });
    // El proxy respondió sin abrir túnel: también es una denegación.
    req.on('response', res => { resolve({ ok: false, detalle: 'denegado por la política (HTTP ' + res.statusCode + ')' }); req.destroy(); });
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, detalle: 'el proxy no responde en ' + (TIMEOUT_MS / 1000) + ' s' }); });
    req.on('error', err => resolve({ ok: false, detalle: err.code || err.message }));
    req.end();
  });
}

// Sin proxy configurado —una máquina de desarrollo normal— basta con llamar al host. Aquí un 403 a
// un HEAD de la raíz se marca como cerrado igualmente: puede ser del servicio, pero lo habitual es
// que sea una intercepción, y en cualquiera de los dos casos la herramienta que lo necesita no va a
// funcionar. Se dice "probable" porque no hay forma de distinguirlo desde fuera.
async function directo(host) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('https://' + host + '/', { method: 'HEAD', redirect: 'manual', signal: ctrl.signal });
    if (res.status === 403) return { ok: false, detalle: 'HTTP 403 (probable denegación de política)' };
    return { ok: true, detalle: 'HTTP ' + res.status };
  } catch (err) {
    return { ok: false, detalle: err.name === 'AbortError' ? 'sin respuesta en ' + (TIMEOUT_MS / 1000) + ' s' : (err.cause?.code || err.message) };
  } finally {
    clearTimeout(t);
  }
}

const alcanzable = host => (proxy ? porConnect(host) : directo(host));

async function main() {
  const resultados = await Promise.all(HOSTS.map(async ([host, para]) => ({ host, para, ...await alcanzable(host) })));

  if (flag('allowlist')) {
    // Para pegar en los ajustes del entorno: solo lo que hoy está cerrado.
    for (const r of resultados) if (!r.ok) console.log(r.host);
    return;
  }

  const ancho = Math.max(...HOSTS.map(h => h[0].length));
  console.log('\nFuentes externas que necesita NaturDex');
  console.log(dim(proxy ? '(preguntando por CONNECT a ' + proxy.host + ')' : '(sin proxy configurado: conexión directa)') + '\n');
  for (const r of resultados) {
    const marca = r.ok ? green('✓ abierto ') : red('✗ cerrado ');
    console.log('  ' + marca + r.host.padEnd(ancho + 2) + dim(r.para) + (r.ok ? '' : dim(' — ' + r.detalle)));
  }

  const cerrados = resultados.filter(r => !r.ok);
  console.log('');
  if (!cerrados.length) {
    console.log(green('Todo abierto: se puede ejecutar cualquier herramienta del repo.'));
    return;
  }
  console.log(red(cerrados.length + ' de ' + resultados.length + ' cerrados.') +
    ' Las herramientas de la columna de la derecha no funcionarán en esta sesión.');
  console.log(dim('La política de egreso se elige al crear el entorno, no desde aquí. Para cambiarla:'));
  console.log(dim('  https://code.claude.com/docs/en/claude-code-on-the-web'));
  console.log(dim('Lista para pegar en los ajustes:  node Tools/check-egress.js --allowlist'));
}

main();
