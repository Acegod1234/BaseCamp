import { TermIndex } from "@/components/term-index";
import { getLiveTerms } from "@/lib/content";
import { meta } from "@/lib/seo";
import { regionMeta } from "@/lib/site";

export const metadata = meta({
  path: "/destination/",
  title: "Destinations: Everest, Annapurna, Langtang, Manaslu, Bhutan & Tibet",
  description: "Choose your region: Everest, Annapurna, Langtang, Manaslu, Mustang and the remote west, plus Bhutan and Tibet. Trips, prices and local guides for each.",
});

const ORDER = ["everest-region", "annapurna-region", "langtang-region", "manaslu-region", "remote-area-trekking", "nepal", "bhutan", "tibet"];

export default function DestinationsIndex() {
  const items = [...getLiveTerms().destinations]
    .sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))
    .map((d) => ({ slug: d.slug, name: d.name, trips: d.trips, photo: regionMeta[d.slug]?.photo ?? "/photos/ama-dablam.webp", line: regionMeta[d.slug]?.line ?? "" }));
  return (
    <TermIndex
      base="destinations"
      path="/destination/"
      crumb="Destinations"
      title="A place for"
      accent="every journey."
      intro="Same country, different worlds. Glaciers and Sherpa villages, rhododendron forests, the walled city of Lo Manthang, and two kingdoms over the border."
      photo="/photos/kala-patthar.webp"
      items={items}
    />
  );
}
