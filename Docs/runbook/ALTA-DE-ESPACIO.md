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
node Tools/catalogo-nacional/adopt-habitats.js --park <SLUG>         # escribir
```

`merge-habitats` conserva lo curado a mano y actualiza desde la fuente lo que es dato. `adopt-habitats`
lo lleva a `Frontend/`, sincroniza `park.json` y recalcula los contadores del manifiesto. Si aparecen
códigos HIC nuevos, **amplía `data/hic-nombres.json` y `data/hic-prioritarios.json` antes** (ver [trampas](TRAMPAS-CONOCIDAS.md)).

**Capa 3 · especies — el orden importa, de más sólido a más ruidoso**

1. **GBIF ∩ polígonos** → `gbif-habitats.js` → evidencia `observada_gbif`. Es lo que trae las
   **candidatas**, y por eso va primero: en un espacio que arranca con 0 especies, el Atlas no puede
   ir antes porque cruza contra la flora *que el parque ya tiene* y devolvería 0 enlaces.
   ⚠️ `--max-occ` vale 40.000 por defecto y trunca **por offset**, que no es una muestra al azar:
   súbelo por encima del total del bbox o te quedas con un catálogo hecho con la mitad de los datos.
2. **Atlas de Hábitats** → `atlas-hic-especies.js` → evidencia `caracteristica`. Aquí es **filtro**,
   no fuente de candidatas: da el backbone determinista y la prueba de cordura del resto.
3. **EIDOS** para toda especie nueva: taxonomía, UICN por ámbito, estado legal, nombre común.
4. **Aves** → Discodata BISE por `site_code` → evidencia `zepa`, apartado propio del espacio.
5. **Reconciliación taxonómica** → `reconcile-taxa.js`.
6. **Reutilización.** Cruza contra `especies-universal.json`. Lo que ya existe se **enlaza**, no se
   reescribe. Di cuántas reutilizas y cuántas son nuevas.

De ahí sale la **selección aprobada**, `out/<slug>-seleccion-especies.json`: la lista con su
procedencia especie a especie y las excluidas con su motivo. **No son fichas todavía.** Escribirlas
es un paso aparte y tiene herramienta:

```bash
node Tools/catalogo-nacional/build-species-n2.js --park <SLUG> --dry   # revisar
node Tools/catalogo-nacional/build-species-n2.js --park <SLUG>         # escribir
```

Ensambla el array `species` del `park.json`, el inverso `speciesIds` de cada hábitat y los
contadores del manifiesto. **No sale a la red y no inventa ningún campo**: lo universal lo copia del
catálogo, los enlaces y las ocurrencias del barrido de GBIF, el estado legal de las `normas` del
IEPNB que trae la selección y los identificadores externos del parque donde la especie ya está
fichada. Una seleccionada **sin ficha en el catálogo universal no se escribe** —haría falta inventar
taxonomía, nombre común, UICN y foto—: queda listada en `out/<slug>-especies-pendientes.md` y la
herramienta la incorpora sola cuando alguien le dé de alta la ficha. Es idempotente y conserva lo
curado a mano (`coordinates`, `featured`, `visible`, `reviewNote`, audio).

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

