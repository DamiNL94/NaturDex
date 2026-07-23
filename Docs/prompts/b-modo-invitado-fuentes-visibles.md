# Prompt · (b) Modo invitado + procedencia oficial visible

> Pega esto para dejar la demo **presentable a un financiador**. Es lo más valioso para el pitch.

---

Quiero preparar la demo de NaturDex para poder **enseñarla a un financiador con solo un enlace**.
Dos cambios en el frontend (PWA, JS vanilla — **no** migrar de stack):

**1. Modo invitado (explorar sin login).**
- Hoy hay verja de auth (portada → login → selector de parque → explorador). Un evaluador **no se
  va a crear cuenta**: necesita abrir el enlace y explorar directamente.
- Añade un botón **"Explorar como invitado"** en la portada/login que entre al parque **sin
  autenticarse**, usando la ruta de datos empaquetados (`park.json`) que ya funciona sin backend.
  Referencia: en `Frontend/Js/auth.js`, `refreshSession()` ya usa un usuario cacheado en
  `localStorage` (`naturdex.user`) en modo offline; formaliza eso como un invitado real (nombre
  "Invitado", sin llamadas a la API de auth).
- El progreso del invitado puede quedarse **solo local** (ya es local-first); no debe intentar
  sincronizar con el backend.

**2. Procedencia oficial de los datos, visible en la UI.**
- Es la mayor baza ante un financiador público. Muestra de forma clara (pie, "Acerca de", o en las
  fichas) que los datos provienen de fuentes **oficiales**: **MITECO/IEPNB (EIDOS, CNH21,
  cartografía de hábitats), Red Natura 2000, GBIF**, correctamente atribuidas. Los campos `source`
  y `fuentes`/`fitosociologia` ya están en `park.json`; aprovéchalos.

**Restricciones:** mantener el offline-first, no romper el arranque sin backend, subir la `VERSION`
del service worker (`Frontend/sw.js`) al tocar el armazón, y verificar en la app real (sirviendo
solo `Frontend/` para forzar el camino de datos empaquetados). Lee la memoria del proyecto sobre el
SW antes de tocarlo. Enséñame el resultado funcionando.
