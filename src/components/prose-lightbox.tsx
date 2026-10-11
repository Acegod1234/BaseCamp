"use client";

import { useEffect, useState } from "react";
import { Lightbox, type LightboxImage } from "@/components/lightbox";

/**
 * Photos inside imported articles and trip descriptions open full screen when
 * clicked, together with the other photos in the same text. Mounted once in
 * the layout; it listens for clicks on any `.prose-trail img`.
 */
export function ProseLightbox() {
  const [state, setState] = useState<{ images: LightboxImage[]; index: number } | null>(null);

  useEffect(() => {
    const path = (img: HTMLImageElement) => {
      const url = new URL(img.currentSrc || img.src, location.href);
      // next/image URLs carry the original path in ?url=.
      if (url.pathname.startsWith("/_next/image")) return url.searchParams.get("url");
      return url.origin === location.origin ? url.pathname : null;
    };
    const onClick = (e: MouseEvent) => {
      const img = (e.target as Element | null)?.closest?.(".prose-trail img") as HTMLImageElement | null;
      if (!img || img.closest("a[href]:not([href$='.webp']):not([href$='.jpg'])")) return;
      const scope = img.closest("article, main") ?? document.body;
      const all = [...scope.querySelectorAll<HTMLImageElement>(".prose-trail img")]
        .map((el) => ({ el, src: path(el) }))
        .filter((x): x is { el: HTMLImageElement; src: string } => Boolean(x.src) && x.el.naturalWidth >= 300);
      const index = all.findIndex((x) => x.el === img);
      if (index < 0) return;
      e.preventDefault();
      setState({ images: all.map((x) => ({ src: x.src, alt: x.el.alt })), index });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <Lightbox images={state?.images ?? []} index={state ? state.index : null} onIndex={(i) => setState((s) => (s && i !== null ? { ...s, index: i } : null))} title="Photos" />;
}
