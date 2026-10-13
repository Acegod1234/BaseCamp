import Image from "@/components/image";
import { cn } from "@/lib/utils";

/**
 * Dark mode only: the photograph lights the page around it.
 *
 * A tiny, heavily blurred copy of the image sits behind its card, so snow
 * glows white-blue, a sunset glows amber and forest glows green, as if the
 * scene were a window lit from inside. Hidden (and never downloaded) in light
 * mode, and only a ~96px image in dark mode.
 */
export function PhotoGlow({ src, className, strength = "md" }: { src: string; className?: string; strength?: "sm" | "md" | "lg" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 hidden dark:block",
        strength === "sm" && "-inset-2 opacity-45 blur-2xl",
        strength === "md" && "-inset-4 opacity-55 blur-[42px]",
        strength === "lg" && "-inset-x-10 -inset-y-8 opacity-60 blur-[70px]",
        className,
      )}
    >
      <Image src={src} alt="" fill sizes="96px" quality={70} className="scale-110 object-cover saturate-[1.6]" />
    </div>
  );
}
