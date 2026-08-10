# Orden de operaciones

Hay dependencias entre herramientas que no son evidentes y que, al saltárselas, deshacen trabajo en
silencio. **Ninguna de estas tres se detecta con un error: todas fallan en verde.**

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
3. **La API tiene prioridad sobre el `park.json` empaquetado** (`Frontend/Js/data.js`). Con backend
   desplegado, tocar solo los ficheros del frontend no cambia lo que ve el usuario: hay que generar y
   aplicar también el SQL. Y al revés — `adopt-habitats.js` escribe en `Frontend/` y **no pasa por la
   BD**: mientras el pipeline de hábitats siga así, un export desde la API borraría sus cambios.

**Idempotencia.** `build-n1-espacios`, `merge-habitats`, `adopt-habitats`,
`fix-estado-conservacion-iepnb` y `sync-species-catalog` son idempotentes: reejecutarlos con la misma
entrada no cambia ni un byte. Es la comprobación más barata de que algo se ha hecho bien —
**si un segundo pase produce un diff, hay un problema**.

**Regenerar el `park.json` desde la BD** (tras editar en el panel de administración):
`npm run export:park -- <slug>`. Sube `manifest.version` para que el offline revalide.

