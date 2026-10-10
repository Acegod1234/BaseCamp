"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Compass, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { TripCard } from "@/components/trip-card";
import type { TripCard as Card } from "@/lib/types";
import { cn } from "@/lib/utils";

type Opt = { slug: string; name: string; count: number };

const DURATIONS = [
  { v: "", l: "Any duration" },
  { v: "short", l: "Up to 7 days", test: (d: number) => d <= 7 },
  { v: "mid", l: "8–14 days", test: (d: number) => d >= 8 && d <= 14 },
  { v: "long", l: "15+ days", test: (d: number) => d >= 15 },
];
const BUDGETS = [
  { v: "", l: "Any budget" },
  { v: "1000", l: "Under $1,000" },
  { v: "1500", l: "Under $1,500" },
  { v: "2000", l: "Under $2,000" },
];
const SORTS = [
  { v: "popular", l: "Most popular" },
  { v: "price-asc", l: "Price: low to high" },
  { v: "price-desc", l: "Price: high to low" },
  { v: "days-asc", l: "Shortest first" },
  { v: "days-desc", l: "Longest first" },
  { v: "altitude", l: "Highest first" },
];

export function TripExplorer({
  trips,
  regions,
  activities,
  regionNames,
  lockRegion,
  lockActivity,
}: {
  trips: Card[];
  regions: Opt[];
  activities: Opt[];
  regionNames: Record<string, string>;
  /** On a destination or activity page that filter is fixed. */
  lockRegion?: string;
  lockActivity?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [sheet, setSheet] = useState(false);

  const state = {
    q: params.get("q") ?? "",
    region: lockRegion ?? params.get("region") ?? "",
    activity: lockActivity ?? params.get("activity") ?? "",
    days: params.get("days") ?? "",
    budget: params.get("budget") ?? "",
    sort: params.get("sort") ?? "popular",
  };
  const [q, setQ] = useState(state.q);

  const set = (patch: Partial<typeof state>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (lockRegion) next.delete("region");
    if (lockActivity) next.delete("activity");
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  const results = useMemo(() => {
    const needle = state.q.trim().toLowerCase();
    const dur = DURATIONS.find((d) => d.v === state.days);
    const budget = Number(state.budget) || 0;
    const list = trips.filter(
      (t) =>
        (!needle || t.title.toLowerCase().includes(needle) || t.summary.toLowerCase().includes(needle)) &&
        (!state.region || t.destinations.includes(state.region)) &&
        (!state.activity || t.activities.includes(state.activity)) &&
        (!dur?.test || dur.test(t.days)) &&
        (!budget || (t.price && t.price.amount < budget)),
    );
    const price = (t: Card) => t.price?.amount ?? Number.POSITIVE_INFINITY;
    const sorters: Record<string, (a: Card, b: Card) => number> = {
      popular: (a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0) || (b.price ? 1 : 0) - (a.price ? 1 : 0),
      "price-asc": (a, b) => price(a) - price(b),
      "price-desc": (a, b) => (b.price?.amount ?? -1) - (a.price?.amount ?? -1),
      "days-asc": (a, b) => a.days - b.days,
      "days-desc": (a, b) => b.days - a.days,
      altitude: (a, b) => (b.maxAltitude ?? 0) - (a.maxAltitude ?? 0),
    };
    return [...list].sort(sorters[state.sort] ?? sorters.popular);
  }, [trips, state.q, state.region, state.activity, state.days, state.budget, state.sort]);

  const active = [
    !lockRegion && state.region && { k: "region", l: regionNames[state.region] ?? state.region },
    !lockActivity && state.activity && { k: "activity", l: activities.find((a) => a.slug === state.activity)?.name ?? state.activity },
    state.days && { k: "days", l: DURATIONS.find((d) => d.v === state.days)?.l },
    state.budget && { k: "budget", l: BUDGETS.find((b) => b.v === state.budget)?.l },
    state.q && { k: "q", l: `“${state.q}”` },
  ].filter(Boolean) as { k: keyof typeof state; l: string }[];

  const controls = (
    <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
      {!lockActivity ? (
        <Select id="f-activity" label="Activity" value={state.activity} onChange={(v) => set({ activity: v })} options={[{ v: "", l: "All activities" }, ...activities.map((a) => ({ v: a.slug, l: `${a.name} (${a.count})` }))]} />
      ) : null}
      <Select id="f-days" label="Duration" value={state.days} onChange={(v) => set({ days: v })} options={DURATIONS} />
      <Select id="f-budget" label="Budget" value={state.budget} onChange={(v) => set({ budget: v })} options={BUDGETS} />
      <Select id="f-sort" label="Sort" value={state.sort} onChange={(v) => set({ sort: v === "popular" ? "" : v })} options={SORTS} />
    </div>
  );

  return (
    <div>
      <div className="sticky top-[4.5rem] z-30 -mx-4 border-b border-line bg-snow/90 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              set({ q });
            }}
            className="relative flex-1 lg:max-w-sm"
          >
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <label htmlFor="f-q" className="sr-only">Search trips</label>
            <input
              id="f-q"
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (!e.target.value) set({ q: "" });
              }}
              onBlur={() => q !== state.q && set({ q })}
              placeholder="Search Everest, Poon Hill, Island Peak…"
              className="h-12 w-full rounded-full border border-line bg-white pr-4 pl-11 text-sm outline-none transition focus:border-pine focus:ring-4 focus:ring-pine/10"
            />
          </form>
          <div className="hidden lg:block">{controls}</div>
          <button type="button" onClick={() => setSheet(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold lg:hidden">
            <SlidersHorizontal className="size-4" aria-hidden /> Filters &amp; sort {active.length ? <span className="bg-pine grid size-5 place-items-center rounded-full text-[0.7rem] text-white">{active.length}</span> : null}
          </button>
        </div>

        {!lockRegion ? (
          <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6" role="group" aria-label="Region">
            <Chip on={!state.region} onClick={() => set({ region: "" })}>All regions</Chip>
            {regions.map((r) => (
              <Chip key={r.slug} on={state.region === r.slug} onClick={() => set({ region: state.region === r.slug ? "" : r.slug })}>
                {r.name} <span className="font-mono text-[0.7rem] opacity-60">{r.count}</span>
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          Showing <strong className="text-ink">{results.length}</strong> of {trips.length} trips
        </p>
        {active.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {active.map((a) => (
              <button key={a.k} type="button" onClick={() => { if (a.k === "q") setQ(""); set({ [a.k]: "" }); }} className="inline-flex items-center gap-1.5 rounded-full bg-pine/10 px-3 py-1.5 text-sm font-medium text-pine">
                {a.l} <X className="size-3.5" aria-hidden />
              </button>
            ))}
            <button type="button" onClick={() => { setQ(""); router.replace(pathname, { scroll: false }); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
              <RotateCcw className="size-3.5" aria-hidden /> Clear all
            </button>
          </div>
        ) : null}
      </div>

      {results.length ? (
        <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((t, i) => (
              <motion.div
                key={t.slug}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.03, ease: [0.22, 1, 0.36, 1] }}
              >
                <TripCard trip={t} regionName={regionNames[t.destinations[0]]} priority={i < 3} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-[2rem] border border-dashed border-line px-6 py-16 text-center">
          <Compass className="text-pine size-10" aria-hidden />
          <h2 className="font-display mt-4 text-4xl font-black uppercase">A different route?</h2>
          <p className="mt-2 max-w-md text-ink-soft">Try a wider budget or duration, or let us put together a trip for you.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => { setQ(""); router.replace(pathname, { scroll: false }); }} className="rounded-full border border-line bg-white px-6 py-3 font-semibold">Show all trips</button>
            <Link href="/customize-trip/" className="bg-pine inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white">
              Plan a custom trip <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheet ? (
          <motion.div className="fixed inset-0 z-[80] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close filters" className="absolute inset-0 bg-pine-night/50" onClick={() => setSheet(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="bg-snow pb-safe absolute inset-x-0 bottom-0 rounded-t-[2rem] p-6"
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line" />
              <p className="font-display mb-5 text-3xl font-black uppercase">Filters</p>
              {controls}
              <button type="button" onClick={() => setSheet(false)} className="bg-pine mt-6 w-full rounded-full py-4 font-bold text-white">
                Show {results.length} trips
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        on ? "bg-pine text-white" : "border border-line bg-white text-ink-soft hover:border-pine hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Select({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <label htmlFor={id} className="relative flex h-12 items-center gap-2 rounded-full border border-line bg-white pl-4 pr-3 text-sm focus-within:border-pine">
      <span className="text-muted">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 cursor-pointer bg-transparent font-semibold outline-none">
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </label>
  );
}
