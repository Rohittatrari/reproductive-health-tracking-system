import os
import math
from PIL import Image, ImageDraw

def create_app_icon(size):
    # Create image with RGBA
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Rounded Squircle with Gradient
    corner_radius = int(size * 0.25)
    
    # Generate vertical/diagonal gradient
    grad_img = Image.new("RGBA", (size, size))
    for y in range(size):
        ratio = y / size
        # From #8B5CF6 (139, 92, 246) through #7C3AED (124, 58, 237) to #EC4899 (236, 72, 153)
        if ratio < 0.5:
            sub_r = ratio / 0.5
            r = int(139 + (124 - 139) * sub_r)
            g = int(92 + (58 - 92) * sub_r)
            b = int(246 + (237 - 246) * sub_r)
        else:
            sub_r = (ratio - 0.5) / 0.5
            r = int(124 + (236 - 124) * sub_r)
            g = int(58 + (72 - 58) * sub_r)
            b = int(237 + (153 - 237) * sub_r)
        for x in range(size):
            grad_img.putpixel((x, y), (r, g, b, 255))

    # Mask for rounded corners
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=corner_radius, fill=255)

    img.paste(grad_img, (0, 0), mask)

    # Re-obtain draw object on composite image
    draw = ImageDraw.Draw(img)

    # 2. Draw Lotus Petals
    cx = size / 2.0
    cy = size * 0.56
    scale = size / 512.0

    # Outer Petals (soft translucent white)
    left_outer = [
        (cx, cy + 20 * scale),
        (cx - 70 * scale, cy + 25 * scale),
        (cx - 150 * scale, cy - 10 * scale),
        (cx - 130 * scale, cy - 60 * scale),
        (cx - 60 * scale, cy - 10 * scale),
    ]
    draw.polygon(left_outer, fill=(255, 255, 255, 180))

    right_outer = [
        (cx, cy + 20 * scale),
        (cx + 70 * scale, cy + 25 * scale),
        (cx + 150 * scale, cy - 10 * scale),
        (cx + 130 * scale, cy - 60 * scale),
        (cx + 60 * scale, cy - 10 * scale),
    ]
    draw.polygon(right_outer, fill=(255, 255, 255, 180))

    # Intermediate Petals
    left_mid = [
        (cx, cy + 15 * scale),
        (cx - 50 * scale, cy + 10 * scale),
        (cx - 110 * scale, cy - 60 * scale),
        (cx - 90 * scale, cy - 110 * scale),
        (cx - 40 * scale, cy - 50 * scale),
    ]
    draw.polygon(left_mid, fill=(255, 255, 255, 220))

    right_mid = [
        (cx, cy + 15 * scale),
        (cx + 50 * scale, cy + 10 * scale),
        (cx + 110 * scale, cy - 60 * scale),
        (cx + 90 * scale, cy - 110 * scale),
        (cx + 40 * scale, cy - 50 * scale),
    ]
    draw.polygon(right_mid, fill=(255, 255, 255, 220))

    # Center Main Petal (Solid White & Bright)
    center_petal = [
        (cx, cy + 20 * scale),
        (cx - 45 * scale, cy - 20 * scale),
        (cx - 40 * scale, cy - 100 * scale),
        (cx, cy - 170 * scale),
        (cx + 40 * scale, cy - 100 * scale),
        (cx + 45 * scale, cy - 20 * scale),
    ]
    draw.polygon(center_petal, fill=(255, 255, 255, 255))

    # Center Radiant Glowing Droplet (Health / Cycle core)
    core_r = 16 * scale
    draw.ellipse(
        [cx - core_r, cy - 30 * scale - core_r, cx + core_r, cy - 30 * scale + core_r],
        fill=(244, 63, 94, 255) # Rose 500
    )

    # 3. Sparkle Icon (Top Right)
    sx = size * 0.76
    sy = size * 0.22
    sw = 28 * scale
    sparkle_pts = [
        (sx, sy - sw),
        (sx + sw * 0.3, sy - sw * 0.3),
        (sx + sw, sy),
        (sx + sw * 0.3, sy + sw * 0.3),
        (sx, sy + sw),
        (sx - sw * 0.3, sy + sw * 0.3),
        (sx - sw, sy),
        (sx - sw * 0.3, sy - sw * 0.3),
    ]
    draw.polygon(sparkle_pts, fill=(255, 255, 255, 240))

    return img

os.makedirs("frontend/public", exist_ok=True)

# Generate 512x512
img512 = create_app_icon(512)
img512.save("frontend/public/icon-512.png", "PNG")
print("Saved frontend/public/icon-512.png")

# Generate 192x192
img192 = create_app_icon(192)
img192.save("frontend/public/icon-192.png", "PNG")
print("Saved frontend/public/icon-192.png")

# Generate Apple Touch Icon (180x180)
img180 = create_app_icon(180)
img180.save("frontend/public/apple-touch-icon.png", "PNG")
print("Saved frontend/public/apple-touch-icon.png")

# Generate Favicon (64x64)
img64 = create_app_icon(64)
img64.save("frontend/public/favicon.png", "PNG")
print("Saved frontend/public/favicon.png")
