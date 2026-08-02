# Informe · Fotos del catálogo (especies y hábitats)

_Parque piloto: Cabo Cope y Puntas de Calnegre. Criterio aplicado: solo fotos con confianza **media-alta/alta** del `NaturDex_fotos_candidatas.xlsx`; almacenamiento como **URL externa** (Wikimedia Commons) en la BD. Las de confianza media/baja se dejan sin foto (el frontend muestra portada temática) por fidelidad._

## Hábitats — 9 rellenados

Se añadió la columna `image_url` a la tabla `habitats` (`schema.sql` + `migrations.sql`), se pobló en `seed.sql` y `park_payload.php` ahora la prioriza sobre la ruta local. Actualizado también `park.json`.

- `estepas-salinas-albardinal` — 1510 · Estepas salinas mediterráneas (Limonietalia)
- `matorral-semiarido` — 5330 · Matorral termomediterráneo semiárido
- `sabinar-juniperus` — 5210 · Matorrales arborescentes de Juniperus spp.
- `azufaifar` — 5220 · Matorrales arborescentes de Ziziphus
- `matorral-halonitrofilo` — 1430 · Matorrales halo-nitrófilos
- `matorral-halofilo` — 1420 · Matorrales halófilos mediterráneos y termoatlánticos
- `prados-alysso-sedion` — 6110 · Prados calcáreos cársticos o basófilos del Alysso-Sedion albi
- `veg-anual-desechos-marinos` — 1210 · Vegetación anual sobre desechos marinos acumulados
- `subestepa-thero-brachypodietea` — 6220 · Zonas subestépicas de gramíneas y anuales del Thero-Brachypodietea

### Hábitats SIN foto (pendientes de revisión manual)

La candidata encontrada era de confianza media/baja o no representa fielmente el hábitat de este parque:

- `acantilados` — 1240 · Acantilados mediterráneos con Limonium · confianza baja
- `dunas-malcomietalia` — 2230 · Dunas con céspedes del Malcomietalia · confianza media
- `dunas-embrionarias` — 2110 · Dunas móviles embrionarias · confianza media
- `galeria-ribera` — 92D0 · Galerías y matorrales ribereños termomediterráneos · confianza media
- `roquedos-casmofiticos` — 8210 · Pendientes rocosas calcícolas con vegetación casmofítica · confianza media
- `rios-glaucium` — 3250 · Ríos mediterráneos de caudal permanente con Glaucium flavum · confianza media

## Especies

- **50 especies** de confianza media-alta/alta ya tenían su URL candidata cargada en `seed.sql` y `park.json` (bar de fidelidad cumplido).
- **2 especies** que quedaban pendientes (su candidata del Excel apuntaba a una *categoría* de Commons, no a un archivo) se resolvieron vía **GBIF/iNaturalist** — ver sección siguiente.

## Extracción desde EIDOS/IEPNB y GBIF

**EIDOS/IEPNB no es un banco de fotos:** cataloga taxonomía, estado legal y distribución. Su API `iepnb.gob.es` además está bloqueada desde el entorno de trabajo. La capa de imágenes de ese ecosistema es **GBIF / GBIF.ES** (la misma vía con la que ya se rellenaron las especies invasoras del seed), que sí devuelve la foto del taxón correcto con **licencia + autor**.

Se rellenaron vía GBIF/iNaturalist las 2 especies alta pendientes, con preferencia CC-BY/CC0 y atribución guardada en la nueva columna `species.image_attribution`:

- **Lechuguilla lanosa** (_Launaea lanifera_) — foto CC BY 4.0 (Mehdi Chetibi), vía iNaturalist/GBIF.
- **Oroval** (_Withania frutescens_) — foto CC BY-NC 4.0 (Roger Vila, Baleares) ⚠️ no comercial; única con licencia libre localizada.

Para el resto del catálogo (media/baja/no encontradas) se entrega el script **`Tools/catalogo-nacional/enrich-images.js`**, que hace el barrido completo (intento de multimedia EIDOS → fallback GBIF, preferencia de licencia y localización España, salida `.sql` + informe). No se pudo ejecutar en bucle aquí porque el sandbox tiene GBIF/EIDOS bloqueados y `web_fetch` solo trae un registro por llamada; **hay que correrlo en local** con red completa:

```
node Tools/catalogo-nacional/enrich-images.js \
  --park Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json \
  --slug cabo-cope-puntas-calnegre --mode all --country ES \
  --out Tools/catalogo-nacional/out/fotos-especies.sql \
  --report Tools/catalogo-nacional/out/fotos-especies.md
```

(Con `--allow-nc` incluye también fotos CC-BY-NC, marcándolas.)

### Especies sin foto por criterio de fidelidad

- **36** con candidata de confianza *media* (especie correcta pero foto de otra localidad, o identificación no plenamente segura).
- **7** con candidata de confianza *baja*.
- **9** sin ninguna candidata con licencia libre localizada.

Estas quedan con la portada temática generada. Si quieres, puedo bajar el umbral a 'media' y rellenarlas también, o revisarlas una a una.

### Detalle — no encontradas (9)

- Centaurio de Rigual (_Centaurium rigualii_)
- Espartilla de Persia (_Enneapogon persicus_)
- Anabasis (_Anabasis hispanica_)
- Eragrostis (_Eragrostis papposa_)
- Erodio (_Erodium sanguis-christi_)
- Escrofularia de perro (_Scrophularia canina_)
- Espino negro (_Rhamnus lycioides subsp. borgiae_)
- Rabogato (_Sideritis ibanyezii_)
- Serrátula (_Serratula mucronata_)

## Aviso de licencias

El Excel marca la mayoría de licencias como *"verificar licencia en la ficha de Commons"*. Antes de publicar, hay que confirmar la licencia de cada archivo y registrar autor/licencia para cumplir CC-BY / CC-BY-SA. Los `UPDATE` del seed llevan un comentario recordándolo.

## Ampliación del catálogo (174 especies)

El catálogo creció de 146 a **174 especies** (nuevas aves, reptiles, mamíferos y flora dunar/halófila, ids 200-249). Estado actual: **109 con foto, 65 sin foto**.

**Detalle clave:** las especies nuevas viven **solo en `park.json`** (no están en `Database/seed.sql`), así que para ellas la fuente de verdad es park.json. El script ahora tiene `--write-park` para escribirlas ahí directamente.

Rellenadas en esta pasada vía GBIF/iNaturalist (foto del taxón, con autor + licencia):

| Especie | Licencia | Nota |
| --- | --- | --- |
| _Launaea lanifera_ | CC BY 4.0 | Mehdi Chetibi |
| _Withania frutescens_ | CC BY-NC 4.0 ⚠️ | Roger Vila (Baleares) |
| _Centaurium rigualii_ | CC BY-NC 4.0 ⚠️ | naturcope — **obs. en Águilas, dentro del parque** |
| _Monticola solitarius_ | CC BY-NC 4.0 ⚠️ | Arsenio González |
| _Oryctolagus cuniculus_ | CC BY-NC 4.0 ⚠️ | Africa Gómez |

**Realidad de licencias:** casi todas las fotos de iNaturalist/GBIF son **CC-BY-NC** (no comercial), independientemente de la licencia de la observación. Para cubrir las 65 restantes hay que aceptar NC (marcadas) o quedará mínima cobertura.

**No pude traer las 65 restantes aquí:** el sandbox tiene bloqueado todo host externo (403) y `web_fetch` solo devuelve cuerpo de `api.gbif.org`, un registro grande por llamada — 65 llamadas no caben en una sesión. Se completan en **una ejecución local** del script:

```
node Tools/catalogo-nacional/enrich-images.js \
  --park Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json \
  --slug cabo-cope-puntas-calnegre --mode missing --allow-nc --write-park \
  --out Tools/catalogo-nacional/out/fotos-especies.sql \
  --report Tools/catalogo-nacional/out/fotos-especies.md
```

Esto rellena `park.json` (todas) y genera el `.sql` (para las que ya están en la BD). Revisa el informe que emite: marca cuáles quedaron CC-BY-NC.

## ✅ Completado: 174/174 especies con foto

Se consiguieron las 64 que faltaban usando el **navegador Chrome conectado** (red completa) para ejecutar un bucle `fetch()` sobre la API de GBIF —resolviendo por `species/match` las 22 aves sin clave, escaneando hasta 100 registros por especie, priorizando España y la mejor licencia—. Resultado escrito en `park.json` (las 64) y `seed.sql` (las 39 que existen en la BD), con autor + licencia en `image_attribution`.

- **Estado final: 174/174 con foto, 0 sin foto.**
- Licencias de las 70 fotos vía GBIF: **19 CC0, 36 CC-BY, 15 CC-BY-NC** (mayoría reutilizable; las NC van marcadas).
- **Todas verificadas**: se hizo load-test de las 64 URLs en el navegador; las que no cargaban (herbarios RBGE/MNHN/Meise que bloquean hotlink) se sustituyeron por fotos que sí cargan.

Notas de fidelidad (revisables si quieres cambiarlas):
- Varias son **imágenes de herbario/museo** (CC0) en vez de foto de campo, porque tenían mejor licencia: p. ej. _Anabasis hispanica_, _Serratula mucronata_ (Naturalis).
- Algunas de especies raras son de **fuera de España** (marcado `obs. XX` en la atribución): _Halocnemum_ (EAU), _Hammada articulata_ (SA), _Leucanthemum decipiens_ (herbario, Marruecos), _Capparis_ (foto a nivel de especie).
- _Leucanthemum decipiens_ (endemismo) es la de peor disponibilidad: herbario RSA, CC-BY-NC.

El script `enrich-images.js` queda igualmente para regenerar/reejecutar en local en el futuro.

## Repaso de imágenes (load-test completo)

Se probó en el navegador que **cada imagen carga de verdad** (no solo que exista la URL). Hallazgos y correcciones:

- **6 imágenes de especie rotas** (thumbs `upload.wikimedia.org` con 404 + Cistus clusii): Águila perdicera, Cormorán moñudo, Sabina negral, Azufaifo, Cornical, Cistus clusii → sustituidas por foto GBIF/iNaturalist verificada (casi todas CC0/CC-BY).
- **6 hábitats sin foto** (mostraban solo el placeholder temático) → rellenados con la foto de su especie/comunidad diagnóstica, ya verificada: acantilados (Limonium), dunas-malcomietalia (Malcolmia), dunas-embrionarias (Elymus farctus), galería-ribera (Tamarix), roquedos-casmofíticos (Sarcocapnos), ríos-glaucium (Glaucium).
- Varias imágenes de Wikimedia y POI fallaban de forma **intermitente** por rate-limit al probarlas en lote; al reintentar cargan bien (no había que cambiarlas).

**Estado final verificado: 174/174 especies y 15/15 hábitats con foto que carga.** 0 imágenes rotas.

## Archivos modificados

- `Database/schema.sql` — columnas `habitats.image_url` y `species.image_attribution`
- `Database/migrations.sql` — migración de ambas columnas
- `Database/seed.sql` — 9 UPDATE de foto de hábitat + 2 UPDATE de foto de especie (GBIF)
- `Backend/Lib/park_payload.php` — prioriza `image_url` del hábitat y emite `imageAttribution` de especie
- `Frontend/Data/parks/.../park.json` — 9 imágenes de hábitat + 2 de especie con atribución
- `Tools/catalogo-nacional/enrich-images.js` — **nuevo** script de enriquecimiento EIDOS+GBIF (ejecutar en local)

---

# Repaso completo de las fotos (2026-07-31)

Se revisó de dónde sale **cada** imagen de los dos parques con catálogo (Cabo Cope y Sierra Espuña)
y se corrigió todo lo que no cargaba, lo que no estaba atribuido y lo que no era una foto del taxón.

## Lo que estaba roto y por qué

**1. Enlaces a derivados cacheados de Wikimedia.** La foto de la Tortuga mora apuntaba a
`upload.wikimedia.org/.../thumb/f/f8/Testudo_graeca_Lambert_01.jpg/640px-...`. Esa URL no señala al
archivo, señala a un *thumb generado*: si el archivo se renombra o el thumb no está, devuelve 400 y
la ficha se queda con la portada de emoji. Le pasaba también al Camachuelo trompetero.

La URL correcta y estable es `commons.wikimedia.org/wiki/Special:FilePath/Archivo.jpg?width=1280`,
una redirección servida por MediaWiki que sobrevive a los renombrados. Ahora la usan las 294 fotos de
Commons del catálogo, y `Tools/validate-park-data.js` da **error** si alguien vuelve a meter un thumb.

**2. Servidores que bloquean el enlace directo.** Cinco fotos existían pero no cargaban en el
navegador: pliegos de herbario servidos por Naturalis, el Natural History Museum, RBGE, JACQ y
observation.org, que rechazan el *hotlink* aunque respondan a un `fetch` desde Node. Se sustituyeron
por fotos de campo; las dos que no tenían alternativa (*Anabasis hispanica* y *Athamanta hispanica*,
sin ninguna fotografía libre de campo publicada) se **descargaron al repositorio**, que es lo que
permiten sus licencias CC0 y CC BY.

**3. Fotos que no eran fotos.** La resolución automática elegía el primer archivo de la categoría de
Commons, y el orden alfabético no tiene nada que ver con la calidad: el murciélago mediano de
herradura tenía un **mapa de distribución**, el ratonero grande una **figura de artículo**, el
murciélago grande de herradura un **audiograma**, el jabalí una **postal de 1898** y varias plantas
**láminas botánicas del XIX**. El *Allium melananthum* ibérico mostraba un *Allium melanantherum* de
los Balcanes: otra especie.

Se corrigió la cadena de resolución de `Tools/catalogo-nacional/wikimedia-images.js`:

1. **Wikidata** por declaración exacta `P225 = <nombre científico>` → imagen `P18`.
2. **Wikipedia** (es → en → ca) enlazada desde ese elemento: imagen principal del artículo.
3. **Wikipedia buscada directamente por nombre científico**. Hacía falta porque no todo taxón tiene
   elemento con `P225`: *Sus scrofa* no aparece, y sin este paso caía a la categoría de Commons.
4. **Categoría de Commons**, ordenando por binomio exacto antes que por género.
5. **Búsqueda en Commons**, exigiendo género y epíteto en el nombre del archivo. Se marca «a revisar».

Además se descartan por nombre los mapas, figuras, audiogramas, láminas, grabados y pliegos, y se
comprueba que la URL final devuelve de verdad una imagen antes de escribirla.

**4. Atribución ausente.** 98 fotos de especie y 15 de hábitat no decían autor ni licencia, que es
justo lo que exigen CC-BY y CC-BY-SA. Ahora se recupera de la propia ficha de Commons y **se muestra
en la ficha** («Foto: Autor (Licencia) · Wikimedia Commons»), tanto en especies como en hábitats.

**5. Fotos de procedencia dudosa.** Trece fotos locales venían de `florasilvestre.es` con la
advertencia «confirmar permiso antes de cualquier uso público». Doce se sustituyeron por equivalentes
de Commons con licencia comprobable; la restante (*Maytenus senegalensis* subsp. *europaea*) por una
foto CC BY-SA de Commons. **Los trece ficheros siguen en `Frontend/Img/species/` sin que nada los
use**: conviene borrarlos.

## Estado final

- **363 de 364 especies con foto.** La única sin ella es *Sideritis bourgaeana*: no hay ninguna
  imagen con licencia libre de ese taxón ni en Wikimedia ni en GBIF.
- **25 de 30 hábitats con foto.** Los cinco restantes se quedan con su portada temática porque no
  tienen ninguna especie diagnóstica con foto entre las suyas (tres ni siquiera tienen especies
  asignadas). Cada portada de hábitat dice ahora con qué especie se ilustra y por qué.
- **400 de 400 imágenes verificadas cargando en un navegador real** (especies + hábitats + POIs).
  La comprobación con `fetch` desde Node no vale: da 429 en cuanto pides varias seguidas y, al
  revés, acepta servidores que el navegador rechaza por *hotlink*.
- **Todas con autor y licencia.** Reparto: 294 Wikimedia Commons, 60 GBIF/iNaturalist, 6 herbarios y
  agregadores, 2 copias locales.
- Licencias: 226 CC-BY-SA, 72 CC-BY, 21 dominio público, 20 CC-BY-NC (**no permiten uso comercial**:
  hay que decidir si se retiran antes de publicar en una tienda de aplicaciones), 18 CC0, 4 FAL/GFDL
  y 2 con atribución genérica.

## Herramientas

```bash
node Tools/catalogo-nacional/wikimedia-images.js --canonicalize --missing --write
```

```bash
node Tools/catalogo-nacional/habitat-images.js --write --sql Database/habitats-imagenes.sql
```

`--canonicalize` convierte cualquier URL de Wikimedia a `Special:FilePath` y recupera la atribución;
`--missing` rellena las que falten o no carguen; `--only-local` cambia una foto local por su
equivalente de Commons; `--only "<nombres científicos ; separados>"` rehace fichas concretas.

Para los taxones que Wikimedia no cubre sigue estando
`Tools/catalogo-nacional/enrich-images.js` (EIDOS → GBIF), que es de donde salen las 60 fotos de
iNaturalist.

## Segunda pasada (2026-08-01)

Revisión dirigida de 15 fichas y alta de una especie nueva (*Cistanche phelypaea*, «pijolobo»).

**Los once animales** (calandria, cormorán moñudo, garceta, treparriscos, zampullín, roquero
solitario, avión roquero, salamanquesa rosada, culebra de herradura, conejo y erizo moruno) tenían
observaciones sueltas de iNaturalist. Se han sustituido por la imagen principal del artículo de
Wikipedia en español, que es una foto elegida y revisada por editores. Se revisó **una a una**: la
primera candidata para la salamanquesa rosada mostraba el animal sujeto en la mano de una persona
—mala imagen para una guía de campo y peor ejemplo con un reptil protegido—, y se cambió por otra
del animal sobre un muro.

**Las cuatro plantas** tenían pliegos de herbario. Tres se han cambiado por fotografías de campo, y
para dos hubo que buscarlas bajo un nombre distinto del que usa el catálogo:

| Especie | Buscada como | Resultado |
| --- | --- | --- |
| _Erodium sanguis-christi_ | — | Foto de campo, España (CC BY-NC) |
| _Leucanthemum decipiens_ | _Mauranthemum decipiens_ | Foto de campo, España (CC BY-NC) |
| _Serratula mucronata_ | _Klasea flavescens_ subsp. _mucronata_ | Foto de campo, **Murcia** (CC BY-NC) |
| _Anabasis hispanica_ | — | **No existe ninguna** |

De *Anabasis hispanica* no hay una sola fotografía de campo publicada con licencia libre: cero
observaciones con multimedia en iNaturalist, categoría vacía en Wikimedia Commons y, en GBIF, solo
pliegos. El del herbario MA (Real Jardín Botánico–CSIC) sería de mejor procedencia que el
estadounidense que hay ahora, pero su servidor **solo sirve el escaneo original de 24 MB** (no
admite parámetro de tamaño), así que se mantiene la copia local del pliego del Smithsonian, de
800 kB. Queda anotado en el `reviewNote` de la ficha.
