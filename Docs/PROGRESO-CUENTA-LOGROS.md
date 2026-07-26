# Progreso de cuenta y logros

NaturDex tiene dos capas de progreso, una encima de la otra:

1. **Progreso por parque** (la de siempre). Vive en `user_progress` (una fila por usuario y parque,
   payload `{ seenSpeciesIds, seenPoiIds, sightings, updatedAt }`). La gestiona
   `Backend/Api/progress.php` y, en el frontend, `Frontend/Js/state.js`/`data.js`. El único logro que
   conocía era completar un parque (`ACHIEVEMENT_NAME` en `state.js`).
2. **Progreso de cuenta** (ámbito estatal). Agrega lo visto en **todos** los parques de una cuenta:
   especies distintas (deduplicadas entre parques), parques visitados/completados, comunidades
   autónomas y provincias pisadas, hábitats completados, POIs, avistamientos GPS, invasoras
   identificadas, términos de glosario consultados y constancia (días de actividad, rachas). De aquí
   sale el catálogo de **logros de cuenta**, que nunca se pierden aunque el progreso baje después.

La capa 2 no sustituye a la 1: la lee. Todo en `user_account_progress` es **derivable desde cero** a
partir de `user_progress` + `user_activity_log` + `user_invasive_sightings` + `user_glossary_views`
(la única pieza que no es puramente derivada son los flags "de sabor" reportados por el cliente, ver
más abajo). Por eso `Tools/recalculate-account-progress.php` puede reconstruir el progreso de cuenta
de cualquier usuario en cualquier momento sin perder nada.

## Piezas del sistema

| Pieza | Qué hace |
|---|---|
| `Database/schema.sql` / `migrations.sql` | Tablas `user_account_progress`, `user_achievements`, `user_activity_log`, `user_invasive_sightings`, `user_glossary_views`. |
| `Frontend/Data/achievements.json` | **Catálogo de logros, fuente única.** Lo leen tanto el backend como el frontend: ninguno de los dos puede desincronizarse de las reglas. |
| `Backend/Lib/account_progress.php` | Agregación (`computeAccountAggregates`) + evaluación del catálogo (`evaluateAchievements`) + punto de entrada único (`recomputeAccountProgress`). |
| `Backend/Api/account-progress.php` | GET de totales/logros; POST para invasoras identificadas, términos de glosario, flags de sabor y "marcar como celebrado". |
| `Backend/Api/progress.php` | Sin cambiar su contrato: tras cada POST, además de guardar el progreso del parque, registra el día de actividad y devuelve `newlyUnlocked` (logros de cuenta recién confirmados). |
| `Frontend/Js/achievements.js` | Carga el catálogo, predice en offline (mismo criterio de deduplicación que el servidor), sincroniza con el servidor al reconectar y gestiona la cola de celebración (el cartel animado). |
| `Frontend/Js/render.js` · `renderAccountProgress()` | Pinta la pantalla "Tu progreso estatal" (`screen-account`, accesible desde el selector de parque). |
| `Tools/recalculate-account-progress.php` | Recalcula el progreso de cuenta y los logros de **todos** los usuarios (retrocompatibilidad tras el despliegue, o para reparar desajustes). |

## Deduplicación de especies entre parques

`species` es una tabla por parque (una fila por especie y parque); no hay tabla global. La clave
canónica para saber si dos filas de dos parques son "la misma especie" es, en este orden:

1. `gbif_species_key` si existe (el más fiable).
2. si no, `eidos_taxonid`.
3. si no, el nombre científico normalizado (minúsculas, espacios colapsados) — mismo criterio que ya
   usaba `state.js·speciesGroupKey()` dentro de un parque, aquí extendido entre parques.

Implementado en paralelo en `Backend/Lib/account_progress.php::canonicalSpeciesKey()` (PHP) y
`Frontend/Js/achievements.js::canonicalSpeciesKey()` (JS): si cambias el criterio, cámbialo en los
dos sitios.

## Offline y reconciliación

Con red, el servidor manda: `account-progress.php` (GET) y las respuestas de `progress.php`/
`account-progress.php` (POST, campo `newlyUnlocked`) son la fuente de verdad. Sin red,
`achievements.js` predice localmente a partir de los parques con los que este dispositivo ha
interactuado (su progreso ya está cacheado offline) y encola la celebración igualmente. Al reconectar
(`syncWithServer`):

- un logro que el cliente predijo y el servidor **no** confirma se retira en silencio;
- un logro que el servidor tiene y el cliente no había celebrado, se celebra al reconectar;
- un usuario que se registra habiendo jugado como invitado migra su progreso local de `anon` a su
  nueva cuenta la primera vez que entra (`achievements.js::migrateGuestDataIfNeeded`).

## Retrocompatibilidad (usuarios con progreso previo)

Un logro desbloqueado se guarda siempre con `unlocked_at` y `celebrated_at = NULL`. La diferencia
entre un desbloqueo **en vivo** (mientras usas la app) y uno **retroactivo** (alta antigua, o el
recálculo masivo de `Tools/`) no está en cómo se guarda, sino en cómo lo anuncia el frontend:

- **En vivo**: llega por `newlyUnlocked` en la respuesta de un POST → cartel animado individual (o
  agrupado si son más de 3 a la vez).
- **Retroactivo**: al hacer GET a `account-progress.php`, cualquier logro con `celebrated_at = NULL`
  que **no** viniera de un desbloqueo en vivo de esta sesión se agrupa en un único aviso discreto
  ("Has desbloqueado N logros con tu progreso anterior"), sin animación ni confeti.

## Cómo añadir un logro nuevo

No hace falta tocar código en ninguno de los dos lados. Añade una entrada al array `achievements` de
`Frontend/Data/achievements.json`:

```json
{
  "id": "pois_150",
  "category": "pois",
  "metric": "poisSeen",
  "threshold": 150,
  "rarity": "legendario",
  "icon": "🏆",
  "title": "Título del logro",
  "description": "Descripción corta, en el mismo tono divulgativo del resto de la app."
}
```

- `id` es estable: no lo reutilices ni lo cambies una vez publicado (es la clave en `user_achievements`).
- `metric` debe existir en el agregado que devuelve `computeAccountAggregates()` (PHP) /
  `computeLocalAggregates()` (JS) — mira `Backend/Lib/account_progress.php` para la lista completa
  (`speciesSeen`, `parksVisited`, `parksCompleted`, `regionsVisited`, `provincesVisited`,
  `habitatsCompleted`, `poisSeen`, `gpsSightings`, `invasiveSeen`, `glossaryViewed`, `activeDays`,
  `weekStreak`, `maxParkRevisitDays`, o un flag de sabor como `earlyBird`/`winterOuting`/`noSearchHabitat`).
- `category` debe existir en el array `categories` del mismo fichero (o añade una nueva ahí también).
- `threshold` es el valor de esa métrica que desbloquea el logro (para los flags de sabor, siempre 1).

Si el logro necesita una métrica que **no existe todavía** (por ejemplo, algo que no se pueda derivar
de `user_progress`/`user_activity_log`), hace falta código: añade el cálculo a
`computeAccountAggregates()`/`computeLocalAggregates()` y, si el dato no es derivable del todo (como
`user_activity_log` o los flags de sabor), una tabla o campo propio que lo registre.
