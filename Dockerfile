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

# Código de la aplicación. Lo que no debe entrar en la imagen se excluye en .dockerignore.
COPY . /var/www/html/

# El servidor web (www-data) necesita poder escribir el progreso legado y el park.json que exporta
# el panel de administración.
RUN chown -R www-data:www-data /var/www/html/Backend/Data /var/www/html/Frontend/Data

EXPOSE 80
