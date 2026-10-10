import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, Leaf, Users } from "lucide-react";
import { CountUp, Parallax, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { Accent, SectionHeading } from "@/components/section-heading";
import { getPage, getTeam, getTrips } from "@/lib/content";
import { meta } from "@/lib/seo";
import { site } from "@/lib/site";

const page = () => getPage("about-us");

export const metadata = meta({
  path: "/about-us/",
  title: "About Us",
  description: "Base Camp Adventure was founded in 2009 by a local guide. Meet the Kathmandu team behind our treks, tours and climbs in Nepal, Bhutan and Tibet.",
  seo: page()?.seo,
});

export default function AboutPage() {
  const p = page();
  const team = getTeam();
  const years = new Date().getFullYear() - site.founded;

  return (
    <>
      <PageHero
        title="Local roots."
        accent="Open horizons."
        eyebrow="Our story"
        intro="Founded in 2009 by a local guide, and still run from Thamel by the people who walk the trails."
        photo="/photos/annapurna-pokhara.webp"
        crumbs={[{ name: "About us", path: "/about-us/" }]}
        size="lg"
      />

      <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6">
        <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.6rem] border border-line bg-line lg:grid-cols-4">
          {[
            { n: years, s: "", l: "Years on the trail" },
            { n: getTrips().length, s: "", l: "Itineraries" },
            { n: team.length, s: "", l: "Guides & staff" },
            { n: 24, s: "/7", l: "Support in Nepal" },
          ].map((x) => (
            <StaggerItem key={x.l} className="bg-white p-8">
              <CountUp to={x.n} suffix={x.s} className="font-display block text-6xl font-black" />
              <p className="eyebrow mt-2 text-muted">{x.l}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto grid max-w-[90rem] gap-14 px-4 pb-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <Parallax className="aspect-[4/5] rounded-[2rem] bg-pine-night" amount={8}>
            <Image src="/photos/namche.webp" alt="Namche Bazaar from above" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </Parallax>
        </div>
        <div>
          <SectionHeading eyebrow="Who we are" lines={["Founded by a guide.", <Accent key="b">Built on a love of Nepal.</Accent>]} />
          {p ? (
            <Reveal>
              <div className="prose-trail mt-8" dangerouslySetInnerHTML={{ __html: p.html }} />
            </Reveal>
          ) : null}
        </div>
      </section>

      <section className="bg-pine-night relative overflow-hidden py-24 text-white">
        <div className="contours absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6">
          <SectionHeading tone="dark" eyebrow="How we work" lines={["Four promises", <Accent key="k">we keep.</Accent>]} />
          <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Users, t: "Small groups", d: "Private trips or small groups, so the pace is yours and the teahouse has room." },
              { Icon: BadgeCheck, t: "Licensed local guides", d: "Government-licensed, first-aid trained, from the valleys you walk through." },
              { Icon: HeartHandshake, t: "Fair to the crew", d: "Wages, insurance, gear and meals for every guide and porter are in the price." },
              { Icon: Leaf, t: "Leave no trace", d: "Partners of KEEP Nepal. Refill water, pack out waste, respect the monasteries." },
            ].map(({ Icon, t, d }) => (
              <StaggerItem key={t} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-6">
                <Icon className="text-marigold size-7" aria-hidden />
                <p className="mt-4 text-lg font-bold">{t}</p>
                <p className="mt-2 text-sm text-white/70">{d}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="The people behind the journey" lines={["Meet the", <Accent key="t">team.</Accent>]} />
          <Link href="/our-team/" className="text-pine inline-flex items-center gap-2 font-bold">
            Everyone <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <Stagger className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
          {team.slice(0, 4).map((m) => (
            <StaggerItem key={m.slug}>
              <Link href={`/team/${m.slug}/`} className="group block">
                <div className="zoom-img relative aspect-[3/4] overflow-hidden rounded-[1.4rem] bg-snow-2">
                  {m.photo ? <Image src={m.photo.src} alt={m.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /> : null}
                </div>
                <p className="mt-4 font-bold group-hover:text-pine">{m.name}</p>
                <p className="text-sm text-muted">{m.role}</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-line bg-white py-16">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow text-pine">Registered in Nepal</p>
            <p className="mt-2 font-mono text-sm text-ink-soft">{site.registration.map((r) => `${r.label} ${r.value}`).join("  ·  ")}</p>
          </div>
          <ul className="flex flex-wrap items-center gap-6">
            {site.affiliations.map((a) => (
              <li key={a.name}>
                <Image src={a.logo} alt={a.name} title={a.name} width={a.logo.includes("bookmundi") ? 130 : 56} height={56} className="h-12 w-auto object-contain" />
              </li>
            ))}
          </ul>
          <Link href="/legal-documents/" className="text-pine inline-flex items-center gap-2 font-bold">
            Licences &amp; documents <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
