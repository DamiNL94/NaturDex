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
 * el de `Tools/lib/respaldo-sitio.js` —binomio, más la tabla de equivalencias verificadas a mano—,
 * y lo que ninguna capa cierra **sale listado**, nunca adivinado. Lo que no se puede hacer aquí es
 * la capa de EIDOS (resolver el nombre de la fuente contra la autoridad), que es asíncrona y con
 * red: si quedan huecos, se cierran dando de alta la equivalencia o relanzando el pipeline.
 *
 * Idempotente: un segundo pase no cambia un byte. Sin `--write` no toca nada y solo informa.
 *
 * Uso:
 *     node Tools/catalogo-nacional/aplica-fenologia-aves.js [--park <slug>] [--write]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('../lib/cli');
const { OUT_DIR, readJson, readJsonIf, writeJson, rel, parkFiles } = require('../lib/io');
const { clasificaPresenciaSitio } = require('../lib/fenologia');
const { cargaEquivalencias, indexa, busca, probablesCambiosDeGenero } = require('../lib/respaldo-sitio');

const PARK = arg('park', null);
const WRITE = flag('write');

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

function main() {
  const espacios = parkFiles().filter(p => !PARK || p.slug === PARK);
  if (!espacios.length) {
    console.error(PARK ? `No existe Frontend/Data/parks/**/${PARK}/park.json` : 'No hay espacios.');
    process.exit(1);
  }
  const equivalencias = cargaEquivalencias();
  let totalMigratorias = 0, totalResidentes = 0, totalSinSenal = 0, totalCambios = 0;
  const huecos = [];

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
    const { mapa } = indexa(entradasFnd, { nombreDe: e => e.scientificName, equivalencias: equivalencias.mapa });

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
    if (cambia && WRITE) { writeJson(espacio.file, doc); console.log(`  escrito ${rel(espacio.file)}`); }
    else if (cambia) console.log(`  (cambiaría ${cambios} ficha(s); usa --write)`);
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

main();
