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

