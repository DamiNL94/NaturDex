# NaturDex

Guía ambiental virtual de los espacios naturales protegidos de España. Una PWA orientada a móvil que
funciona sin cobertura: mapa con los límites oficiales, catálogo de hábitats y especies, fichas
divulgativas, y una mecánica tipo pokédex en la que descubrir una especie exige **estar allí** (la
posición se verifica contra el límite oficial del espacio).

> **Este README es la portada y el índice.** Lo que antes venía aquí entero —el modelo de datos, la
> procedencia de cada campo, el runbook, las trampas— vive ahora en `Docs/`, un documento por tema.
> Así se lee (y se carga en una sesión de IA) solo lo que hace falta. El mapa completo está en
> [§4 Dónde está cada cosa](#4-dónde-está-cada-cosa).
>
> Si estás retomando el proyecto: lee `CLAUDE.md` primero — es el resumen operativo en dos páginas.

## Estado (2026-08-10)

| | |
|---|---|
| Espacios dados de alta | **16** de los 21 de la Región de Murcia (4 descartados por reglas de producto, 1 retirado) |
| Con catálogo completo (**N2** o más) | 4 — Cabo Cope y Puntas de Calnegre (15 hábitats · 175 especies · 15 POIs), Sierra Espuña (13 · 188 · 13), Cuatro Calas (7 · 102 · 4), Carrascoy y El Valle (15 · 146 · 0) |
| Con ficha base (**N1**) | 12 — límite oficial y Red Natura 2000, sin catálogo |
| Catálogo universal de especies | **350** fichas distintas reutilizadas entre espacios |
| Invasoras · glosario · logros | 26 · 219 términos · 52 logros |
| Comunidades autónomas cubiertas | 1 de 17 |

El ledger espacio por espacio, con códigos ENP y huecos conocidos, está en
[`Docs/rollout/ESTADO.md`](Docs/rollout/ESTADO.md).

---

## 1. Arranque rápido

```bash
# Entorno completo (PHP + MySQL + Caddy)
cp .env.example .env       # las contraseñas son OBLIGATORIAS: sin ellas `up` falla a propósito
docker compose up -d       # la app queda en http://localhost:${WEB_PORT:-8080}
docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4' < Database/schema.sql
docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/seed.sql

# Solo el frontend. Basta para casi todo el trabajo de datos: la app es offline-first y lee los
# park.json empaquetados; el backend es una mejora, no un requisito.
php -S localhost:8000 -t Frontend

npm install          # una sola dependencia: polygon-clipping
npm run validate     # red de seguridad de los datos empaquetados — TIENE que salir en verde
npm run hooks:install
```

Para actualizar una instalación antigua: `Database/migrations.sql` antes que nada (son `ALTER`
idempotentes). Despliegue: [`DEPLOY.md`](DEPLOY.md). Despliegue estático sin backend:
[`Docs/DESPLIEGUE_ESTATICO.md`](Docs/DESPLIEGUE_ESTATICO.md).

### Comprobaciones

| Comando | Qué es | ¿Bloquea? |
|---|---|---|
| `npm run validate` | Los datos empaquetados de los 16 espacios: contadores, referencias, límites | **Sí**, y también en `pre-commit` |
| `npm test` | Reglas de verificación de presencia y progreso (PHP, sin BD) | Sí |
| `npm run typecheck` | `tsc --noEmit` sobre el AdminPanel | Sí |
| `npm run glossary:check` | Tecnicismos nuevos sin definición en el glosario | No, es editorial |
| `npm run taxones:duplicados` | El mismo taxón dado de alta con dos nombres | No |

El catálogo completo de comandos está en [`Docs/COMANDOS.md`](Docs/COMANDOS.md).

### Trabajar a distancia (Claude Code on the web)

`.claude/hooks/session-start.sh` prepara la sesión remota: instala las dependencias de la raíz y del
AdminPanel y activa `core.hooksPath`. Solo actúa si `CLAUDE_CODE_REMOTE=true`, así que en local no
toca nada. Tarda ~11 s la primera vez y ~1 s después, porque el contenedor queda cacheado.

Lo que **no** puede arreglar el repo es la política de egreso del entorno, que decide a qué hosts se
puede salir. Casi todo `Tools/` vive de fuentes externas —Wikimedia, GBIF, Overpass, EIDOS, IMIDA,
IGME, Protomaps— y con la política restringida fallan con errores de red que no explican nada:

```bash
npm run red:check                       # qué fuentes están abiertas hoy y qué se rompe sin ellas
node Tools/check-egress.js --allowlist  # los hosts cerrados, para pegarlos en los ajustes
```

Pregunta por `CONNECT` al proxy, así que distingue una denegación de política de una caída del
servicio. La lista de hosts vive en `Tools/check-egress.js`: si añades una fuente nueva a una
herramienta, añádela también ahí.

---

## 2. Mapa del repositorio

```
Frontend/            PWA (sin framework, sin build). Módulos ES en Js/, datos empaquetados en Data/
  Data/parks-index.json          registro: comunidad → provincia → espacios, con su `status`
  Data/parks/<prov>/<slug>/      park.json + manifest.json + geo/*.geojson + tiles/base.pmtiles
  Js/                            ver Frontend/Js/CLAUDE.md — índice módulo a módulo
  sw.js                          Service Worker (network-first). Su lista SHELL_ASSETS hay que
                                 mantenerla al día: un módulo nuevo sin precachear rompe el offline
Backend/             API PHP + MySQL — ver Backend/CLAUDE.md
AdminPanel/          panel de administración (React+Vite) → se compila a Frontend/admin/
Database/            schema.sql (DDL) · seed.sql (datos) · migrations.sql (ALTER idempotentes)
                     ver Database/CLAUDE.md: qué fichero es fuente y cuál es generado
Tools/               tooling zero-dep (salvo polygon-clipping) — ver Tools/CLAUDE.md
Docs/                documentación temática — ver §4 abajo
```

Cada carpeta con `CLAUDE.md` trae su propio índice fichero a fichero. **Ese es el sitio por el que
empezar**, no un `ls` ni una búsqueda a ciegas.

---

## 3. Las tres ideas que lo gobiernan todo

Lo mínimo para no romper nada. El desarrollo está en
[`Docs/arquitectura/MODELO-DE-DATOS.md`](Docs/arquitectura/MODELO-DE-DATOS.md).

1. **Ninguna base de datos oficial dice «la especie X vive en el polígono de hábitat Y».** Ese
   vínculo siempre es **derivado**: se construye cruzando dos señales y guardando de dónde sale cada
   una (columna `evidence` de `species_habitats`). Todo lo demás —límites, hábitats, taxonomía,
   estado de conservación— sí es dato oficial directo.
2. **Ante la duda, hueco documentado antes que dato inventado.** Un `reviewNote` visible en la app
   vale más que un campo relleno a ojo.
3. **Las especies y los hábitats son nacionales, no del parque.** El contenido se parte en universal
   (lo que la especie o el código HIC *es*) y local (cómo aparece *aquí*). Un texto universal que
   nombre un espacio concreto es un **error** para el validador, no un aviso.

---

## 4. Dónde está cada cosa

### Arquitectura y modelo

| Documento | Contenido |
|---|---|
| [`Docs/arquitectura/MODELO-DE-DATOS.md`](Docs/arquitectura/MODELO-DE-DATOS.md) | Los tres niveles (N1/N2/N3), las tres capas, universal vs. local |
| [`Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md`](Docs/arquitectura/PROCEDENCIA-DE-CAMPOS.md) | **Campo a campo**: de dónde sale, cómo se obtiene, quién lo verifica. URLs y claves de las fuentes |
| [`Docs/arquitectura/APLICACION.md`](Docs/arquitectura/APLICACION.md) | Decisiones de producto en producción: flujo, cabecera, grupos de hábitat, navegación, offline |
| [`Docs/ESCALABILIDAD.md`](Docs/ESCALABILIDAD.md) | Arquitectura de crecimiento |

### Operar: dar de alta un espacio

| Documento | Contenido |
|---|---|
| [`Docs/runbook/ALTA-DE-ESPACIO.md`](Docs/runbook/ALTA-DE-ESPACIO.md) | **El runbook.** Fase 1 (N1) y Fase 2 (N2) paso a paso, definición de «terminado», checklist de cierre |
| [`Docs/runbook/TRAMPAS-CONOCIDAS.md`](Docs/runbook/TRAMPAS-CONOCIDAS.md) | Cada una costó una sesión de depuración. **Léelas antes de repetirlas** |
| [`Docs/runbook/ORDEN-DE-OPERACIONES.md`](Docs/runbook/ORDEN-DE-OPERACIONES.md) | Las tres dependencias entre herramientas que **fallan en verde** |
| [`Docs/COMANDOS.md`](Docs/COMANDOS.md) | Todos los `npm run` y qué hace cada uno |
| [`Docs/rollout/PARAMETROS-POR-PROVINCIA.md`](Docs/rollout/PARAMETROS-POR-PROVINCIA.md) | Huso UTM verificado y descargas del MITECO por provincia. **Paso 0 de una Fase 2** |
| [`Docs/prompts/e-rollout-nacional.md`](Docs/prompts/e-rollout-nacional.md) | Guion operativo: qué se pega en cada sesión y en qué orden |

### Estado e histórico

| Documento | Contenido |
|---|---|
| [`Docs/rollout/ESTADO.md`](Docs/rollout/ESTADO.md) | **La tabla de estado por espacio** + índice de sesiones. Los informes de cierre están en `Docs/rollout/sesiones/` |
| [`Docs/DEUDA-TECNICA.md`](Docs/DEUDA-TECNICA.md) | Por orden de rentabilidad. La nº 1 bloquea el rollout nacional |
| [`Docs/piloto-cabo-cope.md`](Docs/piloto-cabo-cope.md) | **El ejemplo trabajado.** Trazabilidad completa del piloto |

### Producto y contenido

| Documento | Contenido |
|---|---|
| [`Docs/VERIFICACION-Y-ANTITRAMPAS.md`](Docs/VERIFICACION-Y-ANTITRAMPAS.md) | Verificación de presencia real |
| [`Docs/PROGRESO-CUENTA-LOGROS.md`](Docs/PROGRESO-CUENTA-LOGROS.md) · [`Docs/PERFIL-Y-AJUSTES.md`](Docs/PERFIL-Y-AJUSTES.md) | Progreso estatal, logros, cuenta |
| [`Docs/catalogo-especies-universal.md`](Docs/catalogo-especies-universal.md) · [`Docs/glosario-divulgativo.md`](Docs/glosario-divulgativo.md) | Catálogo universal y glosario |
| [`Docs/fichas-invasoras.md`](Docs/fichas-invasoras.md) · [`Docs/fotos-invasoras.md`](Docs/fotos-invasoras.md) | Especies exóticas invasoras |

### Código y despliegue

| Documento | Contenido |
|---|---|
| `CLAUDE.md` + los `CLAUDE.md` de cada carpeta | Índice del código, fichero a fichero |
| [`Tools/catalogo-nacional/README.md`](Tools/catalogo-nacional/README.md) | Detalle de las herramientas del pipeline |
| [`Frontend/Data/parks/README.md`](Frontend/Data/parks/README.md) | Formato de `park.json` y `manifest.json` |
| [`AdminPanel/README.md`](AdminPanel/README.md) | Panel de administración |
| [`DEPLOY.md`](DEPLOY.md) · [`Docs/DESPLIEGUE_ESTATICO.md`](Docs/DESPLIEGUE_ESTATICO.md) | Despliegue |

---

## Aviso sobre los datos

Este catálogo es un trabajo de recopilación sobre fuentes oficiales y científicas públicas, no un
inventario validado en campo. Las asignaciones especie↔hábitat son **derivadas** por construcción,
las coordenadas de especie son representativas, y las fichas marcadas «a revisar» lo están porque su
duda no ha podido resolverse con una fuente primaria. Antes de cualquier uso que no sea divulgativo,
contrasta con el PORN/PRUG del espacio y con el organismo gestor.
