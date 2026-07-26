# Ledger de progreso del rollout nacional

> Tabla del §5 de `Docs/prompts/e-rollout-nacional.md`. Se actualiza al cierre de cada sesión de
> Fase 1 (N1) o Fase 2 (N2). Formato y niveles (N1/N2) definidos en ese mismo documento §0 y §4.

| Comunidad | Provincia | Espacio | Figura | Slug | Nivel | Fecha | Notas / huecos |
|---|---|---|---|---|---|---|---|
| Región de Murcia | Murcia | Cabo Cope y Puntas de Calnegre | Parque Regional | `cabo-cope-puntas-calnegre` | N2 | 2026-07 | Piloto. Fotos de florasilvestre.es pendientes de licencia |
| Región de Murcia | Murcia | Cuatro Calas | Paisaje Protegido | `cuatro-calas` | N1 | 2026-07 | Límite IMIDA/CARM, ENP000007 |

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

## §7.1 — Tabla de reconciliación taxonómica: qué hay ya

`Tools/catalogo-nacional/out/cabo-cope-puntas-calnegre-reconciliacion.json` es, para las 124
especies del piloto, exactamente la tabla `eidos_taxonid` ↔ `gbifSpeciesKey` que
`Docs/prompts/e-rollout-nacional.md` §7.1 pide como prerrequisito de la reutilización de especies
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
