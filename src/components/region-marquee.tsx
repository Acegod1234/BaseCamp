import Link from "next/link";
import { Mountain } from "lucide-react";

const PLACES = [
  { name: "Everest", href: "/destinations/everest-region/" },
  { name: "Annapurna", href: "/destinations/annapurna-region/" },
  { name: "Langtang", href: "/destinations/langtang-region/" },
  { name: "Manaslu", href: "/destinations/manaslu-region/" },
  { name: "Mustang", href: "/destinations/remote-area-trekking/" },
  { name: "Bhutan", href: "/destinations/bhutan/" },
  { name: "Tibet", href: "/destinations/tibet/" },
  { name: "Kathmandu", href: "/destinations/nepal/" },
];

/** Destination names drifting across the page, solid and outlined in turn. */
export function RegionMarquee() {
  return (
    <section aria-label="Destinations" className="marquee-host overflow-hidden border-b border-line bg-snow py-8">
      <div className="flex">
        <div className="marquee flex shrink-0 items-center gap-10 pr-10" style={{ ["--marquee-speed" as string]: "48s" }}>
          {[...PLACES, ...PLACES].map((p, i) => (
            <Link
              key={i}
              href={p.href}
              tabIndex={i >= PLACES.length ? -1 : 0}
              aria-hidden={i >= PLACES.length}
              className="group flex items-center gap-10"
            >
              <span
                className={
                  i % 2
                    ? "font-display text-[clamp(3rem,7vw,6rem)] font-black uppercase leading-none text-transparent transition-colors [-webkit-text-stroke:1.5px_var(--ink)] group-hover:text-pine group-hover:[-webkit-text-stroke:1.5px_var(--pine)]"
                    : "font-display text-[clamp(3rem,7vw,6rem)] font-black uppercase leading-none text-ink transition-colors group-hover:text-pine"
                }
              >
                {p.name}
              </span>
              <Mountain className="text-marigold size-8 shrink-0" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
