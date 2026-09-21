'use strict';
/*
 * eidos.js — cliente de EIDOS (Banco de Datos de la Naturaleza, IEPNB/MITECO).
 *
 * EIDOS es la fuente PRINCIPAL de la Capa 3 del catálogo: taxonomía, nombres comunes, estado de
 * conservación (UICN por ámbito) y estado legal (CEEA/LESRPE/Directivas/CCAA). Es una API PostgREST
 * pública y SIN autenticación sobre `https://iepnb.gob.es/api/`, con dos esquemas:
 *
 *   /api/especie/    vistas de taxón:   v_taxonomia · v_estadoconservacion · v_estadolegal ·
 *                                       v_nombrescomunes · v_atributos_pliniancore
 *   /api/catalogo/   Lista Patrón:      v_listapatronespecie_normas · v_listapatronespecie_codigos
 *
 * TRAMPA DE LA API, documentada aquí para no volver a tropezar: `v_taxonomia` identifica el nombre
 * con `taxonid`, pero las vistas de detalle lo llaman **`idtaxon`**, y `v_imagenes` (descubierta por
 * heurística) lo llama **`id_taxon`**. Filtrar por la columna equivocada no da error HTTP: PostgREST
 * devuelve 200 con un OBJETO de error en vez de un array, así que un `for...of` revienta con «no es
 * iterable» y el script parece «no encontrar nada». Por eso `rows()` normaliza siempre a array.
 *
 * `resolveTaxon()` es el corazón del modelo de datos: la clave maestra `eidos_taxonid` es lo que
 * permite que una misma especie se reutilice entre parques sin duplicar ficha (ver §«Las especies
 * son nacionales» del rollout). Estaba implementada dos veces, con criterios distintos de
 * emparejamiento; aquí hay una sola.
 */
const { getJson } = require('./http');
const { sleep } = require('./cli');

const HOST = 'iepnb.gob.es';
const BASE_ESPECIE = '/api/especie';
const BASE_CATALOGO = '/api/catalogo';
// Pausa recomendada entre taxones: es un servicio público y un catálogo son cientos de peticiones.
const THROTTLE_MS = 150;

/** Construye la URL de una vista PostgREST: `q('v_taxonomia', ['taxonid=eq.27376','select=name'])`. */
const q = (view, params = [], base = BASE_ESPECIE) => `${base}/${view}${params.length ? '?' + params.join('&') : ''}`;

/**
 * GET de una vista de EIDOS, garantizando un ARRAY de filas.
 * Cuando se filtra por una columna que la vista no tiene, PostgREST responde 200 con un objeto
 * `{code, message, hint}`: aquí se convierte en excepción con el mensaje del propio servidor, en vez
 * de dejar que el llamante itere sobre un objeto y falle tres funciones más arriba.
 */
async function rows(view, params = [], { base = BASE_ESPECIE, agent = 'eidos' } = {}) {
  const data = await getJson(HOST, q(view, params, base), { agent });
  if (Array.isArray(data)) return data;
  const msg = data && (data.message || data.hint || data.details);
  throw new Error(`EIDOS ${view}: ${msg || JSON.stringify(data).slice(0, 200)}`);
}

// --- Emparejamiento de nombres --------------------------------------------------------------------
// EIDOS devuelve el nombre CON autor ("Aquila fasciata Vieillot, 1822"); el catálogo lo guarda sin
// él. Se empareja por prefijo terminado en espacio, nunca truncando a dos palabras: truncar rompe
// las subespecies ("Rhamnus lycioides subsp. borgiae" casaría con la especie, que es otro taxón).
const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const nameMatches = (eidosName, sci) => {
  const n = norm(eidosName), s = norm(sci);
  return n === s || n.startsWith(s + ' ');
};
/** Género + epíteto, para comparar el nombre aceptado de EIDOS con el de GBIF (que da el binomio). */
const binomial = (s) => norm(s).split(' ').slice(0, 2).join(' ');

/*
 * EL RANGO QUE PIDE EL NOMBRE, y por qué hace falta preguntárselo.
 *
 * `nameMatches` empareja por prefijo para tolerar el autor, y eso tiene un efecto que no se ve:
 * «Turdus merula» casa con «Turdus merula Linnaeus, 1758» (la especie, que es lo que se pedía) y
 * casa IGUAL de bien con «Turdus merula subsp. cabrerae» (el mirlo canario, que es otro bicho). Las
 * dos filas están aceptadas, así que `find` devolvía **la primera que EIDOS listara**, y EIDOS lista
 * primero la subespecie. Nada fallaba: la llamada respondía `status: 'ok'` con un taxonid perfecto…
 * de otro taxón, y de ahí colgaban después su estado legal, su Lista Roja y su taxonomía.
 *
 * Es la misma familia que el `|| filas[0]` de `commonName` (2026-08-29): una reserva razonable que
 * convierte «no sé cuál» en «éste», y quien llama se cree la promesa de la firma. Se detectó el
 * 2026-09-15 auditando el catálogo: SIETE taxones en 20 fichas llevaban el identificador de una
 * subespecie —cuatro de ellas de Canarias o del norte de África— teniendo la especie dada de alta y
 * aceptada en EIDOS, a un puesto de distancia en la misma respuesta.
 *
 * El desempate no se adivina: lo dice la propia fuente en `taxonrank`. Basta con inferir del nombre
 * PEDIDO qué rango se está pidiendo y quedarse con la fila que lo tenga.
 */
const MARCAS_INFRA = /\b(subsp|ssp|var|subvar|f|forma|cv)\.?\s/i;
function rangoPedido(sci) {
  const s = norm(sci);
  const palabras = s.split(' ').filter(Boolean);
  if (MARCAS_INFRA.test(s + ' ')) {
    if (/\bvar\.?\s/i.test(s + ' ')) return 'Variety';
    if (/\b(f|forma)\.?\s/i.test(s + ' ')) return 'Form';
    return 'Subspecies';
  }
  if (palabras.length >= 3) return 'Subspecies';   // trinomio sin marca: «Capra pyrenaica pyrenaica»
  if (palabras.length === 2) return 'Species';
  return 'Genus';
}
const rangoCoincide = (deLaFila, pedido) => !deLaFila || !pedido || norm(deLaFila) === norm(pedido);

/*
 * EL ÁMBITO DE POBLACIÓN DE UNA NORMA ESTATAL, y por qué hay que mirarlo.
 *
 * Una norma de ámbito «Nacional» no protege siempre en toda España, y EIDOS lo dice en un campo que
 * el pipeline no leía: `observacionespoblacion`. El Anexo del RD 139/2011 tiene una columna
 * «Población referida» y EIDOS la sirve ahí, literal. Sin ese filtro, la ficha AFIRMA una figura que
 * en la península no existe:
 *
 *   · *Fringilla coelebs* — el Anexo lo lista SOLO con «Canarias», y el catálogo anunciaba «LESRPE»
 *     a secas para el pinzón de Murcia. Tramo 2 donde toca 1.
 *   · *Charadrius alexandrinus* y *Cymodocea nodosa* — el Anexo los lista DOS veces: «Península y
 *     Baleares» sin categoría (LESRPE) y «Canarias» como **Vulnerable**. El catálogo se quedaba con
 *     la segunda: CEEA Vulnerable, tramo 4 y destacada, por una población que está a 1.800 km.
 *   · Ocho culebras nativas —la bastarda, la viperina, la de herradura…— anunciando «CEEEI:
 *     Incluido», que es el catálogo de especies exóticas INVASORAS y se les aplica solo en
 *     «Canarias, Ibiza y Formentera», donde están introducidas. Y con ellas el madroño, el tojo y la
 *     escoba negra, que son los tres que la revisión de Sierra Espuña del 2026-08-09 ya corrigió **a
 *     mano y en un solo park.json**: la causa estaba en el catálogo universal y volvió sola.
 *
 * Se filtra solo lo que queda ENTERAMENTE fuera de la península, que es lo único que este catálogo
 * puede afirmar hoy. Un ámbito peninsular parcial («Excepto Galicia», «Mediterráneo») se conserva:
 * decidir sobre él exige saber de qué territorio habla la ficha, y `spainStatus` es un campo
 * universal.
 */
const SOLO_FUERA_DE_LA_PENINSULA =
  /^(?:ámbito de aplicación:\s*)?(?:canarias|baleares|illes balears|ibiza|formentera)(?:\s*(?:,|y|e)\s*(?:canarias|baleares|illes balears|ibiza|formentera))*$/i;

/** ¿La norma de esta fila se aplica en la península, o solo en Canarias/Baleares? */
function aplicaEnPeninsula(fila) {
  const obs = norm(fila && fila.observacionespoblacion);
  return !obs || !SOLO_FUERA_DE_LA_PENINSULA.test(obs);
}

/**
 * Resuelve un nombre científico contra la nomenclatura de EIDOS.
 * @returns {Promise<{status:'ok'|'sinonimo'|'no-encontrada', taxonid:number|null, taxon:object|null,
 *                    acceptedName:string|null, synonymName:string|null, rangoDistinto:boolean}>}
 *   'ok'          el nombre es el aceptado (o hay un aceptado bajo ese prefijo).
 *   'sinonimo'    el nombre está reclasificado; `acceptedName`/`taxonid` apuntan al aceptado real.
 *   'no-encontrada' EIDOS no conoce ese nombre (típico en flora poco tratada).
 *
 * `rangoDistinto` avisa de que lo que se devuelve NO es del rango que pedía el nombre —porque EIDOS
 * no tiene ese rango aceptado bajo ese prefijo, como *Caralluma europaea*, cuyo único aceptado es
 * una variedad—. Se devuelve igual, porque es la mejor respuesta que hay, pero el que llama tiene
 * que poder distinguir «esto es lo que pediste» de «esto es lo único que hay»: escribir lo segundo
 * en un `eidosTaxonId` sin decirlo es como se colaron las veinte fichas de 2026-09-15.
 */
async function resolveTaxon(sci, opts = {}) {
  const select = 'select=taxonid,nameid,acceptednameid,name,taxonrank,nametype,genus,specificepithet,scientificnameauthorship,taxonomicgroup,origen';
  const filas = await rows('v_taxonomia', [`name=like.${encodeURIComponent(sci)}*`, select], opts);
  if (!filas.length) return { status: 'no-encontrada', taxonid: null, taxon: null, acceptedName: null, synonymName: null };

  // El rango que pide el nombre manda sobre el orden en que EIDOS devuelva las filas, y manda
  // TAMBIÉN sobre si la fila está aceptada o es un sinónimo: ver la nota de `rangoPedido` y la de
  // aquí arriba. Por eso el filtro por rango se aplica a todas las filas que casan por nombre y no
  // solo a las aceptadas, que era la mitad que faltaba.
  const pedido = rangoPedido(sci);
  const porNombre = filas.filter(r => nameMatches(r.name, sci));
  const conRango = porNombre.filter(r => rangoCoincide(r.taxonrank, pedido));
  const candidatas = conRango.length ? conRango : (porNombre.length ? porNombre : filas);

  const aceptada = candidatas.find(r => r.nametype === 'Aceptado/válido');
  if (aceptada) {
    return {
      status: 'ok', taxonid: aceptada.taxonid, taxon: aceptada, acceptedName: aceptada.name, synonymName: null,
      rangoDistinto: !rangoCoincide(aceptada.taxonrank, pedido),
    };
  }

  // Ninguna candidata está aceptada: el nombre pedido es un sinónimo. El `taxonid` de un sinónimo YA
  // es el del taxón al que pertenece —EIDOS agrupa todos los nombres de un taxón bajo el mismo—, así
  // que de aquí sale el identificador; la segunda consulta es solo para poder decir con qué nombre
  // lo llama hoy la fuente.
  const syn = candidatas[0];
  let acceptedName = null;
  let taxonid = syn.taxonid || null;
  try {
    const hermanas = await rows('v_taxonomia', [`taxonid=eq.${syn.taxonid}`, 'select=name,taxonid,nametype,taxonrank'], opts);
    const acc = hermanas.find(r => r.nametype === 'Aceptado/válido');
    if (acc) { acceptedName = acc.name; taxonid = acc.taxonid; }
  } catch (_) { /* si la segunda consulta falla, se informa del sinónimo sin el aceptado */ }
  return {
    status: 'sinonimo', taxonid, taxon: syn, acceptedName, synonymName: syn.name,
    rangoDistinto: !rangoCoincide(syn.taxonrank, pedido),
  };
}

/**
 * Estado de conservación UICN por ámbito (`aplicaa`: Mundial/España/Península/Canarias).
 * Se queda con la fila VIGENTE más reciente de cada ámbito: EIDOS acumula evaluaciones históricas y
 * quedarse con la primera que llega devuelve categorías de hace veinte años.
 */
async function conservationByScope(idtaxon, opts = {}) {
  const filas = await rows('v_estadoconservacion', [
    `idtaxon=eq.${idtaxon}`, 'select=categoriaconservacion,autoridad,aplicaa,anio,vigencia',
  ], opts);
  const porAmbito = {};
  for (const r of filas) {
    if (r.vigencia !== 'Vigente' || r.autoridad !== 'UICN') continue;
    const ambito = r.aplicaa || '?';
    if (!porAmbito[ambito] || (r.anio || 0) > (porAmbito[ambito].anio || 0)) porAmbito[ambito] = r;
  }
  return porAmbito;
}

/**
 * Estado legal vigente, separado en nacional y autonómico.
 * `ccaa` es el nombre de la comunidad cuyo catálogo regional interesa ("Murcia", "Andalucía"…): el
 * campo de estado autonómico de la ficha depende de la norma de CADA comunidad, así que el filtro
 * es un parámetro y no una constante (era `/murcia/i` fijo, atado al parque piloto).
 *
 * ⚠️ SEGUNDA TRAMPA DE LA VISTA, y esta llegó a producción: `ambito` NO basta para saber si una
 * norma es estatal. EIDOS sirve las filas del Catálogo Regional de Castilla-La Mancha (Ley 9/1999)
 * con `ambito: "Nacional"`, y solo se delatan por traer `ccaa: "Castilla-La Mancha"` relleno. De ahí
 * salen las 60 fichas del catálogo cuyo `spainStatus` cita una ley manchega —39 en Sierra Espuña y
 * 21 en Carrascoy—, que el ledger daba por incorregibles sin un «índice de normas del IEPNB» que no
 * existe: la fuente sí distingue, pero por `ccaa` y no por `ambito`. Una norma estatal no tiene
 * comunidad, así que `nacional` exige las dos cosas.
 */
async function legalStatus(idtaxon, ccaa = null, opts = {}) {
  const filas = await rows('v_estadolegal', [
    `idtaxon=eq.${idtaxon}`, 'select=estadolegal,norma,ambito,ccaa,idvigente,observacionespoblacion',
  ], opts);
  const vigentes = filas.filter(r => r.idvigente === 1);
  const re = ccaa ? new RegExp(ccaa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
  return {
    vigentes,
    nacional: vigentes.filter(r => r.ambito === 'Nacional' && !r.ccaa),
    autonomico: re ? vigentes.filter(r => re.test(r.ccaa || '') || re.test(r.norma || '')) : [],
  };
}

/**
 * Nombre común preferente en castellano, si EIDOS lo tiene.
 *
 * Las columnas de esta vista NO se llaman como las de las demás: el nombre está en `nombre_comun` y
 * la marca de preferente en `espreferente`. Pedir `select=nombre,idioma,preferente` devuelve un 400
 * de PostgREST («column does not exist»), así que esta función falló siempre desde que se escribió;
 * no se notó porque ninguna herramienta la llegó a llamar hasta el alta de fichas universales.
 *
 * Y EN CASTELLANO QUIERE DECIR EN CASTELLANO (2026-08-29). La última reserva de la cadena era
 * `|| filas[0]`, o sea «si no hay ninguno en castellano, devuelve el primero de la lista **en el
 * idioma que sea**». EIDOS sirve los nombres de las cuatro lenguas del Estado, así que esa reserva
 * devolvía catalán —«gavó sicilià», «lletsó resedifoli», «arenària serpil.lifòlia»— y hasta euskera
 * («hirusta» para dos tréboles distintos), y quien llamaba se creía que era castellano porque eso es
 * lo que promete la primera línea de este comentario. Nada fallaba: un nombre es un nombre.
 *
 * Ahora, si no hay castellano, se devuelve `null`. El que llama ya sabe qué hacer con un hueco
 * —`build-species-universal.js` escribe el nombre científico y lo apunta como campo que falta—, y un
 * hueco declarado es mejor que un nombre en otro idioma que nadie va a volver a mirar.
 */
async function commonName(idtaxon, opts = {}) {
  const filas = await rows('v_nombrescomunes',
    [`idtaxon=eq.${idtaxon}`, 'select=nombre_comun,idioma,espreferente,tiponombre'], opts);
  const es = filas.filter(r => !r.idioma || /castellano|espa/i.test(r.idioma));
  const pref = es.find(r => r.espreferente) || es[0];
  return pref ? pref.nombre_comun : null;
}

module.exports = {
  HOST, BASE_ESPECIE, BASE_CATALOGO, THROTTLE_MS,
  q, rows, resolveTaxon, conservationByScope, legalStatus, commonName, aplicaEnPeninsula,
  norm, nameMatches, binomial, rangoPedido, rangoCoincide, sleep,
};
