"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "bca-theme";

/**
 * Runs inline before the page paints, so a returning visitor never sees the
 * wrong theme flash. Saved choice wins; otherwise the device setting.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${KEY}');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");

export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  const toggle = () => {
    const next = !isDark();
    const root = document.documentElement;
    // Apply every theme colour in one paint, without per-element cross-fades.
    root.classList.add("theme-switching");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {}
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn("relative grid size-10 place-items-center overflow-hidden rounded-full text-ink transition-colors hover:bg-snow-2", className)}
    >
      {dark ? <Moon className="size-[1.15rem]" aria-hidden /> : <Sun className="size-[1.15rem]" aria-hidden />}
    </button>
  );
}
