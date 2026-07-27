# Inventario de las fuentes descargadas del BDN

**Fecha:** 2026-07-27 · **Script:** `Tools/catalogo-nacional/fuentes/inspect-geojson.js`
**Origen:** Banco de Datos de la Naturaleza (MITECO), páginas de descarga de ENP y Red Natura 2000.

> Fuente: «© Ministerio para la Transición Ecológica y el Reto Demográfico».

---

## Qué hay descargado

| Fichero | Tamaño | Features | CRS |
|---|---|---|---|
| `Enp2025_geojson/Enp2025_p.json` | 189,9 MB | **1.638** | EPSG:25830 |
| `Enp2025_geojson/Enp2025_c.json` | 16,9 MB | **147** | EPSG:32628 |
| `n2000_2025_GeoJson/n2000_spatial_es_pibal_proy_end25.geojson` | 590,9 MB | **1.639** | EPSG:25830 |
| `n2000_2025_GeoJson/n2000_spatial_es_can_proy_end25.geojson` | 72,9 MB | **226** | EPSG:32628 |
| `enp_dd_2025.xlsx` · `rn2000-dd.xlsx` | 0,2 MB | — | diccionarios de datos |

**ENP: 1.785 features**, que es exactamente lo que declara la tabla oficial. **Red Natura 2000:
1.865 sitios.**

> **Corregido el 2026-07-27.** Estas cifras estaban una unidad alta en cada fichero (1.639 / 148 /
> 1.640 / 227, total 1.787 ENP), y de ahí salía una diferencia de 2 respecto al dato oficial que se
> atribuyó a Picos de Europa y Guadarrama. No había tal diferencia: `inspect-geojson.js` localiza
> los features buscando la cadena `"properties"`, y **el bloque `crs` de la cabecera también la
> contiene**, así que cuenta uno de más por fichero. Recontado troceando el array `features`
> (mismo lector que usa `build-n1-espacios.js`). El reparto por comunidad no se ve afectado:
> Murcia sigue siendo 21.

## Corrección: el GeoJSON NO evita reproyectar

Lo di por hecho al elegir el formato y es falso. Pese a que la especificación GeoJSON exige WGS84,
el MITECO lo publica **proyectado en UTM** y lo declara en el miembro `crs`:

- **EPSG:25830** (ETRS89 / UTM 30N) — península y Baleares
- **EPSG:32628** (WGS84 / UTM 28N) — Canarias

Sigue haciendo falta `utmToLonLat()` de `lib/shapefile.js`, solo que aplicado a coordenadas leídas
del JSON en vez del `.shp`. La ventaja real del GeoJSON es otra: **no hay que parsear el formato
binario shapefile ni el `.dbf`**, y el huso viene declarado en el propio fichero en lugar de haber
que deducirlo del `.prj`.

## Esquemas

### ENP — 11 campos

| Campo | Uso en NaturDex |
|---|---|
| `SITE_NAME` | → `park.json.name`, literal |
| `ODESIGNATE` | → `park.json.category`, literal (**42 figuras** distintas en península, 8 en Canarias) |
| `SITE_CODE_` | código oficial ENP (`ES` + NUTS2 + secuencial) → `boundaryNote` |
| `NUT2` | comunidad autónoma en código NUTS2 numérico → carpeta de provincia |
| `Sup_ha` | superficie oficial en hectáreas |
| `SITE_CDDA` | identificador en la base europea CDDA |
| `DESIG_ABBR` | abreviatura de la figura (`ES19`, `ES16`…), 1:1 con `ODESIGNATE` |
| `FID`, `Shape_Leng`, `Shape_Area` | internos de ArcGIS, ignorar |

`NUT2` es la clave para trocear por comunidad. Reparto de los 1.638 registros peninsulares:
Andalucía (61) 365 · Cataluña (51) 285 · Comunitat Valenciana (52) 306 · Castilla y León (41) 31 ·
Castilla-La Mancha (42) 114 · Galicia (11) 98 · Extremadura (43) 88 · Aragón (24) 25 ·
**Región de Murcia (62) 21** · Navarra (22) 125 · País Vasco (21) 43 · La Rioja (23) 14 ·
Madrid (30) 8 · Asturias (12) 53 · Cantabria (13) 38 · Illes Balears (53) 20 · Ceuta (63)/Melilla —
· AGE marino (80/90) 4.

### Red Natura 2000 — 5 campos

| Campo | Uso |
|---|---|
| `site_code` | código `ES…` → `geo/lic.geojson` y `geo/zepa.geojson` |
| `SITE_NAME` | nombre oficial del sitio |
| `TIPO` | **A = ZEPA · B = LIC/ZEC · C = ambas** — es el campo que separa las dos capas |
| `HECTAREAS` | superficie oficial |
| `AC` | administración competente |

Reparto peninsular: 1.036 tipo B, 342 tipo A, resto tipo C.

---

## Los 21 espacios de la Región de Murcia

NaturDex tiene 2. Quedan **19 por dar de alta** en N1.

| Código ENP | Figura | Espacio | Sup. (ha) | En NaturDex |
|---|---|---|---|---|
| ES620007 | Parque Regional | Cabo Cope y Puntas de Calnegre | 2.665,7 | **sí (N2)** |
| ES620004 | Paisaje Protegido | Cuatro Calas | 221,0 | **sí (N1)** |
| ES620013 | Parque Regional | Sierra Espuña | 17.693,2 | — |
| ES620008 | Parque Regional | Carrascoy y El Valle | 16.685,8 | — |
| ES620018 | Parque Regional | Sierra de la Pila | 8.851,0 | — |
| ES620017 | Parque Regional | Sierra de El Carche | 5.869,1 | — |
| ES620011 | Parque Regional | Calblanque, Monte de las Cenizas y Peña del Águila | 2.466,3 | — |
| ES620012 | Parque Regional | Salinas y Arenales de San Pedro del Pinatar | 850,5 | — |
| ES620027 | Paisaje Protegido | Sierra de Salinas | 2.395,4 | — |
| ES620010 | Paisaje Protegido | Barrancos de Gebas | 1.908,8 | — |
| ES620005 | Paisaje Protegido | Sierra de las Moreras | 1.712,6 | — |
| ES620016 | Paisaje Protegido | Humedal del Ajauque y Rambla Salada | 1.621,9 | — |
| ES620015 | Paisaje Protegido | Espacios Abiertos e Islas del Mar Menor | 1.307,4 | — |
| ES620022 | Paisaje Protegido | Cabezo Gordo | 271,8 | — |
| ES620023 | Paisaje Protegido | Islas e Islotes del Litoral Mediterráneo | 39,5 | — |
| ES620009 | Reserva Natural | Sotos y bosques de ribera de Cañaverosa | 248,8 | — |
| ES620020 | Monumento Natural | Monte Arabí | 582,4 | — |
| ES620024 | Monumento Natural | Sima de la Higuera | 49,0 | — |
| ES620025 | Monumento Natural | Capa Negra de Caravaca de la Cruz | 24,0 | — |
| ES620021 | Monumento Natural | Gredas de Bolnuevo | 2,4 | — |
| ES620026 | Monumento Natural | Salto del Usero | 1,7 | — |

## Verificación de los datos del piloto

Las cifras del catálogo cuadran con las oficiales:

| Dato | NaturDex | Oficial BDN |
|---|---|---|
| Parque Regional Cabo Cope | 2.665 ha | ES620007 · **2.665,7 ha** ✓ |
| LIC ES6200031 Cabo Cope | 240 ha | TIPO B · **240,1 ha** ✓ |
| LIC ES6200012 Calnegre | 781 ha | TIPO B · **780,9 ha** ✓ |
| ZEPA ES0000261 Almenara-Moreras-Cabo Cope | 22.201 ha | TIPO A · **22.201,2 ha** ✓ |

## Dos cosas arregladas (2026-07-27)

1. **`boundaryNote` de cabo-cope estaba obsoleto.** Decía «Límite aproximado dibujado a partir de
   referencias textuales… trazado provisional», cuando la geometría ya era la oficial del
   IMIDA/CARM. Reescrito con el código **ES620007** (CDDA 196276) y la superficie oficial.

   El contraste dio un resultado que zanja la duda: la superficie del IMIDA (2.665,67714849 ha) y
   la del MITECO (2.665,67714806 ha) **coinciden hasta el sexto decimal**. Las dos fuentes sirven
   la misma geometría oficial, así que el límite del piloto es correcto.

2. **`cuatro-calas` citaba un identificador interno como si fuera el código oficial.** `ENP000007`
   es del IMIDA; el oficial del MITECO es **ES620004** (CDDA 349352). Ahora constan ambos.

   Aquí las superficies **no** coinciden: MITECO 220,99 ha frente a IMIDA 221,68 ha, un 0,3 % de
   diferencia por distinta generalización de la geometría. Se conserva la del IMIDA por ser más
   detallada, y la discrepancia queda anotada en el propio `boundaryNote`.

## Reproducir

```
node Tools/catalogo-nacional/fuentes/inspect-geojson.js
node Tools/catalogo-nacional/fuentes/inspect-geojson.js --campo ODESIGNATE
node Tools/catalogo-nacional/fuentes/inspect-geojson.js --grep '"NUT2":62'
```

Lee por streaming: los 870 MB se recorren en unos 5 segundos sin cargar nada en memoria.
