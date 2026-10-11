"""Prepare a founder photo for the site.

Fixes orientation, resizes so the long edge is at most 2400 px, and saves a
progressive JPEG with no metadata at all (no GPS location, no camera data).
next/image then serves AVIF and WebP sizes from this file.

Usage (from the repo root, with Pillow installed):

    pip install pillow
    python scripts/photos/prepare_photo.py <source image> <name>

writes public/photos/<name>.jpg and prints its width and height for the
content file.
"""

import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
LONG_EDGE = 2400


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    source, name = Path(sys.argv[1]), sys.argv[2]

    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    image.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)

    # A fresh image carries no EXIF, XMP or ICC data from the original.
    clean = Image.frombytes("RGB", image.size, image.tobytes())

    out = ROOT / "public" / "photos" / f"{name}.jpg"
    out.parent.mkdir(parents=True, exist_ok=True)
    clean.save(out, "JPEG", quality=84, optimize=True, progressive=True)
    print(f"{out.relative_to(ROOT)}  {clean.width}x{clean.height}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
