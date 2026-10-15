"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TripCard } from "@/components/trip-card";
import { usePageWheelScroll } from "@/lib/use-page-wheel-scroll";
import type { TripCard as Card } from "@/lib/types";

/**
 * A row of trips that scrolls sideways: swipe on phones, arrows or
 * trackpad on desktop. On touch the browser does the scrolling natively
 * (snapping softly to each card); a bar underneath shows how far along you are.
 */
export function TripCarousel({ trips, regionNames, moreHref, moreLabel, ariaLabel = "Popular trips" }: { trips: Card[]; regionNames: Record<string, string>; moreHref: string; moreLabel: string; ariaLabel?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  usePageWheelScroll(ref, trips.length);
  const [state, setState] = useState({ start: true, end: false, progress: 0, view: 0.25 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = Math.max(1, el.scrollWidth - el.clientWidth);
        setState({
          start: el.scrollLeft < 8,
          end: el.scrollLeft > max - 8,
          progress: Math.min(1, el.scrollLeft / max),
          view: Math.min(1, el.clientWidth / el.scrollWidth),
        });
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide]");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.85;
    const per = Math.max(1, Math.floor(el.clientWidth / step));
    el.scrollBy({ left: dir * step * per, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain overscroll-y-auto px-4 pt-2 pb-6 [-webkit-overflow-scrolling:touch] [scroll-padding-inline:1rem] sm:-mx-6 sm:gap-8 sm:px-6 sm:[scroll-padding-inline:1.5rem] lg:gap-10"
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        {trips.map((t) => (
          <div key={t.slug} data-slide className="w-[78vw] max-w-[20rem] shrink-0 snap-start sm:w-[17.5rem]">
            <TripCard trip={t} regionName={regionNames[t.destinations[0]]} />
          </div>
        ))}
        <Link href={moreHref} className="bg-pine relative flex w-[60vw] max-w-[16rem] shrink-0 snap-start flex-col items-start justify-end overflow-hidden rounded-[1.1rem] p-6 text-white sm:w-[15rem]">
          <span className="font-display text-3xl leading-[1.05]">{moreLabel}</span>
          <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#006c7c]">
            Browse <ArrowRight className="size-4" aria-hidden />
          </span>
        </Link>
        <span aria-hidden className="w-px shrink-0" />
      </div>

      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <span
            className="bg-pine absolute inset-y-0 rounded-full transition-[left] duration-150"
            style={{ width: `${state.view * 100}%`, left: `${state.progress * (1 - state.view) * 100}%` }}
          />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => page(-1)} disabled={state.start} aria-label="Previous trips" className="grid size-11 place-items-center rounded-full border border-line bg-card transition-[opacity,border-color] hover:border-pine disabled:opacity-35">
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={() => page(1)} disabled={state.end} aria-label="More trips" className="grid size-11 place-items-center rounded-full border border-line bg-card transition-[opacity,border-color] hover:border-pine disabled:opacity-35">
            <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
