/**
 * Adds a YouTube video to src/content/videos.json, with its title, date,
 * length and description read from YouTube.
 *
 * Usage:
 *   node scripts/add-video.mjs <youtube-url> [--trip everest-base-camp-trek] [--trip ...] [--featured]
 *
 * A video tied to a trip shows on that trip's page; --featured also shows it
 * on the home page. Run again with the same URL to update it.
 */
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const url = args.find((a) => /youtu/.test(a));
const id = url?.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/)?.[1];
if (!id) {
  console.error("Usage: node scripts/add-video.mjs <youtube-url> [--trip slug] [--featured]");
  process.exit(1);
}
const trips = args.flatMap((a, i) => (a === "--trip" ? [args[i + 1]] : []));
const featured = args.includes("--featured");

const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36", "Accept-Language": "en" };
const oembed = await (await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, { headers: UA })).json();
const page = await (await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: UA })).text();
const meta = (name) => page.match(new RegExp(`<meta itemprop="${name}" content="([^"]*)"`))?.[1] ?? null;
// The description sits in the page's JSON as a JSON string; parse it as one.
const raw = page.match(/"shortDescription":("(?:[^"\\]|\\.)*")/)?.[1];
const description = (raw ? JSON.parse(raw) : "").replace(/\s+/g, " ").trim().slice(0, 500) || null;

const file = "src/content/videos.json";
const list = JSON.parse(readFileSync(file, "utf8"));
const entry = {
  id,
  title: oembed.title,
  description,
  uploadDate: meta("uploadDate") ?? meta("datePublished"),
  duration: meta("duration"),
  trips,
  featured,
};
const at = list.findIndex((v) => v.id === id);
if (at >= 0) list[at] = { ...list[at], ...entry, trips: [...new Set([...list[at].trips, ...trips])], featured: featured || list[at].featured };
else list.push(entry);
writeFileSync(file, JSON.stringify(list, null, 1));
console.log(`${at >= 0 ? "Updated" : "Added"}: ${entry.title} (${entry.uploadDate ?? "no date"}, ${entry.duration ?? "no length"})`);
