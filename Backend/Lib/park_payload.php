<?php
// ================================================================================================
// park_payload.php — única definición de la forma del JSON de un parque.
// ------------------------------------------------------------------------------------------------
// La usan TANTO el endpoint species.php (respuesta de la API en tiempo real) COMO el exportador
// Tools/export-park.php (que regenera el park.json empaquetado para uso offline). Así la copia
// offline y la API salen del mismo sitio y no pueden divergir (la BD es la fuente de verdad del
// contenido; la geometría vive aparte en los GeoJSON).
// ================================================================================================

/**
 * Construye el payload completo de un parque a partir de la base de datos.
 * @param mysqli $conn  Conexión abierta.
 * @param string $parkSlug  Slug del parque.
 * @return array|null  El payload, o null si el parque no existe.
 */
function buildParkPayload($conn, $parkSlug) {
    $parkStmt = $conn->prepare("SELECT id, slug, name, category, region, province, municipality, description, coastline_km, latitude, longitude, weather_ine_code, weather_municipality, weather_distance_km, weather_source FROM parks WHERE slug = ? LIMIT 1");
    $parkStmt->bind_param("s", $parkSlug);
    $parkStmt->execute();
    $park = $parkStmt->get_result()->fetch_assoc();
    if (!$park) return null;

    // --- Hábitats ---------------------------------------------------------------------------------
    $habitatStmt = $conn->prepare("SELECT id, slug, code, name, habitat_type, description, is_priority, latitude, longitude, color, review_note, hic_subtipos, fitosociologia, audio_url, audio_transcript, image_url, image_attribution, image_note FROM habitats WHERE park_id = ? ORDER BY name");
    $habitatStmt->bind_param("i", $park["id"]);
    $habitatStmt->execute();
    $habitatResult = $habitatStmt->get_result();
    $habitats = [];
    $habitatDbIdToSlug = [];
    while ($row = $habitatResult->fetch_assoc()) {
        // Si el hábitat todavía no tiene slug/coordenadas (instalación previa a la geolocalización
        // de hábitats), se usa el código como id y se omiten coordenadas: el círculo no se dibuja
        // en el mapa hasta rellenar esos campos, pero el resto de la app sigue funcionando.
        $slug = $row["slug"] ?: $row["code"];
        $habitatDbIdToSlug[$row["id"]] = $slug;
        $habitats[] = [
            "id" => $slug,
            "code" => $row["code"],
            "name" => $row["name"],
            "type" => $row["habitat_type"],
            "description" => $row["description"],
            "priority" => (bool) $row["is_priority"],
            "coordinates" => ($row["latitude"] !== null && $row["longitude"] !== null)
                ? [(float) $row["latitude"], (float) $row["longitude"]]
                : null,
            "color" => $row["color"],
            // Foto del hábitat: URL externa (Wikimedia Commons, GBIF) o ruta local del repositorio.
            // Si no hay ninguna se emite null y el frontend dibuja su portada temática. Antes se caía
            // en "Img/habitats/<slug>.jpg" aunque ese archivo no existiera, lo que provocaba un 404
            // por cada hábitat sin foto antes de que el onerror lo sustituyera por la portada.
            "image" => !empty($row["image_url"]) ? $row["image_url"] : null,
            // Autor + licencia de esa foto (CC-BY obliga a citarlos) y con qué especie diagnóstica se
            // ilustra el hábitat, que no es lo mismo que una vista general del hábitat.
            "imageAttribution" => $row["image_attribution"] ?? null,
            "imageNote" => $row["image_note"] ?? null,
            // Subtipos HIC y asociaciones fitosociológicas oficiales (Cartografía de Hábitats
            // MITECO/BDN + planes de gestión). El frontend las pinta en el detalle del hábitat.
            "hicSubtipos" => $row["hic_subtipos"] !== null ? json_decode($row["hic_subtipos"], true) : null,
            "fitosociologia" => $row["fitosociologia"] !== null ? json_decode($row["fitosociologia"], true) : null,
            "reviewNote" => $row["review_note"],
            // Audioguía del hábitat (opcional): ruta del audio + transcripción accesible.
            "audio" => $row["audio_url"],
            "audioTranscript" => $row["audio_transcript"],
            "speciesIds" => []
        ];
    }
    $habitatsBySlug = [];
    foreach ($habitats as $index => $habitat) {
        $habitatsBySlug[$habitat["id"]] = $index;
    }

    // --- Relación especie ↔ hábitat --------------------------------------------------------------
    $relStmt = $conn->prepare("SELECT sh.species_id, sh.habitat_id FROM species_habitats sh JOIN species sp ON sp.id = sh.species_id WHERE sp.park_id = ?");
    $relStmt->bind_param("i", $park["id"]);
    $relStmt->execute();
    $relResult = $relStmt->get_result();
    $speciesIdToHabitatSlugs = [];
    while ($row = $relResult->fetch_assoc()) {
        $slug = $habitatDbIdToSlug[$row["habitat_id"]] ?? null;
        if ($slug === null) continue;
        $speciesIdToHabitatSlugs[(int) $row["species_id"]][] = $slug;
        if (isset($habitatsBySlug[$slug])) {
            $habitats[$habitatsBySlug[$slug]]["speciesIds"][] = (int) $row["species_id"];
        }
    }

    // --- Especies ---------------------------------------------------------------------------------
    $speciesStmt = $conn->prepare("SELECT id, common_name, scientific_name, kingdom, family, primary_habitat, description, identification_tips, seasonality, image_url, image_attribution, description_source, latitude, longitude, rarity_score, rarity_basis, rarity_local, rarity_local_basis, is_featured, is_visible, hidden_reason, source, taxon_phylum, taxon_class, taxon_order, taxon_family, taxon_genus, iucn_global, iucn_spain, spain_status, regional_status, regional_ccaa, review_note, eidos_taxonid, gbif_species_key, gbif_occurrences, zepa_site_code, is_migratory, site_presence FROM species WHERE park_id = ? ORDER BY is_featured DESC, common_name ASC");
    $speciesStmt->bind_param("i", $park["id"]);
    $speciesStmt->execute();
    $result = $speciesStmt->get_result();
    $species = [];
    while ($row = $result->fetch_assoc()) {
        $species[] = [
            "id" => (int) $row["id"],
            "commonName" => $row["common_name"],
            "scientificName" => $row["scientific_name"],
            "kingdom" => $row["kingdom"],
            "group" => $row["family"],
            "habitat" => $row["primary_habitat"],
            "description" => $row["description"],
            // De dónde sale el texto: EIDOS o redacción propia. NULL en las heredadas sin trazar.
            "descriptionSource" => $row["description_source"] ?? null,
            "tips" => array_values(array_filter(array_map("trim", explode(";", $row["identification_tips"] ?? "")))),
            "seasonality" => $row["seasonality"],
            "image" => $row["image_url"],
            "imageAttribution" => $row["image_attribution"] ?? null,
            // Coordenadas null para las especies sin punto fijo (p. ej. las aves de la ZEPA, que
            // vuelan): la app no les pinta marcador en el mapa y las muestra en su apartado propio.
            "coordinates" => ($row["latitude"] !== null && $row["longitude"] !== null)
                ? [(float) $row["latitude"], (float) $row["longitude"]]
                : null,
            "rarityScore" => (int) $row["rarity_score"],
            // La procedencia del tramo viaja con el tramo. Se decodifica aquí y no en el cliente
            // porque el park.json empaquetado ya lo sirve como objeto: si la API lo mandara como
            // cadena JSON, la misma ficha tendría dos formas según de dónde viniera, que es
            // exactamente el tipo de divergencia que `Frontend/Js/data.js` no puede resolver.
            "rarityBasis" => $row["rarity_basis"] !== null ? json_decode($row["rarity_basis"], true) : null,
            // Tramo local (estatal + autonómico): el que pinta las estrellas de la ficha.
            "rarityLocal" => $row["rarity_local"] !== null ? (int) $row["rarity_local"] : null,
            "rarityLocalBasis" => $row["rarity_local_basis"] !== null ? json_decode($row["rarity_local_basis"], true) : null,
            "featured" => (bool) $row["is_featured"],
            // false = oculta del catálogo público (poca evidencia GBIF y sin figura oficial, o sin
            // descripción que enseñar), pero el dato se conserva. Ver Frontend/Js/data.js
            // `applyVisibility`; `hiddenReason` dice cuál de los dos motivos es.
            "visible" => (bool) $row["is_visible"],
            "hiddenReason" => $row["hidden_reason"] ?? null,
            "source" => $row["source"],
            "taxonomy" => [
                "kingdom" => $row["kingdom"] === "flora" ? "Plantae" : "Animalia",
                "phylum" => $row["taxon_phylum"],
                "class" => $row["taxon_class"],
                "order" => $row["taxon_order"],
                "family" => $row["taxon_family"],
                "genus" => $row["taxon_genus"]
            ],
            "iucnGlobal" => $row["iucn_global"],
            // Lista Roja ESPAÑOLA: otra evaluación de la UICN, con su propia autoridad y su propio año.
            // Va aparte de la mundial a propósito; null = EIDOS no la trae, que no es «no evaluada».
            "iucnSpain" => $row["iucn_spain"],
            "spainStatus" => $row["spain_status"],
            // Estado legal AUTONÓMICO y la comunidad a la que se refiere. Se llamaba murciaStatus
            // y estaba atado a Murcia (deuda nº 2): la comunidad viaja ahora en el dato, no escrita a
            // mano en la plantilla del frontend. null = no se ha dicho, no «de ninguna».
            "regionalStatus" => $row["regional_status"],
            "regionalCcaa" => $row["regional_ccaa"],
            "reviewNote" => $row["review_note"],
            // Claves maestras de reconciliación taxonómica (trazabilidad, también en la copia offline):
            // EIDOS (IEPNB) canónica; GBIF speciesKey liga las ocurrencias. null si la fuente no cubre.
            "eidosTaxonId" => $row["eidos_taxonid"] !== null ? (int) $row["eidos_taxonid"] : null,
            "gbifSpeciesKey" => $row["gbif_species_key"] !== null ? (int) $row["gbif_species_key"] : null,
            // Ocurrencias de GBIF dentro de los polígonos de este espacio. No tenía columna, así que
            // la ida y vuelta por la API lo borraba en silencio de 767 fichas (deuda nº 3). Se
            // distingue null de 0: «nadie barrió» no es «se barrió y no cayó ninguna».
            "gbifOccurrences" => $row["gbif_occurrences"] !== null ? (int) $row["gbif_occurrences"] : null,
            // Código del espacio ZEPA si el ave figura en su lista oficial (EEA/BISE); null si no aplica.
            "zepaSiteCode" => $row["zepa_site_code"],
            // Fenología del ave según el Formulario Normalizado de Datos del sitio Red Natura 2000:
            // true = migratoria, false = declarada con población permanente, null = ningún formulario
            // la nombra. Los TRES estados llegan al cliente: `null` es el que hace que la ficha se
            // quede en el catálogo general en lugar de la pestaña de migratorias, y aplanarlo a false
            // convertiría «nadie lo ha mirado» en «comprobado que no». Ver Tools/lib/fenologia.js.
            "migratory" => $row["is_migratory"] !== null ? (bool) $row["is_migratory"] : null,
            // La cita que sostiene lo anterior. Se decodifica aquí, igual que los dos `*_basis`: si la
            // API lo mandara como cadena, la misma ficha tendría dos formas según viniera de la API o
            // del park.json empaquetado, y Frontend/Js/data.js no puede resolver esa divergencia.
            "sitePresence" => $row["site_presence"] !== null ? json_decode($row["site_presence"], true) : null,
            "habitatIds" => $speciesIdToHabitatSlugs[(int) $row["id"]] ?? []
        ];
    }

    // --- Puntos de interés ------------------------------------------------------------------------
    $poiStmt = $conn->prepare("SELECT slug, name, type, description, latitude, longitude, image_url, source, is_approx, audio_url, audio_transcript FROM points_of_interest WHERE park_id = ? ORDER BY name");
    $poiStmt->bind_param("i", $park["id"]);
    $poiStmt->execute();
    $poiResult = $poiStmt->get_result();
    $pointsOfInterest = [];
    while ($row = $poiResult->fetch_assoc()) {
        $pointsOfInterest[] = [
            "id" => $row["slug"],
            "name" => $row["name"],
            "type" => $row["type"],
            "description" => $row["description"],
            // Un POI SIEMPRE va ubicado (admin.php lo exige al guardar), pero si una fila antigua
            // tiene la coordenada a NULL hay que emitir null, no [0,0]: `(float) null` es 0.0 y eso
            // plantaba el punto en el golfo de Guinea en cuanto la API pisaba al park.json.
            "coordinates" => ($row["latitude"] !== null && $row["longitude"] !== null)
                ? [(float) $row["latitude"], (float) $row["longitude"]]
                : null,
            "image" => $row["image_url"],
            "source" => $row["source"],
            "approx" => (bool) $row["is_approx"],
            // Audioguía del punto de interés (opcional).
            "audio" => $row["audio_url"],
            "audioTranscript" => $row["audio_transcript"]
        ];
    }

    // El límite del parque aún no se modela en la base de datos (pendiente de una columna de
    // geometría/PostGIS cuando llegue la cartografía QGIS definitiva). De momento se sirve como
    // un trazado aproximado fijo, igual que el usado en el JSON de respaldo del frontend.
    $parkBoundary = [
        [37.5490, -1.3930], [37.5446, -1.3975], [37.5389, -1.4037], [37.5292, -1.4166],
        [37.5100, -1.4350], [37.4870, -1.4714], [37.4855, -1.4750], [37.4209, -1.4917],
        [37.4219, -1.5035], [37.4130, -1.5090], [37.4230, -1.4850], [37.4560, -1.4650],
        [37.4864, -1.4332], [37.5050, -1.4200], [37.5300, -1.4050], [37.5490, -1.3930]
    ];
    $parkBoundaryNote = "Límite aproximado dibujado a partir de referencias textuales y puntos conocidos del parque (Calabardina, Torre de Cope, Cabo Cope, Lomo de Bas, Puntas de Calnegre). Es un trazado provisional: se sustituirá por la cartografía oficial cuando esté disponible el proyecto QGIS.";

    return [
        "park" => [
            "id" => (int) $park["id"],
            "slug" => $park["slug"],
            "name" => $park["name"],
            "category" => $park["category"],
            "region" => $park["region"],
            "province" => $park["province"],
            "municipalities" => array_map("trim", explode(" y ", $park["municipality"] ?? "")),
            "center" => [(float) $park["latitude"], (float) $park["longitude"]],
            "coastlineKm" => (float) $park["coastline_km"],
            "summary" => $park["description"],
            // Municipio de referencia para la predicción del tiempo (AEMET). Sin código resuelto el
            // bloque ENTERO es null, nunca un objeto con el código a null: «no lo tenemos» y «no se
            // ha podido resolver» son la misma cosa para quien pinta —el widget no se pinta— y dos
            // formas de decir que no obligarían al frontend a distinguirlas sin motivo.
            // `distanciaKm` y `fuente` son la PROCEDENCIA del código y viajan con él: un código sin
            // ellas es un número sin defensa (regla nº 1 del CLAUDE.md raíz).
            "weather" => $park["weather_ine_code"] ? [
                "municipio" => $park["weather_municipality"],
                "ine" => $park["weather_ine_code"],
                "distanciaKm" => $park["weather_distance_km"] !== null ? (float) $park["weather_distance_km"] : null,
                "fuente" => $park["weather_source"],
            ] : null,
            "boundary" => $parkBoundary,
            "boundaryNote" => $parkBoundaryNote
        ],
        "habitats" => $habitats,
        "pointsOfInterest" => $pointsOfInterest,
        "species" => $species
    ];
}
