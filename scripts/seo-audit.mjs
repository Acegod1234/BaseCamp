/**
 * Technical SEO audit of the whole site, from its own sitemap.
 *
 * For every page: status 200, a title and description (present, sensible
 * length, unique), exactly one H1, a canonical pointing at itself, no stray
 * noindex, lang, Open Graph and Twitter tags, JSON-LD that parses (with the
 * fields Google needs for Product, Breadcrumb, FAQ and Video), alt text on
 * images. Then every internal link found on those pages is requested, so
 * broken links and redirect chains are caught. PDFs and robots.txt too.
 *
 * Usage: node scripts/seo-audit.mjs [base=http://localhost:3000]
 * Writes .data/seo-audit.json; exits 1 if there are errors.
 */
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const SITE = "https://basecampadventure.com";

const errors = [];
const warnings = [];
const err = (url, msg) => errors.push(`${url}  ${msg}`);
const warn = (url, msg) => warnings.push(`${url}  ${msg}`);

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1];
const metaContent = (html, key, by = "name") => {
  const tag = html.match(new RegExp(`<meta[^>]*${by}="${key}"[^>]*>`, "i"))?.[0];
  return tag ? decode(attr(tag, "content") ?? "") : null;
};

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

/* Sitemap and robots */
const robots = await (await fetch(`${BASE}/robots.txt`)).text();
if (!/Sitemap:\s*\S+sitemap\.xml/i.test(robots)) err("/robots.txt", "no Sitemap line");
if (/Disallow:\s*\/\s*$/m.test(robots)) err("/robots.txt", "disallows the whole site");

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ""));
const pages = urls.filter((u) => !u.endsWith(".pdf"));
const pdfs = urls.filter((u) => u.endsWith(".pdf"));
console.log(`Sitemap: ${pages.length} pages, ${pdfs.length} PDFs`);

const titles = new Map();
const descriptions = new Map();
const links = new Map(); // internal path -> first page linking to it
const typesSeen = new Map();
let imagesTotal = 0;
let imagesNoAlt = 0;

await pool(pages, 8, async (path) => {
  const res = await fetch(BASE + path, { redirect: "manual" });
  if (res.status !== 200) return err(path, `status ${res.status} (sitemap URLs must answer 200)`);
  const html = await res.text();
  const head = html.slice(0, html.indexOf("</head>") + 7);

  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").trim();
  if (!title) err(path, "no <title>");
  else {
    if (title.length > 70) warn(path, `title ${title.length} chars (Google shows ~60): "${title}"`);
    if (title.length < 15) warn(path, `short title: "${title}"`);
    titles.set(title, [...(titles.get(title) ?? []), path]);
  }
  const desc = metaContent(head, "description");
  if (!desc) err(path, "no meta description");
  else {
    if (desc.length > 175) warn(path, `description ${desc.length} chars`);
    if (desc.length < 50) warn(path, `short description (${desc.length} chars)`);
    descriptions.set(desc, [...(descriptions.get(desc) ?? []), path]);
  }

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) err(path, `${h1} <h1> elements`);

  const canonical = head.match(/<link[^>]*rel="canonical"[^>]*>/)?.[0];
  const href = canonical ? attr(canonical, "href") : null;
  if (!href) err(path, "no canonical");
  else if (href !== SITE + path) err(path, `canonical points elsewhere: ${href}`);

  const robotsMeta = metaContent(head, "robots");
  if (robotsMeta && /noindex/i.test(robotsMeta)) err(path, `noindex on a sitemap URL (${robotsMeta})`);
  if (!/<html[^>]*\slang="en/.test(html)) err(path, "no lang on <html>");
  if (!/<meta[^>]*name="viewport"/.test(head)) err(path, "no viewport meta");

  for (const p of ["og:title", "og:description", "og:image", "og:url"]) if (!metaContent(head, p, "property")) err(path, `no ${p}`);
  if (!metaContent(head, "twitter:card")) warn(path, "no twitter:card");

  // Structured data
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch {
      err(path, "JSON-LD does not parse");
      continue;
    }
    for (const item of (Array.isArray(data) ? data : [data]).flatMap((d) => d["@graph"] ?? [d])) {
      const types = [].concat(item["@type"] ?? []);
      for (const t of types) typesSeen.set(t, (typesSeen.get(t) ?? 0) + 1);
      if (types.includes("Product")) {
        if (!item.name) err(path, "Product without name");
        if (!item.offers && !item.aggregateRating && !item.review) err(path, "Product needs offers, aggregateRating or review");
        if (item.offers && (item.offers.price === undefined || !item.offers.priceCurrency)) err(path, "Offer without price/priceCurrency");
        if (item.offers && !item.offers.priceValidUntil) warn(path, "Offer without priceValidUntil");
        if (item.aggregateRating && !(item.aggregateRating.reviewCount || item.aggregateRating.ratingCount)) err(path, "AggregateRating without a count");
      }
      if (types.includes("BreadcrumbList") && !item.itemListElement?.length) err(path, "empty BreadcrumbList");
      if (types.includes("FAQPage") && !item.mainEntity?.length) err(path, "empty FAQPage");
      if (types.includes("VideoObject") && (!item.thumbnailUrl || !item.uploadDate)) warn(path, "VideoObject without thumbnail or uploadDate");
      if ((types.includes("BlogPosting") || types.includes("Article")) && (!item.headline || !item.datePublished)) err(path, "Article without headline/datePublished");
    }
  }
  if (path !== "/" && !/"@type":"BreadcrumbList"/.test(html)) warn(path, "no BreadcrumbList");

  // Images
  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    imagesTotal++;
    if (!/\salt="/.test(img[0])) {
      imagesNoAlt++;
      if (imagesNoAlt <= 15) warn(path, `img without alt: ${img[0].slice(0, 120)}`);
    }
  }

  // Internal links (rendered HTML only, not the RSC payload)
  const body = html.slice(html.indexOf("<body"), html.indexOf("<script id=\"__NEXT_DATA") > 0 ? html.indexOf("<script id=\"__NEXT_DATA") : undefined);
  for (const a of body.matchAll(/<a\b[^>]*\shref="([^"#?]*)[^"]*"/g)) {
    let h = decode(a[1]);
    if (h.startsWith(SITE)) h = h.slice(SITE.length) || "/";
    if (!h.startsWith("/") || h.startsWith("//")) continue;
    if (!links.has(h)) links.set(h, path);
  }
});

for (const [t, ps] of titles) if (ps.length > 1) warn(ps[0], `duplicate title on ${ps.length} pages: "${t}" (${ps.slice(1, 4).join(", ")})`);
for (const [d, ps] of descriptions) if (ps.length > 1) warn(ps[0], `duplicate description on ${ps.length} pages (${ps.slice(1, 4).join(", ")})`);

/* Internal links: every one must answer 200, or one permanent redirect to 200 */
const toCheck = [...links.keys()].filter((p) => !pages.includes(p));
console.log(`Checking ${toCheck.length} more internal link targets`);
await pool(toCheck, 10, async (path) => {
  let res = await fetch(BASE + path, { redirect: "manual" });
  if (res.status === 200) return;
  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get("location");
    const next = await fetch(new URL(loc, BASE + path), { redirect: "manual" });
    if (next.status === 200) {
      if (res.status !== 308 && res.status !== 301) warn(links.get(path), `links to ${path}, which redirects temporarily (${res.status})`);
      else warn(links.get(path), `links to ${path}, which redirects to ${loc} (link straight to it)`);
      return;
    }
    return err(links.get(path), `links to ${path} -> ${loc} -> ${next.status}`);
  }
  err(links.get(path), `broken link to ${path} (${res.status})`);
});

/* PDFs */
await pool(pdfs, 4, async (path) => {
  const res = await fetch(BASE + path);
  const type = res.headers.get("content-type") ?? "";
  if (res.status !== 200 || !type.includes("pdf")) err(path, `PDF answers ${res.status} ${type}`);
  if (/noindex/i.test(res.headers.get("x-robots-tag") ?? "")) err(path, "PDF is noindex");
  await res.arrayBuffer();
});

mkdirSync(".data", { recursive: true });
writeFileSync(".data/seo-audit.json", JSON.stringify({ at: new Date().toISOString(), base: BASE, errors, warnings, structuredData: Object.fromEntries(typesSeen), imagesTotal, imagesNoAlt }, null, 1));
console.log(`\nStructured data types: ${[...typesSeen].map(([t, n]) => `${t} ${n}`).join(", ")}`);
console.log(`Images: ${imagesTotal}, without alt: ${imagesNoAlt}`);
console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
for (const e of errors.slice(0, 60)) console.log("ERROR  " + e);
for (const w of warnings.slice(0, 60)) console.log("warn   " + w);
process.exit(errors.length ? 1 : 0);
