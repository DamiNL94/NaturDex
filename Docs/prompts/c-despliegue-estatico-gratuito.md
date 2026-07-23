# Prompt · (c) Despliegue estático gratuito (enlace para enseñar)

> Pega esto para publicar la demo gratis y tener un enlace (y opcional APK). Hazlo **después** de (b).

---

Quiero **desplegar la demo de NaturDex gratis** para tener un enlace público que enseñar a
financiadores, sin coste ni backend.

Contexto: es una **PWA offline-first** que funciona con **datos empaquetados** (`park.json` +
geojson por parque) sin servidor. Ver `Docs/ESCALABILIDAD.md` (fase 1). El frontend está en
`Frontend/` y usa rutas relativas; la API (`../Backend/Api`) simplemente no debe existir en el
hosting estático (así cae al camino empaquetado).

Ayúdame a:
1. **Elegir hosting estático gratuito** y justificarlo (Cloudflare Pages / GitHub Pages / Netlify).
   Ten en cuenta: sirve HTTPS (necesario para PWA/service worker), dominio propio opcional, y que
   solo hay que publicar el contenido de `Frontend/` como raíz del sitio.
2. **Preparar el despliegue**: verificar rutas relativas, `manifest.webmanifest`, registro del
   service worker y que la app carga el parque piloto con datos empaquetados (sin API). Ajustar lo
   que falle (p. ej. base path si el hosting sirve en un subdirectorio).
3. **Dejar instrucciones reproducibles** del despliegue (y de cómo actualizarlo).
4. (Opcional) Valorar generar el **APK vía TWA** (Trusted Web Activity) para enseñar en móvil
   Android, dado que ya es PWA; la meta a futuro era un APK.

**Ojo con los tiles del mapa:** para la demo los tiles públicos de OSM sirven, pero recuérdame que
en producción a escala nacional NO se pueden usar (política de OSM) → habrá que contratar/hospedar
tiles (ver `Docs/ESCALABILIDAD.md`).

Verifica el despliegue abriendo el enlace y comprobando que la demo funciona de punta a punta.
