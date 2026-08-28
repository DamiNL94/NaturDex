-- El juego de caracteres se fija SIEMPRE: el cliente mysql lo toma del entorno y en un
-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.
SET NAMES utf8mb4;

-- Cabo Cope y Puntas de Calnegre (cabo-cope-puntas-calnegre) · fichas del piloto SIN respaldo en la
-- selección aprobada
-- Generado el 2026-08-28 (b) desde out/cabo-cope-puntas-calnegre-seleccion-especies.json
--
-- QUÉ SON ESTAS 95 FICHAS, que importa antes de aplicar nada. El catálogo de este espacio se
-- escribió en agosto de 2026 con la regla vieja —presencia en GBIF— y es ANTERIOR a que la selección
-- fuera un fichero del repositorio. Al producir su primera selección versionada, 95 de sus 193
-- fichas se quedaron fuera de ella, y se retiran para dejar el espacio con el mismo criterio que los
-- otros quince: el catálogo es lo que la selección aprueba. En el resto de espacios la diferencia
-- entre catálogo y selección va de 0 a 13 fichas; aquí eran 95.
--
-- NO TODAS SIGNIFICAN LO MISMO, y eso el número no lo dice:
--   · 51 no estaban ni en el barrido de GBIF del espacio (gbifOccurrences nulo): no las rechazó
--     ningún filtro, es que nunca fueron candidatas. De ellas, 14 son características de un HIC
--     según el Atlas, 11 las enumera el Decreto n.º 299/2010 y 23 declaran figura legal — 32 con
--     respaldo documental escrito y cero registros dentro de los polígonos.
--   · 44 sí eran candidatas y la puerta las rechazó por «solo GBIF». Ésas son nivel 3.
-- Sin respaldo de ninguna clase son 60, no 95. Ver Docs/DEUDA-TECNICA.md nº 41 y nº 43.
--
-- HACE FALTA porque build-park-sql.js solo hace UPSERT: regenerar el -n2.sql corrige y da de alta,
-- pero no retira nada. Sin este fichero, la API sigue sirviendo las 95.
--
-- ANTES DE APLICARLO, cuatro cosas:
--   · Haz copia (npm run db:backup). Un DELETE no se deshace con otra pasada.
--   · user_progress.payload indexa los descubrimientos por el species_id de cada parque, así que
--     quien hubiera descubierto una de éstas conserva una marca que ya no apunta a ninguna ficha.
--     Después hay que pasar Tools/recalculate-account-progress.php.
--   · SIETE eran DESTACADAS y salían en la portada del espacio: Allium melananthum, Centaurium
--     rigualii, Caralluma europaea, Maytenus senegalensis subsp. europaea, Centaurea saxicola,
--     Halocnemum strobilaceum y Tamarix boveana. El espacio se queda con 16 destacadas.
--   · Las citas Darwin Core (user_occurrences) NO se tocan: no tienen clave foránea a species
--     precisamente para esto, y llevan su taxonomía copiada.
--
-- ORDEN EN LA COLA: DESPUÉS de cabo-cope-puntas-calnegre-n2.sql, que da de alta las 98 que se
-- quedan, y después del poda-aves-*.sql del 2026-08-16, que sigue sin aplicar.

START TRANSACTION;

DELETE sp FROM species sp
JOIN parks pk ON pk.id = sp.park_id
WHERE pk.slug = 'cabo-cope-puntas-calnegre'
  AND sp.scientific_name IN (
    'Achillea maritima',  -- Algodonosa
    'Allium melananthum',  -- Ajo de flor oscura
    'Andryala ragusina',  -- Mata del vizque
    'Anthyllis cytisoides',  -- Albaida
    'Artemisia barrelieri',  -- Boja negra
    'Arthrocaulon macrostachyum',  -- Sosa alacranera
    'Asparagus albus',  -- Esparraguera blanca
    'Asparagus horridus',  -- Esparraguera de gato
    'Asphodelus fistulosus',  -- Gamoncillo
    'Asteriscus maritimus',  -- Margarita de mar
    'Atelerix algirus',  -- Erizo moruno
    'Atriplex glauca',  -- Orgaza
    'Atriplex halimus',  -- Orgaza
    'Atriplex portulacoides',  -- Orzaga marina
    'Beta maritima',  -- Acelga marina
    'Brachypodium retusum',  -- Lastón
    'Capparis sicula subsp. sicula',  -- Alcaparra
    'Caralluma europaea',  -- Chumberillo de lobo
    'Caroxylon vermiculatum',  -- Sisallo
    'Centaurea saxicola',  -- Cardo amarillo de roca
    'Centaurium rigualii',  -- Centaurio de Rigual
    'Chalcides bedriagai',  -- Eslizón ibérico
    'Cistanche phelypaea',  -- Pijolobo
    'Cistus clusii',  -- Romerina
    'Citrullus colocynthis',  -- Coloquíntida
    'Crithmum maritimum',  -- Hinojo marino
    'Cutandia maritima',  -- Cutandia marítima
    'Cynomorium coccineum',  -- Cinomorio
    'Cyperus capitatus',  -- Juncia marina
    'Cytisus intermedius',  -- Aliaga morisca
    'Daucus pumilus',  -- Zanahoria de mar
    'Dittrichia viscosa',  -- Olivarda
    'Elymus farctus',  -- Grama de mar
    'Ephedra fragilis',  -- Canadillo
    'Epidalea calamita',  -- Sapo corredor
    'Eragrostis papposa',  -- Eragrostis
    'Euphorbia paralias',  -- Lechetrezna de playa
    'Fagonia cretica',  -- Fagonia
    'Felis silvestris',  -- Gato montés
    'Genetta genetta',  -- Gineta
    'Glaucium flavum',  -- Amapola marina
    'Halocnemum strobilaceum',  -- Sosa jabonera
    'Hammada articulata',  -- Sosa articulada
    'Hemorrhois hippocrepis',  -- Culebra de herradura
    'Hyparrhenia hirta',  -- Cerrillo
    'Launaea arborescens',  -- Aulaga
    'Lavandula dentata',  -- Cantueso dentado
    'Lavandula multifida',  -- Alhucema
    'Limoniastrum monopetalum',  -- Salado
    'Limonium delicatulum',  -- Siempreviva de saladar
    'Loeflingia hispanica',  -- Loeflingia
    'Lotus creticus',  -- Cuernecillo de mar
    'Lygeum spartum',  -- Albardín
    'Macrochloa tenacissima',  -- Esparto
    'Malcolmia littorea',  -- Alhelí de mar
    'Malpolon monspessulanus',  -- Culebra bastarda
    'Maresia nana',  -- Maresia
    'Martes foina',  -- Garduña
    'Maytenus senegalensis subsp. europaea',  -- Arto
    'Medicago marina',  -- Mielga marina
    'Melica minuta',  -- Melica menor
    'Nerium oleander',  -- Baladre
    'Olea europaea subsp. europaea',  -- Acebuche
    'Oryctolagus cuniculus',  -- Conejo
    'Pancratium maritimum',  -- Azucena de mar
    'Phagnalon saxatile',  -- Mata pulguera
    'Phragmites australis',  -- Carrizo
    'Pistacia lentiscus',  -- Lentisco
    'Pseudodictamnus hirsutus',  -- Manrubio negro
    'Quercus coccifera',  -- Coscoja
    'Rhamnus lycioides subsp. borgiae',  -- Espino negro
    'Rosmarinus officinalis',  -- Romero
    'Salsola genistoides',  -- Escobilla
    'Salsola kali',  -- Barrilla pinchosa
    'Sarcocapnos enneaphylla subsp. saetabensis',  -- Zapatito de la Virgen
    'Sarcocornia fruticosa',  -- Sosa jabonera
    'Scrophularia canina',  -- Escrofularia de perro
    'Sedum acre',  -- Uña de gato
    'Sedum album',  -- Uña de gato blanca
    'Sedum dasyphyllum',  -- Sedo de hojas gruesas
    'Serratula mucronata',  -- Serrátula
    'Sideritis ibanyezii',  -- Rabogato
    'Silene ramosissima',  -- Colleja de arenal
    'Sporobolus pungens',  -- Grama de mar
    'Stipellula capensis',  -- Barba de chivo
    'Sus scrofa',  -- Jabalí
    'Tamarix africana',  -- Taray
    'Tamarix boveana',  -- Taray de saladar
    'Tarentola mauritanica',  -- Salamanquesa común
    'Teucrium capitatum',  -- Zamarrilla
    'Thymus hyemalis',  -- Tomillo de invierno
    'Timon lepidus',  -- Lagarto ocelado
    'Tripidium ravennae',  -- Carrizo real
    'Vulpes vulpes',  -- Zorro
    'Withania frutescens'  -- Oroval
  );

COMMIT;

-- Comprobación: debe devolver 98 especies y 0 retiradas que sigan.
SELECT
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'cabo-cope-puntas-calnegre') AS especies_del_espacio,
    (SELECT COUNT(*) FROM species s JOIN parks p ON p.id = s.park_id WHERE p.slug = 'cabo-cope-puntas-calnegre' AND s.scientific_name IN ('Achillea maritima', 'Allium melananthum', 'Andryala ragusina', 'Anthyllis cytisoides', 'Artemisia barrelieri', 'Arthrocaulon macrostachyum', 'Asparagus albus', 'Asparagus horridus', 'Asphodelus fistulosus', 'Asteriscus maritimus', 'Atelerix algirus', 'Atriplex glauca', 'Atriplex halimus', 'Atriplex portulacoides', 'Beta maritima', 'Brachypodium retusum', 'Capparis sicula subsp. sicula', 'Caralluma europaea', 'Caroxylon vermiculatum', 'Centaurea saxicola', 'Centaurium rigualii', 'Chalcides bedriagai', 'Cistanche phelypaea', 'Cistus clusii', 'Citrullus colocynthis', 'Crithmum maritimum', 'Cutandia maritima', 'Cynomorium coccineum', 'Cyperus capitatus', 'Cytisus intermedius', 'Daucus pumilus', 'Dittrichia viscosa', 'Elymus farctus', 'Ephedra fragilis', 'Epidalea calamita', 'Eragrostis papposa', 'Euphorbia paralias', 'Fagonia cretica', 'Felis silvestris', 'Genetta genetta', 'Glaucium flavum', 'Halocnemum strobilaceum', 'Hammada articulata', 'Hemorrhois hippocrepis', 'Hyparrhenia hirta', 'Launaea arborescens', 'Lavandula dentata', 'Lavandula multifida', 'Limoniastrum monopetalum', 'Limonium delicatulum', 'Loeflingia hispanica', 'Lotus creticus', 'Lygeum spartum', 'Macrochloa tenacissima', 'Malcolmia littorea', 'Malpolon monspessulanus', 'Maresia nana', 'Martes foina', 'Maytenus senegalensis subsp. europaea', 'Medicago marina', 'Melica minuta', 'Nerium oleander', 'Olea europaea subsp. europaea', 'Oryctolagus cuniculus', 'Pancratium maritimum', 'Phagnalon saxatile', 'Phragmites australis', 'Pistacia lentiscus', 'Pseudodictamnus hirsutus', 'Quercus coccifera', 'Rhamnus lycioides subsp. borgiae', 'Rosmarinus officinalis', 'Salsola genistoides', 'Salsola kali', 'Sarcocapnos enneaphylla subsp. saetabensis', 'Sarcocornia fruticosa', 'Scrophularia canina', 'Sedum acre', 'Sedum album', 'Sedum dasyphyllum', 'Serratula mucronata', 'Sideritis ibanyezii', 'Silene ramosissima', 'Sporobolus pungens', 'Stipellula capensis', 'Sus scrofa', 'Tamarix africana', 'Tamarix boveana', 'Tarentola mauritanica', 'Teucrium capitatum', 'Thymus hyemalis', 'Timon lepidus', 'Tripidium ravennae', 'Vulpes vulpes', 'Withania frutescens')) AS retiradas_que_siguen;
