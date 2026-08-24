# Las aves no entran por la misma puerta que las plantas

> Este documento existe porque el catálogo estuvo meses metiendo aves por una puerta que el propio
> repositorio declaraba falsa, sin un solo error ni un solo aviso. Explica cuál es la puerta buena,
> por qué, cómo se cruza con el catálogo sin perder aves por el camino, y **qué no cubre** — que es
> la parte que hay que tener delante antes de dar por bueno el catálogo de aves de un espacio.

---

## 1. La regla, en una frase

**Una planta entra por CONSTANCIA; un ave entra por RESPALDO DE SITIO, y GBIF pasa a ser
confirmación.**

Para todo lo demás, la puerta del catálogo es que GBIF haya registrado la especie **dentro de los
polígonos de hábitat** del espacio. Para un ave esa prueba no mide lo que dice medir: **vuela**. Un
registro tomado en vuelo cae dentro de cualquier recinto que haya debajo, así que «hay ocurrencias
dentro del polígono» no distingue al ave que vive allí de la que pasaba por encima.

El propio repositorio lo tenía escrito desde el piloto —«filtrar Aves: son el 88 % de las ocurrencias
y casi todo ruido espacial»— y `build-species-n2.js` lo asume al escribir la ficha, que sale **a
propósito sin `habitatIds`**. O sea que el ave entraba por una prueba cuyo resultado el catálogo
tiraba a la basura acto seguido.

Lo que eso producía, medido antes del cambio: **557 de 1.492 fichas eran aves** (el 73 % del catálogo
en Monte Arabí, el 26 % en Cuatro Calas — una proporción que mide la cobertura de eBird, no el
espacio), y 366 de ellas llevaban una `reviewNote` pidiendo contrastar con la lista oficial del sitio.

## 2. Qué cuenta como respaldo de sitio

Solo dos cosas, y cualquiera de las dos vale. Las une una propiedad que ninguna otra evidencia tiene:
**afirman por escrito que la especie pertenece a ESTE sitio**, en vez de que sea propia de un tipo de
hábitat o que esté protegida en general.

| Fuente | De dónde sale | Evidencia |
|---|---|---|
| **Formulario Normalizado de Datos** del sitio Red Natura 2000, secciones 3.2 y 3.3 | `npm run sitio:especies -- --park <slug>` → IEPNB, `iepnb.gob.es/api/rn2000/` | `lista_oficial_sitio` |
| **Anexo normativo** del PORN / PRUG / decreto de declaración | `data/anexos-normativos.json`, transcrito a mano con el documento delante | `anexo_normativo` |

**No vale estar protegida.** Que un ave sea LESRPE es dato oficial sobre la especie, no sobre este
espacio: con eso volveríamos a aprobar por ubicuidad.

Las aves sin respaldo **no se pierden**: quedan en `excluidas_detalle` de la selección y en el informe
de la poda, con su recuento de GBIF y el motivo. Recuperarlas es volver a ejecutar.

## 3. LO QUE ESTO NO CUBRE — léelo antes de dar por bueno un catálogo de aves

El formulario del sitio **no es un inventario de las aves del espacio**. Es una lista de
*conservación*: la sección 3.2 recoge las del Anexo I de la Directiva Aves y las migratorias de
presencia regular, y la sección 3.3 («otras especies importantes») **está vacía en la práctica
totalidad de los sitios españoles** — en los ocho espacios publicados hay **una sola entrada** en
toda la sección 3.3.

Consecuencia directa, y hay que decirla sin adornos: en un espacio cuyo único respaldo sea el
formulario, el catálogo de aves pasa a ser **«las aves de interés comunitario del sitio»**, no «las
aves que vas a ver». El carbonero común, el petirrojo o el mirlo no están en ningún formulario, y
salen del catálogo aunque estén, sin discusión, en el monte.

Hay un segundo desajuste, y es peor porque no se ve venir: **el perímetro del sitio Natura 2000 no es
el del espacio protegido**. Cuatro Calas es el caso extremo — la única ZEPA que lo solapa,
ES0000507, es **marina** («Espacio marino de los Islotes Litorales de Murcia y Almería») y declara
18 aves marinas; el LIC terrestre ES6200010 no declara ninguna especie. Por eso su poda se llevó
*Falco peregrinus*, *Coracias garrulus*, *Burhinus oedicnemus* y *Alcedo atthis*, que son Anexo I y
que ninguna de las dos fichas de sitio nombra.

**La vía para arreglarlo es el anexo normativo, no bajar la exigencia.** Se ve en los números: los
tres espacios del Altiplano tienen transcrito su plan de gestión y conservan 46, 61 y 66 aves; los
que solo tienen formulario se quedan en 17, 18 y 40.

## 4. Cobertura real, espacio a espacio

Estado tras la poda del 2026-08-16. **La columna que importa es la última.**

| Espacio | Fichas | Aves | Sitios Red Natura 2000 | Aves que declara el FND | Anexo transcrito |
|---|---:|---:|---|---:|---|
| Cabo Cope y Puntas de Calnegre | 162 | 34 | ES0000261 ZEPA · 2 LIC | 34 | — |
| Carrascoy y El Valle | 167 | 40 | ES0000269 ZEPA · ES6200002 | 47 | — |
| Cuatro Calas | 93 | 18 | ES0000507 ZEPA **marina** · ES6200010 | 18 | — |
| Monte Arabí | 68 | 46 | **ninguno** | 0 | ✅ Plan del Altiplano, vol. II §3.2 |
| Sierra de El Carche | 303 | 61 | ES6200009 (LIC, sin aves en el FND) | 0 | ✅ Plan del Altiplano, vol. III |
| Sierra de la Pila | 179 | **17** | ES0000174 ZEPA · ES6200003 | 29 | — |
| Sierra de Salinas | 105 | 66 | ES0000457 ZEPA · 2 LIC | 16 | ✅ Plan del Altiplano, vol. II §1.1 |
| Sierra Espuña | 188 | 48 | ES0000173 ZEPA | 49 | — |

**Sierra de la Pila con 17 aves es el aviso más claro de la tabla**: son 8.800 ha de sierra y su ZEPA
declara 29. No es un error del filtro; es que a ese espacio le falta el paso de transcribir su plan
de gestión. Lo mismo, en menor grado, en Carrascoy y Cuatro Calas.

Los `*-poda-aves.md` de `Tools/catalogo-nacional/out/` traen, por espacio, las tres listas que hacen
falta para cerrarlo: las retiradas, las conservadas con su cita, y **las que el sitio declara y el
catálogo no ficha** — que es por donde se amplía.

## 5. El cruce por nombre: la trampa que hay debajo de todo esto

La fuente y el catálogo **escriben la misma especie con nombres de épocas distintas**. El formulario
de un sitio revisado en 2023 sigue citando *Sylvia undata*; el catálogo ficha *Curruca undata*, que es
como la sirve GBIF desde que las currucas se separaron de *Sylvia*.

Cruzar a pelo da cero, y **el resultado no parece un fallo**: el ave sale excluida con el motivo «no
figura en el formulario oficial del sitio» escrito al lado, que es una afirmación falsa producida por
la propia herramienta. De las **82 aves** que declaran los formularios de los ocho espacios, **11 no
casaban por nombre**.

`Tools/lib/respaldo-sitio.js` tiende el puente en **tres capas**, en este orden:

1. **Binomio normalizado** del nombre verbatim. Ya absorbe la terminación de género
   («torquatus»/«torquata»), los trinomios de subespecie y las salvedades entre paréntesis
   («*Sylvia cantillans ([excluding subalpina])*»).
2. **Nombre aceptado en EIDOS del nombre DE LA FUENTE.** Ésta era la dirección que faltaba: se
   resolvía el nombre del candidato, no el del documento. Cierra *Larus ridibundus* →
   *Chroicocephalus ridibundus*, *Catharacta skua* → *Stercorarius skua*, *Phalacrocorax
   aristotelis* → *Gulosus aristotelis* y las *Sylvia* que EIDOS ya ha movido a *Curruca*.
3. **Tabla de equivalencias verificadas a mano** (`data/equivalencias-nomenclatura.json`), **solo**
   para lo que las dos capas anteriores no cierran, con su comprobación y su fecha.

### Por qué NO se casa por epíteto

Es la tentación evidente —*Sylvia undata* ↔ *Curruca undata*, mismo epíteto— y es una fusión de
especies distintas esperando a ocurrir. Sobre estos ocho espacios propone nueve pares y **tres son
falsos**:

- *Calandrella brachydactyla* (terrera común) ↔ *Certhia brachydactyla* (agateador común)
- *Melanocorypha calandra* (calandria) ↔ *Emberiza calandra* (triguero)
- *Saxicola torquatus* (tarabilla) ↔ *Turdus torquatus* (mirlo capiblanco)

Y encima **pierde el par verdadero** del último, que es *Saxicola torquatus* ↔ *Saxicola rubicola*:
el epíteto no se parece en nada. Dos de cada tres aciertos y los fallos son del peor tipo posible.

Así que la heurística existe pero **nunca se aplica**: sale en el informe como «a verificar a mano»,
y de ahí se da de alta la equivalencia si al comprobarla resulta ser la misma especie.

## 6. El procedimiento, en orden

Para un espacio **nuevo**, dentro del alta normal (ver [`ALTA-DE-ESPACIO.md`](ALTA-DE-ESPACIO.md)):

```bash
npm run sitio:especies   -- --park <slug>     # 1. la lista oficial del sitio. VA ANTES.
npm run species:seleccion -- --park <slug> --atlas <atlas.txt>
npm run species:build     -- --park <slug>
```

El paso 1 **no es opcional y su ausencia no es neutra**: sin el volcado, ningún ave tiene respaldo y
la selección las excluye todas salvo las que salve el anexo. La herramienta lo dice en voz alta, y
distingue los tres estados —no consultada / consultada y el espacio no está en Red Natura 2000 /
consultada con lista—, porque los tres se parecen en el resultado y solo el primero se arregla
lanzando algo.

Para un espacio **ya publicado**:

```bash
npm run aves:poda -- --park <slug>                 # simulación + informe
npm run aves:poda -- --park <slug> --write --sql   # aplica y escribe el DELETE
```

Y después, **si hay backend desplegado**, los dos pasos que la app sí nota:

```bash
npm run park:sql -- --park <slug>    # las aves que se quedan (zepaSiteCode, renombrados)
# Database/poda-aves-<slug>.sql      # las que se van: build-park-sql SOLO hace UPSERT
php Tools/recalculate-account-progress.php   # el progreso de quien descubrió una de las retiradas
```

## 7. Cómo se AMPLÍA el catálogo de aves de un espacio

En este orden, y ninguno de los tres es «bajar el umbral»:

1. **Transcribir el plan de gestión del espacio** a `data/anexos-normativos.json`. Es lo que separa a
   los espacios de 60 aves de los de 17. `data/normativa-espacios.json` dice de dónde se descarga cada
   plan y en qué apartado está el inventario; hoy solo cubre el Decreto 28/2025 del Altiplano.
2. **Cerrar las «declaradas por el sitio y sin ficha»** del informe de la poda: el formulario afirma
   que el ave está en el sitio y el barrido de GBIF no la ha visto dentro de ningún polígono.
3. **Verificar los pares de la lista «a verificar a mano»** y dar de alta la equivalencia si procede.

## 8. Los campos de la ficha que dependen de esto

- **`zepaSiteCode`** — el sitio que **declara al ave en su formulario**, o `null`. Antes llevaba el
  código de la ZEPA con la que solapa el ESPACIO, leído del `zepa.geojson`, a **toda** ave del
  catálogo: marcaba «ave de la ZEPA» a cualquier ave que GBIF hubiera dejado pasar. No es
  decorativo — `Frontend/Js/state.js` construye con él la **colección de aves de la ZEPA**, un logro
  del juego, que con el criterio viejo era «las aves que el barrido dejó pasar» y ahora es una
  colección cerrada, oficial y comprobable.
- **`migratory` / `sitePresence`** — la **fenología**, derivada del `species_type` del formulario
  por `Tools/lib/fenologia.js`. Migratoria = el formulario la declara y **ninguna** de sus entradas
  es de población permanente; basta una permanente para que no lo sea, porque significa que aquí hay
  población todo el año. Gobierna la pestaña «Migratorias» de la app y su barra de progreso.

  Los tres estados importan, y el tercero es el que no se puede aplanar: **campo ausente** = ningún
  formulario nombra al ave. Eso no es «no es migratoria», es que no hay fuente, y esas fichas se
  quedan en el catálogo general. Son **591 de las 1.150 fichas de ave** publicadas, incluidos los
  cuatro espacios cuyo FND no lista ni un ave (Barrancos de Gebas, Monte Arabí, Cabezo Gordo y
  Cañaverosa: allí la pestaña lo dice en vez de enseñar una lista vacía).

  Antes de esto la app rotulaba «🕊️ Ave migratoria» por `zepaSiteCode`, que dice otra cosa: que el
  formulario la nombra. **154 aves de población permanente** —el búho real y la perdiz roja de
  Sierra de las Moreras entre ellas— salían anunciadas como migratorias en su ficha y contadas en una
  barra de progreso del mismo nombre. No fallaba nada: salía en verde y decía algo falso.

  En un espacio ya publicado se aplica con `npm run aves:fenologia -- --write`, que lee el volcado
  del sitio que ya está en `out/` en vez de rehacer la Capa 3 entera. Idempotente, y lo que no casa
  por nombre **sale listado** en vez de adivinarse.
- **`habitatIds`** — vacío, siempre, en un ave. Un ave con `habitatIds` **se contradice a sí misma**
  y el validador lo avisa; se limpia regenerando la Capa 3.
- **`source`** — trae la cita del formulario con su sitio, su sección y el **tipo de población
  declarada** (permanente, reproductora, invernante, en concentración). Lo escribe
  `build-species-n2.js`: `aves:poda` **no lo redacta**, porque no va a inventar el texto de una
  fuente que no ha leído.
- **`reviewNote`** — ya **no** lleva la nota estructural de las aves. Decía que la lista oficial «no
  ha podido consultarse», que hoy es falso, y salía en 366 de 557 fichas: un aviso que aparece en tres
  de cada cuatro tarjetas no avisa de nada y tapaba las 131 fichas con una duda de verdad.

## 9. Historial

- **2026-08-24** — se separa la fenología del hecho de estar declarado: nacen `migratory` y
  `sitePresence` (`Tools/lib/fenologia.js`), la app gana una pestaña «Migratorias» propia y la
  colección de aves se parte en dos, la del formulario entero y la de las que no viven aquí todo el
  año. Reparto sobre los dieciséis espacios: **405 migratorias, 154 residentes declaradas y 591 aves
  sin señal**. Quedan por cerrar ~50 entradas del formulario que no casan por nombre —*Sylvia
  conspicillata*, *Larus ridibundus*, *Cyanecula svecica*…—: cada una es un ave que se queda sin
  clasificar, y se cierran en `data/equivalencias-nomenclatura.json` (§5).

- **2026-08-15** — se cablea `especies-sitio-rn2000.js` (la lista oficial nunca había estado
  conectada: `zepaSiteCode` salía del `zepa.geojson` del propio espacio) y se escribe el filtro 3 bis
  en `build-species-seleccion.js`, que es la puerta de los espacios nuevos.
- **2026-08-16** — se aplica a los ocho espacios ya publicados (`aves:poda`), **557 → 330 aves**, tras
  arreglar el cruce por nombre, que habría borrado 19 aves con respaldo. Se unifica la curruca
  rabilarga, que estaba fichada dos veces con dos nombres y cuatro identificadores.
