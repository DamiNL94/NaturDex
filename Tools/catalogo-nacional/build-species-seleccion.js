#!/usr/bin/env node
'use strict';
/*
 * build-species-seleccion.js — construye la SELECCIÓN de especies de un espacio: la lista aprobada
 * que `build-species-n2.js` convierte después en la Capa 3 de su `park.json`.
 *
 * El problema que resuelve
 * -----------------------
 * Era el último paso de la Capa 3 sin herramienta. `gbif-habitats.js` da los candidatos y
 * `build-species-n2.js` sabe escribirlos, pero entre los dos había un fichero
 * —`out/<slug>-seleccion-especies.json`— que alguien tenía que producir a mano cruzando GBIF con
 * EIDOS especie por especie. En Sierra de la Pila fueron 625 candidatos para 249 aprobadas; hacerlo
 * a mano otra vez en el espacio siguiente no es lento, es **irreproducible**: nadie puede comprobar
 * después por qué entró una y no otra. (Aquí ponía «en Carrascoy fueron 625 candidatos»: los 625 son
 * de Sierra de la Pila. Carrascoy tiene 1.456, y la cifra equivocada llegó a repetirse en un commit
 * y en un informe antes de que alguien la cotejara.)
 *
 * EL ORDEN DE PRIORIDAD DE LAS FUENTES
 * ------------------------------------
 * Primero la LEGISLACIÓN, después EIDOS, y GBIF **solo para corroborar**. Ese orden es la decisión
 * de producto que gobierna este fichero, y hasta el 2026-08-16 estaba invertido: GBIF era la puerta
 * y el anexo normativo «daba evidencia, no entrada».
 *
 * El motivo del cambio: **GBIF no distingue lo característico de lo que pasaba por allí**. Sus
 * registros son avistamientos subidos por gente, y dentro del límite de un parque caen olivos de un
 * bancal abandonado, ornamentales de una casa de campo y bichos en tránsito. Se ve en el propio
 * catálogo: *Olea europaea* subsp. *europaea* —el olivo CULTIVADO, no el acebuche— está fichado en
 * seis espacios, en uno de ellos con un solo registro. La app existe para enseñar la riqueza de un
 * espacio protegido y para que la gente lo valore; un catálogo con el olivo del bancal dentro dice
 * lo contrario de lo que pretende.
 *
 * Los tres niveles, y qué exige cada uno:
 *
 *   NIVEL 1 · LEGISLACIÓN — el anexo normativo del PORN/PRUG o del decreto de declaración, y el
 *      Formulario Normalizado de Datos del sitio Red Natura 2000. Son las únicas fuentes que
 *      afirman por escrito que la especie forma parte de ESTE espacio. **Entran sin exigirles
 *      constancia en GBIF**: que un barrido de ciencia ciudadana no haya visto un taxón no
 *      desmiente a la norma que lo inventaría. GBIF, si lo confirma, lo corrobora y ya está.
 *   NIVEL 2 · EIDOS Y ATLAS — la figura legal de protección (v_estadolegal, estatal o autonómica) y
 *      las especies características del HIC según el «Atlas y Manual de los Hábitats». Estas dos
 *      dicen qué ES el taxón y de qué hábitat es propio, pero no dicen que esté AQUÍ, así que
 *      **necesitan que GBIF lo corrobore** dentro de los polígonos del espacio.
 *   NIVEL 3 · SOLO GBIF — ninguna fuente lo respalda y solo hay avistamientos. **No entra.** Es la
 *      regla nueva y la que quita los ornamentales. `--gbif-sin-respaldo` la levanta a propósito.
 *
 * Lo que esta regla cuesta, y hay que tenerlo delante
 * --------------------------------------------------
 * Los catálogos legales enumeran **lo protegido, no lo característico**, y lo común no está
 * protegido precisamente por ser común. Medido sobre los ocho espacios publicados el 2026-08-16:
 * **330 de 1.161 fichas visibles (28 %) se sostienen solo en GBIF**, y en Sierra de la Pila entre
 * ellas están el romero, el pino carrasco, la jara blanca, el jabalí y el zorro. El PRUG de ese
 * espacio inventaría 243 taxones y el romero no figura.
 *
 * La salida NO es relajar la puerta: es **subir de nivel esas especies**, y hay dos vías escritas.
 * La primera, transcribir los planes de gestión que faltan —cuatro de los ocho espacios no tienen
 * anexo en `data/anexos-normativos.json`, que es la deuda nº 1 del rollout—. La segunda, completar
 * el índice del Atlas: es la fuente que dice «esta especie es característica de este hábitat», que
 * es exactamente lo que le falta al romero, y hoy solo cubre 98 de sus 344 bloques.
 *
 * RAREZA
 * ------
 * `rarityScore` (1–5) sale de la AUTORIDAD LEGAL y de nada más: la categoría estatal más grave que
 * EIDOS devuelve para el taxón. No mezcla señales de abundancia —ni ocurrencias de GBIF, ni en
 * cuántos espacios aparece—, que serían un dato derivado más al que habría que buscarle respaldo;
 * el estado legal es dato oficial directo (CLAUDE.md, regla nº 1). Es un tramo estatal, y por eso
 * puede vivir en el catálogo universal: el catálogo autonómico es territorial y va en `murciaStatus`.
 *
 * El CEEEI (RD 630/2013) NO cuenta como respaldo: es el catálogo de especies exóticas INVASORAS, no
 * una figura de protección. Va por su propio camino (`invasoras-eei.js`).
 *
 * Lo que NO hace: no escribe en `park.json` ni en la BD (regla nº 2 de Tools/CLAUDE.md). Deja la
 * selección y un informe en `out/` para revisarlos antes de adoptarlos. Y no inventa: de cada
 * especie queda escrito de qué fuente sale cada cosa, y las excluidas salen con su motivo en
 * `excluidas_detalle` para poder discutir el criterio sin volver a ejecutarlo todo.
 *
 * Uso:
 *   node Tools/catalogo-nacional/build-species-seleccion.js --park <slug> \
 *        [--atlas <atlas.txt>] [--gbif <ruta>] [--out <ruta>] [--informe <ruta.md>] [--dry]
 *
 *   --atlas   texto del «Atlas y Manual de los Hábitats de España» (pdftotext). Sin él no hay
 *             evidencia `caracteristica` y se dice en el informe, en vez de callarlo.
 *   --anexos  fichero de anexos normativos (por defecto data/anexos-normativos.json). Si el espacio
 *             no tiene entrada, se dice en el informe en vez de callarlo.
 *   --ccaa    comunidad cuyo catálogo regional de especies amenazadas se consulta (por defecto,
 *             la del propio espacio).
 */

const fs = require('fs');
const path = require('path');
const { arg, num, flag, requireArgs, die, sleep } = require('../lib/cli');
const { CATALOGO_DIR, OUT_DIR, readJson, writeJson, rel, fromRoot, parkFiles } = require('../lib/io');
const eidos = require('../lib/eidos');
const { especiesCaracteristicas, binomio } = require('../lib/atlas');
// La escalera 1–5 vive en lib/ porque `rareza-legal.js` aplica exactamente el mismo criterio sobre
// el texto ya redactado del park.json. Dos copias se separarían en cuanto alguien tocara una.
const { tramoDeCategoria, SIGNIFICADO } = require('../lib/rareza');
// El puente de nomenclatura entre lo que escribe una fuente oficial y lo que ficha el catálogo. Vive
// en lib/ porque `poda-aves-sin-respaldo.js` tiene que tomar EXACTAMENTE la misma decisión sobre los
// espacios ya publicados: dos implementaciones de «tiene respaldo de sitio» divergirían a la primera.
const respaldoSitio = require('../lib/respaldo-sitio');

const PARK = arg('park');
const DRY = flag('dry');
requireArgs('Uso: --park <slug> [--atlas <atlas.txt>] [--gbif <ruta>] [--out <ruta>] [--dry]', { park: PARK });

// Umbrales del filtro 3. Se dejan como parámetro porque un espacio muy pequeño o muy poco muestreado
// puede necesitar bajarlos, y entonces tiene que constar en el informe de cierre.
//
// El defecto es 2, no los 5 de Carrascoy, y el motivo es que la métrica cambió debajo: hasta Sierra
// de Salinas, `gbif-habitats.js` sumaba las ocurrencias POR HÁBITAT, y como los recintos del Atlas
// son mosaicos, una planta con un solo registro en un recinto de cuatro códigos llegaba declarando
// cuatro. Corregida la cuenta a registros distintos, 2 es lo que reproduce lo que los espacios ya
// publicados obtuvieron con 5 sobre la cifra inflada (factor de mosaico medio ~2,8). Esa calibración
// se decidió el 2026-08-15 (c) y se escribió sólo en el informe: el defecto del código se quedó en 5,
// así que el espacio siguiente lo habría aplicado sin enterarse de que era el umbral viejo sobre la
// métrica nueva. Vive aquí para que no vuelva a pasar.
//
// Y el umbral PROPIO de un espacio vive en `data/umbrales-seleccion.json`, por el mismo motivo y a la
// segunda vez: Monte Arabí bajó a 1 el mínimo de hábitats —tiene solo dos cartografiados, así que
// exigir 2 es exigir el 100 %— y esa decisión se quedó también en su informe. Regenerarlo sin
// acordarse le quitaba diez fichas sin decir nada. Lo que se pasa por la línea de órdenes manda sobre
// el fichero, y entonces se dice.
const UMBRALES = (() => {
  const ruta = path.join(CATALOGO_DIR, 'data', 'umbrales-seleccion.json');
  if (!fs.existsSync(ruta)) return {};
  return (readJson(ruta).espacios || {})[PARK] || {};
})();
const MIN_OCURRENCIAS = num('min-occ', UMBRALES.minOcurrencias ?? 2);
const MIN_HABITATS = num('min-habitats', UMBRALES.minHabitats ?? 2);

// Las exclusiones curadas del espacio (filtro 0, más abajo). Se cargan aquí para poder decir cuántas
// hay antes de empezar: una lista que no se aplica es peor que no tenerla.
const EXCLUSIONES = (() => {
  const ruta = path.join(CATALOGO_DIR, 'data', 'exclusiones-especies.json');
  const m = new Map();
  if (!fs.existsSync(ruta)) return m;
  for (const e of (readJson(ruta).espacios || {})[PARK] || []) {
    if (!e.motivo) die(`exclusiones-especies.json: «${e.scientificName}» no tiene motivo, y una exclusión sin motivo no se distingue de un olvido.`);
    m.set(e.scientificName, e);
  }
  return m;
})();

/*
 * Filtro 4 — ALCANCE TAXONÓMICO. El que estaba aplicado y sin escribir.
 *
 * Las cuatro selecciones hechas hasta ahora dicen, sin decirlo, qué cataloga NaturDex: de las 448
 * fichas del catálogo universal hay **un solo insecto** y ni un liquen, musgo, hongo o arácnido.
 * No es un descuido: es lo que se puede llevar a una guía de campo con foto y tres pistas de
 * identificación, y es lo que un visitante puede reconocer sin lupa ni clave dicotómica.
 *
 * GBIF no distingue: de los 625 candidatos de Sierra de la Pila, 251 son insectos —muchos
 * microlepidópteros determinados por trampa de luz—. Aprobarlos daría un catálogo con 127 insectos
 * en un espacio y uno en el de al lado, que es peor que cualquiera de las dos opciones por separado.
 *
 * Así que el criterio se escribe aquí, con su lista de clases, y se puede cambiar con
 * `--clases` (lista separada por comas) o desactivar con `--todas-las-clases`. Lo que queda fuera
 * NO se tira: sale en `excluidas_detalle` con este motivo, y recuperarlo es volver a ejecutar.
 */
const CLASES_POR_DEFECTO = [
  // Flora vascular
  'Magnoliopsida', 'Liliopsida', 'Pinopsida', 'Gnetopsida', 'Polypodiopsida', 'Lycopodiopsida',
  // Vertebrados
  'Aves', 'Mammalia', 'Reptilia', 'Squamata', 'Testudines', 'Amphibia', 'Actinopterygii',
];

/*
 * EL MISMO ALCANCE, DICHO EN EL VOCABULARIO DE EIDOS.
 *
 * La lista de arriba son clases de GBIF, y eso deja fuera del filtro justo a los candidatos que la
 * legislación aporta y GBIF no conoce: sin registro no hay `class`, y `fueraDelAlcance` no podía
 * juzgarlos. El guardián se abría en silencio —`if (c.class && …)`— así que el candidato pasaba.
 *
 * Lo destapó Calblanque, cuyo formulario de la ZEPA Mar Menor (ES0000260) aporta invertebrados
 * lagunares: la esponja *Tethya citrina*, el isópodo *Sphaeroma serratum*, los gasterópodos
 * *Jujubinus* y los camarones *Crangon* y *Palaemon* entraban en el catálogo de un parque de sierra
 * y arenales. Siete fichas, todas de nivel 1, todas fuera del alcance declarado del catálogo.
 *
 * EIDOS sí clasifica a esos taxones: su `taxonomicgroup` los llama «Invertebrados», y llama «Peces»
 * a *Aphanius iberus* —que es la ÚNICA especie del formulario del propio LIC de Calblanque y sí
 * entra— y «Plantas vasculares» a las cuatro plantas del mismo bloque. Es el mismo criterio de
 * siempre —flora vascular y vertebrados— leído en el único vocabulario disponible para esas fichas.
 */
const GRUPOS_EIDOS_EN_ALCANCE = new Set([
  'Plantas vasculares',
  'Aves', 'Mamíferos', 'Reptiles', 'Anfibios', 'Peces',
]);

/**
 * ¿Está el candidato fuera del alcance taxonómico del catálogo? Devuelve el motivo, o null.
 * Prefiere la clase de GBIF, que es la que se ha usado siempre; cae al grupo de EIDOS cuando el
 * candidato no tiene registro en GBIF, que es el hueco por el que se colaban los invertebrados.
 */
function fueraDelAlcance(clase, grupoEidos) {
  if (TODAS_LAS_CLASES) return null;
  if (clase) return CLASES.has(clase) ? null : `fuera del alcance del catálogo (clase ${clase})`;
  if (grupoEidos) {
    return GRUPOS_EIDOS_EN_ALCANCE.has(grupoEidos)
      ? null
      : `fuera del alcance del catálogo (grupo EIDOS ${grupoEidos}; sin registro en GBIF, que es de donde sale la clase)`;
  }
  return null;   // Ni GBIF ni EIDOS lo clasifican: no hay con qué juzgarlo, y no se inventa.
}
/*
 * La escotilla del nivel 3: aprueba lo que solo respalda GBIF, con el umbral de presencia de
 * siempre. Es el criterio que estuvo vigente hasta el 2026-08-16 y con el que se construyeron los
 * ocho espacios publicados, así que hace falta para reproducir aquellos catálogos y para medir la
 * diferencia. Está APAGADA por defecto a propósito: encenderla es volver a dejar que un avistamiento
 * suelto meta un olivo de bancal en el catálogo de un parque.
 */
const GBIF_SIN_RESPALDO = flag('gbif-sin-respaldo');

const TODAS_LAS_CLASES = flag('todas-las-clases');
const CLASES = new Set(
  (arg('clases') ? arg('clases').split(',').map(s => s.trim()) : CLASES_POR_DEFECTO).filter(Boolean)
);

/*
 * Filtro 3 bis — LAS AVES NO ENTRAN POR EL FILTRO DE PRESENCIA.
 *
 * Es la única clase para la que la puerta de los demás no mide lo que dice medir. El filtro 1 y el 3
 * cuentan ocurrencias DENTRO de los polígonos de hábitat, y un ave no está en un polígono: lo
 * sobrevuela. El propio repo lo tenía escrito desde el piloto —«filtrar Aves: son el 88 % de las
 * ocurrencias y casi todo ruido espacial», `Docs/runbook/TRAMPAS-CONOCIDAS.md`— y `build-species-n2.js`
 * lo asume al escribir la ficha, que sale a propósito SIN `habitatIds`. O sea que el ave entraba por
 * una prueba cuyo resultado el propio catálogo declaraba falso acto seguido.
 *
 * Lo que eso producía, medido antes del cambio: 557 de 1.492 fichas eran aves (el 73 % del catálogo
 * en Monte Arabí, el 26 % en Cuatro Calas — una proporción que mide la cobertura de eBird, no el
 * espacio), y 366 de ellas llevaban una `reviewNote` pidiendo contrastar con la lista oficial del
 * sitio. Justo la incomparabilidad entre espacios que el filtro 4 se escribió para evitar.
 *
 * Así que para las aves la puerta es el RESPALDO DE SITIO —la única evidencia que afirma la
 * pertenencia a ESTE espacio— y GBIF pasa a ser la confirmación:
 *
 *   · el formulario oficial del sitio Red Natura 2000 (`especies-sitio-rn2000.js`), o
 *   · el anexo normativo del PORN/PRUG/decreto del espacio.
 *
 * No vale estar protegida: que un ave sea LESRPE es dato oficial sobre la especie, no sobre este
 * espacio, y con eso volveríamos a aprobar por ubicuidad. Las aves sin respaldo de sitio no se
 * pierden: salen en `excluidas_detalle` con su motivo, y recuperarlas es volver a ejecutar.
 *
 * `--aves-sin-respaldo` restaura el comportamiento anterior (el ave entra por presencia, como una
 * planta). Está para poder reproducir una selección vieja tal cual se hizo, no para usarlo.
 */
const AVES_SIN_RESPALDO = flag('aves-sin-respaldo');

// Caché de EIDOS: un catálogo son ~1.300 peticiones a un servicio público. Sin ella, repetir la
// selección tras ajustar un umbral vuelve a castigar al IEPNB durante diez minutos.
//
// **Se escribe también con `--dry`**, y esto no es un descuido sino la corrección de uno. `--dry`
// significa «no escribas el RESULTADO», no «no guardes lo que ya has preguntado»: la caché no es un
// resultado, es la cortesía con la fuente. Y el caso para el que se escribió es exactamente éste,
// porque después de un `--dry` viene siempre la pasada de verdad. En Carrascoy y El Valle, con 1.456
// candidatos, la simulación se llevó veinticinco minutos de EIDOS y los tiró: la pasada buena tuvo
// que volver a preguntarlo todo.
const CACHE = fromRoot(arg('cache', path.join(OUT_DIR, `${PARK}-eidos-seleccion-cache.json`)));

const RUTA_GBIF = fromRoot(arg('gbif', path.join(OUT_DIR, `${PARK}-gbif.json`)));
const RUTA_OUT = fromRoot(arg('out', path.join(OUT_DIR, `${PARK}-seleccion-especies.json`)));
const RUTA_INFORME = fromRoot(arg('informe', path.join(OUT_DIR, `${PARK}-seleccion-especies.md`)));
const RUTA_ATLAS = arg('atlas') ? fromRoot(arg('atlas')) : null;
// El anexo normativo del espacio. Va por defecto porque su ausencia NO es una opción silenciosa: si
// el espacio no tiene entrada, la herramienta lo dice igual que dice que falta el Atlas.
const RUTA_ANEXOS = arg('anexos')
  ? fromRoot(arg('anexos'))
  : path.join(CATALOGO_DIR, 'data', 'anexos-normativos.json');
// La lista oficial de especies de los sitios Red Natura 2000 del espacio (secciones 3.2 y 3.3 del
// Formulario Normalizado de Datos), que trae `especies-sitio-rn2000.js`. Va por defecto y su
// ausencia se dice, igual que la del Atlas y la del anexo: es la puerta de las aves.
const RUTA_SITIO = fromRoot(arg('sitio', path.join(OUT_DIR, `${PARK}-rn2000-sitio.json`)));

const hoy = () => new Date().toISOString().slice(0, 10);

// --- Candidatos: GBIF ∩ polígonos de hábitat -------------------------------------------------------
// `gbif-habitats.js` da dos cuentas y sólo una mide presencia:
//
//   · `especies[].occurrences` — registros DISTINTOS dentro de algún polígono. Es la buena.
//   · `habitats[].species[].occurrences` — registros por polígono. Sumarla entre hábitats NO da los
//     registros de la especie: los recintos del Atlas son MOSAICOS y el mismo punto entra en el
//     listado de cada código del recinto, así que la suma multiplica por el mosaico.
//
// Sumar la segunda es lo que se hacía, y hacía que el umbral del filtro 3 significara una cosa
// distinta en cada espacio: en Sierra de Salinas hay un recinto con cuatro códigos, y 49 plantas con
// UN registro cada una llegaban al filtro declarando «4 ocurrencias». El conjunto de hábitats sí
// estaba bien contado (es un Set), y sigue igual.
/*
 * Los candidatos DOCUMENTALES: lo que la norma del espacio y el formulario oficial del sitio
 * enumeran y el barrido de GBIF no ha encontrado.
 *
 * Antes esto era el apartado `anexo_sin_constancia` del informe: un hueco que se listaba y se
 * perdía, porque la constancia en GBIF era la puerta. Con el orden de prioridad nuevo entran como
 * candidatos de pleno derecho, con cero ocurrencias y sin hábitats — que es la verdad de lo que se
 * sabe de ellos— y los aprueba el nivel 1.
 *
 * Se añaden por su nombre literal y sin intentar casarlos aquí con los de GBIF: de eso se encarga
 * `reconcilia()` unas líneas más abajo, agrupando por `taxonid` de EIDOS, que es lo que resuelve que
 * el formulario diga *Sylvia undata* y GBIF sirva *Curruca undata*. Casarlos a mano por el binomio
 * sería la tercera implementación del mismo puente y la que divergiría.
 */
/**
 * Quita las salvedades de alcance que el Formulario Normalizado de Datos escribe entre paréntesis
 * detrás del nombre: «Falco peregrinus ([including pelegrinoides])», «Sylvia cantillans ([excluding
 * subalpina])», «Melanitta nigra (sensu stricto [excluding americana])». Son notas sobre qué
 * subespecies cubre la ficha del sitio, no parte del nombre científico.
 */
function sinSalvedades(nombre) {
  return String(nombre || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function candidatosDocumentales(anexo, sitio, yaEstan) {
  const nuevos = new Map();
  const añade = (nombre, clase) => {
    if (!nombre || yaEstan.has(nombre) || nuevos.has(nombre)) return;
    nuevos.set(nombre, {
      scientificName: nombre, class: clase || null, gbifOccurrences: 0,
      hics: new Set(), habitats: 0, soloDocumental: true,
    });
  };
  // Del anexo se usa el `nombreCorregido` cuando lo hay, y no el verbatim de la norma. La
  // transcripción conserva las erratas de imprenta a propósito («Anthillis cytisoides»), pero dar de
  // alta un candidato con la errata dentro sería fichar una especie que no existe: EIDOS no la
  // resuelve, se queda sin `taxonid`, la reconciliación no puede agruparla y acaba en el catálogo
  // con el nombre mal escrito. El verbatim sigue guardado en la entrada, que es donde tiene que estar.
  for (const e of anexo.mapa.values()) añade(e.nombreCorregido || e.scientificName, null);
  // El formulario del sitio trae el grupo taxonómico en una letra (B = aves, M = mamíferos,
  // A = anfibios y reptiles, F = peces, P = plantas, I = invertebrados). Solo se traduce la de las
  // aves, que es la que necesita el filtro 3 bis; el resto lo resuelve EIDOS.
  //
  // Y se le quitan las SALVEDADES entre paréntesis por el mismo motivo que al anexo se le quitan las
  // erratas: «Falco peregrinus ([including pelegrinoides])» no es un nombre, es un nombre más una
  // nota de alcance, y EIDOS no lo resuelve. El índice del formulario sí sabe cruzarlo —está hecho
  // por binomio— así que el candidato ENTRABA, y se caía después en la resolución con un motivo que
  // hacía pensar en una errata de la fuente. En Calblanque costaba seis aves de nivel 1, el halcón
  // peregrino entre ellas, en un parque de acantilados. El verbatim del formulario no se pierde:
  // sigue en `sitio.mapa`, que es de donde sale la cita de la ficha.
  for (const lista of sitio.mapa.values()) {
    for (const e of lista) añade(sinSalvedades(e.scientificName), e.grupoCodigo === 'B' ? 'Aves' : null);
  }
  return [...nuevos.values()];
}

function candidatos() {
  if (!fs.existsSync(RUTA_GBIF)) {
    die(`No existe ${rel(RUTA_GBIF)}. Genera antes los candidatos:\n` +
        `  npm run gbif:habitats -- --park ${PARK} --json ${rel(RUTA_GBIF)}`);
  }
  const g = readJson(RUTA_GBIF);
  const porEspecie = new Map();
  for (const h of g.habitats || []) {
    for (const s of h.species || []) {
      const e = porEspecie.get(s.name) || {
        scientificName: s.name, class: s.class || null, gbifOccurrences: null, hics: new Set(),
      };
      // El CONJUNTO de hábitats, no la cuenta: al fusionar dos nombres del mismo taxón hay que
      // unirlos, y sumar las cuentas contaría dos veces los hábitats en que están los dos.
      if (h.hic) e.hics.add(h.hic);
      porEspecie.set(s.name, e);
    }
  }
  const distintas = new Map((g.especies || []).map(s => [s.name, s.occurrences]));
  if (!distintas.size) {
    // Un `--json` viejo no trae la cuenta por especie. Se avisa en vez de volver a la suma en
    // silencio: la diferencia decide qué especies entran en el catálogo.
    die(`${rel(RUTA_GBIF)} no trae el bloque \`especies\` con los registros distintos por especie:\n` +
        '  es un volcado anterior al 2026-08-15, y la suma por hábitat que traía multiplica por el\n' +
        '  mosaico del Atlas. Regenéralo:\n' +
        `  npm run gbif:habitats -- --park ${PARK} --json ${rel(RUTA_GBIF)}`);
  }
  for (const e of porEspecie.values()) {
    e.habitats = e.hics.size;
    e.gbifOccurrences = distintas.get(e.scientificName) ?? 0;
  }
  return [...porEspecie.values()].sort((a, b) => b.gbifOccurrences - a.gbifOccurrences);
}

/*
 * RECONCILIACIÓN TAXONÓMICA — el paso §4 del procedimiento por parque, que no tenía código.
 *
 * GBIF sirve el sinónimo y el nombre aceptado como si fueran dos especies distintas, cada uno con su
 * `speciesKey` y sus ocurrencias. En Sierra de la Pila salieron siete pares así, y dos de ellos
 * habrían metido **la misma especie dos veces en el mismo espacio**: *Sylvia melanocephala* (230
 * registros) junto a *Curruca melanocephala* (24), y *Picus viridis* (13) junto a *Picus sharpei* (6).
 * En el mapa son dos chinchetas; en el catálogo, dos fichas que hay que mantener sincronizadas.
 *
 * Quien los identifica es EIDOS: los dos nombres resuelven al mismo `taxonid`. Así que se agrupa por
 * ahí y se elige UN nombre, con esta prioridad:
 *
 *   1. El que ya use otro espacio para ese mismo `taxonid`. Manda el catálogo, no la fuente: usarlo
 *      REUTILIZA la ficha existente en vez de crear una gemela. Es lo que evita que *Sedum sediforme*
 *      (Cuatro Calas) y *Petrosedum sediforme* (aquí) acaben siendo dos especies para la app.
 *   2. Si ninguno está fichado, el nombre aceptado por EIDOS.
 *   3. Y si EIDOS no da aceptado, el que más registros tenga.
 *
 * Renombrar NO es gratis y por eso solo se hace dentro de este paso: la clave de `data/contenido/` y
 * la del catálogo universal van por nombre científico (CLAUDE.md §2). Aquí todavía no hay nada
 * escrito, que es justo el momento en que sale barato.
 *
 * Y renombrar OBLIGA a dejar escrito de qué nombre se viene, en `sinonimosFusionados`. Es el único
 * hilo que une la ficha con el barrido de GBIF, que está indexado por el nombre que sirve GBIF y no
 * por el que acaba usando el catálogo. La primera versión de esto solo lo anotaba cuando el grupo
 * tenía más de un miembro, y el caso de UN solo candidato renombrado —el más frecuente, porque es el
 * de la especie que ya está fichada en otro parque con otro nombre— se quedaba sin hilo: en Sierra
 * de la Pila **cinco plantas perdieron TODOS sus enlaces a hábitat**, entre ellas el romero, con 200
 * ocurrencias en 9 de los 10 hábitats del espacio. Sin error y sin aviso en el fichero: el `source`
 * de la ficha seguía diciendo «9 hábitats» mientras `habitatIds` estaba vacío.
 */
function reconcilia(lista, resueltas, porTaxonId) {
  const grupos = new Map();
  const sueltas = [];
  for (const c of lista) {
    const t = resueltas.get(c.scientificName);
    const id = t && t.taxonid;
    if (!id) { sueltas.push(c); continue; }
    if (!grupos.has(id)) grupos.set(id, []);
    grupos.get(id).push(c);
  }

  const salida = [...sueltas];
  const fusiones = [];
  for (const [taxonid, miembros] of grupos) {
    const fichado = porTaxonId.get(String(taxonid));
    let elegido;
    if (fichado && miembros.some(m => m.scientificName === fichado.scientificName)) {
      elegido = miembros.find(m => m.scientificName === fichado.scientificName);
    } else if (fichado) {
      // Ningún candidato se llama como la ficha existente, pero es el mismo taxón: se adopta su
      // nombre para reutilizarla, conservando las ocurrencias que sí son de este espacio.
      elegido = { ...miembros[0], scientificName: fichado.scientificName };
    } else {
      const aceptado = miembros
        .map(m => (resueltas.get(m.scientificName) || {}).nombreAceptadoEidos)
        .find(Boolean);
      const binAceptado = aceptado ? aceptado.split(/\s+/).slice(0, 2).join(' ').toLowerCase() : null;
      elegido = (binAceptado && miembros.find(m => m.scientificName.toLowerCase().startsWith(binAceptado)))
        || miembros[0];
    }

    // Los nombres con los que GBIF sirve este taxón y que NO son el elegido. Se calcula igual tanto
    // si el grupo tenía varios candidatos como si era uno solo al que se le ha cambiado el nombre:
    // en los dos casos es lo que hace falta para volver a encontrar el barrido.
    const otrosNombresGbif = miembros
      .map(m => m.scientificName).filter(n => n !== elegido.scientificName);

    if (miembros.length > 1) {
      // La CLASE se hereda del grupo, no del elegido, y esto no es un detalle: el grupo es UN solo
      // taxón, así que la clase de cualquiera de sus nombres vale para todos, y el elegido puede
      // perfectamente no tenerla —la clase sale del registro de GBIF, y un candidato que solo aporta
      // la legislación no tiene registro—. Cuando el nombre que sobrevive es el documental y el que
      // se absorbe es el que GBIF conoce, el fusionado se quedaba con `class: null`.
      //
      // El daño es silencioso y cae entero sobre las AVES, porque `build-species-n2.js` decide con
      // `sel.class === 'Aves'` dos cosas a la vez: vaciar `habitatIds` —un ave vuela, y sus
      // ocurrencias caen en cualquier polígono— y darle su `zepaSiteCode`. Un ave sin clase acaba
      // colgada de diez hábitats y fuera del apartado de la ZEPA, con un `source` que dice lo
      // contrario que su propia ficha. Lo destapó San Pedro del Pinatar con tres: la gaviota de
      // Audouin y la cabecinegra, que el formulario del sitio cita como *Ichthyaetus*, y la grajilla,
      // que el PRUG cita como *Coloeus* — en las tres, EIDOS acepta el otro género.
      const claseDelGrupo = elegido.class || (miembros.find(m => m.class) || {}).class || null;
      const fusionado = {
        ...elegido,
        class: claseDelGrupo,
        gbifOccurrences: miembros.reduce((s, m) => s + m.gbifOccurrences, 0),
        hics: new Set(miembros.flatMap(m => [...m.hics])),
      };
      fusionado.habitats = fusionado.hics.size;
      fusionado.sinonimosFusionados = otrosNombresGbif;
      fusiones.push({ taxonid, elegido: elegido.scientificName, fusionados: otrosNombresGbif });
      salida.push(fusionado);
    } else {
      if (otrosNombresGbif.length) {
        fusiones.push({ taxonid, elegido: elegido.scientificName, renombradaDe: miembros[0].scientificName });
        salida.push({ ...elegido, sinonimosFusionados: otrosNombresGbif });
      } else {
        salida.push(elegido);
      }
    }
  }
  return { lista: salida.sort((a, b) => b.gbifOccurrences - a.gbifOccurrences), fusiones };
}

/*
 * La cuarta vía de la reconciliación, y la única que no sale de un identificador: la TABLA DE
 * EQUIVALENCIAS verificadas a mano.
 *
 * `reconcilia()` agrupa por `taxonid` de EIDOS, que es la clave maestra y resuelve casi todo. Pero
 * no puede resolver el caso en que EIDOS mantiene DOS entradas válidas para el mismo taxón, porque
 * entonces hay dos taxonid y no hay nada que agrupar. Ahí es donde la curruca rabilarga se partió en
 * dos: `Curruca undata` (80931) en tres espacios y `Sylvia undata` (80230, que es la subespecie
 * nominal) en otros cuatro, con foto, texto y contadores por separado.
 *
 * Se corrigió a mano en una de las siete fichas el 2026-08-09, y las cuatro Capas 3 generadas
 * después la volvieron a introducir: una corrección que vive en el dato y no en la herramienta dura
 * hasta la siguiente regeneración. Esta pasada es lo que hace que la corrección viva en la
 * herramienta.
 */
/*
 * La QUINTA vía, y la que cierra el hueco que dejan las otras cuatro: la SUBESPECIE NOMINAL.
 *
 * El Formulario Normalizado de Datos de un sitio Red Natura 2000 cita algunas aves en trinomio
 * —«Phalacrocorax carbo carbo», «Porphyrio porphyrio porphyrio»—, y el anexo de la norma cita la
 * misma ave en binomio. EIDOS les da DOS taxonid distintos, porque especie y subespecie son dos
 * entradas de su Lista Patrón, así que `reconcilia()` no puede agruparlas: no hay nada que agrupar.
 * El resultado es una ficha duplicada del mismo bicho, y la segunda nace mal por construcción —sin
 * clave de GBIF, sin ocurrencias, sin foto y sin descripción, porque el catálogo universal no tiene
 * el trinomio—, así que acaba oculta por `especies:ocultar` y el usuario ve un hueco que no existe.
 * Medido el 2026-08-22 sobre los doce espacios publicados: 5 pares en 4 espacios, todos aves y todos
 * subespecie NOMINAL.
 *
 * Se funde SOLO la subespecie nominal —el tercer epíteto repite el segundo— y SOLO cuando el binomio
 * está también entre los candidatos de este espacio. Las dos condiciones importan. La primera porque
 * una subespecie NO nominal sí puede ser un taxón que el catálogo quiera aparte (*Maytenus
 * senegalensis* subsp. *europaea*); la segunda porque un trinomio que llega solo es el único nombre
 * que hay de ese taxón aquí y fundirlo no tendría con qué. Con las dos, la fusión es segura: la
 * subespecie nominal es, por definición, el mismo animal que su especie, y ninguna de las dos fichas
 * puede decir del espacio nada que la otra no diga.
 */
function fundeSubespeciesNominales(lista) {
  const porNombre = new Map(lista.map(c => [c.scientificName.toLowerCase(), c]));
  const fundidas = [];
  const salida = [];
  for (const c of lista) {
    const partes = c.scientificName.split(/\s+/).filter(w => !/^(subsp\.|ssp\.|var\.)$/i.test(w));
    if (partes.length < 3 || partes[1].toLowerCase() !== partes[2].toLowerCase()) { salida.push(c); continue; }
    const binomial = porNombre.get(`${partes[0]} ${partes[1]}`.toLowerCase());
    if (!binomial) { salida.push(c); continue; }
    // La especie se queda con la evidencia y las ocurrencias de las dos: el trinomio suele traer el
    // respaldo del formulario del sitio y el binomio, las ocurrencias de GBIF.
    binomial.evidence = [...new Set([...(binomial.evidence || []), ...(c.evidence || [])])];
    binomial.gbifOccurrences = (binomial.gbifOccurrences || 0) + (c.gbifOccurrences || 0);
    binomial.class = binomial.class || c.class || null;
    binomial.sinonimosFusionados = [...new Set([...(binomial.sinonimosFusionados || []), c.scientificName])];
    fundidas.push({ trinomio: c.scientificName, binomio: binomial.scientificName });
  }
  return { lista: salida, fundidas };
}

function aplicaEquivalencias(lista, equivalencias) {
  if (!equivalencias || !equivalencias.size) return { lista, renombradas: [] };
  const porNombre = new Map();
  const renombradas = [];
  for (const c of lista) {
    const eq = equivalencias.get(binomio(c.scientificName) || '');
    const destino = eq ? eq.nombreEnElCatalogo : c.scientificName;
    if (eq && destino !== c.scientificName) {
      renombradas.push({ de: c.scientificName, a: destino, verificadoCon: eq.verificadoCon });
    }
    const ya = porNombre.get(destino);
    if (!ya) {
      porNombre.set(destino, destino === c.scientificName ? c : {
        ...c,
        scientificName: destino,
        // El nombre con el que GBIF sirve este taxón sigue siendo el hilo hacia el barrido, que está
        // indexado por él. Perderlo deja la ficha sin un solo enlace a hábitat (y en silencio).
        sinonimosFusionados: [...new Set([...(c.sinonimosFusionados || []), c.scientificName])],
      });
      continue;
    }
    // Los dos nombres estaban entre los candidatos: es el duplicado de verdad. Se funden como haría
    // `reconcilia()` con dos nombres del mismo taxonid.
    ya.gbifOccurrences += c.gbifOccurrences;
    ya.hics = new Set([...(ya.hics || []), ...(c.hics || [])]);
    ya.habitats = ya.hics.size;
    ya.sinonimosFusionados = [...new Set([
      ...(ya.sinonimosFusionados || []), ...(c.sinonimosFusionados || []), c.scientificName,
    ])].filter(n => n !== destino);
  }
  return {
    lista: [...porNombre.values()].sort((a, b) => b.gbifOccurrences - a.gbifOccurrences),
    renombradas,
  };
}

// --- Reutilización: ¿esta especie ya está fichada en otro espacio? ----------------------------------
// Es la decisión (c) del §0 del rollout: una Aquila fasciata de Murcia y una de Cádiz son la misma
// ficha. Saber de antemano cuántas se reutilizan es lo que dice si el catálogo nacional está
// funcionando o si cada espacio se está escribiendo su propio catálogo en paralelo.
function yaFichadas() {
  const porNombre = new Map();
  // El mismo índice por `eidosTaxonId`, que es la clave maestra del modelo: es lo que permite
  // reconocer que el candidato *Petrosedum sediforme* y la ficha *Sedum sediforme* de Cuatro Calas
  // son la misma especie, cosa que comparar nombres no dice.
  const porTaxonId = new Map();
  for (const p of parkFiles()) {
    if (p.slug === PARK) continue;
    for (const s of (readJson(p.file).species || [])) {
      if (!s.scientificName) continue;
      if (!porNombre.has(s.scientificName)) porNombre.set(s.scientificName, p.slug);
      const id = s.eidosTaxonId != null ? String(s.eidosTaxonId) : null;
      if (id && !porTaxonId.has(id)) porTaxonId.set(id, { scientificName: s.scientificName, slug: p.slug });
    }
  }
  return { porNombre, porTaxonId };
}

// --- Atlas: especies características de los HIC de ESTE espacio -------------------------------------
// Se cruza contra los candidatos de GBIF, no contra el park.json: en un espacio que todavía no tiene
// Capa 3 el catálogo está vacío, y cruzarlo con él daría cero.
function caracteristicasPorEspecie(codigos) {
  if (!RUTA_ATLAS) return { mapa: new Map(), leido: false };
  if (!fs.existsSync(RUTA_ATLAS)) die(`No existe el texto del Atlas: ${RUTA_ATLAS}`);
  const { porHic, bloques, bloquesConEspecies } = especiesCaracteristicas(RUTA_ATLAS, codigos);
  if (bloques && !bloquesConEspecies) {
    die(`El Atlas tiene ${bloques} bloques de «Especies características» y no se ha leído ninguna ` +
        'especie. Revisa la extracción del PDF antes de seguir.');
  }
  const mapa = new Map();
  for (const [codigo, especies] of porHic) {
    for (const nombre of especies) {
      const b = binomio(nombre);
      if (!b) continue;
      if (!mapa.has(b)) mapa.set(b, []);
      mapa.get(b).push(codigo);
    }
  }
  return { mapa, leido: true, bloques };
}

// --- Anexo normativo del espacio ---------------------------------------------------------------------
/*
 * La lista de especies que la norma de declaración o gestión del espacio enumera por escrito. Es la
 * evidencia más fuerte de las cuatro y la única que afirma la pertenencia AL ESPACIO en vez de a un
 * polígono o a un tipo de hábitat.
 *
 * Se indexa por BINOMIO, no por el nombre completo: las normas escriben *Tetrax tetrax* (Linnaeus,
 * 1758), *Quercus ilex* subsp. *ballota* y variantes con autoría, y compararlas con el nombre que
 * sirve GBIF a pelo daría cero coincidencias sin que nadie se enterase.
 */
function anexoNormativo() {
  if (!fs.existsSync(RUTA_ANEXOS)) return { mapa: new Map(), noNativas: new Map(), fuente: null, consultado: false };
  const doc = readJson(RUTA_ANEXOS);
  const entrada = (doc.espacios || {})[PARK];
  if (!entrada) return { mapa: new Map(), noNativas: new Map(), fuente: null, consultado: false };
  const mapa = new Map();
  for (const e of entrada.especies || []) {
    const b = binomio(e.scientificName);
    if (!b) continue;
    mapa.set(b, e);
    // El `scientificName` se transcribe TAL CUAL lo escribe la norma —erratas incluidas—, que es lo
    // que manda el `_esquema` del fichero. Pero el cruce con GBIF se hace por nombre, así que con
    // sólo esa clave una errata de imprenta («Taradia teniotis», «Anthillis cytisoides») deja a la
    // especie sin el respaldo documental que la norma sí le da, y lo hace EN SILENCIO: la especie
    // cae al filtro de presencia como si ninguna norma la nombrara. `nombreCorregido` es la clave
    // adicional —el nombre aceptado, verificado contra GBIF— que repara el cruce sin tocar la
    // transcripción. Vale igual para los nombres en desuso («Saxicola torquata» → S. rubicola).
    const c = binomio(e.nombreCorregido);
    if (c && c !== b && !mapa.has(c)) mapa.set(c, e);
  }
  // Las que la norma enumera como ALÓCTONAS. No van en `especies` —no son parte del catálogo del
  // espacio— pero tampoco se pueden callar: son la única fuente oficial que dice que ese taxón está
  // aquí y que no es de aquí.
  const noNativas = new Map();
  for (const e of entrada.noNativas || []) {
    const b = binomio(e.scientificName);
    if (b) noNativas.set(b, e);
    const c = binomio(e.nombreCorregido);
    if (c && c !== b) noNativas.set(c, e);
  }
  return {
    mapa,
    noNativas,
    fuente: entrada.fuente || null,
    consultado: true,
    total: (entrada.especies || []).length,
  };
}

/*
 * La lista oficial de especies de los sitios Red Natura 2000 con los que solapa el espacio: las
 * secciones 3.2 y 3.3 del Formulario Normalizado de Datos, tal como las sirve el IEPNB.
 *
 * Es, junto al anexo normativo, la única fuente que afirma la pertenencia a ESTE sitio, y la única
 * que existe para casi todas las aves: los planes de gestión que traen inventario faunístico son la
 * excepción, no la regla. Se indexa por BINOMIO por el mismo motivo que el anexo —el formulario
 * escribe subespecies trinomiales («Phalacrocorax aristotelis aristotelis»), autorías y salvedades
 * entre paréntesis («Falco peregrinus ([including pelegrinoides])»)— y ese es el trabajo que ya hace
 * `especies-sitio-rn2000.js` al volcar el fichero.
 *
 * Tres estados, y hay que distinguirlos: no consultado (nadie ha lanzado la herramienta), consultado
 * y sin sitios (el espacio no está en Red Natura 2000: dato oficial), y consultado con lista.
 */
function listaOficialDelSitio() {
  if (!fs.existsSync(RUTA_SITIO)) return { mapa: new Map(), consultado: false, sitios: [], total: 0 };
  const doc = readJson(RUTA_SITIO);
  const mapa = new Map();
  for (const e of doc.especies || []) {
    if (!e.binomio) continue;
    if (!mapa.has(e.binomio)) mapa.set(e.binomio, []);
    mapa.get(e.binomio).push(e);
  }
  return {
    mapa,
    consultado: true,
    sitios: doc.sitios || [],
    total: (doc.especies || []).length,
    generado: doc.generado || null,
    fuente: doc.fuente || null,
  };
}

// --- EIDOS: autoctonía y estado legal ---------------------------------------------------------------
const cache = fs.existsSync(CACHE) ? readJson(CACHE) : {};

/**
 * Resuelve una especie contra EIDOS: origen (Lista Patrón) y normas vigentes.
 * Un fallo de red NO se traga: la especie queda marcada `error` y sale en el informe, porque
 * tratarla como «sin normas» la degradaría al filtro de presencia sin que nadie se enterara.
 */
async function resuelve(nombre, ccaa) {
  // La pausa va aquí y no en el llamante: solo hay que ser cortés con el IEPNB cuando de verdad se
  // sale a la red. Con la caché caliente, repetir la selección es instantáneo.
  //
  // Pero una caché escrita por una versión anterior tiene la FORMA anterior, y servirla tal cual es
  // un fallo en verde de manual: cuando se añadió `grupoEidos`, las entradas viejas lo devolvían
  // `undefined` y el filtro de alcance volvía a abrirse solo para los candidatos documentales, que
  // son justo los que ese campo venía a juzgar. Así que una entrada a la que le falte una clave que
  // el código de hoy lee se considera caducada y se vuelve a pedir.
  const enCache = cache[nombre];
  if (enCache && 'grupoEidos' in enCache) return enCache;
  await sleep(eidos.THROTTLE_MS);
  const r = {
    origen: null, normasRaw: [], nombreAceptadoEidos: null, taxonid: null, error: null,
    grupoEidos: null,
  };
  try {
    const t = await eidos.resolveTaxon(nombre);
    if (t.status !== 'no-encontrada') {
      r.taxonid = t.taxonid;
      r.origen = (t.taxon && t.taxon.origen) || null;
      // El grupo taxonómico de EIDOS es el ÚNICO dato de alcance que tiene un candidato que entra
      // solo por la legislación: sin registro en GBIF no hay `class`. Ver `fueraDelAlcance`.
      r.grupoEidos = (t.taxon && t.taxon.taxonomicgroup) || null;
      if (t.status === 'sinonimo' && t.acceptedName) r.nombreAceptadoEidos = t.acceptedName;
    }
    if (r.taxonid) {
      await sleep(eidos.THROTTLE_MS);
      const legal = await eidos.legalStatus(r.taxonid, ccaa);
      // Se cachea la verdad CRUDA —todas las filas vigentes— y se decide después cuáles cuentan como
      // protección. Si se filtrase aquí, ajustar el criterio obligaría a repetir las 1.300 peticiones.
      r.normasRaw = [
        ...legal.nacional.map(f => ({ ambito: 'España', norma: f.norma, categoria: f.estadolegal })),
        ...legal.autonomico.map(f => ({ ambito: ccaa, norma: f.norma, categoria: f.estadolegal })),
      ];
    }
  } catch (e) {
    r.error = e.message;
  }
  cache[nombre] = r;
  return r;
}

/*
 * Qué figura legal cuenta como RESPALDO para conservar la plaza con pocos registros.
 *
 * No vale «aparecer en cualquier norma»: EIDOS devuelve, junto a las figuras de protección, listas
 * que no protegen a nadie. Dos que salieron en este espacio y que hay que dejar fuera:
 *
 *   · CEEEI (RD 630/2013 y RD 216/2019) — el catálogo de especies exóticas INVASORAS. Es lo
 *     contrario de un respaldo, y por eso la selección de Carrascoy ya lo excluía explícitamente.
 *   · RD 159/2022, Anexo I — la lista de especies forestales para conservación de recursos
 *     genéticos. Incluye a *Pinus halepensis*, que no es una especie protegida: es madera.
 *
 * La lista blanca son las figuras que sí lo son, en las dos escalas: el Listado y el Catálogo
 * estatales (LESRPE/CEEA, RD 139/2011) y las categorías de los catálogos autonómicos.
 */
const CATEGORIAS_PROTECCION = [
  /^LESRPE\b/i,                        // Listado de Especies Silvestres en Régimen de Protección Especial
  /^CEEA\b/i,                          // Catálogo Español de Especies Amenazadas
  /en\s+peligro\s+de\s+extinci[óo]n/i,
  /^vulnerable$/i,
  /sensible\s+a\s+la\s+alteraci[óo]n/i,
  /(especies?\s+)?de\s+inter[ée]s\s+especial/i,
  /^extinguid[ao]s?$/i,
];
const esProteccion = (categoria) => CATEGORIAS_PROTECCION.some(re => re.test(String(categoria || '').trim()));

// Cuando el nombre del catálogo es un sinónimo, la autoctonía la decide el nombre ACEPTADO: es el
// caso de las cuatro de Carrascoy (Rosmarinus officinalis, Bupleurum gibraltarium…), que EIDOS solo
// reconoce por su nombre aceptado y que sin esto se habrían quedado sin `origen`.
function origenLegible(r) {
  if (!r.origen) return null;
  return r.nombreAceptadoEidos
    ? `${r.origen} (verificado por el nombre aceptado: ${r.nombreAceptadoEidos})`
    : r.origen;
}

const esNoNativa = (origen) => /no nativa|alóctona|exótica|introducida/i.test(String(origen || ''));

/*
 * NATIVA PORQUE EL HÁBITAT SE LLAMA COMO ELLA.
 *
 * La Lista Patrón marca la autoctonía **a escala nacional**, y esa escala tiene un punto ciego
 * simétrico al de `alóctonaPorNorma`: un taxón introducido en casi toda España puede ser relicto
 * autóctono en un enclave, y el filtro no lo distingue porque solo lee una bandera del Estado.
 *
 * El caso que lo destapa es *Tetraclinis articulata* en Calblanque. EIDOS responde
 * `origen: "Especie no nativa"` sin ningún matiz territorial, así que el filtro la tiraba — mientras
 * el Atlas cartografía dentro del parque 148,7 ha del HIC **9570 «Bosques de Tetraclinis
 * articulata»**, prioritario, cuyo nombre oficial ES el binomio. El resultado era un hábitat
 * prioritario sin la especie que le da nombre, que es un fallo visible en la ficha.
 *
 * La regla: si el espacio tiene cartografiado un HIC cuyo **nombre oficial** nombra al taxón, eso es
 * dato oficial directo sobre ESTE territorio —la Directiva lo protege AQUÍ, y la cartografía dice
 * dónde— y manda sobre la bandera nacional, igual que la norma del espacio manda cuando declara
 * alóctono a un taxón que la Lista Patrón no marca.
 *
 * Es deliberadamente estrecha: solo levanta el filtro de autoctonía, no da entrada por sí sola —la
 * especie sigue teniendo que pasar los niveles de fuente— y solo dispara donde la cartografía puso
 * el código. En el rollout de hoy eso es un único espacio: el 9570 no está cartografiado en ningún
 * otro, así que NO reabre el caso de Carrascoy y El Valle, donde la revisión del 2026-08-16
 * concluyó con el dato delante que sus ejemplares son repoblación.
 *
 * La comparación se hace por `binomio()` —la misma clave normalizada con la que se cruzan el Atlas y
 * el catálogo— sobre cada pareja de palabras consecutivas del nombre oficial. No se intenta adivinar
 * qué parejas son latín: las que no lo son («matorrales termomediterráneos») simplemente no casan
 * con ningún taxón, así que no hacen falta heurísticas que puedan equivocarse en los dos sentidos.
 * Un nombre que cita el género suelto —«Matorrales arborescentes de Ziziphus»— no identifica a una
 * especie y por construcción no casa.
 */
// Se rellena en main(), cuando ya se ha leído el park.json con su Capa 2.
let HABITAT_HOMONIMO = [];

function taxonesQueNombranUnHabitat(habitats) {
  return (habitats || []).map(h => {
    const palabras = String(h.name || '').trim().split(/\s+/);
    const pares = new Set();
    for (let i = 0; i + 1 < palabras.length; i++) {
      const b = binomio(`${palabras[i]} ${palabras[i + 1]}`);
      if (b) pares.add(b);
    }
    return { code: h.code, nombre: h.name || '', pares };
  });
}

/** El hábitat cartografiado cuyo nombre oficial nombra a este taxón, o null. */
function habitatQueNombra(bin) {
  if (!bin) return null;
  return HABITAT_HOMONIMO.find(h => h.pares.has(bin)) || null;
}

/*
 * RAREZA — el tramo 1–5 de `rarityScore`, derivado SOLO de la categoría legal estatal.
 *
 * Hasta hoy `rarityScore` era «criterio propio 1–5» (Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md):
 * un número puesto a mano, ficha a ficha, que nadie podía recalcular ni discutir. Y no es
 * decorativo: ordena el catálogo, elige la especie diagnóstica de la portada de cada hábitat
 * (`habitat-images.js`) y es el umbral de las destacadas (>= 4).
 *
 * Se sustituye por una escalera de gravedad legal, que es dato oficial directo y reproducible:
 *
 *   5  En peligro de extinción · Extinguida (CEEA, RD 139/2011)
 *   4  Vulnerable · Sensible a la alteración de su hábitat (CEEA)
 *   3  De interés especial
 *   2  En régimen de protección especial (LESRPE), sin categoría de amenaza
 *   1  sin figura de protección estatal
 *
 * Solo el ámbito ESTATAL. El catálogo autonómico es territorial —la misma especie es Vulnerable en
 * una comunidad y no figura en la de al lado— y un campo universal no puede depender de dónde se
 * mire: eso ya vive en `murciaStatus`, que es local. Y se guarda al lado la norma que justifica el
 * tramo, para que la cifra no vuelva a ser un número sin procedencia.
 */
function tramo(normas, filtro) {
  let score = 1, basis = null;
  for (const n of normas || []) {
    if (!filtro(n)) continue;
    const cat = String(n.categoria || '').replace(/^(CEEA|LESRPE):\s*/, '').trim();
    const valor = tramoDeCategoria(cat);
    if (valor > score) { score = valor; basis = { categoria: cat, norma: n.norma, ambito: n.ambito }; }
  }
  return { score, basis };
}

/*
 * Y por qué hay DOS tramos y no uno.
 *
 * La primera versión de esto usaba solo el ámbito estatal, que es el único que puede vivir en un
 * campo universal. Medido contra Sierra de la Pila, el resultado fue una escalera plana: de 243
 * aprobadas, 168 en el tramo 1, 74 en el 2 y **una sola** por encima de 3. Con el umbral de
 * destacadas en >= 4, el espacio pasaría de 18 destacadas a 1, y `habitat-images.js` elegiría la
 * portada de cada hábitat prácticamente al azar.
 *
 * El motivo está en el reparto real de figuras: el Estado casi solo dice «en régimen de protección
 * especial» (74 veces), y quien discrimina de verdad es el catálogo autonómico —25 de interés
 * especial, 8 vulnerables, 1 en peligro—. Es decir: la señal que hace falta existe y es igual de
 * oficial, pero es TERRITORIAL.
 *
 * Así que se calculan los dos y se guardan por separado, sin mezclarlos en un promedio que no
 * significaría nada:
 *
 *   · `rarityScore`  — solo estatal. Es el que puede ir al catálogo universal, porque no depende de
 *                      dónde se mire.
 *   · `rarityLocal`  — el más grave de los dos ámbitos. Es el que describe lo excepcional que es
 *                      encontrarla EN ESTE ESPACIO, y por eso es un campo local, como `murciaStatus`.
 *
 * Ninguno de los dos usa abundancia: los dos son categoría legal vigente, dato oficial directo.
 */
function rarezaLegal(normas) {
  const estatal = tramo(normas, n => n.ambito === 'España');
  const cualquiera = tramo(normas, () => true);
  return {
    rarityScore: estatal.score,
    rarityBasis: estatal.basis,
    rarityLocal: cualquiera.score,
    rarityLocalBasis: cualquiera.basis,
  };
}

// --- Programa ---------------------------------------------------------------------------------------

async function main() {
  const espacio = parkFiles().find(p => p.slug === PARK);
  if (!espacio) die(`No existe Frontend/Data/parks/**/${PARK}/park.json`);
  const park = readJson(espacio.file);
  const ccaa = arg('ccaa', park.park && park.park.region) || null;
  const codigosHic = [...new Set((park.habitats || []).map(h => h.code).filter(Boolean))];
  if (!codigosHic.length) die(`${PARK} no tiene Capa 2: genera antes los hábitats (habitats:adopt).`);
  HABITAT_HOMONIMO = taxonesQueNombranUnHabitat(park.habitats);

  const { porNombre: fichadas, porTaxonId } = yaFichadas();
  const atlas = caracteristicasPorEspecie(codigosHic);
  // El anexo y el formulario del sitio se cargan ANTES que los candidatos: desde que la legislación
  // es la puerta, lo que enumeran es parte del universo de candidatos y no solo una señal que se
  // consulta después.
  const anexo = anexoNormativo();
  const sitio = listaOficialDelSitio();
  const deGbif = candidatos();
  const documentales = candidatosDocumentales(anexo, sitio, new Set(deGbif.map(c => c.scientificName)));
  const brutos = [...deGbif, ...documentales];

  console.log(`Espacio: ${park.park.name} (${PARK}) · ${codigosHic.length} códigos HIC · catálogo regional: ${ccaa}`);
  console.log(`Candidatos de GBIF ∩ polígonos: ${deGbif.length}`);
  console.log(`Candidatos que solo aporta la legislación (nivel 1, sin registro en GBIF): ${documentales.length}`);
  console.log(atlas.leido
    ? `Atlas 2005: ${atlas.mapa.size} especies características para estos HIC`
    : 'Atlas 2005: NO consultado (sin --atlas) — no habrá evidencia `caracteristica`');
  console.log(anexo.consultado
    ? `Anexo normativo: ${anexo.total} especies enumeradas (${anexo.fuente ? anexo.fuente.norma : 'sin cita'})`
    : `Anexo normativo: NO consultado — ${PARK} no tiene entrada en ${rel(RUTA_ANEXOS)}.\n` +
      '  No es lo mismo que «este espacio no tiene anexo»: es que nadie lo ha leído todavía.');
  // Los tres estados de la lista oficial, dichos por su nombre. «No consultada» y «el espacio no
  // está en Red Natura 2000» tienen la misma pinta en el resultado —ninguna ave con respaldo de
  // sitio— y consecuencias opuestas: la primera se arregla lanzando una herramienta.
  if (!sitio.consultado) {
    console.log(`Lista oficial del sitio: NO consultada — no existe ${rel(RUTA_SITIO)}.\n` +
      `  Genérala antes: npm run sitio:especies -- --park ${PARK}\n` +
      '  Sin ella, ningún ave tiene respaldo de sitio y el filtro 3 bis las excluye todas.');
  } else if (!sitio.sitios.length) {
    console.log('Lista oficial del sitio: este espacio NO solapa con ningún sitio Red Natura 2000.\n' +
      '  Es dato oficial, no un hueco: el respaldo posible de sus aves es el anexo normativo.');
  } else {
    const avesOficiales = [...sitio.mapa.values()].flat().filter(e => e.grupoCodigo === 'B').length;
    console.log(`Lista oficial del sitio: ${sitio.total} entradas (${avesOficiales} aves) en ` +
      `${sitio.sitios.map(s => s.code).join(', ')} · formulario de ${sitio.sitios[0].año || 'año sin declarar'}`);
  }
  // De dónde sale el umbral se dice SIEMPRE, aunque sea el general: es la decisión que más cambia el
  // tamaño del catálogo y la que dos veces se ha perdido por no estar a la vista.
  console.log(EXCLUSIONES.size
    ? `Exclusiones curadas de este espacio: ${EXCLUSIONES.size} (data/exclusiones-especies.json) — ${[...EXCLUSIONES.keys()].join(', ')}`
    : 'Exclusiones curadas de este espacio: ninguna');
  console.log(`Umbral de presencia: ${MIN_OCURRENCIAS} ocurrencia(s) en ${MIN_HABITATS} hábitat(s) · ` +
    (arg('min-occ') || arg('min-habitats')
      ? 'dado en la línea de órdenes (manda sobre el fichero de umbrales)'
      : UMBRALES.motivo
        ? `propio de este espacio (data/umbrales-seleccion.json, ${UMBRALES.decidido || 'sin fecha'}): ${UMBRALES.motivo}`
        : 'el general del rollout'));

  // Resolver TODOS contra EIDOS antes de nada: la reconciliación necesita el `taxonid` de cada uno.
  console.log('\nResolviendo contra EIDOS (Lista Patrón y estado legal)…');
  const resueltas = new Map();
  let vistos = 0;
  for (const c of brutos) {
    if (++vistos % 50 === 0) process.stderr.write(`  … ${vistos}/${brutos.length}\n`);
    resueltas.set(c.scientificName, await resuelve(c.scientificName, ccaa));
  }
  writeJson(CACHE, cache);

  /*
   * El PUENTE de nomenclatura entre las fuentes de respaldo y el catálogo.
   *
   * Hasta aquí, el anexo y el formulario del sitio se cruzaban por el binomio del nombre que escribe
   * el documento, más el nombre aceptado DEL CANDIDATO. Faltaba la dirección que importa: resolver el
   * nombre de LA FUENTE. El formulario de un sitio revisado en 2023 sigue citando *Sylvia undata* y
   * *Larus ridibundus*; el catálogo ficha *Curruca undata* y *Chroicocephalus ridibundus*. Sin
   * resolver el lado de la fuente, esas aves salían con «no figura en el formulario oficial del
   * sitio» escrito al lado — que es una afirmación falsa, y la puerta de las aves se apoya en ella.
   *
   * Sale caro una vez y nada las siguientes: son ~80 nombres por espacio y van a la misma caché.
   */
  const equivalencias = respaldoSitio.cargaEquivalencias();
  const nombresDeFuente = [
    ...[...sitio.mapa.values()].flat().map(e => e.scientificName),
    ...[...anexo.mapa.values()].map(e => e.scientificName),
  ].filter((n, i, a) => n && a.indexOf(n) === i);
  if (nombresDeFuente.length) {
    console.log(`\nResolviendo ${nombresDeFuente.length} nombres de las fuentes de respaldo contra EIDOS…`);
    for (const nombre of nombresDeFuente) {
      if (!resueltas.has(nombre)) resueltas.set(nombre, await resuelve(nombre, ccaa));
    }
    /*
     * `respaldo-sitio.js` lee el nombre aceptado en `acceptedName` —es su contrato, y es lo que le
     * pasa `poda-aves-sin-respaldo.js`—, pero el `resuelve()` de aquí lo guarda en
     * `nombreAceptadoEidos`. Pasarle las entradas tal cual dejaba `r.acceptedName` en `undefined`
     * SIEMPRE, así que la capa 2 del puente —la que resuelve el nombre de LA FUENTE, que es la razón
     * de ser de todo esto— no tendía ni un puente y nadie se enteraba: los únicos que salían por
     * pantalla eran los de la tabla de equivalencias, y el informe decía «puentes tendidos: 2» tan
     * tranquilo. El coste se ve en Cabezo Gordo: el anexo enumera «Bufo calamita» y GBIF sirve
     * «Epidalea calamita», así que el sapo corredor quedaba excluido con «ninguna fuente documental
     * la respalda» escrito al lado, que es falso — la norma del espacio lo enumera. Igual con
     * «Apus melba» → Tachymarptis y «Sylvia melanocephala» → Curruca.
     */
    const paraElPuente = new Map(
      [...resueltas].map(([n, r]) => [n, { ...r, acceptedName: r.acceptedName || r.nombreAceptadoEidos || null }]),
    );
    const idxSitio = respaldoSitio.indexa([...new Set([...sitio.mapa.values()].flat())], {
      nombreDe: e => e.scientificName, resueltas: paraElPuente, equivalencias: equivalencias.mapa,
    });
    const idxAnexo = respaldoSitio.indexa([...new Set([...anexo.mapa.values()])], {
      nombreDe: e => e.scientificName, resueltas: paraElPuente, equivalencias: equivalencias.mapa,
    });
    // Las claves nuevas se AÑADEN a los índices que ya había: el `nombreCorregido` del anexo y el
    // binomio verbatim siguen valiendo, y aquí solo se amplía por dónde se puede casar.
    for (const [k, v] of idxSitio.mapa) if (!sitio.mapa.has(k)) sitio.mapa.set(k, v);
    for (const [k, v] of idxAnexo.mapa) if (!anexo.mapa.has(k)) anexo.mapa.set(k, v.length ? v[0] : v);
    const puentes = [...idxSitio.puentes, ...idxAnexo.puentes]
      .filter((p, i, a) => a.findIndex(x => x.nombre === p.nombre && x.clave === p.clave) === i);
    if (puentes.length) {
      console.log(`Puentes de nomenclatura tendidos: ${puentes.length}`);
      for (const p of puentes) console.log(`   ${p.nombre}  →  ${p.clave}  (${p.via})`);
    }
  }

  let { lista, fusiones } = reconcilia(brutos, resueltas, porTaxonId);
  const nominales = fundeSubespeciesNominales(lista);
  lista = nominales.lista;
  if (nominales.fundidas.length) {
    console.log(`\nSubespecies nominales fundidas en su especie: ${nominales.fundidas.length}`);
    for (const f of nominales.fundidas) console.log(`   ${f.trinomio}  →  ${f.binomio}`);
  }
  const equiv = aplicaEquivalencias(lista, equivalencias.mapa);
  lista = equiv.lista;
  if (equiv.renombradas.length) {
    console.log(`\nEquivalencias de nomenclatura aplicadas: ${equiv.renombradas.length}`);
    for (const r of equiv.renombradas) console.log(`   ${r.de}  →  ${r.a}`);
  }
  if (fusiones.length) {
    console.log(`\nReconciliación taxonómica: ${fusiones.length} grupo(s) con más de un nombre para el mismo taxón`);
    for (const f of fusiones) {
      const de = f.fusionados ? f.fusionados.join(', ') : f.renombradaDe;
      console.log(`   taxonid ${String(f.taxonid).padEnd(7)} ${f.elegido}  ←  ${de}`);
    }
    console.log(`Candidatos tras reconciliar: ${lista.length}`);
  }

  const aprobadas = [], excluidas = [];
  // Taxones a los que la cartografía del espacio les ha levantado la bandera nacional de autoctonía.
  // Se acumulan para decirlo por pantalla: una excepción que no se ve es una excepción que nadie
  // revisa.
  const autoctoniaRevisada = [];
  // Las categorías legales que se han visto y NO cuentan como protección. Se enseñan al final: es la
  // forma de enterarse de que una figura nueva se está descartando por no estar en la lista blanca.
  const categoriasDescartadas = new Map();
  // Qué ENTRADAS del anexo ha casado GBIF. Lo que quede sin casar es el hueco anexo↔GBIF: la norma
  // dice que la especie está aquí y el barrido no la ha encontrado dentro de ningún polígono.
  // Se guarda la entrada y no su clave porque una misma especie puede estar indexada por dos
  // nombres —el verbatim de la norma y su `nombreCorregido`—, y contar claves la duplicaría.
  const anexoCasado = new Set();
  // Lo mismo para la lista oficial del sitio: qué entradas ha confirmado GBIF. Lo que quede sin
  // casar es el hueco lista↔GBIF, que para las aves es el más informativo de los dos: el formulario
  // oficial dice que el ave está en el sitio y el barrido no la ha visto dentro de ningún polígono.
  const sitioCasado = new Set();
  for (const c of lista) {
    // Tras reconciliar, un candidato puede llevar el nombre de la ficha ya existente en otro espacio
    // y no el que se preguntó a EIDOS: se busca por los dos.
    const r = resueltas.get(c.scientificName)
      || resueltas.get((c.sinonimosFusionados || [])[0])
      || await resuelve(c.scientificName, ccaa);

    const caract = atlas.mapa.get(binomio(c.scientificName) || '') || [];
    const normas = (r.normasRaw || []).filter(x => esProteccion(x.categoria));
    for (const x of (r.normasRaw || [])) {
      if (!esProteccion(x.categoria)) {
        categoriasDescartadas.set(x.categoria, (categoriasDescartadas.get(x.categoria) || 0) + 1);
      }
    }
    // El anexo se busca por binomio y también por el nombre aceptado: las normas antiguas citan con
    // nomenclatura de su época (*Sylvia undata*, *Rosmarinus officinalis*) y GBIF sirve la actual.
    const bin = binomio(c.scientificName) || '';
    const binAcept = binomio(r.nombreAceptadoEidos || '') || '';
    const enAnexo = anexo.mapa.get(bin) || (binAcept && anexo.mapa.get(binAcept)) || null;
    /*
     * «Casada» quiere decir CONFIRMADA POR GBIF, y por eso exige ocurrencias. Casarla a secas
     * contaba también a los candidatos DOCUMENTALES —los que entran por la norma con cero
     * ocurrencias, que son justo los que había que contrastar en campo—, así que cada entrada del
     * anexo se confirmaba a sí misma: Cabezo Gordo salía con «54/54 confirmadas por GBIF» y
     * `anexo_sin_constancia` vacío teniendo 31 fichas sin un solo registro dentro de un polígono.
     * El hueco existe para que se vea y para que le ponga su `reviewNote` a la ficha; vaciarlo en
     * silencio es afirmar una observación que no existe.
     */
    if (enAnexo && c.gbifOccurrences > 0) anexoCasado.add(enAnexo);
    // La lista oficial se cruza por los mismos dos nombres que el anexo: el formulario de 2023 sigue
    // citando *Sylvia* donde GBIF ya sirve *Curruca*, y buscar solo por uno deja al ave sin el
    // respaldo que su propio sitio le da — en silencio, que es lo que no puede pasar.
    const enSitio = sitio.mapa.get(bin) || (binAcept && sitio.mapa.get(binAcept)) || null;
    if (enSitio && c.gbifOccurrences > 0) for (const e of enSitio) sitioCasado.add(e.scientificName);

    // `observada_gbif` solo si GBIF la ha visto de verdad. Un candidato que aporta la legislación y
    // el barrido no confirma entra con cero ocurrencias, y ponerle esa evidencia sería afirmar una
    // observación que no existe.
    const evidence = c.gbifOccurrences > 0 ? ['observada_gbif'] : [];
    if (caract.length) evidence.push('caracteristica');
    if (normas.length) evidence.push('protegida');
    if (enAnexo) evidence.push('anexo_normativo');
    if (enSitio) evidence.push('lista_oficial_sitio');

    const { rarityScore, rarityBasis, rarityLocal, rarityLocalBasis } = rarezaLegal(normas);

    const ficha = {
      scientificName: c.scientificName,
      class: c.class,
      gbifOccurrences: c.gbifOccurrences,
      habitats: c.habitats,
      evidence,
      yaFichadaEn: fichadas.get(c.scientificName) || null,
      normas,
      rarityScore,
      rarityBasis,
      rarityLocal,
      rarityLocalBasis,
      origen: origenLegible(r),
    };
    if (enSitio) {
      // Se guardan TODAS las entradas: una misma ave puede figurar en el formulario de la ZEPA y en
      // el del LIC del mismo espacio, y son dos afirmaciones oficiales distintas, no una repetida.
      // `tipoPoblacion` (permanente / reproductora / invernante / en concentración) es además lo que
      // permite que la estacionalidad de la ficha deje de ser un texto genérico.
      ficha.listaOficialSitio = enSitio.map(e => ({
        citadaComo: e.scientificName,
        siteCode: e.siteCode,
        siteName: e.siteName,
        seccion: e.seccion,
        tipoPoblacion: e.tipoPoblacion,
        categoriaPoblacion: e.categoriaPoblacion,
      }));
    }
    if (enAnexo) {
      ficha.anexoNormativo = {
        citadaComo: enAnexo.scientificName,
        categoria: enAnexo.categoria || null,
        // La salvedad de la entrada —«errata de la tabla», «nomenclatura en desuso», ámbito
        // parcial—. Va aquí porque `build-species-n2.js` la escribe en el `source` de la ficha: sin
        // ella, un nombre mal impreso en la norma parece un error de NaturDex.
        nota: enAnexo.nota || null,
        fuente: anexo.fuente,
      };
    }
    if (r.nombreAceptadoEidos) ficha.nombreAceptadoEidos = r.nombreAceptadoEidos;
    if (r.taxonid) ficha.eidosTaxonId = r.taxonid;
    // Con qué otros nombres sirve GBIF este taxón: los que se han absorbido al fusionar y también el
    // que traía el candidato si se le ha cambiado el nombre. Sin esto pasan dos cosas, y la segunda
    // en silencio: alguien que compare la selección con el barrido ve desaparecer especies sin saber
    // por qué, y `build-species-n2.js` no encuentra el barrido —que está indexado por el nombre de
    // GBIF— y escribe la ficha sin un solo enlace a hábitat.
    if (c.sinonimosFusionados && c.sinonimosFusionados.length) {
      ficha.sinonimosFusionados = c.sinonimosFusionados;
    }
    if (r.error) ficha.errorEidos = r.error;

    /*
     * Filtro 0 — la CURACIÓN del espacio, que hasta ahora no sobrevivía a una regeneración.
     *
     * Los cuatro filtros de abajo son automáticos y se aplican igual en todas partes. Pero hay casos
     * que solo se pueden juzgar mirando ESTE espacio y ESTOS registros, y esos se decidían a mano
     * sobre el `park.json` y se contaban en el informe de cierre. Un informe no lo lee la
     * herramienta: la regeneración siguiente vuelve a aprobar lo que alguien ya había descartado, y
     * lo hace **sin decir nada**, porque para el código nunca pasó nada.
     *
     * Le ocurrió a *Caretta caretta* en Carrascoy y El Valle. Se excluyó el 2026-08-10 con el motivo
     * escrito —sus ocurrencias dentro de los polígonos son telemetría por satélite proyectada tierra
     * adentro, no presencia— y el barrido del 2026-08-16 la volvió a meter en una sierra de interior.
     *
     * Va PRIMERO a propósito: si el espacio ya ha decidido que un taxón no entra, no hace falta
     * discutir su autoctonía ni su número de registros. Y lo excluido sale en `excluidas_detalle`
     * con su motivo, igual que lo que descartan los filtros automáticos: esto retira especies, no
     * las esconde.
     */
    const curada = EXCLUSIONES.get(c.scientificName) || (binAcept && EXCLUSIONES.get(r.nombreAceptadoEidos)) || null;
    if (curada) {
      excluidas.push({ ...ficha, motivo: `excluida por decisión del espacio (${curada.decidido || 'sin fecha'}): ${curada.motivo}` });
      continue;
    }
    // Filtro 2 — autoctonía. Dos fuentes, y la segunda existe porque la primera tiene un punto ciego:
    // la Lista Patrón no marca como «no nativa» lo que ni siquiera es fauna silvestre. *Ovis aries*
    // —que en Monte Arabí es el muflón de Córcega introducido, y en cualquier sierra puede ser
    // ganado— pasaba el filtro con 2 registros y su ficha, mientras el propio plan de gestión la
    // enumera entre las alóctonas. Cuando la norma del espacio dice que un taxón es alóctono, eso es
    // dato oficial directo sobre ESTE territorio y manda sobre el silencio de la Lista Patrón.
    const alóctonaPorNorma = anexo.noNativas.get(bin) || (binAcept && anexo.noNativas.get(binAcept)) || null;
    // La cartografía oficial del espacio puede desmentir la bandera nacional de autoctonía: ver
    // `taxonesQueNombranUnHabitat`. Solo levanta este filtro; la especie sigue necesitando nivel.
    const nombraUnHabitat = habitatQueNombra(bin) || (binAcept ? habitatQueNombra(binAcept) : null);
    if (esNoNativa(r.origen)) {
      if (!nombraUnHabitat) {
        excluidas.push({ ...ficha, motivo: 'no nativa (Lista Patrón IEPNB)' });
        continue;
      }
      ficha.autoctoniaRevisada = `la Lista Patrón la da como no nativa, pero este espacio tiene ` +
        `cartografiado el HIC ${nombraUnHabitat.code} «${nombraUnHabitat.nombre}», cuyo nombre ` +
        `oficial la nombra: la cartografía es dato oficial sobre este territorio y manda`;
      autoctoniaRevisada.push(`${c.scientificName} (HIC ${nombraUnHabitat.code})`);
    }
    if (alóctonaPorNorma) {
      excluidas.push({
        ...ficha,
        motivo: `alóctona según la norma del espacio: ${alóctonaPorNorma.nota || alóctonaPorNorma.scientificName}`,
      });
      continue;
    }
    // Filtro 4 — alcance taxonómico del catálogo. Va antes que el de presencia porque no depende de
    // cuántas veces se haya visto: un microlepidóptero con mil registros sigue estando fuera.
    const motivoAlcance = fueraDelAlcance(c.class, r.grupoEidos);
    if (motivoAlcance) {
      excluidas.push({ ...ficha, motivo: motivoAlcance });
      continue;
    }
    // Filtro 3 bis — respaldo de SITIO para las aves. Va antes del de presencia porque para un ave
    // el de presencia no mide presencia: mide cuántas veces alguien subió a GBIF un vuelo sobre el
    // espacio. El porqué completo, arriba, en la cabecera de AVES_SIN_RESPALDO.
    const respaldoDeSitio = Boolean(enAnexo) || Boolean(enSitio);
    if (!AVES_SIN_RESPALDO && c.class === 'Aves' && !respaldoDeSitio) {
      excluidas.push({
        ...ficha,
        motivo: sitio.consultado
          ? 'ave sin respaldo de sitio (no figura en el formulario oficial del sitio ni en el anexo normativo)'
          : 'ave sin respaldo de sitio, y la lista oficial NO se ha consultado (falta el volcado de sitio:especies)',
      });
      continue;
    }
    /*
     * Filtro 3 — EL ORDEN DE PRIORIDAD DE LAS FUENTES. Ver la cabecera del fichero.
     *
     * Nivel 1 · legislación: entra sin exigirle nada a GBIF. Es el cambio del 2026-08-16: antes, lo
     * que la norma del espacio enumeraba y el barrido no confirmaba se quedaba fuera y salía como
     * `anexo_sin_constancia`. Un inventario oficial no lo desmiente la ausencia de avistamientos en
     * una base de ciencia ciudadana; a lo sumo dice que nadie lo ha subido.
     */
    ficha.nivelDeFuente = respaldoDeSitio ? 1 : (normas.length || caract.length ? 2 : 3);
    if (respaldoDeSitio) {
      /*
       * Con una excepción, y la destapó la primera pasada del criterio nuevo: un candidato que SOLO
       * aporta la fuente documental y que EIDOS **no sabe resolver** no entra.
       *
       * Sin `taxonid` no hay clave maestra, ni taxonomía, ni estado legal, ni forma de reutilizar la
       * ficha entre espacios — pero sobre todo: cuando EIDOS no resuelve un nombre transcrito de una
       * norma, casi siempre es porque el nombre está mal escrito en la norma o en la transcripción.
       * En Sierra de la Pila eran 42 de 261, y son de leer: «Lanius senador» (senator), «Croccidura
       * russula» (Crocidura), «Hemydactilus turcitus» (Hemidactylus turcicus), «Portetria dispar»
       * (Porthetria). Aprobarlos metería en el catálogo cuarenta fichas con el nombre científico mal
       * escrito, que es exactamente lo que la app no puede enseñar.
       *
       * No se corrige aquí: el `_esquema` de anexos-normativos.json manda transcribir tal cual y
       * reparar el cruce con `nombreCorregido`, que es un campo que alguien rellena con la norma
       * delante. Esta lista es la de los que están esperando ese campo, y sale con el motivo puesto.
       */
      if (c.soloDocumental && !r.taxonid) {
        excluidas.push({
          ...ficha,
          motivo: 'nivel 1 sin resolver en EIDOS: el nombre que transcribe la fuente no existe en la ' +
            'Lista Patrón. Suele ser una errata de la norma o de la transcripción; se repara añadiendo ' +
            '`nombreCorregido` a su entrada de data/anexos-normativos.json, no cambiando el verbatim',
        });
        continue;
      }
      aprobadas.push(ficha);
      continue;
    }

    /*
     * Nivel 2 · EIDOS y Atlas: dicen qué es el taxón y de qué hábitat es propio, no que esté aquí.
     * Se les exige que GBIF los corrobore dentro de los polígonos — al menos un registro—, pero NO
     * el umbral de presencia considerable: su plaza la sostiene la figura legal o el Atlas, no el
     * número de avistamientos, y exigirles el umbral dejaría fuera justo a las raras.
     */
    if (ficha.nivelDeFuente === 2) {
      if (c.gbifOccurrences < 1) {
        excluidas.push({
          ...ficha,
          motivo: 'nivel 2 (figura legal o Atlas) sin corroborar: GBIF no la sitúa dentro de ningún ' +
            'polígono de hábitat del espacio',
        });
        continue;
      }
      aprobadas.push(ficha);
      continue;
    }

    /*
     * Nivel 3 · solo GBIF. NO entra: es la regla que quita los ornamentales y lo que pasaba por
     * allí. `--gbif-sin-respaldo` la levanta, y entonces vuelve a mandar el umbral de presencia de
     * siempre, que es lo único que discriminaba antes.
     */
    if (!GBIF_SIN_RESPALDO) {
      excluidas.push({
        ...ficha,
        motivo: 'solo GBIF: ninguna fuente documental la respalda (ni la norma del espacio, ni el ' +
          'formulario del sitio, ni una figura legal, ni el Atlas de Hábitats)',
      });
      continue;
    }
    if (c.gbifOccurrences < MIN_OCURRENCIAS || c.habitats < MIN_HABITATS) {
      excluidas.push({
        ...ficha,
        motivo: `sólo GBIF y presencia escasa (<${MIN_OCURRENCIAS} occ o <${MIN_HABITATS} hábitats)`,
      });
      continue;
    }
    aprobadas.push(ficha);
  }

  writeJson(CACHE, cache);

  const aves = aprobadas.filter(e => e.class === 'Aves').length;
  const reutilizables = aprobadas.filter(e => e.yaFichadaEn).length;
  /*
   * El hueco anexo↔GBIF. Desde el 2026-08-16 estas especies **SÍ se aprueban** —son nivel 1— y esta
   * lista deja de ser «lo que se pierde» para ser otra cosa igual de útil: qué parte del inventario
   * oficial entra en el catálogo sin que ningún avistamiento la confirme.
   *
   * Sigue haciendo falta y por el mismo motivo de siempre: es lo que hay que contrastar en campo, y
   * lo que le pone su `reviewNote` a la ficha. Que la norma afirme que una especie está aquí es la
   * mejor fuente que hay, pero un inventario de 2004 puede haber envejecido y conviene que se vea.
   */
  const anexoSinConstancia = anexo.consultado
    ? [...new Set(anexo.mapa.values())]
        .filter(e => !anexoCasado.has(e))
        .map(e => ({ scientificName: e.scientificName, categoria: e.categoria || null, nota: e.nota || null }))
    : [];
  // El mismo hueco por el lado de la lista oficial, y con la misma lectura nueva: son las aves que
  // el formulario del sitio declara y entran en el catálogo sin que GBIF las haya visto dentro de
  // ningún polígono. Antes eran las que el catálogo NO podía fichar.
  const sitioSinConstancia = sitio.consultado
    ? [...new Set([...sitio.mapa.values()].flat())]
        .filter(e => !sitioCasado.has(e.scientificName))
        .map(e => ({
          scientificName: e.scientificName, grupo: e.grupo, seccion: e.seccion,
          siteCode: e.siteCode, tipoPoblacion: e.tipoPoblacion, categoriaPoblacion: e.categoriaPoblacion,
        }))
        .sort((a, b) => String(a.grupo).localeCompare(String(b.grupo)) ||
                        String(a.scientificName).localeCompare(String(b.scientificName)))
    : [];
  const doc = {
    _nota:
      `Selección de especies para la Capa 3 de ${park.park.name}. NO es park.json: es la lista aprobada y ` +
      'su procedencia. ORDEN DE PRIORIDAD DE LAS FUENTES: primero la LEGISLACIÓN, después EIDOS, y GBIF ' +
      'solo para corroborar. Nivel 1 — el anexo normativo del espacio (PORN/PRUG/decreto de declaración, ' +
      'evidencia `anexo_normativo`) y el Formulario Normalizado de Datos del sitio Red Natura 2000 ' +
      '(secciones 3.2 y 3.3, evidencia `lista_oficial_sitio`): son las únicas fuentes que afirman que la ' +
      'especie forma parte de ESTE espacio y entran SIN exigirles constancia en GBIF. Nivel 2 — figura legal ' +
      'de EIDOS y especies características del HIC según el Atlas 2005 (`caracteristica`): dicen qué es el ' +
      'taxón, no que esté aquí, así que necesitan al menos una ocurrencia de GBIF dentro de los polígonos que ' +
      'lo corrobore. Nivel 3 — solo GBIF: NO ENTRA' +
      (GBIF_SIN_RESPALDO
        ? `, salvo que se levante con --gbif-sin-respaldo, que es lo que se ha hecho aquí: entran con al menos ${MIN_OCURRENCIAS} ocurrencias en ${MIN_HABITATS} hábitats. `
        : '; un avistamiento suelto no distingue lo característico del olivo de un bancal abandonado. ') +
      'Autoctonía: se excluye todo lo que la Lista Patrón del IEPNB marca como «Especie no nativa». Se excluye ' +
      'el CEEEI (RD 630/2013): es el catálogo de especies exóticas INVASORAS, no una figura de protección, y ' +
      'tampoco cuentan los anexos forestales (RD 159/2022, RD 289/2003) ni el anexo de explotación de la ' +
      'Ley 42/2007. ' +
      (TODAS_LAS_CLASES
        ? 'Sin filtro de clase: entran todos los grupos taxonómicos.'
        : 'Alcance taxonómico: flora vascular y vertebrados, que es lo que cataloga NaturDex — clases ' +
          `admitidas: ${[...CLASES].join(', ')}.`) + ' ' +
      'Lo que el nivel 1 enumera y GBIF no confirma se aprueba igual y queda listado en ' +
      '`anexo_sin_constancia` y `sitio_sin_constancia`: entra en el catálogo y hay que contrastarlo en campo. ' +
      (AVES_SIN_RESPALDO
        ? '(3 bis) DESACTIVADO con --aves-sin-respaldo: las aves entran por presencia, como una planta. '
        : '(3 bis) Las AVES no entran por el filtro de presencia —vuelan, sus ocurrencias caen dentro de ' +
          'cualquier polígono y por eso su ficha se escribe sin `habitatIds`—: exigen respaldo de sitio ' +
          '(formulario oficial del sitio o anexo normativo), y GBIF queda como confirmación. ') +
      '`rarityScore` (1–5) se deriva únicamente de la categoría legal ESTATAL más grave, con ' +
      'la norma que la justifica en `rarityBasis`; no interviene ninguna señal de abundancia. ' +
      'Generada por Tools/catalogo-nacional/build-species-seleccion.js.',
    park: PARK,
    generado: hoy(),
    total: aprobadas.length,
    aves,
    reutilizables,
    nuevas: aprobadas.length - reutilizables,
    excluidas: excluidas.length,
    anexo: anexo.consultado
      ? { consultado: true, fuente: anexo.fuente, enumeradas: anexo.total, casadas: anexoCasado.size }
      : { consultado: false },
    lista_oficial_sitio: sitio.consultado
      ? {
          consultado: true, fuente: sitio.fuente, generado: sitio.generado,
          sitios: sitio.sitios.map(s => ({ code: s.code, name: s.name, figura: s.figura, año: s.año })),
          enumeradas: sitio.total, casadas: sitioCasado.size,
        }
      : { consultado: false },
    aves_puerta: AVES_SIN_RESPALDO ? 'presencia (--aves-sin-respaldo)' : 'respaldo de sitio',
    rareza: [5, 4, 3, 2, 1].reduce((a, n) => {
      a[n] = aprobadas.filter(e => e.rarityScore === n).length; return a;
    }, {}),
    rareza_local: [5, 4, 3, 2, 1].reduce((a, n) => {
      a[n] = aprobadas.filter(e => e.rarityLocal === n).length; return a;
    }, {}),
    especies: aprobadas,
    anexo_sin_constancia: anexoSinConstancia,
    sitio_sin_constancia: sitioSinConstancia,
    excluidas_detalle: excluidas,
  };

  if (autoctoniaRevisada.length) {
    console.log(`\nAutoctonía revisada por la cartografía: ${autoctoniaRevisada.length} — ` +
      `${autoctoniaRevisada.join(', ')}`);
    console.log('  La Lista Patrón las da como no nativas y el espacio tiene cartografiado un HIC');
    console.log('  cuyo nombre oficial las nombra. La cartografía es dato de ESTE territorio y manda.');
  }
  console.log(`\nAprobadas: ${doc.total} (${aves} aves) · reutilizables: ${reutilizables} · nuevas: ${doc.nuevas}`);
  console.log(`Excluidas: ${excluidas.length}`);
  const porMotivo = {};
  for (const e of excluidas) porMotivo[e.motivo] = (porMotivo[e.motivo] || 0) + 1;
  for (const [m, c] of Object.entries(porMotivo)) console.log(`   ${c}  ${m}`);
  console.log('\nRareza (tramo legal)      estatal   local (estatal+autonómico)');
  for (const n of [5, 4, 3, 2, 1]) {
    console.log(`   ${n}                   ${String(doc.rareza[n]).padStart(7)}   ${String(doc.rareza_local[n]).padStart(4)}`);
  }
  console.log(`   destacadas (>= 4)   ${String(doc.rareza[5] + doc.rareza[4]).padStart(7)}   ` +
              `${String(doc.rareza_local[5] + doc.rareza_local[4]).padStart(4)}`);
  if (sitio.consultado && sitio.sitios.length) {
    console.log(`\nLista oficial del sitio: ${sitioCasado.size}/${sitio.total} confirmadas por GBIF dentro de los polígonos.`);
    if (sitioSinConstancia.length) {
      console.log(`  ${sitioSinConstancia.length} del formulario oficial SIN constancia en GBIF: se aprueban igual`);
      console.log('  (nivel 1) y quedan en `sitio_sin_constancia` como lo que hay que contrastar en campo.');
    }
  }
  if (anexo.consultado) {
    console.log(`\nAnexo normativo: ${anexoCasado.size}/${anexo.total} confirmadas por GBIF dentro de los polígonos.`);
    if (anexoSinConstancia.length) {
      console.log(`  ${anexoSinConstancia.length} enumeradas por la norma SIN constancia en GBIF: se aprueban igual`);
      console.log('  (nivel 1) y quedan en `anexo_sin_constancia` como hueco a contrastar en campo (ver informe).');
    }
  }
  const conError = [...aprobadas, ...excluidas].filter(e => e.errorEidos);
  if (conError.length) console.log(`\n⚠ ${conError.length} especies con error de EIDOS (ver informe)`);
  if (categoriasDescartadas.size) {
    console.log('\nFiguras legales vistas que NO cuentan como protección:');
    for (const [cat, veces] of [...categoriasDescartadas].sort((a, b) => b[1] - a[1])) {
      console.log(`   ${String(veces).padStart(4)}  ${cat}`);
    }
  }

  if (DRY) { console.log('\nSimulación: no se ha escrito nada.'); return; }
  writeJson(RUTA_OUT, doc);
  fs.writeFileSync(RUTA_INFORME, informe(doc, atlas, conError, categoriasDescartadas), 'utf8');
  console.log(`\n→ ${rel(RUTA_OUT)}\n→ ${rel(RUTA_INFORME)}`);
}

function informe(doc, atlas, conError, categoriasDescartadas) {
  const l = [];
  l.push(`# ${doc.park} · selección de especies`, '');
  l.push(`Generada el ${doc.generado}. **${doc.total} aprobadas** (${doc.aves} aves), ` +
         `${doc.reutilizables} ya fichadas en otro espacio y ${doc.nuevas} nuevas. ` +
         `${doc.excluidas} excluidas.`, '');
  l.push(atlas.leido
    ? `Atlas 2005 consultado: ${atlas.mapa.size} especies características para los HIC de este espacio.`
    : '**Atlas 2005 NO consultado** (falta `--atlas`): ninguna especie tiene evidencia `caracteristica`, ' +
      'así que las de pocos registros solo conservan su plaza si están protegidas.', '');

  if (doc.anexo && doc.anexo.consultado) {
    const f = doc.anexo.fuente || {};
    l.push('', '## Anexo normativo del espacio', '',
      `Fuente: **${f.norma || 'sin cita'}**${f.anexo ? `, ${f.anexo}` : ''}` +
      `${f.boletin ? ` · ${f.boletin}` : ''}${f.consultado ? ` · consultado el ${f.consultado}` : ''}.`, '',
      `Enumera **${doc.anexo.enumeradas} especies**; GBIF confirma **${doc.anexo.casadas}** dentro de los ` +
      'polígonos de hábitat. Esas llevan evidencia `anexo_normativo` y conservan su plaza aunque tengan ' +
      'pocos registros.', '');
  } else {
    l.push('', '## Anexo normativo del espacio', '',
      '**NO consultado.** Este espacio no tiene entrada en `data/anexos-normativos.json`. No es que carezca ' +
      'de norma con anexo de especies: es que nadie la ha leído todavía, y hasta que se lea ninguna especie ' +
      'de este espacio tiene la evidencia más fuerte de las cuatro.', '');
  }

  const s = doc.lista_oficial_sitio || { consultado: false };
  l.push('', '## Lista oficial del sitio Red Natura 2000', '');
  if (!s.consultado) {
    l.push('**NO consultada.** Falta el volcado de `npm run sitio:especies -- --park ' + doc.park + '`. ' +
      'Sin ella ningún ave tiene respaldo de sitio, así que las aves de esta selección son las que ' +
      'salva el anexo normativo y ninguna más: la cifra de aves de este informe está por debajo de lo ' +
      'que el espacio tiene, y el motivo es que falta un paso, no que no haya aves.', '');
  } else if (!s.sitios.length) {
    l.push('Este espacio **no solapa con ningún sitio Red Natura 2000**. Es dato oficial, no un hueco: ' +
      'no existe formulario del que sacar una lista de especies, y el único respaldo posible de sus aves ' +
      'es el anexo normativo de su plan de gestión.', '');
  } else {
    l.push(`Fuente: **${s.fuente || 'IEPNB · Red Natura 2000'}**${s.generado ? ` · volcado del ${s.generado}` : ''}.`, '');
    l.push('| Sitio | Figura | Formulario |', '|---|---|---|');
    for (const x of s.sitios) l.push(`| ${x.code} ${x.name || ''} | ${x.figura || '—'} | ${x.año || '—'} |`);
    l.push('', `Enumeran **${s.enumeradas} entradas**; GBIF confirma **${s.casadas}** dentro de los ` +
      'polígonos de hábitat. Esas llevan evidencia `lista_oficial_sitio`, y en las aves es lo que las ' +
      'deja entrar: es la única fuente que afirma que el ave pertenece a ESTE sitio.', '');
  }

  if (doc.sitio_sin_constancia && doc.sitio_sin_constancia.length) {
    l.push('', '### En el formulario oficial y sin constancia en GBIF', '',
      'El sitio las declara y el barrido no las ha encontrado dentro de ningún polígono. **Se aprueban ' +
      'igual**: son nivel 1, y un formulario oficial no lo desmiente que nadie haya subido el ' +
      'avistamiento a GBIF. Se listan aquí porque son justo lo que hay que contrastar en campo, y lo ' +
      'que le pone su nota de revisión a la ficha.', '',
      '| Especie | Grupo | Sección | Sitio | Población |', '|---|---|---|---|---|');
    for (const e of doc.sitio_sin_constancia) {
      const pob = [e.tipoPoblacion, e.categoriaPoblacion].filter(Boolean).join(', ') || '—';
      l.push(`| *${e.scientificName}* | ${e.grupo || '—'} | ${e.seccion} | ${e.siteCode} | ${pob} |`);
    }
  }

  if (doc.anexo_sin_constancia && doc.anexo_sin_constancia.length) {
    l.push('', '### Enumeradas por la norma y sin constancia en GBIF', '',
      'La norma del espacio dice que están aquí; el barrido de GBIF no las ha encontrado dentro de ningún ' +
      'polígono de hábitat. **Se aprueban igual**: son nivel 1 y la norma es la fuente más fuerte que hay. ' +
      'Se listan aquí porque siguen siendo el hueco a contrastar en campo —un inventario de hace veinte años ' +
      'puede haber envejecido— y la lista más útil que produce esta herramienta para decidir dónde mirar.', '',
      '| Especie | Categoría en la norma | Nota |', '|---|---|---|');
    for (const e of doc.anexo_sin_constancia) {
      l.push(`| *${e.scientificName}* | ${e.categoria || '—'} | ${e.nota || '—'} |`);
    }
  }

  l.push('', '## Rareza', '',
    'Tramo 1–5 derivado **solo** de la categoría legal vigente; no interviene ninguna señal de abundancia. ' +
    '`rarityScore` usa únicamente el ámbito **estatal**, que es el que puede vivir en el catálogo universal. ' +
    '`rarityLocal` toma la categoría más grave de los dos ámbitos y es **local a este espacio**, porque el ' +
    'catálogo autonómico es territorial. Las de tramo ≥ 4 son las candidatas a destacadas: mírese la ' +
    'diferencia entre las dos columnas antes de elegir cuál gobierna las destacadas.', '',
    '| Tramo | Significado | Estatal | Local |', '|---:|---|---:|---:|');
  for (const n of [5, 4, 3, 2, 1]) {
    l.push(`| ${n} | ${SIGNIFICADO[n]} | ${doc.rareza[n]} | ${doc.rareza_local[n]} |`);
  }
  l.push(`| **≥ 4** | **candidatas a destacadas** | **${doc.rareza[5] + doc.rareza[4]}** | ` +
         `**${doc.rareza_local[5] + doc.rareza_local[4]}** |`);
  if (conError.length) {
    l.push('', '## Especies que EIDOS no pudo resolver', '',
      'No cuentan como «sin normas»: constan aquí para no dar por comprobado lo que no se comprobó.', '',
      '| Especie | Error |', '|---|---|');
    for (const e of conError) l.push(`| *${e.scientificName}* | ${e.errorEidos} |`);
  }
  if (categoriasDescartadas && categoriasDescartadas.size) {
    l.push('', '## Figuras legales que no cuentan como protección', '',
      'EIDOS devuelve, junto a las figuras de protección, listas que no protegen a nadie (el catálogo de ' +
      'invasoras, los anexos forestales). No dan evidencia `protegida`; se enumeran aquí para que se vea ' +
      'qué se ha descartado y con qué frecuencia.', '',
      '| Categoría | Veces |', '|---|---:|');
    for (const [cat, veces] of [...categoriasDescartadas].sort((a, b) => b[1] - a[1])) {
      l.push(`| ${cat} | ${veces} |`);
    }
  }
  l.push('', '## Aprobadas', '', '| Especie | Clase | Occ. | Háb. | Rareza | Evidencia | Ya fichada en |', '|---|---|---:|---:|---:|---|---|');
  for (const e of doc.especies) {
    l.push(`| *${e.scientificName}* | ${e.class || '—'} | ${e.gbifOccurrences} | ${e.habitats} | ` +
           `${e.rarityScore} | ${e.evidence.join(', ')} | ${e.yaFichadaEn || '—'} |`);
  }
  l.push('', '## Excluidas', '', '| Especie | Clase | Occ. | Háb. | Motivo |', '|---|---|---:|---:|---|');
  for (const e of doc.excluidas_detalle) {
    l.push(`| *${e.scientificName}* | ${e.class || '—'} | ${e.gbifOccurrences} | ${e.habitats} | ${e.motivo} |`);
  }
  return l.join('\n') + '\n';
}

main().catch(e => die(e.stack || e.message));
