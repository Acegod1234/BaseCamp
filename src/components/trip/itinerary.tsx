"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BedDouble, ChevronDown, Mountain, Utensils } from "lucide-react";
import type { ItineraryDay } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Day-by-day timeline. Every day's text is in the HTML even when folded. */
export function Itinerary({ days }: { days: ItineraryDay[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set([1]));
  const all = open.size === days.length;

  const toggle = (d: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button type="button" onClick={() => setOpen(all ? new Set() : new Set(days.map((d) => d.day)))} className="text-pine text-sm font-bold hover:underline">
          {all ? "Collapse all days" : "Expand all days"}
        </button>
      </div>
      <ol className="relative">
        <span aria-hidden className="absolute top-3 bottom-3 left-[1.15rem] w-px bg-gradient-to-b from-glacier via-pine/30 to-marigold" />
        {days.map((d) => {
          const isOpen = open.has(d.day);
          return (
            <li key={d.day} className="relative pb-3 pl-14">
              <span
                className={cn(
                  "absolute top-2.5 left-0 grid size-[2.3rem] place-items-center rounded-full border-2 font-mono text-xs font-medium transition-colors",
                  isOpen ? "bg-pine border-pine text-white" : "border-line bg-white text-ink",
                )}
              >
                {String(d.day).padStart(2, "0")}
              </span>
              <div className={cn("rounded-2xl border transition-colors", isOpen ? "border-pine/30 bg-white shadow-[0_18px_40px_-30px_oklch(0.2_0.04_170/0.5)]" : "border-transparent hover:bg-white/60")}>
                <h3>
                  <button type="button" onClick={() => toggle(d.day)} aria-expanded={isOpen} className="flex w-full items-start justify-between gap-4 p-4 text-left">
                    <span>
                      <span className="eyebrow text-muted">Day {d.day}</span>
                      <span className="mt-1 block font-semibold leading-snug">{d.title}</span>
                    </span>
                    <ChevronDown className={cn("mt-5 size-5 shrink-0 text-muted transition-transform", isOpen && "rotate-180")} aria-hidden />
                  </button>
                </h3>
                <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden" inert={!isOpen}>
                  <div className="px-4 pb-5">
                    {d.html ? <div className="prose-trail text-base" dangerouslySetInnerHTML={{ __html: d.html }} /> : null}
                    {d.altitude || d.overnight || d.meals.length ? (
                      <div className="mt-4 flex flex-wrap gap-2 text-sm">
                        {d.altitude ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-glacier-soft px-3 py-1.5 font-mono text-xs text-pine">
                            <Mountain className="size-3.5" aria-hidden /> <span className="measurement" data-meters={d.altitude}>{d.altitude.toLocaleString("en-US")} m</span>
                          </span>
                        ) : null}
                        {d.overnight ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-snow-2 px-3 py-1.5 text-xs">
                            <BedDouble className="size-3.5" aria-hidden /> {d.overnight}
                          </span>
                        ) : null}
                        {d.meals.length ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-marigold-soft px-3 py-1.5 text-xs">
                            <Utensils className="size-3.5" aria-hidden /> {d.meals.join(", ")}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
