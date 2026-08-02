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
 * Ziziphus lotus). Si no hay coincidencia, se usa la de mayor `rarityScore` entre las del hábitat,
 * que suele ser la más característica; esa elección se marca con `imageNote` para poder revisarla.
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

const ROOT = path.join(__dirname, '..', '..');
const PARKS_DIR = path.join(ROOT, 'Frontend', 'Data', 'parks');
const UA = 'NaturDexBot/1.0 (https://naturdex.app; catálogo naturalista sin ánimo de lucro)';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';

const args = process.argv.slice(2);
const OPT = {
  park: args.includes('--park') ? args[args.indexOf('--park') + 1] : null,
  write: args.includes('--write'),
  sql: args.includes('--sql') ? args[args.indexOf('--sql') + 1] : null,
  width: 1280,
};

const sqlStr = v => v === null || v === undefined ? 'NULL' : `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
const sentencias = [];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const texto = h => String(h || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function commonsFileFromUrl(url) {
  if (!url || !/^https?:\/\/(upload|commons)\.wikimedia\.org/i.test(url)) return null;
  const sinQuery = url.split('?')[0];
  const especial = sinQuery.match(/Special:FilePath\/(.+)$/i);
  if (especial) return decodeURIComponent(especial[1]);
  const partes = sinQuery.split('/');
  const idx = partes.indexOf('thumb');
  return decodeURIComponent(idx >= 0 ? partes[partes.length - 2] : partes[partes.length - 1]);
}

async function atribucionCommons(file) {
  await sleep(150);
  const url = `${COMMONS}?action=query&titles=${encodeURIComponent('File:' + file)}&prop=imageinfo&iiprop=extmetadata&format=json`;
  try {
    const j = await (await fetch(url, { headers: { 'User-Agent': UA } })).json();
    const meta = Object.values(j.query?.pages || {})[0]?.imageinfo?.[0]?.extmetadata;
    if (!meta) return null;
    const licencia = texto(meta.LicenseShortName?.value) || 'licencia sin especificar';
    let autor = texto(meta.Artist?.value) || texto(meta.Credit?.value) || 'autor no indicado';
    if (autor.length > 70) autor = autor.slice(0, 67) + '…';
    return `${autor} (${licencia}) · Wikimedia Commons`;
  } catch { return null; }
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
    .filter(s => s && s.image);
  if (!candidatas.length) return null;
  // De la cita fitosociológica solo interesa el nombre de la asociación (las dos primeras palabras);
  // lo que sigue es autor y año, y ahí hay apellidos que colisionan con géneros: "Festucetum
  // hystricis Font Quer 1954" hacía que «Quer» casara con Quercus y el prado alpino acabara
  // ilustrado con una carrasca.
  const asociaciones = (habitat.fitosociologia || []).map(f => f.split(/\s+/).slice(0, 2).join(' '));
  const contexto = [habitat.name, habitat.description, ...asociaciones].join(' ').toLowerCase();
  const palabras = contexto.split(/[^a-záéíóúñ]+/i).filter(w => w.length > 3);
  const nombrada = candidatas.find(s => {
    const [genero, epiteto] = s.scientificName.toLowerCase().split(' ');
    if (contexto.includes(genero) || (epiteto && contexto.includes(epiteto))) return true;
    // Los nombres de asociación derivan del género con sufijos fijos: Sedum→Sedion,
    // Ziziphus→Ziziphetum, Malcolmia→Malcomietalia, Nerium→Nerio-Tamaricetea. Se quita el sufijo y
    // se compara la raíz con el género. Se tolera una letra de diferencia porque la nomenclatura
    // histórica no siempre respeta la grafía original (Malcomi- por Malcolmi-).
    return palabras.some(p => {
      const raiz = p.replace(/(etalia|etosum|etum|etea|ion|acea|aceae|o)$/, '');
      return raiz.length >= 4 && parecidos(genero, raiz);
    });
  });
  return nombrada ? { sp: nombrada, porNombre: true } : null;
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
  const parques = [];
  for (const region of fs.readdirSync(PARKS_DIR)) {
    const dir = path.join(PARKS_DIR, region);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const slug of fs.readdirSync(dir)) {
      if (OPT.park && slug !== OPT.park) continue;
      const f = path.join(dir, slug, 'park.json');
      if (fs.existsSync(f)) parques.push({ slug, file: f });
    }
  }

  for (const { slug, file } of parques) {
    const park = JSON.parse(fs.readFileSync(file, 'utf8'));
    const habitats = park.habitats || [];
    const species = park.species || [];
    if (!habitats.length) continue;
    console.log(`\n=== ${slug} (${habitats.length} hábitats) ===`);
    let tocado = false;

    for (const h of habitats) {
      // 1) Foto ya en Commons: canonizar y recuperar autor/licencia.
      const file2 = commonsFileFromUrl(h.image);
      if (file2) {
        const atr = await atribucionCommons(file2);
        if (atr) {
          const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file2.replace(/ /g, '_'))}?width=${OPT.width}`;
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
      console.log(`  → escrito ${path.relative(ROOT, file)}`);
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
    const destino = path.isAbsolute(OPT.sql) ? OPT.sql : path.join(ROOT, OPT.sql);
    fs.writeFileSync(destino, cabecera + sentencias.join('\n\n') + '\n', 'utf8');
    console.log(`\nSQL escrito en ${path.relative(ROOT, destino)} (${sentencias.length} UPDATE)`);
  }
})();
