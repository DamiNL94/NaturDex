# Orden de operaciones

Hay dependencias entre herramientas que no son evidentes y que, al saltárselas, deshacen trabajo en
silencio. **Ninguna de estas seis se detecta con un error: todas fallan en verde.**

1. **`image`/`imageAttribution` son campos UNIVERSALES.** Si escribes una foto en el `park.json` (con
   `enrich-images.js --write-park`) y después lanzas `species:apply` sin haber hecho antes
   `species:extract`, el catálogo universal **pisa la foto recién puesta** y vuelve a null. Lo robusto
   es escribir la foto en `especies-universal.json` y luego `--apply`.
2. **`data/contenido/*.json` manda sobre todo lo demás.** Es lo correcto (es texto escrito para ser
   universal), pero significa que una entrada obsoleta ahí revierte cualquier corrección en cada
   `--extract`. Ya pasó: una entrada fijaba la foto de *Anabasis hispanica* a un pliego borrado del
   disco, y cada extracción reponía la ruta muerta. Hoy `sync-species-catalog.js` **ignora y avisa** de
   las fotos locales inexistentes, pero la regla sigue en pie: al corregir un campo universal, mira si
   `contenido/` lo está fijando.
3. **Renombrar un taxón deja rastro en dos sitios más.** El catálogo universal y `data/contenido/`
   se indexan por **nombre científico**, así que cambiar el nombre en los `park.json` los desengancha
   sin que nada falle: la entrada vieja del catálogo se queda ahí para siempre (`--extract` añade,
   pero no borraba) y el texto redactado de `contenido/` deja de llegar a la especie y se queda
   alimentando a la entrada muerta. La vieja **no es inerte**: una selección aprobada antes del
   renombrado casa con ella y resucita el duplicado que se acababa de quitar. Al renombrar:
   **cambia también la clave en `contenido/`** y pasa
   `node Tools/sync-species-catalog.js --extract --podar`, que las retira y las lista.
4. **La API tiene prioridad sobre el `park.json` empaquetado** (`Frontend/Js/data.js`). Con backend
   desplegado, tocar solo los ficheros del frontend no cambia lo que ve el usuario: hay que generar y
   aplicar también el SQL. Y al revés — `adopt-habitats.js` escribe en `Frontend/` y **no pasa por la
   BD**: mientras el pipeline de hábitats siga así, un export desde la API borraría sus cambios.

5. **La auditoría de enlaces va DESPUÉS de `species:build`, y cada regeneración la deshace.**
   `auditoria-especie-habitat.js --write` retira los `habitatIds` que contradicen el medio de la
   ficha —en Ajauque, cuatro plantas de saladar colgadas del 3280, que es un cauce, porque su recinto
   del Atlas es un mosaico con el 1510—. Pero `build-species-n2.js` **deriva `habitatIds` entero**
   desde el barrido de GBIF y el índice del Atlas: la lista de campos que conserva a mano
   (`coordinates`, `featured`, `visible`, `reviewNote`, audio) **no la incluye**, así que la
   siguiente regeneración los repone tal cual. No falla ni avisa: el informe
   [`auditoria-especie-habitat.md`](../auditoria-especie-habitat.md) sigue diciendo «se retiran 4» y
   los cuatro están otra vez ahí. La regla es sencilla: **la auditoría es el último paso de la Capa
   3**, y si se regenera el espacio hay que volver a pasarla.

6. **Regenerar un espacio ya publicado le devuelve las aves que `aves:poda` le quitó.**
   `build-species-n2.js` reescribe el catálogo entero **desde la selección aprobada**, y ocho de los
   dieciséis espacios de Murcia pasaron por `poda-aves-sin-respaldo.js` DESPUÉS de escribirse: su
   selección todavía trae las aves que la poda retiró, porque la poda no la toca. Un `--dry` sobre
   Sierra de la Pila anuncia **243 fichas escritas** donde hoy hay 219, y las 24 de diferencia son
   aves resucitadas — sin aviso, porque desde el punto de vista de la herramienta está haciendo su
   trabajo. **Regla: en un espacio publicado, no se regenera para cambiar UN campo.** Se escribe una
   herramienta que toque solo ese campo sobre el `park.json` —`aves:fenologia`, `atlas:aplica`,
   `taxones:trinomios`— o se vuelve a pasar `aves:poda` detrás de la regeneración.

**Idempotencia.** `build-n1-espacios`, `merge-habitats`, `adopt-habitats`,
`fix-estado-conservacion-iepnb` y `sync-species-catalog` son idempotentes: reejecutarlos con la misma
entrada no cambia ni un byte. Es la comprobación más barata de que algo se ha hecho bien —
**si un segundo pase produce un diff, hay un problema**.

**Regenerar el `park.json` desde la BD** (tras editar en el panel de administración):
`npm run export:park -- <slug>`. Sube `manifest.version` para que el offline revalide.

