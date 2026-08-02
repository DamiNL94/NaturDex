#!/usr/bin/env node
/*
 * wikimedia-images.js — resuelve la foto de cada especie del catálogo contra Wikimedia.
 *
 * Por qué existe
 * --------------
 * Las fotos del catálogo venían de fuentes heterogéneas (GBIF/iNaturalist, Flickr, herbarios,
 * observation.org, minka…) y con dos problemas recurrentes:
 *
 *   1. URLs frágiles. Enlazar `upload.wikimedia.org/.../thumb/…/640px-Archivo.jpg` es enlazar a un
 *      *derivado cacheado*: si el archivo se renombra, se recorta o el thumb no está generado,
 *      devuelve 400/404 y la ficha se queda sin foto (le pasaba a la Tortuga mora). Además
 *      `upload.wikimedia.org` responde 429 en cuanto varias fichas piden a la vez.
 *   2. Atribución perdida. CC-BY / CC-BY-SA obligan a citar autor y licencia; había 98 fotos sin
 *      `imageAttribution`.
 *
 * Este script resuelve ambas: usa la URL canónica y estable
 * `commons.wikimedia.org/wiki/Special:FilePath/Archivo.jpg?width=N`
 * (redirección servida por MediaWiki, sobrevive a renombrados y sirve el tamaño pedido) y guarda
 * autor + licencia leídos de la propia ficha de Commons.
 *
 * La resolución en sí (cadena Wikidata → Wikipedia → Commons y descarte de mapas, láminas y fotos
 * de otra especie del género) vive en `lib/wikimedia.js`, compartida con invasoras-images.js. Aquí
 * queda el recorrido del catálogo: qué fichas hay que tocar y cómo se escriben.
 *
 * Uso
 * ---
 *   node Tools/catalogo-nacional/wikimedia-images.js --list                 (qué falta, sin tocar nada)
 *   node Tools/catalogo-nacional/wikimedia-images.js --missing --write      (rellena solo las que faltan/rotas)
 *   node Tools/catalogo-nacional/wikimedia-images.js --all --write          (reescribe todo el catálogo)
 *   node Tools/catalogo-nacional/wikimedia-images.js --park sierra-espuna --missing --write
 *
 * Opciones: --check (verifica que cargan las URLs actuales), --report <fichero.md>,
 *           --width <px> (por defecto 1280), --force (reemplaza aunque la actual cargue).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const { loads, metadatos, atribucion, filePathUrl, commonsFileFromUrl, resolver } = require('./lib/wikimedia');

const ROOT = path.join(__dirname, '..', '..');
const PARKS_DIR = path.join(ROOT, 'Frontend', 'Data', 'parks');

const args = process.argv.slice(2);
const has = f => args.includes(f);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const OPT = {
  park: val('--park', null),
  canonicalize: has('--canonicalize'),
  // Solo las fichas cuya foto es un archivo local de Frontend/Img: sirve para cambiar las fotos de
  // procedencia dudosa por una equivalente de Commons con licencia y autor comprobables.
  onlyLocal: has('--only-local'),
  // Lista de nombres científicos separados por «;» para rehacer solo esas fichas.
  only: (val('--only', '') || '').split(';').map(s => s.trim()).filter(Boolean),
  mode: has('--all') ? 'all' : 'missing',
  write: has('--write'),
  check: has('--check'),
  list: has('--list'),
  force: has('--force'),
  width: parseInt(val('--width', '1280'), 10),
  report: val('--report', null),
};

// --- recorrido del catálogo -----------------------------------------------------------------------
function parkFiles() {
  const out = [];
  const regiones = fs.readdirSync(PARKS_DIR).filter(d => fs.statSync(path.join(PARKS_DIR, d)).isDirectory());
  for (const region of regiones) {
    for (const slug of fs.readdirSync(path.join(PARKS_DIR, region))) {
      if (OPT.park && slug !== OPT.park) continue;
      const f = path.join(PARKS_DIR, region, slug, 'park.json');
      if (fs.existsSync(f)) out.push({ slug, file: f });
    }
  }
  return out;
}

(async () => {
  const parks = parkFiles();
  if (!parks.length) { console.error('No se encontró ningún park.json' + (OPT.park ? ` para --park ${OPT.park}` : '')); process.exit(1); }

  const lineas = [];
  let resueltas = 0, fallidas = 0, intactas = 0;

  for (const { slug, file } of parks) {
    const park = JSON.parse(fs.readFileSync(file, 'utf8'));
    const species = park.species || [];
    if (!species.length) continue;
    console.log(`\n=== ${slug} (${species.length} especies) ===`);

    let tocado = false;
    for (const sp of species) {
      if (OPT.only.length && !OPT.only.includes(sp.scientificName)) { intactas++; continue; }

      if (OPT.onlyLocal) {
        if (!sp.image || /^https?:/i.test(sp.image)) { intactas++; continue; }
        const r = await resolver(sp.scientificName, OPT.width);
        if (!r) {
          console.log(`  ✗ ${sp.commonName} (${sp.scientificName}) — sin equivalente en Commons, se mantiene la foto local`);
          fallidas++;
          continue;
        }
        console.log(`  ⇄ ${sp.commonName} — ${sp.image} → Commons (${r.via})${r.needsReview ? ' ⚠ revisar' : ''}`);
        lineas.push(`| ${slug} | ${sp.commonName} | _${sp.scientificName}_ | ${r.via} (sustituye foto local) | ${r.attribution} |`);
        resueltas++;
        if (OPT.write) { sp.image = r.url; sp.imageAttribution = r.attribution; tocado = true; }
        continue;
      }

      // --- Paso previo: normalizar las URLs que ya apuntan a Wikimedia -----------------------------
      // Sustituye el enlace al derivado cacheado (`upload.wikimedia.org/.../640px-…`) por la URL
      // canónica `Special:FilePath`, que es la que sobrevive a renombrados y no se rate-limita, y
      // recupera de paso el autor y la licencia que faltaban. Es la MISMA foto: no cambia el
      // contenido de la ficha, solo la forma de pedirla.
      if (OPT.canonicalize) {
        const file = commonsFileFromUrl(sp.image);
        if (file) {
          const meta = await metadatos(file);
          const url = filePathUrl(file, OPT.width);
          if (meta && await loads(url)) {
            const credito = atribucion(meta);
            if (sp.image !== url || sp.imageAttribution !== credito) {
              sp.image = url;
              sp.imageAttribution = credito;
              if (OPT.write) tocado = true;
              console.log(`  ↻ ${sp.commonName} — canónica + atribución (${meta.licencia})`);
            }
            intactas++;
            continue;
          }
          // El archivo ya no existe en Commons: cae al flujo normal de re-resolución.
          console.log(`  ⚠ ${sp.commonName} — el archivo de Commons «${file}» ya no está disponible`);
        }
      }

      const sinFoto = !sp.image || !String(sp.image).trim();
      let rota = false;
      if (!sinFoto && (OPT.check || OPT.mode === 'missing' || OPT.force)) rota = !(await loads(sp.image));

      const hayQueTocar = OPT.mode === 'all' ? (OPT.force || sinFoto || rota) : (sinFoto || rota);
      if (!hayQueTocar) { intactas++; continue; }

      if (OPT.list) {
        console.log(`  · ${sp.commonName} (${sp.scientificName}) — ${sinFoto ? 'sin foto' : 'foto rota'}`);
        fallidas++;
        continue;
      }

      const r = await resolver(sp.scientificName, OPT.width);
      if (!r) {
        console.log(`  ✗ ${sp.commonName} (${sp.scientificName}) — sin foto libre localizada`);
        lineas.push(`| ${slug} | ${sp.commonName} | _${sp.scientificName}_ | — | **no encontrada** |`);
        fallidas++;
        continue;
      }
      console.log(`  ✓ ${sp.commonName} (${sp.scientificName}) — ${r.via}${r.needsReview ? ' ⚠ revisar' : ''}`);
      lineas.push(`| ${slug} | ${sp.commonName} | _${sp.scientificName}_ | ${r.via}${r.needsReview ? ' ⚠' : ''} | ${r.attribution} |`);
      resueltas++;

      if (OPT.write) {
        sp.image = r.url;
        sp.imageAttribution = r.attribution;
        if (r.needsReview) {
          const nota = 'Foto localizada por búsqueda en Commons (no por el elemento de Wikidata del taxón): conviene confirmar que corresponde a esta especie.';
          sp.reviewNote = sp.reviewNote ? sp.reviewNote : nota;
        }
        tocado = true;
      }
    }

    if (tocado) {
      fs.writeFileSync(file, JSON.stringify(park, null, 2) + '\n', 'utf8');
      console.log(`  → escrito ${path.relative(ROOT, file)}`);
    }
  }

  console.log(`\nResueltas ${resueltas} · sin resolver ${fallidas} · intactas ${intactas}`);
  if (OPT.report && lineas.length) {
    const md = ['# Fotos resueltas contra Wikimedia', '',
      '| Parque | Especie | Nombre científico | Vía | Atribución |',
      '| --- | --- | --- | --- | --- |', ...lineas, ''].join('\n');
    fs.writeFileSync(path.isAbsolute(OPT.report) ? OPT.report : path.join(ROOT, OPT.report), md, 'utf8');
    console.log('Informe escrito en ' + OPT.report);
  }
})();
