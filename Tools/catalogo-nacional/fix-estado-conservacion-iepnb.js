#!/usr/bin/env node
'use strict';
/*
 * Aplica al catálogo del piloto (Cabo Cope y Puntas de Calnegre) las correcciones de estado de
 * conservación derivadas del contraste contra la Lista Patrón del IEPNB.
 *
 * Informe de origen: Tools/catalogo-nacional/out/cabo-cope-contraste-iepnb.md
 * Fuente de los datos: https://iepnb.gob.es/api/catalogo/v_listapatronespecie_normas (2026-07-25)
 *
 * Toca dos ficheros, manteniéndolos coherentes:
 *   Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json
 *   Database/seed.sql
 *
 * Es idempotente: si un valor ya está corregido, no lo vuelve a tocar.
 *
 * Uso:
 *   node Tools/catalogo-nacional/fix-estado-conservacion-iepnb.js --dry    # solo informa
 *   node Tools/catalogo-nacional/fix-estado-conservacion-iepnb.js          # escribe
 */
const fs = require('fs');
const path = require('path');

const { ROOT: RAIZ } = require('../lib/io');
const PARK = path.join(RAIZ, 'Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json');
const SEED = path.join(RAIZ, 'Database/seed.sql');
const DRY = process.argv.includes('--dry');

const FUENTE = 'IEPNB, Lista Patrón de las especies silvestres presentes en España (Resolución de 3 de diciembre de 2020), consultada 2026-07-25';
const CAT_MU = 'Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Murcia (Ley 7/1995)';

// `de` = nombre científico actual en el repo. `a` = renombre taxonómico, si procede.
const CORRECCIONES = [
  // --- 1. Infraprotección: se daban por no protegidas y están en el LESRPE ---
  { de: 'Galerida cristata', eidos: 11102,
    spain: 'LESRPE (RD 139/2011); Directiva Aves 2009/147/CE',
    motivo: 'estaba como «No catalogada» y figura en el LESRPE' },
  { de: 'Curruca melanocephala', eidos: 80929,
    spain: 'LESRPE (RD 139/2011)',
    motivo: 'estaba como «No catalogada» y figura en el LESRPE' },

  // --- 2. Protección declarada que no existe (tres son especies cinegéticas) ---
  { de: 'Martes foina', eidos: 11289,
    spain: 'No incluida en el LESRPE ni en el Catálogo Español de Especies Amenazadas',
    cs: 'No catalogada',
    review: 'El IEPNB no registra figura estatal ni regional para esta especie. La categoría regional que figuraba procede del PORN y no se ha podido confirmar en la Ley 7/1995.',
    motivo: 'se le atribuía LESRPE sin estarlo' },
  { de: 'Alectoris rufa', eidos: 12114,
    spain: 'No incluida en el LESRPE; Directiva Aves 2009/147/CE, Anexos II y III (especie cinegética)',
    cs: 'No catalogada',
    review: 'El IEPNB no registra figura regional para esta especie. La categoría que figuraba procede del PORN y no se ha podido confirmar en la Ley 7/1995.',
    motivo: 'se le atribuía LESRPE siendo especie cinegética' },
  { de: 'Meles meles', eidos: 11709,
    spain: 'No incluida en el LESRPE ni en el Catálogo Español de Especies Amenazadas',
    murcia: CAT_MU + ': De interés especial',
    review: null,
    motivo: 'se le atribuía LESRPE sin estarlo; la figura regional sí queda confirmada' },
  { de: 'Streptopelia turtur', eidos: 12356,
    spain: 'No incluida en el LESRPE; Directiva Aves 2009/147/CE, Anexo II (especie cinegética); Reglamento CITES, Anexo A',
    motivo: 'se le atribuía LESRPE siendo especie cinegética' },

  // --- 3. Categoría CEEA que faltaba ---
  { de: 'Charadrius alexandrinus', eidos: 10664,
    spain: 'Catálogo Español de Especies Amenazadas (CEEA): Vulnerable; LESRPE (RD 139/2011); Ley 42/2007, Anexo IV',
    murcia: CAT_MU + ': De interés especial',
    cs: 'Vulnerable', review: null,
    motivo: 'es CEEA Vulnerable y solo constaba «LESRPE»' },
  { de: 'Larus audouinii', eidos: 14053,
    spain: 'Catálogo Español de Especies Amenazadas (CEEA): Vulnerable; Ley 42/2007, Anexo IV',
    murcia: CAT_MU + ': Vulnerable',
    motivo: 'es CEEA Vulnerable y solo constaba la Directiva Aves' },

  // --- 4. Figura regional que faltaba (solo constaba la pertenencia a la ZEPA) ---
  { de: 'Aquila chrysaetos', eidos: 10888,
    spain: 'LESRPE (RD 139/2011); Directiva Aves 2009/147/CE; Ley 42/2007, Anexo IV',
    murcia: CAT_MU + ': De interés especial',
    motivo: 'faltaba la figura regional' },
  { de: 'Coracias garrulus', eidos: 11339,
    spain: 'LESRPE (RD 139/2011); Directiva Aves 2009/147/CE; Ley 42/2007, Anexo IV',
    murcia: CAT_MU + ': De interés especial',
    motivo: 'faltaba la figura regional' },
  { de: 'Circaetus gallicus', eidos: 11336,
    spain: 'LESRPE (RD 139/2011); Directiva Aves 2009/147/CE; Ley 42/2007, Anexo IV',
    murcia: CAT_MU + ': De interés especial',
    motivo: 'faltaba la figura regional' },

  // --- 5. Identificadores rotos, resueltos contra la Lista Patrón ---
  { de: 'Pyrrhocorax pyrrhocorax', eidos: 12065,
    spain: 'LESRPE (RD 139/2011); Directiva Aves 2009/147/CE, Anexo I; Ley 42/2007, Anexo IV',
    murcia: CAT_MU + ': De interés especial',
    // La UICN sí la evalúa: assessment 22705916, categoría LC. El código lo da la pasarela
    // v_listapatronespecie_codigos del IEPNB («Código UICN»), junto al código Red Natura A346.
    cs: 'LC', iucn: 'LC (Preocupación menor)',
    motivo: 'el eidosTaxonId 12063 no existe en la Lista Patrón; el correcto es 12065. Constaba como no evaluada y la UICN la clasifica LC' },
  { de: 'Saxicola torquatus', a: 'Saxicola rubicola', eidos: 16387,
    spain: 'LESRPE (RD 139/2011)',
    motivo: 'el eidosTaxonId 12325 no existe; la tarabilla europea es Saxicola rubicola (S. torquatus es hoy la tarabilla africana)' },
  { de: 'Calandrella rufescens', a: 'Alaudala rufescens', genero: 'Alaudala', eidos: 33007,
    spain: 'LESRPE (RD 139/2011)',
    review: 'El IEPNB no registra figura regional para esta especie. La categoría que figuraba procede del PORN y no se ha podido confirmar en la Ley 7/1995.',
    motivo: 'el eidosTaxonId 12119 no existe; el género vigente es Alaudala' },

  // --- 6. Falsos «no evaluada» en la Lista Roja mundial de la UICN ---------------------------
  // El «Código UICN» de v_listapatronespecie_codigos demuestra que existe assessment; la categoría
  // se leyó de iucnredlist.org (2026-07-25). NO se toca `conservationStatus`: en flora ese campo
  // refleja el estado LEGAL (Decreto 50/2003), no la evaluación de la UICN.
  { de: 'Allium melananthum',    iucn: 'NT (Casi amenazado)',      motivo: 'constaba «NE» y la UICN la evalúa NT · assessment 172167' },
  { de: 'Stipa tenacissima',     iucn: 'VU (Vulnerable)',          motivo: 'constaba «no evaluada» y la UICN la evalúa VU, con tendencia decreciente · assessment 57471077' },
  { de: 'Salsola papillosa',     iucn: 'LC (Preocupación menor)',  motivo: 'constaba «NE» · assessment 103535407' },
  { de: 'Nerium oleander',       iucn: 'LC (Preocupación menor)',  motivo: 'constaba «no evaluada» · assessment 202961' },
  { de: 'Osyris lanceolata',     iucn: 'LC (Preocupación menor)',  motivo: 'constaba «NE» · assessment 200642' },
  { de: 'Ephedra fragilis',      iucn: 'LC (Preocupación menor)',  motivo: 'constaba «no evaluada» · assessment 201689' },
  { de: 'Saccharum ravennae',    iucn: 'LC (Preocupación menor)',  motivo: 'constaba «no evaluada» · assessment 175232 (la UICN lo publica como Tripidium ravennae)' },
  { de: 'Quercus coccifera',     iucn: 'LC (Preocupación menor)',  motivo: 'constaba «NE» · assessment 194078' },
  { de: 'Asparagus albus',       iucn: 'LC (Preocupación menor)',  motivo: 'constaba «no evaluada» · assessment 176528' },
  { de: 'Asphodelus fistulosus', iucn: 'LC (Preocupación menor)',  motivo: 'constaba «no evaluada» · assessment 19002684' },
  { de: 'Elymus farctus',        iucn: 'LC (Preocupación menor)',  motivo: 'constaba «no evaluada» · assessment 21343402' },
  { de: 'Brachypodium retusum',  iucn: 'LC (Preocupación menor)',  motivo: 'constaba «no evaluada» · assessment 44393494' },
  { de: 'Chamaerops humilis',    iucn: 'LC (Preocupación menor)',  motivo: 'constaba «NE» · assessment 13164373' },

  // --- 7. Anexos comunitarios que la ficha no recogía -----------------------------------------
  // Barrido del ámbito `UE` de v_listapatronespecie_normas sobre las 146 fichas que no citaban
  // ninguna Directiva. `spainAppend` AÑADE al final del texto existente, no lo sustituye.
  // Se descarta la categoría «Artículo I» de la Directiva Aves: es la cobertura genérica que
  // ampara a todas las aves silvestres, no una inclusión en anexo.
  { de: 'Testudo graeca',            spainAppend: 'Directiva Hábitats 92/43/CEE, Anexos II y IV; Reglamento CITES (CE) 338/97, Anexo A',
    motivo: 'faltaban los anexos II y IV de la Directiva Hábitats y el anexo A de CITES' },
  { de: 'Aquila fasciata',           spainAppend: 'Directiva Aves 2009/147/CE, Anexo I', motivo: 'faltaba el Anexo I de la Directiva Aves' },
  { de: 'Bubo bubo',                 spainAppend: 'Directiva Aves 2009/147/CE, Anexo I; Reglamento CITES (CE) 338/97, Anexo A', motivo: 'faltaban Anexo I y CITES A' },
  { de: 'Falco peregrinus',          spainAppend: 'Directiva Aves 2009/147/CE, Anexo I; Reglamento CITES (CE) 338/97, Anexo A', motivo: 'faltaban Anexo I y CITES A' },
  { de: 'Burhinus oedicnemus',       spainAppend: 'Directiva Aves 2009/147/CE, Anexo I', motivo: 'faltaba el Anexo I de la Directiva Aves' },
  { de: 'Sternula albifrons',        spainAppend: 'Directiva Aves 2009/147/CE, Anexo I', motivo: 'faltaba el Anexo I de la Directiva Aves' },
  { de: 'Galerida theklae',          spainAppend: 'Directiva Aves 2009/147/CE, Anexo I', motivo: 'faltaba el Anexo I de la Directiva Aves' },
  { de: 'Oenanthe leucura',          spainAppend: 'Directiva Aves 2009/147/CE, Anexo I', motivo: 'faltaba el Anexo I de la Directiva Aves' },
  { de: 'Curruca undata',            spainAppend: 'Directiva Aves 2009/147/CE, Anexo I', motivo: 'faltaba el Anexo I de la Directiva Aves' },
  { de: 'Calandrella brachydactyla', spainAppend: 'Directiva Aves 2009/147/CE, Anexo I', motivo: 'faltaba el Anexo I de la Directiva Aves' },
  { de: 'Haematopus ostralegus',     spainAppend: 'Directiva Aves 2009/147/CE, Anexo II parte B', motivo: 'faltaba el Anexo II parte B de la Directiva Aves' },
  { de: 'Athene noctua',             spainAppend: 'Reglamento CITES (CE) 338/97, Anexo A', motivo: 'faltaba el anexo A de CITES' },
  { de: 'Felis silvestris',          spainAppend: 'Directiva Hábitats 92/43/CEE, Anexo IV; Reglamento CITES (CE) 338/97, Anexo A', motivo: 'faltaban el Anexo IV y CITES A' },
  { de: 'Chalcides bedriagai',       spainAppend: 'Directiva Hábitats 92/43/CEE, Anexo IV', motivo: 'faltaba el Anexo IV de la Directiva Hábitats' },
  { de: 'Epidalea calamita',         spainAppend: 'Directiva Hábitats 92/43/CEE, Anexo IV', motivo: 'faltaba el Anexo IV de la Directiva Hábitats' },
  { de: 'Genetta genetta',           spainAppend: 'Directiva Hábitats 92/43/CEE, Anexo V', motivo: 'faltaba el Anexo V de la Directiva Hábitats' },
];

// Añade la fuente del IEPNB sin duplicarla ni pisar la procedencia anterior.
const conFuente = (previa) => (previa && previa.includes('IEPNB, Lista Patrón'))
  ? previa
  : (previa ? previa + '; ' + FUENTE : FUENTE);

// Añade un texto al final del estado sin duplicarlo si ya está (idempotencia).
const anexar = (previa, extra) => {
  if (!extra) return previa;
  if (previa && previa.includes(extra)) return previa;
  return previa ? previa.replace(/\s*$/, '') + '; ' + extra : extra;
};

// ---------------------------------------------------------------- park.json
function aplicarPark(cambios) {
  const park = JSON.parse(fs.readFileSync(PARK, 'utf8'));
  for (const c of CORRECCIONES) {
    const sp = park.species.find((s) => s.scientificName === c.de || s.scientificName === c.a);
    if (!sp) { cambios.push(['!! park.json', c.de, 'NO ENCONTRADA']); continue; }
    const antes = JSON.stringify(sp);
    if (c.a) sp.scientificName = c.a;
    if (c.genero && sp.taxonomy) sp.taxonomy.genus = c.genero;
    if (c.eidos) sp.eidosTaxonId = c.eidos;
    if (c.spain) sp.spainStatus = c.spain;
    if (c.spainAppend) sp.spainStatus = anexar(sp.spainStatus, c.spainAppend);
    if (c.murcia) sp.regionalStatus = c.murcia;   // campo renombrado el 2026-08-27 (deuda nº 2)
    if (c.cs) sp.conservationStatus = c.cs;
    if (c.iucn) sp.iucnGlobal = c.iucn;
    if ('review' in c) { if (c.review === null) delete sp.reviewNote; else sp.reviewNote = c.review; }
    sp.source = conFuente(sp.source);
    if (JSON.stringify(sp) !== antes) cambios.push(['park.json', c.a || c.de, c.motivo]);
  }
  if (!DRY) fs.writeFileSync(PARK, JSON.stringify(park, null, 2) + '\n');
}

// ---------------------------------------------------------------- seed.sql
// Cada especie ocupa UNA línea `SELECT ... scientific_name, ...`. Se sustituyen los literales
// entre comillas simples por posición de etiqueta, no por contenido, para no tocar otras columnas.
// Campo numérico sin comillas (p. ej. `12063 eidos_taxonid`).
function sustituirNumero(linea, etiqueta, valor) {
  const re = new RegExp(`(\\b)(\\d+)( ${etiqueta}\\b)`);
  const m = linea.match(re);
  if (!m || m[2] === String(valor)) return { linea, antes: m ? m[2] : null, cambiado: false };
  return { linea: linea.replace(re, `$1${valor}$3`), antes: m[2], cambiado: true };
}

function sustituirCampo(linea, etiqueta, valor) {
  const nulo = new RegExp(`NULL ${etiqueta}\\b`);
  const conValor = new RegExp(`'((?:[^']|'')*)' ${etiqueta}\\b`);
  const lit = valor === null ? null : `'${String(valor).replace(/'/g, "''")}'`;
  if (valor === null) return conValor.test(linea) ? linea.replace(conValor, `NULL ${etiqueta}`) : linea;
  if (nulo.test(linea)) return linea.replace(nulo, `${lit} ${etiqueta}`);
  return linea.replace(conValor, `${lit} ${etiqueta}`);
}

function aplicarSeed(cambios) {
  let sql = fs.readFileSync(SEED, 'utf8');
  const lineas = sql.split('\n');
  for (const c of CORRECCIONES) {
    // En una re-ejecución el renombre ya se aplicó, así que hay que buscar también por el
    // nombre nuevo; si no, el script se quejaría de filas «no encontradas» que sí están.
    const nombres = [c.de, c.a].filter(Boolean);
    const nombreActual = nombres.join(' / ');
    let tocada = false;
    for (let i = 0; i < lineas.length; i++) {
      // La fila de la especie: la que declara la etiqueta scientific_name junto a common_name.
      if (!nombres.some((n) => lineas[i].includes(`'${n}' scientific_name`)) || !lineas[i].includes('common_name')) continue;
      let l = lineas[i];
      if (c.spain) l = sustituirCampo(l, 'spain_status', c.spain);
      if (c.spainAppend) {
        const act = (l.match(/'((?:[^']|'')*)' spain_status\b/) || [])[1];
        if (act !== undefined) l = sustituirCampo(l, 'spain_status', anexar(act.replace(/''/g, "'"), c.spainAppend));
      }
      if (c.murcia) l = sustituirCampo(l, 'regional_status', c.murcia);
      if (c.cs) l = sustituirCampo(l, 'conservation_status', c.cs);
      if (c.iucn) l = sustituirCampo(l, 'iucn_global', c.iucn);
      if ('review' in c) l = sustituirCampo(l, 'review_note', c.review);
      if (c.genero) l = sustituirCampo(l, 'taxon_genus', c.genero);
      // Algunas filas (las aves de la ZEPA) llevan el eidos_taxonid en la propia fila,
      // en vez de en la tabla de correspondencias del final del fichero.
      if (c.eidos && /\d+ eidos_taxonid\b/.test(l)) {
        const r = sustituirNumero(l, 'eidos_taxonid', c.eidos);
        l = r.linea;
        if (r.cambiado) cambios.push(['seed.sql', c.a || c.de, `eidos_taxonid ${r.antes} -> ${c.eidos} (fila de especie)`]);
      }
      const srcActual = (l.match(/'((?:[^']|'')*)' source\b/) || [])[1];
      if (srcActual !== undefined) l = sustituirCampo(l, 'source', conFuente(srcActual.replace(/''/g, "'")));
      lineas[i] = l; tocada = true;
    }
    if (!tocada) cambios.push(['!! seed.sql', nombreActual, 'fila de especie NO ENCONTRADA']);
    else cambios.push(['seed.sql', c.a || c.de, c.motivo]);
  }
  sql = lineas.join('\n');
  // Renombres e IDs: afectan a TODAS las apariciones (species_habitats, mapa eidos, etc.).
  for (const c of CORRECCIONES) {
    if (c.a) {
      sql = sql.split(`'${c.de}'`).join(`'${c.a}'`);
      cambios.push(['seed.sql', c.a, `renombrado desde ${c.de} en todas sus apariciones`]);
    }
    if (c.eidos) {
      const nom = c.a || c.de;
      const re = new RegExp(`('${nom}' scientific_name, )(\\d+)( eidos_taxonid)`);
      const m = sql.match(re);
      if (m && m[2] !== String(c.eidos)) {
        sql = sql.replace(re, `$1${c.eidos}$3`);
        cambios.push(['seed.sql', nom, `eidos_taxonid ${m[2]} -> ${c.eidos}`]);
      }
    }
  }
  if (!DRY) fs.writeFileSync(SEED, sql);
}

const cambios = [];
aplicarPark(cambios);
aplicarSeed(cambios);

console.log(DRY ? '== SIMULACIÓN (no se ha escrito nada) ==\n' : '== Correcciones aplicadas ==\n');
for (const [f, esp, motivo] of cambios) console.log(`  ${f.padEnd(10)} ${esp.padEnd(26)} ${motivo}`);
console.log(`\n${cambios.filter((c) => !c[0].startsWith('!!')).length} cambios · ${cambios.filter((c) => c[0].startsWith('!!')).length} avisos`);
console.log('\nSiguiente paso: npm run validate');
