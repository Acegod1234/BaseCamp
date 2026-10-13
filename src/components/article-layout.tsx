import Link from "next/link";
import { ArrowRight, Clock, PenLine } from "lucide-react";
import { ShareBar, TableOfContents } from "@/components/article-tools";
import { Newsletter } from "@/components/newsletter";
import { ReadingProgress, Reveal } from "@/components/motion";
import { PageHero, type Crumb } from "@/components/page-hero";
import { PostCard } from "@/components/post-card";
import { TripCard } from "@/components/trip-card";
import { abs } from "@/lib/seo";
import { site } from "@/lib/site";
import type { PostCard as PCard, TocItem, TripCard as TCard } from "@/lib/types";

/**
 * Long-form reading layout shared by blog posts and information pages:
 * a table of contents on the left, the text, and a trip suggestion beside it.
 */
export function ArticleLayout({
  title,
  eyebrow,
  intro,
  photo,
  crumbs,
  html,
  toc,
  path,
  meta,
  trips = [],
  related = [],
  categoryNames,
}: {
  title: string;
  eyebrow?: string;
  intro?: string;
  photo: string;
  crumbs: Crumb[];
  html: string;
  toc: TocItem[];
  path: string;
  meta?: { author?: string; date?: string; minutes?: number };
  trips?: TCard[];
  related?: PCard[];
  categoryNames?: Record<string, string>;
}) {
  // Main headings; with only a couple of them, their sub-headings too.
  const main = toc.filter((t) => t.level === 2);
  const headings = main.length > 2 ? main : toc.filter((t) => t.level <= 3);

  return (
    <>
      <ReadingProgress />
      <PageHero title={title} eyebrow={eyebrow} intro={intro} photo={photo} crumbs={crumbs}>
        {meta ? (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            {meta.author ? (
              <span className="inline-flex items-center gap-2"><PenLine className="text-pine size-4" aria-hidden /> {meta.author}</span>
            ) : null}
            {meta.date ? <span>{meta.date}</span> : null}
            {meta.minutes ? (
              <span className="inline-flex items-center gap-2"><Clock className="text-pine size-4" aria-hidden /> {meta.minutes} min read</span>
            ) : null}
          </div>
        ) : null}
      </PageHero>

      <div className="mx-auto grid max-w-site gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)_20rem] lg:gap-14">
        <aside className="hidden lg:block">
          {headings.length > 2 ? <TableOfContents headings={headings} variant="side" /> : null}
        </aside>

        <article className="min-w-0">
          {headings.length > 2 ? <TableOfContents headings={headings} variant="inline" /> : null}
          <Reveal>
            <div className="prose-trail mx-auto" dangerouslySetInnerHTML={{ __html: html }} />
          </Reveal>
          <div className="mx-auto mt-14 max-w-[72ch] space-y-8 border-t border-line pt-8">
            <ShareBar url={abs(path)} title={title} />
            {trips.length ? (
              <div>
                <p className="eyebrow text-pine">Trips for this guide</p>
                <div className="package-grid-gap mt-4 grid sm:grid-cols-2">
                  {trips.slice(0, 2).map((t) => (
                    <TripCard key={t.slug} trip={t} />
                  ))}
                </div>
              </div>
            ) : null}
            <div className="rounded-xl border border-line bg-snow-2 p-5">
              <p className="font-display text-xl text-ink">Enjoyed this guide?</p>
              <p className="mt-1 text-sm text-ink-soft">Get new guides, trip ideas and festival offers by email.</p>
              <Newsletter source="blog" className="mt-4" />
            </div>
          </div>
        </article>

        <aside className="min-w-0">
          <div className="sticky top-32 space-y-5">
            <div className="bg-pine relative overflow-hidden rounded-xl p-6 text-white">
              <p className="eyebrow text-glacier">Base Camp Adventure</p>
              <p className="font-display mt-2 text-2xl leading-tight">Customize Your Trip</p>
              <p className="mt-2 text-sm text-white/80">{site.customize}</p>
              <Link href="/customize-trip/#request" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#006c7c]">
                Customize Trip <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            {trips.slice(2, 4).map((t) => (
              <TripCard key={t.slug} trip={t} />
            ))}
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="bg-snow-2 py-20">
          <div className="mx-auto max-w-site px-4 sm:px-6">
            <h2 className="font-display text-4xl">
              Keep <span className="accent-word">reading.</span>
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} categoryNames={categoryNames} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

/** Region photography by topic, for pages without their own cover. */
export function topicPhoto(slug: string) {
  if (/bhutan/.test(slug)) return "/photos/region-bhutan.webp";
  if (/tibet/.test(slug)) return "/photos/region-tibet.webp";
  if (/culture|religion|people|festival|food/.test(slug)) return "/photos/activity-tour.webp";
  if (/flora|fauna/.test(slug)) return "/photos/region-nepal.webp";
  if (/season|weather/.test(slug)) return "/photos/hero-gokyo.webp";
  if (/visa|travel|transport|embass|prepar|facts/.test(slug)) return "/photos/page-contact.webp";
  return "/photos/region-everest.webp";
}

/** The image to use for a page's hero. */
export function heroPhoto(cover: { src: string } | null, slug: string) {
  return cover?.src ?? topicPhoto(slug);
}

