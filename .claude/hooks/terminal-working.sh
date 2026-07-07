#!/bin/bash
# =============================================================================
# terminal-working — PreToolUse hook
# Updates terminal title to show active tool and sets working background tint.
# Supports Kitty (kitty @), Ghostty (OSC), and fallback (OSC).
#
# Hook type: PreToolUse (no matcher — fires on all tools)
# =============================================================================

WORKING_BG="#0d1220"

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/detect-terminal.sh"

PROJECT_NAME=$(basename "$(pwd)")

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null)

TITLE="⚡ $PROJECT_NAME - ${TOOL_NAME:-working…}"

case "$DETECTED_TERMINAL" in
    kitty)
        kitty @ set-tab-title "$TITLE" 2>/dev/null
        kitty @ set-colors background="$WORKING_BG" 2>/dev/null
        ;;
    *)
        printf '\033]2;%s\007' "$TITLE" > /dev/tty 2>/dev/null
        printf '\033]11;%s\007' "$WORKING_BG" > /dev/tty 2>/dev/null
        ;;
esac

echo '{"decision":"approve"}'
