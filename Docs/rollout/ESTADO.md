# Ledger de progreso del rollout nacional

> Tabla del §6 de `Docs/prompts/e-rollout-nacional.md`. Se actualiza al cierre de cada sesión de
> Fase 1 (N1), Fase 2 (N2) o Fase 3 (N3, puntos de interés). Formato y niveles (N1/N2/N3) definidos
> en ese mismo documento §0 y §5; el procedimiento de la Fase 3 y su cascada de fuentes, en su §4.

| Comunidad | Provincia | Espacio | Figura | Slug | Nivel | Fecha | Notas / huecos |
|---|---|---|---|---|---|---|---|
| Región de Murcia | Murcia | Cabo Cope y Puntas de Calnegre | Parque Regional | `cabo-cope-puntas-calnegre` | N2 | 2026-08-01 | Piloto. ENP **ES620007**. LIC/ZEC ES6200031 (Cabo Cope) · ES6200012 (Calnegre) · ZEPA ES0000261. **15 hábitats** (retirados el 1110 y el 9560 el 2026-08-01, ver informe), 175 especies. Fotos de florasilvestre.es pendientes de licencia |
| Región de Murcia | Murcia | Cuatro Calas | Paisaje Protegido | `cuatro-calas` | **N3** | 2026-08-08 | Límite IMIDA/CARM. ENP **ES620004** (`ENP000007` es el id interno del IMIDA, no el código oficial). LIC/ZEC ES6200010 · ZEPA marina ES0000507. 7 hábitats (3 prioritarios, 177 ha = 79 % del espacio), **102 especies** (73 flora, 29 fauna incl. 27 aves de la lista oficial Natura 2000), 101 con foto (83 de Wikimedia Commons), **4 POIs** (sin foto). Ver informe de cierre §"Cuatro Calas: Fase 2 cerrada". **Fase 3 CERRADA el 2026-08-08**: 4 POIs dados de alta, cascada AGOTADA, `validate` en verde y **SQL aplicado y verificado contra la BD** (4/4 POIs, comparación campo a campo y API sirviéndolos). Cumple los tres requisitos del §5. PORN inexistente, 0 BIC, OSM barrido con Overpass. **IELIG consultado de primera mano: 2 LIG dentro del límite, `BE005` «Playa de Cuatro Calas» y `BE006` «Vulcanismo de La Carolina»** (corrige el «La Carolina/Punta Parda» de la primera sesión). Commons consultado, licencias sin verificar — §"2026-08-07 (b)" y `n3-cuatro-calas-sierra-espuna.md`. **Hueco de senderos: `trails.geojson` sirve solo el GR-92; el SL-MU 18, que es el sendero propio del espacio, NO está en OpenStreetMap** (verificado el 2026-08-08 por siete vías, §"2026-08-08"). Entrará solo con `npm run trails:build` en cuanto se mapee |
| Región de Murcia | Murcia | Sierra Espuña | Parque Regional | `sierra-espuna` | N2 | 2026-07-28 | ENP **ES620013**, 17.693,2 ha. LIC/ZEC ES0000173 · ZEPA ES0000173. 13 hábitats, **190 especies** tras el recorte a catálogo oficial + evidencia GBIF (121 flora, 69 fauna incl. 48 aves y 9 quirópteros), 189 con foto (174 de Wikimedia Commons; falta solo #58 *Rabo de gato*), **13 POIs** (sin foto). Ver informe de cierre §"Sierra Espuña: Fase 2 cerrada" y §"Sierra Espuña: recorte a especies con respaldo oficial". **Fase 3: 13 POIs dados de alta el 2026-08-07** y `validate` en verde, pero la cascada NO está agotada (falta el Anexo I del PRUG) y falta aplicar el SQL, así que sigue en N2; 2 BIC confirmados con su norma (Pozos de la Nieve, Sitio de Interés Etnográfico; Santuario de Santa Eulalia, *Decreto 96/2002*), OSM barrido con Overpass (28 pozos de nieve uno a uno, Sanatorio situado). **IELIG consultado: 0 LIG dentro del límite**, «no hay» de primera mano. **Anexo I del PRUG (Decreto 6/2026) sigue sin abrir**, ahora por protección anti-bot del BORM — es la fuente que puede dar de golpe los picos y collados, y **lo único que le queda para el N3**. **BD resuelta el 2026-08-08**: creado y aplicado `Database/sierra-espuna-n2.sql` (fila en `parks` —que no existía y por eso el SQL de POIs insertaba 0 filas en silencio—, 13 hábitats con geometría, 190 especies y 703 enlaces), y reaplicado el de POIs: **13/13 dentro**. Verificado campo a campo contra `park.json` y por la API — §"2026-08-08". Commons consultado, licencias sin verificar — §"2026-08-07 (b)" y `n3-cuatro-calas-sierra-espuna.md` |
| Región de Murcia | Murcia | Carrascoy y El Valle | Parque Regional | `carrascoy-y-el-valle` | N1 | 2026-07 | ENP **ES620008**, 16.685,8 ha. LIC/ZEC ES6200002 · ZEPA ES0000269 |
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
> 2026-08-01 hay **16 dados de alta** (3 en N2 + 13 fichas base), **4 descartados** por las reglas de
> producto y **1 retirado** tras haber estado dado de alta (Salto del Usero). El listado completo con
> código y superficie está en `Tools/catalogo-nacional/out/inventario-fuentes-bdn.md`.

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

## 2026-08-08 — Cuatro Calas: el SL-MU 18 **no está en OpenStreetMap**. Hueco confirmado, no inventado

`geo/trails.geojson` de Cuatro Calas sirve **una sola traza, el GR-92**, y falta el **SL-MU 18
«Sendero de Cuatro Calas Juan F. Mota Poveda»**, que es el sendero propio del espacio: circular de
unos 5 km, homologado por la FMRM, enlaza las cuatro calas que le dan nombre (Calarreona, La
Higuerica, La Carolina y Los Cocedores), pasa por el saladar de Cañada Brusca y discurre entero
dentro del límite. El aviso venía del POI `playa-de-calarreona`, que lo cita en su `source`
(«arranque señalizado del SL-MU 18») advirtiendo de que la traza no estaba en la capa.

**Comprobado contra OSM en vivo: no está.** No es que la herramienta lo filtrara mal — es que en
OpenStreetMap no existe. Siete consultas a Overpass sobre un bbox de ~13 × 10 km (el del espacio con
~5 km de margen por lado), atacando el problema por ángulos distintos para no depender del filtro que
usa `build-park-trails.js`:

| Consulta | Resultado |
|---|---|
| Relaciones `route=hiking\|foot` con `ref` ^SL (lo que mira la herramienta) | **0** |
| Cualquier relación con `ref` que case `MU[ -]*18` (por si el `ref` va escrito de otro modo) | **0** |
| Relaciones/ways con `name` «Cuatro Calas» | 1, y es el **polígono del propio espacio** (`way/1251209976`, `ref=ES620004`) |
| **Todas** las relaciones de ruta a pie de la zona, **sin filtrar por `ref`** | **4**, y ninguna es: GR 253, C52 «Camino Las Palomas», PR-A 232 «Pulpí - Terreros», GR 92 |
| Ways con `ref` ^SL (sendero mapeado sin relación) | **0** |
| Cualquier elemento que cite «Mota Poveda» | **0** |
| Postes/balizas (`information=route_marker\|guidepost`) dentro del polígono | **0** |

La cuarta fila es la que cierra el asunto: **no hay ninguna relación de senderismo en la zona que
pueda ser el SL-MU 18 bajo otro nombre o sin `ref`**. Y dentro del polígono hay **39 caminos**
(`highway=path|footway|track`) mapeados, pero **ninguno con `ref` ni `name`**: el camino físico
está, la ruta señalizada como objeto no.

**No se ha escrito nada a mano.** Se lanzó `node Tools/build-park-trails.js cuatro-calas --dry-run`,
que ve 2 relaciones candidatas (GR-253 y GR-92), descarta el GR-253 por no cruzar el polígono
—criterio de pertenencia ya documentado el 2026-07-28— y reproduce **exactamente** la capa actual:
GR-92, 1,74 km, 2 trazas. Nada que incorporar, así que `trails.geojson` y `manifest.json` quedan sin
tocar y la versión del manifiesto no sube. `npm run validate` en verde.

> **Por qué no se dibuja de otra fuente.** La traza de la FMRM vive en Wikiloc
> (`wikiloc: 17037634` en `senderos-fmrm-murcia.json`) y **no es redistribuible**; la capa se sirve
> bajo ODbL con «OpenStreetMap contributors». Meter ahí una traza de otra procedencia rompería la
> atribución del fichero, y dibujarla a ojo entre las cuatro calas sería inventarse un sendero
> homologado. **La única vía limpia es que alguien lo mapee en OSM**: en cuanto exista la relación,
> `npm run trails:build` lo incorpora solo, sin tocar código.

Esto **no era un hallazgo nuevo del catálogo**: `senderos-fmrm-murcia.json` ya listaba `SL-MU 18`
bajo `estadoDeLaConstruccion.senderosDelCatalogoQueOSM_NO_tiene` (`"cuatro-calas": ["SL-MU 18"]`) desde
el 2026-07-28, y su `siguientesPasos` nº 7 ya describe la vía de incorporación. Lo que aporta esta
sesión es **verificarlo de primera mano y por métodos que no dependen del filtro de la herramienta**,
que era la duda razonable: que el sendero estuviera en OSM pero etiquetado de forma que el `ref` no
casara. No lo está. La entrada del catálogo queda anotada con la fecha de re-verificación.

### Reparado de paso: un aviso interno que se estaba sirviendo al usuario

El `source` del POI `playa-de-calarreona` acababa así:

> «… Sendero SL-MU 18 homologado por la FMRM. **Aviso: la traza del SL-MU 18 NO está en
> geo/trails.geojson, que solo lleva el GR-92.**»

Eso es una **nota de mantenimiento interna metida en un campo que se sirve al usuario final**:
`Frontend/Js/render.js:416` pinta `Fuente: {poi.source}` en la ficha del punto, y el propio `map.js`
lo dice en su comentario («el `source` completo de cada punto sigue en su ficha»). Al visitante de
Calarreona se le estaba enseñando el nombre de un fichero del repo.

Sustituido por el hecho, dicho para quien camina y sin internismos: *«Su recorrido no aparece
dibujado en el mapa: el sendero está señalizado sobre el terreno, pero no cartografiado en
OpenStreetMap, que es de donde sale la capa de senderos.»* Es información útil de verdad — quien
llega al arranque señalizado y no ve la línea en el mapa merece saber por qué—, y la atribución ODbL
y la homologación FMRM se conservan intactas.

Tocado en los **dos sitios que comparten ese texto**, que si no divergen: `park.json` y
`Database/n3-pois-cuatro-calas-sierra-espuna.sql` (sigue sin aplicar, ver abajo). Y `manifest.json`
sube de **v3 a v4** con fecha 2026-08-08, porque `park.json` ha cambiado y `parkNeedsRevalidation`
(`offline.js:203`) compara `version` y `updatedAt`: sin subirla, quien tenga el parque guardado sin
conexión seguiría leyendo el aviso viejo para siempre.

**Consecuencia para el nivel:** ninguna. Este hueco es de la capa de senderos, no de la cascada del
§4, y no bloquea el N3.

### SQL aplicado: **Cuatro Calas sube a N3**. Sierra Espuña no puede

Con la pila de Docker ya levantada (`naturdex-db-1`, MySQL 8.4, *healthy*), se aplicó
`Database/n3-pois-cuatro-calas-sierra-espuna.sql`. Resultado, con copia de seguridad previa de
`parks` y `points_of_interest` tomada con `mysqldump`:

| Espacio | Antes | Después | |
|---|---|---|---|
| `cuatro-calas` | 0 POIs | **4 POIs** | ✅ |
| `sierra-espuna` | — | **0 filas insertadas** | ⚠️ ver abajo |

**Cuatro Calas cumple ya los tres requisitos del §5** —cascada agotada, la BD tiene sus filas y
`npm run validate` en verde—, que es exactamente lo que el §8 del informe daba como único pendiente.
**Pasa de N2 a N3.**

Comprobación, no confianza: exportadas las 4 filas de la BD y comparadas **campo a campo contra
`park.json`** (nombre, tipo, latitud, longitud, `approx`, imagen, descripción y `source`) →
**coincidencia exacta en los 8 campos de los 4 POIs**, acentos y comillas angulares incluidos. Y de
punta a punta: `GET /Backend/Api/species.php?park=cuatro-calas` devuelve **200** con los 4 POIs y el
`source` corregido, sin rastro del aviso interno. Que es lo que importaba: `data.js` da prioridad a
la API sobre el `park.json` empaquetado.

> **Sierra Espuña no ha insertado nada, y no es un fallo del SQL.** Sus 13 POIs van en un
> `INSERT … SELECT … FROM parks p JOIN (…) ON p.slug = 'sierra-espuna'`, y **`sierra-espuna` no
> existe en la tabla `parks`**: la BD solo tiene `cabo-cope-puntas-calnegre` y `cuatro-calas`, que
> son las que trae `seed.sql`. El JOIN no casa y el INSERT afecta a 0 filas **sin dar error**, así
> que el SQL «pasa» y no inserta. **Sierra Espuña sigue en N2** y le faltan ahora dos cosas, no una:
> el Anexo I del PRUG y **dar de alta su fila en `parks`** antes de reaplicar este mismo SQL, que es
> idempotente y se puede relanzar tal cual.

> **Ojo al volumen.** Esto está aplicado sobre el volumen `naturdex_db_data` de la máquina local.
> `seed.sql` no lleva estos POIs, así que **si se recrea el volumen hay que reaplicar el SQL**.

> **CORRECCIÓN, el mismo día.** Lo de arriba —«Cuatro Calas cumple ya los tres requisitos del §5»—
> **estaba mal, y la comprobación que lo respaldaba miraba donde no era.** Se verificaron los 4 POIs
> contra la BD y se dio el §5 por cumplido, pero **`Database/cuatro-calas-n2.sql` nunca se había
> aplicado**: el espacio estaba en la BD con `status = 'basic'`, **0 hábitats y 0 especies** y solo
> sus 4 POIs. Es decir, la BD servía Cuatro Calas como ficha base con chinchetas, **peor que el
> `park.json` empaquetado**, porque `data.js` da prioridad a la API. «La BD tiene sus filas» es el
> catálogo entero, no la capa que uno acaba de tocar. Resuelto abajo.

### Los tres espacios, cuadrados con su `park.json`

Aplicado lo que faltaba y creado lo que no existía:

| | `status` | hábitats | especies | POIs | |
|---|---|---|---|---|---|
| `cabo-cope-puntas-calnegre` | available | 15 | 146 | 15 | ya estaba (seed) |
| `cuatro-calas` | available | **7** | **102** | 4 | aplicado `cuatro-calas-n2.sql`, que seguía sin aplicar |
| `sierra-espuna` | available | **13** | **190** | **13** | **fichero nuevo** `sierra-espuna-n2.sql` |

**Cuatro Calas sí cierra ahora el N3**, esta vez con el catálogo completo detrás.
**Sierra Espuña se queda en N2 aun teniendo ya todas sus filas**: el §5 pide además la cascada
agotada, y le sigue faltando el Anexo I del PRUG. Lo que se ha quitado de en medio es el requisito
de base de datos, no la cascada.

### `Database/sierra-espuna-n2.sql` — fichero nuevo (920 KB)

Generado desde `park.json` + `geo/habitats.geojson`, con el mismo patrón que el de Cuatro Calas
(`INSERT … SELECT … JOIN parks`, todo idempotente). Dos diferencias deliberadas:

1. **Inserta la fila de `parks`**, que el de Cuatro Calas solo actualiza. `seed.sql` trae únicamente
   cabo-cope y cuatro-calas, así que `sierra-espuna` **no existía en la tabla**: esa y no otra era la
   causa de que el SQL de POIs insertara 0 filas sin dar error. Hay que aplicarlo **antes** que el de
   POIs.
2. **Incluye `is_visible` y `review_note`** en `species`, que el de Cuatro Calas no traía. Aquí hacen
   falta: una especie (*Sylvia undata*) va oculta del catálogo público y 52 llevan nota de revisión.
   `park_payload.php:89` las lee y las sirve, y `data.js` filtra por `visible` en cliente — sin la
   columna, esa especie reaparecería.

**Sobre `evidence`, que es un dato de procedencia y no se puede inventar.** Los 703 pares
(especie, hábitat) y sus `gbif_occurrences` salen literalmente del `park.json`; ese camino se validó
reproduciendo **al 100% los 271 enlaces** del SQL de Cuatro Calas. La etiqueta `evidence`, en cambio,
**no está en el `park.json`**: se ha derivado con la herramienta del repo
(`atlas-hic-especies.js`, Atlas ∩ catálogo, salida nueva en
`Tools/catalogo-nacional/out/sierra-espuna-hic-especies.json`). Contrastado contra Cuatro Calas, ese
método reproduce **16 de sus 19** `caracteristica` y **no produce ninguno de más**; los 3 que faltan
allí vienen de una curación a mano posterior que no está en el repo. Así que en Espuña
`caracteristica` (32 de 703) puede quedarse **corto, nunca largo** — preferible a etiquetar a ojo el
origen de un enlace.

**Comprobado, no supuesto:** volcadas las filas de la BD y comparadas contra `park.json` —13/13
hábitats con geometría, 190/190 especies, 13/13 POIs, 703/703 enlaces, y campo a campo en nombre,
código, tipo, prioridad, color, descripción, reino, grupo, `visible`, `featured` y ZEPA— con **cero
discrepancias**. Y por la API: `species.php?park=sierra-espuna` devuelve **200** con 13 hábitats,
190 especies y 13 POIs, y *Sylvia undata* llega con `visible:false` como en el `park.json`.

> El generador es un script de sesión, **no está en el repo**. Si interesa reproducir el fichero sin
> él, la vía es `atlas-hic-especies.js` para los enlaces y el propio `park.json` para el resto.

### Fallo encontrado al aplicarlo: el comando documentado corrompía el UTF-8

El comando que venía escrito en las cabeceras de los `.sql` y en los documentos invocaba `mysql`
**sin `--default-character-set=utf8mb4`**, y el cliente entra en **latin1** mientras la BD es utf8mb4
(`@@character_set_client = latin1`, `@@character_set_database = utf8mb4`).

Verificado en una BD desechable, creada y eliminada para la prueba, en vez de darlo por supuesto:

```
escrito: Posición «Cocederos» Espuña geológico
leído  : PosiciÃ³n Â«CocederosÂ» EspuÃ±a geolÃ³gico
```

Con este catálogo —lleno de «Espuña», «geológico», «Posición» y comillas angulares— eso es mojibake
en cada ficha. **El SQL se aplicó con el flag puesto**, de ahí que la comparación campo a campo salga
limpia.

La herramienta del repo **ya lo hacía bien** (`Tools/lib/db.js:79` pasa el flag), así que el fallo
estaba solo en los comandos escritos a mano. Corregido en las **6 apariciones**: las cabeceras de
`Database/cuatro-calas-n2.sql` y `Database/n3-pois-cuatro-calas-sierra-espuna.sql`, este mismo
ledger, el informe de N3 y las dos del `README.md` (`schema.sql` y `seed.sql`, que es donde más caro
salía). `Docs/glosario-divulgativo.md` ya lo traía bien y no se ha tocado.

---

## 2026-08-08 — El mecanismo de fotos de POIs, documentado; y el alias que evitaba encontrarlas

La Fase 3 del rollout no decía nada de cómo se buscan las fotos de los POIs, pese a que
`poi-images.js` ya existía y las buscaba. Añadido **§4.6 a `Docs/prompts/e-rollout-nacional.md`**:
por qué la cadena de las especies no sirve (cuelga del nombre científico y un POI no tiene), cuál es
el ancla que la sustituye (la **categoría de Commons del espacio**: un archivo dentro de
`Category:Cuatro Calas Protected Landscape` está en Cuatro Calas por construcción), las dos vías, y
las dos puertas que el script no abre solo —licencia de lista blanca, que `--force` **no** levanta, y
coincidencia dudosa, que sí—. La definición de N3 «terminado» (§5) incorpora la búsqueda de fotos, y
distingue el hueco real («no hay foto libre») del falso («no hubo red para preguntar»).

### El fallo que habría dejado la próxima pasada en balde

`mencionaSitio` exige que todas las palabras con peso del nombre del POI estén en el nombre del
archivo. Contra los archivos que de verdad hay en Commons, eso fallaba en **3 de los 4 POIs de Cuatro
Calas**, y precisamente en el mejor documentado:

| POI | Archivos reales | Por qué no casaba |
|---|---|---|
| Playa de los Cocedores | «…en la Cala de los **Cocederos**» (10 archivos) | Falta «playa», y «cocedores» ≠ «cocederos» |
| Vulcanismo de La Carolina | «Afloramientos rocosos en la **Cala La Carolina**» | Falta «vulcanismo» |
| Conglomerados de Cuatro Calas | El IELIG lo llama «**Playa de Cuatro Calas**» | Falta «conglomerados» |

La trampa «Cocederos/Cocedores» ya estaba anotada en `n3-cuatro-calas-sierra-espuna.md` §5 como algo
a tener en cuenta «al resolver las fotos»; lo que no había era mecanismo para tenerlo en cuenta.

**`Tools/catalogo-nacional/data/poi-alias.json`** (nuevo) da nombres alternativos por POI, y
`poi-images.js` los aplica **solo en la vía 1**, dentro de la categoría del espacio. Ahí un alias
corto como «Carolina» o «Azaraque» es seguro porque la categoría ya garantiza el sitio; en el
buscador traería La Carolina de Jaén, así que allí se sigue exigiendo el nombre completo. Un alias no
relaja la licencia ni la comprobación de carga. Cubiertos los 4 POIs de Cuatro Calas y 10 de los 13
de Sierra Espuña.

Los tres sin alias lo están a propósito y consta por qué en el propio fichero. El caso que enseña
algo es **«Pozo de la nieve de Mula»**: su nombre en OSM es «Pozo 28», pero `palabrasClave` descarta
las palabras de dos letras o menos, así que ese alias se reduciría a «pozo» y casaría con cualquiera
de los 28 pozos del parque. Un alias que se queda en una palabra genérica es peor que no tener
alias.

### Lo que sigue pendiente y por qué

**Los 17 POIs siguen con `image: null`.** Esta sesión tampoco pudo ejecutar la pasada: sin Node y sin
salida a `commons.wikimedia.org` ni `es.wikipedia.org`. Es la tercera seguida que se queda en el
mismo punto por el entorno, no por el trabajo. No falta herramienta ni criterio: falta una máquina
con Node y red. Los dos comandos exactos, las categorías verificadas y qué esperar de cada espacio
están en `Tools/catalogo-nacional/out/poi-fotos-candidatas.md`.

---

## 2026-08-07 (b) — La cascada de la Fase 3, recorrida: **sigue abierta, y con menos huecos**

Segunda sesión de N3 el mismo día, en otra máquina. **Ninguno de los dos espacios sube de nivel**:
esto es el paso 2 del §4.5 y está a la espera del visto bueno. `park.json` sin tocar.

**El informe completo, con las dos tablas de candidatos, está en
`Docs/rollout/n3-cuatro-calas-sierra-espuna.md`.** Aquí solo lo que cambia el estado del rollout.

**Se invirtió el bloqueo.** La sesión anterior tenía Node y no tenía red; ésta **tiene red y no tiene
Node**. No se ha podido ejecutar ni una herramienta del repo —ni `red:check`, ni `pois:build`, ni
`validate`—, así que el recorte por polígono del §4.3.3 se rehízo con un script equivalente de
PowerShell, **validado contra la salida ya existente de la herramienta con 8 puntos de control, 8
aciertos**. Antes del alta hay que reejecutar `pois:build` en una máquina con Node.

**Lo que se cierra de verdad, porque se leyó de primera mano:**

- **IELIG.** Sierra Espuña **no tiene ningún LIG** dentro del límite (0 polígonos y 0 puntos en el
  servicio del IGME). Es un «no hay» que ya vale como «no hay».
- **IELIG en Cuatro Calas: dos, y el ledger los tenía mal.** Lo que había registrado como un LIG «La
  Carolina (Punta Parda)» —dato de resumen de buscador— es en realidad **`BE006` «Vulcanismo de La
  Carolina»**, y Punta Parda no entra en su denominación. Además **se le había escapado entero el
  `BE005` «Playa de Cuatro Calas»**, que es el más rico de los dos (geomorfológico, estratigráfico,
  paleontológico, tectónico y sedimentológico). Los dos caen **dentro** del polígono oficial.
- **BIC.** Los dos de Sierra Espuña quedan con su norma: **Pozos de la Nieve**, BIC como *Sitio de
  Interés Etnográfico*; **Santuario de Santa Eulalia de Mérida**, BIC categoría Monumento por
  ***Decreto 96/2002, de 7 de junio***.
- **Overpass** ve lo que el basemap no (`historic=*` y `man_made=*` no viajan en las teselas): **89
  elementos dentro** en Sierra Espuña, con los **28 pozos de nieve uno a uno** y su capilla en ruinas,
  el **Caño de Espuña** (acueducto), la **Casa Forestal de Huerta Espuña** y la **Garita del
  Turullón**, que no estaban en la lista anterior.
- **Uno de los tres candidatos sin coordenada queda situado**: el **Sanatorio de Tuberculosos**
  (`way/132482920`, 37.868303 / −1.512129). Los otros dos, el cuartel de Carabineros de Calarreona y
  la duna fósil, **no están en OSM** — barrido completo de `historic`, `man_made` y `natural`. Ya no
  es «falta mirar Overpass», es «OSM no los tiene».
- **Commons responde.** 10 archivos de la Cala de los Cocederos (dos retratan los depósitos de
  esparto, que es justo el hecho del candidato) y 1 de los Pozos de la Nieve. **Licencias sin
  verificar**: eso es `images:pois`, que necesita Node.

**Lo que sigue cerrado, y por qué importa el matiz.** El **Anexo I del PRUG** —el cuerpo del plan—
**sigue sin leerse**, pero ya no por la red: el articulado del Decreto 6/2026 sí se leyó y **enumera
sus anexos sin que aparezca ningún «anexo de valores»** (Anexo I PRUG, II Gebas, III Llano de las
Cabras, y dos apéndices que son planes de recuperación de dos plantas). El PDF completo son ~65 MB y
al reintentar la descarga **el BORM levantó un captcha de Radware**; `murcianatural.carm.es` redirige
al mismo verificador. **No se intentó sortearlo y no debe intentarse**: la vía limpia es bajarlo a
mano desde un navegador y leerlo con `pdftotext -layout`, como se hizo con el Atlas de Hábitats.

> **Aviso que excede la Fase 3.** Existe una **Ley 1/2026, de 2 de marzo, de modificación de los
> límites del Parque Regional de Sierra Espuña**. Si mueve el límite, afecta a `parque.geojson` y por
> tanto al recorte de POIs, senderos y hábitats. **Sin comprobar.**

### El alta: 17 POIs escritos, y aun así ninguno sube a N3

Dado el visto bueno a la tabla, se han escrito **4 POIs en Cuatro Calas y 13 en Sierra Espuña**, con
los diez campos del piloto, `counts.pointsOfInterest` al día y `version` 2 → 3 en los dos manifiestos.
El detalle está en `n3-cuatro-calas-sierra-espuna.md` §7.

**Node se instaló a mitad de sesión** (v24.19.0 LTS, ZIP oficial en `%LOCALAPPDATA%\Programs\nodejs`,
SHA256 verificado, sin admin), así que la parte de herramientas sí se pudo cerrar:

- **`npm run validate` en verde** — «16 espacios: 3 completos + 13 fichas base, **5 avisos**», con
  `coherencia OK: … 4 POIs` y `… 13 POIs`. Los 5 avisos son preexistentes y ajenos a esta capa.
- **`npm run pois:build` con Overpass** en los dos espacios: reconoce las altas como duplicados por
  el §4.3.7, o sea que las coordenadas escritas a mano cuadran con las que da la herramienta.
- **`npm run red:check`**: 16/17 fuentes abiertas. Cuidado con su lectura: da `www.borm.es` por
  abierto porque comprueba el host, y el captcha salta al pedir el documento.

**Aun así no suben de nivel**, porque el §5 pide además que **la BD tenga sus filas** y aquí no hay
Docker ni contenedor: `Database/n3-pois-cuatro-calas-sierra-espuna.sql` queda escrito e idempotente,
**sin aplicar**. **A Cuatro Calas no le falta nada más**: cascada agotada y validador en verde, así
que en cuanto se aplique el SQL cierra N3. A Sierra Espuña le falta además el Anexo I del PRUG.

**Ninguno lleva foto** (`image: null`): Commons tiene material, pero sin licencia verificada manda el
hueco (§4.5). Eso lo resuelve `npm run images:pois`.

> **Segunda corrección al ledger, encontrada al dar el alta.** Este ledger daba por hecho que la
> **Capilla de la Virgen del Rocío, la Ermita y el Mirador de Gebas** caían las tres dentro de Sierra
> Espuña. Comprobado contra los dos polígonos, **solo la Capilla lo hace** (253 m dentro). La **Ermita
> de Gebas** queda **324 m fuera de Sierra Espuña y 547 m fuera de Barrancos de Gebas**: está en el
> caserío, que no pertenece a ninguno de los dos espacios, así que por el §4.3.3 no puede entrar en
> ninguno. Solo se ha dado de alta la Capilla.

**Tres candidatos se quedaron fuera por el §4.3.1**, con coordenada pero sin fuente del hecho: Arco de
Sigismondi, Los Ojos del Dragón y Ermita de Santa Leocadia.

---

## 2026-08-07 — Fase 3 arrancada en Cuatro Calas y Sierra Espuña: **abierta, no cerrada**

Primera sesión de N3 del rollout. **Ninguno de los dos espacios sube de nivel**: siguen en N2 y su
`pointsOfInterest` sigue vacío. Lo que hay es la herramienta que faltaba, la cascada recorrida hasta
donde se pudo, y catorce candidatos con nombre y coordenada esperando visto bueno.

### Por qué no se cerró: la sesión no tenía salida a las fuentes

La política de egreso del entorno remoto permitía **solo GitHub y los registros de paquetes**.
Quedaron fuera, con 403 al CONNECT: Wikimedia (Commons, Wikipedia, Wikidata), Overpass, GBIF,
EIDOS/IEPNB, el geoportal del IMIDA, el IELIG del IGME, murcianatural, regmurcia, el BORM y
Protomaps. Es decir, **las fuentes 1, 2, 3 y 6 de la cascada del §4.2 no se pudieron leer de primera
mano**, solo por resúmenes de un buscador web.

Eso significa una cosa importante para quien retome: **no está agotada ninguna fuente**. El §5 pide
haber recorrido la cascada *entera* para dar el nivel por cerrado, y aquí no se ha hecho. Un «no hay»
de esta sesión no vale como «no hay».

Para no volver a perder media hora averiguándolo: **`npm run red:check`** dice en diez segundos qué
fuentes están abiertas y qué herramienta deja de funcionar sin cada una.

### Herramienta nueva: `Tools/build-park-pois.js` (`npm run pois:build`)

Era el punto pendiente del §4.4. Barre el territorio del parque y deja los candidatos en
`Tools/catalogo-nacional/out/<slug>-poi-candidatos.md`, ya recortados al polígono oficial (~50 m de
margen, el mismo criterio que los senderos), con los descartes del §4.1 y §4.3 justificados por su
regla, fundido lo que está a menos de 50 m y cruzado contra los POIs ya dados de alta y contra
`trails.geojson`. **Nunca escribe `park.json`.**

Tira de Overpass cuando hay red y, si no, del **`tiles/base.pmtiles` que cada parque ya lleva en el
repo**: el basemap de Protomaps es una Produced Work de OSM bajo ODbL y dentro van las capas `pois`,
`places` y `water` con nombre y posición. Lo lee `Tools/lib/pmtiles.js`, un lector mínimo de PMTiles
v3 + MVT sin dependencias. Ventaja que no es solo de emergencia: **está congelado en la fecha del
build, así que es reproducible** —se comprobó, dos ejecuciones dan salida byte a byte idéntica—
mientras que Overpass sirve el OSM vivo y no da esa garantía. Límite a tener presente: el basemap ve
menos que OSM (no lleva `historic=*` ni `man_made=*`, y filtra por zoom).

### Lo que dio cada fuente

| Fuente | Cuatro Calas | Sierra Espuña |
|---|---|---|
| 1 · PORN/PRUG | **No hay PORN aprobado**: declarado por la Ley 4/1992 y sin plan propio | **PRUG aprobado por Decreto 6/2026 de 12-II** (BORM supl. nº 1 del nº 52, 4-III-2026), con anexos de zonificación y normativa. **Sin abrir** |
| 2 · IELIG | LIG **«La Carolina (Punta Parda)»**, afloramiento volcánico. Del portal del IGME, nada | Interés geomorfológico documentado, **sin ficha LIG con código confirmada** |
| 3 · BIC | Nada dentro del límite | **Pozos de la Nieve** (Sitio de Interés Etnográfico) y **Santuario de Santa Eulalia** (BIC 2002) |
| 4 · OSM | 18 elementos con nombre → **4 candidatos** | 706 → **186 candidatos**, casi todos picos y collados sin hecho |
| 6 · Fotos | Commons inaccesible | Commons inaccesible |

### Los catorce candidatos

Tabla completa, con coordenada, fuente del hecho, `approx` y qué contar, en los dos informes de
`out/`. En resumen:

- **Cuatro Calas (4)**: Playa de los Cocedores (Cultural, las cuevas del esparto), Punta Parda–Playa
  de la Carolina (Geológico, el LIG, `approx`), Playa de la Higuerica (Geológico, el más flojo),
  Playa de Calarreona (Acceso, arranque del SL-MU 18).
- **Sierra Espuña (10)**: Pozos de la Nieve (`approx`, representa el conjunto de 28), Santuario de
  Santa Eulalia, Torreón de los Exploradores, Arco de Sigismondi, Casas de Malvariche, Ermita de
  Santa Leocadia, Centro de Visitantes Ricardo Codorníu, Paredes de Leiva (`approx`), Los Ojos del
  Dragón, Torre del Azaraque.
- **Tres buenos sin coordenada**, que necesitan Overpass o campo: el antiguo cuartel de Carabineros
  de Calarreona, la duna fósil entre La Carolina y Los Cocedores, y el Antiguo Sanatorio de
  Tuberculosos.

### Descartes que conviene no volver a proponer

- **Las seis cuevas de Sierra Espuña** (Moneda, Luenga, Matea, Plata, Palomas, Mataos) → §4.3.6. La
  de la Moneda tiene indicios de yacimiento exterior con cerámica de la Edad del Bronce y sirvió de
  refugio en el Paleolítico y el Neolítico, sin vigilancia. Mismo caso que la Cueva C.6 del piloto.
- **Cima del Morrón (1.583 m)** → §4.3.5: la ocupa el EVA-13 del Ejército del Aire, zona militar en
  activo y cerrada. Por eso el candidato es el Torreón de los Exploradores, que sí se pisa.
- **71 picos y 28 collados** de Sierra Espuña → §4.1, topónimo suelto. **Si el anexo de valores del
  PRUG los enumera, varios pasan a candidatos de golpe: es la razón principal para abrir ese PDF.**
- **Cañada Brusca** (Cuatro Calas) → su saladar cae dentro de los HIC 1430, 5330 y 5220 del propio
  espacio, o sea Capa 2 (§4.1). Solo entraría por su propuesta de Microrreserva Botánica y con fuente
  primaria.
- **Capilla de la Virgen del Rocío, Ermita y Mirador de Gebas** → caen dentro del polígono de Sierra
  Espuña y **no** dentro de Barrancos de Gebas (comprobado), pero están en el borde oriental y
  culturalmente son de Gebas. Decisión pendiente.

### Fotos: `Tools/catalogo-nacional/poi-images.js` (`npm run images:pois`)

La cadena de fotos del catálogo cuelga del nombre científico, y un POI no tiene ninguno: su nombre es
un topónimo, que se repite por toda España. El ancla aquí es **la categoría de Commons del espacio**
—un archivo dentro de `Category:Cuatro Calas Protected Landscape` está en Cuatro Calas por
construcción—, y el nombre del fichero decide qué elemento retrata. Solo escribe licencias libres
(CC0, dominio público, CC BY, CC BY-SA) y no escribe nunca una coincidencia dudosa sin `--force`.

Dos trampas ya cazadas y cubiertas por test: **`Playa de las Higuericas` no es `Playa de la
Higuerica`** (está en Pilar de la Horadada, a 200 km — la comparación es por palabra completa, nunca
por subcadena), y **`Ermita de Santa Leocadia` hay al menos tres en España**.

Búsqueda a mano hecha en `out/poi-fotos-candidatas.md`: encontró las dos categorías de espacio y
cuatro archivos, **ninguno verificado** porque no se pudo abrir ninguna ficha. Sirve de pista, no de
dato.

### Cómo retomar

```
Retomo la Fase 3 (N3) de NaturDex en <cuatro-calas | sierra-espuna>.

Contexto: Docs/prompts/e-rollout-nacional.md §4 (qué es un POI, la cascada y las reglas de
admisión) y Docs/piloto-cabo-cope.md. La referencia de formato son los 15 POIs de
Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json.

Lo ya hecho está en Docs/rollout/ESTADO.md §"2026-08-07": la tabla de candidatos, los
descartes con su regla y qué dio cada fuente. Los informes completos, en
Tools/catalogo-nacional/out/<slug>-poi-candidatos.md.

Empieza por `npm run red:check`. Si está todo abierto:
  1. Abre el PRUG de Sierra Espuña (BORM supl. nº1 del nº52, 4-III-2026) y busca su anexo de
     valores: es lo que puede convertir picos y collados en candidatos con hecho.
  2. Consulta el IELIG del IGME dentro de los dos límites.
  3. `npm run pois:build <slug>` con Overpass, que ve etiquetas que el basemap no.
  4. Sitúa los tres candidatos sin coordenada.
  5. Reháceme la tabla del §4.5 paso 2 con lo que aporte todo eso y ESPERA MI VISTO BUENO.
Si sigue cerrado, dímelo y no sigas: sin las fuentes esto no cierra.
```

---

## 2026-08-02 — El esparto era dos especies: un taxón, dos nombres, dos fichas

El catálogo universal llevaba **dos fichas del esparto**, `Stipa tenacissima` (solo en Cabo Cope) y
`Macrochloa tenacissima` (Sierra Espuña y Cuatro Calas), con el **mismo `eidosTaxonId` 27376**. Dos
textos distintos, dos `rarityScore` distintos (1 y 4) y dos entradas en `data/contenido/`. Los
contadores nacionales contaban **354 especies donde hay 353**.

**Por qué no lo vio nadie.** `validate-park-data.js` y `sync-species-catalog.js` identifican una
especie por su `scientificName`, que es lo correcto para todo lo demás pero deja justo este punto
ciego: si el mismo taxón se da de alta con el basónimo en un sitio y con el nombre aceptado en otro,
para las dos herramientas son dos especies y no hay nada que comparar. El validador seguía en verde.

**Qué manda.** EIDOS zanja el caso sin ambigüedad —`/api/especie/v_taxonomia?taxonid=eq.27376`
devuelve las dos filas del mismo taxón:

| Nombre | Rango | `nametype` |
|---|---|---|
| *Stipa tenacissima* L. | Species | **Sinónimo** |
| *Macrochloa tenacissima* (L.) Kunth | Species | **Aceptado/válido** |

GBIF coincide (`match?name=Macrochloa tenacissima` → `ACCEPTED`, `speciesKey` 4127897). Se conserva
**`Macrochloa tenacissima`** y el basónimo pasa al campo `source` como sinónimo.

### Lo que se ha tocado

- **Fichas fundidas** quedándose con lo mejor de cada una: la descripción larga (la que cuenta el uso
  del esparto para cuerdas, esteras y alpargatas) **más** la mención del sinónimo, que ahora hace
  falta porque la app muestra el nombre nuevo; `habitat` con «espartales extensos»; `iucnGlobal`
  con el año de la evaluación (2018); `spainStatus` con la referencia concreta a la Lista Roja 2008
  y al LESRPE en vez de un genérico «sin figura en EIDOS». La foto era **la misma en las dos**
  (`Special:FilePath/Stipa_tenacissima.jpg`, comprobada viva contra la API de Commons: pageid 38490).
- **`rarityScore` 4 → 1.** El 4 venía del ensamblado automático de Sierra Espuña; el esparto es la
  planta más abundante del paisaje semiárido y su propia ficha dice «muy frecuente en la Región».
- **`data/contenido/`**: el bloque `Stipa tenacissima` de `02-flora-matorral.json` se borra y su texto
  se funde en el de `Macrochloa tenacissima` de `06-arboles-y-arbustos.json`. Sin esto, el siguiente
  `--extract` habría vuelto a inyectar la ficha partida: `contenido/` manda sobre lo extraído.
- **`gbifSpeciesKey` 3073 → 4127897.** 3073 no es el esparto: es la clave de la **familia Poaceae**.
- **BD**: `seed.sql` renombrado (3 sitios: alta de especie, enlace de hábitat y bloque de ids
  externos) y **migración nueva al final de `migrations.sql`**. Hace falta las dos cosas:
  `species-universal.sql` localiza cada fila por `(parks.slug, species.scientific_name)`, así que sin
  renombrar antes en la BD viva sus `UPDATE` no casarían con la fila vieja y **la API seguiría
  sirviendo la ficha duplicada** (`data.js` prioriza la API sobre el `park.json` empaquetado).
  Reejecutar `seed.sql` sin la migración tampoco vale: insertaría una fila nueva junto a la vieja.

### Verificación

`--extract` → 353 especies (0 nuevas) · `--apply` → 3 fichas actualizadas · `--check` → **0
divergencias, 0 texto local en campos universales**. Reejecutar los tres deja 0 cambios
(idempotente). `validate-park-data.js` **en verde** (9 avisos, todos preexistentes) y
`glossary-coverage.js` sin vocabulario huérfano.

### Barrido: ¿hay más casos así? Uno, y no está donde parecía

Herramienta nueva **`Tools/scan-taxones-duplicados.js`** (`npm run taxones:duplicados`), que agrupa
las 467 fichas por identificador externo en vez de por nombre —lo único que delata el caso— y mira
las dos direcciones. Tras el arreglo: **0 taxones duplicados por `eidosTaxonId`**. El esparto era el
único de su clase.

Pero el barrido destapa **9 identificadores incoherentes** que son el mismo problema un paso antes
de estallar. Ninguno parte hoy la ficha (los parques coinciden en el `scientificName`, así que el
catálogo universal ya los funde), pero **el nombre en el que coinciden es un sinónimo**:

- **`Sedum sediforme` es el próximo esparto.** EIDOS lo da como **Sinónimo** de *Petrosedum
  sediforme*, y los dos parques que lo tienen apuntan a taxones distintos: Cabo Cope al **95304**
  (*Petrosedum sediforme* subsp. *sediforme*) y Cuatro Calas al **8225** (*Petrosedum sediforme*,
  `acceptednameid` 80899). En cuanto uno de los dos se renombre al nombre aceptado, se parte en dos.
- **`Olea europaea var. sylvestris`**: Sierra Espuña apunta a **32803** (la *variedad*, aceptada) y
  Cuatro Calas a **6644**, que es *Olea europaea* a nivel de **especie**. El acebuche es 32803.
- **Cabo Cope arrastra tres claves de GBIF de rango FAMILIA** en vez de especie: 3073 (Poaceae) en
  *Stipa capensis*, 3064 (Amaranthaceae) en *Salsola vermiculata* y en *Arthrocnemum macrostachyum*,
  y 2406 (Crassulaceae) en *Sedum sediforme*. Una clave de familia no identifica nada: cualquier
  consulta de ocurrencias con ella devuelve la familia entera. Es el mismo error que tenía el esparto.
- **Cuatro más donde Cabo Cope usa la clave del sinónimo y Cuatro Calas la del nombre aceptado**:
  *Anabasis hispanica* (8397718, sinónimo) vs *A. articulata* (5568629); *Periploca angustifolia*
  (8222621) vs *P. laevigata* (6022574); *Asteriscus maritimus* (5385231) vs *Pallenis maritima*
  (5385225); *Arthrocnemum macrostachyum* vs *Arthrocaulon macrostachyum* (9417609).

**No se han tocado**: cada uno exige decidir si el catálogo sigue el nombre aceptado de EIDOS a
rajatabla (que es lo que se ha hecho aquí con el esparto) y, en varios, si la cita del parque se
refiere de verdad al taxón que GBIF considera aceptado. Es una revisión nomenclatural aparte, no un
arreglo mecánico. `npm run taxones:duplicados` sale con **código 1** mientras queden.

---

## 2026-08-01 — Cuatro Calas: Fase 2 cerrada (N1 → N2)

Cuatro Calas asciende de ficha base a catálogo completo. Es el primer espacio del rollout construido
**entero con el Atlas de Hábitats de 2005** (Capa 2) en vez de la cartografía de 1997, y el primero
en el que la Capa 3 arranca de cero apoyada en el catálogo universal de especies.

| | Antes (N1) | Ahora (N2) |
|---|---|---|
| Hábitats | 0 | **7** (3 prioritarios) · 177,0 ha = **79 %** del espacio |
| Especies | 0 | **102** (73 flora, 29 fauna) |
| Aves de la Red Natura 2000 | — | **27** (LIC ES6200010 + ZEPA marina ES0000507) |
| Fotos | — | **101/102** (99 %) · 6/7 portadas de hábitat |
| POIs | 0 | 0 (hueco documentado) |

### Capa 2 · hábitats

`build-habitats.js` sobre `INB_Habitat30` + `Datos30.dbf` (Atlas 2005, ETRS89 UTM30N leído del `.prj`):
**5 recintos** dentro del límite, **0 vértices fuera** ✔, 8 códigos HIC. `merge-habitats.js` +
`adopt-habitats.js` los adoptan como capa del parque; **1120 (praderas de Posidonia) queda fuera por
la regla marina**, así que se sirven 7.

Prioritarios (Anexo I): **1510** estepas salinas, **5220** matorral arborescente de *Ziziphus*,
**6220** pastizales del *Thero-Brachypodietea*. Los otros cuatro: 1420 matorral halófilo, 1430
matorral halonitrófilo, 5330 matorral termomediterráneo y 92D0 tarayal.

> **El dato oficial es un MOSAICO y eso condiciona los enlaces especie↔hábitat.** Un recinto del
> Atlas lleva varios HIC a la vez sobre el MISMO polígono (el mayor de Cuatro Calas cataloga nueve),
> así que una ocurrencia de GBIF cae simultáneamente en todos ellos y la geometría no permite
> discriminar. Criterio aplicado: si el Atlas respalda a la especie para alguno de los HIC de ese
> recinto, se enlaza **solo a ésos**; si no, a todos los del recinto. Es la razón de que 1420, 1510,
> 6220 y 92D0 compartan superficie (31 ha) y buena parte de su lista.

### Capa 3 · especies

Universo: **421 especies** distintas observadas por GBIF dentro de los polígonos de hábitat (3.458
ocurrencias en el bbox, 2.377 dentro de hábitat), de las que 166 son flora o vertebrados no aves.
Regla de selección aplicada —la del recorte de Sierra Espuña, reescalada a un espacio 80 veces más
pequeño, donde «>50 ocurrencias» no dejaría nada:

> Se excluyen las **no nativas** (van a la pestaña Invasoras, que es regional). Se mantiene una
> especie si **(a)** tiene alguna figura legal vigente en EIDOS, **(b)** el Atlas la da como
> característica de alguno de los HIC cartografiados aquí, o **(c)** tiene **≥ 3 ocurrencias** de
> GBIF dentro de un mismo hábitat del espacio.

Resultado: **75 seleccionadas** (44 por catálogo oficial, 6 por el Atlas, 25 por evidencia GBIF) y
**91 descartadas**, de ellas 6 no nativas (*Opuntia maxima*, *Acacia saligna*, *Opuntia subulata*,
*Cenchrus setaceus*, *Heliotropium curassavicum*, *Oxalis pes-caprae*). Las **27 aves** salen de la
lista oficial BISE de los dos sitios Natura 2000; 15 de ellas tienen además ocurrencia GBIF dentro
del espacio y las 12 restantes son cita documental, anotado en su `source`.

**Reutilización:** las 102 estaban ya o entraron en el catálogo universal; 57 se reutilizaron tal
cual de Cabo Cope y Sierra Espuña y **45 son fichas nuevas** redactadas en
`data/contenido/10-litoral-arido-y-aves-marinas.json`.

Amenazadas: *Puffinus mauretanicus* (CR), *Larus audouinii*, *Hydrobates pelagicus*,
*Streptopelia turtur* y *Macrochloa tenacissima* (VU).

### Reconciliación taxonómica: 8 nombres que habrían duplicado ficha

GBIF usa los *splits* modernos y el Atlas y el catálogo la nomenclatura clásica. Cruzando por
`eidos_taxonid` **y** por sinonimia se evitaron ocho duplicados: *Arthrocaulon macrostachyum* →
*Arthrocnemum macrostachyum*, *Anabasis articulata* → *A. hispanica*, *Daucus pumilus* →
*Pseudorlaya pumila*, *Stipellula capensis* → *Stipa capensis*, *Petrosedum sediforme* → *Sedum
sediforme*, *Caroxylon genistoides* → *Salsola genistoides*, *Soda oppositifolia* → *Salsola
oppositifolia* y *Olea europaea* → *O. europaea* var. *sylvestris* (la cita de GBIF es de rango
específico; el árbol silvestre de este matorral es el acebuche).

Dos nombres se quedan con el que acepta EIDOS aunque sea el menos conocido: *Periploca angustifolia*
(GBIF: *P. laevigata*) y *Squilla maritima* (GBIF: *Drimia maritima*, la cebolla albarrana; el
sinónimo va escrito en su ficha).

> **El cruce con el Atlas hay que hacerlo con los DOS nombres.** Con solo el de GBIF, *Periploca
> laevigata* no casaba con la *Periploca angustifolia* del Atlas y la especie diagnóstica del 5220 se
> quedaba sin su enlace —y el hábitat, sin portada—. Corregido: el segundo pase cruza también el
> nombre aceptado por EIDOS.

### Tres arreglos de herramienta

1. **`merge-habitats.js` escribía la procedencia a mano** («Cartografía Hábitat Directiva 92/43/CEE
   (1997)») en todo hábitat añadido. Un parque construido con el Atlas de 2005 acababa citando la
   cartografía equivocada. Ahora la lee de la propia capa oficial, que ya distingue `atlas2005` de
   `hic1997`.
2. **`lib/wikimedia.js` colaba láminas del XIX**: el nombre de archivo de Commons usa `_` como
   separador y `_` es carácter de palabra, así que `\bplate\b` **no** casaba con `…(Plate_16)…`.
   *Ammochloa palaestina* acabó ilustrada con una plancha de la *Flora Atlantica* de 1798 y *Filago
   mareotica* con un grabado del NYPL. Se normalizan los separadores antes de filtrar y se descartan
   además las láminas que enumeran varias especies en el nombre, `planche` y `nypl`.
3. **Foto de otra especie por redirección de Wikipedia**: `redirects=1` llevaba de
   `Sphenopus divaricatus` (una gramínea) al artículo del género `Sphenopus` de la Viquipèdia, que es
   **un zoantario**, y la ficha se quedaba con la foto de un cnidario. Ahora se rechaza el archivo
   que nombra el mismo género con otro epíteto.

### Base de datos

`Database/cuatro-calas-n2.sql` (261 KB, idempotente): pasa el parque a `available` y carga los 7
hábitats con su geometría, las 102 especies y los **271 enlaces** especie↔hábitat con su evidencia
(19 `caracteristica`, el resto `observada_gbif` con su nº de ocurrencias). **Está sin aplicar**: no
había contenedor de BD en marcha en esta sesión. Sin él, un despliegue con backend seguiría sirviendo
Cuatro Calas como ficha base, porque `Frontend/Js/data.js` da prioridad a la API sobre el `park.json`.

```bash
docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/cuatro-calas-n2.sql
```

### Huecos conocidos

- **0 POIs.** Mismo hueco que Sierra Espuña: no hay fuente documental con coordenadas descargables
  (el espacio sí tiene el tramo del GR-92 en `geo/trails.geojson`, pero son trazas, no puntos).
- **1 especie sin foto libre**: *Ammochloa palaestina*. Las cuatro restantes se resolvieron con
  GBIF (ver §"Fotos: de pliegos de herbario a fotos de campo"); para ésta la única candidata era una
  gramínea vegetativa de PlantNet, sin inflorescencia y no identificable, así que se deja el hueco.
- **6220 sin portada**: ninguna de sus especies diagnósticas tiene foto con licencia libre.
- **27 especies sin `habitatIds`** (las aves): decisión de modelo, no fallo.
- **La ZEPA del espacio es marina** (ES0000507, islotes litorales de Murcia y Almería). Sus 20 aves
  entran en el catálogo porque se observan desde la costa, pero conviene recordar que el territorio
  protegido por esa figura no se pisa. La excepción del `zepa.geojson` sigue documentada más abajo.
- **Duplicado heredado en el catálogo universal**: *Stipa tenacissima* (Cabo Cope) y *Macrochloa
  tenacissima* (Sierra Espuña) son el mismo taxón (`eidos_taxonid` 27376). Cuatro Calas usa
  *Macrochloa*, que es el nombre que acepta EIDOS. Unificar el de Cabo Cope queda pendiente.

---

## 2026-08-01 — Fotos: de pliegos de herbario a fotos de campo (todo el catálogo)

Repaso de las fotos que faltaban en Cuatro Calas, que destapó un sesgo del pipeline que afectaba a
todo el catálogo. **465/467 fichas tienen ya foto** (antes 461, y tres de las que había eran pliegos).

> **Efecto por parque, anotado el 2026-08-08.** Al volcar el catálogo universal a los `park.json` (ver
> la nota sobre el orden correcto al final de esta sección), las fotos de Sierra Espuña pasaron de
> **157 a 189** y las URL de Commons cambiaron de `upload.wikimedia.org` a `commons.wikimedia.org`;
> Cuatro Calas quedó en **101/102**. Los 465/467 de arriba siguen cuadrando. La tabla del §6 arrastró
> durante una semana las cifras previas (155 y 97) porque este apartado solo dio el total agregado;
> ya están corregidas.

### Por qué el pipeline elegía pliegos

`enrich-images.js` ordenaba las candidatas de GBIF **solo por licencia**. Los herbarios digitalizan
con CC0/CC-BY y iNaturalist publica en CC-BY-**NC**, así que un pliego prensado, cosido a su cartulina
y con su etiqueta y su carta de color **siempre** ganaba a la foto de campo. Así acabaron ilustradas
*Ammochloa palaestina* y *Sphenopus divaricatus* (pliegos del Smithsonian), *Anabasis hispanica*
(Smithsonian, copia local), *Athamanta hispanica* (Herbario WU) y *Cotoneaster granatensis*
(MNHN Luxemburgo). Es el mismo criterio que `lib/wikimedia.js` ya aplicaba —descarta
`herbarium|specimen|sheet`— pero que en la vía de GBIF no existía.

**Corregido:** el orden es ahora *foto de campo antes que pliego* → licencia → país. Un pliego se
detecta por `basisOfRecord` (`PRESERVED_SPECIMEN`…) o por el nombre del dataset/institución.

### Dos fallos de licencia en el mismo script

1. **`/by\b/` daba por CC BY cualquier texto con la palabra «by».** La licencia de las fotos de
   naturgucker es literalmente «*Copyright by the creator. For license and creator details, see …*»
   → el script la leía como CC BY 4.0 y colocó una foto **con derechos reservados** en la ficha de
   *Bupleurum semicompositum*. Justo lo que este script existe para no hacer. Ahora el patrón está
   anclado (`cc by`, `/licenses/by`) y hay una lista de exclusión explícita (`copyright by`,
   `all rights reserved`, `©`).
2. **`by-nc-nd` se etiquetaba como «CC BY-NC 4.0»**, perdiendo la cláusula *sin obra derivada*. La
   atribución tiene que decir la licencia real: añadidas `CC BY-NC-ND` y `CC BY-ND`.

### Resultado

| Especie | Antes | Ahora |
|---|---|---|
| *Helianthemum motae* | sin foto | iNaturalist (faluke, CC BY-NC) |
| *Bupleurum semicompositum* | sin foto → foto con © | observation.org (Humedales de Navarra, CC BY-NC-ND) |
| *Filago mareotica* | sin foto | observation.org (Ans Gorter, CC BY-NC-ND) |
| *Sphenopus divaricatus* | sin foto | observation.org (Humedales de Navarra, CC BY-NC-ND) |
| *Anabasis hispanica* | pliego Smithsonian (local) | observation.org (Ans Gorter, CC BY-NC-ND) |
| *Athamanta hispanica* | pliego Herbario WU (local) | observation.org (F. J. López Espino, CC BY-NC-ND) |
| *Cotoneaster granatensis* | pliego MNHN Luxemburgo | observation.org (Paco Faluke, CC BY-NC-ND) |

Las siete se han revisado **mirando la imagen**, no solo su licencia: es la única forma de detectar
lo que ningún filtro caza. Así se descartaron una plancha de la *Flora Atlantica* de 1798, un grabado
del NYPL, la foto de un **zoantario** para una gramínea (*Sphenopus*, género homónimo entre plantas y
cnidarios) y una gramínea vegetativa de PlantNet imposible de identificar.

Borradas las dos copias locales de pliegos que ya no referencia nadie
(`Frontend/Img/species/{anabasis,athamanta}-hispanica.jpg`) y recalculado el `assetBytes` de los dos
manifiestos afectados.

> **Orden correcto al tocar fotos.** `enrich-images.js --write-park` escribe en el `park.json`, pero
> `image`/`imageAttribution` son campos **universales**: si después se lanza
> `sync-species-catalog.js --apply` sin haber hecho antes `--extract`, el catálogo universal pisa las
> fotos recién puestas y vuelven a quedarse a null. Pasó en esta sesión. Lo robusto es escribir la
> foto en `especies-universal.json` y luego `--apply`.

---

## 2026-08-01 — Cabo Cope: retirados el HIC 1110 y el 9560 (vuelve a 15 hábitats)

Revisión de los hábitats y las especies del piloto a raíz de dos síntomas visibles en la app: un
hábitat llamado literalmente «HIC 1110» y un «Bosques endémicos de *Juniperus* spp.» sin ninguna
especie. Los dos son el mismo fallo: recintos que `merge-habitats.js` recorta desde la **cartografía
de la BDN de 1997** y que `adopt-habitats.js` adoptó sin que nadie los contrastara.

**Ninguno de los dos está declarado en el parque.** El formulario normalizado Natura 2000 de sus dos
LIC (`ES6200031` Cabo Cope y `ES6200012` Calnegre) declara 12 HIC cada uno y no incluye ni el 1110 ni
el 9560.

- **1110** (marino, «bancos de arena permanentemente sumergidos»): 2 polígonos de 18 vértices en
  total y **0 ha** — el residuo de recortar el recinto marino contra la línea de costa. La regla de
  producto «nada marino» ya existía y debería haberlo parado; **no lo hizo porque el código no estaba
  en `hic-nombres.json`**, y sin ficha el pipeline le pone nombre `HIC <código>` y tipo `Hábitat`, que
  no es un tipo excluido. De ahí salía también el nombre feo en la app: era el fallback.
- **9560** (prioritario): 61,2 ha que **solapan 46,7 con el polígono del 5210** ya cartografiado, con
  la asociación *Chamaeropo humilis-Juniperetum phoeniceae*, que es justamente la del sabinar de
  sabina mora que aquí se cataloga como 5210. Era el mismo sabinar contado dos veces por dos fuentes
  (CARM 2020 y BDN 1997). Estaba vacío de especies porque el catálogo de Capa 3 ya las tenía todas
  colgadas del 5210 (9 especies).

### Qué se ha tocado

- `park.json`, `geo/habitats.geojson` y `manifest.json` de Cabo Cope: **17 → 15 hábitats**
  (`version` 2→3 y `updatedAt` al día, para que el offline revalide). Ninguna especie apuntaba a los
  dos retirados, así que el catálogo de 175 especies no pierde nada.
- `hic-nombres.json`: alta del **1110** como `Marino` (con esto el filtro de producto ya lo descarta
  solo) y nota explicando que **un código ausente de este fichero no se queda sólo sin nombre: se
  salta el filtro marino**.
- **`hic-excluidos.json`** (nuevo) + `adopt-habitats.js`: excepciones por parque para códigos que la
  cartografía recorta dentro del espacio pero que su formulario normalizado no declara. Sin esto,
  cualquier pasada del pipeline volvía a meter el 9560. La herramienta avisa además de los códigos
  sin ficha en `hic-nombres.json`, que es el agujero por el que entró el 1110.

Comprobado con `adopt-habitats.js --dry`: ahora converge en los mismos 15 (`=` en los tres ficheros).
`npm run validate` en verde.

### Huecos que deja abiertos

- **La BD no tenía estos dos hábitats**: `seed.sql` sólo trae los 15 del PORN y no hay ningún INSERT
  de 9560/1110. Es decir, el desvío era **sólo de los ficheros del Frontend** — `adopt-habitats.js`
  escribe en `Frontend/` y no pasa por la BD, así que un export desde la API los habría borrado sin
  avisar. **No hace falta SQL** para esta corrección, pero el pipeline de hábitats sigue sin escribir
  en la BD: mientras siga así, cualquier cambio suyo es provisional.
- **Sierra Espuña también tiene un 9560** (6.270,9 ha, prioritario, 46 especies) y **tampoco figura
  en el formulario normalizado de `ES0000173`**, que declara 5210 (2.668,6 ha) y no 9560. Mismo patrón
  (recinto de la BDN 1997 vs. declaración oficial), pero allí no es un hábitat vacío ni un duplicado
  evidente, así que **queda sin tocar y pendiente de decisión**.
- **22 especies sin hábitat** en Cabo Cope, todas aves: es el apartado de aves del espacio (ZEPA), el
  mismo patrón documentado en Sierra Espuña. Aviso esperable, no un fallo.

---

## 2026-07-28 — Salto del Usero retirado de la lista de parques

Se había desbloqueado y dado de alta el día anterior (ver «Salto del Usero: desbloqueado» más
abajo). Retirado por decisión explícita: quitado de `Frontend/Data/parks-index.json` y borrada su
carpeta `Frontend/Data/parks/murcia/salto-del-usero/` (park.json, manifest.json, geo/ y el paquete
de teselas offline que se le había generado — nada de eso era trabajo curado, todo regenerable).

El trabajo de investigación no se pierde: el municipio (**Bullas**, INE 30012) sigue documentado en
`data/murcia-enp-municipios.json`, y el **guardián de `build-n1-espacios.js`** que evita que se
regeneren límites ya refinados del IMIDA es un arreglo real que se queda, independiente de si este
espacio concreto está o no en la app. Si se retoma, `node Tools/catalogo-nacional/build-n1-espacios.js
--nuts2 62 --solo ES620026` lo reconstruye igual que la primera vez.

`npm run validate` en verde tras el borrado.

---

## 2026-07-28 — Sierra Espuña: recorte a especies con respaldo oficial + fotos/nombres de Wikipedia

Segunda pasada sobre el catálogo de la sesión anterior (414 especies), a petición explícita: **priorizar
catálogos oficiales** y recortar el resto por evidencia real de presencia. Regla aplicada, especie por
especie:

> Se mantiene si **(está en algún catálogo/anexo oficial** — LESRPE, CEEA, Anexos II/IV/V Directiva
> Hábitats, Anexo I Directiva Aves, CITES, Berna, Bonn, Decreto 50/2003 de Murcia o cualquier catálogo
> autonómico de otra CCAA — **Y tiene algún avistamiento GBIF dentro del parque)**, **O tiene más de 50
> avistamientos GBIF dentro del parque aunque no esté en ningún catálogo oficial**.

### Método

1. **"Avistamientos GBIF"** recalculado de cero y de forma uniforme para las 414 (incluidas las 74 que
   antes no pasaban por conteo GBIF — reutilizadas de Cabo Cope y las 48 aves, que llegaron por BISE
   documental): `occurrence/search?taxonKey=…&limit=0` restringido al bbox del parque, un conteo
   agregado (no el reparto por hábitat de la sesión anterior, que podía contar la misma ocurrencia en
   más de un hábitat solapado y sobreestimaba el número).
2. **"Catálogo oficial"** recalculado de cero para las 414 por `eidosTaxonId`: `v_estadolegal` con
   `idvigente=1`, cualquier ámbito. 187/414 tenían alguna figura.
3. Filtro aplicado → **177 especies** (121 flora, 56 fauna, 44 aves). **237 descartadas.**

Ambas consultas tropezaron con `HTTP 429` de las APIs bajo el volumen del lote (77 especies en el
primer intento de GBIF, luego 0 tras reintento con backoff) — es el mismo patrón de rate-limit que las
llamadas a Wikipedia más abajo, con la misma solución (backoff exponencial, reintento por lote).

### Efecto colateral que conviene tener presente

La regla se aplicó literalmente, y eso **saca del catálogo protagonistas del propio LIC/ZEPA que no
tienen ni un registro GBIF dentro del parque**: 8 de los 9 murciélagos Anexo II (sin foto/observación
ciudadana pública de sus refugios cársticos, esperable en quirópteros; el noveno, *Rhinolophus
mehelyi*, sí tiene 2 avistamientos en el bbox y por eso pasó el filtro), el galápago leproso *Mauremys
leprosa*, y 4 aves oficiales de la ZEPA (*Melanocorypha calandra*, *Tichodroma muraria*, *Saxicola
rubetra*, *Curruca cantillans*). Están en la lista oficial del espacio (BISE) pero sin avistamiento
GBIF verificable en él, así que la regla —tal y como se pidió— los deja fuera. Si se prefiere que la
designación LIC/ZEPA baste por sí sola para las 48 aves y los quirópteros (que es lo que hacía el
catálogo antes de este recorte), es cuestión de relajar la regla para ese subconjunto; no se ha hecho
por iniciativa propia porque la instrucción pedía justo lo contrario.

### Nombres comunes y fotos (Wikipedia/Wikimedia Commons)

Para las 177 supervivientes: búsqueda en `es.wikipedia.org` (API REST `page/summary`, fallback a
`en.wikipedia.org`), con reintento en `HTTP 429` — sin él, el primer intento sobre el lote completo
devolvía "no encontrada" para el 78 % de las especies **por error de red, no porque no existiera la
página** (se comprobó a mano: *Vulpes vulpes*, *Falco tinnunculus*… tienen página y fallaban solo por
volumen de peticiones).

- **152/177 con página en Wikipedia** (86 %), **149 con foto**.
- **Nombres comunes**: solo se rellenó cuando el campo ya existente era el propio binomio latino (no
  se sobrescribió ningún nombre común ya bueno de EIDOS o reutilizado de Cabo Cope). 4 de 19 casos así
  resueltos automáticamente por regex sobre el extracto ("El/La *nombre* es una especie…"); 2 más a
  mano (*Epipactis atrorubens* → Heleborina rojo oscuro, *Quercus lusitanica* → Quejigueta, ambos
  verificados en el propio texto del extracto). **15 especies siguen sin nombre común** — comprobado
  que Wikipedia tampoco les da uno distinto del binomio (son en su mayoría flora endémica sin nombre
  vernáculo registrado), hueco real, no un fallo de la búsqueda.
- **Fotos**: se sustituyó la fuente GBIF/EIDOS anterior por la de Wikipedia siempre que esta tenía
  imagen, con atribución real extraída de Commons (`imageinfo`/`extmetadata`: autor + licencia corta).
  **1 imagen incorrecta detectada y corregida**: *Cormus domestica* devolvía como "foto" el mapa de
  distribución SVG del artículo (*Sorbus domestica_range.svg*), no una fotografía — se retiró
  (`image: null`) en vez de dejar un dato erróneo.
- **14 imágenes con atribución "Autor desconocido" tras dos reintentos**: la llamada a `page/summary`
  triunfa pero la de `imageinfo` a Commons para esa misma imagen sigue sin resolver el campo `Artist`
  (algunos ficheros de Commons realmente no lo declaran). No se ha inventado un autor.

### Resultado (primera pasada, ver corrección más abajo)

**177 especies** (antes 414): 121 flora, 56 fauna (44 aves + 12 otra fauna). **155 con foto** (149 de
Wikipedia/Commons, con autor y licencia reales). `npm run validate` en verde (33 avisos). Contadores
de `manifest.json` actualizados a 177.

### Corrección: reincorporadas las 13 especies oficiales sin avistamiento GBIF

A petición explícita ("si están en el anexo, añádelos"), se revierte para este subconjunto el
requisito de avistamiento GBIF: **basta la designación oficial** (LIC/ZEC/ZEPA vía BISE, o Anexo/
catálogo vía EIDOS). Reincorporados los 13 descartados en la pasada anterior por tener
`enCatalogoOficial=true` y 0 avistamientos GBIF en el bbox:

- **8 quirópteros** Anexo II Directiva Hábitats (*Miniopterus schreibersii*, *Myotis blythii*,
  *M. capaccinii*, *M. emarginatus*, *M. myotis*, *Rhinolophus euryale*, *R. ferrumequinum*,
  *R. hipposideros*). El noveno del anexo, *R. mehelyi*, **ya estaba** en las 177 (2 avistamientos
  GBIF en el bbox): el lote lo reincorporó igualmente y lo dejó duplicado — ver la nota del
  "Resultado final".
- **Galápago leproso** (*Mauremys leprosa*).
- **4 aves ZEPA**: *Melanocorypha calandra* (calandria), *Tichodroma muraria* (treparriscos),
  *Saxicola rubetra* (tarabilla norteña), *Curruca cantillans* (curruca carrasqueña).

Se marcan con `gbifBboxSightings: 0` (trazabilidad: están por designación oficial, no por evidencia
observacional) frente al resto del catálogo, que si tiene avistamientos los lleva anotados con el
mismo campo.

**Identificación de los murciélagos.** Se pidió además que sus descripciones permitan distinguirlos
entre sí a simple vista. Añadida una frase por especie con los rasgos diagnósticos, extraída literal
o casi literalmente del propio texto oficial de EIDOS (`v_atributos_pliniancore`, "Descripción de la
especie" — ya en caché de la sesión anterior, no ha hecho falta redescargar nada ni inventar ningún
rasgo): forma y proporción de la hoja nasal en los 4 *Rhinolophus* (el rasgo de familia que los separa
de los *Myotis*/*Miniopterus*, que no la tienen), tamaño relativo, color del pelaje, forma de las
orejas, y las notas de confusión que el propio EIDOS ya documenta entre pares de especies (p. ej.
*Myotis blythii* vs *M. myotis*: la mancha blanca frontal presente en el 95 % de *M. blythii* y ausente
en *M. myotis*).

### Resultado final

**190 especies**: 121 flora, 69 fauna (48 aves + 21 otra fauna, incluidos los 9 quirópteros y el
galápago). `npm run validate` en verde (33 avisos). Contadores de `manifest.json` actualizados a 190.

> **Corregido el 2026-08-08.** Esta sección decía **191** (70 fauna, 22 otra fauna) y era erróneo *en
> el momento de escribirse*, no por una fusión posterior: la reincorporación duplicó a *Rhinolophus
> mehelyi*, que ya estaba en las 177 supervivientes. El fichero quedó con 191 filas pero **190
> especies distintas**. La fila duplicada (`id` 186) se eliminó el 2026-08-02 en la sesión de Cuatro
> Calas, que bajó `manifest.json` a 190 sin actualizar este apartado. `park.json` y `manifest.json`
> son la referencia: 190 filas, `counts.species: 190`, sin `eidosTaxonId` repetidos, `id` 1–191 con el
> hueco del 186. No tiene nada que ver con la fusión del esparto (*Stipa* → *Macrochloa*) de esa misma
> sesión: en Sierra Espuña solo había *Macrochloa tenacissima*, así que su flora sigue en 121.

---

## 2026-07-28 — Sierra Espuña: Fase 2 cerrada (Capa 3, catálogo de especies)

Sierra Espuña asciende de N1 (`basic`) a N2 (`available`). La Capa 2 (13 hábitats) ya estaba cerrada
desde el 2026-07-27; esta sesión solo trabaja la Capa 3. `npm run validate` en verde (48 avisos, todos
esperables: especies sin hábitat documentadas más abajo, y "sin manifest.tiles" en todos los N1).

### Método (orden real de trabajo, no el ideal del §4 del rollout)

El procedimiento del rollout asume que ya hay un catálogo de especies contra el que cruzar el Atlas
(paso 2 antes que GBIF, paso 4). Para un parque que arranca de cero eso no es posible: se invirtió el
orden real —

1. **Atlas de Hábitats** (`Docs/Atlas y Manual de los Habitat de Espana.pdf`, extraído con
   `pdftotext -layout`) → lista nacional de "Especies características" por cada uno de los 13 HIC del
   parque. **Bug encontrado y corregido en la extracción** (no en `atlas-hic-especies.js`, que asume
   texto sin `-layout`): con `-layout` el bloque de especies queda en las líneas SIGUIENTES al título
   "Especies características", no en la misma línea, y la distancia entre el código HIC (bajo
   "Directiva de Hábitat") y su ficha puede superar las 12 líneas que asumía el guion original —
   hubo que ampliar la ventana de búsqueda a 60 líneas con parada en la ficha anterior.
   **Dos códigos sin ficha propia en el Atlas**: 9340 (encinares) hereda de 5210 (misma alianza
   Quercion ilicis, la ficha 5210 dice explícitamente "puede presentarse... como encinares"); 9560
   hereda de 5110 (que incluye expresamente la asociación *Chamaeropo humilis-Juniperetum
   phoeniceae* 856121, la misma que cataloga Sierra Espuña para el 9560).
2. **GBIF ∩ polígonos de hábitat** (`gbif-habitats.js`, corregido para aceptar parques `basic` además
   de `available` — mismo bug que `lib/registry.js` el 2026-07-27, ahora en la otra herramienta que
   lo necesitaba). 28.789 ocurrencias en el bbox, 21.448 dentro de algún hábitat, **2.117 especies
   distintas** (140 Aves, 1.977 no-Aves).
3. **Reutilización** contra el catálogo de Cabo Cope (174 especies) por nombre científico, cruzada con
   el respaldo del Atlas y la observación GBIF real dentro de Sierra Espuña.
4. **EIDOS** (taxonomía + UICN por ámbito + estado legal + nombre común) para toda especie nueva.
5. **BISE** (Discodata, `Site_Species_List` por `site_code=ES0000173`) para el apartado de fauna del
   espacio (aves + murciélagos + galápago), aparte de las especies ligadas a hábitat.
6. `reconcile-taxa.js` para la tabla maestra `eidos_taxonid`↔`gbif_speciesKey`.

### Alcance del catálogo: decisión explícita, no un límite técnico

GBIF devolvió 2.117 especies distintas; la mayoría es ruido de cordura filtrable (Lepidoptera,
hongos, arácnidos) o singletons. **Se preguntó al usuario qué nivel de cobertura quería** y se optó
por el de máxima fidelidad: todas las especies con respaldo del Atlas (independientemente del nº de
ocurrencias — el Atlas ya certifica el vínculo especie↔HIC a nivel nacional) + solo-GBIF con **≥15
ocurrencias** en los hábitats del parque. Con esos criterios:

- **414 especies** (344 flora, 70 fauna): 51 flora/fauna + 23 aves reutilizadas literalmente de
  Cabo Cope (mismo `eidosTaxonId`, texto sin reescribir); 340 nuevas.
- **Alcance flora + vertebrados**, igual que el piloto (Cabo Cope tampoco cataloga insectos/hongos/
  arácnidos pese a tenerlos en su propia fauna registrada). Sierra Espuña tiene una comunidad de
  Lepidoptera muy rica en el GBIF descargado (~90 especies con decenas-cientos de ocurrencias,
  p. ej. *Zygaena fausta*, *Melanargia lachesis*, *Iphiclides feisthamelii*): **queda fuera a
  propósito**, documentado aquí como ampliación futura si el producto decide abrir una categoría de
  insectos.
- **9 especies descartadas** pese a coincidir de nombre: 3 quenopodiáceas de saladar
  (*Caroxylon genistoides*, *Nitrosalsola vermiculata*, *Canarosalsola divaricata*, géneros propios
  del split moderno de *Salsola*) y otras 5 halófitas/de grava fluvial reutilizables de Cabo Cope
  (*Suaeda vera*, *Beta maritima*, *Lygeum spartum*, *Limonium delicatulum*, *Halocnemum
  strobilaceum*, *Glaucium flavum*, *Scrophularia canina*, *Atriplex halimus*, *Artemisia
  barrelieri*) sin ningún hábitat afín entre los 13 de Sierra Espuña (macizo interior, sin saladar ni
  cauces de grava tipo HIC 3250) — probable ruido de bbox/geocodificación, no litoral. 2 híbridos
  naturales (*Pistacia* × *saportae*, *Rhamnus* × *colmeiroi*) descartados por redundantes con la
  especie parental ya incluida. 2 nombres sin resolver en EIDOS pese a variantes de búsqueda
  (*Lophiolepis echinata*, *Helianthemum helianthemoides*) — hueco documentado, no se ha inventado su
  taxonomía.

### Aves y fauna LIC/ZEPA (sin hábitat, apartado propio)

**48 aves** de la lista oficial BISE del sitio ES0000173 (23 reutilizadas de Cabo Cope, 25 nuevas).
3 reclasificaciones confirmadas en EIDOS respecto al nombre de BISE: *Sylvia cantillans* → *Curruca
cantillans*, *Sylvia conspicillata* → *Curruca conspicillata*, *Saxicola torquatus* → *Saxicola
rubicola* (esta última coincide exactamente con la reclasificación ya documentada en el piloto,
12325→16387, confirmando que es el mismo caso).

**9 quirópteros + 1 galápago leproso** (*Mauremys leprosa*) de la misma lista BISE, especies Anexo II
de la Directiva Hábitats ligadas al complejo cárstico y a los cursos de agua del macizo. Los
murciélagos **no se asignan a hábitat vegetal** (ninguno de los 13 HIC catalogados es una cueva o
grieta cartografiada como tal) — mismo criterio que las aves, documentado en su `description`. El
galápago sí se asigna a los dos hábitats de ribera (92D0, 92A0), verificable en su ecología.

### Dos bugs de herramienta corregidos en esta sesión

1. **`Tools/gbif-habitats.js`** solo resolvía parques `status: "available"`: para un parque `basic`
   ascendiendo (justo el caso de uso) era imposible ejecutarlo. Mismo síntoma que tuvo
   `lib/registry.js` el 2026-07-27 y mismo arreglo (acepta `available` y `basic`).
2. **`Tools/catalogo-nacional/enrich-images.js`** fallaba en silencio: la vista EIDOS descubierta por
   heurística (`v_imagenes`) usa la columna `id_taxon`, no `idtaxon` como el resto de vistas de EIDOS,
   así que PostgREST devolvía un objeto de error en vez de un array, `for...of` lanzaba "no es
   iterable" dentro de `fromEidos`, y `pool()` lo capturaba como `{error}` **sin `sp` asociado** — el
   informe final mostraba "0 rellenadas / 0 sin foto" sin ningún aviso, como si no hubiera nada que
   hacer. Corregido con guarda `Array.isArray(rows)` + contador de errores reales visible en el
   informe. Tras el arreglo: **138/414 especies con foto** (33%), con GBIF (país ES, CC0/CC-BY/CC-BY-
   SA/CC-BY-NC marcada) como única fuente real — la vista EIDOS nunca devolvió fotos utilizables para
   ninguna especie del catálogo. Informe completo en
   `Tools/catalogo-nacional/out/sierra-espuna-fotos.md`.

### Huecos conocidos (documentados, no inventados)

- **0 POIs.** No se encontró en esta sesión una fuente geográfica oficial con coordenadas descargables
  para la red de senderos (murcianatural.carm.es lista 11 senderos oficiales pero sin GPX/KML
  público; el geoportal IMIDA tiene la capa "PORN y PRUG Sierra Espuña" (id 35 del servicio
  PROYECTOS/OISMA) pero es zonificación de plan, no puntos de interés). Pendiente de una sesión
  dedicada a extraer POIs del PRUG en PDF o de la capa de zonificación.
  **Actualización (2026-07-28):** la *red de senderos* sí está resuelta, por otra vía —
  `Tools/build-park-trails.js` recorta las relaciones GR/PR/SL de OpenStreetMap contra el límite
  oficial y Sierra Espuña sirve 17 senderos (`geo/trails.geojson`). No cierra este hueco: son trazas
  lineales, no POIs, y el PRUG sigue siendo la fuente pendiente para puntos de interés.
- **276/414 especies sin foto con licencia válida** — la mayoría flora poco fotografiada en GBIF/
  iNaturalist con licencia abierta; no se ha rebajado el criterio de licencia para forzar cobertura.
- **60 especies sin `habitatIds`** (documentado y es un aviso del validador, no error): 48 aves +
  9 quirópteros (fauna LIC/ZEPA sin hábitat vegetal por diseño) + 3 especies reutilizadas de Cabo Cope
  con evidencia GBIF/Atlas insuficiente en Sierra Espuña para asignarlas con confianza a un hábitat
  concreto (*Fagonia cretica*, *Ziziphus lotus*, *Osyris lanceolata*).
- **254 especies con `conservationStatus: "NE"`** (no evaluada UICN a escala mundial) — sobre todo
  flora, mismo patrón que en el piloto (~54/124 sin dato UICN allí).
- Contraste de campo recomendado: la lista de aves BISE recuperó 48/48 por diseño (fuente documental,
  no observación), pero el cruce GBIF-observado de esas mismas aves no se ha hecho (evidencia
  'zepa', no 'observada_gbif' — ver README §1, es una limitación conocida del modelo, no de esta
  sesión). Los 9 quirópteros son de designación LIC (roosts) y no se han verificado ocurrencias GBIF
  específicas dentro del parque, más allá de su inclusión en la lista oficial del sitio.

## 2026-07-27 — Capa de hábitats curada (Atlas 2005) en Cabo Cope y Sierra Espuña

Adoptado por fin el `<slug>-merged.geojson` como capa real del parque: es el punto **§8.3** de la
deuda técnica, que llevaba abierto desde el piloto (la fusión se generaba en `out/` y nadie la
llevaba a `Frontend/`). Herramienta nueva: **`Tools/catalogo-nacional/adopt-habitats.js`** (`--dry`).

| | Cabo Cope | Sierra Espuña |
|---|---|---|
| Hábitats | 15 → **16** | 0 → **13** |
| Prioritarios | 5 | 3 |
| Cobertura del parque (unión real) | 21 % → **53 %** (1.404 ha) | **91 %** (16.067 ha) |
| Recintos recortados | 28 → 38 | 53 |
| Vértices fuera del límite | **0** ✔ | **0** ✔ |

`adopt-habitats.js` **conserva lo curado a mano** (descripción, coordenadas, color, imagen, audio,
`speciesIds`) y refresca desde la fuente oficial solo lo que es dato (código, nombre, tipo,
prioridad, subtipos, fitosociología). Un hábitat curado que la fuente ya no respalde **no se borra en
silencio**: se conserva y se avisa.

### La regla marina también aplica a los hábitats

**1120 «Praderas de Posidonia» queda fuera de Cabo Cope.** La cartografía oficial lo recorta dentro
del parque, pero está sumergido y la app no es útil en el mar. El filtro es por `type: "Marino"` de
`hic-nombres.json`, y cada exclusión se informa. Es la misma regla de producto que sacó a los
espacios marinos, aplicada un nivel más abajo.

### Dos arreglos de herramienta

- **`merge-habitats.js` exigía una capa curada previa** y moría con `ENOENT` si no existía — es decir,
  **ningún parque nuevo del rollout podía fusionarse**, y todos empiezan sin capa curada. Ahora es
  opcional: sin ella, la capa se crea entera desde la oficial. Regresión: Cabo Cope sale idéntico.
- **`hic-nombres.json`**: añadido **6170** «Prados alpinos y subalpinos calcáreos», confirmado por dos
  vías independientes (índice del Atlas y campo `DESCRIPCIO` del propio dato de Murcia). Documentado
  que 8211/6175/9561/5334/5335 son **subtipos españoles de 1997** que el Atlas normaliza a códigos UE
  (→8210/6170/9560/5330), así que solo hacen falta si se vuelve a la fuente vieja.

> **8230 queda resuelto de rebote.** El Atlas 2005 no registra 8230 en toda la provincia de Murcia,
> lo que respalda que la asignación de 1997 era errónea. Al usar el Atlas, el caso dudoso desaparece
> sin necesidad de reconciliar a mano: ni Cabo Cope ni Sierra Espuña lo llevan ya.

### Pendiente

Sierra Espuña tiene hábitats pero **sigue en `status: "basic"`** y el validador avisa («la ficha base
ya trae contenido, ¿toca pasarla a available?»). No se ha cambiado a propósito: sin catálogo de
especies, la app mostraría un parque «completo» con 0 especies. Pasa a `available` cuando esté la
Capa 3.

---

## 2026-07-27 — Límites reimportados del IMIDA: los 15 espacios, sin generalizar

Los límites N1 salían de la capa ENP nacional del MITECO, que es un producto **generalizado**. El
geoportal del IMIDA/CARM sirve la misma delimitación oficial con 2 a 15 veces más detalle. Ya
constaba para `cuatro-calas` («se conserva la del IMIDA por ser la de mayor detalle») pero no se
había generalizado al resto. **Hecho** con
`Tools/catalogo-nacional/refina-limites-imida.js` (`--dry`, `--solo`), que cachea las descargas en
`fuentes/imida-enp/`.

| Espacio | antes (MITECO) | ahora (IMIDA) | desvío sup. |
|---|---|---|---|
| Cabo Cope y Puntas de Calnegre | 449 | **6.566** | 0,18 % |
| Barrancos de Gebas | 2.283 | **6.358** | 0,20 % |
| Sierra Espuña | 2.514 | **6.329** | 0,21 % |
| Calblanque | 1.489 | **4.832** | 0,40 % |
| Sierra de la Pila | 1.471 | **3.759** | 0,18 % |
| Espacios Abiertos e Islas del Mar Menor | 1.843 | **3.532** | 0,12 % |
| Humedal del Ajauque y Rambla Salada | 1.553 | **3.530** | 0,18 % |
| Sotos de Cañaverosa | 550 | **2.167** | 2,49 % † |
| Carrascoy y El Valle | 1.305 | **2.100** | 0,19 % |
| Salinas de San Pedro del Pinatar | 482 | **1.234** | 0,16 % |
| Monte Arabí | 774 | **1.174** | 0,25 % |
| Sierra de las Moreras | 672 | **1.159** | 0,20 % |
| Sierra de Salinas | 116 | **872** | 0,35 % |
| Sierra de El Carche | 724 | **851** | 0,17 % |
| Cabezo Gordo | 177 | **365** | 0,18 % |

**Los 15 caben con tolerancia 0 m**: no se ha generalizado nada. El mayor pesa 140 KB, muy por
debajo del presupuesto de 300 KB.

† Cañaverosa **no es un fallo**: es la discrepancia MITECO↔IMIDA ya conocida (248,8 vs 242,1 ha). La
geometría nueva da 242,6 ha, que casa con la cifra del propio IMIDA. Consta en su `boundaryNote`.

`cuatro-calas` se deja fuera a propósito (`INTOCABLES` en el script): su límite ya venía del IMIDA y
se dio por cerrado.

### Tres trampas de esta importación

1. **La densidad de vértices NO sirve para detectar los límites malos.** Calblanque era de los más
   densos que teníamos (31,2 vért/km) y aun así 3,3 veces más basto que su original. El problema
   estaba en la fuente, no en la generalización del generador N1.
2. **Varios registros `Firme` del mismo espacio son dos cosas distintas**, y confundirlas rompe el
   límite:
   - *alternativas* — cada una cubre el espacio entero (**Calblanque**: 2.472 y 2.466 ha). Se coge
     **la de más vértices**, decidido explícitamente.
   - *piezas* — juntas forman el espacio (**Espacios Abiertos del Mar Menor**: 1.227,3 + 80,1 =
     1.307,4 ha, la superficie oficial exacta). Hay que **unirlas todas**; quedarse con la mayor
     dejaba el límite un **6 % corto**, que es lo que pasó en la primera pasada.

     El discriminante es la suma: si suma la superficie oficial son piezas; si cada una ya la
     alcanza, son alternativas.
3. **ArcGIS entrega los anillos planos** y con la orientación contraria a GeoJSON (exterior horario,
   agujeros antihorario). Hay que reagrupar cada agujero dentro de su exterior — y con el **más
   pequeño** que lo contenga, o una isla dentro de una bahía acaba asignada al polígono equivocado.

Las `Provisional` no entran: Carrascoy publica una de 17.420 ha (14.608 vértices) frente a las
16.686 ha firmes.

### Efecto sobre los hábitats

Los hábitats se recortan **contra el límite**, así que al afinarlo hubo que rehacer la Capa 2 de los
dos parques curados. Cabo Cope gana un recinto y un hábitat (38→39 recintos, 16→17 hábitats); Sierra
Espuña se mantiene en 13. **0 vértices fuera del límite** en ambos.

Capas del servicio por figura: **1** Parques Regionales · **2** Reservas Naturales · **3** Paisajes
Protegidos · **4** Monumentos Naturales · **5** Otros ENP. El emparejamiento con nuestros códigos
oficiales se hace por `CodigoENP` del IMIDA usando `data/murcia-enp-municipios.json`. **Cuidado al
normalizar ese código**: viene con erratas (`EN0000018`), distinto número de ceros y en un caso con
una aclaración detrás («ENP000008 (dos piezas…)»), así que hay que quedarse con el primer grupo de
dígitos y quitar los ceros a la izquierda.

---

## 2026-07-27 — Fase 2 de Sierra Espuña: Capa 2 hecha, y dos fallos del pipeline corregidos

### Parámetros confirmados (el §3 del rollout obliga a pararse si alguno no cuadra)

| | |
|---|---|
| `REGION_NN` | **30** (Murcia) |
| Huso UTM | **30N**, leído del `.prj`: `PROJCS["ETRS_1989_UTM_Zone_30N"...Central_Meridian,-3.0]`. No asumido |
| `SITE_CODES` | **ES0000173** (TIPO C: LIC/ZEC **y** ZEPA, 100 % de solape) |
| Límite WGS84 | `Frontend/Data/parks/murcia/sierra-espuna/geo/parque.geojson` |

Las dos copias en disco del shapefile del MITECO son idénticas (mismo md5).

### Herramientas recuperadas de la rama `catalogo-nacional`

`reconcile-taxa.js`, **`Tools/eidos-diff.js`** y **`Tools/gbif-habitats.js`**. Las tres estaban en la
situación que el README §5 describía: salida versionada pero código ausente en `main`. Las dos
últimas además dejaban rotos `npm run eidos:diff` y `npm run gbif:habitats`. Coinciden byte a byte
con la copia de `Desktop\NaturDex - copia\`.

### Dos fallos del pipeline de Capa 2 — corregidos

1. **`lib/registry.js` no podía resolver una ficha N1.** Sólo aceptaba `status === 'available'` **y**
   exigía un `habitats.geojson` ya existente — justo lo que se está creando al ascender N1→N2. Y
   buscaba el límite en `geo.boundary`/`geo.park`, claves que no usa nadie: funcionaba con el piloto
   **por casualidad**, porque su fallback (`parque-regional.geojson`) coincidía con el nombre del
   fichero. Ahora acepta `available` y `basic`, lee `geo.parque` y deduce el destino del
   `habitats.geojson` cuando todavía no existe.

2. **El recorte usaba un solo anillo del límite.** `readBoundaryRing` devolvía `coordinates[0][0]`:
   ignoraba agujeros y piezas secundarias. Impacto medido:

   | | anillo exterior | límite real | error |
   |---|---|---|---|
   | Cabo Cope (piloto) | 2.863,1 ha | 2.670,9 ha | **+7,2 %** (agujero de 192,2 ha) |
   | Sierra Espuña | 18.175,5 ha | 17.729,5 ha | **+2,5 %** (agujero de 471 ha + 4 piezas perdidas) |

   Las 2.665,7 ha oficiales del piloto confirman cuál es el bueno. Nuevo `readBoundaryPolygons()`
   devuelve el MultiPolygon completo; `build-habitats.js` recorta contra él y comprueba los vértices
   con `dentroDelLimite()` (piezas + agujeros).

   **Regresión:** la salida del piloto cambia en exactamente **2 recintos y 39,5 ha**, todas dentro
   del enclave excluido. **El `habitats.geojson` que sirve la app NO estaba afectado** (verificado:
   0 ha de solape con el enclave) — el fallo estaba en la herramienta, no en producción.

### Resultado de la Capa 2

**52 recintos recortados · 0 vértices fuera del límite ✔ · 15 códigos HIC** →
`out/sierra-espuna-oficial.geojson`.

### Decisiones tomadas

- **8230 se queda literal, sin reconciliar.** Su asociación es `Hypericion ericoidis Esteve 1967`,
  la misma por la que el piloto se reconcilió a 8210, y Sierra Espuña es un macizo calizo. Se decide
  conservar el código de la fuente de 1997. **Hueco conocido: Sierra Espuña queda incoherente con el
  piloto** para la misma asociación (8230 aquí, 8210 allí); si algún día se unifica, hay que tocar
  los dos.
- **Nombres HIC ampliados desde el Atlas oficial**: 5 códigos nuevos (4090, 6175, 8211, 9240, 9561).
  El catálogo pasa de 32 a 37. Imprescindible extraer el PDF con `pdftotext -layout`: sin ese flag
  el texto se refluye a dos columnas y mezcla el nombre de un código con el del siguiente (así se
  detectó, porque salían nombres cruzados).

### Huecos que deja abiertos

- **5334 y 5335 sin nombre** (7 y 9 recintos). El Atlas **no los nombra**: sus filas del índice vienen
  vacías (`5334/ 4334/ *`). El `Habi30.dbf` del MITECO tampoco trae nombres, sólo códigos y
  asociación. Se quedan con el fallback `HIC <código>` hasta encontrar fuente que los nombre.
- **Prioridad de 9561 sin resolver.** `9560` sí está en `hic-prioritarios.json`, y 9561 es su subtipo
  español, pero **no se ha dado por prioritario sin fuente**: el `*` de las filas del Atlas es un
  separador de columna, no una marca de prioridad (4090 también lo lleva y no es prioritario). El
  flag `PRIORITARI` del dato de 1997 marca 9561 con `*`, pero el README avisa de que ese flag no es
  fiable. Falta contrastarlo contra el Anexo I oficial.
- **Sierra Espuña no tiene capa curada**, así que `merge-habitats.js` no tiene con qué fusionar: la
  capa oficial pasaría a ser directamente su `habitats.geojson`. Es el punto §8.3 de la deuda técnica
  («adoptar el `<slug>-merged.geojson`»), pendiente de decidir.
- **Capa 3 (especies) sin empezar.**

---

## 2026-07-27 — Dos reglas de producto: nada marino, nada geológico suelto

Decididas al revisar el primer lote. **Aplican a todo el rollout nacional**, no sólo a Murcia.

### 1. Los territorios marinos se descartan: la app no es útil en el mar

- **Espacios ENP marinos**: fuera. En Murcia sólo cae uno, `Islas e Islotes del Litoral
  Mediterráneo` (ES620023): 39,5 ha de peñones repartidos por 100 km de costa, sin acceso a pie y
  con una caja envolvente de 0,9° de longitud que lo hacía inservible como «parque» en un mapa.
- **Sitios Natura 2000 marinos**: fuera de las capas `lic.geojson` / `zepa.geojson`, aunque el
  espacio en sí se quede.

**El criterio de «marino» está resuelto y es nacional.** La capa del MITECO **no trae** el porcentaje
marino de cada sitio, pero sí la administración competente (`AC`), y **los 96 sitios de competencia
estatal (`DGBBD`) de los 1.865 de la capa son marinos sin excepción** — comprobados uno a uno. El
nombre **no** vale como criterio: sólo 63 de esos 96 llevan una palabra marina («Sebadales de…»,
«Bahía de…», «Canal de Ibiza», «El Cachucho» son marinos y no la llevan).

Lo que `AC` no caza son los marinos de competencia **autonómica**, que hay que enumerar por
comunidad en `marinosRegionales` del generador. En Murcia es uno: **ES6200029 «Franja Litoral
Sumergida de la Región de Murcia»**.

Excluidos en este lote: ES0000507, ES0000508, ES6200048 (DGBBD) y ES6200029 (autonómico). Efecto
colateral bienvenido: el `lic.geojson` de `calblanque` baja de 231 KB a 47 KB y el de
`espacios-abiertos` de 263 KB a 80 KB.

> **El Mar Menor se conserva** (ES6200030 LIC y ES0000260 ZEPA). Es laguna, pero su ZEPA incluye
> 887 ha de humedales de orilla que sí se caminan: tratarlo como mar dejaría a
> `espacios-abiertos-e-islas-del-mar-menor` prácticamente sin contexto Natura 2000.

> **Excepción decidida: `cuatro-calas` se queda como está.** Su `geo/zepa.geojson` contiene un único
> sitio, **ES0000507 «Espacio marino de los islotes litorales de Murcia y Almería»** (DGBBD, marino),
> que por esta regla no debería estar. Se conserva a propósito: los límites de Cuatro Calas están
> dados por buenos y verificados, y no se reabren. **No lo "arregles" en una sesión futura.**
>
> Sigue protegido por partida doble: `cuatro-calas` está en `yaCargados` del generador, así que éste
> ni lo regenera ni lo toca. Si alguna vez se sacara de esa lista para rehacerlo, el filtro marino sí
> le quitaría esa ZEPA — tenlo presente antes de hacerlo.

### 2. Los Monumentos Naturales geológicos son POI, no espacios

Un afloramiento, una cueva o una formación de erosión no son un territorio que explorar: son un
punto de interés del parque que los contiene. **Si están fuera de todo territorio protegido, se
descartan.**

Dato que obligó a descartarlos todos: **los 21 ENP de Murcia son disjuntos entre sí** y ninguno de
los cuatro Monumentos Naturales solapa con Red Natura 2000. Ninguno está dentro de nada.

| Monumento | ha | ENP más cercano | Natura 2000 más cercano | Destino |
|---|---|---|---|---|
| Gredas de Bolnuevo (ES620021) | 2,4 | **440 m** Sierra de las Moreras | 440 m ES6200011 | descartado · **POI pendiente** |
| Sima de la Higuera (ES620024) | 49,0 | 3,51 km Sierra Espuña | 1,17 km ES6200045 | descartado |
| Capa Negra de Caravaca (ES620025) | 24,0 | 18,51 km Salto del Usero | 2,68 km ES6200019 | descartado |
| Monte Arabí (ES620020) | 582,4 | 25,43 km Sierra de El Carche | 4,74 km ES0000196 | **se queda** |

**Monte Arabí se queda como espacio propio**: 582 ha, doce veces el siguiente, con paisaje y
vegetación propios: se comporta como un espacio explorable, no como un rasgo geológico puntual. Y a
25 km de nada, no podría ser POI de ningún parque.

#### POI pendiente para la Fase 2

**Gredas de Bolnuevo**, a 440 m del límite de `sierra-de-las-moreras`. Cuando ese espacio suba a N2,
darlo de alta como punto de interés con estos datos oficiales (no hace falta volver a buscarlos):

- Código ENP **ES620021** · Monumento Natural · 2,4 ha · Mazarrón
- Centro oficial calculado: **37.56471, -1.31338**
- Geometría: capa ENP del BDN (MITECO, diciembre 2025), `SITE_CODE_ = ES620021`
- Recuperable con `node Tools/catalogo-nacional/build-n1-espacios.js --nuts2 62 --solo ES620021`
  tras quitarlo de `excluidos` (el generador es determinista: sale idéntico).

---

## 2026-07-27 — Fase 1 (N1): los espacios pendientes de la Región de Murcia

**Generador:** `Tools/catalogo-nacional/build-n1-espacios.js`, parametrizado por código NUTS2 y
reutilizable con el resto de comunidades. Admite `--dry` y `--solo <codigoENP>`, y es **idempotente
verificado**: la segunda ejecución deja los 64 ficheros byte a byte idénticos. También **deshace lo
suyo**: si un espacio pasa a `excluidos`, retira su carpeta y su entrada del registro — pero sólo si
sigue siendo una ficha base vacía; si alguien le ha añadido contenido, se niega y avisa.

```
node Tools/catalogo-nacional/build-n1-espacios.js --nuts2 62 [--dry]
```

Para dar de alta otra comunidad basta añadir su entrada a la tabla `COMUNIDADES` del script (región,
provincia, huso UTM, rutas de las capas y fichero de municipios). Las comunidades **multiprovinciales
necesitarán además resolver la provincia de cada espacio**: la capa ENP no la trae, y el script se
planta si `provinciaSlug` no está definido.

### Lo que produce, por espacio

`geo/parque.geojson` (límite recortado del ENP), `geo/lic.geojson` y `geo/zepa.geojson` (solo si hay
solape real), `park.json` con el bloque `park` y los tres arrays vacíos, `manifest.json` con los
contadores a cero y **sin bloque `tiles`**, más la entrada `status: "basic"` en `parks-index.json`.

### Cuatro decisiones que conviene no volver a discutir

1. **La capa del MITECO viene proyectada en UTM**, pese a lo que exige la especificación GeoJSON.
   Península EPSG:25830, Canarias EPSG:32628, declarado en el miembro `crs`. Se reproyecta con
   `utmToLonLat()`.
2. **Se generaliza en UTM, no en grados.** Douglas-Peucker con tolerancia en metros; en grados la
   tolerancia deforma más en un eje que en otro. **Los 15 límites cabían con 1 m de tolerancia**, la
   más fina de la escalera: la generalización no ha sido el factor limitante en Murcia.
3. **El presupuesto de peso (300 KB) se aplica al `geo/` del espacio, no a cada fichero.** El límite
   se lleva la tolerancia más fina que quepa y las capas Natura se generalizan con lo que sobra: el
   límite es lo único que una ficha base promete. Tras retirar las capas marinas, el máximo baja a
   146,9 KB (`sierra-espuna`); antes eran 292,6 KB en `calblanque`.
4. **El solape con Red Natura se mide con `polygon-clipping`, no se supone por caja envolvente.**
   Umbral de 0,1 ha para descartar astillas. Los descartes de Murcia fueron todos de ≤0,001 ha
   (espacios que sólo se tocan por el borde) y quedan listados en la salida del script.

### Verificación

- `npm run validate` en verde: **16 espacios, 1 completo + 15 fichas base**, 46 avisos (todos
  `sin manifest.tiles`, esperable: los pmtiles se generan aparte con `npm run tiles:build <slug>`).
- Comprobación geométrica independiente de los 15 límites: centroide **dentro** del polígono, caja
  envolvente **dentro de la Región de Murcia** (no sólo de España), superficie de la geometría
  **dentro del 0,5 %** de la `Sup_ha` oficial, orientación de anillos conforme a RFC 7946 y
  `center` del registro idéntico al de `park.json`.
- Los polígonos se dibujan correctamente sobre teselas reales de OpenStreetMap.
- Barrido final: **ninguna capa de los espacios generados contiene un sitio marino** (única
  excepción, `cuatro-calas`, conservada a propósito y documentada arriba).

> Las cifras de este apartado son las de esa pasada (16 espacios, contando entonces a Salto del
> Usero). El estado final de la comunidad, tras su desbloqueo y posterior retirada, es el del
> bloque de cierre de aquí abajo.

### Fase 1 de la Región de Murcia: CERRADA (estado final, 2026-07-28)

De los 21 espacios de la capa oficial:

| | |
|---|---|
| En la app | **16** — 2 completos (N2: cabo-cope-puntas-calnegre, sierra-espuna) + 14 fichas base |
| Descartados por las reglas de producto | **4**, decisión confirmada: se quedan fuera |
| Retirado tras estar dado de alta | **1** (Salto del Usero) |
| Bloqueados | **0** |

Los 4 descartados —`Islas e Islotes del Litoral Mediterráneo` (marino) y los tres Monumentos
Naturales geológicos fuera de territorio protegido (`Gredas de Bolnuevo`, `Sima de la Higuera`,
`Capa Negra de Caravaca`)— **no se van a dar de alta**. Está confirmado, no es un pendiente: si
alguna vez se quisiera revertir, basta quitarlos de `excluidos` en `build-n1-espacios.js` y el
proceso es determinista, pero **no hay que hacerlo por iniciativa propia**.

**Salto del Usero** es un caso distinto: no está descartado por ninguna regla de producto, sólo
retirado. Su municipio quedó resuelto (Bullas) y el generador lo reconstruye igual que la primera
vez si se decide retomarlo — ver «Salto del Usero retirado de la lista de parques» al principio del
documento.

**No queda nada pendiente de la Fase 1 en esta comunidad.** Lo único opcional son los paquetes de
mapa sin conexión (`npm run tiles:build <slug>`), que van aparte y son el origen de los avisos del
validador: sin ellos la app funciona, pero el mapa base sale vacío sin cobertura.

### Salto del Usero (ES620026) — el único bloqueado

No figura con carácter Firme en el servicio del IMIDA, así que `murcia-enp-municipios.json` lo deja
sin municipios, y `validate-park-data.js` exige `municipalities` no vacío. **La ficha no se puede
cerrar sin inventar el municipio**, así que se queda fuera. Para desbloquearlo hace falta el
municipio en fuente oficial (el BORM de su declaración, o la ficha del espacio en la CARM); en cuanto
esté, se añade a `murcia-enp-municipios.json` y el generador lo recoge sin tocar nada más.

### Dos correcciones a documentación previa

1. **`inventario-fuentes-bdn.md` cuenta un feature de más en cada capa** (1.639 y 1.640 en vez de
   1.638 y 1.639). `inspect-geojson.js` localiza los features buscando la cadena `"properties"`, y el
   bloque `crs` de la cabecera también la contiene. El recuento por comunidad no se ve afectado
   (Murcia = 21 ✓).
2. **Los slugs se generan con una regla, no a mano**: minúsculas sin tildes con guiones y, sólo si el
   resultado pasa de 40 caracteres, se descartan los conectores (`y`, `de`, `del`, `la`…) —que es la
   convención con la que ya se nombró `cabo-cope-puntas-calnegre`. Sólo dos espacios la han
   necesitado: `calblanque-monte-cenizas-pena-aguila` y `salinas-arenales-san-pedro-pinatar`.

---

## Parámetros técnicos verificados por provincia

### Región de Murcia (provincia 30)

- **Huso UTM: 30N (ETRS89 UTM30N / EPSG:25830)**. Consta literalmente en:
  - la propiedad `fuente` de `Tools/catalogo-nacional/out/cabo-cope-puntas-calnegre-oficial.geojson`
    (`"...reproyectado ETRS89 UTM30N→WGS84"`);
  - el `source` de los hábitats en
    `Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/geo/habitats.geojson`
    (`"...huso 30 ETRS89..."`).
  - Reconfirmado el 2026-07-25 al reproducir el pipeline: `build-habitats.js --zone 30` reproduce
    `out/cabo-cope-puntas-calnegre-oficial.geojson` byte a byte.
- **ZIP del MITECO (Directiva Hábitat 92/43/CEE, región 30 = Murcia)** — no versionados en el repo,
  conservados en disco en dos sitios:
  - `C:\Users\Deathscythe\Desktop\Murcia\` — shapefile (`DirectivaHabitat30_1997.shp/.dbf/.prj/...`)
    ya extraído.
  - `C:\Users\Deathscythe\Desktop\NaturDex-work\fuentes-mitec\` — los `.zip` originales
    (`directivahabitat30.zip`, `directivadatos_30.zip`) + el mismo shapefile + `Habi30.dbf` ya
    extraídos.
- **Códigos Natura 2000 usados en el piloto**: LIC ES6200031, ES6200012; ZEPA ES0000261.

---

## §8.1 — Tabla de reconciliación taxonómica: qué hay ya

`Tools/catalogo-nacional/out/cabo-cope-puntas-calnegre-reconciliacion.json` es, para las 124
especies del piloto, exactamente la tabla `eidos_taxonid` ↔ `gbifSpeciesKey` que
`Docs/prompts/e-rollout-nacional.md` §8.1 pide como prerrequisito de la reutilización de especies
entre parques: por especie trae `eidos_taxonid` + nombre aceptado en EIDOS, `gbif_speciesKey` +
nombre aceptado en GBIF, si hubo reclasificación y si las dos fuentes coinciden. Estadísticas del
piloto: 106 EIDOS ok / 17 sinónimo / 1 no encontrado; 124 GBIF ok; 19 discrepancias entre fuentes.

Es un buen punto de partida para la tabla maestra nacional, con dos matices:

1. **Solo cubre las especies del piloto** (un parque). La tabla nacional necesita acumular todas
   las especies de todos los parques procesados, sin duplicar por `eidos_taxonid`.
2. **El script que la generó (`reconcile-taxa.js`) no está recuperado en `main`** — solo su salida
   para este parque. Está en la rama `catalogo-nacional` y en
   `C:\Users\Deathscythe\Desktop\NaturDex - copia\Tools\catalogo-nacional\reconcile-taxa.js`. Antes
   de generar la tabla del segundo parque hay que recuperarlo (mismo procedimiento que se siguió
   aquí para `build-habitats.js`/`merge-habitats.js`).

No se ha tocado el fichero ni se ha generado tabla nacional en esta sesión — es reparación de
herramientas, no carga de datos nuevos.

---

## 2026-07-25 — Fuentes MITECO/IEPNB y corrección del estado de conservación del piloto

### Nuevas fuentes registradas

`Tools/catalogo-nacional/fuentes/` con tres manifiestos versionados (los binarios no se versionan):

- `FUENTES.json` — ENP, Red Natura 2000, Hábitat art.17 (2013-2018) y riqueza de especies del IDE.
- `habitat-provincias.json` — **las 50 provincias** de la cartografía de HIC (1997) con su URL
  literal de shapefile y de tabla de atributos. Las URL llevan sufijos `_tcm30-NNNNNN` opacos que
  **no son derivables**; están copiadas de las dos páginas de descarga del MITECO.
- `iepnb-api.json` — API PostgREST del IEPNB, **sin autenticación**, con la Lista Patrón en JSON.

### Tres correcciones de documentación

1. **La cartografía de hábitats de 1997 es la vigente.** El MITECO declara que, hasta que exista la
   del Inventario Español de Hábitats Terrestres, lo publicado es la de 1997. La «CNH21 (2021)» que
   `Tools/catalogo-nacional/README.md` da como sucesora nacional **no lo es**.
2. **Red Natura 2000 va un año por detrás de su fecha de publicación**: publicada a 31/12/2025, su
   contenido es lo remitido a la Comisión Europea hasta diciembre de 2024.
3. **`riqueza-especies.zip` no es el IEET por especie**: son 5 KB con el *número* de especies por
   cuadrícula, congelado en 2012. La distribución especie a especie sigue viniendo de EIDOS y GBIF.

### Corrección del estado de conservación (14 fichas)

Contraste de las 174 especies del piloto contra `v_listapatronespecie_normas`. Se verificó primero
que **`eidosTaxonId` es el `idtaxon` del IEPNB**. Informe:
`Tools/catalogo-nacional/out/cabo-cope-contraste-iepnb.md`. Script idempotente:
`Tools/catalogo-nacional/fix-estado-conservacion-iepnb.js` (admite `--dry`).

- **2 infraprotecciones**: cogujada común y curruca cabecinegra constaban como «No catalogada» y
  están en el **LESRPE**.
- **4 protecciones inexistentes**: garduña, perdiz roja, tejón y tórtola europea tenían LESRPE
  atribuido sin estarlo; tres son especies cinegéticas.
- **2 categorías CEEA omitidas**: chorlitejo patinegro y gaviota de Audouin son **CEEA Vulnerable**.
- **4 figuras regionales añadidas** (antes solo «Ave de la ZEPA»): águila real, carraca europea,
  culebrera europea y gaviota de Audouin, citando la Ley 7/1995.
- **3 identificadores rotos resueltos**: `12063→12065` (chova piquirroja), `12325→16387` con
  renombre a *Saxicola rubicola* (tarabilla europea) y `12119→33007` con renombre a *Alaudala
  rufescens* (terrera marismeña). Los tres IDs antiguos no existen en la Lista Patrón.

`npm run validate` en verde (32 avisos, todos preexistentes y de imágenes de hábitat).

### Segunda y tercera pasada — UICN y ámbito UE (misma sesión)

**43 fichas modificadas en total.** `fix-estado-conservacion-iepnb.js` es **idempotente
verificado**: re-ejecutarlo deja `park.json` y `seed.sql` byte a byte idénticos.

**UICN — 13 fichas.** Cruzando el «Código UICN» de `v_listapatronespecie_codigos` contra
`iucnGlobal`: 84 de 173 especies tienen assessment, y 13 constaban como «NE»/«no evaluada». Las 13
son flora. Dos con categoría de amenaza: el **esparto** (*Stipa tenacissima*) es **VU con tendencia
decreciente** —especie estructural del paisaje del parque— y el **ajo de flor oscura** (*Allium
melananthum*) es **NT**. Las otras 11, LC. Fuente registrada: <https://www.iucnredlist.org/>
(ficha completa en `fuentes/iepnb-api.json`).

> **No se tocó `conservationStatus` en flora**: ahí ese campo refleja el estado LEGAL (Decreto
> 50/2003), no la evaluación de la UICN. Son dos ejes distintos, y mezclarlos fue el origen del
> problema. El esparto sigue como «No amenazada» porque legalmente no está protegido.

**Ámbito UE — 16 fichas.** De las 146 que no citaban ninguna Directiva, 16 tenían anexo comunitario
sin recoger. La de más peso es la **tortuga mora** (*Testudo graeca*): faltaban los **Anexos II y IV
de la Directiva Hábitats** y el anexo A de CITES, y el Anexo II es el que obliga a designar ZEC para
la especie, así que tiene consecuencias de gestión. También faltaba el Anexo I de la Directiva Aves
en el **águila perdicera** y en 7 aves más, y anexos IV/V en gato montés, eslizón ibérico, sapo
corredor y gineta. Se descartaron 6 fichas con categoría «Artículo I»: es la cobertura genérica de
la Directiva Aves a todas las aves silvestres, no una inclusión en anexo.

### Huecos que deja abiertos

- **16 fichas afirman una categoría UICN sin código en la pasarela** (azucena de mar, acebuche,
  albardín…). No implica que estén mal, pero no hay respaldo verificable.
- Quedan sin recorrer los ámbitos **autonómico de otras CCAA** e **Internacional** (Berna, Bonn,
  AEWA). No afectan al piloto, pero sí al rollout nacional.
- **Las 83 especies sin figura legal no están mal.** 74 son flora cuyo estado procede de la Lista
  Roja de la Flora Vascular Española 2008, que es evaluación científica y **no norma jurídica**, y
  por eso no aparece en esta vista.
- **Malpolon monspessulanus y Hemorrhois hippocrepis** figuran a la vez como LESRPE y en el
  Catálogo de Exóticas Invasoras (protegidas en la península, invasoras en Baleares). No es error;
  falta reflejar el matiz en la ficha.
- ~~Chova piquirroja con `conservationStatus: NE`~~ — **resuelto**: la UICN sí la evalúa y la
  clasifica **LC**. Corregido a `conservationStatus: "LC"` e `iucnGlobal: "LC (Preocupación
  menor)"`. El *assessment* es el **22705916**, dato que da la pasarela
  `v_listapatronespecie_codigos` del IEPNB en su campo «Código UICN» (junto al código Red Natura
  **A346**). Son 15 fichas corregidas, no 14.

### Aviso general sobre `iucnGlobal`

El caso de la chova apunta a un problema más amplio: **30 fichas tienen `iucnGlobal: "NE"`** y otras
40 usan variantes de «No evaluada específicamente en la Lista Roja mundial de la UICN». Muchas serán
falsos «no evaluada» como este, porque el dato se rellenó sin consultar la Red List. La pasarela
`v_listapatronespecie_codigos` devuelve el **«Código UICN»** de cada taxón, que es el identificador
del *assessment*: basta cruzarlo para saber cuáles sí están evaluadas y enlazar la ficha oficial.
Conviene un barrido específico, aparte del normativo.
