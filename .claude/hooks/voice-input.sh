#!/bin/bash
# =============================================================================
# voice-input — Stop hook (supplementary command injection)
# Checks the voice command queue for unprocessed commands and injects them
# as a systemMessage. Catches commands that arrived while Claude was busy.
#
# Hook type: Stop
# =============================================================================

hook_data=$(cat)

python3 - "$hook_data" << 'PYTHON'
import json, sys, os

COMMAND_QUEUE = "/tmp/claude-voice-command-queue.jsonl"

hook_data_raw = sys.argv[1] if len(sys.argv) > 1 else "{}"
try:
    hook = json.loads(hook_data_raw)
    session_id = hook.get("session_id", "unknown")
except Exception:
    session_id = "unknown"

OFFSET_FILE = f"/tmp/claude-voice-input-offset-{session_id}.txt"

if not os.path.exists(COMMAND_QUEUE):
    print('{"continue": true}')
    sys.exit(0)

# Read offset (how many lines we've already processed)
last_offset = 0
try:
    if os.path.exists(OFFSET_FILE):
        with open(OFFSET_FILE, "r") as f:
            last_offset = int(f.read().strip())
except Exception:
    pass

# Read new commands
commands = []
current_line = 0
total_lines = 0
try:
    with open(COMMAND_QUEUE, "r") as f:
        total_lines = sum(1 for _ in f)
except Exception:
    pass

# Handle queue truncation/clear: if offset exceeds queue length, reset
if last_offset > total_lines:
    last_offset = 0

try:
    with open(COMMAND_QUEUE, "r") as f:
        for line in f:
            current_line += 1
            if current_line <= last_offset:
                continue
            try:
                cmd = json.loads(line.strip())
                command_text = cmd.get("command", "").strip()
                if command_text:
                    commands.append(command_text)
            except Exception:
                continue
except Exception:
    print('{"continue": true}')
    sys.exit(0)

# Update offset
try:
    with open(OFFSET_FILE, "w") as f:
        f.write(str(current_line))
except Exception:
    pass

if not commands:
    print('{"continue": true}')
    sys.exit(0)

# Inject voice commands as a system message
if len(commands) == 1:
    msg = f"VOICE COMMAND from the developer (spoken via bluetooth mic): {commands[0]}"
else:
    numbered = "\n".join(f"  {i+1}. {c}" for i, c in enumerate(commands))
    msg = f"VOICE COMMANDS from the developer (spoken via bluetooth mic):\n{numbered}"

escaped = json.dumps(msg)
print(f'{{"continue": true, "systemMessage": {escaped}}}')
PYTHON
