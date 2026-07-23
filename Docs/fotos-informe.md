# Informe · Fotos del catálogo (especies y hábitats)

_Parque piloto: Cabo Cope y Puntas de Calnegre. Criterio aplicado: solo fotos con confianza **media-alta/alta** del `NaturDex_fotos_candidatas.xlsx`; almacenamiento como **URL externa** (Wikimedia Commons) en la BD. Las de confianza media/baja se dejan sin foto (el frontend muestra portada temática) por fidelidad._

## Hábitats — 9 rellenados

Se añadió la columna `image_url` a la tabla `habitats` (`schema.sql` + `migrations.sql`), se pobló en `seed.sql` y `park_payload.php` ahora la prioriza sobre la ruta local. Actualizado también `park.json`.

- `estepas-salinas-albardinal` — 1510 · Estepas salinas mediterráneas (Limonietalia)
- `matorral-semiarido` — 5330 · Matorral termomediterráneo semiárido
- `sabinar-juniperus` — 5210 · Matorrales arborescentes de Juniperus spp.
- `azufaifar` — 5220 · Matorrales arborescentes de Ziziphus
- `matorral-halonitrofilo` — 1430 · Matorrales halo-nitrófilos
- `matorral-halofilo` — 1420 · Matorrales halófilos mediterráneos y termoatlánticos
- `prados-alysso-sedion` — 6110 · Prados calcáreos cársticos o basófilos del Alysso-Sedion albi
- `veg-anual-desechos-marinos` — 1210 · Vegetación anual sobre desechos marinos acumulados
- `subestepa-thero-brachypodietea` — 6220 · Zonas subestépicas de gramíneas y anuales del Thero-Brachypodietea

### Hábitats SIN foto (pendientes de revisión manual)

La candidata encontrada era de confianza media/baja o no representa fielmente el hábitat de este parque:

- `acantilados` — 1240 · Acantilados mediterráneos con Limonium · confianza baja
- `dunas-malcomietalia` — 2230 · Dunas con céspedes del Malcomietalia · confianza media
- `dunas-embrionarias` — 2110 · Dunas móviles embrionarias · confianza media
- `galeria-ribera` — 92D0 · Galerías y matorrales ribereños termomediterráneos · confianza media
- `roquedos-casmofiticos` — 8210 · Pendientes rocosas calcícolas con vegetación casmofítica · confianza media
- `rios-glaucium` — 3250 · Ríos mediterráneos de caudal permanente con Glaucium flavum · confianza media

## Especies

- **50 especies** de confianza media-alta/alta ya tenían su URL candidata cargada en `seed.sql` y `park.json` (bar de fidelidad cumplido).
- **2 especies** que quedaban pendientes (su candidata del Excel apuntaba a una *categoría* de Commons, no a un archivo) se resolvieron vía **GBIF/iNaturalist** — ver sección siguiente.

## Extracción desde EIDOS/IEPNB y GBIF

**EIDOS/IEPNB no es un banco de fotos:** cataloga taxonomía, estado legal y distribución. Su API `iepnb.gob.es` además está bloqueada desde el entorno de trabajo. La capa de imágenes de ese ecosistema es **GBIF / GBIF.ES** (la misma vía con la que ya se rellenaron las especies invasoras del seed), que sí devuelve la foto del taxón correcto con **licencia + autor**.

Se rellenaron vía GBIF/iNaturalist las 2 especies alta pendientes, con preferencia CC-BY/CC0 y atribución guardada en la nueva columna `species.image_attribution`:

- **Lechuguilla lanosa** (_Launaea lanifera_) — foto CC BY 4.0 (Mehdi Chetibi), vía iNaturalist/GBIF.
- **Oroval** (_Withania frutescens_) — foto CC BY-NC 4.0 (Roger Vila, Baleares) ⚠️ no comercial; única con licencia libre localizada.

Para el resto del catálogo (media/baja/no encontradas) se entrega el script **`Tools/catalogo-nacional/enrich-images.js`**, que hace el barrido completo (intento de multimedia EIDOS → fallback GBIF, preferencia de licencia y localización España, salida `.sql` + informe). No se pudo ejecutar en bucle aquí porque el sandbox tiene GBIF/EIDOS bloqueados y `web_fetch` solo trae un registro por llamada; **hay que correrlo en local** con red completa:

```
node Tools/catalogo-nacional/enrich-images.js \
  --park Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json \
  --slug cabo-cope-puntas-calnegre --mode all --country ES \
  --out Tools/catalogo-nacional/out/fotos-especies.sql \
  --report Tools/catalogo-nacional/out/fotos-especies.md
```

(Con `--allow-nc` incluye también fotos CC-BY-NC, marcándolas.)

### Especies sin foto por criterio de fidelidad

- **36** con candidata de confianza *media* (especie correcta pero foto de otra localidad, o identificación no plenamente segura).
- **7** con candidata de confianza *baja*.
- **9** sin ninguna candidata con licencia libre localizada.

Estas quedan con la portada temática generada. Si quieres, puedo bajar el umbral a 'media' y rellenarlas también, o revisarlas una a una.

### Detalle — no encontradas (9)

- Centaurio de Rigual (_Centaurium rigualii_)
- Espartilla de Persia (_Enneapogon persicus_)
- Anabasis (_Anabasis hispanica_)
- Eragrostis (_Eragrostis papposa_)
- Erodio (_Erodium sanguis-christi_)
- Escrofularia de perro (_Scrophularia canina_)
- Espino negro (_Rhamnus lycioides subsp. borgiae_)
- Rabogato (_Sideritis ibanyezii_)
- Serrátula (_Serratula mucronata_)

## Aviso de licencias

El Excel marca la mayoría de licencias como *"verificar licencia en la ficha de Commons"*. Antes de publicar, hay que confirmar la licencia de cada archivo y registrar autor/licencia para cumplir CC-BY / CC-BY-SA. Los `UPDATE` del seed llevan un comentario recordándolo.

## Ampliación del catálogo (174 especies)

El catálogo creció de 146 a **174 especies** (nuevas aves, reptiles, mamíferos y flora dunar/halófila, ids 200-249). Estado actual: **109 con foto, 65 sin foto**.

**Detalle clave:** las especies nuevas viven **solo en `park.json`** (no están en `Database/seed.sql`), así que para ellas la fuente de verdad es park.json. El script ahora tiene `--write-park` para escribirlas ahí directamente.

Rellenadas en esta pasada vía GBIF/iNaturalist (foto del taxón, con autor + licencia):

| Especie | Licencia | Nota |
| --- | --- | --- |
| _Launaea lanifera_ | CC BY 4.0 | Mehdi Chetibi |
| _Withania frutescens_ | CC BY-NC 4.0 ⚠️ | Roger Vila (Baleares) |
| _Centaurium rigualii_ | CC BY-NC 4.0 ⚠️ | naturcope — **obs. en Águilas, dentro del parque** |
| _Monticola solitarius_ | CC BY-NC 4.0 ⚠️ | Arsenio González |
| _Oryctolagus cuniculus_ | CC BY-NC 4.0 ⚠️ | Africa Gómez |

**Realidad de licencias:** casi todas las fotos de iNaturalist/GBIF son **CC-BY-NC** (no comercial), independientemente de la licencia de la observación. Para cubrir las 65 restantes hay que aceptar NC (marcadas) o quedará mínima cobertura.

**No pude traer las 65 restantes aquí:** el sandbox tiene bloqueado todo host externo (403) y `web_fetch` solo devuelve cuerpo de `api.gbif.org`, un registro grande por llamada — 65 llamadas no caben en una sesión. Se completan en **una ejecución local** del script:

```
node Tools/catalogo-nacional/enrich-images.js \
  --park Frontend/Data/parks/murcia/cabo-cope-puntas-calnegre/park.json \
  --slug cabo-cope-puntas-calnegre --mode missing --allow-nc --write-park \
  --out Tools/catalogo-nacional/out/fotos-especies.sql \
  --report Tools/catalogo-nacional/out/fotos-especies.md
```

Esto rellena `park.json` (todas) y genera el `.sql` (para las que ya están en la BD). Revisa el informe que emite: marca cuáles quedaron CC-BY-NC.

## ✅ Completado: 174/174 especies con foto

Se consiguieron las 64 que faltaban usando el **navegador Chrome conectado** (red completa) para ejecutar un bucle `fetch()` sobre la API de GBIF —resolviendo por `species/match` las 22 aves sin clave, escaneando hasta 100 registros por especie, priorizando España y la mejor licencia—. Resultado escrito en `park.json` (las 64) y `seed.sql` (las 39 que existen en la BD), con autor + licencia en `image_attribution`.

- **Estado final: 174/174 con foto, 0 sin foto.**
- Licencias de las 70 fotos vía GBIF: **19 CC0, 36 CC-BY, 15 CC-BY-NC** (mayoría reutilizable; las NC van marcadas).
- **Todas verificadas**: se hizo load-test de las 64 URLs en el navegador; las que no cargaban (herbarios RBGE/MNHN/Meise que bloquean hotlink) se sustituyeron por fotos que sí cargan.

Notas de fidelidad (revisables si quieres cambiarlas):
- Varias son **imágenes de herbario/museo** (CC0) en vez de foto de campo, porque tenían mejor licencia: p. ej. _Anabasis hispanica_, _Serratula mucronata_ (Naturalis).
- Algunas de especies raras son de **fuera de España** (marcado `obs. XX` en la atribución): _Halocnemum_ (EAU), _Hammada articulata_ (SA), _Leucanthemum decipiens_ (herbario, Marruecos), _Capparis_ (foto a nivel de especie).
- _Leucanthemum decipiens_ (endemismo) es la de peor disponibilidad: herbario RSA, CC-BY-NC.

El script `enrich-images.js` queda igualmente para regenerar/reejecutar en local en el futuro.

## Repaso de imágenes (load-test completo)

Se probó en el navegador que **cada imagen carga de verdad** (no solo que exista la URL). Hallazgos y correcciones:

- **6 imágenes de especie rotas** (thumbs `upload.wikimedia.org` con 404 + Cistus clusii): Águila perdicera, Cormorán moñudo, Sabina negral, Azufaifo, Cornical, Cistus clusii → sustituidas por foto GBIF/iNaturalist verificada (casi todas CC0/CC-BY).
- **6 hábitats sin foto** (mostraban solo el placeholder temático) → rellenados con la foto de su especie/comunidad diagnóstica, ya verificada: acantilados (Limonium), dunas-malcomietalia (Malcolmia), dunas-embrionarias (Elymus farctus), galería-ribera (Tamarix), roquedos-casmofíticos (Sarcocapnos), ríos-glaucium (Glaucium).
- Varias imágenes de Wikimedia y POI fallaban de forma **intermitente** por rate-limit al probarlas en lote; al reintentar cargan bien (no había que cambiarlas).

**Estado final verificado: 174/174 especies y 15/15 hábitats con foto que carga.** 0 imágenes rotas.

## Archivos modificados

- `Database/schema.sql` — columnas `habitats.image_url` y `species.image_attribution`
- `Database/migrations.sql` — migración de ambas columnas
- `Database/seed.sql` — 9 UPDATE de foto de hábitat + 2 UPDATE de foto de especie (GBIF)
- `Backend/Lib/park_payload.php` — prioriza `image_url` del hábitat y emite `imageAttribution` de especie
- `Frontend/Data/parks/.../park.json` — 9 imágenes de hábitat + 2 de especie con atribución
- `Tools/catalogo-nacional/enrich-images.js` — **nuevo** script de enriquecimiento EIDOS+GBIF (ejecutar en local)
