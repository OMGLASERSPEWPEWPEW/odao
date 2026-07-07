#!/bin/bash
# =============================================================================
# voice-bridge — Routes voice commands into the active Claude Code session
# Polls the command queue and injects commands via terminal-native IPC.
# Supports Kitty (kitty @ send-text) and Ghostty (AppleScript).
# Usage: voice-bridge.sh {start|stop|status}
# =============================================================================

set -euo pipefail

COMMAND_QUEUE="/tmp/claude-voice-command-queue.jsonl"
PID_FILE="/tmp/claude-voice-bridge.pid"
LOG_FILE="/tmp/claude-voice-bridge.log"
OFFSET_FILE="/tmp/claude-voice-bridge-offset.txt"
CLAUDE_PID_FILE="/tmp/claude-voice-pid.txt"
POLL_INTERVAL=0.5
PROJECT_MATCH="odao"

PIPER_BIN="/Library/Frameworks/Python.framework/Versions/3.11/bin/piper"
PIPER_MODEL="/Users/dericortiz/Development/discord-bot/models/en_US-lessac-medium.onnx"

usage() {
    echo "Usage: $0 {start|stop|status}"
    echo ""
    echo "Routes voice commands from the command queue into the active terminal."
    echo "Auto-detects Kitty (send-text) or Ghostty (AppleScript)."
    echo "Waits for Claude to be in 'waiting' state before injecting."
    exit 1
}

detect_terminal_for_bridge() {
    if pgrep -qx kitty 2>/dev/null || [ -n "${KITTY_WINDOW_ID:-}" ]; then
        echo "kitty"
    elif pgrep -qx ghostty 2>/dev/null; then
        echo "ghostty"
    else
        echo "unknown"
    fi
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
        echo "Bridge already running (PID $(cat "$PID_FILE"))"
        exit 0
    fi

    BRIDGE_TERMINAL=$(detect_terminal_for_bridge)

    echo "Starting voice bridge..."
    echo "  Terminal: $BRIDGE_TERMINAL"
    echo "  Project match: \"$PROJECT_MATCH\""
    echo "  Queue: $COMMAND_QUEUE"
    echo "  Poll interval: ${POLL_INTERVAL}s"

    nohup bash -c '
        COMMAND_QUEUE="'"$COMMAND_QUEUE"'"
        OFFSET_FILE="'"$OFFSET_FILE"'"
        CLAUDE_PID_FILE="'"$CLAUDE_PID_FILE"'"
        POLL_INTERVAL="'"$POLL_INTERVAL"'"
        PROJECT_MATCH="'"$PROJECT_MATCH"'"
        PIPER_BIN="'"$PIPER_BIN"'"
        PIPER_MODEL="'"$PIPER_MODEL"'"
        BRIDGE_TERMINAL="'"$BRIDGE_TERMINAL"'"

        if [ ! -f "$OFFSET_FILE" ]; then
            echo "0" > "$OFFSET_FILE"
        fi

        is_claude_waiting() {
            if [ -f "$CLAUDE_PID_FILE" ]; then
                claude_pid=$(cat "$CLAUDE_PID_FILE")
                status_file="$HOME/.claude/sessions/$claude_pid.status"
                if [ -f "$status_file" ]; then
                    status=$(cat "$status_file")
                    [ "$status" = "waiting" ] && return 0
                fi
            fi
            return 1
        }

        speak_brief() {
            if [ -x "$PIPER_BIN" ] && [ -f "$PIPER_MODEL" ]; then
                wav=$(mktemp /tmp/voice-bridge-XXXXXX.wav)
                echo "$1" | "$PIPER_BIN" -m "$PIPER_MODEL" --output_file "$wav" 2>/dev/null
                afplay "$wav" 2>/dev/null
                rm -f "$wav"
            else
                say -r 200 "$1" 2>/dev/null
            fi
        }

        inject_kitty() {
            local cmd="$1"
            local text="${cmd}\n"
            local socket=""
            for f in /tmp/kitty-*; do
                if [ -S "$f" ] 2>/dev/null; then
                    socket="$f"
                    break
                fi
            done

            if [ -n "$socket" ]; then
                kitty @ --to "unix:$socket" send-text --match "title:$PROJECT_MATCH" "$text" 2>/dev/null
            else
                kitty @ send-text --match "title:$PROJECT_MATCH" "$text" 2>/dev/null
            fi
        }

        inject_ghostty() {
            local cmd="$1"
            osascript - "$PROJECT_MATCH" "$cmd" <<'"'"'APPLESCRIPT_END'"'"' 2>/dev/null
on run argv
    set projectMatch to item 1 of argv
    set cmdText to item 2 of argv
    tell application "System Events"
        tell process "ghostty"
            set targetWindow to first window whose name contains projectMatch
            perform action "AXRaise" of targetWindow
            set frontmost to true
            delay 0.3
            keystroke cmdText
            delay 0.1
            keystroke return
        end tell
    end tell
end run
APPLESCRIPT_END
        }

        inject_command() {
            local cmd="$1"
            case "$BRIDGE_TERMINAL" in
                kitty)   inject_kitty "$cmd" ;;
                ghostty) inject_ghostty "$cmd" ;;
                *)
                    echo "[$(date +%H:%M:%S)] No supported terminal detected, skipping: $cmd"
                    return 1
                    ;;
            esac
        }

        echo "[$(date +%H:%M:%S)] Voice bridge started (terminal: $BRIDGE_TERMINAL)"

        while true; do
            if [ -f "$COMMAND_QUEUE" ]; then
                last_offset=$(cat "$OFFSET_FILE" 2>/dev/null || echo "0")
                total_lines=$(wc -l < "$COMMAND_QUEUE" 2>/dev/null || echo "0")
                total_lines=$(echo "$total_lines" | tr -d " ")

                if [ "$last_offset" -gt "$total_lines" ]; then
                    last_offset=0
                    echo "0" > "$OFFSET_FILE"
                fi

                if [ "$total_lines" -gt "$last_offset" ]; then
                    while ! is_claude_waiting; do
                        sleep 1
                    done

                    if is_claude_waiting; then
                        line_num=0
                        while IFS= read -r line; do
                            line_num=$((line_num + 1))
                            [ "$line_num" -le "$last_offset" ] && continue

                            command=$(echo "$line" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get(\"command\",\"\"))" 2>/dev/null)
                            [ -z "$command" ] && continue

                            echo "[$(date +%H:%M:%S)] Injecting ($BRIDGE_TERMINAL): $command"
                            inject_command "$command"

                            echo "$line_num" > "$OFFSET_FILE"

                            sleep 2
                            wait_inner=0
                            while ! is_claude_waiting; do
                                sleep 1
                                wait_inner=$((wait_inner + 1))
                                [ "$wait_inner" -ge 120 ] && break
                            done
                        done < "$COMMAND_QUEUE"

                        echo "$total_lines" > "$OFFSET_FILE"
                    fi
                fi
            fi

            sleep "$POLL_INTERVAL"
        done
    ' > "$LOG_FILE" 2>&1 &

    echo $! > "$PID_FILE"
    echo "Started (PID $!). Logs: $LOG_FILE"
}

cmd_stop() {
    if is_running; then
        pid=$(cat "$PID_FILE")
        pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')
        if [ -n "$pgid" ] && [ "$pgid" != "1" ]; then
            kill -- -"$pgid" 2>/dev/null
        else
            pkill -P "$pid" 2>/dev/null
            kill "$pid" 2>/dev/null
        fi
        rm -f "$PID_FILE"
        echo "Stopped bridge (PID $pid)"
    else
        echo "Bridge not running"
    fi
}

cmd_status() {
    if is_running; then
        pid=$(cat "$PID_FILE")
        offset=$(cat "$OFFSET_FILE" 2>/dev/null || echo "0")
        total=$(wc -l < "$COMMAND_QUEUE" 2>/dev/null || echo "0")
        terminal=$(detect_terminal_for_bridge)
        echo "Running (PID $pid, terminal: $terminal)"
        echo "Queue: $offset/$total commands processed"
        echo "Log: $LOG_FILE"
    else
        echo "Not running"
    fi
}

case "${1:-}" in
    start)   cmd_start ;;
    stop)    cmd_stop ;;
    status)  cmd_status ;;
    *)       usage ;;
esac
