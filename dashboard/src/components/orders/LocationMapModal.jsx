import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../../utils/leafletIcons';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, ExternalLink } from 'lucide-react';

const LocationMapModal = ({ order, onClose }) => {
  const { lat, lng } = order.customer.location || {};
  if (lat == null || lng == null) return null;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-ink-900/[0.08] rounded-2xl w-full max-w-lg overflow-hidden shadow-soft-lg">
        <div className="flex items-center justify-between p-4 border-b border-ink-900/[0.06]">
          <h2 className="font-bold text-ink-900 flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-brand-600" /> {order.orderId} — Delivery Location
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-cream-100 rounded-lg transition-colors">
            <X size={18} className="text-ink-500" />
          </button>
        </div>

        <div style={{ height: '340px' }}>
          <MapContainer
            center={[lat, lng]}
            zoom={16}
            style={{ height: '100%', width: '100%', background: '#f5f3f0' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>
                <strong>{order.customer.name}</strong>
                <br />
                {order.customer.address}
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-400 truncate">{order.customer.address}</p>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm flex-shrink-0"
          >
            <ExternalLink size={14} /> Open in Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default LocationMapModal;
