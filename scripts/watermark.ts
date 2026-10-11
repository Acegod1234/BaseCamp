/**
 * Puts the Base Camp Adventure logo on every photograph the site serves:
 * public/photos (banners, up to 4K) and public/media (trip, blog and team photos).
 *
 * Safe to run again and again. The first time a file is marked, its clean
 * original is kept in .cache/clean/, and every later run marks that original,
 * so a photo never gets two logos. A file replaced by the importer or by
 * prepare-photos.py is treated as a new original.
 *
 * Usage:  node --experimental-strip-types scripts/watermark.ts [--force] [--only photos|media] [--restore]
 *   --force    re-mark every file from its clean original (after changing the logo)
 *   --restore  put the clean originals back and stop
 */

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { watermark } from "../src/lib/watermark.ts";

const ROOT = process.cwd();
const CLEAN = path.join(ROOT, ".cache", "clean");
const MANIFEST = path.join(ROOT, ".cache", "watermark.json");
const args = process.argv.slice(2);
const force = args.includes("--force");
const restore = args.includes("--restore");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const sha1 = (b: Buffer) => createHash("sha1").update(b).digest("hex");
const walk = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(webp|jpe?g|png)$/i.test(e.name) ? [path.join(dir, e.name)] : []))
    : [];

// Photos that already carry the company logo in their artwork (blog graphics).
const SKIP_FILE = path.join(ROOT, "scripts", "brand", "no-watermark.txt");
const skip = new Set(existsSync(SKIP_FILE) ? readFileSync(SKIP_FILE, "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#")) : []);

const manifest: Record<string, string> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const dirs = [only !== "media" && "public/photos", only !== "photos" && "public/media"].filter(Boolean) as string[];
const files = dirs.flatMap((d) => walk(path.join(ROOT, d)));

let marked = 0;
let skipped = 0;
let small = 0;

async function one(file: string) {
  const rel = path.relative(ROOT, file).replaceAll("\\", "/");
  const clean = path.join(CLEAN, rel);
  const current = readFileSync(file);
  const isOurs = manifest[rel] === sha1(current);

  if (restore) {
    if (isOurs && existsSync(clean)) copyFileSync(clean, file), marked++;
    delete manifest[rel];
    return;
  }
  if (skip.has(rel)) {
    // Put back the clean original if an earlier run marked it.
    if (isOurs && existsSync(clean)) copyFileSync(clean, file);
    delete manifest[rel];
    return void small++;
  }
  if (isOurs && !force) return void skipped++;
  if (!isOurs) {
    mkdirSync(path.dirname(clean), { recursive: true });
    writeFileSync(clean, current);
  }
  const out = await watermark(readFileSync(clean), { quality: rel.startsWith("public/photos/") ? 84 : 82 });
  if (!out) return void small++;
  writeFileSync(file, out);
  manifest[rel] = sha1(out);
  marked++;
}

const queue = [...files];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let f = queue.shift(); f; f = queue.shift()) {
      try {
        await one(f);
      } catch (e) {
        console.error("failed", f, (e as Error).message);
      }
      const done = files.length - queue.length;
      if (done % 100 === 0) console.log(`${done}/${files.length}`);
    }
  }),
);
mkdirSync(path.dirname(MANIFEST), { recursive: true });
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0));
console.log(restore ? `restored ${marked}` : `marked ${marked}, already marked ${skipped}, skipped (small or listed) ${small}, of ${files.length}`);
