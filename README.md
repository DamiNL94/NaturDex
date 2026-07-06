# NaturDex

NaturDex es un prototipo de guía virtual para identificar, catalogar e informar sobre especies vegetales y animales en parques naturales y nacionales de España.

El primer parque piloto es el Parque Regional de Cabo Cope y Puntas de Calnegre, en la Región de Murcia. La app está planteada como una experiencia tipo pokédex: mapa, catálogo, filtros, fichas de especie, hábitats y puntos de observación.

## Objetivo del prototipo

- Validar una experiencia profesional de exploración en campo.
- Estructurar los datos para escalar a otros parques españoles.
- Separar parque, hábitat, especie y observación para que el modelo crezca sin rehacer la base.
- Empezar con datos semilla de Cabo Cope y sustituirlos progresivamente por fuentes verificadas.

## Estructura

- `Frontend/index.html`: interfaz principal del prototipo.
- `Frontend/Css/styles.css`: diseño responsive de la experiencia NaturDex.
- `Frontend/Js/app.js`: mapa, filtros, catálogo y ficha de especie.
- `Frontend/Data/cabo-cope.json`: datos semilla del parque piloto.
- `Backend/Api/parks.php`: endpoint de parques.
- `Backend/Api/species.php`: endpoint agregado para parque y especies.
- `Database/schema.sql`: modelo inicial escalable.

## Próximos pasos recomendados

1. Cargar `Database/schema.sql` en MySQL.
2. Abrir `Frontend/index.html` desde el servidor local del proyecto.
3. Validar el catálogo biológico con fuentes oficiales antes de usarlo como contenido definitivo.
4. Añadir autenticación y subida de observaciones cuando el prototipo visual esté validado.
