# TODO: Illinois Legislator Map

**Status**: review
**Priority**: high
**Created**: 2026-07-06

## Summary
Add an interactive Leaflet.js map to the campaign site showing all 20 Revenue Committee legislators as pins on a statewide Illinois map. Each pin shows the legislator's photo with a party-color border. Clicking a pin opens their full card with contact info.

## Requirements
- Leaflet.js via CDN with CartoDB DarkMatter tiles (dark theme)
- Custom divIcon markers: circular photo + party-color ring (blue D / red R)
- Click pin → popup with existing `buildLegislatorCardHTML()` card
- Placed above filter buttons in "People to Sway" section
- One-time geocode of 20 district office addresses → lat/lng in legislators.json
- Responsive: 400px desktop, 300px mobile
- Disable scroll-wheel zoom on mobile

## Files
- `site/index.html` — add Leaflet CDN links
- `site/lib/shared-sections.js` — map container + `initLegislatorMap()`
- `site/style.css` — map pin + popup dark-theme styles
- `site/dist/legislators.json` — add lat/lng coordinates

## Stage
- [x] planning
- [x] documentation
- [x] architecture
- [x] implementation
- [x] review
