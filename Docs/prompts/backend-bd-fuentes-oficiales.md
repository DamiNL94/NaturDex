# Prompt · Backend + Base de Datos con todas las fuentes oficiales

> Pega esto para arrancar una sesión centrada en **completar el backend y la BD** con los datos
> oficiales trabajados. Es tarea de **fase 2** (post-demo); ver `Docs/ESCALABILIDAD.md`.

---

Quiero completar el **backend (`Backend/Api/*.php`) y la base de datos (`Database/`, MySQL 8.4)**
de NaturDex para que contengan, de forma correcta y trazable, todos los datos del catálogo que
provienen de las fuentes oficiales, e integrarlos bien.

**Contexto crítico que debes verificar primero:**
- En sesiones previas **enriquecí los ficheros empaquetados** (`Frontend/Data/parks/.../park.json`
  y `geo/habitats.geojson`) pero **NO la BD**. Cuando el backend está levantado, `species.php` sirve
  desde la BD, así que **la BD está por detrás** de los ficheros. Además existe un export DB→park.json
  (`Tools/export-park.php` / `Backend/Lib/park_export.php`): si se ejecuta, **sobrescribiría mis
  cambios de park.json** con la BD sin actualizar. Hay que **reconciliar esa divergencia**: llevar
  los cambios a la BD y luego re-exportar, dejando BD y empaquetado coherentes.
- Lee `Tools/catalogo-nacional/README.md` (fuentes exactas, URLs, CRS, claves) y la memoria del
  proyecto antes de tocar nada.

**Fuentes oficiales a integrar (todas usadas y validadas ya en el proyecto):**
1. **EIDOS** (IEPNB, PostgREST `https://iepnb.gob.es/api/especie/`, sin auth) — **fuente principal**
   de taxonomía, nombres comunes, estado de conservación UICN por ámbito y estado legal. Clave
   `taxonid` en `v_taxonomia`; `idtaxon` en las vistas de detalle.
2. **UICN** — *fallback* de conservación cuando EIDOS no cubre (~54/124 especies del piloto).
3. **GBIF** (`api.gbif.org`) — ocurrencias por hábitat (`speciesKey`).
4. **EEA Discodata BISE** (`[BISE].[latest].[Site_Species_List]`) — especies oficiales por espacio
   Natura 2000 (aves de la ZEPA ES0000261 en el piloto).
5. **Cartografía de Hábitats MITECO** (Directiva 92/43) — HIC + asociación fitosociológica + prioridad.

**Trabajo concreto sobre la BD (revisa `Database/schema.sql` antes):**
- Añadir a `habitats`: `fitosociologia` (lista/JSON) y `hic_subtipos`; confirmar que existe `hic_code`.
- Añadir la especie **Posidonia oceanica** (EIDOS taxonid 7303) y el hábitat **praderas-posidonia**
  (HIC 1120, prioritario) que añadí al empaquetado, con su enlace especie↔hábitat.
- **Reconciliación taxonómica**: añadir `species.eidos_taxonid` y `species.gbif_species_key` como
  **claves maestras**, cargándolas desde la tabla ya generada `…-reconciliacion.json` (archivada en
  `Desktop/NaturDex-work/resultados-catalogo/`). Decisión ya tomada: **EIDOS es la nomenclatura
  canónica**; GBIF `speciesKey` sirve para ligar ocurrencias. Ojo a las 19 discrepancias EIDOS↔GBIF.
- `species_habitats`: columna **`evidence`** (`caracteristica` | `observada_gbif` | `zepa`).
- Mantener todo **idempotente** en `seed.sql` (INSERT ... ON DUPLICATE KEY UPDATE) como el resto.

**Objetivo de diseño (fase 2):** el destino es **PostgreSQL + PostGIS** (ver `Docs/ESCALABILIDAD.md`);
si seguimos en MySQL por ahora, escribe los cambios de forma que la migración posterior sea limpia.

**Al terminar:** re-exportar park.json desde la BD, correr `npm run validate`, y dejar BD ↔
empaquetado coherentes. No romper el arranque sin backend (datos empaquetados).

Empieza inspeccionando `Database/schema.sql`, `Backend/Api/species.php` y el export, y dime el plan
antes de modificar el esquema.
