# Ledger de progreso del rollout nacional

> Tabla del §6 de `Docs/prompts/e-rollout-nacional.md`. Se actualiza al cierre de cada sesión de
> Fase 1 (N1), Fase 2 (N2) o Fase 3 (N3, puntos de interés). Formato y niveles (N1/N2/N3) definidos
> en ese mismo documento §0 y §5; el procedimiento de la Fase 3 y su cascada de fuentes, en su §4.
>
> **Este fichero es el índice: la tabla de estado y el listado de sesiones.** Los informes de cierre
> —que son el 95 % del volumen— viven en [`sesiones/`](sesiones/), un fichero por periodo. Lee solo
> el que necesites; están ordenados de más reciente a más antiguo.
>
> **Al cerrar una sesión nueva:** el informe va arriba del todo en el fichero de `sesiones/` que
> corresponda (o uno nuevo si empieza otro periodo), y aquí solo dos cosas: la fila de la tabla y una
> línea en el índice de abajo.

| Comunidad | Provincia | Espacio | Figura | Slug | Nivel | Fecha | Notas / huecos |
|---|---|---|---|---|---|---|---|
| Región de Murcia | Murcia | Cabo Cope y Puntas de Calnegre | Parque Regional | `cabo-cope-puntas-calnegre` | N2 | 2026-08-01 | Piloto. ENP **ES620007**. LIC/ZEC ES6200031 (Cabo Cope) · ES6200012 (Calnegre) · ZEPA ES0000261. **15 hábitats** (retirados el 1110 y el 9560 el 2026-08-01, ver informe), 175 especies. Fotos de florasilvestre.es pendientes de licencia |
| Región de Murcia | Murcia | Cuatro Calas | Paisaje Protegido | `cuatro-calas` | **N3** | 2026-08-08 | Límite IMIDA/CARM. ENP **ES620004** (`ENP000007` es el id interno del IMIDA, no el código oficial). LIC/ZEC ES6200010 · ZEPA marina ES0000507. 7 hábitats (3 prioritarios, 177 ha = 79 % del espacio), **102 especies** (73 flora, 29 fauna incl. 27 aves de la lista oficial Natura 2000), 101 con foto (83 de Wikimedia Commons), **4 POIs, los 4 con foto** de Wikimedia Commons desde el 2026-08-09 (`Database/poi-imagenes.sql` **aplicado y verificado contra la BD y por la API** el 2026-08-09). Ver informe de cierre §"Cuatro Calas: Fase 2 cerrada". **Fase 3 CERRADA el 2026-08-08**: 4 POIs dados de alta, cascada AGOTADA, `validate` en verde y **SQL aplicado y verificado contra la BD** (4/4 POIs, comparación campo a campo y API sirviéndolos). Cumple los tres requisitos del §5. PORN inexistente, 0 BIC, OSM barrido con Overpass. **IELIG consultado de primera mano: 2 LIG dentro del límite, `BE005` «Playa de Cuatro Calas» y `BE006` «Vulcanismo de La Carolina»** (corrige el «La Carolina/Punta Parda» de la primera sesión). Commons consultado, licencias sin verificar — §"2026-08-07 (b)" y `n3-cuatro-calas-sierra-espuna.md`. **Hueco de senderos: `trails.geojson` sirve solo el GR-92; el SL-MU 18, que es el sendero propio del espacio, NO está en OpenStreetMap** (verificado el 2026-08-08 por siete vías, §"2026-08-08"). Entrará solo con `npm run trails:build` en cuanto se mapee |
| Región de Murcia | Murcia | Sierra Espuña | Parque Regional | `sierra-espuna` | **N3** | 2026-08-09 | ENP **ES620013**, 17.693,2 ha. **⚠ El límite servido es anterior a la Ley 1/2026 (vigente 2026-03-08), que excluye 54,3 ha —La Santa y la RM-502—; dentro caen el POI `santuario-de-santa-eulalia`, 27,9 ha de HIC 9560 prioritario y 27,9 de 5330. El IMIDA aún no la ha incorporado. Decidido el 2026-08-09 no tocar nada hasta que el TC resuelva el recurso 4266-2026, ver §"2026-08-09 (c)".** LIC/ZEC ES0000173 · ZEPA ES0000173. 13 hábitats, **188 especies** (tras la revisión del 2026-08-09: fuera el arruí y el tabaco moruno, que pasan a invasoras) tras el recorte a catálogo oficial + evidencia GBIF (121 flora, 69 fauna incl. 48 aves y 9 quirópteros), 189 con foto (174 de Wikimedia Commons; falta solo #58 *Rabo de gato*), **13 POIs, 6 con foto** de Wikimedia Commons desde el 2026-08-09; los otros 7 sin material libre en Commons, hueco cerrado (`Database/poi-imagenes.sql` **aplicado y verificado contra la BD y por la API** el 2026-08-09). Ver informe de cierre §"Sierra Espuña: Fase 2 cerrada" y §"Sierra Espuña: recorte a especies con respaldo oficial". **Fase 3 CERRADA el 2026-08-09**: 13 POIs (9 Cultural, 2 Religioso, 1 Paisajístico, 1 Acceso), **cascada AGOTADA**, `validate` en verde y SQL aplicado y verificado. Cumple los tres requisitos del §5; 2 BIC confirmados con su norma (Pozos de la Nieve, Sitio de Interés Etnográfico; Santuario de Santa Eulalia, *Decreto 96/2002*), OSM barrido con Overpass (28 pozos de nieve uno a uno, Sanatorio situado). **IELIG consultado: 0 LIG dentro del límite**, «no hay» de primera mano. **Anexo I del PRUG (Decreto 6/2026) leído entero el 2026-08-09** por el endpoint `/services/anuncio/…/pdf` del BORM, que no pide captcha: **no contiene inventario de valores**, lo encarga como acción pendiente (AI.17ª), así que los picos y collados se quedan fuera con un «no hay» de primera mano. **BD resuelta el 2026-08-08**: creado y aplicado `Database/sierra-espuna-n2.sql` (fila en `parks` —que no existía y por eso el SQL de POIs insertaba 0 filas en silencio—, 13 hábitats con geometría, 190 especies y 703 enlaces), y reaplicado el de POIs: **13/13 dentro**. Verificado campo a campo contra `park.json` y por la API — §"2026-08-08". Commons consultado, licencias sin verificar — §"2026-08-07 (b)" y `n3-cuatro-calas-sierra-espuna.md` |
| Región de Murcia | Murcia | Carrascoy y El Valle | Parque Regional | `carrascoy-y-el-valle` | **N3** | 2026-08-10 | ENP **ES620008**, 16.685,8 ha. **Fase 3 CERRADA el 2026-08-10 (d)**: **20 POIs** (6 Acceso, 5 Cultural, 4 Paisajístico, 3 Religioso, 1 Arqueológico, 1 Geológico), 3 `approx`, **7 con foto** de Wikimedia Commons, **cascada AGOTADA**. La desbloqueó **el PORN de 2003, aprobado inicialmente por Orden de 18 de mayo de 2005 (BORM n.º 129 de 07.06.2005)**, que las tres sesiones anteriores daban por inexistente: tiene **tres inventarios** —§3.1.2.3 Lugares de Interés Geológico (11, de *El Patrimonio Geológico de la Región de Murcia*, Fundación Séneca 1999), §3.3 hitos paisajísticos singulares y §4.4 Tabla 8 de áreas con yacimientos arqueológicos— más el inventario de uso público del §4.2.7.2. **IELIG consultado de primera mano: 0 LIG dentro del límite** (el más cercano, `GR013` Barqueros, no toca el polígono; intersección 0,00 ha). **Registro de BIC del Ministerio y `patrimonio.carm.es`: siguen bloqueados** (403 y 502 del proxy), así que los códigos BIC citados vienen de Wikidata y OpenStreetMap y **constan como sin contrastar** en el `source` de cada POI; la regla legal sí es de primera mano (**DA 2.ª de la Ley 16/1985 leída en el BOE**). **La BD sigue sin este espacio**: `Database/n3-pois-carrascoy-y-el-valle.sql` queda **PENDIENTE de aplicar**, no hay BD contra la que verificarlo y falta la fila en `parks`. Escrito `build-poi-sql.js` (`pois:sql`) para no teclear el tercer SQL de POIs a mano. **Huecos**: 13 POIs sin foto; el LIG «Bad lands de la Cresta del Gallo (Paisaje lunar)» se queda fuera porque ninguna fuente lo sitúa. Ver §"2026-08-10 (d)". ENP **ES620008**, 16.685,8 ha. LIC/ZEC ES6200002 · ZEPA ES0000269. **15 hábitats** HIC (5 prioritarios, 62 recintos, 0 vértices fuera; el 1430 se cartografió y se retiró por superficie residual, 0,2 ha). Aporta 3 códigos HIC nuevos al catálogo nacional (1520, 3140, 7220). **Fase 2 CERRADA el 2026-08-10 (c)**: **245 especies** (108 flora, 137 fauna incl. **118 aves en el apartado de la ZEPA ES0000269**), **238 con foto**, **548 enlaces especie↔hábitat**, 26 destacadas, **245/245 con `eidosTaxonId`**. Las 100 que quedaron pendientes el 2026-08-10 ya están: no faltaba red, faltaba **la puerta de entrada al catálogo universal**, que ahora es `build-species-universal.js`. **Excluida *Caretta caretta***, que la selección había aprobado: sus 14 ocurrencias son telemetría por satélite (`MACHINE_OBSERVATION`) proyectada tierra adentro, no presencia; motivo escrito en `excluidas_detalle`. **Huecos conocidos**: **98 fichas sin las tres pistas de identificación** —ninguna fuente las sirve; material y canal listos (`--curado`), es el siguiente trabajo del espacio—; **`glossary:check` pasa de 1 a 25 términos sin definir** porque las descripciones de EIDOS son texto técnico («coberteras», «librea», «superciliar»…), trabajo editorial que esta sesión crea; **62 sin `habitat`** porque el atributo de EIDOS nombraba un territorio y un campo universal no puede (regla nº 3); las aves entran con evidencia GBIF, **sin contraste con la lista oficial del sitio Natura 2000** (Discodata/SDF siguen sin ceder) y así consta en su `reviewNote`; **la BD no tiene este espacio** y ya no es por el catálogo sino porque **no existe generador de SQL por espacio** —hay que escribir `build-park-sql.js` en vez de repetir el script de sesión—; el frontend sigue sirviendo la ficha completa desde el paquete. El HIC 1520 se queda con 0 especies porque su polígono (1,2 ha) no tiene ninguna ocurrencia de GBIF dentro. **Fase 3 ABIERTA, no cerrada**: OSM barrido con Overpass (**53 candidatos** dentro del polígono) pero **IELIG y el registro de BIC están bloqueados por el proxy** (403), que son las dos fuentes que aportan el hecho, así que **0 POIs dados de alta** — la cascada no se puede agotar hoy. Ver §"2026-08-10 (c)" |
| Región de Murcia | Murcia | Sierra de la Pila | Parque Regional | `sierra-de-la-pila` | N1 | 2026-07 | ENP **ES620018**, 8851,0 ha. LIC/ZEC ES6200003 · ZEPA ES0000174 |
| Región de Murcia | Murcia | Sierra de El Carche | Parque Regional | `sierra-de-el-carche` | N1 | 2026-07 | ENP **ES620017**, 5869,1 ha. LIC/ZEC ES6200009 |
| Región de Murcia | Murcia | Calblanque, Monte de las Cenizas y Peña del Águila | Parque Regional | `calblanque-monte-cenizas-pena-aguila` | N1 | 2026-07 | ENP **ES620011**, 2466,3 ha. LIC/ZEC ES6200001, ES6200029 · ZEPA ES0000260 |
| Región de Murcia | Murcia | Sierra de Salinas | Paisaje Protegido | `sierra-de-salinas` | N1 | 2026-07 | ENP **ES620027**, 2395,4 ha. LIC/ZEC ES5213039, ES6200008 · ZEPA ES0000457 |
| Región de Murcia | Murcia | Barrancos de Gebas | Paisaje Protegido | `barrancos-de-gebas` | N1 | 2026-07 | ENP **ES620010**, 1908,8 ha. sin solape con Red Natura 2000 |
| Región de Murcia | Murcia | Sierra de las Moreras | Paisaje Protegido | `sierra-de-las-moreras` | N1 | 2026-07 | ENP **ES620005**, 1712,6 ha. LIC/ZEC ES6200011 · ZEPA ES0000261 |
| Región de Murcia | Murcia | Humedal del Ajauque y Rambla Salada | Paisaje Protegido | `humedal-del-ajauque-y-rambla-salada` | N1 | 2026-07 | ENP **ES620016**, 1621,9 ha. LIC/ZEC ES6200005 · ZEPA ES0000195 |
| Región de Murcia | Murcia | Espacios Abiertos e Islas del Mar Menor | Paisaje Protegido | `espacios-abiertos-e-islas-del-mar-menor` | N1 | 2026-07 | ENP **ES620015**, 1307,4 ha. LIC/ZEC ES6200006, ES6200029, ES6200030 · ZEPA ES0000260 |
| Región de Murcia | Murcia | Salinas y Arenales de San Pedro del Pinatar | Parque Regional | `salinas-arenales-san-pedro-pinatar` | N1 | 2026-07 | ENP **ES620012**, 850,5 ha. LIC/ZEC ES0000175 · ZEPA ES0000175 (mismo código, sitio de TIPO C) |
| Región de Murcia | Murcia | Monte Arabí | Monumento Natural | `monte-arabi` | N1 | 2026-07 | ENP **ES620020**, 582,4 ha. sin solape con Red Natura 2000 |
| Región de Murcia | Murcia | Cabezo Gordo | Paisaje Protegido | `cabezo-gordo` | N1 | 2026-07 | ENP **ES620022**, 271,8 ha. LIC/ZEC ES6200013 |
| Región de Murcia | Murcia | Sotos y bosques de ribera de Cañaverosa | Reserva Natural | `sotos-y-bosques-de-ribera-de-canaverosa` | N1 | 2026-07 | ENP **ES620009**, 248,8 ha. LIC/ZEC ES6200004. **Desvío MITECO↔IMIDA del 2,7 %** (248,8 vs 242,1 ha), anotado en el `boundaryNote` |
| Región de Murcia | Murcia | Islas e Islotes del Litoral Mediterráneo | Paisaje Protegido | — | **descartado** | 2026-07 | ENP **ES620023**, 39,5 ha. Territorio marino: islotes sin acceso a pie. Ver §"Dos reglas de producto" |
| Región de Murcia | Murcia | Sima de la Higuera | Monumento Natural | — | **descartado** | 2026-07 | ENP **ES620024**, 49,0 ha. Geológico fuera de territorio protegido (3,5 km de Sierra Espuña) |
| Región de Murcia | Murcia | Capa Negra de Caravaca de la Cruz | Monumento Natural | — | **descartado** | 2026-07 | ENP **ES620025**, 24,0 ha. Geológico fuera de territorio protegido (18,5 km del ENP más cercano) |
| Región de Murcia | Murcia | Gredas de Bolnuevo | Monumento Natural | — | **descartado** | 2026-07 | ENP **ES620021**, 2,4 ha. Geológico fuera de territorio protegido. **POI pendiente de `sierra-de-las-moreras`** |
| Región de Murcia | Murcia | Salto del Usero | Monumento Natural | — | **retirado** | 2026-07-28 | ENP **ES620026**, 1,7 ha, **Bullas**. Se dio de alta el 2026-07-27 (ver «desbloqueado» más abajo) y se retiró al día siguiente por decisión explícita. Municipio y demás datos siguen resueltos y documentados por si se retoma |

> **Murcia tiene 21 espacios protegidos** según la capa ENP oficial (diciembre 2025). Al cierre del
> 2026-08-10 (d) hay **16 dados de alta** (**3 en N3** —Cuatro Calas, Sierra Espuña y Carrascoy y El
> Valle—, **1 en N2** —Cabo Cope, N3 de facto por sus 15 POIs pero sin la cascada recorrida con el
> procedimiento del §4— y **12 fichas base**),
> **4 descartados** por las reglas de producto y
> **1 retirado** tras haber estado dado de alta (Salto del Usero). El listado completo con código y superficie está en
> `Tools/catalogo-nacional/out/inventario-fuentes-bdn.md`.

### Salto del Usero: desbloqueado (2026-07-27)

Estaba fuera por no tener municipio, y el motivo registrado era «no figura con carácter Firme en el
IMIDA». **Ese razonamiento era erróneo**: el municipio nunca salió de la capa ENP del IMIDA, sale de
cruzar la geometría contra los **límites municipales del CNIG**, que es otro servicio. Aplicado el
mismo método que a los otros 20 sobre la geometría del MITECO (centroide 38.026203, −1.673310), el
servicio devuelve **un único municipio: Bullas (INE 30012)**.

Lo que sí se confirma es que **no está en la capa ENP del IMIDA**: es el único espacio de Murcia sin
delimitación regional, así que conserva el límite del MITECO y no pasa por
`refina-limites-imida.js`.

> **Guardián nuevo en `build-n1-espacios.js`.** Al dar de alta Salto del Usero, el generador
> **regeneró y empeoró los 14 límites ya refinados** desde el IMIDA (Calblanque volvió de 4.832 a
> 1.489 vértices), porque reconstruye `geo/parque.geojson` desde la capa nacional para todos sus
> objetivos. Ahora detecta la marca `CodigoIMIDA` —que sólo escribe el refinador— y **deja intacto**
> el espacio, avisando. Para rehacer uno de cero hay que borrar su carpeta.

---


## Índice de sesiones

Cada línea es un informe de cierre. El título dice la conclusión; entra al fichero solo si te hace
falta el detalle.

### [`sesiones/2026-08-10.md`](sesiones/2026-08-10.md)

| Sesión | Qué se cerró |
|---|---|
| 2026-08-10 (d) | **El PORN de Carrascoy existía y nadie lo había abierto**: trae tres inventarios. 20 POIs, N3 cerrado |
| 2026-08-10 (c) | **Se rompe el círculo**: una especie nueva ya puede entrar en el catálogo. Carrascoy cierra su Fase 2 con 245 especies y se paga la deuda nº 4 |
| 2026-08-10 (b) | El catálogo universal deja de acumular nombres muertos: `--podar` y seis claves de `contenido/` reenganchadas |
| 2026-08-10 | Carrascoy sube a N2, y **el alta de especies deja de hacerse a mano**: `build-species-n2.js` |

### [`sesiones/2026-08-09.md`](sesiones/2026-08-09.md) · 781 líneas

| Sesión | Qué se cerró |
|---|---|
| 2026-08-09 (g) | Revisión de Sierra Espuña: **tres fichas daban por invasora una especie nativa** |
| 2026-08-09 (f) | Carrascoy y El Valle: Capa 2 hecha (16 hábitats). Sigue en N1 hasta tener especies |
| 2026-08-09 (e) | El PRUG, abierto: **no trae inventario de valores, lo encarga**. Sierra Espuña cierra su N3 |
| 2026-08-09 (d) | El facsímil del BOE, y **57 capas del IMIDA que el rollout no estaba usando** |
| 2026-08-09 (d) | Las cuatro fotos de Cuatro Calas, cambiadas; y dos vías más para buscar |
| 2026-08-09 (c) | La Ley 1/2026 **sí recorta Sierra Espuña**, y NaturDex sirve el límite anterior |
| 2026-08-09 (b) | `poi-imagenes.sql` aplicado: las 10 fotos llegan ya por la API |
| 2026-08-09 | Fotos de los 17 POIs: **10 con foto, 7 sin material libre**. Y el bug que las escondía |

### [`sesiones/2026-08-07-08.md`](sesiones/2026-08-07-08.md) · 453 líneas

| Sesión | Qué se cerró |
|---|---|
| 2026-08-08 | Cuatro Calas: el SL-MU 18 **no está en OpenStreetMap**. Hueco confirmado, no inventado |
| 2026-08-08 | El mecanismo de fotos de POIs, documentado; y el alias que evitaba encontrarlas |
| 2026-08-07 (b) | La cascada de la Fase 3, recorrida: **sigue abierta, y con menos huecos** |
| 2026-08-07 | Fase 3 arrancada en Cuatro Calas y Sierra Espuña: abierta, no cerrada |

### [`sesiones/2026-08-01-02.md`](sesiones/2026-08-01-02.md) · 330 líneas

| Sesión | Qué se cerró |
|---|---|
| 2026-08-02 | **El esparto era dos especies**: un taxón, dos nombres, dos fichas |
| 2026-08-01 | Cuatro Calas: Fase 2 cerrada (N1 → N2) |
| 2026-08-01 | Fotos: de pliegos de herbario a fotos de campo (todo el catálogo) |
| 2026-08-01 | Cabo Cope: retirados el HIC 1110 y el 9560 (vuelve a 15 hábitats) |

### [`sesiones/2026-07.md`](sesiones/2026-07.md) · 723 líneas — el arranque

| Sesión | Qué se cerró |
|---|---|
| 2026-07-28 | Salto del Usero retirado de la lista de parques |
| 2026-07-28 | Sierra Espuña: recorte a especies con respaldo oficial + fotos/nombres de Wikipedia |
| 2026-07-28 | Sierra Espuña: Fase 2 cerrada (Capa 3, catálogo de especies) |
| 2026-07-27 | Capa de hábitats curada (Atlas 2005) en Cabo Cope y Sierra Espuña |
| 2026-07-27 | Límites reimportados del IMIDA: los 15 espacios, sin generalizar |
| 2026-07-27 | Fase 2 de Sierra Espuña: Capa 2 hecha, y dos fallos del pipeline corregidos |
| 2026-07-27 | **Dos reglas de producto**: nada marino, nada geológico suelto |
| 2026-07-27 | Fase 1 (N1): los espacios pendientes de la Región de Murcia |
| 2026-07-25 | Fuentes MITECO/IEPNB y corrección del estado de conservación del piloto |

---

## Referencia extraída del ledger

Esto **no** es histórico y por eso ya no vive aquí dentro:

| Documento | Contenido |
|---|---|
| [`PARAMETROS-POR-PROVINCIA.md`](PARAMETROS-POR-PROVINCIA.md) | Huso UTM verificado, códigos y descargas del MITECO por provincia. **Consulta obligada en el Paso 0 de una Fase 2** |
| [`n3-cuatro-calas-sierra-espuna.md`](n3-cuatro-calas-sierra-espuna.md) | La cascada de fuentes de POIs recorrida en los dos espacios |
