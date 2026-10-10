import { getLiveTerms, getTrips } from "@/lib/content";
import { activityMeta, regionMeta } from "@/lib/site";
import { HeaderClient, type Menu } from "./header-client";

/** Builds the menus from live content, so a new trip appears without a code change. */
export function SiteHeader() {
  const { destinations, activities } = getLiveTerms();
  const trips = getTrips();

  const order = ["everest-region", "annapurna-region", "langtang-region", "manaslu-region", "remote-area-trekking", "nepal", "bhutan", "tibet"];
  const regions = [...destinations].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

  const menu: Menu = {
    regions: regions.map((r) => ({
      slug: r.slug,
      name: r.name,
      count: r.trips,
      photo: regionMeta[r.slug]?.photo ?? "/photos/ama-dablam.webp",
      line: regionMeta[r.slug]?.line ?? "",
      trips: trips
        .filter((t) => t.destinations.includes(r.slug))
        .sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0) || (b.price ? 1 : 0) - (a.price ? 1 : 0))
        .slice(0, 7)
        .map((t) => ({ slug: t.slug, title: t.title, days: t.days })),
    })),
    activities: activities.map((a) => ({
      slug: a.slug,
      name: a.name,
      count: a.trips,
      icon: activityMeta[a.slug]?.icon ?? "compass",
      line: activityMeta[a.slug]?.line ?? "",
    })),
  };

  return <HeaderClient menu={menu} />;
}
