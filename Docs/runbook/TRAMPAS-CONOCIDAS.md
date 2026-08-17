# Trampas conocidas

Cada una costó una sesión de depuración. Léelas antes de repetirlas.

**Geometría y cartografía**

- **Hay que reproyectar.** Pese a que GeoJSON exige WGS84, el MITECO publica en UTM y lo declara en el
  miembro `crs`. Sin reproyectar, el parque se dibuja en mitad del Atlántico. El validador tiene una
  comprobación específica para cazarlo (vértices fuera de la caja de España).
- **El huso depende de la región**: 28N Canarias, 29N, 30N, 31N. Léelo del `.prj`, no lo supongas.
- **Se generaliza en UTM, no en grados.** Un grado de longitud mide ~88 km aquí y uno de latitud ~111:
  la misma tolerancia deforma más en un eje que en otro.
- **Lectura por streaming.** `Enp2025_p.json` pesa 190 MB y el de Red Natura 620 MB, ambos en **una
  sola línea**: un `JSON.parse` revienta el heap de Node.
- **El solape con Red Natura se mide, no se supone.** El bbox da falsos positivos (una ZEPA marina
  grande envuelve un monumento de interior sin tocarlo). Se usa solo como prefiltro barato.
- **Un espacio protegido suele ser multiparte y con enclaves excluidos.** Recortar contra el primer
  anillo dio un límite 446 ha mayor que el real en Sierra Espuña.
- **`COBERTURA` viene vacía** en el dato de 1997 y el flag `PRIORITARI` es poco fiable.
- **Códigos HIC antiguos**: `8230` + asociación `Hypericion ericoidis` es roquedo casmofítico
  calcícola → hoy **8210**. Reconciliar **solo si la asociación lo justifica**.
- **El dato oficial es un MOSAICO**: un recinto lleva varios HIC sobre el MISMO polígono (el mayor de
  Cuatro Calas cataloga nueve), así que una ocurrencia cae en todos a la vez y la geometría no permite
  discriminar. Criterio: si el Atlas respalda la especie para alguno de los HIC del recinto, se enlaza
  **solo a ésos**; si no, a todos.
- **Un código ausente de `hic-nombres.json` se salta el filtro marino.** Sin ficha, el pipeline le pone
  nombre `HIC <código>` y tipo `Hábitat`, que no es un tipo excluido — y así entró un hábitat marino de
  0 ha llamado literalmente «HIC 1110». Para códigos que la cartografía recorta dentro del espacio pero
  que su formulario normalizado **no declara**, está `data/hic-excluidos.json`.

**Taxonomía**

- **Las tres fuentes reclasifican y usan nomenclaturas distintas** (Larus→Ichthyaetus, Salvia
  rosmarinus→Rosmarinus, Accipiter→Astur, Stipa→Macrochloa). Sin `eidos_taxonid` como clave maestra, al
  décimo parque hay diez fichas del mismo águila con textos divergentes.
- **El punto ciego de identificar por nombre**: si el mismo taxón se da de alta con el basónimo en un
  espacio y con el nombre aceptado en otro, para el validador son dos especies y no hay nada que
  comparar. Pasó con el esparto. `npm run taxones:duplicados` agrupa por identificador externo, que es
  lo único que lo delata, y **sale con código 1 mientras queden**.
- **GBIF sirve el sinónimo y el nombre aceptado como DOS especies**, cada uno con su `speciesKey` y
  sus ocurrencias, y los dos pasan los filtros. En Sierra de la Pila entraron *Sylvia melanocephala*
  (230 registros) y *Curruca melanocephala* (24) **en el mismo espacio**, y lo mismo con *Picus
  viridis* / *Picus sharpei*. Quien los identifica es EIDOS: mismo `taxonid`.
  `build-species-seleccion.js` reconcilia por ahí y elige **el nombre que ya use otro parque**, para
  reutilizar su ficha en vez de crear una gemela. Ojo al renombrar: el nombre viejo se queda en el
  `park.json` como especie fantasma si no pasas `--podar`.
- **La errata de la norma le quita a la especie su respaldo documental, y en silencio.** El anexo
  normativo se transcribe **verbatim** —lo manda el `_esquema` del fichero— y se indexaba **solo** por
  ese nombre, así que *Taradia teniotis* o *Anthillis cytisoides* no casaban con GBIF por una letra:
  la especie caía al filtro de presencia como si ninguna norma la nombrara, sin un aviso. Lo mismo con
  la nomenclatura en desuso (*Saxicola torquata*, *Parus ater*). Se arregló el 2026-08-15 con el campo
  **`nombreCorregido`**, que se indexa junto al verbatim sin tocar la transcripción; había **49
  entradas afectadas en tres espacios** y en Monte Arabí solo recuperarlas subió el cruce anexo↔GBIF
  de 48 a 60. La corrección se **verifica contra GBIF antes de escribirla**, nunca de memoria.
- **No trunques el nombre a dos palabras** para emparejar: rompe las subespecies. Se empareja por
  prefijo terminado en espacio (`eidos.nameMatches`).
- **El cruce con el Atlas hay que hacerlo con los DOS nombres** (el de GBIF y el aceptado por EIDOS).
  Con solo el de GBIF, *Periploca laevigata* no casaba con la *P. angustifolia* del Atlas y la especie
  diagnóstica del 5220 se quedaba sin enlace — y el hábitat, sin portada.
- **La misma columna se llama distinto según la vista de EIDOS**: `taxonid` en `v_taxonomia`,
  `idtaxon` en las de detalle, `id_taxon` en `v_imagenes`. Filtrar por la equivocada **no da error
  HTTP**: PostgREST devuelve 200 con un objeto de error, el `for...of` revienta y el informe sale con
  «0 rellenadas / 0 sin foto», como si no hubiera nada que hacer. `eidos.rows()` normaliza a array.
  Lo mismo en `v_nombrescomunes`, que llama a lo suyo `nombre_comun` y `espreferente`: pedirle
  `nombre`/`preferente` devuelve **400** y así estuvo rota `eidos.commonName()` desde que se escribió.
- **`ambito` NO basta para saber si una norma es estatal.** EIDOS sirve las filas del Catálogo
  Regional de **Castilla-La Mancha** con `ambito: "Nacional"`; lo único que las delata es que traen
  **`ccaa` relleno**, y una norma estatal no tiene comunidad. De ahí salieron 60 fichas cuyo
  `spainStatus` citaba la Ley 9/1999 manchega, y de ahí que la deuda pareciera necesitar «el índice de
  normas del IEPNB». `eidos.legalStatus()` exige ahora las dos condiciones.
- **El «preferente» de EIDOS no es el nombre por el que se conoce a la especie.** `espreferente`
  marca **«Aguilón»** para el alimoche, **«Frías»** para el petirrojo y **«Alerce»** para la sabina
  mora, teniendo el nombre usual en la misma lista. Hay que ofrecer las alternativas y elegir; no es
  un campo que se pueda tomar a ciegas.
- **Cruzar una fuente oficial con el catálogo por el nombre pierde especies, y la pérdida se lee
  como un dato.** La fuente y el catálogo escriben la misma especie con nombres de épocas distintas:
  el formulario de un sitio Red Natura 2000 revisado en 2023 sigue citando *Sylvia undata* y el
  catálogo ficha *Curruca undata*. **De las 82 aves que declaran los formularios de los ocho
  espacios, 11 no casaban.** Y como el respaldo de sitio es la puerta de las aves, la que no casaba
  salía excluida con «no figura en el formulario oficial del sitio» al lado — una afirmación falsa,
  producida por la propia herramienta. Se resuelve resolviendo contra EIDOS el nombre **DE LA
  FUENTE** (no solo el del candidato, que era lo que se hacía) y con
  `data/equivalencias-nomenclatura.json` para lo que ninguna autoridad reconcilia. Ver
  [`AVES.md`](AVES.md) §5.
- **Casar por epíteto para adivinar un cambio de género fusiona especies distintas.** Sobre estos
  ocho espacios propone nueve pares y **tres son falsos** —*Calandrella brachydactyla* (terrera) ↔
  *Certhia brachydactyla* (agateador), *Melanocorypha calandra* ↔ *Emberiza calandra*, *Saxicola
  torquatus* ↔ *Turdus torquatus*— y encima **pierde el par verdadero** de ese último, que es
  *Saxicola rubicola*. La heurística vale como lista de revisión y **no se aplica nunca** sola.
- **Un taxón puede estar duplicado con TODOS los identificadores en regla.**
  `scan-taxones-duplicados.js` agrupa por `eidosTaxonId` y por `gbifSpeciesKey`, lo que da por hecho
  que un duplicado comparte al menos uno. Cuando las dos autoridades mantienen las dos entradas como
  válidas no comparte ninguno: la curruca rabilarga estaba como *Curruca undata* (EIDOS 80931, GBIF
  10355796) en tres espacios y como *Sylvia undata* (EIDOS 80230 —que es *Sylvia undata undata*, la
  **subespecie** nominal— y GBIF 2492949) en otros cuatro. Cuatro identificadores para un ave y ni un
  aviso. Hay ahora una tercera pasada por **epíteto dentro de la misma familia**, que es sospecha y
  no veredicto, y por eso no bloquea.

**Correcciones que se deshacen solas**

- **Una corrección hecha en el dato y no en la herramienta dura hasta la siguiente regeneración.** La
  ficha de la curruca rabilarga de Sierra Espuña llevaba desde el 2026-08-09 una `reviewNote`
  explicando el arreglo —«tenía eidosTaxonId 80230, que es *Sylvia undata undata*, la subespecie»—.
  Las **cuatro** Capas 3 generadas después lo reintrodujeron tal cual, porque el pipeline no sabía
  nada: la reconciliación agrupa por `taxonid` y ahí había dos. El arreglo tiene que ir **siempre a
  los dos sitios**: al dato ya escrito y a la entrada de `data/` que hace que no vuelva a ocurrir.
- **`build-park-sql.js` solo hace UPSERT: no retira nada.** Regenerar el `-n2.sql` de un espacio del
  que se han quitado fichas deja la base de datos **igual que antes**, y como la API manda sobre el
  paquete, el usuario las sigue viendo. El borrado va aparte y explícito
  (`aves:poda --sql` → `Database/poda-aves-<slug>.sql`), y arrastra además el progreso de quien
  hubiera descubierto una de esas especies (`recalculate-account-progress.php`).

**Fotos y licencias**

- **Ordenar solo por licencia elige pliegos de herbario.** Los herbarios digitalizan en CC0/CC-BY y
  iNaturalist publica en CC-BY-NC, así que un pliego prensado **siempre** ganaba a la foto de campo. El
  orden correcto es *foto de campo antes que pliego* → licencia → país.
- **…y ese orden estuvo invertido dos semanas por un `\b` que faltaba.** `esPliego` buscaba
  `naturalis` suelto, que **casa dentro de «iNaturalist»**: el dataset más común de GBIF se llama
  «iNaturalist research-grade observations», así que **todas** las fotos de campo de iNaturalist se
  clasificaban como pliegos. Con el patrón corregido, las mismas 14 especies pasan de 8 pliegos de
  Naturalis/Kew/Smithsonian a 6 fotos de campo de autor identificado. Si escribes un patrón con
  nombres de institución, ánclalo con `\b`.
- **Despriorizar el pliego no basta cuando no hay foto de campo**: gana igual, por ser la única
  candidata. `enrich-images.js --sin-pliegos` lo descarta del todo y deja la especie sin foto, que es
  lo que decidió el 2026-08-01 —una planta prensada y cosida a una cartulina no ayuda a reconocer
  nada en el campo—. De las 559 fichas del catálogo, **cero** tienen foto de herbario.
- **`/by\b/` no detecta CC BY.** La licencia de naturgucker es literalmente «*Copyright by the
  creator…*» y así acabó una foto con derechos reservados en una ficha. El patrón va anclado (`cc by`,
  `/licenses/by`) y con lista de exclusión (`copyright by`, `all rights reserved`, `©`).
- **`by-nc-nd` no es `by-nc`**: la atribución tiene que decir la licencia real, cláusula *sin obra
  derivada* incluida.
- **Nunca enlaces un `/thumb/` de Wikimedia**: es un derivado cacheado y devuelve 400 en cuanto no está
  generado. Usa `Special:FilePath`. El validador lo trata como **error**.
- **El `_` de los nombres de Commons es carácter de palabra**, así que `\bplate\b` no casa con
  `…(Plate_16)…` y se colaron láminas del XIX.
- **`redirects=1` puede llevarte a otro reino**: de la gramínea *Sphenopus divaricatus* al artículo del
  género *Sphenopus*, que es **un zoantario**. Hay que rechazar el archivo que nombra el mismo género
  con otro epíteto.
- **La categoría de Commons del espacio NO garantiza que el archivo esté en el espacio.** Es la
  premisa sobre la que se apoya la resolución de fotos de POI, y **se rompe cuando la categoría es la
  del accidente geográfico y el espacio protegido es solo un trozo**. `Category:Sierra de Salinas` es
  la del macizo entero, partido entre Yecla (Murcia) y Villena (Alicante); los quince archivos
  «Sierra de Salinas. Colonia …» retratan la colonia de **Villena**, geoetiquetada a **5,2–5,5 km del
  POI y fuera del límite**, y con el alias que hacía falta para que el nombre casara entraban como
  buenos. **Lo único que lo caza es comparar la geoetiqueta con el polígono.** Antes de fiarte de una
  categoría, mira si el espacio comparte macizo, sierra o costa con otro término municipal.
- **Revisa mirando la imagen**, no solo su licencia: es la única forma de cazar lo que ningún filtro caza.

**Fuentes y acceso**

- **El portal de la CARM está tras un gestor de bots y no se rodea.** `www.carm.es` contesta 302 a
  `validate.perfdrive.com` (Radware). Es el portal **para personas**; que el dato de debajo sea
  público no autoriza a evadir el control, y además no funcionaría —el host del desafío también está
  fuera de la política de egreso—. **La ruta buena es el canal de datos abiertos**: `datos.gob.es`
  tiene API (`/apidata/`) y ahí está indexado el fichero de la CARM «Monumentos en la Región de
  Murcia» (publicador `A14002961`), servido en json, csv y rdf desde `nexo.carm.es`. Ya no trae
  incógnitas: **no tiene campo de declaración BIC** (ver el punto de las tres puertas, más abajo) y
  `nexo.carm.es` está abierto desde el 2026-08-17.
  > **Para encontrarlo hay que paginar.** El publicador tiene **más de 600 datasets** y la API sirve
  > 200 por página: «Monumentos en la Región de Murcia» está en la **tercera**, y buscarlo por
  > `dataset/title/monumentos` devuelve los homónimos de otras diez administraciones y no éste.
  > La distribución json es
  > `https://nexo.carm.es/nexo/archivos/recursos/opendata/json/Monumentos.json` — en **https**, que
  > el `accessURL` publicado va en http y por ahí el proxy responde «Host not in allowlist».
- **El catálogo de monumentos de la CARM mezcla DOS convenciones de coordenada en el mismo fichero,
  y una de ellas tiene los campos cambiados.** Los campos se llaman `Latitud` y `Longitud`, y:
  · en unas filas `Latitud` trae la **longitud** y `Longitud` trae la **latitud** —«Yacimiento Romano
    La Raya» viene como `Latitud: -0.7759098, Longitud: 37.8260702`—;
  · en otras los dos traen **UTM 30N** en metros —«Molinos de Quintín y Calcetera», `Latitud:
    4188427, Longitud: 695859`, que es la Y y la X—.
  Usarlos como se llaman deja el monumento en mitad del Atlántico o a 4.000 km al norte, y **ninguna
  de las dos formas falla ruidosamente**. La regla para leerlo: un valor de seis o siete cifras sin
  signo es UTM y hay que reproyectar (`utmToLonLat` de `lib/shapefile.js`); si los dos valores están
  entre −10 y 45, el que tenga signo negativo es la longitud, mande lo que mande el nombre del campo.
  Comprobado el 2026-08-17 con point-in-polygon contra el límite de San Pedro del Pinatar.
- **La fuente primaria de un BIC es el boletín, no el registro.** Un bien lo es **porque una norma lo
  declara**, y esa norma se publica en el BORM o en el BOE; el registro es un índice secundario de lo
  que el boletín ya publicó. `www.borm.es` está abierto y su endpoint
  `/services/anuncio/ano/AAAA/numero/NNNN/pdf` devuelve el PDF sin captcha. Su límite: sirve una norma
  que **ya sabes localizar** —su portada es una SPA de 1,4 KB sin nada que rascar—, así que para pasar
  de «esto parece BIC» a «lo declara la Orden X» sigue haciendo falta un índice.
- **«Abierto» y «sirve el dato» no son lo mismo, y la vía 3 lo enseña tres veces.** Al cerrar Monte
  Arabí (2026-08-15) se recorrió entera con los hosts ya registrados, y las tres puertas fallan por
  motivos distintos: **(a)** el registro estatal de BIC estaba apuntado a `www.culturaydeporte.gob.es`,
  que es el **dominio viejo** y solo devuelve un 301 a `www.cultura.gob.es`; **(b)** ese nuevo host sí
  está permitido —el CONNECT del proxy devuelve 200— pero su certificado lo emite la **FNMT-RCM** y el
  servidor manda solo la hoja, sin la intermedia, así que la cadena no valida: es un hueco de
  **confianza**, no de egreso, y se arregla añadiendo la CA de la FNMT al entorno, nunca desactivando
  la verificación; **(c)** el fichero de datos abiertos de la CARM sí se descargó —«Monumentos en la
  Región de Murcia», 476 registros— y resuelve la duda que quedó abierta: **no trae campo de
  declaración BIC**, es un catálogo de monumentos visitables, y de Yecla solo trae los diez del
  casco urbano. Dos detalles que cuestan una sesión: `datos.gob.es` publica su `accessURL` en **http**
  y por ahí el proxy responde «Host not in allowlist» (hay que pedirlo en https), y el JSON trae
  **saltos de línea crudos dentro de las cadenas**, así que `JSON.parse` lo rechaza tal cual.
- **El número de anuncio del BORM no se deduce del número de boletín.** El endpoint
  `/services/anuncio/ano/AAAA/numero/NNNN/pdf` numera por **anuncio y año**, no por boletín: el
  anuncio 3 de 1999 sale en el boletín n.º 13. Por eso la bisección «por el número de boletín de la
  cabecera» no converge (Sierra de la Pila) y no se puede llegar a una norma concreta sabiendo solo
  su boletín y su fecha. Hace falta un índice, y ése es el hueco de verdad.
- **«Bloqueado» hay que decirlo contra un host escrito, no de memoria.** La vía 3 de la cascada de
  POIs (BIC y patrimonio) fue durante cuatro espacios la única de las seis **sin host registrado en
  `check-egress.js`**: cada sesión escribía la URL de memoria, la veía fallar y anotaba «bloqueado»
  como si fuera una propiedad comprobada de la fuente. Los fallos de CONNECT son a nivel de host, así
  que el veredicto de lo probado se sostenía — pero **nadie había verificado que fueran los hosts
  correctos**, y `www.carm.es` estaba en pie todo el tiempo. Si añades una fuente a la cascada,
  regístrala en `check-egress.js` **antes** de dar por cerrada una vía por su culpa.

**GBIF**

- **Las Aves son el 88 % de las ocurrencias y casi todo ruido espacial** (vuelan: un registro en vuelo
  cae dentro de cualquier polígono). Por eso **no entran por el filtro de presencia**: desde el filtro
  3 bis de `build-species-seleccion.js` un ave solo se aprueba con respaldo de sitio —el formulario
  oficial (`sitio:especies`) o el anexo normativo— y GBIF queda como confirmación. Durante ocho
  espacios la regla estuvo escrita y sin aplicar, y el catálogo acabó con 557 aves de 1.492 fichas
  (el 73 % en Monte Arabí, el 26 % en Cuatro Calas: una proporción que mide la cobertura de eBird,
  no el espacio).
- **El filtro por incertidumbre de coordenada no sirve**: solo el 14 % la declara.
- **`basisOfRecord` sí sirve, y hay que mirarlo.** `MACHINE_OBSERVATION` en una especie con
  seguimiento por satélite son posiciones Argos, y las de baja calidad caen tierra adentro: así
  *Caretta caretta* —una tortuga **marina**— acumuló 14 ocurrencias en el matorral, el roquedo y el
  pastizal de Carrascoy, a 20 km del mar, y la selección la aprobó. Ante una especie que no pinta
  nada donde sale, mira el `basisOfRecord` antes que la cifra.
- **El histograma mensual mide esfuerzo de observación, no presencia.** Los registros de un residente
  se disparan en primavera porque es cuando se sale a censar: quedarse con los meses de máximo le
  pone «Abril a mayo» al carbonero común. Lo que el histograma distingue de verdad es la **ausencia**
  (un estival no tiene registros en enero), así que el umbral va bajo y se lee el tramo *presente*.
- **`usageKey` no siempre es de rango específico** (ver [procedencia de campos](../arquitectura/PROCEDENCIA-DE-CAMPOS.md)).
- **Punto-en-polígono local**, no consulta espacial: evita el límite de complejidad y de longitud de URL.

