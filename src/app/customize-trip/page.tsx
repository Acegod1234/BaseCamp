import { CustomTripForm } from "@/components/enquiry-forms";
import { Reveal } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { meta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = meta({
  path: "/customize-trip/",
  title: "Customize Your Trip",
  description: "Tell us your dates, interests and fitness and a local guide will design a private Nepal, Bhutan or Tibet itinerary around you. Free, with no obligation.",
});

export default function CustomizeTripPage() {
  return (
    <>
      <PageHero
        title="Customize"
        accent="Your Trip"
        eyebrow="Base Camp Adventure"
        intro={site.customize}
        photo="/photos/page-customize.webp"
        crumbs={[{ name: "Customize your trip", path: "/customize-trip/" }]}
      />
      <section className="mx-auto grid max-w-[90rem] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Reveal>
          <div className="rounded-[2rem] border border-line bg-card p-6 sm:p-10">
            <CustomTripForm />
          </div>
        </Reveal>
        <div className="space-y-4">
          <div className="bg-pine-deep aura relative overflow-hidden rounded-[1.4rem] p-6 text-white">
            <p className="eyebrow text-marigold">Need help?</p>
            <p className="mt-2 text-lg font-bold">Available 24/7 - Call Us Anytime</p>
            <a href={`tel:${site.mobileHref}`} className="mt-1 block font-semibold text-white/85">+977 9851 029616 [Shree]</a>
            <a href={`mailto:${site.email}`} className="mt-1 block text-white/75">{site.email}</a>
          </div>
        </div>
      </section>
    </>
  );
}
