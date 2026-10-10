"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { CalendarRange, MapPin, Search, Wallet } from "lucide-react";
import { CountUp, EASE, Magnetic } from "@/components/motion";

export type HeroSlide = { src: string; place: string; altitude: number; coords: string; credit: string };

/** Deterministic ridge line, so server and client draw the same mountains. */
function ridge(seed: number, base: number, rough: number, points = 48) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const step = 1600 / (points - 1);
  let y = base;
  const pts: string[] = [];
  for (let i = 0; i < points; i++) {
    y = Math.max(base - rough * 1.6, Math.min(base + rough * 0.6, y + (rnd() - 0.52) * rough));
    pts.push(`${(i * step).toFixed(0)} ${y.toFixed(0)}`);
  }
  return `M0 400 L${pts.join(" L")} L1600 400 Z`;
}

export function HomeHero({
  slides,
  regions,
  stats,
}: {
  slides: HeroSlide[];
  regions: { slug: string; name: string }[];
  stats: { trips: number; regions: number; years: number };
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [region, setRegion] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length, reduce]);

  // Pointer depth: the ridges move against each other, the photo barely.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const back = useTransform(sx, (v) => v * -12);
  const mid = useTransform(sx, (v) => v * -26);
  const front = useTransform(sx, (v) => v * -44);
  const tiltY = useTransform(sy, (v) => v * -10);

  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 900], [0, 160]);
  const textY = useTransform(scrollY, [0, 700], [0, -90]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const ridgeY = useTransform(scrollY, [0, 900], [0, -60]);

  const paths = useMemo(
    () => ({ back: ridge(11, 160, 70), mid: ridge(29, 215, 58), front: ridge(53, 268, 38) }),
    [],
  );

  const slide = slides[i];

  return (
    <section
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-pine-night text-white"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      {/* Photographs */}
      <motion.div className="absolute inset-0 -z-20" style={reduce ? undefined : { y: photoY }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          >
            <Image src={slide.src} alt={slide.place} fill preload={i === 0} quality={80} sizes="100vw" className="kenburns object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="scrim-hero absolute inset-0" />
      </motion.div>

      {/* Ridge silhouettes in three depths */}
      <motion.svg
        viewBox="0 0 1600 400"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute inset-x-[-4%] bottom-0 -z-10 h-[22vh] w-[108%] md:h-[38vh]"
        style={reduce ? undefined : { y: ridgeY }}
      >
        <motion.path d={paths.back} fill="oklch(0.22 0.04 170 / 0.35)" style={{ x: back, y: tiltY }} />
        <motion.path d={paths.mid} fill="oklch(0.2 0.04 170 / 0.6)" style={{ x: mid }} />
        <motion.path d={paths.front} fill="var(--snow)" style={{ x: front }} />
      </motion.svg>

      <motion.div
        className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-center px-4 pt-32 pb-16 sm:px-6 md:pb-40 lg:pt-36"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-white/80"
        >
          <span className="bg-marigold inline-block h-px w-10" aria-hidden />
          Est. 2009 · Thamel, Kathmandu<span className="hidden sm:inline"> · 27.7154° N 85.3123° E</span>
        </motion.p>

        <h1 className="font-display mt-6 font-black uppercase">
          <span className="block overflow-hidden">
            <motion.span
              className="block text-[clamp(4.2rem,15vw,13.5rem)] leading-[0.82] tracking-[-0.01em]"
              initial={reduce ? false : { y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
            >
              Base Camp
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="accent-word text-marigold -mt-1 block text-[clamp(3.2rem,10vw,9rem)] leading-[0.95]"
              initial={reduce ? false : { y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.34, ease: EASE }}
            >
              Adventure
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl"
        >
          Trekking &amp; tours with the people who call Nepal home. Small groups, licensed local guides, and an office in Thamel that answers at any hour.
        </motion.p>

        {/* Trip finder */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.78, ease: EASE }}
          onSubmit={(e) => {
            e.preventDefault();
            const q = new URLSearchParams();
            if (region) q.set("region", region);
            if (days) q.set("days", days);
            if (budget) q.set("budget", budget);
            router.push(`/trip/${q.size ? `?${q}` : ""}`);
          }}
          className="glass-dark mt-10 grid w-full max-w-4xl gap-1 rounded-[1.6rem] border border-white/15 p-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
          aria-label="Find a trip"
        >
          <Field icon={<MapPin className="text-marigold size-4" aria-hidden />} label="Destination" htmlFor="hf-region">
            <select id="hf-region" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-transparent font-semibold outline-none [&>option]:text-ink">
              <option value="">Anywhere</option>
              {regions.map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </Field>
          <Field icon={<CalendarRange className="text-marigold size-4" aria-hidden />} label="Time on the trail" htmlFor="hf-days">
            <select id="hf-days" value={days} onChange={(e) => setDays(e.target.value)} className="w-full bg-transparent font-semibold outline-none [&>option]:text-ink">
              <option value="">Any duration</option>
              <option value="short">Up to 7 days</option>
              <option value="mid">8–14 days</option>
              <option value="long">15 days or more</option>
            </select>
          </Field>
          <Field icon={<Wallet className="text-marigold size-4" aria-hidden />} label="Budget per person" htmlFor="hf-budget">
            <select id="hf-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full bg-transparent font-semibold outline-none [&>option]:text-ink">
              <option value="">Any budget</option>
              <option value="1000">Under US$1,000</option>
              <option value="1500">Under US$1,500</option>
              <option value="2000">Under US$2,000</option>
            </select>
          </Field>
          <Magnetic className="w-full sm:w-auto">
            <button type="submit" className="bg-marigold text-pine-night flex h-full min-h-14 w-full items-center justify-center gap-2 rounded-[1.2rem] px-7 font-bold transition-colors hover:bg-white">
              <Search className="size-5" aria-hidden /> Find my trip
            </button>
          </Magnetic>
        </motion.form>
      </motion.div>

      {/* Bottom rail: stats, slide caption, progress */}
      <div className="text-ink bg-snow relative mx-auto flex w-full max-w-[90rem] flex-col gap-6 px-4 pt-6 pb-8 sm:px-6 md:-mt-28 md:flex-row md:items-end md:justify-between md:bg-transparent md:pt-0">
        <dl className="grid grid-cols-4 gap-6 sm:gap-10">
          {[
            { n: stats.trips, s: "", l: "Trips" },
            { n: stats.regions, s: "", l: "Regions" },
            { n: stats.years, s: "", l: "Years" },
            { n: 24, s: "/7", l: "Support" },
          ].map((x) => (
            <div key={x.l}>
              <dt className="sr-only">{x.l}</dt>
              <dd>
                <CountUp to={x.n} suffix={x.s} className="font-display block text-4xl font-black sm:text-5xl" />
                <span className="eyebrow text-muted">{x.l}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex items-end gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.place}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="text-right"
            >
              <p className="font-display text-2xl font-extrabold uppercase">{slide.place}</p>
              <p className="font-mono text-xs text-muted">
                {slide.altitude.toLocaleString("en-US")} m · {slide.coords}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-1.5" role="tablist" aria-label="Photographs">
            {slides.map((s, n) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={n === i}
                aria-label={s.place}
                onClick={() => setI(n)}
                className="relative h-10 w-1.5 overflow-hidden rounded-full bg-ink/15"
              >
                {n === i ? (
                  <motion.span
                    className="bg-pine absolute inset-x-0 top-0 block"
                    initial={{ height: "0%" }}
                    animate={{ height: "100%" }}
                    transition={{ duration: reduce ? 0 : 7, ease: "linear" }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

function Field({ icon, label, htmlFor, children }: { icon: React.ReactNode; label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex cursor-pointer flex-col gap-1 rounded-[1.2rem] px-4 py-3 transition-colors hover:bg-white/10">
      <span className="flex items-center gap-2 text-[0.7rem] font-semibold tracking-wider text-white/65 uppercase">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
