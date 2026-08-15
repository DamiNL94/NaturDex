#!/usr/bin/env node
/*
 * habitat-images.js — foto y atribución para la portada de cada hábitat.
 *
 * Un hábitat no es un taxón, así que no hay ninguna base de datos que devuelva "la foto del hábitat
 * 5330". Lo que sí existe es una convención razonable y ya usada en este catálogo: ilustrar el
 * hábitat con su especie diagnóstica —la que le da nombre o la más característica de su asociación
 * fitosociológica—, que sí tiene foto verificada y atribución en el catálogo universal de especies.
 *
 * Este script hace justo eso:
 *   1. Si la foto del hábitat ya está en Wikimedia Commons, le recupera autor y licencia (le
 *      faltaban a las 15 de Cabo Cope) y la deja apuntando a la URL canónica Special:FilePath.
 *   2. Si no tiene foto, o la tiene en un servidor sin atribución recuperable, la sustituye por la
 *      de su especie diagnóstica, copiando también su `imageAttribution`.
 *
 * La especie diagnóstica se elige buscando en `speciesIds` del hábitat una especie cuyo nombre
 * científico aparezca en el nombre del hábitat (p. ej. "Matorrales arborescentes de Ziziphus" →
 * Ziziphus lotus). Si NO hay coincidencia, el hábitat se queda con su portada temática: el plan B por
 * «la especie más rara del hábitat» se probó y era peor que no poner nada (ver especieDiagnostica()).
 * Este comentario decía lo contrario —que se usaba la de mayor `rarityScore`— y llevaba tiempo
 * desmintiéndolo el propio código.
 *
 * LA LICENCIA ES LISTA BLANCA, y por el mismo motivo que en `poi-images.js`: la portada de un
 * hábitat se empaqueta en la descarga sin conexión del espacio y la app la recorta y la escala, así
 * que una CC BY-NC-ND —que no admite obra derivada— no sirve aunque la foto sea perfecta. La
 * comprobación NO estaba, y por eso este script escribía en el hábitat cualquier licencia que
 * arrastrara la especie: en el catálogo de especies una NC sí entra, porque allí la foto ilustra un
 * taxón sustituible. La sesión del 2026-08-15 (b) tuvo que retirar a mano una CC BY-NC-ND de Cuatro
 * Calas, y la siguiente ejecución del pipeline volvió a escribirla. La función es la misma de
 * `poi-images.js`, importada y no copiada: dos listas se separan en cuanto alguien toca una.
 *
 * Uso:  node Tools/catalogo-nacional/habitat-images.js [--park <slug>] [--write] [--sql <fichero>]
 *
 * `--sql` genera además los UPDATE para la base de datos: hace falta porque Frontend/Js/data.js da
 * prioridad a la respuesta de la API sobre el park.json empaquetado, así que un despliegue con
 * backend seguiría sirviendo las portadas viejas.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { metadatos, atribucion, commonsFileFromUrl, filePathUrl } = require('../lib/wikimedia');
const { licenciaLibre } = require('./poi-images');
const { sqlStr } = require('../lib/sql');
const { arg, flag, num } = require('../lib/cli');
const { ROOT, parkFiles, fromRoot, rel } = require('../lib/io');

const OPT = {
  park: arg('park', null),
  write: flag('write'),
  sql: arg('sql', null),
  width: num('width', 1280),
};

const sentencias = [];

// La consulta a Commons, el nombre de archivo a partir de la URL y el formato de la atribución
// viven en Tools/lib/wikimedia.js, que es también quien aplica el estrangulamiento de peticiones
// (Commons responde 429 en cuanto varias fichas piden a la vez). Estaban duplicados aquí.
async function atribucionCommons(file) {
  const meta = await metadatos(file);
  return meta ? atribucion(meta) : null;
}

// Especie que mejor representa al hábitat entre las que tiene asignadas.
//
// Solo se acepta una especie que el propio hábitat NOMBRE: en su nombre oficial ("Matorrales
// arborescentes de Ziziphus"), en su descripción o en la asociación fitosociológica que lo define
// ("Limonio cossoniani-Lycietum intricati" → Limonium cossonianum, Lycium intricatum). Es la única
// forma de que la portada diga algo cierto sobre el hábitat.
//
// Deliberadamente NO hay plan B por "especie más rara del hábitat": se probó y era peor que no
// poner nada — asignaba la misma foto de sabina a seis hábitats distintos y la de un ajo silvestre
// a tres. Sin coincidencia, el hábitat se queda con su portada temática, que al menos no miente.
function especieDiagnostica(habitat, species) {
  const candidatas = (habitat.speciesIds || [])
    .map(id => species.find(s => s.id === id))
    .filter(s => s && s.image && portadaUsable(s));
  if (!candidatas.length) return null;
  // De la cita fitosociológica solo interesa el nombre de la asociación (las dos primeras palabras);
  // lo que sigue es autor y año, y ahí hay apellidos que colisionan con géneros: "Festucetum
  // hystricis Font Quer 1954" hacía que «Quer» casara con Quercus y el prado alpino acabara
  // ilustrado con una carrasca.
  const asociaciones = (habitat.fitosociologia || []).map(f => f.split(/\s+/).slice(0, 2).join(' '));
  const contexto = [habitat.name, habitat.description, ...asociaciones].join(' ').toLowerCase();
  const palabras = contexto.split(/[^a-záéíóúñ]+/i).filter(w => w.length > 3);
  // Se PUNTÚA a cada candidata y gana la mejor, en vez de quedarse con la primera que casa de
  // cualquier manera. El orden de `speciesIds` no dice nada sobre el hábitat, y dejarlo decidir
  // produce portadas falsas cuando hay congéneres: los «Encinares de Quercus ilex y Quercus
  // rotundifolia» de Sierra de Salinas salían ilustrados con una coscoja —Quercus coccifera, que
  // también está en el hábitat— bajo la nota «la especie que da nombre al hábitat»; y los
  // «Matorrales arborescentes de Juniperus spp.», con esa misma coscoja en vez de con un enebro.
  const nombre = String(habitat.name || '').toLowerCase();
  function puntua(s) {
    const [genero, epiteto] = s.scientificName.toLowerCase().split(' ');
    if (epiteto && contexto.includes(genero) && contexto.includes(epiteto)) return 4; // el binomio entero
    if (nombre.includes(genero)) return 3;            // el género, en el nombre oficial del hábitat
    if (contexto.includes(genero)) return 2;          // el género, en la descripción o la asociación
    if (epiteto && contexto.includes(epiteto)) return 1;
    // Los nombres de asociación derivan del género con sufijos fijos: Sedum→Sedion,
    // Ziziphus→Ziziphetum, Malcolmia→Malcomietalia, Nerium→Nerio-Tamaricetea. Se quita el sufijo y
    // se compara la raíz con el género. Se tolera una letra de diferencia porque la nomenclatura
    // histórica no siempre respeta la grafía original (Malcomi- por Malcolmi-).
    const porRaiz = palabras.some(p => {
      const raiz = p.replace(/(etalia|etosum|etum|etea|ion|acea|aceae|o)$/, '');
      return raiz.length >= 4 && parecidos(genero, raiz);
    });
    return porRaiz ? 1 : 0;
  }
  let nombrada = null, mejor = 0;
  for (const s of candidatas) {
    const p = puntua(s);
    if (p > mejor) { mejor = p; nombrada = s; }
  }
  return nombrada ? { sp: nombrada, porNombre: true } : null;
}

// La licencia va dentro del paréntesis de la atribución que escribe el pipeline de especies:
// «Accurimbono (CC BY-SA 3.0) · Wikimedia Commons». Sin paréntesis no hay licencia que leer, y una
// licencia ilegible se rechaza igual que una prohibida: es lista blanca.
//
// NO vale quedarse con un paréntesis concreto. La atribución no tiene una posición fija para la
// licencia y los otros paréntesis son de todo tipo, a veces sin cerrar porque Commons trunca el
// nombre del autor:
//   «No machine-readable author provided. Pere prlpz assumed (based on c… (CC BY-SA 2.5) · …»
//   «Xavier Rufray (CC BY-NC 4.0) · iNaturalist/GBIF · obs. EAU (revisar: existe en salinas…)»
// Así que se miran TODOS y basta con que uno sea una licencia de la lista blanca. Sigue siendo
// lista blanca: si ninguno lo es —incluido el caso de que no haya ninguno— se rechaza.
function licenciasDeAtribucion(atr) {
  const s = String(atr || '');
  const trozos = [];
  for (let i = s.indexOf('('); i >= 0; i = s.indexOf('(', i + 1)) {
    const j = s.indexOf(')', i);
    trozos.push((j < 0 ? s.slice(i + 1) : s.slice(i + 1, j)).trim());
  }
  return trozos;
}
function licenciaDeAtribucion(atr) {
  const trozos = licenciasDeAtribucion(atr);
  return trozos.find(licenciaLibre) || trozos[trozos.length - 1] || null;
}
function atribucionLibre(atr) {
  return licenciasDeAtribucion(atr).some(licenciaLibre);
}
function portadaUsable(sp) {
  return atribucionLibre(sp.imageAttribution);
}

// ¿`raiz` es el principio de `genero` con, como mucho, una letra de diferencia?
function parecidos(genero, raiz) {
  const trozo = genero.slice(0, raiz.length);
  if (trozo === raiz) return true;
  if (Math.abs(trozo.length - raiz.length) > 1 && genero.length < raiz.length) return false;
  // Distancia de edición ≤ 1 sobre el prefijo (sustitución, inserción o borrado de una letra).
  const a = genero.slice(0, raiz.length + 1), b = raiz;
  let i = 0, j = 0, fallos = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++fallos > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return fallos + Math.abs((a.length - i) - (b.length - j)) <= 1;
}

(async () => {
  // `parkFiles` (Tools/lib/io.js) recorre Frontend/Data/parks/<provincia>/<slug>/park.json.
  const parques = parkFiles().filter(p => !OPT.park || p.slug === OPT.park);

  for (const { slug, file } of parques) {
    const park = JSON.parse(fs.readFileSync(file, 'utf8'));
    const habitats = park.habitats || [];
    const species = park.species || [];
    if (!habitats.length) continue;
    console.log(`\n=== ${slug} (${habitats.length} hábitats) ===`);
    let tocado = false;

    for (const h of habitats) {
      // 0) La portada que ya tiene, ¿pasa la lista blanca? Una que no pasa se RETIRA: dejarla es
      //    publicarla, y el motivo se escribe donde se vea en vez de perderse en esta consola.
      if (h.image && h.imageAttribution && !atribucionLibre(h.imageAttribution)) {
        const lic = licenciaDeAtribucion(h.imageAttribution) || 'licencia sin especificar';
        h.image = null; h.imageAttribution = null;
        h.imageNote = `Sin portada: la candidata localizada es ${lic}, licencia que este catálogo no ` +
          'usa para hábitats porque la portada se empaqueta en la descarga sin conexión y la app la ' +
          'recorta y escala. Hueco cerrado habiendo mirado.';
        tocado = true;
        console.log(`  ⊘ ${h.id} — portada retirada: ${lic}`);
      }

      // 1) Foto ya en Commons: canonizar y recuperar autor/licencia.
      const file2 = commonsFileFromUrl(h.image);
      if (file2) {
        const atr = await atribucionCommons(file2);
        if (atr && !atribucionLibre(atr)) {
          console.log(`  ⊘ ${h.id} — la de Commons es ${licenciaDeAtribucion(atr)}: no se escribe`);
        } else if (atr) {
          const url = filePathUrl(file2, OPT.width);
          if (h.image !== url || h.imageAttribution !== atr) {
            h.image = url; h.imageAttribution = atr; tocado = true;
            console.log(`  ↻ ${h.id} — atribución recuperada de Commons`);
          }
          continue;
        }
      }
      if (h.image && h.imageAttribution) continue;   // ya resuelto por otra vía

      // 2) Sin foto (o sin atribución posible): la de su especie diagnóstica.
      const elegida = especieDiagnostica(h, species);
      if (!elegida) { console.log(`  ✗ ${h.id} — sin especie con foto entre las suyas`); continue; }
      h.image = elegida.sp.image;
      h.imageAttribution = elegida.sp.imageAttribution;
      h.imageNote = `Portada ilustrada con ${elegida.sp.commonName} (${elegida.sp.scientificName}), ` +
        (elegida.porNombre
          ? 'la especie que da nombre al hábitat.'
          : 'la especie más singular de las citadas en este hábitat. Elección automática: conviene revisarla.');
      tocado = true;
      console.log(`  ⇄ ${h.id} — ilustrado con ${elegida.sp.scientificName}${elegida.porNombre ? '' : ' (⚠ elección automática)'}`);
    }

    for (const h of habitats) {
      sentencias.push(
        `UPDATE habitats h JOIN parks p ON p.id = h.park_id SET\n` +
        `  h.image_url = ${sqlStr(h.image)},\n` +
        `  h.image_attribution = ${sqlStr(h.imageAttribution)},\n` +
        `  h.image_note = ${sqlStr(h.imageNote)}\n` +
        `WHERE p.slug = ${sqlStr(slug)} AND h.slug = ${sqlStr(h.id)};`
      );
    }

    if (tocado && OPT.write) {
      fs.writeFileSync(file, JSON.stringify(park, null, 2) + '\n', 'utf8');
      console.log(`  → escrito ${rel(file)}`);
    } else if (tocado) {
      console.log('  (simulación: usa --write para guardar)');
    }
  }

  if (OPT.sql && sentencias.length) {
    const cabecera = [
      '-- habitats-imagenes.sql — portada, atribución y nota de cada hábitat.',
      '-- GENERADO por Tools/catalogo-nacional/habitat-images.js --sql. No editar a mano.',
      '-- Requiere las columnas habitats.image_attribution e image_note (Database/migrations.sql).',
      '', '',
    ].join('\n');
    const destino = fromRoot(OPT.sql);
    fs.writeFileSync(destino, cabecera + sentencias.join('\n\n') + '\n', 'utf8');
    console.log(`\nSQL escrito en ${rel(destino)} (${sentencias.length} UPDATE)`);
  }
})();
