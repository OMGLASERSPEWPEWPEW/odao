#!/bin/bash
# =============================================================================
# voice-setup — One-time setup for the voice assistant system
# Verifies dependencies, copies whisper model to a stable path, tests TTS.
# =============================================================================

set -euo pipefail

WHISPER_DIR="$HOME/.local/share/whisper-models"
WHISPER_BIN="/opt/homebrew/opt/whisper-cpp/bin"
PIPER_BIN="/Library/Frameworks/Python.framework/Versions/3.11/bin/piper"
PIPER_MODEL="/Users/dericortiz/Development/discord-bot/models/en_US-lessac-medium.onnx"
SOURCE_MODEL="$HOME/Development/discord-bot/node_modules/whisper-node/dist/whisper/models/ggml-base.en.bin"

echo "=== Voice Assistant Setup ==="
echo ""

# 1. Check whisper-cpp binaries
echo "--- Checking whisper-cpp ---"
for bin in whisper-stream whisper-command whisper-cli; do
    if [ -x "$WHISPER_BIN/$bin" ]; then
        echo "  ✓ $bin found"
    else
        echo "  ✗ $bin NOT FOUND at $WHISPER_BIN/$bin"
        echo "    Install: brew install whisper-cpp"
        exit 1
    fi
done

# 2. Copy whisper model to stable location
echo ""
echo "--- Setting up whisper model ---"
mkdir -p "$WHISPER_DIR"

if [ -f "$WHISPER_DIR/ggml-base.en.bin" ]; then
    echo "  ✓ ggml-base.en.bin already at $WHISPER_DIR/"
else
    if [ -f "$SOURCE_MODEL" ]; then
        echo "  Copying ggml-base.en.bin to $WHISPER_DIR/ ..."
        cp "$SOURCE_MODEL" "$WHISPER_DIR/ggml-base.en.bin"
        echo "  ✓ Model copied ($(du -h "$WHISPER_DIR/ggml-base.en.bin" | cut -f1))"
    else
        echo "  ✗ Source model not found at $SOURCE_MODEL"
        echo "    Download manually:"
        echo "    curl -L -o $WHISPER_DIR/ggml-base.en.bin \\"
        echo "      https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin"
        exit 1
    fi
fi

# 3. Check Piper TTS
echo ""
echo "--- Checking Piper TTS ---"
if [ -x "$PIPER_BIN" ]; then
    echo "  ✓ Piper binary found"
else
    echo "  ✗ Piper binary NOT FOUND at $PIPER_BIN"
    exit 1
fi

if [ -f "$PIPER_MODEL" ]; then
    echo "  ✓ Voice model found ($(du -h "$PIPER_MODEL" | cut -f1))"
else
    echo "  ✗ Voice model NOT FOUND at $PIPER_MODEL"
    exit 1
fi

# 4. List audio devices
echo ""
echo "--- Audio input devices ---"
ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep -E "(audio devices|\[[0-9]+\])" | head -10 || true

# 5. Quick TTS test
echo ""
echo "--- TTS test ---"
WAV_FILE=$(mktemp /tmp/voice-setup-test-XXXXXX.wav)
echo "Voice assistant setup complete." | "$PIPER_BIN" -m "$PIPER_MODEL" --output_file "$WAV_FILE" 2>/dev/null
if [ -f "$WAV_FILE" ] && [ -s "$WAV_FILE" ]; then
    echo "  ✓ Piper synthesis works"
    echo "  Playing test audio..."
    afplay "$WAV_FILE"
    rm -f "$WAV_FILE"
else
    echo "  ✗ Piper synthesis failed, falling back to macOS say"
    say "Voice assistant setup complete."
fi

echo ""
echo "=== Setup complete ==="
echo ""
echo "Whisper model: $WHISPER_DIR/ggml-base.en.bin"
echo "Piper binary:  $PIPER_BIN"
echo "Piper model:   $PIPER_MODEL"
echo ""
echo "Next steps:"
echo "  tools/voice-listener.sh devices   # list audio inputs"
echo "  tools/voice-listener.sh start     # start mic transcription"
echo "  tools/voice-commander.sh start    # start wake word detection"
echo "  tools/voice-all.sh start          # start everything"
