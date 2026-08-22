# Deuda técnica, por orden de rentabilidad

Cada una se paga mejor ahora que en el espacio número treinta.

1. **Cuatro espacios no tienen transcrito su plan de gestión, y desde el 2026-08-16 eso decide el
   catálogo entero, no solo las aves.** Son **Carrascoy y El Valle, Cabo Cope, Cuatro Calas y Sierra
   Espuña**.
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
   > **Vuelto a medir el 2026-08-22 sobre trece espacios: 331 de 2.035 (16 %).** La cifra baja porque
   > los cinco espacios dados de alta desde entonces llegan con su plan transcrito y ahí el suelo se
   > hunde —San Pedro del Pinatar, Calblanque y Cabezo Gordo se quedan en **0**, y el Humedal del
   > Ajauque en **2 de 175**—. Arriba siguen los cuatro sin plan (Carrascoy 50 %, Cuatro Calas 47 %,
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

   Lo que sigue es el diagnóstico anterior, que sigue valiendo para las aves. Desde que el ave entra
   por respaldo de sitio
   ([`runbook/AVES.md`](runbook/AVES.md)), el anexo normativo dejó de ser «la evidencia más fuerte» y
   pasó a ser, en la práctica, **la única fuente que da un catálogo de aves completo**: el Formulario
   Normalizado de Datos de un sitio Red Natura 2000 solo declara las de interés comunitario —su
   sección 3.3, la de «otras especies importantes», está vacía en la práctica totalidad de los sitios
   españoles— y su perímetro no es el del espacio protegido. El resultado se mide sin ambigüedad: los
   tres espacios con el plan transcrito conservan **46, 61 y 66** aves; los cinco que solo tienen
   formulario, **17, 18, 34, 40 y 48**. Sierra de la Pila son 8.800 ha de sierra con 17 aves fichadas.
   `Tools/catalogo-nacional/data/normativa-espacios.json` cubre hoy **seis documentos** —el Altiplano,
   el PORN de la Sierra de la Pila y su PRUG, los dos PORN de 1995 de Calblanque y San Pedro, el Plan
   del Mar Menor y el Decreto 252/2022 de los relieves centro-orientales—, y **el documento de
   Carrascoy, Cabo Cope, Cuatro Calas y Sierra Espuña sigue sin localizar**, que es el primer paso y
   el barato — y desde el 2026-08-22 hay índice para hacerlo (arriba). Bajar el umbral NO es una
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
    > verbatim, que es la transcripción literal de la norma. Hay que hacerlo con el documento delante,
    > espacio por espacio, y los cuatro espacios con anexo lo necesitan.
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

29. **511 de las 992 fichas del catálogo universal siguen con un `rarityScore` puesto a ojo, y hasta
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
30. **Once fichas se quedan sin tramo de rareza porque su `spainStatus` dice «pendiente de
    confirmar».** Reparten entre ocho espacios y casi todas son el mismo puñado de taxones: la
    coscoja (5 fichas), la alhucema (3), *Lavandula dentata* y *Centaurium rigualii*. La Lista Roja
    de la Flora Vascular Española 2008 no puede listar a las comunes —enumera taxones amenazados—
    pero nadie lo ha comprobado contra la fuente. Están en
    [`Tools/catalogo-nacional/out/rareza-por-contrastar.md`](../Tools/catalogo-nacional/out/rareza-por-contrastar.md)
    y la app las enseña con el aviso de precaución por defecto, que es la regla nº 9 del `CLAUDE.md`.
    Las resuelve una consulta a EIDOS con red.
31. **`featured` y el tramo de rareza no dicen lo mismo en cinco espacios, y son 104 fichas.**
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

    Lo que queda: **regenerar los nueve espacios**, que no se ha hecho porque cada regeneración
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

33. **El mismo taxón fichado dos veces por culpa de un trinomio: 4 pares en 3 espacios.** El
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

    Lo que queda son los pares **ya escritos**, que solo se van regenerando el espacio:

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
    bicho. Lo que queda son **4 fichas en 2 espacios** —Espacios Abiertos e Islas del Mar Menor (3) y
    Calblanque (1)—, que se recuperan al regenerar. Es la deuda más barata de las que exigen
    regeneración, y viaja con la nº 32 y la nº 33 en el mismo pase.
