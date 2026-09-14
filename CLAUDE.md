# NaturDex — guía para agentes

PWA offline-first de los espacios naturales protegidos de España: mapa con límites oficiales,
catálogo de hábitats y especies, y una mecánica tipo pokédex en la que descubrir una especie exige
**estar allí** (la posición se verifica contra el límite oficial).

**Esto es el índice, no el manual.** Está pensado para leerse entero (son dos páginas) y para que
después cargues **solo** el documento o la carpeta que la tarea necesite. No leas el repo a ciegas.

---

## 1. Las reglas que no se negocian

1. **El vínculo especie↔hábitat es siempre derivado.** Ninguna fuente oficial lo afirma. Se construye
   cruzando dos señales y guardando de dónde sale cada una, en `species_habitats.evidence`. Límites,
   hábitats, taxonomía y estado de conservación **sí** son dato oficial directo.
2. **Ante la duda, hueco documentado antes que dato inventado.** Un `reviewNote` visible en la app
   vale más que un campo relleno a ojo. **Nunca rellenes un campo de fuente con una suposición.**
3. **El orden de prioridad de las fuentes: legislación → EIDOS → GBIF, y GBIF solo corrobora.**
   Ninguna especie entra en el catálogo de un espacio porque GBIF tenga avistamientos suyos ahí
   dentro. Manda lo que la **norma del espacio** enumera (anexo del PORN/PRUG o del decreto de
   declaración) y lo que declara el **formulario oficial del sitio Red Natura 2000**; después, la
   figura legal de **EIDOS** y las especies características del HIC según el **Atlas**; y GBIF, al
   final, solo para **confirmar que eso está aquí**. El motivo es que GBIF no distingue lo
   característico de lo que pasaba por allí: dentro del límite de un parque caen olivos de bancal,
   ornamentales de una casa de campo y bichos en tránsito, y la app existe para enseñar la riqueza de
   un espacio protegido, no el jardín de al lado. Lo aplica `build-species-seleccion.js`, en tres
   niveles y con `--gbif-sin-respaldo` como escotilla explícita.
   > **Y lo que cuesta, que hay que tenerlo delante:** los catálogos legales enumeran *lo protegido*,
   > no *lo característico*, y lo común no está protegido por ser común. Medido el 2026-08-16,
   > **330 de 1.161 fichas (28 %) se sostenían solo en GBIF** — el romero y el pino carrasco de
   > Sierra de la Pila entre ellas. La salida no es relajar la puerta. El **índice del Atlas** —la
   > fuente que dice «esta especie es característica de este hábitat»— se completó ese mismo día y
   > rescata 32 (el pino carrasco sí; el romero **no**: el Atlas enumera diagnósticas, no
   > dominantes), así que el grueso cuelga de **transcribir los planes de gestión que faltan**
   > (deuda nº 1).
   >
   > **Y transcribirlos funciona, que es lo que había que comprobar.** Vuelto a medir el 2026-08-22
   > sobre catorce espacios: **331 de 2.094 (16 %)**. La cifra no ha bajado porque nadie relajara nada
   > sino porque los seis espacios dados de alta desde entonces llegan con su plan transcrito —o con
   > el «no hay plan» escrito en la norma, que es el caso de Sierra de las Moreras—, y ahí el suelo se
   > hunde: San Pedro del Pinatar, Calblanque, Cabezo Gordo y Sierra de las Moreras se quedan en **0**
   > fichas sostenidas solo por GBIF, y el Humedal del Ajauque en **2 de 175**. Arriba siguen los cuatro sin
   > plan —Carrascoy 50 %, Cuatro Calas 47 %, Cabo Cope 34 %, Sierra Espuña 27 %— y, con ellos,
   > **Sierra de la Pila con un 27 % teniendo el suyo transcrito**: ahí el anexo enumera 244 taxones
   > pero el catálogo tiene 160 fichas, así que lo que falla no es la puerta sino que su plan
   > inventaría el Parque Regional y buena parte de lo que GBIF ve dentro no está en esa lista. Se
   > mide en un comando: `npm run especies:niveles` — y **hay que darle el `atlas.txt`** o la señal
   > `caracteristica` no entra y el N3 sale inflado (en esta misma medición, 331 con Atlas frente a
   > 476 sin él).
4. **Universal vs. local.** Especies y hábitats son nacionales. Lo universal (qué *es* la especie, qué
   *es* el código HIC) vive en `Tools/catalogo-nacional/data/`; lo local (dónde y cómo aparece aquí)
   en cada `park.json`. **Un texto universal que nombre un espacio concreto es un error del
   validador, no un aviso.**
5. **`npm run validate` tiene que salir en verde.** Bloquea el commit vía `.githooks/pre-commit`.
6. **El huso UTM se lee del `.prj`, nunca se asume.** 28N Canarias, 29N/30N/31N península.
7. **Idempotencia como prueba.** `build-n1-espacios`, `merge-habitats`, `adopt-habitats`,
   `fix-estado-conservacion-iepnb`, `sync-species-catalog` y el volcado de ocurrencias de
   `migrations.sql` no deben cambiar un byte en un segundo pase. Si un segundo pase produce diff, hay
   un problema.
8. **Un ave no entra por sus ocurrencias.** Vuela: un registro en vuelo cae dentro de cualquier
   polígono, así que la prueba de constancia que vale para una planta ahí no mide nada. La puerta de
   las aves es el **respaldo de sitio** —el formulario oficial del sitio Red Natura 2000 o el anexo
   normativo del espacio—, y GBIF queda como confirmación.
   [`Docs/runbook/AVES.md`](Docs/runbook/AVES.md).
9. **La coordenada de una especie amenazada no se publica exacta.** Al exportar se generaliza a 1 o
   10 km según su tramo de rareza legal, y el registro lo dice. Un taxón **sin** tramo calculado se
   generaliza igual: «nadie lo ha mirado» no es «no está amenazada», y publicar de más no se puede
   deshacer. Ver [`Docs/DARWIN-CORE.md`](Docs/DARWIN-CORE.md).

## 2. Treinta cosas que fallan EN VERDE

Sin error, sin aviso, deshaciendo trabajo en silencio. Detalle en
[`Docs/runbook/ORDEN-DE-OPERACIONES.md`](Docs/runbook/ORDEN-DE-OPERACIONES.md).

- `species:apply` sin `species:extract` antes **pisa** las fotos escritas en el `park.json`. Y el
  orden que lo dispara era **el del propio runbook**, que ponía el `extract` ANTES de `images:species`
  y ninguno después: `wikimedia-images.js` escribe la foto solo en el `park.json`, así que las que
  encontraba se revertían en el mismo comando, con las dos herramientas diciendo «resueltas N» y
  «actualizadas M» en verde. Corregido el 2026-08-22 (lo pagó *Merendera filifolia*): hace falta un
  **segundo `species:extract` detrás de las fotos**.
- Una entrada obsoleta en `data/contenido/*.json` **revierte** cualquier corrección en cada extracción.
- **Renombrar un taxón** desengancha su entrada del catálogo universal y su texto de
  `data/contenido/`, que se indexan por nombre científico. Cambia la clave allí también y pasa
  `npm run species:poda`. Y deja **un tercer rastro que no se ve desde el repositorio**: en la BD, la
  fila con el nombre viejo, porque `build-park-sql.js` solo hace UPSERT. El borrado va aparte
  (`Database/poda-renombrados-*.sql`).
- **Corregir un campo UNIVERSAL en el `park.json`** —`taxonomy`, `description`, `image`…— y no en
  `data/especies-universal.json`: el siguiente `species:apply` lo revierte en silencio, porque es de
  ahí de donde reparte. Pasó el 2026-08-17 con el género del romero, corregido en los ocho espacios y
  devuelto a «Salvia» acto seguido. La prueba de que la corrección está en el sitio bueno es pasar
  `species:extract` + `species:apply` detrás y ver «actualizadas 0».
- **Un nombre científico que la autoridad ya da por sinónimo** no falla: el cruce contra el
  formulario del sitio o el anexo de la norma se hace por nombre, así que la especie queda fuera con
  un motivo escrito al lado que es mentira. `scan-taxones-duplicados` **no puede verlo** —busca un
  taxón dado de alta dos veces y éste está una sola—; lo caza `taxones:nomenclatura`.
- **Regenerar un espacio ya publicado le devuelve las aves que `aves:poda` le quitó.**
  `build-species-n2.js` reescribe el catálogo entero desde la **selección aprobada**, y la poda no
  toca la selección: ocho de los dieciséis espacios de Murcia pasaron por ella DESPUÉS de escribirse.
  Un `--dry` sobre Sierra de la Pila anuncia **243 fichas** donde hoy hay 219, y las 24 de diferencia
  son aves resucitadas. No avisa nadie: la herramienta está haciendo su trabajo. En un espacio
  publicado **no se regenera para cambiar un campo**; se escribe una herramienta que toque solo ese
  campo (`aves:fenologia`, `atlas:aplica`, `taxones:trinomios`).
- **La API tiene prioridad sobre el `park.json` empaquetado.** Con backend desplegado, tocar solo el
  frontend no cambia lo que ve el usuario: hay que generar y aplicar también el SQL.
- **Un extractor de PDF distinto = cero resultados sin aviso.** Le pasó al Atlas de Hábitats, que solo
  se sabía leer en el formato de `pdftotext -layout`. Si una herramienta que lee texto extraído
  devuelve 0, sospecha del formato antes que del dato — y haz que se queje, como hace ya
  `lib/atlas.js`. **Y el modo peor no es el cero, que se ve: es el resultado A MEDIAS, que no.**
  Medido el 2026-08-25 sobre los dieciséis espacios de Murcia: el texto de Xpdf con `-layout`
  recupera 34 enlaces del Atlas en Sierra de El Carche que el índice versionado no tenía **y a la
  vez pierde quince** de Sierra Espuña que ese índice sí traía. Ninguno de los dos extractores cubre
  al otro, así que elegir uno tira dato en las dos direcciones y las dos salidas parecen completas.
  Por eso `atlas-hic-especies.js` admite **varios textos** y `--fusiona`: el Atlas se usa **solo en
  positivo**, y retirar un enlace porque este parser no lo ha leído es borrar un dato por una
  limitación de herramienta. **Y `fuentes/atlas.txt` NO es reproducible, aunque este mismo
  repositorio lo diga en tres sitios** (es el motivo por el que no se versiona): el texto de poppler
  con el que se hizo Sierra de las Moreras el 2026-08-22 daba **631** especies características para
  sus HIC y los dos que hoy quedan en `fuentes/` dan **494 entre los dos** — y aquí no hay poppler,
  el `pdftotext` disponible es el de Xpdf. Regenerar leyendo un solo texto le quitaba **seis fichas**
  con el motivo «solo GBIF: ninguna fuente documental la respalda» escrito al lado, que es mentira.
  Desde el 2026-08-28 (b) `build-species-seleccion.js` lee también varios textos **y el índice
  versionado del espacio** (`out/<slug>-hic-especies.json`), que es lo único del Atlas que sí está en
  el repositorio; suma y no resta. Deuda nº 42.
- **Un `Set` no se aplana con `.flat()`, y el puente del Atlas llevaba tres días sin tender ni uno.**
  `porHic` es un `Map<código, Set<nombre>>` y `[...porHic.values()].flat()` devuelve la lista de
  `Set`, no de nombres: a EIDOS se le preguntaba **una sola vez, por el literal `[object Set]`**, se
  cacheaba su `null` y las demás se saltaban. La deuda nº 26 tenía la herramienta escrita desde el
  2026-08-25 y estaba pagada a cero. Nada fallaba y nada podía verlo: el número de fichas aprobadas
  no cambia por esto, solo el nivel de unas pocas. Arreglado, son **51 recombinaciones**. La lección
  general: **una fuente que se consulta con la clave equivocada responde, y responde que no.**
- **Un campo universal que el catálogo no trae se OMITE; escribirlo `null` deja `validate` en rojo en
  la siguiente regeneración.** `build-species-n2.js` copiaba `u[campo] === undefined ? null : …`, y
  con `iucnSpain` —que llegó el 2026-08-27, con los quince espacios ya escritos sin él— eso son 21
  errores nada más regenerar un espacio: la coherencia entre parques compara con `JSON.stringify`, y
  ahí `null` y ausente son distintos. **No lo arregla `species:apply`**, que salta a propósito los
  campos que el catálogo no tiene; y el `species:extract` que el runbook manda pasar detrás **copia
  esos `null` AL catálogo universal**, desde donde se repartirían a los dieciséis espacios. Es la
  misma regla que ya tenía escrita `lista-roja-espana.js`: lo que la fuente no trae se queda **sin
  campo**, nunca con un «No evaluada».
- **Un `park.json` reescrito y un manifiesto sin subir de versión.** El manifiesto es lo que decide
  si un dispositivo con el espacio guardado sin conexión vuelve a descargarlo, así que una
  herramienta que escribe fichas y no toca `version` deja al usuario que ya lo tenía guardado con el
  dato viejo — sin error, sin aviso, y sin que el repositorio se entere de nada, porque en el
  repositorio el dato SÍ está bien. Eran **siete** copias de las mismas cuatro líneas: dos las
  habían olvidado —`aplica-fenologia-aves.js`, con trece espacios reescritos, y
  **`sync-species-catalog.js`**, que es `npm run species:apply` y está en todos los runbooks detrás
  de cualquier corrección universal—. **Tapado el 2026-08-25 (b)** (deuda nº 37): ahora es
  `escribeEspacio()` en `Tools/lib/io.js`, y escribe **el `park.json` y el manifiesto juntos** — no
  hay puerta para publicar fichas que no suba la versión sola. Una herramienta nueva que toque un
  `park.json` **usa esa función**; no copia las cuatro líneas.
- **`species:apply --sql` no volcaba a la BD cinco de los quince campos universales**: `kingdom`,
  `group` (columna `family`), la `taxonomy` entera, `iucnGlobal` y `spainStatus`. Y la API manda
  sobre el paquete, así que corregir cualquiera de esos cinco dejaba el dato **bien en el repo y mal
  en lo que ve el usuario**, por la ruta que el propio runbook manda usar. Tapado el 2026-08-25 (b)
  (deuda nº 40). La lección que se generaliza: **un campo que se sincroniza al `park.json` y no a la
  BD no está sincronizado**, y el sitio donde se ve es el generador de SQL, no el del `park.json`.
- **`npm run aves:fenologia` sin `--online` retiraba lo que el pase con red había escrito.** Del
  puente que casa el nombre del formulario con el del catálogo, **la capa que consulta EIDOS solo
  corre con `--online`**, y el comando documentado no lleva la bandera: un `--write` a secas trataba
  «no he sabido cruzar el nombre» igual que «el formulario no la declara» y quitaba `migratory` y
  `sitePresence` a **53 fichas de ocho espacios**, deshaciendo la deuda nº 35 con un diff que parecía
  una limpieza. **Tapado el 2026-08-25 (b)** (deuda nº 38) con la regla simétrica a la del Atlas:
  para RETIRAR un campo hace falta evidencia positiva, y aquí la evidencia positiva es haber
  cruzado. La lección es general: **una fuente que no se ha podido consultar no dice que no.** Y la
  misma trampa estaba en la auditoría de enlaces por otra puerta: `auditoria-especie-habitat.js`
  retiraba el enlace «sin constancia» **sin preguntar de dónde salía**. La rama del vuelo sí lo
  pregunta; a la de constancia se le había olvidado, y con los tres barridos nuevos del 2026-08-25
  (b) habría borrado **38 enlaces documentales de Cabo Cope** —la azucena de mar en las dunas
  embrionarias, la adelfa en la galería ribereña, el palmito en el sabinar— que salen del artículo de
  Alcaraz Ariza, del Anexo I del PORN y de las «Bases ecológicas» del HIC, no de ningún barrido.
  Tapado igual: un enlace cuya ficha **no tiene `gbifOccurrences`** no se retira por el silencio de
  GBIF.
- **Cruzar una fuente oficial con el catálogo por el nombre**: la fuente cita con la nomenclatura de
  su época (*Sylvia undata*) y el catálogo con la de hoy (*Curruca undata*). No falla: excluye la
  especie y escribe al lado un motivo que es mentira («no figura en el formulario oficial»). Resuelve
  contra EIDOS el nombre **de la fuente**, no solo el del candidato. Ver
  [`Docs/runbook/AVES.md`](Docs/runbook/AVES.md) §5.
- **Una corrección hecha en el `park.json` y no en el pipeline** la deshace la siguiente
  regeneración. La curruca rabilarga se arregló en una ficha el 2026-08-09 y las cuatro Capas 3
  generadas después la volvieron a partir en dos. Arregla **el dato y la entrada de `data/`**.
- **`build-park-sql.js` solo hace UPSERT.** Quitar una ficha del `park.json` y regenerar el SQL deja
  la BD igual, y la API manda sobre el paquete: el usuario la sigue viendo. El borrado va aparte.
- **Un `rarityScore` sin `rarityBasis` es un número puesto a ojo, y ascendía solo al campo que ve el
  usuario.** `build-species-n2.js` lo usaba de suelo del `rarityLocal` —«el local incluye al
  estatal»— sin comprobar que viniera de una norma, y de paso pisaba el `rarityLocalBasis` derivado
  con uno sin `categoria` ni `norma`, así que el cartel de la ficha se quedaba sin la figura legal
  que debía citar. Nada fallaba: el número estaba en el tramo 1–5 y `validate` solo lo avisaba. Eran
  **446 fichas en ocho de los once espacios con catálogo**, la siempreviva de Cartagena entre ellas,
  anunciada «En peligro» siendo **Vulnerable** en el Decreto 50/2003. Tapado el 2026-08-21 en las
  dos puntas —el pipeline y la reserva de `Frontend/Js/rareza.js`— y recalculados los ocho espacios;
  la migración de fondo del catálogo universal es la deuda nº 29.
- **La evidencia del Atlas se escribía en el `source` y no tendía ningún enlace.** El vínculo
  especie↔hábitat salía **solo** del barrido de GBIF, mientras la ficha afirmaba «Atlas y Manual de
  los Hábitats de España (MITECO, 2005): especie característica de alguno de los HIC cartografiados
  aquí». Una especie con esa frase y **cero ocurrencias** dentro quedaba con `habitatIds: []`: el
  texto decía lo contrario que el dato. El guardián que persigue justo esa contradicción
  (`hiloPerdido`, en `build-species-n2.js`) **no puede verlo**, porque solo salta si la selección
  cuenta hábitats y los cuenta con GBIF; con cero ocurrencias la ficha sale por `sinGbif`, que es un
  aviso normal. Y la salida de `atlas-hic-especies.js` —«el backbone determinista de enlaces
  especie↔hábitat», dice su propia cabecera— **no la cargaba ninguna herramienta**: la auditoría la
  leía solo para *no retirar*, nunca para añadir. Se tiraba la señal **fuerte** —el Atlas afirma que
  la especie es característica de ese tipo de hábitat— y se guardaba la floja —una ocurrencia solo
  prueba que alguien la registró dentro del polígono—. Tapado el 2026-08-21 en el pipeline y aplicado
  a Cabezo Gordo; quedan **110 enlaces en 106 fichas de nueve espacios** (deuda nº 32). Ojo con la
  otra mitad: **un espacio sin su `out/<slug>-hic-especies.json` no tiene Atlas**, y hasta ese día
  eso no lo decía nadie.
- **Una fanerógama MARINA colgando de cinco matorrales, y el cotejo de medio diciendo que está bien.**
  El vínculo especie↔hábitat se coteja con `lib/medios.js`, que compara el medio del HIC con el que
  declara la ficha. La *Posidonia oceanica* —cuya propia ficha dice «fondos marinos arenosos, hasta
  40 m de profundidad»— estaba enganchada a **cinco** hábitats en Cabo Cope y **diez** en San Pedro
  del Pinatar: matorral, dunas, saladar y hasta un tarayal. Dos silencios encadenados: (1) no existía
  el medio `marino`, y la palabra suelta «marino» del léxico COSTERO leía «fondos marinos» como
  costa, que es compatible con matorral y con duna; (2) `MEDIOS_EXIGENTES` mira el medio del
  **hábitat**, y aquí el hábitat es terrestre y la marina es **la ficha**, así que aunque el medio se
  leyera bien la auditoría no retiraba nada. Tapado el 2026-08-29 con el medio `marino` y con
  `MEDIOS_EXIGENTES_FICHA`. La lección general: **un cotejo asimétrico solo caza la mitad de los
  casos**, y hay que preguntarse siempre por el otro lado. Y ojo, que el catálogo ya tenía escrito el
  precedente: `data/exclusiones-especies.json` excluye la tortuga boba de Carrascoy «porque es
  marina y este parque es de interior» — la regla existía y nadie la aplicó a la posidonia.
- **`--sql` de la auditoría de enlaces NO es acumulativo, y por eso pierde la cola pendiente.**
  `auditoria-especie-habitat.js --write --sql` corrige el `park.json` **y** redacta el borrado para
  la BD. En el pase siguiente ya no ve esos enlaces —los quitó él mismo del `park.json`—, así que
  reescribe el fichero SQL sin ellos: si el anterior no se había aplicado a la base, **desaparece de
  la cola sin que nada lo diga**, y la BD se queda sirviendo unos enlaces que el repositorio da por
  retirados. Detectado el 2026-08-29 al regenerarlo en Cabo Cope: se perdían **14 sentencias** de
  doce aves. La regla es la de siempre —un fichero generado que es COLA y no espejo tiene que
  fusionar— y hasta que se arregle: **mira el fichero viejo antes de regenerarlo**.
- **EIDOS sirve los nombres comunes en las cuatro lenguas, y «el preferente en castellano» no lo era.**
  `lib/eidos.js` cerraba la cadena de reservas con `|| filas[0]`: si el taxón no tiene nombre
  castellano, devolvía **el primero en el idioma que fuera**, y quien llamaba se creía que era
  castellano porque es lo que promete la firma. Sobre las 126 fichas del catálogo cuyo `commonName`
  es hoy el propio nombre científico, esa reserva «recuperaba» **40 nombres, y los 40 en catalán o
  euskera** —«gavó sicilià», «lletsó resedifoli», «hirusta»—. Con el filtro bien puesto son **0**:
  no es que el pipeline fallara, es que esos taxones **no tienen nombre castellano en EIDOS**, y el
  nombre científico en su ficha es el hueco honesto. Corregido el 2026-08-29; ninguna ficha ya
  escrita lo había cogido (617 comprobadas contra la fuente).
- **Una ocurrencia dentro de un polígono no dice que la especie viva ahí.** Es la regla con la que se
  derivan los 4.379 enlaces especie↔hábitat, y en un hábitat que es una cinta de metros —un
  manantial, una charca, un cauce— cualquier registro tomado en el sendero de al lado cae dentro. En
  Carrascoy había una ardilla roja y un algarrobo fichados en manantiales petrificantes. Se repasa
  con `npm run especies:habitats`; el **40 % de los enlaces medibles se sostiene sobre un solo
  registro** y eso sigue abierto (deuda nº 22).
- **Un anexo normativo cuyo ÁMBITO desborda el espacio metía en su catálogo las especies del espacio
  grande.** El nivel 1 —entrar sin exigirle nada a GBIF— se apoya en que la norma afirme la
  pertenencia a *este* espacio, y el `_esquema` de `anexos-normativos.json` ya avisaba de que el
  ámbito «no siempre es el del espacio»… pero eso solo se escribía en el `source` de la ficha, sin
  cambiar ninguna decisión. El PORN de 1995 es a la vez el de **Sierra Espuña** y el de los
  **Barrancos de Gebas**: un inventario para 19.679 ha de las que el Paisaje Protegido son 1.875
  (9,5 %). Con el nivel 1 a secas, Gebas salía con **183 fichas** —el acentor alpino, el
  treparriscos, el mirlo capiblanco y el piquituerto en unas cárcavas semiáridas de 200 m—, casi las
  188 de la sierra entera, y sin un solo aviso. Se tapó el 2026-08-22 con `fuente.exigeConstancia`:
  puesto ese campo, el anexo deja de ser puerta y pasa a exigir que GBIF lo corrobore dentro de los
  polígonos, como el nivel 2 (86 fichas). Es opcional y por defecto `false`, así que **ningún espacio
  anterior cambia** — pero el del Mar Menor, que inventaría seis espacios más la franja marina, hay
  que mirarlo con este campo en la mano.
- **Un campo que responde a una pregunta parecida pero no a la misma.** `zepaSiteCode` dice «el
  formulario oficial del sitio declara a esta ave»; la app lo leía como «esta ave es migratoria» y
  pintaba con él el distintivo «🕊️ Ave migratoria» de la ficha, la barra de progreso del mismo
  nombre y el logro «Gran observador de aves». Son dos cosas distintas y el propio formulario lo
  dice, especie a especie, en su **tipo de población**: permanente, reproductora, invernante o en
  concentración. Medido el 2026-08-24: **154 aves de población permanente** —el búho real, la
  perdiz roja y el cuervo de Sierra de las Moreras entre ellos— anunciadas como migratorias. No
  fallaba nada, no había aviso, y el dato bueno llevaba desde el principio en el repo: se escribía
  en el `source` de la ficha, en prosa, donde ninguna herramienta podía leerlo. Tapado con
  `migratory` + `sitePresence` (`Tools/lib/fenologia.js`); el criterio vive en un solo sitio porque
  lo usan las dos puntas, el pipeline y `npm run aves:fenologia`.
- **Una comprobación que da una clase por IRRECUPERABLE, y la frase que lo dice envejece peor que el
  dato.** `coteja-nomenclatura.js` enumeraba dos `gbifSpeciesKey` de rango familia y género —la 3064
  es Amaranthaceae, 5.039.294 ocurrencias— con el motivo «ningún espacio la ficha con una key de
  especie, así que **no hay de dónde copiarla**». Nadie volvió a mirarlas: la herramienta ya había
  dictaminado. Y era verdad *dentro del catálogo* y falso fuera: GBIF escribe *Sideritis **ibanezii***
  sin la «y» de EIDOS, y a *Salsola vermiculata* no llegaba porque el backbone tiene **cuatro
  homónimos** de ese binomio y ante la ambigüedad **sube a la familia** en vez de fallar. Un
  `HIGHERRANK` significa «no he sabido desambiguar», **no** «ese taxón no está», y la salida es
  preguntar por el nombre de la OTRA autoridad. Peor todavía: la misma cabecera daba *Anabasis
  hispanica* por intocable porque «*A. articulata* es otra especie para EIDOS», y EIDOS mete los dos
  nombres bajo el **mismo taxonid 1838**. Una afirmación falsa en un comentario **no se puede
  comprobar con `validate`**: se queda ahí sosteniendo una decisión durante meses. Resuelto el
  2026-08-27 (deuda nº 4). La regla: **la etiqueta de una autoridad dice lo que opina esa autoridad,
  no si dos autoridades discrepan** — eso hay que ir a preguntárselo a la otra, taxón a taxón.
- **Dar de alta una ficha que el espacio YA tiene con otro nombre, y que ningún guardián puede ver.**
  El anexo de un plan enumera *Rhamnus hispanorum* y el catálogo ficha ese mismo espino negro en
  siete espacios como *Rhamnus lycioides*; el anexo enumera *Gymnosporia senegalensis* y Calblanque
  ya la ficha como *Maytenus senegalensis* subsp. *europaea*. No lo caza nada: `taxones:duplicados`
  compara `eidosTaxonId` y son distintos (la especie y su subespecie, 6257 y 6258), y el cruce por
  binomio no casa porque **cambia el género**. La primera trampa es de comparación —`resolverNombre()`
  de `build-species-n2.js` comparaba el nombre aceptado de EIDOS **por igualdad**, y EIDOS lo escribe
  **con autor** («Rhamnus lycioides L. subsp. lycioides»), así que no casaba nunca y el renombrado se
  convertía en alta—; se arregla con `nameMatches()` de `lib/eidos.js` y la guarda de la subespecie
  **nominal** (el tercer epíteto repite el segundo; una subespecie distinta NO es el mismo taxón, que
  sería la deuda nº 36). La segunda no tiene arreglo automático y hay que mirarla: de 456 altas, el
  cruce por **epíteto + familia** deja **cinco** parejas y acierta en dos. Y el peor caso es el que
  ni eso ve: *Scilla autumnalis* y *Prospero autumnale* son la misma planta y **EIDOS devuelve las
  dos como aceptadas**, con taxonid distinto. La regla: **antes de dar de alta, pregúntale al espacio
  si ya la tiene con otro nombre** — y lo que se decida se escribe en `data/exclusiones-especies.json`,
  que es lo único que sobrevive a la siguiente regeneración.
- **La herramienta con la que se aplica TODO a la base decía «OK» habiendo escrito la mitad.**
  `Tools/import-sql.php` manda el fichero entero con `multi_query`, y un fallo de sintaxis a la mitad
  rompe el hilo: `next_result()` devuelve false, el bucle sale por la condición del `while` **con el
  errno puesto en la conexión y nadie mirándolo**, y la salida era «OK · N sentencias ejecutadas» con
  código 0. Todo lo que venía detrás no se ejecutaba y nada lo decía; así se aplicó un
  `Database/glosario.sql` que no escribió una fila. No es la única forma de no aplicar nada por esa
  vía: **conecta sin base seleccionada a propósito** y la URL de Railway apunta a `railway`, así que
  el comando que el propio runbook documentaba fallaba con «No database selected» — ése al menos se
  ve. Tapado el 2026-09-14 con la comprobación del errno detrás del bucle; la regla que queda es la
  de siempre: **cuenta las filas después de aplicar**, que es lo único que no depende de que la
  herramienta se entere. [`Docs/runbook/APLICAR-A-RAILWAY.md`](Docs/runbook/APLICAR-A-RAILWAY.md).
- **Un `-n2.sql` versionado puede ir por detrás de su propio `park.json`, y aplicarlo escribe el dato
  viejo.** El de Ajauque se había generado ANTES del `species:apply` que repartió la taxonomía, así
  que traía `NULL, NULL` donde el paquete ya decía «Falconiformes, Falconidae»: diez fichas. No lo ve
  nadie —`validate` coteja el `park.json` con su manifiesto y con el geojson, **no con el SQL**— y la
  carga sale en verde, porque el fichero es válido. Se caza regenerando los dieciséis y mirando
  `git status Database/`: el que salga modificado es el que iba atrasado. La otra mitad del mismo
  problema es de medición: el inventario que compara el n2 nuevo con el VIEJO no ve este caso (los
  dos ficheros coinciden), así que **la cifra buena se mide contra la BASE** y no contra el fichero
  anterior — ahí eran 178 fichas y no 168.
- **Una clave única de texto en MySQL ignora los acentos, así que dos filas del fichero son UNA en la
  tabla.** `glosario.term` es `UNIQUE` con `utf8mb4_unicode_ci`: «foliolo» y «folíolo» son el mismo
  término para la base. El seed declaraba 219 y la tabla se quedaba en 218, sin un solo error, con la
  segunda definición pisando a la primera. Estaban duplicados en el origen —cada entrada citaba a la
  otra como alias— y se fundieron el 2026-09-14. La regla: al cargar una tabla con clave única de
  texto, **cuenta las filas después y compáralas con las del fichero**.
- **Un campo LOCAL que en realidad no es local, y el catálogo contradiciéndose consigo mismo sin que
  nada pudiera verlo.** `regionalStatus` guarda la figura del catálogo autonómico y es local —lo
  lleva cada `park.json`—, así que la coherencia entre parques de `validate` no lo mira: solo compara
  los campos UNIVERSALES. Y es correcto que sea local, porque el día que entre otra comunidad la
  misma especie tendrá legítimamente dos estados. Pero **dentro de una misma comunidad no puede
  tenerlos**: la Ley 7/1995 protege a la garduña en toda la Región de Murcia o en ninguna parte. Pues
  había **nueve taxones con dos tramos distintos** según el espacio —el alcaraván, el sapo corredor,
  la cogujada montesina, la gineta, la garduña, la collalba negra, la chova piquirroja, la coscoja y
  la sabina negral—, y en los nueve el raro es **Sierra Espuña**, que conserva textos del piloto. No
  fallaba nada: los dos textos son prosa bien escrita, y de esa prosa cuelgan el nivel 2 de
  `especies:niveles` y el `rarityLocal` de `especies:rareza`. Lo caza `npm run especies:legal`
  **sin gastar una petición** (2026-08-29, deuda nº 43), y **no se arregla por mayoría**: en la chova
  piquirroja el texto bueno es el del espacio que va solo. La regla general: **un campo local que
  describe algo territorial necesita su propia coherencia, agrupada por el territorio del que
  habla** — ni por parque ni globalmente.

---

## 3. Dónde buscar, según la tarea

| Si la tarea es… | Empieza por |
|---|---|
| Entender el modelo de datos | [`Docs/arquitectura/MODELO-DE-DATOS.md`](Docs/arquitectura/MODELO-DE-DATOS.md) |
| Saber de dónde sale un campo | [`Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md`](Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md) — campo a campo, con las URLs de las fuentes |
| Dar de alta o ampliar un espacio | [`Docs/runbook/ALTA-DE-ESPACIO.md`](Docs/runbook/ALTA-DE-ESPACIO.md) + [`Docs/runbook/TRAMPAS-CONOCIDAS.md`](Docs/runbook/TRAMPAS-CONOCIDAS.md) |
| Tocar cualquier cosa de aves | [`Docs/runbook/AVES.md`](Docs/runbook/AVES.md) — **entran por otra puerta que el resto**, y el documento dice también qué NO cubre esa puerta |
| Dudar de si una especie pertenece al hábitat del que cuelga | [`Docs/auditoria-especie-habitat.md`](Docs/auditoria-especie-habitat.md) — el estado de los 4.379 enlaces, enlace a enlace. Lo regenera `npm run especies:habitats`; el criterio vive en la cabecera de la herramienta y en `Tools/lib/medios.js` |
| Dudar de la figura legal que declara una ficha | [`Docs/cotejo-estado-legal.md`](Docs/cotejo-estado-legal.md) — el texto de `spainStatus` y `regionalStatus` contra EIDOS, en siete clases. Lo regenera `npm run especies:legal -- --online`; tres de las siete clases salen **sin red** |
| Saber en qué estado está un espacio | [`Docs/rollout/ESTADO.md`](Docs/rollout/ESTADO.md) — **la tabla**. Los informes de cierre están en `Docs/rollout/sesiones/`, uno por periodo: entra solo al que haga falta |
| Tocar el frontend | [`Frontend/Js/CLAUDE.md`](Frontend/Js/CLAUDE.md) |
| Tocar la API | [`Backend/CLAUDE.md`](Backend/CLAUDE.md) |
| Escribir o usar una herramienta | [`Tools/CLAUDE.md`](Tools/CLAUDE.md) — **mira `Tools/lib/` antes de escribir nada nuevo** |
| Tocar SQL | [`Database/CLAUDE.md`](Database/CLAUDE.md) — qué fichero es fuente y cuál es generado |
| Llevar a la base lo corregido en el repo | [`Docs/runbook/APLICAR-A-RAILWAY.md`](Docs/runbook/APLICAR-A-RAILWAY.md) — las dos vías, el orden, la cola pendiente y qué mirar antes de pulsar |
| Tocar avistamientos, ocurrencias o su exportación | [`Docs/DARWIN-CORE.md`](Docs/DARWIN-CORE.md) — término a término, qué se generaliza y por qué |
| Elegir el siguiente trabajo | [`Docs/DEUDA-TECNICA.md`](Docs/DEUDA-TECNICA.md), por orden de rentabilidad, y [`Docs/auditoria-consolidado.md`](Docs/auditoria-consolidado.md) — los 2.159 hallazgos de la auditoría del catálogo convertidos en **733 correcciones** distintas, por colas y con lo ya hecho marcado. Lo regenera `npm run auditoria:consolida` |
| Recordar un comando | [`Docs/COMANDOS.md`](Docs/COMANDOS.md) |

## 4. Búsqueda: lo que está excluido a propósito

`.ignore` (para `rg`) y `permissions.deny` en `.claude/settings.json` sacan de las búsquedas los
bundles compilados, los volcados SQL de datos, las teselas, los binarios y las descargas de fuentes.
Son megabytes de dato generado sin nada que buscar a mano.

**Sí** se buscan: `Database/schema.sql`, `Database/migrations.sql`, todo `Frontend/Js/`,
`Backend/`, `Tools/`, `AdminPanel/src/` y `Docs/`.

Para saltarse la exclusión puntualmente: `rg --no-ignore <patrón> <ruta>`.

---

## 5. Comprobaciones antes de dar nada por hecho

```bash
npm run validate            # BLOQUEA. Coherencia park.json ↔ manifest ↔ geojson, contadores,
                            # integridad especie↔hábitat, licencias de foto, presupuesto offline
npm test                    # reglas de presencia y progreso (PHP, sin BD)
npm run typecheck           # tsc --noEmit sobre AdminPanel
npm run taxones:duplicados  # sale con código 1 mientras queden
npm run taxones:nomenclatura # el nombre de la ficha contra EIDOS y GBIF; sin --online no gasta red
npm run especies:habitats   # repasa los enlaces especie↔hábitat; sin --write no toca nada
npm run especies:legal      # la figura legal que AFIRMA la ficha contra EIDOS; nunca escribe.
                            # Sin --online salen igual las clases D, F y G (G no necesita a EIDOS)
npm run glossary:check      # editorial, no bloquea
```

Sin red externa, casi todo `Tools/` falla con errores que no explican nada: `npm run red:check` lo
dice en diez segundos.

## 6. Convenciones de este repo

- **Comentarios de cabecera obligatorios.** Cada módulo abre explicando *qué problema resuelve*, no
  qué hace. Es la convención más valiosa que tiene el repo: mantenla en todo fichero nuevo.
- **Todo en castellano**: código, comentarios, documentación y commits.
- **Frontend sin build ni framework**: módulos ES nativos. El AdminPanel sí es React+Vite y se
  compila a `Frontend/admin/`.
- **Tooling zero-dep** salvo `polygon-clipping`.
- **JSON canónico**: `io.writeJson` (2 espacios + salto final). Escribir de otra forma produce un
  diff completo aunque no cambie ningún dato.
- **Al cerrar una sesión de rollout**: el informe va en `Docs/rollout/sesiones/<periodo>.md` y en
  `Docs/rollout/ESTADO.md` solo la fila de la tabla y una línea de índice.

## 7. Aviso

Este catálogo es recopilación sobre fuentes públicas, **no un inventario validado en campo**. No
presentes un dato derivado como si fuera oficial.
