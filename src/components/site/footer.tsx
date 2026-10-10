import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { Accreditations } from "@/components/accreditations";
import { Logo } from "@/components/brand/logo";
import { FacebookIcon, InstagramIcon, WhatsappIcon, XIcon } from "@/components/icons";
import { site, whatsappHref } from "@/lib/site";

const PAYMENTS = [
  { src: "/brand/payments/mastercard.png", w: 53, alt: "Mastercard" },
  { src: "/brand/payments/visa.png", w: 64, alt: "Visa" },
  { src: "/brand/payments/american-express.png", w: 42, alt: "American Express" },
  { src: "/brand/payments/union-pay.png", w: 67, alt: "UnionPay" },
  { src: "/brand/payments/jcb.png", w: 54, alt: "JCB" },
];

/** The prototype's closing call and footer. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer>
      {/* Let's make a plan. */}
      <section className="border-t border-line bg-snow">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-20">
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
              <Link href="/contact-us/" className="rounded-lg bg-[#00afc4] px-6 py-3.5 text-sm font-bold text-[#0f2a30] transition-colors hover:bg-pine hover:text-white">
                Plan your trip
              </Link>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line px-5 py-3.5 text-sm font-semibold">
                <WhatsappIcon className="size-4 text-[#25D366]" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden bg-[#1c2224] text-white/75">
        <div aria-hidden className="blueprint absolute inset-0 text-white opacity-[0.05]" />
        <div aria-hidden className="absolute -top-40 right-[-10%] size-[36rem] rounded-full bg-[#00afc4]/15 blur-[120px]" />
        <div className="relative mx-auto max-w-[90rem] px-4 pt-16 pb-8 sm:px-6 lg:px-8 lg:pt-20">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <Logo className="hidden w-[132px] dark:block" />
              <span className="inline-block rounded-md bg-white p-2.5 dark:hidden">
                <Logo tone="light" className="w-[116px]" />
              </span>
              <p className="mt-5 max-w-xs text-sm leading-relaxed">{site.description}</p>
              <ul className="mt-6 flex items-center gap-2">
                {[
                  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
                  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
                  { href: site.social.x, label: "X", Icon: XIcon },
                ].map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="me noopener noreferrer" aria-label={`Base Camp Adventure on ${label}`} className="grid size-10 place-items-center rounded-full border border-white/20 transition-colors hover:border-[#3ccbdc] hover:text-[#3ccbdc]">
                      <Icon className="size-4" />
                    </a>
                  </li>
                ))}
                <li>
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Base Camp Adventure" className="grid size-10 place-items-center rounded-full border border-white/20 transition-colors hover:border-[#25D366] hover:text-[#25D366]">
                    <WhatsappIcon className="size-4" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow text-[#3ccbdc]">Explore</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  { href: "/trip/", label: "Find a trip" },
                  { href: "/destination/", label: "Destinations" },
                  { href: "/activities/", label: "Activities" },
                  { href: "/gallery/", label: "Gallery" },
                  { href: "/blogs/", label: "Read Our Blogs" },
                  { href: "/customize-trip/", label: "Customize Trip" },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="link-draw hover:text-white">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow text-[#3ccbdc]">About Us</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  { href: "/about-us/", label: "Our story" },
                  { href: "/our-team/", label: "Our Team" },
                  { href: "/why-book-with-us/", label: "Why Travel With Us?" },
                  { href: "/legal-documents/", label: "Legal Documents" },
                  { href: "/terms-and-conditions/", label: "Terms and Conditions" },
                  { href: "/online-payment/", label: "Online Payment" },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="link-draw hover:text-white">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow text-[#3ccbdc]">Get in touch</p>
              <ul className="mt-5 space-y-3 text-sm">
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
                <li className="flex items-start gap-2.5 text-white/60">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {site.address.street}, {site.address.city}, Nepal · {site.address.poBox}
                </li>
              </ul>
              <p className="eyebrow mt-7 text-[#3ccbdc]">We Accept</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PAYMENTS.map((p) => (
                  <span key={p.alt} className="grid h-9 place-items-center rounded-md bg-white px-2">
                    <Image src={p.src} alt={p.alt} width={p.w} height={42} className="h-6 w-auto" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
            <Accreditations variant="compact" />
            <p className="text-xs leading-relaxed text-white/50 lg:text-right">
              Government Reg. No: 68517/066/067 · VAT No: 303970392
              <br />
              NMA Membership No: 776 · TAAN Member: 2010-868
            </p>
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© {year} {site.legalName}. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/privacy-policy/" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms-and-conditions/" className="hover:text-white">Terms</Link>
              <Link href="/contact-us/" className="hover:text-white">Contact Us</Link>
              <a href="#top" className="inline-flex items-center gap-1 hover:text-white">Back to top <ArrowUp className="size-3" aria-hidden /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
