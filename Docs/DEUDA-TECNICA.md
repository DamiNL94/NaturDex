# Deuda técnica, por orden de rentabilidad

Cada una se paga mejor ahora que en el espacio número treinta.

1. **`murcia_status` está atado a Murcia.** Es el bloqueo real del rollout nacional a nivel de campo:
   cada comunidad tiene su propio catálogo de especies amenazadas. Hay que renombrarlo a algo como
   `regional_status` + `regional_norma`, y tocar exactamente: `Database/schema.sql` y una migración,
   `Backend/Lib/park_payload.php:129`, `Backend/Api/admin.php` (3 sentencias),
   `Frontend/Js/render.js:423` (que además tiene la etiqueta «Región de Murcia» escrita a mano),
   `Tools/sync-species-catalog.js` (lista `LOCALES`) y `Tools/catalogo-nacional/fix-estado-conservacion-iepnb.js`.
   Hace falta además una tabla **comunidad → norma** para que el campo no sea texto libre distinto en
   cada espacio. `Tools/eidos-diff.js` ya acepta `--ccaa`.
2. **El pipeline de hábitats no escribe en la BD.** `adopt-habitats.js` toca `Frontend/` y nada más, así
   que un export desde la API borraría sus cambios sin avisar. Mientras siga así, cualquier cambio suyo
   es provisional (ver [orden de operaciones](runbook/ORDEN-DE-OPERACIONES.md) §3).
3. **Claves externas incoherentes** — lo que reporta hoy `npm run taxones:duplicados` (sale con
   código 1 mientras queden):
   - **1 taxón duplicado**: la `gbifSpeciesKey` **3064** está puesta en dos especies distintas de
     Cabo Cope (*Salsola vermiculata* y *Arthrocnemum macrostachyum*) porque **3064 es Amaranthaceae,
     la FAMILIA**. Una clave de familia no identifica nada: cualquier consulta de ocurrencias con ella
     devuelve la familia entera. Mismo caso en *Stipa capensis* (3073 = Poaceae) y *Sedum sediforme*
     (2406 = Crassulaceae). **Estos tres son arreglo mecánico**: basta volver a resolverlos con
     `gbif.matchName()`, que ahora devuelve el rango y permite rechazar lo que no sea específico.
   - **9 identificadores incoherentes** entre espacios: `eidosTaxonId` distinto en `Sedum sediforme`
     y `Olea europaea var. sylvestris`, y `gbifSpeciesKey` distinta en siete casos donde un espacio
     usa la clave del sinónimo y otro la del nombre aceptado. **Estos NO son mecánicos**: exigen
     decidir si el catálogo sigue el nombre aceptado de EIDOS a rajatabla y, en varios, si la cita del
     espacio se refiere de verdad al taxón que GBIF considera aceptado.
   - `eidosTaxonId` duplicados: **0**. El esparto era el único de su clase.
4. **El catálogo universal arrastra los nombres retirados por la revisión nomenclatural.**
   `species:extract` añade pero **nunca borra**, así que renombrar un taxón en los `park.json` deja su
   entrada vieja en `especies-universal.json` para siempre: hoy hay **11 entradas que no corresponden
   a ninguna especie de ningún parque**. No son inertes: una selección aprobada antes del renombrado
   casa con ellas y resucita el duplicado que se acababa de quitar —le pasó a Carrascoy con cuatro
   especies (ESTADO.md §"2026-08-10")—. `build-species-n2.js` ya no se deja engañar, porque resuelve
   el nombre contra lo que usan los `park.json` y no contra el catálogo, pero **el resto del tooling y
   cualquiera que lea el fichero a mano sí**. Lo que falta: que `--extract` sepa retirar una entrada
   huérfana, o al menos que la liste como aviso.
5. **`spainStatus` con normas de otras comunidades autónomas.** El campo describe el estado legal *en
   España* y en **60 fichas** cita una norma autonómica ajena —sobre todo la Ley 9/1999 de
   Castilla-La Mancha—: 39 en Sierra Espuña y 21 en Carrascoy, heredadas del catálogo universal. El
   corrector existe (`fix-sierra-espuna-revision.js`, que ya lo resolvió para un subconjunto y **cuya
   primera versión hubo que tirar** por reconstruir el campo entero en vez de podarlo), pero exige el
   **índice de normas del IEPNB, que no está versionado**: hay que volver a descargar la vista y, ya
   puestos, guardarla en `fuentes/` para que la corrección sea repetible sin red.
6. **Tabla de reconciliación taxonómica nacional.** Existe la del piloto
   (`out/cabo-cope-puntas-calnegre-reconciliacion.json`, 124 especies); falta acumular todos los
   espacios sin duplicar por `eidos_taxonid`.
7. **Completar `hic-nombres.json` y `hic-prioritarios.json`** al entrar en cada provincia nueva. No es
   opcional: un código sin ficha se salta el filtro marino (ver [trampas](runbook/TRAMPAS-CONOCIDAS.md)).
8. **Fotos de florasilvestre.es pendientes de licencia** en Cabo Cope: 13 fichas usadas en el contexto
   de este prototipo educativo. Antes de cualquier uso público hay que confirmar el permiso o
   sustituirlas por equivalentes de licencia libre.
9. **Cero POIs en Sierra Espuña y Cuatro Calas.** No hay fuente con coordenadas descargables; el PRUG en
   PDF sigue siendo la vía pendiente. Los senderos sí están resueltos (`build-park-trails.js`), pero son
   trazas, no puntos.
10. **Duplicación consciente**: `AdminPanel/src/api.ts` y el cliente de la API del frontend son dos
   implementaciones del mismo contrato. Se mantienen separadas porque son dos aplicaciones distintas
   (React con build vs. módulos ES sin build).

