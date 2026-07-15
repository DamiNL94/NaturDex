// ================================================================================================
// ItemList.tsx — panel lateral: buscador, botón de alta y lista de elementos del recurso activo.
// La búsqueda filtra sobre todos los campos (igual que el panel clásico).
// ================================================================================================
import type { Item, Resource } from './api';
import { itemTitle } from './fields';

const KINGDOM_BADGE: Record<string, string> = {
  fauna: 'bg-sky-100 text-sky-800',
  flora: 'bg-emerald-100 text-emerald-800',
  fungi: 'bg-amber-100 text-amber-800',
  other: 'bg-stone-200 text-stone-600'
};

interface Props {
  resource: Resource;
  items: Item[];
  loading: boolean;
  selectedId: number | 'new' | null;
  query: string;
  onQuery: (q: string) => void;
  onSelect: (id: number) => void;
  onNew: () => void;
}

function badge(resource: Resource, item: Item) {
  if (resource === 'species') {
    const kingdom = String(item.kingdom ?? 'other');
    return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${KINGDOM_BADGE[kingdom] ?? KINGDOM_BADGE.other}`}>{kingdom}</span>;
  }
  const label = resource === 'habitats' ? item.code : item.type;
  return <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-bold text-stone-600">{String(label ?? '') || '—'}</span>;
}

export default function ItemList({ resource, items, loading, selectedId, query, onQuery, onSelect, onNew }: Props) {
  const q = query.toLocaleLowerCase('es-ES');
  const visible = q ? items.filter(item => JSON.stringify(item).toLocaleLowerCase('es-ES').includes(q)) : items;

  return (
    <aside className="flex min-h-0 flex-col border-r border-stone-200 bg-white">
      <div className="flex gap-2 border-b border-stone-200 p-3">
        <input
          type="search"
          placeholder="Buscar…"
          value={query}
          onChange={e => onQuery(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
        <button
          type="button"
          onClick={onNew}
          className="shrink-0 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          + Nuevo
        </button>
      </div>
      <div role="listbox" aria-label="Elementos" className="min-h-0 flex-1 overflow-y-auto scroll-slim">
        {loading ? (
          <p className="p-4 text-sm text-stone-500">Cargando…</p>
        ) : visible.length === 0 ? (
          <p className="p-4 text-sm text-stone-500">Sin resultados.</p>
        ) : (
          visible.map(item => {
            const active = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-center justify-between gap-2 border-b border-stone-100 px-3 py-2.5 text-left transition ${
                  active ? 'bg-emerald-50' : 'hover:bg-stone-50'
                }`}
              >
                <span className="min-w-0">
                  <span className={`block truncate text-sm font-semibold ${active ? 'text-emerald-900' : 'text-stone-800'}`}>
                    {itemTitle(resource, item)}
                  </span>
                  {resource === 'species' && (
                    <span className="block truncate text-xs text-stone-500 italic">{String(item.scientific_name ?? '')}</span>
                  )}
                </span>
                {badge(resource, item)}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
