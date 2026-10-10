"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, ChevronDown, Menu as MenuIcon, Phone, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { WhatsappIcon } from "@/components/icons";
import { Portal } from "@/components/portal";
import { ThemeToggle } from "@/components/theme-toggle";
import { site, whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export type HeaderRegion = { slug: string; name: string; count: number; photo: string };

/** The prototype's navigation, word for word. */
const LINKS = [
  { href: "/trip/", label: "Our trips" },
  { href: "/destination/", label: "Destinations", menu: true },
  { href: "/blogs/", label: "Journal" },
  { href: "/about-us/#affiliations", label: "Our Affiliation" },
  { href: "/about-us/", label: "About us" },
];

export function HeaderClient({ regions }: { regions: HeaderRegion[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [dest, setDest] = useState(false);
  const [mobile, setMobile] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setDest(false);
      setMobile(false);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDest(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile]);

  const open = () => {
    if (timer.current) clearTimeout(timer.current);
    setDest(true);
  };
  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDest(false), 150);
  };

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    if (base === "/destination/") return pathname.startsWith("/destination");
    if (base === "/trip/") return pathname.startsWith("/trip") || pathname.startsWith("/activities");
    if (base === "/blogs/") return pathname.startsWith("/blogs") || pathname.startsWith("/category");
    return pathname === base && !href.includes("#");
  };

  return (
    <>
      <header data-site-header className="fixed inset-x-0 top-0 z-50">
        <div
          data-header-bar
          className={cn(
            "relative border-b bg-snow/95 backdrop-blur-xl transition-[box-shadow,border-color] duration-500",
            scrolled ? "border-line shadow-[0_8px_30px_-22px_oklch(0.25_0.05_210/0.5)]" : "border-line/70",
          )}
        >
          <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-4 px-4 sm:px-6 lg:h-[4.75rem] lg:px-8">
            <Link href="/" aria-label="Base Camp Adventure home" className="shrink-0">
              <Logo priority className="w-[92px] sm:w-[104px] lg:w-[112px]" />
            </Link>

            <nav aria-label="Main" className="mx-auto hidden items-center gap-1 lg:flex">
              {LINKS.map((l) =>
                l.menu ? (
                  <div key={l.href} className="relative" onMouseEnter={open} onMouseLeave={close}>
                    <Link
                      href={l.href}
                      onFocus={open}
                      aria-expanded={dest}
                      className={cn("relative inline-flex items-center gap-1 rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors", isActive(l.href) || dest ? "text-pine" : "text-ink hover:text-pine")}
                    >
                      {l.label}
                      <ChevronDown className={cn("size-4 transition-transform", dest && "rotate-180")} aria-hidden />
                    </Link>
                    <AnimatePresence>
                      {dest ? (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute top-full left-1/2 w-[30rem] -translate-x-1/2 pt-3"
                        >
                          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_24px_60px_-28px_oklch(0.25_0.05_210/0.45)]">
                            <ul className="grid grid-cols-2 gap-1 p-2.5">
                              {regions.map((r) => (
                                <li key={r.slug}>
                                  <Link href={`/destinations/${r.slug}/`} className="group flex items-center gap-3 rounded-xl p-2 hover:bg-snow-2">
                                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                                      <Image src={r.photo} alt="" fill sizes="40px" className="object-cover" />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block truncate text-sm font-semibold group-hover:text-pine">{r.name}</span>
                                      <span className="block text-xs text-muted">{r.count} trips</span>
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link href="/destination/" className="flex items-center justify-between border-t border-line px-4 py-3 text-sm font-bold text-pine hover:bg-snow-2">
                              All destinations <ArrowRight className="size-4" aria-hidden />
                            </Link>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn("rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors", isActive(l.href) ? "text-pine" : "text-ink hover:text-pine")}
                  >
                    {l.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
              <ThemeToggle />
              <Link href="/contact-us/" className="bg-pine hover:bg-pine-deep hidden rounded-lg px-5 py-3 text-sm font-bold text-white transition-colors sm:inline-flex">
                Plan your trip
              </Link>
              <button type="button" onClick={() => setMobile(true)} aria-label="Open menu" aria-expanded={mobile} className="grid size-10 place-items-center rounded-lg border border-line text-ink lg:hidden">
                <MenuIcon className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </header>

      <Portal>
        <AnimatePresence>
          {mobile ? (
            <motion.div
              data-lenis-prevent
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[150] flex flex-col bg-snow lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4 pt-[env(safe-area-inset-top)] sm:px-6">
                <Logo className="w-[92px]" />
                <div className="flex items-center gap-1.5">
                  <ThemeToggle />
                  <button type="button" onClick={() => setMobile(false)} aria-label="Close menu" className="grid size-10 place-items-center rounded-lg border border-line">
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
              </div>
              <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-6 sm:px-6">
                {LINKS.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.3 }}>
                    <Link href={l.href} className="flex items-center justify-between border-b border-line py-4 text-[1.35rem] font-bold tracking-tight">
                      {l.label} <ArrowRight className="size-5 text-muted" aria-hidden />
                    </Link>
                    {l.menu ? (
                      <div className="grid grid-cols-2 gap-2 py-3">
                        {regions.map((r) => (
                          <Link key={r.slug} href={`/destinations/${r.slug}/`} className="rounded-xl border border-line bg-card px-3 py-2.5 text-sm font-semibold">
                            {r.name.replace(" Region", "")} <span className="text-xs font-normal text-muted">{r.count}</span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </motion.div>
                ))}
                <Link href="/contact-us/" className="flex items-center justify-between border-b border-line py-4 text-[1.35rem] font-bold tracking-tight">
                  Contact <ArrowRight className="size-5 text-muted" aria-hidden />
                </Link>
              </nav>
              <div className="grid shrink-0 gap-2 border-t border-line bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
                <Link href="/contact-us/" className="bg-pine rounded-lg py-3.5 text-center font-bold text-white">Plan your trip</Link>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`tel:${site.mobileHref}`} className="flex items-center justify-center gap-2 rounded-lg border border-line py-3 text-sm font-bold">
                    <Phone className="size-4" aria-hidden /> Call 24/7
                  </a>
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 text-sm font-bold text-white">
                    <WhatsappIcon className="size-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  );
}
