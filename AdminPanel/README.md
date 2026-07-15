# AdminPanel — panel de administración de NaturDex

Aplicación del panel de administración (`/Frontend/admin/`), que edita el contenido ambiental
contra `Backend/Api/admin.php`. Sustituye al antiguo `Frontend/admin.html` + `Js/admin.js`.

## Tecnología

- **React 19** + **TypeScript** (interfaz declarativa y tipada)
- **Vite 7** (dev server con recarga instantánea y build)
- **Tailwind CSS 4** (estilos por utilidades, configurado en `src/index.css`)
- **TanStack Query 5** (caché e invalidación de las lecturas de la API; sin estado global manual)

## Por qué se compila a `Frontend/admin/`

`admin.php` no envía cabeceras CORS y la sesión viaja en la cookie PHP (SameSite): el panel **debe
servirse desde el mismo origen** que la API. Por eso el build sale a `Frontend/admin/`, que Apache
sirve junto al resto del frontend. El resultado compilado se versiona en git para que la imagen
Docker no necesite Node: solo hay que recompilar cuando se toque `AdminPanel/`.

## Desarrollo

Requiere Node 20+ y el stack Docker levantado (`docker compose up -d`, web en `localhost:8080`).

```bash
cd AdminPanel
npm install
npm run dev       # http://localhost:5173 — proxy de /Backend y /Frontend hacia localhost:8080
```

El proxy de Vite reenvía la API al contenedor, así que la cookie de sesión queda en el origen del
dev server y el login funciona igual que en producción.

## Compilar (publicar cambios del panel)

```bash
npm run build     # typecheck (tsc) + build → ../Frontend/admin/
```

Tras compilar, el panel queda servido en `http://localhost:8080/Frontend/admin/` (en desarrollo el
override de compose monta `./Frontend` en el contenedor; en producción viaja copiado en la imagen).

## Estructura

| Fichero | Qué hace |
|---|---|
| `src/api.ts` | Cliente de la API PHP (cabecera `X-Requested-With` en los POST) y tipos |
| `src/fields.ts` | Definición declarativa de los formularios (mismas columnas que la BD) |
| `src/App.tsx` | Sesión: muestra acceso o panel según responda `admin.php?action=overview` |
| `src/Login.tsx` | Pantalla de acceso (reutiliza `auth.php`) |
| `src/Panel.tsx` | Armazón: cabecera, selector de parque, publicar offline, pestañas |
| `src/ItemList.tsx` | Lista lateral con buscador y alta |
| `src/ItemForm.tsx` | Formulario generado desde `fields.ts` + relación especie ↔ hábitats |
| `src/CoordPicker.tsx` | Mini-mapa Leaflet (OSM/PNOA): un clic rellena latitud y longitud |
| `src/toast.tsx` | Avisos flotantes |

Añadir un campo nuevo a un formulario = una línea en `src/fields.ts` + otra en la lista blanca de
`Backend/Api/admin.php` (igual que en el panel clásico), y recompilar.
