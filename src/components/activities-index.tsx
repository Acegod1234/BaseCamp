import { TermIndex } from "@/components/term-index";
import { getLiveTerms, termSummary } from "@/lib/content";
import { activityMeta } from "@/lib/site";

export function ActivitiesIndex({ path = "/activities/" }: { path?: string }) {
  const items = [...getLiveTerms().activities]
    .sort((a, b) => b.trips - a.trips)
    .map((a) => ({ slug: a.slug, name: a.name, trips: a.trips, photo: activityMeta[a.slug]?.photo ?? "/photos/page-activities.webp", line: termSummary("activities", a.slug).line }));
  return (
    <TermIndex
      base="activities"
      path={path}
      crumb="Activities"
      title="Pick your"
      accent="kind of wild."
      photo="/photos/page-activities.webp"
      items={items}
    />
  );
}
