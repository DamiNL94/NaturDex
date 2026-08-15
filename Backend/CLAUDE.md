# `Backend/` — índice de la API

API PHP + MySQL. **Todos los endpoints arrancan con `apiBoot()` de `Lib/api.php`** (cabeceras, CORS,
preflight, sesión, `respond()`); si escribes uno nuevo, empieza por ahí.

> **La forma de cada JSON se define UNA sola vez, en `Lib/*_payload.php`.** El endpoint y el
> exportador de `Tools/` comparten esa definición. Si cambias la forma del JSON de un parque, la
> tocas en `Lib/park_payload.php` y ya sirve para los dos. No la dupliques en el endpoint.

## `Api/` — endpoints

| Fichero | Líneas | Qué sirve |
|---|---|---|
| `parks.php` | 60 | Listado de espacios con su `status` (`basic` · `available` · `planned`) |
| `species.php` | 13 | Catálogo de un parque. Forma definida en `Lib/park_payload.php` |
| `glossary.php` | 8 | Glosario nacional (mismo contenido que `Frontend/Data/glosario.json`) |
| `invasoras.php` | 8 | Especies exóticas invasoras (RD 630/2013) por CCAA |
| `auth.php` | 99 | Registro, login, logout, comprobación de sesión. `password_hash`/`password_verify` |
| `account.php` | 256 | Perfil, contraseña, preferencias, exportación de datos |
| `progress.php` | 185 | Progreso **por usuario y por parque** (especies/POIs vistos, avistamientos) |
| `account-progress.php` | 68 | Progreso de **cuenta** (ámbito estatal) + logros. Complementa a `progress.php`, no lo sustituye |
| `presence.php` | 69 | **El único sitio por el que entra una posición del GPS** |
| `admin.php` | 432 | CRUD del contenido ambiental para el AdminPanel |

## `Lib/` — lógica compartida

| Fichero | Líneas | Qué da |
|---|---|---|
| `api.php` | 102 | `apiBoot()` y `respond()`: el prólogo común de todo endpoint |
| `api_cors.php` | 20 | Cabeceras CORS de la API pública |
| `park_payload.php` | 198 | **Forma canónica del JSON de un parque.** Compartida con el exportador |
| `park_export.php` | 239 | Vuelca un parque de la BD al `park.json` empaquetado (`npm run export:park`) |
| `glossary_payload.php` · `invasoras_payload.php` | 32 · 57 | Ídem para glosario e invasoras |
| `presence.php` | 371 | **Verificación de presencia real** (antitrampas). Ver [`Docs/VERIFICACION-Y-ANTITRAMPAS.md`](../Docs/VERIFICACION-Y-ANTITRAMPAS.md) |
| `account_progress.php` | 443 | Progreso de cuenta y evaluación del catálogo de logros |
| `session.php` | 214 | Sesión y «seguir conectado» entre aperturas |
| `geo.php` | 199 | Geometría oficial del lado servidor: punto-en-polígono contra el límite |
| `dwc.php` | 250 | **El vocabulario Darwin Core**: columna ↔ término ↔ URI, identificadores y reglas de sensibilidad. Puro (sin BD), para poder probarlo con `npm test` |
| `occurrences.php` | 300 | Escritura y lectura de `user_occurrences`. Lo llaman `progress.php`, `presence.php` y `account-progress.php`; lo lee `Tools/export-dwc.php` |

## `Config/`

`db.php` — conexión MySQL desde variables de entorno (Docker/producción), con caída a XAMPP local.

## Cuidado con

- **La API tiene prioridad sobre el `park.json` empaquetado** (`Frontend/Js/data.js`). Con backend
  desplegado, tocar solo los ficheros del frontend no cambia lo que ve el usuario.
- **El pipeline de hábitats no pasa por la BD**: `adopt-habitats.js` escribe en `Frontend/` y nada
  más, así que un export desde la API borraría sus cambios. Deuda nº 2.
- **Marcar algo escribe en DOS sitios**: `user_progress` (lo que la app lee, local-first) y
  `user_occurrences` (la capa científica en Darwin Core). El segundo va siempre en `try/catch`: si
  falla, el progreso del usuario ya está a salvo. Ver [`Docs/DARWIN-CORE.md`](../Docs/DARWIN-CORE.md).
- `murcia_status` está atado a Murcia y toca `Lib/park_payload.php` y `Api/admin.php` (3 sentencias).
  Deuda nº 1: ver [`Docs/DEUDA-TECNICA.md`](../Docs/DEUDA-TECNICA.md).

Pruebas sin BD: `npm test` → `Tools/test-presence-rules.php` + `Tools/test-dwc-rules.php`.
