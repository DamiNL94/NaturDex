#!/usr/bin/env node
'use strict';
/*
 * Descarga la Lista Patrón de especies silvestres del IEPNB (API PostgREST, sin autenticación)
 * y la deja en fuentes/iepnb/ como JSON paginado y consolidado.
 *
 * Por qué existe: hasta ahora el estado de conservación de cada ficha se rellenaba a mano desde
 * bibliografía. La vista `..._normas` devuelve la norma citada literalmente, su categoría y su
 * ámbito (UE / estatal / autonómico), que es justo lo que necesitan `spainStatus` y el estado
 * regional. La clave estable es `idtaxon`.
 *
 * IMPORTANTE: ejecutar en la máquina del usuario. El sandbox de la sesión tiene iepnb.gob.es
 * bloqueado por el proxy; desde un equipo normal la API responde sin problema.
 *
 * Uso:
 *   node Tools/catalogo-nacional/fuentes/fetch-lista-patron.js               # las 4 vistas
 *   node Tools/catalogo-nacional/fuentes/fetch-lista-patron.js normas        # solo una
 *   node Tools/catalogo-nacional/fuentes/fetch-lista-patron.js --taxon 1     # un taxón, a stdout
 *   node Tools/catalogo-nacional/fuentes/fetch-lista-patron.js --nombre "Aquila fasciata"
 *
 * Requiere Node 18+ (usa fetch nativo).
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://iepnb.gob.es/api/catalogo/';
const OUT = path.join(__dirname, 'iepnb');
const PAGINA = 5000;   // filas por petición
const PAUSA = 400;     // ms entre peticiones — cortesía con un servicio público

const VISTAS = {
  base:      { view: 'v_listapatronespecie', query: 'idtaxon=gt.0', desc: 'taxonomía y nombre común' },
  sinonimos: { view: 'v_listapatronespecie_sinonimos', query: '', desc: 'sinonimias — resuelve nombres antiguos' },
  normas:    { view: 'v_listapatronespecie_normas', query: '', desc: 'normativa y categorías de protección' },
  codigos:   { view: 'v_listapatronespecie_codigos', query: '', desc: 'pasarelas a Red Natura y UICN' },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pedir(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

// PostgREST pagina con limit/offset; se para cuando una página vuelve incompleta.
async function descargarVista(clave) {
  const { view, query, desc } = VISTAS[clave];
  const filas = [];
  for (let offset = 0; ; offset += PAGINA) {
    const q = [query, `limit=${PAGINA}`, `offset=${offset}`].filter(Boolean).join('&');
    const lote = await pedir(`${BASE}${view}?${q}`);
    filas.push(...lote);
    process.stdout.write(`\r  ${clave} (${desc}): ${filas.length} filas`);
    if (lote.length < PAGINA) break;
    await sleep(PAUSA);
  }
  console.log('');
  fs.mkdirSync(OUT, { recursive: true });
  const destino = path.join(OUT, `${view}.json`);
  fs.writeFileSync(destino, JSON.stringify({
    _fuente: `${BASE}${view}`,
    _licencia: 'Fuente: «© Ministerio para la Transición Ecológica y el Reto Demográfico».',
    _descargado: new Date().toISOString().slice(0, 10),
    _filas: filas.length,
    datos: filas,
  }, null, 2) + '\n');
  return { clave, view, filas: filas.length, destino };
}

// Consulta puntual: no escribe fichero, imprime el resultado agrupado por taxón.
async function consultar(filtro) {
  const resultados = {};
  for (const [clave, { view }] of Object.entries(VISTAS)) {
    resultados[clave] = await pedir(`${BASE}${view}?${filtro}`);
    await sleep(PAUSA);
  }
  console.log(JSON.stringify(resultados, null, 2));
}

(async () => {
  const args = process.argv.slice(2);
  const iTaxon = args.indexOf('--taxon');
  const iNombre = args.indexOf('--nombre');

  if (iTaxon !== -1) return consultar(`idtaxon=eq.${encodeURIComponent(args[iTaxon + 1])}`);
  if (iNombre !== -1) return consultar(`ScientificName=ilike.*${encodeURIComponent(args[iNombre + 1])}*`);

  const pedidas = args.filter((a) => VISTAS[a]);
  const claves = pedidas.length ? pedidas : Object.keys(VISTAS);

  console.log(`Descargando ${claves.length} vista(s) del IEPNB a ${path.relative(process.cwd(), OUT)}/\n`);
  const resumen = [];
  for (const c of claves) resumen.push(await descargarVista(c));

  console.log('\nResumen:');
  for (const r of resumen) console.log(`  ${r.view.padEnd(38)} ${String(r.filas).padStart(7)} filas`);
  console.log('\nRecuerda: los JSON descargados no se versionan (ver .gitignore).');
})().catch((e) => {
  console.error('\nError:', e.message);
  console.error('Si es un fallo de red, comprueba que ejecutas esto fuera del sandbox de la sesión.');
  process.exit(1);
});
