# Auditoría de los enlaces especie↔hábitat

_Generado por `npm run especies:habitats` el 2026-08-28. No se edita a mano: se regenera._

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
| cabezo-gordo | 22 | — | — | — | — | — | 5 | 17 | sí |
| cabo-cope-puntas-calnegre | 308 | — | — | — | — | — | 25 | 283 | sí |
| calblanque-monte-cenizas-pena-aguila | 470 | — | — | — | — | 5 | 40 | 425 | sí |
| carrascoy-y-el-valle | 1270 | — | — | — | — | — | 43 | 1227 | sí |
| cuatro-calas | 275 | — | — | — | — | — | 19 | 256 | sí |
| espacios-abiertos-e-islas-del-mar-menor | 343 | — | — | — | — | 2 | 46 | 295 | sí |
| humedal-del-ajauque-y-rambla-salada | 64 | — | — | — | — | 4 | 14 | 46 | sí |
| monte-arabi | 24 | — | — | — | — | — | 3 | 21 | sí |
| salinas-arenales-san-pedro-pinatar | 487 | — | — | — | — | 6 | 30 | 451 | sí |
| sierra-de-el-carche | 1105 | — | — | — | — | — | 39 | 1066 | sí |
| sierra-de-la-pila | 689 | — | — | — | — | — | 34 | 655 | sí |
| sierra-de-las-moreras | 106 | — | — | — | — | — | 14 | 92 | sí |
| sierra-de-salinas | 179 | — | — | — | — | — | 8 | 171 | sí |
| sierra-espuna | 697 | — | — | — | — | 2 | 47 | 648 | sí |
| sotos-y-bosques-de-ribera-de-canaverosa | 49 | — | — | — | — | — | 20 | 29 | sí |
| **total** | **6118** | **0** | **0** | **0** | **0** | **19** | **391** | **5708** | |

**Se retiran 0 enlaces de 6118.** Los 19 no evaluables **no se tocan**:
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
| cabezo-gordo | 17 | 15 | 0 | 2 | 0 | 0 | 88 % |
| cabo-cope-puntas-calnegre | 283 | 124 | 53 | 51 | 35 | 20 | 44 % |
| calblanque-monte-cenizas-pena-aguila | 425 | 214 | 95 | 51 | 41 | 24 | 50 % |
| carrascoy-y-el-valle | 1227 | 333 | 254 | 250 | 204 | 186 | 27 % |
| cuatro-calas | 256 | 78 | 59 | 83 | 25 | 11 | 30 % |
| espacios-abiertos-e-islas-del-mar-menor | 295 | 187 | 71 | 28 | 7 | 2 | 63 % |
| humedal-del-ajauque-y-rambla-salada | 46 | 33 | 10 | 1 | 2 | 0 | 72 % |
| monte-arabi | 21 | 10 | 4 | 4 | 1 | 2 | 48 % |
| salinas-arenales-san-pedro-pinatar | 451 | 210 | 69 | 65 | 71 | 36 | 47 % |
| sierra-de-el-carche | 1066 | 700 | 171 | 65 | 56 | 74 | 66 % |
| sierra-de-la-pila | 655 | 145 | 238 | 127 | 88 | 57 | 22 % |
| sierra-de-las-moreras | 92 | 55 | 17 | 16 | 4 | 0 | 60 % |
| sierra-de-salinas | 171 | 58 | 63 | 22 | 23 | 5 | 34 % |
| sierra-espuna | 648 | 2 | 97 | 158 | 212 | 179 | 0 % |
| sotos-y-bosques-de-ribera-de-canaverosa | 29 | 20 | 6 | 2 | 1 | 0 | 69 % |
| **total** | **5708** | **2203** | **1210** | **929** | **770** | **596** | **39 %** |

Subir el listón a dos ocurrencias es una decisión de producto, no de auditoría: dejaría sin
ningún hábitat del que colgar a más de la mitad del catálogo de El Carche, y una especie sin
hábitat solo se encuentra en «todas las especies». Se toma —si se toma— a propósito y midiendo,
con `--umbral 2`.

## calblanque-monte-cenizas-pena-aguila

### No evaluable — 5 (se conservan)

Los 5, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## espacios-abiertos-e-islas-del-mar-menor

### No evaluable — 2 (se conservan)

Los 2, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## humedal-del-ajauque-y-rambla-salada

### No evaluable — 4 (se conservan)

Los 4, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## salinas-arenales-san-pedro-pinatar

### No evaluable — 6 (se conservan)

Los 6, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## sierra-espuna

### No evaluable — 2 (se conservan)

Los 2, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

