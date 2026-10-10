import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The company's original logo, the same file the WordPress site uses
 * (132×76). It is shown at its native size, on a light surface, so it stays
 * crisp. Swap /brand/logo.png for a vector master when the designer sends one.
 */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/logo.png"
      alt="Base Camp Adventure"
      width={132}
      height={76}
      preload={priority}
      unoptimized
      className={cn("h-auto w-[116px] sm:w-[132px]", className)}
    />
  );
}
