import { getLiveTerms, getTripsIn } from "@/lib/content";
import { regionMeta } from "@/lib/site";
import { HeaderClient, type HeaderRegion } from "./header-client";

const ORDER = ["nepal", "tibet", "bhutan"];

/** The prototype's light header; its one dropdown lists the destinations. */
export function SiteHeader() {
  const destinations = getLiveTerms().destinations;
  const trekOrder = ["everest-region", "annapurna-region", "langtang-region", "manaslu-region", "remote-area-trekking"];
  const trekRegions: HeaderRegion[] = [...destinations]
    .filter((destination) => trekOrder.includes(destination.slug))
    .sort((a, b) => trekOrder.indexOf(a.slug) - trekOrder.indexOf(b.slug))
    .map((destination) => ({ slug: destination.slug, name: destination.slug === "remote-area-trekking" ? "More Treks" : destination.name, count: destination.trips, href: `/destinations/${destination.slug}/`, photo: regionMeta[destination.slug]?.photo ?? "/photos/region-everest.webp" }));
  const regions: HeaderRegion[] = [...destinations]
    .filter((destination) => ORDER.includes(destination.slug))
    .sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))
    .map((d) => ({ slug: d.slug, name: d.name, count: d.slug === "nepal" ? getTripsIn("activities", "nepal-tour").length : d.trips, href: d.slug === "nepal" ? "/activities/nepal-tour/" : `/destinations/${d.slug}/`, photo: regionMeta[d.slug]?.photo ?? "/photos/region-everest.webp" }));
  return <HeaderClient regions={regions} trekRegions={trekRegions} />;
}
