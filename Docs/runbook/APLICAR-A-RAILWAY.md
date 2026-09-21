# Aplicar SQL a Railway

**Por qué existe este documento.** `Frontend/Js/data.js` da **prioridad a la API sobre el `park.json`
empaquetado**: con backend desplegado, un dato corregido en el repositorio y no aplicado a la base
**no lo ve el usuario**. Es el punto 4 de [`ORDEN-DE-OPERACIONES.md`](ORDEN-DE-OPERACIONES.md), y la
forma más habitual de que una corrección quede a medias sin que nada falle.

Aquí va cómo se aplica, en qué orden, y qué mirar antes de pulsar.

---

## 1. Las dos vías, y por qué no son intercambiables

| Vía | Orden | Cuándo |
|---|---|---|
| Remota (Railway) | `railway run --service MySQL -- bash -c 'php Tools/import-sql.php "$MYSQL_PUBLIC_URL" <fichero>.sql'` | Lo normal |
| Local (contenedor) | `docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/<fichero>.sql` | Pruebas |

**`import-sql.php` no entiende `DELIMITER`.** Manda el fichero entero con `multi_query` y es el
**servidor** quien parsea; `DELIMITER` es una directiva del cliente `mysql`, así que un fichero que la
use —`migrations.sql`, con sus procedimientos auxiliares— **no pasa por esta vía**. Cuando haga falta
un solo `ALTER` de la migración, se escribe suelto y sin `DELIMITER`, como
`Database/retira-conservation-status.sql`.

**`import-sql.php` conecta SIN base seleccionada, y la URL de Railway apunta a `railway`, no a
`naturadex`.** Ni la toma de la URL ni la toma del entorno: conecta con la base vacía a propósito,
porque `schema.sql` hace su propio `CREATE DATABASE` + `USE`. Ningún fichero de `Database/` lleva
`USE`, así que **el comando tal cual falla con «No database selected»** y no escribe nada. La vía que
sí funciona es anteponerle la línea, que es lo que se hizo el 2026-09-14 con los dieciocho ficheros
de la cola:

```bash
# copia con la base delante, y se aplica esa
{ echo 'USE `naturadex`;'; cat "Database/$f.sql"; } > "$TMP/$f.sql"
railway run --service MySQL -- bash -c 'php Tools/import-sql.php "$MYSQL_PUBLIC_URL" "'"$TMP/$f.sql"'"'
```

**`import-sql.php` decía «OK» habiendo aplicado media importación.** Un fallo de sintaxis a mitad de
fichero rompe el hilo de `multi_query`: `next_result()` devuelve false, el bucle sale por la condición
del `while` **con el errno puesto en la conexión y nadie mirándolo**, y la herramienta imprimía
«OK · N sentencias ejecutadas» y salía con código 0 dejando sin ejecutar todo lo que venía detrás.
Así se aplicó un `Database/glosario.sql` que no escribió una sola fila. **Tapado el 2026-09-14**: hay
una comprobación del errno detrás del bucle y ahora dice «FALLO tras la sentencia #N · lo que venía
DETRÁS no se ha ejecutado» y sale con 1. Aun así, **cuenta las filas después de aplicar**: es lo único
que no depende de que la herramienta se entere.

**Antes de nada, copia.** `npm run db:backup` copia el contenedor LOCAL, que hoy no arranca: para
Railway hace falta un volcado propio (PDO + `START TRANSACTION WITH CONSISTENT SNAPSHOT`, DDL y datos
de las 18 tablas, con manifiesto de filas y checksums al lado). El del 2026-09-14 está en
`C:\Users\Deathscythe\NaturDex-backups\railway-naturadex-2026-09-14-pre-cola.sql` (11,2 MB, 9.529
filas). **Lleva correos y hashes: va fuera del repositorio.** Un `DROP COLUMN` no se deshace.

## 2. El orden, y por qué

1. **`<slug>-n2.sql`** primero. Trae la fila de `parks`, y sin ella todo lo demás carga cero filas en
   silencio.
2. **Borrados** después (`poda-aves-*`, `poda-exclusiones-*`, `poda-renombrados-*`,
   `poda-trinomios-*`, `enlaces-retirados-*`): el n2 **solo hace UPSERT** sobre
   `unique_species_per_park (park_id, scientific_name)`, así que **no retira nada**. Una ficha que
   salió del `park.json` sigue viva en la base y el usuario la sigue viendo.
3. **POIs** (`n3-pois-<slug>.sql`) al final: dependen de la fila de `parks`.
4. **DDL** (`migrations.sql` o un `ALTER` suelto) cuando cambie el esquema. Si **quita** una columna,
   va detrás de los n2 regenerados, no delante.

---

## 3. La cola del 2026-09-14 · APLICADA

Aplicada entera ese día, en este orden, tras la copia. La base pasó del estado del **2026-09-11** al
del repositorio. Lo que sigue es lo que llevaba cada paso y lo que costó, que es lo que sirve la
próxima vez.

### 3.1 Los dieciséis `<slug>-n2.sql`

```bash
for s in barrancos-de-gebas cabezo-gordo cabo-cope-puntas-calnegre calblanque-monte-cenizas-pena-aguila carrascoy-y-el-valle cuatro-calas espacios-abiertos-e-islas-del-mar-menor humedal-del-ajauque-y-rambla-salada monte-arabi salinas-arenales-san-pedro-pinatar sierra-de-el-carche sierra-de-la-pila sierra-de-las-moreras sierra-de-salinas sierra-espuna sotos-y-bosques-de-ribera-de-canaverosa; do
  { echo 'USE `naturadex`;'; cat "Database/$s-n2.sql"; } > "$TMP/$s-n2.sql"
  railway run --service MySQL -- bash -c "php Tools/import-sql.php \"\$MYSQL_PUBLIC_URL\" \"$TMP/$s-n2.sql\""
done
```

Llevan **2.881 fichas y 6.118 vínculos**. La auditoría cotejó 2.882 con Railway: la que falta es la
*Posidonia oceanica* de San Pedro, retirada en §3.2. **Ninguna alta y esa única baja**, comparado
taxón a taxón.

Lo que cambió, medido **contra la base**, no contra el fichero anterior (37 columnas × 2.881 fichas,
antes y después):

| campo | fichas | qué es |
|---|---|---|
| `iucn_global` | 1.203 | C3, `npm run especies:listaroja-mundial`. 1.164 de redacción + 39 de las seis fichas cuya categoría cambió con `--con-categoria` |
| `taxon_order` · `taxon_family` | **178 · 178** | los **20 taxones** —todos aves— que `completa-taxonomia.js` rellenó en el catálogo universal y que nunca se habían repartido a los `park.json`. Son **178 y en los dieciséis espacios**, no las 168 en quince que decía la medición fichero-contra-fichero de `inventario-cambios-n2.js`: los diez que le faltaban son de Ajauque (§3.1 bis) |
| `rarity_local_basis` | 170 | cambio de **formato**, no de tramo: `{categoria, norma, ambito:"Región de Murcia"}` → `{categoria:"X (norma)", ambito:"autonómico", origen:"regionalStatus del park.json"}`. 97 en Cabo Cope y 66 en Moreras, que es el catálogo entero de los dos |
| `regional_status` | 11 | C5, `corrige-estado-autonomico.js`. La chova pasa a tramo 3 en los diez espacios y el cormorán moñudo deja de negar su Vulnerable de la Ley 7/1995 |
| `rarity_local` | 9 | recálculo de `especies:rareza` detrás de lo anterior |
| `gbif_species_key` | 7 | la key homotípica de *Curruca conspicillata*, en siete espacios (`taxones:nomenclatura --write`) |
| ~~`conservation_status`~~ | 2.882 | la columna ya no se escribe |

**Las otras treinta columnas no difieren en una sola ficha**, y en ninguna de las siete había un valor
en la base que el repositorio no tuviera: nadie había editado desde el AdminPanel, así que el UPSERT
no pisó nada. Los 6.118 enlaces y los 164 hábitats coincidían **exactamente** con los `park.json`
—0 sobrantes y 0 faltantes—, que es lo que hay que comprobar aparte porque el n2 no retira.

### 3.1 bis · Un n2 versionado puede ir por detrás de su propio `park.json`

Aplicados los dieciséis, la comprobación dejó **10 fichas de Ajauque** sin `taxon_order`. No era la
base: era el fichero. El `humedal-del-ajauque-y-rambla-salada-n2.sql` commiteado se había generado
**antes** del `species:apply` que repartió la taxonomía, así que traía `NULL, NULL` donde su
`park.json` ya decía «Falconiformes, Falconidae». Nada lo veía —`validate` coteja el paquete, no el
SQL—, y el fichero se aplicó en verde escribiendo el dato viejo.

La comprobación que lo caza cuesta un minuto y vale para los dieciséis:

```bash
for s in <los dieciséis>; do node Tools/catalogo-nacional/build-park-sql.js --park $s; done
git status --short Database/          # si sale algún n2 modificado, el commiteado iba atrasado
```

### 3.2 La poda de la Posidonia

```bash
{ echo 'USE `naturadex`;'; cat Database/poda-exclusiones-salinas-arenales-san-pedro-pinatar.sql; } > "$TMP/poda.sql"
railway run --service MySQL -- bash -c "php Tools/import-sql.php \"\$MYSQL_PUBLIC_URL\" \"$TMP/poda.sql\""
```

**Borra una fila y no se deshace.** El fichero abre con un `SELECT` que dice cuántas filas de
`observations` se llevaría la cascada: **léelo antes de dejar correr el `DELETE`**. Si no es 0, para.
Aquí dio **0 observaciones y 0 enlaces** (id 2025, visible), así que la cascada no se llevó nada.

Detrás toca `php Tools/recalculate-account-progress.php`, porque `user_progress.payload` indexa los
descubrimientos por el `species_id` de cada parque. **El 2026-09-14 no hizo falta y se comprobó antes
de decidirlo**: ninguna de las seis filas de `user_progress` es de San Pedro y ninguna cita el id
2025. Las citas Darwin Core (`user_occurrences`) **no se tocan**: no tienen clave foránea a `species`,
precisamente para esto.

### 3.3 El `DROP COLUMN`

```bash
{ echo 'USE `naturadex`;'; cat Database/retira-conservation-status.sql; } > "$TMP/ddl.sql"
railway run --service MySQL -- bash -c "php Tools/import-sql.php \"\$MYSQL_PUBLIC_URL\" \"$TMP/ddl.sql\""
```

**Borra dato y no se deshace.** Lo que se pierde es una etiqueta **derivada** cuya última rama
escribía el código de la UICN donde tocaba la figura legal: 21 fichas anunciaban una protección que su
propia ficha niega y 570 llevaban un código de la UICN. La categoría con su norma y su ámbito sigue
entera en `spain_status`, `regional_status`, `regional_ccaa`, `iucn_global` e `iucn_spain`.
`species.conservation_status` ya no existe: la tabla queda en **42 columnas**.

### 3.4 El glosario y las invasoras

Van por su cuenta porque no son de ningún espacio, y llevaban desde el piloto sin actualizarse:
Railway servía **86 de los 219** términos y **25 de las 26** invasoras, con `glossary.php` e
`invasoras.php` respondiendo 200 y sirviendo lo viejo. No fallaba nada —la PWA cae al fichero
empaquetado cuando la API no trae el término—, y solo se ve contando las filas de las dos puntas.

El SQL no existía (las dos tablas solo viajaban BD → JSON); lo escribe **`npm run contenido:sql`**
(`Tools/contenido-sql.js`) desde `Frontend/Data/glosario.json` e `invasoras.json`, en
`Database/glosario.sql` y `Database/invasoras.sql`. Es aditivo: `ON DUPLICATE KEY UPDATE` sobre la
clave única de cada tabla, **no retira nada**. Comprobado antes de aplicar que la base no tenía ningún
valor que el paquete no tuviera (0 campos), así que el UPSERT solo suma.

Resultado: **218 términos y 26 invasoras** (con el arruí, *Ammotragus lervia*, que solo estaba en el
JSON). 218 y no 219 por el choque de collation que explica §4.

### 3.4 bis El estado legal autonómico (`estado-autonomico.sql`)

`regional_status` —el texto que cita el catálogo autonómico— es columna **LOCAL**: no viaja en el
`species-universal.sql` de `species:apply`, y `rareza-local.sql` tampoco la lleva (ése escribe el
tramo derivado: `rarity_local`, `rarity_local_basis` e `is_featured`). Hasta el 2026-09-19 no la
escribía **nadie** salvo el `-n2.sql` del espacio entero, que es la trampa nº 6, así que cada
corrección de esa cola se quedaba en el repositorio.

Lo escribe ahora `node Tools/catalogo-nacional/corrige-estado-autonomico.js --sql
Database/estado-autonomico.sql`. Es un **espejo**, no una cola: lleva todas las fichas que deben
tener el texto que declara `data/estado-autonomico-correcciones.json`, estuvieran ya bien o no, así
que regenerarlo nunca pierde lo que no se llegó a aplicar y aplicarlo dos veces escribe lo mismo.

**Va DESPUÉS de los n2** si en esa tanda se regenera alguno: el n2 escribe todas las columnas de
`species` desde el `park.json`, y el orden inverso no rompe nada pero deja el trabajo hecho dos
veces. Y como cualquier otro, **cuenta las filas después**.

### 3.5 Lo que NO hace falta aplicar

`species-universal.sql` (2.882 UPDATE) y `rareza-local.sql` (2.882 UPDATE) **quedan cubiertos por los
dieciséis n2**, que escriben todas las columnas de `species`. Aplicarlos no rompe nada —son
idempotentes— pero no añaden nada, salvo un matiz: sus `UPDATE` alcanzan también a filas que ya no
están en ningún `park.json` (restos de un renombrado), y el UPSERT del n2 no.

---

## 3 bis. La cola del 2026-09-19 · APLICADA

Tres sesiones de deuda (nº 43, 45 y 44(b)) dejaron cola. Se aplicó entera **regenerando los
dieciséis n2 y aplicando solo eso**: `build-park-sql.js` escribe las 38 columnas de `species` desde
el `park.json`, así que `species-universal.sql`, `rareza-local.sql` y `estado-autonomico.sql`
**quedan cubiertos** (§3.5) — y de hecho el cotejo posterior lo confirma con 0 diferencias sin
haberlos aplicado.

Lo que costó y lo que enseñó:

**1 · La copia ya no se escribe a mano.** Era la tercera vez que hacía falta un volcado PDO de
Railway y las tres se había escrito y tirado. Ahora es `Tools/db-backup-remoto.php`:

```bash
railway run --service MySQL -- bash -c \
  'php Tools/db-backup-remoto.php "$MYSQL_PUBLIC_URL" "$HOME/NaturDex-backups/railway-naturadex-<fecha>-pre-cola.sql"'
```

Instantánea coherente, manifiesto con filas y `sha1` al lado, y **fuera del repositorio** porque
lleva correos y hashes. La del 19: 18 tablas, **10.384 filas, 12,2 MB**.

**2 · Los dieciséis n2 versionados iban todos atrasados**, como manda §3.1 bis: se regeneran, sale
`git status Database/` con los dieciséis modificados, y se aplican esos.

**3 · El cotejo simétrico, y dos sesgos que casi lo estropean.** La pregunta es «¿tiene la base
algún valor que el repositorio NO tenga?», porque el n2 es un UPSERT. La primera pasada dijo
**11.426 diferencias** y **124 valores solo en la base**; las dos cifras estaban infladas por el
comparador, no por la base:

- **Las columnas JSON hay que canonizarlas en LOS DOS lados.** El runbook ya avisaba de que MySQL
  reordena las claves, y aun así el script solo ordenaba las del repositorio: `rarity_basis` y
  `rarity_local_basis` salían con **3.311 diferencias** cada una —el catálogo entero— donde las
  reales eran 86 y 72.
- **`identification_tips` se escribe con «; », no con salto de línea**, que es como lo parte
  `park_payload.php`. Comparándolo mal salían **1.577** diferencias; las reales son **0**. Ojo, que
  aquí hay una divergencia de verdad y conviene tenerla presente: `build-park-sql.js` une con «; »
  y `sync-species-catalog.js --sql` une con `\n`. La base la manda el n2, que es el que escribe la
  ficha entera.
- Y un tercer sesgo sin consecuencia: `is_visible` sale como «valor solo en la base» en 106 fichas
  porque el `park.json` **omite** `visible` cuando es cierto, y el generador escribe
  `s.visible === undefined ? true`. No hay pérdida; lo que hay que mirar es el generador, no el
  comparador.

Corregido eso: **0 fichas en la base que no estén en el repositorio, 0 al revés**, y los únicos
valores que la base tenía y el repositorio no eran los **18 `iucn_spain`** que la deuda nº 45
retiró a propósito. Nadie había editado desde el AdminPanel.

**4 · Después: 0 diferencias en 35 columnas.** Recuentos tras aplicar — 3.311 fichas, 6.411
enlaces, 164 hábitats, 144 POIs, 16 espacios, **343 destacadas** (eran 345) y **una sola redacción**
de la negación en `regional_status`, en 2.580 fichas.

**5 · Y la comprobación que de verdad cierra el círculo: la API.** La base no es el final del
camino, lo es lo que sirve el endpoint:

```bash
curl -s "https://naturdex-production-62b3.up.railway.app/Backend/Api/species.php?park=sierra-espuna"
```

—la ruta lleva `/Backend/Api/`, no `/api/`—. La cabra montés de Sierra Espuña sale con
`rarityLocal 4`, destacada y «Vulnerable (Ley 7/1995…)»; el saúco de Cañaverosa, con `iucnSpain`
en `null`.


## 3 ter. PENDIENTE · Las pistas como array JSON, en dos tiempos

**Por qué no se aplica de una vez.** Las pistas de identificación pasan de «; » a un array JSON en
`species.identification_tips` (el porqué, en `Backend/Lib/species_tips.php`). Railway despliega el
PHP **desde `main`**, y el `park_payload.php` que hay hoy en producción parte por `explode(";")`: un
`["…","…"]` en la base antes de desplegar el lector nuevo saldría en la app como **UNA sola pista con
los corchetes dentro**, en todas las fichas. El lector nuevo, en cambio, entiende los dos formatos.
Así que el orden es el único que no deja ningún momento roto:

**Primer tiempo — HECHO el 2026-09-21, a falta del despliegue.** El código está en la rama con
`PISTAS_EN_JSON = false` en `Tools/lib/sql.js`: todos los generadores de Node siguen escribiendo «; »,
que es lo que hay en la base y lo que entienden el PHP viejo y el nuevo. Los n2 regenerados con ese
código salen **idénticos en datos** a los aplicados el 19 (comprobado: solo cambian comentarios y el
formato del `ON DUPLICATE KEY UPDATE` de hábitats).

1. **Fusionar en `main` y empujar.** Railway construye el `Dockerfile` y despliega `species_tips.php`,
   `park_payload.php`, `admin.php` y el bundle del panel.
2. **Comprobar que el lector nuevo está vivo ANTES de seguir**:
   ```bash
   curl -s "https://naturdex-production-62b3.up.railway.app/Backend/Api/species.php?park=cabezo-gordo"
   ```
   El murciélago de cueva (*Miniopterus schreibersii*) sigue saliendo con **cuatro** pistas —la base
   aún está en «; »—, pero ya sale por `speciesTipsDecode`. No hay forma de verlo desde fuera: el
   comprobante es que el despliegue de Railway haya terminado con el commit que trae
   `Backend/Lib/species_tips.php`.

**Segundo tiempo — cuando el paso 2 esté hecho, no antes.**

3. `PISTAS_EN_JSON = true` en `Tools/lib/sql.js`.
4. `npm run ida-y-vuelta` → tiene que salir **entero en verde** (con el interruptor apagado enseña
   33 fichas en 15 espacios que no vuelven iguales; encendido, ninguna — comprobado el 2026-09-21).
5. Copia (`Tools/db-backup-remoto.php`), regenerar los dieciséis n2 y aplicarlos como en §3 bis.
6. La API: el murciélago de cueva de Cabezo Gordo tiene que salir con **tres** pistas, y la segunda
   entera: «Alas largas y estrechas; vuelo veloz y alto».

`migrations.sql` trae además `naturdex_tips_a_json`, que convierte las filas viejas **en la propia
base**. En Railway no hace falta —los n2 reescriben la columna de todas las fichas—, y además usa
`DELIMITER`, así que **no pasa por `import-sql.php`** (§1). Es para el contenedor local y para
instalaciones que no regeneren.


## 4. Lo que hay que mirar ANTES de aplicar

**La pregunta que importa no es «¿qué va a cambiar?» sino la simétrica: ¿hay en la base algún valor
que el repositorio NO tenga?** El n2 es un UPSERT que escribe todas las columnas, así que una edición
hecha desde el AdminPanel desaparece sin un aviso. Se mide volcando `species` entera en solo lectura
(`SET SESSION TRANSACTION READ ONLY`) y cotejando las 37 columnas contra los `park.json`, contando
aparte los casos «la base tiene valor y el repositorio no». El 2026-09-14 eran **0**.

**Las columnas JSON no se comparan como texto: MySQL REORDENA las claves.** `rarity_local_basis` y
`rarity_basis` son JSON, y comparar la cadena da **2.881 diferencias donde las reales son 170**.
Hay que comparar con las claves ordenadas (canónicas) en los dos lados.

**El `SELECT` que abre la poda.** Si `observaciones` no es 0, el `DELETE` se lleva por cascada las
observaciones de alguien: para y decide qué hacer con ellas antes de seguir.

**Que el n2 versionado no vaya por detrás de su `park.json`** (§3.1 bis): regenerar los dieciséis y
mirar `git status`.

**Un choque de collation cuenta como fila aplicada y no lo es.** `glosario.term` es `UNIQUE` con
`utf8mb4_unicode_ci`, que ignora acentos y mayúsculas: «foliolo» y «folíolo» son **la misma fila**
para MySQL. El fichero declaraba 219 términos y la tabla acababa con 218, sin un solo error, porque
el segundo pisaba al primero. Estaban duplicados en el origen (`seed.sql` y `glosario.json`, cada uno
citando al otro como alias) y se fundieron el 2026-09-14. Al aplicar una tabla con clave única de
texto, **cuenta las filas después** y compárala con las del fichero.

**Lo que no se puede repetir.** Las cifras de §3.1 miden el n2 contra lo que había en la base ese día;
si entre medias alguien edita desde el AdminPanel, dejan de valer. Vuelve a medirlo.

> **De dónde salió la baja.** La *Posidonia oceanica* de San Pedro se excluyó el 2026-08-29 —fanerógama
> marina en un parque sin un solo HIC marino, sus ocurrencias son arribazón— y la exclusión **se
> escribió y nunca se ejecutó**: la ficha siguió publicada y visible dieciséis días (hallazgo C15 de la
> auditoría), con el `source` describiéndola además como «un taxón volador», que es la frase que el
> generador escribe para lo que no cuelga de ningún hábitat. La causa es estructural y ya está tapada:
> `data/exclusiones-especies.json` lo lee la herramienta que decide lo que ENTRA, y una exclusión
> escrita después de publicar el espacio no retira nada. Ahora lo aplica
> `npm run especies:exclusiones` (`aplica-exclusiones.js`), que recorre los tres espacios con
> exclusiones y redacta el borrado.

## 5. Después de aplicar

El host del despliegue de prueba es `naturdex-production-62b3.up.railway.app` (variable
`RAILWAY_PUBLIC_DOMAIN` del servicio NaturDex; el dominio que da `railway domain` con el CLI enlazado
a MySQL es el de la BASE, no el de la app).

```bash
curl -s "https://naturdex-production-62b3.up.railway.app/Backend/Api/species.php?park=cuatro-calas" | head -c 400
```

Lo comprobado el 2026-09-14, todo en verde:

- `species.php` **200**, 93 fichas en Cuatro Calas y **353** en San Pedro (era 354).
- **`conservationStatus` ya no aparece** en el payload.
- La frase del «taxón volador» **no está** en San Pedro, y la única mención a *Posidonia* que queda
  es la del `source` de otra ficha citando el PRUG (las playas de restos de Las Encañizadas), que es
  correcta.
- `glossary.php` **218 términos**, `invasoras.php` **26** con el arruí.
- *Falco tinnunculus* sirve ya su `order`/`family` («Falconiformes», «Falconidae»).
- `npm run validate`, `npm test` y `npm run glossary:check` en verde con el glosario fundido.

Falta **la pasada por la app**, que necesita la sesión del usuario: el modo invitado está apagado y
la portada pide entrar.

> **Probado contra el MySQL de verdad.** El aviso anterior («no se ha ejecutado en ninguna base»)
> queda cerrado: los dieciocho ficheros se cargaron en Railway el 2026-09-14 y se verificaron
> volviendo a leer la base, no solo el fichero.
