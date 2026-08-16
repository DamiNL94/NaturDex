# Deuda técnica, por orden de rentabilidad

Cada una se paga mejor ahora que en el espacio número treinta.

1. **Cinco espacios no tienen localizado su plan de gestión, y desde el 2026-08-16 eso decide el
   catálogo entero, no solo las aves.**
   > **Subió de precio el 2026-08-16.** Con el orden de prioridad nuevo —legislación → EIDOS → GBIF,
   > regla nº 3 del `CLAUDE.md`— el plan de gestión pasó de ser «la evidencia más fuerte» a ser **la
   > puerta de entrada del nivel 1**, y un espacio sin plan transcrito se queda solo con lo que
   > respalden el formulario del sitio, la figura legal y el Atlas. Se ve en la medición: los cuatro
   > espacios **con** anexo transcrito tienen entre el 8 % y el 33 % de fichas sostenidas solo por
   > GBIF; los cuatro **sin** anexo, entre el 33 % y el 51 %. Cuatro Calas es el peor caso, con la
   > mitad del catálogo colgando de avistamientos sueltos. Transcribir los planes que faltan
   > —Carrascoy, Cabo Cope, Cuatro Calas y Sierra Espuña— es hoy el trabajo más rentable del rollout.

   Lo que sigue es el diagnóstico anterior, que sigue valiendo para las aves. Desde que el ave entra
   por respaldo de sitio
   ([`runbook/AVES.md`](runbook/AVES.md)), el anexo normativo dejó de ser «la evidencia más fuerte» y
   pasó a ser, en la práctica, **la única fuente que da un catálogo de aves completo**: el Formulario
   Normalizado de Datos de un sitio Red Natura 2000 solo declara las de interés comunitario —su
   sección 3.3, la de «otras especies importantes», está vacía en la práctica totalidad de los sitios
   españoles— y su perímetro no es el del espacio protegido. El resultado se mide sin ambigüedad: los
   tres espacios con el plan transcrito conservan **46, 61 y 66** aves; los cinco que solo tienen
   formulario, **17, 18, 34, 40 y 48**. Sierra de la Pila son 8.800 ha de sierra con 17 aves fichadas.
   `Tools/catalogo-nacional/data/normativa-espacios.json` solo cubre el Decreto 28/2025 del
   Altiplano; **Carrascoy, Sierra de la Pila, Cabo Cope, Cuatro Calas y Sierra Espuña no tienen ni
   siquiera localizado el documento**, que es el primer paso y el barato. Bajar el umbral NO es una
   alternativa: devolvería el ruido de vuelo que este cambio quitó.
2. **`murcia_status` está atado a Murcia.** Es el bloqueo real del rollout nacional a nivel de campo:
   cada comunidad tiene su propio catálogo de especies amenazadas. Hay que renombrarlo a algo como
   `regional_status` + `regional_norma`, y tocar exactamente: `Database/schema.sql` y una migración,
   `Backend/Lib/park_payload.php:129`, `Backend/Api/admin.php` (3 sentencias),
   `Frontend/Js/render.js:423` (que además tiene la etiqueta «Región de Murcia» escrita a mano),
   `Tools/sync-species-catalog.js` (lista `LOCALES`) y `Tools/catalogo-nacional/fix-estado-conservacion-iepnb.js`.
   Hace falta además una tabla **comunidad → norma** para que el campo no sea texto libre distinto en
   cada espacio. `Tools/eidos-diff.js` ya acepta `--ccaa`.
3. **El pipeline de hábitats no escribe en la BD.** `adopt-habitats.js` toca `Frontend/` y nada más, así
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
4. **Claves externas incoherentes** — lo que reporta hoy `npm run taxones:duplicados` (sale con
   código 1 mientras queden):
   - **1 taxón duplicado**: la `gbifSpeciesKey` **3064** está puesta en dos especies distintas de
     Cabo Cope (*Salsola vermiculata* y *Arthrocnemum macrostachyum*) porque **3064 es Amaranthaceae,
     la FAMILIA**. Una clave de familia no identifica nada: cualquier consulta de ocurrencias con ella
     devuelve la familia entera. Mismo caso en *Stipa capensis* (3073 = Poaceae) y *Sedum sediforme*
     (2406 = Crassulaceae). **Estos tres son arreglo mecánico**: basta volver a resolverlos con
     `gbif.matchName()`, que ahora devuelve el rango y permite rechazar lo que no sea específico.
   - **9 identificadores incoherentes** entre espacios: `eidosTaxonId` distinto en `Sedum sediforme`
     y `Olea europaea subsp. europaea`, y `gbifSpeciesKey` distinta en siete casos donde un espacio
     usa la clave del sinónimo y otro la del nombre aceptado. **Estos NO son mecánicos**: exigen
     decidir si el catálogo sigue el nombre aceptado de EIDOS a rajatabla y, en varios, si la cita del
     espacio se refiere de verdad al taxón que GBIF considera aceptado.
   - `eidosTaxonId` duplicados: **0**. El esparto era el único de su clase.
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
18. **`playa-Charco`: un `slug` de POI con mayúscula, y es clave única en la BD.** Lo destapó la
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
20. **La curruca rabilarga sigue partida en dos, aunque el escáner ya la vea.** Es `Curruca undata`
    (EIDOS **80931**, GBIF **10355796**) en unos espacios y `Sylvia undata` (**80230**, **2492949**)
    en otros, y lo mismo con *atricapilla*, *hortensis*, *communis* y *borin*. **La mitad de detección
    está hecha**: la tercera pasada por epíteto de `scan-taxones-duplicados.js` la propone desde el
    2026-08-16, y las dos sesiones que la encontraron por separado —una mirando el escáner y otra
    regenerando Carrascoy— llegaron al mismo diagnóstico. Lo que queda es **elegir un nombre y
    renombrar** en los `park.json`, en `data/contenido/` y en el catálogo universal, con la trampa del
    §2 del `CLAUDE.md` delante: renombrar desengancha la ficha de su texto, que se indexa por nombre
    científico. Ver ESTADO.md, §"2026-08-16".
21. **El PORN de Carrascoy y El Valle no tiene inventario de especies, y conviene que conste.** Sus
    tres inventarios —§3.1.2.3 lugares de interés geológico, §3.3 hitos paisajísticos y §4.4 Tabla 8
    de yacimientos— son los que desbloquearon su Fase 3, y ninguno enumera fauna ni flora. Mientras
    no esté escrito en `data/normativa-espacios.json`, cada sesión que mire este espacio volverá a
    abrir el PDF para averiguar lo mismo. Un `encontrado: true` con `inventarioDeEspecies: false`
    ahorra esa búsqueda, y es la misma regla que ya aplica el anexo normativo: **un espacio sin
    entrada no es un espacio sin anexo, es un anexo no consultado**.
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
23. **Tres espacios no tienen su barrido de GBIF versionado, y por eso 1.113 enlaces no se pueden
    revisar.** Son Cabo Cope, Cuatro Calas y Sierra Espuña: `out/<slug>-gbif.json` existe para los
    cinco restantes y para estos no, así que la auditoría de enlaces los deja en «no evaluable» —el
    estado honesto, pero un hueco—. Se cierra con una pasada de
    `npm run gbif:habitats -- --park <slug> --json Tools/catalogo-nacional/out/<slug>-gbif.json` por
    espacio, que **necesita red**. Sierra Espuña es además el caso interesante: 38 de sus fichas
    tienen `gbifOccurrences: 0` y 197 enlaces, porque los suyos son documentales (fichas de flora de
    la Región de Murcia) y no salen de ningún barrido.
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
    > 330 fichas suben a nivel 2** (el pino carrasco y el albardín entre ellas, +4 más cuando el
    > cruce resuelva *Stipa*↔*Macrochloa* contra EIDOS). Pero la medición enterró una esperanza que
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
    > verbatim, que es la transcripción literal de la norma. Hay que hacerlo con el documento delante,
    > espacio por espacio, y los cuatro espacios con anexo lo necesitan.
