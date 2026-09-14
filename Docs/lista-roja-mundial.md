# Lista Roja mundial: `iucnGlobal` contra EIDOS

_Generado por `npm run especies:listaroja-mundial`. No se edita a mano: se regenera._

Fichas del catálogo universal: 1058
Peticiones nuevas a EIDOS: 0; el resto, de Tools\catalogo-nacional\out\lista-roja-mundial-cache.json
Ya en la nomenclatura de lib/uicn.js: 1032

A · REDACCIÓN — EIDOS confirma la categoría y solo cambia cómo está escrita: 0  → se reescriben
B · CATEGORÍA — EIDOS devuelve OTRA categoría: 6  → se reescriben (--con-categoria)
C · GUARDA    — EIDOS no devuelve fila y la ficha afirma una categoría: 14  → NO se tocan
D · HUECO     — EIDOS no devuelve fila y la ficha ya dice «no evaluada»: 0  → se normaliza la frase
      no se ha podido preguntar por 6 ficha(s)

## B · Desacuerdos de categoría (cambian lo que la ficha afirma)

| Taxón | Dice la ficha | Dice EIDOS |
|---|---|---|
| *Alectoris rufa* | LC | NT — Casi amenazada (Lista Roja mundial de la UICN, 2020) |
| *Chalcides bedriagai* | LC | NT — Casi amenazada (Lista Roja mundial de la UICN, 2009) |
| *Curruca undata* | LC | NT — Casi amenazada (Lista Roja mundial de la UICN, 2022) |
| *Lanius senator* | LC (SPEC, en declive en Europa) | NT — Casi amenazada (Lista Roja mundial de la UICN, 2022) |
| *Phagnalon saxatile* | No evaluada específicamente en la Lista Roja mundial de la UICN (especie común) | LC — Preocupación menor (Lista Roja mundial de la UICN, 2011) |
| *Tamarix boveana* | LC | VU — Vulnerable (Lista Roja mundial de la UICN, 2018) |

## C · La guarda: fichas que afirman una evaluación que EIDOS no devuelve

No se reescriben. El silencio de EIDOS no dice que no, y la Red List de la UICN —que
`PROCEDENCIA-DE-CAMPOS.md:46` admite como fuente de este campo— no se ha consultado.

| Taxón | Dice la ficha |
|---|---|
| *Asparagus horridus* | LC |
| *Atriplex glauca* | LC |
| *Bucanetes githagineus* | LC |
| *Cutandia maritima* | LC |
| *Cytisus intermedius* | LC |
| *Halocnemum strobilaceum* | LC (amplia distribución circunmediterránea y saharo-arábiga) |
| *Hydrobates pelagicus* | VU — Vulnerable (Lista Roja mundial de la UICN, 1992) |
| *Lygeum spartum* | LC |
| *Medicago marina* | LC |
| *Pancratium maritimum* | LC |
| *Pyrrhocorax pyrrhocorax* | LC (Preocupación menor) |
| *Saxicola rubicola* | LC (Preocupación menor) |
| *Sedum acre* | LC |
| *Sporobolus pungens* | LC |

## Sin resolver en EIDOS

| Taxón | Motivo |
|---|---|
| *Anabasis hispanica* | EIDOS lo da por sinónimo de «Anabasis mucronata (Lag.) C. Vic.»: se decide en la deuda nº 36, no aquí |
| *Elymus farctus* | EIDOS lo da por sinónimo de «Thinopyrum junceum (L.) Á. Löve»: se decide en la deuda nº 36, no aquí |
| *Maytenus senegalensis subsp. europaea* | EIDOS lo da por sinónimo de «Gymnosporia senegalensis subsp. europaea (Boiss.) Rivas Goday & Rivas Mart.»: se decide en la deuda nº 36, no aquí |
| *Olea europaea subsp. europaea* | EIDOS no conoce este nombre |
| *Sarcocapnos enneaphylla subsp. saetabensis* | EIDOS lo da por sinónimo de «Sarcocapnos saetabensis Mateo & Figuerola»: se decide en la deuda nº 36, no aquí |
| *Sarcocornia fruticosa* | EIDOS lo da por sinónimo de «Salicornia lagascae (Fuente, Rufo & Sánchez Mata) Piirainen & G. Kadereit»: se decide en la deuda nº 36, no aquí |

## Reparto por categoría, ya con la nomenclatura puesta

  · CR (En peligro crítico): 3
  · EN (En peligro): 6
  · VU (Vulnerable): 15
  · NT (Casi amenazada): 29
  · LC (Preocupación menor): 380
  · DD (Datos insuficientes): 4
  · sin código: 601
