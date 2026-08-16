#!/usr/bin/env node
'use strict';
/*
 * poda-aves-sin-respaldo.js — aplica el filtro 3 bis (respaldo de sitio para las aves) a un
 * `park.json` YA ESCRITO, sin volver a derivar el resto del catálogo del espacio.
 *
 * El problema que resuelve
 * -----------------------
 * El filtro 3 bis se escribió en `build-species-seleccion.js`, que es la puerta de los espacios
 * NUEVOS. Pero los ocho espacios ya publicados entraron por la puerta vieja, y ahí siguen: 557 de sus
 * 1.492 fichas son aves, y 246 de ellas no las respalda ninguna fuente de sitio. Cambiar la
 * herramienta no cambia el dato escrito.
 *
 * Regenerar la Capa 3 entera de los ocho tampoco vale, y por dos motivos distintos:
 *
 *   · Tres de ellos —Cabo Cope, Cuatro Calas y Sierra Espuña— son ANTERIORES a que existiera
 *     `build-species-seleccion.js`. No tienen fichero de selección, y su catálogo se curó a mano.
 *     Volver a derivarlo no aplicaría el filtro de las aves: reescribiría también sus plantas con
 *     criterios que nadie aplicó cuando se hicieron, y eso no es una poda, es otro catálogo.
 *   · En los otros cinco, regenerar mueve además umbrales, rarezas y textos de `source`. Mezclar eso
 *     con la poda de aves haría imposible leer en el diff qué ha cambiado por el filtro nuevo y qué
 *     por el camino.
 *
 * Así que esta herramienta hace UNA cosa y se le nota: retira las aves sin respaldo de sitio y no
 * toca nada más. La decisión de qué es «respaldo» es la MISMA que la de la selección —las dos llaman
 * a `lib/respaldo-sitio.js`—, para que no puedan divergir.
 *
 * Lo que sí corrige de paso, porque son afirmaciones que han quedado FALSAS
 * -----------------------------------------------------------------------
 *   · `zepaSiteCode`. Lo escribía el `zepa.geojson` del espacio: llevaba el código de la ZEPA con la
 *     que solapa el ESPACIO a toda ave del catálogo, dijera lo que dijera la lista oficial. Y no es
 *     decorativo: `Frontend/Js/state.js` construye con él la colección de aves de la ZEPA. Aquí pasa
 *     a ser el sitio que de verdad declara al ave en su formulario, o `null`.
 *   · La `reviewNote` que decía «queda pendiente contrastarla con la lista oficial del sitio …, que
 *     no ha podido consultarse». Ya se ha consultado: es la que acaba de decidir si el ave se queda.
 *     Dejarla puesta sería publicar como pendiente algo que está hecho.
 *
 * Lo que NO toca, y hay que saberlo: el `source` de las aves que se quedan. Ahí es donde debería
 * leerse la cita del formulario —sitio, sección y población declarada—, y quien la escribe es
 * `build-species-n2.js` al regenerar la Capa 3. Esta herramienta no redacta procedencia: si lo
 * hiciera, estaría inventando el texto de una fuente que no ha leído.
 *
 * Y POR QUÉ HACE FALTA ADEMÁS EL SQL (`--sql`)
 * --------------------------------------------
 * `build-park-sql.js` solo hace UPSERT: `INSERT … ON DUPLICATE KEY UPDATE`. Eso vale para dar de
 * alta y para corregir, y no vale para RETIRAR — no hay ninguna sentencia que borre lo que ya no
 * está en el `park.json`. Así que regenerar el `-n2.sql` después de podar deja la base de datos
 * exactamente igual que antes, con las 227 aves dentro.
 *
 * Y como `Frontend/Js/data.js` da prioridad a la API sobre el paquete, el resultado sería el peor de
 * los dos mundos: el repositorio sin las aves, el usuario viéndolas. Es la cuarta de las «cinco cosas
 * que fallan en verde» del CLAUDE.md, con el borrado en vez del alta.
 *
 * Por eso el borrado se escribe aparte y explícito, con los nombres uno a uno: es revisable antes de
 * aplicarlo, que es lo que un DELETE necesita y un UPSERT no.
 *
 * Uso:
 *   node Tools/catalogo-nacional/poda-aves-sin-respaldo.js --park <slug> [--write] [--sql <ruta>]
 *                                                          [--sitio <ruta>] [--informe <ruta.md>]
 *
 * Sin `--write` no escribe: enseña el recuento y deja el informe. Es idempotente: una segunda pasada
 * no cambia un byte.
 */
const fs = require('fs');
const path = require('path');
const { arg, flag, requireArgs, die, sleep } = require('../lib/cli');
const { FRONTEND, DATABASE, CATALOGO_DIR, OUT_DIR, readJson, rel, fromRoot } = require('../lib/io');
const { sqlStr } = require('../lib/sql');
const eidos = require('../lib/eidos');
const respaldo = require('../lib/respaldo-sitio');
const { binomio } = require('../lib/atlas');

const PARK = arg('park');
const WRITE = flag('write');
requireArgs('Uso: --park <slug> [--write] [--sitio <ruta>] [--informe <ruta.md>]', { park: PARK });

const RUTA_SITIO = fromRoot(arg('sitio', path.join(OUT_DIR, `${PARK}-rn2000-sitio.json`)));
const RUTA_ANEXOS = fromRoot(arg('anexos', path.join(CATALOGO_DIR, 'data', 'anexos-normativos.json')));
const RUTA_INFORME = fromRoot(arg('informe', path.join(OUT_DIR, `${PARK}-poda-aves.md`)));
// El SQL va a `Database/` y no a `out/` porque no es un intermedio que se revisa y se tira: es un
// fichero que hay que aplicar contra la base de datos y que tiene que quedar versionado, como el
// resto de volcados del espacio.
const RUTA_SQL = arg('sql') ? fromRoot(arg('sql')) : path.join(DATABASE, `poda-aves-${PARK}.sql`);
const CON_SQL = flag('sql') || Boolean(arg('sql'));
const CACHE = fromRoot(arg('cache', path.join(OUT_DIR, `${PARK}-eidos-respaldo-cache.json`)));

const hoy = () => new Date().toISOString().slice(0, 10);
const cache = fs.existsSync(CACHE) ? readJson(CACHE) : {};

/*
 * Resuelve un nombre DE LA FUENTE contra EIDOS. Dos cosas que no son obvias:
 *
 *   · Se reintenta con el BINOMIO cuando el nombre completo no aparece. Los formularios escriben
 *     trinomios de subespecie —«Phalacrocorax aristotelis aristotelis»— y salvedades entre
 *     paréntesis —«Sylvia cantillans ([excluding subalpina])»—, y con eso EIDOS devuelve
 *     «no-encontrada». Con las dos primeras palabras, ese mismo cormorán resuelve a *Gulosus
 *     aristotelis*, que es como lo tiene fichado el catálogo. Recortar a binomio no es adivinar: es
 *     preguntar por la especie en vez de por la subespecie.
 *   · Un fallo de red NO se traga. Se marca y se cuenta en el informe, porque tratarlo como «este
 *     nombre no está en EIDOS» quitaría un puente y, con él, un ave que sí tiene respaldo.
 */
async function resuelve(nombre) {
  if (cache[nombre]) return cache[nombre];
  const intentos = [nombre];
  const bin = String(nombre).trim().split(/\s+/).slice(0, 2).join(' ');
  if (bin && bin !== nombre) intentos.push(bin);
  let r = { acceptedName: null, taxonid: null, error: null };
  for (const n of intentos) {
    await sleep(eidos.THROTTLE_MS);
    try {
      const t = await eidos.resolveTaxon(n);
      if (t.status !== 'no-encontrada') {
        r = { acceptedName: t.acceptedName || null, taxonid: t.taxonid || null, error: null, preguntadoComo: n };
        break;
      }
    } catch (e) { r.error = e.message; break; }
  }
  cache[nombre] = r;
  return r;
}

/** La entrada del anexo normativo de este espacio, con sus dos claves (verbatim y corregida). */
function anexoDelEspacio() {
  if (!fs.existsSync(RUTA_ANEXOS)) return { entradas: [], consultado: false, fuente: null };
  const entrada = (readJson(RUTA_ANEXOS).espacios || {})[PARK];
  if (!entrada) return { entradas: [], consultado: false, fuente: null };
  return {
    entradas: entrada.especies || [],
    consultado: true,
    fuente: entrada.fuente || null,
  };
}

/** El park.json del espacio, localizado por el registro igual que hace el frontend. */
function localiza() {
  const registro = readJson(path.join(FRONTEND, 'Data', 'parks-index.json'));
  let entrada = null;
  for (const c of registro.communities || []) for (const p of c.provinces || []) for (const pk of p.parks || [])
    if (pk.slug === PARK) entrada = pk;
  if (!entrada) die(`el espacio '${PARK}' no está en Frontend/Data/parks-index.json`);
  const manifestPath = path.join(FRONTEND, entrada.manifest);
  const manifest = readJson(manifestPath);
  const parkPath = path.join(FRONTEND, manifest.data);
  return { entrada, manifestPath, manifest, parkPath, doc: readJson(parkPath) };
}

/*
 * La `reviewNote` estructural que llevaban las aves: no era una duda sobre ESA ave, era una
 * propiedad de cómo entraban todas, y decía que la lista oficial «no ha podido consultarse». Se
 * retira solo esa frase; si la ficha tiene además una duda propia —nomenclatural, un taxón que GBIF
 * sirve con dos nombres—, esa se conserva, que para eso está el campo.
 */
const NOTA_ESTRUCTURAL = /Presencia respaldada por \d+ ocurrencias? de GBIF dentro del espacio[^.]*\.(?:\s*(?:Este espacio NO tiene ZEPA declarada[^.]*\.\s*)?)?/g;

function limpiaNota(nota) {
  if (!nota) return null;
  const resto = String(nota).replace(NOTA_ESTRUCTURAL, '').replace(/\s+/g, ' ').trim();
  return resto || null;
}

/** El sitio que declara a esta ave, prefiriendo la ZEPA del espacio: es la figura de las aves. */
function sitioQueLaDeclara(entradas, zepaDelEspacio) {
  if (!entradas || !entradas.length) return null;
  if (zepaDelEspacio && entradas.some(e => e.siteCode === zepaDelEspacio)) return zepaDelEspacio;
  return entradas[0].siteCode;
}

async function main() {
  const { entrada, manifestPath, manifest, parkPath, doc } = localiza();
  const species = doc.species || [];
  const aves = species.filter(s => (s.taxonomy || {}).class === 'Aves');

  const sitioDoc = fs.existsSync(RUTA_SITIO) ? readJson(RUTA_SITIO) : null;
  const anexo = anexoDelEspacio();
  const equiv = respaldo.cargaEquivalencias();

  console.log(`Espacio: ${entrada.name} (${PARK})`);
  console.log(`Fichas: ${species.length} · aves: ${aves.length}`);
  if (!aves.length) { console.log('No hay aves que podar.'); return; }

  /*
   * GUARDA. Sin volcado del sitio y sin anexo, ningún ave tendría respaldo y la poda se llevaría el
   * catálogo entero de aves del espacio — en silencio y con toda la apariencia de estar funcionando.
   * Es exactamente la clase de fallo EN VERDE que el repo persigue, así que aquí se para.
   */
  if (!sitioDoc && !anexo.consultado) {
    die(`${PARK} no tiene NI volcado del sitio Red Natura 2000 NI anexo normativo.\n` +
        `  Sin ninguna de las dos fuentes, ningún ave puede tener respaldo y esta poda retiraría las\n` +
        `  ${aves.length} aves del espacio. Eso no es el filtro: es la ausencia de la fuente.\n` +
        `  Genera antes la lista oficial:  npm run sitio:especies -- --park ${PARK}\n` +
        `  o da de alta su anexo en ${rel(RUTA_ANEXOS)}.`);
  }

  const declaradasSitio = sitioDoc ? (sitioDoc.especies || []) : [];
  const sitios = sitioDoc ? (sitioDoc.sitios || []) : [];
  console.log(sitioDoc
    ? `Lista oficial del sitio: ${declaradasSitio.length} entradas` +
      ` (${declaradasSitio.filter(e => e.grupoCodigo === 'B').length} aves)` +
      ` en ${sitios.map(s => s.code).join(', ') || '— ningún sitio Red Natura 2000'}`
    : `Lista oficial del sitio: NO consultada (no existe ${rel(RUTA_SITIO)})`);
  console.log(anexo.consultado
    ? `Anexo normativo: ${anexo.entradas.length} especies enumeradas`
    : 'Anexo normativo: NO consultado — este espacio no tiene entrada en el fichero de anexos');
  console.log(equiv.consultada
    ? `Equivalencias de nomenclatura: ${equiv.total} verificadas a mano`
    : '⚠ Sin tabla de equivalencias: el puente se queda en binomio + EIDOS');

  // --- Puente: resolver los nombres de LAS FUENTES contra EIDOS -----------------------------------
  const nombresFuente = [
    ...declaradasSitio.map(e => e.scientificName),
    ...anexo.entradas.map(e => e.scientificName),
  ].filter((n, i, a) => n && a.indexOf(n) === i);
  console.log(`\nResolviendo ${nombresFuente.length} nombres de las fuentes contra EIDOS…`);
  const resueltas = new Map();
  let n = 0;
  for (const nombre of nombresFuente) {
    if (++n % 50 === 0) process.stderr.write(`  … ${n}/${nombresFuente.length}\n`);
    resueltas.set(nombre, await resuelve(nombre));
  }
  const erroresEidos = [...resueltas.entries()].filter(([, r]) => r.error);

  const idxSitio = respaldo.indexa(declaradasSitio, {
    nombreDe: e => e.scientificName, resueltas, equivalencias: equiv.mapa,
  });
  const idxAnexo = respaldo.indexa(anexo.entradas, {
    // El anexo ya trae su propia corrección a mano (`nombreCorregido`), que se indexa además del
    // verbatim: es el mismo mecanismo que la tabla de equivalencias, más antiguo y por espacio.
    nombreDe: e => e.scientificName, resueltas, equivalencias: equiv.mapa,
  });
  for (const e of anexo.entradas) {
    const c = binomio(e.nombreCorregido || '');
    if (!c) continue;
    if (!idxAnexo.mapa.has(c)) idxAnexo.mapa.set(c, []);
    idxAnexo.mapa.get(c).push(e);
  }

  // --- Decidir, ave a ave --------------------------------------------------------------------------
  const zepaDelEspacio = (sitios.find(s => /ZEPA/i.test(s.figura || '')) || {}).code || null;
  const conRespaldo = [], sinRespaldo = [];
  const casadasSitio = new Set();
  for (const a of aves) {
    // Del lado del catálogo la clave es su propio nombre y su `eidosTaxonId`, que es la clave maestra
    // del modelo. No se vuelve a salir a EIDOS: la ficha ya lo trae resuelto.
    const clave = { scientificName: a.scientificName, eidosTaxonId: a.eidosTaxonId };
    const enSitio = respaldo.busca(idxSitio.mapa, clave);
    const enAnexo = respaldo.busca(idxAnexo.mapa, clave);
    if (enSitio) for (const e of enSitio) casadasSitio.add(e.scientificName);
    if (enSitio || enAnexo) conRespaldo.push({ ficha: a, enSitio, enAnexo });
    else sinRespaldo.push(a);
  }

  // Lo que el sitio declara y el catálogo no ficha: el hueco por el otro lado, que es por donde se
  // amplía el catálogo de aves de un espacio.
  const declaradasSinFicha = declaradasSitio
    .filter(e => e.grupoCodigo === 'B' && !casadasSitio.has(e.scientificName));
  // Y de esas, cuáles se parecen a un ave del catálogo por el epíteto. NUNCA se aplica: es la lista
  // de lo que hay que mirar a mano para decidir si falta una equivalencia (ver la cabecera de
  // lib/respaldo-sitio.js: de nueve pares que propone, tres son especies distintas).
  const aVerificar = respaldo.probablesCambiosDeGenero(declaradasSinFicha, aves);

  // Un mismo puente puede tenderse dos veces —el ave figura en el formulario del sitio Y en el
  // anexo—, y enseñarlo repetido haría pensar que hay dos equivalencias distintas.
  const puentes = [...idxSitio.puentes, ...idxAnexo.puentes]
    .filter((p, i, a) => a.findIndex(x => x.nombre === p.nombre && x.clave === p.clave) === i);

  console.log(`\nAves con respaldo de sitio: ${conRespaldo.length}`);
  console.log(`Aves SIN respaldo (se retiran): ${sinRespaldo.length}`);
  console.log(`Declaradas por el sitio y sin ficha: ${declaradasSinFicha.length}`);
  if (puentes.length) {
    const p = puentes;
    console.log(`\nPuentes de nomenclatura tendidos: ${p.length}`);
    for (const x of p) console.log(`   ${x.nombre}  →  ${x.clave}  (${x.via})`);
  }
  if (aVerificar.length) {
    console.log(`\n⚠ ${aVerificar.length} declarada(s) sin ficha se parecen por el epíteto a un ave del`);
    console.log('  catálogo. NO se han aplicado: mirar una a una y, si son la misma, dar de alta la');
    console.log(`  equivalencia en ${rel(respaldo.RUTA_EQUIVALENCIAS)}`);
    for (const x of aVerificar) console.log(`   ${x.nombreEnLaFuente}  ≟  ${x.candidatos.join(' / ')}`);
  }
  if (erroresEidos.length) {
    console.log(`\n⚠ ${erroresEidos.length} nombre(s) de fuente que EIDOS no pudo resolver: el puente de esos`);
    console.log('  se queda en el binomio, así que puede faltar respaldo por un fallo de red y no por el dato.');
  }

  // --- Escribir ------------------------------------------------------------------------------------
  const retiradas = new Set(sinRespaldo.map(s => s.id));
  const quedan = species.filter(s => !retiradas.has(s.id));
  let notasLimpiadas = 0, zepaCorregidos = 0;
  for (const { ficha, enSitio } of conRespaldo) {
    const nota = limpiaNota(ficha.reviewNote);
    if (nota !== (ficha.reviewNote || null)) { ficha.reviewNote = nota; notasLimpiadas++; }
    const code = sitioQueLaDeclara(enSitio, zepaDelEspacio);
    if ((ficha.zepaSiteCode || null) !== code) { ficha.zepaSiteCode = code; zepaCorregidos++; }
  }
  doc.species = quedan;
  // El inverso especie↔hábitat: un ave retirada que colgaba de un hábitat deja su id en
  // `speciesIds`, y eso es una referencia rota que el validador sí ve.
  const porHabitat = new Map((doc.habitats || []).map(h => [h.id, []]));
  for (const sp of quedan) for (const hid of sp.habitatIds || []) if (porHabitat.has(hid)) porHabitat.get(hid).push(sp.id);
  for (const h of doc.habitats || []) h.speciesIds = (porHabitat.get(h.id) || []).sort((a, b) => a - b);

  const antesTexto = fs.readFileSync(parkPath, 'utf8');
  const nuevoTexto = JSON.stringify(doc, null, 2) + '\n';
  const cambia = antesTexto !== nuevoTexto;
  manifest.counts = manifest.counts || {};
  manifest.counts.species = quedan.length;
  const manifestAntes = fs.readFileSync(manifestPath, 'utf8');
  if (cambia) {
    manifest.version = (Number(manifest.version) || 0) + 1;
    manifest.updatedAt = hoy();
  }
  const manifestNuevo = JSON.stringify(manifest, null, 2) + '\n';

  console.log(`\nreviewNote estructurales retiradas: ${notasLimpiadas} · zepaSiteCode corregidos: ${zepaCorregidos}`);
  const escribir = (p, txt, previo) => {
    if (previo === txt) return `= ${rel(p)}`;
    if (WRITE) fs.writeFileSync(p, txt, 'utf8');
    return `${WRITE ? '+' : '~'} ${rel(p)}`;
  };
  console.log(escribir(parkPath, nuevoTexto, antesTexto));
  console.log(escribir(manifestPath, manifestNuevo, manifestAntes));

  const informe = redactaInforme({
    entrada, sitioDoc, sitios, anexo, equiv, conRespaldo, sinRespaldo,
    declaradasSinFicha, aVerificar, puentes,
    erroresEidos, totalAves: aves.length, totalFichas: species.length,
  });
  if (WRITE) { fs.mkdirSync(OUT_DIR, { recursive: true }); fs.writeFileSync(RUTA_INFORME, informe, 'utf8'); }
  console.log(`${WRITE ? '+' : '~'} ${rel(RUTA_INFORME)}`);

  if (CON_SQL) {
    const sql = redactaSql(entrada, sinRespaldo);
    if (sinRespaldo.length) {
      if (WRITE) fs.writeFileSync(RUTA_SQL, sql, 'utf8');
      console.log(`${WRITE ? '+' : '~'} ${rel(RUTA_SQL)} (${sinRespaldo.length} borrado(s))`);
    } else if (fs.existsSync(RUTA_SQL)) {
      // Sin nada que retirar, el SQL de la pasada anterior es una orden de borrado que ya se aplicó y
      // que volver a ejecutar no haría daño pero sí confunde: el fichero es el estado, no un histórico.
      console.log(`= ${rel(RUTA_SQL)} (nada nuevo que retirar; se conserva el de la poda ya aplicada)`);
    } else {
      console.log('  (nada que retirar: no se escribe SQL)');
    }
  }
  if (!WRITE) console.log('\nSimulación: no se ha escrito nada. Añade --write para aplicarlo.');
  if (WRITE) require('../lib/io').writeJson(CACHE, cache);
}

/*
 * El borrado, explícito y con los nombres uno a uno.
 *
 * Se borra por `scientific_name` dentro del parque, que es la clave única del esquema, y NO por id:
 * los `id` de `species` son autoincrementales de la base de datos y no tienen por qué coincidir con
 * los del `park.json` de este repositorio. Borrar por número sería borrar a ciegas.
 *
 * `species_habitats` cae solo (ON DELETE CASCADE). `user_occurrences` NO: el esquema deja a propósito
 * esa tabla sin clave foránea para que regenerar el catálogo no se lleve por delante la observación
 * de una persona, que es dato propio y no derivado, y que además lleva su taxonomía copiada.
 */
function redactaSql(entrada, retiradas) {
  const l = [];
  l.push(`-- ${entrada.name} (${PARK}) · retirada de las aves sin respaldo de sitio`);
  l.push(`-- Generado el ${hoy()} por Tools/catalogo-nacional/poda-aves-sin-respaldo.js`);
  l.push('--');
  l.push('-- Estas aves estaban en el catálogo del espacio por sus ocurrencias de GBIF, que en un ave');
  l.push('-- no miden pertenencia al espacio: vuela, y un registro en vuelo cae dentro de cualquier');
  l.push('-- recinto. Ninguna fuente oficial de sitio —el Formulario Normalizado de Datos del sitio');
  l.push('-- Red Natura 2000 ni el anexo normativo del plan de gestión— las sitúa aquí.');
  l.push('--');
  l.push('-- HACE FALTA porque build-park-sql.js solo hace UPSERT: regenerar el -n2.sql corrige y da de');
  l.push('-- alta, pero no retira nada. Sin este fichero, la API sigue sirviendo las aves podadas.');
  l.push('--');
  l.push('-- ANTES DE APLICARLO, dos cosas:');
  l.push('--   · Haz copia (npm run db:backup). Un DELETE no se deshace con otra pasada.');
  l.push('--   · user_progress.payload indexa los descubrimientos por el species_id de cada parque, así');
  l.push('--     que quien hubiera descubierto una de estas aves conserva una marca que ya no apunta a');
  l.push('--     ninguna ficha. Después de aplicar esto hay que pasar');
  l.push('--     Tools/recalculate-account-progress.php para que el progreso y los logros cuadren.');
  l.push('--   · Las citas Darwin Core (user_occurrences) NO se tocan: no tienen clave foránea a');
  l.push('--     species precisamente para esto, y llevan su taxonomía copiada.');
  l.push('');
  l.push('START TRANSACTION;');
  l.push('');
  l.push('DELETE sp FROM species sp');
  l.push('JOIN parks pk ON pk.id = sp.park_id');
  l.push(`WHERE pk.slug = ${sqlStr(PARK)}`);
  l.push('  AND sp.scientific_name IN (');
  const nombres = [...retiradas].sort((a, b) => a.scientificName.localeCompare(b.scientificName));
  nombres.forEach((s, i) => {
    l.push(`    ${sqlStr(s.scientificName)}${i < nombres.length - 1 ? ',' : ''}` +
      `  -- ${s.commonName || '—'}`);
  });
  l.push('  );');
  l.push('');
  l.push('COMMIT;');
  l.push('');
  l.push('-- Comprobación: debe devolver 0 aves de las retiradas y el total esperado del espacio.');
  l.push('SELECT');
  l.push(`    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id` +
    ` WHERE p.slug = ${sqlStr(PARK)}) AS especies_del_espacio,`);
  l.push(`    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id` +
    ` WHERE p.slug = ${sqlStr(PARK)} AND s.scientific_name IN (` +
    nombres.map(s => sqlStr(s.scientificName)).join(', ') + ')) AS retiradas_que_siguen;');
  return l.join('\n') + '\n';
}

function redactaInforme(d) {
  const l = [];
  l.push(`# ${d.entrada.name} · poda de aves sin respaldo de sitio`, '');
  l.push(`Generado el ${hoy()} por \`Tools/catalogo-nacional/poda-aves-sin-respaldo.js\`.`, '');
  l.push(`El espacio tenía **${d.totalAves} aves** de ${d.totalFichas} fichas. Conservan su plaza ` +
    `**${d.conRespaldo.length}**; se retiran **${d.sinRespaldo.length}**.`, '');
  l.push('Una especie entra en el catálogo de un espacio por CONSTANCIA: que GBIF la haya registrado ' +
    'dentro de sus polígonos de hábitat. Para un ave esa prueba no mide lo que dice medir —vuela, y ' +
    'un registro en vuelo cae dentro de cualquier recinto—, así que su puerta es el **respaldo de ' +
    'sitio**: que una fuente oficial afirme por escrito que pertenece a ESTE sitio. Son dos, y ' +
    'cualquiera de las dos vale: el Formulario Normalizado de Datos del sitio Red Natura 2000 y el ' +
    'anexo normativo del plan de gestión del espacio.', '');

  l.push('## Las fuentes de respaldo de este espacio', '');
  if (!d.sitioDoc) {
    l.push('· **Formulario del sitio: no consultado.** No existe el volcado.', '');
  } else if (!d.sitios.length) {
    l.push('· **Formulario del sitio: este espacio no solapa con ningún sitio Red Natura 2000.** Es ' +
      'dato oficial, no un hueco: no hay formulario del que sacar una lista, y el único respaldo ' +
      'posible de sus aves es el anexo normativo.', '');
  } else {
    l.push('| Sitio | Figura | Formulario | Aves declaradas |', '|---|---|---|---:|');
    for (const s of d.sitios) {
      const aves = (d.sitioDoc.especies || []).filter(e => e.siteCode === s.code && e.grupoCodigo === 'B').length;
      l.push(`| ${s.code} ${s.name || ''} | ${s.figura || '—'} | ${s.año || '—'} | ${aves} |`);
    }
    l.push('');
  }
  l.push(d.anexo.consultado
    ? `· **Anexo normativo:** ${d.anexo.entradas.length} especies enumeradas` +
      (d.anexo.fuente ? ` · ${d.anexo.fuente.cita || d.anexo.fuente.norma}` : '')
    : '· **Anexo normativo: no consultado.** Este espacio no tiene entrada en ' +
      '`data/anexos-normativos.json`. No es que carezca de norma con inventario: es que nadie la ha ' +
      'leído todavía, y hasta que se lea, sus aves solo pueden apoyarse en el formulario del sitio.', '');

  if (d.puentes.length) {
    l.push('', '## Puentes de nomenclatura', '',
      'La fuente y el catálogo escriben la misma especie con nombres de épocas distintas. Estos son ' +
      'los cruces que se han tenido que tender para no perder un ave que su propia fuente declara. ' +
      'Se enseñan porque un puente que nadie ve es un puente que nadie revisa.', '',
      '| Nombre en la fuente | Casa con | Vía |', '|---|---|---|');
    for (const p of d.puentes) l.push(`| *${p.nombre}* | \`${p.clave}\` | ${p.via} |`);
  }

  if (d.aVerificar.length) {
    l.push('', '## A verificar a mano (NO aplicado)', '',
      'El sitio las declara, el catálogo no las ficha con ese nombre, y hay un ave del catálogo con ' +
      'el mismo epíteto específico. Puede ser la misma especie con el género cambiado, o pueden ser ' +
      'dos aves que no tienen nada que ver: *Calandrella brachydactyla* (terrera) y *Certhia ' +
      'brachydactyla* (agateador) comparten epíteto y son de familias distintas. **No se ha aplicado ' +
      'ninguna.** Si al comprobarlo resulta que son la misma, la entrada va a ' +
      '`data/equivalencias-nomenclatura.json` con su verificación.', '',
      '| Declarada por el sitio | ¿Es la misma que…? |', '|---|---|');
    for (const x of d.aVerificar) l.push(`| *${x.nombreEnLaFuente}* | *${x.candidatos.join('* / *')}* |`);
  }

  l.push('', '## Aves retiradas', '');
  if (!d.sinRespaldo.length) l.push('Ninguna: todas las aves del espacio tienen respaldo de sitio.', '');
  else {
    l.push('Ninguna fuente oficial las sitúa en este espacio. **No se pierden**: están en este ' +
      'informe con su recuento de GBIF, y vuelven al catálogo en cuanto una fuente de sitio las ' +
      'nombre — el anexo del plan de gestión del espacio es la vía, no bajar la exigencia.', '',
      '| Especie | Nombre común | Occ. GBIF |', '|---|---|---:|');
    for (const s of [...d.sinRespaldo].sort((a, b) => (b.gbifOccurrences || 0) - (a.gbifOccurrences || 0))) {
      l.push(`| *${s.scientificName}* | ${s.commonName || '—'} | ${s.gbifOccurrences ?? '—'} |`);
    }
  }

  l.push('', '## Declaradas por el sitio y sin ficha', '');
  if (!d.declaradasSinFicha.length) l.push('Ninguna: el catálogo ficha todas las aves que el sitio declara.', '');
  else {
    l.push('El hueco por el otro lado, y el más útil de los dos: el formulario oficial afirma que ' +
      'estas aves están en el sitio y el catálogo no las tiene. **Por aquí se amplía el catálogo de ' +
      'aves de un espacio**, no bajando el umbral de ocurrencias.', '',
      '| Especie | Sección | Sitio | Población declarada |', '|---|---|---|---|');
    for (const e of d.declaradasSinFicha) {
      const pob = [e.tipoPoblacion, e.categoriaPoblacion].filter(Boolean).join(', ') || '—';
      l.push(`| *${e.scientificName}* | ${e.seccion} | ${e.siteCode} | ${pob} |`);
    }
  }

  l.push('', '## Aves conservadas', '', '| Especie | Nombre común | Respaldo |', '|---|---|---|');
  for (const { ficha, enSitio, enAnexo } of d.conRespaldo) {
    const r = [];
    if (enSitio) r.push(`formulario ${[...new Set(enSitio.map(e => e.siteCode))].join(', ')}`);
    if (enAnexo) r.push('anexo normativo');
    l.push(`| *${ficha.scientificName}* | ${ficha.commonName || '—'} | ${r.join(' · ')} |`);
  }

  if (d.erroresEidos.length) {
    l.push('', '## Nombres de fuente que EIDOS no pudo resolver', '',
      'Su puente se queda en el binomio. Si alguno de ellos era la única forma de casar un ave, esa ' +
      'ave puede estar retirada por un fallo de red y no por el dato: constan aquí para no dar por ' +
      'comprobado lo que no se comprobó.', '', '| Nombre | Error |', '|---|---|');
    for (const [n, r] of d.erroresEidos) l.push(`| *${n}* | ${r.error} |`);
  }
  return l.join('\n') + '\n';
}

main().catch(e => die(e.stack || e.message));
