import Image from "@/components/image";
import { cn } from "@/lib/utils";

/**
 * The company's logo, as a vector redrawn from the original 132×76 file
 * (scripts/brand/logo.svg), so it is sharp on every screen.
 *
 * `auto` follows the theme: in dark mode the grey lettering is shown light,
 * from logo-dark.svg, so the mark reads on the night background. `light`
 * always shows the original, for use on white chips; `dark` always shows the
 * light-lettering version, for surfaces that are dark in both themes.
 */
export function Logo({ className, priority = false, tone = "auto" }: { className?: string; priority?: boolean; tone?: "auto" | "light" | "dark" }) {
  const size = cn("h-auto w-[116px] sm:w-[132px]", className);
  // On a dark surface in either theme (the footer): the light-lettering logo.
  if (tone === "dark") {
    return <Image src="/brand/logo-dark.svg" alt="Base Camp Adventure" width={132} height={76} unoptimized className={size} />;
  }
  if (tone === "light") {
    return <Image src="/brand/logo.svg" alt="Base Camp Adventure" width={132} height={76} preload={priority} unoptimized className={size} />;
  }
  return (
    <>
      <Image src="/brand/logo.svg" alt="Base Camp Adventure" width={132} height={76} preload={priority} unoptimized className={cn(size, "dark:hidden")} />
      <Image src="/brand/logo-dark.svg" alt="Base Camp Adventure" width={132} height={76} unoptimized className={cn(size, "hidden dark:block")} />
    </>
  );
}
