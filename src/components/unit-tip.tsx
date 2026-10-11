"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Portal } from "@/components/portal";
import { cn } from "@/lib/utils";

/**
 * A small ⓘ next to a measurement. Hover, focus or tap it to see the same
 * value in other units (12 km → 7.5 miles → 12,000 metres). The tip is drawn
 * at the body level so no folded panel or card can clip it.
 */
export function UnitTip({ label, lines, className }: { label: string; lines: string[]; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);

  const show = useCallback(() => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const below = r.top < 110;
    const x = Math.min(Math.max(r.left + r.width / 2, 96), window.innerWidth - 96);
    setPos({ x, y: below ? r.bottom + 8 : r.top - 8, below });
  }, []);
  const hide = useCallback(() => setPos(null), []);

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && hide();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    window.addEventListener("resize", hide);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", hide, { capture: true });
      window.removeEventListener("resize", hide);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pos, hide]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label={`${label} in other units`}
        aria-describedby={pos ? id : undefined}
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.stopPropagation();
          show();
        }}
        className={cn("hover:text-pine focus-visible:text-pine inline-grid size-6 shrink-0 place-items-center rounded-full text-muted transition-colors", className)}
      >
        <Info className="size-3.5" aria-hidden />
      </button>
      {pos ? (
        <Portal>
          <span
            role="tooltip"
            id={id}
            style={{ left: pos.x, top: pos.y }}
            className={cn(
              "pointer-events-none fixed z-[95] w-max max-w-[12rem] -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-left text-xs leading-relaxed text-snow shadow-xl",
              !pos.below && "-translate-y-full",
            )}
          >
            <span className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase opacity-60">{label}</span>
            {lines.map((l) => (
              <span key={l} className="block font-semibold">{l}</span>
            ))}
          </span>
        </Portal>
      ) : null}
    </>
  );
}

const n = (v: number, d = 0) => v.toLocaleString("en-US", { maximumFractionDigits: d });

/** "12 km" in the other units the ⓘ shows. */
export const distanceLines = (km: number) => [`${n(km, 1)} km`, `${n(km * 0.621371, 1)} miles`, `${n(km * 1000)} metres`];

/** "5,364 m" in the other units the ⓘ shows. */
export const altitudeLines = (m: number) => [`${n(m)} metres`, `${n(m * 3.28084)} feet`];
