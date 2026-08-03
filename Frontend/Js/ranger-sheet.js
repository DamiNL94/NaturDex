/* ================================================================================================
   NaturDex — gesto de la hoja-hub del parque (solo móvil, ≤900px)
   ------------------------------------------------------------------------------------------------
   La reestructuración móvil deja el mapa como fondo permanente y la barra lateral como hoja
   deslizante. Este script solo añade el gesto: arrastrar (o pulsar) el asa sube la hoja a pantalla
   casi completa, la deja en su altura media o la baja para ver el mapa. Todo el aspecto lo pone
   Css/ranger.css con las clases park-sheet-low / (media) / park-sheet-full en <body>.
   Sin este fichero la app sigue funcionando: la hoja se queda en su altura media.
   ================================================================================================ */
(function () {
  var grip = document.querySelector('.park-sheet-grip');
  if (!grip) return;

  var STATES = ['park-sheet-low', '', 'park-sheet-full'];  // bajada · media · completa
  var index = 1;

  // La hoja tarda .28s en llegar a su altura nueva (transición del CSS): el mapa se recoloca cuando
  // ya ha llegado, o mediría el hueco de antes. Ver Js/map.js · reframe().
  var SHEET_ANIM_MS = 300;
  var reframeTimer = null;

  function apply(next) {
    index = Math.max(0, Math.min(STATES.length - 1, next));
    document.body.classList.remove('park-sheet-low', 'park-sheet-full');
    if (STATES[index]) document.body.classList.add(STATES[index]);
    if (reframeTimer) clearTimeout(reframeTimer);
    reframeTimer = setTimeout(function () {
      if (window.naturdexReframeMap) window.naturdexReframeMap();
    }, SHEET_ANIM_MS);
  }

  // Pulsación: cicla media → completa → media. Nunca deja la hoja fuera de alcance del pulgar.
  // `dragged` es imprescindible: un arrastre sobre el asa termina emitiendo TAMBIÉN un click, así
  // que sin esta guarda cada gesto se deshacía solo al instante (arrastrar hacia abajo bajaba la
  // hoja y el click que venía detrás la mandaba a pantalla completa).
  var dragged = false;
  grip.addEventListener('click', function () {
    if (dragged) { dragged = false; return; }
    apply(index === 2 ? 1 : 2);
  });

  // Arrastre vertical: hacia arriba expande, hacia abajo contrae (umbral de 36px).
  var startY = null;
  var UMBRAL = 36;
  grip.addEventListener('pointerdown', function (e) {
    startY = e.clientY;
    dragged = false;
    grip.setPointerCapture(e.pointerId);
  });
  grip.addEventListener('pointerup', function (e) {
    if (startY === null) return;
    var dy = e.clientY - startY;
    startY = null;
    if (dy < -UMBRAL) { dragged = true; apply(index + 1); }
    else if (dy > UMBRAL) { dragged = true; apply(index - 1); }
  });
  // Un gesto interrumpido (el navegador se queda el puntero, llamada entrante…) no debe dejar el
  // asa esperando un pointerup que ya no va a llegar.
  grip.addEventListener('pointercancel', function () { startY = null; dragged = false; });

  // Al CERRAR la ficha de detalle, si la hoja se había quedado abajo vuelve a su altura media: el
  // hub es el punto de partida y dejarlo fuera de la vista desorienta.
  // Se compara con el estado ANTERIOR a propósito. El observador salta con cualquier cambio de
  // clase del <body>, incluidas las que pone este mismo script: sin la comparación, bajar la hoja
  // con el gesto se deshacía solo (apply(0) cambiaba las clases, el observador saltaba acto
  // seguido y la devolvía a media altura), y la posición baja era sencillamente inalcanzable.
  var wasSheetOpen = document.body.classList.contains('sheet-open');
  var obs = new MutationObserver(function () {
    var open = document.body.classList.contains('sheet-open');
    if (open === wasSheetOpen) return;
    wasSheetOpen = open;
    if (!open && index === 0) apply(1);
  });
  obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // Cambiar de pestaña inferior devuelve la hoja a su altura media.
  document.querySelectorAll('.mobile-nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { apply(1); });
  });
})();
