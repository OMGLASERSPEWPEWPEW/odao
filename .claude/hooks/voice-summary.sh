#!/bin/bash
# =============================================================================
# voice-summary — Stop hook
# Every N minutes of active work, generates a conversational TTS summary of
# recent accomplishments and speaks it aloud via Piper.
#
# Hook type: Stop
# Lifecycle: Runs after every agent response (time-gated internally)
# Requires: python3, piper binary, ANTHROPIC_API_KEY
# =============================================================================

hook_data=$(cat)

python3 - "$hook_data" << 'PYTHON'
import json, sys, os, time, subprocess, urllib.request, urllib.error, tempfile

# === CONFIGURATION ===
INTERVAL_MINUTES = int(os.environ.get("VOICE_SUMMARY_INTERVAL_MINUTES", "10"))
MIN_NEW_TEXT_CHARS = 200
PIPER_BIN = "/Library/Frameworks/Python.framework/Versions/3.11/bin/piper"
PIPER_MODEL = "/Users/dericortiz/Development/discord-bot/models/en_US-lessac-medium.onnx"
SUMMARY_MODEL = "claude-haiku-4-5-20250929"
# === END CONFIGURATION ===

hook_data_raw = sys.argv[1] if len(sys.argv) > 1 else "{}"
try:
    hook = json.loads(hook_data_raw)
    transcript_path = hook.get("transcript_path", "")
    session_id = hook.get("session_id", "unknown")
except Exception:
    transcript_path = ""
    session_id = "unknown"

if not transcript_path or not os.path.exists(transcript_path):
    print('{"continue": true}')
    sys.exit(0)

state_file = f"/tmp/claude-voice-summary-{session_id}.json"
last_spoken_time = 0
last_spoken_line = 0

try:
    if os.path.exists(state_file):
        with open(state_file, "r") as f:
            state = json.load(f)
            last_spoken_time = state.get("last_spoken_time", 0)
            last_spoken_line = state.get("last_spoken_line", 0)
except Exception:
    pass

now = time.time()
elapsed = now - last_spoken_time if last_spoken_time > 0 else float("inf")

if elapsed < INTERVAL_MINUTES * 60:
    print('{"continue": true}')
    sys.exit(0)

# Extract new assistant messages since last summary
assistant_texts = []
current_line = 0

try:
    with open(transcript_path, "r") as f:
        for line in f:
            current_line += 1
            if current_line <= last_spoken_line:
                continue
            try:
                entry = json.loads(line.strip())
                if "message" in entry and isinstance(entry["message"], dict):
                    msg = entry["message"]
                    if msg.get("role") == "assistant":
                        content = msg.get("content", [])
                        if isinstance(content, list):
                            for block in content:
                                if isinstance(block, dict) and block.get("type") == "text":
                                    text = block.get("text", "")
                                    if len(text) > 30:
                                        assistant_texts.append(text[:800])
            except Exception:
                continue
except Exception:
    print('{"continue": true}')
    sys.exit(0)

total_new_text = sum(len(t) for t in assistant_texts)
if total_new_text < MIN_NEW_TEXT_CHARS:
    print('{"continue": true}')
    sys.exit(0)

# Generate conversational summary via Anthropic API
recent_text = "\n---\n".join(assistant_texts[-5:])

api_key = os.environ.get("ANTHROPIC_API_KEY", "")
summary = ""

if api_key:
    try:
        prompt = f"""Here are recent messages from an AI coding assistant working with a developer. Summarize what was accomplished in 2-3 casual spoken sentences. Address the developer as "you" directly.

CRITICAL: This text will be read aloud by a text-to-speech engine. Use plain conversational English ONLY. No markdown, no bullet points, no asterisks, no dashes, no code blocks, no special characters, no formatting of any kind. Just natural speech, like a coworker giving a quick verbal update over coffee.

Recent work:
{recent_text[:3000]}"""

        payload = json.dumps({
            "model": SUMMARY_MODEL,
            "max_tokens": 256,
            "messages": [{"role": "user", "content": prompt}]
        }).encode()

        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            }
        )

        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            summary = data.get("content", [{}])[0].get("text", "")

    except Exception:
        summary = ""

# Fallback: extractive summary via macOS say
if not summary:
    sentences = []
    for text in assistant_texts[-3:]:
        first_sentence = text.split(". ")[0].strip()
        if len(first_sentence) > 20:
            sentences.append(first_sentence + ".")
    if sentences:
        summary = " ".join(sentences[:3])

if not summary:
    print('{"continue": true}')
    sys.exit(0)

# Speak the summary via Piper (preferred) or macOS say (fallback)
spoken = False

if os.path.exists(PIPER_BIN) and os.path.exists(PIPER_MODEL):
    try:
        wav_file = f"/tmp/voice-summary-{session_id}.wav"
        proc = subprocess.Popen(
            [PIPER_BIN, "-m", PIPER_MODEL, "--output_file", wav_file],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        proc.communicate(input=summary.encode(), timeout=15)

        if proc.returncode == 0 and os.path.exists(wav_file):
            subprocess.Popen(["afplay", wav_file])
            spoken = True
    except Exception:
        pass

if not spoken:
    try:
        subprocess.Popen(["say", "-r", "180", summary[:500]])
    except Exception:
        pass

# Update state
try:
    with open(state_file, "w") as f:
        json.dump({
            "last_spoken_time": now,
            "last_spoken_line": current_line,
        }, f)
except Exception:
    pass

subtitle = json.dumps(f"VOICE SUMMARY (spoken aloud via TTS): {summary}\n\nDisplay this summary text to the developer as-is so they can read along.")
print(f'{{"continue": true, "systemMessage": {subtitle}}}')
PYTHON
