import zlib
import struct
import math

def create_png_bytes(width, height, is_maskable=False):
    lines = []
    
    # Theme colors: Blue gradient #2563eb to #1d4ed8
    cx, cy = width / 2.0, height / 2.0
    corner_radius = width * (0.5 if is_maskable else 0.22)
    box_padding = 0 if is_maskable else width * 0.06
    box_w = width - 2 * box_padding
    box_h = height - 2 * box_padding

    for y in range(height):
        row = bytearray([0]) # PNG filter byte
        for x in range(width):
            # Calculate distance to squircle / rounded rect
            if is_maskable:
                # Maskable fills entire canvas with safe zone
                in_card = True
                alpha = 1.0
            else:
                # Rounded rectangle distance
                rx = max(0.0, abs(x - cx) - (box_w/2.0 - corner_radius))
                ry = max(0.0, abs(y - cy) - (box_h/2.0 - corner_radius))
                d = math.sqrt(rx*rx + ry*ry)
                if d <= corner_radius - 1.0:
                    alpha = 1.0
                    in_card = True
                elif d <= corner_radius + 1.0:
                    alpha = max(0.0, min(1.0, (corner_radius + 1.0 - d) / 2.0))
                    in_card = True
                else:
                    in_card = False
                    alpha = 0.0

            if not in_card or alpha <= 0.001:
                row.extend([0, 0, 0, 0])
                continue

            # Gradient from top-left (#3b82f6) to bottom-right (#1d4ed8)
            t = (x / width + y / height) / 2.0
            r = int(59 * (1 - t) + 29 * t)
            g = int(130 * (1 - t) + 78 * t)
            b = int(246 * (1 - t) + 216 * t)

            # Draw central symbol 'L' / translation mark
            nx = (x - cx) / (width * (0.6 if is_maskable else 0.7))
            ny = (y - cy) / (height * (0.6 if is_maskable else 0.7))

            # Left letter 'A'
            is_symbol = False
            # Check if inside symbol area
            if -0.38 <= nx <= -0.05 and -0.32 <= ny <= 0.32:
                # A shape: left leg, right leg, crossbar
                leg1 = abs((nx - (-0.22)) - (-ny * 0.45)) < 0.04
                leg2 = abs((nx - (-0.22)) - (ny * 0.45)) < 0.04
                bar = abs(ny - 0.08) < 0.035 and (-0.30 <= nx <= -0.14)
                if (leg1 or leg2 or bar) and ny >= -0.28:
                    is_symbol = True

            # Right character '文' stylized strokes
            if 0.05 <= nx <= 0.42 and -0.32 <= ny <= 0.32:
                top_dot = abs(nx - 0.23) < 0.04 and -0.30 <= ny <= -0.15
                horiz_bar = abs(ny - (-0.12)) < 0.035 and (0.08 <= nx <= 0.38)
                stroke_left = abs((nx - 0.23) + (ny + 0.12) * 0.6) < 0.04 and ny >= -0.12
                stroke_right = abs((nx - 0.23) - (ny + 0.12) * 0.6) < 0.04 and ny >= -0.12
                if top_dot or horiz_bar or stroke_left or stroke_right:
                    is_symbol = True

            # Center arrows
            if -0.05 < nx < 0.05 and abs(ny) < 0.05:
                is_symbol = True

            if is_symbol:
                # Bright white with subtle gradient
                sr, sg, sb = 255, 255, 255
                row.extend([sr, sg, sb, int(255 * alpha)])
            else:
                row.extend([r, g, b, int(255 * alpha)])

        lines.append(bytes(row))

    raw_data = b"".join(lines)
    compressed = zlib.compress(raw_data)

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", compressed)
    png += chunk(b"IEND", b"")
    return png

# Generate icons
icons = [
    ("public/pwa-192x192.png", 192, 192, False),
    ("public/pwa-512x512.png", 512, 512, False),
    ("public/pwa-maskable-512x512.png", 512, 512, True),
    ("public/apple-touch-icon.png", 180, 180, False),
    ("public/favicon-32x32.png", 32, 32, False),
]

for path, w, h, maskable in icons:
    data = create_png_bytes(w, h, is_maskable=maskable)
    with open(path, "wb") as f:
        f.write(data)
    print(f"Generated {path} ({w}x{h})")

# Copy 32x32 to favicon.ico
with open("public/favicon.ico", "wb") as f:
    with open("public/favicon-32x32.png", "rb") as src:
        f.write(src.read())
print("Generated public/favicon.ico")
