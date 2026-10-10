import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  Clock,
  HeartHandshake,
  Route,
  Star,
  Users,
} from "lucide-react";
import { Accreditations } from "@/components/accreditations";
import { AltitudeProfile } from "@/components/altitude-profile";
import { HomeHero } from "@/components/home/hero";
import { RegionShowcase } from "@/components/home/regions";
import { TripCarousel } from "@/components/home/trip-carousel";
import { activityIcons } from "@/components/icons";
import { Parallax, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PhotoGlow } from "@/components/photo-glow";
import { RegionMarquee } from "@/components/region-marquee";
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
  photo,
  termSummary,
} from "@/lib/content";
import { meta } from "@/lib/seo";
import { activityMeta, regionMeta, site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata = meta({
  path: "/",
  title: "Base Camp Adventure - Tours and Trekking Company in Nepal",
  description: site.description,
});

/** The live site's "Why Travel with Us?" list, word for word. */
const WHY = [
  { Icon: Users, t: "Small Group Adventures" },
  { Icon: BadgeCheck, t: "Experienced Local Guides" },
  { Icon: Route, t: "Tailor-Made Itineraries" },
  { Icon: Award, t: "Multi-award-winning company" },
  { Icon: HeartHandshake, t: "No Hidden Fees" },
  { Icon: Star, t: "Trusted by Travelers" },
];

/** "Explore More Activities" as on the live homepage. */
const MORE = [
  { label: "Nepal Tour", slug: "nepal-tour" },
  { label: "Nepal Peak Climbing", slug: "nepal-peak-climbing" },
  { label: "Bhutan Tour", slug: "tours-in-bhutan" },
  { label: "Tibet Tour", slug: "tours-in-tibet" },
];

export default function HomePage() {
  const cards = getTripCards();
  const { destinations, activities } = getLiveTerms();
  const regionNames = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  const founder = getTeam().find((m) => m.slug === "shree-ghimire");
  const reviews = getAllReviews();
  const posts = getPostCards().slice(0, 4);
  const ebc = getTrip("everest-base-camp-trek");
  const featured = getFeaturedTrips();
  const popular = getHomeList("popular");
  const luxury = getHomeList("luxury");

  const slideSources = [
    { slot: "home-banner", alt: "Trekkers on the trail with Base Camp Adventure" },
    { slot: "hero-ama-dablam", alt: "Trekkers below Ama Dablam" },
    { slot: "hero-alpenglow", alt: "Evening light on the Annapurna range" },
    { slot: "hero-gokyo", alt: "Gokyo Lake and the Ngozumpa glacier" },
    { slot: "hero-machapuchare", alt: "Machapuchare above the Annapurna foothills" },
    { slot: "hero-mustang", alt: "A village in Upper Mustang" },
  ];
  const slides = slideSources.map(({ slot, alt }) => {
    const p = photo(slot);
    const t = p.trip ? getTrip(p.trip) : null;
    return { src: p.src, alt, trip: t ? { slug: t.slug, title: t.title, days: t.days, maxAltitude: t.maxAltitude } : null };
  });

  const regionOrder = ["everest-region", "annapurna-region", "langtang-region", "manaslu-region", "remote-area-trekking", "bhutan", "tibet"];
  const panels = regionOrder
    .map((slug) => {
      const d = destinations.find((x) => x.slug === slug);
      if (!d) return null;
      const s = termSummary("destinations", slug);
      return { slug, name: d.name.replace(" Region", ""), line: s.line, photo: regionMeta[slug]?.photo ?? "/photos/region-everest.webp", trips: d.trips, highest: s.highest };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const about = photo("page-about");

  return (
    <>
      <HomeHero
        slides={slides}
        regions={destinations.map((d) => ({ slug: d.slug, name: d.name }))}
        activities={activities.map((a) => ({ slug: a.slug, name: a.name }))}
        stats={{ trips: cards.length, regions: destinations.length, years: new Date().getFullYear() - site.founded }}
      />

      <RegionMarquee />

      {/* About Us */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative isolate">
            <PhotoGlow src={about.src} strength="lg" />
            <Parallax className="aspect-[4/3] rounded-[2rem] bg-pine-night sm:aspect-[4/5]" amount={8}>
              <Image src={about.src} alt="Evening light over Namche Bazaar" fill sizes="(max-width: 1024px) 100vw, 45vw" quality={80} className="object-cover" />
            </Parallax>
            {founder?.photo ? (
              <Reveal delay={0.2} className="absolute right-3 -bottom-6 w-36 rounded-[1.2rem] bg-card p-2.5 shadow-2xl sm:-right-6 sm:w-56 sm:p-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                  <Image src={founder.photo.src} alt={founder.name} fill sizes="224px" className="object-cover" />
                </div>
                <p className="mt-2.5 text-sm font-bold sm:text-base">{founder.name}</p>
                <p className="text-xs text-muted sm:text-sm">{founder.role}</p>
              </Reveal>
            ) : null}
            <div className="bg-marigold text-pine-night absolute top-4 left-4 rounded-full px-4 py-2 font-mono text-xs font-medium">SINCE {site.founded}</div>
          </div>

          <div className="pt-6 lg:pt-0">
            <SectionHeading eyebrow="Base Camp Adventure" lines={["About", <Accent key="u">Us</Accent>]} />
            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft">{site.about}</p>
              <Link href="/about-us/" className="bg-ink text-snow mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold transition-colors hover:bg-pine">
                Read More <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section id="find" className="bg-snow-2 scroll-mt-20 py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Handpicked" lines={["Featured", <Accent key="t">Trips</Accent>]} intro={site.featuredIntro} />
            <Link href="/trip/" className="text-pine inline-flex items-center gap-2 font-bold">
              View All Trips <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t, i) => (
              <StaggerItem key={t.slug}>
                <TripCard trip={t} regionName={regionNames[t.destinations[0]]} priority={i < 3} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Popular Trekking & Tour Packages */}
      <section className="overflow-hidden py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <SectionHeading eyebrow={`${popular.length} packages`} lines={["Popular Trekking", <span key="p">& Tour <Accent>Packages</Accent></span>]} />
          <div className="mt-8">
            <TripCarousel trips={popular} regionNames={regionNames} moreHref="/trip/" moreLabel={`All ${cards.length} trips`} />
          </div>
        </div>
      </section>

      {/* Everest Base Camp, day by day, from the real itinerary */}
      {ebc ? (
        <section className="bg-pine-night relative overflow-hidden py-20 text-white sm:py-28 lg:py-32">
          <div className="aura absolute inset-0" aria-hidden />
          <div className="relative mx-auto grid max-w-[90rem] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.4fr] lg:items-center lg:gap-12">
            <div>
              <SectionHeading tone="dark" eyebrow={ebc.title} lines={["Day by", <Accent key="d">day.</Accent>]} intro={ebc.summary} />
              <Reveal delay={0.2}>
                <ul className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  <li>
                    <p className="font-display text-3xl font-black sm:text-4xl">{ebc.days}</p>
                    <p className="eyebrow text-white/55">Days</p>
                  </li>
                  <li>
                    <p className="font-display text-3xl font-black sm:text-4xl">{ebc.maxAltitude?.toLocaleString("en-US")}</p>
                    <p className="eyebrow text-white/55">Metres max</p>
                  </li>
                  <li>
                    <p className="font-display text-marigold text-3xl font-black sm:text-4xl">${ebc.price?.amount.toLocaleString("en-US")}</p>
                    <p className="eyebrow text-white/55">/ Adult</p>
                  </li>
                </ul>
                <Link href="/trip/everest-base-camp-trek/" className="bg-marigold text-pine-night mt-8 inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold transition-colors hover:bg-white">
                  View Detail <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-3 sm:rounded-[1.8rem] sm:p-6">
                <AltitudeProfile days={ebc.itinerary} tone="dark" />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Explore More Activities */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Beyond trekking" lines={["Explore More", <Accent key="a">Activities</Accent>]} />
            <Link href="/activities/" className="text-pine inline-flex items-center gap-2 font-bold">
              All activities <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {MORE.map((m) => {
              const a = activities.find((x) => x.slug === m.slug);
              const am = activityMeta[m.slug];
              const Icon = activityIcons[am?.icon ?? "compass"];
              return (
                <StaggerItem key={m.slug} className="relative isolate">
                  {am ? <PhotoGlow src={am.photo} /> : null}
                  <Link href={`/activities/${m.slug}/`} className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[1.4rem] bg-pine-night p-4 text-white sm:aspect-[4/5] sm:p-6">
                    {am ? <Image src={am.photo} alt={m.label} fill sizes="(max-width: 1024px) 50vw, 25vw" quality={75} className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" /> : null}
                    <div className="scrim-b absolute inset-0" />
                    <span className="glass-dark relative grid size-10 place-items-center rounded-xl sm:size-12 sm:rounded-2xl">
                      <Icon className="text-marigold size-5 sm:size-6" aria-hidden />
                    </span>
                    <div className="relative">
                      {a ? <p className="font-mono text-[0.68rem] text-white/70 sm:text-xs">{a.trips} trips</p> : null}
                      <h3 className="font-display mt-1 text-2xl font-black uppercase leading-[0.9] sm:text-4xl">{m.label}</h3>
                    </div>
                    <span className="bg-marigold text-pine-night absolute top-4 right-4 grid size-9 place-items-center rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:top-6 sm:right-6 sm:size-11">
                      <ArrowUpRight className="size-4 sm:size-5" aria-hidden />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Customize Your Trip */}
      <section className="relative isolate overflow-hidden bg-pine-night py-20 text-white sm:py-28">
        <Image src={photo("page-customize").src} alt="" fill sizes="100vw" quality={80} className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pine-night via-pine-night/80 to-transparent" />
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <div className="max-w-2xl">
            <SectionHeading tone="dark" eyebrow="Tailor-made" lines={["Customize", <Accent key="y">Your Trip</Accent>]} intro={site.customize} />
            <Reveal delay={0.2}>
              <Link href="/customize-trip/" className="bg-marigold text-pine-night mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold transition-colors hover:bg-white">
                Customize Trip <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Luxury Trekking & Tour Packages */}
      {luxury.length ? (
        <section className="py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
            <SectionHeading eyebrow="In comfort" lines={["Luxury Trekking", <span key="l">& Tour <Accent>Packages</Accent></span>]} />
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {luxury.map((t) => (
                <StaggerItem key={t.slug}>
                  <TripCard trip={t} regionName={regionNames[t.destinations[0]]} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Destinations */}
      <section className="bg-snow-2 py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Nepal, Bhutan & Tibet" lines={[<Accent key="d">Destinations</Accent>]} />
            <Link href="/destination/" className="text-pine inline-flex items-center gap-2 font-bold">
              All destinations <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-12">
            <RegionShowcase regions={panels} />
          </div>
        </div>
      </section>

      {/* Our Affiliations */}
      <section className="pt-20 sm:pt-28">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <SectionHeading eyebrow="Licensed & trusted" lines={["Our", <Accent key="a">Affiliations</Accent>]} />
        </div>
        <div className="mt-6">
          <Accreditations />
        </div>
      </section>

      {/* Why Travel with Us? */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Base Camp Adventure" lines={["Why Travel", <span key="w">with <Accent>Us?</Accent></span>]} />
            <Link href="/why-book-with-us/" className="text-pine inline-flex items-center gap-2 font-bold">
              Why Travel With Us? <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {WHY.map(({ Icon, t }) => (
              <StaggerItem key={t} className="group flex flex-col gap-4 rounded-[1.4rem] border border-line bg-card p-5 transition-colors hover:border-pine/40 sm:flex-row sm:items-center sm:p-7">
                <span className="bg-pine/10 text-pine group-hover:bg-pine grid size-12 shrink-0 place-items-center rounded-2xl transition-colors group-hover:text-white sm:size-14">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="text-base font-bold leading-snug sm:text-lg">{t}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Testimonials */}
      {reviews.length ? (
        <section className="bg-snow-2 overflow-hidden py-20 sm:py-28 lg:py-32">
          <div className="mx-auto mb-12 flex max-w-[90rem] flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="From our travellers" lines={[<Accent key="t">Testimonials</Accent>]} />
            <Link href="/testimonials/" className="inline-flex items-center gap-3 self-start rounded-full border border-line bg-card px-5 py-3 lg:self-auto">
              <Star className="fill-marigold text-marigold size-5" aria-hidden />
              <span className="font-bold">{reviews.length} reviews</span>
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ReviewsMarquee reviews={reviews.slice(0, 18)} />
        </section>
      ) : null}

      {/* Blogs */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Travel journal" lines={["Read Our", <Accent key="b">Blogs</Accent>]} />
            <Link href="/blogs/" className="text-pine inline-flex items-center gap-2 font-bold">
              All articles <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Stagger className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-6">
            {posts[0] ? (
              <StaggerItem className="relative isolate">
                {posts[0].cover ? <PhotoGlow src={posts[0].cover.src} /> : null}
                <Link href={`/${posts[0].slug}/`} className="group block">
                  <div className="zoom-img relative aspect-[16/11] overflow-hidden rounded-[1.6rem] bg-snow-2">
                    {posts[0].cover ? <Image src={posts[0].cover.src} alt={posts[0].cover.alt} fill sizes="(max-width: 1024px) 100vw, 55vw" quality={78} className="object-cover" /> : null}
                  </div>
                  <p className="eyebrow text-pine mt-5">{formatDate(posts[0].published)} · {posts[0].readingMinutes} min read</p>
                  <h3 className="font-display mt-2 text-3xl font-black uppercase leading-[0.92] group-hover:text-pine sm:text-4xl">{posts[0].title}</h3>
                  <p className="mt-3 line-clamp-2 text-ink-soft">{posts[0].excerpt}</p>
                </Link>
              </StaggerItem>
            ) : null}
            <div className="flex flex-col gap-6">
              {posts.slice(1).map((p) => (
                <StaggerItem key={p.slug}>
                  <Link href={`/${p.slug}/`} className="group grid grid-cols-[7.5rem_1fr] gap-4 sm:grid-cols-[11rem_1fr] sm:gap-5">
                    <div className="zoom-img relative aspect-[4/3] overflow-hidden rounded-2xl bg-snow-2">
                      {p.cover ? <Image src={p.cover.src} alt={p.cover.alt} fill sizes="176px" className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="eyebrow text-muted flex items-center gap-1.5">
                        <Clock className="size-3" aria-hidden /> {p.readingMinutes} min
                      </p>
                      <h3 className="mt-1.5 text-base leading-snug font-bold group-hover:text-pine sm:text-lg">{p.title}</h3>
                      <p className="mt-1 hidden line-clamp-2 text-sm text-muted sm:block">{p.excerpt}</p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </div>
      </section>
    </>
  );
}
