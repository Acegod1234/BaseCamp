import "server-only";
import * as flags from "country-flag-icons/string/3x2";

/**
 * Who wrote a review and where they are from, read from the author line the
 * review was published with, e.g. "Peter D-Cornwall, United Kingdom" →
 * Peter D · Cornwall, United Kingdom · GB. A country is only given when the
 * line names it (or a US state, or a city that is unambiguous); otherwise
 * there is no flag.
 */

const names = new Intl.DisplayNames(["en"], { type: "region" });
const CODES = Object.keys(flags).filter((k) => /^[A-Z]{2}$/.test(k));
const BY_NAME = new Map<string, string>(CODES.map((c) => [names.of(c)?.toLowerCase() ?? c, c]));
for (const [alias, code] of Object.entries({
  england: "GB", scotland: "GB", wales: "GB", "northern ireland": "GB", uk: "GB", "great britain": "GB",
  "the netherlands": "NL", holland: "NL",
  usa: "US", "united states of america": "US", us: "US",
  "south korea": "KR", korea: "KR", "czech republic": "CZ", turkey: "TR", turkiye: "TR",
})) BY_NAME.set(alias, code);

const US_STATES = "alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming";
const CITIES: Record<string, string> = { "johor bahru": "MY", "kuala lumpur": "MY", penang: "MY", singapore: "SG", kathmandu: "NP" };

export type Reviewer = { name: string; place: string | null; country: string | null; code: string | null; flag: string | null };

export function reviewer(author: string): Reviewer {
  // "Name-Place, Country": the place starts after the first dash followed by a capital.
  const m = author.match(/^(.+?)-([A-Z].*)$/);
  let name = (m ? m[1] : author).trim();
  let place = m ? m[2].trim() : null;
  if (!m && author.includes(",")) {
    const [n, ...rest] = author.split(",");
    name = n.trim();
    place = rest.join(",").trim() || null;
  }
  if (place) place = place.replace(/\s*,\s*/g, ", ");

  let code: string | null = null;
  let written: string | null = null;
  if (place) {
    const parts = place.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean);
    const last = parts.at(-1) ?? "";
    code = BY_NAME.get(last) ?? null;
    // Keep the country as the reviewer wrote it ("Turkey", "The Netherlands").
    if (code) written = place.split(",").at(-1)!.trim();
    if (!code && new RegExp(`^(${US_STATES})$`).test(last)) code = "US";
    if (!code) code = CITIES[parts[0]] ?? CITIES[last] ?? null;
  }
  const country = written && !/^(england|scotland|wales|uk|usa|us)$/i.test(written) ? written.replace(/^the /i, "The ") : code ? (names.of(code) ?? null) : null;
  return { name, place, country, code, flag: code ? ((flags as Record<string, string>)[code] ?? null) : null };
}
