#!/bin/bash
# =============================================================================
# terminal-title — SessionStart hook
# Sets initial terminal title and working background tint.
# Supports Kitty (kitty @), Ghostty (OSC), and fallback (OSC).
#
# Hook type: SessionStart
# =============================================================================

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/detect-terminal.sh"

PROJECT_NAME=$(basename "$(pwd)")

case "$DETECTED_TERMINAL" in
    kitty)
        kitty @ set-tab-title "⚡ $PROJECT_NAME - starting session" 2>/dev/null
        kitty @ set-colors background=#0d1220 2>/dev/null
        ;;
    *)
        printf '\033]2;⚡ %s - starting session\007' "$PROJECT_NAME" > /dev/tty 2>/dev/null
        printf '\033]11;#0d1220\007' > /dev/tty 2>/dev/null
        ;;
esac

echo '{"continue": true}'
