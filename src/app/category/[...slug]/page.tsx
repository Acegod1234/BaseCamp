import { notFound } from "next/navigation";
import { categoryPath, JournalList } from "@/components/journal-list";
import { getCategory, getPostsInCategory, getTaxonomies } from "@/lib/content";
import { meta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;

/** WordPress category URLs, nested ones included: /category/nepal-trekking/everest-trekking-guide/ */
export function generateStaticParams() {
  return getTaxonomies()
    .categories.filter((c) => c.count > 0)
    .map((c) => ({ slug: categoryPath(c.slug).split("/").filter(Boolean).slice(1) }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = getCategory(slug[slug.length - 1]);
  if (!cat) return {};
  return meta({
    path: categoryPath(cat.slug),
    title: cat.name,
    description: `${cat.name}: articles from the Base Camp Adventure travel journal on routes, seasons, permits and preparation.`,
    seo: cat.seo,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategory(slug[slug.length - 1]);
  if (!cat) notFound();
  return (
    <JournalList
      posts={getPostsInCategory(cat.slug)}
      title={cat.name}
      accent="field notes."
      intro={cat.description.replace(/<[^>]+>/g, "").trim() || `Everything we've written about ${cat.name.replace(/ guide$/i, "")}.`}
      crumbs={[
        { name: "Journal", path: "/blogs/" },
        { name: cat.name, path: categoryPath(cat.slug) },
      ]}
      activeCategory={cat.slug}
    />
  );
}
