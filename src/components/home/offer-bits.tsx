"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";

const tick = (cb: () => void) => {
  const t = setInterval(cb, 30_000);
  return () => clearInterval(t);
};
const minute = () => Math.floor(Date.now() / 30_000) * 30_000;

/** Days, hours and minutes left on a festival offer. */
export function Countdown({ until }: { until: string }) {
  const end = new Date(`${until}T23:59:59+05:45`).getTime();
  const now = useSyncExternalStore(tick, minute, () => null);
  if (now === null || now > end) return null;
  const left = end - now;
  const parts = [
    { v: Math.floor(left / 86_400_000), l: "days" },
    { v: Math.floor(left / 3_600_000) % 24, l: "hours" },
    { v: Math.floor(left / 60_000) % 60, l: "mins" },
  ];
  return (
    <div className="flex gap-2" aria-label={`${parts[0].v} days ${parts[1].v} hours left`}>
      {parts.map((p) => (
        <span key={p.l} className="min-w-16 rounded-lg bg-white/12 px-3 py-2 text-center">
          <span className="font-display block text-2xl leading-none tabular-nums">{String(p.v).padStart(2, "0")}</span>
          <span className="text-[0.6rem] font-bold tracking-[0.14em] text-white/70 uppercase">{p.l}</span>
        </span>
      ))}
    </div>
  );
}

/** The offer code, copied with one tap. */
export function CopyCode({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(code).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        });
      }}
      className="inline-flex items-center gap-3 rounded-lg border border-dashed border-white/50 bg-white/10 px-4 py-3 font-mono text-sm font-bold tracking-[0.12em] transition-colors hover:bg-white/20"
    >
      {code}
      <span className="inline-flex items-center gap-1 font-sans text-xs font-semibold tracking-normal text-white/80">
        {done ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />} {done ? "Copied" : "Copy code"}
      </span>
    </button>
  );
}
