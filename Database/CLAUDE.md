# `Database/` — qué es fuente y qué es generado

Lo primero, porque es lo que más se rompe: **la mayoría de estos ficheros son salida de una
herramienta, no fuente.** Editar uno a mano y luego relanzar su generador borra el cambio en
silencio.

## Fuente — se editan a mano

| Fichero | Tamaño | Qué es |
|---|---|---|
| `schema.sql` | 24 K | **El DDL.** La definición de las tablas. Toda columna nueva pasa por aquí |
| `migrations.sql` | 32 K | `ALTER` e `INSERT … SELECT` **idempotentes** para actualizar una instalación antigua. Se aplica antes que nada. Abre con `SET NAMES utf8mb4`: sin eso, el texto con tilde que INSERTE entra doblemente codificado |

## Generado — **no se editan a mano**

| Fichero | Tamaño | Lo genera |
|---|---|---|
| `species-universal.sql` | 416 K | `npm run species:apply` (`Tools/sync-species-catalog.js`) |
| `habitats-universal.sql` | 28 K | `npm run habitats:apply` (`Tools/sync-habitat-catalog.js`) |
| `habitats-imagenes.sql` | 4 K | `Tools/catalogo-nacional/habitat-images.js` |
| `invasoras-contenido.sql` | 64 K | `npm run contenido:invasoras` |
| `invasoras-imagenes.sql` | 8 K | `Tools/catalogo-nacional/invasoras-images.js` |
| `poi-imagenes.sql` | 8 K | `npm run images:pois` (`poi-images.js`). **Con `--park <slug>` reescribe el fichero SOLO con las sentencias de ese espacio**: las de los demás, ya aplicadas, hay que conservarlas |
| `n3-pois-<slug>.sql` | — | `npm run pois:sql -- --park <slug>` (`build-poi-sql.js`) |
| `<slug>-n2.sql` | — | `npm run park:sql -- --park <slug>` (`build-park-sql.js`). **Se aplica ANTES que el de POIs**: trae la fila de `parks`, y sin ella todo lo demás carga cero filas en silencio. **Solo hace UPSERT**, así que no retira nada: tras un renombrado deja la ficha vieja en la base con su `id` — ver `poda-renombrados-*.sql` |
| `poda-aves-<slug>.sql` | — | `npm run aves:poda -- --park <slug> --sql <ruta>`. **Borrados**, que el UPSERT de `park:sql` no puede generar. Se aplican DESPUÉS del `-n2.sql` del espacio |
| `enlaces-retirados-<slug>.sql` | — | `npm run especies:habitats:aplica -- --sql`. **Borrados de `species_habitats`** que la auditoría de enlaces retiró del `park.json`: el UPSERT de `park:sql` no los quita. No tocan ninguna ficha ni ninguna cita de usuario, solo el vínculo. Se aplican DESPUÉS del `-n2.sql` del espacio |
| `poda-recombinaciones.sql` | 12 K | `npm run taxones:recombinaciones -- --write --sql Database/poda-recombinaciones.sql`. Retira los VEINTE nombres viejos que dejó el renombrado de recombinaciones del 2026-08-28 (deuda nº 36) en once espacios. Va DESPUÉS de los `-n2.sql`, que son quienes dan de alta el nombre nuevo; el UPSERT no puede retirar el viejo. Respeta las fichas con observaciones de usuario y lo dice antes con un SELECT. Idempotente |
| `poda-exclusiones-<slug>.sql` | — | `npm run especies:exclusiones -- --write --sql auto` (`aplica-exclusiones.js`). **Borrados** de las fichas que `data/exclusiones-especies.json` excluye a mano y que se habían publicado antes de que se escribiera la exclusión. Lleva dentro el motivo copiado del fichero de exclusiones, y **un SELECT ANTES del DELETE** que dice cuántas filas de `observations` se llevaría la cascada. Va DESPUÉS del `-n2.sql` del espacio |
| `poda-renombrados-<slug>.sql` | — | Escrito a mano, una vez, con la lista revisada delante. Retira las fichas que un renombrado dejó huérfanas en la base y el UPSERT no puede tocar |
| `ida-y-vuelta.sql` | — | `npm run ida-y-vuelta -- --sql Database/ida-y-vuelta.sql`. Rellena las cuatro columnas que se abrieron el 2026-08-27 para que la exportación desde la API deje de borrar dato (deuda nº 3): `species.gbif_occurrences` y `habitats.origen` / `fuentes` / `solo_curada`. Desde el 2026-09-11 lleva también las **pistas de identificación** de las 1.408 fichas que tienen, en su formato nuevo (array JSON): `migrations.sql` convierte en su sitio lo que ya había, pero no puede saber qué «;» era de la pista y cuál separaba dos, y el dato bueno está en el repositorio. Va DESPUÉS de `migrations.sql`, que es quien crea las columnas y convierte el formato |
| `regional-ccaa.sql` | 4 K | `node Tools/catalogo-nacional/migra-estado-regional.js --write --sql Database/regional-ccaa.sql`. Rellena `regional_ccaa` (deuda nº 2), **una sentencia por espacio y no por ficha**: la comunidad es del espacio, no del taxón. Va DESPUÉS de `migrations.sql`, que es quien renombra la columna conservando los textos |
| `rareza-local.sql` | — | `npm run especies:rareza -- --destacadas --sql Database/rareza-local.sql`. Los tres campos LOCALES del tramo de rareza (`rarity_local`, `rarity_local_basis`, `is_featured`), que **NO viajan en `species-universal.sql`** porque ése solo lleva los universales. Existe para no tener que regenerar el `-n2.sql` entero de un espacio publicado, que es la trampa nº 6 del CLAUDE.md. Una ficha sin tramo se pone a NULL a propósito. Idempotente |
| `identificadores-taxonomicos.sql` | 4 K | `npm run taxones:identificadores -- --write --sql Database/identificadores-taxonomicos.sql`. Realinea `eidos_taxonid` y `gbif_species_key` en siete fichas de dos espacios (deuda nº 4). **No borra nada**: no hay renombrado, así que no deja fila huérfana. Va DESPUÉS del `-n2.sql` de cada espacio. Idempotente |
| `parks-tiempo.sql` | 4 K | `npm run tiempo:municipios -- --write --sql Database/parks-tiempo.sql` (`Tools/resuelve-municipio-aemet.js`). Rellena las cuatro columnas `weather_*` de `parks`: el código INE del municipio de referencia para la predicción de AEMET y su procedencia. **Sin aplicarlo, un despliegue con backend no pinta el widget del tiempo** aunque el código esté en los `park.json`: la API manda sobre el paquete. Va DESPUÉS de `migrations.sql`, que es quien crea las columnas. Idempotente (un `UPDATE` por espacio) |
| `retira-conservation-status.sql` | 4 K | Escrito a mano el 2026-09-14. `ALTER TABLE species DROP COLUMN conservation_status` — **borra dato**. Es el mismo DROP que lleva `migrations.sql`, suelto y **sin `DELIMITER`**, porque `import-sql.php` manda el fichero con `multi_query` y `DELIMITER` es una directiva del cliente `mysql`, no del servidor: los procedimientos auxiliares de la migración **no pasan por esa vía**. Idempotente (comprueba `information_schema`). Va DESPUÉS de los `<slug>-n2.sql` regenerados |
| `renombra-poi-playa-charco.sql` | 4 K | Escrito a mano el 2026-08-25 (b). `playa-Charco` → `playa-charco` en la fila viva (deuda nº 18). **Hace falta porque `build-poi-sql.js` hace UPSERT por `slug`**: aplicar el N3 con el slug nuevo no renombraría nada, daría de alta un SEGUNDO POI. Va ANTES de cualquier `n3-pois-cabo-cope-puntas-calnegre.sql` posterior. Idempotente |
| `glosario.sql` | 40 K | `npm run contenido:sql` (`Tools/contenido-sql.js`), desde `Frontend/Data/glosario.json`. Existe porque las dos tablas de contenido transversal solo viajaban BD → JSON y lo añadido desde el piloto nunca llegaba a la base desplegada: Railway servía **86 de 219** términos el 2026-09-14, respondiendo 200 y sin que fallara nada (la PWA cae al fichero empaquetado). **Aditivo**: `ON DUPLICATE KEY UPDATE` sobre `term`, no retira. Ojo, que esa clave única es `utf8mb4_unicode_ci` y **ignora los acentos**: dos términos del JSON pueden ser una sola fila, así que cuenta las filas después |
| `invasoras.sql` | 69 K | `npm run contenido:sql`, desde `Frontend/Data/invasoras.json`. Las 26 fichas completas, aditivas sobre `(scientific_name, ccaa)`. Es lo que dio de alta el arruí (*Ammotragus lervia*), que solo estaba en el JSON. No sustituye a `invasoras-contenido.sql` ni a `invasoras-imagenes.sql`, que son UPDATE de campos concretos |
| `seed.sql` | 692 K | Volcado de datos de arranque |
| `snapshot.sql` | 692 K | Volcado completo de la BD viva. **Trae su propio `CREATE TABLE`**, así que sigue nombrando `murcia_status`: es el retrato de una base anterior al renombrado del 2026-08-27 y no se toca. Restaurarlo y pasarle después `migrations.sql` deja la columna con el nombre nuevo y los datos intactos. `seed.sql` **sí** se renombró, porque NO trae DDL: se carga sobre las tablas de `schema.sql` y con el nombre viejo abortaría con ERROR 1054 |

## Cargas puntuales ya aplicadas — histórico

Se conservan por trazabilidad. **No los relances sin leer su cabecera**: son la carga concreta de una
sesión, no un script reejecutable en cualquier estado.

| Fichero | Tamaño | Qué cargó |
|---|---|---|
| `sierra-espuna-n2.sql` | 920 K | N2 de Sierra Espuña: fila en `parks`, 13 hábitats con geometría, 190 especies, 703 enlaces (2026-08-08) |
| `cuatro-calas-n2.sql` | 264 K | N2 de Cuatro Calas |
| `n3-pois-cuatro-calas-sierra-espuna.sql` | 16 K | Los POIs de la Fase 3 de ambos espacios |
| `recolocar-pois.sql` | 8 K | Corrección de coordenadas de POIs |
| `*.pre_iepnb_backup` | — | Copias previas a la corrección IEPNB. Solo referencia |

---

## Reglas

0. **Todo `.sql` de aquí abre con `SET NAMES utf8mb4`, y no es decorativo.** El cliente `mysql` toma
   su juego de caracteres del entorno, y en un contenedor sin locale eso es **latin1**: con el cliente
   en latin1 y la columna en utf8mb4, «Jabalí» entra en la base como «JabalÃ­». **No falla nada** — el
   INSERT va bien, los contadores cuadran y `validate` no mira dentro de la BD.
   > Estaba escrito solo para `migrations.sql`, que es donde se descubrió el 2026-08-15, y **no se
   > miró quién más tenía el mismo agujero**: eran **catorce ficheros**, entre ellos
   > `species-universal.sql`, que actualiza el nombre común de las 1.501 fichas del catálogo. Se
   > destapó el 2026-08-16 al cargarlo todo en un MySQL de verdad y comparar campo a campo — 143
   > nombres comunes corruptos de los primeros 812 comparados. La línea la pone ahora
   > `cabeceraSql()` de `Tools/lib/sql.js`, para que no dependa de que cada generador se acuerde.
1. **La API tiene prioridad sobre el `park.json` empaquetado.** Con backend desplegado, tocar solo
   los ficheros de `Frontend/` no cambia lo que ve el usuario: hay que generar **y aplicar** el SQL.
   Es el punto 3 de [`Docs/runbook/ORDEN-DE-OPERACIONES.md`](../Docs/runbook/ORDEN-DE-OPERACIONES.md).
2. **El pipeline de hábitats sigue sin escribir aquí** —`adopt-habitats.js` toca `Frontend/` y nada
   más—, pero desde el 2026-08-27 **lo que escribe ya no se pierde** al exportar: `origen`, `fuentes`
   y `solo_curada` tienen columna (deuda nº 3), y `npm run ida-y-vuelta` comprueba que no aparezca un
   campo nuevo sin ella. Lo que falta es que el pipeline genere su propio SQL, no que el dato quepa.
3. **La contraseña va por `MYSQL_PWD`**, nunca en la línea de órdenes (`Tools/lib/db.js` ya lo hace).
4. Tras editar en el panel de administración, regenera el empaquetado con
   `npm run export:park -- <slug>` y **sube `manifest.version`**, o el offline no revalida.
5. **`user_occurrences` es la capa científica, no una copia del progreso.** Sus columnas son términos
   Darwin Core (`class` y `order` necesitan comillas invertidas: son palabras reservadas). Se deriva
   de `user_progress` y de `user_invasive_sightings`, que siguen siendo lo que la app lee. Antes de
   aplicar su migración, `npm run db:backup`: toca datos de usuario. Ver
   [`Docs/DARWIN-CORE.md`](../Docs/DARWIN-CORE.md).
6. **`species.identification_tips` guarda un array JSON dentro de una columna TEXT**, no las pistas
   unidas con «;»: una pista puede llevar un punto y coma propio, y volvía de la API partida en dos
   (2026-09-11). **No la pases a tipo JSON ni le pongas un CHECK**: `seed.sql` trae el formato viejo y
   el contenedor lo carga en la primera instalación sin pasar por `migrations.sql` —y `db-sync push` lo
   reaplica—, así que la base dejaría de arrancar. Por eso la API lee los dos formatos
   (`Backend/Lib/species_tips.php`). Un `.sql` escrito a mano con pistas va con `sqlTips()` de
   `Tools/lib/sql.js`, nunca con un `join`. **Y ojo, que el cambio va en dos tiempos** (2026-09-21):
   el lector que entiende los dos formatos se despliega primero, y solo después `PISTAS_EN_JSON` de
   `Tools/lib/sql.js` pasa a `true` y los generadores empiezan a escribir JSON. Mientras esté en
   `false`, la base sigue en «; » a propósito. El procedimiento está en `Docs/runbook/APLICAR-A-RAILWAY.md`.

## Aplicar

```bash
docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/<fichero>.sql
php Tools/import-sql.php <fichero>.sql          # contra una BD remota
npm run db:status / :pull / :push / :backup     # sincronización con el contenedor
```

**Por la vía remota hay que anteponer `USE \`naturadex\`;`**: `import-sql.php` conecta sin base
seleccionada a propósito y ningún fichero de esta carpeta la nombra, así que tal cual falla con «No
database selected». La secuencia entera, con el orden y las comprobaciones, está en
[`Docs/runbook/APLICAR-A-RAILWAY.md`](../Docs/runbook/APLICAR-A-RAILWAY.md).

> Los volcados grandes (`seed`, `snapshot`, `species-universal`, `*-n2`) están excluidos de la
> búsqueda en `.ignore`: son datos, no código. `schema.sql` y `migrations.sql` **sí** se buscan.
