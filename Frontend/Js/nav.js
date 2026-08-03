/*
 * nav.js — pila de navegación de NaturDex (el botón «atrás» del móvil incluido).
 *
 * EL PROBLEMA QUE RESUELVE
 * ------------------------
 * NaturDex es una sola página: las «pantallas» (portada, acceso, selector, parque, perfil…), las
 * pestañas de la nav inferior, la ficha deslizante y los globos del mapa se abren y se cierran
 * mostrando y ocultando nodos, sin tocar el historial del navegador. Para el navegador todo eso era
 * UNA sola entrada, así que el botón «atrás» del móvil (y el gesto de deslizar desde el borde, que
 * es lo que usa la mayoría de la gente) no deshacía el último paso: sacaba de la web entera.
 *
 * Este módulo convierte cada cosa que se abre en un NIVEL apilado, con su entrada de historial. A
 * partir de aquí «atrás» significa siempre lo mismo —deshacer el último paso— venga del botón de la
 * app, de la tecla Escape o del sistema operativo.
 *
 * CÓMO FUNCIONA
 * -------------
 * - `levels` es la pila de lo que está abierto. Cada nivel sabe cerrarse a sí mismo (`close`).
 * - Cada nivel abierto añade una entrada de historial que lleva escrita la PROFUNDIDAD de la pila
 *   ({ nd: { depth } }). El historial no guarda qué había abierto, solo cuántos niveles: al volver
 *   atrás basta con desapilar hasta esa profundidad, así que da igual por qué camino se llegó.
 * - Cerrar a mano (botón ← o ✕) desapila en el acto y además retrocede en el historial, para que la
 *   pila y el historial no se separen nunca. El manejador de `popstate` es idempotente: si ya se
 *   desapiló, no hace nada.
 * - En la raíz («no hay nada abierto») el «atrás» del sistema saldría de la app. Ahí se pide
 *   confirmación con el patrón de siempre en Android: pulsar dos veces seguidas para salir.
 *
 * API (window.NaturDexNav):
 *   open(key, close)   abre un nivel (si ya existía, cierra lo que tuviera encima y lo reutiliza)
 *   replaceTop(k, c)   cambia el nivel de arriba por otro sin apilar un paso más
 *   close(key)         cierra ese nivel y todo lo que tenga encima
 *   closeAbove(key)    cierra solo lo que tenga encima
 *   back()             cierra el nivel de arriba (equivalente al «atrás» del sistema)
 *   has(key) / depth() consulta
 *   setExitGuard(bool) activa/desactiva el «pulsa atrás otra vez para salir»
 *   reset()            vacía la pila sin cerrar nada (al cerrar sesión)
 */
(function () {
  'use strict';

  var levels = [];         // [{ key, close }] — de fuera hacia dentro
  var exitGuard = false;   // ¿avisar antes de dejar salir de la app?
  var exitArmedAt = 0;     // momento del primer «atrás» en la raíz
  var supported = true;    // el historial puede fallar (file://, navegadores exóticos)
  var started = false;
  var EXIT_WINDOW = 3500;  // ms que dura el aviso de salida

  function ndState(s) { return s && s.nd ? s.nd : null; }

  function pushHistory(depth) {
    if (!supported) return;
    try { history.pushState({ nd: { depth: depth } }, ''); } catch (e) { supported = false; }
  }
  function replaceHistory(depth, root) {
    if (!supported) return;
    try { history.replaceState({ nd: { depth: depth, root: !!root } }, ''); } catch (e) { supported = false; }
  }

  // Desapila (cerrando) hasta dejar exactamente `depth` niveles abiertos. Se saca el nivel de la
  // pila ANTES de llamar a su cierre: muchos cierres provocan el evento que volvería a llamar aquí
  // (cerrar un globo del mapa dispara 'popupclose'), y así esa segunda llamada no encuentra nada.
  function unwindTo(depth) {
    while (levels.length > depth) {
      var level = levels.pop();
      try { level.close(); } catch (e) { console.info('NaturDexNav: fallo al cerrar «' + level.key + '»', e); }
    }
  }

  function indexOf(key) {
    for (var i = levels.length - 1; i >= 0; i--) if (levels[i].key === key) return i;
    return -1;
  }

  function open(key, close) {
    init();
    var at = indexOf(key);
    if (at !== -1) {
      // Reabrir algo que ya estaba abierto (cambiar de hábitat sin salir del hábitat, por ejemplo):
      // se cierra lo que tenga encima y se reutiliza su nivel, en vez de apilar un duplicado.
      unwindTo(at + 1);
      levels[at].close = close;
      replaceHistory(levels.length);
      return;
    }
    levels.push({ key: key, close: close });
    pushHistory(levels.length);
  }

  // Sustituye el nivel de arriba por otro SIN apilar un paso nuevo ni cerrar el anterior: el camino
  // recorrido cambia de nombre, no crece. Es lo que pasa al identificarse (acceso → selector):
  // volver atrás desde el selector tiene que llevar a la portada, no de vuelta al formulario que el
  // usuario acaba de rellenar con éxito.
  function replaceTop(key, close) {
    init();
    if (!levels.length) { open(key, close); return; }
    levels[levels.length - 1] = { key: key, close: close };
    replaceHistory(levels.length);
  }

  // Cierra `key` y todo lo que tenga encima. Devuelve false si ese nivel no estaba abierto, para
  // que quien llama pueda hacer lo suyo a mano (es lo que pasa en escritorio, donde la ficha y el
  // mapa se ven a la vez y no hay nada apilado).
  function closeKey(key) {
    var at = indexOf(key);
    if (at === -1) return false;
    var delta = at - levels.length;   // negativo: cuántas entradas de historial sobran
    unwindTo(at);
    if (delta && supported) { try { history.go(delta); } catch (e) {} }
    return true;
  }

  function closeAbove(key) {
    var at = indexOf(key);
    if (at === -1) return false;
    var delta = (at + 1) - levels.length;
    unwindTo(at + 1);
    if (delta && supported) { try { history.go(delta); } catch (e) {} }
    return true;
  }

  function back() {
    if (!levels.length) return false;
    return closeKey(levels[levels.length - 1].key);
  }

  // --- Salir de la app: pulsar «atrás» dos veces --------------------------------------------------
  // Estando ya en la raíz de la app (portada o selector, sin nada abierto encima), «atrás» saca de
  // la web. Salir sin querer de una guía que se está usando en el campo, con datos de progreso a
  // medias, es lo bastante molesto como para pedir una segunda pulsación.
  function toast(text) {
    var el = document.getElementById('navExitToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'navExitToast';
      el.className = 'nav-exit-toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('in');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('in'); }, EXIT_WINDOW - 300);
  }

  function onExitAttempt() {
    if (!exitGuard) { leave(); return; }
    if (exitArmedAt && Date.now() - exitArmedAt < EXIT_WINDOW) { exitArmedAt = 0; leave(); return; }
    exitArmedAt = Date.now();
    pushHistory(0);  // se vuelve a la entrada «centinela»: de momento no se sale
    toast('Pulsa «atrás» otra vez para salir de NaturDex');
  }

  function leave() {
    // Ya estamos en la primera entrada de esta página: un paso más atrás sale de verdad. Si no hay
    // nada antes (pestaña nueva, app instalada), el navegador no hace nada y aquí no pasa nada.
    if (supported) { try { history.go(-1); } catch (e) {} }
  }

  function onPopState(event) {
    var nd = ndState(event.state);
    if (nd && nd.root) { unwindTo(0); onExitAttempt(); return; }
    var depth = nd && typeof nd.depth === 'number' ? nd.depth : 0;
    if (depth < levels.length) { unwindTo(depth); return; }
    if (depth > levels.length) {
      // Hacia delante después de haber cerrado a mano: no se puede reabrir lo que ya se cerró, así
      // que se normaliza la entrada actual a la profundidad real.
      replaceHistory(levels.length);
    }
    // depth === levels.length: se ha vuelto a la entrada centinela (la raíz de la app) o ya estaba
    // todo desapilado. No hay nada que cerrar; salir de la app solo lo decide la rama `nd.root`.
  }

  // La entrada original de la página queda marcada como raíz y encima se deja una entrada
  // «centinela»: sin ella, el «atrás» de la raíz no dispararía `popstate` (se saldría de la página
  // directamente) y no habría forma de avisar antes de salir.
  function init() {
    if (started) return;
    started = true;
    replaceHistory(0, true);
    pushHistory(0);
    window.addEventListener('popstate', onPopState);
  }

  window.NaturDexNav = {
    init: init,
    open: open,
    replaceTop: replaceTop,
    close: closeKey,
    closeAbove: closeAbove,
    back: back,
    has: function (key) { return indexOf(key) !== -1; },
    depth: function () { return levels.length; },
    setExitGuard: function (on) { exitGuard = !!on; if (!on) exitArmedAt = 0; },
    // Vacía la pila sin cerrar nada (cerrar sesión: la app vuelve a la portada de una pieza) y
    // deshace de golpe las entradas de historial que había apiladas, para que «atrás» no se quede
    // dando pasos que ya no llevan a ninguna parte.
    reset: function () {
      var depth = levels.length;
      levels.length = 0;
      exitArmedAt = 0;
      if (depth && supported) { try { history.go(-depth); } catch (e) {} }
    }
  };
})();
