# PRD: Illinois Legislator Map

**Feature:** Interactive Leaflet.js map of Revenue Committee legislators  
**Site:** sb3019.vercel.app — `campaign/il-data-repeal/site/`  
**Effort:** < 1 day (single engineer, frontend only)  
**Status:** Draft — 2026-07-06

---

## Problem Statement

Visitors to the "People to Sway" section see 20 legislator cards but have no spatial sense of where these representatives sit geographically. A constituent in Waukegan does not immediately know that Rita Mayfield (District 60) is their closest target. The map closes this gap and makes the call-to-action personal.

---

## User Stories

1. **As a constituent**, I want to see all 20 Revenue Committee members pinned on an Illinois map so that I can quickly identify which legislators represent my area and prioritize who to contact.

2. **As a campaign visitor on mobile**, I want to tap a photo-pin to see a legislator's name, party, and swayability without the map hijacking my page scroll so that I can browse naturally and act when ready.

3. **As a site editor**, I want map coordinates stored statically in `legislators.json` so that adding or updating a legislator requires only a data change, not a code change.

---

## Functional Requirements

1. **Map render** — A Leaflet.js map initializes above the filter buttons inside the existing "People to Sway" section. Default view centers on Illinois (lat 40.0, lng -89.2, zoom 6).

2. **Photo-pin markers** — Each legislator renders as a circular cropped photo marker (32px diameter). Marker border color encodes party: `#3B82F6` Democrat, `#EF4444` Republican. If the photo fails to load, fall back to the legislator's initials on a `#1E293B` background.

3. **Swayability ring** — The marker border width and opacity visually encodes swayability: `high` = 3px solid, `medium` = 2px solid 80% opacity, `low` = 2px solid 50% opacity, `ally` = 3px solid gold (`#FFD700`).

4. **Popup on click** — Clicking a marker opens a Leaflet popup containing: legislator name, party badge, district number, swayability label, and a "View Card" link that scrolls to and highlights the corresponding legislator card below.

5. **Filter sync** — When the user activates a party or swayability filter, markers for hidden legislators dim to 20% opacity rather than disappear, preserving spatial context.

6. **Static coordinates** — A one-time geocoding script (`scripts/geocode-legislators.js`) hits Nominatim/OSM using each legislator's `contact.address` field and writes `lat`/`lng` into `dist/legislators.json`. The map reads these fields; no runtime geocoding occurs.

7. **Tile layer** — CartoDB DarkMatter tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`, attribution required). No API key needed.

8. **Scroll-wheel zoom guard** — `scrollWheelZoom` is disabled on mobile viewports (pointer: coarse) and re-enabled on desktop. Users can pinch-zoom on mobile.

---

## Non-Functional Requirements

**Performance**
- Map initializes in under 1 second on a cold load (no geocoding at runtime; tiles lazy-load).
- Leaflet JS + CSS loaded via CDN; adds no npm dependency to the project.
- Total added page weight under 120 KB (Leaflet ~42 KB gzip + 20 marker images already cached from legislator cards).

**Accessibility**
- Map container has `role="region"` and `aria-label="Illinois legislative district map"`.
- Each marker includes `title` attribute with legislator name for keyboard/screen-reader discovery.
- A visually hidden skip link above the map ("Skip map, go to legislator list") lets keyboard users bypass the Leaflet tab stop.
- Color is not the only encoding for party — the popup and marker title always include the text label.

**Responsiveness**
- Map height: 300px on viewports < 768px, 400px on >= 768px.
- Map is full-width within the section container.

**Reliability**
- If Leaflet CDN fails to load, the map container shows a styled fallback message ("Map unavailable — use filters below") and the rest of the page is unaffected.

---

## Acceptance Criteria

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-1 | Map renders above the Party / Swayability filter buttons on page load | Visual inspection; DOM order check in DevTools |
| AC-2 | All 20 legislators have a visible photo-pin marker | Count markers in Leaflet's layer group |
| AC-3 | Democrat markers have a blue border; Republican markers have a red border | Visual inspection |
| AC-4 | Clicking any marker opens a popup with name, district, swayability, and "View Card" link | Click each marker; confirm popup content |
| AC-5 | "View Card" link scrolls to and highlights the correct card | Click link; confirm scroll position and highlight animation |
| AC-6 | Activating the "Democrat" party filter dims Republican markers rather than removing them | Toggle party filter; confirm GOP markers still visible at reduced opacity |
| AC-7 | Scroll-wheel zoom does not scroll the page on a mobile-sized viewport | Chrome DevTools device emulation; scroll over map |
| AC-8 | Page functions normally when Leaflet CDN is blocked | Network block in DevTools; confirm fallback message and no JS errors |
| AC-9 | Map height is 300px at 375px viewport width and 400px at 1024px | DevTools responsive mode; measure `.legislator-map` element |
| AC-10 | Lighthouse accessibility score does not regress from baseline | Run Lighthouse before and after; compare |

---

## Implementation Notes

- Mount point: add `<div id="legislator-map" class="legislator-map"></div>` to `buildRevenueSectionHTML()` in `lib/shared-sections.js` immediately before the `.filters` div.
- Map init logic lives in a new `lib/legislator-map.js` module, imported by `pages/revenue.js`.
- Geocoding script is a one-time Node.js CLI (`scripts/geocode-legislators.js`), not part of the build.
- `lat`/`lng` fields added to `dist/legislators.json` are the only schema change.
- Leaflet CDN tags added to `index.html` `<head>` (CSS) and before `</body>` (JS), matching the existing CDN pattern used for other libs.

---

## Out of Scope

- Choropleth district boundaries (adds significant tile/GeoJSON complexity).
- User geolocation ("find my rep") — deferred; requires navigator.geolocation and matching zip-to-district logic.
- Animated marker clustering — 20 points do not require clustering.
- Server-side geocoding or a proxy — Nominatim one-time script is sufficient for a static dataset.
