import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BedDouble,
  Check,
  Clock,
  Flag,
  Gauge,
  Info,
  MapPin,
  Mountain,
  Star,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { AltitudeProfile } from "@/components/altitude-profile";
import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Breadcrumbs } from "@/components/page-hero";
import { Accent, SectionHeading } from "@/components/section-heading";
import { BookingCard, MobileBookingBar } from "@/components/trip/booking-card";
import { PlanTripButton, TripSlider } from "@/components/trip/trip-slider";
import { TripPhotos } from "@/components/trip/trip-photos";
import { Itinerary } from "@/components/trip/itinerary";
import { SectionNav } from "@/components/trip/section-nav";
import { TripModals } from "@/components/trip/trip-modals";
import { TripCard } from "@/components/trip-card";
import { getActivity, getDestination, getGuidesForRegion, getRelatedTrips, getTravellerPhotos, getTrip, getTrips } from "@/lib/content";
import { meta, tripLd, tripLead } from "@/lib/seo";
import { difficultyLabel, whatsappHref } from "@/lib/site";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getTrips().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const trip = getTrip(slug);
  if (!trip) return {};
  return meta({ path: `/trip/${trip.slug}/`, title: trip.title, description: trip.summary, seo: trip.seo, image: trip.cover, lead: tripLead(trip), price: trip.price?.amount });
}

const FACT_ICONS: Record<string, LucideIcon> = {
  duration: Clock,
  location: MapPin,
  destinations: Flag,
  accommodation: BedDouble,
  "group size": Users,
  "highest elevation": Mountain,
  difficulty: Gauge,
};

export default async function TripPage({ params }: Props) {
  const { slug } = await params;
  const trip = getTrip(slug);
  if (!trip) notFound();

  const region = trip.destinations[0] ? getDestination(trip.destinations[0]) : null;
  const activity = trip.activities[0] ? getActivity(trip.activities[0]) : null;
  const related = getRelatedTrips(trip, 3);
  const guides = region ? getGuidesForRegion(region.slug, 3) : [];
  const sharpest = [trip.cover, ...trip.gallery].filter((x): x is NonNullable<typeof x> => Boolean(x) && x!.w >= x!.h).sort((a, b) => b.w - a.w)[0] ?? trip.cover;
  const photos = [trip.cover, ...trip.gallery].filter((x, i, a): x is NonNullable<typeof x> => Boolean(x) && a.findIndex((y) => y?.src === x?.src) === i);
  const travellerPhotos = getTravellerPhotos(trip.slug);
  const altitudeDays = trip.itinerary.filter((d) => d.altitude).length >= 3 ? trip.itinerary : [];

  const facts = [
    ...trip.facts.filter((f) => !/highest elevation/i.test(f.label)),
    ...(trip.maxAltitude ? [{ label: "Highest elevation", value: `${trip.maxAltitude.toLocaleString("en-US")} m` }] : []),
    ...(trip.difficulty ? [{ label: "Difficulty", value: difficultyLabel[trip.difficulty] ?? trip.difficulty }] : []),
  ];

  const nav = [
    { id: "overview", label: "Overview" },
    ...(trip.itinerary.length ? [{ id: "itinerary", label: "Itinerary" }] : []),
    ...(altitudeDays.length ? [{ id: "altitude", label: "Altitude" }] : []),
    ...(trip.includes.length || trip.excludes.length ? [{ id: "included", label: "What's included" }] : []),
    ...trip.sections.map((s) => ({ id: s.id, label: s.title.length > 22 ? `${s.title.slice(0, 20)}…` : s.title })),
    ...(trip.map ? [{ id: "route-map", label: "Route map" }] : []),
    { id: "gallery", label: "Gallery" },
    ...(trip.faqs.length ? [{ id: "faqs", label: "FAQs" }] : []),
    ...(trip.reviews.length ? [{ id: "reviews", label: "Reviews" }] : []),
  ];

  return (
    <>
      {/* Heading, in the prototype's layout */}
      <section className="pt-[5.5rem] lg:pt-[6.25rem]">
        <div className="mx-auto max-w-[90rem] px-4 pt-6 sm:px-6 lg:px-8">
          <Reveal y={8}>
            <Breadcrumbs
              items={[
                { name: "Our trips", path: "/trip/" },
                ...(region ? [{ name: region.name, path: `/destinations/${region.slug}/` }] : []),
                { name: trip.title, path: `/trip/${trip.slug}/` },
              ]}
            />
          </Reveal>
          <Reveal y={8} delay={0.05}>
            <p className="eyebrow text-pine mt-7">{[region?.name, activity?.name].filter(Boolean).join(" · ")}</p>
          </Reveal>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <Reveal y={16} delay={0.1}>
              <h1 className="font-display max-w-4xl text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.03] text-ink">{trip.title}</h1>
            </Reveal>
            <Reveal y={10} delay={0.2} className="flex shrink-0 flex-wrap items-center gap-3">
              {trip.rating ? (
                <a href="#reviews" className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2.5 text-sm font-semibold">
                  <Star className="fill-marigold text-marigold size-4" aria-hidden /> {trip.rating.value.toFixed(1)} · {trip.rating.count} reviews
                </a>
              ) : null}
              <PlanTripButton priced={Boolean(trip.price)} />
            </Reveal>
          </div>
        </div>
        <div className="mx-auto mt-7 max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <Reveal y={20} delay={0.1}>
            <TripSlider images={[...(sharpest ? [sharpest] : []), ...photos.filter((p) => p.src !== sharpest?.src)]} title={trip.title} />
          </Reveal>
        </div>

        {/* Facts */}
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <Stagger className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-line py-6 sm:grid-cols-3 lg:grid-cols-6">
            {facts.slice(0, 6).map((f) => {
              const Icon = FACT_ICONS[f.label.toLowerCase().trim()] ?? Info;
              return (
                <StaggerItem key={f.label} className="flex min-w-0 items-start gap-3">
                  <span className="bg-glacier-soft text-pine grid size-9 shrink-0 place-items-center rounded-lg">
                    <Icon className="size-[1.1rem]" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.72rem] text-muted">{f.label}</span>
                    <span className="mt-0.5 block text-[0.95rem] font-bold leading-snug">{f.value}</span>
                  </span>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Direct child of <main>, so it stays pinned for the whole page. */}
      <div className="h-6" aria-hidden />
      <SectionNav items={nav} price={trip.price} />

      <div className="mx-auto grid max-w-[90rem] gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-16 lg:px-8">
        <article className="min-w-0 space-y-20">
          <section id="overview" className="scroll-mt-40">
            <p className="eyebrow text-pine">Overview</p>
            {trip.highlights.length ? (
              <Reveal className="mt-6 rounded-[1.4rem] bg-marigold-soft p-6">
                <h2 className="font-display text-3xl font-black uppercase">Highlights</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {trip.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-ink-soft">
                      <Check className="text-pine mt-1 size-4 shrink-0" aria-hidden /> {h}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
            <div className="prose-trail mt-6" dangerouslySetInnerHTML={{ __html: trip.overview }} />
          </section>

          {trip.itinerary.length ? (
            <section id="itinerary" className="scroll-mt-40">
              <SectionHeading eyebrow="Itinerary" lines={["Day by", <Accent key="d">day.</Accent>]} />
              <div className="mt-8">
                <Itinerary days={trip.itinerary} />
              </div>
            </section>
          ) : null}

          {altitudeDays.length ? (
            <section id="altitude" className="scroll-mt-40">
              <SectionHeading eyebrow="Altitude profile" lines={["How high,", <Accent key="w">and when.</Accent>]} intro="Every overnight stop on the route. Rest days at the same height are where your body adjusts." />
              <div className="mt-8 rounded-[1.6rem] border border-line bg-card p-4 sm:p-6">
                <AltitudeProfile days={altitudeDays} tone="light" />
              </div>
            </section>
          ) : null}

          {trip.includes.length || trip.excludes.length ? (
            <section id="included" className="scroll-mt-40">
              <SectionHeading eyebrow="Cost details" lines={["What's", <Accent key="i">included.</Accent>]} />
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {trip.includes.length ? (
                  <div className="rounded-[1.4rem] border border-line bg-card p-6">
                    <h3 className="text-lg font-bold">The price includes</h3>
                    <ul className="mt-4 space-y-3">
                      {trip.includes.map((x) => (
                        <li key={x} className="flex gap-3 text-[0.95rem] text-ink-soft">
                          <span className="bg-moss/15 text-moss mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"><Check className="size-3.5" aria-hidden /></span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {trip.excludes.length ? (
                  <div className="rounded-[1.4rem] border border-line bg-snow-2 p-6">
                    <h3 className="text-lg font-bold">Not included</h3>
                    <ul className="mt-4 space-y-3">
                      {trip.excludes.map((x) => (
                        <li key={x} className="flex gap-3 text-[0.95rem] text-ink-soft">
                          <span className="bg-crimson/10 text-crimson mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"><X className="size-3.5" aria-hidden /></span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {trip.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-40">
              <div className="prose-trail" dangerouslySetInnerHTML={{ __html: s.html }} />
            </section>
          ))}

          {trip.map ? (
            <section id="route-map" className="scroll-mt-40">
              <SectionHeading eyebrow="Route map" lines={["The way", <Accent key="t">there.</Accent>]} />
              <a href={trip.map.src} target="_blank" rel="noopener" className="mt-8 block overflow-hidden rounded-[1.4rem] border border-line bg-card">
                <Image src={trip.map.src} alt={trip.map.alt || `${trip.title} map`} width={trip.map.w} height={trip.map.h} sizes="(max-width: 1024px) 100vw, 60vw" className="h-auto w-full" />
              </a>
            </section>
          ) : null}

          {photos.length || travellerPhotos.length ? (
            <section id="gallery" className="scroll-mt-40">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow="Gallery" lines={["Moments from", <Accent key="g">the trail.</Accent>]} />
                <p className="text-sm text-muted">{photos.length + travellerPhotos.length} photos</p>
              </div>
              <TripPhotos
                title={trip.title}
                ours={photos.map((p) => ({ src: p.src, w: p.w, h: p.h, alt: p.alt }))}
                travellers={travellerPhotos}
                shareHref={whatsappHref(`Namaste Base Camp Adventure, here are my photos from the ${trip.title}.`)}
              />
            </section>
          ) : null}

          {trip.faqs.length ? (
            <section id="faqs" className="scroll-mt-40">
              <SectionHeading eyebrow="FAQs" lines={["Your", <Accent key="q">questions.</Accent>]} />
              <div className="mt-8">
                <Faq items={trip.faqs} />
              </div>
            </section>
          ) : null}

          {trip.reviews.length ? (
            <section id="reviews" className="scroll-mt-40">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading eyebrow="Reviews" lines={["From the", <Accent key="t">trail.</Accent>]} />
                {trip.rating ? (
                  <div className="flex items-center gap-4 rounded-2xl border border-line bg-card px-5 py-4">
                    <span className="font-display text-5xl font-black">{trip.rating.value.toFixed(1)}</span>
                    <span>
                      <span className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="fill-marigold text-marigold size-4" aria-hidden />
                        ))}
                      </span>
                      <span className="text-sm text-muted">{trip.rating.count} reviews</span>
                    </span>
                  </div>
                ) : null}
              </div>
              <Stagger className="mt-8 grid gap-4 md:grid-cols-2">
                {trip.reviews.map((r, i) => (
                  <StaggerItem key={i} className="rounded-[1.4rem] border border-line bg-card p-6">
                    <div className="flex gap-0.5" aria-label={`${r.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={s < Math.round(r.rating) ? "fill-marigold text-marigold size-4" : "size-4 text-line"} aria-hidden />
                      ))}
                    </div>
                    {r.title ? <p className="mt-3 font-bold">{r.title}</p> : null}
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{r.body}</p>
                    <p className="mt-4 border-t border-line pt-3 text-sm font-semibold">
                      {r.author} {r.date ? <span className="font-normal text-muted">· {formatDate(r.date) || r.date}</span> : null}
                    </p>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          ) : null}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-40">
            <BookingCard slug={trip.slug} title={trip.title} price={trip.price} days={trip.days} />
          </div>
        </aside>
      </div>

      {guides.length ? (
        <section className="border-t border-line py-20">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
            <SectionHeading eyebrow={`${region?.name} guides`} lines={["Read before", <Accent key="y">you go.</Accent>]} />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {guides.map((p) => (
                <Link key={p.slug} href={`/${p.slug}/`} className="group">
                  <div className="zoom-img relative aspect-[16/10] overflow-hidden rounded-[1.2rem] bg-snow-2">
                    {p.cover ? <Image src={p.cover.src} alt={p.cover.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : null}
                  </div>
                  <h3 className="mt-4 text-lg font-bold leading-snug group-hover:text-pine">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted">{p.readingMinutes} min read</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="bg-snow-2 py-20 lg:py-28">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="You might also like" lines={["Other trails", <Accent key="n">nearby.</Accent>]} />
              <Link href="/trip/" className="text-pine inline-flex items-center gap-2 font-bold">
                All trips <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {related.map((t) => (
                <TripCard key={t.slug} trip={t} regionName={region?.name} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="h-20 lg:hidden" aria-hidden />
      <MobileBookingBar slug={trip.slug} title={trip.title} price={trip.price} />
      <TripModals trip={{ slug: trip.slug, title: trip.title, days: trip.days, price: trip.price, cover: trip.cover }} />
      <JsonLd data={tripLd(trip)} />
    </>
  );
}
