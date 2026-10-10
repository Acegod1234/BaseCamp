#!/usr/bin/env python3
"""
Hero and banner photographs, chosen from the company's own uploads.

Each slot is re-encoded from the original WordPress upload (cached by the
importer) at a higher quality than the bulk import, because heroes are shown
full width. Output: public/photos/<slot>.webp and src/content/photos.json,
which also records which trip each photograph comes from.

Usage: python scripts/prepare-photos.py   (after scripts/import-wordpress.py)
"""

from __future__ import annotations

import hashlib
import io
import json
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "photos"
CACHE = ROOT / ".cache" / "img"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36 BaseCampMigration/1.0"

# slot -> media path from the import (or a live-site URL for the homepage banner)
SLOTS = {
    "home-banner": "https://basecampadventure.com/wp-content/uploads/2025/12/f0c926a9-e5a2-46fb-9d53-8033ed26ce2f.jpg",
    "hero-ama-dablam": "/media/2019/07/img-9902.webp",
    "hero-alpenglow": "/media/2018/07/img-6136-scaled.webp",
    "hero-gokyo": "/media/2020/02/everest-gokyo-trek-map-1-1-scaled.webp",
    "hero-machapuchare": "/media/2018/07/img-5895-scaled.webp",
    "hero-mustang": "/media/2019/06/upper-mustang-trek.webp",
    "region-everest": "/media/2018/07/everest-base-camp-banner.webp",
    "region-annapurna": "/media/2018/07/img-6234-scaled.webp",
    "region-langtang": "/media/2019/04/langtang-valley-trek.webp",
    "region-manaslu": "/media/2024/02/manaslu1-scaled.webp",
    "region-remote": "/media/2019/06/upper-mustang-trek-1.webp",
    "region-nepal": "/media/2019/05/national-parks.webp",
    "region-bhutan": "/media/2018/07/punakha-domoche-trekking.webp",
    "region-tibet": "/media/2018/10/kathmandu-lhasa-everest-base-camp-tour-1.webp",
    "activity-trekking": "/media/2018/07/thorong-la-pass-scaled.webp",
    "activity-peak": "/media/2018/07/dsc03655-scaled.webp",
    "activity-tour": "/media/2021/09/swyambhunath-scaled.webp",
    "activity-rafting": "/media/2018/10/karnali-river-rafting.webp",
    "activity-day": "/media/2019/07/helicopter-1.webp",
    "activity-bhutan": "/media/2018/07/bhutan-heritage-tour.webp",
    "activity-tibet": "/media/2018/10/kathmandu-lhasa-everest-base-camp-tour-4.webp",
    "page-about": "/media/2019/06/everest-base-camp-trek.webp",
    "page-about-group": "/media/2018/07/img-5795-scaled.webp",
    "page-trips": "/media/2019/04/ghorepani-poonhill-trek-1.webp",
    "page-destinations": "/media/2019/07/wp-20171224-018-1-scaled.webp",
    "page-activities": "/media/2019/07/sunrise.webp",
    "page-team": "/media/2024/02/manaslu29-scaled.webp",
    "page-reviews": "/media/2018/07/langtang.webp",
    "page-contact": "/media/2019/07/wp-20171223-002-scaled.webp",
    "page-customize": "/media/2019/07/whatsapp-image-2025-12-24-at-13-21-05.webp",
    "page-gallery": "/media/2019/07/wp-20171224-018.webp",
    "page-404": "/media/2018/07/img-6153-scaled.webp",
}


def original_bytes(local: str, redirects: dict[str, str]) -> bytes | None:
    """The original upload behind a converted /media file, from the importer cache."""
    for old, new in redirects.items():
        if new == local:
            for candidate in (old,):
                url = "https://basecampadventure.com" + candidate
                key = hashlib.sha1(url.encode()).hexdigest()
                path = CACHE / key
                if path.exists():
                    return path.read_bytes()
    return None


def fetch(url: str) -> bytes:
    req = urllib.request.Request(urllib.parse.quote(url, safe=":/?&=%"), headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as res:
        return res.read()


def main() -> None:
    import urllib.parse  # noqa: F401  (used by fetch)

    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.webp"):
        old.unlink()
    redirects = json.loads((ROOT / "src" / "content" / "media-redirects.json").read_text(encoding="utf8"))
    trips = json.loads((ROOT / "src" / "content" / "trips.json").read_text(encoding="utf8"))
    owner = {}
    for t in trips:
        for im in [t.get("cover")] + t.get("gallery", []):
            if im:
                owner.setdefault(im["src"], t["slug"])

    result = {}
    for slot, source in SLOTS.items():
        if source.startswith("http"):
            body = fetch(source)
        else:
            body = original_bytes(source, redirects) or (ROOT / "public" / source.lstrip("/")).read_bytes()
        with Image.open(io.BytesIO(body)) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            if im.width > 2400:
                im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
            out = OUT / f"{slot}.webp"
            im.save(out, "WEBP", quality=86, method=6)
            result[slot] = {"src": f"/photos/{slot}.webp", "w": im.width, "h": im.height, "trip": owner.get(source)}
            print(f"{slot:20s} {im.width}x{im.height}  trip={owner.get(source)}")
    (ROOT / "src" / "content" / "photos.json").write_text(json.dumps(result, indent=1), encoding="utf8")


if __name__ == "__main__":
    sys.exit(main())
