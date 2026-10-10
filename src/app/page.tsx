import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock, Mountain, Star } from "lucide-react";
import { Accreditations } from "@/components/accreditations";
import { AltitudeProfile } from "@/components/altitude-profile";
import { placeOf } from "@/lib/itinerary";
import { Faq } from "@/components/faq";
import { FeaturedTrips, type TripGroup } from "@/components/home/featured-trips";
import { HomeHero } from "@/components/home/hero";
import { RegionShowcase } from "@/components/home/regions";
import { TripCarousel } from "@/components/home/trip-carousel";
import { Parallax, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PhotoGlow } from "@/components/photo-glow";
import { ReviewsMarquee } from "@/components/reviews-marquee";
import { Accent, SectionHeading } from "@/components/section-heading";
import { TripCard } from "@/components/trip-card";
import {
  getAllReviews,
  getFeaturedTrips,
  getHomeList,
  getLiveTerms,
  getPostCards,
  getTeam,
  getTrip,
  getTripCards,
  getTripsIn,
  photo,
  termSummary,
} from "@/lib/content";
import { meta } from "@/lib/seo";
import { regionMeta, site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata = meta({
  path: "/",
  title: "Base Camp Adventure - Tours and Trekking Company in Nepal",
  description: site.description,
});

const FAQ = [
  { q: "Can I customise my trip?", a: "<p>Yes. We tailor itineraries to your available time, interests, fitness level and travel preferences. Share your plans through our <a href=\"/customize-trip/\">trip-planning page</a>.</p>" },
  { q: "What information is included with a trek?", a: "<p>Our trip information covers the itinerary, costs, accommodation, equipment and useful travel details. Open a trip page to start planning, or ask us for the full itinerary.</p>" },
  { q: "Do you offer more than trekking?", a: "<p>We arrange cultural tours, peak climbing, helicopter tours, jungle safaris, rafting and day tours in Nepal, as well as trips to Bhutan and Tibet.</p>" },
  { q: "How do I choose the right trip?", a: "<p>Tell us how much time you have, what you'd like to see and your trekking experience. We'll help you choose an itinerary around your interests and fitness level.</p>" },
  { q: "Where can I find your booking terms?", a: "<p>Read our <a href=\"/terms-and-conditions/\">terms and conditions</a> for the full booking information, or contact our Kathmandu team with your questions.</p>" },
];

export default function HomePage() {
  const cards = getTripCards();
  const { destinations } = getLiveTerms();
  const regionNames = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  const founder = getTeam().find((m) => m.slug === "shree-ghimire");
  const reviews = getAllReviews();
  const posts = getPostCards().slice(0, 3);
  const ebc = getTrip("everest-base-camp-trek");
  const featured = getFeaturedTrips();
  const popular = getHomeList("popular");
  const luxury = getHomeList("luxury");
  const tours = getTripsIn("activities", "nepal-tour").slice(0, 8);

  const byRegion = (slug: string) => cards.filter((c) => c.destinations.includes(slug)).sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0) || (b.price ? 1 : 0) - (a.price ? 1 : 0));
  const all = [...featured, ...popular.filter((p) => !featured.some((f) => f.slug === p.slug))];
  const groups: TripGroup[] = [
    { key: "all", label: "All adventures", trips: all, href: "/trip/" },
    { key: "everest", label: "Everest", trips: byRegion("everest-region"), href: "/destinations/everest-region/" },
    { key: "annapurna", label: "Annapurna", trips: byRegion("annapurna-region"), href: "/destinations/annapurna-region/" },
    { key: "langtang", label: "Langtang", trips: byRegion("langtang-region"), href: "/destinations/langtang-region/" },
    { key: "manaslu", label: "Manaslu", trips: byRegion("manaslu-region"), href: "/destinations/manaslu-region/" },
  ].filter((g) => g.trips.length);

  const regionOrder = ["everest-region", "annapurna-region", "langtang-region", "manaslu-region", "remote-area-trekking", "bhutan", "tibet"];
  const panels = regionOrder
    .map((slug) => {
      const d = destinations.find((x) => x.slug === slug);
      if (!d) return null;
      const s = termSummary("destinations", slug);
      return { slug, name: d.name, line: s.line, photo: regionMeta[slug]?.photo ?? "/photos/region-everest.webp", trips: d.trips, highest: s.highest };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const slides = [
    { slot: "region-everest", label: "Everest" },
    { slot: "hero-alpenglow", label: "Annapurna" },
    { slot: "hero-gokyo", label: "Gokyo Lakes" },
    { slot: "hero-ama-dablam", label: "Ama Dablam" },
    { slot: "hero-mustang", label: "Upper Mustang" },
  ].map(({ slot, label }) => ({ src: photo(slot).src, label }));

  const about = photo("hero-alpenglow");
  // Key stops on the classic route, read from the real itinerary.
  const stops = ebc ? ebc.itinerary.filter((d) => d.altitude && placeOf(d.title)).filter((d, i, a) => a.findIndex((x) => placeOf(x.title) === placeOf(d.title)) === i).slice(0, 8) : [];

  return (
    <>
      <HomeHero slides={slides} />

      {/* 01 / Find your trail */}
      <section id="find" className="scroll-mt-24 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="01 / Find your trail" lines={["Where do you", <span key="g">want to <Accent>go?</Accent></span>]} />
            <Reveal className="max-w-sm">
              <p className="text-ink-soft">From the foothills to Everest Base Camp. Find a trip that fits your time and your sense of adventure.</p>
              <Link href="/trip/" className="mt-3 inline-block border-b-2 border-ink pb-1 text-sm font-bold">Explore the full collection</Link>
            </Reveal>
          </div>
          <FeaturedTrips groups={groups} regionNames={regionNames} regions={destinations.map((d) => ({ slug: d.slug, name: d.name }))} />
        </div>
      </section>

      {/* Nepal tours */}
      {tours.length ? (
        <section className="border-t border-line py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading eyebrow="Nepal tours" lines={["Discover Nepal.", <Accent key="b">Beyond the trails.</Accent>]} />
              <Reveal className="max-w-sm">
                <p className="text-ink-soft">Explore cultural landmarks, city life and wildlife with our local team.</p>
              </Reveal>
            </div>
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {tours.map((t) => (
                <StaggerItem key={t.slug}>
                  <TripCard trip={t} regionName="Nepal Tour" label={`${t.days} ${t.days === 1 ? "day" : "days"}`} />
                </StaggerItem>
              ))}
            </Stagger>
            <div className="mt-10 flex justify-center">
              <Link href="/activities/nepal-tour/" className="bg-pine hover:bg-pine-deep inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold text-white transition-colors">
                View all Nepal tours <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* 02 / Get to know Nepal */}
      <section className="bg-pine relative overflow-hidden py-20 text-white sm:py-24 lg:py-28 dark:bg-pine-deep">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading tone="dark" eyebrow="02 / Get to know Nepal" lines={["Same country.", <Accent key="d">Different worlds.</Accent>]} />
            <Reveal className="max-w-sm">
              <p className="text-white/80">Everest, Annapurna, Langtang, Manaslu. There&apos;s more than one way into the Himalayas.</p>
            </Reveal>
          </div>
          <RegionShowcase regions={panels} />
        </div>
      </section>

      {/* 03 / Day by day: the classic route, from the real itinerary */}
      {ebc ? (
        <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:items-start lg:gap-14">
              <div className="lg:sticky lg:top-28">
                <SectionHeading eyebrow={`03 / ${ebc.title}`} lines={["Day by", <Accent key="d">day.</Accent>]} />
                <Reveal delay={0.1}>
                  <p className="mt-5 text-ink-soft">{ebc.summary}</p>
                  <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
                    {[
                      { k: "Days", v: String(ebc.days) },
                      { k: "Highest", v: `${ebc.maxAltitude?.toLocaleString("en-US")} m` },
                      { k: "From", v: ebc.price ? `US$${ebc.price.amount.toLocaleString("en-US")}` : "Ask us" },
                    ].map((x) => (
                      <div key={x.k} className="bg-card p-4">
                        <dt className="text-[0.62rem] font-bold tracking-[0.14em] text-muted uppercase">{x.k}</dt>
                        <dd className="font-display mt-1 text-xl text-ink sm:text-2xl">{x.v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link href="/trip/everest-base-camp-trek/#itinerary" className="bg-pine hover:bg-pine-deep mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold text-white transition-colors">
                    See the full itinerary <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-line bg-card p-4 sm:p-6">
                  <AltitudeProfile days={ebc.itinerary} tone="light" />
                </div>
                <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {stops.map((d) => (
                    <li key={d.day} className="rounded-xl border border-line bg-card px-3.5 py-3">
                      <p className="text-[0.62rem] font-bold tracking-[0.14em] text-pine uppercase">Day {d.day}</p>
                      <p className="mt-1 truncate text-sm font-semibold">{placeOf(d.title)}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
                        <Mountain className="size-3" aria-hidden /> {d.altitude?.toLocaleString("en-US")} m
                      </p>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}

      {/* Popular Trekking & Tour Packages */}
      <section className="bg-snow-2 overflow-hidden py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={`${popular.length} packages`} lines={["Popular trekking", <span key="p">& tour <Accent>packages.</Accent></span>]} />
          <div className="mt-6">
            <TripCarousel trips={popular} regionNames={regionNames} moreHref="/trip/" moreLabel={`All ${cards.length} trips`} />
          </div>
        </div>
      </section>

      {/* Luxury Trekking & Tour Packages, with Customize as the fourth tile */}
      {luxury.length ? (
        <section className="py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="In comfort" lines={["Luxury trekking", <span key="l">& tour <Accent>packages.</Accent></span>]} />
            <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {luxury.map((t) => (
                <StaggerItem key={t.slug}>
                  <TripCard trip={t} regionName={regionNames[t.destinations[0]]} label="Luxury" />
                </StaggerItem>
              ))}
              <StaggerItem>
                <Link href="/customize-trip/" className="bg-pine group relative flex h-full min-h-[22rem] flex-col justify-between overflow-hidden rounded-[1.1rem] p-6 text-white">
                  <span className="text-[0.64rem] font-bold tracking-[0.14em] text-white/70 uppercase">Customize your trip</span>
                  <span>
                    <span className="font-display block text-3xl leading-[1.05]">
                      A route made <span className="accent-word">around you.</span>
                    </span>
                    <span className="mt-3 block text-sm text-white/80">{site.customize}</span>
                    <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#006c7c]">
                      Customize Trip <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* 04 / The people behind the journey */}
      <section className="border-t border-line py-20 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <div className="relative isolate">
            <PhotoGlow src={about.src} strength="lg" />
            <Parallax className="aspect-[5/4] rounded-xl bg-snow-2" amount={7}>
              <Image src={about.src} alt="Evening light on the Annapurna range" fill sizes="(max-width: 1024px) 100vw, 45vw" quality={80} className="object-cover" />
            </Parallax>
            <Reveal delay={0.2} className="bg-glacier-soft absolute top-6 right-4 rotate-[3deg] rounded-md px-5 py-4 text-center shadow-lg sm:-right-4">
              <p className="text-[0.58rem] font-bold tracking-[0.18em] text-pine uppercase">On the trail since</p>
              <p className="font-display text-pine text-4xl">2009</p>
              <p className="text-[0.55rem] font-bold tracking-[0.18em] text-pine uppercase">Kathmandu, Nepal</p>
            </Reveal>
            <div className="mt-3 flex justify-between text-[0.6rem] font-bold tracking-[0.16em] text-muted uppercase">
              <span>The place we call home</span>
              <span>Nepal / Annapurna</span>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="04 / The people behind the journey" lines={["Local roots.", <Accent key="o">Open horizons.</Accent>]} />
            <Reveal delay={0.1}>
              <p className="mt-6 text-xl leading-snug text-ink">
                Founded by a local guide.
                <br />
                Built on a love of Nepal.
              </p>
              <p className="mt-5 text-ink-soft">{site.about}</p>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-5">
                {founder?.photo ? (
                  <div className="flex items-center gap-3">
                    <span className="relative size-12 overflow-hidden rounded-full">
                      <Image src={founder.photo.src} alt={founder.name} fill sizes="48px" className="object-cover" />
                    </span>
                    <span>
                      <span className="block font-bold">{founder.name}</span>
                      <span className="accent-word block text-sm text-muted">Founder &amp; Managing Director</span>
                    </span>
                  </div>
                ) : null}
                <Link href="/our-team/" className="border-b-2 border-ink pb-1 text-sm font-bold">Meet our team</Link>
              </div>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                {["Small groups", "Local guides", "No hidden fees"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <Check className="text-pine size-4" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Our affiliation */}
      <section id="affiliations" className="scroll-mt-24 border-t border-line pt-16">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Licensed & trusted" lines={["Our", <Accent key="a">affiliation.</Accent>]} />
        </div>
        <div className="mt-4">
          <Accreditations />
        </div>
      </section>

      {/* Testimonials */}
      {reviews.length ? (
        <section className="bg-snow-2 overflow-hidden py-20 sm:py-24">
          <div className="mx-auto mb-10 flex max-w-[90rem] flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <SectionHeading eyebrow="Testimonials" lines={["In their", <Accent key="w">own words.</Accent>]} />
            <Link href="/testimonials/" className="inline-flex items-center gap-2 self-start rounded-lg border border-line bg-card px-4 py-2.5 text-sm lg:self-auto">
              <Star className="fill-marigold text-marigold size-4" aria-hidden />
              <span className="font-bold">{reviews.length} reviews</span>
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ReviewsMarquee reviews={reviews.slice(0, 18)} />
        </section>
      ) : null}

      {/* 05 / Before you go */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <SectionHeading eyebrow="05 / Before you go" lines={["A few things", <span key="k">worth <Accent>knowing.</Accent></span>]} />
            <Reveal delay={0.1}>
              <p className="mt-5 text-ink-soft">
                Start with the essentials.
                <br />
                Ask us about the rest.
              </p>
              <Link href="/contact-us/" className="mt-6 inline-block border-b-2 border-ink pb-1 text-sm font-bold">Talk through your plans</Link>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Faq items={FAQ} />
          </Reveal>
        </div>
      </section>

      {/* From the journal */}
      <section className="border-t border-line py-20 sm:py-24">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Journal" lines={["Notes from", <Accent key="t">the trail.</Accent>]} />
            <Link href="/blogs/" className="border-b-2 border-ink pb-1 text-sm font-bold">Read our blogs</Link>
          </div>
          <Stagger className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <StaggerItem key={p.slug} className="relative isolate">
                {p.cover ? <PhotoGlow src={p.cover.src} strength="sm" /> : null}
                <Link href={`/${p.slug}/`} className="group block">
                  <div className="zoom-img relative aspect-[16/10] overflow-hidden rounded-xl bg-snow-2">
                    {p.cover ? <Image src={p.cover.src} alt={p.cover.alt} fill sizes="(max-width: 768px) 100vw, 33vw" quality={75} className="object-cover" /> : null}
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-[0.64rem] font-bold tracking-[0.14em] text-muted uppercase">
                    {formatDate(p.published)} <span aria-hidden>·</span> <Clock className="size-3" aria-hidden /> {p.readingMinutes} min
                  </p>
                  <h3 className="font-display mt-2 text-xl leading-snug group-hover:text-pine">{p.title}</h3>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
