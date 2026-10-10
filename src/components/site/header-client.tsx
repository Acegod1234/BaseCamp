"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, ChevronDown, Menu as MenuIcon, Phone, Search, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { activityIcons, WhatsappIcon } from "@/components/icons";
import { Portal } from "@/components/portal";
import { site, whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export type Menu = {
  total: number;
  regions: { slug: string; name: string; count: number; photo: string; line: string }[];
  activities: { slug: string; name: string; count: number; icon: string }[];
};

type Panel = "trips" | "destinations" | "about" | null;

const ABOUT = [
  { href: "/about-us/", label: "Our story", line: "Founded in 2009 by a local guide" },
  { href: "/our-team/", label: "Our team", line: "Guides, climbers and the Thamel office" },
  { href: "/why-book-with-us/", label: "Why travel with us", line: "Small groups, no hidden fees" },
  { href: "/testimonials/", label: "Traveller reviews", line: "In their own words" },
  { href: "/nepal-travel-information/", label: "Nepal travel info", line: "Visas, seasons, culture" },
  { href: "/legal-documents/", label: "Legal documents", line: "Licences and registrations" },
];

export function HeaderClient({ menu }: { menu: Menu }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [mobile, setMobile] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  // Close menus on navigation.
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
    if (timer.current) clearTimeout(timer.current);
    setPanel(p);
  };
  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPanel(null), 140);
  };

  const is = (prefix: string) => pathname === prefix || pathname.startsWith(prefix);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-2.5 pt-2.5 sm:px-4 sm:pt-3" onMouseLeave={close}>
        <div
          data-site-header
          className={cn(
            "relative mx-auto flex h-14 max-w-[86rem] items-center gap-2 rounded-[1.25rem] border pr-2 pl-3 transition-[background-color,box-shadow,border-color] duration-500 lg:h-16 lg:pl-4",
            scrolled || panel
              ? "border-line bg-white/95 shadow-[0_12px_40px_-18px_oklch(0.2_0.04_170/0.35)] backdrop-blur-xl"
              : "border-white/60 bg-white/85 shadow-[0_8px_30px_-20px_oklch(0.2_0.04_170/0.5)] backdrop-blur-xl",
          )}
        >
          <Link href="/" aria-label="Base Camp Adventure home" className="shrink-0">
            <Logo priority className="w-[92px] sm:w-[104px] lg:w-[112px]" />
          </Link>

          <nav aria-label="Main" className="ml-4 hidden items-center lg:flex xl:ml-8">
            <NavItem label="Trips" active={panel === "trips" || is("/trip/") || is("/activities/")} open={panel === "trips"} onOpen={() => open("trips")} width="w-[38rem]" align="start">
                  <div className="grid grid-cols-2">
                    <div className="p-5">
                      <p className="eyebrow mb-3 text-muted">By region</p>
                      <ul className="space-y-0.5">
                        {menu.regions.map((r) => (
                          <li key={r.slug}>
                            <Link href={`/destinations/${r.slug}/`} className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[0.92rem] font-medium hover:bg-snow-2 hover:text-pine">
                              {r.name}
                              <span className="font-mono text-xs text-muted">{r.count}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-l border-line bg-snow p-5">
                      <p className="eyebrow mb-3 text-muted">By activity</p>
                      <ul className="space-y-0.5">
                        {menu.activities.map((a) => {
                          const Icon = activityIcons[a.icon] ?? activityIcons.compass;
                          return (
                            <li key={a.slug}>
                              <Link href={`/activities/${a.slug}/`} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.92rem] font-medium hover:bg-white hover:text-pine">
                                <Icon className="text-pine size-4 shrink-0" aria-hidden />
                                <span className="flex-1">{a.name}</span>
                                <span className="font-mono text-xs text-muted">{a.count}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <Link href="/trip/" className="bg-pine col-span-2 flex items-center justify-between px-5 py-3.5 text-sm font-bold text-white hover:bg-pine-deep">
                      Browse all {menu.total} trips <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
            </NavItem>
            <NavItem label="Destinations" active={panel === "destinations" || is("/destination")} open={panel === "destinations"} onOpen={() => open("destinations")} width="w-[26rem]">
                  <div>
                    <ul className="p-3">
                      {menu.regions.map((r) => (
                        <li key={r.slug}>
                          <Link href={`/destinations/${r.slug}/`} className="group flex items-center gap-3 rounded-xl p-2 hover:bg-snow-2">
                            <span className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                              <Image src={r.photo} alt="" fill sizes="44px" className="object-cover" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[0.92rem] font-semibold group-hover:text-pine">{r.name}</span>
                              <span className="block truncate text-xs text-muted">{r.line}</span>
                            </span>
                            <span className="font-mono text-xs text-muted">{r.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href="/destination/" className="flex items-center justify-between border-t border-line px-5 py-3.5 text-sm font-bold text-pine hover:bg-snow">
                      All destinations <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
            </NavItem>
            <NavItem label="Journal" href="/blogs/" active={is("/blogs/") || is("/category/")} onOpen={() => setPanel(null)} />
            <NavItem label="About" active={panel === "about" || is("/about-us/") || is("/our-team/")} open={panel === "about"} onOpen={() => open("about")} width="w-[22rem]">
                  <ul className="p-3">
                    {ABOUT.map((a) => (
                      <li key={a.href}>
                        <Link href={a.href} className="group block rounded-xl px-3 py-2.5 hover:bg-snow-2">
                          <span className="block text-[0.92rem] font-semibold group-hover:text-pine">{a.label}</span>
                          <span className="block text-xs text-muted">{a.line}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
            </NavItem>
            <NavItem label="Contact" href="/contact-us/" active={is("/contact-us/")} onOpen={() => setPanel(null)} />
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <a href={`tel:${site.mobileHref}`} className="hidden items-center gap-2.5 rounded-full px-3 py-1.5 transition-colors hover:bg-snow-2 xl:flex">
              <span className="bg-moss/15 text-moss relative grid size-9 place-items-center rounded-full">
                <Phone className="size-4" aria-hidden />
                <span className="bg-moss absolute top-0.5 right-0.5 size-2 rounded-full ring-2 ring-white" aria-hidden />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.68rem] font-semibold tracking-wide text-muted uppercase">Talk to us 24/7</span>
                <span className="block text-sm font-bold text-ink">{site.mobile}</span>
              </span>
            </a>
            <Link href="/trip/" aria-label="Search trips" className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-snow-2">
              <Search className="size-[1.15rem]" aria-hidden />
            </Link>
            <Link
              href="/customize-trip/"
              className="bg-pine hover:bg-pine-deep hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-colors sm:inline-flex"
            >
              Plan your trip <ArrowRight className="size-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setMobile(true)}
              aria-label="Open menu"
              aria-expanded={mobile}
              className="bg-ink grid size-10 place-items-center rounded-full text-white lg:hidden"
            >
              <MenuIcon className="size-5" aria-hidden />
            </button>
          </div>

        </div>
      </header>

      {/* Phone menu */}
      <Portal>
        <AnimatePresence>
          {mobile ? (
            <motion.div
              data-lenis-prevent
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[150] flex flex-col overflow-y-auto bg-snow lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
                <Logo className="w-[92px]" />
                <button type="button" onClick={() => setMobile(false)} aria-label="Close menu" className="bg-ink grid size-11 place-items-center rounded-full text-white">
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <nav aria-label="Mobile" className="flex flex-1 flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                {[
                  { href: "/trip/", label: "All trips", note: `${menu.total}` },
                  { href: "/destination/", label: "Destinations", note: `${menu.regions.length}` },
                  { href: "/activities/", label: "Activities", note: `${menu.activities.length}` },
                  { href: "/blogs/", label: "Journal" },
                  { href: "/about-us/", label: "About us" },
                  { href: "/our-team/", label: "Our team" },
                  { href: "/contact-us/", label: "Contact" },
                ].map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}>
                    <Link href={l.href} className="flex items-center justify-between border-b border-line py-3.5">
                      <span className="font-display text-[2.1rem] font-black uppercase leading-none text-ink">{l.label}</span>
                      <span className="flex items-center gap-2 text-muted">
                        {l.note ? <span className="font-mono text-xs">{l.note}</span> : null}
                        <ArrowRight className="size-5" aria-hidden />
                      </span>
                    </Link>
                  </motion.div>
                ))}

                <p className="eyebrow mt-7 mb-3 text-muted">Popular regions</p>
                <div className="flex flex-wrap gap-2">
                  {menu.regions.slice(0, 6).map((r) => (
                    <Link key={r.slug} href={`/destinations/${r.slug}/`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
                      {r.name.replace(" Region", "")}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto grid gap-3 pt-8">
                  <Link href="/customize-trip/" className="bg-pine flex items-center justify-center gap-2 rounded-full py-4 font-bold text-white">
                    Plan your trip <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <a href={`tel:${site.mobileHref}`} className="flex items-center justify-center gap-2 rounded-full border border-line bg-white py-3.5 text-sm font-semibold">
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
      </Portal>
    </>
  );
}

function NavItem({
  label,
  href,
  active,
  open,
  onOpen,
  width,
  align = "center",
  children,
}: {
  label: string;
  href?: string;
  active: boolean;
  open?: boolean;
  onOpen: () => void;
  width?: string;
  /** "start" for items near the left edge, so a wide dropdown stays on screen. */
  align?: "start" | "center";
  children?: React.ReactNode;
}) {
  const cls = cn(
    "relative inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.93rem] font-semibold transition-colors xl:px-4",
    active ? "text-pine" : "text-ink-soft hover:text-ink",
  );
  const underline = active ? <span className="bg-marigold absolute inset-x-3.5 -bottom-0.5 h-[2.5px] rounded-full xl:inset-x-4" aria-hidden /> : null;

  if (href) {
    return (
      <Link href={href} onMouseEnter={onOpen} className={cls} aria-current={active ? "page" : undefined}>
        {label}
        {underline}
      </Link>
    );
  }
  return (
    <div className="relative" onMouseEnter={onOpen}>
      <button type="button" onFocus={onOpen} onClick={onOpen} aria-expanded={open} className={cls}>
        {label}
        <ChevronDown className={cn("size-4 opacity-60 transition-transform", open && "rotate-180")} aria-hidden />
        {underline}
      </button>
      {/* Invisible bridge so the pointer can travel from label to dropdown. */}
      <div className="absolute inset-x-0 top-full h-5" aria-hidden />
      <div className={cn("absolute top-[calc(100%+1.1rem)]", align === "start" ? "-left-2" : "left-1/2 -translate-x-1/2")}>
        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn("origin-top overflow-hidden rounded-[1.4rem] border border-line bg-white text-ink shadow-[0_30px_70px_-30px_oklch(0.2_0.04_170/0.45)]", width)}
            >
              {children}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
