#!/usr/bin/env node
'use strict';
/*
 * fix-identificadores-incoherentes.js — el mismo taxón fichado en dos espacios con dos claves
 * externas distintas, y dos claves que no identifican ninguna especie.
 *
 * Qué pasaba
 * ----------
 * `eidosTaxonId` y `gbifSpeciesKey` son campos LOCALES (`sync-species-catalog.js`, lista `LOCALES`):
 * cada `park.json` guarda los suyos y nadie los compara entre espacios. `scan-taxones-duplicados.js`
 * sí los compara, y desde que existe venía diciendo lo mismo sin que nadie lo resolviera: **cinco
 * nombres científicos con más de un identificador**, más **dos `gbifSpeciesKey` de rango familia o
 * género** que `coteja-nomenclatura.js` daba por irrecuperables («ningún espacio la ficha con una
 * key de especie, así que no hay de dónde copiarla»).
 *
 * No es cosmético en ninguno de los dos casos:
 *   · La `gbifSpeciesKey` es con lo que se piden las ocurrencias. La **3064** es la FAMILIA
 *     Amaranthaceae —5.039.294 ocurrencias— y la **2926685** el GÉNERO *Sideritis* —121.554—: un
 *     barrido con ellas mete dentro del polígono cualquier cosa del grupo.
 *   · Dos espacios con dos claves distintas para el mismo taxón dan dos barridos distintos, así que
 *     el catálogo de uno y el del otro no son comparables aunque la ficha se llame igual.
 *
 * De dónde no había de dónde copiar, y sí lo había
 * -----------------------------------------------
 * Las dos claves «irrecuperables» lo eran porque `gbif.matchName()` devuelve rango superior cuando
 * el nombre no resuelve, y NINGUNA de las dos resuelve por el nombre que lleva la ficha. Pero el
 * backbone sí tiene las dos especies, con otra grafía y con otro género:
 *   · *Sideritis ibanyezii* Pau, que es como lo escribe EIDOS (taxonid 8332, Aceptado/válido), está
 *     en GBIF como ***Sideritis ibanezii* Pau** —sin la «y»—, key **8139235**, ACCEPTED, 116
 *     ocurrencias. Que es el mismo taxón lo dice el juego de sinónimos, no el parecido: GBIF cuelga
 *     de él *S. flavovirens*, *S. salina* y *S. ilorcitana*, y EIDOS cuelga del 8332
 *     *S. pusilla* subsp. *flavovirens* y *S. pusilla* var. *salina*.
 *   · *Salsola vermiculata* L. es la **3083954** (SPECIES, 4.634 ocurrencias). `matchName()` no la
 *     alcanza porque el backbone tiene cuatro homónimos más de ese binomio —Brot., M.Bieb., hort.—
 *     y ante la ambigüedad GBIF sube a la familia. Se queda la key del nombre que lleva la ficha, no
 *     la del aceptado (*Nitrosalsola vermiculata*): GBIF la marca HETEROTYPIC_SYNONYM y la regla del
 *     repo para los heterotípicos es no cambiar de taxón (cabecera de `coteja-nomenclatura.js`).
 *
 * Las cinco incoherencias, una a una
 * ----------------------------------
 *   · **Anabasis hispanica** — cabo-cope llevaba la **8397718** (el nombre de la ficha, 29
 *     ocurrencias) y otros tres espacios la **5568629** (*A. articulata*, ACCEPTED, 4.330). La
 *     cabecera de `coteja-nomenclatura.js` daba este caso por heterotípico intocable diciendo que
 *     *A. articulata* «es otra especie para EIDOS», y **eso es falso**: EIDOS mete los dos nombres
 *     bajo el MISMO taxonid 1838, cuyo aceptado es *Anabasis mucronata* (Lag.) C. Vic. Siendo el
 *     mismo taxón para la autoridad que manda en el nombre, la clave que cita a GBIF es la aceptada
 *     de GBIF. Corregida también aquella cabecera.
 *   · **Asteriscus maritimus** — cabo-cope llevaba la **5385231**, que GBIF da por sinónimo de
 *     *Pallenis maritima* subsp. *maritima*; cuatro-calas ya llevaba la **5385225**, que es
 *     *Pallenis maritima* (L.) Greuter a rango de ESPECIE y ACCEPTED. Mismo basiónimo
 *     (*Buphthalmum maritimum* L.), así que es el mismo taxón, y la de especie es superconjunto:
 *     11.149 ocurrencias frente a 2.468 de la del sinónimo. El NOMBRE de la ficha no se toca —EIDOS
 *     acepta *Asteriscus maritimus* (9925) y da *Pallenis maritima* por sinónimo, justo al revés que
 *     GBIF—: cada campo cita a su autoridad.
 *   · **Sedum sediforme** — cabo-cope llevaba el `eidosTaxonId` **95304**, que es *Petrosedum
 *     sediforme* subsp. *sediforme*, la SUBESPECIE; cuatro-calas ya llevaba el **8225**, que es la
 *     especie *Petrosedum sediforme* (Jacq.) Grulich. La ficha es de rango especie y su
 *     `gbifSpeciesKey` (4201784) es la de *Petrosedum sediforme* especie: el ancla que cuadra es la
 *     8225. Es el mismo defecto que tenía la curruca rabilarga con el 80230.
 *   · **Olea europaea subsp. europaea** — dos espacios anclaban al **32803** (*O. europaea* var.
 *     *sylvestris*, un taxón distinto en EIDOS) y a la **8028262** (esa misma variedad, que en GBIF
 *     es SINÓNIMO); los demás ya usaban el **6644** / **5415040**, que son *Olea europaea* L. a
 *     rango de especie y aceptados en las dos autoridades. Se unifica en el par de especie porque
 *     **contiene las dos lecturas** de una ficha cuyo nombre y cuyo nombre común se contradicen: se
 *     llama subsp. *europaea* (el olivo cultivado) y su `commonName` es «Acebuche» (el silvestre).
 *     Anclar al 32803 o al 6645 sería decidir esa contradicción de paso, y eso es un renombrado:
 *     queda escrito en la deuda nº 36 junto con el par duplicado que tiene Calblanque, que ficha a
 *     la vez *Olea europaea* subsp. *europaea* y *Olea europaea* subsp. *sylvestris* siendo los dos
 *     el taxonid 6645 de EIDOS.
 *
 * Lo que este fix NO hace
 * -----------------------
 * **No rellena los nulos.** Siete espacios tienen `eidosTaxonId: null` en *Sedum sediforme* y cinco
 * en *Olea*; rellenarlos es otro trabajo y otra decisión (la del párrafo anterior). Aquí solo se
 * sustituye un valor que está EN CONFLICTO o que no identifica ninguna especie, que es lo que mide
 * `npm run taxones:duplicados`. Un nulo no miente: dice que nadie lo ha resuelto.
 *
 * **No renombra nada**, así que no deja fila huérfana en la BD y no hace falta un `poda-*.sql`: los
 * dos campos que toca se actualizan en su sitio, casando por `scientific_name` y por espacio.
 *
 * Idempotente: un segundo pase no cambia un byte. No toca la base de datos (regla nº 2 de
 * `Tools/CLAUDE.md`); el `--sql` escribe los UPDATE para aplicarlos a mano.
 *
 * Uso:
 *     node Tools/catalogo-nacional/fix-identificadores-incoherentes.js
 *     node Tools/catalogo-nacional/fix-identificadores-incoherentes.js --write [--sql <ruta>]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('../lib/cli');
const { DATABASE, readJson, rel, parkFiles, escribeEspacio } = require('../lib/io');
const { sqlStr, cabeceraSql } = require('../lib/sql');

const WRITE = flag('write');
const SQL = arg('sql', null);
const HOY = '2026-08-27';

/*
 * Cada caso dice el valor de DESTINO y los valores viejos a los que sustituye. Solo se toca la ficha
 * que lleva uno de esos valores: ni los nulos ni un valor no previsto se pisan, porque un valor que
 * no está en la lista es un caso que nadie ha comprobado contra la autoridad.
 */
const CASOS = [
  {
    sci: 'Sideritis ibanyezii',
    gbif: {
      a: 8139235, reemplaza: [2926685],
      motivo: 'la 2926685 es el GÉNERO Sideritis (121.554 ocurrencias). GBIF escribe la especie ' +
        '«Sideritis ibanezii Pau» (sin «y»): key 8139235, SPECIES, ACCEPTED, 116 ocurrencias. Mismo ' +
        'taxón que el 8332 de EIDOS por su juego de sinónimos (flavovirens, salina, ilorcitana)',
    },
  },
  {
    sci: 'Salsola vermiculata',
    gbif: {
      a: 3083954, reemplaza: [3064],
      motivo: 'la 3064 es la FAMILIA Amaranthaceae (5.039.294 ocurrencias). «Salsola vermiculata L.» ' +
        'es la 3083954, SPECIES, 4.634 ocurrencias; GBIF la marca HETEROTYPIC_SYNONYM de ' +
        '«Nitrosalsola vermiculata», y por eso se queda la del nombre de la ficha y no la del aceptado',
    },
  },
  {
    sci: 'Anabasis hispanica',
    gbif: {
      a: 5568629, reemplaza: [8397718],
      motivo: 'EIDOS pone «Anabasis hispanica Pau» y «Anabasis articulata (Forssk.) Moq.» bajo el ' +
        'MISMO taxonid 1838 (aceptado: «Anabasis mucronata (Lag.) C. Vic.»), así que no son dos ' +
        'taxones: la 5568629 es la ACCEPTED de GBIF (4.330 ocurrencias) frente a las 29 de la ' +
        '8397718, y es la que ya usaban Calblanque, Cuatro Calas y el Ajauque',
    },
  },
  {
    sci: 'Asteriscus maritimus',
    gbif: {
      a: 5385225, reemplaza: [5385231],
      motivo: 'la 5385231 es SYNONYM de «Pallenis maritima subsp. maritima»; la 5385225 es «Pallenis ' +
        'maritima (L.) Greuter», SPECIES y ACCEPTED, mismo basiónimo (Buphthalmum maritimum L.) y ' +
        'superconjunto: 11.149 ocurrencias frente a 2.468. Ya la usaba Cuatro Calas. El NOMBRE no ' +
        'cambia: EIDOS acepta «Asteriscus maritimus» (9925) y da «Pallenis maritima» por sinónimo',
    },
  },
  {
    sci: 'Sedum sediforme',
    eidos: {
      a: 8225, reemplaza: [95304],
      motivo: 'el 95304 es «Petrosedum sediforme (Jacq.) Grulich subsp. sediforme», la SUBESPECIE; ' +
        'la especie es el 8225, «Petrosedum sediforme (Jacq.) Grulich», Aceptado/válido. La ficha es ' +
        'de rango especie y su gbifSpeciesKey (4201784) es la de la especie. Ya lo usaba Cuatro Calas',
    },
  },
  {
    sci: 'Olea europaea subsp. europaea',
    eidos: {
      a: 6644, reemplaza: [32803],
      motivo: 'el 32803 es «Olea europaea var. sylvestris (Mill.) Lehr.», que en EIDOS es un taxón ' +
        'aparte; el 6644 es «Olea europaea L.», la especie, que contiene las dos lecturas de una ' +
        'ficha cuyo nombre (subsp. europaea, el olivo) y cuyo commonName («Acebuche») se ' +
        'contradicen. Ya lo usaba Cuatro Calas. Resolver la contradicción es un renombrado: deuda nº 36',
    },
    gbif: {
      a: 5415040, reemplaza: [8028262],
      motivo: 'la 8028262 es «Olea europaea var. sylvestris», VARIETY y SYNONYM en el backbone ' +
        '(2.128 ocurrencias); la 5415040 es «Olea europaea L.», SPECIES y ACCEPTED (409.636), y es ' +
        'la que ya usaban Calblanque, Carrascoy, Cuatro Calas, El Carche y La Pila',
    },
  },
];

const CAMPOS = [
  { clave: 'eidos', ficha: 'eidosTaxonId', columna: 'eidos_taxonid' },
  { clave: 'gbif', ficha: 'gbifSpeciesKey', columna: 'gbif_species_key' },
];

// --- Fase 1: los park.json ------------------------------------------------------------------------

function aplica() {
  const cambios = [];   // { slug, sci, ficha, columna, de, a }
  let espaciosTocados = 0;

  for (const espacio of parkFiles()) {
    const doc = readJson(espacio.file);
    const mios = [];

    for (const sp of (doc.species || [])) {
      const caso = CASOS.find(c => c.sci === sp.scientificName);
      if (!caso) continue;
      for (const campo of CAMPOS) {
        const regla = caso[campo.clave];
        if (!regla) continue;
        const actual = sp[campo.ficha];
        if (actual === null || actual === undefined) continue;   // los nulos no se rellenan aquí
        if (Number(actual) === regla.a) continue;                // ya está
        if (!regla.reemplaza.includes(Number(actual))) {
          console.warn(`  ! ${espacio.slug} · ${sp.scientificName} · ${campo.ficha} = ${actual}: ` +
            'no es ninguno de los valores previstos, no se toca');
          continue;
        }
        mios.push({
          slug: espacio.slug, sci: sp.scientificName, ficha: campo.ficha,
          columna: campo.columna, de: Number(actual), a: regla.a,
        });
        sp[campo.ficha] = regla.a;
      }
    }

    if (!mios.length) continue;
    espaciosTocados++;
    cambios.push(...mios);
    console.log(`\n${espacio.slug}`);
    for (const c of mios) console.log(`  · ${c.sci} · ${c.ficha}: ${c.de} → ${c.a}`);
    const { lineas } = escribeEspacio({ dir: espacio.dir, file: espacio.file, doc, write: WRITE });
    for (const l of lineas) console.log('  ' + l);
  }

  return { cambios, espaciosTocados };
}

// --- Fase 2: el SQL -------------------------------------------------------------------------------

/** Parte un motivo largo en líneas de comentario legibles sin cortar palabras. */
function troceaComentario(texto, ancho = 92) {
  const palabras = String(texto).split(/\s+/);
  const lineas = [];
  let actual = '';
  for (const p of palabras) {
    if (actual && (actual.length + 1 + p.length) > ancho) { lineas.push(actual); actual = p; }
    else actual = actual ? `${actual} ${p}` : p;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/*
 * Por qué un `.sql` propio y no una regeneración del `-n2.sql` del espacio.
 *
 * Regenerar el N2 de un espacio publicado para cambiar un campo es la trampa nº 6 del CLAUDE.md: el
 * generador reescribe la ficha entera desde la selección aprobada y arrastra todo lo que haya
 * cambiado desde la última vez —a Sierra de la Pila le devolvería las aves que le quitó `aves:poda`—.
 * Aquí se tocan dos columnas de siete filas, y eso es exactamente lo que dice este fichero.
 */
function escribeSql(cambios, ruta) {
  const l = [];
  l.push(cabeceraSql(null).trimEnd(), '');
  l.push('-- ' + '='.repeat(96));
  l.push(`-- NaturDex · realineado de claves externas incoherentes del ${HOY}`);
  l.push('-- ' + '-'.repeat(96));
  l.push('-- Generado por `node Tools/catalogo-nacional/fix-identificadores-incoherentes.js --write --sql`.');
  l.push('--');
  l.push('-- QUÉ CORRIGE. Cinco nombres científicos llevaban un identificador distinto en cada');
  l.push('-- espacio, y dos `gbif_species_key` eran de rango familia o género, que no identifica');
  l.push('-- ninguna especie: pedir ocurrencias con ellas trae las de todo el grupo (la 3064 es');
  l.push('-- Amaranthaceae, 5.039.294 ocurrencias; la 2926685 el género Sideritis, 121.554).');
  l.push('--');
  l.push('-- NINGUNA ficha se renombra ni desaparece, así que no hay fila huérfana que borrar: el');
  l.push('-- UPSERT de `build-park-sql.js` casa por `scientific_name` y estos UPDATE también.');
  l.push('--');
  l.push('-- LAS DECISIONES, y con qué autoridad se comprobó cada una:');
  for (const caso of CASOS) {
    for (const campo of CAMPOS) {
      const regla = caso[campo.clave];
      if (!regla) continue;
      l.push(`--   · ${caso.sci} · ${campo.ficha} → ${regla.a}`);
      for (const linea of troceaComentario(regla.motivo)) l.push(`--     ${linea}`);
    }
  }
  l.push('--');
  l.push('-- ORDEN: va DESPUÉS del `-n2.sql` de cada espacio, que es quien da de alta la ficha.');
  l.push('-- Es idempotente: aplicado dos veces, la segunda actualiza 0 filas.');
  l.push('-- ' + '='.repeat(96), '');
  l.push('START TRANSACTION;', '');

  const porEspacio = new Map();
  for (const c of cambios) {
    if (!porEspacio.has(c.slug)) porEspacio.set(c.slug, []);
    porEspacio.get(c.slug).push(c);
  }
  for (const [slug, lista] of porEspacio) {
    l.push(`-- ── ${slug} ${'─'.repeat(Math.max(0, 60 - slug.length))}`);
    for (const c of lista) {
      l.push(`-- ${c.sci}: ${c.de} → ${c.a}`);
      l.push('UPDATE species sp JOIN parks pk ON pk.id = sp.park_id');
      l.push(`   SET sp.${c.columna} = ${c.a}`);
      l.push(` WHERE pk.slug = ${sqlStr(slug)} AND sp.scientific_name = ${sqlStr(c.sci)};`, '');
    }
  }
  l.push('COMMIT;', '');
  l.push('-- Comprobación: después de aplicarlo, ninguna de estas dos claves debe quedar viva.');
  l.push('SELECT sp.gbif_species_key, COUNT(*) AS fichas FROM species sp');
  l.push(' WHERE sp.gbif_species_key IN (3064, 2926685) GROUP BY sp.gbif_species_key;');

  const texto = l.join('\n') + '\n';
  const destino = path.isAbsolute(ruta) ? ruta : path.join(DATABASE, path.basename(ruta));
  if (WRITE) fs.writeFileSync(destino, texto, 'utf8');
  console.log(`\n${WRITE ? '+' : '~'} ${rel(destino)} (${cambios.length} UPDATE)`);
}

// --- Principal ------------------------------------------------------------------------------------

const { cambios, espaciosTocados } = aplica();
if (!cambios.length) {
  console.log('\nNada que corregir: los identificadores ya están alineados.');
} else {
  console.log(`\n${cambios.length} identificador(es) en ${espaciosTocados} espacio(s).`);
  if (SQL) escribeSql(cambios, SQL);
  if (!WRITE) console.log('Simulación. Añade --write para escribirlo.');
}
