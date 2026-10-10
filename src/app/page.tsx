import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Clock, HeartHandshake, Route, Star, Users } from "lucide-react";
import { Accreditations } from "@/components/accreditations";
import { AltitudeProfile } from "@/components/altitude-profile";
import { Faq } from "@/components/faq";
import { FeaturedTrips, type TripGroup } from "@/components/home/featured-trips";
import { HomeHero } from "@/components/home/hero";
import { RegionShowcase } from "@/components/home/regions";
import { activityIcons } from "@/components/icons";
import { CountUp, Parallax, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { RegionMarquee } from "@/components/region-marquee";
import { ReviewsMarquee } from "@/components/reviews-marquee";
import { Accent, SectionHeading } from "@/components/section-heading";
import {
  getAllReviews,
  getFeaturedTrips,
  getLiveTerms,
  getPostCards,
  getTeam,
  getTrip,
  getTripCards,
} from "@/lib/content";
import { meta } from "@/lib/seo";
import { activityMeta, regionMeta, site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata = meta({
  path: "/",
  title: "Base Camp Adventure | Trekking & Tours in Nepal since 2009",
  description:
    "Trek to Everest Base Camp, Annapurna, Langtang and Manaslu with a Kathmandu company founded by a local guide in 2009. Small groups, licensed guides, tailor-made itineraries.",
});

const HOME_FAQ = [
  { q: "Can I customise my trip?", a: "<p>Yes. We tailor itineraries to your available time, interests, fitness level and travel preferences. Share your plans through our <a href=\"/customize-trip/\">trip-planning page</a>.</p>" },
  { q: "What information is included with a trek?", a: "<p>Our trip information covers the itinerary, costs, accommodation, equipment and useful travel details. Open a trip page to start planning, or ask us for the full itinerary.</p>" },
  { q: "Do you offer more than trekking?", a: "<p>We arrange cultural tours, peak climbing, helicopter tours, jungle safaris, rafting and day tours in Nepal, as well as trips to Bhutan and Tibet.</p>" },
  { q: "How do I choose the right trip?", a: "<p>Tell us how much time you have, what you'd like to see and your trekking experience. We'll help you choose an itinerary around your interests and fitness level.</p>" },
  { q: "Where can I find your booking terms?", a: "<p>Read our <a href=\"/terms-and-conditions/\">terms and conditions</a> for the full booking information, or contact our Kathmandu team with your questions.</p>" },
];

export default function HomePage() {
  const cards = getTripCards();
  const { destinations, activities } = getLiveTerms();
  const regionNames = Object.fromEntries(destinations.map((d) => [d.slug, d.name]));
  const team = getTeam();
  const founder = team.find((m) => m.slug === "shree-ghimire") ?? team[0];
  const reviews = getAllReviews().slice(0, 18);
  const posts = getPostCards().slice(0, 4);
  const ebc = getTrip("everest-base-camp-trek");

  const byRegion = (slug: string) => cards.filter((c) => c.destinations.includes(slug)).sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0) || (b.price ? 1 : 0) - (a.price ? 1 : 0));
  const groups: TripGroup[] = [
    { key: "featured", label: "Featured", trips: getFeaturedTrips(), href: "/trip/" },
    { key: "everest", label: "Everest", trips: byRegion("everest-region"), href: "/destinations/everest-region/" },
    { key: "annapurna", label: "Annapurna", trips: byRegion("annapurna-region"), href: "/destinations/annapurna-region/" },
    { key: "langtang", label: "Langtang", trips: byRegion("langtang-region"), href: "/destinations/langtang-region/" },
    { key: "manaslu", label: "Manaslu", trips: byRegion("manaslu-region"), href: "/destinations/manaslu-region/" },
    { key: "remote", label: "Mustang & beyond", trips: byRegion("remote-area-trekking"), href: "/destinations/remote-area-trekking/" },
    { key: "climb", label: "Peak climbing", trips: cards.filter((c) => c.activities.includes("nepal-peak-climbing")), href: "/activities/nepal-peak-climbing/" },
  ].filter((g) => g.trips.length);

  const regionOrder = ["everest-region", "annapurna-region", "langtang-region", "manaslu-region", "remote-area-trekking", "bhutan", "tibet"];
  const panels = regionOrder
    .map((slug) => {
      const d = destinations.find((x) => x.slug === slug);
      const m = regionMeta[slug];
      return d && m ? { slug, name: slug === "remote-area-trekking" ? "Mustang & Remote" : d.name.replace(" Region", ""), line: m.line, photo: m.photo, trips: d.trips, peak: m.peak, altitude: m.altitude } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <>
      <HomeHero
        slides={[
          { src: "/photos/ama-dablam.webp", place: "Ama Dablam", altitude: 6812, coords: "27.8617° N 86.8614° E", credit: "Vyacheslav Argenberg" },
          { src: "/photos/everest-khumbu.webp", place: "Everest & Nuptse", altitude: 8849, coords: "27.9881° N 86.9250° E", credit: "Vyacheslav Argenberg" },
          { src: "/photos/gokyo-lake.webp", place: "Gokyo Lakes", altitude: 4790, coords: "27.9535° N 86.6948° E", credit: "Vyacheslav Argenberg" },
          { src: "/photos/machapuchare.webp", place: "Machapuchare", altitude: 6993, coords: "28.4947° N 83.9489° E", credit: "Carsten Nebel" },
          { src: "/photos/mustang.webp", place: "Upper Mustang", altitude: 3840, coords: "29.1833° N 83.9500° E", credit: "Nishan Hitang" },
        ]}
        regions={destinations.map((d) => ({ slug: d.slug, name: d.name }))}
        stats={{ trips: cards.length, regions: destinations.length, years: new Date().getFullYear() - site.founded }}
      />

      <Accreditations />
      <RegionMarquee />

      {/* Where do you want to go? */}
      <section id="find" className="scroll-mt-20 py-24 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Find your trail"
              lines={["Where do you", <span key="l1">want to <Accent>go?</Accent></span>]}
              intro="From the foothills to Everest Base Camp. Find a trip that fits your time and your sense of adventure."
            />
          </div>
          <div className="mt-12">
            <FeaturedTrips groups={groups} regionNames={regionNames} />
          </div>
        </div>
      </section>

      {/* The climb, day by day */}
      {ebc ? (
        <section className="bg-pine-night relative overflow-hidden py-24 text-white lg:py-32">
          <div className="aura absolute inset-0" aria-hidden />
          <div className="relative mx-auto grid max-w-[90rem] gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.4fr] lg:items-center">
            <div>
              <SectionHeading
                tone="dark"
                eyebrow="The Himalayan classic"
                lines={["The climb,", <span key="l2"><Accent>day by</Accent> day.</span>]}
                intro={<>Everest Base Camp in {ebc.days} days. Lukla at 2,860 m to base camp at {ebc.maxAltitude?.toLocaleString("en-US")} m, with acclimatisation days at Namche and Dingboche built in.</>}
              />
              <Reveal delay={0.2}>
                <ul className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  <li>
                    <p className="font-display text-4xl font-black">{ebc.days}</p>
                    <p className="eyebrow text-white/55">days</p>
                  </li>
                  <li>
                    <p className="font-display text-4xl font-black">{ebc.maxAltitude?.toLocaleString("en-US")}</p>
                    <p className="eyebrow text-white/55">metres max</p>
                  </li>
                  <li>
                    <p className="font-display text-marigold text-4xl font-black">${ebc.price?.amount.toLocaleString("en-US")}</p>
                    <p className="eyebrow text-white/55">per person</p>
                  </li>
                </ul>
                <Link href="/trip/everest-base-camp-trek/" className="bg-marigold text-pine-night mt-8 inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold transition-colors hover:bg-white">
                  See the full itinerary <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6">
                <AltitudeProfile days={ebc.itinerary} tone="dark" />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* Same country. Different worlds. */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Get to know Nepal" lines={["Same country.", <Accent key="d">Different worlds.</Accent>]} intro="Everest, Annapurna, Langtang, Manaslu. There's more than one way into the Himalayas." />
            <Link href="/destination/" className="text-pine inline-flex items-center gap-2 font-bold">
              All destinations <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-12">
            <RegionShowcase regions={panels} />
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="bg-snow-2 py-24 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <SectionHeading eyebrow="More than trekking" lines={["Pick your", <Accent key="a">kind of wild.</Accent>]} intro="Climb a 6,000 m peak, raft the Bhotekoshi, or walk the old streets of Patan. Every trip has a local guide." />
          <Stagger className="mt-12 grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...activities].sort((a, b) => b.trips - a.trips).map((a, i, all) => {
              const m = activityMeta[a.slug];
              const Icon = activityIcons[m?.icon ?? "compass"];
              return (
                <StaggerItem key={a.slug} className={i === 0 ? "sm:col-span-2 sm:row-span-2" : i === 1 || (i === all.length - 1 && all.length % 2 === 1) ? "lg:col-span-2" : ""}>
                  <Link href={`/activities/${a.slug}/`} className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.5rem] bg-pine-night p-6 text-white">
                    {m ? <Image src={m.photo} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" quality={70} className="object-cover opacity-70 transition-transform duration-[1200ms] group-hover:scale-105" /> : null}
                    <div className="scrim-b absolute inset-0" />
                    <span className="glass-dark relative grid size-12 place-items-center rounded-2xl">
                      <Icon className="text-marigold size-6" aria-hidden />
                    </span>
                    <div className="relative">
                      <p className="font-mono text-xs text-white/65">{a.trips} trips</p>
                      <h3 className={`font-display mt-1 font-black uppercase leading-[0.9] ${i === 0 ? "text-5xl sm:text-6xl" : "text-3xl"}`}>{a.name}</h3>
                      {m ? <p className="mt-2 max-w-xs text-sm text-white/75">{m.line}</p> : null}
                    </div>
                    <span className="bg-marigold text-pine-night absolute top-6 right-6 grid size-11 place-items-center rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100">
                      <ArrowUpRight className="size-5" aria-hidden />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Local roots. Open horizons. */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="mx-auto grid max-w-[90rem] gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <Parallax className="aspect-[4/5] rounded-[2rem] bg-pine-night" amount={8}>
              <Image src="/photos/annapurna-pokhara.webp" alt="The Annapurna range above Pokhara" fill sizes="(max-width: 1024px) 100vw, 45vw" quality={70} className="object-cover" />
            </Parallax>
            {founder?.photo ? (
              <Reveal delay={0.2} className="absolute -right-2 -bottom-8 w-56 rounded-[1.4rem] bg-white p-3 shadow-2xl sm:right-[-2rem] sm:w-64">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                  <Image src={founder.photo.src} alt={founder.name} fill sizes="256px" className="object-cover" />
                </div>
                <p className="mt-3 font-bold">{founder.name}</p>
                <p className="text-sm text-muted">Founder &amp; Managing Director</p>
              </Reveal>
            ) : null}
            <div className="bg-marigold text-pine-night absolute top-6 left-6 rounded-full px-4 py-2 font-mono text-xs font-medium">ON THE TRAIL SINCE 2009</div>
          </div>

          <div>
            <SectionHeading eyebrow="The people behind the journey" lines={["Local roots.", <Accent key="o">Open horizons.</Accent>]} />
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
                <p>
                  <strong className="text-ink">Founded by a local guide. Built on a love of Nepal.</strong>{" "}Base Camp Adventure began in 2009. Since then, we&apos;ve been taking travellers into the Himalayan landscapes, cultures and traditions we know best.
                </p>
                <p>We plan around your time, interests and fitness level. Our experienced local guides take care of the details, so you can settle into the journey.</p>
              </div>
            </Reveal>
            <Stagger className="mt-10 grid grid-cols-2 gap-4">
              {[
                { Icon: Users, t: "Small groups", d: "Private or small-group departures, never a crowd." },
                { Icon: BadgeCheck, t: "Licensed local guides", d: "Government-licensed, first-aid trained, from the regions you walk." },
                { Icon: HeartHandshake, t: "No hidden fees", d: "Permits, guide, crew insurance: written down before you pay." },
                { Icon: Route, t: "Made around you", d: "Change the days, the pace or the route. We redraw it." },
              ].map(({ Icon, t, d }) => (
                <StaggerItem key={t} className="rounded-2xl border border-line bg-white p-5">
                  <Icon className="text-pine size-6" aria-hidden />
                  <p className="mt-3 font-bold">{t}</p>
                  <p className="mt-1 text-sm text-muted">{d}</p>
                </StaggerItem>
              ))}
            </Stagger>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <div>
                <CountUp to={new Date().getFullYear() - site.founded} className="font-display text-5xl font-black" />
                <p className="eyebrow text-muted">years guiding</p>
              </div>
              <div>
                <CountUp to={team.length} className="font-display text-5xl font-black" />
                <p className="eyebrow text-muted">guides &amp; staff</p>
              </div>
              <Link href="/our-team/" className="bg-ink hover:bg-pine inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-bold text-white transition-colors">
                Meet our team <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length ? (
        <section className="bg-snow-2 overflow-hidden py-24 lg:py-32">
          <div className="mx-auto mb-12 flex max-w-[90rem] flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Traveller reviews" lines={["In their", <Accent key="w">own words.</Accent>]} />
            <Link href="/testimonials/" className="inline-flex items-center gap-3 rounded-full border border-line bg-white px-5 py-3">
              <Star className="fill-marigold text-marigold size-5" aria-hidden />
              <span className="font-bold">{getAllReviews().length} verified reviews</span>
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ReviewsMarquee reviews={reviews} />
        </section>
      ) : null}

      {/* Journal */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Travel journal" lines={["Field notes", <Accent key="f">from the trail.</Accent>]} intro="Seasons, permits, difficulty and packing, written by the people who walk these routes every month." />
            <Link href="/blogs/" className="text-pine inline-flex items-center gap-2 font-bold">
              Read the journal <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Stagger className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            {posts[0] ? (
              <StaggerItem>
                <Link href={`/${posts[0].slug}/`} className="group block">
                  <div className="zoom-img relative aspect-[16/11] overflow-hidden rounded-[1.6rem] bg-snow-2">
                    {posts[0].cover ? <Image src={posts[0].cover.src} alt={posts[0].cover.alt} fill sizes="(max-width: 1024px) 100vw, 55vw" quality={70} className="object-cover" /> : null}
                  </div>
                  <p className="eyebrow text-pine mt-5">{formatDate(posts[0].published)} · {posts[0].readingMinutes} min read</p>
                  <h3 className="font-display mt-2 text-4xl font-black uppercase leading-[0.92] group-hover:text-pine">{posts[0].title}</h3>
                  <p className="mt-3 line-clamp-2 text-ink-soft">{posts[0].excerpt}</p>
                </Link>
              </StaggerItem>
            ) : null}
            <div className="flex flex-col gap-6">
              {posts.slice(1).map((p) => (
                <StaggerItem key={p.slug}>
                  <Link href={`/${p.slug}/`} className="group grid grid-cols-[8.5rem_1fr] gap-5 sm:grid-cols-[11rem_1fr]">
                    <div className="zoom-img relative aspect-[4/3] overflow-hidden rounded-2xl bg-snow-2">
                      {p.cover ? <Image src={p.cover.src} alt={p.cover.alt} fill sizes="176px" className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="eyebrow text-muted flex items-center gap-1.5">
                        <Clock className="size-3" aria-hidden /> {p.readingMinutes} min
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold leading-snug group-hover:text-pine">{p.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line py-24 lg:py-32">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="Before you go" lines={["A few things", <span key="l3">worth <Accent>knowing.</Accent></span>]} intro="Start with the essentials. Ask us about the rest." />
            <Reveal delay={0.2}>
              <Link href="/contact-us/" className="bg-pine mt-8 inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold text-white transition-colors hover:bg-pine-deep">
                Talk through your plans <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Faq items={HOME_FAQ} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
