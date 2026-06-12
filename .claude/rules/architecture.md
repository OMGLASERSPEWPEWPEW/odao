# Project Architecture

## Directory Layout
```
badge/                          # Main repo (git root)
  pcb/                          # KiCad hardware designs
    oniondao-badge.kicad_sch    # Main schematic
    oniondao-badge.kicad_pcb    # PCB layout
    production/                 # Gerbers, BOMs, netlists
    *_MOD.kicad_sch             # Swappable module schematics
  docs/                         # Hardware documentation
    HARDWARE.md                 # Subsystem deep dive
    PINOUT.md                   # Complete GPIO map (source of truth)
    MODULES.md                  # Swappable module specs
    CONTRIBUTING.md             # Contribution guidelines
  software/
    examples/                   # Minimal single-feature sketches
    guides/                     # Step-by-step tutorials
    mods/                       # Full firmware projects / variants
    components/                 # Shared libraries (GxEPD2, Adafruit_GFX)
  case/                         # 3D printed enclosure designs
```

## App Model: Onion OS + Lua Scripts

Onion OS (`software/mods/onion-os/`) is the production firmware. Custom badge
apps are Lua scripts that run on Onion OS, NOT standalone ESP-IDF projects.

- Lua scripts go in `software/mods/onion-os/scripts/`
- Scripts use the `onion.*` SDK (60+ functions for display, input, networking)
- Deploy via: script manifest URL, MQTT push from portal, or serial `run` command
- Full Lua API reference: `docs/ONION-OS.md`

Standalone ESP-IDF examples still live in `software/examples/` for bare-metal
hardware demos, but they are not the intended app distribution model.

## Decision Framework
- "Is it a badge app for end users?" → Lua script in `software/mods/onion-os/scripts/`
- "Does it demonstrate one peripheral?" → `software/examples/<name>/`
- "Is it a tutorial with prose?" → `software/guides/<name>/`
- "Is it a complete firmware?" → `software/mods/<name>/`
- "Is it a new hardware module?" → `pcb/<NAME>_MOD.kicad_sch` + BOM in `pcb/production/`
- "Is it a doc fix?" → edit under `docs/` directly

## Firmware Contribution Shape
Each contribution is one self-contained folder:
```
software/<bucket>/<your-thing>/
├── README.md          # What, which module, which GPIOs, build/flash steps, demo
├── main/              # ESP-IDF main component (or src/ for other toolchains)
├── CMakeLists.txt     # Top-level ESP-IDF project file
└── sdkconfig.defaults # Non-default sdkconfig entries
```

## Naming Conventions
- Folder names: `kebab-case`
- Pin references: use documented net names from PINOUT.md (e.g., `PBINT`, `SE_EN`, `PWR`)
- Module variants: `CC1101`, `SOUND`, `LORA`, `SDCARD`

## Display Interface
24-pin socket (J4) for E-Ink or TFT SPI:
- RST=GPIO14, DC=GPIO13, CS=GPIO12, SCK=GPIO11, MOSI=GPIO17, BUSY=GPIO21
- Shared SPI bus. Use GxEPD2 component for e-paper displays.

## Swappable Modules
CC1101 and Sound modules share the same physical pins — mutually exclusive.
Gate initialization behind runtime detection or compile-time `#define`.
Production boards default to L1 (left side, primary) wiring.
