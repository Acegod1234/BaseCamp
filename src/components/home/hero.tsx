"use client";

import Image from "next/image";
import Link from "next/link";
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
import { ArrowUpRight, CalendarRange, Compass, MapPin, Search, Wallet } from "lucide-react";
import { CountUp, EASE, Magnetic } from "@/components/motion";

export type HeroSlide = {
  src: string;
  alt: string;
  trip: { slug: string; title: string; days: number; maxAltitude: number | null } | null;
};

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
  activities,
  stats,
}: {
  slides: HeroSlide[];
  regions: { slug: string; name: string }[];
  activities: { slug: string; name: string }[];
  stats: { trips: number; regions: number; years: number };
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [region, setRegion] = useState("");
  const [activity, setActivity] = useState("");
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

  const paths = useMemo(() => ({ back: ridge(11, 160, 70), mid: ridge(29, 215, 58), front: ridge(53, 268, 38) }), []);
  const slide = slides[i];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (region) q.set("region", region);
    if (activity) q.set("activity", activity);
    if (days) q.set("days", days);
    if (budget) q.set("budget", budget);
    router.push(`/trip/${q.size ? `?${q}` : ""}`);
  };

  return (
    <section
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-pine-night text-white"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      <motion.div className="absolute inset-0 -z-20" style={reduce ? undefined : { y: photoY }}>
        <AnimatePresence initial={false}>
          <motion.div key={slide.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.6, ease: "easeInOut" }}>
            <Image src={slide.src} alt={slide.alt} fill preload={i === 0} quality={85} sizes="100vw" className="kenburns object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="scrim-hero absolute inset-0" />
        {/* Moonlight: a cool wash from above that only shows in dark mode. */}
        <div className="absolute inset-0 hidden bg-[radial-gradient(70rem_40rem_at_70%_-10%,oklch(0.76_0.12_214/0.28),transparent_60%)] dark:block" />
      </motion.div>

      <motion.svg
        viewBox="0 0 1600 400"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute inset-x-[-4%] bottom-0 -z-10 h-[18vh] w-[108%] md:h-[38vh]"
        style={reduce ? undefined : { y: ridgeY }}
      >
        <motion.path d={paths.back} fill="oklch(0.22 0.04 170 / 0.35)" style={{ x: back, y: tiltY }} />
        <motion.path d={paths.mid} fill="oklch(0.2 0.04 170 / 0.6)" style={{ x: mid }} />
        <motion.path d={paths.front} fill="var(--snow)" style={{ x: front }} />
      </motion.svg>

      <motion.div
        className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-center px-4 pt-28 pb-12 sm:px-6 md:pb-40 lg:pt-36"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: EASE }} className="eyebrow flex items-center gap-3 text-white/85">
          <span className="bg-marigold inline-block h-px w-10" aria-hidden />
          Find Your Trip
        </motion.p>

        <h1 className="font-display mt-5 font-black uppercase">
          <span className="block overflow-hidden">
            <motion.span className="block text-[clamp(3.6rem,15vw,13.5rem)] leading-[0.82]" initial={reduce ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: EASE }}>
              Base Camp
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span className="accent-word text-marigold -mt-1 block text-[clamp(2.8rem,10vw,9rem)] leading-[0.95]" initial={reduce ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.34, ease: EASE }}>
              Adventure
            </motion.span>
          </span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6, ease: EASE }} className="mt-5 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
          Start planning your journey to experience the Himalayas.
        </motion.p>

        {/* Trip finder, with the live site's search fields */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.78, ease: EASE }}
          onSubmit={submit}
          className="glass-dark mt-8 grid w-full max-w-5xl grid-cols-2 gap-1 rounded-[1.4rem] border border-white/15 p-1.5 sm:mt-10 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:p-2"
          aria-label="Find a trip"
        >
          <Field icon={<MapPin className="text-marigold size-4" aria-hidden />} label="Destination" htmlFor="hf-region">
            <select id="hf-region" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full truncate bg-transparent font-semibold outline-none [&>option]:text-ink">
              <option value="">Anywhere</option>
              {regions.map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </Field>
          <Field icon={<Compass className="text-marigold size-4" aria-hidden />} label="Activities" htmlFor="hf-activity">
            <select id="hf-activity" value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full truncate bg-transparent font-semibold outline-none [&>option]:text-ink">
              <option value="">Any activity</option>
              {activities.map((a) => (
                <option key={a.slug} value={a.slug}>{a.name}</option>
              ))}
            </select>
          </Field>
          <Field icon={<CalendarRange className="text-marigold size-4" aria-hidden />} label="Duration" htmlFor="hf-days">
            <select id="hf-days" value={days} onChange={(e) => setDays(e.target.value)} className="w-full truncate bg-transparent font-semibold outline-none [&>option]:text-ink">
              <option value="">Any duration</option>
              <option value="short">Up to 7 days</option>
              <option value="mid">8–14 days</option>
              <option value="long">15 days or more</option>
            </select>
          </Field>
          <Field icon={<Wallet className="text-marigold size-4" aria-hidden />} label="Budget" htmlFor="hf-budget">
            <select id="hf-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full truncate bg-transparent font-semibold outline-none [&>option]:text-ink">
              <option value="">Any budget</option>
              <option value="1000">Under US$1,000</option>
              <option value="1500">Under US$1,500</option>
              <option value="2000">Under US$2,000</option>
            </select>
          </Field>
          <Magnetic className="col-span-2 w-full md:col-span-1 md:w-auto">
            <button type="submit" className="bg-marigold text-pine-night flex h-full min-h-13 w-full items-center justify-center gap-2 rounded-[1.1rem] px-7 font-bold transition-colors hover:bg-white">
              <Search className="size-5" aria-hidden /> Search
            </button>
          </Magnetic>
        </motion.form>
      </motion.div>

      {/* Bottom rail: numbers, and the trip the current photograph comes from */}
      <div className="text-ink bg-snow relative mx-auto flex w-full max-w-[90rem] flex-col gap-5 px-4 pt-6 pb-7 sm:px-6 md:-mt-28 md:flex-row md:items-end md:justify-between md:bg-transparent md:pt-0 md:pb-8">
        <dl className="grid grid-cols-4 gap-3 sm:gap-10">
          {[
            { n: stats.trips, s: "", l: "Trips" },
            { n: stats.regions, s: "", l: "Regions" },
            { n: stats.years, s: "", l: "Years" },
            { n: 24, s: "/7", l: "Available" },
          ].map((x) => (
            <div key={x.l}>
              <dt className="sr-only">{x.l}</dt>
              <dd>
                <CountUp to={x.n} suffix={x.s} className="font-display block text-[2.1rem] font-black leading-none sm:text-5xl" />
                <span className="eyebrow text-[0.62rem] text-muted sm:text-[0.7rem]">{x.l}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex items-end justify-between gap-5 md:justify-end">
          <AnimatePresence mode="wait">
            <motion.div key={slide.src} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5 }} className="min-w-0 md:text-right">
              {slide.trip ? (
                <Link href={`/trip/${slide.trip.slug}/`} className="group inline-flex max-w-full flex-col md:items-end">
                  <span className="eyebrow text-muted">On this trip</span>
                  <span className="font-display flex items-center gap-1.5 truncate text-xl font-extrabold uppercase group-hover:text-pine sm:text-2xl">
                    {slide.trip.title} <ArrowUpRight className="size-5 shrink-0" aria-hidden />
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {slide.trip.days} days{slide.trip.maxAltitude ? ` · ${slide.trip.maxAltitude.toLocaleString("en-US")} m max` : ""}
                  </span>
                </Link>
              ) : (
                <span className="eyebrow text-muted">{slide.alt}</span>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex shrink-0 gap-1.5" role="tablist" aria-label="Photographs">
            {slides.map((s, n) => (
              <button key={s.src} type="button" role="tab" aria-selected={n === i} aria-label={`Photo ${n + 1}`} onClick={() => setI(n)} className="relative h-10 w-1.5 overflow-hidden rounded-full bg-ink/15">
                {n === i ? (
                  <motion.span className="bg-pine absolute inset-x-0 top-0 block" initial={{ height: "0%" }} animate={{ height: "100%" }} transition={{ duration: reduce ? 0 : 7, ease: "linear" }} />
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
    <label htmlFor={htmlFor} className="flex min-w-0 cursor-pointer flex-col gap-1 rounded-[1.1rem] px-3.5 py-2.5 transition-colors hover:bg-white/10 sm:px-4 sm:py-3">
      <span className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-wider text-white/70 uppercase">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
