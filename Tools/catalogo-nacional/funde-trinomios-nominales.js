#!/usr/bin/env node
'use strict';
/*
 * funde-trinomios-nominales.js — retira del park.json la ficha de una subespecie NOMINAL cuando la
 * especie está fichada aparte en ese mismo espacio.
 *
 * El problema que resuelve
 * -----------------------
 * Es la deuda nº 33. El Formulario Normalizado de Datos de un sitio Red Natura 2000 cita algunas
 * aves en trinomio —«Phalacrocorax carbo carbo», «Porphyrio porphyrio porphyrio»— y el anexo de la
 * norma cita la misma ave en binomio. EIDOS les da DOS `taxonid`, porque especie y subespecie son
 * dos entradas de su Lista Patrón, así que la reconciliación no puede agruparlas: no hay nada que
 * agrupar. Salen DOS fichas del mismo bicho, y la segunda nace mal por construcción —sin
 * `gbifSpeciesKey`, sin ocurrencias, sin foto y sin descripción, porque el catálogo universal no
 * tiene el trinomio—, así que acaba oculta por `especies:ocultar` y el usuario ve un hueco que no
 * existe.
 *
 * `build-species-seleccion.js` lo arregla desde el 2026-08-22 para los espacios nuevos. Esto lo
 * lleva a los park.json YA escritos sin regenerarlos, que es lo mismo que hacen
 * `poda-aves-sin-respaldo.js` y `aplica-fenologia-aves.js` con sus respectivos campos.
 *
 * Las dos condiciones que hacen la fusión segura, copiadas de la selección
 * ------------------------------------------------------------------------
 *   · el TERCER epíteto repite el segundo (subespecie nominal). Sin esto se fundiría *Maytenus
 *     senegalensis* subsp. *europaea*, que sí es un taxón que el catálogo quiere aparte.
 *   · el BINOMIO está fichado en ESE mismo espacio. Un trinomio que llega solo no tiene con qué
 *     fundirse, y retirarlo sería perder la especie entera.
 *
 * Y una tercera que aquí sí hace falta y en la selección no: la ficha del trinomio **no puede
 * aportar nada que el binomio no tenga**. Se comprueba campo a campo (`zepaSiteCode`, `migratory`,
 * `sitePresence`, `habitatIds`, ocurrencias) y, si aporta algo, la ficha NO se retira y se dice cuál
 * es la diferencia: retirarla sería tirar un dato para arreglar una duplicidad.
 *
 * EL TRINOMIO QUE LLEGA SOLO (`--renombra`)
 * ----------------------------------------
 * La segunda condición deja fuera un caso que también existe y que es peor de ver: el espacio ficha
 * el trinomio y NO ficha el binomio. Entonces no hay duplicidad —hay una sola ficha— pero nace igual
 * de mal: sin `gbifSpeciesKey`, sin ocurrencias y sin descripción, con el nombre científico de
 * relleno en el `commonName` y oculta por `especies:ocultar`. En Calblanque es el CALAMÓN, que su
 * formulario declara como «Porphyrio porphyrio porphyrio» y que otros dos espacios fichan como
 * *Porphyrio porphyrio* con su foto y su texto.
 *
 * Con `--renombra` la ficha pasa a llamarse por el binomio y hereda los identificadores de los
 * espacios que ya lo fichan. NO es fundir: no se pierde ninguna ficha, se corrige el nombre de una.
 * Se exige que el binomio EXISTA en el catálogo universal —si no, el renombrado dejaría la ficha
 * apuntando a una entrada que no está y `species:apply` no tendría de dónde repartir— y que no haya
 * más de un juego de identificadores entre los espacios que lo fichan, porque elegir uno a ojo es
 * exactamente lo que `taxones:duplicados` persigue.
 *
 * Detrás de un renombrado hay que pasar `npm run species:poda` (retira del catálogo universal la
 * entrada del trinomio, que ya no usa nadie) y aplicar el borrado de `--sql`: el trinomio se queda
 * huérfano en la BD porque `build-park-sql.js` solo hace UPSERT.
 *
 * `--sql` redacta el borrado, que `build-park-sql.js` NO genera porque solo hace UPSERT: sin él la
 * API sigue sirviendo el trinomio aunque el paquete ya no lo traiga.
 *
 * Idempotente: un segundo pase no cambia un byte. Sin `--write` no toca nada y solo informa.
 *
 * Uso:
 *     node Tools/catalogo-nacional/funde-trinomios-nominales.js [--park <slug>] [--write]
 *                                                              [--sql <ruta>] [--renombra]
 */

const fs = require('fs');
const path = require('path');
const { arg, flag } = require('../lib/cli');
const { CATALOGO_DIR, DATABASE, readJson, rel, fromRoot, parkFiles, escribeEspacio } = require('../lib/io');
const { sqlStr } = require('../lib/sql');

const PARK = arg('park', null);
const WRITE = flag('write');
const RENOMBRA = flag('renombra');
const CON_SQL = flag('sql') || Boolean(arg('sql'));

// Campos que describen a la ESPECIE y que el renombrado tiene que traer de la entrada del binomio:
// son los mismos que reparte `Tools/sync-species-catalog.js`, así que dejarlos con los del trinomio
// haría que el siguiente `species:apply` los cambiara por su cuenta.
const UNIVERSALES = ['commonName', 'kingdom', 'group', 'habitat', 'seasonality', 'rarityScore', 'rarityBasis',
  'description', 'descriptionSource', 'tips', 'taxonomy', 'iucnGlobal', 'iucnSpain', 'spainStatus', 'image', 'imageAttribution'];

const hoy = () => new Date().toISOString().slice(0, 10);

/** ¿Es un trinomio de subespecie NOMINAL? «Phalacrocorax carbo carbo» sí; «… subsp. europaea» no. */
function binomioNominal(scientificName) {
  const p = String(scientificName || '').trim().split(/\s+/);
  if (p.length !== 3) return null;
  if (p[1] !== p[2]) return null;
  return `${p[0]} ${p[1]}`;
}

/**
 * Lo que la ficha del trinomio aportaría y el binomio no tiene. Vacío = se puede retirar sin perder
 * nada. Se mira el DATO, no el texto: el `source` del trinomio siempre difiere y no es lo que
 * importa.
 */
function loQueAporta(tri, bin) {
  const falta = [];
  if (tri.zepaSiteCode && !bin.zepaSiteCode) falta.push('zepaSiteCode');
  if (tri.migratory && !bin.migratory) falta.push('migratory');
  const tiposTri = new Set(((tri.sitePresence || {}).tipos) || []);
  const tiposBin = new Set(((bin.sitePresence || {}).tipos) || []);
  const nuevos = [...tiposTri].filter((t) => !tiposBin.has(t));
  if (nuevos.length) falta.push('sitePresence: ' + nuevos.join(', '));
  const habBin = new Set(bin.habitatIds || []);
  const habNuevos = (tri.habitatIds || []).filter((h) => !habBin.has(h));
  if (habNuevos.length) falta.push('habitatIds: ' + habNuevos.join(', '));
  if ((tri.gbifOccurrences || 0) > (bin.gbifOccurrences || 0)) falta.push('gbifOccurrences');
  return falta;
}

/**
 * El SQL de borrado. Se borra por `scientific_name` dentro del parque —que es la clave única del
 * esquema— y NO por id: los `id` de `species` son autoincrementales de la base de datos y no tienen
 * por qué coincidir con los del park.json.
 */
function redactaSql(slug, borrar) {
  const l = [];
  l.push('-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un');
  l.push('-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.');
  l.push('SET NAMES utf8mb4;');
  l.push('');
  l.push(`-- ${slug} · fusión de subespecies nominales en su especie (deuda nº 33)`);
  l.push(`-- Generado el ${hoy()} por Tools/catalogo-nacional/funde-trinomios-nominales.js`);
  l.push('--');
  l.push('-- El Formulario Normalizado de Datos cita estas aves en trinomio y el anexo de la norma en');
  l.push('-- binomio; EIDOS les da dos taxonid, así que salían DOS fichas del mismo bicho. La del');
  l.push('-- trinomio nace sin gbifSpeciesKey, sin ocurrencias y sin descripción, y acaba oculta: el');
  l.push('-- usuario ve un hueco que no existe. Se comprobó ficha a ficha que no aporta ningún dato');
  l.push('-- que la del binomio no tenga antes de retirarla.');
  l.push('--');
  l.push('-- HACE FALTA porque build-park-sql.js solo hace UPSERT: regenerar el -n2.sql da de alta y');
  l.push('-- corrige, pero no retira nada. Sin esto, la API sigue sirviendo el trinomio. Vale igual');
  l.push('-- para el trinomio RENOMBRADO: el UPSERT da de alta la fila del binomio y deja la vieja');
  l.push('-- viva al lado, que es el tercer rastro de un renombrado (trampa nº 3 del CLAUDE.md).');
  l.push('--');
  l.push('-- ANTES DE APLICARLO:');
  l.push('--   · Haz copia (npm run db:backup). Un DELETE no se deshace con otra pasada.');
  l.push('--   · Pasa después Tools/recalculate-account-progress.php: user_progress.payload indexa los');
  l.push('--     descubrimientos por species_id, y quien hubiera descubierto el trinomio conserva una');
  l.push('--     marca que ya no apunta a ninguna ficha.');
  l.push('--   · Las citas Darwin Core (user_occurrences) NO se tocan: no tienen clave foránea a');
  l.push('--     species precisamente para esto, y llevan su taxonomía copiada.');
  l.push('');
  l.push('START TRANSACTION;');
  l.push('');
  l.push('DELETE sp FROM species sp');
  l.push('JOIN parks pk ON pk.id = sp.park_id');
  l.push(`WHERE pk.slug = ${sqlStr(slug)}`);
  l.push('  AND sp.scientific_name IN (');
  const nombres = [...borrar].sort((a, b) => a.viejo.localeCompare(b.viejo));
  nombres.forEach((r, i) => {
    l.push(`    ${sqlStr(r.viejo)}${i < nombres.length - 1 ? ',' : ''}` +
      `  -- ${r.motivo} ${r.nuevo} («${r.commonName || '—'}»)`);
  });
  l.push('  );');
  l.push('');
  l.push('COMMIT;');
  l.push('');
  l.push('-- Comprobación: debe devolver 0 trinomios y el total esperado del espacio.');
  l.push('SELECT');
  l.push(`    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id` +
    ` WHERE p.slug = ${sqlStr(slug)}) AS especies_del_espacio,`);
  l.push(`    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id` +
    ` WHERE p.slug = ${sqlStr(slug)} AND s.scientific_name IN (` +
    nombres.map((r) => sqlStr(r.viejo)).join(', ') + ')) AS trinomios_que_siguen;');
  return l.join('\n') + '\n';
}

/**
 * Los identificadores y el nombre común con los que los DEMÁS espacios fichan ese binomio. Si no
 * coinciden entre sí, no se elige uno: se devuelve el desacuerdo para que el renombrado no se haga.
 */
function comoLoFichanLosDemas(binomio, slugPropio) {
  const eidos = new Set(), gbif = new Set();
  let ficha = null;
  for (const { slug, file } of parkFiles()) {
    if (slug === slugPropio) continue;
    for (const s of (readJson(file).species || [])) {
      if (s.scientificName !== binomio) continue;
      ficha = ficha || s;
      if (s.eidosTaxonId != null) eidos.add(s.eidosTaxonId);
      if (s.gbifSpeciesKey != null) gbif.add(s.gbifSpeciesKey);
    }
  }
  return { ficha, eidos: [...eidos], gbif: [...gbif] };
}

function main() {
  const espacios = parkFiles().filter((p) => !PARK || p.slug === PARK);
  if (!espacios.length) {
    console.error(PARK ? `No existe Frontend/Data/parks/**/${PARK}/park.json` : 'No hay espacios.');
    process.exit(1);
  }
  // El catálogo universal está indexado POR NOMBRE CIENTÍFICO, que es justo lo que un renombrado
  // desengancha (trampa nº 3 del CLAUDE.md): por eso detrás hay que pasar `npm run species:poda`.
  const universal = readJson(path.join(CATALOGO_DIR, 'data', 'especies-universal.json'));

  let totalRetiradas = 0, totalConservadas = 0, totalRenombradas = 0;

  for (const espacio of espacios) {
    const doc = readJson(espacio.file);
    const species = doc.species || [];
    const porNombre = new Map(species.map((s) => [s.scientificName, s]));

    const retiradas = [], conservadas = [], solitarios = [];
    for (const tri of species) {
      const bin = binomioNominal(tri.scientificName);
      if (!bin) continue;
      const especie = porNombre.get(bin);
      if (!especie) { solitarios.push({ tri, binomio: bin }); continue; }
      const aporta = loQueAporta(tri, especie);
      if (aporta.length) conservadas.push({ tri, bin: especie, aporta });
      else retiradas.push({ tri, bin: especie });
    }

    if (!retiradas.length && !conservadas.length && !solitarios.length) continue;

    console.log(`\n${espacio.slug}:`);
    for (const c of conservadas) {
      console.log(`  = ${c.tri.scientificName} NO se retira: aporta ${c.aporta.join(' · ')} ` +
        `que ${c.bin.scientificName} no tiene`);
    }
    for (const r of retiradas) {
      console.log(`  - ${r.tri.scientificName} (#${r.tri.id}) se funde en ` +
        `${r.bin.scientificName} (#${r.bin.id}, «${r.bin.commonName}»)`);
    }

    // El trinomio que llega SOLO: no hay duplicidad que deshacer, hay un nombre que corregir.
    const renombradas = [];
    for (const s of solitarios) {
      const u = universal[s.binomio];
      const otros = comoLoFichanLosDemas(s.binomio, espacio.slug);
      const viejo = s.tri.scientificName;
      const marca = `${viejo} (#${s.tri.id})`;
      if (!u) {
        console.log(`  ? ${marca} está solo y ${s.binomio} NO tiene ficha en el catálogo universal: ` +
          'no se renombra (species:apply no tendría de dónde repartir).');
        continue;
      }
      if (otros.eidos.length > 1 || otros.gbif.length > 1) {
        console.log(`  ? ${marca} está solo y los demás espacios fichan ${s.binomio} con identificadores ` +
          `distintos (eidos: ${otros.eidos.join('/')} · gbif: ${otros.gbif.join('/')}): no se elige ` +
          'uno. Ver npm run taxones:duplicados.');
        continue;
      }
      if (!RENOMBRA) {
        console.log(`  ~ ${marca} está solo: se renombraría a ${s.binomio} («${u.commonName}»). ` +
          'Añade --renombra.');
        continue;
      }
      s.tri.scientificName = s.binomio;
      // Lo universal se copia de la entrada del binomio, no se hereda del trinomio: si no, el
      // siguiente `species:apply` lo cambiaría por su cuenta y el diff aparecería sin autor.
      for (const c of UNIVERSALES) if (u[c] !== undefined) s.tri[c] = u[c];
      // Los identificadores se REUTILIZAN de los espacios que ya fichan el binomio; no se inventan.
      s.tri.eidosTaxonId = otros.eidos.length === 1 ? otros.eidos[0] : (u.eidosTaxonId != null ? u.eidosTaxonId : null);
      s.tri.gbifSpeciesKey = otros.gbif.length === 1 ? otros.gbif[0] : null;
      // La ficha estaba oculta por «sin descripción»; si el binomio la trae, deja de estarlo.
      if (s.tri.description && s.tri.visible === false &&
          /Sin descripci[óo]n/i.test(String(s.tri.hiddenReason || ''))) {
        s.tri.visible = true;
        delete s.tri.hiddenReason;
      }
      renombradas.push({ viejo, nuevo: s.binomio, commonName: u.commonName });
      console.log(`  → ${marca} renombrada a ${s.binomio} («${u.commonName}»)` +
        (s.tri.visible ? ' y visible' : ''));
    }

    if (!retiradas.length && !renombradas.length) { totalConservadas += conservadas.length; continue; }

    const fuera = new Set(retiradas.map((r) => r.tri.id));
    doc.species = species.filter((s) => !fuera.has(s.id));
    // El espejo `habitats[].speciesIds` no puede quedar apuntando a una ficha que ya no existe:
    // `validate` lo coteja y la API lo serviría como enlace roto.
    for (const h of doc.habitats || []) {
      h.speciesIds = (h.speciesIds || []).filter((id) => !fuera.has(id));
    }

    // El paquete y la `version` del manifiesto van en el mismo paso: aquí se RETIRAN fichas, así que
    // un dispositivo que no vuelva a descargarlo seguiría enseñando el trinomio fundido.
    const { cambia, lineas } = escribeEspacio({
      dir: espacio.dir, file: espacio.file, doc,
      counts: { species: doc.species.length }, write: WRITE,
    });
    for (const l of lineas) console.log('  ' + l);
    if (cambia && WRITE) {
      if (CON_SQL) {
        // Las dos operaciones dejan el MISMO rastro en la BD: una fila con el nombre viejo que el
        // UPSERT de build-park-sql.js no toca. Van juntas en el mismo borrado.
        const borrar = [
          ...retiradas.map((r) => ({ viejo: r.tri.scientificName, nuevo: r.bin.scientificName,
            commonName: r.bin.commonName, motivo: 'se funde en' })),
          ...renombradas.map((r) => ({ viejo: r.viejo, nuevo: r.nuevo, commonName: r.commonName,
            motivo: 'renombrada a' })),
        ];
        const ruta = arg('sql') ? fromRoot(arg('sql')) : path.join(DATABASE, `poda-trinomios-${espacio.slug}.sql`);
        fs.writeFileSync(ruta, redactaSql(espacio.slug, borrar), 'utf8');
        console.log(`  escrito ${rel(ruta)}`);
      }
    } else if (cambia) {
      console.log('  (usa --write para escribirlo; añade --sql para el borrado de la BD)');
    }

    totalRetiradas += retiradas.length;
    totalConservadas += conservadas.length;
    totalRenombradas += renombradas.length;
  }

  console.log(`\nTotal: ${totalRetiradas} ficha(s) retirada(s) · ${totalRenombradas} renombrada(s) · ` +
    `${totalConservadas} conservada(s) por aportar dato`);
  if (totalRenombradas && WRITE)
    console.log('Pasa `npm run species:poda`: la entrada del trinomio ya no la usa ningún espacio.');
  if ((totalRetiradas || totalRenombradas) && WRITE) {
    console.log('Regenera el SQL de los espacios tocados (npm run park:sql -- --park <slug>) y aplica');
    console.log('además el borrado: build-park-sql.js solo hace UPSERT.');
  }
  if (!WRITE) console.log('\n(Simulación: nada escrito. Añade --write.)');
}

main();
