# QA: Legislator Map

**Date:** 2026-07-06
**Scope:** `campaign/il-data-repeal/site/lib/legislator-map.js`
**Entry:** /
**Todo:** docs/todo/legislator-map.md

## Map Rendering
- [ ] Map container appears above the legislator filter buttons in "People to Sway" section
- [ ] Map displays CartoDB DarkMatter tiles (dark theme, not default bright OSM)
- [ ] Map is centered on Illinois with all 20 pins visible at default zoom
- [ ] Map container is 380px tall on desktop

## Legislator Pins
- [ ] All 20 Revenue Committee legislators appear as pins on the map
- [ ] Each pin shows a circular photo of the legislator
- [ ] Democrat pins have a blue (#3B82F6) border ring
- [ ] Republican pins have a red (#EF4444) border ring
- [ ] Pins without photos show an avatar fallback

## Pin Interaction
- [ ] Clicking a pin opens a popup with the legislator's full card
- [ ] Popup card shows name, party badge, district, swayability, and leverage text
- [ ] Popup card includes expandable contact info with phone numbers and address
- [ ] Clicking outside the popup closes it

## Responsive Behavior
- [ ] Map is 300px tall on mobile (< 768px width)
- [ ] Scroll-wheel zoom is disabled on mobile to prevent page scroll hijack <!-- qa:human mobile-gesture -->
- [ ] Map supports pinch-to-zoom on touch devices <!-- qa:human mobile-gesture -->

## Graceful Degradation
- [ ] If Leaflet CDN fails to load, the legislator grid still renders normally
- [ ] Legislators without coordinates are skipped (no JavaScript errors)

## Regression Risks
- **Medium:** Leaflet CSS could conflict with existing popup/modal styles
- **Low:** CDN script in `<head>` could slow initial page load if CDN is slow
- **Low:** Adding `lat`/`lng` to legislators.json could break other consumers if schema is validated
