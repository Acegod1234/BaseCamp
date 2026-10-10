import Link from "next/link";
import { Star } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { getAllReviews } from "@/lib/content";
import { meta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const metadata = meta({
  path: "/testimonials/",
  title: "Traveller Reviews",
  description: "Reviews from travellers who trekked and toured with Base Camp Adventure: Everest Base Camp, Annapurna, Langtang, Poon Hill and more.",
});

export default function TestimonialsPage() {
  const reviews = getAllReviews();
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / Math.max(1, reviews.length);

  return (
    <>
      <PageHero
        title="Testimonials"
        eyebrow={`${reviews.length} reviews · ${avg.toFixed(1)} average`}
        photo="/photos/page-reviews.webp"
        crumbs={[{ name: "Reviews", path: "/testimonials/" }]}
      />
      <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6">
        <Stagger className="columns-1 gap-5 md:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
          {reviews.map((r, i) => (
            <StaggerItem key={i} className="rounded-[1.4rem] border border-line bg-card p-6">
              <div className="flex gap-0.5" aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={s < Math.round(r.rating) ? "fill-marigold text-marigold size-4" : "size-4 text-line"} aria-hidden />
                ))}
              </div>
              {r.title ? <p className="mt-3 font-bold">{r.title}</p> : null}
              <p className="mt-3 leading-relaxed text-ink-soft">{r.body}</p>
              <div className="mt-5 border-t border-line pt-4">
                <p className="font-semibold">{r.author}</p>
                <p className="text-sm text-muted">
                  <Link href={`/trip/${r.trip.slug}/`} className="text-pine hover:underline">
                    {r.trip.title}
                  </Link>
                  {r.date ? ` · ${formatDate(r.date) || r.date}` : ""}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
