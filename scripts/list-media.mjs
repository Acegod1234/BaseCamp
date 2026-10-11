/**
 * Writes src/content/media-files.json: every converted photo under public/media.
 * The old-image redirect (src/app/wp-content/uploads) uses it to find a photo by
 * its own name, where public/ is not readable at runtime (serverless hosts).
 * Run after scripts/import-wordpress.py.
 */
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "public");
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(path.join(root, "media")).map((f) => "/" + path.relative(root, f).replaceAll("\\", "/")).sort();
writeFileSync(path.join(process.cwd(), "src", "content", "media-files.json"), JSON.stringify(files));
console.log(`${files.length} media files listed`);
