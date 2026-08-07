# Fase 3 (N3) de Cuatro Calas y Sierra Espuña — la cascada, recorrida

> Segunda sesión de N3, **2026-08-07**. Sigue el §4 de `Docs/prompts/e-rollout-nacional.md`.
> **Ninguno de los dos espacios sube de nivel todavía**: esto es el paso 2 del §4.5 —la tabla de
> candidatos— y está **a la espera del visto bueno**. Nadie ha tocado `park.json`.
>
> La sesión anterior (§"2026-08-07" de `ESTADO.md`) dejó la cascada a medias porque el entorno no
> tenía salida a las fuentes. Aquí la red **sí** está abierta, y eso cambia el resultado de las
> fuentes 2, 3, 4 y 6. La 1 sigue sin poder leerse, pero por otro motivo y con otro alcance.

---

## 1. El entorno de esta sesión, que condiciona lo que se puede afirmar

| | |
|---|---|
| Red | **Abierta** a Overpass, IGME, Wikimedia y Nominatim. Se ha leído de primera mano |
| BORM y CARM | **Cerrados por protección anti-bot** (Radware / `validate.perfdrive.com`). Ver §2 |
| Node.js | **No instalado en esta máquina.** `npm run …` no existe aquí |

**Node no está.** Eso significa que en esta sesión **no se ha podido ejecutar ninguna herramienta del
repo**: ni `red:check`, ni `pois:build`, ni `validate`, ni `images:pois`. Es la inversa exacta de la
sesión anterior, que tenía Node pero no red.

El recorte por polígono —lo que hace `build-park-pois.js` con el §4.3.3— se ha rehecho a mano con un
script de PowerShell equivalente (ray casting sobre el `MultiPolygon` de `geo/parque.geojson`, con
huecos, y distancia mínima al borde para el margen de ~50 m). **Se ha validado contra la salida ya
existente de la herramienta** con cuatro puntos de control por espacio, y coincide en los ocho:

| Punto de control | Esperado (informe del basemap) | Obtenido |
|---|---|---|
| Torre del Azaraque | dentro | MARGEN (14,6 m) |
| Ermita de San José | fuera | FUERA (142 m) |
| Castillo de Aledo | fuera | FUERA (1.438 m) |
| Centro de Visitantes Codorníu | dentro | DENTRO |
| Playa de Calarreona | dentro | DENTRO (55,5 m del borde) |
| Cala de las Tortugas | fuera | FUERA (407 m) |
| Islote Cama de Los Novios | fuera | FUERA (253 m) |

El script está en el scratchpad de la sesión, **no en el repo**: es un apaño para no perder la
sesión, no una herramienta. Lo que manda sigue siendo `build-park-pois.js`, y **antes del alta hay
que reejecutarlo en una máquina con Node** para que las coordenadas de aquí queden confirmadas por la
herramienta de verdad.

---

## 2. Fuente 1 (PORN/PRUG): por qué sigue sin leerse, y qué sí se ha averiguado

La sesión anterior apostaba a que el **anexo de valores del PRUG** convertiría de golpe los 71 picos
y 28 collados en candidatos con hecho detrás. **Esa apuesta sigue sin resolverse**, pero ya no está
donde se creía:

- El **Decreto 6/2026, de 12 de febrero** (BORM supl. nº 1 del nº 52) **sí se ha leído**, en su
  endpoint de texto. Su articulado enumera sus anexos: **Anexo I** PRUG de Sierra Espuña, **Anexo II**
  plan de gestión de Barrancos de Gebas, **Anexo III** plan de gestión de la ZEPA del Llano de las
  Cabras, y dentro del I dos apéndices, que son **planes de recuperación de dos plantas**
  (*Fumana fontanesii* y *Erica erigena*). **No aparece ningún «anexo de valores»** en esa estructura.
- Pero el texto servido por ese endpoint **es solo el articulado del decreto: el Anexo I no viene**.
  Comprobado con dos consultas distintas. O sea: la estructura de anexos no promete un catálogo de
  topónimos, pero **el cuerpo del PRUG sigue sin leerse**.
- El PDF completo (**~65 MB**, con cartografía) se descargó parcialmente y quedó truncado; al
  reintentarlo, **BORM levantó un captcha de Radware**. `murcianatural.carm.es`, que aloja el PORN de
  1995 y los anexos del PRUG en ficheros sueltos (se ha visto citado
  `07_Anexo_I_PRUG_ESPUÑA_Anexo_4_Zonificacion.pdf`), **redirige al mismo verificador anti-bot**.

**No se ha intentado sortear esa verificación**, y no debe intentarse. La vía limpia es descargar el
PDF a mano desde un navegador, dejarlo en el repo y leerlo con `pdftotext -layout`, que es como ya se
extrajo el Atlas de Hábitats (§"Sierra Espuña: Fase 2 cerrada"). **Es la única tarea de fuente que
queda pendiente en los dos espacios.**

> Nota aparte, fuera del alcance de N3 pero conviene no perderla: existe una **Ley 1/2026, de 2 de
> marzo, de modificación de los límites del Parque Regional de Sierra Espuña**. Si esa ley mueve el
> límite, afecta al `parque.geojson` y por tanto al recorte de POIs, senderos y hábitats. **Sin
> comprobar.**

---

## 3. Lo que dio cada fuente, ahora

| Fuente | Cuatro Calas | Sierra Espuña |
|---|---|---|
| 1 · PORN/PRUG | **No hay PORN aprobado** (Ley 4/1992, sin plan propio) | PRUG aprobado (Decreto 6/2026). **Anexo I sin leer** — §2 |
| 2 · IELIG | **2 LIG oficiales dentro del límite**: `BE005` y `BE006` | **Cero LIG.** Consultado el servicio del IGME: 0 polígonos y 0 puntos |
| 3 · BIC | Nada dentro del límite | **2 confirmados** con su norma: Pozos de la Nieve y Santuario de Santa Eulalia |
| 4 · OSM (Overpass) | 31 elementos; **9 dentro o en el margen**, 3 nuevos respecto al basemap | 136 elementos; **89 dentro o en el margen**, con los 28 pozos uno a uno |
| 6 · Commons | **10 archivos** de la Cala de los Cocederos | 1 archivo de los Pozos de la Nieve |

### Corrección a lo que quedó escrito el 2026-08-07 (sesión anterior)

El ledger registra, para Cuatro Calas, un LIG **«La Carolina (Punta Parda)», afloramiento
volcánico**. Ese dato venía de un resumen de buscador, no del IGME. Consultado el **IELIG de verdad**
(servicio ArcGIS del IGME, capas 0 y 1), lo que hay es:

- **`BE006` · «Vulcanismo de La Carolina»** — el afloramiento volcánico existe y el nombre iba bien
  encaminado, pero **su denominación oficial es otra** y Punta Parda no forma parte de ella.
- **`BE005` · «Playa de Cuatro Calas»** — **este se le escapó entero a la sesión anterior**, y es el
  más rico de los dos: interés geomorfológico, estratigráfico, paleontológico, tectónico y
  sedimentológico.

Y para **Sierra Espuña**, donde el ledger decía «interés geomorfológico documentado, sin ficha LIG
con código confirmada»: ahora se puede afirmar en firme que **no hay ningún LIG del IELIG dentro del
espacio**. Es un «no hay» de primera mano, no una ausencia de búsqueda.

---

## 4. Cuatro Calas — tabla de candidatos (§4.5 paso 2)

Coordenada en el orden de `park.json` (`[lat, lon]`).

| # | Nombre propuesto | `type` | Coordenada · de dónde sale | Fuente del **hecho** | `approx` | Qué se contaría |
|---|---|---|---|---|---|---|
| 1 | **Vulcanismo de La Carolina** | `Geológico` | `37.374485, -1.627156` — punto oficial del IELIG | IELIG/IGME **`BE006`**. Interés principal petrológico-geoquímico; secundario estratigráfico y geomorfológico | **no** — es la coordenada de la propia ficha | Un afloramiento volcánico que **no está interestratificado**: su contacto con los materiales sedimentarios mio-pliocenos aparece verticalizado. Es la razón de que el tramo tenga las tintas oscuras que lo separan de las margas amarillas de al lado |
| 2 | **Playa de los Cocedores** | `Cultural` | `37.374916, -1.629774` — OSM `way/1459077450` | Los **depósitos excavados en el acantilado** para cocer esparto, documentados en 10 fotos de Commons (§6). Falta cita documental | **no** | Las balsas y cuevas excavadas en la marga donde se maceraba el esparto antes de majarlo. El topónimo *cocedero* es literal: el sitio dice a qué se dedicaba |
| 3 | **Playa de Cuatro Calas** (LIG) | `Geológico` | `37.377857, -1.628044` — punto oficial del IELIG | IELIG/IGME **`BE005`**. Geomorfológico + estratigráfico, paleontológico, tectónico y sedimentológico | **sí** — el punto representa un tramo de costa, no un afloramiento puntual | Conglomerados horizontales muy fracturados de la Unidad Superior; hacia poniente, areniscas calcáreas limosas **con fauna** — de ahí el interés paleontológico |
| 4 | **Playa de Calarreona** | `Acceso` | `37.383513, -1.621103` — basemap/OSM | Arranque señalizado del **SL-MU 18** | **no** | Puerta de entrada por el norte y cabecera del sendero local |

**Decisión que te toca a ti — el nº 3.** Su denominación oficial (*«Playa de Cuatro Calas»*) es
prácticamente **el nombre del propio espacio protegido**, y el §4.1 dice que el espacio entero no es
un POI. Defendible en los dos sentidos: es un LIG con código, pero como chincheta puede leerse como
«aquí está el parque». **Mi recomendación: entra**, porque lo que se cuenta es un afloramiento
concreto y no el espacio, pero conviene renombrarlo en la ficha (p. ej. *«Conglomerados de Cuatro
Calas»*) dejando el nombre oficial y el código en `source`.

### Cuatro Calas — lo que se cae

| Nombre | Regla | Detalle |
|---|---|---|
| **Playa de la Higuerica** | §4.1 | Era «el más flojo» ya en la sesión anterior y ahora se queda sin sitio: el hecho geológico que podía sostenerlo es el `BE005`, que está a 200 m y entra por su cuenta. Sin fuente propia, es topónimo suelto |
| **Punta Parda** | — | Desaparece como candidato independiente: el LIG que se le atribuía es el `BE006` y no la nombra. Sobrevive como **referencia dentro de la descripción** del nº 2 (Commons: *«Punta Parda, lado norte de la Cala de los Cocederos»*) |
| Mirador sin nombre (`node/5323285921`) | §4.1 | `tourism=viewpoint` **dentro** del límite y sin `name` en OSM. Sin nombre y sin hecho no entra; **merece una comprobación en campo**, puede ser un mirador real sin mapear |
| Cañada Brusca | §4.1 | Sin cambios: su saladar es Capa 2 (HIC 1430, 5330, 5220) |
| Cala de las Tortugas · Islote Cama de Los Novios | §4.3.3 / §4.3.5 | Fuera del polígono; el islote además es marino |

### Cuatro Calas — los dos que siguen sin situar

- **Antiguo cuartel de Carabineros de Calarreona**
- **Duna fósil entre La Carolina y Los Cocedores**

Barrido Overpass completo del bbox con `historic=*`, `man_made=*` y `natural=*`: **ninguno de los dos
está en OSM**. Ya no es «falta consultar Overpass», es **«OSM no los tiene»**. Salen por fuente
documental o por campo, no por consulta.

> **Trampa de nombre, para el que redacte.** Commons y el IELIG escriben **«Cocederos»**; OSM escribe
> **«Cocedores»**. Son el mismo sitio. Es exactamente el patrón que ya cazó
> `Playa de las Higuericas` ≠ `Playa de la Higuerica`, así que **la resolución de fotos hay que
> hacerla con las dos grafías** o `poi-images.js` no encontrará nada.

---

## 5. Sierra Espuña — tabla de candidatos (§4.5 paso 2)

Overpass ve aquí muchísimo más que el basemap (`historic=*` y `man_made=*` no viajan en las teselas).
**89 elementos dentro del límite.** Los que tienen hecho detrás:

| # | Nombre propuesto | `type` | Coordenada · de dónde sale | Fuente del **hecho** | `approx` | Qué se contaría |
|---|---|---|---|---|---|---|
| 1 | **Pozos de la Nieve** | `Cultural` | `37.869322, -1.570733` — OSM `node/8543844778` (Pozo 1) | **BIC, Sitio de Interés Etnográfico** (Dir. Gral. de Bienes Culturales, R. de Murcia). 28 pozos en dos grupos a menos de 1 km | **sí** — un punto representa el conjunto | Nieve prensada en pozos desde finales del XVI, con su apogeo en los XVII y XVIII, bajada como hielo a los hospitales y ciudades del Reino de Murcia. Uno de los conjuntos de arquitectura del frío más importantes de España |
| 2 | **Santuario de Santa Eulalia de Mérida** | `Religioso` | `37.800765, -1.557502` — basemap/OSM | **BIC categoría Monumento**, *Decreto 96/2002, de 7 de junio* | **no** | Ermita de 1574 ampliada hasta formar un conjunto; artesonado mudéjar y pinturas que cubren los muros, hechas entre 1601 y 1624 |
| 3 | **Sanatorio de Tuberculosos de Sierra Espuña** | `Cultural` | `37.868303, -1.512129` — OSM `way/132482920` | OSM `historic=building` + `building=hospital` + `ruins=yes`; nombre confirmado en Nominatim | **no** — polígono del edificio | El sanatorio antituberculoso de altura, hoy en ruinas. **Era uno de los tres candidatos sin coordenada de la sesión anterior: queda situado** |
| 4 | **Torreón de los Exploradores** | `Cultural` | `37.861787, -1.572962` — OSM `way/783436635` | OSM `man_made=tower` + `historic=yes` | **no** | La torre que sí se pisa, frente a la cima del Morrón, que está ocupada por el EVA-13 y cerrada |
| 5 | **Caño de Espuña** | `Cultural` | `37.867086, -1.499334` — OSM `relation/13221261` | OSM `historic=aqueduct` | **sí** — el acueducto es lineal; el punto es representativo | Obra hidráulica histórica que conduce el agua de la sierra. **Nuevo: el basemap no lo veía** |
| 6 | **Casas de Malvariche** | `Cultural` | `37.887263, -1.598814` — OSM `way/698763176` | OSM `historic=ruins` + `building=yes` | **no** | El caserío abandonado, con la Casa de los Quintana y la Casa del Guarda al lado, testigos del poblamiento anterior a la repoblación |
| 7 | **Casa Forestal de Huerta Espuña** | `Cultural` | `37.857896, -1.516811` — OSM `way/900533315` | OSM `historic=yes` | **no** | La casa forestal desde la que se gobernó la repoblación de Codorníu. **Nuevo** |
| 8 | **Garita del Turullón** | `Paisajístico` | `37.861313, -1.488209` — OSM `way/553637712` | OSM `man_made=tower` | **no** | Torre de vigilancia sobre el borde oriental. **Nuevo**; verificar si es de incendios o militar antes de redactar |
| 9 | **Centro de Visitantes Ricardo Codorníu** | `Acceso` | `37.855798, -1.512696` — OSM `way/170061146` | OSM `amenity=ranger_station` + `tourism=information` | **no** | La puerta de entrada al parque y el nombre del ingeniero que lo repobló |
| 10 | **Arco de Sigismondi** | `Geológico` | `37.860940, -1.576039` — basemap | Pendiente de fuente propia | **no** | Arco natural. **Sin fuente del hecho todavía: hoy no cumple el §4.3.1** |
| 11 | **Los Ojos del Dragón** | `Geológico` | `37.835793, -1.497059` — basemap | Pendiente de fuente propia | **no** | Formación en la roca. **Sin fuente del hecho todavía: hoy no cumple el §4.3.1** |
| 12 | **Ermita de Santa Leocadia** | `Religioso` | `37.821616, -1.600858` — basemap | Pendiente de contrastar | **no** | Ermita en el flanco suroeste. Ojo: **hay al menos tres «Santa Leocadia» en España** (trampa ya documentada) |
| 13 | **Torre del Azaraque** | `Cultural` | `37.837443, -1.471796` — OSM `way/1097841454` | OSM `historic=ruins` + `man_made=tower` | **no** | Torre en ruinas del extremo oriental, con las Casas del Azaraque al lado. **A 14,6 m del límite**: entra por el margen del §4.3.3 |

### Sierra Espuña — tres decisiones tuyas antes de redactar

1. **Los pozos: ¿uno o varios?** Hay **28 con coordenada exacta**, en dos grupos (el de Totana en
   torno a `37.8693, −1.5707` y el segundo en `37.8735, −1.5620`), más tres sueltos con nombre
   propio: **Pozo 24 «de Don Eleuterio»**, **Pozo 27 «de las Ánimas»** (`37.883040, −1.552106`) y
   **Pozo 28 «de la nieve de Mula»** (`37.900506, −1.558394`), este último a 3,5 km de los demás.
   Poner 28 chinchetas es justo lo que el §4.1 llama llenar el mapa. **Mi recomendación: 2 POIs** — el
   conjunto (fila 1, `approx`) y el **Pozo de la nieve de Mula** aparte, que está lejos y tiene
   nombre propio.
   Detalle que corrobora la fuente: hay una **capilla en ruinas** (`way/880664727`, `37.873875,
   −1.565287`) justo dentro del segundo grupo, y la descripción del BIC menciona que el conjunto
   incluye casas y una ermita.
2. **Los hornos de cal.** Overpass devuelve el **Horno del Barranco de Argüelles**
   (`37.858432, −1.532187`) y **ocho hornos más sin nombre** dentro del límite. Es un conjunto
   etnográfico real y disperso. ¿Un POI que represente el conjunto, o ninguno hasta tener fuente?
3. **La cuestión de Gebas**, que sigue abierta desde la sesión anterior: **Capilla de la Virgen del
   Rocío** y **Ermita y Mirador de Gebas** caen geométricamente dentro de Sierra Espuña, pero
   culturalmente son de Barrancos de Gebas. Geometría comprobada; la decisión es editorial.

### Sierra Espuña — lo que se cae (sin cambios respecto a la sesión anterior)

| Nombre | Regla | Detalle |
|---|---|---|
| **6 cuevas** (Moneda, Luenga, Matea, Plata, Palomas, Mataos) | §4.3.6 | Cavidades con registro arqueológico y sin vigilancia. Precedente: Cueva C.6 del piloto |
| **Cima del Morrón** (1.583 m) | §4.3.5 | La ocupa el **EVA-13** del Ejército del Aire, zona militar en activo |
| **71 picos y 28 collados** | §4.1 | Topónimo suelto. **Sigue en pie** que el PRUG podría rescatarlos: es la razón de abrir el Anexo I (§2) |
| **~40 miradores, fuentes potables, refugios, áreas recreativas** | §4.1 | Equipamiento de ruta o topónimo; no son valores del espacio |
| Castillo, muralla, picota y Arco de **Aledo** | §4.3.3 | Fuera del polígono (1,4 km) — es el casco de Aledo |

---

## 6. Fotos (fuente 6) — consultada, no resuelta

Commons **está accesible** y responde. Lo encontrado, como pista y no como dato:

- **Cuatro Calas**: 10 archivos de la Cala de los Cocederos, y dos son exactamente el hecho del
  candidato nº 2 — *«Antiguo deposito de esparto en la Cala de los Cocederos»* y *«Depositos excavados
  en el acantilado, Cala de los Cocederos»*. También *«Punta Parda, lado norte de la Cala de los
  Cocederos»*.
- **Sierra Espuña**: 1 archivo, *«Pozos de la Nieve de Murcia 11-03-2024.jpg»*.

**Ninguna licencia se ha verificado.** Eso se hace con `npm run images:pois`, que necesita Node y aquí
no lo hay. Sin licencia comprobada, `image: null` (§4.5 paso 4).

---

## 7. Qué falta para cerrar el N3

1. **Abrir el Anexo I del PRUG** a mano (§2). Es lo único que puede mover los picos y collados.
2. **Fuente del hecho** para Arco de Sigismondi, Los Ojos del Dragón y Ermita de Santa Leocadia; sin
   ella no entran (§4.3.1).
3. **Resolver las tres decisiones** del §5 y la del nº 3 de Cuatro Calas.
4. **Reejecutar `npm run pois:build`** en una máquina con Node para que las coordenadas de aquí las
   confirme la herramienta del repo, y `npm run images:pois` para las fotos.
5. Comprobar si la **Ley 1/2026** mueve el límite del parque (§2).
