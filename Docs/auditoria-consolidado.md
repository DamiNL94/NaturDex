# Auditoría del catálogo · consolidado

> **GENERADO** por `node Tools/catalogo-nacional/auditoria-consolida-hallazgos.js`. No editar a mano.

Los **2159 hallazgos** de la auditoría de coherencia del catálogo (16 espacios,
cotejados uno a uno contra la base de Railway, EIDOS y GBIF), agrupados por lo que hay que hacer con
ellos en vez de por el espacio donde salieron.

**Qué NO es esto.** No es una lista de errores confirmados: es lo que la auditoría vio, puesto al
lado de lo que hay hoy en el repositorio. Y «tocado» no significa «correcto» — significa que el dato
cambió después de la auditoría, que para los campos con herramienta y fecha equivale a hecho y para
el resto quiere decir «míralo».

## Lo que la agrupación cambia

| | |
|---|---|
| Hallazgos escritos | **2159** |
| De ellos, sobre un taxón concreto | 2104 |
| Sobre el espacio entero (no deduplicables) | 55 |
| **Correcciones distintas** (taxón + campo) | **733** |

O sea: 2104 apuntes para **733** cosas que hacer. El mismo taxón sale una vez por cada
espacio donde está fichado, y ésa es toda la diferencia.

### Estado hoy

| estado | correcciones | qué significa |
|---|---|---|
| `pendiente` | 400 | el dato sigue exactamente como la auditoría lo vio |
| `tocado` | 282 | el valor cambió desde la auditoría |
| `hecho` | 22 | el alta, la baja o el hueco ya está |
| `resuelto` | 21 | el campo ya no existe en la ficha |
| `no comparable` | 7 | la auditoría anotó ahí una frase, no el valor: hay que mirarlo a mano |
| `parcial` | 1 | tocado en unos espacios y pendiente en otros |

> **«Pendiente» incluye lo que se dejó a propósito.** Esta comprobación mira el dato, no la
> intención: los `iucn_global` que siguen igual son en buena parte la **clase GUARDA** de
> `lista-roja-mundial.js` —EIDOS calla y la ficha afirma una categoría, así que no se toca, porque
> escribir el silencio encima sería borrar un dato (regla nº 2 del CLAUDE.md)—. Salen aquí para que
> nadie los dé por revisados, no porque haya que cambiarlos.

### Lo que queda, por cola

| cola | correcciones | pendientes |
|---|---|---|
| correcciones UNIVERSALES | 303 | **12** |
| correcciones LOCALES | 30 | **21** |
| RENOMBRADOS | 8 | **8** |
| ALTAS de ficha | 288 | **287** |
| BAJAS de ficha | 3 | **2** |
| DECISIONES, no trabajo | 83 | **74** |
| Resueltos por la retirada del campo | 21 | **0** |

> La suma puede pasar del total: una corrección sale en dos colas cuando la auditoría la
> clasificó de dos maneras en espacios distintos —el mismo taxón como alta en uno y como baja en
> otro, por ejemplo—. Se deja así a propósito: fundirlas escondería el desacuerdo.

## Cola 1 · correcciones UNIVERSALES

**303 corrección(es)** · 12 pendiente(s). Se corrigen **una vez** en `Tools/catalogo-nacional/data/especies-universal.json` y se reparten con `npm run species:apply -- --sql`. Corregirlas en el `park.json` las revierte el siguiente pase (trampa nº 4 del CLAUDE.md).

| taxón | campo | espacios | estado | lo que la auditoría vio | lo que dice la fuente |
|---|---|---|---|---|---|
| *Falco tinnunculus* | `taxon_order+taxon_family` | 14 | hecho | — | EIDOS v_taxonomia: order="Falconiformes" · family="Falconidae" |
| *Falco tinnunculus* | `iucn_global` | 14 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Psammodromus algirus* | `iucn_global` | 14 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2009) |
| *Upupa epops* | `taxon_order+taxon_family` | 14 | hecho | — | EIDOS v_taxonomia: order="Bucerotiformes" · family="Upupidae" |
| *Upupa epops* | `iucn_global` | 14 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2020) |
| *Falco peregrinus* | `iucn_global` | 13 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Galerida cristata* | `iucn_global` | 13 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Oenanthe hispanica* | `taxon_order+taxon_family` | 13 | hecho | — | EIDOS v_taxonomia: order="Passeriformes" · family="Muscicapidae" |
| *Oenanthe hispanica* | `iucn_global` | 13 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Bubo bubo* | `iucn_global` | 12 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Lanius meridionalis* | `iucn_global` | 12 | tocado | VU (Vulnerable) (evaluación UICN 2017) | VU — Vulnerable (Lista Roja mundial de la UICN, 2017) |
| *Muscicapa striata* | `taxon_order+taxon_family` | 12 | hecho | — | EIDOS v_taxonomia: order="Passeriformes" · family="Muscicapidae" |
| *Muscicapa striata* | `iucn_global` | 12 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Oenanthe leucura* | `iucn_global` | 12 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Pinus halepensis* | `iucn_global` | 12 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2013) |
| *Burhinus oedicnemus* | `iucn_global` | 11 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Galerida theklae* | `iucn_global` | 11 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Hieraaetus pennatus* | `taxon_order+taxon_family` | 11 | hecho | — | EIDOS v_taxonomia: order="Accipitriformes" · family="Accipitridae" |
| *Hieraaetus pennatus* | `iucn_global` | 11 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Acanthodactylus erythrurus* | `iucn_global` | 10 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2009) |
| *Aquila chrysaetos* | `taxon_order+taxon_family` | 10 | hecho | — | EIDOS v_taxonomia: order="Accipitriformes" · family="Accipitridae" |
| *Aquila chrysaetos* | `iucn_global` | 10 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Athene noctua* | `iucn_global` | 10 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Calandrella brachydactyla* | `iucn_global` | 10 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Circaetus gallicus* | `taxon_order+taxon_family` | 10 | hecho | — | EIDOS v_taxonomia: order="Accipitriformes" · family="Accipitridae" |
| *Circaetus gallicus* | `iucn_global` | 10 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Fringilla coelebs* | `iucn_global` | 10 | tocado | LC (Preocupación menor) (evaluación UICN 2019) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Merops apiaster* | `iucn_global` | 10 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Oenanthe oenanthe* | `iucn_global` | 10 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Ptyonoprogne rupestris* | `iucn_global` | 10 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Pyrrhocorax pyrrhocorax* | `taxon_order+taxon_family` | 10 | hecho | — | EIDOS v_taxonomia: order="Passeriformes" · family="Corvidae" |
| *Pyrrhocorax pyrrhocorax* | `iucn_global` | 10 | pendiente | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Streptopelia turtur* | `taxon_order+taxon_family` | 10 | hecho | — | EIDOS v_taxonomia: order="Columbiformes" · family="Columbidae" |
| *Streptopelia turtur* | `iucn_global` | 10 | tocado | VU (Vulnerable) | VU — Vulnerable (Lista Roja mundial de la UICN, 2019) |
| *Buteo buteo* | `iucn_global` | 9 | tocado | LC (Preocupación menor) (evaluación UICN 2021) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Coracias garrulus* | `taxon_order+taxon_family` | 9 | hecho | — | EIDOS v_taxonomia: order="Coraciiformes" · family="Coraciidae" |
| *Coracias garrulus* | `iucn_global` | 9 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Curruca melanocephala* | `iucn_global` | 9 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Juniperus oxycedrus* | `iucn_global` | 9 | tocado | LC (Preocupación menor) (evaluación UICN 2013) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2013) |
| *Juniperus phoenicea* | `iucn_global` | 9 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Pistacia lentiscus* | `iucn_global` | 9 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Rhamnus alaternus* | `iucn_global` | 9 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Tarentola mauritanica* | `iucn_global` | 9 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Arbutus unedo* | `iucn_global` | 8 | tocado | LC (Preocupación menor) (evaluación UICN 2017) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Chamaerops humilis* | `iucn_global` | 8 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Egretta garzetta* | `taxon_order+taxon_family` | 8 | hecho | — | EIDOS v_taxonomia: order="Pelecaniformes" · family="Ardeidae" |
| *Egretta garzetta* | `iucn_global` | 8 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Epidalea calamita* | `iucn_global` | 8 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2022) |
| *Hemidactylus turcicus* | `iucn_global` | 8 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2009) |
| *Hemorrhois hippocrepis* | `iucn_global` | 8 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2009) |
| *Jynx torquilla* | `taxon_order+taxon_family` | 8 | hecho | — | EIDOS v_taxonomia: order="Piciformes" · family="Picidae" |
| *Jynx torquilla* | `iucn_global` | 8 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Loxia curvirostra* | `iucn_global` | 8 | tocado | LC (Preocupación menor) (evaluación UICN 2017) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Lycium intricatum* | `iucn_global` | 8 | tocado | NE (no evaluada a nivel global) | No evaluada en la Lista Roja mundial de la UICN |
| *Monticola solitarius* | `iucn_global` | 8 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Otus scops* | `iucn_global` | 8 | tocado | LC (Preocupación menor) (evaluación UICN 2021) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Periploca angustifolia* | `iucn_global` | 8 | tocado | NE (no evaluada a nivel global) | No evaluada en la Lista Roja mundial de la UICN |
| *Quercus rotundifolia* | `iucn_global` | 8 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Rosmarinus officinalis* | `iucn_global` | 8 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Timon lepidus* | `iucn_global` | 8 | tocado | NT (Casi Amenazado, evaluación de 2009 por declive poblacional en par… | NT — Casi amenazada (Lista Roja mundial de la UICN, 2009) |
| *Atelerix algirus* | `iucn_global` | 7 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2022) |
| *Caprimulgus ruficollis* | `taxon_order+taxon_family` | 7 | hecho | — | EIDOS v_taxonomia: order="Caprimulgiformes" · family="Caprimulgidae" |
| *Caprimulgus ruficollis* | `iucn_global` | 7 | tocado | NT (Casi amenazado) | NT — Casi amenazada (Lista Roja mundial de la UICN, 2022) |
| *Cistus clusii* | `iucn_global` | 7 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Curruca conspicillata* | `iucn_global` | 7 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Helianthemum almeriense* | `iucn_global` | 7 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Limonium cossonianum* | `iucn_global` | 7 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Lullula arborea* | `iucn_global` | 7 | tocado | LC (Preocupación menor) (evaluación UICN 2019) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Melanocorypha calandra* | `taxon_order+taxon_family` | 7 | hecho | — | EIDOS v_taxonomia: order="Passeriformes" · family="Alaudidae" |
| *Melanocorypha calandra* | `iucn_global` | 7 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Meles meles* | `iucn_global` | 7 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Miniopterus schreibersii* | `iucn_global` | 7 | tocado | VU (Vulnerable) (evaluación UICN 2023) | VU — Vulnerable (Lista Roja mundial de la UICN, 2023) |
| *Phoenicurus phoenicurus* | `iucn_global` | 7 | tocado | LC (Preocupación menor) (evaluación UICN 2019) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Quercus coccifera* | `iucn_global` | 7 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Tachybaptus ruficollis* | `taxon_order+taxon_family` | 7 | hecho | — | EIDOS v_taxonomia: order="Podicipediformes" · family="Podicipedidae" |
| *Tachybaptus ruficollis* | `iucn_global` | 7 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Withania frutescens* | `iucn_global` | 7 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Anthyllis cytisoides* | `iucn_global` | 6 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Certhia brachydactyla* | `iucn_global` | 6 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Charadrius alexandrinus* | `iucn_global` | 6 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Chroicocephalus ridibundus* | `taxon_order+taxon_family` | 6 | hecho | — | EIDOS v_taxonomia: order="Charadriiformes" · family="Laridae" |
| *Chroicocephalus ridibundus* | `iucn_global` | 6 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Cistus albidus* | `iucn_global` | 6 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Cosentinia vellea* | `iucn_global` | 6 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Coturnix coturnix* | `iucn_global` | 6 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Cynomorium coccineum* | `iucn_global` | 6 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Frankenia corymbosa* | `iucn_global` | 6 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Genetta genetta* | `iucn_global` | 6 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2015) |
| *Helianthemum violaceum* | `iucn_global` | 6 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Hyparrhenia hirta* | `iucn_global` | 6 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Lafuentea rotundifolia* | `iucn_global` | 6 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Larus audouinii* | `taxon_order+taxon_family` | 6 | hecho | — | EIDOS v_taxonomia: order="Charadriiformes" · family="Laridae" |
| *Larus audouinii* | `iucn_global` | 6 | tocado | VU (Vulnerable) | VU — Vulnerable (Lista Roja mundial de la UICN, 2020) |
| *Myotis capaccinii* | `iucn_global` | 6 | tocado | VU (Vulnerable) (evaluación UICN 2016) | VU — Vulnerable (Lista Roja mundial de la UICN, 2016) |
| *Myotis myotis* | `iucn_global` | 6 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Osyris lanceolata* | `iucn_global` | 6 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Pelophylax perezi* | `iucn_global` | 6 | tocado | LC (Preocupación menor) (evaluación UICN 2022) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2022) |
| *Phillyrea angustifolia* | `iucn_global` | 6 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Rhinolophus ferrumequinum* | `iucn_global` | 6 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Suaeda vera* | `iucn_global` | 6 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Sus scrofa* | `iucn_global` | 6 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Tamarix canariensis* | `iucn_global` | 6 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Thalasseus sandvicensis* | `taxon_order+taxon_family` | 6 | hecho | — | EIDOS v_taxonomia: order="Charadriiformes" · family="Laridae" |
| *Thalasseus sandvicensis* | `iucn_global` | 6 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Ziziphus lotus* | `iucn_global` | 6 | tocado | NE (no evaluada a nivel global) | No evaluada en la Lista Roja mundial de la UICN |
| *Accipiter gentilis* | `taxon_order+taxon_family` | 5 | hecho | — | EIDOS v_taxonomia: order="Accipitriformes" · family="Accipitridae" |
| *Accipiter gentilis* | `iucn_global` | 5 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Anabasis hispanica* | `iucn_global` | 5 | pendiente | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Aquila fasciata* | `iucn_global` | 5 | tocado | LC (población global amplia en Asia y África pese al declive europeo) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Artemisia barrelieri* | `iucn_global` | 5 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Arthrocaulon macrostachyum* | `iucn_global` | 5 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Brachypodium retusum* | `iucn_global` | 5 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2013) |
| *Cakile maritima* | `iucn_global` | 5 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Capra pyrenaica* | `iucn_global` | 5 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Centaurea saxicola* | `iucn_global` | 5 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Circus pygargus* | `iucn_global` | 5 | tocado | LC (Preocupación menor) (evaluación UICN 2021) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Cistus atriplicifolius* | `iucn_global` | 5 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Curruca undata* | `iucn_global` | 5 | tocado | LC | EIDOS v_estadoconservacion, taxonid 80931, ámbito Mundial: NT (Casi amenazada), 2022 |
| *Falco columbarius* | `iucn_global` | 5 | tocado | LC (Preocupación menor) (evaluación UICN 2021) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Genista cinerea* | `iucn_global` | 5 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Limonium insigne* | `iucn_global` | 5 | tocado | NE (no evaluada a nivel global; género con numerosos microendemismos … | No evaluada en la Lista Roja mundial de la UICN |
| *Malpolon monspessulanus* | `iucn_global` | 5 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2009) |
| *Martes foina* | `iucn_global` | 5 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Salsola papillosa* | `iucn_global` | 5 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Saxicola rubetra* | `iucn_global` | 5 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Sciurus vulgaris* | `iucn_global` | 5 | tocado | LC (Preocupación menor) (evaluación UICN 2023) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2023) |
| *Sternula albifrons* | `iucn_global` | 5 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Teucrium freynii* | `iucn_global` | 5 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Teucrium lanigerum* | `iucn_global` | 5 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Tichodroma muraria* | `taxon_order+taxon_family` | 5 | hecho | — | EIDOS v_taxonomia: order="Passeriformes" · family="Tichodromidae" |
| *Tichodroma muraria* | `iucn_global` | 5 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Ulmus minor* | `iucn_global` | 5 | tocado | DD (Datos insuficientes) (evaluación UICN 2017) | DD — Datos insuficientes (Lista Roja mundial de la UICN, 2017) |
| *Viburnum tinus* | `iucn_global` | 5 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Vulpes vulpes* | `iucn_global` | 5 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Ceratonia siliqua* | `iucn_global` | 4 | tocado | LC (Preocupación menor) (evaluación UICN 2017) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Convolvulus althaeoides* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Coturnix coturnix* | `spain_status` | 4 | pendiente | UICN España: DD (Datos insuficientes) (2004) | EIDOS v_estadolegal, ámbito Nacional: ninguna norma. El texto es una EVALUACIÓN de conservación, no una figura legal, y su sitio es `iucnSp… |
| *Curruca cantillans* | `iucn_global` | 4 | tocado | LC (Preocupación menor) (evaluación UICN 2019) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Dianthus broteri* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Ephedra fragilis* | `iucn_global` | 4 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2011) |
| *Felis silvestris* | `iucn_global` | 4 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2023) |
| *Fritillaria lusitanica* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Helianthemum violaceum* | `spain_status` | 4 | pendiente | UICN España: EN (En peligro) (2010) | EIDOS v_estadolegal, taxonid 5102, ámbito Nacional: ninguna norma. La EN 2010 es una evaluación (v_estadoconservacion, España) y ya está bi… |
| *Klasea flavescens* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Launaea lanifera* | `iucn_global` | 4 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Lavandula multifida* | `iucn_global` | 4 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Linaria cavanillesii* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Macrochloa tenacissima* | `iucn_global` | 4 | tocado | VU (Vulnerable) (evaluación UICN 2018) | VU — Vulnerable (Lista Roja mundial de la UICN, 2018) |
| *Mauremys leprosa* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Myotis blythii* | `iucn_global` | 4 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Ononis ornithopodioides* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Oryctolagus cuniculus* | `iucn_global` | 4 | tocado | EN (Lista Roja mundial UICN 2019: En Peligro por declive en su área n… | EN — En peligro (Lista Roja mundial de la UICN, 2019) |
| *Pistacia terebinthus* | `iucn_global` | 4 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Plantago albicans* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Poterium ancistroides* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Prunella collaris* | `iucn_global` | 4 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Rhinolophus euryale* | `iucn_global` | 4 | tocado | NT (Casi amenazado) (evaluación UICN 2016) | NT — Casi amenazada (Lista Roja mundial de la UICN, 2016) |
| *Sarcocornia fruticosa* | `taxon_genus` | 4 | tocado | — | EIDOS v_taxonomia: genus="Salicornia" |
| *Sarcocornia fruticosa* | `iucn_global` | 4 | pendiente | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Sedum dasyphyllum* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Tamarix boveana* | `iucn_global` | 4 | tocado | LC | EIDOS v_estadoconservacion, ámbito Mundial: VU — Vulnerable (2018) |
| *Teucrium capitatum* | `iucn_global` | 4 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Turdus torquatus* | `iucn_global` | 4 | tocado | LC (Preocupación menor) (evaluación UICN 2019) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Allium melananthum* | `iucn_global` | 3 | tocado | NT (Casi amenazado) | NT — Casi amenazada (Lista Roja mundial de la UICN, 2011) |
| *Anthus campestris* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Anthus spinoletta* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Caralluma europaea* | `iucn_global` | 3 | tocado | NE (no evaluada a nivel global; distribución principal fuera de Europ… | No evaluada en la Lista Roja mundial de la UICN |
| *Coronilla juncea* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Digitalis obscura* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Dittrichia viscosa* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Erodium saxatile* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Fagonia cretica* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Falco subbuteo* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2021) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Gyps fulvus* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2021) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2021) |
| *Launaea arborescens* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Lotus dorycnium* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Myrtus communis* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Phillyrea latifolia* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2017) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Pinus pinaster* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2013) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2013) |
| *Populus alba* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Quercus faginea* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Quercus ilex* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2020) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2020) |
| *Rhinolophus hipposideros* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Salsola kali* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Senecio flavus* | `iucn_global` | 3 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Sideritis bourgaeana* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Sideritis leucantha* | `iucn_global` | 3 | tocado | LC (Preocupación menor) (evaluación UICN 2014) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2014) |
| *Stipellula capensis* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Teucrium thymifolium* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Thymus membranaceus* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Thymus zygis* | `iucn_global` | 3 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Arctostaphylos uva-ursi* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Aria edulis* | `iucn_global` | 2 | tocado | LC (Preocupación menor) (evaluación UICN 2017) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Asphodelus fistulosus* | `iucn_global` | 2 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2013) |
| *Asplenium petrarchae* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Atriplex halimus* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Bupleurum gibraltarium* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Capra pyrenaica* | `spain_status` | 2 | pendiente | UICN España: EN (En peligro) (1992) | EIDOS v_estadolegal, ámbito Nacional: ninguna norma. El texto es una EVALUACIÓN de conservación, no una figura legal, y su sitio es `iucnSp… |
| *Cephalanthera longifolia* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Chalcides bedriagai* | `iucn_global` | 2 | tocado | LC | EIDOS: «NT — Casi amenazada (Lista Roja mundial de la UICN, 2009)» |
| *Colutea arborescens* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Cytinus ruber* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Cytisus lanigerus* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Cytisus scoparius* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Daucus pumilus* | `iucn_global` | 2 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Emberiza calandra* | `iucn_global` | 2 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Erinacea anthyllis* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Erodium celtibericum* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Erodium sanguis-christi* | `iucn_global` | 2 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Genista spartioides* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Gulosus aristotelis* | `iucn_global` | 2 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Helianthemum viscarium* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Hornungia petraea* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Imperata cylindrica* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Lanius senator* | `iucn_global` | 2 | tocado | LC (SPEC, en declive en Europa) | EIDOS v_estadoconservacion, ámbito Mundial: NT (Casi amenazada), 2022 |
| *Limodorum abortivum* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Lotus creticus* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Maytenus senegalensis subsp. europaea* | `taxon_genus` | 2 | tocado | — | EIDOS v_taxonomia: genus="Gymnosporia" |
| *Maytenus senegalensis subsp. europaea* | `iucn_global` | 2 | pendiente | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Monticola saxatilis* | `iucn_global` | 2 | tocado | LC (Preocupación menor) (evaluación UICN 2017) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Myotis emarginatus* | `iucn_global` | 2 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Nerium oleander* | `iucn_global` | 2 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2013) |
| *Notoceras bicorne* | `iucn_global` | 2 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Ononis fruticosa* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Ononis speciosa* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Petrosedum sediforme* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Phagnalon saxatile* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | EIDOS: LC — Preocupación menor (Lista Roja mundial de la UICN, 2011) |
| *Poterium ancistroides* | `spain_status` | 2 | pendiente | UICN España: NT (Casi amenazado) (2010) | EIDOS v_estadolegal, ámbito Nacional: ninguna norma. El texto es una EVALUACIÓN de conservación, no una figura legal, y su sitio es `iucnSp… |
| *Rhinolophus mehelyi* | `iucn_global` | 2 | tocado | VU (Vulnerable) (evaluación UICN 2016) | VU — Vulnerable (Lista Roja mundial de la UICN, 2016) |
| *Sedum gypsicola* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Silene mellifera* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Silene ramosissima* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Tamarix africana* | `iucn_global` | 2 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Testudo graeca* | `spain_status` | 2 | tocado | Catálogo Español de Especies Amenazadas / LESRPE (Listado de Especies… | EIDOS v_estadolegal, ámbito Nacional: «Vulnerable» — Real Decreto 139/2011 (Catálogo Español de Especies Amenazadas) |
| *Testudo graeca* | `iucn_global` | 2 | tocado | VU A1cd (evaluación IUCN de 1996; pendiente de reevaluación global re… | VU — Vulnerable (Lista Roja mundial de la UICN, 1996) |
| *Thymus antoninae* | `iucn_global` | 2 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Thymus hyemalis* | `iucn_global` | 2 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Tripidium ravennae* | `iucn_global` | 2 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2013) |
| *Ulex europaeus* | `iucn_global` | 2 | tocado | LC (Preocupación menor) (evaluación UICN 2017) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Acer monspessulanum* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Alectoris rufa* | `iucn_global` | 1 | tocado | LC | EIDOS: «NT — Casi amenazada (Lista Roja mundial de la UICN, 2020)» |
| *Allium pallens* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2011) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2011) |
| *Ammoides pusilla* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2015) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2015) |
| *Anacyclus valentinus* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Andryala ragusina* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Artemisia reptans* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Asparagus albus* | `iucn_global` | 1 | tocado | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Asteriscus maritimus* | `iucn_global` | 1 | tocado | NE (no evaluada a nivel global) | No evaluada en la Lista Roja mundial de la UICN |
| *Athamanta hispanica* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Atriplex portulacoides* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Beta maritima* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Campanula rotundifolia subsp. hispanica* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Caprimulgus europaeus* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Caralluma europaea* | `iucn_spain` | 1 | pendiente | — | EIDOS v_estadoconservacion, taxonid 2866, ámbito España: EN (En peligro), 2010 |
| *Centranthus lecoqii* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Cephalanthera damasonium* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Cistus populifolius* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Colchicum triphyllum* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Convolvulus lineatus* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Cormus domestica* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Cotoneaster granatensis* | `iucn_global` | 1 | tocado | NT (Casi amenazado) (evaluación UICN 1998) | NT — Casi amenazada (Lista Roja mundial de la UICN, 1998) |
| *Crithmum maritimum* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Cyperus capitatus* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Elymus farctus* | `taxon_genus` | 1 | tocado | — | EIDOS v_taxonomia: genus="Thinopyrum" |
| *Elymus farctus* | `iucn_global` | 1 | pendiente | LC (Preocupación menor) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2019) |
| *Enneapogon persicus* | `iucn_global` | 1 | tocado | NE (no evaluada a nivel global; especie de amplia distribución en Asi… | No evaluada en la Lista Roja mundial de la UICN |
| *Epipactis atrorubens* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Epipactis kleinii* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Eragrostis papposa* | `iucn_global` | 1 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Erica erigena* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Erodium foetidum* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2014) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2014) |
| *Fraxinus ornus* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2017) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Genista longipes* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Glaucium flavum* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Gulosus aristotelis* | `taxon_family` | 1 | tocado | — | EIDOS v_taxonomia: family="Sulidae" |
| *Hypericum caprifolium* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Iris lutescens* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Jasione foliosa* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Juglans regia* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2017) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2017) |
| *Lavandula dentata* | `iucn_global` | 1 | tocado | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Limonium delicatulum* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Linaria aeruginea* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Loeflingia hispanica* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Lonicera biflora* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Lonicera splendida* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Maresia nana* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Maytenus senegalensis subsp. europaea* | `iucn_spain` | 1 | pendiente | — | EIDOS v_estadoconservacion, ámbito España: NT — Casi amenazada (Lista Roja española, 2010) |
| *Melica minuta* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Neotinea maculata* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Ophrys lutea* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Peucedanum officinale* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Phragmites australis* | `iucn_global` | 1 | tocado | LC | LC — Preocupación menor (Lista Roja mundial de la UICN, 2020) |
| *Potentilla caulescens* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Prunus prostrata* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2016) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2016) |
| *Pseudodictamnus hirsutus* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Quercus lusitanica* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2018) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2018) |
| *Salix pedicellata* | `iucn_global` | 1 | tocado | LC (Preocupación menor) (evaluación UICN 2010) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2010) |
| *Sarcocapnos enneaphylla subsp. saetabensis* | `iucn_global` | 1 | pendiente | NE | No evaluada en la Lista Roja mundial de la UICN |
| *Saxifraga camposii subsp. leptophylla* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Sedum album* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN (espe… | No evaluada en la Lista Roja mundial de la UICN |
| *Stachys circinata* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Trifolium gemellum* | `iucn_global` | 1 | tocado | No evaluada específicamente en la Lista Roja mundial de la UICN | No evaluada en la Lista Roja mundial de la UICN |
| *Ulmus glabra* | `iucn_global` | 1 | tocado | DD (Datos insuficientes) (evaluación UICN 2017) | DD — Datos insuficientes (Lista Roja mundial de la UICN, 2017) |

## Cola 2 · correcciones LOCALES

**30 corrección(es)** · 21 pendiente(s). Van espacio por espacio en el `park.json` **y** a la base por su propio SQL: `species-universal.sql` solo lleva los universales. Una corrección local que no se vuelca no la ve el usuario, porque la API manda sobre el paquete.

| taxón | campo | espacios | estado | lo que la auditoría vio | lo que dice la fuente |
|---|---|---|---|---|---|
| *Pyrrhocorax pyrrhocorax* | `regional_status` | 9 | tocado | «No incluida en el Catálogo Regional de especies protegidas (Región d… | EIDOS v_estadolegal (por taxonid 12065), Región de Murcia: «Especies de interés especial» — Ley 7/1995 |
| *Curruca conspicillata* | `gbif_species_key` | 7 | tocado | 9868071 | GBIF: la key es HOMOTYPIC_SYNONYM en el backbone; el aceptado es «*Sylvia conspicillata* Temminck, 1820» (key **2492959**) |
| *Caralluma europaea* | `eidos_taxonid` | 3 | pendiente | 80097 | EIDOS v_taxonomia: 80097 = «Caralluma europaea var. maroccana (Hook. fil.) A. Berger» [Variety]. El binomio «Caralluma europaea (Guss.) N.E… |
| *Turdus merula* | `eidos_taxonid` | 3 | pendiente | 11725 | EIDOS: 11725 es «Turdus merula subsp. cabrerae», la subespecie CANARIA, y la ficha declara el binomio |
| *Bucanetes githagineus* | `eidos_taxonid` | 2 | pendiente | 11363 | EIDOS: 11363 es «Bucanetes githagineus subsp. zedlitzi» [Subspecies], y la ficha declara un binomio de especie |
| *Gulosus aristotelis* | `regional_status` | 2 | tocado | No incluida en Catálogo Regional de Flora Silvestre Protegida de la R… | EIDOS v_estadolegal, ámbito Región de Murcia: «Vulnerable» — Ley 7/1995, de 21 de abril, de la fauna silvestre, caza y pesca fluvial |
| *Phalacrocorax carbo* | `eidos_taxonid` | 2 | no comparable | 10965 · ficha oculta («sin descripción») | EIDOS: el taxonid 10965 es de rango **Subspecies**, «*Phalacrocorax carbo* subsp. *sinensis*», que es **otro taxón**, no un matiz de rango |
| *Accipiter gentilis* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Ammophila arenaria subsp. arundinacea* | `eidos_taxonid` | 1 | no comparable | eidosTaxonId **126** y `taxonomy.genus` «Calamagrostis», ya copiado d… | EIDOS: el 126 es ***Calamagrostis arundinacea*** (L.) Roth, una gramínea de bosque. El **barrón de las dunas** es el taxonid **10241**, *Ca… |
| *Capra pyrenaica* | `eidos_taxonid` | 1 | pendiente | 24419 | EIDOS: 24419 es «Capra pyrenaica pyrenaica» [Subspecies] |
| *Caprimulgus ruficollis* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Caralluma europaea* | `regional_status` | 1 | pendiente | No incluida en el Catálogo Regional de especies protegidas (Región de… | EIDOS v_estadolegal, taxonid 2866, Región de Murcia: «Vulnerable» — Decreto n.º 50/2003, de 30 de mayo (Catálogo Regional de Flora Silvestr… |
| *Falco tinnunculus* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Hieraaetus pennatus* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Hydrobates pelagicus* | `eidos_taxonid` | 1 | pendiente | 11953 | EIDOS: el taxonid 11953 es de rango Subspecies («Hydrobates pelagicus pelagicus Linnaeus, 1758») y la ficha declara un binomio de especie |
| *Juniperus phoenicea* | `regional_status` | 1 | tocado | No incluida en el Catálogo Regional de Flora Silvestre Protegida; pob… | EIDOS v_estadolegal, Región de Murcia: «Especies de interés especial» — Decreto n.º 50/2003. Tramo EIDOS 3, tramo de la ficha 1 |
| *Jynx torquilla* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Lotus dorycnium* | `eidos_taxonid` | 1 | pendiente | 4138 | EIDOS: 4138 es «Lotus dorycnium subsp. dorycnium» [Subspecies] y la ficha declara el binomio |
| *Melanocorypha calandra* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Motacilla cinerea* | `eidos_taxonid` | 1 | pendiente | 10897 | EIDOS: rango Subspecies, «*Motacilla cinerea* subsp. ***canariensis***» |
| *Muscicapa striata* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Oenanthe hispanica* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Olea europaea subsp. sylvestris* | `eidos_taxonid` | 1 | no comparable | el ACEBUCHE lleva eidosTaxonId 6645 y está OCULTO («sin descripción»)… | EIDOS v_taxonomia, taxonid 6645: «Olea europaea L. subsp. europaea» (Subspecies, Aceptado/válido), y bajo ESE MISMO taxonid «Olea europaea … |
| *Petrosedum sediforme* | `source` | 1 | tocado | el `source` declara «7 hábitats» y la ficha tiene 8 enlaces · sin eid… | La BD guarda sus 8 enlaces con `evidence` a NULL: build-park-sql.js no rellena una procedencia que no puede deducir del `source` |
| *Petrosedum sediforme* | `eidos_taxonid` | 1 | pendiente | — | La ficha no trae identificador de EIDOS: no hay con qué cotejar su taxonomía ni su estado |
| *Salsola genistoides* | `eidos_taxonid` | 1 | tocado | null | EIDOS: no consultado — la ficha no trae identificador, así que no hay con qué cotejar ni la taxonomía ni la figura legal |
| *Sambucus nigra* | `eidos_taxonid` | 1 | pendiente | 6 | EIDOS: el taxonid 6 es de rango Subspecies, «*Sambucus nigra* subsp. *palmensis*» — el **saúco de La Palma**, endemismo canario |
| *Streptopelia turtur* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Tichodroma muraria* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |
| *Upupa epops* | `regional_status` | 1 | pendiente | Ave de la ZEPA ES0000261 (Almenara, Moreras y Cabo Cope) | La ZEPA ES0000261 es «Almenara, Moreras y Cabo Cope»: NO es el sitio de este espacio, cuya ZEPA es la ES0000173 (Sierra Espuña). Y «ave de … |

## Cola 3 · RENOMBRADOS

**8 corrección(es)** · 8 pendiente(s). No son un campo mal escrito. Un renombrado desengancha la ficha en cuatro sitios —`park.json`, catálogo universal, `data/contenido/` y la fila vieja de la BD, que el UPSERT no retira—. Ver el punto 3 de `ORDEN-DE-OPERACIONES.md`.

| taxón | campo | espacios | estado | lo que la auditoría vio | lo que dice la fuente |
|---|---|---|---|---|---|
| *Anabasis hispanica* | `scientific_name` | 4 | pendiente | Anabasis hispanica | EIDOS v_taxonomia, taxonid 1838: cuatro nombres bajo el mismo taxón — *Anabasis articulata* (Sinónimo), *Anabasis hispanica* (Sinónimo), **… |
| *Natrix natrix* | `scientific_name` | 2 | pendiente | Natrix natrix | EIDOS la da por Sinónimo; acepta ***Natrix helvetica*** (Lacépède, 1789), taxonid 81375, rango Species |
| *Antirrhinum litigiosum* | `scientific_name` | 1 | pendiente | Antirrhinum litigiosum | EIDOS la da por Sinónimo; acepta ***Antirrhinum barrelieri*** Boreau (taxonid 2204, rango Species) |
| *Gobio gobio* | `scientific_name` | 1 | pendiente | Gobio gobio | EIDOS la da por Sinónimo; acepta ***Gobio lozanoi*** Doadrio & Madeira, 2004 (taxonid 11618, rango Species) |
| *Maytenus senegalensis subsp. europaea* | `scientific_name+iucn_spain` | 1 | pendiente | nombre «Maytenus senegalensis subsp. europaea», taxonomy.genus «Mayte… | EIDOS v_taxonomia, taxonid 6258: el nombre de la ficha es **Sinónimo**; el aceptado es «*Gymnosporia senegalensis* subsp. *europaea* (Boiss… |
| *Regulus ignicapillus* | `scientific_name+eidos_taxonid` | 1 | pendiente | nombre «Regulus ignicapillus», taxonid 23782 | EIDOS da el nombre por Sinónimo y acepta «*Regulus ignicapilla balearicus* Jordans, 1923» (taxonid 23782, rango Subspecies) — el reyezuelo … |
| *Satureja cuneifolia* | `scientific_name` | 1 | pendiente | Satureja cuneifolia | EIDOS la da por sinónimo y acepta «Satureja obovata Lag.» (taxonid 7988, Species) |
| *Umbilicus horizontalis* | `scientific_name` | 1 | pendiente | Umbilicus horizontalis | EIDOS la da por sinónimo y acepta «Umbilicus gaditanus Boiss.» (taxonid 9149, Species) |

## Cola 4 · ALTAS de ficha

**288 corrección(es)** · 287 pendiente(s). `build-species-universal.js` si el taxón no está en el catálogo, y después `build-species-n2.js` **solo para las nuevas**: regenerar el espacio entero le devuelve las aves que `aves:poda` le quitó (trampa nº 6).

| taxón | campo | espacios | estado | lo que la auditoría vio | lo que dice la fuente |
|---|---|---|---|---|---|
| *Curruca cantillans* | `inclusion` | 6 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Blanus cinereus* | `inclusion` | 5 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Hyparrhenia hirta* | `inclusion` | 5 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Zamenis scalaris* | `inclusion` | 5 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Acanthodactylus erythrurus* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Accipiter gentilis* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «no-candidata» |
| *Curruca conspicillata* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «exclui… |
| *Guillonea scabra* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Hemorrhois hippocrepis* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Miniopterus schreibersii* | `inclusion` | 4 | pendiente | no fichada | **el formulario oficial del sitio ES6200009 la declara** (sección 3.2), y el anexo del PRUG también. Es uno de los SIETE únicos taxones que… |
| *Pipistrellus kuhlii* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Pipistrellus pipistrellus* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Psammodromus hispanicus* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Sarcocapnos enneaphylla subsp. saetabensis* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Tyto alba* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Vipera latastei* | `inclusion` | 4 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Alytes obstetricans* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Arctostaphylos uva-ursi* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Burhinus oedicnemus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Caprimulgus ruficollis* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Cecropis daurica* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + anexo_normativo · en la selección aprobada era «excluida» |
| *Cnephaeus isabellinus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Coronella girondica* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Crocidura russula* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Curruca hortensis* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Dictamnus hispanicus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Epidalea calamita* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Erodium saxatile* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Falco subbuteo* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Hemidactylus turcicus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Macroprotodon brevis* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Malpolon monspessulanus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Natrix maura* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Oenanthe oenanthe* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Otus scops* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Passer montanus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Pelodytes punctatus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Pistacia terebinthus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Plecotus austriacus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Regulus regulus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Rhinolophus ferrumequinum* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Suncus etruscus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Tachymarptis melba* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Tamarix canariensis* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Tarentola mauritanica* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Timon lepidus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Turdus torquatus* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Ulmus minor* | `inclusion` | 3 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Anthus campestris* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Calandrella brachydactyla* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Celtis australis* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Cercotrichas galactotes* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Circaetus gallicus* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Circus cyaneus* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «no-candidata» |
| *Cisticola juncidis* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Clamator glandarius* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Delichon urbicum* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Eliomys quercinus* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Erica multiflora* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Erinaceus europaeus* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Felis silvestris* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Ficedula hypoleuca* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Genetta genetta* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Helianthemum cinereum* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Hippolais polyglotta* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Hormathophylla spinosa* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Jurinea pinnata* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Luscinia megarhynchos* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Macrochloa tenacissima* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo · en la selección aprobada era «excluida» |
| *Martes foina* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Melanocorypha calandra* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Meles meles* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Merops apiaster* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Muscicapa striata* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Mustela nivalis* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Myotis blythii* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «no-candidata» |
| *Myotis capaccinii* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «no-candidata» |
| *Myotis myotis* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «no-candidata» |
| *Natrix natrix* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Odontites viscosus subsp. australis* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia caracteristica + protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-can… |
| *Oenanthe hispanica* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Olea europaea var. sylvestris* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Osyris lanceolata* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Pelobates cultripes* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Pelophylax perezi* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Pernis apivorus* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Phoenicurus phoenicurus* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Phylloscopus bonelli* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Pipistrellus pygmaeus* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Podarcis hispanicus* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Populus nigra var. nigra* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Prunella collaris* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Prunella modularis* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Rhamnus hispanorum* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Rhamnus pumila* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Rhinolophus euryale* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «no-candidata» |
| *Rhinolophus hipposideros* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «no-candidata» |
| *Scolopax rusticola* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «excluida» |
| *Seseli montanum subsp. granatense* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Sisymbrium fugax* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Sylvia sarda* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Teucrium carolipaui* | `inclusion` | 2 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Teucrium libanitis* | `inclusion` | 2 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Thymus vulgaris* | `inclusion` | 2 | parcial | — | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Withania frutescens* | `inclusion` | 2 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Achillea millefolium* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Acrocephalus arundinaceus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Aegithalos caudatus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Alauda arvensis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Alcedo atthis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Alytes dickhilleni* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Amelanchier ovalis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Anas platyrhynchos* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Anthyllis lagascana* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Apus apus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Aquila fasciata* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Arenaria aggregata* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Arenaria montana subsp. intricata* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Arenaria suffruticosa* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Aristida coerulescens* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Aristolochia pistolochia* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Armeria bourgaei subsp. willkommiana* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Arrhenatherum elatius subsp. sardoum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Asio otus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Asplenium fontanum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Asplenium onopteris* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Asplenium trichomanes* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Aster sedifolius* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Astragalus bourgaeanus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Atadinus pumilus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Atractylis humilis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Bufo bufo* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Bupleurum fruticescens* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Buxus sempervirens* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Campanula rotundifolia* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + caracteristica · en la selección aprobada era «no-candidata» |
| *Campanula rotundifolia subsp. hispanica* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Caprimulgus europaeus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Caroxylon genistoides* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo · en la selección aprobada era «aprobada» |
| *Caroxylon vermiculatum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «excluida» |
| *Centaurea boissieri subsp. mariolensis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia caracteristica + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Cephalanthera rubra* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Ceratonia siliqua* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Ceropegia munbyana* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo · en la selección aprobada era «aprobada» |
| *Cettia cetti* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Chaenorhinum rupestre* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Chalcides bedriagai* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Chamaerops humilis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Cheirolophus intybaceus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Chroicocephalus genei* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «excluida» |
| *Chroicocephalus ridibundus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «excluida» |
| *Chrysojasminum fruticans* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Circus aeruginosus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Columba oenas* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Colutea atlantica* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Colutea brevialata* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Colutea hispanica* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Coracias garrulus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Cuculus canorus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Curruca communis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Curruca melanocephala* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + anexo_normativo · en la selección aprobada era «excluida» |
| *Dactylorhiza elata* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Dendrocopos major* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Emberiza cirlus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Emberiza citrinella* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Emberiza schoeniclus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Ephedra fragilis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Ephedra nebrodensis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Erica arborea* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Erinacea anthyllis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Euphorbia squamigera* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Falco columbarius* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Falco peregrinus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Fraxinus angustifolia* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Fritillaria lusitanica* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Fumana ericoides* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Fumana fontanesii* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Fumana thymifolia* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Galerida cristata* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Genista valentina* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Geum sylvaticum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Guiraoa arvensis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Gymnosporia senegalensis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + caracteristica + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «e… |
| *Halocnemum strobilaceum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Helianthemum apenninum subsp. cavanillesianum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Helianthemum cinereum subsp. hieronymi* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Helianthemum cinereum subsp. rotundifolium* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Herniaria fruticosa* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Hieraaetus pennatus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Hieracium loscosianum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Himantoglossum hircinum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Himantoglossum robertianum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Hirundo rustica* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Iberis carnosa subsp. hegelmaieri* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Jasione foliosa* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Juniperus communis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Juniperus phoenicea* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Jynx torquilla* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Kickxia spuria subsp. integrifolia* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Koeleria vallesiana* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Lanius senator* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Lepus granatensis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Limbarda crithmoides* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo · en la selección aprobada era «excluida» |
| *Limonium eugeniae* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Limonium ovalifolium* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Linaria cannabina* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo · en la selección aprobada era «excluida» |
| *Linaria cavanillesii* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Lonicera etrusca* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Luscinia svecica* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «excluida» |
| *Lysimachia arvensis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo · en la selección aprobada era «excluida» |
| *Lysimachia tenella* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Macroprotodon cucullatus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Malva multiflora* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo · en la selección aprobada era «excluida» |
| *Medicago secundiflora* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Micromeria fruticosa* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Milvus migrans* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Motacilla flava* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «no-candidata» |
| *Mustela putorius* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Myotis emarginatus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Narcissus dubius* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Nerium oleander* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Neslia paniculata subsp. thracica* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Nyctalus lasiopterus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Oenanthe leucura* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Oeosporangium pteridioides* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Oloptum miliaceum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «excluida» |
| *Ononis aragonensis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Ophioglossum vulgatum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Ophrys sphegodes* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Oriolus oriolus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Oryctolagus cuniculus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Osyris alba* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Osyris quadripartita* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Otanthus maritimus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «excluida» |
| *Parietaria judaica* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Periploca angustifolia* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Petrosedum sediforme* | `inclusion` | 1 | hecho | — | criba en vivo: nivel 1, evidencia observada_gbif + caracteristica + anexo_normativo · en la selección aprobada era «aprobada» |
| *Phillyrea angustifolia* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Phillyrea latifolia* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Phlomis purpurea* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada del 2026-08-16 era «no-candidata» |
| *Phylloscopus collybita* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Phylloscopus trochilus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Picus sharpei* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + anexo_normativo · en la selección aprobada era «excluida» |
| *Pipistrellus nathusii* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Pleurodeles waltl* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Populus alba* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Porphyrio porphyrio porphyrio* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia lista_oficial_sitio · en la selección aprobada era «aprobada» |
| *Potentilla caulescens* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Poterium ancistroides* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Poterium rupicolum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo · en la selección aprobada era «aprobada» |
| *Psammodromus algirus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Quercus suber* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Rana temporaria* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Rhamnus lycioides* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Ruscus aculeatus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Salvia argentea* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Santolina viscosa* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Saxicola rubicola* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + protegida + anexo_normativo · en la selección aprobada era «aprobada» |
| *Saxifraga corsica subsp. cossoniana* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Saxifraga latepetiolata* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Schenkia spicata* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + anexo_normativo · en la selección aprobada era «excluida» |
| *Scilla autumnalis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Senecio auricula subsp. auricula* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Sideritis tragoriganum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Sitta europaea* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Streptopelia turtur* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Strix aluco* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Sus scrofa* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Sylvia borin* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Tadarida teniotis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Tamarix boveana* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Tamarix gallica* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo + lista_oficial_sitio · en la selección aprobada era «excluida» |
| *Teucrium capitatum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Teucrium capitatum subsp. gracillimum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Teucrium carthaginense* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Teucrium franchetianum* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Teucrium pseudochamaepitys* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Teucrium rivasii* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Thymus funkii* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Thymus orospedanus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Thymus serpylloides* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia observada_gbif + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Thymus serpylloides subsp. gadorensis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + lista_oficial_sitio · en la selección aprobada era «no-candidata» |
| *Thymus zygis subsp. gracilis* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Turdus iliacus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Turdus pilaris* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Umbilicus rupestris* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |
| *Valeriana tuberosa* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 2, evidencia observada_gbif + protegida · en la selección aprobada era «no-candidata» |
| *Viburnum tinus* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia protegida + anexo_normativo · en la selección aprobada era «no-candidata» |
| *Vulpes vulpes* | `inclusion` | 1 | pendiente | — | criba en vivo: nivel 1, evidencia anexo_normativo · en la selección aprobada era «no-candidata» |

## Cola 5 · BAJAS de ficha

**3 corrección(es)** · 2 pendiente(s). `data/exclusiones-especies.json` + `npm run especies:exclusiones -- --write --sql auto`. El borrado va aparte porque el UPSERT no retira nada.

| taxón | campo | espacios | estado | lo que la auditoría vio | lo que dice la fuente |
|---|---|---|---|---|---|
| *Olea europaea subsp. europaea* | `inclusion` | 7 | pendiente | publicada y visible (eidosTaxonId null, gbifSpeciesKey 5415040) | criba en vivo: excluida, «solo GBIF». El taxón tampoco es homogéneo en el catálogo: taxonid null en cinco espacios y 6644 —que es la ESPECI… |
| *Mus musculus* | `inclusion` | 1 | pendiente | publicada y **visible** | criba en vivo: excluida, «solo GBIF: ninguna fuente documental la respalda». El inventario de fauna del PRUG enumera 14 mamíferos y no está… |
| *Posidonia oceanica* | `inclusion` | 1 | hecho | publicada y **visible**, tramo 2/2, 7 ocurrencias, `habitatIds` vacío | `data/exclusiones-especies.json`: excluida de ESTE espacio por decisión del 2026-08-29, con el motivo escrito («fanerógama MARINA… este esp… |

## Cola 6 · DECISIONES, no trabajo

**83 corrección(es)** · 74 pendiente(s). Nadie las puede ejecutar sin el boletín delante. No se tocan hasta que se decidan, y se decide **una vez para todos los espacios**.

| taxón | campo | espacios | estado | lo que la auditoría vio | lo que dice la fuente |
|---|---|---|---|---|---|
| *Saxicola rubicola* | `iucn_global` | 13 | pendiente | LC (Preocupación menor) | EIDOS no trae fila del ámbito Mundial para este taxón |
| *Pyrrhocorax pyrrhocorax* | `iucn_spain` | 10 | pendiente | NT — Casi amenazada (Lista Roja española, 2004) | EIDOS: no devuelve fila del ámbito España para este taxón |
| *Burhinus oedicnemus* | `spain_status` | 8 | pendiente | «LESRPE; Directiva Aves 2009/147/CE, Anexo I» · tramo 2 | EIDOS v_estadolegal, taxonid 11887, ámbito Nacional sin CCAA: solo «Anexo IV» de la Ley 42/2007. Ninguna fila del LESRPE (Real Decreto 139/… |
| *Lygeum spartum* | `iucn_global` | 8 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Asparagus horridus* | `iucn_global` | 6 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Halocnemum strobilaceum* | `iucn_global` | 6 | pendiente | LC (amplia distribución circunmediterránea y saharo-arábiga) | No evaluada en la Lista Roja mundial de la UICN |
| *Atriplex glauca* | `iucn_global` | 5 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Hyparrhenia hirta* | `inclusion` | 5 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Eryngium ilicifolium* | `gbif_species_key` | 4 | pendiente | 3630524 | GBIF: la key 3630524 («Eryngium ilicifolium Lam.») es DOUBTFUL en el backbone y GBIF no ofrece un aceptado |
| *Lapiedra martinezii* | `inclusion` | 3 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Lathyrus clymenum* | `inclusion` | 3 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Lavandula multifida* | `inclusion` | 3 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Lygeum spartum* | `inclusion` | 3 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Ammochloa palaestina* | `image` | 2 | tocado | sin foto | auditoría de fotos: 93 fichas · 74 en Commons · 18 fuera de Commons · 1 sin foto. 0 archivos inexistentes y 0 licencias que no coincidan co… |
| *Atriplex glauca* | `inclusion` | 2 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Centaurea seridis* | `inclusion` | 2 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Genetta genetta* | `spain_status` | 2 | no comparable | LESRPE (Listado de Especies Silvestres en Régimen de Protección Espec… | EIDOS v_estadolegal, ámbito Nacional: ninguna fila del LESRPE. Tramo EIDOS: 1 |
| *Helictotrichon filifolium* | `inclusion` | 2 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Olea europaea subsp. europaea* | `iucn_global` | 2 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Pancratium maritimum* | `iucn_global` | 2 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Polygala rupestris* | `inclusion` | 2 | pendiente | publicada, visible=false (sin descripción) | Criba en vivo: nivel 3, «solo GBIF» → excluida. La aprobada del 2026-08-17 la tenía en nivel 2 (observada_gbif + caracteristica). El texto … |
| *Sarcocornia fruticosa* | `scientific_name` | 2 | pendiente | Sarcocornia fruticosa (taxonid 33125, key 3083613), taxonomy.genus «S… | EIDOS: sinónimo; acepta «*Salicornia lagascae* (Fuente, Rufo & Sánchez Mata) Piirainen & G. Kadereit» (taxonid 33125, género *Salicornia*).… |
| *Sideritis bourgaeana* | `image` | 2 | tocado | visible y sin foto | auditoría de fotos: 303 fichas · 272 en Commons · 10 fuera de Commons · **21 sin foto**, de las que solo 3 son visibles: ésta, *Artemisia h… |
| *Teucrium carolipaui* | `inclusion` | 2 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Thymus vulgaris* | `inclusion` | 2 | parcial | — | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Withania frutescens* | `inclusion` | 2 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Andryala integrifolia* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Artemisia barrelieri* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Artemisia gallica* | `scientific_name` | 1 | pendiente | Artemisia gallica · eidosTaxonId 9914 | EIDOS la da por sinónimo y acepta «Artemisia caerulescens subsp. gallica», de rango SUBESPECIE |
| *Asphodelus albus* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Asphodelus macrocarpus* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Astragalus sesameus* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Bucanetes githagineus* | `iucn_global` | 1 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Bufo bufo* | `eidos_taxonid` | 1 | no comparable | Bufo bufo · 93827 | EIDOS: 93827 = «Bufo bufo bufo Linnaeus, 1758» [Subspecies]. El binomio «Bufo bufo» es Sinónimo del taxonid 16219 = «Bufo spinosus Daudin, … |
| *Burhinus oedicnemus* | `regional_status` | 1 | pendiente | Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Mur… | EIDOS v_estadolegal, ámbito Región de Murcia: ninguna fila para este taxón. Tramo EIDOS 1, tramo de la ficha 3 |
| *Campanula erinus* | `inclusion` | 1 | pendiente | publicada | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Capparis zoharyi* | `scientific_name` | 1 | pendiente | Capparis zoharyi · eidosTaxonId 3033 | EIDOS la da por sinónimo y acepta «Capparis spinosa L. subsp. spinosa», de rango SUBESPECIE |
| *Caralluma europaea* | `gbif_species_key` | 1 | no comparable | 3578145 · gbifOccurrences 0 · 0 hábitats | GBIF backbone: 3578145 es SYNONYM (heterotípico, según GBIF) de «Ceropegia europaea (Guss.) Bruyns», key 9245056. El barrido en vivo del 20… |
| *Caralluma europaea* | `scientific_name` | 1 | pendiente | Caralluma europaea | EIDOS acepta «Apteranthes europaea»; GBIF acepta «Ceropegia europaea». Ninguna de las dos autoridades da por aceptado el nombre de la ficha |
| *Centaurea ornata* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Centaurium quadrifolium* | `inclusion` | 1 | pendiente | publicada | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Chaenorhinum origanifolium* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Cosentinia vellea* | `inclusion` | 1 | pendiente | publicada | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Cutandia maritima* | `iucn_global` | 1 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Cytinus hypocistis* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Cytisus intermedius* | `iucn_global` | 1 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Epidalea calamita* | `regional_status` | 1 | pendiente | Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Mur… | EIDOS v_estadolegal, ámbito Región de Murcia: ninguna fila para este taxón. Tramo EIDOS 1, tramo de la ficha 3 |
| *Eryngium ilicifolium* | `inclusion` | 1 | pendiente | publicada | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Festuca capillifolia* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Filago fuscescens* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Filago fuscescens* | `image` | 1 | tocado | sin foto (ficha oculta) | auditoría de fotos: 204 fichas · 192 en Commons · 11 fuera de Commons · 1 sin foto. 0 archivos inexistentes y 0 licencias mal citadas |
| *Filago mareotica* | `inclusion` | 1 | pendiente | publicada | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Galerida theklae* | `regional_status` | 1 | pendiente | Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Mur… | EIDOS v_estadolegal, ámbito Región de Murcia: ninguna fila para este taxón. Tramo EIDOS 1, tramo de la ficha 3 |
| *Galium murale* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Genetta genetta* | `regional_status` | 1 | pendiente | Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Mur… | EIDOS v_estadolegal, ámbito Región de Murcia: ninguna fila para este taxón. Tramo EIDOS 1, tramo de la ficha 3 |
| *Genista longipes* | `gbif_species_key` | 1 | pendiente | 5347560 | GBIF la marca DOUBTFUL y no ofrece un aceptado |
| *Geranium lucidum* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Haplophyllum linifolium* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Hydrobates pelagicus* | `iucn_global` | 1 | pendiente | VU — Vulnerable (Lista Roja mundial de la UICN, 1992) | No evaluada en la Lista Roja mundial de la UICN |
| *Limonium lobatum* | `inclusion` | 1 | pendiente | publicada | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Malpolon monspessulanus* | `spain_status` | 1 | no comparable | LESRPE (Listado de Especies Silvestres en Régimen de Protección Espec… | EIDOS v_estadolegal, ámbito Nacional: ninguna fila del LESRPE. Tramo EIDOS: 1 |
| *Martes foina* | `regional_status` | 1 | pendiente | Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Mur… | EIDOS v_estadolegal, ámbito Región de Murcia: ninguna fila para este taxón. Tramo EIDOS 1, tramo de la ficha 3 |
| *Medicago marina* | `iucn_global` | 1 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Oenanthe leucura* | `regional_status` | 1 | pendiente | Catálogo Regional de Especies Amenazadas de la Fauna Silvestre de Mur… | EIDOS v_estadolegal, ámbito Región de Murcia: ninguna fila para este taxón. Tramo EIDOS 1, tramo de la ficha 3 |
| *Ononis ornithopodioides* | `inclusion` | 1 | pendiente | publicada | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Ononis sicula* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Orobanche cernua* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Ovis aries* | `inclusion` | 1 | pendiente | publicada y OCULTA | Es la oveja doméstica. Su respaldo es GBIF y ninguna fuente documental la afirma como fauna del espacio |
| *Phonus arborescens* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Plantago amplexicaulis* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Polypodium cambricum* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Pseudopodospermum hispanicum* | `image` | 1 | tocado | visible y sin foto | auditoría de fotos: 105 fichas · 101 en Commons · 2 fuera de Commons · 2 sin foto (la otra está oculta). 0 archivos inexistentes, 0 licenci… |
| *Quercus coccifera* | `regional_status` | 1 | tocado | Catálogo Regional de Flora Silvestre Protegida de Murcia (Decreto 50/… | EIDOS v_estadolegal, ámbito Región de Murcia: ninguna fila para este taxón. Tramo EIDOS 1, tramo de la ficha 3 |
| *Ranunculus bullatus* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Scirpoides holoschoenus* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Scorpiurus muricatus* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Sedum acre* | `iucn_global` | 1 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Sideritis hirsuta* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Sonchus tenerrimus* | `inclusion` | 1 | pendiente | publicada | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Sporobolus pungens* | `iucn_global` | 1 | pendiente | LC | No evaluada en la Lista Roja mundial de la UICN |
| *Suaeda spicata* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |
| *Trifolium scabrum* | `inclusion` | 1 | pendiente | publicada, oculta | criba en vivo: nivel 3, «solo GBIF» → excluida. La selección aprobada del 2026-08-28 la tenía en nivel 2 con evidencia observada_gbif + car… |
| *Tripidium ravennae* | `inclusion` | 1 | pendiente | publicada y visible | criba en vivo: nivel 3, «solo GBIF». La selección aprobada la tenía con evidencia del Atlas (observada_gbif + caracteristica) |

## Resueltos por la retirada del campo

**21 corrección(es)** · 0 pendiente(s). `conservation_status` se retiró del catálogo, de la API, del panel y del esquema el 2026-09-14. No hay nada que corregir.

| taxón | campo | espacios | estado | lo que la auditoría vio | lo que dice la fuente |
|---|---|---|---|---|---|
| *Allium subvillosum* | `conservation_status` | 1 | resuelto | En Peligro de Extinción | la propia ficha: spainStatus = «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)»; regionalStatus = «No incluida e… |
| *Anthyllis cytisoides* | `conservation_status` | 1 | resuelto | Protegida (LESRPE) | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE»; regionalStatus = «No in… |
| *Arthrocaulon macrostachyum* | `conservation_status` | 1 | resuelto | Sensible a la alteración de su hábitat | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE»; regionalStatus = «No in… |
| *Atriplex glauca* | `conservation_status` | 1 | resuelto | Protegida (LESRPE) | la propia ficha: spainStatus = «No incluida en el LESRPE; característica de matorrales halonitrófilos (HIC 1430)»; regionalStatus = «No inc… |
| *Atriplex halimus* | `conservation_status` | 1 | resuelto | Protegida (LESRPE) | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE»; regionalStatus = «No in… |
| *Ceratonia siliqua* | `conservation_status` | 1 | resuelto | Protegida (LESRPE) | la propia ficha: spainStatus = «ANEXO I. 2) Lista de taxones forestales para conservación ex situ (Real Decreto 159/2022, »; regionalStatus… |
| *Crucianella maritima* | `conservation_status` | 1 | resuelto | Sensible a la alteración de su hábitat | la propia ficha: spainStatus = «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)»; regionalStatus = «No incluida e… |
| *Ephedra fragilis* | `conservation_status` | 1 | resuelto | Protegida (LESRPE) | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE»; regionalStatus = «No in… |
| *Frankenia pulverulenta* | `conservation_status` | 1 | resuelto | Vulnerable | la propia ficha: spainStatus = «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)»; regionalStatus = «No incluida e… |
| *Genista umbellata* | `conservation_status` | 1 | resuelto | Casi amenazada | la propia ficha: spainStatus = «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)»; regionalStatus = «No incluida e… |
| *Hydrobates pelagicus* | `conservation_status` | 1 | resuelto | Anexo I | la propia ficha: spainStatus = «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)»; regionalStatus = «No incluida e… |
| *Larus fuscus* | `conservation_status` | 1 | resuelto | Anexo II | la propia ficha: spainStatus = «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)»; regionalStatus = «No incluida e… |
| *Larus michahellis* | `conservation_status` | 1 | resuelto | Anexo III | la propia ficha: spainStatus = «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)»; regionalStatus = «No incluida e… |
| *Launaea arborescens* | `conservation_status` | 1 | resuelto | En Peligro de Extinción | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE»; regionalStatus = «No in… |
| *Limonium lobatum* | `conservation_status` | 1 | resuelto | En Peligro de Extinción | la propia ficha: spainStatus = «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)»; regionalStatus = «No incluida e… |
| *Macrochloa tenacissima* | `conservation_status` | 1 | resuelto | Vulnerable | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE»; regionalStatus = «No in… |
| *Rosmarinus officinalis* | `conservation_status` | 1 | resuelto | Protegida (LESRPE) | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE»; regionalStatus = «No in… |
| *Silene ramosissima* | `conservation_status` | 1 | resuelto | En Peligro de Extinción | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE»; regionalStatus = «No in… |
| *Suaeda maritima* | `conservation_status` | 1 | resuelto | Sensible a la alteración de su hábitat | la propia ficha: spainStatus = «Sin figura de protección de ámbito estatal (LESRPE/CEEA) en EIDOS (IEPNB)»; regionalStatus = «No incluida e… |
| *Suaeda vera* | `conservation_status` | 1 | resuelto | Sensible a la alteración de su hábitat | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE»; regionalStatus = «No in… |
| *Withania frutescens* | `conservation_status` | 1 | resuelto | Protegida (LESRPE) | la propia ficha: spainStatus = «No incluida en la Lista Roja de la Flora Vascular Española (2008) ni en el LESRPE; element»; regionalStatus… |

## Hallazgos que hablan del ESPACIO, no de una especie

**55**, y no se pueden deduplicar por taxón ni comprobar contra un campo: son medidas
del espacio entero («64 enlaces para 183 fichas», «106 de las 354 fichas están ocultas»). Se leen en el
informe de su espacio; aquí van enumerados para que no desaparezcan del recuento.

| espacio | campo | qué dice |
|---|---|---|
| barrancos-de-gebas | `inclusion` | 86 fichas, **86 aprobadas hoy**, 86 en la selección versionada. Cero huecos, cero sobrantes |
| barrancos-de-gebas | `species_habitats` | **30 enlaces para 86 fichas**. De los 26 medibles, **19 se sostienen sobre un solo registro (73 %)** — la peor proporción del catálogo. **71 fichas n… |
| barrancos-de-gebas | `spain_status` | *Burhinus oedicnemus* «LESRPE; Directiva Aves, Anexo I» · *Malpolon monspessulanus* «LESRPE» — las dos con tramo 2 |
| barrancos-de-gebas | `iucn_global` | *Curruca undata* «LC» · *Lanius senator* «LC (SPEC, en declive en Europa)» |
| calblanque-monte-cenizas-pena-aguila | `inclusion` | no fichadas: Chroicocephalus ridibundus, Chroicocephalus genei, Luscinia svecica, Curruca conspicillata, Curruca cantillans y Scilla autumnalis |
| calblanque-monte-cenizas-pena-aguila | `inclusion` | la criba anuncia 8 faltas de alta; dos NO lo son |
| calblanque-monte-cenizas-pena-aguila | `species_habitats` | 425 enlaces medibles: 214 se sostienen sobre UN solo registro de GBIF (50 %), 95 sobre dos |
| cuatro-calas | `species_habitats.evidence` | 263 de los 275 enlaces con `evidence` NULL en Railway (los 12 restantes, «caracteristica», del índice del Atlas) |
| cuatro-calas | `inclusion` | 93 fichas publicadas, las 93 visibles |
| cuatro-calas | `gbif_occurrences` | Larus michahellis 331 · Chroicocephalus ridibundus 144 · Thalasseus sandvicensis 81 · Morus bassanus 48 · Alca torda 36 · Larus fuscus 11 · Puffinus … |
| humedal-del-ajauque-y-rambla-salada | `inclusion` | la criba los excluye con «nivel 1 sin resolver en EIDOS» en seis espacios: **La Pila 17, Ajauque 11, Calblanque 2, El Carche 1, San Pedro 1, Cañavero… |
| humedal-del-ajauque-y-rambla-salada | `spain_status` | *Burhinus oedicnemus*, *Genetta genetta* y *Malpolon monspessulanus*: las tres afirman el LESRPE, las tres con tramo 2 |
| humedal-del-ajauque-y-rambla-salada | `eidos_taxonid` | *Phalacrocorax carbo* → 10965 (subsp. *sinensis*) · *Motacilla cinerea* → 10897 (subsp. ***canariensis***) · *Calandrella rufescens* → 12119 (subsp. … |
| humedal-del-ajauque-y-rambla-salada | `scientific_name` | *Sarcocornia fruticosa* y *Anabasis hispanica* |
| humedal-del-ajauque-y-rambla-salada | `species_habitats` | **64 enlaces para 183 fichas**. De los 46 medibles, **33 se sostienen sobre un solo registro (72 %)** — la peor proporción del catálogo |
| monte-arabi | `inclusion` | no fichadas, teniendo respaldo del anexo del propio Monumento Natural. **70 de las 102 llevan figura legal** |
| monte-arabi | `species_habitats` | **24 enlaces para 68 fichas** y solo **2 hábitats** cartografiados (5330 y 8210). **46 fichas no cuelgan de ningún hábitat** |
| monte-arabi | `inclusion` | 4 de las 68 publicadas, **las cuatro visibles** |
| salinas-arenales-san-pedro-pinatar | `inclusion` | no fichadas, teniendo respaldo del anexo normativo del propio espacio |
| salinas-arenales-san-pedro-pinatar | `eidos_taxonid` | *Turdus merula* → 11725 (subsp. *cabrerae*, **canaria**) · *Motacilla cinerea* → 10897 (subsp. *canariensis*) · *Asio otus* → 11920 (subsp. *canarien… |
| salinas-arenales-san-pedro-pinatar | `eidos_taxonid` | *Ifloga spicata* (384), *Aetheorhiza bulbosa* (24468), *Dorycnium pentaphyllum* (79836), *Linum strictum* (495), *Paronychia capitata* (6763), *Polyp… |
| salinas-arenales-san-pedro-pinatar | `scientific_name` | *Sarcocornia fruticosa*, *Ruppia cirrhosa*, *Ammophila arenaria* subsp. *arundinacea*, *Centaurium erythraea* subsp. *majus*, *Dactylis glomerata* su… |
| salinas-arenales-san-pedro-pinatar | `gbif_species_key` | *Sarcocornia fruticosa* → 3083613 · *Elymus farctus* → 5289901 |
| salinas-arenales-san-pedro-pinatar | `visible` | **106 de las 354 fichas están ocultas** (30 %), las 106 con el mismo motivo declarado: «sin descripción: ninguna fuente publica texto para este taxón… |
| salinas-arenales-san-pedro-pinatar | `species_habitats` | 451 enlaces medibles: 210 se sostienen sobre UN solo registro de GBIF (47 %) |
| sierra-de-el-carche | `inclusion` | no fichadas, teniendo respaldo del anexo normativo del propio espacio. **45 de las 66 llevan además figura legal** |
| sierra-de-el-carche | `inclusion` | la criba anuncia 79 faltas de alta; **13 no lo son** |
| sierra-de-el-carche | `species_habitats` | 1.066 enlaces medibles: **700 se sostienen sobre UN solo registro de GBIF (66 %)** |
| sierra-de-el-carche | `eidos_taxonid` | *Armeria filicaulis* (995), *Alyssum montanum* (80821), *Capra pyrenaica* (24419), *Festuca indigesta* (288), *Iberis carnosa* (5335), *Teucrium homo… |
| sierra-de-el-carche | `spain_status` | *Capra pyrenaica* «UICN España: EN (En peligro) (1992)» · *Helianthemum violaceum* «UICN España: EN (2010)» · *Poterium ancistroides* «UICN España: N… |
| sierra-de-el-carche | `iucn_global` | *Curruca undata* «LC» · *Lanius senator* «LC (SPEC, en declive en Europa)» |
| sierra-de-la-pila | `inclusion` | 219 fichas publicadas; la criba de hoy aprueba **140** y deja fuera **79 (36 %)**, de ellas **43 visibles** |
| sierra-de-la-pila | `inclusion` | no fichadas. **45 de las 66 llevan figura legal** y **13 las declara el formulario oficial del sitio** |
| sierra-de-la-pila | `inclusion` | *Curruca cantillans* y *Curruca conspicillata*: no fichadas |
| sierra-de-la-pila | `eidos_taxonid` | *Dactylis glomerata* (213), *Helictochloa bromoides* (80661), *Helianthemum origanifolium* (82960), *Lotus dorycnium* (4138), *Armeria filicaulis* (9… |
| sierra-de-la-pila | `spain_status` | *Genetta genetta* «LESRPE; Directiva Hábitats, Anexo V» · *Malpolon monspessulanus* «LESRPE» — las dos con tramo 2 |
| sierra-de-la-pila | `iucn_global` | *Curruca undata* «LC» · *Lanius senator* «LC (SPEC, en declive en Europa)» |
| sierra-de-la-pila | `species_habitats` | 689 enlaces, 655 medibles: **145 se sostienen sobre un solo registro (22 %)** |
| sierra-de-las-moreras | `inclusion` | el anexo tiene **`exigeConstancia: true`** y funciona —**58 de sus 81 taxones NO entran**—, pero **18 de las 42 entradas del formulario del sitio ent… |
| sierra-de-las-moreras | `taxonomy` | 21 de las 66 fichas —**casi un tercio**— no traen `taxonomy.order` ni `taxonomy.family` |
| sierra-de-salinas | `inclusion` | el respaldo de sitio del espacio son **tres** sitios Red Natura 2000, y **22 de las 25 entradas de su formulario vienen de los dos que apenas lo toca… |
| sierra-de-salinas | `inclusion` | no fichadas, teniendo respaldo del anexo. **80 de las 104 llevan figura legal** y 13 las declara además el formulario |
| sierra-de-salinas | `inclusion` | 19 de las 105 publicadas no las aprobaría la criba de hoy, **11 de ellas visibles**; **2 caen por pérdida del Atlas** |
| sierra-de-salinas | `iucn_global` | *Alectoris rufa* «LC» · *Curruca undata* «LC» · *Lanius senator* «LC (SPEC, en declive en Europa)» |
| sierra-espuna | `species_habitats.evidence` | los 697 enlaces del espacio están en la BD sin procedencia (evidence a NULL) |
| sierra-espuna | `inclusion` | — |
| sotos-y-bosques-de-ribera-de-canaverosa | `inclusion` | 245 fichas, **238 de ellas de nivel 1** por el anexo normativo |
| sotos-y-bosques-de-ribera-de-canaverosa | `inclusion` | *Tichodroma muraria* (treparriscos), *Prunella collaris* (acentor alpino), *Turdus torquatus* (mirlo capiblanco), *Capra pyrenaica* (cabra montés) y … |
| sotos-y-bosques-de-ribera-de-canaverosa | `species_habitats` | **49 enlaces para 245 fichas** — el menor del catálogo. **209 fichas no cuelgan de ningún hábitat**, y 181 de ellas son visibles |
| sotos-y-bosques-de-ribera-de-canaverosa | `scientific_name` | *Caralluma munbyana* subsp. *hispanica*, *Populus nigra* var. *nigra*, *Pulicaria paludosa*, *Sarcocapnos enneaphylla* subsp. *saetabensis*, *Senecio… |
| sotos-y-bosques-de-ribera-de-canaverosa | `eidos_taxonid` | *Anas strepera* (28187), *Bufo bufo* (93827), *Capra pyrenaica* (24419), *Pulicaria paludosa* (31951), *Phalacrocorax carbo* (10965) |
| sotos-y-bosques-de-ribera-de-canaverosa | `spain_status` | *Genetta genetta* «LESRPE; Directiva Hábitats, Anexo V» · *Malpolon monspessulanus* «LESRPE» — las dos con tramo 2 |
| sotos-y-bosques-de-ribera-de-canaverosa | `iucn_global` | *Tamarix boveana* «LC» · *Alectoris rufa* «LC» · *Curruca undata* «LC» · *Lanius senator* «LC (SPEC, en declive en Europa)» |
| sotos-y-bosques-de-ribera-de-canaverosa | `spain_status` | *Capra pyrenaica* «UICN España: EN (En peligro) (1992)» · *Coturnix coturnix* «UICN España: DD (2004)» |
| sotos-y-bosques-de-ribera-de-canaverosa | `image` | *Allium rouyi*, *Helianthemum guerrae*, *Senecio auricula* subsp. *auricula* y *Ziziphora hispanica*: visibles y sin foto |

---

## Cómo se regenera

```bash
node Tools/catalogo-nacional/auditoria-consolida-hallazgos.js [--hallazgos <dir>] [--pendientes]
```

Sin red y sin base de datos: lee los `<slug>-hallazgos.json` y los dieciséis `park.json`. `--pendientes`
deja fuera lo que ya está tocado o hecho, que es la vista útil cuando se va a trabajar.
