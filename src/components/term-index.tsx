import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { Stagger, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { itemListLd } from "@/lib/seo";

type Item = { slug: string; name: string; trips: number; photo: string; line: string };

/** Index of destinations or activities as large photo tiles. */
export function TermIndex({
  base,
  path,
  title,
  accent,
  intro,
  photo,
  crumb,
  items,
}: {
  base: "destinations" | "activities";
  path: string;
  title: string;
  accent: string;
  intro?: string;
  photo: string;
  crumb: string;
  items: Item[];
}) {
  return (
    <>
      <PageHero title={title} accent={accent} eyebrow="Nepal & beyond" intro={intro} photo={photo} crumbs={[{ name: crumb, path }]} />
      <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6">
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <StaggerItem key={it.slug} className={i === 0 ? "md:col-span-2 lg:row-span-2" : ""}>
              <Link href={`/${base}/${it.slug}/`} className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-[1.8rem] bg-pine-night p-7 text-white">
                <Image src={it.photo} alt={`${it.name}`} fill sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} quality={70} className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                <div className="scrim-b absolute inset-0" />
                <div className="relative">
                  <p className="font-mono text-xs text-white/65">{it.trips} trips</p>
                  <h2 className={`font-display mt-2 font-black uppercase leading-[0.9] ${i === 0 ? "text-6xl sm:text-7xl" : "text-4xl"}`}>{it.name}</h2>
                  <p className="mt-2 max-w-md text-white/80">{it.line}</p>
                </div>
                <span className="bg-marigold text-pine-night absolute top-6 right-6 grid size-12 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" aria-hidden />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <JsonLd data={itemListLd(title, items.map((i) => `/${base}/${i.slug}/`))} />
    </>
  );
}
