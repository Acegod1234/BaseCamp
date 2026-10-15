"use client";

import { useEffect, type RefObject } from "react";
import type {} from "@/lib/scroll";

/** Keep vertical page scrolling working over horizontal snap carousels. */
export function usePageWheelScroll(ref: RefObject<HTMLElement | null>, itemCount: number) {
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      if (document.documentElement.style.overflow === "hidden") return;
      event.preventDefault();
      event.stopPropagation();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      const lenis = window.__lenis;
      if (lenis && !lenis.isStopped) lenis.scrollTo(window.scrollY + delta, { immediate: true });
      else window.scrollBy({ top: delta, behavior: "instant" });
    };
    row.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => row.removeEventListener("wheel", onWheel, true);
  }, [ref, itemCount]);
}
