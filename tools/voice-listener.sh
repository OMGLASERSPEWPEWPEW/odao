#!/bin/bash
# =============================================================================
# voice-listener — Manage the whisper-stream background transcription daemon
# Usage: voice-listener.sh {start|stop|status|devices|tail}
# =============================================================================

set -euo pipefail

WHISPER_STREAM="/opt/homebrew/opt/whisper-cpp/bin/whisper-stream"
MODEL="${VOICE_WHISPER_MODEL:-$HOME/.local/share/whisper-models/ggml-base.en.bin}"
CAPTURE_DEVICE="${VOICE_CAPTURE_DEVICE:--1}"
TRANSCRIPT="/tmp/claude-voice-transcript.txt"
PID_FILE="/tmp/claude-voice-listener.pid"
LOG_FILE="/tmp/claude-voice-listener.log"

STEP=3000        # 3-second audio chunks
LENGTH=10000     # 10-second context window
VAD_THOLD=0.60   # voice activity detection threshold

usage() {
    echo "Usage: $0 {start|stop|status|devices|tail}"
    echo ""
    echo "Commands:"
    echo "  start    Start the whisper-stream transcription daemon"
    echo "  stop     Stop the daemon"
    echo "  status   Check if the daemon is running"
    echo "  devices  List available audio input devices"
    echo "  tail     Show recent transcription output"
    exit 1
}

is_running() {
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        fi
    fi
    return 1
}

cmd_start() {
    if is_running; then
        echo "Listener already running (PID $(cat "$PID_FILE"))"
        exit 0
    fi

    if [ ! -x "$WHISPER_STREAM" ]; then
        echo "Error: whisper-stream not found at $WHISPER_STREAM"
        echo "Install: brew install whisper-cpp"
        exit 1
    fi

    if [ ! -f "$MODEL" ]; then
        echo "Error: Whisper model not found at $MODEL"
        echo "Run: tools/voice-setup.sh"
        exit 1
    fi

    echo "Starting voice listener..."
    echo "  Device: $CAPTURE_DEVICE"
    echo "  Model:  $MODEL"
    echo "  Output: $TRANSCRIPT"

    touch "$TRANSCRIPT"

    nohup "$WHISPER_STREAM" \
        --capture "$CAPTURE_DEVICE" \
        --model "$MODEL" \
        --step "$STEP" \
        --length "$LENGTH" \
        --vad-thold "$VAD_THOLD" \
        --file "$TRANSCRIPT" \
        --language en \
        > "$LOG_FILE" 2>&1 &

    echo $! > "$PID_FILE"
    echo "Started (PID $!). Logs: $LOG_FILE"
}

cmd_stop() {
    if is_running; then
        pid=$(cat "$PID_FILE")
        kill "$pid" 2>/dev/null
        rm -f "$PID_FILE"
        echo "Stopped listener (PID $pid)"
    else
        echo "Listener not running"
    fi
}

cmd_status() {
    if is_running; then
        pid=$(cat "$PID_FILE")
        echo "Running (PID $pid)"
        echo "Transcript: $TRANSCRIPT ($(wc -l < "$TRANSCRIPT" 2>/dev/null || echo 0) lines)"
        echo "Log: $LOG_FILE"
    else
        echo "Not running"
    fi
}

cmd_devices() {
    echo "Audio input devices:"
    ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | \
        sed -n '/AVFoundation audio devices/,/^$/p' | head -10
}

cmd_tail() {
    if [ -f "$TRANSCRIPT" ]; then
        echo "--- Last 20 lines of transcription ---"
        tail -20 "$TRANSCRIPT"
    else
        echo "No transcript file found"
    fi
}

case "${1:-}" in
    start)   cmd_start ;;
    stop)    cmd_stop ;;
    status)  cmd_status ;;
    devices) cmd_devices ;;
    tail)    cmd_tail ;;
    *)       usage ;;
esac
