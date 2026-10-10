"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { Portal } from "@/components/portal";
import type { Img } from "@/lib/types";

/** Opens a full-screen photo viewer. Arrow keys, swipe and Escape all work. */
export function GalleryButton({ images, title }: { images: Img[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const go = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  if (!images.length) return null;

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="hidden -space-x-3 sm:flex">
          {images.slice(0, 4).map((img, i) => (
            <button key={img.src} type="button" onClick={() => setIndex(i)} className="relative size-14 overflow-hidden rounded-xl border-2 border-white/80 transition-transform hover:z-10 hover:-translate-y-1">
              <Image src={img.src} alt={img.alt || `${title} photo ${i + 1}`} fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setIndex(0)} className="glass-dark inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white hover:bg-white/20">
          <Images className="size-4" aria-hidden /> View {images.length} photos
        </button>
      </div>

      <Portal>
      <AnimatePresence>
        {open && index !== null ? (
          <motion.div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label={`${title} photographs`}
            className="fixed inset-0 z-[200] flex flex-col bg-pine-night/95 text-white backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6">
              <p className="font-mono text-sm text-white/70">
                {index + 1} / {images.length}
              </p>
              <button type="button" onClick={() => setIndex(null)} aria-label="Close photos" className="grid size-12 place-items-center rounded-full bg-white/15 hover:bg-white/25">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="relative flex-1">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={images[index].src}
                  className="absolute inset-0 px-4 sm:px-20"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) go(1);
                    if (info.offset.x > 60) go(-1);
                  }}
                >
                  <Image src={images[index].src} alt={images[index].alt || title} fill sizes="100vw" quality={80} className="object-contain" />
                </motion.div>
              </AnimatePresence>
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:left-6">
                <ChevronLeft className="size-6" aria-hidden />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:right-6">
                <ChevronRight className="size-6" aria-hidden />
              </button>
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto p-4 sm:justify-center sm:p-6">
              {images.map((img, i) => (
                <button key={img.src} type="button" onClick={() => setIndex(i)} aria-label={`Photo ${i + 1}`} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${i === index ? "ring-marigold ring-2" : "opacity-50 hover:opacity-100"}`}>
                  <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </Portal>
    </>
  );
}
