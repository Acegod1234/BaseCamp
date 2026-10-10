"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Pause, Play, Plus } from "lucide-react";
import { EASE } from "@/components/motion";

export type HeroSlide = { src: string; label: string };

/** Optimised image URL for use inside CSS, where next/image cannot reach. */
const optimised = (src: string, w = 1920) => `/_next/image/?url=${encodeURIComponent(src)}&w=${w}&q=75`;

/**
 * The prototype's title: the company name set huge, with photographs of the
 * Himalaya showing through the letters. Slides cross-fade, the photograph
 * drifts slowly inside the type, and on a mouse it follows the pointer.
 */
export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length, reduce, paused]);

  // Preload the other photographs once the page is idle.
  useEffect(() => {
    const id = window.setTimeout(() => slides.slice(1).forEach((s) => (new Image().src = optimised(s.src))), 2500);
    return () => window.clearTimeout(id);
  }, [slides]);

  const slide = slides[i];
  const word = (
    <>
      <span className="block text-[clamp(4.1rem,17.5vw,16.5rem)] leading-[0.86]">Base Camp</span>
      <span className="block text-[clamp(3.5rem,14.6vw,13.8rem)] leading-[0.9]">Adventure</span>
    </>
  );

  return (
    <section className="relative overflow-hidden pt-[5.5rem] lg:pt-[6.25rem]">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 text-[0.65rem] font-bold tracking-[0.18em] text-muted uppercase">
          <span>Est. 2009</span>
          <span>Kathmandu, Nepal</span>
        </div>

        <h1 className="sr-only">Base Camp Adventure</h1>
        <div
          ref={wordRef}
          aria-hidden
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse" || reduce || !wordRef.current) return;
            const r = wordRef.current.getBoundingClientRect();
            wordRef.current.style.setProperty("--px", `${35 + ((e.clientX - r.left) / r.width) * 30}%`);
            wordRef.current.style.setProperty("--py", `${35 + ((e.clientY - r.top) / r.height) * 30}%`);
          }}
          className="font-display relative mx-auto mt-2 text-center tracking-[-0.06em] select-none sm:mt-4"
        >
          {/* Sizing copy, in the page colour, so the block keeps its height */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: EASE }}
            className="text-snow-2"
          >
            {word}
          </motion.div>
          <AnimatePresence initial={false}>
            <motion.div
              key={slide.src}
              className="photo-text hero-drift absolute inset-0"
              style={{ ["--photo" as string]: `url("${optimised(slide.src)}")` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            >
              {word}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="mx-auto mt-6 max-w-xl text-center text-base text-ink-soft sm:mt-8 sm:text-lg"
        >
          Trekking &amp; tours with the people who call Nepal home.
        </motion.p>

        <div className="mt-8 flex flex-col items-center gap-5 border-t border-line pt-6 sm:mt-10 md:flex-row md:justify-between">
          <Link href="/trip/" className="bg-pine hover:bg-pine-deep inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold text-white transition-colors">
            Explore our trips <ArrowRight className="size-4" aria-hidden />
          </Link>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.span key={slide.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-pine min-w-[11rem] text-right text-[0.7rem] font-bold tracking-[0.16em] uppercase">
                {String(i + 1).padStart(2, "0")} / {slide.label}
              </motion.span>
            </AnimatePresence>
            <div className="flex items-center gap-2" role="tablist" aria-label="Photographs">
              {slides.map((s, n) => (
                <button
                  key={s.src}
                  type="button"
                  role="tab"
                  aria-selected={n === i}
                  aria-label={s.label}
                  onClick={() => setI(n)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${n === i ? "bg-pine w-6" : "w-1.5 bg-line hover:bg-muted"}`}
                />
              ))}
            </div>
            <button type="button" onClick={() => setPaused((p) => !p)} className="inline-flex items-center gap-1 border-b border-line text-xs text-muted hover:text-ink" aria-pressed={paused}>
              {paused ? <Play className="size-3" aria-hidden /> : <Pause className="size-3" aria-hidden />} {paused ? "Play" : "Pause"}
            </button>
          </div>

          <p className="hidden text-right text-[0.65rem] leading-relaxed font-bold tracking-[0.18em] text-muted uppercase md:block">
            Real places.
            <br />
            Local people.
          </p>
        </div>
      </div>

      {/* Big mountains. Local knowledge. */}
      <div className="mt-10 border-y border-line bg-card/60">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="text-lg leading-snug">
            Big mountains.
            <br />
            <strong>Local knowledge.</strong>
          </p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-[0.95rem]">
            {["Small group adventures", "Experienced local guides", "Trips made around you"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <Plus className="text-pine size-4" aria-hidden /> {t}
              </li>
            ))}
          </ul>
          <Link href="/about-us/" className="self-start border-b-2 border-ink pb-1 text-sm font-bold lg:self-auto">
            Meet Base Camp
          </Link>
        </div>
      </div>
    </section>
  );
}
