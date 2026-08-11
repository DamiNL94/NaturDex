#!/usr/bin/env node
/*
 * poi-images-alt.js — foto de un punto de interés cuando Wikimedia Commons ya se ha agotado.
 *
 * Qué problema resuelve
 * ---------------------
 * `poi-images.js` ancla la búsqueda en la CATEGORÍA DE COMMONS DEL ESPACIO, y ese ancla es lo que
 * hace fiable el resultado: un archivo dentro de `Category:Sierra de Carrascoy` está, por
 * construcción, en el espacio. El problema es que en un espacio con poca cobertura fotográfica esa
 * categoría simplemente no tiene la foto. El caso que motiva este script está medido: **Carrascoy y
 * El Valle cerró su N3 con 13 de 21 POIs sin foto** después de recorrer las tres vías de Commons, la
 * categoría de Wiki Loves Earth del LIC ES6200002 y las 42 subidas del único colaborador que ha
 * fotografiado el parque. No quedaba nada que mirar *ahí*.
 *
 * Este script recorre las fuentes de material libre de FUERA de Wikimedia, por el orden de utilidad
 * esperada que documenta `README.md` §«Cuando Commons se agota».
 *
 * Lo que se pierde al salir de Commons, y cómo se compensa
 * -------------------------------------------------------
 * Fuera de Commons **no existe la categoría del espacio**, que era la garantía del *dónde*. Por eso:
 *
 *   · Todo lo que sale de aquí es `needsReview` POR DEFINICIÓN, y por tanto **no se escribe** sin
 *     `--force`. No es prudencia decorativa: es la única puerta que queda cuando el sitio ya no lo
 *     garantiza una categoría, y la tiene que cruzar una persona mirando la foto.
 *   · Flickr y Mapillary buscan **por coordenada** (bbox), así que en esas dos el *dónde* vuelve a
 *     estar resuelto y queda solo el *qué*. Son, por eso, las dos que más aportan.
 *   · Openverse y Europeana solo buscan por texto, así que además del filtro de licencia se les
 *     exige la **mención del topónimo** en el título, con el mismo `mencionaSitio` que Commons.
 *
 * La puerta de la LICENCIA no se relaja por cambiar de fuente: sigue siendo lista blanca —CC0,
 * dominio público, CC BY y CC BY-SA— y la aplica el mismo `licenciaLibre` que `poi-images.js`, que
 * es de donde se importa a propósito, para que no haya dos listas que puedan divergir. La foto se
 * empaqueta en la descarga sin conexión del parque: una NC o una ND ahí es un problema legal, no una
 * imperfección.
 *
 * Claves de API: se leen del entorno, y su ausencia se INFORMA
 * -----------------------------------------------------------
 * Flickr y Mapillary —las dos que buscan por coordenada— exigen credencial. Cuando falta, la fuente
 * no se salta en silencio: sale en el informe como «no disponible: falta FLICKR_API_KEY». Que un POI
 * se quede sin foto porque nadie la ha hecho y que se quede sin foto porque no había clave son dos
 * cosas distintas, y el informe tiene que poder distinguirlas.
 *
 *   FLICKR_API_KEY     · https://www.flickr.com/services/apps/create/apply (gratuita)
 *   MAPILLARY_TOKEN    · https://www.mapillary.com/dashboard/developers (gratuita)
 *   EUROPEANA_WSKEY    · https://pro.europeana.eu/page/get-api (gratuita).
 *                        Sin ella se usa `api2demo`, la clave pública de pruebas de Europeana, que
 *                        responde pero está limitada y no sirve para un barrido grande.
 *
 * Uso
 * ---
 *   node Tools/catalogo-nacional/poi-images-alt.js --park carrascoy-y-el-valle --report Docs/fotos-poi-alt.md
 *   node Tools/catalogo-nacional/poi-images-alt.js --park carrascoy-y-el-valle --write --force --sql Database/poi-imagenes-alt.sql
 *
 * Opciones: --park <slug> (por defecto, todos), --all (mira también los POIs que ya tienen foto),
 *           --radio <m> (lado del bbox de Flickr/Mapillary, 400 por defecto), --inat (activa
 *           iNaturalist, que por defecto no se consulta), --write, --force, --sql <fichero>,
 *           --report <fichero>, --dry-run.
 *
 * `--sql` hace falta porque `Frontend/Js/data.js` da prioridad a la respuesta de la API sobre el
 * `park.json` empaquetado: sin cargar la BD, un despliegue con backend seguiría sirviendo lo viejo.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const { getJson } = require('../lib/http');
const { loads } = require('../lib/wikimedia');
const { sqlStr } = require('../lib/sql');
const { arg, flag, num, sleep } = require('../lib/cli');
const { parkFiles, readJson, fromRoot, rel } = require('../lib/io');

// La lista blanca de licencias y el gate del topónimo se IMPORTAN, no se copian: son las dos
// decisiones que no pueden divergir entre la cadena de Commons y esta. `poi-images.js` protege su
// `main()` con `require.main === module`, así que requerirlo aquí no ejecuta nada.
const { licenciaLibre, mencionaSitio, conCredito } = require('./poi-images');

const OPT = {
  park: arg('park', null),
  radio: num('radio', 400),
  all: flag('all'),
  inat: flag('inat'),
  write: flag('write'),
  force: flag('force'),
  sql: arg('sql', null),
  report: arg('report', null),
  dryRun: flag('dry-run'),
};

const sentencias = [];

const red = s => '\x1b[31m' + s + '\x1b[0m';
const green = s => '\x1b[32m' + s + '\x1b[0m';
const yellow = s => '\x1b[33m' + s + '\x1b[0m';
const dim = s => '\x1b[2m' + s + '\x1b[0m';

const AGENTE = 'poi-images-alt';

// --- Licencias de cada fuente -------------------------------------------------------------------
// Cada API nombra las licencias a su manera. Se traducen todas al MISMO texto canónico («CC BY-SA
// 4.0», «CC0», «Dominio público») antes de pasarlas por `licenciaLibre`, porque la lista blanca está
// escrita para ese texto y no para siete dialectos distintos.

/** Openverse: `license` = 'by' | 'by-sa' | 'cc0' | 'pdm'…, `license_version` = '2.0'. */
function licenciaOpenverse(codigo, version) {
  const c = String(codigo || '').toLowerCase();
  if (c === 'cc0') return 'CC0';
  if (c === 'pdm') return 'Dominio público';
  return ('CC ' + c.toUpperCase() + (version ? ' ' + version : '')).trim();
}

// Flickr numera sus licencias. Solo entran estas cinco; el resto (NC en cualquiera de sus formas,
// ND, y la «All Rights Reserved» que es el 0) ni se piden ni se aceptan.
const FLICKR_LICENCIAS = {
  4: 'CC BY 2.0',
  5: 'CC BY-SA 2.0',
  7: 'Dominio público',        // "No known copyright restrictions"
  9: 'CC0',
  10: 'Dominio público',       // "Public Domain Mark"
};

/** Europeana declara los derechos con la URL de la licencia. */
function licenciaEuropeana(url) {
  const u = String(url || '').toLowerCase();
  if (u.includes('publicdomain/zero')) return 'CC0';
  if (u.includes('publicdomain/mark') || u.includes('rightsstatements.org/vocab/noc')) return 'Dominio público';
  const m = u.match(/licenses\/(by(?:-sa)?)\/(\d(?:\.\d)?)/);
  if (m) return 'CC ' + m[1].toUpperCase() + ' ' + m[2];
  return 'licencia sin especificar';
}

/** iNaturalist: 'cc0' | 'cc-by' | 'cc-by-sa' | 'cc-by-nc'… */
function licenciaInat(codigo) {
  const c = String(codigo || '').toLowerCase();
  if (c === 'cc0') return 'CC0';
  return c.replace(/^cc-/, 'CC ').toUpperCase().replace('CC BY', 'CC BY');
}

// --- Geometría del bbox --------------------------------------------------------------------------
// Un cuadrado de lado `2*radio` alrededor del POI. El grado de longitud se encoge con el coseno de
// la latitud: a 38° N un grado de longitud son ~88 km y uno de latitud ~111 km, así que usar el
// mismo delta en los dos ejes daría un rectángulo un 26 % más ancho de lo pedido.
function bbox(lat, lon, radioM) {
  const dLat = radioM / 111320;
  const dLon = radioM / (111320 * Math.cos(lat * Math.PI / 180));
  return { w: lon - dLon, s: lat - dLat, e: lon + dLon, n: lat + dLat };
}

// --- Fuente 1 · Openverse -------------------------------------------------------------------------
// Agregador: una consulta cubre Flickr, Commons, museos y más. Es la primera parada por eso. Su
// pega es que solo busca por texto y con bastante manga ancha —una consulta por «Parque Regional El
// Valle» devuelve un parque de Madrid y otro de Perú—, así que el filtro de topónimo es obligatorio.
async function enOpenverse(poi, contexto) {
  const q = encodeURIComponent(`${poi.name} ${contexto}`);
  const j = await getJson('api.openverse.org',
    `/v1/images/?q=${q}&license=cc0,by,by-sa,pdm&page_size=20`, { agent: AGENTE });
  const out = [];
  for (const r of (j.results || [])) {
    const licencia = licenciaOpenverse(r.license, r.license_version);
    if (!licenciaLibre(licencia)) continue;
    if (!mencionaSitio(r.title || '', poi.name)) continue;
    out.push({
      fuente: 'Openverse', url: r.url, titulo: r.title || '',
      autor: r.creator || 'autor no indicado', licencia,
      via: `Openverse (proveedor: ${r.source || '?'})`, ficha: r.foreign_landing_url || '',
    });
  }
  return out;
}

// --- Fuente 2 · Flickr ----------------------------------------------------------------------------
// El fondo más grande de fotografía de paisaje y patrimonio español, y —lo que importa— busca por
// BBOX. Una foto dentro del bbox del POI tiene el *dónde* resuelto igual que el geosearch de
// Commons, así que aquí NO se exige la mención del topónimo: se exigiría en vano, porque en Flickr
// los títulos son libres («Un canto rojo») y perderíamos las buenas.
async function enFlickr(poi, apiKey) {
  const [lat, lon] = poi.coordinates;
  const b = bbox(lat, lon, OPT.radio);
  const j = await getJson('api.flickr.com',
    `/services/rest/?method=flickr.photos.search&api_key=${encodeURIComponent(apiKey)}` +
    `&format=json&nojsoncallback=1&bbox=${b.w},${b.s},${b.e},${b.n}` +
    `&license=${Object.keys(FLICKR_LICENCIAS).join(',')}&extras=license,owner_name,url_l,url_c&per_page=50`,
    { agent: AGENTE });
  if (j.stat !== 'ok') throw new Error('Flickr: ' + (j.message || JSON.stringify(j).slice(0, 120)));
  const out = [];
  for (const p of (j.photos?.photo || [])) {
    const licencia = FLICKR_LICENCIAS[Number(p.license)];
    if (!licencia || !licenciaLibre(licencia)) continue;
    const url = p.url_l || p.url_c;
    if (!url) continue;
    out.push({
      fuente: 'Flickr', url, titulo: p.title || '',
      autor: p.ownername || 'autor no indicado', licencia,
      via: `Flickr (bbox de ${OPT.radio} m)`, ficha: `https://www.flickr.com/photos/${p.owner}/${p.id}`,
    });
  }
  return out;
}

// --- Fuente 3 · Mapillary --------------------------------------------------------------------------
// Imagen a pie de calle, geolocalizada y toda CC BY-SA 4.0. Lo suyo son justo los POIs que peor
// cubre Commons: accesos, áreas recreativas y centros de visitantes, que están junto a carretera o
// sendero y no le interesan a nadie como fotografía de paisaje.
async function enMapillary(poi, token) {
  const [lat, lon] = poi.coordinates;
  const b = bbox(lat, lon, OPT.radio);
  const j = await getJson('graph.mapillary.com',
    `/images?access_token=${encodeURIComponent(token)}&bbox=${b.w},${b.s},${b.e},${b.n}` +
    `&fields=id,thumb_2048_url,captured_at,compass_angle&limit=25`, { agent: AGENTE });
  return (j.data || []).filter(i => i.thumb_2048_url).map(i => ({
    fuente: 'Mapillary', url: i.thumb_2048_url,
    titulo: `Imagen de Mapillary ${i.id}`,
    autor: 'colaboradores de Mapillary', licencia: 'CC BY-SA 4.0',
    via: `Mapillary (bbox de ${OPT.radio} m)`, ficha: `https://www.mapillary.com/app/?pKey=${i.id}`,
  }));
}

// --- Fuente 4 · Europeana ---------------------------------------------------------------------------
// Patrimonio digitalizado de archivos y bibliotecas: para lo Cultural, Religioso y Arqueológico
// —castillos, ermitas, yacimientos— y para la fotografía histórica. `reusability=open` es
// obligatorio: el fondo es mixto y sin ese filtro entra material que no se puede empaquetar.
async function enEuropeana(poi, contexto, wskey) {
  const q = encodeURIComponent(`"${poi.name}" AND "${contexto}"`);
  const j = await getJson('api.europeana.eu',
    `/record/v2/search.json?wskey=${encodeURIComponent(wskey)}&reusability=open&media=true` +
    `&type=IMAGE&rows=20&query=${q}`, { agent: AGENTE });
  const out = [];
  for (const it of (j.items || [])) {
    const licencia = licenciaEuropeana((it.rights || [])[0]);
    if (!licenciaLibre(licencia)) continue;
    const titulo = (it.title || []).join(' / ');
    if (!mencionaSitio(titulo, poi.name)) continue;
    const url = (it.edmIsShownBy || [])[0];
    if (!url) continue;
    out.push({
      fuente: 'Europeana', url, titulo,
      autor: (it.dataProvider || ['proveedor no indicado'])[0], licencia,
      via: 'Europeana (reusability=open)', ficha: 'https://www.europeana.eu/item' + it.id,
    });
  }
  return out;
}

// --- Fuente 6 · iNaturalist ---------------------------------------------------------------------------
// Apagada salvo `--inat`, y con motivo: iNaturalist sirve para ESPECIES. Sus fotos son de un
// organismo, no de un sitio, así que casi siempre fallan el *qué* aunque acierten el *dónde*. Se deja
// accesible para el caso puntual del POI que es un elemento natural con observaciones encima.
async function enInaturalist(poi) {
  const [lat, lon] = poi.coordinates;
  const j = await getJson('api.inaturalist.org',
    `/v1/observations?lat=${lat}&lng=${lon}&radius=${(OPT.radio / 1000).toFixed(3)}` +
    `&photo_license=cc0,cc-by,cc-by-sa&per_page=10&order_by=votes`, { agent: AGENTE });
  const out = [];
  for (const o of (j.results || [])) {
    for (const f of (o.photos || [])) {
      const licencia = licenciaInat(f.license_code);
      if (!licenciaLibre(licencia)) continue;
      out.push({
        fuente: 'iNaturalist', url: String(f.url || '').replace(/\/square\./, '/large.'),
        titulo: `${o.taxon?.name || 'observación'} en ${poi.name}`,
        autor: o.user?.name || o.user?.login || 'autor no indicado', licencia,
        via: `iNaturalist (${OPT.radio} m) — foto de especie, no del sitio`, ficha: o.uri || '',
      });
      break;
    }
  }
  return out;
}

// --- Recorrido de la cascada -------------------------------------------------------------------------
/**
 * Todas las candidatas de todas las fuentes disponibles, en el orden documentado. No corta en la
 * primera: como TODAS son `needsReview`, lo útil es que quien revisa vea el conjunto y elija, no que
 * el script decida por orden de llegada algo que no está en condiciones de decidir.
 */
async function candidatasDe(poi, contexto, claves, avisos) {
  const todas = [];
  const intenta = async (nombre, fn) => {
    try {
      const r = await fn();
      todas.push(...r);
      console.log(dim(`      ${nombre}: ${r.length} candidata(s)`));
    } catch (e) {
      console.log(yellow(`      ${nombre}: error — ${e.message}`));
      avisos.push(`${nombre} falló en «${poi.name}»: ${e.message}`);
    }
    await sleep(400);
  };

  await intenta('Openverse', () => enOpenverse(poi, contexto));
  if (claves.flickr) await intenta('Flickr', () => enFlickr(poi, claves.flickr));
  if (claves.mapillary) await intenta('Mapillary', () => enMapillary(poi, claves.mapillary));
  await intenta('Europeana', () => enEuropeana(poi, contexto, claves.europeana));
  if (OPT.inat) await intenta('iNaturalist', () => enInaturalist(poi));

  return todas;
}

async function procesaParque(entry, informe, avisos, claves) {
  const data = readJson(entry.file);
  const pois = data.pointsOfInterest || [];
  if (!pois.length) return 0;

  const contexto = (data.park && data.park.name) || entry.slug;
  const pendientes = pois.filter(p => OPT.all || !p.image);
  console.log('▶ ' + contexto + dim(` · ${pendientes.length} POI(s) sin foto de ${pois.length}`));
  if (!pendientes.length) return 0;

  let escritos = 0;
  for (const poi of pendientes) {
    if (!Array.isArray(poi.coordinates) || poi.coordinates.length !== 2) {
      informe.push({ parque: entry.slug, poi: poi.name, fuente: '—', estado: 'sin coordenada', detalle: 'no se puede buscar por bbox' });
      continue;
    }
    console.log('  · ' + poi.name + dim(' (' + poi.type + ')'));
    const candidatas = await candidatasDe(poi, contexto, claves, avisos);

    if (!candidatas.length) {
      console.log('    ' + yellow('sin candidata en ninguna fuente'));
      informe.push({ parque: entry.slug, poi: poi.name, fuente: '—', estado: 'sin foto', detalle: 'ninguna fuente alternativa devolvió material de licencia libre' });
      continue;
    }

    // Se comprueba que la imagen CARGA de verdad antes de proponerla. Una URL rota en el informe
    // hace perder el tiempo a quien revisa, que es el recurso escaso de esta cadena.
    let elegida = null;
    for (const c of candidatas) {
      const carga = await loads(c.url);
      informe.push({
        parque: entry.slug, poi: poi.name, fuente: c.fuente,
        estado: carga ? 'candidata a revisar' : 'descartada',
        detalle: carga
          ? `${c.titulo} — ${c.autor} (${c.licencia}) — ${c.via}${c.ficha ? ' — ' + c.ficha : ''}`
          : `${c.titulo} — la URL no devuelve imagen`,
        url: carga ? c.url : '',
      });
      if (carga && !elegida) elegida = c;
    }
    if (!elegida) continue;
    console.log('    ' + yellow('? ') + candidatas.length + ' candidata(s), la primera: ' +
      dim(elegida.titulo + ' (' + elegida.licencia + ', ' + elegida.fuente + ')'));

    // La puerta: fuera de Commons nada se escribe solo. `--force` es una persona diciendo que ha
    // mirado la foto y que retrata el sitio.
    if (!OPT.force || !OPT.write) continue;
    poi.image = elegida.url;
    poi.source = conCredito(poi.source, elegida, elegida.fuente);
    escritos++;
    if (OPT.sql) {
      sentencias.push(`UPDATE points_of_interest SET image_url = ${sqlStr(elegida.url)}, source = ${sqlStr(poi.source)} ` +
        `WHERE slug = ${sqlStr(poi.id)} AND park_id = (SELECT id FROM parks WHERE slug = ${sqlStr(entry.slug)});`);
    }
  }

  if (escritos && OPT.write && !OPT.dryRun) {
    fs.writeFileSync(entry.file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log('  → ' + rel(entry.file) + ' (' + escritos + ' foto(s))');
  } else if (escritos && OPT.dryRun) {
    console.log(yellow('  --dry-run: ' + escritos + ' foto(s) sin escribir'));
  }
  return escritos;
}

function escribeInforme(informe, disponibles, avisos, file) {
  const L = ['# Fotos de POI en fuentes alternativas a Wikimedia — informe', '',
    'Generado por `Tools/catalogo-nacional/poi-images-alt.js` el ' + new Date().toISOString().slice(0, 10) + '.', '',
    'Se consulta solo cuando la cadena de Commons (`poi-images.js`) ya se ha agotado. **Todo lo que',
    'sale aquí es «a revisar» por definición**: fuera de Commons no existe la categoría del espacio,',
    'que era lo que garantizaba que la foto fuera del sitio. La licencia, en cambio, sigue siendo',
    'lista blanca —CC0, dominio público, CC BY y CC BY-SA— exactamente igual que en Commons.', '',
    '## Fuentes consultadas', '',
    '| Fuente | Estado |', '|---|---|'];
  for (const d of disponibles) L.push(`| ${d.nombre} | ${d.estado} |`);
  L.push('', '## Resultado por punto de interés', '',
    '| Espacio | Punto de interés | Fuente | Estado | Detalle |', '|---|---|---|---|---|');
  for (const r of informe) L.push(`| ${r.parque} | ${r.poi} | ${r.fuente} | ${r.estado} | ${r.detalle} |`);
  if (avisos.length) {
    L.push('', '## Avisos', '');
    for (const a of avisos) L.push('- ' + a);
  }
  L.push('');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, L.join('\n'), 'utf8');
  console.log('→ ' + rel(file));
}

async function main() {
  const parques = parkFiles().filter(p => !OPT.park || p.slug === OPT.park);
  if (!parques.length) {
    console.error(red('✖ no hay parques que procesar' + (OPT.park ? ' para --park ' + OPT.park : '')));
    process.exit(2);
  }

  const claves = {
    flickr: process.env.FLICKR_API_KEY || null,
    mapillary: process.env.MAPILLARY_TOKEN || null,
    europeana: process.env.EUROPEANA_WSKEY || 'api2demo',
  };

  // El estado de cada fuente va al informe. Una fuente que no se consultó por falta de clave no es
  // lo mismo que una fuente que se consultó y no tenía nada, y el informe tiene que decir cuál.
  const disponibles = [
    { nombre: 'Openverse', estado: 'consultada (no necesita clave)' },
    { nombre: 'Flickr', estado: claves.flickr ? 'consultada (bbox)' : '**no disponible: falta `FLICKR_API_KEY`** — es una de las dos que buscan por coordenada' },
    { nombre: 'Mapillary', estado: claves.mapillary ? 'consultada (bbox)' : '**no disponible: falta `MAPILLARY_TOKEN`** — es la que mejor cubre accesos y áreas recreativas' },
    { nombre: 'Europeana', estado: process.env.EUROPEANA_WSKEY ? 'consultada (reusability=open)' : 'consultada con la clave pública de pruebas `api2demo` (limitada)' },
    { nombre: 'Geograph', estado: 'no se consulta: su cobertura son las Islas Británicas' },
    { nombre: 'iNaturalist', estado: OPT.inat ? 'consultada (--inat)' : 'no se consulta sin `--inat`: sus fotos son de especies, no de sitios' },
  ];
  for (const d of disponibles) console.log(dim('  ' + d.nombre.padEnd(12) + d.estado.replace(/\*\*/g, '')));
  console.log('');

  const informe = [];
  const avisos = [];
  let total = 0;
  for (const entry of parques) total += await procesaParque(entry, informe, avisos, claves);

  if (OPT.report) escribeInforme(informe, disponibles, avisos, fromRoot(OPT.report));
  if (OPT.sql && sentencias.length && !OPT.dryRun) {
    const file = fromRoot(OPT.sql);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '-- Fotos de puntos de interés desde fuentes alternativas (poi-images-alt.js)\n' +
      sentencias.join('\n') + '\n', 'utf8');
    console.log('→ ' + rel(file) + ' (' + sentencias.length + ' sentencia(s))');
  }

  const revisar = informe.filter(r => r.estado === 'candidata a revisar').length;
  console.log('\n' + (total ? green(total + ' foto(s) escritas') : 'Sin cambios') +
    dim(` · ${revisar} candidata(s) a revisar · nada se escribe sin --write --force`));
}

if (require.main === module) {
  main().catch(err => { console.error(red('✖ ' + (err.stack || err.message))); process.exit(1); });
}
