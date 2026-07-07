#!/bin/bash
# =============================================================================
# voice-all — Master control for the voice assistant system
# Usage: voice-all.sh {start|stop|status}
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

usage() {
    echo "Usage: $0 {start|stop|status}"
    echo ""
    echo "Controls all voice assistant components:"
    echo "  1. voice-listener   — Continuous mic transcription (whisper-stream)"
    echo "  2. voice-commander  — Wake word detection (watches transcript for 'sorry')"
    echo "  3. voice-bridge     — Auto-types commands into terminal when Claude is idle"
    echo "Run tools/voice-setup.sh first for one-time setup."
    exit 1
}

cmd_start() {
    echo "=== Starting Voice Assistant ==="
    echo ""

    echo "1/2 Starting listener (continuous transcription)..."
    "$SCRIPT_DIR/voice-listener.sh" start
    echo ""

    # Give listener time to create transcript file and TTS to finish speaking
    sleep 3

    echo "2/3 Starting commander (wake word detection)..."
    "$SCRIPT_DIR/voice-commander.sh" start
    echo ""

    echo "3/3 Starting bridge (auto-types into terminal)..."
    "$SCRIPT_DIR/voice-bridge.sh" start
    echo ""

    echo "=== Voice Assistant Active ==="
    echo "Say \"Sorry\" followed by a command. It auto-types when Claude is idle."
    echo "Stop with: $0 stop"

    # Speak a startup confirmation
    PIPER_BIN="/Library/Frameworks/Python.framework/Versions/3.11/bin/piper"
    PIPER_MODEL="/Users/dericortiz/Development/discord-bot/models/en_US-lessac-medium.onnx"
    if [ -x "$PIPER_BIN" ] && [ -f "$PIPER_MODEL" ]; then
        wav=$(mktemp /tmp/voice-startup-XXXXXX.wav)
        echo "Voice assistant is now online and listening." | \
            "$PIPER_BIN" -m "$PIPER_MODEL" --output_file "$wav" 2>/dev/null
        afplay "$wav" 2>/dev/null &
        (sleep 5 && rm -f "$wav") &
    fi
}

cmd_stop() {
    echo "=== Stopping Voice Assistant ==="
    echo ""

    echo "Stopping bridge..."
    "$SCRIPT_DIR/voice-bridge.sh" stop

    echo "Stopping commander..."
    "$SCRIPT_DIR/voice-commander.sh" stop

    echo "Stopping listener..."
    "$SCRIPT_DIR/voice-listener.sh" stop

    echo ""
    echo "=== Voice Assistant Stopped ==="
}

cmd_status() {
    echo "=== Voice Assistant Status ==="
    echo ""

    echo "--- Listener ---"
    "$SCRIPT_DIR/voice-listener.sh" status
    echo ""

    echo "--- Commander ---"
    "$SCRIPT_DIR/voice-commander.sh" status
    echo ""

    echo "--- Bridge ---"
    "$SCRIPT_DIR/voice-bridge.sh" status
    echo ""

    echo "--- Command Queue ---"
    "$SCRIPT_DIR/voice-commander.sh" queue
}

case "${1:-}" in
    start)   cmd_start ;;
    stop)    cmd_stop ;;
    status)  cmd_status ;;
    *)       usage ;;
esac
