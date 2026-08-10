# Parámetros técnicos verificados, por provincia

> **Referencia, no histórico.** Esto es lo que hay que consultar en el Paso 0 de una Fase 2 antes de
> descargar nada: huso UTM leído del `.prj`, códigos, y dónde están las descargas del MITECO.
> Estaba enterrado en el ledger; se sacó aquí para poder encontrarlo.
>
> Al entrar en una provincia nueva, **añade su sección** con el huso leído del `.prj` (nunca asumido).

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
- **Atlas de Hábitats 2005 (la fuente vigente desde Cuatro Calas), descargado el 2026-08-09** a
  `Tools/catalogo-nacional/fuentes/atlas-2005/` —ignorado por git, ver `.gitignore`—, con las URLs de
  `fuentes/atlas-habitats-2005-provincias.json`:
  - `INB_HABITAT30_2005_tcm30-199644.zip` (7,73 MB) → `shp/INB_Habitat30_ETRS89_H30.*`, **2.760
    recintos**.
  - `inb_datos30_tcm30-199645.zip` (0,87 MB) → `datos/Datos30.dbf`, **8.923 filas** con `CODUE`,
    `PRIORITARI`, `ALIANZA` y `NOM_HABITA`. Se une al shapefile por `HAB_LAY`.
  - **Huso leído del `.prj`, no asumido**: `PROJCS["ETRS_1989_UTM_Zone_30N"…Central_Meridian,-3.0]`.
    El JSON de provincias trae `husoUTM: null` a propósito, justo para que nadie lo dé por sabido.
  - El MITECO **sí admite `Accept-Ranges`**, así que aquí la descarga se reanuda con `curl -C -`.
    Sirve para **cualquier** espacio de Murcia: se descarga una vez por provincia, no por parque.

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

