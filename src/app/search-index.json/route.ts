import { categoryPath } from "@/components/journal-list";
import { getLiveTerms, getPages, getPostCards, getTaxonomies, getTeam, getTripCards } from "@/lib/content";

export const dynamic = "force-static";

/** The site's own pages, with the words people type to find them. */
const SITE_PAGES: [string, string, string][] = [
  ["/blogs/", "Blogs & travel guides", "blog blogs journal article articles news guides tips"],
  ["/trip/", "All trips & packages", "trips trip packages package tours treks trekking all"],
  ["/destination/", "Destinations", "destinations destination regions places where"],
  ["/activities/", "Activities", "activities activity trekking climbing rafting safari helicopter"],
  ["/customize-trip/", "Customize your trip", "customize custom private tailor plan request quote itinerary"],
  ["/about-us/", "About us", "about company who we are story history"],
  ["/our-team/", "Our team", "team guides guide staff people porters"],
  ["/testimonials/", "Traveller reviews", "reviews review testimonials tripadvisor rating ratings feedback"],
  ["/gallery/", "Photo gallery", "gallery photos photo pictures images"],
  ["/community/", "Community & social work", "community charity social work donation relief flood"],
  ["/contact-us/", "Contact us", "contact phone call email whatsapp address office location"],
  ["/online-payment/", "Online payment", "payment pay online card deposit"],
  ["/legal-documents/", "Legal documents", "legal licence license documents registration certificate"],
  ["/terms-and-conditions/", "Terms and conditions", "terms conditions booking cancellation refund policy"],
  ["/privacy-policy/", "Privacy policy", "privacy data cookies"],
  ["/why-book-with-us/", "Why travel with us", "why book us reasons trust"],
];
const SKIP = new Set(["home", "booking", "checkout", "thank-you", "online-payment", "online-payment-form", "search-result", "review-listing-page", "wishlist", "user-dashboard", "travelers-information", "thanking-you", "enquiry-received", "enquiry-thankyou-page", "success", "cancel"]);

/**
 * The data behind site search (Ctrl+K), in compact rows, fetched only when
 * someone opens search: trips, regions and activities, the site's pages,
 * journal categories, articles (title and summary) and the team.
 */
export function GET() {
  const { destinations, activities } = getLiveTerms();
  const region = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  const known = new Set(SITE_PAGES.map((p) => p[0]));
  const pages: [string, string, string][] = [
    ...SITE_PAGES,
    ...getPages()
      .filter((p) => !SKIP.has(p.slug) && !known.has(`/${p.slug}/`) && !p.seo.noindex)
      .map((p): [string, string, string] => [`/${p.slug}/`, p.title, ""]),
    ...getTaxonomies()
      .categories.filter((c) => c.slug !== "uncategorized")
      .map((c): [string, string, string] => [categoryPath(c.slug), c.name, "blog journal guide category"]),
  ];
  const body = {
    trips: getTripCards().map((t) => [t.slug, t.title, region[t.destinations[0]] ?? "", t.days, t.price?.amount ?? 0, t.cover?.src ?? ""]),
    places: [
      ...destinations.map((d) => [`/destinations/${d.slug}/`, d.name, `${d.trips} trips`]),
      ...activities.map((a) => [`/activities/${a.slug}/`, a.name, `${a.trips} trips`]),
    ],
    pages,
    posts: getPostCards().map((p) => [p.slug, p.title, p.excerpt.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)]),
    team: getTeam().map((m) => [`/team/${m.slug}/`, m.name, m.role ?? ""]),
  };
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
