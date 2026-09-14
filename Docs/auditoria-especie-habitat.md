# Auditoría de los enlaces especie↔hábitat

_Generado por `npm run especies:habitats` el 2026-09-14. No se edita a mano: se regenera._

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
| sierra-espuna | 959 | — | 3 | — | — | 2 | 47 | 907 | sí |
| **total** | **959** | **0** | **3** | **0** | **0** | **2** | **47** | **907** | |

**Se retiran 3 enlaces de 959.** Los 2 no evaluables **no se tocan**:
quedan aquí escritos como hueco a contrastar, que es lo que manda la regla nº 2 del `CLAUDE.md`.

## Sobre cuántas ocurrencias se sostiene cada enlace

Es el hallazgo de fondo de la auditoría y no lo arregla ninguna de las retiradas de arriba. El
criterio vigente da por bueno un enlace con **un** registro dentro del polígono, mientras que para
entrar en el catálogo a una especie se le piden dos ocurrencias en dos hábitats
(`data/umbrales-seleccion.json`). El listón del enlace es por tanto más bajo que el de la ficha, y
así se reparte hoy:

| Espacio | Enlaces medibles | 1 occ. | 2 occ. | 3-4 occ. | 5-9 occ. | 10+ occ. | Sobre un solo registro |
|---|---|---|---|---|---|---|---|
| sierra-espuna | 910 | 132 | 167 | 201 | 220 | 190 | 15 % |
| **total** | **910** | **132** | **167** | **201** | **220** | **190** | **15 %** |

Subir el listón a dos ocurrencias es una decisión de producto, no de auditoría: dejaría sin
ningún hábitat del que colgar a más de la mitad del catálogo de El Carche, y una especie sin
hábitat solo se encuentra en «todas las especies». Se toma —si se toma— a propósito y midiendo,
con `--umbral 2`.

## sierra-espuna

### Taxón volador enlazado por sus ocurrencias — 3 (se retiran)

| Especie | Hábitat | HIC | Ocurr. | Motivo |
|---|---|---|---|---|
| *Pipistrellus nathusii* (Murciélago de Nathusius) | encinares-de-quercus-9340 | 9340 | 2 | taxón volador cuyo enlace sale del barrido de ocurrencias: un registro en vuelo cae dentro de cualquier polígono (CLAUDE.md, regla nº 8) |
| *Pipistrellus nathusii* (Murciélago de Nathusius) | matorrales-mediterraneos-y-4090 | 4090 | 2 | taxón volador cuyo enlace sale del barrido de ocurrencias: un registro en vuelo cae dentro de cualquier polígono (CLAUDE.md, regla nº 8) |
| *Pipistrellus nathusii* (Murciélago de Nathusius) | zonas-subestepicas-de-6220 | 6220 | 2 | taxón volador cuyo enlace sale del barrido de ocurrencias: un registro en vuelo cae dentro de cualquier polígono (CLAUDE.md, regla nº 8) |

### No evaluable — 2 (se conservan)

Los 2, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

