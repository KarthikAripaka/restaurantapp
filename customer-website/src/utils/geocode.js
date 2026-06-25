// Free geocoding via OpenStreetMap's Nominatim service — no API key, no billing.
// Usage policy: max ~1 request/second, identify your app. See:
// https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Turn a lat/lng into a human-readable address string.
 * Returns '' on failure so callers can fall back gracefully.
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return '';
    const data = await res.json();
    return data?.display_name || '';
  } catch {
    return '';
  }
};

/**
 * Forward search — turn a typed address into candidate lat/lng results.
 * Useful for a "search for your area" box inside the map picker.
 */
export const searchAddress = async (query) => {
  if (!query || query.trim().length < 3) return [];
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d) => ({
      label: d.display_name,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }));
  } catch {
    return [];
  }
};
