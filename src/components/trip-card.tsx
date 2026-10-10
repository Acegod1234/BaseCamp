"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Clock, Mountain, Star } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { difficultyLabel } from "@/lib/site";
import type { TripCard as Card } from "@/lib/types";
import { cn, usd } from "@/lib/utils";

/**
 * Trip poster card.
 *
 * The photograph is the card. On a mouse it tilts toward the pointer with a
 * soft glare, and the photo sits forward of the text so the two separate in
 * depth. Touch screens and reduced-motion get a still card with a zoom.
 */
export function TripCard({
  trip,
  regionName,
  priority = false,
  className,
  size = "md",
}: {
  trip: Card;
  regionName?: string;
  priority?: boolean;
  className?: string;
  size?: "md" | "lg";
}) {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 17, mass: 0.4 };
  const rx = useSpring(useTransform(py, [0, 1], [6, -6]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-8, 8]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(22rem circle at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 55%)`;
  const tilt = fine && !reduce;

  const sale = trip.price?.regular && trip.price.amount < trip.price.regular ? Math.round((1 - trip.price.amount / trip.price.regular) * 100) : null;

  return (
    <motion.div
      onPointerEnter={(e) => setFine(e.pointerType === "mouse")}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 1000 } : undefined}
      className={cn("group relative", className)}
    >
      <Link
        href={`/trip/${trip.slug}/`}
        className={cn(
          "relative block overflow-hidden rounded-[1.6rem] bg-pine-night shadow-[0_18px_40px_-24px_oklch(0.2_0.04_170/0.6)] transition-shadow duration-500 group-hover:shadow-[0_34px_70px_-30px_oklch(0.2_0.04_170/0.75)]",
          size === "lg" ? "aspect-[4/5] sm:aspect-[5/6]" : "aspect-[4/5]",
        )}
      >
        {trip.cover ? (
          <Image
            src={trip.cover.src}
            alt={trip.cover.alt || trip.title}
            fill
            sizes={size === "lg" ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"}
            preload={priority}
            quality={70}
            className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-trail)] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="contours absolute inset-0" />
        )}
        <div className="scrim-b absolute inset-0" />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="glass-dark inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white">
              <Clock className="size-3.5" aria-hidden />
              {trip.days} {trip.days === 1 ? "day" : "days"}
            </span>
            {trip.difficulty ? (
              <span className="glass-dark rounded-full px-3 py-1.5 text-xs font-semibold text-white">
                {difficultyLabel[trip.difficulty] ?? trip.difficulty}
              </span>
            ) : null}
          </div>
          {sale ? (
            <span className="bg-crimson rounded-full px-2.5 py-1.5 text-xs font-bold text-white">−{sale}%</span>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          {regionName ? <p className="eyebrow mb-2 text-white/75">{regionName}</p> : null}
          <h3 className="font-display text-[1.65rem] font-extrabold uppercase leading-[0.95] text-white sm:text-[1.85rem]">
            {trip.title}
          </h3>

          <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/15 pt-4">
            <div className="flex flex-col gap-1 text-sm text-white/80">
              {trip.maxAltitude ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                  <Mountain className="text-glacier size-3.5" aria-hidden />
                  {trip.maxAltitude.toLocaleString("en-US")} m max
                </span>
              ) : null}
              {trip.rating ? (
                <span className="inline-flex items-center gap-1 text-xs">
                  <Star className="fill-marigold text-marigold size-3.5" aria-hidden />
                  {trip.rating.value.toFixed(1)} · {trip.rating.count} reviews
                </span>
              ) : null}
            </div>

            <div className="text-right">
              {trip.price ? (
                <>
                  {trip.price.regular ? (
                    <span className="block text-xs text-white/55 line-through">{usd(trip.price.regular)}</span>
                  ) : null}
                  <span className="text-marigold font-display text-3xl font-extrabold leading-none">{usd(trip.price.amount)}</span>
                  <span className="block text-[0.65rem] tracking-wide text-white/60 uppercase">per person</span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-pine-deep">
                  View trip <ArrowUpRight className="size-3.5" aria-hidden />
                </span>
              )}
            </div>
          </div>
        </div>

        <span className="bg-marigold text-pine-night absolute top-1/2 right-5 grid size-12 -translate-y-1/2 translate-x-4 place-items-center rounded-full opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowUpRight className="size-5" aria-hidden />
        </span>

        {tilt ? (
          <motion.span aria-hidden style={{ backgroundImage: glare }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        ) : null}
      </Link>
    </motion.div>
  );
}
