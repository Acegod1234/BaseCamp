"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PlacePhoto } from "@/lib/place-photos";

/** Image-only, gently crossfading place previews; wait for decoding before switching. */
export function PlaceSlideshow({ photo, interactive = false, onAspectChange }: { photo: PlacePhoto; interactive?: boolean; onAspectChange?: (ratio: number) => void }) {
  const reduce = useReducedMotion();
  const slides = useMemo(() => [photo, ...(photo.images ?? [])], [photo]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState<number[]>([]);
  useEffect(() => {
    let cancelled = false;
    void Promise.all(slides.map(async (slide, index) => {
      try {
        const image = new window.Image();
        image.src = slide.src;
        await image.decode();
        return index;
      } catch { return null; }
    })).then((loaded) => {
      if (!cancelled) setReady(loaded.filter((index): index is number => index !== null));
    });
    return () => { cancelled = true; };
  }, [slides]);
  useEffect(() => {
    if (reduce || interactive || ready.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => ready[(ready.indexOf(current) + 1) % ready.length]);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [ready, reduce, interactive]);

  const current = slides[active];
  const ratio = current.width && current.height ? current.width / current.height : 8 / 3;
  useLayoutEffect(() => { onAspectChange?.(ratio); }, [ratio, onAspectChange]);

  const advance = (step: number) => {
    if (ready.length < 2) return;
    setActive((current) => ready[(Math.max(0, ready.indexOf(current)) + step + ready.length) % ready.length]);
  };
  return <div data-place-slideshow tabIndex={interactive ? 0 : undefined} className="outline-none relative h-full w-full overflow-hidden bg-black" aria-label={`Photos of ${photo.name}`} onKeyDown={(event) => {
    if (!interactive || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    advance(event.key === "ArrowRight" ? 1 : -1);
  }}>
    {slides.map((slide, index) => <div key={slide.src} aria-hidden={active !== index} style={{ opacity: active === index ? 1 : 0 }} className="absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none">
      <Image src={slide.src} alt={slide.alt} fill unoptimized loading="eager" fetchPriority={index === 0 ? "high" : "low"} sizes="(max-width: 824px) calc(100vw - 24px), 800px" className="object-contain object-center" />
    </div>)}
    {interactive && slides.length > 1 && <>
      <button type="button" onClick={() => advance(-1)} disabled={ready.length < 2} aria-label="Previous photo" className="absolute top-1/2 left-3 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-35"><ChevronLeft className="size-5" aria-hidden /></button>
      <button type="button" onClick={() => advance(1)} disabled={ready.length < 2} aria-label="Next photo" className="absolute top-1/2 right-3 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-35"><ChevronRight className="size-5" aria-hidden /></button>
    </>}
  </div>;
}
