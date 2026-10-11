import type { Trip } from "@/lib/types";

/**
 * "Trip information": the ten fields the company asked for, in their order.
 * Each one shows only when there is a real value for it, from the trip's own
 * data, its itinerary or its text, or from the admin's overrides
 * (src/content/trip-info.json, where `hidden` switches a field off).
 */

export type InfoKey = "duration" | "start" | "end" | "altitude" | "group" | "distance" | "difficulty" | "destination" | "type" | "season";
export type InfoOverrides = Partial<Record<InfoKey, string>> & { hidden?: InfoKey[] };
export type InfoItem = { key: InfoKey; label: string; value: string };

const LABELS: Record<InfoKey, string> = {
  duration: "Duration",
  start: "Start point",
  end: "End point",
  altitude: "Maximum altitude",
  group: "Group size",
  distance: "Total distance",
  difficulty: "Difficulty level",
  destination: "Destination",
  type: "Trip type",
  season: "Best season",
};

const DIFFICULTY: Record<string, string> = { easy: "Easy", medium: "Moderate", moderate: "Moderate", hard: "Challenging", extreme: "Strenuous" };
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
const fact = (trip: Trip, label: RegExp) => trip.facts.find((f) => label.test(f.label))?.value?.trim() || null;

/** Towns a trip can start or end in, as they are written in the itineraries. */
const PLACES: [RegExp, string][] = [
  [/\bK\w{0,2}thmandu\b|\bTribhu[vw]an\b/i, "Kathmandu"],
  [/\bPokhara\b/i, "Pokhara"],
  [/\bLhasa\b/i, "Lhasa"],
  [/\bParo\b/i, "Paro"],
  [/\bThimphu\b/i, "Thimphu"],
  [/\bLukla\b/i, "Lukla"],
  [/\bNepalgunj\b/i, "Nepalgunj"],
  [/\bBhairahawa\b/i, "Bhairahawa"],
];
const placeIn = (text: string) => PLACES.find(([re]) => re.test(text))?.[1] ?? null;

/** Day 1 "Arrival in Kathmandu…" → Kathmandu. Only when the day says so plainly. */
function startPoint(trip: Trip) {
  const t = trip.itinerary[0]?.title ?? "";
  return /arriv/i.test(t) ? placeIn(t) : null;
}

/** Last day "Departure from Kathmandu…" / "Fly back to Kathmandu" → Kathmandu. */
function endPoint(trip: Trip) {
  const t = trip.itinerary.at(-1)?.title ?? "";
  return /depart|back to|return|drive to|fly to|transfer to/i.test(t) ? placeIn(t) : null;
}

/** "Spring and Autumn are the best time…" in the trip's own text. */
function bestSeason(trip: Trip) {
  const text = plain(`${trip.overview} ${trip.sections.map((s) => s.html).join(" ")}`);
  const S = "(spring|autumn|winter|summer|monsoon)";
  const m =
    text.match(new RegExp(`${S}\\s*(?:\\([^)]*\\))?\\s*(?:and|&)\\s*${S}\\s*(?:\\([^)]*\\))?\\s*(?:seasons?\\s*)?(?:are|is)\\s*(?:the\\s*)?best`, "i")) ??
    text.match(new RegExp(`best\\s+(?:time|season)s?[^.]{0,60}?\\b(?:are|is)\\s+(?:during\\s+|in\\s+)?(?:the\\s+)?${S}(?:\\s*(?:and|&)\\s*${S})?`, "i"));
  if (!m) return null;
  const seasons = m.slice(1).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase());
  return [...new Set(seasons)].join(" and ");
}

export function tripInfo(trip: Trip, ctx: { region?: string | null; activity?: string | null; overrides?: InfoOverrides }): InfoItem[] {
  const o = ctx.overrides ?? {};
  const derived: Record<InfoKey, string | null> = {
    duration: fact(trip, /duration/i) ?? `${trip.days} ${trip.days === 1 ? "Day" : "Days"}`,
    start: startPoint(trip),
    end: endPoint(trip),
    altitude: trip.maxAltitude ? `${trip.maxAltitude.toLocaleString("en-US")} m / ${Math.round(trip.maxAltitude * 3.28084).toLocaleString("en-US")} ft` : null,
    group: fact(trip, /group/i) ?? (trip.groupSize?.min ? `Min. ${trip.groupSize.min} Pax` : null),
    distance: null,
    difficulty: trip.difficulty ? (DIFFICULTY[trip.difficulty] ?? trip.difficulty) : null,
    destination: fact(trip, /destination/i) ?? ctx.region ?? null,
    type: ctx.activity ?? null,
    season: bestSeason(trip),
  };
  return (Object.keys(LABELS) as InfoKey[])
    .filter((k) => !o.hidden?.includes(k))
    .map((k) => ({ key: k, label: LABELS[k], value: (o[k] ?? derived[k] ?? "").trim() }))
    .filter((x) => x.value);
}
