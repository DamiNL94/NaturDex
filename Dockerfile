# NaturDex — imagen web (Apache + PHP 8.2 sobre Alpine) que sirve el frontend estático y la API PHP
# desde el mismo origen. La base de datos MySQL va en un contenedor aparte (ver docker-compose.yml).
#
# Se usa Alpine (no la imagen Debian php:apache) porque su base mínima arrastra muchísimas menos
# CVE de sistema. Se mantiene PHP 8.2 (php82-*) para no cambiar la versión del lenguaje.
FROM alpine:3.22

# Apache con mod_php y solo las extensiones que usa la app:
#   mysqli  -> acceso a la BD (la API usa mysqli, no PDO)
#   session -> login/sesión (auth.php, progress.php)
#   opcache -> rendimiento
# (json y filter van compilados en el core de PHP 8 en Alpine; no necesitan paquete aparte.)
RUN apk add --no-cache \
        apache2 \
        php82-apache2 \
        php82-mysqli \
        php82-session \
        php82-opcache \
    && mkdir -p /run/apache2

# Config de Apache (DocumentRoot, redirección a /Frontend/, reglas de seguridad) y de PHP
# (endurecido). En Alpine, Apache lee /etc/apache2/conf.d/*.conf y PHP /etc/php82/conf.d/*.ini.
COPY docker/apache.conf /etc/apache2/conf.d/naturdex.conf
COPY docker/php.ini /etc/php82/conf.d/zz-naturdex.ini

# Código de la aplicación. Lo que no debe entrar en la imagen se excluye en .dockerignore
# (credenciales, volcados SQL, utilidades de CLI, datos de runtime, docs).
COPY . /var/www/html/

# La carpeta docker/ solo trae config de build (ya copiada arriba): no debe quedar bajo el webroot.
# El servidor web corre como el usuario 'apache' en Alpine: necesita escribir el directorio de datos
# de runtime y el park.json que exporta el panel de administración (Frontend/Data).
RUN rm -rf /var/www/html/docker \
    && mkdir -p /var/www/html/Backend/Data \
    && chown -R apache:apache /var/www/html/Backend/Data /var/www/html/Frontend/Data

EXPOSE 80

# Apache en primer plano (PID 1 del contenedor).
CMD ["httpd", "-D", "FOREGROUND"]
