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
| `<slug>-n2.sql` | — | `npm run park:sql -- --park <slug>` (`build-park-sql.js`). **Se aplica ANTES que el de POIs**: trae la fila de `parks`, y sin ella todo lo demás carga cero filas en silencio. Los de Cuatro Calas y Sierra Espuña son anteriores al generador y siguen en «cargas puntuales» |
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
