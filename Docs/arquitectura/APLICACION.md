# La aplicación

Todo lo que sigue son decisiones de producto ya tomadas y en producción; el detalle está en `Docs/`.

**Flujo**: portada → login → mapa de España (selector agrupado por comunidad y provincia, con «ir al
parque más cercano») → espacio. Lo pesado del espacio se carga **solo al elegirlo**.

**La cabecera del espacio** responde a lo primero que se pregunta quien acaba de entrar —*qué es este
sitio*— con tres piezas: (1) **figura y superficie oficial** («Parque Regional · 2666 ha»), tomadas de
las propiedades del propio `geo/parque.geojson`, la misma geometría que se dibuja, así que la tienen
los dieciséis espacios sin un campo más que mantener; (2) **la descripción** del paisaje ([procedencia](PROCEDENCIA-DE-CAMPOS.md)); y (3)
**los tres recuentos de lo que se colecciona**: hábitats, especies y POIs. La tercera casilla eran los
kilómetros de costa, un dato que ni se colecciona ni existe en un espacio de interior (salía «—» en
trece de dieciséis). Un espacio sin puntos cargados muestra «—», no un cero: el dato está pendiente,
no vacío.

**Hábitats por grupos** (`Js/habitat-groups.js`). Un espacio trae entre 11 y 21 hábitats, y con una
lista plana no hay forma de gestionar el solapamiento en el mapa desde un móvil en el campo. Se
reparten en **siete grupos** ordenados del mar hacia dentro (costa y dunas, saladares, ríos y riberas,
matorrales, pastizales, roquedos, bosques). El criterio es el **código HIC**, que ya agrupa por grandes
tipos. Cada grupo tiene su trama y su tinta, **las mismas en los tres sitios** donde aparece: el mapa
(la trama dice el grupo, el borde toma el color propio del hábitat), la leyenda y el catálogo. Los
bosques de galería (91B0–92D0) van con el agua, no con los bosques: es el río lo que los explica.

**Navegación de «un paso atrás»** (`Js/nav.js`). Siendo una app de una sola página, todo lo que se abría
era una única entrada de historial, así que el botón «atrás» del móvil sacaba de la web entera con el
trabajo a medias. Regla única: **todo lo que se abre es un nivel apilado y «atrás» cierra el de arriba**,
venga del sistema, de Escape o de un botón. El historial se pone al día **al final del turno**, en una
microtarea: `history.go()` es asíncrono, y un manejador que cerraba un nivel y abría otros dos disparaba
un retroceso que llegaba *después* y deshacía justo lo que el usuario acababa de abrir.

**Las etiquetas del mapa son fichas, no globos.** El `autoPan` de Leaflet solo garantiza que el globo
entre en el *contenedor*, que en móvil está tapado arriba y abajo; y «tocar fuera» casi nunca era mapa
vacío sino otro polígono, que abría *su* globo. Ahora todo abre en el mismo sitio donde se leen las
fichas, con un solo modo de cerrarse. Todo encuadre pasa por `chromeInset()` en `map.js`.

**Sin conexión**, en tres capas (`Js/offline.js` + `sw.js`): (1) caché automática en `localStorage` de
todo JSON descargado — visitar un espacio online **una vez** deja sus datos y sus mapas vectoriales
disponibles; (2) «Guardar sin conexión» —el icono de descarga de la cabecera del parque, o su gemelo de
«Perfil → Datos»—, que baja además las imágenes, las audioguías y el paquete de teselas, y que es la
**única** vía por la que esos binarios llegan al dispositivo;
(3) Service Worker con el armazón, **network-first** para que la app nunca se quede atascada en una
versión antigua. El progreso es **local-first** con cola de pendientes idempotente.

**Mapa base offline**: `npm run tiles:build <slug>` recorta el basemap de Protomaps al **límite oficial**
(no al bbox: en un espacio costero medio bbox es mar). ~1 MB por espacio. No se empaqueta desde
tile.openstreetmap.org porque su política de teselas prohíbe expresamente el prefetch y el uso offline;
el basemap de Protomaps es una *Produced Work* de OSM bajo ODbL, redistribuible **exigiendo atribución**,
que viaja en el propio manifiesto para poder pintarla sin red. Presupuesto por espacio: **25 MB**
(mapa + fotos + audio), comprobado por el validador.

**Presencia verificada.** Descubrir una especie exige estar allí: cada posición se valida contra el
límite oficial y la visita solo se marca `verified` con presencia sostenida. No se guarda la traza del
paseo, solo el agregado. Ver `Docs/VERIFICACION-Y-ANTITRAMPAS.md`.

**Biodiversidad, agregada y aparte** (`Js/render/biodiversidad.js` +
`Tools/catalogo-nacional/build-biodiversidad-stats.js`). Hábitats, riqueza de especies y rareza legal
por espacio, comparados entre los dieciséis ya dados de alta. El dato vive en
`Data/parks-biodiversidad.json`, **fuera** de cada `park.json`: `data.js::loadData()` sustituye
`state.data` entero en cuanto hay backend accesible, así que un campo nuevo ahí desaparecería sin
aviso en cuanto hubiera backend desplegado. En móvil no hay un quinto icono en la nav inferior —ya
tiene cuatro—: se entra por un enlace dentro de Progreso, el mismo patrón que ya usa el Diccionario.
En escritorio sí es pestaña, y con ella son cuatro: la fila pasó a repartirse en dos filas de dos
(`.view-tabs{flex-wrap:wrap}`), porque en una sola línea el rótulo más largo se cortaba a media
palabra dentro de la columna izquierda.

