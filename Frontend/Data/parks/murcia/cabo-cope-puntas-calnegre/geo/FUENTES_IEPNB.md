# Bases de datos del IEPNB relevantes para NaturDex

Extracción realizada desde **https://iepnb.gob.es/** (Inventario Español del Patrimonio
Natural y la Biodiversidad, IEPNB — Ministerio para la Transición Ecológica y el Reto
Demográfico, MITECO). El portal usa un catálogo tipo CKAN (`https://iepnb.gob.es/catalogo/dataset`,
1.850 conjuntos de datos, con API REST propia) más tres visores temáticos con datos oficiales
descargables. A continuación, la ficha de cada base de datos que corresponde a lo que NaturDex
ya usa o podría usar, con foco en sustituir/complementar las fuentes actuales del proyecto
(INB por shapefile suelto, cartografía CARM 2020, límites del IMIDA, y fuentes dispersas para
el estado de conservación de las especies).

---

## 1. Cartografía Nacional de Hábitats 2021 (CNH21)

**Qué es:** sucesora directa del *Inventario Español de Hábitats Terrestres (INB)* que
`geo/README.md` cita como fuente de 11 de los 15 hábitats cartografiados del parque. Es la
versión actualizada (2021) a nivel estatal, con doble leyenda: Lista Patrón de los Hábitats en
España (LPEH) y Hábitats de Interés Comunitario (HIC, Anexo I Directiva 92/43/CEE).

- **Organismo:** Subdirección General del Sistema Integrado de Información de la Biodiversidad
  (SGSIIB), MITECO. Contacto: buzon-bdatos@miteco.es
- **Cobertura:** toda España (península, Baleares y Canarias)
- **CRS:** EPSG:25830 (ETRS89 UTM 30N) en península/Baleares; EPSG:32628 en Canarias
- **Metodología:** poligonado derivado del Mapa Forestal de España 1:25.000 + trabajo de campo;
  financiado por fondos NextGenerationEU (PRTR, C04-L01-H66)
- **Productos derivados:** `CNH21_LPEH` (todos los polígonos, solo contenido LPEH) y `CNH21_HIC`
  (solo polígonos/contenidos de interés comunitario)
- **Formatos:** distribución HTML (visor); metadatos en INSPIRE, GeoDCAT-AP, NTI-RISP
- **Ficha del catálogo:** https://iepnb.gob.es/catalogo/dataset/2a7fc624-0d69-4788-9bdd-49ee01fb1fe9
- **Aviso del propio MITECO:** "elaborada principalmente con fines estadísticos"; para HIC
  recomienda complementar con la información de las comunidades autónomas — lo que confirma
  que la solución híbrida INB + CARM 2020 que ya usa NaturDex es razonable.
- **Relación con NaturDex:** reemplazo natural del shapefile `INB_Habitat30_ETRS89_H30` que cita
  `geo/README.md`. Recomendado para re-generar `habitats.geojson` con una versión más reciente
  (2021 vs. la del INB original) y comprobar si los 4 hábitats "a revisar" (solo en CARM 2020)
  ya aparecen en la CNH21.

## 2. Inventario de Especies Silvestres: EIDOS

**Qué es:** base de datos oficial (no restringida) de especies de fauna y flora presentes en
España, construida a partir de Atlas, Libros Rojos, catálogos e inventarios del MITECO. Es la
fuente primaria equivalente a lo que NaturDex reconstruye manualmente por especie (taxonomía,
UICN, LESRPE/CEEA) a partir de fuentes dispersas (regmurcia.com, Lista Roja 2008, IUCN Red List,
Decreto 50/2003 CARM).

- **Acceso:** https://iepnb.gob.es/areas-tematicas/especies-silvestres/eidos (buscador con
  ficha individual por especie) — ficha de ejemplo:
  `/areas-tematicas/especies-silvestres/eidos/33007/alaudala-rufescens-vieillot-1819`
- **Volumen:** +75.000 registros; 12 grupos taxonómicos (Algas, Anfibios, Ascidios, Aves,
  Cromistas y Bacterias, Hongos, Invertebrados, Mamíferos, Peces, Plantas no vasculares,
  Plantas vasculares, Reptiles)
- **Campos por especie:** nombre científico + autor, sinonimia, nombre común en 7 idiomas
  (castellano, catalán, euskera, gallego, francés, inglés...), taxonomía completa (reino,
  filo/división, clase, orden, familia, género, especie), ámbito (marino/terrestre/ambos),
  origen (nativa/no nativa/indeterminado), descripción con fuente citada, y pestañas de
  Atributos, Estado de conservación, Colecciones/catálogos, Estado legal, Plan de gestión,
  Bibliografía
- **Estados de conservación por registro:** LESRPE (régimen de protección especial) + UICN
  desglosado por ámbito territorial — **Canarias, España, Península, Mundial** — exactamente
  el patrón de tres escalas (UICN / España / regional) que usa el catálogo de NaturDex
- **Normativas filtrables:** RD 139/2011 (LESRPE + Catálogo Español de Especies Amenazadas),
  Directiva 92/43/CEE (Hábitats), Directiva 2009/147/CE (Aves), RD 630/2013 (Catálogo español
  de especies exóticas invasoras, CEEEI), Reglamento (UE) 1143/2014 (especies exóticas
  invasoras preocupantes para la UE)
- **Categorías de amenaza codificadas:** LC, NT, VU, EN, CR, EW, EX, DD, NE, RE (UICN) +
  FV/U1/U2/XX (estado de conservación Directiva Hábitats)
- **Descargas por especie:** botones "Descargar ficha" y "Descargar cartografía" (distribución)
  en cada registro
- **Acceso masivo:** WMS, WFS y **API REST propia** (OpenAPI 2.0) documentada en
  https://iepnb.gob.es/recursos/servicios-interoperables/apirest-eidos
- **Ficha del catálogo:** https://iepnb.gob.es/catalogo/dataset/eidos
- **Relación con NaturDex:** fuente candidata para verificar/actualizar de forma oficial los
  ~78 registros de especie de `Database/seed.sql` (34 fauna + 44 flora), sustituyendo fuentes
  secundarias por la ficha EIDOS + su cartografía de distribución oficial.

## 3. Espacios Protegidos de la Red Natura 2000

**Qué es:** capa nacional de Zonas Especiales de Conservación (ZEC/LIC) y Zonas de Especial
Protección para las Aves (ZEPA), homóloga a `lic.geojson` y `zepa.geojson`, que NaturDex
descarga hoy del servicio ArcGIS del IMIDA/CARM (con reproyección manual desde EPSG:25830).

- **Formatos disponibles directamente:** WMS, WFS, **SHP, GeoJSON, KMZ, GML**, mapa en PDF,
  fichas HTML por ZEC/LIC y por ZEPA, diccionario de campos (XLSX), tabla resumen (XLSX), base
  de datos completa Access (CNTRYES) y una **API de "datos de alto valor" (HVD)**
- **CRS del dataset:** EPSG:3857 (pero el GeoJSON exportable puede pedirse directamente,
  sin necesidad de reproyectar como con la fuente IMIDA actual)
- **Resolución:** 1:50.000; actualización **continua**
- **Ficha del catálogo:** https://iepnb.gob.es/catalogo/dataset/dc7a3014-cd9a-51b8-ad62-7aab55afecdd
- **Relación con NaturDex:** alternativa nacional y con GeoJSON nativo a la fuente IMIDA que
  usa hoy `lic.geojson`/`zepa.geojson`; permite validar los códigos `ES6200031` (Cabo Cope),
  `ES6200012` (Calnegre) y `ES0000261` (ZEPA Almenara-Moreras-Cabo Cope) contra la fuente estatal.

## 4. Espacios Naturales Protegidos (ENP)

**Qué es:** capa nacional de todas las figuras de protección declaradas por la Ley 42/2007 y
la normativa autonómica (+45 denominaciones posibles: parques, reservas naturales, monumentos
naturales, paisajes protegidos, etc.), complementada con el CDDA de la Agencia Europea de Medio
Ambiente. Homóloga a `parque-regional.geojson`, que NaturDex también descarga hoy del IMIDA.

- **WMS estatal directo:** `https://wms.mapama.gob.es/sig/Biodiversidad/ENP/wms.aspx`
- **CRS soportados:** incluye EPSG:4326 (WGS84) nativamente, además de ED50/ETRS89/UTM en
  varios husos
- **Formatos descargables:** SHP, KMZ, GeoJSON, XML de descripción de campos
- **Actualización:** anual (revisión por altas/bajas/reclasificaciones autonómicas)
- **Ficha del catálogo:** https://iepnb.gob.es/catalogo/dataset/408ec0c0-7823-5c91-9f72-8c06e3df8b9e
- **Relación con NaturDex:** alternativa nacional al límite del Parque Regional que hoy se
  descarga del servicio ArcGIS del IMIDA; permite contrastar la superficie oficial (2.665 ha,
  Ley 4/1992) contra el registro estatal.

---

## Resumen: fuente actual de NaturDex vs. IEPNB

| Capa en NaturDex | Fuente actual | Base IEPNB equivalente | Ventaja de migrar |
|---|---|---|---|
| `habitats.geojson` (11 de 15 hábitats) | Shapefile INB suelto (`INB_Habitat30_ETRS89_H30`) | **CNH21** | Versión 2021, doble leyenda LPEH/HIC, financiada y mantenida activamente |
| `habitats.geojson` (4 hábitats "a revisar") | WFS CARM 2020 | CNH21 (a comprobar si ya los incluye) | Podría resolver las 4 pendientes de revisión |
| Estado de conservación por especie (UICN/España/Murcia) | RegMurcia, Lista Roja 2008, IUCN Red List, Decreto 50/2003 (fuentes dispersas) | **EIDOS** | Fuente única oficial, ya desglosada por Canarias/España/Península/Mundial + LESRPE/CEEA, con ficha y cartografía descargable por especie |
| `parque-regional.geojson` | ArcGIS IMIDA/CARM (EPSG:25830, reproyectado a mano) | **ENP** (WMS estatal) | EPSG:4326 nativo, sin reproyección; dato de referencia estatal |
| `lic.geojson` / `zepa.geojson` | ArcGIS IMIDA/CARM | **Red Natura 2000 (IEPNB)** | GeoJSON directo, actualización continua, ficha oficial por LIC/ZEC/ZEPA |

## Notas de acceso

- El catálogo completo es navegable/consultable por API: `https://iepnb.gob.es/catalogo/dataset`
  (parámetro `?q=` para buscar) y tiene "API Docs" propia (estilo CKAN).
- Todas las fichas de datasets incluyen metadatos INSPIRE / GeoDCAT-AP / NTI-RISP descargables,
  útiles para citar la fuente con el mismo rigor que ya usa el proyecto en `README.md`.
- Ninguno de estos recursos requiere autenticación para consulta o descarga (los enlaces
  "Explorar" abren visores o descargas directas).
