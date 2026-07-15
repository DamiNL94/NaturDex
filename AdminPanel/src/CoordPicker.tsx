// ================================================================================================
// CoordPicker.tsx — mini-mapa para fijar latitud/longitud con un clic (Leaflet).
// ------------------------------------------------------------------------------------------------
// Mismas capas base que la app pública (OSM y ortofoto PNOA del IGN, útil para afinar la posición
// sobre el terreno real). El mapa es un espejo del borrador del formulario: al hacer clic se
// rellenan los campos de latitud/longitud, y al teclearlos a mano el marcador se mueve solo.
// ================================================================================================
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  /** Valores actuales del borrador (cadenas del formulario; pueden estar vacías o a medias). */
  lat: string;
  lng: string;
  /** Centro del parque (parks.latitude/longitude) para encuadrar cuando no hay coordenadas. */
  center: [number, number] | null;
  onPick: (lat: string, lng: string) => void;
}

function parseCoords(lat: string, lng: string): [number, number] | null {
  const la = Number(lat), ln = Number(lng);
  if (lat.trim() === '' || lng.trim() === '' || !Number.isFinite(la) || !Number.isFinite(ln)) return null;
  if (la < -90 || la > 90 || ln < -180 || ln > 180) return null;
  return [la, ln];
}

export default function CoordPicker({ lat, lng, center, onPick }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  // El handler vive en un ref para que el listener de Leaflet (registrado una sola vez) no se
  // quede con una versión antigua del estado del formulario.
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
    });
    const pnoa = L.tileLayer(
      'https://www.ign.es/wmts/pnoa-ma?layer=OI.OrthoimageCoverage&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
      { attribution: '&copy; Instituto Geográfico Nacional de España (PNOA)', maxZoom: 19 }
    );

    const initial = parseCoords(lat, lng) ?? center ?? [40.0, -3.7]; // sin parque: España
    const map = L.map(divRef.current, { layers: [osm] })
      .setView(initial, parseCoords(lat, lng) ? 15 : center ? 13 : 5);
    L.control.layers({ 'Mapa (OSM)': osm, 'Ortofoto (PNOA)': pnoa }).addTo(map);

    map.on('click', event => {
      onPickRef.current(event.latlng.lat.toFixed(6), event.latlng.lng.toFixed(6));
    });

    mapRef.current = map;
    // Instancia accesible desde el contenedor (pruebas e2e / depuración desde la consola).
    (divRef.current as HTMLDivElement & { leafletMap?: L.Map }).leafletMap = map;
    // El contenedor acaba de entrar en el grid: recalcular el tamaño cuando el layout se asiente.
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Solo al montar: lat/lng/center iniciales quedan capturados a propósito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza el marcador con el borrador (clic en el mapa o edición manual de los campos).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pos = parseCoords(lat, lng);
    if (!pos) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = L.circleMarker(pos, {
        radius: 8, color: '#047857', weight: 3, fillColor: '#34d399', fillOpacity: 0.9
      }).addTo(map);
    } else {
      markerRef.current.setLatLng(pos);
    }
    if (!map.getBounds().contains(pos)) map.panTo(pos);
  }, [lat, lng]);

  return (
    <div className="sm:col-span-2">
      <p className="text-sm font-semibold text-stone-700">Posición en el mapa</p>
      <div ref={divRef} className="mt-1 h-72 w-full rounded-xl border border-stone-300" />
      <p className="mt-0.5 text-xs text-stone-500">
        Haz clic en el mapa para fijar la latitud y la longitud (o escríbelas a mano y el marcador se moverá).
      </p>
    </div>
  );
}
