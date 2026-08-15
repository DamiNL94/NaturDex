# Rollout nacional de NaturDex — prompts de trabajo

> **Qué es este documento.** El juego de prompts para extender la base de datos de NaturDex desde
> el piloto (Cabo Cope y Puntas de Calnegre) a **todo el territorio natural protegido de España**:
> parques nacionales, naturales y regionales, reservas, monumentos naturales y paisajes protegidos.
>
> No es documentación técnica —eso ya está en `Tools/catalogo-nacional/README.md`— sino el
> **guion operativo**: qué se pega en cada sesión, en qué orden y cuándo se da un territorio por
> terminado.

---

## 0. Las tres decisiones que estructuran el trabajo

**a) Tres niveles de dato, no uno.** Hacer cada espacio completo antes de pasar al siguiente deja el
mapa de España vacío durante años. Se separa en:

| Nivel | `status` | Contenido | Coste | Fuente |
|---|---|---|---|---|
| **N1 · Ficha base** | `basic` | Límite oficial, códigos Natura 2000, figura de protección, superficie, municipios, `summary`. Sin especies ni hábitats. | Lote automático, decenas de espacios por sesión | Una sola descarga nacional (ENP + Red Natura del IEPNB) |
| **N2 · Completo** | `available` | Hábitats HIC recortados, catálogo de especies con evidencia, fotos, audioguías | 1 espacio por sesión larga | Pipeline de 3 capas del README |
| **N3 · Puntos de interés** | `available` | La capa de POIs del piloto: qué hay que ver ahí y por qué, con su fuente, su coordenada y su foto | 1 espacio por sesión corta, encadenable | Cascada documental del §4 (PORN/PRUG, IELIG, BIC, OSM) |

Todo espacio nace en N1 y asciende cuando le toca. El usuario ve el mapa nacional poblado desde el
primer día, con la honestidad de "ficha base / catálogo en preparación".

> **Por qué los POIs son un nivel y no un paso más de N2.** Estaban dentro de N2 y eso obligaba a
> elegir entre dejar el espacio sin cerrar o cerrarlo con un hueco. Se cerró con hueco las dos veces:
> Sierra Espuña y Cuatro Calas están en N2 con **0 POIs** y la misma nota en el ledger —no hay fuente
> con coordenadas descargables—, mientras que el piloto tiene **15** porque el Anexo I de su PORN
> enumera uno por uno los valores geológicos y paleontológicos del parque. La capa de POIs no depende
> del tamaño ni del interés del espacio, sino de si alguien publicó la lista, así que avanza a su
> propio ritmo y se registra aparte.
>
> **N3 no añade un `status` nuevo.** Un espacio en N3 sigue siendo `available`: los POIs son contenido
> opcional que el frontend ya sabe no dibujar cuando el array viene vacío. No hace falta ninguna
> Fase 0 para habilitarlo; el nivel vive en el ledger, no en el código.

**b) Recorrido por comunidad autónoma, no por figura.** La cartografía de hábitats del MITECO se
descarga **por provincia** (`DirectivaHabitat<NN>` + `Habi<NN>.dbf`) y el huso UTM es propio de cada
zona. Saltar de provincia en provincia obliga a rehacer descargas y reconfigurar el pipeline; barrer
una comunidad entera amortiza cada descarga entre todos sus espacios.

**c) Las especies son nacionales, no del parque.** Una *Aquila fasciata* de Murcia y una de Cádiz
son la misma ficha. La clave maestra es `eidos_taxonid` (y `gbifSpeciesKey` como respaldo). Al
procesar el parque N, buena parte de su catálogo ya existe: se **reutiliza y se enlaza**, no se
reescribe. Sin esto, al décimo parque hay diez fichas del mismo águila con textos divergentes.

---

## 1. Fase 0 — habilitar el nivel N1 (una sola vez, antes de nada)

El código actual solo entiende `available` y `planned`. Pega esto una vez:

```
Voy a extender NaturDex a todo el territorio protegido de España con dos niveles de dato:
N1 "ficha base" (límite + Natura 2000 + datos administrativos, sin especies) y N2 "completo"
(el pipeline actual del piloto). Antes de cargar ningún territorio, prepara el código para
soportar N1. Lee primero Frontend/Data/parks/README.md, Tools/validate-park-data.js,
Frontend/Js/auth.js y Backend/Api/parks.php.

Cambios:

1. parks-index.json: nuevo valor de `status` = "basic" (además de "available" y "planned").
   Documenta los tres en el `_comment` del registro.
2. auth.js: los parques "basic" son SELECCIONABLES (hoy solo lo son los "available"). En el
   selector se etiquetan "(ficha base)" y los "planned" siguen deshabilitados.
3. El frontend, al abrir un parque "basic", muestra el mapa con su límite y capas Natura 2000
   y, en lugar del catálogo, un aviso claro: "Catálogo de especies y hábitats en preparación
   para este espacio". Nada de secciones vacías ni contadores a cero sin explicación.
4. validate-park-data.js: valida también los "basic", con reglas relajadas — se exige park.json
   con bloque `park` completo y geo/parque.geojson válido; NO se exige habitats, species, POIs
   ni imágenes. Los contadores del manifiesto deben cuadrar igual (a cero si están a cero).
5. Añade `npm run validate` al hook de pre-commit si aún no está.

No cargues datos de ningún territorio todavía. Al terminar, ejecuta `npm run validate` y
enséñame el diff.
```

---

## 2. Fase 1 — sembrar N1 de una comunidad entera

Un lote por comunidad. Se descarga **una vez** el ENP nacional y se filtra por comunidad.

```
NaturDex · rollout nacional · FASE 1 (fichas base N1)
Comunidad: <COMUNIDAD>

Contexto obligatorio antes de empezar: Tools/catalogo-nacional/README.md (§2 Capa 1),
Frontend/Data/parks/README.md y Docs/prompts/e-rollout-nacional.md.

Objetivo: dar de alta en NaturDex TODOS los espacios naturales protegidos de <COMUNIDAD>
con status "basic" — parques nacionales, naturales y regionales, reservas naturales,
monumentos naturales y paisajes protegidos.

Procedimiento:

1. INVENTARIO. Descarga la capa ENP (Espacios Naturales Protegidos) del IEPNB
   (catálogo 408ec0c0-7823-5c91-9f72-8c06e3df8b9e, EPSG:4326) y filtra por <COMUNIDAD>.
   Cruza con la Red Natura 2000 (catálogo dc7a3014-cd9a-51b8-ad62-7aab55afecdd) para obtener
   los códigos de sitio LIC/ZEC y ZEPA que solapan cada espacio.
   Preséntame la lista ANTES de escribir nada: nombre oficial, figura, provincia(s),
   municipios, superficie (ha), código ENP, códigos Natura 2000. Si un espacio ya existe en
   parks-index.json, márcalo y NO lo toques.

2. ESPERA MI VISTO BUENO de la lista (puede haber espacios que quiera excluir o renombrar).

3. ALTA POR ESPACIO. Para cada uno aprobado, con la MISMA estructura que
   Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/:
   - Frontend/Data/parks/<provincia-slug>/<espacio-slug>/park.json — solo el bloque `park`
     (slug, name, category = figura oficial literal, region, province, municipalities,
     center, summary, boundaryNote con la fuente y el código ENP) y `habitats`, `species`,
     `pointsOfInterest` como arrays vacíos.
   - geo/parque.geojson (límite oficial, WGS84), geo/lic.geojson y geo/zepa.geojson si los hay.
   - manifest.json con counts a cero y las rutas de geo.
   - Entrada en parks-index.json con status "basic", dentro de su comunidad y provincia.

   `summary`: 2-3 frases, descriptivas y verificables (relieve, ecosistema dominante, rasgo
   singular). Cero adjetivos de folleto turístico. Si no tienes fuente para una frase, no la
   escribas.

4. REGLAS DURAS.
   - No inventes NADA: ni especies, ni hábitats, ni POIs, ni superficies, ni límites
     aproximados. Si un dato no está en la fuente oficial, se queda fuera y me lo dices.
   - Todo `park.json` lleva la procedencia en `boundaryNote`.
   - Slugs sin tildes, en minúsculas y con guiones, estables para siempre (son claves).

5. CIERRE. `npm run validate` en verde, actualiza el ledger de progreso
   (Docs/rollout/ESTADO.md, ver §6) y resúmeme: espacios dados de alta, descartados y por qué,
   y cuáles recomiendas priorizar a N2.
```

---

## 3. Fase 2 — ascender un espacio a N2 (completo)

Una sesión por espacio. Es el pipeline del piloto, parametrizado.

```
NaturDex · rollout nacional · FASE 2 (catálogo completo N2)
Espacio: <NOMBRE> (slug <SLUG>, provincia <PROVINCIA>)

Contexto obligatorio: Tools/catalogo-nacional/README.md — arquitectura de 3 capas y
§4 "Procedimiento por parque". El piloto verificado es cabo-cope-puntas-calnegre: úsalo como
referencia de formato en cada paso. Este espacio ya está en N1 ("basic"), así que su límite y
sus códigos Natura 2000 ya existen; NO los rehagas.

Antes de descargar nada, confírmame estos parámetros y para si alguno no cuadra:
  - REGION_NN (código INE de provincia, para los ficheros del MITECO)
  - Huso UTM: NO lo asumas. Léelo del .prj del shapefile descargado y dímelo.
  - SITE_CODES (ES… de LIC/ZEC y ZEPA) leídos de los geojson que ya tenemos
  - Ruta del límite en WGS84

CAPA 2 · Hábitats
  1. Descarga de MITECO DirectivaHabitat<NN>_1997_*.zip y directivadatos_<NN>_*.zip (Habi<NN>.dbf).
  2. node Tools/catalogo-nacional/build-habitats.js --park <SLUG> --shp <ruta>.shp
     --habi Habi<NN>.dbf --zone <HUSO>
  3. Revisa la salida ANTES de fusionar: nº de recintos recortados, vértices fuera del límite
     (debe ser 0), recintos sin HIC descartados, códigos antiguos a reconciliar (el caso
     8230→8210 del piloto: reconcilia solo si la asociación fitosociológica lo justifica, y
     dímelo antes).
  4. merge-habitats.js para producir el habitats.geojson del espacio. La prioridad (Anexo I)
     sale de data/hic-prioritarios.json, NUNCA del flag PRIORITARI del dato de 1997.
  5. Si aparecen códigos HIC nuevos, amplía data/hic-nombres.json y data/hic-prioritarios.json
     con su nombre y tipo oficiales.

CAPA 3 · Especies — el orden importa, de más sólido a más ruidoso
  1. REUTILIZACIÓN PRIMERO. Antes de dar de alta ninguna especie, cruza contra el catálogo que
     ya tenemos por `eidosTaxonId` (y `gbifSpeciesKey`). Las que ya existan se ENLAZAN a este
     espacio; no se duplican ni se reescriben sus textos. Dime cuántas reutilizas y cuántas
     son nuevas.
  2. Atlas de Hábitats → especies características por HIC (atlas-hic-especies.js) =
     evidencia 'caracteristica'. Es el backbone determinista y el filtro de cordura del resto.
  3. EIDOS (IEPNB) como fuente principal de taxonomía y estado de conservación; UICN como
     fallback donde EIDOS no cubra (típicamente flora).
  4. GBIF ∩ polígonos de hábitat, SIN Aves = evidencia 'observada_gbif'.
  5. AVES: no se asignan a hábitats. Van al apartado de parque (migratorias/ZEPA), contrastadas
     con la lista oficial de la ZEPA vía Discodata BISE por SITE_CODE = evidencia 'zepa'.
  6. Cada especie sale con: taxonomía completa, estado en las tres escalas (UICN / España /
     comunidad autónoma — usa el catálogo regional de especies amenazadas que corresponda a
     <COMUNIDAD>, no el Decreto 50/2003 de Murcia), `source` con la referencia concreta y su
     `evidence`.

Fotos y cierre
  7. POIs NO: son el nivel N3 y tienen su propia sesión (§4). Deja `pointsOfInterest` como está.
     Si al trabajar las capas 2 y 3 te tropiezas con una fuente que enumera valores del espacio
     (un anexo del PORN, un inventario de LIG), NO la desarrolles: anótala en el informe de cierre
     como punto de partida para el N3 y sigue.
  8. enrich-images.js --mode missing --allow-nc para las fotos, con atribución y licencia.
     Nada de "todos los derechos reservados".
  9. Actualiza manifest.json (counts, images, audio), cambia el status a "available" en
     parks-index.json, ejecuta `npm run validate` hasta verde y carga la BD si procede
     (mismo modelo de Database/schema.sql, su propio park_id).
 10. Actualiza Docs/rollout/ESTADO.md y dame el informe de cierre: contadores, cobertura de
     fotos, especies sin hábitat, huecos conocidos y qué habría que contrastar en campo.

Regla que manda sobre todas: ante la duda, hueco documentado antes que dato inventado.
```

---

## 4. Fase 3 — ascender un espacio a N3 (puntos de interés)

Una sesión por espacio, más corta que la de N2 y encadenable con ella. Produce la capa que hoy solo
tiene el piloto: **qué hay que ver dentro del parque y por qué**.

### 4.1 Qué es un POI aquí (el patrón de Cabo Cope)

El piloto sirve de definición por extensión. Sus 15 puntos son sitios **concretos, situados y
visitables a pie**, cada uno con un hecho comprobable detrás y su fuente escrita en el campo
`source`: un cabo catalogado como Lugar de Interés Geológico, unas dunas fósiles del Eutirreniense,
una torre vigía del XVI declarada BIC, la ermita que daba servicio a su guarnición, los yacimientos
paleontológicos de la Cuenca de Cope, el núcleo costero que hace de puerta de entrada, la playa con
el mejor tarayal del litoral murciano.

Lo que **no** es un POI, y conviene tenerlo claro antes de empezar a buscar:

- **No es un hábitat.** Si lo que se quiere contar de un sitio es su vegetación, eso ya está en la
  Capa 2 y tiene su propio polígono. La Playa del Charco entra como POI porque el PORN la cita por
  su tarayal *concreto*, no porque allí haya 92D0.
- **No es un sendero.** Una traza lineal va a `geo/trails.geojson` (`build-park-trails.js`). El
  *inicio* señalizado de un sendero sí puede ser un POI de tipo `Acceso`.
- **No es un topónimo suelto.** Un nombre en el mapa sin ningún hecho que contar es ruido: llena el
  mapa de chinchetas y no aporta nada que el usuario no viera ya.

**Vocabulario cerrado de `type`** — los ocho que `Frontend/Js/util.js` sabe dibujar: `Cultural` 🏰,
`Paisajístico` 🏞️, `Geológico` 🌋, `Acceso` 🚪, `Natural` 🌊, `Arqueológico` 🏺, `Paleontológico` 🦖,
`Religioso` ⛪. Un tipo fuera de esa lista no rompe nada pero sale con la estrella genérica ⭐; si
hace falta uno nuevo, se añade primero el icono.

### 4.2 El mecanismo de búsqueda — cascada de fuentes

De más a menos autoridad. **El hecho y el nombre bajan por la cascada; la coordenada sube por
ella**: se prefiere siempre la coordenada más precisa disponible, aunque venga de una fuente de
menos rango que la que sostiene el hecho.

| # | Fuente | Qué aporta | ¿Trae coordenada? | Alimenta |
|---|---|---|---|---|
| 1 | **PORN / PRUG del espacio** (anexos de valores, documento previo, memoria informativa) | La lista *autorizada* de lo que el propio plan considera valioso | Casi nunca: nombra el paraje | Geológico, Paleontológico, Paisajístico, Natural |
| 1b | **Zonificación del PORN/PRUG en el geoportal del IMIDA** (capas 31-39 de `PROYECTOS/OISMA`, solo Murcia) | Las zonas del plan con su categoría y su nombre oficial, y **con polígono** | **Sí**, pero de la zona, no del elemento | Sitúa dónde el plan manda a la gente (uso público) y dónde no |
| 2 | **IELIG** — Inventario Español de Lugares de Interés Geológico (IGME) | LIG con código, nombre oficial e interés declarado (geomorfológico, estratigráfico, neotectónico…) | **Sí** | Geológico, Paleontológico |
| 3 | **BIC y patrimonio** — ver el recuadro de abajo: **el boletín oficial primero**, y el catálogo de datos abiertos de la comunidad para localizar la norma | Torres, ermitas, castillos, aldeas, con su declaración | A veces solo el municipio | Cultural, Religioso, Arqueológico |
| 4 | **OpenStreetMap vía Overpass** (ODbL) | Topónimos y accesos, con la posición real del nodo | **Sí, exacta** | Los ocho tipos |
| 5 | **Portal del organismo gestor / Wikipedia** | Contexto para redactar la descripción | No | — |
| 6 | **Wikimedia Commons · `Frontend/Img/poi/`** | La foto, con autor y licencia | — | — |

> **La vía 3, por dónde se entra de verdad.** Es la que más se ha dado por «bloqueada» sin haberla
> buscado bien, así que va escrita:
>
> 1. **El boletín oficial es la fuente primaria.** Un bien es BIC **porque una norma lo declara**, y
>    esa norma se publica en el boletín (BORM, BOE…). El registro es un índice *secundario* de lo que
>    el boletín ya publicó, así que para el `source` de un POI la norma es **mejor** cita que el
>    registro. `www.borm.es` está abierto: `/services/anuncio/ano/AAAA/numero/NNNN/pdf`, sin captcha.
> 2. **Para localizar la norma**, el catálogo de datos abiertos: `datos.gob.es` tiene API en
>    `/apidata/` y ahí están indexados los ficheros de patrimonio de cada comunidad. En Murcia,
>    «Monumentos en la Región de Murcia» (publicador `A14002961`) en json/csv/rdf desde `nexo.carm.es`.
> 3. **Wikidata `P808`** es la propiedad «código BIC» y admite geosearch: sirve para un «no hay» de
>    primera mano y a veces trae la referencia de la declaración. Es un **sustituto**, y así debe
>    constar en el `source`.
> 4. **El portal `www.carm.es` NO se consulta**: responde 302 a un gestor de bots de Radware. Es el
>    portal para personas y **no se rodea** — ni user-agents, ni huellas de navegador, ni resolver el
>    desafío. Si una fuente pone un control de acceso, se busca su canal para máquinas o se anota el
>    hueco.
>
> Y antes de escribir «bloqueado» en un informe: **el host tiene que estar en `check-egress.js`**.
> Durante cuatro espacios esta vía fue la única de las seis sin ninguno registrado, y cada sesión
> escribía la URL de memoria, la veía fallar y lo anotaba como propiedad comprobada de la fuente.

**Consulta OSM de partida** (bbox del parque + margen, recorte posterior por polígono):

```
natural=cape|beach|peak|spring|cliff|arch   tourism=viewpoint|information
historic=tower|ruins|archaeological_site|castle|wayside_cross
man_made=lighthouse|watermill   amenity=parking   place=hamlet|locality
```

**Geocodificación del paso 1 → 4.** Es el caso normal, no la excepción: el PORN nombra "las dunas
fósiles de Cabo Cope" y no las sitúa. Se busca el topónimo en OSM dentro del límite, se comprueba
que la posición es coherente con lo que describe el texto y **se marca `approx: true`**. Los tres
precedentes del piloto están documentados en `Docs/piloto-cabo-cope.md`: dunas fósiles, yacimientos
de Galera-Cope y yacimientos de Garrobillo, los tres con la coordenada del paraje y no la del
elemento, y dicho así en su `source`.

### 4.3 Reglas de admisión

1. **Un POI sin fuente no entra.** La regla vieja del §3, intacta. `source` cita la fuente del
   *hecho* y, aparte, la de la foto y su licencia.
2. **La coordenada es obligatoria** y se valida: `validate-park-data.js` rechaza un POI sin
   `coordinates` y también el `[0, 0]`, que es como se colaban los POIs sin ubicar (NULL en la BD
   casteado a 0.0).
3. **Pertenencia por polígono, no por bbox.** Point-in-polygon contra `geo/parque.geojson`, con el
   mismo margen pequeño que usa `build-park-trails.js` (~50 m) para no descartar lo que roza el
   límite. Un espacio con varios recintos dispersos tiene un bbox que abarca kilómetros de territorio
   que no es suyo.
4. **`approx: true` en cuanto la coordenada sea representativa y no verificada**, y el porqué escrito
   en el `source`. Es la diferencia entre un dato honesto y un dato falso.
5. **Nada marino y nada que no se pise.** Misma regla de producto que sacó del rollout los islotes y
   del catálogo el HIC 1120.
6. **Nada que se dañe al publicarlo.** Precedente explícito: la **Cueva C.6** de Cabo Cope, cavidad
   con registro del Neolítico final, salió del catálogo pese a tener fuente. Un yacimiento sin
   protección ni vigilancia no se señala en una guía de campo, por buena que sea su documentación.
   Ante la duda, fuera, y anotado en el informe.
7. **Deduplicar** contra los POIs ya dados de alta (por `id` y por proximidad: dos chinchetas a 50 m
   son el mismo sitio contado dos veces) y contra `geo/trails.geojson`.
8. **`id` en slug estable**, sin tildes, minúsculas y guiones: es clave en la BD
   (`points_of_interest.slug`, único por parque).

### 4.4 Herramientas

| Script | npm | Qué hace |
|---|---|---|
| `Tools/build-park-pois.js` | `pois:build` | Barre el territorio del parque y trae todo lo que tiene nombre y coordenada, recortado al polígono oficial. Fuentes: Overpass o el `base.pmtiles` del propio parque (`--fuente=auto\|overpass\|basemap`). → `out/<slug>-poi-candidatos.md` |
| `Tools/catalogo-nacional/poi-images.js` | `images:pois` | La foto de cada POI y su crédito (§4.6) |

> **Escriben candidatos, nunca `park.json`.** La descripción de un POI es texto redactado a mano con
> su fuente delante: de los 15 del piloto no salió ni uno tal cual de una consulta. La búsqueda se
> automatiza; la admisión y la redacción, no. `poi-images.js` sí escribe, pero solo la candidata que
> pasa las dos puertas del §4.6.
>
> La fuente de `build-park-pois.js` importa y queda anotada en el informe: `overpass` ve las
> etiquetas completas del §4.2 pero cambia entre ejecuciones; `basemap` no necesita red y es
> reproducible, pero solo ve lo que sobrevive al filtro de zoom de Protomaps. Un candidato que solo
> sale por basemap no significa que OSM no tenga más: significa que esa consulta no se pudo hacer.

### 4.5 El prompt

```
NaturDex · rollout nacional · FASE 3 (puntos de interés N3)
Espacio: <NOMBRE> (slug <SLUG>, provincia <PROVINCIA>)

Contexto obligatorio: Docs/prompts/e-rollout-nacional.md §4 (este apartado: qué es un POI aquí,
la cascada de fuentes y las reglas de admisión) y Docs/piloto-cabo-cope.md §"Puntos de interés".
La referencia de formato y de nivel de exigencia son los 15 POIs de
Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json: léelos antes de escribir ninguno.

Este espacio ya está en N2, así que su límite, sus hábitats y su catálogo de especies existen;
NO los toques. Lo único que se añade aquí es `pointsOfInterest`.

1. BÚSQUEDA. Recorre la cascada del §4.2 EN ORDEN y dime qué encuentra cada fuente antes de
   proponer nada:
   a) PORN/PRUG del espacio: ¿hay anexo o apartado que enumere valores geológicos, culturales
      o paisajísticos? Cítame el documento y el apartado.
   b) IELIG (IGME): LIG cuyo polígono o punto caiga dentro del límite oficial.
   c) BIC y patrimonio dentro del límite, por el orden del recuadro del §4.2: boletín oficial,
      catálogo de datos abiertos de <COMUNIDAD> vía datos.gob.es, y Wikidata P808 como sustituto.
      Si dices que una fuente está cerrada, di CONTRA QUÉ HOST y compruébalo con `npm run red:check`.
   d) OpenStreetMap vía Overpass con las etiquetas del §4.2, recortado AL POLÍGONO.
   Si una fuente no da nada, dilo — un "no hay" documentado vale, y es el resultado que
   tuvieron Sierra Espuña y Cuatro Calas.

2. TABLA DE CANDIDATOS, antes de escribir en park.json. Una fila por candidato:
   nombre propuesto · type (de los ocho) · coordenada y de qué fuente sale · fuente del hecho ·
   approx sí/no y por qué · qué se contaría de él en dos líneas.
   Márcame aparte los que descartas y por la regla que sea (§4.3: marino, frágil, topónimo sin
   hecho, duplicado de un hábitat o de un sendero).

3. ESPERA MI VISTO BUENO de la tabla.

4. ALTA. Para cada aprobado, en el bloque `pointsOfInterest` de park.json y con exactamente los
   mismos campos que el piloto: id, name, type, description, coordinates, image, source, approx,
   audio, audioTranscript.
   - `description`: 2-4 frases con el hecho concreto y comprobable. Si la fuente es tradición
     oral o divulgación turística, se dice en el propio texto y se marca como pendiente de
     contrastar — como está hecho en la Ermita de Cope y en la Fuente de los piratas.
   - `image`: NO la busques a mano. Es el paso 5, con la herramienta del §4.6.
   - Cero adjetivos de folleto.

5. FOTOS (§4.6). Averigua primero la categoría del espacio en Commons —es el ancla— y pásala:
     node Tools/catalogo-nacional/poi-images.js --park <SLUG> --categoria "<Categoría>" \
          --municipio "<Municipio>" --list
   Enséñame el listado antes de escribir. Luego repite con --write --sql. Sin foto es mejor que
   con foto de licencia dudosa: el POI se queda con `image: null` y consta como hueco.

6. CIERRE. Actualiza manifest.json (counts.pointsOfInterest, images), ejecuta `npm run validate`
   hasta verde, y prepara el SQL de la tabla points_of_interest (park_id + slug único) siguiendo
   el patrón de Database/cuatro-calas-n2.sql: idempotente, y dime si queda aplicado o pendiente.
   Actualiza Docs/rollout/ESTADO.md (nivel N3, nº de POIs y las fuentes que dieron y no dieron
   resultado) y dame el informe de cierre: POIs por tipo, cuántos approx y por qué, descartados
   con su regla, y qué habría que verificar en campo.

Regla que manda sobre todas: ante la duda, hueco documentado antes que dato inventado. Un espacio
que cierra su N3 con 0 POIs y la lista de fuentes agotadas es un resultado válido.
```

### 4.6 Las fotos de los POIs — `poi-images.js`

**Por qué no vale el mecanismo de las especies.** Toda la cadena de fotos del catálogo
(`lib/wikimedia.js`) cuelga de un ancla que un POI no tiene: el nombre científico. Wikidata responde
a `haswbstatement:P225="Ziziphus lotus"` con la foto del taxón correcto, y de ahí para abajo todo el
criterio de descarte —otra especie del género, mapas de área, pliegos de herbario— se apoya en el
binomio. El nombre de un POI es un topónimo, que es justo el tipo de cadena que se repite por toda
España: hay al menos tres «Ermita de Santa Leocadia» y la «Playa de las Higuericas» está a 200 km de
nuestra «Playa de la Higuerica».

**El ancla es la categoría de Commons del espacio.** Un archivo que está dentro de
`Category:Cuatro Calas Protected Landscape` está en Cuatro Calas por construcción. Eso resuelve la
mitad del problema —*dónde*— y deja la otra mitad —*qué retrata*— al nombre del archivo.

| # | Vía | Garantiza el sitio | Garantiza el elemento | Se escribe sola |
|---|---|---|---|---|
| 1 | Categoría del espacio + sus subcategorías (**un nivel**), archivo cuyo nombre mencione el POI | Sí, la categoría | El nombre del archivo | **Sí** |
| 2 | Buscador de archivos de Commons: nombre del POI + espacio o municipio | No | No | No: sale como `needsReview` |

> **Un nivel de subcategorías y no más.** En Commons la categoría de un espacio protegido cuelga de
> las del municipio y las de la comunidad; bajar dos niveles acaba trayendo la playa urbana del
> pueblo de al lado. Un nivel sí hace falta: `Cuatro Calas Protected Landscape` agrupa por cala en
> subcategorías como `Cala de los Cocedores`.

**Coincidencia por palabras completas, nunca por subcadena.** Se exige que *todas* las palabras con
peso del nombre del POI aparezcan en el nombre del archivo (los artículos y preposiciones se caen:
Commons escribe indistintamente «Playa Cocedores» y «Playa de los Cocedores»). Que sea palabra
completa y no subcadena es el fallo que el script existe para no cometer: «Higuericas» contiene
«Higuerica». Está cubierto por su test.

**Alias de topónimo — `data/poi-alias.json`.** El nombre con el que un POI está dado de alta sale de
la fuente que lo *sitúa* (casi siempre OSM o el IELIG) y no tiene por qué ser el que usó quien subió
la foto. Cuando no coinciden, el script no encuentra nada aunque la foto esté delante. El caso que
lo motiva: el POI se llama **«Playa de los Cocedores»** (grafía de OSM) y los diez archivos de
Commons dicen **«Cala de los Cocederos»** (grafía del IELIG) — ni «playa» ni «cocedores» aparecen en
el nombre del archivo, así que el mejor POI documentado de Cuatro Calas se quedaba sin foto.

> **Los alias solo se aplican en la vía 1.** No es una limitación, es lo que los hace seguros:
> dentro de la categoría del espacio el sitio ya está garantizado, así que un alias corto como
> «Carolina» o «Azaraque» solo puede traer algo de este espacio. En el buscador ese mismo alias
> traería La Carolina de Jaén, y por eso allí se sigue exigiendo el nombre completo. Un alias
> **no relaja ninguna comprobación**: la licencia sigue siendo lista blanca y la candidata sigue
> teniendo que cargar.

Al dar de alta un POI conviene mirar con qué nombre lo escribe la fuente de la foto y, si difiere,
anotarlo ahí mismo: es más barato que descubrirlo cuando la búsqueda vuelva vacía.

**Dos puertas que el script no abre nunca solo:**

1. **Licencia — lista blanca, no lista negra.** Solo entran CC0, dominio público, CC BY y CC BY-SA.
   NC, ND y «licencia sin especificar» se descartan y se anotan. Es lo contrario de lo que hace el
   pipeline de especies —que se limita a anotar lo que diga Commons— y es deliberado: allí la foto
   ilustra un taxón sustituible; aquí acompaña a un sitio concreto y **se empaqueta en la descarga
   sin conexión del parque**. `--force` **no** levanta esta puerta.
2. **Coincidencia dudosa.** Una candidata `needsReview` —las de la vía 2— sale en el informe pero no
   se escribe. Que una foto sea del sitio correcto no lo decide una heurística sobre un topónimo:
   tiene que verlo alguien. Esta puerta sí la levanta `--force`.

**El crédito va dentro de `source`.** Un POI no tiene `imageAttribution` (una especie y un hábitat
sí). El formato es el del piloto —`…Anexo I del proyecto de PORN…; Wikimedia Commons (foto:
J.Alberto, CC BY-SA 4.0)`— y la escritura es idempotente: una segunda pasada sustituye el crédito
anterior en vez de encadenar otro.

**Se heredan los filtros de `usable()`** de `lib/wikimedia.js`, y aquí importan más que en especies:
para un lugar, el falso positivo clásico no es un pliego de herbario sino **el mapa**. La categoría
de Sierra Espuña contiene literalmente un `Mapa sierra espuna.svg`, y ya hubo el precedente del
`Sorbus domestica_range.svg` colado como «foto» de *Cormus domestica*.

```bash
# 1) Enumerar sin escribir: qué candidata sale por POI, con autor, licencia y vía
node Tools/catalogo-nacional/poi-images.js --park <SLUG> \
     --categoria "<Categoría de Commons del espacio>" --municipio "<Municipio>" --list

# 2) Escribir las seguras + el SQL (la API manda sobre el park.json empaquetado)
node Tools/catalogo-nacional/poi-images.js --park <SLUG> \
     --categoria "<Categoría>" --write --sql Database/poi-imagenes.sql --report Docs/fotos-poi.md
```

**Si un POI se queda sin foto, se queda con `image: null`** y consta como hueco en el informe de
cierre. No hay prisa que levante la regla de licencia.

> **Foto local en vez de enlace.** Si la foto se descarga al repo (`Frontend/Img/poi/<id>.jpg`, como
> las 6 de Cabo Cope), hay que añadirla a `manifest.images` y recalcular `counts.images` y
> `assetBytes`: el validador compara los tres. Una URL de Commons no toca el manifiesto.

---

## 5. Definición de "terminado"

Un espacio está en **N1** cuando: aparece en `parks-index.json` como `basic`, su límite oficial se
dibuja en el mapa, `npm run validate` pasa y la ficha declara su fuente.

Un espacio está en **N2** cuando, además: sus hábitats HIC vienen del MITECO recortados a su límite
(0 vértices fuera), toda especie tiene `source` + `evidence` + estado de conservación en las tres
escalas, las aves están en su apartado de ZEPA y no colgadas de hábitats, ninguna foto es de
licencia dudosa, los contadores del manifiesto cuadran y el informe de cierre lista los huecos
conocidos.

Un espacio está en **N3** cuando, además: se ha recorrido **entera** la cascada de fuentes del §4.2
y consta en el ledger qué dio cada una, todo POI admitido tiene `source`, coordenada dentro del
polígono oficial y `approx` correctamente marcado, ninguno cae en las exclusiones del §4.3, **ha
pasado la búsqueda de fotos del §4.6 con la categoría de Commons del espacio localizada** (y los que
sigan sin foto constan como hueco, no como pendiente), `counts.pointsOfInterest` cuadra y la BD tiene
sus filas.

**Un N3 con 0 POIs es un N3 cerrado** si la cascada está agotada y documentada: lo que cierra el
nivel es haber buscado, no haber encontrado. Lo mismo vale para las fotos —**pero solo si la búsqueda
se ha hecho de verdad**. Un «sin foto» que en realidad significa «no había red para preguntarle a
Commons» no cierra nada: eso es una tarea pendiente y va anotada como tal.

---

## 6. Ledger de progreso — `Docs/rollout/ESTADO.md`

Una tabla, actualizada al cierre de cada sesión. Es lo que evita repetir trabajo o perder el hilo
entre sesiones separadas por semanas:

| Comunidad | Provincia | Espacio | Figura | Slug | Nivel | Fecha | Notas / huecos |
|---|---|---|---|---|---|---|---|
| Región de Murcia | Murcia | Cabo Cope y Puntas de Calnegre | Parque Regional | `cabo-cope-puntas-calnegre` | N2 | 2026-07 | Piloto. Fotos florasilvestre.es pendientes de licencia |
| Región de Murcia | Murcia | Cuatro Calas | Paisaje Protegido | `cuatro-calas` | N1 | 2026-07 | Límite IMIDA/CARM, ENP000007 |

La columna **Nivel** admite `N1`, `N2` y `N3`. Un espacio en N3 lleva además, en la columna de notas,
**cuántos POIs tiene y qué dio cada fuente de la cascada** —incluidas las que no dieron nada—: es lo
que evita que la siguiente sesión vuelva a buscar en el mismo sitio vacío. Cabo Cope es N3 de facto
desde el piloto (15 POIs); Sierra Espuña y Cuatro Calas están en N2 con la búsqueda a medias, y su
nota actual («0 POIs, hueco documentado») es justo el punto de partida de su Fase 3.

Y al pie, por provincia procesada, los parámetros técnicos ya averiguados —código NN, huso UTM leído
del `.prj`, dónde quedaron los ZIP del MITECO—: son los que se tarda media hora en volver a
descubrir en la siguiente sesión.

---

## 7. Orden sugerido de comunidades

Empezar por lo conocido y por donde el pipeline ya está probado, terminar por lo que rompe supuestos:

1. **Región de Murcia** — cierra la comunidad del piloto; huso y ficheros ya verificados.
2. **Andalucía, Comunidad Valenciana, Castilla-La Mancha** — mismo huso 30N, volumen alto de
   espacios, ganancia rápida de cobertura.
3. **Cataluña, Aragón, Baleares** — introduce el huso 31N; primera vez que el parámetro cambia.
4. **Galicia, Castilla y León, Extremadura, Asturias, Cantabria, País Vasco, Navarra, La Rioja,
   Madrid** — 29N/30N.
5. **Canarias** — el caso raro: huso 28N, endemismos que EIDOS trata en su propio ámbito
   ("Canarias" en `aplicaa`) y hábitats macaronésicos ausentes del Atlas peninsular. Se deja
   para el final, cuando el resto del pipeline esté rodado.

Los **Parques Nacionales** de cada comunidad se ascienden a N2 antes que el resto de figuras de esa
misma comunidad: son los que más tráfico van a tener y los que mejor documentación tienen.

---

## 8. Deuda técnica que conviene saldar antes de escalar

Heredada de `Tools/catalogo-nacional/README.md` §"Prompt para retomar" — cada una se paga mejor
ahora que en el parque número treinta:

1. **Tabla de reconciliación taxonómica** (`eidos_taxonid` ↔ `gbifSpeciesKey`) como clave maestra
   nacional. Es *el* prerrequisito de la reutilización de especies entre parques.
2. ~~**Migrar la cartografía de hábitats de 1997 a CNH21 (2021)**~~ — **descartado el 2026-07-25**:
   la de 1997 **es la vigente**. El MITECO declara que, hasta que exista la del Inventario Español de
   Hábitats Terrestres, lo publicado es esa. Lo que sí hay como alternativa es el **Atlas de Hábitats
   de 2005** (`INB_Habitat<NN>` + `Datos<NN>.dbf`), con el que se construyó Cuatro Calas entero;
   `build-habitats.js` distingue las dos fuentes solo.
3. **Adoptar el `<slug>-merged.geojson`** como `habitats.geojson` del parque (hoy solo se genera en
   `out/` para revisión manual).
4. **Catálogos regionales de especies amenazadas**: cada comunidad tiene el suyo. Hace falta una
   tabla comunidad → norma para que el campo de estado autonómico no sea un texto libre distinto
   en cada parque.
5. ~~**Las fotos de los POIs de Cuatro Calas y Sierra Espuña están sin resolver**~~ — **saldada el
   2026-08-09**: ejecutado `poi-images.js` desde una máquina con Node y salida a Commons, quedan
   **10 POIs con foto y 7 sin material libre** (hueco cerrado, no pendiente), y
   `Database/poi-imagenes.sql` está **aplicado y verificado** contra la BD y por la API. Se llevó por
   delante un fallo del propio script —`resuelvePoi` devolvía la candidata aplanada y quien la recibe
   lee `res.elegida`, así que **cuando encontraba foto decía que no había ninguna**—, que ninguna de
   las tres sesiones anteriores pudo ver porque murieron antes de llegar ahí. Ver ESTADO.md,
   sesiones del 2026-08-09.
6. **El IELIG y el registro de BIC se consultan a mano.** `build-park-pois.js` automatiza la vía 4 de
   la cascada (OSM) pero no las vías 2 y 3, que son las que dan los POIs geológicos y patrimoniales
   —los mejores del piloto—. Mientras siga así, la calidad del N3 de un espacio depende de la
   paciencia de quien lo haga.
8. **El geoportal del IMIDA sirve 62 capas y el rollout usa 5.** El pipeline solo toca las capas 1-5
   (una por figura de protección) de `PROYECTOS/OISMA/MapServer`. Sin explotar quedan, entre otras,
   la **zonificación de seis PORN/PRUG** (capas 31-39, que resuelven la vía 1 de la cascada sin pasar
   por el BORM), **Mojones** (48), **Montes públicos** (49), **Vías Pecuarias** (50), **Valores
   Naturales** y **Hábitats terrestres** (51-52) y las **Áreas de Protección de la Fauna Silvestre**
   (57-58). Es la deuda con mejor relación entre lo que cuesta y lo que da, y **solo sirve para
   Murcia**: cada comunidad tendrá su propio geoportal y habrá que repetir el hallazgo. Descubierto
   el 2026-08-09, ver ESTADO.md §"2026-08-09 (d)".
7. **El pipeline de POIs no escribe en la BD por sí solo**, igual que el de hábitats (ver ESTADO.md,
   sesión del 2026-08-01): `poi-images.js` genera el SQL con `--sql`, pero aplicarlo es manual y el
   alta de los POIs no genera ninguno. Con dos parques se lleva; con doscientos, no.
