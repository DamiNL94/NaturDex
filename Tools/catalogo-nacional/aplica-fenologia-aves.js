#!/usr/bin/env node
'use strict';
/*
 * aplica-fenologia-aves.js — escribe `migratory` y `sitePresence` en las aves ya fichadas.
 *
 * El problema que resuelve
 * -----------------------
 * `build-species-n2.js` ya sabe escribir la fenología desde hoy (ver `Tools/lib/fenologia.js`), pero
 * regenerar la Capa 3 de un espacio publicado significa salir a GBIF y a EIDOS y rehacer el
 * catálogo entero. Para un campo que sale de un volcado que ya está en el repo —el Formulario
 * Normalizado de Datos de cada sitio Red Natura 2000, en `out/<slug>-rn2000-sitio.json`— eso es
 * pagar un pipeline completo por un dato que no depende de él.
 *
 * Así que esta herramienta hace SOLO eso, sobre los park.json que ya existen, con la misma función
 * de clasificación que usa el pipeline. Las dos leen `Tools/lib/fenologia.js`: si el criterio
 * cambia, cambia en un sitio y las dos puntas dicen lo mismo. Esa es la trampa nº 9 del CLAUDE.md
 * raíz —una corrección hecha en el park.json y no en el pipeline la deshace la siguiente
 * regeneración—, y por eso el criterio no se reescribe aquí.
 *
 * El cruce por nombre, que es donde esto se rompe en silencio
 * -----------------------------------------------------------
 * El formulario cita con la nomenclatura de su época (*Sylvia undata*) y el catálogo con la de hoy
 * (*Curruca undata*). Cruzar a pelo no falla: deja el ave sin clasificar y sin decirlo. El puente es
 * el de `Tools/lib/respaldo-sitio.js` —binomio, nombre aceptado en EIDOS, y la tabla de
 * equivalencias verificadas a mano—, y lo que ninguna capa cierra **sale listado**, nunca adivinado.
 *
 * LA CAPA DE EIDOS, QUE FALTABA (`--online`, 2026-08-25)
 * -----------------------------------------------------
 * Hasta hoy esta herramienta se saltaba la capa 2 del puente —resolver contra EIDOS el nombre DE LA
 * FUENTE— porque es asíncrona y con red, y se dejaba escrito que quien tuviera huecos los cerrara
 * «dando de alta la equivalencia». Eso era una trampa: el propio
 * `data/equivalencias-nomenclatura.json` dice, con nombres y apellidos, que **no** se den de alta
 * equivalencias que EIDOS ya sabe —cita *Larus ridibundus* → *Chroicocephalus ridibundus*,
 * *Catharacta skua* → *Stercorarius skua*, *Sylvia cantillans* → *Curruca cantillans* y
 * *Phalacrocorax aristotelis* → *Gulosus aristotelis*— porque serían una segunda verdad que puede
 * divergir de la primera. Así que la única salida honrada estaba cerrada por los dos lados y la
 * deuda nº 35 no se podía pagar: eran **53 entradas en 12 espacios**, y cada una es un ave que su
 * formulario declara migratoria y que se quedaba fuera de la pestaña «Migratorias».
 *
 * Con `--online` la capa 2 se hace aquí, igual que la hace el pipeline, y con caché en
 * `out/fenologia-eidos-fuente-cache.json` para no repetir peticiones entre pases. Sin la bandera el
 * comportamiento es el de antes: dos capas y los huecos listados.
 *
 * Idempotente: un segundo pase no cambia un byte. Sin `--write` no toca nada y solo informa.
 *
 * Uso:
 *     node Tools/catalogo-nacional/aplica-fenologia-aves.js [--park <slug>] [--write] [--online]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag, sleep } = require('../lib/cli');
const { OUT_DIR, readJson, readJsonIf, writeJson, rel, parkFiles } = require('../lib/io');
const { clasificaPresenciaSitio } = require('../lib/fenologia');
const { resolveTaxon } = require('../lib/eidos');
const { cargaEquivalencias, indexa, busca, probablesCambiosDeGenero } = require('../lib/respaldo-sitio');

const PARK = arg('park', null);
const WRITE = flag('write');
const ONLINE = flag('online');

// La caché de la capa 2, compartida por todos los espacios: el nombre de la fuente no depende de en
// cuál salga, y los formularios repiten las mismas aves de sitio en sitio (*Larus ridibundus* está
// en siete). Sin ella, cada pase gastaría las mismas peticiones otra vez.
const CACHE_FILE = path.join(OUT_DIR, 'fenologia-eidos-fuente-cache.json');

/**
 * El nombre de la fuente reducido a «Género epíteto» para poder consultarlo.
 *
 * NO sirve el `binomio()` de `lib/atlas.js`, que es la clave de COTEJO —minúsculas y con la
 * terminación de género recortada («larus ridibund»)— y no un nombre: EIDOS consulta por prefijo y
 * con esa clave devuelve cero siempre. Aquí solo se quitan la salvedad entre paréntesis y el tercer
 * epíteto, que es lo que el formulario añade y la lista patrón no lleva.
 */
function nombreConsultable(nombre) {
  const limpio = String(nombre || '').replace(/[([].*$/, ' ').replace(/\s+/g, ' ').trim();
  const p = limpio.split(' ');
  if (p.length < 2) return null;
  const dos = `${p[0]} ${p[1]}`;
  return dos === String(nombre || '').trim() ? null : dos;
}

/**
 * Resuelve contra EIDOS los nombres de la FUENTE que se piden, y devuelve el Map que espera
 * `indexa()`. Un nombre que EIDOS no resuelve se cachea igual, como `null`: «no lo resuelve» es un
 * resultado, y volver a preguntarlo en cada pase no lo cambia.
 */
async function resuelveNombresDeLaFuente(nombres) {
  const cache = readJsonIf(CACHE_FILE, {}) || {};
  const resueltas = new Map();
  let pedidas = 0;
  for (const n of nombres) {
    if (!(n in cache)) {
      // EIDOS se consulta por prefijo del nombre, así que el verbatim del formulario no vale tal
      // cual: «Sylvia cantillans ([excluding subalpina])» y «Phalacrocorax aristotelis aristotelis»
      // no empiezan por ningún nombre de su lista patrón y devuelven cero. Se prueba primero el
      // verbatim —por si la subespecie SÍ está en EIDOS, que es información más fina— y se cae al
      // «Género epíteto».
      const intentos = [n];
      const dos = nombreConsultable(n);
      if (dos) intentos.push(dos);
      cache[n] = null;
      for (const q of intentos) {
        try {
          const r = await resolveTaxon(q);
          if (r && r.acceptedName) { cache[n] = { acceptedName: r.acceptedName, taxonid: r.taxonid }; }
        } catch (e) { /* se prueba el siguiente intento */ }
        pedidas++;
        await sleep(150);
        if (cache[n]) break;
      }
    }
    if (cache[n]) resueltas.set(n, cache[n]);
  }
  if (pedidas) { fs.mkdirSync(OUT_DIR, { recursive: true }); writeJson(CACHE_FILE, cache); }
  return { resueltas, pedidas };
}

// Dónde entran los dos campos nuevos dentro de la ficha. El orden de claves del park.json lo fija
// `ORDEN` en build-species-n2.js: escribirlos al final produciría un diff completo la próxima vez
// que el pipeline regenere el espacio, aunque el dato fuera idéntico.
const ANCLA = 'zepaSiteCode';
const CAMPOS = ['migratory', 'sitePresence'];

/** ¿Es un ave? Manda la clase taxonómica, que es lo que usa el resto del pipeline. */
const esAve = (s) => ((s.taxonomy || {}).class === 'Aves') || /^ave\b/i.test(s.group || '');

/**
 * Reescribe la ficha con los dos campos colocados detrás de `zepaSiteCode`, conservando el orden de
 * todo lo demás. `valores` a `undefined` retira el campo (el ave dejó de estar en el formulario).
 */
function conFenologia(especie, valores) {
  const salida = {};
  for (const [k, v] of Object.entries(especie)) {
    if (CAMPOS.includes(k)) continue; // se vuelve a poner en su sitio, no donde estuviera
    salida[k] = v;
    if (k === ANCLA) for (const c of CAMPOS) if (valores[c] !== undefined) salida[c] = valores[c];
  }
  // Una ficha sin `zepaSiteCode` (no debería, si es un ave del formulario) no pierde el dato.
  if (!Object.prototype.hasOwnProperty.call(especie, ANCLA)) {
    for (const c of CAMPOS) if (valores[c] !== undefined) salida[c] = valores[c];
  }
  return salida;
}

async function main() {
  const espacios = parkFiles().filter(p => !PARK || p.slug === PARK);
  if (!espacios.length) {
    console.error(PARK ? `No existe Frontend/Data/parks/**/${PARK}/park.json` : 'No hay espacios.');
    process.exit(1);
  }
  const equivalencias = cargaEquivalencias();
  let totalMigratorias = 0, totalResidentes = 0, totalSinSenal = 0, totalCambios = 0;
  const huecos = [];

  // Capa 2 del puente: se resuelven de una vez TODOS los nombres de ave que declaran los formularios
  // de todos los espacios que se van a tocar. De una vez y no espacio a espacio porque las listas se
  // solapan mucho y la caché es común.
  let resueltas = new Map();
  if (ONLINE) {
    const nombres = new Set();
    for (const espacio of espacios) {
      const v = readJsonIf(path.join(OUT_DIR, `${espacio.slug}-rn2000-sitio.json`), null);
      for (const e of (v && v.especies) || []) {
        if (e.grupoCodigo === 'B' || e.grupo === 'Aves') if (e.scientificName) nombres.add(e.scientificName);
      }
    }
    const r = await resuelveNombresDeLaFuente([...nombres].sort());
    resueltas = r.resueltas;
    console.log(`EIDOS: ${resueltas.size} de ${nombres.size} nombres del formulario resueltos ` +
      `(${r.pedidas} petición(es) nueva(s); el resto, de ${rel(CACHE_FILE)}).`);
  } else {
    console.log('Sin --online: el puente se queda en el binomio y la tabla de equivalencias.\n' +
      'La capa de EIDOS —la que cierra Larus ridibundus → Chroicocephalus ridibundus— necesita red.');
  }

  for (const espacio of espacios) {
    const doc = readJson(espacio.file);
    const species = doc.species || [];
    if (!species.length) continue;

    const volcado = readJsonIf(path.join(OUT_DIR, `${espacio.slug}-rn2000-sitio.json`), null);
    const seleccion = readJsonIf(path.join(OUT_DIR, `${espacio.slug}-seleccion-especies.json`), null);

    // Un espacio SIN volcado no es un espacio sin aves migratorias: es un espacio que nadie ha
    // consultado. Se dice y se pasa de largo, en vez de retirarle la fenología a sus fichas.
    if (!volcado) {
      console.log(`\n${espacio.slug}: sin out/${espacio.slug}-rn2000-sitio.json — NO se toca.`);
      console.log('  Ejecuta antes: npm run sitio:especies -- --park ' + espacio.slug);
      continue;
    }

    // Las entradas del formulario, indexadas por todas las claves con las que puede citarlas.
    const entradasFnd = (volcado.especies || []).filter(e => e.grupoCodigo === 'B' || e.grupo === 'Aves');
    const { mapa } = indexa(entradasFnd, { nombreDe: e => e.scientificName, resueltas, equivalencias: equivalencias.mapa });

    // El nombre aceptado que la selección ya resolvió contra EIDOS, para buscar por él también.
    const aceptado = new Map();
    for (const s of (seleccion && (seleccion.especies || seleccion.seleccion)) || []) {
      if (s.nombreAceptadoEidos) aceptado.set(s.scientificName, s.nombreAceptadoEidos);
    }

    const casadas = new Set();
    let migratorias = 0, residentes = 0, sinSenal = 0, cambios = 0;
    const nuevas = species.map(s => {
      if (!esAve(s)) {
        // Una planta con estos campos es un error de un pase anterior: se retira.
        if (CAMPOS.some(c => s[c] !== undefined)) { cambios++; return conFenologia(s, {}); }
        return s;
      }
      const hit = busca(mapa, {
        scientificName: s.scientificName,
        nombreAceptado: aceptado.get(s.scientificName) || null,
        eidosTaxonId: s.eidosTaxonId,
      });
      if (hit) for (const e of hit) casadas.add(e.scientificName);
      const fen = clasificaPresenciaSitio(hit || []);
      if (!fen) sinSenal++; else if (fen.migratory) migratorias++; else residentes++;

      const valores = fen ? { migratory: fen.migratory, sitePresence: fen.sitePresence } : {};
      const antes = JSON.stringify([s.migratory, s.sitePresence]);
      const despues = JSON.stringify([valores.migratory, valores.sitePresence]);
      if (antes !== despues) cambios++;
      return conFenologia(s, valores);
    });

    // Lo que el formulario declara y el catálogo no ha sabido reconocer. Es el hueco que hay que
    // enseñar: sin esta lista, un cambio de nomenclatura se traga aves migratorias sin un aviso.
    const sinCasar = entradasFnd.filter(e => !casadas.has(e.scientificName));
    const nombresUnicos = [...new Set(sinCasar.map(e => e.scientificName))];
    if (nombresUnicos.length) {
      huecos.push({ slug: espacio.slug, nombres: nombresUnicos,
        propuestas: probablesCambiosDeGenero(nombresUnicos.map(n => ({ scientificName: n })), species) });
    }

    doc.species = nuevas;
    const antesTexto = fs.readFileSync(espacio.file, 'utf8');
    const nuevoTexto = JSON.stringify(doc, null, 2) + '\n';
    const cambia = antesTexto !== nuevoTexto;

    console.log(`\n${espacio.slug}: ${migratorias} migratorias · ${residentes} residentes declaradas · ` +
      `${sinSenal} aves sin señal del formulario`);
    if (nombresUnicos.length) console.log(`  ⚠ ${nombresUnicos.length} entradas del formulario sin casar con el catálogo`);
    if (cambia && WRITE) {
      writeJson(espacio.file, doc);
      console.log(`  escrito ${rel(espacio.file)}`);
      // El manifiesto decide si un dispositivo con el espacio guardado sin conexión vuelve a
      // descargarlo: sin subir `version`, quien ya lo tenía se queda sin la pestaña «Migratorias»
      // aunque el paquete del servidor ya la traiga. Los contadores no cambian: no entra ni sale
      // ninguna ficha.
      const manifestPath = path.join(espacio.dir, 'manifest.json');
      const manifest = readJsonIf(manifestPath, null);
      if (manifest) {
        manifest.version = (Number(manifest.version) || 0) + 1;
        manifest.updatedAt = new Date().toISOString().slice(0, 10);
        writeJson(manifestPath, manifest);
        console.log(`  escrito ${rel(manifestPath)} (version ${manifest.version})`);
      }
    } else if (cambia) console.log(`  (cambiaría ${cambios} ficha(s); usa --write)`);
    else console.log('  sin cambios');

    totalMigratorias += migratorias; totalResidentes += residentes;
    totalSinSenal += sinSenal; totalCambios += cambios;
  }

  console.log(`\nTotal: ${totalMigratorias} migratorias · ${totalResidentes} residentes declaradas · ` +
    `${totalSinSenal} aves sin señal · ${totalCambios} fichas afectadas`);

  if (huecos.length) {
    console.log('\n--- Entradas del formulario que el catálogo no reconoce ------------------------');
    console.log('No se adivinan. Cada una es o un ave que el barrido nunca vio, o el mismo ave con');
    console.log('otro nombre: eso se cierra en data/equivalencias-nomenclatura.json, a mano y con');
    console.log('su fuente (ver Tools/lib/respaldo-sitio.js).');
    for (const h of huecos) {
      console.log(`\n  ${h.slug} (${h.nombres.length}):`);
      for (const n of h.nombres) {
        const p = h.propuestas.find(x => x.nombreEnLaFuente === n);
        console.log(`    · ${n}${p ? `   ← ¿mismo epíteto que ${p.candidatos.join(', ')}? A VERIFICAR` : ''}`);
      }
    }
  }
  if (!WRITE) console.log('\n(Simulación: nada escrito. Añade --write.)');
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
