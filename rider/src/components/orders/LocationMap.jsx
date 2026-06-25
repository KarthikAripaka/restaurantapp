import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, useMap } from 'react-leaflet';
import '../../utils/leafletIcons';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, ChevronUp, ChevronDown } from 'lucide-react';

// Keeps the map framed around both the rider's live position and the destination pin.
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) {
      map.setView(points[0], 16);
      return;
    }
    map.fitBounds(points, { padding: [32, 32] });
  }, [JSON.stringify(points)]);
  return null;
};

const LocationMap = ({ destination }) => {
  const [expanded, setExpanded] = useState(false);
  const [myPosition, setMyPosition] = useState(null);
  const watchIdRef = useRef(null);

  // Only track the rider's live GPS position while the map is open — saves battery.
  useEffect(() => {
    if (!expanded || !navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setMyPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [expanded]);

  const points = myPosition ? [myPosition, destination] : [destination];

  return (
    <div className="rounded-lg overflow-hidden border border-ink-900/[0.1]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-cream-100 hover:bg-cream-200 px-3 py-2.5 text-xs font-semibold text-ink-700 transition-colors"
      >
        <span className="flex items-center gap-1.5"><MapIcon size={13} /> {expanded ? 'Hide map' : 'Show map · follow address'}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div style={{ height: '220px' }}>
          <MapContainer
            center={destination}
            zoom={15}
            style={{ height: '100%', width: '100%', background: '#f5f3f0' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={destination} />
            {myPosition && (
              <>
                <CircleMarker
                  center={myPosition}
                  radius={8}
                  pathOptions={{ color: '#f7780e', fillColor: '#f7780e', fillOpacity: 0.9, weight: 2 }}
                />
                <Polyline positions={[myPosition, destination]} pathOptions={{ color: '#f7780e', weight: 3, dashArray: '6 8' }} />
              </>
            )}
            <FitBounds points={points} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
