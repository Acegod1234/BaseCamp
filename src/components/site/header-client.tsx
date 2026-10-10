"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, ChevronDown, Mail, Menu as MenuIcon, Phone, Search, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { activityIcons, FacebookIcon, InstagramIcon, WhatsappIcon, XIcon } from "@/components/icons";
import { site, whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export type Menu = {
  regions: { slug: string; name: string; count: number; photo: string; line: string; trips: { slug: string; title: string; days: number }[] }[];
  activities: { slug: string; name: string; count: number; icon: string; line: string }[];
};

type Panel = "trips" | "destinations" | "activities" | "about" | null;

const ABOUT = [
  { href: "/about-us/", label: "Our story", line: "Founded in 2009 by a local guide" },
  { href: "/our-team/", label: "Our team", line: "Guides, climbers & the Kathmandu office" },
  { href: "/why-book-with-us/", label: "Why travel with us", line: "Small groups, local guides, no hidden fees" },
  { href: "/testimonials/", label: "Traveller reviews", line: "In their own words" },
  { href: "/legal-documents/", label: "Legal documents", line: "Licences & registrations" },
  { href: "/nepal-travel-information/", label: "Nepal travel info", line: "Visas, seasons, culture & more" },
];

/** Pages without a dark photo hero get a solid header from the first frame. */
const SOLID = /^\/(booking|thank-you|enquiry-received|checkout|photo-credits)\//;

export function HeaderClient({ menu }: { menu: Menu }) {
  const pathname = usePathname();
  const overlayRoute = !SOLID.test(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [mobile, setMobile] = useState(false);
  const [region, setRegion] = useState(menu.regions[0]?.slug);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 480 && y > prev && !panel && !mobile);
  });

  // Close everything on navigation.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setPanel(null);
      setMobile(false);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(null);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile]);

  const open = (p: Panel) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPanel(p);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPanel(null), 160);
  };

  const solid = !overlayRoute || scrolled || panel !== null;
  const light = !solid; // white text over a photograph

  const activeRegion = menu.regions.find((r) => r.slug === region) ?? menu.regions[0];

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
        onMouseLeave={scheduleClose}
      >
        {/* Utility bar: the 24/7 promise, where a nervous first-timer looks for it. */}
        <div
          className={cn(
            "hidden overflow-hidden text-[0.78rem] transition-all duration-500 lg:block",
            scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
            light ? "text-white/80" : "bg-pine-night text-white/80",
          )}
        >
          <div className="mx-auto flex h-9 max-w-[90rem] items-center justify-between gap-6 px-6">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="bg-moss absolute inline-flex size-full animate-ping rounded-full opacity-70" />
                  <span className="bg-moss relative inline-flex size-2 rounded-full" />
                </span>
                Talk to Shree, 24/7
              </span>
              <a href={`tel:${site.mobileHref}`} className="link-draw inline-flex items-center gap-1.5 hover:text-white">
                <Phone className="size-3.5" aria-hidden /> {site.mobile}
              </a>
              <a href={`mailto:${site.email}`} className="link-draw inline-flex items-center gap-1.5 hover:text-white">
                <Mail className="size-3.5" aria-hidden /> {site.email}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[0.7rem] tracking-wider text-white/60">GOVT. LICENSED · TAAN 2010-868 · NMA 776</span>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white"><FacebookIcon className="size-4" /></a>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white"><InstagramIcon className="size-4" /></a>
              <a href={site.social.x} target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-white"><XIcon className="size-3.5" /></a>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "transition-[background-color,box-shadow,color] duration-500",
            solid ? "glass text-ink shadow-[0_1px_0_oklch(0.2_0.03_170/0.08),0_12px_30px_-22px_oklch(0.2_0.03_170/0.35)]" : "text-white",
          )}
        >
          <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center gap-4 px-4 sm:px-6 lg:h-20">
            <Link href="/" aria-label="Base Camp Adventure, home" className="shrink-0">
              <Logo tone={light ? "light" : "color"} className="w-[6.4rem] lg:w-[7.4rem]" />
            </Link>

            <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
              <NavButton label="Trips" active={panel === "trips"} onOpen={() => open("trips")} />
              <NavButton label="Destinations" active={panel === "destinations"} onOpen={() => open("destinations")} />
              <NavButton label="Activities" active={panel === "activities"} onOpen={() => open("activities")} />
              <NavLink href="/blogs/" label="Journal" onEnter={() => setPanel(null)} current={pathname.startsWith("/blogs")} />
              <NavButton label="About" active={panel === "about"} onOpen={() => open("about")} />
              <NavLink href="/contact-us/" label="Contact" onEnter={() => setPanel(null)} current={pathname === "/contact-us/"} />
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/trip/"
                aria-label="Search trips"
                className={cn("grid size-11 place-items-center rounded-full transition-colors", light ? "hover:bg-white/15" : "hover:bg-pine/10")}
              >
                <Search className="size-5" aria-hidden />
              </Link>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp us"
                className={cn("hidden size-11 place-items-center rounded-full transition-colors sm:grid", light ? "hover:bg-white/15" : "hover:bg-pine/10")}
              >
                <WhatsappIcon className="size-5" />
              </a>
              <Link
                href="/customize-trip/"
                className="bg-marigold text-pine-night hover:bg-white hidden items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-[0_8px_24px_-12px_oklch(0.79_0.155_72/0.9)] transition-all duration-300 hover:-translate-y-0.5 sm:inline-flex"
              >
                Plan your trip <ArrowRight className="size-4" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => setMobile(true)}
                aria-label="Open menu"
                aria-expanded={mobile}
                className={cn("grid size-11 place-items-center rounded-full lg:hidden", light ? "bg-white/15" : "bg-pine/10")}
              >
                <MenuIcon className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* Mega panels */}
        <AnimatePresence>
          {panel ? (
            <motion.div
              key={panel}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => open(panel)}
              className="bg-snow text-ink absolute inset-x-0 top-full hidden border-t border-line shadow-[0_40px_80px_-40px_oklch(0.2_0.03_170/0.45)] lg:block"
            >
              <div className="mx-auto max-w-[90rem] px-6 py-8">
                {panel === "trips" && activeRegion ? (
                  <div className="grid grid-cols-[15rem_1fr_19rem] gap-8">
                    <ul className="flex flex-col gap-0.5 border-r border-line pr-6">
                      {menu.regions.map((r) => (
                        <li key={r.slug}>
                          <button
                            type="button"
                            onMouseEnter={() => setRegion(r.slug)}
                            onFocus={() => setRegion(r.slug)}
                            onClick={() => setRegion(r.slug)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[0.95rem] font-semibold transition-colors",
                              r.slug === activeRegion.slug ? "bg-pine text-white" : "hover:bg-snow-2",
                            )}
                          >
                            {r.name}
                            <span className={cn("font-mono text-xs", r.slug === activeRegion.slug ? "text-white/70" : "text-muted")}>{r.count}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div>
                      <p className="eyebrow text-pine mb-4">{activeRegion.name} · {activeRegion.line}</p>
                      <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {activeRegion.trips.map((t) => (
                          <li key={t.slug}>
                            <Link href={`/trip/${t.slug}/`} className="group flex items-baseline justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-snow-2">
                              <span className="font-medium group-hover:text-pine">{t.title}</span>
                              <span className="shrink-0 font-mono text-xs text-muted">{t.days}d</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link href={`/destinations/${activeRegion.slug}/`} className="text-pine mt-5 inline-flex items-center gap-2 px-3 text-sm font-bold">
                        All {activeRegion.count} {activeRegion.name} trips <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </div>
                    <Link href={`/destinations/${activeRegion.slug}/`} className="group relative overflow-hidden rounded-2xl">
                      <Image src={activeRegion.photo} alt="" fill sizes="304px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="scrim-b absolute inset-0" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <p className="font-display text-3xl font-extrabold uppercase">{activeRegion.name}</p>
                        <p className="mt-1 text-sm text-white/80">{activeRegion.line}</p>
                      </div>
                    </Link>
                  </div>
                ) : null}

                {panel === "destinations" ? (
                  <div className="grid grid-cols-4 gap-4">
                    {menu.regions.map((r) => (
                      <Link key={r.slug} href={`/destinations/${r.slug}/`} className="group relative h-40 overflow-hidden rounded-2xl">
                        <Image src={r.photo} alt="" fill sizes="22vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="scrim-b absolute inset-0" />
                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
                          <div>
                            <p className="font-display text-2xl font-extrabold uppercase leading-none">{r.name}</p>
                            <p className="mt-1 line-clamp-1 text-xs text-white/75">{r.line}</p>
                          </div>
                          <span className="glass-dark rounded-full px-2.5 py-1 font-mono text-xs">{r.count}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}

                {panel === "activities" ? (
                  <div className="grid grid-cols-4 gap-3">
                    {menu.activities.map((a) => {
                      const Icon = activityIcons[a.icon] ?? activityIcons.compass;
                      return (
                        <Link key={a.slug} href={`/activities/${a.slug}/`} className="group flex items-start gap-4 rounded-2xl border border-line p-4 transition-colors hover:border-pine hover:bg-white">
                          <span className="bg-pine/10 text-pine group-hover:bg-pine grid size-11 shrink-0 place-items-center rounded-xl transition-colors group-hover:text-white">
                            <Icon className="size-5" aria-hidden />
                          </span>
                          <span>
                            <span className="block font-semibold">{a.name}</span>
                            <span className="mt-0.5 block text-sm text-muted">{a.line}</span>
                            <span className="text-pine mt-1 block font-mono text-xs">{a.count} trips</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}

                {panel === "about" ? (
                  <div className="grid grid-cols-[1fr_22rem] gap-8">
                    <ul className="grid grid-cols-3 gap-3">
                      {ABOUT.map((a) => (
                        <li key={a.href}>
                          <Link href={a.href} className="block rounded-2xl border border-line p-4 transition-colors hover:border-pine hover:bg-white">
                            <span className="block font-semibold">{a.label}</span>
                            <span className="mt-1 block text-sm text-muted">{a.line}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-pine-deep contours flex flex-col justify-between rounded-2xl p-6 text-white">
                      <p className="font-display text-3xl font-extrabold uppercase leading-none">
                        On the trail <span className="accent-word text-marigold">since 2009.</span>
                      </p>
                      <p className="mt-3 text-sm text-white/75">Licensed by the Government of Nepal, members of TAAN and NMA, partners of KEEP and HRA.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobile ? (
          <motion.div
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-pine-night contours fixed inset-0 z-[70] flex flex-col overflow-y-auto text-white lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex h-[4.5rem] items-center justify-between px-4">
              <Logo tone="light" className="w-[6.4rem]" />
              <button type="button" onClick={() => setMobile(false)} aria-label="Close menu" className="grid size-11 place-items-center rounded-full bg-white/10">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-1 flex-col px-4 pb-8">
              {[
                { href: "/trip/", label: "All trips" },
                { href: "/destination/", label: "Destinations" },
                { href: "/activities/", label: "Activities" },
                { href: "/blogs/", label: "Journal" },
                { href: "/about-us/", label: "About us" },
                { href: "/our-team/", label: "Our team" },
                { href: "/contact-us/", label: "Contact" },
              ].map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}>
                  <Link href={l.href} className="font-display flex items-center justify-between border-b border-white/10 py-3.5 text-[2.4rem] font-extrabold uppercase leading-none">
                    {l.label}
                    <ArrowRight className="text-marigold size-6" aria-hidden />
                  </Link>
                </motion.div>
              ))}

              <details className="group mt-6 rounded-2xl bg-white/5 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  Trips by region <ChevronDown className="size-5 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <ul className="mt-3 grid grid-cols-2 gap-2">
                  {menu.regions.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/destinations/${r.slug}/`} className="block rounded-xl bg-white/5 px-3 py-2.5 text-sm">
                        {r.name} <span className="font-mono text-xs text-white/50">{r.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>

              <div className="mt-auto grid gap-3 pt-8">
                <Link href="/customize-trip/" className="bg-marigold text-pine-night flex items-center justify-center gap-2 rounded-full py-4 font-bold">
                  Plan your trip <ArrowRight className="size-4" aria-hidden />
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${site.mobileHref}`} className="flex items-center justify-center gap-2 rounded-full bg-white/10 py-3.5 text-sm font-semibold">
                    <Phone className="size-4" aria-hidden /> Call 24/7
                  </a>
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white">
                    <WhatsappIcon className="size-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function NavButton({ label, active, onOpen }: { label: string; active: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
      aria-expanded={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-[0.95rem] font-semibold transition-colors",
        active ? "bg-pine/10" : "hover:bg-current/10",
      )}
    >
      {label}
      <ChevronDown className={cn("size-4 opacity-60 transition-transform", active && "rotate-180")} aria-hidden />
    </button>
  );
}

function NavLink({ href, label, onEnter, current }: { href: string; label: string; onEnter: () => void; current: boolean }) {
  return (
    <Link
      href={href}
      onMouseEnter={onEnter}
      aria-current={current ? "page" : undefined}
      className={cn("rounded-full px-4 py-2.5 text-[0.95rem] font-semibold transition-colors hover:bg-current/10", current && "underline decoration-marigold decoration-2 underline-offset-8")}
    >
      {label}
    </Link>
  );
}
