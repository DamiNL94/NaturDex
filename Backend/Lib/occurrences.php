<?php
// ================================================================================================
// occurrences.php — escritura y lectura de `user_occurrences`, la capa científica del avistamiento.
// ------------------------------------------------------------------------------------------------
// El problema que resuelve: cuando el usuario marca una especie, la app guarda { lat, lng, at } dentro
// de un JSON y tira todo lo demás. La precisión del GPS de ese momento se recibía y se descartaba; la
// visita en la que ocurrió no quedaba enganchada a nada; y la hora se guardaba sin más contexto. Con
// eso, el registro no se puede publicar en ningún banco de biodiversidad. Aquí se escribe, en el mismo
// momento y de la misma marca, la ocurrencia Darwin Core completa.
//
// Lo que NO hace: tocar user_progress. Esa sigue siendo la fuente que la app lee y lo que hace que el
// progreso funcione sin conexión; esto se deriva de aquello. Si algo falla aquí, el progreso del
// usuario se guarda igual (los llamantes envuelven las llamadas en try/catch): se degrada, no rompe.
//
// El vocabulario, los identificadores y las reglas de sensibilidad viven en Lib/dwc.php, que es puro y
// se puede probar sin base de datos (Tools/test-dwc-rules.php). Aquí solo está el SQL.
// Ver Docs/DARWIN-CORE.md.
// ================================================================================================

require_once __DIR__ . "/dwc.php";
require_once __DIR__ . "/presence.php";

/** Clave de reconciliación de una especie marcada en un espacio. Idempotencia de toda la escritura. */
function occurrenceSpeciesKey($parkSlug, $speciesId) { return "especie:" . $parkSlug . ":" . (int) $speciesId; }

/** Ídem para una exótica invasora, que no cuelga de ningún espacio sino de una comunidad autónoma. */
function occurrenceInvasiveKey($invasiveId) { return "invasora:" . (int) $invasiveId; }

/**
 * Fecha del evento (dwc:eventDate) a partir de la hora de marcado que ya selló el servidor.
 *
 * OJO: NO se usa presenceResolveTimestamp() aquí, y no es un descuido. Aquel filtro rechaza todo lo
 * anterior a siete días porque su trabajo es impedir que un cliente retrase un fix para fingir una
 * presencia. Esta hora no viene del cliente: viene de `user_progress.markedAt`, que progress.php
 * escribió una sola vez y no vuelve a pisar. Aplicarle el filtro de siete días haría que reenviar la
 * cola de un avistamiento de hace un mes lo recolocara en «ahora», es decir, FALSIFICARÍA la fecha de
 * la cita. Lo único que se sigue rechazando es una fecha del futuro.
 */
function occurrenceEventDate($at) {
    $ahora = time();
    if (!$at) return gmdate("Y-m-d H:i:s", $ahora);
    $ts = strtotime((string) $at);
    if ($ts === false) return gmdate("Y-m-d H:i:s", $ahora);
    if ($ts > $ahora + PRESENCE_FUTURE_SKEW_S) return gmdate("Y-m-d H:i:s", $ahora);
    return gmdate("Y-m-d H:i:s", min($ts, $ahora));
}

/** Nombre público del observador. Nunca el correo: lo que se publica es el nombre que él eligió. */
function occurrenceRecorderName($conn, $userId) {
    static $cache = [];
    if (isset($cache[$userId])) return $cache[$userId];
    $stmt = $conn->prepare("SELECT display_name FROM users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $name = $row && trim((string) $row["display_name"]) !== "" ? trim($row["display_name"]) : DWC_ANONYMOUS_RECORDER;
    return $cache[$userId] = $name;
}

/**
 * La visita VERIFICADA en cuyo margen cae un instante, o null. Es lo que convierte una marca en una
 * ocurrencia con trazabilidad: `event_id` apunta a ella y de ahí cuelgan sus fixes, su duración y su
 * mejor precisión. Usa los mismos márgenes de gracia que account_progress.php para decidir qué cuenta,
 * porque si divergieran una marca podría puntuar para un logro y salir "sin verificar" en la ciencia.
 */
function occurrenceVisitFor($conn, $userId, $parkSlug, $atUtc) {
    if (!$parkSlug) return null;
    $stmt = $conn->prepare(
        "SELECT id FROM user_park_visits
          WHERE user_id = ? AND park_slug = ? AND verified = 1 AND suspicious = 0
            AND ? BETWEEN DATE_SUB(started_at, INTERVAL ? SECOND) AND DATE_ADD(last_fix_at, INTERVAL ? SECOND)
          ORDER BY started_at DESC LIMIT 1"
    );
    $pre = PRESENCE_MARK_PRE_GRACE_S;
    $post = PRESENCE_MARK_POST_GRACE_S;
    $stmt->bind_param("issii", $userId, $parkSlug, $atUtc, $pre, $post);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    return $row ? (int) $row["id"] : null;
}

/**
 * Alta o refresco de una ocurrencia. El upsert va por (user_id, source_key), así que reenviar la cola
 * de pendientes no duplica ni cambia el `occurrence_id` ya publicado.
 *
 * `event_date` se queda con la MÁS ANTIGUA de las dos (LEAST): la cita ocurrió la primera vez que se
 * marcó, y un reenvío desde la cola no puede moverla a hoy. Es el mismo criterio que `markedAt` en
 * progress.php, y por la misma razón: esa hora es la que decide si la observación cae dentro de una
 * visita verificada.
 *
 * `event_id` y `identification_verification_status` NO se refrescan aquí, a propósito: son la misma
 * afirmación dicha de dos formas —de qué visita cuelga y si esa presencia consta— y solo se escriben
 * juntos, en el alta de arriba y en occurrencesRefreshVerification(). Refrescar uno solo desde el
 * upsert es justo lo que los dejaría contándose cosas distintas.
 *
 * @param array $campos Valores ya resueltos por quien llama (taxonomía, lugar y coordenada).
 */
function occurrenceUpsert($conn, $userId, $sourceKey, $campos) {
    $now = gmdate("Y-m-d H:i:s");
    $recorder = occurrenceRecorderName($conn, $userId);
    $uuid = dwcUuidV4();

    $sql = "INSERT INTO user_occurrences (
                occurrence_id, user_id, source_key, occurrence_kind, catalog_species_id, catalog_invasive_id,
                park_slug, basis_of_record, occurrence_status, occurrence_remarks, recorded_by, recorded_by_id,
                modified, event_id, event_date, sampling_protocol,
                decimal_latitude, decimal_longitude, geodetic_datum, coordinate_uncertainty_in_meters,
                georeference_protocol, country_code, state_province, county, locality, location_id,
                scientific_name, taxon_rank, kingdom, phylum, `class`, `order`, family, genus,
                vernacular_name, taxon_id, taxon_concept_id,
                identification_verification_status, identified_by, date_identified,
                license, rights_holder, institution_code, dataset_name, dataset_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                event_date = LEAST(event_date, VALUES(event_date)),
                decimal_latitude = COALESCE(VALUES(decimal_latitude), decimal_latitude),
                decimal_longitude = COALESCE(VALUES(decimal_longitude), decimal_longitude),
                coordinate_uncertainty_in_meters = COALESCE(VALUES(coordinate_uncertainty_in_meters), coordinate_uncertainty_in_meters),
                georeference_protocol = COALESCE(VALUES(georeference_protocol), georeference_protocol),
                occurrence_remarks = VALUES(occurrence_remarks),
                scientific_name = VALUES(scientific_name), taxon_rank = VALUES(taxon_rank),
                kingdom = VALUES(kingdom), phylum = VALUES(phylum), `class` = VALUES(`class`),
                `order` = VALUES(`order`), family = VALUES(family), genus = VALUES(genus),
                vernacular_name = VALUES(vernacular_name), taxon_id = VALUES(taxon_id),
                taxon_concept_id = VALUES(taxon_concept_id),
                state_province = VALUES(state_province), county = VALUES(county),
                locality = VALUES(locality), location_id = VALUES(location_id),
                recorded_by = VALUES(recorded_by), rights_holder = VALUES(rights_holder),
                modified = VALUES(modified)";

    $basis = DWC_BASIS_OF_RECORD;
    $status = DWC_OCCURRENCE_STATUS;
    $datum = DWC_GEODETIC_DATUM;
    $country = DWC_COUNTRY_CODE;
    $institution = DWC_INSTITUTION_CODE;
    $datasetName = DWC_DATASET_NAME;
    $datasetId = DWC_DATASET_ID;
    $license = DWC_LICENSE;
    $recordedById = dwcRecordedByUrn($userId);

    // 45 parámetros. Los tipos van agrupados como los bloques de abajo para poder contarlos a ojo:
    // identidad(6) · registro(6) · evento(4) · coordenada(4) · lugar(6) · taxón+calidad+derechos(19).
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sissii" . "ssssss" . "siss" . "ddsi" . "ssssss" . "sssssssssssssssssss",
        $uuid, $userId, $sourceKey, $campos["kind"], $campos["speciesId"], $campos["invasiveId"],
        $campos["parkSlug"], $basis, $status, $campos["remarks"], $recorder, $recordedById,
        $now, $campos["visitId"], $campos["eventDate"], $campos["samplingProtocol"],
        $campos["lat"], $campos["lng"], $datum, $campos["uncertainty"],
        $campos["georeferenceProtocol"], $country, $campos["stateProvince"], $campos["county"],
        $campos["locality"], $campos["locationId"],
        $campos["scientificName"], $campos["taxonRank"], $campos["kingdom"], $campos["phylum"],
        $campos["class"], $campos["order"], $campos["family"], $campos["genus"],
        $campos["vernacularName"], $campos["taxonId"], $campos["taxonConceptId"],
        $campos["verificationStatus"], $recorder, $campos["eventDate"],
        $license, $recorder, $institution, $datasetName, $datasetId
    );
    return $stmt->execute();
}

/**
 * Registra la ocurrencia de una especie del catálogo marcada como vista.
 *
 * @param array $fix { lat, lng, accuracy, at } tal como llega de la app. Sin coordenada NO se crea
 *                   ocurrencia: una cita sin lugar no dice nada, y la marca de colección del usuario
 *                   ya está guardada en user_progress, que es donde le sirve.
 */
function occurrenceRecordSpecies($conn, $userId, $parkSlug, $speciesId, $fix) {
    $lat = isset($fix["lat"]) && is_numeric($fix["lat"]) ? (float) $fix["lat"] : null;
    $lng = isset($fix["lng"]) && is_numeric($fix["lng"]) ? (float) $fix["lng"] : null;
    if ($lat === null || $lng === null) return false;

    $at = occurrenceEventDate($fix["at"] ?? null);

    $stmt = $conn->prepare(
        "SELECT s.id, s.scientific_name, s.common_name, s.kingdom, s.family, s.taxon_phylum, s.taxon_class,
                s.taxon_order, s.taxon_family, s.taxon_genus, s.eidos_taxonid, s.gbif_species_key,
                p.name AS park_name, p.region, p.province, p.slug
           FROM species s JOIN parks p ON p.id = s.park_id
          WHERE s.id = ? AND p.slug = ? LIMIT 1"
    );
    $stmt->bind_param("is", $speciesId, $parkSlug);
    $stmt->execute();
    $s = $stmt->get_result()->fetch_assoc();
    if (!$s) return false; // el id no es de este espacio: no se inventa la taxonomía de nada

    $visitId = occurrenceVisitFor($conn, $userId, $parkSlug, $at);
    $accuracy = isset($fix["accuracy"]) && is_numeric($fix["accuracy"]) ? (int) round((float) $fix["accuracy"]) : null;

    return occurrenceUpsert($conn, $userId, occurrenceSpeciesKey($parkSlug, $speciesId), [
        "kind" => "especie",
        "speciesId" => (int) $s["id"],
        "invasiveId" => null,
        "parkSlug" => $parkSlug,
        "remarks" => $accuracy === null
            ? "El dispositivo no informó de la precisión del GPS en el momento de marcar."
            : null,
        "visitId" => $visitId,
        "eventDate" => $at,
        "samplingProtocol" => DWC_SAMPLING_PROTOCOL,
        "lat" => $lat,
        "lng" => $lng,
        "uncertainty" => $accuracy,
        "georeferenceProtocol" => DWC_GEOREFERENCE_PROTOCOL,
        "stateProvince" => $s["region"],
        "county" => $s["province"],
        "locality" => $s["park_name"],
        "locationId" => "urn:naturdex:espacio:" . $s["slug"],
        "scientificName" => $s["scientific_name"],
        "taxonRank" => dwcTaxonRank($s["scientific_name"]),
        "kingdom" => dwcKingdom($s["kingdom"]),
        "phylum" => $s["taxon_phylum"],
        "class" => $s["taxon_class"],
        "order" => $s["taxon_order"],
        "family" => $s["taxon_family"] ?: $s["family"],
        "genus" => $s["taxon_genus"],
        "vernacularName" => $s["common_name"],
        "taxonId" => $s["eidos_taxonid"] !== null ? (string) $s["eidos_taxonid"] : null,
        "taxonConceptId" => $s["gbif_species_key"] !== null
            ? "https://www.gbif.org/species/" . $s["gbif_species_key"] : null,
        "verificationStatus" => dwcVerificationStatus($visitId !== null),
    ]);
}

/**
 * Ídem para una exótica invasora identificada. Es, de todo lo que recoge la app, lo que más valor
 * tiene para una administración: una cita georreferenciada de una especie del Catálogo Español de EEI.
 *
 * Aquí SÍ se acepta una cita sin coordenada, porque es lo que hay en el histórico y porque el valor
 * de saber que alguien la identificó en esa comunidad no es cero. El hueco se dice en
 * `occurrence_remarks`, no se disimula.
 */
function occurrenceRecordInvasive($conn, $userId, $invasiveId, $fix = []) {
    // La hora la pone el SERVIDOR, sin admitir la del cliente: así coincide exactamente con el
    // `seen_at` que user_invasive_sightings acaba de escribir, y no hay dos fechas de lo mismo.
    $at = gmdate("Y-m-d H:i:s");
    $stmt = $conn->prepare(
        "SELECT id, scientific_name, common_name, kingdom, ccaa, eidos_taxonid, gbif_species_key
           FROM especies_invasoras WHERE id = ? LIMIT 1"
    );
    $stmt->bind_param("i", $invasiveId);
    $stmt->execute();
    $e = $stmt->get_result()->fetch_assoc();
    if (!$e) return false;

    $lat = isset($fix["lat"]) && is_numeric($fix["lat"]) ? (float) $fix["lat"] : null;
    $lng = isset($fix["lng"]) && is_numeric($fix["lng"]) ? (float) $fix["lng"] : null;
    $accuracy = isset($fix["accuracy"]) && is_numeric($fix["accuracy"]) ? (int) round((float) $fix["accuracy"]) : null;

    // Una invasora se identifica desde su ficha, no dentro de un espacio concreto: no hay visita que
    // heredar y la presencia no se verifica contra ningún límite. Se dice tal cual.
    $remarks = $lat === null
        ? "Cita sin georreferenciar: el dispositivo no aportó posición al identificar la especie."
        : null;

    return occurrenceUpsert($conn, $userId, occurrenceInvasiveKey($invasiveId), [
        "kind" => "invasora",
        "speciesId" => null,
        "invasiveId" => (int) $e["id"],
        "parkSlug" => null,
        "remarks" => $remarks,
        "visitId" => null,
        "eventDate" => $at,
        "samplingProtocol" => "Identificación de especie exótica invasora desde la ficha de la aplicación",
        "lat" => $lat,
        "lng" => $lng,
        "uncertainty" => $accuracy,
        "georeferenceProtocol" => $lat === null ? null : DWC_GEOREFERENCE_PROTOCOL,
        "stateProvince" => $e["ccaa"],
        "county" => null,
        "locality" => null,
        "locationId" => null,
        "scientificName" => $e["scientific_name"],
        "taxonRank" => dwcTaxonRank($e["scientific_name"]),
        "kingdom" => dwcKingdom($e["kingdom"]),
        "phylum" => null, "class" => null, "order" => null, "family" => null, "genus" => null,
        "vernacularName" => $e["common_name"],
        "taxonId" => $e["eidos_taxonid"] !== null ? (string) $e["eidos_taxonid"] : null,
        "taxonConceptId" => $e["gbif_species_key"] !== null
            ? "https://www.gbif.org/species/" . $e["gbif_species_key"] : null,
        "verificationStatus" => dwcVerificationStatus(false),
    ]);
}

/**
 * Retira la ocurrencia de algo que el usuario ha DESMARCADO. Se borra, no se marca como ausente:
 * dwc:occurrenceStatus='absent' significa «se buscó y no estaba», que es una afirmación distinta y
 * que nadie ha hecho. Desmarcar es retirar la cita.
 */
function occurrenceForget($conn, $userId, $sourceKey) {
    $stmt = $conn->prepare("DELETE FROM user_occurrences WHERE user_id = ? AND source_key = ?");
    $stmt->bind_param("is", $userId, $sourceKey);
    return $stmt->execute();
}

/**
 * Reengancha a su visita las ocurrencias que se registraron ANTES de que la presencia cuajara.
 *
 * Es el caso normal, no el raro: una visita necesita varios fixes repartidos en cinco minutos para
 * verificarse, y lo primero que hace la gente al llegar es marcar. Sin esto, todo lo marcado en los
 * primeros minutos de cada salida se quedaría para siempre etiquetado como presencia no verificada.
 * Lo llama presence.php justo cuando una visita alcanza el estado verificado.
 */
function occurrencesRefreshVerification($conn, $userId, $parkSlug) {
    $sql = "UPDATE user_occurrences o
              JOIN user_park_visits v
                ON v.user_id = o.user_id AND v.park_slug = o.park_slug
               AND v.verified = 1 AND v.suspicious = 0
               AND o.event_date BETWEEN DATE_SUB(v.started_at, INTERVAL ? SECOND)
                                    AND DATE_ADD(v.last_fix_at, INTERVAL ? SECOND)
               SET o.event_id = v.id, o.identification_verification_status = ?, o.modified = ?
             WHERE o.user_id = ? AND o.park_slug = ? AND o.event_id IS NULL";
    $pre = PRESENCE_MARK_PRE_GRACE_S;
    $post = PRESENCE_MARK_POST_GRACE_S;
    $estado = DWC_VERIF_PRESENCIA;
    $now = gmdate("Y-m-d H:i:s");
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissis", $pre, $post, $estado, $now, $userId, $parkSlug);
    $stmt->execute();
    return $conn->affected_rows;
}

/**
 * Las ocurrencias de un usuario, para la exportación de SUS datos (account.php?action=export). Se le
 * entrega el registro completo, con la coordenada fina y sin generalizar: es suyo. La generalización
 * es de la publicación, no del titular del dato.
 */
function occurrencesForUser($conn, $userId) {
    $stmt = $conn->prepare(
        "SELECT occurrence_id, occurrence_kind, event_date, scientific_name, vernacular_name,
                decimal_latitude, decimal_longitude, coordinate_uncertainty_in_meters,
                locality, state_province, county, identification_verification_status, event_id
           FROM user_occurrences WHERE user_id = ? ORDER BY event_date"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $out = [];
    foreach ($stmt->get_result()->fetch_all(MYSQLI_ASSOC) as $r) {
        $r["occurrence_id"] = dwcOccurrenceUrn($r["occurrence_id"]);
        $r["event_date"] = dwcIsoDate($r["event_date"]);
        $r["event_id"] = dwcEventUrn($r["event_id"]);
        $out[] = $r;
    }
    return $out;
}
