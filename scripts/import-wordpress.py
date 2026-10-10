#!/usr/bin/env python3
"""
Import the live WordPress site (basecampadventure.com) into this project.

Writes typed JSON to src/content/ and WebP images to public/media/, keeping the
WordPress upload path (2018/06/name.jpg -> /media/2018/06/name.webp) so the old
image URLs can be redirected with one pattern rule.

Sources, all public:
  - WP Travel Engine v2 REST  : trips, packages (prices), itineraries, FAQs
  - WordPress REST            : posts, pages, media, categories, tags, taxonomies
  - Rendered trip pages       : review + rating JSON-LD (the review API needs auth)
  - Rendered team pages       : team profiles (tap_team is not exposed over REST)

Every HTTP response is cached in .cache/wp, so a re-run is fast and does not
hit the live site again. Delete that folder to pull fresh content.

Usage:
  python scripts/import-wordpress.py              # content + images
  python scripts/import-wordpress.py --no-images  # content only
"""

from __future__ import annotations

import hashlib
import io
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html import unescape
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString
from PIL import Image, ImageOps

SITE = "https://basecampadventure.com"
API = f"{SITE}/wp-json"
ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "wp"
IMG_CACHE = ROOT / ".cache" / "img"
CONTENT = ROOT / "src" / "content"
MEDIA = ROOT / "public" / "media"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36 BaseCampMigration/1.0"

WITH_IMAGES = "--no-images" not in sys.argv
MAX_WIDTH = 2400
QUALITY = 82

for d in (CACHE, IMG_CACHE, CONTENT, MEDIA):
    d.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------------------------------- http

def fetch(url: str, *, binary: bool = False, retries: int = 3) -> bytes | None:
    key = hashlib.sha1(url.encode()).hexdigest()
    path = (IMG_CACHE if binary else CACHE) / key
    if path.exists():
        return path.read_bytes()
    # Some upload names carry non-ASCII characters (en dashes, accents).
    safe_url = urllib.parse.quote(url, safe=":/?&=%#,+;@!$'()*[]~")
    for attempt in range(retries):
        try:
            req = urllib.request.Request(safe_url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=60) as res:
                body = res.read()
            path.write_bytes(body)
            time.sleep(0.15)
            return body
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 404, 410):
                return None
            time.sleep(1.5 * (attempt + 1))
        except Exception:
            time.sleep(1.5 * (attempt + 1))
    print(f"  ! failed {url}", file=sys.stderr)
    return None


def get_json(url: str):
    body = fetch(url)
    if body is None:
        return None
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        # A theme or shortcode may print markup before the JSON body.
        start = min((i for i in (body.find(b"["), body.find(b"{")) if i >= 0), default=-1)
        try:
            return json.loads(body[start:]) if start > 0 else None
        except json.JSONDecodeError:
            return None


def get_all(endpoint: str, params: dict | None = None) -> list:
    """Every page of a paginated WordPress collection."""
    out, page = [], 1
    while True:
        q = dict(params or {}, per_page=100, page=page)
        data = get_json(f"{API}/{endpoint}?{urllib.parse.urlencode(q)}")
        if not data or not isinstance(data, list):
            break
        out.extend(data)
        if len(data) < 100:
            break
        page += 1
    return out


def pmap(fn, items, workers=4):
    with ThreadPoolExecutor(workers) as pool:
        return list(pool.map(fn, items))


# --------------------------------------------------------------------------- helpers

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:80] or "section"


def text_of(html: str) -> str:
    return re.sub(r"\s+", " ", BeautifulSoup(html or "", "html.parser").get_text(" ", strip=True)).strip()


def excerpt(html: str, limit: int = 180) -> str:
    t = text_of(html)
    if len(t) <= limit:
        return t
    cut = t[:limit].rsplit(" ", 1)[0]
    return cut.rstrip(",.;:") + "…"


def num(v) -> float | None:
    try:
        f = float(str(v).replace(",", ""))
        return f if f > 0 else None
    except (TypeError, ValueError):
        return None


def yoast(obj: dict) -> dict:
    y = obj.get("yoast_head_json") or {}
    og = (y.get("og_image") or [{}])[0].get("url")
    robots = y.get("robots") or {}
    return {
        "title": unescape(y.get("title") or "").strip() or None,
        "description": unescape(y.get("description") or y.get("og_description") or "").strip() or None,
        "ogImage": og,
        "noindex": robots.get("index") == "noindex",
    }


# --------------------------------------------------------------------------- media

media_map: dict[str, dict] = {}   # old absolute url -> {src, w, h}
media_queue: dict[str, str] = {}  # old absolute url -> local relative path


def local_media_path(url: str) -> str | None:
    p = urllib.parse.urlparse(url)
    if "/wp-content/uploads/" not in p.path:
        return None
    rel = urllib.parse.unquote(p.path.split("/wp-content/uploads/", 1)[1])
    rel = re.sub(r"-\d{2,4}x\d{2,4}(?=\.\w+$)", "", rel)  # drop WP size suffix
    rel = re.sub(r"\.(jpe?g|png|gif|webp|bmp|tiff?)$", "", rel, flags=re.I)
    rel = "/".join(slugify(part) if i == len(rel.split("/")) - 1 else part for i, part in enumerate(rel.split("/")))
    return f"/media/{rel}.webp"


def register_image(url: str | None) -> str | None:
    if not url:
        return None
    url = urllib.parse.urljoin(SITE, url.split("?")[0])
    local = local_media_path(url)
    if not local:
        return None
    media_queue.setdefault(url, local)
    return local


def process_image(item: tuple[str, list[str]]) -> None:
    """One output file, possibly referenced by several WordPress size variants."""
    local, urls = item
    out = ROOT / "public" / local.lstrip("/")

    def record(w: int, h: int) -> None:
        for u in urls:
            media_map[u] = {"src": local, "w": w, "h": h}

    if out.exists():
        with Image.open(out) as im:
            record(im.width, im.height)
        return
    if not WITH_IMAGES:
        return
    original = re.sub(r"-\d{2,4}x\d{2,4}(?=\.\w+$)", "", urls[0])
    body = fetch(original, binary=True)
    for u in urls:
        if body:
            break
        body = fetch(u, binary=True)
    if not body:
        return
    try:
        with Image.open(io.BytesIO(body)) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "transparency" in im.info else "RGB")
            if im.width > MAX_WIDTH:
                im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
            out.parent.mkdir(parents=True, exist_ok=True)
            im.save(out, "WEBP", quality=QUALITY, method=5)
            record(im.width, im.height)
    except Exception as e:  # corrupt or unsupported file
        print(f"  ! image {local}: {e}", file=sys.stderr)


def image_ref(url: str | None, alt: str = "") -> dict | None:
    local = register_image(url)
    if not local:
        return None
    return {"src": local, "alt": unescape(alt or "").strip(), "_url": urllib.parse.urljoin(SITE, url.split("?")[0])}


# --------------------------------------------------------------------------- html

ALT_RE = re.compile(
    r"(?<![\d,.])(\d{1,2},\d{3}|\d{3,4})\s?(?:m|meters|metres|mtrs|masl)\b\.?"
    r"(?:\s*/\s*[\d,]+\s?(?:ft|feet)\b\.?)?",
    re.I,
)
SKIP_TEXT_PARENTS = {"script", "style", "a", "code", "pre", "h1"}
DROP_TAGS = {"script", "style", "noscript", "form", "input", "button", "svg", "link", "meta"}
KEEP_ATTRS = {
    "a": {"href", "title", "target", "rel"},
    "img": {"src", "alt", "width", "height"},
    "td": {"colspan", "rowspan"},
    "th": {"colspan", "rowspan", "scope"},
    "span": {"class", "data-meters"},
    "ol": {"start"},
}


def wrap_measurements(soup: BeautifulSoup) -> None:
    for node in list(soup.find_all(string=True)):
        if not isinstance(node, NavigableString) or isinstance(node, Comment):
            continue
        if any(p.name in SKIP_TEXT_PARENTS or "measurement" in (p.get("class") or []) for p in node.parents if p.name):
            continue
        s = str(node)
        if not ALT_RE.search(s):
            continue
        parts, last = [], 0
        for m in ALT_RE.finditer(s):
            meters = int(m.group(1).replace(",", ""))
            if meters < 300 or meters > 8849:
                continue
            parts.append(NavigableString(s[last:m.start()]))
            span = soup.new_tag("span", attrs={"class": "measurement", "data-meters": str(meters)})
            span.string = f"{meters:,} m"
            parts.append(span)
            last = m.end()
        if not parts:
            continue
        parts.append(NavigableString(s[last:]))
        for p in parts:
            node.insert_before(p)
        node.extract()


def internal_href(href: str) -> str:
    href = href.strip()
    for prefix in (SITE, "http://basecampadventure.com", "https://www.basecampadventure.com", "//basecampadventure.com"):
        if href.startswith(prefix):
            path = href[len(prefix):] or "/"
            if "/wp-content/uploads/" in path:
                local = register_image(prefix + path) if re.search(r"\.(jpe?g|png|gif|webp)$", path, re.I) else None
                return local or href
            return path
    return href


def clean_html(html: str, *, heading_ids: bool = True) -> str:
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    for tag in soup.find_all(DROP_TAGS):
        tag.decompose()

    # YouTube embeds become a link the frontend upgrades to a click-to-play player.
    for iframe in soup.find_all("iframe"):
        m = re.search(r"youtube(?:-nocookie)?\.com/embed/([\w-]{6,})", iframe.get("src", ""))
        if m:
            a = soup.new_tag("a", attrs={"href": f"https://www.youtube.com/watch?v={m.group(1)}", "data-youtube": m.group(1), "class": "yt-embed"})
            a.string = "Watch the video"
            iframe.replace_with(a)
        else:
            iframe.decompose()

    for img in soup.find_all("img"):
        src = img.get("data-src") or img.get("data-lazy-src") or img.get("src") or ""
        local = register_image(src)
        if not local:
            img.decompose()
            continue
        img.attrs = {"src": local, "alt": unescape(img.get("alt", "")).strip(), "data-orig": urllib.parse.urljoin(SITE, src.split("?")[0])}

    # Exactly one H1 per page: the template owns it, so content headings start at H2.
    for h1 in soup.find_all("h1"):
        h1.name = "h2"

    for a in soup.find_all("a"):
        if a.get("href"):
            a["href"] = internal_href(a["href"])
            if a["href"].startswith("http"):
                a["target"] = "_blank"
                a["rel"] = "noopener noreferrer"

    # Strip builder markup: keep semantic tags, drop wrappers and styling.
    for tag in soup.find_all(True):
        if getattr(tag, "decomposed", False) or tag.parent is None:
            continue
        if tag.name in ("div", "section", "article", "span", "font", "center") and not (tag.name == "span" and "measurement" in (tag.get("class") or [])):
            if tag.get_text(strip=True) or tag.find("img"):
                tag.unwrap()
            else:
                tag.decompose()
            continue
        keep = KEEP_ATTRS.get(tag.name, set())
        if tag.name == "img":
            keep = {"src", "alt", "data-orig"}
        if tag.name == "a":
            keep = keep | {"data-youtube", "class"}
        tag.attrs = {k: v for k, v in tag.attrs.items() if k in keep}

    for tag in soup.find_all(["p", "h2", "h3", "h4", "li", "strong", "em"]):
        if not tag.get_text(strip=True) and not tag.find("img"):
            tag.decompose()

    for table in soup.find_all("table"):
        wrapper = soup.new_tag("div", attrs={"class": "table-wrap"})
        table.wrap(wrapper)

    wrap_measurements(soup)

    if heading_ids:
        seen: dict[str, int] = {}
        for h in soup.find_all(["h2", "h3"]):
            base = slugify(h.get_text(" ", strip=True))
            seen[base] = seen.get(base, 0) + 1
            h["id"] = base if seen[base] == 1 else f"{base}-{seen[base]}"

    out = str(soup)
    out = re.sub(r"(<br\s*/?>\s*){2,}", "<br/>", out)
    out = re.sub(r"\n{2,}", "\n", out).strip()
    return out


def toc(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    return [{"id": h["id"], "text": h.get_text(" ", strip=True), "level": int(h.name[1])} for h in soup.find_all(["h2", "h3"]) if h.get("id")]


# --------------------------------------------------------------------------- taxonomies

print("taxonomies…")
dest_raw = get_all("wp/v2/destination")
act_raw = get_all("wp/v2/activities")
diff_raw = get_all("wp/v2/difficulty")
tag_trip_raw = get_all("wp/v2/trip_tag")
cat_raw = get_all("wp/v2/categories")
tag_raw = get_all("wp/v2/tags")

dest_by_id = {t["id"]: t["slug"] for t in dest_raw}
act_by_id = {t["id"]: t["slug"] for t in act_raw}
diff_by_id = {t["id"]: t["slug"] for t in diff_raw}
cat_by_id = {t["id"]: t["slug"] for t in cat_raw}
tag_by_id = {t["id"]: t["slug"] for t in tag_raw}


def term(t: dict, kind: str) -> dict:
    return {
        "id": t["id"],
        "slug": t["slug"],
        "name": unescape(t["name"]),
        "count": t.get("count", 0),
        "parent": t.get("parent") or None,
        "description": clean_html(t.get("description") or ""),
        "seo": yoast(t),
        "kind": kind,
    }


# --------------------------------------------------------------------------- media lookups

def media_lookup(ids: set[int]) -> dict[int, dict]:
    ids = sorted(i for i in ids if i)
    out: dict[int, dict] = {}
    for i in range(0, len(ids), 100):
        chunk = ids[i:i + 100]
        data = get_json(f"{API}/wp/v2/media?" + urllib.parse.urlencode({"include": ",".join(map(str, chunk)), "per_page": 100, "_fields": "id,source_url,alt_text,title"})) or []
        for m in data:
            out[m["id"]] = {"url": m["source_url"], "alt": m.get("alt_text") or text_of((m.get("title") or {}).get("rendered", ""))}
    return out


# --------------------------------------------------------------------------- trips

print("trips…")
trip_list = get_all("wptravelengine/v2/trips")
trip_ids = [t["id"] for t in trip_list if t.get("status") == "publish"]
print(f"  {len(trip_ids)} published trips")

details = pmap(lambda i: get_json(f"{API}/wptravelengine/v2/trips/{i}"), trip_ids)
packages = pmap(lambda i: get_json(f"{API}/wptravelengine/v2/trips/{i}/packages") or [], trip_ids)
pages_html = pmap(lambda d: fetch(d["link"]) if d else None, details, workers=3)
trip_media = media_lookup({d.get("featured_media") for d in details if d})


def ld_blocks(html: bytes | None) -> list:
    if not html:
        return []
    out = []
    for m in re.finditer(rb'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S):
        try:
            data = json.loads(m.group(1))
        except Exception:
            continue
        stack = [data]
        while stack:
            x = stack.pop()
            if isinstance(x, list):
                stack.extend(x)
            elif isinstance(x, dict):
                out.append(x)
                stack.extend(v for v in x.values() if isinstance(v, (list, dict)))
    return out


def reviews_from(html: bytes | None) -> tuple[dict | None, list]:
    rating, reviews, seen = None, [], set()
    for x in ld_blocks(html):
        if isinstance(x.get("aggregateRating"), dict) and not rating:
            ar = x["aggregateRating"]
            v, c = num(ar.get("ratingValue")), num(ar.get("reviewCount") or ar.get("ratingCount"))
            if v and c:
                rating = {"value": round(v, 2), "count": int(c)}
        if x.get("@type") == "Review":
            author = x.get("author")
            name = author.get("name") if isinstance(author, dict) else str(author or "Traveller")
            body = unescape(x.get("reviewBody") or x.get("description") or "").strip()
            key = (name, body[:40])
            if body and key not in seen:
                seen.add(key)
                rr = x.get("reviewRating") or {}
                reviews.append({
                    "author": unescape(name),
                    "rating": num(rr.get("ratingValue")) or 5,
                    "title": unescape(x.get("name") or "").strip() or None,
                    "body": body,
                    "date": (x.get("datePublished") or "").strip() or None,
                })
    return rating, reviews


def price_of(pkgs: list) -> dict | None:
    if not pkgs:
        return None
    pkg = next((p for p in pkgs if p.get("is_primary")), pkgs[0])
    cats = pkg.get("traveler_categories") or []
    cat = next((c for c in cats if c.get("is_primary")), cats[0] if cats else None)
    if not cat:
        return None
    regular, sale = num(cat.get("price")), num(cat.get("sale_price"))
    if not regular and not sale:
        return None
    tiers = []
    if cat.get("has_group_pricing"):
        for g in cat.get("group_pricing") or []:
            p = num(g.get("price"))
            if p:
                tiers.append({"from": int(num(g.get("from")) or 1), "to": int(num(g.get("to")) or 0) or None, "price": p})
    current = sale if (cat.get("has_sale") and sale) else (regular or sale)
    return {
        "amount": current,
        "regular": regular if (regular and current and regular > current) else None,
        "currency": "USD",
        "per": (cat.get("pricing_type") or {}).get("value", "per-person"),
        "minPax": int(num(pkg.get("min_pax")) or 1),
        "groupTiers": tiers,
    }


def altitude_in(text: str) -> int | None:
    vals = [int(m.group(1).replace(",", "")) for m in ALT_RE.finditer(text or "")]
    vals = [v for v in vals if 300 <= v <= 8849]
    return vals[-1] if vals else None


TOWNS = {"kathmandu": 1400, "pokhara": 822, "lukla": 2860, "besisahar": 760, "syabrubesi": 1503, "jomsom": 2720, "chitwan": 150, "lhasa": 3656, "paro": 2200, "thimphu": 2334}


def town_altitude(title: str) -> int | None:
    """Days spent in a known town, so the altitude chart starts and ends on the ground."""
    t = title.lower()
    hits = [(t.rfind(k), v) for k, v in TOWNS.items() if k in t]
    return max(hits)[1] if hits else None


REGION_WORDS = [
    ("everest-region", r"everest|gokyo|khumbu|island peak|lobuche|mera|ama dablam|tengboche|rolwaling|three passes|kala patthar|amphu lapcha"),
    ("annapurna-region", r"annapurna|poon hill|ghorepani|mardi|jomsom|muktinath|manang|tilicho|nar ?phu|panchase|ghalegaun|mohare|chulu|pisang|singu|tent peak|tharpu|paldor"),
    ("langtang-region", r"langtang|gosainkunda|helambu|tamang heritage|ganjala|yala|chisapani"),
    ("manaslu-region", r"manaslu|tsum"),
    ("remote-area-trekking", r"mustang|dolpo|makalu|kanchenjunga|rara|jumla|dhaulagiri|arun|ganesh|pikey|damodar"),
    ("bhutan", r"bhutan|druk|chomolhari|punakha"),
    ("tibet", r"tibet|lhasa|kailash|nam ?tso"),
]
ACTIVITY_REGION = {"tours-in-bhutan": "bhutan", "tours-in-tibet": "tibet"}


def infer_destinations(title: str, activities: list[str], current: list[str]) -> list[str]:
    if current:
        return current
    for a in activities:
        if a in ACTIVITY_REGION:
            return [ACTIVITY_REGION[a]]
    for slug, pattern in REGION_WORDS:
        if re.search(pattern, title, re.I):
            return [slug]
    return ["nepal"]


trips = []
for d, pkgs, html in zip(details, packages, pages_html):
    if not d:
        continue
    seo = yoast(d)
    fm = trip_media.get(d.get("featured_media"))
    cover = image_ref(fm["url"], fm["alt"] or unescape(d["title"]["rendered"])) if fm else None
    gallery = [g for g in (image_ref(g.get("url"), g.get("alt") or "") for g in d.get("gallery") or []) if g]
    if not cover and gallery:
        cover = gallery[0]
    maps = [image_ref(m.get("url"), m.get("alt") or "Route map") for m in (d.get("trip_map") or {}).get("images") or []]
    facts = [{"label": f["label"].strip(), "value": text_of(f["content"])} for f in d.get("trip_info") or [] if text_of(f.get("content") or "")]

    itinerary = []
    for n, day in enumerate(d.get("itineraries") or [], start=1):
        title = text_of(day.get("title") or "")
        overnight = ((day.get("overnights") or [{}])[0] or {})
        alt = num(overnight.get("altitude"))
        itinerary.append({
            "day": n,
            "title": title,
            "html": clean_html(day.get("content") or "", heading_ids=False),
            "altitude": int(alt) if alt and alt >= 300 else (altitude_in(title) or town_altitude(title)),
            "meals": day.get("meals_included") or [],
            "overnight": overnight.get("location") or None,
        })

    sections = []
    for key, tab in (d.get("custom_tabs") or {}).items():
        body = clean_html(tab.get("content") or "")
        if not text_of(body):
            continue
        soup = BeautifulSoup(body, "html.parser")
        first = soup.find(["h2", "h3"])
        title = (tab.get("title") or "").strip() or (first.get_text(" ", strip=True) if first else "More information")
        sections.append({"id": slugify(title), "title": title, "html": body})

    faqs = []
    for cat in (d.get("faqs_data") or {}).get("categories") or []:
        for f in cat.get("faqs") or []:
            q, a = text_of(f.get("question") or ""), clean_html(f.get("answer") or "", heading_ids=False)
            if q and text_of(a):
                faqs.append({"q": q, "a": a})
    if not faqs:
        for f in d.get("faqs") or []:
            q, a = text_of(f.get("question") or ""), clean_html(f.get("answer") or "", heading_ids=False)
            if q and text_of(a):
                faqs.append({"q": q, "a": a})

    elevation_fact = next((f["value"] for f in facts if re.search(r"elevation|altitude", f["label"], re.I)), "")
    altitudes = [x["altitude"] for x in itinerary if x["altitude"]] + ([altitude_in(elevation_fact)] if altitude_in(elevation_fact) else [])
    rating, reviews = reviews_from(html)
    overview = clean_html(d.get("overview") or "")
    dur = d.get("duration") or {}
    days = int(num(dur.get("period")) or 0) or len(itinerary) or 1
    if (dur.get("unit") or "days") == "hours":
        days = 1

    trips.append({
        "id": d["id"],
        "slug": d["slug"],
        "code": d.get("trip_code") or None,
        "title": unescape(d["title"]["rendered"]).strip(),
        "summary": seo["description"] or excerpt(overview),
        "seo": seo,
        "published": d.get("date_gmt"),
        "modified": d.get("modified_gmt"),
        "days": days,
        "nights": int(num(dur.get("nights")) or max(days - 1, 0)),
        "destinations": infer_destinations(
            unescape(d["title"]["rendered"]),
            [act_by_id[i] for i in d.get("activities") or [] if i in act_by_id],
            [dest_by_id[i] for i in d.get("destination") or [] if i in dest_by_id],
        ),
        "activities": [act_by_id[i] for i in d.get("activities") or [] if i in act_by_id],
        "difficulty": next((diff_by_id[i] for i in d.get("difficulty") or [] if i in diff_by_id), None),
        "tags": [],
        "price": price_of(pkgs),
        "groupSize": {"min": int(num((d.get("participants") or {}).get("min")) or 1), "max": int(num((d.get("participants") or {}).get("max")) or 0) or None},
        "maxAltitude": max(altitudes) if altitudes else None,
        "facts": facts,
        "cover": cover,
        "gallery": gallery,
        "map": maps[0] if maps and maps[0] else None,
        "overview": overview,
        "toc": toc(overview),
        "highlights": [text_of(h if isinstance(h, str) else h.get("highlight_text", "")) for h in d.get("highlights") or [] if h],
        "itinerary": itinerary,
        "includes": [text_of(x) for x in d.get("cost_includes") or [] if text_of(x)],
        "excludes": [text_of(x) for x in d.get("cost_excludes") or [] if text_of(x)],
        "sections": sections,
        "faqs": faqs,
        "rating": rating,
        "reviews": reviews[:12],
    })

trips.sort(key=lambda t: t["title"])
print(f"  built {len(trips)} trips")


# --------------------------------------------------------------------------- posts

print("posts…")
post_raw = get_all("wp/v2/posts", {"status": "publish"})
post_media = media_lookup({p.get("featured_media") for p in post_raw})
posts = []
for p in post_raw:
    html = clean_html(p["content"]["rendered"])
    fm = post_media.get(p.get("featured_media"))
    y = p.get("yoast_head_json") or {}
    words = len(text_of(html).split())
    posts.append({
        "id": p["id"],
        "slug": p["slug"],
        "title": text_of(p["title"]["rendered"]),
        "excerpt": excerpt(p["excerpt"]["rendered"], 200),
        "html": html,
        "toc": toc(html),
        "published": p.get("date_gmt"),
        "modified": p.get("modified_gmt"),
        "cover": image_ref(fm["url"], fm["alt"] or text_of(p["title"]["rendered"])) if fm else None,
        "categories": [cat_by_id[i] for i in p.get("categories") or [] if i in cat_by_id and cat_by_id[i] != "uncategorized"],
        "tags": [tag_by_id[i] for i in p.get("tags") or [] if i in tag_by_id],
        "author": y.get("author") or "Base Camp Adventure",
        "readingMinutes": max(1, round(words / 220)),
        "seo": yoast(p),
    })
posts.sort(key=lambda p: p["published"] or "", reverse=True)
print(f"  built {len(posts)} posts")


# --------------------------------------------------------------------------- pages

print("pages…")
BROKEN_PAGES = {"online-payment-form"}
# The page list cannot be fetched with content: a payment shortcode on one page
# prints HTML ahead of the JSON. List ids first, then fetch pages one by one,
# so a single broken page cannot take the rest down with it.
page_ids = [p["id"] for p in get_all("wp/v2/pages", {"_fields": "id,slug"}) if p.get("slug") not in BROKEN_PAGES]
page_raw = [p for p in pmap(lambda i: get_json(f"{API}/wp/v2/pages/{i}"), page_ids) if isinstance(p, dict) and p.get("status") == "publish"]
page_media = media_lookup({p.get("featured_media") for p in page_raw})
pages = []
for p in page_raw:
    html = clean_html(p["content"]["rendered"])
    fm = page_media.get(p.get("featured_media"))
    pages.append({
        "id": p["id"],
        "slug": p["slug"],
        "parent": p.get("parent") or None,
        "title": text_of(p["title"]["rendered"]),
        "html": html,
        "toc": toc(html),
        "excerpt": excerpt(html, 200),
        "modified": p.get("modified_gmt"),
        "cover": image_ref(fm["url"], fm["alt"]) if fm else None,
        "seo": yoast(p),
    })
print(f"  built {len(pages)} pages")


# --------------------------------------------------------------------------- team

print("team…")
team_sitemap = fetch(f"{SITE}/tap_team-sitemap.xml") or b""
team_urls = re.findall(rb"<loc>([^<]+/team/[^<]+)</loc>", team_sitemap)
team = []
for url in [u.decode() for u in team_urls]:
    body = fetch(url)
    if not body:
        continue
    soup = BeautifulSoup(body, "html.parser")
    art = soup.select_one("article.tap_team") or soup.select_one("article") or soup
    name = (art.find("h1") or soup.find("h1")).get_text(" ", strip=True)
    img = art.select_one("img.attachment-travel-agency-team-detail") or art.find("img")
    src = img and (img.get("data-src") or img.get("src"))
    role_el = art.select_one(".designation, .team-designation, .post-designation, h1 + span, h1 + p")
    content = art.select_one(".entry-content") or art
    bio = clean_html(str(content))
    if role_el is None:
        # The theme prints the role as the first short line under the name.
        lines = [l.strip() for l in art.get_text("\n", strip=True).split("\n") if l.strip()]
        role = lines[1] if len(lines) > 1 and len(lines[1]) < 60 else ""
    else:
        role = role_el.get_text(" ", strip=True)
    team.append({
        "slug": url.rstrip("/").rsplit("/", 1)[1],
        "name": name,
        "role": role,
        "photo": image_ref(src, name) if src else None,
        "bio": bio,
        "excerpt": excerpt(bio, 220),
    })
order = ["shree-ghimire", "pratika", "prakash", "shiva-acharya"]
team.sort(key=lambda m: (order.index(m["slug"]) if m["slug"] in order else 99, m["name"]))
print(f"  built {len(team)} team members")


# --------------------------------------------------------------------------- menu

print("menu…")
menu = []
home_html = fetch(f"{SITE}/")
if home_html:
    home = BeautifulSoup(home_html, "html.parser")
    root_ul = home.select_one("ul#primary-menu")

    def walk(ul):
        out = []
        for li in ul.find_all("li", recursive=False):
            a = li.find("a", recursive=False)
            href = re.sub(r"^https?://(www\.)?basecampadventure\.com", "", (a.get("href") if a else "") or "") or "/"
            item = {"label": re.sub(r"\s+", " ", a.get_text(" ", strip=True)) if a else "", "href": href}
            sub = li.find("ul", recursive=False)
            if sub:
                item["children"] = walk(sub)
            out.append(item)
        return out

    menu = walk(root_ul) if root_ul else []
print(f"  {len(menu)} top-level items")


# --------------------------------------------------------------------------- images

taxonomies = {
    "destinations": [term(t, "destination") for t in dest_raw],
    "activities": [term(t, "activity") for t in act_raw],
    "difficulty": [term(t, "difficulty") for t in diff_raw],
    "tripTags": [term(t, "trip_tag") for t in tag_trip_raw],
    "categories": [term(t, "category") for t in cat_raw],
    "tags": [term(t, "tag") for t in tag_raw],
}

by_local: dict[str, list[str]] = {}
for url, local in media_queue.items():
    by_local.setdefault(local, []).append(url)
print(f"images… {len(by_local)} files from {len(media_queue)} references")
pmap(process_image, list(by_local.items()), workers=6)
print(f"  {len(media_map)} available")


def resolve(ref):
    """Swap queued image refs for final {src, w, h, alt}; drop missing ones."""
    if isinstance(ref, dict) and "_url" in ref:
        m = media_map.get(ref["_url"])
        if not m:
            return None
        return {"src": m["src"], "w": m["w"], "h": m["h"], "alt": ref["alt"]}
    if isinstance(ref, dict):
        return {k: resolve(v) for k, v in ref.items()}
    if isinstance(ref, list):
        return [x for x in (resolve(v) for v in ref) if x is not None]
    return ref


def resolve_html(html: str) -> str:
    """Give every content image its real size, so the page never shifts as photos load."""
    def repl(m):
        tag = m.group(0)
        orig = re.search(r'data-orig="([^"]+)"', tag)
        info = media_map.get(unescape(orig.group(1))) if orig else None
        if not info:
            return ""
        alt = re.search(r'alt="([^"]*)"', tag)
        return f'<img src="{info["src"]}" alt="{alt.group(1) if alt else ""}" width="{info["w"]}" height="{info["h"]}" loading="lazy" decoding="async"/>'
    return re.sub(r"<img\b[^>]*>", repl, html)


def finish(obj):
    if isinstance(obj, dict):
        return {k: (resolve_html(v) if isinstance(v, str) and "<img" in v else finish(v)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [finish(v) for v in obj]
    return obj


def write(name: str, data) -> None:
    data = finish(resolve(data))
    (CONTENT / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf8")
    print(f"  wrote src/content/{name}.json")


write("trips", trips)
write("posts", posts)
write("pages", pages)
write("team", team)
write("taxonomies", taxonomies)
write("menu", menu)
(CONTENT / "media-redirects.json").write_text(
    json.dumps({urllib.parse.urlparse(k).path: v["src"] for k, v in sorted(media_map.items())}, indent=1),
    encoding="utf8",
)
print("done.")
