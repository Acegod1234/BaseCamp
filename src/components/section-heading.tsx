import { LineReveal, Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

/**
 * Section heading in the house style: a mono eyebrow, a condensed uppercase
 * headline, and one italic serif phrase that carries the voice.
 */
export function SectionHeading({
  eyebrow,
  lines,
  intro,
  tone = "light",
  align = "left",
  className,
  as = "h2",
}: {
  eyebrow: string;
  lines: React.ReactNode[];
  intro?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
      <Reveal y={12}>
        <p className={cn("eyebrow flex items-center gap-3", align === "center" && "justify-center", tone === "dark" ? "text-glacier" : "text-pine")}>
          {eyebrow}
        </p>
      </Reveal>
      <LineReveal
        as={as}
        lines={lines}
        className={cn(
          "font-display mt-4 text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.02]",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      />
      {intro ? (
        <Reveal delay={0.15} y={16}>
          <div className={cn("mt-5 max-w-xl text-lg leading-relaxed", align === "center" && "mx-auto", tone === "dark" ? "text-white/75" : "text-ink-soft")}>{intro}</div>
        </Reveal>
      ) : null}
    </div>
  );
}

/** The italic serif phrase inside a heading. */
export function Accent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("accent-word", className)}>{children}</span>;
}
