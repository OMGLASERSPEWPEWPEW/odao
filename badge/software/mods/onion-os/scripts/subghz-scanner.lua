-- Sub-GHz scanner with SPIFFS logging.
-- UP/DOWN: frequency  LEFT/RIGHT: modulation  SELECT: replay  CANCEL: exit

local FREQS = { 315.0, 433.92, 868.0, 915.0 }
local MODS  = { "ook", "gfsk", "2fsk", "msk" }
local FREQ_LABELS = { "315.00", "433.92", "868.00", "915.00" }

local freq_idx = 2
local mod_idx  = 1
local pkt_count = 0
local log_bytes = 0
local captures = {}
local last_payload = nil
local log_file = nil
local t0 = 0
local clock_ok, clock_val = pcall(os.clock)
if clock_ok then t0 = clock_val end

onion.log("scanner: init start")
local SIZE = onion.display_size()

local function to_hex(s)
    local parts = {}
    for i = 1, #s do
        parts[#parts + 1] = string.format("%02X", string.byte(s, i))
    end
    return table.concat(parts, " ")
end

local function short_hex(s, max_bytes)
    max_bytes = max_bytes or 8
    local parts = {}
    local n = math.min(#s, max_bytes)
    for i = 1, n do
        parts[#parts + 1] = string.format("%02X", string.byte(s, i))
    end
    if #s > max_bytes then parts[#parts + 1] = ".." end
    return table.concat(parts, " ")
end

local function flat_hex(s)
    local parts = {}
    for i = 1, #s do
        parts[#parts + 1] = string.format("%02X", string.byte(s, i))
    end
    return table.concat(parts, "")
end

local function open_log()
    local ok, f = pcall(io.open, "/spiffs/scan_log.txt", "a")
    if ok and f then
        local info = f:seek("end")
        log_bytes = info or 0
        log_file = f
        onion.log("scanner: log open " .. log_bytes .. "B")
    else
        onion.log("scanner: log failed")
    end
end

local function log_packet(pkt, freq, mod)
    if not log_file then return end
    local t = os.clock() - t0
    local line = string.format("T=%.1f F=%.2f M=%s RSSI=%d LEN=%d HEX=%s\n",
        t, freq, mod, pkt.rssi_dbm, pkt.len, flat_hex(pkt.payload))
    log_file:write(line)
    log_file:flush()
    log_bytes = log_bytes + #line
end

local function close_log()
    if log_file then
        log_file:close()
        log_file = nil
    end
end

local function fmt_log_size()
    if log_bytes < 1024 then return log_bytes .. "B" end
    return string.format("%.1fKB", log_bytes / 1024)
end

local function init_radio()
    onion.subghz_end()
    local ok, err = onion.subghz_begin({
        freq = FREQS[freq_idx],
        modulation = MODS[mod_idx]
    })
    return ok, err
end

local function draw_ui()
    local header = string.format("%s MHz  %s",
        FREQ_LABELS[freq_idx], string.upper(MODS[mod_idx]))
    local stats = string.format("#%d  log:%s", pkt_count, fmt_log_size())

    local lines = {
        "SUB-GHZ SCANNER",
        header .. "  " .. stats,
    }

    local start = math.max(1, #captures - 4)
    for i = start, #captures do
        local c = captures[i]
        local entry = string.format("#%d %ddBm %dB %s",
            c.num, c.rssi, c.len, short_hex(c.payload, 6))
        lines[#lines + 1] = entry
    end

    while #lines < 8 do
        lines[#lines + 1] = ""
    end
    lines[#lines + 1] = "U/D:freq L/R:mod SEL:tx"

    onion.display_lines(lines, 4, 16, 18, { font = "small", clear = true })
end

local function draw_error(msg)
    onion.display_lines({
        "SUB-GHZ SCANNER",
        "",
        "Radio error:",
        msg or "unknown",
        "",
        "Try another freq/mod",
        "",
        "U/D:freq L/R:mod CAN:exit"
    }, 4, 16, 18, { font = "small", clear = true })
end

-- Init
open_log()
onion.log("scanner: radio init")
local ok, err = init_radio()
onion.log("scanner: radio=" .. tostring(ok) .. " err=" .. tostring(err))
if ok then
    draw_ui()
else
    draw_error(err)
end

onion.log("scanner: entering loop")
local last = onion.buttons()
onion.log("scanner: btns cancel=" .. tostring(last.cancel))
local needs_redraw = false
local loops = 0

while true do
    loops = loops + 1
    local btn = onion.buttons()

    if btn.cancel and not last.cancel then
        onion.log("scanner: cancel at loop " .. loops)
        break
    end

    if btn.up and not last.up then
        freq_idx = freq_idx - 1
        if freq_idx < 1 then freq_idx = #FREQS end
        ok, err = init_radio()
        needs_redraw = true
    elseif btn.down and not last.down then
        freq_idx = freq_idx + 1
        if freq_idx > #FREQS then freq_idx = 1 end
        ok, err = init_radio()
        needs_redraw = true
    end

    if btn.left and not last.left then
        mod_idx = mod_idx - 1
        if mod_idx < 1 then mod_idx = #MODS end
        ok, err = init_radio()
        needs_redraw = true
    elseif btn.right and not last.right then
        mod_idx = mod_idx + 1
        if mod_idx > #MODS then mod_idx = 1 end
        ok, err = init_radio()
        needs_redraw = true
    end

    if btn.select and not last.select and last_payload then
        onion.subghz_transmit(last_payload)
    end

    last = btn

    if ok then
        local pkt = onion.subghz_receive(200)
        if pkt then
            pkt_count = pkt_count + 1
            last_payload = pkt.payload
            captures[#captures + 1] = {
                num = pkt_count,
                rssi = pkt.rssi_dbm,
                len = pkt.len,
                payload = pkt.payload
            }
            if #captures > 50 then
                table.remove(captures, 1)
            end
            log_packet(pkt, FREQS[freq_idx], MODS[mod_idx])
            needs_redraw = true
        end
    else
        onion.sleep(200)
    end

    if needs_redraw then
        if ok then
            draw_ui()
        else
            draw_error(err)
        end
        needs_redraw = false
    end

    onion.sleep(50)
end

close_log()
onion.subghz_end()
onion.release_display()
