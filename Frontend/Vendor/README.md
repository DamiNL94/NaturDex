# Vendor/ — librerías de terceros copiadas al repo

La app (`Frontend/`) es **zero-dep**: no tiene `package.json` ni `npm install`. Lo que necesita de
terceros vive aquí, copiado tal cual desde el registro de npm y fijado por versión.

## Por qué están aquí y no en un CDN

Hasta `v39` Leaflet y markercluster se cargaban desde `unpkg.com`. Eso rompía el modo sin conexión
en frío: `sw.js` ignora a propósito todas las peticiones que no son del mismo origen (ver el
`return` temprano de su `fetch`), así que esos ficheros **nunca entraban en la Cache Storage**. Y
como `Js/map.js` llama a `L.map(...)` en el cuerpo del módulo, sin `L` el import falla con
`ReferenceError: L is not defined` y con él se cae el grafo de módulos entero: `app.js` no llegaba
a ejecutarse y la app no arrancaba sin cobertura. Comprobado en el navegador antes de mover nada.

Al servirse desde nuestro propio origen entran en `SHELL_ASSETS` del Service Worker como cualquier
otro fichero del armazón.

## Qué hay

| Carpeta | Paquete npm | Versión | Licencia |
| --- | --- | --- | --- |
| `leaflet/` | [`leaflet`](https://www.npmjs.com/package/leaflet) | 1.9.4 | BSD-2-Clause (`leaflet/LICENSE`) |
| `markercluster/` | [`leaflet.markercluster`](https://www.npmjs.com/package/leaflet.markercluster) | 1.5.3 | MIT (`markercluster/LICENSE`) |
| `protomaps/` | [`protomaps-leaflet`](https://www.npmjs.com/package/protomaps-leaflet) | 5.1.0 | BSD-3-Clause (`protomaps/LICENSE`) |
| `fonts/` | [Public Sans](https://public-sans.digital.gov/) v21 · [Zilla Slab](https://github.com/mozilla/zilla-slab) v12 | subconjuntos de Google Fonts | SIL OFL 1.1 (`fonts/LICENSE-*.txt`) |

`fonts/` está aquí por el MISMO motivo que Leaflet, y llegó tarde: las dos familias se cargaban
desde `fonts.googleapis.com`, así que sin cobertura la app perdía su tipografía y caía a la fuente
del sistema — justo en el monte, que es donde se usa. Son los subconjuntos `latin` y `latin-ext`
tal cual los sirve Google Fonts (~220 KB en total), con su `@font-face` en `fonts/fonts.css`. De
paso deja de filtrarse a un tercero la IP de cada usuario en cada arranque.

Son los mismos ficheros `dist/` que servía unpkg, sin modificar. `leaflet/images/` hace falta
porque `leaflet.css` referencia los sprites del control de capas por ruta relativa, y porque el mapa
de España (`auth.js`) usa el marcador por defecto de Leaflet.

`protomaps-leaflet` es el mapa base sin conexión: trae **dentro** el lector de `.pmtiles`, el
renderizador de teselas vectoriales y las paletas de color, así que basta con este fichero (no hace
falta vendorizar además `pmtiles` ni `@protomaps/basemaps`; el tema se pasa por nombre —
`flavor: 'light'` / `'dark'`). Solo entra en juego si el parque declara `tiles` en su manifiesto:
sin él, `map.js` degrada a OSM/PNOA sin ruido en consola. Ver `Tools/build-park-tiles.js` para cómo
se generan los paquetes y qué permite la licencia de cada fuente.

## Cómo actualizar una versión

1. Descargar los `dist/` de la versión nueva y sustituir los ficheros de la carpeta.
2. Actualizar la versión en la tabla de arriba.
3. Subir `VERSION` en `Frontend/sw.js` para que el armazón cacheado se renueve en los dispositivos.
4. Si cambian los nombres de fichero, actualizar `SHELL_ASSETS` en `sw.js` y las etiquetas de
   `index.html`.

```bash
curl -sSfL -o Frontend/Vendor/leaflet/leaflet.js https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
```
