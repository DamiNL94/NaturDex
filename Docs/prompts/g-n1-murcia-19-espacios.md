# Prompt de arranque — FASE 1 (N1): los 19 espacios pendientes de la Región de Murcia

> Pégalo entero en una sesión nueva de Claude Code abierta en la raíz del repo.
> Preparado el 2026-07-27, al cierre de la sesión que dejó lista la materia prima.

---

```
NaturDex · rollout nacional · FASE 1 (fichas base N1)
Comunidad: Región de Murcia — los 19 espacios que faltan

## Contexto obligatorio antes de tocar nada

Lee, en este orden:
  1. Docs/prompts/e-rollout-nacional.md  (§0 niveles N1/N2, §2 procedimiento de Fase 1, §4 reglas duras)
  2. Docs/rollout/ESTADO.md              (ledger; la entrada del 2026-07-25 explica de dónde sale todo)
  3. Tools/catalogo-nacional/out/inventario-fuentes-bdn.md  (esquemas de las capas ya descargadas)
  4. Frontend/Data/parks/murcia/cuatro-calas/  (park.json + manifest.json: es LA plantilla de una ficha N1)
  5. Tools/validate-park-data.js         (función validateBasicPark: son las reglas que hay que cumplir)

## Punto de partida: la materia prima YA está descargada y verificada

- `Tools/catalogo-nacional/fuentes/miteco-ide/Enp2025_geojson/Enp2025_p.json`
  Capa oficial ENP del MITECO (dic-2025), península y Baleares. 1.639 features, **EPSG:25830**.
  Campos: SITE_NAME, ODESIGNATE, SITE_CODE_, NUT2, Sup_ha, SITE_CDDA, DESIG_ABBR.
  Los 21 espacios de Murcia son los que tienen `"NUT2":62`.

- `Tools/catalogo-nacional/fuentes/miteco-ide/n2000_2025_GeoJson/n2000_spatial_es_pibal_proy_end25.geojson`
  Red Natura 2000 (dic-2025). 1.640 features, **EPSG:25830**.
  Campos: site_code, SITE_NAME, TIPO, HECTAREAS, AC.
  **TIPO: A = ZEPA · B = LIC/ZEC · C = ambas.** Es el campo que separa geo/lic.geojson de geo/zepa.geojson.

- `Tools/catalogo-nacional/data/murcia-enp-municipios.json`
  Municipios de cada espacio, obtenidos por intersección geométrica contra los límites municipales
  del CNIG. **Ya resuelto: no vuelvas a calcularlo y no rellenes municipios a mano.**

- `Tools/catalogo-nacional/fuentes/inspect-geojson.js`
  Inspector por streaming. `--grep '"NUT2":62'` y `--campo <X>` te dan lo que necesites sin
  cargar los ficheros en memoria.

- `Tools/catalogo-nacional/lib/shapefile.js` → exporta `utmToLonLat(E, N, zona)`.
  `Tools/catalogo-nacional/lib/geo.js` → bbox, área, orientación de anillos.

## Siete cosas que te van a morder si no las sabes

1. **El GeoJSON del MITECO viene PROYECTADO en UTM**, no en WGS84, pese a lo que dice la
   especificación GeoJSON. Península EPSG:25830 (huso 30) y Canarias EPSG:32628 (huso 28), declarado
   en el miembro `crs`. Hay que reproyectar con `utmToLonLat(x, y, 30)`.

2. **`Enp2025_p.json` pesa 190 MB y viene en UNA sola línea.** Un `JSON.parse` lo revienta. Usa
   lectura por streaming: copia el enfoque de `inspect-geojson.js` (busca `"properties"`, equilibra
   llaves teniendo en cuenta cadenas y escapes). El de Red Natura pesa 620 MB.

3. **Los códigos del IMIDA y los del MITECO NO se corresponden** (`ENP000010` ↔ `ES620007`) y no
   hay tabla de equivalencia publicada. En `murcia-enp-municipios.json` ya están emparejados.
   Usa siempre el del MITECO (`SITE_CODE_`) como código oficial en `boundaryNote`.

4. **Salto del Usero (ES620026) no tiene municipios.** No figura con carácter Firme en el IMIDA.
   `validate-park-data.js` exige `municipalities` no vacío, así que **esa ficha no se puede cerrar**:
   déjala fuera del lote, dilo en el resumen, y no inventes el municipio.

5. **Cañaverosa (ES620009) tiene un desvío real de superficie**: MITECO 248,8 ha frente a IMIDA
   242,1 ha (2,7 %). Usa la del MITECO, que es la fuente de la geometría que vas a recortar, y deja
   constancia de la discrepancia en `boundaryNote`.

6. **Los enlaces de descarga de la página del IDE están MUERTOS** (`descargafichero.aspx` → HTTP
   404). Si necesitas volver a descargar algo, usa las URL `/content/dam/` que están en
   `Tools/catalogo-nacional/fuentes/FUENTES.json`. No pierdas tiempo con las del IDE.

7. **Antes de dar por hecha una descarga, verifícala.** En la sesión anterior se dieron por buenas
   unas descargas que en realidad devolvían 404.

## Lo que hay que hacer

Para **18 espacios** (los 19 pendientes menos Salto del Usero), en `Frontend/Data/parks/murcia/<slug>/`:

- `geo/parque.geojson` — geometría del ENP recortada de `Enp2025_p.json` por `SITE_CODE_`,
  reproyectada a WGS84 y generalizada para peso web (objetivo: por debajo de ~300 KB por espacio;
  mira el tamaño de los geojson de cabo-cope como referencia).
- `geo/lic.geojson` y `geo/zepa.geojson` — solo si hay solape real con la capa Red Natura. Separa
  por `TIPO` (A→zepa, B→lic, C→ambas). Si un espacio no solapa con ninguno, **no declares la clave**
  en el manifiesto: el validador acepta que falten.
- `park.json` — solo el bloque `park`, con `habitats`, `species` y `pointsOfInterest` como arrays
  vacíos. Campos obligatorios: slug, name, category, region, province, municipalities, center,
  summary, boundaryNote.
  - `name` y `category`: **literales** de `SITE_NAME` y `ODESIGNATE`. No los reescribas.
  - `center`: centroide calculado de la geometría, en `[lat, lng]`. El validador comprueba que caiga
    dentro de España.
  - `municipalities`: de `murcia-enp-municipios.json`, tal cual.
  - `boundaryNote`: procedencia + código ENP oficial + CDDA + superficie oficial + fecha de la capa.
    Usa como modelo el de `cuatro-calas`, que ya tiene el formato bueno.
  - `summary`: **solo datos verificables** — figura de protección, superficie oficial, municipios y
    códigos Natura 2000 que solapan. Cero adjetivos de folleto turístico. Si no tienes fuente para
    una frase, no la escribas.
- `manifest.json` — mismo esqueleto que el de cuatro-calas, con `counts` todo a cero, `images: []`
  y las rutas de `geo` que realmente existan. **Sin bloque `tiles`** salvo que generes los pmtiles.
- Entrada en `Frontend/Data/parks-index.json` con `status: "basic"`, dentro de
  Región de Murcia → Murcia, con slug, name, category, center, path y manifest.

Slugs sin tildes, en minúsculas, con guiones, y **estables para siempre** (son claves).

## Cómo quiero que trabajes

Escribe un generador reutilizable, no 18 ficheros a mano:
`Tools/catalogo-nacional/build-n1-espacios.js`, parametrizado por código NUTS2 para que sirva
después con el resto de comunidades. Que admita `--dry` y que sea idempotente: volver a ejecutarlo
no debe cambiar nada. Comenta en español el porqué de las decisiones no obvias, sobre todo la
reproyección y la simplificación.

## Reglas duras

- **No inventes NADA**: ni municipios, ni superficies, ni descripciones, ni especies, ni hábitats.
  Si un dato no está en la fuente oficial, se queda fuera y me lo dices.
- No toques `cabo-cope-puntas-calnegre` ni `cuatro-calas`: ya están y están verificados.
- Todo `park.json` lleva la procedencia en `boundaryNote`.
- Atribución obligatoria en los datos derivados:
  «Fuente: © Ministerio para la Transición Ecológica y el Reto Demográfico».

## Cierre

1. `npm run validate` en verde. La línea final debe decir 20 espacios: 1 completo + 19 fichas base.
2. Comprueba a ojo un par de límites (que el centroide caiga dentro del polígono y que el bbox esté
   en el sureste peninsular): el error clásico es dejar coordenadas en UTM o con lat/lng al revés,
   y en el mapa no se ve hasta que abres la app.
3. Actualiza el ledger `Docs/rollout/ESTADO.md` con una fila por espacio.
4. Resúmeme: espacios dados de alta, cuáles quedaron fuera y por qué, y cuáles recomiendas
   priorizar a N2.
```

---

## Estado al entregar este prompt

| | |
|---|---|
| Espacios de Murcia en la capa oficial | 21 |
| Ya en NaturDex | 2 (`cabo-cope-puntas-calnegre` N2, `cuatro-calas` N1) |
| A dar de alta en este lote | **18** |
| Bloqueado | 1 (Salto del Usero, sin municipios en fuente oficial) |

Materia prima descargada y verificada, municipios resueltos, esquemas documentados. Lo que falta es
escribir el generador y ejecutarlo.
