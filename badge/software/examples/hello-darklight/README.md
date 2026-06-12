# hello-darklight

Standalone e-ink slideshow demo: cycles through five screens ("Hello World /
I'm Darklight" typewriter intro, artists, engineers, call-to-action, and a QR
code rendered on-device with qrcodegen). Press any of the six user buttons to
skip to the next screen.

> This is a bare-metal ESP-IDF example, not a badge app. End-user apps should
> be Lua scripts on Onion OS — see `docs/ONION-OS.md`.

## Hardware

- OnionDAO badge (ESP32-S3-WROOM-1-N8R8)
- 2.7" GDEY027T91 e-ink display in the J4 socket
- TCA9534 button expander on the shared I2C bus (buttons PB1–PB6)

## GPIOs

| Net | GPIO | Use |
|-----|------|-----|
| `PWR` | 18 | Switched peripheral rail — asserted HIGH at boot |
| `SE_EN` | 8 | Secure element enable (held LOW) |
| `SCL` / `SDA` | 9 / 10 | I2C to TCA9534 @ 0x20 |
| `EPD_SCK` / `EPD_MOSI` | 11 / 17 | Display SPI |
| `EPD_CS` / `EPD_DC` / `EPD_RST` / `EPD_BUSY` | 12 / 13 / 14 / 21 | Display control |

## Build & Flash

```bash
source ~/esp/esp-idf/export.sh
idf.py set-target esp32s3
idf.py build
idf.py -p /dev/cu.usbserial-110 flash monitor
```

Uses the Arduino-ESP32 component (see `main/idf_component.yml`) and the shared
GxEPD2/Adafruit_GFX components from `software/components/`.
