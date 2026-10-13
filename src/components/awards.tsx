import Image from "@/components/image";
import { ArrowUpRight, Award as AwardIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import { site } from "@/lib/site";
import type { Award } from "@/lib/types";

/**
 * Awards and recognition: the company's award badges (Tripadvisor
 * Travellers' Choice and others, added from the admin with their year and
 * official badge image), beside a link to the real Tripadvisor listing.
 * Shows only what has been added; nothing is assumed.
 */
export function Awards({ awards }: { awards: Award[] }) {
  return (
    <div className={awards.length ? "grid gap-4 lg:grid-cols-[1fr_auto] lg:items-stretch" : "max-w-md"}>
      {awards.length ? (
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" gap={0.05}>
          {awards.map((a) => {
            const body = (
              <>
                <span className="grid h-24 w-full place-items-center">
                  {a.image ? (
                    <Image src={a.image} alt={`${a.issuer} ${a.title}${a.year ? ` ${a.year}` : ""}`} width={160} height={160} className="max-h-24 w-auto object-contain" />
                  ) : (
                    <span className="bg-glacier-soft text-pine grid size-20 place-items-center rounded-full">
                      <AwardIcon className="size-9" strokeWidth={1.4} aria-hidden />
                    </span>
                  )}
                </span>
                <span className="mt-3 block text-sm font-bold leading-snug">{a.title}</span>
                <span className="block text-xs text-muted">
                  {a.issuer}
                  {a.year ? ` · ${a.year}` : ""}
                </span>
              </>
            );
            return (
              <StaggerItem key={`${a.issuer}-${a.title}-${a.year}`} className="h-full">
                {a.href ? (
                  <a href={a.href} target="_blank" rel="noopener noreferrer" className="hover:border-pine/40 flex h-full flex-col items-center rounded-xl border border-line bg-card p-4 text-center transition-colors">
                    {body}
                  </a>
                ) : (
                  <div className="flex h-full flex-col items-center rounded-xl border border-line bg-card p-4 text-center">{body}</div>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      ) : null}
      <a
        href={site.social.tripadvisor}
        target="_blank"
        rel="noopener noreferrer"
        className="group hover:border-pine/40 flex items-center gap-4 rounded-xl border border-line bg-card p-5 transition-colors lg:min-w-[19rem] lg:flex-col lg:justify-center lg:text-center"
      >
        <span className="grid h-14 w-24 shrink-0 place-items-center px-2">
          <Image src="/brand/partners/tripadvisor.png" alt="Tripadvisor" width={245} height={220} className="h-11 w-auto dark:brightness-0 dark:invert" />
        </span>
        <span>
          <span className="block font-bold">Base Camp Adventure on Tripadvisor</span>
          <span className="text-pine mt-1 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">
            Read our reviews <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </span>
      </a>
    </div>
  );
}
