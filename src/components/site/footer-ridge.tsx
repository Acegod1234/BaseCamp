"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Three Himalayan ridgelines rising out of the footer. As the footer scrolls
 * in they settle at different speeds, and on a mouse they shift a little
 * with the pointer, so the range has real depth. The front ridge is the
 * footer's own colour, so the mountains grow out of it.
 */
export function FooterRidge() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const px = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });

  const backY = useTransform(scrollYProgress, [0, 1], [70, 0]);
  const midY = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const backX = useTransform(sx, (v) => v * -14);
  const midX = useTransform(sx, (v) => v * -7);
  const snow = useTransform(scrollYProgress, [0.4, 1], [0, 1]);

  return (
    <div
      ref={ref}
      aria-hidden
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      }}
      onPointerLeave={() => px.set(0)}
      className="pointer-events-auto relative -mb-px h-24 w-full overflow-hidden sm:h-36 lg:h-44"
    >
      {/* Far range: tall, pale, the Everest skyline */}
      <motion.svg style={reduce ? undefined : { y: backY, x: backX }} viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute inset-x-[-2%] bottom-0 h-full w-[104%]">
        <path
          fill="#00afc4"
          fillOpacity="0.16"
          d="M0 200V150l70-26 46 14 62-48 40 22 58-64 34 30 44-40 52 52 30-18 64 50 50-34 34 22 72-78 26 18 30-34 48 56 34-14 60 46 44-26 70 50 54-36 40 22 66-58 36 26 50-30 62 46 40-14 64 34V200Z"
        />
        {/* Snow on the high peaks catches the light as the footer comes in */}
        <motion.path
          style={reduce ? undefined : { opacity: snow }}
          fill="none"
          stroke="#bdf3fa"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          d="M260 32l34 30 44-40 52 52M760 56l26 18 30-34 48 56M1200 92l36 26 50-30"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
      {/* Middle range */}
      <motion.svg style={reduce ? undefined : { y: midY, x: midX }} viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute inset-x-[-2%] bottom-0 h-[78%] w-[104%]">
        <path fill="#2a3a3d" d="M0 200V128l90-30 70 26 80-54 60 34 90-40 70 46 60-22 90 52 80-46 70 30 100-60 60 42 80-28 90 50 70-32 80 36 70-18 90 34V200Z" />
      </motion.svg>
      {/* Near hills: the footer's own colour */}
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[46%] w-full">
        <path fill="#1c2224" d="M0 200V96c120-40 220-46 330-18s200 30 320-6 240-44 360-8 210 30 290 0 100-20 140-6V200Z" />
      </svg>
    </div>
  );
}
