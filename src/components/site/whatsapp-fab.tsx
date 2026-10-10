"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { WhatsappIcon } from "@/components/icons";
import { whatsappHref } from "@/lib/site";

/** Appears once the visitor has scrolled past the first screen. */
export function WhatsappFab() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 600));

  return (
    <motion.a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={false}
      animate={show ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.6, opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-5 left-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_-10px_rgba(37,211,102,0.7)] lg:bottom-8 lg:left-8"
      style={{ pointerEvents: show ? "auto" : "none" }}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25" aria-hidden />
      <WhatsappIcon className="relative size-7" />
    </motion.a>
  );
}
