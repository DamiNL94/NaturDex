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

**a) Dos niveles de dato, no uno.** Hacer cada espacio completo antes de pasar al siguiente deja el
mapa de España vacío durante años. Se separa en:

| Nivel | `status` | Contenido | Coste | Fuente |
|---|---|---|---|---|
| **N1 · Ficha base** | `basic` | Límite oficial, códigos Natura 2000, figura de protección, superficie, municipios, `summary`. Sin especies ni hábitats. | Lote automático, decenas de espacios por sesión | Una sola descarga nacional (ENP + Red Natura del IEPNB) |
| **N2 · Completo** | `available` | Lo del piloto: hábitats HIC recortados, catálogo de especies con evidencia, POIs, fotos, audioguías | 1 espacio por sesión larga | Pipeline de 3 capas del README |

Todo espacio nace en N1 y asciende a N2 cuando le toca. El usuario ve el mapa nacional poblado
desde el primer día, con la honestidad de "ficha base / catálogo en preparación".

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
   (Docs/rollout/ESTADO.md, ver §5) y resúmeme: espacios dados de alta, descartados y por qué,
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

POIs, fotos y cierre
  7. POIs solo desde fuente documental (PORN/PRUG, red de senderos oficial, cartografía del
     organismo gestor). Un POI sin fuente no entra.
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

## 4. Definición de "terminado"

Un espacio está en **N1** cuando: aparece en `parks-index.json` como `basic`, su límite oficial se
dibuja en el mapa, `npm run validate` pasa y la ficha declara su fuente.

Un espacio está en **N2** cuando, además: sus hábitats HIC vienen del MITECO recortados a su límite
(0 vértices fuera), toda especie tiene `source` + `evidence` + estado de conservación en las tres
escalas, las aves están en su apartado de ZEPA y no colgadas de hábitats, ninguna foto es de
licencia dudosa, los contadores del manifiesto cuadran y el informe de cierre lista los huecos
conocidos.

---

## 5. Ledger de progreso — `Docs/rollout/ESTADO.md`

Una tabla, actualizada al cierre de cada sesión. Es lo que evita repetir trabajo o perder el hilo
entre sesiones separadas por semanas:

| Comunidad | Provincia | Espacio | Figura | Slug | Nivel | Fecha | Notas / huecos |
|---|---|---|---|---|---|---|---|
| Región de Murcia | Murcia | Cabo Cope y Puntas de Calnegre | Parque Regional | `cabo-cope-puntas-calnegre` | N2 | 2026-07 | Piloto. Fotos florasilvestre.es pendientes de licencia |
| Región de Murcia | Murcia | Cuatro Calas | Paisaje Protegido | `cuatro-calas` | N1 | 2026-07 | Límite IMIDA/CARM, ENP000007 |

Y al pie, por provincia procesada, los parámetros técnicos ya averiguados —código NN, huso UTM leído
del `.prj`, dónde quedaron los ZIP del MITECO—: son los que se tarda media hora en volver a
descubrir en la siguiente sesión.

---

## 6. Orden sugerido de comunidades

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

## 7. Deuda técnica que conviene saldar antes de escalar

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
