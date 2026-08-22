# Auditoría de los enlaces especie↔hábitat

_Generado por `npm run especies:habitats` el 2026-08-22. No se edita a mano: se regenera._

El vínculo especie↔hábitat es el único dato **derivado** del modelo, y hasta ahora se derivaba
de una sola señal: una ocurrencia de GBIF dentro del polígono. Esta auditoría lo repasa enlace a
enlace contra cuatro cotejos que ya viven en el repositorio —el medio que declara el código HIC
frente al que declara la ficha de la especie, el vuelo del taxón, cuántas ocurrencias sostienen
el enlace y si el Atlas de Hábitats da la especie como característica de ese HIC—, retira lo que
no tiene defensa y deja escrito el resto. El criterio, y por qué cada cosa se retira o solo se
anota, está en la cabecera de `Tools/catalogo-nacional/auditoria-especie-habitat.js`.

## Resumen

| Espacio | Enlaces | Contradicción de medio | Taxón volador enlazado por sus ocurrencias | Sin ninguna ocurrencia en ese polígono | Constancia mínima (aviso) | No evaluable | Característica del HIC (Atlas) | Respaldado | Barrido GBIF |
|---|---|---|---|---|---|---|---|---|---|
| barrancos-de-gebas | 30 | — | — | — | — | — | 4 | 26 | sí |
| cabezo-gordo | 22 | — | — | — | — | — | 4 | 18 | sí |
| cabo-cope-puntas-calnegre | 189 | — | — | — | — | 175 | 14 | — | no |
| calblanque-monte-cenizas-pena-aguila | 454 | — | — | — | — | 5 | 13 | 436 | sí |
| carrascoy-y-el-valle | 1258 | — | — | — | — | 3 | 17 | 1238 | sí |
| cuatro-calas | 271 | — | — | — | — | 264 | 7 | — | no |
| espacios-abiertos-e-islas-del-mar-menor | 318 | — | — | — | — | 3 | 6 | 309 | sí |
| monte-arabi | 23 | — | — | — | — | — | 1 | 22 | sí |
| salinas-arenales-san-pedro-pinatar | 476 | — | — | — | — | 6 | — | 470 | sí |
| sierra-de-el-carche | 1094 | — | — | — | — | — | 13 | 1081 | sí |
| sierra-de-la-pila | 677 | — | — | — | — | — | 17 | 660 | sí |
| sierra-de-las-moreras | 103 | — | — | — | — | — | 14 | 89 | sí |
| sierra-de-salinas | 178 | — | — | — | — | — | 3 | 175 | sí |
| sierra-espuna | 689 | — | — | — | — | 658 | 31 | — | no |
| **total** | **5782** | **0** | **0** | **0** | **0** | **1114** | **144** | **4524** | |

**Se retiran 0 enlaces de 5782.** Los 1114 no evaluables **no se tocan**:
quedan aquí escritos como hueco a contrastar, que es lo que manda la regla nº 2 del `CLAUDE.md`.

> Este informe es **el estado de hoy, no un histórico**: se regenera entero en cada pasada, igual
> que hace `build-species-n2.js` con su lista de pendientes. Un cero en las tres columnas de
> retirada significa que ahora mismo ningún enlace del catálogo contradice los cuatro cotejos —no
> que nunca lo hiciera—. Lo que se retiró en cada pasada queda en `Docs/rollout/ESTADO.md` y en el
> propio historial de git.

## Sobre cuántas ocurrencias se sostiene cada enlace

Es el hallazgo de fondo de la auditoría y no lo arregla ninguna de las retiradas de arriba. El
criterio vigente da por bueno un enlace con **un** registro dentro del polígono, mientras que para
entrar en el catálogo a una especie se le piden dos ocurrencias en dos hábitats
(`data/umbrales-seleccion.json`). El listón del enlace es por tanto más bajo que el de la ficha, y
así se reparte hoy:

| Espacio | Enlaces medibles | 1 occ. | 2 occ. | 3-4 occ. | 5-9 occ. | 10+ occ. | Sobre un solo registro |
|---|---|---|---|---|---|---|---|
| barrancos-de-gebas | 26 | 19 | 3 | 4 | 0 | 0 | 73 % |
| cabezo-gordo | 18 | 16 | 0 | 2 | 0 | 0 | 89 % |
| calblanque-monte-cenizas-pena-aguila | 436 | 218 | 96 | 53 | 43 | 26 | 50 % |
| carrascoy-y-el-valle | 1238 | 333 | 256 | 255 | 207 | 187 | 27 % |
| espacios-abiertos-e-islas-del-mar-menor | 309 | 194 | 75 | 31 | 7 | 2 | 63 % |
| monte-arabi | 22 | 10 | 5 | 4 | 1 | 2 | 45 % |
| salinas-arenales-san-pedro-pinatar | 470 | 215 | 76 | 67 | 75 | 37 | 46 % |
| sierra-de-el-carche | 1081 | 708 | 174 | 65 | 58 | 76 | 65 % |
| sierra-de-la-pila | 660 | 146 | 238 | 128 | 91 | 57 | 22 % |
| sierra-de-las-moreras | 89 | 55 | 14 | 16 | 4 | 0 | 62 % |
| sierra-de-salinas | 175 | 59 | 64 | 24 | 23 | 5 | 34 % |
| **total** | **4524** | **1973** | **1001** | **649** | **509** | **392** | **44 %** |

Subir el listón a dos ocurrencias es una decisión de producto, no de auditoría: dejaría sin
ningún hábitat del que colgar a más de la mitad del catálogo de El Carche, y una especie sin
hábitat solo se encuentra en «todas las especies». Se toma —si se toma— a propósito y midiendo,
con `--umbral 2`.

## cabo-cope-puntas-calnegre

### No evaluable — 175 (se conservan)

Los 175, por el mismo motivo: el espacio no tiene barrido de GBIF versionado.

Se arregla con `npm run gbif:habitats -- --park cabo-cope-puntas-calnegre --json Tools/catalogo-nacional/out/cabo-cope-puntas-calnegre-gbif.json` (necesita red) y
volviendo a pasar la auditoría.

## calblanque-monte-cenizas-pena-aguila

### No evaluable — 5 (se conservan)

Los 5, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## carrascoy-y-el-valle

### No evaluable — 3 (se conservan)

Los 3, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## cuatro-calas

### No evaluable — 264 (se conservan)

Los 264, por el mismo motivo: el espacio no tiene barrido de GBIF versionado.

Se arregla con `npm run gbif:habitats -- --park cuatro-calas --json Tools/catalogo-nacional/out/cuatro-calas-gbif.json` (necesita red) y
volviendo a pasar la auditoría.

## espacios-abiertos-e-islas-del-mar-menor

### No evaluable — 3 (se conservan)

Los 3, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## salinas-arenales-san-pedro-pinatar

### No evaluable — 6 (se conservan)

Los 6, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## sierra-espuna

### No evaluable — 658 (se conservan)

Los 658, por el mismo motivo: el espacio no tiene barrido de GBIF versionado.

Se arregla con `npm run gbif:habitats -- --park sierra-espuna --json Tools/catalogo-nacional/out/sierra-espuna-gbif.json` (necesita red) y
volviendo a pasar la auditoría.

