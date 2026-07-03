# Campaign Dashboard v1 — Manifest

**Created:** 2026-07-03
**Archived:** 2026-07-03 (before v2 work began)

## Capabilities
- Countdown timer to January 1, 2027 (tax effective date)
- Three-prong action plan (Lobby / Grassroots / Federal-Legal) with status indicators
- Campaign calendar: 10 milestone events, clickable with action item modals
- 20 legislator cards with verified ilga.gov contact info, district office addresses, swayability ratings
- Party (D/R) and swayability (high/medium/low/ally) filters
- "Act Now" section: 5 action cards with call scripts and copy-to-clipboard
- Vote math visualization: 60-vote threshold, 40R locked, 20D targets needed
- Dark theme (#0F172A), responsive, vanilla JS + Vite dev server

## Files
| File | Lines | Size | Purpose |
|------|-------|------|---------|
| index.html | 400 | 16.7KB | Page structure, all sections |
| app.js | 345 | 11.9KB | Countdown, timeline, legislators, filters, modals, clipboard |
| style.css | 1197 | 21.8KB | Full design system, responsive breakpoints |
| data/legislators.json | 314 | — | 20 Revenue Committee members with addresses |
| data/events.json | — | — | 10 campaign timeline milestones |

## Design Tokens
- Gold: #FFD700 (lobby), Green: #22C55E (grassroots), Blue: #3B82F6 (federal), Red: #EF4444 (urgent)
- Background: #0F172A, Cards: #1E293B, Text: #F1F5F9
- Nav height: 60px, Section padding: 80px

## How to Rollback
Copy all files from this directory back to `../site/`:
```bash
cp .versions/v1/index.html .versions/v1/app.js .versions/v1/style.css site/
cp .versions/v1/data/* site/data/
```
