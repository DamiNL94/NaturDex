// ================================================================================================
// ParkForm.tsx — modal de alta/edición de la ficha de un parque (la raíz del catálogo).
// ------------------------------------------------------------------------------------------------
// Un parque es el contenedor del que cuelgan hábitats/especies/POIs. Antes solo se podía crear por
// SQL; este formulario lo hace desde la GUI (POST save_park). Al guardar invalida el overview para
// que el nuevo parque aparezca en el selector, y devuelve su slug para conmutar a él. El borrado
// (delete_park) está guardado en el backend: solo permite eliminar parques vacíos.
// ================================================================================================
import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, PARK_STATUS_LABELS, type Overview, type Park, type ParkInput, type ParkStatus } from './api';
import { useToast } from './toast';
import CoordPicker from './CoordPicker';

// Valores por defecto de un parque nuevo (la app nace centrada en la Región de Murcia). Nace como
// ficha base: es lo honesto mientras no tenga catálogo, y es el flujo del rollout nacional.
const BLANK: ParkInput = {
  id: 0, slug: '', name: '', category: '', region: 'Región de Murcia', province: 'Murcia',
  municipality: '', description: '', area_hectares: '', coastline_km: '', latitude: '', longitude: '',
  status: 'basic'
};

function toInput(p: Park): ParkInput {
  return {
    id: p.id, slug: p.slug, name: p.name, category: p.category, region: p.region,
    province: p.province, municipality: p.municipality ?? '', description: p.description ?? '',
    area_hectares: p.area_hectares != null ? String(p.area_hectares) : '',
    coastline_km: p.coastline_km != null ? String(p.coastline_km) : '',
    latitude: p.latitude != null ? String(p.latitude) : '',
    longitude: p.longitude != null ? String(p.longitude) : '',
    status: p.status ?? 'basic'
  };
}

interface Props {
  /** Parque a editar, o null para crear uno nuevo. */
  park: Park | null;
  /** Parques existentes: alimenta la lista de figuras de protección ya usadas (datalist). */
  overview: Overview;
  onClose: () => void;
  /** Tras guardar: slug del parque (para conmutar a él en el panel). */
  onSaved: (slug: string) => void;
  /** Tras eliminar: el panel vuelve al primer parque disponible. */
  onDeleted: () => void;
}

export default function ParkForm({ park, overview, onClose, onSaved, onDeleted }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const isNew = !park;
  const [draft, setDraft] = useState<ParkInput>(() => (park ? toInput(park) : BLANK));

  const categories = useMemo(
    () => [...new Set(overview.parks.map(p => p.category).filter(Boolean))].sort(),
    [overview.parks]
  );

  // Marcar como "completo" un espacio sin nada dentro es justo lo que el nivel de ficha base viene a
  // evitar: se avisa (no se bloquea; puede estar a medio cargar y quererse publicar igualmente).
  const emptyButAvailable =
    draft.status === 'available' && !!park && park.species === 0 && park.habitats === 0 && park.pois === 0;

  function set<K extends keyof ParkInput>(k: K, v: ParkInput[K]) {
    setDraft(d => ({ ...d, [k]: v }));
  }

  const save = useMutation({
    mutationFn: () => api<{ ok: boolean; id: number; slug: string }>('/admin.php?action=save_park', { item: draft }),
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      toast(isNew ? 'Parque creado ✓' : 'Parque guardado ✓');
      onSaved(res.slug);
    },
    onError: e => toast(e instanceof Error ? e.message : 'No se pudo guardar el parque.', true)
  });

  const remove = useMutation({
    mutationFn: () => api('/admin.php?action=delete_park', { park: park!.slug }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      toast('Parque eliminado ✓');
      onDeleted();
    },
    onError: e => toast(e instanceof Error ? e.message : 'No se pudo eliminar el parque.', true)
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  function confirmDelete() {
    if (!park) return;
    if (confirm(`¿Eliminar el parque "${park.name}"? Solo se puede si está vacío (sin hábitats, especies ni puntos de interés).`)) {
      remove.mutate();
    }
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20';
  const labelCls = 'block text-sm font-semibold text-stone-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={submit}
        noValidate
        className="my-6 w-full max-w-3xl rounded-2xl bg-stone-100 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-emerald-700 uppercase">
              {isNew ? 'Nuevo parque' : 'Editar parque'}
            </p>
            <h2 className="text-lg font-extrabold text-stone-900">{draft.name || 'Ficha del parque'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg px-2 py-1 text-xl leading-none font-bold text-stone-400 transition hover:bg-stone-200 hover:text-stone-700"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <label className={labelCls}>
            Nombre *
            <input type="text" value={draft.name} onChange={e => set('name', e.target.value)} className={inputCls} />
          </label>
          <label className={labelCls}>
            Slug
            <input
              type="text"
              value={draft.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder={isNew ? '(se genera del nombre)' : ''}
              className={inputCls}
            />
            <span className="mt-0.5 block text-xs font-normal text-stone-500">
              Identificador en la URL y la BD. Si lo dejas vacío se deriva del nombre.
            </span>
          </label>

          {/* Nivel de dato: decide qué experiencia ve el visitante. Al publicar, este valor se
              escribe en Frontend/Data/parks-index.json, que es lo que lee la app pública. */}
          <label className={`${labelCls} sm:col-span-2`}>
            Nivel de dato *
            <select
              value={draft.status}
              onChange={e => set('status', e.target.value as ParkStatus)}
              className={inputCls}
            >
              {(Object.keys(PARK_STATUS_LABELS) as ParkStatus[]).map(s => (
                <option key={s} value={s}>{PARK_STATUS_LABELS[s]}</option>
              ))}
            </select>
            <span className="mt-0.5 block text-xs font-normal text-stone-500">
              Se aplica a la app pública al pulsar «Publicar cambios offline».
            </span>
            {emptyButAvailable && (
              <span className="mt-1 block rounded-md bg-amber-50 px-2 py-1 text-xs font-normal text-amber-800">
                Este espacio está marcado como <strong>completo</strong> pero no tiene hábitats, especies
                ni puntos de interés: la app enseñaría un catálogo vacío. Déjalo en <strong>ficha base</strong>
                {' '}hasta que tenga contenido.
              </span>
            )}
          </label>

          <label className={labelCls}>
            Figura de protección *
            <input
              type="text"
              list="park-categories"
              value={draft.category}
              onChange={e => set('category', e.target.value)}
              placeholder="Paisaje Protegido, Parque Regional…"
              className={inputCls}
            />
            <datalist id="park-categories">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
          </label>
          <label className={labelCls}>
            Comunidad autónoma *
            <input type="text" value={draft.region} onChange={e => set('region', e.target.value)} className={inputCls} />
          </label>

          <label className={labelCls}>
            Provincia *
            <input type="text" value={draft.province} onChange={e => set('province', e.target.value)} className={inputCls} />
          </label>
          <label className={labelCls}>
            Municipio(s)
            <input type="text" value={draft.municipality} onChange={e => set('municipality', e.target.value)} className={inputCls} />
          </label>

          <label className={labelCls}>
            Superficie (ha)
            <input type="number" step="any" min={0} value={draft.area_hectares} onChange={e => set('area_hectares', e.target.value)} className={inputCls} />
          </label>
          <label className={labelCls}>
            Costa (km)
            <input type="number" step="any" min={0} value={draft.coastline_km} onChange={e => set('coastline_km', e.target.value)} className={inputCls} />
          </label>

          <label className={`${labelCls} sm:col-span-2`}>
            Descripción
            <textarea rows={3} value={draft.description} onChange={e => set('description', e.target.value)} className={inputCls} />
          </label>

          <label className={labelCls}>
            Latitud (centro) *
            <input type="number" step="any" value={draft.latitude} onChange={e => set('latitude', e.target.value)} className={inputCls} />
          </label>
          <label className={labelCls}>
            Longitud (centro) *
            <input type="number" step="any" value={draft.longitude} onChange={e => set('longitude', e.target.value)} className={inputCls} />
          </label>

          <CoordPicker
            lat={draft.latitude}
            lng={draft.longitude}
            center={
              park && park.latitude !== null && park.longitude !== null
                ? [park.latitude, park.longitude]
                : null
            }
            onPick={(la, ln) => setDraft(d => ({ ...d, latitude: la, longitude: ln }))}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3 border-t border-stone-200 pt-4">
          <button
            type="submit"
            disabled={save.isPending}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            {save.isPending ? 'Guardando…' : isNew ? 'Crear parque' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-bold text-stone-600 transition hover:bg-stone-200"
          >
            Cancelar
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={confirmDelete}
              disabled={remove.isPending}
              className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              {remove.isPending ? 'Eliminando…' : 'Eliminar parque'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
