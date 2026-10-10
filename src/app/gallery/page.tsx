import { GalleryGrid, type GalleryPhoto } from "@/components/gallery-grid";
import { PageHero } from "@/components/page-hero";
import { getLiveTerms, getTrips, photo } from "@/lib/content";
import { meta } from "@/lib/seo";

export const metadata = meta({
  path: "/gallery/",
  title: "Photo Gallery",
  description: "Photographs from Base Camp Adventure treks and tours across Everest, Annapurna, Langtang, Manaslu, Mustang, Bhutan and Tibet.",
});

export default function GalleryPage() {
  const { destinations } = getLiveTerms();
  const names = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  const seen = new Set<string>();
  const photos: GalleryPhoto[] = [];
  for (const t of getTrips()) {
    for (const im of [t.cover, ...t.gallery]) {
      // Only photographs sharp enough to fill a column, and each one once.
      if (!im || im.w < 900 || seen.has(im.src)) continue;
      seen.add(im.src);
      photos.push({ src: im.src, w: im.w, h: im.h, alt: im.alt, trip: t.slug, tripTitle: t.title, region: t.destinations[0] ?? "nepal" });
    }
  }
  const regions = destinations
    .map((d) => ({ slug: d.slug, name: names[d.slug], count: photos.filter((p) => p.region === d.slug).length }))
    .filter((r) => r.count > 0);
  const hero = photo("page-gallery");

  return (
    <>
      <PageHero title="Photo" accent="Gallery" eyebrow={`${photos.length} photographs`} photo={hero.src} crumbs={[{ name: "Gallery", path: "/gallery/" }]} />
      <section className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 sm:py-20">
        <GalleryGrid photos={photos} regions={regions} />
      </section>
    </>
  );
}
