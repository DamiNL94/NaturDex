# Verificación de presencia y antitrampas

## El problema que resuelve

Hasta la v1 del catálogo de logros, **todos** se podían conseguir sin pisar un solo espacio
protegido. Bastaba con abrir la app y pulsar "marcar como vista" en cada ficha: el progreso de
cuenta contaba un parque como visitado en cuanto había *algo* marcado, la constancia se medía por
"días en los que marqué algo", y hasta el logro de "avistamientos con GPS" se cumplía con cualquier
coordenada que diera el navegador, aunque fuese la del salón de tu casa. Un logro que se puede
conseguir desde el sofá no dice nada de quien lo tiene, y esta es una app cuyo sentido entero es que
la gente salga al campo.

Desde la v2, la regla es una y no admite excepciones:

> Para los logros no cuenta lo que marcas, sino lo que marcaste **estando allí**.

## El modelo: la visita verificada

La unidad de verdad no es la marca, es la **visita** (`user_park_visits`). La app va enviando
posiciones del GPS mientras estás en el espacio; el servidor valida cada una contra el **límite
oficial** del parque y las acumula. Una visita pasa a `verified` cuando hay **presencia sostenida**,
no cuando llega una coordenada suelta:

| Regla | Valor | Constante |
|---|---|---|
| Posiciones válidas mínimas | 3 | `PRESENCE_MIN_FIXES` |
| ...repartidas en al menos | 5 min | `PRESENCE_MIN_DWELL_S` |
| Precisión peor aceptada | ±100 m | `PRESENCE_MAX_ACCURACY_M` |
| Margen por fuera del límite | ≤50 m, y nunca más que la precisión declarada | `PRESENCE_TOLERANCE_M` |
| Silencio que cierra la visita | 45 min | `PRESENCE_SESSION_GAP_S` |

Y una marca (especie o punto de interés) cuenta si su hora cae dentro de la ventana de una visita
verificada **a ese mismo espacio**, con un margen de 10 min antes (llegaste y marcaste antes de que
el GPS cuajara) y 15 min después (seguiste marcando con el móvil ya en el bolsillo).

Lo importante de este diseño es que la verificación **no se decide al marcar**, sino al agregar: una
visita tarda unos minutos en cuajar, así que lo que marcaste en el minuto 2 se valida solo cuando la
visita llega al minuto 5. El usuario no tiene que hacer nada ni entender nada de esto.

### Por qué presencia y no GPS por cada marca

Exigir una coordenada propia dentro del límite en el instante exacto de cada marca sería más
estricto y bastante peor: bajo pinar cerrado, en un barranco o dentro de una cueva el GPS falla o da
±300 m, y el usuario vería cómo el bicho que acaba de identificar no le cuenta *por culpa de la
cobertura*. La presencia sostenida es más difícil de falsificar (hay que sostener una traza
coherente en el tiempo, no acertar un punto) y no castiga a quien está haciendo las cosas bien.

Los avistamientos con coordenada propia dentro del límite siguen existiendo, pero como categoría
propia y más exigente: **registros georreferenciados** (`gpsSightings`), que es el dato con valor
científico real.

## Capas antitrampa

Ninguna capa es infalible por separado; juntas suben mucho el coste de hacer trampas, que es de lo
que se trata.

1. **Nada se decide en el cliente.** El frontend solo aporta lat/lng/precisión. Quién está dentro
   del parque lo dice `Backend/Lib/geo.php` leyendo el GeoJSON oficial (`geo/parque.geojson`), el
   mismo que pinta el mapa. Manipular el JavaScript de la app no cambia ni un logro.
2. **La hora la pone el servidor.** Solo la cola offline puede aportar su `capturedAt`, y pasa por
   un filtro: ni del futuro (margen de 5 min para relojes adelantados) ni de hace más de 7 días.
3. **Coherencia espacio-temporal.** Entre dos posiciones consecutivas —también entre parques
   distintos— se comprueba la velocidad implícita. Más de 120 km/h en un salto de más de 300 m marca
   la visita (`salto_imposible`): o ibas en avión o la posición es falsa.
4. **Detección de GPS congelado.** Un GPS real nunca devuelve dos veces la misma coordenada al
   metro; siempre baila unos metros. Seis posiciones seguidas idénticas marcan la visita
   (`gps_congelado`), que es la firma clásica de una ubicación fijada a mano.
5. **Ritmo humano.** Nadie identifica cuarenta especies en un minuto. Cada visita solo avala tantas
   marcas como dé de sí su duración (3/min, con un suelo de 10 para no castigar una visita corta y
   buena). Al pasarse, se descartan las **últimas**: lo primero que viste sigue contando.
6. **Anti-inundación.** Posiciones separadas menos de 5 s no cuentan como presencia: no se puede
   inflar `fix_count` a base de repetir la misma coordenada muy rápido.
7. **Cuarentena, no castigo.** Una visita marcada no puntúa, pero no se borra, no bloquea la cuenta
   ni acusa a nadie: los falsos positivos existen (un tren que bordea el parque, un GPS averiado). El
   campo `flags` guarda el motivo para poder auditarlo.

## Qué NO cubre (y hay que decirlo)

- **Ubicación simulada en el dispositivo.** Un Android con "ubicación simulada" activada y una app
  de mock GPS puede pasear un punto falso por dentro del polígono a velocidad de peatón. Las capas
  3, 4 y 5 obligan a que esa simulación sea *buena* (traza coherente, con jitter, a ritmo humano),
  pero no la impiden. El navegador no expone `isFromMockProvider`.
- **Cola offline manipulada.** Un usuario técnico puede editar el `localStorage` y fabricar
  posiciones. Sigue teniendo que respetar el límite oficial, la monotonía temporal y la velocidad
  máxima, pero es posible.
- **Prestar el móvil.** Nada distingue a la persona del teléfono.

Las dos primeras se cierran de verdad en la **APK (TWA)**, que es el destino del proyecto: allí se
puede leer `Location.isFromMockProvider()` y firmar cada posición con Play Integrity, de modo que el
servidor sepa que el fix viene de un dispositivo real y no de una consola. Está pendiente y no se
finge lo contrario: la web es verificable "a nivel razonable", no a prueba de balas.

Decisión consciente: **no se penaliza la duda**. Ante un caso ambiguo, la app prefiere no dar el
logro a acusar a alguien de tramposo. El coste de equivocarse en un sentido es un logro que llega
tarde; en el otro, insultar a un usuario honesto.

## Privacidad

Que la app compruebe dónde estás no la convierte en un rastreador:

- **No se guarda la traza.** De cada visita solo queda el agregado (cuándo empezó, cuánto duró,
  cuántas posiciones, cuántos metros) y la **última** posición, necesaria para encadenar la
  siguiente y detectar saltos imposibles.
- **No se pide el permiso por sorpresa.** Al entrar a un parque, si la ubicación ya estaba concedida
  se sigue en silencio; si no, la barra de presencia lo *ofrece* y el usuario decide.
- **El seguimiento propio es el mínimo:** baja precisión, una posición por minuto o cada 40 m, y
  solo mientras la pantalla del parque está abierta (salir al selector lo apaga).
- **Sin ubicación la app sigue entera.** Se puede recorrer el catálogo, marcar lo que se quiera y
  guardar el parque sin conexión. Lo único que no se consigue son los logros.

## Honestidad con el usuario

Si los logros dependen de haber estado allí, el usuario tiene derecho a saberlo **antes**, no al
final de la ruta:

- La **barra de presencia** de la cabecera del parque dice en todo momento en cuál de los tres
  estados está: verificada, verificando (con lo que falta) o apagada/fuera del límite.
- La **ficha de cada especie** marcada dice si ese avistamiento concreto está verificado o no.
- Al primer avistamiento sin verificar de la sesión salta **un aviso**, una sola vez, explicando qué
  falta. No bloquea nada.
- La pantalla de **progreso estatal** lista *tus salidas*, con las que se han verificado y las que
  no, y cuenta cuántas marcas tienes sin verificar en el cuaderno.

Nada de esto borra el progreso personal: lo marcado sigue marcado y visible. Lo que cambia es que
solo puntúa lo que se ganó en el campo.

## Mapa de ficheros

| Fichero | Papel |
|---|---|
| `Database/schema.sql` · `migrations.sql` | Tabla `user_park_visits`. |
| `Backend/Lib/geo.php` | Carga el límite oficial del espacio y responde "¿está dentro?" / "¿a cuántos metros?". |
| `Backend/Lib/presence.php` | Todas las reglas de arriba: valida cada posición, acumula la visita y decide la verificación. |
| `Backend/Api/presence.php` | Único punto de entrada de posiciones (una suelta o un lote de la cola offline). |
| `Backend/Api/progress.php` | Sella la hora de cada marca (`markedAt`) y alimenta la presencia con las coordenadas de los avistamientos. |
| `Backend/Lib/account_progress.php` | Cruza marcas con visitas verificadas: es donde se decide qué cuenta. |
| `Frontend/Js/presence.js` | Envío de posiciones, predicción offline y barra de estado. |
| `Frontend/Data/achievements.json` | Catálogo de logros (todos de campo). |
| `Tools/test-presence-rules.php` | Prueba de las reglas sin BD: `php Tools/test-presence-rules.php`. |

## Ajustar las reglas

Todos los umbrales son constantes al principio de `Backend/Lib/presence.php`. Si se tocan los del
cupo de marcas (`PRESENCE_MARKS_PER_MINUTE`, `PRESENCE_MARKS_FLOOR`), hay que tocar también sus
espejos en `Frontend/Js/achievements.js` (`MARKS_PER_MINUTE`, `MARKS_FLOOR`), que solo sirven para
predecir sin cobertura. El resto de reglas vive únicamente en el servidor, que es donde debe estar.
