# Aplicar el anexo del Decreto 299/2010 a Cabo Cope y Sierra de las Moreras

> Prompt de sesión. Escrito el 2026-08-28, al terminar de transcribir el plan. Lee entero antes de
> tocar nada: **los dos espacios NO se tratan igual**, y confundirlos borra trabajo en silencio.

## Qué hay hecho ya, y qué falta

El 2026-08-28 se transcribió el **Decreto n.º 299/2010** (Plan de gestión y conservación de la ZEPA
Almenara, Moreras y Cabo Cope): **81 taxones** en `data/anexos-normativos.json`, bajo las entradas de
`cabo-cope-puntas-calnegre` y `sierra-de-las-moreras` — las dos, porque el plan cubre a las dos.

**Ese anexo todavía no ha cambiado ni una ficha.** El respaldo documental solo entra al catálogo
cuando se vuelve a producir la **selección aprobada** del espacio (`species:seleccion`), y eso no se
ha hecho. Esta sesión es hacerlo.

De los 81, hoy Cabo Cope ya ficha 40 y Sierra de las Moreras 26.

## Lo que hay que saber del anexo antes de usarlo

**Lleva `exigeConstancia: true`, y no es una precaución genérica.** El propio plan cifra su ámbito
subunidad a subunidad: Almenara 415 km², Carrasquilla 94, Sierra de las Moreras 16 y **Cabo Cope 1**.
O sea que a Cabo Cope le corresponde **un kilómetro cuadrado de los ~510** que inventaría el
documento. Con ese campo, el anexo deja de ser puerta de entrada del nivel 1 y pasa a exigir que GBIF
corrobore la especie dentro de los polígonos del espacio.

Si en algún momento te tienta quitarlo: eso es exactamente lo que le pasó a los **Barrancos de
Gebas**, que heredaron el inventario de Sierra Espuña y salieron con 183 fichas —el acentor alpino y
el treparriscos en unas cárcavas semiáridas de 200 m— sin un solo aviso.

Hay además **una entrada que el propio plan marca como no confirmada**: *Enneapogon persicus* lleva
escrito «Es posible su existencia en el ámbito de la ZEPA pues existen poblaciones muy próximas». Se
transcribió porque está en la tabla; con `exigeConstancia` activo no entra sin corroboración, que es
lo que corresponde. **No la fuerces.**

## Los dos espacios NO son el mismo caso

| | Sierra de las Moreras | Cabo Cope y Puntas de Calnegre |
|---|---|---|
| Selección versionada en `out/` | **sí** (64 especies, 2026-08-22) | **NO existe** |
| ¿Pasó por `aves:poda`? | **no** (no hay `poda-aves-*.sql` suyo) | **SÍ** (`Database/poda-aves-cabo-cope-puntas-calnegre.sql`) |
| Nivel | N3 | **N2** — le falta la Fase 3 |
| Riesgo de regenerar | bajo | **alto** |

### Sierra de las Moreras — empieza por aquí

Tiene selección y no ha sido podado, así que rehacerla y reescribir sus fichas es el camino normal
del runbook. Es el espacio en el que probar que el anexo hace lo que debe.

### Cabo Cope — el peligroso, y por dos motivos a la vez

1. **Es el piloto y no tiene selección versionada.** Su catálogo de 162 fichas es anterior a que la
   selección fuera un fichero del repositorio. Regenerarlo no es «volver a pasar la herramienta»: es
   producir su selección **por primera vez** y reescribir el catálogo entero desde ella.
2. **Pasó por `aves:poda`.** `build-species-n2.js` reescribe el catálogo desde la selección, y la
   poda no toca la selección: regenerar **le devuelve las aves que la poda le quitó**. Es la trampa
   nº 6 del `CLAUDE.md`, y ya se cobró un susto en Sierra de la Pila (24 aves resucitadas).

Por eso, en Cabo Cope: **`aves:poda` se vuelve a pasar SIEMPRE detrás de la regeneración**, y se
compara el antes y el después ficha a ficha antes de dar nada por bueno.

## Orden de trabajo

```bash
# 0) Punto de partida, para poder comparar después. Guarda estas cifras.
npm run especies:niveles
node -e "const{readJson}=require('./Tools/lib/io');for(const s of ['cabo-cope-puntas-calnegre','sierra-de-las-moreras']){const d=readJson('Frontend/Data/parks/murcia/'+s+'/park.json');console.log(s,(d.species||[]).length,'fichas')}"
```

```bash
# 1) Sierra de las Moreras. El atlas.txt YA está generado en fuentes/ (2026-08-28); hay ademas un
#    atlas-nolayout.txt del otro extractor, y NINGUNO cubre al otro: usa los dos con --fusiona
#    cuando toque regenerar el índice del Atlas.
npm run species:seleccion -- --park sierra-de-las-moreras --atlas Tools/catalogo-nacional/fuentes/atlas.txt --dry
```

Lee el `--dry` **entero** antes de escribir. Lo que hay que mirar:

- Cuántas suben de nivel gracias al anexo (N3 → N1/N2). Es el objetivo de la sesión.
- Que **ninguna** entre por nivel 1 a secas: con `exigeConstancia` no debería, y si pasa es que el
  campo no se está leyendo.
- Las `excluidas_detalle`: ahí está el motivo de cada descarte, y un motivo falso es peor que una
  exclusión.

Después, los dos pasos del runbook (`build-species-universal.js` → `build-species-n2.js`), el
`--podar` si la selección reconcilió algún nombre, y `npm run species:poda`.

```bash
# 2) Cabo Cope, solo cuando Moreras esté cerrado y comprobado.
#    ANTES de nada, guarda la lista de aves actual: es lo que hay que poder comparar.
node -e "const{readJson}=require('./Tools/lib/io');const d=readJson('Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json');console.log((d.species||[]).filter(s=>s.taxonomy&&s.taxonomy.class==='Aves').map(s=>s.scientificName).sort().join('\n'))"
```

… y detrás de la regeneración, **sin excepción**:

```bash
npm run aves:poda -- --park cabo-cope-puntas-calnegre            # --dry primero
```

## De paso, y en el mismo pase: la deuda nº 26

El `atlas.txt` que faltaba **ya está**. Con él, `npm run atlas:puente` puede tender el puente de
nomenclatura completo (recombinaciones tipo *Stipa tenacissima* → *Macrochloa tenacissima*), que son
**+4 fichas** de nivel 3 a nivel 2 —el esparto de Cabo Cope, Carrascoy, Cuatro Calas y Espuña—.

Y **solo puentea recombinaciones**: mismo epíteto, otro género. EIDOS devuelve por la misma vía
cambios de identidad (*Ammophila arenaria* → *Calamagrostis arundinacea*) y aplicarlos colgaría el
HIC de otro taxón. El puente se usa **solo en positivo**: nadie lo desmiente después.

## Al terminar

1. `npm run validate` en verde, `npm run taxones:duplicados` y `npm run ida-y-vuelta` con código 0.
2. `npm run especies:niveles` de nuevo, **con el `atlas.txt`**: sin él la señal `caracteristica` no
   entra y el N3 sale inflado. Compara con las cifras del paso 0 y **di el delta**, que es el
   resultado de la sesión.
3. Regenera el SQL de los espacios tocados (`npm run park:sql -- --park <slug>`) y, si la
   regeneración retiró fichas, el borrado correspondiente: el UPSERT no quita nada.
4. Informe en `Docs/rollout/sesiones/<fecha>.md` y **solo** la fila de la tabla y una línea de índice
   en `Docs/rollout/ESTADO.md`.

## Contexto que ahorra media sesión

- **La base de datos está desactualizada** respecto al repositorio: hay una cola de SQL sin aplicar
  desde el 2026-08-27 (`migrations.sql` primero, y detrás los `-n2.sql`, `species-universal.sql`,
  `poda-recombinaciones.sql`, `identificadores-taxonomicos.sql`, `rareza-local.sql`,
  `regional-ccaa.sql` e `ida-y-vuelta.sql`). Si en esta sesión regeneras más SQL, **añádelo a esa
  cola en orden, no la reordenes**.
- **Cabo Cope sigue en N2**: le falta la Fase 3 (POIs). No es objeto de esta sesión, pero es el
  último hueco de nivel de Murcia y conviene saberlo antes de tocar su ficha.
- El plan del que sale el anexo **no se leyó del BORM** sino de una recopilación de legislación
  ambiental: el antibot de la CARM sirve un CAPTCHA para toda la IP. Por eso su entrada en
  `normativa-espacios.json` dice que el número y la fecha del boletín **no** están comprobados. Si
  en tu sesión el BORM responde, cotejarlo es media hora y cierra el flanco.
