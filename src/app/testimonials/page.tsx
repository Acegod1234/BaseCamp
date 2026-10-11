import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Flag } from "@/components/flag";
import { PageHero } from "@/components/page-hero";
import { ReviewText } from "@/components/review-text";
import { ShowMore } from "@/components/show-more";
import { getAllReviews, getTripadvisor } from "@/lib/content";
import { reviewer } from "@/lib/reviewer";
import { meta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const metadata = meta({
  path: "/testimonials/",
  title: "Traveller Reviews",
  description: "Reviews from travellers who trekked and toured with Base Camp Adventure: Everest Base Camp, Annapurna, Langtang, Poon Hill and more.",
});

export default function TestimonialsPage() {
  const reviews = getAllReviews();
  const ta = getTripadvisor();
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / Math.max(1, reviews.length);
  const rows = reviews.map((r) => ({ r, who: reviewer(r.author) }));
  const countries = new Map<string, { name: string; flag: string; n: number }>();
  for (const { who } of rows) {
    if (!who.code || !who.flag) continue;
    const c = countries.get(who.code) ?? { name: who.country ?? who.code, flag: who.flag, n: 0 };
    c.n++;
    countries.set(who.code, c);
  }
  const excellent = ta ? Math.round(((ta.breakdown.excellent ?? 0) / ta.reviews) * 1000) / 10 : null;

  return (
    <>
      <PageHero
        title="Testimonials"
        eyebrow={`${reviews.length} reviews · ${avg.toFixed(1)} average`}
        photo="/photos/page-reviews.webp"
        crumbs={[{ name: "Reviews", path: "/testimonials/" }]}
      />

      <section className="mx-auto max-w-[90rem] px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          {ta ? (
            <a href={ta.url} target="_blank" rel="noopener noreferrer" className="group hover:border-pine/40 flex flex-col gap-5 rounded-2xl border border-line bg-card p-5 transition-colors sm:flex-row sm:items-center sm:p-6">
              <span className="grid h-20 w-24 shrink-0 place-items-center">
                <Image src="/brand/partners/tripadvisor.png" alt="Tripadvisor" width={245} height={220} className="h-16 w-auto dark:brightness-0 dark:invert" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-3">
                  <span className="font-display text-5xl leading-none text-ink">{ta.rating.toFixed(1)}</span>
                  <span className="text-sm text-ink-soft">
                    from <strong className="text-ink">{ta.reviews} reviews</strong> on Tripadvisor
                  </span>
                </span>
                {excellent ? (
                  <span className="mt-3 block">
                    <span className="flex justify-between text-xs text-muted">
                      <span>Excellent</span>
                      <span>{excellent}%</span>
                    </span>
                    <span className="mt-1 block h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                      <span className="block h-full rounded-full bg-[#34e0a1]" style={{ width: `${excellent}%` }} />
                    </span>
                  </span>
                ) : null}
                {ta.ranking ? <span className="mt-2 block text-xs text-muted">{ta.ranking}</span> : null}
              </span>
              <span className="text-pine inline-flex items-center gap-1 text-sm font-bold group-hover:underline">
                Read on Tripadvisor <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </a>
          ) : null}
          {countries.size ? (
            <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
              <p className="eyebrow text-pine">Travellers from {countries.size} countries</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {[...countries.values()]
                  .sort((a, b) => b.n - a.n)
                  .map((c) => (
                    <li key={c.name} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-snow px-3 py-1.5 text-sm font-semibold">
                      <Flag svg={c.flag} label={c.name} /> {c.name}
                      <span className="text-xs font-normal text-muted">{c.n}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <ShowMore className="columns-1 gap-5 md:columns-2 lg:columns-3 [&>*>*]:mb-5 [&>*>*]:break-inside-avoid" label="more reviews">
          {rows.map(({ r, who }, i) => (
            <article key={i} className="rounded-2xl border border-line bg-card p-6">
              <div className="flex gap-0.5" aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={s < Math.round(r.rating) ? "fill-marigold text-marigold size-4" : "size-4 text-line"} aria-hidden />
                ))}
              </div>
              {r.title ? <p className="mt-3 font-bold">{r.title}</p> : null}
              <div className="mt-3">
                <ReviewText text={r.body} />
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#00afc4] to-[#00788a] text-xs font-bold text-white">
                  {who.name.replace(/[^A-Za-z\s]/g, " ").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "★"}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <span className="truncate">{who.name}</span>
                    {who.flag && who.country ? <Flag svg={who.flag} label={who.country} /> : null}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {who.place ? `${who.place} · ` : ""}
                    <Link href={`/trip/${r.trip.slug}/`} className="text-pine hover:underline">
                      {r.trip.title}
                    </Link>
                    {r.date ? ` · ${formatDate(r.date) || r.date}` : ""}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </ShowMore>
      </section>
    </>
  );
}
