-- ================================================================================================
-- parks-tiempo.sql — municipio de referencia para la predicción de AEMET, espacio a espacio.
-- GENERADO por Tools/resuelve-municipio-aemet.js. No editar a mano.
-- ------------------------------------------------------------------------------------------------
-- La API tiene prioridad sobre el park.json empaquetado: sin aplicar esto a la base, en un
-- despliegue con backend el widget del tiempo no se pinta aunque el código esté en el repositorio.
-- Requiere las columnas de Database/migrations.sql (weather_*).
-- Generado el 2026-09-10.
-- ================================================================================================

-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;
UPDATE parks SET weather_ine_code = '30023', weather_municipality = 'Librilla', weather_distance_km = 4.7, weather_source = 'AEMET OpenData · /api/maestro/municipios «Librilla» (resuelto el 2026-09-10)' WHERE slug = 'barrancos-de-gebas';
UPDATE parks SET weather_ine_code = '30037', weather_municipality = 'Torre-Pacheco', weather_distance_km = 7.6, weather_source = 'AEMET OpenData · /api/maestro/municipios «Torre-Pacheco» (resuelto el 2026-09-10)' WHERE slug = 'cabezo-gordo';
UPDATE parks SET weather_ine_code = '30003', weather_municipality = 'Águilas', weather_distance_km = 12.1, weather_source = 'AEMET OpenData · /api/maestro/municipios «Águilas» (resuelto el 2026-09-10)' WHERE slug = 'cabo-cope-puntas-calnegre';
UPDATE parks SET weather_ine_code = '30041', weather_municipality = 'La Unión', weather_distance_km = 8.5, weather_source = 'AEMET OpenData · /api/maestro/municipios «Unión, La» (resuelto el 2026-09-10)' WHERE slug = 'calblanque-monte-cenizas-pena-aguila';
UPDATE parks SET weather_ine_code = '30021', weather_municipality = 'Fuente Álamo de Murcia', weather_distance_km = 16, weather_source = 'AEMET OpenData · /api/maestro/municipios «Fuente Álamo de Murcia» (resuelto el 2026-09-10)' WHERE slug = 'carrascoy-y-el-valle';
UPDATE parks SET weather_ine_code = '30003', weather_municipality = 'Águilas', weather_distance_km = 5.1, weather_source = 'AEMET OpenData · /api/maestro/municipios «Águilas» (resuelto el 2026-09-10)' WHERE slug = 'cuatro-calas';
UPDATE parks SET weather_ine_code = '30902', weather_municipality = 'Los Alcázares', weather_distance_km = 4.3, weather_source = 'AEMET OpenData · /api/maestro/municipios «Alcázares, Los» (resuelto el 2026-09-10)' WHERE slug = 'espacios-abiertos-e-islas-del-mar-menor';
UPDATE parks SET weather_ine_code = '30020', weather_municipality = 'Fortuna', weather_distance_km = 4.7, weather_source = 'AEMET OpenData · /api/maestro/municipios «Fortuna» (resuelto el 2026-09-10)' WHERE slug = 'humedal-del-ajauque-y-rambla-salada';
UPDATE parks SET weather_ine_code = '30043', weather_municipality = 'Yecla', weather_distance_km = 17.6, weather_source = 'AEMET OpenData · /api/maestro/municipios «Yecla» (resuelto el 2026-09-10)' WHERE slug = 'monte-arabi';
UPDATE parks SET weather_ine_code = '30036', weather_municipality = 'San Pedro del Pinatar', weather_distance_km = 3.6, weather_source = 'AEMET OpenData · /api/maestro/municipios «San Pedro del Pinatar» (resuelto el 2026-09-10)' WHERE slug = 'salinas-arenales-san-pedro-pinatar';
UPDATE parks SET weather_ine_code = '30022', weather_municipality = 'Jumilla', weather_distance_km = 14.8, weather_source = 'AEMET OpenData · /api/maestro/municipios «Jumilla» (resuelto el 2026-09-10)' WHERE slug = 'sierra-de-el-carche';
UPDATE parks SET weather_ine_code = '30020', weather_municipality = 'Fortuna', weather_distance_km = 13.5, weather_source = 'AEMET OpenData · /api/maestro/municipios «Fortuna» (resuelto el 2026-09-10)' WHERE slug = 'sierra-de-la-pila';
UPDATE parks SET weather_ine_code = '30026', weather_municipality = 'Mazarrón', weather_distance_km = 3.5, weather_source = 'AEMET OpenData · /api/maestro/municipios «Mazarrón» (resuelto el 2026-09-10)' WHERE slug = 'sierra-de-las-moreras';
UPDATE parks SET weather_ine_code = '30043', weather_municipality = 'Yecla', weather_distance_km = 14.7, weather_source = 'AEMET OpenData · /api/maestro/municipios «Yecla» (resuelto el 2026-09-10)' WHERE slug = 'sierra-de-salinas';
UPDATE parks SET weather_ine_code = '30006', weather_municipality = 'Aledo', weather_distance_km = 8.8, weather_source = 'AEMET OpenData · /api/maestro/municipios «Aledo» (resuelto el 2026-09-10)' WHERE slug = 'sierra-espuna';
UPDATE parks SET weather_ine_code = '30013', weather_municipality = 'Calasparra', weather_distance_km = 5.9, weather_source = 'AEMET OpenData · /api/maestro/municipios «Calasparra» (resuelto el 2026-09-10)' WHERE slug = 'sotos-y-bosques-de-ribera-de-canaverosa';
