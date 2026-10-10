import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Licences and memberships in their real colours, each with its credential. */
export function Accreditations({ variant = "band" }: { variant?: "band" | "compact" }) {
  if (variant === "compact") {
    return (
      <ul className="flex flex-wrap items-center gap-2.5" aria-label="Licences and memberships">
        {site.affiliations.map((a) => (
          <li key={a.name}>
            <a href={a.href} target="_blank" rel="noopener noreferrer" title={a.name} className="grid h-14 place-items-center rounded-xl bg-white px-3.5 transition-transform hover:-translate-y-0.5">
              <Image src={a.logo} alt={a.name} width={a.w} height={a.h} className="h-9 w-auto max-w-[8.5rem] object-contain" />
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section aria-label="Licences and memberships" className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[18rem_1fr] lg:items-center lg:gap-12">
        <div>
          <p className="eyebrow text-pine flex items-center gap-2">
            <ShieldCheck className="size-4" aria-hidden /> Licensed &amp; trusted
          </p>
          <p className="mt-3 text-lg font-semibold leading-snug text-ink">
            Licensed by the Government of Nepal. Members of TAAN and the Nepal Mountaineering Association since 2010.
          </p>
        </div>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" gap={0.05}>
          {site.affiliations.map((a) => (
            <StaggerItem key={a.name}>
              <a
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                title={a.name}
                className="group flex h-full flex-col items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-pine/30 hover:shadow-[0_18px_40px_-26px_oklch(0.2_0.04_170/0.5)]"
              >
                <span className="grid h-16 w-full place-items-center">
                  <Image
                    src={a.logo}
                    alt={a.name}
                    width={a.w}
                    height={a.h}
                    sizes="160px"
                    className={cn("max-h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105", a.w / a.h > 3 ? "max-w-full" : "max-w-[5.5rem]")}
                  />
                </span>
                <span className="text-[0.7rem] font-semibold leading-tight text-muted">{a.short}</span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
