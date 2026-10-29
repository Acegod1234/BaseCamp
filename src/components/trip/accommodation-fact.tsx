"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { BedDouble, ImageIcon, X } from "lucide-react";
import { Portal } from "@/components/portal";
import { PlaceSlideshow } from "@/components/trip/place-slideshow";
import { photoOfPlace, type PlacePhoto } from "@/lib/place-photos";

const warmedPhotos = new Set<string>();

export function AccommodationFact({ value, place, iconOnly = false, images }: { value: string; place: string; iconOnly?: boolean; images?: PlacePhoto }) {
  const photo = images ?? photoOfPlace(place);
  const aspect = useRef(photo?.width && photo?.height ? photo.width / photo.height : 8 / 3);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const source = photo?.src;
  const [pinned, setPinned] = useState(false);
  const pinnedRef = useRef(false);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const cancelHide = useCallback(() => { if (timer.current) clearTimeout(timer.current); }, []);
  const hide = useCallback(() => { cancelHide(); pinnedRef.current = false; setPinned(false); setPos(null); }, [cancelHide]);
  const deferHide = () => { cancelHide(); if (!pinnedRef.current) timer.current = setTimeout(hide, 140); };
  const show = useCallback(() => {
    cancelHide();
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect || !photo) return;
    const width = Math.min(800, window.innerWidth - 24, aspect.current * Math.min(300, window.innerHeight - 48));
    const height = width / aspect.current;
    const preferredTop = rect.top >= height + 12 ? rect.top - height - 8 : rect.bottom + 8;
    const top = Math.max(12, Math.min(preferredTop, window.innerHeight - height - 12));
    setPos({ width, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top, height });
  }, [cancelHide, photo]);

  const resizeForPhoto = useCallback((ratio: number) => {
    if (Math.abs(aspect.current - ratio) < 0.001) return;
    aspect.current = ratio;
    show();
  }, [show]);

  useEffect(() => {
    if (!pos) return;
    const dismiss = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !popup.current?.contains(event.target as Node)) hide();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); hide(); } };
    const onScroll = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (pinnedRef.current && rect && rect.bottom > 0 && rect.top < window.innerHeight) { show(); return; }
      const cursor = pointer.current;
      if (rect && cursor && cursor.x >= rect.left && cursor.x <= rect.right && cursor.y >= rect.top && cursor.y <= rect.bottom) show();
      else hide();
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", hide);
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", hide);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [pos, hide, show]);
  useEffect(() => () => cancelHide(), [cancelHide]);
  useEffect(() => {
    if (!pinned) return;
    const frame = requestAnimationFrame(() => popup.current?.querySelector<HTMLElement>("[data-place-slideshow]")?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [pinned]);
  useEffect(() => {
    const button = trigger.current;
    if (!source || !button || warmedPhotos.has(source)) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      if (!warmedPhotos.has(source)) {
        warmedPhotos.add(source);
        const image = new window.Image();
        image.onload = () => { void image.decode().catch(() => {}); };
        image.onerror = () => warmedPhotos.delete(source);
        image.src = source;
      }
      observer.disconnect();
    }, { rootMargin: "300px" });
    observer.observe(button);
    return () => observer.disconnect();
  }, [source]);

  if (iconOnly && !photo) return null;

  return <div className={iconOnly ? "relative inline-flex" : "relative rounded-xl bg-snow-2 px-3 py-2.5"} onPointerEnter={(event) => { if (event.pointerType !== "touch") { pointer.current = { x: event.clientX, y: event.clientY }; show(); } }} onPointerMove={(event) => { if (event.pointerType !== "touch") { pointer.current = { x: event.clientX, y: event.clientY }; if (!pos) show(); } }} onPointerLeave={() => { pointer.current = null; deferHide(); }} onBlur={(event) => { if (!popup.current?.contains(event.relatedTarget as Node)) deferHide(); }}>
    {!iconOnly && <>
    <dt className="flex items-center gap-1.5 text-[0.66rem] font-bold tracking-[0.1em] text-muted uppercase"><BedDouble className="size-4 text-pine" aria-hidden />Accommodation{photo && <ImageIcon className="ml-auto size-3.5 text-pine/60" aria-hidden />}</dt>
    <dd className="mt-0.5 text-[0.85rem] font-semibold leading-snug">{value}</dd>
    </>}
    {photo && <button ref={trigger} type="button" aria-label={`Preview ${photo.name}`} aria-describedby={pos && !pinned ? id : undefined} aria-expanded={pinned} aria-controls={pos ? id : undefined} aria-haspopup="dialog" onFocus={show} onPointerEnter={show} onClick={() => { cancelHide(); pinnedRef.current = true; setPinned(true); show(); }} className={iconOnly ? "inline-flex h-6 items-center justify-center gap-1.5 rounded-md px-1 text-pine transition-colors hover:bg-pine/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine" : "absolute inset-0 cursor-help rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"}>{iconOnly && <><ImageIcon className="size-4" aria-hidden /><span>Images</span></>}</button>}
    {photo && pos && <Portal><div ref={popup} id={id} role={pinned ? "dialog" : "tooltip"} aria-label={`Photos of ${photo.name}`} tabIndex={pinned ? -1 : undefined} onMouseEnter={cancelHide} onMouseLeave={deferHide} onFocus={cancelHide} onBlur={deferHide} style={{ left: pos.left, top: pos.top, width: pos.width, height: pos.height }} className="transition-[width,height,left,top] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none fixed z-[110] overflow-hidden rounded-2xl border border-line bg-card text-ink shadow-2xl">
      <PlaceSlideshow photo={photo} interactive={pinned} onAspectChange={resizeForPhoto} />
      {pinned && <button type="button" onClick={hide} aria-label="Close photo preview" className="absolute top-3 right-3 z-20 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/65"><X className="size-4" aria-hidden /></button>}
    </div></Portal>}
  </div>;
}
