# Los avistamientos en Darwin Core

Qué término sale de dónde, qué se generaliza y por qué, cómo se exporta y qué falta para que el
conjunto sea publicable en GBIF.

> **El aviso que acompaña a todo esto** (regla 7 del [`CLAUDE.md`](../CLAUDE.md)): este catálogo es
> recopilación sobre fuentes públicas, **no un inventario validado en campo**. Un registro de un
> usuario es una **observación ciudadana sin validar por un experto**, y así sale etiquetado en
> `identificationVerificationStatus`. No se presenta como dato oficial en ningún sitio.

---

## 1. Por qué el esquema canónico es Darwin Core

Antes, un avistamiento vivía dentro de `user_progress.payload`, un JSON en una columna `TEXT`,
indexado por el `species_id` **de ese parque**:

```json
{ "sightings": { "412": { "lat": 37.85, "lng": -1.55, "at": "2026-05-10T09:20:00+00:00" } } }
```

Eso sirve para pintar la app y no sirve para nada más: no se puede consultar, una especie solo admite
un avistamiento por espacio, y le faltan justo las piezas que hacen publicable una cita —identificador
estable, hora con huso, **incertidumbre de la coordenada**, taxonomía con identificadores y estado de
verificación—. La incertidumbre, además, se estaba recibiendo en `presence.php` y **tirando**.

Traducir a Darwin Core el día que alguien lo pidiera no habría arreglado nada: la traducción descubre
entonces lo que nunca se guardó. Por eso las **columnas de `user_occurrences` son los términos**:
`event_date` es `dwc:eventDate` y `decimal_latitude` es `dwc:decimalLatitude`.

`user_progress` **se queda como está**: es lo que la app lee y lo que hace que el progreso sea
local-first. La tabla nueva se deriva de ella.

```
marca del usuario ──▶ user_progress.payload      (lo que la app lee · local-first)
        │
        └──────────▶ user_occurrences            (la capa científica · Darwin Core)
                          │
                          └──▶ Tools/export-dwc.php ──▶ occurrence.txt + meta.xml + eml.xml
```

## 2. Dónde está cada cosa

| Fichero | Qué es |
|---|---|
| [`Database/schema.sql`](../Database/schema.sql) | La tabla `user_occurrences`, con el comentario de cada columna |
| [`Database/migrations.sql`](../Database/migrations.sql) | La misma tabla + el **volcado idempotente** de lo que ya había |
| [`Backend/Lib/dwc.php`](../Backend/Lib/dwc.php) | **El vocabulario**: columna ↔ término ↔ URI, identificadores, sensibilidad. Puro, sin BD |
| [`Backend/Lib/occurrences.php`](../Backend/Lib/occurrences.php) | La escritura y la lectura de la tabla |
| [`Tools/export-dwc.php`](../Tools/export-dwc.php) | El Darwin Core Archive (`npm run export:dwc`) |
| [`Tools/test-dwc-rules.php`](../Tools/test-dwc-rules.php) | Las reglas puras, comprobadas sin BD (`npm test`) |

---

## 3. De dónde sale cada término

Solo se publica lo que está en esta tabla: el diccionario de
[`dwc.php::dwcTerms()`](../Backend/Lib/dwc.php) es la **única** declaración, y de ahí salen la
cabecera del TSV, el `meta.xml` y esta misma tabla. Una columna que no esté ahí no se publica, y eso
es lo correcto: publicar algo exige decidir qué término es.

Todas las URIs cuelgan de `http://rs.tdwg.org/dwc/terms/` salvo las cuatro marcadas `dc:`, que son de
`http://purl.org/dc/terms/`.

### Registro

| Término | Columna | De dónde sale |
|---|---|---|
| `occurrenceID` | `occurrence_id` | **UUID v4** generado con `random_bytes`, publicado como `urn:uuid:…`. Nunca un autoincremento: revelaría el tamaño del conjunto y dejaría de ser único al fusionarlo con otro proveedor |
| `basisOfRecord` | `basis_of_record` | Constante `HumanObservation` |
| `occurrenceStatus` | `occurrence_status` | Constante `present` |
| `individualCount` | `individual_count` | **Vacío siempre**: la app no pregunta cuántos ejemplares se vieron, y escribir `1` sería afirmar algo que nadie ha dicho |
| `occurrenceRemarks` | `occurrence_remarks` | Los huecos, dichos: «no consta la precisión del GPS», «cita sin georreferenciar» |
| `recordedBy` | `recorded_by` | `users.display_name`, o «Observador/a de NaturDex» si no lo puso. **Nunca el correo** |
| `recordedByID` | `recorded_by_id` | `urn:naturdex:observador:<id>` — identificador opaco |
| `modified` (dc:) | `modified` | Fecha UTC del último refresco de la fila |

### Evento

| Término | Columna | De dónde sale |
|---|---|---|
| `eventID` | `event_id` | **La visita verificada** (`user_park_visits.id`), como `urn:naturdex:visita:<id>`. Es lo que hace que la ocurrencia herede la trazabilidad de calidad de la visita: cuántos fixes, cuánto duró, qué precisión alcanzó. Vacío = no consta presencia verificada |
| `eventDate` | `event_date` | La hora de marcado que selló el servidor (`user_progress.markedAt`), en UTC e ISO 8601 con huso |
| `eventTime` | *(derivado)* | El mismo instante que `eventDate`. **No es columna**: guardarlo aparte sería guardar dos veces el mismo dato, con la única consecuencia posible de que algún día discrepen |
| `samplingProtocol` | `sampling_protocol` | Constante: observación oportunista con app móvil y verificación de presencia por GPS |

### Lugar

| Término | Columna | De dónde sale |
|---|---|---|
| `decimalLatitude` / `decimalLongitude` | `decimal_latitude` / `decimal_longitude` | El GPS del dispositivo al marcar. **Se generalizan al exportar** si el taxón está amenazado (§5) |
| `geodeticDatum` | `geodetic_datum` | Constante `WGS84` |
| `coordinateUncertaintyInMeters` | `coordinate_uncertainty_in_meters` | **El `accuracy` del GPS de ese momento.** Es la pieza que antes se recibía y se tiraba; sin ella un registro es inservible para casi cualquier análisis |
| `georeferenceProtocol` | `georeference_protocol` | Constante: GPS del dispositivo en el momento de marcar |
| `countryCode` | `country_code` | Constante `ES` |
| `stateProvince` | `state_province` | `parks.region` (la CCAA); en invasoras, `especies_invasoras.ccaa` |
| `county` | `county` | `parks.province` |
| `locality` | `locality` | `parks.name` |
| `locationID` | `location_id` | `urn:naturdex:espacio:<slug>`. **Falta el código Natura 2000** — ver §7 |

### Taxón

La taxonomía se **copia** en la fila, no se referencia: una cita publicada no puede cambiar de especie
porque alguien reconcilie el catálogo tres años después.

| Término | Columna | De dónde sale |
|---|---|---|
| `scientificName` | `scientific_name` | `species.scientific_name` — el nombre aceptado de EIDOS |
| `taxonRank` | `taxon_rank` | **Deducido del propio nombre** (`dwcTaxonRank`) y solo cuando el nombre lo dice sin ambigüedad: un binomio limpio es `species`, un nombre con `subsp.`/`var.` lo declara él. Cualquier otra forma se queda **vacía**: el catálogo no guarda el rango y adivinarlo sería rellenarlo a ojo |
| `kingdom` | `kingdom` | ⚠️ **`species.kingdom` NO es un reino.** Es una agrupación de la interfaz (`flora`/`fauna`/`fungi`/`other`). Se traduce a `Plantae`/`Animalia`/`Fungi`; `other` se queda **vacío**, porque no se sabe qué reino es |
| `phylum`, `class`, `order`, `family`, `genus` | ídem | `species.taxon_*`, con caída a `species.family` |
| `vernacularName` | `vernacular_name` | `species.common_name` |
| `taxonID` | `taxon_id` | `species.eidos_taxonid` — **la clave maestra** del proyecto (EIDOS/IEPNB) |
| `scientificNameID` | `scientific_name_id` | **Vacío**: no tenemos identificador nomenclatural (IPNI, Index Fungorum). Hueco documentado, no inventado |
| `taxonConceptID` | `taxon_concept_id` | `https://www.gbif.org/species/<gbif_species_key>` |

### Calidad de la identificación

| Término | Columna | De dónde sale |
|---|---|---|
| `identificationVerificationStatus` | `identification_verification_status` | Uno de **dos** textos, y los dos empiezan diciendo «Observación ciudadana sin validar por experto». El resto dice si consta que la persona estaba dentro del límite oficial: «presencia en el espacio verificada por GPS» o «no verificada» |
| `identifiedBy` | `identified_by` | El mismo observador: quien marcó, identificó |
| `dateIdentified` | `date_identified` | El mismo instante que `eventDate` |

`event_id` y `identificationVerificationStatus` son **la misma afirmación dicha de dos formas** y solo
se escriben juntos: en el alta y en `occurrencesRefreshVerification()`. Ese reenganche no es el caso
raro sino el normal: una visita necesita varios fixes repartidos en cinco minutos para verificarse, y
lo primero que hace la gente al llegar es marcar.

### Derechos y sensibilidad

| Término | Columna | De dónde sale |
|---|---|---|
| `license` (dc:) | `license` | CC BY 4.0. GBIF solo admite CC0, CC BY o CC BY-NC; CC BY exige la cita, igual que ya hace el catálogo con sus fotos |
| `rightsHolder` (dc:) | `rights_holder` | El observador |
| `institutionCode` | `institution_code` | `NaturDex` |
| `datasetName` / `datasetID` | ídem | Constantes del conjunto |
| `informationWithheld` / `dataGeneralizations` | ídem | **Se rellenan al exportar**, no al guardar (§5) |

---

## 4. La migración de lo que ya había

Está en `Database/migrations.sql`, en dos volcados, y **es idempotente**: la clave única
`(user_id, source_key)` hace que un segundo pase encuentre la fila y no cambie un byte, ni siquiera el
`occurrence_id` —que es justo lo que hay que conservar, porque es el identificador publicado—.

- **Volcado 1 · especies**, desde `user_progress.payload.sightings`, recorrido con `JSON_TABLE` sobre
  `JSON_KEYS` y cruzado con `species` (taxonomía), `parks` (lugar) y `user_park_visits` (verificación).
- **Volcado 2 · invasoras**, desde `user_invasive_sightings`.

**Qué NO se vuelca, y por qué.** Solo las entradas de `sightings`, es decir, las que tienen
coordenada. Un «visto» sin coordenada (marcado sin permiso de GPS) sigue siendo una marca de colección
del usuario, pero **no es una cita**: no dice dónde ocurrió nada. Se queda en `user_progress`, que es
donde le sirve, y no se pierde.

Las citas de invasoras del histórico **sí** se vuelcan aunque no tengan coordenada —la tabla nunca la
guardó—, con el hueco dicho en `occurrenceRemarks` en lugar de disimulado. Desde ahora se captura.

> Antes de aplicar la migración: `npm run db:backup`. Toca datos de usuario.

---

## 5. Sensibilidad: qué coordenadas no se publican tal cual

Publicar la posición exacta de un ejemplar de una especie en peligro es una forma conocida de facilitar
su expolio, y es un daño que **no se puede deshacer**. La práctica estándar de los bancos de
biodiversidad es generalizar la coordenada del taxón amenazado y decirlo en el propio registro.

| Tramo de rareza legal | Qué se publica | `coordinateUncertaintyInMeters` |
|---|---|---|
| **5** · en peligro de extinción · extinguida | coordenada redondeada a 0,1° (~10 km) | ≥ 10 000 |
| **4** · vulnerable · sensible a la alteración de su hábitat | coordenada redondeada a 0,01° (~1 km) | ≥ 1 000 |
| 3, 2, 1 | coordenada exacta | la del GPS |
| **sin tramo calculado** | redondeada a ~1 km, **por precaución** | ≥ 1 000 |

Tres cosas que conviene tener claras:

1. **El dato fino no se toca.** Lo que se generaliza es la **exportación**; en la base sigue estando
   la coordenada del GPS, y en la copia personal del usuario (`account.php?action=export`) también:
   la generalización protege al taxón frente al público, no al titular frente a sus propios datos.
2. **El criterio no se reescribe.** Sale del tramo ya calculado (`species.rarity_local`, y si falta,
   `rarity_score`), que es la salida de la única escalera del repositorio,
   [`Tools/lib/rareza.js`](../Tools/lib/rareza.js), que la deriva de `spainStatus` y del catálogo
   autonómico. Portar esa escalera a PHP habría creado la segunda copia de un criterio, que es
   exactamente el fallo que este repo ya conoce.
3. **«Nadie lo ha mirado» no es «no está amenazada».** Un taxón sin tramo se generaliza igual, y el
   exportador dice cuántos registros salen así, para que el hueco se vea.

**Las exóticas invasoras nunca se generalizan.** No hay ejemplar que proteger, y su localización
precisa es, de todo lo que recoge la app, lo que más valor tiene para una administración.

## 6. Consentimiento

Los datos llevan nombre de observador, así que publicarlos es una **cesión de datos personales**, y
una cesión no se presume: se pide.

- En «Perfil y ajustes» → **Compartir con la ciencia** hay un interruptor explícito, **apagado por
  defecto**, con el texto en llano y el aviso de que las especies amenazadas nunca salen con su
  posición exacta.
- Se guarda como la preferencia `shareOccurrences` (`prefs.js` + su espejo en `users.prefs` vía
  `account.php?action=prefs`).
- **El exportador lo lee del servidor**, no de lo que traiga una petición, y una preferencia ausente
  cuenta como **no**.
- `--sin-consentimiento` existe solo para la copia personal de quien pide sus datos, y el script se
  **niega a ejecutarlo** si no se acota con `--usuario`.

**No se guarda la traza del paseo**, y eso sigue igual (`presence.js` y `user_park_visits`): la
ocurrencia es un punto, no un recorrido.

---

## 7. Exportar

```bash
npm run export:dwc                                    # conjunto completo (solo quien dio permiso)
php Tools/export-dwc.php --usuario 12                 # un usuario, por id o por correo
php Tools/export-dwc.php --usuario 12 --sin-consentimiento   # su copia personal
php Tools/export-dwc.php --salida /ruta --zip         # dónde escribir y empaquetar
```

Produce las tres piezas de un Darwin Core Archive:

- **`occurrence.txt`** — TSV en UTF-8 sin BOM, saltos `\n`, sin comillas de campo. Los tabuladores y
  saltos que hubiera dentro de un texto se sustituyen por un espacio: el formato no define escape, y
  un salto dentro de un campo parte la fila y corrompe el fichero en silencio.
- **`meta.xml`** — el mapeo de cada columna a la URI de su término, con `occurrenceID` como `<id>`.
  Sin esto el fichero de datos es un TSV cualquiera: es este descriptor lo que lo hace Darwin Core.
- **`eml.xml`** — metadatos del conjunto (perfil EML de GBIF): título, licencia, cobertura,
  metodología y —esto es lo importante— **qué es**: observación ciudadana sin validar.

El script comprueba además la coherencia interna: identificadores repetidos, filas sin
`scientificName` o sin `eventDate`, coordenadas fuera de rango y número de columnas distinto del de la
cabecera.

### Lo que falta para publicar en GBIF

Escrito aquí porque es un **hueco documentado**, no un pendiente olvidado:

1. **Pasar el archivo por el [GBIF Data Validator](https://www.gbif.org/tools/data-validator).**
   La coherencia interna que comprueba el script **no es** una validación de GBIF. Está pendiente:
   requiere un archivo generado sobre datos reales y una cuenta de GBIF. Cuando se haga, el informe va
   en este documento.
2. **`locationID` sin código Natura 2000.** La tabla `parks` no guarda los códigos ES… (viven en el
   `park.json` empaquetado), así que el identificador de lugar es solo el slug. Con el código, un
   receptor podría cruzar la cita con la Red Natura directamente.
3. **`scientificNameID` vacío**: falta el identificador nomenclatural (IPNI / Index Fungorum).
4. **Registro del conjunto**: publicar en GBIF exige un endpoint estable y un `datasetID` registrado
   en GBIF.ES. `urn:naturdex:dataset:avistamientos-ciudadanos` es provisional.

---

## 8. Dos trampas de esta zona

- **La verificación se decide después de marcar.** Registrar la ocurrencia y no volver a mirarla
  dejaría casi todo etiquetado como presencia no verificada, porque una visita tarda minutos en
  cuajar. Por eso `presence.php` llama a `occurrencesRefreshVerification()` cuando una visita se
  verifica.
- **`migrations.sql` necesita `SET NAMES utf8mb4`.** Sin esa línea, cualquier texto con tilde que la
  migración inserte se guarda doblemente codificado y nadie se entera hasta que alguien lo lee. Se
  detectó justamente probando este volcado.
