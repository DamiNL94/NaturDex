# Procedencia de cada campo

Esta es la tabla que hay que consultar antes de rellenar nada. **Columna «Fuente» = de dónde sale el
dato; «Cómo» = la herramienta o el criterio; «Verifica» = quién lo comprueba.**

### `parks` — el espacio protegido

| Campo | Fuente | Cómo | Verifica |
|---|---|---|---|
| `slug` | decisión propia | Sin tildes, minúsculas, guiones. **Es una clave: estable para siempre** | `validate` (coincide con el registro) |
| `name`, `category` | ENP (IEPNB/MITECO) | Figura oficial **literal** («Parque Regional», «Paisaje Protegido») | `validate` (avisa si difiere del registro) |
| `region`, `province`, `municipality` | ENP + límites municipales del CNIG | El municipio NO está en la capa ENP: sale de cruzar el centroide contra el CNIG | manual |
| `area_hectares` | ENP | La superficie **oficial la manda el MITECO** aunque el dibujo venga del geoportal autonómico | manual |
| `latitude`/`longitude` (`center`) | calculado | Centroide del límite | `validate` (dentro de la caja de España) |
| `description` (`summary`) | redacción propia — `data/descripciones-espacios.json` | **El único texto del pipeline que no sale de una fuente oficial.** 130–150 caracteres: es lo que se lee entero en el hueco de la cabecera. Qué paisaje es y qué se ve allí; cero adjetivos de folleto. Vive en ese fichero y no en el `park.json` para que **una regeneración con `n1:build` no pueda pisarlo** | revisión humana |
| `status` | proceso | `basic` → `available` al cerrar la Capa 3 | `validate` (rechaza valores desconocidos) |
| `boundaryNote` | proceso | **Obligatorio**: de qué servicio salió el límite y su código ENP | `validate` (campo exigido en N1) |

### `habitats` — Capa 2

| Campo | Fuente | Cómo | Verifica |
|---|---|---|---|
| `code` (HIC) | MITECO/BDN `Habi<NN>.dbf`, columna `CODIGO_UE` | Join `shapefile.CODIGO ↔ Habi<NN>.CODIGO` | `validate` (unicidad por parque) |
| `geometry` | MITECO/BDN, shapefile de recintos | `build-habitats.js`: reproyecta UTM→WGS84 y **recorta al límite** | `validate` (0 vértices fuera de España); el propio script informa de vértices fuera del límite, que debe ser **0** |
| `name`, `habitat_type` | `data/hic-nombres.json` | ⚠️ Un código **ausente de este fichero** no se queda solo sin nombre: **se salta el filtro marino** y entra un hábitat que no debería. Ver [trampas conocidas](../runbook/TRAMPAS-CONOCIDAS.md) | `adopt-habitats.js` avisa de los códigos sin ficha |
| `is_priority` | `data/hic-prioritarios.json` (Anexo I de la Directiva) | **NUNCA del flag `PRIORITARI`** del dato de 1997, que es poco fiable (marca 8210 como prioritario) | revisión contra el Anexo I |
| `fitosociologia` | `Habi<NN>.dbf`, columna `CONCEPTO` | Asociaciones oficiales, **literales**. Es lo que justifica reconciliar un código antiguo. Su lectura en llano vive aparte, en `data/contenido/fitosociologia.json`, y **no la modifica** | manual |
| `hic_subtipos` | `Habi<NN>.dbf` | Subtipos concretos presentes (5330 → `["5334"]`) | — |
| `description` | universal — `data/contenido/habitats.json` | Redacción propia sobre el Atlas de Hábitats y el Anexo I, **indexada por código HIC** y por tanto válida en cualquier parque de España. Se sincroniza con `npm run habitats:apply`. **Nunca puede nombrar un espacio concreto** | `validate` (**error** si nombra un parque o si dos parques discrepan) |
| `latitude`/`longitude` | calculado | Centroide. Solo para el círculo aproximado cuando no hay polígono | `validate` |
| `color` | decisión propia | Paleta del catálogo. La **trama** la pone el grupo (ver [la aplicación](APLICACION.md)) | — |
| `image`, `image_attribution`, `image_note` | Wikimedia Commons | `habitat-images.js`: un hábitat no es un taxón, así que se ilustra con su **especie diagnóstica** —la que el propio hábitat nombra— y se explica en `image_note` | `validate` (foto sin atribución = aviso) |
| `speciesIds` | derivado | Inverso de `species.habitatIds` | `validate` (simetría e integridad referencial) |
| `audio_url`, `audio_transcript` | producción propia | La transcripción es **obligatoria** (WCAG 1.2.1) | `validate` (**error** si falta) |

### `species` — Capa 3

| Campo | Ámbito | Fuente | Cómo |
|---|---|---|---|
| `scientific_name` | universal | **EIDOS** `v_taxonomia` | El **nombre aceptado**, no el sinónimo. `eidos.resolveTaxon()` lo resuelve |
| `eidos_taxonid` | local | EIDOS | **La clave maestra.** Es lo que permite reutilizar una ficha entre espacios sin duplicarla |
| `gbif_species_key` | local | GBIF `species/match` | ⚠️ Comprobar el **rango**: si no es SPECIES/SUBSPECIES, la clave es de género o familia y no identifica nada (el catálogo llegó a tener 3073 = Poaceae como «clave del esparto») |
| `common_name` | universal | EIDOS `v_nombrescomunes` (preferente en castellano) → Wikipedia | — |
| `kingdom`, `taxon_*` | universal | EIDOS `v_taxonomia` | `flora`/`fauna`/`fungi`/`other` + los seis rangos |
| `group` | universal | vocabulario **cerrado** | Había 79 valores distintos en un parque. `sync-species-catalog.js` traduce con `GRUPO_NORMALIZADO`. `group` dice solo *qué clase de ser vivo es*; la familia va en `taxonomy` y el ambiente en `habitat` |
| `iucn_global` | universal | EIDOS `v_estadoconservacion` (`aplicaa` = Mundial) → UICN Red List | Solo la fila **vigente más reciente** de cada ámbito |
| `spain_status` | universal | EIDOS `v_estadolegal` ámbito Nacional (CEEA/LESRPE) + Lista Roja de la Flora Vascular 2008 | La Lista Roja es evaluación científica, **no norma jurídica**: por eso muchas plantas no salen en `v_estadolegal` y eso no es un error |
| `murcia_status` | local | EIDOS `v_estadolegal` ámbito CCAA | ⚠️ **Nombre atado a Murcia. Es la deuda nº 1 del rollout: ver [DEUDA-TECNICA.md](../DEUDA-TECNICA.md)** |
| `conservation_status` | local | derivado | Etiqueta corta para la tarjeta. En flora refleja el estado **legal**, no la evaluación UICN: son dos ejes distintos y mezclarlos ya causó un problema |
| `description`, `tips`, `habitat`, `seasonality` | universal | **dos orígenes**: EIDOS (`v_atributos_pliniancore`) o redacción en `data/contenido/` | Prosa divulgativa. `tips` = tres rasgos que se ven en campo. **Nunca puede nombrar un espacio concreto.** Una ficha sin `description` no se muestra: `npm run especies:ocultar` le pone `visible: false` |
| `description_source` | universal | la cita de quien escribe el texto | **Obligatorio con toda `description` nueva.** Los dos orígenes de arriba se ven idénticos en la app y este campo es lo único que los distingue. `validate` cuenta como aviso las que no lo tienen (476 heredadas) |
| `hidden_reason` | local | proceso | Por qué la ficha está oculta. Distingue «sin texto que enseñar» de una decisión tomada a mano, para que un pase automático no pise la segunda |
| `image`, `image_attribution` | universal | Wikimedia (`wikimedia-images.js`) → GBIF (`enrich-images.js`) | URL canónica `Special:FilePath`, nunca un `/thumb/` (`validate` lo trata como **error**). Autor + licencia obligatorios |
| `rarity_score` | universal | **categoría legal estatal** (CEEA/LESRPE, RD 139/2011) vía EIDOS | Escalera 1–5: 5 en peligro de extinción · 4 vulnerable o sensible · 3 de interés especial · 2 LESRPE · 1 sin figura estatal. `rarity_basis` guarda la norma que justifica el tramo. **No interviene ninguna señal de abundancia**: es dato oficial directo y reproducible, no el número puesto a ojo que era antes. Cuenta también la Lista Roja / Libro Rojo, que son evaluación y no norma, por decisión explícita |
| `rarity_basis` | universal | la figura que justifica el tramo | Lo que impide que el número vuelva a ser una cifra sin procedencia. El tramo 1 **también** la lleva («Sin figura de protección»): «comprobado que no hay» y «nadie lo ha mirado» son estados distintos, y solo el segundo queda sin `rarity_basis` y avisado por `validate` |
| `rarity_local` | local | la categoría más grave de **los dos ámbitos**, estatal y autonómico | Lo excepcional que es encontrarla *en este espacio*. Es local porque el catálogo autonómico es territorial: la misma especie es Vulnerable en una comunidad y no figura en la de al lado. Medido en Sierra de la Pila, el tramo estatal solo deja **1** especie en ≥ 4 sobre 243 (el Estado casi solo dice «en régimen de protección especial», 74 veces) mientras que el local deja **10** — quien discrimina de verdad es el catálogo regional |
| `source` | local | proceso | La referencia concreta que respalda **la cita en este espacio** |
| `review_note` | local | proceso | La duda, escrita y visible en la app («a revisar»). Es el mecanismo de «hueco documentado» |
| `habitatIds` | local | derivado | Ver `species_habitats` abajo |
| `zepa_site_code` | local | IEPNB · Red Natura 2000 | (Procedimiento completo: [`Docs/runbook/AVES.md`](../runbook/AVES.md).) El sitio cuyo **formulario oficial declara** esta ave. Las aves **no se cuelgan de hábitats**: vuelan, y van a su apartado de espacio. Antes llevaba el código de la ZEPA con la que solapa el espacio —del `zepa.geojson`— a toda ave del catálogo, dijera lo que dijera cualquier lista oficial; con eso, la «colección de aves de la ZEPA» que el juego construye en `Frontend/Js/state.js` era «las aves que GBIF dejó pasar» |
| `is_visible` | local | criterio | `false` oculta del catálogo público sin borrar (pocas ocurrencias GBIF **y** sin figura oficial) |
| `coordinates` | local | representativa | La ubicación real la aporta el GPS al marcar la especie como vista |

### `species_habitats.evidence` — el vínculo derivado

| Valor | Fuente | Criterio |
|---|---|---|
| `caracteristica` | Atlas de Hábitats | La especie figura como característica de ese HIC **y** está en el catálogo del espacio. Backbone determinista y filtro de cordura del resto |
| `observada_gbif` | GBIF | Ocurrencia **dentro del polígono** (punto-en-polígono local, no bbox). `gbif_occurrences` guarda cuántas |
| `lista_oficial_sitio` | IEPNB · Red Natura 2000 | Lista oficial de especies del sitio (`site_code`): secciones 3.2 y 3.3 de su Formulario Normalizado de Datos, que trae `especies-sitio-rn2000.js`. Junto al anexo normativo, la única evidencia que afirma la pertenencia *a este sitio*, y por eso es la **puerta de entrada de las aves**. Sustituye al valor `zepa`, que nunca llegó a escribirse porque la fuente que lo iba a alimentar (EEA Discodata/BISE) no estaba cableada |
| `anexo_normativo` | PORN/PRUG, decreto de declaración o SDF del sitio | La norma del espacio la **enumera por escrito** en un anexo. Es la evidencia más fuerte de las cuatro: la única que afirma la pertenencia *a este espacio* y no a un polígono o a un tipo de hábitat. La lista se transcribe a mano en `Tools/catalogo-nacional/data/anexos-normativos.json`, con su cita y la fecha en que se leyó |

> **Un enlace se puede retirar después, y hay una herramienta que lo revisa.**
> `npm run especies:habitats` (`auditoria-especie-habitat.js`) coteja cada enlace ya escrito contra
> cuatro cosas que están en el repo —el **medio** que exige el código HIC frente al que declara la
> ficha universal de la especie (`Tools/lib/medios.js`), el **vuelo** del taxón, las **ocurrencias**
> del barrido versionado y el **Atlas**— y retira lo que ninguna de las cuatro sostiene. El estado de
> hoy, enlace a enlace, está en [`Docs/auditoria-especie-habitat.md`](../auditoria-especie-habitat.md).
> Lo que **no** hace es subir el listón: un enlace con una sola ocurrencia se conserva y se mide, y
> son el 40 % (deuda nº 22).

> **El anexo da evidencia, no entrada.** La constancia en GBIF sigue siendo la puerta del catálogo:
> lo que la norma enumera y el barrido no confirma dentro de ningún polígono **no se aprueba**, pero
> tampoco se pierde — sale en `anexo_sin_constancia` del informe de selección como hueco a contrastar
> en campo. El motivo es de cobertura: el Anexo I del PRUG de Sierra Espuña no inventaría especies,
> el PORN de Carrascoy tampoco y el de Sierra de la Pila no se pudo abrir. Con el anexo de puerta,
> esos espacios entrarían con cero especies y el de al lado con doscientas.

### Otras tablas

| Tabla | Fuente | Herramienta |
|---|---|---|
| `especies_invasoras` | Catálogo Español de EEI (RD 630/2013) vía EIDOS ∩ presencia GBIF por CCAA | `invasoras-eei.js`, `invasoras-contenido.js`, `invasoras-images.js` |
| `glosario` | redacción propia sobre glosarios oficiales y el Atlas | `glossary-coverage.js` **detecta** el vocabulario sin definir; la definición la escribe una persona |
| `user_*` | el propio usuario | Progreso, visitas verificadas, logros. Ver `Docs/PROGRESO-CUENTA-LOGROS.md` y `Docs/VERIFICACION-Y-ANTITRAMPAS.md` |
| `user_occurrences` | derivada de `user_progress` + `user_invasive_sightings` | La misma marca del usuario, escrita como **ocurrencia Darwin Core**. Sus columnas SON los términos, y de dónde sale cada uno está en [`Docs/DARWIN-CORE.md`](../DARWIN-CORE.md), término a término y con las URIs. Dos avisos que valen aquí: `species.kingdom` **no es** un reino taxonómico (es `flora`/`fauna` y se traduce a `Plantae`/`Animalia`), y `taxonRank` se deduce del nombre solo cuando el nombre lo dice sin ambigüedad |

### Fuentes: URLs y claves

| Fuente | Acceso | Claves y notas |
|---|---|---|
| **ENP** | IEPNB catálogo `408ec0c0-7823-5c91-9f72-8c06e3df8b9e` · WMS `wms.mapama.gob.es/sig/Biodiversidad/ENP/wms.aspx` | EPSG:4326. Capa nacional de referencia |
| **Red Natura 2000** | IEPNB catálogo `dc7a3014-cd9a-51b8-ad62-7aab55afecdd` | Da los códigos `ES…`, llave de la lista oficial de especies. Publicada a 31/12/N, su contenido es lo remitido a la Comisión hasta diciembre de N−1 |
| **Cartografía de Hábitats 92/43/CEE** | `miteco.gob.es/…/habitat_descargas_2.html` | Dos ficheros por provincia `NN`: `DirectivaHabitat<NN>_1997_*.zip` (polígonos) y `directivadatos_<NN>_*.zip` → `Habi<NN>.dbf` (atributos). Las URL llevan sufijos `_tcm30-NNNNNN` **no derivables**: están copiadas en `Tools/catalogo-nacional/fuentes/habitat-provincias.json` (las 50 provincias) |
| **Atlas y Manual de los Hábitats de España** | PDF en `Docs/` | Extraer con `pdftotext -layout` |
| **EIDOS** | `https://iepnb.gob.es/api/especie/` (PostgREST, **sin autenticación**) | `v_taxonomia` (`taxonid`), `v_estadoconservacion`, `v_estadolegal`, `v_nombrescomunes`, `v_atributos_pliniancore`. Lista Patrón en `/api/catalogo/` |
| **GBIF** | `https://api.gbif.org/v1/` | `occurrence/search` (paginar a 300), `species/match` |
| **Red Natura 2000 (IEPNB)** | `https://iepnb.gob.es/api/rn2000/` (PostgREST, **sin autenticación**) | `v_cntr_site`, `v_cntr_species` (sección 3.2 del Formulario Normalizado de Datos) y `v_cntr_other_species` (sección 3.3). Mismo host que EIDOS. **No se usa EEA Discodata/BISE**: publica el mismo dato reexportado y su host está fuera de la política de egreso (403 al CONNECT) |
| **Geoportal IMIDA/CARM** | `geoportal.imida.es/…/PROYECTOS/OISMA/MapServer` | Delimitación con 2–15× más vértices que la capa nacional |

