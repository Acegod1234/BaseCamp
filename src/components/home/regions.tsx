"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Mountain, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type RegionPanel = { slug: string; name: string; line: string; photo: string; trips: number; highest: number | null };

/**
 * The prototype's "Same country. Different worlds.": a photograph on the left
 * and an accordion of regions on the right. Opening a region swaps the photo.
 */
export function RegionShowcase({ regions }: { regions: RegionPanel[] }) {
  const [open, setOpen] = useState(0);
  const r = regions[open];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black/20 lg:aspect-auto lg:min-h-[30rem]">
        <AnimatePresence initial={false}>
          <motion.div key={r.photo} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <Image src={r.photo} alt={`${r.name} landscape`} fill sizes="(max-width: 1024px) 100vw, 50vw" quality={80} className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="scrim-b absolute inset-0" />
        <AnimatePresence mode="wait">
          <motion.div key={r.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }} className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-[0.68rem] font-bold tracking-[0.16em] text-white/75 uppercase">{String(open + 1).padStart(2, "0")} / {r.name}</p>
            <p className="accent-word mt-2 text-4xl leading-[1.02] sm:text-5xl">{r.trips} trips to explore.</p>
            {r.highest ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <Mountain className="size-3.5" aria-hidden /> Up to {r.highest.toLocaleString("en-US")} m
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <ul className="divide-y divide-white/15 border-y border-white/15">
        {regions.map((x, i) => {
          const on = i === open;
          return (
            <li key={x.slug}>
              <button type="button" onClick={() => setOpen(i)} onMouseEnter={() => setOpen(i)} aria-expanded={on} className="flex w-full items-center gap-4 py-4 text-left">
                <span className="w-6 font-mono text-xs text-white/55">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-xl font-semibold tracking-tight transition-colors sm:text-2xl", on ? "text-glacier" : "text-white")}>{x.name}</span>
                  <span className="mt-0.5 block truncate text-sm text-white/65">{x.trips} trips</span>
                </span>
                {on ? <Minus className="size-5 text-white" aria-hidden /> : <Plus className="size-5 text-white/70" aria-hidden />}
              </button>
              <motion.div initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden" inert={!on}>
                <div className="pb-5 pl-10">
                  <p className="line-clamp-3 max-w-md text-sm leading-relaxed text-white/80">{x.line}</p>
                  <Link href={`/destinations/${x.slug}/`} className="mt-4 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#006c7c] transition-colors hover:bg-[#e0f1f4]">
                    Explore {x.name.replace(" Region", "")} trips
                  </Link>
                </div>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
