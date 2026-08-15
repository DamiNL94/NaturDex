# Perfil y ajustes

Hasta ahora lo que el usuario podía hacer con su cuenta estaba repartido por las cabeceras (un icono
de cerrar sesión aquí, un "?" allá) y muchas cosas ni existían: no había forma de cambiarse el
nombre, la contraseña ni el email, ni de ajustar cómo se ve o se comporta la app. La pantalla
**Perfil y ajustes** (`screen-profile`) reúne todo eso en un sitio.

Se entra con el **botón de perfil** (icono de persona, verde) que hay en la cabecera del selector de
parque y en la del parque. `← Volver` devuelve a la pantalla desde la que se entró (si estabas
explorando un parque, vuelves al parque, no al selector).

## Qué contiene

| Bloque | Qué hay |
|---|---|
| Identidad | Inicial, nombre, email, etiquetas (invitado / administrador / "explorando desde"). |
| Tu progreso | Cuatro cifras del progreso estatal + acceso a la pantalla completa (`screen-account`). |
| Cuenta | Nombre visible, email, contraseña, cerrar sesión. En invitado: aviso y "Crear una cuenta". |
| Ajustes | Tema, tamaño del texto, menos movimiento, mapa base, seguimiento, GPS, avisos de logro y sonido. |
| Datos y almacenamiento | Parques descargados, espacio ocupado, exportación de datos y borrado local. |
| Ayuda y acerca de | Relanzar el tutorial, volver a activarlo, buscar actualizaciones, fuentes. |
| Borrar la cuenta | Baja definitiva (solo con sesión iniciada). |

## Piezas del sistema

| Pieza | Qué hace |
|---|---|
| `Frontend/Js/prefs.js` | **Preferencias.** Script clásico en el `<head>` (no módulo ES). Guarda, aplica y sincroniza. |
| `Frontend/Js/profile.js` | Pinta la pantalla y gestiona sus formularios y acciones. Módulo ES, lo arranca `app.js`. |
| `Backend/Api/account.php` | Perfil, contraseña, preferencias, exportación y baja. Exige sesión. |
| `Frontend/Css/styles.css` | Estilos de la pantalla + **tema oscuro** + escalado de texto + "menos movimiento". |
| `Database/schema.sql` · `migrations.sql` | Columna `users.prefs` (JSON) para espejar las preferencias entre dispositivos. |

Reparto de responsabilidades: `auth.js` sigue siendo el dueño de la sesión y de la navegación
(expone `window.naturdexAuth`), `prefs.js` es el dueño de las preferencias (expone
`window.NaturDexPrefs`) y `profile.js` solo pinta y orquesta. Ninguno guarda estado propio duplicado.

## Los tres endpoints de usuario

No se solapan, y conviene no mezclarlos al añadir cosas:

- `auth.php` → **sesión**: registro, login, logout, "quién soy".
- `account-progress.php` → **progreso estatal y logros**: agregados y eventos de progreso.
- `account.php` → **administración de la cuenta**: lo que el usuario cambia de sí mismo.

### Acciones de `account.php`

| Acción | Método | Exige contraseña | Qué hace |
|---|---|---|---|
| `profile` | GET | — | Usuario + preferencias + cifras (parques con progreso, logros, días de campo, alta). |
| `export` | GET | — | Descarga un JSON con **todo** lo que la BD guarda de la cuenta (portabilidad RGPD). |
| `profile` | POST | solo si cambia el email | Nombre visible y/o email. |
| `password` | POST | sí | Cambia la contraseña (mínimo 6, igual que el registro) y regenera el id de sesión. |
| `prefs` | POST | — | Espeja las preferencias (máx. 4 KB). |
| `delete` | POST | sí, + escribir `BORRAR` | Baja definitiva. El `ON DELETE CASCADE` se lleva progreso, logros y actividad. |

Tener la cookie de sesión abierta **no basta** para cambiar credenciales ni para darse de baja: eso
protege de una sesión olvidada en un dispositivo prestado.

## Preferencias

Todas viven en `DEFAULTS` (`prefs.js`); añadir una nueva es añadirla ahí y pintarla en `profile.js`.

| Clave | Valores | Quién la lee |
|---|---|---|
| `theme` | `auto` · `claro` · `oscuro` | `prefs.js` → `data-theme` en `<html>` |
| `textSize` | `normal` · `grande` · `enorme` | `prefs.js` → `data-text-size` (escala la raíz en rem) |
| `reduceMotion` | booleano | `prefs.js` → `data-motion`; también `achievements.js` (confeti) |
| `mapBase` | `osm` · `pnoa` | `map.js` (capa base de arranque) |
| `followByDefault` | booleano | `explorer.js` (arranca siguiendo tu posición) |
| `highAccuracyGps` | booleano | `explorer.js` (`enableHighAccuracy`) |
| `celebrations` | booleano | `achievements.js` (carteles animados) |
| `achievementSound` | booleano | `achievements.js` (tono al desbloquear) |
| `shareOccurrences` | booleano, **apagada por defecto** | `Tools/export-dwc.php`, y **desde el espejo del servidor** (`users.prefs`), no desde el dispositivo |

**`shareOccurrences` es distinta de las demás y conviene no tratarla como una preferencia más.** Las
otras son cosméticas y el dispositivo manda; esta es un **consentimiento para ceder datos personales**
—los avistamientos salen con el nombre público del observador— y por eso: nace apagada, se explica en
llano en «Compartir con la ciencia» (dentro de *Datos y almacenamiento*, no en *Ajustes*), y quien la
lee es el exportador **contra `users.prefs` del servidor**, nunca contra lo que traiga una petición.
Ausente cuenta como «no». Ver [`DARWIN-CORE.md`](DARWIN-CORE.md) §6.

**Ámbito.** Son por cuenta y por dispositivo: `naturdex.prefs.<u{id}|anon>`, el mismo criterio que
`progressScope()` (data.js), el tutorial y los logros. `prefs.js` deduce el ámbito leyendo el
`naturdex.user` que escribe `auth.js`, así que no depende de que nadie lo inicialice.

**Sincronización.** El dispositivo manda: se aplican desde `localStorage` sin esperar a la red, y el
envío a `account.php?action=prefs` es un espejo para recuperarlas en otro dispositivo. El conflicto
se resuelve por **última escritura gana** comparando `updatedAt` (`adoptServerPrefs`). En modo
invitado no se sincroniza nada.

### Por qué `prefs.js` es un script clásico y no un módulo ES

El tema tiene que estar puesto en `<html>` **antes del primer pintado**. Un módulo ES es diferido y
se ejecutaría después de parsear el documento: se vería un fogonazo blanco al abrir la app en modo
oscuro. Por eso va con `<script src="Js/prefs.js">` síncrono en el `<head>` y se expone por
`window.NaturDexPrefs`, igual que `NaturDexOffline`. Todos los módulos comprueban que exista antes de
usarlo, así que la app sigue funcionando aunque ese script no cargue (con los valores por defecto).

## Tema oscuro

`prefs.js` escribe `data-theme="light|dark"` en `<html>` y `styles.css` repinta la paleta de
variables en `:root[data-theme="dark"]`. Como la hoja arrastra colores claros fijos (`#fff` y sus
tintes) de antes de que existiera el tema, el bloque oscuro los reasigna uno a uno; si añades un
componente con fondo claro fijo, acuérdate de añadirlo también ahí.

Dos decisiones a propósito:

- El callejero de OSM se atenúa con un filtro (`.tile-osm`), pero **la ortofoto del PNOA no**:
  alterarla falsearía lo que se está viendo del terreno.
- La pestaña activa usaba `--ink` de fondo con texto blanco; en oscuro eso sería blanco sobre blanco,
  así que pasa a usar el verde de marca.

## Modo invitado

Funciona todo salvo lo que necesita servidor. En vez de formularios de cuenta se muestra el aviso de
que su progreso vive solo en ese dispositivo, un campo para ponerse nombre (local) y el botón de
crear cuenta, que abre el registro directamente en modo "Crear cuenta". Lo que haya explorado como
invitado se traslada solo a la cuenta nueva (`achievements.js::migrateGuestDataIfNeeded`).

## Borrado local vs. baja de la cuenta

Son cosas distintas y la pantalla lo dice:

- **Borrar los datos locales** vacía las claves `naturdex.*` de este navegador (salvo la sesión), las
  descargas sin conexión y las cachés. Con cuenta, el progreso vuelve a bajarse del servidor; en
  invitado, se pierde.
- **Borrar la cuenta** elimina la fila de `users` y, por cascada, todo lo asociado. Además limpia los
  datos locales y devuelve a la portada.

## Al desplegar

1. Aplicar la migración (`Database/migrations.sql`) o, suelto:
   `ALTER TABLE users ADD COLUMN prefs JSON NULL AFTER role;`
2. `Frontend/sw.js` ya lleva la versión subida y los ficheros nuevos (`prefs.js`, `profile.js`) en
   `SHELL_ASSETS`: al tocar el armazón hay que subir `VERSION` o los móviles seguirán con la copia
   cacheada.
