"use client";

import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

/**
 * Height of everything pinned to the top of the screen once the page has
 * scrolled: the floating header plus any sticky section bar (marked with
 * `data-subnav`). Measured at click time, so it is right on every page and
 * at every screen size.
 */
export function pinnedOffset(gap = 16) {
  let bottom = 0;
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  if (header) bottom = header.getBoundingClientRect().bottom;
  document.querySelectorAll<HTMLElement>("[data-subnav]").forEach((el) => {
    const top = parseFloat(getComputedStyle(el).top) || 0;
    bottom = Math.max(bottom, top + el.offsetHeight);
  });
  return bottom + gap;
}

/** Glides to an element so it lands just below the pinned bars. */
export function scrollToId(id: string, { updateHash = true } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  const y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - pinnedOffset());
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.__lenis && !reduce) window.__lenis.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  if (updateHash) history.replaceState(history.state, "", `#${id}`);
  return true;
}
