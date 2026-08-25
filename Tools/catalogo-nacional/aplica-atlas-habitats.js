#!/usr/bin/env node
'use strict';
/*
 * aplica-atlas-habitats.js — tiende en los park.json ya escritos los enlaces especie↔hábitat que el
 * Atlas respalda y que solo estaban en `out/<slug>-hic-especies.json`.
 *
 * El problema que resuelve
 * -----------------------
 * Es la deuda nº 32. `build-species-n2.js` derivaba `habitatIds` SOLO del barrido de GBIF mientras
 * escribía en el `source` de la ficha «Atlas y Manual de los Hábitats de España (MITECO, 2005):
 * especie característica de alguno de los HIC cartografiados aquí»: una especie que el Atlas da como
 * característica de un HIC del espacio pero sin ninguna ocurrencia dentro se quedaba con
 * `habitatIds: []` y un texto que decía lo contrario. El pipeline está arreglado desde el
 * 2026-08-21 —une las dos señales—, pero el arreglo solo llegó a Cabezo Gordo, que es donde salió:
 * el resto de los espacios sigue con los enlaces perdidos.
 *
 * Y regenerarlos NO es la vía. Volver a pasar `build-species-n2.js` sobre un espacio publicado
 * reescribe su catálogo entero desde la selección, y ocho de los dieciséis espacios de Murcia
 * pasaron DESPUÉS por `poda-aves-sin-respaldo.js`: su selección todavía trae las aves que la poda
 * retiró, así que regenerar las devolvería. En Sierra de la Pila son 24 fichas. Pagar eso por un
 * campo que sale de un fichero que ya está en el repo es exactamente lo que evitó
 * `aplica-fenologia-aves.js`, y esta herramienta es su pareja para los enlaces.
 *
 * Qué escribe, y por qué solo suma
 * --------------------------------
 * Añade a `habitatIds` los hábitats que el índice del Atlas respalda, al final de la lista y sin
 * tocar el orden de los que ya estaban: el pipeline deja delante los enlaces con ocurrencias
 * (`[...enlacesGbif, ...soloAtlas]`) para que la lista siga empezando por lo más medido. Mantiene en
 * pie el espejo `habitats[].speciesIds`, que es el mismo vínculo escrito por el otro lado, y añade
 * al `source` la frase del Atlas cuando la ficha no la tenía —si no, la ficha afirmaría un enlace
 * sin decir de dónde sale, que es la contradicción de la deuda nº 32 al revés—.
 *
 * NO retira nada. El Atlas se usa solo en positivo, como en el resto del pipeline: que un extractor
 * de PDF no lea un nombre no significa que el Atlas no lo dé (ver la cabecera de
 * `atlas-hic-especies.js`, que por eso admite varios textos).
 *
 * Las AVES quedan fuera por construcción: el índice del Atlas ya descarta la fauna, y la regla nº 8
 * del CLAUDE.md dice que un ave no se cuelga de un polígono.
 *
 * NO escribe en la base de datos (regla nº 2 de Tools/CLAUDE.md). Como aquí solo se AÑADEN vínculos
 * y `build-park-sql.js` hace UPSERT, basta con regenerar el SQL del espacio y aplicarlo; no hace
 * falta borrado, que es lo que sí necesitan la poda y la auditoría.
 *
 * Idempotente: un segundo pase no cambia un byte. Sin `--write` no toca nada y solo informa.
 *
 * Uso:
 *     node Tools/catalogo-nacional/aplica-atlas-habitats.js [--park <slug>] [--write]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('../lib/cli');
const { OUT_DIR, readJson, readJsonIf, writeJson, rel, parkFiles } = require('../lib/io');

const PARK = arg('park', null);
const WRITE = flag('write');

// La frase que `build-species-n2.js` pone en el `source` cuando la evidencia incluye `caracteristica`.
// Se copia literal a propósito: si las dos divergen, la ficha regenerada y la parcheada dirían cosas
// distintas del mismo dato.
const FRASE_ATLAS = 'Atlas y Manual de los Hábitats de España (MITECO, 2005): especie característica ' +
  'de alguno de los HIC cartografiados aquí';

/**
 * Mete la frase del Atlas en el `source` en el sitio que le da el pipeline: detrás del tramo de
 * GBIF, que siempre es el primero. Si ya está, se devuelve el texto tal cual.
 */
function conFraseDelAtlas(source) {
  const texto = String(source || '');
  if (texto.includes('especie característica de alguno de los HIC')) return texto;
  const partes = texto.split('; ');
  if (partes.length < 2) return texto ? `${texto}; ${FRASE_ATLAS}` : FRASE_ATLAS;
  partes.splice(1, 0, FRASE_ATLAS);
  return partes.join('; ');
}

function main() {
  const espacios = parkFiles().filter((p) => !PARK || p.slug === PARK);
  if (!espacios.length) {
    console.error(PARK ? `No existe Frontend/Data/parks/**/${PARK}/park.json` : 'No hay espacios.');
    process.exit(1);
  }

  let totalEnlaces = 0, totalFichas = 0, totalSinIndice = 0;

  for (const espacio of espacios) {
    const indice = readJsonIf(path.join(OUT_DIR, `${espacio.slug}-hic-especies.json`), null);

    // Un espacio SIN índice no es un espacio sin especies características: es uno que nadie ha
    // cruzado con el Atlas. Se dice y se pasa de largo — ausente no es cero, que es justo lo que
    // convirtió esta deuda en un fallo en verde durante doce espacios.
    if (!indice) {
      totalSinIndice++;
      console.log(`\n${espacio.slug}: sin out/${espacio.slug}-hic-especies.json — NO se toca.`);
      console.log('  Se genera con: node Tools/catalogo-nacional/atlas-hic-especies.js --atlas <atlas.txt> --park ' + espacio.slug);
      continue;
    }

    const doc = readJson(espacio.file);
    const species = doc.species || [];
    const habitats = doc.habitats || [];
    const porNombre = new Map(species.map((s) => [s.scientificName, s]));
    const porId = new Map(habitats.map((h) => [h.id, h]));

    const anadidos = [];
    const huerfanos = [];
    for (const l of indice.links || []) {
      const sp = porNombre.get(l.scientific_name);
      const hab = porId.get(l.habitat_slug);
      // Un enlace del índice que ya no encuentra su especie o su hábitat es un resto de una
      // regeneración anterior (un taxón renombrado, un recinto retirado). No se escribe y consta.
      if (!sp || !hab) { huerfanos.push(`${l.scientific_name} · ${l.habitat_slug}`); continue; }
      if ((sp.taxonomy || {}).class === 'Aves') continue; // regla nº 8: un ave no cuelga de un polígono

      sp.habitatIds = sp.habitatIds || [];
      if (sp.habitatIds.includes(hab.id)) continue;
      sp.habitatIds.push(hab.id);
      sp.source = conFraseDelAtlas(sp.source);
      anadidos.push(`${sp.scientificName} · ${hab.id}`);
    }

    // El espejo: `habitats[].speciesIds` es el MISMO vínculo escrito por el otro lado, y `validate`
    // coteja las dos listas. Se reconstruye desde `habitatIds`, que es la que manda, y se ordena por
    // `id` ascendente igual que `build-species-n2.js`: con cualquier otro orden un pase de esta
    // herramienta y uno del pipeline producirían diffs distintos con el mismo dato.
    for (const h of habitats) {
      h.speciesIds = species.filter((s) => (s.habitatIds || []).includes(h.id))
        .map((s) => s.id).sort((a, b) => a - b);
    }

    const fichas = new Set(anadidos.map((a) => a.split(' · ')[0])).size;
    const antesTexto = fs.readFileSync(espacio.file, 'utf8');
    const nuevoTexto = JSON.stringify(doc, null, 2) + '\n';
    const cambia = antesTexto !== nuevoTexto;

    console.log(`\n${espacio.slug}: ${anadidos.length} enlace(s) del Atlas en ${fichas} ficha(s)` +
      ` · ${(indice.links || []).length} en el índice`);
    for (const a of anadidos) console.log('  + ' + a);
    if (huerfanos.length) {
      console.log(`  ⚠ ${huerfanos.length} enlace(s) del índice sin destino en el catálogo de hoy:`);
      for (const h of huerfanos) console.log('    · ' + h);
    }
    if (cambia && WRITE) {
      writeJson(espacio.file, doc);
      console.log(`  escrito ${rel(espacio.file)}`);
      // El manifiesto es lo que decide si un dispositivo con el espacio guardado sin conexión vuelve
      // a descargarlo: sin subir `version`, quien ya lo tenía se queda con los enlaces viejos. Los
      // contadores no se tocan porque aquí no cambia el número de especies ni de hábitats.
      const manifestPath = path.join(espacio.dir, 'manifest.json');
      const manifest = readJsonIf(manifestPath, null);
      if (manifest) {
        manifest.version = (Number(manifest.version) || 0) + 1;
        manifest.updatedAt = new Date().toISOString().slice(0, 10);
        writeJson(manifestPath, manifest);
        console.log(`  escrito ${rel(manifestPath)} (version ${manifest.version})`);
      }
    } else if (cambia) console.log('  (usa --write para escribirlo)');
    else console.log('  sin cambios');

    totalEnlaces += anadidos.length;
    totalFichas += fichas;
  }

  console.log(`\nTotal: ${totalEnlaces} enlace(s) nuevos en ${totalFichas} ficha(s)` +
    (totalSinIndice ? ` · ${totalSinIndice} espacio(s) sin índice del Atlas` : ''));
  if (totalEnlaces && WRITE)
    console.log('Regenera el SQL de los espacios tocados: npm run park:sql -- --park <slug>');
  if (!WRITE) console.log('\n(Simulación: nada escrito. Añade --write.)');
}

main();
