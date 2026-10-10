import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { LineReveal, Reveal } from "@/components/motion";
import { breadcrumbLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type Crumb = { name: string; path: string };

/** Breadcrumb trail plus its BreadcrumbList schema. */
export function Breadcrumbs({ items, tone = "dark" }: { items: Crumb[]; tone?: "dark" | "light" }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm", tone === "dark" ? "text-white/70" : "text-muted")}>
          {all.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 ? <ChevronRight className="size-3.5 opacity-60" aria-hidden /> : null}
              {i === all.length - 1 ? (
                <span aria-current="page" className={tone === "dark" ? "text-white" : "text-ink"}>{c.name}</span>
              ) : (
                <Link href={c.path} className="link-draw hover:text-current">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}

/**
 * Photo hero for interior pages. The page title is the one H1.
 */
export function PageHero({
  title,
  accent,
  eyebrow,
  intro,
  photo,
  crumbs,
  children,
  size = "md",
}: {
  title: string;
  accent?: string;
  eyebrow?: string;
  intro?: React.ReactNode;
  photo: string;
  crumbs: Crumb[];
  children?: React.ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <section className={cn("bg-pine-night relative isolate flex items-end overflow-hidden text-white", size === "lg" ? "min-h-[78svh]" : "min-h-[62svh]")}>
      <Image src={photo} alt="" fill preload quality={75} sizes="100vw" className="kenburns -z-10 object-cover" />
      <div className="scrim-hero absolute inset-0 -z-10" />
      <div className="text-shadow-soft mx-auto w-full max-w-[90rem] px-4 pt-36 pb-14 sm:px-6 lg:pb-20">
        <Reveal y={10}>
          <Breadcrumbs items={crumbs} />
        </Reveal>
        {eyebrow ? (
          <Reveal y={10} delay={0.05}>
            <p className="eyebrow text-marigold mt-8 flex items-center gap-3">
              <span className="bg-marigold inline-block h-px w-8" aria-hidden />
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        <LineReveal
          as="h1"
          immediate
          delay={0.1}
          lines={accent ? [title, <span key="a" className="accent-word text-marigold">{accent}</span>] : [title]}
          className="font-display mt-4 max-w-5xl text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-[0.86]"
        />
        {intro ? (
          <Reveal delay={0.3} y={14}>
            <div className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">{intro}</div>
          </Reveal>
        ) : null}
        {children ? <Reveal delay={0.4} y={14}>{children}</Reveal> : null}
      </div>
    </section>
  );
}
