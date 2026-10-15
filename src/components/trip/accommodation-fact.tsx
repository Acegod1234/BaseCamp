"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { BedDouble, ImageIcon } from "lucide-react";
import Image from "@/components/image";
import { Portal } from "@/components/portal";
import { photoOfPlace } from "@/lib/place-photos";

export function AccommodationFact({ value, place }: { value: string; place: string }) {
  const photo = photoOfPlace(place);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);
  const cancelHide = useCallback(() => { if (timer.current) clearTimeout(timer.current); }, []);
  const hide = useCallback(() => { cancelHide(); setPos(null); }, [cancelHide]);
  const deferHide = () => { cancelHide(); timer.current = setTimeout(hide, 140); };
  const show = () => {
    cancelHide();
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect || !photo) return;
    const width = Math.min(800, window.innerWidth - 24);
    const height = width * 3 / 8 + 96;
    const preferredTop = rect.top >= height + 12 ? rect.top - height - 8 : rect.bottom + 8;
    const top = Math.max(12, Math.min(preferredTop, window.innerHeight - height - 12));
    setPos({ width, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top });
  };

  useEffect(() => {
    if (!pos) return;
    const dismiss = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !popup.current?.contains(event.target as Node)) hide();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); hide(); } };
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    window.addEventListener("resize", hide);
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [pos, hide]);
  useEffect(() => () => cancelHide(), [cancelHide]);

  return <div className="relative rounded-xl bg-snow-2 px-3 py-2.5" onMouseEnter={show} onMouseLeave={deferHide} onBlur={(event) => { if (!popup.current?.contains(event.relatedTarget as Node)) deferHide(); }}>
    <dt className="flex items-center gap-1.5 text-[0.66rem] font-bold tracking-[0.1em] text-muted uppercase"><BedDouble className="size-4 text-pine" aria-hidden />Accommodation{photo && <ImageIcon className="ml-auto size-3.5 text-pine/60" aria-hidden />}</dt>
    <dd className="mt-0.5 text-[0.85rem] font-semibold leading-snug">{value}</dd>
    {photo && <button ref={trigger} type="button" aria-label={`Preview ${photo.name}`} aria-describedby={pos ? id : undefined} onFocus={show} onClick={show} className="absolute inset-0 cursor-help rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine" />}
    {photo && pos && <Portal><div ref={popup} id={id} role="tooltip" onMouseEnter={cancelHide} onMouseLeave={deferHide} onFocus={cancelHide} onBlur={deferHide} style={{ left: pos.left, top: pos.top, width: pos.width }} className="fixed z-[110] overflow-hidden rounded-2xl border border-line bg-card text-ink shadow-2xl">
      <div className="relative aspect-[8/3]"><Image src={photo.src} alt={photo.alt} fill quality={95} sizes="(max-width: 824px) calc(100vw - 24px), 800px" className="object-cover" /></div>
      <div className="px-3 py-2.5"><p className="text-sm font-semibold">{photo.name}</p><p className="mt-0.5 text-xs text-muted">Overnight destination</p><p className="mt-1.5 text-[10px] leading-relaxed text-muted"><a href={photo.source} target="_blank" rel="noopener noreferrer" className="underline">Photo: {photo.author}</a> · <a href={photo.licenseUrl || photo.source} target="_blank" rel="noopener noreferrer" className="underline">{photo.license}</a></p></div>
    </div></Portal>}
  </div>;
}
