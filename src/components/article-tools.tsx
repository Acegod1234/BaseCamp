"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Link2, Share2 } from "lucide-react";
import { FacebookIcon, WhatsappIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level?: number };

/** Which heading is being read: the last one scrolled past the top third of the screen. */
function useActive(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    if (!ids.length) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const line = window.innerHeight * 0.3;
        let current = ids[0];
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= line) current = id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);
  return active;
}

/** "On this page": sticky on desktop with the current section marked; a fold-out on phones. */
export function TableOfContents({ headings, variant }: { headings: Heading[]; variant: "side" | "inline" }) {
  const active = useActive(headings.map((h) => h.id));
  const [open, setOpen] = useState(false);
  const list = (
    <ol className="space-y-0.5 border-l border-line text-sm">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={() => setOpen(false)}
            aria-current={active === h.id ? "location" : undefined}
            className={cn("-ml-px block border-l-2 py-1.5 transition-colors", (h.level ?? 2) > 2 ? "pl-7 text-[0.8rem]" : "pl-4", active === h.id ? "border-pine font-semibold text-ink" : "border-transparent text-ink-soft hover:text-ink")}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "side") {
    return (
      <nav aria-label="On this page" data-lenis-prevent className="sticky top-32 max-h-[calc(100dvh-10rem)] overflow-y-auto overscroll-contain pr-2">
        <p className="eyebrow text-pine mb-4">On this page</p>
        {list}
      </nav>
    );
  }
  return (
    <nav aria-label="On this page" className="mb-8 rounded-xl border border-line bg-card lg:hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
        <span className="eyebrow text-pine">On this page · {headings.length} sections</span>
        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? <div className="px-4 pb-4">{list}</div> : null}
    </nav>
  );
}

/** Share: the phone's own share sheet where there is one, plus copy, Facebook, X and WhatsApp. */
export function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  useEffect(() => {
    // Only touch devices get the native sheet; desktops keep the explicit buttons.
    const id = requestAnimationFrame(() => setNative(typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches));
    return () => cancelAnimationFrame(id);
  }, []);
  const u = encodeURIComponent(url);
  const btn = "grid size-10 place-items-center rounded-full border border-line hover:border-pine hover:text-pine transition-colors";
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="mr-1 text-sm font-semibold">Share</span>
      {native ? (
        <button type="button" onClick={() => navigator.share({ title, url }).catch(() => {})} className="bg-pine inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white">
          <Share2 className="size-4" aria-hidden /> Share
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        })}
        className={cn(btn, "w-auto gap-2 px-4 text-sm font-semibold")}
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />} {copied ? "Copied" : "Copy link"}
      </button>
      <a aria-label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" className={btn}>
        <FacebookIcon className="size-4" />
      </a>
      <a aria-label="Share on X" href={`https://x.com/intent/post?url=${u}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className={btn}>
        <XIcon className="size-3.5" />
      </a>
      <a aria-label="Share on WhatsApp" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className={btn}>
        <WhatsappIcon className="size-4" />
      </a>
    </div>
  );
}
