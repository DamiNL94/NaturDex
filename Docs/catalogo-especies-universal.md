# Catálogo de especies: qué es universal y qué es de cada parque

## El problema

Cada `park.json` llevaba su propia copia completa de cada especie. Como la misma especie aparece en
varios parques (56 se repiten solo entre Cabo Cope y Sierra Espuña), las copias derivaron:

- El **pino carrasco** tenía una foto en Cabo Cope y otra distinta en Sierra Espuña.
- Su descripción decía «presente en laderas y zonas de repoblación **del parque**» en los dos sitios,
  y su fuente citaba un artículo sobre la Marina de Cope… también en la ficha de Sierra Espuña.
- **40 especies de Sierra Espuña** tenían por descripción un texto administrativo que hablaba de
  «la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope)», que es otro espacio a 100 km. La ZEPA de
  Sierra Espuña es la ES0000173.
- **42 fichas de Sierra Espuña** citaban como fuente documentos del PORN de Cabo Cope.

La causa: la ficha mezclaba dos cosas distintas.

| | Ejemplo | Dónde vive ahora |
|---|---|---|
| **Lo que la especie ES** | nombre común, grupo, cómo se reconoce, taxonomía, estado UICN y en España, foto | `Tools/catalogo-nacional/data/especies-universal.json` |
| **Cómo aparece EN ESTE PARQUE** | en qué hábitats se ha citado, si es destacada, ocurrencias GBIF, de qué fuente sale la cita, código ZEPA | el `park.json` de cada espacio |

## Cómo se mantiene

```bash
node Tools/sync-species-catalog.js            # informa: divergencias, texto local en campos universales
```

```bash
node Tools/sync-species-catalog.js --extract  # reconstruye el catálogo universal desde los park.json
```

```bash
node Tools/sync-species-catalog.js --apply --sql Database/species-universal.sql
```

`--extract` vuelca lo que hay en los `park.json`, normaliza el vocabulario de `group` y **superpone
encima** el contenido redactado a mano de `Tools/catalogo-nacional/data/contenido/*.json`, que es la
fuente de verdad del texto divulgativo. `--apply` escribe los campos universales en todos los
`park.json` y, con `--sql`, genera los `UPDATE` para la base de datos.

**`--extract` añade, pero solo borra si se lo pides.** El catálogo se indexa por nombre científico,
así que renombrar un taxón deja la entrada vieja ahí: `--extract` la lista como «entrada que ningún
parque usa» y `npm run species:poda` (`--extract --podar`) la retira. El aviso va por defecto y el
borrado no, porque el catálogo lo comparten todos los espacios. Y no es una entrada inerte: una
selección de especies aprobada antes del renombrado casa con el nombre viejo y resucita el duplicado
que el renombrado quitó.

> **El SQL no es opcional en un despliegue con backend.** `Frontend/Js/data.js` da prioridad a la
> respuesta de la API sobre el `park.json` empaquetado: si solo se actualizan los JSON, un despliegue
> con base de datos viva seguirá sirviendo los textos y las fotos viejos.

`Tools/validate-park-data.js` (`npm run validate`) comprueba en cada pasada que ninguna especie
diverge entre parques y que ningún campo universal menciona un parque, una ZEPA o un LIC concretos.

## Toda alta de especies actualiza el glosario

Cada vez que se buscan especies nuevas para rellenar los hábitats de un espacio (GBIF/EIDOS, o
redacción a mano en `data/contenido/*.json`), entra vocabulario científico nuevo en las
descripciones. **Ese vocabulario tiene que quedar definido en el glosario divulgativo en la misma
pasada**: si no, el término aparece en la ficha y el lector no puede pulsarlo para saber qué es.

```bash
npm run glossary:check
```

`Tools/glossary-coverage.js` compara el texto de todas las fichas contra el glosario y lista los
tecnicismos que han entrado sin definición. El hook de pre-commit lo ejecuta solo en cada commit,
como aviso (nunca bloquea). El ciclo completo —redactar, cargar en la BD, `npm run export:glossary`
y subir la `VERSION` del Service Worker— está en
[glosario-divulgativo.md](glosario-divulgativo.md).

## Vocabulario de `group`

Había **79 valores distintos** en un parque y **61** en el otro, mezclando tres cosas: la forma de
vida (`Arbusto`), la familia botánica (`Quenopodiácea`) y el ambiente (`psamófila`, `de rambla`). La
ficha ya tiene un apartado de taxonomía para la familia y un campo `habitat` para el ambiente, así
que `group` se queda con lo único que no está en otro sitio: **qué clase de ser vivo es**. Quedan
**27 valores**:

- Flora: Árbol · Conífera · Palmera · Arbusto · Mata · Mata aromática · Hierba · Gramínea ·
  Planta bulbosa · Planta suculenta · Planta parásita · Helecho · Orquídea
- Fauna: Ave · Ave rapaz · Ave rapaz nocturna · Ave marina · Ave acuática · Ave limícola ·
  Ave esteparia · Mamífero · Mamífero carnívoro · Mamífero ungulado · Murciélago · Roedor ·
  Reptil · Anfibio

La traducción vive en `GRUPO_NORMALIZADO`, dentro de `Tools/sync-species-catalog.js`.

## Estado tras el repaso

| | Antes | Después |
|---|---|---|
| Fichas con descripción que nombra un parque o una ZEPA ajena | 145 | 0 |
| Especies sin pistas de identificación | 189 | 0 |
| Especies que divergen entre parques | 50 | 0 |
| Valores distintos de `group` | 79 + 61 | 27 |
| Nombres comunes equivocados | 8 | 0 |

Los nombres comunes corregidos: *Quercus ilex* era «Alcornoque» (es la encina), *Quercus rotundifolia*
pasa a «Carrasca», *Ulmus minor* y *U. glabra* eran «Álamo» (son olmos), *Digitalis obscura* era
«Almez», *Arctostaphylos uva-ursi* era «Alcantarilla» (es la gayuba), *Pistacia terebinthus* era
«Cafresnu» (cornicabra) y *Viburnum tinus* era «Llorer bord» (durillo, nombre catalán).

## Lo que queda pendiente

- **37 fichas de Sierra Espuña marcadas «a revisar»**: su cita de presencia procede del volcado
  inicial que reutilizó fichas de Cabo Cope, no de una fuente propia. Hay que referenciarlas contra
  el PORN y el plan de gestión del espacio.
- **80 especies sin hábitat asignado** (22 en Cabo Cope, 58 en Sierra Espuña): son sobre todo aves y
  murciélagos, que no se adscriben a un hábitat vegetal cartografiado. Es una decisión de modelo, no
  un fallo, pero hace que no cuenten para el progreso por hábitat.
- ***Sideritis bourgaeana*** sigue sin foto: no existe ninguna imagen con licencia libre de este
  taxón ni en Wikimedia Commons ni en GBIF (0 ocurrencias con multimedia).
