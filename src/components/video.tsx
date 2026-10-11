"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A YouTube video that costs nothing until it is played: a thumbnail and a
 * play button, swapped for the (privacy-enhanced) player on click.
 */
export function YouTube({ id, title, className }: { id: string; title: string; className?: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-xl bg-[#0b1012]", className)}>
      {on ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0" aria-label={`Play video: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#e62117] shadow-xl transition-transform group-hover:scale-110">
            <Play className="ml-1 size-7 fill-current" aria-hidden />
          </span>
          <span className="absolute inset-x-4 bottom-3 line-clamp-2 text-left text-sm font-semibold text-white">{title}</span>
        </button>
      )}
    </div>
  );
}
