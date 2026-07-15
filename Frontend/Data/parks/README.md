# Datos de parques (arquitectura escalable por provincia)

Cada parque vive en su propia carpeta bajo la provincia a la que pertenece, de modo que el catálogo
pueda crecer a todos los parques naturales y nacionales de España sin rehacer nada:

```
Data/
  parks-index.json                         <- registro global (comunidad -> provincia -> parques)
  parks/
    <provincia-slug>/
      <parque-slug>/
        park.json                          <- datos del parque (parque, hábitats, especies, POIs)
        manifest.json                      <- lista de activos (datos, geo, imágenes) para offline
        geo/                               <- geometría GeoJSON del parque
          parque-regional.geojson
          lic.geojson
          zepa.geojson
          trails.geojson
          habitats.geojson
```

En este prototipo solo existe **Región de Murcia › Murcia › `cabo-cope-puntas-calnegre`**. Es el único
parque con `status: "available"` en `parks-index.json`; el resto de España queda como estructura lista
para rellenar en el futuro (no se ha inventado ningún dato de otros parques).

## Cómo añadir un parque nuevo

1. Crear `Data/parks/<provincia-slug>/<parque-slug>/` con:
   - `park.json` — misma forma que el actual (`park`, `habitats`, `species`, `pointsOfInterest`).
   - `geo/` — los GeoJSON que tengas (todos opcionales; si falta `habitats.geojson` se dibujan círculos).
   - `manifest.json` — declara las rutas (relativas a `Frontend/`) de `data`, `geo` e `images`.
2. Añadir la entrada del parque en `parks-index.json`, dentro de su comunidad y provincia, con
   `status: "available"` y las rutas `path` y `manifest`.
3. (Opcional, para el backend) cargar sus filas en la base de datos con el mismo modelo de
   `Database/schema.sql`, usando su propio `park_id`. La API ya es multi-parque (`species.php?park=<slug>`).

No hace falta tocar `app.js`: el cargador es agnóstico al parque (lee el registro, resuelve el parque
activo — por defecto el `defaultPark` del índice — y carga su manifiesto, datos y geometría).

## Audioguías (puntos de interés, rutas y hábitats)

Cada hábitat y punto de interés admite una audioguía explicativa opcional con dos campos gemelos:

- `audio` — ruta del fichero (relativa a `Frontend/`, p. ej. `Audio/poi/torre-cope.mp3`) o URL.
- `audioTranscript` — transcripción textual completa. **Obligatoria si hay audio**: es la
  alternativa accesible que exige la UNE-EN 301549 (WCAG 2.1, criterio 1.2.1). El validador
  (`npm run validate`) marca error si falta.

En la base de datos son `audio_url` / `audio_transcript` (tablas `habitats` y
`points_of_interest`); se editan desde el panel de administración y salen al `park.json` con el
resto del contenido. Las **rutas (senderos)** llevan los mismos campos `audio` y `audioTranscript`
en las `properties` de su feature dentro de `geo/trails.geojson`.

Para que las audioguías funcionen sin cobertura, lista sus ficheros locales en el array `audio`
del `manifest.json` del parque: el botón "Guardar sin conexión" los descarga junto a las imágenes.
La convención sugerida de carpetas es `Audio/habitats/`, `Audio/poi/` y `Audio/trails/`.

El reproductor lo pone el frontend (`Js/audio.js`): control nativo accesible + transcripción
desplegable, en la ficha del hábitat y en los popups de POI y sendero del mapa.

## Rutas

Todas las rutas de los ficheros de datos, geo e imágenes se expresan **relativas a `Frontend/`**
(que es como las pide el navegador desde `index.html`). Por eso las imágenes siguen en `Img/species/`
e `Img/poi/` (compartidas por ahora) y no se rompen al mover los datos a subcarpetas.
