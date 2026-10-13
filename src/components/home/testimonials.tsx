import Image from "@/components/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Flag } from "@/components/flag";
import { ReviewCarousel, type CarouselReview } from "@/components/home/review-carousel";
import { Reveal } from "@/components/motion";
import { Accent, SectionHeading } from "@/components/section-heading";
import type { TripadvisorFacts } from "@/lib/content";
import { reviewer } from "@/lib/reviewer";
import type { Review } from "@/lib/types";

type R = Review & { trip: { slug: string; title: string } };

/**
 * Real traveller reviews: the Tripadvisor rating up top, the reviews in a
 * 3D carousel (each with the traveller's own home town and flag), and the
 * countries they came from.
 */
export function Testimonials({ reviews, tripadvisor }: { reviews: R[]; tripadvisor: TripadvisorFacts | null }) {
  if (!reviews.length) return null;

  // One review per text (some were posted on several trips); the most
  // readable lengths first, and those that say where the traveller is from.
  const seen = new Set<string>();
  const items: CarouselReview[] = reviews
    .filter((r) => (seen.has(r.body) ? false : (seen.add(r.body), true)))
    .map((r) => ({ r, who: reviewer(r.author) }))
    .sort((a, b) => Number(Boolean(b.who.code)) - Number(Boolean(a.who.code)) || Math.abs(a.r.body.length - 380) - Math.abs(b.r.body.length - 380))
    .slice(0, 12)
    .map(({ r, who }) => ({ name: who.name, place: who.place, country: who.country, flag: who.flag, body: r.body, rating: r.rating, trip: r.trip }));

  const countries = new Map<string, { name: string; flag: string; n: number }>();
  for (const r of reviews) {
    const w = reviewer(r.author);
    if (!w.code || !w.flag) continue;
    const c = countries.get(w.code) ?? { name: w.country ?? w.code, flag: w.flag, n: 0 };
    c.n++;
    countries.set(w.code, c);
  }
  const list = [...countries.values()].sort((a, b) => b.n - a.n);
  const excellent = tripadvisor ? Math.round(((tripadvisor.breakdown.excellent ?? 0) / tripadvisor.reviews) * 1000) / 10 : null;

  return (
    <section className="bg-snow-2 relative overflow-hidden py-12 sm:py-14 lg:py-16">
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[60rem] -translate-x-1/2 rounded-full bg-[#00afc4]/10 blur-3xl" />
      <div className="relative mx-auto max-w-site px-4 sm:px-6 lg:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow="Testimonials" lines={["In their", <Accent key="w">own words.</Accent>]} />
          {tripadvisor ? (
            <Reveal className="w-full lg:w-auto">
              <a href={tripadvisor.url} target="_blank" rel="noopener noreferrer" className="group hover:border-pine/40 flex items-center gap-4 rounded-2xl border border-line bg-card p-4 pr-5 shadow-[0_20px_40px_-32px_oklch(0.2_0.04_200/0.6)] transition-colors">
                <span className="grid h-14 w-[4.5rem] shrink-0 place-items-center">
                  <Image src="/brand/partners/tripadvisor.png" alt="Tripadvisor" width={245} height={220} className="h-12 w-auto dark:brightness-0 dark:invert" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-3xl leading-none text-ink">{tripadvisor.rating.toFixed(1)}</span>
                    <Bubbles />
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">
                    <strong className="text-ink">{tripadvisor.reviews} reviews</strong> on Tripadvisor
                    {excellent ? ` · ${excellent}% Excellent` : ""}
                  </span>
                  {excellent ? (
                    <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-line sm:w-56" aria-hidden>
                      <span className="block h-full rounded-full bg-[#34e0a1]" style={{ width: `${excellent}%` }} />
                    </span>
                  ) : null}
                </span>
                <ArrowUpRight className="text-pine size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </a>
            </Reveal>
          ) : null}
        </div>

        <div className="mt-10 sm:mt-12">
          <ReviewCarousel items={items} />
        </div>

        {list.length ? (
          <Reveal className="mt-10 flex flex-col items-center gap-4 border-t border-line pt-8 sm:flex-row sm:justify-between">
            <p className="text-sm text-ink-soft">
              Reviews from travellers in <strong className="text-ink">{list.length} countries</strong>
            </p>
            <ul className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 sm:mx-0 sm:w-auto sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
              {list.map((c) => (
                <li key={c.name} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-semibold">
                  <Flag svg={c.flag} label={c.name} /> {c.name}
                </li>
              ))}
            </ul>
            <Link href="/testimonials/" className="text-pine inline-flex shrink-0 items-center gap-1.5 text-sm font-bold hover:underline">
              All reviews <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

/** Tripadvisor-style rating bubbles. */
function Bubbles() {
  return (
    <span className="flex gap-0.5" aria-label="5 out of 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="block size-3 rounded-full bg-[#34e0a1]" />
      ))}
    </span>
  );
}
