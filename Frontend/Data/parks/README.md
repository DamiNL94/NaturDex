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

## Dos niveles de dato: ficha base (N1) y catálogo completo (N2)

El rollout nacional (`Docs/prompts/e-rollout-nacional.md`) separa el trabajo en dos niveles, y eso se
refleja en el campo `status` de cada entrada de `parks-index.json`:

| `status` | Nivel | Qué tiene | Qué ve el usuario |
|---|---|---|---|
| `basic` | **N1 · ficha base** | Bloque `park` completo + `geo/parque.geojson` (límite oficial) y, si los hay, `lic`/`zepa`. Los arrays `habitats`, `species` y `pointsOfInterest` están **vacíos**. | El espacio es seleccionable y se etiqueta «(ficha base)». Entra al mapa con su límite y sus capas Natura 2000; en lugar del catálogo aparece el aviso «catálogo de especies y hábitats en preparación». Sin contadores, sin barra de progreso, sin pestaña de progreso ni modo explorador. |
| `available` | **N2 · completo** | Todo lo del piloto: hábitats HIC recortados, especies con evidencia y estado de conservación, POIs, fotos y audioguías. | La experiencia completa. |
| `planned` | — | Nada: no hay carpeta de datos. | Aparece en la lista deshabilitado, como «(próximamente)». |

Todo espacio **nace `basic` y asciende a `available`** cuando se le hace el catálogo. El validador
(`npm run validate`) comprueba los dos niveles, con reglas relajadas para `basic`: exige el bloque
`park` completo y un límite oficial válido (GeoJSON de polígonos en WGS84 dentro de España), y que
los contadores del manifiesto cuadren —a cero si están a cero—, pero **no** exige hábitats, especies,
POIs ni imágenes.

### Quién manda sobre el `status`

El nivel de dato vive en dos sitios y eso podría convertirse en dos verdades que se separan, así que
hay una regla única: **manda la base de datos** (columna `parks.status`, un `ENUM` de los tres
valores). Este `parks-index.json` es la copia que lee la app pública —también sin conexión, por eso
tiene que estar empaquetada— y se pone al día sola: al pulsar «Publicar cambios offline» en el panel
de administración (o al ejecutar `php Tools/export-park.php`), `Backend/Lib/park_export.php` escribe
aquí el `status` que tenga la BD. Se edita, por tanto, desde el panel; tocarlo a mano en este fichero
funciona, pero la siguiente publicación lo sobrescribirá con lo que diga la base de datos.

Los espacios dados de alta a mano durante el rollout (Fase 1) todavía no están en la BD: ahí el
registro es lo único que hay, y es correcto escribir su `status` directamente.

Espacios cargados hoy: **Región de Murcia › Murcia › `cabo-cope-puntas-calnegre`** (N2, el piloto) y
**`cuatro-calas`** (N1). El resto de España queda como estructura lista para rellenar (no se ha
inventado ningún dato de otros espacios).

## Cómo añadir un espacio nuevo

1. Crear `Data/parks/<provincia-slug>/<espacio-slug>/` con:
   - `park.json` — misma forma que el actual (`park`, `habitats`, `species`, `pointsOfInterest`).
     Para una ficha base, los tres últimos son arrays vacíos, y el bloque `park` debe llevar `slug`,
     `name`, `category` (la figura oficial literal), `region`, `province`, `municipalities`, `center`,
     `summary` y `boundaryNote` con la procedencia del límite.
   - `geo/` — los GeoJSON que tengas. `parque.geojson` es **obligatorio** (es lo único que promete una
     ficha base); el resto son opcionales y si falta `habitats.geojson` se dibujan círculos.
   - `manifest.json` — declara las rutas (relativas a `Frontend/`) de `data`, `geo` e `images`, y los
     `counts` (a cero en una ficha base).
2. Añadir la entrada en `parks-index.json`, dentro de su comunidad y provincia, con el `status` que
   corresponda (`basic` o `available`) y las rutas `path` y `manifest`.
3. Ejecutar `npm run validate` (el hook de pre-commit lo hace por ti y bloquea el commit si falla).
4. (Opcional, para el backend) cargar sus filas en la base de datos con el mismo modelo de
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
