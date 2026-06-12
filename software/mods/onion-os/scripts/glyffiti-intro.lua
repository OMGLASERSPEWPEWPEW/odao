-- Glyffiti intro slideshow — 5 screens with button skip.
-- Loops continuously. Press any button to advance to the next screen.

local SIZE = onion.display_size()

local function wait_or_skip(ms)
    local deadline = ms
    local start = 0
    while onion.buttons().mask ~= 0 and start < deadline do
        onion.sleep(50)
        start = start + 50
    end
    local elapsed = start
    while elapsed < deadline do
        local b = onion.buttons()
        if b.mask ~= 0 then return true end
        onion.sleep(80)
        elapsed = elapsed + 80
    end
    return false
end

-- Screen 1: Hello World / I'm Darklight
local function screen_hello()
    onion.display_text("Hello World", 16, 70, true, "large")
    onion.display_text("I'm Darklight", 60, 110, false, "bold")
end

-- Screen 2: Glyffiti for Artists
local function screen_artists()
    onion.display_text("GLYFFITI", 60, 28, true, "large")
    onion.display_text("for artists", 70, 52, false, "bold")
    onion.display_line(20, 62, SIZE.width - 20, 62, { clear = false })
    onion.display_lines({
        "Publish your art to the",
        "blockchain. Permanently",
        "yours -- no platform",
        "can take it down."
    }, 14, 82, 20, { font = "bold", clear = false })
end

-- Screen 3: Glyffiti for Engineers
local function screen_engineers()
    onion.display_text("GLYFFITI", 60, 28, true, "large")
    onion.display_text("for engineers", 52, 52, false, "bold")
    onion.display_line(20, 62, SIZE.width - 20, 62, { clear = false })
    onion.display_lines({
        "On-chain publishing on",
        "Solana in 566-byte memo",
        "limits via CBOR. React",
        "PWA + Supabase + WebRTC."
    }, 14, 82, 20, { font = "bold", clear = false })
end

-- Screen 4: Call to Action
local function screen_cta()
    onion.display_text("Want to help?", 30, 32, true, "bold")
    onion.display_line(20, 44, SIZE.width - 20, 44, { clear = false })
    onion.display_lines({
        "Create an account:",
        "",
        "glyffiti-mobile",
        "  .vercel.app",
        "",
        "        scan  -->"
    }, 20, 68, 18, { font = "bold", clear = false })
end

-- Screen 5: QR code
local function screen_qr()
    local ok = onion.display_bitmap("glyffiti-qr.pbm", -1, -1, true)
    if not ok then
        onion.display_lines({
            "glyffiti-mobile",
            "  .vercel.app"
        }, 30, 70, 24, { font = "bold", clear = true })
    end
end

local screens = { screen_hello, screen_artists, screen_engineers, screen_cta, screen_qr }
local hold_ms = { 3000, 5000, 5000, 5000, 10000 }

while true do
    for i = 1, #screens do
        screens[i]()
        wait_or_skip(hold_ms[i])
    end
end
