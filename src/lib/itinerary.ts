import type { ItineraryDay } from "@/lib/types";

/** Helpers for reading WordPress itinerary text. Safe on server and client. */

/** Pulls the overnight stop out of a WordPress itinerary title. */
export function placeOf(title: string): string {
  const named = [...title.matchAll(/([A-Z][\w'’.-]+(?:\s(?:[A-Z][\w'’.-]+|La|Ri|Kund))*)\s*\(\s*[\d,]{3,6}\s*m/g)];
  if (named.length) return named[named.length - 1][1].replace(/^(Trek|Fly|Drive|Hike|Walk|Return|Explore|Day)\s+/i, "");
  const to = title.match(/\bto\s+([A-Z][\w'’.-]+(?:\s[A-Z][\w'’.-]+)?)/g);
  if (to) return to[to.length - 1].replace(/^to\s+/, "");
  if (/kathmandu/i.test(title)) return "Kathmandu";
  return "";
}

/** "Trek to Namche (3,440 m), 6-7 hours." → "6–7 hours"; a flight's "35-40 minutes" too. */
export function durationOf(d: Pick<ItineraryDay, "title" | "hours">) {
  const t = d.title;
  const range = t.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  if (range) return `${range[1]}–${range[2]} ${/^m/i.test(range[3]) ? "minutes" : "hours"}`;
  const one = t.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  if (one) return `${one[1]} ${/^m/i.test(one[2]) ? "minutes" : Number(one[1]) === 1 ? "hour" : "hours"}`;
  return d.hours ? `${d.hours} ${d.hours === 1 ? "hour" : "hours"}` : null;
}

/**
 * Where the night is spent, from a day's title: the last place it goes "to",
 * or stays "in" or "at". "…continue to Everest Base Camp, and return to
 * Gorak Shep" → Gorak Shep.
 */
export function overnightOf(title: string): string {
  const hits = [...title.matchAll(/\b(?:to|in|at)\s+((?:Mt\.\s)?[A-Z][\w'’-]+(?:\s(?:[A-Z][\w'’-]+|La|Ri))*)/g)].map((m) => m[1]);
  // Viewpoints and peaks are side trips, not where the night is spent.
  const stays = hits
    .map((h) => (/Tribhu[vw]an|Kathmandu Airport/i.test(h) ? "Kathmandu" : h))
    .filter((h) => !/^(Hotel|The|Your|Our)$/i.test(h))
    .filter((h) => !/(\bRi|Peak|Hill|Patthar|Viewpoint|View Point|Airport)$/i.test(h));
  return stays.at(-1) ?? "";
}
