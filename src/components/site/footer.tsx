import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { FacebookIcon, InstagramIcon, PaymentMarks, WhatsappIcon, XIcon } from "@/components/icons";
import { getLiveTerms } from "@/lib/content";
import { site, whatsappHref } from "@/lib/site";

export function SiteFooter() {
  const { destinations, activities } = getLiveTerms();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-pine-night relative overflow-hidden text-white">
      <div className="contours pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="prayer-flags h-1.5 w-full opacity-90" aria-hidden />

      {/* The last ask on every page. */}
      <div className="relative mx-auto max-w-[90rem] px-4 pt-20 pb-14 sm:px-6 lg:pt-28">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow text-marigold">Your time · your interests · your trip</p>
            <h2 className="font-display mt-4 text-[clamp(3.2rem,9vw,8.5rem)] font-black uppercase leading-[0.85]">
              Let&apos;s make <br />
              <span className="accent-word text-marigold">a plan.</span>
            </h2>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <p className="max-w-md text-lg text-white/75 lg:text-right">
              Choose an itinerary or talk to our local team about a journey built around you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/customize-trip/" className="bg-marigold text-pine-night inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold transition-transform hover:-translate-y-0.5">
                Plan your trip <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-4 font-semibold hover:bg-white/10">
                <WhatsappIcon className="size-4 text-[#25D366]" /> WhatsApp Shree
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[90rem] border-t border-white/10 px-4 py-14 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo tone="light" className="w-36" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">
              Founded in {site.founded} by a local guide. Trekking, tours and climbs across Nepal, Bhutan and Tibet.
            </p>
            <address className="mt-6 space-y-3 text-sm not-italic text-white/80">
              <p className="flex gap-3">
                <MapPin className="text-marigold mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{site.address.street}, {site.address.city}, Nepal<br />{site.address.poBox}</span>
              </p>
              <p className="flex gap-3">
                <Phone className="text-marigold mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <a className="link-draw" href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>{site.phone}</a> (office)<br />
                  <a className="link-draw" href={`tel:${site.mobileHref}`}>{site.mobile}</a> (24/7)
                </span>
              </p>
              <p className="flex gap-3">
                <Mail className="text-marigold mt-0.5 size-4 shrink-0" aria-hidden />
                <a className="link-draw" href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            </address>
            <div className="mt-6 flex gap-2">
              {[
                { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
                { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
                { href: site.social.x, label: "X", Icon: XIcon },
              ].map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:bg-marigold hover:text-pine-night grid size-10 place-items-center rounded-full bg-white/10 transition-colors">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Destinations" links={destinations.map((d) => ({ href: `/destinations/${d.slug}/`, label: d.name }))} />
          <FooterCol title="Activities" links={activities.map((a) => ({ href: `/activities/${a.slug}/`, label: a.name }))} />
          <FooterCol
            title="Company"
            links={[
              { href: "/about-us/", label: "Our story" },
              { href: "/our-team/", label: "Our team" },
              { href: "/why-book-with-us/", label: "Why travel with us" },
              { href: "/testimonials/", label: "Reviews" },
              { href: "/blogs/", label: "Travel journal" },
              { href: "/nepal-travel-information/", label: "Nepal travel info" },
              { href: "/nepal-visa-information/", label: "Visa information" },
              { href: "/contact-us/", label: "Contact us" },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap items-center gap-3" aria-label="Memberships and partners">
            {site.affiliations.map((a) => (
              <li key={a.name}>
                <a href={a.href} target="_blank" rel="noopener noreferrer" title={a.name} className="grid h-14 place-items-center rounded-xl bg-white px-3 transition-transform hover:-translate-y-0.5">
                  <Image src={a.logo} alt={a.name} width={a.logo.includes("bookmundi") ? 120 : 46} height={46} className="h-10 w-auto object-contain" />
                </a>
              </li>
            ))}
          </ul>
          <PaymentMarks className="flex flex-wrap gap-2" />
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.7rem] tracking-wider text-white/50 uppercase">
          <span>Registered in Nepal</span>
          {site.registration.map((r) => (
            <span key={r.label}>
              {r.label} {r.value}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.legalName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link className="link-draw hover:text-white" href="/privacy-policy/">Privacy</Link>
            <Link className="link-draw hover:text-white" href="/terms-and-conditions/">Booking terms</Link>
            <Link className="link-draw hover:text-white" href="/legal-documents/">Legal documents</Link>
            <Link className="link-draw hover:text-white" href="/photo-credits/">Photo credits</Link>
            <a href="#top" className="inline-flex items-center gap-1.5 hover:text-white">
              Back to top <ArrowUp className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow text-marigold">{title}</p>
      <ul className="mt-5 space-y-2.5 text-sm text-white/75">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="link-draw hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
