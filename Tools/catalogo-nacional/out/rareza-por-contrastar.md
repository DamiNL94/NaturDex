# Fichas sin tramo de rareza: estado legal por contrastar

1 fichas cuyo estado legal dice «pendiente de confirmar», «categoría exacta pendiente» o similar. **No tienen `rarityLocal`**: escribirles un 1 afirmaría que se comprobó que no tienen figura de protección, y lo que consta es que nadie lo comprobó.

Qué las resuelve, por este orden:

1. **EIDOS** (`v_estadolegal`, IEPNB) para la figura estatal y la autonómica. Es la fuente que ya
   usa `build-species-seleccion.js`; con red, basta con volver a generar la selección del espacio.
2. **Lista Roja de la Flora Vascular Española 2008** para las que la citan sin categoría. Cuenta
   en la escalera por decisión del 2026-08-11, así que su categoría sí cambia el tramo.
3. Si ninguna la resuelve, el hueco se queda escrito aquí: es preferible a un número inventado.

| Espacio | # | Especie | Estado estatal | Estado autonómico |
|---|---:|---|---|---|
| cabo-cope-puntas-calnegre | 24 | *Centaurium rigualii* | Excluida del Catálogo Nacional de Especies Amenazadas (CNEA) desde el año 2000 por dudas sobre su validez taxonómica | Pendiente de confirmar en el Catálogo Regional vigente |
