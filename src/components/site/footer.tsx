import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { Accreditations } from "@/components/accreditations";
import { Logo } from "@/components/brand/logo";
import { FacebookIcon, InstagramIcon, WhatsappIcon, XIcon } from "@/components/icons";
import { Newsletter } from "@/components/newsletter";
import { FooterRidge } from "@/components/site/footer-ridge";
import { getTrip } from "@/lib/content";
import { site, whatsappHref } from "@/lib/site";

const PAYMENTS = [
  { src: "/brand/payments/mastercard.png", w: 53, alt: "Mastercard" },
  { src: "/brand/payments/visa.png", w: 64, alt: "Visa" },
  { src: "/brand/payments/american-express.png", w: 42, alt: "American Express" },
  { src: "/brand/payments/union-pay.png", w: 67, alt: "UnionPay" },
  { src: "/brand/payments/jcb.png", w: 54, alt: "JCB" },
];

const POPULAR = ["everest-base-camp-trek", "annapurna-base-camp-trek", "annapurna-circuit-trek", "langtang-valley-trek", "manaslu-circuit-trek", "ghorepani-poon-hill-trek"];

const COMPANY = [
  { href: "/about-us/", label: "Our story" },
  { href: "/our-team/", label: "Our Team" },
  { href: "/why-book-with-us/", label: "Why Travel With Us?" },
  { href: "/community/", label: "Community & social work" },
  { href: "/gallery/", label: "Photo Gallery" },
  { href: "/legal-documents/", label: "Legal Documents" },
  { href: "/terms-and-conditions/", label: "Terms and Conditions" },
  { href: "/online-payment/", label: "Online Payment" },
];

/** The closing call, a range of mountains, and the footer. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const popular = POPULAR.map((slug) => getTrip(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => ({ href: `/trip/${t.slug}/`, label: t.title }));

  const socials = [
    { href: site.social.facebook, label: "Facebook", icon: <FacebookIcon className="size-4" /> },
    { href: site.social.instagram, label: "Instagram", icon: <InstagramIcon className="size-4" /> },
    { href: site.social.x, label: "X", icon: <XIcon className="size-3.5" /> },
  ];

  return (
    <footer>
      {/* Let's make a plan. */}
      <section className="relative border-t border-line bg-snow">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-4 pt-16 pb-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:pt-20">
          <div>
            <p className="eyebrow text-pine">Your time. Your interests. Your trip.</p>
            <h2 className="font-display mt-3 text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] text-ink">
              Let&apos;s make
              <br />
              <span className="accent-word">a plan.</span>
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-ink-soft">Choose an itinerary or talk to our local team about a journey built around you.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/customize-trip/#request" className="bg-pine hover:bg-pine-deep inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold text-white transition-colors">
                Plan your trip <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-5 py-3.5 text-sm font-semibold">
                <WhatsappIcon className="size-4 text-[#25D366]" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
        <FooterRidge />
      </section>

      <div className="relative overflow-hidden bg-[#1c2224] text-white/75">
        <div aria-hidden className="blueprint absolute inset-0 text-white opacity-[0.04]" />
        <div aria-hidden className="absolute -top-40 right-[-10%] size-[36rem] rounded-full bg-[#00afc4]/12 blur-[120px]" />
        <div className="relative mx-auto max-w-[90rem] px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pt-8">
          {/* Newsletter: email only */}
          <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-[#3ccbdc]">Newsletter</p>
              <p className="font-display mt-1.5 text-xl text-white sm:text-2xl">Trip ideas and festival offers, by email.</p>
            </div>
            <Newsletter source="footer" tone="dark" className="w-full lg:max-w-md" />
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_1fr_1fr_1.25fr] lg:gap-12">
            {/* Brand */}
            <div className="text-center lg:text-left">
              <Logo className="mx-auto hidden w-[132px] dark:block lg:mx-0" />
              <span className="inline-block rounded-md bg-white p-2.5 dark:hidden">
                <Logo tone="light" className="w-[116px]" />
              </span>
              <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed lg:mx-0">{site.description}</p>
              <ul className="mt-6 flex items-center justify-center gap-2 lg:justify-start">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="me noopener noreferrer" aria-label={`Base Camp Adventure on ${s.label}`} className="grid size-10 place-items-center rounded-full border border-white/20 transition-all hover:-translate-y-0.5 hover:border-[#3ccbdc] hover:text-[#3ccbdc]">
                      {s.icon}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={site.social.tripadvisor} target="_blank" rel="me noopener noreferrer" aria-label="Base Camp Adventure on Tripadvisor" className="grid size-10 place-items-center overflow-hidden rounded-full border border-white/20 bg-white transition-all hover:-translate-y-0.5">
                    <Image src="/brand/partners/tripadvisor.png" alt="" width={245} height={220} className="h-6 w-auto" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Phones: big contact buttons, then the link groups folded */}
            <div className="grid grid-cols-3 gap-2 lg:hidden">
              <a href={`tel:${site.mobileHref}`} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-3.5 text-xs font-semibold text-white">
                <Phone className="size-5 text-[#3ccbdc]" aria-hidden /> Call 24/7
              </a>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-3.5 text-xs font-semibold text-white">
                <WhatsappIcon className="size-5 text-[#25D366]" /> WhatsApp
              </a>
              <a href={`mailto:${site.email}`} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-3.5 text-xs font-semibold text-white">
                <Mail className="size-5 text-[#3ccbdc]" aria-hidden /> Email
              </a>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10 lg:hidden">
              <Fold title="Popular treks" links={popular} />
              <Fold title="Company" links={COMPANY} />
            </div>

            {/* Desktop columns */}
            <LinkColumn title="Popular treks" links={popular} />
            <LinkColumn title="Company" links={COMPANY} />

            <div>
              <p className="eyebrow hidden text-[#3ccbdc] lg:block">Get in touch</p>
              <ul className="mt-5 hidden space-y-3 text-sm lg:block">
                <li>
                  <a href={`tel:${site.mobileHref}`} className="flex items-start gap-2.5 hover:text-white">
                    <Phone className="mt-0.5 size-4 shrink-0" aria-hidden /> +977 9851029616 [Available 24/7]
                  </a>
                </li>
                <li>
                  <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="flex items-start gap-2.5 hover:text-white">
                    <Phone className="mt-0.5 size-4 shrink-0 opacity-60" aria-hidden /> {site.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="flex items-start gap-2.5 hover:text-white">
                    <Mail className="mt-0.5 size-4 shrink-0" aria-hidden /> {site.email}
                  </a>
                </li>
              </ul>
              <p className="flex items-start justify-center gap-2.5 text-sm text-white/60 lg:mt-3 lg:justify-start">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {site.address.street}, {site.address.city}, Nepal · {site.address.poBox}
              </p>
              <p className="eyebrow mt-7 text-center text-[#3ccbdc] lg:text-left">We Accept</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
                {PAYMENTS.map((p) => (
                  <span key={p.alt} className="grid h-9 place-items-center rounded-md bg-white px-2">
                    <Image src={p.src} alt={p.alt} width={p.w} height={42} className="h-6 w-auto" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6 border-t border-white/10 pt-8 lg:flex-row lg:justify-between">
            <Accreditations variant="compact" />
            <p className="text-center text-xs leading-relaxed text-white/50 lg:text-right">
              Government Reg. No: 68517/066/067 · VAT No: 303970392
              <br />
              NMA Membership No: 776 · TAAN Member: 2010-868
            </p>
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-[90rem] flex-col items-center gap-3 px-4 py-6 text-xs text-white/50 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
            <p>© {year} {site.legalName}. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link href="/privacy-policy/" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms-and-conditions/" className="hover:text-white">Terms</Link>
              <Link href="/contact-us/" className="hover:text-white">Contact Us</Link>
              <a href="#top" className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 hover:border-white/40 hover:text-white">
                Back to top <ArrowUp className="size-3" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LinkColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="hidden lg:block">
      <p className="eyebrow text-[#3ccbdc]">{title}</p>
      <ul className="mt-5 space-y-2.5 text-sm">
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

/** A link group that folds away on phones. */
function Fold({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-bold text-white [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 text-white/60 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ul className="grid grid-cols-1 gap-1 pb-4 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block py-1.5 hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
