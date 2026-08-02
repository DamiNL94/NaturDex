<?php
// ================================================================================================
// invasoras_payload.php — única definición de la forma del JSON de las especies exóticas invasoras.
// ------------------------------------------------------------------------------------------------
// La usan el endpoint Backend/Api/invasoras.php y el exportador Tools/export-invasoras.php (que genera
// Frontend/Data/invasoras.json para uso offline). Las invasoras son un dato NACIONAL por CCAA (Catálogo
// Español de EEI, RD 630/2013): la BD es la fuente de verdad; el frontend filtra por la CCAA del parque.
// ================================================================================================

/**
 * Devuelve las especies invasoras, opcionalmente filtradas por comunidad autónoma.
 * @param mysqli $conn  Conexión abierta.
 * @param string|null $ccaa  Si se indica, solo las de esa CCAA.
 * @return array
 */
function buildInvasorasPayload($conn, $ccaa = null) {
    $cols = "scientific_name, common_name, taxon_group, kingdom, ccaa, description, origin, habitat, impact, pathway, catalogo, eidos_taxonid, gbif_species_key, gbif_occurrences, image_url, image_attribution, source";
    if ($ccaa !== null && $ccaa !== '') {
        $stmt = $conn->prepare("SELECT $cols FROM especies_invasoras WHERE ccaa = ? ORDER BY gbif_occurrences DESC, common_name ASC");
        $stmt->bind_param("s", $ccaa);
        $stmt->execute();
        $res = $stmt->get_result();
    } else {
        $res = $conn->query("SELECT $cols FROM especies_invasoras ORDER BY ccaa ASC, gbif_occurrences DESC");
    }
    $out = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            // Slug para la foto por convención (Img/invasoras/<slug>.jpg); si no existe, el frontend
            // muestra una portada generada. El nombre científico en minúsculas y con guiones.
            $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower($row["scientific_name"]));
            $slug = trim($slug, '-');
            $out[] = [
                "scientificName" => $row["scientific_name"],
                "commonName" => $row["common_name"],
                "group" => $row["taxon_group"],
                "kingdom" => $row["kingdom"],
                "ccaa" => $row["ccaa"],
                "description" => $row["description"],
                "origin" => $row["origin"],
                "habitat" => $row["habitat"],
                // Qué daño hace y cómo llega: es lo que convierte la ficha en algo accionable
                // ("no la plantes, no la sueltes") en vez de en una descripción más.
                "impact" => $row["impact"],
                "pathway" => $row["pathway"],
                "catalogo" => $row["catalogo"],
                "eidosTaxonId" => $row["eidos_taxonid"] !== null ? (int) $row["eidos_taxonid"] : null,
                "gbifSpeciesKey" => $row["gbif_species_key"] !== null ? (int) $row["gbif_species_key"] : null,
                "gbifOccurrences" => $row["gbif_occurrences"] !== null ? (int) $row["gbif_occurrences"] : null,
                "image" => $row["image_url"] ?: ("Img/invasoras/" . $slug . ".jpg"),
                "imageAttribution" => $row["image_attribution"],
                "source" => $row["source"],
            ];
        }
    }
    return $out;
}
