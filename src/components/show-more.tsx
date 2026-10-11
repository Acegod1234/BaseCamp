"use client";

import { Children, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A long list that opens a screenful at a time. Every item is in the HTML
 * (so search engines read and follow all of it); the ones further down stay
 * folded until "Show more", which keeps phones from scrolling forever.
 */
export function ShowMore({ children, initial = 12, step = 12, label = "more", className }: { children: React.ReactNode; initial?: number; step?: number; label?: string; className?: string }) {
  const items = Children.toArray(children);
  const [shown, setShown] = useState(initial);
  const left = items.length - shown;
  return (
    <>
      <div className={className}>
        {items.map((child, i) => (
          <div key={i} className={cn("contents", i >= shown && "[&>*]:hidden")}>
            {child}
          </div>
        ))}
      </div>
      {left > 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button type="button" onClick={() => setShown((s) => s + step)} className="hover:border-pine inline-flex items-center gap-2 rounded-lg border border-line bg-card px-6 py-3.5 text-sm font-bold transition-colors">
            Show {Math.min(step, left)} {label} <ChevronDown className="size-4" aria-hidden />
          </button>
          <p className="text-xs text-muted">
            Showing {shown} of {items.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
