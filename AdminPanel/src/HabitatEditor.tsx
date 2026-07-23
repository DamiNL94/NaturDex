// ================================================================================================
// HabitatEditor.tsx — dibuja y edita el ÁREA (polígono) de un hábitat sobre el mapa (Leaflet + Geoman).
// ------------------------------------------------------------------------------------------------
// La BD es la fuente de verdad de la geometría (columna habitats.geometry). El mapa muestra SOLO el
// polígono del hábitat en tratamiento (sin los demás, para no distraer): dibujar si no tiene, mover
// vértices, cortar, borrar. Soporta MultiPolygon (varias piezas).
//
// Todos los cambios son LOCALES hasta pulsar «Guardar área» (que hace POST save_geometry, invalida la
// caché de TanStack Query y avisa con un toast). Además hay «Deshacer», que revierte paso a paso los
// cambios de la sesión (incluido «Borrar área»), para evitar perder un polígono por error. La ortofoto
// PNOA del IGN es clave para calcar la línea de costa. Sin polígono, la app pública dibuja un círculo.
// ================================================================================================
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { api, type PolygonGeometry } from './api';
import { useToast } from './toast';

interface Props {
  park: string;
  habitatId: number;
  /** Color del hábitat en el mapa (para el trazo editable). */
  color: string | null;
  /** Geometría inicial del hábitat (o null si aún no tiene polígono). */
  geometry: PolygonGeometry | null;
  /** Centro del parque para encuadrar cuando no hay ningún polígono. */
  parkCenter: [number, number] | null;
}

const DEFAULT_COLOR = '#2f6f4e';

// Convierte una geometría GeoJSON a una lista de polígonos (cada uno = array de anillos), de modo
// que un MultiPolygon se edita como varias piezas independientes.
function geometryToPolygons(geom: PolygonGeometry | null): number[][][][] {
  if (!geom) return [];
  if (geom.type === 'Polygon') return [geom.coordinates as number[][][]];
  if (geom.type === 'MultiPolygon') return geom.coordinates as number[][][][];
  return [];
}

export default function HabitatEditor({ park, habitatId, color, geometry, parkCenter }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  // Grupo con las piezas editables del hábitat: de aquí se recolecta la geometría al guardar.
  const editGroupRef = useRef<L.FeatureGroup | null>(null);

  // --- Historial para «Deshacer» ----------------------------------------------------------------
  // pastRef: estados anteriores (se apila el estado previo antes de cada cambio). lastGeomRef: estado
  // vigente en el mapa. restoringRef: silencia el registro mientras reconstruimos capas al deshacer.
  const pastRef = useRef<(PolygonGeometry | null)[]>([]);
  const lastGeomRef = useRef<PolygonGeometry | null>(geometry);
  const restoringRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);

  const editColor = color || DEFAULT_COLOR;
  const editStyle: L.PathOptions = { color: editColor, weight: 2, fillColor: editColor, fillOpacity: 0.2 };

  // Recolecta la geometría dibujada: null si no hay piezas, Polygon si hay una, MultiPolygon si varias.
  function collectGeometry(): PolygonGeometry | null {
    const group = editGroupRef.current;
    if (!group) return null;
    const polygons: number[][][][] = [];
    group.eachLayer(layer => {
      const gj = (layer as L.Polygon).toGeoJSON() as GeoJSON.Feature;
      const g = gj.geometry;
      if (!g) return;
      if (g.type === 'Polygon') polygons.push(g.coordinates as number[][][]);
      else if (g.type === 'MultiPolygon') (g.coordinates as number[][][][]).forEach(p => polygons.push(p));
    });
    if (polygons.length === 0) return null;
    if (polygons.length === 1) return { type: 'Polygon', coordinates: polygons[0] };
    return { type: 'MultiPolygon', coordinates: polygons };
  }

  // Anota un cambio en el historial si la geometría cambió de verdad (deduplica eventos repetidos).
  function recordChange() {
    if (restoringRef.current) return;
    const now = collectGeometry();
    if (JSON.stringify(now) === JSON.stringify(lastGeomRef.current)) return;
    pastRef.current.push(lastGeomRef.current);
    if (pastRef.current.length > 50) pastRef.current.shift();
    lastGeomRef.current = now;
    setCanUndo(true);
  }

  // Escucha los eventos de edición de una pieza (mover/añadir/quitar vértice, arrastrar, cortar).
  function bindLayerEvents(layer: L.Layer) {
    layer.on('pm:edit pm:dragend pm:markerdragend pm:vertexadded pm:vertexremoved pm:cut', recordChange);
  }

  const feature = (rings: number[][][]): GeoJSON.Feature => ({
    type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: rings }
  });

  // Reconstruye las piezas editables a partir de una geometría (usado al deshacer). Sale de los modos
  // globales de edición para que el cambio de capas no deje el mapa en un estado inconsistente.
  function setEditableGeometry(geom: PolygonGeometry | null) {
    const group = editGroupRef.current, map = mapRef.current;
    if (!group || !map) return;
    if (map.pm.globalEditModeEnabled()) map.pm.disableGlobalEditMode();
    if (map.pm.globalDragModeEnabled()) map.pm.disableGlobalDragMode();
    if (map.pm.globalRemovalModeEnabled()) map.pm.disableGlobalRemovalMode();
    group.clearLayers();
    for (const rings of geometryToPolygons(geom)) {
      L.geoJSON(feature(rings), { style: editStyle }).eachLayer(layer => {
        group.addLayer(layer);
        bindLayerEvents(layer);
      });
    }
  }

  function undo() {
    if (pastRef.current.length === 0) return;
    const prev = pastRef.current.pop() ?? null;
    restoringRef.current = true;
    setEditableGeometry(prev);
    lastGeomRef.current = prev;
    restoringRef.current = false;
    setCanUndo(pastRef.current.length > 0);
  }

  // «Borrar área»: vacía el polígono en el mapa (local, reversible con «Deshacer»); no persiste hasta
  // pulsar «Guardar área». Así un borrado accidental no se pierde.
  function clearArea() {
    if (!collectGeometry()) return; // ya está vacío
    pastRef.current.push(lastGeomRef.current);
    if (pastRef.current.length > 50) pastRef.current.shift();
    restoringRef.current = true;
    editGroupRef.current?.clearLayers();
    restoringRef.current = false;
    lastGeomRef.current = null;
    setCanUndo(true);
  }

  const save = useMutation({
    mutationFn: (geom: PolygonGeometry | null) =>
      api<{ ok: boolean; id: number }>('/admin.php?action=save_geometry&resource=habitats', {
        park,
        id: habitatId,
        geometry: geom
      }),
    onSuccess: () => {
      // Refresca la lista del parque: la geometría cambió (y con ella el área que pinta la app).
      queryClient.invalidateQueries({ queryKey: ['list', park] });
      toast('Área guardada ✓');
    },
    onError: e => toast(e instanceof Error ? e.message : 'No se pudo guardar el área.', true)
  });

  // Montaje del mapa (una sola vez): capas base, piezas editables y controles.
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
    });
    const pnoa = L.tileLayer(
      'https://www.ign.es/wmts/pnoa-ma?layer=OI.OrthoimageCoverage&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
      { attribution: '&copy; Instituto Geográfico Nacional de España (PNOA)', maxZoom: 19 }
    );

    const map = L.map(divRef.current, { layers: [pnoa] }); // ortofoto por defecto: se calca la costa
    L.control.layers({ 'Ortofoto (PNOA)': pnoa, 'Mapa (OSM)': osm }).addTo(map);

    // Solo el hábitat en tratamiento: un MultiPolygon se parte en varias piezas editables.
    const editGroup = L.featureGroup().addTo(map);
    editGroupRef.current = editGroup;
    for (const rings of geometryToPolygons(geometry)) {
      L.geoJSON(feature(rings), { style: editStyle }).eachLayer(layer => {
        editGroup.addLayer(layer);
        bindLayerEvents(layer);
      });
    }

    // Controles de Geoman (en español), solo polígonos. El trazo nuevo usa el color del hábitat.
    map.pm.setLang('es');
    map.pm.setGlobalOptions({ pathOptions: editStyle, allowSelfIntersection: false });
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false, drawCircle: false, drawCircleMarker: false, drawPolyline: false,
      drawText: false, drawRectangle: false, rotateMode: false,
      drawPolygon: true, editMode: true, dragMode: true, cutPolygon: true, removalMode: true
    });

    // Cada polígono nuevo se incorpora al grupo editable (con el estilo del hábitat) y al historial.
    map.on('pm:create', (e: { layer: L.Layer }) => {
      const layer = e.layer as L.Polygon;
      if (layer.setStyle) layer.setStyle(editStyle);
      editGroup.addLayer(layer);
      bindLayerEvents(layer);
      recordChange();
    });
    // Al borrar una pieza con la herramienta de eliminación, sale del grupo y se anota en el historial.
    map.on('pm:remove', (e: { layer: L.Layer }) => {
      editGroup.removeLayer(e.layer);
      recordChange();
    });
    // El corte reemplaza la pieza original por el resultado: se reparenta al grupo editable.
    map.on('pm:cut', (e: { layer: L.Layer; originalLayer?: L.Layer }) => {
      if (e.originalLayer) editGroup.removeLayer(e.originalLayer);
      if (e.layer) {
        const layer = e.layer as L.Polygon;
        if (layer.setStyle) layer.setStyle(editStyle);
        editGroup.addLayer(layer);
        bindLayerEvents(layer);
      }
      recordChange();
    });

    // Encuadre: al polígono del hábitat si lo tiene; si no, al parque; si no, a España.
    const editBounds = editGroup.getBounds();
    if (editBounds.isValid()) map.fitBounds(editBounds, { padding: [30, 30] });
    else if (parkCenter) map.setView(parkCenter, 13);
    else map.setView([40.0, -3.7], 5);

    mapRef.current = map;
    (divRef.current as HTMLDivElement & { leafletMap?: L.Map }).leafletMap = map;
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      editGroupRef.current = null;
    };
    // Solo al montar: props iniciales capturadas a propósito (el componente se remonta al cambiar de hábitat).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sm:col-span-2">
      <p className="text-sm font-semibold text-stone-700">Área del hábitat en el mapa</p>
      <div ref={divRef} className="mt-1 h-[28rem] w-full rounded-xl border border-stone-300" />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => save.mutate(collectGeometry())}
          disabled={save.isPending}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
        >
          {save.isPending ? 'Guardando…' : 'Guardar área'}
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo || save.isPending}
          title="Revierte el último cambio en el mapa (dibujar, editar o borrar)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
        >
          ↶ Deshacer
        </button>
        <button
          type="button"
          onClick={clearArea}
          disabled={save.isPending}
          title="Vacía el polígono en el mapa; no se guarda hasta pulsar «Guardar área» (reversible con «Deshacer»)"
          className="rounded-lg border border-red-300 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
          Borrar área
        </button>
        <span className="text-xs text-stone-500">
          Dibuja con la herramienta de polígono (arriba a la izquierda), edita los vértices y pulsa «Guardar
          área» (independiente del «Guardar» de la ficha). Los cambios no se guardan hasta entonces; «Deshacer»
          revierte paso a paso. La ortofoto ayuda a calcar la línea de costa.
        </span>
      </div>
    </div>
  );
}
