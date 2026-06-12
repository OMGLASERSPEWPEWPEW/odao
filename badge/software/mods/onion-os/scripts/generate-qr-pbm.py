#!/usr/bin/env python3
"""Generate a P4 binary PBM QR code for the badge e-ink display (264x176)."""

import struct
import sys
from pathlib import Path

try:
    import qrcode
except ImportError:
    sys.exit("pip install qrcode")

URL = "https://glyffiti-mobile.vercel.app/"
DISPLAY_W, DISPLAY_H = 264, 176
MARGIN = 10

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0)
qr.add_data(URL)
qr.make(fit=True)
matrix = qr.get_matrix()
size = len(matrix)

scale = (DISPLAY_H - 2 * MARGIN) // size
qr_px = size * scale
offset_x = (DISPLAY_W - qr_px) // 2
offset_y = (DISPLAY_H - qr_px) // 2

out = Path(__file__).resolve().parent.parent / "data" / "images_glyffiti-qr.pbm"
out.parent.mkdir(parents=True, exist_ok=True)

with open(out, "wb") as f:
    header = f"P4\n{DISPLAY_W} {DISPLAY_H}\n".encode()
    f.write(header)
    row_bytes = (DISPLAY_W + 7) // 8
    for y in range(DISPLAY_H):
        row = bytearray(row_bytes)
        qr_y = (y - offset_y) // scale if offset_y <= y < offset_y + qr_px else -1
        for x in range(DISPLAY_W):
            qr_x = (x - offset_x) // scale if offset_x <= x < offset_x + qr_px else -1
            if 0 <= qr_x < size and 0 <= qr_y < size and matrix[qr_y][qr_x]:
                row[x // 8] |= 0x80 >> (x % 8)
        f.write(bytes(row))

print(f"Wrote {out} ({out.stat().st_size} bytes, {DISPLAY_W}x{DISPLAY_H}, scale={scale})")
