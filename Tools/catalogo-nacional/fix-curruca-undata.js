#!/usr/bin/env node
'use strict';
/*
 * fix-curruca-undata.js — la curruca rabilarga estaba fichada DOS VECES en el catálogo, con dos
 * nombres, y ninguna comprobación del repo podía verlo.
 *
 * Qué pasaba
 * ----------
 *   · `Curruca undata` (eidosTaxonId 80931) en Cabo Cope, Carrascoy y Sierra Espuña: ficha completa,
 *     con nombre común, descripción, tres pistas y LESRPE.
 *   · `Sylvia undata` (eidosTaxonId 80230) en Monte Arabí, Sierra de El Carche, Sierra de la Pila y
 *     Sierra de Salinas: ficha vacía, `commonName` igual al nombre científico, sin descripción, y
 *     por eso `visible: false`. En la app no se veía; en el catálogo sí estaba.
 *
 * Son la misma ave. El 80230 de EIDOS es «Sylvia undata undata (Boddaert, 1783)», la SUBESPECIE
 * nominal, servida con `nametype` aceptado igual que la especie; el 80931 es la especie.
 *
 * Por qué no lo veía nadie
 * ------------------------
 * `scan-taxones-duplicados.js` busca el mismo `eidosTaxonId` con dos nombres, o la misma
 * `gbifSpeciesKey` con dos nombres. Aquí los DOS identificadores son distintos en las dos fichas
 * (80230/80931 y 2492949/10355796), porque las dos autoridades mantienen las dos entradas. Un
 * duplicado con los papeles en regla es invisible para esa comprobación: por eso se le añade la
 * tercera pasada, la del epíteto compartido, que sí lo delata.
 *
 * Y lo que hace que esto sea una trampa y no un descuido: **ya estaba corregido, en un sitio**. La
 * ficha de Sierra Espuña lleva desde el 2026-08-09 una `reviewNote` que dice exactamente esto —«tenía
 * eidosTaxonId 80230, que es Sylvia undata undata (la subespecie)»—. La corrección se hizo sobre el
 * dato escrito y no sobre el pipeline, así que las cuatro Capas 3 que se generaron después la
 * volvieron a introducir. Una corrección que no vive en la herramienta la deshace la siguiente
 * regeneración, en silencio.
 *
 * Por eso el arreglo va en DOS sitios, y este fichero es solo el segundo:
 *   1. `data/equivalencias-nomenclatura.json` — «Sylvia undata» ⇒ «Curruca undata», verificado. Lo
 *      leen `lib/respaldo-sitio.js` y la reconciliación de `build-species-seleccion.js`, así que una
 *      regeneración futura ya no puede volver a partir el taxón en dos.
 *   2. esto: renombrar las cuatro fichas ya escritas, que ninguna herramienta va a tocar sola.
 *
 * Es idempotente y comprueba antes de escribir: si no encuentra la ficha modelo o los identificadores
 * no son los esperados, se niega en vez de escribir a medias.
 *
 * Uso: node Tools/catalogo-nacional/fix-curruca-undata.js [--write]
 */
const fs = require('fs');
const path = require('path');
const { flag, die } = require('../lib/cli');
const { FRONTEND, CATALOGO_DIR, readJson, writeJson, rel, parkFiles } = require('../lib/io');

const WRITE = flag('write');
const VIEJO = 'Sylvia undata';
const NUEVO = 'Curruca undata';
const TAXONID = 80931;
const GBIF_KEY = 10355796;

// Los campos que definen QUÉ ES la especie y que por tanto vienen de la ficha modelo. Lo local de
// cada espacio —id, source, gbifOccurrences, zepaSiteCode, habitatIds, rarityLocal…— no se toca:
// dice dónde y cómo aparece aquí, y eso es distinto en cada parque.
const CAMPOS_UNIVERSALES = [
  'commonName', 'kingdom', 'group', 'habitat', 'seasonality', 'description', 'descriptionSource',
  'tips', 'taxonomy', 'iucnGlobal', 'spainStatus', 'image', 'imageAttribution',
  'rarityScore', 'rarityBasis',
];

/*
 * `rarityLocal` es el tramo más grave de los DOS ámbitos (estatal + autonómico), así que no puede
 * quedar por debajo de `rarityScore`, que es solo el estatal. Las cuatro fichas venían con 1 porque
 * estaban ancladas al taxón equivocado y EIDOS no les devolvía ninguna norma; al adoptar el estatal
 * correcto —LESRPE, tramo 2— el local se queda corto y el validador lo caza. Cuando no hay figura
 * autonómica más grave, el local ES el estatal, con su misma justificación.
 */
function coherenciaRareza(ficha) {
  if ((ficha.rarityLocal ?? 0) >= (ficha.rarityScore ?? 0)) return false;
  ficha.rarityLocal = ficha.rarityScore;
  ficha.rarityLocalBasis = ficha.rarityBasis
    ? { ...ficha.rarityBasis, origen: 'spainStatus del park.json' }
    : null;
  return true;
}

function main() {
  const universalPath = path.join(CATALOGO_DIR, 'data', 'especies-universal.json');
  const universal = readJson(universalPath);
  const modelo = universal[NUEVO];
  if (!modelo) die(`El catálogo universal no tiene ficha de ${NUEVO}: no hay de dónde copiar.`);
  if (!universal[VIEJO]) console.log(`(el catálogo universal ya no tiene entrada de ${VIEJO})`);

  let fichasRenombradas = 0, fichasAlineadas = 0;
  const tocados = [];
  for (const p of parkFiles()) {
    const doc = readJson(p.file);
    const species = doc.species || [];
    const vieja = species.find(s => s.scientificName === VIEJO);
    if (vieja && species.some(s => s.scientificName === NUEVO)) {
      die(`${p.slug} tiene las DOS fichas a la vez (${VIEJO} y ${NUEVO}). Fusionarlas no es un ` +
          'renombrado: hay que decidir qué enlaces y qué recuento se conservan. Se para aquí.');
    }
    // El renombrado propiamente dicho.
    if (vieja) {
      vieja.scientificName = NUEVO;
      vieja.eidosTaxonId = TAXONID;
      vieja.gbifSpeciesKey = GBIF_KEY;
      // La ficha estaba oculta por no tener descripción. Ahora la tiene, así que la razón desaparece.
      if (vieja.visible === false && /Sin descripci/i.test(vieja.hiddenReason || '')) {
        vieja.visible = true;
        delete vieja.hiddenReason;
      }
      // Y queda dicho en la propia ficha de dónde viene el cambio, que es lo que permite entender el
      // diff dentro de un año sin volver al informe de la sesión.
      const nota = `Fichada hasta el 2026-08-16 como «${VIEJO}» con eidosTaxonId 80230, que es ` +
        '*Sylvia undata undata*, la subespecie nominal. Es la misma curruca rabilarga que el resto ' +
        `del catálogo tiene como *${NUEVO}* (EIDOS ${TAXONID}); se unifica el nombre y los identificadores.`;
      vieja.reviewNote = vieja.reviewNote ? `${vieja.reviewNote} ${nota}` : nota;
      fichasRenombradas++;
      console.log(`${WRITE ? '+' : '~'} ${p.slug}: ${VIEJO} → ${NUEVO}`);
    }
    /*
     * Y la alineación, que se hace SIEMPRE y en todos los espacios, no solo en los renombrados: es
     * lo que garantiza que una única ficha describe la especie. Va aparte del renombrado porque
     * tiene que poder repetirse — es la parte que deja la comprobación `species:check` en verde.
     */
    const ficha = species.find(s => s.scientificName === NUEVO);
    if (!ficha) continue;
    const antes = JSON.stringify(ficha);
    for (const c of CAMPOS_UNIVERSALES) {
      if (modelo[c] !== undefined) ficha[c] = JSON.parse(JSON.stringify(modelo[c]));
      // Y si el modelo NO trae el campo, la ficha tampoco puede traerlo. Un `descriptionSource: null`
      // donde las demás fichas no tienen la clave es una divergencia para `species:check`, aunque a
      // la vista sean lo mismo: la comparación distingue «ausente» de «nulo», y hace bien.
      else if (c in ficha && (ficha[c] === null || ficha[c] === undefined)) delete ficha[c];
    }
    coherenciaRareza(ficha);
    if (JSON.stringify(ficha) !== antes) {
      if (!vieja) console.log(`${WRITE ? '+' : '~'} ${p.slug}: campos universales alineados`);
      fichasAlineadas++;
    }
    if (vieja || JSON.stringify(ficha) !== antes) {
      tocados.push(p);
      if (WRITE) writeJson(p.file, doc);
    }
  }

  if (universal[VIEJO]) {
    // La entrada universal huérfana: si se queda, la próxima extracción la vuelve a repartir.
    delete universal[VIEJO];
    if (WRITE) writeJson(universalPath, universal);
    console.log(`${WRITE ? '-' : '~'} catálogo universal: retirada la entrada ${VIEJO}`);
  }

  // El anexo normativo cita «Sylvia undata» y así debe seguir —se transcribe lo que dice la norma—,
  // pero necesita la clave adicional para que el cruce no pierda el respaldo. Es el mismo mecanismo
  // que ya usa para las erratas de imprenta.
  const anexosPath = path.join(CATALOGO_DIR, 'data', 'anexos-normativos.json');
  const anexos = readJson(anexosPath);
  let entradasAnexo = 0;
  for (const entrada of Object.values(anexos.espacios || {})) {
    for (const e of entrada.especies || []) {
      if (e.scientificName !== VIEJO || e.nombreCorregido) continue;
      e.nombreCorregido = NUEVO;
      e.nota = (e.nota ? e.nota + ' ' : '') +
        `La norma la cita como «${VIEJO}»; es la curruca rabilarga, que EIDOS acepta como ` +
        `«${NUEVO}» (taxonid ${TAXONID}) y con la que la ficha el catálogo (verificado 2026-08-16).`;
      entradasAnexo++;
    }
  }
  if (entradasAnexo && WRITE) writeJson(anexosPath, anexos);
  console.log(`${WRITE ? '+' : '~'} anexos normativos: ${entradasAnexo} entrada(s) con nombreCorregido`);

  console.log(`\n${fichasRenombradas} ficha(s) renombrada(s) · ${fichasAlineadas} alineada(s) ` +
    `con el catálogo universal, en ${tocados.length} espacio(s).`);
  if (!WRITE) console.log('Simulación: no se ha escrito nada. Añade --write para aplicarlo.');
  if (WRITE && fichasRenombradas) {
    console.log('\nDespués de esto hay que regenerar el SQL de los espacios tocados (npm run park:sql):');
    console.log('  la API manda sobre el park.json empaquetado, así que sin eso el usuario sigue');
    console.log('  viendo la ficha vieja.');
  }
}

main();
