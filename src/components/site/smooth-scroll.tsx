"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Inertial scrolling on desktop mice and trackpads.
 *
 * Off for touch screens (their native scroll is already smooth) and for
 * anyone who asks the OS to reduce motion. When any overlay locks the page
 * by setting `overflow: hidden` on <html>, scrolling pauses with it, so the
 * page behind a menu or the photo viewer never moves.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      wheelMultiplier: 1,
      anchors: { offset: -110 },
      allowNestedScroll: true,
    });
    lenisRef.current = lenis;

    const html = document.documentElement;
    const observer = new MutationObserver(() => {
      if (html.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    });
    observer.observe(html, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // A new page starts at the top, without gliding there.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
