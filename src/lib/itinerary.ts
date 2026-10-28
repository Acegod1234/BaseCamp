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
export function durationOf(d: Pick<ItineraryDay, "title" | "hours"> & { html?: string }) {
  const t = d.title;
  const range = t.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  if (range) return `${range[1]}–${range[2]} ${/^m/i.test(range[3]) ? "minutes" : "hours"}`;
  const one = t.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i);
  if (one) return `${one[1]} ${/^m/i.test(one[2]) ? "minutes" : Number(one[1]) === 1 ? "hour" : "hours"}`;
  if (d.hours) return `${d.hours} ${d.hours === 1 ? "hour" : "hours"}`;
  const labelled = plainDayText(d.html ?? "").match(/(?:walking|trekking|driving|travel|flight)?\s*(?:duration|time|hours)\s*[:–-]\s*(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?\s*(hours?|hrs?|minutes?|mins?)?/i);
  if (!labelled) return null;
  const unit = /^m/i.test(labelled[3] ?? "") ? "minutes" : "hours";
  return labelled[2] ? `${labelled[1]}–${labelled[2]} ${unit}` : `${labelled[1]} ${unit}`;
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

/** Text normalization shared by all imported package itineraries. */
export function plainDayText(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/\s+/g, " ").trim();
}

/** Distances recorded in itinerary-extras.json; reuse only explicitly matching route sections. */
const recordedRoutes = [
  { from: "lukla", to: "phakding", km: 8 },
  { from: "phakding", to: "namche", km: 10 },
  { from: "namche", to: "tengboche", km: 10 },
  { from: "tengboche", to: "dingboche", km: 11 },
  { from: "dingboche", to: "lobuche", km: 8.5 },
  { from: "pheriche", to: "namche", km: 19 },
  { from: "namche", to: "lukla", km: 18 },
];

export function distanceOf(d: Pick<ItineraryDay, "title" | "html" | "distanceKm">): number | null {
  if (d.distanceKm && d.distanceKm > 0) return d.distanceKm;
  const text = plainDayText(`${d.title} ${d.html}`);
  const labelled = text.match(/(?:trek(?:king)?|walking|driving|travel|total)?\s*distance\s*[:–-]?\s*(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?\s*(km|kilomet(?:er|re)s?|miles?)\b/i);
  if (labelled) return Number(labelled[2] ?? labelled[1]) * (/^mi/i.test(labelled[3]) ? 1.609344 : 1);
  const km = text.match(/(\d+(?:\.\d+)?)\s*(?:km|kilomet(?:er|re)s?)\b/i);
  if (km && Number(km[1]) > 0 && Number(km[1]) < 80) return Number(km[1]);
  // Flight + trek days report the walking leg, not the flight distance.
  const walkingTitle = d.title.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ");
  if (/\b(?:fly|flight)\b[\s\S]*\bto Lukla\b[\s\S]*\b(?:trek|walk)(?:king)?\s+(?:from Lukla\s+)?to Phakding\b/i.test(walkingTitle)
    && !/\bPhakding\b[\s\S]*\b(?:then|continue|return|via|to)\b/i.test(walkingTitle)) return 8;
  // Avoid assigning a full leg to acclimatisation walks or multi-stop side trips.
  if (/rest|acclimati|side trip|return to|via|base camp/i.test(d.title)) return null;
  const title = d.title.replace(/\([^)]*\)/g, " ").toLowerCase();
  for (const route of recordedRoutes) {
    const pattern = new RegExp(`(?:from |trek |to )${route.from}(?: bazaar| bazar)?\\s+(?:to|–|-)\\s+${route.to}\\b`);
    if (pattern.test(title)) return route.km;
  }
  return null;
}

export function accommodationPlaceOf(d: Pick<ItineraryDay, "overnight" | "title" | "html">) {
  if (d.overnight?.trim()) return d.overnight.trim();
  if (/departure|depart for|fly (?:back )?home|onward destination/i.test(d.title)) return "";
  const text = plainDayText(d.html);
  const named = text.match(/(?:overnight(?: stay)?|stay overnight|O\/N)(?:\s+(?:at|in))?\s*:?\s*(?:(?:a|the)\s+)?(?:hotel|guest\s*house|lodge|teahouse)?\s*(?:at|in)?\s+((?:[A-Z][a-zA-Z’'-]+)(?:\s+(?:[A-Z][a-zA-Z’'-]+|La|Ri))*)/);
  if (named && !/^(Hotel|Guest|Lodge|The|Your|Our|After|At|In)$/.test(named[1])) return named[1];
  return overnightOf(d.title);
}

/** Published route lengths, not straight-line distances or walking-speed guesses.
 * Sources retained alongside each group so estimates can be reviewed independently.
 */
const estimatedRoutes = [
  ...[
    ["namche", "dole", 11, 12], ["dole", "machhermo", 7, 8],
    ["machhermo", "gokyo", 7, 8], ["machhermo", "namche", 14, 15],
  ].map(([from, to, min, max]) => ({ from: String(from), to: String(to), min: Number(min), max: Number(max), mode: "walk", source: "https://himalayanecologicaltrek.com/trip/gokyo-lake-trek" })),
  ...[
    ["jagat", "lokpa", 15, 15], ["lokpa", "chumling", 10, 10],
    ["chumling", "chhokangparo", 14, 14], ["chhokangparo", "nile", 10, 10],
    ["nile", "mu gompa", 9, 9],
  ].map(([from, to, min, max]) => ({ from: String(from), to: String(to), min: Number(min), max: Number(max), mode: "walk", source: "https://www.spadehimalaya.com/blog/tsum-valley-trek-itinerary-distance/" })),
  ...[
    ["jomsom", "kagbeni", 10.7, 10.7], ["kagbeni", "chele", 15.4, 15.4],
    ["chele", "syangboche", 11.5, 11.5], ["syangboche", "ghami", 9.3, 9.3],
    ["ghami", "tsarang", 10.7, 10.7], ["tsarang", "lo manthang", 11, 11],
  ].map(([from, to, min, max]) => ({ from: String(from), to: String(to), min: Number(min), max: Number(max), mode: "walk", source: "https://mustangnepal.com/how-long-is-upper-mustang-trek/" })),
  ...[
    ["syange", "dharapani", 14, 14], ["dharapani", "chame", 16, 16],
    ["chame", "pisang", 14, 14], ["pisang", "manang", 16, 16],
    ["manang", "yak kharka", 9.8, 11], ["tatopani", "ghorepani", 17, 17],
  ].map(([from, to, min, max]) => ({ from: String(from), to: String(to), min: Number(min), max: Number(max), mode: "walk", source: "https://www.ecoholidaysnepal.com/annapurna-circuit-trek-itinerary" })),
  ...[
    ["tadapani", "chhomrong", 9, 9], ["chhomrong", "bamboo", 8, 8],
    ["bamboo", "himalaya hotel", 9, 9], ["annapurna base camp", "bamboo", 17, 17],
    ["tikhedhunga", "ghorepani", 13, 13], ["nayapul", "tikhedhunga", 12, 12],
  ].map(([from, to, min, max]) => ({ from: String(from), to: String(to), min: Number(min), max: Number(max), mode: "walk", source: "https://himalayatrekkingnepal.com/blog/annapurna-base-camp-trek-complete-guide" })),
  ...[
    ["machha khola", "jagat", 21.8, 21.8], ["jagat", "deng", 23.5, 23.5],
    ["deng", "namrung", 20, 20], ["namrung", "shyala", 10, 10],
    ["samagaun", "samdo", 5.7, 8], ["samdo", "dharmasala", 3, 3],
    ["bimthang", "dharapani", 21, 21],
  ].map(([from, to, min, max]) => ({ from: String(from), to: String(to), min: Number(min), max: Number(max), mode: "walk", source: "https://www.magicalnepal.com/travel-guide/manaslu/manaslu-circuit-trek-distance/" })),
  ...[
    ["syabrubesi", "lama hotel", 11, 12], ["lama hotel", "mundu", 8, 8],
    ["mundu", "kyanjin gompa", 7, 7], ["kyanjin gompa", "lama hotel", 15, 15],
  ].map(([from, to, min, max]) => ({ from: String(from), to: String(to), min: Number(min), max: Number(max), mode: "walk", source: "https://www.escapehimalaya.com/trip/langtang-valley-trek" })),
  { from: "kathmandu", to: "pokhara", min: 200, max: 200, mode: "road", source: "https://www.ecoholidaysnepal.com/annapurna-circuit-trek-itinerary" },
  { from: "kathmandu", to: "syabrubesi", min: 122, max: 130, mode: "road", source: "https://www.escapehimalaya.com/trip/langtang-valley-trek" },
  { from: "kathmandu", to: "machha khola", min: 155, max: 160, mode: "road", source: "https://www.magicalnepal.com/travel-guide/manaslu/manaslu-circuit-trek-distance/" },
];

function routeText(text: string) {
  return text.toLowerCase().replace(/\([^)]*\)/g, " ")
    .replace(/syabru\s*b[ae]n?si|syaphru\s*besi/g, "syabrubesi")
    .replace(/chom+rong|chhom+rong/g, "chhomrong")
    .replace(/sama\s+gaon|sama\s+gaun|sama\s+gon/g, "samagaun")
    .replace(/machh?a\s*khola/g, "machha khola")
    .replace(/dharma\s*sh?ala|dharamsala/g, "dharmasala")
    .replace(/namche\s+ba[sz]aar|namche\s+bazar/g, "namche")
    .replace(/lo-manthang/g, "lo manthang")
    .replace(/charang/g, "tsarang")
    .replace(/syanboche/g, "syangboche")
    .replace(/chhokang\s*paro|chhokang\s*paroe/g, "chhokangparo")
    .replace(/kyang?jin(?:g)?(?:\s+gompa)?/g, "kyanjin gompa")
    .replace(/himalaya(?! hotel)/g, "himalaya hotel")
    .replace(/\s+/g, " ").trim();
}

/** Only a single, identifiable route leg may receive an estimate. */
export function distanceEstimateOf(d: ItineraryDay, previous?: ItineraryDay) {
  if (distanceOf(d) !== null) return null;
  const title = routeText(d.title);
  if (/rest|acclimati|explor|sightsee|side trip|return to|via|base camp.*base camp|fly|flight|helicopter|summit|climb|then|and trek|and drive/i.test(title)) return null;
  const road = /drive|driving|jeep|bus/i.test(title);
  if (!road && !/trek|walk|hike/i.test(title)) return null;
  const previousStop = previous ? routeText(accommodationPlaceOf(previous)) : "";
  for (const route of estimatedRoutes) {
    if ((route.mode === "road") !== road) continue;
    for (const [from, to] of [[route.from, route.to], [route.to, route.from]]) {
      // Never fill one leg of an explicit multi-destination day.
      const explicit = new RegExp(`\\b${from}\\s+(?:to|–|-)\\s+${to}\\b`);
      const destination = new RegExp(`\\bto\\s+${to}\\b`);
      const matches = explicit.test(title) || (previousStop === from && destination.test(title) && !/\bfrom\b/.test(title));
      if (!matches) continue;
      const endpoint = title.indexOf(to, title.indexOf(from) >= 0 ? title.indexOf(from) + from.length : 0) + to.length;
      if (/\bto\b|\band\b|\bthen\b/.test(title.slice(endpoint))) continue;
      return { minKm: route.min, maxKm: route.max, source: route.source };
    }
  }
  return null;
}

export function distanceLabels(km: number | null, estimate: ReturnType<typeof distanceEstimateOf>) {
  if (km === null && !estimate) return null;
  const min = km ?? estimate!.minKm;
  const max = km ?? estimate!.maxKm;
  const range = (factor: number, digits: number) => {
    const format = (value: number) => (value * factor).toLocaleString("en-US", { maximumFractionDigits: digits });
    return min === max ? format(min) : `${format(min)}–${format(max)}`;
  };
  return { metric: `${range(1, 1)} km`, imperial: `${range(1 / 1.609344, 2)} miles / ${range(1000 / 0.3048, 0)} ft` };
}
