#!/usr/bin/env python3
"""Quantize PNG screenshots to 256-color palette PNGs, in place.

Flat product UI survives this visually unchanged while the file (and its
base64 data URI) shrinks by half or more - required before embed-images.mjs,
whose per-image cap exists because oversized data URIs have rendered blank
in the artifact viewer.

Usage: python3 quantize-png.py file.png [file2.png ...]
Needs Pillow: python3 -m pip install --user pillow
"""

import os
import sys

from PIL import Image

for path in sys.argv[1:]:
    before = os.path.getsize(path)
    im = Image.open(path).convert("RGB")
    q = im.quantize(colors=256, method=Image.MEDIANCUT, dither=Image.Dither.NONE)
    q.save(path, optimize=True)
    after = os.path.getsize(path)
    print(f"{path}: {before // 1024}KB -> {after // 1024}KB")
