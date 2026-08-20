# Cotejo de nomenclatura contra EIDOS y GBIF

Generado por `npm run taxones:nomenclatura`. Fichas con hallazgo: 22.

La regla que se comprueba: `scientificName`, `eidosTaxonId` y `taxonomy` los manda **EIDOS**
(nombre aceptado); `gbifSpeciesKey` la manda **GBIF** (key aceptada de su backbone, que es la
que lleva las ocurrencias). Que las dos autoridades usen géneros distintos no es un error.

## El nombre de la ficha es un SINÓNIMO para EIDOS (hay que renombrar) — 16

- **Centaurium rigualii** (cabo-cope-puntas-calnegre)
  - EIDOS da «Centaurium rigualii» por Sinónimo; acepta «Centaurium barrelieri (Dufour) Font Quer & Rothm.» (taxonid 3360, Species)
  - propuesta: `Centaurium barrelieri`
- **Anabasis hispanica** (cabo-cope-puntas-calnegre)
  - EIDOS da «Anabasis hispanica» por Sinónimo; acepta «Anabasis mucronata (Lag.) C. Vic.» (taxonid 1838, Species)
  - propuesta: `Anabasis mucronata`
- **Maytenus senegalensis subsp. europaea** (cabo-cope-puntas-calnegre)
  - EIDOS da «Maytenus senegalensis subsp. europaea» por Sinónimo; acepta «Gymnosporia senegalensis subsp. europaea (Boiss.) Rivas Goday & Rivas Mart.» (taxonid 6258, Subspecies). **El aceptado es de rango Subspecies**: adoptarlo cambia el rango de la ficha, no solo el nombre, así que no se propone un binomio truncado
- **Stipa capensis** (cabo-cope-puntas-calnegre)
  - EIDOS da «Stipa capensis» por Sinónimo; acepta «Stipellula capensis (Thunb.) Röser & Hamasha» (taxonid 10149, Species)
  - propuesta: `Stipellula capensis`
- **Saccharum ravennae** (cabo-cope-puntas-calnegre)
  - EIDOS da «Saccharum ravennae» por Sinónimo; acepta «Tripidium ravennae (L.) H. Scholz» (taxonid 80560, Species)
  - propuesta: `Tripidium ravennae`
- **Elymus farctus** (cabo-cope-puntas-calnegre)
  - EIDOS da «Elymus farctus» por Sinónimo; acepta «Thinopyrum junceum (L.) Á. Löve» (taxonid 9567, Species)
  - propuesta: `Thinopyrum junceum`
- **Ballota hirsuta** (cabo-cope-puntas-calnegre)
  - EIDOS da «Ballota hirsuta» por Sinónimo; acepta «Pseudodictamnus hirsutus (Willd.) Salmaki & Siadati» (taxonid 2631, Species)
  - propuesta: `Pseudodictamnus hirsutus`
- **Halimione portulacoides** (cabo-cope-puntas-calnegre)
  - EIDOS da «Halimione portulacoides» por Sinónimo; acepta «Atriplex portulacoides L.» (taxonid 5035, Species)
  - propuesta: `Atriplex portulacoides`
- **Serratula mucronata** (cabo-cope-puntas-calnegre)
  - EIDOS da «Serratula mucronata» por Sinónimo; acepta «Klasea flavescens subsp. mucronata (Desf.) Cantó & Rivas Mart.» (taxonid 5538, Subspecies). **El aceptado es de rango Subspecies**: adoptarlo cambia el rango de la ficha, no solo el nombre, así que no se propone un binomio truncado
- **Salsola vermiculata** (cabo-cope-puntas-calnegre)
  - EIDOS da «Salsola vermiculata» por Sinónimo; acepta «Caroxylon vermiculatum (L.) Akhani & Roalson» (taxonid 1341, Species)
  - propuesta: `Caroxylon vermiculatum`
- **Arthrocnemum macrostachyum** (cabo-cope-puntas-calnegre)
  - EIDOS da «Arthrocnemum macrostachyum» por Sinónimo; acepta «Arthrocaulon macrostachyum (Moric.) Piirainen & G.Kadereit» (taxonid 33034, Species)
  - propuesta: `Arthrocaulon macrostachyum`
- **Sarcocornia fruticosa** (cabo-cope-puntas-calnegre)
  - EIDOS da «Sarcocornia fruticosa» por Sinónimo; acepta «Salicornia lagascae (Fuente, Rufo & Sánchez Mata) Piirainen & G. Kadereit» (taxonid 33125, Species)
  - propuesta: `Salicornia lagascae`
- **Sedum sediforme** (cabo-cope-puntas-calnegre)
  - EIDOS da «Sedum sediforme» por Sinónimo; acepta «Petrosedum sediforme (Jacq.) Grulich subsp. sediforme» (taxonid 95304, Subspecies). **El aceptado es de rango Subspecies**: adoptarlo cambia el rango de la ficha, no solo el nombre, así que no se propone un binomio truncado
- **Sarcocapnos enneaphylla subsp. saetabensis** (cabo-cope-puntas-calnegre)
  - EIDOS da «Sarcocapnos enneaphylla subsp. saetabensis» por Sinónimo; acepta «Sarcocapnos saetabensis Mateo & Figuerola» (taxonid 31994, Species)
  - propuesta: `Sarcocapnos saetabensis`
- **Pseudorlaya pumila** (cabo-cope-puntas-calnegre)
  - EIDOS da «Pseudorlaya pumila» por Sinónimo; acepta «Daucus pumilus (L.) Hoffmanns. & Link» (taxonid 7405, Species)
  - propuesta: `Daucus pumilus`
- **Calicotome intermedia** (cabo-cope-puntas-calnegre)
  - EIDOS da «Calicotome intermedia» por Sinónimo; acepta «Cytisus intermedius (C. Presl) Walp.» (taxonid 2950, Species)
  - propuesta: `Cytisus intermedius`

## El eidosTaxonId no es de rango especie (hay que reanclar) — 4

- **Bucanetes githagineus** (cabo-cope-puntas-calnegre)
  - el eidosTaxonId 11363 es de rango Subspecies («Bucanetes githagineus subsp. zedlitzi»), pero la ficha declara un binomio de especie
- **Caralluma europaea** (cabo-cope-puntas-calnegre)
  - el eidosTaxonId 80097 es de rango Variety («Caralluma europaea var. maroccana (Hook. fil.) A. Berger»), pero la ficha declara un binomio de especie
- **Serratula mucronata** (cabo-cope-puntas-calnegre)
  - el eidosTaxonId 5538 es de rango Subspecies («Klasea flavescens subsp. mucronata (Desf.) Cantó & Rivas Mart.»), pero la ficha declara un binomio de especie
- **Sedum sediforme** (cabo-cope-puntas-calnegre)
  - el eidosTaxonId 95304 es de rango Subspecies («Petrosedum sediforme (Jacq.) Grulich subsp. sediforme»), pero la ficha declara un binomio de especie

## gbifSpeciesKey apunta a un sinónimo HETEROTÍPICO (NO se toca: cambia el taxón) — 11

- **Centaurium rigualii** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 5596459 («Centaurium rigualii Esteve») es SYNONYM en el backbone; el aceptado es «Centaurium quadrifolium subsp. quadrifolium» (key 7270624)
- **Caralluma europaea** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 3578145 («Caralluma europaea (Guss.) N.E.Br.») es SYNONYM en el backbone; el aceptado es «Ceropegia europaea (Guss.) Bruyns» (key 9245056)
- **Olea europaea subsp. europaea** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 8028262 («Olea europaea var. sylvestris (Mill.) Lehr») es SYNONYM en el backbone; el aceptado es «Olea europaea subsp. europaea» (key 7164892)
- **Capparis sicula subsp. sicula** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 7273402 («Capparis sicula subsp. sicula») es SYNONYM en el backbone; el aceptado es «Capparis spinosa var. canescens Coss.» (key 5602120)
- **Anabasis hispanica** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 8397718 («Anabasis hispanica Pau») es SYNONYM en el backbone; el aceptado es «Anabasis articulata (Forssk.) Moq.» (key 5568629)
- **Maytenus senegalensis subsp. europaea** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 3793958 («Maytenus senegalensis subsp. europaeus (Boiss.) Rivas Mart. ex Güemes & M.B.Crespo») es SYNONYM en el backbone; el aceptado es «Gymnosporia senegalensis var. europaea (Boiss.) Jahand. & Maire» (key 7452556)
- **Periploca angustifolia** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 8222621 («Periploca angustifolia Labill.») es SYNONYM en el backbone; el aceptado es «Periploca laevigata Aiton» (key 6022574)
- **Elymus farctus** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 5289901 («Elymus farctus (Viv.) Runemark ex Melderis») es SYNONYM en el backbone; el aceptado es «Thinopyrum junceum (L.) Á.Löve» (key 8395719)
- **Asteriscus maritimus** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 5385231 («Asteriscus maritimus (L.) Less.») es SYNONYM en el backbone; el aceptado es «Pallenis maritima subsp. maritima» (key 9548955)
- **Serratula mucronata** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 5692462 («Serratula mucronata Desf.») es SYNONYM en el backbone; el aceptado es «Klasea flavescens subsp. mucronata (Desf.) Cantó & Rivas Mart.» (key 4217535)
- **Sarcocornia fruticosa** (cabo-cope-puntas-calnegre)
  - gbifSpeciesKey 3083613 («Sarcocornia fruticosa (L.) A.J.Scott») es SYNONYM en el backbone; el aceptado es «Salicornia fruticosa (L.) L.» (key 5567884)
