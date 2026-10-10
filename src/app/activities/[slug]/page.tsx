import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/collection-page";
import { getActivity, getLiveTerms, getPostCards, getTripsIn } from "@/lib/content";
import { meta } from "@/lib/seo";
import { activityMeta } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getLiveTerms().activities.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const term = getActivity(slug);
  if (!term) return {};
  const trips = getTripsIn("activities", slug);
  return meta({
    path: `/activities/${slug}/`,
    title: term.name,
    description: `${trips.length} ${term.name.toLowerCase()} trips with Base Camp Adventure. ${activityMeta[slug]?.line ?? ""}. Itineraries, prices and licensed local guides.`,
    seo: term.seo,
    image: activityMeta[slug]?.photo,
  });
}

export default async function ActivityPage({ params }: Props) {
  const { slug } = await params;
  const term = getActivity(slug);
  if (!term) notFound();
  const trips = getTripsIn("activities", slug);
  const m = activityMeta[slug];
  const word = term.name.split(" ")[0].toLowerCase();

  return (
    <CollectionPage
      term={term}
      kind="activity"
      trips={trips}
      photo={m?.photo ?? trips[0]?.cover?.src ?? "/photos/ama-dablam.webp"}
      line={m?.line ?? term.name}
      crumbs={[
        { name: "Activities", path: "/activities/" },
        { name: term.name, path: `/activities/${slug}/` },
      ]}
      guides={getPostCards().filter((p) => p.title.toLowerCase().includes(word)).slice(0, 3)}
    />
  );
}
