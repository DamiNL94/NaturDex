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

  function apply(next) {
    index = Math.max(0, Math.min(STATES.length - 1, next));
    document.body.classList.remove('park-sheet-low', 'park-sheet-full');
    if (STATES[index]) document.body.classList.add(STATES[index]);
  }

  // Pulsación: cicla media → completa → media. Nunca deja la hoja fuera de alcance del pulgar.
  grip.addEventListener('click', function () {
    apply(index === 2 ? 1 : 2);
  });

  // Arrastre vertical: hacia arriba expande, hacia abajo contrae (umbral de 36px).
  var startY = null;
  grip.addEventListener('pointerdown', function (e) {
    startY = e.clientY;
    grip.setPointerCapture(e.pointerId);
  });
  grip.addEventListener('pointerup', function (e) {
    if (startY === null) return;
    var dy = e.clientY - startY;
    startY = null;
    if (dy < -36) apply(index + 1);
    else if (dy > 36) apply(index - 1);
  });

  // Al abrir la ficha de detalle, la hoja se recoge (el CSS ya la baja con body.sheet-open); al
  // cerrarla, vuelve a su altura media para que el hub siga siendo el punto de partida.
  var obs = new MutationObserver(function () {
    if (!document.body.classList.contains('sheet-open') && index === 0) apply(1);
  });
  obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // Cambiar de pestaña inferior devuelve la hoja a su altura media.
  document.querySelectorAll('.mobile-nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { apply(1); });
  });
})();
