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

/**
 * Resuelve un nombre científico contra la nomenclatura de EIDOS.
 * @returns {Promise<{status:'ok'|'sinonimo'|'no-encontrada', taxonid:number|null, taxon:object|null,
 *                    acceptedName:string|null, synonymName:string|null}>}
 *   'ok'          el nombre es el aceptado (o hay un aceptado bajo ese prefijo).
 *   'sinonimo'    el nombre está reclasificado; `acceptedName`/`taxonid` apuntan al aceptado real.
 *   'no-encontrada' EIDOS no conoce ese nombre (típico en flora poco tratada).
 */
async function resolveTaxon(sci, opts = {}) {
  const select = 'select=taxonid,nameid,acceptednameid,name,taxonrank,nametype,genus,specificepithet,scientificnameauthorship,taxonomicgroup,origen';
  const filas = await rows('v_taxonomia', [`name=like.${encodeURIComponent(sci)}*`, select], opts);
  if (!filas.length) return { status: 'no-encontrada', taxonid: null, taxon: null, acceptedName: null, synonymName: null };

  const aceptados = filas.filter(r => r.nametype === 'Aceptado/válido');
  const exacto = aceptados.find(r => nameMatches(r.name, sci)) || aceptados[0];
  if (exacto) {
    return { status: 'ok', taxonid: exacto.taxonid, taxon: exacto, acceptedName: exacto.name, synonymName: null };
  }

  // Solo figura como sinónimo: se resuelve el nombre aceptado real por `acceptednameid`.
  const syn = filas[0];
  let acceptedName = null, taxonid = null;
  if (syn.acceptednameid && syn.acceptednameid !== syn.nameid) {
    try {
      const acc = await rows('v_taxonomia', [`nameid=eq.${syn.acceptednameid}`, 'select=name,taxonid'], opts);
      if (acc.length) { acceptedName = acc[0].name; taxonid = acc[0].taxonid; }
    } catch (_) { /* si la segunda consulta falla, se informa del sinónimo sin el aceptado */ }
  }
  return { status: 'sinonimo', taxonid, taxon: syn, acceptedName, synonymName: syn.name };
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
    `idtaxon=eq.${idtaxon}`, 'select=estadolegal,norma,ambito,ccaa,idvigente',
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
  q, rows, resolveTaxon, conservationByScope, legalStatus, commonName,
  norm, nameMatches, binomial, sleep,
};
