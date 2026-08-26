'use strict';
/*
 * atlas.js — lectura del «Atlas y Manual de los Hábitats Naturales y Seminaturales de España»
 * (MITECO, 2005) como fuente de ESPECIES CARACTERÍSTICAS por código HIC.
 *
 * El problema que resuelve
 * -----------------------
 * El Atlas solo existe en PDF, y de un PDF se saca texto de formas distintas según la herramienta.
 * El parser vivía dentro de `atlas-hic-especies.js` dando por hecho **un** formato concreto: el de
 * `pdftotext -layout`, que deja el encabezado «Especies características» y su lista de especies en
 * la MISMA línea. Con cualquier otro extractor —pypdf, por ejemplo, que es lo que hay disponible
 * cuando poppler no está instalado— el encabezado queda solo en su línea y la lista cae debajo.
 *
 * El resultado de esa diferencia no era un error: eran **cero especies características, en silencio**.
 * Es exactamente el modo de fallo que `CLAUDE.md` §2 llama «fallar en verde», y aquí duele el doble
 * porque `caracteristica` es el backbone determinista de la Capa 3 —el respaldo que le conserva la
 * plaza a una especie con pocos registros en GBIF—: sin él, la selección de un espacio pierde
 * especies oficiales y nada lo avisa.
 *
 * Por eso este módulo lee **los dos formatos** y, sobre todo, **se queja cuando no encuentra nada**:
 * un Atlas del que no sale ni una especie es un problema de lectura, no un hábitat sin flora.
 *
 * A QUÉ CÓDIGO PERTENECE CADA BLOQUE — la trampa de la segunda pasada (2026-08-16)
 * --------------------------------------------------------------------------------
 * El cuerpo del Atlas NO está organizado por códigos de la Directiva: son fichas de unidades
 * fitosociológicas (alianzas), identificadas por códigos PROPIOS del Atlas de seis caracteres
 * (834030, 81B030, 12401A…) que encabezan cada ficha. El código HIC solo aparece en el cajetín
 * lateral «Directiva de Hábitat» de la página, y colgar el bloque de ese cajetín —que es lo que
 * hacía la primera versión— falla dos veces sin avisar:
 *
 *   · el cajetín enseña UNA sola correspondencia aunque la unidad tenga varias: la ficha de los
 *     encinares (834020/834030) también cubre el 5210 y el 9330, y el cajetín decía «5210», así
 *     que el 9340 se quedaba a cero mientras sus especies existían y estaban leídas;
 *   · la extracción sin layout coloca el cajetín donde cae —a veces DESPUÉS del bloque, a veces el
 *     de la página anterior—, con lo que la ventana de líneas unas veces no lo encuentra (bloque
 *     perdido) y otras encuentra el ajeno (bloque mal colgado).
 *
 * Con eso, de 344 bloques solo 98 daban especies, sesgadas hacia las unidades de correspondencia
 * única. La lectura buena junta las DOS voces con las que el propio Atlas afirma la correspondencia,
 * porque ninguna cubre a la otra:
 *
 *   · el **anexo de correspondencias** del final (HIC ↔ código de seis caracteres, ~1.400 filas),
 *     que es el único sitio donde una unidad enseña TODAS sus correspondencias — pero omite unidades
 *     que el cajetín sí reivindica: los espartales (522220) no tienen fila y su página dice «6220*»;
 *   · el **cajetín de la página**, ligado a su página por los marcadores de paginación (número +
 *     título corriente) y no por cercanía en líneas, que es lo que lo hacía mentir.
 *
 * Este módulo recoge los códigos de seis caracteres que encabezan la ficha de cada bloque, los pasa
 * por el anexo, une los HIC del cajetín de esa página, y asigna las especies a todos ellos. El
 * barrido por cercanía queda solo para extracciones sin marcadores de página (el formato -layout).
 *
 * Vive en `lib/` porque lo necesitan dos herramientas: `atlas-hic-especies.js` (que cruza con el
 * catálogo ya escrito de un espacio) y `build-species-seleccion.js` (que lo cruza con los candidatos
 * de GBIF, antes de que el espacio tenga catálogo).
 *
 * CÓMO SE GENERA EL TEXTO, cuando no hay poppler
 * ----------------------------------------------
 * `fuentes/atlas.txt` no se versiona (es reproducible), y la receta escrita en todas partes es
 * `pdftotext -layout`. Pero poppler no siempre está instalado y no siempre se puede instalar, y sin
 * el texto el Atlas no existe — que desde el 2026-08-16 es peor que antes, porque el Atlas es el
 * nivel 2 de la puerta de entrada al catálogo (regla nº 3 del CLAUDE.md). La alternativa que
 * funciona sin instalar nada del sistema:
 *
 *     pip install --target=<dir> pypdf
 *     python3 -c "import pypdf; r=pypdf.PdfReader('Docs/Atlas y Manual de los Habitat de Espana.pdf'); \
 *       open('Tools/catalogo-nacional/fuentes/atlas.txt','w').write('\\n'.join(p.extract_text() or '' for p in r.pages))"
 *
 * Da 473 páginas y 344 bloques «Especies características», que es el formato SIN layout — el que
 * este módulo aprendió a leer justo para esto. Si el `cryptography` del sistema está roto, pypdf
 * revienta al importar: se rodea poniendo delante en `PYTHONPATH` un paquete `cryptography` de
 * mentira cuyo `__init__.py` sea `raise ImportError`, que es lo que pypdf ya sabe manejar.
 */

const fs = require('fs');

// Un código HIC: cuatro dígitos (9340) o el formato con letra (92D0), con el asterisco opcional del
// Anexo I. El asterisco NO se usa aquí para decidir prioridad —eso sale de hic-prioritarios.json—,
// solo se tolera al reconocer el código.
const RE_CODIGO = /\b(\d{2}[A-Z]\d|\d{4})\*?\b/g;

// Un código PROPIO del Atlas: seis caracteres, con letra posible en tercera y sexta posición
// (834030, 81B030, 12401A). Es la clave con la que el cuerpo del Atlas identifica sus unidades y
// con la que el anexo final las cruza con la Directiva.
const RE_CODIGO_ATLAS = /^\d{2}[0-9A-Z]\d{2}[0-9A-Z]$/;

// Una fila del anexo de correspondencias: «HIC códigoAtlas * Nombre …». El HIC de la fila puede ser
// un subtipo de la Directiva (5211); se normaliza al consultarlo contra el catálogo.
const RE_FILA_ANEXO = /^\s*(\d{2}[A-Z0-9]\d)\s+(\d{2}[0-9A-Z]\d{2}[0-9A-Z])(?:\s*\*|\s+[A-ZÁÉÍÓÚÑ(«"])/;

// La línea que abre la ficha con su código y el nombre de la alianza: «214010 Charion fragilis
// Krausch 1964». Exige la mayúscula detrás para no confundirse con un código suelto de la lista de
// asociaciones («824031; Poterio…» no pasa: lleva puntuación pegada).
const RE_CODIGO_Y_NOMBRE = /^\s*(\d{2}[0-9A-Z]\d{2}[0-9A-Z])\s+[A-ZÁÉÍÓÚÑ]/;

// La paginación: un número de página es una línea de solo dígitos PEGADA al título corriente
// («Fichas descriptivas de los hábitat de España» / «Atlas y Manual de…»). La adyacencia es lo que
// descarta los números sueltos de las tablas y descripciones.
const RE_TITULO_CORRIENTE = /^\s*(Fichas descriptivas de los h[áa]bitat|Atlas y Manual de)/i;
const RE_NUM_PAGINA = /^\s*\d{1,3}\s*$/;

// El cajetín «Directiva de Hábitat» de la página: el rótulo, los epígrafes de grupo numerados
// («62. FORMACIONES HERBOSAS…») y la línea «código nombre» que interesa.
const RE_CAJETIN = /^\s*Directiva de H[áa]bitat\s*$/i;
const RE_GRUPO_CAJETIN = /^\s*\d{1,2}\.\s/;
const RE_HIC_CAJETIN = /^\s*(\d{2}[A-Z0-9]\d)\*?\s+\S/;

// Encabezado del bloque. El texto que sigue en la misma línea es el formato de `pdftotext -layout`;
// si no hay nada, la lista viene en las líneas de debajo.
const RE_ENCABEZADO = /Especies características\s*(.*)$/;

// Dónde termina la lista de especies. Son los encabezados que el Atlas pone justo después del
// bloque, más los rótulos de la maquetación (cintillos, número de página, títulos de sección en
// versales) que la extracción sin layout intercala.
const RE_FIN = new RegExp([
  '^\\s*(Asociaciones que incluye|Descripci[óo]n|Distribuci[óo]n|Perfil ed[áa]fico|Especies',
  'Clase\\.|Orden\\.|Alianza\\.|CAR[ÁA]CTER|Atlas y Manual|Fichas descriptivas|Directiva de H[áa]bitat)',
].join('|'), 'i');

// Una línea que ya no es lista de especies: versales de sección («IA. VEGETACIÓN DE AGUAS DULCES»),
// una línea que empieza por un código de asociación fitosociológica, o una línea vacía.
const RE_NO_LISTA = /^\s*$|^\s*[IVX]+[A-Z]?\.\s|^\s*\d{6}\b|^\s*\d{1,3}\s*$/;

// Cuántas líneas puede ocupar la lista. Las hay largas de verdad: el bloque del 4090 enumera más de
// veinte taxones. El tope es solo la red por si faltara el encabezado de cierre; quien manda es
// RE_FIN.
const MAX_LINEAS_LISTA = 30;

// El punto final cierra la lista… salvo cuando es el de una abreviatura. El Atlas parte los renglones
// justo detrás de «subsp.», «var.» o «f.», y tomarse ese punto por el final del bloque dejaba la
// lista en su primera línea: es lo que hacía que el 4090 se quedara sin ninguna de sus especies.
const RE_ABREVIATURA = /\b(subsp|ssp|var|subvar|f|cf|aff|s\.\s*l|s\.\s*str)\.\s*$/i;

// Cuánto se mira hacia arriba buscando el código HIC del bloque en el MODO DE RESERVA (el cajetín).
// En el formato con layout el código estaba a ~12 líneas; sin layout la descripción se parte en más
// líneas cortas y se va a ~20.
const VENTANA_CODIGO = 22;

// Cuánto se mira hacia arriba recogiendo los códigos de seis caracteres de la ficha. Una ficha con
// su foto, su descripción y su maquetación intercalada ocupa 40–70 líneas; el tope es la red, el
// corte real es el bloque «Especies características» de la ficha anterior.
const VENTANA_FICHA = 80;

const limpia = (s) => String(s).replace(/\s+/g, ' ').replace(/[.;,]+$/, '').trim();

/**
 * Une las líneas de un bloque deshaciendo la partición por guion.
 * El Atlas parte los nombres a final de renglón («Chara galioi-» / «des»), y unir con espacio
 * produciría dos taxones inexistentes en vez de uno bueno.
 */
function uneLineas(lineas) {
  let out = '';
  for (const l of lineas) {
    const t = l.trim();
    if (!t) continue;
    if (out.endsWith('-')) out = out.slice(0, -1) + t;
    else out = out ? out + ' ' + t : t;
  }
  return out;
}

/**
 * Parte el texto del bloque en nombres científicos.
 * Se exige «Género epíteto» con género capitalizado: es lo que descarta los restos de maquetación
 * que se cuelan en la misma línea. Dos reparaciones sobre el texto extraído:
 *
 *   · pypdf pega a veces el epíteto con el rango («gingidiumsubsp. commutatus»): se despegan.
 *   · en las listas largas el Atlas abrevia el género («Limonium artruchium, L. balearicum…»);
 *     la abreviatura se expande con el último género completo visto que empiece por esa letra,
 *     que es la convención tipográfica que el propio Atlas sigue. Sin esto, las listas de
 *     endemismos por género —los Limonium del 1240, sin ir más lejos— pierden todo menos el primero.
 */
function parteEspecies(bloque) {
  const texto = String(bloque).replace(/([a-záéíóúü])(subsp|ssp|var|subvar)\./g, '$1 $2.');
  const out = [];
  let genero = null;
  for (let x of texto.split(/,|;| y (?=[A-Z])/).map(limpia)) {
    const ab = x.match(/^([A-ZÁÉÍÓÚ])\.\s*(.+)$/);
    if (ab && genero && genero.startsWith(ab[1])) x = genero + ' ' + ab[2];
    const m = x.match(/^([A-ZÁÉÍÓÚ][a-záéíóúü-]+) [a-z]/);
    if (!m) continue;
    genero = m[1];
    if (!out.includes(x)) out.push(x);
  }
  return out;
}

/**
 * El anexo de correspondencias del final del Atlas, leído entero: código propio del Atlas → HICs a
 * los que corresponde. Es la única fuente dentro del propio documento que da TODAS las
 * correspondencias de una unidad, no la única que el cajetín de la página tuvo sitio para enseñar.
 */
function correspondenciasAnexo(lineas) {
  const mapa = new Map();
  for (const l of lineas) {
    const m = l.match(RE_FILA_ANEXO);
    if (!m) continue;
    if (!mapa.has(m[2])) mapa.set(m[2], new Set());
    mapa.get(m[2]).add(m[1]);
  }
  return mapa;
}

/**
 * Los índices de línea de los números de página. Si la extracción no los trae —el formato -layout
 * los maqueta de otra manera—, la lista sale vacía y el módulo vuelve al barrido por cercanía.
 */
function marcadoresDePagina(lineas) {
  const out = [];
  for (let i = 0; i < lineas.length; i++) {
    if (!RE_NUM_PAGINA.test(lineas[i])) continue;
    if ((i > 0 && RE_TITULO_CORRIENTE.test(lineas[i - 1])) ||
        (i + 1 < lineas.length && RE_TITULO_CORRIENTE.test(lineas[i + 1]))) {
      out.push(i);
    }
  }
  return out;
}

/**
 * Los HIC que el cajetín «Directiva de Hábitat» afirma DENTRO de un tramo de líneas (una página).
 * Ligarlo a la página, y no al bloque más cercano, es lo que impide que el cajetín de la página de
 * al lado opine sobre una ficha que no es la suya.
 */
function hicsDelCajetin(lineas, desde, hasta) {
  const out = new Set();
  for (let i = desde; i < hasta; i++) {
    if (!RE_CAJETIN.test(lineas[i])) continue;
    for (let j = i + 1; j < Math.min(i + 7, hasta); j++) {
      const l = lineas[j];
      if (RE_GRUPO_CAJETIN.test(l)) continue;
      const m = l.match(RE_HIC_CAJETIN);
      if (!m) break; // la continuación del nombre partido cierra el cajetín
      out.add(m[1]);
    }
  }
  return out;
}

/**
 * ¿Este HIC del anexo está en el catálogo que interesa? Directo, o normalizando el subtipo de la
 * Directiva al tipo (el anexo escribe 5211 donde el catálogo dice 5210).
 */
function enCatalogo(hic, codigos) {
  if (codigos.has(hic)) return hic;
  if (/^\d{4}$/.test(hic)) {
    const tipo = hic.slice(0, 3) + '0';
    if (codigos.has(tipo)) return tipo;
  }
  return null;
}

/**
 * Los códigos de seis caracteres de la ficha a la que pertenece el bloque que empieza en `idx`.
 * Se recogen hacia arriba hasta el bloque de la ficha anterior: los códigos encabezan la ficha
 * («421110», «833030 834020 - 834030», «214010 Charion fragilis Krausch 1964»), así que siempre
 * quedan entre un encabezado y el siguiente. Las líneas de la lista de asociaciones no engañan:
 * ahí el código va detrás del nombre y con puntuación pegada, y ninguno de los dos patrones lo caza.
 */
function codigosDeFicha(lineas, idx) {
  const out = new Set();
  for (let i = idx - 1; i >= 0 && i > idx - VENTANA_FICHA; i--) {
    const l = lineas[i];
    if (RE_ENCABEZADO.test(l)) break;
    const toks = l.trim().split(/[\s—–-]+/).filter(Boolean);
    if (toks.length && toks.every((t) => RE_CODIGO_ATLAS.test(t))) {
      for (const t of toks) out.add(t);
      continue;
    }
    const m = l.match(RE_CODIGO_Y_NOMBRE);
    if (m) out.add(m[1]);
  }
  return out;
}

/**
 * MODO DE RESERVA: el código HIC del cajetín «Directiva de Hábitat» más cercano hacia arriba que
 * esté en la lista de códigos que interesan y que encabece su línea seguido de texto (así se
 * descarta un número que aparezca suelto dentro de una descripción). Solo se usa cuando la
 * extracción no trae marcadores de página (el formato -layout), porque «el más cercano» cruza el
 * salto de página sin enterarse y el cajetín enseña una sola correspondencia.
 */
function codigoMasCercano(lineas, idx, codigos) {
  for (let i = idx; i >= 0 && i > idx - VENTANA_CODIGO; i--) {
    const l = lineas[i];
    let m, encontrado = null;
    RE_CODIGO.lastIndex = 0;
    while ((m = RE_CODIGO.exec(l))) if (codigos.has(m[1])) encontrado = m[1];
    if (encontrado && new RegExp(encontrado + '\\*?\\s+[A-Za-zÁÉÍÓÚÑ]').test(l)) return encontrado;
  }
  return null;
}

/** Recoge el texto de la lista de especies de un bloque, venga en la misma línea o debajo. */
function textoDelBloque(lineas, idx, restoDeLaLinea) {
  if (restoDeLaLinea && restoDeLaLinea.trim()) return restoDeLaLinea;
  const acc = [];
  for (let i = idx + 1; i < lineas.length && acc.length < MAX_LINEAS_LISTA; i++) {
    const l = lineas[i];
    if (RE_FIN.test(l) || RE_NO_LISTA.test(l)) break;
    acc.push(l);
    if (/\.\s*$/.test(l) && !RE_ABREVIATURA.test(l)) break; // el bloque cierra con punto
  }
  return uneLineas(acc);
}

/**
 * Especies características por código HIC.
 *
 * @param {string} ruta        fichero de texto del Atlas (pdftotext, pypdf… da igual).
 * @param {Iterable<string>} codigosHic  códigos que interesan; el resto del Atlas se ignora.
 * @returns {{porHic: Map<string, Set<string>>, bloques: number, bloquesConEspecies: number}}
 */
function especiesCaracteristicas(ruta, codigosHic) {
  const codigos = new Set(codigosHic);
  const lineas = fs.readFileSync(ruta, 'utf8').split(/\r?\n/);
  const porHic = new Map();
  for (const c of codigos) porHic.set(c, new Set());
  const anexo = correspondenciasAnexo(lineas);
  const paginas = marcadoresDePagina(lineas);

  let bloques = 0, bloquesConEspecies = 0;
  let pag = 0; // puntero sobre `paginas`; los bloques llegan en orden
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(RE_ENCABEZADO);
    if (!m) continue;
    bloques++;

    // La atribución: los códigos propios de la ficha pasados por el anexo, MÁS lo que el cajetín de
    // esta misma página afirme. Son las dos voces del propio Atlas y no se cubren entre sí: el anexo
    // da todas las correspondencias de una unidad pero omite unidades (los espartales), y el cajetín
    // las reivindica pero enseña una sola. La unión es la lectura fiel del documento entero.
    const hics = new Set();
    const codsFicha = codigosDeFicha(lineas, i);
    for (const cod of codsFicha) {
      for (const h of anexo.get(cod) || []) {
        const c = enCatalogo(h, codigos);
        if (c) hics.add(c);
      }
    }
    if (paginas.length) {
      while (pag < paginas.length && paginas[pag] < i) pag++;
      const ini = pag > 0 ? paginas[pag - 1] : 0;
      const fin = pag < paginas.length ? paginas[pag] : lineas.length;
      for (const h of hicsDelCajetin(lineas, ini, fin)) {
        const c = enCatalogo(h, codigos);
        if (c) hics.add(c);
      }
    } else if (!hics.size) {
      // Sin paginación reconocible (el formato -layout): el barrido por cercanía de siempre.
      const c = codigoMasCercano(lineas, i, codigos);
      if (c) hics.add(c);
    }
    if (!hics.size) continue;

    const especies = parteEspecies(textoDelBloque(lineas, i, m[1]));
    if (especies.length) bloquesConEspecies++;
    for (const hic of hics) for (const sp of especies) porHic.get(hic).add(sp);
  }
  return { porHic, bloques, bloquesConEspecies };
}

/**
 * Binomio normalizado para comparar nombres entre fuentes: género + raíz del epíteto, sin la
 * desinencia latina que cambia con el género gramatical del género botánico
 * (*Sedum sediforme* / *Sedum sediformis*). Es la misma clave con la que se cruzaban Atlas y
 * catálogo antes de que esto viviera en `lib/`.
 */
function binomio(nombre) {
  const w = String(nombre).trim().split(/\s+/);
  if (w.length < 2) return null;
  const g = w[0].toLowerCase().replace(/[^a-záéíóúü-]/g, '');
  const ep = w[1].toLowerCase().replace(/[^a-záéíóúü-]/g, '').replace(/(us|um|a|os|as|is|e)$/, '');
  return g + ' ' + ep;
}

/*
 * EL PUENTE DE NOMENCLATURA DEL ATLAS (deuda nº 26)
 * ------------------------------------------------
 * El Atlas cita con la nomenclatura de 2005 y el catálogo ficha con la de hoy, y el `binomio()` de
 * arriba **no puentea un cambio de género**: normaliza la desinencia del epíteto, no el género. El
 * esparto es el caso de manual —el Atlas dice *Stipa tenacissima* y el catálogo ficha *Macrochloa
 * tenacissima*—, así que el cruce no los junta y la especie se queda sin su evidencia
 * `caracteristica` en los espacios donde hoy es «solo GBIF».
 *
 * Es la trampa del §2 del CLAUDE.md —cruzar una fuente oficial con el catálogo por el nombre—
 * aplicada al Atlas, la misma que ya pagaron las aves. Y la salida es la misma que enseña
 * `runbook/AVES.md` §5: **resolver contra EIDOS el nombre que escribe la FUENTE**, no solo el del
 * candidato. NO se da de alta nada en `equivalencias-nomenclatura.json`: ese fichero prohíbe
 * expresamente registrar lo que EIDOS ya sabe, porque sería una segunda verdad que puede divergir.
 *
 * El resolvedor se INYECTA (`resolveTaxon`) en vez de importar `lib/eidos` aquí: este módulo lee un
 * PDF y no debe arrastrar un cliente HTTP, y así la parte de red se puede dejar fuera —que es lo que
 * necesita `mide-niveles-puerta.js`, que es offline por diseño y solo lee la caché—.
 *
 * La caché es OBLIGATORIA en la práctica: los nombres del Atlas son universales —una especie
 * característica del 5330 lo es en Murcia y en Girona—, así que se comparte entre espacios y entre
 * pases. Sin ella cada selección castigaría al IEPNB con cientos de peticiones repetidas.
 */

/*
 * EL PUENTE SOLO CRUZA CAMBIOS DE GÉNERO, Y ESA GUARDA NO ES OPCIONAL.
 *
 * Lo que esta deuda viene a arreglar es una RECOMBINACIÓN: el mismo taxón que cambia de género y
 * conserva su epíteto (*Stipa* → *Macrochloa* tenacissima, *Calicotome* → *Cytisus* spinosa,
 * *Sedum* → *Petrosedum* sediforme). Pero EIDOS también devuelve, por la misma vía y sin
 * distinguirlas, relaciones que son un **cambio de identidad**: *Ammophila arenaria* → *Calamagrostis
 * arundinacea*, *Sarcocornia fruticosa* → *Salicornia lagascae*, *Ruppia cirrhosa* → *Ruppia
 * spiralis*. Ahí las dos autoridades discrepan de circunscripción, y colgar el HIC del segundo taxón
 * porque el primero lo tenía es exactamente el «dato inventado» de la regla nº 2 — con el agravante
 * de que este puente se usa SOLO EN POSITIVO, así que un enlace falso no lo desmiente nadie después.
 *
 * Es la misma distinción que la deuda nº 27 hace a mano taxón a taxón, aplicada aquí como guarda: si
 * el epíteto cambia, no se puentea y se dice. Lo caro de esos casos no es detectarlos, es decidirlos,
 * y eso va con la fuente delante y de uno en uno.
 */
const epiteto = (b) => (b ? b.split(' ')[1] || '' : '');

/**
 * El puente leído de la caché, sin red. Devuelve Map(binomio del Atlas → binomio aceptado), y solo
 * con los pares que comparten epíteto. `descartados` (opcional) recoge los que no lo comparten para
 * poder enseñarlos.
 */
function puenteDesdeCache(cache, descartados = null) {
  const mapa = new Map();
  for (const [nombre, r] of Object.entries(cache || {})) {
    if (!r || !r.acceptedName) continue;
    const desde = binomio(nombre);
    const hasta = binomio(r.acceptedName);
    if (!desde || !hasta || desde === hasta) continue;
    if (epiteto(desde) !== epiteto(hasta)) {
      if (descartados) descartados.push({ nombre, acceptedName: r.acceptedName });
      continue;
    }
    mapa.set(desde, hasta);
  }
  return mapa;
}

/**
 * Resuelve contra EIDOS los nombres del Atlas que la caché no tenga y devuelve
 * `{ mapa, cache, pedidas }`. Un nombre que EIDOS no resuelve se cachea como `null`: «no lo
 * resuelve» es un resultado, y volver a preguntarlo en cada pase no lo cambia.
 *
 * `mapa` solo lleva los nombres que CAMBIAN de binomio. Los que no cambian ya los casaba el cruce
 * directo, y meterlos sería ruido.
 */
async function tiendePuente(nombres, { resolveTaxon, cache = {}, sleep = null, throttleMs = 150 } = {}) {
  if (typeof resolveTaxon !== 'function') return { mapa: puenteDesdeCache(cache), cache, pedidas: 0 };
  let pedidas = 0;
  for (const n of new Set(nombres)) {
    if (n in cache) continue;
    cache[n] = null;
    try {
      const r = await resolveTaxon(n);
      if (r && r.acceptedName) cache[n] = { acceptedName: r.acceptedName, taxonid: r.taxonid || null };
    } catch (e) { delete cache[n]; } // un fallo de RED no se cachea como «no existe»: se reintenta
    pedidas++;
    if (sleep) await sleep(throttleMs);
  }
  return { mapa: puenteDesdeCache(cache), cache, pedidas };
}

module.exports = { especiesCaracteristicas, binomio, tiendePuente, puenteDesdeCache };
