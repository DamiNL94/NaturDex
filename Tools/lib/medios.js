'use strict';
/*
 * medios.js — qué MEDIO exige un código HIC y qué medio declara la ficha de una especie.
 *
 * El problema que resuelve
 * -----------------------
 * El vínculo especie↔hábitat se construye hoy con una sola regla: **una ocurrencia de GBIF dentro
 * del polígono**. Para un matorral de 3.000 ha eso funciona; para un hábitat que es una cinta de
 * treinta metros —un manantial petrificante, una charca temporal, un cauce— no mide nada, porque
 * cualquier registro tomado al pasar por el sendero de al lado cae dentro. El resultado se ve a
 * simple vista en Carrascoy y El Valle: el hábitat 7220 (manantiales petrificantes con formación de
 * tuf) tenía fichadas la ardilla roja, el algarrobo, el tomillo blanco y el esparraguera de monte.
 *
 * Ninguna de esas especies vive en un manantial, y el propio repositorio ya lo sabe: la ficha
 * UNIVERSAL de cada una declara dónde vive («Tomillares y matorral raso sobre suelos calizos
 * secos»), y el código HIC declara de qué medio es ese hábitat. Cuando las dos afirmaciones se
 * contradicen, el enlace es ruido espacial y no pertenencia. Este módulo es el que sabe leer las
 * dos y decidir si se contradicen — y **no inventa nada**: cruza dos campos que ya estaban escritos.
 *
 * Está en `lib/` y no dentro de la herramienta que lo usa porque la tabla HIC→medio es dato
 * UNIVERSAL, del mismo orden que `data/hic-nombres.json`: el 7220 es un manantial en Murcia y en
 * Girona. La auditoría lo usa para revisar lo ya escrito y la selección de un espacio nuevo debería
 * usarlo para no escribirlo; dos copias divergirían a la primera, que es la regla nº 1 de
 * Tools/CLAUDE.md.
 *
 * Lo que este módulo NO hace
 * --------------------------
 *   · No decide solo: devuelve `evaluable: false` en cuanto le falta la mitad del cotejo (una ficha
 *     sin texto de hábitat, un HIC que no está en la tabla, un taxón que la propia ficha declara
 *     generalista). «No he sabido decidir» y «no se contradicen» son dos respuestas distintas y solo
 *     la segunda afirma algo.
 *   · No mira ocurrencias ni abundancia: de eso va el barrido de GBIF, que es la otra mitad de la
 *     auditoría.
 */

/*
 * Tabla HIC → medio. Cubre los códigos presentes hoy en el catálogo más los vecinos evidentes de
 * cada familia, que es lo que evita que ampliar a una provincia nueva deje huecos en silencio.
 * Un código ausente devuelve `null` y el cotejo se declara NO evaluable: exactamente lo contrario
 * de lo que pasa en `hic-nombres.json`, donde el hueco se colaba (ver runbook/TRAMPAS-CONOCIDAS.md).
 *
 * Los medios son once y describen la CONDICIÓN que define el hábitat, no su fisonomía:
 *   marino    · fondo o columna de agua MARINA, por debajo de la línea de costa
 *   acuatico  · agua libre, cauce o surgencia permanente
 *   higrofilo · suelo húmedo o freático somero: riberas, prados juncales, tarayales
 *   salino    · sustrato salino o hipersalino: saladares, estepas salinas, matorral halófilo
 *   costero   · primera línea de costa: acantilado marino, arribazón de la playa
 *   dunar     · arena móvil o fijada
 *   yesos     · sustrato de yeso (gipsícola)
 *   rupicola  · roca desnuda: fisuras, pedreras, cuevas
 *   forestal  · bosque cerrado
 *   matorral  · matorral y garriga sobre suelo seco
 *   pastizal  · pastos y prados sobre suelo seco o somero
 */
const MEDIO_POR_HIC = {
  // 11xx · MARINOS. La «regla marina» del rollout los retira de la Capa 2, así que hoy no hay
  // ninguno cartografiado en ningún espacio; están aquí de todas formas porque la tabla se consulta
  // también para decidir el medio de una FICHA, y un código ausente se declara «no evaluable» — que
  // es justo el silencio que dejó a la *Posidonia oceanica* colgada de cinco matorrales.
  1110: 'marino', 1120: 'marino', 1130: 'marino', 1140: 'marino', 1160: 'marino', 1170: 'marino',
  // 1xxx · costa, saladares y estepas salinas
  1150: 'salino', 1210: 'costero', 1240: 'costero', 1250: 'costero',
  1310: 'salino', 1410: 'salino', 1420: 'salino', 1430: 'salino', 1510: 'salino',
  1520: 'yesos',
  // 2xxx · dunas
  2110: 'dunar', 2120: 'dunar', 2210: 'dunar', 2220: 'dunar', 2230: 'dunar', 2240: 'dunar',
  2250: 'dunar', 2260: 'dunar', 2270: 'dunar',
  // 3xxx · aguas continentales
  3140: 'acuatico', 3150: 'acuatico', 3160: 'acuatico', 3170: 'acuatico',
  3250: 'acuatico', 3260: 'acuatico', 3270: 'acuatico', 3280: 'acuatico', 3290: 'acuatico',
  // 4xxx / 5xxx · brezales y matorrales
  4090: 'matorral', 5110: 'matorral', 5210: 'matorral', 5220: 'matorral', 5330: 'matorral',
  // 6xxx · pastos y prados
  6110: 'pastizal', 6160: 'pastizal', 6170: 'pastizal', 6210: 'pastizal', 6220: 'pastizal',
  6310: 'pastizal', 6410: 'higrofilo', 6420: 'higrofilo', 6430: 'higrofilo', 6510: 'pastizal',
  // 7xxx · turberas y manantiales
  7110: 'acuatico', 7140: 'acuatico', 7210: 'acuatico', 7220: 'acuatico', 7230: 'acuatico',
  // 8xxx · roquedos
  8130: 'rupicola', 8210: 'rupicola', 8220: 'rupicola', 8230: 'rupicola', 8310: 'rupicola',
  // 9xxx · bosques (los de ribera van como higrófilos: los define el agua freática, no el arbolado)
  9120: 'forestal', 9150: 'forestal', 9230: 'forestal', 9240: 'forestal', 9260: 'forestal',
  9320: 'forestal', 9330: 'forestal', 9340: 'forestal', 9380: 'forestal',
  9430: 'forestal', 9530: 'forestal', 9540: 'forestal', 9560: 'forestal', 9570: 'forestal',
  9580: 'forestal',
  '91B0': 'higrofilo', '91E0': 'higrofilo', '92A0': 'higrofilo', '92B0': 'higrofilo',
  '92D0': 'higrofilo',
};

/*
 * Pares de medios que NO se contradicen. Se declaran una vez y el módulo cierra la relación en las
 * dos direcciones al cargarse: la primera versión los escribió a mano por medio y salió asimétrica
 * —«salino admite higrófilo» sin su recíproco—, con lo que un tarayal (92D0, higrófilo) daba
 * contradicción con el taray, que declara suelos salinos. Un par que solo vale en un sentido es
 * siempre un descuido: la compatibilidad ecológica no tiene dirección.
 *
 * La lista es deliberadamente generosa. Esta tabla solo puede quitar enlaces, así que un par de más
 * conserva un enlace dudoso —que se anota igual— y un par de menos retira uno bueno.
 */
const PARES_COMPATIBLES = [
  ['acuatico', 'higrofilo'],
  ['higrofilo', 'salino'], ['higrofilo', 'pastizal'], ['higrofilo', 'forestal'],
  ['salino', 'costero'], ['salino', 'dunar'], ['salino', 'matorral'], ['salino', 'pastizal'],
  ['costero', 'dunar'], ['costero', 'rupicola'], ['costero', 'matorral'],
  ['dunar', 'matorral'], ['dunar', 'pastizal'], ['dunar', 'forestal'],
  ['yesos', 'matorral'], ['yesos', 'pastizal'], ['yesos', 'salino'],
  ['rupicola', 'matorral'], ['rupicola', 'pastizal'], ['rupicola', 'forestal'],
  ['forestal', 'matorral'], ['forestal', 'pastizal'],
  ['matorral', 'pastizal'],
];

const COMPATIBLES = PARES_COMPATIBLES.reduce((acc, [a, b]) => {
  (acc[a] = acc[a] || []).push(b);
  (acc[b] = acc[b] || []).push(a);
  return acc;
}, {});

/*
 * Léxico con el que se lee el medio que la ficha universal declara en `habitat` (y, de refuerzo, en
 * `group`). Son los términos que usan de verdad las fichas del catálogo, no un vocabulario teórico:
 * salieron de recorrer los 784 textos que hay escritos.
 *
 * El orden importa poco porque se acumulan todos los medios que el texto declare —una ficha puede
 * decir «ramblas y laderas pedregosas» y declarar dos—, y basta con que UNO sea compatible para que
 * el enlace no se considere contradictorio. Ese sesgo es deliberado: la auditoría solo debe retirar
 * lo que no tiene defensa posible.
 */
const LEXICO = [
  // `marino` va PRIMERO y es deliberadamente estrecho: solo lo que está por debajo de la línea de
  // costa. La entrada `costero` de abajo llevaba la palabra suelta «marino», así que «fondos marinos
  // arenosos» se leía como COSTERO —y costero es compatible con matorral, dunar y rupícola—, que es
  // como una fanerógama marina acabó colgando de cinco hábitats terrestres sin que nada se quejara.
  // Medido antes de tocarlo: la única ficha del catálogo que dependía de esa palabra suelta era
  // justamente la *Posidonia*; las once aves marinas siguen leyéndose como costeras por «aguas
  // costeras», «litoral» o «playas», que es lo que les corresponde.
  ['marino', /fondos? marinos?|praderas? submarin|submarin|bent[óo]nic|pel[áa]gic|infralitoral|circalitoral|mar abierto|aguas marinas|medio marino/i],
  ['acuatico', /\bagua|acu[áa]tic|arroyo|r[íi]os?\b|riacho|cauce|manantial|surgencia|fuente|laguna|lagunaj|charca|balsa|estanque|embalse|tobas?\b|turber|encharca|inundad|sumergid|palustre|freát/i],
  ['higrofilo', /h[úu]med|riberen|de ribera|ribera|soto|juncal|carrizal|tarayal|choper|salguer|alamed|higr[óo]fil|vaguada|umbr[íi]a h[úu]meda|prados? h[úu]med/i],
  ['salino', /salin|salobre|saladar|hal[óo]fil|halonitr[óo]fil|marisma|almarjal|sebkha|sal\b/i],
  ['costero', /acantilado|litoral|costa|costero|arribaz[óo]n|espray marino|primera l[íi]nea de mar|playas?/i],
  ['dunar', /duna|arenal|arenas? litoral|arenas? m[óo]vil/i],
  ['yesos', /yeso|gips[íi]col|gipsó?f/i],
  ['rupicola', /roqued|rup[íi]col|casmof[íi]t|fisura|grieta|cortado|cantil|pedreg|pedrer|glera|canchal|cueva|sima|paredes? rocosa/i],
  ['forestal', /bosque|pinar|encinar|carrascal|robled|quejigar|sabinar arb[óo]re|arbolado|floresta|umbr[íi]a arbolada/i],
  ['matorral', /matorral|tomillar|romeral|garriga|coscojar|espartal|jaral|retamar|albardinal|espinar|matorrales|arbustiv/i],
  ['pastizal', /pastizal|pasto\b|pastos|prado|majadal|c[ée]sped|herbaz|erial|barbecho|rastrojo|claros? de/i],
];

/*
 * Y las fórmulas con las que una ficha dice «esta especie vale para casi cualquier sitio». Un zorro
 * junto a un río no es una contradicción: es un zorro. Sin esta puerta, la primera versión de la
 * auditoría proponía retirar *Vulpes vulpes* de un cauce citando como motivo la palabra «bosque» de
 * su propia ficha, que empieza diciendo «prácticamente cualquier ambiente».
 */
const GENERALISTA = /pr[áa]cticamente cualquier|cualquier ambiente|todo tipo de|todo tipo de ambientes|muy diversos|gran variedad|ubiquist|generalista|amplio rango|se adapta a/i;

// Las claves de los medios son ASCII para que valgan de identificador; lo que se lee en un informe
// (o algún día en la app) es esto.
const NOMBRE_MEDIO = {
  acuatico: 'acuático', higrofilo: 'higrófilo', salino: 'salino', costero: 'costero',
  dunar: 'dunar', yesos: 'de yesos', rupicola: 'rupícola', forestal: 'forestal',
  matorral: 'de matorral', pastizal: 'de pastizal',
};

/** El medio que exige un código HIC, o `null` si el código no está en la tabla. */
function medioDeHic(code) {
  if (code === null || code === undefined) return null;
  return MEDIO_POR_HIC[String(code).trim().toUpperCase()] || MEDIO_POR_HIC[String(code).trim()] || null;
}

/** Los medios que declara un texto de ficha. Devuelve un array, posiblemente vacío. */
function mediosDeTexto(texto) {
  const t = String(texto || '');
  if (!t.trim()) return [];
  return LEXICO.filter(([, re]) => re.test(t)).map(([medio]) => medio);
}

/** ¿Son compatibles dos medios? El mismo medio siempre lo es consigo mismo. */
function sonCompatibles(a, b) {
  if (!a || !b) return true;
  if (a === b) return true;
  return (COMPATIBLES[a] || []).includes(b);
}

/**
 * El cotejo: ¿contradice la ficha de esta especie el medio que exige este código HIC?
 *
 * `texto` es lo que la ficha universal declara sobre dónde vive la especie (`habitat`, y de refuerzo
 * `group`). Devuelve siempre las tres piezas que hacen falta para escribir el motivo en el informe:
 * el medio del hábitat, los que declara la ficha y si la respuesta es afirmable.
 */
function cotejaMedio(code, texto) {
  const medioHabitat = medioDeHic(code);
  const base = { medioHabitat, mediosFicha: [], evaluable: false, contradice: false, motivo: null };
  if (!medioHabitat) return { ...base, motivo: `el código HIC ${code} no está en la tabla de medios` };
  if (!String(texto || '').trim()) return { ...base, motivo: 'la ficha no declara dónde vive la especie' };
  if (GENERALISTA.test(texto)) return { ...base, motivo: 'la ficha declara un taxón generalista' };

  const mediosFicha = mediosDeTexto(texto);
  if (!mediosFicha.length) return { ...base, motivo: 'el texto de la ficha no nombra ningún medio reconocible' };
  if (mediosFicha.some(m => sonCompatibles(medioHabitat, m))) {
    return { ...base, mediosFicha, evaluable: true, contradice: false };
  }
  return {
    ...base, mediosFicha, evaluable: true, contradice: true,
    motivo: `el hábitat es de medio ${NOMBRE_MEDIO[medioHabitat] || medioHabitat} y la ficha declara ` +
      `un medio ${mediosFicha.map(m => NOMBRE_MEDIO[m] || m).join(' y ')}`,
  };
}

/*
 * Los medios en los que un enlace derivado de ocurrencias NO se sostiene solo, porque el polígono es
 * una cinta o un punto dentro de una matriz de otra cosa: cualquier registro tomado al lado cae
 * dentro. Es la lista sobre la que la auditoría se atreve a retirar.
 *
 * Está en UNO a propósito, y no es pereza. Se probó con los diez y la contradicción salía a cientos
 * en el resto de medios, casi toda falsa: el 1430 se llama «matorrales halonitrófilos» y por tanto
 * una ficha que declara «matorral» no lo contradice; el 8210 son fisuras de roca donde crece el
 * mismo *Sedum* del pastizal calcáreo de al lado. Fuera del agua, la fisonomía del hábitat y el
 * medio del taxón se solapan tanto que el cotejo deja de discriminar — y una lista de avisos que es
 * ruido en sus nueve décimas partes no la lee nadie. El agua no tiene ese problema: o hay agua o no.
 *
 * `marino` entra el 2026-08-29 por ese mismo argumento y no por otro: **o hay mar o no lo hay**. Una
 * fanerógama que vive en fondos de hasta 40 m no tiene defensa posible colgando de un espartal, y
 * aquí no hay solape de fisonomía que valga. Salió al mirarlo a mano: la *Posidonia oceanica* estaba
 * enganchada a **cinco** hábitats terrestres en Cabo Cope y a **diez** en San Pedro del Pinatar —
 * matorral, dunas, saladar y hasta el tarayal del 92D0—, ninguno de los dos espacios tiene un solo
 * HIC marino cartografiado, y la auditoría no se quejaba por dos motivos encadenados: la palabra
 * suelta «marino» del léxico costero leía «fondos marinos» como COSTERO, y costero es compatible con
 * matorral, dunar y rupícola. Dos silencios sumados dan quince enlaces falsos que nadie podía ver.
 */
const MEDIOS_EXIGENTES = ['acuatico', 'marino'];

/*
 * Y la lista simétrica, que hace falta porque el cotejo NO es simétrico en la práctica.
 *
 * `MEDIOS_EXIGENTES` mira el medio del HÁBITAT, y con el agua eso basta: el caso que motivó la
 * auditoría es un manantial —hábitat acuático— con un tomillo colgado. Con el mar pasa justo al
 * revés: el hábitat es un espartal o una duna, perfectamente terrestre, y **la que es marina es la
 * FICHA**. Mirando solo el lado del hábitat, los quince enlaces de la *Posidonia* seguían sin
 * retirarse aunque el medio ya se leyera bien.
 *
 * Solo entra `marino`, y no `acuatico`, por un motivo medido: hay fichas cuyo campo `habitat` no
 * describe dónde vive la especie sino que trae pegado el NOMBRE de un HIC («Ríos mediterráneos con
 * Glaucium flavum»), y por ese lado el léxico lee «acuático» sobre un texto que no habla de la
 * especie. Retirar con esa entrada sería actuar sobre un dato corrupto. La lectura `marino`, en
 * cambio, sale de doce fichas del catálogo y las doce son marinas de verdad.
 */
const MEDIOS_EXIGENTES_FICHA = ['marino'];

module.exports = {
  MEDIO_POR_HIC, COMPATIBLES, LEXICO, GENERALISTA, MEDIOS_EXIGENTES, MEDIOS_EXIGENTES_FICHA, NOMBRE_MEDIO,
  medioDeHic, mediosDeTexto, sonCompatibles, cotejaMedio,
};
