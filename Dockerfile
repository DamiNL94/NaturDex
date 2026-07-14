# NaturDex — imagen web (PHP + Apache) que sirve el frontend estático y la API PHP desde el mismo
# origen. La base de datos MySQL va en un contenedor aparte (ver docker-compose.yml).
FROM php:8.2-apache

# Extensión mysqli (la API usa mysqli, no PDO) y mod_rewrite de Apache.
RUN docker-php-ext-install mysqli \
    && a2enmod rewrite

# Configuración de Apache (raíz del proyecto como DocumentRoot, redirección a /Frontend/) y de PHP
# (endurecido de la sesión).
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/naturdex.ini

# Código de la aplicación. Lo que no debe entrar en la imagen se excluye en .dockerignore
# (credenciales, volcados SQL, utilidades de CLI, datos de runtime, docs).
COPY . /var/www/html/

# La carpeta docker/ solo contiene config de build (ya copiada arriba a sus destinos): no debe
# quedar servida bajo el webroot.
RUN rm -rf /var/www/html/docker

# Directorio de datos de runtime (excluido de la copia) y permisos de escritura para el servidor
# web (www-data): el park.json que exporta el panel de administración se escribe en Frontend/Data.
RUN mkdir -p /var/www/html/Backend/Data \
    && chown -R www-data:www-data /var/www/html/Backend/Data /var/www/html/Frontend/Data

EXPOSE 80
