#!/bin/bash
# Claude Code hook: Plays a DIFFERENT chime every time Claude stops for approval
# 14 macOS system sounds rotate randomly - you'll never get bored

SOUNDS=(
  "Basso"
  "Blow"
  "Bottle"
  "Frog"
  "Funk"
  "Glass"
  "Hero"
  "Morse"
  "Ping"
  "Pop"
  "Purr"
  "Sosumi"
  "Submarine"
  "Tink"
)

# Pick a random sound
PICK="${SOUNDS[$((RANDOM % ${#SOUNDS[@]}))]}"

# Play it (background so it doesn't block)
afplay "/System/Library/Sounds/${PICK}.aiff" &

# Mac notification with which sound played
osascript -e "display notification \"${PICK} chime - Claude needs your attention\" with title \"Claude Code\" sound name \"${PICK}\""

echo '{"continue": true}'
