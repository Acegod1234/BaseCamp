import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/collection-page";
import { getDestination, getGuidesForRegion, getLiveTerms, getTripsIn } from "@/lib/content";
import { meta } from "@/lib/seo";
import { regionMeta } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getLiveTerms().destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const term = getDestination(slug);
  if (!term) return {};
  const trips = getTripsIn("destinations", slug);
  return meta({
    path: `/destinations/${slug}/`,
    title: `${term.name} Trips & Treks`,
    description: `${trips.length} ${term.name} trips with Base Camp Adventure: ${regionMeta[slug]?.line ?? "itineraries, prices and expert local guides"}.`,
    seo: term.seo,
    image: regionMeta[slug]?.photo,
  });
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const term = getDestination(slug);
  if (!term) notFound();
  const trips = getTripsIn("destinations", slug);
  const m = regionMeta[slug];

  return (
    <CollectionPage
      term={term}
      kind="destination"
      trips={trips}
      photo={m?.photo ?? trips[0]?.cover?.src ?? "/photos/ama-dablam.webp"}
      line={m?.line ?? `Treks and tours in the ${term.name}.`}
      crumbs={[
        { name: "Destinations", path: "/destination/" },
        { name: term.name, path: `/destinations/${slug}/` },
      ]}
      guides={getGuidesForRegion(slug, 3)}
    />
  );
}
