// ================================================================================================
// ItemForm.tsx — formulario de alta/edición generado desde las definiciones de fields.ts.
// ------------------------------------------------------------------------------------------------
// El borrador vive en estado local (el componente se remonta al cambiar de elemento, vía `key` en
// Panel.tsx). Al guardar se envía el item con los mismos nombres de columna que espera la lista
// blanca de admin.php; las casillas van como 1/0 y la relación especie ↔ hábitats como array de ids.
// ================================================================================================
import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Item, type Resource } from './api';
import { FIELDS, itemTitle, type FieldDef } from './fields';
import { useToast } from './toast';
import CoordPicker from './CoordPicker';
import HabitatEditor from './HabitatEditor';
import type { PolygonGeometry } from './api';

const SINGULAR: Record<Resource, string> = { species: 'especie', habitats: 'hábitat', pois: 'punto de interés' };

type Draft = Record<string, string | boolean>;

function initialDraft(fields: FieldDef[], item: Item): Draft {
  const draft: Draft = {};
  for (const f of fields) {
    const v = item[f.k];
    if (f.type === 'checkbox') draft[f.k] = Boolean(Number(v ?? 0));
    else if (f.type === 'select') draft[f.k] = String(v ?? '') || f.options![0];
    else if (f.type === 'number' && f.min != null && (v == null || v === '')) draft[f.k] = String(f.min);
    else draft[f.k] = v == null ? '' : String(v);
  }
  return draft;
}

interface Props {
  resource: Resource;
  park: string;
  item: Item; // id 0 = alta
  habitats: Item[];
  /** Centro del parque para encuadrar el mini-mapa de coordenadas. */
  parkCenter: [number, number] | null;
  onSaved: (id: number) => void;
  onDeleted: () => void;
}

export default function ItemForm({ resource, park, item, habitats, parkCenter, onSaved, onDeleted }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const fields = FIELDS[resource];
  const isNew = !item.id;

  const [draft, setDraft] = useState<Draft>(() => initialDraft(fields, item));
  const [habitatSel, setHabitatSel] = useState<Set<number>>(() => new Set(item.habitat_ids ?? []));

  function set(k: string, v: string | boolean) {
    setDraft(d => ({ ...d, [k]: v }));
  }

  function invalidate() {
    // Las listas del parque entero: guardar un hábitat puede cambiar las casillas de las especies.
    queryClient.invalidateQueries({ queryKey: ['list', park] });
    queryClient.invalidateQueries({ queryKey: ['overview'] });
  }

  const save = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = { id: item.id };
      for (const f of fields) payload[f.k] = f.type === 'checkbox' ? (draft[f.k] ? 1 : 0) : draft[f.k];
      if (resource === 'species') payload.habitat_ids = [...habitatSel];
      return api<{ ok: boolean; id: number }>(`/admin.php?action=save&resource=${resource}`, { park, item: payload });
    },
    onSuccess: res => {
      invalidate();
      toast('Guardado ✓');
      onSaved(res.id);
    },
    onError: e => toast(e instanceof Error ? e.message : 'No se pudo guardar.', true)
  });

  const remove = useMutation({
    mutationFn: () => api(`/admin.php?action=delete&resource=${resource}`, { id: item.id }),
    onSuccess: () => {
      invalidate();
      toast('Eliminado ✓');
      onDeleted();
    },
    onError: e => toast(e instanceof Error ? e.message : 'No se pudo eliminar.', true)
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  function confirmDelete() {
    const name = itemTitle(resource, item);
    if (confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer (las relaciones se limpian en cascada).`)) {
      remove.mutate();
    }
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20';

  function control(f: FieldDef) {
    const v = draft[f.k];
    if (f.type === 'textarea') {
      return <textarea rows={3} value={String(v)} onChange={e => set(f.k, e.target.value)} className={inputCls} />;
    }
    if (f.type === 'select') {
      return (
        <select value={String(v)} onChange={e => set(f.k, e.target.value)} className={inputCls}>
          {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (f.type === 'number') {
      return <input type="number" step="any" min={f.min} max={f.max} value={String(v)} onChange={e => set(f.k, e.target.value)} className={inputCls} />;
    }
    return <input type="text" value={String(v)} onChange={e => set(f.k, e.target.value)} className={inputCls} />;
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-4xl">
      <h2 className="mb-4 text-base font-extrabold text-stone-900">
        {isNew ? `Nueva ficha de ${SINGULAR[resource]}` : itemTitle(resource, item)}
      </h2>

      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        {fields.flatMap(f => {
          const node = f.type === 'checkbox' ? (
            <label key={f.k} className="flex items-center gap-2 self-end pb-1 text-sm font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={Boolean(draft[f.k])}
                onChange={e => set(f.k, e.target.checked)}
                className="h-4 w-4 accent-emerald-700"
              />
              {f.label}
            </label>
          ) : (
            <label key={f.k} className={`block text-sm font-semibold text-stone-700 ${f.wide ? 'sm:col-span-2' : ''}`}>
              {f.label}{f.req && ' *'}
              {control(f)}
              {f.hint && <span className="mt-0.5 block text-xs font-normal text-stone-500">{f.hint}</span>}
            </label>
          );
          // Tras el campo de longitud va el mini-mapa: un clic rellena latitud y longitud
          // (los tres recursos tienen ambos campos, así que siempre existe este ancla).
          if (f.k === 'longitude') {
            return [
              node,
              <CoordPicker
                key="coord-picker"
                lat={String(draft.latitude ?? '')}
                lng={String(draft.longitude ?? '')}
                center={parkCenter}
                onPick={(la, ln) => setDraft(d => ({ ...d, latitude: la, longitude: ln }))}
              />
            ];
          }
          return node;
        })}
      </div>

      {/* Editor del área (polígono) del hábitat: la BD es la fuente de verdad de la geometría. */}
      {resource === 'habitats' && (
        isNew ? (
          <p className="mt-5 rounded-xl border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-500">
            Guarda primero la ficha del hábitat para poder dibujar su área en el mapa.
          </p>
        ) : (
          <div className="mt-5">
            <HabitatEditor
              park={park}
              habitatId={item.id}
              color={String(draft.color ?? '') || null}
              geometry={(item.geometry as PolygonGeometry | null) ?? null}
              parkCenter={parkCenter}
            />
          </div>
        )
      )}

      {/* Relación especie ↔ hábitats: casillas con todos los hábitats del parque */}
      {resource === 'species' && (
        <fieldset className="mt-5 rounded-xl border border-stone-200 bg-white p-4">
          <legend className="px-1 text-sm font-bold text-stone-800">Hábitats donde vive</legend>
          {habitats.length === 0 ? (
            <p className="text-sm text-stone-500">Este parque aún no tiene hábitats.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {habitats.map(h => (
                <label key={h.id} className="flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={habitatSel.has(h.id)}
                    onChange={e =>
                      setHabitatSel(prev => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(h.id);
                        else next.delete(h.id);
                        return next;
                      })
                    }
                    className="h-4 w-4 accent-emerald-700"
                  />
                  {String(h.name ?? '')}
                </label>
              ))}
            </div>
          )}
        </fieldset>
      )}

      <div className="sticky bottom-0 mt-5 flex gap-3 border-t border-stone-200 bg-stone-100/95 py-3 backdrop-blur">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
        >
          {save.isPending ? 'Guardando…' : 'Guardar'}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={confirmDelete}
            disabled={remove.isPending}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {remove.isPending ? 'Eliminando…' : 'Eliminar'}
          </button>
        )}
      </div>
    </form>
  );
}
