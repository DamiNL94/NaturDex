<?php
// ================================================================================================
// presence.php — VERIFICACIÓN DE PRESENCIA: la prueba de que el usuario estuvo de verdad en el campo.
// ------------------------------------------------------------------------------------------------
// Por qué existe: hasta ahora un logro se ganaba pulsando "marcar como vista" desde el sofá. Nada
// obligaba a pisar un espacio protegido, así que la colección entera se podía completar sin salir de
// casa y los logros no significaban nada. Desde aquí, lo que cuenta para los logros no es lo que el
// usuario marca, sino DÓNDE ESTABA cuando lo marcó.
//
// Modelo: la "visita" (una fila de user_park_visits). La app va enviando posiciones del GPS
// (Frontend/Js/presence.js) mientras se está en el parque; cada una se valida aquí contra el límite
// oficial (Backend/Lib/geo.php) y se acumula en la visita abierta. Una visita pasa a VERIFICADA
// cuando hay presencia sostenida (varios fixes repartidos en varios minutos), no con una coordenada
// suelta. Todo lo que el usuario marque durante la ventana de una visita verificada cuenta; lo demás
// se guarda igual, pero no puntúa (ver Backend/Lib/account_progress.php).
//
// Ninguna de estas decisiones se toma en el cliente: el cliente solo aporta lat/lng/precisión y el
// servidor dice si eso vale. Ver el modelo de amenazas completo en Docs/VERIFICACION-Y-ANTITRAMPAS.md.
// ================================================================================================

require_once __DIR__ . "/geo.php";

// --- Reglas (todas ajustables desde aquí; el frontend no conoce ninguna) -------------------------
const PRESENCE_MAX_ACCURACY_M    = 100;    // peor precisión del GPS que se acepta para validar
const PRESENCE_TOLERANCE_M       = 50;     // margen máximo por fuera del límite (el GPS no es un bisturí)
const PRESENCE_SESSION_GAP_S     = 2700;   // 45 min sin fixes ⇒ la próxima posición abre una visita nueva
const PRESENCE_MIN_FIXES         = 3;      // presencia sostenida: no basta con una coordenada suelta
const PRESENCE_MIN_DWELL_S       = 300;    // ...repartidos en al menos 5 minutos
const PRESENCE_MIN_FIX_INTERVAL_S = 5;     // anti-inundación: más rápido que esto no aporta información
const PRESENCE_MAX_SPEED_KMH     = 120;    // por encima, o vas en avión o el GPS es falso
const PRESENCE_MIN_JUMP_M        = 300;    // por debajo, la "velocidad" es ruido del GPS, no movimiento
const PRESENCE_FROZEN_LIMIT      = 6;      // fixes seguidos con la coordenada EXACTA ⇒ posición simulada
const PRESENCE_BACKFILL_MAX_S    = 604800; // 7 días: antigüedad máxima de un fix subido desde la cola offline
const PRESENCE_FUTURE_SKEW_S     = 300;    // margen para relojes de móvil adelantados
// Ventana en la que una marca (especie/POI) se considera hecha "durante" la visita.
const PRESENCE_MARK_PRE_GRACE_S  = 600;    // marcaste nada más llegar y el primer fix tardó en cuajar
const PRESENCE_MARK_POST_GRACE_S = 900;    // seguiste marcando con el móvil ya en el bolsillo
// Ritmo humano: nadie identifica 40 especies en un minuto. Tope de marcas verificables por visita.
const PRESENCE_MARKS_PER_MINUTE  = 3;
const PRESENCE_MARKS_FLOOR       = 10;     // ...con un suelo, para no castigar una visita corta y buena

/** Fecha UTC en el formato de MySQL. */
function presenceNow() { return gmdate("Y-m-d H:i:s"); }

/**
 * Normaliza el instante de un fix. Los fixes en vivo llevan la hora del SERVIDOR (el cliente no
 * decide cuándo ocurrió algo); solo los que vienen de la cola offline pueden aportar su `capturedAt`,
 * y aun así dentro de una ventana razonable: ni del futuro ni de hace más de una semana.
 * @return string|null Fecha UTC válida, o null si la marca de tiempo no es admisible.
 */
function presenceResolveTimestamp($capturedAt) {
    $now = time();
    if (!$capturedAt) return gmdate("Y-m-d H:i:s", $now);
    $ts = strtotime((string) $capturedAt);
    if ($ts === false) return null;
    if ($ts > $now + PRESENCE_FUTURE_SKEW_S) return null;      // reloj del móvil en el futuro
    if ($ts < $now - PRESENCE_BACKFILL_MAX_S) return null;     // demasiado viejo para fiarse
    return gmdate("Y-m-d H:i:s", min($ts, $now));
}

/** Visita abierta que puede absorber un fix en el instante $at (o null si toca abrir una nueva). */
function presenceOpenVisit($conn, $userId, $parkSlug, $at) {
    $stmt = $conn->prepare(
        "SELECT * FROM user_park_visits
         WHERE user_id = ? AND park_slug = ?
           AND ? BETWEEN DATE_SUB(started_at, INTERVAL ? SECOND) AND DATE_ADD(last_fix_at, INTERVAL ? SECOND)
         ORDER BY last_fix_at DESC LIMIT 1"
    );
    $gap = PRESENCE_SESSION_GAP_S;
    $stmt->bind_param("issii", $userId, $parkSlug, $at, $gap, $gap);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc() ?: null;
}

/** Último fix del usuario en CUALQUIER parque: base del control de saltos imposibles entre espacios. */
function presenceLastFixAnywhere($conn, $userId) {
    $stmt = $conn->prepare(
        "SELECT park_slug, last_fix_at, last_lat, last_lng FROM user_park_visits
         WHERE user_id = ? AND last_lat IS NOT NULL ORDER BY last_fix_at DESC LIMIT 1"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc() ?: null;
}

/** Añade un motivo de sospecha (sin duplicar) al JSON de flags de una visita. */
function presenceAddFlag($flagsJson, $flag) {
    $flags = $flagsJson ? (json_decode($flagsJson, true) ?: []) : [];
    if (!in_array($flag, $flags, true)) $flags[] = $flag;
    return json_encode(array_values($flags), JSON_UNESCAPED_UNICODE);
}

/**
 * Registra una posición del GPS contra el límite oficial del parque y la acumula en la visita.
 *
 * @param array $fix { lat, lng, accuracy?, capturedAt? }
 * @return array {
 *   accepted:  bool    ¿el fix ha entrado a formar parte de una visita?
 *   verified:  bool    ¿la visita ya cuenta como presencia verificada?
 *   reason:    string  código estable para que el frontend explique el estado en castellano
 *   distanceM: float   metros hasta el límite (0 = dentro) — sirve para "estás a 1,2 km del parque"
 *   visitId, fixCount, dwellSeconds, suspicious
 * }
 */
function presenceRegisterFix($conn, $userId, $parkSlug, $fix) {
    $lat = isset($fix["lat"]) && is_numeric($fix["lat"]) ? (float) $fix["lat"] : null;
    $lng = isset($fix["lng"]) && is_numeric($fix["lng"]) ? (float) $fix["lng"] : null;
    if ($lat === null || $lng === null || abs($lat) > 90 || abs($lng) > 180) {
        return ["accepted" => false, "verified" => false, "reason" => "coordenada_invalida"];
    }
    $accuracy = isset($fix["accuracy"]) && is_numeric($fix["accuracy"]) ? (float) $fix["accuracy"] : null;
    $at = presenceResolveTimestamp($fix["capturedAt"] ?? null);
    if ($at === null) {
        return ["accepted" => false, "verified" => false, "reason" => "marca_de_tiempo_invalida"];
    }

    $boundary = naturdexParkBoundary($parkSlug);
    if (!$boundary) {
        // Espacio sin límite publicado todavía: no se puede verificar nada, y se dice claramente en
        // vez de dar por buena una presencia que nadie ha comprobado.
        return ["accepted" => false, "verified" => false, "reason" => "espacio_sin_limite"];
    }

    // La tolerancia nunca supera la precisión declarada: un fix de ±8 m tiene que estar a menos de
    // 8 m del límite, y uno malo no gana margen por ser malo (se corta en PRESENCE_TOLERANCE_M).
    $tolerance = min($accuracy !== null ? $accuracy : PRESENCE_TOLERANCE_M, PRESENCE_TOLERANCE_M);
    $distance = naturdexBoundaryDistanceMeters($boundary, $lat, $lng, $tolerance);
    if ($distance > $tolerance) {
        return ["accepted" => false, "verified" => false, "reason" => "fuera_del_limite", "distanceM" => round($distance)];
    }
    if ($accuracy !== null && $accuracy > PRESENCE_MAX_ACCURACY_M) {
        return ["accepted" => false, "verified" => false, "reason" => "precision_insuficiente", "distanceM" => 0.0];
    }

    // --- Controles de coherencia espacio-temporal -------------------------------------------------
    $suspiciousFlag = null;
    $global = presenceLastFixAnywhere($conn, $userId);
    if ($global && $global["last_lat"] !== null) {
        $dt = strtotime($at) - strtotime($global["last_fix_at"]);
        if ($dt > 0) {
            $jump = naturdexHaversineMeters((float) $global["last_lat"], (float) $global["last_lng"], $lat, $lng);
            $kmh = ($jump / $dt) * 3.6;
            if ($jump > PRESENCE_MIN_JUMP_M && $kmh > PRESENCE_MAX_SPEED_KMH) $suspiciousFlag = "salto_imposible";
        }
    }

    $visit = presenceOpenVisit($conn, $userId, $parkSlug, $at);

    if (!$visit) {
        // Visita nueva. Nace sin verificar: hará falta presencia sostenida para que cuente.
        $flags = $suspiciousFlag ? presenceAddFlag(null, $suspiciousFlag) : null;
        $suspicious = $suspiciousFlag ? 1 : 0;
        $acc = $accuracy !== null ? (int) round($accuracy) : null;
        $stmt = $conn->prepare(
            "INSERT INTO user_park_visits
             (user_id, park_slug, started_at, last_fix_at, fix_count, distance_m, best_accuracy_m,
              last_lat, last_lng, frozen_streak, verified, suspicious, flags)
             VALUES (?, ?, ?, ?, 1, 0, ?, ?, ?, 0, 0, ?, ?)"
        );
        $stmt->bind_param("isssiddis", $userId, $parkSlug, $at, $at, $acc, $lat, $lng, $suspicious, $flags);
        $stmt->execute();
        return [
            "accepted" => true, "verified" => false, "reason" => "visita_iniciada",
            "visitId" => (int) $conn->insert_id, "fixCount" => 1, "dwellSeconds" => 0,
            "suspicious" => (bool) $suspicious, "distanceM" => 0.0,
        ];
    }

    // --- Acumulación sobre la visita abierta -------------------------------------------------------
    $lastAt = strtotime($visit["last_fix_at"]);
    $dt = strtotime($at) - $lastAt;
    if ($dt >= 0 && $dt < PRESENCE_MIN_FIX_INTERVAL_S) {
        // Ráfaga de fixes: no aporta presencia y sí abre la puerta a inflar `fix_count`.
        return [
            "accepted" => false, "verified" => (bool) $visit["verified"], "reason" => "ritmo_excesivo",
            "visitId" => (int) $visit["id"], "fixCount" => (int) $visit["fix_count"],
            "dwellSeconds" => strtotime($visit["last_fix_at"]) - strtotime($visit["started_at"]),
            "suspicious" => (bool) $visit["suspicious"], "distanceM" => 0.0,
        ];
    }

    $segment = 0.0;
    $frozen = (int) $visit["frozen_streak"];
    if ($visit["last_lat"] !== null) {
        $segment = naturdexHaversineMeters((float) $visit["last_lat"], (float) $visit["last_lng"], $lat, $lng);
        // Un GPS real nunca da dos veces la misma coordenada al metro: si se repite fix tras fix,
        // lo que hay al otro lado es una posición fijada a mano.
        $same = round((float) $visit["last_lat"], 6) === round($lat, 6)
             && round((float) $visit["last_lng"], 6) === round($lng, 6);
        $frozen = $same ? $frozen + 1 : 0;
        if ($frozen >= PRESENCE_FROZEN_LIMIT) $suspiciousFlag = $suspiciousFlag ?: "gps_congelado";
        if ($dt > 0 && $segment > PRESENCE_MIN_JUMP_M && ($segment / $dt) * 3.6 > PRESENCE_MAX_SPEED_KMH) {
            $suspiciousFlag = $suspiciousFlag ?: "salto_imposible";
            $segment = 0.0; // un salto imposible no suma kilómetros de campo
        }
    }

    $startedAt = $visit["started_at"];
    $newLastAt = $dt >= 0 ? $at : $visit["last_fix_at"];          // los lotes offline pueden llegar desordenados
    $newStartedAt = strtotime($at) < strtotime($startedAt) ? $at : $startedAt;
    $fixCount = (int) $visit["fix_count"] + 1;
    $dwell = strtotime($newLastAt) - strtotime($newStartedAt);
    $distance = (int) round((float) $visit["distance_m"] + $segment);
    $bestAccuracy = $visit["best_accuracy_m"] !== null ? (int) $visit["best_accuracy_m"] : null;
    if ($accuracy !== null) $bestAccuracy = $bestAccuracy === null ? (int) round($accuracy) : min($bestAccuracy, (int) round($accuracy));
    $suspicious = ((int) $visit["suspicious"]) || $suspiciousFlag ? 1 : 0;
    $flags = $suspiciousFlag ? presenceAddFlag($visit["flags"], $suspiciousFlag) : $visit["flags"];

    // La verificación es una consecuencia de los datos, no un estado que alguien pueda pedir: se
    // recalcula en cada fix y una visita marcada como sospechosa nunca la alcanza.
    $verified = (!$suspicious && $fixCount >= PRESENCE_MIN_FIXES && $dwell >= PRESENCE_MIN_DWELL_S) ? 1 : 0;
    $verifiedAt = $verified ? ($visit["verified_at"] ?: $newLastAt) : null;

    $stmt = $conn->prepare(
        "UPDATE user_park_visits SET started_at = ?, last_fix_at = ?, fix_count = ?, distance_m = ?,
                best_accuracy_m = ?, last_lat = ?, last_lng = ?, frozen_streak = ?, verified = ?,
                verified_at = ?, suspicious = ?, flags = ?
         WHERE id = ?"
    );
    $visitId = (int) $visit["id"];
    $stmt->bind_param(
        "ssiiiddiisisi",
        $newStartedAt, $newLastAt, $fixCount, $distance, $bestAccuracy, $lat, $lng,
        $frozen, $verified, $verifiedAt, $suspicious, $flags, $visitId
    );
    $stmt->execute();

    return [
        "accepted" => true,
        "verified" => (bool) $verified,
        "reason" => $suspicious ? "visita_marcada" : ($verified ? "presencia_verificada" : "verificando"),
        "visitId" => $visitId, "fixCount" => $fixCount, "dwellSeconds" => $dwell,
        "suspicious" => (bool) $suspicious, "distanceM" => 0.0,
    ];
}

// --- Lectura: qué visitas valen y qué se puede colgar de ellas ------------------------------------
/**
 * Ventanas de presencia verificada del usuario, ya con los márgenes de gracia aplicados. Es lo que
 * account_progress.php cruza con la hora de cada marca para saber si cuenta o no.
 * @return array Lista de { park, from, to, startedAt, lastFixAt, seconds, distanceM, id }, ordenada.
 */
function presenceVerifiedWindows($conn, $userId) {
    $stmt = $conn->prepare(
        "SELECT id, park_slug, started_at, last_fix_at, distance_m FROM user_park_visits
         WHERE user_id = ? AND verified = 1 AND suspicious = 0 ORDER BY started_at"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $out = [];
    foreach ($stmt->get_result()->fetch_all(MYSQLI_ASSOC) as $r) {
        $from = strtotime($r["started_at"]) - PRESENCE_MARK_PRE_GRACE_S;
        $to = strtotime($r["last_fix_at"]) + PRESENCE_MARK_POST_GRACE_S;
        $out[] = [
            "id" => (int) $r["id"],
            "park" => $r["park_slug"],
            "from" => $from,
            "to" => $to,
            "startedAt" => $r["started_at"],
            "lastFixAt" => $r["last_fix_at"],
            "seconds" => max(0, strtotime($r["last_fix_at"]) - strtotime($r["started_at"])),
            "distanceM" => (int) $r["distance_m"],
        ];
    }
    return $out;
}

/**
 * Tope de marcas que una visita puede verificar, según lo que duró. Ritmo humano: identificar tres
 * especies por minuto sostenido ya es rapidísimo, y una visita corta tiene un suelo para no
 * castigar a quien llega, ve cuatro cosas seguidas y se va.
 */
function presenceMarkAllowance($seconds) {
    return max(PRESENCE_MARKS_FLOOR, (int) ceil(($seconds / 60) * PRESENCE_MARKS_PER_MINUTE));
}

/**
 * Estación del año de un mes, por el criterio meteorológico (trimestres completos). Es el mismo que
 * ya usaba el flag `winterVisit` (diciembre, enero y febrero) y, sobre todo, es una cuenta de
 * CALENDARIO, no una afirmación sobre el clima: en un espacio del sur peninsular o de Canarias el
 * invierno no es frío, y un logro no puede dar por hecho el tiempo que hace en la región de nadie.
 * Debe devolver exactamente lo mismo que su espejo en Frontend/Js/achievements/almacen.js.
 */
function presenceSeasonOfMonth($month) {
    if ($month === 12 || $month === 1 || $month === 2) return "invierno";
    if ($month <= 5) return "primavera";
    if ($month <= 8) return "verano";
    return "otono";
}

/**
 * Estadísticas de campo derivadas SOLO de visitas verificadas. Sustituyen a las que antes salían de
 * user_activity_log (que se llenaba con solo marcar algo, desde cualquier sitio).
 * Las fechas se calculan en hora peninsular: el "día de campo" es el que percibe la persona.
 */
function presenceFieldStats($conn, $userId) {
    $windows = presenceVerifiedWindows($conn, $userId);
    $tz = new DateTimeZone("Europe/Madrid");
    $days = [];
    $perPark = [];
    $parks = [];
    $seconds = 0;
    $meters = 0;
    $longestSeconds = 0;
    $earlyBird = false;
    $winterVisit = false;
    $seasons = [];        // estaciones distintas con alguna salida verificada
    $seasonsPerPark = []; // ...y las de cada espacio, para "el mismo sitio en las cuatro estaciones"

    foreach ($windows as $w) {
        $start = new DateTime($w["startedAt"], new DateTimeZone("UTC"));
        $start->setTimezone($tz);
        $date = $start->format("Y-m-d");
        $days[$date] = true;
        $perPark[$w["park"]][$date] = true;
        $parks[$w["park"]] = true;
        $seconds += $w["seconds"];
        $meters += $w["distanceM"];
        $longestSeconds = max($longestSeconds, $w["seconds"]);
        if ((int) $start->format("G") < 8) $earlyBird = true;
        $month = (int) $start->format("n");
        if ($month === 12 || $month === 1 || $month === 2) $winterVisit = true;
        $season = presenceSeasonOfMonth($month);
        $seasons[$season] = true;
        $seasonsPerPark[$w["park"]][$season] = true;
    }

    $maxParkRevisitDays = 0;
    foreach ($perPark as $dates) $maxParkRevisitDays = max($maxParkRevisitDays, count($dates));

    // "Volver al mismo sitio en las cuatro estaciones" se mide por espacio y se queda con el mejor:
    // el mérito es conocer UN sitio en sus cuatro caras, no haber pisado cuatro sitios distintos.
    $sameParkSeasons = 0;
    foreach ($seasonsPerPark as $set) $sameParkSeasons = max($sameParkSeasons, count($set));

    // Racha de semanas ISO consecutivas con al menos un día de campo verificado.
    $weekKeys = [];
    foreach (array_keys($days) as $d) {
        $ts = strtotime($d);
        if ($ts !== false) $weekKeys[date("o-W", $ts)] = true;
    }
    $weekKeys = array_keys($weekKeys);
    sort($weekKeys);
    $bestStreak = 0; $current = 0; $prevTs = null;
    foreach ($weekKeys as $wk) {
        [$isoYear, $isoWeek] = explode("-", $wk);
        $dt = DateTime::createFromFormat("o-W-N", $isoYear . "-" . $isoWeek . "-1");
        $ts = $dt ? $dt->getTimestamp() : null;
        if ($ts === null) continue;
        $current = ($prevTs !== null && $ts - $prevTs === 7 * 86400) ? $current + 1 : 1;
        $bestStreak = max($bestStreak, $current);
        $prevTs = $ts;
    }

    return [
        "windows" => $windows,
        "parksVisited" => count($parks),
        "parksList" => array_keys($parks),
        "fieldDays" => count($days),
        "weekStreak" => $bestStreak,
        "maxParkRevisitDays" => $maxParkRevisitDays,
        "seasonsVisited" => count($seasons),
        "sameParkSeasons" => $sameParkSeasons,
        "fieldHours" => (int) floor($seconds / 3600),
        "fieldKilometers" => (int) floor($meters / 1000),
        "longestVisitHours" => (int) floor($longestSeconds / 3600),
        "earlyBird" => $earlyBird,
        "winterVisit" => $winterVisit,
    ];
}

/** Resumen del estado de presencia en un parque, para la cabecera de la app (GET presence.php). */
function presenceCurrentStatus($conn, $userId, $parkSlug) {
    $stmt = $conn->prepare(
        "SELECT id, started_at, last_fix_at, fix_count, distance_m, verified, suspicious, flags
         FROM user_park_visits WHERE user_id = ? AND park_slug = ? ORDER BY last_fix_at DESC LIMIT 1"
    );
    $stmt->bind_param("is", $userId, $parkSlug);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if (!$row) return ["active" => false, "verified" => false, "fixCount" => 0, "dwellSeconds" => 0];
    $open = (time() - strtotime($row["last_fix_at"])) <= PRESENCE_SESSION_GAP_S;
    return [
        "active" => $open,
        "verified" => (bool) $row["verified"],
        "suspicious" => (bool) $row["suspicious"],
        "visitId" => (int) $row["id"],
        "fixCount" => (int) $row["fix_count"],
        "dwellSeconds" => max(0, strtotime($row["last_fix_at"]) - strtotime($row["started_at"])),
        // Fechas reales de la visita: el cliente las necesita para espejarla y que su predicción
        // local (qué marca cuenta y cuál no) diga lo mismo que dirá el servidor.
        "startedAt" => gmdate("c", strtotime($row["started_at"])),
        "lastFixAt" => gmdate("c", strtotime($row["last_fix_at"])),
        "minFixes" => PRESENCE_MIN_FIXES,
        "minDwellSeconds" => PRESENCE_MIN_DWELL_S,
    ];
}
