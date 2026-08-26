# Auditoría de los enlaces especie↔hábitat

_Generado por `npm run especies:habitats` el 2026-08-25. No se edita a mano: se regenera._

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
| cabo-cope-puntas-calnegre | 191 | — | — | — | — | 99 | 36 | 56 | sí |
| calblanque-monte-cenizas-pena-aguila | 470 | — | — | — | — | 5 | 43 | 422 | sí |
| carrascoy-y-el-valle | 1270 | — | — | — | — | 3 | 43 | 1224 | sí |
| cuatro-calas | 275 | — | — | — | — | — | 19 | 256 | sí |
| espacios-abiertos-e-islas-del-mar-menor | 344 | — | — | — | — | 2 | 47 | 295 | sí |
| humedal-del-ajauque-y-rambla-salada | 64 | — | — | — | — | 4 | 14 | 46 | sí |
| monte-arabi | 24 | — | — | — | — | — | 3 | 21 | sí |
| salinas-arenales-san-pedro-pinatar | 497 | — | — | — | — | 5 | 31 | 461 | sí |
| sierra-de-el-carche | 1105 | — | — | — | — | — | 39 | 1066 | sí |
| sierra-de-la-pila | 689 | — | — | — | — | — | 34 | 655 | sí |
| sierra-de-las-moreras | 103 | — | — | — | — | — | 14 | 89 | sí |
| sierra-de-salinas | 179 | — | — | — | — | — | 8 | 171 | sí |
| sierra-espuna | 697 | — | — | — | — | 8 | 47 | 642 | sí |
| sotos-y-bosques-de-ribera-de-canaverosa | 49 | — | — | — | — | — | 20 | 29 | sí |
| **total** | **6009** | **0** | **0** | **0** | **0** | **126** | **407** | **5476** | |

**Se retiran 0 enlaces de 6009.** Los 126 no evaluables **no se tocan**:
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
| cabo-cope-puntas-calnegre | 56 | 12 | 5 | 12 | 12 | 15 | 21 % |
| calblanque-monte-cenizas-pena-aguila | 422 | 212 | 94 | 51 | 41 | 24 | 50 % |
| carrascoy-y-el-valle | 1224 | 330 | 254 | 250 | 204 | 186 | 27 % |
| cuatro-calas | 256 | 78 | 59 | 83 | 25 | 11 | 30 % |
| espacios-abiertos-e-islas-del-mar-menor | 295 | 187 | 71 | 28 | 7 | 2 | 63 % |
| humedal-del-ajauque-y-rambla-salada | 46 | 33 | 10 | 1 | 2 | 0 | 72 % |
| monte-arabi | 21 | 10 | 4 | 4 | 1 | 2 | 48 % |
| salinas-arenales-san-pedro-pinatar | 461 | 213 | 73 | 66 | 73 | 36 | 46 % |
| sierra-de-el-carche | 1066 | 700 | 171 | 65 | 56 | 74 | 66 % |
| sierra-de-la-pila | 655 | 145 | 238 | 127 | 88 | 57 | 22 % |
| sierra-de-las-moreras | 89 | 55 | 14 | 16 | 4 | 0 | 62 % |
| sierra-de-salinas | 171 | 58 | 63 | 22 | 23 | 5 | 34 % |
| sierra-espuna | 642 | 2 | 96 | 157 | 208 | 179 | 0 % |
| sotos-y-bosques-de-ribera-de-canaverosa | 29 | 20 | 6 | 2 | 1 | 0 | 69 % |
| **total** | **5476** | **2089** | **1161** | **890** | **745** | **591** | **38 %** |

Subir el listón a dos ocurrencias es una decisión de producto, no de auditoría: dejaría sin
ningún hábitat del que colgar a más de la mitad del catálogo de El Carche, y una especie sin
hábitat solo se encuentra en «todas las especies». Se toma —si se toma— a propósito y midiendo,
con `--umbral 2`.

## cabo-cope-puntas-calnegre

### No evaluable — 99 (se conservan)

| Especie | Hábitat | HIC | Ocurr. | Motivo |
|---|---|---|---|---|
| *Allium melananthum* (Ajo de flor oscura) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Allium melananthum* (Ajo de flor oscura) | matorral-halofilo | 1420 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Pancratium maritimum* (Azucena de mar) | dunas-embrionarias | 2110 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Centaurium rigualii* (Centaurio de Rigual) | matorral-halofilo | 1420 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Caralluma europaea* (Chumberillo de lobo) | matorral-halonitrofilo | 1430 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Salsola papillosa* (Salsola) | matorral-halofilo | 1420 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Olea europaea subsp. europaea* (Acebuche) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Beta maritima* (Acelga marina) | veg-anual-desechos-marinos | 1210 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Lygeum spartum* (Albardín) | matorral-halofilo | 1420 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Lygeum spartum* (Albardín) | matorral-halonitrofilo | 1430 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Lygeum spartum* (Albardín) | estepas-salinas-albardinal | 1510 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Frankenia corymbosa* (Albardín brezo) | estepas-salinas-albardinal | 1510 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Capparis sicula subsp. sicula* (Alcaparra) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Lavandula multifida* (Alhucema) | subestepa-thero-brachypodietea | 6220 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Glaucium flavum* (Amapola marina) | rios-glaucium | 3250 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Anabasis hispanica* (Anabasis) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Anabasis hispanica* (Anabasis) | matorral-halofilo | 1420 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Maytenus senegalensis subsp. europaea* (Arto) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Nerium oleander* (Baladre) | galeria-ribera | 92D0 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Salsola kali* (Barrilla pinchosa) | veg-anual-desechos-marinos | 1210 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Ephedra fragilis* (Canadillo) | roquedos-casmofiticos | 8210 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Saccharum ravennae* (Carrizo real) | galeria-ribera | 92D0 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Cynomorium coccineum* (Cinomorio) | matorral-halofilo | 1420 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Silene ramosissima* (Colleja de arenal) | dunas-malcomietalia | 2230 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Citrullus colocynthis* (Coloquíntida) | galeria-ribera | 92D0 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Quercus coccifera* (Coscoja) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Quercus coccifera* (Coscoja) | sabinar-juniperus | 5210 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Lotus creticus* (Cuernecillo de mar) | dunas-embrionarias | 2110 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Eragrostis papposa* (Eragrostis) | subestepa-thero-brachypodietea | 6220 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Erodium sanguis-christi* (Erodio) | subestepa-thero-brachypodietea | 6220 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Scrophularia canina* (Escrofularia de perro) | rios-glaucium | 3250 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Chalcides bedriagai* (Eslizón ibérico) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Rhamnus lycioides subsp. borgiae* (Espino negro) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Rhamnus lycioides subsp. borgiae* (Espino negro) | sabinar-juniperus | 5210 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Martes foina* (Garduña) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Felis silvestris* (Gato montés) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Genetta genetta* (Gineta) | matorral-semiarido | 5330 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Elymus farctus* (Grama de mar) | dunas-embrionarias | 2110 | — | el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia |
| *Hornungia petraea* (Hornungia) | prados-alysso-sedion | 6110 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |
| *Sus scrofa* (Jabalí) | azufaifar | 5220 | 0 | el enlace no sale del barrido —la ficha no tiene ocurrencias de GBIF— sino de una fuente documental, así que la ausencia de registros en el polígono no lo desmiente |

_… y 59 más. La lista completa está en_ `Tools/catalogo-nacional/out/auditoria-especie-habitat.json`.

## calblanque-monte-cenizas-pena-aguila

### No evaluable — 5 (se conservan)

Los 5, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## carrascoy-y-el-valle

### No evaluable — 3 (se conservan)

Los 3, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## espacios-abiertos-e-islas-del-mar-menor

### No evaluable — 2 (se conservan)

Los 2, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## humedal-del-ajauque-y-rambla-salada

### No evaluable — 4 (se conservan)

Los 4, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## salinas-arenales-san-pedro-pinatar

### No evaluable — 5 (se conservan)

Los 5, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

## sierra-espuna

### No evaluable — 8 (se conservan)

Los 8, por el mismo motivo: el barrido no conoce este taxón por su clave ni por su nombre: es un desajuste de nomenclatura, no una ausencia.

