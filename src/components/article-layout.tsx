import Link from "next/link";
import { ArrowRight, Clock, PenLine } from "lucide-react";
import { FacebookIcon, WhatsappIcon, XIcon } from "@/components/icons";
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
  const share = encodeURIComponent(abs(path));
  const headings = toc.filter((t) => t.level === 2);

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

      <div className="mx-auto grid max-w-[90rem] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)_20rem] lg:gap-14">
        <aside className="hidden lg:block">
          {headings.length > 2 ? (
            <nav aria-label="On this page" className="sticky top-32">
              <p className="eyebrow text-pine">On this page</p>
              <ol className="mt-4 space-y-2 border-l border-line text-sm">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-ink-soft transition-colors hover:border-marigold hover:text-ink">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </aside>

        <article className="min-w-0">
          <Reveal>
            <div className="prose-trail mx-auto" dangerouslySetInnerHTML={{ __html: html }} />
          </Reveal>
          <div className="mx-auto mt-14 flex max-w-[72ch] flex-wrap items-center gap-3 border-t border-line pt-8">
            <span className="text-sm font-semibold">Share</span>
            <a aria-label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${share}`} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-full border border-line hover:border-pine"><FacebookIcon className="size-4" /></a>
            <a aria-label="Share on X" href={`https://x.com/intent/post?url=${share}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-full border border-line hover:border-pine"><XIcon className="size-3.5" /></a>
            <a aria-label="Share on WhatsApp" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${abs(path)}`)}`} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-full border border-line hover:border-pine"><WhatsappIcon className="size-4" /></a>
          </div>
        </article>

        <aside className="min-w-0">
          <div className="sticky top-32 space-y-5">
            <div className="bg-pine relative overflow-hidden rounded-xl p-6 text-white">
              <p className="eyebrow text-glacier">Base Camp Adventure</p>
              <p className="font-display mt-2 text-2xl leading-tight">Customize Your Trip</p>
              <p className="mt-2 text-sm text-white/80">{site.customize}</p>
              <Link href="/customize-trip/" className="bg-marigold text-pine-night mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
                Customize Trip <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            {trips.slice(0, 2).map((t) => (
              <TripCard key={t.slug} trip={t} />
            ))}
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="bg-snow-2 py-20">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
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

