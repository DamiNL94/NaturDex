// ================================================================================================
// api.ts — cliente de la API PHP (Backend/Api) y tipos compartidos del panel.
// ------------------------------------------------------------------------------------------------
// Mismo contrato que el panel clásico: GET sin cabeceras extra; todo POST lleva JSON + la cabecera
// X-Requested-With que admin.php exige como mitigación CSRF. La sesión viaja en la cookie PHP
// (mismo origen), por eso no hay tokens que gestionar aquí.
// ================================================================================================

const API = '/Backend/Api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const opts: RequestInit | undefined =
    body !== undefined
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify(body)
        }
      : undefined;
  const res = await fetch(API + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? `HTTP ${res.status}`, res.status);
  return data as T;
}

// --- Tipos ----------------------------------------------------------------------------------------
export type Resource = 'species' | 'habitats' | 'pois';

export interface Park {
  /** id de la BD: identifica el parque en save_park al editar (id>0). */
  id: number;
  slug: string;
  name: string;
  /** Figura de protección (Parque Natural / Regional / Nacional…): agrupa el selector de parque. */
  category: string;
  region: string;
  province: string;
  municipality: string | null;
  description: string | null;
  area_hectares: number | null;
  coastline_km: number | null;
  /** Centro del parque (null si no está definido en la BD): encuadre del mini-mapa. */
  latitude: number | null;
  longitude: number | null;
  species: number;
  habitats: number;
  pois: number;
}

/** Campos editables de un parque enviados a save_park (id 0 = alta). */
export interface ParkInput {
  id: number;
  slug: string;
  name: string;
  category: string;
  region: string;
  province: string;
  municipality: string;
  description: string;
  area_hectares: string;
  coastline_km: string;
  latitude: string;
  longitude: string;
}

export interface Overview {
  user: { email: string; name: string };
  parks: Park[];
}

/** Geometría GeoJSON de área de un hábitat (lo único que se guarda en habitats.geometry). */
export interface PolygonGeometry {
  type: 'Polygon' | 'MultiPolygon';
  // Polygon: number[][][]  ·  MultiPolygon: number[][][][]. Se deja laxo para no duplicar el tipo.
  coordinates: unknown;
}

/** Fila cruda de la BD: columnas variables según el recurso (mismos nombres que en MySQL). */
export type Item = { id: number; habitat_ids?: number[]; geometry?: PolygonGeometry | null } & Record<string, unknown>;

export interface ExportResult {
  ok: boolean;
  dataPath: string;
  counts: { habitats: number; species: number; pointsOfInterest: number };
}
