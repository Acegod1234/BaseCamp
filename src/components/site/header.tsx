import { getLiveTerms, getTrips } from "@/lib/content";
import { activityMeta, regionMeta } from "@/lib/site";
import { HeaderClient, type Menu } from "./header-client";

const ORDER = ["everest-region", "annapurna-region", "langtang-region", "manaslu-region", "remote-area-trekking", "nepal", "bhutan", "tibet"];

/** Builds the menus from live content, so a new trip appears without a code change. */
export function SiteHeader() {
  const { destinations, activities } = getLiveTerms();

  const menu: Menu = {
    total: getTrips().length,
    regions: [...destinations]
      .sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))
      .map((r) => ({
        slug: r.slug,
        name: r.name,
        count: r.trips,
        photo: regionMeta[r.slug]?.photo ?? "/photos/ama-dablam.webp",
        line: regionMeta[r.slug]?.line ?? "",
      })),
    activities: [...activities]
      .sort((a, b) => b.trips - a.trips)
      .map((a) => ({ slug: a.slug, name: a.name, count: a.trips, icon: activityMeta[a.slug]?.icon ?? "compass" })),
  };

  return <HeaderClient menu={menu} />;
}
