#!/usr/bin/env node
'use strict';
/*
 * auditoria-consolida-hallazgos.js — convierte los 2.159 hallazgos de la auditoría del catálogo en
 * una lista de trabajo: deduplicada por taxón+campo, ordenada por alcance, separada en colas que NO
 * se ejecutan igual, y **cotejada con lo que hay hoy en el repositorio**.
 *
 * El problema que resuelve
 * -----------------------
 * La auditoría se hizo espacio a espacio, y el mismo hallazgo sale una vez por cada espacio donde
 * está fichado el taxón: *Oenanthe hispanica · iucn_global* aparece diez veces. Leída por espacios,
 * la lista pide diez correcciones donde hay UNA — y peor, esconde cuáles son de campo UNIVERSAL, que
 * se arreglan una vez en el catálogo y se reparten, frente a las LOCALES, que hay que tocar espacio
 * por espacio. Quien lea los dieciséis informes seguidos no puede saber cuántas correcciones
 * distintas tiene delante.
 *
 * Y hay una segunda mitad, que es la que caduca: **parte de los hallazgos ya están corregidos**. La
 * tanda del 2026-09-13/14 cerró C3 (la Lista Roja mundial), C5 (el estado autonómico), C11 y C15, las
 * claves de GBIF y los huecos de taxonomía. Una lista de trabajo que no lo sepa manda repetir trabajo
 * hecho, y eso la vuelve inservible a la primera lectura.
 *
 * Por eso esto no se limita a agrupar: **abre los dieciséis `park.json` y mira el campo**. El
 * criterio es mecánico y por eso se puede repetir: si el valor de hoy NO es el que la auditoría
 * anotó en `valor_json`, la ficha se ha tocado desde entonces.
 *
 * Lo que ese criterio NO dice, y conviene tenerlo delante
 * ------------------------------------------------------
 * «Tocado» no es «correcto». Dice que el dato cambió después de la auditoría, no que el valor nuevo
 * sea el bueno. Para los campos cuya corrección tiene herramienta y fecha —`iucn_global` por
 * `lista-roja-mundial.js`, `regional_status` por `corrige-estado-autonomico.js`— eso equivale a
 * «hecho»; para el resto es «míralo». El informe lo separa y no los mezcla.
 *
 * Tres clases de hallazgo que no se dejan deduplicar por taxón, y hay que verlas aparte:
 *   · los que hablan del ESPACIO y no de una especie (`scientific_name` es «(todo el espacio)»);
 *   · los AMBIGUOS, que no son trabajo sino decisiones pendientes de una persona con el boletín
 *     delante (el LESRPE de *Burhinus*, los textos de la chova);
 *   · los RENOMBRADOS, que no son «un campo mal» sino el procedimiento de cuatro sitios del
 *     CLAUDE.md (park.json + catálogo universal + data/contenido + el borrado de la fila vieja).
 *
 * Uso:
 *   node Tools/catalogo-nacional/auditoria-consolida-hallazgos.js
 *        [--hallazgos <dir>] [--informe <ruta.md>] [--json <ruta.json>] [--pendientes]
 *
 *   `--hallazgos` es el directorio con los `<slug>-hallazgos.json` (por defecto
 *   `out/auditoria-2026-09/`). `--pendientes` deja fuera del informe lo que ya está tocado.
 */
const fs = require('fs');
const path = require('path');

const { arg, flag } = require('../lib/cli');
const { ROOT, OUT_DIR, readJson, rel, fromRoot, parkFiles } = require('../lib/io');

const DIR_HALLAZGOS = fromRoot(arg('hallazgos', path.join(OUT_DIR, 'auditoria-2026-09')));
const RUTA_INFORME = fromRoot(arg('informe', path.join(ROOT, 'Docs', 'auditoria-consolidado.md')));
const RUTA_JSON = arg('json') ? fromRoot(arg('json')) : null;
const SOLO_PENDIENTES = flag('pendientes');

/*
 * A qué parte de la ficha mira cada `campo` de la auditoría, y de quién es.
 *
 * UNIVERSAL / LOCAL no es una etiqueta decorativa: decide POR DÓNDE se corrige. Un campo universal se
 * arregla una vez en `data/especies-universal.json` y lo reparte `species:apply`; corregirlo en el
 * `park.json` lo revierte el siguiente pase (trampa nº 4 del CLAUDE.md). Un campo local hay que
 * tocarlo en cada espacio y volcarlo con su propio SQL.
 *
 * La lista de qué es universal vive en `Tools/sync-species-catalog.js` (`UNIVERSALES`): si allí se
 * mueve un campo de sitio, aquí hay que moverlo también. El guardián de más abajo salta si aparece un
 * `campo` que esta tabla no conoce, para que un hallazgo nuevo no se cuele sin clasificar.
 */
const CAMPOS = {
  iucn_global:               { ambito: 'universal', lee: sp => sp.iucnGlobal },
  iucn_spain:                { ambito: 'universal', lee: sp => sp.iucnSpain },
  spain_status:              { ambito: 'universal', lee: sp => sp.spainStatus },
  image:                     { ambito: 'universal', lee: sp => sp.image },
  taxon_genus:               { ambito: 'universal', lee: sp => (sp.taxonomy || {}).genus },
  taxon_family:              { ambito: 'universal', lee: sp => (sp.taxonomy || {}).family },
  'taxon_order+taxon_family': { ambito: 'universal', lee: sp => (sp.taxonomy || {}).order, hueco: sp => !((sp.taxonomy || {}).order) || !((sp.taxonomy || {}).family) },
  taxonomy:                  { ambito: 'universal', narrativo: true },

  regional_status:           { ambito: 'local', lee: sp => sp.regionalStatus },
  eidos_taxonid:             { ambito: 'local', lee: sp => sp.eidosTaxonId },
  gbif_species_key:          { ambito: 'local', lee: sp => sp.gbifSpeciesKey },
  gbif_occurrences:          { ambito: 'local', lee: sp => sp.gbifOccurrences },
  source:                    { ambito: 'local', lee: sp => sp.source },
  visible:                   { ambito: 'local', narrativo: true },
  species_habitats:          { ambito: 'local', narrativo: true },
  'species_habitats.evidence': { ambito: 'local', narrativo: true },

  // El campo se retiró entero el 2026-09-14: no hay nada que corregir, sea cual sea el hallazgo.
  conservation_status:       { ambito: 'retirado' },

  // Un renombrado no es un campo mal escrito: es el procedimiento de cuatro sitios.
  scientific_name:                  { ambito: 'renombrado' },
  'scientific_name+iucn_spain':     { ambito: 'renombrado' },
  'scientific_name+eidos_taxonid':  { ambito: 'renombrado' },

  // Alta o baja de ficha, según la clase del hallazgo.
  inclusion:                 { ambito: 'inclusion' },
};

/** Un `scientific_name` que no es un taxón: la auditoría anotó ahí una frase sobre el espacio. */
const esNarrativo = (n) => !n || /^\(/.test(String(n).trim()) || !/^[A-Z][a-z]+ [a-z]/.test(String(n).trim());

const norm = (v) => (v === null || v === undefined ? '' : String(v).trim());

/*
 * Algunos `valor_json` de la auditoría no son el valor del campo: son una frase CON el valor dentro
 * («LESRPE; Directiva Aves…» · tramo 2). Compararlos tal cual contra la ficha da siempre distinto y
 * eso marcaría como «tocado» lo que nadie ha tocado — 10 de 733 en la primera medición, el LESRPE de
 * *Burhinus* entre ellas.
 *
 * Cuando la frase trae el valor entre comillas angulares, se extrae y se compara ése. Cuando no hay
 * de dónde extraerlo, la comparación NO se hace y se dice: «no comparable» es una respuesta honesta y
 * «tocado» sería una mentira cómoda.
 */
const literal = (v) => {
  const s = norm(v);
  const m = s.match(/«([^»]*)»/);
  return m ? m[1].trim() : s;
};
const esAnotado = (v) => {
  const s = norm(v);
  if (/«[^»]*»/.test(s)) return false;   // el literal se puede extraer de las comillas
  return /\s·\s|\*\*/.test(s);
};

// --- Lectura -------------------------------------------------------------------------------------

if (!fs.existsSync(DIR_HALLAZGOS)) {
  console.error(`No existe el directorio de hallazgos: ${rel(DIR_HALLAZGOS)}`);
  console.error('Pásalo con --hallazgos <dir>. Son los `<slug>-hallazgos.json` que dejó la auditoría.');
  process.exit(1);
}

const ficheros = fs.readdirSync(DIR_HALLAZGOS).filter(n => n.endsWith('-hallazgos.json')).sort();
if (!ficheros.length) { console.error(`No hay ningún *-hallazgos.json en ${rel(DIR_HALLAZGOS)}`); process.exit(1); }

const hallazgos = [];
const espaciosAuditados = new Set();
for (const f of ficheros) {
  const doc = readJson(path.join(DIR_HALLAZGOS, f));
  const park = doc.park || f.replace('-hallazgos.json', '');
  espaciosAuditados.add(park);
  for (const h of doc.hallazgos || []) hallazgos.push({ ...h, _park: park, _fichero: f, _auditoria: doc.auditoria });
}

// Guardián: un `campo` que esta tabla no conoce se quedaría fuera de todas las colas sin decir nada.
const desconocidos = [...new Set(hallazgos.map(h => h.campo).filter(c => !CAMPOS[c]))];
if (desconocidos.length) {
  console.error('Hay campos de hallazgo que esta herramienta no sabe clasificar:');
  for (const c of desconocidos) console.error(`  · ${c}`);
  console.error('Añádelos a la tabla CAMPOS (y mira si son universales o locales antes).');
  process.exit(1);
}

// --- El catálogo de hoy --------------------------------------------------------------------------

/** `slug → Map<scientificName, ficha>` de lo que hay publicado AHORA. */
const catalogo = new Map();
for (const p of parkFiles()) {
  const doc = readJson(p.file);
  catalogo.set(p.slug, new Map((doc.species || []).map(s => [s.scientificName, s])));
}

/**
 * Estado de un hallazgo de taxón contra el `park.json` de hoy, espacio por espacio.
 *
 * Devuelve uno de: `resuelto` (el campo ya no existe), `hecho` (el alta o la baja está), `tocado`
 * (el valor cambió desde la auditoría), `pendiente` (sigue igual) o `sin-ficha`.
 */
function estadoDe(h, slug) {
  const def = CAMPOS[h.campo];
  if (def.ambito === 'retirado') return 'resuelto';

  const fichas = catalogo.get(slug);
  if (!fichas) return 'sin-espacio';
  const sp = fichas.get(h.scientific_name);

  if (def.ambito === 'inclusion') {
    if (h.clase === 'falta_anadir') return sp ? 'hecho' : 'pendiente';
    if (h.clase === 'falta_eliminar') return !sp ? 'hecho' : (sp.visible === false ? 'hecho' : 'pendiente');
    return 'pendiente';
  }
  // Un renombrado SÍ se mide, y por presencia: si el nombre viejo sigue en el `park.json`, está sin
  // hacer; si ya no está, el renombrado se aplicó. Medirlo por el valor del campo no vale —el campo
  // ES el nombre— y dejarlo en «no medible» daría un cero tranquilizador que sería falso.
  if (def.ambito === 'renombrado') return sp ? 'pendiente' : 'hecho';

  if (!sp) return 'sin-ficha';
  if (def.narrativo || !def.lee) return 'no-medible';

  // El hueco de taxonomía se mide por presencia, no por valor: la auditoría anotó `null`.
  if (def.hueco) return def.hueco(sp) ? 'pendiente' : 'hecho';

  if (esAnotado(h.valor_json)) return 'no-comparable';
  const actual = literal(def.lee(sp));
  const anotado = literal(h.valor_json);
  // Las comillas angulares no siempre encierran el valor del campo: en «eidosTaxonId **126** y
  // `taxonomy.genus` «Calamagrostis»…» encierran OTRA cosa, y compararla contra un taxonid daría
  // «tocado» siempre. Si lo extraído no es del mismo tipo que el valor de hoy, no se compara.
  const esNumero = (s) => /^\d+$/.test(s);
  if (esNumero(actual) !== esNumero(anotado)) return 'no-comparable';
  return actual === anotado ? 'pendiente' : 'tocado';
}

// --- Consolidación -------------------------------------------------------------------------------

/*
 * La clave de deduplicación es taxón + campo, y el ALCANCE se toma del espacio cuyo fichero reportó
 * el hallazgo, no del texto libre `alcance`: ese campo a veces dice «campo universal, 11 espacios»
 * en vez de enumerar slugs, y contar sobre prosa no se puede repetir.
 */
const porClave = new Map();
const narrativos = [];

for (const h of hallazgos) {
  if (esNarrativo(h.scientific_name)) { narrativos.push(h); continue; }
  const clave = `${h.scientific_name}${h.campo}`;
  if (!porClave.has(clave)) {
    porClave.set(clave, {
      scientificName: h.scientific_name, campo: h.campo,
      ambito: CAMPOS[h.campo].ambito, clases: new Set(), espacios: new Set(),
      valorJson: h.valor_json, valorFuente: h.valor_fuente,
      criterio: h.criterio, accion: h.accion_propuesta, ids: [],
    });
  }
  const e = porClave.get(clave);
  e.clases.add(h.clase);
  e.espacios.add(h._park);
  e.ids.push(`${h._park}/${h.id}`);
  // Se conserva el texto más largo: los informes de los últimos espacios llegaron más razonados.
  if (norm(h.accion_propuesta).length > norm(e.accion).length) e.accion = h.accion_propuesta;
  if (norm(h.valor_fuente).length > norm(e.valorFuente).length) e.valorFuente = h.valor_fuente;
}

for (const e of porClave.values()) {
  e.estados = {};
  for (const slug of e.espacios) {
    const st = estadoDe({ scientific_name: e.scientificName, campo: e.campo, clase: [...e.clases][0], valor_json: e.valorJson }, slug);
    (e.estados[st] = e.estados[st] || []).push(slug);
  }
  const claves = Object.keys(e.estados);
  e.estado = claves.length === 1 ? claves[0]
    : (claves.includes('pendiente') ? 'parcial' : claves.sort().join('+'));
}

const entradas = [...porClave.values()];

/** Las colas, en el orden en que se ejecutan. Cada una se corrige por una vía distinta. */
const COLAS = [
  { id: 'universal', titulo: 'Cola 1 · correcciones UNIVERSALES',
    via: 'Se corrigen **una vez** en `Tools/catalogo-nacional/data/especies-universal.json` y se reparten con `npm run species:apply -- --sql`. Corregirlas en el `park.json` las revierte el siguiente pase (trampa nº 4 del CLAUDE.md).',
    filtro: e => e.ambito === 'universal' && !e.clases.has('ambiguo') },
  { id: 'local', titulo: 'Cola 2 · correcciones LOCALES',
    via: 'Van espacio por espacio en el `park.json` **y** a la base por su propio SQL: `species-universal.sql` solo lleva los universales. Una corrección local que no se vuelca no la ve el usuario, porque la API manda sobre el paquete.',
    filtro: e => e.ambito === 'local' && !e.clases.has('ambiguo') },
  { id: 'renombrado', titulo: 'Cola 3 · RENOMBRADOS',
    via: 'No son un campo mal escrito. Un renombrado desengancha la ficha en cuatro sitios —`park.json`, catálogo universal, `data/contenido/` y la fila vieja de la BD, que el UPSERT no retira—. Ver el punto 3 de `ORDEN-DE-OPERACIONES.md`.',
    filtro: e => e.ambito === 'renombrado' && !e.clases.has('ambiguo') },
  { id: 'alta', titulo: 'Cola 4 · ALTAS de ficha',
    via: '`build-species-universal.js` si el taxón no está en el catálogo, y después `build-species-n2.js` **solo para las nuevas**: regenerar el espacio entero le devuelve las aves que `aves:poda` le quitó (trampa nº 6).',
    filtro: e => e.ambito === 'inclusion' && e.clases.has('falta_anadir') },
  { id: 'baja', titulo: 'Cola 5 · BAJAS de ficha',
    via: '`data/exclusiones-especies.json` + `npm run especies:exclusiones -- --write --sql auto`. El borrado va aparte porque el UPSERT no retira nada.',
    filtro: e => e.ambito === 'inclusion' && e.clases.has('falta_eliminar') },
  { id: 'ambiguo', titulo: 'Cola 6 · DECISIONES, no trabajo',
    via: 'Nadie las puede ejecutar sin el boletín delante. No se tocan hasta que se decidan, y se decide **una vez para todos los espacios**.',
    filtro: e => e.clases.has('ambiguo') },
  { id: 'retirado', titulo: 'Resueltos por la retirada del campo',
    via: '`conservation_status` se retiró del catálogo, de la API, del panel y del esquema el 2026-09-14. No hay nada que corregir.',
    filtro: e => e.ambito === 'retirado' },
];

// --- Informe -------------------------------------------------------------------------------------

const ESTADO_ROTULO = {
  hecho: 'hecho', tocado: 'tocado', pendiente: 'pendiente', resuelto: 'resuelto',
  parcial: 'parcial', 'sin-ficha': 'sin ficha', 'no-medible': 'no medible',
  'no-comparable': 'no comparable', 'sin-espacio': 'sin espacio',
};

const cuenta = (lista, pred) => lista.filter(pred).length;

const l = [];
l.push('# Auditoría del catálogo · consolidado');
l.push('');
l.push('> **GENERADO** por `node Tools/catalogo-nacional/auditoria-consolida-hallazgos.js`. No editar a mano.');
l.push('');
l.push(`Los **${hallazgos.length} hallazgos** de la auditoría de coherencia del catálogo (${espaciosAuditados.size} espacios,`);
l.push('cotejados uno a uno contra la base de Railway, EIDOS y GBIF), agrupados por lo que hay que hacer con');
l.push('ellos en vez de por el espacio donde salieron.');
l.push('');
l.push('**Qué NO es esto.** No es una lista de errores confirmados: es lo que la auditoría vio, puesto al');
l.push('lado de lo que hay hoy en el repositorio. Y «tocado» no significa «correcto» — significa que el dato');
l.push('cambió después de la auditoría, que para los campos con herramienta y fecha equivale a hecho y para');
l.push('el resto quiere decir «míralo».');
l.push('');

l.push('## Lo que la agrupación cambia');
l.push('');
const deTaxon = hallazgos.length - narrativos.length;
l.push(`| | |`);
l.push(`|---|---|`);
l.push(`| Hallazgos escritos | **${hallazgos.length}** |`);
l.push(`| De ellos, sobre un taxón concreto | ${deTaxon} |`);
l.push(`| Sobre el espacio entero (no deduplicables) | ${narrativos.length} |`);
l.push(`| **Correcciones distintas** (taxón + campo) | **${entradas.length}** |`);
l.push('');
l.push(`O sea: ${deTaxon} apuntes para **${entradas.length}** cosas que hacer. El mismo taxón sale una vez por cada`);
l.push('espacio donde está fichado, y ésa es toda la diferencia.');
l.push('');

const porEstado = {};
for (const e of entradas) porEstado[e.estado] = (porEstado[e.estado] || 0) + 1;
l.push('### Estado hoy');
l.push('');
l.push('| estado | correcciones | qué significa |');
l.push('|---|---|---|');
const SIGNIFICADO = {
  resuelto: 'el campo ya no existe en la ficha',
  hecho: 'el alta, la baja o el hueco ya está',
  tocado: 'el valor cambió desde la auditoría',
  parcial: 'tocado en unos espacios y pendiente en otros',
  pendiente: 'el dato sigue exactamente como la auditoría lo vio',
  'sin-ficha': 'la ficha ya no está en ese espacio',
  'no-medible': 'el hallazgo no apunta a un valor comparable',
  'no-comparable': 'la auditoría anotó ahí una frase, no el valor: hay que mirarlo a mano',
};
for (const [k, v] of Object.entries(porEstado).sort((a, b) => b[1] - a[1])) {
  l.push(`| \`${ESTADO_ROTULO[k] || k}\` | ${v} | ${SIGNIFICADO[k] || '—'} |`);
}
l.push('');
l.push('> **«Pendiente» incluye lo que se dejó a propósito.** Esta comprobación mira el dato, no la');
l.push('> intención: los `iucn_global` que siguen igual son en buena parte la **clase GUARDA** de');
l.push('> `lista-roja-mundial.js` —EIDOS calla y la ficha afirma una categoría, así que no se toca, porque');
l.push('> escribir el silencio encima sería borrar un dato (regla nº 2 del CLAUDE.md)—. Salen aquí para que');
l.push('> nadie los dé por revisados, no porque haya que cambiarlos.');
l.push('');

l.push('### Lo que queda, por cola');
l.push('');
l.push('| cola | correcciones | pendientes |');
l.push('|---|---|---|');
for (const cola of COLAS) {
  const lista = entradas.filter(cola.filtro);
  if (!lista.length) continue;
  const pend = cuenta(lista, e => e.estado === 'pendiente' || e.estado === 'parcial');
  l.push(`| ${cola.titulo.replace(/^Cola \d+ · /, '')} | ${lista.length} | **${pend}** |`);
}
l.push('');
l.push('> La suma puede pasar del total: una corrección sale en dos colas cuando la auditoría la');
l.push('> clasificó de dos maneras en espacios distintos —el mismo taxón como alta en uno y como baja en');
l.push('> otro, por ejemplo—. Se deja así a propósito: fundirlas escondería el desacuerdo.');
l.push('');

for (const cola of COLAS) {
  let lista = entradas.filter(cola.filtro);
  if (!lista.length) continue;
  const pendientes = cuenta(lista, e => e.estado === 'pendiente' || e.estado === 'parcial');
  const noMedibles = cuenta(lista, e => e.estado === 'no-medible');
  if (SOLO_PENDIENTES) lista = lista.filter(e => e.estado === 'pendiente' || e.estado === 'parcial');
  if (!lista.length) continue;

  lista.sort((a, b) => b.espacios.size - a.espacios.size || a.scientificName.localeCompare(b.scientificName));

  l.push(`## ${cola.titulo}`);
  l.push('');
  l.push(`**${lista.length} corrección(es)**${SOLO_PENDIENTES ? '' : ` · ${pendientes} pendiente(s)` +
    (noMedibles ? ` · ${noMedibles} que esta comprobación no sabe medir` : '')}. ${cola.via}`);
  l.push('');
  l.push('| taxón | campo | espacios | estado | lo que la auditoría vio | lo que dice la fuente |');
  l.push('|---|---|---|---|---|---|');
  for (const e of lista) {
    const corta = (s, n) => {
      const t = norm(s).replace(/\|/g, '\\|').replace(/\n+/g, ' ');
      return t.length > n ? t.slice(0, n - 1) + '…' : (t || '—');
    };
    l.push(`| *${e.scientificName}* | \`${e.campo}\` | ${e.espacios.size} | ${ESTADO_ROTULO[e.estado] || e.estado} | ${corta(e.valorJson, 70)} | ${corta(e.valorFuente, 140)} |`);
  }
  l.push('');
}

if (narrativos.length) {
  l.push('## Hallazgos que hablan del ESPACIO, no de una especie');
  l.push('');
  l.push(`**${narrativos.length}**, y no se pueden deduplicar por taxón ni comprobar contra un campo: son medidas`);
  l.push('del espacio entero («64 enlaces para 183 fichas», «106 de las 354 fichas están ocultas»). Se leen en el');
  l.push('informe de su espacio; aquí van enumerados para que no desaparezcan del recuento.');
  l.push('');
  l.push('| espacio | campo | qué dice |');
  l.push('|---|---|---|');
  for (const h of narrativos.sort((a, b) => a._park.localeCompare(b._park))) {
    const t = norm(h.valor_json || h.valor_bd).replace(/\|/g, '\\|').replace(/\n+/g, ' ');
    l.push(`| ${h._park} | \`${h.campo}\` | ${t.length > 150 ? t.slice(0, 149) + '…' : t || '—'} |`);
  }
  l.push('');
}

l.push('---');
l.push('');
l.push('## Cómo se regenera');
l.push('');
l.push('```bash');
l.push('node Tools/catalogo-nacional/auditoria-consolida-hallazgos.js [--hallazgos <dir>] [--pendientes]');
l.push('```');
l.push('');
l.push('Sin red y sin base de datos: lee los `<slug>-hallazgos.json` y los dieciséis `park.json`. `--pendientes`');
l.push('deja fuera lo que ya está tocado o hecho, que es la vista útil cuando se va a trabajar.');

const informe = l.join('\n') + '\n';
fs.mkdirSync(path.dirname(RUTA_INFORME), { recursive: true });
fs.writeFileSync(RUTA_INFORME, informe, 'utf8');
console.log(`+ ${rel(RUTA_INFORME)}`);

if (RUTA_JSON) {
  const salida = entradas.map(e => ({
    scientificName: e.scientificName, campo: e.campo, ambito: e.ambito,
    clases: [...e.clases], espacios: [...e.espacios].sort(), estado: e.estado,
    estados: e.estados, valorJson: e.valorJson, valorFuente: e.valorFuente,
    criterio: e.criterio, accion: e.accion, hallazgos: e.ids,
  })).sort((a, b) => b.espacios.length - a.espacios.length || a.scientificName.localeCompare(b.scientificName));
  fs.mkdirSync(path.dirname(RUTA_JSON), { recursive: true });
  fs.writeFileSync(RUTA_JSON, JSON.stringify({ generado: new Date().toISOString().slice(0, 10), hallazgos: hallazgos.length, correcciones: salida.length, narrativos: narrativos.length, correccionesDetalle: salida }, null, 2) + '\n', 'utf8');
  console.log(`+ ${rel(RUTA_JSON)}`);
}

console.log(`\n${hallazgos.length} hallazgo(s) · ${entradas.length} corrección(es) distintas · ${narrativos.length} de espacio`);
for (const cola of COLAS) {
  const lista = entradas.filter(cola.filtro);
  if (!lista.length) continue;
  const pend = cuenta(lista, e => e.estado === 'pendiente' || e.estado === 'parcial');
  // Las «no medibles» se dicen aparte: contarlas como resueltas daría un cero tranquilizador falso.
  const noMed = cuenta(lista, e => e.estado === 'no-medible');
  console.log(`  · ${cola.id.padEnd(11)} ${String(lista.length).padStart(4)} · ${pend} pendiente(s)` +
    (noMed ? ` · ${noMed} no medible(s)` : ''));
}
