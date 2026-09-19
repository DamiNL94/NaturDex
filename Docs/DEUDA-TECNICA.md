# Deuda técnica, por orden de rentabilidad

Cada una se paga mejor ahora que en el espacio número treinta.

1. **Tres espacios no tienen transcrito su plan de gestión, y desde el 2026-08-16 eso decide el
   catálogo entero, no solo las aves.** Son **Carrascoy y El Valle, Cabo Cope y Cuatro Calas**.
   > **2026-08-28 (b): el único que tenía documento ya está TRANSCRITO, así que en Murcia esta deuda
   > se queda sin nada que hacer.** El Decreto n.º 299/2010 se leyó y se transcribió el mismo día:
   > **81 taxones** —7 anfibios, 4 reptiles, 11 aves, 9 mamíferos y 50 de flora del Catálogo
   > Regional— en las entradas de **Cabo Cope** y de **Sierra de las Moreras**, las dos, porque el
   > plan cubre a las dos. Y va con **exigeConstancia**, que aquí no es precaución genérica:
   > el propio plan cifra su ámbito en ~510 km² y a Cabo Cope le asigna **1**. Sin ese campo, el
   > nivel 1 metería en el catálogo de un macizo costero de 1 km² toda la fauna y la flora de una
   > sierra que está a 20 km — el desastre de Gebas, otra vez.
   >
   > De los 81, Cabo Cope ya ficha 40 y Sierra de las Moreras 26. Lo que el anexo cambia se verá al
   > regenerar la selección de esos dos espacios, que es la deuda nº 24; hasta entonces es respaldo
   > documental escrito, no fichas nuevas.
   >
   > **APLICADO ese mismo día, en la sesión (b)**, que es cuando el respaldo llega a las fichas.
   > Moreras **64 → 66** con **once especies subiendo de nivel 2 a nivel 1** y 31 con evidencia
   > `anexo_normativo`; Cabo Cope **162 → 193** y su **primera selección versionada**. GBIF
   > corrobora 23 de los 81 en Moreras y 39 en Cabo Cope; el resto queda en `anexo_sin_constancia`,
   > que es lo que `exigeConstancia` tenía que hacer — **ninguna especie ha entrado por nivel 1 a
   > secas**. Y *Enneapogon persicus*, la que el plan da por «posible», se queda fuera de Moreras y
   > entra en Cabo Cope, donde GBIF la registra: ha decidido la puerta, no nadie. Detalle en
   > `rollout/sesiones/2026-08-28-b.md`.
   >
   > **El PDF oficial sigue sin bajarse** —el CAPTCHA de Radware alcanza a murcianatural y al BORM—:
   > el texto se leyó de una recopilación de legislación ambiental que publica el plan íntegro, y por
   > eso su entrada dice que el número y la fecha del boletín NO están comprobados. Cotejarlo
   > contra el BORM es trabajo de una sesión, no un rehacer.

   > **2026-08-28: los tres están ya RESUELTOS COMO PREGUNTA, y solo uno tiene documento que
   > transcribir.** Leído entero el índice oficial de planificación Red Natura 2000 de la región
   > (`murcianatural.carm.es/web/guest/pgrednatura`): son **once planes**, dos de ellos «en
   > tramitación», y de ahí salen las tres respuestas.
   > · **Carrascoy** — ya estaba: su PORN existe, está leído entero y **no enumera especies**
   >   (deuda nº 21, `inventarioDeEspecies: false`). No hay nada que transcribir.
   > · **Cabo Cope** — **el documento existe y ya tiene nombre**: el **Decreto n.º 299/2010**, Plan
   >   de Gestión y Conservación de la **ZEPA Almenara, Moreras y Cabo Cope**. Es lo que faltaba
   >   —«el documento sigue sin localizar» decía este apartado—, y **es el paso barato hecho**.
   >   Queda abrirlo: no se ha podido, y el motivo va abajo.
   > · **Cuatro Calas** — **no hay plan, y ahora consta.** Es la respuesta a la pregunta que dejó
   >   abierta el 2026-08-22 («la exención del PORN no implica que no haya plan; mira si su LIC llegó
   >   a declararse ZEC»): ninguno de los once planes cubre su LIC **ES6200010** ni su ZEPA
   >   **ES0000507**. Su 47 % de fichas sostenidas solo en GBIF es el techo alcanzable hasta que se
   >   apruebe uno, y **eso no es trabajo pendiente: es un hueco de la fuente**.
   >
   > **Y el Decreto 299/2010 corrige de paso una conclusión escrita sobre un CUARTO espacio.** El
   > 2026-08-22 se dio a **Sierra de las Moreras** por espacio sin plan porque la Ley 4/1992 la
   > declaró «sin precisar» PORN. Sigue siendo cierto — y no basta: comparte con Cabo Cope la **ZEPA
   > ES0000261**, y esa ZEPA tiene plan desde 2010. La exención del PORN no dice nada de las otras
   > figuras, que es exactamente la lección que ya había dejado el Humedal del Ajauque.
   >
   > **Lo que bloquea seguir, y no es una decisión sino la red:** el antibot de Radware de
   > `murcianatural.carm.es` pasó ese día de responder 302 intermitentes a servir un **CAPTCHA** de
   > `validate.perfdrive.com` para toda la IP, y el bloqueo alcanzó también a `www.borm.es`, que va
   > por el mismo gestor. Un CAPTCHA no se resuelve automáticamente. Así que la entrada de
   > `data/normativa-espacios.json` dice que el plan **existe** y **NO** lleva `inventarioDeEspecies`:
   > afirmar que enumera —o que no— sería inventarlo. Descargarlo y transcribirlo queda para una
   > sesión con otra salida a Internet, y es lo único que le queda a este apartado en Murcia.
   > **Sierra Espuña sale de la lista el 2026-08-22 (c), y no hizo falta ni el índice.** Su PORN es
   > el **Decreto n.º 13/1995, de 31 de marzo** (BORM n.º 85, de 11 de abril de 1995), y es **el
   > mismo de los Barrancos de Gebas** —el decreto aprueba el plan de los dos y declara el Paisaje
   > Protegido—; está enlazado desde la ficha del espacio en murcianatural. Descargado, citado en
   > `data/normativa-espacios.json` y **transcrito entero**: 188 especies en
   > `data/anexos-normativos.json`, bajo la entrada de Gebas. Para Sierra Espuña queda solo abrirle
   > su propia entrada y regenerar su Capa 3, y ahí el ámbito **no** desborda —el Parque Regional es
   > el 90 % de las 19.679 ha del plan—, así que es el trabajo más rentable que queda en Murcia: sus
   > 188 fichas se apoyan hoy en el formulario de la ZEPA ES0000173. Su 27 % de fichas sostenidas
   > solo por GBIF, que se mide más abajo, es de antes de esto.

   > **Y desde el 2026-08-22 el paso 0 ya no es una búsqueda a ciegas.** Buscando el plan del Humedal
   > del Ajauque apareció el índice que faltaba:
   > **`murcianatural.carm.es/web/guest/pgrednatura`** lista **todos** los planes de gestión de la
   > región con su enlace, y de cada uno sale la cita del boletín y el PDF. Hacía falta porque al
   > BORM no se llega sin índice **por partida doble**: su endpoint numera por anuncio y año, y
   > encima estos planes van en **SUPLEMENTOS, que no aparecen en el sumario de ningún boletín
   > ordinario** —barridos los 308 sumarios de 2022 y 2023 buscando el Decreto 252/2022 sin un solo
   > resultado—. Ojo también con el antibot de Radware de ese host: con peticiones seguidas devuelve
   > 302; espaciadas y con cabeceras de navegador, responde.
   >
   > **Subió de precio el 2026-08-16.** Con el orden de prioridad nuevo —legislación → EIDOS → GBIF,
   > regla nº 3 del `CLAUDE.md`— el plan de gestión pasó de ser «la evidencia más fuerte» a ser **la
   > puerta de entrada del nivel 1**, y un espacio sin plan transcrito se queda solo con lo que
   > respalden el formulario del sitio, la figura legal y el Atlas. Se ve en la medición: los cuatro
   > espacios **con** anexo transcrito tienen entre el 8 % y el 33 % de fichas sostenidas solo por
   > GBIF; los cuatro **sin** anexo, entre el 33 % y el 51 %. Cuatro Calas es el peor caso, con la
   > mitad del catálogo colgando de avistamientos sueltos. Transcribir los planes que faltan
   > —Carrascoy, Cabo Cope, Cuatro Calas y Sierra Espuña— es hoy el trabajo más rentable del rollout.
   >
   > **Vuelto a medir el 2026-08-22 sobre catorce espacios: 331 de 2.094 (16 %).** La cifra baja porque
   > los seis espacios dados de alta desde entonces llegan con su plan transcrito —o con el «no hay
   > plan» escrito en la norma, que es Sierra de las Moreras— y ahí el suelo se hunde: San Pedro del
   > Pinatar, Calblanque, Cabezo Gordo y Sierra de las Moreras se quedan en **0**, y el Humedal del
   > Ajauque en **2 de 175**. Arriba siguen los cuatro sin plan (Carrascoy 50 %, Cuatro Calas 47 %,
   > Cabo Cope 34 %, Sierra Espuña 27 %) y, con ellos, **Sierra de la Pila con un 27 % teniendo el
   > suyo transcrito**: su anexo enumera 244 taxones y el catálogo tiene 160 fichas, así que lo que
   > falla ahí no es la puerta sino que su plan inventaría el Parque Regional y buena parte de lo que
   > GBIF ve dentro no está en esa lista. Se mide con `npm run especies:niveles`, y **hay que darle el
   > `atlas.txt`**: sin él la señal `caracteristica` no entra y el N3 sale inflado (331 con Atlas,
   > 476 sin él).
   >
   > **Y el 2026-08-20 se midió el caso extremo, que conviene tener a mano para justificar el
   > gasto: Cabezo Gordo son 58 fichas con su plan transcrito y habrían sido 5 sin él.** El
   > formulario oficial de su ZEC enumera **cinco mamíferos y cero aves**, así que ahí no hay nada
   > más de donde tirar. No es una proporción representativa —es un espacio de 272 ha con un
   > formulario pobrísimo—, pero sí es el suelo al que cae un espacio cuando el plan no está
   > transcrito.

   > **Y el 2026-08-22 apareció el caso contrario, que acota la deuda: hay espacios sin plan porque
   > la ley los eximió de tenerlo.** Sierra de las Moreras se declaró por la **Ley 4/1992**
   > «teniendo en cuenta que **no se precisa** previa elaboración de planes de ordenación de los
   > recursos naturales», y el apartado que sí obliga a iniciar el PORN enumera ocho espacios sin
   > incluirlo. Ahí no hay documento pendiente de localizar, y su catálogo de 64 fichas con **77
   > candidatos caídos por sostenerse solo en GBIF** es el techo alcanzable mientras no se declare
   > la ZEC del LIC ES6200011 con su plan. Conviene comprobar lo mismo en los otros tres paisajes
   > protegidos del apartado DOS de esa ley —**Cuatro Calas**, que es el peor caso medido arriba,
   > **Humedal del Ajauque y Rambla Salada** y **Espacios Abiertos e Islas del Mar Menor**—: si la
   > exención los cubre igual, parte de esta deuda **no es transcribible** y hay que decirlo en vez
   > de dejarla contada como trabajo pendiente. (Espacios Abiertos ya tiene anexo transcrito por
   > otra vía: el Decreto n.º 259/2019 del Mar Menor.)
   >
   > **Y de esos tres, el Humedal del Ajauque ya está respondido, en la otra sesión de este mismo
   > día: la exención NO lo deja sin inventario.** La Ley 4/1992 lo declaró sin exigirle PORN, pero
   > el plan llegó después y por otra puerta —la de la ZEC—, en el **Decreto n.º 252/2022**, cuyo
   > volumen II §1.2 enumera **210 taxones** y está transcrito. Lección para los otros dos: la
   > exención del PORN **no** implica que no haya plan; hay que mirar además si su LIC llegó a
   > declararse ZEC, porque el plan de gestión de la ZEC inventaría igual. Cuatro Calas es
   > justamente el peor caso medido y su LIC es la **ES6200010**.

   Lo que sigue es el diagnóstico anterior, que sigue valiendo para las aves. Desde que el ave entra
   por respaldo de sitio
   ([`runbook/AVES.md`](runbook/AVES.md)), el anexo normativo dejó de ser «la evidencia más fuerte» y
   pasó a ser, en la práctica, **la única fuente que da un catálogo de aves completo**: el Formulario
   Normalizado de Datos de un sitio Red Natura 2000 solo declara las de interés comunitario —su
   sección 3.3, la de «otras especies importantes», está vacía en la práctica totalidad de los sitios
   españoles— y su perímetro no es el del espacio protegido. El resultado se mide sin ambigüedad: los
   tres espacios con el plan transcrito conservan **46, 61 y 66** aves; los cinco que solo tienen
   formulario, **17, 18, 34, 40 y 48**. Sierra de la Pila son 8.800 ha de sierra con 17 aves fichadas.
   `Tools/catalogo-nacional/data/normativa-espacios.json` cubre hoy **siete documentos** —el Altiplano,
   el PORN de la Sierra de la Pila y su PRUG, los dos PORN de 1995 de Calblanque y San Pedro, el Plan
   del Mar Menor, el Decreto 252/2022 de los relieves centro-orientales y el PORN de 1995 de Sierra
   Espuña-Gebas—, y **el documento de Carrascoy, Cabo Cope y Cuatro Calas sigue sin localizar**, que
   es el primer paso y el barato — y desde el 2026-08-22 hay índice para hacerlo (arriba). Bajar el
   umbral NO es una
   alternativa: devolvería el ruido de vuelo que este cambio quitó.
2. ~~**`murcia_status` está atado a Murcia.**~~ — **PAGADA el 2026-08-27.** El campo es
   `regional_status` + `regional_ccaa` en las siete puntas, las **2.945 fichas** están migradas y la
   tabla comunidad → norma existe. Con esto, el rollout nacional ya no tropieza a nivel de campo.
   > **La tabla es una LISTA por comunidad, no una norma, y Murcia demuestra por qué.** El apartado
   > pedía «una tabla comunidad → norma»; al escribirla salió que no cabe: la flora de Murcia va por
   > el **Decreto n.º 50/2003** y su fauna por la **Ley 7/1995**, dos normas con dos escaleras de
   > categorías distintas —la de fauna añade «Extinguida»—, más el **Decreto n.º 70/2016**, que
   > cataloga un solo taxón (la malvasía cabeciblanca). Una tabla de una norma por comunidad se habría
   > quedado corta en la primera. Vive en `Tools/catalogo-nacional/data/catalogos-regionales.json`,
   > con cada título copiado literal de lo que devuelve EIDOS.
   >
   > **Y lo que más valía no era el renombrado sino lo que destapó: la frase de negación se escribía
   > a ciegas.** «No incluida en el Catálogo Regional de especies protegidas (X)» es una AFIRMACIÓN
   > sobre el catálogo de X, y `build-species-n2.js` la escribía para **cualquier** comunidad sin
   > haber mirado nunca si esa comunidad tiene catálogo, cómo se llama ni cuántos son. Con Murcia
   > colaba porque el piloto era Murcia; en la comunidad número dos habrían sido cientos de fichas
   > afirmando algo que nadie ha comprobado, sin que fallara nada — el §2 del `CLAUDE.md` exacto.
   > Ahora la negación **exige** que la comunidad esté dada de alta; si no lo está, el campo se queda
   > vacío y la herramienta lo avisa al correr.
   >
   > **`regional_ccaa` no estaba en la lista de este apartado y es la mitad del arreglo.** El
   > apartado proponía `regional_status` + `regional_norma`, pero la norma **ya viaja dentro del
   > texto** —«Vulnerable (Decreto n.º 50/2003…)»— y otra vez en `rarity_local_basis`: una tercera
   > copia sería una más que puede divergir. Lo que de verdad faltaba es **a qué comunidad se
   > refiere** el estado, porque sin eso la ficha no se puede leer fuera de contexto: la app rotulaba
   > esa fila con «Región de Murcia» escrito a mano en el HTML. Y va en la FICHA, no en el espacio,
   > porque la misma especie puede estar catalogada distinto en dos comunidades.
   >
   > **Las siete puntas** (el apartado enumeraba seis y faltaba una): `schema.sql` + la migración,
   > `park_payload.php`, `admin.php` (3 sentencias + el `bind_param`), `fields.ts`,
   > `render/detalle.js`, la lista `LOCALES` de `sync-species-catalog.js`,
   > `fix-estado-conservacion-iepnb.js` — y **`build-park-sql.js`**, que es quien vuelca la ficha de
   > un espacio nuevo. Además `eidos-diff.js`, que tenía la clave `murcia` en su estructura interna
   > teniendo ya `--ccaa`, y `build-species-n2.js`, `mide-niveles-puerta.js` y `rareza-legal.js`.
   >
   > **Y `seed.sql`, que no estaba en ninguna lista.** No trae `CREATE TABLE`: se carga sobre las
   > tablas de `schema.sql`, así que con la columna renombrada allí y el nombre viejo en sus 174
   > `INSERT` una instalación limpia habría abortado con ERROR 1054. Renombrado. `snapshot.sql`
   > **no** se toca: trae su propio DDL, es el retrato de una base anterior, y restaurarlo y pasarle
   > `migrations.sql` detrás deja la columna con el nombre nuevo y los datos intactos.
   >
   > La migración de las fichas la hace `npm run especies:regional`
   > (`migra-estado-regional.js`), **in situ y conservando la posición de la clave** dentro del
   > objeto: regenerar con `build-species-n2.js` es la trampa nº 6, y reconstruir la ficha con otro
   > orden produce un diff de 2.945 fichas que entierra lo que sí cambia. Pendientes de aplicar:
   > `Database/migrations.sql` (renombra la columna **conservando los textos**) y
   > `Database/regional-ccaa.sql` (16 `UPDATE`, uno por espacio).
   >
   > **Lo que NO se ha tocado, y hay que decirlo:** los **85 textos distintos** que hoy tiene el
   > campo. Varios no son estado legal sino prosa del piloto —«Fauna protegida; gecko común en
   > roquedos y muros», «Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope)», «No catalogada;
   > propia de las dunas del parque»—, y uno de ellos mete además un dato **local** en un campo que
   > cita una norma. Limpiarlos es ir ficha a ficha con EIDOS delante, y es trabajo aparte.

   El diagnóstico anterior:

   **`murcia_status` está atado a Murcia.** Es el bloqueo real del rollout nacional a nivel de campo:
   cada comunidad tiene su propio catálogo de especies amenazadas. Hay que renombrarlo a algo como
   `regional_status` + `regional_norma`, y tocar exactamente: `Database/schema.sql` y una migración,
   `Backend/Lib/park_payload.php:129`, `Backend/Api/admin.php` (3 sentencias),
   `Frontend/Js/render.js:423` (que además tiene la etiqueta «Región de Murcia» escrita a mano),
   `Tools/sync-species-catalog.js` (lista `LOCALES`) y `Tools/catalogo-nacional/fix-estado-conservacion-iepnb.js`.
   Hace falta además una tabla **comunidad → norma** para que el campo no sea texto libre distinto en
   cada espacio. `Tools/eidos-diff.js` ya acepta `--ccaa`.
3. **El pipeline de hábitats no escribe en la BD** — **la parte que BORRABA DATO está pagada el
   2026-08-27; queda la de generar el SQL.** Lo que hacía provisional cualquier cambio del pipeline
   no era que no escribiera en la base: era que **la vuelta desde la base borraba campos que no
   tenían columna**. Eso ya no pasa, y ahora hay una comprobación que lo vigila.
   > **Los dos campos medidos tienen columna**: `species.gbif_occurrences` (el total de la especie en
   > el espacio, la huella del filtro de presencia — no confundir con
   > `species_habitats.gbif_occurrences`, que es el recuento de un solo polígono y ya existía) y
   > `habitats.origen` (la procedencia del recinto, regla nº 1). El exportador saca ahora el `origen`
   > **de la base**, no del geojson que hubiera delante: «conservarlo del fichero anterior» no es
   > tenerlo — en una máquina sin ese fichero, o en el primer export de un espacio, se perdía igual.
   >
   > **Y la comprobación encontró TRES pérdidas más que la medición a mano de 2026-08-11 no vio.**
   > `npm run ida-y-vuelta` (`coteja-ida-y-vuelta.js`) compara las claves que hay escritas en los
   > `park.json` y los `geojson` contra las que emiten `park_payload.php` y `park_export.php`, **sin
   > base de datos** —que es justo por lo que aquella medición no se repitió nunca: exigía una base
   > cargada—. Salieron:
   > · **`fuentes`** — 24 recintos. Son las DOS citas de un recinto fundido por `merge-habitats.js`,
   >   y `source` (una sola) no puede guardarlas. Es dato de procedencia: **columna abierta**.
   > · **`solo_curada`** — 4 recintos. Marca el recinto sin equivalente en la cartografía oficial, o
   >   sea la diferencia entre «esto lo dice el MITECO» y «esto lo añadimos nosotros»: **columna**.
   > · **`gbifBboxSightings`** — 188 fichas, todas de Sierra Espuña. Era el recuento en el BBOX del
   >   espacio, la métrica floja de la que se pasó a `gbifOccurrences`; ninguna herramienta lo
   >   escribía ya y **no lo leía nadie** —ni la app, ni la API, ni el panel—. Abrirle columna habría
   >   sido consagrar una medida que nadie produce, así que se aceptó la pérdida y se dejó escrito
   >   que retirarlo del `park.json` era «otra decisión y va aparte». **Esa decisión se tomó el
   >   2026-09-14**: retirado de las 188 fichas, y con él la entrada de `PERDIDAS_ACEPTADAS`, que
   >   hoy está vacía. Ya no hay pérdida que aceptar.
   >
   > Esa tercera categoría es lo que hace que la comprobación sirva: sale con **código 1** solo
   > mientras quede una pérdida **sin decidir**. Una que se ha mirado se escribe en
   > `PERDIDAS_ACEPTADAS` con su fecha y su motivo, y deja de teñir el informe de rojo — un rojo
   > perpetuo no se lee.
   >
   > El relleno de la base está en `Database/ida-y-vuelta.sql` (**2.770 especies · 149 recintos**),
   > **pendiente de aplicar**, detrás de `migrations.sql`.
   >
   > **Lo que sigue abierto, y son dos cosas distintas:** (1) `adopt-habitats.js` sigue sin generar
   > SQL, así que un cambio suyo no llega a la base hasta que alguien pase `park:sql`; y (2) **el
   > ORDEN**, que la comprobación no mira: el exportador ordena las especies por `is_featured,
   > common_name` y los recintos por `name`, mientras el `park.json` los lleva en el orden del
   > pipeline. Eso no pierde ningún dato pero produce un diff completo que esconde lo que sí cambió,
   > y arreglarlo es decidir cuál de los dos órdenes manda.

   El diagnóstico anterior:

   **El pipeline de hábitats no escribe en la BD.** `adopt-habitats.js` toca `Frontend/` y nada más, así
   que un export desde la API borraría sus cambios sin avisar. Mientras siga así, cualquier cambio suyo
   es provisional (ver [orden de operaciones](runbook/ORDEN-DE-OPERACIONES.md) §4).
   > **Medido el 2026-08-11 (f), y son dos campos con nombre.** Cargada la BD desde cero
   > (`schema` + `seed` + `sierra-de-la-pila-n2.sql`) y regenerado el paquete con
   > `php Tools/export-park.php sierra-de-la-pila`, la ida y vuelta **pierde en silencio**:
   > **`gbifOccurrences`** de cada especie —no tiene columna en `species`; son **767 fichas** en los
   > cuatro espacios que lo llevan— y **`origen`** de cada recinto de `geo/habitats.geojson`, que es
   > justo el campo de procedencia que exige la regla nº 1 del `CLAUDE.md`. Además **reordena**
   > especies, POIs y recintos, así que el diff sale completo y esconde lo que sí cambió.
   > Los contadores cuadran (10/245/15) y ningún error salta: es exactamente el género de fallo del
   > §2 del `CLAUDE.md`. **Quien pulse «Publicar cambios offline» en el AdminPanel dispara esta misma
   > ruta** (`Backend/Lib/park_export.php` es compartido).
4. ~~**Claves externas incoherentes.**~~ — **PAGADA el 2026-08-27.** `npm run taxones:duplicados`
   sale hoy con **0 duplicados y 0 identificadores incoherentes**, y por tanto con código 0. Eran
   nueve valores en siete fichas de **dos** espacios (seis de Cabo Cope, que es el volcado del
   piloto, y el par de *Olea* de Sierra Espuña), y los aplicó
   `Tools/catalogo-nacional/fix-identificadores-incoherentes.js --write --sql`, cuya cabecera lleva
   la decisión de cada caso con la respuesta de la autoridad al lado.
   > **Las dos claves que se daban por irrecuperables no lo eran.** `coteja-nomenclatura.js` decía
   > de la 3064 (FAMILIA Amaranthaceae, 5.039.294 ocurrencias) y de la 2926685 (GÉNERO *Sideritis*,
   > 121.554) que «ningún espacio la ficha con una key de especie, así que no hay de dónde
   > copiarla», y era verdad **dentro del catálogo** y falso fuera: el backbone tiene las dos
   > especies, con otra grafía y con otro género. *Sideritis ibanyezii* Pau —así lo escribe EIDOS—
   > está en GBIF como ***Sideritis ibanezii* Pau**, sin la «y», key **8139235**, ACCEPTED; que es
   > el mismo taxón lo dice el juego de sinónimos de los dos lados (*flavovirens*, *salina*,
   > *ilorcitana*), no el parecido del nombre. Y *Salsola vermiculata* L. es la **3083954**:
   > `matchName()` no la alcanzaba porque el backbone tiene cuatro homónimos más de ese binomio
   > —Brot., M.Bieb., hort.— y ante la ambigüedad GBIF **sube a la familia** en vez de fallar. La
   > lección que se generaliza: un `HIGHERRANK` de GBIF no dice «no existe», dice «no he sabido
   > desambiguar», y la salida es preguntar por el nombre **de la otra autoridad**.
   >
   > **Y una de las «no mecánicas» lo era porque la cabecera del cotejador afirmaba algo falso.**
   > *Anabasis hispanica* estaba clasificada como sinónimo heterotípico intocable con este motivo
   > escrito: «GBIF hunde *A. hispanica* en *A. articulata*, que es otra especie para EIDOS». No lo
   > es: EIDOS mete los dos nombres bajo el **mismo taxonid 1838**, cuyo aceptado es *Anabasis
   > mucronata* (Lag.) C. Vic. Siendo el mismo taxón para la autoridad que manda en el nombre, la
   > clave que cita a GBIF pasa a ser la aceptada de GBIF (5568629, 4.330 ocurrencias frente a las
   > 29 del sinónimo), que además era ya la de otros tres espacios. Corregida la cabecera: **la
   > etiqueta de GBIF dice lo que opina GBIF, no si las dos autoridades discrepan** — eso hay que ir
   > a preguntárselo a EIDOS, taxón a taxón, y es justo por lo que esa clase no se escribe sola.
   >
   > Las otras tres: *Asteriscus maritimus* pasa a la **5385225** (*Pallenis maritima* a rango de
   > especie, ACCEPTED, mismo basiónimo y superconjunto: 11.149 ocurrencias frente a 2.468) sin
   > tocar el nombre, porque EIDOS acepta *Asteriscus* y da *Pallenis* por sinónimo, justo al revés
   > que GBIF; *Sedum sediforme* se reancla del **95304** —que es la subespecie— al **8225**, que es
   > la especie *Petrosedum sediforme* y cuadra con su `gbifSpeciesKey` (4201784), lo que **de paso
   > salda uno de los 43 reanclajes de la deuda nº 36**; y *Olea europaea* subsp. *europaea* se
   > unifica en el par de **especie** (6644 / 5415040) por el motivo que está en la nº 36.
   >
   > **Lo que el fix NO hace, a propósito: rellenar los nulos.** Siete espacios tienen
   > `eidosTaxonId: null` en *Sedum sediforme* y cinco en *Olea*. Solo se sustituye un valor **en
   > conflicto** o que no identifica ninguna especie, que es lo que mide el escáner. Un nulo no
   > miente: dice que nadie lo ha resuelto.
   >
   > El `Database/identificadores-taxonomicos.sql` (9 `UPDATE`) está **pendiente de aplicar**. No
   > hay ninguna fila huérfana que borrar porque no se renombra nada.
5. ~~**`spainStatus` con normas de otras comunidades autónomas.**~~ **PAGADA el 2026-08-10.** Eran 60
   fichas (39 en Sierra Espuña, 21 en Carrascoy) citando una norma autonómica ajena —la Ley 9/1999 de
   Castilla-La Mancha, sobre todo— en un campo que describe el estado legal *en España*.
   > El diagnóstico de que hacía falta «el índice de normas del IEPNB, que no está versionado» **era
   > erróneo**, y por eso la deuda llevaba abierta desde julio. No era falta de datos: era una
   > lectura equivocada de la vista. **EIDOS sirve las filas del Catálogo Regional de Castilla-La
   > Mancha con `ambito: "Nacional"`**, así que filtrar por ámbito —que es lo que hacía el
   > pipeline— las deja pasar. Lo que sí las distingue es que traen `ccaa` relleno, y una norma
   > estatal no tiene comunidad. Corregido en `Tools/lib/eidos.js` (`legalStatus` exige ahora las dos
   > condiciones) y propagado con
   > `build-species-universal.js --refrescar --refrescar-campos spainStatus`. Quedan **0**.
6. **Tabla de reconciliación taxonómica nacional.** Existe la del piloto
   (`out/cabo-cope-puntas-calnegre-reconciliacion.json`, 124 especies); falta acumular todos los
   espacios sin duplicar por `eidos_taxonid`.
   > **Parcialmente cubierta el 2026-08-11.** `build-species-seleccion.js` ya reconcilia **al dar de
   > alta un espacio**: agrupa los candidatos de GBIF por `eidosTaxonId` y elige el nombre que ya use
   > otro parque, así que un espacio nuevo no puede introducir un duplicado. En Sierra de la Pila
   > fueron 8 grupos, dos de ellos la misma especie dos veces *dentro* del espacio (*Sylvia* /
   > *Curruca melanocephala* y *Picus viridis* / *sharpei*). Lo que sigue faltando es la tabla
   > **acumulada** y la limpieza de los 9 identificadores incoherentes del punto 4, que son
   > anteriores y no los arregla este mecanismo.
7. **Completar `hic-nombres.json` y `hic-prioritarios.json`** al entrar en cada provincia nueva. No es
   opcional: un código sin ficha se salta el filtro marino (ver [trampas](runbook/TRAMPAS-CONOCIDAS.md)).
8. **Fotos de florasilvestre.es pendientes de licencia** en Cabo Cope: 13 fichas usadas en el contexto
   de este prototipo educativo. Antes de cualquier uso público hay que confirmar el permiso o
   sustituirlas por equivalentes de licencia libre.
   > **Sigue abierta, pero se ve mejor desde el 2026-08-14.** El visor de imagen (`Js/visor.js`)
   > pinta la atribución **debajo de la foto ampliada**, que es donde más se mira: la cita ya no vive
   > solo en un pie de 11 px al final de la ficha. No paga la deuda —una cita no es un permiso—,
   > pero deja a la vista de quién es cada foto sin tener que buscarlo.
9. ~~**Cero POIs en Sierra Espuña y Cuatro Calas.**~~ **PAGADA**: Cuatro Calas cerró su N3 el
   2026-08-08 (4 POIs) y Sierra Espuña el 2026-08-09 (13). El diagnóstico —«no hay fuente con
   coordenadas descargables»— resultó ser medio cierto y medio pereza: **el plan del espacio estaba
   publicado en PDF y descargable**, y en dos de los cuatro espacios que han cerrado N3 —Carrascoy y
   Sierra de la Pila— es **lo que desbloqueó el nivel**. Lo que sí se confirmó es que el plan no trae
   coordenadas: las pone OpenStreetMap y el hecho lo pone el plan, que es exactamente la cascada
   del §4.2.
10. **El glosario no cubre el vocabulario geológico, y son 32 términos.** Los saca a la luz el arreglo
   del 2026-08-11 (e): `glossary-coverage.js` **no leía las descripciones de los POIs** aunque
   `render/detalle.js:133` las pinta con `.detail-prose`, la clase sobre la que actúa el resaltado, y
   su `LEXICO` no tenía ninguna raíz de tectónica ni estratigrafía. Corregidas las dos cosas, el
   contador pasa de 35 a **67 términos sin definir**. El más repetido **no lo trajo la capa de
   POIs**: `caliza`/`calizas` aparece en **87 fichas** de especies y hábitats que llevan meses
   escritas. Es trabajo editorial —`glossary-coverage.js` no adivina definiciones a propósito— y se
   redacta en el bloque `glosario` de `Database/seed.sql`, seguido de `npm run export:glossary`.
   > **El hueco está ahora a la vista, que era parte del objetivo.** Desde el 2026-08-14 hay una vista
   > «Diccionario» (`Js/diccionario.js`) que enseña los 219 términos definidos y dice en su pie que
   > quedan palabras de las fichas por definir. Quien busque `caliza` y no la encuentre lee que es un
   > hueco conocido, no un fallo del buscador. El trabajo editorial sigue pendiente entero.
11. **Duplicación consciente**: `AdminPanel/src/api.ts` y el cliente de la API del frontend son dos
    implementaciones del mismo contrato. Se mantienen separadas porque son dos aplicaciones distintas
    (React con build vs. módulos ES sin build).
12. **`php Tools/recalculate-account-progress.php` pendiente de ejecutar**, desde el 2026-08-14. Ese
    día se recalibraron cuatro umbrales de `Data/achievements.json` (v3) y entraron tres logros
    nuevos con dos métricas nuevas; el recálculo hay que lanzarlo **al desplegar**, con la BD viva,
    que en aquella sesión no estaba levantada. Nadie pierde nada por el retraso —`evaluateAchievements`
    solo añade, nunca retira, y los cuatro umbrales bajan— pero hasta entonces los logros de las
    métricas nuevas solo los concede la predicción local, no el servidor.
13. **Seis logros territoriales fuera de alcance mientras el catálogo siga en una sola comunidad.**
    Son los de `regionsVisited` y `provincesVisited`: apuntan a la España entera a propósito, y la
    medalla lo dice con el número que saca del registro, así que no engañan a nadie. Se cierra solo
    según avance el rollout; `npm run validate` los lista en cada pasada para que no se olviden.
14. **El Darwin Core Archive no ha pasado por el validador de GBIF.** Está generado y comprobado
    contra sí mismo —identificadores únicos, columnas cuadradas con la cabecera, fechas ISO 8601 con
    huso, coordenadas en rango, `meta.xml` y `eml.xml` bien formados—, y eso **no es** una validación
    de GBIF. Falta pasarlo por el [Data Validator](https://www.gbif.org/tools/data-validator), que
    exige un archivo sobre datos reales y una cuenta; el informe va en `Docs/DARWIN-CORE.md` cuando se
    haga. Con él van dos huecos declarados del propio conjunto: `locationID` **sin el código
    Natura 2000** (la tabla `parks` no lo guarda; vive en el `park.json` empaquetado) y
    `scientificNameID` **vacío** (falta el identificador nomenclatural: IPNI / Index Fungorum).
15. **Las citas sin coordenada no son ocurrencias, y son la mayoría de lo marcado.** Un «visto» sin
    permiso de GPS se queda en `user_progress` y no llega a `user_occurrences`: no dice dónde ocurrió
    nada. Es la decisión correcta para publicar, pero significa que el conjunto científico será
    bastante más pequeño que el progreso de la gente, y conviene medirlo antes de prometerle un
    volumen a nadie. Lo mismo con las citas de invasoras anteriores al 2026-08-15, que salen con el
    hueco dicho en `occurrenceRemarks`.
16. ~~**`habitat-images.js` no filtra la licencia, y `poi-images.js` sí.**~~ — **saldada el
    2026-08-15 (c)**. Y no era teórica: retirar a mano la CC BY-NC-ND de Cuatro Calas no sirvió de
    nada, porque **la siguiente pasada del pipeline volvió a escribirla**. Ahora `habitat-images.js`
    importa `licenciaLibre` de `poi-images.js` —no la copia—, **retira** la portada que no la pasa y
    escribe el motivo en el `imageNote`, que es donde se ve. Se decidió poner el listón en el de los
    POIs y no en el de las especies: la portada se empaqueta en la descarga sin conexión y la app la
    recorta, así que la ND no tiene defensa y la NC tampoco en ese uso. Escribirla destapó tres cosas
    más, las tres arregladas: la licencia **no está en un paréntesis fijo** de la atribución (se miran
    todos y basta con que uno sea de la lista), **la FAL faltaba en la lista blanca** y es libre —sin
    ella se llevaba por delante cuatro portadas buenas de El Carche y Sierra de la Pila—, y la especie
    diagnóstica **se elegía por orden de `speciesIds`**, que ilustraba un encinar con una coscoja.
    Ver ESTADO.md, §"2026-08-15 (c)".
17. **La migración de ocurrencias está probada en MariaDB 10.11, no en MySQL 8.4.** El contenedor del
    proyecto es `mysql:8.4` y ahí no se ha podido levantar en esta sesión. Se escribió a propósito sin
    `LATERAL` ni `CAST(… AS JSON)` para que valga en los dos motores, y en MariaDB pasa dos veces sin
    diff, pero **el primer pase contra el MySQL real hay que mirarlo**, con `npm run db:backup` hecho
    antes.
18. ~~**`playa-Charco`: un `slug` de POI con mayúscula, y es clave única en la BD.**~~ — **hecho en
    el repositorio el 2026-08-25 (b); queda el `UPDATE` de la BD.** Renombrado a `playa-charco` en
    los cuatro sitios del repo a la vez —`park.json` (por `escribeEspacio()`, así que el manifiesto
    sube de versión), `seed.sql`, `snapshot.sql` y `recolocar-pois.sql`— y el quinto, la fila viva,
    va en **`Database/renombra-poi-playa-charco.sql`**, escrito a mano y pendiente de aplicar. El
    aviso de `validate` ya no sale.
    > **El `UPDATE` hace falta y no lo genera nadie**: `build-poi-sql.js` hace UPSERT por `slug`, así
    > que aplicar el N3 con el slug nuevo no renombraría nada — daría de alta un SEGUNDO POI y
    > dejaría el viejo al lado, que es justo la duplicación que esta deuda quería evitar. Va **antes**
    > de cualquier `n3-pois-cabo-cope-puntas-calnegre.sql` posterior, y acota por parque porque el
    > `slug` es único POR PARQUE, no global.
    >
    > `recolocar-pois.sql` está en el histórico de «ya aplicadas», y aun así se corrige: cambiar el
    > literal no altera lo que ese fichero ya hizo, y dejarlo con el slug viejo haría que un futuro
    > relanzamiento se saltara ese POI en silencio.

    El diagnóstico original, que sigue explicando por qué era aviso y no error: lo destapó la
    auditoría del N3 del 2026-08-15 (g). El §4.3.8 pide el id en slug estable —minúsculas, sin tildes,
    guiones— porque es `points_of_interest.slug`, único por parque, y este lleva una `C` mayúscula
    desde el piloto. **No se arregla editando el `park.json`**: el mismo literal está en
    `Database/seed.sql`, en `Database/snapshot.sql`, en `Database/recolocar-pois.sql` y en la fila viva
    de la BD, así que hay que renombrarlo en los cuatro sitios a la vez o el POI se duplica al
    siguiente import. Por eso `validate` lo da como **aviso y no como error**: bloquear el commit por
    una deuda que solo se salda tocando la BD dejaría el repo sin red de seguridad para todo lo demás.
    Es un rato de trabajo, pero hay que hacerlo en el mismo paso que la carga de SQL pendiente.
19. ~~**Sierra de la Pila y Carrascoy y El Valle sobre la métrica de mosaico.**~~ — **PAGADA el
    2026-08-16.** Los dos se regeneraron: Sierra de la Pila pasa de 245 a 246 fichas podando cuatro
    que declaraban cinco hábitats teniendo **una** ocurrencia, y Carrascoy de **245 a 468**. Con
    ellos ya no queda ningún espacio construido sobre la cuenta inflada.
    > **El diagnóstico que traía esta deuda estaba mal en un punto y conviene dejarlo escrito.** Se
    > dijo que el catálogo de Carrascoy «se construyó con el 41 % de los datos» porque `--max-occ`
    > valía 40.000 sobre un bbox de 97.362. La truncadura es real, pero **no es lo que costaba las
    > fichas**: el volcado truncado traía 1.460 especies dentro de los polígonos y el completo trae
    > 1.463. Lo que la truncadura falseaba es el número de **registros por especie**; el salto de
    > fichas lo produce la corrección de la métrica. Dos defectos reales, y se habían mezclado.
20. ~~**La curruca rabilarga sigue partida en dos, aunque el escáner ya la vea.**~~ — **YA ESTABA
    PAGADA; comprobado el 2026-08-25 (b).** Era `Curruca undata` (EIDOS 80931, GBIF 10355796) en unos
    espacios y `Sylvia undata` (80230, 2492949) en otros, y lo mismo con *atricapilla*, *hortensis*,
    *communis* y *borin*. Lo arreglaron `fix-curruca-undata.js` y `fix-nomenclatura-eidos.js` el
    2026-08-17 y **la entrada del ledger se quedó sin cerrar**.
    > Comprobado de tres maneras: los ocho epítetos del grupo (*undata*, *atricapilla*, *hortensis*,
    > *communis*, *borin*, *melanocephala*, *cantillans*, *conspicillata*) están fichados con **un
    > solo género cada uno** en los dieciséis espacios; `npm run taxones:duplicados` no propone
    > ninguna pareja *Sylvia*/*Curruca*; y en el catálogo universal quedan exactamente dos entradas
    > *Sylvia* —*atricapilla* y *borin*—, que **son las correctas**: EIDOS mantiene esas dos en
    > *Sylvia* y mueve las demás a *Curruca*. Que queden nombres del género viejo no es un resto: es
    > lo que dice la autoridad.
    >
    > Vale la pena anotar por qué duró: una deuda cerrada por una corrección puntual **no se cierra
    > sola en el ledger**, y esta llevaba desde el 2026-08-17 pidiendo un trabajo ya hecho.
21. ~~**El PORN de Carrascoy y El Valle no tiene inventario de especies, y conviene que conste.**~~ —
    **PAGADA el 2026-08-25 (b).** Sus tres inventarios —§3.1.2.3 lugares de interés geológico, §3.3
    hitos paisajísticos y §4.4 Tabla 8 de yacimientos— son los que desbloquearon su Fase 3, y ninguno
    enumera fauna ni flora. Mientras no estuviera escrito en `data/normativa-espacios.json`, cada
    sesión que mirara este espacio volvía a abrir el PDF para averiguar lo mismo.
    > Escrito como documento nº 9 del fichero, con `encontrado: true` e **`inventarioDeEspecies:
    > false`**, campo nuevo que el `_regla` del propio fichero explica: sin él «encontrado» se lee
    > como «hay de dónde sacar el catálogo». Es la misma regla que ya aplica el anexo normativo —**un
    > espacio sin entrada no es un espacio sin anexo, es un anexo no consultado**— dicha para el
    > documento.
    >
    > Consecuencia que conviene tener a mano: **la deuda nº 1 de Carrascoy no se salda transcribiendo
    > este plan**, porque no hay nada que transcribir, y su 50 % de fichas sostenidas solo en GBIF no
    > baja por ahí. Lo que sí hay es un sucesor en trámite: el 2026-05-29 el BORM publicó el anuncio
    > 2467 abriendo la consulta pública previa de un PORN nuevo para Carrascoy, El Valle, Altaona y
    > Escalona.
    >
    > **La URL directa del PDF no se escribe**, y es a propósito: la sesión que lo leyó (2026-08-10
    > (d)) no la registró y el 2026-08-25 (b) la ficha del espacio en murcianatural ya no la
    > enlazaba. Rellenar ese campo a ojo es justo lo que prohíbe la regla nº 2; en su lugar queda
    > escrito cómo se llegó (portal del organismo gestor, no el BORM) y la trampa de Radware.
22. **El 40 % de los enlaces especie↔hábitat se sostiene sobre UN registro, y el listón del enlace es
    más bajo que el de la ficha.** Lo mide la auditoría del 2026-08-16 (`npm run especies:habitats`,
    informe en [`auditoria-especie-habitat.md`](auditoria-especie-habitat.md)): de los 3.236 enlaces
    que se pueden medir contra el barrido versionado, **1.297 tienen una sola ocurrencia** dentro del
    polígono — el 65 % en Sierra de El Carche, el 29 % en Carrascoy. Para que una especie entre en el
    catálogo de un espacio se le piden **dos** ocurrencias en dos hábitats
    (`data/umbrales-seleccion.json`); para colgarla de un polígono concreto basta una, y un solo
    registro no distingue «vive aquí» de «pasaba por aquí».
    > **No se sube el listón en esta sesión y el motivo es medible**: con `--umbral 2` se retirarían
    > 1.297 enlaces y **135 de las 242 especies de El Carche se quedarían sin ningún hábitat**, con lo
    > que solo se encontrarían en «todas las especies» y sus hábitats dejarían de poder completarse.
    > Eso es una decisión de producto, no de auditoría. Lo que sí es barato es medir antes: el
    > `--umbral` está puesto y el informe trae el reparto por espacio.
23. ~~**Tres espacios no tienen su barrido de GBIF versionado, y por eso 1.113 enlaces no se pueden
    revisar.**~~ — **PAGADA el 2026-08-25 (b).** Eran Cabo Cope, Cuatro Calas y Sierra Espuña, y la
    auditoría los dejaba en «no evaluable» —el estado honesto, pero un hueco—. Bajados con
    `npm run gbif:habitats -- --park <slug> --json out/<slug>-gbif.json --out out/<slug>-gbif.md`:
    15.325 ocurrencias en Cabo Cope, 25.688 en Sierra Espuña. Los dieciséis espacios tienen ya su
    barrido versionado, y **los «no evaluable» pasan de 1.102 a 126** sobre 6.009 enlaces.
    > **Y el resultado es que no sobraba ninguno: se retiran 0 enlaces de 6.009.** Cero
    > contradicciones de medio, cero enlaces de vuelo, cero sin constancia. Los tres barridos
    > confirman lo que ya estaba escrito.
    >
    > **Pero antes de llegar ahí, la auditoría quiso retirar 38 enlaces de Cabo Cope, y habría sido
    > un error.** Eran *Pancratium maritimum* en las dunas embrionarias, *Nerium oleander* en la
    > galería ribereña, *Chamaerops humilis* en el sabinar, *Limonium cossonianum* en el matorral
    > halófilo: botánica de manual. El fallo es que la rama de constancia **no preguntaba de dónde
    > sale el enlace**. La del vuelo sí lo hace —distingue `porOcurrencias` mirando si la ficha tiene
    > `gbifOccurrences`—, y a ésta se le había olvidado la misma distinción. Las fichas de Cabo Cope
    > **no tienen `gbifOccurrences`**: sus enlaces salen del artículo de Alcaraz Ariza sobre la flora
    > de la Marina de Cope, del Anexo I de su PORN y de las «Bases ecológicas» del HIC. Retirarlos
    > porque GBIF no registra nada dentro de ese polígono es juzgar una fuente con el criterio de
    > otra, y en un polígono pequeño el silencio de GBIF no dice nada.
    >
    > Tapado con la regla del día: **para retirar hace falta evidencia positiva**, y aquí la
    > evidencia positiva es que el enlace saliera del barrido. Un enlace documental sin ocurrencias
    > pasa a «no evaluable» con el motivo escrito, no a retirado.
24. **330 fichas del catálogo actual se sostienen solo en GBIF, y con la puerta nueva no habrían
    entrado.** Es la deuda que abre el cambio de orden de prioridad del 2026-08-16: el pipeline ya no
    deja que GBIF dé de alta nada, pero **los ocho espacios publicados se construyeron con el
    criterio viejo** y nadie ha vuelto a pasarlos por el nuevo. Son **330 de 1.161 fichas visibles
    (28 %)**, repartidas muy desigual —del 8 % en Sierra de El Carche al 51 % en Cuatro Calas—, y
    entre ellas hay de todo: el olivo cultivado (*Olea europaea* subsp. *europaea*, fichado en seis
    espacios) que es justo lo que la regla viene a quitar, y el romero, el pino carrasco y el jabalí
    de Sierra de la Pila, que son exactamente lo que el catálogo debe enseñar.
    > **Por eso no se han podado y por eso no se deben podar a ciegas.** El orden correcto es al
    > revés: primero **transcribir los planes de gestión que faltan** (deuda nº 1) y **completar el
    > índice del Atlas**; y solo después regenerar y ver qué queda de verdad sin respaldo. Podar
    > antes de eso confundiría «no está respaldada» con «no hemos mirado dónde está respaldada», que
    > es la distinción que sostiene todo el modelo.
    > **El índice del Atlas se completó el 2026-08-16 (l)** — de 792 a 1.266 nombres, y **32 de las
    > 330 fichas suben a nivel 2** (el pino carrasco y el albardín entre ellas, +4 más al pagar la
    > deuda nº 26, que conviene pagar antes de regenerar). Pero la medición enterró una esperanza que
    > esta deuda daba por hecha: el Atlas enumera **diagnósticas, no dominantes**, y **el romero, el
    > tomillo y las jaras no figuran en él**. Para esas, la única vía es el plan de gestión: la
    > deuda nº 1 ya no es la primera de dos palancas, es la única.
    > **Y hay una razón práctica además de la de criterio**: regenerar un espacio no es pasar un
    > comando. Con el criterio nuevo, Sierra de la Pila sale con **228 fichas frente a las 219
    > publicadas** —pierde 175 que solo sostenían avistamientos y **gana 105 que su PRUG inventaría y
    > que el criterio viejo tiraba**—, pero **79 de ellas no están en el catálogo universal** y
    > necesitan taxonomía, nombre común, UICN y foto: cuatro fuentes externas por ficha, vía
    > `build-species-universal.js`. Es una sesión de trabajo por espacio.
    > La lista completa, espacio a espacio, sale de regenerar la selección de cada uno con
    > `npm run species:seleccion` y mirar `excluidas_detalle`.
25. **42 nombres mal transcritos en `anexos-normativos.json`, y hasta ahora eran invisibles.** Los
    destapó la primera pasada del criterio nuevo (2026-08-16): al entrar por la puerta de nivel 1, las
    especies que solo enumera la norma llegaron por fin al catálogo… con la errata dentro. Bastaba
    leerlas: «Lanius **senador**» (senator), «**Croccidura** russula» (Crocidura), «**Hemydactilus
    turcitus**» (Hemidactylus turcicus), «**Portetria** dispar» (Porthetria), «Verperus fuentei».
    Solo en Sierra de la Pila quedan **24** después de descontar los invertebrados, que salen igual
    por alcance taxonómico.
    > **La herramienta ya no las deja pasar**: un candidato documental que EIDOS no resuelve se
    > excluye y sale en `excluidas_detalle` con el motivo y el arreglo escritos. El arreglo es añadir
    > `nombreCorregido` a su entrada —lo que manda el `_esquema` del fichero—, **nunca** corregir el
    > verbatim, que es la transcripción literal de la norma.

    > **PAGADA en su mayor parte, y la mayor parte ya estaba hecha.** Barridas las **2.121 entradas**
    > de los once espacios contra EIDOS y GBIF el 2026-08-25 (b) con
    > **`npm run anexos:coteja`** (`coteja-anexos-normativos.js`): **229 ya tenían
    > `nombreCorregido`** —los casos que esta deuda enumera, «Lanius senador» → *senator*,
    > «Croccidura» → *Crocidura*, «Hemydactilus turcitus» → *Hemidactylus turcicus*, «Portetria
    > dispar» → *Lymantria dispar*, «Verperus fuentei» → *Vesperus fuentei*, están todos escritos—,
    > así que el grueso se corrigió en su día y **la entrada del ledger se quedó abierta**, como
    > pasó con la nº 20.
    >
    > Salen **6 erratas nuevas** y se escriben: *Acacia retinoides* → *retinodes*, *Paraserianthes
    > lophanta* → *lophantha*, y cuatro invertebrados del Humedal del Ajauque (*Oxiopes* → *Oxyopes
    > mediterraneus*, *Pterotrichia* → *Pterotricha simoni*, *Zodarion dictretum* → *diatretum*,
    > *Zodarion isabelunum* → *isabellinum*).
    >
    > **Y el circuito importa tanto como el resultado.** No se corrige de memoria: EIDOS sobre el
    > verbatim; si no resuelve, GBIF —cuyo backbone tolera erratas—; y la propuesta de GBIF se
    > vuelve a resolver **contra EIDOS**, que es la autoridad del modelo. Con **tres guardas**, y las
    > dos últimas están ahí porque la primera sola dejó pasar dos casos reales en la primera pasada:
    >
    > · **«Iberis comosa subsp. hegelmaieri» → *Iberus cobosi*, que es un CARACOL.** *Iberis* →
    > *Iberus* es una letra y *comosa* → *cobosi* son tres: pasa cualquier guarda de distancia y
    > cambia de reino. Lo delata que GBIF respondiera `HIGHERRANK`, que significa «no he sabido casar
    > tu nombre». Ahora **solo se acepta `FUZZY`**.
    > · **«Chaenorrhinum origanifolium subsp. Crassifolium» → la ESPECIE entera**, sin la subespecie.
    > Adoptarla afirmaría de la ficha un taxón más amplio del que enumera la norma, que es justo el
    > error que documenta la deuda nº 27. Ahora se exige **la misma forma**: una subespecie no se
    > convierte en especie.
    >
    > **2026-08-28: siete resueltas con el boletín delante, que es lo que este apartado pedía.**
    > Con los PDF del BORM en la mano se cerraron los que parecían erratas de transcripción, y lo
    > primero que quedó claro es que **la transcripción del repositorio era fiel**: el plan escribe
    > exactamente eso, así que la errata es de la NORMA. Cinco llevan ya su corrección,
    > verificado en las DOS autoridades: «Macrotilacea rubi» → *Macrothylacia rubi*, «Ariadna
    > isidiatrix» → *A. insidiatrix*, «Ichnocolus valentinus» → *Ischnocolus valentinus*, «Prhita
    > nana» → *Pritha nana* y «Cirtauchenius walckenaeri» → *Cyrtauchenius walckenaeri*. En este
    > último la corrección **acaba en el género mal escrito**: que GBIF lo hunda en *Amblyocarenum*
    > es una opinión de circunscripción, no un problema de transcripción, y por eso la herramienta
    > no podía escribirlo sola — proponía el nombre de GBIF y su propia guarda lo rechazaba con un
    > «no tiene forma de errata del verbatim», que era cierto.
    >
    > Y **dos que NO eran erratas**: «Ephedra sppl.» y «Rhamnus sppl.» del PORN de Calblanque. El
    > boletín de 1995 dice «sppl» porque toda esa columna está dañada por el OCR de un texto
    > mecanografiado —«Chamaerops humill,s», «Arbutus aanedo», «Juniperus oxycednts»—, y lo que la
    > norma enumera es el GÉNERO. No hay especie que corregir: quedan fuera del catálogo por lo mismo
    > que «Opuntia spp.», y eso es correcto. Anotadas para que nadie las vuelva a abrir.
    >
    > Aparte va **«Rhamnus pumilus»/«Rhamnus pumilis»**, que el Plan del Altiplano escribe de las dos
    > formas en dos volúmenes distintos: ninguna existe, porque *Rhamnus* es femenino y el nombre es
    > *Rhamnus pumila*, que EIDOS sí conoce. Se escribe a mano porque GBIF responde **HIGHERRANK** a
    > nivel de familia —tiene varios homónimos del binomio y ante la ambigüedad sube—, y la guarda de
    > la herramienta exige FUZZY. Es la lección de la deuda nº 4: un HIGHERRANK no dice «ese taxón no
    > está», dice «no he sabido desambiguar».
    >
    > **Dos siguen sin resolver y quedan dichas**: «Nacerdes baebare» (el candidato *N. barbara* no
    > lo confirma ninguna de las dos autoridades) y «Dipluriella loti» (el género existe en GBIF pero
    > la especie no, y el otro candidato sale como *Psilogaster loti*, que es otro género). Corregir
    > cualquiera de las dos sería elegir entre taxones distintos con la única pista de un nombre mal
    > escrito, que es justo lo que la guarda existe para impedir. Harían falta fuentes
    > entomológicas, no taxonómicas generales.
    >
    > **Y una trampa del PDF que costó un rato**: el Plan del Altiplano tiene el mapa de
    > caracteres roto y el extractor devuelve las letras **desplazadas tres posiciones** («2HAMNUS PUMILUS») y sin
    > minúsculas. Cualquier búsqueda en ese texto devuelve **cero** y parece que el nombre no está.
    > Se recupera restando 3 a cada código. Es la misma clase de fallo que el §2 del CLAUDE.md
    > documenta para el Atlas: un extractor distinto no da menos resultados, da CERO.

    > Quedan **40 enumeradas y sin tocar**, y casi todas son la misma clase: el anexo escribe
    > «*Juniperus oxycedrus* subsp. *oxycedrus*» y GBIF devuelve la especie. Ésas van con el documento
    > delante. Idempotente: un segundo pase no gasta una petición.
26. **El cruce con el Atlas va por binomio, y el binomio no puentea cambios de género: el esparto se
    queda sin su respaldo.** El Atlas cita las especies con la nomenclatura de 2005 —*Stipa
    tenacissima*— y el catálogo ficha *Macrochloa tenacissima*; el cruce de
    `build-species-seleccion.js` (`caracteristicasPorEspecie` + consulta por
    `binomio(c.scientificName)`) y el de `mide-niveles-puerta.js` no los juntan, así que el esparto
    no tiene evidencia `caracteristica` en los cuatro espacios donde hoy es «solo GBIF» (en El
    Carche es nivel 1 por su PRUG). Es la trampa del §2 del `CLAUDE.md` —cruzar una fuente oficial
    con el catálogo por el nombre— aplicada al Atlas, la misma que ya pagaron las aves.
    > **El arreglo NO es la tabla de equivalencias**: EIDOS resuelve el sinónimo (comprobado el
    > 2026-08-16: *Stipa tenacissima* L. → aceptado *Macrochloa tenacissima* (L.) Kunth), y la
    > convención de `data/equivalencias-nomenclatura.json` prohíbe dar de alta lo que EIDOS ya sabe.
    > Es la lección de `Docs/runbook/AVES.md` §5: **resolver contra EIDOS el nombre que escribe la
    > fuente** —aquí, los nombres del Atlas, con caché para no castigar al IEPNB con ~1.300
    > peticiones por selección—. Medido el 2026-08-16 (l): son **+4 fichas** de nivel 3 a nivel 2
    > (el esparto de Cabo Cope, Carrascoy, Cuatro Calas y Espuña), además de las 32 que ya subió el
    > arreglo del parser. Conviene pagarla ANTES de regenerar los ocho espacios (paso 3 de la deuda
    > nº 24): regenerar con el cruce cojo escribiría «solo GBIF» sobre especies que el Atlas sí
    > respalda.

    > **HERRAMIENTA HECHA el 2026-08-25 (b); falta pasarla con el PDF delante.** El puente vive en
    > `Tools/lib/atlas.js` (`tiendePuente` / `puenteDesdeCache`), lo tiende
    > **`npm run atlas:puente`** contra EIDOS con caché compartida en
    > `out/atlas-eidos-nombres-cache.json`, y lo LEEN los **tres** sitios que cruzaban por binomio:
    > `build-species-seleccion.js` (que además lo tiende solo si se le da `--atlas`),
    > `atlas-hic-especies.js` —que es donde nacen los enlaces— y `mide-niveles-puerta.js`, que es
    > offline y solo lee la caché. Los tres avisan cuando la caché no está, porque sin ella el N3
    > sale inflado y eso es justo lo que no puede pasar en silencio.
    >
    > **Y el puente NO cruza cualquier cosa que EIDOS relacione, que es la parte que había que
    > pensar.** Lo que esta deuda arregla es una **recombinación** —mismo epíteto, otro género:
    > *Stipa* → *Macrochloa* tenacissima—, pero EIDOS devuelve por la misma vía y sin distinguirlas
    > relaciones que son un **cambio de identidad**: *Ammophila arenaria* → *Calamagrostis
    > arundinacea*, *Sarcocornia fruticosa* → *Salicornia lagascae*, *Ruppia cirrhosa* → *Ruppia
    > spiralis*. Colgar el HIC del segundo taxón porque lo tenía el primero sería inventar un dato, y
    > con el agravante de que este puente **se usa solo en positivo**: nadie lo desmentiría después.
    > Así que la guarda es el epíteto, que es la misma distinción que la deuda nº 27 hace a mano. En
    > la medición de hoy: **8 recombinaciones puenteadas y 14 cambios de identidad enumerados y no
    > aplicados**.
    >
    > **Lo que falta es el `atlas.txt`, y el motivo es honesto:** el texto del PDF no se versiona, y
    > sin él los únicos nombres disponibles son los de `out/<slug>-hic-especies.json`, que guarda los
    > del Atlas **que YA casaron**. Por construcción no puede aparecer ahí un fallo de cruce — el
    > esparto no está, precisamente porque no casó. `atlas:puente` lo dice al correr y acepta
    > `--atlas` para la pasada completa. Hasta entonces la caché sirve para el puente **entre
    > parques** (un espacio ficha con el género viejo y otro con el nuevo) y las **+4 fichas** del
    > esparto siguen pendientes.

    > **DESBLOQUEADA el 2026-08-28 (b) — y no estaba pendiente del PDF, estaba pendiente de una
    > palabra.** El puente se pasó con los dos textos que hay en `fuentes/` y no tendía ni uno,
    > porque `build-species-seleccion.js` le daba de comer objetos `Set` en vez de nombres:
    >
    >     const nombres = [...new Set([...porHic.values()].flat())];   // porHic: Map<código, Set>
    >
    > `Array.prototype.flat()` **no aplana un `Set`**, así que lo que llegaba a `tiendePuente` era la
    > lista de `Set`. Dentro, `if (n in cache)` convierte la clave a cadena: se preguntaba a EIDOS
    > **una sola vez, por el literal `[object Set]`**, se cacheaba su `null` y todas las demás se
    > saltaban. Cero recombinaciones puenteadas en todos los espacios, sin error y sin aviso — el
    > número de fichas aprobadas no cambia por esto, solo el nivel de unas pocas, así que ninguna
    > comprobación lo veía. El único rastro era una entrada `"[object Set]": null` en la caché
    > compartida.
    >
    > Corregido (`flatMap(s => [...s])`), retirada la clave basura y pasado
    > `npm run atlas:puente --write` con los dos textos: **1.223 nombres resueltos, 51
    > recombinaciones** y 327 que EIDOS no resuelve —alianzas fitosociológicas y géneros sueltos, no
    > un fallo—. Segundo pase: 0 peticiones. Suben de N3 a N2 **tres fichas** en Carrascoy, Sierra de
    > Salinas y Sierra Espuña, por *Sedum sediforme* → *Petrosedum sediforme*, *Sanguisorba
    > ancistroides* → *Poterium ancistroides* y *Halimium atriplicifolium* → *Cistus atriplicifolius*
    > (en Cabo Cope, además, *Arthrocnemum* → *Arthrocaulon* y *Calicotome* → *Cytisus*).
    >
    > **El esparto sigue sin caer, y ahora se sabe por qué: no es nomenclatura.** *Stipa tenacissima*
    > aparece 21 veces en los dos textos y **en ningún bloque de «Especies características»
    > atribuido a un HIC del catálogo**: su atribución vive en la parte del PDF que ni Xpdf ni pypdf
    > colocan. Las **+4 fichas** de esta deuda se cobran con el texto de **poppler**, que en esta
    > máquina no se puede producir (ver la nº 42). La deuda queda **desbloqueada, no cerrada**.
27. **21 fichas se llaman con un nombre que EIDOS da por sinónimo, y 22 llevan un `eidosTaxonId` que
    no es de rango especie.** Los enumera y clasifica
    [`nomenclatura-autoridades.md`](nomenclatura-autoridades.md), que genera
    `npm run taxones:nomenclatura --online`. Es el resto del trabajo del 2026-08-17, que aplicó los
    nueve que se comprobaron uno a uno y dejó éstos porque **no son un cambio mecánico** y meterlos
    en bloque sería exactamente el «dato inventado» de la regla nº 2:
    > · **El aceptado es a veces de otro rango.** *Serratula mucronata* → EIDOS acepta *Klasea
    > flavescens* **subsp. mucronata**; adoptar el binomio truncado afirmaría que la ficha es de la
    > especie entera, que es un taxón más amplio. Igual con *Sedum sediforme* (→ *Petrosedum
    > sediforme* subsp. *sediforme*, y además con **dos `eidosTaxonId` distintos** entre espacios) y
    > *Teucrium homotrichum*. La herramienta ya **no propone nada** en estos casos, a propósito.
    > · **Algunos son un cambio de identidad, no de combinación**: *Natrix natrix* → *Natrix
    > helvetica* (la culebra de collar se partió en dos especies), *Centaurium rigualii* →
    > *Centaurium barrelieri*, *Anabasis hispanica* → *Anabasis mucronata*. Ahí hay que mirar qué
    > dice la ficha y qué protege la norma antes de tocar el nombre: *C. rigualii* es un endemismo
    > con figura legal.
    > · **De los 22 reanclajes, unos son inofensivos y otros no**: *Turdus merula* anclado a la
    > subespecie canaria o *Capra pyrenaica* a *pyrenaica* —que es la subespecie **extinta**— no son
    > lo mismo que *Lotus dorycnium* anclado a su subespecie nominal.
    > Van con la fuente delante y de uno en uno; el cotejo ya dice cuál es cuál, que era el trabajo
    > caro. **11 fichas más** apuntan a un sinónimo *heterotípico* de GBIF y ésas **no se tocan**:
    > ahí las dos autoridades discrepan de circunscripción y cambiar la key traería ocurrencias de
    > otro taxón.
28. **Los diez espacios publicados se seleccionaron con el puente de nomenclatura desconectado, y hay
    que regenerarlos.** El arreglo del 2026-08-20 (ver
    [`rollout/sesiones/2026-08-20.md`](rollout/sesiones/2026-08-20.md)) destapó que
    `build-species-seleccion.js` le pasaba a `respaldo-sitio.js` el nombre aceptado de EIDOS en un
    campo que ése no lee —`nombreAceptadoEidos` contra `acceptedName`—, así que la capa 2 del puente
    **no tendía ni un puente en ningún espacio** desde que se escribió. El efecto es siempre el
    mismo y siempre en la misma dirección: una especie que la norma del espacio o el formulario del
    sitio enumeran **con la nomenclatura de su época** se cae del nivel 1 y sale excluida con «no
    figura en el formulario oficial del sitio ni en el anexo normativo» escrito al lado, que es una
    afirmación falsa sobre una fuente oficial.
    > **Está medido en dos espacios y no es pequeño.** Cabezo Gordo pasa de 53 a **58** aprobadas;
    > Calblanque tiende **12 puentes** y pasa de 205 a **210**. Los casos son los de manual —*Bufo
    > calamita* → *Epidalea*, *Apus melba* → *Tachymarptis*, *Sylvia melanocephala* → *Curruca*—, o
    > sea que **el sesgo cae sobre los grupos que más han cambiado de género**: aves y anfibios.
    >
    > Va **después** de la deuda nº 26 y a la vez que ella: las dos son cruces por nombre que se
    > abren solos, y regenerar dos veces cuesta el doble de barridos de GBIF. Antes de regenerar
    > conviene tener también la nº 23 (los tres barridos sin versionar), o esos espacios no se pueden
    > rehacer sin volver a descargar.

29. ~~**511 fichas del catálogo universal con un `rarityScore` puesto a ojo.**~~ — **PAGADA el
    2026-08-27, con la decisión tomada: `rarityScore` mide la RAREZA LEGAL, no la abundancia.**
    Estaba bloqueada porque las dos herramientas que escriben el campo se contradecían por escrito, y
    eso no era una migración pendiente sino una decisión pendiente. Tomada, la migración es mecánica.
    > **Lo primero fue quitar la contradicción, no migrar.** `build-species-universal.js` —el
    > generador de fichas nuevas— derivaba el tramo del nº de registros de GBIF en España; migrar sin
    > tocarlo habría dejado el catálogo con una definición y el generador con otra, y **cada especie
    > nueva habría reabierto la deuda sola**. Hoy el generador saca el tramo de `lib/rareza.js` sobre
    > el `spainStatus` que él mismo acaba de escribir —leer el texto que va a quedar guardado, y no
    > las filas crudas de EIDOS, es lo que impide que las dos puntas discrepen sobre la misma
    > ficha— y lo escribe **con su `rarityBasis`**. Comprobado sobre las 1.067: **0 discrepancias**
    > entre lo que daría el generador y lo que da la migración.
    >
    > Con el criterio ya en un solo sitio, se retiran del generador `BANDAS_RAREZA` y
    > `SUELO_AMENAZA`, y `rarityScore` **sale de la lista `CURABLES`**: desde que se deriva de una
    > figura citable, curarlo a mano volvería a ser el número a ojo, y encima con una base al lado
    > citando una norma que diría otra cosa. Y `--refrescar-campos` arrastra ahora
    > `spainStatus` + `rarityScore` + `rarityBasis` juntos: refrescar el texto sin recalcular el
    > tramo dejaba el número viejo citando la norma nueva, sin que fallara nada — y ese comando es
    > el ejemplo que la propia cabecera de la herramienta pone.
    >
    > **La migración, en tres pasos y en este orden**: `especies:rareza -- --catalogo` (1.066 fichas
    > universales, **508 cambian de tramo**), `species:apply` (1.024 fichas de los dieciséis
    > espacios + el SQL) y `especies:rareza` para rehacer el `rarityLocal`, que es el que ve el
    > usuario y que no puede quedar por debajo del estatal. El saldo es sobre todo **hacia abajo**
    > —175 de 2→1, 148 de 3→1, 80 de 4→1, 16 de 5→1— contra 52 que suben de 1→2 por el LESRPE:
    > eran tramos altos que no tenían norma detrás. Reparto final del `rarityLocal`: 87 en tramo 5,
    > 210 en 4, 356 en 3, 960 en 2 y 1.331 en 1.
    >
    > **De 511 fichas sin procedencia quedan 5 taxones** (22 fichas contando los espacios donde se
    > repiten), y ninguno es un resto de la migración: los cinco tienen en su `spainStatus` algo que
    > **no es una figura legal**. Cuatro llevan ahí una evaluación de la UICN —«UICN España: EN (En
    > peligro) (2010)»— que es justamente el dato que este mismo día se ha mudado a su propio campo
    > (`iucnSpain`, deuda nº 39), y **EIDOS confirma que los cuatro no tienen ninguna figura legal
    > estatal**; el quinto, *Centaurium rigualii*, dice «excluida del CNEA por dudas sobre su validez
    > taxonómica», que es indeterminación, no ausencia. Lo que ve el usuario está bien igualmente,
    > porque su tramo sale del ámbito autonómico: *Helianthemum violaceum* es `rarityLocal` 4 por el
    > Decreto 50/2003 y *Poterium ancistroides* 3.
    >
    > **Y la pregunta que abren esos cuatro, que NO se ha decidido de paso:** la escalera de
    > `lib/rareza.js` cuenta la Lista Roja para el tramo —decisión explícita del 2026-08-11, porque
    > en flora es la única señal que distingue una planta rara de una común cuando ninguna norma la
    > nombra—, pero la reconoce **por el texto del `spainStatus`**. Ahora que la Lista Roja española
    > tiene campo propio en 350 fichas, esa decisión se está aplicando solo a las que además la
    > repiten en el `spainStatus`. Hacer que la escalera lea `iucnSpain` sería aplicarla a todas, y
    > es una decisión de producto con efecto visible: no se toma de rebote.

    El diagnóstico anterior, que es lo que costó la decisión:

    **511 de las 992 fichas del catálogo universal siguen con un `rarityScore` puesto a ojo, y hasta
    el 2026-08-21 ese número se colaba en el tramo que ve el usuario.** Es la migración a medias de
    `rareza-legal.js --catalogo`: el tramo estatal debía derivarse del `spainStatus` y dejar la
    figura en `rarityBasis`, pero el catálogo ha crecido desde entonces y las fichas nuevas nacen sin
    él. `npm run validate` los cuenta como aviso desde siempre.
    > **Lo que los hacía caros era la fuga, y esa ya está tapada.** `build-species-n2.js` usaba el
    > `rarityScore` universal de SUELO del `rarityLocal` —«el local incluye al estatal»— sin mirar si
    > venía de una norma, así que un número a ojo ascendía al único campo de rareza que la app
    > enseña, y de paso pisaba el `rarityLocalBasis` derivado con uno sin `categoria` ni `norma`: el
    > cartel de la ficha se quedaba sin la figura legal que debía citar. Eran **446 fichas en ocho
    > de los once espacios con catálogo** —147 en Carrascoy, 126 en San Pedro del Pinatar, 110 en El
    > Carche, 32 en Calblanque y el resto repartidas—, con la siempreviva de Cartagena, la salsola y
    > el ajo de flor oscura anunciadas como «En peligro» siendo **Vulnerable** en el Decreto
    > 50/2003. Desde el 2026-08-21 el suelo exige `rarityBasis` y la reserva de
    > `Frontend/Js/rareza.js` también, y los ocho espacios están recalculados: la auditoría contra
    > el texto legal de cada ficha da hoy **cero discrepancias y cero fichas con la firma de la
    > fuga**.
    >
    > Queda el trabajo de fondo: pasar `npm run especies:rareza -- --catalogo` (425 fichas cambian
    > de tramo), bajarlo con `npm run species:apply` y **recalcular después el `rarityLocal` de los
    > espacios** con `npm run especies:rareza`, porque la migración sube tramos (46 fichas de 1 a 2
    > por el LESRPE) y sin el recálculo `validate` daría error por `rarityLocal` menor que
    > `rarityScore`. Es una sola operación y hay que hacerla entera; por eso no se hizo al arreglar
    > la fuga. Ya no urge para lo que ve el usuario —el tramo mostrado sale del texto legal de cada
    > ficha— pero sí para que `rarityScore` deje de ser un número que nadie puede discutir.

    > **BLOQUEADA el 2026-08-25 (b): no es una migración, es una decisión, y las dos herramientas que
    > escriben este campo se contradicen POR ESCRITO.** Al ir a pasarla salió que
    > `build-species-universal.js` dice en su cabecera lo contrario que esta deuda:
    >
    > > «Se comprobó que **NO se puede derivar de la figura legal**: en el catálogo actual las
    > > especies con LESRPE reparten su rareza entre 1 y 4 (el petirrojo y el águila perdicera están
    > > las dos en el LESRPE). La señal que sí ordena bien es cuántas veces se registra la especie en
    > > España, que es dato de GBIF.»
    >
    > O sea que `rarityScore` tiene hoy **dos definiciones incompatibles**: la de abundancia, que
    > escribe el generador de fichas nuevas, y la legal, que escribiría `rareza-legal --catalogo`. Y
    > el campo no es descriptivo: alimenta `featured`, o sea **qué especies destaca la portada de
    > cada espacio**.
    >
    > La medición actualizada, con el `--dry` del 2026-08-25 (b): **1.061 fichas migradas, 503
    > cambian de tramo**, y el movimiento es sobre todo **hacia abajo** —174 de 2→1, 147 de 3→1, 77
    > de 4→1, 16 de 5→1— contra 52 que suben de 1→2 por el LESRPE. No son las «425 que cambian de
    > tramo, 46 hacia arriba» que decía esta deuda: el catálogo ha crecido y el saldo se ha invertido.
    >
    > Pasarla sin resolver la contradicción hace dos daños: deja el catálogo con una definición y el
    > generador con otra —así que cada ficha nueva vuelve a nacer con la de abundancia y la deuda se
    > reabre sola—, y baja de tramo 414 fichas que hoy la portada puede estar destacando. **Hace
    > falta decidir primero qué mide `rarityScore`**, y esa decisión es la misma que pide la deuda
    > nº 31 sobre `featured`: conviene tomarlas juntas.
30. ~~**Once fichas se quedan sin tramo de rareza porque su `spainStatus` dice «pendiente de
    confirmar».**~~ — **PAGADA el 2026-08-25 (b).** Eran **23 entradas del catálogo universal** y
    **108 fichas**: la coscoja, la alhucema, el palmito, el azufaifo, las dos siemprevivas, el arto,
    el cornical… El texto que llevaban no era una comprobación, era una conjetura sobre una fuente
    que nadie había abierto —«No localizada en la Lista Roja de la Flora Vascular Española 2008
    (pendiente de confirmar)»—, y además apuntaba a la fuente equivocada: `spainStatus` es el
    **estado legal en España** y la Lista Roja es una **evaluación**, no una norma.
    > **Y buscarlas por su frase deja seis fuera, que es la trampa de contar por el texto.** El
    > primer barrido buscó «pendiente de confirmar» y encontró 17; las otras seis dicen lo mismo con
    > otras palabras —«Pendiente de **contrastar**», «**No confirmada** presencia», «confirmar si
    > aplica a la población del parque»— y solo aparecieron al mirar quién se quedaba sin tramo, que
    > es la pregunta buena. La lista que vale es la de `tramoDeTexto()` sin veredicto, no la de un
    > `grep`.
    > Se resolvió por el camino documentado, el mismo con el que se pagó la nº 5:
    > `build-species-universal.js --taxones "<los 17>" --refrescar --refrescar-campos spainStatus`,
    > y después `npm run species:apply`. Hoy quedan **0** en el catálogo y **0** en las fichas.
    > Doce dicen «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)» y cinco
    > citan la figura que EIDOS sí les da, que es forestal y no de amenaza (RD 159/2022 de recursos
    > genéticos forestales, RD 289/2003 de materiales forestales de reproducción).
    >
    > **Comprobado que no infla ningún tramo**, que era el riesgo: `tramoDeTexto` de `lib/rareza.js`
    > devuelve **tramo 1 y `reconocido: true`** para los cuatro textos nuevos, así que las 81 fichas
    > pasan de «indeterminado» a «tramo 1 afirmado» sin que la coscoja ni el palmito suban de
    > categoría por llevar un anexo forestal.
    >
    > De paso salió lo de la deuda nº 39: EIDOS **sí** sirve la Lista Roja española, en otra vista y
    > con otro ámbito, y tres de estos veintitrés la tienen.
    >
    > **Quedan cinco fichas sin tramo, y las cinco por un motivo bueno, no por un hueco.** Cuatro
    > llevan la evaluación española escrita en el campo legal —«UICN España: EN (En peligro)
    > (2010)»— y son la prueba en el dato de la deuda nº 39: *Capra pyrenaica*, *Coturnix coturnix*,
    > *Helianthemum violaceum* y *Poterium ancistroides*. **No se tocan**: hoy son el único sitio del
    > repositorio donde vive esa evaluación, y refrescarlas contra EIDOS la borraría para escribir
    > «sin figura estatal». La quinta es *Centaurium rigualii*, «excluida del CNEA desde el año 2000
    > por dudas sobre su validez taxonómica», que es una frase informativa y honesta.
    >
    > **Y dos fichas más se quedaban sin tramo por un fallo del cotejo, no del dato**: la lista de
    > figuras que NO protegen de `lib/rareza.js` reconocía «RD 289/2003» y «RD 216/2019» solo en su
    > forma abreviada, y EIDOS las devuelve con el título completo («Real Decreto 289/2003, de 7 de
    > marzo, sobre la comercialización…»). El taray y el erizo europeo quedaban en «nadie lo ha
    > mirado» teniendo el dato delante. Arreglado escribiendo el prefijo una sola vez
    > (`(?:RD|Real\s+Decreto)`); comprobado que la coscoja sigue en tramo 1 y que un LESRPE sigue
    > subiendo a 2.
31. ~~**`featured` y el tramo de rareza no dicen lo mismo.**~~ — **PAGADA el 2026-08-27, con la
    decisión tomada: «destacada» significa exactamente el tramo legal**, `featured = rarityLocal >= 4`,
    derivado y recalculable. Es la misma decisión que la nº 29 y se tomó con ella, que era lo que
    pedía este apartado.
    > Alineados los seis espacios con `npm run especies:rareza -- --destacadas`: **117 fichas
    > cambian de estado** —56 dejan de destacarse y 61 empiezan a hacerlo—, y quedan **298
    > destacadas**. La única que sigue destacada sin llegar al tramo 4 es *Centaurium rigualii*, y no
    > es un resto: **no tiene tramo** —su estado legal dice «pendiente de confirmar»— y la
    > herramienta no degrada lo que no ha podido calcular, porque «sin tramo» no es «tramo 1».
    >
    > **Y al ir a publicarlo salió el agujero que hacía inútil el recálculo.** `rarityLocal`,
    > `rarityLocalBasis` y `featured` son campos **locales**: no viajan en el `species-universal.sql`
    > de `species:apply`, que solo lleva los universales. La única vía que quedaba era regenerar el
    > `-n2.sql` entero del espacio, que es la trampa nº 6 del `CLAUDE.md` —a un espacio que haya
    > pasado por `aves:poda` le devuelve las aves podadas—, y eso es justo lo que la cabecera de
    > `rareza-legal.js` venía recomendando: «hace falta además el SQL del espacio». O sea que para
    > publicar un recálculo había que hacer algo peligroso, y con la API por delante del paquete lo
    > más probable era no hacerlo y dejar el tramo **bien en el repositorio y viejo en lo que ve el
    > usuario**. Tapado con `--sql`, que escribe solo esas tres columnas fila a fila
    > (`Database/rareza-local.sql`, 2.945 `UPDATE`, **pendiente de aplicar**).
    >
    > **Y una octava copia del fallo de la deuda nº 37**: esta herramienta escribía los `park.json`
    > con un `writeFileSync` en vez de con `escribeEspacio()`, así que **no subía la `version` del
    > manifiesto**. Era la única que quedaba viva después de taparlo en las otras siete, y no se veía
    > porque en la práctica siempre se pasa detrás de `species:apply`, que sí la sube. Pero un
    > `--destacadas` suelto publica un cambio **visible en la portada del espacio**, y el dispositivo
    > que ya lo tuviera guardado sin conexión no se habría enterado. Corregido.

    El diagnóstico anterior:

    **`featured` y el tramo de rareza no dicen lo mismo en cinco espacios, y son 104 fichas.**
    `build-species-n2.js` escribe `featured: rarityLocal >= 4` al crear la ficha, pero después
    `featured` es un campo CURADO —se conserva entre regeneraciones— así que el dato se separa del
    criterio en cuanto alguien lo toca a mano o el tramo cambia. Medido el 2026-08-21, ya corregida
    la fuga del tramo: 43 fichas destacadas que no llegan al tramo 4 y 61 en tramo 4 o 5 que no
    están destacadas.
    | Espacio | Destacada sin llegar a 4 | Tramo ≥ 4 sin destacar |
    |---|---:|---:|
    | Sierra Espuña | 13 | 29 |
    | Sierra de la Pila | 13 | 7 |
    | Carrascoy y El Valle | 8 | 12 |
    | Cabo Cope y Puntas de Calnegre | 5 | 9 |
    | Cuatro Calas | 4 | 4 |

    Lo alinea `npm run especies:rareza -- --destacadas`, que **no** va por omisión justamente porque
    cambia qué especies enseña la portada de cada espacio. Antes de pasarlo hay que decidir si
    «destacada» significa «legalmente amenazada» —que es lo que dice el pipeline— o si es una
    selección editorial con criterio propio; hoy es las dos cosas a la vez según el espacio, y eso
    es lo que hay que resolver. Los ocho espacios recalculados el 2026-08-21 sí quedaron alineados
    en las 49 destacadas que había fabricado la fuga del tramo, que era otra cosa: ahí `featured`
    no era una decisión de nadie, era el efecto de un número inventado.
32. **El Atlas no tendía ni un enlace: 110 vínculos especie↔hábitat perdidos en nueve espacios, y el
    `source` de cada ficha afirmaba lo que sus `habitatIds` desmentían.** Salió el 2026-08-21 al
    repasar los hábitats de Cabezo Gordo. `build-species-n2.js` derivaba `habitatIds` **solo** del
    barrido de GBIF, mientras escribía en el `source` «Atlas y Manual de los Hábitats de España
    (MITECO, 2005): especie característica de alguno de los HIC cartografiados aquí» — así que una
    especie que el Atlas da como característica de un HIC del espacio, pero sin ninguna ocurrencia
    dentro, se quedaba con `habitatIds: []` y un texto que decía lo contrario. La primera fue
    *Centaurea saxicola*, característica del 8210 según el Atlas y colgando de ningún hábitat en un
    espacio que tiene el 8210 cartografiado.

    **No lo veía nadie, y por eso duró doce espacios.** El guardián de `hiloPerdido` que persigue
    exactamente esta contradicción solo salta si la selección cuenta hábitats, y los cuenta con GBIF:
    con cero ocurrencias no hay nada que descuadrar y la ficha salía por la rama `sinGbif`, que es un
    aviso normal. `validate` tampoco lo mira. Y la salida de `atlas-hic-especies.js` —que su propia
    cabecera llama «el backbone determinista de enlaces especie↔hábitat»— era un JSON «para
    revisar/cargar» que **no cargaba ninguna herramienta**: la auditoría de enlaces lo leía solo para
    NO retirar lo que ya estaba escrito, nunca para añadir.

    Duele el doble porque el Atlas es la señal **fuerte** de las dos. Una ocurrencia prueba que
    alguien registró la especie dentro del polígono —lo que en un hábitat que es una cinta de metros
    no prueba gran cosa (§2 del `CLAUDE.md`, y la deuda nº 22)—; el Atlas afirma que la especie es
    característica de ese tipo de hábitat. Se estaba tirando la buena y guardando la floja.

    **Arreglado en el pipeline y aplicado SOLO a Cabezo Gordo** (21 → 22 enlaces), que es donde salió.
    `build-species-n2.js` une ahora las dos señales y avisa cuando el espacio no tiene índice del
    Atlas —ausente no es cero, y callarlo es lo que lo convirtió en un fallo en verde—, y
    `build-park-sql.js` escribe la evidencia **por enlace**: `caracteristica` para los del Atlas,
    `observada_gbif` para los de GBIF. Ese segundo arreglo hacía falta para no empeorar: la evidencia
    se decidía por ficha comparando el número de hábitats del `source` con el de `habitatIds`, así que
    una especie con enlaces de las dos procedencias descuadraba y se iba **entera** a `NULL`,
    perdiendo también la procedencia de los que GBIF sí respaldaba.

    > **PAGADA el 2026-08-25.** No regenerando los nueve espacios —que era el plan y era la vía
    > equivocada—, sino con una herramienta que hace **solo** esto sobre los `park.json` ya escritos:
    > `npm run atlas:aplica` (`Tools/catalogo-nacional/aplica-atlas-habitats.js`). Regenerar la Capa 3
    > de un espacio publicado la reescribe desde su selección, y **ocho de los dieciséis espacios de
    > Murcia pasaron DESPUÉS por `poda-aves-sin-respaldo.js`**: su selección todavía trae las aves que
    > la poda retiró, así que regenerar las habría devuelto —en Sierra de la Pila, 24 fichas—. Es el
    > mismo patrón que `aplica-fenologia-aves.js`, y por el mismo motivo.
    >
    > Resultado: **114 enlaces nuevos en 108 fichas de once espacios**, cuatro más que los 110
    > medidos, porque de paso se arregló la lectura del Atlas (ver abajo). Idempotente; `validate` en
    > verde y tres avisos menos. Los `-n2.sql` de los once están regenerados y **pendientes de
    > aplicar**: aquí solo se AÑADEN vínculos, así que el UPSERT de `build-park-sql.js` basta y no
    > hace falta borrado.
    >
    > **Y el índice del Atlas estaba a medias en los nueve, no solo ausente en los siete.** De qué
    > extractor salga el `atlas.txt` cambia qué enlaces se leen, y **ninguno cubre al otro**: el texto
    > de Xpdf con `-layout` recupera 34 enlaces en Sierra de El Carche que el índice versionado no
    > tenía, y a la vez pierde quince de Sierra Espuña que ese índice sí traía (*Genista longipes*,
    > *Colchicum triphyllum*…). Elegir un extractor tira dato en las dos direcciones. Así que
    > `atlas-hic-especies.js` admite ahora **varios textos** (`--atlas a.txt,b.txt`) y **`--fusiona`**,
    > que conserva lo que ya hubiera en el índice: es la misma regla que aplica el resto del pipeline
    > al Atlas —se usa **solo en positivo**—, porque retirar un enlace porque un parser de PDF no lo
    > ha leído es borrar un dato por una limitación de herramienta. Los dieciséis índices están
    > regenerados y versionados.

    Lo que quedaba: **regenerar los nueve espacios**, que no se hizo porque cada regeneración
    arrastra además la migración de la deuda nº 29 y eso es una decisión de espacio, no de sesión.
    Medido el 2026-08-21 con el índice del Atlas de cada uno:

    | Espacio | Enlaces que faltan | Fichas |
    |---|---:|---:|
    | Espacios Abiertos e Islas del Mar Menor | 30 | 28 |
    | Salinas y Arenales de San Pedro del Pinatar | 25 | 25 |
    | Calblanque, Monte de las Cenizas y Peña del Águila | 20 | 19 |
    | Sierra de El Carche | 13 | 12 |
    | Sierra de la Pila | 10 | 10 |
    | Cuatro Calas | 6 | 6 |
    | Sierra Espuña | 4 | 4 |
    | Monte Arabí | 1 | 1 |
    | Sierra de Salinas | 1 | 1 |
    | **Total** | **110** | **106** |

    Y un aviso para quien lo haga: **solo cinco espacios tienen su `out/<slug>-hic-especies.json`
    versionado**. Los otros cuatro se midieron generándolo al vuelo, y hay que generarlo de verdad
    antes de regenerarlos o el pipeline volverá a derivar sin Atlas — esta vez diciéndolo, pero
    derivando sin él igual. Se genera con `atlas-hic-especies.js --atlas <atlas.txt> --park <slug>`,
    y el `atlas.txt` sale del PDF con `pdftotext -layout` o, si no hay poppler, con la receta de pypdf
    que está en la cabecera de `Tools/lib/atlas.js`.

    Regenerar también cambia el SQL de los espacios que ya lo tienen: Sierra de la Pila pasa 16 de sus
    677 vínculos de `observada_gbif` a `caracteristica` sin tocar ningún enlace, solo por afinar la
    procedencia. Eso es corrección, no cambio de catálogo, pero conviene aplicarlo junto con lo demás
    y no suelto.

33. ~~**El mismo taxón fichado dos veces por culpa de un trinomio: 4 pares en 3 espacios.**~~ —
    **CERRADA el 2026-08-27, comprobando que ya no queda ninguno.** `npm run taxones:trinomios`
    devuelve hoy «0 retiradas · 0 renombradas», y un barrido de los dieciséis `park.json` buscando
    el patrón «*género epíteto epíteto*» da **0 fichas vivas**: los cuatro pares se fundieron el
    2026-08-25 (a) y el calamón de Calblanque se renombró. Lo que sigue abierto no es esta deuda
    sino su rastro en la BD: los borrados que `build-park-sql.js` no genera van en
    `Database/species-universal.sql`, **pendiente de aplicar** (deuda nº 40). El diagnóstico
    original se conserva entero porque el pipeline sigue teniendo la vía que lo evita y conviene
    saber por qué está.

    El caso, tal como salió: El
    Formulario Normalizado de Datos de un sitio Red Natura 2000 cita algunas aves en trinomio
    —«Phalacrocorax carbo carbo», «Porphyrio porphyrio porphyrio»— y el anexo de la norma cita la
    misma ave en binomio. EIDOS les da **dos `taxonid`**, porque especie y subespecie son dos
    entradas de su Lista Patrón, así que la reconciliación de `build-species-seleccion.js` no puede
    agruparlas: no hay nada que agrupar. Salen **dos fichas del mismo bicho**, y la segunda nace mal
    por construcción —sin `gbifSpeciesKey`, sin ocurrencias, sin foto y sin descripción, porque el
    catálogo universal no tiene el trinomio—, así que acaba **oculta** por `especies:ocultar` y el
    usuario ve un hueco que no existe.

    **Arreglado en el pipeline el 2026-08-22**, al salir en el Humedal del Ajauque:
    `build-species-seleccion.js` tiene ahora una **quinta vía de reconciliación** que funde la
    subespecie nominal en su especie, con dos condiciones que hacen la fusión segura sin excepciones
    —el tercer epíteto repite el segundo, y el binomio está también entre los candidatos de ESE
    espacio—. Sin la primera se fundiría *Maytenus senegalensis* subsp. *europaea*, que sí es un
    taxón que el catálogo quiere aparte; sin la segunda, un trinomio que llega solo no tendría con
    qué fundirse.

    > **PAGADA el 2026-08-25**, y tampoco regenerando: `npm run taxones:trinomios`
    > (`Tools/catalogo-nacional/funde-trinomios-nominales.js`), con las mismas dos condiciones de la
    > selección más una tercera que aquí hace falta —**la ficha del trinomio no puede aportar nada que
    > la del binomio no tenga**, y se comprueba campo a campo (`zepaSiteCode`, `migratory`,
    > `sitePresence`, `habitatIds`, ocurrencias)—: retirarla sin eso sería tirar un dato para arreglar
    > una duplicidad. Los cuatro pares aportaban cero, así que se fundieron los cuatro.
    >
    > **Y salió un quinto caso que la tabla no tenía**, peor de ver que un duplicado: el trinomio que
    > llega **solo**, sin binomio con el que fundirse. En Calblanque era el **CALAMÓN**, fichado como
    > «Porphyrio porphyrio porphyrio» —sin `gbifSpeciesKey`, sin ocurrencias, sin descripción, con el
    > nombre científico de relleno en el `commonName` y **oculto**— mientras otros dos espacios lo
    > fichan como *Porphyrio porphyrio* con su foto y su texto. Ahí no hay nada que fundir: hay un
    > nombre que corregir, y lo hace `--renombra` reutilizando los identificadores de los espacios que
    > ya lo fichan (nunca eligiendo entre dos). Calblanque gana un calamón visible.
    >
    > Los `-n2.sql` están regenerados y hay **borrado aparte** en `Database/poda-trinomios-*.sql`
    > para los tres espacios: el trinomio se queda huérfano en la BD, y el renombrado también.

    Lo que quedaba son los pares **ya escritos**, que solo se iban regenerando el espacio:

    | Espacio | Par |
    |---|---|
    | Espacios Abiertos e Islas del Mar Menor | *Phalacrocorax carbo* + *Phalacrocorax carbo carbo* |
    | Espacios Abiertos e Islas del Mar Menor | *Porphyrio porphyrio* + *Porphyrio porphyrio porphyrio* |
    | Salinas y Arenales de San Pedro del Pinatar | *Phalacrocorax carbo* + *Phalacrocorax carbo carbo* |
    | Calblanque, Monte de las Cenizas y Peña del Águila | *Phalacrocorax carbo* + *Phalacrocorax carbo carbo* |

    Ojo al regenerar: el trinomio se queda **huérfano en la BD**, porque `build-park-sql.js` solo hace
    UPSERT. El borrado va aparte, como en los renombrados.

34. **Cuatro aves que su formulario oficial declara están fuera del apartado de la ZEPA.** La
    **clase** de una especie la pone GBIF, así que una que la legislación aprueba y que GBIF no ha
    registrado dentro de los polígonos llega a `build-species-n2.js` con `class: null` — y de
    `class === 'Aves'` cuelga, entre otras tres cosas, el `zepaSiteCode`. El ave se quedaba fuera del
    apartado de la ZEPA con su evidencia `lista_oficial_sitio` intacta al lado: el dato para ponerla
    estaba y no se miraba. Es el mismo fallo que el de Sierra de El Carche —contar hábitats en un
    ave— entrando por otra puerta: allí era «un ave sin ZEPA», aquí es «un ave sin ocurrencias».

    **Arreglado el 2026-08-22** en el Humedal del Ajauque (67 → 74 aves en el apartado): la clase se
    completa desde la ficha universal, que la trae de EIDOS y no depende de que GBIF haya visto al
    bicho. Lo que quedaba eran **4 fichas en 2 espacios** —Espacios Abiertos e Islas del Mar Menor (3)
    y Calblanque (1)—, que la deuda daba por recuperables «al regenerar».

    > **PAGADA el 2026-08-25 (b), y sin regenerar: no hacía falta.** La clase ya estaba bien en las
    > fichas —`species:apply` reparte `taxonomy` desde el catálogo universal—, así que lo único que
    > faltaba era el `zepaSiteCode`, y eso lo escribe **`npm run aves:poda`**, que ya corrige ese
    > campo por diseño («el sitio que de verdad declara al ave, o `null`»). Un `--dry` sobre los dos
    > espacios da **0 aves retiradas** y solo correcciones de `zepaSiteCode`, así que aplicarlo es
    > seguro: **5 nulls → `ES0000260`** (una más que las 4 medidas), todo altas, ninguna baja. Son
    > *Fulica atra* en Calblanque y *Alca torda*, *Botaurus stellaris* e *Ixobrychus minutus* en
    > Espacios Abiertos.
    >
    > La lección que se repite: **la herramienta que toca SOLO ese campo ya existía**. Regenerar la
    > Capa 3 de dos espacios publicados para escribir cinco valores habría arrastrado todo lo demás,
    > que es lo que ya avisaba la nº 32.
    >
    > Los dieciséis `-n2.sql` están regenerados de paso —traían el `spainStatus` viejo de antes de la
    > nº 30— y **pendientes de aplicar**. El diff es simétrico (116 líneas por 116): ninguna ficha
    > entra ni sale.

35. **Veinticinco nombres del formulario oficial no casan con el catálogo, y ahora eso cuesta una
    clasificación además de una ficha.** Son **53 entradas en 12 espacios** que
    `npm run aves:fenologia` no puede cruzar: la fuente cita con la nomenclatura de su época
    (*Sylvia conspicillata*, *Larus ridibundus*, *Cyanecula svecica*) y el catálogo con la de hoy
    (*Curruca conspicillata*, *Chroicocephalus ridibundus*, *Luscinia svecica*). El efecto es un
    **falso negativo silencioso**: el ave existe en el catálogo, el formulario la declara
    migratoria, y se queda sin `migratory` —o sea, fuera de la pestaña «Migratorias»— con la
    apariencia de «este espacio no tiene fuente para ella».

    Once de las veinticinco traen un candidato del catálogo con el mismo epíteto, y la herramienta
    los lista marcados **A VERIFICAR**: no se aplican, y con razón — entre los once están
    *Calandrella brachydactyla* ↔ *Certhia brachydactyla* (terrera y agateador),
    *Melanocorypha calandra* ↔ *Emberiza calandra* (calandria y triguero) y *Motacilla flava* ↔
    *Senecio flavus*, que ni siquiera es un animal. Es exactamente el motivo por el que la
    heurística de epíteto no se aplica sola (`Tools/lib/respaldo-sitio.js`).

    Las otras catorce —*Alcedo atthis*, *Aquila fasciata*, *Burhinus oedicnemus*…— no tienen
    candidato: ahí lo probable es que el formulario declare un ave que el barrido nunca vio dentro
    de ese espacio, y entonces no hay nada que cerrar, solo que anotar.

    **Cómo se pagaba, y por qué no se podía:** el plan era resolver el nombre **de la fuente** contra
    EIDOS y «dar de alta lo que cierre» en `equivalencias-nomenclatura.json`. Eso era una trampa: ese
    mismo fichero dice, con nombres y apellidos, que **no** se den de alta equivalencias que EIDOS ya
    sabe —cita *Larus ridibundus* → *Chroicocephalus ridibundus*, *Catharacta skua* → *Stercorarius
    skua*, *Sylvia cantillans* → *Curruca cantillans* y *Phalacrocorax aristotelis* → *Gulosus
    aristotelis*—, porque serían una segunda verdad que puede divergir de la primera. Así que la
    salida estaba cerrada por los dos lados: la capa 2 del puente no la hacía nadie y la 3 no podía
    hacerla.

    > **PAGADA en su mayor parte el 2026-08-25**, poniendo la capa 2 donde faltaba:
    > `npm run aves:fenologia -- --online --write`, con caché en
    > `out/fenologia-eidos-fuente-cache.json`. **De 53 entradas quedan 29**, y las migratorias suben
    > de **405 a 420**. Un detalle que costaba ocho de ellas: el verbatim del formulario **no se puede
    > consultar tal cual** —«Sylvia cantillans ([excluding subalpina])», «Phalacrocorax aristotelis
    > aristotelis» no empiezan por ningún nombre de la lista patrón de EIDOS—, y el `binomio()` de
    > `lib/atlas.js` **tampoco sirve** para consultar, porque es la clave de COTEJO (minúsculas y con
    > la terminación recortada: «larus ridibund»). Hace falta un «Género epíteto» de verdad.
    >
    > Las 29 que quedan **no son de nomenclatura**: son aves que el formulario del sitio declara y que
    > el catálogo del espacio no tiene fichadas —doce de ellas en Sierra de la Pila—. Ahí no hay
    > equivalencia que dar de alta; hay una ficha que falta.

36. **PAGADA A MEDIAS el 2026-08-28: de 48 fichas quedan 28, y las 20 que salen lo hacen por una
    regla, no una a una.** El apartado daba las 48 por «trabajo de ir una a una con EIDOS delante», y
    lo son las 28 que quedan — pero **veinte no eran ese problema**.
    > **La regla que las parte, y no es nueva.** Es la guarda que ya usa
    > `atlas-puente-nomenclatura.js` para la deuda nº 26, dicha aquí para otro uso: se renombra solo
    > una **RECOMBINACIÓN** —mismo epíteto, otro género, mismo rango—, que es la misma especie
    > cambiada de sitio y deja la ficha entera valiendo. *Stipa capensis* → *Stipellula capensis*,
    > *Sedum sediforme* → *Petrosedum sediforme*, *Eptesicus isabellinus* → *Cnephaeus isabellinus*.
    > La comparación de epítetos usa el `binomio()` de `lib/atlas.js`, que normaliza la desinencia
    > latina: *hirsuta* → *hirsutus* es concordancia de género gramatical, no otro epíteto.
    >
    > **Y lo que la regla DEJA FUERA es lo que la hace defendible**, porque son justo los casos que
    > el propio apartado ponía de ejemplo:
    > · **Cambia el epíteto → cambio de IDENTIDAD.** *Sarcocornia fruticosa* → *Salicornia
    >   lagascae*, *Ruppia cirrhosa* → *R. spiralis*, *Natrix natrix* → *N. helvetica* (la culebra de
    >   collar se partió en dos especies). Adoptarlos colgaría de la ficha —con su foto, su
    >   descripción y sus enlaces de hábitat— un taxón distinto.
    > · **Trinomio que se vuelve binomio → cambia el RANGO.** *Dactylis glomerata* subsp. *hispanica*
    >   → *D. glomerata* afirma un taxón MÁS AMPLIO del que la fuente reconoce, que es la deuda nº 27.
    > · **El aceptado es una subespecie** → lo mismo al revés; son los 10 que `coteja-nomenclatura.js`
    >   ni siquiera propone.
    >
    > **La herramienta comprueba la regla sobre su propia tabla** antes de escribir, en vez de
    > limitarse a afirmarla en la cabecera: si alguien añade un par que cambia de epíteto o de rango,
    > se para. Es la lección de la deuda nº 4 aplicada de antemano — una afirmación en un comentario
    > no la puede comprobar `validate`.
    >
    > Resultado: **49 fichas en 11 espacios**, 20 entradas del catálogo universal (reordenado) y 6
    > textos de `data/contenido/`. **0 colisiones**, así que ninguna fusión. Los `eidosTaxonId` **no
    > se han tocado y no hacía falta**: EIDOS da un taxonid por TAXÓN, no por nombre, así que los
    > veinte ya eran el del aceptado. Las `gbifSpeciesKey` tampoco: cada campo cita a su autoridad.
    >
    > **No se dan de alta equivalencias de nomenclatura**, aunque las fuentes oficiales vayan a citar
    > *Sedum sediforme* durante años: EIDOS **sí** resuelve estos nombres y el
    > `_cuando_hace_falta_una_entrada` del fichero lo prohíbe con su motivo («una segunda verdad que
    > puede divergir»). Lo que hay que tener presente es que esa capa **solo corre con `--online`**
    > (deuda nº 38).
    >
    > **De paso bajan otras dos cuentas.** Los desalineados de `taxonomy.genus` pasan de 16 a **5 sin
    > resolver**, porque renombrar dejó **9 corregibles** que `coteja-nomenclatura.js --write` ya
    > sabe escribir: **41 campos en 9 espacios**. Y al ir a usarlo apareció **la novena copia del
    > fallo de la deuda nº 37**: esa herramienta escribía los `park.json` con `writeJson` en vez de
    > con `escribeEspacio()`, o sea **sin subir la `version` del manifiesto**. Corregida. Es la
    > segunda que aparece en dos días, y las dos por el mismo camino: al ir a usar la herramienta.
    >
    > Pendiente de aplicar: los dieciséis `-n2.sql` regenerados, `species-universal.sql` y
    > `Database/poda-recombinaciones.sql` —los veinte nombres viejos que el UPSERT deja huérfanos—,
    > que va **después** de los `-n2.sql`.

    El diagnóstico original, que sigue valiendo para las 28 que quedan:

    **Cuarenta y ocho fichas se llaman con un nombre que EIDOS da por sinónimo, y cuarenta y tres
    llevan un `eidosTaxonId` que no es de rango especie.** Lo mide `npm run taxones:nomenclatura --
    --online` desde que existe, y el informe entero está en
    [`Docs/nomenclatura-autoridades.md`](nomenclatura-autoridades.md). Ninguna de las dos clases es
    corregible sola y por eso la herramienta no las toca: renombrar cambia la clave con la que se
    indexan el catálogo universal y `data/contenido/`, y reanclar un identificador de rango
    subespecie a la especie **cambia el taxón**, no solo el número (`Klasea flavescens` subsp.
    *mucronata* por *Serratula mucronata* es más taxón del que la fuente reconoce). Es trabajo de ir
    una a una con EIDOS delante, y cada renombrado deja **cuatro rastros**: el `park.json`, el
    catálogo universal, `data/contenido/` y la fila vieja de la BD (trampa nº 3 del `CLAUDE.md`).

    Lo que sí se cerró el 2026-08-25 es una clase que **no veía nadie**: la `gbifSpeciesKey` que no
    identifica ninguna especie. `lib/gbif.js` lo avisa en su cabecera —«una `usageKey` de género o
    familia no identifica ninguna especie»— y aun así había **cinco fichas** así, todas del volcado
    del piloto de Cabo Cope: *Salsola vermiculata* y *Arthrocnemum macrostachyum* con la **3064**,
    que es la FAMILIA Amaranthaceae; *Stipa capensis* con la **3073** (Poaceae); *Sedum sediforme*
    con la **2406** (Crassulaceae); y *Sideritis ibanyezii* con la **2926685**, que es el GÉNERO. La
    comprobación que ya existía no podía verlas porque solo mira el ESTADO de la key, y una familia
    es un taxón perfectamente `ACCEPTED`: lo que falla es el **rango**. No es cosmético — la key es
    con lo que se piden las ocurrencias, así que una de familia trae las de toda la familia, y dos
    especies distintas con la misma key son un duplicado que `taxones:duplicados` marca sin poder
    decir cuál de las dos está mal.

    Se corrigen **tres** —las que otro espacio ya ficha con una key de rango especie, que se
    reutiliza igual que hace `build-species-n2.js` con los identificadores—; las otras dos no tienen
    de dónde copiarla y se dicen. Con eso `taxones:duplicados` baja a **0 duplicados** y de 8 a 5
    identificadores incoherentes.
    > Las «otras dos» sí tenían de dónde: se resolvieron el **2026-08-27** preguntando por el nombre
    > de la otra autoridad (deuda nº 4). Y de los 43 reanclajes queda **uno menos**: *Sedum
    > sediforme* pasó del 95304, que es la subespecie, al 8225, que es la especie.

    > **Y hay un caso que este cotejo NO ve y que sale al mirar los identificadores: *Olea europaea*
    > subsp. *europaea*.** Los ocho espacios que la fichan le ponen de `commonName` **«Acebuche»**,
    > que es el olivo **silvestre** —*O. europaea* var. *sylvestris* para EIDOS, un taxón aparte con
    > su propio `taxonid` 32803—, mientras el `scientificName` dice subsp. *europaea*, que es el
    > **cultivado**. La ficha se contradice a sí misma y ninguna pasada puede verlo: el nombre es un
    > nombre aceptado y su identificador puede anclarse a un taxón perfectamente válido. Lo delata
    > el nombre común, que ninguna comprobación lee.
    >
    > **Calblanque además la ficha dos veces**, porque tiene también *Olea europaea* subsp.
    > *sylvestris* —con `eidosTaxonId` 6645 y sin `gbifSpeciesKey`—, y para EIDOS ese nombre y
    > subsp. *europaea* son el **mismo taxonid 6645**. Es el mismo patrón de la deuda nº 33 (el
    > mismo bicho fichado dos veces con dos nombres) por otra puerta, y `taxones:duplicados` no lo
    > caza porque los dos identificadores no chocan: uno de los dos es nulo.
    >
    > Mientras no se decida, las ocho fichas quedan ancladas al par de **especie** (6644 /
    > 5415040), que contiene las dos lecturas y no afirma ninguna. Decidirlo es un renombrado más
    > una fusión, con los cuatro rastros de siempre.

37. ~~**La subida de `version` del manifiesto está copiada en cinco herramientas y la sexta se la
    olvidó.**~~ — **PAGADA el 2026-08-25 (b).** El manifiesto es lo que decide si un dispositivo con
    el espacio guardado sin conexión vuelve a descargarlo: una herramienta que escribe en el
    `park.json` y no sube la versión deja al usuario que ya lo tenía guardado con el dato viejo,
    **sin que nada falle ni avise, y con el dato bien en el repositorio**, así que desde aquí no se
    ve nunca. `aplica-fenologia-aves.js` **no la subía** —salió el 2026-08-25, con trece espacios
    reescritos—, y con el arreglo eran ya **seis copias de las mismas cuatro líneas**.
    > Ahora es **`escribeEspacio()` en `Tools/lib/io.js`**, y las **siete** herramientas la llaman:
    > `build-species-n2.js`, `poda-aves-sin-respaldo.js`, `auditoria-especie-habitat.js`,
    > `aplica-atlas-habitats.js`, `aplica-fenologia-aves.js`, `funde-trinomios-nominales.js` y
    > **`sync-species-catalog.js`**.
    >
    > **La séptima no estaba en la lista, y es la que más se ejecuta.** `npm run species:apply`
    > reescribe fichas de los dieciséis espacios y **no tocaba ni un manifiesto**: apareció el mismo
    > día, al bajar la corrección de la deuda nº 30 y ver que los 16 `park.json` cambiaban y los 16
    > `manifest.json` no. Está en todos los runbooks detrás de cualquier corrección universal, así
    > que era la vía por la que más veces se ha publicado un catálogo que el dispositivo con el
    > espacio guardado sin conexión nunca volvió a descargar. Que apareciera **una** más justo
    > después de contarlas todas es el argumento de que la función tenía que existir.
    >
    > **La forma importa tanto como el sitio.** No es un `subeVersion(manifest)` que haya que acordarse
    > de llamar —eso es la misma trampa con una indirección más—: la función escribe **el `park.json` y
    > el manifiesto juntos**, así que la única manera de publicar fichas es por una puerta que sube la
    > versión sola. Sube la `version` solo si el paquete cambió (regla nº 7, idempotencia) pero aplica
    > los `counts` siempre, que es la única diferencia real que había entre las seis copias.
    >
    > Comprobado que las seis son idempotentes después del cambio: `atlas:aplica --write`,
    > `aves:fenologia --write` y `taxones:trinomios --write` sobre los dieciséis espacios dejan el
    > árbol de trabajo limpio, y `validate` sigue en verde.

38. **`npm run aves:fenologia` sin `--online` deshacía la deuda nº 35, y el comando documentado no
    lleva la bandera.** Salió el 2026-08-25 (b) al comprobar la idempotencia de la nº 37: un
    `--write` sin `--online` retiró `migratory` y `sitePresence` de **53 fichas en ocho espacios** y
    bajó las migratorias de 420 a 405 — exactamente lo que la nº 35 había pagado el día anterior. El
    diff parecía una limpieza y nada falló.
    > El motivo es que el puente que casa el nombre del formulario con el del catálogo tiene tres
    > capas y **la segunda solo corre con `--online`**. Sin ella el ave no cruza, y el código trataba
    > «no he sabido cruzar el nombre» igual que «el formulario no la declara»: retiraba el campo.
    >
    > **Tapado en la misma sesión, y la regla es simétrica a la del Atlas:** para retirar el campo
    > hace falta evidencia **positiva**, y la evidencia positiva es haber cruzado. Un ave que no casa
    > conserva lo que tuviera y sale contada («N fichas conservan la fenología de un pase anterior»,
    > con un «¿falta `--online`?» cuando la bandera no está); un ave que **sí** casa y cuya
    > clasificación sale vacía se retira como antes, porque ahí la fuente sí dice algo. Hoy
    > `aves:fenologia --write` sin red es un no-op: 0 fichas afectadas, 420 migratorias intactas.

39. ~~**EIDOS sirve la Lista Roja española y el modelo no tiene dónde ponerla.**~~ — **PAGADA el
    2026-08-27.** El campo existe: `iucnSpain` en la ficha, `species.iucn_spain` en la base, y está
    abierto en las **seis** puntas, no en las cuatro que decía este apartado —faltaban el AdminPanel
    (`fields.ts` + las tres sentencias de `Backend/Api/admin.php`, donde además hay que mover el
    `bind_param`) y el generador de SQL por espacio (`build-park-sql.js`), que es el que escribe la
    ficha entera de un espacio nuevo—.
    > **El barrido está hecho y son 350 fichas de 1.067**, repartidas así: 13 CR, 19 EN, 52 VU,
    > 52 NT, 53 LC, 15 DD y 146 NE. Lo rellena `npm run especies:listaroja` y lo reparte
    > `npm run species:apply` (1.493 fichas de los dieciséis espacios). El SQL regenerado necesita
    > la columna: **antes va `Database/migrations.sql`**, que ya la trae.
    >
    > **Las 699 sin evaluación de ámbito España se quedan SIN el campo, no con un «No evaluada».**
    > Es la misma regla que la fenología de las aves: un hueco dice «nadie lo ha mirado» y un valor
    > diría «comprobado que no la hay», y solo una de las dos afirmaciones está respaldada. Por eso
    > la ficha del frontend pinta esa fila **solo si existe**, al revés que la mundial, que se
    > enseña siempre con su «No evaluada».
    >
    > **Dos cosas que el barrido dejó dichas en vez de decidirlas.** (1) **18 fichas no se han
    > podido preguntar** porque EIDOS da su nombre por sinónimo —*Anabasis hispanica*, *Salsola
    > vermiculata*, *Sarcocornia fruticosa*, *Halimione portulacoides*…—: adoptar la Lista Roja del
    > aceptado sería colgar de la ficha el dato de un taxón que nadie ha comprobado que sea el suyo,
    > y eso es la deuda nº 36. (2) **6 fichas tienen evaluación de ámbito `Península` y ninguna de
    > `España`** —la pardela cenicienta EN, el cormorán moñudo VU, el flamenco DD, y tres LC—: es un
    > ámbito **subestatal** y el catálogo no tiene un campo con ese significado, así que escribirlo
    > en el de España afirmaría algo que la fuente no dice. Quedan enumeradas en la salida del
    > comando, que es donde se verán si algún día se abre su campo.
    >
    > El criterio de cómo se escribe una categoría vive ahora en `Tools/lib/uicn.js`, en un solo
    > sitio, porque lo usan las dos puntas: el generador de fichas nuevas y el barrido de las
    > escritas. El diagnóstico original:

    **EIDOS sirve la Lista Roja española y el modelo no tiene dónde ponerla.** Salió el 2026-08-25
    (b) pagando la deuda nº 30. `conservationByScope()` devuelve la evaluación UICN **por ámbito**
    —`Mundial`, `España`, `Península`, `Canarias`—, y el pipeline se queda **solo con `Mundial`**,
    que es lo que escribe en `iucnGlobal`. La fila de ámbito **España** es la Lista Roja de la Flora
    Vascular Española, justo la fuente que las diecisiete fichas de la nº 30 decían tener pendiente,
    y de esas diecisiete la tienen **tres**, las tres como **NT (Casi amenazado), 2010**:
    *Erodium sanguis-christi*, *Maytenus senegalensis* subsp. *europaea* y *Serratula mucronata*.
    > No es un hueco de fuente: es un hueco de **campo**. La ficha no tiene dónde escribirlo
    > —`species.iucn_global` es una columna sola— y meterlo ahí sería mezclar dos evaluaciones de
    > ámbito distinto en el mismo sitio, que es exactamente el error que pagó la nº 5 con
    > `spainStatus`. Abrirlo cuesta un campo nuevo en las cuatro puntas (`especies-universal.json`,
    > `schema.sql` + migración, `park_payload.php` y la ficha del frontend), así que **no se hace de
    > paso**.
    >
    > Mientras tanto el dato está localizado y se recupera en una consulta: es
    > `conservationByScope(taxonid)['España']`. Y el barrido completo está sin hacer: solo se han
    > mirado los diecisiete de la nº 30, no las 1.067 fichas del catálogo.

40. ~~**`species:apply --sql` dejaba cinco campos universales fuera de la base de datos.**~~ —
    **TAPADA el 2026-08-25 (b), en el mismo pase que la nº 30.** El `UPDATE` que genera
    `sync-species-catalog.js --apply --sql` tocaba diez columnas y **no** `kingdom`, `family` (que es
    donde vive el `group` de la ficha), `taxon_*`, `iucn_global` ni `spain_status`. Como la API tiene
    prioridad sobre el `park.json` empaquetado, una corrección de cualquiera de esos cinco campos
    quedaba **bien en el repositorio y mal en lo que ve el usuario** — y el runbook manda justamente
    esa ruta detrás de una corrección universal. Se descubrió al comprobar que el arreglo de la nº 30
    llegara al usuario: no llegaba.
    > Añadidas las cinco al `UPDATE`, con dos cuidados: `family` lleva un comentario diciendo que es
    > el nombre histórico de la columna del `group` —la familia taxonómica va en `taxon_family`, y
    > confundirlas es fácil— y `kingdom` **solo se escribe si la ficha lo trae**, porque es un ENUM
    > `NOT NULL` y un `NULL` abortaría el `UPDATE` entero con MySQL en modo estricto.
    >
    > `Database/species-universal.sql` está regenerado (2.945 `UPDATE`) y **pendiente de aplicar**.
    > Traía además dos correcciones atrasadas del 2026-08-25 (a) que nadie había volcado: el calamón
    > de Calblanque renombrado y los cuatro trinomios fundidos.

41. ~~**El catálogo del piloto y su selección no se describen el uno al otro: 95 fichas se quedan
    fuera.**~~ — **CERRADA el 2026-08-28 (b): Cabo Cope alineado con el criterio del resto, 193 → 98
    fichas.** El espacio no tenía selección versionada —su catálogo se escribió en agosto de 2026 con
    la regla vieja y es anterior a que la selección fuera un fichero del repositorio—, y al producir
    la primera se quedaron **95 fichas fuera de ella**. Medido espacio a espacio antes de decidir: en
    los otros quince la diferencia entre catálogo y selección va de **0 a 13** fichas (restos de
    reconciliaciones de nombres); Cabo Cope estaba dos órdenes de magnitud fuera. Podado, queda en
    **0**.
    > **Lo que se ha ido, desglosado, porque el 95 solo no lo dice:**
    >
    > · **51 nunca llegaron a la puerta.** `gbifOccurrences: null` y **fuera del barrido de GBIF del
    >   espacio**: no las rechazó ningún filtro, es que no eran candidatas. De ellas, **14 eran
    >   características de un HIC según el Atlas, 11 las enumera el Decreto 299/2010 y 23 declaraban
    >   figura legal** — **32 con respaldo documental escrito y cero registros dentro de los
    >   polígonos**.
    > · **44 eran candidatas rechazadas** por «solo GBIF». Nivel 3.
    >
    > **Sin respaldo de ninguna clase eran 60**, no 95. Ésas sí son el coste conocido de que el
    > catálogo legal **no enumere lo común precisamente por ser común**: el lentisco, el romero, el
    > esparto, el jabalí, el lagarto ocelado, la adelfa, el palmito.
    >
    > **Y las otras 32 se han ido igual, que es lo que hay que tener escrito**: *Arthrocaulon
    > macrostachyum*, *Halocnemum strobilaceum*, *Limoniastrum monopetalum*, *Sarcocornia fruticosa*,
    > los dos tarays, *Sideritis ibanyezii*, *Maytenus senegalensis* subsp. *europaea*, *Centaurea
    > saxicola*, la culebra de herradura, el gato montés, el erizo moruno. La poda es correcta por el
    > criterio del pipeline —el nivel 2 exige que GBIF corrobore y ahí GBIF no dice nada— **y a la
    > vez retira fichas que una fuente oficial respalda por escrito**. Las dos cosas son verdad. No
    > se recuperan relajando la puerta: se recuperan **completando el Atlas** (nº 42) y **cotejando
    > los estados legales** (nº 43).
    >
    > **Lo que costó, en concreto:** siete eran **destacadas** y salían en la portada (*Allium
    > melananthum*, *Centaurium rigualii*, *Caralluma europaea*, *Maytenus senegalensis* subsp.
    > *europaea*, *Centaurea saxicola*, *Halocnemum strobilaceum*, *Tamarix boveana*) — el espacio
    > baja de 23 destacadas a 16; **13 entradas del catálogo universal** se quedaron huérfanas y las
    > retiró `species:poda` (1.071 → 1.058); y **8 entradas de `data/contenido/`** tienen texto
    > redactado a mano que ya no llega a ninguna ficha, **que NO se han borrado**.
    >
    > **El borrado para la BD está escrito y SIN aplicar**:
    > `Database/poda-piloto-cabo-cope-puntas-calnegre.sql`. Va después del `-n2.sql` regenerado (que
    > da de alta las 98) y después del `poda-aves-*.sql` del 2026-08-16, que sigue pendiente. Su
    > cabecera lleva los tres avisos: copia previa, `recalculate-account-progress.php` detrás, y las
    > siete destacadas.
    >
    > **Y el N3 = 4 que queda en la medición no es un hueco de dato**: las 98 son todas nivel 1 o 2
    > según su selección, y `mide-niveles-puerta.js` ve cuatro como N3 por límites propios — dos
    > porque el anexo las escribe con otro nombre (*Rhamnus hispanorum*, *Serratula mucronata*) y esa
    > clave no está en la caché offline que la herramienta puede leer, y dos porque su cruce con el
    > Atlas va por binomio contra un solo texto.

42. **`fuentes/atlas.txt` no es reproducible, aunque el repositorio diga que sí en tres sitios.**
    El texto no se versiona «porque es reproducible». De qué extractor de PDF salga cambia QUÉ
    especies características se leen, y **la diferencia no es de matiz**: para los HIC de Sierra de
    las Moreras, la selección del 2026-08-22 vio **631** especies y los dos textos que hoy hay en
    `fuentes/` dan 378 (Xpdf `-layout`) y 299 (pypdf), **494 de unión**. El texto rico de aquel día
    era de `pdftotext` de **poppler**, que en esta máquina no está —el `pdftotext` disponible es el
    de Xpdf 4.00 (Glyph & Cog)— y no se puede reinstalar.
    > **Lo que costaba, medido:** regenerar Moreras leyendo un solo texto le quitaba **seis fichas**
    > que el Atlas respalda —*Lygeum spartum*, *Withania frutescens*, *Artemisia barrelieri*,
    > *Atriplex glauca*, *Lapiedra martinezii*, *Suaeda spicata*— con el motivo «solo GBIF: ninguna
    > fuente documental la respalda» escrito al lado, que es falso. Sin error y sin aviso.
    >
    > **Tapado a medias el 2026-08-28 (b)**: `build-species-seleccion.js` lee ahora VARIOS textos
    > (`--atlas a.txt,b.txt`, la firma que ya tenía `atlas-hic-especies.js`) **y además el índice
    > versionado del espacio**, `out/<slug>-hic-especies.json`, que es lo único del Atlas que está
    > en el repositorio. Las tres fuentes se suman y no se restan nunca. El índice solo contiene
    > taxones ya fichados en el espacio, así que **no puede meter una especie nueva**: lo único que
    > hace es impedir que una que ya está pierda su respaldo por una limitación de herramienta. En
    > Moreras aportó exactamente las siete que los dos textos de hoy no traen.
    >
    > **Lo que queda es barato y tiene efecto en los dieciséis espacios**: extraer el Atlas con
    > poppler en cualquier máquina que lo tenga y **añadir el texto a la lista** —nunca sustituir—.
    > De ahí salen las +4 fichas del esparto de la nº 26 y parte de las 95 de la nº 41. Y una
    > decisión que conviene tomar de paso: si el texto no es reproducible, **versionarlo** (o
    > versionar el índice de todos los espacios) deja de ser un lujo.

43. **Los estados legales del piloto están escritos a mano y contradicen a EIDOS, en las dos
    direcciones.**
    > **LLEVADAS AL BOLETÍN — 2026-09-19.** De las quince discrepancias que dejó el barrido quedaban
    > **catorce** (la del chumberillo de lobo era una acusación falsa de la caché, abajo). Se han
    > cotejado **una a una contra el texto consolidado del BOE y contra el BORM**, no contra EIDOS:
    > el Anexo del **RD 139/2011** (`BOE-A-2011-3582`), el Anexo I de la **Ley 7/1995** de Murcia
    > (`BOE-A-1995-13301`) y el Anexo I del **Decreto n.º 50/2003** (BORM n.º 131, de 10 de junio de
    > 2003, descargado entero por `services/boletin/ano/2003/numero/131/pdf`). **Trece corregidas y
    > una que no había que tocar**:
    >
    > | Taxón | Lo que decía | Lo que dice el boletín | Tramo |
    > |---|---|---|---|
    > | *Testudo graeca* | LESRPE | **CEEA: Vulnerable**, sin restricción de población | 2 → **4** |
    > | *Capra pyrenaica* | «no incluida» (5 espacios, 2 redacciones) | Ley 7/1995, Anexo I **B) vulnerables** | 1 → **4** |
    > | *Sambucus nigra* | «no incluida» | D. 50/2003, Anexo I **2 VULNERABLES** | 1 → **4** |
    > | *Micromeria fruticosa* | «no incluida» | D. 50/2003, Anexo I **2 VULNERABLES** | 1 → **4** |
    > | *Rhamnus pumila* | «no incluida» (2 esp.) | D. 50/2003, Anexo I **3 INTERÉS ESPECIAL** («*Rhamnus pumilus*») | 1 → **3** |
    > | *Scilla autumnalis* | «no incluida» | D. 50/2003, Anexo I **3 INTERÉS ESPECIAL** | 1 → **3** |
    > | *Calandrella rufescens* | «sin figura estatal» | LESRPE (el Anexo lo escribe «Calandrela», con una ele) | 1 → **2** |
    > | *Regulus ignicapillus* | «sin figura estatal» | LESRPE | 1 → **2** |
    > | *Genetta genetta* | LESRPE (8 espacios) | **no figura en el Anexo**: solo Anexo VI de la Ley 42/2007 | 2 → **1** |
    > | *Malpolon monspessulanus* | LESRPE (8 espacios) | **no figura en el Anexo** | 2 → **1** |
    > | *Burhinus oedicnemus* | LESRPE (14 espacios) | **sí figura**, como *B. o. oedicnemus/insularum*, «Península, Baleares y Canarias Orientales» | **se queda** |
    >
    > El alcaraván es el que enseña por qué esto no se podía cerrar desde EIDOS: la clase A lo
    > acusaba en **catorce espacios** porque EIDOS no trae para el taxón de rango ESPECIE ninguna
    > norma nacional —el Anexo cataloga la **subespecie**—, y la ficha tenía razón. **La etiqueta de
    > una autoridad dice lo que opina esa autoridad** (la lección de la nº 4), y aquí la que decide
    > es el BOE.
    >
    > **Y la culebra de collar, por la misma puerta y al revés.** El Anexo lista «*Natrix natrix*»
    > sin restricción de población; EIDOS la ha recombinado a *N. helvetica*, y ese registro no
    > arrastra el LESRPE. Su `spainStatus` está escrito **contra el BOE**, a mano, y por eso ella y
    > el alcaraván siguen saliendo en la clase A del informe: son las dos fichas del catálogo cuyo
    > estado estatal **no es reproducible desde EIDOS**, y un `--refrescar-campos spainStatus`
    > sobre cualquiera de las dos las estropea.
    >
    > **Y al ir al boletín salió lo que nadie buscaba: una norma estatal no siempre protege en toda
    > España, y el pipeline no lo miraba.** El Anexo del RD 139/2011 tiene una columna «Población
    > referida» y EIDOS la sirve en `observacionespoblacion`; `espanaDe()` no la leía. Catorce
    > taxones del catálogo llevaban dentro una norma que **no se aplica en la península**:
    > · *Charadrius alexandrinus* y *Cymodocea nodosa* anunciaban **CEEA: Vulnerable** —tramo 4 y
    >   **destacadas**— por su población **canaria**, teniendo el Anexo una segunda fila
    >   «Península y Baleares» que es solo LESRPE;
    > · *Fringilla coelebs* anunciaba **LESRPE** cuando el Anexo lo lista SOLO con «Canarias»;
    > · ocho culebras nativas —la bastarda, la viperina, la de herradura, la de collar…— anunciaban
    >   **«CEEEI: Incluido»**, que es el catálogo de especies exóticas **INVASORAS** y se les aplica
    >   en «Canarias, Ibiza y Formentera», donde están introducidas. Con ellas el **madroño**, el
    >   **tojo** y la **escoba negra**, que son exactamente los tres que la revisión de Sierra Espuña
    >   del **2026-08-09** ya había corregido **a mano y en un solo `park.json`**: la causa estaba en
    >   el catálogo universal y volvió sola. Una corrección local sobre una causa universal se
    >   deshace, y tarda trece meses en volver a verse.
    >
    > El criterio vive ahora en un solo sitio (`aplicaEnPeninsula`, en `lib/eidos.js`) y lo usan el
    > generador y el cotejo. Se aparta **solo** lo que queda ENTERAMENTE fuera de la península, y el
    > hueco se dice en la frase («1 norma estatal más en EIDOS, aplicable solo fuera de la
    > península») **sin nombrar la figura**: el tramo se lee de ese mismo texto, así que dejar caer
    > ahí un «LESRPE» de Canarias lo devolvería por la puerta de atrás.
    >
    > **Lo que queda de este apartado**, y ahora es corto:
    > · ***Alyssum montanum*** (Sierra de El Carche) — **decisión, no trabajo**. EIDOS lo da por
    >   sinónimo de *Alyssum fastigiatum* Heywood (taxonid 24299, siguiendo Flora iberica), y *A.
    >   fastigiatum* **está en el CEEA como «En peligro de extinción»**: aceptar la sinonimia lleva
    >   la ficha de tramo 1 a **5** y a destacada. Pero bajo ese mismo taxonid EIDOS mete también
    >   *A. gadorense*, que es el endemismo de Sierra de Gádor, y tiene **aparte** aceptada la
    >   subespecie *A. montanum* subsp. *montanum* (80821), **sin ninguna norma**. Y su Lista Roja
    >   española dice **LC**, que con un «En peligro de extinción» estatal al lado no cuadra. El
    >   nombre lo pone el **PRUG del Parque Regional** (Decreto 28/2025), que enumera «Alyssum
    >   montanum». **No se ha tocado**: subir una ficha a tramo 5 por una sinonimia que la propia
    >   fuente se contradice sería inventar el dato, y el hueco documentado vale más.
    > · Los **16 textos de la clase D** y los **9 de la clase G** están a **0** desde el 2026-09-15.
    > · Queda el **`regionalStatus` de Sierra Espuña**, que es lo de siempre: 188 fichas con textos
    >   del piloto. Lo que ya se ha caído de esa lista son las once aves de la ZEPA ajena y los nueve
    >   de la clase G.
    >
    > **Y tres averías de las que fallan en verde, encontradas por el camino y tapadas:** la caché
    > del cotejo indexada por nombre (acusaba al chumberillo de lobo con las filas de un taxonid que
    > ya no era el suyo), `resolveTaxon` desempatando por rango **solo entre las filas aceptadas**
    > (pedir *Calandrella rufescens* devolvía su **subespecie** y pedir *Regulus ignicapillus* la
    > **balearicus**, las dos con `status: 'ok'`), y `regional_status` **sin vía a la base**: la
    > cabecera de `corrige-estado-autonomico.js` decía que ese SQL lo redactaba `rareza-legal.js` y
    > no era verdad —ése escribe el tramo, no el texto—, así que las correcciones de esta cola
    > quedaban bien en el repositorio y viejas en lo que ve el usuario. Ahora `--sql` lo escribe, y
    > **como espejo**, no como cola.

    > **EL BARRIDO ESTÁ HECHO — 2026-08-29.** Lo hace `npm run especies:legal -- --online`
    > (`Tools/catalogo-nacional/coteja-estado-legal.js`) sobre **1.058 taxones de 2.882 fichas** en
    > los dieciséis espacios, y el resultado vive en
    > [`Docs/cotejo-estado-legal.md`](cotejo-estado-legal.md), caso a caso y con las dos citas al
    > lado. **La herramienta no escribe nada**, y no por prudencia genérica: resolver cada caso exige
    > el boletín, que es lo que este apartado ya decía.
    >
    > **Quince discrepancias reales**, en las tres formas que puede tomar:
    >
    > | Clase | Qué es | Casos |
    > |---|---|---|
    > | **A** · afirma sin respaldo | la ficha declara una figura y EIDOS no trae ninguna norma que proteja en ese ámbito | **10** |
    > | **B** · niega teniéndola | la ficha dice «no incluida» y EIDOS sí trae norma vigente | **4** |
    > | **C** · categoría distinta | las dos ven figura, con gravedad distinta | **1** |
    >
    > Y tres clases más que no son discrepancia pero sí hueco: **16** textos que no son un estado
    > legal (D), **13** cuyo tramo cuelga entero de una evaluación o de una Directiva y por tanto
    > `v_estadolegal` no puede confirmar (F), y **9** de la clase G, que es el hallazgo que no
    > esperaba nadie.
    >
    > **La clase G: el catálogo se contradice consigo mismo, y para verlo no hacía falta EIDOS.** Un
    > catálogo autonómico protege a la especie en TODA la comunidad, así que dos espacios de Murcia
    > no pueden dar tramos distintos al mismo taxón. Pues lo hacen en nueve: el alcaraván, el sapo
    > corredor, la cogujada montesina, la gineta, la garduña, la collalba negra, la chova
    > piquirroja, la coscoja y la sabina negral. **En los nueve el espacio que va solo es Sierra
    > Espuña**, que conserva textos del piloto («Catálogo Regional de Especies Amenazadas de la Fauna
    > Silvestre de Murcia: De interés especial») mientras los otros llevan el derivado de EIDOS. Y
    > **no se resuelve por mayoría**, que es justo lo que había que comprobar antes de escribir nada:
    > en ocho casos la mayoría acierta, pero en la **chova piquirroja** el texto correcto es el del
    > espacio que va solo —EIDOS la da «de interés especial» por la Ley 7/1995 y son los otros nueve
    > espacios los que dicen «no incluida»—, así que una votación habría borrado el único bueno.
    > `validate` no puede ver esto porque solo coteja entre parques los campos **universales**, y
    > `regionalStatus` es local por diseño — con razón, porque el día que entre otra comunidad la
    > misma especie tendrá legítimamente dos estados. Por eso la comprobación agrupa **por
    > comunidad**.
    >
    > **Lo más caro de la clase A no es Cabo Cope.** Son **11 espacios** anunciando el alcaraván
    > (*Burhinus oedicnemus*) en LESRPE y **6** la gineta (*Genetta genetta*): EIDOS solo trae para
    > los dos la Ley 42/2007 —Anexo IV y Anexo VI, régimen de explotación, que no protege—. Y la
    > culebra bastarda de este apartado aparece en **5 espacios más** de los que se contaron.
    >
    > **Y la clase C es una sola ficha y hay que mirarla antes que ninguna**: la **tortuga mora**
    > (*Testudo graeca*) de Cabo Cope y Sierra de las Moreras se anuncia como LESRPE (tramo 2)
    > cuando el RD 139/2011 la cataloga **Vulnerable** (tramo 4). Es el error de la siempreviva del
    > §2 del `CLAUDE.md` otra vez, pero al revés: aquí la ficha se queda CORTA, así que la especie
    > emblemática del espacio no llega al umbral de destacada.
    >
    > **Lo que queda, y ahora está acotado**: llevar al BOE y al BORM las quince de A/B/C y las nueve
    > de G, y reescribir como estado legal los 16 textos de la clase D —entre ellos las **once aves
    > de Sierra Espuña cuyo `regionalStatus` cita la ZEPA ES0000261**, que es la de Almenara,
    > Moreras y Cabo Cope y **no la suya** (la suya es la ES0000173, y el código ajeno no aparece en
    > ninguna otra parte de su `park.json`)—, y cinco `spainStatus` que llevan una evaluación de la
    > UICN donde debería ir una norma, teniendo ya el campo `iucnSpain` para eso desde la nº 39.
    >
    > **Y hay un tercer rastro de la misma copia**, que sale en la clase B: el `regionalStatus` de la
    > sabina negral **en Sierra Espuña** dice «población de **Cabo Cope** señalada por su interés
    > biogeográfico». Tres pegotes del piloto en el mismo espacio —la ZEPA ajena, la población
    > ajena y los nueve textos de la clase G— apuntan todos al mismo trabajo: **el `regionalStatus`
    > de Sierra Espuña es el que hay que rehacer entero**, y son 188 fichas con 28 redacciones
    > distintas.

    Salió al desglosar la nº 41: tres fichas de Cabo Cope declaran una figura de
    protección que la selección no ve, porque EIDOS no devuelve **ninguna** norma aplicable para su
    `eidosTaxonId` — y no es un fallo de resolución, los identificadores son los mismos en la ficha
    y en la selección, comprobado en vivo.
    > | Ficha | Lo que dice su texto | Lo que devuelve EIDOS |
    > |---|---|---|
    > | *Malpolon monspessulanus* | «LESRPE» + Catálogo Regional de Murcia, de interés especial | nacional: **solo «CEEEI: Incluido»**, que no protege; **nada de Murcia** (sí de La Rioja, Aragón, Cataluña, Extremadura, País Vasco, C. Valenciana y Castilla-La Mancha) |
    > | *Lavandula dentata* | Decreto 50/2003, de interés especial | **nada, en ningún ámbito** |
    > | *Lavandula multifida* | Decreto 50/2003, de interés especial | **nada, en ningún ámbito** |
    >
    > La contradicción va en los dos sentidos, y por eso no se arregla eligiendo un bando: en la
    > culebra bastarda lo que afirma la ficha **no lo sostiene ninguna fuente consultada**; en las dos
    > lavandas es EIDOS quien no trae un Decreto que sí existe. Hay que ir al BOE y al BORM, taxón a
    > taxón, que es la lección de la nº 4: **la etiqueta de una autoridad dice lo que opina esa
    > autoridad, no si dos autoridades discrepan**.
    >
    > **Por qué no es un detalle:** `mide-niveles-puerta.js` lee la figura legal del **TEXTO de la
    > ficha**, no de EIDOS, así que el **N2 = 47** de Cabo Cope está construido en parte sobre
    > afirmaciones sin cotejar. Y no es solo este espacio: los textos del piloto son 85 redacciones
    > distintas y varias traen añadidos que no son estado legal («Fauna protegida; gecko de
    > roquedos»), como ya anotó `migra-estado-regional.js`. El barrido está **sin hacer**: solo se
    > han mirado estas tres, y salieron de mirar otra cosa.
    >
    > **Las tres se fueron en la poda de la nº 41**, así que si alguna de las tres tenía razón, se ha
    > perdido una ficha protegida. El cotejo sigue haciendo falta: decide de qué lado caen otras 23
    > del mismo espacio.

44. **Un `spainStatus` con una evaluación dentro cambia el tramo, y hay 11 redacciones de la misma
    negación.** El 2026-09-15, al cerrar la cola 1 de la auditoría, se vieron dos cosas que la
    auditoría no perseguía y que siguen abiertas:
    > **(a) La escalera lee evaluaciones del texto, y las lee por accidente.** `lib/rareza.js` tiene
    > una tabla `EVALUACIONES` que asigna tramo **5** a «CR/EN» y **4** a «VU» cuando los ve junto a
    > «Lista Roja» o «Libro Rojo». Con las redacciones reales eso no discrimina lo que pretende:
    > «UICN España: **CR** (En peligro crítico)» sale **5** porque la frase contiene «En peligro
    > crítico», y «UICN España: **EN** (En peligro)» sale **1** porque no contiene ninguna de las dos
    > anclas. Mismo hecho, dos tramos, por qué palabras acierte a llevar la frase. Las 21 fichas cuyo
    > `spainStatus` era una evaluación ya están corregidas —el dato vive en `iucnSpain`, que es un
    > campo normalizado—, así que hoy **la escalera no lo lee de ninguna parte**: `iucnSpain` no
    > entra en `tramoDeTexto`. **DECIDIDO el 2026-09-15: no entra.** Una evaluación de la UICN no es
    > una figura de protección, y `iucnSpain` ya se enseña aparte en la ficha. Queda medido por si
    > alguna vez se reabre: leerla habría subido de tramo **180 fichas** (el halcón peregrino de 3 a 5
    > en 14 espacios, la lechuza común de 1 a 5 en 9) y las destacadas de 346 a unas 500, porque
    > `featured = rarityLocal >= 4`.
    >
    > **(b) Once redacciones para la misma negación.** 2.577 fichas dicen «No incluida en…» de once
    > formas distintas, y solo **461** usan la que escribe hoy el generador (`build-species-n2.js`,
    > desde `data/catalogos-regionales.json`); 1.948 conservan la genérica de antes del 2026-08-27 y
    > 82 citan «el Decreto 50/2003» a secas, que además es el catálogo de **flora** aplicado a
    > fauna. Todas afirman lo mismo y todas dan tramo 1, así que no hay dato mal — hay once maneras
    > de decirlo en un campo que el usuario lee. Uniformarlo es un `--write` con `textoAnterior`
    > (ver `corrige-estado-autonomico.js`), no un criterio nuevo.
    >
    > **(b) PAGADA el 2026-09-19. Eran TRECE redacciones y 2.580 fichas** —la cuenta había crecido
    > con las correcciones del mismo día—, y hoy es **una**. El reparto medido antes de tocar nada:
    > 1.939 con la genérica de antes del 2026-08-27, 470 con la del generador, 81 en Sierra Espuña
    > citando el Decreto de **flora** para fichas de fauna y con una fecha de consulta pegada
    > detrás, 76 en Cuatro Calas con la genérica **sin el paréntesis de la comunidad**, «No
    > catalogada regionalmente» en tres, y **nueve variantes sueltas del piloto** con una coletilla
    > ecológica tras un punto y coma. Se sustituyen 2.110.
    >
    > Tres decisiones que conviene tener escritas:
    > · **Va en su propia bandera (`--uniforma`) y no con las correcciones.** Una corrección cambia
    >   lo que la ficha AFIRMA; esto solo cómo lo dice. Mezclarlas habría hecho imposible leer un
    >   diff de 2.110 fichas buscando las diez que sí cambian un hecho.
    > · **La frase de destino no se escribe en el uniformador.** Se compone en
    >   `lib/catalogos-regionales.js`, extraída del generador, que es quien la escribía: con dos
    >   copias la negación volvería a divergir en la primera comunidad nueva, que es exactamente de
    >   donde se venía. Y la sustitución es por texto **EXACTO** contra una lista declarada en
    >   `uniformacion.<comunidad>`, con de dónde viene cada redacción: nada se reescribe por
    >   parecerse.
    > · **Ninguna ficha cambia de tramo**, y se comprobó ANTES de escribir pasando las trece
    >   redacciones por `lib/rareza.js`: las trece dan 1, igual que la canónica. `especies:rareza`
    >   detrás lo confirma con **0 park.json tocados**, que es la prueba de que esto no ha movido
    >   ningún dato.
    >
    > Lo que sí se pierde y hay que saberlo: las **once coletillas ecológicas** de Sierra Espuña
    > («muy común en la Región», «elemento iberoafricano característico del sureste árido»…) salen
    > de este campo, porque no son un estado legal. Están transcritas taxón a taxón en
    > `rollout/sesiones/2026-09-19.md` por si alguien las quiere en la descripción, que es donde
    > tendrían sitio.
    >
    > De paso, esto se lleva por delante **90 de las 188 fichas con textos del piloto de Sierra
    > Espuña** que la nº 43 dejaba apuntadas como trabajo pendiente.

45. ~~**`--refrescar-campos` conserva el valor viejo cuando la derivación nueva no trae el campo.**~~
    — **PAGADA el 2026-09-19, y eran TRES puertas, no una.** La distinción que pedía este apartado
    —«la fuente ha contestado y no lo trae» frente a «no se ha podido preguntar»— se puede afirmar
    en las tres, y en las tres se estaba perdiendo:
    > **1 · `build-species-universal.js --refrescar-campos`**, que es la que describía el apartado.
    > Un campo pedido que la derivación nueva no trae ahora se **retira**, y se enumera al final del
    > pase. Es legítimo porque el bucle pide EIDOS, GBIF y Wikimedia dentro del mismo `try` y
    > **cualquier fallo saca al taxón del lote con `continue`**: un taxón que llega a `fichas` tiene
    > sus tres fuentes contestadas. Queda escrito en `retira()` que si algún día una fuente pasa a
    > fallar campo a campo sin lanzar, la distinción hay que traerla ahí.
    >
    > **2 · `lista-roja-espana.js`**, la otra herramienta que escribe el mismo campo, y solo sabía
    > escribir: si la ficha traía `iucnSpain` y EIDOS —habiendo contestado— no daba fila de ámbito
    > España, el valor viejo se quedaba. Lo que hacía falta para distinguir **ya estaba calculado
    > ahí** y no se usaba: su `motivo` dice «no se ha podido preguntar» y esas fichas van a
    > `sinResolver`, intactas. Dos retiradas: la **chova piquirroja**, que anunciaba «NT (Lista Roja
    > española, 2004)» siendo una evaluación de ámbito **Península** de 2021 —un ámbito que este
    > campo no recoge por diseño—, y ***Rhamnus pumila***, cuyo taxón aceptado (*Atadinus pumilus*)
    > no tiene en EIDOS **ninguna** fila de conservación. La segunda conviene mirarla si alguien
    > quiere recuperarla: la Lista Roja de la Flora Vascular Española es una publicación real, pero
    > **la procedencia declarada de este campo es EIDOS** (`PROCEDENCIA-DE-CAMPOS.md`), y ahí no
    > está.
    >
    > **3 · Y la que hacía inútiles a las otras dos: `species:apply` no sabía borrar.** Su bucle
    > salta los campos que el catálogo universal no trae —correcto en 754 de los 1.115 taxones, donde
    > «ausente» es «nadie lo ha rellenado»—, así que un campo **retirado** del catálogo sobrevivía en
    > los `park.json`… y el `species:extract` que el runbook manda pasar detrás lo devolvía al
    > catálogo. La prueba está en las cifras: la limpieza a mano del 2026-09-15 tocó **cuatro** fichas
    > universales y **ninguna** de las fichas de los espacios, así que *Sambucus nigra* seguía
    > anunciando en Cañaverosa el «CR en España» del **saúco de La Palma** cuatro días después. Con
    > `--retira <campos>` —el que llama nombra los campos, no se adivina— salen **18 fichas de once
    > espacios**: las cuatro de aquella limpieza (*Sambucus nigra*, *Iberis carnosa*, *Asplenium
    > obovatum*, *Bucanetes githagineus*) y las dos nuevas.
    >
    > La lección que se generaliza, y que no es solo de este campo: **sincronizar es escribir Y
    > retirar**. Una herramienta que solo sabe escribir convierte cualquier corrección que consista
    > en quitar algo en una corrección que se deshace sola.

    El texto original, para saber de dónde venía:
    `build-species-universal.js` aplica el parche con `if (f[campo] !== undefined)`, y eso mezcla dos
    situaciones que no son la misma: «no he podido preguntar» (donde conservar es lo correcto) y «he
    preguntado y la fuente no lo tiene» (donde conservar es quedarse con un dato que ya no sostiene
    nadie). Se vio al reanclar los identificadores del 2026-09-15: cuatro fichas conservaron el
    `iucnSpain` que habían heredado del taxón equivocado —*Sambucus nigra* seguía anunciando «CR en
    España», que es del saúco de La Palma— porque el taxón bueno no tiene fila de ámbito España.
    Se limpiaron a mano esas cuatro; **la causa sigue ahí**. Arreglarlo pide que la ficha construida
    distinga «vacío porque la fuente calla» de «vacío porque no se pudo preguntar», que es la misma
    distinción que ya hacen `lib/fenologia.js` y la deuda nº 38.
