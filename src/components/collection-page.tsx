import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { CountUp, Reveal } from "@/components/motion";
import { PageHero, type Crumb } from "@/components/page-hero";
import { Accent, SectionHeading } from "@/components/section-heading";
import { TripExplorer } from "@/components/trip-explorer";
import { TripGrid } from "@/components/trip-grid";
import { getLiveTerms } from "@/lib/content";
import { abs, itemListLd } from "@/lib/seo";
import type { PostCard, Term, TripCard } from "@/lib/types";

/**
 * Shared layout for a destination or an activity: hero, key numbers, the
 * filtered trip list, the original WordPress description, and guides.
 */
export function CollectionPage({
  term,
  kind,
  trips,
  photo,
  line,
  crumbs,
  guides,
}: {
  term: Term;
  kind: "destination" | "activity";
  trips: TripCard[];
  photo: string;
  line: string;
  crumbs: Crumb[];
  guides: PostCard[];
}) {
  const { destinations, activities } = getLiveTerms();
  const regionNames = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  const opt = (t: { slug: string; name: string; trips: number }) => ({ slug: t.slug, name: t.name, count: t.trips });
  const prices = trips.map((t) => t.price?.amount).filter((x): x is number => Boolean(x));
  const days = trips.map((t) => t.days);
  const top = Math.max(0, ...trips.map((t) => t.maxAltitude ?? 0));
  const path = crumbs[crumbs.length - 1].path;
  const hasDescription = term.description.replace(/<[^>]+>/g, "").trim().length > 40;

  return (
    <>
      <PageHero
        title={term.name}
        eyebrow={kind === "destination" ? "Destination" : "Activity"}
        intro={line}
        photo={photo}
        crumbs={crumbs}
        size="lg"
      >
        <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/15 pt-8">
          <div>
            <dt className="eyebrow text-white/60">Trips</dt>
            <dd><CountUp to={trips.length} className="font-display text-5xl font-black" /></dd>
          </div>
          {prices.length ? (
            <div>
              <dt className="eyebrow text-white/60">From</dt>
              <dd className="font-display text-marigold text-5xl font-black">${Math.min(...prices).toLocaleString("en-US")}</dd>
            </div>
          ) : null}
          {days.length ? (
            <div>
              <dt className="eyebrow text-white/60">Duration</dt>
              <dd className="font-display text-5xl font-black">{Math.min(...days)}–{Math.max(...days)}<span className="text-2xl"> days</span></dd>
            </div>
          ) : null}
          {top ? (
            <div>
              <dt className="eyebrow text-white/60">Highest point</dt>
              <dd className="font-display text-5xl font-black">{top.toLocaleString("en-US")}<span className="text-2xl"> m</span></dd>
            </div>
          ) : null}
        </dl>
      </PageHero>

      <section className="mx-auto max-w-[90rem] px-4 pb-24 sm:px-6">
        <Suspense fallback={<TripGrid trips={trips} regionNames={regionNames} />}>
          <TripExplorer
            trips={trips}
            regions={destinations.map(opt)}
            activities={activities.map(opt)}
            regionNames={regionNames}
            lockRegion={kind === "destination" ? term.slug : undefined}
            lockActivity={kind === "activity" ? term.slug : undefined}
          />
        </Suspense>
      </section>

      {hasDescription ? (
        <section className="border-t border-line bg-card py-20">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading eyebrow={`About ${term.name}`} lines={["Know the", <Accent key="g">ground.</Accent>]} />
            <Reveal>
              <div className="prose-trail" dangerouslySetInnerHTML={{ __html: term.description }} />
            </Reveal>
          </div>
        </section>
      ) : null}

      {guides.length ? (
        <section className="bg-snow-2 py-20">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Trekking guides" lines={["Plan it", <Accent key="p">properly.</Accent>]} />
              <Link href="/blogs/" className="text-pine inline-flex items-center gap-2 font-bold">
                The journal <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {guides.map((p) => (
                <Link key={p.slug} href={`/${p.slug}/`} className="group">
                  <div className="zoom-img relative aspect-[16/10] overflow-hidden rounded-[1.2rem] bg-card">
                    {p.cover ? <Image src={p.cover.src} alt={p.cover.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : null}
                  </div>
                  <h3 className="mt-4 text-lg font-bold leading-snug group-hover:text-pine">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={[
          itemListLd(`${term.name} trips`, trips.map((t) => `/trip/${t.slug}/`)),
          ...(kind === "destination"
            ? [{ "@context": "https://schema.org", "@type": "TouristDestination", name: term.name, url: abs(path), image: abs(photo), description: line }]
            : []),
        ]}
      />
    </>
  );
}
