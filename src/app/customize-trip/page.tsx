import { BadgeCheck, MessageCircle, Route } from "lucide-react";
import { CustomTripForm } from "@/components/enquiry-forms";
import { Reveal } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { meta } from "@/lib/seo";

export const metadata = meta({
  path: "/customize-trip/",
  title: "Customize Your Trip",
  description: "Tell us your dates, interests and fitness and a local guide will design a private Nepal, Bhutan or Tibet itinerary around you. Free, with no obligation.",
});

export default function CustomizeTripPage() {
  return (
    <>
      <PageHero
        title="Your time. Your interests."
        accent="Your trip."
        eyebrow="Tailor-made"
        intro="Three quick steps. A local guide reads every request and drafts a route, prices and dates around you. Free, and no obligation."
        photo="/photos/langtang-night.webp"
        crumbs={[{ name: "Customize your trip", path: "/customize-trip/" }]}
      />
      <section className="mx-auto grid max-w-[90rem] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Reveal>
          <div className="rounded-[2rem] border border-line bg-white p-6 sm:p-10">
            <CustomTripForm />
          </div>
        </Reveal>
        <div className="space-y-4">
          {[
            { Icon: MessageCircle, t: "1. Tell us the idea", d: "Where, when, who and how hard. Rough is fine." },
            { Icon: Route, t: "2. We draft the route", d: "Day-by-day plan with altitude, lodges and a clear price." },
            { Icon: BadgeCheck, t: "3. Adjust, then go", d: "Change anything until it fits. Book only when it does." },
          ].map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="flex gap-4 rounded-[1.4rem] border border-line bg-white p-5">
                <span className="bg-marigold-soft text-pine grid size-12 shrink-0 place-items-center rounded-2xl"><Icon className="size-5" aria-hidden /></span>
                <span>
                  <span className="block font-bold">{t}</span>
                  <span className="mt-1 block text-sm text-muted">{d}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
