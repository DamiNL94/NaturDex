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
//
// Cada entrada es `[host, para qué sirve]` y admite un TERCER elemento opcional: la ruta por la que
// preguntar cuando la raíz del host no representa al servicio que de verdad se usa. Sin proxy la
// sonda va a esa ruta, así que se mide lo que va a llamar la herramienta y no la portada.
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
  // Un host, DOS servicios, y el segundo se descubrió tarde: además de EIDOS (`/api/especie/`), el
  // IEPNB sirve el «Servicio Web de la Red Natura 2000» (`/api/rn2000/`), que es de donde salen las
  // secciones 3.2 y 3.3 del Formulario Normalizado de Datos de cada sitio: la lista OFICIAL de
  // especies por `site_code`. El README daba esa lista por Discodata/BISE (`discodata.eea.europa.eu`),
  // que esta política de egreso rechaza con un 403 al CONNECT — y por eso 366 fichas de ave llevaban
  // una nota pidiendo contrastar contra una fuente inalcanzable. No hace falta abrir la EEA: el dato
  // es nacional y lo publica MITECO en este mismo host (2026-08-15).
  //
  // TERCER ELEMENTO = ruta de sonda, y esta entrada es el motivo de que exista. La raíz de
  // `iepnb.gob.es` es el PORTAL para personas y tarda ~10 s en contestar; la API contesta en 100 ms.
  // Preguntando por la raíz con un límite de 6 s este informe daba EIDOS por **cerrado** teniendo la
  // fuente principal del proyecto perfectamente disponible (2026-09-15). Es el peor error que puede
  // cometer un comprobador: un falso CERRADO no se nota como un fallo, se nota como una sesión que
  // renuncia sola a la mitad del trabajo y lo justifica enseñando un informe en rojo.
  ['iepnb.gob.es',                 'EIDOS (taxonomía, UICN y estado legal) y Red Natura 2000 (especies oficiales por sitio)', '/api/especie/v_nombrescomunes?limit=1'],
  ['geoportal.imida.es',           'límites oficiales de los espacios (n1:build, n1:refina)'],
  // La ÚNICA fuente que consulta el backend en vivo: todo lo demás de esta lista lo llama el
  // tooling. Cerrado, se caen dos cosas distintas: `tiempo:municipios` no puede resolver el código
  // INE de ningún espacio (y sin código no hay widget), y Backend/Api/tiempo.php responde 503, con
  // lo que el widget del tiempo no se pinta. Ninguna de las dos rompe nada más: el tiempo es una
  // mejora y la app funciona igual sin él. Necesita AEMET_API_KEY, que no da esta comprobación.
  ['opendata.aemet.es',            'predicción municipal del espacio (Api/tiempo.php) y el maestro de municipios con los códigos INE'],
  // Faltaba desde el principio, y es la fuente de la Capa 2 entera: de aquí salen el shapefile del
  // Atlas de Hábitats 2005 y su tabla de datos, una descarga por provincia. Sin él, `habitats:build`
  // no tiene con qué trabajar y el informe daba «todo abierto» igualmente (destapado el 2026-08-15,
  // al empezar Sierra de El Carche).
  ['www.miteco.gob.es',            'cartografía de hábitats (Atlas 2005 y HIC 1997) por provincia'],
  // El IELIG son DOS hosts y hay que preguntar por los dos. `info.igme.es` sirve el visor, que es
  // HTML y no tiene los datos; las fichas de LIG salen del ArcGIS de `mapas.igme.es`. Con solo el
  // primero, el informe daba el IELIG por abierto y la cascada de POIs se estrellaba con un 403 del
  // proxy a mitad de sesión (pasó el 2026-08-10 en Carrascoy).
  ['info.igme.es',                 'IELIG: visor de lugares de interés geológico'],
  ['mapas.igme.es',                'IELIG: el servicio con las fichas de LIG (cascada de POIs)'],
  ['murcianatural.carm.es',        'fichas y cartografía del organismo gestor'],
  ['www.borm.es',                  'PORN y PRUG publicados'],
  // Portal de turismo de la CARM. Es la vía 5 de la cascada de POIs —contexto para redactar— y en
  // la costa es la ÚNICA fuente que pone un hecho detrás de cada cala: OpenStreetMap las etiqueta
  // con su página de aquí (`website=`) y su elemento de Wikidata, y sin ella una cala se queda en un
  // topónimo suelto del §4.1. Registrado el 2026-08-22 al cerrar el N3 de Sierra de las Moreras,
  // donde seis calas se quedaron fuera por esto: hoy responde **403 en el CONNECT**, así que está
  // fuera de la política de egreso. No es el 302 antibot de Radware que dan `www.carm.es` y
  // `murcianatural`: aquí el rechazo es del propio host, y por eso se anota como hueco y no como algo
  // que se pueda reintentar.
  ['www.turismoregiondemurcia.es', 'portal de turismo de la CARM: la ficha oficial de cada playa y cala (vía 5 de POIs)'],
  // Redes geodésicas del IGN. Un vértice geodésico es de las pocas cosas que ponen un HECHO oficial
  // detrás de una cumbre —nombre, altitud y reseña, publicados—, y sin eso un pico es un topónimo
  // suelto del §4.1. Los dos hosts responden **403 en el CONNECT** (probado el 2026-08-22, cerrando
  // el N3 de Sierra de las Moreras). Se salvó por Wikidata, que replica el código del vértice
  // (P528), su altitud (P2044) y el enlace a la reseña (P973): es un SUSTITUTO y así consta en el
  // `source` del POI, igual que se hace con el P808 de los BIC.
  ['api-features.ign.es',         'IGN: redes geodésicas (Red ROI, REDNAP) por identificador'],
  ['datos-geodesia.ign.es',       'IGN: la reseña en PDF de cada vértice geodésico'],

  // --- Vía 3 de la cascada de POIs: BIC y patrimonio ---------------------------------------------
  // Era la ÚNICA de las seis vías del §4.2 sin host registrado aquí, y se notaba: cuatro espacios
  // (Carrascoy, Sierra de la Pila, El Carche y Sierra de Salinas) la dieron por «bloqueada» contra
  // hosts que cada sesión escribía de memoria, sin que constara en ninguna parte cuáles eran los
  // buenos. Registrarlos convierte «bloqueado» en un estado comprobable en diez segundos.
  //
  // El portal de la CARM (`www.carm.es`) NO se consulta: responde 302 a `validate.perfdrive.com`,
  // un gestor de bots de Radware. Es el portal para personas y no se intenta rodear. La misma
  // información sale del canal de datos abiertos, que es el que sí está pensado para máquinas.
  ['datos.gob.es',                 'catálogo de datos abiertos: localiza el fichero de patrimonio de cada comunidad (API /apidata/)'],
  // OJO: `datos.gob.es` publica la accessURL de este fichero en **http**, y por ahí el proxy
  // responde «Host not in allowlist». La descarga hay que pedirla en https (2026-08-15).
  ['nexo.carm.es',                 'datos abiertos de la CARM: «Monumentos en la Región de Murcia» en json/csv/rdf (vía 3 de POIs)'],
  // Dos hosts, y ninguno de los dos da el dato — pero por motivos DISTINTOS, y la diferencia
  // importa (2026-08-15, Monte Arabí):
  //   · `www.culturaydeporte.gob.es` es el dominio VIEJO: contesta 301 a `www.cultura.gob.es`.
  //     Registrado solo él, este informe daba el registro de BIC por «abierto» sin que ninguna ruta
  //     útil llegara a ninguna parte.
  //   · `www.cultura.gob.es` sí está permitido —el CONNECT devuelve 200— y aun así no se puede
  //     leer: su certificado lo emite la **FNMT-RCM (AC Componentes Informáticos)**, la CA de la
  //     administración española, y el servidor manda solo la hoja, sin la intermedia. La cadena no
  //     valida contra el bundle estándar. Eso NO se arregla desactivando la verificación: se
  //     arregla añadiendo la CA de la FNMT al entorno. Mientras no esté, la vía 3 estatal es un
  //     hueco de CONFIANZA, no de egreso, y así hay que escribirlo en el informe.
  // Este chequeo mira el CONNECT, así que a los dos los dará por abiertos: son el ejemplo de que
  // «abierto» y «sirve el dato» no son lo mismo.
  ['www.culturaydeporte.gob.es',   'registro estatal de BIC: dominio VIEJO, solo devuelve 301 al nuevo'],
  ['www.cultura.gob.es',           'registro estatal de BIC (dominio actual). Permitido, pero su cadena TLS (FNMT-RCM) no valida'],
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
async function directo(host, ruta) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('https://' + host + (ruta || '/'), { method: 'HEAD', redirect: 'manual', signal: ctrl.signal });
    if (res.status === 403) return { ok: false, detalle: 'HTTP 403 (probable denegación de política)' };
    return { ok: true, detalle: 'HTTP ' + res.status };
  } catch (err) {
    return { ok: false, detalle: err.name === 'AbortError' ? 'sin respuesta en ' + (TIMEOUT_MS / 1000) + ' s' : (err.cause?.code || err.message) };
  } finally {
    clearTimeout(t);
  }
}

const alcanzable = (host, ruta) => (proxy ? porConnect(host) : directo(host, ruta));

async function main() {
  const resultados = await Promise.all(HOSTS.map(async ([host, para, ruta]) => ({ host, para, ...await alcanzable(host, ruta) })));

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
