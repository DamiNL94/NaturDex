# db-sync · sincronización BD contenedor ↔ repositorio

Mantiene alineadas dos representaciones de la base de datos de NaturDex:

- **La BD viva**: el contenedor MySQL de Docker (servicio `db`, base `naturadex`).
- **La BD local del repo**: los ficheros curados `Database/schema.sql` (estructura) y
  `Database/seed.sql` (catálogo del parque piloto + cuenta admin).

## Idea

```
Database/schema.sql ┐                     ┌─────────────────────────┐
Database/seed.sql   ├──── push ──────────▶│  contenedor MySQL       │
(fuente curada)     ┘                     │  naturadex (datos vivos)│
                    ▲                     └───────────┬─────────────┘
                    │                                 │
Database/snapshot.sql ◀──────── pull ─────────────────┘
(volcado automático, diffeable en git)
```

- **`push`** (repo → contenedor): aplica `schema.sql` + `seed.sql` a la BD viva. Ambos son
  idempotentes (`CREATE ... IF NOT EXISTS`, `INSERT ... ON DUPLICATE KEY UPDATE`), así que
  actualizan/crean sin duplicar. Hace una **copia de seguridad automática** antes.
- **`pull`** (contenedor → repo): vuelca la BD viva a `Database/snapshot.sql`, un fichero
  determinista y ordenado. `git diff Database/snapshot.sql` muestra **exactamente** qué cambió en
  el contenedor (p. ej. lo que editaste desde el panel de administración de la app).
- **`status`**: informa de la deriva — qué tablas difieren entre el contenedor y el `seed.sql`, y si
  `snapshot.sql` está desactualizado.
- **`backup`**: copia de seguridad con marca de tiempo en `Tools/db-sync/backups/` (no se versiona).

### ¿Por qué `pull` no reescribe `seed.sql`?

`seed.sql` está curado a mano: comentarios, fuentes por registro, orden lógico e inserts
idempotentes. Regenerarlo desde un volcado destruiría todo eso. Por eso `pull` escribe un fichero
aparte (`snapshot.sql`) pensado para **revisar el diff** y decidir qué incorporar al `seed.sql`.
Así la sincronización es bidireccional pero siempre pasa por una revisión humana en el sentido
contenedor → repo, que es donde importa no perder la curación.

## Uso

Requiere **Node.js** y el contenedor de la BD levantado (`docker compose up -d db`).

```bash
# Windows (PowerShell)
.\Tools\db-sync\db-sync.ps1 status
.\Tools\db-sync\db-sync.ps1 pull
.\Tools\db-sync\db-sync.ps1 push

# Git Bash / Linux / macOS
./Tools/db-sync/db-sync.sh status

# Directo con Node (cualquier plataforma)
node Tools/db-sync/db-sync.js status
```

## Flujos habituales

| Situación | Comando |
|-----------|---------|
| Editaste datos en la app (contenedor) y quieres verlos en el repo | `db-sync pull` → `git diff Database/snapshot.sql` → incorpora al `seed.sql` lo que proceda |
| Editaste `schema.sql`/`seed.sql` y quieres aplicarlo a la BD viva | `db-sync push` |
| ¿Están sincronizados contenedor y repo? | `db-sync status` |
| Copia de seguridad puntual | `db-sync backup` |

## Pull automático (hook de git)

Para no tener que acordarte de ejecutar `pull`, hay un hook de **pre-commit** que, antes de cada
commit, vuelca el estado vivo del contenedor a `Database/snapshot.sql` y lo incluye en el commit.
Así cada commit captura automáticamente lo que hayas cambiado en la BD desde la app.

Ya viene activado en este repo (`core.hooksPath = .githooks`). Si clonas de cero, actívalo con:

```bash
npm run hooks:install        # equivale a: git config core.hooksPath .githooks
```

- Es **tolerante a fallos**: si Docker o el contenedor no están activos, **no bloquea** el commit.
- Para saltarlo puntualmente: `git commit --no-verify`.
- El hook vive en `.githooks/pre-commit` (versionado, a diferencia de `.git/hooks/`).

## Scripts npm

```bash
npm run db:status   # = node Tools/db-sync/db-sync.js status
npm run db:pull
npm run db:push
npm run db:backup
```

## Notas

- Todos los comandos `mysql`/`mysqldump` se ejecutan **dentro** del contenedor usando su propia
  `MYSQL_ROOT_PASSWORD`. No hace falta publicar el puerto de MySQL ni tener la contraseña en el host.
- El contenedor se detecta con `docker compose ps -q db`. Para forzar otro, exporta
  `NATURDEX_DB_CONTAINER=<nombre_o_id>`.
- `status` compara **contenido** (ignora `id`, `created_at`, `updated_at`), no las claves
  subrogadas, así que un `AUTO_INCREMENT` distinto no cuenta como deriva.
- `push --yes` omite la copia de seguridad previa (para scripts). Sin `--yes`, siempre hace backup.
