#!/usr/bin/env python
"""Regenerate ForceLens toolbar/store icons from the ForceLens swirl.

The icon is JUST the swirl — no background box, transparent, scaled big so the
blade tips reach (and slightly past) the edges. Large sizes use the indigo->violet
gradient; the small 16/32 use a single strong indigo so the thin swirl blades
don't wash out at tiny sizes.

Run from the assets/ directory:  python build-icons.py
Outputs: icon16.png, icon32.png, icon48.png, icon128.png
"""
from PIL import Image

C_A = (0x63, 0x66, 0xf1)    # indigo (top-left)
C_B = (0x8b, 0x5c, 0xf6)    # violet (bottom-right)
SOLID = (0x5b, 0x5f, 0xe8)  # one strong indigo for clarity at small sizes

swirl = Image.open('forcelens_white_logo.png').convert('RGBA')
w, h = swirl.size
sp = swirl.load()


def tint(gradient):
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            a = sp[x, y][3]
            if a == 0:
                continue
            if gradient:
                t = (x + y) / (2 * w)
                r = int(C_A[0] + (C_B[0] - C_A[0]) * t)
                g = int(C_A[1] + (C_B[1] - C_A[1]) * t)
                b = int(C_A[2] + (C_B[2] - C_A[2]) * t)
            else:
                r, g, b = SOLID
            op[x, y] = (r, g, b, a)
    return out.crop(out.getbbox())   # tight crop → fills the icon edge-to-edge


crop_grad = tint(True)
crop_solid = tint(False)


def make(size, crop, scale_frac=1.45):
    # scale_frac > 1 overscales the swirl so it reads bigger; the circular
    # blade tips bleed toward (and slightly past) the icon edges.
    ss = 8
    S = size * ss
    base = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    cw, ch = crop.size
    scale = min(S / cw, S / ch) * scale_frac
    nw, nh = int(cw * scale), int(ch * scale)
    base.alpha_composite(crop.resize((nw, nh), Image.LANCZOS),
                         ((S - nw) // 2, (S - nh) // 2))
    return base.resize((size, size), Image.LANCZOS)


make(16, crop_solid).save('icon16.png')
make(32, crop_solid).save('icon32.png')
make(48, crop_grad).save('icon48.png')
make(128, crop_grad).save('icon128.png')
for s in (16, 32, 48, 128):
    print(f'wrote icon{s}.png')
print('Done.')
