# NaturDex · estrategia de escalabilidad y despliegue

> Guía de decisiones para llevar NaturDex de **demo** a **producción nacional/comercial**.
> Resume la arquitectura recomendada y el orden de trabajo. **Regla de oro: no sobre-ingeniería.**
> "Nacional" en una app de naturaleza son decenas de miles de usuarios, no millones — el error
> caro no es quedarse corto, es construir para una escala que no llega.

## Dos fases (dónde estamos y a dónde vamos)

**FASE 1 — AHORA (demo para financiación, coste cero).** No re-arquitecturar nada.
- El stack actual es una **ventaja**: PWA offline-first + datos empaquetados por parque = **sin servidor**, se despliega en hosting estático gratis, funciona sin cobertura en el campo.
- Objetivo: una demo presentable a un financiador (ver más abajo). Solo hacen falta 3 retoques baratos:
  1. **Modo invitado** (explorar sin login) — imprescindible para que un evaluador abra un enlace y pruebe.
  2. **Procedencia oficial de los datos visible** en la UI (MITECO/IEPNB/EIDOS/GBIF/Natura 2000) — es la mayor baza ante un financiador público.
  3. **Un parque pulido** (el piloto). No escalar a más parques antes de financiar.

**FASE 2 — DESPUÉS (con financiación, ya con criterios del financiador).** Escalar con el stack de abajo.

## Arquitectura objetivo (fase 2)

Idea central: la app tiene **dos naturalezas** y hay que separarlas.
- **Catálogo** (parques→hábitats→especies): casi estático, igual para todos, el 95% del tráfico.
- **Usuario** (login + progreso): dinámico, por-persona, tráfico pequeño.

```
[ PWA offline-first ]  ──lee──►  [ Catálogo estático versionado en CDN ]   (95% del tráfico, ~gratis)
        │
        └──escribe/lee──►        [ API dinámica fina ]  ──►  [ PostgreSQL + PostGIS ]   (solo auth + progreso)
```

| Pieza | Recomendación | Por qué |
|---|---|---|
| **Base de datos** | **PostgreSQL + PostGIS** (migrar desde MySQL) | El núcleo es geoespacial (recortes, point-in-polygon, "especies en este parque"). PostGIS lo hace con consultas indexadas en vez de geometría a mano (`polygon-clipping`). **Es el cambio nº1.** |
| **Catálogo** | Bundles por parque **inmutables y versionados** en **CDN** | Escala a millones de descargas por céntimos y da el offline gratis. Es la ruta de "datos empaquetados" que ya existe. |
| **API** | **Node/TypeScript** (recomendado) o endurecer PHP con framework | Todo el pipeline (`Tools/`) ya es Node y el AdminPanel es React/TS → un solo lenguaje, tipos compartidos. Alternativa: Laravel/Slim si se conserva el PHP. |
| **Frontend** | **Mantener la PWA en JS vanilla** | Para catálogo casi-estático + uso offline en el campo es lo correcto. **No** migrar a un SPA pesado. TWA→APK para Android. |
| **Imágenes** | Object storage + CDN (S3/R2 + Cloudflare), formatos optimizados | Muchas fotos pendientes; no servirlas desde el backend. |
| **Tiles del mapa** | Proveedor (MapTiler/Protomaps/Mapbox) o vector tiles propios | A escala nacional **no se pueden usar los tiles públicos de OSM** (su política lo prohíbe en producción). Coste real a presupuestar. |
| **Auth** | Proveedor gestionado (Supabase Auth/Clerk/Auth0) | Sustituir el `auth.php` casero por seguridad de contraseñas y **RGPD** (obligatorio en comercial). |
| **Infra** | Postgres gestionado + 1 contenedor de API + CDN | Nada de microservicios, colas ni Kubernetes. |

**Orden de migración cuando llegue el momento:** (1) MySQL→PostGIS, (2) separar catálogo estático a CDN, (3) API a Node/TS + auth gestionada, (4) imágenes/tiles a CDN. El resto (PWA) se queda.

## Financiación (el criterio que desbloquea la fase 2)

Superpoder del proyecto ante un financiador público: **es una capa ciudadana sobre los inventarios
oficiales del Estado (IEPNB, EIDOS, CNH21, Red Natura 2000), correctamente atribuida.** Encaja con
la misión del MITECO de hacer ese dato útil al público. Se lidera con el **impacto** (educación
ambiental, ciencia ciudadana, difusión de Natura 2000), no con la tecnología.

Orden sugerido de fuentes:
1. **Fundación Biodiversidad (MITECO)** — mejor encaje; usas *sus* datos. Líneas de biodiversidad, educación ambiental, ciencia ciudadana.
2. **Vía regional (CARM / Región de Murcia)** — el piloto es de Murcia; tus fuentes citan a la Universidad de Murcia (Alcaraz) e IMIDA. Aliado local = credibilidad + a veces puerta más fácil.
3. **UE / NextGenerationEU (PRTR)** — biodiversidad + digitalización (la CNH21 se financió así). **LIFE** exige consorcios/cofinanciación → difícil en solitario.
4. **Innovación** (ENISA, CDTI/Neotec) — solo con empresa; préstamos o I+D, no subvención pura.

Realidad práctica: la mayoría de subvenciones exigen una **entidad** (no persona física). Lo más
ligero suele ser una **asociación sin ánimo de lucro** o **aliarse con una universidad/ONG** (que
además da aval científico). *(Orientación general, no asesoría formal de subvenciones.)*

## Referencias en el repo

- `Tools/catalogo-nacional/README.md` — fuentes oficiales exactas (URLs/CRS/claves) + pipeline por parque.
- `Docs/prompts/` — prompts de arranque para las próximas sesiones (backend+BD, y opciones a/b/c).
- Trabajo de APIs y fuentes descargadas: archivado **fuera del repo** en `Desktop/NaturDex-work/`.
