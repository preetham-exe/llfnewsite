"""Generate the small tileable textures in public/textures.

Cloth and wood are neutral grey (128 means "no change") and are laid over a
colour with background-blend-mode: overlay, so one texture works for every
cloth and wood. Paper is a faint brown grain with transparency, laid over the
paper colour, so text keeps its contrast.

Usage (one-off, from the repo root, with Pillow and NumPy installed):

    pip install pillow numpy
    python scripts/textures/build_textures.py
"""

import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

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


def _periodic_blur(field: np.ndarray, sigma: float) -> np.ndarray:
    """Gaussian blur that wraps around the edges, so the result tiles."""
    size = field.shape[0]
    freq = np.fft.fftfreq(size)
    fx, fy = np.meshgrid(freq, freq)
    kernel = np.exp(-2 * (math.pi * sigma) ** 2 * (fx**2 + fy**2))
    return np.real(np.fft.ifft2(np.fft.fft2(field) * kernel))


def _normalise(field: np.ndarray) -> np.ndarray:
    return (field - field.mean()) / (field.std() + 1e-9)


def paper(size: int = 256, seed: int = 5) -> Image.Image:
    """Book paper: a soft mottle and a scatter of short fibres, as a warm
    brown at a few percent opacity. Both wrap, so it tiles. (Fine grain was
    tried too: invisible at this strength, and it tripled the file size.)"""
    rng = np.random.default_rng(seed)
    mottle = _normalise(_periodic_blur(rng.standard_normal((size, size)), 18))

    fibres = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(fibres)
    pick = random.Random(seed)
    for _ in range(70):
        x, y = pick.uniform(0, size), pick.uniform(0, size)
        angle = pick.uniform(0, math.tau)
        length = pick.uniform(4, 14)
        dx, dy = math.cos(angle) * length, math.sin(angle) * length
        shade = pick.randint(40, 110)
        # Draw each fibre in the nine tile positions so it wraps cleanly.
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                draw.line(
                    (x + ox, y + oy, x + dx + ox, y + dy + oy),
                    fill=shade,
                    width=1,
                )
    fibre = np.asarray(fibres.filter(ImageFilter.GaussianBlur(0.5)), float) / 255

    # Opacity out of 255: about 1% on average, never more than about 5%.
    alpha = 3 + mottle * 0.7 + fibre * 8
    alpha = np.clip(alpha, 0, 18).round().astype(np.uint8)
    colour = np.zeros((size, size, 3), np.uint8)
    colour[...] = (112, 88, 62)
    return Image.fromarray(np.dstack([colour, alpha]), "RGBA")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    grain = wood()
    textures = (
        ("cloth", cloth()),
        ("wood", grain),
        # Upright grain for the bookcase sides and back panel.
        ("wood-v", grain.transpose(Image.Transpose.ROTATE_90)),
        ("paper", paper()),
    )
    for name, image in textures:
        path = OUT / f"{name}.webp"
        image.save(path, "WEBP", quality=82, method=6)
        print(f"{path.relative_to(ROOT)}  {path.stat().st_size // 1024 + 1} KB")


if __name__ == "__main__":
    main()
