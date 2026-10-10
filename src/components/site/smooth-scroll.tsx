"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { pinnedOffset, scrollToId } from "@/lib/scroll";

/**
 * Scrolling for the whole site.
 *
 * 1. Inertial scrolling on desktop mice and trackpads (Lenis). Off on touch
 *    screens, whose native scroll is already smooth, and for reduced motion.
 *    It pauses whenever an overlay locks the page with `overflow: hidden`.
 * 2. Every same-page link (#section) glides to its target and stops just
 *    below the header and any pinned section bar, on every device.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let observer: MutationObserver | null = null;

    if (!reduce && fine) {
      const lenis = new Lenis({ autoRaf: true, lerp: 0.11, allowNestedScroll: true });
      window.__lenis = lenis;
      const html = document.documentElement;
      observer = new MutationObserver(() => (html.style.overflow === "hidden" ? lenis.stop() : lenis.start()));
      observer.observe(html, { attributes: true, attributeFilter: ["style"] });
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));
      if (id === "top") {
        e.preventDefault();
        if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        return;
      }
      if (scrollToId(id)) e.preventDefault();
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      observer?.disconnect();
      window.__lenis?.destroy();
      window.__lenis = null;
    };
  }, []);

  // New page: start at the top, or at the #section in the address.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const t = window.setTimeout(() => {
      if (id && document.getElementById(id)) {
        const el = document.getElementById(id)!;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - pinnedOffset(), behavior: "auto" });
      } else {
        window.__lenis?.scrollTo(0, { immediate: true });
      }
    }, 60);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
