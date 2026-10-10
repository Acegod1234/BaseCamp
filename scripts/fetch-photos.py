#!/usr/bin/env python3
"""
Download the openly licensed landscape photographs used for heroes and region
banners, plus the company and affiliation logos from the live site.

Photos come from Wikimedia Commons (found through Openverse) under CC BY or
CC BY-SA. Both allow commercial use with a credit, which the site prints on
/photo-credits/. Output: public/photos/*.webp and src/content/photo-credits.json.

Usage: python scripts/fetch-photos.py
"""

from __future__ import annotations

import io
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / "public" / "photos"
BRAND = ROOT / "public" / "brand"
UA = "BaseCampAdventureSite/1.0 (https://basecampadventure.com; info@basecampadventure.com)"

# key -> Wikimedia Commons file name
PHOTOS_WANTED = {
    "ama-dablam": "Ama_Dablam_and_the_Himalayas,_Mountains_of_Nepal.jpg",
    "everest-khumbu": "Everest,_Nuptse,_Khumbu_Glacier,_Nepal,_Himalayas.jpg",
    "gokyo-lake": "Gokyo_Lake,_Ngozumpa_Glacier,_Arakamtse,_Cholatse,_Nepal,_Himalayas.jpg",
    "cho-la-trekkers": "Himalayas,_Cho_La_Pass,_Trekkers,_Nepal.jpg",
    "kala-patthar": "Ama_Dablam_and_other_peaks,_Kala_Patthar,_Nepal,_Asia.jpg",
    "namche": "Namche_Bazaar_from_above,_Nepal.jpg",
    "annapurna-pokhara": "Pokhara,_Annapurna_Himal,_Machhapuchchhre,_Nepal.jpg",
    "annapurna-base-camp": "Annapurna_Base_Camp_2008.jpg",
    "machapuchare": "Machapuchare_with_green_hillside.jpg",
    "langtang-sunrise": "Paints_of_sunrise_on_Langtang_National_Park.jpg",
    "langtang-night": "Starry_night_in_Langtang_National_Park.jpg",
    "manaslu": "Manaslu_circuit_trek.jpg",
    "mustang": "Upper_Mustang.jpg",
    "bhutan": "Paro_Taktsang,_Bhutan_(edited).jpg",
    "tibet": "Tibet-5483_-_Potala_Palace.jpg",
    "chitwan": "Chitwan_Rhino_bathing.jpg",
    "rafting": "Trishuli_River_Rafting,_Nepal-3171.jpg",
    "island-peak": "Nepal_-_Island_Peak_-_006_-_Sunrise_on_Peak_41_from_Island_Peak_(497819067).jpg",
    "kathmandu-boudhanath": "Boudhanath_Stupa_2,_Kathmandu,_Nepal.jpg",
    "prayer-flags": "Prayer_flags_hung_by_the_stairs_leading_to_Swayambhunath_(17850740075).jpg",
    "pokhara-lake": "Pokhara,_Phewa_Lake,_Nepal.jpg",
}

LOGOS = {
    "logo.png": "https://basecampadventure.com/wp-content/uploads/2018/07/base-camp-adventure-logo.png",
    "ntb.png": "https://basecampadventure.com/wp-content/uploads/2018/08/ntb1.png",
    "taan.png": "https://basecampadventure.com/wp-content/uploads/2018/08/taan1.png",
    "nma.png": "https://basecampadventure.com/wp-content/uploads/2018/08/nma1.png",
    "hra.png": "https://basecampadventure.com/wp-content/uploads/2018/08/hra.png",
    "keep.png": "https://basecampadventure.com/wp-content/uploads/2018/08/keep1.png",
    "tripadvisor.png": "https://basecampadventure.com/wp-content/uploads/2024/12/tripadvisor.png",
    "bookmundi.png": "https://basecampadventure.com/wp-content/uploads/2023/08/logo-partner-bookmundi.png",
}


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as res:
        return res.read()


def commons_info(file: str) -> dict:
    q = urllib.parse.urlencode({
        "action": "query", "titles": f"File:{file}", "prop": "imageinfo",
        "iiprop": "url|extmetadata|size", "iiurlwidth": 2400, "format": "json",
    })
    data = json.loads(get(f"https://commons.wikimedia.org/w/api.php?{q}"))
    page = next(iter(data["query"]["pages"].values()))
    return page["imageinfo"][0]


def strip_html(s: str) -> str:
    import re
    from html import unescape
    return unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def main() -> None:
    PHOTOS.mkdir(parents=True, exist_ok=True)
    BRAND.mkdir(parents=True, exist_ok=True)
    credits = []
    for key, file in PHOTOS_WANTED.items():
        out = PHOTOS / f"{key}.webp"
        try:
            info = commons_info(file)
            meta = info.get("extmetadata", {})
            credit = {
                "key": key,
                "title": strip_html(meta.get("ObjectName", {}).get("value") or file.replace("_", " ").rsplit(".", 1)[0]),
                "author": strip_html(meta.get("Artist", {}).get("value", "Unknown")),
                "license": strip_html(meta.get("LicenseShortName", {}).get("value", "")),
                "licenseUrl": meta.get("LicenseUrl", {}).get("value"),
                "source": info.get("descriptionurl"),
            }
            if not out.exists():
                body = get(info.get("thumburl") or info["url"])
                with Image.open(io.BytesIO(body)) as im:
                    im = ImageOps.exif_transpose(im).convert("RGB")
                    if im.width > 2400:
                        im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
                    im.save(out, "WEBP", quality=80, method=5)
            with Image.open(out) as im:
                credit.update({"src": f"/photos/{key}.webp", "w": im.width, "h": im.height})
            credits.append(credit)
            print("ok", key, credit["license"], "-", credit["author"][:40])
            time.sleep(0.4)
        except Exception as e:
            print("!!", key, e)

    (ROOT / "src" / "content").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "content" / "photo-credits.json").write_text(json.dumps(credits, indent=1, ensure_ascii=False), encoding="utf8")

    for name, url in LOGOS.items():
        try:
            (BRAND / name).write_bytes(get(url))
            with Image.open(BRAND / name) as im:
                print("logo", name, im.size)
        except Exception as e:
            print("!! logo", name, e)


if __name__ == "__main__":
    main()
