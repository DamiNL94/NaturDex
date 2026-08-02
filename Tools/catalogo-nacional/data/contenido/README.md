# `data/contenido/` — texto divulgativo de las fichas de especie

Un fichero JSON por tanda, indexado por **nombre científico**. Lo lee
`Tools/sync-species-catalog.js --extract`, que lo superpone a lo extraído de los `park.json`: **lo
que hay aquí manda**, porque está escrito para ser universal y lo de los `park.json` arrastra el
sesgo del parque en el que se redactó.

## Regla única

**Nada de este directorio puede nombrar un parque, una ZEPA o un LIC concretos.** La misma ficha se
sirve en todos los espacios donde vive la especie: en cuanto un texto dice «del parque», es falso en
todos menos en uno. Lo específico del espacio va en el `park.json` (`habitatIds`, `source`,
`featured`, `zepaSiteCode`). `npm run validate` da error si se cuela.

## Campos

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

## Después de editar

```bash
node Tools/sync-species-catalog.js --extract && node Tools/sync-species-catalog.js --apply --sql Database/species-universal.sql
```

## Cuidado: no edites `park.json` a mano para estos campos

El catálogo universal manda. Si cambias `image`, `description`, `tips`… directamente en un
`park.json`, el siguiente `--apply` lo **pisa** con el valor del catálogo y parecerá que tu cambio
se ha perdido solo. (Pasó con la foto de *Anabasis hispanica*.) El cambio va aquí, en
`data/contenido/`, o en el `park.json` **y** regenerando el catálogo con
`rm Tools/catalogo-nacional/data/especies-universal.json && npm run species:extract`.

`--extract` avisa por consola de cada valor del catálogo que no coincide con lo que hay en un
parque; no lo mandes a `/dev/null`.
