"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BedDouble, ChevronDown, Coffee, Mountain, Route, Sandwich, Timer, UtensilsCrossed } from "lucide-react";
import { UnitTip, altitudeLines, distanceLines } from "@/components/unit-tip";
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
          const km = d.distanceKm ?? kmIn(`${d.title} ${d.html.replace(/<[^>]+>/g, " ")}`);
          return (
            <li key={d.day} className="relative pb-3 pl-14">
              <span
                className={cn(
                  "absolute top-2.5 left-0 grid size-[2.3rem] place-items-center rounded-full border-2 font-mono text-xs font-medium transition-colors",
                  isOpen ? "bg-pine border-pine text-white" : "border-line bg-card text-ink",
                )}
              >
                {String(d.day).padStart(2, "0")}
              </span>
              <div className={cn("rounded-2xl border transition-colors", isOpen ? "border-pine/30 bg-card shadow-[0_18px_40px_-30px_oklch(0.2_0.04_170/0.5)]" : "border-transparent hover:bg-card/60")}>
                <h3>
                  <button type="button" onClick={() => toggle(d.day)} aria-expanded={isOpen} className="flex w-full items-start justify-between gap-4 p-4 text-left">
                    <span>
                      <span className="eyebrow text-muted">Day {d.day}</span>
                      <span className="mt-1 block font-semibold leading-snug">{d.title}</span>
                    </span>
                    <ChevronDown className={cn("mt-5 size-5 shrink-0 text-muted transition-transform", isOpen && "rotate-180")} aria-hidden />
                  </button>
                </h3>
                {d.altitude || km || d.hours ? (
                  <ul className="-mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-3.5 text-[0.8rem] text-ink-soft" aria-label={`Day ${d.day} at a glance`}>
                    {d.altitude ? (
                      <li className="inline-flex items-center gap-1.5">
                        <Mountain className="text-pine size-3.5" aria-hidden /> {d.altitude.toLocaleString("en-US")} m
                        <UnitTip label="Altitude" lines={altitudeLines(d.altitude)} className="-ml-1" />
                      </li>
                    ) : null}
                    {km ? (
                      <li className="inline-flex items-center gap-1.5">
                        <Route className="text-pine size-3.5" aria-hidden /> {km.toLocaleString("en-US")} km
                        <UnitTip label="Distance, approx." lines={distanceLines(km)} className="-ml-1" />
                      </li>
                    ) : null}
                    {d.hours ? (
                      <li className="inline-flex items-center gap-1.5">
                        <Timer className="text-pine size-3.5" aria-hidden /> {d.hours} {d.hours === 1 ? "hour" : "hours"}
                      </li>
                    ) : null}
                  </ul>
                ) : null}
                <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden" inert={!isOpen}>
                  <div className="px-4 pb-5">
                    {d.html ? <div className="prose-trail text-base" dangerouslySetInnerHTML={{ __html: d.html }} /> : null}
                    {d.altitude || d.overnight || d.meals.length || d.hours || km ? (
                      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {d.altitude ? (
                          <Fact icon={<Mountain className="size-4" aria-hidden />} label="Altitude" value={`${d.altitude.toLocaleString("en-US")} m`} tip={<UnitTip label="Altitude" lines={altitudeLines(d.altitude)} />} />
                        ) : null}
                        {d.hours ? <Fact icon={<Timer className="size-4" aria-hidden />} label="Walking" value={`${d.hours} ${d.hours === 1 ? "hour" : "hours"}`} /> : null}
                        {km ? <Fact icon={<Route className="size-4" aria-hidden />} label="Distance" value={`${km.toLocaleString("en-US")} km`} tip={<UnitTip label="Distance, approx." lines={distanceLines(km)} />} /> : null}
                        {d.overnight ? <Fact icon={<BedDouble className="size-4" aria-hidden />} label="Overnight" value={d.overnight} /> : null}
                      </dl>
                    ) : null}
                    {d.meals.length ? (
                      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Meals included">
                        {(["breakfast", "lunch", "dinner"] as const).map((m) => {
                          const on = d.meals.includes(m);
                          const Icon = m === "breakfast" ? Coffee : m === "lunch" ? Sandwich : UtensilsCrossed;
                          return (
                            <li key={m} className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize", on ? "border-pine/30 bg-glacier-soft text-pine" : "border-line text-muted/60 line-through")}>
                              <Icon className="size-3.5" aria-hidden /> {m}
                            </li>
                          );
                        })}
                      </ul>
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

function Fact({ icon, label, value, tip }: { icon: React.ReactNode; label: string; value: string; tip?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-snow-2 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[0.66rem] font-bold tracking-[0.1em] text-muted uppercase">
        <span className="text-pine">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 flex items-center gap-1 text-[0.85rem] font-semibold leading-snug">
        {value}
        {tip}
      </dd>
    </div>
  );
}

/** Walking distance stated in a day's text ("about 12 km"); flights are left out. */
function kmIn(text: string) {
  const m = text.match(/(\d+(?:\.\d+)?)\s?(?:km|kilomet(?:er|re)s?)/i);
  const v = m ? Number(m[1]) : 0;
  return v > 0 && v < 80 ? v : null;
}
