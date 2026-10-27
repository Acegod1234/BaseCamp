"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Tall award panels scroll fully into view before the sidebar becomes sticky. */
export function TripSidebar({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(160);
  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    const update = () => setTop(Math.min(160, window.innerHeight - panel.getBoundingClientRect().height - 24));
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    window.addEventListener("resize", update);
    update();
    return () => { observer.disconnect(); window.removeEventListener("resize", update); };
  }, []);
  return <div ref={ref} className="sticky space-y-6" style={{ top }}>{children}</div>;
}
