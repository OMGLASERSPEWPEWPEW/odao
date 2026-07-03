# Campaign Dashboard Changelog

## v1.0.0 — 2026-07-03
- Initial dashboard: countdown timer, three-prong action plan, campaign calendar
- 20 legislator cards with verified ilga.gov contact info + district office addresses
- Interactive timeline with 10 milestones and click-to-expand action items
- Vote math visualization (60 votes needed: 40R locked + 20D targets)
- "Act Now" section with call scripts and copy-to-clipboard social posts
- Party/swayability filters on legislator grid
- Dark theme (navy #0F172A), responsive, vanilla JS + Vite

## v2.0.0 — 2026-07-03
- Choose-your-adventure landing page: Repeal vs Carve-out tracks
- Daily mission cards with today's specific action items from playbook
- Gamification: XP, streaks, 8 achievement badges, profile page
- Legislator photos (SVG initial avatars with photo upload support)
- Daily briefing page (conversational cards, progressive delivery)
- TTS via Web Speech API (piper-tts MCP roadmapped for pre-generated audio)
- Hash-based SPA routing with page transitions
- 20 legislator headshots downloaded from ilga.gov CDN
- 21 days of missions, 7 daily briefings in JSON

## v3.0.0 — 2026-07-03 (in progress)
- War room redesign: calm command center replacing urgent hero
- Nav: "SB 3019" brand + inline "181d" countdown (daily, not per-second)
- 4-panel dashboard: Active Missions, Situation Report, Upcoming Ops, Campaign Log
- Daily scrawl placeholder (ready for DO cron backend)
- Track cards demoted to buttons below the war room grid
- Vite build config for Digital Ocean static deployment
