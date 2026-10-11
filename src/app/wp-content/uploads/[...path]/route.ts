import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Old WordPress image URLs (indexed in Google Images, linked from other sites)
 * answer with a permanent redirect to the converted WebP file.
 *
 * Google knows the full-size originals (photo.jpg) while the import recorded
 * the sizes used in content (photo-1024x683.jpg), so lookups ignore the size
 * suffix and letter case, and fall back to the converted file's own name.
 */
type Index = { exact: Map<string, string>; loose: Map<string, string>; files: Set<string> };
let index: Index | null = null;

/** "/wp-content/uploads/2024/11/Shree-Ghimire-300x400.jpg" → "2024/11/shree-ghimire" */
const looseKey = (p: string) =>
  p
    .replace(/^\/wp-content\/uploads\//, "")
    .replace(/\.\w+$/, "")
    .replace(/-\d{2,4}x\d{2,4}$/, "")
    .replace(/-(scaled|rotated)$/, "")
    .toLowerCase();

function load(): Index {
  if (index) return index;
  const map = JSON.parse(readFileSync(path.join(process.cwd(), "src/content/media-redirects.json"), "utf8")) as Record<string, string>;
  const exact = new Map(Object.entries(map));
  const loose = new Map<string, string>();
  // The largest recorded size wins for each original.
  for (const [k, v] of Object.entries(map).sort((a, b) => size(b[0]) - size(a[0]))) if (!loose.has(looseKey(k))) loose.set(looseKey(k), v);
  const files = new Set(JSON.parse(readFileSync(path.join(process.cwd(), "src/content/media-files.json"), "utf8")) as string[]);
  index = { exact, loose, files };
  return index;
}

const size = (p: string) => {
  const m = p.match(/-(\d{2,4})x\d{2,4}\.\w+$/);
  return m ? Number(m[1]) : 100000;
};

/** The importer's own file name: /media/2024/11/shree-ghimire.webp */
function onDisk(old: string) {
  const m = old.match(/^\/wp-content\/uploads\/(\d{4})\/(\d{2})\/(.+)\.\w+$/);
  if (!m) return null;
  const name = m[3].toLowerCase().replace(/-\d{2,4}x\d{2,4}$/, "");
  const slug = name.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  for (const candidate of [slug, `${slug}-scaled`, slug.replace(/-(scaled|rotated)$/, "")]) {
    const rel = `/media/${m[1]}/${m[2]}/${candidate}.webp`;
    if (load().files.has(rel)) return rel;
  }
  return null;
}

function lookup(old: string) {
  const { exact, loose } = load();
  return exact.get(old) ?? loose.get(looseKey(old)) ?? onDisk(old);
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const old = `/wp-content/uploads/${parts.join("/")}`;
  const target = lookup(old) ?? lookup(decodeURIComponent(old));
  if (!target) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 301, headers: { Location: target, "Cache-Control": "public, max-age=31536000" } });
}
