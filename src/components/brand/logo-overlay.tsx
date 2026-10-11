import { cn } from "@/lib/utils";

/**
 * The photo watermark drawn over a banner whose crop leaves out the logo baked
 * into the photograph. `box` (from src/lib/banner.ts) puts it at the same size
 * and spacing as the baked one, so every photo shows one identical logo.
 */
export function LogoOverlay({ box, className }: { box: { width: string; right: string; bottom: string }; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/watermark.svg"
      alt=""
      aria-hidden
      width={140}
      height={84}
      style={{ width: box.width, right: box.right, bottom: box.bottom }}
      className={cn("pointer-events-none absolute h-auto select-none", className)}
    />
  );
}
