// ================================================================================================
// visor.js — la foto de la ficha, a pantalla completa y ampliable.
// ------------------------------------------------------------------------------------------------
// EL PROBLEMA QUE RESUELVE
// Las fichas fijan la foto a 340 px en escritorio y 240 en móvil (`.detail-panel img`), y no había
// forma de verla más grande. En una ficha de identificación —distinguir dos jaras por el nervio de
// la hoja, un lagarto por el dibujo del costado— eso es justo lo que hace falta, y más aún para
// quien tiene la vista cansada: la foto pequeña obliga a acercar el móvil a la cara.
//
// Aquí la foto se abre a pantalla completa y admite pellizco, doble toque y rueda del ratón. Debajo
// va SIEMPRE la atribución: hay fotos en el catálogo cuya licencia obliga a citarla, y ampliada es
// cuando más se mira (deuda nº 7 de Docs/DEUDA-TECNICA.md).
//
// DECISIONES QUE IMPORTAN
// - Un solo botón de cerrar, grande y rotulado, arriba a la derecha: fuera del recorrido del pulgar
//   que arrastra la imagen. Se cierra además con Escape, con «atrás» del móvil (pila de nav.js,
//   clave 'visor') y arrastrando hacia abajo, que es el gesto que la gente prueba primero.
// - Solo se abre sobre fotos REALES. Los sustitutos generados (render/fallbacks.js, y las portadas
//   con emoji de util.js) no se marcan como ampliables: no hay nada que ampliar y un control que no
//   hace nada al pulsarlo desconcierta más que ayudar.
// - El módulo no se engancha a nada: los clicks entran por delegación desde app.js, como el resto.
// ================================================================================================

const ESCALA_MIN = 1;
const ESCALA_MAX = 6;
const ESCALA_DOBLE_TOQUE = 2.5;   // lo que acerca un doble toque desde el tamaño de entrada
const ARRASTRE_PARA_CERRAR = 110; // px hacia abajo, sin zoom, que cierran el visor

let overlay = null, escenaEl = null, imagenEl = null, pieEl = null, errorEl = null, cerrarBtn = null;
let escala = 1, tx = 0, ty = 0;
let abridor = null;                 // a quién devolver el foco al cerrar

// Punteros activos (ratón, dedo o lápiz). Con uno se arrastra; con dos se pellizca.
const punteros = new Map();
let gesto = null;                   // instantánea al empezar el gesto (ver alPunteroBaja)
let ultimoToque = 0, ultimoToqueX = 0, ultimoToqueY = 0;

function acota(v, min, max) { return Math.max(min, Math.min(max, v)); }

export function visorAbierto() { return !!overlay && !overlay.hidden; }

// El overlay se crea perezosamente la primera vez, igual que el popover del glosario y el tutorial:
// la inmensa mayoría de las sesiones no llegan a abrirlo.
function creaOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'visor';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Foto ampliada');
  overlay.innerHTML =
    '<button type="button" class="visor-close">' +
      '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '<span>Cerrar</span>' +
    '</button>' +
    '<figure class="visor-figure">' +
      '<div class="visor-stage">' +
        '<img class="visor-img" alt="" draggable="false">' +
        '<p class="visor-error" hidden>No se ha podido cargar la foto. Si estás sin cobertura, guarda el parque antes de salir de ruta.</p>' +
      '</div>' +
      '<figcaption class="visor-caption"></figcaption>' +
    '</figure>';
  document.body.appendChild(overlay);

  escenaEl = overlay.querySelector('.visor-stage');
  imagenEl = overlay.querySelector('.visor-img');
  pieEl = overlay.querySelector('.visor-caption');
  errorEl = overlay.querySelector('.visor-error');
  cerrarBtn = overlay.querySelector('.visor-close');

  // La ficha no abre el visor sobre un sustituto (render/fallbacks.js ya se lo impide), pero la
  // foto real puede fallar aquí igualmente: sin caché y sin cobertura, la pantalla se quedaría
  // negra y muda. Se dice lo que ha pasado y qué hacer para que no vuelva a pasar.
  imagenEl.addEventListener('error', () => {
    imagenEl.hidden = true;
    errorEl.hidden = false;
  });

  cerrarBtn.addEventListener('click', cierra);
  escenaEl.addEventListener('pointerdown', alPunteroBaja);
  escenaEl.addEventListener('pointermove', alPunteroMueve);
  escenaEl.addEventListener('pointerup', alPunteroSube);
  escenaEl.addEventListener('pointercancel', alPunteroSube);
  escenaEl.addEventListener('wheel', alRueda, { passive: false });
  // El doble toque se detecta a mano en alPunteroSube, y sirve igual para el dedo y para el ratón:
  // los dos llegan por eventos de puntero. Escuchar ADEMÁS 'dblclick' parecía inofensivo y no lo
  // era —con el ratón se disparaban los dos caminos, el zoom se alternaba dos veces seguidas y la
  // foto se quedaba exactamente como estaba—, así que aquí no hay más listener que el de punteros.

  // En captura y cortando la propagación: Escape no puede cerrar además la ficha de debajo o el
  // panel de capas, que también lo escuchan en document (app.js, glossary.js).
  window.addEventListener('keydown', alTeclado, true);
  window.addEventListener('resize', () => { if (visorAbierto()) reponEncuadre(); });
  return overlay;
}

function alTeclado(event) {
  if (!visorAbierto()) return;
  if (event.key === 'Escape') { event.stopPropagation(); cierra(); return; }
  if (event.key === 'Tab') {
    // Solo hay un control dentro (el botón de cerrar), pero el pie puede traer el enlace de la
    // licencia: el ciclo se calcula, no se da por supuesto.
    const focos = Array.from(overlay.querySelectorAll('button, [href]')).filter(el => !el.hidden);
    if (!focos.length) return;
    const primero = focos[0], ultimo = focos[focos.length - 1];
    if (event.shiftKey && (document.activeElement === primero || !overlay.contains(document.activeElement))) {
      event.preventDefault(); ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault(); primero.focus();
    } else if (!overlay.contains(document.activeElement)) {
      event.preventDefault(); primero.focus();
    }
  }
}

// --- Encuadre ------------------------------------------------------------------------------------
// La imagen se dibuja con `translate(...) scale(...)` sobre su tamaño de maquetación. El orden
// importa: un punto x de la imagen cae en pantalla en t + escala·x, y de ahí sale la fórmula de
// «acercar sin que se mueva lo que hay debajo del dedo» que usan el pellizco y la rueda.
function pinta() {
  if (!imagenEl) return;
  imagenEl.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + escala + ')';
  overlay.classList.toggle('is-zoomed', escala > 1.01);
}

// Con la imagen ampliada, sus bordes no pueden meterse dentro del hueco visible: si no, un arrastre
// largo la deja fuera de la pantalla y parece que se ha perdido.
function acotaDesplazamiento() {
  if (!imagenEl || !escenaEl) return;
  const ancho = imagenEl.offsetWidth * escala;
  const alto = imagenEl.offsetHeight * escala;
  const maxX = Math.max(0, (ancho - escenaEl.clientWidth) / 2);
  const maxY = Math.max(0, (alto - escenaEl.clientHeight) / 2);
  tx = acota(tx, -maxX, maxX);
  ty = acota(ty, -maxY, maxY);
}

function reponEncuadre() { acotaDesplazamiento(); pinta(); }

function fijaEscala(nueva, pantallaX, pantallaY) {
  const anterior = escala;
  escala = acota(nueva, ESCALA_MIN, ESCALA_MAX);
  if (escala === anterior) return;
  const caja = escenaEl.getBoundingClientRect();
  // Punto de anclaje relativo al centro de la escena (el origen de la transformación).
  const px = pantallaX - (caja.left + caja.width / 2);
  const py = pantallaY - (caja.top + caja.height / 2);
  // Lo que había bajo ese punto sigue estando bajo ese punto tras cambiar la escala.
  tx = px - ((px - tx) / anterior) * escala;
  ty = py - ((py - ty) / anterior) * escala;
  if (escala === ESCALA_MIN) { tx = 0; ty = 0; }
  reponEncuadre();
}

function alternaZoom(x, y) {
  if (escala > 1.01) fijaEscala(ESCALA_MIN, x, y);
  else fijaEscala(ESCALA_DOBLE_TOQUE, x, y);
}

// --- Gestos ---------------------------------------------------------------------------------------
function distancia(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function alPunteroBaja(event) {
  punteros.set(event.pointerId, { x: event.clientX, y: event.clientY });
  escenaEl.setPointerCapture(event.pointerId);
  const activos = Array.from(punteros.values());
  if (activos.length === 1) {
    gesto = { tipo: escala > 1.01 ? 'arrastre' : 'cierre', x: activos[0].x, y: activos[0].y, tx, ty, movido: 0 };
  } else if (activos.length === 2) {
    gesto = {
      tipo: 'pellizco',
      dist: distancia(activos[0], activos[1]) || 1,
      escala, tx, ty,
      midX: (activos[0].x + activos[1].x) / 2,
      midY: (activos[0].y + activos[1].y) / 2
    };
  }
}

function alPunteroMueve(event) {
  if (!punteros.has(event.pointerId) || !gesto) return;
  punteros.set(event.pointerId, { x: event.clientX, y: event.clientY });
  const activos = Array.from(punteros.values());

  if (gesto.tipo === 'pellizco' && activos.length >= 2) {
    event.preventDefault();
    const dist = distancia(activos[0], activos[1]) || 1;
    const midX = (activos[0].x + activos[1].x) / 2;
    const midY = (activos[0].y + activos[1].y) / 2;
    const caja = escenaEl.getBoundingClientRect();
    const cx = caja.left + caja.width / 2, cy = caja.top + caja.height / 2;
    escala = acota(gesto.escala * (dist / gesto.dist), ESCALA_MIN, ESCALA_MAX);
    // Mismo anclaje que fijaEscala, pero con el punto medio de los dos dedos: la parte de la foto
    // que estaba entre ellos se queda entre ellos aunque además se desplacen.
    const px0 = gesto.midX - cx, py0 = gesto.midY - cy;
    tx = (midX - cx) - ((px0 - gesto.tx) / gesto.escala) * escala;
    ty = (midY - cy) - ((py0 - gesto.ty) / gesto.escala) * escala;
    reponEncuadre();
    return;
  }

  if (activos.length !== 1) return;
  const dx = activos[0].x - gesto.x;
  const dy = activos[0].y - gesto.y;
  gesto.movido = Math.max(gesto.movido, Math.hypot(dx, dy));

  if (gesto.tipo === 'arrastre') {
    event.preventDefault();
    tx = gesto.tx + dx;
    ty = gesto.ty + dy;
    reponEncuadre();
    return;
  }
  // Sin zoom, el arrastre hacia abajo cierra: mientras dura, el visor sigue al dedo y se atenúa,
  // para que se vea que el gesto está haciendo algo antes de soltar.
  if (gesto.tipo === 'cierre' && dy > 0) {
    event.preventDefault();
    overlay.style.transform = 'translateY(' + dy + 'px)';
    overlay.style.opacity = String(Math.max(0.35, 1 - dy / (ARRASTRE_PARA_CERRAR * 2.5)));
  }
}

function alPunteroSube(event) {
  const activo = punteros.get(event.pointerId);
  punteros.delete(event.pointerId);
  if (escenaEl.hasPointerCapture(event.pointerId)) escenaEl.releasePointerCapture(event.pointerId);

  if (gesto && gesto.tipo === 'cierre' && activo) {
    const dy = activo.y - gesto.y;
    overlay.style.transform = '';
    overlay.style.opacity = '';
    if (dy > ARRASTRE_PARA_CERRAR) { gesto = null; punteros.clear(); cierra(); return; }
    // Doble toque: dos toques cortos, seguidos y en el mismo sitio. Se comprueba aquí y no con
    // 'dblclick' porque en móvil ese evento llega con retraso y a veces no llega.
    if (gesto.movido < 12) {
      const ahora = Date.now();
      if (ahora - ultimoToque < 320 && Math.hypot(activo.x - ultimoToqueX, activo.y - ultimoToqueY) < 40) {
        ultimoToque = 0;
        alternaZoom(activo.x, activo.y);
      } else {
        ultimoToque = ahora; ultimoToqueX = activo.x; ultimoToqueY = activo.y;
      }
    }
  }
  if (!punteros.size) gesto = null;
  else if (punteros.size === 1) {
    // Se ha soltado un dedo del pellizco: el que queda pasa a arrastrar desde donde está.
    const resto = Array.from(punteros.values())[0];
    gesto = { tipo: escala > 1.01 ? 'arrastre' : 'cierre', x: resto.x, y: resto.y, tx, ty, movido: 99 };
  }
}

function alRueda(event) {
  event.preventDefault();
  const paso = event.deltaY < 0 ? 1.15 : 1 / 1.15;
  fijaEscala(escala * paso, event.clientX, event.clientY);
}

// --- API pública ----------------------------------------------------------------------------------
/**
 * Abre la foto de una ficha a pantalla completa.
 * `foto` es el <img> de la ficha; su `alt` y su `data-zoom-credit` viajan al visor tal cual, para
 * que la atribución que obliga la licencia se siga viendo ampliada.
 */
export function abreVisor(foto) {
  if (!foto || !foto.getAttribute('src')) return;
  creaOverlay();
  abridor = document.activeElement;
  imagenEl.hidden = false;
  errorEl.hidden = true;
  imagenEl.src = foto.currentSrc || foto.src;
  imagenEl.alt = foto.alt || '';
  const credito = foto.dataset.zoomCredit || '';
  pieEl.textContent = credito;
  pieEl.hidden = !credito;
  escala = 1; tx = 0; ty = 0;
  punteros.clear(); gesto = null;
  overlay.style.transform = ''; overlay.style.opacity = '';
  pinta();
  overlay.hidden = false;
  document.body.classList.add('visor-open'); // el cuerpo no se desplaza por detrás
  cerrarBtn.focus({ preventScroll: true });
  // Un nivel más de la pila: «atrás» del móvil cierra el visor, no la ficha que hay debajo.
  if (window.NaturDexNav) window.NaturDexNav.open('visor', cierraRaw);
}

// Cierre "público": pasa por la pila para que el historial no se quede con un paso de más.
function cierra() {
  if (!visorAbierto()) return;
  if (window.NaturDexNav && window.NaturDexNav.close('visor')) return;
  cierraRaw();
}

function cierraRaw() {
  if (!visorAbierto()) return;
  overlay.hidden = true;
  overlay.style.transform = ''; overlay.style.opacity = '';
  document.body.classList.remove('visor-open');
  imagenEl.removeAttribute('src');
  punteros.clear(); gesto = null;
  // El foco vuelve a la foto desde la que se abrió: cerrar no puede dejar al teclado en el limbo.
  if (abridor && document.contains(abridor) && abridor.getClientRects().length) {
    abridor.focus({ preventScroll: true });
  }
  abridor = null;
}
