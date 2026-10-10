import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PageHero, type Crumb } from "@/components/page-hero";
import { PostCard } from "@/components/post-card";
import { getTaxonomies } from "@/lib/content";
import { itemListLd } from "@/lib/seo";
import type { PostCard as Card } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

/** Path WordPress used for a category, including its parent. */
export function categoryPath(slug: string) {
  const cats = getTaxonomies().categories;
  const c = cats.find((x) => x.slug === slug);
  const parent = c?.parent ? cats.find((x) => x.id === c.parent) : null;
  return parent ? `/category/${parent.slug}/${slug}/` : `/category/${slug}/`;
}

export function JournalList({
  posts,
  title,
  accent,
  intro,
  crumbs,
  activeCategory,
  photo = "/photos/page-gallery.webp",
}: {
  posts: Card[];
  title: string;
  accent: string;
  intro: string;
  crumbs: Crumb[];
  activeCategory?: string;
  photo?: string;
}) {
  const cats = getTaxonomies().categories.filter((c) => c.count > 0 && c.slug !== "uncategorized");
  const names = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHero title={title} accent={accent} eyebrow={`${posts.length} articles`} intro={intro} photo={lead?.cover?.src ?? photo} crumbs={crumbs} />

      <div className="h-6" aria-hidden />
      <div data-subnav className="sticky top-[4.5rem] z-30 px-2.5 sm:px-4 lg:top-[5.25rem]">
        <nav aria-label="Journal categories" className="no-scrollbar mx-auto flex max-w-[86rem] gap-1.5 overflow-x-auto rounded-2xl border border-line bg-white/92 p-1.5 shadow-[0_14px_40px_-26px_oklch(0.2_0.04_170/0.45)] backdrop-blur-xl">
          <Link href="/blogs/" className={cn("shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors", !activeCategory ? "bg-pine text-white" : "text-ink-soft hover:bg-snow-2 hover:text-ink")}>
            All articles
          </Link>
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={categoryPath(c.slug)}
              className={cn("shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors", activeCategory === c.slug ? "bg-pine text-white" : "text-ink-soft hover:bg-snow-2 hover:text-ink")}
            >
              {c.name} <span className="font-mono text-xs opacity-60">{c.count}</span>
            </Link>
          ))}
        </nav>
      </div>

      <section className="mx-auto max-w-[90rem] px-4 pt-10 pb-16 sm:px-6">
        {lead ? (
          <Reveal>
            <Link href={`/${lead.slug}/`} className="group grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
              <div className="zoom-img relative aspect-[16/10] overflow-hidden rounded-[1.8rem] bg-snow-2">
                {lead.cover ? <Image src={lead.cover.src} alt={lead.cover.alt || lead.title} fill preload sizes="(max-width: 1024px) 100vw, 55vw" quality={75} className="object-cover" /> : null}
              </div>
              <div>
                <p className="eyebrow text-pine">Latest · {formatDate(lead.published)} · {lead.readingMinutes} min read</p>
                <h2 className="font-display mt-3 text-[clamp(2.4rem,4.5vw,4rem)] font-black uppercase leading-[0.9] transition-colors group-hover:text-pine">{lead.title}</h2>
                <p className="mt-4 text-lg text-ink-soft">{lead.excerpt}</p>
                <span className="text-pine mt-6 inline-flex items-center gap-2 font-bold">
                  Read the article <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </div>
            </Link>
          </Reveal>
        ) : null}

        <Stagger className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <StaggerItem key={p.slug}>
              <PostCard post={p} categoryNames={names} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <JsonLd data={itemListLd(title, posts.map((p) => `/${p.slug}/`))} />
    </>
  );
}
