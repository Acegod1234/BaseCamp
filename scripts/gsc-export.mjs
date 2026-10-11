/**
 * Saves what basecampadventure.com ranks for today, from Google Search Console,
 * so nothing that earns clicks is lost when the new site goes live.
 *
 * Needs a Google Cloud service account with the Search Console API enabled,
 * added in Search Console (Settings → Users and permissions) as a user with
 * "Full" or "Restricted" access. Download its JSON key and run:
 *
 *   node scripts/gsc-export.mjs --key path/to/key.json [--site sc-domain:basecampadventure.com] [--months 16]
 *
 * Writes to .data/gsc/:
 *   pages.csv          every page with clicks, impressions, CTR and position
 *   queries.csv        every search term
 *   page-queries.csv   which terms bring traffic to which page
 *   protect.txt        pages with clicks: run scripts/check-urls.mjs against these first
 */

import { createSign } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const arg = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const keyFile = arg("--key", process.env.GSC_KEY_FILE);
const site = arg("--site", "sc-domain:basecampadventure.com");
const months = Number(arg("--months", "16"));
if (!keyFile) {
  console.error("Missing --key path/to/service-account.json (see the comment at the top of this file).");
  process.exit(1);
}

const key = JSON.parse(readFileSync(keyFile, "utf8"));
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const claims = { iss: key.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 };
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64(claims)}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
  });
  if (!res.ok) throw new Error(`token: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

const day = (d) => d.toISOString().slice(0, 10);
const end = new Date(Date.now() - 2 * 86400000);
const start = new Date(end);
start.setMonth(start.getMonth() - months);

async function query(access, dimensions) {
  const rows = [];
  for (let startRow = 0; ; startRow += 25000) {
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: day(start), endDate: day(end), dimensions, rowLimit: 25000, startRow, dataState: "final" }),
    });
    if (!res.ok) throw new Error(`${dimensions.join("+")}: ${res.status} ${await res.text()}`);
    const batch = (await res.json()).rows ?? [];
    rows.push(...batch);
    if (batch.length < 25000) return rows;
  }
}

const csv = (headers, rows) =>
  [headers.join(","), ...rows.map((r) => r.map((v) => (typeof v === "string" ? `"${v.replaceAll('"', '""')}"` : v)).join(","))].join("\n");
const metrics = (r) => [r.clicks, r.impressions, Number((r.ctr * 100).toFixed(2)), Number(r.position.toFixed(1))];

const access = await token();
console.log(`${site}: ${day(start)} to ${day(end)}`);
const pages = (await query(access, ["page"])).sort((a, b) => b.clicks - a.clicks);
const queries = (await query(access, ["query"])).sort((a, b) => b.clicks - a.clicks);
const pageQueries = (await query(access, ["page", "query"])).sort((a, b) => b.clicks - a.clicks);

mkdirSync(".data/gsc", { recursive: true });
writeFileSync(".data/gsc/pages.csv", csv(["page", "clicks", "impressions", "ctr_percent", "position"], pages.map((r) => [r.keys[0], ...metrics(r)])));
writeFileSync(".data/gsc/queries.csv", csv(["query", "clicks", "impressions", "ctr_percent", "position"], queries.map((r) => [r.keys[0], ...metrics(r)])));
writeFileSync(".data/gsc/page-queries.csv", csv(["page", "query", "clicks", "impressions", "ctr_percent", "position"], pageQueries.map((r) => [r.keys[0], r.keys[1], ...metrics(r)])));
writeFileSync(".data/gsc/protect.txt", pages.filter((r) => r.clicks > 0).map((r) => new URL(r.keys[0]).pathname).join("\n"));

console.log(`${pages.length} pages, ${queries.length} queries saved to .data/gsc/`);
console.log("Top 10 pages by clicks:");
for (const r of pages.slice(0, 10)) console.log(`  ${String(r.clicks).padStart(6)}  pos ${r.position.toFixed(1).padStart(5)}  ${new URL(r.keys[0]).pathname}`);
