#!/bin/bash
# =============================================================================
# terminal-done — Stop hook
# Sets terminal title to conversation topic and applies done background tint.
# Supports Kitty (kitty @), Ghostty (OSC), and fallback (OSC).
#
# Hook type: Stop
# =============================================================================

DONE_BG="#0d1a14"
OVERRIDE_DELAY=1

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/detect-terminal.sh"

INPUT=$(cat)
TITLE_FILE=$(mktemp /tmp/terminal-title.XXXXXX)

python3 - "$INPUT" "$TITLE_FILE" << 'PYTHON'
import json, sys, os

hook_raw = sys.argv[1] if len(sys.argv) > 1 else "{}"
title_file = sys.argv[2] if len(sys.argv) > 2 else ""

try:
    hook = json.loads(hook_raw)
    transcript_path = hook.get("transcript_path", "")
except Exception:
    transcript_path = ""

project_name = os.path.basename(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))

title_suffix = ""
if transcript_path and os.path.exists(transcript_path):
    try:
        first_user_msg = ""
        with open(transcript_path, "r") as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    entry_type = entry.get("type", "")
                    if entry_type == "custom-title":
                        title_suffix = entry.get("customTitle", "")
                    if not first_user_msg and entry_type == "user":
                        msg = entry.get("message", {})
                        content = msg.get("content", "") if isinstance(msg, dict) else ""
                        if isinstance(content, str) and content.strip():
                            first_user_msg = content.strip()[:60]
                except Exception:
                    continue
        if not title_suffix:
            title_suffix = first_user_msg or "ready"
    except Exception:
        title_suffix = "ready"
else:
    title_suffix = "ready"

title_suffix = title_suffix.replace("\n", " ").strip()
if len(title_suffix) > 60:
    title_suffix = title_suffix[:57] + "..."

full_title = f"{project_name} - {title_suffix}"

if title_file:
    try:
        with open(title_file, "w") as f:
            f.write(full_title)
    except Exception:
        pass

PYTHON

FULL_TITLE=$(cat "$TITLE_FILE" 2>/dev/null)
rm -f "$TITLE_FILE"

case "$DETECTED_TERMINAL" in
    kitty)
        kitty @ set-tab-title "✓ $FULL_TITLE" 2>/dev/null
        kitty @ set-colors background="$DONE_BG" 2>/dev/null
        if [ -n "$FULL_TITLE" ]; then
            (
                sleep "$OVERRIDE_DELAY"
                kitty @ set-tab-title "✓ $FULL_TITLE" 2>/dev/null
            ) &
            disown 2>/dev/null
        fi
        ;;
    *)
        printf '\033]2;\342\234\223 %s\007' "$FULL_TITLE" > /dev/tty 2>/dev/null
        printf '\033]11;%s\007' "$DONE_BG" > /dev/tty 2>/dev/null
        if [ -n "$FULL_TITLE" ]; then
            (
                sleep "$OVERRIDE_DELAY"
                printf '\033]2;\342\234\223 %s\007' "$FULL_TITLE" > /dev/tty 2>/dev/null
            ) &
            disown 2>/dev/null
        fi
        ;;
esac

echo '{"continue": true}'
