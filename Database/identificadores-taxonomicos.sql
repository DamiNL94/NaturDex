-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- ================================================================================================
-- NaturDex · realineado de claves externas incoherentes del 2026-08-27
-- ------------------------------------------------------------------------------------------------
-- Generado por `node Tools/catalogo-nacional/fix-identificadores-incoherentes.js --write --sql`.
--
-- QUÉ CORRIGE. Cinco nombres científicos llevaban un identificador distinto en cada
-- espacio, y dos `gbif_species_key` eran de rango familia o género, que no identifica
-- ninguna especie: pedir ocurrencias con ellas trae las de todo el grupo (la 3064 es
-- Amaranthaceae, 5.039.294 ocurrencias; la 2926685 el género Sideritis, 121.554).
--
-- NINGUNA ficha se renombra ni desaparece, así que no hay fila huérfana que borrar: el
-- UPSERT de `build-park-sql.js` casa por `scientific_name` y estos UPDATE también.
--
-- LAS DECISIONES, y con qué autoridad se comprobó cada una:
--   · Sideritis ibanyezii · gbifSpeciesKey → 8139235
--     la 2926685 es el GÉNERO Sideritis (121.554 ocurrencias). GBIF escribe la especie «Sideritis
--     ibanezii Pau» (sin «y»): key 8139235, SPECIES, ACCEPTED, 116 ocurrencias. Mismo taxón que el
--     8332 de EIDOS por su juego de sinónimos (flavovirens, salina, ilorcitana)
--   · Salsola vermiculata · gbifSpeciesKey → 3083954
--     la 3064 es la FAMILIA Amaranthaceae (5.039.294 ocurrencias). «Salsola vermiculata L.» es la
--     3083954, SPECIES, 4.634 ocurrencias; GBIF la marca HETEROTYPIC_SYNONYM de «Nitrosalsola
--     vermiculata», y por eso se queda la del nombre de la ficha y no la del aceptado
--   · Anabasis hispanica · gbifSpeciesKey → 5568629
--     EIDOS pone «Anabasis hispanica Pau» y «Anabasis articulata (Forssk.) Moq.» bajo el MISMO
--     taxonid 1838 (aceptado: «Anabasis mucronata (Lag.) C. Vic.»), así que no son dos taxones: la
--     5568629 es la ACCEPTED de GBIF (4.330 ocurrencias) frente a las 29 de la 8397718, y es la
--     que ya usaban Calblanque, Cuatro Calas y el Ajauque
--   · Asteriscus maritimus · gbifSpeciesKey → 5385225
--     la 5385231 es SYNONYM de «Pallenis maritima subsp. maritima»; la 5385225 es «Pallenis
--     maritima (L.) Greuter», SPECIES y ACCEPTED, mismo basiónimo (Buphthalmum maritimum L.) y
--     superconjunto: 11.149 ocurrencias frente a 2.468. Ya la usaba Cuatro Calas. El NOMBRE no
--     cambia: EIDOS acepta «Asteriscus maritimus» (9925) y da «Pallenis maritima» por sinónimo
--   · Sedum sediforme · eidosTaxonId → 8225
--     el 95304 es «Petrosedum sediforme (Jacq.) Grulich subsp. sediforme», la SUBESPECIE; la
--     especie es el 8225, «Petrosedum sediforme (Jacq.) Grulich», Aceptado/válido. La ficha es de
--     rango especie y su gbifSpeciesKey (4201784) es la de la especie. Ya lo usaba Cuatro Calas
--   · Olea europaea subsp. europaea · eidosTaxonId → 6644
--     el 32803 es «Olea europaea var. sylvestris (Mill.) Lehr.», que en EIDOS es un taxón aparte;
--     el 6644 es «Olea europaea L.», la especie, que contiene las dos lecturas de una ficha cuyo
--     nombre (subsp. europaea, el olivo) y cuyo commonName («Acebuche») se contradicen. Ya lo
--     usaba Cuatro Calas. Resolver la contradicción es un renombrado: deuda nº 36
--   · Olea europaea subsp. europaea · gbifSpeciesKey → 5415040
--     la 8028262 es «Olea europaea var. sylvestris», VARIETY y SYNONYM en el backbone (2.128
--     ocurrencias); la 5415040 es «Olea europaea L.», SPECIES y ACCEPTED (409.636), y es la que ya
--     usaban Calblanque, Carrascoy, Cuatro Calas, El Carche y La Pila
--
-- ORDEN: va DESPUÉS del `-n2.sql` de cada espacio, que es quien da de alta la ficha.
-- Es idempotente: aplicado dos veces, la segunda actualiza 0 filas.
-- ================================================================================================

START TRANSACTION;

-- ── cabo-cope-puntas-calnegre ───────────────────────────────────
-- Olea europaea subsp. europaea: 32803 → 6644
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.eidos_taxonid = 6644
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Olea europaea subsp. europaea';

-- Olea europaea subsp. europaea: 8028262 → 5415040
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_species_key = 5415040
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Olea europaea subsp. europaea';

-- Anabasis hispanica: 8397718 → 5568629
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_species_key = 5568629
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Anabasis hispanica';

-- Asteriscus maritimus: 5385231 → 5385225
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_species_key = 5385225
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Asteriscus maritimus';

-- Sideritis ibanyezii: 2926685 → 8139235
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_species_key = 8139235
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Sideritis ibanyezii';

-- Salsola vermiculata: 3064 → 3083954
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_species_key = 3083954
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Salsola vermiculata';

-- Sedum sediforme: 95304 → 8225
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.eidos_taxonid = 8225
 WHERE pk.slug = 'cabo-cope-puntas-calnegre' AND sp.scientific_name = 'Sedum sediforme';

-- ── sierra-espuna ───────────────────────────────────────────────
-- Olea europaea subsp. europaea: 32803 → 6644
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.eidos_taxonid = 6644
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Olea europaea subsp. europaea';

-- Olea europaea subsp. europaea: 8028262 → 5415040
UPDATE species sp JOIN parks pk ON pk.id = sp.park_id
   SET sp.gbif_species_key = 5415040
 WHERE pk.slug = 'sierra-espuna' AND sp.scientific_name = 'Olea europaea subsp. europaea';

COMMIT;

-- Comprobación: después de aplicarlo, ninguna de estas dos claves debe quedar viva.
SELECT sp.gbif_species_key, COUNT(*) AS fichas FROM species sp
 WHERE sp.gbif_species_key IN (3064, 2926685) GROUP BY sp.gbif_species_key;
