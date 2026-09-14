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
| Remota (Railway) | `php Tools/import-sql.php "mysql://…" Database/<fichero>.sql` | Lo normal |
| Local (contenedor) | `docker exec -i naturdex-db-1 sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --default-character-set=utf8mb4 naturadex' < Database/<fichero>.sql` | Pruebas |

**`import-sql.php` no entiende `DELIMITER`.** Manda el fichero entero con `multi_query` y es el
**servidor** quien parsea; `DELIMITER` es una directiva del cliente `mysql`, así que un fichero que la
use —`migrations.sql`, con sus procedimientos auxiliares— **no pasa por esta vía**. Cuando haga falta
un solo `ALTER` de la migración, se escribe suelto y sin `DELIMITER`, como
`Database/retira-conservation-status.sql`.

**`import-sql.php` no selecciona base**: la toma de la URL o del entorno. Todo fichero que consulte
`DATABASE()` necesita que la haya.

**Antes de nada, copia**: `npm run db:backup`. Un `DROP COLUMN` no se deshace.

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

## 3. La cola pendiente a 2026-09-14

Nada de esto está aplicado. La base sirve hoy el estado del **2026-09-11**.

### 3.1 Los dieciséis `<slug>-n2.sql` (regenerados el 2026-09-14)

```bash
for s in barrancos-de-gebas cabezo-gordo cabo-cope-puntas-calnegre calblanque-monte-cenizas-pena-aguila carrascoy-y-el-valle cuatro-calas espacios-abiertos-e-islas-del-mar-menor humedal-del-ajauque-y-rambla-salada monte-arabi salinas-arenales-san-pedro-pinatar sierra-de-el-carche sierra-de-la-pila sierra-de-las-moreras sierra-de-salinas sierra-espuna sotos-y-bosques-de-ribera-de-canaverosa; do php Tools/import-sql.php "$MYSQL_PUBLIC_URL" "Database/$s-n2.sql"; done
```

Llevan **2.881 fichas y 6.118 vínculos**. La auditoría cotejó 2.882 con Railway: la que falta es la
*Posidonia oceanica* de San Pedro, retirada el 2026-09-14 (§3.2). **Ninguna alta y esa única baja**,
comparado taxón a taxón.

Lo que cambia respecto a lo que hay en la base, medido campo a campo con
`inventario-cambios-n2.js` (comparando por nombre científico, no por línea):

| campo | fichas | qué es |
|---|---|---|
| `iucn_global` | 1.203 | C3, `npm run especies:listaroja-mundial`. 1.164 de redacción + 39 de las seis fichas cuya categoría cambió con `--con-categoria` |
| `rarity_local_basis` | 170 | cambio de **formato**, no de tramo: `{categoria, norma, ambito:"Región de Murcia"}` → `{categoria:"X (norma)", ambito:"autonómico", origen:"regionalStatus del park.json"}`. 97 en Cabo Cope y 66 en Moreras, que es el catálogo entero de los dos: sus filas se habían quedado con el formato viejo |
| `taxon_order` · `taxon_family` | 168 · 168 | los **20 taxones** —todos aves— que `completa-taxonomia.js` rellenó en el catálogo universal el 2026-09-14 y que **nunca se habían repartido** a los `park.json`: estaban bien en el catálogo y con el hueco en las fichas, en quince espacios |
| `regional_status` | 11 | C5, `corrige-estado-autonomico.js`. La chova pasa a tramo 3 en los diez espacios y el cormorán moñudo deja de negar su Vulnerable de la Ley 7/1995 |
| `rarity_local` | 9 | recálculo de `especies:rareza` detrás de lo anterior |
| `gbif_species_key` | 7 | la key homotípica de *Curruca conspicillata*, en siete espacios (`taxones:nomenclatura --write`) |
| ~~`conservation_status`~~ | 2.882 | la columna ya no se escribe |

Y **una baja**: la *Posidonia oceanica* de San Pedro. El UPSERT no la retira — para eso va el paso
siguiente.

### 3.2 La poda de la Posidonia

```bash
php Tools/import-sql.php "$MYSQL_PUBLIC_URL" Database/poda-exclusiones-salinas-arenales-san-pedro-pinatar.sql
```

**Borra una fila y no se deshace.** El fichero abre con un `SELECT` que dice cuántas filas de
`observations` se llevaría la cascada: **léelo antes de dejar correr el `DELETE`**. Si no es 0, para.

Después, `php Tools/recalculate-account-progress.php`: `user_progress.payload` indexa los
descubrimientos por el `species_id` de cada parque, así que quien la hubiera descubierto conserva una
marca que ya no apunta a ninguna ficha. Las citas Darwin Core (`user_occurrences`) **no se tocan**: no
tienen clave foránea a `species`, precisamente para esto.

### 3.3 El `DROP COLUMN`

```bash
php Tools/import-sql.php "$MYSQL_PUBLIC_URL" Database/retira-conservation-status.sql
```

**Borra dato y no se deshace.** Lo que se pierde es una etiqueta **derivada** cuya última rama
escribía el código de la UICN donde tocaba la figura legal: 21 fichas anunciaban una protección que su
propia ficha niega y 570 llevaban un código de la UICN. La categoría con su norma y su ámbito sigue
entera en `spain_status`, `regional_status`, `regional_ccaa`, `iucn_global` e `iucn_spain`.

### 3.4 Lo que NO hace falta aplicar

`species-universal.sql` (2.882 UPDATE) y `rareza-local.sql` (2.882 UPDATE) **quedan cubiertos por los
dieciséis n2**, que escriben todas las columnas de `species`. Aplicarlos no rompe nada —son
idempotentes— pero no añaden nada, salvo un matiz: sus `UPDATE` alcanzan también a filas que ya no
están en ningún `park.json` (restos de un renombrado), y el UPSERT del n2 no.

---

## 4. Lo que hay que mirar ANTES de aplicar

**El `SELECT` que abre la poda.** Si `observaciones` no es 0, el `DELETE` se lleva por cascada las
observaciones de alguien: para y decide qué hacer con ellas antes de seguir.

**Lo que no se puede repetir.** Las cifras de §3.1 miden el n2 regenerado contra lo que hay en la base;
si entre medias alguien edita algo desde el AdminPanel, dejan de valer. Vuelve a medirlo con
`inventario-cambios-n2.js` si ha pasado tiempo.

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

```bash
curl -s "https://<host>/Backend/Api/species.php?park=cuatro-calas" | head -c 400
```

- Que la API responda **200** y traiga fichas.
- Que **no** aparezca `conservationStatus` en el payload.
- Una pasada por la app: el catálogo de Cuatro Calas pinta los distintivos con su ámbito
  («Interés especial · Región de Murcia»), y la aulaga **no** anuncia «En Peligro de Extinción».
- `npm run ida-y-vuelta` sigue en verde (no hay campo del paquete sin columna).

> **Sin probar contra un MySQL de verdad.** El contenedor local (`naturdex-db-1`) no arranca y da
> ERROR 1045 como root, así que `retira-conservation-status.sql` y los dieciséis n2 regenerados **no
> se han ejecutado en ninguna base**: están comprobados por lectura (recuentos, cuadre de columnas
> contra alias fila a fila), no por carga.
