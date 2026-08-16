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
| `poda-renombrados-<slug>.sql` | — | Escrito a mano, una vez, con la lista revisada delante. Retira las fichas que un renombrado dejó huérfanas en la base y el UPSERT no puede tocar |
| `seed.sql` | 692 K | Volcado de datos de arranque |
| `snapshot.sql` | 692 K | Volcado completo de la BD viva |

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
2. **El pipeline de hábitats no escribe aquí.** `adopt-habitats.js` toca `Frontend/` y nada más, así
   que un export desde la API borraría sus cambios sin avisar. Es la deuda nº 2.
3. **La contraseña va por `MYSQL_PWD`**, nunca en la línea de órdenes (`Tools/lib/db.js` ya lo hace).
4. Tras editar en el panel de administración, regenera el empaquetado con
   `npm run export:park -- <slug>` y **sube `manifest.version`**, o el offline no revalida.
5. **`user_occurrences` es la capa científica, no una copia del progreso.** Sus columnas son términos
   Darwin Core (`class` y `order` necesitan comillas invertidas: son palabras reservadas). Se deriva
   de `user_progress` y de `user_invasive_sightings`, que siguen siendo lo que la app lee. Antes de
   aplicar su migración, `npm run db:backup`: toca datos de usuario. Ver
   [`Docs/DARWIN-CORE.md`](../Docs/DARWIN-CORE.md).

## Aplicar

```bash
docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/<fichero>.sql
php Tools/import-sql.php <fichero>.sql          # contra una BD remota
npm run db:status / :pull / :push / :backup     # sincronización con el contenedor
```

> Los volcados grandes (`seed`, `snapshot`, `species-universal`, `*-n2`) están excluidos de la
> búsqueda en `.ignore`: son datos, no código. `schema.sql` y `migrations.sql` **sí** se buscan.
