# Descarga el Atlas y Manual de los Hábitats Naturales y Seminaturales de España (2005)
# del Banco de Datos de la Naturaleza (MITECO): 104 ficheros, ~388 MB, las 52 provincias.
#
# Generado desde atlas-habitats-2005-provincias.json. Fuente: «© Ministerio para la Transición
# Ecológica y el Reto Demográfico».
#
# Es reanudable: si un fichero ya está y pesa lo mismo que en el servidor, no lo vuelve a bajar.
# Uso:  powershell -ExecutionPolicy Bypass -File descargar-atlas-2005.ps1
#       powershell ... -File descargar-atlas-2005.ps1 -Solo 30      # una provincia
#       powershell ... -File descargar-atlas-2005.ps1 -SinExtraer   # no descomprime

param([string]$Solo = '', [switch]$SinExtraer)

$dst = Join-Path $PSScriptRoot 'miteco-ide\atlas-2005'
New-Item -ItemType Directory -Force -Path $dst | Out-Null
$ProgressPreference = 'SilentlyContinue'

$ficheros = @(
  @{NN='01'; Prov='Álava'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_habitat01_2005_tcm30-199585.zip'; Out='INB_Habitat01.zip'},
  @{NN='01'; Prov='Álava'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos01_tcm30-199586.zip'; Out='INB_Datos01.zip'},
  @{NN='02'; Prov='Albacete'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT02_2005_tcm30-199587.zip'; Out='INB_Habitat02.zip'},
  @{NN='02'; Prov='Albacete'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos02_tcm30-199588.zip'; Out='INB_Datos02.zip'},
  @{NN='03'; Prov='Alicante/Alacant'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT03_2005_tcm30-199589.zip'; Out='INB_Habitat03.zip'},
  @{NN='03'; Prov='Alicante/Alacant'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos03_tcm30-199590.zip'; Out='INB_Datos03.zip'},
  @{NN='04'; Prov='Almería'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/IBN_HABITAT04_2005_tcm30-199591.zip'; Out='INB_Habitat04.zip'},
  @{NN='04'; Prov='Almería'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos04_tcm30-199592.zip'; Out='INB_Datos04.zip'},
  @{NN='05'; Prov='Ávila'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT05_2005_tcm30-199593.zip'; Out='INB_Habitat05.zip'},
  @{NN='05'; Prov='Ávila'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos05_tcm30-199594.zip'; Out='INB_Datos05.zip'},
  @{NN='06'; Prov='Badajoz'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT06_2005_tcm30-199595.zip'; Out='INB_Habitat06.zip'},
  @{NN='06'; Prov='Badajoz'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos06_tcm30-199596.zip'; Out='INB_Datos06.zip'},
  @{NN='07'; Prov='Illes Balears'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT07_2005_tcm30-199597.zip'; Out='INB_Habitat07.zip'},
  @{NN='07'; Prov='Illes Balears'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos07_tcm30-199598.zip'; Out='INB_Datos07.zip'},
  @{NN='08'; Prov='Barcelona'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT08_2005_tcm30-199599.zip'; Out='INB_Habitat08.zip'},
  @{NN='08'; Prov='Barcelona'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos08_tcm30-199600.zip'; Out='INB_Datos08.zip'},
  @{NN='09'; Prov='Burgos'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT09_2005_tcm30-199601.zip'; Out='INB_Habitat09.zip'},
  @{NN='09'; Prov='Burgos'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos09_tcm30-199602.zip'; Out='INB_Datos09.zip'},
  @{NN='10'; Prov='Cáceres'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT10_2005_tcm30-199603.zip'; Out='INB_Habitat10.zip'},
  @{NN='10'; Prov='Cáceres'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos10_tcm30-199604.zip'; Out='INB_Datos10.zip'},
  @{NN='11'; Prov='Cádiz'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT11_2005_tcm30-199605.zip'; Out='INB_Habitat11.zip'},
  @{NN='11'; Prov='Cádiz'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos11_tcm30-199606.zip'; Out='INB_Datos11.zip'},
  @{NN='12'; Prov='Castellón/Castelló'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT12_2005_tcm30-199607.zip'; Out='INB_Habitat12.zip'},
  @{NN='12'; Prov='Castellón/Castelló'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos12_tcm30-199608.zip'; Out='INB_Datos12.zip'},
  @{NN='13'; Prov='Ciudad Real'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT13_2005_tcm30-199609.zip'; Out='INB_Habitat13.zip'},
  @{NN='13'; Prov='Ciudad Real'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos13_tcm30-199610.zip'; Out='INB_Datos13.zip'},
  @{NN='14'; Prov='Córdoba'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT14_2005_tcm30-199611.zip'; Out='INB_Habitat14.zip'},
  @{NN='14'; Prov='Córdoba'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos14_tcm30-199612.zip'; Out='INB_Datos14.zip'},
  @{NN='15'; Prov='A Coruña'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT15_2005_tcm30-199613.zip'; Out='INB_Habitat15.zip'},
  @{NN='15'; Prov='A Coruña'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos15_tcm30-199614.zip'; Out='INB_Datos15.zip'},
  @{NN='16'; Prov='Cuenca'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT16_2005_tcm30-199615.zip'; Out='INB_Habitat16.zip'},
  @{NN='16'; Prov='Cuenca'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos16_tcm30-199616.zip'; Out='INB_Datos16.zip'},
  @{NN='17'; Prov='Girona'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT17_2005_tcm30-199617.zip'; Out='INB_Habitat17.zip'},
  @{NN='17'; Prov='Girona'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos17_tcm30-199618.zip'; Out='INB_Datos17.zip'},
  @{NN='18'; Prov='Granada'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT18_2005_tcm30-199619.zip'; Out='INB_Habitat18.zip'},
  @{NN='18'; Prov='Granada'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos18_tcm30-199620.zip'; Out='INB_Datos18.zip'},
  @{NN='19'; Prov='Guadalajara'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT19_2005_tcm30-199621.zip'; Out='INB_Habitat19.zip'},
  @{NN='19'; Prov='Guadalajara'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos19_tcm30-199622.zip'; Out='INB_Datos19.zip'},
  @{NN='20'; Prov='Guipúzcoa'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT20_2005_tcm30-199623.zip'; Out='INB_Habitat20.zip'},
  @{NN='20'; Prov='Guipúzcoa'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos20_tcm30-199624.zip'; Out='INB_Datos20.zip'},
  @{NN='21'; Prov='Huelva'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT21_2005_tcm30-199625.zip'; Out='INB_Habitat21.zip'},
  @{NN='21'; Prov='Huelva'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos21_tcm30-199626.zip'; Out='INB_Datos21.zip'},
  @{NN='22'; Prov='Huesca'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT22_2005_tcm30-199627.zip'; Out='INB_Habitat22.zip'},
  @{NN='22'; Prov='Huesca'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos22_tcm30-199628.zip'; Out='INB_Datos22.zip'},
  @{NN='23'; Prov='Jaén'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT23_2005_tcm30-199629.zip'; Out='INB_Habitat23.zip'},
  @{NN='23'; Prov='Jaén'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos23_tcm30-199630.zip'; Out='INB_Datos23.zip'},
  @{NN='24'; Prov='León'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT24_2005_tcm30-199631.zip'; Out='INB_Habitat24.zip'},
  @{NN='24'; Prov='León'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos24_tcm30-199632.zip'; Out='INB_Datos24.zip'},
  @{NN='25'; Prov='Lleida'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT25_2005_tcm30-199633.zip'; Out='INB_Habitat25.zip'},
  @{NN='25'; Prov='Lleida'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos25_tcm30-199634.zip'; Out='INB_Datos25.zip'},
  @{NN='26'; Prov='La Rioja'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT26_2005_tcm30-199636.zip'; Out='INB_Habitat26.zip'},
  @{NN='26'; Prov='La Rioja'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos26_tcm30-199637.zip'; Out='INB_Datos26.zip'},
  @{NN='27'; Prov='Lugo'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT27_2005_tcm30-199638.zip'; Out='INB_Habitat27.zip'},
  @{NN='27'; Prov='Lugo'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos27_tcm30-199639.zip'; Out='INB_Datos27.zip'},
  @{NN='28'; Prov='Madrid'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT28_2005_tcm30-199640.zip'; Out='INB_Habitat28.zip'},
  @{NN='28'; Prov='Madrid'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos28_tcm30-199641.zip'; Out='INB_Datos28.zip'},
  @{NN='29'; Prov='Málaga'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT29_2005_tcm30-199642.zip'; Out='INB_Habitat29.zip'},
  @{NN='29'; Prov='Málaga'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos29_tcm30-199643.zip'; Out='INB_Datos29.zip'},
  @{NN='30'; Prov='Murcia'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT30_2005_tcm30-199644.zip'; Out='INB_Habitat30.zip'},
  @{NN='30'; Prov='Murcia'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos30_tcm30-199645.zip'; Out='INB_Datos30.zip'},
  @{NN='31'; Prov='Navarra'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT31_2005_tcm30-199646.zip'; Out='INB_Habitat31.zip'},
  @{NN='31'; Prov='Navarra'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos31_tcm30-199647.zip'; Out='INB_Datos31.zip'},
  @{NN='32'; Prov='Ourense'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT32_2005_tcm30-199648.zip'; Out='INB_Habitat32.zip'},
  @{NN='32'; Prov='Ourense'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos32_tcm30-199649.zip'; Out='INB_Datos32.zip'},
  @{NN='33'; Prov='Asturias'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT33_2005_tcm30-199650.zip'; Out='INB_Habitat33.zip'},
  @{NN='33'; Prov='Asturias'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos33_tcm30-199651.zip'; Out='INB_Datos33.zip'},
  @{NN='34'; Prov='Palencia'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT34_2005_tcm30-199652.zip'; Out='INB_Habitat34.zip'},
  @{NN='34'; Prov='Palencia'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos34_tcm30-199653.zip'; Out='INB_Datos34.zip'},
  @{NN='35'; Prov='Las Palmas'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT35_2005_tcm30-199654.zip'; Out='INB_Habitat35.zip'},
  @{NN='35'; Prov='Las Palmas'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos35_tcm30-199655.zip'; Out='INB_Datos35.zip'},
  @{NN='36'; Prov='Pontevedra'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT36_2005_tcm30-199656.zip'; Out='INB_Habitat36.zip'},
  @{NN='36'; Prov='Pontevedra'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos36_tcm30-199657.zip'; Out='INB_Datos36.zip'},
  @{NN='37'; Prov='Salamanca'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT37_2005_tcm30-199658.zip'; Out='INB_Habitat37.zip'},
  @{NN='37'; Prov='Salamanca'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos37_tcm30-199659.zip'; Out='INB_Datos37.zip'},
  @{NN='38'; Prov='Santa Cruz de Tenerife'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT38_2005_tcm30-199660.zip'; Out='INB_Habitat38.zip'},
  @{NN='38'; Prov='Santa Cruz de Tenerife'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos38_tcm30-199661.zip'; Out='INB_Datos38.zip'},
  @{NN='39'; Prov='Cantabria'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT39_2005_tcm30-199662.zip'; Out='INB_Habitat39.zip'},
  @{NN='39'; Prov='Cantabria'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos39_tcm30-199663.zip'; Out='INB_Datos39.zip'},
  @{NN='40'; Prov='Segovia'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT40_2005_tcm30-199664.zip'; Out='INB_Habitat40.zip'},
  @{NN='40'; Prov='Segovia'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos40_tcm30-199665.zip'; Out='INB_Datos40.zip'},
  @{NN='41'; Prov='Sevilla'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT41_2005_tcm30-199666.zip'; Out='INB_Habitat41.zip'},
  @{NN='41'; Prov='Sevilla'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos41_tcm30-199667.zip'; Out='INB_Datos41.zip'},
  @{NN='42'; Prov='Soria'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT42_2005_tcm30-199668.zip'; Out='INB_Habitat42.zip'},
  @{NN='42'; Prov='Soria'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos42_tcm30-199669.zip'; Out='INB_Datos42.zip'},
  @{NN='43'; Prov='Tarragona'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT43_2005_tcm30-199670.zip'; Out='INB_Habitat43.zip'},
  @{NN='43'; Prov='Tarragona'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos43_tcm30-199671.zip'; Out='INB_Datos43.zip'},
  @{NN='44'; Prov='Teruel'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT44_2005_tcm30-199672.zip'; Out='INB_Habitat44.zip'},
  @{NN='44'; Prov='Teruel'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos44_tcm30-199673.zip'; Out='INB_Datos44.zip'},
  @{NN='45'; Prov='Toledo'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT45_2005_tcm30-199674.zip'; Out='INB_Habitat45.zip'},
  @{NN='45'; Prov='Toledo'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos45_tcm30-199675.zip'; Out='INB_Datos45.zip'},
  @{NN='46'; Prov='Valencia/València'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT46_2005_tcm30-199676.zip'; Out='INB_Habitat46.zip'},
  @{NN='46'; Prov='Valencia/València'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos46_tcm30-199677.zip'; Out='INB_Datos46.zip'},
  @{NN='47'; Prov='Valladolid'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT47_2005_tcm30-199678.zip'; Out='INB_Habitat47.zip'},
  @{NN='47'; Prov='Valladolid'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos47_tcm30-199679.zip'; Out='INB_Datos47.zip'},
  @{NN='48'; Prov='Vizcaya'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT48_2005_tcm30-199680.zip'; Out='INB_Habitat48.zip'},
  @{NN='48'; Prov='Vizcaya'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos48_tcm30-199681.zip'; Out='INB_Datos48.zip'},
  @{NN='49'; Prov='Zamora'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT49_2005_tcm30-199682.zip'; Out='INB_Habitat49.zip'},
  @{NN='49'; Prov='Zamora'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos49_tcm30-199683.zip'; Out='INB_Datos49.zip'},
  @{NN='50'; Prov='Zaragoza'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT50_2005_tcm30-199684.zip'; Out='INB_Habitat50.zip'},
  @{NN='50'; Prov='Zaragoza'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos50_tcm30-199685.zip'; Out='INB_Datos50.zip'},
  @{NN='51'; Prov='Ceuta'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT51_2005_tcm30-199686.zip'; Out='INB_Habitat51.zip'},
  @{NN='51'; Prov='Ceuta'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos51_tcm30-199687.zip'; Out='INB_Datos51.zip'},
  @{NN='52'; Prov='Melilla'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/INB_HABITAT52_2005_tcm30-199688.zip'; Out='INB_Habitat52.zip'},
  @{NN='52'; Prov='Melilla'; Url='https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/inb_datos52_tcm30-199689.zip'; Out='INB_Datos52.zip'}
)

if ($Solo) { $ficheros = $ficheros | Where-Object { $_.NN -eq $Solo.PadLeft(2,'0') } }

$total = $ficheros.Count; $i = 0; $bajados = 0; $saltados = 0; $fallos = @()
Write-Host "Descargando $total ficheros a $dst"

foreach ($f in $ficheros) {
  $i++
  $ruta = Join-Path $dst $f.Out
  $pct = [int]($i * 100 / $total)
  Write-Progress -Activity 'Atlas de Hábitats 2005' -Status "[$i/$total] $($f.NN) $($f.Prov) - $($f.Out)" -PercentComplete $pct
  try {
    $esperado = (Invoke-WebRequest -Uri $f.Url -Method Head -UseBasicParsing).Headers['Content-Length']
    if ($esperado -is [array]) { $esperado = $esperado[0] }
    $esperado = [int64]$esperado
  } catch { $esperado = 0 }

  if ((Test-Path $ruta) -and $esperado -gt 0 -and (Get-Item $ruta).Length -eq $esperado) { $saltados++; continue }

  try {
    Invoke-WebRequest -Uri $f.Url -OutFile $ruta -UseBasicParsing
    $real = (Get-Item $ruta).Length
    if ($esperado -gt 0 -and $real -ne $esperado) {
      $fallos += "$($f.Out): descargado $real B, esperado $esperado B"
    } else { $bajados++ }
  } catch { $fallos += "$($f.Out): $($_.Exception.Message)" }
}
Write-Progress -Activity 'Atlas de Hábitats 2005' -Completed

Write-Host ""
Write-Host "Descargados: $bajados  ·  Ya estaban: $saltados  ·  Fallos: $($fallos.Count)"
if ($fallos.Count) { Write-Host 'FALLOS:' -ForegroundColor Red; $fallos | ForEach-Object { Write-Host "  $_" -ForegroundColor Red } }

if (-not $SinExtraer) {
  Write-Host 'Extrayendo...'
  Get-ChildItem "$dst\*.zip" | ForEach-Object {
    $carpeta = Join-Path $dst $_.BaseName
    if (-not (Test-Path $carpeta)) { Expand-Archive $_.FullName -DestinationPath $carpeta -Force }
  }
  Write-Host 'Listo.'
}

$mb = [math]::Round(((Get-ChildItem "$dst\*.zip" | Measure-Object Length -Sum).Sum / 1MB), 1)
Write-Host "Total en disco: $mb MB en $dst"
