import { getLiveTerms } from "@/lib/content";
import { regionMeta } from "@/lib/site";
import { HeaderClient, type HeaderRegion } from "./header-client";

const ORDER = ["everest-region", "annapurna-region", "langtang-region", "manaslu-region", "remote-area-trekking", "nepal", "bhutan", "tibet"];

/** The prototype's light header; its one dropdown lists the destinations. */
export function SiteHeader() {
  const regions: HeaderRegion[] = [...getLiveTerms().destinations]
    .sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))
    .map((d) => ({ slug: d.slug, name: d.name, count: d.trips, photo: regionMeta[d.slug]?.photo ?? "/photos/region-everest.webp" }));
  return <HeaderClient regions={regions} />;
}
