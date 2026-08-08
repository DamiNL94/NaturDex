# Fase 3 (N3) de Cuatro Calas y Sierra Espuña — la cascada, recorrida

> Segunda sesión de N3, **2026-08-07**. Sigue el §4 de `Docs/prompts/e-rollout-nacional.md`.
> La tabla de candidatos del paso 2 **recibió el visto bueno** y los POIs están **dados de alta**:
> **4 en Cuatro Calas y 13 en Sierra Espuña** (§7).
> **Aun así ninguno de los dos sube a N3.** El §5 exige, además de la cascada, que la BD tenga sus
> filas y que `npm run validate` pase; aquí no hay ni Node ni contenedor de BD. Los dos siguen
> en **N2** con su capa de POIs escrita y el SQL preparado sin aplicar.
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
| Node.js | **No estaba; se instaló a mitad de sesión** (v24.19.0 LTS). Ver abajo |
| Docker / BD | **No hay.** Por eso el SQL queda sin aplicar |

**Node no estaba al empezar**, así que la primera mitad de la sesión se hizo sin ninguna herramienta
del repo: era la inversa exacta de la sesión anterior, que tenía Node pero no red. El recorte por
polígono del §4.3.3 se rehízo con un script de PowerShell equivalente (ray casting sobre el
`MultiPolygon` de `geo/parque.geojson`, con huecos, y distancia mínima al borde para el margen de
~50 m), **validado contra la salida ya existente de la herramienta** con cuatro puntos de control por
espacio, y coincidiendo en los ocho:

| Punto de control | Esperado (informe del basemap) | Obtenido |
|---|---|---|
| Torre del Azaraque | dentro | MARGEN (14,6 m) |
| Ermita de San José | fuera | FUERA (142 m) |
| Castillo de Aledo | fuera | FUERA (1.438 m) |
| Centro de Visitantes Codorníu | dentro | DENTRO |
| Playa de Calarreona | dentro | DENTRO (55,5 m del borde) |
| Cala de las Tortugas | fuera | FUERA (407 m) |
| Islote Cama de Los Novios | fuera | FUERA (253 m) |

El script está en el scratchpad de la sesión, **no en el repo**: era un apaño, no una herramienta.

**Ya no hace falta fiarse de él.** Instalado Node (v24.19.0 LTS, ZIP oficial en
`%LOCALAPPDATA%\Programs\nodejs`, SHA256 verificado, sin admin), se ejecutaron las herramientas de
verdad y **confirman el trabajo hecho a mano**:

- **`npm run validate` en verde**: «Validación superada (16 espacios: 3 completos + 13 fichas base,
  **5 avisos**)», y en las dos fichas `coherencia OK: … 4 POIs` y `… 13 POIs`. Los 5 avisos son
  preexistentes y ajenos a esta capa (aves y quirópteros sin hábitat, dos especies sin foto).
- **`npm run pois:build` con Overpass** en los dos espacios. Cruzando contra `park.json`, reconoce
  las altas como duplicados por el §4.3.7 —`playa-de-calarreona`, `playa-de-los-cocedores`,
  `pozos-de-la-nieve`, `santuario-de-santa-eulalia`, `casas-de-malvariche`, `torre-del-azaraque`,
  `centro-de-visitantes-ricardo-codorniu`, `capilla-de-la-virgen-del-rocio`—, y en Cuatro Calas los
  dos únicos candidatos que le quedan son justo los que se dejaron fuera a propósito (Playa de la
  Carolina y Playa de la Higuerica).
- **`npm run red:check`**: 16 de 17 fuentes abiertas; solo falla el mirror
  `overpass.openstreetmap.fr` (403). Ojo con la lectura: da `www.borm.es` por **abierto**, porque
  comprueba alcance del host, y el captcha de Radware salta al pedir el documento (§2).

> **Diferencia anotada.** El centroide que Overpass da hoy para `Playa de Calarreona`
> (37.383606, −1.619603) está a unos 133 m del que se registró (37.383513, −1.621103, del basemap del
> repo). Los dos son puntos representativos de una playa; **se conserva el registrado porque cae
> estrictamente dentro del polígono**, mientras que el centroide de Overpass queda fuera y solo entra
> por el margen de 50 m.

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

## 7. El alta: qué se escribió y con qué decisiones

**17 POIs**: 4 en Cuatro Calas y 13 en Sierra Espuña. Escritos en el bloque `pointsOfInterest` de
cada `park.json` con los mismos diez campos del piloto, `counts.pointsOfInterest` actualizado y
`version` 2 → 3 en los dos manifiestos para que el offline revalide.

### Las cuatro decisiones, resueltas

1. **`BE005` entra renombrado** como **«Conglomerados de Cuatro Calas»**, con la denominación oficial
   y el código en `source`, para que la chincheta no se lea como «aquí está el parque».
2. **Los pozos, dos POIs**: el conjunto (`approx`, sobre el Pozo 1) y el **Pozo de la nieve de Mula**
   aparte. Los otros 26 no se pinchan uno a uno.
3. **Los hornos, un POI sobre el que tiene nombre**: «Hornos de cal del Barranco de Argüelles»,
   `approx`, con el nombre propio en el título y los otros ocho citados en `source`.
4. **Gebas: solo entra la Capilla de la Virgen del Rocío.** Ver el aviso de abajo.

> **Corrección al ledger, encontrada al dar el alta.** La sesión anterior dio por hecho que la
> Capilla de la Virgen del Rocío, la Ermita y el Mirador de Gebas caían **las tres** dentro de Sierra
> Espuña. Comprobado punto por punto contra los dos polígonos oficiales, **solo la Capilla lo hace**
> (253 m dentro). La **Ermita de Gebas** (*Ermita de la Purísima*, `way/902032036`, con su
> inscripción «ERMITA DE GEBAS / AÑO 1893 / RESTAURADA / AÑO 1998») queda **324 m fuera de Sierra
> Espuña y 547 m fuera de Barrancos de Gebas**: está en el caserío, que no es de ninguno de los dos
> espacios. La «Fuente Mirador de Gebas» es un punto de agua (§4.1) y también cae fuera. Por el
> §4.3.3 no pueden entrar en ningún parque.

### Los que NO entraron, y por qué

| Nombre | Regla |
|---|---|
| Arco de Sigismondi · Los Ojos del Dragón · Ermita de Santa Leocadia | **§4.3.1**: no se les encontró fuente del hecho. Tienen coordenada, pero un POI sin fuente no entra |
| Ermita de Gebas · Fuente Mirador de Gebas | **§4.3.3**: fuera de los dos polígonos |
| Playa de la Higuerica | **§4.1**: el hecho geológico que la sostenía es el `BE005`, que entra por su cuenta |

### Comprobación

Primero a mano, y después **con el validador del repo, que confirma el resultado** (§1):
`npm run validate` **en verde**, con `coherencia OK: … 4 POIs` y `… 13 POIs`.

Lo comprobado sobre esta capa, limpio en los dos espacios: JSON válido · los diez campos del piloto,
ni uno más ni uno menos · `id` en slug estable y único · `type` dentro del vocabulario cerrado del
§4.1 · coordenada presente, distinta de `[0,0]` y en rango · `source` no vacío · **pertenencia por
polígono: 15 dentro y 2 en el margen de 50 m, 0 fuera** · sin dos POIs a menos de 50 m entre sí
(§4.3.7) · `park.json`, `manifest.json` y el SQL coinciden en slugs, coordenadas y cuentas.

**Ninguno de los 17 lleva foto** (`image: null`). Commons tiene material —sobre todo para los
Cocedores— pero las licencias no se han verificado, y el §4.5 manda hueco antes que foto dudosa.

### Base de datos

`Database/n3-pois-cuatro-calas-sierra-espuna.sql`, idempotente (`ON DUPLICATE KEY UPDATE` sobre la
clave única `(park_id, slug)`). **Está sin aplicar**: no hay contenedor de BD en esta máquina. Sin
él, un despliegue con backend seguirá sirviendo los dos espacios con 0 POIs, porque
`Frontend/Js/data.js` da prioridad a la API sobre el `park.json` empaquetado.

```bash
docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/n3-pois-cuatro-calas-sierra-espuna.sql
```

---

## 8. Qué falta para que los dos cierren el N3

**Cuatro Calas está a un paso: le falta solo el punto 1.** Su cascada está agotada y el validador
pasa.

1. ~~**Aplicar el SQL.**~~ **HECHO el 2026-08-08, y hacía falta más de lo que ponía aquí.** No
   bastaba con el SQL de POIs: **`cuatro-calas-n2.sql` tampoco se había aplicado nunca** (el espacio
   estaba en la BD como ficha base, 0 hábitats y 0 especies), y **Sierra Espuña ni siquiera tenía
   fila en `parks`**, que es por lo que su mitad del SQL insertaba 0 filas sin dar error. Aplicado
   `cuatro-calas-n2.sql`, creado y aplicado `Database/sierra-espuna-n2.sql` (fila de `parks` + 13
   hábitats + 190 especies + 703 enlaces) y reaplicado el de POIs. Resultado: **Cuatro Calas 7 hab /
   102 esp / 4 POIs** y **Sierra Espuña 13 / 190 / 13**, ambos cuadrando con su `park.json` y
   servidos por la API. **Cuatro Calas cierra el N3**; Sierra Espuña sigue en N2 porque le falta la
   cascada (punto 2), no la BD. Ver `ESTADO.md` §"2026-08-08".
2. **Abrir el Anexo I del PRUG** a mano (§2). Es lo único que le falta a la cascada de **Sierra
   Espuña**, y lo único que puede mover los 71 picos y 28 collados.
3. **`npm run images:pois`** para resolver las fotos: los 17 POIs están con `image: null`.
4. **Fuente del hecho** para Arco de Sigismondi, Los Ojos del Dragón y Ermita de Santa Leocadia, si
   se quiere recuperarlos.
5. Comprobar si la **Ley 1/2026** mueve el límite del parque (§2).

> **Resuelto el 2026-08-08 — el SL-MU 18 no entra porque OSM no lo tiene.** El candidato nº 4 de §4
> (Playa de Calarreona) se dio de alta como «arranque señalizado del **SL-MU 18**» advirtiendo de que
> esa traza no estaba en `geo/trails.geojson`. Comprobado contra Overpass por siete vías distintas
> —incluidas **todas** las relaciones de ruta a pie del bbox sin filtrar por `ref`—: **el SL-MU 18 no
> existe en OpenStreetMap**, ni como relación, ni como ways con `ref`, ni con balizas. Dentro del
> límite hay 39 caminos mapeados, ninguno con `ref` ni `name`. No es un fallo de la herramienta:
> `build-park-trails.js --dry-run` reproduce la capa actual clavada (GR-92, 1,74 km, 2 trazas). **No
> se dibuja a mano**: la traza de la FMRM está en Wikiloc y no es redistribuible, y la capa se sirve
> bajo ODbL. Queda registrado como hueco en `ESTADO.md` §"2026-08-08"; se incorporará solo con
> `npm run trails:build` en cuanto alguien lo mapee en OSM.
>
> **Sí se ha tocado el POI, pero por otro motivo.** Su `source` acababa en «Aviso: la traza del
> SL-MU 18 NO está en geo/trails.geojson, que solo lleva el GR-92», que es una nota de mantenimiento
> interna **en un campo que se sirve al usuario final** (`render.js:416` pinta `Fuente: {source}` en
> la ficha). Sustituida por el hecho, dicho para quien camina: el sendero está señalizado sobre el
> terreno pero no cartografiado en OSM, y por eso no se dibuja. Ver `ESTADO.md` §"2026-08-08".
