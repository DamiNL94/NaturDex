#!/usr/bin/env node
/*
 * invasoras-images.js — foto y atribución de cada especie exótica invasora, contra Wikimedia.
 *
 * Por qué existe
 * --------------
 * Las fotos de las invasoras venían de GBIF (media de iNaturalist) o, en 7 fichas, de un archivo
 * local `Img/invasoras/<slug>.jpg` que nunca llegó a existir: esas fichas se veían con el emoji del
 * grupo en vez de con la especie. Y una miniatura es justo lo que hace falta aquí, porque el objeto
 * de esta pestaña es RECONOCER la planta o el animal antes de plantarlo/soltarlo.
 *
 * Este script las cambia por la foto de Wikipedia/Wikimedia Commons del taxón, con la misma cadena
 * de resolución y los mismos descartes que el catálogo de especies (`lib/wikimedia.js`), enlazada
 * por la URL canónica `Special:FilePath` y con autor + licencia recuperados de Commons.
 *
 * Uso
 * ---
 *   node Tools/catalogo-nacional/invasoras-images.js --list                  (qué se cambiaría)
 *   node Tools/catalogo-nacional/invasoras-images.js --write --sql Database/invasoras-imagenes.sql
 *   node Tools/catalogo-nacional/invasoras-images.js --only "Agave americana" --write
 *
 * Opciones: --force (rehace también las que ya están en Commons), --width <px> (1280),
 *           --report <fichero.md>.
 *
 * `--sql` genera los UPDATE para la base de datos, y NO es opcional en la práctica: la BD es la
 * fuente de verdad de las invasoras (Backend/Api/invasoras.php), así que un despliegue con backend
 * seguiría sirviendo las fotos viejas aunque el JSON empaquetado ya tuviera las nuevas.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const { loads, metadatos, atribucion, filePathUrl, commonsFileFromUrl, resolver } = require('./lib/wikimedia');

const ROOT = path.join(__dirname, '..', '..');
const JSON_PATH = path.join(ROOT, 'Frontend', 'Data', 'invasoras.json');

const args = process.argv.slice(2);
const has = f => args.includes(f);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const OPT = {
  only: (val('--only', '') || '').split(';').map(s => s.trim()).filter(Boolean),
  write: has('--write'),
  list: has('--list'),
  force: has('--force'),
  width: parseInt(val('--width', '1280'), 10),
  sql: val('--sql', null),
  report: val('--report', null),
};

// El JSON lo genera `php Tools/export-invasoras.php` (json_encode con PRETTY_PRINT): sangría de 4
// espacios y barras escapadas. Se reproduce tal cual para que reexportar desde la BD no deje un
// diff de formato sobre el fichero que escribe este script.
const comoPhp = data => JSON.stringify(data, null, 4).replace(/\//g, '\\/') + '\n';

const sqlStr = v => v === null || v === undefined ? 'NULL' : `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;

(async () => {
  if (!fs.existsSync(JSON_PATH)) {
    console.error('No existe Frontend/Data/invasoras.json (genéralo con: php Tools/export-invasoras.php)');
    process.exit(1);
  }
  const invasoras = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

  // Una misma especie puede tener una fila por CCAA: se resuelve UNA vez y se aplica a todas sus
  // fichas (la foto del taxón no depende del territorio).
  const porTaxon = new Map();
  for (const inv of invasoras) {
    if (!porTaxon.has(inv.scientificName)) porTaxon.set(inv.scientificName, []);
    porTaxon.get(inv.scientificName).push(inv);
  }

  console.log(`=== Invasoras: ${invasoras.length} fichas, ${porTaxon.size} taxones ===`);
  const lineas = [];
  const cambios = [];               // { scientificName, image, imageAttribution } para el SQL
  let resueltas = 0, fallidas = 0, intactas = 0;

  for (const [scientificName, fichas] of porTaxon) {
    if (OPT.only.length && !OPT.only.includes(scientificName)) { intactas++; continue; }
    const ref = fichas[0];
    const nombre = ref.commonName || scientificName;

    // 1) Ya está en Commons: basta con dejar la URL canónica y recuperar autor + licencia.
    const yaEnCommons = commonsFileFromUrl(ref.image);
    if (yaEnCommons && !OPT.force) {
      const url = filePathUrl(yaEnCommons, OPT.width);
      const meta = await metadatos(yaEnCommons);
      if (meta && await loads(url)) {
        const credito = atribucion(meta);
        if (ref.image !== url || ref.imageAttribution !== credito) {
          console.log(`  ↻ ${nombre} — canónica + atribución (${meta.licencia})`);
          fichas.forEach(f => { f.image = url; f.imageAttribution = credito; });
        }
        cambios.push({ scientificName, image: url, imageAttribution: credito });
        intactas++;
        continue;
      }
      console.log(`  ⚠ ${nombre} — el archivo de Commons «${yaEnCommons}» ya no está disponible`);
    }

    if (OPT.list) {
      console.log(`  · ${nombre} (${scientificName}) — ahora: ${ref.image || 'sin foto'}`);
      continue;
    }

    // 2) Foto de GBIF, ruta local inexistente o nada: se busca la de Wikipedia/Commons.
    const r = await resolver(scientificName, OPT.width);
    if (!r) {
      console.log(`  ✗ ${nombre} (${scientificName}) — sin foto libre localizada, se mantiene la actual`);
      lineas.push(`| ${nombre} | _${scientificName}_ | — | **no encontrada** |`);
      fallidas++;
      continue;
    }
    console.log(`  ✓ ${nombre} (${scientificName}) — ${r.via}${r.needsReview ? ' ⚠ revisar' : ''}`);
    lineas.push(`| ${nombre} | _${scientificName}_ | ${r.via}${r.needsReview ? ' ⚠' : ''} | ${r.attribution} |`);
    fichas.forEach(f => { f.image = r.url; f.imageAttribution = r.attribution; });
    cambios.push({ scientificName, image: r.url, imageAttribution: r.attribution });
    resueltas++;
  }

  console.log(`\nResueltas ${resueltas} · sin resolver ${fallidas} · ya en Commons ${intactas}`);

  if (OPT.write && !OPT.list) {
    fs.writeFileSync(JSON_PATH, comoPhp(invasoras), 'utf8');
    console.log(`→ escrito ${path.relative(ROOT, JSON_PATH)}`);
  } else if (!OPT.list) {
    console.log('(simulación: usa --write para guardar)');
  }

  if (OPT.sql && cambios.length) {
    const cabecera = [
      '-- invasoras-imagenes.sql — foto y atribución de cada especie exótica invasora.',
      '-- GENERADO por Tools/catalogo-nacional/invasoras-images.js --sql. No editar a mano.',
      '-- La BD es la fuente de verdad de las invasoras (Backend/Api/invasoras.php): sin aplicar esto,',
      '-- un despliegue con backend seguiría sirviendo las fotos viejas de GBIF.',
      '-- Una especie puede tener una fila por CCAA; el UPDATE va por nombre científico y las cubre todas.',
      '', '',
    ].join('\n');
    const sentencias = cambios.map(c =>
      `UPDATE especies_invasoras SET\n` +
      `  image_url = ${sqlStr(c.image)},\n` +
      `  image_attribution = ${sqlStr(c.imageAttribution)}\n` +
      `WHERE scientific_name = ${sqlStr(c.scientificName)};`
    );
    const destino = path.isAbsolute(OPT.sql) ? OPT.sql : path.join(ROOT, OPT.sql);
    fs.writeFileSync(destino, cabecera + sentencias.join('\n\n') + '\n', 'utf8');
    console.log(`SQL escrito en ${path.relative(ROOT, destino)} (${sentencias.length} UPDATE)`);
  }

  if (OPT.report && lineas.length) {
    const md = ['# Fotos de invasoras resueltas contra Wikimedia', '',
      '| Especie | Nombre científico | Vía | Atribución |',
      '| --- | --- | --- | --- |', ...lineas, ''].join('\n');
    fs.writeFileSync(path.isAbsolute(OPT.report) ? OPT.report : path.join(ROOT, OPT.report), md, 'utf8');
    console.log('Informe escrito en ' + OPT.report);
  }
})();
