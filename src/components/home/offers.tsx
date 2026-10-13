import Link from "next/link";
import { ArrowRight, BadgePercent, Sparkles } from "lucide-react";
import { Countdown, CopyCode } from "@/components/home/offer-bits";
import { Stagger, StaggerItem } from "@/components/motion";
import { Newsletter } from "@/components/newsletter";
import { Accent, SectionHeading } from "@/components/section-heading";
import { TripCard } from "@/components/trip-card";
import type { Offer, TripCard as Card } from "@/lib/types";
import { formatDate, usd } from "@/lib/utils";

/**
 * Festival offers. When the company switches an offer on in the admin
 * (Dashain, Tihar, New Year...), its banner, code and countdown lead the
 * section. The rest of the year it lists the trips that carry a reduced
 * price on the site today.
 */
export function Offers({ offer, trips, regionNames }: { offer: Offer | null; trips: Card[]; regionNames: Record<string, string> }) {
  if (!offer && !trips.length) return null;
  const best = trips.reduce((m, t) => Math.max(m, t.price?.regular ? t.price.regular - t.price.amount : 0), 0);
  const shown = trips.slice(0, 4);

  return (
    <section id="offers" className="scroll-mt-24 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-6">
        {offer ? (
          <div className="bg-pine relative mb-12 overflow-hidden rounded-[1.4rem] text-white dark:bg-pine-deep">
            <div aria-hidden className="blueprint absolute inset-0 text-white opacity-[0.08]" />
            <div aria-hidden className="absolute -top-24 -left-20 size-80 rounded-full bg-[#36c4d5]/35 blur-3xl" />
            <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[0.68rem] font-bold tracking-[0.14em] uppercase">
                  <Sparkles className="size-3.5" aria-hidden /> {offer.festival}
                </p>
                <h2 className="font-display mt-4 text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]">{offer.title}</h2>
                <p className="mt-3 max-w-xl text-white/85">{offer.summary}</p>
                {offer.ends ? <p className="mt-3 text-sm text-white/70">Book by {formatDate(offer.ends)}</p> : null}
              </div>
              <div className="flex flex-col gap-4 lg:items-end">
                {offer.percent ? (
                  <p className="font-display text-[clamp(4rem,9vw,7rem)] leading-none">
                    {offer.percent}
                    <span className="text-[0.45em]">% off</span>
                  </p>
                ) : null}
                {offer.ends ? <Countdown until={offer.ends} /> : null}
                {offer.code ? <CopyCode code={offer.code} /> : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={offer ? "On offer" : "Offers"}
            lines={offer ? ["Trips in", <Accent key="o">this offer.</Accent>] : ["Save on", <Accent key="o">these trips.</Accent>]}
          />
          <div className="flex flex-col gap-3 lg:items-end">
            {best ? (
              <p className="inline-flex items-center gap-2 text-sm text-ink-soft">
                <BadgePercent className="text-crimson size-5" aria-hidden />
                {trips.length} trips on offer · save up to <strong className="text-ink">{usd(best)}</strong>
              </p>
            ) : null}
            <Link href="/trip/" className="border-b-2 border-ink pb-1 text-sm font-bold">
              See every trip
            </Link>
          </div>
        </div>
        <div className="mb-8 flex flex-col gap-3 rounded-xl border border-line bg-snow-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">Hear about festival offers first.</strong> Dashain, Tihar and New Year offers by email.
          </p>
          <Newsletter source="offers" className="w-full sm:max-w-sm" />
        </div>

        <Stagger className="rail package-grid-gap grid sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((t) => (
            <StaggerItem key={t.slug}>
              <TripCard trip={t} regionName={regionNames[t.destinations[0]]} />
            </StaggerItem>
          ))}
        </Stagger>
        {trips.length > shown.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {trips.slice(4, 12).map((t) => (
              <Link key={t.slug} href={`/trip/${t.slug}/`} className="hover:border-pine hover:text-pine inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-[0.8rem] font-semibold transition-colors">
                {t.title}
                {t.price?.regular ? <span className="text-crimson">−{usd(t.price.regular - t.price.amount)}</span> : null}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
