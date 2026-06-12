# Anti-Patterns

## NEVER drive GPIO0 as output without releasing it
GPIO0 is the BOOT mode select strapping pin. If firmware reconfigures it as an
output and doesn't release it to input before the next reset, the auto-flash
workflow breaks. User must hold BOOT manually to recover.

## NEVER talk to power-gated peripherals without asserting GPIO18
The display, RF module, audio module, and secure element are on the switched PWR
rail. Assert GPIO18 HIGH and wait for POR (a few ms) before any SPI/I2C traffic.
Forgetting this produces silent failures — the peripheral appears dead.

## NEVER assume PSRAM is available without enabling Octal mode
The R8 PSRAM is Octal-SPI. It stays completely invisible to the firmware unless
you explicitly select Octal mode in sdkconfig. Quad mode will not detect it.
Set: `CONFIG_SPIRAM_MODE_OCT=y` in sdkconfig.defaults.

## NEVER use GPIO3, GPIO45, or GPIO46 for general I/O
GPIO3 is the JTAG signal source strapping pin. GPIO45 and GPIO46 are factory-set
(VDD_SPI voltage and boot ROM messages). Driving them causes unpredictable boot
behavior.

## NEVER initialize both CC1101 and Sound module peripherals simultaneously
They share the same physical pins. Initialize only the one that's actually
installed. Gate behind runtime detection (try reading CC1101 PARTNUM register)
or compile-time define.

## NEVER hardcode GPIO numbers — use pin names from PINOUT.md
Use `PBINT`, `SE_EN`, `PWR`, `SCL`, `SDA` etc. Makes code greppable and
cross-referenceable with the hardware docs.

## NEVER skip JWT/auth on ESPNow or wireless features
The badge has ATECC608B hardware signing. Use it for beacon authentication.
Unsigned beacons can be spoofed trivially.

## NEVER leave SE_EN (GPIO8) HIGH during deep sleep
The ATECC608B draws power when enabled. Gate it off (GPIO8 LOW) before entering
any low-power mode. Same for PWR (GPIO18) — drop both rails.

## NEVER assume I2C address 0x60 for ATECC608B
The address is set in the chip's config zone and can vary per board revision.
Default shipped boards use 0xC0 (7-bit 0x60), but always confirm with a bus scan
before hardcoding.

## NEVER run `idf.py erase-flash` on a badge with a linked wallet
The Solana wallet seed is stored encrypted in NVS. A full flash erase destroys
it permanently — the wallet cannot be recovered even with the ATECC608B because
the encrypted seed is gone. Normal `idf.py flash` only overwrites the app
partition and preserves NVS.

## NEVER build custom badge apps as standalone ESP-IDF firmware
Onion OS is the production firmware with WiFi, MQTT, wallet, and Lua engine.
Custom apps should be Lua scripts using the `onion.*` SDK. Standalone firmware
replaces the OS and loses linking, wallet, and server connectivity.

## NEVER store secrets in Lua scripts
Lua scripts are stored in plaintext on SPIFFS. API keys, passwords, and private
keys belong in NVS via serial commands (`api-key`, `mqtt-auth`), not in script
source code.
