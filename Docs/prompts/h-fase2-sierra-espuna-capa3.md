# Prompt de arranque — FASE 2, Capa 3: catálogo de especies de Sierra Espuña

> Pégalo entero en una sesión nueva de Claude Code abierta en la raíz del repo.
> Preparado el 2026-07-28, al cierre de la sesión que dejó hecha la Capa 2 (hábitats).

---

```
NaturDex · rollout nacional · FASE 2 (catálogo completo N2)
Espacio: Sierra Espuña (slug sierra-espuna, provincia Murcia)

## Contexto obligatorio antes de tocar nada

Lee, en este orden:
  1. Tools/catalogo-nacional/README.md — arquitectura de 3 capas y §4 "Procedimiento por parque".
     El piloto verificado es cabo-cope-puntas-calnegre: úsalo como referencia de formato en cada
     paso (174 especies ya catalogadas ahí).
  2. Docs/rollout/ESTADO.md — ledger completo. Las entradas del 2026-07-27/28 explican de dónde
     sale cada dato de este parque: parámetros confirmados, límite reimportado del IMIDA, Capa 2
     con el Atlas 2005, y el desbloqueo de Salto del Usero (no afecta a este parque, pero es
     contexto de la misma sesión).
  3. Docs/prompts/e-rollout-nacional.md §3 — el procedimiento genérico de Fase 2 del que este
     prompt es la instancia concreta.

## Punto de partida: parámetros ya confirmados, no los redescubras

  - REGION_NN: 30 (Murcia)
  - Huso UTM: 30N (ETRS89 UTM30N / EPSG:25830) — leído del .prj, no asumido
  - SITE_CODES: ES0000173 — un único código, TIPO C (LIC/ZEC y ZEPA a la vez, 100% de solape)
  - Límite: Frontend/Data/parks/murcia/sierra-espuna/geo/parque.geojson — YA es el del IMIDA
    (6.329 vértices, no lo toques ni lo regeneres: build-n1-espacios.js tiene un guardián que
    detecta la marca `CodigoIMIDA` y lo deja intacto)
  - Municipios: Aledo, Alhama de Murcia, Lorca, Mula, Totana
  - Center: [37.86854, -1.54939]

## Lo que YA está hecho — no lo repitas

**Capa 1 (límite) y Capa 2 (hábitats) están cerradas.** park.json tiene:
  - 13 hábitats (3 prioritarios: 6220, 9560, 6110), cobertura real del 91% del parque
  - 0 especies, 0 POIs — es exactamente lo que toca hoy

Los 13 códigos HIC presentes: 8210, 6220★, 9560★, 5330, 4090, 5210, 92D0, 6110★, 9340, 6420, 6170,
9240, 92A0. Cada hábitat trae su `fitosociologia` oficial en el geojson — es tu punto de partida
para el paso 2 (Atlas de Hábitats → especies características).

**Herramientas de Capa 3 ya recuperadas y operativas** (estaban ausentes en `main`, se rescataron
de la rama `catalogo-nacional` en la sesión del 2026-07-27):
  - Tools/catalogo-nacional/atlas-hic-especies.js — ya estaba en main
  - Tools/catalogo-nacional/reconcile-taxa.js — recuperado
  - Tools/eidos-diff.js — recuperado (arregla `npm run eidos:diff`)
  - Tools/gbif-habitats.js — recuperado (arregla `npm run gbif:habitats`)
  - Tools/catalogo-nacional/lib/registry.js — CORREGIDO: ahora resuelve parques "basic" además de
    "available" (antes era imposible ascender una ficha N1, que es justo lo que estás haciendo)

## Ocho cosas que te van a morder si no las sabes

1. **REUTILIZACIÓN PRIMERO, antes que nada.** El catálogo del piloto tiene 174 especies con
   eidos_taxonid ya resuelto (Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json) y su
   tabla de reconciliación en Tools/catalogo-nacional/out/cabo-cope-puntas-calnegre-reconciliacion.json
   (106 EIDOS ok / 17 sinónimo / 1 no encontrado; 124 GBIF ok). Sierra Espuña y Cabo Cope comparten
   comunidad y varios hábitats mediterráneos (matorrales, encinares): cruza primero por
   eidos_taxonid antes de dar de alta ninguna especie nueva. Dime cuántas reutilizas y cuántas son
   nuevas — no reescribas los textos de las que ya existen.

2. **8230 NO va a aparecer.** El Atlas 2005 no registra ese código en toda la provincia de Murcia
   (era un error de codificación de 1997, resuelto de rebote al migrar de fuente). No lo busques ni
   lo eches en falta.

3. **6110, 6220 y 9560 son prioritarios (Anexo I)** — su catálogo de especies necesita más cuidado
   que el resto: son los que justifican la figura de protección.

4. **Las aves NO se asignan a hábitats.** Van a un apartado propio de parque (migratorias/ZEPA),
   contrastadas con la lista oficial de la ZEPA vía Discodata BISE por site_code=ES0000173. En el
   piloto GBIF recuperó ~31/34 de las aves oficiales de su ZEPA — no esperes el 100%.

5. **UICN es fallback, EIDOS es principal.** En el piloto ~54/124 especies no tenían dato UICN en
   EIDOS (sobre todo flora): usa la UICN Red List sólo cuando EIDOS no cubra.

6. **GBIF sin Aves.** El filtrado de Aves es obligatorio: en el piloto eran el 88% de las
   ocurrencias y puro ruido espacial. El filtro por incertidumbre NO sirve (sólo el 14% la declara).

7. **Estado de conservación en TRES escalas**: UICN / España / Región de Murcia. Para la escala
   autonómica usa el Decreto 50/2003 de protección de especies silvestres de la Región de Murcia
   (mismo que en el piloto) — Sierra Espuña es la misma comunidad, mismo decreto.

8. **Node no está en el PATH de cmd.exe en este entorno.** Prefija los comandos con
   `export PATH="/c/Program Files/nodejs:$PATH"` en bash, o usa PowerShell si prefieres.

## Procedimiento (§4 de e-rollout-nacional.md, ya parametrizado)

CAPA 3 · Especies — el orden importa, de más sólido a más ruidoso

  1. Reutilización: cruza contra cabo-cope-puntas-calnegre por eidos_taxonid antes de nada.
  2. Atlas de Hábitats → especies características por HIC:
     node Tools/catalogo-nacional/atlas-hic-especies.js --atlas <atlas.txt> --park sierra-espuna
     (extrae el atlas.txt con: pdftotext -layout -enc UTF-8
     "Docs/Atlas y Manual de los Habitat de Espana.pdf" atlas.txt — el flag -layout es
     IMPRESCINDIBLE, sin él el texto se refluye a dos columnas y mezcla nombres de códigos
     contiguos, como ya pasó en la sesión de Capa 2)
     = evidencia 'caracteristica', backbone determinista y filtro de cordura del resto.
  3. EIDOS (principal) + UICN (fallback) → taxonomía y estado de conservación.
  4. GBIF ∩ polígonos de hábitat, SIN Aves = evidencia 'observada_gbif'.
  5. Aves → apartado de parque (migratorias/ZEPA), contrastadas con Discodata BISE por
     site_code=ES0000173 = evidencia 'zepa'.
  6. Reconciliación taxonómica: node Tools/catalogo-nacional/reconcile-taxa.js --park sierra-espuna
     — amplía la tabla maestra, no la sustituyas.

POIs, fotos y cierre

  7. POIs solo desde fuente documental (PORN/PRUG de Sierra Espuña, red de senderos oficial,
     cartografía del organismo gestor — el geoportal del IMIDA tiene capas de "Planes de Gestión
     Red Natura" y "PORN y PRUG con aprobación definitiva" que ya viste en la sesión de límites).
     Un POI sin fuente no entra.
  8. node Tools/catalogo-nacional/enrich-images.js --mode missing --allow-nc — fotos con
     atribución y licencia. Nada de "todos los derechos reservados".
  9. Actualiza manifest.json (counts, images, audio), cambia status a "available" en
     parks-index.json (hoy es "basic" — el validador YA avisa "la ficha base ya trae contenido,
     ¿toca pasarla a available?"), ejecuta npm run validate hasta verde.
 10. Actualiza Docs/rollout/ESTADO.md y dame el informe de cierre: contadores, cobertura de fotos,
     especies sin hábitat, huecos conocidos y qué habría que contrastar en campo.

## Reglas duras (heredadas del rollout, no negociables)

  - No inventes NADA: ni especies, ni evidencia, ni estado de conservación. Hueco documentado antes
    que dato inventado.
  - No toques geo/parque.geojson ni geo/habitats.geojson salvo que encuentres un error real — ya
    están verificados (0 vértices fuera del límite, cobertura del 91%).
  - Especies MARINAS: no aplica aquí (Sierra Espuña no tiene costa ni hábitats "Marino" en su
    catálogo), pero si en algún cruce apareciera algo con evidencia exclusivamente marina,
    coméntamelo antes de decidir — es la misma regla de producto que ya se aplicó a espacios y
    capas Natura 2000 marinas en el resto de la comunidad.
  - Cada especie con: taxonomía completa, estado en las tres escalas, `source` con la referencia
    concreta y su `evidence`.

Regla que manda sobre todas: ante la duda, hueco documentado antes que dato inventado.
```

---

## Estado al entregar este prompt

| | |
|---|---|
| Capa 1 (límite) | Hecha — IMIDA, 6.329 vértices, 0 fuera del límite |
| Capa 2 (hábitats) | Hecha — 13 hábitats, 91% de cobertura, 3 prioritarios |
| Capa 3 (especies) | **Pendiente** — 0 especies, 0 POIs |
| Herramientas | Las 5 de Capa 3 recuperadas y verificadas |
| Catálogo reutilizable | 174 especies del piloto, con tabla de reconciliación ya generada |

Todo lo geográfico está cerrado y verificado. Lo que falta es exactamente lo que este prompt cubre:
especies, POIs, fotos y el ascenso a `status: "available"`.
