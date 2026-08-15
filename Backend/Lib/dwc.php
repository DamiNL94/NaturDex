<?php
// ================================================================================================
// dwc.php — el vocabulario Darwin Core del proyecto: qué columna es qué término y con qué URI.
// ------------------------------------------------------------------------------------------------
// El problema que resuelve: un avistamiento guardado "a nuestra manera" y traducido a Darwin Core el
// día que alguien lo pida no se puede publicar, porque la traducción descubre entonces lo que nunca
// se guardó (la incertidumbre de la coordenada, la hora con huso, el estado de verificación). Aquí
// el esquema canónico ES Darwin Core: la tabla `user_occurrences` tiene por columnas los términos y
// este fichero es el único sitio donde se declara la correspondencia columna ↔ término ↔ URI.
//
// Todo lo de aquí es PURO (no toca la base de datos) para que `npm test` pueda comprobar las reglas
// que de verdad importan —la generalización de las especies amenazadas y el etiquetado de calidad—
// sin levantar MySQL. La escritura y la lectura de la tabla viven en Lib/occurrences.php.
//
// Lo escriben: Api/progress.php, Api/account-progress.php y Api/presence.php (a través de
// occurrences.php). Lo lee: Tools/export-dwc.php. Ver Docs/DARWIN-CORE.md.
//
// AVISO que acompaña a todo lo que salga de aquí (regla 7 del CLAUDE.md): un registro de un usuario
// es una observación ciudadana SIN validar por un experto. Se etiqueta como tal en
// identificationVerificationStatus y no se presenta nunca como dato oficial.
// ================================================================================================

// --- Constantes del conjunto de datos -------------------------------------------------------------
const DWC_BASIS_OF_RECORD   = "HumanObservation";
const DWC_OCCURRENCE_STATUS = "present";
const DWC_GEODETIC_DATUM    = "WGS84";
const DWC_COUNTRY_CODE      = "ES";
const DWC_INSTITUTION_CODE  = "NaturDex";
const DWC_DATASET_ID        = "urn:naturdex:dataset:avistamientos-ciudadanos";
const DWC_DATASET_NAME      = "NaturDex · avistamientos ciudadanos en espacios naturales protegidos de España";
// Licencia del conjunto. GBIF solo admite CC0, CC BY o CC BY-NC; CC BY 4.0 permite el uso científico
// y administrativo exigiendo la cita, que es lo mismo que el catálogo ya exige para sus fotos.
const DWC_LICENSE = "http://creativecommons.org/licenses/by/4.0/legalcode";
const DWC_SAMPLING_PROTOCOL = "Observación oportunista con aplicación móvil; presencia en el espacio verificada por GPS contra el límite oficial";
const DWC_GEOREFERENCE_PROTOCOL = "GPS del dispositivo del observador en el momento de marcar";

// Nombre público cuando la cuenta no tiene uno puesto. Nunca se publica el correo.
const DWC_ANONYMOUS_RECORDER = "Observador/a de NaturDex";

// --- Estado de verificación ------------------------------------------------------------------------
// Los dos únicos valores admitidos. Dicen DOS cosas distintas y las dos hacen falta: que nadie ha
// validado la identificación (siempre) y si consta que la persona estaba dentro del espacio (la regla
// del proyecto: solo cuenta lo marcado dentro de una visita verificada). Un banco de datos necesita
// exactamente eso para decidir si se queda el registro.
const DWC_VERIF_PRESENCIA = "Observación ciudadana sin validar por experto; presencia en el espacio verificada por GPS";
const DWC_VERIF_SIN_PRESENCIA = "Observación ciudadana sin validar por experto; presencia en el espacio no verificada";

/** El texto de identificationVerificationStatus que corresponde a una visita verificada o no. */
function dwcVerificationStatus($presenciaVerificada) {
    return $presenciaVerificada ? DWC_VERIF_PRESENCIA : DWC_VERIF_SIN_PRESENCIA;
}

// --- Sensibilidad: qué coordenadas NO se publican tal cual -----------------------------------------
// Publicar la posición exacta de un ejemplar de una especie en peligro es una forma conocida de
// facilitar su expolio, y es un daño que no se puede deshacer. La práctica estándar de los bancos de
// biodiversidad es generalizar la coordenada del taxón amenazado y decirlo en el propio registro.
//
// EL CRITERIO NO SE REESCRIBE AQUÍ. Sale del tramo de rareza legal ya calculado (species.rarity_local,
// y si falta, rarity_score), que es la salida de la única escalera que hay en el repo —Tools/lib/
// rareza.js, que la deriva de spainStatus y del catálogo autonómico—. Portar esa escalera a PHP sería
// crear la segunda copia de un criterio, que es exactamente el fallo que este repo ya conoce.
const DWC_GENERALIZE_10KM = 10000;   // tramo 5: en peligro de extinción · extinguida
const DWC_GENERALIZE_1KM  = 1000;    // tramo 4: vulnerable · sensible a la alteración de su hábitat

/**
 * Metros a los que hay que generalizar la coordenada de un taxón, por su tramo de rareza legal.
 *
 * `null` (no consta el tramo) NO es «no amenazada»: es «nadie lo ha mirado», y ahí se generaliza por
 * precaución. Equivocarse en la dirección contraria publica la coordenada exacta de algo que podía
 * estar en peligro, y eso no se puede retirar una vez publicado. El exportador cuenta cuántos
 * registros salen así para que el hueco se vea (Docs/DARWIN-CORE.md).
 */
function dwcGeneralizationMeters($tramo) {
    if ($tramo === null || $tramo === "") return DWC_GENERALIZE_1KM;
    $tramo = (int) $tramo;
    if ($tramo >= 5) return DWC_GENERALIZE_10KM;
    if ($tramo === 4) return DWC_GENERALIZE_1KM;
    return 0;
}

/**
 * Aplica la generalización a una coordenada. Devuelve el registro ya listo para publicar:
 * { lat, lng, uncertainty, dataGeneralizations, informationWithheld }.
 *
 * El dato fino NO se toca en la base de datos: lo que se generaliza es la EXPORTACIÓN. Redondear a
 * 0,1° ≈ 11 km y a 0,01° ≈ 1,1 km en latitud, así que la incertidumbre publicada nunca es menor que
 * el radio de la celda a la que se redondeó (ni menor que la del GPS, que sigue contando).
 *
 * @param int|null $tramo      Tramo de rareza legal 1–5, o null si no consta.
 * @param bool     $esInvasora Una exótica invasora nunca se generaliza: su localización precisa es,
 *                             de todo lo que recoge la app, lo que más valor tiene para una
 *                             administración, y no hay ningún ejemplar que proteger.
 */
function dwcGeneralizeCoordinates($lat, $lng, $uncertainty, $tramo, $esInvasora = false) {
    $out = [
        "lat" => $lat === null ? null : (float) $lat,
        "lng" => $lng === null ? null : (float) $lng,
        "uncertainty" => $uncertainty === null ? null : (int) $uncertainty,
        "dataGeneralizations" => null,
        "informationWithheld" => null,
    ];
    if ($lat === null || $lng === null) return $out;
    if ($esInvasora) return $out;

    $meters = dwcGeneralizationMeters($tramo);
    if ($meters <= 0) return $out;

    $decimals = $meters >= DWC_GENERALIZE_10KM ? 1 : 2;
    $out["lat"] = round((float) $lat, $decimals);
    $out["lng"] = round((float) $lng, $decimals);
    $out["uncertainty"] = max($meters, $out["uncertainty"] === null ? 0 : $out["uncertainty"]);
    $km = $meters >= 1000 ? (int) ($meters / 1000) . " km" : $meters . " m";
    $out["dataGeneralizations"] = $tramo === null || $tramo === ""
        ? "Coordenada redondeada a ~" . $km . " por precaución: no consta el tramo de rareza legal del taxón en el catálogo."
        : "Coordenada redondeada a ~" . $km . " por tratarse de un taxón con categoría de amenaza (tramo de rareza legal " . (int) $tramo . ").";
    $out["informationWithheld"] = "Coordenada exacta no publicada por sensibilidad del taxón; disponible bajo petición motivada al responsable del conjunto de datos.";
    return $out;
}

// --- Taxonomía: lo que el catálogo llama «reino» no es un reino ------------------------------------
/**
 * `species.kingdom` es una agrupación de la interfaz ('flora', 'fauna', 'fungi', 'other'), no el
 * reino taxonómico. Publicarla tal cual en dwc:kingdom sería escribir «flora» donde va «Plantae».
 * 'other' se queda VACÍO a propósito: no se sabe qué reino es, y un hueco vale más que una suposición.
 */
function dwcKingdom($appKingdom) {
    switch (strtolower(trim((string) $appKingdom))) {
        case "flora": return "Plantae";
        case "fauna": return "Animalia";
        case "fungi": return "Fungi";
        default: return null;
    }
}

/**
 * Rango del nombre científico, deducido de su forma. Solo se afirma lo que el propio nombre dice sin
 * ambigüedad: un binomio limpio es rango de especie y un nombre con el conector explícito lo declara
 * él mismo. Cualquier otra forma (tres palabras sin conector, un nombre con autoría pegada) se deja
 * VACÍA: el catálogo no guarda el rango y adivinarlo sería rellenar un campo a ojo.
 */
function dwcTaxonRank($scientificName) {
    $name = trim(preg_replace("/\s+/", " ", (string) $scientificName));
    if ($name === "") return null;
    if (preg_match("/\b(subsp\.|ssp\.)\s/i", $name)) return "subspecies";
    if (preg_match("/\bvar\.\s/i", $name)) return "variety";
    if (preg_match("/\bsubvar\.\s/i", $name)) return "subvariety";
    if (preg_match("/\bf\.\s/i", $name)) return "form";
    $parts = explode(" ", $name);
    if (count($parts) === 1) return null;                       // un solo término: género, familia… no consta
    if (count($parts) === 2 && preg_match("/^[a-zà-ÿ-]+$/u", $parts[1])) return "species";
    return null;
}

/** Identificador estable de la ocurrencia, tal como se publica: URN de UUID, nunca un autoincremento. */
function dwcOccurrenceUrn($uuid) { return "urn:uuid:" . $uuid; }

/** Identificador del evento de muestreo: la visita verificada de la que cuelga la ocurrencia. */
function dwcEventUrn($visitId) { return $visitId ? "urn:naturdex:visita:" . (int) $visitId : null; }

/** Identificador opaco del observador. Nunca sale el correo ni el identificador interno a secas. */
function dwcRecordedByUrn($userId) { return "urn:naturdex:observador:" . (int) $userId; }

/**
 * UUID v4 (aleatorio). Se genera con random_bytes, no con uniqid(): el identificador de una
 * ocurrencia publicada es para siempre y no puede colisionar ni ser adivinable a partir del reloj.
 * Un autoincremento tampoco vale: revelaría cuántas observaciones tiene el sistema y cambiaría de
 * significado en cuanto el conjunto se fusionara con otro.
 */
function dwcUuidV4() {
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); // versión 4
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); // variante RFC 4122
    return vsprintf("%s%s-%s-%s-%s-%s%s%s", str_split(bin2hex($bytes), 4));
}

// --- El diccionario: columna ↔ término ↔ URI --------------------------------------------------------
/**
 * Los campos que se publican, en el orden en que salen en occurrence.txt. Cada entrada es
 * [ clave del registro, término Darwin Core, URI del término ], y la clave es el nombre de la
 * columna de `user_occurrences` salvo en el único campo derivado (ver abajo).
 *
 * Es la ÚNICA declaración de la correspondencia: de aquí salen la cabecera del TSV, el `meta.xml` y
 * la tabla de Docs/DARWIN-CORE.md. Si se añade una columna a la tabla y no se añade aquí, no se
 * publica —y eso es lo correcto: publicar algo exige decidir qué término es.
 *
 * `event_time` NO es columna de la tabla: es el mismo instante que `event_date` y se calcula al
 * exportar (dwcIsoTime). Guardarlo aparte sería guardar dos veces el mismo dato, con la única
 * consecuencia posible de que algún día discrepen.
 */
function dwcTerms() {
    $dwc = "http://rs.tdwg.org/dwc/terms/";
    $dc  = "http://purl.org/dc/terms/";
    return [
        ["occurrence_id",        "occurrenceID",        $dwc . "occurrenceID"],
        ["basis_of_record",      "basisOfRecord",       $dwc . "basisOfRecord"],
        ["occurrence_status",    "occurrenceStatus",    $dwc . "occurrenceStatus"],
        ["individual_count",     "individualCount",     $dwc . "individualCount"],
        ["occurrence_remarks",   "occurrenceRemarks",   $dwc . "occurrenceRemarks"],
        ["recorded_by",          "recordedBy",          $dwc . "recordedBy"],
        ["recorded_by_id",       "recordedByID",        $dwc . "recordedByID"],
        ["modified",             "modified",            $dc  . "modified"],
        ["event_id",             "eventID",             $dwc . "eventID"],
        ["event_date",           "eventDate",           $dwc . "eventDate"],
        ["event_time",           "eventTime",           $dwc . "eventTime"],
        ["sampling_protocol",    "samplingProtocol",    $dwc . "samplingProtocol"],
        ["decimal_latitude",     "decimalLatitude",     $dwc . "decimalLatitude"],
        ["decimal_longitude",    "decimalLongitude",    $dwc . "decimalLongitude"],
        ["geodetic_datum",       "geodeticDatum",       $dwc . "geodeticDatum"],
        ["coordinate_uncertainty_in_meters", "coordinateUncertaintyInMeters", $dwc . "coordinateUncertaintyInMeters"],
        ["georeference_protocol", "georeferenceProtocol", $dwc . "georeferenceProtocol"],
        ["country_code",         "countryCode",         $dwc . "countryCode"],
        ["state_province",       "stateProvince",       $dwc . "stateProvince"],
        ["county",               "county",              $dwc . "county"],
        ["locality",             "locality",            $dwc . "locality"],
        ["location_id",          "locationID",          $dwc . "locationID"],
        ["scientific_name",      "scientificName",      $dwc . "scientificName"],
        ["taxon_rank",           "taxonRank",           $dwc . "taxonRank"],
        ["kingdom",              "kingdom",             $dwc . "kingdom"],
        ["phylum",               "phylum",              $dwc . "phylum"],
        ["class",                "class",               $dwc . "class"],
        ["order",                "order",               $dwc . "order"],
        ["family",               "family",              $dwc . "family"],
        ["genus",                "genus",               $dwc . "genus"],
        ["vernacular_name",      "vernacularName",      $dwc . "vernacularName"],
        ["taxon_id",             "taxonID",             $dwc . "taxonID"],
        ["scientific_name_id",   "scientificNameID",    $dwc . "scientificNameID"],
        ["taxon_concept_id",     "taxonConceptID",      $dwc . "taxonConceptID"],
        ["identification_verification_status", "identificationVerificationStatus", $dwc . "identificationVerificationStatus"],
        ["identified_by",        "identifiedBy",        $dwc . "identifiedBy"],
        ["date_identified",      "dateIdentified",      $dwc . "dateIdentified"],
        ["license",              "license",             $dc  . "license"],
        ["rights_holder",        "rightsHolder",        $dc  . "rightsHolder"],
        ["institution_code",     "institutionCode",     $dwc . "institutionCode"],
        ["dataset_name",         "datasetName",         $dwc . "datasetName"],
        ["dataset_id",           "datasetID",           $dwc . "datasetID"],
        ["information_withheld", "informationWithheld", $dwc . "informationWithheld"],
        ["data_generalizations", "dataGeneralizations", $dwc . "dataGeneralizations"],
    ];
}

/** Las claves publicadas, en orden (sin las internas: user_id, source_key, park_slug…). */
function dwcRecordKeys() {
    return array_map(function ($t) { return $t[0]; }, dwcTerms());
}

/**
 * Un valor listo para un campo de TSV. Los tabuladores, saltos y retornos se sustituyen por un
 * espacio en vez de escaparse: el formato de texto delimitado de Darwin Core no define escape, así
 * que un salto de línea dentro de un campo parte la fila y corrompe el fichero en silencio.
 */
function dwcTsvValue($value) {
    if ($value === null || $value === false) return "";
    if ($value === true) return "true";
    return trim(preg_replace("/[\t\r\n]+/", " ", (string) $value));
}

/** Fecha UTC de la base de datos → ISO 8601 con huso ('2026-08-15T09:12:30+00:00'). */
function dwcIsoDate($mysqlDatetime) {
    if (!$mysqlDatetime) return "";
    $ts = strtotime($mysqlDatetime . " UTC");
    return $ts === false ? "" : gmdate("c", $ts);
}

/** La hora suelta del mismo instante, con huso, para dwc:eventTime ('09:12:30Z'). */
function dwcIsoTime($mysqlDatetime) {
    if (!$mysqlDatetime) return "";
    $ts = strtotime($mysqlDatetime . " UTC");
    return $ts === false ? "" : gmdate("H:i:s\Z", $ts);
}
