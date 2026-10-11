"""Trace parts of the LLF logo PNGs into SVG paths.

usage: trace_logo.py <png> <out.svg> <left> <top> <right> <bottom> [mask l,t,r,b ...]
Crop box in source pixels; optional rectangles (source pixels) are erased first.
"""

import sys

import numpy as np
import potrace
from PIL import Image, ImageDraw, ImageFilter

SCALE = 8


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    left, top, right, bottom = (int(v) for v in sys.argv[3:7])
    image = Image.open(src).convert("L")
    draw = ImageDraw.Draw(image)
    for mask in sys.argv[7:]:
        if mask.startswith("poly:"):
            points = [tuple(float(v) for v in xy.split(",")) for xy in mask[5:].split(";")]
            draw.polygon(points, fill=230)
        else:
            draw.rectangle(tuple(int(v) for v in mask.split(",")), fill=230)

    crop = image.crop((left, top, right, bottom))
    w, h = crop.size
    big = crop.resize((w * SCALE, h * SCALE), Image.LANCZOS)
    big = big.filter(ImageFilter.GaussianBlur(SCALE * 0.22))
    # Threshold near the background tone so hairlines survive.
    ink = np.array(big) < 178

    # potracer traces the False pixels, so hand it the background.
    bitmap = potrace.Bitmap(~ink)
    paths = bitmap.trace(
        turdsize=SCALE * SCALE * 2,
        turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
        alphamax=1.0,
        opticurve=True,
        opttolerance=0.8,
    )

    def pt(p) -> str:
        return f"{p.x / SCALE:.1f} {p.y / SCALE:.1f}"

    parts = []
    for curve in paths:
        d = [f"M{pt(curve.start_point)}"]
        for segment in curve.segments:
            if segment.is_corner:
                d.append(f"L{pt(segment.c)}L{pt(segment.end_point)}")
            else:
                d.append(f"C{pt(segment.c1)} {pt(segment.c2)} {pt(segment.end_point)}")
        d.append("Z")
        parts.append("".join(d))

    path = "".join(parts)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">'
        f'<path fill="currentColor" fill-rule="evenodd" d="{path}"/></svg>'
    )
    with open(out, "w") as f:
        f.write(svg)
    print(f"{out}: {len(paths)} curves, {len(svg) // 1024 + 1} KB, viewBox {w}x{h}")


if __name__ == "__main__":
    main()
