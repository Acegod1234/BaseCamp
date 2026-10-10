"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const KEY = "bca-units";

function apply(unit: "m" | "ft") {
  document.querySelectorAll<HTMLElement>(".measurement[data-meters]").forEach((el) => {
    const m = Number(el.dataset.meters);
    el.textContent = unit === "m" ? `${m.toLocaleString("en-US")} m` : `${Math.round(m * 3.28084).toLocaleString("en-US")} ft`;
  });
}

/**
 * Metres / feet switch for every altitude written in the page's text.
 * The importer wrapped each altitude in a span with its value in metres.
 */
export function UnitToggle({ className }: { className?: string }) {
  const [unit, setUnit] = useState<"m" | "ft">("m");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    if (saved === "ft") {
      const id = requestAnimationFrame(() => {
        setUnit("ft");
        apply("ft");
      });
      return () => cancelAnimationFrame(id);
    }
  }, []);

  const choose = (u: "m" | "ft") => {
    setUnit(u);
    apply(u);
    try {
      localStorage.setItem(KEY, u);
    } catch {}
  };

  return (
    <div className={cn("inline-flex rounded-full border border-line bg-white p-1", className)} role="group" aria-label="Altitude units">
      {(["m", "ft"] as const).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => choose(u)}
          aria-pressed={unit === u}
          className={cn("rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors", unit === u ? "bg-pine text-white" : "text-muted hover:text-ink")}
        >
          {u === "m" ? "Metres" : "Feet"}
        </button>
      ))}
    </div>
  );
}
