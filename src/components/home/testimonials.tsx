import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { FeaturedReviews, type Featured } from "@/components/home/featured-reviews";
import { Reveal } from "@/components/motion";
import { ReviewsMarquee } from "@/components/reviews-marquee";
import { Accent, SectionHeading } from "@/components/section-heading";
import { site } from "@/lib/site";
import type { Review } from "@/lib/types";

type R = Review & { trip: { slug: string; title: string } };

/** "Peter D-Cornwall, United Kingdom" → name and home town, as written on the review. */
export function splitAuthor(author: string) {
  const m = author.match(/^(.+?)-([A-Z][^-]*,.*)$/);
  if (m) return { name: m[1].trim(), from: m[2].trim() };
  const [name, ...rest] = author.split(",");
  return { name: name.trim(), from: rest.join(",").trim() || null };
}

/**
 * Real traveller reviews: a featured quote that turns every few seconds, the
 * average rating beside it, and the rest drifting past underneath.
 */
export function Testimonials({ reviews }: { reviews: R[] }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  // Long enough to say something, short enough to read in one go; one per trip.
  const seen = new Set<string>();
  const featured: Featured[] = reviews
    .filter((r) => r.rating >= 5 && r.body.length > 240 && r.body.length < 640)
    .filter((r) => (seen.has(r.trip.slug) ? false : (seen.add(r.trip.slug), true)))
    .slice(0, 5)
    .map((r) => ({ ...splitAuthor(r.author), body: r.body, trip: r.trip }));

  return (
    <section className="bg-snow-2 overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Testimonials" lines={["In their", <Accent key="w">own words.</Accent>]} />
        <div className="mt-10 grid gap-4 lg:grid-cols-[1.55fr_1fr] lg:gap-5">
          <Reveal>
            <FeaturedReviews items={featured} />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-between gap-8 rounded-[1.4rem] border border-line bg-card p-6 sm:p-8">
            <div>
              <p className="text-[0.66rem] font-bold tracking-[0.14em] text-muted uppercase">Average rating</p>
              <p className="font-display mt-2 text-[5.5rem] leading-none text-ink">{avg.toFixed(1)}</p>
              <div className="mt-3 flex gap-1" aria-label={`${avg.toFixed(1)} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="fill-marigold text-marigold size-5" aria-hidden />
                ))}
              </div>
              <p className="mt-3 text-ink-soft">
                From <strong className="text-ink">{reviews.length} traveller reviews</strong> across our treks and tours.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <a href={site.social.tripadvisor} target="_blank" rel="noopener noreferrer" aria-label="Base Camp Adventure on Tripadvisor" className="rounded-lg bg-white p-1.5">
                <Image src="/brand/partners/tripadvisor.png" alt="Tripadvisor" width={245} height={220} className="h-11 w-auto" />
              </a>
              <Link href="/testimonials/" className="bg-pine hover:bg-pine-deep inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white transition-colors">
                Read all reviews <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
      <div className="mt-5">
        <ReviewsMarquee reviews={reviews.filter((r) => !featured.some((f) => f.body === r.body)).slice(0, 18)} />
      </div>
    </section>
  );
}
