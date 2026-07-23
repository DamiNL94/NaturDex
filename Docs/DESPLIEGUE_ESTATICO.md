# NaturDex · despliegue estático gratuito (demo para financiadores)

> Objetivo: un enlace público, HTTPS, sin coste y sin backend, para enseñar la demo (parque piloto
> Cabo Cope y Puntas de Calnegre). Ver `Docs/ESCALABILIDAD.md` (fase 1).

## 0. Qué se tocó para dejarlo listo

La app ya era una PWA offline-first con datos empaquetados (`park.json` + geojson por parque), así
que no hacía falta re-arquitecturar nada. Pero tenía un bloqueante real: la portada exigía
login/registro contra `../Backend/Api/auth.php`, que **no existe** en hosting estático — un
evaluador se habría quedado atascado sin poder crear cuenta nunca. Se resolvió (prompt (b) del
proyecto):

- **Modo invitado**: botón "Explorar como invitado, sin cuenta" en la portada y en la pantalla de
  login (`Frontend/index.html`, `Frontend/Js/auth.js`, función `enterAsGuest()`). Entra directo al
  selector de parque sin llamar a la API de auth. Al no llevar `id` de usuario, el progreso usa el
  ámbito `anon` (`data.js` → `progressScope()`), así que es siempre local y nunca intenta
  sincronizar con un backend que no existe.
- Se subió la `VERSION` del Service Worker (`Frontend/sw.js`, `v23` → `v24`) por haber tocado el
  armazón (HTML/CSS/JS del login).
- **Verificado**: `Frontend/` no tiene ninguna ruta absoluta (todo `href`/`src`/`import`/`fetch` es
  relativo), el `manifest.webmanifest` usa `start_url`/`scope` relativos y el Service Worker se
  registra con ruta relativa (`sw.js`) — así que funciona igual en la raíz de un dominio que en un
  subdirectorio. Sirviendo **solo** `Frontend/` (sin `Backend/` accesible) con un servidor estático
  local: la portada, el manifiesto, el índice de parques, el `park.json` (124 especies, 15
  hábitats, 15 POIs) y los iconos cargan con `200`; las llamadas a `../Backend/Api/*` resuelven a
  `404` y el código ya las captura (`try/catch`) y sigue con los datos empaquetados — el
  comportamiento que necesita el hosting estático.

No hace falta build ni compilar nada: `Frontend/` se publica tal cual.

## 1. Hosting elegido: Cloudflare Pages

| | Cloudflare Pages | Netlify | GitHub Pages |
|---|---|---|---|
| HTTPS automático | Sí | Sí | Sí |
| Publicar solo la subcarpeta `Frontend/` como raíz | Sí, campo nativo ("root directory"), sin tocar el repo | Sí, campo nativo ("base directory") | No de forma directa: solo publica la raíz del repo o `/docs`; para una subcarpeta distinta hace falta una GitHub Action que copie `Frontend/` o una rama `gh-pages` con subtree — más pasos y más frágil de mantener |
| Ancho de banda gratis | Ilimitado | Con límite mensual (plan free) | Con límite (fair use) |
| Dominio propio gratis | Sí (1 dominio personalizado) | Sí | Sí |
| Deploy sin conectar cuenta de Git (drag & drop / CLI) | Sí (`wrangler pages deploy`) | Sí (`netlify deploy`) | No (necesita repo + Pages habilitado) |

Cloudflare Pages es la mejor opción para este caso: el repo ya mezcla `Frontend/`, `Backend/`,
`AdminPanel/`, `Database/`… y Cloudflare permite señalar `Frontend/` como raíz de publicación sin
tocar la estructura del repositorio ni crear ramas auxiliares. Ancho de banda ilimitado en el plan
gratis, HTTPS y subdominio (`*.pages.dev`) automáticos, y dominio propio opcional también gratis.
Netlify es una alternativa igual de válida con el mismo modelo (lo cambiarías 1:1 si lo prefieres).
GitHub Pages es la menos indicada aquí por el tema de la subcarpeta.

## 2. Desplegar (dos formas, elige una)

### Opción A — Conectar el repo de GitHub (recomendado: se actualiza solo)

1. Entra en el [dashboard de Cloudflare](https://dash.cloudflare.com/) → **Workers & Pages** →
   **Create** → pestaña **Pages** → **Connect to Git**.
2. Autoriza el acceso y elige el repositorio `DamiNL94/NaturDex`.
3. En la configuración de build:
   - **Framework preset:** None
   - **Build command:** (vacío — no hay build)
   - **Root directory:** `Frontend`
   - **Build output directory:** `/` (relativo a `Frontend`, es decir, la propia carpeta)
4. **Deploy**. En ~30 segundos tendrás la URL pública: `https://naturdex.pages.dev` (o el nombre de
   proyecto que elijas).
5. A partir de aquí, **cada `git push` a la rama de producción redespliega solo**. Elige qué rama es
   la de producción en la configuración del proyecto (probablemente `main`; el trabajo actual está
   en `catalogo-nacional`, así que haz merge a `main` cuando quieras publicar).

### Opción B — CLI, sin conectar el repo (más rápido para tener el enlace ya)

Desde tu máquina (no hace falta desde este entorno):

```bash
cd NaturDex
npx wrangler login              # una vez, abre el navegador para autorizar
npx wrangler pages deploy Frontend --project-name=naturdex
```

Wrangler crea el proyecto la primera vez y te da la URL (`https://naturdex.pages.dev`) al terminar.
Sirve tanto para el primer despliegue como para actualizar.

### Actualizar el sitio ya publicado

- Si conectaste el repo (Opción A): haz `git push` a la rama de producción, Cloudflare redespliega
  solo.
- Si usaste la CLI (Opción B): repite `npx wrangler pages deploy Frontend --project-name=naturdex`.
- En ambos casos, si tocaste HTML/CSS/JS del armazón, sube la `VERSION` de
  `Frontend/sw.js` (como se hizo aquí, `v23` → `v24`) para que los móviles que ya instalaron la PWA
  vean la versión nueva.

## 3. Verificación de punta a punta

Antes de dar el enlace a un financiador, comprueba en el navegador (móvil y escritorio):

1. Abre la URL pública. Debe verse la portada (candado HTTPS en la barra de direcciones).
2. Pulsa **"Explorar como invitado, sin cuenta"** → debe entrar directo al parque piloto sin pedir
   login.
3. El catálogo debe mostrar hábitats y especies (124 especies / 15 hábitats en el piloto), el mapa
   debe cargar con las teselas de OpenStreetMap.
4. Abre las herramientas de desarrollador → pestaña *Application/Aplicación* → **Service Workers**:
   debe aparecer registrado y activo (`sw.js`, versión `v24`).
5. Recarga en modo avión / sin red tras haber visitado el parque una vez: debe seguir funcionando
   con los datos ya cacheados (offline-first).
6. Opcional: **Instalar app** desde el navegador (icono de instalación en la barra de direcciones,
   Chrome/Edge) para confirmar que el `manifest.webmanifest` es válido.

*(Este entorno de trabajo no tiene salida de red hacia Cloudflare/GitHub, así que el despliegue en
sí — pasos 1 y 2 de arriba — lo tienes que ejecutar tú; lo que sí se verificó aquí, sirviendo
`Frontend/` en solitario con un servidor local, es que todo el código y los datos cargan
correctamente sin backend, que es la parte que podía romperse.)*

## 4. Opcional: APK vía TWA (Trusted Web Activity)

Con la PWA ya en HTTPS público, generar un APK para enseñar en Android es un paso corto (no se ha
hecho todavía, es "a futuro" según `Docs/ESCALABILIDAD.md`):

1. La forma más simple: [PWABuilder.com](https://www.pwabuilder.com/) → pega la URL pública →
   pestaña **Android** → descarga el paquete TWA (usa Bubblewrap por debajo). Da un APK firmado con
   una clave de debug, válido para enseñar (no para publicar en Play Store sin firma de producción).
2. Requisitos que ya cumples: HTTPS, `manifest.webmanifest` con iconos 192/512, Service Worker
   registrado.
3. Para publicar en Play Store de verdad harían falta: cuenta de desarrollador de Google
   (pago único ~25 $), firma de producción propia, y el **Digital Asset Links**
   (`/.well-known/assetlinks.json`) sirviendo desde el dominio para verificar la app — todo esto es
   trabajo adicional, no necesario solo para enseñar el APK a un financiador.

## 5. Ojo con los tiles del mapa

Los tiles públicos de `tile.openstreetmap.org` (los que usa hoy `Frontend/Js/map.js` y
`auth.js`) son válidos para esta demo (tráfico bajo, uso puntual). **No sirven para producción a
escala nacional**: la [política de uso de OSM](https://operations.osmfoundation.org/policies/tiles/)
prohíbe ese volumen de tráfico en el servidor público. Cuando haya financiación y se escale de
verdad, hay que contratar/hospedar tiles propios (MapTiler, Protomaps o Mapbox — ver la tabla de
`Docs/ESCALABILIDAD.md`). No es una tarea de esta fase, solo un recordatorio para no arrastrar el
mismo tile server a producción sin darse cuenta.
