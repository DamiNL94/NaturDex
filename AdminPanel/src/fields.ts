// ================================================================================================
// fields.ts — definición declarativa de los formularios (mismos nombres de columna que la BD).
// ------------------------------------------------------------------------------------------------
// Igual que en el panel clásico: añadir un campo nuevo es una línea aquí y otra en la lista blanca
// de Backend/Api/admin.php. El formulario se genera solo (ItemForm.tsx).
// ================================================================================================
import type { Resource } from './api';

export interface FieldDef {
  k: string;
  label: string;
  req?: boolean;
  type?: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  options?: string[];
  min?: number;
  max?: number;
  wide?: boolean;
  hint?: string;
}

export const KINGDOMS = ['fauna', 'flora', 'fungi', 'other'];

export const FIELDS: Record<Resource, FieldDef[]> = {
  species: [
    { k: 'common_name', label: 'Nombre común', req: true },
    { k: 'scientific_name', label: 'Nombre científico', req: true },
    { k: 'kingdom', label: 'Reino', type: 'select', options: KINGDOMS },
    { k: 'family', label: 'Grupo (p. ej. Aves, Matorral)' },
    { k: 'primary_habitat', label: 'Hábitat (texto de la ficha)' },
    { k: 'conservation_status', label: 'Estado de conservación' },
    { k: 'seasonality', label: 'Temporada' },
    { k: 'rarity_score', label: 'Rareza (1-5)', type: 'number', min: 1, max: 5 },
    { k: 'image_url', label: 'Foto (URL o ruta Img/…)' },
    { k: 'latitude', label: 'Latitud', type: 'number' },
    { k: 'longitude', label: 'Longitud', type: 'number' },
    { k: 'is_featured', label: 'Especie prioritaria (destacada)', type: 'checkbox' },
    { k: 'description', label: 'Descripción', type: 'textarea', wide: true },
    { k: 'identification_tips', label: 'Consejos de identificación', type: 'textarea', wide: true, hint: 'Separa cada consejo con punto y coma (;)' },
    { k: 'taxon_phylum', label: 'Filo/División' },
    { k: 'taxon_class', label: 'Clase' },
    { k: 'taxon_order', label: 'Orden' },
    { k: 'taxon_family', label: 'Familia (taxonómica)' },
    { k: 'taxon_genus', label: 'Género' },
    { k: 'iucn_global', label: 'UICN (global)' },
    { k: 'spain_status', label: 'Estado en España', wide: true },
    { k: 'murcia_status', label: 'Estado en la Región de Murcia', wide: true },
    { k: 'source', label: 'Fuente', wide: true },
    { k: 'review_note', label: 'Nota "pendiente de revisión" (vacío = ficha validada)', type: 'textarea', wide: true }
  ],
  habitats: [
    { k: 'name', label: 'Nombre', req: true },
    { k: 'code', label: 'Código Natura 2000 (p. ej. 1240)' },
    { k: 'slug', label: 'Slug (enlaza geometría y foto)', hint: 'Debe coincidir con el habitats.geojson y con Img/habitats/<slug>.jpg' },
    { k: 'habitat_type', label: 'Tipo (Marino / Litoral / Terrestre)' },
    { k: 'color', label: 'Color en el mapa (p. ej. #2f6f4e)' },
    { k: 'latitude', label: 'Latitud (centro aprox.)', type: 'number' },
    { k: 'longitude', label: 'Longitud (centro aprox.)', type: 'number' },
    { k: 'is_priority', label: 'Hábitat prioritario UE', type: 'checkbox' },
    { k: 'description', label: 'Descripción', type: 'textarea', wide: true },
    { k: 'audio_url', label: 'Audioguía (URL o ruta Audio/…)', hint: 'Audio explicativo del hábitat (mp3/ogg)' },
    { k: 'audio_transcript', label: 'Transcripción de la audioguía', type: 'textarea', wide: true, hint: 'Obligatoria por accesibilidad si hay audio (WCAG 1.2.1)' },
    { k: 'review_note', label: 'Nota "pendiente de revisión" (vacío = validado)', type: 'textarea', wide: true }
  ],
  pois: [
    { k: 'name', label: 'Nombre', req: true },
    { k: 'slug', label: 'Slug (identificador)', req: true },
    { k: 'type', label: 'Tipo (Cultural, Paisajístico, Geológico…)' },
    // Obligatorias: un POI sin coordenadas no se puede pintar ni descubrir por proximidad
    // (admin.php rechaza el guardado). El mini-mapa de abajo las rellena con un clic.
    { k: 'latitude', label: 'Latitud', type: 'number', req: true },
    { k: 'longitude', label: 'Longitud', type: 'number', req: true },
    { k: 'image_url', label: 'Foto (URL o ruta Img/…)' },
    { k: 'source', label: 'Fuente' },
    { k: 'is_approx', label: 'Ubicación aproximada (aviso en el popup)', type: 'checkbox' },
    { k: 'description', label: 'Descripción', type: 'textarea', wide: true },
    { k: 'audio_url', label: 'Audioguía (URL o ruta Audio/…)', hint: 'Audio explicativo del punto de interés (mp3/ogg)' },
    { k: 'audio_transcript', label: 'Transcripción de la audioguía', type: 'textarea', wide: true, hint: 'Obligatoria por accesibilidad si hay audio (WCAG 1.2.1)' }
  ]
};

export const RESOURCE_LABELS: Record<Resource, string> = {
  species: 'Especies',
  habitats: 'Hábitats',
  pois: 'Puntos de interés'
};

/** Título de un elemento en la lista lateral (las especies usan el nombre común). */
export function itemTitle(resource: Resource, item: Record<string, unknown>): string {
  const key = resource === 'species' ? 'common_name' : 'name';
  return String(item[key] ?? '') || '(sin nombre)';
}
