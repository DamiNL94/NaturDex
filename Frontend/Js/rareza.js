// ================================================================================================
// rareza.js — la escalera de rareza legal en la app: filtro del catálogo y aviso de interacción.
// ------------------------------------------------------------------------------------------------
// EL PROBLEMA QUE RESUELVE
// El tramo 1–5 de rareza ya estaba en el dato —lo calcula `Tools/lib/rareza.js` desde la categoría
// legal vigente, que es dato oficial directo— y la app solo lo enseñaba como cinco estrellas en un
// rincón de la ficha. No se podía filtrar por él, así que la única forma de saber qué hay protegido
// en un espacio era abrir las 246 fichas una a una; y, sobre todo, la ficha no decía en ningún sitio
// que a una especie catalogada NO hay que acercarse.
//
// Eso último es un problema del producto, no de la ficha: la app pide salir al campo y marcar
// especies, y un juego de coleccionar empuja a buscar justo lo más raro. Sin un aviso, la mecánica
// lleva a la gente a perseguir a los taxones que peor aguantan que se les persiga.
//
// LO QUE SE MUESTRA ES LA FIGURA LEGAL, NO UNA OPINIÓN
// El aviso cita SIEMPRE la categoría y la norma que la impone, tal y como las guarda
// `rarityLocalBasis` / `rarityBasis`, y no afirma nada por su cuenta. Importa porque el tramo sale
// de catálogos legales que a veces sorprenden: la encina y el enebro de la miera están «En Peligro
// de Extinción» en el Catálogo Regional de Murcia (Decreto 50/2003) y por eso puntúan 5. Decir «esta
// especie está catalogada como X por la norma Y» es cierto también ahí; decir «esta especie está a
// punto de desaparecer» no lo sería, y es lo que haría un texto escrito a ojo.
//
// UNA FICHA SIN TRAMO TAMBIÉN AVISA
// Es la regla nº 9 del CLAUDE.md llevada a la pantalla: «nadie lo ha mirado» no es «no está
// amenazada». Igual que la exportación Darwin Core generaliza la coordenada de un taxón sin tramo
// calculado, aquí se enseña el aviso de precaución. Publicar de menos se corrige; acercarse de más,
// no.
//
// EL TRAMO TAMBIÉN TIÑE LA TARJETA DEL CATÁLOGO
// El distintivo de rareza dice el tramo, pero hay que leerlo: en una lista de doscientas fichas no
// se ve de un vistazo dónde está lo protegido. `claseRareza()` da la clase con la que la tarjeta se
// pinta de fondo, y el degradado no es decorativo — es la misma escalera: verde para lo protegido
// sin amenaza, ámbar y rojo para las dos categorías de amenaza, azul para lo que nadie ha mirado y
// ningún tinte para el tramo 1. El tinte NUNCA es el único portador del dato: del 2 para arriba lo
// dice el distintivo, y en el tramo sin calcular lo dice `render/catalogo.js` con un texto para
// lector de pantalla. Color solo, sin texto, no es información.
//
// El vocabulario y los cinco tramos son los mismos que `Tools/lib/rareza.js`, con los mismos textos:
// son la misma escalera vista desde los dos lados del repositorio.
// ================================================================================================

import { html } from './util.js';

// Los cinco tramos. `significado` es literalmente el `SIGNIFICADO` de Tools/lib/rareza.js: si algún
// día cambia allí, cambia aquí, y el sitio donde mirar es ése.
export const TRAMOS = {
  5: { corto: 'En peligro', significado: 'En peligro de extinción · Extinguida' },
  4: { corto: 'Vulnerable', significado: 'Vulnerable · Sensible a la alteración de su hábitat' },
  3: { corto: 'Interés especial', significado: 'De interés especial' },
  2: { corto: 'Protección especial', significado: 'En régimen de protección especial (LESRPE)' },
  1: { corto: 'Sin figura', significado: 'Sin figura de protección' },
};

// A partir de este tramo la ficha lleva cartel de advertencia. Son las dos categorías de AMENAZA de
// la escalera (en peligro, vulnerable/sensible); el tramo 3 y el 2 son protección sin amenaza y no
// justifican interrumpir la lectura con un cartel.
export const TRAMO_AMENAZA = 4;

/**
 * El tramo de una ficha: manda el LOCAL, que es la categoría más grave de las dos escalas (estatal y
 * autonómica) y por tanto lo excepcional que es la especie en este espacio. `rarityScore` —el
 * estatal, universal— solo es reserva para las fichas que aún no lo tienen calculado. Devuelve
 * `null` cuando no consta ninguno de los dos, que es un estado distinto de «tramo 1».
 *
 * La reserva EXIGE `rarityBasis`, y no es un detalle: un `rarityScore` sin él es uno de los valores
 * heredados del criterio propio 1–5, un número puesto a ojo antes de que el tramo se derivara de la
 * norma (`Tools/validate-park-data.js` los sigue contando como aviso). Sin esta condición, la
 * reserva enseñaba esa suposición con el mismo rótulo y las mismas cinco estrellas que un tramo
 * derivado del BOE, y encima con el cartel de amenaza si llegaba a 4: la coscoja y la alhucema de
 * Calblanque salían en «Interés especial» y «Protección especial» sin que ninguna norma las nombre.
 * Un número a ojo no es mejor que ningún número: es peor, porque parece comprobado.
 */
export function tramoDe(species) {
  if (!species) return null;
  const estatal = species.rarityBasis ? species.rarityScore : null;
  const tramo = species.rarityLocal ?? estatal ?? null;
  return Number.isFinite(tramo) && tramo >= 1 && tramo <= 5 ? tramo : null;
}

/** Las cinco estrellas, con las vacías incluidas: sin ellas no se ve sobre cuánto puntúa. */
export function estrellas(tramo) {
  const n = Number.isFinite(tramo) ? tramo : 0;
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

/**
 * La clase CSS con la que la tarjeta del catálogo se tiñe de su tramo. Vive aquí, y no en
 * `render/catalogo.js`, por el mismo motivo que el filtro y el cartel: la escalera es una sola, y
 * quien la cambie tiene que encontrarla entera en un fichero.
 *
 * `rareza-nd` es el tramo que NO se ha calculado, y es una clase propia a propósito: pintarlo del
 * color del tramo 1 afirmaría «sin figura de protección», que es justo lo que no consta. Es el
 * mismo criterio con el que `avisoDeInteraccion` le da cartel a esas fichas.
 */
export function claseRareza(species) {
  const tramo = tramoDe(species);
  return tramo === null ? 'rareza-nd' : 'rareza-' + tramo;
}

/**
 * La figura legal que justifica el tramo, con su norma. Se prefiere la base LOCAL porque es la del
 * tramo que se muestra; si falta se cae a la estatal, y si faltan las dos se devuelve `null` — que
 * es lo que hay que enseñar como «sin procedencia registrada», no un hueco en blanco.
 */
export function baseDe(species) {
  const base = (species && (species.rarityLocalBasis || species.rarityBasis)) || null;
  if (!base || !base.categoria) return null;
  // La cita de la norma llega con el punto final de la fuente («…especies forestales.»), y la ficha
  // la mete dentro de un paréntesis o al final de otra frase: sin quitarlo salen dos puntos
  // seguidos, o un «).» detrás de un punto. Se quita el punto, no la cita.
  const limpia = (t) => String(t || '').trim().replace(/\.$/, '');
  return { categoria: limpia(base.categoria), norma: limpia(base.norma) || null, ambito: base.ambito || null };
}

// Los consejos cambian según lo que se tenga delante: a una planta no se la persigue y a un
// vertebrado no se le arrancan esquejes. Se escriben en imperativo y en negativo porque es lo que
// se lee de un vistazo con el móvil en la mano y el animal a la vista.
const CONSEJOS_FAUNA = [
  'Obsérvala de lejos, con prismáticos o con el zoom. Si deja de comer, cambia de postura o te mira fijo, ya estás demasiado cerca: retrocede.',
  'No la persigas ni la toques, y no uses reclamos, cebos, linternas ni drones para acercarla.',
  'No te aproximes a nidos, madrigueras ni refugios. En época de cría una sola visita puede hacer que abandonen la puesta.',
  'Si la ves herida o atrapada, no la manipules: avisa al 112 y deja que la recoja quien sepa hacerlo.',
];
const CONSEJOS_FLORA = [
  'No la arranques, no la cortes y no te lleves semillas, bulbos, esquejes ni «un trocito para casa».',
  'No pises la mata ni el suelo de alrededor: en muchas de estas plantas lo que acaba con la población es el pisoteo del sitio, no la recolección.',
  'Fotografíala tal y como está: no apartes ramas ni sujetes la flor para enfocar mejor.',
];
const CONSEJOS_COMUNES = [
  'Para marcarla como vista basta con verla. La app no necesita que te acerques, que la toques ni que la muevas.',
  'Si compartes la foto fuera de la app, no publiques el punto exacto: es la información que más daño hace en las especies raras.',
];

const NOTA_LEGAL = 'Perturbar, capturar, recolectar o dañar a un taxón catalogado es una infracción ' +
  'sancionable (Ley 42/2007, del Patrimonio Natural y de la Biodiversidad, y la norma que lo cataloga).';

/**
 * El aviso de interacción de una ficha, o `null` si no lleva.
 *
 * Tres niveles y ninguno es decorativo:
 *   · `critico`      — tramo 5: la categoría más alta del catálogo que la protege.
 *   · `alto`         — tramo 4: vulnerable o sensible a la alteración de su hábitat.
 *   · `desconocido`  — sin tramo calculado. Ver la cabecera: precaución por defecto.
 */
export function avisoDeInteraccion(species) {
  const tramo = tramoDe(species);
  const esFlora = species && species.kingdom === 'flora';
  const consejos = (esFlora ? CONSEJOS_FLORA : CONSEJOS_FAUNA).concat(CONSEJOS_COMUNES);

  if (tramo === null) {
    return {
      nivel: 'desconocido', icono: '❔',
      titulo: 'Sin categoría de protección comprobada',
      entrada: 'Esta ficha no tiene calculado su tramo de protección. Que nadie lo haya mirado no ' +
        'significa que la especie no esté amenazada, así que trátala como si lo estuviera.',
      consejos, nota: NOTA_LEGAL,
    };
  }
  if (tramo < TRAMO_AMENAZA) return null;

  const base = baseDe(species);
  const cita = base
    ? `Está catalogada como «${base.categoria}»${base.norma ? ` (${base.norma})` : ''}.`
    : 'Está catalogada en una categoría de amenaza, aunque esta ficha no guarda cuál es la norma que la impone.';
  return tramo >= 5
    ? {
      nivel: 'critico', icono: '⛔',
      titulo: 'Especie en la categoría de protección más alta',
      entrada: `${cita} Verla es un privilegio y molestarla puede costarle la vida a un ejemplar que quizá no tenga recambio.`,
      consejos, nota: NOTA_LEGAL,
    }
    : {
      nivel: 'alto', icono: '⚠️',
      titulo: 'Especie amenazada: mira, no toques',
      entrada: `${cita} No hay tantas como para que una molestia de más dé igual.`,
      consejos, nota: NOTA_LEGAL,
    };
}

/**
 * El cartel entero, listo para insertar en la ficha. Cadena vacía si la especie no lleva aviso.
 *
 * SE PLIEGA, PERO NO ENTERO, Y LA COSTURA ESTÁ ELEGIDA
 * El cartel se llevaba media pantalla de móvil entre el nombre de la especie y su descripción, y
 * lo que lo hace largo son las pautas y la nota legal, que son las MISMAS en todas las fichas de
 * su clase: se leen una vez y a partir de ahí estorban. Lo que cambia ficha a ficha es la cabecera
 * —el icono, el título y la cita de la categoría con su norma—, y eso NO se pliega: es lo único
 * que dice qué se tiene delante, y un aviso escondido no es un aviso.
 *
 * Por eso el `<details>` va DENTRO del `<aside>` y envuelve solo las pautas. Tres consecuencias, y
 * ninguna casual: el bloque conserva su color de alarma y su filete esté abierto o cerrado; el
 * rótulo del control es corto y dice cuántas pautas guarda, en vez de que el lector de pantalla
 * anuncie el párrafo entero como nombre de un botón; y quien no lo abra sigue leyendo la figura
 * legal, que es el dato crítico.
 *
 * Arranca CERRADO en los tres niveles. Abrirlo de oficio en `critico` se planteó y se descartó:
 * dejaría dos fichas seguidas con el mismo cartel en dos estados distintos, y la cabecera avisa
 * igual de fuerte con las pautas plegadas.
 */
export function cartelAdvertencia(species) {
  const aviso = avisoDeInteraccion(species);
  if (!aviso) return '';
  return html`<aside class="proteccion-aviso ${aviso.nivel}" role="note" aria-label="Aviso de interacción con la especie">
    <p class="proteccion-titulo"><span aria-hidden="true">${aviso.icono}</span> ${aviso.titulo}</p>
    <p class="proteccion-entrada">${aviso.entrada}</p>
    <details class="proteccion-pautas">
    <summary>Cómo comportarse ante ella (${aviso.consejos.length} pautas)</summary>
    <ul class="proteccion-consejos">${aviso.consejos.map(c => html`<li>${c}</li>`)}</ul>
    <p class="proteccion-nota">${aviso.nota}</p>
    </details>
    </aside>`;
}

/** Recordatorio de una línea, para ponerlo junto al botón de marcar, que está al final de la ficha. */
export function recordatorioAdvertencia(species) {
  const aviso = avisoDeInteraccion(species);
  if (!aviso) return '';
  return html`<p class="proteccion-recordatorio ${aviso.nivel}"><span aria-hidden="true">${aviso.icono}</span>
    Recuerda: para marcarla basta con haberla visto. No hace falta acercarse, tocarla ni moverla.</p>`;
}

// --- El filtro del catálogo ---------------------------------------------------------------------
// Los valores son cadenas porque salen de un <select> y acaban en `state.rarityFilter`. Cada uno es
// un MÍNIMO —«de este tramo para arriba»— y no un tramo exacto: quien busca lo protegido quiere ver
// también lo que está más protegido todavía.
export const FILTROS_RAREZA = [
  { valor: 'all', etiqueta: 'Cualquier rareza', minimo: 0 },
  { valor: '2', etiqueta: '★★☆☆☆ Protegidas o más', minimo: 2 },
  { valor: '3', etiqueta: '★★★☆☆ De interés especial o más', minimo: 3 },
  // Los rótulos se quedan cortos a propósito: un <select> nativo recorta la opción seleccionada al
  // ancho del control, y en móvil eso son unos treinta caracteres. Lo que no cabe en el rótulo está
  // en el cartel de la ficha, que es donde de verdad hay que leerlo.
  { valor: '4', etiqueta: '★★★★☆ Amenazadas o más', minimo: 4 },
  { valor: '5', etiqueta: '★★★★★ En peligro de extinción', minimo: 5 },
];

/** ¿Pasa esta ficha el filtro de rareza dado? Una ficha SIN tramo no pasa ningún filtro con mínimo. */
export function pasaFiltroRareza(species, valor) {
  const filtro = FILTROS_RAREZA.find(f => f.valor === valor) || FILTROS_RAREZA[0];
  if (!filtro.minimo) return true;
  const tramo = tramoDe(species);
  return tramo !== null && tramo >= filtro.minimo;
}
