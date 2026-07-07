# TODO: Telegram Alert on Bill Status Change

**Status**: review
**Priority**: high
**Created**: 2026-07-06
**Depends on**: bill-status-monitor

## Summary
When the bill status monitor detects a change (especially "ASSIGNED TO A COMMITTEE"), send an alert to the Onion DAO Telegram group via Telegram Bot API. Embedded directly in the bill-status-check edge function.

## Requirements
- `sendTelegramAlert()` helper in bill-status-check edge function
- POST to `https://api.telegram.org/bot<TOKEN>/sendMessage`
- Fires only when `status_changed === true`
- Message: new status, AI summary, source links, campaign dashboard link
- Secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Manual setup: create bot via @BotFather, add to Onion DAO group, get chat ID
- Phase 2 (future): bot commands (/status, /legislators, /witness-slip)

## Files
- `~/Development/ournews/supabase/functions/bill-status-check/index.ts` (add sendTelegramAlert)

## Effort
~30 minutes — single HTTP POST, no complex auth

## Stage
- [x] planning
- [x] documentation
- [x] architecture
- [x] implementation
- [x] review
