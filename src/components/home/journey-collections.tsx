"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { TripCard } from "@/components/trip-card";
import { Accent, SectionHeading } from "@/components/section-heading";
import type { TripCard as Card } from "@/lib/types";
import { cn } from "@/lib/utils";

export function JourneyCollections({ tours, luxury, regionNames }: { tours: Card[]; luxury: Card[]; regionNames: Record<string, string> }) {
  const [active, setActive] = useState("tours");
  const items = active === "tours" ? tours : luxury;
  const moreHref = active === "tours" ? "/activities/nepal-tour/" : "/trip/?q=luxury";
  return (
    <section className="border-t border-line py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-site px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="Journeys beyond the ordinary" lines={["Discover Nepal.", <Accent key="way">Your way.</Accent>]} />
          <div className="inline-flex self-start rounded-full border border-line bg-card p-1 lg:self-auto" role="tablist" aria-label="Journey collections">
            {[{ id: "tours", name: "Nepal Tours" }, { id: "luxury", name: "Luxury Treks & Tours" }].map((tab, index, tabs) => (
              <button key={tab.id} id={`collection-tab-${tab.id}`} type="button" role="tab" aria-selected={active === tab.id} aria-controls="journey-collection-panel" tabIndex={active === tab.id ? 0 : -1} onClick={() => setActive(tab.id)} onKeyDown={(event) => {
                const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
                if (next >= 0) { event.preventDefault(); setActive(tabs[next].id); document.getElementById(`collection-tab-${tabs[next].id}`)?.focus(); }
              }} className={cn("rounded-full px-3 py-3 text-xs font-semibold transition-colors sm:px-5 sm:text-sm", active === tab.id ? "bg-pine text-white" : "text-muted hover:text-pine")}>{tab.name}</button>
            ))}
          </div>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-soft">From cultural discoveries and scenic flights to mountain journeys with extra comfort. Choose the way you want to experience Nepal.</p>
        <div id="journey-collection-panel" role="tabpanel" aria-labelledby={`collection-tab-${active}`} tabIndex={0} className="mt-8">
          <div className="journey-collage package-grid-gap grid sm:grid-cols-2">
            {items.slice(0, 4).map((trip, index) => <TripCard key={trip.slug} trip={trip} className={index === 0 ? "journey-feature" : undefined} regionName={active === "tours" ? "Nepal Tour" : regionNames[trip.destinations[0]]} label={active === "luxury" ? "Luxury" : undefined} imageSizes={index === 1 ? "(max-width: 640px) 92vw, 60vw" : "(max-width: 640px) 92vw, 33vw"} imageQuality={active === "tours" ? 95 : 80} />)}
            {active === "luxury" && items.length < 4 ? (
              <Link href="/customize-trip/" className="group flex min-h-64 flex-col justify-between rounded-[1.1rem] bg-pine p-6 text-white">
                <p className="text-xs font-semibold tracking-wider text-white/75 uppercase">Made around you</p>
                <div><h3 className="font-display text-3xl leading-tight">Your own kind<br />of adventure.</h3><p className="mt-4 text-sm leading-relaxed text-white/85">A private journey shaped around your time, interests, and preferred comforts.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Customize your trip <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span></div>
              </Link>
            ) : null}
          </div>
          <div className="mt-8 flex justify-end"><Link href={moreHref} className="inline-flex items-center gap-2 rounded-full border border-pine/30 px-5 py-3 text-sm font-bold text-pine transition-colors hover:bg-pine hover:text-white">View more <ArrowRight className="size-4" aria-hidden /></Link></div>
        </div>
      </div>
    </section>
  );
}
