# Onion OS

Onion OS is the production badge firmware. It links a physical OnionDAO badge
to an attendee profile through the Onion server, runs Lua scripts as apps, and
manages a Solana wallet for on-chain transactions.

Source: [`software/mods/onion-os/`](../software/mods/onion-os/)

---

## Architecture

Single-file ESP-IDF firmware (`main/main.cpp`, ~4000 lines) with Arduino as a
component. Dependencies: `arduino-esp32 3.3.8`, `espressif/lua ^5.5.0`,
`espressif/libsodium ^1.0.22`, `espressif/esp-cryptoauthlib ^3.7.7~5`.

### Boot Sequence

1. **Splash** — 3-second logo from `logo_bitmap.h`
2. **WiFi connect** — hardcoded to `CIC Guest` / `1nnovation` (15s timeout)
3. **MQTT connect** — `mqtt://shortline.proxy.rlwy.net:20928`
4. **Handshake** — POST to `/api/badge/handshake` + MQTT publish
5. **Home menu** — shows linked username, Onion balance, script explorer

### Persistent State (NVS)

Stored in the `nvs` flash partition, survives firmware updates:

| Key | Purpose |
|-----|---------|
| Hardware ID | Unique per-badge identifier (generated on first boot) |
| Link state | Whether badge is linked to an account |
| API key | Badge API key for authenticated endpoints |
| Wallet seed | XChaCha20-Poly1305 encrypted Ed25519 seed |
| Wallet address | Cached Solana public key |
| MQTT config | Broker URI, username, password, topic prefix |
| Module variant | L1/L2/R side-port wiring (default L1) |
| Script manifest URL | JSON manifest for Lua script downloads |

### Flash Layout

Same 8 MB partition table as other badge firmware:

| Partition | Offset | Size | Purpose |
|-----------|--------|------|---------|
| nvs | 0x9000 | 20 KB | Badge state (hardware ID, wallet, link) |
| app0 | 0x10000 | 3.2 MB | Onion OS firmware |
| app1 | 0x340000 | 3.2 MB | OTA update slot |
| spiffs | 0x670000 | 1.5 MB | Lua scripts + image assets |

---

## Badge Linking Flow

### Prerequisites
- Badge running Onion OS, connected to WiFi
- Attendee account on `oniondao.dev`

### Steps

1. Badge boots, connects to WiFi
2. Badge sends `POST /api/badge/handshake` with `hardwareId` + `firmware` version
3. Badge also publishes on MQTT topic `oniondao/badge/handshake`
4. Server responds with `onionId` + `status: "seen"`
5. Attendee logs into portal at `oniondao.dev/portal`
6. Attendee initiates link from the portal
7. Server sends link request via MQTT: `oniondao/badge/{onionId}/link/request`
8. Badge shows approval popup on e-paper (SELECT to approve, CANCEL to deny)
9. On approve: badge generates Ed25519 wallet, responds with `solanaPublicKey`
10. Server records wallet address, migrates points → tokens
11. Badge is now linked — home menu shows username and token balance

---

## Onion Economy

Onions exist in two modes depending on whether the attendee has linked a badge:

| Mode | Storage | Who Controls |
|------|---------|-------------|
| **Points** | Postgres `point_transactions` ledger | Server |
| **Tokens** | SPL tokens on Solana | Badge wallet |

External apps request burns or transfers via the API. The attendee approves in
the portal. If they have tokens, the badge signs the Solana transaction.

---

## Solana Key Custody

The ATECC608B does not support Ed25519. The badge uses a **software Ed25519 key**
with hardware-backed encryption:

- Seed generated on ESP32-S3
- Encrypted with **XChaCha20-Poly1305**
- Wrapping key derived from ATECC608B **HMAC slot 10**
- Never stored plaintext in flash
- NVS-backed — survives firmware updates, destroyed by flash erase

### CryptoAuthLib Config
- SDA: GPIO 10, SCL: GPIO 9
- Address: `0xC0` (8-bit) / `0x60` (7-bit)
- I2C speed: 100 kHz

### Backup

```bash
esptool.py --chip esp32s3 --port /dev/cu.usbserial-10 \
  read_flash 0x9000 0x5000 onion-os-nvs-backup.bin
```

The backup is badge-specific — the wallet seed is tied to that badge's ATECC608B.

---

## Lua Scripting

Custom apps are Lua scripts using the `onion.*` SDK. Scripts run in a sandboxed
Lua 5.5 environment with access to display, input, networking, and hardware.

### Deployment Methods

1. **Script manifest** — JSON manifest URL, badge downloads scripts to SPIFFS
2. **MQTT push** — portal sends script to badge, user approves popup
3. **Serial command** — `run <script_name.lua>` over UART

### Storage

- Scripts: `/scripts_*.lua` in SPIFFS (max 64 KB each)
- Images: `/images_*.pbm` or `/images_*.bmp` in SPIFFS (max 192 KB each)
- Total SPIFFS: 1.5 MB

### SDK Reference

#### Display (264x176 B&W e-paper)

| Function | Description |
|----------|-------------|
| `onion.display_size()` | Returns `{ width = 264, height = 176 }` |
| `onion.clear_display()` | Clears screen, Lua takes control |
| `onion.release_display()` | Returns screen to Onion OS |
| `onion.display_text(text, x, y, clear, font)` | Draw one text line |
| `onion.display_lines(lines, x, y, lineH, clear_or_opts)` | Draw table/string in one refresh |
| `onion.display_line(x0, y0, x1, y1, clear_or_opts)` | Draw a line |
| `onion.display_rect(x, y, w, h, clear_or_opts)` | Draw/fill rectangle |
| `onion.display_bitmap(name, x, y, clear)` | Draw PBM/BMP image (-1 to center) |
| `onion.images()` | List downloaded image asset names |

Display options: `{ clear, font, color, background }`.
Fonts: `"small"`, `"bold"`, `"large"`. Colors: `"black"`, `"white"`.

#### Input

| Function | Description |
|----------|-------------|
| `onion.buttons()` | Returns `{ left, down, up, right, select, cancel, mask }` |
| `onion.button_mask(name)` | Integer mask for a button name |
| `onion.sleep(ms)` | Pause script (max 60s) |

#### Identity & Security

| Function | Description |
|----------|-------------|
| `onion.hardware_id()` | Badge hardware ID string |
| `onion.onion_id()` | Current Onion ID (0 before handshake) |
| `onion.wallet()` | Solana public key, if configured |
| `onion.secure_random(count)` | ATECC608A hardware RNG (default 32, max 256 bytes) |
| `onion.log(message)` | Write to serial + e-paper status line |

#### ESP-NOW

| Function | Description |
|----------|-------------|
| `onion.espnow_start(channel)` | Enable ESP-NOW (channel optional with WiFi) |
| `onion.espnow_stop()` | Deinit ESP-NOW |
| `onion.espnow_mac()` | WiFi station MAC address |
| `onion.espnow_info()` | `{ started, mac, channel, sent, received, queued }` |
| `onion.espnow_send(payload, mac)` | Send 1-240 bytes (broadcast if no mac) |
| `onion.espnow_receive(timeout_ms)` | Receive packet (max 30s) |

#### HTTP

| Function | Description |
|----------|-------------|
| `onion.http_get(url, options)` | HTTPS GET, returns `{ status, body }` |
| `onion.http_post(url, body, options)` | HTTPS POST |

Options: `{ headers, content_type, timeout_ms }` (default 10s, max 30s).

#### MQTT

| Function | Description |
|----------|-------------|
| `onion.mqtt_connected()` | Bridge connection status |
| `onion.mqtt_subscribe(topic, qos)` | Subscribe (wildcards OK) |
| `onion.mqtt_unsubscribe(topic)` | Remove subscription |
| `onion.mqtt_publish(topic, payload, qos, retain)` | Publish message |
| `onion.mqtt_receive(timeout_ms)` | Next queued message (max 30s) |
| `onion.mqtt_info()` | `{ connected, uri, prefix, subscriptions, queued }` |

#### GPIO (side-port pins only)

| Function | Description |
|----------|-------------|
| `onion.gpio_read(pin, mode)` | Read expansion GPIO (0 or 1) |
| `onion.gpio_poll(pin, target, timeout, interval, mode)` | Poll until match |

Allowed pins: `48, 47, 19, 42, 41, 40, 38, 39, 16, 15, 7, 6, 5, 4`.
Mode: `"input"`, `"floating"`, `"pullup"`, `"pulldown"`.

#### CC1101 Sub-GHz Radio

| Function | Description |
|----------|-------------|
| `onion.subghz_begin(opts)` | Init radio (`freq`, `modulation`, pin overrides) |
| `onion.subghz_transmit(payload)` | Send 1-61 byte packet |
| `onion.subghz_receive(timeout_ms)` | Receive packet (max 30s) |
| `onion.subghz_set_frequency(mhz)` | Retune while running |
| `onion.subghz_info()` | `{ variant, active, frequency, version, partnum }` |
| `onion.subghz_end()` | Power down radio |

#### Sound Module

| Function | Description |
|----------|-------------|
| `onion.sound_speaker_begin(opts)` | Start I2S output |
| `onion.sound_play_tone(freq, duration, volume)` | Play sine tone |
| `onion.sound_play(pcm)` | Play raw 16-bit PCM (max 64 KB) |
| `onion.sound_speaker_end()` | Stop amplifier |
| `onion.sound_mic_begin(opts)` | Start PDM capture |
| `onion.sound_mic_read(num_samples)` | Read PCM samples (max 4096) |
| `onion.sound_mic_level(duration_ms)` | Returns `{ rms, peak, samples }` |
| `onion.sound_mic_end()` | Stop microphone |

CC1101 and Sound share pins — only one active at a time. Both power-gated
on GPIO18 and auto-cleaned when script ends.

---

## Server API

Base URL: `https://oniondao.dev`

### Public Endpoints (no auth)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/public/profile/{username}` | Profile + balance lookup |
| POST | `/api/public/onions/requests` | Create burn/transfer request |
| GET | `/api/public/onions/requests/{id}` | Request status |
| GET | `/api/public/lua-scripts` | Browse script registry |
| GET | `/api/public/lua-scripts/{id}` | Script detail + code |
| GET | `/api/public/lua-scripts/{id}/download` | Download .lua file |
| GET | `/api/public/usernames` | Search attendees |

### Portal Endpoints (session cookie)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/portal/lua-scripts` | Publish Lua script |
| POST | `/api/portal/lua-scripts/{id}/push` | Push script to linked badge |

### Badge Bridge (BADGE_API_KEY)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/badge/handshake` | Badge check-in |
| POST | `/api/badge/link-response` | Link approval + wallet |
| POST | `/api/badge/transaction-response` | Signed Solana transaction |
| POST | `/api/badge/lua-response` | Script push approval |
| GET | `/api/badge/profile/{onionId}` | Refresh owner profile |

---

## MQTT Topics

Prefix is configurable (default `oniondao`).

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `oniondao/badge/handshake` | badge → server | Badge check-in |
| `oniondao/badge/{onionId}/handshake/accepted` | server → badge | Handshake ack |
| `oniondao/badge/{onionId}/link/request` | server → badge | Link approval request |
| `oniondao/badge/{onionId}/transaction/request` | server → badge | Sign Solana tx |
| `oniondao/badge/{onionId}/lua/request` | server → badge | Push Lua script |

Badge publishes responses on corresponding `/response` topics + HTTP fallback.

---

## Serial Commands

Connect at 115200 baud via the CH340C USB-UART bridge.

| Command | Description |
|---------|-------------|
| `api-key <key>` | Set badge API key |
| `mqtt-auth [user] [pass] [prefix]` | Override MQTT credentials |
| `scripts-url <url>` | Set Lua script manifest URL |
| `module <L1\|L2\|R>` | Set side-port wiring variant |
| `wallet` | Show Solana wallet public key |
| `keygen confirm` | Generate new wallet (fails if already linked) |
| `handshake` | Trigger manual handshake |
| `scripts` | List installed scripts |
| `run <name.lua>` | Execute a Lua script |
| `delete <name.lua>` | Delete a script from SPIFFS |
| `state` | Show badge state (link, wallet, MQTT, WiFi) |
| `help` | List commands |

---

## Build & Flash

```bash
cd software/mods/onion-os
idf.py set-target esp32s3
idf.py build
idf.py -p /dev/cu.usbserial-10 flash monitor
```

Or use the helper script:

```bash
scripts/build-flash.sh --port /dev/cu.usbserial-10 --monitor
```

The helper refuses `--erase` to protect the NVS-backed wallet. Normal flash
updates only overwrite the app partition.

---

## Script Manifest

Serve a JSON manifest for badge script downloads:

```json
{
  "scripts": [
    { "name": "hello.lua", "url": "https://example.com/hello.lua", "autorun": false }
  ],
  "images": [
    { "name": "poster.pbm", "url": "https://example.com/poster.pbm" }
  ]
}
```

Images: 264x176 B&W. PBM (P1/P4) or uncompressed BMP (1/4/8/24/32-bit).
Max 192 KB per image.
