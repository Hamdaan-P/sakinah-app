"""
Generate two realistic human silhouette placeholder photos.
Run once: python generate_sample_photos.py
Requires: pip install Pillow
"""
import os
from PIL import Image, ImageDraw

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(SCRIPT_DIR, 'seed_assets')
os.makedirs(ASSETS_DIR, exist_ok=True)

SIZE = 400


# ── helpers ──────────────────────────────────────────────────────────────────

def ellipse(draw, cx, cy, w, h, fill):
    """Draw a filled ellipse from center + dimensions."""
    draw.ellipse([cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2], fill=fill)


def _rounded_rect(draw, left, top, right, bottom, radius, fill):
    """Rounded rectangle — uses built-in if Pillow >= 8.2, else plain rect."""
    try:
        draw.rounded_rectangle([left, top, right, bottom], radius=radius, fill=fill)
    except AttributeError:
        draw.rectangle([left, top, right, bottom], fill=fill)


def _curve_points(x0, y0, x1, y1, cx, cy, steps=20):
    """Return (steps) points along a quadratic Bezier from (x0,y0) to (x1,y1)
    with control point (cx,cy), for simulating curved strokes."""
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1
        y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1
        pts.append((x, y))
    return pts


# ── male ─────────────────────────────────────────────────────────────────────

def make_male() -> Image.Image:
    img  = Image.new('RGB', (SIZE, SIZE), '#1a2332')
    draw = ImageDraw.Draw(img)

    # Shoulders / shirt
    draw.polygon(
        [(20, 400), (80, 295), (140, 268), (200, 262),
         (260, 268), (320, 295), (380, 400)],
        fill='#2c4a7c',
    )

    # White collar V-shape
    draw.line([(185, 268), (200, 295), (215, 268)], fill='white', width=3)

    # Neck — rounded rectangle centered at (200, 265), 50×55
    _rounded_rect(draw, 175, 237, 225, 292, radius=10, fill='#e8c9a0')

    # Left ear
    ellipse(draw, 148, 210, 18, 26, '#dbb98a')

    # Right ear
    ellipse(draw, 252, 210, 18, 26, '#dbb98a')

    # Head
    ellipse(draw, 200, 210, 110, 120, '#e8c9a0')

    # Hair — ellipse cap + filled base rectangle
    ellipse(draw, 200, 165, 110, 45, '#3d2b1a')
    draw.rectangle([145, 165, 255, 185], fill='#3d2b1a')

    return img


# ── female ────────────────────────────────────────────────────────────────────

def make_female() -> Image.Image:
    img  = Image.new('RGB', (SIZE, SIZE), '#1a2332')
    draw = ImageDraw.Draw(img)

    # Abaya shoulders
    draw.polygon(
        [(20, 400), (80, 305), (145, 278), (200, 272),
         (255, 278), (320, 305), (380, 400)],
        fill='#2d2d3a',
    )

    # Hijab outer shape
    ellipse(draw, 200, 230, 185, 200, '#4a3728')

    # Hijab left drape — quadratic Bezier curving outward then down
    left_pts  = _curve_points(118, 230, 148, 330, cx=100, cy=290)
    draw.line(left_pts, fill='#4a3728', width=40)

    # Hijab right drape
    right_pts = _curve_points(282, 230, 252, 330, cx=300, cy=290)
    draw.line(right_pts, fill='#4a3728', width=40)

    # Face
    ellipse(draw, 200, 215, 104, 112, '#c8956c')

    # Hijab inner dark frame (framing above face)
    ellipse(draw, 200, 195, 108, 55, '#3d2b1a')

    return img


# ── main ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    male_path   = os.path.join(ASSETS_DIR, 'sample_male.jpg')
    female_path = os.path.join(ASSETS_DIR, 'sample_female.jpg')

    make_male().save(male_path,   'JPEG', quality=95)
    print(f'✓ sample_male.jpg   saved → {male_path}')

    make_female().save(female_path, 'JPEG', quality=95)
    print(f'✓ sample_female.jpg saved → {female_path}')

    print(f'\nBoth images saved to: {ASSETS_DIR}')
