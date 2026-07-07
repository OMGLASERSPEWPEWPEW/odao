/* ============================================================
   Legislator Map — Leaflet.js interactive map with photo pins
   for all 20 Revenue Committee legislators.
   ============================================================ */

import { buildLegislatorCardHTML } from './shared-sections.js';

/**
 * Initialize the Leaflet map showing legislator photo-pin markers.
 * @param {HTMLElement} wrapper - The shared-sections wrapper element
 * @param {Array} legislators - Array of legislator objects with lat/lng
 */
export function initLegislatorMap(wrapper, legislators) {
  const mapEl = wrapper.querySelector('#legislatorsMap');
  if (!mapEl || typeof L === 'undefined') {
    if (mapEl) mapEl.style.display = 'none';
    return;
  }

  // Create map centered on Illinois
  const map = L.map(mapEl, {
    center: [40.0, -89.5],
    zoom: 6,
    scrollWheelZoom: false,
  });

  // CartoDB DarkMatter tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  // Add markers for each legislator with coordinates
  legislators.forEach(leg => {
    if (leg.lat == null || leg.lng == null) return;

    const photoSlug = leg.name.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '-');
    const partyColor = leg.party === 'D' ? '#3B82F6' : '#EF4444';
    const lastName = leg.name.split(' ').pop();

    // Custom div icon with photo ring and name label
    const icon = L.divIcon({
      className: 'legislator-map-pin',
      html: `
        <div class="map-pin-ring" style="border-color: ${partyColor};">
          <img src="/photos/legislators/${photoSlug}.jpg"
               alt="${leg.name}"
               onerror="this.style.display='none'" />
        </div>
        <div class="map-pin-name">${lastName}</div>
      `,
      iconSize: [50, 60],
      iconAnchor: [25, 30],
      popupAnchor: [0, -20],
    });

    const marker = L.marker([leg.lat, leg.lng], { icon }).addTo(map);

    // Bind popup with the full legislator card
    const popupContent = buildLegislatorCardHTML(leg, { expanded: true });
    marker.bindPopup(popupContent, {
      className: 'legislator-map-popup',
      maxWidth: 360,
      minWidth: 280,
    });
  });
}
