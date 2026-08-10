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
- **No trunques el nombre a dos palabras** para emparejar: rompe las subespecies. Se empareja por
  prefijo terminado en espacio (`eidos.nameMatches`).
- **El cruce con el Atlas hay que hacerlo con los DOS nombres** (el de GBIF y el aceptado por EIDOS).
  Con solo el de GBIF, *Periploca laevigata* no casaba con la *P. angustifolia* del Atlas y la especie
  diagnóstica del 5220 se quedaba sin enlace — y el hábitat, sin portada.
- **La misma columna se llama distinto según la vista de EIDOS**: `taxonid` en `v_taxonomia`,
  `idtaxon` en las de detalle, `id_taxon` en `v_imagenes`. Filtrar por la equivocada **no da error
  HTTP**: PostgREST devuelve 200 con un objeto de error, el `for...of` revienta y el informe sale con
  «0 rellenadas / 0 sin foto», como si no hubiera nada que hacer. `eidos.rows()` normaliza a array.

**Fotos y licencias**

- **Ordenar solo por licencia elige pliegos de herbario.** Los herbarios digitalizan en CC0/CC-BY y
  iNaturalist publica en CC-BY-NC, así que un pliego prensado **siempre** ganaba a la foto de campo. El
  orden correcto es *foto de campo antes que pliego* → licencia → país.
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
- **Revisa mirando la imagen**, no solo su licencia: es la única forma de cazar lo que ningún filtro caza.

**GBIF**

- **Filtra Aves**: son el 88 % de las ocurrencias y casi todo ruido espacial (vuelan).
- **El filtro por incertidumbre de coordenada no sirve**: solo el 14 % la declara.
- **`usageKey` no siempre es de rango específico** (ver [procedencia de campos](../arquitectura/PROCEDENCIA-DE-CAMPOS.md)).
- **Punto-en-polígono local**, no consulta espacial: evita el límite de complejidad y de longitud de URL.

