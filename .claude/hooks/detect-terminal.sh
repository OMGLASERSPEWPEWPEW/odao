#!/bin/bash
# Shared terminal detection — source this from hooks.
# Sets DETECTED_TERMINAL to "kitty", "ghostty", or "unknown".

detect_terminal() {
    if [ -n "${KITTY_WINDOW_ID:-}" ]; then
        DETECTED_TERMINAL="kitty"
    elif [ "${TERM_PROGRAM:-}" = "ghostty" ] || pgrep -qx ghostty 2>/dev/null; then
        DETECTED_TERMINAL="ghostty"
    else
        DETECTED_TERMINAL="unknown"
    fi
}

detect_terminal
