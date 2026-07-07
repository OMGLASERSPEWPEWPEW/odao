#!/bin/bash
# =============================================================================
# voice-session-init — SessionStart hook
# Writes the current session ID and Claude PID to /tmp/ so voice tools can
# identify the active session for command injection.
#
# Hook type: SessionStart
# =============================================================================

hook_data=$(cat)

session_id=$(echo "$hook_data" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('session_id','unknown'))" 2>/dev/null || echo "unknown")

echo "$session_id" > /tmp/claude-voice-session.txt

# Also store the Claude PID for status file lookups
pid=$PPID
for _ in 1 2 3 4 5 6; do
  if [ -f "$HOME/.claude/sessions/$pid.json" ]; then
    echo "$pid" > /tmp/claude-voice-pid.txt
    break
  fi
  pid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
  [ -z "$pid" ] || [ "$pid" = "1" ] && break
done

echo '{"continue": true}'
