import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, BadgeCheck, HeartHandshake, Route, Star, Users } from "lucide-react";
import { Accreditations } from "@/components/accreditations";
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
        title="About"
        accent="Us"
        eyebrow="Base Camp Adventure"
        intro={site.description}
        photo="/photos/page-about-group.webp"
        crumbs={[{ name: "About us", path: "/about-us/" }]}
        size="lg"
      />

      <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6">
        <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.6rem] border border-line bg-line lg:grid-cols-4">
          {[
            { n: years, s: "", l: "Years on the trail" },
            { n: getTrips().length, s: "", l: "Trips" },
            { n: team.length, s: "", l: "Guides & staff" },
            { n: 24, s: "/7", l: "Available" },
          ].map((x) => (
            <StaggerItem key={x.l} className="bg-card p-8">
              <CountUp to={x.n} suffix={x.s} className="font-display block text-6xl font-black" />
              <p className="eyebrow mt-2 text-muted">{x.l}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto grid max-w-[90rem] gap-14 px-4 pb-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <Parallax className="aspect-[4/5] rounded-[2rem] bg-pine-night" amount={8}>
            <Image src="/photos/page-about.webp" alt="Evening light over Namche Bazaar" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </Parallax>
        </div>
        <div>
          <SectionHeading eyebrow="Who we are" lines={["Base Camp", <Accent key="b">Adventure</Accent>]} />
          {p ? (
            <Reveal>
              <div className="prose-trail mt-8" dangerouslySetInnerHTML={{ __html: p.html }} />
            </Reveal>
          ) : null}
        </div>
      </section>

      <section className="bg-pine-night relative overflow-hidden py-24 text-white">
        <div className="aura absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6">
          <SectionHeading tone="dark" eyebrow="Base Camp Adventure" lines={["Why Travel", <span key="w">with <span className="accent-word text-marigold">Us?</span></span>]} />
          <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {[
              { Icon: Users, t: "Small Group Adventures" },
              { Icon: BadgeCheck, t: "Experienced Local Guides" },
              { Icon: Route, t: "Tailor-Made Itineraries" },
              { Icon: Award, t: "Multi-award-winning company" },
              { Icon: HeartHandshake, t: "No Hidden Fees" },
              { Icon: Star, t: "Trusted by Travelers" },
            ].map(({ Icon, t }) => (
              <StaggerItem key={t} className="flex flex-col gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:p-6">
                <Icon className="text-marigold size-7 shrink-0" aria-hidden />
                <p className="font-bold sm:text-lg">{t}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <Link href="/why-book-with-us/" className="bg-marigold text-pine-night mt-10 inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold">
            Why Travel With Us? <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Base Camp Adventure" lines={["Our", <Accent key="t">Team</Accent>]} />
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

      <section className="border-t border-line bg-card py-16">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow text-pine">Registered in Nepal</p>
            <p className="mt-2 font-mono text-sm text-ink-soft">{site.registration.map((r) => `${r.label} ${r.value}`).join("  ·  ")}</p>
          </div>
          <Accreditations variant="compact" />
          <Link href="/legal-documents/" className="text-pine inline-flex items-center gap-2 font-bold">
            Licences &amp; documents <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
