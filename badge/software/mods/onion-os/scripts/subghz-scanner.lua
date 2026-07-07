-- Ghost Key Scanner
-- UP/DOWN: freq  LEFT/RIGHT: mod  SELECT: replay  CANCEL: exit

local FREQS = {315.0, 433.92, 868.0, 915.0}
local MODS = {"ook", "gfsk", "2fsk", "msk"}
local FLBL = {"315.00", "433.92", "868.00", "915.00"}
local MLBL = {"OOK", "GFSK", "2FSK", "MSK"}
local TARGET = "\xCC\xAC\xCE\x55"

local fi = 2
local mi = 1
local count = 0
local caps = {}
local last_pay = nil
local found_key = false
local draw_time = 0

local function hex(s, n)
    n = n or 4
    local p = {}
    for i = 1, math.min(#s, n) do
        p[#p+1] = string.format("%02X", s:byte(i))
    end
    return table.concat(p, " ")
end

local function has_target(payload)
    return payload and payload:find(TARGET, 1, true)
end

local function init_radio()
    onion.subghz_end()
    return onion.subghz_begin({
        freq = FREQS[fi],
        modulation = MODS[mi]
    })
end

local function draw(ok, err)
    local l = {}

    l[1] = "GHOST KEY SCANNER"

    if ok then
        l[2] = FLBL[fi] .. " MHz " .. MLBL[mi]
    else
        l[2] = "ERR: " .. (err or "?")
    end

    l[3] = "Packets: " .. count

    if found_key then
        l[4] = "!! KEY FOUND !!"
        l[5] = "TARGET: CCACCE55"
        l[6] = "Press SEL to replay"
    elseif #caps > 0 then
        local start = math.max(1, #caps - 2)
        local row = 4
        for i = start, #caps do
            local c = caps[i]
            local tag = c.match and "*" or " "
            l[row] = tag .. c.rssi .. "dB "
                .. hex(c.payload, 3)
            row = row + 1
        end
    else
        l[4] = "Listening..."
    end

    while #l < 7 do l[#l+1] = "" end
    l[8] = "UD:frq LR:mod S:tx"

    onion.display_lines(l, 0, 14, 20,
        {font = "small", clear = true})
end

local ok, err = init_radio()
draw(ok, err)
draw_time = os.clock()

local last = onion.buttons()
local dirty = false

while true do
    local btn = onion.buttons()

    if btn.cancel and not last.cancel then
        break
    end

    if btn.up and not last.up then
        fi = fi > 1 and fi - 1 or #FREQS
        ok, err = init_radio()
        dirty = true
    elseif btn.down and not last.down then
        fi = fi < #FREQS and fi + 1 or 1
        ok, err = init_radio()
        dirty = true
    end

    if btn.left and not last.left then
        mi = mi > 1 and mi - 1 or #MODS
        ok, err = init_radio()
        dirty = true
    elseif btn.right and not last.right then
        mi = mi < #MODS and mi + 1 or 1
        ok, err = init_radio()
        dirty = true
    end

    if btn.select and not last.select
        and last_pay then
        onion.subghz_transmit(last_pay)
    end

    last = btn

    if ok then
        local pkt = onion.subghz_receive(200)
        if pkt then
            count = count + 1
            last_pay = pkt.payload
            local m = has_target(pkt.payload)
            if m then found_key = true end
            caps[#caps+1] = {
                rssi = pkt.rssi_dbm,
                payload = pkt.payload,
                match = m
            }
            if #caps > 20 then
                table.remove(caps, 1)
            end
            dirty = true
        end
    else
        onion.sleep(200)
    end

    local now = os.clock()
    if dirty and (now - draw_time) >= 2.0 then
        draw(ok, err)
        draw_time = now
        dirty = false
    end

    onion.sleep(50)
end

onion.subghz_end()
onion.release_display()
