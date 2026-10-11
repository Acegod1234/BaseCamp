import { getLiveTerms, getPostCards, getTripCards } from "@/lib/content";

export const dynamic = "force-static";

/**
 * The data behind site search (Ctrl+K): every trip, region, activity and
 * guide in compact rows. Fetched only when someone opens search.
 */
export function GET() {
  const { destinations, activities } = getLiveTerms();
  const region = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  const body = {
    trips: getTripCards().map((t) => [t.slug, t.title, region[t.destinations[0]] ?? "", t.days, t.price?.amount ?? 0, t.cover?.src ?? ""]),
    places: [
      ...destinations.map((d) => [`/destinations/${d.slug}/`, d.name, `${d.trips} trips`]),
      ...activities.map((a) => [`/activities/${a.slug}/`, a.name, `${a.trips} trips`]),
    ],
    posts: getPostCards().map((p) => [p.slug, p.title]),
  };
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
