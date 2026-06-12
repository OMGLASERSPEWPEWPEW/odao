# Standard Stack

## MCU
ESP32-S3-WROOM-1-N8R8 — dual-core Xtensa LX7 @ 240 MHz.
8 MB quad-SPI flash (QIO), 8 MB Octal-SPI PSRAM (OPI).
Wi-Fi b/g/n + BLE 5.0 (PCB antenna integrated in module).

The PSRAM is Octal, not quad. It stays disabled unless explicitly enabled:
- ESP-IDF: `SPI RAM → Mode = Octal`, flash size 8 MB
- Arduino-ESP32: `PSRAM = OPI PSRAM`
- PlatformIO: `board_build.arduino.memory_type = qio_opi` + `-DBOARD_HAS_PSRAM`

## Firmware Toolchain
ESP-IDF v5.5.x (C/C++). Source at `~/esp/esp-idf/export.sh`.
Build/flash/monitor via the `esp-idf` MCP server or CLI:
```
idf.py set-target esp32s3
idf.py build
idf.py -p /dev/cu.usbserial-10 flash monitor
```

Other toolchains welcome for contributions (Arduino-ESP32, PlatformIO,
MicroPython, CircuitPython, Rust esp-hal) — specify in your README.

## Hardware Design
KiCad 9.0.3. Main schematic: `pcb/oniondao-badge.kicad_sch`.
Swappable module schematics live alongside: `CC1101_MOD`, `SOUND_MOD`, `LORA_MOD`, `SDCARD_MOD`.
Production files (gerbers, BOMs): `pcb/production/`.

## USB & Programming
WCH CH340C USB-UART bridge with NodeMCU auto-reset circuit (DTR/RTS → Q1/Q2).
Programming UART: GPIO43 (TX0) → CH340C RXD, GPIO44 (RX0) ← CH340C TXD.

## Power Architecture
Two rails:
- **VCC** — always-on (ESP32 + CH340C)
- **PWR** — switched via Q5 SS8050, controlled by GPIO18
  - HIGH = peripherals on (display, RF, audio, secure element)
  - Assert HIGH before talking to any gated peripheral, wait for POR

## I2C Bus
Single shared bus: GPIO9 (SCL) / GPIO10 (SDA), 400 kHz Fast Mode.
- TCA9534 IO expander @ 0x20 — 6 user buttons, INT on GPIO1
- ATECC608B secure element @ 0x60 — power-gated via GPIO8 (SE_EN)

## MCP Servers
- `esp-idf` — build, flash, monitor, set target, list ports
- `piper-tts` — text-to-speech for accessibility/testing
