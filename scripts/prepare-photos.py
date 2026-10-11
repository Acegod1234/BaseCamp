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
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "photos"
CACHE = ROOT / ".cache" / "img"
MAX = 3840  # 4K
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36 BaseCampMigration/1.0"

# slot -> media path from the import, a live-site URL, or "commons:<File name>"
# (a Creative Commons original from Wikimedia, credited on the Gallery page).
SLOTS = {
    "home-banner": "https://basecampadventure.com/wp-content/uploads/2025/12/f0c926a9-e5a2-46fb-9d53-8033ed26ce2f.jpg",
    "hero-ama-dablam": "commons:Ama_Dablam_and_the_Himalayas,_Mountains_of_Nepal.jpg",
    "hero-alpenglow": "/media/2018/07/img-6136-scaled.webp",
    "hero-gokyo": "commons:Gokyo_Lake,_Ngozumpa_Glacier,_Arakamtse,_Cholatse,_Nepal,_Himalayas.jpg",
    "hero-machapuchare": "/media/2018/07/img-5895-scaled.webp",
    "hero-mustang": "commons:Upper_Mustang.jpg",
    "region-everest": "commons:Everest,_Nuptse,_Khumbu_Glacier,_Nepal,_Himalayas.jpg",
    "region-annapurna": "commons:South_Face_of_Annapurna_I_(Main).jpg",
    "region-langtang": "commons:Paints_of_sunrise_on_Langtang_National_Park.jpg",
    "region-manaslu": "commons:Manaslu_range.jpg",
    "region-remote": "commons:LoManthang_1.JPG",
    "region-nepal": "commons:Chitwan_Rhino_on_the_road.jpg",
    "region-bhutan": "commons:Paro,_Taktsang_Goemba_(Tiger's_Nest)_(15221622304).jpg",
    "region-tibet": "commons:Tibet-5483_-_Potala_Palace.jpg",
    "activity-trekking": "/media/2018/07/thorong-la-pass-scaled.webp",
    "activity-peak": "/media/2018/07/dsc03655-scaled.webp",
    "activity-tour": "/media/2021/09/swyambhunath-scaled.webp",
    "activity-rafting": "commons:Trishuli_River_Rafting,_Nepal-3171.jpg",
    "activity-day": "/media/2019/07/helicopter-1.webp",
    "activity-bhutan": "commons:Paro_Taktsang,_Bhutan_(edited).jpg",
    "activity-tibet": "/media/2018/10/kathmandu-lhasa-everest-base-camp-tour-4.webp",
    "page-about": "commons:Namche_Bazaar_from_above,_Nepal.jpg",
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
    req = urllib.request.Request(urllib.parse.quote(url, safe=":/?&=%,()'"), headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as res:
        return res.read()


def commons(file: str) -> tuple[bytes, dict]:
    """A Wikimedia Commons original at up to 3840px, with its credit."""
    q = urllib.parse.urlencode({"action": "query", "titles": f"File:{file}", "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": MAX, "format": "json"})
    info = next(iter(json.loads(fetch(f"https://commons.wikimedia.org/w/api.php?{q}"))["query"]["pages"].values()))["imageinfo"][0]
    meta = info.get("extmetadata", {})
    strip = lambda v: re.sub(r"<[^>]+>", "", v or "").strip()
    credit = {
        "title": strip(meta.get("ObjectName", {}).get("value")) or file.rsplit(".", 1)[0].replace("_", " "),
        "author": strip(meta.get("Artist", {}).get("value")).splitlines()[0] if strip(meta.get("Artist", {}).get("value")) else "Unknown",
        "license": strip(meta.get("LicenseShortName", {}).get("value")),
        "licenseUrl": meta.get("LicenseUrl", {}).get("value"),
        "source": info.get("descriptionurl"),
    }
    return fetch(info.get("thumburl") or info["url"]), credit


def main() -> None:
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
        credit = None
        if source.startswith("commons:"):
            body, credit = commons(source.split(":", 1)[1])
            time.sleep(0.5)
        elif source.startswith("http"):
            body = fetch(source)
        else:
            body = original_bytes(source, redirects) or (ROOT / "public" / source.lstrip("/")).read_bytes()
        with Image.open(io.BytesIO(body)) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            if im.width > MAX:
                im = im.resize((MAX, round(im.height * MAX / im.width)), Image.LANCZOS)
            out = OUT / f"{slot}.webp"
            im.save(out, "WEBP", quality=84, method=6)
            result[slot] = {"src": f"/photos/{slot}.webp", "w": im.width, "h": im.height, "trip": owner.get(source), "credit": credit}
            print(f"{slot:20s} {im.width}x{im.height}  {'CC ' + credit['license'] if credit else 'own'}")
    (ROOT / "src" / "content" / "photos.json").write_text(json.dumps(result, indent=1, ensure_ascii=False), encoding="utf8")


if __name__ == "__main__":
    sys.exit(main())
