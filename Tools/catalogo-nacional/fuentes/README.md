# Fuentes descargadas — IDE del MITECO

Carpeta de **materia prima** para el rollout nacional. Los `.zip` y los shapefiles extraídos
**no se versionan** (regla en `.gitignore`); lo que sí está en el repo es `FUENTES.json`, que
registra de dónde salió cada fichero, cuándo, con qué licencia y para qué se usa.

Portal de origen: <https://www.miteco.gob.es/es/cartografia-y-sig/ide/descargas.html>

## Contenido

| Fichero | Conjunto | Tamaño | Actualización | Uso |
|---|---|---|---|---|
| `miteco-ide/enp.zip` | Espacios Naturales Protegidos | 59,6 MB | 31/12/2025 | **N1** · inventario y límite de todos los espacios |
| `miteco-ide/rn2000.zip` | Red Natura 2000 (LIC/ZEC + ZEPA) | 127 MB | 31/12/2025 | **N1** · códigos ES… por espacio |
| `miteco-ide/distribucion_habitat_utm_art17_2013_2018.zip` | Distribución HIC art.17 | 1,37 MB | 31/12/2018 | **N2** · validación de HIC presentes |
| `miteco-ide/rangos_habitat_art17_2013_2018.zip` | Rangos HIC art.17 | 14,9 MB | 31/12/2018 | **N2** · estado de conservación por región |
| `miteco-ide/riqueza-especies.zip` | Riqueza de especies (malla 10×10) | 5,31 KB | 21/12/2012 | contexto · priorización de espacios |

## Tres avisos que condicionan el uso

1. **`riqueza-especies.zip` no es el IEET por especie.** Pese a que la ficha del MITECO lo titula
   «Inventario Español de Especies Terrestres», la descarga son 5 KB con el *número* de especies
   por cuadrícula, congelado en 2012. La distribución especie a especie sigue viniendo de **EIDOS
   (IEPNB)** y **GBIF**, como ya hace la CAPA 3 del pipeline. No usar como fuente de presencia.

2. **Red Natura 2000 va un año por detrás de su fecha de publicación.** La ficha se actualiza a
   31/12/2025 pero el contenido es el remitido a la Comisión Europea hasta **diciembre de 2024**, y
   los LIC solo son oficiales cuando la Comisión aprueba las listas biogeográficas. Esa salvedad
   debe quedar escrita en el `boundaryNote` de cada `park.json`.

3. **Hábitat art.17 es malla 10×10 km, no polígono.** No sustituye a la cartografía provincial
   `DirectivaHabitat<NN>` que usa `build-habitats.js` para recortar hábitats al límite del parque.
   Sirve para **validar** qué HIC están declarados presentes en el periodo vigente (2013-2018)
   frente a la cartografía de 1997 que usa hoy el piloto.

## Otros dos manifiestos en esta carpeta

- **`habitat-provincias.json`** — las **50 provincias** de la cartografía de Hábitats de Interés
  Comunitario (Directiva 92/43/CEE, 1997), con la URL literal del shapefile y de su tabla de
  atributos para cada una. Es la fuente que consume `build-habitats.js`, y la que hace falta para
  hacer los polígonos de hábitats de cualquier parque de España. Las URL llevan sufijos opacos
  `_tcm30-NNNNNN` que **no son derivables con seguridad**: están copiados literalmente de las dos
  páginas de descarga del MITECO.

- **`iepnb-api.json`** — la **API PostgREST del IEPNB**, sin autenticación ni clave, que sirve la
  Lista Patrón de las especies silvestres de España en JSON. Cuatro vistas: base, sinonimias,
  normativa y pasarelas de códigos. Incluye también la ficha de la **Lista Roja de la UICN**
  (<https://www.iucnredlist.org/>) como fuente externa enlazada.

### Estado legal y estado UICN son campos distintos

Conviene no mezclarlos, porque el catálogo lo hacía. El **IEPNB** da el estado **legal** (LESRPE,
CEEA, catálogos autonómicos) y alimenta `spainStatus` y `murciaStatus`. La **UICN** da una
evaluación **científica y mundial**, y alimenta solo `iucnGlobal`. Una especie puede ser Vulnerable
para la UICN sin tener ninguna figura legal en España — el esparto (*Stipa tenacissima*) es
exactamente ese caso.

El puente entre ambas es el campo **«Código UICN»** de `v_listapatronespecie_codigos`: es el
identificador del *assessment*, así que dice si una especie está evaluada sin buscarla por nombre.
Ojo: la URL directa `/species/<id>` no resuelve (hacen falta taxonid **y** assessmentid), y la web
es una SPA, así que hay que consultarla con un navegador que ejecute JavaScript.

### Por qué la API cambia el trabajo de catálogo

Hasta ahora las fichas de especie se construían a mano desde bibliografía. Con
`v_listapatronespecie_normas` el estado de conservación sale **con la norma citada literalmente**
(nombre de la disposición, categoría, ámbito UE/estatal/autonómico y año), que es exactamente lo
que piden los campos `spainStatus` y el estado regional. Y `v_listapatronespecie_sinonimos`
resuelve de oficio varias de las dudas que el README del piloto deja abiertas a mano — entre ellas
*Rhamnus hispanorum* ↔ *R. lycioides* subsp. *borgiae* y *Sylvia* ↔ *Curruca*.

La clave estable es **`idtaxon`**, y conviene que sea la clave primaria del catálogo nacional.

## Hábitats: la cartografía de 1997 es la vigente

Merece corrección explícita porque `Tools/catalogo-nacional/README.md` dice otra cosa. El MITECO
declara en su página del Inventario Español de Hábitats Terrestres que, **hasta que exista** la
cartografía de ese inventario, lo publicado es la de los HIC del Anexo I **en su actualización de
1997**. No hay sucesora nacional: la "CNH21 (2021)" que menciona el README del catálogo no es la
fuente estatal vigente. El complemento oficial es el *Atlas y Manual de los Hábitats Naturales y
Seminaturales de España* (2005), cuyo PDF ya está en `Docs/`.

## El endpoint del IDE está muerto — usar el del BDN

Comprobado el 2026-07-25: los enlaces que publica la página de descargas del **IDE**
(`https://www.mapama.gob.es/app/descargas/descargafichero.aspx?f=<algo>.zip`) devuelven **HTTP
404** para todos los conjuntos. La página sigue online y los enlaces siguen visibles, pero no
sirven ningún fichero.

Las URLs válidas están en las páginas de descarga del **Banco de Datos de la Naturaleza (BDN)**,
bajo `/content/dam/`. Todas verificadas con HTTP 200 y su tamaño real:

| Conjunto | Formato | Tamaño real |
|---|---|---|
| ENP | GeoJSON | 63,3 MB |
| ENP | SHP | 52,3 MB |
| Red Natura 2000 | GeoJSON | 185,8 MB |
| Red Natura 2000 | SHP | 126,3 MB |

**Preferir el GeoJSON**, pero **no porque evite reproyectar** — eso era un error. Comprobado al
inspeccionar los ficheros: el MITECO publica el GeoJSON **proyectado en UTM** (EPSG:25830 en
península y Baleares, EPSG:32628 en Canarias), declarado en el miembro `crs`. Sigue haciendo falta
`utmToLonLat()`. La ventaja real es que no hay que parsear el binario del shapefile ni su `.dbf`, y
que el huso viene declarado en el propio fichero en vez de haber que deducirlo del `.prj`.

Cada conjunto viene **partido en dos ficheros**: península+Baleares y Canarias, cada uno con su
huso. Hay que procesar los dos.

Inventario completo de esquemas y contenido: `Tools/catalogo-nacional/out/inventario-fuentes-bdn.md`.
Se genera con `inspect-geojson.js`, que lee por streaming (870 MB en ~5 s) porque el mayor de los
ficheros pesa 620 MB y viene en una sola línea: un `JSON.parse` lo reventaría.

### Dos correcciones de metadatos

La ficha del BDN es más reciente que la del IDE y las cifras no coinciden. Prevalece el BDN:

- **Red Natura 2000**: escala **1:25.000** (no 1:50.000) y contenido de **diciembre de 2025**,
  remitido a la Comisión Europea en febrero de 2026 (no diciembre de 2024).
- **ENP**: proyección declarada **EPSG:25830** en península y Baleares, **EPSG:32628** en Canarias.

### Cifras oficiales útiles para el rollout

La página del ENP publica el recuento a diciembre de 2025: **1.785 espacios** en España, 7.256.462
ha terrestres, el **14,33 %** del territorio. La **Región de Murcia tiene 21 espacios** — de los que
NaturDex lleva 2.

## Reponer las descargas

Los ficheros no están en el repo. Para volver a tenerlos, descargar cada `descarga` de
`FUENTES.json` a la ruta indicada en su campo `fichero`. Todas las URL son públicas y sin registro.

## Atribución obligatoria

> Fuente: «© Ministerio para la Transición Ecológica y el Reto Demográfico».

Debe aparecer en cualquier dato derivado que se publique (campo `source` / `fuente` de los
GeoJSON y de las fichas, igual que ya se hace con IMIDA/CARM y OpenStreetMap).
