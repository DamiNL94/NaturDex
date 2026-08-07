# `data/contenido/` — texto divulgativo de las fichas

Dos familias de ficheros, con la misma regla y herramientas distintas:

| Fichero | Indexado por | Lo aplica |
|---|---|---|
| `NN-<tanda>.json` (`01-aves`, `02-flora-matorral`…) | **nombre científico** | `Tools/sync-species-catalog.js --extract` |
| `habitats.json` | **código HIC** | `Tools/sync-habitat-catalog.js --apply` |
| `fitosociologia.json` | **nombre latino de la asociación, sin autoría** | `Tools/sync-habitat-catalog.js --apply` |

En los tres casos **lo que hay aquí manda** sobre lo que haya en los `park.json`: está escrito para
ser universal, y lo de los `park.json` arrastra el sesgo del parque en el que se redactó.

## Regla única

**Nada de este directorio puede nombrar un parque, una ZEPA o un LIC concretos.** La misma ficha se
sirve en todos los espacios donde vive la especie —o donde la cartografía reconoce ese hábitat—: en
cuanto un texto dice «del parque», es falso en todos menos en uno. Lo específico del espacio va en el
`park.json` (`habitatIds`, `source`, `featured`, `zepaSiteCode` en especies; el polígono, la
superficie, `speciesIds` y `reviewNote` en hábitats). `npm run validate` da error si se cuela.

## Campos (fichas de especie)

| Campo | Qué es |
|---|---|
| `commonName` | Solo si el que había estaba mal. Cambia el nombre en todos los parques a la vez. |
| `group` | Vocabulario cerrado (ver `GRUPO_NORMALIZADO` en `Tools/sync-species-catalog.js`): **qué clase de ser vivo es**, no su familia ni su ambiente. |
| `habitat` | El ambiente de la especie en términos generales: «Roquedos, matorral seco y pie de acantilado en clima cálido». |
| `seasonality` | Cuándo se puede ver o reconocer. |
| `description` | Dos o tres frases divulgativas: qué es, cómo vive, algún detalle que enganche. |
| `tips` | **Tres rasgos observables en campo.** No el hábitat otra vez, no «muy localizada», no «no manipular». Si no sirve para decidir si lo que tienes delante es esa especie, no es una pista. |
| `iucnGlobal`, `spainStatus` | Solo para corregir valores erróneos o contradictorios entre parques. |

## Ejemplo

```json
"Upupa epops": {
  "group": "Ave",
  "habitat": "Campos abiertos, dehesas, cultivos con arbolado y bordes de matorral",
  "seasonality": "Todo el año en el sur peninsular; estival en el resto",
  "description": "Ave inconfundible de color canela con alas y cola a franjas blancas y negras, y una cresta eréctil que despliega en abanico al posarse. …",
  "tips": [
    "Vuelo ondulante y torpe, como una mariposa grande",
    "Cresta que abre en abanico justo al aterrizar",
    "Camina por el suelo clavando el pico largo y curvo"
  ]
}
```

## Campos (fichas de hábitat — `habitats.json`)

Un solo campo por código, dentro del bloque `codigos`:

| Campo | Qué es |
|---|---|
| `description` | Dos o tres frases: qué vegetación es y cómo se reconoce a simple vista, dónde aparece, y qué lo hace singular o frágil. Sin cifras de superficie, sin nombres de sitio y sin jerga que no se explique en la misma frase. |

El **nombre** y el **tipo** del hábitat no se tocan aquí: son dato y viven en `data/hic-nombres.json`.

```json
"codigos": {
  "5220": {
    "description": "Espinares de azufaifo (Ziziphus lotus), matas hemisféricas de ramas entrelazadas y espinas ganchudas que forman islas de sombra sobre llanos áridos. …"
  }
}
```

## Campos (asociaciones — `fitosociologia.json`)

La clave es el **nombre latino sin la autoría**: la app busca la clave más larga que sea prefijo de
la cadena oficial, así que la misma asociación con la autoría corregida, ampliada o con una nota
entre paréntesis sigue encontrando su entrada.

| Campo | Qué es |
|---|---|
| `nombre` | El nombre en llano, lo que el visitante tiene delante: «Coscojar con espino negro». |
| `rango` | `asociación` o `alianza`. Es lo que distingue un `-etum` de un `-ion`, y la app lo muestra como etiqueta. |
| `nombradaPor` | Las plantas que dan nombre a la asociación, con su nombre científico y el común. Es lo que convierte el latín en algo legible. |
| `lectura` | **Por qué esas plantas crecen juntas**, no solo dónde. Dos o tres frases con esta estructura: qué filtro impone el ambiente (sal, sequía, fuego, viento, inundación, falta de suelo), con qué solución lo pasa cada planta, y a quién deja fuera —que es lo que explica que sean estas y no otras—. Si entre ellas hay una relación directa (parasitismo, planta nodriza, mismo pájaro dispersante, rebrote tras el fuego), esa es la mejor explicación y va primero. Se pinta con clase `.detail-prose`, así que el glosario resalta su vocabulario: pásale `npm run glossary:check`. |

En la ficha, el **titular es el nombre científico** con la autoría justo debajo, y el resto lo
descifra en este orden: `nombre` → `nombradaPor` → `lectura`.

**La cita oficial no se toca.** Ni el nombre latino ni la autoría (`in`, `ex`, `corr.`, autores, año)
se reescriben, se abrevian ni se traducen: son la referencia bibliográfica, la app las muestra
íntegras y este fichero solo añade la explicación debajo. Si una asociación no tiene entrada aquí,
la ficha sigue mostrando su cita completa; lo único que se pierde es la explicación.

## Después de editar

```bash
# fichas de especie
node Tools/sync-species-catalog.js --extract && node Tools/sync-species-catalog.js --apply --sql Database/species-universal.sql
# hábitats y asociaciones
npm run habitats:check && npm run habitats:apply
```

## Cuidado: no edites `park.json` a mano para estos campos

El catálogo universal manda. Si cambias `image`, `description`, `tips`… directamente en un
`park.json`, el siguiente `--apply` lo **pisa** con el valor del catálogo y parecerá que tu cambio
se ha perdido solo. (Pasó con la foto de *Anabasis hispanica*.) El cambio va aquí, en
`data/contenido/`, o en el `park.json` **y** regenerando el catálogo con
`rm Tools/catalogo-nacional/data/especies-universal.json && npm run species:extract`.

`--extract` avisa por consola de cada valor del catálogo que no coincide con lo que hay en un
parque; no lo mandes a `/dev/null`.

Con los hábitats es igual y más tajante: `habitats.json` **no tiene `--extract`**, porque no hay nada
que rescatar de los `park.json` (los textos que había nombraban el espacio piloto). La descripción de
un hábitat se escribe aquí y solo aquí; `npm run habitats:apply` la pisa en todos los parques a la
vez, y `npm run validate` da **error** si dos parques acaban con textos distintos para el mismo
código HIC.
