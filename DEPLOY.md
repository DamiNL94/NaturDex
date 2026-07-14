# Despliegue de NaturDex con Docker

Despliegue sencillo y portable: un contenedor **web** (PHP 8.2 + Apache) que sirve el frontend y la
API, y un contenedor **db** (MySQL 8) que se autoimporta el catálogo la primera vez. Funciona igual
en tu PC y en cualquier VPS (Hetzner, DigitalOcean, etc.).

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) con Docker Compose v2 (`docker compose`, ya incluido
  en Docker Desktop y en las versiones recientes de Docker Engine).

## Puesta en marcha (local o servidor)

```bash
# 1. Configura las contraseñas
cp .env.example .env
#    edita .env y cambia DB_ROOT_PASSWORD y DB_PASSWORD

# 2. Construye y arranca
docker compose up -d --build

# 3. Abre la app
#    http://localhost:8080   (o el WEB_PORT que hayas puesto)
```

La primera vez, MySQL importa `Database/schema.sql` (estructura) y `Database/seed.sql` (parque piloto
Cabo Cope y su catálogo) automáticamente. Los datos quedan en el volumen `db_data` y sobreviven a
`docker compose down` / `up`.

## Comandos útiles

```bash
docker compose logs -f web        # ver logs del servidor web
docker compose logs -f db         # ver logs de MySQL (incluye la importación inicial)
docker compose ps                 # estado de los contenedores
docker compose down               # parar (conserva los datos en el volumen)
docker compose down -v            # parar y BORRAR la base de datos (reimporta al volver a subir)
docker compose up -d --build      # reconstruir tras cambiar código
```

## Recargar el catálogo tras editar los `.sql`

Los `.sql` solo se importan cuando el volumen está **vacío**. Si editas `seed.sql`/`schema.sql` y
quieres recargar sin borrar todo, impórtalos a mano contra el contenedor en marcha:

```bash
docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 naturadex' < Database/schema.sql
docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 naturadex' < Database/seed.sql
# Si añadiste columnas nuevas al esquema, aplica también las migraciones:
docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 naturadex' < Database/migrations.sql
```

O, para empezar de cero: `docker compose down -v && docker compose up -d --build`.

## Seguridad aplicada

El despliegue ya incluye estas medidas:

- **Solo el frontend y la API son accesibles por web.** Apache deniega el acceso directo a la
  configuración con credenciales (`Backend/Config`), las librerías (`Backend/Lib`), los volcados SQL
  (`Database`), las utilidades (`Tools`) y los datos de runtime (`Backend/Data`). Además, esos
  directorios ni siquiera viajan dentro de la imagen web (ver `.dockerignore`).
- **La base de datos no se publica al host:** solo es accesible desde la red interna de Docker.
- **La app se conecta con un usuario dedicado** (no `root`), con privilegios solo sobre su BD.
- **Contraseñas obligatorias:** sin `.env` con contraseñas definidas, el arranque falla (no hay
  credenciales débiles por defecto).
- **PHP endurecido:** `display_errors` off (los errores van al log, no a las respuestas),
  `expose_php` off, cookie de sesión `HttpOnly` + `SameSite=Lax` + `use_strict_mode`.
- **Sin fugas de versión** de Apache/PHP en las cabeceras.
- **`no-new-privileges`** en ambos contenedores.

Pendiente de decisión tuya (fuera del alcance de este Docker):

- Los endpoints de la API mandan `Access-Control-Allow-Origin: *`. Los navegadores ya bloquean las
  peticiones con credenciales (cookies) desde otros orígenes con `*`, así que la sesión no queda
  expuesta a sitios de terceros, pero conviene restringirlo al origen propio cuando fijes el dominio.

## Producción: HTTPS y sesión

El login usa cookies de sesión de PHP. Para un servidor público:

1. Pon un proxy inverso con TLS delante (Caddy, Traefik o Nginx con Let's Encrypt) apuntando al
   puerto de `web`. Caddy es el más simple: obtiene el certificado solo.
2. Una vez sirvas por **HTTPS**, descomenta `session.cookie_secure = 1` en
   [`docker/php.ini`](docker/php.ini) y reconstruye (`docker compose up -d --build`). Así la cookie
   de sesión solo viaja cifrada.
3. Cambia las contraseñas de `.env` por valores fuertes y no subas `.env` al repositorio
   (ya está en `.gitignore`).

## Notas

- El frontend y la API se sirven desde el mismo origen (requisito del frontend, que llama a la API
  por ruta relativa). La raíz `/` redirige a `/Frontend/index.html`.
- El progreso de cada usuario se guarda en la tabla `user_progress` de MySQL (no en ficheros), así
  que persiste en el volumen `db_data`.
- El panel de administración (`/Frontend/admin.html`) requiere una cuenta con `role = 'admin'` en la
  base de datos.
- Las teselas del mapa base (OpenStreetMap / PNOA) y Leaflet se cargan desde sus CDNs: el servidor
  necesita salida a internet para que el mapa se vea (la geometría del parque sí es local).
