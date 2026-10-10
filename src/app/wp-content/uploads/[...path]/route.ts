import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Old WordPress image URLs (indexed in Google Images, linked from other sites)
 * answer with a permanent redirect to the converted WebP file.
 */
let map: Record<string, string> | null = null;
function lookup(p: string) {
  map ??= JSON.parse(readFileSync(path.join(process.cwd(), "src/content/media-redirects.json"), "utf8")) as Record<string, string>;
  return map[p] ?? map[p.replace(/-\d{2,4}x\d{2,4}(?=\.\w+$)/, "")];
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const old = `/wp-content/uploads/${parts.join("/")}`;
  const target = lookup(old) ?? lookup(decodeURIComponent(old));
  if (!target) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 301, headers: { Location: target, "Cache-Control": "public, max-age=31536000" } });
}
