# TODO: HB 5798 Bill Status Monitor

**Status**: review
**Priority**: critical
**Created**: 2026-07-06

## Summary
Supabase Edge Function on OurNews that calls Perplexity Sonar API daily to check the status of HB 5798 (repeal of IL Digital Asset Tax). Stores results, detects status changes, and exposes a GET endpoint for the campaign site to poll.

## Requirements
- Edge Function `bill-status-check` in OurNews Supabase (`~/Development/ournews/supabase/`)
- Perplexity Sonar API (`sonar-pro` model) for bill status queries
- `bill_status_checks` table: bill_id, checked_at, raw_response, extracted_status, citations, status_changed, alert_sent
- GET = return latest status (campaign site polls this)
- POST = run new check, compare against last known, insert row
- pg_cron schedule daily at 9 AM CT (14:00 UTC) via `run-scheduled` pattern
- CORS: allow `sb3019.vercel.app` in `_shared/http.ts`
- Secret: `PERPLEXITY_API_KEY`
- Campaign site integration: live status indicator on landing page

## Files
- `~/Development/ournews/supabase/functions/bill-status-check/index.ts` (new)
- `~/Development/ournews/supabase/functions/_shared/http.ts` (modify CORS)
- `~/Development/ournews/supabase/migrations/YYYYMMDD_bill_status_checks.sql` (new)
- `campaign/il-data-repeal/site/lib/shared-sections.js` (add live status fetch)

## Stage
- [x] planning
- [x] documentation
- [x] architecture
- [x] implementation
- [x] review
