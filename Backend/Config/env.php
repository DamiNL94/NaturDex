<?php
// ================================================================================================
// env.php — la ÚNICA lectura de credenciales y configuración desde el entorno.
// ------------------------------------------------------------------------------------------------
// Vivía dentro de db.php, que es donde nació (las credenciales de MySQL). Se sacó aquí cuando
// apareció el segundo consumidor —AEMET_API_KEY, para Api/tiempo.php— porque incluir db.php solo
// para leer una variable de entorno ABRE LA CONEXIÓN A MYSQL como efecto secundario, y con eso un
// endpoint que no toca la base se cae con la base. La alternativa era copiar la función, que es
// justo cómo se rompen las cosas en este repo: dos copias de una lectura de configuración divergen
// a la primera variante que se añada en una y no en la otra.
//
// Se consultan getenv(), $_ENV y $_SERVER porque, según cómo se pase la variable al proceso
// (entorno del contenedor, SetEnv/PassEnv de Apache, php-fpm...), acaba en unos sitios u otros.
// ================================================================================================

/** Valor de la primera variable de entorno definida y no vacía de la lista, o null. */
if (!function_exists("naturdex_env")) {
    function naturdex_env(array $names) {
        foreach ($names as $name) {
            foreach ([getenv($name), $_ENV[$name] ?? false, $_SERVER[$name] ?? false] as $value) {
                if (is_string($value) && $value !== "") return $value;
            }
        }
        return null;
    }
}
