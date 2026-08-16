# Auditoría de los enlaces especie↔hábitat

_Generado por `npm run especies:habitats` el 2026-08-16. No se edita a mano: se regenera._

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
| cabo-cope-puntas-calnegre | 189 | — | — | — | — | 182 | 7 | — | no |
| carrascoy-y-el-valle | 1258 | — | — | — | — | 3 | 15 | 1240 | sí |
| cuatro-calas | 271 | — | — | — | — | 269 | 2 | — | no |
| monte-arabi | 23 | — | — | — | — | — | — | 23 | sí |
| sierra-de-el-carche | 1094 | — | — | — | — | — | 12 | 1082 | sí |
| sierra-de-la-pila | 677 | — | — | — | — | — | 16 | 661 | sí |
| sierra-de-salinas | 178 | — | — | — | — | — | 1 | 177 | sí |
| sierra-espuna | 689 | — | — | — | — | 659 | 30 | — | no |
| **total** | **4379** | **0** | **0** | **0** | **0** | **1113** | **83** | **3183** | |

**Se retiran 0 enlaces de 4379.** Los 1113 no evaluables **no se tocan**:
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
| carrascoy-y-el-valle | 1240 | 333 | 256 | 255 | 208 | 188 | 27 % |
| monte-arabi | 23 | 10 | 5 | 5 | 1 | 2 | 43 % |
| sierra-de-el-carche | 1082 | 708 | 174 | 65 | 58 | 77 | 65 % |
| sierra-de-la-pila | 661 | 146 | 238 | 128 | 91 | 58 | 22 % |
| sierra-de-salinas | 177 | 60 | 64 | 24 | 24 | 5 | 34 % |
| **total** | **3183** | **1257** | **737** | **477** | **382** | **330** | **39 %** |

Subir el listón a dos ocurrencias es una decisión de producto, no de auditoría: dejaría sin
ningún hábitat del que colgar a más de la mitad del catálogo de El Carche, y una especie sin
hábitat solo se encuentra en «todas las especies». Se toma —si se toma— a propósito y midiendo,
con `--umbral 2`.

## cabo-cope-puntas-calnegre

### No evaluable — 182 (se conservan)

Los 182, por el mismo motivo: el espacio no tiene barrido de GBIF versionado.

Se arregla con `npm run gbif:habitats -- --park cabo-cope-puntas-calnegre --json Tools/catalogo-nacional/out/cabo-cope-puntas-calnegre-gbif.json` (necesita red) y
volviendo a pasar la auditoría.

## carrascoy-y-el-valle

### No evaluable — 3 (se conservan)

Los 3, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## cuatro-calas

### No evaluable — 269 (se conservan)

Los 269, por el mismo motivo: el espacio no tiene barrido de GBIF versionado.

Se arregla con `npm run gbif:habitats -- --park cuatro-calas --json Tools/catalogo-nacional/out/cuatro-calas-gbif.json` (necesita red) y
volviendo a pasar la auditoría.

## sierra-espuna

### No evaluable — 659 (se conservan)

Los 659, por el mismo motivo: el espacio no tiene barrido de GBIF versionado.

Se arregla con `npm run gbif:habitats -- --park sierra-espuna --json Tools/catalogo-nacional/out/sierra-espuna-gbif.json` (necesita red) y
volviendo a pasar la auditoría.

