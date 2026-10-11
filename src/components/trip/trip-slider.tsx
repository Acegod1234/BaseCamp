"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { LogoOverlay } from "@/components/brand/logo-overlay";
import { GalleryButton } from "@/components/trip/gallery";
import { openTripModal } from "@/components/trip/trip-modals";
import type { Img } from "@/lib/types";

/** The prototype's trip photograph slider: arrows, swipe, and the full set in a viewer. */
export function TripSlider({ images, title }: { images: Img[]; title: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return null;
  const go = (d: number) => setI((n) => (n + d + images.length) % images.length);
  const img = images[i];

  return (
    <div className="relative isolate overflow-hidden rounded-xl bg-snow-2">
      <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[21/9]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={img.src}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) go(1);
              if (info.offset.x > 50) go(-1);
            }}
          >
            <Image src={img.src} alt={img.alt || `${title} photograph ${i + 1}`} fill preload={i === 0} quality={80} sizes="(max-width: 1440px) 100vw, 1376px" className="object-cover lg:object-[50%_34%]" />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
        <LogoOverlay className="hidden lg:block" />
      </div>

      {images.length > 1 ? (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#242a2c] shadow-md transition hover:bg-white sm:left-5">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next photograph" className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#242a2c] shadow-md transition hover:bg-white sm:right-5">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      ) : null}

      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
        <GalleryButton images={images} title={title} />
        <span className="rounded-full bg-black/45 px-3 py-1.5 font-mono text-xs text-white backdrop-blur">
          {i + 1} / {images.length}
        </span>
      </div>
    </div>
  );
}

/** "Plan this trip": books when the trip has a price, otherwise opens the enquiry. */
export function PlanTripButton({ priced }: { priced: boolean }) {
  return (
    <button
      type="button"
      onClick={() => openTripModal(priced ? "book" : "enquire")}
      className="bg-pine hover:bg-pine-deep inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white transition-colors"
    >
      {priced ? "Book now" : "Plan this trip"} <ArrowRight className="size-4" aria-hidden />
    </button>
  );
}
