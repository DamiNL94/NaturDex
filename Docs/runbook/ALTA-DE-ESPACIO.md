# Runbook: dar de alta un espacio

### Fase 1 — N1, una comunidad entera de golpe

```bash
node Tools/catalogo-nacional/build-n1-espacios.js --nuts2 <CODIGO> [--dry] [--solo <ES…>]
node Tools/catalogo-nacional/refina-limites-imida.js [--dry]      # si hay geoportal autonómico
npm run tiles:build <slug>                                        # mapa base offline por espacio
npm run validate
```

`build-n1-espacios.js` es **idempotente** y genera, por espacio: `geo/parque.geojson`,
`geo/lic.geojson`, `geo/zepa.geojson`, `park.json` (solo el bloque `park`), `manifest.json` con
contadores a cero, y la entrada en `parks-index.json` con `status: "basic"`.

Antes de escribir nada, **presenta el inventario y espera el visto bueno**: nombre oficial, figura,
provincia, municipios, superficie, código ENP y códigos Natura 2000. Puede haber espacios que excluir.

### Fase 2 — N2, un espacio por sesión

**Paso 0 · confirmar parámetros y parar si alguno no cuadra**

- `REGION_NN` (código INE de provincia, para los ficheros del MITECO).
- **Huso UTM: NO lo asumas.** Léelo del `.prj` del shapefile descargado y dilo en voz alta.
- `SITE_CODES` (los `ES…` de LIC/ZEC y ZEPA), leídos de los geojson que ya existen del N1.
- Ruta del límite en WGS84.

**Capa 2 · hábitats**

```bash
node Tools/catalogo-nacional/build-habitats.js --park <SLUG> \
     --shp <ruta>.shp --datos Habi<NN>.dbf --zone <HUSO>
# Revisar ANTES de fusionar: recintos recortados, vértices fuera del límite (debe ser 0),
# recintos sin HIC descartados, códigos antiguos a reconciliar.

node Tools/catalogo-nacional/merge-habitats.js --park <SLUG> \
     --official Tools/catalogo-nacional/out/<SLUG>-oficial.geojson [--reconcile 8230:8210]

node Tools/catalogo-nacional/adopt-habitats.js --park <SLUG> --dry   # revisar
node Tools/catalogo-nacional/adopt-habitats.js --park <SLUG> --sql   # escribir (y regenerar el n2)
```

`merge-habitats` conserva lo curado a mano y actualiza desde la fuente lo que es dato. `adopt-habitats`
lo lleva a `Frontend/`, sincroniza `park.json`, recalcula los contadores del manifiesto y sube su versión si cambió algo
—también si solo cambió el geojson—; con `--sql` deja además regenerado `Database/<SLUG>-n2.sql`. Si aparecen
códigos HIC nuevos, **amplía `data/hic-nombres.json` y `data/hic-prioritarios.json` antes** (ver [trampas](TRAMPAS-CONOCIDAS.md)).

**Capa 3 · especies — el orden de prioridad de las fuentes**

> **Legislación → EIDOS → GBIF, y GBIF solo corrobora** (regla nº 3 del `CLAUDE.md`). Ninguna especie
> entra porque GBIF tenga avistamientos suyos dentro del límite: eso mete olivos de bancal y
> ornamentales de una casa de campo. Manda lo que la norma del espacio y el formulario del sitio
> **enumeran**; después la figura legal de EIDOS y el Atlas; y GBIF, al final, para confirmar que lo
> anterior está aquí. Los pasos de abajo siguen ejecutándose en este orden por razones técnicas —el
> barrido de GBIF hay que tenerlo antes de poder cruzar nada—, pero **quien decide quién entra es el
> nivel de la fuente**, no quién se ejecutó primero.

0. **El anexo normativo del espacio**, antes que nada. Mira primero
   [`data/normativa-espacios.json`](../../Tools/catalogo-nacional/data/normativa-espacios.json): si
   el plan del espacio ya se ha localizado en otra sesión, ahí están su URL y **el apartado exacto**
   que trae el inventario, y te ahorras la búsqueda entera. Si no está, búscalo y **añádelo**, aunque
   la búsqueda salga vacía (`encontrado: false` también es un resultado que vale).
   > Un plan autonómico rara vez se publica entero en el boletín: el articulado remite a volúmenes
   > que viven en el gestor documental de la comunidad. El del Altiplano son cuatro volúmenes en el
   > Alfresco de `murcianatural.carm.es`, y el articulado del BORM no lleva ni una especie.
   > Para leerlos: `apt-get install poppler-utils` y `pdftotext -layout -enc UTF-8` — **con
   > `-layout`**, que sin él las columnas de la tabla se refluyen y el nombre científico de una fila
   > acaba pegado al de la siguiente.
   >
   > **Y la ficha del espacio en `murcianatural.carm.es/<slug>` suele llevar el enlace al plan**, que
   > es la vía más corta y la que encontró el PORN de Sierra Espuña-Gebas. Dos avisos: el PDF vive en
   > un gestor documental tras el Radware de la CARM —hay que pedir antes la ficha con `curl -c` y
   > reutilizar el tarro de cookies—, y **un `HEAD` responde 200 aunque el `GET` vaya a dar 302**, así
   > que comprobar el enlace con `-I` no basta ([trampas](TRAMPAS-CONOCIDAS.md)).
   >
   > **Antes de transcribir, mira QUÉ PERÍMETRO inventaría la norma.** Un plan puede cubrir varios
   > espacios con un solo inventario: el de 1995 es a la vez el de Sierra Espuña y el de los
   > Barrancos de Gebas, y el de 2019 cubre seis espacios del Mar Menor. Cuando el ámbito desborda
   > al espacio, la entrada del anexo lleva **`exigeConstancia: true`** y entonces el anexo no es
   > puerta de entrada: respalda, y GBIF tiene que corroborar dentro de los polígonos. Sin eso, el
   > espacio pequeño hereda el catálogo del grande **en verde** (`CLAUDE.md` §2).

   Lee el PORN, el PRUG, el decreto de
   declaración o el SDF del sitio Natura 2000 y transcribe la lista de especies que enumeren a
   `Tools/catalogo-nacional/data/anexos-normativos.json`, con su cita y la fecha en que lo leíste.
   Los nombres van **tal y como los escribe la norma** (lo dice su `_esquema`): una errata evidente
   se anota en `nota`, no se corrige en silencio. Lo que no case con GBIF saldrá en
   `anexo_sin_constancia`, que es exactamente donde tiene que verse.
   Es la evidencia más fuerte de las cuatro —la única que afirma la pertenencia *a este espacio*— y
   **es la puerta de entrada**: lo que la norma enumera entra en el catálogo aunque GBIF no lo
   confirme, y sale además en `anexo_sin_constancia` para contrastarlo en campo. **Si no hay anexo
   con especies, no inventes uno**: deja el espacio sin entrada y la herramienta lo dirá («NO
   consultado») en vez de callarlo. Y ten presente lo que eso implica: **un espacio sin plan de
   gestión transcrito tendrá un catálogo mucho más corto**, porque se queda solo con lo que respalden
   el formulario del sitio, la figura legal y el Atlas. Transcribir el plan es lo que lo arregla.
1. **GBIF ∩ polígonos** → `gbif-habitats.js` → evidencia `observada_gbif`. Va primero por orden de
   ejecución, no de autoridad: es lo que hace falta tener descargado para poder **corroborar** con él
   los niveles 1 y 2, y en un espacio que arranca con 0 especies el Atlas no puede ir antes porque
   cruza contra la flora *que el parque ya tiene*. **Por sí solo no da de alta nada.**
   ⚠️ `--max-occ` vale 40.000 por defecto y trunca **por offset**, que no es una muestra al azar:
   súbelo por encima del total del bbox o te quedas con un catálogo hecho con la mitad de los datos.
2. **Atlas de Hábitats** → `atlas-hic-especies.js` → evidencia `caracteristica`. Aquí es **filtro**,
   no fuente de candidatas: da el backbone determinista y la prueba de cordura del resto.
   ⚠️ **Pásale todos los `atlas.txt` que tengas** (`--atlas a.txt,b.txt`) y, si el espacio ya tiene
   índice, **`--fusiona`**. De qué extractor de PDF salga el texto cambia QUÉ enlaces se leen y
   ninguno cubre al otro: medido sobre Murcia, el texto de Xpdf con `-layout` recupera 34 enlaces en
   Sierra de El Carche que el índice anterior no tenía **y pierde quince** de Sierra Espuña que sí
   traía. Las dos salidas parecen completas, así que el error no se ve. El Atlas se usa **solo en
   positivo**: que un parser no lea un nombre no significa que el Atlas no lo dé.
3. **EIDOS** para toda especie nueva: taxonomía, UICN por ámbito, estado legal, nombre común.
4. **Lista oficial del sitio** → `npm run sitio:especies -- --park <slug>` → secciones 3.2 y 3.3 del
   Formulario Normalizado de Datos de cada sitio Red Natura 2000 del espacio, desde el servicio RN2000
   del IEPNB → evidencia `lista_oficial_sitio`. **Lánzalo antes que la selección**: es la PUERTA de las
   aves, que no entran por el filtro de presencia (sus ocurrencias caen en cualquier polígono porque
   vuelan). Sin este volcado, la selección excluye todas las aves que no salve el anexo normativo, y lo
   dice por pantalla. No es Discodata/BISE, que es lo que decía este runbook: el dato es nacional y lo
   publica MITECO en el mismo host que EIDOS.

   **Dos cosas que hay que tener delante al leer el resultado**, las dos en
   [`AVES.md`](AVES.md) §3: el formulario **no es un inventario** —la sección 3.2 son las del Anexo I
   y las migratorias de presencia regular, y la 3.3 está vacía en casi todos los sitios españoles—, y
   **el perímetro del sitio no es el del espacio** (la única ZEPA que solapa Cuatro Calas es marina,
   así que sus aves terrestres no las declara nadie). Si el espacio sale con muy pocas aves, la vía
   es **transcribir su plan de gestión** al anexo normativo, no bajar la exigencia: los tres espacios
   del Altiplano, que lo tienen transcrito, conservan 46, 61 y 66 aves; los que solo tienen
   formulario se quedan en 17, 18 y 40.
5. **Reconciliación taxonómica** → `reconcile-taxa.js`.
6. **Reutilización.** Cruza contra `especies-universal.json`. Lo que ya existe se **enlaza**, no se
   reescribe. Di cuántas reutilizas y cuántas son nuevas.

De ahí sale la **selección aprobada**, `out/<slug>-seleccion-especies.json`: la lista con su
procedencia especie a especie y las excluidas con su motivo. **Desde el 2026-08-11 la produce una
herramienta**, no una sesión a mano:

```bash
# El Atlas hay que extraerlo del PDF una vez (cualquier extractor vale, lib/atlas.js lee los dos
# formatos; sin poppler sirve pypdf). Sin --atlas no hay evidencia `caracteristica` y se avisa.
pdftotext -enc UTF-8 "Docs/Atlas y Manual de los Habitat de Espana.pdf" atlas.txt

npm run species:seleccion -- --park <SLUG> --atlas atlas.txt --dry   # revisar
npm run species:seleccion -- --park <SLUG> --atlas atlas.txt         # escribir
```

Aplica cuatro filtros encadenados y **reconcilia por `eidosTaxonId`**. Lee su cabecera antes de
tocar los umbrales; lo que descarta no desaparece, sale en `excluidas_detalle` con su motivo.

> **El filtro que hay que mirar es el de alcance taxonómico.** GBIF no distingue entre lo que esta
> app cataloga y lo que no: en Sierra de la Pila, 251 de 625 candidatos eran insectos. El catálogo es
> **flora vascular y vertebrados**, y esa lista de clases se cambia con `--clases` — pero si la
> cambias, dilo en el informe de cierre: es lo que hace comparables dos espacios.

**No son fichas todavía.** Escribirlas son dos pasos, y **el orden importa**:

```bash
# 1) Alta en el catálogo universal de las especies que no están en NINGÚN parque todavía.
#    Sale a EIDOS, GBIF y Wikimedia. Es el único de los dos que necesita red.
node Tools/catalogo-nacional/build-species-universal.js --park <SLUG> --dry
node Tools/catalogo-nacional/build-species-universal.js --park <SLUG> \
     --curado Tools/catalogo-nacional/data/curacion-especies.json

# 2) Escritura de las fichas del espacio en su park.json.
node Tools/catalogo-nacional/build-species-n2.js --park <SLUG> --dry    # revisar
node Tools/catalogo-nacional/build-species-n2.js --park <SLUG>          # escribir

# Si la selección ha RECONCILIADO algún nombre, el viejo queda en el park.json como especie
# fantasma: --podar lo retira, y species:poda limpia después el catálogo universal.
node Tools/catalogo-nacional/build-species-n2.js --park <SLUG> --podar
npm run species:poda
```

**Sin el paso 1, el paso 2 no puede escribir una especie nueva y lo dice.** El catálogo universal
solo se alimentaba de `species:extract`, que vuelca lo que YA hay en los `park.json`, y
`build-species-n2.js` se niega —con razón— a escribir una especie sin ficha universal. Las dos
reglas juntas cerraban un círculo: **una especie que no estuviera ya en algún parque no podía entrar
en ninguno**. Eso es lo que dejó a Carrascoy y El Valle con 100 especies aprobadas y sin escribir
durante una sesión entera. `build-species-universal.js` es la puerta de entrada al catálogo.

Lo que el paso 1 **no** rellena queda listado en `out/<slug>-fichas-incompletas.md`, con la
descripción de EIDOS y los nombres castellanos alternativos al lado para poder cerrarlo con
`--curado` sin salirse de la fuente. Las **tres pistas de identificación no se generan nunca**:
ninguna fuente las sirve y recortar la descripción produce frases que no ayudan a identificar nada.

Ensambla el array `species` del `park.json`, el inverso `speciesIds` de cada hábitat y los
contadores del manifiesto. **No sale a la red y no inventa ningún campo**: lo universal lo copia del
catálogo, los enlaces y las ocurrencias del barrido de GBIF, el estado legal de las `normas` del
IEPNB que trae la selección y los identificadores externos del parque donde la especie ya está
fichada. Una seleccionada **sin ficha en el catálogo universal no se escribe** —haría falta inventar
taxonomía, nombre común, UICN y foto—: queda listada en `out/<slug>-especies-pendientes.md` y la
herramienta la incorpora sola en cuanto el paso 1 le dé de alta la ficha. Es idempotente y conserva
lo curado a mano (`coordinates`, `featured`, `visible`, `reviewNote`, audio).

**Regla de selección** (ajústala al tamaño del espacio y **dilo**). La usada en Cuatro Calas:

> Se excluyen las no nativas (van a Invasoras, que es regional). Se mantiene una especie si **(a)**
> tiene figura legal vigente en EIDOS, **(b)** el Atlas la da como característica de alguno de los HIC
> cartografiados aquí, o **(c)** tiene **≥ N ocurrencias** de GBIF dentro de un mismo hábitat.

En Sierra Espuña (80× más grande) el umbral fue 15 y luego 50; en Cuatro Calas, 3. El umbral no es
una constante universal: es una decisión por espacio que hay que dejar escrita en el informe de cierre.

**POIs, fotos y cierre**

> **Y antes de nada, `npm run species:extract`.** Una revisión nomenclatural que renombre taxones en
> los `park.json` y no vuelva a extraer deja el catálogo universal partido en dos: los nombres viejos
> siguen ahí (extract añade, nunca borra) y los nuevos no están. Una selección aprobada **antes** de
> ese renombrado casa con los viejos y resucita el duplicado que se acababa de quitar. Pasó en
> Carrascoy con cuatro especies (ESTADO.md §"2026-08-10"); `build-species-n2.js` lo detecta y avisa,
> pero el catálogo hay que dejarlo al día igualmente.

```bash
npm run species:extract      # vuelca a especies-universal.json lo nuevo de los park.json
npm run images:species       # fotos de Wikimedia con atribución
npm run images:habitats      # portadas de hábitat
npm run images:pois          # fotos de POIs desde la categoría de Commons del espacio
npm run species:extract      # OTRA VEZ, y no es un despiste: ver el recuadro de abajo
npm run species:apply        # sincroniza los campos universales a TODOS los park.json + SQL
npm run habitats:check       # hábitats sin descripción universal, textos con rastro de un parque
npm run habitats:apply       # descripción por código HIC a TODOS los park.json + Data/fitosociologia.json + SQL
node Tools/build-park-trails.js <slug>
npm run pois:build <slug>    # candidatos a POI recortados al polígono (NO escribe park.json)
npm run tiles:build <slug>
npm run validate             # hasta verde
npm run glossary:check       # vocabulario nuevo sin definición
npm run taxones:duplicados   # el mismo taxón con dos nombres
```

> **El `species:extract` de después de las fotos es obligatorio, y sin él `species:apply` DESHACE
> todo lo que acaban de encontrar.** `wikimedia-images.js` escribe la foto y su atribución **solo en
> el `park.json`**, y `image`/`imageAttribution` son campos UNIVERSALES: `species:apply` los reparte
> desde `especies-universal.json`, así que lo que no haya pasado por el catálogo se sobrescribe con
> el `null` que sigue habiendo allí. Es la trampa nº 4 del `CLAUDE.md` —corregir un campo universal
> en el `park.json` y no en el catálogo— pero disparada por una herramienta del propio runbook, no
> por un despiste. Y **no falla**: `images:species` dice «resueltas N», `species:apply` dice
> «actualizadas M», las dos en verde, y la foto ya no está. El `extract` de en medio es lo que la
> sube al catálogo (rellena el campo vacío desde el `park.json`, `sync-species-catalog.js:219`) para
> que `apply` la reparta en vez de pisarla. Pasó el 2026-08-22 con *Merendera filifolia*, resuelta
> para Calblanque y Espacios Abiertos y revertida en el mismo comando.
>
> La prueba de que ha ido bien es la de siempre: `species:apply` en segundo pase → «actualizadas 0»,
> y la foto sigue en el `park.json`.

POIs **solo desde fuente documental** (PORN/PRUG, red de senderos oficial, cartografía del organismo
gestor). Un POI sin fuente no entra. `pois:build` **no** salta esa regla: barre OpenStreetMap dentro
del límite —vía Overpass, o vía el `base.pmtiles` del propio parque cuando no hay red— y deja los
candidatos con su coordenada en `Tools/catalogo-nacional/out/<slug>-poi-candidatos.md`. El hecho, la
fuente, la foto y la descripción se ponen a mano; la herramienta solo dice dónde mirar.
Después: `status` a `available` en `parks-index.json`, cargar la
BD, y actualizar `Docs/rollout/ESTADO.md` con el informe de cierre (contadores, cobertura de fotos,
especies sin hábitat, huecos conocidos y qué contrastar en campo).

### Definición de «terminado»

**N1**: está en `parks-index.json` como `basic`, su límite oficial se dibuja, `npm run validate` pasa
y la ficha declara su fuente en `boundaryNote`.

**N2**: además, sus hábitats vienen del MITECO recortados a su límite (**0 vértices fuera**), toda
especie tiene `source` + `evidence` + estado en las tres escalas, las aves están en su apartado ZEPA y
no colgadas de hábitats, ninguna foto es de licencia dudosa, los contadores del manifiesto cuadran y
el informe de cierre lista los huecos conocidos.

### Checklist de cierre

```
[ ] npm run validate                    en verde (los avisos preexistentes, contados y explicados)
[ ] npm run taxones:duplicados          código 0, o los pendientes justificados
[ ] npm run glossary:check              vocabulario nuevo redactado o anotado
[ ] npm run species:extract             SEGUNDO pase → 0 cambios (idempotencia)
[ ] npm run species:extract             y uno DESPUÉS de las fotos, o species:apply las revierte
[ ] npm run species:apply               SEGUNDO pase → 0 fichas actualizadas
[ ] npm run habitats:check              0 hábitats sin descripción y 0 asociaciones sin lectura llana
[ ] npm run habitats:apply              SEGUNDO pase → 0 hábitats actualizados
[ ] adopt-habitats.js --dry             converge: «=» en los tres ficheros
[ ] status → "available" en parks-index.json
[ ] manifest.version subido y updatedAt al día (si no, el offline no revalida)
[ ] SQL generado Y aplicado (la API tiene prioridad sobre el park.json — ORDEN-DE-OPERACIONES.md §3)
[ ] Docs/rollout/ESTADO.md con el informe de cierre y los huecos
```

### Prompt para retomar en una sesión nueva

> Retomo el rollout de NaturDex. Lee `CLAUDE.md` y de ahí solo lo que necesites: el modelo
> ([`Docs/arquitectura/MODELO-DE-DATOS.md`](../arquitectura/MODELO-DE-DATOS.md)), la procedencia de
> cada campo ([`Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md`](../arquitectura/PROCEDENCIA-DE-CAMPOS.md)),
> este runbook, las [trampas](TRAMPAS-CONOCIDAS.md) y el [orden de operaciones](ORDEN-DE-OPERACIONES.md).
> El estado por espacio está en [`Docs/rollout/ESTADO.md`](../rollout/ESTADO.md) — la tabla, no los
> informes.
>
> Empieza preguntándome **qué espacio** procesamos y confírmame antes de descargar nada: su
> `REGION_NN`, el **huso UTM leído del `.prj`** (no lo asumas) y sus códigos Natura 2000. Si alguno no
> cuadra, para y dímelo. Los parámetros ya verificados por provincia están en
> [`Docs/rollout/PARAMETROS-POR-PROVINCIA.md`](../rollout/PARAMETROS-POR-PROVINCIA.md).

