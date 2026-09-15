# Las decisiones de la auditoría, resueltas

La cola 6 del [consolidado](auditoria-consolidado.md) —«DECISIONES, no trabajo»— eran **73 casos
pendientes** con una nota al lado: «nadie las puede ejecutar sin el boletín delante». Este documento
las resuelve, y dice de qué fuente sale cada respuesta.

**El resultado en una línea: 67 de las 73 no necesitaban una decisión, sino leer algo** — el propio
`CLAUDE.md` en 46, la guarda que ya tiene escrita la herramienta en 13, y el BOE en 8. Las que
quedan son seis, y son de verdad del usuario.

| Grupo | Casos | Resuelto por | Estado |
|---|---:|---|---|
| A · `inclusion` | 46 | la regla del Atlas (`CLAUDE.md` §2) | **se quedan**, sin tocar nada |
| B · `iucn_global` | 13 | la clase GUARDA de `lista-roja-mundial.js` | **no se tocan**; 2 propuestas aparte |
| C · `regional_status` | 7 | Anexo I de la Ley 7/1995 (BOE) | **corregidas y aplicadas** (+3 de propina) |
| C · `spain_status` | 3 | Anexo del RD 139/2011 (BOE) | 1 confirmada, 2 propuestas |
| D · `scientific_name` | 4 | — | decisión del usuario (deuda nº 36) |
| E · `gbif_species_key` | 3 | — | decisión del usuario |
| F · `image` | 4 | — | decisión del usuario |
| G · `eidos_taxonid` | 1 | — | decisión del usuario |

---

## A · Las 46 de `inclusion`: las decide el Atlas, y ya estaba escrito

Las 46 dicen todas lo mismo: **la criba en vivo las baja a nivel 3, «solo GBIF»**, mientras que la
selección aprobada con la que se escribieron las tenía con evidencia `caracteristica` — el Atlas de
Hábitats afirmando que la especie es característica de un HIC del espacio.

No es un cambio de criterio: es la **deuda nº 42**. `fuentes/atlas.txt` no se versiona y no es
reproducible —de qué extractor de PDF salga cambia qué se lee, y ninguno cubre al otro—, así que una
criba nueva no ve lo que vio la de agosto.

**Medido antes de decidir**, sobre las fichas publicadas de esos 46 taxones:

| dónde está el respaldo del Atlas | fichas |
|---|---:|
| en el índice versionado `out/<slug>-hic-especies.json` | 55 |
| solo citado en el `source` de la ficha | 68 |
| **sin rastro en el repositorio** | **0** |

Ninguna de las 123 fichas ha perdido el respaldo: lo que se ha perdido es la capacidad de volver a
leerlo del PDF. Y eso ya tiene respuesta escrita en el `CLAUDE.md` §2: **el Atlas se usa solo en
positivo, y retirar un enlace porque este parser no lo ha leído es borrar un dato por una limitación
de herramienta**.

> **Se quedan las 46.** No hay nada que ejecutar. Lo que sí queda es la deuda nº 42: las **68 fichas
> que solo citan el Atlas en su `source`** no pueden defenderse solas ante la próxima criba, porque
> el índice versionado no las tiene. Completar ese índice es trabajo de la deuda, no de esta cola.

## B · Las 13 de `iucn_global`: es la guarda, y funciona

Las 13 son la **clase C (GUARDA)** de `lista-roja-mundial.js`: la ficha afirma una categoría y EIDOS
no devuelve fila de ámbito Mundial. La herramienta **no las toca por diseño** —es el hallazgo C7:
adoptar el silencio de EIDOS sería borrar un dato por un silencio— y escribirles «No evaluada en la
Lista Roja mundial» sería falso, porque quien no trae la fila es EIDOS, no la UICN.

Preguntado EIDOS taxón a taxón, el silencio tiene dos formas:

- **Nueve** no tienen ninguna fila de conservación: *Lygeum spartum*, *Asparagus horridus*,
  *Atriplex glauca*, *Pancratium maritimum*, *Cutandia maritima*, *Cytisus intermedius*,
  *Medicago marina*, *Sedum acre*, *Sporobolus pungens*, más *Olea europaea* subsp. *europaea*, cuyo
  nombre EIDOS ni siquiera resuelve. Su «LC» es una afirmación a mano, plausible y sin fuente.
- **Tres tienen la evaluación en OTRO ámbito**, y ahí el campo no es un hueco sino un error:

| taxón | `iucnGlobal` de la ficha | lo que EIDOS tiene |
|---|---|---|
| *Bucanetes githagineus* | `LC` | España **NT** (2004) |
| *Hydrobates pelagicus* | `VU — Vulnerable (Lista Roja **mundial**, 1992)` | España **VU (1992)** — y su propio `iucnSpain` ya lo dice |
| *Halocnemum strobilaceum* | `LC (amplia distribución circunmediterránea y saharo-arábiga)` | España **CR** (2010) |

> **Propuesta (pendiente de decidir): retirar el `iucnGlobal` de las dos últimas.** El de
> *Hydrobates pelagicus* es literalmente su evaluación **española** con el ámbito cambiado —misma
> categoría, mismo año, y el campo hermano lo dice bien—; el de *Halocnemum strobilaceum* no es una
> categoría sino un razonamiento («es de amplia distribución, luego LC»), y encima convive con un
> **CR** español. Los dos son «un campo de fuente relleno con una suposición», que es lo que prohíbe
> la regla nº 2. Retirarlos deja el hueco honesto: la ficha seguiría enseñando su evaluación
> española, que sí está sostenida.

## C · Las 10 de estado legal: con el boletín delante

El BOE sí es legible desde el navegador, así que estas diez dejaron de necesitar una decisión.

### `spain_status` — el anexo del RD 139/2011 (LESRPE)

| taxón | la ficha afirma | el anexo del RD 139/2011 | veredicto |
|---|---|---|---|
| ***Burhinus oedicnemus*** (8 espacios) | LESRPE | **SÍ**: «Burhinus oedicnemus oedicnemus/insularum · Alcaraván común, Alcaraván majorero · Península, Baleares y Canarias Orientales», **sin categoría** = Listado | **la ficha acierta** |
| *Genetta genetta* | LESRPE | **no aparece** (la familia Viverridae no está en el anexo) | la ficha afirma de más |
| *Malpolon monspessulanus* | LESRPE | **no aparece** (sí están otros Colubridae: *Coronella*, *Hemorrhois*…) | la ficha afirma de más |

**La decisión más repetida de la auditoría queda cerrada, y en favor de la ficha.** El alcaraván
está en el Listado; lo que falla es la cobertura de EIDOS, que para este taxón solo devuelve «Anexo
IV de la Ley 42/2007». La subespecie canaria —*B. o. distinctus*— sí lleva categoría (Vulnerable),
lo que confirma que el anexo distingue Listado de Catálogo y que la peninsular está en el primero.

> **Propuesta (pendiente de decidir)** para las otras dos: sustituir el «LESRPE» por la negación
> —«No incluida en el LESRPE ni en el Catálogo Español de Especies Amenazadas»—, conservando lo que
> sí sostiene EIDOS (Anexo VI de la Ley 42/2007 y Anexo V de la Directiva Hábitats para la gineta).
> Ojo con el alcance: `spainStatus` es **universal**, así que la corrección va al catálogo y de ahí
> a las 8 + 8 fichas, y **baja el tramo estatal de 2 a 1** en todas ellas.

### `regional_status` — el Anexo I de la Ley 7/1995 · **aplicado**

El Anexo I («Catálogo de especies amenazadas de fauna silvestre de la Región de Murcia») cabe en
2.451 caracteres: cuatro apartados y 60 taxones, 24 de ellos «de interés especial». Leído entero,
los siete casos se contestan solos: **ninguno está en el anexo**, y en los siete el único espacio
que lo afirmaba era **Sierra Espuña**, que conserva textos del piloto.

*Burhinus oedicnemus* · *Epidalea calamita* · *Galerida theklae* · *Genetta genetta* ·
*Martes foina* · *Oenanthe leucura* · *Quercus coccifera* (ésta, además, citaba el **Anexo II** del
Decreto 50/2003, que no es una categoría de amenaza sino «aprovechamiento sujeto a autorización
previa»).

Corregidas en `data/estado-autonomico-correcciones.json` y aplicadas con
`corrige-estado-autonomico.js` + `especies:rareza`: **54 fichas en 13 espacios**, de las cuales 7
cambian de significado (Espuña, de tramo 3 a 1–2) y el resto **unifican la redacción** de la
negación, que venía en tres variantes distintas. Los siete taxones tienen ya **un solo texto y un
solo tramo** en todo el catálogo.

> **Y no se decidió por mayoría.** La misma lista confirma la corrección contraria: la **chova
> piquirroja** sí está en el apartado C), que es justo lo que C5 arregló dándole la razón a Espuña
> contra los otros nueve espacios.

### De propina (1): la clase G cerrada, de nueve a CERO

Con los siete corregidos, el cotejo dejaba **dos** casos de «el mismo taxón con dos tramos en la
misma comunidad», los dos de flora. Los dos se han resuelto y aplicado:

- ***Juniperus phoenicea*** — nueve espacios en tramo 3 y **Sierra Espuña en tramo 1**, con un texto
  que además nombra otro espacio («población de Cabo Cope señalada por su interés biogeográfico»),
  que es prosa del piloto en un campo que no la admite. **EIDOS confirma a los nueve** (taxonid
  5509, «Especies de interés especial», Decreto 50/2003, vigente). Espuña sube a tramo 3.
- ***Rhamnus lycioides*** — divergencia **creada el mismo día por las altas**, y conviene dejarla
  escrita porque es sutil: el anexo de Sierra de Salinas enumera *Rhamnus hispanorum*, que EIDOS
  resuelve como sinónimo de «*R. lycioides* subsp. *lycioides*» (taxonid **7731**), y es ese
  taxonid, el de la **subespecie nominal**, el que lleva la fila del Decreto 50/2003. La **especie**
  —taxonid 7730— no tiene ninguna fila. El alta se escribió con el nombre del catálogo y arrastró la
  figura legal del infrataxón. Se iguala **a la baja**: una ficha de la especie no puede afirmar una
  protección que la fuente solo da a la subespecie.

> **`npm run especies:legal` da hoy 0 casos de clase G**, que era la única de las siete clases que no
> necesita red y la que el `CLAUDE.md` describe como «el catálogo contradiciéndose consigo mismo sin
> que nada pudiera verlo».

### De propina (2): el anexo entero cotejado contra el catálogo

Con la lista delante salió barato comprobar las **239 fichas** de taxones del Anexo I: **233 dicen
su categoría** y **seis la niegan**.

- ***Hydrobates pelagicus*** en Cuatro Calas — el paíño común es **Vulnerable** en el apartado B) y
  su ficha decía «No incluida», con tramo 1. **Corregido y aplicado**: sube a tramo 4.
- ***Capra pyrenaica*** en cinco espacios — también figura como Vulnerable en el apartado B), pero
  **es especie cazable** (Anexo IV de la misma ley) y la disposición derogatoria de la **Ley 7/2003**
  dejó sin efecto lo que del Anexo I se aplicaba a las especies de aprovechamiento cinegético. **No
  se ha tocado**: es una lectura jurídica, no un cotejo. Queda como decisión.

## D · Los 4 `scientific_name`: cambian de rango o de autoridad

Ninguno entra en el renombrado automático, que exige **mismo epíteto, otro género, mismo rango**
(deuda nº 36):

| taxón fichado | EIDOS acepta | por qué no es automático |
|---|---|---|
| *Sarcocornia fruticosa* (4 espacios) | *Salicornia lagascae* | cambia el **epíteto**: es un cambio de identidad, no una recombinación |
| *Artemisia gallica* | *Artemisia caerulescens* subsp. *gallica* | el aceptado es una **subespecie**: cambia el rango |
| *Capparis zoharyi* | *Capparis spinosa* subsp. *spinosa* | ídem |
| *Caralluma europaea* (3 espacios) | *Apteranthes europaea* — y **GBIF** acepta *Ceropegia europaea* | **las dos autoridades discrepan entre sí** |

> Los tres primeros son trabajo de la deuda nº 36 cuando se aborde. El cuarto tiene respuesta en la
> regla del repositorio —«nombre e identificadores los manda EIDOS, la key la manda GBIF»—, que
> llevaría a *Apteranthes europaea*; es un renombrado de cuatro puntas y por eso se propone, no se
> ejecuta.

## E · Las 3 `gbif_species_key`: GBIF dice DOUBTFUL

| taxón | key | qué dice GBIF | ocurrencias |
|---|---|---|---|
| *Eryngium ilicifolium* (5 espacios) | 3630524 | **DOUBTFUL**, sin aceptado que ofrecer | 1 |
| *Genista longipes* | 5347560 | **DOUBTFUL**, sin aceptado | 12 |
| *Caralluma europaea* (3 espacios) | 3578145 | **SYNONYM** de *Ceropegia europaea* (9245056) | 0 |

> Recomendación: **dejarlas**. La key es la que usó el barrido y de la que salen las ocurrencias
> publicadas; cambiarla por la «aceptada» de GBIF en el tercer caso enfrentaría la ficha con EIDOS,
> que acepta otro nombre distinto. Un `DOUBTFUL` significa «GBIF no se moja», no «este taxón no
> existe».

## F · Las 4 de `image`: nueve fichas sin foto

*Ammochloa palaestina* (2), *Sideritis bourgaeana* (3), *Filago fuscescens* (2) y *Pseudopodospermum
hispanicum* (2). La auditoría ya comprobó que **no hay archivo en Commons** para ellas y que el
catálogo no tiene ni una foto rota ni una licencia inválida.

> Recomendación: **quedarse sin foto**. La app tiene una portada temática documentada para ese caso,
> y las alternativas —sacar la foto de fuentes con licencia que el repositorio no admite— cambiarían
> la regla de licencias por cuatro fichas.

## G · El `eidos_taxonid` de *Bufo bufo*

Tres espacios fichan *Bufo bufo* con `eidosTaxonId` **93827**, que en EIDOS es «*Bufo bufo bufo*
Linnaeus, 1758», de rango **subespecie**; el binomio *Bufo bufo* es sinónimo del taxonid **16219**.
Y **Carrascoy ficha *Bufo spinosus*** con ese mismo 16219.

> Es el mismo sapo con dos nombres y dos identificadores en el mismo catálogo. La respuesta que da
> la nomenclatura —el sapo común ibérico es *Bufo spinosus*— convertiría esto en un renombrado de
> tres fichas, con sus cuatro puntas. Queda como decisión.

---

## Lo que queda de verdad

1. **Retirar el `iucnGlobal` inventado** de *Hydrobates pelagicus* y *Halocnemum strobilaceum*.
2. **Quitar el «LESRPE»** de *Genetta genetta* y *Malpolon monspessulanus* (baja su tramo estatal).
3. ***Capra pyrenaica***: decidir si la derogación de la Ley 7/2003 le quita la categoría del Anexo I.
4. Los **cuatro renombrados** de la cola D y el de *Bufo bufo*.
5. Las tres keys `DOUBTFUL` y las nueve fichas sin foto: recomendación de dejarlas como están.

Todo lo demás de la cola 6 está resuelto o aplicado.
