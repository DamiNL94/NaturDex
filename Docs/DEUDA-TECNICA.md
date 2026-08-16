# Deuda técnica, por orden de rentabilidad

Cada una se paga mejor ahora que en el espacio número treinta.

1. **`murcia_status` está atado a Murcia.** Es el bloqueo real del rollout nacional a nivel de campo:
   cada comunidad tiene su propio catálogo de especies amenazadas. Hay que renombrarlo a algo como
   `regional_status` + `regional_norma`, y tocar exactamente: `Database/schema.sql` y una migración,
   `Backend/Lib/park_payload.php:129`, `Backend/Api/admin.php` (3 sentencias),
   `Frontend/Js/render.js:423` (que además tiene la etiqueta «Región de Murcia» escrita a mano),
   `Tools/sync-species-catalog.js` (lista `LOCALES`) y `Tools/catalogo-nacional/fix-estado-conservacion-iepnb.js`.
   Hace falta además una tabla **comunidad → norma** para que el campo no sea texto libre distinto en
   cada espacio. `Tools/eidos-diff.js` ya acepta `--ccaa`.
2. **El pipeline de hábitats no escribe en la BD.** `adopt-habitats.js` toca `Frontend/` y nada más, así
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
3. **Claves externas incoherentes** — lo que reporta hoy `npm run taxones:duplicados` (sale con
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
4. ~~**`spainStatus` con normas de otras comunidades autónomas.**~~ **PAGADA el 2026-08-10.** Eran 60
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
5. **Tabla de reconciliación taxonómica nacional.** Existe la del piloto
   (`out/cabo-cope-puntas-calnegre-reconciliacion.json`, 124 especies); falta acumular todos los
   espacios sin duplicar por `eidos_taxonid`.
   > **Parcialmente cubierta el 2026-08-11.** `build-species-seleccion.js` ya reconcilia **al dar de
   > alta un espacio**: agrupa los candidatos de GBIF por `eidosTaxonId` y elige el nombre que ya use
   > otro parque, así que un espacio nuevo no puede introducir un duplicado. En Sierra de la Pila
   > fueron 8 grupos, dos de ellos la misma especie dos veces *dentro* del espacio (*Sylvia* /
   > *Curruca melanocephala* y *Picus viridis* / *sharpei*). Lo que sigue faltando es la tabla
   > **acumulada** y la limpieza de los 9 identificadores incoherentes del punto 3, que son
   > anteriores y no los arregla este mecanismo.
6. **Completar `hic-nombres.json` y `hic-prioritarios.json`** al entrar en cada provincia nueva. No es
   opcional: un código sin ficha se salta el filtro marino (ver [trampas](runbook/TRAMPAS-CONOCIDAS.md)).
7. **Fotos de florasilvestre.es pendientes de licencia** en Cabo Cope: 13 fichas usadas en el contexto
   de este prototipo educativo. Antes de cualquier uso público hay que confirmar el permiso o
   sustituirlas por equivalentes de licencia libre.
   > **Sigue abierta, pero se ve mejor desde el 2026-08-14.** El visor de imagen (`Js/visor.js`)
   > pinta la atribución **debajo de la foto ampliada**, que es donde más se mira: la cita ya no vive
   > solo en un pie de 11 px al final de la ficha. No paga la deuda —una cita no es un permiso—,
   > pero deja a la vista de quién es cada foto sin tener que buscarlo.
8. ~~**Cero POIs en Sierra Espuña y Cuatro Calas.**~~ **PAGADA**: Cuatro Calas cerró su N3 el
   2026-08-08 (4 POIs) y Sierra Espuña el 2026-08-09 (13). El diagnóstico —«no hay fuente con
   coordenadas descargables»— resultó ser medio cierto y medio pereza: **el plan del espacio estaba
   publicado en PDF y descargable**, y en dos de los cuatro espacios que han cerrado N3 —Carrascoy y
   Sierra de la Pila— es **lo que desbloqueó el nivel**. Lo que sí se confirmó es que el plan no trae
   coordenadas: las pone OpenStreetMap y el hecho lo pone el plan, que es exactamente la cascada
   del §4.2.
9. **El glosario no cubre el vocabulario geológico, y son 32 términos.** Los saca a la luz el arreglo
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
10. **Duplicación consciente**: `AdminPanel/src/api.ts` y el cliente de la API del frontend son dos
    implementaciones del mismo contrato. Se mantienen separadas porque son dos aplicaciones distintas
    (React con build vs. módulos ES sin build).
11. **`php Tools/recalculate-account-progress.php` pendiente de ejecutar**, desde el 2026-08-14. Ese
    día se recalibraron cuatro umbrales de `Data/achievements.json` (v3) y entraron tres logros
    nuevos con dos métricas nuevas; el recálculo hay que lanzarlo **al desplegar**, con la BD viva,
    que en aquella sesión no estaba levantada. Nadie pierde nada por el retraso —`evaluateAchievements`
    solo añade, nunca retira, y los cuatro umbrales bajan— pero hasta entonces los logros de las
    métricas nuevas solo los concede la predicción local, no el servidor.
12. **Seis logros territoriales fuera de alcance mientras el catálogo siga en una sola comunidad.**
    Son los de `regionsVisited` y `provincesVisited`: apuntan a la España entera a propósito, y la
    medalla lo dice con el número que saca del registro, así que no engañan a nadie. Se cierra solo
    según avance el rollout; `npm run validate` los lista en cada pasada para que no se olviden.
13. **El Darwin Core Archive no ha pasado por el validador de GBIF.** Está generado y comprobado
    contra sí mismo —identificadores únicos, columnas cuadradas con la cabecera, fechas ISO 8601 con
    huso, coordenadas en rango, `meta.xml` y `eml.xml` bien formados—, y eso **no es** una validación
    de GBIF. Falta pasarlo por el [Data Validator](https://www.gbif.org/tools/data-validator), que
    exige un archivo sobre datos reales y una cuenta; el informe va en `Docs/DARWIN-CORE.md` cuando se
    haga. Con él van dos huecos declarados del propio conjunto: `locationID` **sin el código
    Natura 2000** (la tabla `parks` no lo guarda; vive en el `park.json` empaquetado) y
    `scientificNameID` **vacío** (falta el identificador nomenclatural: IPNI / Index Fungorum).
14. **Las citas sin coordenada no son ocurrencias, y son la mayoría de lo marcado.** Un «visto» sin
    permiso de GPS se queda en `user_progress` y no llega a `user_occurrences`: no dice dónde ocurrió
    nada. Es la decisión correcta para publicar, pero significa que el conjunto científico será
    bastante más pequeño que el progreso de la gente, y conviene medirlo antes de prometerle un
    volumen a nadie. Lo mismo con las citas de invasoras anteriores al 2026-08-15, que salen con el
    hueco dicho en `occurrenceRemarks`.
15. ~~**`habitat-images.js` no filtra la licencia, y `poi-images.js` sí.**~~ — **saldada el
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
16. **La migración de ocurrencias está probada en MariaDB 10.11, no en MySQL 8.4.** El contenedor del
    proyecto es `mysql:8.4` y ahí no se ha podido levantar en esta sesión. Se escribió a propósito sin
    `LATERAL` ni `CAST(… AS JSON)` para que valga en los dos motores, y en MariaDB pasa dos veces sin
    diff, pero **el primer pase contra el MySQL real hay que mirarlo**, con `npm run db:backup` hecho
    antes.
17. **`playa-Charco`: un `slug` de POI con mayúscula, y es clave única en la BD.** Lo destapó la
    auditoría del N3 del 2026-08-15 (g). El §4.3.8 pide el id en slug estable —minúsculas, sin tildes,
    guiones— porque es `points_of_interest.slug`, único por parque, y este lleva una `C` mayúscula
    desde el piloto. **No se arregla editando el `park.json`**: el mismo literal está en
    `Database/seed.sql`, en `Database/snapshot.sql`, en `Database/recolocar-pois.sql` y en la fila viva
    de la BD, así que hay que renombrarlo en los cuatro sitios a la vez o el POI se duplica al
    siguiente import. Por eso `validate` lo da como **aviso y no como error**: bloquear el commit por
    una deuda que solo se salda tocando la BD dejaría el repo sin red de seguridad para todo lo demás.
    Es un rato de trabajo, pero hay que hacerlo en el mismo paso que la carga de SQL pendiente.
18. ~~**Sierra de la Pila y Carrascoy y El Valle sobre la métrica de mosaico.**~~ — **PAGADA el
    2026-08-16.** Los dos se regeneraron: Sierra de la Pila pasa de 245 a 246 fichas podando cuatro
    que declaraban cinco hábitats teniendo **una** ocurrencia, y Carrascoy de **245 a 468**. Con
    ellos ya no queda ningún espacio construido sobre la cuenta inflada.
    > **El diagnóstico que traía esta deuda estaba mal en un punto y conviene dejarlo escrito.** Se
    > dijo que el catálogo de Carrascoy «se construyó con el 41 % de los datos» porque `--max-occ`
    > valía 40.000 sobre un bbox de 97.362. La truncadura es real, pero **no es lo que costaba las
    > fichas**: el volcado truncado traía 1.460 especies dentro de los polígonos y el completo trae
    > 1.463. Lo que la truncadura falseaba es el número de **registros por especie**; el salto de
    > fichas lo produce la corrección de la métrica. Dos defectos reales, y se habían mezclado.
19. **La misma especie con dos nombres Y dos identificadores, que es lo único que `taxones:duplicados`
    no puede ver.** La curruca rabilarga es `Curruca undata` (eidos **80931**, gbif **10355796**) en
    Cabo Cope y Sierra Espuña, y `Sylvia undata` (**80230**, **2492949**) en los otros seis espacios;
    igual con *atricapilla*, *hortensis*, *communis* y *borin*. El escáner busca **un id con dos
    nombres** y **un nombre con dos ids**, y este caso no es ninguno de los dos: las dos mitades son
    internamente coherentes y sólo se ven juntas si alguien sabe que son la misma ave. Son dos
    trabajos: enseñarle a mirarlo —por epíteto y nombre común, no sólo por id— y después elegir un
    nombre y renombrar en los `park.json`, en `data/contenido/` y en el catálogo universal, con la
    trampa del §2 del `CLAUDE.md` delante. Ver ESTADO.md, §"2026-08-16".
20. **El PORN de Carrascoy y El Valle no tiene inventario de especies, y conviene que conste.** Sus
    tres inventarios —§3.1.2.3 lugares de interés geológico, §3.3 hitos paisajísticos y §4.4 Tabla 8
    de yacimientos— son los que desbloquearon su Fase 3, y ninguno enumera fauna ni flora. Mientras
    no esté escrito en `data/normativa-espacios.json`, cada sesión que mire este espacio volverá a
    abrir el PDF para averiguar lo mismo. Un `encontrado: true` con `inventarioDeEspecies: false`
    ahorra esa búsqueda, y es la misma regla que ya aplica el anexo normativo: **un espacio sin
    entrada no es un espacio sin anexo, es un anexo no consultado**.
