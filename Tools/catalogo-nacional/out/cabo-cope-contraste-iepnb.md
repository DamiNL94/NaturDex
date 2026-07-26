# Contraste del catálogo del piloto contra la Lista Patrón del IEPNB

**Fecha:** 2026-07-25 · **Parque:** Cabo Cope y Puntas de Calnegre (`cabo-cope-puntas-calnegre`)
**Fuente:** `v_listapatronespecie_normas` y `v_listapatronespecie` — API PostgREST del IEPNB
(`https://iepnb.gob.es/api/catalogo/`), sin autenticación.
**Método:** las 174 especies de `park.json`; 173 tienen `eidosTaxonId`. Se comprobó primero que
`eidosTaxonId` **es** el `idtaxon` del IEPNB (verificado con 3 taxones). Consulta por lotes de
`idtaxon`, filtrando ámbito España y Región de Murcia.

> Fuente: «© Ministerio para la Transición Ecológica y el Reto Demográfico».

---

## Resumen

| | |
|---|---|
| Especies contrastadas | 173 |
| Con alguna figura legal (España o Murcia) | 87 |
| Sin ninguna figura legal | 83 (74 flora, 9 fauna) |
| `eidosTaxonId` que **no existen** en la Lista Patrón | 3 |

---

## 1. Errores confirmados — infraprotección

Fichas que declaran la especie no protegida cuando **sí está en el LESRPE**
(RD 139/2011). Son los más graves: la app dice al usuario que una especie protegida no lo está.

| Especie | `idtaxon` | Catálogo actual | Oficial IEPNB |
|---|---|---|---|
| Cogujada común (*Galerida cristata*) | 11102 | «No catalogada (especie común)» | **LESRPE** + Directiva Aves + Berna III |
| Curruca cabecinegra (*Curruca melanocephala*) | 80929 | «No catalogada (especie común y estable en España)» | **LESRPE** + Berna II + Bonn II |

La *Curruca* es doblemente llamativa: el README del piloto da por resuelta esa ficha (se corrigió
el género *Sylvia* → *Curruca*), pero el estado de conservación se quedó mal.

## 2. Errores confirmados — protección declarada que no existe

Fichas que atribuyen LESRPE a especies que **no están en el LESRPE**. Tres de ellas son especies
cinegéticas, así que el error es de bulto.

| Especie | `idtaxon` | Catálogo actual | Oficial IEPNB |
|---|---|---|---|
| Garduña (*Martes foina*) | 11289 | «LESRPE» | Sin figura estatal. Solo catálogos de otras CCAA y Berna III |
| Perdiz roja (*Alectoris rufa*) | 12114 | «LESRPE» | Directiva Aves **Anexo II y III** (caza), Berna III. Sin LESRPE |
| Tejón (*Meles meles*) | 11709 | «LESRPE» | Sin figura estatal. **Murcia: interés especial** (Ley 7/1995) |
| Tórtola europea (*Streptopelia turtur*) | 12356 | «Directiva Aves; LESRPE» | Directiva Aves **Anexo II** (caza), CITES A. Sin LESRPE |

## 3. Categoría CEEA omitida

Están bien marcadas como protegidas, pero se pierde la categoría de amenaza, que es justo el dato
que el usuario necesita ver.

| Especie | Catálogo actual | Oficial IEPNB |
|---|---|---|
| Chorlitejo patinegro (*Charadrius alexandrinus*) | «LESRPE» | **CEEA: Vulnerable** + LESRPE + Anexo IV |
| Gaviota de Audouin (*Larus audouinii*) | «Directiva Aves 2009/147/CE» | **CEEA: Vulnerable** + Anexo IV |

## 4. Figura regional no recogida

Aves tratadas solo como «Ave de la ZEPA ES0000261», teniendo figura propia en el Catálogo Regional
de Murcia (Ley 7/1995).

| Especie | Oficial IEPNB (Región de Murcia) |
|---|---|
| Águila real (*Aquila chrysaetos*) | Especies de interés especial |
| Carraca europea (*Coracias garrulus*) | Especies de interés especial |
| Culebrera europea (*Circaetus gallicus*) | Especies de interés especial |
| Gaviota de Audouin (*Larus audouinii*) | **Vulnerable** |

## 5. Identificadores rotos

Tres `eidosTaxonId` **no devuelven ningún registro** en la Lista Patrón. O el ID es incorrecto, o
el taxón cambió de nombre y de identificador. Hasta resolverlo, su estado de conservación no está
respaldado por ninguna fuente verificable.

- Chova piquirroja (*Pyrrhocorax pyrrhocorax*) — `12063`
- Tarabilla europea (*Saxicola torquatus*) — `12325`
- Terrera marismeña (*Calandrella rufescens*) — `12119`

En el último caso hay una pista: el taxón se ha reasignado ampliamente a *Alaudala rufescens*, lo
que explicaría el cambio de identificador. Conviene resolverlos con
`v_listapatronespecie_sinonimos`.

## 6. Matiz que NO es un error: invasoras con doble estatus

Dos culebras figuran a la vez como LESRPE y en el **Catálogo Español de Especies Exóticas
Invasoras** (RD 630/2013):

- Culebra bastarda (*Malpolon monspessulanus*) — `11772`
- Culebra de herradura (*Hemorrhois hippocrepis*) — `11448`

No es contradictorio: están protegidas en su área natural (península) y catalogadas como invasoras
donde fueron introducidas (Baleares). El catálogo del piloto acierta al darlas por protegidas en
Cabo Cope. Merece la pena reflejar el matiz, no «corregirlo».

---

## 7. Segunda pasada — falsos «no evaluada» en la Lista Roja de la UICN

Cruzando el campo **«Código UICN»** de `v_listapatronespecie_codigos` (que es el identificador del
*assessment*) contra `iucnGlobal`: de las 173 especies, **84 tienen assessment** y 90 no. De esas
84, **13 constaban en el catálogo como «NE» o «no evaluada»**. Las 13 son flora.

Categoría leída de <https://www.iucnredlist.org/> el 2026-07-25:

| Especie | Constaba | UICN | Assessment |
|---|---|---|---|
| **Esparto** (*Stipa tenacissima*) | «no evaluada» | **VU (Vulnerable)**, tendencia decreciente | 57471077 |
| **Ajo de flor oscura** (*Allium melananthum*) | «NE» | **NT (Casi amenazado)** | 172167 |
| Salsola (*Salsola papillosa*) | «NE» | LC | 103535407 |
| Baladre (*Nerium oleander*) | «no evaluada» | LC | 202961 |
| Bayón (*Osyris lanceolata*) | «NE» | LC | 200642 |
| Canadillo (*Ephedra fragilis*) | «no evaluada» | LC | 201689 |
| Carrizo real (*Saccharum ravennae*) | «no evaluada» | LC | 175232 |
| Coscoja (*Quercus coccifera*) | «NE» | LC | 194078 |
| Esparraguera blanca (*Asparagus albus*) | «no evaluada» | LC | 176528 |
| Gamoncillo (*Asphodelus fistulosus*) | «no evaluada» | LC | 19002684 |
| Grama de mar (*Elymus farctus*) | «no evaluada» | LC | 21343402 |
| Lastón (*Brachypodium retusum*) | «no evaluada» | LC | 44393494 |
| Palmito (*Chamaerops humilis*) | «NE» | LC | 13164373 |

El caso grave es el **esparto**: es especie estructural del paisaje del parque, figuraba como no
evaluada, y la UICN la clasifica **Vulnerable con tendencia decreciente**.

### Por qué NO se tocó `conservationStatus` en estas 13

En las fichas de flora ese campo refleja el **estado legal** (Decreto 50/2003), no la evaluación de
la UICN — el esparto sigue como «No amenazada» porque legalmente no está protegido. Son dos ejes
distintos y mezclarlos fue justo el origen del problema. Solo se corrigió `iucnGlobal`.

### Nota taxonómica

La UICN publica *Saccharum ravennae* bajo el nombre aceptado **Tripidium ravennae**. No se ha
renombrado la ficha: la clave maestra del proyecto es el `idtaxon` de la Lista Patrón española.

### Lo que queda por revisar en este eje

**74 fichas sin código y declaradas no evaluadas**: coherentes, nada que hacer.

**16 fichas afirman «LC» sin tener código en la pasarela del IEPNB.** No significa que estén mal
—la pasarela solo cubre los taxones a los que el IEPNB ha asignado código, y su cobertura de flora
es parcial— pero hoy ese «LC» no tiene respaldo verificable en ninguna de nuestras fuentes.
Pendientes de comprobar una a una en <https://www.iucnredlist.org/>:

| # | Especie | Nombre científico | Reino |
|---|---|---|---|
| 1 | Azucena de mar | *Pancratium maritimum* | flora |
| 2 | Camachuelo trompetero | *Bucanetes githagineus* | fauna |
| 3 | Acebuche | *Olea europaea* var. *sylvestris* | flora |
| 4 | Albardín | *Lygeum spartum* | flora |
| 5 | Tarabilla europea | *Saxicola rubicola* | fauna |
| 6 | Sosa jabonera | *Halocnemum strobilaceum* | flora |
| 7 | Salado | *Limoniastrum monopetalum* | flora |
| 8 | Grama de mar | *Sporobolus pungens* | flora |
| 9 | Mielga marina | *Medicago marina* | flora |
| 10 | Alhelí de mar | *Malcolmia littorea* | flora |
| 11 | Cutandia marítima | *Cutandia maritima* | flora |
| 12 | Algodonosa | *Achillea maritima* | flora |
| 13 | Aliaga morisca | *Calicotome intermedia* | flora |
| 14 | Orgaza | *Atriplex glauca* | flora |
| 15 | Uña de gato | *Sedum acre* | flora |
| 16 | Esparraguera de gato | *Asparagus horridus* | flora |

Dos de ellas son fauna y merecen prioridad, porque la cobertura de la pasarela para vertebrados es
buena y su ausencia llama la atención: el **camachuelo trompetero** (la ficha apunta a la subespecie
*zedlitzi*, lo que puede explicar que no tenga código propio) y la **tarabilla europea** (recién
renombrada a *Saxicola rubicola*, así que conviene reconfirmar su código tras el cambio).

Cómo comprobarlas: `https://www.iucnredlist.org/search?query=<Género especie>&searchType=species`
en un navegador que ejecute JavaScript. `web_fetch` devuelve la página vacía porque el sitio es una
SPA — comprobado.

---

## 8. Tercera pasada — anexos comunitarios que faltaban

El barrido inicial excluyó el ámbito `UE`, donde viven los anexos de las Directivas Aves y
Hábitats. Repetido sobre las **146 fichas que no citaban ninguna Directiva**: **16 tienen anexo
comunitario** sin recoger.

Se descartó la categoría «Artículo I» de la Directiva Aves (6 fichas): es la cobertura genérica que
ampara a todas las aves silvestres, no una inclusión en anexo.

| Especie | Anexo que faltaba |
|---|---|
| **Tortuga mora** (*Testudo graeca*) | **Directiva Hábitats, Anexos II y IV** + CITES A |
| **Águila perdicera** (*Aquila fasciata*) | Directiva Aves, Anexo I |
| Búho real (*Bubo bubo*) | Directiva Aves, Anexo I + CITES A |
| Halcón peregrino (*Falco peregrinus*) | Directiva Aves, Anexo I + CITES A |
| Gato montés (*Felis silvestris*) | Directiva Hábitats, Anexo IV + CITES A |
| Alcaraván (*Burhinus oedicnemus*) | Directiva Aves, Anexo I |
| Charrancito común (*Sternula albifrons*) | Directiva Aves, Anexo I |
| Cogujada montesina (*Galerida theklae*) | Directiva Aves, Anexo I |
| Collalba negra (*Oenanthe leucura*) | Directiva Aves, Anexo I |
| Curruca rabilarga (*Curruca undata*) | Directiva Aves, Anexo I |
| Terrera común (*Calandrella brachydactyla*) | Directiva Aves, Anexo I |
| Ostrero euroasiático (*Haematopus ostralegus*) | Directiva Aves, Anexo II parte B |
| Mochuelo europeo (*Athene noctua*) | CITES, Anexo A |
| Eslizón ibérico (*Chalcides bedriagai*) | Directiva Hábitats, Anexo IV |
| Sapo corredor (*Epidalea calamita*) | Directiva Hábitats, Anexo IV |
| Gineta (*Genetta genetta*) | Directiva Hábitats, Anexo V |

La omisión de más peso es la **tortuga mora**: el Anexo II de la Directiva Hábitats es el que obliga
a designar Zonas Especiales de Conservación para la especie, así que es un dato con consecuencias
para la gestión del espacio, no un adorno de la ficha.

Los anexos se **añadieron** al texto existente de `spainStatus`; no se sustituyó nada.

---

## Dos avisos de método

**Las 83 especies sin figura legal no son un error.** La mayoría (74) son flora cuyo estado en el
piloto viene de la *Lista Roja de la Flora Vascular Española 2008*, que es una evaluación
científica, **no una norma jurídica**, y por eso no aparece en esta vista. Casos como *Caralluma
europaea* (EN) o *Enneapogon persicus* (CR) siguen siendo válidos: solo hay que dejar claro en la
ficha que la Lista Roja no es figura legal de protección.

**El ámbito UE se excluyó de la consulta principal.** Los anexos de la Directiva Aves y de la
Directiva Hábitats viven bajo ámbito `UE`, no `España`. La verificación de los casos dudosos sí los
incluyó, pero un barrido completo debe consultar los cuatro ámbitos (UE, España, autonómico,
Internacional) para no dar por no protegida a una especie que solo tiene figura comunitaria.

## Cómo reproducirlo

```
node Tools/catalogo-nacional/fuentes/fetch-lista-patron.js --nombre "Galerida cristata"
```

El manifiesto de la API está en `Tools/catalogo-nacional/fuentes/iepnb-api.json`.
