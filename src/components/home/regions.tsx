"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";

export type RegionPanel = { slug: string; name: string; line: string; photo: string; trips: number; peak: string; altitude: number };

/**
 * "Same country. Different worlds." — an accordion of regions. On desktop the
 * panels sit side by side and the open one widens; on phones they stack.
 */
export function RegionShowcase({ regions }: { regions: RegionPanel[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-3 lg:h-[34rem] lg:flex-row">
      {regions.map((r, i) => {
        const active = i === open;
        return (
          <motion.div
            key={r.slug}
            layout
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            transition={{ layout: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
            className={cn(
              "group relative overflow-hidden rounded-[1.6rem] bg-pine-night",
              active ? "h-[26rem] lg:h-auto lg:flex-[3.2]" : "h-24 lg:h-auto lg:flex-[0.8]",
            )}
          >
            <Image src={r.photo} alt={`${r.name} landscape`} fill sizes="(max-width: 1024px) 100vw, 60vw" quality={70} className={cn("object-cover transition-transform duration-[1400ms]", active ? "scale-100" : "scale-110")} />
            <div className={cn("absolute inset-0 transition-colors duration-700", active ? "scrim-b" : "bg-pine-night/65")} />

            <button type="button" onClick={() => setOpen(i)} className="absolute inset-0 z-10 lg:hidden" aria-label={`Show ${r.name}`} aria-expanded={active} />

            {/* Collapsed label */}
            <div className={cn("absolute inset-0 flex items-center gap-4 px-6 transition-opacity duration-300 lg:flex-col lg:items-center lg:justify-end lg:px-0 lg:pb-8", active ? "opacity-0" : "opacity-100")}>
              <span className="font-mono text-xs text-white/60">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-2xl font-extrabold text-white uppercase lg:[writing-mode:vertical-rl] lg:rotate-180">{r.name}</span>
            </div>

            <AnimatePresence>
              {active ? (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-5 p-6 text-white sm:p-8 lg:flex-row lg:items-end lg:justify-between"
                >
                  <div>
                    <p className="font-mono text-xs text-white/60">{String(i + 1).padStart(2, "0")} / {String(regions.length).padStart(2, "0")}</p>
                    <h3 className="font-display mt-2 text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{r.name}</h3>
                    <p className="mt-3 max-w-md text-white/80">{r.line}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs">
                      <Mountain className="text-glacier size-4" aria-hidden /> {r.peak} · {r.altitude.toLocaleString("en-US")} m
                    </span>
                    <Link
                      href={`/destinations/${r.slug}/`}
                      className="bg-marigold text-pine-night inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors hover:bg-white"
                    >
                      {r.trips} trips <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
