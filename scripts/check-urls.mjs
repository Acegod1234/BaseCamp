/**
 * Launch check: every URL Google knows from the live WordPress site must work
 * on the new site, either directly (200) or through one permanent redirect to
 * a page that works.
 *
 * Reads the live sitemaps (pages and images), requests each path from the new
 * site and reports anything that 404s, errors, or redirects badly.
 *
 * Usage:
 *   node scripts/check-urls.mjs [newBase] [--live https://basecampadventure.com] [--no-images] [--paths .data/gsc/protect.txt]
 *   e.g. node scripts/check-urls.mjs http://localhost:3000
 *
 * Writes the full report to .data/url-check.json.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const NEW = (args.find((a) => /^https?:\/\//.test(a) && args[args.indexOf(a) - 1] !== "--live") ?? "http://localhost:3000").replace(/\/$/, "");
const LIVE = (args.includes("--live") ? args[args.indexOf("--live") + 1] : "https://basecampadventure.com").replace(/\/$/, "");
const IMAGES = !args.includes("--no-images");
// Extra paths to check, one per line: by default the pages Search Console says earn clicks.
const EXTRA = args.includes("--paths") ? args[args.indexOf("--paths") + 1] : existsSync(".data/gsc/protect.txt") ? ".data/gsc/protect.txt" : null;
// The live host blocks unknown bots, so this reads like a normal browser.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36";

const locs = (xml, tag) => [...xml.matchAll(new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[)?([^<\\]]+)`, "g"))].map((m) => m[1].trim());

async function text(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/** Follows redirects by hand so every hop is recorded. */
async function check(path) {
  const hops = [];
  let url = NEW + path;
  for (let i = 0; i < 6; i++) {
    let res;
    try {
      res = await fetch(url, { redirect: "manual", headers: { "User-Agent": UA } });
    } catch (e) {
      return { path, ok: false, status: "error", hops, error: String(e) };
    }
    hops.push(res.status);
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { path, ok: false, status: res.status, hops, error: "redirect without Location" };
      url = new URL(loc, url).href;
      if (!url.startsWith(NEW)) return { path, ok: false, status: res.status, hops, final: url, error: "redirects off-site" };
      continue;
    }
    const temporary = hops.slice(0, -1).some((s) => s === 302 || s === 307);
    return {
      path,
      ok: res.status === 200 && !temporary && hops.length <= 3,
      status: res.status,
      hops,
      final: url.slice(NEW.length),
      ...(temporary ? { error: "temporary redirect (302/307) loses ranking signals" } : {}),
      ...(hops.length > 3 ? { error: "redirect chain longer than two hops" } : {}),
    };
  }
  return { path, ok: false, status: "loop", hops, error: "too many redirects" };
}

async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k]);
        if ((k + 1) % 200 === 0) process.stdout.write(`  ${k + 1}/${items.length}\n`);
      }
    }),
  );
  return out;
}

const index = await text(`${LIVE}/sitemap_index.xml`);
const maps = locs(index, "loc");
const pages = new Set();
const images = new Set();
for (const m of maps) {
  const xml = await text(m);
  for (const u of locs(xml.replace(/<image:image>[\s\S]*?<\/image:image>/g, ""), "loc")) pages.add(new URL(u).pathname);
  for (const u of locs(xml, "image:loc")) if (u.startsWith(LIVE)) images.add(new URL(u).pathname);
  console.log(`${m.split("/").pop()}: read`);
}

if (EXTRA) {
  for (const line of readFileSync(EXTRA, "utf8").split(/\r?\n/)) if (line.trim().startsWith("/")) pages.add(line.trim());
  console.log(`+ paths from ${EXTRA}`);
}

console.log(`\nChecking ${pages.size} pages${IMAGES ? ` and ${images.size} images` : ""} on ${NEW}\n`);
const pageResults = await pool([...pages], 8, check);
const imageResults = IMAGES ? await pool([...images], 12, check) : [];

const bad = [...pageResults, ...imageResults].filter((r) => !r.ok);
const redirected = pageResults.filter((r) => r.ok && r.hops.length > 1);
mkdirSync(".data", { recursive: true });
writeFileSync(".data/url-check.json", JSON.stringify({ checkedAt: new Date().toISOString(), live: LIVE, new: NEW, pages: pageResults, images: imageResults }, null, 1));

console.log(`Pages:  ${pageResults.filter((r) => r.ok).length}/${pageResults.length} OK (${redirected.length} through a 301/308)`);
if (IMAGES) console.log(`Images: ${imageResults.filter((r) => r.ok).length}/${imageResults.length} OK`);
if (bad.length) {
  console.log(`\n${bad.length} problems:`);
  for (const r of bad.slice(0, 200)) console.log(`  ${String(r.status).padEnd(5)} ${r.path}${r.final && r.final !== r.path ? ` -> ${r.final}` : ""}${r.error ? `  (${r.error})` : ""}`);
}
process.exit(bad.length ? 1 : 0);
