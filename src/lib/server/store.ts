import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Append-only record of enquiries and bookings.
 *
 * Until the admin database exists, every submission is kept as one JSON line
 * in .data/ (outside the repository). Nothing a traveller sends is lost while
 * the admin is being built; the importer for the admin reads these files.
 */
// Serverless hosts (Vercel) only allow writes under /tmp, which is wiped
// between cold starts: fine for a preview, and the admin database replaces it.
const dir = process.env.VERCEL ? "/tmp/bca-data" : path.join(process.cwd(), ".data");

export async function record(kind: "enquiries" | "bookings", entry: Record<string, unknown>) {
  const line = JSON.stringify({ kind, ...entry, at: new Date().toISOString() });
  // Always in the server log, so nothing is lost even if the disk write fails.
  console.info(`[${kind}] ${line}`);
  try {
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, `${kind}.jsonl`), `${line}\n`, "utf8");
  } catch (error) {
    console.error(`[${kind}] could not write to ${dir}`, error);
  }
}

/** A short reference a traveller can quote on the phone. */
export function reference(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

/* Small in-memory rate limiter: enough to stop a script hammering a form. */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit = 6, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > limit;
}
