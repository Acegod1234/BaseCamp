"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ProfileDay = { day: number; title: string; altitude: number | null };

/** Pulls the overnight stop out of a WordPress itinerary title. */
export function placeOf(title: string): string {
  const named = [...title.matchAll(/([A-Z][\w'’.-]+(?:\s(?:[A-Z][\w'’.-]+|La|Ri|Kund))*)\s*\(\s*[\d,]{3,6}\s*m/g)];
  if (named.length) return named[named.length - 1][1].replace(/^(Trek|Fly|Drive|Hike|Walk|Return|Explore|Day)\s+/i, "");
  const to = title.match(/\bto\s+([A-Z][\w'’.-]+(?:\s[A-Z][\w'’.-]+)?)/g);
  if (to) return to[to.length - 1].replace(/^to\s+/, "");
  if (/kathmandu/i.test(title)) return "Kathmandu";
  return "";
}

/** Fills days without a recorded altitude from their neighbours. */
function fill(days: ProfileDay[]) {
  const vals = days.map((d) => d.altitude);
  return vals.map((v, i) => {
    if (v) return v;
    let a = i - 1;
    while (a >= 0 && !vals[a]) a--;
    let b = i + 1;
    while (b < vals.length && !vals[b]) b++;
    const left = a >= 0 ? (vals[a] as number) : null;
    const right = b < vals.length ? (vals[b] as number) : null;
    if (left && right) return Math.round(left + ((right - left) * (i - a)) / (b - a));
    return left ?? right ?? 1400;
  });
}

const W = 1000;
const H = 360;
const PAD = { l: 58, r: 24, t: 40, b: 46 };

export function AltitudeProfile({
  days,
  tone = "dark",
  className,
}: {
  days: ProfileDay[];
  tone?: "dark" | "light";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [hover, setHover] = useState<number | null>(null);
  const [unit, setUnit] = useState<"m" | "ft">("m");

  const { points, path, area, ticks, peak, labels } = useMemo(() => {
    const alts = fill(days);
    const max = Math.max(...alts);
    const min = Math.min(...alts);
    const top = Math.ceil((max + 250) / 500) * 500;
    const bottom = Math.max(0, Math.floor((min - 400) / 500) * 500);
    const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(1, alts.length - 1);
    const y = (a: number) => PAD.t + ((top - a) * (H - PAD.t - PAD.b)) / (top - bottom);
    const pts = alts.map((a, i) => ({ x: x(i), y: y(a), a, d: days[i] }));

    // Monotone cubic smoothing, so the line never overshoots a real altitude.
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const cx = (p0.x + p1.x) / 2;
      d += ` C${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    const step = top - bottom > 3000 ? 1000 : 500;
    const t: { y: number; v: number }[] = [];
    for (let v = bottom; v <= top; v += step) t.push({ y: y(v), v });

    const peakIndex = alts.indexOf(max);
    // Label the ends, the high point and each local summit, without crowding.
    const lab = new Set<number>([0, peakIndex, alts.length - 1]);
    alts.forEach((a, i) => {
      if (i > 0 && i < alts.length - 1 && a > alts[i - 1] && a >= alts[i + 1] && a > (max + min) / 2) lab.add(i);
    });
    const spaced = [...lab].sort((a, b) => a - b).filter((v, idx, arr) => idx === 0 || pts[v].x - pts[arr[idx - 1]].x > 70 || v === peakIndex);

    return {
      points: pts,
      path: d,
      area: `${d} L${pts[pts.length - 1].x},${H - PAD.b} L${pts[0].x},${H - PAD.b} Z`,
      ticks: t,
      peak: pts[peakIndex],
      labels: spaced,
    };
  }, [days]);

  const fmt = (m: number) => (unit === "m" ? `${m.toLocaleString("en-US")} m` : `${Math.round(m * 3.28084).toLocaleString("en-US")} ft`);
  const dark = tone === "dark";
  const active = hover != null ? points[hover] : null;
  const draw = inView || reduce;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="mb-3 flex items-center justify-end gap-1" role="group" aria-label="Altitude units">
        {(["m", "ft"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            aria-pressed={unit === u}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-xs transition-colors",
              unit === u ? (dark ? "bg-marigold text-pine-night" : "bg-pine text-white") : dark ? "text-white/60 hover:text-white" : "text-muted hover:text-ink",
            )}
          >
            {u === "m" ? "Metres" : "Feet"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[640px]" role="img" aria-label={`Altitude profile, highest point ${fmt(peak.a)} on day ${peak.d.day}`}>
          <defs>
            <linearGradient id={`alt-fill-${tone}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--glacier)" stopOpacity={dark ? 0.42 : 0.3} />
              <stop offset="100%" stopColor="var(--glacier)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t.v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} stroke={dark ? "white" : "var(--ink)"} strokeOpacity={0.08} strokeDasharray="3 6" />
              <text x={PAD.l - 10} y={t.y + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill={dark ? "white" : "var(--ink)"} fillOpacity={0.5}>
                {unit === "m" ? `${(t.v / 1000).toFixed(1)}k` : `${Math.round((t.v * 3.28084) / 1000)}k`}
              </text>
            </g>
          ))}

          <motion.path
            d={area}
            fill={`url(#alt-fill-${tone})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: draw ? 1 : 0 }}
            transition={{ duration: 1.2, delay: 0.9 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke="var(--glacier)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: draw ? 1 : 0 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          />

          {points.map((p, i) => (
            <g key={i}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={i === hover ? 7 : labels.includes(i) ? 5 : 3}
                fill={p === peak ? "var(--marigold)" : dark ? "var(--pine-night)" : "white"}
                stroke={p === peak ? "var(--marigold)" : "var(--glacier)"}
                strokeWidth="2.5"
                initial={{ scale: reduce ? 1 : 0 }}
                animate={{ scale: draw ? 1 : 0 }}
                transition={{ delay: 0.4 + (i / points.length) * 1.8, type: "spring", stiffness: 300, damping: 18 }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              />
              {/* Wide invisible target for hover and touch */}
              <rect
                x={p.x - (W - PAD.l - PAD.r) / points.length / 2}
                y={PAD.t - 20}
                width={(W - PAD.l - PAD.r) / points.length}
                height={H - PAD.t - PAD.b + 20}
                fill="transparent"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`Day ${p.d.day}: ${placeOf(p.d.title) || p.d.title}, ${fmt(p.a)}`}
              />
            </g>
          ))}

          {labels.map((i) => {
            const p = points[i];
            const name = placeOf(p.d.title);
            if (!name || i === hover) return null;
            return (
              <motion.g key={`l${i}`} initial={{ opacity: 0 }} animate={{ opacity: draw ? 1 : 0 }} transition={{ delay: 1.6 }}>
                <text x={p.x} y={p.y - 16} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={dark ? "white" : "var(--ink)"}>
                  {name.length > 18 ? `${name.slice(0, 17)}…` : name}
                </text>
                <text x={p.x} y={p.y - 30} textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill={p === peak ? "var(--marigold)" : dark ? "white" : "var(--muted)"} fillOpacity={p === peak ? 1 : 0.65}>
                  {fmt(p.a)}
                </text>
              </motion.g>
            );
          })}

          {points.map((p, i) => (
            <text key={`d${i}`} x={p.x} y={H - PAD.b + 22} textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill={dark ? "white" : "var(--ink)"} fillOpacity={i === hover ? 1 : 0.45}>
              {points.length > 20 && i % 2 ? "" : `D${p.d.day}`}
            </text>
          ))}

          {active ? (
            <g pointerEvents="none">
              <line x1={active.x} x2={active.x} y1={active.y} y2={H - PAD.b} stroke="var(--marigold)" strokeDasharray="4 4" />
              <foreignObject x={Math.min(Math.max(active.x - 120, 0), W - 240)} y={Math.max(active.y - 86, 0)} width="240" height="70">
                <div className="rounded-xl bg-white px-3 py-2 text-[12px] text-ink shadow-xl">
                  <p className="font-mono text-[10.5px] text-muted">DAY {active.d.day} · {fmt(active.a)}</p>
                  <p className="line-clamp-2 font-semibold leading-snug">{placeOf(active.d.title) || active.d.title}</p>
                </div>
              </foreignObject>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
