"""Generate the small tileable textures in public/textures.

Both are neutral grey (128 means "no change") and are laid over a colour with
background-blend-mode: overlay, so one texture works for every cloth and wood.

Usage (one-off, from the repo root, with Pillow installed):

    pip install pillow
    python scripts/textures/build_textures.py
"""

import math
import random
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "textures"


def cloth(size: int = 128, seed: int = 7) -> Image.Image:
    """Book cloth: a fine linen weave. Each row and column is one thread with
    its own slight thickness, alternating over and under."""
    rng = random.Random(seed)
    rows = [rng.uniform(-1, 1) for _ in range(size)]
    cols = [rng.uniform(-1, 1) for _ in range(size)]
    image = Image.new("L", (size, size))
    pixels = image.load()
    for y in range(size):
        for x in range(size):
            thread = rows[y] if (x + y) % 2 else cols[x]
            value = 128 + thread * 9 + rng.uniform(-5, 5)
            pixels[x, y] = max(0, min(255, round(value)))
    return image.filter(ImageFilter.GaussianBlur(0.45))


def wood(width: int = 512, height: int = 64, seed: int = 11) -> Image.Image:
    """Shelf wood: long horizontal grain that wanders a little. Tiles
    horizontally because every wave completes a whole number of periods."""
    rng = random.Random(seed)
    waves = [
        (rng.uniform(0.04, 0.12), rng.randint(1, 3), rng.uniform(0, math.tau))
        for _ in range(3)
    ]
    image = Image.new("L", (width, height))
    pixels = image.load()
    for y in range(height):
        for x in range(width):
            drift = sum(
                amp * math.sin(math.tau * k * x / width + phase)
                for amp, k, phase in waves
            )
            grain = math.sin(math.tau * (y / height * 7 + drift))
            fine = math.sin(math.tau * (y / height * 23 + drift * 2.3))
            value = 128 + grain * 10 + fine * 4 + rng.uniform(-3, 3)
            pixels[x, y] = max(0, min(255, round(value)))
    return image.filter(ImageFilter.GaussianBlur(0.6))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, image in (("cloth", cloth()), ("wood", wood())):
        path = OUT / f"{name}.webp"
        image.save(path, "WEBP", quality=82, method=6)
        print(f"{path.relative_to(ROOT)}  {path.stat().st_size // 1024 + 1} KB")


if __name__ == "__main__":
    main()
