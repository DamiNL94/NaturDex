# Fusión de la cartografía de hábitats: HIC 1997 + Atlas 2005

**Decisión:** fusionar ambas fuentes y **marcar dentro del Atlas 2005 qué recintos son Hábitat de
Interés Comunitario**, en vez de sustituir una por otra.

**Resultado de la inspección (2026-07-27): no hace falta fusión geométrica.** El Atlas 2005 ya trae
el código HIC en su tabla de relación, así que es un **superconjunto** del que la cartografía de
1997 es el subconjunto comunitario. Marcar los HIC es un campo, no un cruce de polígonos.

Datos inspeccionados: los 104 ficheros descargados en
`fuentes/miteco-ide/atlas-2005/` (1,8 GB extraídos). Análisis sobre la provincia 30 (Murcia).

---

## Modelo de datos del Atlas 2005

Dos ficheros por provincia, unidos por **`HAB_LAY`** (no por `CODIGO`, como en 1997).
Comprobado en Murcia: **todos** los recintos del shapefile casan con la tabla.

### `INB_Habitat<NN>_ETRS89_H30.shp` — geometría (2.760 recintos en Murcia)

`HAB_LAY` · `PROV_INB_H` · `NUTS_INB_H` · `PROV_N_INB` · `CCAA_INB_H` · `CCAA_N_INB` · `Shape_Leng` · `Shape_Area`

### `Datos<NN>.dbf` — hábitats por recinto (8.923 filas en Murcia)

Un recinto tiene **varias filas**: es un mosaico, igual que en 1997.

| Campo | Qué es | Uso |
|---|---|---|
| `HAB_LAY` | clave de unión con el shapefile | join |
| **`CODUE`** | **código HIC de la Directiva** — vacío si el hábitat no es comunitario | `hic` + `esHIC` |
| **`PRIORITARI`** | `*` prioritario · `Np` no prioritario · vacío en seminaturales | `prioritario` |
| `CODHAB` | código del hábitat en la clasificación española | trazabilidad |
| `NOM_COMUN` | **nombre común en español** («Espartales manchegos sudorientales») | nombre para la app |
| `GENERICO` | tipo genérico («Espartales», «Albardinares», «Carrizales») | agrupación/filtro |
| `DESCRIPCIO` | descripción oficial del HIC | ficha de hábitat |
| `ALIANZA` | alianza fitosociológica | trazabilidad científica |
| **`SPSALIANZA`** | **lista de especies características de la alianza** | CAPA 3 |
| `NOM_HABITA` | asociación fitosociológica completa | trazabilidad |
| `NATURALIDA` | índice de naturalidad, 0 a 3 | posible filtro |
| `PORCENTAJE` | % del recinto que ocupa ese hábitat | ponderar el mosaico |

## Cifras de Murcia

| | |
|---|---|
| Recintos | 2.760 |
| Filas de hábitat | 8.923 |
| Filas **con** código HIC | 6.933 (77,7 %) |
| Recintos con al menos un HIC | 2.599 de 2.697 (**96,4 %**) |
| Recintos solo seminaturales | 98 |
| Códigos HIC distintos | 45 |
| Filas prioritarias (`*`) | 2.209 |

Los genéricos seminaturales más frecuentes: **Espartales** (1.130), Albardinares (149), Cerrillares
(140), Orgazales (127), Carrizales (92), Bolinares (86), Fenalares (47). Hay 64 filas con
«Ningún hábitat conocido».

## El cambio de codificación: 1997 usa subtipos españoles, el Atlas usa códigos UE

**Los 45 códigos del Atlas tienen exactamente 4 dígitos.** Los de 1997 no: usan subtipos propios.
Al comparar con la salida del piloto aparecen tres HIC de 1997 que el Atlas no tiene en Murcia:

| 1997 | Atlas 2005 | Lectura |
|---|---|---|
| `8211` | **`8210`** | subtipo español → código UE |
| `5334` | **`5330`** | subtipo español → código UE |
| `8230` | *(no existe en Murcia)* | ver abajo |

**`8230` merece atención.** `Docs/rollout/ESTADO.md` ya lo dejó anotado como caso dudoso: «8230 se
queda literal, sin reconciliar. Su asociación es *Hypericion ericoidis*, la misma por la que el
piloto se reconcilió a 8210». El Atlas 2005 **no registra 8230 en toda la provincia**, lo que apoya
que la asignación de 1997 era errónea y que el hábitat real es 8210. La fuente nueva resuelve una
duda que la vieja dejaba abierta.

> Esto **no** es una pérdida de dato: es una corrección de codificación. Pero hay que aplicarla
> conscientemente y dejarla escrita en la regresión, no dejar que desaparezca sin más.

## Los husos: dos, no cincuenta

Diferencia importante con 1997, donde el huso es propio de cada provincia:

| Provincias | CRS | EPSG |
|---|---|---|
| Las 50 peninsulares y baleares | ETRS89 UTM **30N** | 25830 |
| 35 Las Palmas y 38 S. C. de Tenerife | WGS84 UTM **28N** | 32628 |

Verificado leyendo los 52 `.prj`. El nombre de fichero lo anuncia (`_ETRS89_H30`), pero **se lee del
`.prj`, no del nombre**. Esto simplifica mucho el pipeline: `--zone` deja de ser un parámetro por
provincia y pasa a ser 30 salvo Canarias.

## Diseño de la salida

`build-habitats.js` pasa a leer el Atlas y cada hábitat del mosaico sale así:

```json
{
  "hic": "5220",
  "esHIC": true,
  "prioritario": false,
  "codhab": "30909C",
  "nombreComun": "Aulagares mesomediterráneos manchego-sucrenses de Genista pumila",
  "generico": "Aulagares",
  "descripcion": "Brezales oromediterráneos endémicos con aliaga",
  "alianza": "Sideritido incanae-Salvion lavandulifoliae ...",
  "naturalidad": 2,
  "porcentaje": 15,
  "fuente": "atlas2005"
}
```

Con `hic: null` y `esHIC: false` en los seminaturales.

## Lo que hay que vigilar al implementar

1. **`hic-nombres.json` deja de ser imprescindible**: el Atlas trae `NOM_COMUN` y `DESCRIPCIO` por
   recinto. Conviene conservarlo como respaldo y para no romper `merge-habitats.js`, pero la
   nomenclatura buena pasa a ser la del Atlas — y **cubre también los seminaturales**, que
   `hic-nombres.json` no puede nombrar.

2. **`hic-prioritarios.json` sigue mandando.** El Atlas trae `PRIORITARI` por fila, pero la lógica
   actual asigna la prioridad desde ese fichero. Hay que contrastar ambos antes de fiarse: si
   discrepan, el Anexo I de la Directiva es la referencia.

3. **Un recinto seminatural nunca es prioritario.** `PRIORITARI` viene vacío en esas filas: se
   traduce a `false`, no a «desconocido».

4. **`SPSALIANZA` es material para la CAPA 3.** Es la lista de especies características por alianza,
   estructurada. Hoy esa información se saca del PDF del Atlas (`Docs/Atlas y Manual de los Habitat
   de Espana.pdf`) vía `atlas-hic-especies.js`. Merece revisarse si conviene sustituir esa vía.

5. **No pisar el `habitats.geojson` curado del piloto** sin comparar antes: son 15 hábitats
   revisados a mano.

## Regresión ejecutada (2026-07-27) — resultado

`build-habitats.js` ya lee ambas fuentes y **autodetecta** cuál es por los campos de la tabla.
Reconstruidos los dos parques con el Atlas y comparados con la salida de 1997:

| | Cabo Cope | Sierra Espuña |
|---|---|---|
| Recintos | 28 → **38** (+10) | 52 → **53** (+1) |
| Hectáreas cubiertas | 548,2 → **1.410,8** (**+157 %**) | 15.477,3 → **16.067,5** (+3,8 %) |
| HIC (normalizados) | 12 → **13** | 14 → 13 |
| Ganados | **1510, 9560** | — |
| Perdidos | **8230** | **8230** |
| Seminaturales nuevos | Espartales, Bolinares, Albardinares | Espartales, Carrizales, Cerrillares, Cesquerales |

En Cabo Cope la cobertura pasa del **21 % al 53 %** de las 2.665 ha del parque. Es el cambio de más
peso de toda la operación.

Los dos HIC ganados en Cabo Cope, **1510 (Estepas salinas mediterráneas)** y **9560 (Bosques
endémicos de *Juniperus* spp.)**, son **hábitats prioritarios** del Anexo I que la cartografía de
1997 no recogía en ese espacio.

### La equivalencia de códigos es una regla, no tres casos sueltos

Al ampliar a Sierra Espuña aparecieron más subtipos (`5335`, `9561`, `6175`) y con ellos el patrón:

> **El subtipo español de 1997 comparte los tres primeros dígitos con el código UE, que siempre
> termina en 0.**
> `8211→8210` · `5334`/`5335`→`5330` · `9561→9560` · `6175→6170`

Normalizando con esa regla, **el único HIC realmente perdido en los dos parques es `8230`** — el que
`ESTADO.md` ya tenía marcado como dudoso y que el Atlas no registra en toda la provincia de Murcia.
Todo lo demás que parecía pérdida era el mismo hábitat con otro código.

### Compatibilidad con el resto del pipeline

`merge-habitats.js` funciona **sin modificarlo**: solo consume `h.hic` y `h.concepto`, y ambos se
siguen emitiendo (`concepto` sale ahora de `NOM_HABITA`). Ejecutado sobre la salida del Atlas,
reconoce correctamente los hábitats curados, enriquece los existentes y marca **9560 como añadido y
prioritario**.

## Cambios aplicados a `build-habitats.js`

- **Autodetección de fuente** por los campos de la tabla (`CODUE`+`HAB_LAY` → atlas2005;
  `CODIGO_UE`+`CODIGO` → hic1997). `--fuente` la fuerza si hace falta.
- **El huso UTM se lee del `.prj`**, ya no se asume ni se pasa a mano. `--zone` queda como anulación.
- `--datos` sustituye a `--habi`, que sigue funcionando como alias.
- Nuevas propiedades por recinto: `esHIC`, `n_hic`, `prioritario_fuente` (antes `prioritario_1997`),
  `fuenteId`.
- Nuevos campos por hábitat en la fuente Atlas: `esHIC`, `nombre_comun`, `generico`, `descripcion`,
  `alianza`, `especies_alianza`, `naturalidad`, y `cobertura` desde `PORCENTAJE`.
- El **hábitat dominante** se elige entre los que son HIC; solo si no hay ninguno se toma el de mayor
  cobertura. Antes podía quedar dominante un seminatural y ocultar el comunitario.
- El resumen distingue HIC de seminaturales en vez de mezclarlos bajo «(sin HIC)».

## Atribución

> Fuente: «© Ministerio para la Transición Ecológica y el Reto Demográfico».
