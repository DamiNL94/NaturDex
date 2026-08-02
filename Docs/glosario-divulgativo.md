# Glosario divulgativo

El glosario es la pieza que traduce el vocabulario científico de las fichas al lenguaje de un
visitante cualquiera. Los términos se resaltan dentro de las descripciones y, al pulsarlos, se abre
un popover con la definición. El objetivo es que nadie tenga que salir de la app a buscar qué es un
*envés*, un *saladar* o una *VU*.

## Dónde vive cada cosa

| Pieza | Fichero |
|---|---|
| Tabla `glosario` (nacional, sin `park_id`) | `Database/schema.sql`, `Database/migrations.sql` |
| Contenido (las 210 definiciones) | bloque `INSERT INTO glosario` de `Database/seed.sql` |
| Forma del JSON (compartida) | `Backend/Lib/glossary_payload.php` |
| Endpoint | `Backend/Api/glossary.php` |
| Exportador a la copia offline | `Tools/export-glossary.php` → `Frontend/Data/glosario.json` |
| Resaltado y popover | `Frontend/Js/glossary.js` |
| Vigilancia de cobertura | `Tools/glossary-coverage.js` (`npm run glossary:check`) |

La **base de datos es la fuente de verdad**; `Frontend/Data/glosario.json` es la copia empaquetada
que la app usa sin conexión. `Frontend/Js/data.js` da prioridad a la API sobre los JSON
empaquetados, así que en un despliegue con backend **el SQL no es opcional**: si solo se toca el
JSON, la API seguirá sirviendo el glosario viejo.

## Qué se resalta

Solo los bloques con clase `.detail-prose`: la descripción de la especie, su lista de pistas de
identificación, la descripción del hábitat, el resumen del parque, las tres líneas de estado de
conservación y la ficha de invasoras. No se tocan insignias, taxonomía ni nombres científicos.

Dos reglas del matcher que conviene recordar al añadir términos:

- Los `aliases` son **formas exactas**, no raíces: hay que listar el plural y el femenino
  (`umbrías`, `umbrío`, `umbríos`). Lo que no esté listado no se resalta.
- Los acrónimos y códigos en mayúsculas (regex `^[A-ZÁÉÍÓÚÜÑ0-9]{2,8}$`: `LC`, `EN`, `VU`, `HIC`,
  `ZEPA`…) se matchean **sensibles a mayúsculas**. Sin esa regla, el código UICN `EN` se comería la
  preposición «en» de cada frase.
- Solo se enlaza la **primera aparición** de cada término dentro de cada bloque.

## Regla permanente: toda alta de especies actualiza el glosario

> **Cada vez que entren especies nuevas —búsquedas de GBIF/EIDOS para rellenar hábitats, redacción
> de `Tools/catalogo-nacional/data/contenido/*.json`, altas del panel de administración o fichas N1
> de nuevos espacios— hay que actualizar el glosario en la misma pasada.** Una ficha con vocabulario
> sin definir es una ficha a medias: el término aparece en el texto y no se puede pulsar.

Esto no depende de que alguien se acuerde: está automatizado en dos puntos.

1. **`npm run glossary:check`** (`Tools/glossary-coverage.js`) compara el texto de TODAS las fichas
   (catálogo universal, contenido redactado, `park.json` de cada parque, hábitats e invasoras)
   contra las formas que conoce el glosario, y lista lo que ha entrado sin definición. Detecta por
   dos vías: un léxico explícito de raíces del vocabulario de campo y un juego de terminaciones
   inequívocamente técnicas (`-ófilo`, `-ícola`, `-áceas`, `-fito`, `-voro`…), que caza palabras que
   nadie había previsto.
2. **El hook de pre-commit** (`.githooks/pre-commit`, se instala con `npm run hooks:install`) lo
   ejecuta en cada commit, después de la validación de parques. Es **informativo, nunca bloquea**:
   redactar una definición divulgativa es trabajo editorial, no un error de datos.

### El ciclo completo

```bash
npm run glossary:check
```

Lo que salga en la lista se redacta y se añade al bloque `INSERT INTO glosario` de
`Database/seed.sql` (es idempotente: `ON DUPLICATE KEY UPDATE`). Después, a la BD viva y a la copia
offline:

```bash
docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql --default-character-set=utf8mb4 -u "$MYSQL_USER" naturadex' < bloque.sql
```

```bash
npm run export:glossary
```

Y se sube la `VERSION` de `Frontend/sw.js`, porque `Data/glosario.json` está en `SHELL_ASSETS` y sin
el cambio de versión un móvil ya instalado seguiría sirviendo la copia cacheada.

> **Charset:** cargar el bloque suelto con `docker exec ... mysql` **sin** `--default-character-set=utf8mb4`
> guarda mojibake. El `seed.sql` completo ya lleva su `SET NAMES`, pero un fragmento suelto no.

### Cómo se redacta una definición

- Una frase, en presente, sin subordinadas encadenadas. Si necesita dos frases, la segunda aporta el
  «para qué sirve» (por qué esa hoja es coriácea, qué indica ese suelo).
- Sin usar otro tecnicismo sin definir dentro de la definición.
- Con un ejemplo conocido cuando exista («como la aceituna», «como el tomate o la uva»).
- `category` reutiliza las que ya hay: `botánica`, `zoología`, `ecología`, `geografía`, `geología`,
  `biogeografía`, `clima`, `ciencia`, `conservación`, `conservación (UICN)`.
- `source` siempre `NaturDex (divulgacion)`: el texto es editorial, no procede de una fuente oficial.

### Cómo se amplía el vigilante

`Tools/glossary-coverage.js` tiene dos listas que se editan a mano:

- **`LEXICO`** — raíces del vocabulario de campo. Al redactar fichas nuevas conviene añadir aquí los
  tecnicismos que se hayan usado, aunque ya estén definidos: así quedan vigilados para siempre.
- **`EXCEPCIONES`** — palabras que caen en los patrones pero no son tecnicismos (los adjetivos de
  color en `-áceo`: *grisáceo*, *violáceo*, *oliváceo*; nombres de género dentro del nombre de un
  hábitat, como *Glaucium*; y alguna errata heredada de la fuente oficial).

## Estado actual

**210 términos** (2026-08-01). Repartidos por categoría:

- **botánica** (117) — morfología de hoja, tallo y porte (*envés*, *haz*, *coriáceo*, *tomentoso*,
  *imbricado*, *rastrero*, *cojín*), flor y fruto (*estambre*, *lígula*, *panícula*, *espolón*,
  *labelo*, *vilano*, *sámara*, *gálbulo*, *vaina*), familias que las fichas citan por su nombre
  (*gramínea*, *leguminosa*, *labiada*, *umbelífera*, *crucífera*, *quenopodiácea*, *crasulácea*) y
  formaciones vegetales (*espartal*, *sabinar*, *tarayal*, *carrizal*, *jaral*).
- **zoología** (28) — plumaje y morfología (*obispillo*, *rémige*, *ocelo*, *quillado*, *jaspeado*),
  comportamiento (*crepuscular*, *gregario*, *reclamo*, *posadero*, *cernirse*, *letrina*),
  fenología (*estival*, *invernante*, *residente*, *nidificar*) y dieta (*insectívoro*, *granívoro*,
  *carnívoro*, *herbívoro*, *omnívoro*).
- **ecología** (21) — *casmofítico*, *halófilo*, *nitrófilo*, *gipsícola*, *calcícola*, *termófilo*,
  *freático*, *planta pionera*, *parásito*, *hemiparásito*, *polinizador*, *sotobosque*, *orla*.
- **geografía** (12) **y geología** (4) — *rambla*, *duna embrionaria*, *arenal*, *erial*, *barbecho*,
  *talud*, *ribazo*, *canchal*, *cantil*, *umbría*, *estepa*, *marga*, *yesoso*, *silíceo*, *sustrato*.
- **conservación** (10 + 10 UICN) — las 10 categorías UICN (`EX`…`NE`) más `HIC`, `LESRPE`, `LIC`, `ZEPA`,
  `Red Natura 2000`, *hábitat prioritario* y *especie exótica invasora*.
- **biogeografía / clima / ciencia** — *endemismo*, *alóctono*, *relicto*, *termomediterráneo*,
  *semiárido*, *biogeografía*, *taxón*, *subespecie*.

Ver también [catalogo-especies-universal.md](catalogo-especies-universal.md).
