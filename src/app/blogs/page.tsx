import { JournalList } from "@/components/journal-list";
import { getPostCards } from "@/lib/content";
import { meta } from "@/lib/seo";

export const metadata = meta({
  path: "/blogs/",
  title: "Travel Journal: Nepal Trekking Guides & Tips",
  description: "Trekking guides for Everest, Annapurna, Langtang, Manaslu and Mustang: seasons, weather, permits, difficulty, costs and packing, from the Base Camp Adventure team.",
});

export default function BlogsPage() {
  return (
    <JournalList
      posts={getPostCards()}
      title="Travel journal"
      accent="from the trail."
      intro="Seasons, permits, difficulty and packing, written by the people who walk these routes every month."
      crumbs={[{ name: "Journal", path: "/blogs/" }]}
    />
  );
}
