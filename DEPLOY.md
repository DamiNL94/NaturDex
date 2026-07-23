# Despliegue de NaturDex con Docker

> ¿Solo quieres un enlace gratis para enseñar la demo (sin backend, sin VPS)? Ver
> `Docs/DESPLIEGUE_ESTATICO.md`. Esta guía es para el despliegue completo (frontend + API + MySQL).

Despliegue sencillo y portable: un contenedor **web** (Apache + PHP 8.2 sobre **Alpine**) que sirve
el frontend y la API, y un contenedor **db** (MySQL 8) que se autoimporta el catálogo la primera
vez. Funciona igual en tu PC y en cualquier VPS (Hetzner, DigitalOcean, etc.).

La imagen web se construye sobre Alpine (base mínima) en lugar de la imagen Debian oficial
`php:apache`: eso reduce las CVE de sistema de la imagen web de ~1200 a prácticamente 0. La base de
datos usa **MySQL 8.4 (LTS)**, que trae bastantes menos CVE que la 8.0 (soporte hasta 2032). La
imagen de MySQL sí arrastra las CVE propias de la imagen oficial de Oracle (incluido un binario Go
interno); mantenla al día con `docker pull mysql:8.4` antes de reconstruir.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) con Docker Compose v2 (`docker compose`, ya incluido
  en Docker Desktop y en las versiones recientes de Docker Engine).

## Puesta en marcha en local (HTTP)

```bash
# 1. Configura las contraseñas
cp .env.example .env
#    edita .env y cambia DB_ROOT_PASSWORD y DB_PASSWORD

# 2. Construye y arranca
docker compose up -d --build

# 3. Abre la app
#    http://localhost:8080   (o el WEB_PORT que hayas puesto)
```

> Compose combina automáticamente `docker-compose.yml` (base) con `docker-compose.override.yml`
> (desarrollo local: publica el 8080 por HTTP). Para producción con HTTPS se usa
> `docker-compose.prod.yml` en su lugar — ver [Producción](#producción-https-con-dominio-propio).

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
- **`no-new-privileges`** en todos los contenedores.
- **CORS restringido al origen propio:** la API pública ya no manda `Access-Control-Allow-Origin: *`
  sino el origen con el que se está viendo la app (`Backend/Lib/api_cors.php`). Otras webs no pueden
  leer respuestas de la API desde el navegador del usuario. `admin.php` sigue sin cabeceras CORS
  (solo mismo origen).
- **Cookie de sesión `Secure` en producción:** con el despliegue HTTPS, la cookie solo viaja cifrada
  (`docker/php-https.ini`, montado solo por `docker-compose.prod.yml`).

## Producción: HTTPS con dominio propio

En producción, un proxy inverso **Caddy** se pone delante del contenedor web: obtiene y renueva solo
el certificado de **Let's Encrypt**, redirige HTTP→HTTPS y es lo único expuesto a internet (el
puerto 8080 de `web` deja de publicarse; la web interna solo es accesible desde Caddy). HTTPS
desbloquea en el móvil el **GPS/modo explorador** y la **instalación como PWA** (los navegadores
exigen contexto seguro), requisito previo para generar el APK (TWA/PWABuilder).

### Qué necesitas contratar/configurar (una vez)

1. **Un VPS** con IP pública y Docker instalado (Hetzner, DigitalOcean, OVH… los planes básicos de
   ~4-6 €/mes sobran para esta app). Sistema recomendado: Ubuntu LTS + Docker Engine.
2. **Un dominio** (~10-15 €/año en Namecheap, Cloudflare, OVH, DonDominio…). Vale también un
   subdominio si ya tienes dominio.
3. **DNS:** crea un registro `A` del dominio (o subdominio, p. ej. `naturdex.tudominio.com`)
   apuntando a la IP pública del VPS. Comprueba que resuelve antes de arrancar
   (`nslookup naturdex.tudominio.com`).
4. **Puertos 80 y 443 abiertos** en el firewall del VPS (y en el panel del proveedor si tiene
   firewall propio). El 80 hace falta aunque todo redirija a HTTPS: lo usa Let's Encrypt para
   validar el dominio.

### Arrancar en producción

```bash
# En el VPS, con el repositorio clonado:
cp .env.example .env
#    edita .env: contraseñas fuertes + DOMAIN=naturdex.tudominio.com

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Caddy pide el certificado en el primer arranque (segundos). Comprueba:

```bash
curl -I http://TU_DOMINIO     # → 308 Permanent Redirect a https://
curl -I https://TU_DOMINIO    # → 302 a /Frontend/index.html, certificado válido
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f caddy   # logs del proxy
```

Los certificados persisten en el volumen `caddy_data`: reiniciar o reconstruir no vuelve a pedirlos
(Let's Encrypt tiene límites de emisión). Para parar/actualizar, usa siempre los dos `-f` para que
Compose no mezcle el override local.

### Probar el despliegue de producción en tu PC (sin dominio)

Con `DOMAIN=localhost` en `.env`, Caddy usa su **CA interna** en vez de Let's Encrypt: obtienes el
mismo HTTPS + redirección en `https://localhost`, solo que el navegador avisará de que el
certificado no es de confianza (acepta el aviso, o usa `curl -k`). Sirve para verificar el flujo
completo (redirección, cookie `Secure`, login) antes de tener servidor.

```bash
DOMAIN=localhost docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
curl -kI https://localhost
```

### Sesión y contraseñas

- La cookie de sesión lleva `Secure` automáticamente en este despliegue (lo monta
  `docker-compose.prod.yml`); no hay que editar `docker/php.ini`.
- Cambia las contraseñas de `.env` por valores fuertes y no subas `.env` al repositorio
  (ya está en `.gitignore`).
- Cuando el dominio sea definitivo, valora descomentar la cabecera `Strict-Transport-Security` en
  [`docker/Caddyfile`](docker/Caddyfile).

## Notas

- El frontend y la API se sirven desde el mismo origen (requisito del frontend, que llama a la API
  por ruta relativa). La raíz `/` redirige a `/Frontend/index.html`.
- El progreso de cada usuario se guarda en la tabla `user_progress` de MySQL (no en ficheros), así
  que persiste en el volumen `db_data`.
- El panel de administración (`/Frontend/admin/`) requiere una cuenta con `role = 'admin'` en la
  base de datos. Es una aplicación React (código fuente en `AdminPanel/`) compilada a
  `Frontend/admin/`; el resultado compilado va en el repositorio, así que solo hay que recompilar
  (`npm run build` dentro de `AdminPanel/`) cuando se toque su código (ver `AdminPanel/README.md`).
- Las teselas del mapa base (OpenStreetMap / PNOA) y Leaflet se cargan desde sus CDNs: el servidor
  necesita salida a internet para que el mapa se vea (la geometría del parque sí es local).
