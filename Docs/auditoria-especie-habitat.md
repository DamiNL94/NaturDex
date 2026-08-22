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
| cabezo-gordo | 22 | — | — | — | — | — | 3 | 19 | sí |
| cabo-cope-puntas-calnegre | 189 | — | — | — | — | 171 | 18 | — | no |
| calblanque-monte-cenizas-pena-aguila | 454 | — | — | — | — | 5 | 11 | 438 | sí |
| carrascoy-y-el-valle | 1258 | — | — | — | — | 3 | 17 | 1238 | sí |
| cuatro-calas | 271 | — | — | — | — | 263 | 8 | — | no |
| espacios-abiertos-e-islas-del-mar-menor | 318 | — | — | — | — | 2 | 7 | 309 | sí |
| humedal-del-ajauque-y-rambla-salada | 68 | 4 | — | — | — | 4 | 14 | 46 | sí |
| monte-arabi | 23 | — | — | — | — | — | 1 | 22 | sí |
| salinas-arenales-san-pedro-pinatar | 476 | — | — | — | — | 5 | 3 | 468 | sí |
| sierra-de-el-carche | 1094 | — | — | — | — | — | 14 | 1080 | sí |
| sierra-de-la-pila | 677 | — | — | — | — | — | 17 | 660 | sí |
| sierra-de-salinas | 178 | — | — | — | — | — | 2 | 176 | sí |
| sierra-espuna | 689 | — | — | — | — | 658 | 31 | — | no |
| **total** | **5717** | **4** | **0** | **0** | **0** | **1111** | **146** | **4456** | |

**Se retiran 4 enlaces de 5717.** Los 1111 no evaluables **no se tocan**:
quedan aquí escritos como hueco a contrastar, que es lo que manda la regla nº 2 del `CLAUDE.md`.

## Sobre cuántas ocurrencias se sostiene cada enlace

Es el hallazgo de fondo de la auditoría y no lo arregla ninguna de las retiradas de arriba. El
criterio vigente da por bueno un enlace con **un** registro dentro del polígono, mientras que para
entrar en el catálogo a una especie se le piden dos ocurrencias en dos hábitats
(`data/umbrales-seleccion.json`). El listón del enlace es por tanto más bajo que el de la ficha, y
así se reparte hoy:

| Espacio | Enlaces medibles | 1 occ. | 2 occ. | 3-4 occ. | 5-9 occ. | 10+ occ. | Sobre un solo registro |
|---|---|---|---|---|---|---|---|
| cabezo-gordo | 19 | 16 | 0 | 3 | 0 | 0 | 84 % |
| calblanque-monte-cenizas-pena-aguila | 438 | 219 | 96 | 53 | 43 | 27 | 50 % |
| carrascoy-y-el-valle | 1238 | 333 | 256 | 255 | 207 | 187 | 27 % |
| espacios-abiertos-e-islas-del-mar-menor | 309 | 194 | 77 | 29 | 7 | 2 | 63 % |
| humedal-del-ajauque-y-rambla-salada | 50 | 37 | 10 | 1 | 2 | 0 | 74 % |
| monte-arabi | 22 | 10 | 5 | 4 | 1 | 2 | 45 % |
| salinas-arenales-san-pedro-pinatar | 468 | 215 | 76 | 67 | 73 | 37 | 46 % |
| sierra-de-el-carche | 1080 | 708 | 174 | 65 | 58 | 75 | 66 % |
| sierra-de-la-pila | 660 | 146 | 238 | 128 | 91 | 57 | 22 % |
| sierra-de-salinas | 176 | 60 | 64 | 24 | 23 | 5 | 34 % |
| **total** | **4460** | **1938** | **996** | **629** | **505** | **392** | **43 %** |

Subir el listón a dos ocurrencias es una decisión de producto, no de auditoría: dejaría sin
ningún hábitat del que colgar a más de la mitad del catálogo de El Carche, y una especie sin
hábitat solo se encuentra en «todas las especies». Se toma —si se toma— a propósito y midiendo,
con `--umbral 2`.

## cabo-cope-puntas-calnegre

### No evaluable — 171 (se conservan)

Los 171, por el mismo motivo: el espacio no tiene barrido de GBIF versionado.

Se arregla con `npm run gbif:habitats -- --park cabo-cope-puntas-calnegre --json Tools/catalogo-nacional/out/cabo-cope-puntas-calnegre-gbif.json` (necesita red) y
volviendo a pasar la auditoría.

## calblanque-monte-cenizas-pena-aguila

### No evaluable — 5 (se conservan)

Los 5, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## carrascoy-y-el-valle

### No evaluable — 3 (se conservan)

Los 3, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## cuatro-calas

### No evaluable — 263 (se conservan)

Los 263, por el mismo motivo: el espacio no tiene barrido de GBIF versionado.

Se arregla con `npm run gbif:habitats -- --park cuatro-calas --json Tools/catalogo-nacional/out/cuatro-calas-gbif.json` (necesita red) y
volviendo a pasar la auditoría.

## espacios-abiertos-e-islas-del-mar-menor

### No evaluable — 2 (se conservan)

Los 2, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## humedal-del-ajauque-y-rambla-salada

### Contradicción de medio — 4 (se retiran)

| Especie | Hábitat | HIC | Ocurr. | Motivo |
|---|---|---|---|---|
| *Sedum sediforme* (Uña de gato) | rios-mediterraneos-de-3280 | 3280 | 1 | el hábitat es de medio acuático y la ficha declara un medio de pastizal |
| *Suaeda vera* (Sosa fina) | rios-mediterraneos-de-3280 | 3280 | 1 | el hábitat es de medio acuático y la ficha declara un medio salino |
| *Tamarix boveana* (Taray de saladar) | rios-mediterraneos-de-3280 | 3280 | 1 | el hábitat es de medio acuático y la ficha declara un medio de matorral |
| *Anabasis hispanica* (Anabasis) | rios-mediterraneos-de-3280 | 3280 | 1 | el hábitat es de medio acuático y la ficha declara un medio salino |

### No evaluable — 4 (se conservan)

Los 4, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## salinas-arenales-san-pedro-pinatar

### No evaluable — 5 (se conservan)

Los 5, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## sierra-espuna

### No evaluable — 658 (se conservan)

Los 658, por el mismo motivo: el espacio no tiene barrido de GBIF versionado.

Se arregla con `npm run gbif:habitats -- --park sierra-espuna --json Tools/catalogo-nacional/out/sierra-espuna-gbif.json` (necesita red) y
volviendo a pasar la auditoría.

