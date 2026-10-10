"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TripCard } from "@/components/trip-card";
import type { TripCard as Card } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A row of trips that scrolls sideways: swipe on phones, arrows or
 * trackpad on desktop. Cards snap into place so none is ever cut in half
 * at rest.
 */
export function TripCarousel({ trips, regionNames, moreHref, moreLabel }: { trips: Card[]; regionNames: Record<string, string>; moreHref: string; moreLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-6 flex justify-end gap-2">
        <button type="button" onClick={() => page(-1)} disabled={edge.start} aria-label="Previous trips" className="grid size-11 place-items-center rounded-full border border-line bg-card transition-opacity hover:border-pine disabled:opacity-35">
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <button type="button" onClick={() => page(1)} disabled={edge.end} aria-label="More trips" className="grid size-11 place-items-center rounded-full border border-line bg-card transition-opacity hover:border-pine disabled:opacity-35">
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
      <div
        ref={ref}
        data-lenis-prevent-wheel
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pt-2 pb-8 sm:-mx-6 sm:scroll-px-6 sm:px-6"
      >
        {trips.map((t) => (
          <div key={t.slug} className="w-[74vw] shrink-0 snap-start sm:w-[17.5rem]">
            <TripCard trip={t} regionName={regionNames[t.destinations[0]]} />
          </div>
        ))}
        <Link
          href={moreHref}
          className={cn("bg-pine relative flex w-[60vw] shrink-0 snap-start flex-col items-start justify-end overflow-hidden rounded-[1.1rem] p-6 text-white sm:w-[15rem]")}
        >
          <span className="font-display text-3xl leading-[1.05]">{moreLabel}</span>
          <span className="bg-marigold text-pine-night mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
            Browse <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
      </div>
    </div>
  );
}
