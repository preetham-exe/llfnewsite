"""Build the self-hosted font files from the upstream Google Fonts sources.

The upstream variable fonts carry every weight and a large character set. This
script pins Literata to a single weight (400) while keeping its optical-size
axis, since book typography uses italic rather than bold for emphasis. It keeps
only the OpenType features the design uses (small caps, figure styles, kerning,
ligatures), subsets to Latin plus the rupee sign, and writes WOFF2 for the site
and static TTF instances for Open Graph images (next/og cannot read WOFF2 or
variable fonts).

Resulting sizes: Literata roman 62 KB, italic 61 KB, Source Sans 3 28 KB.

Usage (one-off, from the repo root, with fontTools and brotli installed):

    pip install fonttools brotli
    python scripts/fonts/build_fonts.py <dir with the upstream .ttf files>

The upstream files live at https://github.com/google/fonts in ofl/literata and
ofl/sourcesans3:
    Literata[opsz,wght].ttf, Literata-Italic[opsz,wght].ttf, SourceSans3[wght].ttf
"""

import sys
from io import BytesIO
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[2]
WEB_OUT = ROOT / "src" / "assets" / "fonts"
OG_OUT = ROOT / "src" / "assets" / "og"

# Basic Latin, Latin-1, a few extra letters for names, typographic punctuation,
# the rupee and euro signs, arrows, numero, minus, and the replacement glyph.
UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+0160-0161,U+0178,U+017D-017E,"
    "U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,"
    "U+2026,U+2030,U+2032-2033,U+2039-203A,U+2044,U+20AC,U+20B9,U+2116,"
    "U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD"
)


FEATURES = [
    "smcp", "c2sc", "onum", "lnum", "pnum", "tnum", "case",
    "liga", "calt", "kern", "mark", "mkmk", "ccmp", "locl",
]


def subset_font(font: TTFont, out: Path, flavor: str | None) -> None:
    options = subset.Options()
    options.layout_features = FEATURES
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.hinting = False
    options.desubroutinize = True
    options.flavor = flavor
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(font)
    out.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = flavor
    font.save(out)
    print(f"{out.relative_to(ROOT)}  {out.stat().st_size // 1024} KB")


def instance(src: Path, location: dict) -> TTFont:
    font = instancer.instantiateVariableFont(TTFont(src), location)
    # Round-trip through bytes so the subsetter sees fully decompiled tables.
    buffer = BytesIO()
    font.save(buffer)
    buffer.seek(0)
    return TTFont(buffer)


def web_font(src: Path, out_name: str, limits: dict) -> None:
    subset_font(instance(src, limits), WEB_OUT / out_name, "woff2")


def og_font(src: Path, out_name: str, location: dict) -> None:
    subset_font(instance(src, location), OG_OUT / out_name, None)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])

    literata = src / "Literata[opsz,wght].ttf"
    literata_italic = src / "Literata-Italic[opsz,wght].ttf"
    source_sans = src / "SourceSans3[wght].ttf"

    # Site fonts: keep the full optical-size range, pin or trim weights.
    web_font(literata, "literata-roman.woff2", {"wght": 400})
    web_font(literata_italic, "literata-italic.woff2", {"wght": 400})
    web_font(source_sans, "source-sans-3.woff2", {"wght": (400, 600)})

    # Open Graph fonts: static instances at display size.
    og_font(literata, "literata-display-regular.ttf", {"opsz": 72, "wght": 400})
    og_font(literata_italic, "literata-display-italic.ttf", {"opsz": 72, "wght": 400})
    og_font(source_sans, "source-sans-3-semibold.ttf", {"wght": 600})


if __name__ == "__main__":
    main()
