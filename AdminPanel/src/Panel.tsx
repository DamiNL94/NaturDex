// ================================================================================================
// Panel.tsx — armazón del panel: cabecera (parque, publicar, sesión), pestañas y zona de trabajo.
// ------------------------------------------------------------------------------------------------
// Las tres listas del parque activo se cargan con TanStack Query (clave ['list', parque, recurso]);
// los hábitats se necesitan siempre porque el formulario de especies pinta sus casillas de
// relación. Guardar/eliminar invalida las listas del parque y el overview (contadores).
// ================================================================================================
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, type ExportResult, type Item, type Overview, type Resource } from './api';
import { RESOURCE_LABELS } from './fields';
import { useToast } from './toast';
import ItemList from './ItemList';
import ItemForm from './ItemForm';

const RESOURCES: Resource[] = ['species', 'habitats', 'pois'];

function useList(resource: Resource, park: string | null) {
  return useQuery({
    queryKey: ['list', park, resource],
    enabled: park !== null,
    queryFn: () =>
      api<{ items: Item[] }>(`/admin.php?action=list&resource=${resource}&park=${encodeURIComponent(park!)}`)
        // El id llega como número o cadena según la versión del driver MySQL: se normaliza a número.
        .then(data => data.items.map(i => ({ ...i, id: Number(i.id) })))
  });
}

export default function Panel({ overview }: { overview: Overview }) {
  const toast = useToast();

  const [park, setPark] = useState<string | null>(overview.parks[0]?.slug ?? null);
  const [tab, setTab] = useState<Resource>('species');
  const [selected, setSelected] = useState<number | 'new' | null>(null);
  const [query, setQuery] = useState('');

  const lists: Record<Resource, ReturnType<typeof useList>> = {
    species: useList('species', park),
    habitats: useList('habitats', park),
    pois: useList('pois', park)
  };

  const parkInfo = overview.parks.find(p => p.slug === park) ?? null;
  const items = lists[tab].data ?? [];
  const item = selected === 'new' ? ({ id: 0 } as Item) : (items.find(i => i.id === selected) ?? null);

  const exportPark = useMutation({
    mutationFn: () => api<ExportResult>('/admin.php?action=export', { park }),
    onSuccess: res =>
      toast(`Publicado: ${res.counts.habitats} hábitats, ${res.counts.species} especies, ${res.counts.pointsOfInterest} POIs → ${res.dataPath}`),
    onError: e => toast(e instanceof Error ? e.message : 'No se pudo publicar.', true)
  });

  async function logout() {
    try {
      await api('/auth.php?action=logout', {});
    } catch {
      // Da igual: recargamos y la sesión se revalida contra el servidor.
    }
    location.reload();
  }

  function switchTab(next: Resource) {
    setTab(next);
    setSelected(null);
    setQuery('');
  }

  function switchPark(slug: string) {
    setPark(slug);
    setSelected(null);
    setQuery('');
  }

  return (
    <div className="flex h-screen flex-col bg-stone-100">
      {/* ------------------------------- Cabecera ------------------------------- */}
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-stone-200 bg-white px-5 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-widest text-emerald-700 uppercase">NaturDex · Administración</p>
          <h1 className="truncate text-lg font-extrabold text-stone-900">{parkInfo?.name ?? '—'}</h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {overview.parks.length > 1 && (
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-600">
              Parque
              <select
                value={park ?? ''}
                onChange={e => switchPark(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm font-normal"
              >
                {overview.parks.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={() => exportPark.mutate()}
            disabled={exportPark.isPending || !park}
            title="Vuelca la base de datos al park.json que usa la app sin conexión"
            className="rounded-lg border border-emerald-700 px-3 py-1.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-50"
          >
            {exportPark.isPending ? 'Publicando…' : 'Publicar cambios offline'}
          </button>
          <span className="text-sm text-stone-500">{overview.user.name || overview.user.email}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-2 py-1.5 text-sm font-semibold text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ------------------------------- Pestañas ------------------------------- */}
      <nav role="tablist" className="flex gap-1 border-b border-stone-200 bg-white px-5">
        {RESOURCES.map(r => {
          const count = lists[r].data?.length ?? (parkInfo ? parkInfo[r === 'pois' ? 'pois' : r] : 0);
          const active = r === tab;
          return (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchTab(r)}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-bold transition ${
                active
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {RESOURCE_LABELS[r]}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ---------------------------- Zona de trabajo ---------------------------- */}
      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[340px_1fr]">
        <ItemList
          resource={tab}
          items={items}
          loading={lists[tab].isPending}
          selectedId={selected}
          query={query}
          onQuery={setQuery}
          onSelect={id => setSelected(id)}
          onNew={() => setSelected('new')}
        />
        <section className="min-h-0 overflow-y-auto p-5 scroll-slim">
          {item && park ? (
            <ItemForm
              key={`${park}/${tab}/${item.id || 'new'}`}
              resource={tab}
              park={park}
              item={item}
              habitats={lists.habitats.data ?? []}
              parkCenter={
                parkInfo && parkInfo.latitude !== null && parkInfo.longitude !== null
                  ? [parkInfo.latitude, parkInfo.longitude]
                  : null
              }
              onSaved={id => setSelected(id)}
              onDeleted={() => setSelected(null)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-stone-500">Elige un elemento de la lista o crea uno nuevo.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
