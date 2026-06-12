#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include <GxEPD2_BW.h>
#include <gdey/GxEPD2_270_GDEY027T91.h>
#include <Fonts/FreeMonoBold9pt7b.h>
#include <Fonts/FreeSans9pt7b.h>
#include <Fonts/FreeSansBold12pt7b.h>
#include "badge_pins.h"

extern "C" {
#include "qrcodegen.h"
}

// --- Display ---
GxEPD2_BW<GxEPD2_270_GDEY027T91, GxEPD2_270_GDEY027T91::HEIGHT> display(
    GxEPD2_270_GDEY027T91(PIN_EPD_CS, PIN_EPD_DC, PIN_EPD_RST, PIN_EPD_BUSY));

static const int SCREEN_W = 264;
static const int SCREEN_H = 176;

// --- TCA9534 button expander ---
static const uint8_t TCA9534_ADDR = 0x20;
static const uint8_t TCA9534_INPUT_REG = 0x00;

static bool anyButtonPressed() {
    Wire.beginTransmission(TCA9534_ADDR);
    Wire.write(TCA9534_INPUT_REG);
    if (Wire.endTransmission() != 0) return false;
    Wire.requestFrom(TCA9534_ADDR, (uint8_t)1);
    if (!Wire.available()) return false;
    uint8_t val = Wire.read();
    // Buttons pull bits LOW when pressed (bits 0-5 = PB1-PB6)
    return (val & 0x3F) != 0x3F;
}

// Wait for ms, return true if a button was pressed during the wait
static bool waitWithSkip(unsigned long ms) {
    unsigned long start = millis();
    // Debounce: wait for button release first
    while (anyButtonPressed() && (millis() - start < ms)) {
        delay(10);
    }
    while (millis() - start < ms) {
        if (anyButtonPressed()) {
            // Debounce
            delay(50);
            if (anyButtonPressed()) return true;
        }
        delay(20);
    }
    return false;
}

// --- Screen 1: Hello World / I'm Darklight (typewriter) ---
static void screenHello() {
    static const char* LINE1 = "Hello World";
    static const char* LINE2 = "I'm Darklight";

    display.setFullWindow();
    display.firstPage();
    do {
        display.fillScreen(GxEPD_WHITE);
    } while (display.nextPage());

    display.setFont(&FreeMonoBold9pt7b);
    display.setTextColor(GxEPD_BLACK);

    int y1 = 80, y2 = 105;

    int len1 = strlen(LINE1);
    char buf[32];
    for (int i = 1; i <= len1; i++) {
        strncpy(buf, LINE1, i);
        buf[i] = '\0';
        display.setPartialWindow(0, y1 - 16, SCREEN_W, 24);
        display.firstPage();
        do {
            display.fillScreen(GxEPD_WHITE);
            display.setCursor(10, y1);
            display.print(buf);
        } while (display.nextPage());
        if (anyButtonPressed()) break;
    }

    display.setPartialWindow(0, y2 - 16, SCREEN_W, 24);
    display.firstPage();
    do {
        display.fillScreen(GxEPD_WHITE);
        display.setCursor(10, y2);
        display.print(LINE2);
    } while (display.nextPage());
}

// --- Helper: draw wrapped text with a given font ---
static void drawWrapped(const GFXfont* font, const char* text,
                        int x, int y, int maxW, int lineH) {
    display.setFont(font);
    display.setTextColor(GxEPD_BLACK);

    char buf[256];
    strncpy(buf, text, sizeof(buf) - 1);
    buf[sizeof(buf) - 1] = '\0';

    int cx = x, cy = y;
    char* word = strtok(buf, " ");
    while (word) {
        int16_t bx, by;
        uint16_t bw, bh;
        display.getTextBounds(word, 0, 0, &bx, &by, &bw, &bh);
        int spaceW = 7; // approximate space width

        if (cx + (int)bw > x + maxW && cx > x) {
            cx = x;
            cy += lineH;
        }
        display.setCursor(cx, cy);
        display.print(word);
        cx += bw + spaceW;
        word = strtok(NULL, " ");
    }
}

// --- Screen 2: Glyffiti for Artists ---
static void screenArtists() {
    display.setFullWindow();
    display.firstPage();
    do {
        display.fillScreen(GxEPD_WHITE);

        display.setFont(&FreeSansBold12pt7b);
        display.setTextColor(GxEPD_BLACK);
        display.setCursor(50, 30);
        display.print("GLYFFITI");

        display.setFont(&FreeMonoBold9pt7b);
        display.setCursor(78, 52);
        display.print("for artists");

        // Horizontal rule
        display.drawLine(20, 62, SCREEN_W - 20, 62, GxEPD_BLACK);

        drawWrapped(&FreeSans9pt7b,
            "Publish your art directly to the blockchain. "
            "Permanently yours -- no platform can ever take it down.",
            20, 85, SCREEN_W - 40, 22);

    } while (display.nextPage());
}

// --- Screen 3: Glyffiti for Engineers ---
static void screenEngineers() {
    display.setFullWindow();
    display.firstPage();
    do {
        display.fillScreen(GxEPD_WHITE);

        display.setFont(&FreeSansBold12pt7b);
        display.setTextColor(GxEPD_BLACK);
        display.setCursor(50, 30);
        display.print("GLYFFITI");

        display.setFont(&FreeMonoBold9pt7b);
        display.setCursor(60, 52);
        display.print("for engineers");

        display.drawLine(20, 62, SCREEN_W - 20, 62, GxEPD_BLACK);

        drawWrapped(&FreeSans9pt7b,
            "On-chain publishing on Solana within 566-byte memo limits "
            "using CBOR compression. React 19 PWA + Supabase + WebRTC mesh.",
            20, 85, SCREEN_W - 40, 22);

    } while (display.nextPage());
}

// --- Screen 4: Call to Action ---
static void screenCTA() {
    display.setFullWindow();
    display.firstPage();
    do {
        display.fillScreen(GxEPD_WHITE);

        display.setFont(&FreeSansBold12pt7b);
        display.setTextColor(GxEPD_BLACK);
        display.setCursor(22, 40);
        display.print("Want to help?");

        display.drawLine(20, 52, SCREEN_W - 20, 52, GxEPD_BLACK);

        display.setFont(&FreeSans9pt7b);
        display.setCursor(30, 80);
        display.print("Create an account at:");

        display.setFont(&FreeMonoBold9pt7b);
        display.setCursor(10, 115);
        display.print("glyffiti-mobile");
        display.setCursor(40, 140);
        display.print(".vercel.app");

        // Arrow pointing right (next screen has QR)
        display.setCursor(200, 165);
        display.setFont(&FreeSans9pt7b);
        display.print("scan ->");

    } while (display.nextPage());
}

// --- Screen 5: QR Code ---
static void screenQR() {
    static const char* URL = "https://glyffiti-mobile.vercel.app/";

    uint8_t qrcode[qrcodegen_BUFFER_LEN_MAX];
    uint8_t tempBuf[qrcodegen_BUFFER_LEN_MAX];

    bool ok = qrcodegen_encodeText(URL, tempBuf, qrcode,
        qrcodegen_Ecc_MEDIUM, qrcodegen_VERSION_MIN, qrcodegen_VERSION_MAX,
        qrcodegen_Mask_AUTO, true);

    display.setFullWindow();
    display.firstPage();
    do {
        display.fillScreen(GxEPD_WHITE);

        if (!ok) {
            display.setFont(&FreeMonoBold9pt7b);
            display.setTextColor(GxEPD_BLACK);
            display.setCursor(20, 90);
            display.print("QR error");
            return;
        }

        int size = qrcodegen_getSize(qrcode);
        int scale = (SCREEN_H - 20) / size; // fit height with margin
        if (scale < 1) scale = 1;
        int qrPx = size * scale;
        int offsetX = (SCREEN_W - qrPx) / 2;
        int offsetY = (SCREEN_H - qrPx) / 2;

        for (int y = 0; y < size; y++) {
            for (int x = 0; x < size; x++) {
                if (qrcodegen_getModule(qrcode, x, y)) {
                    display.fillRect(offsetX + x * scale, offsetY + y * scale,
                                     scale, scale, GxEPD_BLACK);
                }
            }
        }
    } while (display.nextPage());
}

// --- Main ---

void setup() {
    Serial.begin(115200);
    Serial.println("[darklight] booting...");

    pinMode(PIN_PWR, OUTPUT);
    digitalWrite(PIN_PWR, HIGH);

    Wire.begin(PIN_SDA, PIN_SCL);

    // Configure TCA9534: all pins as inputs
    Wire.beginTransmission(TCA9534_ADDR);
    Wire.write(0x03); // config register
    Wire.write(0xFF); // all inputs
    Wire.endTransmission();

    SPI.begin(PIN_EPD_SCK, -1, PIN_EPD_MOSI, PIN_EPD_CS);
    display.init(115200, true, 10, false);
    display.setRotation(1);
}

void loop() {
    // Screen 1: Hello World / I'm Darklight
    screenHello();
    if (waitWithSkip(3000)) { /* skip */ }

    // Screen 2: Glyffiti for Artists (5 seconds)
    screenArtists();
    if (waitWithSkip(5000)) { /* skip */ }

    // Screen 3: Glyffiti for Engineers (5 seconds)
    screenEngineers();
    if (waitWithSkip(5000)) { /* skip */ }

    // Screen 4: Call to Action (5 seconds)
    screenCTA();
    if (waitWithSkip(5000)) { /* skip */ }

    // Screen 5: QR Code (10 seconds, longer so people can scan)
    screenQR();
    if (waitWithSkip(10000)) { /* skip */ }
}
