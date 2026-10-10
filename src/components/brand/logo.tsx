import { cn } from "@/lib/utils";

/**
 * The Base Camp Adventure mark, redrawn as vector from the 132×76 PNG on the
 * old site so it stays sharp on any screen and can recolour for dark headers.
 *
 * `tone="light"` swaps the slate parts to white for use over photographs.
 */
export function Logo({ tone = "color", className, title = "Base Camp Adventure" }: { tone?: "color" | "light"; className?: string; title?: string }) {
  const slate = tone === "light" ? "#ffffff" : "#58595B";
  const teal = "#00B1CD";
  const snow = tone === "light" ? "rgba(255,255,255,0.0)" : "#ffffff";

  return (
    <svg viewBox="0 0 132 76" role="img" aria-label={title} className={cn("h-auto", className)}>
      <title>{title}</title>
      <defs>
        <clipPath id={`sky-${tone}`}>
          <rect x="0" y="0" width="132" height="40.5" />
        </clipPath>
      </defs>

      {/* Sky: a teal sun-disc behind the summit, cut flat by the frame. */}
      <g clipPath={`url(#sky-${tone})`}>
        <circle cx="66" cy="42" r="41" fill={teal} />
        <path d="M37 11.5c2-3.4 6.3-4.2 9.1-2 1.4-2.7 5.2-3.5 7.6-1.4 2.4-1.2 5.3.2 5.7 2.8H37z" fill={tone === "light" ? "rgba(255,255,255,0.85)" : "#fff"} />
        <path d="M76 17.2c1.6-2.6 4.9-3.2 7.1-1.5 1.4-2 4.4-2.4 6.2-.8 2-.6 4 .7 4.2 2.6H76z" fill={tone === "light" ? "rgba(255,255,255,0.85)" : "#fff"} />
      </g>

      {/* Massif */}
      <path
        d="M19 40.5 33 27.5l3.4 2.6 7.2-8.3 3 2.2L66 9.6l7.4 8.6 3.6-3 11 12.6 3.2-2 11.8 14.7z"
        fill={slate}
      />
      {/* Snow and ridge light */}
      <path
        d="M66 9.6 58.8 18.4l3.6-1.2 1.4 6.4 2.5-7.2 3.6 4.4.4-5.3 2.2 1.7zM43.6 21.8 39.2 27l2.5-.6.9 3.4 1.6-4.4 2 1.4zM77 15.2l-2.3 4.1 2.6-.7 2.6 4.6.6-4.3z"
        fill={snow}
      />

      {/* Frame, broken by the summit above and the word ADVENTURE below */}
      <path d="M19 40.5H1.2v34H12M120 74.5h10.8v-34H112.6" fill="none" stroke={slate} strokeWidth="1.6" />

      <text
        x="66"
        y="62.3"
        textAnchor="middle"
        fill={slate}
        fontFamily="var(--font-sans), Arial, sans-serif"
        fontWeight="800"
        fontSize="17.2"
        textLength="114"
        lengthAdjust="spacingAndGlyphs"
      >
        BASE CAMP
      </text>
      <text
        x="66"
        y="76"
        textAnchor="middle"
        fill={tone === "light" ? "#5fd6ea" : teal}
        fontFamily="var(--font-sans), Arial, sans-serif"
        fontWeight="800"
        fontSize="7.6"
        textLength="102"
        lengthAdjust="spacing"
      >
        ADVENTURE
      </text>
    </svg>
  );
}
