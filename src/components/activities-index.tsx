import { TermIndex } from "@/components/term-index";
import { getLiveTerms } from "@/lib/content";
import { activityMeta } from "@/lib/site";

export function ActivitiesIndex({ path = "/activities/" }: { path?: string }) {
  const items = [...getLiveTerms().activities]
    .sort((a, b) => b.trips - a.trips)
    .map((a) => ({ slug: a.slug, name: a.name, trips: a.trips, photo: activityMeta[a.slug]?.photo ?? "/photos/ama-dablam.webp", line: activityMeta[a.slug]?.line ?? "" }));
  return (
    <TermIndex
      base="activities"
      path={path}
      crumb="Activities"
      title="Pick your"
      accent="kind of wild."
      intro="Walk, climb, raft or wander. Every trip comes with a licensed local guide and a team in Kathmandu that answers at any hour."
      photo="/photos/island-peak.webp"
      items={items}
    />
  );
}
