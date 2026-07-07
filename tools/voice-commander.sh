#!/bin/bash
# =============================================================================
# voice-commander — Wake word detection with multi-line command capture
# Watches the whisper-stream transcript for "sorry", then captures the
# command from the same line or the next spoken line. Three distinct tones.
# Usage: voice-commander.sh {start|stop|status|queue|clear}
# =============================================================================

set -euo pipefail

COMMAND_QUEUE="/tmp/claude-voice-command-queue.jsonl"
TRANSCRIPT="/tmp/claude-voice-transcript.txt"
PID_FILE="/tmp/claude-voice-commander.pid"
LOG_FILE="/tmp/claude-voice-commander.log"

WAKE_WORD="${VOICE_WAKE_PHRASE:-sorry}"

# Three distinct tones
TONE_LISTENING="/System/Library/Sounds/Tink.aiff"   # wake word heard, capturing
TONE_SENT="/System/Library/Sounds/Pop.aiff"          # command queued
TONE_ERROR="/System/Library/Sounds/Basso.aiff"       # something went wrong

usage() {
    echo "Usage: $0 {start|stop|status|queue|clear}"
    echo ""
    echo "Tones:"
    echo "  Tink  — Listening (wake word detected, speak your command)"
    echo "  Pop   — Sent (command queued successfully)"
    echo "  Basso — Error (capture timed out or empty)"
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
        echo "Commander already running (PID $(cat "$PID_FILE"))"
        exit 0
    fi

    if [ ! -f "$TRANSCRIPT" ]; then
        echo "Error: Transcript file not found at $TRANSCRIPT"
        echo "Start the listener first: tools/voice-listener.sh start"
        exit 1
    fi

    echo "Starting voice commander..."
    echo "  Wake word: \"$WAKE_WORD\""
    echo "  Tones: Tink (listening) → Pop (sent) → Basso (error)"

    touch "$COMMAND_QUEUE"

    nohup python3 - "$WAKE_WORD" "$COMMAND_QUEUE" "$TRANSCRIPT" "$TONE_LISTENING" "$TONE_SENT" "$TONE_ERROR" << 'PYTHON' > "$LOG_FILE" 2>&1 &
import sys, os, time, json, subprocess, re

WAKE_WORD = sys.argv[1].lower()
COMMAND_QUEUE = sys.argv[2]
TRANSCRIPT = sys.argv[3]
TONE_LISTENING = sys.argv[4]
TONE_SENT = sys.argv[5]
TONE_ERROR = sys.argv[6]

CAPTURE_TIMEOUT = 10  # seconds to wait for command after wake word
COOLDOWN = 3          # seconds between wake word triggers
STARTUP_DELAY = 6     # seconds to skip after startup (avoid TTS self-trigger)

def play(sound):
    subprocess.Popen(["afplay", sound], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def clean_line(raw):
    """Strip whisper timestamp prefixes and whitespace."""
    line = raw.strip()
    if not line or "[BLANK_AUDIO]" in line:
        return ""
    if line.startswith("[") and "-->" in line:
        bracket_end = line.find("]")
        if bracket_end >= 0:
            line = line[bracket_end + 1:].strip()
    return line

def extract_command(line, wake_word):
    """If the line contains the wake word, return everything after it. Otherwise None."""
    lower = line.lower()
    pos = lower.find(wake_word)
    if pos < 0:
        return None
    after = line[pos + len(wake_word):]
    after = re.sub(r'^[,.\s!?:]+', '', after).strip()
    return after

def queue_command(command, raw_line):
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    entry = json.dumps({"timestamp": timestamp, "command": command, "raw": raw_line})
    with open(COMMAND_QUEUE, "a") as f:
        f.write(entry + "\n")
    print(f"[commander] Queued: {command}", flush=True)

# Wait for startup TTS to finish before we start monitoring
print(f"[commander] Waiting {STARTUP_DELAY}s for startup sounds to clear...", flush=True)
time.sleep(STARTUP_DELAY)

# Start from current end of transcript
last_line_count = 0
try:
    with open(TRANSCRIPT, "r") as f:
        last_line_count = sum(1 for _ in f)
except Exception:
    pass

print(f"[commander] Watching for '{WAKE_WORD}' from line {last_line_count}", flush=True)
print(f"[commander] Tones: Tink=listening, Pop=sent, Basso=error", flush=True)

# State machine
STATE_IDLE = "idle"
STATE_CAPTURING = "capturing"

state = STATE_IDLE
capture_start_time = 0
last_trigger_time = 0

while True:
    try:
        with open(TRANSCRIPT, "r") as f:
            lines = f.readlines()

        if len(lines) <= last_line_count:
            # No new lines — check capture timeout
            if state == STATE_CAPTURING and time.time() - capture_start_time > CAPTURE_TIMEOUT:
                print("[commander] Capture timed out, no command heard", flush=True)
                play(TONE_ERROR)
                state = STATE_IDLE
            time.sleep(1)
            continue

        new_lines = lines[last_line_count:]
        last_line_count = len(lines)

        for raw_line in new_lines:
            line = clean_line(raw_line)
            if not line:
                continue

            if state == STATE_IDLE:
                cmd = extract_command(line, WAKE_WORD)
                if cmd is None:
                    continue

                now = time.time()
                if now - last_trigger_time < COOLDOWN:
                    continue
                last_trigger_time = now

                if len(cmd) >= 3:
                    # Wake word + command on same line
                    play(TONE_LISTENING)
                    time.sleep(0.3)
                    queue_command(cmd, line)
                    play(TONE_SENT)
                else:
                    # Wake word alone — enter capture mode
                    print("[commander] Wake word detected, listening for command...", flush=True)
                    play(TONE_LISTENING)
                    state = STATE_CAPTURING
                    capture_start_time = time.time()

            elif state == STATE_CAPTURING:
                # In capture mode — accept the next meaningful line as the command
                # But skip lines that are just the wake word again
                cmd_check = extract_command(line, WAKE_WORD)
                if cmd_check is not None:
                    if len(cmd_check) >= 3:
                        queue_command(cmd_check, line)
                        play(TONE_SENT)
                        state = STATE_IDLE
                    continue

                # This line doesn't contain the wake word — it's the command
                if len(line) >= 3:
                    queue_command(line, line)
                    play(TONE_SENT)
                    state = STATE_IDLE

        # Check capture timeout after processing lines
        if state == STATE_CAPTURING and time.time() - capture_start_time > CAPTURE_TIMEOUT:
            print("[commander] Capture timed out, no command heard", flush=True)
            play(TONE_ERROR)
            state = STATE_IDLE

    except Exception as e:
        print(f"[commander] Error: {e}", flush=True)

    time.sleep(1)
PYTHON

    echo $! > "$PID_FILE"
    echo "Started (PID $(cat "$PID_FILE")). Logs: $LOG_FILE"
    echo "Say \"$WAKE_WORD\" followed by a command."
}

cmd_stop() {
    if is_running; then
        pid=$(cat "$PID_FILE")
        kill "$pid" 2>/dev/null
        rm -f "$PID_FILE"
        echo "Stopped commander (PID $pid)"
    else
        echo "Commander not running"
    fi
}

cmd_status() {
    if is_running; then
        pid=$(cat "$PID_FILE")
        queued=$(wc -l < "$COMMAND_QUEUE" 2>/dev/null || echo 0)
        echo "Running (PID $pid)"
        echo "Queue: $COMMAND_QUEUE ($queued commands)"
        echo "Log: $LOG_FILE"
    else
        echo "Not running"
    fi
}

cmd_queue() {
    if [ -f "$COMMAND_QUEUE" ] && [ -s "$COMMAND_QUEUE" ]; then
        echo "--- Queued commands ---"
        cat "$COMMAND_QUEUE" | python3 -c "
import sys, json
for line in sys.stdin:
    try:
        d = json.loads(line.strip())
        print(f\"  [{d['timestamp']}] {d['command']}\")
    except: pass
"
    else
        echo "No commands queued"
    fi
}

cmd_clear() {
    > "$COMMAND_QUEUE"
    echo "Queue cleared"
}

case "${1:-}" in
    start)   cmd_start ;;
    stop)    cmd_stop ;;
    status)  cmd_status ;;
    queue)   cmd_queue ;;
    clear)   cmd_clear ;;
    *)       usage ;;
esac
