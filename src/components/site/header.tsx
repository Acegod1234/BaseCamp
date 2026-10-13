import { getLiveTerms, getTripCards, getTripsIn } from "@/lib/content";
import { regionMeta } from "@/lib/site";
import { HeaderClient, type HeaderRegion } from "./header-client";

const ORDER = ["nepal", "tibet", "bhutan"];

/** The prototype's light header; its one dropdown lists the destinations. */
export function SiteHeader() {
  const destinations = getLiveTerms().destinations;
  const cards = getTripCards();
  const tripOptions: HeaderRegion[] = [
    { slug: "trekking-in-nepal", name: "Nepal Trekking", count: getTripsIn("activities", "trekking-in-nepal").length, href: "/activities/trekking-in-nepal/", photo: "/photos/region-everest.webp" },
    { slug: "nepal-tour", name: "Nepal Tours", count: getTripsIn("activities", "nepal-tour").length, href: "/activities/nepal-tour/", photo: "/media/2021/09/bouddhanath-scaled.webp" },
    { slug: "helicopter-tours", name: "Helicopter Tours", count: cards.filter((t) => `${t.title} ${t.summary}`.toLowerCase().includes("helicopter tour")).length, href: "/trip/?q=helicopter%20tour", photo: "/media/2018/07/helicopter-tour-ii.webp" },
    { slug: "day-tours", name: "Day Tours", count: getTripsIn("activities", "day-tours").length, href: "/activities/day-tours/", photo: "/media/2018/08/swembhunath.webp" },
    { slug: "peak-climbing-expeditions", name: "Peak Climbing / Expeditions", count: cards.filter((t) => t.activities.some((a) => ["nepal-peak-climbing", "expedition-in-nepal"].includes(a))).length, href: "/trip/?activity=nepal-peak-climbing,expedition-in-nepal", photo: "/photos/menu-peak-climbing.webp" },
  ];
  const regions: HeaderRegion[] = [...destinations]
    .filter((destination) => ORDER.includes(destination.slug))
    .sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))
    .map((d) => ({ slug: d.slug, name: d.name, count: d.slug === "nepal" ? getTripsIn("activities", "nepal-tour").length : d.trips, href: d.slug === "nepal" ? "/activities/nepal-tour/" : `/destinations/${d.slug}/`, photo: regionMeta[d.slug]?.photo ?? "/photos/region-everest.webp" }));
  return <HeaderClient regions={regions} tripOptions={tripOptions} />;
}
