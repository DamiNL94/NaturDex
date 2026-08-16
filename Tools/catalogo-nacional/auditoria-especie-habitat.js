#!/usr/bin/env node
'use strict';
/*
 * auditoria-especie-habitat.js — repasa, enlace a enlace, si cada especie pertenece de verdad a los
 * hábitats de los que cuelga.
 *
 * El problema que resuelve
 * -----------------------
 * `species_habitats` es el único dato DERIVADO del modelo (regla nº 1 de CLAUDE.md) y hoy se deriva
 * con una sola señal: **una ocurrencia de GBIF dentro del polígono**. Nadie ha vuelto a mirar lo que
 * esa regla escribió, y la regla tiene dos puntos ciegos conocidos:
 *
 *   · Un polígono pequeño no discrimina. El hábitat 7220 —manantiales petrificantes, cintas de
 *     metros dentro de una ladera seca— tenía fichadas en Carrascoy y El Valle la ardilla roja, el
 *     algarrobo y el tomillo blanco. Ninguna vive en un manantial: sus registros cayeron al lado.
 *   · Lo que vuela cae en cualquier polígono. Es la regla nº 7 del CLAUDE.md, ya aplicada a las aves
 *     al darlas de alta, pero **no** a lo que ya estaba escrito ni a los quirópteros.
 *
 * Qué coteja, y contra qué
 * ------------------------
 * No sale a la red y no inventa: los cuatro cotejos usan datos que ya están en el repositorio.
 *
 *   1. MEDIO (lib/medios.js) · el código HIC declara de qué medio es el hábitat y la ficha universal
 *      de la especie declara dónde vive. Si se contradicen, el enlace no lo afirma nadie: lo afirmó
 *      la coincidencia geográfica de un registro suelto.
 *   2. VUELO · un taxón volador (Aves, Chiroptera) colgado de un polígono. Es la regla nº 7 del
 *      CLAUDE.md, que el pipeline ya aplica al dar de alta un espacio y `validate` lleva avisando
 *      desde entonces sin que nadie pudiera limpiarlo sin regenerar la Capa 3 entera. Se aplica
 *      también a las doce aves del volcado del piloto de Cabo Cope, y conviene decir por qué: su
 *      fuente —«Región de Murcia Digital (CARM), Fauna de Cabo Cope y Puntas de Calnegre»— es una
 *      lista de fauna DEL ESPACIO que no dice en qué hábitat vive cada ave, así que el reparto por
 *      polígonos no lo afirma la fuente sino quien montó el piloto. Un enlace puesto a ojo es
 *      exactamente lo que prohíbe la regla nº 2.
 *   3. CONSTANCIA · cuántas ocurrencias sostienen el enlace, leídas del barrido versionado
 *      `out/<slug>-gbif.json`. Un enlace con cero es una afirmación que la propia fuente desmiente.
 *   4. ATLAS · si el «Atlas y Manual de los Hábitats de España» da la especie como característica de
 *      ese HIC (out/<slug>-hic-especies.json), el enlace se sostiene sin ocurrencia ninguna: es
 *      evidencia `caracteristica`, y manda sobre los otros tres cotejos.
 *
 * Qué retira y qué solo anota
 * ---------------------------
 * Retirar un enlace es retirar una afirmación, no crear un dato: es la versión de «hueco documentado
 * antes que dato inventado» que le toca a esta capa. Aun así solo se retira lo que no tiene defensa:
 * la contradicción de medio en un hábitat acuático, el enlace de vuelo derivado de ocurrencias y el
 * enlace con cero ocurrencias. Todo lo demás —y en particular los 1.300 enlaces que se sostienen
 * sobre UN registro— se anota en el informe y se queda: bajar ahí el listón dejaría a la mitad del
 * catálogo de El Carche sin ningún hábitat del que colgar, y esa es una decisión de producto que no
 * se toma dentro de una auditoría. `--umbral N` existe para tomarla a propósito el día que se tome.
 *
 * Idempotente: un segundo pase no cambia un byte. NO escribe en la base de datos (regla nº 2 de
 * Tools/CLAUDE.md): `--sql` deja el borrado redactado en `Database/enlaces-retirados-<slug>.sql`
 * para aplicarlo a mano, y hace falta porque `build-park-sql.js` **solo hace UPSERT** —regenerar el
 * `-n2.sql` da de alta los enlaces que quedan pero no retira ninguno— y la API manda sobre el
 * `park.json` empaquetado (§2 del CLAUDE.md).
 *
 * Uso:
 *     node Tools/catalogo-nacional/auditoria-especie-habitat.js [--park <slug>] [--write] [--sql]
 *                                                               [--umbral <n>] [--informe <ruta>]
 */

const fs = require('fs');
const path = require('path');
const { arg, num, flag } = require('../lib/cli');
const { DATABASE, OUT_DIR, readJson, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');
const { cotejaMedio, MEDIOS_EXIGENTES } = require('../lib/medios');
const { sqlStr } = require('../lib/sql');

const PARK = arg('park');
const WRITE = flag('write');
// El umbral de ocurrencias por enlace. 1 = el criterio vigente (basta un registro dentro del
// polígono). Subirlo convierte los enlaces de constancia mínima en retirables, y por eso NO es lo
// que hace esta herramienta por defecto: ver la cabecera.
const UMBRAL = Math.max(1, num('umbral', 1));
const INFORME = fromRoot(arg('informe', 'Docs/auditoria-especie-habitat.md'));
const INFORME_JSON = path.join(OUT_DIR, 'auditoria-especie-habitat.json');
// --sql escribe el borrado para la base de datos. Va aparte de --write porque son dos destinos con
// dos ritmos: el park.json se corrige en el repositorio y el SQL se aplica cuando alguien tenga la
// base delante y la copia hecha.
const SQL = flag('sql');

// Clases y grupos que vuelan. La regla nº 7 se escribió para las aves; un quiróptero tiene el mismo
// problema por el mismo motivo —se le mide el vuelo, no el sitio donde vive— y su ficha lo dice
// sola: *Rhinolophus ferrumequinum* declara «cuevas, minas y desvanes» y colgaba de cuatro
// polígonos de matorral por DOS registros.
const VUELA = (s) => /^Ave/i.test(s.group || '') || /murci[ée]lago|quir[óo]ptero/i.test(s.group || '')
  || (s.taxonomy || {}).class === 'Aves' || (s.taxonomy || {}).order === 'Chiroptera';

// Los seis veredictos posibles de un enlace. El orden de esta lista es el de gravedad y el que usa
// el informe; `retira` dice cuáles se aplican con --write.
const VEREDICTOS = {
  'medio-contradictorio': { retira: true, titulo: 'Contradicción de medio' },
  vuelo: { retira: true, titulo: 'Taxón volador enlazado por sus ocurrencias' },
  'sin-constancia': { retira: true, titulo: 'Sin ninguna ocurrencia en ese polígono' },
  'constancia-minima': { retira: false, titulo: 'Constancia mínima (aviso)' },
  'no-evaluable': { retira: false, titulo: 'No evaluable' },
  caracteristica: { retira: false, titulo: 'Característica del HIC (Atlas)' },
  respaldado: { retira: false, titulo: 'Respaldado' },
};

// --- Fuentes de evidencia ------------------------------------------------------------------------

/**
 * Índice del Atlas por código HIC, juntando los volcados de todos los espacios que lo tienen.
 *
 * Juntarlos es legítimo y no mezcla ámbitos: la especie característica de un HIC lo es en toda la
 * Directiva, igual que la descripción del código. Cada fichero está cruzado con el catálogo de SU
 * espacio, así que la unión amplía la cobertura pero sigue siendo incompleta — y por eso este índice
 * se usa SOLO en positivo: que un nombre no esté no significa que el Atlas no lo dé.
 */
function indiceAtlas() {
  const porHic = new Map();
  if (!fs.existsSync(OUT_DIR)) return porHic;
  for (const f of fs.readdirSync(OUT_DIR).filter(n => /-hic-especies\.json$/.test(n))) {
    const doc = readJson(path.join(OUT_DIR, f));
    for (const [hic, v] of Object.entries(doc.hic || {})) {
      if (!porHic.has(hic)) porHic.set(hic, new Set());
      for (const nombre of v.especies || []) porHic.get(hic).add(nombre);
    }
  }
  return porHic;
}

/**
 * El barrido de GBIF de un espacio, indexado por slug de hábitat. Devuelve `null` si el espacio no
 * lo tiene versionado, que es lo que convierte sus enlaces en NO evaluables por constancia.
 *
 * Se indexa por CLAVE de GBIF y, de reserva, por nombre. El orden no es un detalle: cruzar por
 * nombre es la trampa documentada del §2 del CLAUDE.md —la fuente cita *Rosmarinus officinalis* y
 * GBIF sirve *Salvia rosmarinus*—, y con el nombre solo salían 94 «enlaces sin constancia» que eran
 * todos el mismo puñado de especies renombradas. Con la clave delante quedan tres, y los tres son de
 * verdad un nombre que el barrido no conoce.
 */
function barridoDe(slug) {
  const f = path.join(OUT_DIR, `${slug}-gbif.json`);
  if (!fs.existsSync(f)) return null;
  const doc = readJson(f);
  const porHabitat = new Map();
  const conocidas = new Set();
  for (const h of doc.habitats || []) {
    const m = new Map();
    for (const s of h.species || []) {
      m.set('k:' + s.speciesKey, s.occurrences);
      m.set('n:' + s.name, s.occurrences);
      conocidas.add('k:' + s.speciesKey);
      conocidas.add('n:' + s.name);
    }
    porHabitat.set(h.slug, m);
  }
  return { porHabitat, conocidas };
}

/** Ocurrencias de una especie en un polígono según el barrido; `undefined` si no la localiza. */
function ocurrenciasEn(barrido, especie, habitatId) {
  const m = barrido.porHabitat.get(habitatId);
  if (!m) return undefined;
  const porClave = especie.gbifSpeciesKey ? m.get('k:' + especie.gbifSpeciesKey) : undefined;
  return porClave !== undefined ? porClave : m.get('n:' + especie.scientificName);
}

/** ¿Localiza el barrido a esta especie en ALGÚN polígono? Distingue «no está ahí» de «no la conozco». */
function laConoceElBarrido(barrido, especie) {
  return (especie.gbifSpeciesKey && barrido.conocidas.has('k:' + especie.gbifSpeciesKey))
    || barrido.conocidas.has('n:' + especie.scientificName);
}

// --- El cotejo de un enlace ----------------------------------------------------------------------

/**
 * Veredicto de UN enlace especie↔hábitat, con su motivo escrito. El orden de las comprobaciones es
 * el criterio: el Atlas manda sobre todo lo demás (es la evidencia `caracteristica`, el backbone
 * determinista del modelo), y a partir de ahí se mira lo que descalifica antes que lo que respalda.
 */
function veredicto(especie, habitat, ctx) {
  const hic = habitat.code;
  const esCaracteristica = (ctx.atlas.get(String(hic)) || new Set()).has(especie.scientificName);
  if (esCaracteristica) {
    return { veredicto: 'caracteristica', motivo: `el Atlas la da como característica del HIC ${hic}`, ocurrencias: null };
  }

  const barrido = ctx.barrido;
  const occ = barrido ? ocurrenciasEn(barrido, especie, habitat.id) : undefined;

  // 1) Vuelo.
  if (VUELA(especie)) {
    const porOcurrencias = typeof especie.gbifOccurrences === 'number';
    return {
      veredicto: 'vuelo', ocurrencias: occ ?? null,
      motivo: porOcurrencias
        ? 'taxón volador cuyo enlace sale del barrido de ocurrencias: un registro en vuelo cae dentro ' +
          'de cualquier polígono (CLAUDE.md, regla nº 7)'
        : 'taxón volador del volcado del piloto: la fuente que lo respalda es una lista de fauna DEL ' +
          'ESPACIO y no dice en qué hábitat vive, así que el reparto por polígonos lo puso una persona',
    };
  }

  // 2) Medio, y solo en los medios exigentes (ver lib/medios.js). Se mira antes que la constancia
  //    porque una contradicción de medio no la arregla ninguna cantidad de registros: cien
  //    ocurrencias de tomillo junto a un manantial siguen sin decir que el tomillo viva en él.
  const medio = cotejaMedio(hic, [especie.habitat, especie.group].filter(Boolean).join(' · '));
  if (medio.evaluable && medio.contradice && MEDIOS_EXIGENTES.includes(medio.medioHabitat)) {
    return { veredicto: 'medio-contradictorio', ocurrencias: occ ?? null, motivo: medio.motivo };
  }

  // 3) Constancia.
  if (!barrido) {
    return { veredicto: 'no-evaluable', ocurrencias: null, motivo: 'el espacio no tiene barrido de GBIF versionado' };
  }
  if (occ === undefined) {
    if (!laConoceElBarrido(barrido, especie)) {
      return {
        veredicto: 'no-evaluable', ocurrencias: null,
        motivo: 'el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de ' +
          'nomenclatura, no una ausencia',
      };
    }
    return { veredicto: 'sin-constancia', ocurrencias: 0, motivo: 'el barrido la sitúa en el espacio pero NO en este polígono' };
  }
  if (occ < UMBRAL) {
    return {
      veredicto: 'constancia-minima', ocurrencias: occ,
      motivo: `${occ} ocurrencia${occ === 1 ? '' : 's'} en el polígono, por debajo del umbral ${UMBRAL}`,
    };
  }
  return { veredicto: 'respaldado', ocurrencias: occ, motivo: `${occ} ocurrencias en el polígono` };
}

// --- Ajuste del `source` -------------------------------------------------------------------------

/*
 * El `source` de la ficha CUENTA los hábitats («…(5 hábitats; barrido de 2026-08-15)»). Retirar un
 * enlace sin tocar esa frase deja la ficha afirmando lo que `habitatIds` desmiente, que es
 * exactamente el defecto que ya avisa build-species-n2.js. Se reescribe solo el número, y cuando el
 * taxón se queda sin ningún hábitat se cambia la frase entera por la que usa el pipeline para las
 * aves: GBIF pasa a ser confirmación de presencia y deja de afirmar pertenencia a un polígono.
 */
const RE_FUENTE_GBIF = /GBIF: (\d+) ocurrencias? dentro de los polígonos de hábitat del espacio \((\d+) hábitats?; ([^)]*)\)/;

function ajustaFuente(source, nHab) {
  const m = RE_FUENTE_GBIF.exec(String(source || ''));
  if (!m) return source;
  const [entero, nOcc, , barrido] = m;
  if (nHab > 0) {
    return source.replace(entero, `GBIF: ${nOcc} ocurrencia${nOcc === '1' ? '' : 's'} dentro de los ` +
      `polígonos de hábitat del espacio (${nHab} hábitat${nHab === 1 ? '' : 's'}; ${barrido})`);
  }
  return source.replace(entero, `GBIF confirma su presencia con ${nOcc} ocurrencia${nOcc === '1' ? '' : 's'} ` +
    `dentro del espacio (${barrido}); un taxón volador no se adscribe a hábitats por sus ocurrencias`);
}

// --- Auditoría de un espacio ---------------------------------------------------------------------

function auditaEspacio(entrada, atlas) {
  const doc = readJson(entrada.file);
  const habitats = doc.habitats || [];
  const species = doc.species || [];
  if (!species.length || !habitats.length) return null;

  const porId = new Map(habitats.map(h => [h.id, h]));
  const barrido = barridoDe(entrada.slug);
  const ctx = { atlas, barrido };
  const enlaces = [];

  for (const s of species) {
    for (const hid of s.habitatIds || []) {
      const h = porId.get(hid);
      // La integridad referencial ya la vigila `validate`; aquí un enlace huérfano se anota y se
      // retira, porque apunta a un hábitat que no existe en este park.json.
      if (!h) {
        enlaces.push({ especie: s.scientificName, comun: s.commonName, id: s.id, habitat: hid, hic: null,
          veredicto: 'sin-constancia', motivo: 'el hábitat no existe en este park.json', ocurrencias: null });
        continue;
      }
      const v = veredicto(s, h, ctx);
      enlaces.push({ especie: s.scientificName, comun: s.commonName, id: s.id, habitat: hid, hic: h.code, ...v });
    }
  }
  return { entrada, doc, enlaces, conBarrido: !!barrido };
}

/** Aplica las retiradas al documento en memoria. Devuelve cuántos enlaces se han quitado. */
function aplica(doc, enlaces) {
  const retirar = new Map(); // id de especie -> Set de slugs de hábitat
  for (const e of enlaces) {
    if (!VEREDICTOS[e.veredicto].retira) continue;
    if (!retirar.has(e.id)) retirar.set(e.id, new Set());
    retirar.get(e.id).add(e.habitat);
  }
  let quitados = 0;
  for (const s of doc.species || []) {
    const fuera = retirar.get(s.id);
    if (!fuera || !fuera.size) continue;
    const antes = (s.habitatIds || []).length;
    s.habitatIds = (s.habitatIds || []).filter(h => !fuera.has(h));
    quitados += antes - s.habitatIds.length;
    if (s.source) s.source = ajustaFuente(s.source, s.habitatIds.length);
  }
  // Inverso especie↔hábitat, con el mismo criterio de orden que build-species-n2.js: por id, que es
  // el orden canónico del dato. El alfabético es cosa de la app, que ordena al pintar.
  const porHabitat = new Map((doc.habitats || []).map(h => [h.id, []]));
  for (const s of doc.species || []) {
    for (const hid of s.habitatIds || []) if (porHabitat.has(hid)) porHabitat.get(hid).push(s.id);
  }
  for (const h of doc.habitats || []) h.speciesIds = (porHabitat.get(h.id) || []).sort((a, b) => a - b);
  return quitados;
}

/** Escribe park.json y su manifiesto si han cambiado. Devuelve las líneas de consola. */
function escribe(entrada, doc) {
  const lineas = [];
  const previo = fs.readFileSync(entrada.file, 'utf8');
  const nuevo = JSON.stringify(doc, null, 2) + '\n';
  if (previo === nuevo) return [`= ${rel(entrada.file)}`];
  if (WRITE) fs.writeFileSync(entrada.file, nuevo, 'utf8');
  lineas.push(`${WRITE ? '+' : '~'} ${rel(entrada.file)}`);

  // El manifiesto decide si un dispositivo con el espacio guardado sin conexión vuelve a bajarlo:
  // si el contenido cambia y `version` no sube, el usuario se queda con los enlaces viejos.
  const manifestPath = path.join(entrada.dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return lineas;
  const manifest = readJson(manifestPath);
  manifest.counts = manifest.counts || {};
  manifest.counts.species = (doc.species || []).length;
  manifest.counts.habitats = (doc.habitats || []).length;
  manifest.version = (Number(manifest.version) || 0) + 1;
  manifest.updatedAt = new Date().toISOString().slice(0, 10);
  const previoM = fs.readFileSync(manifestPath, 'utf8');
  const nuevoM = JSON.stringify(manifest, null, 2) + '\n';
  if (previoM !== nuevoM) {
    if (WRITE) fs.writeFileSync(manifestPath, nuevoM, 'utf8');
    lineas.push(`${WRITE ? '+' : '~'} ${rel(manifestPath)}`);
  }
  return lineas;
}

// --- Borrado para la base de datos ---------------------------------------------------------------

/*
 * `build-park-sql.js` solo hace UPSERT, así que regenerar el `-n2.sql` de un espacio vuelve a dar de
 * alta los enlaces que quedan y **no retira** los que esta auditoría ha quitado. Y la API manda
 * sobre el `park.json` empaquetado: con backend desplegado, el usuario seguiría viendo la ardilla
 * roja en el manantial aunque el repositorio ya no la tenga. Es la trampa del §2 del CLAUDE.md, y la
 * misma que resolvió `poda-aves-sin-respaldo.js --sql` para las fichas enteras.
 *
 * Se borra por `scientific_name` + `slug` del hábitat dentro del parque, que son las claves estables
 * del esquema, y NUNCA por `id`: los de la base son autoincrementales y no tienen por qué coincidir
 * con los del `park.json`. Borrar por número sería borrar a ciegas.
 */
function redactaSql(slug, retiradas) {
  const l = [];
  l.push('-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un');
  l.push('-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.');
  l.push('SET NAMES utf8mb4;');
  l.push('');
  l.push(`-- ${slug} · retirada de ${retiradas.length} enlace(s) especie↔hábitat`);
  l.push(`-- Generado el ${new Date().toISOString().slice(0, 10)} por`);
  l.push('-- Tools/catalogo-nacional/auditoria-especie-habitat.js. El motivo de cada uno va al lado.');
  l.push('--');
  l.push('-- HACE FALTA porque build-park-sql.js solo hace UPSERT: regenerar el -n2.sql da de alta los');
  l.push('-- enlaces que quedan pero no retira ninguno. Sin este fichero la API sigue sirviéndolos.');
  l.push('--');
  l.push('-- ANTES DE APLICARLO: haz copia (npm run db:backup). Un DELETE no se deshace con otra pasada.');
  l.push('-- Esto NO borra ninguna ficha de especie ni ninguna cita de usuario: solo el vínculo con el');
  l.push('-- hábitat, así que el progreso de nadie cambia de sitio. Lo que sí cambia es el TOTAL de');
  l.push('-- especies de esos hábitats, y con él lo que hace falta para completarlos.');
  l.push('');
  l.push('START TRANSACTION;');
  l.push('');
  for (const e of retiradas) {
    l.push('DELETE sh FROM species_habitats sh');
    l.push('JOIN species sp ON sp.id = sh.species_id');
    l.push('JOIN habitats hb ON hb.id = sh.habitat_id');
    l.push('JOIN parks pk ON pk.id = sp.park_id AND pk.id = hb.park_id');
    l.push(`WHERE pk.slug = ${sqlStr(slug)} AND sp.scientific_name = ${sqlStr(e.especie)}`);
    l.push(`  AND hb.slug = ${sqlStr(e.habitat)};  -- ${e.veredicto}: ${e.motivo}`);
    l.push('');
  }
  l.push('COMMIT;');
  l.push('');
  l.push('-- Comprobación: debe devolver 0.');
  l.push('SELECT COUNT(*) AS enlaces_retirados_que_siguen');
  l.push('FROM species_habitats sh');
  l.push('JOIN species sp ON sp.id = sh.species_id');
  l.push('JOIN habitats hb ON hb.id = sh.habitat_id');
  l.push('JOIN parks pk ON pk.id = sp.park_id');
  l.push(`WHERE pk.slug = ${sqlStr(slug)} AND (`);
  retiradas.forEach((e, i) => {
    l.push(`  (sp.scientific_name = ${sqlStr(e.especie)} AND hb.slug = ${sqlStr(e.habitat)})` +
      (i < retiradas.length - 1 ? ' OR' : ''));
  });
  l.push(');');
  return l.join('\n') + '\n';
}

// --- Informe -------------------------------------------------------------------------------------

const TOPE_DETALLE = 40; // filas por espacio y veredicto en el .md; el JSON las lleva todas

function tabla(cabecera, filas) {
  return [`| ${cabecera.join(' | ')} |`, `|${cabecera.map(() => '---').join('|')}|`, ...filas].join('\n');
}

function informe(resultados, fecha) {
  const L = [];
  L.push('# Auditoría de los enlaces especie↔hábitat');
  L.push('');
  L.push(`_Generado por \`npm run especies:habitats\` el ${fecha}. No se edita a mano: se regenera._`);
  L.push('');
  L.push('El vínculo especie↔hábitat es el único dato **derivado** del modelo, y hasta ahora se derivaba');
  L.push('de una sola señal: una ocurrencia de GBIF dentro del polígono. Esta auditoría lo repasa enlace a');
  L.push('enlace contra cuatro cotejos que ya viven en el repositorio —el medio que declara el código HIC');
  L.push('frente al que declara la ficha de la especie, el vuelo del taxón, cuántas ocurrencias sostienen');
  L.push('el enlace y si el Atlas de Hábitats da la especie como característica de ese HIC—, retira lo que');
  L.push('no tiene defensa y deja escrito el resto. El criterio, y por qué cada cosa se retira o solo se');
  L.push('anota, está en la cabecera de `Tools/catalogo-nacional/auditoria-especie-habitat.js`.');
  L.push('');
  L.push('## Resumen');
  L.push('');
  const claves = Object.keys(VEREDICTOS);
  const filas = [];
  const totales = Object.fromEntries(claves.map(k => [k, 0]));
  let totalEnlaces = 0;
  for (const r of resultados) {
    const cuenta = Object.fromEntries(claves.map(k => [k, r.enlaces.filter(e => e.veredicto === k).length]));
    for (const k of claves) totales[k] += cuenta[k];
    totalEnlaces += r.enlaces.length;
    filas.push(`| ${r.entrada.slug} | ${r.enlaces.length} | ` +
      claves.map(k => cuenta[k] || '—').join(' | ') + ` | ${r.conBarrido ? 'sí' : 'no'} |`);
  }
  filas.push(`| **total** | **${totalEnlaces}** | ` + claves.map(k => `**${totales[k]}**`).join(' | ') + ' | |');
  L.push(tabla(['Espacio', 'Enlaces', ...claves.map(k => VEREDICTOS[k].titulo), 'Barrido GBIF'], filas));
  L.push('');
  const retirados = claves.filter(k => VEREDICTOS[k].retira).reduce((n, k) => n + totales[k], 0);
  L.push(`**Se retiran ${retirados} enlaces de ${totalEnlaces}.** Los ${totales['no-evaluable']} no evaluables` +
    (totales['constancia-minima'] ? ` y los ${totales['constancia-minima']} de constancia mínima` : '') +
    ' **no se tocan**:');
  L.push('quedan aquí escritos como hueco a contrastar, que es lo que manda la regla nº 2 del `CLAUDE.md`.');
  L.push('');
  if (!retirados) {
    L.push('> Este informe es **el estado de hoy, no un histórico**: se regenera entero en cada pasada, igual');
    L.push('> que hace `build-species-n2.js` con su lista de pendientes. Un cero en las tres columnas de');
    L.push('> retirada significa que ahora mismo ningún enlace del catálogo contradice los cuatro cotejos —no');
    L.push('> que nunca lo hiciera—. Lo que se retiró en cada pasada queda en `Docs/rollout/ESTADO.md` y en el');
    L.push('> propio historial de git.');
    L.push('');
  }
  L.push('## Sobre cuántas ocurrencias se sostiene cada enlace');
  L.push('');
  L.push('Es el hallazgo de fondo de la auditoría y no lo arregla ninguna de las retiradas de arriba. El');
  L.push('criterio vigente da por bueno un enlace con **un** registro dentro del polígono, mientras que para');
  L.push('entrar en el catálogo a una especie se le piden dos ocurrencias en dos hábitats');
  L.push('(`data/umbrales-seleccion.json`). El listón del enlace es por tanto más bajo que el de la ficha, y');
  L.push('así se reparte hoy:');
  L.push('');
  const tramos = ['1', '2', '3-4', '5-9', '10+'];
  const cubo = (n) => (n === 1 ? '1' : n <= 2 ? '2' : n <= 4 ? '3-4' : n <= 9 ? '5-9' : '10+');
  const filasOcc = [];
  const globales = Object.fromEntries(tramos.map(t => [t, 0]));
  for (const r of resultados) {
    if (!r.conBarrido) continue;
    const cuenta = Object.fromEntries(tramos.map(t => [t, 0]));
    let n = 0;
    for (const e of r.enlaces) {
      if (typeof e.ocurrencias !== 'number' || e.ocurrencias < 1) continue;
      cuenta[cubo(e.ocurrencias)]++; globales[cubo(e.ocurrencias)]++; n++;
    }
    if (!n) continue;
    filasOcc.push(`| ${r.entrada.slug} | ${n} | ` + tramos.map(t => cuenta[t]).join(' | ') +
      ` | ${Math.round((cuenta['1'] / n) * 100)} % |`);
  }
  const nGlobal = tramos.reduce((n, t) => n + globales[t], 0);
  if (nGlobal) {
    filasOcc.push(`| **total** | **${nGlobal}** | ` + tramos.map(t => `**${globales[t]}**`).join(' | ') +
      ` | **${Math.round((globales['1'] / nGlobal) * 100)} %** |`);
    L.push(tabla(['Espacio', 'Enlaces medibles', ...tramos.map(t => t + ' occ.'), 'Sobre un solo registro'], filasOcc));
    L.push('');
    L.push('Subir el listón a dos ocurrencias es una decisión de producto, no de auditoría: dejaría sin');
    L.push('ningún hábitat del que colgar a más de la mitad del catálogo de El Carche, y una especie sin');
    L.push('hábitat solo se encuentra en «todas las especies». Se toma —si se toma— a propósito y midiendo,');
    L.push('con `--umbral 2`.');
    L.push('');
  }

  for (const r of resultados) {
    const conAlgo = r.enlaces.filter(e => !['respaldado', 'caracteristica'].includes(e.veredicto));
    if (!conAlgo.length) continue;
    L.push(`## ${r.entrada.slug}`);
    L.push('');
    for (const k of claves) {
      if (['respaldado', 'caracteristica'].includes(k)) continue;
      const lista = r.enlaces.filter(e => e.veredicto === k);
      if (!lista.length) continue;
      L.push(`### ${VEREDICTOS[k].titulo} — ${lista.length} ${VEREDICTOS[k].retira ? '(se retiran)' : '(se conservan)'}`);
      L.push('');
      // Un espacio sin barrido versionado deja TODOS sus enlaces en el mismo estado y por el mismo
      // motivo: listarlos uno a uno son cientos de filas idénticas que tapan lo que sí es hallazgo.
      const motivos = new Set(lista.map(e => e.motivo));
      if (motivos.size === 1 && !VEREDICTOS[k].retira) {
        L.push(`Los ${lista.length}, por el mismo motivo: ${[...motivos][0]}.`);
        if (!r.conBarrido) {
          L.push('');
          L.push('Se arregla con `npm run gbif:habitats -- --park ' + r.entrada.slug +
            ' --json Tools/catalogo-nacional/out/' + r.entrada.slug + '-gbif.json` (necesita red) y');
          L.push('volviendo a pasar la auditoría.');
        }
        L.push('');
        continue;
      }
      const muestra = lista.slice(0, TOPE_DETALLE);
      L.push(tabla(['Especie', 'Hábitat', 'HIC', 'Ocurr.', 'Motivo'],
        muestra.map(e => `| *${e.especie}*${e.comun && e.comun !== e.especie ? ` (${e.comun})` : ''} | ` +
          `${e.habitat} | ${e.hic || '—'} | ${e.ocurrencias === null ? '—' : e.ocurrencias} | ${e.motivo} |`)));
      if (lista.length > muestra.length) {
        L.push('');
        L.push(`_… y ${lista.length - muestra.length} más. La lista completa está en_ ` +
          '`Tools/catalogo-nacional/out/auditoria-especie-habitat.json`.');
      }
      L.push('');
    }
  }
  return L.join('\n') + '\n';
}

// --- Principal -----------------------------------------------------------------------------------

function main() {
  const atlas = indiceAtlas();
  const entradas = parkFiles().filter(e => !PARK || e.slug === PARK);
  if (!entradas.length) {
    console.error(`✖ ningún espacio${PARK ? ` con slug ${PARK}` : ''} en Frontend/Data/parks/`);
    process.exit(2);
  }
  console.log(`Atlas: ${atlas.size} códigos HIC con especies características.`);
  console.log(`Umbral de ocurrencias por enlace: ${UMBRAL}${UMBRAL === 1 ? ' (el criterio vigente)' : ''}\n`);

  const resultados = [];
  for (const entrada of entradas) {
    const r = auditaEspacio(entrada, atlas);
    if (!r) continue;
    resultados.push(r);
    const quitados = aplica(r.doc, r.enlaces);
    const lineas = quitados ? escribe(entrada, r.doc) : [`= ${rel(entrada.file)}`];
    const avisos = r.enlaces.filter(e => ['constancia-minima', 'no-evaluable'].includes(e.veredicto)).length;
    console.log(`▶ ${entrada.slug}: ${r.enlaces.length} enlaces · ${quitados} retirado(s) · ${avisos} anotado(s)`);
    for (const l of lineas) console.log('   ' + l);
    if (SQL && quitados) {
      const retiradas = r.enlaces.filter(e => VEREDICTOS[e.veredicto].retira);
      const destino = path.join(DATABASE, `enlaces-retirados-${entrada.slug}.sql`);
      fs.mkdirSync(DATABASE, { recursive: true });
      const texto = redactaSql(entrada.slug, retiradas);
      const previo = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8') : null;
      fs.writeFileSync(destino, texto, 'utf8');
      console.log(`   ${previo === texto ? '=' : '+'} ${rel(destino)}`);
    }
  }

  const fecha = new Date().toISOString().slice(0, 10);
  const md = informe(resultados, fecha);
  const previo = fs.existsSync(INFORME) ? fs.readFileSync(INFORME, 'utf8') : null;
  // El informe se escribe SIEMPRE, también sin --write: es el resultado de la auditoría, no un
  // efecto de aplicarla. Lo que --write decide es si se tocan los park.json.
  fs.mkdirSync(path.dirname(INFORME), { recursive: true });
  fs.writeFileSync(INFORME, md, 'utf8');
  console.log(`\n${previo === md ? '=' : '+'} ${rel(INFORME)}`);

  const previoJson = fs.existsSync(INFORME_JSON) ? fs.readFileSync(INFORME_JSON, 'utf8') : null;
  writeJson(INFORME_JSON, {
    generado: fecha, umbral: UMBRAL, aplicado: WRITE,
    espacios: resultados.map(r => ({ slug: r.entrada.slug, conBarrido: r.conBarrido, enlaces: r.enlaces })),
  });
  console.log(`${previoJson === fs.readFileSync(INFORME_JSON, 'utf8') ? '=' : '+'} ${rel(INFORME_JSON)}`);

  if (!WRITE) {
    console.log('\nSimulación: no se ha escrito ningún park.json. Repite con --write para aplicarlo.');
  } else {
    console.log('\nRecuerda: la API manda sobre el park.json empaquetado. Con backend desplegado hay que');
    console.log('generar el SQL del espacio, y el BORRADO de enlaces no lo cubre `build-park-sql.js`,');
    console.log('que solo hace UPSERT (CLAUDE.md §2).');
  }
}

main();
