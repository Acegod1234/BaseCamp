"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TripCard } from "@/components/trip-card";
import type { TripCard as Card } from "@/lib/types";
import { cn } from "@/lib/utils";

export type TripGroup = { key: string; label: string; trips: Card[]; href: string };

/** "Where do you want to go?" — tabs re-shuffle the cards in place. */
export function FeaturedTrips({ groups, regionNames }: { groups: TripGroup[]; regionNames: Record<string, string> }) {
  const [key, setKey] = useState(groups[0].key);
  const group = groups.find((g) => g.key === key) ?? groups[0];

  return (
    <LayoutGroup>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filter trips by region">
          {groups.map((g) => (
            <button
              key={g.key}
              type="button"
              role="tab"
              aria-selected={g.key === key}
              onClick={() => setKey(g.key)}
              className={cn(
                "relative shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                g.key === key ? "text-white" : "text-ink-soft hover:text-ink border border-line bg-card",
              )}
            >
              {g.key === key ? (
                <motion.span layoutId="trip-tab" className="bg-pine absolute inset-0 rounded-full" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              ) : null}
              <span className="relative">
                {g.label} <span className="ml-1 font-mono text-xs opacity-60">{g.trips.length}</span>
              </span>
            </button>
          ))}
        </div>
        <Link href={group.href} className="text-pine hidden items-center gap-2 font-bold sm:inline-flex">
          See all {group.label === "Featured" ? "trips" : `${group.label} trips`} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {group.trips.slice(0, 6).map((t, i) => (
            <motion.div
              key={`${group.key}-${t.slug}`}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.55, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <TripCard trip={t} regionName={regionNames[t.destinations[0]]} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <Link href={group.href} className="bg-ink hover:bg-pine inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold text-white transition-colors">
          Explore the full collection <ArrowRight className="size-4" aria-hidden />
        </Link>
        <p className="text-sm text-muted">Prices in US dollars, per person. Final costs depend on your group and travel dates.</p>
      </div>
    </LayoutGroup>
  );
}
