-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- Salinas y Arenales de San Pedro del Pinatar (salinas-arenales-san-pedro-pinatar) · retirada de las especies excluidas a mano
-- Generado por Tools/catalogo-nacional/aplica-exclusiones.js desde
-- Tools/catalogo-nacional/data/exclusiones-especies.json
--
-- Son decisiones de curación: los filtros de build-species-seleccion.js aprobaron la especie
-- y una revisión con el dato delante concluyó que no debe entrar. El motivo, tal cual está
-- escrito en el fichero de exclusiones, va debajo de cada nombre.
--
-- HACE FALTA porque build-park-sql.js solo hace UPSERT: regenerar el -n2.sql corrige y da de
-- alta, pero no retira nada. Sin este fichero, la API sigue sirviendo la ficha excluida.
--
-- ANTES DE APLICARLO:
--   · Haz copia (npm run db:backup). Un DELETE no se deshace con otra pasada.
--   · `observations` tiene clave foránea a `species` con ON DELETE CASCADE: si alguien
--     hubiera anotado una observación de esta ficha, se borra con ella. El SELECT de
--     comprobación de más abajo lo dice ANTES, y por eso va antes del DELETE.
--   · user_progress.payload indexa los descubrimientos por el species_id de cada parque, así
--     que quien la hubiera descubierto conserva una marca que ya no apunta a ninguna ficha.
--     Después de aplicar esto hay que pasar Tools/recalculate-account-progress.php para que
--     el progreso y los logros cuadren.
--   · Las citas Darwin Core (user_occurrences) NO se tocan: no tienen clave foránea a
--     species precisamente para esto, y llevan su taxonomía copiada.

-- Lo que hay en la base AHORA. Léelo antes de seguir: si `observaciones` no es 0, el DELETE
-- se las lleva por cascada.
SELECT s.id, s.scientific_name, s.is_visible,
       (SELECT COUNT(*) FROM observations o WHERE o.species_id = s.id) AS observaciones
FROM species s JOIN parks p ON p.id = s.park_id
WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND s.scientific_name IN ('Posidonia oceanica');

START TRANSACTION;

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'salinas-arenales-san-pedro-pinatar'
  AND sp.scientific_name IN (
    'Posidonia oceanica'  -- Aceitunilla de mar
    --   La posidonia es una fanerógama MARINA: su propia ficha declara que vive en fondos de hasta 40 m
    --   de profundidad, y este espacio no tiene cartografiado ni un solo HIC marino —la «regla marina»
    --   del rollout los retira de la Capa 2—. Sus ocurrencias dentro de los polígonos son registros de
    --   la línea de costa y de arribazón: hojas muertas que el mar deposita en la playa, no la planta
    --   creciendo ahí. Es el mismo caso que Caretta caretta en Carrascoy, y se ve en que estaba
    --   enganchada a matorrales, dunas y saladares a la vez. Un visitante no puede encontrarla en
    --   ninguno de esos hábitats sin meterse en el agua.
  );

COMMIT;

-- Comprobación: `retiradas_que_siguen` debe ser 0 y el total, el del park.json.
SELECT
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'salinas-arenales-san-pedro-pinatar') AS especies_del_espacio,
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'salinas-arenales-san-pedro-pinatar' AND s.scientific_name IN ('Posidonia oceanica')) AS retiradas_que_siguen;
