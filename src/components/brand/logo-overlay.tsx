import { cn } from "@/lib/utils";

/**
 * The photo watermark drawn over a wide banner, where the logo baked into the
 * photograph falls outside the crop. Same artwork as the baked one
 * (public/brand/watermark.svg, from scripts/brand/logo.svg).
 */
export function LogoOverlay({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/watermark.svg" alt="" aria-hidden width={140} height={84} className={cn("pointer-events-none absolute right-[3%] bottom-[6%] h-auto w-[clamp(84px,10%,150px)] select-none", className)} />
  );
}
