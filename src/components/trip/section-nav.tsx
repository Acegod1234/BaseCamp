"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Sticky in-page navigation that follows the section being read. */
export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Trip sections" className="sticky top-[4.5rem] z-30 border-b border-line bg-snow/90 backdrop-blur-xl lg:top-20">
      <div className="no-scrollbar mx-auto flex max-w-[90rem] gap-1 overflow-x-auto px-4 sm:px-6">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            className={cn("relative shrink-0 px-4 py-4 text-sm font-semibold transition-colors", active === i.id ? "text-pine" : "text-muted hover:text-ink")}
          >
            {i.label}
            {active === i.id ? <motion.span layoutId="trip-nav" className="bg-marigold absolute inset-x-3 bottom-0 h-[3px] rounded-full" /> : null}
          </a>
        ))}
      </div>
    </nav>
  );
}
